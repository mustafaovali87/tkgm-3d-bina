// M2 — Doğrulama için saf geometri yardımcıları (DOM yok, ağ yok).
import type { Point3D } from '../model/index.ts';

export interface P2 {
  readonly x: number;
  readonly y: number;
}

/** Kapanış noktası (ilk = son) varsa çıkarır. */
export function uniqueRing(pts: readonly Point3D[]): Point3D[] {
  if (pts.length > 1) {
    const a = pts[0];
    const b = pts[pts.length - 1];
    if (Math.abs(a.e - b.e) < 1e-6 && Math.abs(a.n - b.n) < 1e-6 && Math.abs(a.z - b.z) < 1e-6) {
      return pts.slice(0, -1);
    }
  }
  return pts.slice();
}

/** Newell yöntemiyle halka normali (normalize edilmemiş). */
export function newellNormal(pts: readonly Point3D[]): { x: number; y: number; z: number } {
  let x = 0;
  let y = 0;
  let z = 0;
  const n = pts.length;
  if (n === 0) return { x, y, z };
  const o = pts[0];
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const ay = a.n - o.n;
    const az = a.z - o.z;
    const ax = a.e - o.e;
    const by = b.n - o.n;
    const bz = b.z - o.z;
    const bx = b.e - o.e;
    x += (ay - by) * (az + bz);
    y += (az - bz) * (ax + bx);
    z += (ax - bx) * (ay + by);
  }
  return { x, y, z };
}

export type DropAxis = 'x' | 'y' | 'z';

/** Normalin en büyük bileşenini atarak 2B izdüşüm ekseni seçer. */
export function dropAxisOf(normal: { x: number; y: number; z: number }): DropAxis {
  const ax = Math.abs(normal.x);
  const ay = Math.abs(normal.y);
  const az = Math.abs(normal.z);
  if (az >= ax && az >= ay) return 'z';
  if (ax >= ay) return 'x';
  return 'y';
}

/** Yerel kökene (origin) göre 2B izdüşüm; büyük TUREF sayılarında hassasiyet kaybını önler. */
export function project(pts: readonly Point3D[], drop: DropAxis, origin: Point3D): P2[] {
  return pts.map((p) => {
    const e = p.e - origin.e;
    const n = p.n - origin.n;
    const z = p.z - origin.z;
    if (drop === 'z') return { x: e, y: n };
    if (drop === 'x') return { x: n, y: z };
    return { x: e, y: z };
  });
}

export function signedArea2(p: readonly P2[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

function orient(a: P2, b: P2, c: P2): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

const EPS = 1e-9;

function onSegment(a: P2, b: P2, p: P2): boolean {
  return (
    Math.min(a.x, b.x) - EPS <= p.x &&
    p.x <= Math.max(a.x, b.x) + EPS &&
    Math.min(a.y, b.y) - EPS <= p.y &&
    p.y <= Math.max(a.y, b.y) + EPS
  );
}

/** Kesişim türü: 'none' | 'proper' (çaprazlama) | 'touch' (uç nokta veya çakışık). */
export function segmentIntersection(a: P2, b: P2, c: P2, d: P2): 'none' | 'proper' | 'touch' {
  const d1 = orient(c, d, a);
  const d2 = orient(c, d, b);
  const d3 = orient(a, b, c);
  const d4 = orient(a, b, d);
  const s1 = Math.abs(d1) <= EPS ? 0 : Math.sign(d1);
  const s2 = Math.abs(d2) <= EPS ? 0 : Math.sign(d2);
  const s3 = Math.abs(d3) <= EPS ? 0 : Math.sign(d3);
  const s4 = Math.abs(d4) <= EPS ? 0 : Math.sign(d4);
  if (s1 * s2 < 0 && s3 * s4 < 0) return 'proper';
  if (s1 === 0 && onSegment(c, d, a)) return 'touch';
  if (s2 === 0 && onSegment(c, d, b)) return 'touch';
  if (s3 === 0 && onSegment(a, b, c)) return 'touch';
  if (s4 === 0 && onSegment(a, b, d)) return 'touch';
  return 'none';
}

/** Halka kendini kesiyor mu (komşu olmayan kenarlar)? V-034 */
export function ringSelfIntersects(p: readonly P2[]): boolean {
  const n = p.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const b = p[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      // komşu kenarları atla
      if (j === i || (j + 1) % n === i || (i + 1) % n === j) continue;
      const c = p[j];
      const d = p[(j + 1) % n];
      if (segmentIntersection(a, b, c, d) !== 'none') return true;
    }
  }
  return false;
}

/** İki halka çaprazlama ile kesişiyor mu (yalnız 'proper')? V-035 */
export function ringsCross(p: readonly P2[], q: readonly P2[]): boolean {
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    for (let j = 0; j < q.length; j++) {
      if (segmentIntersection(a, b, q[j], q[(j + 1) % q.length]) === 'proper') return true;
    }
  }
  return false;
}

