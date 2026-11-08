// M7 — Konumlandırma ve Helmert Sihirbazı (şartname §7.3, §8.2, K06, K07, K08, K54, K76, V-019, V-020).
// Saf TypeScript; DOM, React veya Node bağımlılığı yoktur.
import {
  detectOutlierLeaveOneOut,
  Helmert2DResult,
  HelmertControlPair,
  LeaveOneOutOutlierReport,
  solveHelmert2D,
  transformPointHelmert2D,
} from '../math/helmert2d.ts';
import type {
  DesignBuilding,
  DesignProject,
  Georef,
  Poly2,
  Pt2,
  Pt3,
  Ring2,
} from '../design/types.ts';

export type TurefEpsgCode = Georef['epsg'];

export interface SurveyPoint3D {
  readonly id: string;
  readonly e: number; // Y (Doğu / Easting, m)
  readonly n: number; // X (Kuzey / Northing, m)
  readonly z: number; // Ortometrik kot (m)
}

export interface EpsgSuggestion {
  readonly dom: 27 | 30 | 33 | 36 | 39 | 42 | 45;
  readonly epsg: TurefEpsgCode;
  readonly proj4Def: string;
}

export interface GeorefValidationIssue {
  readonly code: string;
  readonly severity: 'H' | 'U' | 'B';
  readonly message: string;
  readonly pointId?: string;
}

export interface HelmertWizardConfig {
  readonly pairs: readonly HelmertControlPair[];
  readonly surveyPoints?: readonly SurveyPoint3D[];
  readonly epsg: TurefEpsgCode;
  readonly zeroElevationOrthometricMm: number;
  /** Nokta başına izin verilen maksimum artık (varsayılan: 50 mm = 5 cm, şartname §7.3). */
  readonly maxResidualThresholdMm?: number;
  /** Ölçek sapması uyarı eşiği ppm (varsayılan: 500 ppm = %0.05). */
  readonly maxScalePpmWarning?: number;
}

export interface HelmertWizardReport {
  readonly helmert: Helmert2DResult;
  readonly outlierReport: LeaveOneOutOutlierReport | null;
  readonly georef: Georef;
  readonly ticPointsMm: readonly Pt3[];
  readonly thresholdMm: number;
  readonly exceedsThreshold: boolean;
  readonly issues: readonly GeorefValidationIssue[];
}

const DOM_TO_EPSG: Readonly<Record<number, TurefEpsgCode>> = {
  27: 5253,
  30: 5254,
  33: 5255,
  36: 5256,
  39: 5257,
  42: 5258,
  45: 5259,
};

const EPSG_TO_DOM: Readonly<Record<TurefEpsgCode, 27 | 30 | 33 | 36 | 39 | 42 | 45>> = {
  5253: 27,
  5254: 30,
  5255: 33,
  5256: 36,
  5257: 39,
  5258: 42,
  5259: 45,
};

/**
 * EPSG koduna karşılık gelen dilim orta meridyenini (DOM) ve proj4 tanımını döndürür (`// K07`, `§8.3`).
 */
// K07
export function getEpsgMetadata(epsg: TurefEpsgCode): EpsgSuggestion {
  const dom = EPSG_TO_DOM[epsg];
  return {
    dom,
    epsg,
    proj4Def: `+proj=tmerc +lat_0=0 +lon_0=${dom} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0 +units=m +no_defs`,
  };
}

/**
 * Parsel boylamından (`λ`, derece) TUREF TM 3° dilim orta meridyenini (`DOM = 27 + 3·round((λ − 27)/3)`)
 * ve `EPSG:5253…5259` kodunu önerir (`// K07`, `// V-019`, `§7.3`).
 */
// K07
// V-019
export function suggestEpsgFromLongitude(longitudeDeg: number): EpsgSuggestion {
  if (!Number.isFinite(longitudeDeg)) {
    throw new Error('Geçersiz boylam değeri.');
  }
  const rawDom = 27 + 3 * Math.round((longitudeDeg - 27) / 3);
  const clampedDom = Math.min(45, Math.max(27, rawDom)) as 27 | 30 | 33 | 36 | 39 | 42 | 45;
  const epsg = DOM_TO_EPSG[clampedDom] ?? 5254;
  return getEpsgMetadata(epsg);
}

