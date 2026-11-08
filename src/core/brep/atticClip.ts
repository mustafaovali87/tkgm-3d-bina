// M8 — Çatı arası kesimi ve eğik tavan üretimi (şartname §5.9, §5.12).
// Saf TypeScript: parametrik (beşik/kırma/tek eğim) veya elle (manual) çatı düzlemleriyle
// oda prizmalarını, iç yapıları (BBKIY/OAIY), BB küvetlerini ve kat duvarlarını keser.
// Tüm ortak kenarlar aynı tamsayı mm (x, y, z) köşelerini paylaşır; kapalı kabuk (checkShell) ve
// düzlemsellik (V-032 ≤ 1 mm) korunur.
import { ringBounds, signedArea2x, triangulateRing } from '../design/geometry2d.ts';
import type { DesignBuilding, Poly2, Pt2, Pt3, Ring2, Storey } from '../design/types.ts';
import { analyzeRingPlanarity3D } from '../math/ring.ts';
import { clipRingByHalfPlane2D } from './polyBoolean2d.ts';
import type { BrepPolygon, BrepPolygonKind } from './types.ts';

/** z(x, y) = ax * x + by * y + c biçiminde üst sınır düzlemi (mm). */
export interface LinearRoofPlane {
  readonly id: string;
  readonly ax: number;
  readonly by: number;
  readonly c: number;
}

export interface RoofEnvelope {
  readonly storeyId: string;
  readonly zEave: number;
  readonly zCeiling: number;
  readonly planes: readonly LinearRoofPlane[];
  /** Verilen (x, y) noktasında tamsayı mm tavan/çatı yüksekliği. */
  readonly zAt: (p: Pt2) => number;
}

/** Katta çatı arası kesimi uygulanacak mı? */
export function isAtticStorey(building: DesignBuilding, storey: Storey): boolean {
  const roof = building.roof;
  if (!roof || roof.mode === 'flat') return false;
  if (storey.clipToRoof || storey.kneeWallHeight !== undefined) return true;
  if (roof.eaveZ !== undefined && roof.eaveZ < storey.zBottom + storey.height) return true;
  if (building.sectionParts.some((sp) => sp.storeyId === storey.id && (sp.clipToRoof || sp.usage === 1004))) return true;
  if (building.parts.some((p) => p.storeyId === storey.id && p.clipToRoof)) return true;
  return false;
}

/** Çatı arası kesimi olan binada parametrik çatının oturacağı saçak (RoofEdge) kotu. */
export function resolveRoofEdgeZ(building: DesignBuilding): number {
  const topStorey = building.storeys[building.storeys.length - 1];
  if (!topStorey) return 0;
  const roof = building.roof;
  if (roof?.eaveZ !== undefined) return roof.eaveZ;
  if (roof && roof.mode !== 'flat' && roof.mode !== 'manual' && isAtticStorey(building, topStorey)) {
    const knee = topStorey.kneeWallHeight ?? 1200;
    return topStorey.zBottom + topStorey.slabThickness + knee;
  }
  return topStorey.zBottom + topStorey.height;
}

