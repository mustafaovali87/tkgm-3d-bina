// K36
// K45a
// K50
// V-031
// V-032
// V-033
// V-037
// V-040
// V-042a
// V-042b
import { Point2D, Point3D, ValidationIssue } from '../model/index.ts';

export type RingOrientation = 'CCW' | 'CW' | 'DEGENERATE';

/**
 * 2B Shoelace formülü ile işaretli poligon alanı hesaplar (`// K36`, `// K50`).
 * - Pozitif (`> 0`): Saat yönünün tersi (`CCW`)
 * - Negatif (`< 0`): Saat yönü (`CW`)
 * Not: Halka kapalı (ilk nokta = son nokta) veya açık olarak verilebilir; her iki durumda da doğru alanı verir.
 */
// K36
// K50
export function signedArea2D(ring: readonly Point2D[]): number {
  const n = ring.length;
  if (n < 3) return 0;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    const curr = ring[i];
    const next = ring[(i + 1) % n];
    sum += curr.e * next.n - next.e * curr.n;
  }
  return sum / 2;
}

/**
 * Halka yönünü (`CCW` / `CW` / `DEGENERATE`) belirler (`// K50`, `// V-040`).
 */
// K50
// V-040
export function ringOrientation2D(
  ring: readonly Point2D[],
  epsilon = 1e-9
): RingOrientation {
  const area = signedArea2D(ring);
  if (Math.abs(area) <= epsilon) {
    return 'DEGENERATE';
  }
  return area > 0 ? 'CCW' : 'CW';
}

/**
 * Dış halka ve iç delik halkalarından oluşan 2B poligonun net alanını hesaplar (`// K36`).
 */
// K36
export function polygonNetArea2D(
  exterior: readonly Point2D[],
  interiors: readonly (readonly Point2D[])[] = []
): number {
  let net = Math.abs(signedArea2D(exterior));
  for (const hole of interiors) {
    net -= Math.abs(signedArea2D(hole));
  }
  return Math.max(0, net);
}

/**
 * Halkanın kapalı olup olmadığını (`V-033`), en az 3 eşsiz noktaya sahip olduğunu (`V-031`)
 * ve ardışık eşit nokta bulunmadığını (`V-032`) denetler.
 */
// V-031
// V-032
// V-033
export function validateRingTopology3D(
  ring: readonly Point3D[],
  ringGmlId?: string,
  toleranceMeters = 1e-6
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (ring.length < 4) {
    issues.push({
      ruleId: 'V-031',
      severity: 'H',
      message: `${ringGmlId ?? 'LinearRing'} 3'ten daha az eşsiz noktaya sahip (toplam pos sayısı: ${ring.length}, beklenen >= 4).`,
      targetGmlId: ringGmlId,
    });
    return issues;
  }

  const first = ring[0];
  const last = ring[ring.length - 1];
  const closeDist = Math.hypot(
    first.e - last.e,
    first.n - last.n,
    first.z - last.z
  );
  if (closeDist > toleranceMeters) {
    issues.push({
      ruleId: 'V-033',
      severity: 'H',
      message: `${ringGmlId ?? 'LinearRing'} kapalı değil (ilk ve son nokta farkı: ${(closeDist * 1000).toFixed(2)} mm).`,
      targetGmlId: ringGmlId,
    });
  }

  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i];
    const b = ring[i + 1];
    const d = Math.hypot(a.e - b.e, a.n - b.n, a.z - b.z);
    if (d <= toleranceMeters) {
      issues.push({
        ruleId: 'V-032',
        severity: 'H',
        message: `${ringGmlId ?? 'LinearRing'} içinde ardışık eşit nokta tespit edildi (indeks ${i} ve ${i + 1}).`,
        targetGmlId: ringGmlId,
      });
      break;
    }
  }

  return issues;
}

export interface Planarity3DResult {
  readonly normal: { readonly nx: number; readonly ny: number; readonly nz: number };
  readonly maxDeviationMeters: number;
  readonly maxDeviationMm: number;
  readonly isPlanar1Mm: boolean;
  readonly isPlanar10Mm: boolean;
}

/**
 * Newell yöntemiyle 3B halkanın birim normal vektörünü ve düzlemden maksimum sapmasını (`V-037`) hesaplar.
 */
