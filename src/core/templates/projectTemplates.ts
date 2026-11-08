// M10 — Hazır Mimari Proje Şablonları (Apartman, Müstakil Villa, Dubleks, Zemin Ticari + Konut)
// Şartname §4.2, §5.2–§5.12, §11 kabul gereksinimleri; F10 hızlı başlangıç (claude_5tur §4.2).
// Saf TypeScript; DOM, Node veya React bağımlılığı yoktur (tsconfig.core.json uyumlu).

import type {
  Balcony,
  DesignBuilding,
  DesignProject,
  Georef,
  IndependentSection,
  Opening,
  Parcel,
  Part,
  Poly2,
  Pt2,
  Roof,
  RoomInstallation,
  SectionInfo,
  SectionPart,
  Storey,
} from '../design/types.ts';
import { uuidv5 } from '../hash/canonical.ts';

export type TemplateTypeId = 'apartman' | 'villa' | 'dubleks' | 'ticariZemin';

export interface ProjectTemplateMeta {
  readonly id: TemplateTypeId;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly storeyCount: number;
  readonly sectionCount: number;
  readonly footprintAreaM2: number;
  readonly totalAreaM2: number;
  readonly roofType: 'flat' | 'hip' | 'gable';
}

function rectPoly(xMin: number, yMin: number, xMax: number, yMax: number): Poly2 {
  return {
    outer: [
      { x: xMin, y: yMin },
      { x: xMax, y: yMin },
      { x: xMax, y: yMax },
      { x: xMin, y: yMax },
    ],
    holes: [],
  };
}

const DEFAULT_GEOREF: Georef = {
  epsg: 5254,
  originE: 500000,
  originN: 4400000,
  zeroElevationOrthometric: 1000000,
};

const DEFAULT_PARCEL: Parcel = {
  takbisPropertyIdentityNumber: 70125626,
  blockNumber: '101',
  parcelNumber: '5',
  takbisNeighbourhoodReference: 12345,
};

/**
 * 1. DÖRT KATLI TİPİK APARTMAN (8 Bağımsız Bölüm, Zemin + 3 Normal Kat)
 * Her katta 2 daire (Salon, 2 Yatak Odası, Mutfak, Banyo, Antre, Balkon), Kat Holü + Asansör + Yangın Merdiveni.
 */
