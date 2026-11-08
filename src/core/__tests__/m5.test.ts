// M5 — Geometri motoru I testleri (şartname §5.1–§5.7, §5.12; kabul: "Ornek6 altın testi (çatı hariç)", §10.4)
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateBrep, resolveOpenings, round2 } from '../brep/generate.ts';
import { checkShell, polygonsOf } from '../brep/shellCheck.ts';
import { DEFAULT_BREP_OPTIONS, ORNEK6_BREP_OPTIONS, type BrepObject, type BrepOpening, type Pt3 } from '../brep/types.ts';
import { createCodelistRegistryFromXmlMap, OFFICIAL_CODELIST_NAMES, type OfficialCodelistName } from '../codelists/index.ts';
import { designFromImportedModel } from '../design/fromImported.ts';
import { parseProject, serializeProject } from '../design/projectFile.ts';
import type { DesignProject, Opening, Pt2 } from '../design/types.ts';
import { parseCityGmlModel, type ImportedPolygon } from '../gml/gmlReader.ts';

const xmlMap = {} as Record<OfficialCodelistName, string>;
for (const n of OFFICIAL_CODELIST_NAMES) xmlMap[n] = fs.readFileSync(path.resolve(process.cwd(), 'resources', 'codelists', `${n}.xml`), 'utf-8');
const registry = createCodelistRegistryFromXmlMap(xmlMap);
const ORNEK6 = fs.readFileSync(path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'), 'utf-8');
const model = parseCityGmlModel(ORNEK6, 'M-70125626-A.gml', registry);
const golden = designFromImportedModel(model);
const gp = golden.project;
const gb = gp.buildings[0];
const brep = generateBrep(gp, gb, ORNEK6_BREP_OPTIONS);
const EPS = 1e-9;

const srcOf = (designId: string) => model.objectsById[golden.sourceIds.get(designId) ?? ''];
const t4Of = (r: BrepObject) => r.surfaces.flatMap((s) => s.openings);
const allT4 = brep.rooms.flatMap(t4Of);
/** Halka merkezi, TUREF metre. */
const centroidM = (ring: readonly Pt3[]) => {
  const c = ring.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y, z: s.z + p.z }), { x: 0, y: 0, z: 0 });
  return { e: gp.georef.originE + c.x / ring.length / 1000, n: gp.georef.originN + c.y / ring.length / 1000, z: c.z / ring.length / 1000 };
};
const ringZ = (ring: readonly Pt3[]) => ({ min: Math.min(...ring.map((p) => p.z)), max: Math.max(...ring.map((p) => p.z)) });
const firstPoly = (gmlId: string): ImportedPolygon => model.polygonsById[model.objectsById[gmlId].allPolygonIds[0]];

