// M4 / M8 — Çizim anında 2B tasarım denetimleri (şartname §5.3 madde 2, §7.5). Her bulgu ilgili dosya kuralına bağlanır.
import { isSimpleRing, minEdgeMm, polyAreaM2, polyIntersectionAreaM2, ringInsidePoly, ringPerimeterM } from './geometry2d.ts';
import type { DesignProject, Poly2 } from './types.ts';

/** §5.3 toleransları. */
const OVERLAP_TOL_M2 = 0.1; // kesişim alanı ≤ 0.1 m²
const GAP_TOL_M = 0.001; // boşluk ≤ 1 mm

/** inner çokgeninin kapsayıcı çokgenlerin (birleşimi) dışında kalan alanı, m². Kapsayıcılar birbiriyle örtüşmemeli; delikler hesaba katılır. */
function outsideAreaM2(inner: Poly2, containers: readonly Poly2[]): number {
  let inside = 0;
  for (const c of containers) inside += polyIntersectionAreaM2(inner, c);
  return Math.max(0, polyAreaM2(inner) - inside);
}

export interface DesignIssue {
  readonly code: string; // T-xx
  readonly fileRule: string; // karşılık gelen dosya kuralı (V-xxx)
  readonly severity: 'H' | 'U' | 'B';
  readonly elementId: string;
  readonly message: string;
}

export interface ElementMetrics {
  readonly id: string;
  readonly areaM2: number;
  readonly planArea: number; // -1: yok
  readonly deviationPct: number | null; // |hesap − plan| / plan × 100
}

export function designMetrics(project: DesignProject): Map<string, ElementMetrics> {
  const out = new Map<string, ElementMetrics>();
  const b = project.buildings[0];
  if (!b) return out;
  for (const p of b.parts) {
    const area = polyAreaM2(p.polygon);
    out.set(p.id, { id: p.id, areaM2: area, planArea: p.planArea, deviationPct: p.planArea > 0 ? (Math.abs(area - p.planArea) / p.planArea) * 100 : null });
  }
  for (const sp of b.sectionParts) {
    const sec = b.sections.find((s) => s.id === sp.sectionId);
    const area = polyAreaM2(sp.outline);
    const plan = sec?.planGrossArea ?? -1;
    out.set(sp.id, { id: sp.id, areaM2: area, planArea: plan, deviationPct: plan > 0 ? (Math.abs(area - plan) / plan) * 100 : null });
  }
  return out;
}

