// M7 — DXF İçe Aktarma ve Konumlandırma Motoru (şartname §8.2, §11, K08, K63, K76, K92).
// Saf TypeScript; DOM, React veya Node bağımlılığı yoktur.
import { uuidv5 } from '../hash/canonical.ts';
import type { Helmert2DResult } from '../math/helmert2d.ts';
import {
  isSimpleRing,
  normalizeOrientation,
  pointInPoly,
  ringBounds,
  ringCentroid,
  ringInsidePoly,
} from '../design/geometry2d.ts';
import type {
  Balcony,
  DesignBuilding,
  DesignProject,
  Georef,
  Opening,
  Part,
  Poly2,
  Pt2,
  Pt3,
  Ring2,
  SectionPart,
} from '../design/types.ts';
import {
  computeOriginFromTurefPoints,
  isValidTurefCoord,
  TurefEpsgCode,
} from './georefWizard.ts';

export type DxfUnit = 'mm' | 'cm' | 'm';

export type DxfTargetRole =
  | 'kat_siniri'
  | 'bb'
  | 'kisim'
  | 'oa'
  | 'balkon'
  | 'kapi'
  | 'pencere'
  | 'sutun'
  | 'tic'
  | 'altlik'
  | 'yok_say';

export interface DxfLayerMappingRule {
  readonly role: DxfTargetRole;
  /** 'bb' rolü için bağlanacak bağımsız bölüm ID'si (veya numarası). */
  readonly sectionIdOrNumber?: string;
  /** 'kisim' veya 'oa' için varsayılan partUsage / commonAreaUsage kodu (örn. 1001 Oda, 1022 Niteliksiz OA). */
  readonly usageCode?: number;
  /** 'kapi' / 'pencere' için varsayılan denizlik (mm) ve yükseklik (mm). */
  readonly sillMm?: number;
  readonly heightMm?: number;
}

export type DxfLayerMappingTable = Readonly<Record<string, DxfLayerMappingRule>>;

export interface DxfRawVertex2D {
  readonly x: number; // DXF biriminde
  readonly y: number; // DXF biriminde
  readonly z: number; // DXF biriminde
  readonly bulge: number;
}

export interface DxfPolylineEntity {
  readonly kind: 'POLYLINE';
  readonly layer: string;
  readonly closedFlag: boolean;
  readonly vertices: readonly DxfRawVertex2D[]; // Ölçeklenmiş (metre cinsinden)
}

export interface DxfLineEntity {
  readonly kind: 'LINE';
  readonly layer: string;
  readonly x1: number; // metre
  readonly y1: number; // metre
  readonly z1: number; // metre
  readonly x2: number; // metre
  readonly y2: number; // metre
  readonly z2: number; // metre
}

export interface DxfCircleEntity {
  readonly kind: 'CIRCLE';
  readonly layer: string;
  readonly cx: number; // metre
  readonly cy: number; // metre
  readonly cz: number; // metre
  readonly radiusM: number; // metre
}

export interface DxfTextEntity {
  readonly kind: 'TEXT';
  readonly layer: string;
  readonly x: number; // metre
  readonly y: number; // metre
  readonly z: number; // metre
  readonly text: string;
  readonly inferredPartUsage: number | null;
}

export type DxfParsedEntity =
  | DxfPolylineEntity
  | DxfLineEntity
  | DxfCircleEntity
  | DxfTextEntity;

export interface DxfImportIssue {
  readonly code: string;
  readonly severity: 'H' | 'U' | 'B';
  readonly layer: string;
  readonly message: string;
}

export interface ParsedDxfDocument {
  readonly detectedInsUnits: number | null;
  readonly effectiveUnit: DxfUnit;
  readonly unitToMeterFactor: number;
  readonly layers: readonly string[];
  readonly entities: readonly DxfParsedEntity[];
  readonly isAlreadyTuref: boolean;
  readonly sampleCoordBounds: {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
  } | null;
  readonly issues: readonly DxfImportIssue[];
}

export interface DxfGeoreferencedLayerRings {
  readonly layer: string;
  readonly closedRingsMm: readonly Ring2[];
  readonly openChainsMm: readonly (readonly Pt2[])[];
  readonly lineSegmentsMm: readonly { readonly a: Pt2; readonly b: Pt2; readonly zMm: number }[];
  readonly points3dMm: readonly Pt3[];
  readonly textsMm: readonly {
    readonly pos: Pt2;
    readonly text: string;
    readonly inferredPartUsage: number | null;
  }[];
}

export interface GeoreferencedDxfResult {
  readonly georef: Georef;
  readonly byLayer: Readonly<Record<string, DxfGeoreferencedLayerRings>>;
  readonly allUnderlayRingsMm: readonly Ring2[];
  readonly issues: readonly DxfImportIssue[];
}

interface DxfTagPair {
  readonly code: number;
  readonly value: string;
}

/**
 * Şartname Ek-A `partUsage` karşılık tablosuna göre mahal etiketinden otomatik kullanım kodu önerir (`§8.2`, `Ek-A`).
 */
export function inferPartUsageFromRoomLabel(rawLabel: string): number | null {
  const up = rawLabel
    .trim()
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toUpperCase();
  if (!up) return null;

  // Önce spesifik eşleşmeler
  if (up.includes('EBEVEYN BANYO') || up.includes('BANYO') || up.includes('JAKUZİ') || up.includes('SAUNA')) return 1002; // Banyo
  if (up.includes('TUVALET') || up === 'WC' || up.includes(' WC') || up.startsWith('WC ') || up.includes('HELA') || up.includes('LAVABO')) return 1006; // Tuvalet
  if (up.includes('SALON') || up.includes('YAŞAM ALANI') || up.includes('YEMEK ODASI')) return 1003; // Salon
  if (up.includes('MUTFAK')) return 1004; // Mutfak
  if (up.includes('KİLER') || up.includes('ÇAMAŞIR') || up.includes('ÜTÜ') || up.includes('SANDIK') || up.includes('GİYİNME')) {
    return up.includes('GİYİNME') ? 1001 : 1005; // Giyinme -> Oda (1001), diğerleri -> Kiler (1005)
  }
  if (up.includes('KIŞ BAHÇESİ')) return 1007;
  if (up.includes('ANTRE') || up.includes('HOL') || up.includes('SOFA') || up.includes('KORİDOR') || up.includes('GİRİŞ')) return 1008; // Hol
  if (up.includes('DÜKKAN') || up.includes('MAĞAZA') || up.includes('OFİS BÜRO')) return 1009; // Dükkan
  if (up.includes('SIĞINAK')) return 1010;
  if (up.includes('DANIŞMA')) return 1011;
  if (up.includes('KALORİFER') || up.includes('KAZAN')) return 1012;
  if (up.includes('KAPICI')) return 1013;
  if (up.includes('ELEKTRİK') || up.includes('JENERATÖR')) return 1014;
  if (up.includes('ISI MERKEZİ')) return 1015;
  if (up.includes('OTOPARK') || up.includes('GARAJ')) return 1016;
  if (up.includes('GÜVENLİK')) return 1017;
  if (up.includes('HAVUZ')) return 1018;
  if (up.includes('SOSYAL')) return 1019;
  if (up.includes('SPOR')) return 1020;
  if (up.includes('ÇÖP')) return 1021;
  if (up.includes('MERDİVEN')) return 1024;
  if (up.includes('SU MERKEZİ') || up.includes('SU DEPOSU') || up.includes('HİDROFOR')) return 1025;
  if (up.includes('MESCİT') || up.includes('DİNİ')) return 1026;
  if (up.includes('MÜŞTEMİLAT')) return 1027;
  if (up.includes('TEKNİK')) return 1028;
  if (up.includes('ASANSÖR')) return 1029;
  if (up.includes('DEPO') || up.includes('KÖMÜRLÜK') || up.includes('BODRUM')) return 1030;
  if (up.includes('ODA') || up.includes('YATAK') || up.includes('OTURMA') || up.includes('ÇOCUK') || up.includes('ÇALIŞMA') || up.includes('MİSAFİR')) return 1001; // Oda
  return null;
}

