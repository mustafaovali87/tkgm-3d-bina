// M4 — İçe aktarılan GML'den tasarım modeli çıkarma (şartname §10.4 madde 1: "yarı otomatik").
// Kat sınırı: kat geometrisinin en alt yatay Floor_ poligonları. BB parçası: BB küvetinin alt taban poligonu.
// Kısım/OA: oda FloorSurface poligonu. Koordinatlar tam metre kökene göre mm tamsayıya çevrilir (§4.1).
import type { ImportedCityObject, ImportedModel, ImportedPolygon } from '../gml/gmlReader.ts';
import { uuidv5 } from '../hash/canonical.ts';
import { normalizeOrientation, polyAreaM2, polyIntersectionAreaM2 } from './geometry2d.ts';
import type { DesignProject, IndependentSection, Part, Poly2, Pt2, SectionPart, Storey } from './types.ts';

export interface ExtractionNote {
  readonly objectGmlId: string;
  readonly message: string;
}

export interface ExtractionResult {
  readonly project: DesignProject;
  /** Tasarım kimliği → kaynak GML nesne kimliği (karşılaştırma için). */
  readonly sourceIds: ReadonlyMap<string, string>;
  readonly notes: readonly ExtractionNote[];
}

const EPSG = [5253, 5254, 5255, 5256, 5257, 5258, 5259] as const;

