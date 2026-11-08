// M6 — Geometri motoru II ve GML yazımı (şartname §3, §5.8–§5.11; kabul: "Ornek6 altın testi tam; kendi doğrulayıcısında sıfır hata")
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { offsetRing } from '../brep/building.ts';
import { generateBrep } from '../brep/generate.ts';
import { checkShell } from '../brep/shellCheck.ts';
import { DEFAULT_BREP_OPTIONS, ORNEK6_BREP_OPTIONS, type BrepObject } from '../brep/types.ts';
import { createCodelistRegistryFromXmlMap, OFFICIAL_CODELIST_NAMES, type OfficialCodelistName } from '../codelists/index.ts';
import { designFromImportedModel } from '../design/fromImported.ts';
import { ringAreaM2 } from '../design/geometry2d.ts';
import type { DesignBuilding, DesignProject, Pt2, Roof } from '../design/types.ts';
import { fmtMm, writeCityGml } from '../gml/cityGmlWriter.ts';
import { parseCityGmlModel, type ImportedModel } from '../gml/gmlReader.ts';
import { validateCityGml } from '../validation/index.ts';

const xmlMap = {} as Record<OfficialCodelistName, string>;
for (const n of OFFICIAL_CODELIST_NAMES) xmlMap[n] = fs.readFileSync(path.resolve(process.cwd(), 'resources', 'codelists', `${n}.xml`), 'utf-8');
const registry = createCodelistRegistryFromXmlMap(xmlMap);
const ORNEK6 = fs.readFileSync(path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'), 'utf-8');
const src = parseCityGmlModel(ORNEK6, 'M-70125626-A.gml', registry);
const golden = designFromImportedModel(src);
const gp = golden.project;
const gb = gp.buildings[0];

const produce = (p: DesignProject, opts = ORNEK6_BREP_OPTIONS) => {
  const brep = generateBrep(p, p.buildings[0], opts);
  const out = writeCityGml(p, brep, registry);
  const model = parseCityGmlModel(out.xml, out.fileName, registry);
  const report = validateCityGml(out.xml, out.fileName, model, registry);
  return { brep, out, model, report };
};
const A = produce(gp);
const count = (m: ImportedModel, p: string) => m.objects.filter((o) => o.prefix === p).length;
const hErrors = (r: ReturnType<typeof produce>['report']) => r.findings.filter((f) => f.severity === 'H').map((f) => `${f.ruleId}: ${f.message}`);

describe('M6 — Ornek6 altın testi, tam (§10.4)', () => {
  it('Çıkarma: 4 balkon (4.30/16.38 m², korkuluk 1000 × 100 mm), 66 yüzlü elle çatı, 14 noktalı TIC, bina öznitelikleri', () => {
    expect(golden.notes).toEqual([]);
    const b = gb.balconies ?? [];
    expect(b.length).toBe(4);
    expect(b.map((x) => Math.round(ringAreaM2(x.outline) * 100) / 100).sort()).toEqual([16.38, 16.38, 4.3, 4.3]);
    expect(b.every((x) => x.parapetHeight === 1000 && Math.abs(x.parapetThickness - 100) <= 2)).toBe(true);
    expect(b.map((x) => x.attachedEdges.length).sort()).toEqual([1, 1, 2, 2]);
    expect(gb.roof?.mode).toBe('manual');
    expect(gb.roof?.facets?.length).toBe(66);
    expect(gb.tic?.length).toBe(14);
    expect(gb.info).toMatchObject({ maksIdentityNumber: 431289685, buildingType: 1001, geometrySuitability: [1006], elevatorCount: 0, buildingHeight: 7.45, architecturalProjectConfirmationDate: '1999-12-09' });
  });
  it('Nesne sayıları birebir: MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38, MBG 1', () => {
    const m = A.model;
    expect(['MB_', 'K_', 'BB_', 'BBK_', 'OA_', 'BLKN_', 'KAPI_', 'PEN_', 'MBG_'].map((p) => count(m, p))).toEqual([1, 2, 2, 16, 0, 4, 44, 38, 1]);
  });
  it('Kendi doğrulayıcısında sıfır HATA ve sıfır UYARI (Biçim A = Ornek6, Biçim B = varsayılan); üretim uyarısı yok', () => {
    expect(A.brep.issues).toEqual([]);
    expect(A.report.regime).toBe('S');
    expect(hErrors(A.report)).toEqual([]);
    expect(A.report.counts.U).toBe(0);
    const B = produce(gp, DEFAULT_BREP_OPTIONS);
    expect(hErrors(B.report)).toEqual([]);
    expect(B.report.counts.U).toBe(0);
  });
  it('Öznitelikler kaynakla aynı: her nesnenin adı ve öznitelikleri (alanlar ±0.01, hacim ±0.05)', () => {
    const sig = (m: ImportedModel, prefix: string) =>
      m.objects
        .filter((o) => o.prefix === prefix)
        .map((o) => `${o.gmlName}|${o.attributes.filter((a) => !/Reference$|^(calculatedArea|volume)$/.test(a.name)).map((a) => `${a.name}=${a.cleanValue}`).sort().join(',')}`)
        .sort();
    for (const p of ['MB_', 'K_', 'BB_', 'BBK_', 'BLKN_', 'KAPI_', 'PEN_', 'MBG_']) expect(sig(A.model, p), p).toEqual(sig(src, p));
    const near = (m: ImportedModel, p: string, name: string) => m.objects.filter((o) => o.prefix === p).map((o) => Number(o.attributesMap[name])).sort((a, b) => a - b);
    const a1 = near(src, 'BBK_', 'calculatedArea');
    near(A.model, 'BBK_', 'calculatedArea').forEach((v, i) => expect(Math.abs(v - a1[i])).toBeLessThanOrEqual(0.01 + 1e-9));
    const v1 = near(src, 'BBK_', 'volume');
    near(A.model, 'BBK_', 'volume').forEach((v, i) => expect(Math.abs(v - v1[i])).toBeLessThanOrEqual(0.05 + 1e-9));
    expect(near(A.model, 'BLKN_', 'calculatedArea')).toEqual(near(src, 'BLKN_', 'calculatedArea'));
  });
  it('§5.11: FootPrint ve RoofEdge 91.34 m² (1095.900 / 1101.500); LoD1 10 yüz; LoD2 Roof 66, Wall 16, Ground 1; roofProjectionArea 120.79', () => {
    const polys = (m: ImportedModel, prefix: string) => m.polygons.filter((p) => p.prefix === prefix);
    for (const [k, z] of [['Lod0FootPrint_', 1095.9], ['Lod0RoofEdge_', 1101.5]] as const) {
      expect(polys(A.model, k).length).toBe(1);
      expect(polys(A.model, k)[0].areaM2).toBeCloseTo(91.34, 2);
      expect(polys(A.model, k)[0].minZ).toBeCloseTo(z, 3);
    }
    expect(polys(A.model, 'Lod1Poligon_').length).toBe(10);
    const mb = A.model.objects.find((o) => o.prefix === 'MB_')!;
    const lod2 = (prefix: string) => mb.xlinkPolygonHrefs.filter((h) => h.replace(/^#/, '').startsWith(prefix)).length;
    expect([lod2('Roof_'), lod2('Wall_'), lod2('Ground_')]).toEqual([66, 16, 1]);
    expect(mb.attributesMap.roofProjectionArea).toBe('120.79');
    expect(mb.attributesMap.buildingHeight).toBe('7.45');
    expect(A.model.storeysAboveGround).toBe(2);
    expect(A.model.storeysBelowGround).toBe(0);
  });
  it('§5.10: LoD2 dış duvarları kat altından kat tavanına; 27 T1 açıklığı duvar yüzeylerinde (8 kapı + 19 pencere)', () => {
    const walls = A.brep.shell.lod2Surfaces.filter((s) => s.tag === 'WallSurface');
    expect(walls.length).toBe(16);
    expect(walls.map((w) => [w.polygons[0].outer[0].z, w.polygons[0].outer[2].z].join('-')).sort()).toEqual([...Array(8).fill('1095900-1098700'), ...Array(8).fill('1098700-1101500')]);
    const ops = walls.flatMap((w) => w.openings);
    expect([ops.filter((o) => o.prefix === 'KAPI_').length, ops.filter((o) => o.prefix === 'PEN_').length]).toEqual([8, 19]);
  });
  it('Envelope kaynakla ±1 mm aynı; TIC kapalı 15 nokta, kotu 1095.900', () => {
    const e1 = src.envelope;
    const e2 = A.model.envelope;
    for (const k of ['minE', 'minN', 'minZ', 'maxE', 'maxN', 'maxZ'] as const) expect(Math.abs(e1[k] - e2[k])).toBeLessThanOrEqual(0.001);
    expect(A.model.ticLineStrings.length).toBe(1);
    expect(A.model.ticLineStrings[0].vertices.length).toBe(15);
    expect(A.model.ticLineStrings[0].isClosed).toBe(true);
  });
  it('§5.8 balkon: taban kutusu 1095.900–1096.100, korkuluk 1096.100–1097.100; kapak 8/10 köşe (U şekli); ayrı WallSurface’ler', () => {
    for (const b of A.brep.shell.balconies) {
      const floor = b.surfaces.find((s) => s.tag === 'FloorSurface')!.polygons;
      const walls = b.surfaces.filter((s) => s.tag === 'WallSurface');
      const n = (gb.balconies ?? []).find((x) => x.id === b.designId)!.outline.length;
      expect(floor.length).toBe(2 + n);
      expect(walls.every((w) => w.polygons.length === 1)).toBe(true);
      const cap = walls.map((w) => w.polygons[0]).find((p) => p.outer.every((q) => q.z === p.outer[0].z))!;
      expect([8, 10]).toContain(cap.outer.length);
      expect(walls.length).toBe(1 + cap.outer.length);
    }
    expect(A.brep.shell.balconies.map((b) => b.attributes.calculatedArea).sort()).toEqual([16.38, 16.38, 4.3, 4.3]);
  });
  it('Biçim (§3.1, K70): CRLF, BOM yok, utf-8 bildirimi, posList, tam 3 ondalık; iki yazım bayt bayt aynı', () => {
    const x = A.out.xml;
    expect(x.startsWith('<?xml version="1.0" encoding="utf-8"?>\r\n')).toBe(true);
    expect(x.charCodeAt(0)).not.toBe(0xfeff);
    expect(/[^\r]\n/.test(x)).toBe(false);
    expect(x.includes('<gml:pos>')).toBe(false);
    const nums = [...x.matchAll(/<gml:posList>([^<]*)<\/gml:posList>/g)].flatMap((m) => m[1].split(' '));
    expect(nums.every((v) => /^-?\d+\.\d{3}$/.test(v))).toBe(true);
    expect(produce(gp).out.xml).toBe(x);
    expect(A.out.fileName).toBe('M-70125626-A.gml');
    expect(fmtMm(-1234)).toBe('-1.234');
    expect(fmtMm(532568580)).toBe('532568.580');
  });
  it('K88-yeni: GML\'de malik/TC kimlik alanı yok; yalnız beyaz liste öznitelikleri', () => {
    expect(/malik|tcKimlik|hisse/i.test(A.out.xml)).toBe(false);
    expect(A.report.findings.filter((f) => f.ruleId === 'V-060')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------
// Yapay bina: 10 × 6 m, 2 kat, iki oda, kapı + pencere, balkon, parametrik çatı, TIC → sıfırdan GML

const rect = (x0: number, y0: number, x1: number, y1: number): Pt2[] => [
  { x: x0, y: y0 },
  { x: x1, y: y0 },
  { x: x1, y: y1 },
  { x: x0, y: y1 },
];
function synth(roof: Roof): DesignProject {
  const storeys = [0, 1].map((i) => ({ id: `s${i}`, storeyNumber: i === 0 ? 'Z' : '1', zBottom: 100000 + i * 3000, height: 3000, slabThickness: 200, outline: [{ outer: rect(0, 0, 10000, 6000), holes: [] }] }));
  const sections = [0, 1].map((i) => ({ id: `bb${i}`, number: String(i + 1), blockName: '-1', entrance: '', registeredQuality: 'MESKEN', registeredInstallation: '', registeredFloorDefinition: i === 0 ? 'Zemin Kat' : '1. Kat', propertyLot: '1/2', planNetArea: -1, planGrossArea: -1 }));
  const sectionParts = [0, 1].map((i) => ({ id: `sp${i}`, sectionId: `bb${i}`, storeyId: `s${i}`, usage: 1001 as const, outline: { outer: rect(0, 0, 10000, 6000), holes: [] } }));
  const parts = [0, 1].flatMap((i) => [
    { id: `A${i}`, kind: 'BBK' as const, storeyId: `s${i}`, sectionPartIds: [`sp${i}`], usage: 1001, polygon: { outer: rect(200, 200, 4900, 5800), holes: [] }, planArea: -1 },
    { id: `B${i}`, kind: 'BBK' as const, storeyId: `s${i}`, sectionPartIds: [`sp${i}`], usage: 1002, polygon: { outer: rect(5100, 200, 9800, 5800), holes: [] }, planArea: -1 },
  ]);
  const openings = [0, 1].flatMap((i) => [
    { id: `kapi${i}`, kind: 'door' as const, usage: 1004, storeyId: `s${i}`, anchor: { a: { x: 4900, y: 1000 }, b: { x: 4900, y: 1900 } }, sill: 10, height: 2100 },
    { id: `pen${i}`, kind: 'window' as const, usage: 1001, storeyId: `s${i}`, anchor: { a: { x: 1000, y: 200 }, b: { x: 2500, y: 200 } }, sill: 900, height: 1300 },
    { id: `pen2${i}`, kind: 'window' as const, usage: 1001, storeyId: `s${i}`, anchor: { a: { x: 6000, y: 200 }, b: { x: 7500, y: 200 } }, sill: 900, height: 1300 },
    { id: `giris${i}`, kind: 'door' as const, usage: i === 0 ? 1001 : 1003, storeyId: `s${i}`, anchor: { a: { x: 3000, y: 5800 }, b: { x: 3900, y: 5800 } }, sill: 10, height: 2100 },
    { id: `kapiB${i}`, kind: 'door' as const, usage: 1003, storeyId: `s${i}`, anchor: { a: { x: 7000, y: 5800 }, b: { x: 7900, y: 5800 } }, sill: 10, height: 2100 },
  ]);
  const balcony = { id: 'blk', kind: 'Balkon' as const, storeyId: 's1', sectionPartId: 'sp1', outline: rect(10000, 1000, 11500, 5000), attachedEdges: [[{ x: 10000, y: 5000 }, { x: 10000, y: 1000 }] as const], parapetHeight: 1000, parapetThickness: 100, planArea: -1 };
  const building: DesignBuilding = {
    id: 'b',
    letter: 'A',
    storeys,
    sections,
    sectionParts,
    parts,
    openings,
    info: { maksIdentityNumber: 123, maksIntegrationState: 1003, buildingType: 1001, geometrySuitability: [1006], tenderRegistrationNumber: '', architecturalPlanID: '', additionalNote: '-', elevatorCount: 0, buildingHeight: null, architecturalProjectConfirmationDate: '2026-01-15' },
    sectionInfo: Object.fromEntries(sections.map((s, i) => [s.id, { maksIdentityNumber: 1000 + i, maksNumaratajIdentityNumber: 2000 + i, maksIntegrationState: 1003, integrationState: 1004, geometrySuitability: 1001, additionalNote: '-' }])),
    cardinalDirections: { sp0: [1001, 1005], sp1: [1001, 1005] },
    balconies: [balcony],
    roof,
    tic: [...rect(0, 0, 10000, 6000), { x: 10000, y: 0 }].slice(0, 4).map((p) => ({ ...p, z: 100000 })),
  };
  return {
    schemaVersion: 1,
    id: 'yapay',
    name: 'yapay',
    idSeq: 1,
    georef: { epsg: 5254, originE: 500000, originN: 4400000, zeroElevationOrthometric: 0 },
    parcel: { takbisPropertyIdentityNumber: 999, blockNumber: '1', parcelNumber: '2', takbisNeighbourhoodReference: 3 },
    buildings: [building],
  };
}
const asObject = (polys: BrepObject['surfaces'][number]['polygons']): BrepObject => ({ id: 'x', prefix: 'K_', designId: 'x', storeyId: 'x', surfaces: [{ id: 's', tag: 'RoofSurface', polygons: polys, openings: [] }], attributes: {} });

describe('M6 — yapay bina sıfırdan (§10.5 benzeri)', () => {
  for (const mode of ['flat', 'gable', 'hip'] as const) {
    it(`${mode} çatı: kapalı gövde, izdüşüm = saçaklı kontur alanı, GML kendi doğrulayıcısında 0 HATA`, () => {
      const roof: Roof = { mode, eaveOverhang: 500, thickness: 200, pitchDeg: 30 };
      const r = produce(synth(roof), DEFAULT_BREP_OPTIONS);
      expect(r.brep.issues.filter((i) => i.severity === 'H')).toEqual([]);
      const roofPolys = r.brep.shell.lod2Surfaces.find((s) => s.tag === 'RoofSurface')!.polygons;
      expect(checkShell(asObject(roofPolys)).closed).toBe(true);
      expect(r.brep.shell.roofProjectionArea).toBeCloseTo(11 * 7, 2);
      expect(hErrors(r.report)).toEqual([]);
      expect(['MB_', 'K_', 'BB_', 'BBK_', 'BLKN_', 'MBG_'].map((p) => count(r.model, p))).toEqual([1, 2, 2, 4, 1, 1]);
    });
  }
  it('Kırma çatı tepesi = saçak + kalınlık + (W/2)·tan(eğim); bina yüksekliği çatı tepesi − TIC', () => {
    const r = produce(synth({ mode: 'hip', eaveOverhang: 500, thickness: 200, pitchDeg: 30 }), DEFAULT_BREP_OPTIONS);
    const top = Math.max(...r.brep.shell.lod2Surfaces.flatMap((s) => s.polygons.flatMap((p) => p.outer.map((q) => q.z))));
    expect(top).toBe(106000 + 200 + Math.round(3500 * Math.tan(Math.PI / 6)));
    expect(r.brep.shell.buildingHeight).toBeCloseTo((top - 100000) / 1000, 2);
  });
  it('Balkon: bir ortak kenar → U korkuluk 8 köşe, 8 yan yüz; korkuluk yüksekliği 0 → korkuluk yok', () => {
    const r = produce(synth({ mode: 'flat', eaveOverhang: 0, thickness: 200, pitchDeg: 0 }), DEFAULT_BREP_OPTIONS);
    const b = r.brep.shell.balconies[0];
    const walls = b.surfaces.filter((s) => s.tag === 'WallSurface');
    expect(walls.length).toBe(9);
    const p0 = synth({ mode: 'flat', eaveOverhang: 0, thickness: 200, pitchDeg: 0 });
    const noRail = { ...p0, buildings: [{ ...p0.buildings[0], balconies: [{ ...p0.buildings[0].balconies![0], parapetHeight: 0 }] }] };
    const r2 = generateBrep(noRail, noRail.buildings[0]);
    expect(r2.shell.balconies[0].surfaces.filter((s) => s.tag === 'WallSurface').length).toBe(0);
  });
  it('Dikdörtgen olmayan planda beşik çatı reddedilir (B-CAT-04); saçak ofseti gönye köşeli', () => {
    const p = synth({ mode: 'gable', eaveOverhang: 0, thickness: 200, pitchDeg: 30 });
    const L: Pt2[] = [{ x: 0, y: 0 }, { x: 10000, y: 0 }, { x: 10000, y: 6000 }, { x: 5000, y: 6000 }, { x: 5000, y: 3000 }, { x: 0, y: 3000 }];
    const b = { ...p.buildings[0], storeys: p.buildings[0].storeys.map((s) => ({ ...s, outline: [{ outer: L, holes: [] }] })), balconies: [], openings: [] };
    expect(generateBrep({ ...p, buildings: [b] }, b).issues.map((i) => i.code)).toContain('B-CAT-04');
    expect(offsetRing(rect(0, 0, 1000, 1000), 100)).toEqual(rect(-100, -100, 1100, 1100));
    // İç (reflex) köşe (5000, 3000): dış taraf sol-üst çeyrek → (4900, 3100)
    expect(offsetRing(L, 100)[4]).toEqual({ x: 4900, y: 3100 });
    expect(offsetRing(L, 100)[0]).toEqual({ x: -100, y: -100 });
  });
});