describe('M5 — Ornek6 altın testi, çatı hariç (§10.4)', () => {
  it('Açıklık çıkarma: 41 fiziksel açıklık (19 pencere, 22 kapı); not yok', () => {
    expect(golden.notes).toEqual([]);
    expect(gb.openings?.length).toBe(41);
    expect(gb.openings?.filter((o) => o.kind === 'window').length).toBe(19);
    expect(gb.openings?.filter((o) => o.kind === 'door').every((o) => o.sill === 10)).toBe(true);
  });
  it('§5.2 kot motoru: Kat_Z 1095.900/1096.100/1098.700, Kat_1 1098.700/1098.900/1101.500 (±1 mm)', () => {
    expect(brep.levels.map((l) => [l.zFloorBottom, l.zFloorTop, l.zCeiling])).toEqual([
      [1095900, 1096100, 1098700],
      [1098700, 1098900, 1101500],
    ]);
  });
  it('Nesne sayıları birebir: K 2, BB 2, BBK 16, KAPI 44, PEN 38; LoD2 (T1) 8 kapı + 19 pencere; üretim uyarısı yok', () => {
    expect(brep.storeys.length).toBe(2);
    expect(brep.sectionParts.length).toBe(2);
    expect(brep.rooms.filter((r) => r.prefix === 'BBK_').length).toBe(16);
    const count = (list: readonly BrepOpening[], p: string) => list.filter((o) => o.prefix === p).length;
    expect(count(allT4, 'KAPI_') + count(brep.lod2Openings, 'KAPI_')).toBe(44);
    expect(count(allT4, 'PEN_') + count(brep.lod2Openings, 'PEN_')).toBe(38);
    expect(count(brep.lod2Openings, 'KAPI_')).toBe(8);
    expect(count(brep.lod2Openings, 'PEN_')).toBe(19);
    expect(brep.issues).toEqual([]);
  });
  it('§5.12: her BBK calculatedArea ±0.01, volume ±0.05; BB independentSectionCalculatedArea 91.34 ±0.01', () => {
    for (const r of brep.rooms) {
      const a = srcOf(r.designId).attributesMap;
      expect(Math.abs(r.attributes.calculatedArea - Number(a.calculatedArea))).toBeLessThanOrEqual(0.01 + EPS);
      expect(Math.abs(r.attributes.volume - Number(a.volume))).toBeLessThanOrEqual(0.05 + EPS);
    }
    for (const s of brep.sectionParts) expect(Math.abs(s.attributes.independentSectionCalculatedArea - 91.34)).toBeLessThanOrEqual(0.01 + EPS);
  });
  it('§5.5: oda kabuğu — 1 Floor, 1 Ceiling, kaynaktaki kadar InteriorWallSurface; taban/tavan kotları kaynakla aynı', () => {
    for (const r of brep.rooms) {
      const src = srcOf(r.designId);
      const tags = (list: readonly { tag: string }[], t: string) => list.filter((s) => s.tag === t).length;
      expect(tags(r.surfaces, 'FloorSurface')).toBe(1);
      expect(tags(r.surfaces, 'CeilingSurface')).toBe(1);
      expect(tags(r.surfaces, 'InteriorWallSurface')).toBe(tags(src.surfaces, 'InteriorWallSurface'));
      const fl = r.surfaces.find((s) => s.tag === 'FloorSurface')!.polygons[0];
      const ce = r.surfaces.find((s) => s.tag === 'CeilingSurface')!.polygons[0];
      const srcFloor = model.polygonsById[src.surfaces.find((s) => s.tag === 'FloorSurface')!.polygonIds[0]];
      const srcCeil = model.polygonsById[src.surfaces.find((s) => s.tag === 'CeilingSurface')!.polygonIds[0]];
      expect(Math.abs(fl.outer[0].z - srcFloor.minZ * 1000)).toBeLessThanOrEqual(1);
      expect(Math.abs(ce.outer[0].z - srcCeil.maxZ * 1000)).toBeLessThanOrEqual(1);
    }
  });
  it('§5.4 T4: kaynaktaki 55 oda açıklığının her biri, aynı odada ≤ 3 mm konum ve ±1 mm kotla üretildi', () => {
    let matched = 0;
    for (const r of brep.rooms) {
      const src = srcOf(r.designId);
      const srcOps = model.objects.filter((o) => (o.prefix === 'KAPI_' || o.prefix === 'PEN_') && o.parentGmlId === src.gmlId);
      expect(t4Of(r).length).toBe(srcOps.length);
      for (const so of srcOps) {
        const sp = firstPoly(so.gmlId);
        const hit = t4Of(r).find((g) => {
          const c = centroidM(g.polygon.outer);
          const z = ringZ(g.polygon.outer);
          return g.prefix === so.prefix && Math.hypot(c.e - sp.centroid.e, c.n - sp.centroid.n) <= 0.003 && Math.abs(z.min - sp.minZ * 1000) <= 1 && Math.abs(z.max - sp.maxZ * 1000) <= 1;
        });
        if (hit) matched++;
      }
    }
    expect(matched).toBe(55);
  });
  it('§5.4 T1: kaynaktaki 27 LoD2 açıklığının her biri ≤ 3 mm konum ve ±1 mm kotla üretildi; usage aynı', () => {
    const mbOps = model.objects.filter((o) => (o.prefix === 'KAPI_' || o.prefix === 'PEN_') && model.objectsById[o.parentGmlId ?? '']?.prefix === 'MB_');
    expect(mbOps.length).toBe(27);
    for (const so of mbOps) {
      const sp = firstPoly(so.gmlId);
      const hit = brep.lod2Openings.find((g) => {
        const c = centroidM(g.polygon.outer);
        const z = ringZ(g.polygon.outer);
        return Math.hypot(c.e - sp.centroid.e, c.n - sp.centroid.n) <= 0.003 && Math.abs(z.min - sp.minZ * 1000) <= 1 && Math.abs(z.max - sp.maxZ * 1000) <= 1;
      });
      expect(hit, so.gmlId).toBeDefined();
      expect(hit!.usage).toBe(Number(so.attributesMap.doorUsage ?? so.attributesMap.windowUsage));
    }
  });
  it('§5.5 madde 6: 16/16 oda kabuğu kapalı (açıklık deliği açıklık poligonuyla kapanır); diverjans hacmi = volume ±0.05', () => {
    for (const r of brep.rooms) {
      const sc = checkShell(r);
      expect(sc.closed, srcOf(r.designId).gmlName).toBe(true);
      expect(Math.abs(sc.volumeM3 - r.attributes.volume)).toBeLessThanOrEqual(0.05);
    }
  });
  it('§5.6: BB küveti — 2 Floor_ (alt/üst), üst kapak 8 delikli; açık kenar yalnız döşeme üstünde (alt yüz üretilmez)', () => {
    for (const s of brep.sectionParts) {
      const lv = brep.levels.find((l) => l.storeyId === s.storeyId)!;
      const floors = s.surfaces.find((x) => x.tag === 'FloorSurface')!.polygons;
      expect(floors.map((p) => p.outer[0].z)).toEqual([lv.zFloorBottom, lv.zFloorTop]);
      const cap = s.surfaces.find((x) => x.tag === 'WallSurface')!.polygons.find((p) => p.outer.every((q) => q.z === lv.zCeiling));
      expect(cap?.holes.length).toBe(8);
      const sc = checkShell(s);
      expect(sc.overusedEdges).toBe(0);
      expect(sc.openEdgeZ).toEqual([lv.zFloorTop]);
    }
  });
  it('§5.6 madde 3: BB küvetinde her açıklık için 4 yan yüz (eşik/denizlik, lento, 2 söve)', () => {
    const { resolved } = resolveOpenings(gb);
    for (const s of brep.sectionParts) {
      const lv = brep.levels.find((l) => l.storeyId === s.storeyId)!;
      const inW = resolved.filter((r) => r.sectionPartId === s.designId).length;
      // Ornek6'da kattaki her açıklık BB duvar malzemesinde (Kat_Z 20, Kat_1 21)
      expect(inW).toBe(resolved.filter((r) => r.opening.storeyId === s.storeyId).length);
      expect(inW).toBeGreaterThanOrEqual(20);
      const walls = s.surfaces.find((x) => x.tag === 'WallSurface')!.polygons;
      const flat = walls.filter((p) => p.outer.every((q) => q.z === p.outer[0].z) && p.outer[0].z !== lv.zCeiling);
      expect(flat.length).toBe(2 * inW); // eşik/denizlik + lento
      const holes = walls.reduce((n, p) => n + (p.outer[0].z === lv.zCeiling ? 0 : p.holes.length), 0);
      expect(holes).toBe(2 * inW); // iki yüzde delik
      // dikey: dış halka kenarları (8) + 8 oda × 4 kenar + 2 söve × açıklık
      expect(walls.length - flat.length - 1).toBe(8 + 32 + 2 * inW);
    }
  });
  it('§5.7 Biçim A (Ornek6): kat başına 1 Floor_ ve 8 dış duvar; dış duvar delikleri = o kattaki EXT açıklık sayısı (T2)', () => {
    for (const k of brep.storeys) {
      const floors = k.surfaces.find((x) => x.tag === 'FloorSurface')!.polygons;
      const walls = k.surfaces.find((x) => x.tag === 'WallSurface')!.polygons;
      expect(floors.length).toBe(1);
      expect(walls.length).toBe(8);
      const ext = brep.lod2Openings.filter((o) => gb.openings!.find((x) => x.id === o.designOpeningId)?.storeyId === k.storeyId).length;
      expect(walls.reduce((s, w) => s + w.holes.length, 0)).toBe(ext);
    }
  });
  it('§5.1: deterministik (iki üretim birebir), kimlikler benzersiz, tüm koordinatlar mm tamsayı', () => {
    const again = generateBrep(gp, gb, ORNEK6_BREP_OPTIONS);
    expect(JSON.stringify(again)).toBe(JSON.stringify(brep));
    const objs = [...brep.storeys, ...brep.sectionParts, ...brep.rooms];
    const ids = [...objs.map((o) => o.id), ...objs.flatMap((o) => o.surfaces.map((s) => s.id)), ...objs.flatMap(polygonsOf).map((p) => p.id), ...allT4.map((o) => o.id), ...brep.lod2Openings.flatMap((o) => [o.id, o.polygon.id])];
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of objs.flatMap(polygonsOf)) for (const r of [p.outer, ...p.holes]) for (const q of r) expect(Number.isInteger(q.x) && Number.isInteger(q.y) && Number.isInteger(q.z)).toBe(true);
  });
  it('Biçim B (varsayılan): döşeme kutusu + kenar yüzleri; odalar yine kapalı; uyarı yok', () => {
    const b = generateBrep(gp, gb, DEFAULT_BREP_OPTIONS);
    expect(b.issues).toEqual([]);
    for (const k of b.storeys) expect(k.surfaces.find((x) => x.tag === 'FloorSurface')!.polygons.length).toBe(2 + 8);
    for (const r of b.rooms) expect(checkShell(r).closed).toBe(true);
  });
  it('§5.12 yuvarlama: half away from zero', () => {
    expect(round2(2.345)).toBe(2.35);
    expect(round2(-2.345)).toBe(-2.35);
    expect(round2(40.8611)).toBe(40.86);
  });
});

