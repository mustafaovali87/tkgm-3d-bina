// K01
// K02
// K06
// K07
// K08
// K09
// K12
// K13
// K14
// K31
// K55
// K60
// K79
// K84
// K87
// K89
// K93
// K99
// V-030
// V-060
// V-063
// V-211
// V-213
// V-214
// V-215
import { XMLParser } from 'fast-xml-parser';
import { CodelistLookupKey, CodelistRegistry } from '../codelists/index.ts';
import { compareCodeUnits, computeCanonicalModelHash } from '../hash/canonical.ts';
import {
  analyzeBuildingLandShares,
  BuildingLandShareAnalysis,
  IndependentSectionShareInput,
} from '../math/landShare.ts';
import { analyzeRingPlanarity3D, polygonNetArea2D } from '../math/ring.ts';
import {
  checkCoordinateDecimalPlaces,
  GenericAttributeType,
  isAllowedGenericAttribute,
  metersToMm,
  ObjectIdPrefix,
  parseMaksIdValue,
  Point3D,
  PolygonIdPrefix,
  ProducerProfile,
  RingIdPrefix,
  StoreyGeometryForm,
  ValidationIssue,
} from '../model/index.ts';

export interface ImportedGenericAttribute {
  readonly name: string;
  readonly type: GenericAttributeType;
  readonly rawValue: string;
  readonly cleanValue: string;
  readonly hasWhitespaceOrTabWarning: boolean; // V-214
  readonly isWhitelisted: boolean; // V-060, K99
  readonly codelistKey?: CodelistLookupKey;
  readonly codelistDescription?: string; // Türkçe açıklama (örn. 1003 -> Bağımsız Bölüm Kapı)
  readonly isValidCodelistValue?: boolean; // V-063
}

export interface ImportedLinearRing {
  readonly gmlId: string;
  readonly prefix: RingIdPrefix | string;
  readonly rawPosText: string;
  readonly encoding: 'gml:pos' | 'gml:posList';
  readonly vertices: readonly Point3D[];
  readonly nonThreeDecimalCount: number; // V-030 BİLGİ sayısı
}

export interface ImportedPolygon {
  readonly gmlId: string;
  readonly prefix: PolygonIdPrefix | string;
  readonly ownerObjectGmlId: string;
  readonly ownerObjectPrefix: ObjectIdPrefix | string;
  readonly storeyGmlId: string | null;
  readonly surfaceTag: string; // WallSurface, RoofSurface, FloorSurface, InteriorWallSurface, CeilingSurface, GroundSurface, Door, Window, MultiSurface, Solid...
  readonly surfaceGmlName: string; // Duvar, Çatı, Zemin, Taban, Tavan, İçDuvar...
  readonly lodLevel: 'lod0FootPrint' | 'lod0RoofEdge' | 'lod1Solid' | 'lod2' | 'lod4' | 'group';
  readonly exteriorRing: ImportedLinearRing;
  readonly interiorRings: readonly ImportedLinearRing[];
  readonly areaM2: number;
  readonly planarityDeviationMm: number;
  readonly isPlanar1Mm: boolean;
  readonly minZ: number;
  readonly maxZ: number;
  readonly centroid: Point3D;
}

export interface ImportedCityObject {
  readonly gmlId: string;
  readonly prefix: ObjectIdPrefix | string;
  readonly tagName: string;
  readonly gmlName: string;
  readonly classValue: string;
  readonly parentGmlId: string | null;
  readonly storeyGmlId: string | null;
  readonly referencedBbGmlId: string | null;
  readonly referencedStoreyGmlId: string | null;
  readonly groupMemberHrefs: readonly string[];
  readonly xlinkPolygonHrefs: readonly string[];
  readonly attributes: readonly ImportedGenericAttribute[];
  readonly attributesMap: Readonly<Record<string, string>>;
  readonly inlinePolygons: readonly ImportedPolygon[];
  readonly allPolygonIds: readonly string[]; // inline + xlink çözümlenmiş poligonlar
  readonly minZ: number | null;
  readonly maxZ: number | null;
}

export interface ImportedTreeNode {
  readonly id: string;
  readonly gmlId: string;
  readonly label: string;
  readonly subLabel: string;
  readonly category:
    | 'MB'
    | 'STOREY'
    | 'BB'
    | 'BBK'
    | 'OA'
    | 'BLKN'
    | 'TRS'
    | 'KAPI'
    | 'PEN'
    | 'BBKIY'
    | 'OAIY'
    | 'MBG'
    | 'LOD_GROUP';
  readonly storeyGmlId: string | null;
  readonly polygonCount: number;
  readonly children: readonly ImportedTreeNode[];
}

export interface BoundingBox3D {
  readonly minE: number;
  readonly minN: number;
  readonly minZ: number;
  readonly maxE: number;
  readonly maxN: number;
  readonly maxZ: number;
}

export interface ImportedModel {
  readonly fileName: string;
  readonly fileSizeBytes: number;
  readonly xmlDeclaration: string;
  readonly hasUtf8Bom: boolean;
  readonly lineEnding: 'CRLF' | 'LF' | 'MIXED';
  readonly srsName: string;
  readonly srsDimension: string;
  readonly envelope: BoundingBox3D;
  readonly computedBounds: BoundingBox3D;
  /** 3B sahne için yerel merkez: [centerE, centerN, minZ] (K08 64-bit -> 32-bit float koruma) */
  readonly originTuref: Point3D;
  readonly constructionID: string;
  readonly buildingGmlId: string;
  readonly storeysAboveGround: number;
  readonly storeysBelowGround: number;
  readonly detectedStoreyForm: StoreyGeometryForm;
  readonly detectedStoreyForms: readonly StoreyGeometryForm[];
  readonly hasInconsistentStoreyForms: boolean;
  readonly detectedDoorBottomOffsetMm: number | null;
  readonly detectedProducerProfile: ProducerProfile;
  readonly objects: readonly ImportedCityObject[];
  readonly objectsById: Readonly<Record<string, ImportedCityObject>>;
  readonly polygons: readonly ImportedPolygon[];
  readonly polygonsById: Readonly<Record<string, ImportedPolygon>>;
  readonly ticLineStrings: ReadonlyArray<{
    readonly vertices: readonly Point3D[];
    readonly isClosed: boolean;
  }>;
  readonly hierarchyTree: readonly ImportedTreeNode[];
  readonly landShareAnalysis: BuildingLandShareAnalysis;
  readonly readerIssues: readonly ValidationIssue[];
  readonly canonicalHash: string;
}

function resolveAttributeCodelistKey(
  attrName: string,
  ownerPrefix: string
): CodelistLookupKey | undefined {
  switch (attrName) {
    case 'buildingType':
      return 'buildingType';
    case 'geometrySuitability':
      if (ownerPrefix === 'MB_') return 'buildingGeometrySuitability';
      if (ownerPrefix === 'BB_') return 'independentSectionGeometrySuitability';
      return 'independentSectionPartGeometrySuitability';
    case 'maksIntegrationState':
      return ownerPrefix === 'MB_'
        ? 'maksConstructionIntegrationState'
        : 'maksIndependentSectionIntegrationState';
    case 'integrationState':
      return 'integrationState';
    case 'storeyUsage':
      return 'storeyUsage';
    case 'independentSectionUsage':
      return 'independentSectionUsage';
    case 'independentSectionCardinalDirection':
      return 'cardinalDirection';
    case 'partUsage':
      return 'partUsage';
    case 'commonAreaUsage':
      return 'commonAreaUsage';
    case 'roomInstallationUsage':
      return 'roomInstallationUsage';
    case 'doorUsage':
      return 'doorUsage';
    case 'windowUsage':
      return 'windowUsage';
    default:
      return undefined;
  }
}

export interface GmlReadProgress {
  readonly percent: number;
  readonly phase: string;
  readonly detail?: string;
}

export interface ParseCityGmlOptions {
  readonly onProgress?: (progress: GmlReadProgress) => void;
}

function getIdPrefix(gmlId: string): string {
  const idx = gmlId.indexOf('_');
  return idx >= 0 ? gmlId.slice(0, idx + 1) : '';
}

function asArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

/**
 * G8: Ad alanı önekine (core:, bldg:, gml:, grp:, gen:, xlink: vb.) bağımlılığı ortadan kaldıran hızlı erişim yardımcısı.
 * Önce standart önekli anahtarı, ardından önsüz yerel adı, son olarak da '*:localName' eşleşmesini kontrol eder.
 */
