// KARAR D-23 (D-23.1–D-23.6) & KONTROL-M1 (G1–G8) — Modüler Ana Pencere Kabuğu ve Web Worker GML Okuyucu
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from 'react-resizable-panels';
import {
  ImportedCityObject,
  ImportedModel,
  parseCityGmlModel,
} from './core/gml/gmlReader.ts';
import { compareCodeUnits, computeCanonicalModelHash } from './core/hash/canonical.ts';
import { Malik } from './core/model/malik.ts';
import { metersToMm, ValidationIssue } from './core/model/index.ts';
import {
  getDefaultOrnek6Model,
  getOfflineCodelistRegistry,
  ORNEK6_RAW_XML,
} from './data/offlineFixtures.ts';
import { M0_AUDIT_DATA } from './generated/m0AuditData.ts';
import { WorkspaceLayout } from './layout/WorkspaceLayout.tsx';
import { AttributePanel } from './panels/AttributePanel.tsx';
import { TreePanel } from './panels/TreePanel.tsx';
import { ValidationPanel } from './panels/ValidationPanel.tsx';
import {
  computeModelIssueCounts,
  computeModelObjectCounts,
  DEFAULT_MALIKLER,
  LayoutPresetId,
  loadPersistedWorkspaceState,
  MaximizedPanelId,
  PersistedWorkspaceState,
  savePersistedWorkspaceState,
} from './state/workspaceState.ts';
import { CityGmlViewport3D } from './viewer3d/CityGmlViewport3D.tsx';
import { validateCityGml, type Finding, type ValidationReport } from './core/validation/index.ts';
import { FloorPlanPreview2D } from './viewer3d/FloorPlanPreview2D.tsx';
import { parseCityGmlInWorker } from './workers/gmlWorkerClient.ts';

interface WorkerReadState {
  fileName: string;
  percent: number;
  phase: string;
  detail: string;
  cancel: () => void;
}