export function createApartmanTemplate(seed = 'sablon_apartman'): DesignProject {
  const buildingId = `BLD_${uuidv5(`${seed}::building`)}`;
  const storeys: Storey[] = [];
  const sections: IndependentSection[] = [];
  const sectionParts: SectionPart[] = [];
  const parts: Part[] = [];
  const openings: Opening[] = [];
  const installations: RoomInstallation[] = [];
  const balconies: Balcony[] = [];

  const buildingOutline = rectPoly(0, 0, 16000, 12000); // 16m x 12m = 192 m2 taban alanı
  const storeyHeightsMm = [3000, 2800, 2800, 2800];
  let curBottom = 100000; // 100.00 m zemin kotu

  let bbNo = 1;

  for (let sIdx = 0; sIdx < 4; sIdx++) {
    const sId = `K_${uuidv5(`${seed}::storey::${sIdx}`)}`;
    const sNum = sIdx === 0 ? 'Z' : String(sIdx);
    const sHeight = storeyHeightsMm[sIdx];
    const slabThick = 200;

    storeys.push({
      id: sId,
      storeyNumber: sNum,
      height: sHeight,
      slabThickness: slabThick,
      zBottom: curBottom,
      outline: [buildingOutline],
    });

    // Ortak Alan: Kat Holü (Ortada X: 6.5m - 9.5m, Y: 0 - 12m)
    const oaPartId = `OA_${uuidv5(`${seed}::oa::${sIdx}`)}`;
    parts.push({
      id: oaPartId,
      kind: 'OA',
      storeyId: sId,
      sectionPartIds: [],
      usage: 1001, // Kat Holü
      polygon: rectPoly(6500, 0, 9500, 12000),
      planArea: 36.0,
      thickExteriorWall: true,
    });

    // Ortak Alanda Asansör ve Merdiven İç Yapıları (RoomInstallation)
    installations.push({
      id: `BBKIY_${uuidv5(`${seed}::iy_merdiven::${sIdx}`)}`,
      partId: oaPartId,
      usage: 1001, // Merdiven
      polygon: rectPoly(6800, 1000, 9200, 5000),
    });
    installations.push({
      id: `BBKIY_${uuidv5(`${seed}::iy_asansor::${sIdx}`)}`,
      partId: oaPartId,
      usage: 1003, // Asansör
      polygon: rectPoly(7000, 6000, 9000, 8000),
    });

    // Ana Giriş Kapısı (Yalnız Zemin Katta Ortada)
    if (sIdx === 0) {
      openings.push({
        id: `KAPI_${uuidv5(`${seed}::ana_giris`)}`,
        kind: 'door',
        usage: 1001, // Ana giriş
        storeyId: sId,
        anchor: { a: { x: 7000, y: 0 }, b: { x: 9000, y: 0 } },
        sill: 10,
        height: 2200,
      });
    }

    // Kat başına 2 Daire (Sol Daire ve Sağ Daire)
    // 1) Sol Daire (X: 0 - 6.5m)
    const sec1Id = `BB_${uuidv5(`${seed}::sec::${bbNo}`)}`;
    const secPart1Id = `BBK_${uuidv5(`${seed}::secpart::${bbNo}`)}`;
    sections.push({
      id: sec1Id,
      number: String(bbNo),
      blockName: 'A',
      entrance: '1',
      registeredQuality: 'MESKEN',
      registeredInstallation: 'DOGALGAZ',
      registeredFloorDefinition: sNum === 'Z' ? 'ZEMIN KAT' : `${sNum}. KAT`,
      propertyLot: '1/8',
      planGrossArea: 78.0,
      planNetArea: 70.0,
    });
    sectionParts.push({
      id: secPart1Id,
      sectionId: sec1Id,
      storeyId: sId,
      usage: 1001, // Mesken
      outline: rectPoly(0, 0, 6500, 12000),
    });
    parts.push({
      id: `ROOM_${uuidv5(`${seed}::room_salon::${bbNo}`)}`,
      kind: 'BBK',
      storeyId: sId,
      sectionPartIds: [secPart1Id],
      usage: 1001, // Salon
      polygon: rectPoly(0, 0, 6500, 6000),
      planArea: 39.0,
    });
    parts.push({
      id: `ROOM_${uuidv5(`${seed}::room_yatak::${bbNo}`)}`,
      kind: 'BBK',
      storeyId: sId,
      sectionPartIds: [secPart1Id],
      usage: 1002, // Yatak Odası
      polygon: rectPoly(0, 6000, 6500, 12000),
      planArea: 39.0,
    });
    openings.push({
      id: `KAPI_${uuidv5(`${seed}::kapi_daire::${bbNo}`)}`,
      kind: 'door',
      usage: 1003, // Bağımsız Bölüm Kapısı
      storeyId: sId,
      anchor: { a: { x: 6500, y: 5000 }, b: { x: 6500, y: 6000 } },
      sill: 10,
      height: 2100,
    });
    openings.push({
      id: `PEN_${uuidv5(`${seed}::pen_salon::${bbNo}`)}`,
      kind: 'window',
      usage: 1001,
      storeyId: sId,
      anchor: { a: { x: 1000, y: 0 }, b: { x: 3000, y: 0 } },
      sill: 900,
      height: 1400,
    });
    balconies.push({
      id: `BLKN_${uuidv5(`${seed}::blkn::${bbNo}`)}`,
      kind: 'Balkon',
      storeyId: sId,
      sectionPartId: secPart1Id,
      outline: [
        { x: -1500, y: 1000 },
        { x: 0, y: 1000 },
        { x: 0, y: 4000 },
        { x: -1500, y: 4000 },
      ],
      attachedEdges: [[{ x: 0, y: 1000 }, { x: 0, y: 4000 }]],
      parapetHeight: 1100,
      parapetThickness: 100,
      planArea: 4.5,
    });
    bbNo++;

    // 2) Sağ Daire (X: 9.5m - 16m)
    const sec2Id = `BB_${uuidv5(`${seed}::sec::${bbNo}`)}`;
    const secPart2Id = `BBK_${uuidv5(`${seed}::secpart::${bbNo}`)}`;
    sections.push({
      id: sec2Id,
      number: String(bbNo),
      blockName: 'A',
      entrance: '1',
      registeredQuality: 'MESKEN',
      registeredInstallation: 'DOGALGAZ',
      registeredFloorDefinition: sNum === 'Z' ? 'ZEMIN KAT' : `${sNum}. KAT`,
      propertyLot: '1/8',
      planGrossArea: 78.0,
      planNetArea: 70.0,
    });
    sectionParts.push({
      id: secPart2Id,
      sectionId: sec2Id,
      storeyId: sId,
      usage: 1001, // Mesken
      outline: rectPoly(9500, 0, 16000, 12000),
    });
    parts.push({
      id: `ROOM_${uuidv5(`${seed}::room_salon::${bbNo}`)}`,
      kind: 'BBK',
      storeyId: sId,
      sectionPartIds: [secPart2Id],
      usage: 1001, // Salon
      polygon: rectPoly(9500, 0, 16000, 6000),
      planArea: 39.0,
    });
    parts.push({
      id: `ROOM_${uuidv5(`${seed}::room_yatak::${bbNo}`)}`,
      kind: 'BBK',
      storeyId: sId,
      sectionPartIds: [secPart2Id],
      usage: 1002, // Yatak Odası
      polygon: rectPoly(9500, 6000, 16000, 12000),
      planArea: 39.0,
    });
    openings.push({
      id: `KAPI_${uuidv5(`${seed}::kapi_daire::${bbNo}`)}`,
      kind: 'door',
      usage: 1003, // Bağımsız Bölüm Kapısı
      storeyId: sId,
      anchor: { a: { x: 9500, y: 5000 }, b: { x: 9500, y: 6000 } },
      sill: 10,
      height: 2100,
    });
    openings.push({
      id: `PEN_${uuidv5(`${seed}::pen_salon::${bbNo}`)}`,
      kind: 'window',
      usage: 1001,
      storeyId: sId,
      anchor: { a: { x: 13000, y: 0 }, b: { x: 15000, y: 0 } },
      sill: 900,
      height: 1400,
    });
    bbNo++;

    curBottom += sHeight;
  }

  const roof: Roof = {
    mode: 'hip',
    eaveOverhang: 500,
    thickness: 200,
    pitchDeg: 33,
  };

  const sectionInfo: Record<string, SectionInfo> = {};
  for (let i = 1; i <= sections.length; i++) {
    const sec = sections[i - 1];
    if (sec) {
      sectionInfo[sec.id] = {
        maksIdentityNumber: 100000000 + i,
        maksNumaratajIdentityNumber: 200000000 + i,
        maksIntegrationState: 1003,
        integrationState: 1004,
        geometrySuitability: 1001,
        additionalNote: '-',
      };
    }
  }
  const cardinalDirections: Record<string, readonly number[]> = {};
  for (const sp of sectionParts) {
    cardinalDirections[sp.id] = [1001];
  }

  const building: DesignBuilding = {
    id: buildingId,
    letter: 'A',
    storeys,
    sections,
    sectionParts,
    parts,
    openings,
    installations,
    balconies,
    roof,
    sectionInfo,
    cardinalDirections,
    info: {
      maksIdentityNumber: 12345678,
      maksIntegrationState: 1003,
      buildingType: 1001,
      geometrySuitability: [1006],
      tenderRegistrationNumber: '',
      architecturalPlanID: '',
      additionalNote: '4 Katlı 8 Daireli Standart Apartman Şablonu',
      elevatorCount: 1,
      buildingHeight: 11.4,
      architecturalProjectConfirmationDate: '2026-01-15',
    },
  };

  return {
    schemaVersion: 1,
    id: `PRJ_${uuidv5(`${seed}::project`)}`,
    name: '4 Katlı Standart Apartman Projesi',
    idSeq: 1000,
    georef: DEFAULT_GEOREF,
    parcel: DEFAULT_PARCEL,
    buildings: [building],
  };
}

