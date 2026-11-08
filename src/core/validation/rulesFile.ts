// M2 — Şartname §6.2 Dosya ve şema, §6.3 CityModel ve Envelope, §6.4 Halka geometrisi, §6.5 ID, ad ve sınıf
import { ALLOWED_TUREF_EPSG_CODES, ALLOWED_SURFACE_NAMES } from '../model/index.ts';
import { expectedObjectName } from '../gml/names.ts';
import {
  dropAxisOf,
  newellNormal,
  pointInPolygon,
  pointOnBoundary,
  project,
  ringKey,
  ringSelfIntersects,
  ringsCross,
  signedArea2,
  uniqueRing,
} from './geom.ts';
import type { Emit, RuleContext, RuleDefinition } from './types.ts';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Element etiketi → izin verilen nesne önekleri (V-052). Ölçüldü: 9 resmi dosya. */
const OBJECT_PREFIX_BY_TAG: Readonly<Record<string, readonly string[]>> = {
  'bldg:Building': ['MB_'],
  'grp:CityObjectGroup': ['K_', 'MBG_'],
  'gen:GenericCityObject': ['BB_'],
  'bldg:Room': ['BBK_', 'OA_'],
  'bldg:IntBuildingInstallation': ['BBKIY_', 'OAIY_'],
  'bldg:BuildingInstallation': ['BLKN_', 'TRS_'],
  'bldg:Door': ['KAPI_'],
  'bldg:Window': ['PEN_'],
};

/** Önek → sınıf değeri (V-057). KAPI_/PEN_ sınıfsız (V-204). */
const CLASS_BY_PREFIX: Readonly<Record<string, string>> = {
  MB_: 'MimariBina',
  K_: 'Kat',
  MBG_: 'MimariBinaGrup',
  BB_: 'BagimsizBolum',
  BBK_: 'BagimsizBolumKisim',
  OA_: 'OrtakAlan',
  BBKIY_: 'BagimsizBolumKisimIcYapi',
  OAIY_: 'OrtakAlanIcYapi',
  BLKN_: 'Balkon',
  TRS_: 'Teras',
};

/** Yüzey etiketi → gml:name (V-059). */
const SURFACE_NAME_BY_TAG: Readonly<Record<string, string>> = {
  WallSurface: 'Duvar',
  RoofSurface: 'Çatı',
  GroundSurface: 'Zemin',
  FloorSurface: 'Taban',
  CeilingSurface: 'Tavan',
  InteriorWallSurface: 'İçDuvar',
  OuterFloorSurface: 'DışTaban',
  OuterCeilingSurface: 'DışTavan',
};

/** (sahip öneki, lod, yüzey) → izin verilen poligon önekleri (V-053). Ölçüldü: 9 resmi dosya. */
function allowedPolygonPrefixes(ownerPrefix: string, lod: string, surfaceTag: string, regime: 'S' | 'E'): readonly string[] | null {
  if (lod === 'lod0FootPrint') return ['Lod0FootPrint_'];
  if (lod === 'lod0RoofEdge') return ['Lod0RoofEdge_'];
  if (lod === 'lod1Solid') return ['Lod1Poligon_'];
  if (surfaceTag === 'bldg:Door') return ['Door_'];
  if (surfaceTag === 'bldg:Window') return ['Window_'];
  switch (surfaceTag) {
    case 'WallSurface':
      return ['Wall_'];
    case 'RoofSurface':
      return ['Roof_'];
    case 'GroundSurface':
      return ['Ground_'];
    case 'FloorSurface':
      return ['Floor_'];
    case 'CeilingSurface':
      return ['Ceiling_'];
    case 'InteriorWallSurface':
      return ['InteriorWall_'];
    case 'OuterFloorSurface':
      return ['OuterFloor_'];
    case 'OuterCeilingSurface':
      return ['OuterCeiling_'];
    case 'Kat':
      return ['Floor_', 'Wall_'];
    case 'BagimsizBolum':
      // Rejim E dosyalarında (Amasya) BB küvetinin iç yüzleri InteriorWall_ önekiyle yazılmış (ölçüldü).
      return regime === 'E' ? ['Floor_', 'Wall_', 'InteriorWall_'] : ['Floor_', 'Wall_'];
    default:
      return ownerPrefix ? null : null;
  }
}

