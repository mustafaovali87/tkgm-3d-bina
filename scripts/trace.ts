// K98
import fs from 'node:fs';
import path from 'node:path';

interface TraceMatrixRow {
  readonly ruleId: string;
  readonly sourceFiles: readonly string[];
  readonly testFiles: readonly string[];
}

function walkTsFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkTsFiles(full, acc);
    } else if (entry.isFile() && full.endsWith('.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

function extractRuleTagsFromContent(content: string): Set<string> {
  const found = new Set<string>();
  const re = /\b(K\d{2,3}a?|V-\d{3}[ab]?)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    found.add(m[1]);
  }
  return found;
}

export function generateTraceabilityReport(rootDir: string = process.cwd()): {
  readonly rows: readonly TraceMatrixRow[];
  readonly summaryText: string;
} {
  const coreDir = path.join(rootDir, 'src', 'core');
  const platformDir = path.join(rootDir, 'src', 'platform');
  const allFiles = [...walkTsFiles(coreDir), ...walkTsFiles(platformDir)];

  const sourceFiles = allFiles.filter((f) => !f.includes('__tests__') && !f.endsWith('.test.ts'));
  const testFiles = allFiles.filter((f) => f.includes('__tests__') || f.endsWith('.test.ts'));

  const ruleMap = new Map<string, { sources: Set<string>; tests: Set<string> }>();

  for (const sf of sourceFiles) {
    const rel = path.relative(rootDir, sf).replace(/\\/g, '/');
    const content = fs.readFileSync(sf, 'utf-8');
    const tags = extractRuleTagsFromContent(content);
    for (const tag of tags) {
      if (!ruleMap.has(tag)) {
        ruleMap.set(tag, { sources: new Set(), tests: new Set() });
      }
      ruleMap.get(tag)!.sources.add(rel);
    }
  }

  for (const tf of testFiles) {
    const rel = path.relative(rootDir, tf).replace(/\\/g, '/');
    const content = fs.readFileSync(tf, 'utf-8');
    const tags = extractRuleTagsFromContent(content);
    for (const tag of tags) {
      if (!ruleMap.has(tag)) {
        ruleMap.set(tag, { sources: new Set(), tests: new Set() });
      }
      ruleMap.get(tag)!.tests.add(rel);
    }
  }

  const sortedRules = Array.from(ruleMap.keys()).sort((a, b) =>
    a.localeCompare(b, 'en', { numeric: true })
  );

  const rows: TraceMatrixRow[] = sortedRules.map((ruleId) => {
    const entry = ruleMap.get(ruleId)!;
    return {
      ruleId,
      sourceFiles: Array.from(entry.sources).sort(),
      testFiles: Array.from(entry.tests).sort(),
    };
  });

  const lines: string[] = [
    '=== TKGM 3B BINA M0 KURAL-KOD-TEST IZLENEBILIRLIK MATRISI (K98) ===',
    `Toplam Izlenen Kural Sayisi (M0 Cekirdek): ${rows.length}`,
    '----------------------------------------------------------------------',
    'KURAL   | KAYNAK MODULLER                        | TEST DOSYALARI',
    '----------------------------------------------------------------------',
  ];

  for (const r of rows) {
    const srcText = r.sourceFiles.join(', ') || '-';
    const tstText = r.testFiles.join(', ') || '-';
    lines.push(`${r.ruleId.padEnd(7)} | ${srcText.padEnd(38)} | ${tstText}`);
  }

  return {
    rows,
    summaryText: lines.join('\n'),
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const report = generateTraceabilityReport();
  console.log(report.summaryText);
}