/** Kat için çatı üst sınır zarfını (düzlemler kümesi) oluşturur. Kesim yoksa null döner. */
export function buildRoofEnvelope(building: DesignBuilding, storey: Storey): RoofEnvelope | null {
  if (!isAtticStorey(building, storey)) return null;
  const roof = building.roof;
  if (!roof || roof.mode === 'flat') return null;
  const zCeiling = storey.zBottom + storey.height;
  const zFloorTop = storey.zBottom + storey.slabThickness;
  const knee = storey.kneeWallHeight ?? 1200;
  const zEave = roof.eaveZ ?? zFloorTop + knee;

  const allPts = storey.outline.flatMap((pl) => pl.outer);
  if (allPts.length < 3) return null;
  const b = ringBounds(allPts);
  const ov = Math.max(0, roof.eaveOverhang);
  const minX = b.minX - ov;
  const maxX = b.maxX + ov;
  const minY = b.minY - ov;
  const maxY = b.maxY + ov;
  const dx = maxX - minX;
  const dy = maxY - minY;
  const slope = Math.tan((Math.max(1, Math.min(75, roof.pitchDeg || 30)) * Math.PI) / 180);

  const planes: LinearRoofPlane[] = [{ id: 'flat_ceiling', ax: 0, by: 0, c: zCeiling }];

  if (roof.mode === 'gable') {
    if (dx >= dy) {
      planes.push({ id: 'slope_s', ax: 0, by: slope, c: zEave - slope * minY });
      planes.push({ id: 'slope_n', ax: 0, by: -slope, c: zEave + slope * maxY });
    } else {
      planes.push({ id: 'slope_w', ax: slope, by: 0, c: zEave - slope * minX });
      planes.push({ id: 'slope_e', ax: -slope, by: 0, c: zEave + slope * maxX });
    }
  } else if (roof.mode === 'hip') {
    planes.push({ id: 'slope_s', ax: 0, by: slope, c: zEave - slope * minY });
    planes.push({ id: 'slope_n', ax: 0, by: -slope, c: zEave + slope * maxY });
    planes.push({ id: 'slope_w', ax: slope, by: 0, c: zEave - slope * minX });
    planes.push({ id: 'slope_e', ax: -slope, by: 0, c: zEave + slope * maxX });
  } else if (roof.mode === 'shed') {
    if (dx >= dy) {
      planes.push({ id: 'slope_s', ax: 0, by: slope, c: zEave - slope * minY });
    } else {
      planes.push({ id: 'slope_w', ax: slope, by: 0, c: zEave - slope * minX });
    }
  } else if (roof.mode === 'manual' && roof.facets && roof.facets.length > 0) {
    roof.facets.forEach((f, idx) => {
      const plane = fitLinearPlane(f.outer, `manual_${idx}`);
      if (plane) planes.push(plane);
    });
  }

  if (planes.length <= 1) return null;

  const zAt = (p: Pt2): number => {
    let minZ = zCeiling;
    for (const pl of planes) {
      const z = pl.ax * p.x + pl.by * p.y + pl.c;
      if (z < minZ) minZ = z;
    }
    return Math.round(minZ);
  };

  return { storeyId: storey.id, zEave, zCeiling, planes, zAt };
}

function fitLinearPlane(pts: readonly Pt3[], id: string): LinearRoofPlane | null {
  if (pts.length < 3) return null;
  let nx = 0;
  let ny = 0;
  let nz = 0;
  const o = pts[0];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    nx += (a.y - b.y) * (a.z + b.z - 2 * o.z);
    ny += (a.z - b.z) * (a.x + b.x - 2 * o.x);
    nz += (a.x - b.x) * (a.y + b.y - 2 * o.y);
  }
  // Yalnız yukarı bakan eğik yüzler (nz > 0 ve eğimli)
  if (nz <= 1e-3) return null;
  const ax = -nx / nz;
  const by = -ny / nz;
  if (Math.hypot(ax, by) < 1e-4) return null;
  const c = o.z - ax * o.x - by * o.y;
  return { id, ax, by, c };
}

/**
 * Bir doğru parçası (p → q) üzerinde iki çatı düzleminin kesiştiği (mahya/omuz) noktaları bulur.
 * Bu noktalar T-kavşak listesine eklenerek hem duvarların hem tavan yüzlerinin aynı köşelerde bölünmesini sağlar.
 */
export function roofRidgeSplitPointsOnRing(ring: Ring2, env: RoofEnvelope): Pt2[] {
  const out: Pt2[] = [];
  const planes = env.planes;
  for (let idx = 0; idx < ring.length; idx++) {
    const p = ring[idx];
    const q = ring[(idx + 1) % ring.length];
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    if (dx === 0 && dy === 0) continue;
    for (let i = 0; i < planes.length; i++) {
      for (let j = i + 1; j < planes.length; j++) {
        const da = planes[i].ax - planes[j].ax;
        const db = planes[i].by - planes[j].by;
        const dc = planes[j].c - planes[i].c;
        const denom = da * dx + db * dy;
        if (Math.abs(denom) < 1e-9) continue;
        const t = (dc - (da * p.x + db * p.y)) / denom;
        if (t > 1e-4 && t < 1 - 1e-4) {
          out.push({ x: Math.round(p.x + t * dx), y: Math.round(p.y + t * dy) });
        }
      }
    }
  }
  return out;
}

/**
 * Halka kenarlarının üzerine (≤ 1 mm) düşen kesim noktalarını halkaya köşe olarak ekler.
 * Böylece taban, duvar ve eğik tavan halkaları mahya kırıklarında birebir aynı (x, y) köşelerini paylaşır.
 */
export function insertSplitPointsIntoRing(ring: Ring2, splitPts: readonly Pt2[]): Pt2[] {
  const out: Pt2[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    out.push(a);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const L = Math.hypot(dx, dy);
    if (L < 2) continue;
    const mids: { t: number; pt: Pt2 }[] = [];
    for (const s of splitPts) {
      const wx = s.x - a.x;
      const wy = s.y - a.y;
      const t = (wx * dx + wy * dy) / L;
      const d = Math.abs(wx * dy - wy * dx) / L;
      if (d <= 1 && t > 1 && t < L - 1) {
        if (!mids.some((m) => Math.abs(m.t - t) <= 1)) mids.push({ t, pt: s });
      }
    }
    mids.sort((m, n) => m.t - n.t);
    for (const m of mids) out.push(m.pt);
  }
  return out;
}

