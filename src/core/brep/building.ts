// M6 — Geometri motoru II: balkon/teras (§5.8), çatı (§5.9), LoD2 bina kabuğu (§5.10), LoD0/LoD1/TIC/Envelope (§5.11).
// Saf TS. Koordinatlar tamsayı mm; kimlikler uuidv5 ile deterministik.
import { polyAreaM2, ringAreaM2, signedArea2x } from '../design/geometry2d.ts';
import type { Balcony, DesignBuilding, Poly2, Pt2, Ring2, Roof, Storey } from '../design/types.ts';
import { DEFAULT_ROOF } from '../design/types.ts';
import { edgeCovers, horizontal, ringEdges, round2, storeyLevels, wallFaces, type FaceHole } from './generate.ts';
import type { BrepIssue, BrepObject, BrepOpening, BrepPolygon, BrepPolygonKind, BrepShell, BrepSurface, Pt3, StoreyLevels } from './types.ts';

type IdOf = (prefix: string, path: string) => string;
const at = (p: Pt2, z: number): Pt3 => ({ x: p.x, y: p.y, z });
const rnd = (p: { x: number; y: number }): Pt2 => ({ x: Math.round(p.x), y: Math.round(p.y) });

/** Negatif numaralı katlar yer altı (§4.3). */
export const isBelowGround = (s: Storey) => /^-\d+$/.test(s.storeyNumber.trim());

/** İki doğrunun kesişimi (p + t·u, q + s·v); paralelse null. */
function intersectLines(p: { x: number; y: number }, u: { x: number; y: number }, q: { x: number; y: number }, v: { x: number; y: number }): { x: number; y: number } | null {
  const den = u.x * v.y - u.y * v.x;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((q.x - p.x) * v.y - (q.y - p.y) * v.x) / den;
  return { x: p.x + u.x * t, y: p.y + u.y * t };
}
const unit = (a: Pt2, b: Pt2) => {
  const l = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
};

/** CCW halkayı d mm dışa (d > 0) veya içe (d < 0) öteler; köşeler gönye (miter) kesişimi. */
export function offsetRing(r: Ring2, d: number): Pt2[] {
  const n = r.length;
  return r.map((p, i) => {
    const prev = r[(i - 1 + n) % n];
    const next = r[(i + 1) % n];
    const u1 = unit(prev, p);
    const u2 = unit(p, next);
    // CCW halkada dış normal sağdadır: (u.y, −u.x)
    const o1 = { x: prev.x + u1.y * d, y: prev.y - u1.x * d };
    const o2 = { x: p.x + u2.y * d, y: p.y - u2.x * d };
    const x = intersectLines(o1, u1, o2, u2);
    return rnd(x ?? { x: p.x + u2.y * d, y: p.y - u2.x * d });
  });
}

// ---------------------------------------------------------------------------------------------
// Balkon / Teras (§5.8)

