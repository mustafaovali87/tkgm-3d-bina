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

export interface DesignBuilding {
  readonly id: string;
  readonly letter: string;
  readonly storeys: readonly Storey[]; // alttan üste
  readonly sections: readonly IndependentSection[];
  readonly sectionParts: readonly SectionPart[];
  readonly parts: readonly Part[];
  /** M5: açıklıklar. M4 proje dosyalarında yoktur; okuyucu boş dizi varsayar. */
  readonly openings?: readonly Opening[];
}

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
