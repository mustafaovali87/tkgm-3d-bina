// M5 — Geometri motoru I (şartname §5.1–§5.7, §5.12). Tasarım modelinden B-rep üretir:
// kot motoru, kısım (oda) kabukları, BB parçası küvetleri, kat kabukları, açıklıklar (T1–T4). Düz çatı, çatı arası yok.
// Saf TS: DOM/Node yok, rastgelelik yok. Kimlikler uuidv5 ile tasarım nesnesine bağlı (§5.1 madde 1).
import { pointInPoly, polyAreaM2, signedArea2x } from '../design/geometry2d.ts';
import type { DesignBuilding, DesignProject, Opening, Part, Poly2, Pt2, Ring2, SectionPart, Storey } from '../design/types.ts';
import { uuidv5 } from '../hash/canonical.ts';
import type {
  BrepBuilding,
  BrepIssue,
  BrepObject,
  BrepOpening,
  BrepOptions,
  BrepPolygon,
  BrepPolygonKind,
  BrepSurface,
  BrepSurfaceTag,
  Pt3,
  StoreyLevels,
} from './types.ts';
import { DEFAULT_BREP_OPTIONS } from './types.ts';

const TOL = 1; // mm, kenar eşleştirme toleransı (§5.1 madde 3)
const MAX_WALL = 1000; // mm, karşı yüz arama mesafesi (§5.4 madde 1)
const MIN_WALL = 10; // mm, bundan ince duvar dilimi yok sayılır (çizim yüzünün kendisi/yuvarlama)
const PARALLEL_SIN = Math.sin((0.5 * Math.PI) / 180);

/** 2 haneye "half away from zero" yuvarlama (§5.12). */
export function round2(v: number): number {
  return (Math.sign(v) * Math.round(Math.abs(v) * 100 + 1e-9)) / 100;
}

// ---------------------------------------------------------------------------------------------
// Kot motoru (§5.2)

export function storeyLevels(s: Storey): StoreyLevels {
  return { storeyId: s.id, zFloorBottom: s.zBottom, zFloorTop: s.zBottom + s.slabThickness, zCeiling: s.zBottom + s.height };
}

// ---------------------------------------------------------------------------------------------
// Yardımcılar

interface Edge {
  readonly p: Pt2;
  readonly q: Pt2;
}
const ringEdges = (r: Ring2): Edge[] => r.map((p, i) => ({ p, q: r[(i + 1) % r.length] }));
const polyRings = (p: Poly2): Ring2[] => [p.outer, ...p.holes];
const len = (e: Edge) => Math.hypot(e.q.x - e.p.x, e.q.y - e.p.y);
const dirOf = (e: Edge) => {
  const l = len(e);
  return { x: (e.q.x - e.p.x) / l, y: (e.q.y - e.p.y) / l };
};
const rnd = (p: { x: number; y: number }): Pt2 => ({ x: Math.round(p.x), y: Math.round(p.y) });
const at = (p: Pt2, z: number): Pt3 => ({ x: p.x, y: p.y, z });
const reversed = <T>(r: readonly T[]): T[] => [...r].reverse();

/** Nokta kenar doğrusuna uzaklığı ve kenar boyunca parametresi (mm). */
function projOn(e: Edge, s: { x: number; y: number }): { t: number; d: number } {
  const u = dirOf(e);
  const vx = s.x - e.p.x;
  const vy = s.y - e.p.y;
  return { t: vx * u.x + vy * u.y, d: Math.abs(vx * u.y - vy * u.x) };
}

/** [a, b] parçası kenarın üzerinde mi (doğrusal, uç noktalar kenar içinde; TOL)? */
function edgeCovers(e: Edge, a: Pt2, b: Pt2): boolean {
  const L = len(e);
  const pa = projOn(e, a);
  const pb = projOn(e, b);
  return pa.d <= TOL && pb.d <= TOL && Math.min(pa.t, pb.t) >= -TOL && Math.max(pa.t, pb.t) <= L + TOL;
}

// ---------------------------------------------------------------------------------------------
// Duvar yüzü üretimi: dikey dörtgen, T-kavşaklarda bölünür (§5.1 madde 3, §5.5 madde 3), delikler eklenir.