/**
 * DXF katman adından varsayılan rol tahmini yapar (`§8.2`).
 */
export function suggestRoleForDxfLayerName(layerName: string): DxfLayerMappingRule {
  const up = layerName
    .trim()
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toUpperCase();

  if (up.includes('KAT') && (up.includes('SINIR') || up.includes('OUTLINE') || up.includes('DIS'))) {
    return { role: 'kat_siniri' };
  }
  if (up === 'KAT_SINIRI' || up === 'STOREY' || up === 'KAT') {
    return { role: 'kat_siniri' };
  }
  if (up.startsWith('BB_') || up === 'BB' || up.includes('BAGIMSIZ')) {
    const match = /(\d+)$/.exec(up);
    return { role: 'bb', sectionIdOrNumber: match ? match[1] : undefined };
  }
  if (up.includes('KISIM') || up.includes('ODA') || up.includes('MAHAL') || up.includes('BBK') || up === 'ROOM') {
    const m = /(\d{4})$/.exec(up);
    return { role: 'kisim', usageCode: m ? Number(m[1]) : 1001 };
  }
  if (up.includes('ORTAK') || up === 'OA' || up.startsWith('OA_')) {
    const m = /(\d{4})$/.exec(up);
    return { role: 'oa', usageCode: m ? Number(m[1]) : 1022 };
  }
  if (up.includes('BALKON') || up.includes('TERAS') || up.startsWith('BLKN')) {
    return { role: 'balkon' };
  }
  if (up.includes('KAPI') || up.includes('DOOR')) {
    const fullMatch = /(?:KAPI|DOOR)[_\-](\d+)[_\-](\-?\d+)[_\-](\d+)$/.exec(up);
    if (fullMatch) {
      return {
        role: 'kapi',
        usageCode: Number(fullMatch[1]),
        sillMm: Number(fullMatch[2]),
        heightMm: Number(fullMatch[3]),
      };
    }
    const uMatch = /(?:KAPI|DOOR)[_\-](\d+)$/.exec(up);
    return { role: 'kapi', usageCode: uMatch ? Number(uMatch[1]) : 1004, sillMm: 10, heightMm: 2100 };
  }
  if (up.includes('PENCERE') || up.includes('WINDOW') || up.startsWith('PEN')) {
    const fullMatch = /(?:PENCERE|WINDOW|PEN)[_\-](\d+)[_\-](\-?\d+)[_\-](\d+)$/.exec(up);
    if (fullMatch) {
      return {
        role: 'pencere',
        usageCode: Number(fullMatch[1]),
        sillMm: Number(fullMatch[2]),
        heightMm: Number(fullMatch[3]),
      };
    }
    const uMatch = /(?:PENCERE|WINDOW|PEN)[_\-](\d+)$/.exec(up);
    return { role: 'pencere', usageCode: uMatch ? Number(uMatch[1]) : 1001, sillMm: 800, heightMm: 1300 };
  }
  if (up.includes('SUTUN') || up.includes('KOLON') || up.includes('COLUMN')) {
    return { role: 'sutun' };
  }
  if (up.includes('TIC') || up.includes('APLIKASYON')) {
    return { role: 'tic' };
  }
  return { role: 'altlik' };
}

function tokenizeDxf(dxfText: string): DxfTagPair[] {
  const lines = dxfText.split(/\r?\n/);
  const pairs: DxfTagPair[] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const codeStr = lines[i].trim();
    if (codeStr.length === 0 && i + 2 >= lines.length) break;
    const code = Number.parseInt(codeStr, 10);
    if (Number.isNaN(code)) continue;
    pairs.push({ code, value: lines[i + 1].trim() });
  }
  return pairs;
}

function unitFactorToMeters(unit: DxfUnit): number {
  switch (unit) {
    case 'mm':
      return 0.001;
    case 'cm':
      return 0.01;
    case 'm':
      return 1.0;
  }
}

/**
 * İki köşe arasındaki DXF `bulge = tan(θ / 4)` yayını, açı adımı `<= 5°` ve yay sapması (sagitta) `<= 0.05 m (5 cm)`
 * olacak şekilde doğru parçalarına böler (`§8.2`).
 */
export function tessellateBulgeSegment(
  p1: { readonly x: number; readonly y: number; readonly z: number },
  p2: { readonly x: number; readonly y: number; readonly z: number },
  bulge: number
): { readonly x: number; readonly y: number; readonly z: number }[] {
  if (!Number.isFinite(bulge) || Math.abs(bulge) < 1e-6) {
    return [p1];
  }
  const chordDx = p2.x - p1.x;
  const chordDy = p2.y - p1.y;
  const chordLen = Math.hypot(chordDx, chordDy);
  if (chordLen < 1e-6) return [p1];

  const includedAngle = 4 * Math.atan(bulge); // radyan (işaretli)
  const absAngle = Math.abs(includedAngle);
  const radius = chordLen / (2 * Math.sin(absAngle / 2));

  // 5 derece sınırı
  const maxStepAngleRad = (5 * Math.PI) / 180;
  // 5 cm (0.05 m) sagitta sınırı: s = R * (1 - cos(dTheta/2)) <= 0.05
  const maxSagittaM = 0.05;
  const sagittaStepRad =
    radius > maxSagittaM
      ? 2 * Math.acos(Math.max(-1, Math.min(1, 1 - maxSagittaM / radius)))
      : maxStepAngleRad;

  const stepAngle = Math.max(0.01, Math.min(maxStepAngleRad, sagittaStepRad));
  const numSteps = Math.max(2, Math.ceil(absAngle / stepAngle));

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  // Kiriş ortasından merkeze dik mesafe
  const cotHalf = (1 - bulge * bulge) / (2 * bulge);
  const perpX = -chordDy / 2;
  const perpY = chordDx / 2;
  const centerX = midX + cotHalf * perpX;
  const centerY = midY + cotHalf * perpY;

  const startAngle = Math.atan2(p1.y - centerY, p1.x - centerX);
  const points: { readonly x: number; readonly y: number; readonly z: number }[] = [p1];

  for (let s = 1; s < numSteps; s++) {
    const t = s / numSteps;
    const ang = startAngle + includedAngle * t;
    points.push({
      x: centerX + radius * Math.cos(ang),
      y: centerY + radius * Math.sin(ang),
      z: p1.z + (p2.z - p1.z) * t,
    });
  }
  return points;
}

/**
 * Yuvarlak sütun veya daire varlığını 12-gen (`K63`) kapalı halkaya dönüştürür (`// K63`).
 */
// K63
export function circleTo12GonMeters(
  cx: number,
  cy: number,
  cz: number,
  radiusM: number,
  segments = 12
): DxfRawVertex2D[] {
  const pts: DxfRawVertex2D[] = [];
  for (let i = 0; i < segments; i++) {
    const ang = (2 * Math.PI * i) / segments;
    pts.push({
      x: cx + radiusM * Math.cos(ang),
      y: cy + radiusM * Math.sin(ang),
      z: cz,
      bulge: 0,
    });
  }
  return pts;
}

