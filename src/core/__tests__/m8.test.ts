// M8 — Çatı arası ve özel durumlar birim testleri (şartname §3.5–§3.9, §4.2, §5.2, §5.4–§5.12, §11).
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createCodelistRegistryFromXmlMap, OFFICIAL_CODELIST_NAMES, type OfficialCodelistName } from '../codelists/index.ts';
import { generateBrep } from '../brep/generate.ts';
import { checkShell } from '../brep/shellCheck.ts';
import { subtractPolygons2D } from '../brep/polyBoolean2d.ts';
import { checkDesign } from '../design/checks.ts';
import { createEditorState, editorReducer } from '../design/editor.ts';
import { designFromImportedModel } from '../design/fromImported.ts';
import { normalizeOrientation } from '../design/geometry2d.ts';
import { parseProject, serializeProject } from '../design/projectFile.ts';
import type { DesignBuilding, DesignProject, Poly2, Pt2 } from '../design/types.ts';
import { writeCityGml } from '../gml/cityGmlWriter.ts';
import { parseCityGmlModel } from '../gml/gmlReader.ts';
import { validateCityGml } from '../validation/index.ts';

const rect = (x0: number, y0: number, x1: number, y1: number): Poly2 =>
  normalizeOrientation({
    outer: [
      { x: x0, y: y0 },
      { x: x1, y: y0 },
      { x: x1, y: y1 },
      { x: x0, y: y1 },
    ],
    holes: [],
  });

const xmlMap = {} as Record<OfficialCodelistName, string>;
for (const n of OFFICIAL_CODELIST_NAMES) xmlMap[n] = fs.readFileSync(path.resolve(process.cwd(), 'resources', 'codelists', `${n}.xml`), 'utf-8');
const codelists = createCodelistRegistryFromXmlMap(xmlMap);

const Z0 = 100000; // 100.000 m ortometrik kot (V-201 >= 5 m)

function makeBaseProject(buildingOverride: Partial<DesignBuilding>): DesignProject {
  const k0Outline = rect(0, 0, 10000, 8000);
  const bb0Outline = rect(0, 0, 10000, 8000);
  const room0Poly = rect(200, 200, 9800, 7800);
  const baseBuilding: DesignBuilding = {
    id: 'b-m8',
    letter: 'A',
    storeys: [
      {
        id: 's0',
        storeyNumber: '0',
        zBottom: Z0,
        height: 3000,
        slabThickness: 200,
        outline: [k0Outline],
      },
    ],
    sections: [
      {
        id: 'sec1',
        number: '1',
        blockName: '-1',
        entrance: '1',
        registeredQuality: 'MESKEN',
        registeredInstallation: '-1',
        registeredFloorDefinition: 'Zemin Kat',
        propertyLot: '1/1',
        planNetArea: -1,
        planGrossArea: -1,
      },
    ],
    sectionParts: [
      {
        id: 'sp0',
        sectionId: 'sec1',
        storeyId: 's0',
        usage: 1001,
        outline: bb0Outline,
      },
    ],
    parts: [
      {
        id: 'p0',
        kind: 'BBK',
        storeyId: 's0',
        sectionPartIds: ['sp0'],
        usage: 1001,
        polygon: room0Poly,
        planArea: -1,
      },
    ],
    openings: [
      {
        id: 'door0',
        kind: 'door',
        usage: 1001,
        storeyId: 's0',
        anchor: { a: { x: 4000, y: 200 }, b: { x: 4900, y: 200 } },
        sill: 10,
        height: 2100,
      },
      {
        id: 'win0',
        kind: 'window',
        usage: 1001,
        storeyId: 's0',
        anchor: { a: { x: 1500, y: 200 }, b: { x: 3000, y: 200 } },
        sill: 900,
        height: 1300,
      },
    ],
    info: {
      maksIdentityNumber: 123456,
      maksIntegrationState: 1003,
      buildingType: 1001,
      geometrySuitability: [1006],
      tenderRegistrationNumber: '',
      architecturalPlanID: '',
      additionalNote: '-',
      elevatorCount: 0,
      buildingHeight: null,
      architecturalProjectConfirmationDate: '2026-01-15',
    },
    sectionInfo: {
      sec1: {
        maksIdentityNumber: 1001,
        maksNumaratajIdentityNumber: 2001,
        maksIntegrationState: 1003,
        integrationState: 1004,
        geometrySuitability: 1001,
        additionalNote: '-',
      },
    },
    cardinalDirections: {
      sp0: [1001, 1005],
      sp1: [1001, 1005],
      spLower: [1001, 1005],
      spAttic: [1001, 1005],
    },
    roof: { mode: 'flat', eaveOverhang: 0, thickness: 200, pitchDeg: 0 },
    tic: [
      { x: 0, y: 0, z: Z0 },
      { x: 10000, y: 0, z: Z0 },
      { x: 10000, y: 8000, z: Z0 },
      { x: 0, y: 8000, z: Z0 },
    ],
    ...buildingOverride,
  };
  return {
    schemaVersion: 1,
    id: 'proj-m8',
    name: 'M8 Test Projesi',
    idSeq: 100,
    georef: { epsg: 5254, originE: 500000, originN: 4400000, zeroElevationOrthometric: 0 },
    parcel: {
      takbisPropertyIdentityNumber: 123456,
      blockNumber: '101',
      parcelNumber: '1',
      takbisNeighbourhoodReference: 999,
    },
    buildings: [baseBuilding],
  };
}

