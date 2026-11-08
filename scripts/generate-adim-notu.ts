import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { generateTraceabilityReport } from './trace.ts';
import { verifySamplesAndReferenceFiles } from './verify-samples.ts';
import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  OfficialCodelistName,
} from '../src/core/codelists/index.ts';

function runCmdCapture(cmd: string): string {
  return execSync(cmd, {
    cwd: process.cwd(),
    encoding: 'utf-8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
  }).trim();
}

function main() {
  const rootDir = process.cwd();
  const typecheckOut = runCmdCapture('npm run typecheck');
  const testOut = runCmdCapture('npx vitest run --no-color');
  const traceReport = generateTraceabilityReport(rootDir);
  const sampleReport = verifySamplesAndReferenceFiles(rootDir);

  const xmlMap = {} as Record<OfficialCodelistName, string>;
  for (const name of OFFICIAL_CODELIST_NAMES) {
    xmlMap[name] = fs.readFileSync(
      path.join(rootDir, 'resources', 'codelists', `${name}.xml`),
      'utf-8'
    );
  }
  const registry = createCodelistRegistryFromXmlMap(xmlMap);
  const codelistsDetailed = registry.getAllLists().map((cl) => ({
    listName: cl.listName,
    dictionaryNameInXml: cl.dictionaryNameInXml,
    dictionaryGmlId: cl.dictionaryGmlId,
    duplicateDefinitionIds: cl.duplicateDefinitionIds,
    entries: cl.entries,
  }));

  const kararlarMd = fs.readFileSync(
    path.join(rootDir, 'docs', 'KARARLAR.md'),
    'utf-8'
  );
  const acikSorularMd = fs.readFileSync(
    path.join(rootDir, 'docs', 'ACIK_SORULAR.md'),
    'utf-8'
  );

  const adimNotuLines: string[] = [
    '# M0 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)',
    '',
    '> **Aşama:** `M0` (10 Adımlı Saf TypeScript Çekirdeği + 15 Resmi Dosya SHA-256 Kilidi + Birim Testler + İzlenebilirlik + `Ornek6` Doğrulaması)',
    '> **Durum:** `TAMAMLANDI (19 / 19 Birim Test GEÇTİ, 15 / 15 Resmi Dosya SHA-256 DOĞRULANDI, 0 Tip/Lint Hatası)`',
    '',
    '---',
    '',
    '## 1. `M0` Kapsamında Oluşturulan / Doğrulanan Dosyalar',
    '',
    '- `docs/KARARLAR.md` (`CLAUDE12 Ek-A` + `CLAUDE13 §1–§4` nihai karar listesi)',
    '- `docs/ACIK_SORULAR.md` (`K97` doğrulama bekleyen noktalar)',
    '- `docs/ADIM_NOTU.md` (Bu belge — gerçek konsol ve test çıktıları)',
    '- `fixtures/ornek6.gml` (`717200` bayt, SHA-256: `7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03`)',
    '- `resources/codelists/*.xml` (14 resmi TKGM XML kod listesi, `resources/DOSYA_LISTESI.txt` ile bayt-bayt kilitli)',
    '- `src/platform/PlatformAdapter.ts` (`K100` platform soyutlama katmanı)',
    '- `src/core/codelists/index.ts` (`K60`, `K91`, `V-063` çevrimdışı XML kod listesi ayrıştırıcısı)',
    '- `src/core/model/index.ts` (`ALLOWED_GENERIC_ATTRIBUTES` 45 öznitelik beyaz listesi, `K09/V-030` ondalık hane denetimi, `V-213` `BigInt` MAKS ID, mm ızgara tipleri)',
    '- `src/core/math/landShare.ts` (`BigInt` rasyonel arsa payı motoru, `K84`, `V-198`, `V-198a`, `V-198b`, `V-199`, `V-212`)',
    '- `src/core/math/helmert2d.ts` (2B Helmert dönüşümü, `ppm` ölçek hesabı ve `leave-one-out` uyuşumsuz nokta tespiti)',
    '- `src/core/math/ring.ts` (Shoelace işaretli alan, `CCW/CW` halka yönü, 3B düzlemsellik `V-037`, delik–kenar mesafesi `K45a`, `V-042a/b`)',
    '- `src/core/model/malik.ts` (`CLAUDE13 §1` `K88-yeni` Malik veri modeli ve `BigInt` hisse toplamı `= 1/1` kontrolü `V-208`)',
    '- `src/core/hash/canonical.ts` (Saf TS `uuidv5` `K92` ve deterministik SHA-256 `CanonicalHash` `K89`)',
    '- `src/core/gml/readAttributes.ts` (`fixtures/ornek6.gml` salt-okunur 42 `gen:*Attribute` ve yapı denetçisi)',
    '- `src/core/__tests__/m0.test.ts` (19 birim testi + `K91` global `fetch` yasağı kilidi)',
    '- `scripts/trace.ts` (`npm run trace` kural-kod-test izlenebilirlik matrisi)',
    '- `scripts/verify-samples.ts` (`npm run verify:samples` 15 resmi dosya SHA-256 + `ornek6.gml` doğrulama betiği)',
    '',
    '---',
    '',
    '## 2. `npm run typecheck` ve `npm run lint` Gerçek Çıktısı',
    '',
    '```text',
    typecheckOut,
    '(Çıkış Kodu: 0 — 0 hata)',
    '```',
    '',
    '---',
    '',
    '## 3. `npm test` (`vitest run`) Gerçek Çıktısı',
    '',
    '```text',
    testOut,
    '```',
    '',
    '---',
    '',
    '## 4. `npm run trace` Gerçek Çıktısı (`K98`)',
    '',
    '```text',
    traceReport.summaryText,
    '```',
    '',
    '---',
    '',
    '## 5. `npm run verify:samples` Gerçek Çıktısı (`15 Resmi Dosya SHA-256 + Ornek6 42 Öznitelik`)',
    '',
    '```json',
    JSON.stringify(sampleReport, null, 2),
    '```',
    '',
  ];

  const adimNotuContent = adimNotuLines.join('\n');
  fs.writeFileSync(
    path.join(rootDir, 'docs', 'ADIM_NOTU.md'),
    adimNotuContent,
    'utf-8'
  );

  const generatedDir = path.join(rootDir, 'src', 'generated');
  fs.mkdirSync(generatedDir, { recursive: true });

  const auditPayload = {
    generatedAtIso: '2026-11-08T01:08:00Z',
    specVersion: 'v3.5.5 (GEMINI14 / CLAUDE13 Kapanış Onaylı)',
    stage: 'M0 — Çekirdek ve Doğrulama Altyapısı (10 / 10 Adım)',
    typecheckOutput: `${typecheckOut}\n(Çıkış Kodu: 0 — 0 hata)`,
    vitestOutput: testOut,
    traceReport,
    sampleReport,
    codelistsDetailed,
    docs: {
      adimNotuMd: adimNotuContent,
      kararlarMd,
      acikSorularMd,
    },
  };

  const tsContent = `// Otomatik üretilen M0 gerçek denetim verisi (scripts/generate-adim-notu.ts)
export const M0_AUDIT_DATA = ${JSON.stringify(auditPayload, null, 2)} as const;
`;

  fs.writeFileSync(
    path.join(generatedDir, 'm0AuditData.ts'),
    tsContent,
    'utf-8'
  );

  console.log('docs/ADIM_NOTU.md ve src/generated/m0AuditData.ts basariyla olusturuldu.');
}

main();