function balconyObject(b: Balcony, building: DesignBuilding, lv: StoreyLevels, slab: number, gid: IdOf, issues: BrepIssue[]): BrepObject {
  const prefix = b.kind === 'Teras' ? 'TRS_' : 'BLKN_';
  const path = `balkon:${b.id}`;
  const pid = (kind: BrepPolygonKind, role: string) => gid(kind, `${path}:${role}`);
  const sp = building.sectionParts.find((s) => s.id === b.sectionPartId);
  const zB = sp?.zFloorOverride ?? lv.zFloorBottom;
  const zT = zB + slab;
  const outline: Ring2 = signedArea2x(b.outline) < 0 ? [...b.outline].reverse() : b.outline;
  const poly: Poly2 = { outer: outline, holes: [] };
  if (slab < 100) issues.push({ code: 'B-BLK-01', severity: 'H', elementId: b.id, message: `Balkon taban kalınlığı ${slab} mm < 100 (§5.8 madde 4).` });
  if (b.parapetThickness < 50) issues.push({ code: 'B-BLK-02', severity: 'H', elementId: b.id, message: `Korkuluk kalınlığı ${b.parapetThickness} mm < 50 (§5.8 madde 4).` });
  if (zT + b.parapetHeight > lv.zCeiling) issues.push({ code: 'B-BLK-03', severity: 'H', elementId: b.id, message: 'Korkuluk tepesi BB duvar tepesinden yüksek ("Balkon duvarı, BB duvarından daha uzun olamaz").' });

  // Taban kutusu: alt, üst ve tüm kenar yüzleri tek FloorSurface'te
  const floor: BrepPolygon[] = [horizontal(poly, zT, true, 'Floor_', pid('Floor_', 'ust')), horizontal(poly, zB, false, 'Floor_', pid('Floor_', 'alt'))];
  ringEdges(outline).forEach((e, i) => floor.push(...wallFaces(e, zB, zT, [], [], 'Floor_', (role) => pid('Floor_', `kenar:${i}:${role}`), issues, b.id).polygons));

  // Korkuluk: bina ile ortak olmayan ardışık kenar zincirleri boyunca içe ofsetli şerit (§5.8 madde 2)
  const n = outline.length;
  const isAttached = (i: number) => {
    const p = outline[i];
    const q = outline[(i + 1) % n];
    return b.attachedEdges.some(([a, c]) => (a.x === p.x && a.y === p.y && c.x === q.x && c.y === q.y) || (a.x === q.x && a.y === q.y && c.x === p.x && c.y === p.y));
  };
  const t = b.parapetThickness;
  const inward = (i: number) => {
    const u = unit(outline[i], outline[(i + 1) % n]);
    return { p: { x: outline[i].x - u.y * t, y: outline[i].y + u.x * t }, u };
  };
  const strips: Pt2[][] = [];
  const attachedIdx = [...Array(n).keys()].filter(isAttached);
  if (b.parapetHeight <= 0) {
    issues.push({ code: 'B-BLK-06', severity: 'B', elementId: b.id, message: 'Korkuluk yüksekliği 0: korkuluksuz balkon/teras üretildi.' });
  } else if (attachedIdx.length === 0) {
    issues.push({ code: 'B-BLK-04', severity: 'U', elementId: b.id, message: 'Balkonun bina ile ortak kenarı yok (balkon BB\'ye değmeli, §5.8 madde 4).' });
  } else {
    // Zincir başlangıcı: ortak kenardan sonra gelen ilk serbest kenar
    for (let s = 0; s < n; s++) {
      if (isAttached(s) || !isAttached((s - 1 + n) % n)) continue;
      const chain: number[] = [];
      for (let k = s; !isAttached(k % n) && chain.length < n; k++) chain.push(k % n);
      const outerPts = [...chain.map((i) => outline[i]), outline[(chain[chain.length - 1] + 1) % n]];
      const inner: Pt2[] = [];
      // Baş: ilk serbest kenarın iç ofset doğrusu ile önceki ortak kenar doğrusu
      const first = inward(chain[0]);
      const prevA = (chain[0] - 1 + n) % n;
      inner.push(rnd(intersectLines(first.p, first.u, outline[prevA], unit(outline[prevA], outline[chain[0]])) ?? first.p));
      for (let j = 1; j < chain.length; j++) {
        const a = inward(chain[j - 1]);
        const c = inward(chain[j]);
        inner.push(rnd(intersectLines(a.p, a.u, c.p, c.u) ?? c.p));
      }
      const last = inward(chain[chain.length - 1]);
      const nextA = (chain[chain.length - 1] + 1) % n;
      inner.push(rnd(intersectLines(last.p, last.u, outline[nextA], unit(outline[nextA], outline[(nextA + 1) % n])) ?? last.p));
      strips.push([...outerPts, ...inner.reverse()]);
    }
  }
  const zP = zT + b.parapetHeight;
  const walls: BrepSurface[] = [];
  strips.forEach((ring, si) => {
    const cap: BrepPolygon = { id: pid('Wall_', `korkuluk:${si}:kapak`), kind: 'Wall_', outer: ring.map((p) => at(p, zP)), holes: [] };
    walls.push({ id: gid('Wall_', `${path}:yuzey:${si}:kapak`), tag: 'WallSurface', polygons: [cap], openings: [] });
    ringEdges(ring).forEach((e, ei) => {
      for (const p of wallFaces(e, zT, zP, [], [], 'Wall_', (role) => pid('Wall_', `korkuluk:${si}:${ei}:${role}`), issues, b.id).polygons)
        walls.push({ id: gid('Wall_', `${path}:yuzey:${si}:${ei}`), tag: 'WallSurface', polygons: [p], openings: [] });
    });
  });
  return {
    id: gid(prefix, path),
    prefix,
    designId: b.id,
    storeyId: b.storeyId,
    surfaces: [{ id: gid('Floor_', `${path}:yuzey:taban`), tag: 'FloorSurface', polygons: floor, openings: [] }, ...walls],
    attributes: { calculatedArea: round2(polyAreaM2(poly)), planArea: b.planArea },
  };
}