// ---------------------------------------------------------------------------------------------
// Yapay plan: 10 × 6 m, iki oda, 200 mm duvarlar; oda arası kapı + dış pencere.

const rect = (x0: number, y0: number, x1: number, y1: number): Pt2[] => [
  { x: x0, y: y0 },
  { x: x1, y: y0 },
  { x: x1, y: y1 },
  { x: x0, y: y1 },
];
function synth(openings: Opening[]): DesignProject {
  return {
    schemaVersion: 1,
    id: 'p',
    name: 'yapay',
    idSeq: 10,
    georef: { epsg: 5254, originE: 500000, originN: 4400000, zeroElevationOrthometric: 0 },
    parcel: { takbisPropertyIdentityNumber: 1, blockNumber: '1', parcelNumber: '1', takbisNeighbourhoodReference: 1 },
    buildings: [
      {
        id: 'b',
        letter: 'A',
        storeys: [{ id: 's', storeyNumber: 'Z', zBottom: 100000, height: 3000, slabThickness: 200, outline: [{ outer: rect(0, 0, 10000, 6000), holes: [] }] }],
        sections: [{ id: 'bb', number: '1', blockName: '-1', entrance: '', registeredQuality: 'MESKEN', registeredInstallation: '', registeredFloorDefinition: '', propertyLot: '1/1', planNetArea: -1, planGrossArea: -1 }],
        sectionParts: [{ id: 'sp', sectionId: 'bb', storeyId: 's', usage: 1001, outline: { outer: rect(0, 0, 10000, 6000), holes: [] } }],
        parts: [
          { id: 'A', kind: 'BBK', storeyId: 's', sectionPartIds: ['sp'], usage: 1001, polygon: { outer: rect(200, 200, 4900, 5800), holes: [] }, planArea: -1 },
          { id: 'B', kind: 'BBK', storeyId: 's', sectionPartIds: ['sp'], usage: 1001, polygon: { outer: rect(5100, 200, 9800, 5800), holes: [] }, planArea: -1 },
        ],
        openings,
      },
    ],
  };
}
const door: Opening = { id: 'kapi', kind: 'door', usage: 1004, storeyId: 's', anchor: { a: { x: 4900, y: 1000 }, b: { x: 4900, y: 1900 } }, sill: 10, height: 2100 };
const win: Opening = { id: 'pen', kind: 'window', usage: 1001, storeyId: 's', anchor: { a: { x: 1000, y: 200 }, b: { x: 2500, y: 200 } }, sill: 900, height: 1300 };

