// M4 — İçe aktarılan GML'den tasarım modeli çıkarma (şartname §10.4 madde 1: "yarı otomatik").
// Kat sınırı: kat geometrisinin en alt yatay Floor_ poligonları. BB parçası: BB küvetinin alt taban poligonu.
// Kısım/OA: oda FloorSurface poligonu. Koordinatlar tam metre kökene göre mm tamsayıya çevrilir (§4.1).
import type { ImportedCityObject, ImportedModel, ImportedPolygon } from '../gml/gmlReader.ts';
import { uuidv5 } from '../hash/canonical.ts';
import { normalizeOrientation, polyAreaM2, polyIntersectionAreaM2 } from './geometry2d.ts';
import type { Balcony, BuildingInfo, DesignProject, IndependentSection, Opening, Part, Poly2, Pt2, Pt3, Roof, RoomInstallation, SectionInfo, SectionPart, Storey } from './types.ts';
import { DEFAULT_BUILDING_INFO, DEFAULT_SECTION_INFO } from './types.ts';

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
  const toPt3 = (v: { e: number; n: number; z: number }): Pt3 => ({ x: Math.round((v.e - E0) * 1000), y: Math.round((v.n - N0) * 1000), z: Math.round(v.z * 1000) });
  const toRing3 = (vs: readonly { e: number; n: number; z: number }[]) => {
    const r = vs.map(toPt3);
    if (r.length > 1 && r[0].x === r[r.length - 1].x && r[0].y === r[r.length - 1].y && r[0].z === r[r.length - 1].z) r.pop();
    return r;
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
    const bbPolys = polysOf(bb);
    const floor = largest(bb, lowestHorizontal(bbPolys.filter((p) => p.prefix === 'Floor_')), 'BB alt tabanı');
    if (!floor) continue;
    // Fiziksel kat taban kotundan bulunur. GML'de çok katlı BB parçası giriş katının grubuna bağlıdır (groupMember),
    // bu yüzden bb.storeyGmlId fiziksel katı göstermeyebilir (Ornek4: BB 1'in iki parçası).
    const zMm = Math.round(floor.minZ * 1000);
    const st = physicalStorey(zMm);
    if (!st) {
      notes.push({ objectGmlId: bb.gmlId, message: 'BB parçasının katı taban kotundan belirlenemedi; atlandı.' });
      continue;
    }
    const zMaxMm = bbPolys.length > 0 ? Math.round(Math.max(...bbPolys.map((p) => p.maxZ)) * 1000) : st.zBottom + st.height;
    const id = nid('bb');
    spIdByGml.set(bb.gmlId, id);
    sourceIds.set(id, bb.gmlId);
    const usage = Number(a.independentSectionUsage ?? 1001);
    const grpStId = bb.storeyGmlId ? storeyIdByGml.get(bb.storeyGmlId) : undefined;
    sectionParts.push({
      id,
      sectionId,
      storeyId: st.id,
      ...(grpStId && grpStId !== st.id ? { groupStoreyId: grpStId } : {}),
      usage: (usage >= 1001 && usage <= 1006 ? usage : 1001) as SectionPart['usage'],
      outline: toPoly(floor),
      ...(Math.abs(zMm - st.zBottom) > 1 ? { zFloorOverride: zMm } : {}),
      ...(Math.abs(zMaxMm - (st.zBottom + st.height)) > 1 ? { zTopOverride: zMaxMm } : {}),
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
    if (!storeyId || !st) {
      notes.push({ objectGmlId: r.gmlId, message: 'Odanın katı belirlenemedi; atlandı.' });
      continue;
    }
    const ceilIds = r.surfaces.filter((s) => s.tag === 'CeilingSurface').flatMap((s) => [...s.polygonIds, ...s.xlinkHrefs.map((h) => h.replace(/^#/, ''))]);
    const ceilPolys = ceilIds.map((cid) => model.polygonsById[cid]).filter((p): p is ImportedPolygon => p !== undefined);
    const zCeilMaxMm = ceilPolys.length > 0 ? Math.round(Math.max(...ceilPolys.map((p) => p.maxZ)) * 1000) : undefined;
    const hasSlopedOrMultiCeil =
      ceilPolys.some((p) => p.maxZ - p.minZ >= 0.001) ||
      ceilPolys.length > 1;
    const ceilingFaces = hasSlopedOrMultiCeil
      ? ceilPolys.map((p) => ({ outer: toRing3(p.exteriorRing.vertices), holes: p.interiorRings.map((h) => toRing3(h.vertices)) }))
      : undefined;
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
      ...(ceilingFaces ? { ceilingFaces } : {}),
      ...(zCeilMaxMm !== undefined && Math.abs(zCeilMaxMm - (st.zBottom + st.height)) > 1 ? { zTopOverride: zCeilMaxMm } : {}),
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

  // Döşeme kalınlığı (M5): kattaki olağan oda taban kotu − kat taban kotu (Ornek6: 200 mm). Bulunamazsa 200.
  const slabFinal = storeys.map((s) => {
    const counts = new Map<number, number>();
    for (const p of parts) {
      if (p.storeyId !== s.id || p.zFloorOverride !== undefined) continue;
      const d = partFloorZ.get(p.id)! - s.zBottom;
      if (d > 0 && d < 1000) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
    return best ? { ...s, slabThickness: best[0] } : s;
  });
  storeys.splice(0, storeys.length, ...slabFinal);

  // Açıklıklar (M5, §4.2 Opening). Önce oda açıklıkları (T4) okunur; aynı fiziksel açıklığın ikinci oda temsili ve
  // bina (LoD2, T1) temsili, aynı duvar diliminde (paralel, ≤ 1000 mm, örtüşen) ve aynı kotta olduğu için tekrar eklenmez.
  const openings: Opening[] = [];
  const placed: { o: Opening; zb: number; zt: number }[] = [];
  const partIdByGml = new Map<string, string>();
  for (const p of parts) partIdByGml.set(sourceIds.get(p.id) ?? '', p.id);
  const hostOf = (o: ImportedCityObject) => (o.parentGmlId ? model.objectsById[o.parentGmlId] : undefined);
  const isRoomHost = (o: ImportedCityObject) => {
    const h = hostOf(o);
    return h !== undefined && (h.prefix === 'BBK_' || h.prefix === 'OA_');
  };
  const wallProjection = (o: Opening, a: Pt2, b: Pt2): { sameSlice: boolean; L: number; M: number; tA: number; tB: number; lo: number; hi: number } => {
    const ux = o.anchor.b.x - o.anchor.a.x;
    const uy = o.anchor.b.y - o.anchor.a.y;
    const L = Math.hypot(ux, uy);
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const M = Math.hypot(vx, vy);
    if (L < 1 || M < 1) return { sameSlice: false, L, M, tA: 0, tB: 0, lo: 0, hi: 0 };
    if (Math.abs(ux * vy - uy * vx) / (L * M) > Math.sin((0.5 * Math.PI) / 180)) return { sameSlice: false, L, M, tA: 0, tB: 0, lo: 0, hi: 0 };
    const dist = Math.abs((a.x - o.anchor.a.x) * uy - (a.y - o.anchor.a.y) * ux) / L;
    if (dist > 1000) return { sameSlice: false, L, M, tA: 0, tB: 0, lo: 0, hi: 0 };
    const t = (p: Pt2) => ((p.x - o.anchor.a.x) * ux + (p.y - o.anchor.a.y) * uy) / L;
    const tA = t(a);
    const tB = t(b);
    const lo = Math.max(0, Math.min(tA, tB));
    const hi = Math.min(L, Math.max(tA, tB));
    return { sameSlice: true, L, M, tA, tB, lo, hi };
  };
  const sameWall = (o: Opening, a: Pt2, b: Pt2): boolean => {
    const pr = wallProjection(o, a, b);
    return pr.sameSlice && pr.hi - pr.lo >= 0.5 * Math.min(pr.L, pr.M);
  };
  const srcOpenings = model.objects.filter((o) => o.prefix === 'KAPI_' || o.prefix === 'PEN_');
  const ordered = [...srcOpenings.filter(isRoomHost), ...srcOpenings.filter((o) => !isRoomHost(o))];
  for (const op of ordered) {
    const poly = polysOf(op)[0];
    if (!poly) {
      notes.push({ objectGmlId: op.gmlId, message: 'Açıklık poligonu bulunamadı.' });
      continue;
    }
    const bottom = toRing(poly.exteriorRing.vertices.filter((v) => Math.abs(v.z - poly.minZ) < 0.0005));
    const uniq = bottom.filter((p, i) => bottom.findIndex((q) => q.x === p.x && q.y === p.y) === i);
    if (uniq.length < 2) {
      notes.push({ objectGmlId: op.gmlId, message: 'Açıklık alt kenarı bulunamadı (dikdörtgen değil).' });
      continue;
    }
    let a = uniq[0];
    let b = uniq[1];
    for (const p of uniq) for (const q of uniq) if (Math.hypot(p.x - q.x, p.y - q.y) > Math.hypot(a.x - b.x, a.y - b.y)) [a, b] = [p, q];
    const kind: Opening['kind'] = op.prefix === 'KAPI_' ? 'door' : 'window';
    const zb = Math.round(poly.minZ * 1000);
    const zt = Math.round(poly.maxZ * 1000);
    const host = hostOf(op);
    let storeyId: string | undefined;
    let hostPartId: string | undefined;
    let zBaseOverride: number | undefined;
    let base: number;
    let sill: number;
    if (host && isRoomHost(op)) {
      const pid = partIdByGml.get(host.gmlId);
      const part = parts.find((p) => p.id === pid);
      if (!part) {
        notes.push({ objectGmlId: op.gmlId, message: 'Açıklığın odası tasarımda yok; atlandı.' });
        continue;
      }
      storeyId = part.storeyId;
      hostPartId = part.id;
      base = partFloorZ.get(part.id)!;
      zBaseOverride = part.zFloorOverride;
      // N20 / K45a: Kaynak GML'de oda kapısı tabandan (zb === base) başlıyorsa delik tabanı +10 mm alınır
      sill = kind === 'door' && zb <= base ? 10 : Math.max(1, zb - base);
    } else {
      const st = physicalStorey(zb);
      storeyId = st?.id;
      const defaultBase = (st?.zBottom ?? 0) + (st?.slabThickness ?? 200);
      // Eğer LoD2 açıklığı çatı arası / asma kat kotundaysa o kottaki odaya hizala
      const matchingAtticPart = st
        ? parts.find((p) => p.storeyId === st.id && p.zFloorOverride !== undefined && zb >= p.zFloorOverride - 50 && zt <= (p.zTopOverride ?? st.zBottom + st.height) + 50)
        : undefined;
      base = matchingAtticPart?.zFloorOverride ?? defaultBase;
      zBaseOverride = matchingAtticPart?.zFloorOverride;
      // LoD2 kapısı zFloorTop'tan başlar; odadaki karşılığı +10 mm (K45a)
      sill = kind === 'door' ? Math.max(10, zb - base) : Math.max(1, zb - base);
    }
    if (!storeyId) continue;
    const zbEff = base + sill;
    if (zt - zbEff < 50) continue;

    // Oda ↔ oda: kotlar yakın (±60 mm, N20). Bina (LoD2) ↔ oda: aynı duvar diliminde ve kot aralıkları %50'den fazla örtüşüyorsa
    // aynı açıklıktır (bazı üreticiler LoD2 açıklığını farklı denizlik/tepe kotuyla yazıyor; Ornek4).
    const zOverlap = (x: { zb: number; zt: number }) => Math.min(x.zt, zt) - Math.max(x.zb, zbEff) >= 0.5 * Math.min(x.zt - x.zb, zt - zbEff);
    const fromRoom = isRoomHost(op);
    const dup = placed.find(
      (x) =>
        x.o.kind === kind &&
        x.o.storeyId === storeyId &&
        sameWall(x.o, a, b) &&
        (fromRoom ? Math.abs(x.zt - zt) <= 2 && (kind === 'door' ? Math.abs(x.zb - zbEff) <= 60 : Math.abs(x.zb - zbEff) <= 2) : zOverlap(x)),
    );
    if (dup) continue;

    // R4: Aynı duvar diliminde ve çakışan Z aralığında başka bir açıklık (ör. birleşik balkon kapısı + pencere, Ornek2) varsa
    // yatay aralığı örtüşmeyecek biçimde kırp veya tamamen içeride kalıyorsa atla (V-035 / V-039 önlemi).
    let skipOverlapping = false;
    for (const x of placed) {
      if (x.o.storeyId !== storeyId) continue;
      if (Math.min(x.zt, zt) - Math.max(x.zb, zbEff) <= -10) continue;
      const pr = wallProjection(x.o, a, b);
      if (!pr.sameSlice || pr.hi - pr.lo <= -10) continue;
      const vx = b.x - a.x;
      const vy = b.y - a.y;
      const M = Math.hypot(vx, vy);
      if (M < 1) {
        skipOverlapping = true;
        break;
      }
      // Mevcut açıklığın [0, L] aralığını yeni açıklığın [0, M] parametresine izdüşür
      const sOnNew = (p: Pt2) => ((p.x - a.x) * vx + (p.y - a.y) * vy) / M;
      const xLo = Math.min(sOnNew(x.o.anchor.a), sOnNew(x.o.anchor.b)) - 10;
      const xHi = Math.max(sOnNew(x.o.anchor.a), sOnNew(x.o.anchor.b)) + 10;
      const leftSpan = Math.max(0, Math.min(M, xLo));
      const rightSpan = Math.max(0, M - Math.max(0, xHi));
      if (leftSpan >= rightSpan && leftSpan >= 150) {
        b = { x: Math.round(a.x + (vx / M) * leftSpan), y: Math.round(a.y + (vy / M) * leftSpan) };
        notes.push({ objectGmlId: op.gmlId, message: `Aynı duvar dilimindeki ${sourceIds.get(x.o.id) ?? x.o.id} açıklığıyla çakışmaması için kırpıldı.` });
      } else if (rightSpan > leftSpan && rightSpan >= 150) {
        const startS = Math.max(0, xHi);
        a = { x: Math.round(a.x + (vx / M) * startS), y: Math.round(a.y + (vy / M) * startS) };
        notes.push({ objectGmlId: op.gmlId, message: `Aynı duvar dilimindeki ${sourceIds.get(x.o.id) ?? x.o.id} açıklığıyla çakışmaması için kırpıldı.` });
      } else {
        skipOverlapping = true;
        notes.push({ objectGmlId: op.gmlId, message: `Aynı duvar diliminde ${sourceIds.get(x.o.id) ?? x.o.id} ile üst üste bindiği için atlandı.` });
        break;
      }
    }
    if (skipOverlapping) continue;

    const usage = Number((kind === 'door' ? op.attributesMap.doorUsage : op.attributesMap.windowUsage) ?? (kind === 'door' ? 1004 : 1001));
    const o: Opening = {
      id: nid('acik'),
      kind,
      usage,
      storeyId,
      anchor: { a, b },
      sill,
      height: zt - zbEff,
      ...(hostPartId ? { hostPartId } : {}),
      ...(zBaseOverride !== undefined ? { zBaseOverride } : {}),
    };
    sourceIds.set(o.id, op.gmlId);
    openings.push(o);
    placed.push({ o, zb: zbEff, zt });
  }

  // ---- M6: bina öznitelikleri, bölüm ek öznitelikleri, bakılar, balkonlar, çatı, TIC
  const multi = (o: ImportedCityObject | undefined, name: string) => (o?.attributes ?? []).filter((x) => x.name === name).map((x) => Number(x.cleanValue)).filter((v) => Number.isFinite(v));
  const intOrNull = (v: string | undefined) => (v !== undefined && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
  const ma = mb?.attributesMap ?? {};
  const info: BuildingInfo = {
    maksIdentityNumber: intOrNull(ma.maksIdentityNumber),
    maksIntegrationState: intOrNull(ma.maksIntegrationState) ?? DEFAULT_BUILDING_INFO.maksIntegrationState,
    buildingType: intOrNull(ma.buildingType) ?? DEFAULT_BUILDING_INFO.buildingType,
    geometrySuitability: multi(mb, 'geometrySuitability').length ? multi(mb, 'geometrySuitability') : DEFAULT_BUILDING_INFO.geometrySuitability,
    tenderRegistrationNumber: ma.tenderRegistrationNumber ?? '',
    architecturalPlanID: ma.architecturalPlanID ?? '',
    additionalNote: ma.additionalNote ?? '-',
    elevatorCount: intOrNull(ma.elevatorCount) ?? 0,
    buildingHeight: ma.buildingHeight !== undefined && Number.isFinite(Number(ma.buildingHeight)) ? Number(ma.buildingHeight) : null,
    architecturalProjectConfirmationDate: ma.architecturalProjectConfirmationDate ?? '',
  };
  const sectionInfo: Record<string, SectionInfo> = {};
  const cardinalDirections: Record<string, number[]> = {};
  for (const bb of model.objects.filter((o) => o.prefix === 'BB_')) {
    const spId = spIdByGml.get(bb.gmlId);
    const sp = sectionParts.find((s) => s.id === spId);
    if (!sp) continue;
    const a = bb.attributesMap;
    sectionInfo[sp.sectionId] ??= {
      maksIdentityNumber: intOrNull(a.maksIdentityNumber),
      maksNumaratajIdentityNumber: intOrNull(a.maksNumaratajIdentityNumber),
      maksIntegrationState: intOrNull(a.maksIntegrationState) ?? DEFAULT_SECTION_INFO.maksIntegrationState,
      integrationState: intOrNull(a.integrationState) ?? DEFAULT_SECTION_INFO.integrationState,
      geometrySuitability: intOrNull(a.geometrySuitability) ?? DEFAULT_SECTION_INFO.geometrySuitability,
      additionalNote: a.additionalNote ?? '-',
    };
    const dirs = multi(bb, 'independentSectionCardinalDirection');
    if (dirs.length) cardinalDirections[sp.id] = dirs;
  }

  // Balkon / teras: dış sınır = taban üst yüzü; bina ile ortak kenar = kat sınırı üzerindeki kenarlar
  const balconies: Balcony[] = [];
  const onSegment = (p: Pt2, a: Pt2, b: Pt2, tol: number) => {
    const L = Math.hypot(b.x - a.x, b.y - a.y);
    if (L < 1) return false;
    const t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / L;
    const d = Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / L;
    return d <= tol && t >= -tol && t <= L + tol;
  };
  const segDist = (p: Pt2, a: Pt2, b: Pt2) => {
    const L2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    const t = L2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / L2));
    return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
  };
  for (const o of model.objects.filter((x) => x.prefix === 'BLKN_' || x.prefix === 'TRS_')) {
    const ps = polysOf(o);
    const floors = ps.filter((p) => p.prefix === 'Floor_' && p.maxZ - p.minZ < 0.001);
    if (floors.length === 0) {
      notes.push({ objectGmlId: o.gmlId, message: 'Balkon tabanı bulunamadı; atlandı.' });
      continue;
    }
    const top = floors.reduce((a, b) => (b.minZ > a.minZ ? b : a));
    const bottom = floors.reduce((a, b) => (b.minZ < a.minZ ? b : a));
    const st = physicalStorey(Math.round(bottom.minZ * 1000));
    if (!st) continue;
    const outline = normalizeOrientation({ outer: toRing(top.exteriorRing.vertices), holes: [] }).outer;
    const storeyEdges = st.outline.flatMap((pl) => [pl.outer, ...pl.holes].flatMap((r) => r.map((p, i) => [p, r[(i + 1) % r.length]] as const)));
    const edges = outline.map((p, i) => [p, outline[(i + 1) % outline.length]] as const);
    const attachedEdges = edges.filter(([a, b]) => storeyEdges.some(([c, d]) => onSegment(a, c, d, 2) && onSegment(b, c, d, 2)));
    // Korkuluk tepesi: en yüksek Wall_ noktası; duvar yoksa korkuluksuz (0)
    const wallsB = ps.filter((p) => p.prefix === 'Wall_');
    const wallTop = wallsB.length ? Math.max(...wallsB.map((p) => p.maxZ)) : top.minZ;
    const cap = wallsB.filter((p) => p.maxZ - p.minZ < 0.001 && Math.abs(p.minZ - wallTop) < 0.001).reduce<ImportedPolygon | undefined>((a, b) => (!a || b.areaM2 > a.areaM2 ? b : a), undefined);
    const parapetHeight = Math.max(0, Math.round((wallTop - top.minZ) * 1000));
    const free = edges.filter((e) => !attachedEdges.includes(e));
    const ds = cap
      ? toRing(cap.exteriorRing.vertices)
          .filter((v) => edges.every(([a, b]) => segDist(v, a, b) > 5))
          .map((v) => Math.min(...free.map(([a, b]) => segDist(v, a, b))))
          .sort((a, b) => a - b)
      : [];
    const parapetThickness = ds.length ? Math.round(ds[Math.floor(ds.length / 2)]) : 100;
    const ref = o.attributesMap.independentSectionObjectReference;
    const id = nid(o.prefix === 'TRS_' ? 'teras' : 'balkon');
    sourceIds.set(id, o.gmlId);
    balconies.push({
      id,
      kind: o.prefix === 'TRS_' ? 'Teras' : 'Balkon',
      storeyId: st.id,
      sectionPartId: ref && ref !== '-1' ? (spIdByGml.get(ref) ?? null) : null,
      outline,
      attachedEdges,
      parapetHeight,
      parapetThickness,
      planArea: Number(o.attributesMap.planArea ?? -1),
    });
  }

  // M8: İç yapılar (RoomInstallation: BBKIY_ ve OAIY_ — §3.9, §4.2)
  const installations: RoomInstallation[] = [];
  for (const iy of model.objects.filter((o) => o.prefix === 'BBKIY_' || o.prefix === 'OAIY_')) {
    const floorIds = iy.surfaces.filter((s) => s.tag === 'FloorSurface').flatMap((s) => [...s.polygonIds, ...s.xlinkHrefs.map((h) => h.replace(/^#/, ''))]);
    const floor = largest(iy, floorIds.map((id) => model.polygonsById[id]).filter((p): p is ImportedPolygon => p !== undefined), 'İç yapı tabanı');
    if (!floor) continue;
    const parentGml = iy.parentGmlId;
    const partId = parentGml ? partIdByGml.get(parentGml) : undefined;
    if (!partId) {
      notes.push({ objectGmlId: iy.gmlId, message: 'İç yapının bağlı olduğu oda bulunamadı; atlandı.' });
      continue;
    }
    const ceilIds = iy.surfaces.filter((s) => s.tag === 'CeilingSurface').flatMap((s) => [...s.polygonIds, ...s.xlinkHrefs.map((h) => h.replace(/^#/, ''))]);
    const ceilPolys = ceilIds.map((cid) => model.polygonsById[cid]).filter((p): p is ImportedPolygon => p !== undefined);
    const zCeilMaxMm = ceilPolys.length > 0 ? Math.round(Math.max(...ceilPolys.map((p) => p.maxZ)) * 1000) : undefined;
    const hasSlopedOrMultiCeil =
      ceilPolys.some((p) => p.maxZ - p.minZ >= 0.001) ||
      ceilPolys.length > 1;
    const ceilingFaces = hasSlopedOrMultiCeil
      ? ceilPolys.map((p) => ({ outer: toRing3(p.exteriorRing.vertices), holes: p.interiorRings.map((h) => toRing3(h.vertices)) }))
      : undefined;
    const u = Number(iy.attributesMap.roomInstallationUsage ?? 1001);
    const usage: RoomInstallation['usage'] = u === 1002 || u === 1003 ? u : 1001;
    const id = nid(iy.prefix === 'BBKIY_' ? 'bbkiy' : 'oaiy');
    sourceIds.set(id, iy.gmlId);
    installations.push({
      id,
      partId,
      usage,
      polygon: toPoly(floor),
      ...(ceilingFaces ? { ceilingFaces } : {}),
      ...(zCeilMaxMm !== undefined ? { zTopOverride: zCeilMaxMm } : {}),
    });
  }

  // Çatı: içe aktarılan Roof_ yüzleri elle çatı olarak (§4.2 Roof.mode = 'manual')
  const roofPolys = mb ? polysOf(mb).filter((p) => p.prefix === 'Roof_') : [];
  const roof: Roof | undefined = roofPolys.length ? { mode: 'manual', eaveOverhang: 0, thickness: 0, pitchDeg: 0, facets: roofPolys.map((p) => ({ outer: toRing3(p.exteriorRing.vertices), holes: p.interiorRings.map((h) => toRing3(h.vertices)) })) } : undefined;
  if (model.ticLineStrings.length > 1) notes.push({ objectGmlId: mb?.gmlId ?? '', message: `TIC ${model.ticLineStrings.length} çizgiden oluşuyor; ilki alındı.` });
  const tic = model.ticLineStrings[0] ? toRing3(model.ticLineStrings[0].vertices) : undefined;

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
    buildings: [
      {
        id: nid('bina'),
        letter: cid.split('-').pop() ?? 'A',
        storeys,
        sections,
        sectionParts,
        parts,
        openings,
        info,
        sectionInfo,
        cardinalDirections,
        balconies,
        ...(installations.length ? { installations } : {}),
        ...(roof ? { roof } : {}),
        ...(tic ? { tic } : {}),
      },
    ],
  };
  return { project: { ...project, idSeq: seq }, sourceIds, notes };
}

/** Toplam çizim alanı (m²), denetim ve özet için. */
export function totalPartArea(project: DesignProject): number {
  return (project.buildings[0]?.parts ?? []).reduce((s, p) => s + polyAreaM2(p.polygon), 0);
}
