// M8 — Çatı arası kesimi ve eğik tavan üretimi (şartname §5.9, §5.12).
// Saf TypeScript: parametrik (beşik/kırma/tek eğim) veya elle (manual) çatı düzlemleriyle
// oda prizmalarını, iç yapıları (BBKIY/OAIY), BB küvetlerini ve kat duvarlarını keser.
// Tüm ortak kenarlar aynı tamsayı mm (x, y, z) köşelerini paylaşır; kapalı kabuk (checkShell) ve
// düzlemsellik (V-032 ≤ 1 mm) korunur.
import { pointInPoly, ringBounds, signedArea2x, triangulateRing } from '../design/geometry2d.ts';
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

/** Katta çatı arası kesimi veya kat tavanını aşan çatı arası odası/BB var mı? */
export function isAtticStorey(building: DesignBuilding, storey: Storey): boolean {
  const zCeil = storey.zBottom + storey.height;
  if (storey.clipToRoof || storey.kneeWallHeight !== undefined) return true;
  if (
    building.sectionParts.some(
      (sp) =>
        sp.storeyId === storey.id &&
        (sp.clipToRoof ||
          sp.usage === 1004 ||
          (sp.zFloorOverride !== undefined && sp.zFloorOverride >= zCeil - 1) ||
          (sp.zTopOverride !== undefined && sp.zTopOverride > zCeil + 1)),
    )
  ) {
    return true;
  }
  if (
    building.parts.some(
      (p) =>
        p.storeyId === storey.id &&
        (p.clipToRoof ||
          Boolean(p.ceilingFaces && p.ceilingFaces.length > 0) ||
          (p.zFloorOverride !== undefined && p.zFloorOverride >= zCeil - 1) ||
          (p.zTopOverride !== undefined && p.zTopOverride > zCeil + 1)),
    )
  ) {
    return true;
  }
  const roof = building.roof;
  if (!roof || roof.mode === 'flat') return false;
  if (roof.eaveZ !== undefined && roof.eaveZ < zCeil) return true;
  return false;
}

/** Çatı arası kesimi olan binada parametrik çatının oturacağı saçak (RoofEdge) kotu. */
export function resolveRoofEdgeZ(building: DesignBuilding): number {
  const topStorey = building.storeys[building.storeys.length - 1];
  if (!topStorey) return 0;
  const roof = building.roof;
  if (roof?.eaveZ !== undefined) return roof.eaveZ;
  if (
    roof &&
    roof.mode !== 'flat' &&
    roof.mode !== 'manual' &&
    (topStorey.clipToRoof ||
      topStorey.kneeWallHeight !== undefined ||
      building.sectionParts.some((sp) => sp.storeyId === topStorey.id && (sp.clipToRoof || sp.usage === 1004)) ||
      building.parts.some((p) => p.storeyId === topStorey.id && p.clipToRoof))
  ) {
    const knee = topStorey.kneeWallHeight ?? 1200;
    return topStorey.zBottom + topStorey.slabThickness + knee;
  }
  return topStorey.zBottom + topStorey.height;
}

