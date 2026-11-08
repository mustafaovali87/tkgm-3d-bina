// M4 — 2B tasarım editörü (şartname §7.4 çizim araçları, §7.5 canlı göstergeler, D-23 2B paneli).
// Tüm mantık src/core/design/editor.ts reducer'ındadır; bu bileşen yalnız çizer ve olayları çevirir.
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CodelistRegistry } from '../core/codelists/index.ts';
import { checkDesign, designMetrics } from '../core/design/checks.ts';
import { createEditorState, createEmptyProject, editorReducer, type EditorTool } from '../core/design/editor.ts';
import { designFromImportedModel } from '../core/design/fromImported.ts';
import { polyAreaM2, ringBounds, ringCentroid } from '../core/design/geometry2d.ts';
import { parseProject, serializeProject } from '../core/design/projectFile.ts';
import { snapPoint, type SnapKind, type SnapResult } from '../core/design/snap.ts';
import type { DesignProject, Poly2, Pt2, Ring2 } from '../core/design/types.ts';
import type { ImportedModel } from '../core/gml/gmlReader.ts';

export interface DesignEditor2DProps {
  readonly model: ImportedModel;
  readonly codelists: CodelistRegistry;
}

const TOOLS: ReadonlyArray<{ id: EditorTool; label: string; key: string; title: string }> = [
  { id: 'sec', label: 'Seç', key: 'V', title: 'Seç (V)' },
  { id: 'kat', label: 'Kat sınırı', key: 'K', title: 'Kat dış sınırı: kapalı çokgen (K)' },
  { id: 'bb', label: 'BB', key: 'B', title: 'BB parçası: listeden seçili bağımsız bölüme bağlanır (B)' },
  { id: 'kisim', label: 'Kısım', key: 'R', title: 'Kısım (BBK): BB parçasının içinde; kısmın içine çizilen kısım delik açar (R)' },
  { id: 'oa', label: 'Ortak alan', key: 'O', title: 'Ortak alan (OA) (O)' },
  { id: 'olcu', label: 'Ölçü', key: 'M', title: 'Ölçü: uzunluk ve alan (M)' },
];

const SNAP_LABEL: Record<SnapKind, string> = {
  kose: 'köşe',
  kenarOrta: 'kenar orta',
  kenarUzeri: 'kenar üzeri',
  dik: 'dik',
  paralel: 'paralel',
  izgara: 'ızgara 1 cm',
  serbest: 'serbest',
};

const SECTION_COLORS = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb7185', '#60a5fa', '#c084fc'];

const polyPath = (p: Poly2) =>
  [p.outer, ...p.holes].map((r) => `M${r.map((q) => `${q.x},${-q.y}`).join('L')}Z`).join(' ');
const ringPath = (r: Ring2, close = true) => (r.length ? `M${r.map((q) => `${q.x},${-q.y}`).join('L')}${close ? 'Z' : ''}` : '');

function initialProject(model: ImportedModel): DesignProject {
  // Kat ve liste beyan bilgisi içe aktarılan GML'den gelir; çizimler boş başlar (kullanıcı altlık üzerine çizer).
  const ex = designFromImportedModel(model).project;
  const b = ex.buildings[0];
  const empty = createEmptyProject(`${ex.name.replace(" (GML'den çıkarıldı)", '')} — tasarım`, ex.id);
  return {
    ...empty,
    georef: ex.georef,
    parcel: ex.parcel,
    idSeq: ex.idSeq,
    buildings: [{ ...empty.buildings[0], letter: b.letter, storeys: b.storeys.map((s) => ({ ...s, outline: [] })), sections: b.sections }],
  };
}