const hErrors = (rep: ReturnType<typeof validateCityGml>) =>
  rep.findings.filter((f) => f.severity === 'H').map((f) => `${f.ruleId}: ${f.message}`);

describe('M8 — Çatı Arası Kesimi (Gable, Hip, Shed, Manual) (§5.9, §5.11, §5.12)', () => {
  it.each(['gable', 'hip', 'shed'] as const)(
    '%s eğik çatı altında çatı arası katı: tek CeilingSurface, kapalı manifold kabuk, ıraksama hacmi ve 0 HATA',
    (roofMode) => {
      const kOutline = rect(0, 0, 10000, 8000);
      const bbOutline = rect(0, 0, 10000, 8000);
      const leftRoom = rect(200, 200, 4900, 7800);
      const rightRoom = rect(5100, 200, 9800, 7800);

      const project = makeBaseProject({
        storeys: [
          { id: 's0', storeyNumber: 'Z', zBottom: Z0, height: 3000, slabThickness: 200, outline: [kOutline] },
          {
            id: 's1',
            storeyNumber: '1',
            zBottom: Z0 + 3000,
            height: 3200,
            slabThickness: 200,
            outline: [kOutline],
            clipToRoof: true,
            kneeWallHeight: 2200,
          },
        ],
        sectionParts: [
          { id: 'sp0', sectionId: 'sec1', storeyId: 's0', usage: 1001, outline: bbOutline },
          { id: 'sp1', sectionId: 'sec1', storeyId: 's1', groupStoreyId: 's0', usage: 1004, outline: bbOutline, clipToRoof: true },
        ],
        parts: [
          { id: 'p0', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1001, polygon: rect(200, 200, 9800, 7800), planArea: -1 },
          { id: 'p1L', kind: 'BBK', storeyId: 's1', sectionPartIds: ['sp1'], usage: 1001, polygon: leftRoom, planArea: -1, clipToRoof: true },
          { id: 'p1R', kind: 'BBK', storeyId: 's1', sectionPartIds: ['sp1'], usage: 1012, polygon: rightRoom, planArea: -1, clipToRoof: true },
        ],
        openings: [
          { id: 'door0', kind: 'door', usage: 1001, storeyId: 's0', anchor: { a: { x: 4000, y: 200 }, b: { x: 4900, y: 200 } }, sill: 10, height: 2100 },
          { id: 'door1', kind: 'door', usage: 1004, storeyId: 's1', anchor: { a: { x: 4900, y: 3000 }, b: { x: 4900, y: 3900 } }, sill: 10, height: 1900 },
        ],
        roof: {
          mode: roofMode,
          eaveOverhang: 200,
          thickness: 200,
          pitchDeg: 22,
        },
      });

      const brep = generateBrep(project, project.buildings[0]);
      expect(brep.issues.filter((i) => i.severity === 'H')).toEqual([]);

      // Çatı arası odalarının her birinde tek CeilingSurface olmalı ve eğik Ceiling_ poligonları içermeli (§5.9 #5)
      const atticRooms = brep.rooms.filter((r) => r.designId === 'p1L' || r.designId === 'p1R');
      expect(atticRooms).toHaveLength(2);
      for (const r of atticRooms) {
        const ceilSurfaces = r.surfaces.filter((s) => s.tag === 'CeilingSurface');
        expect(ceilSurfaces).toHaveLength(1);
        const ceilPolys = ceilSurfaces[0].polygons;
        expect(ceilPolys.length).toBeGreaterThanOrEqual(1);
        const allZ = ceilPolys.flatMap((p) => p.outer.map((v) => v.z));
        expect(Math.max(...allZ) - Math.min(...allZ)).toBeGreaterThan(200);
        const sh = checkShell(r);
        expect(sh.closed).toBe(true);
        expect(sh.volumeM3).toBeGreaterThan(50);
      }

      const out = writeCityGml(project, brep, codelists);
      const parsed = parseCityGmlModel(out.xml, out.fileName, codelists);
      const rep = validateCityGml(out.xml, out.fileName, parsed, codelists);
      expect(hErrors(rep)).toEqual([]);

      // GML'den geri çıkarma (round-trip): eğik ceilingFaces ve groupStoreyId korunmalı
      const extracted = designFromImportedModel(parsed).project;
      const eb = extracted.buildings[0];
      const extSp1 = eb.sectionParts.find((sp) => sp.usage === 1004);
      expect(extSp1?.groupStoreyId).toBeDefined();
      const extAtticParts = eb.parts.filter((p) => p.ceilingFaces && p.ceilingFaces.length > 0);
      expect(extAtticParts.length).toBe(2);
    },
  );

  it('çatı altında en yüksek noktası < 1.5 m kalan oda için B-ODA-02 (V-152) hatası üretir (§5.9 #6)', () => {
    const kOutline = rect(0, 0, 10000, 8000);
    const lowRoom = rect(200, 200, 9800, 1500);
    const project = makeBaseProject({
      storeys: [
        {
          id: 's0',
          storeyNumber: 'Z',
          zBottom: Z0,
          height: 2000,
          slabThickness: 200,
          outline: [kOutline],
          clipToRoof: true,
          kneeWallHeight: 600,
        },
      ],
      sectionParts: [{ id: 'sp0', sectionId: 'sec1', storeyId: 's0', usage: 1004, outline: kOutline, clipToRoof: true }],
      parts: [{ id: 'pLow', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1001, polygon: lowRoom, planArea: -1, clipToRoof: true }],
      openings: [],
      roof: { mode: 'shed', eaveOverhang: 0, thickness: 200, pitchDeg: 5 },
    });
    const brep = generateBrep(project, project.buildings[0]);
    expect(brep.issues.some((i) => i.code === 'B-ODA-02')).toBe(true);
  });
});

