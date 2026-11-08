// K55
// K79
// K87
// K99
// V-060
// V-215
import { compareCodeUnits } from '../hash/canonical.ts';
import {
  ALLOWED_GENERIC_ATTRIBUTES,
  GenericAttributeType,
  ORNEK6_GENERIC_ATTRIBUTES,
  ProducerProfile,
  StoreyGeometryForm,
  ValidationIssue,
} from '../model/index.ts';

export interface ExtractedGenericAttribute {
  readonly name: string;
  readonly type: GenericAttributeType;
  readonly spec: string; // "<name>:<type>"
  readonly occurrenceCount: number;
}

export interface GmlSampleInspectionReport {
  readonly constructionID: string;
  readonly buildingGmlId: string;
  readonly srsName: string;
  readonly envelopeLowerCorner: string;
  readonly envelopeUpperCorner: string;
  readonly roofProjectionArea: number;
  readonly buildingHeight: number;
  readonly confirmationDate: string;
  readonly totalIndependentSectionCountAttr: number;
  readonly counts: {
    readonly MB: number;
    readonly K: number;
    readonly BB: number;
    readonly BBK: number;
    readonly OA: number;
    readonly BBKIY: number;
    readonly OAIY: number;
    readonly BLKN: number;
    readonly TRS: number;
    readonly KAPI: number;
    readonly PEN: number;
    readonly MBG: number;
  };
  readonly coordinateEncoding: 'gml:pos' | 'gml:posList' | 'mixed';
  readonly detectedStoreyForm: StoreyGeometryForm;
  readonly detectedStoreyForms: readonly StoreyGeometryForm[];
  readonly hasInconsistentStoreyForms: boolean;
  readonly detectedDoorBottomOffsetMm: number | null;
  readonly doorOffsetInfoIssue: ValidationIssue | null;
  readonly detectedProducerProfile: ProducerProfile;
  readonly uniqueGenericAttributes: readonly ExtractedGenericAttribute[];
  readonly uniqueAttributeSpecsSorted: readonly string[];
  readonly unauthorizedAttributes: readonly string[];
  readonly matchesOrnek6Expected42: boolean;
}

/**
 * Bir CityGML dosyasındaki tüm `gen:*Attribute` (`stringAttribute`, `intAttribute`, `doubleAttribute`, `dateAttribute`)
 * etiketlerini tarar ve `ad:tip` listesini deterministik UTF-16 kod birimi sırasıyla döndürür (`// K99`, `// V-060`, `F2`).
 */
// K99
// V-060
export function extractGenericAttributesFromGml(xmlContent: string): {
  readonly attributes: readonly ExtractedGenericAttribute[];
  readonly specsSorted: readonly string[];
  readonly unauthorizedSpecs: readonly string[];
} {
  const attrRegex =
    /<gen:(string|int|double|date)Attribute\s+[^>]*name="([^"]+)"/g;
  const countsBySpec = new Map<string, { name: string; type: GenericAttributeType; count: number }>();

  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(xmlContent)) !== null) {
    const type = match[1] as GenericAttributeType;
    const name = match[2].trim();
    const spec = `${name}:${type}`;
    const existing = countsBySpec.get(spec);
    if (existing) {
      existing.count += 1;
    } else {
      countsBySpec.set(spec, { name, type, count: 1 });
    }
  }

  const sortedSpecs = Array.from(countsBySpec.keys()).sort(compareCodeUnits);

  const allowedSet = new Set<string>(ALLOWED_GENERIC_ATTRIBUTES);
  const unauthorizedSpecs = sortedSpecs.filter((s) => !allowedSet.has(s));

  const attributes: ExtractedGenericAttribute[] = sortedSpecs.map((spec) => {
    const item = countsBySpec.get(spec)!;
    return {
      name: item.name,
      type: item.type,
      spec,
      occurrenceCount: item.count,
    };
  });

  return {
    attributes,
    specsSorted: sortedSpecs,
    unauthorizedSpecs,
  };
}

function extractSingleAttrValue(xmlContent: string, attrName: string): string {
  const re = new RegExp(
    `<gen:(?:string|int|double|date)Attribute\\s+name="${attrName}"[^>]*>[\\s\\S]*?<gen:value>([^<]*)</gen:value>`,
    'm'
  );
  const m = re.exec(xmlContent);
  return m ? m[1].trim() : '';
}