/** Nokta çokgen içinde mi (sınır dahil değil). */
export function pointInPolygon(pt: P2, poly: readonly P2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > pt.y !== b.y > pt.y) {
      const x = ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x;
      if (pt.x < x) inside = !inside;
    }
  }
  return inside;
}

/** Nokta çokgen sınırı üzerinde mi (tolerans metre). */
export function pointOnBoundary(pt: P2, poly: readonly P2[], tol = 1e-4): boolean {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const len2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    let t = len2 === 0 ? 0 : ((pt.x - a.x) * (b.x - a.x) + (pt.y - a.y) * (b.y - a.y)) / len2;
    t = Math.max(0, Math.min(1, t));
    const dx = a.x + t * (b.x - a.x) - pt.x;
    const dy = a.y + t * (b.y - a.y) - pt.y;
    if (dx * dx + dy * dy <= tol * tol) return true;
  }
  return false;
}

/** Halkanın mm'ye yuvarlanmış, sıradan bağımsız anahtarı (özdeş halka eşleştirmesi). */
export function ringKey(pts: readonly Point3D[]): string {
  return uniqueRing(pts)
    .map((p) => `${Math.round(p.e * 1000)},${Math.round(p.n * 1000)},${Math.round(p.z * 1000)}`)
    .sort()
    .join(';');
}

/**
 * Açıklık eşleştirme anahtarı: plan (XY) köşeleri + üst kot (mm).
 * Alt kot bilerek dahil edilmez: gerçek kabul dosyalarında kapı nesnesi zeminden (0 mm),
 * delik ise +50 mm'den başlayabiliyor (N20). Alt kot farkı ayrıca ölçülür.
 */
export function openingKey(pts: readonly Point3D[]): string {
  const u = uniqueRing(pts);
  let maxZ = Number.NEGATIVE_INFINITY;
  for (const p of u) if (p.z > maxZ) maxZ = p.z;
  const xy = Array.from(new Set(u.map((p) => `${Math.round(p.e * 1000)},${Math.round(p.n * 1000)}`))).sort();
  return `${xy.join(';')}|${Math.round(maxZ * 1000)}`;
}

export function minZOf(pts: readonly Point3D[]): number {
  let m = Number.POSITIVE_INFINITY;
  for (const p of pts) if (p.z < m) m = p.z;
  return m;
}

export function maxZOf(pts: readonly Point3D[]): number {
  let m = Number.NEGATIVE_INFINITY;
  for (const p of pts) if (p.z > m) m = p.z;
  return m;
}

/** Yatay (XY) işaretli alan, m² (+ = saatin tersi, üstten bakış). */
export function planSignedArea(pts: readonly Point3D[]): number {
  const u = uniqueRing(pts);
  if (u.length < 3) return 0;
  const o = u[0];
  let s = 0;
  for (let i = 0; i < u.length; i++) {
    const a = u[i];
    const b = u[(i + 1) % u.length];
    s += (a.e - o.e) * (b.n - o.n) - (b.e - o.e) * (a.n - o.n);
  }
  return s / 2;
}

/**
 * Düz tabanlı bir odanın hacmi: tavan poligonlarının altında, z0 tabanına kadar uzanan prizmaların toplamı (m³).
 * Düzlemsel poligonda z doğrusal olduğu için üçgen başına (plan alanı × ortalama z) kesin sonuç verir.
 * Delikler (iç halkalar) ters yönlü olduğundan işaretli alanla otomatik düşülür. Eğik tavanlarda da geçerlidir.
 */
export function prismVolumeUnder(ceilingRings: ReadonlyArray<{ readonly exterior: readonly Point3D[]; readonly holes: ReadonlyArray<readonly Point3D[]> }>, z0: number): number {
  let total = 0;
  for (const c of ceilingRings) {
    const ext = uniqueRing(c.exterior);
    if (ext.length < 3) continue;
    const sign = Math.sign(planSignedArea(c.exterior)) || 1;
    for (const ring of [ext, ...c.holes.map(uniqueRing)]) {
      if (ring.length < 3) continue;
      const p0 = ring[0];
      for (let i = 1; i + 1 < ring.length; i++) {
        const a = ring[i];
        const b = ring[i + 1];
        const area = ((a.e - p0.e) * (b.n - p0.n) - (b.e - p0.e) * (a.n - p0.n)) / 2;
        const meanZ = (p0.z + a.z + b.z) / 3;
        total += sign * area * (meanZ - z0);
      }
    }
  }
  return Math.abs(total);
}

