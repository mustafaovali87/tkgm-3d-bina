// M2 — Ek kurallar V-196…V-216 (GEMINI13 şartname tablosu, KARARLAR)
import { newellNormal, uniqueRing } from './geom.ts';
import type { RuleDefinition } from './types.ts';

export const EXTRA_RULES: readonly RuleDefinition[] = [
  {
    id: 'V-196',
    severity: 'H',
    source: 'K59, ÖLÇÜLDÜ (Ornek2 10/10)',
    status: 'uygulandi',
    note: 'Yalnız taban/duvar/tavan varlığı; oda tabanını delmeme koşulu M2.x.',
    run: (ctx, emit) => {
      for (const iy of [...ctx.byPrefix('BBKIY_'), ...ctx.byPrefix('OAIY_')]) {
        const tags = new Set(iy.surfaces.map((s) => s.tag));
        if (!tags.has('FloorSurface') || !tags.has('CeilingSurface') || !tags.has('InteriorWallSurface')) {
          emit({ message: `${iy.gmlName}: iç yapıda taban, duvar ve tavan yüzeyleri olmalı.`, targetGmlId: iy.gmlId });
        }
      }
    },
  },
  { id: 'V-197', severity: 'U', source: 'K71', status: 'ertelendi', note: 'İç-oda deliği eşleştirmesi; M2.x.' },
  { id: 'V-198', severity: 'B', source: 'K84', status: 'okuyucuda', note: 'landShare.parsePropertyLot' },
  { id: 'V-198a', severity: 'H', source: 'K27, K84', status: 'okuyucuda', note: 'landShare.parsePropertyLot' },
  { id: 'V-198b', severity: 'U', source: 'K84', status: 'okuyucuda', note: 'landShare.parsePropertyLot' },
  { id: 'V-199', severity: 'B', source: 'K84, N20', status: 'okuyucuda', note: 'landShare.analyzeBuildingLandShares' },
  { id: 'V-200', severity: 'B', source: 'K30, K85', status: 'ertelendi', note: 'Dubleks parça alan stratejisi raporu; M2.x.' },
  {
    id: 'V-201',
    severity: 'U',
    source: 'K10 (GML_M-17273333-F: 0.63–12.02 m)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const e = ctx.model.envelope;
      if (e.minZ < 0.5 || e.maxZ > 5000) emit({ message: `Kotlar ${e.minZ.toFixed(2)}…${e.maxZ.toFixed(2)} m: yerel (0 tabanlı) kot şüphesi; ortometrik kot olmalı.` });
    },
  },
  {
    id: 'V-202',
    severity: 'H',
    source: 'K15–K18; TKGM ret dosyası GML_M-17273333-F (kanıtlı ret nedeni)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const a = ctx.building?.attributesMap;
      if (!a) return;
      const reasons: string[] = [];
      if (a.geometrySuitability !== '1006') reasons.push(`geometrySuitability = ${a.geometrySuitability} (1006 olmalı)`);
      if (a.buildingType !== '1001') reasons.push(`buildingType = ${a.buildingType} (1001 olmalı)`);
      if ((a.tenderRegistrationNumber ?? '') !== '') reasons.push('tenderRegistrationNumber dolu');
      if ((a.architecturalPlanID ?? '') !== '') reasons.push('architecturalPlanID dolu');
      if (reasons.length > 0) emit({ message: `Sürdürülebilirlik kapsamı sabit değer ihlali: ${reasons.join('; ')}.`, targetGmlId: ctx.building?.gmlId, tkgmMessage: 'Sürdürülebilirlik kapsamındaki üretimlerde Bina geometrik uygunluğu 1006 olarak girilmelidir.' });
    },
  },
  { id: 'V-203', severity: 'H', source: 'K48, K80', status: 'uygulandi', note: 'V-172 ile birlikte çalışır.' },
  {
    id: 'V-204',
    severity: 'U',
    source: 'v3 §3.4, SÜRÜM v2.29',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const n = [...ctx.byPrefix('KAPI_'), ...ctx.byPrefix('PEN_')].filter((o) => o.classValue !== '').length;
      if (n > 0) emit({ message: `${n} kapı/pencerede bldg:class var (v2.29 ile kaldırıldı).` });
    },
  },
  {
    id: 'V-205',
    severity: 'U',
    source: 'K11, V-018',
    status: 'uygulandi',
    run: (ctx, emit) => {
      const e = ctx.model.envelope;
      const c = ctx.model.computedBounds;
      const d = Math.max(Math.abs(e.minE - c.minE), Math.abs(e.minN - c.minN), Math.abs(e.minZ - c.minZ), Math.abs(e.maxE - c.maxE), Math.abs(e.maxN - c.maxN), Math.abs(e.maxZ - c.maxZ));
      if (d > 0.001 + 1e-9) emit({ message: `Envelope gerçek geometri kutusundan ${(d * 1000).toFixed(0)} mm farklı.` });
    },
  },
  { id: 'V-206', severity: 'U', source: 'v3 §3.5', status: 'ertelendi', note: 'storeyUsage ↔ BB kullanım uyum tablosu tanımlı değil; ACIK_SORULAR.' },
  {
    id: 'V-207',
    severity: 'U',
    source: 'v3 §3.8',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const oa of ctx.byPrefix('OA_')) {
        const extra = ['geometrySuitability', 'planArea', 'volume'].filter((n) => oa.attributesMap[n] !== undefined);
        if (extra.length > 0) emit({ message: `${oa.gmlName}: ortak alanda yazılmaması gereken öznitelik: ${extra.join(', ')}.`, targetGmlId: oa.gmlId });
      }
    },
  },
  {
    id: 'V-208',
    severity: 'B',
    source: 'K83 (iptal edildi; yalnız bilgi)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (/<sender\b/i.test(ctx.xml)) emit({ message: 'Dosyada <sender> etiketi var.' });
    },
  },
  {
    id: 'V-209',
    severity: 'B',
    source: 'K78, N30 (içe alınan dosyada CCW yalnız bilgi; üretimde CW)',
    status: 'uygulandi',
    run: (ctx, emit) => {
      for (const p of ctx.model.polygons) {
        if (p.surfaceTag !== 'GroundSurface') continue;
        const nz = newellNormal(uniqueRing(p.exteriorRing.vertices)).z;
        if (nz > 0) emit({ message: `${p.gmlId}: GroundSurface üstten bakınca saat yönünün tersine (CCW). Üretimde CW yazılır.`, polygonGmlId: p.gmlId, targetGmlId: p.ownerObjectGmlId });
      }
    },
  },
  {
    id: 'V-210',
    severity: 'B',
    source: 'K62, K86, Kılavuz S.S.S. 27',
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (ctx.building?.attributesMap.architecturalProjectConfirmationDate === '1900-01-01') emit({ message: 'Onay tarihi 1900-01-01 (belgede tarih yok varsayılanı).', targetGmlId: ctx.building?.gmlId });
    },
  },
  { id: 'V-211', severity: 'H', source: 'K93', status: 'okuyucuda', note: 'gmlReader xlink çözümleme' },
  { id: 'V-212', severity: 'U', source: 'K84, N32', status: 'okuyucuda', note: 'landShare.analyzeBuildingLandShares' },
  { id: 'V-213', severity: 'B', source: 'N33', status: 'okuyucuda', note: 'model.parseMaksIdValue' },
  { id: 'V-214', severity: 'B', source: 'KONTROL-M1 G5', status: 'okuyucuda', note: 'gmlReader.parseGenericAttributesFromNode' },
  { id: 'V-215', severity: 'B', source: 'K55, K79, K87', status: 'okuyucuda', note: 'gmlReader.resolveProducerProfileFromFormAndOffset' },
  {
    id: 'V-216',
    severity: 'U',
    source: 'K68, Ek-A §A.3',
    status: 'uygulandi',
    run: (ctx, emit) => {
      if (/<bldg:measuredHeight\b/.test(ctx.xml)) emit({ message: 'bldg:measuredHeight yazılmış (yazılmamalı).' });
      if (/<bldg:lod2Solid\b/.test(ctx.xml)) emit({ message: 'bldg:lod2Solid yazılmış (yazılmamalı).' });
    },
  },
];