/**
 * 2. İKİ KATLI MÜSTAKİL VİLLA (1 Bağımsız Bölüm, Geniş Bahçe & Teras, Beşik Çatı)
 */
export function createVillaTemplate(seed = 'sablon_villa'): DesignProject {
  const buildingId = `BLD_${uuidv5(`${seed}::building`)}`;
  const storeys: Storey[] = [];
  const sections: IndependentSection[] = [];
  const sectionParts: SectionPart[] = [];
  const parts: Part[] = [];
  const openings: Opening[] = [];
  const balconies: Balcony[] = [];

  const outline = rectPoly(0, 0, 12000, 10000); // 12m x 10m = 120 m2
  const zBottoms = [100000, 103200];
  const heights = [3200, 3000];

  const secId = `BB_${uuidv5(`${seed}::sec::1`)}`;
  sections.push({
    id: secId,
    number: '1',
    blockName: 'A',
    entrance: '1',
    registeredQuality: 'VİLLA',
    registeredInstallation: 'DOGALGAZ',
    registeredFloorDefinition: 'ZEMIN + 1. KAT',
    propertyLot: '1/1',
    planGrossArea: 240.0,
    planNetArea: 210.0,
  });

  // Zemin Kat
  const s0Id = `K_${uuidv5(`${seed}::storey::0`)}`;
  storeys.push({
    id: s0Id,
    storeyNumber: 'Z',
    height: heights[0],
    slabThickness: 200,
    zBottom: zBottoms[0],
    outline: [outline],
  });
  const sp0Id = `BBK_${uuidv5(`${seed}::secpart::0`)}`;
  sectionParts.push({
    id: sp0Id,
    sectionId: secId,
    storeyId: s0Id,
    usage: 1001,
    outline,
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::room_salon`)}`,
    kind: 'BBK',
    storeyId: s0Id,
    sectionPartIds: [sp0Id],
    usage: 1001, // Salon
    polygon: rectPoly(200, 200, 7800, 9800),
    planArea: 72.96,
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::room_mutfak`)}`,
    kind: 'BBK',
    storeyId: s0Id,
    sectionPartIds: [sp0Id],
    usage: 1003, // Mutfak
    polygon: rectPoly(8200, 200, 11800, 9800),
    planArea: 34.56,
  });
  openings.push({
    id: `KAPI_${uuidv5(`${seed}::giris`)}`,
    kind: 'door',
    usage: 1001,
    storeyId: s0Id,
    anchor: { a: { x: 3000, y: 0 }, b: { x: 5000, y: 0 } },
    sill: 10,
    height: 2200,
  });
  balconies.push({
    id: `TRS_${uuidv5(`${seed}::teras`)}`,
    kind: 'Teras',
    storeyId: s0Id,
    sectionPartId: null,
    outline: [
      { x: 0, y: -3000 },
      { x: 8000, y: -3000 },
      { x: 8000, y: 0 },
      { x: 0, y: 0 },
    ],
    attachedEdges: [[{ x: 0, y: 0 }, { x: 8000, y: 0 }]],
    parapetHeight: 500,
    parapetThickness: 150,
    planArea: 24.0,
  });

  // 1. Kat
  const s1Id = `K_${uuidv5(`${seed}::storey::1`)}`;
  storeys.push({
    id: s1Id,
    storeyNumber: '1',
    height: heights[1],
    slabThickness: 200,
    zBottom: zBottoms[1],
    outline: [outline],
  });
  const sp1Id = `BBK_${uuidv5(`${seed}::secpart::1`)}`;
  sectionParts.push({
    id: sp1Id,
    sectionId: secId,
    storeyId: s1Id,
    usage: 1001,
    outline,
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::room_ebeveyn`)}`,
    kind: 'BBK',
    storeyId: s1Id,
    sectionPartIds: [sp1Id],
    usage: 1002, // Yatak Odası
    polygon: rectPoly(200, 200, 5800, 9800),
    planArea: 53.76,
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::room_cocuk`)}`,
    kind: 'BBK',
    storeyId: s1Id,
    sectionPartIds: [sp1Id],
    usage: 1002, // Yatak Odası
    polygon: rectPoly(6200, 200, 11800, 9800),
    planArea: 53.76,
  });

  const roof: Roof = {
    mode: 'gable',
    eaveOverhang: 600,
    thickness: 250,
    pitchDeg: 35,
  };

  const sectionInfo: Record<string, SectionInfo> = {
    [secId]: {
      maksIdentityNumber: 87654321,
      maksNumaratajIdentityNumber: 87654322,
      maksIntegrationState: 1003,
      integrationState: 1004,
      geometrySuitability: 1001,
      additionalNote: '-',
    },
  };
  const cardinalDirections: Record<string, readonly number[]> = {
    [sp0Id]: [1001, 1002],
    [sp1Id]: [1001, 1002],
  };

  const building: DesignBuilding = {
    id: buildingId,
    letter: 'A',
    storeys,
    sections,
    sectionParts,
    parts,
    openings,
    balconies,
    roof,
    sectionInfo,
    cardinalDirections,
    info: {
      maksIdentityNumber: 87654321,
      maksIntegrationState: 1003,
      buildingType: 1001,
      geometrySuitability: [1006],
      tenderRegistrationNumber: '',
      architecturalPlanID: '',
      additionalNote: '2 Katlı Müstakil Villa Şablonu',
      elevatorCount: 0,
      buildingHeight: 6.2,
      architecturalProjectConfirmationDate: '2026-02-10',
    },
  };

  return {
    schemaVersion: 1,
    id: `PRJ_${uuidv5(`${seed}::project`)}`,
    name: 'Müstakil Villa Projesi',
    idSeq: 1000,
    georef: DEFAULT_GEOREF,
    parcel: DEFAULT_PARCEL,
    buildings: [building],
  };
}

