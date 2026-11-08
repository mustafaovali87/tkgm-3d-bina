// K01
// K06
// K07
// K09
// K12
// K13
// K14
// K55
// K70
// K76
// K79
// K86
// K88
// K90
// K99
// K100
// V-014
// V-030
// V-052
// V-053
// V-055
// V-056
// V-057
// V-059
// V-060
// V-062
// V-210
// V-213
// V-215
// V-216

/**
 * Doğrulama mesajı ciddiyet düzeyi (`K90`).
 * `H` = Hata (TKGM sunucusunda kesin ret nedeni), `U` = Uyarı, `B` = Bilgi.
 */
export type ValidationSeverity = 'H' | 'U' | 'B';

export interface ValidationIssue {
  readonly ruleId: string;
  readonly severity: ValidationSeverity;
  readonly message: string;
  readonly targetGmlId?: string;
}

/**
 * Üretici uyumluluk profilleri (`K55`, `K79`, `OY-01`, `V-215`).
 * - `A10` (Varsayılan): Kat Biçim A + kapı deliği/nesnesi `+10 mm`
 * - `B50`: Kat Biçim B + kapı deliği/nesnesi `+50 mm`
 * - `C50`: Kat Biçim C (iki yatay Floor_ poligonu, dikey döşeme kenar poligonu yok, duvar zFloorBottom'dan başlar) + kapı deliği `+50 mm`, kapı nesnesi `0 mm`
 */
export type ProducerProfile = 'A10' | 'B50' | 'C50';

export type StoreyGeometryForm = 'A' | 'B' | 'C';

/**
 * GML dışa aktarma modu (`K70`, `OY-02`).
 */
export type GmlWriteMode = 'duzeltme' | 'normalize';

/**
 * TUREF TM 3° EPSG kodları (`K06`, `K07`, `V-014`).
 */
export const ALLOWED_TUREF_EPSG_CODES = [
  'EPSG:5253', // DOM 27
  'EPSG:5254', // DOM 30
  'EPSG:5255', // DOM 33
  'EPSG:5256', // DOM 36
  'EPSG:5257', // DOM 39
  'EPSG:5258', // DOM 42
  'EPSG:5259', // DOM 45
] as const;

export type AllowedTurefEpsg = (typeof ALLOWED_TUREF_EPSG_CODES)[number];

/**
 * 12 Nesne `gml:id` öneki (`docs/KARARLAR.md §A.2`, `K12`, `V-052`).
 */
export const OBJECT_ID_PREFIXES = [
  'MB_',
  'K_',
  'BB_',
  'BBK_',
  'OA_',
  'BBKIY_',
  'OAIY_',
  'BLKN_',
  'TRS_',
  'MBG_',
  'KAPI_',
  'PEN_',
] as const;

export type ObjectIdPrefix = (typeof OBJECT_ID_PREFIXES)[number];

/**
 * 14 Poligon `gml:id` öneki (`docs/KARARLAR.md §A.2`, `K12`, `V-053`).
 */
export const POLYGON_ID_PREFIXES = [
  'Floor_',
  'Wall_',
  'Roof_',
  'InteriorWall_',
  'Ceiling_',
  'Ground_',
  'OuterFloor_',
  'OuterCeiling_',
  'Closure_',
  'Lod1Poligon_',
  'Lod0FootPrint_',
  'Lod0RoofEdge_',
  'Door_',
  'Window_',
] as const;

export type PolygonIdPrefix = (typeof POLYGON_ID_PREFIXES)[number];

/**
 * 3 LinearRing `gml:id` öneki (`docs/KARARLAR.md §A.2`, `V-054`, `V-055`).
 */
export const RING_ID_PREFIXES = [
  'LinearRing_',
  'DoorLinearRing_',
  'WindowLinearRing_',
] as const;

export type RingIdPrefix = (typeof RING_ID_PREFIXES)[number];

/**
 * `gml:id` özniteliği kesinlikle bulunmaması gereken elemanlar (`K13`, `V-056`).
 */
export const FORBIDDEN_GML_ID_ELEMENTS = [
  'WallSurface',
  'RoofSurface',
  'GroundSurface',
  'FloorSurface',
  'InteriorWallSurface',
  'CeilingSurface',
  'OuterFloorSurface',
  'OuterCeilingSurface',
  'MultiSurface',
  'Solid',
  'CompositeSolid',
  'CompositeSurface',
  'MultiCurve',
  'LineString',
] as const;

/**
 * Yüzey (`*Surface`) elemanlarında izin verilen Türkçe `gml:name` değerleri (`K14`, `V-059`).
 */
export const ALLOWED_SURFACE_NAMES = [
  'Duvar',
  'Çatı',
  'Zemin',
  'Taban',
  'Tavan',
  'İçDuvar',
  'DışTaban',
  'DışTavan',
] as const;

export type GenericAttributeType = 'string' | 'int' | 'double' | 'date';

