// M8 — Saf TypeScript 2B çokgen Boolean farkı (L.outline − U.outline, OuterFloor/OuterCeiling §5.10, iç kısım K71)
// ve yarı-düzlem kırpma yardımcıları. DOM/Node bağımlılığı yoktur; tamsayı mm ızgarasında deterministik çalışır.
import { normalizeOrientation, pointInPoly, ringAreaM2, signedArea2x } from '../design/geometry2d.ts';
import type { Poly2, Pt2, Ring2 } from '../design/types.ts';

interface Seg2 {
  readonly p: Pt2;
  readonly q: Pt2;
}

const ptKey = (p: Pt2): string => `${p.x},${p.y}`;
const segKey = (p: Pt2, q: Pt2): string => `${ptKey(p)}->${ptKey(q)}`;

function ringToSegs(r: Ring2): Seg2[] {
  const out: Seg2[] = [];
  for (let i = 0; i < r.length; i++) {
    const p = r[i];
    const q = r[(i + 1) % r.length];
    if (p.x !== q.x || p.y !== q.y) out.push({ p, q });
  }
  return out;
}

/** İki doğru parçasının kesişim ve uç noktalarını [0, 1] parametresi olarak bulur. */
function segmentCutParams(s1: Seg2, s2: Seg2): number[] {
  const ts: number[] = [0, 1];
  const dx1 = s1.q.x - s1.p.x;
  const dy1 = s1.q.y - s1.p.y;
  const L1Sq = dx1 * dx1 + dy1 * dy1;
  if (L1Sq === 0) return ts;

  const projectIfOnS1 = (pt: Pt2) => {
    const wx = pt.x - s1.p.x;
    const wy = pt.y - s1.p.y;
    const cross = Math.abs(wx * dy1 - wy * dx1) / Math.sqrt(L1Sq);
    if (cross <= 0.5) {
      const t = (wx * dx1 + wy * dy1) / L1Sq;
      if (t > 1e-6 && t < 1 - 1e-6) ts.push(t);
    }
  };
  projectIfOnS1(s2.p);
  projectIfOnS1(s2.q);

  const dx2 = s2.q.x - s2.p.x;
  const dy2 = s2.q.y - s2.p.y;
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) > 1e-6) {
    const ox = s2.p.x - s1.p.x;
    const oy = s2.p.y - s1.p.y;
    const t = (ox * dy2 - oy * dx2) / denom;
    const u = (ox * dy1 - oy * dx1) / denom;
    if (t > 1e-6 && t < 1 - 1e-6 && u >= -1e-6 && u <= 1 + 1e-6) {
      ts.push(t);
    }
  }
  return ts;
}

/** Ondalık noktada çokgen kümesi içinde mi (sınır hariç, iç nokta testi). */
function insidePolySetFloat(pt: { x: number; y: number }, polys: readonly Poly2[]): boolean {
  for (const poly of polys) {
    if (pointInRingFloat(pt, poly.outer)) {
      let inHole = false;
      for (const h of poly.holes) {
        if (pointInRingFloat(pt, h)) {
          inHole = true;
          break;
        }
      }
      if (!inHole) return true;
    }
  }
  return false;
}

function pointInRingFloat(pt: { x: number; y: number }, r: Ring2): boolean {
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const a = r[i];
    const b = r[j];
    if (a.y > pt.y !== b.y > pt.y) {
      const x = ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x;
      if (pt.x < x) inside = !inside;
    }
  }
  return inside;
}

