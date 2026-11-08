// M2 — Dosya doğrulayıcı (şartname §6). Saf TypeScript: DOM, ağ ve dosya erişimi yok.
import type { CodelistRegistry } from '../codelists/index.ts';
import type { ImportedCityObject, ImportedModel, ImportedPolygon } from '../gml/gmlReader.ts';
import type { ValidationSeverity } from '../model/index.ts';
import { KNOWN_SAMPLE_EXCEPTIONS } from './knownSampleExceptions.ts';
import { BB_RULES } from './rulesBb.ts';
import { BUILDING_RULES } from './rulesBuilding.ts';
import { EXTRA_RULES } from './rulesExtra.ts';
import { FILE_RULES } from './rulesFile.ts';
import type { FileRegime, Finding, RuleContext, RuleDefinition, ValidationReport } from './types.ts';

export type { Finding, ValidationReport, RuleDefinition, FileRegime } from './types.ts';

export const ALL_RULES: readonly RuleDefinition[] = [...FILE_RULES, ...BUILDING_RULES, ...BB_RULES, ...EXTRA_RULES];

/** Bir kural kodunun düzeyini döndürür (okuyucu bulgularını aynı sözlükle eşleştirmek için). */
export function ruleSeverity(id: string): ValidationSeverity | undefined {
  return ALL_RULES.find((r) => r.id === id)?.severity;
}

/** Rejim tespiti (N19): binada GroundSurface varsa Sürdürülebilirlik (S), yoksa eski kılavuz (E). */
export function detectRegime(model: ImportedModel): FileRegime {
  const mb = model.objects.find((o) => o.prefix === 'MB_');
  return mb && mb.surfaces.some((s) => s.tag === 'GroundSurface') ? 'S' : 'E';
}

/** Rapor içinde tek kural için en çok tutulan bulgu sayısı; fazlası özetlenir (arayüz başarımı). */
const MAX_PER_RULE = 200;

export function validateCityGml(
  xml: string,
  fileName: string,
  model: ImportedModel,
  codelists: CodelistRegistry
): ValidationReport {
  const clock = (globalThis as { performance?: { now(): number } }).performance;
  const t0 = clock ? clock.now() : 0;
  const regime = detectRegime(model);
  const byPrefixMap = new Map<string, ImportedCityObject[]>();
  for (const o of model.objects) {
    const arr = byPrefixMap.get(o.prefix);
    if (arr) arr.push(o);
    else byPrefixMap.set(o.prefix, [o]);
  }
  const polysCache = new Map<string, readonly ImportedPolygon[]>();
  const ctx: RuleContext = {
    fileName,
    xml,
    model,
    codelists,
    regime,
    building: byPrefixMap.get('MB_')?.[0],
    byPrefix: (p) => byPrefixMap.get(p) ?? [],
    obj: (id) => (id ? model.objectsById[id] : undefined),
    poly: (id) => model.polygonsById[id],
    polysOf: (o) => {
      const hit = polysCache.get(o.gmlId);
      if (hit) return hit;
      const list = o.allPolygonIds.map((id) => model.polygonsById[id]).filter((p): p is ImportedPolygon => p !== undefined);
      polysCache.set(o.gmlId, list);
      return list;
    },
  };

  const cid = ctx.building?.attributesMap.constructionID ?? '';
  const exceptions = KNOWN_SAMPLE_EXCEPTIONS.filter((e) => e.constructionID === cid);

  const findings: Finding[] = [];
  const perRule = new Map<string, number>();
  const overflow = new Map<string, number>();

  const push = (f: Finding) => {
    const n = (perRule.get(f.ruleId) ?? 0) + 1;
    perRule.set(f.ruleId, n);
    if (n > MAX_PER_RULE) {
      overflow.set(f.ruleId, (overflow.get(f.ruleId) ?? 0) + 1);
      return;
    }
    const ex = exceptions.find((e) => e.ruleId === f.ruleId);
    if (ex && f.severity !== ex.downgradeTo) {
      findings.push({ ...f, severity: ex.downgradeTo, downgradedFrom: f.severity, exceptionReason: ex.reason });
    } else {
      findings.push(f);
    }
  };

  // 1) Okuyucunun ürettiği bulgular (V-031, V-060, V-063, V-211, V-213, V-214, V-215) ve arsa payı (V-198…V-212)
  for (const i of [...model.readerIssues, ...model.landShareAnalysis.issues]) push({ ...i });

  // 2) Kurallar
  for (const rule of ALL_RULES) {
    if (!rule.run) continue;
    try {
      rule.run(ctx, (f) => {
        const ruleId = f.ruleId ?? rule.id;
        const severity = f.severity ?? ruleSeverity(ruleId) ?? rule.severity;
        push({ ...f, ruleId, severity });
      });
    } catch (e) {
      push({ ruleId: rule.id, severity: 'U', message: `Kural çalıştırılırken hata: ${(e as Error).message}` });
    }
  }

  for (const [ruleId, n] of overflow) {
    findings.push({ ruleId, severity: 'B', message: `${ruleId}: ${n} bulgu daha var (ilk ${MAX_PER_RULE} tanesi listelendi).` });
  }

  const counts = { H: 0, U: 0, B: 0 };
  for (const f of findings) counts[f.severity]++;
  const byRule: Record<string, number> = {};
  for (const [k, v] of perRule) byRule[k] = v;
  const t1 = clock ? clock.now() : 0;

  return {
    fileName,
    regime,
    findings,
    counts,
    byRule,
    durationMs: Math.round(t1 - t0),
    coverage: ALL_RULES.map((r) => ({ id: r.id, status: r.status, note: r.note })),
  };
}
