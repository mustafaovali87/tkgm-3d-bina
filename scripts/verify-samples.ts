// K60
// K87
// K99
// V-060
// KONTROL-M1 G6: npm run verify:samples <klasör> desteği (klasördeki tüm .gml dosyalarını parseCityGmlModel ile okuyup tek satır JSON özet basar)
import fs from 'node:fs';
import path from 'node:path';
import { sha256Hex } from '../src/core/hash/canonical.ts';
import { inspectCityGmlSample } from '../src/core/gml/readAttributes.ts';
import { parseCityGmlModel } from '../src/core/gml/gmlReader.ts';
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

/**
 * G6: Klasör yolu verildiğinde klasördeki tüm .gml dosyalarını parseCityGmlModel ile okur
 * ve her dosya için tek satırlık JSON özeti döndürür.
 */
export function verifyGmlDirectorySamples(
  targetPath: string,
  rootDir: string = process.cwd()
) {
  const registry = loadDefaultCodelistRegistry(rootDir);
  const resolved = path.resolve(rootDir, targetPath);
  const stat = fs.statSync(resolved);

  const gmlFiles: string[] = [];
  if (stat.isFile() && resolved.toLowerCase().endsWith('.gml')) {
    gmlFiles.push(resolved);
  } else if (stat.isDirectory()) {
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.gml')) {
        gmlFiles.push(path.join(resolved, entry.name));
      }
    }
    gmlFiles.sort();
  }

  return gmlFiles.map((filePath) => {
    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;
    const sizeMB = Number((fileSize / (1024 * 1024)).toFixed(2));
    const xmlText = fs.readFileSync(filePath, 'utf-8');

    const startTime = performance.now();
    const model = parseCityGmlModel(xmlText, fileName, registry);
    const durationMs = Math.round(performance.now() - startTime);
    const memoryMB = Number(
      (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1)
    );

    const allIssues = [...model.readerIssues, ...model.landShareAnalysis.issues];
    let H = 0;
    let U = 0;
    let B = 0;
    for (const issue of allIssues) {
      if (issue.severity === 'H') H++;
      else if (issue.severity === 'U') U++;
      else B++;
    }

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
      issueCounts: { H, U, B },
    };
  });
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const folderArg = process.argv[2];
  if (folderArg) {
    const summaries = verifyGmlDirectorySamples(folderArg);
    for (const row of summaries) {
      console.log(JSON.stringify(row));
    }
  } else {
    const result = verifySamplesAndReferenceFiles();
    console.log(JSON.stringify(result, null, 2));
  }
}
