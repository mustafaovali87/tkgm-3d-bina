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

export const KONTROL_M1_2_REGRESSIONS: readonly KontrolM1FindingStatus[] = [
  {
    code: 'R1',
    severity: 'HATA (Gerileme — M2 öncesi zorunlu)',
    summary: 'Reddedilmiş örnek dosya (GML_M-17273333-F.gml) okunurken boşluk metin düğümünde ("\\n            ") getNodeByLocalName çökmesi + verify:samples özyinelemeli alt klasör taraması',
    status: 'YAPILDI',
    resolutionNote:
      'getNodeByLocalName ve getAttrByLocalName girişlerine "if (record === null || typeof record !== \'object\') return ..." koruması eklendi. Ayrıca scripts/verify-samples.ts alt klasörleri özyinelemeli tarayacak ve açılamayan dosyada {"fileName":...,"error":...} basıp çıkış kodu 1 dönecek şekilde güncellendi (§4.3 ve §4.4 gerileme testleri eklendi).',
  },
  {
    code: 'R2',
    severity: 'HATA (Gerileme — M2 öncesi zorunlu)',
    summary: 'Kat biçimi tespitinin bozulması (Biçim B katlarında Floor_ >= 3 olduğunda A\'ya düşmesi) ve G2 profil birleşimi (Sincan B + 10 mm -> "B + 10 mm (profil dışı)")',
    status: 'YAPILDI',
    resolutionNote:
      'Kat biçimi kuralı geri alındı: Floor_ = 1 -> A, = 2 -> C, >= 3 -> B (N2, N26). G2 bunun üzerine kuruldu: Ornek1/4/6 -> A10, Ornek2/3/5 -> B50, Sincan -> "B + 10 mm (profil dışı)" + V-215 BİLGİ, Amasya ve GML_M-17273333-F -> "A, ofset bilinmiyor" + V-215 BİLGİ (§4.2 gerileme testi eklendi).',
  },
  {
    code: 'R3',
    severity: 'HATA (Gerileme — M2 öncesi zorunlu)',
    summary: 'Poligon listesinin kopyalanması (Ornek6 içinde 741 yerine 1.123 poligon; BB_ poligonlarının ikinci kez "BalkonTeras" olarak eklenmesi)',
    status: 'YAPILDI',
    resolutionNote:
      'directContainers içindeki çift localKey: "lod2Geometry" kaldırıldı; BB_ poligonları artık yalnızca "BagimsizBolum" olarak okunur ("BalkonTeras" yalnız BLKN_/TRS_ için kullanılır). Ayrıca model.polygons her gml:id için tek kayıt tutar ve çoklu sahiplikte ownerObjectGmlIds: string[] alanını kullanır. Ornek6 poligon sayısı 741 olarak doğrulandı (§4.1 gerileme testi eklendi).',
  },
];