function parseEntityList(
  pairs: readonly DxfTagPair[],
  startIdx: number,
  endIdx: number,
  scaleToM: number,
  blocksMap?: ReadonlyMap<string, readonly DxfParsedEntity[]>
): { entities: DxfParsedEntity[]; issues: DxfImportIssue[] } {
  const entities: DxfParsedEntity[] = [];
  const issues: DxfImportIssue[] = [];

  let i = startIdx;
  while (i < endIdx) {
    const tag = pairs[i];
    if (tag.code !== 0) {
      i++;
      continue;
    }
    const entityType = tag.value.toUpperCase();
    if (entityType === 'ENDSEC' || entityType === 'ENDBLK') {
      break;
    }

    if (entityType === 'LWPOLYLINE') {
      let layer = '0';
      let flags = 0;
      let elevation = 0;
      const verts: { x: number; y: number; z: number; bulge: number }[] = [];
      let curVert: { x: number; y: number; z: number; bulge: number } | null = null;
      i++;
      while (i < endIdx && pairs[i].code !== 0) {
        const c = pairs[i].code;
        const v = pairs[i].value;
        if (c === 8) layer = v || '0';
        else if (c === 70) flags = Number.parseInt(v, 10) || 0;
        else if (c === 38 || c === 30) {
          elevation = (Number.parseFloat(v) || 0) * scaleToM;
          if (curVert) curVert.z = elevation;
        } else if (c === 10) {
          if (curVert) verts.push(curVert);
          curVert = { x: (Number.parseFloat(v) || 0) * scaleToM, y: 0, z: elevation, bulge: 0 };
        } else if (c === 20 && curVert) {
          curVert.y = (Number.parseFloat(v) || 0) * scaleToM;
        } else if (c === 42 && curVert) {
          curVert.bulge = Number.parseFloat(v) || 0;
        }
        i++;
      }
      if (curVert) verts.push(curVert);
      if (verts.length >= 2) {
        // Bulge yaylarını kır
        const expanded: DxfRawVertex2D[] = [];
        const isClosed = (flags & 1) === 1;
        const count = verts.length;
        for (let k = 0; k < count; k++) {
          const v1 = verts[k];
          const v2 = k + 1 < count ? verts[k + 1] : isClosed ? verts[0] : null;
          if (v2 && Math.abs(v1.bulge) > 1e-6) {
            const segs = tessellateBulgeSegment(v1, v2, v1.bulge);
            for (const sp of segs) expanded.push({ ...sp, bulge: 0 });
          } else {
            expanded.push({ ...v1, bulge: 0 });
          }
        }
        entities.push({
          kind: 'POLYLINE',
          layer,
          closedFlag: isClosed,
          vertices: expanded,
        });
      }
      continue;
    }

    if (entityType === 'POLYLINE') {
      let layer = '0';
      let flags = 0;
      let defaultZ = 0;
      i++;
      while (i < endIdx && pairs[i].code !== 0) {
        const c = pairs[i].code;
        const v = pairs[i].value;
        if (c === 8) layer = v || '0';
        else if (c === 70) flags = Number.parseInt(v, 10) || 0;
        else if (c === 30) defaultZ = (Number.parseFloat(v) || 0) * scaleToM;
        i++;
      }
      const verts: { x: number; y: number; z: number; bulge: number }[] = [];
      while (i < endIdx) {
        if (pairs[i].code === 0 && pairs[i].value.toUpperCase() === 'VERTEX') {
          let vx = 0, vy = 0, vz = defaultZ, bulge = 0;
          i++;
          while (i < endIdx && pairs[i].code !== 0) {
            const c = pairs[i].code;
            const v = pairs[i].value;
            if (c === 10) vx = (Number.parseFloat(v) || 0) * scaleToM;
            else if (c === 20) vy = (Number.parseFloat(v) || 0) * scaleToM;
            else if (c === 30) vz = (Number.parseFloat(v) || 0) * scaleToM;
            else if (c === 42) bulge = Number.parseFloat(v) || 0;
            i++;
          }
          verts.push({ x: vx, y: vy, z: vz, bulge });
        } else if (pairs[i].code === 0 && pairs[i].value.toUpperCase() === 'SEQEND') {
          i++;
          while (i < endIdx && pairs[i].code !== 0) i++;
          break;
        } else {
          break;
        }
      }
      if (verts.length >= 2) {
        const isClosed = (flags & 1) === 1;
        const expanded: DxfRawVertex2D[] = [];
        for (let k = 0; k < verts.length; k++) {
          const v1 = verts[k];
          const v2 = k + 1 < verts.length ? verts[k + 1] : isClosed ? verts[0] : null;
          if (v2 && Math.abs(v1.bulge) > 1e-6) {
            const segs = tessellateBulgeSegment(v1, v2, v1.bulge);
            for (const sp of segs) expanded.push({ ...sp, bulge: 0 });
          } else {
            expanded.push({ ...v1, bulge: 0 });
          }
        }
        entities.push({
          kind: 'POLYLINE',
          layer,
          closedFlag: isClosed,
          vertices: expanded,
        });
      }
      continue;
    }

    if (entityType === 'LINE') {
      let layer = '0';
      let x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;
      i++;
      while (i < endIdx && pairs[i].code !== 0) {
        const c = pairs[i].code;
        const v = pairs[i].value;
        if (c === 8) layer = v || '0';
        else if (c === 10) x1 = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 20) y1 = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 30) z1 = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 11) x2 = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 21) y2 = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 31) z2 = (Number.parseFloat(v) || 0) * scaleToM;
        i++;
      }
      entities.push({ kind: 'LINE', layer, x1, y1, z1, x2, y2, z2 });
      continue;
    }

    if (entityType === 'CIRCLE') {
      let layer = '0';
      let cx = 0, cy = 0, cz = 0, radiusM = 0;
      i++;
      while (i < endIdx && pairs[i].code !== 0) {
        const c = pairs[i].code;
        const v = pairs[i].value;
        if (c === 8) layer = v || '0';
        else if (c === 10) cx = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 20) cy = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 30) cz = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 40) radiusM = (Number.parseFloat(v) || 0) * scaleToM;
        i++;
      }
      if (radiusM > 0) {
        entities.push({ kind: 'CIRCLE', layer, cx, cy, cz, radiusM });
      }
      continue;
    }

    if (entityType === 'ARC') {
      let layer = '0';
      let cx = 0, cy = 0, cz = 0, radiusM = 0, startDeg = 0, endDeg = 360;
      i++;
      while (i < endIdx && pairs[i].code !== 0) {
        const c = pairs[i].code;
        const v = pairs[i].value;
        if (c === 8) layer = v || '0';
        else if (c === 10) cx = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 20) cy = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 30) cz = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 40) radiusM = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 50) startDeg = Number.parseFloat(v) || 0;
        else if (c === 51) endDeg = Number.parseFloat(v) || 0;
        i++;
      }
      if (radiusM > 0) {
        let sweep = endDeg - startDeg;
        if (sweep <= 0) sweep += 360;
        const steps = Math.max(2, Math.ceil(sweep / 5));
        const verts: DxfRawVertex2D[] = [];
        for (let s = 0; s <= steps; s++) {
          const ang = ((startDeg + (sweep * s) / steps) * Math.PI) / 180;
          verts.push({
            x: cx + radiusM * Math.cos(ang),
            y: cy + radiusM * Math.sin(ang),
            z: cz,
            bulge: 0,
          });
        }
        entities.push({ kind: 'POLYLINE', layer, closedFlag: false, vertices: verts });
      }
      continue;
    }

    if (entityType === 'TEXT' || entityType === 'MTEXT') {
      let layer = '0';
      let x = 0, y = 0, z = 0, text = '';
      i++;
      while (i < endIdx && pairs[i].code !== 0) {
        const c = pairs[i].code;
        const v = pairs[i].value;
        if (c === 8) layer = v || '0';
        else if (c === 10) x = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 20) y = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 30) z = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 1 || c === 3) text += v;
        i++;
      }
      // MTEXT biçim kodlarını (\P, {\f...;...}) temizle
      const cleanText = text
        .replace(/\\P/g, ' ')
        .replace(/\\[A-Za-z][^;]*;/g, '')
        .replace(/[{}]/g, '')
        .trim();
      if (cleanText.length > 0) {
        entities.push({
          kind: 'TEXT',
          layer,
          x,
          y,
          z,
          text: cleanText,
          inferredPartUsage: inferPartUsageFromRoomLabel(cleanText),
        });
      }
      continue;
    }

    if (entityType === 'INSERT' && blocksMap) {
      let layer = '0';
      let blockName = '';
      let insX = 0, insY = 0, insZ = 0;
      let sx = 1, sy = 1, rotDeg = 0;
      i++;
      while (i < endIdx && pairs[i].code !== 0) {
        const c = pairs[i].code;
        const v = pairs[i].value;
        if (c === 8) layer = v || '0';
        else if (c === 2) blockName = v;
        else if (c === 10) insX = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 20) insY = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 30) insZ = (Number.parseFloat(v) || 0) * scaleToM;
        else if (c === 41) sx = Number.parseFloat(v) || 1;
        else if (c === 42) sy = Number.parseFloat(v) || 1;
        else if (c === 50) rotDeg = Number.parseFloat(v) || 0;
        i++;
      }
      const blockEntities = blocksMap.get(blockName);
      if (blockEntities) {
        const rad = (rotDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const txPt = (px: number, py: number, pz: number) => {
          const xScaled = px * sx;
          const yScaled = py * sy;
          return {
            x: cos * xScaled - sin * yScaled + insX,
            y: sin * xScaled + cos * yScaled + insY,
            z: pz + insZ,
          };
        };
        for (const be of blockEntities) {
          const targetLayer = be.layer === '0' ? layer : be.layer;
          if (be.kind === 'POLYLINE') {
            entities.push({
              kind: 'POLYLINE',
              layer: targetLayer,
              closedFlag: be.closedFlag,
              vertices: be.vertices.map((v) => ({ ...txPt(v.x, v.y, v.z), bulge: 0 })),
            });
          } else if (be.kind === 'LINE') {
            const p1 = txPt(be.x1, be.y1, be.z1);
            const p2 = txPt(be.x2, be.y2, be.z2);
            entities.push({
              kind: 'LINE',
              layer: targetLayer,
              x1: p1.x,
              y1: p1.y,
              z1: p1.z,
              x2: p2.x,
              y2: p2.y,
              z2: p2.z,
            });
          } else if (be.kind === 'CIRCLE') {
            const c = txPt(be.cx, be.cy, be.cz);
            entities.push({
              kind: 'CIRCLE',
              layer: targetLayer,
              cx: c.x,
              cy: c.y,
              cz: c.z,
              radiusM: be.radiusM * Math.hypot(sx, sy) * Math.SQRT1_2,
            });
          }
        }
      }
      continue;
    }

    // Tanınmayan varlığı atla
    i++;
    while (i < endIdx && pairs[i].code !== 0) i++;
  }

  return { entities, issues };
}

