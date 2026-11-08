// M4 — Tasarım modeli (şartname §4.1–§4.2). Tek doğruluk kaynağı; JSON olarak kaydedilir.
// Birim: milimetre, tamsayı. x = Doğu (easting), y = Kuzey (northing), z = mutlak ortometrik kot.
// Yerel köken (originE, originN) tam metredir; E = originE + x/1000 (yuvarlama hatası yok, §4.1).

export type Mm = number;
export interface Pt2 {
  readonly x: Mm;
  readonly y: Mm;
}
/** Kapanış noktası tekrar edilmez; dış halka CCW (§4.2). */
export type Ring2 = readonly Pt2[];
export interface Poly2 {
  readonly outer: Ring2;
  readonly holes: readonly Ring2[];
}

export interface Georef {
  readonly epsg: 5253 | 5254 | 5255 | 5256 | 5257 | 5258 | 5259;
  readonly originE: number; // tam metre
  readonly originN: number; // tam metre
  readonly zeroElevationOrthometric: Mm; // ±0.00 kotunun ortometrik karşılığı
}

export interface Parcel {
  readonly takbisPropertyIdentityNumber: number;
  readonly blockNumber: string;
  readonly parcelNumber: string;
  readonly takbisNeighbourhoodReference: number;
}

export interface Storey {
  readonly id: string;
  readonly storeyNumber: string; // "Z" | "-1" | "1" | ...
  readonly zBottom: Mm; // döşeme altı (mutlak)
  readonly height: Mm; // döşeme altından üst kat döşeme altına
  readonly slabThickness: Mm; // varsayılan 200
  readonly outline: readonly Poly2[]; // kat dış sınırı (birden fazla kütle olabilir)
}

/** Liste beyandaki mülkiyet birimi (bağımsız bölüm). Malik bilgisi burada değil, proje dosyasında ayrı tutulur. */
export interface IndependentSection {
  readonly id: string;
  readonly number: string;
  readonly blockName: string; // yoksa "-1"
  readonly entrance: string; // yoksa ""
  readonly registeredQuality: string;
  readonly registeredInstallation: string;
  readonly registeredFloorDefinition: string;
  readonly propertyLot: string; // "pay/payda"
  readonly planNetArea: number; // -1: yok
  readonly planGrossArea: number; // -1: yok
}

/** BB parçası (GenericCityObject). Bir bağımsız bölüm birden fazla katta parçaya sahip olabilir (dubleks). */
export interface SectionPart {
  readonly id: string;
  readonly sectionId: string;
  readonly storeyId: string;
  readonly usage: 1001 | 1002 | 1003 | 1004 | 1005 | 1006;
  readonly outline: Poly2; // BB dış sınırı
  /** Asma kat vb.: BB tabanı katın döşeme altından farklı kottaysa mutlak kot (mm). Şartname §5.2 ÖNERİ. */
  readonly zFloorOverride?: Mm;
}

/** Kısım (BBK) veya ortak alan (OA) = bldg:Room. Poligon net (iç yüz) alanıdır. */
export interface Part {
  readonly id: string;
  readonly kind: 'BBK' | 'OA';
  readonly storeyId: string;
  readonly sectionPartIds: readonly string[]; // BBK: ≥1; OA: []
  readonly usage: number; // BBK partUsage / OA commonAreaUsage
  readonly polygon: Poly2;
  readonly planArea: number; // -1: yok
  /** Asma kat vb.: oda tabanı katın olağan oda tabanından farklı kottaysa mutlak kot (mm). Şartname §5.2 ÖNERİ. */
  readonly zFloorOverride?: Mm;
  /** Uzak kısım: BB'sine fiziksel bağlı değil (uzak depo/otopark; şartname §4.2 remote, H11a). §5.3 içerme denetimi uygulanmaz. */
  readonly remote?: boolean;
}

/**
 * Açıklık (kapı/pencere), şartname §4.2 + §5.4. Bir yüz üzerinde iki nokta (a, b) ile çizilir; yüz bir kısım kenarı
 * veya kat dış sınırı olabilir. Karşı yüz (duvarın öbür tarafı) üretimde aranır; bir açıklık n temsile dönüşür (T1–T4).
 */
export interface Opening {
  readonly id: string;
  readonly kind: 'door' | 'window';
  readonly usage: number; // doorUsage / windowUsage
  readonly storeyId: string;
  readonly anchor: { readonly a: Pt2; readonly b: Pt2 };
  readonly sill: Mm; // kısım tabanından (oda Floor_) yükseklik; kapıda 10 (K45a)
  readonly height: Mm;
  readonly spansStoreys?: readonly string[]; // sahanlık penceresi (M5 kapsamı dışında)
}

export interface Pt3 {
  readonly x: Mm;
  readonly y: Mm;
  readonly z: Mm;
}

