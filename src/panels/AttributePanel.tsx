// G7, G2, G4 & KARAR D-23.1 / D-23.3: Öznitelik, Kod Listesi (K60), Arsa Payı (K84, G4) ve Malik/Beyan (K88) Paneli
import React, { useState } from 'react';
import { ImportedCityObject, ImportedModel } from '../core/gml/gmlReader.ts';
import { formatBigIntFraction } from '../core/math/landShare.ts';
import type { GenericAttributeType } from '../core/model/index.ts';
import {
  DEFAULT_BEYAN_DUZENLEME_AYAR,
  Malik,
  validateBbMalikShares,
} from '../core/model/malik.ts';
import { MaximizedPanelId } from '../state/workspaceState.ts';

export interface AttributePanelProps {
  readonly model: ImportedModel;
  readonly selectedObject: ImportedCityObject | null;
  readonly malikler: readonly Malik[];
  readonly maximizedPanelId: MaximizedPanelId;
  /** M3: Öznitelik değeri düzenleme (Düzeltme kipi, K70). */
  readonly onEditAttribute: (gmlId: string, name: string, type: GenericAttributeType, value: string) => void;
  /** M3: Nesne adı (gml:name) düzenleme. */
  readonly onRenameObject: (gmlId: string, value: string) => void;
  readonly onAddMalik: (malik: Malik) => void;
  readonly onToggleMaximizePanel: () => void;
}

/** Birden fazla değer alabilen öznitelikler bu sürümde tek tek düzenlenmez. */
const MULTI_VALUED = new Set(['independentSectionCardinalDirection', 'storeyUsage']);

/** Tıklayınca düzenlenen değer hücresi; Enter veya odak kaybında kaydeder, Esc ile vazgeçer. */
const EditableValue: React.FC<{
  readonly value: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string;
  readonly onCommit: (v: string) => void;
}> = ({ value, disabled, disabledReason, onCommit }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (disabled) {
    return <span title={disabledReason}>{value}</span>;
  }
  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Düzenlemek için tıklayın"
        className="text-left w-full rounded px-1 -mx-1 hover:bg-slate-700/60 focus:outline-none focus:ring-1 focus:ring-amber-400"
      >
        {value === '' ? <span className="text-slate-500 italic">(boş)</span> : value}
      </button>
    );
  }
  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
      }}
      className="w-full px-1 py-0.5 bg-slate-950 border border-amber-500/60 rounded text-slate-100 font-mono text-[11px]"
    />
  );
};

export const AttributePanel: React.FC<AttributePanelProps> = ({
  model,
  selectedObject,
  malikler,
  maximizedPanelId,
  onEditAttribute,
  onRenameObject,
  onAddMalik,
  onToggleMaximizePanel,
}) => {
  const [attrTab, setAttrTab] = useState<'attributes' | 'landshare' | 'malik'>(
    'attributes'
  );
  const [newMalikName, setNewMalikName] = useState<string>('');
  const [newMalikShare, setNewMalikShare] = useState<string>('1/1');

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
            onClick={onToggleMaximizePanel}
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
                <div className="p-2 rounded bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {selectedObject.prefix}
                      </span>
                      <span className="font-semibold text-slate-100 min-w-[8rem]">
                        <EditableValue
                          key={`name-${selectedObject.gmlId}-${selectedObject.gmlName}`}
                          value={selectedObject.gmlName}
                          onCommit={(v) => onRenameObject(selectedObject.gmlId, v)}
                        />
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

                {/* G2: Dosya Profil ve Kat/Kapı Ofset Özeti */}
                <div className="px-2.5 py-1.5 rounded bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                  <span>
                    Kat Biçimi:{' '}
                    <strong className="text-slate-200">
                      {model.detectedStoreyForm}
                    </strong>
                  </span>
                  <span>
                    Kapı Alt Ofseti:{' '}
                    <strong className="text-slate-200">
                      {model.detectedDoorBottomOffsetMm !== null
                        ? `${model.detectedDoorBottomOffsetMm} mm`
                        : '— (ölçülemedi)'}
                    </strong>
                  </span>
                  <span>
                    Üretici Profili (G2):{' '}
                    <strong className="text-amber-300">
                      {model.detectedProducerProfile}
                    </strong>
                  </span>
                </div>

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
                      {selectedObject.attributes.map((attr, idx) => (
                        <tr
                          key={`${attr.name}-${attr.type}-${idx}`}
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
                          <td className="py-1 px-2 text-slate-100">
                            <EditableValue
                              key={`${selectedObject.gmlId}-${attr.name}-${idx}-${attr.rawValue}`}
                              value={attr.rawValue}
                              disabled={MULTI_VALUED.has(attr.name)}
                              disabledReason="Bu öznitelik birden fazla değer alabilir; bu sürümde tek tek düzenlenmez."
                              onCommit={(v) => onEditAttribute(selectedObject.gmlId, attr.name, attr.type, v)}
                            />
                          </td>
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
            {/* G4: propertyLot olmayan eski rejim dosyalarında 0/1 yerine '—' gösterilir */}
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
                  {model.landShareAnalysis.formattedTotalUnreduced}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Sadeleşmiş Toplam</div>
                <div className="text-sm font-mono font-bold text-sky-300">
                  {model.landShareAnalysis.formattedTotalReduced}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">1 Tam Paydan Fark (V-199)</div>
                <div className="text-sm font-mono font-bold text-amber-300">
                  {model.landShareAnalysis.formattedDiffFromOne}
                </div>
              </div>
            </div>

            {!model.landShareAnalysis.hasPropertyLotData ? (
              <div className="p-2 rounded bg-sky-950/40 border border-sky-800/60 text-[11px] text-sky-300">
                BİLGİ (G4 / V-198): Arsa payı bilgisi yok (eski rejim dosyası). Hiçbir bağımsız
                bölümde <code className="font-mono">propertyLot</code> özniteliği bulunmadığı
                için toplam hesaplanmadı (<code className="font-mono">—</code>).
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">
                BigInt rasyonel aritmetik (EKOK payda eşitlemesi) ile hesaplanmıştır; kayan nokta
                yuvarlama hatası içermez.
              </div>
            )}
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
                  onAddMalik({
                    bbAnahtari: activeBbKey,
                    adSoyadVeyaUnvan: newMalikName.trim(),
                    hissePay: pay,
                    hissePayda: payda,
                  });
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
