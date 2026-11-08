// M7 — Raster Mimari Proje Kalibrasyonu (şartname §8.1: 2 nokta hizalama, ayrı X/Y ölçek + kontrol ölçüsü, çok noktalı afin dönüşüm).
// Saf TypeScript; DOM, React veya Node bağımlılığı yoktur.
import type { Pt2 } from '../design/types.ts';

export interface PixelPt {
  readonly u: number; // sağa doğru piksel (0..width)
  readonly v: number; // aşağı doğru piksel (0..height)
}

export interface RasterAxisMeasurement {
  readonly id: string;
  readonly axis: 'X' | 'Y';
  readonly p1: PixelPt;
  readonly p2: PixelPt;
  /** Kullanıcının girdiği gerçek uzunluk (metre, örn. 4.35). */
  readonly declaredMeters: number;
}

export interface RasterCheckMeasurement {
  readonly p1: PixelPt;
  readonly p2: PixelPt;
  readonly declaredMeters: number;
}

export interface RasterAxisCalibrationResult {
  readonly rotationDeg: number;
  readonly scaleXMmPerPx: number;
  readonly scaleYMmPerPx: number;
  readonly anisotropyRatio: number; // scaleX / scaleY
  readonly axisResidualsMm: readonly {
    readonly id: string;
    readonly axis: 'X' | 'Y';
    readonly pixelSpan: number;
    readonly declaredMm: number;
    readonly computedMm: number;
    readonly residualMm: number;
  }[];
  readonly checkResidualMm: number | null;
  readonly maxResidualMm: number;
}

export interface RasterControlPointPair {
  readonly id: string;
  readonly pixel: PixelPt;
  readonly targetMm: Pt2; // Tasarım düzlemi (x, y) mm
}

/**
 * 2B Afin Dönüşüm (6 parametre):
 *   x = m00 * u + m01 * v + tx
 *   y = m10 * u + m11 * v + ty
 */
export interface RasterAffine2DResult {
  readonly m00: number;
  readonly m01: number;
  readonly tx: number;
  readonly m10: number;
  readonly m11: number;
  readonly ty: number;
  readonly scaleXMmPerPx: number;
  readonly scaleYMmPerPx: number;
  readonly rotationDeg: number;
  readonly rmseMm: number;
  readonly maxResidualMm: number;
  readonly residuals: readonly {
    readonly id: string;
    readonly computedMm: Pt2;
    readonly residualMm: number;
  }[];
}

/**
 * İki piksel noktası (`p1 -> p2`) ile yatay referans çizgisi arasındaki döndürme açısını hesaplar (`§8.1`).
 * Not: Görüntü koordinatlarında `v` aşağı yönlü olduğu için tasarım düzleminde `dy = -(p2.v - p1.v)` alınır.
 */
export function computeTwoPointAlignmentAngle(p1: PixelPt, p2: PixelPt): {
  readonly angleRad: number;
  readonly angleDeg: number;
} {
  const du = p2.u - p1.u;
  const dvUp = -(p2.v - p1.v);
  if (Math.hypot(du, dvUp) < 1e-9) {
    throw new Error('Hizalama için seçilen iki piksel noktası çakışık olamaz.');
  }
  const angleRad = -Math.atan2(dvUp, du);
  return {
    angleRad,
    angleDeg: (angleRad * 180) / Math.PI,
  };
}

/**
 * Piksel noktasını verilen açıyla döndürür (`u'` sağa, `vUp'` yukarı).
 */
function rotatePixelToAligned(p: PixelPt, rotationRad: number): { readonly xPx: number; readonly yPx: number } {
  const c = Math.cos(rotationRad);
  const s = Math.sin(rotationRad);
  const u = p.u;
  const vUp = -p.v;
  return {
    xPx: c * u - s * vUp,
    yPx: s * u + c * vUp,
  };
}

/**
 * Şartname §8.1 [REHBER] ölçekleme kalibrasyonu:
 * - En az 2 yatay (`X`) + 2 dikey (`Y`) ölçü ile ayrı `scaleXMmPerPx` ve `scaleYMmPerPx` (en küçük kareler, orijinden geçen doğrusal ölçek) hesaplar.
 * - İsteğe bağlı 3. bir kontrol ölçüsüyle (`checkMeasurement`) kalan hatayı raporlar.
 */
