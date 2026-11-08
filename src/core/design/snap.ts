// M4 — Snap (şartname §7.4): köşe > kenar orta > kenar üzeri > dik > paralel > ızgara (1 cm).
// Tolerans ekranda 8 piksel; çağıran tarafından mm'ye çevrilip verilir. Sonuç her zaman mm tamsayıdır.
import type { Pt2, Ring2 } from './types.ts';

export type SnapKind = 'kose' | 'kenarOrta' | 'kenarUzeri' | 'dik' | 'paralel' | 'izgara' | 'serbest';

export interface SnapResult {
  readonly point: Pt2;
  readonly kind: SnapKind;
}

export interface SnapContext {
  /** Snap'e açık halkalar (aktif kattaki tüm çizimler + taslağın kendisi). */
  readonly rings: readonly Ring2[];
  /** Taslağın son noktası (dik/paralel için). */
  readonly lastPoint?: Pt2;
  /** Ekranda 8 pikselin mm karşılığı. */
  readonly toleranceMm: number;
  /** Izgara aralığı (mm); varsayılan 10 (1 cm). */
  readonly gridMm?: number;
  /** Ortogonal kilit (F8 benzeri): son noktadan yalnız yatay/dikey. */
  readonly ortho?: boolean;
}

const round = (p: { x: number; y: number }): Pt2 => ({ x: Math.round(p.x), y: Math.round(p.y) });

function projectOnSeg(p: Pt2, a: Pt2, b: Pt2): { q: { x: number; y: number }; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  return { q: { x: a.x + t * dx, y: a.y + t * dy }, t };
}

export function snapPoint(cursor: Pt2, ctx: SnapContext): SnapResult {
  const tol = ctx.toleranceMm;
  const grid = ctx.gridMm ?? 10;
  let base: Pt2 = cursor;
  if (ctx.ortho && ctx.lastPoint) {
    const dx = Math.abs(cursor.x - ctx.lastPoint.x);
    const dy = Math.abs(cursor.y - ctx.lastPoint.y);
    base = dx >= dy ? { x: cursor.x, y: ctx.lastPoint.y } : { x: ctx.lastPoint.x, y: cursor.y };
  }
  const dist = (a: { x: number; y: number }) => Math.hypot(a.x - base.x, a.y - base.y);

  // 1) Köşe
  let best: { p: Pt2; d: number } | null = null;
  for (const r of ctx.rings) for (const v of r) {
    const d = dist(v);
    if (d <= tol && (!best || d < best.d)) best = { p: v, d };
  }
  if (best) return { point: best.p, kind: 'kose' };

  // 2) Kenar orta
  for (const r of ctx.rings) for (let i = 0; i < r.length; i++) {
    const a = r[i];
    const b = r[(i + 1) % r.length];
    const m = round({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const d = dist(m);
    if (d <= tol && (!best || d < best.d)) best = { p: m, d };
  }
  if (best) return { point: best.p, kind: 'kenarOrta' };

  // 3) Kenar üzeri
  for (const r of ctx.rings) for (let i = 0; i < r.length; i++) {
    const { q, t } = projectOnSeg(base, r[i], r[(i + 1) % r.length]);
    if (t < 0 || t > 1) continue;
    const qq = round(q);
    const d = dist(qq);
    if (d <= tol && (!best || d < best.d)) best = { p: qq, d };
  }
  if (best) return { point: best.p, kind: 'kenarUzeri' };

  // 4) Dik: son noktadan çizilen doğru, imleç yakınındaki bir kenara dik olacak şekilde
  if (ctx.lastPoint) {
    const lp = ctx.lastPoint;
    for (const r of ctx.rings) for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len === 0) continue;
      // Kenarın normali boyunca son noktadan geçen doğru üzerine izdüşüm
      const nx = -(b.y - a.y) / len;
      const ny = (b.x - a.x) / len;
      const s = (base.x - lp.x) * nx + (base.y - lp.y) * ny;
      const q = round({ x: lp.x + s * nx, y: lp.y + s * ny });
      const d = dist(q);
      if (Math.abs(s) > tol && d <= tol / 2 && (!best || d < best.d)) best = { p: q, d };
    }
    if (best) return { point: best.p, kind: 'dik' };
  }

  // 5) Paralel: son noktadan çizilen doğru, mevcut bir kenara paralel olacak şekilde
  if (ctx.lastPoint) {
    const lp = ctx.lastPoint;
    for (const r of ctx.rings) for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len === 0) continue;
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      const s = (base.x - lp.x) * ux + (base.y - lp.y) * uy;
      const q = round({ x: lp.x + s * ux, y: lp.y + s * uy });
      const d = dist(q);
      if (Math.abs(s) > tol && d <= tol / 2 && (!best || d < best.d)) best = { p: q, d };
    }
    if (best) return { point: best.p, kind: 'paralel' };
  }

  // 6) Izgara
  if (grid > 0) return { point: { x: Math.round(base.x / grid) * grid, y: Math.round(base.y / grid) * grid }, kind: 'izgara' };
  return { point: round(base), kind: 'serbest' };
}
