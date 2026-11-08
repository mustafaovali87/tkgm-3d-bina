// M2 — Şartname §6.9 Bağımsız Bölüm, §6.10 Kısım/Ortak Alan, §6.11 Açıklıklar, §6.12 Balkon/Teras, §6.13 MBG
import type { ImportedCityObject, ImportedPolygon } from '../gml/gmlReader.ts';
import { newellNormal, openingKey, prismVolumeUnder, ringKey } from './geom.ts';
import type { Emit, RuleContext, RuleDefinition } from './types.ts';

const num = (v: string | undefined): number => (v === undefined || v.trim() === '' ? Number.NaN : Number(v.trim()));
const MM = 0.001;

/** Yatay poligonların kot seviyeleri (mm), artan sıralı. */
function horizontalLevels(ps: readonly ImportedPolygon[]): number[] {
  const s = new Set<number>();
  for (const p of ps) if (p.maxZ - p.minZ < MM) s.add(Math.round(p.minZ * 1000));
  return [...s].sort((a, b) => a - b);
}

/** BB küveti: alt taban kotu, taban üst kotu, duvar en alt kotları. */
function bbTub(ctx: RuleContext, bb: ImportedCityObject) {
  const ps = ctx.polysOf(bb);
  const floors = ps.filter((p) => p.prefix === 'Floor_');
  const walls = ps.filter((p) => p.prefix === 'Wall_' || p.prefix === 'InteriorWall_');
  const levels = horizontalLevels(floors);
  const bottom = levels.length > 0 ? levels[0] / 1000 : null;
  const top = levels.length > 1 ? levels[1] / 1000 : null;
  return { ps, floors, walls, bottom, top, maxZ: ps.length ? Math.max(...ps.map((p) => p.maxZ)) : null };
}

function roomsOfBb(ctx: RuleContext, bb: ImportedCityObject): ImportedCityObject[] {
  return ctx.byPrefix('BBK_').filter((r) => r.referencedBbGmlId === bb.gmlId);
}

function openingsOf(ctx: RuleContext, parentIds: ReadonlySet<string>, prefix: 'KAPI_' | 'PEN_'): ImportedCityObject[] {
  return ctx.byPrefix(prefix).filter((o) => o.parentGmlId !== null && parentIds.has(o.parentGmlId));
}

