// K08
// K69
// V-020
import { Point2D } from '../model/index.ts';

/**
 * 2B Benzerlik (Helmert) dönüşümü kontrol noktası çifti:
 * Yerel CAD `(x, y)` -> TUREF TM `(e, n)`.
 * Formül:
 *   E = a * x - b * y + tE
 *   N = b * x + a * y + tN
 */
export interface HelmertControlPair {
  readonly id: string;
  readonly localX: number;
  readonly localY: number;
  readonly targetE: number; // Y (Doğu / Easting)
  readonly targetN: number; // X (Kuzey / Northing)
}

export interface HelmertPointResidual {
  readonly id: string;
  readonly computedE: number;
  readonly computedN: number;
  readonly vE: number; // targetE - computedE (m)
  readonly vN: number; // targetN - computedN (m)
  readonly normMeters: number; // sqrt(vE^2 + vN^2) (m)
  readonly normMm: number; // normMeters * 1000 (mm)
}

export interface Helmert2DResult {
  readonly a: number;
  readonly b: number;
  readonly tE: number;
  readonly tN: number;
  readonly scale: number; // s = sqrt(a^2 + b^2)
  readonly scalePpm: number; // (scale - 1) * 1e6
  readonly rotationRad: number; // atan2(b, a)
  readonly rotationDeg: number;
  readonly rmseMeters: number;
  readonly maxResidualMm: number;
  readonly residuals: readonly HelmertPointResidual[];
}

export interface LeaveOneOutOutlierReport {
  readonly suspectPointId: string | null;
  readonly fullRmseMm: number;
  readonly bestReducedRmseMm: number;
  readonly improvementRatio: number;
  readonly byExcludedPoint: readonly {
    readonly excludedId: string;
    readonly reducedRmseMm: number;
    readonly excludedPointErrorMm: number;
  }[];
}

/**
 * En küçük kareler yöntemiyle 2B Helmert (4 parametreli benzerlik) dönüşümünü çözer (`M0 Adım 5`).
 */
export function solveHelmert2D(
  pairs: readonly HelmertControlPair[]
): Helmert2DResult {
  const n = pairs.length;
  if (n < 2) {
    throw new Error('2B Helmert dönüşümü için en az 2 kontrol noktası çifti gereklidir.');
  }

  let sumX = 0;
  let sumY = 0;
  let sumE = 0;
  let sumN = 0;
  for (const p of pairs) {
    sumX += p.localX;
    sumY += p.localY;
    sumE += p.targetE;
    sumN += p.targetN;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;
  const meanE = sumE / n;
  const meanN = sumN / n;

  let denom = 0;
  let numA = 0;
  let numB = 0;

  for (const p of pairs) {
    const dx = p.localX - meanX;
    const dy = p.localY - meanY;
    const dE = p.targetE - meanE;
    const dN = p.targetN - meanN;

    denom += dx * dx + dy * dy;
    numA += dx * dE + dy * dN;
    numB += dx * dN - dy * dE;
  }

  if (denom < 1e-12) {
    throw new Error('Kontrol noktaları çakışık (dejenere geometri); Helmert çözülemez.');
  }

  const a = numA / denom;
  const b = numB / denom;
  const tE = meanE - (a * meanX - b * meanY);
  const tN = meanN - (b * meanX + a * meanY);

  const scale = Math.hypot(a, b);
  const scalePpm = (scale - 1) * 1_000_000;
  const rotationRad = Math.atan2(b, a);
  const rotationDeg = (rotationRad * 180) / Math.PI;

  let sumSqErr = 0;
  let maxResidualMm = 0;
  const residuals: HelmertPointResidual[] = [];

  for (const p of pairs) {
    const computedE = a * p.localX - b * p.localY + tE;
    const computedN = b * p.localX + a * p.localY + tN;
    const vE = p.targetE - computedE;
    const vN = p.targetN - computedN;
    const normMeters = Math.hypot(vE, vN);
    const normMm = normMeters * 1000;

    sumSqErr += vE * vE + vN * vN;
    if (normMm > maxResidualMm) {
      maxResidualMm = normMm;
    }

    residuals.push({
      id: p.id,
      computedE,
      computedN,
      vE,
      vN,
      normMeters,
      normMm,
    });
  }

  const rmseMeters = Math.sqrt(sumSqErr / n);

  return {
    a,
    b,
    tE,
    tN,
    scale,
    scalePpm,
    rotationRad,
    rotationDeg,
    rmseMeters,
    maxResidualMm,
    residuals,
  };
}

/**
 * Tek bir yerel `(x, y)` noktasını çözülmüş Helmert parametreleriyle TUREF `(e, n)` koordinatına dönüştürür.
 */
export function transformPointHelmert2D(
  localX: number,
  localY: number,
  params: Pick<Helmert2DResult, 'a' | 'b' | 'tE' | 'tN'>
): Point2D {
  return {
    e: params.a * localX - params.b * localY + params.tE,
    n: params.b * localX + params.a * localY + params.tN,
  };
}

/**
 * `Leave-one-out` (her seferinde 1 noktayı dışarıda bırakarak) uyuşumsuz kontrol noktasını tespit eder (`M0 Adım 5`).
 * En az 3 kontrol noktası olduğunda, hangi nokta çıkarıldığında kalanların RMSE değerinin en çok düştüğünü raporlar.
 */
export function detectOutlierLeaveOneOut(
  pairs: readonly HelmertControlPair[]
): LeaveOneOutOutlierReport {
  if (pairs.length < 3) {
    throw new Error('Leave-one-out uyuşumsuz nokta tespiti için en az 3 nokta gereklidir.');
  }

  const full = solveHelmert2D(pairs);
  const fullRmseMm = full.rmseMeters * 1000;

  const byExcludedPoint: {
    readonly excludedId: string;
    readonly reducedRmseMm: number;
    readonly excludedPointErrorMm: number;
  }[] = [];

  let bestExcludedId: string | null = null;
  let bestReducedRmseMm = Number.POSITIVE_INFINITY;

  for (let i = 0; i < pairs.length; i++) {
    const excluded = pairs[i];
    const subset = pairs.filter((_, idx) => idx !== i);
    const subSolution = solveHelmert2D(subset);
    const reducedRmseMm = subSolution.rmseMeters * 1000;

    const projected = transformPointHelmert2D(
      excluded.localX,
      excluded.localY,
      subSolution
    );
    const excludedPointErrorMm =
      Math.hypot(excluded.targetE - projected.e, excluded.targetN - projected.n) *
      1000;

    byExcludedPoint.push({
      excludedId: excluded.id,
      reducedRmseMm,
      excludedPointErrorMm,
    });

    if (reducedRmseMm < bestReducedRmseMm) {
      bestReducedRmseMm = reducedRmseMm;
      bestExcludedId = excluded.id;
    }
  }

  const improvementRatio =
    bestReducedRmseMm <= 1e-9
      ? fullRmseMm > 1
        ? Number.POSITIVE_INFINITY
        : 1
      : fullRmseMm / bestReducedRmseMm;

  // Eğer RMSE > 10 mm ise ve bir noktayı çıkarınca hata en az 3 kat düşüyorsa uyuşumsuz nokta olarak işaretle
  const suspectPointId =
    fullRmseMm > 10 && improvementRatio >= 3 ? bestExcludedId : null;

  return {
    suspectPointId,
    fullRmseMm,
    bestReducedRmseMm,
    improvementRatio,
    byExcludedPoint,
  };
}
