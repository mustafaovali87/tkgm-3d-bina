import React, { useMemo } from 'react';
import { Compass, Layers, PenTool } from 'lucide-react';
import { ImportedModel } from '../core/gml/gmlReader.ts';

export interface FloorPlanPreview2DProps {
  readonly model: ImportedModel;
  readonly selectedGmlId: string | null;
  readonly activeStoreyGmlId: string | null;
  readonly onSelectGmlId: (gmlId: string | null) => void;
  readonly onSelectStoreyGmlId: (storeyGmlId: string | null) => void;
}

export const FloorPlanPreview2D: React.FC<FloorPlanPreview2DProps> = ({
  model,
  selectedGmlId,
  activeStoreyGmlId,
  onSelectGmlId,
  onSelectStoreyGmlId,
}) => {
  const storeys = useMemo(() => {
    return model.objects
      .filter((o) => o.prefix === 'K_')
      .sort((a, b) => (a.minZ ?? 0) - (b.minZ ?? 0));
  }, [model]);

  const effectiveStoreyId = activeStoreyGmlId ?? storeys[0]?.gmlId ?? null;

  const floorPolygons = useMemo(() => {
    return model.polygons.filter((p) => {
      if (p.surfaceTag !== 'FloorSurface' && p.lodLevel !== 'lod0FootPrint') {
        return false;
      }
      if (effectiveStoreyId && p.storeyGmlId && p.storeyGmlId !== effectiveStoreyId) {
        return false;
      }
      return true;
    });
  }, [model, effectiveStoreyId]);

  const bnds = model.computedBounds;
  const spanE = Math.max(bnds.maxE - bnds.minE, 1);
  const spanN = Math.max(bnds.maxN - bnds.minN, 1);
  const pad = Math.max(spanE, spanN) * 0.12;
  const viewBox = `${bnds.minE - pad} ${-(bnds.maxN + pad)} ${spanE + pad * 2} ${
    spanN + pad * 2
  }`;

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 select-none overflow-hidden">
      {/* Top 2D Bar: D-23.5 M4 Placeholder Banner + Active Storey Switcher */}
      <div className="px-3 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <PenTool className="w-3.5 h-3.5 text-slate-700" />
          <span className="font-bold text-slate-900">2B Kat Planı İzdüşümü</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-semibold">
            2B CAD Çizim Editörü: M4&apos;te gelecek (KARAR D-23.5)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {storeys.map((st) => {
            const active = st.gmlId === effectiveStoreyId;
            return (
              <button
                key={st.gmlId}
                type="button"
                onClick={() =>
                  onSelectStoreyGmlId(
                    activeStoreyGmlId === st.gmlId ? null : st.gmlId
                  )
                }
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.gmlName || `Kat_${st.attributesMap.storeyNumber}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2D SVG Footprint & Room FloorSurface Interactive Preview */}
      <div className="flex-1 relative flex items-center justify-center p-3 overflow-hidden">
        <svg
          viewBox={viewBox}
          className="w-full h-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {floorPolygons.map((poly) => {
            const pts = poly.exteriorRing.vertices
              .map((v) => `${v.e},${-v.n}`)
              .join(' ');
            const ownerObj = model.objectsById[poly.ownerObjectGmlId];
            const isSelected =
              selectedGmlId === poly.ownerObjectGmlId ||
              selectedGmlId === poly.gmlId ||
              (ownerObj?.referencedBbGmlId &&
                ownerObj.referencedBbGmlId === selectedGmlId);

            const isBalcony =
              poly.ownerObjectPrefix === 'BLKN_' ||
              poly.ownerObjectPrefix === 'TRS_';
            const isRoom =
              poly.ownerObjectPrefix === 'BBK_' ||
              poly.ownerObjectPrefix === 'OA_';

            const fill = isSelected
              ? '#f59e0b'
              : isBalcony
              ? '#fde68a'
              : isRoom
              ? '#a7f3d0'
              : '#e2e8f0';
            const stroke = isSelected ? '#b45309' : '#334155';
            const strokeWidth = Math.max(spanE, spanN) * (isSelected ? 0.008 : 0.004);

            const usageDesc =
              ownerObj?.attributes.find((a) => a.name === 'partUsage')
                ?.codelistDescription ?? ownerObj?.gmlName ?? '';

            return (
              <g
                key={poly.gmlId}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGmlId(poly.ownerObjectGmlId);
                }}
                className="cursor-pointer transition-opacity hover:opacity-85"
              >
                <polygon
                  points={pts}
                  fill={fill}
                  fillOpacity={isSelected ? 0.85 : isRoom || isBalcony ? 0.65 : 0.35}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
                {(isRoom || isBalcony) && (
                  <text
                    x={poly.centroid.e}
                    y={-poly.centroid.n}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.max(spanE, spanN) * 0.026}
                    fill="#0f172a"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {usageDesc} ({poly.areaM2.toFixed(1)}m²)
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-600 bg-white/90 border border-slate-200 rounded px-2.5 py-1">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>
              İçe aktarılan GML&apos;den otomatik FloorSurface / FootPrint 2B izdüşümü (Odaya tıklayarak 3B ve Öznitelik panelinde seçebilirsiniz)
            </span>
          </span>
          <span>
            Kat Kotu: {storeys.find((s) => s.gmlId === effectiveStoreyId)?.minZ?.toFixed(2) ?? '-'} m
          </span>
        </div>
      </div>
    </div>
  );
};
