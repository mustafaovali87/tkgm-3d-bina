// M5 — Geometri motoru çıktısı (şartname §5). Koordinatlar: x, y yerel mm (tasarım kökenine göre), z mutlak mm; tamsayı.
// Bu yapı GML yazıcısına (M6) ve 3B önizlemeye girdi olur. Kimlikler deterministiktir (§5.1 madde 1).

export interface Pt3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export type BrepPolygonKind = 'Floor_' | 'Ceiling_' | 'Wall_' | 'InteriorWall_' | 'Door_' | 'Window_';
export type BrepSurfaceTag = 'FloorSurface' | 'CeilingSurface' | 'WallSurface' | 'InteriorWallSurface';

/** Kapanış noktası tekrar edilmez. Dış halka, hacmin dışından bakınca CCW (normal dışa); delikler ters yönlü (§5.1 madde 4). */
export interface BrepPolygon {
  readonly id: string;
  readonly kind: BrepPolygonKind;
  readonly outer: readonly Pt3[];
  readonly holes: readonly (readonly Pt3[])[];
}

/** Açıklık temsili. T1 = LoD2 dış yüz (bina WallSurface'ine bağlanır, M6), T4 = kısım yüzü. */
export interface BrepOpening {
  readonly id: string;
  readonly prefix: 'KAPI_' | 'PEN_';
  readonly usage: number;
  readonly designOpeningId: string;
  readonly representation: 'T1' | 'T4';
  /** Halka, ilgili duvar deliğinin aynı sıralı kopyasıdır (K48). */
  readonly polygon: BrepPolygon;
}

export interface BrepSurface {
  readonly id: string;
  readonly tag: BrepSurfaceTag;
  readonly polygons: readonly BrepPolygon[];
  readonly openings: readonly BrepOpening[];
}

export interface BrepObject {
  readonly id: string;
  readonly prefix: 'K_' | 'BB_' | 'BBK_' | 'OA_';
  /** Kaynak tasarım nesnesi (Storey / SectionPart / Part). */
  readonly designId: string;
  readonly storeyId: string;
  /** K_ ve BB_ için tüm poligonlar tek MultiSurface'tedir; yine de yüzey türüne göre gruplanır. */
  readonly surfaces: readonly BrepSurface[];
  /** calculatedArea, volume (kısım) / independentSectionCalculatedArea (BB). §5.12, 2 hane. */
  readonly attributes: Readonly<Record<string, number>>;
}

export interface StoreyLevels {
  readonly storeyId: string;
  readonly zFloorBottom: number;
  readonly zFloorTop: number;
  readonly zCeiling: number;
}

export interface BrepIssue {
  readonly code: string;
  readonly severity: 'H' | 'U' | 'B';
  readonly elementId: string;
  readonly message: string;
}

export interface BrepBuilding {
  readonly designBuildingId: string;
  readonly levels: readonly StoreyLevels[];
  readonly storeys: readonly BrepObject[];
  readonly sectionParts: readonly BrepObject[];
  readonly rooms: readonly BrepObject[];
  /** T1 temsilleri: LoD2 dış duvar açıklıkları. LoD2 duvarları M6'da üretilecek; burada konum ve sayı hazır. */
  readonly lod2Openings: readonly BrepOpening[];
  readonly issues: readonly BrepIssue[];
}

export interface BrepOptions {
  /** Kat geometrisi biçimi (§4.2 ProjectSettings): 'A' = tek alt Floor_ + tabandan tavana duvar (Ornek6), 'B' = döşeme kutusu + duvar. */
  readonly storeyStyle: 'A' | 'B';
  /** true: döşeme kenar yüzleri ayrı Floor_ olarak üretilir (§5.6). false: dış duvar döşeme altından başlar (Ornek6 ölçümü). */
  readonly emitSlabEdges: boolean;
}

export const DEFAULT_BREP_OPTIONS: BrepOptions = { storeyStyle: 'B', emitSlabEdges: true };
/** Ornek6'da ölçülen biçim (KONTROL ve altın test için). */
export const ORNEK6_BREP_OPTIONS: BrepOptions = { storeyStyle: 'A', emitSlabEdges: false };