function countGmlIdPrefix(xmlContent: string, prefix: string): number {
  const re = new RegExp(`gml:id="${prefix}[0-9a-fA-F-]+"`, 'g');
  const matches = xmlContent.match(re);
  return matches ? matches.length : 0;
}

/**
 * İçe alınan GML dosyasının öznitelik beyaz listesi uyumunu, nesne sayılarını ve üretici profilini (`A10/B50/C50`)
 * çevrimdışı olarak analiz eder (`// K55`, `// K79`, `// K87`, `// K99`, `// V-060`, `// V-215`, `F5`, `F6`).
 */
// K55
// K79
// K87
// K99
// V-060
// V-215
export function inspectCityGmlSample(xmlContent: string): GmlSampleInspectionReport {
  const extracted = extractGenericAttributesFromGml(xmlContent);

  const mbMatch = /<bldg:Building\s+[^>]*gml:id="([^"]+)"/.exec(xmlContent);
  const buildingGmlId = mbMatch ? mbMatch[1] : '';

  const srsMatch = /<gml:Envelope[^>]*srsName="([^"]+)"/.exec(xmlContent);
  const srsName = srsMatch ? srsMatch[1] : '';

  const lowerMatch = /<gml:lowerCorner>([^<]+)<\/gml:lowerCorner>/.exec(xmlContent);
  const upperMatch = /<gml:upperCorner>([^<]+)<\/gml:upperCorner>/.exec(xmlContent);

  const constructionID = extractSingleAttrValue(xmlContent, 'constructionID');
  const roofProjectionArea = Number.parseFloat(
    extractSingleAttrValue(xmlContent, 'roofProjectionArea') || '0'
  );
  const buildingHeight = Number.parseFloat(
    extractSingleAttrValue(xmlContent, 'buildingHeight') || '0'
  );
  const confirmationDate = extractSingleAttrValue(
    xmlContent,
    'architecturalProjectConfirmationDate'
  );
  const totalIndependentSectionCountAttr = Number.parseInt(
    extractSingleAttrValue(xmlContent, 'totalIndependentSectionCount') || '0',
    10
  );

  const counts = {
    MB: countGmlIdPrefix(xmlContent, 'MB_'),
    K: countGmlIdPrefix(xmlContent, 'K_'),
    BB: countGmlIdPrefix(xmlContent, 'BB_'),
    BBK: countGmlIdPrefix(xmlContent, 'BBK_'),
    OA: countGmlIdPrefix(xmlContent, 'OA_'),
    BBKIY: countGmlIdPrefix(xmlContent, 'BBKIY_'),
    OAIY: countGmlIdPrefix(xmlContent, 'OAIY_'),
    BLKN: countGmlIdPrefix(xmlContent, 'BLKN_'),
    TRS: countGmlIdPrefix(xmlContent, 'TRS_'),
    KAPI: countGmlIdPrefix(xmlContent, 'KAPI_'),
    PEN: countGmlIdPrefix(xmlContent, 'PEN_'),
    MBG: countGmlIdPrefix(xmlContent, 'MBG_'),
  };

  // F5: <gml:pos ...> ve <gml:posList ...> etiketlerinde srsDimension="3" vb. özniteliklere izin ver
  const hasPos = /<gml:pos\b[^>]*>/.test(xmlContent);
  const hasPosList = /<gml:posList\b[^>]*>/.test(xmlContent);
  const coordinateEncoding: 'gml:pos' | 'gml:posList' | 'mixed' =
    hasPos && hasPosList ? 'mixed' : hasPos ? 'gml:pos' : 'gml:posList';

  // F6: Dosyadaki tüm Kat (K_) bloklarını inceleyerek Biçim A / B / C dizisini ve olası uyumsuzluğu tespit et (K87, V-215)
  const storeyBlockRe =
    /<grp:CityObjectGroup\s+[^>]*gml:id="K_[^"]+"[^>]*>[\s\S]*?<\/grp:CityObjectGroup>/g;
  const detectedStoreyForms: StoreyGeometryForm[] = [];
  let storeyMatch: RegExpExecArray | null;
  while ((storeyMatch = storeyBlockRe.exec(xmlContent)) !== null) {
    const floorMatches = storeyMatch[0].match(/gml:id="Floor_/g);
    const floorCount = floorMatches ? floorMatches.length : 0;
    const form: StoreyGeometryForm =
      floorCount === 1 ? 'A' : floorCount === 2 ? 'C' : 'B';
    detectedStoreyForms.push(form);
  }

  const detectedStoreyForm: StoreyGeometryForm =
    detectedStoreyForms.length > 0 ? detectedStoreyForms[0] : 'A';
  const hasInconsistentStoreyForms =
    detectedStoreyForms.length > 1 &&
    detectedStoreyForms.some((f) => f !== detectedStoreyForm);

  // F5: Kapı alt ofsetini tüm BBK_ / OA_ blokları içinde kapı bulunan ilk odadan ölç; ölçülemezse null + BİLGİ döndür
  const roomBlockRe =
    /<bldg:Room\s+[^>]*gml:id="(?:BBK_|OA_)[^"]+"[^>]*>[\s\S]*?<\/bldg:Room>/g;
  let detectedDoorBottomOffsetMm: number | null = null;
  let roomMatch: RegExpExecArray | null;
  while ((roomMatch = roomBlockRe.exec(xmlContent)) !== null) {
    const floorSection =
      /<bldg:FloorSurface>[\s\S]*?<\/bldg:FloorSurface>/.exec(roomMatch[0]);
    const doorSection =
      /<bldg:Door\s+[^>]*gml:id="KAPI_[^"]+"[^>]*>[\s\S]*?<\/bldg:Door>/.exec(
        roomMatch[0]
      );
    if (floorSection && doorSection) {
      const zValuesFloor = extractZCoords(floorSection[0]);
      const zValuesDoor = extractZCoords(doorSection[0]);
      if (zValuesFloor.length > 0 && zValuesDoor.length > 0) {
        const floorZ = Math.min(...zValuesFloor);
        const doorMinZ = Math.min(...zValuesDoor);
        detectedDoorBottomOffsetMm = Math.round((doorMinZ - floorZ) * 1000);
        break;
      }
    }
  }

  const doorOffsetInfoIssue: ValidationIssue | null =
    detectedDoorBottomOffsetMm === null
      ? {
          ruleId: 'V-215',
          severity: 'B',
          message:
            'Dosyada KAPI_ ve FloorSurface içeren ortak bir oda bloğu bulunamadığından kapı alt ofseti (mm) ölçülemedi; üretici profili kat geometrisinden belirlendi.',
        }
      : null;

  const detectedProducerProfile: ProducerProfile =
    detectedStoreyForm === 'B'
      ? 'B50'
      : detectedStoreyForm === 'C'
      ? 'C50'
      : 'A10';

  const expectedOrnek6 = [...ORNEK6_GENERIC_ATTRIBUTES].sort(compareCodeUnits);
  const matchesOrnek6Expected42 =
    extracted.specsSorted.length === expectedOrnek6.length &&
    extracted.specsSorted.every((val, idx) => val === expectedOrnek6[idx]);

  return {
    constructionID,
    buildingGmlId,
    srsName,
    envelopeLowerCorner: lowerMatch ? lowerMatch[1].trim() : '',
    envelopeUpperCorner: upperMatch ? upperMatch[1].trim() : '',
    roofProjectionArea,
    buildingHeight,
    confirmationDate,
    totalIndependentSectionCountAttr,
    counts,
    coordinateEncoding,
    detectedStoreyForm,
    detectedStoreyForms,
    hasInconsistentStoreyForms,
    detectedDoorBottomOffsetMm,
    doorOffsetInfoIssue,
    detectedProducerProfile,
    uniqueGenericAttributes: extracted.attributes,
    uniqueAttributeSpecsSorted: extracted.specsSorted,
    unauthorizedAttributes: extracted.unauthorizedSpecs,
    matchesOrnek6Expected42,
  };
}

function extractZCoords(xmlFragment: string): number[] {
  const zList: number[] = [];
  const posRe = /<gml:pos\b[^>]*>([^<]+)<\/gml:pos>/g;
  let m: RegExpExecArray | null;
  while ((m = posRe.exec(xmlFragment)) !== null) {
    const parts = m[1].trim().split(/\s+/);
    if (parts.length >= 3) {
      const z = Number.parseFloat(parts[2]);
      if (Number.isFinite(z)) zList.push(z);
    }
  }
  const posListRe = /<gml:posList\b[^>]*>([^<]+)<\/gml:posList>/g;
  while ((m = posListRe.exec(xmlFragment)) !== null) {
    const parts = m[1].trim().split(/\s+/);
    for (let i = 2; i < parts.length; i += 3) {
      const z = Number.parseFloat(parts[i]);
      if (Number.isFinite(z)) zList.push(z);
    }
  }
  return zList;
}
