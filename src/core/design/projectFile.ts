// M4 — Proje dosyası (.tkgm3b, JSON). Malik listesi yalnız burada tutulur, GML'e yazılmaz (CLAUDE13 §1, K88-yeni).
// Aynı proje her zaman aynı metni üretir (sabit anahtar sırası, girinti 2).
import type { Malik } from '../model/malik.ts';
import type { DesignProject, Poly2, Pt2 } from './types.ts';

export const PROJECT_FORMAT = 'tkgm3b';

interface StoredMalik {
  readonly bbAnahtari: string;
  readonly adSoyadVeyaUnvan: string;
  readonly tcKimlikVeyaVergiNo?: string;
  readonly hissePay: string; // BigInt metin olarak
  readonly hissePayda: string;
  readonly not?: string;
}

export function serializeProject(project: DesignProject, malikler: readonly Malik[] = []): string {
  const stored: StoredMalik[] = malikler.map((m) => ({
    bbAnahtari: m.bbAnahtari,
    adSoyadVeyaUnvan: m.adSoyadVeyaUnvan,
    ...(m.tcKimlikVeyaVergiNo !== undefined ? { tcKimlikVeyaVergiNo: m.tcKimlikVeyaVergiNo } : {}),
    hissePay: m.hissePay.toString(),
    hissePayda: m.hissePayda.toString(),
    ...(m.not !== undefined ? { not: m.not } : {}),
  }));
  return `${JSON.stringify({ format: PROJECT_FORMAT, project, malikler: stored }, null, 2)}\n`;
}

export interface ParsedProjectFile {
  readonly project: DesignProject;
  readonly malikler: Malik[];
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

function checkRing(r: unknown, where: string): void {
  if (!Array.isArray(r) || r.length < 3) throw new Error(`${where}: halka en az 3 nokta olmalı.`);
  for (const p of r as Pt2[]) {
    if (!isInt(p?.x) || !isInt(p?.y)) throw new Error(`${where}: koordinatlar mm tamsayı olmalı (§4.1).`);
  }
}
function checkPoly(p: unknown, where: string): void {
  const poly = p as Poly2;
  checkRing(poly?.outer, where);
  if (!Array.isArray(poly.holes)) throw new Error(`${where}: holes dizisi yok.`);
  poly.holes.forEach((h, i) => checkRing(h, `${where} delik ${i + 1}`));
}

/** Proje dosyasını okur ve yapısını denetler; bozuksa açık bir hata fırlatır. */
export function parseProject(text: string): ParsedProjectFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Proje dosyası geçerli JSON değil.');
  }
  const root = raw as { format?: string; project?: DesignProject; malikler?: StoredMalik[] };
  if (root.format !== PROJECT_FORMAT) throw new Error(`Bu bir ${PROJECT_FORMAT} proje dosyası değil.`);
  const p = root.project;
  if (!p || p.schemaVersion !== 1) throw new Error('Desteklenmeyen proje şema sürümü.');
  if (!isInt(p.idSeq) || p.idSeq < 1) throw new Error('idSeq geçersiz.');
  for (const b of p.buildings ?? []) {
    for (const s of b.storeys) s.outline.forEach((o, i) => checkPoly(o, `Kat_${s.storeyNumber} sınır ${i + 1}`));
    for (const sp of b.sectionParts) checkPoly(sp.outline, `BB parçası ${sp.id}`);
    for (const pt of b.parts) checkPoly(pt.polygon, `Kısım ${pt.id}`);
    for (const inst of b.installations ?? []) checkPoly(inst.polygon, `İç yapı ${inst.id}`);
    for (const o of b.openings ?? []) {
      if (!isInt(o.anchor?.a?.x) || !isInt(o.anchor?.a?.y) || !isInt(o.anchor?.b?.x) || !isInt(o.anchor?.b?.y)) throw new Error(`Açıklık ${o.id}: koordinatlar mm tamsayı olmalı (§4.1).`);
      if (!isInt(o.sill) || !isInt(o.height) || o.height <= 0) throw new Error(`Açıklık ${o.id}: denizlik/yükseklik mm tamsayı olmalı.`);
    }
  }
  const malikler: Malik[] = (root.malikler ?? []).map((m) => ({
    bbAnahtari: m.bbAnahtari,
    adSoyadVeyaUnvan: m.adSoyadVeyaUnvan,
    ...(m.tcKimlikVeyaVergiNo !== undefined ? { tcKimlikVeyaVergiNo: m.tcKimlikVeyaVergiNo } : {}),
    hissePay: BigInt(m.hissePay),
    hissePayda: BigInt(m.hissePayda),
    ...(m.not !== undefined ? { not: m.not } : {}),
  }));
  return { project: p, malikler };
}