describe('M8 — İç Yapı: BBKIY ve OAIY (Merdiven 1001, Sütun 1002, Asansör 1003) (§3.9, §4.2)', () => {
  it('BBKIY ve OAIY üretir, oda tabanından delik açmaz (§3.9), gml:name ve V-196/V-151 kurallarından 0 HATA alır ve GML round-trip yapar', () => {
    const kOutline = rect(0, 0, 12000, 8000);
    const bbOutline = rect(0, 0, 8000, 8000);
    const roomPoly = rect(200, 200, 7800, 7800);
    const oaPoly = rect(8200, 200, 11800, 7800);
    const colPoly = rect(2000, 2000, 2600, 2600);
    const bbStairPoly = rect(5000, 1000, 7000, 2500);
    const oaElevPoly = rect(8600, 1000, 10200, 2600);
    const oaStairPoly = rect(8600, 4000, 11200, 6800);

    const project = makeBaseProject({
      storeys: [{ id: 's0', storeyNumber: 'Z', zBottom: Z0, height: 3000, slabThickness: 200, outline: [kOutline] }],
      sectionParts: [{ id: 'sp0', sectionId: 'sec1', storeyId: 's0', usage: 1001, outline: bbOutline }],
      parts: [
        { id: 'pRoom', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1001, polygon: roomPoly, planArea: -1 },
        { id: 'pOa', kind: 'OA', storeyId: 's0', sectionPartIds: [], usage: 1022, polygon: oaPoly, planArea: -1 },
      ],
      installations: [
        { id: 'iyCol', partId: 'pRoom', usage: 1002, polygon: colPoly },
        { id: 'iyBbStair', partId: 'pRoom', usage: 1001, polygon: bbStairPoly },
        { id: 'iyOaElev', partId: 'pOa', usage: 1003, polygon: oaElevPoly },
        { id: 'iyOaStair', partId: 'pOa', usage: 1001, polygon: oaStairPoly },
      ],
      tic: [
        { x: 0, y: 0, z: Z0 },
        { x: 12000, y: 0, z: Z0 },
        { x: 12000, y: 8000, z: Z0 },
        { x: 0, y: 8000, z: Z0 },
      ],
    });

    expect(checkDesign(project).filter((i) => i.severity === 'H')).toEqual([]);

    const brep = generateBrep(project, project.buildings[0]);
    expect(brep.installations).toHaveLength(4);
    for (const iy of brep.installations ?? []) {
      expect(checkShell(iy).closed).toBe(true);
    }

    // §3.9: İç yapı kendi zemin poligonuna sahiptir; bağlı olduğu odanın zemininden delik olarak çıkarılmaz!
    for (const r of brep.rooms) {
      const floor = r.surfaces.find((s) => s.tag === 'FloorSurface')?.polygons[0];
      expect(floor?.holes).toHaveLength(0);
      expect(r.installations?.length).toBe(2);
    }

    const out = writeCityGml(project, brep, codelists);
    expect(out.xml).toContain('<bldg:roomInstallation>');
    expect(out.xml).toContain('BBKIY_');
    expect(out.xml).toContain('OAIY_');
    expect(out.xml).toContain('1_Oda_İç Yapı');
    expect(out.xml).toContain('Niteliksiz Ortak Alan_İç Yapı');

    const parsed = parseCityGmlModel(out.xml, out.fileName, codelists);
    const rep = validateCityGml(out.xml, out.fileName, parsed, codelists);
    expect(hErrors(rep)).toEqual([]);

    // GML'den tasarım çıkarma + .tkgm3b serileştirme round-trip
    const extracted = designFromImportedModel(parsed).project;
    expect(extracted.buildings[0].installations).toHaveLength(4);
    expect(extracted.buildings[0].installations?.map((x) => x.usage).sort()).toEqual([1001, 1001, 1002, 1003]);
    const serialized = serializeProject(extracted);
    const reparsed = parseProject(serialized).project;
    expect(reparsed.buildings[0].installations).toHaveLength(4);
  });

  it('2B editör "iy" aracıyla oda içine iç yapı çizer, oda tabanından delik açmaz', () => {
    const project = makeBaseProject({});
    let state = createEditorState(project);
    state = editorReducer(state, { type: 'tool', tool: 'iy' });
    state = editorReducer(state, { type: 'options', patch: { iyUsage: 1002 } });
    const pts: Pt2[] = [
      { x: 1000, y: 1000 },
      { x: 2000, y: 1000 },
      { x: 2000, y: 2000 },
      { x: 1000, y: 2000 },
    ];
    for (const p of pts) state = editorReducer(state, { type: 'click', p });
    state = editorReducer(state, { type: 'finish' });
    expect(state.project.buildings[0].installations).toHaveLength(1);
    expect(state.project.buildings[0].installations?.[0].usage).toBe(1002);
    expect(state.project.buildings[0].parts[0].polygon.holes).toHaveLength(0);
  });
});

