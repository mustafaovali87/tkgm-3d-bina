// M2/M3 — Nesne adı (gml:name) kuralları. V-058 denetimi ve "Adları yeniden üret" aynı fonksiyonu kullanır.
// Desenler 9 resmi TKGM dosyasından ölçüldü (N17, M2 kalibrasyonu).
import type { CodelistLookupKey, CodelistRegistry } from '../codelists/index.ts';
import type { ImportedCityObject, ImportedModel } from './gmlReader.ts';

/** Adlarda boş blockName / entrance "-1" yazılır. */
const part = (v: string | undefined): string => (v === undefined || v.trim() === '' ? '-1' : v.trim());

/** BB ad öneki: `<blockName>_<entrance>_<bbNo>`. */
export function bbNamePrefix(bb: ImportedCityObject | undefined): string | null {
  if (!bb) return null;
  const a = bb.attributesMap;
  return `${part(a.blockName)}_${part(a.entrance)}_${a.independentSectionNumber ?? ''}`;
}

function label(codelists: CodelistRegistry, list: CodelistLookupKey, v: string | undefined): string | undefined {
  const n = Number.parseInt(v ?? '', 10);
  return Number.isFinite(n) ? codelists.getDescription(list, n) : undefined;
}

/**
 * Nesnenin olması gereken adı. Kural tanımlı değilse veya gerekli bilgi yoksa null döner (ad denetlenmez/değiştirilmez).
 * - MB: `Mimari Bina_<constructionID>`; MBG: `Mimari Bina Grup_<constructionID>`; K: `Kat_<storeyNumber>`
 * - BB: `<önek>_Bağımsız Bölüm`; BBK: `<BB öneki>_<partUsage etiketi>`; OA: `<commonAreaUsage etiketi>_Ortak Alan`
 * - BLKN: `<BB öneki>_Balkon`; TRS (referans -1): `-1_-1_-1_Teras`; KAPI/PEN: kullanım kodu etiketi
 */
export function expectedObjectName(model: ImportedModel, codelists: CodelistRegistry, o: ImportedCityObject): string | null {
  const a = o.attributesMap;
  const cid = model.objects.find((x) => x.prefix === 'MB_')?.attributesMap.constructionID ?? '';
  const bbOf = (id: string | null | undefined) => (id ? model.objectsById[id] : undefined);
  switch (o.prefix) {
    case 'MB_':
      return cid ? `Mimari Bina_${cid}` : null;
    case 'MBG_':
      return cid ? `Mimari Bina Grup_${cid}` : null;
    case 'K_':
      return a.storeyNumber !== undefined ? `Kat_${a.storeyNumber}` : null;
    case 'BB_': {
      const pre = bbNamePrefix(o);
      return pre ? `${pre}_Bağımsız Bölüm` : null;
    }
    case 'BBK_': {
      const pre = bbNamePrefix(bbOf(o.referencedBbGmlId));
      const lbl = label(codelists, 'partUsage', a.partUsage);
      return pre && lbl ? `${pre}_${lbl}` : null;
    }
    case 'OA_': {
      const lbl = label(codelists, 'commonAreaUsage', a.commonAreaUsage);
      return lbl ? `${lbl}_Ortak Alan` : null;
    }
    case 'BBKIY_': {
      const host = o.parentGmlId ? model.objectsById[o.parentGmlId] : undefined;
      if (!host) return null;
      const pre = bbNamePrefix(bbOf(host.referencedBbGmlId));
      const lbl = label(codelists, 'partUsage', host.attributesMap.partUsage);
      return pre && lbl ? `${pre}_${lbl}_İç Yapı` : null;
    }
    case 'OAIY_': {
      const host = o.parentGmlId ? model.objectsById[o.parentGmlId] : undefined;
      if (!host) return null;
      const lbl = label(codelists, 'commonAreaUsage', host.attributesMap.commonAreaUsage);
      return lbl ? `${lbl}_İç Yapı` : null;
    }
    case 'BLKN_': {
      const pre = bbNamePrefix(bbOf(o.referencedBbGmlId));
      return pre ? `${pre}_Balkon` : null;
    }
    case 'TRS_':
      return (a.independentSectionObjectReference ?? '') === '-1' ? '-1_-1_-1_Teras' : null;
    case 'KAPI_':
      return label(codelists, 'doorUsage', a.doorUsage) ?? null;
    case 'PEN_':
      return label(codelists, 'windowUsage', a.windowUsage) ?? null;
    default:
      return null;
  }
}
