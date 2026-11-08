// M4 — 2B tasarım editörünün saf durum makinesi (şartname §7.4). Arayüz yalnız bu reducer'ı çağırır.
// DOM yok; tüm koordinatlar mm tamsayı. Snap, arayüzde snapPoint ile yapılıp tıklamaya hazır nokta olarak gelir.
import { uuidv5 } from '../hash/canonical.ts';
import { isSimpleRing, normalizeOrientation, pointInPoly, polyAreaM2, ringCentroid, ringInsidePoly } from './geometry2d.ts';
import type { DesignBuilding, DesignProject, IndependentSection, Part, Poly2, Pt2, SectionPart, Storey } from './types.ts';

export type EditorTool = 'sec' | 'kat' | 'bb' | 'kisim' | 'oa' | 'olcu';

export interface EditorOptions {
  /** BB çizerken bağlanacak bağımsız bölüm (liste beyandan). */
  readonly sectionId: string | null;
  /** Kısım çizerken partUsage (varsayılan 1001 Oda). */
  readonly partUsage: number;
  /** Ortak alan çizerken commonAreaUsage (varsayılan: Niteliksiz Ortak Alan). */
  readonly oaUsage: number;
  /** BB parçası kullanımı (1001 normal). */
  readonly sectionPartUsage: SectionPart['usage'];
}

export interface EditorState {
  readonly project: DesignProject;
  readonly activeStoreyId: string | null;
  readonly tool: EditorTool;
  readonly draft: readonly Pt2[];
  readonly selectedId: string | null;
  readonly options: EditorOptions;
  readonly undo: readonly DesignProject[];
  readonly redo: readonly DesignProject[];
  readonly message: { readonly kind: 'ok' | 'error' | 'info'; readonly text: string } | null;
}

export type EditorAction =
  | { readonly type: 'tool'; readonly tool: EditorTool }
  | { readonly type: 'click'; readonly p: Pt2 }
  | { readonly type: 'finish' }
  | { readonly type: 'cancel' }
  | { readonly type: 'select'; readonly id: string | null }
  | { readonly type: 'delete' }
  | { readonly type: 'undo' }
  | { readonly type: 'redo' }
  | { readonly type: 'setStorey'; readonly id: string }
  | { readonly type: 'options'; readonly patch: Partial<EditorOptions> }
  | { readonly type: 'addSection'; readonly section: Omit<IndependentSection, 'id'> }
  | { readonly type: 'addStorey'; readonly storey: Omit<Storey, 'id' | 'outline'> }
  | { readonly type: 'updatePart'; readonly id: string; readonly patch: Partial<Pick<Part, 'usage' | 'planArea'>> }
  | { readonly type: 'updateSectionPart'; readonly id: string; readonly patch: Partial<Pick<SectionPart, 'usage' | 'sectionId'>> }
  | { readonly type: 'load'; readonly project: DesignProject };

/** partUsage.xml: 1001 = Oda, 1022 = Niteliksiz Ortak Alan (resources/codelists/partUsage.xml). */
export const DEFAULT_OPTIONS: EditorOptions = { sectionId: null, partUsage: 1001, oaUsage: 1022, sectionPartUsage: 1001 };

export function createEditorState(project: DesignProject): EditorState {
  return {
    project,
    activeStoreyId: project.buildings[0]?.storeys[0]?.id ?? null,
    tool: 'sec',
    draft: [],
    selectedId: null,
    options: { ...DEFAULT_OPTIONS, sectionId: project.buildings[0]?.sections[0]?.id ?? null },
    undo: [],
    redo: [],
    message: null,
  };
}

/** Boş proje (sihirbaz öncesi). */
export function createEmptyProject(name: string, seed: string): DesignProject {
  return {
    schemaVersion: 1,
    id: uuidv5(`tasarim:${seed}`),
    name,
    idSeq: 1,
    georef: { epsg: 5254, originE: 0, originN: 0, zeroElevationOrthometric: 0 },
    parcel: { takbisPropertyIdentityNumber: 0, blockNumber: '', parcelNumber: '', takbisNeighbourhoodReference: 0 },
    buildings: [{ id: uuidv5(`tasarim:${seed}:bina`), letter: 'A', storeys: [], sections: [], sectionParts: [], parts: [] }],
  };
}

/** Deterministik yeni kimlik (randomUUID yok). */
function newId(p: DesignProject, kind: string): { id: string; project: DesignProject } {
  return { id: uuidv5(`${p.id}:${kind}:${p.idSeq}`), project: { ...p, idSeq: p.idSeq + 1 } };
}

function withBuilding(p: DesignProject, f: (b: DesignBuilding) => DesignBuilding): DesignProject {
  return { ...p, buildings: p.buildings.map((b, i) => (i === 0 ? f(b) : b)) };
}

