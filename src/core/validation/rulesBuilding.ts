// M2 — Şartname §6.5 (öznitelikler), §6.6 Mimari Bina, §6.7 LoD0/LoD1/LoD2/TIC, §6.8 Kat
import type { ImportedCityObject } from '../gml/gmlReader.ts';
import { maxZOf, minZOf, openingKey as openingKeyOf, planSignedArea, uniqueRing } from './geom.ts';
import type { Emit, FileRegime, RuleContext, RuleDefinition } from './types.ts';

/**
 * Önek → zorunlu öznitelikler (V-061). Rejim S listesi Ornek1–6'nın ortak kümesidir (9 dosyada ölçüldü).
 * Çoklu olabilenler: independentSectionCardinalDirection, storeyUsage.
 */
const REQUIRED_S: Readonly<Record<string, readonly string[]>> = {
  MB_: [
    'additionalNote', 'architecturalPlanID', 'architecturalProjectConfirmationDate', 'blockNumber', 'buildingHeight',
    'buildingType', 'constructionID', 'elevatorCount', 'geometrySuitability', 'maksIdentityNumber', 'maksIntegrationState',
    'parcelNumber', 'roofProjectionArea', 'takbisNeighbourhoodReference', 'takbisPropertyIdentityNumber',
    'tenderRegistrationNumber', 'totalIndependentSectionCount',
  ],
  BB_: [
    'additionalNote', 'blockName', 'entrance', 'geometrySuitability', 'independentSectionCalculatedArea',
    'independentSectionCardinalDirection', 'independentSectionNumber', 'independentSectionPlanGrossArea',
    'independentSectionPlanNetArea', 'independentSectionUsage', 'integrationState', 'maksIdentityNumber',
    'maksIntegrationState', 'maksNumaratajIdentityNumber', 'partCount', 'propertyLot', 'registeredFloorDefinition',
    'registeredInstallation', 'registeredQuality', 'takbisPropertyIdentityNumber',
  ],
  BBK_: ['additionalNote', 'calculatedArea', 'geometrySuitability', 'independentSectionObjectReference', 'partUsage', 'planArea', 'volume'],
  OA_: ['calculatedArea', 'commonAreaUsage', 'storeyObjectReference'],
  BLKN_: ['additionalNote', 'calculatedArea', 'geometrySuitability', 'independentSectionObjectReference', 'planArea'],
  TRS_: ['additionalNote', 'calculatedArea', 'geometrySuitability', 'independentSectionObjectReference', 'planArea'],
  K_: ['independentSectionCount', 'storeyNumber', 'storeyUsage'],
  KAPI_: ['doorUsage'],
  PEN_: ['windowUsage'],
  BBKIY_: ['roomInstallationUsage'],
  OAIY_: ['roomInstallationUsage'],
};

/** Rejim E'de bulunmayan (o dönem istenmeyen) öznitelikler — Amasya ve Sincan'da ölçüldü (N19). */
const NOT_REQUIRED_IN_E: ReadonlySet<string> = new Set([
  'maksIntegrationState', 'maksNumaratajIdentityNumber', 'propertyLot', 'registeredFloorDefinition',
  'registeredInstallation', 'registeredQuality',
]);

const MULTI_ALLOWED: ReadonlySet<string> = new Set(['independentSectionCardinalDirection', 'storeyUsage']);

/** TR büyük harf gerektiren metin alanları (V-064; registeredFloorDefinition hariç — OY-04). */
const UPPERCASE_FIELDS: readonly string[] = ['registeredQuality', 'registeredInstallation', 'blockName'];

function requiredFor(prefix: string, regime: FileRegime): readonly string[] {
  const list = REQUIRED_S[prefix] ?? [];
  return regime === 'E' ? list.filter((a) => !NOT_REQUIRED_IN_E.has(a)) : list;
}

const num = (v: string | undefined): number => (v === undefined || v.trim() === '' ? Number.NaN : Number(v.trim()));

function storeyPolys(ctx: RuleContext, k: ImportedCityObject) {
  return ctx.polysOf(k);
}