/**
 * ASCII DXF dosyasını ayrıştırır (`§8.2`):
 * - `$INSUNITS` (`4 = mm`, `5 = cm`, `6 = m`) okur; yoksa `fallbackUnit` (varsayılan `'m'`) kullanır.
 * - `BLOCKS` ve `ENTITIES` bölümlerindeki `LWPOLYLINE`, `POLYLINE`, `LINE`, `CIRCLE`, `ARC`, `INSERT`, `TEXT`/`MTEXT` varlıklarını okur.
 * - Koordinatların zaten TUREF TM aralığında (`300000 < E < 700000`, `2500000 < N < 5000000`) olup olmadığını tespit eder.
 */
// K08
// K63
export function parseDxfText(
  dxfText: string,
  options: { readonly fallbackUnit?: DxfUnit; readonly overrideUnit?: DxfUnit } = {}
): ParsedDxfDocument {
  const pairs = tokenizeDxf(dxfText);
  const issues: DxfImportIssue[] = [];

  let detectedInsUnits: number | null = null;
  for (let i = 0; i + 1 < pairs.length; i++) {
    if (pairs[i].code === 9 && pairs[i].value === '$INSUNITS') {
      if (pairs[i + 1].code === 70) {
        detectedInsUnits = Number.parseInt(pairs[i + 1].value, 10);
      }
      break;
    }
  }

  let effectiveUnit: DxfUnit = options.fallbackUnit ?? 'm';
  if (options.overrideUnit) {
    effectiveUnit = options.overrideUnit;
  } else if (detectedInsUnits === 4) {
    effectiveUnit = 'mm';
  } else if (detectedInsUnits === 5) {
    effectiveUnit = 'cm';
  } else if (detectedInsUnits === 6) {
    effectiveUnit = 'm';
  } else if (detectedInsUnits !== null && detectedInsUnits !== 0) {
    issues.push({
      code: 'M7-DXF-UNIT',
      severity: 'B',
      layer: '-',
      message: `$INSUNITS=${detectedInsUnits} standart dışı; birim "${effectiveUnit}" olarak kabul edildi.`,
    });
  }

  const scaleToM = unitFactorToMeters(effectiveUnit);

  // BLOCKS bölümünü oku
  const blocksMap = new Map<string, readonly DxfParsedEntity[]>();
  for (let i = 0; i < pairs.length; i++) {
    if (
      pairs[i].code === 0 &&
      pairs[i].value.toUpperCase() === 'SECTION' &&
      i + 1 < pairs.length &&
      pairs[i + 1].code === 2 &&
      pairs[i + 1].value.toUpperCase() === 'BLOCKS'
    ) {
      let j = i + 2;
      while (j < pairs.length) {
        if (pairs[j].code === 0 && pairs[j].value.toUpperCase() === 'ENDSEC') break;
        if (pairs[j].code === 0 && pairs[j].value.toUpperCase() === 'BLOCK') {
          let blockName = '';
          j++;
          while (j < pairs.length && pairs[j].code !== 0) {
            if (pairs[j].code === 2 || pairs[j].code === 3) blockName = pairs[j].value;
            j++;
          }
          const blockStart = j;
          while (
            j < pairs.length &&
            !(pairs[j].code === 0 && pairs[j].value.toUpperCase() === 'ENDBLK')
          ) {
            j++;
          }
          if (blockName) {
            const parsedBlock = parseEntityList(pairs, blockStart, j, scaleToM);
            blocksMap.set(blockName, parsedBlock.entities);
          }
        }
        j++;
      }
      break;
    }
  }

  // ENTITIES bölümünü oku (SECTION yoksa tüm dosyayı tara)
  let entitiesStart = 0;
  let entitiesEnd = pairs.length;
  for (let i = 0; i < pairs.length; i++) {
    if (
      pairs[i].code === 0 &&
      pairs[i].value.toUpperCase() === 'SECTION' &&
      i + 1 < pairs.length &&
      pairs[i + 1].code === 2 &&
      pairs[i + 1].value.toUpperCase() === 'ENTITIES'
    ) {
      entitiesStart = i + 2;
      for (let k = entitiesStart; k < pairs.length; k++) {
        if (pairs[k].code === 0 && pairs[k].value.toUpperCase() === 'ENDSEC') {
          entitiesEnd = k;
          break;
        }
      }
      break;
    }
  }

  const parsed = parseEntityList(pairs, entitiesStart, entitiesEnd, scaleToM, blocksMap);
  issues.push(...parsed.issues);

  const layerSet = new Set<string>();
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let coordCount = 0;
  let turefValidCount = 0;

  const recordSamplePt = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    coordCount++;
    if (isValidTurefCoord(x, y)) turefValidCount++;
  };

  for (const ent of parsed.entities) {
    layerSet.add(ent.layer);
    if (ent.kind === 'POLYLINE') {
      for (const v of ent.vertices) recordSamplePt(v.x, v.y);
    } else if (ent.kind === 'LINE') {
      recordSamplePt(ent.x1, ent.y1);
      recordSamplePt(ent.x2, ent.y2);
    } else if (ent.kind === 'CIRCLE') {
      recordSamplePt(ent.cx, ent.cy);
    } else if (ent.kind === 'TEXT') {
      recordSamplePt(ent.x, ent.y);
    }
  }

  const isAlreadyTuref = coordCount > 0 && turefValidCount === coordCount;

  return {
    detectedInsUnits,
    effectiveUnit,
    unitToMeterFactor: scaleToM,
    layers: Array.from(layerSet).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    entities: parsed.entities,
    isAlreadyTuref,
    sampleCoordBounds: coordCount > 0 ? { minX, minY, maxX, maxY } : null,
    issues,
  };
}