function commit(s: EditorState, project: DesignProject, message: EditorState['message']): EditorState {
  return { ...s, project, undo: [...s.undo.slice(-49), s.project], redo: [], draft: [], message };
}

const fmtArea = (m2: number) => `${m2.toFixed(2)} m²`;

/** Taslağı kapatıp aracın türüne göre eleman oluşturur. */
function finishDraft(s: EditorState): EditorState {
  const b = s.project.buildings[0];
  if (!b) return { ...s, message: { kind: 'error', text: 'Projede bina yok.' } };
  const pts = s.draft;
  if (s.tool === 'olcu') {
    let len = 0;
    for (let i = 0; i + 1 < pts.length; i++) len += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    const area = pts.length >= 3 ? polyAreaM2({ outer: pts, holes: [] }) : 0;
    return { ...s, draft: [], message: { kind: 'info', text: `Ölçü: uzunluk ${(len / 1000).toFixed(3)} m${area > 0 ? `, alan ${fmtArea(area)}` : ''}.` } };
  }
  if (pts.length < 3) return { ...s, message: { kind: 'error', text: 'Kapalı çokgen için en az 3 nokta gerekir.' } };
  if (!isSimpleRing(pts)) return { ...s, message: { kind: 'error', text: 'Çokgen kendini kesiyor veya ardışık eş nokta var (V-034). Çizim kabul edilmedi.' } };
  const storeyId = s.activeStoreyId;
  if (!storeyId) return { ...s, message: { kind: 'error', text: 'Önce bir kat seçin veya ekleyin.' } };
  const poly: Poly2 = normalizeOrientation({ outer: pts, holes: [] });
  const area = polyAreaM2(poly);

  if (s.tool === 'kat') {
    const project = withBuilding(s.project, (bb) => ({
      ...bb,
      storeys: bb.storeys.map((st) => (st.id === storeyId ? { ...st, outline: [...st.outline, poly] } : st)),
    }));
    return commit(s, project, { kind: 'ok', text: `Kat dış sınırı eklendi (${fmtArea(area)}).` });
  }

  if (s.tool === 'bb') {
    const sectionId = s.options.sectionId;
    if (!sectionId || !b.sections.some((x) => x.id === sectionId)) {
      return { ...s, message: { kind: 'error', text: 'BB parçası için önce listeden bir bağımsız bölüm seçin.' } };
    }
    const { id, project } = newId(s.project, 'bb');
    const sp: SectionPart = { id, sectionId, storeyId, usage: s.options.sectionPartUsage, outline: poly };
    const no = b.sections.find((x) => x.id === sectionId)?.number ?? '?';
    return commit(s, withBuilding(project, (bb) => ({ ...bb, sectionParts: [...bb.sectionParts, sp] })), { kind: 'ok', text: `BB ${no} parçası eklendi (${fmtArea(area)}).` });
  }

  // Kısım (BBK) veya ortak alan (OA)
  const kind: Part['kind'] = s.tool === 'kisim' ? 'BBK' : 'OA';
  const c = ringCentroid(poly.outer);
  // İç kısım: aynı kattaki bir kısmın tamamen içindeyse dış kısma delik olarak eklenir (§7.4)
  const host = b.parts.find((p) => p.storeyId === storeyId && ringInsidePoly(poly.outer, p.polygon) && pointInPoly(c, p.polygon) === 1);
  let sectionPartIds: string[] = [];
  if (kind === 'BBK') {
    const sp = b.sectionParts.find((x) => x.storeyId === storeyId && pointInPoly(c, x.outline) === 1);
    if (!sp) return { ...s, message: { kind: 'error', text: 'Kısım bir BB parçasının içinde çizilmeli (önce BB parçasını çizin).' } };
    sectionPartIds = [sp.id];
  }
  const { id, project } = newId(s.project, kind === 'BBK' ? 'bbk' : 'oa');
  const part: Part = { id, kind, storeyId, sectionPartIds, usage: kind === 'BBK' ? s.options.partUsage : s.options.oaUsage, polygon: poly, planArea: -1 };
  const next = withBuilding(project, (bb) => ({
    ...bb,
    parts: [
      ...bb.parts.map((p) => (host && p.id === host.id ? { ...p, polygon: normalizeOrientation({ outer: p.polygon.outer, holes: [...p.polygon.holes, poly.outer] }) } : p)),
      part,
    ],
  }));
  return commit(s, next, { kind: 'ok', text: `${kind === 'BBK' ? 'Kısım' : 'Ortak alan'} eklendi (${fmtArea(area)})${host ? '; dış kısma delik açıldı' : ''}.` });
}