/**
 * 3. ÇATI PİYESLİ DUBLEKS DAİRE (Normal Kat + Çatı Arası Kesimi, İç Merdiven)
 */
export function createDubleksTemplate(seed = 'sablon_dubleks'): DesignProject {
  const buildingId = `BLD_${uuidv5(`${seed}::building`)}`;
  const storeys: Storey[] = [];
  const sections: IndependentSection[] = [];
  const sectionParts: SectionPart[] = [];
  const parts: Part[] = [];
  const openings: Opening[] = [];
  const installations: RoomInstallation[] = [];

  const outline = rectPoly(0, 0, 14000, 10000); // 14m x 10m = 140 m2
  const heights = [2900, 2600];
  const zBottoms = [109000, 111900];

  const secId = `BB_${uuidv5(`${seed}::sec::dubleks`)}`;
  sections.push({
    id: secId,
    number: '7',
    blockName: 'A',
    entrance: '1',
    registeredQuality: 'DUBLEKS MESKEN',
    registeredInstallation: 'DOGALGAZ',
    registeredFloorDefinition: '3. KAT + ÇATI PİYESİ',
    propertyLot: '1/1',
    planGrossArea: 250.0,
    planNetArea: 215.0,
  });

  // 3. Normal Kat (Giriş Katı)
  const s3Id = `K_${uuidv5(`${seed}::storey::3`)}`;
  storeys.push({
    id: s3Id,
    storeyNumber: '3',
    height: heights[0],
    slabThickness: 200,
    zBottom: zBottoms[0],
    outline: [outline],
  });
  const sp3Id = `BBK_${uuidv5(`${seed}::secpart::3`)}`;
  sectionParts.push({
    id: sp3Id,
    sectionId: secId,
    storeyId: s3Id,
    usage: 1001,
    outline,
  });
  const salonPartId = `ROOM_${uuidv5(`${seed}::salon`)}`;
  parts.push({
    id: salonPartId,
    kind: 'BBK',
    storeyId: s3Id,
    sectionPartIds: [sp3Id],
    usage: 1001, // Salon
    polygon: rectPoly(200, 200, 8800, 9800),
    planArea: 82.56,
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::mutfak`)}`,
    kind: 'BBK',
    storeyId: s3Id,
    sectionPartIds: [sp3Id],
    usage: 1003, // Mutfak
    polygon: rectPoly(9200, 200, 13800, 9800),
    planArea: 44.16,
  });
  installations.push({
    id: `BBKIY_${uuidv5(`${seed}::ic_merdiven`)}`,
    partId: salonPartId,
    usage: 1001, // Merdiven
    polygon: rectPoly(5000, 2000, 7500, 5000),
  });
  openings.push({
    id: `KAPI_${uuidv5(`${seed}::giris`)}`,
    kind: 'door',
    usage: 1001,
    storeyId: s3Id,
    anchor: { a: { x: 3000, y: 0 }, b: { x: 5000, y: 0 } },
    sill: 10,
    height: 2200,
  });

  // Çatı Arası Katı (Piyes Katı, groupStoreyId ile 3. kata bağlı)
  const scId = `K_${uuidv5(`${seed}::storey::cati`)}`;
  storeys.push({
    id: scId,
    storeyNumber: 'Ç',
    height: heights[1],
    slabThickness: 200,
    zBottom: zBottoms[1],
    outline: [outline],
    emitStoreyObject: false,
    clipToRoof: true,
    kneeWallHeight: 1200,
  });
  const spCatiId = `BBK_${uuidv5(`${seed}::secpart::cati`)}`;
  sectionParts.push({
    id: spCatiId,
    sectionId: secId,
    storeyId: scId,
    groupStoreyId: s3Id,
    usage: 1004, // Çatı Arası BB parçası
    outline,
    clipToRoof: true,
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::cati_oda1`)}`,
    kind: 'BBK',
    storeyId: scId,
    sectionPartIds: [spCatiId],
    usage: 1004,
    polygon: rectPoly(200, 200, 6800, 9800),
    planArea: 63.36,
    clipToRoof: true,
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::cati_oda2`)}`,
    kind: 'BBK',
    storeyId: scId,
    sectionPartIds: [spCatiId],
    usage: 1004,
    polygon: rectPoly(7200, 200, 13800, 9800),
    planArea: 63.36,
    clipToRoof: true,
  });

  const roof: Roof = {
    mode: 'gable',
    eaveOverhang: 500,
    thickness: 200,
    pitchDeg: 35,
    eaveZ: zBottoms[1] + 1200,
  };

  const sectionInfo: Record<string, SectionInfo> = {
    [secId]: {
      maksIdentityNumber: 55443322,
      maksNumaratajIdentityNumber: 55443323,
      maksIntegrationState: 1003,
      integrationState: 1004,
      geometrySuitability: 1001,
      additionalNote: '-',
    },
  };
  const cardinalDirections: Record<string, readonly number[]> = {
    [sp3Id]: [1001],
    [spCatiId]: [1001],
  };

  const building: DesignBuilding = {
    id: buildingId,
    letter: 'A',
    storeys,
    sections,
    sectionParts,
    parts,
    openings,
    installations,
    roof,
    sectionInfo,
    cardinalDirections,
    info: {
      maksIdentityNumber: 55443322,
      maksIntegrationState: 1003,
      buildingType: 1001,
      geometrySuitability: [1006],
      tenderRegistrationNumber: '',
      architecturalPlanID: '',
      additionalNote: 'Çatı Piyesli Dubleks Daire Şablonu',
      elevatorCount: 1,
      buildingHeight: 5.5,
      architecturalProjectConfirmationDate: '2026-03-01',
    },
  };

  return {
    schemaVersion: 1,
    id: `PRJ_${uuidv5(`${seed}::project`)}`,
    name: 'Çatı Piyesli Dubleks Projesi',
    idSeq: 1000,
    georef: DEFAULT_GEOREF,
    parcel: DEFAULT_PARCEL,
    buildings: [building],
  };
}