/**
 * Aynı katmandaki uç uca değen (`<= 1 mm` toleranslı) `LINE` parçalarını kapalı çokgen halkalarına (`Ring2`) zincirler (`§8.2`).
 */
export function chainLinesToRingsMm(
  segments: readonly { readonly a: Pt2; readonly b: Pt2 }[],
  snapToleranceMm = 1
): { readonly closedRings: Ring2[]; readonly leftoverSegments: { readonly a: Pt2; readonly b: Pt2 }[] } {
  const used = new Array<boolean>(segments.length).fill(false);
  const closedRings: Ring2[] = [];
  const leftoverSegments: { readonly a: Pt2; readonly b: Pt2 }[] = [];

  const distMm = (p: Pt2, q: Pt2) => Math.hypot(p.x - q.x, p.y - q.y);

  for (let i = 0; i < segments.length; i++) {
    if (used[i]) continue;
    const seg = segments[i];
    if (distMm(seg.a, seg.b) <= snapToleranceMm) {
      used[i] = true;
      continue;
    }
    used[i] = true;
    const chain: Pt2[] = [seg.a, seg.b];

    let extended = true;
    while (extended) {
      extended = false;
      const tail = chain[chain.length - 1];
      if (chain.length >= 4 && distMm(tail, chain[0]) <= snapToleranceMm) {
        break;
      }
      for (let j = 0; j < segments.length; j++) {
        if (used[j]) continue;
        const cand = segments[j];
        if (distMm(tail, cand.a) <= snapToleranceMm) {
          used[j] = true;
          chain.push(cand.b);
          extended = true;
          break;
        }
        if (distMm(tail, cand.b) <= snapToleranceMm) {
          used[j] = true;
          chain.push(cand.a);
          extended = true;
          break;
        }
      }
    }

    if (chain.length >= 4 && distMm(chain[chain.length - 1], chain[0]) <= snapToleranceMm) {
      const ring = deduplicateConsecutiveMm(chain.slice(0, -1));
      if (ring.length >= 3) {
        closedRings.push(ring);
        continue;
      }
    }
    for (let k = 0; k + 1 < chain.length; k++) {
      leftoverSegments.push({ a: chain[k], b: chain[k + 1] });
    }
  }

  return { closedRings, leftoverSegments };
}

function deduplicateConsecutiveMm(pts: readonly Pt2[]): Pt2[] {
  const out: Pt2[] = [];
  for (const p of pts) {
    const prev = out[out.length - 1];
    if (!prev || prev.x !== p.x || prev.y !== p.y) {
      out.push(p);
    }
  }
  if (out.length >= 2) {
    const first = out[0];
    const last = out[out.length - 1];
    if (first.x === last.x && first.y === last.y) {
      out.pop();
    }
  }
  return out;
}

/**
 * Ayrıştırılmış DXF belgesini:
 * - Zaten TUREF koordinatlarındaysa (`doc.isAlreadyTuref === true`) doğrudan,
 * - Yerel CAD koordinatlarındaysa çözülmüş `helmert` parametreleriyle
 * proje yerel `Georef` (`originE, originN`, tam metre) ve `mm` tamsayı koordinatlarına (`K76`) dönüştürür (`§8.2`, `§11`).
 */