function surfacePolys(ctx: RuleContext, o: ImportedCityObject, tag: string): ImportedPolygon[] {
  const ids = o.surfaces.filter((s) => s.tag === tag).flatMap((s) => [...s.polygonIds, ...s.xlinkHrefs.map((h) => h.replace(/^#/, ''))]);
  return ids.map((id) => ctx.poly(id)).filter((p): p is ImportedPolygon => p !== undefined);
}

/** Düşey açıklık poligonunun ölçüleri: kotlar, plan genişliği, yatay birim normal, plan merkezi. */
function openingShape(p: ImportedPolygon) {
  const u = p.exteriorRing.vertices;
  let width = 0;
  for (let i = 0; i < u.length; i++) {
    for (let j = i + 1; j < u.length; j++) {
      const d = Math.hypot(u[i].e - u[j].e, u[i].n - u[j].n);
      if (d > width) width = d;
    }
  }
  const n = newellNormal(u);
  const h = Math.hypot(n.x, n.y) || 1;
  return { minZ: p.minZ, maxZ: p.maxZ, width, nx: n.x / h, ny: n.y / h, cx: p.centroid.e, cy: p.centroid.n, xs: u };
}

const hasAnyOpenings = (ctx: RuleContext) => ctx.byPrefix('KAPI_').length + ctx.byPrefix('PEN_').length > 0;

export const BB_RULES: readonly RuleDefinition[] = [
  // ---------------- §6.9 Bağımsız Bölüm ----------------
  {
    id: 'V-120',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    note: 'V-121 aynı fonksiyonda.',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const t = bbTub(ctx, bb);
        if (t.ps.length === 0) {
          emit({ message: `${bb.gmlName}: gen:lod2Geometry/MultiSurface yok.`, targetGmlId: bb.gmlId, tkgmMessage: 'MultiSurface elemanı, Lod2Geometry altında bulunamadı.' });
          continue;
        }
        if (t.walls.length < 3) emit({ ruleId: 'V-121', message: `${bb.gmlName}: en az 3 Wall_ poligonu olmalı (bulunan: ${t.walls.length}).`, targetGmlId: bb.gmlId, tkgmMessage: 'Bağımsız Bölüm geometrisinde en az 3 tane idsi "Wall_" ile başlayan poligon olmalıdır.' });
        if (t.floors.length < 1) emit({ ruleId: 'V-121', message: `${bb.gmlName}: en az 1 Floor_ poligonu olmalı.`, targetGmlId: bb.gmlId });
      }
    },
  },
  { id: 'V-121', severity: 'H', source: 'Şartname §6.9', status: 'uygulandi', note: 'V-120 ile birlikte çalışır.' },
  { id: 'V-122', severity: 'H', source: 'Şartname §6.9', status: 'ertelendi', note: 'Duvar üst kapağının kapalılığı kenar eşleştirmesi gerektirir; M2.x.' },
  { id: 'V-123', severity: 'H', source: 'Şartname §6.9', status: 'ertelendi', note: 'Taban kalınlığı alt sınırı şartnamede sayı olarak yok ("{...} m"); ACIK_SORULAR.' },
  {
    id: 'V-124',
    severity: 'H',
    source: 'Şartname §6.9 + N36 (zFloorBottom − 1 mm ≤ zWallMin ≤ zFloorTop + 1 mm)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      // Yalnız düşey duvar poligonları: yatay duvar kapakları ve pencere/kapı söveleri (eşik kotundan başlar) hariç.
      // Kural: düşey duvarların en alt kotu taban altı ile taban üstü arasında; hiçbir düşey duvar taban altından aşağı inmez.
      for (const bb of ctx.byPrefix('BB_')) {
        const t = bbTub(ctx, bb);
        if (t.bottom === null) continue;
        const top = t.top ?? t.bottom;
        const vertical = t.walls.filter((w) => w.maxZ - w.minZ > 0.01);
        if (vertical.length === 0) continue;
        const lowest = vertical.reduce((a, w) => (w.minZ < a.minZ ? w : a), vertical[0]);
        if (lowest.minZ < t.bottom - MM - 1e-9 || lowest.minZ > top + MM + 1e-9) {
          emit({ message: `${bb.gmlName}: yan duvarlar ${lowest.minZ.toFixed(3)} kotundan başlıyor (taban ${t.bottom.toFixed(3)}…${top.toFixed(3)} arası olmalı).`, polygonGmlId: lowest.gmlId, targetGmlId: bb.gmlId, tkgmMessage: 'Yan duvarlar, tabanın üstünden başlamalıdır.' });
        }
      }
    },
  },
  { id: 'V-125', severity: 'H', source: 'Şartname §6.9', status: 'ertelendi', note: 'BB ⊂ Kat için 3B içerme testi gerekir; M2.x.' },
  {
    id: 'V-126',
    severity: 'U',
    source: `Şartname §6.9 (±0.01 m²). Ölçüldü: Ornek1 70 BB'nin 62'sinde ve Rejim E dosyalarında fark var, TKGM kabul etmiş → UYARI`,
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const declared = num(bb.attributesMap.independentSectionCalculatedArea);
        if (!Number.isFinite(declared) || declared < 0) continue; // -1: dubleks ikinci parça (K30)
        const t = bbTub(ctx, bb);
        if (t.bottom === null) continue;
        const bottomArea = t.floors.filter((p) => Math.abs(p.minZ - (t.bottom as number)) < MM && p.maxZ - p.minZ < MM).reduce((s, p) => s + p.areaM2, 0);
        if (Math.abs(bottomArea - declared) > 0.01 + 1e-9) {
          emit({ message: `${bb.gmlName}: independentSectionCalculatedArea (${declared.toFixed(2)}) alt taban alanından (${bottomArea.toFixed(2)}) farklı.`, targetGmlId: bb.gmlId, tkgmMessage: 'Bağımsız bölüm çizim alan, bağımsız bölüm geometrisinin taban alanına eşit değildir.' });
        }
      }
    },
  },
  {
    id: 'V-127',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const area = num(bb.attributesMap.independentSectionCalculatedArea);
        if (!(area > 0)) continue;
        const parts = roomsOfBb(ctx, bb).reduce((s, r) => s + (num(r.attributesMap.calculatedArea) || 0), 0);
        if (area + 0.01 < parts) emit({ message: `${bb.gmlName}: BB çizim alanı (${area.toFixed(2)}) kısımların toplamından (${parts.toFixed(2)}) küçük.`, targetGmlId: bb.gmlId, tkgmMessage: 'Bağımsız Bölüm Çizim Alanı, kısım çizim alanlarının toplamından büyük olmalıdır.' });
      }
    },
  },
  {
    id: 'V-128',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const declared = num(bb.attributesMap.partCount);
        const actual = roomsOfBb(ctx, bb).length;
        if (Number.isFinite(declared) && declared !== actual) emit({ message: `${bb.gmlName}: partCount (${declared}) ≠ bağlı kısım sayısı (${actual}).`, targetGmlId: bb.gmlId, tkgmMessage: 'Bağımsız bölüm kısım sayısı hatalı.' });
      }
    },
  },
  {
    id: 'V-129',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const vals = bb.attributes.filter((a) => a.name === 'geometrySuitability').map((a) => a.cleanValue);
        if (vals.some((v) => v !== '1001' && v !== '1002')) emit({ message: `${bb.gmlName}: geometrySuitability 1001 veya 1002 olmalı (bulunan: ${vals.join(', ')}).`, targetGmlId: bb.gmlId, tkgmMessage: 'bağımsız bölüm geometrik uygunluk 1001 veya 1002 olmalıdır.' });
        if (vals.includes('1001') && vals.length > 1) emit({ message: `${bb.gmlName}: 1001 girildiyse başka değer girilemez.`, targetGmlId: bb.gmlId, tkgmMessage: 'GeometriUygunluğu 1001 girildi ise başka değer girilemez.' });
      }
    },
  },
  {
    id: 'V-130',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const v = bb.attributesMap.integrationState;
        if (v !== '1004') emit({ message: `${bb.gmlName}: integrationState 1004 olmalı (bulunan: ${v}).`, targetGmlId: bb.gmlId, tkgmMessage: 'entegrasyon durumu 1004 olmalıdır.' });
      }
    },
  },
  {
    id: 'V-131',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const a = bb.attributesMap;
        if (a.integrationState !== '1001' && a.takbisPropertyIdentityNumber !== '-1') {
          emit({ message: `${bb.gmlName}: integrationState 1001 değilse takbisPropertyIdentityNumber -1 olmalı (bulunan: ${a.takbisPropertyIdentityNumber}).`, targetGmlId: bb.gmlId, tkgmMessage: 'IntegrationState 1001 değil ise, takbisPropertyIdentityNumber -1 değerini almalıdır.' });
        }
      }
    },
  },
  {
    id: 'V-132',
    severity: 'H',
    source: 'Şartname §6.9, KILAVUZ md.8',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        if ((bb.attributesMap.blockName ?? '').trim() === '') {
          // Rejim E dosyalarında (Amasya, Sincan) blockName boş yazılmış ve kabul edilmiş (ölçüldü).
          emit({ severity: ctx.regime === 'E' ? 'B' : 'H', message: `${bb.gmlName || bb.gmlId}: blockName boş.${ctx.regime === 'E' ? ' (Rejim E; yeni üretimde blok adı veya -1 yazılır.)' : ''}`, targetGmlId: bb.gmlId });
        }
      }
    },
  },
  { id: 'V-133', severity: 'H', source: 'Şartname §6.9, KILAVUZ md.9', status: 'okuyucuda', note: 'landShare.parsePropertyLot (V-198/V-198a/V-198b).' },
  { id: 'V-134', severity: 'H', source: 'Şartname §6.9', status: 'uygulandi', note: 'Tek ve string olma koşulu V-061 (tekrar) ve V-060 (tip) ile denetlenir.' },
  {
    id: 'V-135',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const vals = bb.attributes.filter((a) => a.name === 'independentSectionCardinalDirection').map((a) => a.cleanValue);
        if (new Set(vals).size !== vals.length) emit({ message: `${bb.gmlName}: cardinalDirection tekrar ediyor (${vals.join(', ')}).`, targetGmlId: bb.gmlId, tkgmMessage: 'CardinalDirection aynı değerden birden fazla içeremez.' });
      }
    },
  },
  {
    id: 'V-136',
    severity: 'U',
    source: 'Şartname §6.9, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const net = num(bb.attributesMap.independentSectionPlanNetArea);
        const gross = num(bb.attributesMap.independentSectionPlanGrossArea);
        if (net > 0 && gross > 0 && !(net < gross)) emit({ message: `${bb.gmlName}: net plan alanı (${net}) brüt alandan (${gross}) küçük olmalı.`, targetGmlId: bb.gmlId, tkgmMessage: 'Bağımsız Bölüm Brüt Alandan küçük olmalıdır' });
      }
    },
  },
  {
    id: 'V-137',
    severity: 'U',
    source: `Şartname §6.9. Ölçüldü: Ornek1–5'te 42 BB penceresiz (dükkan/depo/bodrum), TKGM kabul etmiş → UYARI. Rejim E'de açıklık yok → BİLGİ`,
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (!hasAnyOpenings(ctx)) {
        if (ctx.regime === 'E') emit({ severity: 'B', message: 'Dosyada hiç kapı/pencere yok (Rejim E). Yeni üretimde her BB için pencere zorunludur.' });
        else emit({ message: 'Dosyada hiç pencere yok.', tkgmMessage: 'Bağımsız bölümde pencere bulunamadı.' });
        return;
      }
      for (const bb of ctx.byPrefix('BB_')) {
        const rooms = new Set(roomsOfBb(ctx, bb).map((r) => r.gmlId));
        if (rooms.size === 0) continue;
        if (openingsOf(ctx, rooms, 'PEN_').length === 0) emit({ message: `${bb.gmlName}: hiçbir kısımda pencere yok.`, targetGmlId: bb.gmlId, tkgmMessage: 'Bağımsız bölümde pencere bulunamadı.' });
      }
    },
  },
  {
    id: 'V-138',
    severity: 'U',
    source: `Şartname §6.9 (H/U). Ölçüldü: Ornek1–5'te 63 BB'de 1003 kapı yok, TKGM kabul etmiş → UYARI (N31)`,
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (!hasAnyOpenings(ctx)) return; // V-137'de raporlandı
      for (const bb of ctx.byPrefix('BB_')) {
        const rooms = new Set(roomsOfBb(ctx, bb).map((r) => r.gmlId));
        if (rooms.size === 0) continue;
        const doors = openingsOf(ctx, rooms, 'KAPI_');
        if (!doors.some((d) => d.attributesMap.doorUsage === '1003')) {
          emit({ message: `${bb.gmlName}: doorUsage = 1003 (Bağımsız Bölüm Kapı) olan kapı yok.`, targetGmlId: bb.gmlId, tkgmMessage: 'Bağımsız bölümde, kapı kullanım amacı 1003 olan bir kapı elementi bulunamadı.' });
        }
      }
    },
  },
  {
    id: 'V-139',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const rooms = new Set(roomsOfBb(ctx, bb).map((r) => r.gmlId));
        const wins = openingsOf(ctx, rooms, 'PEN_').filter((w) => w.attributesMap.windowUsage === '1001');
        if (wins.length === 0) continue;
        const holes = new Set(bbTub(ctx, bb).ps.flatMap((p) => p.interiorRings.map((h) => openingKey(h.vertices))));
        const missing = wins.filter((w) => {
          const wp = ctx.polysOf(w)[0];
          return wp !== undefined && !holes.has(openingKey(wp.exteriorRing.vertices));
        });
        if (missing.length > 0) emit({ message: `${bb.gmlName}: ${missing.length} dış pencere için BB geometrisinde uygun delik yok (ilk: ${missing[0].gmlId}).`, targetGmlId: bb.gmlId, tkgmMessage: 'Bağımsız bölüm geometrisinde pencereye uygun delik bulunamadı.' });
      }
    },
  },
  {
    id: 'V-140',
    severity: 'H',
    source: 'Şartname §6.9',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const bb of ctx.byPrefix('BB_')) {
        const partHas1002 = roomsOfBb(ctx, bb).some((r) => r.attributesMap.geometrySuitability === '1002');
        const bbVals = bb.attributes.filter((a) => a.name === 'geometrySuitability').map((a) => a.cleanValue);
        if (partHas1002 && !bbVals.includes('1002')) emit({ message: `${bb.gmlName}: kısımda 1002 var ama BB'de yok.`, targetGmlId: bb.gmlId, tkgmMessage: 'Kısımda olan geometri uyumsuzluk kodu bagimsiz bolumde bulunamadı.' });
      }
    },
  },
  { id: 'V-141', severity: 'H', source: 'Şartname §6.9', status: 'sunucu', note: 'MAKS/TAKBİS (T).' },

  // ---------------- §6.10 Kısım ve Ortak Alan ----------------
  {
    id: 'V-150',
    severity: 'H',
    source: 'Şartname §6.10',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const r of [...ctx.byPrefix('BBK_'), ...ctx.byPrefix('OA_')]) {
        const own = new Set(r.surfaces.flatMap((s) => s.polygonIds));
        if (own.size === 0) {
          emit({ message: `${r.gmlName}: lod4 yüzey poligonu yok.`, targetGmlId: r.gmlId, tkgmMessage: `${r.gmlId} içerisinde Lod4MultiSurface elemanı bulunamadı.` });
          continue;
        }
        const bad = r.xlinkPolygonHrefs.map((h) => h.replace(/^#/, '')).filter((id) => !own.has(id) && !ctx.poly(id));
        if (bad.length > 0) emit({ message: `${r.gmlName}: ${bad.length} xlink referansı boundedBy içinde bulunamadı (ilk: ${bad[0]}).`, targetGmlId: r.gmlId });
      }
    },
  },
  {
    id: 'V-151',
    severity: 'H',
    source: 'Şartname §6.10, KURAL-2021',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const base = new Set(['FloorSurface', 'InteriorWallSurface', 'CeilingSurface']);
      for (const r of [...ctx.byPrefix('BBK_'), ...ctx.byPrefix('OA_'), ...ctx.byPrefix('BBKIY_'), ...ctx.byPrefix('OAIY_')]) {
        for (const s of r.surfaces) {
          const ok = base.has(s.tag) || (r.prefix === 'OA_' && s.tag === 'WallSurface');
          if (!ok) emit({ message: `${r.gmlName}: izin verilmeyen yüzey türü ${s.tag}.`, targetGmlId: r.gmlId });
        }
      }
    },
  },
  {
    id: 'V-152',
    severity: 'H',
    source: 'Şartname §6.10',
    status: 'uygulandi',
    note: 'V-153, V-154, V-166 aynı fonksiyonda.',
    run: (ctx, emit) => {
      for (const r of [...ctx.byPrefix('BBK_'), ...ctx.byPrefix('OA_')]) {
        const fl = r.surfaces.filter((s) => s.tag === 'FloorSurface').length;
        const ce = r.surfaces.filter((s) => s.tag === 'CeilingSurface').length;
        if (fl > 1) emit({ message: `${r.gmlName}: ${fl} FloorSurface elemanı (1 olmalı).`, targetGmlId: r.gmlId, tkgmMessage: 'Taban yüzeyi (FloorSurface) sayısı 1den fazla olamaz.' });
        if (ce > 1) emit({ message: `${r.gmlName}: ${ce} CeilingSurface elemanı (1 olmalı).`, targetGmlId: r.gmlId, tkgmMessage: 'Tavan yüzeyi … 1den fazla olamaz.' });
        const walls = surfacePolys(ctx, r, 'InteriorWallSurface').length + (r.prefix === 'OA_' ? surfacePolys(ctx, r, 'WallSurface').length : 0);
        if (walls < 3) emit({ ruleId: 'V-153', message: `${r.gmlName}: yan duvar poligonu ${walls} (en az 3).`, targetGmlId: r.gmlId, tkgmMessage: 'Yan duvar (InteriorWallSurface) sayısı 3ten az olamaz.' });
        if (fl === 0 || ce === 0 || walls === 0) {
          emit({ ruleId: r.prefix === 'OA_' ? 'V-166' : 'V-154', message: `${r.gmlName}: taban, duvar ve tavan yüzeylerinden biri eksik.`, targetGmlId: r.gmlId, tkgmMessage: r.prefix === 'OA_' ? 'Ortak alan taban,yan duvar ve tavana sahip olmalıdır.' : 'Kısım taban,duvar ve tavan yüzeylerine sahip olmalıdır.' });
        }
      }
    },
  },
  { id: 'V-153', severity: 'H', source: 'Şartname §6.10', status: 'uygulandi', note: 'V-152 ile birlikte; yüzey elemanı yerine poligon sayılır (İç Yapılarda tek eleman çok poligon, ölçüldü).' },
  { id: 'V-154', severity: 'H', source: 'Şartname §6.10', status: 'uygulandi', note: 'V-152 ile birlikte çalışır.' },
  {
    id: 'V-155',
    severity: 'H',
    source: 'Şartname §6.10 (±0.01 m²)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const r of [...ctx.byPrefix('BBK_'), ...ctx.byPrefix('OA_')]) {
        const declared = num(r.attributesMap.calculatedArea);
        if (!(declared > 0)) {
          emit({ message: `${r.gmlName}: calculatedArea > 0 olmalı (bulunan: ${r.attributesMap.calculatedArea}).`, targetGmlId: r.gmlId, tkgmMessage: 'CalculatedArea 0dan büyük olmalıdır.' });
          continue;
        }
        const area = surfacePolys(ctx, r, 'FloorSurface').reduce((s, p) => s + p.areaM2, 0);
        if (area > 0 && Math.abs(area - declared) > 0.01 + 1e-9) {
          emit({ message: `${r.gmlName}: calculatedArea (${declared.toFixed(2)}) taban alanından (${area.toFixed(2)}) farklı.`, targetGmlId: r.gmlId, tkgmMessage: `Verilen calculatedArea (${declared}) ile geometriden hesaplanan değer (${area.toFixed(2)}) uymamaktadır.` });
        }
      }
    },
  },
  {
    id: 'V-156',
    severity: 'H',
    source: 'Şartname §6.10',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const r of ctx.byPrefix('BBK_')) {
        const v = num(r.attributesMap.planArea);
        if (!(v > 0 || v === -1)) emit({ message: `${r.gmlName}: planArea > 0 veya -1 olmalı (bulunan: ${r.attributesMap.planArea}).`, targetGmlId: r.gmlId, tkgmMessage: 'PlanArea 0dan büyük olmalıdır.' });
      }
    },
  },
  {
    id: 'V-157',
    severity: 'U',
    source: 'Şartname §6.10 (tolerans %10)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const r of ctx.byPrefix('BBK_')) {
        const plan = num(r.attributesMap.planArea);
        const calc = num(r.attributesMap.calculatedArea);
        if (plan > 0 && calc > 0 && Math.abs(calc - plan) / plan > 0.1) emit({ message: `${r.gmlName}: hesaplanan alan (${calc}) plan alanından (${plan}) %10'dan fazla farklı.`, targetGmlId: r.gmlId, tkgmMessage: 'Hesaplanan alan ile plandan gelen alan eşit değil. (Tolerans %10)' });
      }
    },
  },
  {
    id: 'V-158',
    severity: 'U',
    source: 'Şartname §6.10 (H/U; geometrik hacim karşılaştırması %1 toleransla UYARI)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const r of ctx.byPrefix('BBK_')) {
        const vol = num(r.attributesMap.volume);
        const area = num(r.attributesMap.calculatedArea);
        if (vol > 0 && area > 0 && !(vol > area)) emit({ message: `${r.gmlName}: volume (${vol}) calculatedArea'dan (${area}) büyük olmalı.`, targetGmlId: r.gmlId, tkgmMessage: 'Hacim değeri hesaplanan alandan büyük olmalıdır.' });
        if (!(vol > 0)) continue;
        const fl = surfacePolys(ctx, r, 'FloorSurface');
        const ce = surfacePolys(ctx, r, 'CeilingSurface');
        if (fl.length === 0 || ce.length === 0) continue;
        const z0 = Math.min(...fl.map((p) => p.minZ));
        const geo = prismVolumeUnder(ce.map((p) => ({ exterior: p.exteriorRing.vertices, holes: p.interiorRings.map((h) => h.vertices) })), z0);
        if (geo > 0 && Math.abs(geo - vol) / vol > 0.01) {
          emit({ message: `${r.gmlName}: volume (${vol.toFixed(2)}) geometrik hacimden (${geo.toFixed(2)}) %1'den fazla farklı.`, targetGmlId: r.gmlId, tkgmMessage: 'Girilen hacim (Volume), geometriden hesaplanan ile eşit değil.' });
        }
      }
    },
  },
  {
    id: 'V-159',
    severity: 'H',
    source: 'Şartname §6.10',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const r of [...ctx.byPrefix('BBK_'), ...ctx.byPrefix('OA_')]) {
        const fl = surfacePolys(ctx, r, 'FloorSurface');
        const ce = surfacePolys(ctx, r, 'CeilingSurface');
        if (fl.length === 0 || ce.length === 0) continue;
        const h = Math.max(...ce.map((p) => p.maxZ)) - Math.min(...fl.map((p) => p.minZ));
        if (h < 1.5 - 1e-9) emit({ message: `${r.gmlName}: oda yüksekliği ${h.toFixed(2)} m (< 1.5 m).`, targetGmlId: r.gmlId, tkgmMessage: 'Oda yüksekliği 1.5 metreden az olamaz.' });
      }
    },
  },
  {
    id: 'V-160',
    severity: 'H',
    source: 'Şartname §6.10',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const r of ctx.byPrefix('BBK_')) {
        const ref = r.attributesMap.independentSectionObjectReference;
        if (!ref || !ref.startsWith('BB_') || !ctx.obj(ref)) emit({ message: `${r.gmlName}: independentSectionObjectReference (${ref}) geçerli bir BB_ değil.`, targetGmlId: r.gmlId, tkgmMessage: 'Referansı verilen bağımsız bölüm bulunamadı.' });
      }
    },
  },
  {
    id: 'V-161',
    severity: 'H',
    source: 'Şartname §6.10',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const r of ctx.byPrefix('OA_')) {
        const ref = r.attributesMap.storeyObjectReference;
        if (ref !== '-1' && !(ref && ref.startsWith('K_') && ctx.obj(ref))) emit({ message: `${r.gmlName}: storeyObjectReference (${ref}) geçerli bir K_ veya -1 değil.`, targetGmlId: r.gmlId, tkgmMessage: 'Referanslanan kat nesnesi bulunamadı.' });
      }
    },
  },
  { id: 'V-162', severity: 'H', source: 'Şartname §6.10', status: 'ertelendi', note: 'Oda–BB temas/kesişim alanı için 3B boolean gerekir; M2.x.' },
  {
    id: 'V-163',
    severity: 'U',
    source: `Şartname §6.10. Ölçüldü: Ornek1/3/4/5'te 90 kısım kapısız (teknik hacim, kiler, niteliksiz OA), TKGM kabul etmiş → UYARI`,
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (!hasAnyOpenings(ctx)) return; // V-137'de raporlandı
      const parents = new Set(ctx.byPrefix('KAPI_').map((d) => d.parentGmlId));
      for (const r of ctx.byPrefix('BBK_')) {
        if (!parents.has(r.gmlId)) emit({ message: `${r.gmlName}: kısımda kapı yok.`, targetGmlId: r.gmlId, tkgmMessage: 'Kısımda kapı bulunamadı.' });
      }
    },
  },
  {
    id: 'V-164',
    severity: 'H',
    source: 'Şartname §6.10 (LK_OuterWindowPairNotFound)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      // Odadaki dış pencere duvarın iç yüzünde, binadaki karşılığı dış yüzünde durur (plan koordinatları farklıdır).
      // Eşleşme: üst kot ±1 mm, alt kot ±60 mm (N20), genişlik ±10 cm, yüzey normali paralel, merkezler arası ≤ 0.8 m.
      // Genişlik toleransı: Ornek2/Ornek3 dükkan vitrinlerinde iç ve dış yüz genişliği 1–9 cm farklı, TKGM kabul etmiş (ölçüldü).
      // 1 mm'den büyük genişlik farkları ayrıca BİLGİ olarak sayılır.
      const mb = ctx.building?.gmlId;
      const buildingOps = [...ctx.byPrefix('PEN_')]
        .filter((o) => o.parentGmlId === mb)
        .map((o) => ctx.polysOf(o)[0])
        .filter((p): p is ImportedPolygon => p !== undefined)
        .map(openingShape);
      if (buildingOps.length === 0) return;
      let widthDiff = 0;
      for (const w of ctx.byPrefix('PEN_')) {
        if (w.parentGmlId === mb || w.attributesMap.windowUsage !== '1001') continue;
        const p = ctx.polysOf(w)[0];
        if (!p) continue;
        const s = openingShape(p);
        const aligned = buildingOps.filter(
          (b) =>
            Math.abs(b.maxZ - s.maxZ) <= MM + 1e-9 &&
            Math.abs(b.minZ - s.minZ) <= 0.06 + 1e-9 &&
            Math.abs(b.nx * s.nx + b.ny * s.ny) > 0.99 &&
            // Düzlemler arası uzaklık (duvar kalınlığı) ≤ 0.8 m ve plan merkezleri ≤ 3 m
            Math.abs((s.cx - b.cx) * b.nx + (s.cy - b.cy) * b.ny) <= 0.8 &&
            Math.hypot(s.cx - b.cx, s.cy - b.cy) <= 3
        );
        if (aligned.length === 0) {
          emit({ message: `${w.gmlId}: kısımdaki dış pencerenin binada (LoD2) aynı hizada karşılığı yok.`, targetGmlId: w.gmlId, polygonGmlId: p.gmlId, tkgmMessage: 'Kısımdaki pencere objesinin binada karşılığı bulunamadı.' });
          continue;
        }
        const pair = aligned.find((b) => {
          // Oda penceresinin yatay açıklığı, bina penceresinin açıklığı içinde (±10 cm).
          // Ornek3: tek bir bina vitrini (4.32 m) içeride birden fazla dükkan/OA penceresine bölünmüş (ölçüldü).
          const tx = -b.ny;
          const ty = b.nx;
          const bLo = b.xs.reduce((m, q) => Math.min(m, q.e * tx + q.n * ty), Number.POSITIVE_INFINITY);
          const bHi = b.xs.reduce((m, q) => Math.max(m, q.e * tx + q.n * ty), Number.NEGATIVE_INFINITY);
          const sLo = s.xs.reduce((m, q) => Math.min(m, q.e * tx + q.n * ty), Number.POSITIVE_INFINITY);
          const sHi = s.xs.reduce((m, q) => Math.max(m, q.e * tx + q.n * ty), Number.NEGATIVE_INFINITY);
          return sLo >= bLo - 0.1 - 1e-9 && sHi <= bHi + 0.1 + 1e-9;
        });
        if (!pair) emit({ severity: 'U', message: `${w.gmlId}: binada aynı hizada pencere var ama oda penceresinin yatay açıklığı onu 10 cm'den fazla aşıyor.`, targetGmlId: w.gmlId, polygonGmlId: p.gmlId });
        else if (Math.abs(pair.width - s.width) > MM + 1e-9) widthDiff++;
      }
      if (widthDiff > 0) emit({ severity: 'B', message: `${widthDiff} dış pencerede oda ve bina tarafı genişlikleri 1 mm'den fazla farklı (kotlar aynı).` });
    },
  },
  { id: 'V-165', severity: 'U', source: 'Şartname §6.10', status: 'ertelendi', note: 'Mesajın tam anlamı DOĞRULANMALI (şartname notu).' },
  { id: 'V-166', severity: 'H', source: 'Şartname §6.10', status: 'uygulandi', note: 'V-152 ile birlikte çalışır.' },

  // ---------------- §6.11 Açıklıklar ----------------
  {
    id: 'V-170',
    severity: 'H',
    source: 'Şartname §6.11',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const o of [...ctx.byPrefix('KAPI_'), ...ctx.byPrefix('PEN_')]) {
        if (o.hostSurfaceTag !== 'WallSurface' && o.hostSurfaceTag !== 'InteriorWallSurface') {
          emit({ message: `${o.gmlId}: açıklık WallSurface veya InteriorWallSurface içinde değil (${o.hostSurfaceTag}).`, targetGmlId: o.gmlId, tkgmMessage: 'Pencere objesi duvar yüzeyinde (WallSurface) olmalıdır.' });
        }
      }
    },
  },
  {
    id: 'V-171',
    severity: 'H',
    source: 'Şartname §6.11',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const o of [...ctx.byPrefix('KAPI_'), ...ctx.byPrefix('PEN_')]) {
        const ps = ctx.polysOf(o);
        const kind = o.prefix === 'KAPI_' ? 'Kapı' : 'Pencere';
        if (ps.length !== 1) emit({ message: `${o.gmlId}: ${kind}da tam 1 poligon olmalı (bulunan: ${ps.length}).`, targetGmlId: o.gmlId, tkgmMessage: `${kind}de sadece 1 tane poligon bulunmalıdır.` });
        else if (ps[0].interiorRings.length > 0) emit({ message: `${o.gmlId}: ${kind} poligonu deliksiz olmalı.`, targetGmlId: o.gmlId, polygonGmlId: ps[0].gmlId, tkgmMessage: `${kind} deliksiz olmalıdır.` });
      }
    },
  },
  {
    id: 'V-172',
    severity: 'H',
    source: 'Şartname §6.11 (N20: alt kot farkı bilgi olarak raporlanır)',
    status: 'uygulandi',
    note: 'V-203 aynı fonksiyonda.',
    run: (ctx, emit) => runOpeningHoleMatch(ctx, emit),
  },
  { id: 'V-173', severity: 'H', source: 'Şartname §6.11', status: 'okuyucuda', note: 'doorUsage/windowUsage kod listesi denetimi (V-063).' },
  { id: 'V-174', severity: 'H', source: 'Şartname §6.11, REHBER', status: 'ertelendi', note: 'Açıklık–duvar alan çakışması için çokgen kesişimi gerekir; V-172 delik eşleşmesi kısmen karşılar. M2.x.' },

  // ---------------- §6.12 Balkon ve Teras ----------------
  {
    id: 'V-180',
    severity: 'H',
    source: 'Şartname §6.12',
    status: 'uygulandi',
    note: 'V-181 aynı fonksiyonda.',
    run: (ctx, emit) => {
      for (const b of [...ctx.byPrefix('BLKN_'), ...ctx.byPrefix('TRS_')]) {
        const ps = ctx.polysOf(b);
        if (ps.length === 0) {
          emit({ message: `${b.gmlName}: lod2 geometrisi yok.`, targetGmlId: b.gmlId });
          continue;
        }
        const hasFloor = b.surfaces.some((s) => s.tag === 'FloorSurface');
        const hasWall = b.surfaces.some((s) => s.tag === 'WallSurface');
        if (!hasFloor || !hasWall) emit({ ruleId: 'V-181', message: `${b.gmlName}: taban (FloorSurface) ve yan duvar (WallSurface) olmalı.`, targetGmlId: b.gmlId, tkgmMessage: 'Balkonlar yan duvar ve tabanlara sahip olmalıdır.' });
      }
    },
  },
  { id: 'V-181', severity: 'H', source: 'Şartname §6.12', status: 'uygulandi', note: 'V-180 ile birlikte çalışır.' },
  {
    id: 'V-182',
    severity: 'H',
    source: 'Şartname §6.12',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const b of [...ctx.byPrefix('BLKN_'), ...ctx.byPrefix('TRS_')]) {
        const levels = horizontalLevels(surfacePolys(ctx, b, 'FloorSurface'));
        if (levels.length < 2) continue;
        const thick = (levels[levels.length - 1] - levels[0]) / 1000;
        const kind = b.prefix === 'TRS_' ? 'Teras' : 'Balkon';
        if (thick < 0.1 - 1e-9) emit({ message: `${b.gmlName}: zemin kalınlığı ${thick.toFixed(3)} m (< 0.10).`, targetGmlId: b.gmlId, tkgmMessage: `${kind} zemin kalınlığı çok az.` });
        const bb = ctx.obj(b.referencedBbGmlId);
        if (bb && b.prefix === 'BLKN_') {
          const t = bbTub(ctx, bb);
          if (t.bottom !== null && t.top !== null) {
            const bbThick = t.top - t.bottom;
            if (Math.abs(bbThick - thick) > MM + 1e-9) emit({ message: `${b.gmlName}: taban kalınlığı (${thick.toFixed(3)}) BB taban kalınlığından (${bbThick.toFixed(3)}) farklı.`, targetGmlId: b.gmlId, tkgmMessage: 'Bağımsız bölüm taban kalınlığı ile balkon taban kalınlığı aynı olmalıdır.' });
          }
        }
      }
    },
  },
  { id: 'V-183', severity: 'H', source: 'Şartname §6.12', status: 'ertelendi', note: 'Korkuluk duvar kalınlığı için karşılıklı yüz eşleştirmesi gerekir; M2.x.' },
  { id: 'V-184', severity: 'H', source: 'Şartname §6.12', status: 'ertelendi', note: 'Balkon–BB temas boşluğu için 3B yakınlık testi gerekir; M2.x.' },
  {
    id: 'V-185',
    severity: 'H',
    source: 'Şartname §6.12',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const b of ctx.byPrefix('BLKN_')) {
        const bb = ctx.obj(b.referencedBbGmlId);
        if (!bb || b.maxZ === null) continue;
        const t = bbTub(ctx, bb);
        if (t.maxZ !== null && b.maxZ > t.maxZ + MM + 1e-9) emit({ message: `${b.gmlName}: korkuluk tepesi (${b.maxZ.toFixed(3)}) BB duvar tepesinden (${t.maxZ.toFixed(3)}) yüksek.`, targetGmlId: b.gmlId, tkgmMessage: 'Balkon duvarı, bağımsız bölüm duvarından daha uzun olamaz.' });
      }
    },
  },
  {
    id: 'V-186',
    severity: 'H',
    source: 'Şartname §6.12 (bilinen istisna: Ornek2 balkonlarında 1002, §6.14)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const b of [...ctx.byPrefix('BLKN_'), ...ctx.byPrefix('TRS_')]) {
        const v = b.attributesMap.geometrySuitability;
        if (v !== '1001') emit({ message: `${b.gmlName}: geometrySuitability 1001 olmalı (bulunan: ${v}).`, targetGmlId: b.gmlId, tkgmMessage: 'balkon geometrik uygunluk 1001 olmalıdır.' });
      }
    },
  },
  {
    id: 'V-187',
    severity: 'H',
    source: 'Şartname §6.12',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const t of ctx.byPrefix('TRS_')) {
        if (t.attributesMap.independentSectionObjectReference !== '-1') emit({ message: `${t.gmlName}: teras referansı -1 olmalı.`, targetGmlId: t.gmlId, tkgmMessage: 'Terasın bağımsız bölüm referans değer -1 olmalıdır.' });
      }
    },
  },
  {
    id: 'V-188',
    severity: 'H',
    source: 'Şartname §6.12',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const b of ctx.byPrefix('BLKN_')) {
        const ref = b.attributesMap.independentSectionObjectReference;
        if (!ref || !ref.startsWith('BB_') || !ctx.obj(ref)) emit({ message: `${b.gmlName}: balkon referansı (${ref}) geçerli BB_ değil.`, targetGmlId: b.gmlId, tkgmMessage: 'Referansı verilen bağımsız bölüm bulunamadı.' });
      }
    },
  },

  // ---------------- §6.13 MBG ----------------
  {
    id: 'V-190',
    severity: 'H',
    source: 'Şartname §6.13',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const mbg = ctx.byPrefix('MBG_')[0];
      if (!mbg) return;
      const refs = new Set(mbg.groupMemberHrefs.map((h) => h.replace(/^#/, '')));
      for (const r of refs) if (!ctx.obj(r)) emit({ message: `MBG üyesi (${r}) dosyada yok.`, targetGmlId: mbg.gmlId });
      if (ctx.building && !refs.has(ctx.building.gmlId)) emit({ message: 'Bina (MB_) MimariBinaGrup içinde yok.', targetGmlId: mbg.gmlId });
      for (const k of ctx.byPrefix('K_')) if (!refs.has(k.gmlId)) emit({ message: `${k.gmlName} MimariBinaGrup içinde yok.`, targetGmlId: mbg.gmlId, tkgmMessage: 'Kat referansı, MimariBinaGrup içinde bulunamadı.' });
      for (const bb of ctx.byPrefix('BB_')) if (!refs.has(bb.gmlId)) emit({ message: `${bb.gmlName} MimariBinaGrup içinde yok.`, targetGmlId: mbg.gmlId });
    },
  },
  { id: 'V-191', severity: 'H', source: 'Şartname §6.13', status: 'uygulandi', note: 'MBG adı V-058, sınıfı V-057 içinde denetlenir.' },
  { id: 'V-192', severity: 'H', source: 'Şartname §6.13', status: 'kismi', note: 'Aynı parseldeki diğer binaların GML\'leri gerekir (K).' },
  { id: 'V-193', severity: 'H', source: 'Şartname §6.13', status: 'kismi', note: 'Parsel geometrisi gerekir (K/T).' },
  { id: 'V-194', severity: 'H', source: 'Şartname §6.13', status: 'sunucu', note: 'Veritabanı (T).' },
  { id: 'V-195', severity: 'U', source: 'Şartname §6.13', status: 'sunucu', note: 'MAKS (T).' },
];

/**
 * V-172 / V-203: Her kapı/pencere poligonunun, bağlı olduğu yüzeyin poligonlarında özdeş bir deliği olmalı.
 * - Tam özdeş (ringKey) → uygun.
 * - Plan + üst kot aynı, alt kot farklı (N20: kapı 0 mm, delik +50 mm) → BİLGİ.
 * - Hiç karşılık yok → HATA.
 * V-203: delik halkasının gml:id'si açıklık halkasının gml:id'si ile aynı olamaz.
 */
function runOpeningHoleMatch(ctx: RuleContext, emit: Emit): void {
  let bottomDiff = 0;
  for (const o of [...ctx.byPrefix('KAPI_'), ...ctx.byPrefix('PEN_')]) {
    const op = ctx.polysOf(o)[0];
    const parent = ctx.obj(o.parentGmlId);
    if (!op || !parent) continue;
    const surf = parent.surfaces.find((s) => s.openingObjectIds.includes(o.gmlId));
    if (!surf) continue;
    const hostPolys = [...surf.polygonIds, ...surf.xlinkHrefs.map((h) => h.replace(/^#/, ''))].map((id) => ctx.poly(id)).filter((p): p is ImportedPolygon => p !== undefined);
    const exact = ringKey(op.exteriorRing.vertices);
    const loose = openingKey(op.exteriorRing.vertices);
    let found: 'exact' | 'loose' | null = null;
    let holeId = '';
    for (const hp of hostPolys) {
      for (const h of hp.interiorRings) {
        if (ringKey(h.vertices) === exact) {
          found = 'exact';
          holeId = h.gmlId;
          break;
        }
        if (!found && openingKey(h.vertices) === loose) {
          found = 'loose';
          holeId = h.gmlId;
        }
      }
      if (found === 'exact') break;
    }
    const kind = o.prefix === 'KAPI_' ? 'kapıya' : 'pencereye';
    if (!found) {
      emit({ message: `${o.gmlId}: bağlı duvar yüzeyinde ${kind} uygun delik yok.`, targetGmlId: o.gmlId, polygonGmlId: op.gmlId, tkgmMessage: `Duvar yüzeyinde ${kind} uygun delik bulunamadı.` });
      continue;
    }
    if (found === 'loose') bottomDiff++;
    if (holeId && holeId === op.exteriorRing.gmlId) {
      emit({ ruleId: 'V-203', message: `${o.gmlId}: açıklık halkası ile duvardaki delik halkası aynı gml:id'yi taşıyor (${holeId}).`, targetGmlId: o.gmlId, polygonGmlId: op.gmlId });
    }
  }
  if (bottomDiff > 0) emit({ severity: 'B', message: `${bottomDiff} açıklıkta nesne ile delik planda ve üst kotta aynı, alt kotta farklı (N20: kapı nesnesi zeminden başlayabilir).` });
}