// K76
export function calibrateRasterAxes(
  measurements: readonly RasterAxisMeasurement[],
  options: {
    readonly alignmentLine?: { readonly p1: PixelPt; readonly p2: PixelPt };
    readonly checkMeasurement?: RasterCheckMeasurement;
  } = {}
): RasterAxisCalibrationResult {
  const xMeas = measurements.filter((m) => m.axis === 'X');
  const yMeas = measurements.filter((m) => m.axis === 'Y');

  if (xMeas.length < 2 || yMeas.length < 2) {
    throw new Error('Raster kalibrasyonu için en az 2 yatay (X) ve 2 dikey (Y) ölçü gereklidir (§8.1).');
  }

  const rotationRad = options.alignmentLine
    ? computeTwoPointAlignmentAngle(options.alignmentLine.p1, options.alignmentLine.p2).angleRad
    : 0;
  const rotationDeg = (rotationRad * 180) / Math.PI;

  const solveAxisScale = (list: readonly RasterAxisMeasurement[], axis: 'X' | 'Y'): number => {
    let sumPxSq = 0;
    let sumPxMm = 0;
    for (const m of list) {
      if (m.declaredMeters <= 0 || !Number.isFinite(m.declaredMeters)) {
        throw new Error(`Ölçü (${m.id}) uzunluğu pozitif olmalıdır.`);
      }
      const a1 = rotatePixelToAligned(m.p1, rotationRad);
      const a2 = rotatePixelToAligned(m.p2, rotationRad);
      const spanPx =
        axis === 'X'
          ? Math.hypot(a2.xPx - a1.xPx, a2.yPx - a1.yPx)
          : Math.hypot(a2.xPx - a1.xPx, a2.yPx - a1.yPx);
      if (spanPx < 1e-6) {
        throw new Error(`Ölçü (${m.id}) piksel mesafesi sıfır.`);
      }
      const mm = m.declaredMeters * 1000;
      sumPxSq += spanPx * spanPx;
      sumPxMm += spanPx * mm;
    }
    return sumPxMm / sumPxSq;
  };

  const scaleXMmPerPx = solveAxisScale(xMeas, 'X');
  const scaleYMmPerPx = solveAxisScale(yMeas, 'Y');

  let maxResidualMm = 0;
  const axisResidualsMm = measurements.map((m) => {
    const a1 = rotatePixelToAligned(m.p1, rotationRad);
    const a2 = rotatePixelToAligned(m.p2, rotationRad);
    const pixelSpan = Math.hypot(a2.xPx - a1.xPx, a2.yPx - a1.yPx);
    const scale = m.axis === 'X' ? scaleXMmPerPx : scaleYMmPerPx;
    const declaredMm = m.declaredMeters * 1000;
    const computedMm = pixelSpan * scale;
    const residualMm = Math.abs(declaredMm - computedMm);
    if (residualMm > maxResidualMm) maxResidualMm = residualMm;
    return {
      id: m.id,
      axis: m.axis,
      pixelSpan,
      declaredMm,
      computedMm,
      residualMm,
    };
  });

  let checkResidualMm: number | null = null;
  if (options.checkMeasurement) {
    const cm = options.checkMeasurement;
    const a1 = rotatePixelToAligned(cm.p1, rotationRad);
    const a2 = rotatePixelToAligned(cm.p2, rotationRad);
    const dxMm = (a2.xPx - a1.xPx) * scaleXMmPerPx;
    const dyMm = (a2.yPx - a1.yPx) * scaleYMmPerPx;
    const computedMm = Math.hypot(dxMm, dyMm);
    checkResidualMm = Math.abs(cm.declaredMeters * 1000 - computedMm);
    if (checkResidualMm > maxResidualMm) maxResidualMm = checkResidualMm;
  }

  return {
    rotationDeg,
    scaleXMmPerPx,
    scaleYMmPerPx,
    anisotropyRatio: scaleXMmPerPx / scaleYMmPerPx,
    axisResidualsMm,
    checkResidualMm,
    maxResidualMm,
  };
}

/**
 * 3x3 doğrusal denklem sistemini (Gauss-Jordan pivotlu) çözer.
 */
