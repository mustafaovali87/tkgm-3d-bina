// M2 — Dosya doğrulayıcı tipleri (şartname §6.1)
import type { CodelistRegistry } from '../codelists/index.ts';
import type { ImportedCityObject, ImportedModel, ImportedPolygon } from '../gml/gmlReader.ts';
import type { ValidationIssue, ValidationSeverity } from '../model/index.ts';

/**
 * Doğrulama bulgusu. `ValidationIssue` ile uyumludur (doğrulama paneli aynı tipi kullanır).
 * - `tkgmMessage`: TKGM doğrulayıcısının mesajı (şartname §6, mümkünse birebir).
 * - `polygonGmlId`: 3B sahnede kırmızı vurgulanacak poligon (varsa).
 */
export interface Finding extends ValidationIssue {
  readonly tkgmMessage?: string;
  readonly polygonGmlId?: string;
  /** Bulgu bir bilinen istisna nedeniyle düşürüldüyse özgün düzey ve gerekçe. */
  readonly downgradedFrom?: ValidationSeverity;
  readonly exceptionReason?: string;
}

/**
 * Dosya rejimi (N19, AS-1):
 * - `S`: Sürdürülebilirlik rejimi (Kılavuz v3.x). LoD2'de GroundSurface var. Ornek1–6.
 * - `E`: Eski kılavuz dönemi. GroundSurface yok; MAKS/tapu öznitelikleri ve açıklıklar eksik olabilir. Amasya, Sincan.
 */
export type FileRegime = 'S' | 'E';

export interface RuleContext {
  readonly fileName: string;
  readonly xml: string;
  readonly model: ImportedModel;
  readonly codelists: CodelistRegistry;
  readonly regime: FileRegime;
  readonly building: ImportedCityObject | undefined;
  readonly byPrefix: (prefix: string) => readonly ImportedCityObject[];
  readonly obj: (gmlId: string | null | undefined) => ImportedCityObject | undefined;
  readonly poly: (gmlId: string) => ImportedPolygon | undefined;
  /** Nesnenin tüm poligonları (satır içi + xlink ile çözülmüş). */
  readonly polysOf: (o: ImportedCityObject) => readonly ImportedPolygon[];
}

export type RuleStatus = 'uygulandi' | 'okuyucuda' | 'sunucu' | 'kismi' | 'ertelendi';

export interface RuleDefinition {
  readonly id: string;
  readonly severity: ValidationSeverity;
  /** Kural kaynağı (şartname §6.14: kaynaksız kural yazılmaz). */
  readonly source: string;
  readonly status: RuleStatus;
  /** `ertelendi` / `sunucu` / `kismi` için gerekçe. */
  readonly note?: string;
  readonly run?: (ctx: RuleContext, emit: Emit) => void;
}

/** Bulgu üretici. `ruleId` verilmezse kuralın kendi kodu, `severity` verilmezse kuralın düzeyi kullanılır. */
export type Emit = (f: Omit<Finding, 'ruleId' | 'severity'> & { ruleId?: string; severity?: ValidationSeverity }) => void;

export interface ValidationReport {
  readonly fileName: string;
  readonly regime: FileRegime;
  readonly findings: readonly Finding[];
  readonly counts: { readonly H: number; readonly U: number; readonly B: number };
  /** Kural kodu → bulgu sayısı (düşürülenler dahil). */
  readonly byRule: Readonly<Record<string, number>>;
  readonly durationMs: number;
  readonly coverage: ReadonlyArray<{ readonly id: string; readonly status: RuleStatus; readonly note?: string }>;
}