/** Aynı doğru üzerindeki ardışık ara köşeleri sadeleştirir. */
function simplifyCollinearRing(r: readonly Pt2[]): Pt2[] {
  const clean: Pt2[] = [];
  for (const p of r) {
    if (clean.length === 0 || clean[clean.length - 1].x !== p.x || clean[clean.length - 1].y !== p.y) {
      clean.push(p);
    }
  }
  if (clean.length > 1 && clean[0].x === clean[clean.length - 1].x && clean[0].y === clean[clean.length - 1].y) {
    clean.pop();
  }
  if (clean.length < 3) return [];
  const out: Pt2[] = [];
  const n = clean.length;
  for (let i = 0; i < n; i++) {
    const prev = clean[(i + n - 1) % n];
    const cur = clean[i];
    const next = clean[(i + 1) % n];
    const cross = (cur.x - prev.x) * (next.y - cur.y) - (cur.y - prev.y) * (next.x - cur.x);
    const dot = (cur.x - prev.x) * (next.x - cur.x) + (cur.y - prev.y) * (next.y - cur.y);
    if (cross === 0 && dot > 0) continue;
    out.push(cur);
  }
  return out.length >= 3 ? out : [];
}

/**
 * M8 (§5.10): İki 2B çokgen kümesinin Boolean farkı: `subject − clip`.
 * Çıktı: dış halkaları CCW, delikleri CW olan `Poly2[]` listesi.
 */
