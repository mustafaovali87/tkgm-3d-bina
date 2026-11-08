// P-03, P-04, P-06 — M11 Bilgi Panelleri (Proje, Bina, Katlar, Bağımsız Bölümler, Çatı & TIC, Eksikler)
// Şartname Ek-1 §2.1 & §2.3.
import React, { useState } from 'react';
import type { DesignProject, DesignBuilding, Storey, IndependentSection, SectionInfo, BuildingInfo, Roof } from '../core/design/types.ts';
import { recommendBuildingCardinalDirections } from '../core/design/cardinalDirection.ts';

export interface DesignInfoModalProps {
  readonly project: DesignProject;
  readonly onClose: () => void;
  readonly onSave: (updatedProject: DesignProject) => void;
}

type TabType = 'proje' | 'bina' | 'katlar' | 'bolumler' | 'cati_tic' | 'eksikler';

export const DesignInfoModal: React.FC<DesignInfoModalProps> = ({ project, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('bina');
  const bldg = project.buildings[0] ?? {
    id: 'bldg-1',
    letter: 'A',
    storeys: [],
    sections: [],
    sectionParts: [],
    parts: [],
  };

  const [bldgInfo, setBldgInfo] = useState<BuildingInfo>(() => ({
    maksIdentityNumber: bldg.info?.maksIdentityNumber ?? null,
    maksIntegrationState: bldg.info?.maksIntegrationState ?? 1003,
    buildingType: bldg.info?.buildingType ?? 1001,
    geometrySuitability: bldg.info?.geometrySuitability ?? [1006],
    tenderRegistrationNumber: bldg.info?.tenderRegistrationNumber ?? '',
    architecturalPlanID: bldg.info?.architecturalPlanID ?? '',
    additionalNote: bldg.info?.additionalNote ?? '-',
    elevatorCount: bldg.info?.elevatorCount ?? 0,
    buildingHeight: bldg.info?.buildingHeight ?? null,
    architecturalProjectConfirmationDate: bldg.info?.architecturalProjectConfirmationDate ?? '2026-01-01',
  }));

  const [sectionInfos, setSectionInfos] = useState<Record<string, SectionInfo>>(() => ({
    ...(bldg.sectionInfo ?? {}),
  }));

  const [roofState, setRoofState] = useState<Roof>(() => ({
    mode: bldg.roof?.mode ?? 'flat',
    pitchDeg: bldg.roof?.pitchDeg ?? 30,
    eaveOverhang: bldg.roof?.eaveOverhang ?? 0,
    thickness: bldg.roof?.thickness ?? 200,
    eaveZ: bldg.roof?.eaveZ,
  }));

  // Eksikler sekmesi için otomatik tespit
  const missingFields: { tab: TabType; message: string }[] = [];
  if (!bldgInfo.maksIdentityNumber) {
    missingFields.push({ tab: 'bina', message: 'Bina MAKS Kimlik Numarası boş' });
  }
  for (const sec of bldg.sections) {
    const sInfo = sectionInfos[sec.id];
    if (!sInfo?.maksIdentityNumber) {
      missingFields.push({ tab: 'bolumler', message: `BB ${sec.number}: maksIdentityNumber eksik` });
    }
    if (!sInfo?.maksNumaratajIdentityNumber) {
      missingFields.push({ tab: 'bolumler', message: `BB ${sec.number}: maksNumaratajIdentityNumber eksik` });
    }
  }

  const handleSave = () => {
    const updatedBuilding: DesignBuilding = {
      ...bldg,
      info: bldgInfo,
      sectionInfo: sectionInfos,
      roof: roofState,
      cardinalDirections: recommendBuildingCardinalDirections({
        ...bldg,
        sectionInfo: sectionInfos,
      }),
    };
    onSave({
      ...project,
      buildings: [updatedBuilding, ...project.buildings.slice(1)],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-slate-100">M11 — Bilgi Panelleri & Parametre Yönetimi</h2>
            <p className="text-xs text-slate-400">Proje, Bina, Katlar, Bağımsız Bölüm MAKS Numaraları ve Çatı & TIC</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white px-2 py-1 text-sm rounded bg-slate-800">✕ Kapat</button>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2">
          {[
            { id: 'bina', label: 'Bina Bilgileri' },
            { id: 'bolumler', label: 'Bağımsız Bölümler (MAKS)' },
            { id: 'katlar', label: 'Katlar' },
            { id: 'cati_tic', label: 'Çatı & TIC' },
            { id: 'eksikler', label: `Eksikler (${missingFields.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'bina' && (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Bina MAKS Kimlik Numarası (maksIdentityNumber)</label>
                <input
                  type="number"
                  value={bldgInfo.maksIdentityNumber ?? ''}
                  onChange={(e) => setBldgInfo({ ...bldgInfo, maksIdentityNumber: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  placeholder="Örnek: 100000001"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Bina Tipi (buildingType)</label>
                <select
                  value={bldgInfo.buildingType}
                  onChange={(e) => setBldgInfo({ ...bldgInfo, buildingType: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value={1001}>1001 - Ana Yapı</option>
                  <option value={1002}>1002 - Diğer Yapı</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Asansör Sayısı (elevatorCount)</label>
                <input
                  type="number"
                  value={bldgInfo.elevatorCount}
                  onChange={(e) => setBldgInfo({ ...bldgInfo, elevatorCount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Onay Tarihi (YYYY-AA-GG)</label>
                <input
                  type="date"
                  value={bldgInfo.architecturalProjectConfirmationDate}
                  onChange={(e) => setBldgInfo({ ...bldgInfo, architecturalProjectConfirmationDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Ruhsat/İhale Kayıt No (tenderRegistrationNumber)</label>
                <input
                  type="text"
                  value={bldgInfo.tenderRegistrationNumber}
                  onChange={(e) => setBldgInfo({ ...bldgInfo, tenderRegistrationNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mimari Proje ID (architecturalPlanID)</label>
                <input
                  type="text"
                  value={bldgInfo.architecturalPlanID}
                  onChange={(e) => setBldgInfo({ ...bldgInfo, architecturalPlanID: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
            </div>
          )}

          {activeTab === 'bolumler' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Bağımsız Bölüm MAKS Numaraları (P-03 / V-061 çözümü):</p>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">No</th>
                      <th className="p-2">Nitelik</th>
                      <th className="p-2">Kat</th>
                      <th className="p-2">MAKS No</th>
                      <th className="p-2">MAKS Numarataj No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {bldg.sections.map((sec) => {
                      const cur = sectionInfos[sec.id] ?? {
                        maksIdentityNumber: null,
                        maksNumaratajIdentityNumber: null,
                        maksIntegrationState: 1003,
                        integrationState: 1004,
                        geometrySuitability: 1001,
                        additionalNote: '-',
                      };
                      return (
                        <tr key={sec.id} className="hover:bg-slate-800/50">
                          <td className="p-2 font-mono font-bold text-amber-400">{sec.number}</td>
                          <td className="p-2">{sec.registeredQuality}</td>
                          <td className="p-2">{sec.registeredFloorDefinition}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={cur.maksIdentityNumber ?? ''}
                              onChange={(e) =>
                                setSectionInfos({
                                  ...sectionInfos,
                                  [sec.id]: {
                                    ...cur,
                                    maksIdentityNumber: e.target.value ? Number(e.target.value) : null,
                                  },
                                })
                              }
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 w-36 text-slate-100"
                              placeholder="Ör: 100000001"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={cur.maksNumaratajIdentityNumber ?? ''}
                              onChange={(e) =>
                                setSectionInfos({
                                  ...sectionInfos,
                                  [sec.id]: {
                                    ...cur,
                                    maksNumaratajIdentityNumber: e.target.value ? Number(e.target.value) : null,
                                  },
                                })
                              }
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 w-36 text-slate-100"
                              placeholder="Ör: 200000001"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'katlar' && (
            <div className="space-y-3">
              <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">Kat Adı</th>
                    <th className="p-2">Taban Kotu (m)</th>
                    <th className="p-2">Yükseklik (m)</th>
                    <th className="p-2">Döşeme (mm)</th>
                    <th className="p-2">K_ Üret</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bldg.storeys.map((s) => (
                    <tr key={s.id}>
                      <td className="p-2 font-mono font-bold">Kat_{s.storeyNumber}</td>
                      <td className="p-2 font-mono">{(s.zBottom / 1000).toFixed(3)}</td>
                      <td className="p-2 font-mono">{(s.height / 1000).toFixed(3)}</td>
                      <td className="p-2 font-mono">{s.slabThickness}</td>
                      <td className="p-2">{s.emitStoreyObject !== false ? 'Evet' : 'Hayır'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'cati_tic' && (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Çatı Kipi (mode)</label>
                <select
                  value={roofState.mode}
                  onChange={(e) => setRoofState({ ...roofState, mode: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="flat">Teras / Düz (flat)</option>
                  <option value="gable">Beşik Çatı (gable)</option>
                  <option value="hip">Kırma Çatı (hip)</option>
                  <option value="shed">Tek Eğimli Çatı (shed)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Çatı Eğimi (pitchDeg, °)</label>
                <input
                  type="number"
                  value={roofState.pitchDeg}
                  onChange={(e) => setRoofState({ ...roofState, pitchDeg: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Saçak Payı (eaveOverhang, mm)</label>
                <input
                  type="number"
                  value={roofState.eaveOverhang}
                  onChange={(e) => setRoofState({ ...roofState, eaveOverhang: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Alın Kalınlığı (thickness, mm)</label>
                <input
                  type="number"
                  value={roofState.thickness}
                  onChange={(e) => setRoofState({ ...roofState, thickness: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
            </div>
          )}

          {activeTab === 'eksikler' && (
            <div className="space-y-2">
              {missingFields.length === 0 ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded text-xs">
                  Tebrikler! Tasarım modelinde zorunlu alan eksiği bulunmuyor. GML üretimine hazır.
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs text-amber-400 font-semibold">Aşağıdaki alanlar GML üretiminden önce doldurulmalıdır:</p>
                  {missingFields.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveTab(m.tab)}
                      className="p-2 bg-slate-950 border border-red-900/60 hover:border-red-600 rounded flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="text-red-300">⚠️ {m.message}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Düzelt &gt;</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alt butonlar */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-800 bg-slate-950">
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs">Vazgeç</button>
          <button type="button" onClick={handleSave} className="px-5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs">Bilgileri Kaydet ve Bakı Yönlerini Güncelle</button>
        </div>
      </div>
    </div>
  );
};