function rawCount(xml: string, re: RegExp): number {
  let c = 0;
  for (const _ of xml.matchAll(re)) c++;
  return c;
}

export const FILE_RULES: readonly RuleDefinition[] = [
  // ---------------- §6.2 Dosya ve şema ----------------
  {
    id: 'V-001',
    severity: 'H',
    source: 'Şartname §6.2, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const base = ctx.fileName.split(/[\\/]/).pop() ?? ctx.fileName;
      if (!/^M-.*\.gml$/i.test(base)) {
        emit({ message: `Dosya adı "M-" ile başlamalı ve ".gml" ile bitmeli (dosya: ${base}).`, tkgmMessage: 'M- ile başlamalıdır' });
      }
    },
  },
  {
    id: 'V-002',
    severity: 'H',
    source: 'Şartname §6.2',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const base = ctx.fileName.split(/[\\/]/).pop() ?? ctx.fileName;
      const m = /^M-(.+)\.gml$/i.exec(base);
      const cid = ctx.building?.attributesMap.constructionID ?? '';
      if (m && cid && m[1] !== cid) {
        emit({ message: `Dosya adındaki yapı kimliği (${m[1]}) constructionID (${cid}) ile aynı değil.`, tkgmMessage: 'Dosya adı ile yapıID uyuşmuyor.' });
      }
    },
  },
  {
    id: 'V-003',
    severity: 'H',
    source: 'Şartname §6.2, -901',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const decl = ctx.model.xmlDeclaration;
      if (decl && !/encoding="utf-8"/i.test(decl)) {
        emit({ message: `XML bildirimi UTF-8 değil: ${decl}`, tkgmMessage: 'Geçersiz gml dosyası.-901' });
      }
      if (ctx.model.hasUtf8Bom) {
        emit({ severity: 'B', message: 'Dosya UTF-8 BOM ile başlıyor (K02: üretimde BOM yazılmaz).' });
      }
    },
  },
  {
    id: 'V-004',
    severity: 'H',
    source: 'Şartname §6.2, -904',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const m = /xmlns:gml="([^"]+)"/.exec(ctx.xml.slice(0, 4000));
      if (!m || m[1] !== 'http://www.opengis.net/gml') {
        emit({
          message: `GML ad alanı http://www.opengis.net/gml (GML 3.1.1) olmalı (bulunan: ${m ? m[1] : 'yok'}).`,
          tkgmMessage: 'Gml dosyası versiyonu desteklenmiyor.(v3 desteklenmez.)-904',
        });
      }
    },
  },
  {
    id: 'V-005',
    severity: 'H',
    source: 'Şartname §6.2',
    status: 'ertelendi',
    note: 'CityGML 2.0 XSD dosyaları repoda yok. Ağ erişimi olmadan şema doğrulaması için XSD kopyaları eklenmeli (ACIK_SORULAR).',
  },
  {
    id: 'V-006',
    severity: 'H',
    source: 'Şartname §6.2, -902',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const emptyPosList = rawCount(ctx.xml, /<gml:posList[^>]*>\s*<\/gml:posList>/g);
      const emptyMs = rawCount(ctx.xml, /<gml:MultiSurface\b[^>]*>\s*<\/gml:MultiSurface>/g);
      if (emptyPosList > 0) emit({ message: `${emptyPosList} adet boş gml:posList bulundu.`, tkgmMessage: 'Gml dosyası boş geometriler bulunduramaz.-902' });
      if (emptyMs > 0) emit({ message: `${emptyMs} adet surfaceMember içermeyen MultiSurface bulundu.`, tkgmMessage: 'MultiSurface içerisinde surfaceMember bulunamadı.' });
    },
  },
  {
    id: 'V-007',
    severity: 'U',
    source: 'Şartname §6.2',
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (/<app:(Appearance|ParameterizedTexture)\b/.test(ctx.xml)) {
        emit({ message: 'Dosyada Appearance/Texture var (K67: üretimde yazılmaz).' });
      }
    },
  },
  {
    id: 'V-008',
    severity: 'H',
    source: 'Şartname §6.2, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const n = rawCount(ctx.xml, /<core:CityModel\b/g);
      if (n !== 1) emit({ message: `Tam 1 core:CityModel olmalı (bulunan: ${n}).` });
    },
  },

  // ---------------- §6.3 CityModel ve Envelope ----------------
  {
    id: 'V-010',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const n = ctx.byPrefix('MB_').length;
      const raw = rawCount(ctx.xml, /<bldg:Building\b/g);
      if (raw !== 1 || n !== 1) emit({ message: `Tam 1 bldg:Building olmalı (bulunan: ${raw}).`, tkgmMessage: 'Sadece bir bina olmalıdır.' });
    },
  },
  {
    id: 'V-011',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const n = rawCount(ctx.xml, /<core:cityObjectMember\b/g);
      if (n < 4) emit({ message: `En az 4 cityObjectMember olmalı (bulunan: ${n}).`, tkgmMessage: 'En az 4 tane cityObjectMember olmalıdır.' });
    },
  },
  {
    id: 'V-012',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (ctx.byPrefix('K_').length < 1) emit({ message: 'Dosyada kat (K_) yok.', tkgmMessage: 'En az 1 tane kat olmalıdır.' });
      if (ctx.byPrefix('BB_').length < 1) emit({ message: 'Dosyada bağımsız bölüm (BB_) yok.', tkgmMessage: 'En az 1 tane bağımsız bölüm olmalıdır.' });
    },
  },
  {
    id: 'V-013',
    severity: 'H',
    source: 'Şartname §6.3, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const n = ctx.byPrefix('MBG_').length;
      if (n !== 1) emit({ message: `Tam 1 Mimari Bina Grup (MBG_) olmalı (bulunan: ${n}).` });
    },
  },
  {
    id: 'V-014',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const envCount = rawCount(ctx.xml, /<gml:Envelope\b/g);
      if (envCount !== 1) emit({ message: `Tek gml:Envelope olmalı (bulunan: ${envCount}).` });
      const srs = ctx.model.srsName;
      if (!srs) emit({ message: 'Envelope üzerinde srsName yok.', tkgmMessage: 'SrsName geçersiz.' });
      else if (!(ALLOWED_TUREF_EPSG_CODES as readonly string[]).includes(srs)) {
        emit({ message: `srsName EPSG:5253…5259 olmalı (bulunan: ${srs}).`, tkgmMessage: 'EPSG kodu yanlış.' });
      }
    },
  },
  {
    id: 'V-015',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const m = /<gml:Envelope\b[^>]*>/.exec(ctx.xml);
      const dim = m ? /srsDimension="([^"]*)"/.exec(m[0]) : null;
      if (!dim) emit({ message: 'Envelope üzerinde srsDimension yok.', tkgmMessage: 'Dış çerçeve geçersiz. SrsDimension özelliği bulunamadı.' });
      else if (dim[1] !== '3') emit({ message: `srsDimension 3 olmalı (bulunan: ${dim[1]}).`, tkgmMessage: 'SrsDimension değeri yanlış.(Beklenen : 3)' });
    },
  },
  {
    id: 'V-016',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const e = ctx.model.envelope;
      if (!(e.minE < e.maxE && e.minN < e.maxN && e.minZ < e.maxZ)) {
        emit({ message: 'Envelope alt köşesi her eksende üst köşeden küçük olmalı.', tkgmMessage: 'Dış çerçeve geçersiz. Alt köşe koordinatları, üst köşe koordinatlarından daha büyük.' });
      }
    },
  },
  {
    id: 'V-017',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const e = ctx.model.envelope;
      if (e.maxZ - e.minZ >= 900) emit({ message: `Envelope yükseklik farkı ${(e.maxZ - e.minZ).toFixed(2)} m (< 900 m olmalı).`, tkgmMessage: 'Köşeler arası yükseklik farkı' });
      const dxy = Math.hypot(e.maxE - e.minE, e.maxN - e.minN);
      if (dxy >= 1000) emit({ message: `Envelope köşeler arası mesafe ${dxy.toFixed(1)} m (< 1000 m olmalı).`, tkgmMessage: 'Köşeler arası mesafe çok fazla.' });
      if ((e.maxE - e.minE) * (e.maxN - e.minN) <= 0) emit({ message: 'Envelope plan alanı sıfır.', tkgmMessage: 'Dış çerçeve alanı çok düşük.' });
    },
  },
  {
    id: 'V-018',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const e = ctx.model.envelope;
      const tol = 0.001;
      let out = 0;
      let firstId = '';
      for (const p of ctx.model.polygons) {
        for (const v of p.exteriorRing.vertices) {
          if (v.e < e.minE - tol || v.e > e.maxE + tol || v.n < e.minN - tol || v.n > e.maxN + tol || v.z < e.minZ - tol || v.z > e.maxZ + tol) {
            out++;
            if (!firstId) firstId = p.gmlId;
            break;
          }
        }
      }
      if (out > 0) {
        emit({ message: `${out} poligon Envelope dışına taşıyor (ilk: ${firstId}).`, polygonGmlId: firstId, tkgmMessage: 'Yüzey elemanı, tanımlanan dış çerçevenin(envelope) içinde değil.' });
      }
      for (const t of ctx.model.ticLineStrings) {
        if (t.vertices.some((v) => v.e < e.minE - tol || v.e > e.maxE + tol || v.n < e.minN - tol || v.n > e.maxN + tol || v.z < e.minZ - tol || v.z > e.maxZ + tol)) {
          // Rejim E (Amasya): TIC bina tabanının ~5 m altında ve Envelope dışında yazılmış, TKGM kabul etmiş (ölçüldü) → BİLGİ.
          emit({ severity: ctx.regime === 'E' ? 'B' : 'H', message: `TIC (Terrain kesişim eğrisi) Envelope dışına taşıyor.${ctx.regime === 'E' ? ' (Rejim E)' : ''}`, tkgmMessage: 'Terrain kesişim eğrisi, … içinde değil.' });
          break;
        }
      }
    },
  },
  {
    id: 'V-019',
    severity: 'H',
    source: 'Şartname §6.3 (yalnız Y kısmı: |E − 500000| ≤ 200000)',
    status: 'kismi',
    note: 'EPSG dilimi ↔ parsel boylamı eşleşmesi parsel bilgisi gerektirir (K). Yalnız easting aralığı denetlenir.',
    run: (ctx, emit) => {
      const e = ctx.model.envelope;
      if (Math.abs(e.minE - 500000) > 200000 || Math.abs(e.maxE - 500000) > 200000) {
        emit({ message: `Easting değeri seçilen TM diliminin dışında görünüyor (|E − 500000| > 200000).` });
      }
    },
  },
  {
    id: 'V-020',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const e = ctx.model.envelope;
      const ok = (E: number, N: number) => E > 300000 && E < 700000 && N > 2500000 && N < 5000000;
      if (!ok(e.minE, e.minN) || !ok(e.maxE, e.maxN)) {
        emit({ message: `Koordinatlar TM aralığı dışında (E ${e.minE.toFixed(0)}…${e.maxE.toFixed(0)}, N ${e.minN.toFixed(0)}…${e.maxN.toFixed(0)}).`, tkgmMessage: 'Geometrinin koordinat (TM) değerleri geçersiz.' });
      }
    },
  },
  {
    id: 'V-021',
    severity: 'H',
    source: 'Şartname §6.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const all = rawCount(ctx.xml, /\bsrsName=/g);
      const env = rawCount(ctx.xml, /<gml:Envelope\b[^>]*\bsrsName=/g);
      if (all - env > 0) emit({ message: `Envelope dışında ${all - env} elemanda srsName var.`, tkgmMessage: 'Poligonlar SrsName değerine sahip olmamalıdır.' });
    },
  },

  // ---------------- §6.4 Koordinat ve halka geometrisi ----------------
  {
    id: 'V-030',
    severity: 'B',
    source: 'Şartname §6.4 + KARARLAR §A.1 (okumada ≠3 hane yalnız BİLGİ, CLAUDE13 §2.2)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      let n = 0;
      for (const p of ctx.model.polygons) {
        n += p.exteriorRing.nonThreeDecimalCount;
        for (const r of p.interiorRings) n += r.nonThreeDecimalCount;
      }
      if (n > 0) emit({ message: `${n} koordinat değeri 3 ondalık haneden farklı. Okumada BİLGİ; üretimde her zaman 3 hane yazılır.` });
    },
  },
  {
    id: 'V-031',
    severity: 'H',
    source: 'Şartname §6.4, -101',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const p of ctx.model.polygons) {
        for (const r of [p.exteriorRing, ...p.interiorRings]) {
          if (uniqueRing(r.vertices).length < 3 || r.vertices.length < 4) {
            emit({ message: `${r.gmlId || p.gmlId} halkası 3'ten az eşsiz noktaya sahip.`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: 'linearRing 3ten daha az noktaya sahip.' });
          }
        }
      }
    },
  },
  {
    id: 'V-032',
    severity: 'H',
    source: 'Şartname §6.4, -102',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const p of ctx.model.polygons) {
        for (const r of [p.exteriorRing, ...p.interiorRings]) {
          const v = r.vertices;
          for (let i = 0; i + 1 < v.length; i++) {
            if (Math.abs(v[i].e - v[i + 1].e) < 1e-6 && Math.abs(v[i].n - v[i + 1].n) < 1e-6 && Math.abs(v[i].z - v[i + 1].z) < 1e-6) {
              emit({ message: `${r.gmlId} halkasında ardışık eşit nokta var.`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: '-102' });
              break;
            }
          }
        }
      }
    },
  },
  {
    id: 'V-033',
    severity: 'H',
    source: 'Şartname §6.4, -103',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const p of ctx.model.polygons) {
        for (const r of [p.exteriorRing, ...p.interiorRings]) {
          const v = r.vertices;
          const a = v[0];
          const b = v[v.length - 1];
          if (v.length > 0 && (Math.abs(a.e - b.e) > 1e-6 || Math.abs(a.n - b.n) > 1e-6 || Math.abs(a.z - b.z) > 1e-6)) {
            emit({ message: `${r.gmlId} halkası kapalı değil (ilk nokta ≠ son nokta).`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: '-103' });
          }
        }
      }
    },
  },
  {
    id: 'V-034',
    severity: 'H',
    source: 'Şartname §6.4, -104 (+ V-035, V-036, V-039, V-040 aynı izdüşümle)',
    status: 'uygulandi',
    run: (ctx, emit) => runRingTopology(ctx, emit),
  },
  { id: 'V-035', severity: 'H', source: 'Şartname §6.4, -201', status: 'uygulandi', note: 'V-034 ile birlikte çalışır.' },
  { id: 'V-036', severity: 'H', source: 'Şartname §6.4, -202', status: 'uygulandi', note: 'V-034 ile birlikte çalışır.' },
  {
    id: 'V-037',
    severity: 'H',
    source: 'Şartname §6.4, -203 (val3dity düzlemsellik toleransı 1 cm; 1–10 mm BİLGİ)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      let info = 0;
      for (const p of ctx.model.polygons) {
        if (p.planarityDeviationMm > 10) {
          emit({ message: `${p.gmlId} düzlemsel değil (sapma ${p.planarityDeviationMm.toFixed(1)} mm > 10 mm).`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: 'linearRing planar değil.' });
        } else if (p.planarityDeviationMm > 1) {
          info++;
        }
      }
      if (info > 0) emit({ severity: 'B', message: `${info} poligonda düzlemsellik sapması 1–10 mm arasında (öneri ≤ 1 mm, tolerans 10 mm).` });
    },
  },
  {
    id: 'V-038',
    severity: 'U',
    source: 'Şartname §6.4, -204',
    status: 'uygulandi',
    run: (ctx, emit) => {
      let count = 0;
      let first = '';
      for (const p of ctx.model.polygons) {
        for (const r of [p.exteriorRing, ...p.interiorRings]) {
          const u = uniqueRing(r.vertices);
          for (let i = 0; i < u.length; i++) {
            const a = u[i];
            const b = u[(i + 1) % u.length];
            if (Math.hypot(a.e - b.e, a.n - b.n, a.z - b.z) < 0.01 - 1e-9) {
              count++;
              if (!first) first = p.gmlId;
              break;
            }
          }
        }
      }
      if (count > 0) emit({ message: `${count} halkada iki köşe arası 10 mm'den kısa (ilk: ${first}).`, polygonGmlId: first, tkgmMessage: '-204' });
    },
  },
  { id: 'V-039', severity: 'H', source: 'Şartname §6.4, -205/-206/-207', status: 'uygulandi', note: 'V-034 ile birlikte çalışır.' },
  { id: 'V-040', severity: 'H', source: 'Şartname §6.4, -208', status: 'uygulandi', note: 'V-034 ile birlikte çalışır.' },
  {
    id: 'V-041',
    severity: 'H',
    source: 'Şartname §6.4',
    status: 'ertelendi',
    note: 'Aynı yüzeydeki eş düzlemli poligonların alan kesişimi (çokgen boolean) gerekir; M2.x.',
  },
  {
    id: 'V-042a',
    severity: 'H',
    source: 'K45a, KARARLAR (6 resmi + 18 gerçek dosyada 0 ihlal)',
    status: 'uygulandi',
    note: 'V-042b (1–10 mm BİLGİ) aynı fonksiyonda.',
    run: (ctx, emit) => {
      let info = 0;
      for (const p of ctx.model.polygons) {
        if (p.interiorRings.length === 0) continue;
        const u = uniqueRing(p.exteriorRing.vertices);
        const drop = dropAxisOf(newellNormal(u));
        const o = u[0];
        const ext = project(u, drop, o);
        for (const h of p.interiorRings) {
          const hp = project(uniqueRing(h.vertices), drop, o);
          let minD = Number.POSITIVE_INFINITY;
          for (const q of hp) {
            for (let i = 0; i < ext.length; i++) {
              const a = ext[i];
              const b = ext[(i + 1) % ext.length];
              const len2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
              let t = len2 === 0 ? 0 : ((q.x - a.x) * (b.x - a.x) + (q.y - a.y) * (b.y - a.y)) / len2;
              t = Math.max(0, Math.min(1, t));
              const d = Math.hypot(a.x + t * (b.x - a.x) - q.x, a.y + t * (b.y - a.y) - q.y);
              if (d < minD) minD = d;
            }
          }
          if (minD < 0.001 - 1e-9) {
            emit({ message: `${p.gmlId} poligonunda ${h.gmlId} deliği dış halkaya ${(minD * 1000).toFixed(1)} mm (< 1 mm).`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: '-205/-206' });
          } else if (minD < 0.01 - 1e-9) {
            info++;
          }
        }
      }
      if (info > 0) emit({ ruleId: 'V-042b', severity: 'B', message: `${info} delik dış halkaya 1–10 mm yakın (V-042b).` });
    },
  },
  { id: 'V-042b', severity: 'B', source: 'K45a, KARARLAR', status: 'uygulandi', note: 'V-042a ile birlikte çalışır.' },

  // ---------------- §6.5 ID, ad ve sınıf ----------------
  {
    id: 'V-050',
    severity: 'H',
    source: 'Şartname §6.5',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const seen = new Map<string, number>();
      for (const m of ctx.xml.matchAll(/\bgml:id="([^"]*)"/g)) seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
      for (const [id, c] of seen) {
        if (c > 1) emit({ message: `gml:id "${id}" ${c} kez kullanılmış.`, targetGmlId: id, tkgmMessage: `${id} değeri birden fazla bulundu.` });
      }
    },
  },
  {
    id: 'V-051',
    severity: 'H',
    source: 'Şartname §6.5, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      let bad = 0;
      let first = '';
      for (const m of ctx.xml.matchAll(/\bgml:id="([^"]*)"/g)) {
        const id = m[1];
        const us = id.indexOf('_');
        const guid = us >= 0 ? id.slice(us + 1) : id;
        if (!GUID.test(guid)) {
          bad++;
          if (!first) first = id;
        }
      }
      if (bad > 0) emit({ message: `${bad} gml:id GUID biçiminde değil (önek_xxxxxxxx-xxxx-…, küçük harf, süslüsüz). İlk: ${first}`, targetGmlId: first });
    },
  },
  {
    id: 'V-052',
    severity: 'H',
    source: 'Şartname §6.5',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const o of ctx.model.objects) {
        const allowed = OBJECT_PREFIX_BY_TAG[o.tagName];
        if (allowed && !allowed.includes(o.prefix)) {
          emit({ message: `${o.tagName} nesnesinin kimliği ${allowed.join(' / ')} ile başlamalı (bulunan: ${o.gmlId}).`, targetGmlId: o.gmlId, tkgmMessage: `ID, ${allowed[0]} değeri ile başlamalıdır.` });
        }
      }
    },
  },
  {
    id: 'V-053',
    severity: 'H',
    source: 'Şartname §6.5 (önek eşlemesi 9 resmi dosyadan ölçüldü)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const p of ctx.model.polygons) {
        const owner = ctx.obj(p.ownerObjectGmlId);
        const allowed = allowedPolygonPrefixes(owner?.prefix ?? '', p.lodLevel, p.surfaceTag, ctx.regime);
        if (allowed && !allowed.includes(p.prefix)) {
          emit({ message: `${p.surfaceTag} poligonu ${allowed.join(' / ')} ile başlamalı (bulunan: ${p.gmlId}).`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: 'Poligon ID önek hatası.' });
        }
      }
    },
  },
  {
    id: 'V-054',
    severity: 'H',
    source: 'Şartname §6.5',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const polyNoId = rawCount(ctx.xml, /<gml:Polygon(?![^>]*\bgml:id=)[^>]*>/g);
      const ringNoId = rawCount(ctx.xml, /<gml:LinearRing(?![^>]*\bgml:id=)[^>]*>/g);
      if (polyNoId > 0) emit({ message: `${polyNoId} poligonda gml:id yok.`, tkgmMessage: 'ID bulunmayan poligon tespit edilmiştir.' });
      if (ringNoId > 0) emit({ message: `${ringNoId} LinearRing'de gml:id yok.` });
      for (const p of ctx.model.polygons) {
        for (const r of [p.exteriorRing, ...p.interiorRings]) {
          if (r.gmlId && !/^(LinearRing_|DoorLinearRing_|WindowLinearRing_)/.test(r.gmlId)) {
            emit({ message: `Halka kimliği LinearRing_ / DoorLinearRing_ / WindowLinearRing_ ile başlamalı (${r.gmlId}).`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: 'LinearRing ID LinearRing_ ile başlamalıdır.' });
          }
        }
      }
    },
  },
  {
    id: 'V-055',
    severity: 'H',
    source: 'Şartname §6.5',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const p of ctx.model.polygons) {
        if (p.prefix === 'Door_' && !p.exteriorRing.gmlId.startsWith('DoorLinearRing_')) {
          emit({ message: `Kapı poligonunun halkası DoorLinearRing_ ile başlamalı (${p.exteriorRing.gmlId}).`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: 'LinearRingin IDsi, DoorLinearRing_ ile başlamalıdır.' });
        }
        if (p.prefix === 'Window_' && !p.exteriorRing.gmlId.startsWith('WindowLinearRing_')) {
          emit({ message: `Pencere poligonunun halkası WindowLinearRing_ ile başlamalı (${p.exteriorRing.gmlId}).`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId, tkgmMessage: 'LinearRingin IDsi, WindowLinearRing_ ile başlamalıdır.' });
        }
      }
    },
  },
  {
    id: 'V-056',
    severity: 'H',
    source: 'Şartname §6.5, K13',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const re = /<(bldg:(?:Wall|Roof|Ground|Floor|InteriorWall|Ceiling|OuterFloor|OuterCeiling|Closure)Surface|gml:(?:MultiSurface|Solid|CompositeSolid|CompositeSurface|MultiCurve|LineString))\b[^>]*\bgml:id=/g;
      const counts = new Map<string, number>();
      for (const m of ctx.xml.matchAll(re)) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
      for (const [tag, c] of counts) emit({ message: `${c} adet ${tag} elemanında gml:id var (olmamalı).`, tkgmMessage: `${tag} geometri elementinin IDsi olmamalıdır.` });
    },
  },
  {
    id: 'V-057',
    severity: 'H',
    source: 'Şartname §6.5',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const o of ctx.model.objects) {
        const expected = CLASS_BY_PREFIX[o.prefix];
        if (expected === undefined) continue;
        if (o.classValue !== expected) {
          emit({ message: `${o.gmlId}: sınıf değeri "${expected}" olmalı (bulunan: "${o.classValue}").`, targetGmlId: o.gmlId, tkgmMessage: `Sınıf değeri geçersiz. (Beklenen: ${expected} Girilen: ${o.classValue})` });
        }
      }
    },
  },
  {
    id: 'V-058',
    severity: 'H',
    source: 'Şartname §6.5, §3.12 (ad desenleri 9 resmi dosyadan ölçüldü, N17)',
    status: 'uygulandi',
    run: (ctx, emit) => runNameRules(ctx, emit),
  },
  {
    id: 'V-059',
    severity: 'H',
    source: 'Şartname §6.5',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const o of ctx.model.objects) {
        for (const s of o.surfaces) {
          const expected = SURFACE_NAME_BY_TAG[s.tag];
          if (expected && s.gmlName !== expected) {
            emit({ message: `${o.gmlId} içindeki ${s.tag} adı "${expected}" olmalı (bulunan: "${s.gmlName}").`, targetGmlId: o.gmlId, tkgmMessage: 'Yüzey (surface) name değeri hatalı.' });
          } else if (!expected && s.gmlName && !(ALLOWED_SURFACE_NAMES as readonly string[]).includes(s.gmlName)) {
            emit({ message: `${o.gmlId} içinde tanımsız yüzey adı "${s.gmlName}" (${s.tag}).`, targetGmlId: o.gmlId });
          }
        }
      }
    },
  },
];

