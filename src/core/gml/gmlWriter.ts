// M3 — İçe alınan GML için öznitelik düzeltici ve yeniden yazıcı (şartname §7.7, K70, OY-02, K99).
// Saf TypeScript: DOM yok, ağ yok, dosya erişimi yok. Girdi ve çıktı metindir.
//
// İki kayıt kipi (K70):
// - Düzeltme (varsayılan): Yalnız istenen öznitelik ve ad metinleri değişir. Geometri metni korunur;
//   OY-02 gereği 3'ten kısa ondalık hane sıfırla 3'e tamamlanır (değer değişmez). pos/posList biçimi korunur.
// - Normalize: Tüm halkalar ve TIC gml:posList + tam 3 ondalık (mm ızgarası) olarak yeniden yazılır;
//   int/double değerlerin baş/son boşlukları kırpılır; UTF-8 BOM'suz, CRLF, encoding="utf-8".
import type { CodelistRegistry } from '../codelists/index.ts';
import { ALLOWED_GENERIC_ATTRIBUTES, type GenericAttributeType } from '../model/index.ts';
import type { ImportedCityObject, ImportedModel } from './gmlReader.ts';
import { expectedObjectName } from './names.ts';

export type AttributeEdit =
  | { readonly kind: 'set'; readonly gmlId: string; readonly name: string; readonly type: GenericAttributeType; readonly value: string }
  | { readonly kind: 'remove'; readonly gmlId: string; readonly name: string }
  | { readonly kind: 'name'; readonly gmlId: string; readonly value: string };

export interface EditResult {
  readonly xml: string;
  readonly applied: readonly AttributeEdit[];
  readonly errors: ReadonlyArray<{ readonly edit: AttributeEdit; readonly message: string }>;
  /** Düzeltme kipinde 3'e tamamlanan koordinat sayısı (OY-02). */
  readonly paddedCoordinates: number;
}

const OBJECT_ID_RE = /<([A-Za-z]+:[A-Za-z]+)\b[^>]*\bgml:id="((?:MB|K|BB|BBK|OA|BBKIY|OAIY|BLKN|TRS|MBG|KAPI|PEN)_[^"]*)"[^>]*>/g;
const ALLOWED: ReadonlySet<string> = new Set<string>(ALLOWED_GENERIC_ATTRIBUTES);
/** Birden fazla değer alabilen öznitelikler; bunlar bu sürümde tek tek düzenlenmez. */
const MULTI_VALUED: ReadonlySet<string> = new Set(['independentSectionCardinalDirection', 'storeyUsage']);

interface ObjectSpan {
  readonly id: string;
  readonly tag: string;
  readonly start: number;
  readonly startTagEnd: number;
  /** Nesnenin kendi baş bölümünün sonu: sonraki nesnenin başlangıcı (öznitelikler ve ad buradadır). */
  readonly headEnd: number;
}

function locateObjects(xml: string): Map<string, ObjectSpan> {
  const found: Array<{ id: string; tag: string; start: number; startTagEnd: number }> = [];
  for (const m of xml.matchAll(OBJECT_ID_RE)) {
    const start = m.index ?? 0;
    found.push({ id: m[2], tag: m[1], start, startTagEnd: start + m[0].length });
  }
  const map = new Map<string, ObjectSpan>();
  for (let i = 0; i < found.length; i++) {
    const f = found[i];
    map.set(f.id, { ...f, headEnd: i + 1 < found.length ? found[i + 1].start : xml.length });
  }
  return map;
}

