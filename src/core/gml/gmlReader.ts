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

function getIdPrefix(gmlId: string): string {
  const idx = gmlId.indexOf('_');
  return idx >= 0 ? gmlId.slice(0, idx + 1) : '';
}

function asArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
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
  const gmlId = String(ringNode['@_gml:id'] ?? ringNode['@_id'] ?? '').trim();
  const prefix = getIdPrefix(gmlId);

  const posListNode = ringNode['gml:posList'] ?? ringNode.posList;
  const posNodes = asArray(ringNode['gml:pos'] ?? ringNode.pos);

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
  const gmlId = String(polyNode['@_gml:id'] ?? polyNode['@_id'] ?? '').trim();
  const prefix = getIdPrefix(gmlId);

  const extNode = (polyNode['gml:exterior'] ?? polyNode.exterior) as
    | Record<string, unknown>
    | undefined;
  if (!extNode) return null;

  const extRingRaw = (extNode['gml:LinearRing'] ?? extNode.LinearRing) as
    | Record<string, unknown>
    | undefined;
  if (!extRingRaw) return null;

  const exteriorRing = parseLinearRingNode(extRingRaw, readerIssues);
  if (!exteriorRing || exteriorRing.vertices.length < 3) return null;

  const intNodes = asArray(polyNode['gml:interior'] ?? polyNode.interior) as Array<
    Record<string, unknown>
  >;
  const interiorRings: ImportedLinearRing[] = [];
  for (const intNode of intNodes) {
    const ringRaw = (intNode['gml:LinearRing'] ?? intNode.LinearRing) as
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
  const msNode = (msContainer['gml:MultiSurface'] ??
    msContainer.MultiSurface ??
    msContainer) as Record<string, unknown>;
  const members = asArray(msNode['gml:surfaceMember'] ?? msNode.surfaceMember) as Array<
    Record<string, unknown>
  >;

  for (const mem of members) {
    const href = mem['@_xlink:href'] ?? mem['@_href'];
    if (typeof href === 'string' && href.trim().length > 0) {
      outXlinks.push(href.trim());
    }
    const polyRaw = (mem['gml:Polygon'] ?? mem.Polygon) as
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
  const attrTypes: ReadonlyArray<{ tag: string; type: GenericAttributeType }> = [
    { tag: 'gen:stringAttribute', type: 'string' },
    { tag: 'gen:intAttribute', type: 'int' },
    { tag: 'gen:doubleAttribute', type: 'double' },
    { tag: 'gen:dateAttribute', type: 'date' },
  ];

  for (const { tag, type } of attrTypes) {
    const rawList = asArray(objNode[tag]) as Array<Record<string, unknown>>;
    for (const item of rawList) {
      const name = String(item['@_name'] ?? '').trim();
      const valNode = item['gen:value'] ?? item.value;
      const rawValue = extractText(valNode);
      const cleanValue = rawValue.trim();
      const hasWhitespaceOrTabWarning =
        (type === 'int' || type === 'double') &&
        rawValue.length > 0 &&
        rawValue !== cleanValue;

      if (hasWhitespaceOrTabWarning) {
        readerIssues.push({
          ruleId: 'V-214',
          severity: 'U',
          message: `${ownerGmlId} nesnesindeki "${name}" (${type}) özniteliğinde baştan/sondan boşluk veya TAB karakteri bulundu: ${JSON.stringify(
            rawValue
          )}.`,
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
 * Bir TKGM CityGML 2.0 dosyasını (`Ornek1..6`, `Amasya`, `Sincan` vb.) çevrimdışı ayrıştırarak
 * nesne ağacını, poligon + delik geometrilerini, kod listesi açıklamalarını, `BigInt` arsa payı analizini
 * ve `K89` kanonik model özetini içeren `ImportedModel` nesnesini üretir (`M1`).
 */
export function parseCityGmlModel(
  xmlContent: string,
  fileName: string,
  codelists: CodelistRegistry
): ImportedModel {
  const readerIssues: ValidationIssue[] = [];
  const hasUtf8Bom = xmlContent.charCodeAt(0) === 0xfeff;
  const cleanXml = hasUtf8Bom ? xmlContent.slice(1) : xmlContent;

  const hasCrlf = cleanXml.includes('\r\n');
  const hasBareLf = /(?:^|[^\r])\n/.test(cleanXml);
  const lineEnding: 'CRLF' | 'LF' | 'MIXED' =
    hasCrlf && hasBareLf ? 'MIXED' : hasCrlf ? 'CRLF' : 'LF';

  const firstLineMatch = /^<\?xml[^>]*\?>/.exec(cleanXml.trimStart());
  const xmlDeclaration = firstLineMatch ? firstLineMatch[0] : '';

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: false,
    parseTagValue: false,
  });

  const root = parser.parse(cleanXml) as Record<string, unknown>;
  const cityModel = (root['core:CityModel'] ??
    root.CityModel ??
    root['gml:CityModel']) as Record<string, unknown> | undefined;

  if (!cityModel) {
    throw new Error(`"${fileName}" içinde core:CityModel kök elemanı bulunamadı.`);
  }

  // Envelope
  const boundedByRoot = (cityModel['gml:boundedBy'] ?? cityModel.boundedBy) as
    | Record<string, unknown>
    | undefined;
  const envNode = (boundedByRoot?.['gml:Envelope'] ?? boundedByRoot?.Envelope) as
    | Record<string, unknown>
    | undefined;
  const srsName = String(envNode?.['@_srsName'] ?? '').trim();
  const srsDimension = String(envNode?.['@_srsDimension'] ?? '3').trim();

  const parseCorner = (str: string): [number, number, number] => {
    const parts = str.trim().split(/\s+/).map(Number.parseFloat);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  };
  const lowerCorner = parseCorner(extractText(envNode?.['gml:lowerCorner'] ?? envNode?.lowerCorner));
  const upperCorner = parseCorner(extractText(envNode?.['gml:upperCorner'] ?? envNode?.upperCorner));

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

  const registerObject = (
    objNode: Record<string, unknown>,
    tagName: string,
    parentGmlId: string | null
  ): ImportedCityObject => {
    const gmlId = String(objNode['@_gml:id'] ?? objNode['@_id'] ?? '').trim();
    const prefix = getIdPrefix(gmlId);
    const gmlName = extractText(objNode['gml:name'] ?? objNode.name).trim();
    const classValue = extractText(
      objNode['bldg:class'] ?? objNode['grp:class'] ?? objNode['gen:class'] ?? objNode.class
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

    // groupMember & parent
    const grpMembers = asArray(objNode['grp:groupMember'] ?? objNode.groupMember) as Array<
      Record<string, unknown>
    >;
    for (const gm of grpMembers) {
      const href = String(gm['@_xlink:href'] ?? gm['@_href'] ?? '').trim();
      if (href) groupMemberHrefs.push(href);
    }

    const grpParentNode = (objNode['grp:parent'] ?? objNode.parent) as
      | Record<string, unknown>
      | undefined;
    const grpParentHref = grpParentNode
      ? String(grpParentNode['@_xlink:href'] ?? grpParentNode['@_href'] ?? '').trim()
      : '';
    const resolvedParentId = grpParentHref
      ? grpParentHref.replace(/^#/, '')
      : parentGmlId;

    // 1. LoD0 FootPrint & RoofEdge
    if (objNode['bldg:lod0FootPrint']) {
      collectMultiSurfacePolygonsAndXlinks(
        objNode['bldg:lod0FootPrint'] as Record<string, unknown>,
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
    if (objNode['bldg:lod0RoofEdge']) {
      collectMultiSurfacePolygonsAndXlinks(
        objNode['bldg:lod0RoofEdge'] as Record<string, unknown>,
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

    // 2. LoD1 Solid
    const lod1Solid = objNode['bldg:lod1Solid'] as Record<string, unknown> | undefined;
    if (lod1Solid) {
      const compSolid = (lod1Solid['gml:CompositeSolid'] ?? lod1Solid.CompositeSolid) as
        | Record<string, unknown>
        | undefined;
      const solidMembers = asArray(compSolid?.['gml:solidMember'] ?? compSolid?.solidMember) as Array<
        Record<string, unknown>
      >;
      for (const sm of solidMembers) {
        const solid = (sm['gml:Solid'] ?? sm.Solid) as Record<string, unknown> | undefined;
        const ext = (solid?.['gml:exterior'] ?? solid?.exterior) as
          | Record<string, unknown>
          | undefined;
        const compSurf = (ext?.['gml:CompositeSurface'] ?? ext?.CompositeSurface) as
          | Record<string, unknown>
          | undefined;
        if (compSurf) {
          collectMultiSurfacePolygonsAndXlinks(
            compSurf,
            gmlId,
            prefix,
            'Solid',
            'LoD1Solid',
            'lod1Solid',
            inlinePolygons,
            xlinkPolygonHrefs,
            readerIssues
          );
        }
      }
    }

    // 3. TIC (lod2TerrainIntersection)
    const ticNode = objNode['bldg:lod2TerrainIntersection'] as
      | Record<string, unknown>
      | undefined;
    if (ticNode) {
      const mc = (ticNode['gml:MultiCurve'] ?? ticNode.MultiCurve) as
        | Record<string, unknown>
        | undefined;
      const curveMembers = asArray(mc?.['gml:curveMember'] ?? mc?.curveMember) as Array<
        Record<string, unknown>
      >;
      for (const cm of curveMembers) {
        const ls = (cm['gml:LineString'] ?? cm.LineString) as
          | Record<string, unknown>
          | undefined;
        if (ls) {
          const posText = extractText(ls['gml:posList'] ?? ls.posList).trim();
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

    // 4. Doğrudan Geometri kapları (lod2MultiSurface, lod4MultiSurface, gen:lod2Geometry, grp:geometry, bldg:lod2Geometry, bldg:lod4Geometry)
    const directContainers: ReadonlyArray<{
      key: string;
      lod: ImportedPolygon['lodLevel'];
      surfTag: string;
    }> = [
      { key: 'bldg:lod2MultiSurface', lod: 'lod2', surfTag: 'MultiSurface' },
      { key: 'bldg:lod4MultiSurface', lod: 'lod4', surfTag: tagName },
      { key: 'gen:lod2Geometry', lod: 'lod2', surfTag: 'BagimsizBolum' },
      { key: 'bldg:lod2Geometry', lod: 'lod2', surfTag: 'BalkonTeras' },
      { key: 'bldg:lod4Geometry', lod: 'lod4', surfTag: 'IcYapi' },
      { key: 'grp:geometry', lod: 'group', surfTag: 'Kat' },
    ];

    for (const dc of directContainers) {
      if (objNode[dc.key]) {
        collectMultiSurfacePolygonsAndXlinks(
          objNode[dc.key] as Record<string, unknown>,
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
    const boundedByList = asArray(objNode['bldg:boundedBy'] ?? objNode.boundedBy) as Array<
      Record<string, unknown>
    >;
    for (const bbNode of boundedByList) {
      for (const sKey of SURFACE_TAG_KEYS) {
        const surfNodes = asArray(bbNode[sKey]) as Array<Record<string, unknown>>;
        for (const sNode of surfNodes) {
          const shortSurfTag = sKey.replace(/^bldg:/, '');
          const surfName = extractText(sNode['gml:name'] ?? sNode.name).trim();
          if (sNode['bldg:lod2MultiSurface']) {
            collectMultiSurfacePolygonsAndXlinks(
              sNode['bldg:lod2MultiSurface'] as Record<string, unknown>,
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
          if (sNode['bldg:lod4MultiSurface']) {
            collectMultiSurfacePolygonsAndXlinks(
              sNode['bldg:lod4MultiSurface'] as Record<string, unknown>,
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
          const openings = asArray(sNode['bldg:opening'] ?? sNode.opening) as Array<
            Record<string, unknown>
          >;
          for (const op of openings) {
            const doors = asArray(op['bldg:Door'] ?? op.Door) as Array<
              Record<string, unknown>
            >;
            for (const dNode of doors) {
              registerObject(dNode, 'bldg:Door', gmlId);
            }
            const windows = asArray(op['bldg:Window'] ?? op.Window) as Array<
              Record<string, unknown>
            >;
            for (const wNode of windows) {
              registerObject(wNode, 'bldg:Window', gmlId);
            }
          }
        }
      }
    }

    // 6. Alt nesneler: outerBuildingInstallation (BLKN_ / TRS_), interiorRoom (BBK_ / OA_), roomInstallation (BBKIY_ / OAIY_)
    const outerInstalls = asArray(
      objNode['bldg:outerBuildingInstallation'] ?? objNode.outerBuildingInstallation
    ) as Array<Record<string, unknown>>;
    for (const oi of outerInstalls) {
      const biList = asArray(
        oi['bldg:BuildingInstallation'] ?? oi.BuildingInstallation
      ) as Array<Record<string, unknown>>;
      for (const bi of biList) {
        registerObject(bi, 'bldg:BuildingInstallation', gmlId);
      }
    }

    const intRooms = asArray(objNode['bldg:interiorRoom'] ?? objNode.interiorRoom) as Array<
      Record<string, unknown>
    >;
    for (const ir of intRooms) {
      const roomList = asArray(ir['bldg:Room'] ?? ir.Room) as Array<Record<string, unknown>>;
      for (const rNode of roomList) {
        registerObject(rNode, 'bldg:Room', gmlId);
      }
    }

    const roomInstalls = asArray(
      objNode['bldg:roomInstallation'] ?? objNode.roomInstallation
    ) as Array<Record<string, unknown>>;
    for (const ri of roomInstalls) {
      const ibiList = asArray(
        ri['bldg:IntBuildingInstallation'] ?? ri.IntBuildingInstallation
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

  // cityObjectMember taraması
  const members = asArray(
    cityModel['core:cityObjectMember'] ?? cityModel.cityObjectMember
  ) as Array<Record<string, unknown>>;

  let storeysAboveGround = 0;
  let storeysBelowGround = 0;

  for (const mem of members) {
    if (mem['bldg:Building']) {
      const bNode = mem['bldg:Building'] as Record<string, unknown>;
      storeysAboveGround = Number.parseInt(
        extractText(bNode['bldg:storeysAboveGround'] ?? bNode.storeysAboveGround) || '0',
        10
      );
      storeysBelowGround = Number.parseInt(
        extractText(bNode['bldg:storeysBelowGround'] ?? bNode.storeysBelowGround) || '0',
        10
      );
      registerObject(bNode, 'bldg:Building', null);
    }
    if (mem['grp:CityObjectGroup']) {
      const grpNodes = asArray(mem['grp:CityObjectGroup']) as Array<Record<string, unknown>>;
      for (const gNode of grpNodes) {
        registerObject(gNode, 'grp:CityObjectGroup', null);
      }
    }
    if (mem['gen:GenericCityObject']) {
      const genNodes = asArray(mem['gen:GenericCityObject']) as Array<Record<string, unknown>>;
      for (const genNode of genNodes) {
        registerObject(genNode, 'gen:GenericCityObject', null);
      }
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
    const floorCount = st.inlinePolygons.filter((p) => p.prefix === 'Floor_').length;
    return floorCount === 1 ? 'A' : floorCount === 2 ? 'C' : 'B';
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

  const detectedProducerProfile: ProducerProfile =
    detectedStoreyForm === 'B'
      ? 'B50'
      : detectedStoreyForm === 'C'
      ? 'C50'
      : 'A10';

  // BigInt Arsa Payı Analizi
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

  const mbObj = enrichedObjects.find((o) => o.prefix === 'MB_');
  const buildingGmlId = mbObj?.gmlId ?? '';
  const constructionID = mbObj?.attributesMap.constructionID ?? '';

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