// K63
// K76
export function georeferenceDxfDocument(
  doc: ParsedDxfDocument,
  options: {
    readonly epsg?: TurefEpsgCode;
    readonly zeroElevationOrthometricMm?: number;
    readonly helmert?: Pick<Helmert2DResult, 'a' | 'b' | 'tE' | 'tN'>;
    readonly targetGeoref?: Georef;
  } = {}
): GeoreferencedDxfResult {
  const epsg = options.epsg ?? options.targetGeoref?.epsg ?? 5254;
  const zeroElevMm =
    options.zeroElevationOrthometricMm ??
    options.targetGeoref?.zeroElevationOrthometric ??
    1_000_000;

  const toTurefEN = (xM: number, yM: number): { readonly e: number; readonly n: number } => {
    if (options.helmert) {
      const h = options.helmert;
      return {
        e: h.a * xM - h.b * yM + h.tE,
        n: h.b * xM + h.a * yM + h.tN,
      };
    }
    return { e: xM, n: yM };
  };

  let georef = options.targetGeoref;
  if (!georef) {
    const sampleTurefPts: { e: number; n: number }[] = [];
    for (const ent of doc.entities) {
      if (ent.kind === 'POLYLINE') {
        for (const v of ent.vertices) sampleTurefPts.push(toTurefEN(v.x, v.y));
      } else if (ent.kind === 'LINE') {
        sampleTurefPts.push(toTurefEN(ent.x1, ent.y1));
        sampleTurefPts.push(toTurefEN(ent.x2, ent.y2));
      } else if (ent.kind === 'CIRCLE') {
        sampleTurefPts.push(toTurefEN(ent.cx, ent.cy));
      }
    }
    georef = computeOriginFromTurefPoints(sampleTurefPts, epsg, zeroElevMm);
  }

  const activeGeoref = georef;
  const toDesignPt2 = (xM: number, yM: number): Pt2 => {
    const t = toTurefEN(xM, yM);
    return {
      x: Math.round((t.e - activeGeoref.originE) * 1000),
      y: Math.round((t.n - activeGeoref.originN) * 1000),
    };
  };

  const issues: DxfImportIssue[] = [...doc.issues];
  const byLayerMutable = new Map<
    string,
    {
      closedRingsMm: Ring2[];
      openChainsMm: (readonly Pt2[])[];
      lineSegmentsMm: { a: Pt2; b: Pt2; zMm: number }[];
      points3dMm: Pt3[];
      textsMm: { pos: Pt2; text: string; inferredPartUsage: number | null }[];
    }
  >();

  const ensureLayer = (layer: string) => {
    let rec = byLayerMutable.get(layer);
    if (!rec) {
      rec = {
        closedRingsMm: [],
        openChainsMm: [],
        lineSegmentsMm: [],
        points3dMm: [],
        textsMm: [],
      };
      byLayerMutable.set(layer, rec);
    }
    return rec;
  };

  for (const ent of doc.entities) {
    const layerRec = ensureLayer(ent.layer);

    if (ent.kind === 'POLYLINE') {
      const mmPts = ent.vertices.map((v) => toDesignPt2(v.x, v.y));
      for (const v of ent.vertices) {
        const p2 = toDesignPt2(v.x, v.y);
        const zMm = v.z !== 0 ? Math.round(v.z * 1000) : activeGeoref.zeroElevationOrthometric;
        layerRec.points3dMm.push({ x: p2.x, y: p2.y, z: zMm });
      }
      const first = mmPts[0];
      const last = mmPts[mmPts.length - 1];
      const gapMm = Math.hypot(first.x - last.x, first.y - last.y);
      // §8.2: İlk ve son nokta arası <= 1 mm ise kapalı kabul edilir
      const isClosed = ent.closedFlag || gapMm <= 1;
      const cleaned = deduplicateConsecutiveMm(mmPts);
      if (isClosed && cleaned.length >= 3) {
        layerRec.closedRingsMm.push(cleaned);
      } else if (cleaned.length === 2) {
        layerRec.lineSegmentsMm.push({
          a: cleaned[0],
          b: cleaned[1],
          zMm: Math.round((ent.vertices[0]?.z ?? 0) * 1000),
        });
      } else if (cleaned.length >= 3) {
        layerRec.openChainsMm.push(cleaned);
        issues.push({
          code: 'M7-DXF-OPEN',
          severity: 'U',
          layer: ent.layer,
          message: `Katman "${ent.layer}" üzerinde açık çokgen bulundu (ilk-son nokta açıklığı: ${gapMm.toFixed(1)} mm > 1 mm).`,
        });
      }
    } else if (ent.kind === 'LINE') {
      const a = toDesignPt2(ent.x1, ent.y1);
      const b = toDesignPt2(ent.x2, ent.y2);
      const zMm =
        ent.z1 !== 0 ? Math.round(ent.z1 * 1000) : activeGeoref.zeroElevationOrthometric;
      layerRec.lineSegmentsMm.push({ a, b, zMm });
    } else if (ent.kind === 'CIRCLE') {
      // K63: Sütun > 50 cm (çap > 500 mm) ise çizilir; yuvarlak = 12-gen
      const diameterMm = ent.radiusM * 2000;
      const circleVerts = circleTo12GonMeters(ent.cx, ent.cy, ent.cz, ent.radiusM, 12);
      const ringMm = deduplicateConsecutiveMm(
        circleVerts.map((v) => toDesignPt2(v.x, v.y))
      );
      if (diameterMm <= 500) {
        issues.push({
          code: 'K63-SUTUN-50CM',
          severity: 'B',
          layer: ent.layer,
          message: `Dairesel eleman (çap ${diameterMm.toFixed(0)} mm <= 500 mm) K63 gereği sütun eşiğinin altında.`,
        });
      }
      if (ringMm.length >= 3) {
        layerRec.closedRingsMm.push(ringMm);
      }
    } else if (ent.kind === 'TEXT') {
      layerRec.textsMm.push({
        pos: toDesignPt2(ent.x, ent.y),
        text: ent.text,
        inferredPartUsage: ent.inferredPartUsage,
      });
    }
  }

  // Her katmandaki LINE parçalarından kapalı poligon oluşabilenleri zincirle
  const byLayer: Record<string, DxfGeoreferencedLayerRings> = {};
  const allUnderlayRingsMm: Ring2[] = [];

  for (const [layer, rec] of byLayerMutable.entries()) {
    const chained = chainLinesToRingsMm(rec.lineSegmentsMm, 1);
    const closedRingsMm = [...rec.closedRingsMm, ...chained.closedRings];
    for (const r of closedRingsMm) {
      allUnderlayRingsMm.push(r);
    }
    byLayer[layer] = {
      layer,
      closedRingsMm,
      openChainsMm: rec.openChainsMm,
      lineSegmentsMm: rec.lineSegmentsMm,
      points3dMm: rec.points3dMm,
      textsMm: rec.textsMm,
    };
  }

  return {
    georef: activeGeoref,
    byLayer,
    allUnderlayRingsMm,
    issues,
  };
}

export interface DxfStoreyImportSummary {
  readonly project: DesignProject;
  readonly importedStoreyOutlines: number;
  readonly importedSectionParts: number;
  readonly importedParts: number;
  readonly importedOpenings: number;
  readonly importedBalconies: number;
  readonly importedTicPoints: number;
  readonly underlayRingsMm: readonly Ring2[];
  readonly issues: readonly DxfImportIssue[];
}

/**
 * Konumlandırılmış DXF katmanlarını kullanıcı katman eşleme tablosuna (`layerMapping`) göre
 * `DesignProject` içindeki hedef kata (`targetStoreyId`) aktarır (`§8.2`, `§11`, `// K76`, `// K92`).
 * - İç kısım (`K71`): Bir kısmın tamamen içinde yer alan kısım dış kısma delik (`holes`) olarak açılır.
 * - Mahal etiketleri (`TEXT`/`MTEXT`): Bir kısmın içinde `inferredPartUsage` taşıyan etiket varsa kısmın `usage` değerini otomatik atar.
 * - Balkon (`BLKN_`): Kat dış sınırıyla paylaşılan kenarları (`attachedEdges`) otomatik tespit eder (`§7.4`).
 */