describe('M5 — yapay plan (§5.4 açıklık çözümleme, §5.6 küvet)', () => {
  const p = synth([door, win]);
  const b = generateBrep(p, p.buildings[0]);
  it('Oda arası kapı: duvar kalınlığı 200, iki odada T4, BB küvetinde (T3); dış pencere: T4 + T1 + T2', () => {
    const { resolved } = resolveOpenings(p.buildings[0]);
    const d = resolved.find((r) => r.opening.id === 'kapi')!;
    expect(d.partFaces.map((f) => f.partId).sort()).toEqual(['A', 'B']);
    expect(d.extLine).toBeNull();
    expect(d.sectionPartId).toBe('sp');
    expect(d.lines[1]).toEqual([
      { x: 5100, y: 1000 },
      { x: 5100, y: 1900 },
    ]);
    const w = resolved.find((r) => r.opening.id === 'pen')!;
    expect(w.partFaces.map((f) => f.partId)).toEqual(['A']);
    expect(w.extLine).toBe(1);
    expect(b.lod2Openings.length).toBe(1);
    expect(b.rooms.flatMap(t4Of).length).toBe(3);
    // Yapay planda TIC girilmedi (M6 uyarısı B-TIC-01); başka uyarı yok
    expect(b.issues.filter((i) => i.code !== 'B-TIC-01')).toEqual([]);
  });
  it('Kapı deliği zFloorTop + 10 mm (K45a): delik duvar alt kenarına değmez; eşik yüzü üretilir', () => {
    const roomA = b.rooms.find((r) => r.designId === 'A')!;
    const d = t4Of(roomA).find((o) => o.designOpeningId === 'kapi')!;
    expect(ringZ(d.polygon.outer)).toEqual({ min: 100210, max: 102310 });
    const tub = b.sectionParts[0];
    const sill = tub.surfaces.flatMap((s) => s.polygons).find((q) => q.kind === 'Wall_' && q.outer.every((v) => v.z === 100210) && q.outer.length === 4);
    expect(sill).toBeDefined();
  });
  it('Odalar kapalı kabuk; küvetin açık kenarları yalnız zFloorTop; küvette 2 açıklık × 4 yan yüz', () => {
    for (const r of b.rooms) expect(checkShell(r).closed).toBe(true);
    const sc = checkShell(b.sectionParts[0]);
    expect(sc.openEdgeZ).toEqual([100200]);
    const polys = b.sectionParts[0].surfaces.flatMap((s) => s.polygons);
    const horizontalReveals = polys.filter((q) => q.kind === 'Wall_' && q.outer.every((v) => v.z === q.outer[0].z) && q.outer[0].z !== 103000);
    expect(horizontalReveals.length).toBe(4); // 2 açıklık × (alt + üst)
  });
  it('Hatalı açıklıklar raporlanır: yüz dışında (B-OP-04), tavanı kesen (B-OP-06), karşı yüzsüz (B-OP-05)', () => {
    const off: Opening = { ...win, id: 'disarida', anchor: { a: { x: 1000, y: 3000 }, b: { x: 2000, y: 3000 } } };
    const tall: Opening = { ...win, id: 'uzun', height: 2500 };
    const codes = generateBrep(synth([off, tall]), synth([off, tall]).buildings[0]).issues.map((i) => `${i.code}:${i.elementId}`);
    expect(codes).toContain('B-OP-04:disarida');
    expect(codes).toContain('B-OP-06:uzun');
    const lonely = synth([{ ...win, id: 'tek' }]);
    const b2 = { ...lonely.buildings[0], storeys: [{ ...lonely.buildings[0].storeys[0], outline: [{ outer: rect(0, -5000, 10000, 6000), holes: [] }] }], sectionParts: [] };
    expect(generateBrep({ ...lonely, buildings: [b2] }, b2).issues.map((i) => i.code)).toContain('B-OP-05');
  });
  it('Proje dosyası açıklıklarla gidiş-dönüş; mm tamsayı olmayan açıklık reddedilir; M4 dosyası (openings yok) okunur', () => {
    const text = serializeProject(p);
    expect(parseProject(text).project).toEqual(p);
    const bad = JSON.parse(text);
    bad.project.buildings[0].openings[0].anchor.a.x = 1.5;
    expect(() => parseProject(JSON.stringify(bad))).toThrow(/tamsayı/);
    const old = JSON.parse(text);
    delete old.project.buildings[0].openings;
    expect(generateBrep(parseProject(JSON.stringify(old)).project).rooms.length).toBe(2);
  });
});
