// M3 — Öznitelik düzeltici ve yazıcı testleri (şartname §7.7, §11 "Gidiş-dönüş testi geçiyor", K70, OY-02, K99)
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createCodelistRegistryFromXmlMap, OFFICIAL_CODELIST_NAMES, type OfficialCodelistName } from '../codelists/index.ts';
import { parseCityGmlModel, type ImportedModel } from '../gml/gmlReader.ts';
import { applyAttributeEdits, computeRecountEdits, computeRenameEdits, normalizeGml, padShortDecimals } from '../gml/gmlWriter.ts';
import { sha256Hex } from '../hash/canonical.ts';
import { validateCityGml } from '../validation/index.ts';

const xmlMap = {} as Record<OfficialCodelistName, string>;
for (const n of OFFICIAL_CODELIST_NAMES) xmlMap[n] = fs.readFileSync(path.resolve(process.cwd(), 'resources', 'codelists', `${n}.xml`), 'utf-8');
const registry = createCodelistRegistryFromXmlMap(xmlMap);
const ORNEK6 = fs.readFileSync(path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'), 'utf-8');
const NAME = 'M-70125626-A.gml';
const parse = (xml: string) => parseCityGmlModel(xml, NAME, registry);
/** Tamamlama kapalı: yalnız düzenleme etkisini ölçmek için. */
const RAW = { padShortDecimals: false } as const;
const base = parse(ORNEK6);
const mb = base.objects.find((o) => o.prefix === 'MB_')!;
const bb = base.objects.find((o) => o.prefix === 'BB_')!;
const kat = base.objects.find((o) => o.prefix === 'K_')!;

/** Halka kimliği → ham koordinat metni (geometri korunumunun kanıtı). */
const ringTexts = (m: ImportedModel) => {
  const map = new Map<string, string>();
  for (const p of m.polygons) for (const r of [p.exteriorRing, ...p.interiorRings]) map.set(r.gmlId, r.rawPosText);
  return map;
};

describe('M3 — Gidiş-dönüş (şartname §11 kabul ölçütü)', () => {
  it('OY-02: Düzeltme kipi yalnız 3 haneden kısa değerleri tamamlar; bütün köşe değerleri ve öznitelikler sayısal olarak aynı', () => {
    const r = applyAttributeEdits(ORNEK6, []);
    expect(r.paddedCoordinates).toBeGreaterThan(0); // Ornek6 TIC: 1095.9 gibi 1 haneli değerler
    const m = parse(r.xml);
    const flat = (x: ImportedModel) => x.polygons.flatMap((p) => p.exteriorRing.vertices.map((v) => [v.e, v.n, v.z]));
    expect(flat(m)).toEqual(flat(base));
    expect(m.ticLineStrings.map((t) => t.vertices)).toEqual(base.ticLineStrings.map((t) => t.vertices));
    for (const o of base.objects) expect(m.objectsById[o.gmlId].attributesMap).toEqual(o.attributesMap);
    expect(validateCityGml(r.xml, NAME, m, registry).counts.H).toBe(0);
  });

  it('K70: düzenleme yoksa ve tamamlama kapalıysa çıktı girdiyle bayt bayt aynıdır (SHA-256 eşit)', () => {
    const r = applyAttributeEdits(ORNEK6, [], RAW);
    expect(r.xml).toBe(ORNEK6);
    expect(sha256Hex(r.xml)).toBe(sha256Hex(ORNEK6));
  });

  it('K70: öznitelik düzenlemesi geometri metnine dokunmaz; yalnız istenen değerler değişir', () => {
    const r = applyAttributeEdits(ORNEK6, [
      { kind: 'set', gmlId: mb.gmlId, name: 'elevatorCount', type: 'int', value: '1' },
      { kind: 'set', gmlId: bb.gmlId, name: 'additionalNote', type: 'string', value: 'Düzeltildi & kontrol <edildi>' },
    ], RAW);
    expect(r.errors).toEqual([]);
    const m = parse(r.xml);
    expect(m.objectsById[mb.gmlId].attributesMap.elevatorCount).toBe('1');
    expect(m.objectsById[bb.gmlId].attributesMap.additionalNote).toBe('Düzeltildi & kontrol <edildi>');
    // Diğer tüm öznitelikler aynı
    for (const o of base.objects) {
      const after = m.objectsById[o.gmlId].attributesMap;
      for (const [k, v] of Object.entries(o.attributesMap)) {
        if ((o.gmlId === mb.gmlId && k === 'elevatorCount') || (o.gmlId === bb.gmlId && k === 'additionalNote')) continue;
        expect(after[k], `${o.gmlId}.${k}`).toBe(v);
      }
    }
    // Tüm halkaların ham koordinat metni birebir aynı
    expect(ringTexts(m)).toEqual(ringTexts(base));
    expect(m.polygons.length).toBe(base.polygons.length);
    // Değişen bayt sayısı yalnız düzenlenen değerler kadar
    expect(Math.abs(r.xml.length - ORNEK6.length)).toBeLessThan(80);
  });

  it('K70: düzenlenen dosya doğrulayıcıda yine 0 HATA verir', () => {
    const r = applyAttributeEdits(ORNEK6, [{ kind: 'set', gmlId: mb.gmlId, name: 'elevatorCount', type: 'int', value: '2' }]);
    const v = validateCityGml(r.xml, NAME, parse(r.xml), registry);
    expect(v.counts.H).toBe(0);
  });

  it('Öznitelik ekleme ve silme: biçim korunur, geri alınınca dosya özgün haline döner', () => {
    const removed = applyAttributeEdits(ORNEK6, [{ kind: 'remove', gmlId: bb.gmlId, name: 'partCount' }]);
    expect(removed.errors).toEqual([]);
    expect(parse(removed.xml).objectsById[bb.gmlId].attributesMap.partCount).toBeUndefined();
    const readded = applyAttributeEdits(removed.xml, [{ kind: 'set', gmlId: bb.gmlId, name: 'partCount', type: 'int', value: bb.attributesMap.partCount }]);
    expect(readded.errors).toEqual([]);
    const m = parse(readded.xml);
    expect(m.objectsById[bb.gmlId].attributesMap.partCount).toBe(bb.attributesMap.partCount);
    expect(validateCityGml(readded.xml, NAME, m, registry).counts.H).toBe(0);
  });

  it('Ad (gml:name) düzenlemesi yalnız nesnenin kendi adını değiştirir (yüzey adları değişmez)', () => {
    const r = applyAttributeEdits(ORNEK6, [{ kind: 'name', gmlId: kat.gmlId, value: 'Kat_0' }]);
    const m = parse(r.xml);
    expect(m.objectsById[kat.gmlId].gmlName).toBe('Kat_0');
    expect(m.objects.filter((o) => o.gmlName !== base.objectsById[o.gmlId].gmlName).map((o) => o.gmlId)).toEqual([kat.gmlId]);
  });
});

describe('M3 — Hatalı düzenlemeler reddedilir', () => {
  it('V-062: tam sayı alanına metin yazılamaz', () => {
    const r = applyAttributeEdits(ORNEK6, [{ kind: 'set', gmlId: mb.gmlId, name: 'elevatorCount', type: 'int', value: 'iki' }], RAW);
    expect(r.errors.length).toBe(1);
    expect(r.xml).toBe(ORNEK6);
  });
  it('K99 / V-060: beyaz listede olmayan öznitelik (ör. malik) yazılamaz', () => {
    const r = applyAttributeEdits(ORNEK6, [{ kind: 'set', gmlId: bb.gmlId, name: 'malik', type: 'string', value: 'ÖRNEK MALİK 1' }], RAW);
    expect(r.errors[0]?.message).toMatch(/beyaz listesinde yok/);
    expect(r.xml).toBe(ORNEK6);
  });
  it('Var olan özniteliğin tipi değiştirilemez; çok değerli öznitelik tek tek düzenlenmez', () => {
    const a = applyAttributeEdits(ORNEK6, [{ kind: 'set', gmlId: mb.gmlId, name: 'elevatorCount', type: 'double', value: '1' }]);
    expect(a.errors.length).toBe(1);
    const b = applyAttributeEdits(ORNEK6, [{ kind: 'set', gmlId: bb.gmlId, name: 'independentSectionCardinalDirection', type: 'int', value: '1001' }]);
    expect(b.errors.length).toBe(1);
  });
});

describe('M3 — Sayımlar ve adlar', () => {
  it('§7.7: Ornek6 sayımları doğru → yeniden hesaplama değişiklik üretmez', () => {
    expect(computeRecountEdits(base)).toEqual([]);
  });
  it('§7.7: bozulan partCount yeniden hesaplanır ve V-128 kaybolur', () => {
    const broken = applyAttributeEdits(ORNEK6, [{ kind: 'set', gmlId: bb.gmlId, name: 'partCount', type: 'int', value: '99' }], RAW).xml;
    const bm = parse(broken);
    expect(validateCityGml(broken, NAME, bm, registry).findings.some((f) => f.ruleId === 'V-128')).toBe(true);
    const fixed = applyAttributeEdits(broken, computeRecountEdits(bm), RAW).xml;
    expect(fixed).toBe(ORNEK6);
  });
  it('§7.7 / V-058: bozulan ad yeniden üretilir ve dosya özgün haline döner', () => {
    const broken = applyAttributeEdits(ORNEK6, [{ kind: 'name', gmlId: kat.gmlId, value: 'Kat_0' }], RAW).xml;
    const edits = computeRenameEdits(parse(broken), registry);
    expect(edits).toEqual([{ kind: 'name', gmlId: kat.gmlId, value: 'Kat_Z' }]);
    expect(applyAttributeEdits(broken, edits, RAW).xml).toBe(ORNEK6);
  });
});

describe('M3 — OY-02 hane tamamlama ve Normalize', () => {
  it('OY-02: Düzeltme kipinde 3\'ten kısa hane sıfırla tamamlanır, ≥3 hane aynen kalır', () => {
    const r = padShortDecimals('<gml:posList>1.5 2 3.25 4.1234 5.000 -0.5</gml:posList>');
    expect(r.xml).toBe('<gml:posList>1.500 2.000 3.250 4.1234 5.000 -0.500</gml:posList>');
    expect(r.count).toBe(4);
  });

  const norm = normalizeGml(ORNEK6);
  const nm = parse(norm.xml);
  it('K70 Normalize: tüm halkalar gml:posList + tam 3 ondalık; V-030 BİLGİ kalmaz', () => {
    expect(norm.warnings).toEqual([]);
    expect(norm.xml.includes('<gml:pos>')).toBe(false);
    const v = validateCityGml(norm.xml, NAME, nm, registry);
    expect(v.findings.some((f) => f.ruleId === 'V-030')).toBe(false);
    expect(v.findings.some((f) => f.ruleId === 'V-214')).toBe(false);
    expect(v.counts.H).toBe(0);
  });
  it('K70 Normalize: nesne, poligon ve halka sayısı aynı; her köşe en çok 0.5 mm kayar', () => {
    expect(nm.objects.length).toBe(base.objects.length);
    expect(nm.polygons.length).toBe(base.polygons.length);
    for (const p of base.polygons) {
      const q = nm.polygonsById[p.gmlId];
      expect(q.exteriorRing.vertices.length).toBeLessThanOrEqual(p.exteriorRing.vertices.length);
      const v0 = p.exteriorRing.vertices[0];
      const w0 = q.exteriorRing.vertices[0];
      expect(Math.max(Math.abs(v0.e - w0.e), Math.abs(v0.n - w0.n), Math.abs(v0.z - w0.z))).toBeLessThanOrEqual(0.0005 + 1e-9);
    }
  });
  it('K02 Normalize: BOM yok, satır sonu CRLF, encoding="utf-8"; ikinci normalize hiçbir şeyi değiştirmez', () => {
    expect(norm.xml.charCodeAt(0)).not.toBe(0xfeff);
    expect(/(?<!\r)\n/.test(norm.xml)).toBe(false);
    expect(norm.xml.startsWith('<?xml version="1.0" encoding="utf-8"?>')).toBe(true);
    expect(normalizeGml(norm.xml).xml).toBe(norm.xml);
  });
});