export const BUILDING_RULES: readonly RuleDefinition[] = [
  { id: 'V-060', severity: 'H', source: 'Şartname §6.5, K99', status: 'okuyucuda', note: 'gmlReader.parseGenericAttributesFromNode' },
  {
    id: 'V-061',
    severity: 'H',
    source: 'Şartname §6.5 (zorunlu küme Ornek1–6 ortak kümesi; Rejim E farkı Amasya/Sincan, N19)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const o of ctx.model.objects) {
        const req = requiredFor(o.prefix, ctx.regime);
        if (req.length === 0) continue;
        const counts = new Map<string, number>();
        for (const a of o.attributes) counts.set(a.name, (counts.get(a.name) ?? 0) + 1);
        for (const name of req) {
          const c = counts.get(name) ?? 0;
          if (c === 0) emit({ message: `${o.gmlId}: zorunlu "${name}" özniteliği yok.`, targetGmlId: o.gmlId, tkgmMessage: `${name} bulunamadı.` });
        }
        for (const [name, c] of counts) {
          if (c > 1 && !MULTI_ALLOWED.has(name)) {
            emit({ message: `${o.gmlId}: "${name}" ${c} kez yazılmış (1 olmalı).`, targetGmlId: o.gmlId, tkgmMessage: `${name} birden fazla bulundu. Sadece bir adet olmalıdır.` });
          }
        }
      }
    },
  },
  {
    id: 'V-062',
    severity: 'H',
    source: 'Şartname §6.5 (TAB/boşluk V-214 BİLGİ ile ayrıca raporlanır, değer kırpılarak denetlenir)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const o of ctx.model.objects) {
        for (const a of o.attributes) {
          const v = a.cleanValue;
          let ok = true;
          if (a.type === 'int') ok = /^-?\d+$/.test(v);
          else if (a.type === 'double') ok = v !== '' && Number.isFinite(Number(v));
          else if (a.type === 'date') ok = /^\d{4}-\d{2}-\d{2}$/.test(v);
          if (!ok) emit({ message: `${o.gmlId}: "${a.name}" (${a.type}) değeri geçersiz: "${a.rawValue}".`, targetGmlId: o.gmlId, tkgmMessage: `${a.name} geçerli bir değer değil.` });
        }
      }
    },
  },
  { id: 'V-063', severity: 'H', source: 'Şartname §6.5, K60', status: 'okuyucuda', note: 'gmlReader + resources/codelists' },
  {
    id: 'V-064',
    severity: 'U',
    source: 'Şartname §6.5 (DOĞRULANMALI), OY-04',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const o of ctx.byPrefix('BB_')) {
        for (const f of UPPERCASE_FIELDS) {
          const v = o.attributesMap[f];
          if (v && v !== v.toLocaleUpperCase('tr-TR')) {
            emit({ message: `${o.gmlId}: "${f}" değeri TR büyük harf değil ("${v}").`, targetGmlId: o.gmlId, tkgmMessage: `${f} değeri büyük harfle yazılmalıdır.` });
          }
        }
      }
    },
  },

  // ---------------- §6.6 Mimari Bina ----------------
  {
    id: 'V-070',
    severity: 'H',
    source: 'Şartname §6.6',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const a = ctx.building?.attributesMap;
      if (!a) return;
      const cid = a.constructionID ?? '';
      const tpi = a.takbisPropertyIdentityNumber ?? '';
      if (!new RegExp(`^${tpi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-[A-ZÇĞİÖŞÜ]+$`).test(cid)) {
        emit({ message: `constructionID (${cid}) = takbisPropertyIdentityNumber (${tpi}) + "-HARF" olmalı.`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'TakbisPropertyIdentityNumber ile yapıID uyuşmuyor.' });
      }
    },
  },
  {
    id: 'V-071',
    severity: 'H',
    source: 'Şartname §6.6',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const a = ctx.building?.attributesMap;
      if (a && a.buildingType !== '1001') emit({ message: `buildingType 1001 (Ana Yapı) olmalı (bulunan: ${a.buildingType}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'MimariBina bina tipine 1002 (Diğer Yapı) atanamaz.' });
    },
  },
  {
    id: 'V-072',
    severity: 'H',
    source: 'Şartname §6.6',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const a = ctx.building?.attributesMap;
      if (a && a.geometrySuitability !== '1006') emit({ message: `Bina geometrySuitability 1006 olmalı (bulunan: ${a.geometrySuitability}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Sürdürülebilirlik kapsamındaki üretimlerde Bina geometrik uygunluğu 1006 olarak girilmelidir.' });
    },
  },
  {
    id: 'V-073',
    severity: 'H',
    source: 'Şartname §6.6',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const a = ctx.building?.attributesMap;
      if (a && (a.tenderRegistrationNumber ?? '') !== '') emit({ message: `tenderRegistrationNumber boş olmalı (bulunan: ${a.tenderRegistrationNumber}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'İhaleKayıtNo boş bırakılmalı.' });
    },
  },
  {
    id: 'V-074',
    severity: 'H',
    source: 'Şartname §6.6',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const a = ctx.building?.attributesMap;
      if (a && (a.architecturalPlanID ?? '') !== '') emit({ message: `architecturalPlanID boş olmalı (bulunan: ${a.architecturalPlanID}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Mimari plan id boş bırakılmalıdır.' });
    },
  },
  {
    id: 'V-075',
    severity: 'H',
    source: 'Şartname §6.6, REHBER',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const a = ctx.building?.attributesMap;
      if (a && a.maksIntegrationState !== undefined && a.maksIntegrationState !== '1003') {
        emit({ message: `Bina maksIntegrationState 1003 olmalı (bulunan: ${a.maksIntegrationState}).`, targetGmlId: ctx.building?.gmlId });
      }
    },
  },
  {
    id: 'V-076',
    severity: 'U',
    source: 'Şartname §6.6, K31. Ölçüldü: Ornek1 beyan 66, benzersiz BB no 67 (N21), TKGM kabul etmiş → UYARI',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const a = ctx.building?.attributesMap;
      if (!a) return;
      const declared = num(a.totalIndependentSectionCount);
      const bbNos = new Set(ctx.byPrefix('BB_').map((b) => `${b.attributesMap.blockName ?? ''}|${b.attributesMap.entrance ?? ''}|${b.attributesMap.independentSectionNumber ?? ''}`));
      const unique5 = ctx.model.landShareAnalysis.uniqueBbCount;
      if (declared !== bbNos.size && declared !== unique5) {
        emit({ message: `totalIndependentSectionCount (${a.totalIndependentSectionCount}) ≠ benzersiz BB sayısı (${bbNos.size}; 5'li anahtarla ${unique5}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Toplam bağımsız bölüm sayısı gmldeki ile uyuşmuyor.' });
      }
    },
  },
  {
    id: 'V-077',
    severity: 'H',
    source: 'Şartname §6.6',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const total = ctx.model.storeysAboveGround + ctx.model.storeysBelowGround;
      const kCount = ctx.byPrefix('K_').length;
      if (total <= 0) emit({ message: 'storeysAboveGround + storeysBelowGround sıfır.', targetGmlId: ctx.building?.gmlId, tkgmMessage: 'StoreysAboveGround ve StoreysBellowGround toplamı sıfır olamaz.' });
      else if (total !== kCount) emit({ message: `Kat sayısı beyanı (${ctx.model.storeysAboveGround}+${ctx.model.storeysBelowGround}=${total}) ≠ Kat nesnesi sayısı (${kCount}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Toplam kat adedi ile gml dosyasındaki kat adedi uyuşmuyor.' });
    },
  },
  {
    id: 'V-078',
    severity: 'H',
    source: 'Şartname §6.6, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const v = num(ctx.building?.attributesMap.roofProjectionArea);
      if (!(v > 0)) emit({ message: `roofProjectionArea > 0 olmalı (bulunan: ${ctx.building?.attributesMap.roofProjectionArea}).`, targetGmlId: ctx.building?.gmlId });
    },
  },
  {
    id: 'V-079',
    severity: 'U',
    source: 'Şartname §6.6 (Ç12, N23: saçak dahil olduğu için roofProjectionArea ≥ RoofEdge alanı beklenir)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const v = num(ctx.building?.attributesMap.roofProjectionArea);
      const edge = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0RoofEdge').reduce((s, p) => s + Math.abs(planSignedArea(p.exteriorRing.vertices)), 0);
      if (Number.isFinite(v) && edge > 0 && v + 0.01 < edge) {
        emit({ message: `roofProjectionArea (${v.toFixed(2)} m²) RoofEdge alanından (${edge.toFixed(2)} m²) küçük.`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'RoofProjectionArea değeri ile RoofEdge elemanından hesaplanan uymuyor.' });
      }
    },
  },
  {
    id: 'V-080',
    severity: 'H',
    source: 'Şartname §6.6, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const v = num(ctx.building?.attributesMap.buildingHeight);
      if (!(v > 0 && v < 950)) emit({ message: `buildingHeight 0 ile 950 arasında olmalı (bulunan: ${ctx.building?.attributesMap.buildingHeight}).`, targetGmlId: ctx.building?.gmlId });
    },
  },
  {
    id: 'V-081',
    severity: 'H',
    source: 'Şartname §6.6',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const v = ctx.building?.attributesMap.architecturalProjectConfirmationDate ?? '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) emit({ message: `Onay tarihi YYYY-AA-GG olmalı (bulunan: "${v}").`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'tarih formatı geçersiz.' });
    },
  },
  {
    id: 'V-082',
    severity: 'H',
    source: 'Şartname §6.6',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const v = num(ctx.building?.attributesMap.elevatorCount);
      if (!(v >= 0)) emit({ message: `elevatorCount ≥ 0 olmalı (bulunan: ${ctx.building?.attributesMap.elevatorCount}).`, targetGmlId: ctx.building?.gmlId });
    },
  },
  { id: 'V-083', severity: 'H', source: 'Şartname §6.6', status: 'sunucu', note: 'MEGSİS/TAKBİS sorgusu (T).' },
  { id: 'V-084', severity: 'H', source: 'Şartname §6.6', status: 'sunucu', note: 'BuildingService (T).' },
  { id: 'V-085', severity: 'H', source: 'Şartname §6.6', status: 'sunucu', note: 'MAKS (T).' },

  // ---------------- §6.7 LoD0, LoD1, LoD2, TIC ----------------
  {
    id: 'V-090',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (!/<bldg:lod2TerrainIntersection\b[\s\S]*?<gml:MultiCurve\b/.test(ctx.xml) || ctx.model.ticLineStrings.length === 0) {
        emit({ message: 'TIC (lod2TerrainIntersection / MultiCurve / LineString) yok.', targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Lod2TerrainIntersection özelliğinin içinde, MultiCurve elemanı bulunamadı.' });
      }
    },
  },
  {
    id: 'V-091',
    severity: 'H',
    source: 'Şartname §6.7, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (ctx.model.ticLineStrings.length > 0 && !ctx.model.ticLineStrings.some((t) => t.isClosed)) {
        // Birden fazla LineString ile kapanan TIC'de uçlar birbirine bağlanıyorsa kabul et
        const ends = ctx.model.ticLineStrings.flatMap((t) => [t.vertices[0], t.vertices[t.vertices.length - 1]]);
        const key = (p: { e: number; n: number; z: number }) => `${Math.round(p.e * 1000)},${Math.round(p.n * 1000)},${Math.round(p.z * 1000)}`;
        const c = new Map<string, number>();
        for (const p of ends) c.set(key(p), (c.get(key(p)) ?? 0) + 1);
        if ([...c.values()].some((n) => n % 2 !== 0)) emit({ message: 'TIC kapalı değil.', targetGmlId: ctx.building?.gmlId });
      }
    },
  },
  {
    id: 'V-092',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const fp = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0FootPrint');
      const re = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0RoofEdge');
      if (fp.length === 0) emit({ message: 'lod0FootPrint yok.', targetGmlId: ctx.building?.gmlId });
      if (re.length === 0) emit({ message: 'lod0RoofEdge yok.', targetGmlId: ctx.building?.gmlId });
    },
  },
  {
    id: 'V-093',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    note: 'V-094 aynı fonksiyonda.',
    run: (ctx, emit) => {
      const fp = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0FootPrint');
      if (fp.length === 0 || ctx.model.ticLineStrings.length === 0) return;
      const fpZ = minZOf(fp.flatMap((p) => p.exteriorRing.vertices));
      const ticMax = Math.max(...ctx.model.ticLineStrings.map((t) => maxZOf(t.vertices)));
      if (Math.abs(fpZ - ticMax) > 0.001 + 1e-9) {
        emit({ message: `FootPrint kotu (${fpZ.toFixed(3)}) TIC en üst noktası (${ticMax.toFixed(3)}) ile eşit değil.`, polygonGmlId: fp[0].gmlId, targetGmlId: ctx.building?.gmlId, tkgmMessage: "TIC'in en üst noktası ile footprintin yüksekliği eşit olmalıdır." });
      }
      if (fpZ + 0.001 < ticMax) {
        emit({ ruleId: 'V-094', message: 'FootPrint TIC eğrisinin altında kalıyor.', polygonGmlId: fp[0].gmlId, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'FootPrint, TIC eğrisinin altında kalmamalıdır.' });
      }
    },
  },
  { id: 'V-094', severity: 'H', source: 'Şartname §6.7', status: 'uygulandi', note: 'V-093 ile birlikte çalışır.' },
  {
    id: 'V-095',
    severity: 'U',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const fp = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0FootPrint');
      if (fp.length === 0 || ctx.model.ticLineStrings.length === 0) return;
      const ticMax = Math.max(...ctx.model.ticLineStrings.map((t) => maxZOf(t.vertices)));
      const fpZ = minZOf(fp.flatMap((p) => p.exteriorRing.vertices));
      const floorZs = ctx.byPrefix('K_').map((k) => k.minZ).filter((z): z is number => z !== null);
      if (floorZs.length === 0) return;
      const nearest = floorZs.reduce((best, z) => (Math.abs(z - ticMax) < Math.abs(best - ticMax) ? z : best), floorZs[0]);
      if (Math.abs(nearest - fpZ) > 0.001 + 1e-9) {
        emit({ message: `FootPrint (${fpZ.toFixed(3)}) TIC en üst noktasına en yakın kat tabanında (${nearest.toFixed(3)}) değil.`, targetGmlId: ctx.building?.gmlId, tkgmMessage: "TIC'in en üst noktasına en yakın olan katın tabanı FootPrint olarak atanmış olmalıdır." });
      }
    },
  },
  {
    id: 'V-096',
    severity: 'H',
    source: 'Şartname §6.7. RoofEdge = çatı en alt noktası kısmı UYARI: Ornek1 (0.10 m) ve Ornek2 (1.35 m) farklı, TKGM kabul etmiş',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const re = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0RoofEdge');
      if (re.length === 0) return;
      const zs = re.flatMap((p) => p.exteriorRing.vertices.map((v) => v.z));
      const zMin = Math.min(...zs);
      const zMax = Math.max(...zs);
      if (zMax - zMin > 0.001 + 1e-9) emit({ message: `RoofEdge tek kotta değil (${zMin.toFixed(3)}…${zMax.toFixed(3)}).`, polygonGmlId: re[0].gmlId, targetGmlId: ctx.building?.gmlId });
      const roof = ctx.model.polygons.filter((p) => p.surfaceTag === 'RoofSurface');
      if (roof.length > 0) {
        const roofMin = Math.min(...roof.map((p) => p.minZ));
        if (Math.abs(roofMin - zMin) > 0.001 + 1e-9) {
          emit({ severity: 'U', message: `RoofEdge kotu (${zMin.toFixed(3)}) çatının en alçak noktası (${roofMin.toFixed(3)}) ile aynı değil.`, polygonGmlId: re[0].gmlId, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'RoofEdge çatının en alt noktasıyla aynı hizada olmalıdır.' });
        }
      }
    },
  },
  {
    id: 'V-097',
    severity: 'U',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const fp = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0FootPrint');
      const re = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0RoofEdge');
      if (fp.length === 0 || re.length === 0) return;
      const xy = (ps: typeof fp) => new Set(ps.flatMap((p) => uniqueRing(p.exteriorRing.vertices).map((v) => `${Math.round(v.e * 1000)},${Math.round(v.n * 1000)}`)));
      const a = xy(fp);
      const b = xy(re);
      const same = a.size === b.size && [...a].every((k) => b.has(k));
      if (!same) emit({ message: 'FootPrint ve RoofEdge planda aynı konturda değil (kademeli yapıda olağandır).', targetGmlId: ctx.building?.gmlId, tkgmMessage: 'FootPrint ve RoofEdge üst üste oturmalıdır.' });
    },
  },
  {
    id: 'V-098',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const m = /<bldg:lod1Solid\b[\s\S]*?<\/bldg:lod1Solid>/.exec(ctx.xml);
      if (!m) {
        emit({ message: 'lod1Solid yok.', targetGmlId: ctx.building?.gmlId });
        return;
      }
      const s = m[0];
      if (!/<gml:CompositeSolid\b/.test(s)) emit({ message: 'lod1Solid içinde CompositeSolid yok.', targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Lod1Solid elemanı içerisinde CompositeSolid bulunamadı.' });
      if (!/<gml:solidMember\b/.test(s) || !/<gml:Solid\b/.test(s) || !/<gml:CompositeSurface\b/.test(s)) emit({ message: 'lod1Solid yapısı CompositeSolid → solidMember → Solid → exterior → CompositeSurface olmalı.', targetGmlId: ctx.building?.gmlId });
      if (/<gml:surfaceMember\b[^>]*xlink:href=/.test(s)) emit({ message: 'lod1Solid poligonları satır içi tanımlanmalı (xlink yok).', targetGmlId: ctx.building?.gmlId, tkgmMessage: '…inline tanımlanmalıdır.' });
    },
  },
  {
    id: 'V-099',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const re = ctx.model.polygons.filter((p) => p.lodLevel === 'lod0RoofEdge');
      const l1 = ctx.model.polygons.filter((p) => p.lodLevel === 'lod1Solid');
      if (re.length === 0 || l1.length === 0) return;
      const reZ = minZOf(re.flatMap((p) => p.exteriorRing.vertices));
      const l1Top = Math.max(...l1.map((p) => p.maxZ));
      if (Math.abs(l1Top - reZ) > 0.001 + 1e-9) {
        emit({ message: `LoD1 tavanı (${l1Top.toFixed(3)}) RoofEdge kotu (${reZ.toFixed(3)}) ile aynı değil.`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'RoofEdge ile zemin üstü Lod1Solidin tavanı aynı yükseklikte olmalıdır.' });
      }
    },
  },
  { id: 'V-100', severity: 'H', source: 'Şartname §6.7, -501..-503', status: 'ertelendi', note: 'Katılar arası kesişim (val3dity düzeyi); M2.x.' },
  { id: 'V-101', severity: 'H', source: 'Şartname §6.7, -301..-405', status: 'ertelendi', note: 'Kabuk geçerliliği (kapalılık, manifold, yön) val3dity düzeyi; M2.x.' },
  {
    id: 'V-102',
    severity: 'U',
    source: 'Şartname §6.7 (ÖNERİ: taban/tavan 1 poligon)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const l1 = ctx.model.polygons.filter((p) => p.lodLevel === 'lod1Solid' && p.maxZ - p.minZ < 0.001);
      const byZ = new Map<number, number>();
      for (const p of l1) {
        const k = Math.round(p.minZ * 1000);
        byZ.set(k, (byZ.get(k) ?? 0) + 1);
      }
      const many = [...byZ.values()].filter((c) => c > 1).length;
      if (many > 0) emit({ message: `LoD1 katılarında ${many} yatay seviyede birden fazla poligon var (öneri: 1).`, targetGmlId: ctx.building?.gmlId });
    },
  },
  {
    id: 'V-103',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const ok = new Set(['WallSurface', 'RoofSurface', 'GroundSurface', 'OuterFloorSurface', 'OuterCeilingSurface', 'ClosureSurface']);
      for (const s of ctx.building?.surfaces ?? []) {
        if (!ok.has(s.tag)) emit({ message: `Bina boundedBy içinde izin verilmeyen yüzey türü: ${s.tag}.`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Geçersiz yüzey tipi.' });
      }
    },
  },
  {
    id: 'V-104',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const n = (ctx.building?.surfaces ?? []).filter((s) => s.tag === 'RoofSurface').length;
      if (n !== 1) emit({ message: `Binada tam 1 RoofSurface elemanı olmalı (bulunan: ${n}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Çatı yüzeyi sadece 1 tane olmalıdır.' });
    },
  },
  {
    id: 'V-105',
    severity: 'H',
    source: 'Şartname §6.7, K78 (Rejim E dosyalarında GroundSurface o dönem yasaktı: N19, AS-1)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const n = (ctx.building?.surfaces ?? []).filter((s) => s.tag === 'GroundSurface').length;
      if (n !== 1) {
        if (ctx.regime === 'E' && n === 0) {
          emit({ severity: 'B', message: 'GroundSurface yok (Rejim E: eski kılavuz döneminde GroundSurface yazılmıyordu). Yeni üretimde zorunludur (K78).', targetGmlId: ctx.building?.gmlId });
        } else {
          emit({ message: `Binada tam 1 GroundSurface elemanı olmalı (bulunan: ${n}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Zemin(ground) yüzeyi 1 tane olmalıdır.' });
        }
      }
    },
  },
  {
    id: 'V-106',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const n = (ctx.building?.surfaces ?? []).filter((s) => s.tag === 'WallSurface').length;
      if (n < 3) emit({ message: `Binada en az 3 WallSurface olmalı (bulunan: ${n}).`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Yan duvar (WallSurface) sayısı 3ten az olamaz.' });
    },
  },
  {
    id: 'V-107',
    severity: 'H',
    source: 'Şartname §6.7',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const b = ctx.building;
      if (!b) return;
      const bounded = new Set(b.surfaces.filter((s) => s.lod === 'lod2').flatMap((s) => s.polygonIds));
      const m = /<bldg:lod2MultiSurface\b[\s\S]*?<\/bldg:lod2MultiSurface>/.exec(extractBuildingOwnPart(ctx.xml));
      if (!m) return; // lod2MultiSurface zorunlu değilse denetlenmez
      const refs = [...m[0].matchAll(/xlink:href="#([^"]+)"/g)].map((x) => x[1]);
      for (const r of refs) {
        if (!bounded.has(r)) emit({ message: `lod2MultiSurface referansı (${r}) bina boundedBy içinde yok.`, targetGmlId: b.gmlId, tkgmMessage: `Referanslanan geometri elemanı (${r}) BoundedBy içerisinde bulunamadı.` });
      }
      const refSet = new Set(refs);
      const missing = [...bounded].filter((id) => !refSet.has(id));
      if (refs.length > 0 && missing.length > 0) emit({ message: `${missing.length} boundedBy LoD2 poligonu lod2MultiSurface'te referanslanmamış (ilk: ${missing[0]}).`, polygonGmlId: missing[0], targetGmlId: b.gmlId, tkgmMessage: `BoundedBy içerisinde ${missing[0]} idli poligon bulunamadı.` });
    },
  },
  { id: 'V-108', severity: 'H', source: 'Şartname §6.7, REHBER', status: 'ertelendi', note: 'RoofEdge ⊂ çatı izdüşümü için çokgen birleşimi gerekir; M2.x.' },

  // ---------------- §6.8 Kat ----------------
  {
    id: 'V-110',
    severity: 'H',
    source: 'Şartname §6.8',
    status: 'uygulandi',
    note: 'V-111 aynı fonksiyonda.',
    run: (ctx, emit) => {
      for (const k of ctx.byPrefix('K_')) {
        const ps = storeyPolys(ctx, k).filter((p) => p.lodLevel === 'group');
        if (ps.length === 0) {
          emit({ message: `${k.gmlName || k.gmlId}: grp:geometry/MultiSurface yok.`, targetGmlId: k.gmlId, tkgmMessage: 'MultiSurface elemanı, Geometry içerisinde bulunamadı.' });
          continue;
        }
        const walls = ps.filter((p) => p.prefix === 'Wall_').length;
        const floors = ps.filter((p) => p.prefix === 'Floor_').length;
        if (walls < 3) emit({ ruleId: 'V-111', message: `${k.gmlName}: en az 3 Wall_ poligonu olmalı (bulunan: ${walls}).`, targetGmlId: k.gmlId, tkgmMessage: 'Kat geometrisinde en az 3 tane idsi "Wall_" ile başlayan poligon olmalıdır.' });
        if (floors < 1) emit({ ruleId: 'V-111', message: `${k.gmlName}: en az 1 Floor_ poligonu olmalı.`, targetGmlId: k.gmlId });
      }
    },
  },
  { id: 'V-111', severity: 'H', source: 'Şartname §6.8', status: 'uygulandi', note: 'V-110 ile birlikte çalışır.' },
  {
    id: 'V-112',
    severity: 'H',
    source: 'Şartname §6.8',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const mb = ctx.building?.gmlId;
      for (const k of ctx.byPrefix('K_')) {
        if (k.parentGmlId !== mb) emit({ message: `${k.gmlName}: grp:parent bina kimliği (${mb}) olmalı (bulunan: ${k.parentGmlId}).`, targetGmlId: k.gmlId, tkgmMessage: 'Katın parent değeri binanın IDsine eşit olmalıdır.' });
      }
    },
  },
  {
    id: 'V-113',
    severity: 'H',
    source: 'Şartname §6.8',
    status: 'uygulandi',
    note: 'V-114 aynı fonksiyonda.',
    run: (ctx, emit) => {
      for (const k of ctx.byPrefix('K_')) {
        const refs = k.groupMemberHrefs.map((h) => h.replace(/^#/, ''));
        for (const r of refs) {
          if (!ctx.obj(r)) emit({ message: `${k.gmlName}: groupMember (${r}) dosyada yok.`, targetGmlId: k.gmlId, tkgmMessage: 'Referanslanan grup üyesi (groupMember) gml dosyası içinde bulunamadı.' });
        }
        const bbRefs = refs.filter((r) => r.startsWith('BB_')).length;
        const declared = num(k.attributesMap.independentSectionCount);
        if (Number.isFinite(declared) && declared !== bbRefs) {
          emit({ ruleId: 'V-114', message: `${k.gmlName}: independentSectionCount (${declared}) ≠ BB groupMember sayısı (${bbRefs}).`, targetGmlId: k.gmlId, tkgmMessage: 'Kat bilgisinde verilen BB sayısı ile gmldeki BB sayısı uyuşmuyor.' });
        }
      }
    },
  },
  { id: 'V-114', severity: 'H', source: 'Şartname §6.8', status: 'uygulandi', note: 'V-113 ile birlikte çalışır.' },
  {
    id: 'V-115',
    severity: 'H',
    source: 'Şartname §6.8',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const k of ctx.byPrefix('K_')) {
        const no = k.attributesMap.storeyNumber;
        if (!no) emit({ message: `${k.gmlId}: storeyNumber yok.`, targetGmlId: k.gmlId });
      }
    },
  },
  {
    id: 'V-116',
    severity: 'H',
    source: 'Şartname §6.8',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const k of ctx.byPrefix('K_')) {
        if (!k.attributes.some((a) => a.name === 'storeyUsage')) emit({ message: `${k.gmlName}: en az 1 storeyUsage olmalı.`, targetGmlId: k.gmlId });
      }
    },
  },
  {
    id: 'V-117',
    severity: 'U',
    source: `Şartname §6.8. Ölçüldü: Ornek2'de 13 dış pencerenin kat geometrisinde deliği yok, TKGM kabul etmiş → UYARI`,
    status: 'uygulandi',
    run: (ctx, emit) => runStoreyOpeningHoles(ctx, emit),
  },
  { id: 'V-118', severity: 'U', source: 'Şartname §6.8, SÜRÜM v2.49', status: 'sunucu', note: 'MAKS kat no (T).' },
];