function escapeXml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** V-062 ile aynı tip denetimi. */
export function checkAttributeValue(type: GenericAttributeType, value: string): string | null {
  const v = value.trim();
  if (type === 'int' && !/^-?\d+$/.test(v)) return `"${value}" tam sayı değil.`;
  if (type === 'double' && (v === '' || !Number.isFinite(Number(v)))) return `"${value}" ondalık sayı değil.`;
  if (type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return `"${value}" YYYY-AA-GG biçiminde değil.`;
  return null;
}

interface TextPatch {
  readonly from: number;
  readonly to: number;
  readonly text: string;
}

function attrRegex(name: string): RegExp {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<gen:(string|int|double|date)Attribute\\s+name="${esc}"\\s*>(\\s*)<gen:value>([\\s\\S]*?)</gen:value>(\\s*)</gen:(?:string|int|double|date)Attribute>`, 'g');
}

/**
 * Öznitelik ve ad düzenlemelerini metin üzerinde uygular. Geometri ve diğer tüm metin bayt bayt korunur
 * (yalnız OY-02 kısa hane tamamlaması). Düzenleme listesi boşsa ve 3'ten kısa hane yoksa çıktı girdiyle aynıdır.
 */
export function applyAttributeEdits(xml: string, edits: readonly AttributeEdit[], options?: { readonly padShortDecimals?: boolean }): EditResult {
  const spans = locateObjects(xml);
  const nl = xml.includes('\r\n') ? '\r\n' : '\n';
  const patches: TextPatch[] = [];
  const applied: AttributeEdit[] = [];
  const errors: Array<{ edit: AttributeEdit; message: string }> = [];

  for (const edit of edits) {
    const span = spans.get(edit.gmlId);
    if (!span) {
      errors.push({ edit, message: `Nesne bulunamadı: ${edit.gmlId}` });
      continue;
    }
    const head = xml.slice(span.startTagEnd, span.headEnd);

    if (edit.kind === 'name') {
      const m = /<gml:name>([\s\S]*?)<\/gml:name>/.exec(head);
      if (!m || m.index === undefined) {
        errors.push({ edit, message: 'Nesnenin gml:name elemanı yok.' });
        continue;
      }
      const from = span.startTagEnd + m.index + '<gml:name>'.length;
      patches.push({ from, to: from + m[1].length, text: escapeXml(edit.value) });
      applied.push(edit);
      continue;
    }

    if (MULTI_VALUED.has(edit.name)) {
      errors.push({ edit, message: `"${edit.name}" birden fazla değer alabilir; bu sürümde tek tek düzenlenmez.` });
      continue;
    }
    const matches = [...head.matchAll(attrRegex(edit.name))];
    if (matches.length > 1) {
      errors.push({ edit, message: `"${edit.name}" nesnede ${matches.length} kez var (V-061); önce tekrarı giderin.` });
      continue;
    }
    const existing = matches[0];

    if (edit.kind === 'remove') {
      if (!existing || existing.index === undefined) {
        errors.push({ edit, message: `"${edit.name}" zaten yok.` });
        continue;
      }
      // Satırı girintisi ve satır sonuyla birlikte sil
      let from = span.startTagEnd + existing.index;
      const to = from + existing[0].length;
      const lineStart = xml.lastIndexOf('\n', from - 1) + 1;
      if (/^[ \t]*$/.test(xml.slice(lineStart, from))) from = lineStart;
      const after = xml.startsWith('\r\n', to) ? 2 : xml.startsWith('\n', to) ? 1 : 0;
      patches.push({ from, to: to + after, text: '' });
      applied.push(edit);
      continue;
    }

    // set
    if (!ALLOWED.has(`${edit.name}:${edit.type}`)) {
      errors.push({ edit, message: `"${edit.name}:${edit.type}" öznitelik beyaz listesinde yok (K99, V-060).` });
      continue;
    }
    const typeErr = checkAttributeValue(edit.type, edit.value);
    if (typeErr) {
      errors.push({ edit, message: typeErr });
      continue;
    }
    const value = escapeXml(edit.type === 'string' ? edit.value : edit.value.trim());
    if (existing && existing.index !== undefined) {
      if (existing[1] !== edit.type) {
        errors.push({ edit, message: `"${edit.name}" dosyada ${existing[1]} tipinde; ${edit.type} olarak yazılamaz.` });
        continue;
      }
      const valueStart = span.startTagEnd + existing.index + existing[0].indexOf('<gen:value>') + '<gen:value>'.length;
      patches.push({ from: valueStart, to: valueStart + existing[3].length, text: value });
      applied.push(edit);
      continue;
    }
    // Yeni öznitelik: nesnenin son özniteliğinden (yoksa gml:name'den) sonra, aynı girinti ve biçimle
    const all = [...head.matchAll(/<\/gen:(?:string|int|double|date)Attribute>|<\/gml:name>/g)];
    const anchor = all.length > 0 ? all[all.length - 1] : undefined;
    if (!anchor || anchor.index === undefined) {
      errors.push({ edit, message: 'Eklenecek yer bulunamadı (gml:name yok).' });
      continue;
    }
    const insertAt = span.startTagEnd + anchor.index + anchor[0].length;
    const lineStart = xml.lastIndexOf('\n', insertAt - anchor[0].length - 1) + 1;
    const indent = /^[ \t]*/.exec(xml.slice(lineStart))?.[0] ?? '';
    const inner = indent.includes('\t') ? `${indent}\t` : `${indent}  `;
    const block = `${nl}${indent}<gen:${edit.type}Attribute name="${edit.name}">${nl}${inner}<gen:value>${value}</gen:value>${nl}${indent}</gen:${edit.type}Attribute>`;
    patches.push({ from: insertAt, to: insertAt, text: block });
    applied.push(edit);
  }

  let out = applyPatches(xml, patches);
  let padded = 0;
  if (options?.padShortDecimals !== false) {
    const r = padShortDecimals(out);
    out = r.xml;
    padded = r.count;
  }
  return { xml: out, applied, errors, paddedCoordinates: padded };
}

function applyPatches(xml: string, patches: readonly TextPatch[]): string {
  if (patches.length === 0) return xml;
  const sorted = [...patches].sort((a, b) => b.from - a.from || b.to - a.to);
  let out = xml;
  let lastFrom = Number.POSITIVE_INFINITY;
  for (const p of sorted) {
    if (p.to > lastFrom) throw new Error('Çakışan metin düzenlemeleri (aynı yer iki kez düzenleniyor).');
    out = out.slice(0, p.from) + p.text + out.slice(p.to);
    lastFrom = p.from;
  }
  return out;
}

/** OY-02: Koordinat metinlerinde 3'ten kısa ondalık hane sıfırla tamamlanır; ≥3 hane aynen korunur. */
export function padShortDecimals(xml: string): { xml: string; count: number } {
  let count = 0;
  const xml2 = xml.replace(/(<gml:(?:pos|posList|lowerCorner|upperCorner)\b[^>]*>)([^<]*)(<\/gml:(?:pos|posList|lowerCorner|upperCorner)>)/g, (_all, open: string, body: string, close: string) => {
    const nb = body.replace(/-?\d+(?:\.\d+)?/g, (tok) => {
      const dot = tok.indexOf('.');
      const dec = dot < 0 ? 0 : tok.length - dot - 1;
      if (dec >= 3) return tok;
      count++;
      return dot < 0 ? `${tok}.000` : tok + '0'.repeat(3 - dec);
    });
    return open + nb + close;
  });
  return { xml: xml2, count };
}

export interface NormalizeResult {
  readonly xml: string;
  readonly roundedCoordinates: number;
  readonly ringsRewritten: number;
  readonly removedDuplicateVertices: number;
  readonly trimmedValues: number;
  readonly warnings: readonly string[];
}

const fmt3 = (v: number): string => {
  const r = Math.round(v * 1000) / 1000;
  const s = (Object.is(r, -0) ? 0 : r).toFixed(3);
  return s === '-0.000' ? '0.000' : s;
};

/**
 * Normalize kayıt (K70, OY-02): halkalar ve TIC LineString'leri tek gml:posList + tam 3 ondalık olarak yazılır.
 * Yuvarlamadan sonra oluşan ardışık eş noktalar silinir (V-032'yi önlemek için); halka 4 noktanın altına düşerse
 * o halka değiştirilmez ve uyarı verilir.
 */
export function normalizeGml(xml: string): NormalizeResult {
  const warnings: string[] = [];
  let rounded = 0;
  let rings = 0;
  let removed = 0;
  let trimmed = 0;
  let src = xml.charCodeAt(0) === 0xfeff ? xml.slice(1) : xml;
  src = src.replace(/\r?\n/g, '\r\n');
  src = src.replace(/^(<\?xml[^>]*encoding=")([^"]*)(")/i, (_a, p1: string, _enc: string, p3: string) => `${p1}utf-8${p3}`);

  const rewrite = (open: string, body: string, close: string, closed: boolean, id: string): string => {
    const nums = (body.match(/-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/g) ?? []).map(Number);
    if (nums.length < 6 || nums.length % 3 !== 0) {
      warnings.push(`${id || 'isimsiz'}: koordinat sayısı 3'ün katı değil; değiştirilmedi.`);
      return open + body + close;
    }
    const pts: string[] = [];
    for (let i = 0; i < nums.length; i += 3) {
      const t = `${fmt3(nums[i])} ${fmt3(nums[i + 1])} ${fmt3(nums[i + 2])}`;
      rounded += 3;
      if (pts.length > 0 && pts[pts.length - 1] === t) {
        removed++;
        continue;
      }
      pts.push(t);
    }
    if (closed && pts.length < 4) {
      warnings.push(`${id || 'isimsiz'}: yuvarlama sonrası 4 noktanın altına düşüyor; değiştirilmedi.`);
      return open + body + close;
    }
    rings++;
    const firstLine = /\r\n([ \t]*)</.exec(body);
    const indent = firstLine ? firstLine[1] : '';
    const closeIndent = /\r\n([ \t]*)$/.exec(body)?.[1] ?? '';
    return `${open}\r\n${indent}<gml:posList>${pts.join(' ')}</gml:posList>\r\n${closeIndent}${close}`;
  };

  src = src.replace(/(<gml:LinearRing\b([^>]*)>)([\s\S]*?)(<\/gml:LinearRing>)/g, (_a, open: string, attrs: string, body: string, close: string) =>
    rewrite(open, body, close, true, /gml:id="([^"]*)"/.exec(attrs)?.[1] ?? '')
  );
  src = src.replace(/(<gml:LineString\b([^>]*)>)([\s\S]*?)(<\/gml:LineString>)/g, (_a, open: string, attrs: string, body: string, close: string) =>
    body.trim() === '' ? open + body + close : rewrite(open, body, close, false, /gml:id="([^"]*)"/.exec(attrs)?.[1] ?? 'TIC')
  );
  src = src.replace(/(<gml:(lowerCorner|upperCorner)>)([^<]*)(<\/gml:\2>)/g, (_a, open: string, _t: string, body: string, close: string) => {
    const nums = body.trim().split(/\s+/).map(Number);
    rounded += nums.length;
    return open + nums.map(fmt3).join(' ') + close;
  });
  // V-214: int/double değerlerdeki baş/son boşluk ve TAB
  src = src.replace(/(<gen:(?:int|double)Attribute\s+name="[^"]*"\s*>\s*<gen:value>)([^<]*)(<\/gen:value>)/g, (_a, open: string, v: string, close: string) => {
    if (v !== v.trim()) trimmed++;
    return open + v.trim() + close;
  });
  return { xml: src, roundedCoordinates: rounded, ringsRewritten: rings, removedDuplicateVertices: removed, trimmedValues: trimmed, warnings };
}