/**
 * `Ornek6` (`fixtures/ornek6.gml`) içinden doğrulanan 42 `gen:*Attribute` (`ad:tip`) listesi (`docs/KARARLAR.md §A.3`).
 */
export const ORNEK6_GENERIC_ATTRIBUTES = [
  'additionalNote:string',
  'architecturalPlanID:string',
  'architecturalProjectConfirmationDate:date',
  'blockName:string',
  'blockNumber:string',
  'buildingHeight:double',
  'buildingType:int',
  'calculatedArea:double',
  'constructionID:string',
  'doorUsage:int',
  'elevatorCount:int',
  'entrance:string',
  'geometrySuitability:int',
  'independentSectionCalculatedArea:double',
  'independentSectionCardinalDirection:int',
  'independentSectionCount:int',
  'independentSectionNumber:string',
  'independentSectionObjectReference:string',
  'independentSectionPlanGrossArea:double',
  'independentSectionPlanNetArea:double',
  'independentSectionUsage:int',
  'integrationState:int',
  'maksIdentityNumber:int',
  'maksIntegrationState:int',
  'maksNumaratajIdentityNumber:int',
  'parcelNumber:string',
  'partCount:int',
  'partUsage:int',
  'planArea:double',
  'propertyLot:string',
  'registeredFloorDefinition:string',
  'registeredInstallation:string',
  'registeredQuality:string',
  'roofProjectionArea:double',
  'storeyNumber:string',
  'storeyUsage:int',
  'takbisNeighbourhoodReference:int',
  'takbisPropertyIdentityNumber:int',
  'tenderRegistrationNumber:string',
  'totalIndependentSectionCount:int',
  'volume:double',
  'windowUsage:int',
] as const;

/**
 * Ortak Alan (`OA_`) ve İç Yapı (`BBKIY_`/`OAIY_`) için ek 3 `gen:*Attribute` (`docs/KARARLAR.md §A.3`).
 */
export const EXTRA_OA_AND_INSTALLATION_ATTRIBUTES = [
  'commonAreaUsage:int',
  'roomInstallationUsage:int',
  'storeyObjectReference:string',
] as const;

/**
 * Tüm uygulama genelinde yazılmasına ve okunmasına izin verilen 45 `gen:*Attribute` (`ad:tip`) beyaz listesi (`K99`, `V-060`).
 */
export const ALLOWED_GENERIC_ATTRIBUTES = [
  ...ORNEK6_GENERIC_ATTRIBUTES,
  ...EXTRA_OA_AND_INSTALLATION_ATTRIBUTES,
] as const;

export type AllowedGenericAttributeSpec = (typeof ALLOWED_GENERIC_ATTRIBUTES)[number];

const ALLOWED_GENERIC_ATTRIBUTE_SET: ReadonlySet<string> = new Set<string>(
  ALLOWED_GENERIC_ATTRIBUTES
);

/**
 * GML dosyasına yazılması kesinlikle yasak olan eleman ve öznitelik adları (`docs/KARARLAR.md §A.3`, `K67`, `K68`, `K88`, `V-216`).
 */
export const FORBIDDEN_GML_ATTRIBUTES_AND_TAGS = [
  'measuredHeight',
  'lod2Solid',
  'Appearance',
  'app:Appearance',
  'verticalDatum',
  'storeyHeight',
  'calculatedVolume',
  'grp:function',
  'malik',
  'adSoyadVeyaUnvan',
  'tcKimlikVeyaVergiNo',
  'hissePay',
  'hissePayda',
] as const;

/**
 * Bir `gen:*Attribute` (`ad`, `tip`) çiftinin beyaz listede olup olmadığını doğrular (`// K99`, `// V-060`, `// V-062`).
 */
// K99
// V-060
// V-062
export function isAllowedGenericAttribute(
  name: string,
  type: GenericAttributeType
): boolean {
  return ALLOWED_GENERIC_ATTRIBUTE_SET.has(`${name}:${type}`);
}

/**
 * Yazım öncesinde `gen:*Attribute` beyaz liste kilidini zorlar; izin verilmeyen öznitelikte hata fırlatır (`// K99`, `// V-060`).
 */
// K99
// V-060
export function assertAllowedGenericAttribute(
  name: string,
  type: GenericAttributeType
): void {
  if (!isAllowedGenericAttribute(name, type)) {
    throw new Error(
      `V-060 / K99 ihlali: "${name}:${type}" özelliği ALLOWED_GENERIC_ATTRIBUTES beyaz listesinde (45 öznitelik) yer almıyor.`
    );
  }
}

/**
 * Tasarım koordinatları için 1 mm (`0.001 m`) tam sayı ızgarası (`K76`).
 */
export interface Point2DMm {
  readonly eMm: number; // Y (Doğu / Easting, mm tamsayı)
  readonly nMm: number; // X (Kuzey / Northing, mm tamsayı)
}

export interface Point3DMm extends Point2DMm {
  readonly zMm: number; // Z (Ortometrik kot, mm tamsayı)
}

