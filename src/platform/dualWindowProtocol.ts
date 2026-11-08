// M10 — Çift Monitör / İkinci Pencere İletişim Protokolü (KARAR D-23.5, KARARLAR.md §169, OY-12)
// Tarayıcı ortamında BroadcastChannel / localStorage, Electron ortamında IPC bridge üzerinden çalışır.
// Saf TypeScript; DOM globali yoksa zararsızca no-op çalışır.

export type DetachablePanelId = 'viewer3d' | 'editor2d' | 'validation' | 'tree';

export interface DualWindowSyncPayload {
  readonly selectedGmlId: string | null;
  readonly activeStoreyId: string | null;
  readonly activeTab: 'izdusum' | 'tasarim' | '3d';
  readonly sourceFileName: string;
  readonly canonicalHash?: string;
  readonly detachedPanel: DetachablePanelId | null;
  readonly timestamp: number;
}

export type DualWindowMessage =
  | { readonly type: 'PING'; readonly windowId: string }
  | { readonly type: 'PONG'; readonly windowId: string; readonly panel: DetachablePanelId | null }
  | { readonly type: 'SYNC_STATE'; readonly payload: DualWindowSyncPayload }
  | { readonly type: 'SELECT_OBJECT'; readonly gmlId: string | null }
  | { readonly type: 'SELECT_STOREY'; readonly storeyId: string | null }
  | { readonly type: 'DETACH_VIEW'; readonly panel: DetachablePanelId }
  | { readonly type: 'REATTACH_VIEW' };

export const DUAL_WINDOW_CHANNEL_NAME = 'tkgm3d_dual_window_channel';
export const DUAL_WINDOW_STORAGE_KEY = 'tkgm3d_dual_window_state';

declare global {
  interface Window {
    electronAPI?: {
      readonly isElectron: boolean;
      openSecondaryWindow(panelId: DetachablePanelId): Promise<boolean>;
      closeSecondaryWindow(): Promise<void>;
      sendDualWindowEvent(message: DualWindowMessage): void;
      onDualWindowEvent(callback: (msg: DualWindowMessage) => void): () => void;
      getDisplayCount(): Promise<number>;
    };
  }
}

export class DualWindowCoordinator {
  private readonly channel: BroadcastChannel | null = null;
  private readonly listeners = new Set<(msg: DualWindowMessage) => void>();
  private readonly windowId: string;
  private isSecondaryConnected = false;
  private lastPingTime = 0;

  constructor(windowId = `win_${Math.random().toString(36).slice(2, 8)}`) {
    this.windowId = windowId;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(DUAL_WINDOW_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<DualWindowMessage>) => {
          this.handleIncomingMessage(event.data);
        };
      } catch {
        this.channel = null;
      }
    }

    // Electron IPC köprüsü varsa dinle
    if (typeof window !== 'undefined' && window.electronAPI?.onDualWindowEvent) {
      window.electronAPI.onDualWindowEvent((msg) => {
        this.handleIncomingMessage(msg);
      });
    }

    // LocalStorage fallback (farklı sekmeler arası storage eventi)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === DUAL_WINDOW_STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue) as DualWindowMessage;
            this.handleIncomingMessage(parsed);
          } catch {
            // sessiz yut
          }
        }
      });
    }
  }

  private handleIncomingMessage(msg: DualWindowMessage): void {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'PING') {
      this.isSecondaryConnected = true;
      this.sendMessage({ type: 'PONG', windowId: this.windowId, panel: null });
    } else if (msg.type === 'PONG') {
      this.isSecondaryConnected = true;
      this.lastPingTime = Date.now();
    }
    for (const listener of this.listeners) {
      try {
        listener(msg);
      } catch (err) {
        console.error('DualWindowCoordinator listener hatası:', err);
      }
    }
  }

  public sendMessage(msg: DualWindowMessage, notifySelf = false): void {
    // 1. Electron IPC varsa öncelikli gönder
    if (typeof window !== 'undefined' && window.electronAPI?.sendDualWindowEvent) {
      window.electronAPI.sendDualWindowEvent(msg);
      if (!notifySelf) return;
    }
    // 2. BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {
        // kanal kapalıysa localStorage fallback
      }
    }
    // 3. LocalStorage
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(DUAL_WINDOW_STORAGE_KEY, JSON.stringify(msg));
      } catch {
        // kota dolu veya depolama kısıtı
      }
    }
    // 4. Test ortamı (BroadcastChannel yoksa) veya notifySelf istendiğinde yerel dinleyicilere ilet
    if (notifySelf || !this.channel) {
      this.handleIncomingMessage(msg);
    }
  }

  public subscribe(listener: (msg: DualWindowMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public sendSyncState(payload: DualWindowSyncPayload): void {
    this.sendMessage({ type: 'SYNC_STATE', payload });
  }

  public selectObject(gmlId: string | null): void {
    this.sendMessage({ type: 'SELECT_OBJECT', gmlId });
  }

  public selectStorey(storeyId: string | null): void {
    this.sendMessage({ type: 'SELECT_STOREY', storeyId });
  }

  public detachPanel(panel: DetachablePanelId): void {
    this.sendMessage({ type: 'DETACH_VIEW', panel });
  }

  public reattachPanel(): void {
    this.sendMessage({ type: 'REATTACH_VIEW' });
  }

  public ping(): void {
    this.sendMessage({ type: 'PING', windowId: this.windowId });
  }

  public get isConnected(): boolean {
    return this.isSecondaryConnected;
  }

  public destroy(): void {
    this.listeners.clear();
    if (this.channel) {
      this.channel.close();
    }
  }
}
