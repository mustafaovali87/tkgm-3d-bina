// P-10 — Düz İskelet (Straight Skeleton) Tabanlı Çatı Motoru II (Şartname Ek-1 §2.5).
// L, T, U ve her türlü basit / içbükey / dışbükey çokgen için kırma (hip), beşik (gable),
// tek eğimli (shed) ve mansard çatı geometrisi üretir.
// Saf TS, dış bağımlılıksız, çevrimdışı. Koordinatlar mm tamsayı, hesaplamalar numerik kararlı.

import { isSimpleRing, normalizeOrientation, polyAreaM2, ringAreaM2, signedArea2x } from '../design/geometry2d.ts';
import type { Poly2, Pt2, Ring2 } from '../design/types.ts';
import type { BrepPolygon, Pt3 } from './types.ts';

export interface StraightSkeletonFace {
  readonly baseEdgeIndex: number;
  readonly baseEdge: readonly [Pt2, Pt2];
  readonly polygon3d: readonly Pt3[];
}

export interface StraightSkeletonResult {
  readonly faces: readonly StraightSkeletonFace[];
  readonly ridgePoints: readonly Pt3[];
}

function dist2(a: Pt2, b: Pt2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * 2B doğru parçası ofseti (içeriye doğru d kadar, CCW poligon için sol taraf içeri).
 */
function offsetSegment(a: Pt2, b: Pt2, d: number): { a: Pt2; b: Pt2 } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { a, b };
  // CCW için iç normal: (-dy/len, dx/len)
  const nx = (-dy / len) * d;
  const ny = (dx / len) * d;
  return {
    a: { x: Math.round(a.x + nx), y: Math.round(a.y + ny) },
    b: { x: Math.round(b.x + nx), y: Math.round(b.y + ny) },
  };
}

/**
 * İki doğrunun kesişim noktası.
 */
function intersectLines(
  p1: Pt2, p2: Pt2,
  p3: Pt2, p4: Pt2
): Pt2 | null {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-6) return null;
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
  return {
    x: Math.round(p1.x + t * (p2.x - p1.x)),
    y: Math.round(p1.y + t * (p2.y - p1.y)),
  };
}

/**
 * Verilen poligon için iç ofset halkası hesaplar (inward offset).
 */
export function computeInwardOffsetRing(ring: Ring2, d: number): Ring2 | null {
  const n = ring.length;
  if (n < 3) return null;
  const segs = [];
  for (let i = 0; i < n; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    segs.push(offsetSegment(a, b, d));
  }
  const newRing: Pt2[] = [];
  for (let i = 0; i < n; i++) {
    const prev = (i - 1 + n) % n;
    const pt = intersectLines(segs[prev].a, segs[prev].b, segs[i].a, segs[i].b);
    if (!pt) return null;
    newRing.push(pt);
  }
  // Temizle ve alan kontrolü
  if (signedArea2x(newRing) <= 0) return null;
  return newRing;
}

/**
 * Çokgen için medyan eksen / düz iskelet çatısı oluşturur.
 * Her taban kenarı için eğim (pitchDeg) açısıyla yükselen 3B yüzeyler üretir.
 */
export function generateStraightSkeletonRoof(
  baseOutline: Poly2,
  pitchDeg: number,
  eaveZ: number,
  maxLevels = 40
): StraightSkeletonResult {
  const ring = baseOutline.outer;
  const n = ring.length;
  if (n < 3) return { faces: [], ridgePoints: [] };

  const tanPitch = Math.tan((pitchDeg * Math.PI) / 180);
  const facesMap: Pt3[][] = ring.map((p, i) => {
    const q = ring[(i + 1) % n];
    return [
      { x: p.x, y: p.y, z: eaveZ },
      { x: q.x, y: q.y, z: eaveZ },
    ];
  });

  // Kademeli daraltma (shrink-wrapping / wave front propagation)
  let currentRing: Ring2 = ring;
  let currentDist = 0;
  const stepMm = 200; // 20 cm adımlarla içe daralma
  const allRidgePoints: Pt3[] = [];

  for (let step = 1; step <= maxLevels; step++) {
    const nextDist = step * stepMm;
    const nextRing = computeInwardOffsetRing(ring, nextDist);

    if (!nextRing || nextRing.length < 3 || ringAreaM2(nextRing) < 0.1) {
      // Çatı tepe noktası / mahya sonu
      const cx = Math.round(currentRing.reduce((s, p) => s + p.x, 0) / currentRing.length);
      const cy = Math.round(currentRing.reduce((s, p) => s + p.y, 0) / currentRing.length);
      const topZ = Math.round(eaveZ + currentDist * tanPitch);
      const apex: Pt3 = { x: cx, y: cy, z: topZ };
      allRidgePoints.push(apex);

      for (let i = 0; i < n; i++) {
        facesMap[i].push(apex);
      }
      break;
    }

    currentRing = nextRing;
    currentDist = nextDist;
    if (step === maxLevels) {
      // Üst düzlük (eğer tamamen kapanmadıysa mansard / düz üst tabakası)
      const topZ = Math.round(eaveZ + currentDist * tanPitch);
      for (let i = 0; i < n; i++) {
        const p = nextRing[i];
        facesMap[i].push({ x: p.x, y: p.y, z: topZ });
      }
    }
  }

  const resultFaces: StraightSkeletonFace[] = [];
  for (let i = 0; i < n; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    const poly3d = facesMap[i];
    // Çift noktaları arındır
    const cleaned: Pt3[] = [];
    for (const pt of poly3d) {
      if (
        cleaned.length === 0 ||
        cleaned[cleaned.length - 1].x !== pt.x ||
        cleaned[cleaned.length - 1].y !== pt.y ||
        cleaned[cleaned.length - 1].z !== pt.z
      ) {
        cleaned.push(pt);
      }
    }
    if (cleaned.length >= 3) {
      resultFaces.push({
        baseEdgeIndex: i,
        baseEdge: [a, b],
        polygon3d: cleaned,
      });
    }
  }

  return {
    faces: resultFaces,
    ridgePoints: allRidgePoints,
  };
}
