// M9 — KML / GeoJSON Parsel Sınırı İçe Aktarma, WGS84 ↔ TUREF TM Dönüşümü ve Parsel/Çok-Blok Denetimi (§6.13, §7.1, §8.3, K07, K08, V-019, V-192, V-193).
// Saf TypeScript; DOM, React veya Node bağımlılığı yoktur.
import { subtractPolygons2D, unionPolygons2D } from '../brep/polyBoolean2d.ts';
import { polyAreaM2, signedArea2x } from '../design/geometry2d.ts';
import type { Georef, Poly2, Pt2, Ring2 } from '../design/types.ts';

import type { ImportedModel, ImportedPolygon } from '../gml/gmlReader.ts';
import type { Finding } from '../validation/types.ts';
import {
  getEpsgMetadata,
  isValidTurefCoord,
  suggestEpsgFromLongitude,
  type EpsgSuggestion,
  type TurefEpsgCode,
} from './georefWizard.ts';

export interface TurefPoint2D {
  readonly e: number; // Y (Doğu / Easting, m)
  readonly n: number; // X (Kuzey / Northing, m)
}

export interface Wgs84Point2D {
  readonly lon: number; // Boylam (derece, Doğu +)
  readonly lat: number; // Enlem (derece, Kuzey +)
}

export interface ParcelPolygonTuref {
  readonly outer: readonly TurefPoint2D[];
  readonly holes: readonly (readonly TurefPoint2D[])[];
}

export interface ImportedParcelBoundary {
  readonly sourceFormat: 'kml' | 'geojson' | 'turef';
  readonly coordinateSystem: 'wgs84' | 'turef';
  readonly epsg: TurefEpsgCode;
  readonly suggestedEpsg: EpsgSuggestion | null;
  readonly centroidWgs84: Wgs84Point2D | null;
  readonly centroidTuref: TurefPoint2D;
  readonly areaM2: number;
  readonly turefPolygonsM: readonly ParcelPolygonTuref[];
  readonly localPolygonsMm: readonly Poly2[];
}

export interface ParcelImportOptions {
  /** Hedef TUREF EPSG kodu (verilmezse WGS84 boylamından otomatik önerilir, TUREF girdide varsayılan 5254). */
  readonly targetEpsg?: TurefEpsgCode;
  /** Yerel mm koordinatlarına dönüşüm için proje georef bilgisi (verilmezse parsel sol-alt köşesi tam metre orijin alınır). */
  readonly georef?: Pick<Georef, 'epsg' | 'originE' | 'originN'>;
}

export interface MultiBuildingParcelCheckOptions {
  /** İsteğe bağlı parsel sınırı (KML / GeoJSON'dan içe aktarılmış). */
  readonly parcel?: ImportedParcelBoundary;
  /** Aynı parseldeki diğer blokların CityGML modelleri (2025/2 Genelgesi m.4/3 çok bloklu yapılar). */
  readonly siblingModels?: readonly ImportedModel[];
  /** Parsel dışına taşma hata eşiği (m², varsayılan: 0.05 m²). */
  readonly maxParcelOutsideAreaM2?: number;
}

export interface MultiBuildingParcelCheckReport {
  readonly findings: readonly Finding[];
  readonly parcelOverlapRatio: number | null;
  readonly parcelOutsideAreaM2: number | null;
  readonly buildingPairOverlaps: ReadonlyArray<{
    readonly firstConstructionId: string;
    readonly secondConstructionId: string;
    readonly intersectionAreaM2: number;
    readonly overlapPercent: number;
    readonly minDistanceM: number;
  }>;
}

// GRS80 Elipsoid Sabitleri (TUREF / ITRF96, §8.3)
const GRS80_A = 6378137.0;
const GRS80_F = 1 / 298.257222101;
const GRS80_E2 = 2 * GRS80_F - GRS80_F * GRS80_F;
const GRS80_EP2 = GRS80_E2 / (1 - GRS80_E2);
const TM_K0 = 1.0;
const TM_FE = 500000.0;
const TM_FN = 0.0;