export function insertSplitPointsIntoPoly(poly: Poly2, splitPts: readonly Pt2[]): Poly2 {
  return {
    outer: insertSplitPointsIntoRing(poly.outer, splitPts),
    holes: poly.holes.map((h) => insertSplitPointsIntoRing(h, splitPts)),
  };
}

/**
 * 3B halkanın düzlemsellik sapması > 0.8 mm ise (tamsayı yuvarlaması nedeniyle çarpık dörtgen oluşmuşsa)
 * üçgenlere ayırarak V-032 (≤ 1 mm düzlemsellik) kuralını %100 garanti altına alır.
 */
function ensurePlanar3DPolygons(
  ring3d: readonly Pt3[],
  kind: BrepPolygonKind,
  idOf: (sub: string) => string,
): BrepPolygon[] {
  if (ring3d.length < 3) return [];
  if (ring3d.length === 3) {
    return [{ id: idOf('0'), kind, outer: ring3d, holes: [] }];
  }
  const ptsMeters = [...ring3d, ring3d[0]].map((p) => ({ e: p.x / 1000, n: p.y / 1000, z: p.z / 1000 }));
  const planarity = analyzeRingPlanarity3D(ptsMeters);
  if (planarity.isPlanar1Mm && planarity.maxDeviationMm <= 0.85) {
    return [{ id: idOf('0'), kind, outer: ring3d, holes: [] }];
  }
  // 2B izdüşümde üçgenle ve 3B köşeleri koru
  const byKey = new Map<string, Pt3>();
  const ring2d: Pt2[] = ring3d.map((p) => {
    byKey.set(`${p.x},${p.y}`, p);
    return { x: p.x, y: p.y };
  });
  const tris = triangulateRing(ring2d);
  const up = signedArea2x(ring2d) > 0;
  return tris.map((t, idx) => {
    const triPts = (up ? t : ([t[0], t[2], t[1]] as const)).map((p) => byKey.get(`${p.x},${p.y}`) ?? { x: p.x, y: p.y, z: ring3d[0].z });
    return { id: idOf(`t${idx}`), kind, outer: triPts, holes: [] };
  });
}

/**
 * 2B çokgeni (oda tavanı veya BB üst kapağı) çatı zarfı düzlemlerine göre kırparak
 * 3B eğik/düz tavan (`Ceiling_` veya `Wall_`) poligonlarını üretir (§5.9 madde 3–5).
 */
export function clipCapPolygonToRoof(
  poly: Poly2,
  env: RoofEnvelope,
  zMinAllowed: number,
  kind: BrepPolygonKind,
  idOf: (role: string) => string,
): BrepPolygon[] {
  const boundaryVertices = [...poly.outer, ...poly.holes.flat()];
  const snap2D = (p: { x: number; y: number }): Pt2 => {
    const rx = Math.round(p.x);
    const ry = Math.round(p.y);
    for (const bv of boundaryVertices) {
      if (Math.abs(bv.x - rx) <= 1 && Math.abs(bv.y - ry) <= 1) return bv;
    }
    return { x: rx, y: ry };
  };

  const planes = env.planes;
  const outPolys: BrepPolygon[] = [];

  // Deliksiz ve dışbükey çokgende doğrudan halkayı yarı-düzlemlerle kırp; delikli veya içbükeyde üçgenleyerek kırp
  const isConvexOuter = poly.holes.length === 0 && isConvexRing(poly.outer);
  const basePieces: Ring2[] = isConvexOuter ? [poly.outer] : triangulatePolyWithHoles(poly);

  planes.forEach((plI, i) => {
    basePieces.forEach((piece, pi) => {
      let clipped: { x: number; y: number }[] = piece.map((p) => ({ x: p.x, y: p.y }));
      for (let j = 0; j < planes.length && clipped.length >= 3; j++) {
        if (i === j) continue;
        const plJ = planes[j];
        // plI(x, y) <= plJ(x, y)  <=>  (ax_i - ax_j)*x + (by_i - by_j)*y <= c_j - c_i
        const a = plI.ax - plJ.ax;
        const b = plI.by - plJ.by;
        const c = plJ.c - plI.c;
        if (Math.hypot(a, b) < 1e-9) {
          if (plI.c > plJ.c + 1e-6) {
            clipped = [];
            break;
          }
          continue;
        }
        clipped = clipRingByHalfPlane2D(clipped, a, b, c);
      }
      if (clipped.length < 3) return;
      const snapped2D: Pt2[] = [];
      for (const pt of clipped) {
        const s = snap2D(pt);
        if (snapped2D.length === 0 || snapped2D[snapped2D.length - 1].x !== s.x || snapped2D[snapped2D.length - 1].y !== s.y) {
          snapped2D.push(s);
        }
      }
      if (snapped2D.length > 1 && snapped2D[0].x === snapped2D[snapped2D.length - 1].x && snapped2D[0].y === snapped2D[snapped2D.length - 1].y) {
        snapped2D.pop();
      }
      if (snapped2D.length < 3 || Math.abs(signedArea2x(snapped2D)) < 200) return;
      const ccw2D = signedArea2x(snapped2D) < 0 ? [...snapped2D].reverse() : snapped2D;
      const ring3d: Pt3[] = ccw2D.map((p) => ({ x: p.x, y: p.y, z: Math.max(zMinAllowed, env.zAt(p)) }));
      outPolys.push(...ensurePlanar3DPolygons(ring3d, kind, (sub) => idOf(`p${i}_${pi}_${sub}`)));
    });
  });

  return outPolys;
}