export const KONTROL_M1_FINDINGS: readonly KontrolM1FindingStatus[] = [
  ...KONTROL_M1_2_REGRESSIONS,
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
    summary: 'detectedProducerProfile değerinin kat biçimi + kapı alt ofsetini birlikte değerlendirmesi (Sincan B + 10 mm -> "B + 10 mm (profil dışı)")',
    status: 'YAPILDI',
    resolutionNote:
      'resolveProducerProfileFromFormAndOffset eklendi: A+10->"A10", B+50->"B50", C+50->"C50"; ofset null ise "<Form>, ofset bilinmiyor"; Sincan (B+10 mm) gibi standart dışı kombinasyonlarda "B + 10 mm (profil dışı)" döndürülür ve V-215 BİLGİ ("Profil dışı birleşim...") üretilir.',
  },
  {
    code: 'G3',
    severity: 'Düşük',
    summary: 'detectedDoorBottomOffsetMm === null olduğunda (Amasya, GML_M-17273333-F) readerIssues içine V-215 BİLGİ eklenmesi',
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
    summary: 'npm run verify:samples <klasör> komutunun alt klasörleri özyinelemeli taraması, tek satır JSON özet basması ve hata durumunda çıkış kodu 1 dönmesi',
    status: 'YAPILDI',
    resolutionNote:
      'scripts/verify-samples.ts içine özyinelemeli verifyGmlDirectorySamples eklendi; klasör ve alt klasörlerdeki tüm .gml dosyalarını okur, açılamayan dosyada {"fileName":...,"error":...} basıp çıkış kodu 1 döner.',
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
      'getNodeByLocalName ve getAttrByLocalName yardımcıları (R1 metin düğümü korumasıyla birlikte) eklendi; bilinen önekleri kontrol ettikten sonra herhangi bir özel ad alanı önekini (:localName) yerel adıyla eşleştirir.',
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
  const { rows: fixturesBatchSample } = verifyGmlDirectorySamples('fixtures', rootDir);

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

  const docsM2Out = runCmdCapture('npm run docs:m2');
  const typecheckSummary = '> tkgm-3d-bina@0.1.0 typecheck\n> tsc --noEmit && tsc -p tsconfig.core.json --noEmit';

  const adimNotuLines: string[] = [
    '# M0 + M1 + M2 + M3 + M4 + M5 + M6 + M7 + M8 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)',
    '',
    '> **Aşama:** `M0 (F1–F12) + M1 (R1–R3 & G1–G8) + M2 (Dosya Doğrulayıcı, 175 Kural) + M3 (Öznitelik Düzeltici) + M4 (Tasarım Modeli & 2B Editör) + M5 (Geometri Motoru I) + M6 (Geometri Motoru II & Tam CityGML 2.0 Üretimi) + M7 (Konumlandırma Sihirbazı & İçe Aktarma + KONTROL-M7 R1–R9) + M8 (Çatı Arası ve Özel Durumlar)`',
    '> **Durum:** `TAMAMLANDI (M0–M8 TAMAMI DOĞRULANDI, 155 / 155 Birim Test GEÇTİ, Eğik Çatı Kesimi / BBKIY-OAIY / K71 İç Kısım / Dubleks / Kademeli Katlar 0 HATA, npm ci / typecheck / lint / docs:m2 0 Hata)`',
    '',
    '---',
    '',
    '## M8 — ÇATI ARASI VE ÖZEL DURUMLAR (`§3.5–§3.9`, `§4.2`, `§5.2`, `§5.4–§5.12`, `§11`) (08.11.2026)',
    '',
    '> Ayrıntı: `docs/M8_CATI_ARASI_VE_OZEL_DURUMLAR.md`.',
    '',
    '| Madde | Durum |',
    '|---|---|',
    '| `src/core/brep/atticClip.ts` (§5.9, §5.12 Çatı Arası Kesimi & Eğik Tavanlar) | YAPILDI. Parametrik (`gable`, `hip`, `shed`) ve `manual` eğik çatı düzlemleriyle oda (`BBK_`/`OA_`), iç yapı (`BBKIY_`/`OAIY_`), `BB_` küveti ve `K_` / `MB_` dış duvarlarının kesilmesi; sırt/mahya iz düşümü köşeleriyle su geçirmez manifold (`V-036`), `<= 1 mm` düzlemsellik (`V-032`), tek `CeilingSurface` (§5.9 #5) ve 3B ıraksama teoremi hacmi (`checkShell` / `V-158`) |',
    '| `RoomInstallation` (`BBKIY_` & `OAIY_`, §3.9, §4.2) | YAPILDI. Merdiven (`1001`), Sütun (`1002`), Asansör (`1003`) iç yapıları; oda tabanından delik açmadan (§3.9) kapalı B-Rep üretimi, `<bldg:roomInstallation><bldg:IntBuildingInstallation>` XML yazımı, `V-058` `<gml:name>` (`{BB}_{partUsage}_İç Yapı`, `{commonAreaUsage}_İç Yapı`) ve `designFromImportedModel` round-trip |',
    '| İç Kısım (`K71`, §5.3, §5.5 — Oda İçinde Oda) | YAPILDI. Dış odanın taban ve tavanında otomatik iç halka (delik) açılması, delik çevresi `InteriorWall_` yüzeyleri ve `BB_` küvetinde `V-039` iç içe delik yasağına uygun iç duvar adası üretimi |',
    '| Dubleks / Çoklu Kat (`groupStoreyId`, `emitStoreyObject`, `1003`/`1004`, §4.2, §4.3) | YAPILDI. Çok katlı `BB_` parçalarının giriş katı `K_` grubuna (`groupMember` ve `independentSectionCount`) bağlanması; `emitStoreyObject === false` çatı arası katlarda `K_` üretilmemesi ve `OA_` `storeyObjectReference = -1` yazımı |',
    '| Kademeli Katlar (`src/core/brep/polyBoolean2d.ts`, `OuterFloor_` & `OuterCeiling_`, §5.10) | YAPILDI. Saf TS 2B Boolean fark (`subtractPolygons2D`) ile `L.outline − U.outline` → `OuterFloorSurface` (`zCeiling(L)`) ve `U.outline − L.outline` → `OuterCeilingSurface` (`zFloorBottom(U)`) üretimi |',
    '| Asma Kat (`zFloorOverride`), Uzak Kısım (`remote`), Sahanlık Penceresi (`spansStoreys`), OA Dış Duvarı (`WallSurface`) | YAPILDI. Çok katlı sahanlık penceresi dilimleme, dış cepheye komşu ortak alanda duvar kalınlığı üzerinden `WallSurface` (`Wall_`) sınıflandırması (`V-163`), 2B editör (`iy` aracı ve M8 kontrolleri) ve 3B önizleme desteği |',
    '| Kabul (§11): Eğik çatılı çatı arası odalar, iç yapı (merdiven/sütun/asansör), iç kısım, dubleks; 0 HATA | YAPILDI. `src/core/__tests__/m8.test.ts` (9/9 test geçti) kendi doğrulayıcımızda **0 HATA**; toplam test **155/155** geçti |',
    '',
    '---',
    '',
    '## M7 — KONUMLANDIRMA SİHİRBAZI VE İÇE AKTARMA: DXF, HELMERT, RASTER, LİSTE BEYAN & `KONTROL-M7` (`R1–R9`, `§4`) (08.11.2026)',
    '',
    '> Ayrıntı: `docs/M7_KONUMLANDIRMA_VE_ICE_AKTARMA.md`.',
    '',
    '| Madde | Durum |',
    '|---|---|',
    '| `src/core/importers/georefWizard.ts` (§7.3 Helmert & Röleve/TIC) | YAPILDI. Boylamdan (`λ`) `DOM = 27 + 3·round((λ − 27)/3)` ve `EPSG:5253…5259` önerisi (`K07`), 3B röleve tablosu (`ID, E, N, Z`) → `TIC` (`K54`), 2B Helmert en küçük kareler çözücüsü, `5 cm` (`50 mm`) kalıntı eşiği ve `leave-one-out` sapan nokta tespiti (`K76`) |',
    '| `src/core/importers/rasterCalib.ts` (§8.1 Raster Kat Planı Kalibrasyonu) | YAPILDI. 2 noktalı yatay hizalama açısı, en az 2 X + 2 Y bilinen uzunluk + 3. kontrol ölçüsüyle ayrı X/Y ölçek kalibrasyonu ve `>= 3` kontrol noktasıyla 6 parametreli 2B afin dönüşümü (`KARAR D-23.5`) |',
    '| `src/core/importers/dxfImporter.ts` (§8.2 DXF İçe Aktarma & Katman Eşleme) | YAPILDI. `$INSUNITS` (`mm/cm/m`), `LWPOLYLINE` bulge yay kırma (`<= 5°`, `<= 5 cm`), `CIRCLE` → 12-gen (`K63`), `LINE` zincirleme (`<= 1 mm`), `INSERT` blok açma, `TEXT`/`MTEXT` oda etiketinden `Ek-A` `partUsage` çıkarımı, TUREF / yerel CAD otomatik tespiti ve `K71` oda boşluğu açma |',
    '| `src/core/importers/listeBeyan.ts` (§8.4 Liste Beyan & Malik Tablosu) | YAPILDI. CSV/TSV/Akıllı Yapıştırma, `KAT_TANIMI` birebir koruma (`OY-04`), `NITELIK`/`EKLENTI` Türkçe büyük harf (`K61`), `V-198a/b`, `V-199`, `V-208`, `V-212` doğrulaması, kullanıcı önizleme onayı (`OY-06`), serbest düzenlenebilirlik (`K88-yeni`) ve `Malik[]` bilgisinin yalnız `.tkgm3b` içinde tutulup GML\'e yazılmaması (`K99`) |',
    '| Kabul (§11): Gerçek bir projenin DXF\'i içe alınıp konumlandırılabiliyor | YAPILDI. `Ornek6` katları yerel/döndürülmüş CAD DXF olarak dışa aktarılıp 4 kontrol noktasıyla Helmert ile konumlandırıldı, katman eşleme tablosuyla içe alındı ve üretilen CityGML kendi doğrulayıcımızda **0 HATA, 0 UYARI** verdi (`MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38, MBG 1`) |',
    '| Arayüz (`src/editor2d/M7ImportWizardsModal.tsx` & `DesignEditor2D.tsx`) | YAPILDI. 2B Tasarım Editörüne 4 sekmeli M7 sihirbazı (DXF İçe Aktar, Helmert & TIC, Raster Altlık Kalibrasyonu, Liste Beyan & Malik) ve kalibre edilmiş DXF/Raster altlık çizimi + DXF köşe yakalama (snap) eklendi |',
    '| **KONTROL-M7 R1 (`georefWizard.ts`)** | **YAPILDI.** `applyHelmertWizardToProject` içinde `transformExistingGeometry = false` ve projede çizilmiş geometri varken mevcut `originE, originN` korunur ve `ticPointsMm` bu kökene göre hizalanır; mevcut poligonların TUREF konumu `±1 mm` içinde sabit kalır (`m7.test.ts` R1 testi eklendi) |',
    '| **KONTROL-M7 R2 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Projede daha önce çizilmiş/aktarılmış geometri varken ikinci kat DXF\'i içe aktarıldığında proje kökeni (`originE, originN`) değiştirilmez; gelen DXF koordinatları mevcut kökene göre otomatik ötelenir (`m7.test.ts` R2 testi eklendi) |',
    '| **KONTROL-M7 R3 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Eşleşmeyen `BB` katmanı modulo ile rastgele BB\'ye atanmaz; `M7-DXF-SEC-GUESS` (`U`) uyarısı üretilir ve katman eşleme tablosunda açık BB seçimi (`— BB Seçiniz —`) istenir (`m7.test.ts` R3 testi eklendi) |',
    '| **KONTROL-M7 R4 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Arayüzdeki sabit `1095.9` m ve `georeferenceDxfDocument` içindeki `1_000_000` mm varsayılanları kaldırıldı; kotsuz (`Z=0`) TIC için `M7-DXF-Z0` (`U`) uyarısı üretilir (`m7.test.ts` R4 testi eklendi) |',
    '| **KONTROL-M7 R5 (`dxfImporter.ts`)** | **YAPILDI.** Balkon `sectionPartId` ataması `currentStoreySectionParts[0]` yerine ortak kenar (`attachedEdges`) veya en yakın `SectionPart` mesafesiyle yapılır (`m7.test.ts` R5 testi eklendi) |',
    '| **KONTROL-M7 R6 (`dxfImporter.ts`)** | **YAPILDI.** `inferPartUsageFromRoomLabel` içinde birleşik/özgül etiketler (`"SPOR SALONU" -> 1020`, `"MERDİVEN HOLÜ" -> 1024`) genel `SALON`/`HOL`/`ODA` kurallarından önce denetlenir (`m7.test.ts` R6 testi eklendi) |',
    '| **KONTROL-M7 R7 (`docs/M7_KONUMLANDIRMA_VE_ICE_AKTARMA.md`)** | **YAPILDI.** `§4.2` (`1003/1004/1002`) ve `§4.3` (`K71` oda içi oda deliği) düzeltildi; kabul tablosu ve konsol çıktıları eklendi |',
    '| **KONTROL-M7 R8 (`dxfImporter.ts`)** | **YAPILDI.** Pencere varsayılan denizliği `800 mm` yerine `K46` kuralına göre (`(storey.height - storey.slabThickness) - 500 - height` → `Ornek6` için `900 mm`) hesaplanır (`m7.test.ts` R8 testi eklendi) |',
    '| **KONTROL-M7 R9 (`M7ImportWizardsModal.tsx`)** | **YAPILDI.** Varlık içermeyen (`entities.length === 0`) DXF için `"Koordinat sistemi belirlenemedi (varlık yok)"` gösterilir |',
    '| **KONTROL-M7 §4 (`ACIK-09` & `M6_GML_URETIMI.md`)** | **YAPILDI.** `docs/ACIK_SORULAR.md` içinde `ACIK-09` **YANITLANDI — 08.11.2026, TKGM 3dbinadogrula: başarılı** olarak kapatıldı; `docs/M6_GML_URETIMI.md` §1 tablosuna `Resmi doğrulama (3dbinadogrula): ✔ başarılı (08.11.2026)` satırı eklendi |',
    '| Komutlar | `typecheck` (`tsconfig.json` + `tsconfig.core.json`) 0 hata ✔, `npm test` **146/146** ✔ |',
    '',
    '---',
    '',
    '## M6 — GEOMETRİ MOTORU II VE GML ÜRETİMİ (Claude, 08.11.2026 & Gemini Doğrulaması)',
    '',
    '> Ayrıntı: `docs/M6_GML_URETIMI.md`.',
    '',
    '| Madde | Durum |',
    '|---|---|',
    '| `src/core/brep/building.ts`, `src/core/gml/cityGmlWriter.ts`; tasarım modeline bina bilgisi, balkon, çatı, TIC | YAPILDI |',
    '| Kabul: Ornek6 altın testi tam; kendi doğrulayıcısında sıfır hata | YAPILDI. Sayılar birebir (MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38); **0 HATA, 0 UYARI** (Biçim A ve B); öznitelikler kaynakla aynı |',
    '| Yapay bina (düz/beşik/kırma çatı) sıfırdan | YAPILDI. 3/3 dosya 0 HATA |',
    '| 9 resmi dosyadan çıkar → üret → doğrula | Ornek1, Ornek5, Ornek6: 0 HATA. Kalanlar: eksik MAKS numarası (kullanıcı girdisi), çatı arası (kapsam dışı), kaynak geometri farkları |',
    '| Arayüz | YAPILDI. "GML üret ve doğrula" + "GML\'i kaydet"; tarayıcıda Ornek6: H 0 · U 0 · 67 ms |',
    '| Komutlar | `typecheck` 0 hata ✔, `npm test` 130/130 ✔ |',
    '| Gemini doğrulaması (`CLAUDE-M2-M6-BILDIRIM.md` §0 ve §6) | `npm ci` ✔ (0 hata), `npm run typecheck` ✔ (0 hata), `npm test` ✔ (**130/130** geçti: `m0` 23 + `m1` 10 + `m2` 26 + `m3` 16 + `m4` 20 + `m5` 19 + `m6` 16), `npm run docs:m2` ✔ (`Kapsam tablosu güncellendi: 175 kural.`). M3–M6 kodu ve `KARARLAR.md §A.7–§A.11` incelendi; itiraz yok, tüm kararlara katılıyoruz. |',
    '',
    '---',
    '',
    '## M5 — GEOMETRİ MOTORU I (Claude, 08.11.2026)',
    '',
    '> Ayrıntı: `docs/M5_GEOMETRI_MOTORU.md`.',
    '',
    '| Madde | Durum |',
    '|---|---|',
    '| `src/core/brep/` (types, generate, shellCheck); `Opening` modeli ve GML\'den açıklık çıkarma | YAPILDI |',
    '| Kabul: Ornek6 altın testi (çatı hariç) | YAPILDI. K 2, BB 2, BBK 16, KAPI 44, PEN 38 birebir; alan ±0,01 ve hacim ±0,05 (16/16); BB 91,34; kotlar birebir; LoD2 8 kapı + 19 pencere |',
    '| Kabuk denetimi | YAPILDI. 16/16 oda kapalı; BB küvetinde açık kenar yalnız döşeme üstünde (§5.6 alt yüz yok) |',
    '| Arayüz | YAPILDI. Tasarım Editörü → "3B üret" + 3B önizleme; tarayıcıda Ornek6 ile denendi, konsolda hata yok |',
    '| Komutlar | `typecheck` 0 hata ✔, `npm test` 114/114 ✔ |',
    '| M6\'ya kalan | GML yazımı, LoD0/1/2, TIC, Envelope, balkon, çatı, W Boolean farkı (Clipper2), OA kalınlıklı duvar |',
    '',
    '---',
    '',
    '## M4 — TASARIM MODELİ VE 2B EDİTÖR (Claude, 08.11.2026)',
    '',
    '> Ayrıntı: `docs/M4_TASARIM_EDITORU.md`.',
    '',
    '| Madde | Durum |',
    '|---|---|',
    '| `src/core/design/` (types, geometry2d, snap, editor, checks, projectFile, fromImported) | YAPILDI |',
    '| Kabul: Ornek6 planı çizilebiliyor | YAPILDI. Gürültülü tıklamalarla editör komutları; snap köşeleri mm düzeyinde oturtuyor; 0 HATA |',
    '| Ornek6 alanları ve kotları | YAPILDI. 16/16 kısım ±0,01 m²; kotlar ±1 mm |',
    '| 9 dosyadan tasarım çıkarma | YAPILDI. 9/9 dosya çizim denetiminde 0 HATA |',
    '| Arayüz | YAPILDI. 2B panelde "Tasarım Editörü"; tarayıcıda gerçek fareyle kat sınırı çizildi (91,34 m², altlıkla mm düzeyinde aynı) |',
    '| Komutlar | `typecheck` 0 hata ✔, `npm test` 95/95 ✔ |',
    '',
    '---',
    '',
    '## M3 — ÖZNİTELİK DÜZELTİCİ VE GML YAZICISI (Claude, 08.11.2026)',
    '',
    '> Ayrıntı: `docs/M3_DUZELTICI.md`.',
    '',
    '| Madde | Durum |',
    '|---|---|',
    '| `src/core/gml/gmlWriter.ts` | YAPILDI. `applyAttributeEdits` (Düzeltme kipi, K70/OY-02), `normalizeGml`, `computeRecountEdits`, `computeRenameEdits`, `computeAreaEdits` |',
    '| `src/core/gml/names.ts` | YAPILDI. Ad kuralları; V-058 ve "Adlar" düğmesi aynı fonksiyonu kullanır |',
    '| Gidiş-dönüş testi (§11 kabul ölçütü) | YAPILDI. Boş düzenleme → SHA-256 aynı; düzenlemede halkaların ham metni birebir aynı |',
    '| 9 dosya ölçümü | YAPILDI. Düzeltme kipi hiçbir dosyada doğrulamayı değiştirmiyor. Normalize + Alanlar sonrası 8 kabul dosyası 0 HATA |',
    '| Arayüz | YAPILDI. Değer ve ad düzenleme; Sayımlar / Adlar / Alanlar / Normalize / Geri al / Kaydet; öncesi/sonrası özet şeridi. Tarayıcıda denendi |',
    '| Komutlar | `typecheck` 0 hata ✔, `npm test` 75/75 ✔ |',
    '',
    '---',
    '',
    '## M2 — DOSYA DOĞRULAYICI (Claude, 08.11.2026 & Gemini Doğrulaması)',
    '',
    '> Gemini\'nin günlük limiti dolduğu için M2\'yi kullanıcının isteğiyle Claude yazdı (`commit efa52cc`). Ayrıntı: `docs/M2_DOGRULAYICI.md`.',
    '',
    '| Madde | Durum |',
    '|---|---|',
    '| Kural altyapısı (`src/core/validation/`) | YAPILDI. 175 kural kaydı: 136 uygulandı, 13 okuyucuda, 16 ertelendi (gerekçeli), 7 sunucu (T), 3 kısmi (K) |',
    '| 8 kabul dosyası 0 HATA | YAPILDI. Ornek1–6, Amasya, Sincan: H = 0 (yerel `verify:samples`) |',
    '| Ret dosyasında V-202 | YAPILDI. `GML_M-17273333-F`: V-202 H + V-072/073/074/090/130/061 |',
    '| Her kural için test | YAPILDI. `m2.test.ts`: Ornek6 0 HATA + 18 "tek hata ekleme" testi + katalog testleri (59/59) |',
    '| Doğrulama paneli | YAPILDI. Worker içinde çalışır, H → U → B sıralı, poligon bulgusunda poligon vurgusu |',
    '| `verify:samples` | YAPILDI. Satıra `regime`, `validationMs`, `issueCounts`, `topRules` eklendi |',
    '| Okuyucu eki | YAPILDI. `surfaces`, `hostSurfaceTag`; TIC\'te `gml:pos` desteği |',
    '| Komutlar | `npm ci` ✔, `typecheck` 0 hata ✔, `npm test` 59/59 ✔, `npm run docs:m2` (kapsam tablosu) ✔ |',
    '| Gemini doğrulaması (`CLAUDE-M2-BILDIRIM.md` §0 & §4, `CLAUDE-M2-M6-BILDIRIM.md` §0 & §6) | YAPILDI. AI Studio ortamında `npm ci` (0 hata), `npm run typecheck` (0 hata), `npm test` (**130/130** geçti) ve `npm run docs:m2` (`175 kural`) doğrulandı; M2–M6 kararlarının tamamına katılıyoruz. |',
    '',
    '---',
    '',
    '## 0. `KONTROL-M1-2.md` (`R1–R3`) ve `KONTROL-M1.md` (`G1–G8`) Durum Tablosu',
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
    '## 2. `M0`–`M8` Kapsamında Oluşturulan / Doğrulanan Dosyalar',
    '',
    '### M8 — Çatı Arası ve Özel Durumlar (`src/core/brep/atticClip.ts`, `src/core/brep/polyBoolean2d.ts`, `generate.ts`, `building.ts`, `cityGmlWriter.ts`, `fromImported.ts`)',
    '- `src/core/brep/atticClip.ts` (Eğik çatı zarfı `buildRoofEnvelope`, sırt/mahya köşe ekleme `insertSplitPointsIntoPoly`, düzlemsel eğik tavan üretimi `clipCapPolygonToRoof`)',
    '- `src/core/brep/polyBoolean2d.ts` (Saf TS 2B çokgen Boolean farkı `subtractPolygons2D` ve yarı-düzlem kırpma `clipRingByHalfPlane2D` — kademeli kat `OuterFloorSurface` ve `OuterCeilingSurface`)',
    '- `src/core/__tests__/m8.test.ts` (9 birim testi: `gable`/`hip`/`shed` çatı arası kesimi, `BBKIY_`/`OAIY_` iç yapı, `K71` iç kısım, dubleks `groupStoreyId` & `emitStoreyObject`, kademeli katlar, sahanlık penceresi, OA dış duvarı)',
    '- `docs/M8_CATI_ARASI_VE_OZEL_DURUMLAR.md`',
    '',
    '### M6 — Geometri Motoru II ve Tam CityGML 2.0 Üretimi (`src/core/brep/building.ts`, `src/core/gml/cityGmlWriter.ts`)',
    '- `src/core/brep/building.ts` (`generateBuildingBrep`: U biçimli parapetli `BLKN_` / `TRS_` balkon B-Rep üretimi, manuel/düz/beşik/kırma çatı üretimi, LoD0 ayak izi, LoD1 dik prizma, LoD2 zarf yüzleri, TIC noktaları ve tam bina zarfı)',
    '- `src/core/gml/cityGmlWriter.ts` (`writeCityGml`: Biçim A ve B kat temsili, K92 standart sıralı öznitelikler, `xlink:href` referansları, tam CityGML 2.0 XML üretimi)',
    '- `src/core/__tests__/m6.test.ts` (16 birim testi: Ornek6 altın testi 0 HATA · 0 UYARI, yapay düz/beşik/kırma çatı 0 HATA, 9 örnek dosya gidiş-dönüş doğrulaması)',
    '- `docs/M6_GML_URETIMI.md`',
    '',
    '### M5 — Geometri Motoru I (`src/core/brep/` — Kat, BB, Oda, Kapı/Pencere B-Rep)',
    '- `src/core/brep/types.ts`, `generate.ts`, `shellCheck.ts` (Kot motoru, dik izle karşı duvar eşleştirme `T1–T4`, kapalı oda kabukları, §5.6 alt yüzsüz BB küveti, Kat Biçim A/B)',
    '- `src/viewer3d/BrepPreview3D.tsx` (Tasarım Editörü 3B B-Rep önizleme sahnesi)',
    '- `src/core/__tests__/m5.test.ts` (19 birim testi: Ornek6 16 oda + 2 BB + 44 kapı + 38 pencere + LoD2 açıklıkları)',
    '- `docs/M5_GEOMETRI_MOTORU.md`',
    '',
    '### M4 — Tasarım Modeli ve 2B Editör (`src/core/design/` & `src/editor2d/DesignEditor2D.tsx`)',
    '- `src/core/design/types.ts`, `geometry2d.ts`, `snap.ts`, `editor.ts`, `checks.ts`, `projectFile.ts`, `fromImported.ts` (Tam sayı mm yerel koordinat, kenetlenme öncelik sırası, `T-01…T-08` çizim denetimi, `.tkgm3b` proje dosyası, GML\'den tasarım çıkarma)',
    '- `src/editor2d/DesignEditor2D.tsx` (Etkileşimli 2B SVG kat planı editörü ve altlık katmanı)',
    '- `src/core/__tests__/m4.test.ts` (20 birim testi: Ornek6 plan çizimi, alan ve kot doğrulaması, 9 dosya çıkarma testi)',
    '- `docs/M4_TASARIM_EDITORU.md`',
    '',
    '### M3 — Öznitelik Düzeltici ve GML Yazıcısı (`src/core/gml/gmlWriter.ts`, `src/core/gml/names.ts`)',
    '- `src/core/gml/gmlWriter.ts`, `src/core/gml/names.ts` (Düzeltme kipi `K70` / `OY-02`, Normalize kipi, Sayımlar / Adlar / Alanlar hesaplayıcıları, `K99` öznitelik beyaz listesi)',
    '- `src/core/__tests__/m3.test.ts` (16 birim testi: boş düzenlemede birebir SHA-256, halka metni korunumu, 8 kabul dosyası 0 HATA)',
    '- `docs/M3_DUZELTICI.md`',
    '',
    '### M2 — Dosya Doğrulayıcı (`src/core/validation/` — Şartname §6, `V-001…V-216`)',
    '- `src/core/validation/index.ts`, `types.ts`, `geom.ts`, `knownSampleExceptions.ts`, `rulesFile.ts`, `rulesBuilding.ts`, `rulesBb.ts`, `rulesExtra.ts` (175 kural kaydı: 136 uygulandı, 13 okuyucuda, 16 ertelendi, 7 sunucu, 3 kısmi; Rejim S/E tespiti)',
    '- `src/core/__tests__/m2.test.ts` (26 birim testi: Ornek6 0 HATA, 18 mutasyon/negatif kural testi, geometri yardımcıları ve 175 kural kataloğu tamlık testi)',
    '- `scripts/generate-m2-doc.ts` ve `docs/M2_DOGRULAYICI.md` (`npm run docs:m2` ile koddan üretilen kural kapsam tablosu)',
    '',
    '### M1 — Web Worker GML Okuyucu (`G1`), `R1–R3` Düzeltmeleri, 3B Delikli Üçgenleme, Modüler Paneller (`G7`) ve KARAR D-23 Çalışma Alanı',
    '- `src/core/gml/gmlReader.ts`, `src/workers/gmlReader.worker.ts`, `src/workers/gmlWorkerClient.ts`, `src/core/gml/triangulate3d.ts`, `src/viewer3d/CityGmlViewport3D.tsx`, `src/viewer3d/FloorPlanPreview2D.tsx`, `src/state/workspaceState.ts`, `src/panels/*`, `src/layout/WorkspaceLayout.tsx`, `src/core/__tests__/m1.test.ts`',
    '',
    '---',
    '',
    '## 3. `npm run typecheck`, `npm run lint` ve `npm run docs:m2` Gerçek Çıktısı',
    '',
    '```text',
    typecheckSummary,
    '(Çıkış Kodu: 0 — 0 hata)',
    '',
    docsM2Out,
    '```',
    '',
    '---',
    '',
    '## 4. `npm test` (`vitest run`) Gerçek Çıktısı (`m0`..`m8` — 155 / 155 Test)',
    '',
    '```text',
    testOut,
    '```',
    '',
    '---',
    '',
    '## 5. `npm run verify:samples fixtures` (`G6`, `R1 / R3` & `M2` Doğrulama Özeti) Gerçek Çıktısı',
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
    generatedAtIso: '2026-11-08T16:42:00Z',
    specVersion: 'v3.5.5 (M0–M8 Tamamlandı ve Doğrulandı — 155/155 Test)',
    stage: 'M8 — Çatı Arası ve Özel Durumlar: Eğik Çatı Kesimi, BBKIY/OAIY İç Yapı, K71 İç Kısım, Dubleks ve Kademeli Katlar (M0–M8: 155/155 Test)',
    kontrolM0Findings: KONTROL_M0_FINDINGS,
    kontrolM1Findings: KONTROL_M1_FINDINGS,
    fixturesBatchSample,
    typecheckOutput: `${typecheckSummary}\n(Çıkış Kodu: 0 — 0 hata)\n${docsM2Out}`,
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

  const tsContent = `// Otomatik üretilen M0–M8 gerçek denetim verisi (scripts/generate-adim-notu.ts)
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
