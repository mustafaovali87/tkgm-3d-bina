// G7 & KARAR D-23.1 / D-23.2: 5 Panelli Ana Pencere Yerleşimi (F5 Standart, F6 Yan Yana, F7 Çizim, F8 Denetim ve <1366px Dar Ekran Modu)
import React from 'react';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import {
  MaximizedPanelId,
  PersistedWorkspaceState,
} from '../state/workspaceState.ts';

export interface WorkspaceLayoutProps {
  readonly workspaceState: PersistedWorkspaceState;
  readonly maximizedPanelId: MaximizedPanelId;
  readonly isNarrowMode: boolean;
  readonly narrowCenterTab: '2d' | '3d';
  readonly narrowTreeDrawerOpen: boolean;
  readonly onSetNarrowCenterTab: (tab: '2d' | '3d') => void;
  readonly onToggleNarrowTreeDrawer: () => void;
  readonly onGroupLayoutChanged: (groupId: string, layout: Layout) => void;
  readonly treePanel: React.ReactNode;
  readonly cad2dPanel: React.ReactNode;
  readonly scene3dPanel: React.ReactNode;
  readonly validationPanel: React.ReactNode;
  readonly attributesPanel: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  workspaceState,
  maximizedPanelId,
  isNarrowMode,
  narrowCenterTab,
  narrowTreeDrawerOpen,
  onSetNarrowCenterTab,
  onToggleNarrowTreeDrawer,
  onGroupLayoutChanged,
  treePanel,
  cad2dPanel,
  scene3dPanel,
  validationPanel,
  attributesPanel,
}) => {
  if (maximizedPanelId === 'tree') return <>{treePanel}</>;
  if (maximizedPanelId === 'cad2d') return <>{cad2dPanel}</>;
  if (maximizedPanelId === 'scene3d') return <>{scene3dPanel}</>;
  if (maximizedPanelId === 'validation') return <>{validationPanel}</>;
  if (maximizedPanelId === 'attributes') return <>{attributesPanel}</>;

  // D-23.2 #5: Küçük ekran (< 1366 px) davranışında 2B ve 3B tek orta alanda sekme olarak gösterilir, Ağaç açılır çekmece olur
  if (isNarrowMode) {
    return (
      <div className="relative flex flex-col h-full w-full overflow-hidden">
        {narrowTreeDrawerOpen && (
          <div className="absolute inset-y-0 left-0 z-30 w-72 shadow-2xl">
            {treePanel}
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleNarrowTreeDrawer}
              className="px-2.5 py-1 text-xs rounded bg-sky-600/30 border border-sky-500/50 text-sky-200 font-medium"
            >
              {narrowTreeDrawerOpen
                ? '✕ Proje Ağacını Kapat'
                : '☰ Proje Ağacı Çekmecesi'}
            </button>
            <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
              <button
                type="button"
                onClick={() => onSetNarrowCenterTab('2d')}
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
                onClick={() => onSetNarrowCenterTab('3d')}
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
              onGroupLayoutChanged('d23-narrow-v', layout)
            }
          >
            <Panel id="narrow-top" defaultSize="65%" minSize="30%">
              {narrowCenterTab === '2d' ? cad2dPanel : scene3dPanel}
            </Panel>
            <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
            <Panel id="narrow-bottom" defaultSize="35%" minSize="18%">
              <Group id="d23-narrow-bot-h" orientation="horizontal">
                <Panel id="narrow-val" defaultSize="50%" minSize="20%">
                  {validationPanel}
                </Panel>
                <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
                <Panel id="narrow-attr" defaultSize="50%" minSize="20%">
                  {attributesPanel}
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
        onLayoutChanged={(l) => onGroupLayoutChanged('d23-f6-root', l)}
      >
        <Panel id="f6-left-2d" defaultSize="48%" minSize="20%" collapsible>
          {cad2dPanel}
        </Panel>
        <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
        <Panel id="f6-right" defaultSize="52%" minSize="25%">
          <Group
            id="d23-f6-right-v"
            orientation="vertical"
            defaultLayout={workspaceState.groupLayouts['d23-f6-right-v']}
            onLayoutChanged={(l) => onGroupLayoutChanged('d23-f6-right-v', l)}
          >
            <Panel id="f6-right-3d" defaultSize="55%" minSize="25%" collapsible>
              {scene3dPanel}
            </Panel>
            <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
            <Panel id="f6-right-bottom" defaultSize="45%" minSize="20%">
              <Group id="d23-f6-right-bot-h" orientation="horizontal">
                <Panel id="f6-tree" defaultSize="30%" minSize="15%" collapsible>
                  {treePanel}
                </Panel>
                <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
                <Panel id="f6-attr" defaultSize="40%" minSize="20%" collapsible>
                  {attributesPanel}
                </Panel>
                <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
                <Panel id="f6-val" defaultSize="30%" minSize="15%" collapsible>
                  {validationPanel}
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
        onLayoutChanged={(l) => onGroupLayoutChanged('d23-f7-root', l)}
      >
        <Panel id="f7-top" defaultSize="76%" minSize="40%">
          <Group
            id="d23-f7-top-h"
            orientation="horizontal"
            defaultLayout={workspaceState.groupLayouts['d23-f7-top-h']}
            onLayoutChanged={(l) => onGroupLayoutChanged('d23-f7-top-h', l)}
          >
            <Panel id="f7-2d" defaultSize="72%" minSize="40%">
              {cad2dPanel}
            </Panel>
            <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
            <Panel id="f7-3d-mini" defaultSize="28%" minSize="15%" collapsible>
              {scene3dPanel}
            </Panel>
          </Group>
        </Panel>
        <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
        <Panel id="f7-bottom" defaultSize="24%" minSize="12%" collapsible>
          <Group id="d23-f7-bot-h" orientation="horizontal">
            <Panel id="f7-val" defaultSize="50%" minSize="20%">
              {validationPanel}
            </Panel>
            <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
            <Panel id="f7-attr" defaultSize="50%" minSize="20%">
              {attributesPanel}
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
        onLayoutChanged={(l) => onGroupLayoutChanged('d23-f8-root', l)}
      >
        <Panel id="f8-top" defaultSize="62%" minSize="30%">
          <Group
            id="d23-f8-top-h"
            orientation="horizontal"
            defaultLayout={workspaceState.groupLayouts['d23-f8-top-h']}
            onLayoutChanged={(l) => onGroupLayoutChanged('d23-f8-top-h', l)}
          >
            <Panel id="f8-tree" defaultSize="18%" minSize="12%" collapsible>
              {treePanel}
            </Panel>
            <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
            <Panel id="f8-3d" defaultSize="82%" minSize="40%">
              {scene3dPanel}
            </Panel>
          </Group>
        </Panel>
        <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
        <Panel id="f8-bottom" defaultSize="38%" minSize="20%">
          <Group id="d23-f8-bot-h" orientation="horizontal">
            <Panel id="f8-val" defaultSize="55%" minSize="25%">
              {validationPanel}
            </Panel>
            <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
            <Panel id="f8-attr" defaultSize="45%" minSize="25%">
              {attributesPanel}
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
      onLayoutChanged={(l) => onGroupLayoutChanged('d23-f5-root', l)}
    >
      <Panel id="f5-top" defaultSize="72%" minSize="35%">
        <Group
          id="d23-f5-top-h"
          orientation="horizontal"
          defaultLayout={workspaceState.groupLayouts['d23-f5-top-h']}
          onLayoutChanged={(l) => onGroupLayoutChanged('d23-f5-top-h', l)}
        >
          <Panel id="f5-tree" defaultSize="15%" minSize="10%" collapsible>
            {treePanel}
          </Panel>
          <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
          <Panel id="f5-cad2d" defaultSize="45%" minSize="18%" collapsible>
            {cad2dPanel}
          </Panel>
          <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
          <Panel id="f5-scene3d" defaultSize="40%" minSize="18%" collapsible>
            {scene3dPanel}
          </Panel>
        </Group>
      </Panel>
      <Separator className="h-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-row-resize" />
      <Panel id="f5-bottom" defaultSize="28%" minSize="14%" collapsible>
        <Group
          id="d23-f5-bot-h"
          orientation="horizontal"
          defaultLayout={workspaceState.groupLayouts['d23-f5-bot-h']}
          onLayoutChanged={(l) => onGroupLayoutChanged('d23-f5-bot-h', l)}
        >
          <Panel id="f5-validation" defaultSize="52%" minSize="20%" collapsible>
            {validationPanel}
          </Panel>
          <Separator className="w-1.5 bg-slate-800 hover:bg-amber-500 transition-colors cursor-col-resize" />
          <Panel id="f5-attributes" defaultSize="48%" minSize="20%" collapsible>
            {attributesPanel}
          </Panel>
        </Group>
      </Panel>
    </Group>
  );
};