function solveLinear3x3(A: number[][], b: number[]): [number, number, number] {
  const M = [
    [A[0][0], A[0][1], A[0][2], b[0]],
    [A[1][0], A[1][1], A[1][2], b[1]],
    [A[2][0], A[2][1], A[2][2], b[2]],
  ];

  for (let col = 0; col < 3; col++) {
    let pivotRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < 3; row++) {
      const v = Math.abs(M[row][col]);
      if (v > maxVal) {
        maxVal = v;
        pivotRow = row;
      }
    }
    if (maxVal < 1e-12) {
      throw new Error('Kontrol noktaları doğrusal (kolineer); 2B afin dönüşüm çözülemez.');
    }
    if (pivotRow !== col) {
      const tmp = M[col];
      M[col] = M[pivotRow];
      M[pivotRow] = tmp;
    }
    const piv = M[col][col];
    for (let j = col; j < 4; j++) M[col][j] /= piv;
    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      for (let j = col; j < 4; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }
  return [M[0][3], M[1][3], M[2][3]];
}

/**
 * Çok noktalı (`>= 3` nokta, önerilen `>= 4` köşe — `§8.1`) 2B afin dönüşümünü en küçük kareler yöntemiyle çözer.
 */
// K76
export function solveRasterAffine2D(
  pairs: readonly RasterControlPointPair[]
): RasterAffine2DResult {
  if (pairs.length < 3) {
    throw new Error('2B afin kalibrasyonu için en az 3 doğrusal olmayan kontrol noktası gereklidir (§8.1).');
  }

  let suu = 0, suv = 0, su1 = 0;
  let svv = 0, sv1 = 0, s11 = 0;
  let sux = 0, svx = 0, s1x = 0;
  let suy = 0, svy = 0, s1y = 0;

  for (const p of pairs) {
    const u = p.pixel.u;
    const v = p.pixel.v;
    const x = p.targetMm.x;
    const y = p.targetMm.y;

    suu += u * u;
    suv += u * v;
    su1 += u;
    svv += v * v;
    sv1 += v;
    s11 += 1;

    sux += u * x;
    svx += v * x;
    s1x += x;

    suy += u * y;
    svy += v * y;
    s1y += y;
  }

  const normalMatrix = [
    [suu, suv, su1],
    [suv, svv, sv1],
    [su1, sv1, s11],
  ];

  const [m00, m01, tx] = solveLinear3x3(normalMatrix, [sux, svx, s1x]);
  const [m10, m11, ty] = solveLinear3x3(normalMatrix, [suy, svy, s1y]);

  const scaleXMmPerPx = Math.hypot(m00, m10);
  const scaleYMmPerPx = Math.hypot(m01, m11);
  const rotationDeg = (Math.atan2(m10, m00) * 180) / Math.PI;

  let sumSq = 0;
  let maxResidualMm = 0;
  const residuals = pairs.map((p) => {
    const cx = Math.round(m00 * p.pixel.u + m01 * p.pixel.v + tx);
    const cy = Math.round(m10 * p.pixel.u + m11 * p.pixel.v + ty);
    const err = Math.hypot(p.targetMm.x - cx, p.targetMm.y - cy);
    sumSq += err * err;
    if (err > maxResidualMm) maxResidualMm = err;
    return {
      id: p.id,
      computedMm: { x: cx, y: cy },
      residualMm: err,
    };
  });

  return {
    m00,
    m01,
    tx,
    m10,
    m11,
    ty,
    scaleXMmPerPx,
    scaleYMmPerPx,
    rotationDeg,
    rmseMm: Math.sqrt(sumSq / pairs.length),
    maxResidualMm,
    residuals,
  };
}

/**
 * Bir piksel noktasını çözülmüş afin dönüşümle tasarım düzlemi `Pt2` (mm tamsayı) noktasına dönüştürür (`// K76`).
 */
// K76
export function transformPixelToDesignMm(
  pixel: PixelPt,
  affine: Pick<RasterAffine2DResult, 'm00' | 'm01' | 'tx' | 'm10' | 'm11' | 'ty'>
): Pt2 {
  return {
    x: Math.round(affine.m00 * pixel.u + affine.m01 * pixel.v + affine.tx),
    y: Math.round(affine.m10 * pixel.u + affine.m11 * pixel.v + affine.ty),
  };
}