/** Bina elemanının kendi metni (iç Room/Installation hariç tutulamaz ama lod2MultiSurface yalnız binada bulunur). */
function extractBuildingOwnPart(xml: string): string {
  const m = /<bldg:Building\b[\s\S]*?<\/bldg:Building>/.exec(xml);
  return m ? m[0] : '';
}

/**
 * V-117: Binanın dış duvarındaki (MB WallSurface) her pencere için kat geometrisinde aynı plan ve üst kotta delik olmalı.
 * Eşleştirme anahtarı openingKey (XY + üst kot, N20 nedeniyle alt kot hariç).
 */
function runStoreyOpeningHoles(ctx: RuleContext, emit: Emit): void {
  const storeyHoleKeys = new Set<string>();
  for (const k of ctx.byPrefix('K_')) {
    for (const p of ctx.polysOf(k)) for (const h of p.interiorRings) storeyHoleKeys.add(openingKeyOf(h.vertices));
  }
  if (storeyHoleKeys.size === 0) return; // Biçim B/C katlarında delik yerine açıklık kenarlı duvar parçaları olabilir; aşağıda sayılır
  let missing = 0;
  let first = '';
  for (const w of ctx.byPrefix('PEN_')) {
    if (w.hostSurfaceTag !== 'WallSurface' || w.parentGmlId !== ctx.building?.gmlId) continue;
    const p = ctx.polysOf(w)[0];
    if (!p) continue;
    if (!storeyHoleKeys.has(openingKeyOf(p.exteriorRing.vertices))) {
      missing++;
      if (!first) first = w.gmlId;
    }
  }
  if (missing > 0) emit({ message: `${missing} dış pencere için kat geometrisinde uygun delik bulunamadı (ilk: ${first}).`, targetGmlId: first, tkgmMessage: 'Kat geometrisinde pencereye uygun delik bulunamadı.' });
}

