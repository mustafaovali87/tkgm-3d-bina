// M5 — Kabuk denetimleri: kapalılık (§5.5 madde 6) ve diverjans hacmi (§5.12).
import type { BrepObject, BrepPolygon, Pt3 } from './types.ts';

const key = (p: Pt3) => `${p.x},${p.y},${p.z}`;

/** Halka kenarlarını, üzerlerine düşen diğer köşelerde böler (T-kavşak; ≤ 0.5 mm). */
function splitEdges(rings: readonly (readonly Pt3[])[]): [Pt3, Pt3][] {
  const verts = new Map<string, Pt3>();
  for (const r of rings) for (const p of r) verts.set(key(p), p);
  const all = [...verts.values()];
  const out: [Pt3, Pt3][] = [];
  for (const r of rings) {
    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[(i + 1) % r.length];
      const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
      const L2 = d.x * d.x + d.y * d.y + d.z * d.z;
      if (L2 === 0) continue;
      const cuts: { t: number; p: Pt3 }[] = [];
      for (const v of all) {
        const w = { x: v.x - a.x, y: v.y - a.y, z: v.z - a.z };
        const t = (w.x * d.x + w.y * d.y + w.z * d.z) / L2;
        if (t <= 1e-9 || t >= 1 - 1e-9) continue;
        const cx = w.y * d.z - w.z * d.y;
        const cy = w.z * d.x - w.x * d.z;
        const cz = w.x * d.y - w.y * d.x;
        if ((cx * cx + cy * cy + cz * cz) / L2 <= 0.25) cuts.push({ t, p: v });
      }
      cuts.sort((m, n) => m.t - n.t);
      let prev = a;
      for (const c of cuts) {
        out.push([prev, c.p]);
        prev = c.p;
      }
      out.push([prev, b]);
    }
  }
  return out;
}

export interface ShellCheck {
  /** Her kenar tam iki kez kullanılıyor (açıklık deliği açıklık poligonuyla kapanmış sayılır). */
  readonly closed: boolean;
  readonly openEdges: number;
  readonly overusedEdges: number;
  /** Açık kenarların kotları (yatay olmayan açık kenar NaN). BB küvetinde yalnız zFloorTop beklenir: alt yüz üretilmez (§5.6). */
  readonly openEdgeZ: readonly number[];
  /** Diverjans hacmi, m³ (delikler kapalı sayılır; dışa yönlü normallerle pozitif). */
  readonly volumeM3: number;
}

/** Newell vektörü (alanın 2 katı × normal). */
function newell(r: readonly Pt3[]): Pt3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < r.length; i++) {
    const a = r[i];
    const b = r[(i + 1) % r.length];
    x += (a.y - b.y) * (a.z + b.z);
    y += (a.z - b.z) * (a.x + b.x);
    z += (a.x - b.x) * (a.y + b.y);
  }
  return { x, y, z };
}

export function polygonsOf(o: BrepObject): BrepPolygon[] {
  return o.surfaces.flatMap((s) => [...s.polygons, ...s.openings.map((x) => x.polygon)]);
}

export function checkShell(o: BrepObject): ShellCheck {
  const polys = polygonsOf(o);
  const rings = polys.flatMap((p) => [p.outer, ...p.holes]);
  const counts = new Map<string, number>();
  for (const [a, b] of splitEdges(rings)) {
    const k = key(a) < key(b) ? `${key(a)}|${key(b)}` : `${key(b)}|${key(a)}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let openEdges = 0;
  let overusedEdges = 0;
  const openEdgeZ = new Set<number>();
  for (const [k, c] of counts) {
    if (c < 2) {
      openEdges++;
      const [p, q] = k.split('|').map((s) => Number(s.split(',')[2]));
      openEdgeZ.add(p === q ? p : Number.NaN);
    } else if (c > 2) overusedEdges++;
  }
  // Hacim: açıklık poligonları hariç, duvarların açıklık delikleri yok sayılır (delik kapalı ⇒ dış halka yeterli),
  // ancak iç kısım (K71) gibi yapısal delikler (holeKinds tanımsız olanlar) hesaba katılır.
  // Kesinlik için yerel kökene taşınır (z mutlak ~1e6 mm; çarpımlar 2^53'ü aşmasın).
  const solid = o.surfaces.flatMap((s) => s.polygons);
  const c = solid[0]?.outer[0] ?? { x: 0, y: 0, z: 0 };
  let v6 = 0;
  for (const p of solid) {
    const structHoles = p.holes.filter((_, hi) => !p.holeKinds?.[hi]);
    for (const ring of [p.outer, ...structHoles]) {
      if (ring.length < 3) continue;
      const r = ring.map((q) => ({ x: q.x - c.x, y: q.y - c.y, z: q.z - c.z }));
      const n = newell(r);
      v6 += n.x * r[0].x + n.y * r[0].y + n.z * r[0].z;
    }
  }
  return { closed: openEdges === 0 && overusedEdges === 0, openEdges, overusedEdges, openEdgeZ: [...openEdgeZ].sort((a, b) => a - b), volumeM3: v6 / 6 / 1e9 };
}
