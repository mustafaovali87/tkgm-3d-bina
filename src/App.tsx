// KARAR D-23 (D-23.1, D-23.2, D-23.3, D-23.4, D-23.5, D-23.6) — Ana Pencere Yerleşimi ve M1 3B GML Görüntüleyici
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import {
  ImportedCityObject,
  ImportedModel,
  ImportedTreeNode,
  parseCityGmlModel,
} from './core/gml/gmlReader.ts';
import { compareCodeUnits, computeCanonicalModelHash } from './core/hash/canonical.ts';
import { formatBigIntFraction } from './core/math/landShare.ts';
import {
  DEFAULT_BEYAN_DUZENLEME_AYAR,
  Malik,
  validateBbMalikShares,
} from './core/model/malik.ts';
import { metersToMm, ValidationIssue } from './core/model/index.ts';
import {
  getDefaultOrnek6Model,
  getOfflineCodelistRegistry,
} from './data/offlineFixtures.ts';
import { M0_AUDIT_DATA } from './generated/m0AuditData.ts';
import { CityGmlViewport3D } from './viewer3d/CityGmlViewport3D.tsx';
import { FloorPlanPreview2D } from './viewer3d/FloorPlanPreview2D.tsx';

export type LayoutPresetId = 'F5_STANDART' | 'F6_YAN_YANA' | 'F7_CIZIM' | 'F8_DENETIM';

const LAYOUT_STORAGE_KEY = 'tkgm3d_d23_layout_v1';

interface PersistedWorkspaceState {
  preset: LayoutPresetId;
  groupLayouts: Record<string, Layout>;
  collapsedPanels: Record<string, boolean>;
}

const DEFAULT_MALIKLER: Malik[] = [
  {
    bbAnahtari: '-1||1',
    adSoyadVeyaUnvan: 'ÖRNEK MALİK 1 (Kat İrtifakı Beyan Örneği)',
    tcKimlikVeyaVergiNo: '11111111110',
    hissePay: 1n,
    hissePayda: 2n,
    not: 'Kat İrtifakı Tesisi',
  },
  {
    bbAnahtari: '-1||1',
    adSoyadVeyaUnvan: 'ÖRNEK MALİK 2 (Kat İrtifakı Beyan Örneği)',
    tcKimlikVeyaVergiNo: '22222222220',
    hissePay: 1n,
    hissePayda: 2n,
    not: 'Kat İrtifakı Tesisi',
  },
  {
    bbAnahtari: '-1||2',
    adSoyadVeyaUnvan: 'ÖRNEK MALİK 3 (Kat İrtifakı Beyan Örneği)',
    tcKimlikVeyaVergiNo: '33333333330',
    hissePay: 1n,
    hissePayda: 1n,
    not: 'Satış',
  },
];

function loadPersistedWorkspaceState(): PersistedWorkspaceState {
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedWorkspaceState>;
      return {
        preset:
          parsed.preset === 'F5_STANDART' ||
          parsed.preset === 'F6_YAN_YANA' ||
          parsed.preset === 'F7_CIZIM' ||
          parsed.preset === 'F8_DENETIM'
            ? parsed.preset
            : 'F5_STANDART',
        groupLayouts: parsed.groupLayouts ?? {},
        collapsedPanels: parsed.collapsedPanels ?? {},
      };
    }
  } catch {
    // localStorage erişilemezse varsayılan kalıp kullanılır
  }
  return {
    preset: 'F5_STANDART',
    groupLayouts: {},
    collapsedPanels: {},
  };
}

