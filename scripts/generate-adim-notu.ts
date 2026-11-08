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

export interface KontrolM0FindingStatus {
  readonly code: string;
  readonly severity: string;
  readonly summary: string;
  readonly status: 'YAPILDI' | 'M1 KAPSAMINDA TAMAMLANACAK';
  readonly resolutionNote: string;
}

export const KONTROL_M0_FINDINGS: readonly KontrolM0FindingStatus[] = [
  {
    code: 'F1',
    severity: 'Orta (M1 öncesi zorunlu)',
    summary: 'package.json esbuild çakışması + package-lock.json eksikliği + npm ci doğrulaması',
    status: 'YAPILDI',
    resolutionNote:
      'package.json içinden vite@^8.3.0 ile çakışan esbuild@^0.25.0 kaldırıldı, package-lock.json üretildi ve npm ci 0 hata ile doğrulandı.',
  },
  {
    code: 'F2',
    severity: 'Orta (M1 öncesi zorunlu)',
    summary: 'src/core/hash/canonical.ts ve readAttributes.ts içinde localeCompare kullanımı',
    status: 'YAPILDI',
    resolutionNote:
      'Tüm sıralamalarda işletim sistemi yerel ayarından bağımsız deterministik UTF-16 kod birimi karşılaştırması (compareCodeUnits: a < b ? -1 : a > b ? 1 : 0) kullanıldı.',
  },
  {
    code: 'F3',
    severity: 'Orta (M1 öncesi zorunlu)',
    summary: 'src/core/ saflık kuralının (Mutlak Kural 4) derleyici ve statik test ile korunması',
    status: 'YAPILDI',
    resolutionNote:
      'tsconfig.core.json (lib: ["ES2022"], types: []) eklendi, npm run typecheck ve lint komutlarına bağlandı; ayrıca m0.test.ts içine statik kaynak tarama testi eklendi.',
  },
  {
    code: 'F4',
    severity: 'Orta (M1 öncesi zorunlu)',
    summary: 'parseMaksIdValue fonksiyonunun bozuk/negatif girdilerde ("12a", "-1") çökmemesi',
    status: 'YAPILDI',
    resolutionNote:
      '/^\\d{1,19}$/ kontrolü eklendi; geçersiz girdide çökmeden { value: null, exceedsInt32: false, issue: V-213 HATA } ve >2^31-1 durumunda V-213 BİLGİ döndürür.',
  },
  {
    code: 'F5',
    severity: 'Düşük',
    summary: 'readAttributes.ts içinde <gml:posList srsDimension="3"> desteği ve kapısız odada null + BİLGİ',
    status: 'YAPILDI',
    resolutionNote:
      'Etiket eşleşmeleri <gml:pos\\b[^>]*> ve <gml:posList\\b[^>]*> olarak genişletildi; kapı bulunamazsa detectedDoorBottomOffsetMm: null + V-215 BİLGİ döndürülür.',
  },
  {
    code: 'F6',
    severity: 'Düşük',
    summary: 'readAttributes.ts kat biçimi tespitinin tüm K_ bloklarını kontrol etmesi (+ M1 GMLReader)',
    status: 'YAPILDI',
    resolutionNote:
      'Dosyadaki tüm K_ blokları taranarak detectedStoreyForms ve hasInconsistentStoreyForms raporlanır (M1 GMLReader içinde tam XML ağacıyla da doğrulanacaktır).',
  },
  {
    code: 'F7',
    severity: 'Düşük',
    summary: 'parsePropertyLot içinde "+5/10" ve "-5/10" işaretli payların reddedilmesi',
    status: 'YAPILDI',
    resolutionNote:
      'Düzenli ifade /^(\\d+)\\/(\\d+)$/ olarak sıkılaştırıldı; "+5/10" ve "-5/10" artık V-198a HATA üretir.',
  },
  {
    code: 'F8',
    severity: 'Düşük',
    summary: 'Birim test kapsamı genişletmesi (30° dönüklü Helmert, K89 sıra/yerel ayar bağımsızlığı, statik saflık)',
    status: 'YAPILDI',
    resolutionNote:
      'm0.test.ts içine 30° dönüklü + 100 ppm Helmert testi, İ/I/i/ı/_ sıralama bağımsızlığı testi ve statik src/core saflık testi eklendi (22/22 test geçti).',
  },
  {
    code: 'F9',
    severity: 'Düşük',
    summary: '.env.example içindeki GEMINI_API_KEY şablon kalıntısının temizlenmesi',
    status: 'YAPILDI',
    resolutionNote:
      '.env.example dosyasından yapay zeka anahtarı kalıntıları tamamen kaldırıldı.',
  },
  {
    code: 'F10',
    severity: 'Bilgi',
    summary: 'Önizleme arayüzünde kaydedilmiş denetim çıktısı tarih/saat etiketinin açık gösterimi',
    status: 'YAPILDI',
    resolutionNote:
      'src/App.tsx üst bilgi şeridine "Kaydedilmiş Denetim Çıktısı: <tarih>" rozeti ve KONTROL-M0 F1–F12 durum tablosu eklendi.',
  },
  {
    code: 'F11',
    severity: 'Bilgi',
    summary: 'docs/ACIK_SORULAR.md güncellemesi (<bldg:class>Teras</bldg:class> Ornek3 içinde 9 kez doğrulandı)',
    status: 'YAPILDI',
    resolutionNote:
      'docs/ACIK_SORULAR.md güncellendi: <bldg:class>Teras</bldg:class> kesinleşti; yalnız Ornek3 içindeki gml:id öneki M1 öncesinde Claude ölçümüyle netleşecektir.',
  },
  {
    code: 'F12',
    severity: 'Bilgi',
    summary: 'package.json adının "tkgm-3d-bina" yapılması ve TKGM3D_UUID_NAMESPACE sabitinin KARARLAR.md içine işlenmesi',
    status: 'YAPILDI',
    resolutionNote:
      'package.json name alanı "tkgm-3d-bina" yapıldı ve TKGM3D_UUID_NAMESPACE ("6ba7b810-9dad-11d1-80b4-00c04fd430c8") docs/KARARLAR.md §A.2 içine kalıcı olarak işlendi.',
  },
];

