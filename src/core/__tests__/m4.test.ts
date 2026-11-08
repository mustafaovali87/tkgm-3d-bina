// M4 — Tasarım modeli ve 2B editör testleri (şartname §4, §5.3, §7.4, §7.5, §10.4; kabul: "Ornek6 planı çizilebiliyor")
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createCodelistRegistryFromXmlMap, OFFICIAL_CODELIST_NAMES, type OfficialCodelistName } from '../codelists/index.ts';
import { checkDesign } from '../design/checks.ts';
import { createEditorState, createEmptyProject, editorReducer, type EditorAction, type EditorState } from '../design/editor.ts';
import { designFromImportedModel } from '../design/fromImported.ts';
import { polyAreaM2 } from '../design/geometry2d.ts';
import { parseProject, serializeProject } from '../design/projectFile.ts';
import { snapPoint } from '../design/snap.ts';
import type { DesignProject, Pt2, Ring2 } from '../design/types.ts';
import { parseCityGmlModel } from '../gml/gmlReader.ts';

const xmlMap = {} as Record<OfficialCodelistName, string>;
for (const n of OFFICIAL_CODELIST_NAMES) xmlMap[n] = fs.readFileSync(path.resolve(process.cwd(), 'resources', 'codelists', `${n}.xml`), 'utf-8');
const registry = createCodelistRegistryFromXmlMap(xmlMap);
const ORNEK6 = fs.readFileSync(path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'), 'utf-8');
const model = parseCityGmlModel(ORNEK6, 'M-70125626-A.gml', registry);
const golden = designFromImportedModel(model);
const gb = golden.project.buildings[0];

const run = (s: EditorState, actions: readonly EditorAction[]) => actions.reduce(editorReducer, s);
const sq = (x: number, y: number, w: number, h: number): Pt2[] => [
  { x, y },
  { x: x + w, y },
  { x: x + w, y: y + h },
  { x, y: y + h },
];

describe('M4 — Ornek6 altın tasarımı (§10.4: GML\'den yarı otomatik çıkarma)', () => {
  it('§10.4: 2 kat, 2 bağımsız bölüm, 2 BB parçası, 16 kısım çıkarılır; not yok', () => {
    expect(gb.storeys.map((s) => s.storeyNumber)).toEqual(['Z', '1']);
    expect(gb.sections.length).toBe(2);
    expect(gb.sectionParts.length).toBe(2);
    expect(gb.parts.filter((p) => p.kind === 'BBK').length).toBe(16);
    expect(golden.notes).toEqual([]);
  });
  it('§5.2: kotlar ±1 mm (Kat_Z alt 1095.900, Kat_1 alt 1098.700, kat yüksekliği 2.800)', () => {
    expect(gb.storeys[0].zBottom).toBe(1095900);
    expect(gb.storeys[1].zBottom).toBe(1098700);
    expect(gb.storeys[0].height).toBe(2800);
  });
  it('§10.4: her kısım alanı GML calculatedArea ile ±0.01 m²; her BB parçası independentSectionCalculatedArea ile ±0.01 m²', () => {
    for (const p of gb.parts) {
      const src = model.objectsById[golden.sourceIds.get(p.id)!];
      expect(Math.abs(polyAreaM2(p.polygon) - Number(src.attributesMap.calculatedArea)), src.gmlName).toBeLessThanOrEqual(0.01 + 1e-9);
    }
    for (const sp of gb.sectionParts) {
      const src = model.objectsById[golden.sourceIds.get(sp.id)!];
      expect(Math.abs(polyAreaM2(sp.outline) - Number(src.attributesMap.independentSectionCalculatedArea)), src.gmlName).toBeLessThanOrEqual(0.01 + 1e-9);
    }
  });
  it('§5.3: altın tasarım çizim denetiminde 0 HATA verir', () => {
    expect(checkDesign(golden.project).filter((i) => i.severity === 'H')).toEqual([]);
  });
});

describe('M4 — Kabul: Ornek6 planı editörde sıfırdan çizilebiliyor (§11)', () => {
  // Altlık: altın tasarımın halkaları (DXF/raster/GML izdüşümü altlığının yerine geçer). Tıklamalar 3–5 mm gürültülü.
  const underlay: Ring2[] = [...gb.storeys.flatMap((s) => s.outline.map((o) => o.outer)), ...gb.sectionParts.map((s) => s.outline.outer), ...gb.parts.map((p) => p.polygon.outer)];
  const noise = (i: number): Pt2 => ({ x: [4, -3, 5, -4][i % 4], y: [-3, 5, -4, 3][i % 4] });

  const draw = (s0: EditorState, ring: Ring2): EditorState => {
    let s = s0;
    const pts = [...ring, ring[0]]; // son tıklama ilk noktaya: çokgeni kapatır
    pts.forEach((v, i) => {
      const drawn = s.project.buildings[0];
      const rings: Ring2[] = [...underlay, ...drawn.sectionParts.map((x) => x.outline.outer), ...drawn.parts.map((x) => x.polygon.outer), s.draft];
      const snapped = snapPoint({ x: v.x + noise(i).x, y: v.y + noise(i).y }, { rings, toleranceMm: 20, lastPoint: s.draft[s.draft.length - 1] });
      s = editorReducer(s, { type: 'click', p: snapped.point });
    });
    return s;
  };

  let s = createEditorState(createEmptyProject('Ornek6 çizim testi', 'm4-test'));
  for (const st of gb.storeys) s = editorReducer(s, { type: 'addStorey', storey: { storeyNumber: st.storeyNumber, zBottom: st.zBottom, height: st.height, slabThickness: st.slabThickness } });
  const sectionMap = new Map<string, string>();
  for (const sec of gb.sections) {
    const { id: _id, ...rest } = sec;
    s = editorReducer(s, { type: 'addSection', section: rest });
    sectionMap.set(sec.id, s.options.sectionId!);
  }
  const storeyMap = new Map(gb.storeys.map((st, i) => [st.id, s.project.buildings[0].storeys[i].id]));
  for (const st of gb.storeys) {
    s = run(s, [{ type: 'setStorey', id: storeyMap.get(st.id)! }, { type: 'tool', tool: 'kat' }]);
    for (const o of st.outline) s = draw(s, o.outer);
    for (const sp of gb.sectionParts.filter((x) => x.storeyId === st.id)) {
      s = run(s, [{ type: 'tool', tool: 'bb' }, { type: 'options', patch: { sectionId: sectionMap.get(sp.sectionId)! } }]);
      s = draw(s, sp.outline.outer);
    }
    for (const p of gb.parts.filter((x) => x.storeyId === st.id)) {
      s = run(s, [{ type: 'tool', tool: p.kind === 'BBK' ? 'kisim' : 'oa' }, { type: 'options', patch: p.kind === 'BBK' ? { partUsage: p.usage } : { oaUsage: p.usage } }]);
      s = draw(s, p.polygon.outer);
    }
  }
  const drawn = s.project.buildings[0];

  it('§7.4: tüm elemanlar çizildi (2 kat sınırı, 2 BB parçası, 16 kısım); hata mesajı yok', () => {
    expect(drawn.storeys.reduce((n, st) => n + st.outline.length, 0)).toBe(gb.storeys.reduce((n, st) => n + st.outline.length, 0));
    expect(drawn.sectionParts.length).toBe(2);
    expect(drawn.parts.length).toBe(gb.parts.length);
    expect(s.message?.kind).not.toBe('error');
  });
  it('§7.4 snap: gürültülü tıklamalar altlık köşelerine oturdu; her eleman altın tasarımla aynı köşelere ve alana sahip', () => {
    const key = (r: Ring2) => r.map((p) => `${p.x},${p.y}`).sort().join(';');
    const goldenKeys = new Set(gb.parts.map((p) => key(p.polygon.outer)));
    for (const p of drawn.parts) expect(goldenKeys.has(key(p.polygon.outer))).toBe(true);
    const goldenArea = gb.parts.reduce((a, p) => a + polyAreaM2(p.polygon), 0);
    const drawnArea = drawn.parts.reduce((a, p) => a + polyAreaM2(p.polygon), 0);
    expect(Math.abs(goldenArea - drawnArea)).toBeLessThan(1e-9);
  });
  it('§5.3: çizilen plan denetimde 0 HATA; kısımlar doğru BB parçasına ve kullanım koduna bağlandı', () => {
    expect(checkDesign(s.project).filter((i) => i.severity === 'H')).toEqual([]);
    for (const p of drawn.parts) expect(p.sectionPartIds.length).toBe(1);
    expect(drawn.parts.map((p) => p.usage).sort()).toEqual(gb.parts.map((p) => p.usage).sort());
  });
});

describe('M4 — Editör kuralları (§7.4)', () => {
  const base = () => {
    let s = createEditorState(createEmptyProject('kural', 'kural'));
    s = run(s, [
      { type: 'addStorey', storey: { storeyNumber: 'Z', zBottom: 100000, height: 2800, slabThickness: 200 } },
      { type: 'addSection', section: { number: '1', blockName: '-1', entrance: '', registeredQuality: 'MESKEN', registeredInstallation: '', registeredFloorDefinition: 'ZEMİN KAT', propertyLot: '1/1', planNetArea: -1, planGrossArea: -1 } },
      { type: 'tool', tool: 'bb' },
    ]);
    for (const p of [...sq(0, 0, 10000, 8000), { x: 0, y: 0 }]) s = editorReducer(s, { type: 'click', p });
    return s;
  };
  it('V-034: kendini kesen (kelebek) çokgen kabul edilmez', () => {
    let s = run(base(), [{ type: 'tool', tool: 'kisim' }]);
    for (const p of [{ x: 1000, y: 1000 }, { x: 3000, y: 3000 }, { x: 3000, y: 1000 }, { x: 1000, y: 3000 }]) s = editorReducer(s, { type: 'click', p });
    s = editorReducer(s, { type: 'finish' });
    expect(s.message?.kind).toBe('error');
    expect(s.project.buildings[0].parts.length).toBe(0);
  });
  it('§5.3: BB parçası dışında kısım çizilemez', () => {
    let s = run(base(), [{ type: 'tool', tool: 'kisim' }]);
    for (const p of [...sq(20000, 20000, 2000, 2000), { x: 20000, y: 20000 }]) s = editorReducer(s, { type: 'click', p });
    expect(s.message?.kind).toBe('error');
    expect(s.project.buildings[0].parts.length).toBe(0);
  });
  it('§7.4 iç kısım: kısmın içine çizilen kısım dış kısımda otomatik delik açar; alanlar tutarlı', () => {
    let s = run(base(), [{ type: 'tool', tool: 'kisim' }]);
    for (const p of [...sq(1000, 1000, 6000, 5000), { x: 1000, y: 1000 }]) s = editorReducer(s, { type: 'click', p });
    for (const p of [...sq(2000, 2000, 1000, 1000), { x: 2000, y: 2000 }]) s = editorReducer(s, { type: 'click', p });
    const [outer, inner] = s.project.buildings[0].parts;
    expect(outer.polygon.holes.length).toBe(1);
    expect(polyAreaM2(outer.polygon)).toBeCloseTo(30 - 1, 9);
    expect(polyAreaM2(inner.polygon)).toBeCloseTo(1, 9);
    expect(checkDesign(s.project).filter((i) => i.severity === 'H')).toEqual([]);
  });
  it('Geri al / yinele ve bağlı kısmı olan BB parçasının silinmesinin engellenmesi', () => {
    let s = run(base(), [{ type: 'tool', tool: 'kisim' }]);
    for (const p of [...sq(1000, 1000, 2000, 2000), { x: 1000, y: 1000 }]) s = editorReducer(s, { type: 'click', p });
    expect(s.project.buildings[0].parts.length).toBe(1);
    const spId = s.project.buildings[0].sectionParts[0].id;
    s = run(s, [{ type: 'select', id: spId }, { type: 'delete' }]);
    expect(s.message?.kind).toBe('error');
    s = editorReducer(s, { type: 'undo' });
    expect(s.project.buildings[0].parts.length).toBe(0);
    s = editorReducer(s, { type: 'redo' });
    expect(s.project.buildings[0].parts.length).toBe(1);
  });
  it('Mutlak Kural 6: aynı işlem dizisi aynı kimlikleri üretir (randomUUID yok)', () => {
    expect(JSON.stringify(base().project)).toBe(JSON.stringify(base().project));
  });
});

describe('M4 — Denetimler (§5.3, §7.5)', () => {
  it('T-05: örtüşen BB parçaları; T-04: BB dışına taşan kısım; T-07: plan alanından %10 sapma', () => {
    const p: DesignProject = JSON.parse(JSON.stringify(golden.project));
    const b = p.buildings[0] as unknown as {
      sectionParts: { storeyId: string; outline: { outer: Pt2[] } }[];
      parts: { polygon: { outer: Pt2[] }; planArea: number }[];
    };
    // Örtüşme yalnız aynı katta anlamlıdır: ikinci BB parçasını birincinin katına ve konturuna taşı
    b.sectionParts[1].storeyId = b.sectionParts[0].storeyId;
    b.sectionParts[1].outline.outer = b.sectionParts[0].outline.outer.map((q) => ({ ...q }));
    b.parts[0].polygon.outer = b.parts[0].polygon.outer.map((q) => ({ x: q.x + 50000, y: q.y }));
    b.parts[1].planArea = polyAreaM2({ outer: b.parts[1].polygon.outer, holes: [] }) * 1.5;
    const codes = new Set(checkDesign(p).map((i) => i.code));
    expect(codes.has('T-05')).toBe(true);
    expect(codes.has('T-04')).toBe(true);
    expect(codes.has('T-07')).toBe(true);
  });
});

describe('M4 — Snap sırası (§7.4: köşe > kenar orta > kenar üzeri > dik > paralel > ızgara 1 cm)', () => {
  const ring = sq(0, 0, 10000, 10000);
  it('köşe en önceliklidir', () => expect(snapPoint({ x: 15, y: 12 }, { rings: [ring], toleranceMm: 50 })).toEqual({ point: { x: 0, y: 0 }, kind: 'kose' }));
  it('kenar ortası', () => expect(snapPoint({ x: 5010, y: 20 }, { rings: [ring], toleranceMm: 50 }).kind).toBe('kenarOrta'));
  it('kenar üzeri', () => expect(snapPoint({ x: 3333, y: 20 }, { rings: [ring], toleranceMm: 50 })).toEqual({ point: { x: 3333, y: 0 }, kind: 'kenarUzeri' }));
  it('ızgara: hiçbir şeye yakın değilse 1 cm ızgaraya oturur (mm tamsayı)', () => expect(snapPoint({ x: 3337.4, y: 4444.6 }, { rings: [ring], toleranceMm: 50 })).toEqual({ point: { x: 3340, y: 4440 }, kind: 'izgara' }));
  it('ortogonal kilit: son noktadan yatay', () => expect(snapPoint({ x: 7003, y: 5040 }, { rings: [], toleranceMm: 5, lastPoint: { x: 5000, y: 5000 }, ortho: true }).point).toEqual({ x: 7000, y: 5000 }));
});

describe('M4 — Proje dosyası (.tkgm3b)', () => {
  const malik = [{ bbAnahtari: '-1||1', adSoyadVeyaUnvan: 'ÖRNEK MALİK 1', tcKimlikVeyaVergiNo: '11111111110', hissePay: 1n, hissePayda: 2n }];
  it('kaydet → aç: proje ve malikler (BigInt) aynen geri gelir; çıktı deterministik', () => {
    const text = serializeProject(golden.project, malik);
    expect(serializeProject(golden.project, malik)).toBe(text);
    const back = parseProject(text);
    expect(back.project).toEqual(golden.project);
    expect(back.malikler).toEqual(malik);
  });
  it('§4.1: mm tamsayı olmayan koordinat içeren dosya reddedilir', () => {
    const text = serializeProject(golden.project).replace(/"x": (\d+)/, '"x": $1.5');
    expect(() => parseProject(text)).toThrow(/tamsayı/);
  });
});