/** M6: Mimari Bina öznitelikleri (§3.3, §4.2 Building). Kat sayıları, alanlar ve yükseklik dışındakiler kullanıcı girdisidir. */
export interface BuildingInfo {
  readonly maksIdentityNumber: number | null;
  readonly maksIntegrationState: number; // varsayılan 1003
  readonly buildingType: number; // varsayılan 1001
  readonly geometrySuitability: readonly number[]; // varsayılan [1006]
  readonly tenderRegistrationNumber: string;
  readonly architecturalPlanID: string;
  readonly additionalNote: string; // varsayılan "-"
  readonly elevatorCount: number;
  /** Projeden bina yüksekliği (m, 2 hane). Yoksa çatı tepesi − TIC üst kotu. */
  readonly buildingHeight: number | null;
  readonly architecturalProjectConfirmationDate: string; // YYYY-MM-DD
}

/** M6: Bağımsız bölüm (BB parçası) ek öznitelikleri (§3.6). */
export interface SectionInfo {
  readonly maksIdentityNumber: number | null;
  readonly maksNumaratajIdentityNumber: number | null;
  readonly maksIntegrationState: number; // varsayılan 1003
  readonly integrationState: number; // varsayılan 1004
  readonly geometrySuitability: number; // varsayılan 1001
  readonly additionalNote: string;
}

/** M6: Balkon / Teras (§4.2 Balcony, §5.8). */
export interface Balcony {
  readonly id: string;
  readonly kind: 'Balkon' | 'Teras';
  readonly storeyId: string;
  readonly sectionPartId: string | null; // teras: null → "-1"
  readonly outline: Ring2; // dış sınır, CCW
  /** Bina ile ortak kenarlar (korkuluk yok). Kenar, outline'ın ardışık iki köşesidir. */
  readonly attachedEdges: readonly (readonly [Pt2, Pt2])[];
  readonly parapetHeight: Mm; // varsayılan 1100
  readonly parapetThickness: Mm; // varsayılan 100, ≥ 50
  readonly planArea: number; // -1: yok
}

/** M6: Çatı (§4.2 Roof, §5.9). Düz/beşik/kırma parametrik; karmaşık planlarda elle (düzlemsel 3B yüzler). */
export interface Roof {
  readonly mode: 'flat' | 'gable' | 'hip' | 'manual';
  readonly eaveOverhang: Mm; // saçak
  readonly thickness: Mm; // saçak alın yüksekliği
  readonly pitchDeg: number; // beşik/kırma eğimi
  /** Elle çatı: yüzler (dış halka + delikler), dışa bakan normal, mm. */
  readonly facets?: readonly { readonly outer: readonly Pt3[]; readonly holes: readonly (readonly Pt3[])[] }[];
}

export interface DesignBuilding {
  readonly id: string;
  readonly letter: string;
  readonly storeys: readonly Storey[]; // alttan üste
  readonly sections: readonly IndependentSection[];
  readonly sectionParts: readonly SectionPart[];
  readonly parts: readonly Part[];
  /** M5: açıklıklar. M4 proje dosyalarında yoktur; okuyucu boş dizi varsayar. */
  readonly openings?: readonly Opening[];
  /** M6 alanları (eski proje dosyalarında yoktur; varsayılanlar kullanılır). */
  readonly info?: BuildingInfo;
  /** Bölüm kimliği → ek öznitelikler. */
  readonly sectionInfo?: Readonly<Record<string, SectionInfo>>;
  /** BB parçası kimliği → bakı (cardinalDirection) kodları. */
  readonly cardinalDirections?: Readonly<Record<string, readonly number[]>>;
  readonly balconies?: readonly Balcony[];
  readonly roof?: Roof;
  /** Aplikasyon (TIC) noktaları, kapalı değil; yazarken kapatılır. Yoksa en alt kat sınırı @ döşeme altı. */
  readonly tic?: readonly Pt3[];
}

export const DEFAULT_BUILDING_INFO: BuildingInfo = {
  maksIdentityNumber: null,
  maksIntegrationState: 1003,
  buildingType: 1001,
  geometrySuitability: [1006],
  tenderRegistrationNumber: '',
  architecturalPlanID: '',
  additionalNote: '-',
  elevatorCount: 0,
  buildingHeight: null,
  architecturalProjectConfirmationDate: '',
};
export const DEFAULT_SECTION_INFO: SectionInfo = { maksIdentityNumber: null, maksNumaratajIdentityNumber: null, maksIntegrationState: 1003, integrationState: 1004, geometrySuitability: 1001, additionalNote: '-' };
export const DEFAULT_ROOF: Roof = { mode: 'flat', eaveOverhang: 0, thickness: 200, pitchDeg: 30 };

export interface DesignProject {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly name: string;
  /** Deterministik kimlik sayacı: yeni nesne kimliği = uuidv5(`${id}:${tür}:${idSeq}`) (Mutlak Kural 6). */
  readonly idSeq: number;
  readonly georef: Georef;
  readonly parcel: Parcel;
  readonly buildings: readonly DesignBuilding[];
}
