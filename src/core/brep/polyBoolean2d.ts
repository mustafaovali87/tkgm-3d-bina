// M8 — Saf TypeScript 2B çokgen Boolean farkı (L.outline − U.outline, OuterFloor/OuterCeiling §5.10, iç kısım K71)
// ve yarı-düzlem kırpma yardımcıları. DOM/Node bağımlılığı yoktur; tamsayı mm ızgarasında deterministik çalışır.
import { isSimpleRing, normalizeOrientation, pointInPoly, ringAreaM2, signedArea2x } from '../design/geometry2d.ts';
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

function ringPerimeterMm(r: readonly Pt2[]): number {
  let p = 0;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    const b = r[(i + 1) % r.length];
    p += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return p;
}

/**
 * Tek bir 2B halkadaki:
 * 1) <= 2 mm ardışık yakın köşeleri,
 * 2) 180° geri dönüş dikenlerini (spike) ve <= 2 mm sapmalı doğrusal/iğne köşeleri,
 * 3) < 10 mm mikro kenarları (V-038)
 * ardışık turlarda temizler.
 */
function pruneRingSpikesAndCollinear(r: readonly Pt2[]): Pt2[] {
  let pts: Pt2[] = [...r];
  if (pts.length > 1 && Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) <= 2) {
    pts.pop();
  }
  let changed = true;
  let guard = 0;
  while (changed && pts.length >= 3 && guard++ < 64) {
    changed = false;
    // 1. <= 2 mm yakın ardışık köşeleri birleştir
    const merged: Pt2[] = [];
    for (const p of pts) {
      if (merged.length === 0 || Math.hypot(p.x - merged[merged.length - 1].x, p.y - merged[merged.length - 1].y) > 2) {
        merged.push(p);
      } else {
        changed = true;
      }
    }
    if (merged.length > 1 && Math.hypot(merged[0].x - merged[merged.length - 1].x, merged[0].y - merged[merged.length - 1].y) <= 2) {
      merged.pop();
      changed = true;
    }
    pts = merged;
    if (pts.length < 3) break;

    // 2. Doğrusal ara köşeleri ve 180° geri dönüş dikenlerini (spike) buda
    const nextPts: Pt2[] = [];
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const prev = nextPts.length > 0 ? nextPts[nextPts.length - 1] : pts[(i - 1 + n) % n];
      const cur = pts[i];
      const next = pts[(i + 1) % n];
      const dPrevNext = Math.hypot(next.x - prev.x, next.y - prev.y);
      const dPrevCur = Math.hypot(cur.x - prev.x, cur.y - prev.y);
      const dCurNext = Math.hypot(next.x - cur.x, next.y - cur.y);
      const maxSide = Math.max(dPrevNext, dPrevCur, dCurNext);
      if (dPrevNext <= 2 || maxSide < 1) {
        changed = true;
        continue;
      }
      const cross = Math.abs((cur.x - prev.x) * (next.y - prev.y) - (cur.y - prev.y) * (next.x - prev.x));
      if (cross / maxSide <= 2) {
        changed = true;
        continue;
      }
      nextPts.push(cur);
    }
    pts = nextPts;
    if (pts.length < 3) break;

    // 3. < 10 mm mikro kenarları temizle (V-038 önlemi)
    if (!changed && pts.length > 3) {
      const noShort: Pt2[] = [];
      for (let i = 0; i < pts.length; i++) {
        const cur = pts[i];
        const prev = noShort.length > 0 ? noShort[noShort.length - 1] : pts[pts.length - 1];
        if (Math.hypot(cur.x - prev.x, cur.y - prev.y) < 10 && pts.length - (i - noShort.length) > 3) {
          changed = true;
          continue;
        }
        noShort.push(cur);
      }
      if (noShort.length >= 3) pts = noShort;
    }
  }
  return pts.length >= 3 ? pts : [];
}

