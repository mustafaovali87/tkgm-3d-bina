// M4 — Tamsayı mm 2B geometri (tasarım modeli). Değerler ±1e8 mm içinde kalır; çarpımlar 2^53'ün altında, hesap kesin.
import type { Poly2, Pt2, Ring2 } from './types.ts';

/** İşaretli alanın 2 katı (mm²); + = CCW. Tamsayı girdide sonuç kesindir. */
export function signedArea2x(r: Ring2): number {
  let s = 0;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    const b = r[(i + 1) % r.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s;
}

/** Halka alanı, m². */
export function ringAreaM2(r: Ring2): number {
  return Math.abs(signedArea2x(r)) / 2 / 1e6;
}

/** Delikli çokgen net alanı, m². */
export function polyAreaM2(p: Poly2): number {
  return ringAreaM2(p.outer) - p.holes.reduce((s, h) => s + ringAreaM2(h), 0);
}

/** Dış halka CCW, delikler CW (§4.2). */
export function normalizeOrientation(p: Poly2): Poly2 {
  const outer = signedArea2x(p.outer) < 0 ? [...p.outer].reverse() : p.outer;
  const holes = p.holes.map((h) => (signedArea2x(h) > 0 ? [...h].reverse() : h));
  return { outer, holes };
}

const cross = (o: Pt2, a: Pt2, b: Pt2): number => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

function onSeg(a: Pt2, b: Pt2, p: Pt2): boolean {
  return Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
}

/** Kenar kesişimi: 'proper' = çaprazlama, 'touch' = değme/çakışma. */
export function segIntersect(a: Pt2, b: Pt2, c: Pt2, d: Pt2): 'none' | 'proper' | 'touch' {
  const d1 = Math.sign(cross(c, d, a));
  const d2 = Math.sign(cross(c, d, b));
  const d3 = Math.sign(cross(a, b, c));
  const d4 = Math.sign(cross(a, b, d));
  if (d1 * d2 < 0 && d3 * d4 < 0) return 'proper';
  if ((d1 === 0 && onSeg(c, d, a)) || (d2 === 0 && onSeg(c, d, b)) || (d3 === 0 && onSeg(a, b, c)) || (d4 === 0 && onSeg(a, b, d))) return 'touch';
  return 'none';
}

/** Basit çokgen mi (komşu olmayan kenarlar kesişmiyor, ardışık eş nokta yok, ≥ 3 nokta)? */
export function isSimpleRing(r: Ring2): boolean {
  const n = r.length;
  if (n < 3) return false;
  for (let i = 0; i < n; i++) {
    const a = r[i];
    const b = r[(i + 1) % n];
    if (a.x === b.x && a.y === b.y) return false;
    for (let j = i + 1; j < n; j++) {
      if ((j + 1) % n === i || j === i + 1) continue;
      if (segIntersect(a, b, r[j], r[(j + 1) % n]) !== 'none') return false;
    }
  }
  return signedArea2x(r) !== 0;
}

/** Nokta konumu: 1 içeride, 0 sınırda, -1 dışarıda. */
export function pointInRing(p: Pt2, r: Ring2): 1 | 0 | -1 {
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const a = r[i];
    const b = r[j];
    if (cross(a, b, p) === 0 && onSeg(a, b, p)) return 0;
    if (a.y > p.y !== b.y > p.y) {
      const x = ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
      if (p.x < x) inside = !inside;
    }
  }
  return inside ? 1 : -1;
}

export function pointInPoly(p: Pt2, poly: Poly2): 1 | 0 | -1 {
  const o = pointInRing(p, poly.outer);
  if (o !== 1) return o;
  for (const h of poly.holes) {
    const r = pointInRing(p, h);
    if (r === 1) return -1;
    if (r === 0) return 0;
  }
  return 1;
}

function ringsCross(a: Ring2, b: Ring2): boolean {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (segIntersect(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length]) === 'proper') return true;
    }
  }
  return false;
}

/** inner ⊂ outer (sınır dahil): tüm köşeler içeride/sınırda ve kenarlar çaprazlamıyor. */
export function ringInsidePoly(inner: Ring2, outer: Poly2): boolean {
  if (inner.some((p) => pointInPoly(p, outer) === -1)) return false;
  if (ringsCross(inner, outer.outer)) return false;
  if (outer.holes.some((h) => ringsCross(inner, h))) return false;
  // Kenar orta noktaları da içeride olmalı (içbükey dış sınırda köşeler içeride kalıp kenar dışarı taşabilir)
  for (let i = 0; i < inner.length; i++) {
    const a = inner[i];
    const b = inner[(i + 1) % inner.length];
    if (pointInPoly({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, outer) === -1) return false;
  }
  return true;
}

/**
 * İki halka alan olarak örtüşüyor mu (yalnız sınırda değme sayılmaz)?
 * Çaprazlayan kenar, bir halkanın köşesinin ya da kenar ortasının diğerinin tam içinde olması → örtüşme.
 */
export function ringsOverlap(a: Ring2, b: Ring2): boolean {
  if (ringsCross(a, b)) return true;
  const strictlyInside = (r: Ring2, s: Ring2) =>
    r.some((p) => pointInRing(p, s) === 1) ||
    r.some((p, i) => {
      const q = r[(i + 1) % r.length];
      return pointInRing({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }, s) === 1;
    });
  if (strictlyInside(a, b) || strictlyInside(b, a)) return true;
  // Aynı halka (tüm köşeler sınırda)
  return a.length === b.length && a.every((p) => pointInRing(p, b) === 0) && b.every((p) => pointInRing(p, a) === 0);
}

export function ringBounds(r: Ring2): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of r) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