// ---------------------------------------------------------------------------------------------
// Çatı (§5.9): elle yüzler veya parametrik düz / beşik / kırma (dikdörtgen planda)

function roofPolygons(roof: Roof, top: Storey, zRE: number, pid: (role: string) => string, issues: BrepIssue[], elementId: string): { polys: BrepPolygon[]; projectionArea: number } {
  if (roof.mode === 'manual') {
    const polys = (roof.facets ?? []).map((f, i) => ({ id: pid(`elle:${i}`), kind: 'Roof_' as const, outer: f.outer, holes: f.holes }));
    // İzdüşüm alanı: en alttaki yatay, aşağı bakan yüzlerin alanı (saçak dahil çatı tabanı; Ornek6 120.79)
    // Yatay izdüşüm: yukarı bakan yüzlerin izdüşüm alanları toplamı ile aşağı bakanlarınki (alt yüz) arasından büyüğü.
    // Kapalı gövdede ikisi eşittir (Ornek6: 120.79); yalnız üst yüzlü veya ters yönlü çatılarda da doğru sonuç verir.
    const netArea = (p: { outer: readonly Pt3[]; holes: readonly (readonly Pt3[])[] }) => ringAreaM2(p.outer) - p.holes.reduce((h, r) => h + ringAreaM2(r), 0);
    const up = polys.filter((p) => signedArea2x(p.outer) > 0).reduce((s, p) => s + netArea(p), 0);
    const down = polys.filter((p) => signedArea2x(p.outer) < 0).reduce((s, p) => s + netArea(p), 0);
    const area = Math.max(up, down);
    if (polys.length === 0) issues.push({ code: 'B-CAT-01', severity: 'H', elementId, message: 'Elle çatıda yüz yok.' });
    return { polys, projectionArea: area };
  }
  const base = top.outline[0];
  if (!base) return { polys: [], projectionArea: 0 };
  if (top.outline.length > 1) issues.push({ code: 'B-CAT-02', severity: 'U', elementId, message: 'Çok kütleli en üst kat: parametrik çatı yalnız ilk kütleye üretildi.' });
  const c = offsetRing(base.outer, roof.eaveOverhang);
  const z0 = zRE + roof.thickness;
  const polys: BrepPolygon[] = [horizontal({ outer: c, holes: [] }, zRE, false, 'Roof_', pid('alt'))];
  if (roof.thickness > 0) ringEdges(c).forEach((e, i) => polys.push(...wallFaces(e, zRE, z0, [], [], 'Roof_', (r) => pid(`alin:${i}:${r}`), issues, elementId).polygons));
  if (roof.mode === 'flat') {
    if (roof.thickness <= 0) issues.push({ code: 'B-CAT-03', severity: 'H', elementId, message: 'Düz çatı kalınlığı > 0 olmalı (kapalı gövde, §5.9).' });
    polys.push(horizontal({ outer: c, holes: [] }, z0, true, 'Roof_', pid('ust')));
    return { polys, projectionArea: ringAreaM2(c) };
  }
  // Beşik / kırma: yalnız dikdörtgen (4 köşe, dik açılar ±1°)
  const rightAngles = c.length === 4 && c.every((p, i) => {
    const a = unit(c[(i + 3) % 4], p);
    const b = unit(p, c[(i + 1) % 4]);
    return Math.abs(a.x * b.x + a.y * b.y) < Math.sin(Math.PI / 180);
  });
  if (!rightAngles) {
    issues.push({ code: 'B-CAT-04', severity: 'H', elementId, message: 'Parametrik beşik/kırma çatı yalnız dikdörtgen planda üretilir; düz veya elle çatı kullanın.' });
    polys.push(horizontal({ outer: c, holes: [] }, z0, true, 'Roof_', pid('ust')));
    return { polys, projectionArea: ringAreaM2(c) };
  }
  // c0→c1 uzun kenar olacak biçimde döndür
  const L01 = Math.hypot(c[1].x - c[0].x, c[1].y - c[0].y);
  const L12 = Math.hypot(c[2].x - c[1].x, c[2].y - c[1].y);
  const k = L01 >= L12 ? c : [c[1], c[2], c[3], c[0]];
  const L = Math.max(L01, L12);
  const W = Math.min(L01, L12);
  const h = Math.round((W / 2) * Math.tan((roof.pitchDeg * Math.PI) / 180));
  const u = unit(k[0], k[1]);
  const mid30 = { x: (k[3].x + k[0].x) / 2, y: (k[3].y + k[0].y) / 2 };
  const mid12 = { x: (k[1].x + k[2].x) / 2, y: (k[1].y + k[2].y) / 2 };
  const inset = roof.mode === 'hip' ? W / 2 : 0;
  const r0 = at(rnd({ x: mid30.x + u.x * inset, y: mid30.y + u.y * inset }), z0 + h);
  const r1 = at(rnd({ x: mid12.x - u.x * inset, y: mid12.y - u.y * inset }), z0 + h);
  const K = k.map((p) => at(p, z0));
  const face = (pts: Pt3[], role: string): BrepPolygon => {
    const uniq = pts.filter((p, i) => pts.findIndex((q) => q.x === p.x && q.y === p.y && q.z === p.z) === i);
    return { id: pid(role), kind: 'Roof_', outer: uniq, holes: [] };
  };
  polys.push(face([K[0], K[1], r1, r0], 'egim:0'), face([K[2], K[3], r0, r1], 'egim:1'), face([K[1], K[2], r1], 'uc:1'), face([K[3], K[0], r0], 'uc:0'));
  if (L - W < 2 && roof.mode === 'hip') issues.push({ code: 'B-CAT-05', severity: 'B', elementId, message: 'Kare planda kırma çatı piramit olarak üretildi.' });
  return { polys, projectionArea: ringAreaM2(c) };
}

