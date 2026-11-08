// K60
// K87
// K99
// V-060
// KONTROL-M1 G6 & KONTROL-M1-2 R1 / §4.4: npm run verify:samples <klasör> özyinelemeli (recursive) tarama + hata yakalama ve çıkış kodu 1 desteği
import fs from 'node:fs';
import path from 'node:path';
import { sha256Hex } from '../src/core/hash/canonical.ts';
import { inspectCityGmlSample } from '../src/core/gml/readAttributes.ts';
import { parseCityGmlModel } from '../src/core/gml/gmlReader.ts';
import { validateCityGml } from '../src/core/validation/index.ts';
import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  OfficialCodelistName,
} from '../src/core/codelists/index.ts';

function loadDefaultCodelistRegistry(rootDir: string) {
  const xmlMap = {} as Record<OfficialCodelistName, string>;
  for (const name of OFFICIAL_CODELIST_NAMES) {
    const p = path.join(rootDir, 'resources', 'codelists', `${name}.xml`);
    xmlMap[name] = fs.readFileSync(p, 'utf-8');
  }
  return createCodelistRegistryFromXmlMap(xmlMap);
}

export function verifySamplesAndReferenceFiles(rootDir: string = process.cwd()) {
  const dosyaListesiPath = path.join(rootDir, 'resources', 'DOSYA_LISTESI.txt');
  const dosyaListesiRaw = fs.readFileSync(dosyaListesiPath, 'utf-8');
  const lines = dosyaListesiRaw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('dosya'));

  const fileChecks = lines.map((line) => {
    const [relName, expectedBytesStr, expectedSha256] = line.split(/\t+/);
    const actualPath =
      relName === 'ornek6.gml'
        ? path.join(rootDir, 'fixtures', 'ornek6.gml')
        : path.join(rootDir, 'resources', relName);

    const bytes = fs.readFileSync(actualPath);
    const actualBytes = bytes.byteLength;
    const actualSha256 = sha256Hex(bytes);
    const expectedBytes = Number.parseInt(expectedBytesStr, 10);

    const matches =
      actualBytes === expectedBytes && actualSha256 === expectedSha256;
    if (!matches) {
      throw new Error(
        `SHA-256 / Boyut uyusmazligi (${relName}): beklenen=${expectedBytes}/${expectedSha256}, olculen=${actualBytes}/${actualSha256}`
      );
    }

    return {
      file: relName,
      sizeBytes: actualBytes,
      sha256: actualSha256,
      verified: true,
    };
  });

  const registry = loadDefaultCodelistRegistry(rootDir);
  const codelistSummary = registry.getAllLists().map((cl) => ({
    listName: cl.listName,
    entryCount: cl.entries.length,
    duplicateDefinitionIds: cl.duplicateDefinitionIds,
  }));

  const ornek6Xml = fs.readFileSync(
    path.join(rootDir, 'fixtures', 'ornek6.gml'),
    'utf-8'
  );
  const ornek6Report = inspectCityGmlSample(ornek6Xml);

  if (!ornek6Report.matchesOrnek6Expected42) {
    throw new Error(
      'fixtures/ornek6.gml icindeki gen:*Attribute listesi docs/KARARLAR.md §A.3 (42 oznitelik) ile eslesmedi!'
    );
  }
  if (ornek6Report.unauthorizedAttributes.length > 0) {
    throw new Error(
      `Yetkisiz gen:*Attribute tespit edildi: ${ornek6Report.unauthorizedAttributes.join(', ')}`
    );
  }

  return {
    verifiedFileCount: fileChecks.length,
    all15ReferenceFilesVerified: fileChecks.every((f) => f.verified),
    referenceFiles: fileChecks,
    codelistSummary,
    ornek6Inspection: ornek6Report,
  };
}

export type SampleVerificationRow =
  | {
      readonly fileName: string;
      readonly sizeMB: number;
      readonly durationMs: number;
      readonly memoryMB: number;
      readonly objectCount: number;
      readonly polygonCount: number;
      readonly detectedStoreyForm: string;
      readonly detectedDoorBottomOffsetMm: number | null;
      readonly detectedProducerProfile: string;
      readonly landShareTotal: string;
      readonly hasPropertyLotData: boolean;
      readonly regime: string;
      readonly validationMs: number;
      readonly issueCounts: {
        readonly H: number;
        readonly U: number;
        readonly B: number;
      };
      readonly topRules: readonly string[];
    }
  | {
      readonly fileName: string;
      readonly error: string;
    };