export function ringCentroid(r: Ring2): Pt2 {
  const a2 = signedArea2x(r);
  if (a2 === 0) return r[0] ?? { x: 0, y: 0 };
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < r.length; i++) {
    const p = r[i];
    const q = r[(i + 1) % r.length];
    const f = p.x * q.y - q.x * p.y;
    cx += (p.x + q.x) * f;
    cy += (p.y + q.y) * f;
  }
  return { x: cx / (3 * a2), y: cy / (3 * a2) };
}

/** En kısa kenar (mm). */
export function minEdgeMm(r: Ring2): number {
  let m = Infinity;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    const b = r[(i + 1) % r.length];
    m = Math.min(m, Math.hypot(a.x - b.x, a.y - b.y));
  }
  return m;
}

// ---------------- Kesişim alanı (§5.3 toleransları: kesişim ≤ 0.1 m², boşluk ≤ 1 mm) ----------------

/** Basit çokgeni kulak kırpma ile üçgenlere ayırır (delik yok). */
export function triangulateRing(r: Ring2): Array<[Pt2, Pt2, Pt2]> {
  const pts = signedArea2x(r) < 0 ? [...r].reverse() : [...r];
  const idx = pts.map((_, i) => i);
  const out: Array<[Pt2, Pt2, Pt2]> = [];
  let guard = 0;
  while (idx.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const a = pts[idx[(i + idx.length - 1) % idx.length]];
      const b = pts[idx[i]];
      const c = pts[idx[(i + 1) % idx.length]];
      if (cross(a, b, c) <= 0) continue; // dışbükey köşe değil
      let ear = true;
      for (const j of idx) {
        const p = pts[j];
        if (p === a || p === b || p === c) continue;
        if (cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0) {
          ear = false;
          break;
        }
      }
      if (!ear) continue;
      out.push([a, b, c]);
      idx.splice(i, 1);
      cut = true;
      break;
    }
    if (!cut) break; // dejenere girdi: kalan kısım atlanır
  }
  if (idx.length === 3) out.push([pts[idx[0]], pts[idx[1]], pts[idx[2]]]);
  return out;
}

/** Sutherland–Hodgman: herhangi bir çokgeni (içbükey olabilir) dışbükey CCW üçgene kırpar. */
function clipToTriangle(subject: readonly { x: number; y: number }[], tri: [Pt2, Pt2, Pt2]): Array<{ x: number; y: number }> {
  let out = subject.slice();
  for (let e = 0; e < 3 && out.length > 0; e++) {
    const A = tri[e];
    const B = tri[(e + 1) % 3];
    const inside = (p: { x: number; y: number }) => (B.x - A.x) * (p.y - A.y) - (B.y - A.y) * (p.x - A.x) >= 0;
    const inter = (p: { x: number; y: number }, q: { x: number; y: number }) => {
      const a1 = (B.x - A.x) * (p.y - A.y) - (B.y - A.y) * (p.x - A.x);
      const a2 = (B.x - A.x) * (q.y - A.y) - (B.y - A.y) * (q.x - A.x);
      const t = a1 / (a1 - a2);
      return { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) };
    };
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(inter(prev, cur));
        out.push(cur);
      } else if (inside(prev)) {
        out.push(inter(prev, cur));
      }
    }
  }
  return out;
}

function areaOf(pts: readonly { x: number; y: number }[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

/** İki basit halkanın kesişim alanı (m²). a üçgenlenir, b her üçgene kırpılır. */
export function intersectionAreaM2(a: Ring2, b: Ring2): number {
  const ba = ringBounds(a);
  const bb = ringBounds(b);
  if (ba.maxX <= bb.minX || bb.maxX <= ba.minX || ba.maxY <= bb.minY || bb.maxY <= ba.minY) return 0;
  const subj = signedArea2x(b) < 0 ? [...b].reverse() : b;
  let s = 0;
  for (const t of triangulateRing(a)) s += Math.abs(areaOf(clipToTriangle(subj, t)));
  return s / 1e6;
}

/** Halka çevresi (m). */
export function ringPerimeterM(r: Ring2): number {
  let s = 0;
  for (let i = 0; i < r.length; i++) s += Math.hypot(r[i].x - r[(i + 1) % r.length].x, r[i].y - r[(i + 1) % r.length].y);
  return s / 1000;
}
/**
 * Delikli iki çokgenin kesişim alanı (m²). Delikler kendi çokgeninin içinde ve birbirinden ayrık kabul edilir.
 * |A∩B| = |Ao∩Bo| − Σ|Ah∩Bo| − Σ|Ao∩Bh| + ΣΣ|Ah∩Bh|
 */
export function polyIntersectionAreaM2(a: Poly2, b: Poly2): number {
  let s = intersectionAreaM2(a.outer, b.outer);
  for (const h of a.holes) s -= intersectionAreaM2(h, b.outer);
  for (const h of b.holes) s -= intersectionAreaM2(a.outer, h);
  for (const ha of a.holes) for (const hb of b.holes) s += intersectionAreaM2(ha, hb);
  return Math.max(0, s);
}