function meridionalArcGrs80(latRad: number): number {
  const e2 = GRS80_E2;
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const e8 = e6 * e2;
  const a0 = 1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256 - (175 * e8) / 16384;
  const a2 = (3 / 8) * (e2 + e4 / 4 + (15 * e6) / 128 - (455 * e8) / 4096);
  const a4 = (15 / 256) * (e4 + (3 * e6) / 4 - (77 * e8) / 128);
  const a6 = (35 / 3072) * (e6 - (41 * e8) / 32);
  return (
    GRS80_A *
    (a0 * latRad -
      a2 * Math.sin(2 * latRad) +
      a4 * Math.sin(4 * latRad) -
      a6 * Math.sin(6 * latRad))
  );
}

/**
 * WGS84 / ITRF96 (`lon`, `lat` derece) koordinatını TUREF TM 3° (`EPSG:5253…5259`)
 * Doğu (`e`) ve Kuzey (`n`) metre koordinatına dönüştürür (`// K07`, `// K08`, `§8.3`).
 */
// K07
// K08
// V-019
export function wgs84ToTurefTm(
  lonDeg: number,
  latDeg: number,
  epsgOrDom?: TurefEpsgCode | 27 | 30 | 33 | 36 | 39 | 42 | 45
): TurefPoint2D & { readonly epsg: TurefEpsgCode; readonly dom: 27 | 30 | 33 | 36 | 39 | 42 | 45 } {
  const meta =
    epsgOrDom === undefined
      ? suggestEpsgFromLongitude(lonDeg)
      : epsgOrDom >= 5253
        ? getEpsgMetadata(epsgOrDom as TurefEpsgCode)
        : suggestEpsgFromLongitude(epsgOrDom);
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const lon0 = (meta.dom * Math.PI) / 180;

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const tanLat = Math.tan(lat);

  const N = GRS80_A / Math.sqrt(1 - GRS80_E2 * sinLat * sinLat);
  const T = tanLat * tanLat;
  const C = GRS80_EP2 * cosLat * cosLat;
  const A = (lon - lon0) * cosLat;
  const M = meridionalArcGrs80(lat);

  const A2 = A * A;
  const A3 = A2 * A;
  const A4 = A2 * A2;
  const A5 = A4 * A;
  const A6 = A4 * A2;

  const e =
    TM_FE +
    TM_K0 *
      N *
      (A +
        ((1 - T + C) * A3) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * GRS80_EP2) * A5) / 120);

  const n =
    TM_FN +
    TM_K0 *
      (M +
        N *
          tanLat *
          (A2 / 2 +
            ((5 - T + 9 * C + 4 * C * C) * A4) / 24 +
            ((61 - 58 * T + T * T + 600 * C - 330 * GRS80_EP2) * A6) / 720));

  return { e, n, epsg: meta.epsg, dom: meta.dom };
}

/**
 * TUREF TM 3° (`e`, `n` metre) koordinatını WGS84 (`lon`, `lat` derece) koordinatına dönüştürür (`// K07`, `§8.3`).
 */
// K07
// V-019
export function turefTmToWgs84(
  e: number,
  n: number,
  epsg: TurefEpsgCode
): Wgs84Point2D {
  const meta = getEpsgMetadata(epsg);
  const lon0 = (meta.dom * Math.PI) / 180;
  const e1 = (1 - Math.sqrt(1 - GRS80_E2)) / (1 + Math.sqrt(1 - GRS80_E2));

  const M = (n - TM_FN) / TM_K0;
  const mu =
    M /
    (GRS80_A *
      (1 -
        GRS80_E2 / 4 -
        (3 * GRS80_E2 * GRS80_E2) / 64 -
        (5 * GRS80_E2 * GRS80_E2 * GRS80_E2) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 * e1 * e1) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * e1 * e1 * e1 * e1) / 32) * Math.sin(4 * mu) +
    ((151 * e1 * e1 * e1) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 * e1 * e1 * e1) / 512) * Math.sin(8 * mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const N1 = GRS80_A / Math.sqrt(1 - GRS80_E2 * sinPhi1 * sinPhi1);
  const T1 = tanPhi1 * tanPhi1;
  const C1 = GRS80_EP2 * cosPhi1 * cosPhi1;
  const R1 = (GRS80_A * (1 - GRS80_E2)) / Math.pow(1 - GRS80_E2 * sinPhi1 * sinPhi1, 1.5);
  const D = (e - TM_FE) / (N1 * TM_K0);

  const D2 = D * D;
  const D3 = D2 * D;
  const D4 = D2 * D2;
  const D5 = D4 * D;
  const D6 = D4 * D2;

  const latRad =
    phi1 -
    ((N1 * tanPhi1) / R1) *
      (D2 / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * GRS80_EP2) * D4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * GRS80_EP2 - 3 * C1 * C1) * D6) / 720);

  const lonRad =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * D3) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * GRS80_EP2 + 24 * T1 * T1) * D5) / 120) /
      cosPhi1;

  return {
    lon: (lonRad * 180) / Math.PI,
    lat: (latRad * 180) / Math.PI,
  };
}