function getNodeByLocalName(
  record: Record<string, unknown> | undefined | null,
  stdPrefixedKey: string,
  localName: string
): unknown {
  if (!record) return undefined;
  if (stdPrefixedKey in record) return record[stdPrefixedKey];
  if (localName in record) return record[localName];
  const suffix = `:${localName}`;
  for (const k of Object.keys(record)) {
    if (k.endsWith(suffix)) return record[k];
  }
  return undefined;
}

function getAttrByLocalName(
  record: Record<string, unknown> | undefined | null,
  stdAttrKey: string,
  localAttrKey: string
): string {
  if (!record) return '';
  if (stdAttrKey in record && record[stdAttrKey] !== undefined) {
    return String(record[stdAttrKey]).trim();
  }
  if (localAttrKey in record && record[localAttrKey] !== undefined) {
    return String(record[localAttrKey]).trim();
  }
  const suffix = `:${localAttrKey.replace(/^@_/, '')}`;
  for (const k of Object.keys(record)) {
    if (k.startsWith('@_') && k.endsWith(suffix) && record[k] !== undefined) {
      return String(record[k]).trim();
    }
  }
  return '';
}

function extractText(node: unknown): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node);
  }
  if (typeof node === 'object') {
    const rec = node as Record<string, unknown>;
    if ('#text' in rec && rec['#text'] !== undefined) {
      return String(rec['#text']);
    }
  }
  return '';
}

function parseLinearRingNode(
  ringNode: Record<string, unknown>,
  readerIssues: ValidationIssue[]
): ImportedLinearRing | null {
  const gmlId = getAttrByLocalName(ringNode, '@_gml:id', '@_id');
  const prefix = getIdPrefix(gmlId);

  const posListNode = getNodeByLocalName(ringNode, 'gml:posList', 'posList');
  const posNodes = asArray(getNodeByLocalName(ringNode, 'gml:pos', 'pos'));

  let rawTokens: string[] = [];
  let rawPosText = '';
  let encoding: 'gml:pos' | 'gml:posList' = 'gml:posList';

  if (posListNode !== undefined) {
    rawPosText = extractText(posListNode).trim();
    rawTokens = rawPosText.length > 0 ? rawPosText.split(/\s+/) : [];
    encoding = 'gml:posList';
  } else if (posNodes.length > 0) {
    encoding = 'gml:pos';
    const chunks = posNodes.map((n) => extractText(n).trim()).filter(Boolean);
    rawPosText = chunks.join(' ');
    rawTokens = rawPosText.length > 0 ? rawPosText.split(/\s+/) : [];
  } else {
    return null;
  }

  let nonThreeDecimalCount = 0;
  for (const tok of rawTokens) {
    const decIssue = checkCoordinateDecimalPlaces(tok, 'read');
    if (decIssue) {
      nonThreeDecimalCount++;
    }
  }

  const vertices: Point3D[] = [];
  for (let i = 0; i + 2 < rawTokens.length; i += 3) {
    const e = Number.parseFloat(rawTokens[i]);
    const n = Number.parseFloat(rawTokens[i + 1]);
    const z = Number.parseFloat(rawTokens[i + 2]);
    if (Number.isFinite(e) && Number.isFinite(n) && Number.isFinite(z)) {
      vertices.push({ e, n, z });
    }
  }

  if (vertices.length === 0) {
    readerIssues.push({
      ruleId: 'V-031',
      severity: 'H',
      message: `LinearRing (${gmlId || 'isimsiz'}) içinde geçerli 3B koordinat bulunamadı.`,
      targetGmlId: gmlId,
    });
  }

  return {
    gmlId,
    prefix,
    rawPosText,
    encoding,
    vertices,
    nonThreeDecimalCount,
  };
}

function parsePolygonNode(
  polyNode: Record<string, unknown>,
  ownerObjectGmlId: string,
  ownerObjectPrefix: string,
  surfaceTag: string,
  surfaceGmlName: string,
  lodLevel: ImportedPolygon['lodLevel'],
  readerIssues: ValidationIssue[]
): ImportedPolygon | null {
  const gmlId = getAttrByLocalName(polyNode, '@_gml:id', '@_id');
  const prefix = getIdPrefix(gmlId);

  const extNode = getNodeByLocalName(polyNode, 'gml:exterior', 'exterior') as
    | Record<string, unknown>
    | undefined;
  if (!extNode) return null;

  const extRingRaw = getNodeByLocalName(extNode, 'gml:LinearRing', 'LinearRing') as
    | Record<string, unknown>
    | undefined;
  if (!extRingRaw) return null;

  const exteriorRing = parseLinearRingNode(extRingRaw, readerIssues);
  if (!exteriorRing || exteriorRing.vertices.length < 3) return null;

  const intNodes = asArray(
    getNodeByLocalName(polyNode, 'gml:interior', 'interior')
  ) as Array<Record<string, unknown>>;
  const interiorRings: ImportedLinearRing[] = [];
  for (const intNode of intNodes) {
    const ringRaw = getNodeByLocalName(intNode, 'gml:LinearRing', 'LinearRing') as
      | Record<string, unknown>
      | undefined;
    if (ringRaw) {
      const parsedInt = parseLinearRingNode(ringRaw, readerIssues);
      if (parsedInt && parsedInt.vertices.length >= 3) {
        interiorRings.push(parsedInt);
      }
    }
  }

  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  let sumE = 0;
  let sumN = 0;
  let sumZ = 0;
  const pts = exteriorRing.vertices;
  const uniqueLen =
    pts.length > 1 &&
    Math.hypot(
      pts[0].e - pts[pts.length - 1].e,
      pts[0].n - pts[pts.length - 1].n,
      pts[0].z - pts[pts.length - 1].z
    ) < 1e-4
      ? pts.length - 1
      : pts.length;

  for (let i = 0; i < uniqueLen; i++) {
    const v = pts[i];
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
    sumE += v.e;
    sumN += v.n;
    sumZ += v.z;
  }

  const centroid: Point3D =
    uniqueLen > 0
      ? { e: sumE / uniqueLen, n: sumN / uniqueLen, z: sumZ / uniqueLen }
      : { e: 0, n: 0, z: 0 };

  // 3B alanı hesapla (Newell vektör büyüklüğü / 2 - delikler)
  const calcRingArea3D = (ring3D: readonly Point3D[]): number => {
    const n = ring3D.length;
    if (n < 3) return 0;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    const p0 = ring3D[0];
    for (let i = 1; i + 1 < n; i++) {
      const u = ring3D[i];
      const v = ring3D[i + 1];
      const ux = u.e - p0.e;
      const uy = u.n - p0.n;
      const uz = u.z - p0.z;
      const vx = v.e - p0.e;
      const vy = v.n - p0.n;
      const vz = v.z - p0.z;
      cx += uy * vz - uz * vy;
      cy += uz * vx - ux * vz;
      cz += ux * vy - uy * vx;
    }
    return 0.5 * Math.hypot(cx, cy, cz);
  };

  let areaM2 = calcRingArea3D(exteriorRing.vertices);
  for (const h of interiorRings) {
    areaM2 = Math.max(0, areaM2 - calcRingArea3D(h.vertices));
  }

  // Yatay poligonlarda 2B Shoelace net alanını da kullanabiliriz
  if (Math.abs(maxZ - minZ) < 1e-3) {
    areaM2 = polygonNetArea2D(
      exteriorRing.vertices,
      interiorRings.map((h) => h.vertices)
    );
  }

  const planarity = analyzeRingPlanarity3D(exteriorRing.vertices);

  return {
    gmlId,
    prefix,
    ownerObjectGmlId,
    ownerObjectPrefix,
    storeyGmlId: null, // Kat eşleştirmesi sonrasında doldurulur
    surfaceTag,
    surfaceGmlName,
    lodLevel,
    exteriorRing,
    interiorRings,
    areaM2,
    planarityDeviationMm: planarity.maxDeviationMm,
    isPlanar1Mm: planarity.isPlanar1Mm,
    minZ: Number.isFinite(minZ) ? minZ : 0,
    maxZ: Number.isFinite(maxZ) ? maxZ : 0,
    centroid,
  };
}