// K50
// V-037
export function analyzeRingPlanarity3D(ring: readonly Point3D[]): Planarity3DResult {
  const pts =
    ring.length >= 2 &&
    Math.hypot(
      ring[0].e - ring[ring.length - 1].e,
      ring[0].n - ring[ring.length - 1].n,
      ring[0].z - ring[ring.length - 1].z
    ) < 1e-6
      ? ring.slice(0, -1)
      : ring;

  const n = pts.length;
  if (n < 3) {
    return {
      normal: { nx: 0, ny: 0, nz: 0 },
      maxDeviationMeters: 0,
      maxDeviationMm: 0,
      isPlanar1Mm: true,
      isPlanar10Mm: true,
    };
  }

  let nx = 0;
  let ny = 0;
  let nz = 0;
  let cx = 0;
  let cy = 0;
  let cz = 0;

  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    nx += (curr.n - next.n) * (curr.z + next.z);
    ny += (curr.z - next.z) * (curr.e + next.e);
    nz += (curr.e - next.e) * (curr.n + next.n);
    cx += curr.e;
    cy += curr.n;
    cz += curr.z;
  }

  const len = Math.hypot(nx, ny, nz);
  if (len <= 1e-12) {
    return {
      normal: { nx: 0, ny: 0, nz: 0 },
      maxDeviationMeters: 0,
      maxDeviationMm: 0,
      isPlanar1Mm: false,
      isPlanar10Mm: false,
    };
  }

  const unx = nx / len;
  const uny = ny / len;
  const unz = nz / len;
  cx /= n;
  cy /= n;
  cz /= n;

  let maxDev = 0;
  for (const p of pts) {
    const dev = Math.abs(
      (p.e - cx) * unx + (p.n - cy) * uny + (p.z - cz) * unz
    );
    if (dev > maxDev) {
      maxDev = dev;
    }
  }

  const maxDeviationMm = maxDev * 1000;
  return {
    normal: { nx: unx, ny: uny, nz: unz },
    maxDeviationMeters: maxDev,
    maxDeviationMm,
    isPlanar1Mm: maxDeviationMm <= 1.0,
    isPlanar10Mm: maxDeviationMm <= 10.0,
  };
}

/**
 * 2B noktadan doğru parçasına (`a - b`) en kısa öklid mesafesini hesaplar.
 */
export function distancePointToSegment2D(
  p: Point2D,
  a: Point2D,
  b: Point2D
): number {
  const dx = b.e - a.e;
  const dy = b.n - a.n;
  const lenSq = dx * dx + dy * dy;
  if (lenSq <= 1e-12) {
    return Math.hypot(p.e - a.e, p.n - a.n);
  }
  const t = Math.max(
    0,
    Math.min(1, ((p.e - a.e) * dx + (p.n - a.n) * dy) / lenSq)
  );
  const projE = a.e + t * dx;
  const projN = a.n + t * dy;
  return Math.hypot(p.e - projE, p.n - projN);
}

/**
 * İç halka (delik — örn. kapı/pencere) ile dış poligon halkası arasındaki minimum mesafeyi
 * milimetre cinsinden hesaplar ve `K45a`, `V-042a`, `V-042b` kurallarını denetler.
 * - `< 1 mm`: `V-042a HATA (H)` (delik dış halkaya değiyor)
 * - `1 mm <= d < 10 mm`: `V-042b BİLGİ (B)`
 * - `>= 10 mm`: Tam uyumlu (`K45a`)
 */
// K45a
// V-042a
// V-042b
export function checkHoleToOuterRingClearance2D(
  outerRing: readonly Point2D[],
  holeRing: readonly Point2D[],
  holeGmlId?: string
): {
  readonly minDistanceMeters: number;
  readonly minDistanceMm: number;
  readonly issue: ValidationIssue | null;
} {
  let minDist = Number.POSITIVE_INFINITY;

  for (const hp of holeRing) {
    for (let i = 0; i < outerRing.length; i++) {
      const a = outerRing[i];
      const b = outerRing[(i + 1) % outerRing.length];
      const d = distancePointToSegment2D(hp, a, b);
      if (d < minDist) {
        minDist = d;
      }
    }
  }

  for (const op of outerRing) {
    for (let i = 0; i < holeRing.length; i++) {
      const a = holeRing[i];
      const b = holeRing[(i + 1) % holeRing.length];
      const d = distancePointToSegment2D(op, a, b);
      if (d < minDist) {
        minDist = d;
      }
    }
  }

  const minDistanceMm = minDist * 1000;

  if (minDistanceMm < 1.0) {
    return {
      minDistanceMeters: minDist,
      minDistanceMm,
      issue: {
        ruleId: 'V-042a',
        severity: 'H',
        message: `İç halka (${holeGmlId ?? 'delik'}) dış poligon sınırına değiyor (min mesafe: ${minDistanceMm.toFixed(2)} mm < 1 mm).`,
        targetGmlId: holeGmlId,
      },
    };
  }

  if (minDistanceMm < 10.0) {
    return {
      minDistanceMeters: minDist,
      minDistanceMm,
      issue: {
        ruleId: 'V-042b',
        severity: 'B',
        message: `İç halka (${holeGmlId ?? 'delik'}) ile dış halka arasındaki mesafe 10 mm'den dar (${minDistanceMm.toFixed(2)} mm).`,
        targetGmlId: holeGmlId,
      },
    };
  }

  return {
    minDistanceMeters: minDist,
    minDistanceMm,
    issue: null,
  };
}