function cleanRawRing(pts: readonly [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const [x, y] of pts) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (out.length > 0) {
      const prev = out[out.length - 1];
      if (Math.hypot(x - prev[0], y - prev[1]) < 1e-9) continue;
    }
    out.push([x, y]);
  }
  if (out.length >= 2) {
    const first = out[0];
    const last = out[out.length - 1];
    if (Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-9) {
      out.pop();
    }
  }
  return out;
}

function parseKmlCoordinatesText(text: string): [number, number][] {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const raw: [number, number][] = [];
  for (const tok of tokens) {
    const parts = tok.split(',');
    if (parts.length < 2) continue;
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      raw.push([x, y]);
    }
  }
  return cleanRawRing(raw);
}

function extractRawPolygonsFromKml(xml: string): { outer: [number, number][]; holes: [number, number][][] }[] {
  const polys: { outer: [number, number][]; holes: [number, number][][] }[] = [];
  const polyRegex = /<(?:\w+:)?Polygon\b[^>]*>([\s\S]*?)<\/(?:\w+:)?Polygon>/gi;
  for (const match of xml.matchAll(polyRegex)) {
    const block = match[1];
    const outerMatch =
      /<(?:\w+:)?outerBoundaryIs\b[^>]*>[\s\S]*?<(?:\w+:)?coordinates\b[^>]*>([\s\S]*?)<\/(?:\w+:)?coordinates>[\s\S]*?<\/(?:\w+:)?outerBoundaryIs>/i.exec(
        block
      );
    const fallbackMatch = !outerMatch
      ? /<(?:\w+:)?coordinates\b[^>]*>([\s\S]*?)<\/(?:\w+:)?coordinates>/i.exec(block)
      : null;
    const outerText = outerMatch ? outerMatch[1] : fallbackMatch ? fallbackMatch[1] : '';
    const outer = parseKmlCoordinatesText(outerText);
    if (outer.length < 3) continue;

    const holes: [number, number][][] = [];
    const innerRegex =
      /<(?:\w+:)?innerBoundaryIs\b[^>]*>[\s\S]*?<(?:\w+:)?coordinates\b[^>]*>([\s\S]*?)<\/(?:\w+:)?coordinates>[\s\S]*?<\/(?:\w+:)?innerBoundaryIs>/gi;
    for (const hm of block.matchAll(innerRegex)) {
      const h = parseKmlCoordinatesText(hm[1]);
      if (h.length >= 3) holes.push(h);
    }
    polys.push({ outer, holes });
  }
  return polys;
}

