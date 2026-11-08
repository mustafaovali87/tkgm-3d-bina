// M9 — §10.5 Özellik Tabanlı (Property-Based) Rastgele Plan Üreteci ve §10.7 Ölçeklenebilirlik Test Üreteci.
// Saf TypeScript; deterministik mulberry32 PRNG kullanır (Mutlak Kural 6: Math.random veya Date.now kullanılmaz).
import { uuidv5 } from '../hash/canonical.ts';
import { polyAreaM2 } from './geometry2d.ts';
import {
  DEFAULT_BUILDING_INFO,
  DEFAULT_SECTION_INFO,
  type Balcony,
  type DesignBuilding,
  type DesignProject,
  type IndependentSection,
  type Opening,
  type Part,
  type Poly2,
  type Pt2,
  type Pt3,
  type Roof,
  type SectionInfo,
  type SectionPart,
  type Storey,
} from './types.ts';

export interface RandomPlanOptions {
  readonly seed: number;
  readonly storeyCount?: number; // 1..20 (yoksa seed'den 1..4)
  readonly sectionsPerStorey?: number; // 1..4 (yoksa seed'den 1..3)
  readonly roomsPerSection?: number; // 1..6 (yoksa seed'den 1..6)
  readonly roofMode?: 'flat' | 'gable' | 'hip';
  readonly includeBalcony?: boolean;
}

/**
 * Deterministik 32-bit PRNG (`mulberry32` — `Mutlak Kural 6`).
 */
export function createDeterministicPrng(seed: number): {
  nextFloat(): number;
  nextInt(minInclusive: number, maxInclusive: number): number;
  pick<T>(items: readonly T[]): T;
} {
  let state = seed >>> 0;
  const nextFloat = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const nextInt = (minInclusive: number, maxInclusive: number): number => {
    if (maxInclusive <= minInclusive) return minInclusive;
    return minInclusive + Math.floor(nextFloat() * (maxInclusive - minInclusive + 1));
  };
  const pick = <T>(items: readonly T[]): T => items[nextInt(0, items.length - 1)];
  return { nextFloat, nextInt, pick };
}