function collectMultiSurfacePolygonsAndXlinks(
  msContainer: Record<string, unknown> | undefined,
  ownerObjectGmlId: string,
  ownerObjectPrefix: string,
  surfaceTag: string,
  surfaceGmlName: string,
  lodLevel: ImportedPolygon['lodLevel'],
  outPolygons: ImportedPolygon[],
  outXlinks: string[],
  readerIssues: ValidationIssue[]
): void {
  if (!msContainer) return;
  const msNode = (getNodeByLocalName(msContainer, 'gml:MultiSurface', 'MultiSurface') ??
    msContainer) as Record<string, unknown>;
  const members = asArray(
    getNodeByLocalName(msNode, 'gml:surfaceMember', 'surfaceMember')
  ) as Array<Record<string, unknown>>;

  for (const mem of members) {
    const href = getAttrByLocalName(mem, '@_xlink:href', '@_href');
    if (href.length > 0) {
      outXlinks.push(href);
    }
    const polyRaw = getNodeByLocalName(mem, 'gml:Polygon', 'Polygon') as
      | Record<string, unknown>
      | undefined;
    if (polyRaw) {
      const parsed = parsePolygonNode(
        polyRaw,
        ownerObjectGmlId,
        ownerObjectPrefix,
        surfaceTag,
        surfaceGmlName,
        lodLevel,
        readerIssues
      );
      if (parsed) {
        outPolygons.push(parsed);
      }
    }
  }
}

function parseGenericAttributesFromNode(
  objNode: Record<string, unknown>,
  ownerGmlId: string,
  ownerPrefix: string,
  codelists: CodelistRegistry,
  readerIssues: ValidationIssue[]
): ImportedGenericAttribute[] {
  const result: ImportedGenericAttribute[] = [];
  const attrTypes: ReadonlyArray<{
    tag: string;
    localTag: string;
    type: GenericAttributeType;
  }> = [
    { tag: 'gen:stringAttribute', localTag: 'stringAttribute', type: 'string' },
    { tag: 'gen:intAttribute', localTag: 'intAttribute', type: 'int' },
    { tag: 'gen:doubleAttribute', localTag: 'doubleAttribute', type: 'double' },
    { tag: 'gen:dateAttribute', localTag: 'dateAttribute', type: 'date' },
  ];

  for (const { tag, localTag, type } of attrTypes) {
    const rawList = asArray(getNodeByLocalName(objNode, tag, localTag)) as Array<
      Record<string, unknown>
    >;
    for (const item of rawList) {
      const name = String(item['@_name'] ?? '').trim();
      const valNode = getNodeByLocalName(item, 'gen:value', 'value');
      const rawValue = extractText(valNode);
      const cleanValue = rawValue.trim();
      const hasWhitespaceOrTabWarning =
        (type === 'int' || type === 'double') &&
        rawValue.length > 0 &&
        rawValue !== cleanValue;

      if (hasWhitespaceOrTabWarning) {
        // G5: TKGM'nin resmi kabul örneği Ornek6 içinde TAB ("\t5129820196") mevcuttur; okumada BİLGİ ('B') üretilir, yazmada trim uygulanır.
        readerIssues.push({
          ruleId: 'V-214',
          severity: 'B',
          message: `${ownerGmlId} nesnesindeki "${name}" (${type}) özniteliğinde baştan/sondan boşluk veya TAB karakteri bulundu: ${JSON.stringify(
            rawValue
          )}. Okumada BİLGİ olarak kabul edilir; üretimde (GMLWriter) trim uygulanır.`,
          targetGmlId: ownerGmlId,
        });
      }

      const isWhitelisted = isAllowedGenericAttribute(name, type);
      if (!isWhitelisted) {
        readerIssues.push({
          ruleId: 'V-060',
          severity: 'H',
          message: `"${name}:${type}" özelliği proje kapsamında izin verilen 45 öznitelik beyaz listesinde (ALLOWED_GENERIC_ATTRIBUTES) bulunmuyor.`,
          targetGmlId: ownerGmlId,
        });
      }

      if (name === 'maksIdentityNumber' || name === 'maksNumaratajIdentityNumber') {
        const maksCheck = parseMaksIdValue(cleanValue, ownerGmlId);
        if (maksCheck.issue) {
          readerIssues.push(maksCheck.issue);
        }
      }

      const codelistKey = resolveAttributeCodelistKey(name, ownerPrefix);
      let codelistDescription: string | undefined;
      let isValidCodelistValue: boolean | undefined;

      if (codelistKey && cleanValue !== '') {
        const codeNum = Number.parseInt(cleanValue, 10);
        if (Number.isFinite(codeNum)) {
          isValidCodelistValue = codelists.isValidCode(codelistKey, codeNum);
          codelistDescription = codelists.getDescription(codelistKey, codeNum);
          if (!isValidCodelistValue) {
            readerIssues.push({
              ruleId: 'V-063',
              severity: 'H',
              message: `${ownerGmlId} nesnesindeki "${name}" değeri (${cleanValue}) resmi ${codelistKey}.xml kod listesinde bulunamadı.`,
              targetGmlId: ownerGmlId,
            });
          }
        }
      }

      result.push({
        name,
        type,
        rawValue,
        cleanValue,
        hasWhitespaceOrTabWarning,
        isWhitelisted,
        codelistKey,
        codelistDescription,
        isValidCodelistValue,
      });
    }
  }

  return result;
}

const SURFACE_TAG_KEYS = [
  'bldg:RoofSurface',
  'bldg:GroundSurface',
  'bldg:WallSurface',
  'bldg:FloorSurface',
  'bldg:InteriorWallSurface',
  'bldg:CeilingSurface',
  'bldg:OuterFloorSurface',
  'bldg:OuterCeilingSurface',
  'bldg:ClosureSurface',
] as const;

/**
 * G2: Kat biçimi (`A`/`B`/`C`) ve ölçülen kapı alt ofseti (`mm`) birleşiminden üretici profilini belirler.
 * - `A` + `10` -> `'A10'`
 * - `B` + `50` -> `'B50'`
 * - `C` + `50` -> `'C50'`
 * - `doorOffsetMm === null` -> `'biçim <Form>, ofset bilinmiyor'` (örn. Amasya: `'biçim A, ofset bilinmiyor'`)
 * - Tanımlı profillere uymayan birleşim (örn. Sincan `B` + `10 mm`) -> `'B10 (biçim B, ofset 10 mm)'` ve `V-215 BİLGİ`: `"profil dışı birleşim"`.
 */
export function resolveProducerProfileFromFormAndOffset(
  form: StoreyGeometryForm,
  doorOffsetMm: number | null,
  targetGmlId?: string
): {
  readonly profile: ProducerProfile;
  readonly issue: ValidationIssue | null;
} {
  if (doorOffsetMm === null) {
    return {
      profile: `biçim ${form}, ofset bilinmiyor`,
      issue: {
        ruleId: 'V-215',
        severity: 'B',
        message: 'Kapı alt ofseti ölçülemedi (dosyada oda tabanı ile eşleşen kapı bulunamadı).',
        targetGmlId,
      },
    };
  }
  if (form === 'A' && doorOffsetMm === 10) {
    return { profile: 'A10', issue: null };
  }
  if (form === 'B' && doorOffsetMm === 50) {
    return { profile: 'B50', issue: null };
  }
  if (form === 'C' && doorOffsetMm === 50) {
    return { profile: 'C50', issue: null };
  }
  return {
    profile: `${form}${doorOffsetMm} (biçim ${form}, ofset ${doorOffsetMm} mm)`,
    issue: {
      ruleId: 'V-215',
      severity: 'B',
      message: `Profil dışı birleşim: kat biçimi ${form}, kapı alt ofseti ${doorOffsetMm} mm (tanımlı profiller: A10, B50, C50).`,
      targetGmlId,
    },
  };
}

/**
 * Bir TKGM CityGML 2.0 dosyasını (`Ornek1..6`, `Amasya`, `Sincan` vb.) çevrimdışı ayrıştırarak
 * nesne ağacını, poligon + delik geometrilerini, kod listesi açıklamalarını, `BigInt` arsa payı analizini
 * ve `K89` kanonik model özetini içeren `ImportedModel` nesnesini üretir (`M1`, `G1–G8`).
 */