/** Kapalı kabuk hacmi (diverjans teoremi, m³). Yönler tutarlı değilse mutlak değer anlamlı olmayabilir. */
export function signedVolumeOfRings(rings: ReadonlyArray<readonly Point3D[]>, origin: Point3D): number {
  let v = 0;
  for (const ring of rings) {
    const u = uniqueRing(ring);
    if (u.length < 3) continue;
    const p0 = u[0];
    for (let i = 1; i + 1 < u.length; i++) {
      const a = { x: p0.e - origin.e, y: p0.n - origin.n, z: p0.z - origin.z };
      const b = { x: u[i].e - origin.e, y: u[i].n - origin.n, z: u[i].z - origin.z };
      const c = { x: u[i + 1].e - origin.e, y: u[i + 1].n - origin.n, z: u[i + 1].z - origin.z };
      v += (a.x * (b.y * c.z - b.z * c.y) - a.y * (b.x * c.z - b.z * c.x) + a.z * (b.x * c.y - b.y * c.x)) / 6;
    }
  }
  return v;
}

/**
 * V-217 — Oda (BBK_ / OA_) 3B kabuk kapalılığı denetimi (T-kavşak bölme + tolMm köşe yakalama).
 * Duvarlardaki açıklık delikleri (interiorRings) açıklık poligonlarıyla kapalı sayılır (V-172 ayrıca denetler).
 */
export function checkRoomShellClosure(
  rings: ReadonlyArray<readonly Point3D[]>,
  tolMm = 10,
): { readonly closed: boolean; readonly openEdges: number } {
  const cleanRings = rings.map(uniqueRing).filter((r) => r.length >= 3);
  if (cleanRings.length === 0) return { closed: true, openEdges: 0 };
  const o = cleanRings[0][0];
  interface V3 {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly k: string;
  }
  const canonVerts: V3[] = [];
  const toCanon = (p: Point3D): V3 => {
    const x = Math.round((p.e - o.e) * 1000);
    const y = Math.round((p.n - o.n) * 1000);
    const z = Math.round((p.z - o.z) * 1000);
    for (const c of canonVerts) {
      if (Math.hypot(x - c.x, y - c.y, z - c.z) <= tolMm) return c;
    }
    const v: V3 = { x, y, z, k: `${x},${y},${z}` };
    canonVerts.push(v);
    return v;
  };
  const mmRings: V3[][] = cleanRings.map((r) => {
    const mapped = r.map(toCanon);
    const dedup: V3[] = [];
    for (const v of mapped) {
      if (!dedup.length || dedup[dedup.length - 1].k !== v.k) dedup.push(v);
    }
    if (dedup.length > 1 && dedup[0].k === dedup[dedup.length - 1].k) dedup.pop();
    return dedup;
  });

  const edgeCounts = new Map<string, { count: number; len: number }>();
  const addSubEdge = (a: V3, b: V3) => {
    if (a.k === b.k) return;
    const key = a.k < b.k ? `${a.k}|${b.k}` : `${b.k}|${a.k}`;
    const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    const cur = edgeCounts.get(key);
    if (cur) cur.count++;
    else edgeCounts.set(key, { count: 1, len });
  };

  for (const r of mmRings) {
    if (r.length < 3) continue;
    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      if (a.k === b.k) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const L2 = dx * dx + dy * dy + dz * dz;
      const L = Math.sqrt(L2);
      if (L <= tolMm) continue;
      const cuts: { t: number; v: V3 }[] = [];
      for (const v of canonVerts) {
        if (v.k === a.k || v.k === b.k) continue;
        const wx = v.x - a.x;
        const wy = v.y - a.y;
        const wz = v.z - a.z;
        const t = (wx * dx + wy * dy + wz * dz) / L2;
        if (t * L <= tolMm || (1 - t) * L <= tolMm) continue;
        const cx = wy * dz - wz * dy;
        const cy = wz * dx - wx * dz;
        const cz = wx * dy - wy * dx;
        const dist = Math.sqrt((cx * cx + cy * cy + cz * cz) / L2);
        if (dist <= tolMm) {
          cuts.push({ t, v });
        }
      }
      cuts.sort((m, n) => m.t - n.t);
      let prev = a;
      for (const c of cuts) {
        if (c.v.k !== prev.k) {
          addSubEdge(prev, c.v);
          prev = c.v;
        }
      }
      addSubEdge(prev, b);
    }
  }

  let openEdges = 0;
  const minOpenLen = Math.max(15, tolMm * 1.5);
  for (const { count, len } of edgeCounts.values()) {
    if (count < 2 && len > minOpenLen) openEdges++;
  }
  return { closed: openEdges === 0, openEdges };
}

