// Şartname §6.14: TKGM örneklerinde kural ile çelişen ama TKGM'nin kabul ettiği bilinen durumlar.
// Her kayıt gerekçe ve ölçüm kaynağı taşır. Eşleşen bulgunun düzeyi BİLGİ'ye düşürülür; bulgu silinmez.
import type { ValidationSeverity } from '../model/index.ts';

export interface KnownSampleException {
  /** Dosyanın constructionID değeri. */
  readonly constructionID: string;
  readonly ruleId: string;
  readonly reason: string;
  readonly downgradeTo: ValidationSeverity;
}

export const KNOWN_SAMPLE_EXCEPTIONS: readonly KnownSampleException[] = [
  {
    constructionID: '104527-A',
    ruleId: 'V-186',
    reason: 'Ornek2 balkonlarında geometrySuitability = 1002 (şartname §6.14 bilinen istisna; TKGM resmi örneği).',
    downgradeTo: 'B',
  },
];
