// P-07 — Bakı yönü (independentSectionCardinalDirection) otomatik hesaplama algoritması.
// Şartname Ek-1 §2.4: Kat sınırındaki dış cephe kenarları bulunur, dış normali ve azimutu hesaplanır,
// 8 ana yöne (1001..1008) yuvarlanır veya cephe yoksa 1009 (Kapalı Cephe) atanır.
// Saf TS, dış bağımlılıksız.

import type { DesignBuilding, SectionPart, Pt2, Ring2, Poly2 } from './types.ts';

/**
 * 8 Yön Kod Listesi (TKGM standardı):
 * 1001 Kuzey [-22.5, 22.5)
 * 1002 Kuzeydoğu [22.5, 67.5)
 * 1003 Doğu [67.5, 112.5)
 * 1004 Güneydoğu [112.5, 157.5)
 * 1005 Güney [157.5, 202.5)
 * 1006 Güneybatı [202.5, 247.5)
 * 1007 Batı [247.5, 292.5)
 * 1008 Kuzeybatı [292.5, 337.5)
 * 1009 Kapalı Cephe
 */
export function azimuthToCardinalDirection(degrees: number): number {
  let deg = ((degrees % 360) + 360) % 360;
  if (deg >= 337.5 || deg < 22.5) return 1001; // Kuzey
  if (deg >= 22.5 && deg < 67.5) return 1002;  // Kuzeydoğu
  if (deg >= 67.5 && deg < 112.5) return 1003; // Doğu
  if (deg >= 112.5 && deg < 157.5) return 1004; // Güneydoğu
  if (deg >= 157.5 && deg < 202.5) return 1005; // Güney
  if (deg >= 202.5 && deg < 247.5) return 1006; // Güneybatı
  if (deg >= 247.5 && deg < 292.5) return 1007; // Batı
  return 1008; // Kuzeybatı
}

function dist2(a: Pt2, b: Pt2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function pointToSegmentDistance(p: Pt2, a: Pt2, b: Pt2): number {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return dist2(p, a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
}

function isSegmentOnOutline(s1: Pt2, s2: Pt2, outlines: readonly Poly2[], toleranceMm = 20): boolean {
  const mid: Pt2 = { x: (s1.x + s2.x) / 2, y: (s1.y + s2.y) / 2 };
  for (const poly of outlines) {
    const ring = poly.outer;
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % n];
      const d1 = pointToSegmentDistance(s1, a, b);
      const d2 = pointToSegmentDistance(s2, a, b);
      const dMid = pointToSegmentDistance(mid, a, b);
      if (d1 <= toleranceMm && d2 <= toleranceMm && dMid <= toleranceMm) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Tek bir BB parçası için dış cephe kenarlarından bakı yönlerini hesaplar.
 */
export function computeSectionPartCardinalDirections(
  part: SectionPart,
  storeyOutlines: readonly Poly2[]
): readonly number[] {
  const ring = part.outline.outer;
  const n = ring.length;
  if (n < 3) return [1009];

  const directions = new Set<number>();
  for (let i = 0; i < n; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    const len = dist2(a, b);
    // Şartname: uzunluğu ≥ 0.5 m (500 mm) olan dış cephe kenarları
    if (len < 500) continue;

    if (isSegmentOnOutline(a, b, storeyOutlines, 50)) {
      // CCW halka için kenarın dış normali: n = (u.y, -u.x)
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      const nx = uy;
      const ny = -ux;
      // Azimut (Kuzeyden saat yönünde derece): atan2(nx, ny)
      let azRad = Math.atan2(nx, ny);
      let azDeg = (azRad * 180) / Math.PI;
      if (azDeg < 0) azDeg += 360;
      directions.add(azimuthToCardinalDirection(azDeg));
    }
  }

  if (directions.size === 0) {
    return [1009];
  }

  return Array.from(directions).sort((a, b) => a - b);
}

/**
 * Binadaki tüm BB parçaları için bakı yönü eşlemesi üretir.
 */
export function recommendBuildingCardinalDirections(
  building: DesignBuilding
): Record<string, readonly number[]> {
  const result: Record<string, readonly number[]> = {};
  const storeysById = new Map(building.storeys.map(s => [s.id, s]));

  for (const sp of building.sectionParts) {
    const storey = storeysById.get(sp.storeyId);
    const outlines = storey ? storey.outline : [];
    result[sp.id] = computeSectionPartCardinalDirections(sp, outlines);
  }

  return result;
}