export const DesignEditor2D: React.FC<DesignEditor2DProps> = ({ model, codelists }) => {
  const [state, dispatch] = useReducer(editorReducer, model, (m) => createEditorState(initialProject(m)));
  const [showUnderlay, setShowUnderlay] = useState(true);
  const [view, setView] = useState({ cx: 0, cy: 0, mmPerPx: 20 });
  const [cursor, setCursor] = useState<SnapResult | null>(null);
  const [size, setSize] = useState({ w: 600, h: 400 });
  const [shift, setShift] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const b = state.project.buildings[0];
  const sid = state.activeStoreyId;
  const storey = b?.storeys.find((s) => s.id === sid);

  // Altlık: içe aktarılan GML'den çıkarılan tasarımın aktif kata denk gelen halkaları (DXF/raster altlığının yerine geçer)
  const underlayProject = useMemo(() => designFromImportedModel(model).project, [model]);
  const underlay = useMemo(() => {
    const ub = underlayProject.buildings[0];
    const ust = ub.storeys.find((s) => s.storeyNumber === storey?.storeyNumber);
    if (!ust) return [] as Ring2[];
    return [
      ...ust.outline.map((o) => o.outer),
      ...ub.sectionParts.filter((x) => x.storeyId === ust.id).map((x) => x.outline.outer),
      ...ub.parts.filter((x) => x.storeyId === ust.id).flatMap((x) => [x.polygon.outer, ...x.polygon.holes]),
    ];
  }, [underlayProject, storey?.storeyNumber]);

  const issues = useMemo(() => checkDesign(state.project), [state.project]);
  const metrics = useMemo(() => designMetrics(state.project), [state.project]);
  const issueIds = useMemo(() => new Set(issues.filter((i) => i.severity === 'H').map((i) => i.elementId)), [issues]);

  const storeyRings: Ring2[] = useMemo(() => {
    if (!b || !sid) return [];
    return [
      ...(storey?.outline.flatMap((o) => [o.outer, ...o.holes]) ?? []),
      ...b.sectionParts.filter((x) => x.storeyId === sid).map((x) => x.outline.outer),
      ...b.parts.filter((x) => x.storeyId === sid).flatMap((x) => [x.polygon.outer, ...x.polygon.holes]),
    ];
  }, [b, sid, storey]);

  // Görünüme sığdır
  const fit = () => {
    const rings = [...storeyRings, ...(showUnderlay ? underlay : [])];
    if (rings.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const r of rings) {
      const bb = ringBounds(r);
      minX = Math.min(minX, bb.minX); minY = Math.min(minY, bb.minY); maxX = Math.max(maxX, bb.maxX); maxY = Math.max(maxY, bb.maxY);
    }
    const mmPerPx = Math.max((maxX - minX) / (size.w - 40), (maxY - minY) / (size.h - 40), 1);
    setView({ cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, mmPerPx });
  };
  useEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid, size.w, size.h, underlay.length]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = Math.max(100, el.clientWidth);
      const h = Math.max(100, el.clientHeight);
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toMm = (e: { clientX: number; clientY: number }): Pt2 => {
    const r = svgRef.current?.getBoundingClientRect();
    const px = r ? e.clientX - r.left : 0;
    const py = r ? e.clientY - r.top : 0;
    return { x: view.cx + (px - size.w / 2) * view.mmPerPx, y: view.cy - (py - size.h / 2) * view.mmPerPx };
  };

  const snap = (p: Pt2, ortho: boolean): SnapResult =>
    snapPoint(p, {
      rings: [...storeyRings, ...(showUnderlay ? underlay : []), state.draft],
      toleranceMm: 8 * view.mmPerPx,
      lastPoint: state.draft[state.draft.length - 1],
      ortho,
    });

  // Klavye kısayolları (yalnız editör odaktayken)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') return;
    if (e.key === 'Shift') setShift(true);
    const k = e.key.toUpperCase();
    if (e.ctrlKey && k === 'Z') return void (e.preventDefault(), dispatch({ type: 'undo' }));
    if (e.ctrlKey && k === 'Y') return void (e.preventDefault(), dispatch({ type: 'redo' }));
    if (e.key === 'Escape') return dispatch({ type: 'cancel' });
    if (e.key === 'Enter') return dispatch({ type: 'finish' });
    if (e.key === 'Delete') return dispatch({ type: 'delete' });
    const t = TOOLS.find((x) => x.key === k && !e.ctrlKey);
    if (t) dispatch({ type: 'tool', tool: t.id });
  };

  const partLabel = (usage: number, kind: 'BBK' | 'OA') => codelists.getDescription(kind === 'BBK' ? 'partUsage' : 'commonAreaUsage', usage) ?? String(usage);
  const sectionIndex = (id: string) => b?.sections.findIndex((s) => s.id === id) ?? 0;
  const selected = state.selectedId;
  const selPart = b?.parts.find((p) => p.id === selected);
  const selSp = b?.sectionParts.find((p) => p.id === selected);
  const partOptions = codelists.getList('partUsage').entries;

  const saveProject = () => {
    const blob = new Blob([serializeProject(state.project)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.project.name.replace(/[^\w\-ğüşıöçĞÜŞİÖÇ ]+/g, '_')}.tkgm3b`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const openProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      dispatch({ type: 'load', project: parseProject(await f.text()).project });
    } catch (err) {
      window.alert(`Proje açılamadı: ${(err as Error).message}`);
    }
  };

  const draftWithCursor = cursor && state.tool !== 'sec' && state.draft.length > 0 ? [...state.draft, cursor.point] : state.draft;
  const draftArea = draftWithCursor.length >= 3 ? polyAreaM2({ outer: draftWithCursor, holes: [] }) : 0;
  const sw = view.mmPerPx; // 1 piksel çizgi kalınlığı (mm)

  return (
    <div className="flex h-full w-full text-xs" onKeyDown={onKeyDown} onKeyUp={(e) => e.key === 'Shift' && setShift(false)} tabIndex={0} aria-label="2B tasarım editörü">
      {/* Çizim alanı */}
      <div ref={boxRef} className="relative flex-1 min-w-0 bg-white overflow-hidden">
        <svg
          ref={svgRef}
          width={size.w}
          height={size.h}
          viewBox={`${view.cx - (size.w / 2) * view.mmPerPx} ${-view.cy - (size.h / 2) * view.mmPerPx} ${size.w * view.mmPerPx} ${size.h * view.mmPerPx}`}
          // Mutlak konum: SVG kutunun boyutunu etkilemez (ResizeObserver ↔ SVG boyut döngüsünü önler)
          className={`absolute inset-0 block ${state.tool === 'sec' ? 'cursor-default' : 'cursor-crosshair'}`}
          onMouseMove={(e) => {
            if (panRef.current) {
              const p = panRef.current;
              setView((v) => ({ ...v, cx: p.cx - (e.clientX - p.x) * v.mmPerPx, cy: p.cy + (e.clientY - p.y) * v.mmPerPx }));
              return;
            }
            setCursor(snap(toMm(e), e.shiftKey || shift));
          }}
          onMouseLeave={() => setCursor(null)}
          onMouseDown={(e) => {
            if (e.button === 1 || e.button === 2) {
              e.preventDefault();
              panRef.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy };
            }
          }}
          onMouseUp={() => (panRef.current = null)}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => {
            if (e.button !== 0) return;
            const s = snap(toMm(e), e.shiftKey || shift);
            dispatch({ type: 'click', p: state.tool === 'sec' ? { x: Math.round(toMm(e).x), y: Math.round(toMm(e).y) } : s.point });
            (e.currentTarget.parentElement?.parentElement as HTMLElement | null)?.focus();
          }}
          onDoubleClick={() => dispatch({ type: 'finish' })}
          onWheel={(e) => {
            const m = toMm(e);
            const f = e.deltaY > 0 ? 1.2 : 1 / 1.2;
            setView((v) => ({ mmPerPx: Math.min(500, Math.max(0.2, v.mmPerPx * f)), cx: m.x + (v.cx - m.x) * f, cy: m.y + (v.cy - m.y) * f }));
          }}
        >
          {/* Altlık */}
          {showUnderlay && underlay.map((r, i) => <path key={`u${i}`} d={ringPath(r)} fill="none" stroke="#cbd5e1" strokeWidth={sw} strokeDasharray={`${4 * sw} ${3 * sw}`} />)}
          {/* Kat sınırı */}
          {storey?.outline.map((o, i) => (
            <path key={`k${i}`} d={polyPath(o)} fillRule="evenodd" fill="#f1f5f9" stroke={selected === `${storey.id}#outline#${i}` ? '#f59e0b' : '#0f172a'} strokeWidth={2.5 * sw} />
          ))}
          {/* BB parçaları */}
          {b?.sectionParts.filter((x) => x.storeyId === sid).map((sp) => {
            const color = SECTION_COLORS[sectionIndex(sp.sectionId) % SECTION_COLORS.length];
            return <path key={sp.id} d={polyPath(sp.outline)} fillRule="evenodd" fill={color} fillOpacity={0.12} stroke={issueIds.has(sp.id) ? '#dc2626' : selected === sp.id ? '#f59e0b' : color} strokeWidth={(selected === sp.id ? 3 : 1.8) * sw} />;
          })}
          {/* Kısımlar ve ortak alanlar */}
          {b?.parts.filter((x) => x.storeyId === sid).map((p) => (
            <path key={p.id} d={polyPath(p.polygon)} fillRule="evenodd" fill={p.kind === 'OA' ? '#fde68a' : '#e0f2fe'} fillOpacity={0.55} stroke={issueIds.has(p.id) ? '#dc2626' : selected === p.id ? '#f59e0b' : '#475569'} strokeWidth={(selected === p.id ? 2.5 : 1) * sw} />
          ))}
          {/* Etiketler: kullanım + canlı alan; plan alanından %10 sapma kırmızı (§7.5) */}
          {b?.parts.filter((x) => x.storeyId === sid).map((p) => {
            const c = ringCentroid(p.polygon.outer);
            const m = metrics.get(p.id);
            const red = (m?.deviationPct ?? 0) > 10;
            const fs = Math.max(10 * sw, 120);
            return (
              <g key={`l${p.id}`} pointerEvents="none">
                <text x={c.x} y={-c.y} textAnchor="middle" fontSize={fs} fill="#0f172a">{partLabel(p.usage, p.kind)}{p.remote ? ' (uzak)' : ''}</text>
                <text x={c.x} y={-c.y + fs * 1.15} textAnchor="middle" fontSize={fs * 0.9} fill={red ? '#dc2626' : '#334155'}>
                  {(m?.areaM2 ?? 0).toFixed(2)} m²{m?.deviationPct != null ? ` (%${m.deviationPct.toFixed(1)})` : ''}
                </text>
              </g>
            );
          })}
          {/* Taslak */}
          {draftWithCursor.length > 0 && <path d={ringPath(draftWithCursor, false)} fill={draftWithCursor.length >= 3 ? '#f59e0b22' : 'none'} stroke="#f59e0b" strokeWidth={2 * sw} />}
          {state.draft.map((q, i) => <circle key={`d${i}`} cx={q.x} cy={-q.y} r={3 * sw} fill={i === 0 ? '#f59e0b' : '#fff'} stroke="#f59e0b" strokeWidth={sw} />)}
          {/* Snap göstergesi */}
          {cursor && state.tool !== 'sec' && (
            <g pointerEvents="none">
              <rect x={cursor.point.x - 5 * sw} y={-cursor.point.y - 5 * sw} width={10 * sw} height={10 * sw} fill="none" stroke={cursor.kind === 'izgara' || cursor.kind === 'serbest' ? '#94a3b8' : '#16a34a'} strokeWidth={1.5 * sw} />
            </g>
          )}
        </svg>
        {/* Durum satırı */}
        <div className="absolute left-0 right-0 bottom-0 flex flex-wrap gap-x-3 px-2 py-0.5 bg-slate-900/85 text-[10px] font-mono text-slate-200">
          <span>{cursor ? `x ${cursor.point.x} y ${cursor.point.y} mm · snap: ${SNAP_LABEL[cursor.kind]}` : 'İmleç çizim alanı dışında'}</span>
          {state.draft.length > 0 && <span>Taslak: {state.draft.length} nokta{draftArea > 0 ? ` · ${draftArea.toFixed(2)} m²` : ''} · Enter/çift tık: kapat · Esc: vazgeç</span>}
          <span>Shift: dik/yatay · Orta/sağ tuş: kaydır · Tekerlek: yakınlaştır</span>
        </div>
        {state.message && (
          <div role="status" className={`absolute left-2 top-2 max-w-[70%] px-2 py-1 rounded text-[11px] shadow ${state.message.kind === 'error' ? 'bg-red-600 text-white' : state.message.kind === 'ok' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-100'}`}>
            {state.message.text}
          </div>
        )}
      </div>

      {/* Yan sütun */}
      <aside className="w-56 shrink-0 border-l border-slate-800 bg-slate-950 text-slate-200 overflow-y-auto p-2 space-y-2.5">
        <div className="grid grid-cols-3 gap-1" role="toolbar" aria-label="Çizim araçları">
          {TOOLS.map((t) => (
            <button key={t.id} type="button" title={t.title} onClick={() => dispatch({ type: 'tool', tool: t.id })} className={`px-1 py-1 rounded text-[11px] border ${state.tool === t.id ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}>
              {t.label} <span className="opacity-60">{t.key}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => dispatch({ type: 'undo' })} disabled={state.undo.length === 0} className="flex-1 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-40" title="Geri al (Ctrl+Z)">↶</button>
          <button type="button" onClick={() => dispatch({ type: 'redo' })} disabled={state.redo.length === 0} className="flex-1 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-40" title="Yinele (Ctrl+Y)">↷</button>
          <button type="button" onClick={fit} className="flex-1 px-1 py-0.5 rounded bg-slate-800 border border-slate-700" title="Görünüme sığdır">⤢</button>
        </div>

        <label className="block">
          <span className="text-[10px] text-slate-400">Aktif kat</span>
          <select value={sid ?? ''} onChange={(e) => dispatch({ type: 'setStorey', id: e.target.value })} className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1 py-0.5">
            {b?.storeys.map((s) => <option key={s.id} value={s.id}>Kat_{s.storeyNumber} · {(s.zBottom / 1000).toFixed(3)} m</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={showUnderlay} onChange={(e) => setShowUnderlay(e.target.checked)} />
          <span>Altlık: içe aktarılan GML planı</span>
        </label>

        {(state.tool === 'bb' || state.tool === 'kisim' || state.tool === 'oa') && (
          <div className="space-y-1.5 p-1.5 rounded border border-slate-800">
            {state.tool === 'bb' && (
              <label className="block">
                <span className="text-[10px] text-slate-400">Bağımsız bölüm (liste beyan)</span>
                <select value={state.options.sectionId ?? ''} onChange={(e) => dispatch({ type: 'options', patch: { sectionId: e.target.value } })} className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1 py-0.5">
                  {b?.sections.map((s) => <option key={s.id} value={s.id}>BB {s.number} · {s.registeredQuality || '—'}</option>)}
                </select>
              </label>
            )}
            {state.tool === 'kisim' && (
              <label className="block">
                <span className="text-[10px] text-slate-400">Kısım kullanımı (partUsage)</span>
                <select value={state.options.partUsage} onChange={(e) => dispatch({ type: 'options', patch: { partUsage: Number(e.target.value) } })} className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1 py-0.5">
                  {partOptions.map((o) => <option key={o.code} value={o.code}>{o.code} {o.description}</option>)}
                </select>
              </label>
            )}
            {state.tool === 'oa' && (
              <label className="block">
                <span className="text-[10px] text-slate-400">Ortak alan kullanımı</span>
                <select value={state.options.oaUsage} onChange={(e) => dispatch({ type: 'options', patch: { oaUsage: Number(e.target.value) } })} className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1 py-0.5">
                  {partOptions.map((o) => <option key={o.code} value={o.code}>{o.code} {o.description}</option>)}
                </select>
              </label>
            )}
          </div>
        )}

        {(selPart || selSp) && (
          <div className="space-y-1.5 p-1.5 rounded border border-amber-700/60">
            <div className="font-semibold text-amber-300">{selPart ? (selPart.kind === 'BBK' ? 'Kısım' : 'Ortak alan') : 'BB parçası'}</div>
            <div className="font-mono text-[11px]">Alan: {(metrics.get(selected ?? '')?.areaM2 ?? 0).toFixed(2)} m²</div>
            {selPart && (
              <>
                <select value={selPart.usage} onChange={(e) => dispatch({ type: 'updatePart', id: selPart.id, patch: { usage: Number(e.target.value) } })} className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5">
                  {partOptions.map((o) => <option key={o.code} value={o.code}>{o.code} {o.description}</option>)}
                </select>
                <label className="block">
                  <span className="text-[10px] text-slate-400">Plan alanı (m², -1 = yok)</span>
                  <input
                    key={`${selPart.id}-${selPart.planArea}`}
                    defaultValue={String(selPart.planArea)}
                    onBlur={(e) => {
                      const v = Number(e.target.value.replace(',', '.'));
                      if (Number.isFinite(v) && v !== selPart.planArea) dispatch({ type: 'updatePart', id: selPart.id, patch: { planArea: v } });
                    }}
                    className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 font-mono"
                  />
                </label>
              </>
            )}
            {selSp && (
              <select value={selSp.sectionId} onChange={(e) => dispatch({ type: 'updateSectionPart', id: selSp.id, patch: { sectionId: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5">
                {b?.sections.map((s) => <option key={s.id} value={s.id}>BB {s.number}</option>)}
              </select>
            )}
            <button type="button" onClick={() => dispatch({ type: 'delete' })} className="w-full px-1 py-0.5 rounded bg-red-900/60 border border-red-700 text-red-100">Sil (Delete)</button>
          </div>
        )}

        <div>
          <div className="text-[10px] text-slate-400 mb-0.5">Çizim denetimi (§5.3): H {issues.filter((i) => i.severity === 'H').length} · U {issues.filter((i) => i.severity === 'U').length}</div>
          <ul className="space-y-0.5 max-h-40 overflow-y-auto">
            {issues.slice(0, 50).map((i, idx) => (
              <li key={`${i.code}-${i.elementId}-${idx}`}>
                <button type="button" onClick={() => dispatch({ type: 'select', id: i.elementId })} className={`w-full text-left px-1 py-0.5 rounded text-[10px] ${i.severity === 'H' ? 'bg-red-950/60 text-red-200' : 'bg-amber-950/40 text-amber-200'}`}>
                  {i.severity} {i.code} ({i.fileRule}): {i.message}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1 pt-1 border-t border-slate-800">
          <button type="button" onClick={() => dispatch({ type: 'load', project: designFromImportedModel(model).project })} className="w-full px-1 py-0.5 rounded bg-slate-800 border border-slate-700" title="İçe aktarılan GML'in planını tasarım modeline çıkarır (§10.4)">GML'den tasarım çıkar</button>
          <button type="button" onClick={() => dispatch({ type: 'load', project: initialProject(model) })} className="w-full px-1 py-0.5 rounded bg-slate-800 border border-slate-700" title="Katlar ve liste beyan kalır, çizimler boşalır">Boş çizimle başla</button>
          <div className="flex gap-1">
            <button type="button" onClick={saveProject} className="flex-1 px-1 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white">Projeyi kaydet</button>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 px-1 py-0.5 rounded bg-slate-800 border border-slate-700">Proje aç</button>
            <input ref={fileRef} type="file" accept=".tkgm3b,.json" className="hidden" onChange={(e) => void openProject(e)} />
          </div>
        </div>
      </aside>
    </div>
  );
};