interface FaceHole {
  readonly key: string; // açıklık temsil anahtarı
  readonly a: Pt2;
  readonly b: Pt2;
  readonly zb: number;
  readonly zt: number;
}

interface WallFaceResult {
  readonly polygons: BrepPolygon[];
  /** Delik anahtarı → delik halkası (açıklık nesnesi aynı sıralı kopyasını alır, K48). */
  readonly holeRings: Map<string, Pt3[]>;
}

/**
 * Kenar p→q boyunca [z0, z1] dikey yüz(ler)i. Normal, p→q yönünün sağına bakar (malzeme solda kalan halka için dışa).
 * Dış halka: [p@z0, q@z0, q@z1, p@z1]; delik: [A@zb, A@zt, B@zt, B@zb] (ters yön).
 */
function wallFaces(
  e: Edge,
  z0: number,
  z1: number,
  splitPts: readonly Pt2[],
  holes: readonly FaceHole[],
  kind: BrepPolygonKind,
  idOf: (role: string) => string,
  issues: BrepIssue[],
  ownerId: string,
): WallFaceResult {
  const L = len(e);
  const u = dirOf(e);
  const P = (t: number): Pt2 => (t <= 0 ? e.p : t >= L ? e.q : rnd({ x: e.p.x + u.x * t, y: e.p.y + u.y * t }));
  const cuts = new Set<number>();
  for (const s of splitPts) {
    const pr = projOn(e, s);
    if (pr.d <= TOL && pr.t > TOL && pr.t < L - TOL) cuts.add(Math.round(pr.t));
  }
  const ts = [0, ...[...cuts].sort((a, b) => a - b), L];
  const holeRings = new Map<string, Pt3[]>();
  const polygons: BrepPolygon[] = [];
  const pieceHoles: Pt3[][][] = ts.slice(1).map(() => []);
  for (const h of holes) {
    const ta = projOn(e, h.a).t;
    const tb = projOn(e, h.b).t;
    const lo = Math.min(ta, tb);
    const hi = Math.max(ta, tb);
    const i = ts.findIndex((t, k) => k < ts.length - 1 && lo >= t + TOL && hi <= ts[k + 1] - TOL);
    if (i < 0) {
      issues.push({ code: 'B-OP-01', severity: 'H', elementId: ownerId, message: `Açıklık duvar parçasına sığmıyor (yüz sınırına değiyor veya bir T-kavşağını kesiyor): ${h.key}.` });
      continue;
    }
    if (h.zb <= z0 || h.zt >= z1) {
      issues.push({ code: 'B-OP-02', severity: 'H', elementId: ownerId, message: `Açıklık deliği duvar yüzünün alt/üst kenarına değiyor (${h.zb}–${h.zt} mm, yüz ${z0}–${z1} mm): ${h.key}. Delik dış halkaya değerse poligon geçersiz olur (§5.6, K45a).` });
      continue;
    }
    // Delik köşeleri açıklık noktalarının kendisidir (kenar üzerinde ≤ 1 mm); böylece BB yan yüzleri (söve, eşik,
    // lento) ve karşı odanın açıklık poligonu aynı köşeleri paylaşır.
    const [A, B] = ta <= tb ? [h.a, h.b] : [h.b, h.a];
    const ring = [at(A, h.zb), at(A, h.zt), at(B, h.zt), at(B, h.zb)];
    pieceHoles[i].push(ring);
    holeRings.set(h.key, ring);
  }
  for (let k = 0; k < ts.length - 1; k++) {
    const a = P(ts[k]);
    const b = P(ts[k + 1]);
    polygons.push({ id: idOf(`${k}`), kind, outer: [at(a, z0), at(b, z0), at(b, z1), at(a, z1)], holes: pieceHoles[k] });
  }
  return { polygons, holeRings };
}

/** Yatay yüz: normal yukarı ise halkalar olduğu gibi (dış CCW), aşağı ise ters çevrilir. */
function horizontal(poly: Poly2, z: number, up: boolean, kind: BrepPolygonKind, id: string): BrepPolygon {
  const f = (r: Ring2) => (up ? r : reversed(r)).map((p) => at(p, z));
  return { id, kind, outer: f(poly.outer), holes: poly.holes.map(f) };
}

// ---------------------------------------------------------------------------------------------
// Açıklık çözümleme (§5.4)

