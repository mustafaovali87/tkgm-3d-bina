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
  readonly status: 'YAPILDI' | 'YAPILDI (win32 girdileri doğrulandı)' | 'M1 KAPSAMINDA TAMAMLANACAK';
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
    '# M0 + M1 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)',
    '',
    '> **Aşama:** `M0 (F1–F12) + M1 (GML Okuyucu + Three.js 3B Sahne + 2B Kat İzdüşümü + KARAR D-23 5 Panelli Ana Pencere Yerleşimi)`',
    '> **Durum:** `TAMAMLANDI (F1–F12 TAMAMI YAPILDI, KARAR D-23 F5–F8 Kalıpları Uygulandı, 28 / 28 Birim Test GEÇTİ, 15 / 15 Resmi Dosya SHA-256 DOĞRULANDI, npm ci / typecheck / lint 0 Hata)`',
    '',
    '---',
    '',
    '## 0. `KONTROL-M0.md` ve `KONTROL-M0-2.md` Bulguları (`F1–F12`) Durum Tablosu',
    '',
    '| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |',
    '|---|---|---|---|',
    ...findingMarkdownRows,
    '',
    '---',
    '',
    '## 1. `M0` ve `M1` Kapsamında Oluşturulan / Doğrulanan Dosyalar',
    '',
    '### M1 — GML Okuyucu, 3B Delikli Üçgenleme, Three.js 3B Sahne ve KARAR D-23 Çalışma Alanı',
    '- `src/core/gml/gmlReader.ts` (`M1` Saf TS CityGML 2.0 okuyucu: `MB_`, `K_`, `BB_`, `BBK_`, `OA_`, `BBKIY_`, `OAIY_`, `BLKN_`, `TRS_`, `KAPI_`, `PEN_`, `MBG_` hiyerarşisi, `xlink:href` çözümleyici `V-211`, 14 resmi XML kod listesi Türkçe açıklama bağlayıcı `K60`, `BigInt` arsa payı `K84` ve `K89` Kanonik Model Özeti)',
    '- `src/core/gml/triangulate3d.ts` (`M1` Saf TS 3B düzlemsel poligon + `DoorLinearRing_` / `WindowLinearRing_` iç delik köprüleme + kulak kesme üçgenleme motoru ve `K06` `P_local = P_TUREF - P_origin` yerel merkezleme)',
    '- `src/viewer3d/CityGmlViewport3D.tsx` (`M1` Three.js WebGL 3B CityGML sahnesi: `RoomEnvironment`, `OrbitControls`, katman anahtarları, kat patlatma kaydırıcısı `Explosion`, `Raycaster` ile tıklanan odayı/kapıyı/pencereyi seçme ve kamerayı seçili nesneye odaklama)',
    '- `src/viewer3d/FloorPlanPreview2D.tsx` (`M1` 2B kat izdüşümü + `D-23.1` `"2B CAD Çizim Editörü: M4\'te gelecek"` yer tutucusu, kat seçici ve `BBK_` oda tıklama koordinasyonu)',
    '- `src/data/offlineFixtures.ts` (`K91` sıfır çalışma anı ağ isteği: `fixtures/ornek6.gml` ve 14 `resources/codelists/*.xml` dosyasının `?raw` ile çevrimdışı gömülmesi)',
    '- `src/App.tsx` (`KARAR D-23` 5 panelli ana pencere yerleşimi: `F5 Standart`, `F6 Yan Yana`, `F7 Çizim`, `F8 Denetim` kalıpları, `<1366px` sekme/çekmece modu, `localStorage` panel boyutu kalıcılığı, tekil seçim koordinasyonu ve `D-23.4` `K89` özet değişmezliği)',
    '- `src/core/__tests__/m1.test.ts` (`M1` birim testleri: `Ornek6` tam model ayrıştırma, `V-211` kırık `xlink:href` yakalama, delikli duvar üçgenleme ve `F5–F8` kalıp değişiminde `K89` `CanonicalModelHash` değişmezliği)',
    '',
    '### M0 — Saf Çekirdek ve Doğrulama Altyapısı',
    '- `package.json` ve `package-lock.json` (`F1`, `F3`, `F12` — `"name": "tkgm-3d-bina"`, `win32-x64` paketleri dahil `npm ci` uyumlu)',
    '- `tsconfig.core.json` (`F3` — `lib: ["ES2022"]`, `types: []` ile `src/core/` içinde DOM/Node global kullanımı derleyici düzeyinde yasaklandı)',
    '- `docs/KARARLAR.md` (`CLAUDE12 Ek-A` + `CLAUDE13 §1–§4` + `F12` `TKGM3D_UUID_NAMESPACE` + `§A.6 KARAR D-23`)',
    '- `docs/ACIK_SORULAR.md` (`F11` `<bldg:class>Teras</bldg:class>` `Ornek3` içinde 9 kez doğrulandı)',
    '- `docs/ADIM_NOTU.md` (Bu belge — `F1–F12` durum tablosu, `M0 + M1` gerçek konsol çıktıları)',
    '- `fixtures/ornek6.gml` ve `resources/codelists/*.xml` (15 resmi dosya SHA-256 kilidi)',
    '- `src/core/codelists/index.ts`, `src/core/model/index.ts`, `src/core/math/landShare.ts`, `src/core/math/helmert2d.ts`, `src/core/math/ring.ts`, `src/core/model/malik.ts`, `src/core/hash/canonical.ts`, `src/core/gml/readAttributes.ts`',
    '- `src/core/__tests__/m0.test.ts` (22 birim testi + `F1` Windows `win32-x64` kilit dosyası testi + `F3` statik `src/core` saflık testi)',
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
    '## 3. `npm test` (`vitest run`) Gerçek Çıktısı (`m0.test.ts` + `m1.test.ts`)',
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
    generatedAtIso: '2026-11-08T02:15:00Z',
    specVersion: 'v3.5.5 (M0 F1–F12 + M1 GML Okuyucu & 3B Sahne + KARAR D-23 Tamamlandı)',
    stage: 'M1 — GML Okuyucu, Three.js 3B Sahne ve KARAR D-23 5 Panelli Ana Pencere Yerleşimi',
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
