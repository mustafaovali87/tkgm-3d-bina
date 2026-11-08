// K08
// K36
// K45a
// K50
// V-031
// V-037
// V-040
import { Point2D, Point3D } from '../model/index.ts';
import { signedArea2D } from '../math/ring.ts';

export interface TriangulatedSurfaceMeshData {
  /** Yerel merkezlenmiş 3B köşe koordinatları: [x0, y0, z0, x1, y1, z1, ...] (Three.js X=Doğu, Y=Kot(Z), Z=-Kuzey) */
  readonly positions: Float32Array;
  /** Üçgen indisleri */
  readonly indices: Uint32Array;
  /** Dış halka ve delik halkalarının kenar çizgileri (LineSegments için [xA,yA,zA, xB,yB,zB, ...]) */
  readonly boundaryLinePositions: Float32Array;
  /** Sadece iç delik (DoorLinearRing_ / WindowLinearRing_) kenar çizgileri */
  readonly holeLinePositions: Float32Array;
  /** Birim yüzey normali (TUREF [dE, dN, dZ]) */
  readonly normalTuref: readonly [number, number, number];
}

/**
 * TUREF (E=Doğu/Y, N=Kuzey/X, Z=Kot) koordinatını yerel Three.js sahne koordinatına dönüştürür (`K08`).
 * 64-bit -> 32-bit float titremesini (jitter) önlemek için bina merkezini `(originE, originN, originZ)` çıkarır:
 * - Three.js `x` = `E - originE` (Doğu +X)
 * - Three.js `y` = `Z - originZ` (Kot +Y yukarı)
 * - Three.js `z` = `-(N - originN)` (Kuzey -Z, sağ-el koordinat sistemi korunur)
 */
// K08
export function turefToLocalThree(
  pt: Point3D,
  origin: Point3D
): [number, number, number] {
  return [pt.e - origin.e, pt.z - origin.z, -(pt.n - origin.n)];
}

function stripClosingDuplicate3D(ring: readonly Point3D[]): Point3D[] {
  if (ring.length < 2) return [...ring];
  const first = ring[0];
  const last = ring[ring.length - 1];
  const dist = Math.hypot(first.e - last.e, first.n - last.n, first.z - last.z);
  return dist <= 1e-4 ? ring.slice(0, -1) : [...ring];
}

function computePolygonNormalNewell(ring: readonly Point3D[]): [number, number, number] {
  const pts = stripClosingDuplicate3D(ring);
  let nx = 0;
  let ny = 0;
  let nz = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    nx += (curr.n - next.n) * (curr.z + next.z);
    ny += (curr.z - next.z) * (curr.e + next.e);
    nz += (curr.e - next.e) * (curr.n + next.n);
  }
  // Not: TUREF'te yatay düzlem (e, n), düşey eksen z:
  let dE = 0;
  let dN = 0;
  let dZ = 0;
  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    dE += (curr.n - next.n) * (curr.z + next.z);
    dN += (curr.z - next.z) * (curr.e + next.e);
    dZ += (curr.e - next.e) * (curr.n + next.n);
  }
  const len = Math.hypot(dE, dN, dZ);
  if (len < 1e-12) return [0, 0, 1];
  return [dE / len, dN / len, dZ / len];
}

/**
 * 3B düzlemsel poligon noktalarını kendi teğet düzlemine `(u, v)` izdüşürür.
 */