function collectGmlFilesRecursive(dirPath: string, outFiles: string[]): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectGmlFilesRecursive(fullPath, outFiles);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.gml')) {
      outFiles.push(fullPath);
    }
  }
}

/**
 * G6 & R1 (§4.4): Klasör yolu verildiğinde klasörü ve alt klasörlerini özyinelemeli tarayarak
 * tüm .gml dosyalarını parseCityGmlModel ile okur.
 * Açılamayan dosya için `{"fileName":...,"error":...}` satırı üretir ve `hasError: true` döndürür.
 */
export function verifyGmlDirectorySamples(
  targetPath: string,
  rootDir: string = process.cwd()
): {
  readonly rows: readonly SampleVerificationRow[];
  readonly hasError: boolean;
} {
  const registry = loadDefaultCodelistRegistry(rootDir);
  const resolved = path.resolve(rootDir, targetPath);
  const stat = fs.statSync(resolved);

  const gmlFiles: string[] = [];
  if (stat.isFile() && resolved.toLowerCase().endsWith('.gml')) {
    gmlFiles.push(resolved);
  } else if (stat.isDirectory()) {
    collectGmlFilesRecursive(resolved, gmlFiles);
    gmlFiles.sort();
  }

  let hasError = false;
  const rows: SampleVerificationRow[] = gmlFiles.map((filePath) => {
    const relFromTarget = stat.isDirectory()
      ? path.relative(resolved, filePath).replace(/\\/g, '/')
      : path.basename(filePath);
    const fileName = relFromTarget || path.basename(filePath);

    try {
      const fileSize = fs.statSync(filePath).size;
      const sizeMB = Number((fileSize / (1024 * 1024)).toFixed(2));
      const xmlText = fs.readFileSync(filePath, 'utf-8');

      const startTime = performance.now();
      const model = parseCityGmlModel(xmlText, fileName, registry);
      const durationMs = Math.round(performance.now() - startTime);
      const memoryMB = Number(
        (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1)
      );

      // M2: Doğrulayıcı (şartname §6). Dosya adında "M-…" bölümü varsa o kullanılır
      // (yerel kopyalara eklenen "Ornek1-" gibi ön ekler V-001'i yanlış tetiklemesin).
      const tkgmName = (/M-[^\\/]*\.gml$/i.exec(path.basename(filePath)) ?? [path.basename(filePath)])[0];
      const report = validateCityGml(xmlText, tkgmName, model, registry);
      const ruleCounts = new Map<string, number>();
      for (const f of report.findings) {
        if (f.severity === 'B') continue;
        const k = `${f.severity}:${f.ruleId}`;
        ruleCounts.set(k, (ruleCounts.get(k) ?? 0) + 1);
      }
      const topRules = [...ruleCounts.entries()]
        .sort((a, b) => (a[0][0] === b[0][0] ? b[1] - a[1] : a[0] < b[0] ? -1 : 1))
        .slice(0, 5)
        .map(([k, n]) => `${k}x${n}`);

      return {
        fileName,
        sizeMB,
        durationMs,
        memoryMB,
        objectCount: model.objects.length,
        polygonCount: model.polygons.length,
        detectedStoreyForm: model.detectedStoreyForm,
        detectedDoorBottomOffsetMm: model.detectedDoorBottomOffsetMm,
        detectedProducerProfile: model.detectedProducerProfile,
        landShareTotal: model.landShareAnalysis.formattedTotalUnreduced,
        hasPropertyLotData: model.landShareAnalysis.hasPropertyLotData,
        regime: report.regime,
        validationMs: report.durationMs,
        issueCounts: report.counts,
        topRules,
      };
    } catch (err) {
      hasError = true;
      const message = err instanceof Error ? err.message : String(err);
      return {
        fileName,
        error: message,
      };
    }
  });

  return { rows, hasError };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const folderArg = process.argv[2];
  if (folderArg) {
    const { rows, hasError } = verifyGmlDirectorySamples(folderArg);
    for (const row of rows) {
      console.log(JSON.stringify(row));
    }
    if (hasError) {
      process.exit(1);
    }
  } else {
    const result = verifySamplesAndReferenceFiles();
    console.log(JSON.stringify(result, null, 2));
  }
}