export function subtractPolygons2D(subject: readonly Poly2[], clip: readonly Poly2[]): Poly2[] {
  const normSubj = subject.map(normalizeOrientation).filter((p) => p.outer.length >= 3);
  const normClip = clip.map(normalizeOrientation).filter((p) => p.outer.length >= 3);
  if (normSubj.length === 0) return [];
  if (normClip.length === 0) return normSubj;

  // Tüm yönlü kenarları topla: subject (iç sol tarafta), ters çevrilmiş clip (clip dışı sol tarafta)
  const rawSegs: Seg2[] = [];
  for (const p of normSubj) {
    rawSegs.push(...ringToSegs(p.outer));
    for (const h of p.holes) rawSegs.push(...ringToSegs(h));
  }
  for (const p of normClip) {
    rawSegs.push(...ringToSegs([...p.outer].reverse()));
    for (const h of p.holes) rawSegs.push(...ringToSegs([...h].reverse()));
  }

  // Her kenarı diğer kenarlarla kesişim noktalarından böl
  const elementary = new Map<string, Seg2>();
  for (let i = 0; i < rawSegs.length; i++) {
    const s = rawSegs[i];
    const params: number[] = [0, 1];
    for (let j = 0; j < rawSegs.length; j++) {
      if (i === j) continue;
      params.push(...segmentCutParams(s, rawSegs[j]));
    }
    params.sort((a, b) => a - b);
    const pts: Pt2[] = [];
    for (const t of params) {
      const pt: Pt2 =
        t <= 0
          ? s.p
          : t >= 1
            ? s.q
            : {
                x: Math.round(s.p.x + t * (s.q.x - s.p.x)),
                y: Math.round(s.p.y + t * (s.q.y - s.p.y)),
              };
      if (pts.length === 0 || pts[pts.length - 1].x !== pt.x || pts[pts.length - 1].y !== pt.y) {
        pts.push(pt);
      }
    }
    for (let k = 0; k < pts.length - 1; k++) {
      const p = pts[k];
      const q = pts[k + 1];
      const L = Math.hypot(q.x - p.x, q.y - p.y);
      if (L < 1) continue;
      const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      const nx = -(q.y - p.y) / L;
      const ny = (q.x - p.x) / L;
      const eps = Math.min(0.25, L * 0.1);
      const leftPt = { x: mid.x + nx * eps, y: mid.y + ny * eps };
      const rightPt = { x: mid.x - nx * eps, y: mid.y - ny * eps };
      const leftInDiff = insidePolySetFloat(leftPt, normSubj) && !insidePolySetFloat(leftPt, normClip);
      const rightInDiff = insidePolySetFloat(rightPt, normSubj) && !insidePolySetFloat(rightPt, normClip);
      if (leftInDiff && !rightInDiff) {
        elementary.set(segKey(p, q), { p, q });
      }
    }
  }

  if (elementary.size === 0) return [];

  // Yönlü kenarları kapalı halkalara ör (kavşaklarda en sağa dönen = en küçük iç döngü)
  const outByStart = new Map<string, Seg2[]>();
  for (const seg of elementary.values()) {
    const k = ptKey(seg.p);
    const list = outByStart.get(k) ?? [];
    list.push(seg);
    outByStart.set(k, list);
  }
  const used = new Set<string>();
  const rings: Pt2[][] = [];

  for (const startSeg of elementary.values()) {
    const sk = segKey(startSeg.p, startSeg.q);
    if (used.has(sk)) continue;
    const chain: Pt2[] = [startSeg.p];
    let cur = startSeg;
    used.add(sk);
    let guard = 0;
    while (guard++ < elementary.size + 5) {
      chain.push(cur.q);
      if (cur.q.x === startSeg.p.x && cur.q.y === startSeg.p.y) break;
      const candidates = (outByStart.get(ptKey(cur.q)) ?? []).filter((c) => !used.has(segKey(c.p, c.q)));
      if (candidates.length === 0) break;
      let next = candidates[0];
      if (candidates.length > 1) {
        const inAngle = Math.atan2(cur.p.y - cur.q.y, cur.p.x - cur.q.x);
        const ccwDelta = (c: Seg2) => {
          const outAngle = Math.atan2(c.q.y - c.p.y, c.q.x - c.p.x);
          let d = outAngle - inAngle;
          while (d <= 0) d += 2 * Math.PI;
          return d;
        };
        next = candidates.reduce((best, c) => (ccwDelta(c) < ccwDelta(best) ? c : best), candidates[0]);
      }
      used.add(segKey(next.p, next.q));
      cur = next;
    }
    if (chain.length >= 4 && chain[0].x === chain[chain.length - 1].x && chain[0].y === chain[chain.length - 1].y) {
      const simp = simplifyCollinearRing(chain.slice(0, -1));
      if (simp.length >= 3 && ringAreaM2(simp) >= 1e-4) {
        rings.push(simp);
      }
    }
  }

  const outers = rings.filter((r) => signedArea2x(r) > 0).sort((a, b) => ringAreaM2(a) - ringAreaM2(b));
  const holes = rings.filter((r) => signedArea2x(r) < 0);
  const result: { outer: Pt2[]; holes: Pt2[][] }[] = outers.map((o) => ({ outer: o, holes: [] }));

  for (const h of holes) {
    const sample = h[0];
    const host = result.find((cand) => pointInPoly(sample, { outer: cand.outer, holes: [] }) >= 0 && ringAreaM2(cand.outer) > ringAreaM2(h));
    if (host) host.holes.push(h);
  }

  return result;
}

/**
 * Sutherland–Hodgman ile 2B halkayı `a * x + b * y <= c` yarı-düzlemine kırpar.
 * Köşeler ondalık olarak döner; çağıran tamsayı mm ızgarasına yuvarlar.
 */
export function clipRingByHalfPlane2D(
  ring: readonly { readonly x: number; readonly y: number }[],
  a: number,
  b: number,
  c: number,
  eps = 1e-6,
): { x: number; y: number }[] {
  if (ring.length < 3) return [];
  const evalFn = (p: { readonly x: number; readonly y: number }) => a * p.x + b * p.y - c;
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < ring.length; i++) {
    const cur = ring[i];
    const prev = ring[(i + ring.length - 1) % ring.length];
    const dCur = evalFn(cur);
    const dPrev = evalFn(prev);
    const inCur = dCur <= eps;
    const inPrev = dPrev <= eps;
    if (inCur) {
      if (!inPrev) {
        const t = dPrev / (dPrev - dCur);
        out.push({ x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) });
      }
      out.push({ x: cur.x, y: cur.y });
    } else if (inPrev) {
      const t = dPrev / (dPrev - dCur);
      out.push({ x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) });
    }
  }
  return out;
}