function projectPointsTo2DPlane(
  points3D: readonly Point3D[],
  normal: readonly [number, number, number]
): Point2D[] {
  const [nx, ny, nz] = normal;
  // Normal ile en az paralel olan ekseni seç
  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  const az = Math.abs(nz);

  let refX = 0;
  let refY = 0;
  let refZ = 1;
  if (az >= ax && az >= ay) {
    refX = 1;
    refY = 0;
    refZ = 0;
  }

  // u = normalize(ref × normal)
  let ux = refY * nz - refZ * ny;
  let uy = refZ * nx - refX * nz;
  let uz = refX * ny - refY * nx;
  const uLen = Math.hypot(ux, uy, uz) || 1;
  ux /= uLen;
  uy /= uLen;
  uz /= uLen;

  // v = normal × u
  const vx = ny * uz - nz * uy;
  const vy = nz * ux - nx * uz;
  const vz = nx * uy - ny * ux;

  const origin = points3D[0] ?? { e: 0, n: 0, z: 0 };
  return points3D.map((p) => {
    const de = p.e - origin.e;
    const dn = p.n - origin.n;
    const dz = p.z - origin.z;
    return {
      e: de * ux + dn * uy + dz * uz,
      n: de * vx + dn * vy + dz * vz,
    };
  });
}

function cross2D(a: Point2D, b: Point2D, c: Point2D): number {
  return (b.e - a.e) * (c.n - a.n) - (b.n - a.n) * (c.e - a.e);
}

function pointInTriangle2D(p: Point2D, a: Point2D, b: Point2D, c: Point2D): boolean {
  const c1 = cross2D(a, b, p);
  const c2 = cross2D(b, c, p);
  const c3 = cross2D(c, a, p);
  const hasNeg = c1 < -1e-9 || c2 < -1e-9 || c3 < -1e-9;
  const hasPos = c1 > 1e-9 || c2 > 1e-9 || c3 > 1e-9;
  return !(hasNeg && hasPos);
}

interface IndexedVertex {
  readonly origIndex: number;
  readonly pt2D: Point2D;
}

/**
 * İç delikleri (`holes`) en sağdaki köşelerinden dış halkaya köprü (bridge) ile bağlayarak
 * tek bir basit poligon halkasına dönüştürür ve kulak kesme (ear-clipping) ile üçgenler (`K36`, `K45a`).
 */