// ---------- Halka topolojisi: V-034, V-035, V-036, V-039, V-040 ----------
function runRingTopology(ctx: RuleContext, emit: Emit): void {
  for (const p of ctx.model.polygons) {
    const extU = uniqueRing(p.exteriorRing.vertices);
    if (extU.length < 3) continue;
    const normal = newellNormal(extU);
    const drop = dropAxisOf(normal);
    const o = extU[0];
    const ext = project(extU, drop, o);
    const base = { polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId };
    if (ringSelfIntersects(ext)) {
      emit({ ...base, message: `${p.exteriorRing.gmlId} halkası kendini kesiyor.`, tkgmMessage: '-104' });
    }
    if (p.interiorRings.length === 0) continue;
    const extSign = Math.sign(signedArea2(ext));
    const holes = p.interiorRings.map((h) => ({ id: h.gmlId, pts: project(uniqueRing(h.vertices), drop, o), key: ringKey(h.vertices) }));
    const extKey = ringKey(p.exteriorRing.vertices);
    for (let i = 0; i < holes.length; i++) {
      const h = holes[i];
      if (ringSelfIntersects(h.pts)) emit({ ruleId: 'V-034', ...base, message: `${h.id} iç halkası kendini kesiyor.`, tkgmMessage: '-104' });
      if (h.key === extKey) emit({ ruleId: 'V-036', ...base, message: `${h.id} iç halkası dış halka ile özdeş.`, tkgmMessage: '-202' });
      if (ringsCross(ext, h.pts)) emit({ ruleId: 'V-035', ...base, message: `${h.id} iç halkası dış halkayı kesiyor.`, tkgmMessage: '-201' });
      // V-039: iç halka dış halkanın içinde olmalı (sınır üzerindeki köşeler V-042a'da)
      const outside = h.pts.some((q) => !pointInPolygon(q, ext) && !pointOnBoundary(q, ext));
      if (outside) emit({ ruleId: 'V-039', ...base, message: `${h.id} iç halkası dış halkanın dışına taşıyor.`, tkgmMessage: '-206' });
      // V-040: iç halka yönü dış halkanın tersi
      if (Math.sign(signedArea2(h.pts)) === extSign) emit({ ruleId: 'V-040', ...base, message: `${h.id} iç halkası dış halka ile aynı yönde (ters olmalı).`, tkgmMessage: '-208' });
      for (let j = i + 1; j < holes.length; j++) {
        const g = holes[j];
        if (g.key === h.key) emit({ ruleId: 'V-036', ...base, message: `${h.id} ve ${g.id} iç halkaları özdeş.`, tkgmMessage: '-202' });
        else if (ringsCross(h.pts, g.pts)) emit({ ruleId: 'V-035', ...base, message: `${h.id} ve ${g.id} iç halkaları kesişiyor.`, tkgmMessage: 'Interior LinearRingler kesişiyor.' });
        else if (pointInPolygon(g.pts[0], h.pts) || pointInPolygon(h.pts[0], g.pts)) emit({ ruleId: 'V-039', ...base, message: `${h.id} ve ${g.id} iç halkaları iç içe.`, tkgmMessage: '-207' });
      }
    }
  }
}

// ---------- V-058 nesne adları (src/core/gml/names.ts ile ortak) ----------
function runNameRules(ctx: RuleContext, emit: Emit): void {
  for (const o of ctx.model.objects) {
    const expected = expectedObjectName(ctx.model, ctx.codelists, o);
    if (expected !== null && o.gmlName !== expected) {
      emit({ message: `${o.gmlId}: ad "${expected}" olmalı (bulunan: "${o.gmlName}").`, targetGmlId: o.gmlId, tkgmMessage: 'İsimlendirme hatası.' });
    }
  }
}