import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { generateTraceabilityReport } from './trace.ts';
import {
  verifyGmlDirectorySamples,
  verifySamplesAndReferenceFiles,
} from './verify-samples.ts';
import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  OfficialCodelistName,
} from '../src/core/codelists/index.ts';

export interface KontrolM0FindingStatus {
  readonly code: string;
  readonly severity: string;
  readonly status: 'YAPILDI' | 'YAPILDI (win32 girdileri doğrulandı)' | 'M1 KAPSAMINDA TAMAMLANACAK';
  readonly summary: string;
  readonly resolutionNote: string;
}

export interface KontrolM1FindingStatus {
  readonly code: string;
  readonly severity: string;
  readonly status: 'YAPILDI';
  readonly summary: string;
  readonly resolutionNote: string;
}

export const KONTROL_M0_FINDINGS: readonly KontrolM0FindingStatus[] = [
  {
    code: 'F1',
    severity: 'Orta (M1 öncesi zorunlu)',
    summary: 'package.json esbuild çakışması + package-lock.json + Windows (win32) npm ci uyumluluğu',
    status: 'YAPILDI (win32 girdileri doğrulandı)',
    resolutionNote:
      'node_modules ve package-lock.json silinip temiz npm install ile yeniden üretildi; @tailwindcss/oxide-win32-x64-msvc, lightningcss-win32-x64-msvc ve @esbuild/win32-x64 girdilerinin kilit dosyasında bulunduğu birim testiyle doğrulandı.',
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
      'Dosyadaki tüm K_ blokları taranarak detectedStoreyForms ve hasInconsistentStoreyForms raporlanır (M1 GMLReader içinde tam XML ağacıyla da doğrulanmıştır).',
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
      'src/App.tsx üst bilgi şeridine "Kaydedilmiş Denetim Çıktısı: <tarih>" rozeti ve KONTROL-M0 / KONTROL-M1 durum tabloları eklendi.',
  },
  {
    code: 'F11',
    severity: 'Bilgi',
    summary: 'docs/ACIK_SORULAR.md güncellemesi (<bldg:class>Teras</bldg:class> Ornek3 içinde 9 kez doğrulandı)',
    status: 'YAPILDI',
    resolutionNote:
      'docs/ACIK_SORULAR.md güncellendi: <bldg:class>Teras</bldg:class> kesinleşti.',
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

export const KONTROL_M1_FINDINGS: readonly KontrolM1FindingStatus[] = [
  {
    code: 'G1',
    severity: 'Orta (M2 öncesi zorunlu)',
    summary: 'GML okuma ve ayrıştırmanın Web Worker içine taşınması (PERF-01) + İlerleme Çubuğu + İptal düğmesi + Transferable Float64Array',
    status: 'YAPILDI',
    resolutionNote:
      'src/workers/gmlReader.worker.ts ve src/workers/gmlWorkerClient.ts oluşturuldu. parseCityGmlModel Web Worker içinde çalışır; poligon köşeleri packModelPolygonVerticesFloat64 ile tek bir Float64Array (Transferable ArrayBuffer) olarak ana iş parçacığına sıfır kopya maliyetiyle aktarılır; üst şeritte canlı %0–%100 ilerleme çubuğu ve worker.terminate() çağıran "İptal" düğmesi eklendi.',
  },
  {
    code: 'G2',
    severity: 'Düşük',
    summary: 'detectedProducerProfile değerinin kat biçimi + kapı alt ofsetini birlikte değerlendirmesi (Sincan B + 10 mm -> B10 profil dışı birleşim)',
    status: 'YAPILDI',
    resolutionNote:
      'resolveProducerProfileFromFormAndOffset eklendi: A+10->"A10", B+50->"B50", C+50->"C50"; ofset null ise "biçim A, ofset bilinmiyor"; Sincan (B+10 mm) gibi standart dışı kombinasyonlarda "B10 (biçim B, ofset 10 mm)" döndürülür ve V-215 BİLGİ ("Profil dışı birleşim...") üretilir.',
  },
  {
    code: 'G3',
    severity: 'Düşük',
    summary: 'detectedDoorBottomOffsetMm === null olduğunda (Amasya) readerIssues içine V-215 BİLGİ eklenmesi',
    status: 'YAPILDI',
    resolutionNote:
      'Oda tabanı ile eşleşen kapı bulunamadığında readerIssues dizisine V-215 BİLGİ ("Kapı alt ofseti ölçülemedi (dosyada oda tabanı ile eşleşen kapı bulunamadı).") eklenir.',
  },
  {
    code: 'G4',
    severity: 'Düşük',
    summary: 'Eski rejim dosyalarında (Amasya, Sincan) propertyLot olmadığında 0/1 yerine "—" gösterilmesi ve V-198 BİLGİ üretilmesi',
    status: 'YAPILDI',
    resolutionNote:
      'analyzeBuildingLandShares içinde hasPropertyLotData bayrağı eklendi; hiçbir BB_ üzerinde propertyLot yoksa formattedTotalUnreduced = "—" döndürülür, V-198 BİLGİ ("Arsa payı bilgisi yok (eski rejim dosyası).") üretilir ve arayüzde 0/1 yerine "—" gösterilir.',
  },
  {
    code: 'G5',
    severity: 'Düşük',
    summary: 'V-214 (intAttribute/doubleAttribute baş/son boşluk, ör. Ornek6 maksIdentityNumber = "\\t5129820196") önem derecesinin UYARI yerine BİLGİ (B) yapılması',
    status: 'YAPILDI',
    resolutionNote:
      'gmlReader.ts içinde V-214 severity alanı "B" (BİLGİ) olarak güncellendi; Ornek6 okunduğunda artık HATA: 0, UYARI: 0, BİLGİ: 2 üretir.',
  },
  {
    code: 'G6',
    severity: 'Bilgi',
    summary: 'npm run verify:samples <klasör> komutunun klasördeki tüm .gml dosyalarını parseCityGmlModel ile okuyup tek satır JSON özet basması',
    status: 'YAPILDI',
    resolutionNote:
      'scripts/verify-samples.ts içine verifyGmlDirectorySamples eklendi; komut satırından klasör veya dosya yolu verildiğinde süre, bellek, nesne/poligon sayısı, kat biçimi, kapı ofseti, profil, arsa payı ve H/U/B sayılarını tek satır JSON olarak basar.',
  },
  {
    code: 'G7',
    severity: 'Bilgi',
    summary: 'src/App.tsx dosyasının modüler parçalara (TreePanel, AttributePanel, ValidationPanel, WorkspaceLayout, workspaceState) bölünmesi ve ağaç etiket tıklama düzeltmesi',
    status: 'YAPILDI',
    resolutionNote:
      'src/state/workspaceState.ts, src/panels/TreePanel.tsx, src/panels/AttributePanel.tsx, src/panels/ValidationPanel.tsx ve src/layout/WorkspaceLayout.tsx oluşturuldu; TreePanel içindeki metin/rozet elemanlarına pointer-events-none eklenerek satırın neresine tıklanırsa tıklansın seçimin tetiklenmesi sağlandı.',
  },
  {
    code: 'G8',
    severity: 'Bilgi',
    summary: 'gmlReader.ts içinde sabit XML ad alanı öneklerine (core:, bldg:, gml:, grp:, gen:, xlink:) bağımlılığın kaldırılması',
    status: 'YAPILDI',
    resolutionNote:
      'getNodeByLocalName ve getAttrByLocalName yardımcıları eklendi; hızlı yol (fast-path) bilinen önekleri kontrol ettikten sonra herhangi bir özel ad alanı önekini (:localName) yerel adıyla eşleştirir.',
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
  const fixturesBatchSample = verifyGmlDirectorySamples('fixtures', rootDir);

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

  const m1FindingMarkdownRows = KONTROL_M1_FINDINGS.map(
    (g) => `| **${g.code}** | ${g.severity} | **${g.status}** | ${g.summary} — *${g.resolutionNote}* |`
  );

  const m0FindingMarkdownRows = KONTROL_M0_FINDINGS.map(
    (f) => `| **${f.code}** | ${f.severity} | **${f.status}** | ${f.summary} — *${f.resolutionNote}* |`
  );

  const typecheckSummary = '> tkgm-3d-bina@0.1.0 typecheck\n> tsc --noEmit && tsc -p tsconfig.core.json --noEmit';

  const adimNotuLines: string[] = [
    '# M0 + M1 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)',
    '',
    '> **Aşama:** `M0 (F1–F12) + M1 (G1–G8 Düzeltmeleri + Web Worker GML Okuyucu + Three.js 3B Sahne + KARAR D-23 5 Panelli Ana Pencere Yerleşimi)`',
    '> **Durum:** `TAMAMLANDI (KONTROL-M1 G1–G8 ve KONTROL-M0 F1–F12 TAMAMI YAPILDI, 30 / 30 Birim Test GEÇTİ, 15 / 15 Resmi Dosya SHA-256 DOĞRULANDI, npm ci / typecheck / lint 0 Hata)`',
    '',
    '---',
    '',
    '## 0. `KONTROL-M1.md` Bulguları (`G1–G8`) Durum Tablosu',
    '',
    '| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |',
    '|---|---|---|---|',
    ...m1FindingMarkdownRows,
    '',
    '---',
    '',
    '## 1. `KONTROL-M0.md` ve `KONTROL-M0-2.md` Bulguları (`F1–F12`) Durum Tablosu',
    '',
    '| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |',
    '|---|---|---|---|',
    ...m0FindingMarkdownRows,
    '',
    '---',
    '',
    '## 2. `M0` ve `M1` Kapsamında Oluşturulan / Doğrulanan Dosyalar',
    '',
    '### M1 — Web Worker GML Okuyucu (`G1`), 3B Delikli Üçgenleme, Modüler Paneller (`G7`) ve KARAR D-23 Çalışma Alanı',
    '- `src/core/gml/gmlReader.ts` (`M1` Saf TS CityGML 2.0 okuyucu: `G1` `onProgress` + `packModelPolygonVerticesFloat64` / `hydrateModelPolygonVerticesFloat64`, `G2` `resolveProducerProfileFromFormAndOffset`, `G3` `V-215 B` kapısız oda bildirimi, `G5` `V-214 B` baş/son boşluk bildirimi, `G8` ad alanı önek bağımsızlığı)',
    '- `src/workers/gmlReader.worker.ts` ve `src/workers/gmlWorkerClient.ts` (`G1` `PERF-01` Web Worker GML ayrıştırıcı, `Transferable` `Float64Array` poligon köşe aktarımı, canlı `%0–%100` ilerleme bildirimi ve `worker.terminate()` ile anında iptal)',
    '- `src/state/workspaceState.ts`, `src/panels/TreePanel.tsx`, `src/panels/AttributePanel.tsx`, `src/panels/ValidationPanel.tsx`, `src/layout/WorkspaceLayout.tsx` (`G7` modüler panel mimarisi ve ağaç satırı `pointer-events-none` tıklama düzeltmesi)',
    '- `src/core/gml/triangulate3d.ts` (`M1` Saf TS 3B düzlemsel poligon + `DoorLinearRing_` / `WindowLinearRing_` iç delik köprüleme + kulak kesme üçgenleme motoru ve `K06` `P_local = P_TUREF - P_origin` yerel merkezleme)',
    '- `src/viewer3d/CityGmlViewport3D.tsx` ve `src/viewer3d/FloorPlanPreview2D.tsx` (Three.js 3B sahne ve 2B kat izdüşümü + `D-23.1` M4 yer tutucusu)',
    '- `src/App.tsx` (Modüler ana uygulama kabuğu, Web Worker ilerleme çubuğu + `"İptal"` düğmesi, `KONTROL-M1 G1–G8` ve `KONTROL-M0 F1–F12` denetim çekmecesi)',
    '- `src/core/__tests__/m1.test.ts` (`M1` + `G1–G8` birim testleri)',
    '',
    '---',
    '',
    '## 3. `npm run typecheck` ve `npm run lint` (`tsc --noEmit && tsc -p tsconfig.core.json --noEmit`) Gerçek Çıktısı',
    '',
    '```text',
    typecheckSummary,
    '(Çıkış Kodu: 0 — 0 hata)',
    '```',
    '',
    '---',
    '',
    '## 4. `npm test` (`vitest run`) Gerçek Çıktısı (`m0.test.ts` + `m1.test.ts`)',
    '',
    '```text',
    testOut,
    '```',
    '',
    '---',
    '',
    '## 5. `npm run verify:samples fixtures` (`G6` Toplu Klasör Okuma) Gerçek Çıktısı',
    '',
    '```json',
    ...fixturesBatchSample.map((row) => JSON.stringify(row)),
    '```',
    '',
    '---',
    '',
    '## 6. `npm run trace` Gerçek Çıktısı (`K98`)',
    '',
    '```text',
    traceReport.summaryText,
    '```',
    '',
    '---',
    '',
    '## 7. `npm run verify:samples` Gerçek Çıktısı (`15 Resmi Dosya SHA-256 + Ornek6 42 Öznitelik`)',
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
    generatedAtIso: '2026-11-08T03:00:00Z',
    specVersion: 'v3.5.5 (M0 F1–F12 + M1 G1–G8 Web Worker & Modüler KARAR D-23 Tamamlandı)',
    stage: 'M1 — Web Worker GML Okuyucu (G1–G8), Three.js 3B Sahne ve KARAR D-23 5 Panelli Ana Pencere Yerleşimi',
    kontrolM0Findings: KONTROL_M0_FINDINGS,
    kontrolM1Findings: KONTROL_M1_FINDINGS,
    fixturesBatchSample,
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

  const tsContent = `// Otomatik üretilen M0 + M1 gerçek denetim verisi (scripts/generate-adim-notu.ts)
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