// ---------------------------------------------------------------------------------------------
// Bina kabuğu

export function generateShell(building: DesignBuilding, lod2Openings: readonly BrepOpening[], gid: IdOf, issues: BrepIssue[], extraPoints: readonly Pt3[]): BrepShell {
  const path = `bina:${building.id}`;
  const pid = (kind: BrepPolygonKind, role: string) => gid(kind, `${path}:${role}`);
  const storeys = building.storeys;
  const levels = storeys.map(storeyLevels);
  const s0 = storeys[0];
  const top = storeys[storeys.length - 1];
  const lvTop = levels[levels.length - 1];
  const mbId = gid('MB_', path);

  // TIC (§5.11): tasarımdan; yoksa en alt kat sınırı @ döşeme altı
  const tic: Pt3[] = building.tic && building.tic.length >= 3 ? [...building.tic] : (s0?.outline[0]?.outer ?? []).map((p) => at(p, levels[0]?.zFloorBottom ?? 0));
  if (!building.tic) issues.push({ code: 'B-TIC-01', severity: 'U', elementId: building.id, message: 'TIC (aplikasyon köşeleri) girilmedi; en alt kat sınırı döşeme altı kotunda kullanıldı.' });
  const zTIC = tic.length ? Math.max(...tic.map((p) => p.z)) : (levels[0]?.zFloorBottom ?? 0);

  // LoD0: FootPrint = zTIC'e en yakın taban kotlu katın sınırı @ zTIC (normal yukarı); RoofEdge = en üst kat @ zCeiling
  const fpStorey = storeys.reduce((a, s) => (Math.abs(s.zBottom - zTIC) < Math.abs(a.zBottom - zTIC) ? s : a), s0);
  const lod0FootPrint = (fpStorey?.outline ?? []).map((pl, i) => horizontal(pl, zTIC, true, 'Lod0FootPrint_', pid('Lod0FootPrint_', `${i}`)));
  const lod0RoofEdge = (top?.outline ?? []).map((pl, i) => horizontal(pl, lvTop.zCeiling, true, 'Lod0RoofEdge_', pid('Lod0RoofEdge_', `${i}`)));

  // LoD1: [zTIC, zRoofEdge] prizması; FootPrint/RoofEdge'den alanı büyük olanın konturu
  const prism = (ring: Ring2, z0: number, z1: number, role: string): BrepPolygon[] => {
    const r = signedArea2x(ring) < 0 ? [...ring].reverse() : ring;
    const ps: BrepPolygon[] = [horizontal({ outer: r, holes: [] }, z1, true, 'Lod1Poligon_', pid('Lod1Poligon_', `${role}:ust`))];
    ringEdges(r).forEach((e, i) => ps.push(...wallFaces(e, z0, z1, [], [], 'Lod1Poligon_', (x) => pid('Lod1Poligon_', `${role}:yan:${i}:${x}`), issues, building.id).polygons));
    ps.push(horizontal({ outer: r, holes: [] }, z0, false, 'Lod1Poligon_', pid('Lod1Poligon_', `${role}:alt`)));
    return ps;
  };
  const fpRing = fpStorey?.outline[0]?.outer ?? [];
  const reRing = top?.outline[0]?.outer ?? [];
  const lod1Solids: BrepPolygon[][] = [];
  if (fpRing.length >= 3 && reRing.length >= 3) lod1Solids.push(prism(ringAreaM2(fpRing) >= ringAreaM2(reRing) ? fpRing : reRing, zTIC, lvTop.zCeiling, 'ustu'));
  if (s0 && levels[0].zFloorBottom < zTIC - 1) {
    const g = s0.outline[0]?.outer ?? [];
    lod1Solids.push(prism(ringAreaM2(fpRing) >= ringAreaM2(g) ? fpRing : g, levels[0].zFloorBottom, zTIC, 'alti'));
  }
  if ((fpStorey?.outline.length ?? 0) > 1 || (top?.outline.length ?? 0) > 1) issues.push({ code: 'B-LOD1-01', severity: 'U', elementId: building.id, message: 'Çok kütleli kat: LoD1 yalnız ilk kütle için üretildi.' });

  // LoD2 (§5.10): dış duvarlar (kat başına kenar × [zFloorBottom, zCeiling], T1 açıklıklarıyla), zemin, çatı
  const lod2Surfaces: BrepSurface[] = [];
  const roof = building.roof ?? DEFAULT_ROOF;
  const rp = roofPolygons(roof, top, lvTop.zCeiling, (role) => pid('Roof_', role), issues, building.id);
  lod2Surfaces.push({ id: pid('Roof_', 'yuzey'), tag: 'RoofSurface', polygons: rp.polys, openings: [] });
  lod2Surfaces.push({
    id: pid('Ground_', 'yuzey'),
    tag: 'GroundSurface',
    polygons: (s0?.outline ?? []).map((pl, i) => horizontal(pl, levels[0].zFloorBottom, false, 'Ground_', pid('Ground_', `${i}`))),
    openings: [],
  });
  const used = new Set<string>();
  storeys.forEach((s, si) => {
    const lv = levels[si];
    s.outline.forEach((pl, pi) =>
      [pl.outer, ...pl.holes].forEach((ring, ri) =>
        ringEdges(ring).forEach((e, ei) => {
          const ops = lod2Openings.filter((o) => {
            const r = o.polygon.outer;
            return !used.has(o.id) && r[0].z >= lv.zFloorBottom && r[1].z <= lv.zCeiling && edgeCovers(e, r[0], r[2]);
          });
          const holes: FaceHole[] = ops.map((o) => ({ key: o.id, a: o.polygon.outer[0], b: o.polygon.outer[2], zb: o.polygon.outer[0].z, zt: o.polygon.outer[1].z, kind: o.prefix === 'KAPI_' ? ('door' as const) : ('window' as const) }));
          const wf = wallFaces(e, lv.zFloorBottom, lv.zCeiling, [], holes, 'Wall_', (x) => pid('Wall_', `lod2:${s.id}:${pi}:${ri}:${ei}:${x}`), issues, building.id);
          for (const o of ops) used.add(o.id);
          // Her poligon ayrı WallSurface (Ornek6: 16 eleman); açıklıklar delikli poligonun yüzeyine
          wf.polygons.forEach((p, k) => {
            const mine = ops.filter((o) => p.holes.some((h) => h[0].x === o.polygon.outer[0].x && h[0].y === o.polygon.outer[0].y && h[0].z === o.polygon.outer[0].z));
            lod2Surfaces.push({ id: pid('Wall_', `lod2yuzey:${s.id}:${pi}:${ri}:${ei}:${k}`), tag: 'WallSurface', polygons: [p], openings: mine });
          });
        }),
      ),
    );
  });
  for (const o of lod2Openings) if (!used.has(o.id)) issues.push({ code: 'B-LOD2-01', severity: 'H', elementId: o.designOpeningId, message: 'LoD2 açıklığı bir dış duvar yüzüne yerleştirilemedi.' });
  // Dış taban / dış tavan (L − U, U − L): ardışık katların sınırı farklıysa Boolean fark gerekir
  for (let i = 1; i < storeys.length; i++) {
    const same = JSON.stringify(storeys[i].outline.map((p) => p.outer)) === JSON.stringify(storeys[i - 1].outline.map((p) => p.outer));
    if (!same) issues.push({ code: 'B-LOD2-02', severity: 'U', elementId: storeys[i].id, message: `Kat_${storeys[i - 1].storeyNumber} ile Kat_${storeys[i].storeyNumber} sınırı farklı: DışTaban/DışTavan yüzeyleri (Boolean fark, Clipper2) henüz üretilmiyor.` });
  }

  // Balkonlar
  const balconies: BrepObject[] = [];
  for (const b of building.balconies ?? []) {
    const si = storeys.findIndex((s) => s.id === b.storeyId);
    if (si < 0) {
      issues.push({ code: 'B-BLK-05', severity: 'H', elementId: b.id, message: 'Balkonun katı bulunamadı.' });
      continue;
    }
    balconies.push(balconyObject(b, building, levels[si], storeys[si].slabThickness, gid, issues));
  }

  // Envelope: tüm üretilen noktalar + TIC (§5.11)
  const pts: Pt3[] = [...extraPoints, ...tic];
  const addPolys = (ps: readonly BrepPolygon[]) => {
    for (const p of ps) pts.push(...p.outer);
  };
  addPolys(lod0FootPrint);
  addPolys(lod0RoofEdge);
  lod1Solids.forEach(addPolys);
  for (const s of lod2Surfaces) addPolys(s.polygons);
  for (const b of balconies) for (const s of b.surfaces) addPolys(s.polygons);
  // Döngüyle (büyük binalarda Math.min(...dizi) yığın taşırır; Ornek3)
  const min = { x: Infinity, y: Infinity, z: Infinity };
  const max = { x: -Infinity, y: -Infinity, z: -Infinity };
  for (const p of pts) {
    if (p.x < min.x) min.x = p.x;
    if (p.y < min.y) min.y = p.y;
    if (p.z < min.z) min.z = p.z;
    if (p.x > max.x) max.x = p.x;
    if (p.y > max.y) max.y = p.y;
    if (p.z > max.z) max.z = p.z;
  }

  let roofTop = lvTop.zCeiling;
  for (const p of rp.polys) for (const q of p.outer) if (q.z > roofTop) roofTop = q.z;
  const buildingHeight = building.info?.buildingHeight ?? round2((roofTop - zTIC) / 1000);
  return {
    id: mbId,
    mbgId: gid('MBG_', path),
    lod0FootPrint,
    lod0RoofEdge,
    lod1Solids,
    lod2Surfaces,
    balconies,
    tic,
    envelope: { min, max },
    roofProjectionArea: round2(rp.projectionArea),
    buildingHeight,
    storeysAboveGround: storeys.filter((s) => !isBelowGround(s)).length,
    storeysBelowGround: storeys.filter(isBelowGround).length,
  };
}