function extractRawPolygonsFromGeoJson(text: string): { outer: [number, number][]; holes: [number, number][][] }[] {
  const parsed = JSON.parse(text) as unknown;
  const polys: { outer: [number, number][]; holes: [number, number][][] }[] = [];

  const visitGeometry = (geom: unknown): void => {
    if (!geom || typeof geom !== 'object') return;
    const g = geom as {
      type?: string;
      coordinates?: unknown;
      geometries?: unknown[];
       geometry?: unknown;
      features?: unknown[];
    };
    if (g.type === 'FeatureCollection' && Array.isArray(g.features)) {
      for (const f of g.features) visitGeometry(f);
      return;
    }
    if (g.type === 'Feature' && g.geometry) {
      visitGeometry(g.geometry);
      return;
    }
    if (g.type === 'GeometryCollection' && Array.isArray(g.geometries)) {
      for (const sub of g.geometries) visitGeometry(sub);
      return;
    }
    if (g.type === 'Polygon' && Array.isArray(g.coordinates)) {
      const rings = g.coordinates as unknown[][];
      if (rings.length === 0) return;
      const toPairs = (r: unknown[]): [number, number][] =>
        cleanRawRing(
          r
            .filter((pt): pt is number[] => Array.isArray(pt) && pt.length >= 2)
            .map((pt) => [Number(pt[0]), Number(pt[1])] as [number, number])
        );
      const outer = toPairs(rings[0]);
      if (outer.length >= 3) {
        const holes = rings.slice(1).map(toPairs).filter((h) => h.length >= 3);
        polys.push({ outer, holes });
      }
      return;
    }
    if (g.type === 'MultiPolygon' && Array.isArray(g.coordinates)) {
      for (const polyCoords of g.coordinates as unknown[][][]) {
        visitGeometry({ type: 'Polygon', coordinates: polyCoords });
      }
    }
  };

  visitGeometry(parsed);
  return polys;
}

function ensureRingOrientation2D(ring: readonly Pt2[], wantCcw: boolean): Ring2 {
  const s = signedArea2x(ring);
  if ((wantCcw && s < 0) || (!wantCcw && s > 0)) {
    return [...ring].reverse();
  }
  return [...ring];
}


/**
 * KML veya GeoJSON metninden parsel sınır çokgenlerini ayrıştırır, WGS84 ise TUREF TM'ye dönüştürür
 * ve yerel milimetre (`Poly2[]`) ile TUREF metre koordinatlarını döndürür (`// K07`, `// V-019`, `// V-193`, `§8.3`).
 */
// K07
// V-019
// V-193
export function parseParcelKmlOrGeoJson(
  content: string,
  options: ParcelImportOptions = {}
): ImportedParcelBoundary {
  const trimmed = content.trim();
  const isKml = trimmed.startsWith('<') || /<(?:\w+:)?(?:kml|Polygon)\b/i.test(trimmed);
  const sourceFormat: 'kml' | 'geojson' = isKml ? 'kml' : 'geojson';

  const rawPolys = isKml ? extractRawPolygonsFromKml(trimmed) : extractRawPolygonsFromGeoJson(trimmed);
  if (rawPolys.length === 0) {
    throw new Error('Parsel dosyasında geçerli bir Polygon / LinearRing bulunamadı.');
  }

  const allSamplePts = rawPolys.flatMap((p) => p.outer);
  const firstPt = allSamplePts[0];
  const isWgs84 = Math.abs(firstPt[0]) <= 180 && Math.abs(firstPt[1]) <= 90;
  const coordinateSystem: 'wgs84' | 'turef' = isWgs84 ? 'wgs84' : 'turef';

  let centroidWgs84: Wgs84Point2D | null = null;
  let suggestedEpsg: EpsgSuggestion | null = null;

  if (isWgs84) {
    const sumLon = allSamplePts.reduce((s, p) => s + p[0], 0);
    const sumLat = allSamplePts.reduce((s, p) => s + p[1], 0);
    centroidWgs84 = {
      lon: sumLon / allSamplePts.length,
      lat: sumLat / allSamplePts.length,
    };
    suggestedEpsg = suggestEpsgFromLongitude(centroidWgs84.lon);
  }

  const epsg: TurefEpsgCode =
    options.targetEpsg ??
    options.georef?.epsg ??
    suggestedEpsg?.epsg ??
    5254;

  const toTuref = ([x, y]: [number, number]): TurefPoint2D => {
    if (isWgs84) {
      const conv = wgs84ToTurefTm(x, y, epsg);
      return { e: conv.e, n: conv.n };
    }
    // TUREF girdide [E, N] (GeoJSON standardı X=Easting, Y=Northing)
    if (!isValidTurefCoord(x, y) && isValidTurefCoord(y, x)) {
      return { e: y, n: x };
    }
    return { e: x, n: y };
  };

  const turefPolygonsM: ParcelPolygonTuref[] = rawPolys.map((p) => ({
    outer: p.outer.map(toTuref),
    holes: p.holes.map((h) => h.map(toTuref)),
  }));

  const allTurefPts = turefPolygonsM.flatMap((p) => p.outer);
  const minE = Math.min(...allTurefPts.map((p) => p.e));
  const minN = Math.min(...allTurefPts.map((p) => p.n));
  const originE = options.georef?.originE ?? Math.floor(minE);
  const originN = options.georef?.originN ?? Math.floor(minN);

  const toLocalPt = (pt: TurefPoint2D): Pt2 => ({
    x: Math.round((pt.e - originE) * 1000),
    y: Math.round((pt.n - originN) * 1000),
  });

  const localPolygonsMm: Poly2[] = turefPolygonsMmFromTuref(turefPolygonsM, toLocalPt);

  const sumE = allTurefPts.reduce((s, p) => s + p.e, 0);
  const sumN = allTurefPts.reduce((s, p) => s + p.n, 0);
  const centroidTuref: TurefPoint2D = {
    e: sumE / allTurefPts.length,
    n: sumN / allTurefPts.length,
  };

  if (!centroidWgs84) {
    centroidWgs84 = turefTmToWgs84(centroidTuref.e, centroidTuref.n, epsg);
    suggestedEpsg = suggestEpsgFromLongitude(centroidWgs84.lon);
  }

  const areaM2 = localPolygonsMm.reduce((s, p) => s + polyAreaM2(p), 0);

  return {
    sourceFormat,
    coordinateSystem,
    epsg,
    suggestedEpsg,
    centroidWgs84,
    centroidTuref,
    areaM2,
    turefPolygonsM,
    localPolygonsMm,
  };
}

