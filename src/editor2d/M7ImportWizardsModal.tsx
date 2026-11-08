// M7 — Konumlandırma (Helmert & TIC), DXF İçe Aktarma, Raster Altlık Kalibrasyonu ve Liste Beyan / Malik Sihirbazı
// (şartname §7.3, §8.1, §8.2, §8.4, §11, KARAR D-23.5, K88-yeni, OY-04, OY-06).
import React, { useMemo, useState } from 'react';
import type { CodelistRegistry } from '../core/codelists/index.ts';
import type { DesignProject, IndependentSection, Ring2 } from '../core/design/types.ts';
import type { HelmertControlPair } from '../core/math/helmert2d.ts';
import type { Malik } from '../core/model/malik.ts';
import { validateBbMalikShares } from '../core/model/malik.ts';
import {
  applyApprovedListeBeyanToProject,
  applyHelmertWizardToProject,
  calibrateRasterAxes,
  DxfLayerMappingRule,
  DxfLayerMappingTable,
  DxfTargetRole,
  DxfUnit,
  exportDesignStoreyToDxf,
  generateListeBeyanTemplateCsv,
  georeferenceDxfDocument,
  importDxfIntoDesignStorey,
  parseDxfText,
  ParsedDxfDocument,
  parseListeBeyanText,
  parseSurveyPointsText,
  RasterAxisMeasurement,
  runHelmertGeorefWizard,
  suggestEpsgFromLongitude,
  suggestRoleForDxfLayerName,
  TurefEpsgCode,
} from '../core/importers/index.ts';

export interface CalibratedRasterUnderlay {
  readonly dataUrl: string;
  readonly fileName: string;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly scaleXMmPerPx: number;
  readonly scaleYMmPerPx: number;
  readonly rotationDeg: number;
  readonly offsetXMm: number;
  readonly offsetYMm: number;
  readonly opacity: number;
}

export interface M7ImportWizardsModalProps {
  readonly project: DesignProject;
  readonly activeStoreyId: string | null;
  readonly malikler: readonly Malik[];
  readonly codelists: CodelistRegistry;
  readonly onUpdateProject: (nextProject: DesignProject, summaryMessage: string) => void;
  readonly onUpdateMalikler: (nextMalikler: readonly Malik[]) => void;
  readonly onSetDxfUnderlay: (rings: readonly Ring2[], fileName: string) => void;
  readonly onSetRasterUnderlay: (underlay: CalibratedRasterUnderlay | null) => void;
  readonly rasterUnderlay: CalibratedRasterUnderlay | null;
  readonly onClose: () => void;
}

type WizardTab = 'helmert' | 'dxf' | 'raster' | 'listebeyan';

const EPSG_OPTIONS: readonly { code: TurefEpsgCode; label: string }[] = [
  { code: 5253, label: 'EPSG:5253 (TM27 — Batı)' },
  { code: 5254, label: 'EPSG:5254 (TM30 — İstanbul/Bursa/İzmir)' },
  { code: 5255, label: 'EPSG:5255 (TM33 — Ankara/Konya/Antalya)' },
  { code: 5256, label: 'EPSG:5256 (TM36 — Kayseri/Adana/Samsun)' },
  { code: 5257, label: 'EPSG:5257 (TM39 — Trabzon/Erzurum/Gaziantep)' },
  { code: 5258, label: 'EPSG:5258 (TM42 — Van/Diyarbakır/Kars)' },
  { code: 5259, label: 'EPSG:5259 (TM45 — Hakkari/Iğdır)' },
];

const DXF_ROLES: readonly { value: DxfTargetRole; label: string }[] = [
  { value: 'kat_siniri', label: 'Kat dış sınırı (Storey outline)' },
  { value: 'bb', label: 'Bağımsız Bölüm parçası (BB)' },
  { value: 'kisim', label: 'Kısım / Oda (BBK)' },
  { value: 'oa', label: 'Ortak Alan (OA)' },
  { value: 'balkon', label: 'Balkon / Teras (BLKN/TRS)' },
  { value: 'kapi', label: 'Kapı açıklığı (KAPI)' },
  { value: 'pencere', label: 'Pencere açıklığı (PEN)' },
  { value: 'sutun', label: 'Sütun / Kolon (>50 cm 12-gen K63)' },
  { value: 'tic', label: 'Yapı Aplikasyon (TIC)' },
  { value: 'altlik', label: 'Yalnız 2B Altlık (Çizim referansı)' },
  { value: 'yok_say', label: 'Yok say' },
];