export function triangulatePolygonWithHoles3D(
  exteriorRing: readonly Point3D[],
  interiorRings: ReadonlyArray<readonly Point3D[]>,
  originTuref: Point3D
): TriangulatedSurfaceMeshData {
  const extClean = stripClosingDuplicate3D(exteriorRing);
  const holesClean = interiorRings
    .map((h) => stripClosingDuplicate3D(h))
    .filter((h) => h.length >= 3);

  const normal = computePolygonNormalNewell(extClean);

  const allVertices3D: Point3D[] = [...extClean];
  const holeStartOffsets: number[] = [];
  for (const h of holesClean) {
    holeStartOffsets.push(allVertices3D.length);
    allVertices3D.push(...h);
  }

  const allProjected2D = projectPointsTo2DPlane(allVertices3D, normal);

  // Dış halkayı 2B düzlemde CCW yönüne normalize et
  let outerList: IndexedVertex[] = extClean.map((_, idx) => ({
    origIndex: idx,
    pt2D: allProjected2D[idx],
  }));
  if (signedArea2D(outerList.map((v) => v.pt2D)) < 0) {
    outerList.reverse();
  }

  // Delikleri CW yönüne normalize et ve en büyük X (e) değerine göre sağdan sola sırala
  const holeLists: IndexedVertex[][] = holesClean.map((h, hIdx) => {
    const offset = holeStartOffsets[hIdx];
    const list: IndexedVertex[] = h.map((_, i) => ({
      origIndex: offset + i,
      pt2D: allProjected2D[offset + i],
    }));
    if (signedArea2D(list.map((v) => v.pt2D)) > 0) {
      list.reverse();
    }
    return list;
  });

  holeLists.sort((a, b) => {
    const maxA = Math.max(...a.map((v) => v.pt2D.e));
    const maxB = Math.max(...b.map((v) => v.pt2D.e));
    return maxB - maxA;
  });

  // Her deliği dış halkadaki en yakın görünür köşeye köprüle
  for (const hole of holeLists) {
    let rightmostHoleIdx = 0;
    for (let i = 1; i < hole.length; i++) {
      if (hole[i].pt2D.e > hole[rightmostHoleIdx].pt2D.e) {
        rightmostHoleIdx = i;
      }
    }
    const holeBridgePt = hole[rightmostHoleIdx].pt2D;

    let bestOuterIdx = 0;
    let bestDistSq = Number.POSITIVE_INFINITY;
    for (let i = 0; i < outerList.length; i++) {
      const cand = outerList[i].pt2D;
      const dSq =
        (cand.e - holeBridgePt.e) * (cand.e - holeBridgePt.e) +
        (cand.n - holeBridgePt.n) * (cand.n - holeBridgePt.n);
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        bestOuterIdx = i;
      }
    }

    const orderedHole: IndexedVertex[] = [];
    for (let i = 0; i < hole.length; i++) {
      orderedHole.push(hole[(rightmostHoleIdx + i) % hole.length]);
    }

    const merged: IndexedVertex[] = [
      ...outerList.slice(0, bestOuterIdx + 1),
      ...orderedHole,
      orderedHole[0],
      outerList[bestOuterIdx],
      ...outerList.slice(bestOuterIdx + 1),
    ];
    outerList = merged;
  }

  // Ear-clipping üçgenleme
  const triangleIndices: number[] = [];
  const work = [...outerList];
  let guard = work.length * 4;

  while (work.length >= 3 && guard > 0) {
    guard--;
    if (work.length === 3) {
      triangleIndices.push(work[0].origIndex, work[1].origIndex, work[2].origIndex);
      break;
    }

    let earFound = false;
    const len = work.length;
    for (let i = 0; i < len; i++) {
      const prev = work[(i + len - 1) % len];
      const curr = work[i];
      const next = work[(i + 1) % len];

      const areaCross = cross2D(prev.pt2D, curr.pt2D, next.pt2D);
      if (areaCross <= 1e-8) continue;

      let containsOther = false;
      for (let j = 0; j < len; j++) {
        const cand = work[j];
        if (
          cand.origIndex === prev.origIndex ||
          cand.origIndex === curr.origIndex ||
          cand.origIndex === next.origIndex
        ) {
          continue;
        }
        if (pointInTriangle2D(cand.pt2D, prev.pt2D, curr.pt2D, next.pt2D)) {
          containsOther = true;
          break;
        }
      }

      if (!containsOther) {
        triangleIndices.push(prev.origIndex, curr.origIndex, next.origIndex);
        work.splice(i, 1);
        earFound = true;
        break;
      }
    }

    if (!earFound) {
      // Dejenere veya çok yakın köprü köşelerinde güvenli fan fallback
      for (let i = 1; i + 1 < work.length; i++) {
        triangleIndices.push(
          work[0].origIndex,
          work[i].origIndex,
          work[i + 1].origIndex
        );
      }
      break;
    }
  }

  // Three.js yerel koordinat dizisi
  const positions = new Float32Array(allVertices3D.length * 3);
  for (let i = 0; i < allVertices3D.length; i++) {
    const [lx, ly, lz] = turefToLocalThree(allVertices3D[i], originTuref);
    positions[i * 3] = lx;
    positions[i * 3 + 1] = ly;
    positions[i * 3 + 2] = lz;
  }

  // Sınır çizgileri (dış halka + delik halkaları)
  const boundarySegments: number[] = [];
  const holeSegments: number[] = [];

  const appendRingSegments = (ring: readonly Point3D[], target: number[]) => {
    for (let i = 0; i < ring.length; i++) {
      const a = turefToLocalThree(ring[i], originTuref);
      const b = turefToLocalThree(ring[(i + 1) % ring.length], originTuref);
      target.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
  };

  if (extClean.length >= 2) {
    appendRingSegments(extClean, boundarySegments);
  }
  for (const h of holesClean) {
    appendRingSegments(h, boundarySegments);
    appendRingSegments(h, holeSegments);
  }

  return {
    positions,
    indices: new Uint32Array(triangleIndices),
    boundaryLinePositions: new Float32Array(boundarySegments),
    holeLinePositions: new Float32Array(holeSegments),
    normalTuref: normal,
  };
}