/** Seçim: önce kısımlar, sonra BB parçaları, sonra kat sınırı; en küçük alanlı içeren eleman. */
function pick(s: EditorState, p: Pt2): string | null {
  const b = s.project.buildings[0];
  if (!b || !s.activeStoreyId) return null;
  const sid = s.activeStoreyId;
  const cands: Array<{ id: string; area: number }> = [];
  for (const x of b.parts) if (x.storeyId === sid && pointInPoly(p, x.polygon) >= 0) cands.push({ id: x.id, area: polyAreaM2(x.polygon) });
  if (cands.length === 0) for (const x of b.sectionParts) if (x.storeyId === sid && pointInPoly(p, x.outline) >= 0) cands.push({ id: x.id, area: polyAreaM2(x.outline) });
  if (cands.length === 0) {
    const st = b.storeys.find((x) => x.id === sid);
    st?.outline.forEach((o, i) => {
      if (pointInPoly(p, o) >= 0) cands.push({ id: `${sid}#outline#${i}`, area: polyAreaM2(o) });
    });
  }
  cands.sort((a, c) => a.area - c.area);
  return cands[0]?.id ?? null;
}

export function editorReducer(s: EditorState, a: EditorAction): EditorState {
  switch (a.type) {
    case 'tool':
      return { ...s, tool: a.tool, draft: [], message: null };
    case 'cancel':
      return { ...s, draft: [], message: null };
    case 'select':
      return { ...s, selectedId: a.id };
    case 'setStorey':
      return { ...s, activeStoreyId: a.id, draft: [], selectedId: null };
    case 'options':
      return { ...s, options: { ...s.options, ...a.patch } };
    case 'finish':
      return finishDraft(s);
    case 'click': {
      if (s.tool === 'sec') return { ...s, selectedId: pick(s, a.p) };
      const d = s.draft;
      const last = d[d.length - 1];
      if (last && last.x === a.p.x && last.y === a.p.y) return s;
      if (d.length >= 3 && d[0].x === a.p.x && d[0].y === a.p.y) return finishDraft(s);
      return { ...s, draft: [...d, a.p], message: null };
    }
    case 'undo': {
      const prev = s.undo[s.undo.length - 1];
      if (!prev) return s;
      return { ...s, project: prev, undo: s.undo.slice(0, -1), redo: [...s.redo, s.project], draft: [], message: { kind: 'info', text: 'Geri alındı.' } };
    }
    case 'redo': {
      const nx = s.redo[s.redo.length - 1];
      if (!nx) return s;
      return { ...s, project: nx, redo: s.redo.slice(0, -1), undo: [...s.undo, s.project], draft: [], message: { kind: 'info', text: 'Yinelendi.' } };
    }
    case 'delete': {
      const id = s.selectedId;
      if (!id) return s;
      if (id.includes('#outline#')) {
        const [sid, , idx] = id.split('#');
        const project = withBuilding(s.project, (b) => ({ ...b, storeys: b.storeys.map((st) => (st.id === sid ? { ...st, outline: st.outline.filter((_, i) => i !== Number(idx)) } : st)) }));
        return { ...commit(s, project, { kind: 'ok', text: 'Kat sınırı silindi.' }), selectedId: null };
      }
      const b = s.project.buildings[0];
      const dependants = b?.parts.filter((p) => p.sectionPartIds.includes(id)).length ?? 0;
      if (dependants > 0) return { ...s, message: { kind: 'error', text: `Bu BB parçasına bağlı ${dependants} kısım var; önce onları silin.` } };
      const project = withBuilding(s.project, (bb) => ({ ...bb, parts: bb.parts.filter((p) => p.id !== id), sectionParts: bb.sectionParts.filter((p) => p.id !== id) }));
      return { ...commit(s, project, { kind: 'ok', text: 'Silindi.' }), selectedId: null };
    }
    case 'addSection': {
      const { id, project } = newId(s.project, 'bolum');
      const next = withBuilding(project, (b) => ({ ...b, sections: [...b.sections, { ...a.section, id }] }));
      return { ...commit(s, next, { kind: 'ok', text: `Bağımsız bölüm ${a.section.number} eklendi.` }), options: { ...s.options, sectionId: id } };
    }
    case 'addStorey': {
      const { id, project } = newId(s.project, 'kat');
      const next = withBuilding(project, (b) => ({ ...b, storeys: [...b.storeys, { ...a.storey, id, outline: [] }].sort((x, y) => x.zBottom - y.zBottom) }));
      return { ...commit(s, next, { kind: 'ok', text: `Kat_${a.storey.storeyNumber} eklendi.` }), activeStoreyId: id };
    }
    case 'updatePart': {
      const project = withBuilding(s.project, (b) => ({ ...b, parts: b.parts.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) }));
      return commit(s, project, null);
    }
    case 'updateSectionPart': {
      const project = withBuilding(s.project, (b) => ({ ...b, sectionParts: b.sectionParts.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) }));
      return commit(s, project, null);
    }
    case 'load':
      return { ...createEditorState(a.project), message: { kind: 'ok', text: `"${a.project.name}" yüklendi.` } };
    default:
      return s;
  }
}
