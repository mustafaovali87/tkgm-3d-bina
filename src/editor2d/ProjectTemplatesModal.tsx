// M10 — Proje Şablonları Seçim Modali (Apartman, Villa, Dubleks, Ticari Zemin)
import React from 'react';
import {
  PROJECT_TEMPLATES_CATALOG,
  type ProjectTemplateMeta,
  type TemplateTypeId,
} from '../core/templates/projectTemplates.ts';

export interface ProjectTemplatesModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelectTemplate: (templateId: TemplateTypeId) => void;
}

export const ProjectTemplatesModal: React.FC<ProjectTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="templates-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="flex flex-col bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📐</span>
            <div>
              <h2 id="templates-title" className="text-sm font-semibold text-slate-100">
                Hazır Mimari Proje Şablonları (M10 / F10)
              </h2>
              <p className="text-[11px] text-slate-400">
                Şartnameye ve TKGM standartlarına tam uyumlu hazır mimari modeller ile hızlı başlangıç yapın.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg px-2 py-0.5 rounded hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Şablon Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 overflow-y-auto">
          {PROJECT_TEMPLATES_CATALOG.map((meta: ProjectTemplateMeta) => {
            return (
              <div
                key={meta.id}
                className="flex flex-col justify-between p-4 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {meta.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Çatı: {meta.roofType === 'hip' ? 'Kırma' : meta.roofType === 'gable' ? 'Beşik' : 'Düz'}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-slate-100 group-hover:text-amber-300 transition-colors">
                    {meta.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">
                    {meta.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-slate-900/60 rounded border border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <div className="text-slate-500 text-[10px]">Kat Sayısı</div>
                      <div className="text-slate-200 font-semibold">{meta.storeyCount} Kat</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Bağımsız Bölüm</div>
                      <div className="text-slate-200 font-semibold">{meta.sectionCount} BB</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Taban / Toplam</div>
                      <div className="text-slate-200 font-semibold">{meta.footprintAreaM2} / {meta.totalAreaM2} m²</div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(meta.id);
                    onClose();
                  }}
                  className="mt-4 w-full py-2 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>✨</span> Bu Şablonu Projeye Yükle
                </button>
              </div>
            );
          })}
        </div>

        {/* Alt Bilgi */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Tüm şablonlar sıfır hata ve kapalı 3B kabuk üretimi için doğrulanmıştır.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