/** İki doğru parçasının kesişimi veya <= 1 mm yakın teması varsa ortak noktayı döndürür. */
function segmentSelfTouchPoint(a: Pt2, b: Pt2, c: Pt2, d: Pt2): Pt2 | null {
  const orient = (p: Pt2, q: Pt2, r: Pt2) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const onSeg = (p: Pt2, q: Pt2, r: Pt2) =>
    Math.min(p.x, q.x) - 1e-6 <= r.x &&
    r.x <= Math.max(p.x, q.x) + 1e-6 &&
    Math.min(p.y, q.y) - 1e-6 <= r.y &&
    r.y <= Math.max(p.y, q.y) + 1e-6;

  const d1 = orient(c, d, a);
  const d2 = orient(c, d, b);
  const d3 = orient(a, b, c);
  const d4 = orient(a, b, d);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    const denom = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
    if (Math.abs(denom) > 1e-9) {
      const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denom;
      return { x: Math.round(a.x + t * (b.x - a.x)), y: Math.round(a.y + t * (b.y - a.y)) };
    }
  }
  if (Math.abs(d1) <= 1e-6 && onSeg(c, d, a)) return a;
  if (Math.abs(d2) <= 1e-6 && onSeg(c, d, b)) return b;
  if (Math.abs(d3) <= 1e-6 && onSeg(a, b, c)) return c;
  if (Math.abs(d4) <= 1e-6 && onSeg(a, b, d)) return d;

  // Köşe-kenar <= 2 mm yakınlık kontrolü
  const projOnSeg = (pt: Pt2, p: Pt2, q: Pt2): Pt2 | null => {
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const L2 = dx * dx + dy * dy;
    if (L2 === 0) return null;
    const t = ((pt.x - p.x) * dx + (pt.y - p.y) * dy) / L2;
    if (t < 0 || t > 1) return null;
    const px = p.x + t * dx;
    const py = p.y + t * dy;
    if (Math.hypot(pt.x - px, pt.y - py) <= 2) return pt;
    return null;
  };
  return projOnSeg(a, c, d) ?? projOnSeg(b, c, d) ?? projOnSeg(c, a, b) ?? projOnSeg(d, a, b);
}

/**
 * Halka komşu olmayan iki köşede veya kenarda birbirine değiyor/kesişiyorsa (8-şekli / diken / boğum),
 * halkayı basit (kendini kesmeyen) alt döngülere ayırır.
 */
function decomposeToSimpleLoops(ring: readonly Pt2[], depth = 0): Pt2[][] {
  const cleaned = pruneRingSpikesAndCollinear(ring);
  if (cleaned.length < 3 || depth > 16) return [];
  const n = cleaned.length;

  // 1. Komşu olmayan iki köşe <= 2 mm yakın mı?
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (Math.hypot(cleaned[i].x - cleaned[j].x, cleaned[i].y - cleaned[j].y) <= 2) {
        const loop1 = cleaned.slice(i, j);
        const loop2 = [...cleaned.slice(j), ...cleaned.slice(0, i)];
        return [...decomposeToSimpleLoops(loop1, depth + 1), ...decomposeToSimpleLoops(loop2, depth + 1)];
      }
    }
  }

  // 2. Komşu olmayan iki kenar kesişiyor veya <= 2 mm yaklaşıyor mu?
  for (let i = 0; i < n; i++) {
    const a = cleaned[i];
    const b = cleaned[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const c = cleaned[j];
      const d = cleaned[(j + 1) % n];
      const pt = segmentSelfTouchPoint(a, b, c, d);
      if (pt) {
        const loop1 = [pt, ...cleaned.slice(i + 1, j + 1)];
        const loop2 = [pt, ...cleaned.slice(j + 1), ...cleaned.slice(0, i + 1)];
        if (loop1.length < n + 1 && loop2.length < n + 1) {
          return [...decomposeToSimpleLoops(loop1, depth + 1), ...decomposeToSimpleLoops(loop2, depth + 1)];
        }
      }
    }
  }

  return [cleaned];
}