export const M7ImportWizardsModal: React.FC<M7ImportWizardsModalProps> = ({
  project,
  activeStoreyId,
  malikler,
  codelists,
  onUpdateProject,
  onUpdateMalikler,
  onSetDxfUnderlay,
  onSetRasterUnderlay,
  rasterUnderlay,
  onClose,
}) => {
  const [tab, setTab] = useState<WizardTab>('dxf');
  const [statusBanner, setStatusBanner] = useState<{ kind: 'ok' | 'error' | 'info'; text: string } | null>(null);

  const b = project.buildings[0];
  const targetStoreyId = activeStoreyId ?? b?.storeys[0]?.id ?? '';
  const partOptions = codelists.getList('partUsage').entries;

  // ---- SEKME 1: HELMERT VE KONUMLANDIRMA DURUMU ----
  const [epsg, setEpsg] = useState<TurefEpsgCode>(project.georef.epsg);
  const [lonInput, setLonInput] = useState<string>('32.85');
  const [zeroElevMeters, setZeroElevMeters] = useState<string>(
    ((project.georef.zeroElevationOrthometric || 1095900) / 1000).toFixed(3)
  );
  const [thresholdCm, setThresholdCm] = useState<string>('5.0');
  const [transformExisting, setTransformExisting] = useState<boolean>(false);
  const [pairsText, setPairsText] = useState<string>(
    [
      '# ID; localX(m); localY(m); targetE(Y); targetN(X)',
      'K1; 0.000; 0.000; 450171.240; 4414908.840',
      'K2; 8.300; 0.000; 450179.540; 4414908.840',
      'K3; 8.300; 11.005; 450179.540; 4414919.845',
      'K4; 0.000; 11.005; 450171.240; 4414919.845',
    ].join('\n')
  );
  const [surveyText, setSurveyText] = useState<string>(
    (b?.tic ?? []).length > 0
      ? b!.tic!
          .map(
            (p, idx) =>
              `A${idx + 1}; ${(project.georef.originE + p.x / 1000).toFixed(3)}; ${(
                project.georef.originN +
                p.y / 1000
              ).toFixed(3)}; ${(p.z / 1000).toFixed(3)}`
          )
          .join('\n')
      : ''
  );

  const parsedControlPairs = useMemo((): { pairs: HelmertControlPair[]; error: string | null } => {
    try {
      const lines = pairsText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#'));
      const out: HelmertControlPair[] = [];
      for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(/[;\t,]+|\s+/).map((x) => x.trim()).filter(Boolean);
        if (cols.length < 4) continue;
        const hasId = cols.length >= 5;
        const id = hasId ? cols[0] : `N${out.length + 1}`;
        const lx = Number((hasId ? cols[1] : cols[0]).replace(',', '.'));
        const ly = Number((hasId ? cols[2] : cols[1]).replace(',', '.'));
        const te = Number((hasId ? cols[3] : cols[2]).replace(',', '.'));
        const tn = Number((hasId ? cols[4] : cols[3]).replace(',', '.'));
        if (![lx, ly, te, tn].every(Number.isFinite)) {
          return { pairs: [], error: `Satır ${i + 1}: Geçersiz sayısal değer.` };
        }
        out.push({ id, localX: lx, localY: ly, targetE: te, targetN: tn });
      }
      return { pairs: out, error: null };
    } catch (e) {
      return { pairs: [], error: (e as Error).message };
    }
  }, [pairsText]);

  const helmertPreview = useMemo(() => {
    if (parsedControlPairs.error || parsedControlPairs.pairs.length < 2) return null;
    try {
      const surveyPts = surveyText.trim() ? parseSurveyPointsText(surveyText) : [];
      const zMm = Math.round((Number(zeroElevMeters.replace(',', '.')) || 0) * 1000);
      const thrMm = Math.max(1, (Number(thresholdCm.replace(',', '.')) || 5) * 10);
      return runHelmertGeorefWizard({
        pairs: parsedControlPairs.pairs,
        surveyPoints: surveyPts,
        epsg,
        zeroElevationOrthometricMm: zMm,
        maxResidualThresholdMm: thrMm,
      });
    } catch {
      return null;
    }
  }, [parsedControlPairs, surveyText, zeroElevMeters, thresholdCm, epsg]);

  // ---- SEKME 2: DXF İÇE AKTARMA DURUMU ----
  const [dxfFileName, setDxfFileName] = useState<string>('ornek6_kat_plan.dxf');
  const [dxfUnitOverride, setDxfUnitOverride] = useState<'auto' | DxfUnit>('auto');
  const [dxfUseHelmert, setDxfUseHelmert] = useState<boolean>(false);
  const [dxfRawText, setDxfRawText] = useState<string>(() => {
    try {
      return exportDesignStoreyToDxf(project, targetStoreyId);
    } catch {
      return '';
    }
  });
  const [layerRules, setLayerRules] = useState<Record<string, DxfLayerMappingRule>>({});

  const parsedDxf: ParsedDxfDocument | null = useMemo(() => {
    if (!dxfRawText.trim()) return null;
    try {
      const doc = parseDxfText(dxfRawText, {
        fallbackUnit: 'm',
        overrideUnit: dxfUnitOverride === 'auto' ? undefined : dxfUnitOverride,
      });
      return doc;
    } catch {
      return null;
    }
  }, [dxfRawText, dxfUnitOverride]);

  const effectiveLayerMapping: DxfLayerMappingTable = useMemo(() => {
    if (!parsedDxf) return {};
    const out: Record<string, DxfLayerMappingRule> = {};
    for (const layer of parsedDxf.layers) {
      out[layer] = layerRules[layer] ?? suggestRoleForDxfLayerName(layer);
    }
    return out;
  }, [parsedDxf, layerRules]);

  // ---- SEKME 3: RASTER KALİBRASYON DURUMU ----
  const [rasterImg, setRasterImg] = useState<{
    dataUrl: string;
    fileName: string;
    widthPx: number;
    heightPx: number;
  } | null>(
    rasterUnderlay
      ? {
          dataUrl: rasterUnderlay.dataUrl,
          fileName: rasterUnderlay.fileName,
          widthPx: rasterUnderlay.widthPx,
          heightPx: rasterUnderlay.heightPx,
        }
      : null
  );
  const [rasterOpacity, setRasterOpacity] = useState<number>(rasterUnderlay?.opacity ?? 0.45);
  const [rasterOffsetXMm, setRasterOffsetXMm] = useState<string>(String(rasterUnderlay?.offsetXMm ?? 0));
  const [rasterOffsetYMm, setRasterOffsetYMm] = useState<string>(String(rasterUnderlay?.offsetYMm ?? 0));
  const [rasterMeasurements, setRasterMeasurements] = useState<RasterAxisMeasurement[]>([
    { id: 'X1', axis: 'X', p1: { u: 100, v: 100 }, p2: { u: 515, v: 100 }, declaredMeters: 8.3 },
    { id: 'X2', axis: 'X', p1: { u: 100, v: 500 }, p2: { u: 317.5, v: 500 }, declaredMeters: 4.35 },
    { id: 'Y1', axis: 'Y', p1: { u: 100, v: 100 }, p2: { u: 100, v: 650.25 }, declaredMeters: 11.005 },
    { id: 'Y2', axis: 'Y', p1: { u: 400, v: 100 }, p2: { u: 400, v: 350 }, declaredMeters: 5.0 },
  ]);
  const [checkDistMeters, setCheckDistMeters] = useState<string>('13.784');

  const rasterCalibPreview = useMemo(() => {
    try {
      return calibrateRasterAxes(rasterMeasurements, {
        checkMeasurement: {
          p1: { u: 100, v: 100 },
          p2: { u: 515, v: 650.25 },
          declaredMeters: Number(checkDistMeters.replace(',', '.')) || 13.784,
        },
      });
    } catch {
      return null;
    }
  }, [rasterMeasurements, checkDistMeters]);

  // ---- SEKME 4: LİSTE BEYAN VE MALİKLER (K88-yeni, OY-06) ----
  const [listeCsvText, setListeCsvText] = useState<string>(() =>
    generateListeBeyanTemplateCsv(project, malikler)
  );
  const [otomatikOneri, setOtomatikOneri] = useState<'kapali' | 'acik'>('kapali');

  const parsedListePreview = useMemo(() => {
    if (!listeCsvText.trim()) return null;
    try {
      return parseListeBeyanText(listeCsvText);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [listeCsvText]);

  // Serbest düzenleme yardımcı fonksiyonları (K88-yeni)
  const updateSectionField = (secId: string, patch: Partial<IndependentSection>) => {
    if (!b) return;
    const nextBuilding = {
      ...b,
      sections: b.sections.map((s) => (s.id === secId ? { ...s, ...patch } : s)),
    };
    onUpdateProject(
      { ...project, buildings: project.buildings.map((x, i) => (i === 0 ? nextBuilding : x)) },
      'Bağımsız bölüm beyan bilgisi güncellendi (K88-yeni).'
    );
  };

  const handleLoadDxfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const text = await f.text();
    setDxfFileName(f.name);
    setDxfRawText(text);
    setLayerRules({});
    setStatusBanner({ kind: 'info', text: `"${f.name}" okundu (${(text.length / 1024).toFixed(1)} KB).` });
  };

  const handleApplyDxfImport = (onlyUnderlay: boolean) => {
    if (!parsedDxf) return;
    try {
      const helmertToUse =
        dxfUseHelmert && helmertPreview ? helmertPreview.helmert : undefined;
      const georefRes = georeferenceDxfDocument(parsedDxf, {
        epsg,
        zeroElevationOrthometricMm: Math.round((Number(zeroElevMeters.replace(',', '.')) || 1095.9) * 1000),
        helmert: helmertToUse,
        targetGeoref: parsedDxf.isAlreadyTuref || helmertToUse ? undefined : project.georef,
      });

      onSetDxfUnderlay(georefRes.allUnderlayRingsMm, dxfFileName);
      if (onlyUnderlay) {
        setStatusBanner({
          kind: 'ok',
          text: `DXF altlık katmanı güncellendi: ${georefRes.allUnderlayRingsMm.length} kapalı halka (${dxfFileName}).`,
        });
        return;
      }

      const summary = importDxfIntoDesignStorey(
        project,
        georefRes,
        targetStoreyId,
        effectiveLayerMapping
      );
      onUpdateProject(
        summary.project,
        `DXF içe aktarıldı: Kat sınırı ${summary.importedStoreyOutlines}, BB ${summary.importedSectionParts}, Kısım/OA ${summary.importedParts}, Açıklık ${summary.importedOpenings}, Balkon ${summary.importedBalconies}.`
      );
      setStatusBanner({
        kind: 'ok',
        text: `DXF katmanları hedef kata aktarıldı: ${summary.importedStoreyOutlines} kat sınırı, ${summary.importedSectionParts} BB, ${summary.importedParts} kısım/OA, ${summary.importedOpenings} açıklık.`,
      });
    } catch (err) {
      setStatusBanner({ kind: 'error', text: (err as Error).message });
    }
  };

  const handleLoadRasterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      const img = new Image();
      img.onload = () => {
        setRasterImg({
          dataUrl,
          fileName: f.name,
          widthPx: img.naturalWidth || 1000,
          heightPx: img.naturalHeight || 800,
        });
        setStatusBanner({
          kind: 'info',
          text: `Raster kat planı yüklendi: ${f.name} (${img.naturalWidth}×${img.naturalHeight} px).`,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  };

  const handleApplyRasterUnderlay = () => {
    if (!rasterCalibPreview) return;
    // Eğer kullanıcı dosya seçmediyse sentetik ızgara/mimari plan SVG veri URL'si oluştur
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="#f8fafc"/><rect x="100" y="100" width="415" height="550" fill="none" stroke="#0284c7" stroke-width="4" stroke-dasharray="10 6"/><line x1="100" y1="375" x2="515" y2="375" stroke="#0284c7" stroke-width="2"/><line x1="307" y1="100" x2="307" y2="650" stroke="#0284c7" stroke-width="2"/><text x="307" y="90" text-anchor="middle" font-family="monospace" font-size="16" fill="#0369a1">KALİBRE RASTER ALTLIK (8.30m × 11.005m)</text></svg>`;
    const dataUrl =
      rasterImg?.dataUrl ??
      `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;
    const widthPx = rasterImg?.widthPx ?? 800;
    const heightPx = rasterImg?.heightPx ?? 800;
    const fileName = rasterImg?.fileName ?? 'kalibre_mimari_plan.svg';

    onSetRasterUnderlay({
      dataUrl,
      fileName,
      widthPx,
      heightPx,
      scaleXMmPerPx: rasterCalibPreview.scaleXMmPerPx,
      scaleYMmPerPx: rasterCalibPreview.scaleYMmPerPx,
      rotationDeg: rasterCalibPreview.rotationDeg,
      offsetXMm: Number(rasterOffsetXMm) || 0,
      offsetYMm: Number(rasterOffsetYMm) || 0,
      opacity: rasterOpacity,
    });
    setStatusBanner({
      kind: 'ok',
      text: `Raster altlık kalibre edildi: X=${rasterCalibPreview.scaleXMmPerPx.toFixed(2)} mm/px, Y=${rasterCalibPreview.scaleYMmPerPx.toFixed(2)} mm/px, maks. artık=${rasterCalibPreview.maxResidualMm.toFixed(1)} mm.`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 text-xs text-slate-200"
      role="dialog"
      aria-label="M7 Konumlandırma ve İçe Aktarma Sihirbazı"
    >
      <div className="flex flex-col w-full max-w-5xl max-h-[90vh] rounded border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Üst Başlık ve Sekmeler */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm text-amber-400">
              M7 — Konumlandırma, DXF / Raster İçe Aktarma ve Liste Beyan
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              EPSG:{project.georef.epsg} · Köken ({project.georef.originE}, {project.georef.originN}) · ±0.00={(project.georef.zeroElevationOrthometric / 1000).toFixed(3)} m
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
          >
            Kapat (Esc)
          </button>
        </div>

        <div className="flex gap-1 px-4 pt-2 border-b border-slate-800 bg-slate-950/60">
          {(
            [
              { id: 'dxf', label: '1. DXF İçe Aktarma & Katman Eşleme (§8.2)' },
              { id: 'helmert', label: '2. Konumlandırma (Helmert & TIC Sihirbazı §7.3)' },
              { id: 'raster', label: '3. Raster Plan Kalibrasyonu (§8.1)' },
              { id: 'listebeyan', label: '4. Liste Beyan & Malik Listesi (§8.4, K88-yeni)' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-t border-t border-x text-xs font-medium ${
                tab === t.id
                  ? 'bg-slate-900 border-slate-700 text-amber-300'
                  : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {statusBanner && (
          <div
            className={`px-4 py-1.5 text-xs border-b ${
              statusBanner.kind === 'error'
                ? 'bg-red-950/80 border-red-800 text-red-200'
                : statusBanner.kind === 'ok'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                : 'bg-sky-950/80 border-sky-800 text-sky-200'
            }`}
          >
            {statusBanner.text}
          </div>
        )}

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SEKME 1: DXF İÇE AKTARMA */}
          {tab === 'dxf' && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5 space-y-3">
                <div className="p-3 rounded border border-slate-800 bg-slate-950 space-y-2">
                  <div className="font-semibold text-slate-100">DXF Dosyası Seç veya Üret (§8.2)</div>
                  <div className="flex flex-wrap gap-1.5">
                    <label className="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white cursor-pointer">
                      DXF Dosyası Yükle (.dxf)
                      <input type="file" accept=".dxf" className="hidden" onChange={(e) => void handleLoadDxfFile(e)} />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const txt = exportDesignStoreyToDxf(project, targetStoreyId);
                        setDxfFileName(`Kat_${b?.storeys.find((s) => s.id === targetStoreyId)?.storeyNumber ?? 'Z'}_TUREF.dxf`);
                        setDxfRawText(txt);
                        setDxfUseHelmert(false);
                        setStatusBanner({ kind: 'info', text: 'Aktif katın TUREF DXF temsili oluşturuldu.' });
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    >
                      Aktif Katı DXF'e Çevir
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="block">
                      <span className="text-[10px] text-slate-400">Birim ($INSUNITS)</span>
                      <select
                        value={dxfUnitOverride}
                        onChange={(e) => setDxfUnitOverride(e.target.value as 'auto' | DxfUnit)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1.5 py-1"
                      >
                        <option value="auto">Otomatik ($INSUNITS: {parsedDxf?.detectedInsUnits ?? 'yok'} → {parsedDxf?.effectiveUnit ?? 'm'})</option>
                        <option value="m">Metre (m — kod 6)</option>
                        <option value="cm">Santimetre (cm — kod 5)</option>
                        <option value="mm">Milimetre (mm — kod 4)</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-1.5 pt-4">
                      <input
                        type="checkbox"
                        checked={dxfUseHelmert}
                        onChange={(e) => setDxfUseHelmert(e.target.checked)}
                      />
                      <span>Yerel CAD → Helmert uygula</span>
                    </label>
                  </div>

                  {parsedDxf && (
                    <div className="text-[11px] font-mono p-2 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div>Dosya: {dxfFileName} · Varlık: {parsedDxf.entities.length} · Katman: {parsedDxf.layers.length}</div>
                      <div className={parsedDxf.isAlreadyTuref ? 'text-emerald-400' : 'text-amber-300'}>
                        Koordinat Sistemi: {parsedDxf.isAlreadyTuref ? 'Doğrudan TUREF TM (Helmert gerekmez)' : 'Yerel CAD Koordinatı (Helmert önerilir)'}
                      </div>
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="text-[10px] text-slate-400">Ham DXF içeriği (önizleme / düzenleme)</span>
                  <textarea
                    value={dxfRawText}
                    onChange={(e) => setDxfRawText(e.target.value)}
                    rows={8}
                    className="w-full mt-0.5 p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[10px]"
                  />
                </label>
              </div>

              <div className="col-span-7 space-y-3">
                <div className="p-3 rounded border border-slate-800 bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">DXF Katman Eşleme Tablosu (§8.2)</span>
                    <span className="text-[11px] text-slate-400">
                      Hedef Kat: Kat_{b?.storeys.find((s) => s.id === targetStoreyId)?.storeyNumber ?? 'Z'}
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-slate-800 rounded">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-900 text-[10px] text-slate-400">
                        <tr>
                          <th className="p-1.5 border-b border-slate-800">DXF Katmanı</th>
                          <th className="p-1.5 border-b border-slate-800">Hedef Rol</th>
                          <th className="p-1.5 border-b border-slate-800">Kullanım / BB Eşlemesi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(parsedDxf?.layers ?? []).map((layer) => {
                          const rule = effectiveLayerMapping[layer] ?? { role: 'altlik' };
                          return (
                            <tr key={layer} className="border-b border-slate-800/60">
                              <td className="p-1.5 font-mono text-[11px]">{layer}</td>
                              <td className="p-1.5">
                                <select
                                  value={rule.role}
                                  onChange={(e) =>
                                    setLayerRules((prev) => ({
                                      ...prev,
                                      [layer]: { ...rule, role: e.target.value as DxfTargetRole },
                                    }))
                                  }
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                                >
                                  {DXF_ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>
                                      {r.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-1.5">
                                {(rule.role === 'kisim' || rule.role === 'oa') && (
                                  <select
                                    value={rule.usageCode ?? (rule.role === 'kisim' ? 1001 : 1022)}
                                    onChange={(e) =>
                                      setLayerRules((prev) => ({
                                        ...prev,
                                        [layer]: { ...rule, usageCode: Number(e.target.value) },
                                      }))
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                                  >
                                    {partOptions.map((o) => (
                                      <option key={o.code} value={o.code}>
                                        {o.code} {o.description}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {rule.role === 'bb' && (
                                  <select
                                    value={rule.sectionIdOrNumber ?? b?.sections[0]?.id ?? ''}
                                    onChange={(e) =>
                                      setLayerRules((prev) => ({
                                        ...prev,
                                        [layer]: { ...rule, sectionIdOrNumber: e.target.value },
                                      }))
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                                  >
                                    {b?.sections.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        BB {s.number} ({s.registeredQuality})
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleApplyDxfImport(true)}
                      className="flex-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    >
                      Yalnız 2B DXF Altlık Olarak Göster (D-23.5)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyDxfImport(false)}
                      className="flex-1 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold"
                    >
                      Katman Eşlemesiyle Tasarım Modeline Aktar (§8.2)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEKME 2: HELMERT VE TIC SİHİRBAZI */}
          {tab === 'helmert' && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 space-y-3">
                <div className="p-3 rounded border border-slate-800 bg-slate-950 space-y-2">
                  <div className="font-semibold text-slate-100">CRS / EPSG Seçimi ve Boylamdan Dilim Önerisi (§7.3, K07)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[10px] text-slate-400">TUREF TM EPSG Kodu</span>
                      <select
                        value={epsg}
                        onChange={(e) => setEpsg(Number(e.target.value) as TurefEpsgCode)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1.5 py-1"
                      >
                        {EPSG_OPTIONS.map((o) => (
                          <option key={o.code} value={o.code}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div>
                      <span className="text-[10px] text-slate-400">Boylamdan (λ) otomatik öner</span>
                      <div className="flex gap-1 mt-0.5">
                        <input
                          value={lonInput}
                          onChange={(e) => setLonInput(e.target.value)}
                          className="w-24 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 font-mono"
                          placeholder="32.85"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const lon = Number(lonInput.replace(',', '.'));
                            if (Number.isFinite(lon)) {
                              const s = suggestEpsgFromLongitude(lon);
                              setEpsg(s.epsg);
                              setStatusBanner({
                                kind: 'info',
                                text: `Boylam ${lon}° → DOM ${s.dom}° → EPSG:${s.epsg} önerildi.`,
                              });
                            }
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
                        >
                          Öner
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[10px] text-slate-400">±0.00 Ortometrik Kotu (m, TUREF)</span>
                      <input
                        value={zeroElevMeters}
                        onChange={(e) => setZeroElevMeters(e.target.value)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 font-mono"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-slate-400">Artık Eşiği (cm, öneri: 5.0 cm)</span>
                      <input
                        value={thresholdCm}
                        onChange={(e) => setThresholdCm(e.target.value)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 font-mono"
                      />
                    </label>
                  </div>
                </div>

                <label className="block">
                  <span className="text-[10px] text-slate-400">
                    2B Helmert Kontrol Noktası Çiftleri (ID; localX; localY; targetE; targetN)
                  </span>
                  <textarea
                    value={pairsText}
                    onChange={(e) => setPairsText(e.target.value)}
                    rows={6}
                    className="w-full mt-0.5 p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] text-slate-400">
                    Yapı Aplikasyon 3B Köşeleri / TIC (ID; E(Doğu); N(Kuzey); Z(Kot)) — K54
                  </span>
                  <textarea
                    value={surveyText}
                    onChange={(e) => setSurveyText(e.target.value)}
                    rows={5}
                    placeholder="A1; 450171.240; 4414908.840; 1095.900"
                    className="w-full mt-0.5 p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]"
                  />
                </label>
              </div>

              <div className="col-span-6 space-y-3">
                <div className="p-3 rounded border border-slate-800 bg-slate-950 space-y-2">
                  <div className="font-semibold text-slate-100">Helmert Çözümü ve Artık Analizi (§7.3)</div>
                  {parsedControlPairs.error && (
                    <div className="text-red-400">{parsedControlPairs.error}</div>
                  )}
                  {helmertPreview ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 p-2 rounded bg-slate-900 font-mono text-[11px]">
                        <div>Ölçek (s): {helmertPreview.helmert.scale.toFixed(6)} ({helmertPreview.helmert.scalePpm.toFixed(1)} ppm)</div>
                        <div>Dönüklük: {helmertPreview.helmert.rotationDeg.toFixed(5)}°</div>
                        <div>tE (Doğu): {helmertPreview.helmert.tE.toFixed(3)} m</div>
                        <div>tN (Kuzey): {helmertPreview.helmert.tN.toFixed(3)} m</div>
                        <div>RMSE: {(helmertPreview.helmert.rmseMeters * 100).toFixed(2)} cm</div>
                        <div className={helmertPreview.exceedsThreshold ? 'text-red-400' : 'text-emerald-400'}>
                          Maks. Artık: {(helmertPreview.helmert.maxResidualMm / 10).toFixed(2)} cm
                        </div>
                      </div>

                      <table className="w-full text-left font-mono text-[11px] border border-slate-800">
                        <thead className="bg-slate-900 text-slate-400">
                          <tr>
                            <th className="p-1">Nokta</th>
                            <th className="p-1">vE (mm)</th>
                            <th className="p-1">vN (mm)</th>
                            <th className="p-1">|v| (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {helmertPreview.helmert.residuals.map((r) => (
                            <tr key={r.id} className="border-t border-slate-800">
                              <td className="p-1">{r.id}</td>
                              <td className="p-1">{(r.vE * 1000).toFixed(1)}</td>
                              <td className="p-1">{(r.vN * 1000).toFixed(1)}</td>
                              <td className={`p-1 ${r.normMm > helmertPreview.thresholdMm ? 'text-red-400 font-bold' : 'text-emerald-300'}`}>
                                {(r.normMm / 10).toFixed(2)} cm
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {helmertPreview.issues.length > 0 && (
                        <ul className="space-y-1 text-[11px]">
                          {helmertPreview.issues.map((iss, i) => (
                            <li key={i} className="px-2 py-1 rounded bg-amber-950/60 text-amber-200">
                              {iss.code}: {iss.message}
                            </li>
                          ))}
                        </ul>
                      )}

                      <label className="flex items-center gap-1.5 pt-1">
                        <input
                          type="checkbox"
                          checked={transformExisting}
                          onChange={(e) => setTransformExisting(e.target.checked)}
                        />
                        <span>Mevcut çizilmiş yerel poligonları da bu Helmert dönüşümüyle taşı</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = applyHelmertWizardToProject(project, helmertPreview, {
                            transformExistingGeometry: transformExisting,
                          });
                          onUpdateProject(
                            updated,
                            `Konumlandırma uygulandı: EPSG:${updated.georef.epsg}, köken (${updated.georef.originE}, ${updated.georef.originN}), TIC ${helmertPreview.ticPointsMm.length} nokta.`
                          );
                          setStatusBanner({
                            kind: 'ok',
                            text: `Proje konumlandırıldı (EPSG:${updated.georef.epsg}, RMSE ${(helmertPreview.helmert.rmseMeters * 100).toFixed(2)} cm).`,
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold"
                      >
                        Helmert Konumlandırmasını ve TIC Noktalarını Projeye Uygula
                      </button>
                    </>
                  ) : (
                    <div className="text-slate-400">En az 2 geçerli kontrol noktası çifti girin.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEKME 3: RASTER ALTLIK KALİBRASYONU */}
          {tab === 'raster' && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 space-y-3">
                <div className="p-3 rounded border border-slate-800 bg-slate-950 space-y-2">
                  <div className="font-semibold text-slate-100">Raster Mimari Plan Görüntüsü (PNG/JPG/SVG — §8.1)</div>
                  <div className="flex gap-2 items-center">
                    <label className="px-2.5 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white cursor-pointer">
                      Görüntü Seç (.png/.jpg/.svg)
                      <input type="file" accept="image/*" className="hidden" onChange={handleLoadRasterFile} />
                    </label>
                    {rasterUnderlay && (
                      <button
                        type="button"
                        onClick={() => {
                          onSetRasterUnderlay(null);
                          setStatusBanner({ kind: 'info', text: 'Raster altlık kaldırıldı.' });
                        }}
                        className="px-2 py-1 rounded bg-red-900/60 border border-red-700 text-red-100"
                      >
                        Altlığı Kaldır
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <label className="block">
                      <span className="text-[10px] text-slate-400">Sol-Alt X Ofseti (mm)</span>
                      <input
                        value={rasterOffsetXMm}
                        onChange={(e) => setRasterOffsetXMm(e.target.value)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 font-mono"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-slate-400">Sol-Alt Y Ofseti (mm)</span>
                      <input
                        value={rasterOffsetYMm}
                        onChange={(e) => setRasterOffsetYMm(e.target.value)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 font-mono"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] text-slate-400">Saydamlık ({Math.round(rasterOpacity * 100)}%)</span>
                      <input
                        type="range"
                        min="0.1"
                        max="0.95"
                        step="0.05"
                        value={rasterOpacity}
                        onChange={(e) => setRasterOpacity(Number(e.target.value))}
                        className="w-full mt-2"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-3 rounded border border-slate-800 bg-slate-950 space-y-2">
                  <div className="font-semibold text-slate-100">En Az 2 Yatay (X) + 2 Dikey (Y) Ölçü (§8.1)</div>
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="text-slate-400">
                      <tr>
                        <th>ID</th>
                        <th>Eksen</th>
                        <th>ΔPiksel</th>
                        <th>Gerçek Uzunluk (m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rasterMeasurements.map((m, idx) => {
                        const spanPx = Math.hypot(m.p2.u - m.p1.u, m.p2.v - m.p1.v);
                        return (
                          <tr key={m.id} className="border-t border-slate-800">
                            <td className="py-1">{m.id}</td>
                            <td>{m.axis}</td>
                            <td>{spanPx.toFixed(1)} px</td>
                            <td>
                              <input
                                value={String(m.declaredMeters)}
                                onChange={(e) => {
                                  const val = Number(e.target.value.replace(',', '.'));
                                  if (Number.isFinite(val) && val > 0) {
                                    setRasterMeasurements((prev) =>
                                      prev.map((x, i) => (i === idx ? { ...x, declaredMeters: val } : x))
                                    );
                                  }
                                }}
                                className="w-24 bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-span-6 space-y-3">
                <div className="p-3 rounded border border-slate-800 bg-slate-950 space-y-2">
                  <div className="font-semibold text-slate-100">Kalibrasyon Sonucu ve 3. Kontrol Ölçüsü (§8.1)</div>
                  {rasterCalibPreview && (
                    <>
                      <div className="grid grid-cols-2 gap-2 p-2 rounded bg-slate-900 font-mono text-[11px]">
                        <div>Ölçek X: {rasterCalibPreview.scaleXMmPerPx.toFixed(3)} mm/px</div>
                        <div>Ölçek Y: {rasterCalibPreview.scaleYMmPerPx.toFixed(3)} mm/px</div>
                        <div>X/Y Oranı: {rasterCalibPreview.anisotropyRatio.toFixed(4)}</div>
                        <div>Kontrol Artığı: {(rasterCalibPreview.checkResidualMm ?? 0).toFixed(1)} mm</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyRasterUnderlay}
                        className="w-full px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold"
                      >
                        Kalibre Edilmiş Raster Altlığı 2B Editöre Uygula (D-23.5)
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SEKME 4: LİSTE BEYAN VE MALİKLER (K88-yeni, OY-04, OY-06) */}
          {tab === 'listebeyan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">
                      CSV / Excel Pano Yapıştırma (Smart Paste — §8.4, OY-06)
                    </span>
                    <label className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer text-[11px]">
                      CSV Dosyası Seç (.csv/.txt)
                      <input
                        type="file"
                        accept=".csv,.tsv,.txt"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) setListeCsvText(await f.text());
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    value={listeCsvText}
                    onChange={(e) => setListeCsvText(e.target.value)}
                    rows={7}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[10px]"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={otomatikOneri === 'acik'}
                        onChange={(e) => setOtomatikOneri(e.target.checked ? 'acik' : 'kapali')}
                      />
                      <span>İsteğe bağlı otomatik öneri (`otomatikOneri`: {otomatikOneri} — yalnız kullanıcı onayıyla yazar, K88-yeni)</span>
                    </label>
                  </div>
                </div>

                <div className="col-span-6 space-y-2">
                  <div className="font-semibold text-slate-100">Önizleme ve Doğrulama Raporu (OY-06 Onay Zorunluluğu)</div>
                  {parsedListePreview && 'error' in parsedListePreview ? (
                    <div className="p-2 rounded bg-red-950/70 text-red-200">{parsedListePreview.error}</div>
                  ) : parsedListePreview ? (
                    <div className="p-2.5 rounded border border-slate-800 bg-slate-950 space-y-2">
                      <div className="flex flex-wrap gap-3 font-mono text-[11px]">
                        <span>Satır: {parsedListePreview.rows.length}</span>
                        <span>Benzersiz BB: {parsedListePreview.landShareAnalysis.uniqueBbCount}</span>
                        <span className={parsedListePreview.landShareAnalysis.isCompleteShareEqualOne ? 'text-emerald-400' : 'text-amber-300'}>
                          Arsa Payı Toplamı: {parsedListePreview.landShareAnalysis.formattedTotalUnreduced}
                        </span>
                        <span>Malik Kaydı: {parsedListePreview.malikList.length}</span>
                      </div>

                      {parsedListePreview.issues.length > 0 && (
                        <ul className="max-h-24 overflow-y-auto space-y-0.5 text-[10px]">
                          {parsedListePreview.issues.map((iss, idx) => (
                            <li
                              key={idx}
                              className={`px-1.5 py-0.5 rounded ${
                                iss.severity === 'H'
                                  ? 'bg-red-950/70 text-red-200'
                                  : iss.severity === 'U'
                                  ? 'bg-amber-950/60 text-amber-200'
                                  : 'bg-slate-900 text-slate-300'
                              }`}
                            >
                              [{iss.severity}] {iss.ruleId}: {iss.message}
                            </li>
                          ))}
                        </ul>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const applied = applyApprovedListeBeyanToProject(
                            project,
                            parsedListePreview,
                            malikler
                          );
                          onUpdateProject(
                            applied.project,
                            `Liste beyan onaylanarak aktarıldı (${applied.project.buildings[0].sections.length} BB, ${applied.malikler.length} malik — OY-06, K88-yeni).`
                          );
                          onUpdateMalikler(applied.malikler);
                          setStatusBanner({
                            kind: 'ok',
                            text: `${applied.project.buildings[0].sections.length} bağımsız bölüm ve ${applied.malikler.length} malik kaydı onaylanarak modele aktarıldı.`,
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold"
                      >
                        Önizlemeyi Onayla ve Modele Aktar (OY-06 / K88-yeni)
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Serbest Düzenlenebilir Bağımsız Bölüm ve Malik Tablosu (K88-yeni) */}
              <div className="p-3 rounded border border-slate-800 bg-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-300">
                    Aktif Projedeki Bağımsız Bölümler ve Malik Listesi (K88-yeni: Tüm Alanlar Serbestçe Düzenlenebilir)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Not: Malik bilgileri yalnız .tkgm3b proje dosyasında tutulur; GML çıktısına asla yazılmaz (K99).
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        <th className="p-1.5">BB No</th>
                        <th className="p-1.5">Blok</th>
                        <th className="p-1.5">Giriş</th>
                        <th className="p-1.5">Kat Tanımı (OY-04)</th>
                        <th className="p-1.5">Nitelik (K61)</th>
                        <th className="p-1.5">Arsa Payı (K27)</th>
                        <th className="p-1.5">Net / Brüt (m²)</th>
                        <th className="p-1.5">Malik Hisse Durumu (V-208)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(b?.sections ?? []).map((sec) => {
                        const shortKey = `${sec.blockName}|${sec.entrance}|${sec.number}`;
                        const malikCheck = validateBbMalikShares(shortKey, malikler);
                        return (
                          <tr key={sec.id} className="border-t border-slate-800">
                            <td className="p-1">
                              <input
                                value={sec.number}
                                onChange={(e) => updateSectionField(sec.id, { number: e.target.value })}
                                className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                value={sec.blockName}
                                onChange={(e) => updateSectionField(sec.id, { blockName: e.target.value })}
                                className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                value={sec.entrance}
                                onChange={(e) => updateSectionField(sec.id, { entrance: e.target.value })}
                                className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                value={sec.registeredFloorDefinition}
                                onChange={(e) =>
                                  updateSectionField(sec.id, { registeredFloorDefinition: e.target.value })
                                }
                                className="w-24 bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                value={sec.registeredQuality}
                                onChange={(e) =>
                                  updateSectionField(sec.id, { registeredQuality: e.target.value })
                                }
                                className="w-24 bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                value={sec.propertyLot}
                                onChange={(e) => updateSectionField(sec.id, { propertyLot: e.target.value })}
                                className="w-20 bg-slate-900 border border-slate-700 rounded px-1 py-0.5"
                              />
                            </td>
                            <td className="p-1">
                              {sec.planNetArea} / {sec.planGrossArea}
                            </td>
                            <td className="p-1 text-[10px]">
                              {malikCheck.malikSayisi === 0
                                ? '—'
                                : `${malikCheck.malikSayisi} malik (${malikCheck.toplamHisse.numerator.toString()}/${malikCheck.toplamHisse.denominator.toString()})`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
