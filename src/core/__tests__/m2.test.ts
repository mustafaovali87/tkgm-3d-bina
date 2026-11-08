// M2 — Dosya doğrulayıcı testleri (şartname §6, §6.14)
// 1) Ornek6 (resmi kabul örneği) sıfır HATA üretir.
// 2) Ornek6'ya tek bir hata eklendiğinde ilgili kural HATA üretir (kuralın gerçekten yakaladığının kanıtı).
// 3) Kural kataloğu: her kuralın kaynağı var; ertelenen/sunucu kuralları gerekçeli.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createCodelistRegistryFromXmlMap, OFFICIAL_CODELIST_NAMES, type OfficialCodelistName } from '../codelists/index.ts';
import { parseCityGmlModel } from '../gml/gmlReader.ts';
import { ALL_RULES, detectRegime, validateCityGml } from '../validation/index.ts';
import { prismVolumeUnder, ringSelfIntersects } from '../validation/geom.ts';

const xmlMap = {} as Record<OfficialCodelistName, string>;
for (const n of OFFICIAL_CODELIST_NAMES) {
  xmlMap[n] = fs.readFileSync(path.resolve(process.cwd(), 'resources', 'codelists', `${n}.xml`), 'utf-8');
}
const registry = createCodelistRegistryFromXmlMap(xmlMap);
const ORNEK6 = fs.readFileSync(path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'), 'utf-8');
const NAME = 'M-70125626-A.gml';

function run(xml: string, fileName = NAME) {
  const model = parseCityGmlModel(xml, fileName, registry);
  return validateCityGml(xml, fileName, model, registry);
}
const hatalar = (r: ReturnType<typeof run>, id: string) => r.findings.filter((f) => f.ruleId === id && f.severity === 'H');
/** Metindeki ilk eşleşmeyi değiştirir; eşleşme yoksa test hatası verir (sessizce geçmesin). */
function mutate(xml: string, from: string | RegExp, to: string): string {
  const out = xml.replace(from, to);
  if (out === xml) throw new Error(`Mutasyon uygulanamadı: ${String(from)}`);
  return out;
}

describe('M2 — Ornek6 resmi kabul örneği', () => {
  const r = run(ORNEK6);
  it('V-*: Ornek6 sıfır HATA üretir (şartname §6.14: TKGM örnekleri sıfır hata)', () => {
    expect(r.findings.filter((f) => f.severity === 'H')).toEqual([]);
    expect(r.counts.H).toBe(0);
  });
  it('V-105 / N19: Ornek6 Sürdürülebilirlik rejimindedir (GroundSurface var)', () => {
    expect(r.regime).toBe('S');
    expect(detectRegime(parseCityGmlModel(ORNEK6, NAME, registry))).toBe('S');
  });
  it('V-030 / V-213 / V-214: beklenen BİLGİ bulguları üretilir (okumada ≠3 hane, 10 haneli MAKS, TAB)', () => {
    const ids = new Set(r.findings.filter((f) => f.severity === 'B').map((f) => f.ruleId));
    expect(ids.has('V-030')).toBe(true);
    expect(ids.has('V-213')).toBe(true);
    expect(ids.has('V-214')).toBe(true);
  });
  it('V-158: Ornek6 oda hacimleri geometrik hacimle %1 içinde eşleşir (prizma yöntemi)', () => {
    expect(r.findings.filter((f) => f.ruleId === 'V-158')).toEqual([]);
  });
});

describe('M2 — Ornek6 üzerinde tek hata ekleme (her kural gerçekten yakalıyor mu?)', () => {
  const cases: ReadonlyArray<{ id: string; why: string; xml: () => string; fileName?: string }> = [
    { id: 'V-001', why: 'dosya adı M- ile başlamıyor', xml: () => ORNEK6, fileName: 'ornek6.gml' },
    { id: 'V-002', why: 'dosya adı constructionID ile uyuşmuyor', xml: () => ORNEK6, fileName: 'M-99999-A.gml' },
    { id: 'V-004', why: 'GML ad alanı 3.2', xml: () => mutate(ORNEK6, 'xmlns:gml="http://www.opengis.net/gml"', 'xmlns:gml="http://www.opengis.net/gml/3.2"') },
    { id: 'V-014', why: 'srsName EPSG:4326', xml: () => mutate(ORNEK6, 'srsName="EPSG:5254"', 'srsName="EPSG:4326"') },
    { id: 'V-021', why: 'poligonda srsName', xml: () => mutate(ORNEK6, '<gml:Polygon gml:id="', '<gml:Polygon srsName="EPSG:5254" gml:id="') },
    { id: 'V-033', why: 'halka kapanmıyor (son pos silindi)', xml: () => mutate(ORNEK6, /(<gml:pos>[^<]*<\/gml:pos>\s*)(<\/gml:LinearRing>)/, '$2') },
    { id: 'V-050', why: 'aynı gml:id iki kez', xml: () => mutate(ORNEK6, /gml:id="(Roof_[^"]+)"([\s\S]*?)gml:id="Roof_[^"]+"/, 'gml:id="$1"$2gml:id="$1"') },
    { id: 'V-056', why: 'WallSurface elemanında gml:id', xml: () => mutate(ORNEK6, '<bldg:WallSurface>', '<bldg:WallSurface gml:id="WS_1">') },
    { id: 'V-057', why: 'kısım sınıf değeri yanlış', xml: () => mutate(ORNEK6, '<bldg:class>BagimsizBolumKisim</bldg:class>', '<bldg:class>Oda</bldg:class>') },
    { id: 'V-058', why: 'kat adı storeyNumber ile uyuşmuyor', xml: () => mutate(ORNEK6, '<gml:name>Kat_Z</gml:name>', '<gml:name>Kat_0</gml:name>') },
    { id: 'V-059', why: 'yüzey adı yanlış', xml: () => mutate(ORNEK6, '<gml:name>Duvar</gml:name>', '<gml:name>Duvarlar</gml:name>') },
    { id: 'V-061', why: 'BB zorunlu partCount yok', xml: () => mutate(ORNEK6, /<gen:intAttribute name="partCount">\s*<gen:value>\d+<\/gen:value>\s*<\/gen:intAttribute>/, '') },
    { id: 'V-072', why: 'bina geometrySuitability 1005', xml: () => mutate(ORNEK6, /(name="geometrySuitability">\s*<gen:value>)1006/, '$11005') },
    { id: 'V-202', why: 'ret paketi (bina geometrySuitability 1005)', xml: () => mutate(ORNEK6, /(name="geometrySuitability">\s*<gen:value>)1006/, '$11005') },
    { id: 'V-112', why: 'kat parent bina değil', xml: () => mutate(ORNEK6, /<grp:parent xlink:href="#MB_[^"]+"\/>/, '<grp:parent xlink:href="#MB_00000000-0000-0000-0000-000000000000"/>') },
    { id: 'V-130', why: 'BB integrationState 1003', xml: () => mutate(ORNEK6, /(name="integrationState">\s*<gen:value>)1004/, '$11003') },
    { id: 'V-160', why: 'kısım BB referansı yok', xml: () => mutate(ORNEK6, /(<bldg:Room gml:id="BBK_[^"]+">\s*<gml:name>[^<]*<\/gml:name>\s*<gen:stringAttribute name="independentSectionObjectReference">\s*<gen:value>)BB_[^<]+/, '$1BB_00000000-0000-0000-0000-000000000000') },
    { id: 'V-188', why: 'balkon BB referansı yok', xml: () => mutate(ORNEK6, /(<bldg:BuildingInstallation gml:id="BLKN_[^"]+">[\s\S]*?name="independentSectionObjectReference">\s*<gen:value>)BB_[^<]+/, '$1BB_00000000-0000-0000-0000-000000000000') },
  ];
  for (const c of cases) {
    it(`${c.id}: ${c.why} → HATA`, () => {
      const r = run(c.xml(), c.fileName ?? NAME);
      expect(hatalar(r, c.id).length).toBeGreaterThan(0);
    });
  }
});

describe('M2 — Geometri yardımcıları', () => {
  it('V-034: kelebek (kendini kesen) halka yakalanır, kare yakalanmaz', () => {
    const square = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
    const bowtie = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
    expect(ringSelfIntersects(square)).toBe(false);
    expect(ringSelfIntersects(bowtie)).toBe(true);
  });
  it('V-158: eğik tavan altındaki prizma hacmi elle hesapla aynı (2×3 m, tavan 2.5→3.5 m → 18 m³)', () => {
    const z = (x: number) => 2.5 + x / 2; // x = 0 → 2.5, x = 2 → 3.5
    const ceiling = [
      { e: 0, n: 0, z: z(0) },
      { e: 2, n: 0, z: z(2) },
      { e: 2, n: 3, z: z(2) },
      { e: 0, n: 3, z: z(0) },
      { e: 0, n: 0, z: z(0) },
    ];
    expect(prismVolumeUnder([{ exterior: ceiling, holes: [] }], 0)).toBeCloseTo(18, 9);
  });
});

describe('M2 — Kural kataloğu', () => {
  it('§6.14: her kuralın kaynağı var; ertelenen/sunucu/kısmi kurallar gerekçeli', () => {
    for (const r of ALL_RULES) {
      expect(r.source.length, r.id).toBeGreaterThan(0);
      if (r.status === 'ertelendi' || r.status === 'sunucu' || r.status === 'kismi') expect(r.note, r.id).toBeTruthy();
    }
  });
  it('§6: V-001…V-195 kataloğundaki tüm kural kodları ve V-196…V-216 listede (tekrarsız)', () => {
    const ids = ALL_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    const spec = [
      ...['001', '002', '003', '004', '005', '006', '007', '008'],
      ...Array.from({ length: 12 }, (_, i) => String(10 + i).padStart(3, '0')),
      ...Array.from({ length: 12 }, (_, i) => String(30 + i).padStart(3, '0')),
      ...Array.from({ length: 15 }, (_, i) => String(50 + i).padStart(3, '0')),
      ...Array.from({ length: 16 }, (_, i) => String(70 + i).padStart(3, '0')),
      ...Array.from({ length: 19 }, (_, i) => String(90 + i).padStart(3, '0')),
      ...Array.from({ length: 9 }, (_, i) => String(110 + i)),
      ...Array.from({ length: 22 }, (_, i) => String(120 + i)),
      ...Array.from({ length: 17 }, (_, i) => String(150 + i)),
      ...Array.from({ length: 5 }, (_, i) => String(170 + i)),
      ...Array.from({ length: 9 }, (_, i) => String(180 + i)),
      ...Array.from({ length: 6 }, (_, i) => String(190 + i)),
      ...Array.from({ length: 21 }, (_, i) => String(196 + i)),
    ].map((n) => `V-${n}`);
    const missing = spec.filter((id) => !ids.includes(id));
    expect(missing).toEqual([]);
  });
});