export interface Point2D {
  readonly e: number;
  readonly n: number;
}

export interface Point3D extends Point2D {
  readonly z: number;
}

// K76
export function metersToMm(meters: number): number {
  return Math.round(meters * 1000);
}

// K09
// K76
export function mmToMeters(mm: number): number {
  return mm / 1000;
}

/**
 * Üretimde (`GMLWriter`) koordinatı tam 3 ondalık basamaklı metne çevirir (`// K09`, `// K76`, `// V-030`).
 */
// K09
// K76
// V-030
export function formatCoordinateFixed3FromMm(mm: number): string {
  return (mm / 1000).toFixed(3);
}

/**
 * Okunan veya yazılan koordinat metninin ondalık basamak sayısını denetler (`// K09`, `// V-030`, `CLAUDE13 §2.2`).
 * - `mode === 'read'`: 1–12 ondalık hane kabul edilir; `≠ 3` hane (`< 3` veya `> 3`) yalnızca `BİLGİ ('B')` üretir, asla `HATA ('H')` değildir.
 * - `mode === 'write'`: Tam 3 ondalık hane zorunludur; `≠ 3` hane `HATA ('H')` üretir.
 */
// K09
// K70
// V-030
export function checkCoordinateDecimalPlaces(
  rawCoordToken: string,
  mode: 'read' | 'write'
): ValidationIssue | null {
  const trimmed = rawCoordToken.trim();
  const dotIndex = trimmed.indexOf('.');
  const decimals = dotIndex === -1 ? 0 : trimmed.length - dotIndex - 1;

  if (decimals === 3) {
    return null;
  }

  if (mode === 'write') {
    return {
      ruleId: 'V-030',
      severity: 'H',
      message: `Üretimde koordinat noktadan sonra tam 3 basamağa sahip olmalıdır (Ölçülen: ${decimals} basamak, Değer: "${trimmed}").`,
    };
  }

  return {
    ruleId: 'V-030',
    severity: 'B',
    message: `İçe alınan dosyada koordinat 3 ondalık basamaktan farklı (${decimals} basamak: "${trimmed}"). Düzeltme modunda korunur, Normalize kayıtta 3 haneye yuvarlanır.`,
  };
}

/**
 * `maksIdentityNumber` ve `maksNumaratajIdentityNumber` alanları 10 haneli olabildiği için
 * (`5415689768 > 2^31 - 1`), modelde `string | bigint | null` olarak tutulur (`// V-213`).
 */
export type MaksIdValue = string | bigint | null;

// V-213
export function parseMaksIdValue(raw: string | number | bigint | null | undefined): {
  readonly value: MaksIdValue;
  readonly exceedsInt32: boolean;
} {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { value: null, exceedsInt32: false };
  }
  const clean = String(raw).trim();
  const asBigInt = BigInt(clean);
  const INT32_MAX = 2147483647n;
  const INT32_MIN = -2147483648n;
  const exceedsInt32 = asBigInt > INT32_MAX || asBigInt < INT32_MIN;
  return {
    value: asBigInt,
    exceedsInt32,
  };
}

export interface BuildingAttributesModel {
  readonly constructionID: string;
  readonly takbisPropertyIdentityNumber: number;
  readonly maksIdentityNumber: MaksIdValue;
  readonly maksIntegrationState: 1003;
  readonly blockNumber: string;
  readonly parcelNumber: string;
  readonly tenderRegistrationNumber: '';
  readonly buildingType: 1001;
  readonly geometrySuitability: 1006;
  readonly architecturalPlanID: '';
  readonly additionalNote: string;
  readonly takbisNeighbourhoodReference: number;
  readonly totalIndependentSectionCount: number;
  readonly elevatorCount: number;
  readonly roofProjectionArea: number;
  readonly buildingHeight: number;
  readonly architecturalProjectConfirmationDate: string; // YYYY-MM-DD (Yoksa '1900-01-01' — K62, K86)
  readonly isDefaultConfirmationDate1900?: boolean; // K86 mavi rozet bayrağı
}

export interface IndependentSectionAttributesModel {
  readonly gmlId: string;
  readonly blockName: string;
  readonly entrance: string;
  readonly independentSectionNumber: string;
  readonly propertyLot: string;
  readonly registeredQuality: string;
  readonly registeredInstallation: string;
  readonly registeredFloorDefinition: string;
  readonly maksIdentityNumber: MaksIdValue;
  readonly maksIntegrationState: 1003;
  readonly maksNumaratajIdentityNumber: MaksIdValue;
  readonly integrationState: 1004;
  readonly takbisPropertyIdentityNumber: -1;
  readonly geometrySuitability: 1001 | 1002;
  readonly additionalNote: string;
  readonly independentSectionUsage: number;
  readonly independentSectionPlanNetArea: number;
  readonly independentSectionPlanGrossArea: number;
  readonly independentSectionCalculatedArea: number;
  readonly partCount: number;
  readonly independentSectionCardinalDirection: readonly number[];
}
