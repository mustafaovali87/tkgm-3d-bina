// K60
// K87
// K99
// V-060
import fs from 'node:fs';
import path from 'node:path';
import { sha256Hex } from '../src/core/hash/canonical.ts';
import { inspectCityGmlSample } from '../src/core/gml/readAttributes.ts';
import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  OfficialCodelistName,
} from '../src/core/codelists/index.ts';

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

  const xmlMap = {} as Record<OfficialCodelistName, string>;
  for (const name of OFFICIAL_CODELIST_NAMES) {
    const p = path.join(rootDir, 'resources', 'codelists', `${name}.xml`);
    xmlMap[name] = fs.readFileSync(p, 'utf-8');
  }
  const registry = createCodelistRegistryFromXmlMap(xmlMap);
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

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const result = verifySamplesAndReferenceFiles();
  console.log(JSON.stringify(result, null, 2));
}