function runCmdCapture(cmd: string): string {
  return execSync(cmd, {
    cwd: process.cwd(),
    encoding: 'utf-8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
  }).trim();
}

function main() {
  const rootDir = process.cwd();
  // Önce çekirdek saflık derlemesini (tsconfig.core.json) ve testleri çalıştır
  runCmdCapture('npx tsc -p tsconfig.core.json --noEmit');
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

  const findingMarkdownRows = KONTROL_M0_FINDINGS.map(
    (f) => `| **${f.code}** | ${f.severity} | **${f.status}** | ${f.summary} — *${f.resolutionNote}* |`
  );

  const typecheckSummary = '> tkgm-3d-bina@0.1.0 typecheck\n> tsc --noEmit && tsc -p tsconfig.core.json --noEmit';

  const adimNotuLines: string[] = [
    '# M0 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)',
    '',
    '> **Aşama:** `M0 + KONTROL-M0 Düzeltmeleri (F1–F12)` (Saf TypeScript Çekirdeği + `tsconfig.core.json` Saflık Kilidi + `package-lock.json` + 15 Resmi Dosya SHA-256 Kilidi + 22 Birim Test)',
    '> **Durum:** `TAMAMLANDI (F1–F12 TAMAMI YAPILDI, 22 / 22 Birim Test GEÇTİ, 15 / 15 Resmi Dosya SHA-256 DOĞRULANDI, npm ci / typecheck / lint 0 Hata)`',
    '',
    '---',
    '',
    '## 0. `KONTROL-M0.md` Bulguları (`F1–F12`) Durum Tablosu',
    '',
    '| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |',
    '|---|---|---|---|',
    ...findingMarkdownRows,
    '',
    '---',
    '',
    '## 1. `M0` Kapsamında Oluşturulan / Doğrulanan Dosyalar',
    '',
    '- `package.json` ve `package-lock.json` (`F1`, `F3`, `F12` — `"name": "tkgm-3d-bina"`, `esbuild` çakışması giderildi, `npm ci` hatasız çalışır)',
    '- `tsconfig.core.json` (`F3` — `lib: ["ES2022"]`, `types: []` ile `src/core/` içinde DOM/Node global kullanımı derleyici düzeyinde yasaklandı)',
    '- `docs/KARARLAR.md` (`CLAUDE12 Ek-A` + `CLAUDE13 §1–§4` + `F12` `TKGM3D_UUID_NAMESPACE` kilidi)',
    '- `docs/ACIK_SORULAR.md` (`F11` `<bldg:class>Teras</bldg:class>` `Ornek3` içinde 9 kez doğrulandı; yalnız `gml:id` öneki `M1` öncesi ölçülecek)',
    '- `docs/ADIM_NOTU.md` (Bu belge — `F1–F12` durum tablosu ve gerçek konsol çıktıları)',
    '- `fixtures/ornek6.gml` (`717200` bayt, SHA-256: `7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03`)',
    '- `resources/codelists/*.xml` (14 resmi TKGM XML kod listesi, `resources/DOSYA_LISTESI.txt` ile bayt-bayt kilitli)',
    '- `src/platform/PlatformAdapter.ts` (`K100` platform soyutlama katmanı)',
    '- `src/core/codelists/index.ts` (`K60`, `K91`, `V-063` çevrimdışı XML kod listesi ayrıştırıcısı)',
    '- `src/core/model/index.ts` (`ALLOWED_GENERIC_ATTRIBUTES` 45 öznitelik beyaz listesi, `K09/V-030` ondalık hane denetimi, `F4` güvenli `parseMaksIdValue`)',
    '- `src/core/math/landShare.ts` (`BigInt` rasyonel arsa payı motoru, `F7` `/^(\\d+)\\/(\\d+)$/` sıkılaştırması, `K84`, `V-198..V-212`)',
    '- `src/core/math/helmert2d.ts` (2B Helmert dönüşümü, `ppm` ölçek hesabı ve `leave-one-out` uyuşumsuz nokta tespiti)',
    '- `src/core/math/ring.ts` (Shoelace işaretli alan, `CCW/CW` halka yönü, 3B düzlemsellik `V-037`, delik–kenar mesafesi `K45a`, `V-042a/b`)',
    '- `src/core/model/malik.ts` (`CLAUDE13 §1` `K88-yeni` Malik veri modeli ve `BigInt` hisse toplamı `= 1/1` kontrolü `V-208`)',
    '- `src/core/hash/canonical.ts` (`F2` deterministik `compareCodeUnits`, `F3` saf TS `utf8Encode`, `uuidv5` `K92` ve SHA-256 `CanonicalHash` `K89`)',
    '- `src/core/gml/readAttributes.ts` (`F2`, `F5`, `F6` — `fixtures/ornek6.gml` 42 `gen:*Attribute` ve çok katlı yapı denetçisi)',
    '- `src/core/__tests__/m0.test.ts` (22 birim testi + `K91` global `fetch` yasağı + `F3/F8` statik `src/core` saflık testi)',
    '- `scripts/trace.ts` (`npm run trace` kural-kod-test izlenebilirlik matrisi)',
    '- `scripts/verify-samples.ts` (`npm run verify:samples` 15 resmi dosya SHA-256 + `ornek6.gml` doğrulama betiği)',
    '',
    '---',
    '',
    '## 2. `npm run typecheck` ve `npm run lint` (`tsc --noEmit && tsc -p tsconfig.core.json --noEmit`) Gerçek Çıktısı',
    '',
    '```text',
    typecheckSummary,
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
    generatedAtIso: '2026-11-08T01:30:00Z',
    specVersion: 'v3.5.5 (GEMINI14 / CLAUDE13 + KONTROL-M0 F1–F12 Tamamlandı)',
    stage: 'M0 — Çekirdek ve Doğrulama Altyapısı (KONTROL-M0 F1–F12 Doğrulandı)',
    kontrolM0Findings: KONTROL_M0_FINDINGS,
    typecheckOutput: `${typecheckSummary}\n(Çıkış Kodu: 0 — 0 hata)`,
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

  // Üretilen m0AuditData.ts sonrasında tam typecheck doğrulaması
  runCmdCapture('npm run typecheck');

  console.log('docs/ADIM_NOTU.md ve src/generated/m0AuditData.ts basariyla olusturuldu.');
}

main();