// K71
// K76
// K92
export function importDxfIntoDesignStorey(
  project: DesignProject,
  georefDxf: GeoreferencedDxfResult,
  targetStoreyId: string,
  layerMapping: DxfLayerMappingTable
): DxfStoreyImportSummary {
  const b0 = project.buildings[0];
  if (!b0) {
    throw new Error('Projede bina bulunamadı.');
  }
  const storey = b0.storeys.find((s) => s.id === targetStoreyId);
  if (!storey) {
    throw new Error(`Hedef kat (${targetStoreyId}) bulunamadı.`);
  }

  let idSeq = project.idSeq;
  const allocId = (kind: string): string => {
    const id = uuidv5(`${project.id}:${kind}:${idSeq}`);
    idSeq += 1;
    return id;
  };

  const issues: DxfImportIssue[] = [...georefDxf.issues];
  const newOutlines: Poly2[] = [...storey.outline];
  const newSectionParts: SectionPart[] = [
    ...b0.sectionParts.filter((sp) => sp.storeyId !== targetStoreyId),
  ];
  const currentStoreySectionParts: SectionPart[] = [
    ...b0.sectionParts.filter((sp) => sp.storeyId === targetStoreyId),
  ];
  const otherStoreyParts: Part[] = b0.parts.filter((p) => p.storeyId !== targetStoreyId);
  const currentStoreyParts: Part[] = [...b0.parts.filter((p) => p.storeyId === targetStoreyId)];
  const currentOpenings: Opening[] = [...(b0.openings ?? [])];
  const currentBalconies: Balcony[] = [...(b0.balconies ?? [])];
  let nextTic: readonly Pt3[] | undefined = b0.tic;

  let importedStoreyOutlines = 0;
  let importedSectionParts = 0;
  let importedParts = 0;
  let importedOpenings = 0;
  let importedBalconies = 0;
  let importedTicPoints = 0;

  // Tüm TEXT etiketlerini topla (kısım kullanım tespiti için)
  const allTexts = Object.values(georefDxf.byLayer).flatMap((l) => l.textsMm);

  // 1. Geçiş: Kat sınırı ve TIC
  for (const [layerName, layerData] of Object.entries(georefDxf.byLayer)) {
    const rule = layerMapping[layerName];
    if (!rule || rule.role === 'yok_say' || rule.role === 'altlik') continue;

    if (rule.role === 'kat_siniri') {
      for (const ring of layerData.closedRingsMm) {
        if (!isSimpleRing(ring)) {
          issues.push({
            code: 'V-034',
            severity: 'U',
            layer: layerName,
            message: `Kat sınırı çokgeni kendini kesiyor; atlandı (${layerName}).`,
          });
          continue;
        }
        newOutlines.push(normalizeOrientation({ outer: ring, holes: [] }));
        importedStoreyOutlines++;
      }
    } else if (rule.role === 'tic') {
      if (layerData.points3dMm.length >= 3) {
        nextTic = layerData.points3dMm;
        importedTicPoints = layerData.points3dMm.length;
      }
    }
  }

  // 2. Geçiş: Bağımsız Bölüm (BB) parçaları
  for (const [layerName, layerData] of Object.entries(georefDxf.byLayer)) {
    const rule = layerMapping[layerName];
    if (!rule || rule.role !== 'bb') continue;

    for (const ring of layerData.closedRingsMm) {
      if (!isSimpleRing(ring)) continue;
      const poly = normalizeOrientation({ outer: ring, holes: [] });
      // Hangi BB'ye bağlanacağını bul
      let section = b0.sections.find(
        (s) =>
          s.id === rule.sectionIdOrNumber ||
          s.number === rule.sectionIdOrNumber
      );
      if (!section) {
        // Katman adında BB_<no> varsa veya içinde TEXT etiketi varsa ara
        const layerNumMatch = /(?:BB[_\-\s]*)(\w+)$/i.exec(layerName);
        if (layerNumMatch) {
          section = b0.sections.find((s) => s.number === layerNumMatch[1]);
        }
      }
      if (!section) {
        section = b0.sections[importedSectionParts % Math.max(1, b0.sections.length)];
      }
      if (!section) {
        issues.push({
          code: 'M7-DXF-NO-SEC',
          severity: 'U',
          layer: layerName,
          message: `Projede bağımsız bölüm tanımı yok; önce liste beyan ekleyin (${layerName}).`,
        });
        continue;
      }

      const spId = allocId('bb');
      currentStoreySectionParts.push({
        id: spId,
        sectionId: section.id,
        storeyId: targetStoreyId,
        usage: 1001,
        outline: poly,
      });
      importedSectionParts++;
    }
  }

  // 3. Geçiş: Kısımlar (BBK) ve Ortak Alanlar (OA)
  for (const [layerName, layerData] of Object.entries(georefDxf.byLayer)) {
    const rule = layerMapping[layerName];
    if (!rule || (rule.role !== 'kisim' && rule.role !== 'oa')) continue;

    const kind: Part['kind'] = rule.role === 'kisim' ? 'BBK' : 'OA';
    for (const ring of layerData.closedRingsMm) {
      if (!isSimpleRing(ring)) continue;
      const poly = normalizeOrientation({ outer: ring, holes: [] });
      const centroid = ringCentroid(poly.outer);

      // İçinde mahal etiketi (TEXT) varsa partUsage kodunu al, yoksa katman adından veya kuraldan al
      const textInside = allTexts.find(
        (t) => t.inferredPartUsage !== null && pointInPoly(t.pos, poly) === 1
      );
      const layerUsage = inferPartUsageFromRoomLabel(layerName);
      const usage =
        textInside?.inferredPartUsage ??
        rule.usageCode ??
        layerUsage ??
        (kind === 'BBK' ? 1001 : 1022);

      let sectionPartIds: string[] = [];
      if (kind === 'BBK') {
        const sp =
          currentStoreySectionParts.find((x) => pointInPoly(centroid, x.outline) >= 0) ??
          currentStoreySectionParts[0];
        if (!sp) {
          issues.push({
            code: 'T-02',
            severity: 'U',
            layer: layerName,
            message: `Kısım (${layerName}) herhangi bir BB parçasının içinde değil; atlandı.`,
          });
          continue;
        }
        sectionPartIds = [sp.id];
      }

      currentStoreyParts.push({
        id: allocId(kind === 'BBK' ? 'bbk' : 'oa'),
        kind,
        storeyId: targetStoreyId,
        sectionPartIds,
        usage,
        polygon: poly,
        planArea: -1,
      });
      importedParts++;
    }
  }

  // K71: Aynı kattaki bir kısmın tamamen içinde yer alan kısım varsa dış kısma delik olarak aç
  const resolvedStoreyParts: Part[] = currentStoreyParts.map((outerPart) => {
    const innerHoles: Ring2[] = [...outerPart.polygon.holes];
    for (const innerPart of currentStoreyParts) {
      if (innerPart.id === outerPart.id) continue;
      const c = ringCentroid(innerPart.polygon.outer);
      if (
        ringInsidePoly(innerPart.polygon.outer, outerPart.polygon) &&
        pointInPoly(c, outerPart.polygon) === 1
      ) {
        const alreadyHas = innerHoles.some(
          (h) =>
            h.length === innerPart.polygon.outer.length &&
            Math.hypot(h[0].x - innerPart.polygon.outer[0].x, h[0].y - innerPart.polygon.outer[0].y) <= 2
        );
        if (!alreadyHas) {
          innerHoles.push(innerPart.polygon.outer);
        }
      }
    }
    if (innerHoles.length === outerPart.polygon.holes.length) return outerPart;
    return {
      ...outerPart,
      polygon: normalizeOrientation({ outer: outerPart.polygon.outer, holes: innerHoles }),
    };
  });

  // 4. Geçiş: Balkon / Teras
  const storeyOuterEdges: [Pt2, Pt2][] = [];
  for (const outPoly of newOutlines) {
    for (const r of [outPoly.outer, ...outPoly.holes]) {
      for (let i = 0; i < r.length; i++) {
        storeyOuterEdges.push([r[i], r[(i + 1) % r.length]]);
      }
    }
  }

  const onSegmentMm = (p: Pt2, a: Pt2, b: Pt2, tol: number) => {
    const L = Math.hypot(b.x - a.x, b.y - a.y);
    if (L < 1) return false;
    const t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / L;
    const d = Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / L;
    return d <= tol && t >= -tol && t <= L + tol;
  };

  for (const [layerName, layerData] of Object.entries(georefDxf.byLayer)) {
    const rule = layerMapping[layerName];
    if (!rule || rule.role !== 'balkon') continue;

    for (const ring of layerData.closedRingsMm) {
      if (!isSimpleRing(ring)) continue;
      const poly = normalizeOrientation({ outer: ring, holes: [] });
      const r = poly.outer;
      // Bina dış sınırıyla ortak olan kenarları bul (her iki uç nokta kat sınırı kenarı üzerindeyse, tolerans <= 5 mm)
      const attachedEdges: [Pt2, Pt2][] = [];
      for (let i = 0; i < r.length; i++) {
        const a = r[i];
        const b = r[(i + 1) % r.length];
        const touchesBuilding = storeyOuterEdges.some(
          ([sa, sb]) => onSegmentMm(a, sa, sb, 5) && onSegmentMm(b, sa, sb, 5)
        );
        if (touchesBuilding) {
          attachedEdges.push([a, b]);
        }
      }
      const nearestSp = currentStoreySectionParts[0] ?? null;
      currentBalconies.push({
        id: allocId('blkn'),
        kind: layerName.toUpperCase().includes('TERAS') ? 'Teras' : 'Balkon',
        storeyId: targetStoreyId,
        sectionPartId: nearestSp?.id ?? null,
        outline: r,
        attachedEdges,
        parapetHeight: 1000,
        parapetThickness: 100,
        planArea: -1,
      });
      importedBalconies++;
    }
  }

  // 5. Geçiş: Kapı ve Pencere açıklıkları (LINE parçaları veya ince dikdörtgenlerden)
  for (const [layerName, layerData] of Object.entries(georefDxf.byLayer)) {
    const rule = layerMapping[layerName];
    if (!rule || (rule.role !== 'kapi' && rule.role !== 'pencere')) continue;

    const kind: Opening['kind'] = rule.role === 'kapi' ? 'door' : 'window';
    const usage = rule.usageCode ?? (kind === 'door' ? 1004 : 1001);
    const sill = rule.sillMm ?? (kind === 'door' ? 10 : 800);
    const height = rule.heightMm ?? (kind === 'door' ? 2100 : 1300);

    for (const seg of layerData.lineSegmentsMm) {
      const len = Math.hypot(seg.b.x - seg.a.x, seg.b.y - seg.a.y);
      if (len < 200) continue; // 20 cm'den kısa çizgileri atla
      currentOpenings.push({
        id: allocId(kind === 'door' ? 'kapi' : 'pen'),
        kind,
        usage,
        storeyId: targetStoreyId,
        anchor: { a: seg.a, b: seg.b },
        sill,
        height,
      });
      importedOpenings++;
    }
  }

  const nextCardinalDirections: Record<string, readonly number[]> = {
    ...(b0.cardinalDirections ?? {}),
  };
  for (const sp of currentStoreySectionParts) {
    if (!nextCardinalDirections[sp.id] && nextCardinalDirections[sp.sectionId]) {
      nextCardinalDirections[sp.id] = nextCardinalDirections[sp.sectionId];
    }
  }

  const nextBuilding: DesignBuilding = {
    ...b0,
    storeys: b0.storeys.map((st) =>
      st.id === targetStoreyId ? { ...st, outline: newOutlines } : st
    ),
    sectionParts: [...newSectionParts, ...currentStoreySectionParts],
    parts: [...otherStoreyParts, ...resolvedStoreyParts],
    openings: currentOpenings,
    balconies: currentBalconies,
    cardinalDirections: nextCardinalDirections,
    ...(nextTic !== undefined ? { tic: nextTic } : {}),
  };

  return {
    project: {
      ...project,
      idSeq,
      georef: georefDxf.georef,
      buildings: project.buildings.map((b, idx) => (idx === 0 ? nextBuilding : b)),
    },
    importedStoreyOutlines,
    importedSectionParts,
    importedParts,
    importedOpenings,
    importedBalconies,
    importedTicPoints,
    underlayRingsMm: georefDxf.allUnderlayRingsMm,
    issues,
  };
}