describe('M8 — İç Kısım (K71), Dubleks, Asma Kat, Uzak Kısım, Sahanlık Penceresi, OA Dış Duvarı ve Kademeli Katlar', () => {
  it('İç kısım (K71: Dükkan içinde WC): otomatik delik açar, iç duvar adası üretir ve 0 HATA alır (§5.3, §5.5)', () => {
    const kOutline = rect(0, 0, 10000, 8000);
    const bbOutline = rect(0, 0, 10000, 8000);
    const shopPoly = rect(200, 200, 9800, 7800);
    const wcPoly = rect(1000, 1000, 3000, 3000);

    const project = makeBaseProject({
      storeys: [{ id: 's0', storeyNumber: 'Z', zBottom: Z0, height: 3200, slabThickness: 200, outline: [kOutline] }],
      sectionParts: [{ id: 'sp0', sectionId: 'sec1', storeyId: 's0', usage: 1001, outline: bbOutline }],
      parts: [
        { id: 'pShop', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1017, polygon: shopPoly, planArea: -1 },
        { id: 'pWc', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1004, polygon: wcPoly, planArea: -1 },
      ],
    });

    expect(checkDesign(project).filter((i) => i.severity === 'H')).toEqual([]);

    const brep = generateBrep(project, project.buildings[0]);
    const shopRoom = brep.rooms.find((r) => r.designId === 'pShop')!;
    const wcRoom = brep.rooms.find((r) => r.designId === 'pWc')!;
    expect(checkShell(shopRoom).closed).toBe(true);
    expect(checkShell(wcRoom).closed).toBe(true);
    const shopFloor = shopRoom.surfaces.find((s) => s.tag === 'FloorSurface')!.polygons[0];
    expect(shopFloor.holes).toHaveLength(1);
    const shopWalls = shopRoom.surfaces.filter((s) => s.tag === 'InteriorWallSurface' || s.tag === 'WallSurface');
    expect(shopWalls).toHaveLength(8);
    expect(checkShell(shopRoom).volumeM3).toBeCloseTo((9.6 * 7.6 - 4.0) * 3.0, 2);

    const out = writeCityGml(project, brep, codelists);
    const parsed = parseCityGmlModel(out.xml, out.fileName, codelists);
    const rep = validateCityGml(out.xml, out.fileName, parsed, codelists);
    expect(hErrors(rep)).toEqual([]);
  });

  it('Kademeli katlar (§5.10 OuterFloor L−U ve OuterCeiling U−L), Sahanlık Penceresi (spansStoreys), OA Dış Duvarı, Asma Kat ve Uzak Kısım: 0 HATA', () => {
    const lowerOutline = rect(0, 0, 12000, 8000);
    const upperOutline = rect(-1500, 0, 10000, 8000);

    const outerFloorDiff = subtractPolygons2D([lowerOutline], [upperOutline]);
    const outerCeilDiff = subtractPolygons2D([upperOutline], [lowerOutline]);
    expect(outerFloorDiff.length).toBeGreaterThan(0);
    expect(outerCeilDiff.length).toBeGreaterThan(0);

    const project = makeBaseProject({
      storeys: [
        { id: 's0', storeyNumber: 'Z', zBottom: Z0, height: 3000, slabThickness: 200, outline: [lowerOutline] },
        { id: 's1', storeyNumber: '1', zBottom: Z0 + 3000, height: 3000, slabThickness: 200, outline: [upperOutline] },
      ],
      sectionParts: [
        { id: 'sp0', sectionId: 'sec1', storeyId: 's0', usage: 1001, outline: rect(0, 0, 8000, 8000) },
        { id: 'sp1', sectionId: 'sec1', storeyId: 's1', groupStoreyId: 's0', usage: 1003, outline: rect(-1500, 0, 10000, 8000) },
      ],
      parts: [
        { id: 'p0', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1001, polygon: rect(200, 200, 5000, 7800), planArea: -1 },
        { id: 'pMezz', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1017, polygon: rect(5200, 200, 7800, 7800), planArea: -1, zFloorOverride: Z0 + 700 },
        { id: 'pOaExt', kind: 'OA', storeyId: 's0', sectionPartIds: [], usage: 1007, polygon: rect(8200, 200, 11800, 7800), planArea: -1 },
        { id: 'pRemote', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1005, polygon: rect(8400, 400, 9600, 1600), planArea: -1, remote: true, zFloorOverride: Z0 + 700 },
        { id: 'p1', kind: 'BBK', storeyId: 's1', sectionPartIds: ['sp1'], usage: 1001, polygon: rect(-1300, 200, 9800, 7800), planArea: -1 },
      ],
      openings: [
        { id: 'door0', kind: 'door', usage: 1001, storeyId: 's0', anchor: { a: { x: 4000, y: 200 }, b: { x: 4900, y: 200 } }, sill: 10, height: 2100 },
        {
          id: 'winSpan',
          kind: 'window',
          usage: 1001,
          storeyId: 's0',
          spansStoreys: ['s0', 's1'],
          anchor: { a: { x: 1500, y: 200 }, b: { x: 3000, y: 200 } },
          sill: 900,
          height: 1300,
        },
      ],
      tic: [
        { x: 0, y: 0, z: Z0 },
        { x: 12000, y: 0, z: Z0 },
        { x: 12000, y: 8000, z: Z0 },
        { x: 0, y: 8000, z: Z0 },
      ],
    });

    const brep = generateBrep(project, project.buildings[0]);
    const outerFloors = brep.shell.lod2Surfaces.filter((s) => s.tag === 'OuterFloorSurface');
    const outerCeilings = brep.shell.lod2Surfaces.filter((s) => s.tag === 'OuterCeilingSurface');
    expect(outerFloors.length).toBeGreaterThan(0);
    expect(outerCeilings.length).toBeGreaterThan(0);

    const oaRoom = brep.rooms.find((r) => r.designId === 'pOaExt')!;
    expect(oaRoom.surfaces.some((s) => s.tag === 'WallSurface')).toBe(true);

    const r0 = brep.rooms.find((r) => r.designId === 'p0')!;
    const r1 = brep.rooms.find((r) => r.designId === 'p1')!;
    expect(r0.surfaces.flatMap((s) => s.openings).length).toBeGreaterThan(0);
    expect(r1.surfaces.flatMap((s) => s.openings).length).toBeGreaterThan(0);

    const out = writeCityGml(project, brep, codelists);
    expect(out.xml).toContain('<bldg:OuterFloorSurface>');
    expect(out.xml).toContain('<bldg:OuterCeilingSurface>');
    const parsed = parseCityGmlModel(out.xml, out.fileName, codelists);
    const rep = validateCityGml(out.xml, out.fileName, parsed, codelists);
    expect(hErrors(rep)).toEqual([]);
  });

  it('emitStoreyObject === false olan çatı arası katı için K_ nesnesi üretmez ve OA storeyObjectReference = -1 yazar (§4.2)', () => {
    const kOutline = rect(0, 0, 10000, 8000);
    const project = makeBaseProject({
      storeys: [
        { id: 's0', storeyNumber: 'Z', zBottom: Z0, height: 3000, slabThickness: 200, outline: [kOutline] },
        { id: 'sAttic', storeyNumber: '1', zBottom: Z0 + 3000, height: 2800, slabThickness: 200, outline: [kOutline], emitStoreyObject: false, clipToRoof: true, kneeWallHeight: 2000 },
      ],
      sectionParts: [
        { id: 'sp0', sectionId: 'sec1', storeyId: 's0', usage: 1001, outline: kOutline },
        { id: 'spAttic', sectionId: 'sec1', storeyId: 'sAttic', groupStoreyId: 's0', usage: 1004, outline: kOutline, clipToRoof: true },
      ],
      parts: [
        { id: 'p0', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1001, polygon: rect(200, 200, 9800, 7800), planArea: -1 },
        { id: 'pAttic', kind: 'BBK', storeyId: 'sAttic', sectionPartIds: ['spAttic'], usage: 1001, polygon: rect(200, 200, 6000, 7800), planArea: -1, clipToRoof: true },
        { id: 'oaAttic', kind: 'OA', storeyId: 'sAttic', sectionPartIds: [], usage: 1022, polygon: rect(6200, 200, 9800, 7800), planArea: -1, clipToRoof: true },
      ],
      roof: { mode: 'gable', eaveOverhang: 0, thickness: 200, pitchDeg: 20 },
    });

    const brep = generateBrep(project, project.buildings[0]);
    expect(brep.storeys).toHaveLength(1);
    expect(brep.shell.storeysAboveGround).toBe(1);

    const out = writeCityGml(project, brep, codelists);
    const parsed = parseCityGmlModel(out.xml, out.fileName, codelists);
    const oaObj = parsed.objects.find((o) => o.prefix === 'OA_')!;
    expect(oaObj.attributesMap.storeyObjectReference).toBe('-1');
    const rep = validateCityGml(out.xml, out.fileName, parsed, codelists);
    expect(hErrors(rep)).toEqual([]);
  });
});