/**
 * Koordinatın TUREF TM geçerli aralığında (`300000 < E < 700000`, `2500000 < N < 5000000`) olup olmadığını denetler (`// K08`, `// V-020`).
 */
// K08
// V-020
export function isValidTurefCoord(e: number, n: number): boolean {
  return Number.isFinite(e) && Number.isFinite(n) && e > 300_000 && e < 700_000 && n > 2_500_000 && n < 5_000_000;
}

/**
 * CSV, TSV veya boşluk ayrılmış metinden yapı aplikasyon köşelerini (`id, Y(E), X(N), Z`) ayrıştırır (`§7.3`).
 * - 3 sütun (`E N Z`) veya 4 sütun (`ID E N Z`) desteklenir.
 * - Başlık satırı varsa otomatik atlanır.
 */
// K54
export function parseSurveyPointsText(text: string): SurveyPoint3D[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  const result: SurveyPoint3D[] = [];
  for (let i = 0; i < lines.length; i++) {
    const rawCols = lines[i]
      .split(/[;\t,]+|\s+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (rawCols.length < 3) continue;

    const toNum = (s: string) => Number(s.replace(',', '.'));
    if (rawCols.length >= 4) {
      const e = toNum(rawCols[1]);
      const n = toNum(rawCols[2]);
      const z = toNum(rawCols[3]);
      if (!Number.isFinite(e) || !Number.isFinite(n) || !Number.isFinite(z)) {
        if (i === 0) continue; // başlık satırı
        throw new Error(`Satır ${i + 1}: geçersiz sayısal koordinat ("${lines[i]}").`);
      }
      result.push({ id: rawCols[0], e, n, z });
    } else {
      const e = toNum(rawCols[0]);
      const n = toNum(rawCols[1]);
      const z = toNum(rawCols[2]);
      if (!Number.isFinite(e) || !Number.isFinite(n) || !Number.isFinite(z)) {
        if (i === 0) continue; // başlık satırı
        throw new Error(`Satır ${i + 1}: geçersiz sayısal koordinat ("${lines[i]}").`);
      }
      result.push({ id: `P${result.length + 1}`, e, n, z });
    }
  }
  return result;
}

/**
 * TUREF koordinat kümesinden yerel kökeni (`originE`, `originN` — tam metre, `§4.1`) hesaplar (`// K76`).
 */
// K76
export function computeOriginFromTurefPoints(
  points: readonly { readonly e: number; readonly n: number }[],
  epsg: TurefEpsgCode,
  zeroElevationOrthometricMm: number
): Georef {
  if (points.length === 0) {
    return {
      epsg,
      originE: 500_000,
      originN: 4_000_000,
      zeroElevationOrthometric: Math.round(zeroElevationOrthometricMm),
    };
  }
  let minE = Number.POSITIVE_INFINITY;
  let minN = Number.POSITIVE_INFINITY;
  for (const p of points) {
    if (p.e < minE) minE = p.e;
    if (p.n < minN) minN = p.n;
  }
  return {
    epsg,
    originE: Math.floor(minE),
    originN: Math.floor(minN),
    zeroElevationOrthometric: Math.round(zeroElevationOrthometricMm),
  };
}

/**
 * Yapı aplikasyon 3B köşelerini (`SurveyPoint3D[]`) tasarım modelinin yerel mm `TIC` (`Pt3[]`) dizisine çevirir (`// K54`, `§7.3`).
 */
// K54
// K76
export function surveyPointsToTic(
  surveyPoints: readonly SurveyPoint3D[],
  georef: Pick<Georef, 'originE' | 'originN'>
): Pt3[] {
  return surveyPoints.map((p) => ({
    x: Math.round((p.e - georef.originE) * 1000),
    y: Math.round((p.n - georef.originN) * 1000),
    z: Math.round(p.z * 1000),
  }));
}

/**
 * 2B Helmert konumlandırma sihirbazını çalıştırır (`§7.3`, `// K08`, `// K54`, `// K69`, `// K76`, `// V-019`, `// V-020`):
 * - Kontrol noktalarından Helmert parametrelerini (`a, b, tE, tN, scale, rotationDeg, residuals`) çözer.
 * - `>= 3` nokta varsa `leave-one-out` uyuşumsuz nokta analizini çalıştırır.
 * - Nokta artıklarını `maxResidualThresholdMm` (varsayılan `50 mm` = `5 cm`) ile karşılaştırır.
 * - Hedef TUREF koordinatlarının geçerli aralıkta (`K08`, `V-020`) ve `|E - 500000| <= 200000` (`V-019`) olduğunu denetler.
 * - Yerel köken (`Georef`) ve varsa aplikasyon noktalarından `TIC` (`Pt3[]`) üretir.
 */
// K08
// K54
// K69
// K76
// V-019
// V-020
export function runHelmertGeorefWizard(config: HelmertWizardConfig): HelmertWizardReport {
  const thresholdMm = config.maxResidualThresholdMm ?? 50;
  const maxScalePpmWarning = config.maxScalePpmWarning ?? 500;
  const helmert = solveHelmert2D(config.pairs);
  const outlierReport =
    config.pairs.length >= 3 ? detectOutlierLeaveOneOut(config.pairs) : null;

  const issues: GeorefValidationIssue[] = [];

  for (const pair of config.pairs) {
    if (!isValidTurefCoord(pair.targetE, pair.targetN)) {
      issues.push({
        code: 'V-020',
        severity: 'H',
        pointId: pair.id,
        message: `Kontrol noktası (${pair.id}) TUREF TM aralığı dışında: E=${pair.targetE.toFixed(3)}, N=${pair.targetN.toFixed(3)}.`,
      });
    } else if (Math.abs(pair.targetE - 500_000) > 200_000) {
      issues.push({
        code: 'V-019',
        severity: 'H',
        pointId: pair.id,
        message: `Kontrol noktası (${pair.id}) Doğu (E) değeri dilim orta meridyeninden >200 km uzakta: E=${pair.targetE.toFixed(3)}.`,
      });
    }
  }

  for (const r of helmert.residuals) {
    if (r.normMm > thresholdMm) {
      issues.push({
        code: 'M7-HELMERT-RES',
        severity: 'U',
        pointId: r.id,
        message: `Nokta (${r.id}) dönüşüm artığı (${(r.normMm / 10).toFixed(2)} cm) eşik değeri (${(thresholdMm / 10).toFixed(1)} cm) aşıyor.`,
      });
    }
  }

  if (outlierReport?.suspectPointId) {
    issues.push({
      code: 'M7-HELMERT-OUTLIER',
      severity: 'U',
      pointId: outlierReport.suspectPointId,
      message: `Leave-one-out analizi: "${outlierReport.suspectPointId}" noktası çıkarıldığında RMSE ${outlierReport.fullRmseMm.toFixed(1)} mm -> ${outlierReport.bestReducedRmseMm.toFixed(1)} mm düşüyor (uyuşumsuz nokta şüphesi).`,
    });
  }

  if (Math.abs(helmert.scalePpm) > maxScalePpmWarning) {
    issues.push({
      code: 'M7-HELMERT-SCALE',
      severity: 'U',
      message: `Helmert ölçek farkı yüksek: ${helmert.scale.toFixed(6)} (${helmert.scalePpm.toFixed(1)} ppm). CAD birimini (m/cm/mm) kontrol edin.`,
    });
  }

  const refPoints: { e: number; n: number }[] = [
    ...config.pairs.map((p) => ({ e: p.targetE, n: p.targetN })),
    ...(config.surveyPoints ?? []).map((s) => ({ e: s.e, n: s.n })),
  ];

  let zeroElevMm = config.zeroElevationOrthometricMm;
  if (zeroElevMm <= 0 && config.surveyPoints && config.surveyPoints.length > 0) {
    let maxZ = Number.NEGATIVE_INFINITY;
    for (const sp of config.surveyPoints) {
      if (sp.z > maxZ) maxZ = sp.z;
    }
    zeroElevMm = Math.round(maxZ * 1000);
  }

  if (zeroElevMm < 500 || zeroElevMm > 5_000_000) {
    issues.push({
      code: 'V-201',
      severity: 'U',
      message: `±0.00 ortometrik kot karşılığı (${(zeroElevMm / 1000).toFixed(3)} m) olağan TUREF aralığı (0.5 m – 5000 m) dışında.`,
    });
  }

  const georef = computeOriginFromTurefPoints(refPoints, config.epsg, zeroElevMm);
  const ticPointsMm =
    config.surveyPoints && config.surveyPoints.length >= 3
      ? surveyPointsToTic(config.surveyPoints, georef)
      : config.pairs.length >= 3
      ? config.pairs.map((p) => ({
          x: Math.round((p.targetE - georef.originE) * 1000),
          y: Math.round((p.targetN - georef.originN) * 1000),
          z: georef.zeroElevationOrthometric,
        }))
      : [];

  return {
    helmert,
    outlierReport,
    georef,
    ticPointsMm,
    thresholdMm,
    exceedsThreshold: helmert.maxResidualMm > thresholdMm,
    issues,
  };
}

/**
 * Yerel CAD birimindeki (`localX, localY` — metre cinsinden) bir noktayı
 * çözülmüş Helmert parametreleri ve proje `Georef` kökeni ile tasarım modeli `Pt2` (mm tamsayı) noktasına dönüştürür (`// K76`).
 */
// K76
export function transformLocalMetersToDesignMm(
  localX: number,
  localY: number,
  helmert: Pick<Helmert2DResult, 'a' | 'b' | 'tE' | 'tN'>,
  georef: Pick<Georef, 'originE' | 'originN'>
): Pt2 {
  const turef = transformPointHelmert2D(localX, localY, helmert);
  return {
    x: Math.round((turef.e - georef.originE) * 1000),
    y: Math.round((turef.n - georef.originN) * 1000),
  };
}

/**
 * Yerel mm koordinatlarındaki bir halkayı (`Ring2`, mm) Helmert dönüşümüyle yeni `Georef` altına taşır (`// K76`).
 * (`helmert` yerel koordinatları metre beklediği için `p.x / 1000, p.y / 1000` kullanılır.)
 */
// K76
export function applyHelmertToRingMm(
  ring: Ring2,
  helmert: Pick<Helmert2DResult, 'a' | 'b' | 'tE' | 'tN'>,
  georef: Pick<Georef, 'originE' | 'originN'>
): Ring2 {
  return ring.map((p) =>
    transformLocalMetersToDesignMm(p.x / 1000, p.y / 1000, helmert, georef)
  );
}

export function applyHelmertToPolyMm(
  poly: Poly2,
  helmert: Pick<Helmert2DResult, 'a' | 'b' | 'tE' | 'tN'>,
  georef: Pick<Georef, 'originE' | 'originN'>
): Poly2 {
  return {
    outer: applyHelmertToRingMm(poly.outer, helmert, georef),
    holes: poly.holes.map((h) => applyHelmertToRingMm(h, helmert, georef)),
  };
}

/**
 * Projede herhangi bir katta çizilmiş geometri (kat sınırı, BB, kısım, açıklık, balkon veya TIC)
 * bulunup bulunmadığını döndürür (`R1`, `R2`).
 */
export function projectHasGeometry(project: DesignProject): boolean {
  for (const b of project.buildings) {
    if ((b.tic?.length ?? 0) > 0) return true;
    if (b.sectionParts.length > 0) return true;
    if (b.parts.length > 0) return true;
    if ((b.openings?.length ?? 0) > 0) return true;
    if ((b.balconies?.length ?? 0) > 0) return true;
    for (const st of b.storeys) {
      if (st.outline.length > 0) return true;
    }
  }
  return false;
}

/**
 * Tasarım projesinin (`DesignProject`) tüm 2B geometrisini, açıklıklarını, balkonlarını, `Georef` bilgisini
 * ve `TIC` noktalarını Helmert sihirbazı çıktısıyla konumlandırır (`§7.3`, `// K54`, `// K76`).
 * - `transformExistingGeometry === true` ise mevcut yerel mm koordinatları Helmert ile dönüştürülerek yeni `report.georef` kökenine taşınır.
 * - `transformExistingGeometry === false` ve projede zaten çizilmiş geometri varsa, mevcut geometrinin TUREF koordinatlarının
 *   kaymaması için mevcut `originE, originN` korunur ve `ticPointsMm` bu kökene göre hizalanır (`R1`).
 */
// K54
// K76
export function applyHelmertWizardToProject(
  project: DesignProject,
  report: HelmertWizardReport,
  options: { readonly transformExistingGeometry?: boolean } = {}
): DesignProject {
  const { helmert, georef, ticPointsMm } = report;
  const transformGeom = options.transformExistingGeometry ?? false;
  const hasExistingGeom = projectHasGeometry(project);

  const effectiveGeoref: Georef =
    !transformGeom && hasExistingGeom
      ? {
          epsg: georef.epsg,
          originE: project.georef.originE,
          originN: project.georef.originN,
          zeroElevationOrthometric: georef.zeroElevationOrthometric,
        }
      : georef;

  const ticDxMm = Math.round((georef.originE - effectiveGeoref.originE) * 1000);
  const ticDyMm = Math.round((georef.originN - effectiveGeoref.originN) * 1000);
  const effectiveTicPointsMm: readonly Pt3[] =
    ticDxMm === 0 && ticDyMm === 0
      ? ticPointsMm
      : ticPointsMm.map((pt) => ({
          x: pt.x + ticDxMm,
          y: pt.y + ticDyMm,
          z: pt.z,
        }));

  const transformBuilding = (b: DesignBuilding): DesignBuilding => {
    const nextStoreys = transformGeom
      ? b.storeys.map((st) => ({
          ...st,
          outline: st.outline.map((poly) => applyHelmertToPolyMm(poly, helmert, effectiveGeoref)),
        }))
      : b.storeys;

    const nextSectionParts = transformGeom
      ? b.sectionParts.map((sp) => ({
          ...sp,
          outline: applyHelmertToPolyMm(sp.outline, helmert, effectiveGeoref),
        }))
      : b.sectionParts;

    const nextParts = transformGeom
      ? b.parts.map((pt) => ({
          ...pt,
          polygon: applyHelmertToPolyMm(pt.polygon, helmert, effectiveGeoref),
        }))
      : b.parts;

    const nextOpenings =
      transformGeom && b.openings
        ? b.openings.map((op) => ({
            ...op,
            anchor: {
              a: transformLocalMetersToDesignMm(
                op.anchor.a.x / 1000,
                op.anchor.a.y / 1000,
                helmert,
                effectiveGeoref
              ),
              b: transformLocalMetersToDesignMm(
                op.anchor.b.x / 1000,
                op.anchor.b.y / 1000,
                helmert,
                effectiveGeoref
              ),
            },
          }))
        : b.openings;

    const nextBalconies =
      transformGeom && b.balconies
        ? b.balconies.map((bal) => ({
            ...bal,
            outline: applyHelmertToRingMm(bal.outline, helmert, effectiveGeoref),
            attachedEdges: bal.attachedEdges.map(
              ([p1, p2]) =>
                [
                  transformLocalMetersToDesignMm(p1.x / 1000, p1.y / 1000, helmert, effectiveGeoref),
                  transformLocalMetersToDesignMm(p2.x / 1000, p2.y / 1000, helmert, effectiveGeoref),
                ] as const
            ),
          }))
        : b.balconies;

    return {
      ...b,
      storeys: nextStoreys,
      sectionParts: nextSectionParts,
      parts: nextParts,
      ...(nextOpenings !== undefined ? { openings: nextOpenings } : {}),
      ...(nextBalconies !== undefined ? { balconies: nextBalconies } : {}),
      ...(effectiveTicPointsMm.length >= 3 ? { tic: effectiveTicPointsMm } : {}),
    };
  };

  return {
    ...project,
    georef: effectiveGeoref,
    buildings: project.buildings.map((b, i) => (i === 0 ? transformBuilding(b) : b)),
  };
}