export interface BooleanSubtractResult {
  readonly polygons: Poly2[];
  readonly droppedNonSimple: number;
}

/**
 * M8 (§5.10, R2): İki 2B çokgen kümesinin Boolean farkı: `subject − clip`.
 * Çıktı: dış halkaları CCW, delikleri CW olan, dikenlerden/kıymıklardan (< 0.01 m² veya < 10 mm kalınlık)
 * ve kendini kesen halkalardan (V-034) arındırılmış `Poly2[]` listesi.
 */
function buildPolygonsFromDirectedEdges(elementary: Map<string, Seg2>): BooleanSubtractResult {
  if (elementary.size === 0) return { polygons: [], droppedNonSimple: 0 };

  const outByStart = new Map<string, Seg2[]>();
  for (const seg of elementary.values()) {
    const k = ptKey(seg.p);
    const list = outByStart.get(k) ?? [];
    list.push(seg);
    outByStart.set(k, list);
  }
  const used = new Set<string>();
  const rings: Pt2[][] = [];
  let droppedNonSimple = 0;

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
      for (const simp of decomposeToSimpleLoops(chain.slice(0, -1))) {
        const areaM2 = ringAreaM2(simp);
        if (simp.length < 3 || areaM2 < 0.01) continue;
        const areaMm2 = areaM2 * 1_000_000;
        const perimMm = ringPerimeterMm(simp);
        if (perimMm <= 0 || (2 * areaMm2) / perimMm < 10) continue;
        if (!isSimpleRing(simp)) {
          droppedNonSimple++;
          continue;
        }
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

  return { polygons: result, droppedNonSimple };
}

/**
 * M8 (§5.10, R2): İki 2B çokgen kümesinin Boolean farkı: `subject − clip`.
 * Çıktı: dış halkaları CCW, delikleri CW olan, dikenlerden/kıymıklardan (< 0.01 m² veya < 10 mm kalınlık)
 * ve kendini kesen halkalardan (V-034) arındırılmış `Poly2[]` listesi.
 */
export function subtractPolygons2DWithStatus(subject: readonly Poly2[], clip: readonly Poly2[]): BooleanSubtractResult {
  const normSubj = subject.map(normalizeOrientation).filter((p) => p.outer.length >= 3);
  const normClip = clip.map(normalizeOrientation).filter((p) => p.outer.length >= 3);
  if (normSubj.length === 0) return { polygons: [], droppedNonSimple: 0 };
  if (normClip.length === 0) return { polygons: normSubj, droppedNonSimple: 0 };

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

  return buildPolygonsFromDirectedEdges(elementary);
}

export function subtractPolygons2D(subject: readonly Poly2[], clip: readonly Poly2[]): Poly2[] {
  return subtractPolygons2DWithStatus(subject, clip).polygons;
}

/**
 * M9 (§6.13, §9.5): 2B çokgen kümesinin birleşimi (union).
 * Çıktı: dış halkaları CCW, delikleri CW olan, basit ve temizlenmiş `Poly2[]` listesi.
 */
export function unionPolygons2D(polygons: readonly Poly2[]): Poly2[] {
  const norm = polygons.map(normalizeOrientation).filter((p) => p.outer.length >= 3);
  if (norm.length <= 1) return norm;

  const rawSegs: Seg2[] = [];
  for (const p of norm) {
    rawSegs.push(...ringToSegs(p.outer));
    for (const h of p.holes) rawSegs.push(...ringToSegs(h));
  }

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
      const leftIn = insidePolySetFloat(leftPt, norm);
      const rightIn = insidePolySetFloat(rightPt, norm);
      if (leftIn && !rightIn) {
        elementary.set(segKey(p, q), { p, q });
      }
    }
  }

  const res = buildPolygonsFromDirectedEdges(elementary);
  return res.polygons.length > 0 ? res.polygons : norm;
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