describe('KONTROL-M8 — R1..R4 gerileme ve kabul testleri', () => {
  it('R1 (Ornek2 eşdeğeri): en üst kata zFloorOverride ile bağlı çatı arası BB (1004) ve eğik tavanlı odalar kapalı kabuk üretir, hacim ±0.05 m³, B-OP-02 = 0', () => {
    const kOutline = rect(0, 0, 10000, 8000);
    const roomPoly = rect(200, 200, 9800, 7800);
    const zKat2Bottom = 957850; // Kat_2: zFloorTop = 958050, zCeiling = 960850
    const zAtticBbBottom = 960850;
    const zAtticRoomFloor = 961000;
    // Beşik çatı yüzleri: y = 200..7800 üzerinde x = 5000 mahyasında 963011 mm, yanlarda (x=200, x=9800) 962187 mm
    const westCeilFacet = [
      { x: 200, y: 200, z: 962187 },
      { x: 5000, y: 200, z: 963011 },
      { x: 5000, y: 7800, z: 963011 },
      { x: 200, y: 7800, z: 962187 },
    ];
    const eastCeilFacet = [
      { x: 5000, y: 200, z: 963011 },
      { x: 9800, y: 200, z: 962187 },
      { x: 9800, y: 7800, z: 962187 },
      { x: 5000, y: 7800, z: 963011 },
    ];
    const roofWest = [
      { x: 0, y: 0, z: 962153 },
      { x: 5000, y: 0, z: 963011 },
      { x: 5000, y: 8000, z: 963011 },
      { x: 0, y: 8000, z: 962153 },
    ];
    const roofEast = [
      { x: 5000, y: 0, z: 963011 },
      { x: 10000, y: 0, z: 962153 },
      { x: 10000, y: 8000, z: 962153 },
      { x: 5000, y: 8000, z: 963011 },
    ];

    const project = makeBaseProject({
      storeys: [{ id: 's2', storeyNumber: '2', zBottom: zKat2Bottom, height: 3000, slabThickness: 200, outline: [kOutline] }],
      sectionParts: [
        { id: 'spLower', sectionId: 'sec1', storeyId: 's2', usage: 1001, outline: kOutline },
        { id: 'spAttic', sectionId: 'sec1', storeyId: 's2', usage: 1004, outline: kOutline, zFloorOverride: zAtticBbBottom, zTopOverride: 963011 },
      ],
      parts: [
        { id: 'pLower', kind: 'BBK', storeyId: 's2', sectionPartIds: ['spLower'], usage: 1001, polygon: roomPoly, planArea: -1 },
        {
          id: 'pAttic',
          kind: 'BBK',
          storeyId: 's2',
          sectionPartIds: ['spAttic'],
          usage: 1005,
          polygon: roomPoly,
          planArea: -1,
          zFloorOverride: zAtticRoomFloor,
          zTopOverride: 963011,
          ceilingFaces: [
            { outer: westCeilFacet, holes: [] },
            { outer: eastCeilFacet, holes: [] },
          ],
        },
      ],
      openings: [
        // Alt kat (958050..960850) kapı ve penceresi
        {
          id: 'doorLower',
          kind: 'door',
          usage: 1003,
          storeyId: 's2',
          hostPartId: 'pLower',
          anchor: { a: { x: 1000, y: 200 }, b: { x: 1900, y: 200 } },
          sill: 10,
          height: 2100,
        },
        {
          id: 'winLower',
          kind: 'window',
          usage: 1001,
          storeyId: 's2',
          hostPartId: 'pLower',
          anchor: { a: { x: 4200, y: 200 }, b: { x: 5800, y: 200 } },
          sill: 900,
          height: 1500,
        },
        // Çatı arası (961000..963011) penceresi — aynı (x, y) duvarında ve mahya (x = 5000) altında!
        {
          id: 'winAttic',
          kind: 'window',
          usage: 1001,
          storeyId: 's2',
          hostPartId: 'pAttic',
          zBaseOverride: zAtticRoomFloor,
          anchor: { a: { x: 4400, y: 200 }, b: { x: 5600, y: 200 } },
          sill: 300,
          height: 800,
        },
      ],
      roof: {
        mode: 'manual',
        eaveOverhang: 0,
        thickness: 200,
        pitchDeg: 10,
        facets: [
          { outer: roofWest, holes: [] },
          { outer: roofEast, holes: [] },
        ],
      },
      tic: [
        { x: 0, y: 0, z: zKat2Bottom },
        { x: 10000, y: 0, z: zKat2Bottom },
        { x: 10000, y: 8000, z: zKat2Bottom },
        { x: 0, y: 8000, z: zKat2Bottom },
      ],
    });

    const brep = generateBrep(project, project.buildings[0]);
    expect(brep.issues.filter((i) => i.code === 'B-OP-02')).toEqual([]);
    expect(brep.issues.filter((i) => i.severity === 'H')).toEqual([]);

    for (const r of brep.rooms) {
      const sh = checkShell(r);
      expect(sh.closed, `${r.designId} openEdges=${sh.openEdges}`).toBe(true);
    }

    // Çatı arası odasının analitik hacmi: taban 9.6 m × 7.6 m = 72.96 m², ortalama yükseklik ((962.187 + 963.011)/2 − 961.000) = 1.599 m → 116.66 m³
    const expectedAtticVol = 9.6 * 7.6 * ((962.187 + 963.011) / 2 - 961.0);
    const atticRoom = brep.rooms.find((r) => r.designId === 'pAttic')!;
    expect(Math.abs(atticRoom.attributes.volume - expectedAtticVol)).toBeLessThanOrEqual(0.05);

    // GML yazımı → okuma → yeniden çıkarma → yeniden üretim round-trip (Ornek2 akışı)
    const out1 = writeCityGml(project, brep, codelists);
    const parsed1 = parseCityGmlModel(out1.xml, out1.fileName, codelists);
    const rep1 = validateCityGml(out1.xml, out1.fileName, parsed1, codelists);
    expect(hErrors(rep1)).toEqual([]);

    const extracted = designFromImportedModel(parsed1).project;
    const brep2 = generateBrep(extracted, extracted.buildings[0]);
    expect(brep2.issues.filter((i) => i.code === 'B-OP-02')).toEqual([]);
    for (const r of brep2.rooms) {
      expect(checkShell(r).closed).toBe(true);
    }
    const out2 = writeCityGml(extracted, brep2, codelists);
    const parsed2 = parseCityGmlModel(out2.xml, out2.fileName, codelists);
    const rep2 = validateCityGml(out2.xml, out2.fileName, parsed2, codelists);
    expect(hErrors(rep2)).toEqual([]);
  });

  it('R2 (Ornek3 eşdeğeri): iki ardışık kat sınırı 1 mm farklı olduğunda diken/kendini kesen OuterFloor üretilmez, V-034 = 0', () => {
    const lowerOutline = rect(0, 0, 10000, 8000);
    // Üst kat bir kenarda yalnızca 1 mm içeride ve bir köşede 1 mm ileri-geri diken oluşturacak biçimde hafif kayık
    const upperOutline: Poly2 = {
      outer: [
        { x: 0, y: 1 },
        { x: 10000, y: 0 },
        { x: 10000, y: 8000 },
        { x: 0, y: 8000 },
      ],
      holes: [],
    };
    const diff = subtractPolygons2D([lowerOutline], [upperOutline]);
    expect(diff).toHaveLength(0);

    const project = makeBaseProject({
      storeys: [
        { id: 's0', storeyNumber: 'Z', zBottom: Z0, height: 3000, slabThickness: 200, outline: [lowerOutline] },
        { id: 's1', storeyNumber: '1', zBottom: Z0 + 3000, height: 3000, slabThickness: 200, outline: [upperOutline] },
      ],
      sectionParts: [
        { id: 'sp0', sectionId: 'sec1', storeyId: 's0', usage: 1001, outline: lowerOutline },
        { id: 'sp1', sectionId: 'sec1', storeyId: 's1', groupStoreyId: 's0', usage: 1001, outline: upperOutline },
      ],
      parts: [
        { id: 'p0', kind: 'BBK', storeyId: 's0', sectionPartIds: ['sp0'], usage: 1001, polygon: rect(200, 200, 9800, 7800), planArea: -1 },
        { id: 'p1', kind: 'BBK', storeyId: 's1', sectionPartIds: ['sp1'], usage: 1001, polygon: rect(200, 200, 9800, 7800), planArea: -1 },
      ],
    });
    const brep = generateBrep(project, project.buildings[0]);
    const out = writeCityGml(project, brep, codelists);
    const parsed = parseCityGmlModel(out.xml, out.fileName, codelists);
    const rep = validateCityGml(out.xml, out.fileName, parsed, codelists);
    expect(rep.findings.filter((f) => f.ruleId === 'V-034')).toEqual([]);
    expect(hErrors(rep)).toEqual([]);
  });

  it('R3 (V-217): açık oda kabuğunu (duvar tepesi tavana ulaşmayan oda) HATA olarak yakalar', () => {
    const project = makeBaseProject({});
    const brep = generateBrep(project, project.buildings[0]);
    const out = writeCityGml(project, brep, codelists);
    // Oda tavanını 1500 mm yukarı taşıyıp duvarları eski kotta bırakalım (R1 öncesi açık kabuk durumu)
    const ceilMatch = out.xml.match(/<bldg:CeilingSurface>[\s\S]*?<\/bldg:CeilingSurface>/);
    expect(ceilMatch).not.toBeNull();
    const mutatedCeil = ceilMatch![0].replace(/103\.000/g, '104.500');
    const brokenXml = out.xml.replace(ceilMatch![0], mutatedCeil);
    const parsed = parseCityGmlModel(brokenXml, out.fileName, codelists);
    const rep = validateCityGml(brokenXml, out.fileName, parsed, codelists);
    const v217 = rep.findings.filter((f) => f.ruleId === 'V-217' && f.severity === 'H');
    expect(v217.length).toBeGreaterThan(0);
  });

  it('R4 (Ornek2 çakışan açıklıklar): aynı duvar diliminde üst üste binen balkon kapısı ve pencereyi kırpar/eler, V-035 ve V-039 = 0', () => {
    // Kaynak modelde aynı duvarda [1000..1900] kapı ve [1800..3000] pencere (100 mm yatay binme) olsun
    const project = makeBaseProject({
      openings: [
        { id: 'd1', kind: 'door', usage: 1003, storeyId: 's0', anchor: { a: { x: 1000, y: 200 }, b: { x: 1900, y: 200 } }, sill: 10, height: 2100 },
        { id: 'w1', kind: 'window', usage: 1001, storeyId: 's0', anchor: { a: { x: 2200, y: 200 }, b: { x: 3200, y: 200 } }, sill: 900, height: 1200 },
      ],
    });
    const brep = generateBrep(project, project.buildings[0]);
    const out = writeCityGml(project, brep, codelists);
    // GML içindeki pencerenin başlangıç X koordinatını (500002.200) kapının içine (500001.800) çekerek çakışan kaynak GML oluşturalım
    const overlappingXml = out.xml.replace(/500002\.200/g, '500001.800');
    const parsedOverlap = parseCityGmlModel(overlappingXml, out.fileName, codelists);
    const extracted = designFromImportedModel(parsedOverlap);
    expect(extracted.notes.some((n) => n.message.includes('çakışma') || n.message.includes('üst üste'))).toBe(true);

    const regenBrep = generateBrep(extracted.project, extracted.project.buildings[0]);
    const regenOut = writeCityGml(extracted.project, regenBrep, codelists);
    const regenParsed = parseCityGmlModel(regenOut.xml, regenOut.fileName, codelists);
    const regenRep = validateCityGml(regenOut.xml, regenOut.fileName, regenParsed, codelists);
    expect(regenRep.findings.filter((f) => f.ruleId === 'V-035' || f.ruleId === 'V-039')).toEqual([]);
    expect(hErrors(regenRep)).toEqual([]);
  });
});