interface ResolvedOpening {
  readonly opening: Opening;
  /** Duvar diliminin iki yüz çizgisi: [a0,b0] çizim yüzü, [a1,b1] karşı yüz. */
  readonly lines: readonly [readonly [Pt2, Pt2], readonly [Pt2, Pt2]];
  /** Plan kesit dikdörtgeni R (CCW). */
  readonly rect: Ring2;
  readonly zb: number; // oda düzeyi delik tabanı (zFloorTop + sill)
  readonly zt: number;
  /** Yüzlerde T4 temsili alacak kısımlar ve hangi çizgide oldukları. */
  readonly partFaces: readonly { readonly partId: string; readonly line: 0 | 1 }[];
  /** EXT (kat dış sınırı) hangi çizgide; yoksa null. */
  readonly extLine: 0 | 1 | null;
  /** T3: açıklığın içinde bulunduğu BB parçası (duvar malzemesi W). */
  readonly sectionPartId: string | null;
}

interface StoreyCtx {
  readonly storey: Storey;
  readonly lv: StoreyLevels;
  readonly parts: readonly Part[];
  readonly sps: readonly SectionPart[];
}

function partFloorZ(p: Part, lv: StoreyLevels): number {
  return p.zFloorOverride ?? lv.zFloorTop;
}