function isConvexRing(r: Ring2): boolean {
  if (r.length < 3) return false;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    const b = r[(i + 1) % r.length];
    const c = r[(i + 2) % r.length];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (cross < 0) return false;
  }
  return true;
}

/** Delikli çokgeni köprü kenarlarla tek basit halkaya indirgeyip kulak kırpma ile üçgenler. */
function triangulatePolyWithHoles(poly: Poly2): Ring2[] {
  if (poly.holes.length === 0) {
    return triangulateRing(poly.outer);
  }
  let outer = [...poly.outer];
  const holes = [...poly.holes].sort((a, b) => Math.max(...b.map((p) => p.x)) - Math.max(...a.map((p) => p.x)));
  for (const h of holes) {
    let hi = 0;
    for (let i = 1; i < h.length; i++) {
      if (h[i].x > h[hi].x || (h[i].x === h[hi].x && h[i].y < h[hi].y)) hi = i;
    }
    const hp = h[hi];
    let bestOi = 0;
    let bestDist = Infinity;
    for (let i = 0; i < outer.length; i++) {
      const d = Math.hypot(outer[i].x - hp.x, outer[i].y - hp.y);
      if (d < bestDist) {
        bestDist = d;
        bestOi = i;
      }
    }
    const rotatedHole = [...h.slice(hi), ...h.slice(0, hi)];
    outer = [...outer.slice(0, bestOi + 1), ...rotatedHole, rotatedHole[0], outer[bestOi], ...outer.slice(bestOi + 1)];
  }
  return triangulateRing(outer).filter((t) => Math.abs(signedArea2x(t)) >= 200);
}

/**
 * İçe aktarılan eğik/çok düzlemli tavan yüzlerinden (ceilingFaces) verilen (x, y) noktasındaki
 * tavan kotunu hesaplar (kenar üzerindeki köşe eşleşmesi + düzlem enterpolasyonu).
 */
export function zAtExplicitCeilingFaces(
  pt: Pt2,
  faces: readonly { readonly outer: readonly Pt3[]; readonly holes: readonly (readonly Pt3[])[] }[],
  fallbackZ: number,
): number {
  // 1. Birebir veya ≤ 2 mm yakın köşe eşleşmesi
  for (const f of faces) {
    for (const v of f.outer) {
      if (Math.abs(v.x - pt.x) <= 2 && Math.abs(v.y - pt.y) <= 2) return v.z;
    }
  }
  // 2. Bir tavan yüzü kenarı üzerinde mi?
  for (const f of faces) {
    for (let i = 0; i < f.outer.length; i++) {
      const a = f.outer[i];
      const b = f.outer[(i + 1) % f.outer.length];
      const L = Math.hypot(b.x - a.x, b.y - a.y);
      if (L < 1) continue;
      const t = ((pt.x - a.x) * (b.x - a.x) + (pt.y - a.y) * (b.y - a.y)) / (L * L);
      const d = Math.abs((pt.x - a.x) * (b.y - a.y) - (pt.y - a.y) * (b.x - a.x)) / L;
      if (d <= 2 && t >= -1e-3 && t <= 1 + 1e-3) {
        return Math.round(a.z + Math.max(0, Math.min(1, t)) * (b.z - a.z));
      }
    }
  }
  return fallbackZ;
}