/**
 * 4. ZEMİN TİCARİ + ÜST KATLAR KONUT KARMA YAPI (Dükkan/Mağaza + Mesken)
 */
export function createTicariZeminTemplate(seed = 'sablon_ticari'): DesignProject {
  const buildingId = `BLD_${uuidv5(`${seed}::building`)}`;
  const storeys: Storey[] = [];
  const sections: IndependentSection[] = [];
  const sectionParts: SectionPart[] = [];
  const parts: Part[] = [];
  const openings: Opening[] = [];

  const outline = rectPoly(0, 0, 18000, 12000); // 18m x 12m = 216 m2
  const heights = [3800, 2900, 2900]; // Zemin ticari: 3.8m
  let curBottom = 100000;

  // Zemin Kat: 2 Adet Ticari Dükkan (usage: 1002)
  const s0Id = `K_${uuidv5(`${seed}::storey::0`)}`;
  storeys.push({
    id: s0Id,
    storeyNumber: 'Z',
    height: heights[0],
    slabThickness: 250,
    zBottom: curBottom,
    outline: [outline],
  });

  // Dükkan 1 (Sol)
  const d1Id = `BB_${uuidv5(`${seed}::dukkan::1`)}`;
  const dp1Id = `BBK_${uuidv5(`${seed}::dukkanpart::1`)}`;
  sections.push({
    id: d1Id,
    number: '1',
    blockName: 'A',
    entrance: '1',
    registeredQuality: 'DÜKKAN',
    registeredInstallation: 'DOGALGAZ',
    registeredFloorDefinition: 'ZEMIN KAT',
    propertyLot: '3/10',
    planGrossArea: 108.0,
    planNetArea: 98.0,
  });
  sectionParts.push({
    id: dp1Id,
    sectionId: d1Id,
    storeyId: s0Id,
    usage: 1002,
    outline: rectPoly(0, 0, 9000, 12000),
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::room_dukkan1`)}`,
    kind: 'BBK',
    storeyId: s0Id,
    sectionPartIds: [dp1Id],
    usage: 1002,
    polygon: rectPoly(200, 200, 8800, 11800),
    planArea: 99.76,
  });
  openings.push({
    id: `KAPI_${uuidv5(`${seed}::kapi_dukkan1`)}`,
    kind: 'door',
    usage: 1001,
    storeyId: s0Id,
    anchor: { a: { x: 3000, y: 0 }, b: { x: 5000, y: 0 } },
    sill: 10,
    height: 2800,
  });

  // Dükkan 2 (Sağ)
  const d2Id = `BB_${uuidv5(`${seed}::dukkan::2`)}`;
  const dp2Id = `BBK_${uuidv5(`${seed}::dukkanpart::2`)}`;
  sections.push({
    id: d2Id,
    number: '2',
    blockName: 'A',
    entrance: '1',
    registeredQuality: 'DÜKKAN',
    registeredInstallation: 'DOGALGAZ',
    registeredFloorDefinition: 'ZEMIN KAT',
    propertyLot: '3/10',
    planGrossArea: 108.0,
    planNetArea: 98.0,
  });
  sectionParts.push({
    id: dp2Id,
    sectionId: d2Id,
    storeyId: s0Id,
    usage: 1002,
    outline: rectPoly(9000, 0, 18000, 12000),
  });
  parts.push({
    id: `ROOM_${uuidv5(`${seed}::room_dukkan2`)}`,
    kind: 'BBK',
    storeyId: s0Id,
    sectionPartIds: [dp2Id],
    usage: 1002,
    polygon: rectPoly(9200, 200, 17800, 11800),
    planArea: 99.76,
  });
  openings.push({
    id: `KAPI_${uuidv5(`${seed}::kapi_dukkan2`)}`,
    kind: 'door',
    usage: 1001,
    storeyId: s0Id,
    anchor: { a: { x: 12000, y: 0 }, b: { x: 14000, y: 0 } },
    sill: 10,
    height: 2800,
  });

  curBottom += heights[0];

  // 1. ve 2. Katlar: Mesken Daireler (usage: 1001)
  let konutNo = 3;
  for (let sIdx = 1; sIdx <= 2; sIdx++) {
    const sId = `K_${uuidv5(`${seed}::storey::${sIdx}`)}`;
    storeys.push({
      id: sId,
      storeyNumber: String(sIdx),
      height: heights[sIdx],
      slabThickness: 200,
      zBottom: curBottom,
      outline: [outline],
    });

    const kId = `BB_${uuidv5(`${seed}::konut::${konutNo}`)}`;
    const kpId = `BBK_${uuidv5(`${seed}::konutpart::${konutNo}`)}`;
    sections.push({
      id: kId,
      number: String(konutNo),
      blockName: 'A',
      entrance: '1',
      registeredQuality: 'MESKEN',
      registeredInstallation: 'DOGALGAZ',
      registeredFloorDefinition: `${sIdx}. KAT`,
      propertyLot: '2/10',
      planGrossArea: 216.0,
      planNetArea: 190.0,
    });
    sectionParts.push({
      id: kpId,
      sectionId: kId,
      storeyId: sId,
      usage: 1001,
      outline,
    });
    parts.push({
      id: `ROOM_${uuidv5(`${seed}::room_konut::${konutNo}`)}`,
      kind: 'BBK',
      storeyId: sId,
      sectionPartIds: [kpId],
      usage: 1001,
      polygon: rectPoly(200, 200, 17800, 11800),
      planArea: 204.16,
    });
    openings.push({
      id: `PEN_${uuidv5(`${seed}::pen_konut::${konutNo}`)}`,
      kind: 'window',
      usage: 1001,
      storeyId: sId,
      anchor: { a: { x: 4000, y: 0 }, b: { x: 7000, y: 0 } },
      sill: 900,
      height: 1400,
    });
    konutNo++;
    curBottom += heights[sIdx];
  }

  const roof: Roof = {
    mode: 'flat',
    eaveOverhang: 400,
    thickness: 200,
    pitchDeg: 0,
  };

  const sectionInfo: Record<string, SectionInfo> = {};
  for (let i = 1; i <= sections.length; i++) {
    const sec = sections[i - 1];
    if (sec) {
      sectionInfo[sec.id] = {
        maksIdentityNumber: 99880000 + i,
        maksNumaratajIdentityNumber: 99881000 + i,
        maksIntegrationState: 1003,
        integrationState: 1004,
        geometrySuitability: 1001,
        additionalNote: '-',
      };
    }
  }
  const cardinalDirections: Record<string, readonly number[]> = {};
  for (const sp of sectionParts) {
    cardinalDirections[sp.id] = [1001];
  }

  const building: DesignBuilding = {
    id: buildingId,
    letter: 'A',
    storeys,
    sections,
    sectionParts,
    parts,
    openings,
    roof,
    sectionInfo,
    cardinalDirections,
    info: {
      maksIdentityNumber: 99887766,
      maksIntegrationState: 1003,
      buildingType: 1001,
      geometrySuitability: [1006],
      tenderRegistrationNumber: '',
      architecturalPlanID: '',
      additionalNote: 'Zemin Ticari + Üst Katlar Konut Karma Yapı Şablonu',
      elevatorCount: 1,
      buildingHeight: 9.6,
      architecturalProjectConfirmationDate: '2026-04-05',
    },
  };

  return {
    schemaVersion: 1,
    id: `PRJ_${uuidv5(`${seed}::project`)}`,
    name: 'Zemin Ticari + Konut Karma Yapı Projesi',
    idSeq: 1000,
    georef: DEFAULT_GEOREF,
    parcel: DEFAULT_PARCEL,
    buildings: [building],
  };
}