function rectRingCcw(x0: number, y0: number, x1: number, y1: number): readonly Pt2[] {
  return [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
}

function rectPoly(x0: number, y0: number, x1: number, y1: number): Poly2 {
  return { outer: rectRingCcw(x0, y0, x1, y1), holes: [] };
}

interface RoomBox {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  readonly usage: number;
}

const ROOM_USAGES: readonly number[] = [1003, 1001, 1004, 1002, 1006, 1005];

/**
 * Bir bağımsız bölümün iç dikdörtgen kutusunu `[bx0, bx1] x [by0, by1]`
 * `200 mm` iç duvar boşluklarıyla `1..6` odaya böler.
 */
function subdivideSectionIntoRooms(
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  roomCount: number,
  wallThick: number
): {
  readonly rooms: readonly RoomBox[];
  readonly doors: ReadonlyArray<{ readonly a: Pt2; readonly b: Pt2 }>;
} {
  const count = Math.max(1, Math.min(6, roomCount));
  const rooms: RoomBox[] = [];
  const doors: Array<{ readonly a: Pt2; readonly b: Pt2 }> = [];

  // 1..3 oda: dikey (X) veya yatay (Y) şeritler; 4..6 oda: 2 satır × (2..3 sütun) ızgara
  const rows = count <= 2 ? 1 : 2;
  const rowCounts: number[] =
    rows === 1
      ? [count]
      : [Math.ceil(count / 2), count - Math.ceil(count / 2)];

  const totalH = by1 - by0 - (rows - 1) * wallThick;
  const rowH = Math.floor(totalH / rows / 100) * 100;

  let usageIdx = 0;
  const gridRooms: RoomBox[][] = [];

  for (let r = 0; r < rows; r++) {
    const ry0 = by0 + r * (rowH + wallThick);
    const ry1 = r === rows - 1 ? by1 : ry0 + rowH;
    const cols = rowCounts[r];
    const totalW = bx1 - bx0 - (cols - 1) * wallThick;
    const colW = Math.floor(totalW / cols / 100) * 100;
    const rowList: RoomBox[] = [];

    for (let c = 0; c < cols; c++) {
      const cx0 = bx0 + c * (colW + wallThick);
      const cx1 = c === cols - 1 ? bx1 : cx0 + colW;
      const box: RoomBox = {
        x0: cx0,
        y0: ry0,
        x1: cx1,
        y1: ry1,
        usage: ROOM_USAGES[usageIdx % ROOM_USAGES.length],
      };
      usageIdx++;
      rooms.push(box);
      rowList.push(box);

      // Aynı satırda sol komşuyla ara kapı (x = cx0, dikey duvar)
      if (c > 0) {
        const midY = Math.round((ry0 + ry1) / 2 / 100) * 100;
        doors.push({
          a: { x: cx0, y: midY + 400 },
          b: { x: cx0, y: midY - 400 },
        });
      }
    }
    gridRooms.push(rowList);
  }

  // Alt satır ile üst satır arasındaki odalara ara kapı (y = gridRooms[0][c].y1, yatay duvar)
  if (gridRooms.length === 2) {
    const bottomRow = gridRooms[0];
    const topRow = gridRooms[1];
    for (let c = 0; c < topRow.length; c++) {
      const topRoom = topRow[c];
      const botRoom = bottomRow[Math.min(c, bottomRow.length - 1)];
      const overlapX0 = Math.max(topRoom.x0, botRoom.x0);
      const overlapX1 = Math.min(topRoom.x1, botRoom.x1);
      if (overlapX1 - overlapX0 >= 1400) {
        const midX = Math.round((overlapX0 + overlapX1) / 2 / 100) * 100;
        // Alt odanın kuzey kenarı (CCW'de sağdan sola: x1 -> x0)
        doors.push({
          a: { x: midX + 400, y: botRoom.y1 },
          b: { x: midX - 400, y: botRoom.y1 },
        });
      }
    }
  }

  return { rooms, doors };
}

/**
 * Şartname §10.5 ve §10.7 için deterministik tohumlu (`seed`) geçerli çok katlı / çok BB'li
 * bina tasarım projesi üretir.
 */
export function generateRandomBuildingProject(options: RandomPlanOptions): DesignProject {
  const rng = createDeterministicPrng(options.seed);
  const storeyCount = options.storeyCount ?? rng.nextInt(1, 4);
  const sectionsPerStorey = options.sectionsPerStorey ?? rng.nextInt(1, 3);
  const roomsPerSection = options.roomsPerSection ?? rng.nextInt(1, 6);
  const roofMode = options.roofMode ?? rng.pick(['flat', 'gable', 'hip'] as const);
  const includeBalcony = options.includeBalcony ?? true;

  const wallThick = 200;
  // Her BB sütunu en az 3 sütun odayı rahat alacak genişlikte olsun
  const colWidthMm = Math.max(6400, rng.nextInt(32, 42) * 200);
  const buildingWidthMm = sectionsPerStorey * colWidthMm;
  const corridorDepthMm = sectionsPerStorey > 1 ? 2000 : 0;
  const sectionDepthMm = Math.max(7600, rng.nextInt(38, 48) * 200);
  const buildingDepthMm =
    sectionsPerStorey > 1
      ? wallThick + corridorDepthMm + wallThick + sectionDepthMm + wallThick
      : wallThick + sectionDepthMm + wallThick;

  const baseZ = 1050000; // 1050.000 m ortometrik kot
  const storeyHeight = 3000;
  const slabThickness = 200;

  const projectSeed = `m9-seed-${options.seed}`;
  let seq = 1;
  const nextId = (kind: string): string => `${kind}_${uuidv5(`${projectSeed}:${kind}:${seq++}`)}`;

  const storeys: Storey[] = [];
  const sections: IndependentSection[] = [];
  const sectionParts: SectionPart[] = [];
  const parts: Part[] = [];
  const openings: Opening[] = [];
  const balconies: Balcony[] = [];
  const sectionInfo: Record<string, SectionInfo> = {};
  const cardinalDirections: Record<string, readonly number[]> = {};

  const totalBbCount = storeyCount * sectionsPerStorey;
  let bbNumberCounter = 1;

  for (let sIdx = 0; sIdx < storeyCount; sIdx++) {
    const stId = nextId('st');
    const stNum = sIdx === 0 ? 'Z' : String(sIdx);
    const zBottom = baseZ + sIdx * storeyHeight;
    const outlinePoly = rectPoly(0, 0, buildingWidthMm, buildingDepthMm);

    storeys.push({
      id: stId,
      storeyNumber: stNum,
      zBottom,
      height: storeyHeight,
      slabThickness,
      outline: [outlinePoly],
    });

    const hasCorridor = sectionsPerStorey > 1;
    const yBbStart = hasCorridor ? wallThick + corridorDepthMm + wallThick : 0;

    if (hasCorridor) {
      // Güney ortak alan holü (OA_): [200, buildingWidthMm - 200] x [200, 2200]
      const oaId = nextId('oa');
      const oaPoly = rectPoly(wallThick, wallThick, buildingWidthMm - wallThick, wallThick + corridorDepthMm);
      parts.push({
        id: oaId,
        kind: 'OA',
        storeyId: stId,
        sectionPartIds: [],
        usage: 1008, // Hol
        polygon: oaPoly,
        planArea: Number(polyAreaM2(oaPoly).toFixed(2)),
      });

      // Zemin katta bina giriş kapısı (1001), üst katlarda dış cephe hol penceresi (1001)
      const midX = Math.round(buildingWidthMm / 2 / 100) * 100;
      if (sIdx === 0) {
        openings.push({
          id: nextId('op'),
          kind: 'door',
          usage: 1001,
          storeyId: stId,
          anchor: {
            a: { x: midX - 500, y: wallThick },
            b: { x: midX + 500, y: wallThick },
          },
          sill: 10,
          height: 2100,
        });
      } else {
        openings.push({
          id: nextId('op'),
          kind: 'window',
          usage: 1001,
          storeyId: stId,
          anchor: {
            a: { x: midX - 600, y: wallThick },
            b: { x: midX + 600, y: wallThick },
          },
          sill: 900,
          height: 1300,
        });
      }
    }

    for (let bIdx = 0; bIdx < sectionsPerStorey; bIdx++) {
      const bbNo = String(bbNumberCounter++);
      const secId = nextId('sec');
      const spId = nextId('sp');

      const sx0 = bIdx * colWidthMm;
      const sx1 = (bIdx + 1) * colWidthMm;
      const sy0 = yBbStart;
      const sy1 = buildingDepthMm;
      const spPoly = rectPoly(sx0, sy0, sx1, sy1);
      const spArea = Number(polyAreaM2(spPoly).toFixed(2));

      sections.push({
        id: secId,
        number: bbNo,
        blockName: 'A',
        entrance: '1',
        registeredQuality: 'MESKEN',
        registeredInstallation: '-',
        registeredFloorDefinition: stNum === 'Z' ? 'ZEMİN KAT' : `${stNum}. NORMAL KAT`,
        propertyLot: `1/${totalBbCount}`,
        planNetArea: Number((spArea * 0.82).toFixed(2)),
        planGrossArea: Number((spArea * 1.05).toFixed(2)),
      });

      sectionInfo[secId] = {
        ...DEFAULT_SECTION_INFO,
        maksIdentityNumber: 100000000 + options.seed * 1000 + Number(bbNo),
        maksNumaratajIdentityNumber: 200000000 + options.seed * 1000 + Number(bbNo),
      };

      sectionParts.push({
        id: spId,
        sectionId: secId,
        storeyId: stId,
        usage: 1001,
        outline: spPoly,
      });

      cardinalDirections[spId] = [1001, 1005];

      // Oda kutusu sınırları:
      // Dış duvarlarda 200 mm içeride; iki komşu BB arasında her birinden 100 mm içeride (toplam 200 mm duvar)
      const rx0 = bIdx === 0 ? sx0 + wallThick : sx0 + wallThick / 2;
      const rx1 = bIdx === sectionsPerStorey - 1 ? sx1 - wallThick : sx1 - wallThick / 2;
      const ry0 = hasCorridor ? sy0 : sy0 + wallThick;
      const ry1 = sy1 - wallThick;

      const sub = subdivideSectionIntoRooms(rx0, ry0, rx1, ry1, roomsPerSection, wallThick);

      for (let rIdx = 0; rIdx < sub.rooms.length; rIdx++) {
        const rb = sub.rooms[rIdx];
        const rPoly = rectPoly(rb.x0, rb.y0, rb.x1, rb.y1);
        const rArea = Number(polyAreaM2(rPoly).toFixed(2));
        parts.push({
          id: nextId('part'),
          kind: 'BBK',
          storeyId: stId,
          sectionPartIds: [spId],
          usage: rb.usage,
          polygon: rPoly,
          planArea: rArea,
        });

        // İlk odaya BB giriş kapısı (1003 — koridordan veya dış cepheden)
        if (rIdx === 0) {
          const doorMidX = Math.round((rb.x0 + rb.x1) / 2 / 100) * 100;
          openings.push({
            id: nextId('op'),
            kind: 'door',
            usage: 1003,
            storeyId: stId,
            anchor: {
              a: { x: doorMidX - 450, y: rb.y0 },
              b: { x: doorMidX + 450, y: rb.y0 },
            },
            sill: 10,
            height: 2100,
          });
        }

        // Kuzey dış cepheye değen her odaya dış pencere (1001)
        if (rb.y1 === ry1) {
          const winMidX = Math.round((rb.x0 + rb.x1) / 2 / 100) * 100;
          openings.push({
            id: nextId('op'),
            kind: 'window',
            usage: 1001,
            storeyId: stId,
            anchor: {
              a: { x: winMidX + 500, y: rb.y1 },
              b: { x: winMidX - 500, y: rb.y1 },
            },
            sill: 900,
            height: 1300,
          });
        } else if (bIdx === 0 && rb.x0 === rx0) {
          // Batı dış cepheye değen alt satır odasına dış pencere
          const winMidY = Math.round((rb.y0 + rb.y1) / 2 / 100) * 100;
          openings.push({
            id: nextId('op'),
            kind: 'window',
            usage: 1001,
            storeyId: stId,
            anchor: {
              a: { x: rb.x0, y: winMidY + 500 },
              b: { x: rb.x0, y: winMidY - 500 },
            },
            sill: 900,
            height: 1300,
          });
        } else if (bIdx === sectionsPerStorey - 1 && rb.x1 === rx1) {
          // Doğu dış cepheye değen alt satır odasına dış pencere
          const winMidY = Math.round((rb.y0 + rb.y1) / 2 / 100) * 100;
          openings.push({
            id: nextId('op'),
            kind: 'window',
            usage: 1001,
            storeyId: stId,
            anchor: {
              a: { x: rb.x1, y: winMidY - 500 },
              b: { x: rb.x1, y: winMidY + 500 },
            },
            sill: 900,
            height: 1300,
          });
        }
      }

      // Oda arası iç kapılar (1004)
      for (const d of sub.doors) {
        openings.push({
          id: nextId('op'),
          kind: 'door',
          usage: 1004,
          storeyId: stId,
          anchor: d,
          sill: 10,
          height: 2100,
        });
      }

      // Üst katta ilk BB'ye balkon (BLKN_) ekle
      if (includeBalcony && sIdx > 0 && bIdx === 0) {
        const bx0 = sx0 + 800;
        const bx1 = Math.min(sx1 - 800, sx0 + 3600);
        const by0 = buildingDepthMm;
        const by1 = buildingDepthMm + 1400;
        const balRing = rectRingCcw(bx0, by0, bx1, by1);
        balconies.push({
          id: nextId('blkn'),
          kind: 'Balkon',
          storeyId: stId,
          sectionPartId: spId,
          outline: balRing,
          attachedEdges: [
            [
              { x: bx0, y: by0 },
              { x: bx1, y: by0 },
            ],
          ],
          parapetHeight: 1100,
          parapetThickness: 100,
          planArea: Number((((bx1 - bx0) * (by1 - by0)) / 1e6).toFixed(2)),
        });
      }
    }
  }

  const roof: Roof = {
    mode: roofMode,
    eaveOverhang: roofMode === 'flat' ? 0 : 300,
    thickness: 200,
    pitchDeg: roofMode === 'flat' ? 0 : 25,
  };

  const tic: readonly Pt3[] = [
    { x: 0, y: 0, z: baseZ },
    { x: buildingWidthMm, y: 0, z: baseZ },
    { x: buildingWidthMm, y: buildingDepthMm, z: baseZ },
    { x: 0, y: buildingDepthMm, z: baseZ },
  ];

  const building: DesignBuilding = {
    id: nextId('bldg'),
    letter: 'A',
    storeys,
    sections,
    sectionParts,
    parts,
    openings,
    balconies,
    roof,
    tic,
    info: {
      ...DEFAULT_BUILDING_INFO,
      maksIdentityNumber: 500000000 + options.seed,
      elevatorCount: storeyCount >= 4 ? 1 : 0,
      architecturalProjectConfirmationDate: '2026-05-15',
    },
    sectionInfo,
    cardinalDirections,
  };

  return {
    schemaVersion: 1,
    id: projectSeed,
    name: `Rastgele Test Binası #${options.seed}`,
    idSeq: seq,
    georef: {
      epsg: 5254,
      originE: 500000,
      originN: 4420000,
      zeroElevationOrthometric: baseZ,
    },
    parcel: {
      takbisPropertyIdentityNumber: 80000000 + options.seed,
      blockNumber: '101',
      parcelNumber: String(options.seed),
      takbisNeighbourhoodReference: 12345,
    },
    buildings: [building],
  };
}