function turefPolygonsMmFromTuref(
  turefPolys: readonly ParcelPolygonTuref[],
  toLocalPt: (pt: TurefPoint2D) => Pt2
): Poly2[] {
  return turefPolys.map((p) => ({
    outer: ensureRingOrientation2D(p.outer.map(toLocalPt), true),
    holes: p.holes.map((h) => ensureRingOrientation2D(h.map(toLocalPt), false)),
  }));
}

function extractBuildingFootprintPolysMm(
  model: ImportedModel,
  originE: number,
  originN: number
): Poly2[] {
  let polys: ImportedPolygon[] = model.polygons.filter((p) => p.lodLevel === 'lod0FootPrint');
  if (polys.length === 0) {
    polys = model.polygons.filter((p) => p.surfaceTag === 'GroundSurface');
  }
  if (polys.length === 0) {
    polys = model.polygons.filter((p) => p.prefix === 'Floor_');
  }
  const out: Poly2[] = [];
  for (const p of polys) {
    const rawOuter: Pt2[] = [];
    for (const v of p.exteriorRing.vertices) {
      const pt: Pt2 = {
        x: Math.round((v.e - originE) * 1000),
        y: Math.round((v.n - originN) * 1000),
      };
      if (rawOuter.length > 0) {
        const prev = rawOuter[rawOuter.length - 1];
        if (prev.x === pt.x && prev.y === pt.y) continue;
      }
      rawOuter.push(pt);
    }
    if (rawOuter.length >= 2) {
      const first = rawOuter[0];
      const last = rawOuter[rawOuter.length - 1];
      if (first.x === last.x && first.y === last.y) rawOuter.pop();
    }
    if (rawOuter.length >= 3) {
      out.push({
        outer: ensureRingOrientation2D(rawOuter, true),
        holes: [],
      });
    }
  }
  return unionPolygons2D(out);
}

function minDistanceBetweenPolygonsMm(aPolys: readonly Poly2[], bPolys: readonly Poly2[]): number {
  let minD = Number.POSITIVE_INFINITY;
  const distPointSeg = (p: Pt2, a: Pt2, b: Pt2): number => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    return Math.hypot(a.x + t * dx - p.x, a.y + t * dy - p.y);
  };
  for (const pa of aPolys) {
    const ra = pa.outer;
    for (const pb of bPolys) {
      const rb = pb.outer;
      for (let i = 0; i < ra.length; i++) {
        const a1 = ra[i];
        const a2 = ra[(i + 1) % ra.length];
        for (let j = 0; j < rb.length; j++) {
          const b1 = rb[j];
          const b2 = rb[(j + 1) % rb.length];
          minD = Math.min(
            minD,
            distPointSeg(a1, b1, b2),
            distPointSeg(b1, a1, a2)
          );
        }
      }
    }
  }
  return minD;
}

