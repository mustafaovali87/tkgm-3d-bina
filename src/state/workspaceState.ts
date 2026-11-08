// G7 & KARAR D-23: Çalışma alanı (F5–F8 yerleşim kalıpları, panel boyutları ve seçim) durum yönetimi
import { Layout } from 'react-resizable-panels';
import { ImportedCityObject } from '../core/gml/gmlReader.ts';
import { ValidationIssue } from '../core/model/index.ts';
import { Malik } from '../core/model/malik.ts';

export type LayoutPresetId = 'F5_STANDART' | 'F6_YAN_YANA' | 'F7_CIZIM' | 'F8_DENETIM';

export type MaximizedPanelId =
  | 'tree'
  | 'cad2d'
  | 'scene3d'
  | 'validation'
  | 'attributes'
  | null;

export const LAYOUT_STORAGE_KEY = 'tkgm3d_d23_layout_v1';

export interface PersistedWorkspaceState {
  readonly preset: LayoutPresetId;
  readonly groupLayouts: Record<string, Layout>;
  readonly collapsedPanels: Record<string, boolean>;
}

export const DEFAULT_MALIKLER: Malik[] = [
  {
    bbAnahtari: '-1||1',
    adSoyadVeyaUnvan: 'ÖRNEK MALİK 1 (Kat İrtifakı Beyan Örneği)',
    tcKimlikVeyaVergiNo: '11111111110',
    hissePay: 1n,
    hissePayda: 2n,
    not: 'Kat İrtifakı Tesisi',
  },
  {
    bbAnahtari: '-1||1',
    adSoyadVeyaUnvan: 'ÖRNEK MALİK 2 (Kat İrtifakı Beyan Örneği)',
    tcKimlikVeyaVergiNo: '22222222220',
    hissePay: 1n,
    hissePayda: 2n,
    not: 'Kat İrtifakı Tesisi',
  },
  {
    bbAnahtari: '-1||2',
    adSoyadVeyaUnvan: 'ÖRNEK MALİK 3 (Kat İrtifakı Beyan Örneği)',
    tcKimlikVeyaVergiNo: '33333333330',
    hissePay: 1n,
    hissePayda: 1n,
    not: 'Satış',
  },
];

export function loadPersistedWorkspaceState(): PersistedWorkspaceState {
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedWorkspaceState>;
      return {
        preset:
          parsed.preset === 'F5_STANDART' ||
          parsed.preset === 'F6_YAN_YANA' ||
          parsed.preset === 'F7_CIZIM' ||
          parsed.preset === 'F8_DENETIM'
            ? parsed.preset
            : 'F5_STANDART',
        groupLayouts: parsed.groupLayouts ?? {},
        collapsedPanels: parsed.collapsedPanels ?? {},
      };
    }
  } catch {
    // localStorage erişilemezse varsayılan kalıp kullanılır
  }
  return {
    preset: 'F5_STANDART',
    groupLayouts: {},
    collapsedPanels: {},
  };
}

export function savePersistedWorkspaceState(state: PersistedWorkspaceState): void {
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export interface ObjectPrefixCounts {
  readonly MB: number;
  readonly K: number;
  readonly BB: number;
  readonly BBK: number;
  readonly OA: number;
  readonly BLKN: number;
  readonly TRS: number;
  readonly KAPI: number;
  readonly PEN: number;
  readonly MBG: number;
}

export function computeModelObjectCounts(
  objects: readonly ImportedCityObject[]
): ObjectPrefixCounts {
  const counts = {
    MB: 0,
    K: 0,
    BB: 0,
    BBK: 0,
    OA: 0,
    BLKN: 0,
    TRS: 0,
    KAPI: 0,
    PEN: 0,
    MBG: 0,
  };
  for (const o of objects) {
    if (o.prefix === 'MB_') counts.MB++;
    else if (o.prefix === 'K_') counts.K++;
    else if (o.prefix === 'BB_') counts.BB++;
    else if (o.prefix === 'BBK_') counts.BBK++;
    else if (o.prefix === 'OA_') counts.OA++;
    else if (o.prefix === 'BLKN_') counts.BLKN++;
    else if (o.prefix === 'TRS_') counts.TRS++;
    else if (o.prefix === 'KAPI_') counts.KAPI++;
    else if (o.prefix === 'PEN_') counts.PEN++;
    else if (o.prefix === 'MBG_') counts.MBG++;
  }
  return counts;
}

export function computeModelIssueCounts(issues: readonly ValidationIssue[]): {
  readonly H: number;
  readonly U: number;
  readonly B: number;
} {
  let H = 0;
  let U = 0;
  let B = 0;
  for (const i of issues) {
    if (i.severity === 'H') H++;
    else if (i.severity === 'U') U++;
    else B++;
  }
  return { H, U, B };
}