/** Kat için çatı üst sınır zarfını (düzlemler kümesi) oluşturur. Kesim yoksa null döner. */
export function buildRoofEnvelope(building: DesignBuilding, storey: Storey): RoofEnvelope | null {
  if (!isAtticStorey(building, storey)) return null;
  const roof = building.roof;
  const baseZCeil = storey.zBottom + storey.height;
  let maxExtraZ = baseZCeil;
  if (roof?.facets) {
    for (const f of roof.facets) {
      for (const v of f.outer) {
        if (v.z > maxExtraZ) maxExtraZ = v.z;
      }
    }
  }
  const stParts = building.parts.filter((p) => p.storeyId === storey.id);
  const stSps = building.sectionParts.filter((sp) => sp.storeyId === storey.id);
  for (const p of stParts) {
    if (p.zTopOverride !== undefined && p.zTopOverride > maxExtraZ) maxExtraZ = p.zTopOverride;
    if (p.zFloorOverride !== undefined && p.zFloorOverride >= baseZCeil - 1) {
      const cand = p.zFloorOverride + (storey.height - storey.slabThickness);
      if (cand > maxExtraZ) maxExtraZ = cand;
    }
    if (p.ceilingFaces) {
      for (const f of p.ceilingFaces) {
        for (const v of f.outer) {
          if (v.z > maxExtraZ) maxExtraZ = v.z;
        }
      }
    }
  }
  for (const sp of stSps) {
    if (sp.zTopOverride !== undefined && sp.zTopOverride > maxExtraZ) maxExtraZ = sp.zTopOverride;
    if (sp.zFloorOverride !== undefined && sp.zFloorOverride >= baseZCeil - 1) {
      const cand = sp.zFloorOverride + storey.height;
      if (cand > maxExtraZ) maxExtraZ = cand;
    }
  }
  const zCeiling = Math.max(baseZCeil, maxExtraZ);
  const zFloorTop = storey.zBottom + storey.slabThickness;
  const knee = storey.kneeWallHeight ?? 1200;
  const zEave = roof?.eaveZ ?? zFloorTop + knee;

  const allPts = [
    ...storey.outline.flatMap((pl) => pl.outer),
    ...stSps.flatMap((sp) => sp.outline.outer),
    ...stParts.flatMap((p) => p.polygon.outer),
  ];
  if (allPts.length < 3) return null;
  const b = ringBounds(allPts);
  const ov = Math.max(0, roof?.eaveOverhang ?? 0);
  const minX = b.minX - ov;
  const maxX = b.maxX + ov;
  const minY = b.minY - ov;
  const maxY = b.maxY + ov;
  const dx = maxX - minX;
  const dy = maxY - minY;
  const slope = Math.tan((Math.max(1, Math.min(75, roof?.pitchDeg || 30)) * Math.PI) / 180);

  const planes: LinearRoofPlane[] = [{ id: 'flat_ceiling', ax: 0, by: 0, c: zCeiling }];
  const explicitPartCeilings = stParts.flatMap((p) => p.ceilingFaces ?? []);

  if (roof?.mode === 'gable') {
    if (dx >= dy) {
      planes.push({ id: 'slope_s', ax: 0, by: slope, c: zEave - slope * minY });
      planes.push({ id: 'slope_n', ax: 0, by: -slope, c: zEave + slope * maxY });
    } else {
      planes.push({ id: 'slope_w', ax: slope, by: 0, c: zEave - slope * minX });
      planes.push({ id: 'slope_e', ax: -slope, by: 0, c: zEave + slope * maxX });
    }
  } else if (roof?.mode === 'hip') {
    planes.push({ id: 'slope_s', ax: 0, by: slope, c: zEave - slope * minY });
    planes.push({ id: 'slope_n', ax: 0, by: -slope, c: zEave + slope * maxY });
    planes.push({ id: 'slope_w', ax: slope, by: 0, c: zEave - slope * minX });
    planes.push({ id: 'slope_e', ax: -slope, by: 0, c: zEave + slope * maxX });
  } else if (roof?.mode === 'shed') {
    if (dx >= dy) {
      planes.push({ id: 'slope_s', ax: 0, by: slope, c: zEave - slope * minY });
    } else {
      planes.push({ id: 'slope_w', ax: slope, by: 0, c: zEave - slope * minX });
    }
  } else if (roof?.mode === 'manual' && roof.facets && roof.facets.length > 0) {
    roof.facets.forEach((f, idx) => {
      const plane = fitLinearPlane(f.outer, `manual_${idx}`, true);
      if (plane) planes.push(plane);
    });
  } else if (explicitPartCeilings.length > 0) {
    explicitPartCeilings.forEach((f, idx) => {
      const plane = fitLinearPlane(f.outer, `ceil_${idx}`, true);
      if (plane) planes.push(plane);
    });
  }

  if (planes.length <= 1 && zCeiling <= baseZCeil) return null;

  const manualFacets =
    roof?.mode === 'manual' && roof.facets && roof.facets.length > 0
      ? roof.facets.map((f) => ({ outer: f.outer, holes: f.holes }))
      : explicitPartCeilings;

  const zAt = (p: Pt2): number => {
    if (manualFacets.length > 0 && (roof?.mode === 'manual' || !roof || roof.mode === 'flat')) {
      return Math.min(zCeiling, zAtExplicitCeilingFaces(p, manualFacets, zCeiling));
    }
    let minZ = zCeiling;
    for (const pl of planes) {
      const z = pl.ax * p.x + pl.by * p.y + pl.c;
      if (z < minZ) minZ = z;
    }
    return Math.round(minZ);
  };

  return { storeyId: storey.id, zEave, zCeiling, planes, zAt };
}