function resolveOpening(o: Opening, ctx: StoreyCtx, issues: BrepIssue[]): ResolvedOpening | null {
  const { a, b } = o.anchor;
  const ab: Edge = { p: a, q: b };
  if (len(ab) < 10) {
    issues.push({ code: 'B-OP-03', severity: 'H', elementId: o.id, message: 'Açıklık genişliği 10 mm altında.' });
    return null;
  }
  const u = dirOf(ab);
  const left = { x: -u.y, y: u.x };
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const probe = (s: number) => ({ x: mid.x + left.x * s, y: mid.y + left.y * s });

  // Çizim yüzü: bir kısım kenarı (öncelikli) veya kat dış sınırı
  const anchorPart = ctx.parts.find((p) => polyRings(p.polygon).some((r) => ringEdges(r).some((e) => edgeCovers(e, a, b))));
  const anchorOutline = ctx.storey.outline.find((pl) => polyRings(pl).some((r) => ringEdges(r).some((e) => edgeCovers(e, a, b))));
  let side: 1 | -1;
  if (anchorPart) side = pointInPoly(probe(5), anchorPart.polygon) === 1 ? -1 : 1;
  else if (anchorOutline) side = pointInPoly(probe(5), anchorOutline) === 1 ? 1 : -1;
  else {
    issues.push({ code: 'B-OP-04', severity: 'H', elementId: o.id, message: 'Açıklık bir kısım kenarı veya kat dış sınırı üzerinde değil (§5.4).' });
    return null;
  }

  // Karşı yüz: malzeme tarafında, paralel, en yakın, ≤ 1000 mm, [a, b] aralığıyla örtüşen kenar
  const allRings: Ring2[] = [...ctx.parts.flatMap((p) => polyRings(p.polygon)), ...ctx.storey.outline.flatMap(polyRings), ...ctx.sps.flatMap((s) => polyRings(s.outline))];
  const W = len(ab);
  const n = { x: left.x * side, y: left.y * side };
  // Uzaklık, karşı kenarın kendi doğrusuna dik ölçülür (eğik binada kenar ucundan ölçmek açı farkıyla büyür).
  const stepTo = (e: Edge, s: { x: number; y: number }): number => {
    const v = dirOf(e);
    const nv = { x: -v.y, y: v.x };
    return ((e.p.x - s.x) * nv.x + (e.p.y - s.y) * nv.y) / (nv.x * n.x + nv.y * n.y);
  };
  let best: { off: number; e: Edge } | null = null;
  for (const r of allRings) {
    for (const e of ringEdges(r)) {
      if (len(e) < 1) continue;
      const v = dirOf(e);
      if (Math.abs(u.x * v.y - u.y * v.x) > PARALLEL_SIN) continue;
      const off = stepTo(e, mid);
      if (off <= MIN_WALL || off > MAX_WALL) continue;
      const t1 = (e.p.x - a.x) * u.x + (e.p.y - a.y) * u.y;
      const t2 = (e.q.x - a.x) * u.x + (e.q.y - a.y) * u.y;
      if (Math.min(t1, t2) > W - TOL || Math.max(t1, t2) < TOL) continue;
      if (best === null || off < best.off) best = { off, e };
    }
  }
  if (best === null) {
    issues.push({ code: 'B-OP-05', severity: 'H', elementId: o.id, message: 'Açıklığın karşı yüzü bulunamadı (1000 mm içinde paralel duvar yüzü yok, §5.4 madde 1).' });
    return null;
  }
  const t = best.off;
  const sa = stepTo(best.e, a);
  const sb = stepTo(best.e, b);
  const a1 = rnd({ x: a.x + n.x * sa, y: a.y + n.y * sa });
  const b1 = rnd({ x: b.x + n.x * sb, y: b.y + n.y * sb });
  const rect0: Pt2[] = [a, b, b1, a1];
  const rect = signedArea2x(rect0) < 0 ? reversed(rect0) : rect0;

  // Yüzlerdeki kısımlar (T4) ve dış cephe (T1/T2)
  const lines: [[Pt2, Pt2], [Pt2, Pt2]] = [
    [a, b],
    [a1, b1],
  ];
  const partFaces: { partId: string; line: 0 | 1 }[] = [];
  let extLine: 0 | 1 | null = null;
  for (const k of [0, 1] as const) {
    const [la, lb] = lines[k];
    for (const p of ctx.parts) if (polyRings(p.polygon).some((r) => ringEdges(r).some((e) => edgeCovers(e, la, lb)))) partFaces.push({ partId: p.id, line: k });
    if (extLine === null && ctx.storey.outline.some((pl) => polyRings(pl).some((r) => ringEdges(r).some((e) => edgeCovers(e, la, lb))))) extLine = k;
  }
  // T3: kesit merkezi bir BB parçasının içinde ve kısımlarının dışında
  const c = { x: mid.x + (n.x * t) / 2, y: mid.y + (n.y * t) / 2 };
  const sp = ctx.sps.find((s) => pointInPoly(c, s.outline) === 1 && !ctx.parts.some((p) => p.sectionPartIds.includes(s.id) && pointInPoly(c, p.polygon) === 1));

  // Z aralığı (§5.4 madde 3): taban = oda tabanı + sill
  const base = anchorPart ? partFloorZ(anchorPart, ctx.lv) : ctx.lv.zFloorTop;
  const zb = base + o.sill;
  const zt = zb + o.height;
  if (zt > ctx.lv.zCeiling - 1) issues.push({ code: 'B-OP-06', severity: 'H', elementId: o.id, message: `Açıklık tepesi (${zt} mm) tavanı kesiyor; en çok zCeiling − 1 mm (${ctx.lv.zCeiling - 1}) olmalı (§5.4 madde 3).` });
  if (partFaces.length === 0 && extLine === null) issues.push({ code: 'B-OP-07', severity: 'U', elementId: o.id, message: 'Açıklık hiçbir kısım yüzüne veya dış cepheye bağlanmadı.' });
  return { opening: o, lines, rect, zb, zt, partFaces, extLine, sectionPartId: sp?.id ?? null };
}

/** Açıklıkların çözümlemesi (tanılama ve arayüz için): duvar dilimi, temsiller, uyarılar. */
export function resolveOpenings(building: DesignBuilding): { resolved: ResolvedOpening[]; issues: BrepIssue[] } {
  const issues: BrepIssue[] = [];
  const resolved: ResolvedOpening[] = [];
  for (const o of building.openings ?? []) {
    const storey = building.storeys.find((s) => s.id === o.storeyId);
    if (!storey) continue;
    const ctx: StoreyCtx = { storey, lv: storeyLevels(storey), parts: building.parts.filter((p) => p.storeyId === storey.id), sps: building.sectionParts.filter((x) => x.storeyId === storey.id) };
    const r = resolveOpening(o, ctx, issues);
    if (r) resolved.push(r);
  }
  return { resolved, issues };
}
export type { ResolvedOpening };

// ---------------------------------------------------------------------------------------------
// Üretici