export function parseCityGmlModel(
  xmlContent: string,
  fileName: string,
  codelists: CodelistRegistry,
  options?: ParseCityGmlOptions
): ImportedModel {
  const onProgress = options?.onProgress;
  onProgress?.({
    percent: 5,
    phase: 'XML önişleme ve kodlama kontrolü',
    detail: fileName,
  });

  const readerIssues: ValidationIssue[] = [];
  const hasUtf8Bom = xmlContent.charCodeAt(0) === 0xfeff;
  const cleanXml = hasUtf8Bom ? xmlContent.slice(1) : xmlContent;

  const hasCrlf = cleanXml.includes('\r\n');
  const hasBareLf = /(?:^|[^\r])\n/.test(cleanXml);
  const lineEnding: 'CRLF' | 'LF' | 'MIXED' =
    hasCrlf && hasBareLf ? 'MIXED' : hasCrlf ? 'CRLF' : 'LF';

  const firstLineMatch = /^<\?xml[^>]*\?>/.exec(cleanXml.trimStart());
  const xmlDeclaration = firstLineMatch ? firstLineMatch[0] : '';

  onProgress?.({
    percent: 15,
    phase: 'XML ağacı ayrıştırılıyor (fast-xml-parser)',
    detail: `${(cleanXml.length / (1024 * 1024)).toFixed(2)} MB`,
  });

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: false,
    parseTagValue: false,
  });

  const root = parser.parse(cleanXml) as Record<string, unknown>;
  const cityModel = (getNodeByLocalName(root, 'core:CityModel', 'CityModel') ??
    root['gml:CityModel']) as Record<string, unknown> | undefined;

  if (!cityModel) {
    throw new Error(`"${fileName}" içinde core:CityModel kök elemanı bulunamadı.`);
  }

  // Envelope (G8: ad alanı önekinden bağımsız)
  const boundedByRoot = getNodeByLocalName(
    cityModel,
    'gml:boundedBy',
    'boundedBy'
  ) as Record<string, unknown> | undefined;
  const envNode = getNodeByLocalName(
    boundedByRoot,
    'gml:Envelope',
    'Envelope'
  ) as Record<string, unknown> | undefined;
  const srsName = String(envNode?.['@_srsName'] ?? '').trim();
  const srsDimension = String(envNode?.['@_srsDimension'] ?? '3').trim();

  const parseCorner = (str: string): [number, number, number] => {
    const parts = str.trim().split(/\s+/).map(Number.parseFloat);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  };
  const lowerCorner = parseCorner(
    extractText(getNodeByLocalName(envNode, 'gml:lowerCorner', 'lowerCorner'))
  );
  const upperCorner = parseCorner(
    extractText(getNodeByLocalName(envNode, 'gml:upperCorner', 'upperCorner'))
  );

  const envelope: BoundingBox3D = {
    minE: lowerCorner[0],
    minN: lowerCorner[1],
    minZ: lowerCorner[2],
    maxE: upperCorner[0],
    maxN: upperCorner[1],
    maxZ: upperCorner[2],
  };

  const objects: ImportedCityObject[] = [];
  const polygons: ImportedPolygon[] = [];
  const ticLineStrings: Array<{ vertices: readonly Point3D[]; isClosed: boolean }> = [];
  const storeyHasKatElemaniRole = new Set<string>();

  const registerObject = (
    objNode: Record<string, unknown>,
    tagName: string,
    parentGmlId: string | null
  ): ImportedCityObject => {
    const gmlId = getAttrByLocalName(objNode, '@_gml:id', '@_id');
    const prefix = getIdPrefix(gmlId);
    const gmlName = extractText(
      getNodeByLocalName(objNode, 'gml:name', 'name')
    ).trim();
    const classValue = extractText(
      getNodeByLocalName(objNode, 'bldg:class', 'class')
    ).trim();

    const attributes = parseGenericAttributesFromNode(
      objNode,
      gmlId,
      prefix,
      codelists,
      readerIssues
    );
    const attributesMap: Record<string, string> = {};
    for (const attr of attributes) {
      if (!(attr.name in attributesMap)) {
        attributesMap[attr.name] = attr.cleanValue;
      }
    }

    const inlinePolygons: ImportedPolygon[] = [];
    const xlinkPolygonHrefs: string[] = [];
    const groupMemberHrefs: string[] = [];

    // groupMember & parent (G8: ad alanı önekinden bağımsız + Biçim B role="kat elemani" desteği)
    const grpMembers = asArray(
      getNodeByLocalName(objNode, 'grp:groupMember', 'groupMember')
    ) as Array<Record<string, unknown>>;
    for (const gm of grpMembers) {
      const href = getAttrByLocalName(gm, '@_xlink:href', '@_href');
      if (href) groupMemberHrefs.push(href);

      const roleAttr = getAttrByLocalName(gm, '@_role', '@_role').toLowerCase();
      if (prefix === 'K_' && roleAttr.includes('kat')) {
        storeyHasKatElemaniRole.add(gmlId);
      }

      // Biçim B'de grp:groupMember içinde doğrudan bldg:Room bulunabilir
      const inlineRooms = asArray(
        getNodeByLocalName(gm, 'bldg:Room', 'Room')
      ) as Array<Record<string, unknown>>;
      for (const rNode of inlineRooms) {
        if (prefix === 'K_') {
          storeyHasKatElemaniRole.add(gmlId);
        }
        registerObject(rNode, 'bldg:Room', gmlId);
      }
    }

    const grpParentNode = getNodeByLocalName(objNode, 'grp:parent', 'parent') as
      | Record<string, unknown>
      | undefined;
    const grpParentHref = grpParentNode
      ? getAttrByLocalName(grpParentNode, '@_xlink:href', '@_href')
      : '';
    const resolvedParentId = grpParentHref
      ? grpParentHref.replace(/^#/, '')
      : parentGmlId;

    // 1. LoD0 FootPrint & RoofEdge
    const lod0FootPrintNode = getNodeByLocalName(
      objNode,
      'bldg:lod0FootPrint',
      'lod0FootPrint'
    ) as Record<string, unknown> | undefined;
    if (lod0FootPrintNode) {
      collectMultiSurfacePolygonsAndXlinks(
        lod0FootPrintNode,
        gmlId,
        prefix,
        'lod0FootPrint',
        'FootPrint',
        'lod0FootPrint',
        inlinePolygons,
        xlinkPolygonHrefs,
        readerIssues
      );
    }
    const lod0RoofEdgeNode = getNodeByLocalName(
      objNode,
      'bldg:lod0RoofEdge',
      'lod0RoofEdge'
    ) as Record<string, unknown> | undefined;
    if (lod0RoofEdgeNode) {
      collectMultiSurfacePolygonsAndXlinks(
        lod0RoofEdgeNode,
        gmlId,
        prefix,
        'lod0RoofEdge',
        'RoofEdge',
        'lod0RoofEdge',
        inlinePolygons,
        xlinkPolygonHrefs,
        readerIssues
      );
    }

    // 2. LoD1 / LoD4 Solid (CompositeSolid veya doğrudan Solid)
    for (const solidKey of [
      { pref: 'bldg:lod1Solid', local: 'lod1Solid', lod: 'lod1Solid' as const },
      { pref: 'bldg:lod4Solid', local: 'lod4Solid', lod: 'lod4' as const },
    ]) {
      const solidContainer = getNodeByLocalName(
        objNode,
        solidKey.pref,
        solidKey.local
      ) as Record<string, unknown> | undefined;
      if (!solidContainer) continue;

      const compSolid = getNodeByLocalName(
        solidContainer,
        'gml:CompositeSolid',
        'CompositeSolid'
      ) as Record<string, unknown> | undefined;
      const solidMembers = asArray(
        getNodeByLocalName(compSolid, 'gml:solidMember', 'solidMember')
      ) as Array<Record<string, unknown>>;
      for (const sm of solidMembers) {
        const solid = getNodeByLocalName(sm, 'gml:Solid', 'Solid') as
          | Record<string, unknown>
          | undefined;
        const ext = getNodeByLocalName(solid, 'gml:exterior', 'exterior') as
          | Record<string, unknown>
          | undefined;
        const compSurf = getNodeByLocalName(
          ext,
          'gml:CompositeSurface',
          'CompositeSurface'
        ) as Record<string, unknown> | undefined;
        if (compSurf) {
          collectMultiSurfacePolygonsAndXlinks(
            compSurf,
            gmlId,
            prefix,
            'Solid',
            'LoD1Solid',
            solidKey.lod,
            inlinePolygons,
            xlinkPolygonHrefs,
            readerIssues
          );
        }
      }

      // Doğrudan gml:Solid (örn. Room lod4Solid)
      const directSolid = getNodeByLocalName(
        solidContainer,
        'gml:Solid',
        'Solid'
      ) as Record<string, unknown> | undefined;
      if (directSolid) {
        const ext = getNodeByLocalName(directSolid, 'gml:exterior', 'exterior') as
          | Record<string, unknown>
          | undefined;
        const compSurf = getNodeByLocalName(
          ext,
          'gml:CompositeSurface',
          'CompositeSurface'
        ) as Record<string, unknown> | undefined;
        if (compSurf) {
          collectMultiSurfacePolygonsAndXlinks(
            compSurf,
            gmlId,
            prefix,
            'FloorSurface',
            'RoomSolid',
            solidKey.lod,
            inlinePolygons,
            xlinkPolygonHrefs,
            readerIssues
          );
        }
      }
    }

    // 3. TIC (lod2TerrainIntersection)
    const ticNode = getNodeByLocalName(
      objNode,
      'bldg:lod2TerrainIntersection',
      'lod2TerrainIntersection'
    ) as Record<string, unknown> | undefined;
    if (ticNode) {
      const mc = getNodeByLocalName(ticNode, 'gml:MultiCurve', 'MultiCurve') as
        | Record<string, unknown>
        | undefined;
      const curveMembers = asArray(
        getNodeByLocalName(mc, 'gml:curveMember', 'curveMember')
      ) as Array<Record<string, unknown>>;
      for (const cm of curveMembers) {
        const ls = getNodeByLocalName(cm, 'gml:LineString', 'LineString') as
          | Record<string, unknown>
          | undefined;
        if (ls) {
          const posText = extractText(
            getNodeByLocalName(ls, 'gml:posList', 'posList')
          ).trim();
          const toks = posText ? posText.split(/\s+/) : [];
          const verts: Point3D[] = [];
          for (let i = 0; i + 2 < toks.length; i += 3) {
            verts.push({
              e: Number.parseFloat(toks[i]),
              n: Number.parseFloat(toks[i + 1]),
              z: Number.parseFloat(toks[i + 2]),
            });
          }
          if (verts.length >= 2) {
            const first = verts[0];
            const last = verts[verts.length - 1];
            const isClosed =
              Math.hypot(first.e - last.e, first.n - last.n, first.z - last.z) <= 1e-3;
            ticLineStrings.push({ vertices: verts, isClosed });
          }
        }
      }
    }

    // 4. Doğrudan Geometri kapları (G8: ad alanı önekinden bağımsız)
    const directContainers: ReadonlyArray<{
      key: string;
      localKey: string;
      lod: ImportedPolygon['lodLevel'];
      surfTag: string;
    }> = [
      { key: 'bldg:lod2MultiSurface', localKey: 'lod2MultiSurface', lod: 'lod2', surfTag: 'MultiSurface' },
      { key: 'bldg:lod4MultiSurface', localKey: 'lod4MultiSurface', lod: 'lod4', surfTag: tagName },
      { key: 'gen:lod2Geometry', localKey: 'lod2Geometry', lod: 'lod2', surfTag: 'BagimsizBolum' },
      { key: 'bldg:lod2Geometry', localKey: 'lod2Geometry', lod: 'lod2', surfTag: 'BalkonTeras' },
      { key: 'bldg:lod4Geometry', localKey: 'lod4Geometry', lod: 'lod4', surfTag: 'IcYapi' },
      { key: 'grp:geometry', localKey: 'geometry', lod: 'group', surfTag: 'Kat' },
    ];

    for (const dc of directContainers) {
      const dcNode = getNodeByLocalName(objNode, dc.key, dc.localKey) as
        | Record<string, unknown>
        | undefined;
      if (dcNode) {
        collectMultiSurfacePolygonsAndXlinks(
          dcNode,
          gmlId,
          prefix,
          dc.surfTag,
          gmlName || dc.surfTag,
          dc.lod,
          inlinePolygons,
          xlinkPolygonHrefs,
          readerIssues
        );
      }
    }

    // 5. boundedBy (*Surface) ve içindeki opening (bldg:Door / bldg:Window)
    const boundedByList = asArray(
      getNodeByLocalName(objNode, 'bldg:boundedBy', 'boundedBy')
    ) as Array<Record<string, unknown>>;
    for (const bbNode of boundedByList) {
      for (const sKey of SURFACE_TAG_KEYS) {
        const shortSurfTag = sKey.replace(/^bldg:/, '');
        const surfNodes = asArray(
          getNodeByLocalName(bbNode, sKey, shortSurfTag)
        ) as Array<Record<string, unknown>>;
        for (const sNode of surfNodes) {
          const surfName = extractText(
            getNodeByLocalName(sNode, 'gml:name', 'name')
          ).trim();
          const lod2Ms = getNodeByLocalName(
            sNode,
            'bldg:lod2MultiSurface',
            'lod2MultiSurface'
          ) as Record<string, unknown> | undefined;
          if (lod2Ms) {
            collectMultiSurfacePolygonsAndXlinks(
              lod2Ms,
              gmlId,
              prefix,
              shortSurfTag,
              surfName,
              'lod2',
              inlinePolygons,
              xlinkPolygonHrefs,
              readerIssues
            );
          }
          const lod4Ms = getNodeByLocalName(
            sNode,
            'bldg:lod4MultiSurface',
            'lod4MultiSurface'
          ) as Record<string, unknown> | undefined;
          if (lod4Ms) {
            collectMultiSurfacePolygonsAndXlinks(
              lod4Ms,
              gmlId,
              prefix,
              shortSurfTag,
              surfName,
              'lod4',
              inlinePolygons,
              xlinkPolygonHrefs,
              readerIssues
            );
          }

          // Açıklıklar (Door / Window)
          const openings = asArray(
            getNodeByLocalName(sNode, 'bldg:opening', 'opening')
          ) as Array<Record<string, unknown>>;
          for (const op of openings) {
            const doors = asArray(
              getNodeByLocalName(op, 'bldg:Door', 'Door')
            ) as Array<Record<string, unknown>>;
            for (const dNode of doors) {
              registerObject(dNode, 'bldg:Door', gmlId);
            }
            const windows = asArray(
              getNodeByLocalName(op, 'bldg:Window', 'Window')
            ) as Array<Record<string, unknown>>;
            for (const wNode of windows) {
              registerObject(wNode, 'bldg:Window', gmlId);
            }
          }
        }
      }
    }

    // 6. Alt nesneler: outerBuildingInstallation (BLKN_ / TRS_), interiorRoom (BBK_ / OA_), roomInstallation (BBKIY_ / OAIY_)
    const outerInstalls = asArray(
      getNodeByLocalName(
        objNode,
        'bldg:outerBuildingInstallation',
        'outerBuildingInstallation'
      )
    ) as Array<Record<string, unknown>>;
    for (const oi of outerInstalls) {
      const biList = asArray(
        getNodeByLocalName(oi, 'bldg:BuildingInstallation', 'BuildingInstallation')
      ) as Array<Record<string, unknown>>;
      for (const bi of biList) {
        registerObject(bi, 'bldg:BuildingInstallation', gmlId);
      }
    }

    const intRooms = asArray(
      getNodeByLocalName(objNode, 'bldg:interiorRoom', 'interiorRoom')
    ) as Array<Record<string, unknown>>;
    for (const ir of intRooms) {
      const roomList = asArray(
        getNodeByLocalName(ir, 'bldg:Room', 'Room')
      ) as Array<Record<string, unknown>>;
      for (const rNode of roomList) {
        registerObject(rNode, 'bldg:Room', gmlId);
      }
    }

    const roomInstalls = asArray(
      getNodeByLocalName(objNode, 'bldg:roomInstallation', 'roomInstallation')
    ) as Array<Record<string, unknown>>;
    for (const ri of roomInstalls) {
      const ibiList = asArray(
        getNodeByLocalName(
          ri,
          'bldg:IntBuildingInstallation',
          'IntBuildingInstallation'
        )
      ) as Array<Record<string, unknown>>;
      for (const ibi of ibiList) {
        registerObject(ibi, 'bldg:IntBuildingInstallation', gmlId);
      }
    }

    polygons.push(...inlinePolygons);

    let minZ: number | null = null;
    let maxZ: number | null = null;
    for (const p of inlinePolygons) {
      if (minZ === null || p.minZ < minZ) minZ = p.minZ;
      if (maxZ === null || p.maxZ > maxZ) maxZ = p.maxZ;
    }

    const allPolygonIds = [
      ...inlinePolygons.map((p) => p.gmlId),
      ...xlinkPolygonHrefs.map((h) => h.replace(/^#/, '')),
    ];

    const cityObj: ImportedCityObject = {
      gmlId,
      prefix,
      tagName,
      gmlName,
      classValue,
      parentGmlId: resolvedParentId,
      storeyGmlId: prefix === 'K_' ? gmlId : null,
      referencedBbGmlId: attributesMap.independentSectionObjectReference || null,
      referencedStoreyGmlId: attributesMap.storeyObjectReference || null,
      groupMemberHrefs,
      xlinkPolygonHrefs,
      attributes,
      attributesMap,
      inlinePolygons,
      allPolygonIds: Array.from(new Set(allPolygonIds)),
      minZ,
      maxZ,
    };

    objects.push(cityObj);
    return cityObj;
  };

  // cityObjectMember taraması (G8: ad alanı önekinden bağımsız + G1 ilerleme bildirimi)
  const members = asArray(
    getNodeByLocalName(cityModel, 'core:cityObjectMember', 'cityObjectMember')
  ) as Array<Record<string, unknown>>;

  let storeysAboveGround = 0;
  let storeysBelowGround = 0;

  const totalMembers = Math.max(members.length, 1);
  let lastReportedPercent = 25;

  for (let idx = 0; idx < members.length; idx++) {
    const mem = members[idx];
    const currentPercent = 25 + Math.floor(((idx + 1) / totalMembers) * 55);
    if (currentPercent >= lastReportedPercent + 5 || idx === members.length - 1) {
      lastReportedPercent = currentPercent;
      onProgress?.({
        percent: currentPercent,
        phase: 'Nesneler ve 3B poligon geometrileri okunuyor',
        detail: `${idx + 1} / ${members.length} üye (${polygons.length} poligon)`,
      });
    }

    const bNode = getNodeByLocalName(mem, 'bldg:Building', 'Building') as
      | Record<string, unknown>
      | undefined;
    if (bNode) {
      storeysAboveGround = Number.parseInt(
        extractText(
          getNodeByLocalName(bNode, 'bldg:storeysAboveGround', 'storeysAboveGround')
        ) || '0',
        10
      );
      storeysBelowGround = Number.parseInt(
        extractText(
          getNodeByLocalName(bNode, 'bldg:storeysBelowGround', 'storeysBelowGround')
        ) || '0',
        10
      );
      registerObject(bNode, 'bldg:Building', null);
    }

    const grpNodes = asArray(
      getNodeByLocalName(mem, 'grp:CityObjectGroup', 'CityObjectGroup')
    ) as Array<Record<string, unknown>>;
    for (const gNode of grpNodes) {
      registerObject(gNode, 'grp:CityObjectGroup', null);
    }

    const genNodes = asArray(
      getNodeByLocalName(mem, 'gen:GenericCityObject', 'GenericCityObject')
    ) as Array<Record<string, unknown>>;
    for (const genNode of genNodes) {
      registerObject(genNode, 'gen:GenericCityObject', null);
    }
  }

  // Kat (K_) -> BB_ -> BBK_ / BLKN_ / KAPI_ / PEN_ kat eşleştirmesi
  const storeyByBbId = new Map<string, string>();
  const storeyObjects = objects
    .filter((o) => o.prefix === 'K_')
    .sort((a, b) => (a.minZ ?? 0) - (b.minZ ?? 0));

  for (const st of storeyObjects) {
    for (const href of st.groupMemberHrefs) {
      const bbId = href.replace(/^#/, '');
      storeyByBbId.set(bbId, st.gmlId);
    }
  }

  const objectsByIdTemp: Record<string, ImportedCityObject> = {};
  for (const o of objects) {
    objectsByIdTemp[o.gmlId] = o;
  }

  const enrichedObjects: ImportedCityObject[] = objects.map((obj) => {
    let resolvedStoreyId = obj.storeyGmlId;
    if (!resolvedStoreyId) {
      if (obj.prefix === 'BB_') {
        resolvedStoreyId = storeyByBbId.get(obj.gmlId) ?? null;
      } else if (
        obj.referencedBbGmlId &&
        obj.referencedBbGmlId !== '-1' &&
        storeyByBbId.has(obj.referencedBbGmlId)
      ) {
        resolvedStoreyId = storeyByBbId.get(obj.referencedBbGmlId) ?? null;
      } else if (obj.referencedStoreyGmlId && obj.referencedStoreyGmlId !== '-1') {
        resolvedStoreyId = obj.referencedStoreyGmlId;
      } else if (obj.parentGmlId) {
        const parentObj = objectsByIdTemp[obj.parentGmlId];
        if (parentObj?.referencedBbGmlId) {
          resolvedStoreyId = storeyByBbId.get(parentObj.referencedBbGmlId) ?? null;
        }
      }
      // Kot yakınlığı ile yedek kat eşleştirmesi (örn. bina dış duvarındaki KAPI_/PEN_)
      if (!resolvedStoreyId && obj.minZ !== null && storeyObjects.length > 0) {
        let bestStorey = storeyObjects[0];
        let bestDist = Number.POSITIVE_INFINITY;
        for (const st of storeyObjects) {
          if (st.minZ !== null && st.maxZ !== null) {
            if (obj.minZ >= st.minZ - 0.15 && obj.minZ <= st.maxZ + 0.15) {
              bestStorey = st;
              bestDist = 0;
              break;
            }
            const d = Math.abs(obj.minZ - st.minZ);
            if (d < bestDist) {
              bestDist = d;
              bestStorey = st;
            }
          }
        }
        resolvedStoreyId = bestStorey.gmlId;
      }
    }

    return {
      ...obj,
      storeyGmlId: resolvedStoreyId,
    };
  });

  const objectsById: Record<string, ImportedCityObject> = {};
  for (const o of enrichedObjects) {
    objectsById[o.gmlId] = o;
  }

  const enrichedPolygons: ImportedPolygon[] = polygons.map((p) => {
    const owner = objectsById[p.ownerObjectGmlId];
    return {
      ...p,
      storeyGmlId: owner?.storeyGmlId ?? null,
    };
  });

  const polygonsById: Record<string, ImportedPolygon> = {};
  for (const p of enrichedPolygons) {
    polygonsById[p.gmlId] = p;
  }

  // xlink:href doğrulaması (V-211)
  for (const obj of enrichedObjects) {
    for (const href of obj.xlinkPolygonHrefs) {
      if (!href.startsWith('#')) {
        readerIssues.push({
          ruleId: 'V-211',
          severity: 'H',
          message: `${obj.gmlId} içindeki xlink:href değeri "#" ile başlamalıdır: "${href}".`,
          targetGmlId: obj.gmlId,
        });
      }
      const targetId = href.replace(/^#/, '');
      if (!polygonsById[targetId]) {
        readerIssues.push({
          ruleId: 'V-211',
          severity: 'H',
          message: `${obj.gmlId} tarafından referanslanan poligon ("${targetId}") dosyada bulunamadı.`,
          targetGmlId: obj.gmlId,
        });
      }
    }
  }

  // Hesaplanan sınır kutusu (computedBounds) ve yerel merkez (originTuref)
  let minE = Number.POSITIVE_INFINITY;
  let minN = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxE = Number.NEGATIVE_INFINITY;
  let maxN = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const p of enrichedPolygons) {
    for (const v of p.exteriorRing.vertices) {
      if (v.e < minE) minE = v.e;
      if (v.n < minN) minN = v.n;
      if (v.z < minZ) minZ = v.z;
      if (v.e > maxE) maxE = v.e;
      if (v.n > maxN) maxN = v.n;
      if (v.z > maxZ) maxZ = v.z;
    }
  }

  const computedBounds: BoundingBox3D = Number.isFinite(minE)
    ? { minE, minN, minZ, maxE, maxN, maxZ }
    : envelope;

  const originTuref: Point3D = {
    e: (computedBounds.minE + computedBounds.maxE) / 2,
    n: (computedBounds.minN + computedBounds.maxN) / 2,
    z: computedBounds.minZ,
  };

  // Kat biçimi (A/B/C) ve kapı alt ofseti (mm) tespiti
  const detectedStoreyForms: StoreyGeometryForm[] = storeyObjects.map((st) => {
    if (storeyHasKatElemaniRole.has(st.gmlId)) {
      return 'B';
    }
    const floorCount = st.inlinePolygons.filter((p) => p.prefix === 'Floor_').length;
    if (floorCount === 2) return 'C';
    if (floorCount === 1) return 'A';
    return st.inlinePolygons.length > 0 || st.groupMemberHrefs.length > 0 ? 'A' : 'B';
  });
  const detectedStoreyForm: StoreyGeometryForm =
    detectedStoreyForms.length > 0 ? detectedStoreyForms[0] : 'A';
  const hasInconsistentStoreyForms =
    detectedStoreyForms.length > 1 &&
    detectedStoreyForms.some((f) => f !== detectedStoreyForm);

  let detectedDoorBottomOffsetMm: number | null = null;
  const rooms = enrichedObjects.filter((o) => o.prefix === 'BBK_' || o.prefix === 'OA_');
  for (const r of rooms) {
    const floorPoly = r.inlinePolygons.find((p) => p.surfaceTag === 'FloorSurface');
    const childDoor = enrichedObjects.find(
      (o) => o.prefix === 'KAPI_' && o.parentGmlId === r.gmlId
    );
    const doorPoly = childDoor?.inlinePolygons[0];
    if (floorPoly && doorPoly) {
      detectedDoorBottomOffsetMm = Math.round((doorPoly.minZ - floorPoly.minZ) * 1000);
      break;
    }
  }

  const mbObj = enrichedObjects.find((o) => o.prefix === 'MB_');
  const buildingGmlId = mbObj?.gmlId ?? '';
  const constructionID = mbObj?.attributesMap.constructionID ?? '';

  // G2 & G3: Kat biçimi + ölçülen kapı alt ofseti birleşimiyle üretici profili ve V-215 BİLGİ
  const profileResolution = resolveProducerProfileFromFormAndOffset(
    detectedStoreyForm,
    detectedDoorBottomOffsetMm,
    buildingGmlId || undefined
  );
  const detectedProducerProfile: ProducerProfile = profileResolution.profile;
  if (profileResolution.issue) {
    readerIssues.push(profileResolution.issue);
  }

  onProgress?.({
    percent: 90,
    phase: 'BigInt arsa payı (K84) ve K89 kanonik özet hesaplanıyor',
    detail: `${enrichedObjects.length} nesne, ${enrichedPolygons.length} poligon`,
  });

  // BigInt Arsa Payı Analizi (G4 uyumlu)
  const bbObjects = enrichedObjects.filter((o) => o.prefix === 'BB_');
  const shareInputs: IndependentSectionShareInput[] = bbObjects.map((bb) => ({
    gmlId: bb.gmlId,
    blockName: bb.attributesMap.blockName ?? '',
    entrance: bb.attributesMap.entrance ?? '',
    independentSectionNumber: bb.attributesMap.independentSectionNumber ?? '',
    propertyLot: bb.attributesMap.propertyLot ?? '',
    registeredQuality: bb.attributesMap.registeredQuality ?? '',
  }));
  const landShareAnalysis = analyzeBuildingLandShares(shareInputs);

  // K89 Kanonik Model Özeti
  const coordsMm: number[] = [];
  const sortedPolys = [...enrichedPolygons].sort((a, b) =>
    compareCodeUnits(a.gmlId, b.gmlId)
  );
  for (const p of sortedPolys) {
    for (const v of p.exteriorRing.vertices) {
      coordsMm.push(metersToMm(v.e), metersToMm(v.n), metersToMm(v.z));
    }
  }

  const canonicalHash = computeCanonicalModelHash({
    schemaVersion: '3.5.5',
    producerProfile: detectedProducerProfile,
    codelistsCombinedSha256: 'tkgm-14-codelists-v3.5.5',
    buildingAttributes: mbObj?.attributesMap ?? {},
    coordinatesMm: coordsMm,
    objectAttributes: enrichedObjects.map((o) => ({
      gmlId: o.gmlId,
      attributes: o.attributesMap,
    })),
  });

  // Hiyerarşik Nesne Ağacı (D-23.1 & D-23.6)
  const buildRoomChildrenNodes = (roomObj: ImportedCityObject): ImportedTreeNode[] => {
    const childInstallations = enrichedObjects.filter(
      (o) =>
        (o.prefix === 'BBKIY_' || o.prefix === 'OAIY_') &&
        o.parentGmlId === roomObj.gmlId
    );
    const childDoors = enrichedObjects.filter(
      (o) => o.prefix === 'KAPI_' && o.parentGmlId === roomObj.gmlId
    );
    const childWindows = enrichedObjects.filter(
      (o) => o.prefix === 'PEN_' && o.parentGmlId === roomObj.gmlId
    );

    return [
      ...childInstallations.map((inst) => ({
        id: inst.gmlId,
        gmlId: inst.gmlId,
        label: inst.gmlName || inst.gmlId,
        subLabel: inst.prefix === 'BBKIY_' ? 'İç Yapı' : 'OA İç Yapı',
        category: (inst.prefix === 'BBKIY_' ? 'BBKIY' : 'OAIY') as 'BBKIY' | 'OAIY',
        storeyGmlId: roomObj.storeyGmlId,
        polygonCount: inst.inlinePolygons.length,
        children: [],
      })),
      ...childDoors.map((d) => ({
        id: d.gmlId,
        gmlId: d.gmlId,
        label: d.gmlName || 'Kapı',
        subLabel: d.attributes.find((a) => a.name === 'doorUsage')?.codelistDescription ?? d.gmlId.slice(0, 13),
        category: 'KAPI' as const,
        storeyGmlId: roomObj.storeyGmlId,
        polygonCount: d.inlinePolygons.length,
        children: [],
      })),
      ...childWindows.map((w) => ({
        id: w.gmlId,
        gmlId: w.gmlId,
        label: w.gmlName || 'Pencere',
        subLabel: w.attributes.find((a) => a.name === 'windowUsage')?.codelistDescription ?? w.gmlId.slice(0, 12),
        category: 'PEN' as const,
        storeyGmlId: roomObj.storeyGmlId,
        polygonCount: w.inlinePolygons.length,
        children: [],
      })),
    ];
  };

  const storeyTreeNodes: ImportedTreeNode[] = storeyObjects.map((st) => {
    const stBbs = enrichedObjects.filter(
      (o) => o.prefix === 'BB_' && o.storeyGmlId === st.gmlId
    );
    const bbNodes: ImportedTreeNode[] = stBbs.map((bb) => {
      const bbRooms = enrichedObjects.filter(
        (o) => o.prefix === 'BBK_' && o.referencedBbGmlId === bb.gmlId
      );
      const bbBalconies = enrichedObjects.filter(
        (o) =>
          (o.prefix === 'BLKN_' || o.prefix === 'TRS_') &&
          o.referencedBbGmlId === bb.gmlId
      );

      const roomNodes: ImportedTreeNode[] = bbRooms.map((rm) => {
        const usageDesc =
          rm.attributes.find((a) => a.name === 'partUsage')?.codelistDescription ??
          `Kod ${rm.attributesMap.partUsage ?? ''}`;
        return {
          id: rm.gmlId,
          gmlId: rm.gmlId,
          label: rm.gmlName || `Kısım (${usageDesc})`,
          subLabel: `${usageDesc} · ${(Number.parseFloat(rm.attributesMap.calculatedArea || '0')).toFixed(2)} m²`,
          category: 'BBK',
          storeyGmlId: st.gmlId,
          polygonCount: rm.inlinePolygons.length,
          children: buildRoomChildrenNodes(rm),
        };
      });

      const balconyNodes: ImportedTreeNode[] = bbBalconies.map((blk) => ({
        id: blk.gmlId,
        gmlId: blk.gmlId,
        label: blk.gmlName || 'Balkon',
        subLabel: `${(Number.parseFloat(blk.attributesMap.calculatedArea || '0')).toFixed(2)} m²`,
        category: blk.prefix === 'TRS_' ? 'TRS' : 'BLKN',
        storeyGmlId: st.gmlId,
        polygonCount: blk.inlinePolygons.length,
        children: [],
      }));

      return {
        id: bb.gmlId,
        gmlId: bb.gmlId,
        label: bb.gmlName || `BB No: ${bb.attributesMap.independentSectionNumber ?? ''}`,
        subLabel: `Pay: ${bb.attributesMap.propertyLot ?? '-'} · ${bb.attributesMap.registeredQuality ?? ''}`,
        category: 'BB',
        storeyGmlId: st.gmlId,
        polygonCount: bb.inlinePolygons.length,
        children: [...roomNodes, ...balconyNodes],
      };
    });

    const storeyUsageDesc =
      st.attributes.find((a) => a.name === 'storeyUsage')?.codelistDescription ?? '';

    return {
      id: st.gmlId,
      gmlId: st.gmlId,
      label: st.gmlName || `Kat_${st.attributesMap.storeyNumber ?? ''}`,
      subLabel: `${storeyUsageDesc} · ${stBbs.length} BB`,
      category: 'STOREY',
      storeyGmlId: st.gmlId,
      polygonCount: st.inlinePolygons.length,
      children: bbNodes,
    };
  });

  const oaNodes: ImportedTreeNode[] = enrichedObjects
    .filter((o) => o.prefix === 'OA_')
    .map((oa) => ({
      id: oa.gmlId,
      gmlId: oa.gmlId,
      label: oa.gmlName || 'Ortak Alan',
      subLabel: `${oa.attributesMap.calculatedArea ?? '0'} m²`,
      category: 'OA',
      storeyGmlId: oa.storeyGmlId,
      polygonCount: oa.inlinePolygons.length,
      children: buildRoomChildrenNodes(oa),
    }));

  const mbgObj = enrichedObjects.find((o) => o.prefix === 'MBG_');

  const hierarchyTree: ImportedTreeNode[] = mbObj
    ? [
        {
          id: mbObj.gmlId,
          gmlId: mbObj.gmlId,
          label: mbObj.gmlName || `Mimari Bina_${constructionID}`,
          subLabel: `${srsName} · ${enrichedPolygons.length} Poligon`,
          category: 'MB',
          storeyGmlId: null,
          polygonCount: mbObj.inlinePolygons.length,
          children: [
            ...storeyTreeNodes,
            ...oaNodes,
            ...(mbgObj
              ? [
                  {
                    id: mbgObj.gmlId,
                    gmlId: mbgObj.gmlId,
                    label: mbgObj.gmlName || 'Mimari Bina Grup',
                    subLabel: `${mbgObj.groupMemberHrefs.length} Üye`,
                    category: 'MBG' as const,
                    storeyGmlId: null,
                    polygonCount: 0,
                    children: [],
                  },
                ]
              : []),
          ],
        },
      ]
    : storeyTreeNodes;

  onProgress?.({
    percent: 100,
    phase: 'Model okuma tamamlandı',
    detail: `${enrichedObjects.length} nesne, ${enrichedPolygons.length} poligon`,
  });

  return {
    fileName,
    fileSizeBytes: cleanXml.length,
    xmlDeclaration,
    hasUtf8Bom,
    lineEnding,
    srsName,
    srsDimension,
    envelope,
    computedBounds,
    originTuref,
    constructionID,
    buildingGmlId,
    storeysAboveGround,
    storeysBelowGround,
    detectedStoreyForm,
    detectedStoreyForms,
    hasInconsistentStoreyForms,
    detectedDoorBottomOffsetMm,
    detectedProducerProfile,
    objects: enrichedObjects,
    objectsById,
    polygons: enrichedPolygons,
    polygonsById,
    ticLineStrings,
    hierarchyTree,
    landShareAnalysis,
    readerIssues,
    canonicalHash,
  };
}

/**
 * G1 (PERF-01): Web Worker'dan ana iş parçacığına (main thread) poligon köşelerini sıfır kopya (`Transferable` `ArrayBuffer`)
 * ile aktarmak için tüm poligonların dış ve iç halka köşelerini tek bir `Float64Array` içine paketler.
 * Paket düzeni: her halka için `[vertexCount, e0, n0, z0, e1, n1, z1, ...]`.
 */
export function packModelPolygonVerticesFloat64(model: ImportedModel): {
  readonly strippedModel: ImportedModel;
  readonly packedBuffer: Float64Array;
} {
  let totalDoubles = 0;
  for (const poly of model.polygons) {
    totalDoubles += 1 + poly.exteriorRing.vertices.length * 3;
    for (const ir of poly.interiorRings) {
      totalDoubles += 1 + ir.vertices.length * 3;
    }
  }

  const packed = new Float64Array(totalDoubles);
  let offset = 0;

  const writeRing = (verts: readonly Point3D[]) => {
    packed[offset++] = verts.length;
    for (let i = 0; i < verts.length; i++) {
      packed[offset++] = verts[i].e;
      packed[offset++] = verts[i].n;
      packed[offset++] = verts[i].z;
    }
  };

  const emptyVerts: readonly Point3D[] = [];
  const strippedPolygons: ImportedPolygon[] = model.polygons.map((poly) => {
    writeRing(poly.exteriorRing.vertices);
    for (const ir of poly.interiorRings) {
      writeRing(ir.vertices);
    }
    return {
      ...poly,
      exteriorRing: { ...poly.exteriorRing, vertices: emptyVerts },
      interiorRings: poly.interiorRings.map((ir) => ({
        ...ir,
        vertices: emptyVerts,
      })),
    };
  });

  const strippedPolygonsById: Record<string, ImportedPolygon> = {};
  for (const sp of strippedPolygons) {
    strippedPolygonsById[sp.gmlId] = sp;
  }

  const strippedObjects: ImportedCityObject[] = model.objects.map((obj) => ({
    ...obj,
    inlinePolygons: obj.inlinePolygons.map(
      (ip) => strippedPolygonsById[ip.gmlId] ?? ip
    ),
  }));

  const strippedObjectsById: Record<string, ImportedCityObject> = {};
  for (const so of strippedObjects) {
    strippedObjectsById[so.gmlId] = so;
  }

  return {
    strippedModel: {
      ...model,
      objects: strippedObjects,
      objectsById: strippedObjectsById,
      polygons: strippedPolygons,
      polygonsById: strippedPolygonsById,
    },
    packedBuffer: packed,
  };
}

/**
 * G1 (PERF-01): Web Worker'dan `Transferable` olarak gelen `Float64Array` köşe tamponunu
 * `ImportedModel` içindeki poligon halkalarına geri yükler.
 */
export function hydrateModelPolygonVerticesFloat64(
  strippedModel: ImportedModel,
  packed: Float64Array
): ImportedModel {
  let offset = 0;
  const readRing = (): Point3D[] => {
    const count = packed[offset++] || 0;
    const verts: Point3D[] = new Array(count);
    for (let i = 0; i < count; i++) {
      verts[i] = {
        e: packed[offset++],
        n: packed[offset++],
        z: packed[offset++],
      };
    }
    return verts;
  };

  const hydratedPolygons: ImportedPolygon[] = strippedModel.polygons.map((poly) => {
    const extVerts = readRing();
    const intRings: ImportedLinearRing[] = poly.interiorRings.map((ir) => ({
      ...ir,
      vertices: readRing(),
    }));
    return {
      ...poly,
      exteriorRing: { ...poly.exteriorRing, vertices: extVerts },
      interiorRings: intRings,
    };
  });

  const hydratedPolygonsById: Record<string, ImportedPolygon> = {};
  for (const hp of hydratedPolygons) {
    hydratedPolygonsById[hp.gmlId] = hp;
  }

  const hydratedObjects: ImportedCityObject[] = strippedModel.objects.map((obj) => ({
    ...obj,
    inlinePolygons: obj.inlinePolygons.map(
      (ip) => hydratedPolygonsById[ip.gmlId] ?? ip
    ),
  }));

  const hydratedObjectsById: Record<string, ImportedCityObject> = {};
  for (const ho of hydratedObjects) {
    hydratedObjectsById[ho.gmlId] = ho;
  }

  return {
    ...strippedModel,
    objects: hydratedObjects,
    objectsById: hydratedObjectsById,
    polygons: hydratedPolygons,
    polygonsById: hydratedPolygonsById,
  };
}