/**
 * Bir tasarım projesinin (`DesignProject`) seçili katını çok katmanlı ASCII DXF metnine dönüştürür.
 * - `inverseHelmert` verilirse TUREF koordinatlarını yerel CAD koordinatlarına çevirerek yazar (M7 §11 altın kabul testi ve CAD dışa aktarma için).
 * - Verilmezse doğrudan TUREF metre koordinatlarıyla yazar.
 */
export function exportDesignStoreyToDxf(
  project: DesignProject,
  storeyId: string,
  options: {
    readonly inverseHelmert?: Pick<Helmert2DResult, 'a' | 'b' | 'tE' | 'tN'>;
    readonly unit?: DxfUnit;
  } = {}
): string {
  const b = project.buildings[0];
  const st = b?.storeys.find((s) => s.id === storeyId);
  if (!b || !st) {
    throw new Error('Dışa aktarılacak kat bulunamadı.');
  }

  const unit = options.unit ?? 'm';
  const insUnitsCode = unit === 'mm' ? 4 : unit === 'cm' ? 5 : 6;
  const meterToUnit = unit === 'mm' ? 1000 : unit === 'cm' ? 100 : 1;

  const toDxfXY = (pMm: Pt2): { readonly x: number; readonly y: number } => {
    const e = project.georef.originE + pMm.x / 1000;
    const n = project.georef.originN + pMm.y / 1000;
    if (options.inverseHelmert) {
      const h = options.inverseHelmert;
      const det = h.a * h.a + h.b * h.b;
      const dE = e - h.tE;
      const dN = n - h.tN;
      const localXM = (h.a * dE + h.b * dN) / det;
      const localYM = (-h.b * dE + h.a * dN) / det;
      return { x: localXM * meterToUnit, y: localYM * meterToUnit };
    }
    return { x: e * meterToUnit, y: n * meterToUnit };
  };

  const lines: string[] = [
    '0', 'SECTION',
    '2', 'HEADER',
    '9', '$INSUNITS',
    '70', String(insUnitsCode),
    '0', 'ENDSEC',
    '0', 'SECTION',
    '2', 'ENTITIES',
  ];

  const writeClosedLwPolyline = (layer: string, ring: Ring2, elevationM = 0) => {
    lines.push('0', 'LWPOLYLINE', '8', layer, '70', '1', '38', elevationM.toFixed(4));
    for (const p of ring) {
      const c = toDxfXY(p);
      lines.push('10', c.x.toFixed(6), '20', c.y.toFixed(6));
    }
  };

  const writeLine = (layer: string, a: Pt2, bPt: Pt2) => {
    const c1 = toDxfXY(a);
    const c2 = toDxfXY(bPt);
    lines.push(
      '0', 'LINE',
      '8', layer,
      '10', c1.x.toFixed(6),
      '20', c1.y.toFixed(6),
      '11', c2.x.toFixed(6),
      '21', c2.y.toFixed(6)
    );
  };

  for (const poly of st.outline) {
    writeClosedLwPolyline('KAT_SINIRI', poly.outer, st.zBottom / 1000);
  }

  for (const sp of b.sectionParts.filter((x) => x.storeyId === storeyId)) {
    const sec = b.sections.find((s) => s.id === sp.sectionId);
    writeClosedLwPolyline(`BB_${sec?.number ?? '1'}`, sp.outline.outer, st.zBottom / 1000);
  }

  for (const pt of b.parts.filter((x) => x.storeyId === storeyId)) {
    const layer = pt.kind === 'OA' ? `OA_${pt.usage}` : `KISIM_${pt.usage}`;
    writeClosedLwPolyline(layer, pt.polygon.outer, st.zBottom / 1000);
  }

  for (const bal of (b.balconies ?? []).filter((x) => x.storeyId === storeyId)) {
    writeClosedLwPolyline(bal.kind === 'Teras' ? 'TERAS' : 'BALKON', bal.outline, st.zBottom / 1000);
  }

  for (const op of (b.openings ?? []).filter((x) => x.storeyId === storeyId)) {
    const layer =
      op.kind === 'door'
        ? `KAPI_${op.usage}_${op.sill}_${op.height}`
        : `PENCERE_${op.usage}_${op.sill}_${op.height}`;
    writeLine(layer, op.anchor.a, op.anchor.b);
  }

  if (b.tic && b.tic.length >= 3) {
    lines.push('0', 'LWPOLYLINE', '8', 'TIC', '70', '1');
    for (const tp of b.tic) {
      const c = toDxfXY({ x: tp.x, y: tp.y });
      lines.push('10', c.x.toFixed(6), '20', c.y.toFixed(6), '38', (tp.z / 1000).toFixed(4));
    }
  }

  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\r\n') + '\r\n';
}