export function App() {
  const [model, setModel] = useState<ImportedModel>(() => getDefaultOrnek6Model());
  // M2: Dosya doğrulayıcı raporu (şartname §6). Okuyucu, arsa payı ve kural bulgularının tamamı.
  const [validation, setValidation] = useState<ValidationReport>(() =>
    validateCityGml(ORNEK6_RAW_XML, 'M-70125626-A.gml', getDefaultOrnek6Model(), getOfflineCodelistRegistry())
  );
  const [selectedGmlId, setSelectedGmlId] = useState<string | null>(() => {
    const m = getDefaultOrnek6Model();
    return m.objects.find((o) => o.prefix === 'BBK_')?.gmlId ?? m.buildingGmlId;
  });
  const [activeStoreyId, setActiveStoreyId] = useState<string | null>(null);
  const [highlightedRulePolygonId, setHighlightedRulePolygonId] = useState<
    string | null
  >(null);

  // G1 (PERF-01): Web Worker okuma durumu, ilerleme çubuğu ve İptal (worker.terminate()) desteği
  const [workerReadState, setWorkerReadState] = useState<WorkerReadState | null>(null);
  const [lastWorkerDurationMs, setLastWorkerDurationMs] = useState<number | null>(null);

  // D-23.2: Yerleşim kalıpları (F5, F6, F7, F8) ve localStorage kalıcılığı
  const [workspaceState, setWorkspaceState] = useState<PersistedWorkspaceState>(
    loadPersistedWorkspaceState
  );
  const [maximizedPanelId, setMaximizedPanelId] = useState<MaximizedPanelId>(null);

  // D-23.2 #5: Küçük ekran (< 1366 px) sekme modu + tek tıkla simülasyon anahtarı
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1600
  );
  const [simulateNarrowScreen, setSimulateNarrowScreen] = useState<boolean>(false);
  const [narrowCenterTab, setNarrowCenterTab] = useState<'2d' | '3d'>('3d');
  const [narrowTreeDrawerOpen, setNarrowTreeDrawerOpen] = useState<boolean>(false);

  // Proje ağacı açık düğümleri ve malik listesi
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [malikler, setMalikler] = useState<Malik[]>(DEFAULT_MALIKLER);

  // M0/M1 Denetim & G1-G8 / F1-F12 Rapor Çekmecesi
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditModalTab, setAuditModalTab] = useState<
    'kontrol_m1' | 'kontrol_m0' | 'adim_notu' | 'kararlar' | 'codelists' | 'trace'
  >('kontrol_m1');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    savePersistedWorkspaceState(workspaceState);
  }, [workspaceState]);

  // F5, F6, F7, F8 klavye kısayolları (D-23.2)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const presetMap: Record<string, LayoutPresetId> = {
        F5: 'F5_STANDART',
        F6: 'F6_YAN_YANA',
        F7: 'F7_CIZIM',
        F8: 'F8_DENETIM',
      };
      const targetPreset = presetMap[e.key];
      if (targetPreset) {
        e.preventDefault();
        setMaximizedPanelId(null);
        setWorkspaceState((prev) => ({ ...prev, preset: targetPreset }));
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

  // G1 (PERF-01): Web Worker üzerinden CityGML okuma (ilerleme çubuğu + İptal düğmesi)
  const loadGmlViaWorker = async (xmlText: string, fileName: string) => {
    if (workerReadState) {
      workerReadState.cancel();
    }
    const job = parseCityGmlInWorker(xmlText, fileName, (progress) => {
      setWorkerReadState((prev) =>
        prev
          ? {
              ...prev,
              percent: progress.percent,
              phase: progress.phase,
              detail: progress.detail ?? '',
            }
          : null
      );
    });

    setWorkerReadState({
      fileName,
      percent: 5,
      phase: 'Web Worker başlatıldı...',
      detail: fileName,
      cancel: () => {
        job.cancel();
        setWorkerReadState(null);
      },
    });

    try {
      const { model: parsed, durationMs, validation: report } = await job.promise;
      setLastWorkerDurationMs(durationMs);
      setModel(parsed);
      setValidation(report);
      setActiveStoreyId(null);
      setHighlightedRulePolygonId(null);
      setSelectedGmlId(
        parsed.objects.find((o) => o.prefix === 'BBK_')?.gmlId ?? parsed.buildingGmlId
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('iptal edildi')) {
        const fallback = parseCityGmlModel(
          xmlText,
          fileName,
          getOfflineCodelistRegistry()
        );
        setModel(fallback);
        setValidation(validateCityGml(xmlText, fileName, fallback, getOfflineCodelistRegistry()));
      }
    } finally {
      setWorkerReadState(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    e.target.value = '';
    await loadGmlViaWorker(text, file.name);
  };

  const handleResetToOrnek6 = () => {
    void loadGmlViaWorker(ORNEK6_RAW_XML, 'M-70125626-A.gml');
  };

  // M2: Panel, doğrulayıcının tüm bulgularını gösterir (okuyucu + arsa payı + §6 kuralları).
  // Önce HATA, sonra UYARI, sonra BİLGİ.
  const allIssues = useMemo(() => {
    const rank = { H: 0, U: 1, B: 2 } as const;
    return [...validation.findings].sort((a, b) => rank[a.severity] - rank[b.severity]);
  }, [validation]);

  const issueCounts = useMemo(() => computeModelIssueCounts(allIssues), [allIssues]);
  const objectCounts = useMemo(
    () => computeModelObjectCounts(model.objects),
    [model.objects]
  );

  const handleIssueClick = (issue: ValidationIssue) => {
    // M2 / D-23.3: Bulgu belirli bir poligonu gösteriyorsa o poligon 3B'de kırmızı vurgulanır.
    const polyId = (issue as Finding).polygonGmlId;
    if (polyId && model.polygonsById[polyId]) {
      setSelectedGmlId(model.polygonsById[polyId].ownerObjectGmlId);
      setHighlightedRulePolygonId(polyId);
      return;
    }
    if (!issue.targetGmlId) return;
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
    const ownerPoly = model.polygons.find(
      (p) =>
        p.exteriorRing.gmlId === issue.targetGmlId ||
        p.interiorRings.some((r) => r.gmlId === issue.targetGmlId)
    );
    if (ownerPoly) {
      setSelectedGmlId(ownerPoly.ownerObjectGmlId);
      setHighlightedRulePolygonId(ownerPoly.gmlId);
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

  const toggleMaximizePanel = (panelId: Exclude<MaximizedPanelId, null>) => {
    setMaximizedPanelId((prev) => (prev === panelId ? null : panelId));
  };

  const isNarrowMode = windowWidth < 1366 || simulateNarrowScreen;

  // Modüler 5 Panel Elemanları (G7)
  const treePanelNode = (
    <TreePanel
      model={model}
      objectCounts={objectCounts}
      selectedGmlId={selectedGmlId}
      activeStoreyId={activeStoreyId}
      expandedNodes={expandedNodes}
      isCollapsed={!!workspaceState.collapsedPanels['tree']}
      maximizedPanelId={maximizedPanelId}
      onSelectGmlId={(gmlId) => {
        setSelectedGmlId(gmlId);
        setHighlightedRulePolygonId(null);
      }}
      onToggleStoreyFilter={(storeyId) => setActiveStoreyId(storeyId)}
      onToggleExpandNode={(gmlId, currentExpanded) =>
        setExpandedNodes((prev) => ({ ...prev, [gmlId]: !currentExpanded }))
      }
      onToggleCollapsePanel={() => toggleCollapsePanel('tree')}
      onToggleMaximizePanel={() => toggleMaximizePanel('tree')}
    />
  );

  const cad2dPanelNode = (
    <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
            2B ÇİZİM & KAT İZDÜŞÜMÜ (M4 Yer Tutucu)
          </span>
        </div>
        <button
          type="button"
          onClick={() => toggleMaximizePanel('cad2d')}
          title="Tam Ekran / Geri Al"
          className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          {maximizedPanelId === 'cad2d' ? '❐' : '□'}
        </button>
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

  const scene3dPanelNode = (
    <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
            3B SAHNE (Three.js Yerel Merkezli TUREF — P_local = P_TUREF − P_origin)
          </span>
        </div>
        <button
          type="button"
          onClick={() => toggleMaximizePanel('scene3d')}
          title="Tam Ekran / Geri Al"
          className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          {maximizedPanelId === 'scene3d' ? '❐' : '□'}
        </button>
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

  const validationPanelNode = (
    <ValidationPanel
      fileName={model.fileName}
      allIssues={allIssues}
      issueCounts={issueCounts}
      maximizedPanelId={maximizedPanelId}
      onIssueClick={handleIssueClick}
      onToggleMaximizePanel={() => toggleMaximizePanel('validation')}
    />
  );

  const attributePanelNode = (
    <AttributePanel
      model={model}
      selectedObject={selectedObject}
      malikler={malikler}
      maximizedPanelId={maximizedPanelId}
      onAddMalik={(m) => setMalikler((prev) => [...prev, m])}
      onToggleMaximizePanel={() => toggleMaximizePanel('attributes')}
    />
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ÜST KOMUT VE KALIP ŞERİDİ (D-23.2 + G1 Web Worker) */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-500 text-slate-950">
              TKGM 3B
            </span>
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white">
              CityGML 2.0 Dijital Bina Studiyosu
            </h1>
            <span className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              M1 · G1–G8 · KARAR D-23
            </span>
          </div>

          {/* GML Dosya Yükleme + Web Worker Test Düğmesi */}
          <div className="flex items-center gap-1">
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
              className="px-2 py-1 text-[11px] font-medium rounded bg-sky-600 hover:bg-sky-500 text-white transition-colors"
            >
              📂 GML Aç (Worker)
            </button>
            <button
              type="button"
              onClick={handleResetToOrnek6}
              title="Ornek6.gml dosyasını Web Worker üzerinden (Transferable Float64Array ile) yeniden ayrıştır"
              className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              ⚡ Ornek6 (Worker{lastWorkerDurationMs !== null ? ` · ${lastWorkerDurationMs}ms` : ''})
            </button>
          </div>
        </div>

        {/* D-23.2: 4 Hazır Yerleşim Kalıbı (F5, F6, F7, F8) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
          {(
            [
              { id: 'F5_STANDART', label: 'F5 Standart', desc: 'Ağaç + 2B + 3B + Alt' },
              { id: 'F6_YAN_YANA', label: 'F6 Yan Yana (2B+3B)', desc: '%50 2B + %50 3B' },
              { id: 'F7_CIZIM', label: 'F7 Çizim Odaklı', desc: '%72 2B + %28 3B' },
              { id: 'F8_DENETIM', label: 'F8 Denetim Odaklı', desc: 'Ağaç + 3B + Geniş Denetim' },
            ] as const
          ).map((p) => {
            const active = workspaceState.preset === p.id && !isNarrowMode;
            return (
              <button
                key={p.id}
                type="button"
                title={p.desc}
                onClick={() => {
                  setMaximizedPanelId(null);
                  setSimulateNarrowScreen(false);
                  setWorkspaceState((prev) => ({ ...prev, preset: p.id }));
                }}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                  active
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSimulateNarrowScreen((prev) => !prev)}
            title="D-23.2 #5: < 1366 px Küçük Ekran Sekmeli Modu Test Et"
            className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
              isNarrowMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {isNarrowMode ? '📱 <1366px Aktif' : '🖥️ <1366px Test'}
          </button>
        </div>

        {/* Sağ Durum & M0/M1 Rapor Düğmesi */}
        <div className="flex items-center gap-2">
          <div
            title={`K89 CanonicalModelHash: ${liveCanonicalHash}\nD-23.4 Kalıp Değişmezliği: ${
              isHashInvariantVerified ? 'DOĞRULANDI' : 'UYUŞMAZLIK'
            }`}
            className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">K89 Hash:</span>
            <span className="text-emerald-300">{liveCanonicalHash.slice(0, 12)}…</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="px-2.5 py-1 text-[11px] font-medium rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
          >
            📋 KONTROL-M1 (G1–G8) & ADIM_NOTU
          </button>
        </div>
      </header>

      {/* G1 (PERF-01): WEB WORKER OKUMA İLERLEME ÇUBUĞU VE İPTAL DÜĞMESİ */}
      {workerReadState && (
        <div className="px-4 py-2 bg-sky-950/90 border-b border-sky-500/40 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-sky-500 text-slate-950 shrink-0">
              WEB WORKER (G1)
            </span>
            <span className="text-xs font-medium text-sky-100 truncate">
              {workerReadState.fileName} — {workerReadState.phase}{' '}
              {workerReadState.detail ? `(${workerReadState.detail})` : ''}
            </span>
            <div className="flex-1 max-w-md h-2 bg-slate-900 rounded-full overflow-hidden border border-sky-500/30">
              <div
                className="h-full bg-sky-400 transition-all duration-150"
                style={{ width: `${Math.max(5, Math.min(100, workerReadState.percent))}%` }}
              />
            </div>
            <span className="text-xs font-mono text-sky-300 shrink-0">
              %{workerReadState.percent}
            </span>
          </div>
          <button
            type="button"
            onClick={workerReadState.cancel}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white shrink-0"
          >
            ✕ İptal (worker.terminate)
          </button>
        </div>
      )}

      {/* ANA ÇALIŞMA ALANI (Modüler WorkspaceLayout — G7 & D-23) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <WorkspaceLayout
          workspaceState={workspaceState}
          maximizedPanelId={maximizedPanelId}
          isNarrowMode={isNarrowMode}
          narrowCenterTab={narrowCenterTab}
          narrowTreeDrawerOpen={narrowTreeDrawerOpen}
          onSetNarrowCenterTab={setNarrowCenterTab}
          onToggleNarrowTreeDrawer={() => setNarrowTreeDrawerOpen((prev) => !prev)}
          onGroupLayoutChanged={handleGroupLayoutChanged}
          treePanel={treePanelNode}
          cad2dPanel={cad2dPanelNode}
          scene3dPanel={scene3dPanelNode}
          validationPanel={validationPanelNode}
          attributesPanel={attributePanelNode}
        />
      </div>

      {/* ALT DURUM ÇUBUĞU */}
      <footer className="flex flex-wrap items-center justify-between gap-2 px-3 py-1 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-slate-200 font-semibold">{model.fileName}</span>
          <span>SRS: {model.srsName}</span>
          <span>Yapı: {model.constructionID}</span>
          <span>
            Profil: <strong className="text-amber-300">{model.detectedProducerProfile}</strong> (Kat:{' '}
            {model.detectedStoreyForm}, Kapı Ofseti:{' '}
            {model.detectedDoorBottomOffsetMm !== null
              ? `+${model.detectedDoorBottomOffsetMm} mm`
              : 'ölçülemedi'}
            )
          </span>
          <span>
            Arsa Payı:{' '}
            <strong className="text-emerald-300">
              {model.landShareAnalysis.formattedTotalUnreduced}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            Seçili:{' '}
            <strong className="text-amber-300">{selectedObject?.gmlId ?? 'Yok'}</strong>
          </span>
          <span className="text-emerald-400">
            D-23.4 K89 Hash Değişmezliği: {isHashInvariantVerified ? 'DOĞRULANDI ✓' : 'HATA'}
          </span>
        </div>
      </footer>

      {/* KONTROL-M1 (G1-G8) & KONTROL-M0 (F1-F12) & ADIM_NOTU DENETİM ÇEKMECESİ */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  M0 + M1 DOĞRULAMA KAYDI
                </span>
                <span className="text-sm font-semibold text-white">
                  KONTROL-M1 (G1–G8), KONTROL-M0 (F1–F12) ve Gerçek Konsol Çıktıları
                </span>
                <span className="text-xs font-mono text-slate-400">
                  (Kaydedilmiş Çıktı: {M0_AUDIT_DATA.generatedAtIso})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                ✕ Kapat
              </button>
            </div>

            <div className="flex items-center gap-1 px-4 py-2 bg-slate-900 border-b border-slate-800">
              {(
                [
                  { id: 'kontrol_m1', label: 'KONTROL-M1 (G1–G8)' },
                  { id: 'kontrol_m0', label: 'KONTROL-M0 (F1–F12)' },
                  { id: 'adim_notu', label: 'docs/ADIM_NOTU.md' },
                  { id: 'kararlar', label: 'docs/KARARLAR.md (D-23 Dahil)' },
                  { id: 'codelists', label: '14 Resmi Kod Listesi (K60)' },
                  { id: 'trace', label: 'K98 İzlenebilirlik' },
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

            <div className="flex-1 overflow-y-auto p-4 text-xs">
              {auditModalTab === 'kontrol_m1' && (
                <table className="w-full text-left border-collapse border border-slate-800">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                      <th className="p-2">Kod</th>
                      <th className="p-2">Önem</th>
                      <th className="p-2">Durum</th>
                      <th className="p-2">Bulgu ve Uygulanan Çözüm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {M0_AUDIT_DATA.kontrolM1Findings.map((g) => (
                      <tr key={g.code} className="hover:bg-slate-800/40">
                        <td className="p-2 font-mono font-bold text-amber-300">{g.code}</td>
                        <td className="p-2 text-slate-400">{g.severity}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[11px]">
                            {g.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-200">
                          <div className="font-semibold">{g.summary}</div>
                          <div className="text-slate-400 mt-0.5">{g.resolutionNote}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {auditModalTab === 'kontrol_m0' && (
                <table className="w-full text-left border-collapse border border-slate-800">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                      <th className="p-2">Kod</th>
                      <th className="p-2">Önem</th>
                      <th className="p-2">Durum</th>
                      <th className="p-2">Bulgu ve Uygulanan Çözüm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {M0_AUDIT_DATA.kontrolM0Findings.map((f) => (
                      <tr key={f.code} className="hover:bg-slate-800/40">
                        <td className="p-2 font-mono font-bold text-amber-300">{f.code}</td>
                        <td className="p-2 text-slate-400">{f.severity}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[11px]">
                            {f.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-200">
                          <div className="font-semibold">{f.summary}</div>
                          <div className="text-slate-400 mt-0.5">{f.resolutionNote}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {auditModalTab === 'adim_notu' && (
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-200 whitespace-pre-wrap">
                  {M0_AUDIT_DATA.docs.adimNotuMd}
                </pre>
              )}

              {auditModalTab === 'kararlar' && (
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-200 whitespace-pre-wrap">
                  {M0_AUDIT_DATA.docs.kararlarMd}
                </pre>
              )}

              {auditModalTab === 'codelists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {M0_AUDIT_DATA.codelistsDetailed.map((cl) => (
                    <div
                      key={cl.listName}
                      className="p-3 bg-slate-950 border border-slate-800 rounded"
                    >
                      <div className="font-mono font-bold text-amber-300 mb-1">
                        {cl.listName}.xml ({cl.entries.length} kayıt)
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-slate-800/60 font-mono text-[11px]">
                        {cl.entries.map((e, i) => (
                          <div key={`${e.code}-${i}`} className="py-1 flex justify-between">
                            <span className="text-sky-300">{e.code}</span>
                            <span className="text-slate-200 font-sans">{e.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {auditModalTab === 'trace' && (
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-emerald-300 whitespace-pre-wrap">
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