export function App() {
  const [model, setModel] = useState<ImportedModel>(() => getDefaultOrnek6Model());
  const [selectedGmlId, setSelectedGmlId] = useState<string | null>(() => {
    const m = getDefaultOrnek6Model();
    return m.objects.find((o) => o.prefix === 'BBK_')?.gmlId ?? m.buildingGmlId;
  });
  const [activeStoreyId, setActiveStoreyId] = useState<string | null>(null);
  const [highlightedRulePolygonId, setHighlightedRulePolygonId] = useState<
    string | null
  >(null);

  // D-23.2: Yerleşim kalıpları (F5, F6, F7, F8) ve localStorage kalıcılığı
  const [workspaceState, setWorkspaceState] = useState<PersistedWorkspaceState>(
    loadPersistedWorkspaceState
  );
  const [maximizedPanelId, setMaximizedPanelId] = useState<
    'tree' | 'cad2d' | 'scene3d' | 'validation' | 'attributes' | null
  >(null);

  // D-23.2 #5: Küçük ekran (< 1366 px) sekme modu + tek tıkla simülasyon anahtarı
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1600
  );
  const [simulateNarrowScreen, setSimulateNarrowScreen] = useState<boolean>(false);
  const [narrowCenterTab, setNarrowCenterTab] = useState<'2d' | '3d'>('3d');
  const [narrowTreeDrawerOpen, setNarrowTreeDrawerOpen] = useState<boolean>(false);

  // Proje ağacı filtreleri ve açık düğümler
  const [treeSearch, setTreeSearch] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Doğrulama paneli filtreleri
  const [validationSeverityFilter, setValidationSeverityFilter] = useState<
    'ALL' | 'H' | 'U' | 'B'
  >('ALL');
  const [validationSearch, setValidationSearch] = useState<string>('');

  // Öznitelik paneli alt sekmesi
  const [attrTab, setAttrTab] = useState<'attributes' | 'landshare' | 'malik'>('attributes');
  const [malikler, setMalikler] = useState<Malik[]>(DEFAULT_MALIKLER);
  const [newMalikName, setNewMalikName] = useState<string>('');
  const [newMalikShare, setNewMalikShare] = useState<string>('1/1');

  // M0/M1 Denetim & F1-F12 Rapor Çekmecesi
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditModalTab, setAuditModalTab] = useState<
    'kontrol_m0' | 'adim_notu' | 'kararlar' | 'codelists' | 'trace'
  >('kontrol_m0');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pencere genişliği takibi (< 1366 px kuralı D-23.2 #5)
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // localStorage kaydetme
  useEffect(() => {
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(workspaceState));
    } catch {
      // ignore
    }
  }, [workspaceState]);

  // F5, F6, F7, F8 klavye kısayolları (D-23.2)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        setMaximizedPanelId(null);
        setWorkspaceState((prev) => ({ ...prev, preset: 'F5_STANDART' }));
      } else if (e.key === 'F6') {
        e.preventDefault();
        setMaximizedPanelId(null);
        setWorkspaceState((prev) => ({ ...prev, preset: 'F6_YAN_YANA' }));
      } else if (e.key === 'F7') {
        e.preventDefault();
        setMaximizedPanelId(null);
        setWorkspaceState((prev) => ({ ...prev, preset: 'F7_CIZIM' }));
      } else if (e.key === 'F8') {
        e.preventDefault();
        setMaximizedPanelId(null);
        setWorkspaceState((prev) => ({ ...prev, preset: 'F8_DENETIM' }));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // D-23.4 / K89: Kanonik Model Özeti — kalıp, panel boyutu, seçim veya kamera değiştiğinde ASLA değişmez
  const liveCanonicalHash = useMemo(() => {
    const mbObj = model.objects.find((o) => o.prefix === 'MB_');
    const coordsMm: number[] = [];
    const sortedPolys = [...model.polygons].sort((a, b) =>
      compareCodeUnits(a.gmlId, b.gmlId)
    );
    for (const p of sortedPolys) {
      for (const v of p.exteriorRing.vertices) {
        coordsMm.push(metersToMm(v.e), metersToMm(v.n), metersToMm(v.z));
      }
    }

    return computeCanonicalModelHash(
      {
        schemaVersion: '3.5.5',
        producerProfile: model.detectedProducerProfile,
        codelistsCombinedSha256: 'tkgm-14-codelists-v3.5.5',
        buildingAttributes: mbObj?.attributesMap ?? {},
        coordinatesMm: coordsMm,
        objectAttributes: model.objects.map((o) => ({
          gmlId: o.gmlId,
          attributes: o.attributesMap,
        })),
      },
      {
        preset: workspaceState.preset,
        groupLayouts: workspaceState.groupLayouts,
        selectedGmlId,
        activeStoreyId,
        narrowCenterTab,
      }
    );
  }, [
    model,
    workspaceState.preset,
    workspaceState.groupLayouts,
    selectedGmlId,
    activeStoreyId,
    narrowCenterTab,
  ]);

  const isHashInvariantVerified = liveCanonicalHash === model.canonicalHash;

  const selectedObject: ImportedCityObject | null = useMemo(() => {
    if (!selectedGmlId) return null;
    if (model.objectsById[selectedGmlId]) return model.objectsById[selectedGmlId];
    const poly = model.polygonsById[selectedGmlId];
    if (poly && model.objectsById[poly.ownerObjectGmlId]) {
      return model.objectsById[poly.ownerObjectGmlId];
    }
    return null;
  }, [model, selectedGmlId]);

  // Seçili nesne değiştiğinde ağaçta üst kat ve bağımsız bölüm düğümlerini otomatik aç
  useEffect(() => {
    if (!selectedObject) return;
    setExpandedNodes((prev) => {
      const next = { ...prev };
      if (model.buildingGmlId) next[model.buildingGmlId] = true;
      if (selectedObject.storeyGmlId) next[selectedObject.storeyGmlId] = true;
      if (selectedObject.referencedBbGmlId) next[selectedObject.referencedBbGmlId] = true;
      if (selectedObject.parentGmlId) next[selectedObject.parentGmlId] = true;
      return next;
    });
  }, [selectedObject, model.buildingGmlId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCityGmlModel(text, file.name, getOfflineCodelistRegistry());
    setModel(parsed);
    setActiveStoreyId(null);
    setHighlightedRulePolygonId(null);
    setSelectedGmlId(
      parsed.objects.find((o) => o.prefix === 'BBK_')?.gmlId ?? parsed.buildingGmlId
    );
    e.target.value = '';
  };

  const handleResetToOrnek6 = () => {
    const def = getDefaultOrnek6Model();
    setModel(def);
    setActiveStoreyId(null);
    setHighlightedRulePolygonId(null);
    setSelectedGmlId(
      def.objects.find((o) => o.prefix === 'BBK_')?.gmlId ?? def.buildingGmlId
    );
  };

  // Tüm doğrulama bulguları (GML Okuyucu + Arsa Payı Motoru)
  const allIssues = useMemo(() => {
    return [...model.readerIssues, ...model.landShareAnalysis.issues];
  }, [model]);

  const issueCounts = useMemo(() => {
    let H = 0;
    let U = 0;
    let B = 0;
    for (const i of allIssues) {
      if (i.severity === 'H') H++;
      else if (i.severity === 'U') U++;
      else B++;
    }
    return { H, U, B };
  }, [allIssues]);

  const objectCounts = useMemo(() => {
    const counts = {
      MB: 0,
      K: 0,
      BB: 0,
      BBK: 0,
      BLKN: 0,
      KAPI: 0,
      PEN: 0,
      MBG: 0,
    };
    for (const o of model.objects) {
      if (o.prefix === 'MB_') counts.MB++;
      else if (o.prefix === 'K_') counts.K++;
      else if (o.prefix === 'BB_') counts.BB++;
      else if (o.prefix === 'BBK_') counts.BBK++;
      else if (o.prefix === 'BLKN_') counts.BLKN++;
      else if (o.prefix === 'KAPI_') counts.KAPI++;
      else if (o.prefix === 'PEN_') counts.PEN++;
      else if (o.prefix === 'MBG_') counts.MBG++;
    }
    return counts;
  }, [model.objects]);

  // D-23.3: Doğrulama satırına tıklandığında ilgili nesneyi seç ve sahnede odakla
  const handleIssueClick = (issue: ValidationIssue) => {
    if (issue.targetGmlId) {
      if (model.objectsById[issue.targetGmlId]) {
        setSelectedGmlId(issue.targetGmlId);
        setHighlightedRulePolygonId(null);
        return;
      }
      if (model.polygonsById[issue.targetGmlId]) {
        const poly = model.polygonsById[issue.targetGmlId];
        setSelectedGmlId(poly.ownerObjectGmlId);
        setHighlightedRulePolygonId(poly.gmlId);
        return;
      }
      // Hedef bir halka (LinearRing_) ise sahibini bul
      const ownerPoly = model.polygons.find(
        (p) =>
          p.exteriorRing.gmlId === issue.targetGmlId ||
          p.interiorRings.some((r) => r.gmlId === issue.targetGmlId)
      );
      if (ownerPoly) {
        setSelectedGmlId(ownerPoly.ownerObjectGmlId);
        setHighlightedRulePolygonId(ownerPoly.gmlId);
      }
    }
  };

  const handleGroupLayoutChanged = (groupId: string, layout: Layout) => {
    setWorkspaceState((prev) => ({
      ...prev,
      groupLayouts: {
        ...prev.groupLayouts,
        [groupId]: layout,
      },
    }));
  };

  const toggleCollapsePanel = (panelKey: string) => {
    setWorkspaceState((prev) => ({
      ...prev,
      collapsedPanels: {
        ...prev.collapsedPanels,
        [panelKey]: !prev.collapsedPanels[panelKey],
      },
    }));
  };

  const isNarrowMode = windowWidth < 1366 || simulateNarrowScreen;

  const filteredIssues = useMemo(() => {
    return allIssues.filter((i) => {
      if (validationSeverityFilter !== 'ALL' && i.severity !== validationSeverityFilter) {
        return false;
      }
      if (validationSearch.trim()) {
        const q = validationSearch.trim().toLowerCase();
        return (
          i.ruleId.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q) ||
          (i.targetGmlId ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allIssues, validationSeverityFilter, validationSearch]);

  // ============================================================================
  // PANEL 1: PROJE AĞACI (MB_ -> K_ -> BB_ -> BBK_ / BLKN_ / KAPI_ / PEN_)
  // ============================================================================
  const renderProjectTreePanel = () => {
    const isCollapsed = !!workspaceState.collapsedPanels['tree'];
    const q = treeSearch.trim().toLowerCase();

    const matchesTreeNode = (node: ImportedTreeNode): boolean => {
      if (!q) return true;
      if (
        node.gmlId.toLowerCase().includes(q) ||
        node.label.toLowerCase().includes(q) ||
        node.subLabel.toLowerCase().includes(q)
      ) {
        return true;
      }
      return node.children.some((c) => matchesTreeNode(c));
    };

    const renderTreeNode = (node: ImportedTreeNode, depth: number): React.ReactNode => {
      if (!matchesTreeNode(node)) return null;

      const hasChildren = node.children.length > 0;
      const isExpanded = q.length > 0 || (expandedNodes[node.gmlId] ?? depth < 2);
      const isSelected = selectedGmlId === node.gmlId;
      const isStorey = node.category === 'STOREY';
      const isActiveStorey = isStorey && activeStoreyId === node.gmlId;

      const categoryBadgeColor: Record<string, string> = {
        MB: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        STOREY: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        BB: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        BBK: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        BLKN: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        KAPI: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        PEN: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        MBG: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      };

      const shortBadge = node.category === 'STOREY' ? 'K' : node.category;

      return (
        <div key={node.id} className="select-none">
          <div
            onClick={() => {
              setSelectedGmlId(node.gmlId);
              setHighlightedRulePolygonId(null);
            }}
            onDoubleClick={() => {
              // D-23.3: Ağaçta kat (K_) çift tıklanırsa o kat 2B ve 3B'de aktif kat olur
              if (isStorey) {
                setActiveStoreyId((prev) => (prev === node.gmlId ? null : node.gmlId));
              }
            }}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            className={`group flex items-center justify-between gap-1.5 py-1 pr-2 text-xs cursor-pointer border-l-2 transition-colors ${
              isSelected
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-medium'
                : isActiveStorey
                ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200'
                : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedNodes((prev) => ({
                      ...prev,
                      [node.gmlId]: !isExpanded,
                    }));
                  }}
                  className="w-4 h-4 flex items-center justify-center rounded hover:bg-slate-700 text-slate-400"
                >
                  {isExpanded ? '▾' : '▸'}
                </button>
              ) : (
                <span className="w-4 text-center text-slate-600">•</span>
              )}
              <span
                className={`px-1 py-0.2 text-[10px] font-mono rounded border shrink-0 ${
                  categoryBadgeColor[node.category] ??
                  'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                {shortBadge}
              </span>
              <div className="truncate" title={`${node.label} — ${node.subLabel} (${node.gmlId})`}>
                <span>{node.label}</span>
                {node.subLabel && (
                  <span className="ml-1.5 text-[10px] text-slate-400">
                    ({node.subLabel})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isStorey && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStoreyId((prev) => (prev === node.gmlId ? null : node.gmlId));
                  }}
                  title="Katı 2B ve 3B Sahnede Yalıt (Çift Tıkla)"
                  className={`px-1.5 py-0.5 rounded text-[10px] border ${
                    isActiveStorey
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isActiveStorey ? 'Aktif' : 'Kat'}
                </button>
              )}
              <span className="text-[10px] font-mono text-slate-500">
                {node.polygonCount}p
              </span>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div>
              {node.children.map((childNode) => renderTreeNode(childNode, depth + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Panel Başlığı */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
            <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
              PROJE AĞACI ({model.objects.length})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleCollapsePanel('tree')}
              title="Daralt / Genişlet"
              className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              −
            </button>
            <button
              type="button"
              onClick={() =>
                setMaximizedPanelId((prev) => (prev === 'tree' ? null : 'tree'))
              }
              title="Tam Ekran / Geri Al"
              className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {maximizedPanelId === 'tree' ? '❐' : '□'}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Arama ve Kat Filtresi */}
            <div className="p-2 border-b border-slate-800 bg-slate-900/80 space-y-1.5 shrink-0">
              <input
                type="text"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="Nesne, BBK, Salon, gml:id ara..."
                className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>İpucu: Kat (K_) çift tıkla → Yalıt</span>
                {activeStoreyId && (
                  <button
                    type="button"
                    onClick={() => setActiveStoreyId(null)}
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    Tüm Katlar
                  </button>
                )}
              </div>
            </div>

            {/* Nesne Ağacı Listesi */}
            <div className="flex-1 overflow-y-auto py-1">
              {model.hierarchyTree.map((rootNode) => renderTreeNode(rootNode, 0))}
            </div>

            {/* Özet Sayaç Şeridi */}
            <div className="px-2.5 py-1.5 bg-slate-950 border-t border-slate-800 grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 shrink-0">
              <span>K:{objectCounts.K}</span>
              <span>BB:{objectCounts.BB}</span>
              <span>BBK:{objectCounts.BBK}</span>
              <span>BLKN:{objectCounts.BLKN}</span>
              <span>KAPI:{objectCounts.KAPI}</span>
              <span>PEN:{objectCounts.PEN}</span>
              <span>MB:{objectCounts.MB}</span>
              <span>MBG:{objectCounts.MBG}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  // ============================================================================
  // PANEL 2: 2B ÇİZİM (M4 YER TUTUCU + KAT İZDÜŞÜMÜ)
  // ============================================================================
  const render2DFloorPlanPanel = () => (
    <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
            2B ÇİZİM & KAT İZDÜŞÜMÜ (M4 Yer Tutucu)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setMaximizedPanelId((prev) => (prev === 'cad2d' ? null : 'cad2d'))
            }
            title="Tam Ekran / Geri Al"
            className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {maximizedPanelId === 'cad2d' ? '❐' : '□'}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <FloorPlanPreview2D
          model={model}
          selectedGmlId={selectedGmlId}
          activeStoreyGmlId={activeStoreyId}
          onSelectGmlId={(id) => {
            setSelectedGmlId(id);
            setHighlightedRulePolygonId(null);
          }}
          onSelectStoreyGmlId={setActiveStoreyId}
        />
      </div>
    </div>
  );

  // ============================================================================
  // PANEL 3: 3B SAHNE (THREE.JS CITYGML GÖRÜNTÜLEYİCİ)
  // ============================================================================
  const render3DScenePanel = () => (
    <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
            3B SAHNE (Three.js Yerel Merkezli TUREF — P_local = P_TUREF − P_origin)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setMaximizedPanelId((prev) => (prev === 'scene3d' ? null : 'scene3d'))
            }
            title="Tam Ekran / Geri Al"
            className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {maximizedPanelId === 'scene3d' ? '❐' : '□'}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <CityGmlViewport3D
          model={model}
          selectedGmlId={selectedGmlId}
          activeStoreyGmlId={activeStoreyId}
          highlightedRulePolygonId={highlightedRulePolygonId}
          onSelectGmlId={(id) => {
            setSelectedGmlId(id);
            setHighlightedRulePolygonId(null);
          }}
          onClearStoreyFilter={() => setActiveStoreyId(null)}
        />
      </div>
    </div>
  );

  // ============================================================================
  // PANEL 4: DOĞRULAMA & DENETİM PANELİ (H / U / B — TIKLA -> NESNEYE GİT)
  // ============================================================================
  const renderValidationPanel = () => (
    <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
            DOĞRULAMA & DENETİM PANELİ (Tıkla → Nesneye Git)
          </span>
          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={() => setValidationSeverityFilter('ALL')}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                validationSeverityFilter === 'ALL'
                  ? 'bg-slate-700 text-white border-slate-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Tümü ({allIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setValidationSeverityFilter('H')}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                validationSeverityFilter === 'H'
                  ? 'bg-rose-500/30 text-rose-200 border-rose-500'
                  : 'bg-rose-950/40 text-rose-400 border-rose-900/50'
              }`}
            >
              HATA ({issueCounts.H})
            </button>
            <button
              type="button"
              onClick={() => setValidationSeverityFilter('U')}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                validationSeverityFilter === 'U'
                  ? 'bg-amber-500/30 text-amber-200 border-amber-500'
                  : 'bg-amber-950/40 text-amber-400 border-amber-900/50'
              }`}
            >
              UYARI ({issueCounts.U})
            </button>
            <button
              type="button"
              onClick={() => setValidationSeverityFilter('B')}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                validationSeverityFilter === 'B'
                  ? 'bg-sky-500/30 text-sky-200 border-sky-500'
                  : 'bg-sky-950/40 text-sky-400 border-sky-900/50'
              }`}
            >
              BİLGİ ({issueCounts.B})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={validationSearch}
            onChange={(e) => setValidationSearch(e.target.value)}
            placeholder="V-030, V-211, gml:id..."
            className="w-36 px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={() =>
              setMaximizedPanelId((prev) =>
                prev === 'validation' ? null : 'validation'
              )
            }
            title="Tam Ekran / Geri Al"
            className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {maximizedPanelId === 'validation' ? '❐' : '□'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70">
        {filteredIssues.length === 0 ? (
          <div className="p-4 text-xs text-slate-400 flex items-center justify-between">
            <span>
              Seçili filtrede bulgu yok. ({model.fileName} içinde HATA: {issueCounts.H}, UYARI:{' '}
              {issueCounts.U}, BİLGİ: {issueCounts.B})
            </span>
          </div>
        ) : (
          filteredIssues.map((issue, idx) => {
            const sevBadge =
              issue.severity === 'H'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : issue.severity === 'U'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/40';
            return (
              <div
                key={`${issue.ruleId}-${issue.targetGmlId ?? idx}-${idx}`}
                onClick={() => handleIssueClick(issue)}
                className="px-3 py-1.5 text-xs hover:bg-slate-800/70 cursor-pointer flex items-center justify-between gap-2 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded border shrink-0 ${sevBadge}`}
                  >
                    {issue.severity} · {issue.ruleId}
                  </span>
                  <span className="text-slate-200 truncate" title={issue.message}>
                    {issue.message}
                  </span>
                </div>
                {issue.targetGmlId && (
                  <span className="text-[10px] font-mono text-amber-300/90 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                    → {issue.targetGmlId.slice(0, 18)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ============================================================================
  // PANEL 5: ÖZNİTELİK & MALİK PANELİ (SEÇİLİ NESNE + KOD LİSTESİ + ARSA PAYI + MALİK)
  // ============================================================================
  const renderAttributesPanel = () => {
    const bbObject =
      selectedObject?.prefix === 'BB_'
        ? selectedObject
        : selectedObject?.referencedBbGmlId
        ? model.objectsById[selectedObject.referencedBbGmlId] ?? null
        : null;

    const bbBlock = bbObject?.attributesMap.blockName ?? '-1';
    const bbEntrance = bbObject?.attributesMap.entrance ?? '';
    const bbNo = bbObject?.attributesMap.independentSectionNumber ?? '1';
    const activeBbKey = `${bbBlock}|${bbEntrance}|${bbNo}`;
    const malikCheck = validateBbMalikShares(activeBbKey, malikler);

    return (
      <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
            <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
              ÖZNİTELİK & MALİK PANELİ
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAttrTab('attributes')}
              className={`px-2 py-0.5 text-[11px] rounded ${
                attrTab === 'attributes'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Öznitelikler ({selectedObject?.attributes.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setAttrTab('landshare')}
              className={`px-2 py-0.5 text-[11px] rounded ${
                attrTab === 'landshare'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Arsa Payı (K84)
            </button>
            <button
              type="button"
              onClick={() => setAttrTab('malik')}
              className={`px-2 py-0.5 text-[11px] rounded ${
                attrTab === 'malik'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Malik / Beyan (K88)
            </button>
            <button
              type="button"
              onClick={() =>
                setMaximizedPanelId((prev) =>
                  prev === 'attributes' ? null : 'attributes'
                )
              }
              title="Tam Ekran / Geri Al"
              className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {maximizedPanelId === 'attributes' ? '❐' : '□'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 text-xs">
          {attrTab === 'attributes' && (
            <>
              {!selectedObject ? (
                <div className="text-slate-400 py-4 text-center">
                  Proje ağacından, 2B izdüşümden veya 3B sahneden bir nesne seçiniz.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Seçili Nesne Kimlik Kartı */}
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {selectedObject.prefix}
                        </span>
                        <span className="font-semibold text-slate-100">
                          {selectedObject.gmlName || selectedObject.gmlId}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        gml:id = {selectedObject.gmlId}
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-400">
                      <div>Etiket: {selectedObject.tagName}</div>
                      <div>
                        Poligon: {selectedObject.allPolygonIds.length} (Inline:{' '}
                        {selectedObject.inlinePolygons.length}, xlink:{' '}
                        {selectedObject.xlinkPolygonHrefs.length})
                      </div>
                    </div>
                  </div>

                  {/* Öznitelik Tablosu + 14 Resmi Kod Listesi Açıklaması */}
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                          <th className="py-1.5 px-2">gen:*Attribute</th>
                          <th className="py-1.5 px-2">Tür</th>
                          <th className="py-1.5 px-2">Değer</th>
                          <th className="py-1.5 px-2">Resmi Kod Listesi Karşılığı (K60)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {selectedObject.attributes.map((attr) => (
                          <tr
                            key={`${attr.name}-${attr.type}`}
                            className={
                              attr.name === 'partUsage' ||
                              attr.name === 'independentSectionUsage' ||
                              attr.name === 'storeyUsage'
                                ? 'bg-amber-500/10'
                                : 'hover:bg-slate-800/40'
                            }
                          >
                            <td className="py-1 px-2 text-sky-300 font-medium">
                              {attr.name}
                            </td>
                            <td className="py-1 px-2 text-slate-400">{attr.type}</td>
                            <td className="py-1 px-2 text-slate-100">{attr.rawValue}</td>
                            <td className="py-1 px-2 font-sans">
                              {attr.codelistDescription ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                                  {attr.codelistDescription} ({attr.codelistKey}.xml)
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {attrTab === 'landshare' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <div className="text-[10px] text-slate-400">Tekil BB Sayısı (K84)</div>
                  <div className="text-sm font-mono font-bold text-slate-100">
                    {model.landShareAnalysis.uniqueBbCount}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Toplam Arsa Payı (Ham)</div>
                  <div className="text-sm font-mono font-bold text-emerald-300">
                    {formatBigIntFraction(model.landShareAnalysis.totalShareUnreduced)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Sadeleşmiş Toplam</div>
                  <div className="text-sm font-mono font-bold text-sky-300">
                    {formatBigIntFraction(model.landShareAnalysis.totalShareReduced)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">1 Tam Paydan Fark (V-199)</div>
                  <div className="text-sm font-mono font-bold text-amber-300">
                    {formatBigIntFraction(model.landShareAnalysis.diffFromOneUnreduced)}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                BigInt rasyonel aritmetik (EKOK payda eşitlemesi) ile hesaplanmıştır; kayan nokta
                yuvarlama hatası içermez.
              </div>
            </div>
          )}

          {attrTab === 'malik' && (
            <div className="space-y-2.5">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">
                    Aktif Bağımsız Bölüm Anahtarı:{' '}
                    <span className="font-mono text-amber-300">{activeBbKey}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    CLAUDE13 §1 (K88-yeni): Malik bilgileri yalnız Kat İrtifakı Beyan/Tablo çıktısında
                    kullanılır; GML çıktısına asla yazılmaz. (Otomatik Öneri:{' '}
                    {DEFAULT_BEYAN_DUZENLEME_AYAR.otomatikOneri})
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span
                    className={`px-2 py-0.5 rounded text-xs border ${
                      malikCheck.tamHisseMi
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}
                  >
                    Toplam Hisse: {formatBigIntFraction(malikCheck.toplamHisse)}{' '}
                    {malikCheck.tamHisseMi ? '(= 1/1 ✓)' : '(V-208 BİLGİ)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newMalikName}
                  onChange={(e) => setNewMalikName(e.target.value)}
                  placeholder="Malik Ad Soyad / Ünvan..."
                  className="flex-1 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
                <input
                  type="text"
                  value={newMalikShare}
                  onChange={(e) => setNewMalikShare(e.target.value)}
                  placeholder="Pay/Payda (1/2)"
                  className="w-24 px-2 py-1 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    const m = /^(\d+)\/(\d+)$/.exec(newMalikShare.trim());
                    if (!newMalikName.trim() || !m) return;
                    const pay = BigInt(m[1]);
                    const payda = BigInt(m[2]);
                    if (payda === 0n) return;
                    setMalikler((prev) => [
                      ...prev,
                      {
                        bbAnahtari: activeBbKey,
                        adSoyadVeyaUnvan: newMalikName.trim(),
                        hissePay: pay,
                        hissePayda: payda,
                      },
                    ]);
                    setNewMalikName('');
                  }}
                  className="px-2.5 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white font-medium"
                >
                  + Malik Ekle
                </button>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded">
                {malikler
                  .filter((m) => m.bbAnahtari === activeBbKey)
                  .map((m, idx) => (
                    <div
                      key={`${m.adSoyadVeyaUnvan}-${idx}`}
                      className="px-2.5 py-1.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-slate-200 font-medium">
                          {m.adSoyadVeyaUnvan}
                        </span>
                        {m.not && (
                          <span className="ml-2 text-[11px] text-slate-400">
                            ({m.not})
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-emerald-300">
                        {m.hissePay.toString()}/{m.hissePayda.toString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // D-23.1 & D-23.2: 4 KALIP (F5 STANDART, F6 YAN YANA, F7 ÇİZİM, F8 DENETİM)
  // ============================================================================
  const renderMainWorkspace = () => {
    if (maximizedPanelId === 'tree') return renderProjectTreePanel();
    if (maximizedPanelId === 'cad2d') return render2DFloorPlanPanel();
    if (maximizedPanelId === 'scene3d') return render3DScenePanel();
    if (maximizedPanelId === 'validation') return renderValidationPanel();
    if (maximizedPanelId === 'attributes') return renderAttributesPanel();

    // D-23.2 #5: Küçük ekran (< 1366 px) davranışında 2B ve 3B tek orta alanda sekme olarak gösterilir, Ağaç açılır çekmece olur
    if (isNarrowMode) {
      return (
        <div className="relative flex flex-col h-full w-full overflow-hidden">
          {narrowTreeDrawerOpen && (
            <div className="absolute inset-y-0 left-0 z-30 w-72 shadow-2xl">
              {renderProjectTreePanel()}
            </div>
          )}

          <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNarrowTreeDrawerOpen((v) => !v)}
                className="px-2.5 py-1 text-xs rounded bg-sky-600/30 border border-sky-500/50 text-sky-200 font-medium"
              >
                {narrowTreeDrawerOpen ? '✕ Proje Ağacını Kapat' : '☰ Proje Ağacı Çekmecesi'}
              </button>
              <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNarrowCenterTab('2d')}
                  className={`px-3 py-1 text-xs rounded ${
                    narrowCenterTab === '2d'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  2B Çizim & Kat İzdüşümü
                </button>
                <button
                  type="button"
                  onClick={() => setNarrowCenterTab('3d')}
                  className={`px-3 py-1 text-xs rounded ${
                    narrowCenterTab === '3d'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  3B Sahne
                </button>
              </div>
            </div>
            <span className="text-[11px] font-mono text-amber-300">
              Dar Ekran Modu (&lt;1366px — D-23.2 #5)
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <Group
              id="d23-narrow-v"
              orientation="vertical"
              defaultLayout={workspaceState.groupLayouts['d23-narrow-v']}
              onLayoutChanged={(layout) =>
                handleGroupLayoutChanged('d23-narrow-v', layout)
              }
            >
              <Panel id="narrow-top" defaultSize="65%" minSize="30%">
                {narrowCenterTab === '2d'
                  ? render2DFloorPlanPanel()
                  : render3DScenePanel()}
              </Panel>
              <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
              <Panel id="narrow-bottom" defaultSize="35%" minSize="18%">
                <Group id="d23-narrow-bot-h" orientation="horizontal">
                  <Panel id="narrow-val" defaultSize="50%" minSize="20%">
                    {renderValidationPanel()}
                  </Panel>
                  <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
                  <Panel id="narrow-attr" defaultSize="50%" minSize="20%">
                    {renderAttributesPanel()}
                  </Panel>
                </Group>
              </Panel>
            </Group>
          </div>
        </div>
      );
    }

    // KALIP 2: F6 — YAN YANA
    if (workspaceState.preset === 'F6_YAN_YANA') {
      return (
        <Group
          id="d23-f6-root"
          orientation="horizontal"
          defaultLayout={workspaceState.groupLayouts['d23-f6-root']}
          onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f6-root', l)}
        >
          <Panel id="f6-left-2d" defaultSize="48%" minSize="20%" collapsible>
            {render2DFloorPlanPanel()}
          </Panel>
          <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
          <Panel id="f6-right" defaultSize="52%" minSize="25%">
            <Group
              id="d23-f6-right-v"
              orientation="vertical"
              defaultLayout={workspaceState.groupLayouts['d23-f6-right-v']}
              onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f6-right-v', l)}
            >
              <Panel id="f6-right-3d" defaultSize="55%" minSize="25%" collapsible>
                {render3DScenePanel()}
              </Panel>
              <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
              <Panel id="f6-right-bottom" defaultSize="45%" minSize="20%">
                <Group id="d23-f6-right-bot-h" orientation="horizontal">
                  <Panel id="f6-tree" defaultSize="30%" minSize="15%" collapsible>
                    {renderProjectTreePanel()}
                  </Panel>
                  <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
                  <Panel id="f6-attr" defaultSize="40%" minSize="20%" collapsible>
                    {renderAttributesPanel()}
                  </Panel>
                  <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
                  <Panel id="f6-val" defaultSize="30%" minSize="15%" collapsible>
                    {renderValidationPanel()}
                  </Panel>
                </Group>
              </Panel>
            </Group>
          </Panel>
        </Group>
      );
    }

    // KALIP 3: F7 — ÇİZİM ODAKLI
    if (workspaceState.preset === 'F7_CIZIM') {
      return (
        <Group
          id="d23-f7-root"
          orientation="vertical"
          defaultLayout={workspaceState.groupLayouts['d23-f7-root']}
          onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f7-root', l)}
        >
          <Panel id="f7-top" defaultSize="76%" minSize="40%">
            <Group
              id="d23-f7-top-h"
              orientation="horizontal"
              defaultLayout={workspaceState.groupLayouts['d23-f7-top-h']}
              onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f7-top-h', l)}
            >
              <Panel id="f7-2d" defaultSize="72%" minSize="40%">
                {render2DFloorPlanPanel()}
              </Panel>
              <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
              <Panel id="f7-3d-mini" defaultSize="28%" minSize="15%" collapsible>
                {render3DScenePanel()}
              </Panel>
            </Group>
          </Panel>
          <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
          <Panel id="f7-bottom" defaultSize="24%" minSize="12%" collapsible>
            <Group id="d23-f7-bot-h" orientation="horizontal">
              <Panel id="f7-val" defaultSize="50%" minSize="20%">
                {renderValidationPanel()}
              </Panel>
              <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
              <Panel id="f7-attr" defaultSize="50%" minSize="20%">
                {renderAttributesPanel()}
              </Panel>
            </Group>
          </Panel>
        </Group>
      );
    }

    // KALIP 4: F8 — DENETİM ODAKLI
    if (workspaceState.preset === 'F8_DENETIM') {
      return (
        <Group
          id="d23-f8-root"
          orientation="vertical"
          defaultLayout={workspaceState.groupLayouts['d23-f8-root']}
          onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f8-root', l)}
        >
          <Panel id="f8-top" defaultSize="62%" minSize="30%">
            <Group
              id="d23-f8-top-h"
              orientation="horizontal"
              defaultLayout={workspaceState.groupLayouts['d23-f8-top-h']}
              onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f8-top-h', l)}
            >
              <Panel id="f8-tree" defaultSize="18%" minSize="12%" collapsible>
                {renderProjectTreePanel()}
              </Panel>
              <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
              <Panel id="f8-3d" defaultSize="82%" minSize="40%">
                {render3DScenePanel()}
              </Panel>
            </Group>
          </Panel>
          <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
          <Panel id="f8-bottom" defaultSize="38%" minSize="20%">
            <Group id="d23-f8-bot-h" orientation="horizontal">
              <Panel id="f8-val" defaultSize="55%" minSize="25%">
                {renderValidationPanel()}
              </Panel>
              <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
              <Panel id="f8-attr" defaultSize="45%" minSize="25%">
                {renderAttributesPanel()}
              </Panel>
            </Group>
          </Panel>
        </Group>
      );
    }

    // KALIP 1 (VARSAYILAN): F5 — STANDART (D-23.1: Üstte Ağaç ~15% | 2B ~45% | 3B ~40%, Altta Doğrulama | Öznitelik)
    return (
      <Group
        id="d23-f5-root"
        orientation="vertical"
        defaultLayout={workspaceState.groupLayouts['d23-f5-root']}
        onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f5-root', l)}
      >
        <Panel id="f5-top" defaultSize="72%" minSize="35%">
          <Group
            id="d23-f5-top-h"
            orientation="horizontal"
            defaultLayout={workspaceState.groupLayouts['d23-f5-top-h']}
            onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f5-top-h', l)}
          >
            <Panel id="f5-tree" defaultSize="15%" minSize="10%" collapsible>
              {renderProjectTreePanel()}
            </Panel>
            <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
            <Panel id="f5-cad2d" defaultSize="45%" minSize="18%" collapsible>
              {render2DFloorPlanPanel()}
            </Panel>
            <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
            <Panel id="f5-scene3d" defaultSize="40%" minSize="18%" collapsible>
              {render3DScenePanel()}
            </Panel>
          </Group>
        </Panel>
        <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
        <Panel id="f5-bottom" defaultSize="28%" minSize="14%" collapsible>
          <Group
            id="d23-f5-bot-h"
            orientation="horizontal"
            defaultLayout={workspaceState.groupLayouts['d23-f5-bot-h']}
            onLayoutChanged={(l) => handleGroupLayoutChanged('d23-f5-bot-h', l)}
          >
            <Panel id="f5-validation" defaultSize="52%" minSize="20%" collapsible>
              {renderValidationPanel()}
            </Panel>
            <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
            <Panel id="f5-attributes" defaultSize="48%" minSize="20%" collapsible>
              {renderAttributesPanel()}
            </Panel>
          </Group>
        </Panel>
      </Group>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ÜST ARAÇ ÇUBUĞU (D-23.1 & D-23.2 Kalıplar F5-F8) */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-500 text-slate-950">
              TKGM 3B
            </span>
            <h1 className="text-sm font-bold tracking-tight text-slate-100">
              Sayısallaştırma & Denetim Stüdyosu
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              M1 · CityGML 2.0
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <input
            ref={fileInputRef}
            type="file"
            accept=".gml,.xml"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 text-xs font-medium rounded bg-sky-600 hover:bg-sky-500 text-white transition-colors"
          >
            📂 GML Dosyası Aç (.gml)
          </button>
          <button
            type="button"
            onClick={handleResetToOrnek6}
            className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Varsayılan Ornek6-M-70125626-A.gml Referans Modelini Yükle"
          >
            Ornek6 (70125626-A)
          </button>
        </div>

        {/* Orta: KARAR D-23.2 Yerleşim Kalıpları (F5, F6, F7, F8) */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
          {(
            [
              { id: 'F5_STANDART', label: 'F5 Standart' },
              { id: 'F6_YAN_YANA', label: 'F6 Yan Yana' },
              { id: 'F7_CIZIM', label: 'F7 Çizim' },
              { id: 'F8_DENETIM', label: 'F8 Denetim' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setMaximizedPanelId(null);
                setWorkspaceState((prev) => ({ ...prev, preset: preset.id }));
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                workspaceState.preset === preset.id && !isNarrowMode
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSimulateNarrowScreen((v) => !v)}
            title="D-23.2 #5: <1366px Dar Ekran Sekme Modunu Test Et"
            className={`px-2 py-1 text-[11px] font-mono rounded border ml-1 ${
              simulateNarrowScreen
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            &lt;1366px Modu
          </button>
        </div>

        {/* Sağ: K89 CanonicalHash Rozeti ve M0/M1 Denetim Raporu */}
        <div className="flex items-center gap-2">
          <div
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono"
            title={`D-23.4 / K89 Kanonik Model Özeti: ${liveCanonicalHash}`}
          >
            <span className="text-slate-400">K89 Hash:</span>
            <span className="text-emerald-300">{liveCanonicalHash.slice(0, 12)}…</span>
            {isHashInvariantVerified && (
              <span className="text-[10px] text-emerald-400">✓ Sabit</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="px-2.5 py-1 text-xs font-medium rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40"
          >
            📋 M0/M1 Raporu & F1–F12 ({M0_AUDIT_DATA.generatedAtIso.slice(0, 10)})
          </button>
        </div>
      </header>

      {/* ANA 5 PANELLİ ÇALIŞMA ALANI (KARAR D-23) */}
      <main className="flex-1 min-h-0 w-full overflow-hidden">
        {renderMainWorkspace()}
      </main>

      {/* ALT DURUM ÇUBUĞU (D-23.1: EPSG | Koordinat | Aktif Kat | K89 Hash | Hata/Uyarı/Bilgi) */}
      <footer className="flex flex-wrap items-center justify-between gap-2 px-3 py-1 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-slate-200 font-semibold">{model.fileName}</span>
          <span>SRS: {model.srsName}</span>
          <span>
            P_origin: E={model.originTuref.e.toFixed(3)} N={model.originTuref.n.toFixed(3)} Z=
            {model.originTuref.z.toFixed(3)}
          </span>
          <span>
            Aktif Kat:{' '}
            <strong className="text-emerald-300">
              {activeStoreyId
                ? model.objectsById[activeStoreyId]?.gmlName ?? activeStoreyId
                : `Tümü (${objectCounts.K} Kat)`}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Kalıp: <strong className="text-amber-300">{workspaceState.preset}</strong>
          </span>
          <span>
            K89: <strong className="text-emerald-300">{liveCanonicalHash.slice(0, 16)}</strong>
          </span>
          <span className="text-rose-400">H:{issueCounts.H}</span>
          <span className="text-amber-400">U:{issueCounts.U}</span>
          <span className="text-sky-400">B:{issueCounts.B}</span>
        </div>
      </footer>

      {/* M0 / M1 DENETİM VE KANIT MODAL PENCERESİ */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Kaydedilmiş Denetim Çıktısı: {M0_AUDIT_DATA.generatedAtIso}
                </span>
                <h2 className="text-sm font-bold text-slate-100">
                  M0 & M1 Doğrulama Kanıtları, KONTROL-M0 (F1–F12) ve KARAR D-23 Özeti
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-2.5 py-1 text-xs rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                ✕ Kapat
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border-b border-slate-800">
              {(
                [
                  { id: 'kontrol_m0', label: 'KONTROL-M0 (F1–F12)' },
                  { id: 'adim_notu', label: 'docs/ADIM_NOTU.md' },
                  { id: 'kararlar', label: 'docs/KARARLAR.md (D-23 dahil)' },
                  { id: 'codelists', label: '14 Resmi XML Kod Listesi' },
                  { id: 'trace', label: 'K98 İzlenebilirlik Matrisi' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAuditModalTab(t.id)}
                  className={`px-3 py-1 text-xs rounded font-medium ${
                    auditModalTab === t.id
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
              {auditModalTab === 'kontrol_m0' && (
                <div className="space-y-2">
                  {M0_AUDIT_DATA.kontrolM0Findings.map((f) => (
                    <div
                      key={f.code}
                      className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div>
                        <span className="font-bold text-amber-300">{f.code}</span> —{' '}
                        <span className="text-slate-200 font-sans font-medium">
                          {f.summary}
                        </span>
                        <div className="text-slate-400 font-sans mt-1">
                          {f.resolutionNote}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {auditModalTab === 'adim_notu' && (
                <pre className="whitespace-pre-wrap text-slate-200 bg-slate-950 p-3 rounded border border-slate-800">
                  {M0_AUDIT_DATA.docs.adimNotuMd}
                </pre>
              )}

              {auditModalTab === 'kararlar' && (
                <pre className="whitespace-pre-wrap text-slate-200 bg-slate-950 p-3 rounded border border-slate-800">
                  {M0_AUDIT_DATA.docs.kararlarMd}
                </pre>
              )}

              {auditModalTab === 'codelists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
                  {M0_AUDIT_DATA.codelistsDetailed.map((cl) => (
                    <div
                      key={cl.listName}
                      className="p-3 rounded bg-slate-950 border border-slate-800"
                    >
                      <div className="font-bold text-amber-300 font-mono mb-1">
                        {cl.listName}.xml ({cl.entries.length} kod)
                      </div>
                      <div className="space-y-1">
                        {cl.entries.map((e) => (
                          <div
                            key={`${cl.listName}-${e.code}`}
                            className="flex justify-between text-xs border-b border-slate-900 pb-0.5"
                          >
                            <span className="font-mono text-sky-300">{e.code}</span>
                            <span className="text-slate-200">{e.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {auditModalTab === 'trace' && (
                <pre className="whitespace-pre-wrap text-emerald-300 bg-slate-950 p-3 rounded border border-slate-800">
                  {M0_AUDIT_DATA.traceReport.summaryText}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