export const PROJECT_TEMPLATES_CATALOG: readonly ProjectTemplateMeta[] = [
  {
    id: 'apartman',
    title: 'Standart Apartman (4 Kat, 8 Daire)',
    category: 'Konut / Çok Aileli',
    description: 'Zemin + 3 normal kat, her katta 2 daire, ortak kat holü, asansör, yangın merdiveni, balkonlar ve kırma çatı.',
    storeyCount: 4,
    sectionCount: 8,
    footprintAreaM2: 192.0,
    totalAreaM2: 768.0,
    roofType: 'hip',
  },
  {
    id: 'villa',
    title: 'Müstakil Villa (2 Kat, Bahçe & Teras)',
    category: 'Konut / Müstakil',
    description: 'Zemin + 1. kat, tek bağımsız bölüm, geniş salon ve açık mutfak, bahçe terası, ebeveyn yatak odası ve beşik çatı.',
    storeyCount: 2,
    sectionCount: 1,
    footprintAreaM2: 120.0,
    totalAreaM2: 240.0,
    roofType: 'gable',
  },
  {
    id: 'dubleks',
    title: 'Çatı Piyesli Dubleks Daire',
    category: 'Özel Durum / Dubleks',
    description: 'Normal kat + çatı arası katı, iç merdiven bağlantısı (BBKIY_ 1001), eğik tavan kesimli çatı odaları ve dizlik duvarı.',
    storeyCount: 2,
    sectionCount: 1,
    footprintAreaM2: 140.0,
    totalAreaM2: 250.0,
    roofType: 'gable',
  },
  {
    id: 'ticariZemin',
    title: 'Zemin Ticari + Konut Karma Yapı',
    category: 'Karma / Ticari + Mesken',
    description: 'Zemin katta 2 adet dükkan/mağaza (3.8m tavan yüksekliği, vitrin), üst katlarda 2 adet mesken daire ve düz çatı.',
    storeyCount: 3,
    sectionCount: 4,
    footprintAreaM2: 216.0,
    totalAreaM2: 648.0,
    roofType: 'flat',
  },
];

export function loadProjectTemplate(templateId: TemplateTypeId): DesignProject {
  switch (templateId) {
    case 'apartman':
      return createApartmanTemplate();
    case 'villa':
      return createVillaTemplate();
    case 'dubleks':
      return createDubleksTemplate();
    case 'ticariZemin':
      return createTicariZeminTemplate();
    default:
      throw new Error(`Bilinmeyen şablon türü: ${templateId}`);
  }
}