/**
 * "Sayımları yeniden hesapla" (§7.7): totalIndependentSectionCount, Kat independentSectionCount, BB partCount.
 * Yalnız değeri farklı olanlar için düzenleme döner.
 */
export function computeRecountEdits(model: ImportedModel): AttributeEdit[] {
  const edits: AttributeEdit[] = [];
  const objs = model.objects;
  const mb = objs.find((o) => o.prefix === 'MB_');
  const bbs = objs.filter((o) => o.prefix === 'BB_');
  if (mb) {
    const unique = new Set(bbs.map((b) => `${b.attributesMap.blockName ?? ''}|${b.attributesMap.entrance ?? ''}|${b.attributesMap.independentSectionNumber ?? ''}`)).size;
    if (mb.attributesMap.totalIndependentSectionCount !== String(unique)) {
      edits.push({ kind: 'set', gmlId: mb.gmlId, name: 'totalIndependentSectionCount', type: 'int', value: String(unique) });
    }
  }
  for (const k of objs.filter((o) => o.prefix === 'K_')) {
    const n = k.groupMemberHrefs.filter((h) => h.replace(/^#/, '').startsWith('BB_')).length;
    if (k.attributesMap.independentSectionCount !== String(n)) edits.push({ kind: 'set', gmlId: k.gmlId, name: 'independentSectionCount', type: 'int', value: String(n) });
  }
  for (const bb of bbs) {
    const n = objs.filter((o) => o.prefix === 'BBK_' && o.referencedBbGmlId === bb.gmlId).length;
    if (bb.attributesMap.partCount !== String(n)) edits.push({ kind: 'set', gmlId: bb.gmlId, name: 'partCount', type: 'int', value: String(n) });
  }
  return edits;
}

/**
 * "Alanları geometriden yeniden hesapla" (V-155): Kısım ve ortak alanlarda calculatedArea = taban poligonlarının
 * alanı (2 ondalık). Normalize sonrası mm yuvarlaması taban alanını değiştirebildiği için sunulur.
 * Yalnız 0.005 m²'den fazla farklı olanlar için düzenleme döner.
 */
export function computeAreaEdits(model: ImportedModel): AttributeEdit[] {
  const edits: AttributeEdit[] = [];
  for (const r of model.objects) {
    if (r.prefix !== 'BBK_' && r.prefix !== 'OA_') continue;
    const declared = Number(r.attributesMap.calculatedArea);
    if (!(declared > 0)) continue;
    const floorIds = r.surfaces.filter((s) => s.tag === 'FloorSurface').flatMap((s) => [...s.polygonIds, ...s.xlinkHrefs.map((h) => h.replace(/^#/, ''))]);
    const area = floorIds.reduce((sum, id) => sum + (model.polygonsById[id]?.areaM2 ?? 0), 0);
    if (area > 0 && Math.abs(area - declared) > 0.005) {
      edits.push({ kind: 'set', gmlId: r.gmlId, name: 'calculatedArea', type: 'double', value: area.toFixed(2) });
    }
  }
  return edits;
}

/** "Adları yeniden üret" (§7.7): V-058 ile aynı kurallar (names.ts). Yalnız farklı olanlar. */
export function computeRenameEdits(model: ImportedModel, codelists: CodelistRegistry): AttributeEdit[] {
  const edits: AttributeEdit[] = [];
  for (const o of model.objects as readonly ImportedCityObject[]) {
    const expected = expectedObjectName(model, codelists, o);
    if (expected !== null && o.gmlName !== expected) edits.push({ kind: 'name', gmlId: o.gmlId, value: expected });
  }
  return edits;
}