export function checkDesign(project: DesignProject): DesignIssue[] {
  const issues: DesignIssue[] = [];
  const b = project.buildings[0];
  if (!b) return issues;
  const add = (i: DesignIssue) => issues.push(i);

  const allRings: Array<{ id: string; ring: readonly { x: number; y: number }[] }> = [
    ...b.storeys.flatMap((s) => s.outline.map((o, i) => ({ id: `${s.id}#outline#${i}`, ring: o.outer }))),
    ...b.sectionParts.map((x) => ({ id: x.id, ring: x.outline.outer })),
    ...b.parts.map((x) => ({ id: x.id, ring: x.polygon.outer })),
    ...(b.installations ?? []).map((x) => ({ id: x.id, ring: x.polygon.outer })),
  ];
  for (const r of allRings) {
    if (!isSimpleRing(r.ring)) add({ code: 'T-01', fileRule: 'V-034', severity: 'H', elementId: r.id, message: 'Çokgen kendini kesiyor veya ardışık eş nokta var.' });
    else if (minEdgeMm(r.ring) < 10) add({ code: 'T-02', fileRule: 'V-038', severity: 'U', elementId: r.id, message: `Kenar ${minEdgeMm(r.ring).toFixed(0)} mm (< 10 mm).` });
  }

  for (const sp of b.sectionParts) {
    if (!b.sections.some((s) => s.id === sp.sectionId)) add({ code: 'T-08', fileRule: 'V-061', severity: 'H', elementId: sp.id, message: 'BB parçası listedeki bir bağımsız bölüme bağlı değil.' });
    const st = b.storeys.find((s) => s.id === sp.storeyId);
    if (st && st.outline.length > 0) {
      const out = outsideAreaM2(sp.outline, st.outline);
      const tol = ringPerimeterM(sp.outline.outer) * GAP_TOL_M;
      // Çatı arası (usage 1004): eğik çatı kesimi nedeniyle gevşek (şartname §5.9, V-162 notu) → UYARI
      const attic = sp.usage === 1004;
      if (out > tol) add({ code: 'T-03', fileRule: 'V-125', severity: attic ? 'U' : 'H', elementId: sp.id, message: `BB parçasının ${out.toFixed(2)} m²'si kat dış sınırının dışında (tolerans ${tol.toFixed(3)} m² = çevre × 1 mm).` });
    }
  }
  for (const p of b.parts) {
    if (p.kind === 'BBK') {
      const hosts = b.sectionParts.filter((sp) => p.sectionPartIds.includes(sp.id));
      if (hosts.length === 0) add({ code: 'T-08', fileRule: 'V-160', severity: 'H', elementId: p.id, message: 'Kısım bir BB parçasına bağlı değil.' });
      else if (!p.remote) {
        // Uzak kısım (§4.2 remote) hariç; çatı arası BB'sinde (usage 1004) gevşek → UYARI (§5.9, V-162 notu)
        const attic = hosts.some((h) => h.usage === 1004);
        const out = outsideAreaM2(p.polygon, hosts.map((h) => h.outline));
        if (out > OVERLAP_TOL_M2) add({ code: 'T-04', fileRule: 'V-162', severity: attic ? 'U' : 'H', elementId: p.id, message: `Kısmın ${out.toFixed(2)} m²'si bağlı olduğu BB parçasının dışında (tolerans 0.1 m²).` });
      }
    }
    if (p.planArea > 0) {
      const area = polyAreaM2(p.polygon);
      const dev = (Math.abs(area - p.planArea) / p.planArea) * 100;
      if (dev > 10) add({ code: 'T-07', fileRule: 'V-157', severity: 'U', elementId: p.id, message: `Çizim alanı ${area.toFixed(2)} m², plan alanı ${p.planArea} m² (sapma %${dev.toFixed(1)} > %10).` });
    }
  }

  for (const iy of b.installations ?? []) {
    const host = b.parts.find((p) => p.id === iy.partId);
    if (!host) add({ code: 'T-08', fileRule: 'V-151', severity: 'H', elementId: iy.id, message: 'İç yapı geçerli bir odaya (BBK/OA) bağlı değil.' });
    else {
      const out = outsideAreaM2(iy.polygon, [host.polygon]);
      if (out > OVERLAP_TOL_M2) add({ code: 'T-04', fileRule: 'V-151', severity: 'U', elementId: iy.id, message: `İç yapının ${out.toFixed(2)} m²'si bağlı olduğu odanın dışında.` });
    }
  }

  // Aynı kattaki BB parçaları ve OA'lar birbiriyle; kısımlar birbiriyle örtüşmez (§5.3). Delik ilişkisi (iç kısım, K71) hariç.
  for (const st of b.storeys) {
    // Yalnız aynı taban kotundakiler karşılaştırılır (asma kat: zFloorOverride, şartname §5.2)
    const regions = [
      ...b.sectionParts.filter((x) => x.storeyId === st.id).map((x) => ({ id: x.id, poly: x.outline, z: x.zFloorOverride ?? null })),
      ...b.parts.filter((x) => x.storeyId === st.id && x.kind === 'OA').map((x) => ({ id: x.id, poly: x.polygon, z: x.zFloorOverride ?? null })),
    ];
    for (let i = 0; i < regions.length; i++) for (let j = i + 1; j < regions.length; j++) {
      if (regions[i].z !== regions[j].z) continue;
      const ov = polyIntersectionAreaM2(regions[i].poly, regions[j].poly);
      if (ov > OVERLAP_TOL_M2) add({ code: 'T-05', fileRule: 'V-100', severity: 'H', elementId: regions[j].id, message: `BB parçası / ortak alan başka bir bölge ile ${ov.toFixed(2)} m² örtüşüyor (tolerans 0.1 m²).` });
    }
    const parts = b.parts.filter((x) => x.storeyId === st.id && x.kind === 'BBK');
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i];
      const c = parts[j];
      if ((a.zFloorOverride ?? null) !== (c.zFloorOverride ?? null)) continue;
      const isHole = (outer: typeof a, inner: typeof c) => outer.polygon.holes.some((h) => h.length === inner.polygon.outer.length && h.every((p) => inner.polygon.outer.some((q) => q.x === p.x && q.y === p.y)));
      if (isHole(a, c) || isHole(c, a) || ringInsidePoly(a.polygon.outer, c.polygon) || ringInsidePoly(c.polygon.outer, a.polygon)) continue;
      const ov = polyIntersectionAreaM2(a.polygon, c.polygon);
      if (ov > OVERLAP_TOL_M2) add({ code: 'T-06', fileRule: 'V-162', severity: 'H', elementId: c.id, message: `Kısım başka bir kısımla ${ov.toFixed(2)} m² örtüşüyor (tolerans 0.1 m²).` });
    }
  }
  return issues;
}