export function designFromImportedModel(model: ImportedModel): ExtractionResult {
  const notes: ExtractionNote[] = [];
  const sourceIds = new Map<string, string>();
  const E0 = Math.floor(model.envelope.minE);
  const N0 = Math.floor(model.envelope.minN);
  const toPt = (v: { e: number; n: number }): Pt2 => ({ x: Math.round((v.e - E0) * 1000), y: Math.round((v.n - N0) * 1000) });
  const toRing = (vs: readonly { e: number; n: number }[]): Pt2[] => {
    const r = vs.map(toPt);
    const out: Pt2[] = [];
    for (const p of r) if (!out.length || out[out.length - 1].x !== p.x || out[out.length - 1].y !== p.y) out.push(p);
    if (out.length > 1 && out[0].x === out[out.length - 1].x && out[0].y === out[out.length - 1].y) out.pop();
    return out;
  };
  const toPoly = (p: ImportedPolygon): Poly2 => normalizeOrientation({ outer: toRing(p.exteriorRing.vertices), holes: p.interiorRings.map((h) => toRing(h.vertices)) });
  const polysOf = (o: ImportedCityObject) => o.allPolygonIds.map((id) => model.polygonsById[id]).filter((p): p is ImportedPolygon => p !== undefined);
  const lowestHorizontal = (ps: ImportedPolygon[]) => {
    const flat = ps.filter((p) => p.maxZ - p.minZ < 0.001);
    if (flat.length === 0) return [];
    const z = Math.min(...flat.map((p) => p.minZ));
    return flat.filter((p) => Math.abs(p.minZ - z) < 0.001);
  };
  const largest = (o: ImportedCityObject, ps: ImportedPolygon[], what: string): ImportedPolygon | null => {
    if (ps.length === 0) {
      notes.push({ objectGmlId: o.gmlId, message: `${what} poligonu bulunamadı.` });
      return null;
    }
    if (ps.length > 1) notes.push({ objectGmlId: o.gmlId, message: `${what} ${ps.length} poligondan oluşuyor; en büyüğü alındı.` });
    return ps.reduce((a, b) => (b.areaM2 > a.areaM2 ? b : a), ps[0]);
  };

  const mb = model.objects.find((o) => o.prefix === 'MB_');
  const cid = mb?.attributesMap.constructionID ?? '';
  const projectId = uuidv5(`ithal:${cid}:${model.canonicalHash}`);
  let seq = 1;
  const nid = (kind: string) => uuidv5(`${projectId}:${kind}:${seq++}`);

  // Katlar (alttan üste)
  const ks = model.objects.filter((o) => o.prefix === 'K_').sort((a, b) => (a.minZ ?? 0) - (b.minZ ?? 0));
  const storeys: Storey[] = [];
  const storeyIdByGml = new Map<string, string>();
  ks.forEach((k, i) => {
    const id = nid('kat');
    storeyIdByGml.set(k.gmlId, id);
    sourceIds.set(id, k.gmlId);
    const zB = Math.round((k.minZ ?? 0) * 1000);
    const next = ks[i + 1];
    const height = next ? Math.round((next.minZ ?? 0) * 1000) - zB : Math.round(((k.maxZ ?? 0) - (k.minZ ?? 0)) * 1000);
    const floors = lowestHorizontal(polysOf(k).filter((p) => p.prefix === 'Floor_'));
    if (floors.length === 0) notes.push({ objectGmlId: k.gmlId, message: 'Kat sınırı (en alt Floor_) bulunamadı.' });
    storeys.push({ id, storeyNumber: k.attributesMap.storeyNumber ?? String(i), zBottom: zB, height, slabThickness: 200, outline: floors.map(toPoly) });
  });

  /** Taban kotu (mm) hangi katın [zBottom, zBottom + height) aralığındaysa o kat (1 mm tolerans). */
  // En üst katın üstündeki taban (çatı arası BB'leri, Ornek2) en üst kata, en alt katın altındaki en alt kata bağlanır;
  // bu durumda kotu zFloorOverride ile korunur.
  const physicalStorey = (zMm: number): Storey | undefined => {
    const hit = storeys.find((s) => zMm >= s.zBottom - 1 && zMm < s.zBottom + s.height - 1);
    if (hit) return hit;
    const top = storeys[storeys.length - 1];
    if (top && zMm >= top.zBottom) return top;
    return storeys[0];
  };

  // Bağımsız bölümler (liste beyan birimi) ve BB parçaları
  const sections: IndependentSection[] = [];
  const sectionByKey = new Map<string, string>();
  const sectionParts: SectionPart[] = [];
  const spIdByGml = new Map<string, string>();
  for (const bb of model.objects.filter((o) => o.prefix === 'BB_')) {
    const a = bb.attributesMap;
    const key = `${a.blockName ?? ''}|${a.entrance ?? ''}|${a.independentSectionNumber ?? ''}|${a.propertyLot ?? ''}|${a.registeredQuality ?? ''}`;
    let sectionId = sectionByKey.get(key);
    if (!sectionId) {
      sectionId = nid('bolum');
      sectionByKey.set(key, sectionId);
      sections.push({
        id: sectionId,
        number: a.independentSectionNumber ?? '',
        blockName: a.blockName && a.blockName.trim() !== '' ? a.blockName : '-1',
        entrance: a.entrance ?? '',
        registeredQuality: a.registeredQuality ?? '',
        registeredInstallation: a.registeredInstallation ?? '',
        registeredFloorDefinition: a.registeredFloorDefinition ?? '',
        propertyLot: a.propertyLot ?? '',
        planNetArea: Number(a.independentSectionPlanNetArea ?? -1),
        planGrossArea: Number(a.independentSectionPlanGrossArea ?? -1),
      });
    }
    const floor = largest(bb, lowestHorizontal(polysOf(bb).filter((p) => p.prefix === 'Floor_')), 'BB alt tabanı');
    if (!floor) continue;
    // Fiziksel kat taban kotundan bulunur. GML'de çok katlı BB parçası giriş katının grubuna bağlıdır (groupMember),
    // bu yüzden bb.storeyGmlId fiziksel katı göstermeyebilir (Ornek4: BB 1'in iki parçası).
    const zMm = Math.round(floor.minZ * 1000);
    const st = physicalStorey(zMm);
    if (!st) {
      notes.push({ objectGmlId: bb.gmlId, message: 'BB parçasının katı taban kotundan belirlenemedi; atlandı.' });
      continue;
    }
    const id = nid('bb');
    spIdByGml.set(bb.gmlId, id);
    sourceIds.set(id, bb.gmlId);
    const usage = Number(a.independentSectionUsage ?? 1001);
    sectionParts.push({
      id,
      sectionId,
      storeyId: st.id,
      usage: (usage >= 1001 && usage <= 1006 ? usage : 1001) as SectionPart['usage'],
      outline: toPoly(floor),
      ...(Math.abs(zMm - st.zBottom) > 1 ? { zFloorOverride: zMm } : {}),
    });
  }

  // Kısımlar ve ortak alanlar
  const parts: Part[] = [];
  const partFloorZ = new Map<string, number>();
  for (const r of model.objects.filter((o) => o.prefix === 'BBK_' || o.prefix === 'OA_')) {
    const floorIds = r.surfaces.filter((s) => s.tag === 'FloorSurface').flatMap((s) => [...s.polygonIds, ...s.xlinkHrefs.map((h) => h.replace(/^#/, ''))]);
    const floor = largest(r, floorIds.map((id) => model.polygonsById[id]).filter((p): p is ImportedPolygon => p !== undefined), 'Oda tabanı');
    if (!floor) continue;
    const kind: Part['kind'] = r.prefix === 'BBK_' ? 'BBK' : 'OA';
    // Çok katlı BB'de oda, BB'nin hangi parçasının (katının) üzerindeyse ona bağlanır: oda tabanının fiziksel katı
    const zMm = Math.round(floor.minZ * 1000);
    const st = physicalStorey(zMm);
    const storeyId = st?.id;
    const bbGml = r.referencedBbGmlId;
    const sameSectionParts = kind === 'BBK' && bbGml ? sectionParts.filter((s) => s.sectionId === sectionParts.find((x) => x.id === spIdByGml.get(bbGml))?.sectionId) : [];
    // Aynı katta aynı bölümün birden fazla parçası olabilir (ör. çatı arası parçası, Ornek2):
    // oda, taban kotu odanın kotuna en yakın ve altında kalan parçaya bağlanır.
    const spZ = (s: SectionPart) => s.zFloorOverride ?? storeys.find((x) => x.id === s.storeyId)?.zBottom ?? 0;
    const candidates = sameSectionParts.filter((s) => s.storeyId === storeyId && spZ(s) <= zMm + 1).sort((a, b) => spZ(b) - spZ(a));
    const spId = candidates[0]?.id ?? sameSectionParts.find((s) => s.storeyId === storeyId)?.id ?? (bbGml ? spIdByGml.get(bbGml) : undefined);
    if (!storeyId) {
      notes.push({ objectGmlId: r.gmlId, message: 'Odanın katı belirlenemedi; atlandı.' });
      continue;
    }
    const id = nid(kind === 'BBK' ? 'bbk' : 'oa');
    sourceIds.set(id, r.gmlId);
    partFloorZ.set(id, zMm);
    const plan = Number(r.attributesMap.planArea ?? -1);
    parts.push({
      id,
      kind,
      storeyId,
      sectionPartIds: kind === 'BBK' && spId ? [spId] : [],
      usage: Number((kind === 'BBK' ? r.attributesMap.partUsage : r.attributesMap.commonAreaUsage) ?? 0),
      polygon: toPoly(floor),
      planArea: Number.isFinite(plan) ? plan : -1,
    });
  }

  // Asma kat: katın olağan oda tabanı kotu = o kattaki odaların en sık görülen taban kotu.
  // Farklı kottaki odalara zFloorOverride yazılır (şartname §5.2 ÖNERİ); örtüşme denetimi yalnız aynı kottakileri karşılaştırır.
  const finalParts: Part[] = parts.map((p) => {
    const counts = new Map<number, number>();
    for (const q of parts) if (q.storeyId === p.storeyId) counts.set(partFloorZ.get(q.id)!, (counts.get(partFloorZ.get(q.id)!) ?? 0) + 1);
    const usual = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];
    const z = partFloorZ.get(p.id)!;
    const withZ = usual !== undefined && Math.abs(z - usual) > 1 ? { ...p, zFloorOverride: z } : p;
    // Uzak kısım (H11a): alanının %90'ından fazlası bağlı olduğu BB parçasının dışında
    if (p.kind === 'BBK') {
      const hosts = sectionParts.filter((s) => p.sectionPartIds.includes(s.id));
      const inside = hosts.reduce((acc, h) => acc + polyIntersectionAreaM2(p.polygon, h.outline), 0);
      const area = polyAreaM2(p.polygon);
      if (area > 0 && inside < area * 0.1) {
        notes.push({ objectGmlId: sourceIds.get(p.id) ?? p.id, message: 'Uzak kısım olarak işaretlendi (BB parçasının dışında).' });
        return { ...withZ, remote: true };
      }
    }
    return withZ;
  });
  parts.splice(0, parts.length, ...finalParts);

  const epsgNum = Number(model.srsName.replace(/^EPSG:/, ''));
  const epsg = (EPSG as readonly number[]).includes(epsgNum) ? (epsgNum as DesignProject['georef']['epsg']) : 5254;
  const project: DesignProject = {
    schemaVersion: 1,
    id: projectId,
    name: cid ? `M-${cid} (GML'den çıkarıldı)` : model.fileName,
    idSeq: seq,
    georef: { epsg, originE: E0, originN: N0, zeroElevationOrthometric: 0 },
    parcel: {
      takbisPropertyIdentityNumber: Number(mb?.attributesMap.takbisPropertyIdentityNumber ?? 0),
      blockNumber: mb?.attributesMap.blockNumber ?? '',
      parcelNumber: mb?.attributesMap.parcelNumber ?? '',
      takbisNeighbourhoodReference: Number(mb?.attributesMap.takbisNeighbourhoodReference ?? 0),
    },
    buildings: [{ id: nid('bina'), letter: cid.split('-').pop() ?? 'A', storeys, sections, sectionParts, parts }],
  };
  return { project: { ...project, idSeq: seq }, sourceIds, notes };
}

/** Toplam çizim alanı (m²), denetim ve özet için. */
export function totalPartArea(project: DesignProject): number {
  return (project.buildings[0]?.parts ?? []).reduce((s, p) => s + polyAreaM2(p.polygon), 0);
}