function fitLinearPlane(pts: readonly Pt3[], id: string, allowHorizontal = false): LinearRoofPlane | null {
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
  if (Math.abs(nz) <= 1e-3) return null;
  if (!allowHorizontal && nz <= 1e-3) return null;
  const ax = -nx / nz;
  const by = -ny / nz;
  if (!allowHorizontal && Math.hypot(ax, by) < 1e-4) return null;
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
  // Çok yüzlü elle (manual) çatıda yüzlerce düzlem çifti ilgisiz kesişim üretmesin
  if (planes.length > 8) return out;
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
  zMaxCap?: number,
): BrepPolygon[] {
  const capZ = zMaxCap ?? env.zCeiling;
  const boundaryVertices = [...poly.outer, ...poly.holes.flat()];
  const snap2D = (p: { x: number; y: number }): Pt2 => {
    const rx = Math.round(p.x);
    const ry = Math.round(p.y);
    for (const bv of boundaryVertices) {
      if (Math.abs(bv.x - rx) <= 1 && Math.abs(bv.y - ry) <= 1) return bv;
    }
    return { x: rx, y: ry };
  };

  // Çok yüzlü (> 8 düzlem) elle çatıda veya konveks olmayan çok düzlemli zarfta doğrudan üçgenleyip zAt ile yükselt
  const planes = env.planes.map((pl) => (pl.id === 'flat_ceiling' ? { ...pl, c: capZ } : pl));
  const outPolys: BrepPolygon[] = [];

  if (planes.length > 8) {
    const tris = triangulatePolyWithHoles(poly);
    tris.forEach((tri, ti) => {
      const ccw2D = signedArea2x(tri) < 0 ? [...tri].reverse() : tri;
      const ring3d: Pt3[] = ccw2D.map((p) => ({ x: p.x, y: p.y, z: Math.max(zMinAllowed, Math.min(capZ, env.zAt(p))) }));
      outPolys.push(...ensurePlanar3DPolygons(ring3d, kind, (sub) => idOf(`tri_${ti}_${sub}`)));
    });
    return outPolys;
  }

  const isConvexOuter = poly.holes.length === 0 && isConvexRing(poly.outer);
  const basePieces: Ring2[] = isConvexOuter ? [poly.outer] : triangulatePolyWithHoles(poly);

  planes.forEach((plI, i) => {
    basePieces.forEach((piece, pi) => {
      let clipped: { x: number; y: number }[] = piece.map((p) => ({ x: p.x, y: p.y }));
      for (let j = 0; j < planes.length && clipped.length >= 3; j++) {
        if (i === j) continue;
        const plJ = planes[j];
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
      const ring3d: Pt3[] = ccw2D.map((p) => ({ x: p.x, y: p.y, z: Math.max(zMinAllowed, Math.min(capZ, env.zAt(p))) }));
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
 * tavan kotunu hesaplar (köşe eşleşmesi + kenar enterpolasyonu + 2B iç nokta düzlem hesabı + en yakın kenar).
 */
export function zAtExplicitCeilingFaces(
  pt: Pt2,
  faces: readonly { readonly outer: readonly Pt3[]; readonly holes: readonly (readonly Pt3[])[] }[],
  fallbackZ: number,
): number {
  // 1. Birebir veya ≤ 3 mm yakın köşe eşleşmesi
  let bestVertDist = Infinity;
  let bestVertZ: number | null = null;
  for (const f of faces) {
    for (const r of [f.outer, ...f.holes]) {
      for (const v of r) {
        const d = Math.hypot(v.x - pt.x, v.y - pt.y);
        if (d <= 3 && (d < bestVertDist - 0.1 || (Math.abs(d - bestVertDist) <= 0.1 && (bestVertZ === null || v.z > bestVertZ)))) {
          bestVertDist = d;
          bestVertZ = v.z;
        }
      }
    }
  }
  if (bestVertZ !== null) return bestVertZ;

  // 2. Bir tavan yüzü kenarı üzerinde mi (≤ 4 mm)?
  let bestEdgeDist = Infinity;
  let bestEdgeZ: number | null = null;
  for (const f of faces) {
    for (const r of [f.outer, ...f.holes]) {
      for (let i = 0; i < r.length; i++) {
        const a = r[i];
        const b = r[(i + 1) % r.length];
        const L = Math.hypot(b.x - a.x, b.y - a.y);
        if (L < 1) continue;
        const t = ((pt.x - a.x) * (b.x - a.x) + (pt.y - a.y) * (b.y - a.y)) / (L * L);
        const d = Math.abs((pt.x - a.x) * (b.y - a.y) - (pt.y - a.y) * (b.x - a.x)) / L;
        if (d <= 4 && t >= -0.01 && t <= 1.01 && d < bestEdgeDist) {
          bestEdgeDist = d;
          bestEdgeZ = Math.round(a.z + Math.max(0, Math.min(1, t)) * (b.z - a.z));
        }
      }
    }
  }
  if (bestEdgeZ !== null) return bestEdgeZ;

  // 3. 2B izdüşümü pt noktasını içeren tavan yüzünün düzlemi
  for (const f of faces) {
    const outer2: Pt2[] = f.outer.map((v) => ({ x: v.x, y: v.y }));
    const holes2: Pt2[][] = f.holes.map((h) => h.map((v) => ({ x: v.x, y: v.y })));
    if (outer2.length >= 3 && pointInPoly(pt, { outer: outer2, holes: holes2 }) >= 0) {
      const pl = fitLinearPlane(f.outer, 'f', true);
      if (pl) return Math.round(pl.ax * pt.x + pl.by * pt.y + pl.c);
    }
  }

  // 4. En yakın kenar üzerinde enterpolasyon
  let nearestDist = Infinity;
  let nearestZ = fallbackZ;
  for (const f of faces) {
    for (let i = 0; i < f.outer.length; i++) {
      const a = f.outer[i];
      const b = f.outer[(i + 1) % f.outer.length];
      const L2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
      const t = L2 === 0 ? 0 : Math.max(0, Math.min(1, ((pt.x - a.x) * (b.x - a.x) + (pt.y - a.y) * (b.y - a.y)) / L2));
      const px = a.x + t * (b.x - a.x);
      const py = a.y + t * (b.y - a.y);
      const d = Math.hypot(pt.x - px, pt.y - py);
      if (d < nearestDist) {
        nearestDist = d;
        nearestZ = Math.round(a.z + t * (b.z - a.z));
      }
    }
  }
  return nearestZ;
}

export interface ExplicitCeilingPreparation {
  readonly alignedFaces: { readonly outer: Pt3[]; readonly holes: Pt3[][] }[];
  /** Duvar parçası a → b için b'den a'ya doğru sıralı 3B üst profil zinciri. */
  readonly topProfileForEdge: (a: Pt2, b: Pt2) => Pt3[];
  readonly zAt: (pt: Pt2) => number;
}

/**
 * İçe aktarılmış tavan yüzlerini (`ceilingFaces`) oda taban poligonuna (`poly`) hizalar:
 * - Tavan dış sınır köşelerini ≤ 3 mm içindeki oda köşe ve kenarlarına oturtur,
 * - Oda köşelerinin üzerine düşen tavan kenarlarını o köşede böler,
 * - Her oda duvar kenarı (a → b) için tavanın eşleşmemiş dış sınır yarı-kenarlarını (b → ... → a)
 *   takip eden 3B tepe profilini üretir. Böylece duvar ve tavan yüzleri birebir aynı 3B köşeleri paylaşır.
 */
export function prepareExplicitCeilingForPoly(
  poly: Poly2,
  faces: readonly { readonly outer: readonly Pt3[]; readonly holes: readonly (readonly Pt3[])[] }[],
  fallbackZ: number,
): ExplicitCeilingPreparation {
  const rings2D: Ring2[] = [poly.outer, ...poly.holes];
  const corners: Pt2[] = rings2D.flat();
  const polyEdges: { a: Pt2; b: Pt2; L: number; ux: number; uy: number }[] = [];
  for (const r of rings2D) {
    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      const L = Math.hypot(b.x - a.x, b.y - a.y);
      if (L >= 1) polyEdges.push({ a, b, L, ux: (b.x - a.x) / L, uy: (b.y - a.y) / L });
    }
  }

  const snapPt3 = (v: Pt3): Pt3 => {
    for (const c of corners) {
      if (Math.hypot(v.x - c.x, v.y - c.y) <= 3) return { x: c.x, y: c.y, z: v.z };
    }
    let bestE: { x: number; y: number; d: number } | null = null;
    for (const e of polyEdges) {
      const wx = v.x - e.a.x;
      const wy = v.y - e.a.y;
      const t = wx * e.ux + wy * e.uy;
      const d = Math.abs(wx * e.uy - wy * e.ux);
      if (d <= 3 && t >= 0 && t <= e.L && (!bestE || d < bestE.d)) {
        bestE = { x: Math.round(e.a.x + e.ux * t), y: Math.round(e.a.y + e.uy * t), d };
      }
    }
    if (bestE) return { x: bestE.x, y: bestE.y, z: v.z };
    return v;
  };

  const dedup3 = (r: readonly Pt3[]): Pt3[] => {
    const out: Pt3[] = [];
    for (const p of r) {
      if (!out.length || out[out.length - 1].x !== p.x || out[out.length - 1].y !== p.y || out[out.length - 1].z !== p.z) {
        out.push(p);
      }
    }
    if (out.length > 1 && out[0].x === out[out.length - 1].x && out[0].y === out[out.length - 1].y && out[0].z === out[out.length - 1].z) {
      out.pop();
    }
    return out;
  };

  // Tavan yüzleri oda dışına (yukarı) bakmalı (§5.1 madde 4). Bazı kaynak dosyalarda (Ornek2) tüm yüzler ters
  // yönlü yazılmış; ters yüzün sınır kenarları duvar kenarıyla aynı yönde ilerlemediği için tepe profili bulunamıyor
  // ve kabuk açık kalıyordu (KONTROL-M9 R2). Newell normalinin z bileşeni negatifse halkalar ters çevrilir.
  const newellZ = (r: readonly Pt3[]) => {
    let z = 0;
    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      z += (a.x - b.x) * (a.y + b.y);
    }
    return z;
  };
  const orientedFaces = faces.map((f) =>
    newellZ(f.outer) < 0 ? { outer: [...f.outer].reverse(), holes: f.holes.map((h) => [...h].reverse()) } : { outer: [...f.outer], holes: f.holes.map((h) => [...h]) },
  );
  // Komşu tavan yüzlerinde aynı köşe kaynakta birkaç mm farkla yazılmış olabilir (Ornek2 8_Oda: 3 mm). Oturtmadan önce
  // < 5 mm (plan) ve ≤ 2 mm (kot) yakın köşeler tek temsilciye birleştirilir; yoksa iki yüz arasında ince yarık kalır.
  // 5 mm, en kısa kenar sınırının (10 mm, V-038) yarısıdır; gerçekten ayrı iki köşe bu kadar yakın olamaz.
  const reps: Pt3[] = [];
  const unify = (v: Pt3): Pt3 => {
    for (const r of reps) if (Math.hypot(v.x - r.x, v.y - r.y) < 5 && Math.abs(v.z - r.z) <= 2) return r;
    reps.push(v);
    return v;
  };
  const unifiedFaces = orientedFaces.map((f) => ({ outer: f.outer.map(unify), holes: f.holes.map((h) => h.map(unify)) }));
  const snapCache = new Map<Pt3, Pt3>();
  const snapOnce = (v: Pt3): Pt3 => {
    let s = snapCache.get(v);
    if (!s) {
      s = snapPt3(v);
      snapCache.set(v, s);
    }
    return s;
  };
  // Birleştirme sonrası çizgiye dönüşen (alanı ~0) ince tavan parçaları atılır: kenarları komşu yüzlerin kenarıyla
  // üst üste biner ve kabukta "fazla kullanılan kenar" üretir (Ornek2 8_Oda). Eşik 100 mm² (1 cm²).
  const area3 = (r: readonly Pt3[]) => {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      x += (a.y - b.y) * (a.z + b.z);
      y += (a.z - b.z) * (a.x + b.x);
      z += (a.x - b.x) * (a.y + b.y);
    }
    return Math.hypot(x, y, z) / 2;
  };
  let snappedFaces = unifiedFaces
    .map((f) => ({
      outer: dedup3(f.outer.map(snapOnce)),
      holes: f.holes.map((h) => dedup3(h.map(snapOnce))).filter((h) => h.length >= 3 && area3(h) >= 100),
    }))
    .filter((f) => f.outer.length >= 3 && area3(f.outer) >= 100);

  // Oda köşeleri veya diğer tavan köşeleri bir tavan kenarının (u → w) ortasına düşüyorsa o kenarı böl
  const allCeilVerts = new Map<string, Pt3>();
  for (const f of snappedFaces) {
    for (const r of [f.outer, ...f.holes]) {
      for (const v of r) allCeilVerts.set(`${v.x},${v.y},${v.z}`, v);
    }
  }
  const splitRing3 = (r: readonly Pt3[]): Pt3[] => {
    const out: Pt3[] = [];
    for (let i = 0; i < r.length; i++) {
      const u = r[i];
      const w = r[(i + 1) % r.length];
      out.push(u);
      const dx = w.x - u.x;
      const dy = w.y - u.y;
      const L2d = Math.hypot(dx, dy);
      if (L2d < 2) continue;
      const mids: { t: number; p: Pt3 }[] = [];
      for (const c of corners) {
        const wx = c.x - u.x;
        const wy = c.y - u.y;
        const t = (wx * dx + wy * dy) / L2d;
        const d = Math.abs(wx * dy - wy * dx) / L2d;
        if (d <= 2 && t > 2 && t < L2d - 2) {
          const z = Math.round(u.z + (t / L2d) * (w.z - u.z));
          mids.push({ t, p: { x: c.x, y: c.y, z } });
        }
      }
      for (const v of allCeilVerts.values()) {
        const wx = v.x - u.x;
        const wy = v.y - u.y;
        const t = (wx * dx + wy * dy) / L2d;
        const d = Math.abs(wx * dy - wy * dx) / L2d;
        if (d <= 1 && t > 1 && t < L2d - 1) {
          const zLine = u.z + (t / L2d) * (w.z - u.z);
          if (Math.abs(v.z - zLine) <= 1.5 && !mids.some((m) => Math.abs(m.t - t) <= 1 && Math.abs(m.p.z - v.z) <= 1)) {
            mids.push({ t, p: v });
          }
        }
      }
      mids.sort((a, b) => a.t - b.t);
      for (const m of mids) out.push(m.p);
    }
    return dedup3(out);
  };

  snappedFaces = snappedFaces.map((f) => ({
    outer: splitRing3(f.outer),
    holes: f.holes.map(splitRing3),
  }));

  const zAt = (pt: Pt2) => zAtExplicitCeilingFaces(pt, snappedFaces, fallbackZ);

  // Eşleşmemiş yönlü 3B tavan kenarlarını bul (iç kenarlar birbirini götürür)
  const k3 = (p: Pt3) => `${p.x},${p.y},${p.z}`;
  const dirCounts = new Map<string, { u: Pt3; w: Pt3; count: number }>();
  for (const f of snappedFaces) {
    for (const r of [f.outer, ...f.holes]) {
      for (let i = 0; i < r.length; i++) {
        const u = r[i];
        const w = r[(i + 1) % r.length];
        const key = `${k3(u)}->${k3(w)}`;
        const cur = dirCounts.get(key);
        if (cur) cur.count++;
        else dirCounts.set(key, { u, w, count: 1 });
      }
    }
  }
  const unmatchedEdges: { u: Pt3; w: Pt3 }[] = [];
  for (const { u, w, count } of dirCounts.values()) {
    const rev = dirCounts.get(`${k3(w)}->${k3(u)}`)?.count ?? 0;
    for (let k = 0; k < count - rev; k++) unmatchedEdges.push({ u, w });
  }

  // Her halka kenarı (a → b) için tavan sınır zincirini oluştur ve komşu kenarlarla köşelerde bağla
  const edgeChains = new Map<string, Pt3[]>();
  const edgeKey = (a: Pt2, b: Pt2) => `${a.x},${a.y}->${b.x},${b.y}`;
  const usedUnmatched = new Set<number>();

  for (const r of rings2D) {
    if (r.length < 3) continue;
    const chainsForRing: Pt3[][] = [];
    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      const L = Math.hypot(b.x - a.x, b.y - a.y);
      const ux = L > 0 ? (b.x - a.x) / L : 1;
      const uy = L > 0 ? (b.y - a.y) / L : 0;
      const tOf = (p: { x: number; y: number }) => (p.x - a.x) * ux + (p.y - a.y) * uy;
      const dOf = (p: { x: number; y: number }) => Math.abs((p.x - a.x) * uy - (p.y - a.y) * ux);

      // Bu kenara ait 2B ilerleyen eşleşmemiş tavan kenarları
      const localEdges: { idx: number; u: Pt3; w: Pt3; tu: number; tw: number }[] = [];
      unmatchedEdges.forEach(({ u, w }, idx) => {
        if (usedUnmatched.has(idx)) return;
        const isVert = u.x === w.x && u.y === w.y;
        if (isVert) return;
        const du = dOf(u);
        const dw = dOf(w);
        const tu = tOf(u);
        const tw = tOf(w);
        if (du <= 3 && dw <= 3 && tu >= -3 && tw <= L + 3 && tw - tu >= 0.5) {
          localEdges.push({ idx, u, w, tu, tw });
        }
      });
      localEdges.forEach((le) => usedUnmatched.add(le.idx));

      // Bu kenar üzerindeki dikey adım kenarlarını da (u.x === w.x && u.y === w.y) ekle
      unmatchedEdges.forEach(({ u, w }, idx) => {
        if (usedUnmatched.has(idx)) return;
        if (u.x !== w.x || u.y !== w.y) return;
        const d = dOf(u);
        const t = tOf(u);
        if (d <= 2 && t >= -1 && t <= L + 1) {
          // Bu dikey kenar localEdges içindeki bir köşeyle bağlantılıysa veya kenarın içindeyse ekle
          const connects = localEdges.some((le) => k3(le.w) === k3(u) || k3(le.u) === k3(w));
          if (connects || (t > 1 && t < L - 1)) {
            localEdges.push({ idx, u, w, tu: t, tw: t });
            usedUnmatched.add(idx);
          }
        }
      });

      // Yönlü 3B bağlantıyı (u → w) takip ederek zincirle
      localEdges.sort((m, n) => m.tu - n.tu || m.tw - n.tw);
      const orderedPts: Pt3[] = [];
      const visited = new Set<number>();
      while (visited.size < localEdges.length) {
        // Henüz ziyaret edilmemiş ve başka bir ziyaret edilmemiş kenarın bitişi olmayan en küçük tu'lu kenarı seç
        let startIdx = -1;
        for (let k = 0; k < localEdges.length; k++) {
          if (visited.has(k)) continue;
          const hasPred = localEdges.some((other, ok) => !visited.has(ok) && ok !== k && k3(other.w) === k3(localEdges[k].u));
          if (!hasPred) {
            startIdx = k;
            break;
          }
        }
        if (startIdx < 0) {
          startIdx = localEdges.findIndex((_, k) => !visited.has(k));
        }
        let cur = startIdx;
        while (cur >= 0 && !visited.has(cur)) {
          visited.add(cur);
          const seg = localEdges[cur];
          if (orderedPts.length === 0 || k3(orderedPts[orderedPts.length - 1]) !== k3(seg.u)) {
            orderedPts.push(seg.u);
          }
          orderedPts.push(seg.w);
          cur = localEdges.findIndex((next, nk) => !visited.has(nk) && k3(next.u) === k3(seg.w));
        }
      }

      if (orderedPts.length === 0 || Math.hypot(orderedPts[0].x - a.x, orderedPts[0].y - a.y) > 2) {
        orderedPts.unshift({ x: a.x, y: a.y, z: zAt(a) });
      } else {
        orderedPts[0] = { x: a.x, y: a.y, z: orderedPts[0].z };
      }
      const last = orderedPts[orderedPts.length - 1];
      if (Math.hypot(last.x - b.x, last.y - b.y) > 2) {
        orderedPts.push({ x: b.x, y: b.y, z: zAt(b) });
      } else {
        orderedPts[orderedPts.length - 1] = { x: b.x, y: b.y, z: last.z };
      }
      chainsForRing.push(dedup3(orderedPts));
    }

    // Komşu duvarların köşe dikey kenarlarının (b@z0 ↔ P_top) birebir kapanması için köşe Z uyumu
    for (let i = 0; i < chainsForRing.length; i++) {
      const curChain = chainsForRing[i];
      const nextChain = chainsForRing[(i + 1) % chainsForRing.length];
      const endPt = curChain[curChain.length - 1];
      const startNext = nextChain[0];
      if (endPt.x === startNext.x && endPt.y === startNext.y && endPt.z !== startNext.z) {
        curChain.push(startNext);
      }
    }

    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      edgeChains.set(edgeKey(a, b), chainsForRing[i]);
    }
  }

  const topProfileForEdge = (a: Pt2, b: Pt2): Pt3[] => {
    const exact = edgeChains.get(edgeKey(a, b));
    if (exact && exact.length >= 2) {
      return [...exact].reverse();
    }
    const L = Math.hypot(b.x - a.x, b.y - a.y);
    if (L < 1) return [{ x: a.x, y: a.y, z: zAt(a) }];
    const ux = (b.x - a.x) / L;
    const uy = (b.y - a.y) / L;
    for (const r of rings2D) {
      for (let i = 0; i < r.length; i++) {
        const ra = r[i];
        const rb = r[(i + 1) % r.length];
        const rL = Math.hypot(rb.x - ra.x, rb.y - ra.y);
        if (rL < 1) continue;
        const rux = (rb.x - ra.x) / rL;
        const ruy = (rb.y - ra.y) / rL;
        if (ux * rux + uy * ruy < 0.999) continue;
        const da = Math.abs((a.x - ra.x) * ruy - (a.y - ra.y) * rux);
        const db = Math.abs((b.x - ra.x) * ruy - (b.y - ra.y) * rux);
        const ta = (a.x - ra.x) * rux + (a.y - ra.y) * ruy;
        const tb = (b.x - ra.x) * rux + (b.y - ra.y) * ruy;
        if (da <= 2 && db <= 2 && ta >= -2 && tb <= rL + 2 && tb > ta) {
          const full = edgeChains.get(edgeKey(ra, rb)) ?? [];
          const mids = full.filter((p) => {
            const tp = (p.x - ra.x) * rux + (p.y - ra.y) * ruy;
            return tp > ta + 2 && tp < tb - 2;
          });
          const chain: Pt3[] = [{ x: a.x, y: a.y, z: zAt(a) }, ...mids, { x: b.x, y: b.y, z: zAt(b) }];
          return dedup3(chain).reverse();
        }
      }
    }
    return [
      { x: b.x, y: b.y, z: zAt(b) },
      { x: a.x, y: a.y, z: zAt(a) },
    ];
  };

  return { alignedFaces: snappedFaces, topProfileForEdge, zAt };
}