/**
 * Parsel sınırı (`V-019`, `V-193`) ve aynı parseldeki çok bloklu yapı (`V-192`, 2025/2 Genelgesi m.4/3)
 * denetimlerini çalıştırır (`§6.3`, `§6.13`, `§7.1`, `§8.3`).
 */
// V-019
// V-192
// V-193
export function validateParcelAndMultiBuilding(
  primaryModel: ImportedModel,
  options: MultiBuildingParcelCheckOptions = {}
): MultiBuildingParcelCheckReport {
  const findings: Finding[] = [];
  const originE = Math.floor(primaryModel.envelope.minE);
  const originN = Math.floor(primaryModel.envelope.minN);
  const primaryMb = primaryModel.objects.find((o) => o.prefix === 'MB_');
  const primaryCid = primaryMb?.attributesMap.constructionID ?? primaryModel.fileName;
  const primaryFootprint = extractBuildingFootprintPolysMm(primaryModel, originE, originN);
  const primaryAreaM2 = primaryFootprint.reduce((s, p) => s + polyAreaM2(p), 0);

  let parcelOverlapRatio: number | null = null;
  let parcelOutsideAreaM2: number | null = null;

  // 1) Parsel Sınırı Kontrolleri: V-019 (DOM/EPSG uyumu) ve V-193 (Bina tabanı ∩ Parsel)
  if (options.parcel) {
    const parcel = options.parcel;
    const modelSrs = primaryModel.srsName ?? '';
    if (parcel.suggestedEpsg) {
      const expectedSrs = `EPSG:${parcel.suggestedEpsg.epsg}`;
      if (modelSrs && modelSrs !== expectedSrs) {
        findings.push({
          ruleId: 'V-019',
          severity: 'H',
          targetGmlId: primaryMb?.gmlId,
          message: `Dosya srsName (${modelSrs}) parsel boylamından (${parcel.centroidWgs84?.lon.toFixed(4)}° → DOM ${parcel.suggestedEpsg.dom}°, ${expectedSrs}) farklı.`,
          tkgmMessage: 'Seçilen EPSG dilimi parsel boylamı ile uyuşmuyor.',
        });
      }
    }

    const parcelPolysMm = turefPolygonsMmFromTuref(parcel.turefPolygonsM, (pt) => ({
      x: Math.round((pt.e - originE) * 1000),
      y: Math.round((pt.n - originN) * 1000),
    }));

    if (primaryFootprint.length > 0 && parcelPolysMm.length > 0 && primaryAreaM2 > 0) {
      const outsidePolys = subtractPolygons2D(primaryFootprint, parcelPolysMm);
      const outsideArea = outsidePolys.reduce((s, p) => s + polyAreaM2(p), 0);
      const insideArea = Math.max(0, primaryAreaM2 - outsideArea);
      parcelOverlapRatio = Math.min(1, Math.max(0, insideArea / primaryAreaM2));
      parcelOutsideAreaM2 = outsideArea;

      const maxOutsideAllowed = options.maxParcelOutsideAreaM2 ?? 0.05;
      if (insideArea <= 0.001) {
        findings.push({
          ruleId: 'V-193',
          severity: 'H',
          targetGmlId: primaryMb?.gmlId,
          message: `${primaryCid}: binanın tabanı (${primaryAreaM2.toFixed(2)} m²) parsel poligonu ile kesişmiyor.`,
          tkgmMessage: 'Binanın tabanı ile bulunduğu parsel kesişmiyor.',
        });
      } else if (outsideArea > maxOutsideAllowed) {
        const pct = ((outsideArea / primaryAreaM2) * 100).toFixed(1);
        findings.push({
          ruleId: 'V-193',
          severity: 'U',
          targetGmlId: primaryMb?.gmlId,
          message: `${primaryCid}: bina tabanının ${outsideArea.toFixed(2)} m² (%${pct}) kısmı parsel sınırı dışına taşıyor.`,
          tkgmMessage: 'Binanın tabanı ile megsisten gelen parsel geometrisi kesişmelidir.',
        });
      }
    }
  }

  // 2) Çok Bloklu Yapı Kontrolleri: V-192 (Aynı parseldeki binaların kesişmemesi ve parsel kimliği tutarlılığı)
  const buildingPairOverlaps: Array<{
    readonly firstConstructionId: string;
    readonly secondConstructionId: string;
    readonly intersectionAreaM2: number;
    readonly overlapPercent: number;
    readonly minDistanceM: number;
  }> = [];

  const allModels = [primaryModel, ...(options.siblingModels ?? [])];
  if (allModels.length > 1) {
    const modelEntries = allModels.map((m) => {
      const mb = m.objects.find((o) => o.prefix === 'MB_');
      const cid = mb?.attributesMap.constructionID ?? m.fileName;
      const fp = extractBuildingFootprintPolysMm(m, originE, originN);
      const area = fp.reduce((s, p) => s + polyAreaM2(p), 0);
      return { model: m, mb, cid, fp, area };
    });

    // Ortak parsel öznitelikleri ve benzersiz blok harfi denetimi
    const seenCids = new Set<string>();
    const refTakbis = primaryMb?.attributesMap.takbisPropertyIdentityNumber;
    const refBlock = primaryMb?.attributesMap.blockNumber;
    const refParcel = primaryMb?.attributesMap.parcelNumber;

    for (const entry of modelEntries) {
      if (seenCids.has(entry.cid)) {
        findings.push({
          ruleId: 'V-192',
          severity: 'H',
          targetGmlId: entry.mb?.gmlId,
          message: `Çok bloklu pakette "${entry.cid}" yapı kimliği (constructionID) birden fazla dosyada tekrarlanıyor.`,
          tkgmMessage: 'Aynı parselde kesişen binalar var.',
        });
      }
      seenCids.add(entry.cid);

      const a = entry.mb?.attributesMap;
      if (
        a &&
        refTakbis !== undefined &&
        (a.takbisPropertyIdentityNumber !== refTakbis ||
          a.blockNumber !== refBlock ||
          a.parcelNumber !== refParcel)
      ) {
        findings.push({
          ruleId: 'V-192',
          severity: 'U',
          targetGmlId: entry.mb?.gmlId,
          message: `${entry.cid}: ada/parsel/TAKBİS kimliği (${a.blockNumber}/${a.parcelNumber}, TAKBİS ${a.takbisPropertyIdentityNumber}) ana blok (${refBlock}/${refParcel}, TAKBİS ${refTakbis}) ile aynı değil.`,
        });
      }
    }

    for (let i = 0; i < modelEntries.length; i++) {
      for (let j = i + 1; j < modelEntries.length; j++) {
        const A = modelEntries[i];
        const B = modelEntries[j];
        if (A.fp.length === 0 || B.fp.length === 0) continue;

        const aMinusB = subtractPolygons2D(A.fp, B.fp);
        const aMinusBArea = aMinusB.reduce((s, p) => s + polyAreaM2(p), 0);
        const interArea = Math.max(0, A.area - aMinusBArea);
        const minArea = Math.max(0.01, Math.min(A.area, B.area));
        const overlapPct = (interArea / minArea) * 100;
        const minDistM = interArea > 0.001 ? 0 : minDistanceBetweenPolygonsMm(A.fp, B.fp) / 1000;

        buildingPairOverlaps.push({
          firstConstructionId: A.cid,
          secondConstructionId: B.cid,
          intersectionAreaM2: interArea,
          overlapPercent: overlapPct,
          minDistanceM: minDistM,
        });

        if (interArea > 0.01) {
          findings.push({
            ruleId: 'V-192',
            severity: 'H',
            targetGmlId: A.mb?.gmlId,
            message: `${A.cid} ve ${B.cid} idli binalar ${interArea.toFixed(2)} m² (yüzde ${overlapPct.toFixed(1)}) kesişmektedir.`,
            tkgmMessage: `${A.cid} ve ${B.cid} idli binalar yüzde ${overlapPct.toFixed(1)} kesişmektedir.`,
          });
        }
      }
    }
  }

  return {
    findings,
    parcelOverlapRatio,
    parcelOutsideAreaM2,
    buildingPairOverlaps,
  };
}
