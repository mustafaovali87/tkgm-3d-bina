// M10 — Electron Preload Script (Güvenli ContextBridge API Köprüsü)
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getDisplayCount: () => ipcRenderer.invoke('get-display-count'),
  openSecondaryWindow: (panelId: string) => ipcRenderer.invoke('open-secondary-window', panelId),
  closeSecondaryWindow: () => ipcRenderer.invoke('close-secondary-window'),
  sendDualWindowEvent: (msg: unknown) => ipcRenderer.send('send-dual-window-event', msg),
  onDualWindowEvent: (callback: (msg: any) => void) => {
    const handler = (_event: any, msg: any) => callback(msg);
    ipcRenderer.on('dual-window-event', handler);
    return () => {
      ipcRenderer.removeListener('dual-window-event', handler);
    };
  },
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
});
