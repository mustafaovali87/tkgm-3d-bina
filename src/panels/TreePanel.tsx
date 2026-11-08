// G7 & KARAR D-23.1 / D-23.3: Proje Ağacı Paneli (MB_ -> K_ -> BB_ -> BBK_ / BLKN_ / KAPI_ / PEN_)
import React, { useState } from 'react';
import { ImportedModel, ImportedTreeNode } from '../core/gml/gmlReader.ts';
import { MaximizedPanelId, ObjectPrefixCounts } from '../state/workspaceState.ts';

export interface TreePanelProps {
  readonly model: ImportedModel;
  readonly objectCounts: ObjectPrefixCounts;
  readonly selectedGmlId: string | null;
  readonly activeStoreyId: string | null;
  readonly expandedNodes: Readonly<Record<string, boolean>>;
  readonly isCollapsed: boolean;
  readonly maximizedPanelId: MaximizedPanelId;
  readonly onSelectGmlId: (gmlId: string) => void;
  readonly onToggleStoreyFilter: (storeyGmlId: string | null) => void;
  readonly onToggleExpandNode: (gmlId: string, currentExpanded: boolean) => void;
  readonly onToggleCollapsePanel: () => void;
  readonly onToggleMaximizePanel: () => void;
}

const CATEGORY_BADGE_COLOR: Readonly<Record<string, string>> = {
  MB: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  STOREY: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  BB: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  BBK: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  OA: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
  BLKN: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  TRS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  KAPI: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  PEN: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  MBG: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

export const TreePanel: React.FC<TreePanelProps> = ({
  model,
  objectCounts,
  selectedGmlId,
  activeStoreyId,
  expandedNodes,
  isCollapsed,
  maximizedPanelId,
  onSelectGmlId,
  onToggleStoreyFilter,
  onToggleExpandNode,
  onToggleCollapsePanel,
  onToggleMaximizePanel,
}) => {
  const [treeSearch, setTreeSearch] = useState<string>('');
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
    const shortBadge = node.category === 'STOREY' ? 'K' : node.category;

    return (
      <div key={node.id} className="select-none">
        <div
          role="treeitem"
          aria-selected={isSelected}
          onClick={() => onSelectGmlId(node.gmlId)}
          onDoubleClick={() => {
            // D-23.3: Ağaçta kat (K_) çift tıklanırsa o kat 2B ve 3B'de aktif kat olur
            if (isStorey) {
              onToggleStoreyFilter(activeStoreyId === node.gmlId ? null : node.gmlId);
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
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpandNode(node.gmlId, isExpanded);
                }}
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-slate-700 text-slate-400 shrink-0"
              >
                {isExpanded ? '▾' : '▸'}
              </button>
            ) : (
              <span className="w-4 text-center text-slate-600 shrink-0">•</span>
            )}
            <span
              className={`px-1 py-0.2 text-[10px] font-mono rounded border shrink-0 pointer-events-none ${
                CATEGORY_BADGE_COLOR[node.category] ??
                'bg-slate-700 text-slate-300 border-slate-600'
              }`}
            >
              {shortBadge}
            </span>
            <span
              className="truncate pointer-events-none"
              title={`${node.label} — ${node.subLabel} (${node.gmlId})`}
            >
              {node.label}
              {node.subLabel ? (
                <span className="ml-1.5 text-[10px] text-slate-400">
                  ({node.subLabel})
                </span>
              ) : null}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isStorey && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStoreyFilter(activeStoreyId === node.gmlId ? null : node.gmlId);
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
            <span className="text-[10px] font-mono text-slate-500 pointer-events-none">
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
            onClick={onToggleCollapsePanel}
            title="Daralt / Genişlet"
            className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            −
          </button>
          <button
            type="button"
            onClick={onToggleMaximizePanel}
            title="Tam Ekran / Geri Al"
            className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {maximizedPanelId === 'tree' ? '❐' : '□'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
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
                  onClick={() => onToggleStoreyFilter(null)}
                  className="text-emerald-400 hover:underline font-medium"
                >
                  Tüm Katlar
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {model.hierarchyTree.map((rootNode) => renderTreeNode(rootNode, 0))}
          </div>

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