export function generateBrep(project: DesignProject, building: DesignBuilding = project.buildings[0], options: BrepOptions = DEFAULT_BREP_OPTIONS): BrepBuilding {
  const issues: BrepIssue[] = [];
  const seed = `${project.id}:${building.id}`;
  const gid = (prefix: string, path: string) => `${prefix}${uuidv5(`${seed}::${prefix}::${path}`)}`;
  const levels = building.storeys.map(storeyLevels);
  const lvOf = new Map(levels.map((l) => [l.storeyId, l]));
  const ctxOf = new Map<string, StoreyCtx>();
  for (const s of building.storeys) {
    ctxOf.set(s.id, { storey: s, lv: lvOf.get(s.id)!, parts: building.parts.filter((p) => p.storeyId === s.id), sps: building.sectionParts.filter((x) => x.storeyId === s.id) });
    const lv = lvOf.get(s.id)!;
    if (s.slabThickness <= 0) issues.push({ code: 'B-KOT-01', severity: 'H', elementId: s.id, message: `Kat_${s.storeyNumber}: döşeme kalınlığı > 0 olmalı (§5.6).` });
    if (lv.zCeiling - lv.zFloorTop < 1500) issues.push({ code: 'B-KOT-02', severity: 'H', elementId: s.id, message: `Kat_${s.storeyNumber}: oda yüksekliği ${lv.zCeiling - lv.zFloorTop} mm < 1500 (§5.2).` });
  }

  // Açıklıkları çöz
  const resolved: ResolvedOpening[] = [];
  for (const o of building.openings ?? []) {
    const ctx = ctxOf.get(o.storeyId);
    if (!ctx) {
      issues.push({ code: 'B-OP-08', severity: 'H', elementId: o.id, message: 'Açıklığın katı bulunamadı.' });
      continue;
    }
    const r = resolveOpening(o, ctx, issues);
    if (r) resolved.push(r);
  }
  const openingPrefix = (o: Opening): 'KAPI_' | 'PEN_' => (o.kind === 'door' ? 'KAPI_' : 'PEN_');
  const polyKindOf = (o: Opening): BrepPolygonKind => (o.kind === 'door' ? 'Door_' : 'Window_');

  // T-kavşak noktaları: kattaki tüm halka köşeleri (§5.1 madde 3)
  const splitPtsOf = (ctx: StoreyCtx): Pt2[] => [...ctx.parts.flatMap((p) => polyRings(p.polygon).flat()), ...ctx.sps.flatMap((s) => polyRings(s.outline).flat()), ...ctx.storey.outline.flatMap((pl) => polyRings(pl).flat())];

  // --- Kısım (oda) kabukları (§5.5)
  const rooms: BrepObject[] = [];
  for (const part of building.parts) {
    const ctx = ctxOf.get(part.storeyId);
    if (!ctx) {
      issues.push({ code: 'B-ODA-01', severity: 'H', elementId: part.id, message: 'Kısmın katı bulunamadı.' });
      continue;
    }
    const prefix = part.kind === 'BBK' ? 'BBK_' : 'OA_';
    const z0 = partFloorZ(part, ctx.lv);
    const z1 = ctx.lv.zCeiling;
    if (z1 - z0 < 1500) issues.push({ code: 'B-ODA-02', severity: 'H', elementId: part.id, message: `Oda yüksekliği ${z1 - z0} mm < 1500 (§5.5 madde 6).` });
    const path = `oda:${part.id}`;
    const surfaces: BrepSurface[] = [];
    surfaces.push({ id: gid('Floor_', `${path}:yuzey:taban`), tag: 'FloorSurface', polygons: [horizontal(part.polygon, z0, false, 'Floor_', gid('Floor_', `${path}:taban`))], openings: [] });
    const splitPts = splitPtsOf(ctx);
    const extEdges = ctx.storey.outline.flatMap((pl) => polyRings(pl).flatMap(ringEdges));
    polyRings(part.polygon).forEach((ring, ri) => {
      ringEdges(ring).forEach((e, ei) => {
        // OA'nın dış cephe kenarı Wall_ (KESİNLEŞTİ v3.1, §5.5 madde 4); kalınlıklı W_OA üretimi M6'ya bırakıldı.
        const isExtOa = part.kind === 'OA' && extEdges.some((x) => edgeCovers(x, e.p, e.q));
        const tag: BrepSurfaceTag = isExtOa ? 'WallSurface' : 'InteriorWallSurface';
        const kind: BrepPolygonKind = isExtOa ? 'Wall_' : 'InteriorWall_';
        const reps = resolved.flatMap((r) =>
          r.partFaces
            .filter((f) => f.partId === part.id && edgeCovers(e, r.lines[f.line][0], r.lines[f.line][1]))
            .map((f) => ({ r, line: f.line })),
        );
        const holes: FaceHole[] = reps.map(({ r, line }) => ({ key: `${r.opening.id}:${line}`, a: r.lines[line][0], b: r.lines[line][1], zb: r.zb, zt: r.zt }));
        const wf = wallFaces(e, z0, z1, splitPts, holes, kind, (role) => gid(kind, `${path}:duvar:${ri}:${ei}:${role}`), issues, part.id);
        const openings: BrepOpening[] = reps.flatMap(({ r, line }) => {
          const ring = wf.holeRings.get(`${r.opening.id}:${line}`);
          if (!ring) return [];
          const p = openingPrefix(r.opening);
          const opPath = `acik:${r.opening.id}:T4:${part.id}`;
          return [{ id: gid(p, opPath), prefix: p, usage: r.opening.usage, designOpeningId: r.opening.id, representation: 'T4' as const, polygon: { id: gid(polyKindOf(r.opening), opPath), kind: polyKindOf(r.opening), outer: ring, holes: [] } }];
        });
        surfaces.push({ id: gid(kind, `${path}:yuzey:${ri}:${ei}`), tag, polygons: wf.polygons, openings });
      });
    });
    surfaces.push({ id: gid('Ceiling_', `${path}:yuzey:tavan`), tag: 'CeilingSurface', polygons: [horizontal(part.polygon, z1, true, 'Ceiling_', gid('Ceiling_', `${path}:tavan`))], openings: [] });
    const area = polyAreaM2(part.polygon);
    rooms.push({
      id: gid(prefix, path),
      prefix,
      designId: part.id,
      storeyId: part.storeyId,
      surfaces,
      attributes: { calculatedArea: round2(area), volume: round2((area * (z1 - z0)) / 1000) },
    });
  }

  // --- BB parçası küvetleri (§5.6)
  const sectionParts: BrepObject[] = [];
  for (const sp of building.sectionParts) {
    const ctx = ctxOf.get(sp.storeyId);
    if (!ctx) {
      issues.push({ code: 'B-BB-01', severity: 'H', elementId: sp.id, message: 'BB parçasının katı bulunamadı.' });
      continue;
    }
    const zFB = sp.zFloorOverride ?? ctx.lv.zFloorBottom;
    const zFT = zFB + ctx.storey.slabThickness;
    const zC = ctx.lv.zCeiling;
    if (zC - zFT < 1500) issues.push({ code: 'B-BB-02', severity: 'U', elementId: sp.id, message: `BB parçası iç yüksekliği ${zC - zFT} mm (çatı arası/asma kat düzeni M6'da).` });
    const path = `bb:${sp.id}`;
    const pid = (kind: BrepPolygonKind, role: string) => gid(kind, `${path}:${role}`);
    const floorPolys: BrepPolygon[] = [horizontal(sp.outline, zFB, false, 'Floor_', pid('Floor_', 'alt')), horizontal(sp.outline, zFT, true, 'Floor_', pid('Floor_', 'ust'))];
    const splitPts = splitPtsOf(ctx);
    if (options.emitSlabEdges) {
      polyRings(sp.outline).forEach((r, ri) => ringEdges(r).forEach((e, ei) => floorPolys.push(...wallFaces(e, zFB, zFT, splitPts, [], 'Floor_', (role) => pid('Floor_', `kenar:${ri}:${ei}:${role}`), issues, sp.id).polygons)));
    }
    // Duvar malzemesi W = outline − ⋃ kısımlar (§5.3 madde 3). Kısımlar BB içinde ayrık delikler varsayılır;
    // kısım BB sınırına veya başka kısma değiyorsa W'nin genel Boolean farkı gerekir (Clipper2, M6).
    const myParts = ctx.parts.filter((p) => p.kind === 'BBK' && !p.remote && p.sectionPartIds.includes(sp.id));
    const wHoles: Ring2[] = [...sp.outline.holes, ...myParts.map((p) => reversed(p.polygon.outer))];
    for (const p of myParts) {
      const touches = ringEdges(p.polygon.outer).some((e) => polyRings(sp.outline).some((r) => r.some((v) => projOn(e, v).d <= TOL && projOn(e, v).t >= -TOL && projOn(e, v).t <= len(e) + TOL)));
      if (touches) issues.push({ code: 'B-BB-03', severity: 'U', elementId: p.id, message: 'Kısım BB sınırına değiyor; duvar malzemesi bölgesi (W) basit delik varsayımıyla üretildi, Boolean fark M6 (Clipper2).' });
      if (p.polygon.holes.length) issues.push({ code: 'B-BB-04', severity: 'B', elementId: p.id, message: 'Delikli kısım: iç kısım çevresindeki duvar W içinde ayrıca üretilmedi (M6).' });
    }
    const wallPolys: BrepPolygon[] = [];
    const myResolved = resolved.filter((r) => r.sectionPartId === sp.id);
    const wRings: { ring: Ring2; outer: boolean }[] = [{ ring: sp.outline.outer, outer: true }, ...wHoles.map((ring) => ({ ring, outer: false }))];
    wRings.forEach(({ ring, outer }, ri) => {
      ringEdges(ring).forEach((e, ei) => {
        const holes: FaceHole[] = [];
        for (const r of myResolved)
          for (const k of [0, 1] as const) if (edgeCovers(e, r.lines[k][0], r.lines[k][1])) holes.push({ key: `${r.opening.id}:${k}`, a: r.lines[k][0], b: r.lines[k][1], zb: r.zb, zt: r.zt });
        const zLow = outer && !options.emitSlabEdges ? zFB : zFT;
        wallPolys.push(...wallFaces(e, zLow, zC, splitPts, holes, 'Wall_', (role) => pid('Wall_', `yan:${ri}:${ei}:${role}`), issues, sp.id).polygons);
      });
    });
    // Üst kapak: W @ zCeiling, normal yukarı
    wallPolys.push({ id: pid('Wall_', 'kapak'), kind: 'Wall_', outer: sp.outline.outer.map((p) => at(p, zC)), holes: wHoles.map((h) => h.map((p) => at(p, zC))) });
    // Açıklık yan yüzleri (alt = denizlik/eşik, üst = lento, 2 söve), hepsi Wall_
    for (const r of myResolved) {
      const R = r.rect; // CCW: boşluk solda
      wallPolys.push({ id: pid('Wall_', `acik:${r.opening.id}:alt`), kind: 'Wall_', outer: R.map((p) => at(p, r.zb)), holes: [] });
      wallPolys.push({ id: pid('Wall_', `acik:${r.opening.id}:ust`), kind: 'Wall_', outer: reversed(R).map((p) => at(p, r.zt)), holes: [] });
      ringEdges(R).forEach((e, i) => {
        const onFace = [0, 1].some((k) => edgeCovers(e, r.lines[k][0], r.lines[k][1]) && edgeCovers({ p: r.lines[k][0], q: r.lines[k][1] }, e.p, e.q));
        if (onFace) return;
        // Söve: normal boşluğa (sola) bakmalı → ters kenar
        wallPolys.push({ id: pid('Wall_', `acik:${r.opening.id}:sove:${i}`), kind: 'Wall_', outer: [at(e.q, r.zb), at(e.p, r.zb), at(e.p, r.zt), at(e.q, r.zt)], holes: [] });
      });
    }
    sectionParts.push({
      id: gid('BB_', path),
      prefix: 'BB_',
      designId: sp.id,
      storeyId: sp.storeyId,
      surfaces: [
        { id: gid('Floor_', `${path}:yuzey:taban`), tag: 'FloorSurface', polygons: floorPolys, openings: [] },
        { id: gid('Wall_', `${path}:yuzey:duvar`), tag: 'WallSurface', polygons: wallPolys, openings: [] },
      ],
      attributes: { independentSectionCalculatedArea: round2(polyAreaM2(sp.outline)) },
    });
  }

  // --- Kat kabukları (§5.7; Biçim A = Ornek6)
  const storeys: BrepObject[] = [];
  const lod2Openings: BrepOpening[] = [];
  for (const s of building.storeys) {
    const ctx = ctxOf.get(s.id)!;
    const { zFloorBottom: zFB, zFloorTop: zFT, zCeiling: zC } = ctx.lv;
    const path = `kat:${s.id}`;
    const pid = (kind: BrepPolygonKind, role: string) => gid(kind, `${path}:${role}`);
    const floorPolys: BrepPolygon[] = [];
    const wallPolys: BrepPolygon[] = [];
    const splitPts = splitPtsOf(ctx);
    const extResolved = resolved.filter((r) => r.opening.storeyId === s.id && r.extLine !== null);
    s.outline.forEach((pl, pi) => {
      floorPolys.push(horizontal(pl, zFB, false, 'Floor_', pid('Floor_', `alt:${pi}`)));
      if (options.storeyStyle === 'B') {
        floorPolys.push(horizontal(pl, zFT, true, 'Floor_', pid('Floor_', `ust:${pi}`)));
        if (options.emitSlabEdges) polyRings(pl).forEach((r, ri) => ringEdges(r).forEach((e, ei) => floorPolys.push(...wallFaces(e, zFB, zFT, splitPts, [], 'Floor_', (role) => pid('Floor_', `kenar:${pi}:${ri}:${ei}:${role}`), issues, s.id).polygons)));
      }
      polyRings(pl).forEach((r, ri) =>
        ringEdges(r).forEach((e, ei) => {
          const holes: FaceHole[] = [];
          for (const x of extResolved) {
            const k = x.extLine!;
            if (edgeCovers(e, x.lines[k][0], x.lines[k][1])) holes.push({ key: `${x.opening.id}:T2`, a: x.lines[k][0], b: x.lines[k][1], zb: x.zb, zt: x.zt });
          }
          const zLow = options.storeyStyle === 'A' || !options.emitSlabEdges ? zFB : zFT;
          wallPolys.push(...wallFaces(e, zLow, zC, splitPts, holes, 'Wall_', (role) => pid('Wall_', `duvar:${pi}:${ri}:${ei}:${role}`), issues, s.id).polygons);
          // T1: LoD2 dış yüz açıklığı. Kapı tabanı zFloorTop (Ornek6 ölçümü: LoD2 duvarı daha aşağıdan başlar), pencere oda kotuyla aynı.
          for (const x of extResolved) {
            const k = x.extLine!;
            if (!edgeCovers(e, x.lines[k][0], x.lines[k][1])) continue;
            const ta = projOn(e, x.lines[k][0]).t;
            const tb = projOn(e, x.lines[k][1]).t;
            const [A, B] = ta <= tb ? [x.lines[k][0], x.lines[k][1]] : [x.lines[k][1], x.lines[k][0]];
            const zb = x.opening.kind === 'door' ? zFT : x.zb;
            const p = openingPrefix(x.opening);
            const opPath = `acik:${x.opening.id}:T1`;
            lod2Openings.push({ id: gid(p, opPath), prefix: p, usage: x.opening.usage, designOpeningId: x.opening.id, representation: 'T1', polygon: { id: gid(polyKindOf(x.opening), opPath), kind: polyKindOf(x.opening), outer: [at(A, zb), at(A, x.zt), at(B, x.zt), at(B, zb)], holes: [] } });
          }
        }),
      );
    });
    storeys.push({
      id: gid('K_', path),
      prefix: 'K_',
      designId: s.id,
      storeyId: s.id,
      surfaces: [
        { id: gid('Floor_', `${path}:yuzey:taban`), tag: 'FloorSurface', polygons: floorPolys, openings: [] },
        { id: gid('Wall_', `${path}:yuzey:duvar`), tag: 'WallSurface', polygons: wallPolys, openings: [] },
      ],
      attributes: {},
    });
  }

  // Her pencerenin BB'de deliği var (§5.6 madde 4)
  for (const r of resolved) {
    if (r.opening.kind === 'window' && r.sectionPartId === null && r.partFaces.some((f) => building.parts.find((p) => p.id === f.partId)?.kind === 'BBK'))
      issues.push({ code: 'B-OP-09', severity: 'U', elementId: r.opening.id, message: 'Pencerenin kesiti bir BB parçasının duvar malzemesi (W) içinde değil; BB küvetinde deliği yok.' });
  }

  return { designBuildingId: building.id, levels, storeys, sectionParts, rooms, lod2Openings, issues };
}
