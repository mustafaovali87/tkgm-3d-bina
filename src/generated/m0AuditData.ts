// Otomatik üretilen M0–M8 gerçek denetim verisi (scripts/generate-adim-notu.ts)
export const M0_AUDIT_DATA = {
  "generatedAtIso": "2026-11-08T16:42:00Z",
  "specVersion": "v3.5.5 (M0–M8 Tamamlandı ve Doğrulandı — 155/155 Test)",
  "stage": "M8 — Çatı Arası ve Özel Durumlar: Eğik Çatı Kesimi, BBKIY/OAIY İç Yapı, K71 İç Kısım, Dubleks ve Kademeli Katlar (M0–M8: 155/155 Test)",
  "kontrolM0Findings": [
    {
      "code": "F1",
      "severity": "Orta (M1 öncesi zorunlu)",
      "summary": "package.json esbuild çakışması + package-lock.json + Windows (win32) npm ci uyumluluğu",
      "status": "YAPILDI (win32 girdileri doğrulandı)",
      "resolutionNote": "node_modules ve package-lock.json silinip temiz npm install ile yeniden üretildi; @tailwindcss/oxide-win32-x64-msvc, lightningcss-win32-x64-msvc ve @esbuild/win32-x64 girdilerinin kilit dosyasında bulunduğu birim testiyle doğrulandı."
    },
    {
      "code": "F2",
      "severity": "Orta (M1 öncesi zorunlu)",
      "summary": "src/core/hash/canonical.ts ve readAttributes.ts içinde localeCompare kullanımı",
      "status": "YAPILDI",
      "resolutionNote": "Tüm sıralamalarda işletim sistemi yerel ayarından bağımsız deterministik UTF-16 kod birimi karşılaştırması (compareCodeUnits: a < b ? -1 : a > b ? 1 : 0) kullanıldı."
    },
    {
      "code": "F3",
      "severity": "Orta (M1 öncesi zorunlu)",
      "summary": "src/core/ saflık kuralının (Mutlak Kural 4) derleyici ve statik test ile korunması",
      "status": "YAPILDI",
      "resolutionNote": "tsconfig.core.json (lib: [\"ES2022\"], types: []) eklendi, npm run typecheck ve lint komutlarına bağlandı; ayrıca m0.test.ts içine statik kaynak tarama testi eklendi."
    },
    {
      "code": "F4",
      "severity": "Orta (M1 öncesi zorunlu)",
      "summary": "parseMaksIdValue fonksiyonunun bozuk/negatif girdilerde (\"12a\", \"-1\") çökmemesi",
      "status": "YAPILDI",
      "resolutionNote": "/^\\d{1,19}$/ kontrolü eklendi; geçersiz girdide çökmeden { value: null, exceedsInt32: false, issue: V-213 HATA } ve >2^31-1 durumunda V-213 BİLGİ döndürür."
    },
    {
      "code": "F5",
      "severity": "Düşük",
      "summary": "readAttributes.ts içinde <gml:posList srsDimension=\"3\"> desteği ve kapısız odada null + BİLGİ",
      "status": "YAPILDI",
      "resolutionNote": "Etiket eşleşmeleri <gml:pos\\b[^>]*> ve <gml:posList\\b[^>]*> olarak genişletildi; kapı bulunamazsa detectedDoorBottomOffsetMm: null + V-215 BİLGİ döndürülür."
    },
    {
      "code": "F6",
      "severity": "Düşük",
      "summary": "readAttributes.ts kat biçimi tespitinin tüm K_ bloklarını kontrol etmesi (+ M1 GMLReader)",
      "status": "YAPILDI",
      "resolutionNote": "Dosyadaki tüm K_ blokları taranarak detectedStoreyForms ve hasInconsistentStoreyForms raporlanır (M1 GMLReader içinde tam XML ağacıyla da doğrulanmıştır)."
    },
    {
      "code": "F7",
      "severity": "Düşük",
      "summary": "parsePropertyLot içinde \"+5/10\" ve \"-5/10\" işaretli payların reddedilmesi",
      "status": "YAPILDI",
      "resolutionNote": "Düzenli ifade /^(\\d+)\\/(\\d+)$/ olarak sıkılaştırıldı; \"+5/10\" ve \"-5/10\" artık V-198a HATA üretir."
    },
    {
      "code": "F8",
      "severity": "Düşük",
      "summary": "Birim test kapsamı genişletmesi (30° dönüklü Helmert, K89 sıra/yerel ayar bağımsızlığı, statik saflık)",
      "status": "YAPILDI",
      "resolutionNote": "m0.test.ts içine 30° dönüklü + 100 ppm Helmert testi, İ/I/i/ı/_ sıralama bağımsızlığı testi ve statik src/core saflık testi eklendi (22/22 test geçti)."
    },
    {
      "code": "F9",
      "severity": "Düşük",
      "summary": ".env.example içindeki GEMINI_API_KEY şablon kalıntısının temizlenmesi",
      "status": "YAPILDI",
      "resolutionNote": ".env.example dosyasından yapay zeka anahtarı kalıntıları tamamen kaldırıldı."
    },
    {
      "code": "F10",
      "severity": "Bilgi",
      "summary": "Önizleme arayüzünde kaydedilmiş denetim çıktısı tarih/saat etiketinin açık gösterimi",
      "status": "YAPILDI",
      "resolutionNote": "src/App.tsx üst bilgi şeridine \"Kaydedilmiş Denetim Çıktısı: <tarih>\" rozeti ve KONTROL-M0 / KONTROL-M1 durum tabloları eklendi."
    },
    {
      "code": "F11",
      "severity": "Bilgi",
      "summary": "docs/ACIK_SORULAR.md güncellemesi (<bldg:class>Teras</bldg:class> Ornek3 içinde 9 kez doğrulandı)",
      "status": "YAPILDI",
      "resolutionNote": "docs/ACIK_SORULAR.md güncellendi: <bldg:class>Teras</bldg:class> kesinleşti."
    },
    {
      "code": "F12",
      "severity": "Bilgi",
      "summary": "package.json adının \"tkgm-3d-bina\" yapılması ve TKGM3D_UUID_NAMESPACE sabitinin KARARLAR.md içine işlenmesi",
      "status": "YAPILDI",
      "resolutionNote": "package.json name alanı \"tkgm-3d-bina\" yapıldı ve TKGM3D_UUID_NAMESPACE (\"6ba7b810-9dad-11d1-80b4-00c04fd430c8\") docs/KARARLAR.md §A.2 içine kalıcı olarak işlendi."
    }
  ],
  "kontrolM1Findings": [
    {
      "code": "R1",
      "severity": "HATA (Gerileme — M2 öncesi zorunlu)",
      "summary": "Reddedilmiş örnek dosya (GML_M-17273333-F.gml) okunurken boşluk metin düğümünde (\"\\n            \") getNodeByLocalName çökmesi + verify:samples özyinelemeli alt klasör taraması",
      "status": "YAPILDI",
      "resolutionNote": "getNodeByLocalName ve getAttrByLocalName girişlerine \"if (record === null || typeof record !== 'object') return ...\" koruması eklendi. Ayrıca scripts/verify-samples.ts alt klasörleri özyinelemeli tarayacak ve açılamayan dosyada {\"fileName\":...,\"error\":...} basıp çıkış kodu 1 dönecek şekilde güncellendi (§4.3 ve §4.4 gerileme testleri eklendi)."
    },
    {
      "code": "R2",
      "severity": "HATA (Gerileme — M2 öncesi zorunlu)",
      "summary": "Kat biçimi tespitinin bozulması (Biçim B katlarında Floor_ >= 3 olduğunda A'ya düşmesi) ve G2 profil birleşimi (Sincan B + 10 mm -> \"B + 10 mm (profil dışı)\")",
      "status": "YAPILDI",
      "resolutionNote": "Kat biçimi kuralı geri alındı: Floor_ = 1 -> A, = 2 -> C, >= 3 -> B (N2, N26). G2 bunun üzerine kuruldu: Ornek1/4/6 -> A10, Ornek2/3/5 -> B50, Sincan -> \"B + 10 mm (profil dışı)\" + V-215 BİLGİ, Amasya ve GML_M-17273333-F -> \"A, ofset bilinmiyor\" + V-215 BİLGİ (§4.2 gerileme testi eklendi)."
    },
    {
      "code": "R3",
      "severity": "HATA (Gerileme — M2 öncesi zorunlu)",
      "summary": "Poligon listesinin kopyalanması (Ornek6 içinde 741 yerine 1.123 poligon; BB_ poligonlarının ikinci kez \"BalkonTeras\" olarak eklenmesi)",
      "status": "YAPILDI",
      "resolutionNote": "directContainers içindeki çift localKey: \"lod2Geometry\" kaldırıldı; BB_ poligonları artık yalnızca \"BagimsizBolum\" olarak okunur (\"BalkonTeras\" yalnız BLKN_/TRS_ için kullanılır). Ayrıca model.polygons her gml:id için tek kayıt tutar ve çoklu sahiplikte ownerObjectGmlIds: string[] alanını kullanır. Ornek6 poligon sayısı 741 olarak doğrulandı (§4.1 gerileme testi eklendi)."
    },
    {
      "code": "G1",
      "severity": "Orta (M2 öncesi zorunlu)",
      "summary": "GML okuma ve ayrıştırmanın Web Worker içine taşınması (PERF-01) + İlerleme Çubuğu + İptal düğmesi + Transferable Float64Array",
      "status": "YAPILDI",
      "resolutionNote": "src/workers/gmlReader.worker.ts ve src/workers/gmlWorkerClient.ts oluşturuldu. parseCityGmlModel Web Worker içinde çalışır; poligon köşeleri packModelPolygonVerticesFloat64 ile tek bir Float64Array (Transferable ArrayBuffer) olarak ana iş parçacığına sıfır kopya maliyetiyle aktarılır; üst şeritte canlı %0–%100 ilerleme çubuğu ve worker.terminate() çağıran \"İptal\" düğmesi eklendi."
    },
    {
      "code": "G2",
      "severity": "Düşük",
      "summary": "detectedProducerProfile değerinin kat biçimi + kapı alt ofsetini birlikte değerlendirmesi (Sincan B + 10 mm -> \"B + 10 mm (profil dışı)\")",
      "status": "YAPILDI",
      "resolutionNote": "resolveProducerProfileFromFormAndOffset eklendi: A+10->\"A10\", B+50->\"B50\", C+50->\"C50\"; ofset null ise \"<Form>, ofset bilinmiyor\"; Sincan (B+10 mm) gibi standart dışı kombinasyonlarda \"B + 10 mm (profil dışı)\" döndürülür ve V-215 BİLGİ (\"Profil dışı birleşim...\") üretilir."
    },
    {
      "code": "G3",
      "severity": "Düşük",
      "summary": "detectedDoorBottomOffsetMm === null olduğunda (Amasya, GML_M-17273333-F) readerIssues içine V-215 BİLGİ eklenmesi",
      "status": "YAPILDI",
      "resolutionNote": "Oda tabanı ile eşleşen kapı bulunamadığında readerIssues dizisine V-215 BİLGİ (\"Kapı alt ofseti ölçülemedi (dosyada oda tabanı ile eşleşen kapı bulunamadı).\") eklenir."
    },
    {
      "code": "G4",
      "severity": "Düşük",
      "summary": "Eski rejim dosyalarında (Amasya, Sincan) propertyLot olmadığında 0/1 yerine \"—\" gösterilmesi ve V-198 BİLGİ üretilmesi",
      "status": "YAPILDI",
      "resolutionNote": "analyzeBuildingLandShares içinde hasPropertyLotData bayrağı eklendi; hiçbir BB_ üzerinde propertyLot yoksa formattedTotalUnreduced = \"—\" döndürülür, V-198 BİLGİ (\"Arsa payı bilgisi yok (eski rejim dosyası).\") üretilir ve arayüzde 0/1 yerine \"—\" gösterilir."
    },
    {
      "code": "G5",
      "severity": "Düşük",
      "summary": "V-214 (intAttribute/doubleAttribute baş/son boşluk, ör. Ornek6 maksIdentityNumber = \"\\t5129820196\") önem derecesinin UYARI yerine BİLGİ (B) yapılması",
      "status": "YAPILDI",
      "resolutionNote": "gmlReader.ts içinde V-214 severity alanı \"B\" (BİLGİ) olarak güncellendi; Ornek6 okunduğunda artık HATA: 0, UYARI: 0, BİLGİ: 2 üretir."
    },
    {
      "code": "G6",
      "severity": "Bilgi",
      "summary": "npm run verify:samples <klasör> komutunun alt klasörleri özyinelemeli taraması, tek satır JSON özet basması ve hata durumunda çıkış kodu 1 dönmesi",
      "status": "YAPILDI",
      "resolutionNote": "scripts/verify-samples.ts içine özyinelemeli verifyGmlDirectorySamples eklendi; klasör ve alt klasörlerdeki tüm .gml dosyalarını okur, açılamayan dosyada {\"fileName\":...,\"error\":...} basıp çıkış kodu 1 döner."
    },
    {
      "code": "G7",
      "severity": "Bilgi",
      "summary": "src/App.tsx dosyasının modüler parçalara (TreePanel, AttributePanel, ValidationPanel, WorkspaceLayout, workspaceState) bölünmesi ve ağaç etiket tıklama düzeltmesi",
      "status": "YAPILDI",
      "resolutionNote": "src/state/workspaceState.ts, src/panels/TreePanel.tsx, src/panels/AttributePanel.tsx, src/panels/ValidationPanel.tsx ve src/layout/WorkspaceLayout.tsx oluşturuldu; TreePanel içindeki metin/rozet elemanlarına pointer-events-none eklenerek satırın neresine tıklanırsa tıklansın seçimin tetiklenmesi sağlandı."
    },
    {
      "code": "G8",
      "severity": "Bilgi",
      "summary": "gmlReader.ts içinde sabit XML ad alanı öneklerine (core:, bldg:, gml:, grp:, gen:, xlink:) bağımlılığın kaldırılması",
      "status": "YAPILDI",
      "resolutionNote": "getNodeByLocalName ve getAttrByLocalName yardımcıları (R1 metin düğümü korumasıyla birlikte) eklendi; bilinen önekleri kontrol ettikten sonra herhangi bir özel ad alanı önekini (:localName) yerel adıyla eşleştirir."
    }
  ],
  "fixturesBatchSample": [
    {
      "fileName": "ornek6.gml",
      "sizeMB": 0.68,
      "durationMs": 265,
      "memoryMB": 26.3,
      "objectCount": 108,
      "polygonCount": 741,
      "detectedStoreyForm": "A",
      "detectedDoorBottomOffsetMm": 10,
      "detectedProducerProfile": "A10",
      "landShareTotal": "2/2",
      "hasPropertyLotData": true,
      "regime": "S",
      "validationMs": 62,
      "issueCounts": {
        "H": 1,
        "U": 0,
        "B": 3
      },
      "topRules": [
        "H:V-001x1"
      ]
    }
  ],
  "typecheckOutput": "> tkgm-3d-bina@0.1.0 typecheck\n> tsc --noEmit && tsc -p tsconfig.core.json --noEmit\n(Çıkış Kodu: 0 — 0 hata)\n> tkgm-3d-bina@0.1.0 docs:m2\n> tsx scripts/generate-m2-doc.ts\n\nKapsam tablosu güncellendi: 175 kural.",
  "vitestOutput": "RUN  v5.1.0 /app/applet\n\n ✓ src/core/__tests__/m1.test.ts (10 tests) 2679ms\n   ✓ M1 Adım 1 — CityGML 2.0 GML Okuyucu (gmlReader.ts) ve KONTROL-M1-2 §4 Gerileme Testleri (R1–R3) (7)\n     ✓ KONTROL-M1-2 §4.1 (R3): Ornek6 altın değerlerini (polygons.length === 741, benzersiz gml:id, MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38, MBG 1, biçim A, ofset 10, profil A10) birebir doğrular 1101ms\n     ✓ KONTROL-M1 G1: Float64Array transferable poligon köşe paketleme ve geri yükleme (packModelPolygonVerticesFloat64 / hydrateModelPolygonVerticesFloat64) sıfır kayıpla çalışır 494ms\n   ✓ M1 Adım 2 — 3B Düzlemsel Poligon + İç Delik (DoorLinearRing_ / WindowLinearRing_) Üçgenleme (triangulate3d.ts) (2)\n     ✓ fixtures/ornek6.gml içindeki tüm iç delikli (DoorLinearRing_ / WindowLinearRing_) duvar poligonlarını sıfır kayıpla üçgenler 510ms\n   ✓ M1 Adım 3 — KARAR D-23.4: Kalıp (F5–F8) ve Panel Boyutu Değişiminin K89 CanonicalHash Üzerinde Etkisizliği (1)\n     ✓ D-23.4 / K89: F5 (Standart), F6 (Yan Yana), F7 (Çizim), F8 (Denetim) ve <1366px sekme modları CanonicalModelHash değerini asla değiştirmez 389ms\n ✓ src/core/__tests__/m3.test.ts (16 tests) 4610ms\n   ✓ M3 — Gidiş-dönüş (şartname §11 kabul ölçütü) (6)\n     ✓ OY-02: Düzeltme kipi yalnız 3 haneden kısa değerleri tamamlar; bütün köşe değerleri ve öznitelikler sayısal olarak aynı 783ms\n     ✓ K70: düzenleme yoksa ve tamamlama kapalıysa çıktı girdiyle bayt bayt aynıdır (SHA-256 eşit) 311ms\n     ✓ K70: öznitelik düzenlemesi geometri metnine dokunmaz; yalnız istenen değerler değişir 391ms\n     ✓ K70: düzenlenen dosya doğrulayıcıda yine 0 HATA verir 397ms\n     ✓ Öznitelik ekleme ve silme: biçim korunur, geri alınınca dosya özgün haline döner 1005ms\n     ✓ Ad (gml:name) düzenlemesi yalnız nesnenin kendi adını değiştirir (yüzey adları değişmez) 492ms\n   ✓ M3 — Sayımlar ve adlar (3)\n     ✓ §7.7: bozulan partCount yeniden hesaplanır ve V-128 kaybolur 572ms\n     ✓ §7.7 / V-058: bozulan ad yeniden üretilir ve dosya özgün haline döner 410ms\n ✓ src/core/__tests__/m6.test.ts (16 tests) 1896ms\n   ✓ M6 — Ornek6 altın testi, tam (§10.4) (10)\n     ✓ Kendi doğrulayıcısında sıfır HATA ve sıfır UYARI (Biçim A = Ornek6, Biçim B = varsayılan); üretim uyarısı yok 589ms\n     ✓ Biçim (§3.1, K70): CRLF, BOM yok, utf-8 bildirimi, posList, tam 3 ondalık; iki yazım bayt bayt aynı 584ms\n ✓ src/core/__tests__/m8.test.ts (9 tests) 1404ms\n   ✓ M8 — Çatı Arası Kesimi (Gable, Hip, Shed, Manual) (§5.9, §5.11, §5.12) (4)\n     ✓ gable eğik çatı altında çatı arası katı: tek CeilingSurface, kapalı manifold kabuk, ıraksama hacmi ve 0 HATA 525ms\n ✓ src/core/__tests__/m2.test.ts (26 tests) 8618ms\n   ✓ M2 — Ornek6 resmi kabul örneği (4)\n     ✓ V-105 / N19: Ornek6 Sürdürülebilirlik rejimindedir (GroundSurface var) 500ms\n   ✓ M2 — Ornek6 üzerinde tek hata ekleme (her kural gerçekten yakalıyor mu?) (18)\n     ✓ V-001: dosya adı M- ile başlamıyor → HATA 495ms\n     ✓ V-002: dosya adı constructionID ile uyuşmuyor → HATA 390ms\n     ✓ V-004: GML ad alanı 3.2 → HATA 410ms\n     ✓ V-014: srsName EPSG:4326 → HATA 396ms\n     ✓ V-021: poligonda srsName → HATA 509ms\n     ✓ V-033: halka kapanmıyor (son pos silindi) → HATA 605ms\n     ✓ V-050: aynı gml:id iki kez → HATA 395ms\n     ✓ V-056: WallSurface elemanında gml:id → HATA 504ms\n     ✓ V-057: kısım sınıf değeri yanlış → HATA 496ms\n     ✓ V-058: kat adı storeyNumber ile uyuşmuyor → HATA 495ms\n     ✓ V-059: yüzey adı yanlış → HATA 406ms\n     ✓ V-061: BB zorunlu partCount yok → HATA 479ms\n     ✓ V-072: bina geometrySuitability 1005 → HATA 406ms\n     ✓ V-202: ret paketi (bina geometrySuitability 1005) → HATA 504ms\n     ✓ V-112: kat parent bina değil → HATA 389ms\n     ✓ V-130: BB integrationState 1003 → HATA 411ms\n     ✓ V-160: kısım BB referansı yok → HATA 422ms\n     ✓ V-188: balkon BB referansı yok → HATA 389ms\n ✓ src/core/__tests__/m7.test.ts (16 tests) 1017ms\n   ✓ M7 — Konumlandırma Sihirbazı ve İçe Aktarma (DXF, Helmert, Raster, Liste Beyan) (16)\n     ✓ 4. §11 M7 Altın Kabul Testi: Gerçek Proje (Ornek6) DXF İçe Aktarma + Helmert Konumlandırma + 0 HATA CityGML (2)\n       ✓ Ornek6 projesinin yerel/döndürülmüş CAD DXF çizimlerini Helmert ile konumlandırıp katman eşlemesiyle içe alır ve 0 HATA ile CityGML üretir 792ms\n ✓ src/core/__tests__/m0.test.ts (23 tests) 388ms\n ✓ src/core/__tests__/m5.test.ts (19 tests) 409ms\n ✓ src/core/__tests__/m4.test.ts (20 tests) 28ms\n\n Test Files  9 passed (9)\n      Tests  155 passed (155)\n   Start at  16:44:35\n   Duration  12.73s (tests 67%, import 30%, transform 2%, worker 1%)\n\n    Isolate  9 workers spawned · ~570ms startup each (spawn + environment, per file)\n             at least ~1.14s faster with isolate: false — reuses workers across files instead of one per file",
  "traceReport": {
    "rows": [
      {
        "ruleId": "D-23.1",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "D-23.4",
        "sourceFiles": [],
        "testFiles": [
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "D-23.5",
        "sourceFiles": [],
        "testFiles": [
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "D-23.6",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K01",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K02",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m3.test.ts"
        ]
      },
      {
        "ruleId": "K06",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/importers/georefWizard.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K07",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/importers/georefWizard.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K08",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/triangulate3d.ts",
          "src/core/importers/dxfImporter.ts",
          "src/core/importers/georefWizard.ts",
          "src/core/math/helmert2d.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K09",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K10",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K11",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K12",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/hash/canonical.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K13",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K14",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K15",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K18",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K27",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K29",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K30",
        "sourceFiles": [
          "src/core/math/landShare.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K31",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K36",
        "sourceFiles": [
          "src/core/gml/triangulate3d.ts",
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K45a",
        "sourceFiles": [
          "src/core/brep/generate.ts",
          "src/core/design/fromImported.ts",
          "src/core/design/types.ts",
          "src/core/gml/triangulate3d.ts",
          "src/core/math/ring.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts",
          "src/core/__tests__/m5.test.ts"
        ]
      },
      {
        "ruleId": "K46",
        "sourceFiles": [
          "src/core/importers/dxfImporter.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K48",
        "sourceFiles": [
          "src/core/brep/generate.ts",
          "src/core/brep/types.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K50",
        "sourceFiles": [
          "src/core/gml/triangulate3d.ts",
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K54",
        "sourceFiles": [
          "src/core/importers/georefWizard.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K55",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K59",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K60",
        "sourceFiles": [
          "src/core/codelists/index.ts",
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K61",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K62",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K63",
        "sourceFiles": [
          "src/core/importers/dxfImporter.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K67",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K68",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K69",
        "sourceFiles": [
          "src/core/importers/georefWizard.ts",
          "src/core/math/helmert2d.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K70",
        "sourceFiles": [
          "src/core/gml/cityGmlWriter.ts",
          "src/core/gml/gmlWriter.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m3.test.ts",
          "src/core/__tests__/m6.test.ts"
        ]
      },
      {
        "ruleId": "K71",
        "sourceFiles": [
          "src/core/brep/generate.ts",
          "src/core/brep/polyBoolean2d.ts",
          "src/core/brep/shellCheck.ts",
          "src/core/design/checks.ts",
          "src/core/importers/dxfImporter.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m8.test.ts"
        ]
      },
      {
        "ruleId": "K76",
        "sourceFiles": [
          "src/core/importers/dxfImporter.ts",
          "src/core/importers/georefWizard.ts",
          "src/core/importers/rasterCalib.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K78",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K79",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K80",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K83",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K84",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K85",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K86",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K87",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/readAttributes.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K88",
        "sourceFiles": [
          "src/core/design/projectFile.ts",
          "src/core/gml/cityGmlWriter.ts",
          "src/core/importers/listeBeyan.ts",
          "src/core/model/index.ts",
          "src/core/model/malik.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m6.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K89",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/hash/canonical.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K90",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K91",
        "sourceFiles": [
          "src/core/codelists/index.ts",
          "src/platform/PlatformAdapter.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "K92",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/importers/dxfImporter.ts",
          "src/core/importers/listeBeyan.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K93",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K99",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/gmlWriter.ts",
          "src/core/gml/readAttributes.ts",
          "src/core/importers/listeBeyan.ts",
          "src/core/model/index.ts",
          "src/core/model/malik.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m3.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "K100",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/platform/PlatformAdapter.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-001",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-002",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-003",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-004",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-005",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-006",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-007",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-008",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-010",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-011",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-012",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-013",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-014",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-015",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-016",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-017",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-018",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-019",
        "sourceFiles": [
          "src/core/importers/georefWizard.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-020",
        "sourceFiles": [
          "src/core/importers/georefWizard.ts",
          "src/core/math/helmert2d.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-021",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-030",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m2.test.ts",
          "src/core/__tests__/m3.test.ts"
        ]
      },
      {
        "ruleId": "V-031",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/triangulate3d.ts",
          "src/core/math/ring.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-032",
        "sourceFiles": [
          "src/core/brep/atticClip.ts",
          "src/core/gml/gmlWriter.ts",
          "src/core/math/ring.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-033",
        "sourceFiles": [
          "src/core/math/ring.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-034",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/design/editor.ts",
          "src/core/importers/dxfImporter.ts",
          "src/core/validation/geom.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts",
          "src/core/__tests__/m4.test.ts"
        ]
      },
      {
        "ruleId": "V-035",
        "sourceFiles": [
          "src/core/validation/geom.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-036",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-037",
        "sourceFiles": [
          "src/core/gml/triangulate3d.ts",
          "src/core/math/ring.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-038",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-039",
        "sourceFiles": [
          "src/core/brep/generate.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-040",
        "sourceFiles": [
          "src/core/gml/triangulate3d.ts",
          "src/core/math/ring.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-041",
        "sourceFiles": [
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-042a",
        "sourceFiles": [
          "src/core/math/ring.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-042b",
        "sourceFiles": [
          "src/core/math/ring.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-050",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-051",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-052",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-053",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-054",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-055",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-056",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-057",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-058",
        "sourceFiles": [
          "src/core/gml/gmlWriter.ts",
          "src/core/gml/names.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts",
          "src/core/__tests__/m3.test.ts"
        ]
      },
      {
        "ruleId": "V-059",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-060",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/gmlWriter.ts",
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts",
          "src/core/model/malik.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m3.test.ts",
          "src/core/__tests__/m6.test.ts"
        ]
      },
      {
        "ruleId": "V-061",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/gml/gmlWriter.ts",
          "src/core/importers/listeBeyan.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-062",
        "sourceFiles": [
          "src/core/gml/cityGmlWriter.ts",
          "src/core/gml/gmlWriter.ts",
          "src/core/model/index.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m3.test.ts"
        ]
      },
      {
        "ruleId": "V-063",
        "sourceFiles": [
          "src/core/codelists/index.ts",
          "src/core/gml/gmlReader.ts",
          "src/core/importers/listeBeyan.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-064",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-070",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-071",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-072",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-073",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-074",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-075",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-076",
        "sourceFiles": [
          "src/core/math/landShare.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-077",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-078",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-079",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-080",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-081",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-082",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-083",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-084",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-085",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-090",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-091",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-092",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-093",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-094",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-095",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-096",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-097",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-098",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-099",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-100",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-101",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-102",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-103",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-104",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-105",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-106",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-107",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-108",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-110",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-111",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-112",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-113",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-114",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-115",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-116",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-117",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-118",
        "sourceFiles": [
          "src/core/validation/rulesBuilding.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-120",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-121",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-122",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-123",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-124",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-125",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-126",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-127",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-128",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m3.test.ts"
        ]
      },
      {
        "ruleId": "V-129",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-130",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-131",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-132",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-133",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-134",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-135",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-136",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-137",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-138",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-139",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-140",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-141",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-150",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-151",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m8.test.ts"
        ]
      },
      {
        "ruleId": "V-152",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m8.test.ts"
        ]
      },
      {
        "ruleId": "V-153",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-154",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-155",
        "sourceFiles": [
          "src/core/gml/gmlWriter.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-156",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-157",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-158",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-159",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-160",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-161",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-162",
        "sourceFiles": [
          "src/core/design/checks.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-163",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-164",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-165",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-166",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-170",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-171",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-172",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-173",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-174",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-180",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-181",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-182",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-183",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-184",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-185",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-186",
        "sourceFiles": [
          "src/core/validation/knownSampleExceptions.ts",
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-187",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-188",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-190",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-191",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-192",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-193",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-194",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-195",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-196",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts",
          "src/core/__tests__/m8.test.ts"
        ]
      },
      {
        "ruleId": "V-197",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-198",
        "sourceFiles": [
          "src/core/math/landShare.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "V-198a",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "V-198b",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts",
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-199",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "V-200",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-201",
        "sourceFiles": [
          "src/core/importers/georefWizard.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m8.test.ts"
        ]
      },
      {
        "ruleId": "V-202",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-203",
        "sourceFiles": [
          "src/core/validation/rulesBb.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-204",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts",
          "src/core/validation/rulesFile.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-205",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-206",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-207",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-208",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/model/malik.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "V-209",
        "sourceFiles": [
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-210",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-211",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "V-212",
        "sourceFiles": [
          "src/core/importers/listeBeyan.ts",
          "src/core/math/landShare.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m7.test.ts"
        ]
      },
      {
        "ruleId": "V-213",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/model/index.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m2.test.ts"
        ]
      },
      {
        "ruleId": "V-214",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/gmlWriter.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesBuilding.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m1.test.ts",
          "src/core/__tests__/m2.test.ts",
          "src/core/__tests__/m3.test.ts"
        ]
      },
      {
        "ruleId": "V-215",
        "sourceFiles": [
          "src/core/gml/gmlReader.ts",
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts",
          "src/core/validation/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts",
          "src/core/__tests__/m1.test.ts"
        ]
      },
      {
        "ruleId": "V-216",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/validation/rulesExtra.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m2.test.ts"
        ]
      }
    ],
    "summaryText": "=== TKGM 3B BINA M0 + M1 KURAL-KOD-TEST IZLENEBILIRLIK MATRISI (K98) ===\nToplam Izlenen Kural Sayisi (M0 + M1): 230\n----------------------------------------------------------------------\nKURAL   | KAYNAK MODULLER                        | TEST DOSYALARI\n----------------------------------------------------------------------\nD-23.1  | src/core/gml/gmlReader.ts              | -\nD-23.4  | -                                      | src/core/__tests__/m1.test.ts\nD-23.5  | -                                      | src/core/__tests__/m7.test.ts\nD-23.6  | src/core/gml/gmlReader.ts              | src/core/__tests__/m1.test.ts\nK01     | src/core/gml/gmlReader.ts, src/core/model/index.ts | -\nK02     | src/core/gml/gmlReader.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m3.test.ts\nK06     | src/core/gml/gmlReader.ts, src/core/importers/georefWizard.ts, src/core/model/index.ts | src/core/__tests__/m1.test.ts\nK07     | src/core/gml/gmlReader.ts, src/core/importers/georefWizard.ts, src/core/model/index.ts | src/core/__tests__/m7.test.ts\nK08     | src/core/gml/gmlReader.ts, src/core/gml/triangulate3d.ts, src/core/importers/dxfImporter.ts, src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nK09     | src/core/gml/gmlReader.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK10     | src/core/validation/rulesExtra.ts      | -\nK11     | src/core/validation/rulesExtra.ts      | -\nK12     | src/core/gml/gmlReader.ts, src/core/hash/canonical.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK13     | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nK14     | src/core/gml/gmlReader.ts, src/core/model/index.ts | -\nK15     | src/core/validation/rulesExtra.ts      | -\nK18     | src/core/validation/rulesExtra.ts      | -\nK27     | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nK29     | src/core/importers/listeBeyan.ts       | -\nK30     | src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nK31     | src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts\nK36     | src/core/gml/triangulate3d.ts, src/core/math/ring.ts | src/core/__tests__/m0.test.ts\nK45a    | src/core/brep/generate.ts, src/core/design/fromImported.ts, src/core/design/types.ts, src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts, src/core/__tests__/m5.test.ts\nK46     | src/core/importers/dxfImporter.ts      | src/core/__tests__/m7.test.ts\nK48     | src/core/brep/generate.ts, src/core/brep/types.ts, src/core/validation/rulesExtra.ts | -\nK50     | src/core/gml/triangulate3d.ts, src/core/math/ring.ts | src/core/__tests__/m0.test.ts\nK54     | src/core/importers/georefWizard.ts     | src/core/__tests__/m7.test.ts\nK55     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK59     | src/core/validation/rulesExtra.ts      | -\nK60     | src/core/codelists/index.ts, src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK61     | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts | src/core/__tests__/m7.test.ts\nK62     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -\nK63     | src/core/importers/dxfImporter.ts      | src/core/__tests__/m7.test.ts\nK67     | src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nK68     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -\nK69     | src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nK70     | src/core/gml/cityGmlWriter.ts, src/core/gml/gmlWriter.ts, src/core/model/index.ts | src/core/__tests__/m3.test.ts, src/core/__tests__/m6.test.ts\nK71     | src/core/brep/generate.ts, src/core/brep/polyBoolean2d.ts, src/core/brep/shellCheck.ts, src/core/design/checks.ts, src/core/importers/dxfImporter.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m8.test.ts\nK76     | src/core/importers/dxfImporter.ts, src/core/importers/georefWizard.ts, src/core/importers/rasterCalib.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nK78     | src/core/validation/rulesBuilding.ts, src/core/validation/rulesExtra.ts | -\nK79     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nK80     | src/core/validation/rulesExtra.ts      | -\nK83     | src/core/validation/rulesExtra.ts      | -\nK84     | src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK85     | src/core/validation/rulesExtra.ts      | -\nK86     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -\nK87     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nK88     | src/core/design/projectFile.ts, src/core/gml/cityGmlWriter.ts, src/core/importers/listeBeyan.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m6.test.ts, src/core/__tests__/m7.test.ts\nK89     | src/core/gml/gmlReader.ts, src/core/hash/canonical.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK90     | src/core/model/index.ts                | -\nK91     | src/core/codelists/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK92     | src/core/hash/canonical.ts, src/core/importers/dxfImporter.ts, src/core/importers/listeBeyan.ts | src/core/__tests__/m0.test.ts\nK93     | src/core/gml/gmlReader.ts, src/core/validation/rulesExtra.ts | -\nK99     | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/gml/readAttributes.ts, src/core/importers/listeBeyan.ts, src/core/model/index.ts, src/core/model/malik.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m3.test.ts, src/core/__tests__/m7.test.ts\nK100    | src/core/model/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts\nV-001   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts\nV-002   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts\nV-003   | src/core/validation/rulesFile.ts       | -\nV-004   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts\nV-005   | src/core/validation/rulesFile.ts       | -\nV-006   | src/core/validation/rulesFile.ts       | -\nV-007   | src/core/validation/rulesFile.ts       | -\nV-008   | src/core/validation/rulesFile.ts       | -\nV-010   | src/core/validation/rulesFile.ts       | -\nV-011   | src/core/validation/rulesFile.ts       | -\nV-012   | src/core/validation/rulesFile.ts       | -\nV-013   | src/core/validation/rulesFile.ts       | -\nV-014   | src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts\nV-015   | src/core/validation/rulesFile.ts       | -\nV-016   | src/core/validation/rulesFile.ts       | -\nV-017   | src/core/validation/rulesFile.ts       | -\nV-018   | src/core/validation/rulesExtra.ts, src/core/validation/rulesFile.ts | -\nV-019   | src/core/importers/georefWizard.ts, src/core/validation/rulesFile.ts | -\nV-020   | src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-021   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts\nV-030   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts\nV-031   | src/core/gml/gmlReader.ts, src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-032   | src/core/brep/atticClip.ts, src/core/gml/gmlWriter.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-033   | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts\nV-034   | src/core/design/checks.ts, src/core/design/editor.ts, src/core/importers/dxfImporter.ts, src/core/validation/geom.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts, src/core/__tests__/m4.test.ts\nV-035   | src/core/validation/geom.ts, src/core/validation/rulesFile.ts | -\nV-036   | src/core/validation/rulesFile.ts       | -\nV-037   | src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-038   | src/core/design/checks.ts, src/core/validation/rulesFile.ts | -\nV-039   | src/core/brep/generate.ts, src/core/validation/rulesFile.ts | -\nV-040   | src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-041   | src/core/validation/rulesFile.ts       | -\nV-042a  | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-042b  | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-050   | src/core/hash/canonical.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts\nV-051   | src/core/hash/canonical.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-052   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nV-053   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nV-054   | src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nV-055   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nV-056   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts\nV-057   | src/core/model/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts\nV-058   | src/core/gml/gmlWriter.ts, src/core/gml/names.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts\nV-059   | src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts\nV-060   | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m3.test.ts, src/core/__tests__/m6.test.ts\nV-061   | src/core/design/checks.ts, src/core/gml/gmlWriter.ts, src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m2.test.ts\nV-062   | src/core/gml/cityGmlWriter.ts, src/core/gml/gmlWriter.ts, src/core/model/index.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m3.test.ts\nV-063   | src/core/codelists/index.ts, src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts\nV-064   | src/core/validation/rulesBuilding.ts   | -\nV-070   | src/core/validation/rulesBuilding.ts   | -\nV-071   | src/core/validation/rulesBuilding.ts   | -\nV-072   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts\nV-073   | src/core/validation/rulesBuilding.ts   | -\nV-074   | src/core/validation/rulesBuilding.ts   | -\nV-075   | src/core/validation/rulesBuilding.ts   | -\nV-076   | src/core/math/landShare.ts, src/core/validation/rulesBuilding.ts | -\nV-077   | src/core/validation/rulesBuilding.ts   | -\nV-078   | src/core/validation/rulesBuilding.ts   | -\nV-079   | src/core/validation/rulesBuilding.ts   | -\nV-080   | src/core/validation/rulesBuilding.ts   | -\nV-081   | src/core/validation/rulesBuilding.ts   | -\nV-082   | src/core/validation/rulesBuilding.ts   | -\nV-083   | src/core/validation/rulesBuilding.ts   | -\nV-084   | src/core/validation/rulesBuilding.ts   | -\nV-085   | src/core/validation/rulesBuilding.ts   | -\nV-090   | src/core/validation/rulesBuilding.ts   | -\nV-091   | src/core/validation/rulesBuilding.ts   | -\nV-092   | src/core/validation/rulesBuilding.ts   | -\nV-093   | src/core/validation/rulesBuilding.ts   | -\nV-094   | src/core/validation/rulesBuilding.ts   | -\nV-095   | src/core/validation/rulesBuilding.ts   | -\nV-096   | src/core/validation/rulesBuilding.ts   | -\nV-097   | src/core/validation/rulesBuilding.ts   | -\nV-098   | src/core/validation/rulesBuilding.ts   | -\nV-099   | src/core/validation/rulesBuilding.ts   | -\nV-100   | src/core/design/checks.ts, src/core/validation/rulesBuilding.ts | -\nV-101   | src/core/validation/rulesBuilding.ts   | -\nV-102   | src/core/validation/rulesBuilding.ts   | -\nV-103   | src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | -\nV-104   | src/core/validation/rulesBuilding.ts   | -\nV-105   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts\nV-106   | src/core/validation/rulesBuilding.ts   | -\nV-107   | src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | -\nV-108   | src/core/validation/rulesBuilding.ts   | -\nV-110   | src/core/validation/rulesBuilding.ts   | -\nV-111   | src/core/validation/rulesBuilding.ts   | -\nV-112   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts\nV-113   | src/core/validation/rulesBuilding.ts   | -\nV-114   | src/core/validation/rulesBuilding.ts   | -\nV-115   | src/core/validation/rulesBuilding.ts   | -\nV-116   | src/core/validation/rulesBuilding.ts   | -\nV-117   | src/core/validation/rulesBuilding.ts   | -\nV-118   | src/core/validation/rulesBuilding.ts   | -\nV-120   | src/core/validation/rulesBb.ts         | -\nV-121   | src/core/validation/rulesBb.ts         | -\nV-122   | src/core/validation/rulesBb.ts         | -\nV-123   | src/core/validation/rulesBb.ts         | -\nV-124   | src/core/validation/rulesBb.ts         | -\nV-125   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -\nV-126   | src/core/validation/rulesBb.ts         | -\nV-127   | src/core/validation/rulesBb.ts         | -\nV-128   | src/core/validation/rulesBb.ts         | src/core/__tests__/m3.test.ts\nV-129   | src/core/validation/rulesBb.ts         | -\nV-130   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts\nV-131   | src/core/validation/rulesBb.ts         | -\nV-132   | src/core/validation/rulesBb.ts         | -\nV-133   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts | -\nV-134   | src/core/validation/rulesBb.ts         | -\nV-135   | src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts | -\nV-136   | src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts | -\nV-137   | src/core/validation/rulesBb.ts         | -\nV-138   | src/core/validation/rulesBb.ts         | -\nV-139   | src/core/validation/rulesBb.ts         | -\nV-140   | src/core/validation/rulesBb.ts         | -\nV-141   | src/core/validation/rulesBb.ts         | -\nV-150   | src/core/validation/rulesBb.ts         | -\nV-151   | src/core/design/checks.ts, src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | src/core/__tests__/m8.test.ts\nV-152   | src/core/validation/rulesBb.ts         | src/core/__tests__/m8.test.ts\nV-153   | src/core/validation/rulesBb.ts         | -\nV-154   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -\nV-155   | src/core/gml/gmlWriter.ts, src/core/validation/rulesBb.ts | -\nV-156   | src/core/validation/rulesBb.ts         | -\nV-157   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -\nV-158   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts\nV-159   | src/core/validation/rulesBb.ts         | -\nV-160   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | src/core/__tests__/m2.test.ts\nV-161   | src/core/validation/rulesBb.ts         | -\nV-162   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -\nV-163   | src/core/validation/rulesBb.ts         | -\nV-164   | src/core/validation/rulesBb.ts         | -\nV-165   | src/core/validation/rulesBb.ts         | -\nV-166   | src/core/validation/rulesBb.ts         | -\nV-170   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -\nV-171   | src/core/validation/rulesBb.ts         | -\nV-172   | src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | -\nV-173   | src/core/validation/rulesBb.ts         | -\nV-174   | src/core/validation/rulesBb.ts         | -\nV-180   | src/core/validation/rulesBb.ts         | -\nV-181   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -\nV-182   | src/core/validation/rulesBb.ts         | -\nV-183   | src/core/validation/rulesBb.ts         | -\nV-184   | src/core/validation/rulesBb.ts         | -\nV-185   | src/core/validation/rulesBb.ts         | -\nV-186   | src/core/validation/knownSampleExceptions.ts, src/core/validation/rulesBb.ts | -\nV-187   | src/core/validation/rulesBb.ts         | -\nV-188   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts\nV-190   | src/core/validation/rulesBb.ts         | -\nV-191   | src/core/validation/rulesBb.ts         | -\nV-192   | src/core/validation/rulesBb.ts         | -\nV-193   | src/core/validation/rulesBb.ts         | -\nV-194   | src/core/validation/rulesBb.ts         | -\nV-195   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts\nV-196   | src/core/validation/rulesExtra.ts      | src/core/__tests__/m2.test.ts, src/core/__tests__/m8.test.ts\nV-197   | src/core/validation/rulesExtra.ts      | -\nV-198   | src/core/math/landShare.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts, src/core/__tests__/m7.test.ts\nV-198a  | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nV-198b  | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nV-199   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nV-200   | src/core/validation/rulesExtra.ts      | -\nV-201   | src/core/importers/georefWizard.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m8.test.ts\nV-202   | src/core/validation/rulesExtra.ts      | src/core/__tests__/m2.test.ts\nV-203   | src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | -\nV-204   | src/core/validation/rulesExtra.ts, src/core/validation/rulesFile.ts | -\nV-205   | src/core/validation/rulesExtra.ts      | -\nV-206   | src/core/validation/rulesExtra.ts      | -\nV-207   | src/core/validation/rulesExtra.ts      | -\nV-208   | src/core/importers/listeBeyan.ts, src/core/model/malik.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nV-209   | src/core/validation/rulesExtra.ts      | -\nV-210   | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -\nV-211   | src/core/gml/gmlReader.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m1.test.ts\nV-212   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nV-213   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts\nV-214   | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/validation/index.ts, src/core/validation/rulesBuilding.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m1.test.ts, src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts\nV-215   | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nV-216   | src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m2.test.ts"
  },
  "sampleReport": {
    "verifiedFileCount": 15,
    "all15ReferenceFilesVerified": true,
    "referenceFiles": [
      {
        "file": "ornek6.gml",
        "sizeBytes": 717200,
        "sha256": "7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03",
        "verified": true
      },
      {
        "file": "codelists/buildingGeometrySuitability.xml",
        "sizeBytes": 1603,
        "sha256": "f399e6460ea7d8f211b29c5465da9639e0879cd2f4d59cc370faeb6cc1194f39",
        "verified": true
      },
      {
        "file": "codelists/buildingType.xml",
        "sizeBytes": 770,
        "sha256": "fc5de1b9c6224bd780612772ce5265c66fe4d1bad9562560bb37980b02798197",
        "verified": true
      },
      {
        "file": "codelists/cardinalDirection.xml",
        "sizeBytes": 2053,
        "sha256": "8aa0bc43e64e0417355fb9129fb6a3b67c9c98bace0534d25fbdae4dbd034dc9",
        "verified": true
      },
      {
        "file": "codelists/doorUsage.xml",
        "sizeBytes": 1180,
        "sha256": "c394c54ec9765d2ea5b18b4cc618307ce8d33da162f715408ac8c575fc790775",
        "verified": true
      },
      {
        "file": "codelists/independentSectionGeometrySuitability.xml",
        "sizeBytes": 831,
        "sha256": "8c13ff3a583a949075dd17e7f63a27ad29a929d47c4505c8334884db5e77c3f0",
        "verified": true
      },
      {
        "file": "codelists/independentSectionPartGeometrySuitability.xml",
        "sizeBytes": 835,
        "sha256": "eabb6a64ac72be922c41ea518f20b8ec0d3ecebf8a9cfdda9c432c35001838a2",
        "verified": true
      },
      {
        "file": "codelists/independentSectionUsage.xml",
        "sizeBytes": 1519,
        "sha256": "1620a4d341a1393408f330ed2529f2134b6e667b898a9651eac9bebf80de741e",
        "verified": true
      },
      {
        "file": "codelists/integrationState.xml",
        "sizeBytes": 1181,
        "sha256": "c234e8ef749233026b5e9fe91acea661f174f9ed1e0a4054287e0f9519493238",
        "verified": true
      },
      {
        "file": "codelists/maksConstructionIntegrationState.xml",
        "sizeBytes": 1013,
        "sha256": "945c852cddb5680e31c0d02f0e1481802f82ad7226db0d669b1e2f454079e1f8",
        "verified": true
      },
      {
        "file": "codelists/maksIndependentSectionIntegrationState.xml",
        "sizeBytes": 1007,
        "sha256": "4d97b5589b28ec16b5cc5b6b0485f472ce75e76be18ae84fa02c3e2ee67c966f",
        "verified": true
      },
      {
        "file": "codelists/partUsage.xml",
        "sizeBytes": 5842,
        "sha256": "07a42ced5cef9d420e33b213409b872e6264d673bf5554d63f115432c763761d",
        "verified": true
      },
      {
        "file": "codelists/roomInstallationUsage.xml",
        "sizeBytes": 950,
        "sha256": "5d969360f5031280f4612efad738b23c93b7ca5bfeedad52b9fa69dc7100d98b",
        "verified": true
      },
      {
        "file": "codelists/storeyUsage.xml",
        "sizeBytes": 949,
        "sha256": "f7a31e305d7cde8542f859be43947dfec3f092bb9c770e76301e62c6dd3f1119",
        "verified": true
      },
      {
        "file": "codelists/windowUsage.xml",
        "sizeBytes": 779,
        "sha256": "c2109006e89f7bb88e81bf9135bf42546471760b02f11f4ae9e2c1c0e50b5563",
        "verified": true
      }
    ],
    "codelistSummary": [
      {
        "listName": "buildingGeometrySuitability",
        "entryCount": 6,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "buildingType",
        "entryCount": 2,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "cardinalDirection",
        "entryCount": 9,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "doorUsage",
        "entryCount": 4,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "independentSectionGeometrySuitability",
        "entryCount": 2,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "independentSectionPartGeometrySuitability",
        "entryCount": 2,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "independentSectionUsage",
        "entryCount": 6,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "integrationState",
        "entryCount": 4,
        "duplicateDefinitionIds": [
          "id3"
        ]
      },
      {
        "listName": "maksConstructionIntegrationState",
        "entryCount": 3,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "maksIndependentSectionIntegrationState",
        "entryCount": 3,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "partUsage",
        "entryCount": 29,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "roomInstallationUsage",
        "entryCount": 3,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "storeyUsage",
        "entryCount": 3,
        "duplicateDefinitionIds": []
      },
      {
        "listName": "windowUsage",
        "entryCount": 2,
        "duplicateDefinitionIds": []
      }
    ],
    "ornek6Inspection": {
      "constructionID": "70125626-A",
      "buildingGmlId": "MB_b9e3888a-63b3-4f4c-9d75-58af494f6733",
      "srsName": "EPSG:5254",
      "envelopeLowerCorner": "532566.5734 4288398.1441 1095.9000",
      "envelopeUpperCorner": "532580.0220 4288410.3896 1103.7000",
      "roofProjectionArea": 120.79,
      "buildingHeight": 7.45,
      "confirmationDate": "1999-12-09",
      "totalIndependentSectionCountAttr": 2,
      "counts": {
        "MB": 1,
        "K": 2,
        "BB": 2,
        "BBK": 16,
        "OA": 0,
        "BBKIY": 0,
        "OAIY": 0,
        "BLKN": 4,
        "TRS": 0,
        "KAPI": 44,
        "PEN": 38,
        "MBG": 1
      },
      "coordinateEncoding": "mixed",
      "detectedStoreyForm": "A",
      "detectedStoreyForms": [
        "A",
        "A"
      ],
      "hasInconsistentStoreyForms": false,
      "detectedDoorBottomOffsetMm": 10,
      "doorOffsetInfoIssue": null,
      "detectedProducerProfile": "A10",
      "uniqueGenericAttributes": [
        {
          "name": "additionalNote",
          "type": "string",
          "spec": "additionalNote:string",
          "occurrenceCount": 23
        },
        {
          "name": "architecturalPlanID",
          "type": "string",
          "spec": "architecturalPlanID:string",
          "occurrenceCount": 1
        },
        {
          "name": "architecturalProjectConfirmationDate",
          "type": "date",
          "spec": "architecturalProjectConfirmationDate:date",
          "occurrenceCount": 1
        },
        {
          "name": "blockName",
          "type": "string",
          "spec": "blockName:string",
          "occurrenceCount": 2
        },
        {
          "name": "blockNumber",
          "type": "string",
          "spec": "blockNumber:string",
          "occurrenceCount": 1
        },
        {
          "name": "buildingHeight",
          "type": "double",
          "spec": "buildingHeight:double",
          "occurrenceCount": 1
        },
        {
          "name": "buildingType",
          "type": "int",
          "spec": "buildingType:int",
          "occurrenceCount": 1
        },
        {
          "name": "calculatedArea",
          "type": "double",
          "spec": "calculatedArea:double",
          "occurrenceCount": 20
        },
        {
          "name": "constructionID",
          "type": "string",
          "spec": "constructionID:string",
          "occurrenceCount": 1
        },
        {
          "name": "doorUsage",
          "type": "int",
          "spec": "doorUsage:int",
          "occurrenceCount": 44
        },
        {
          "name": "elevatorCount",
          "type": "int",
          "spec": "elevatorCount:int",
          "occurrenceCount": 1
        },
        {
          "name": "entrance",
          "type": "string",
          "spec": "entrance:string",
          "occurrenceCount": 2
        },
        {
          "name": "geometrySuitability",
          "type": "int",
          "spec": "geometrySuitability:int",
          "occurrenceCount": 23
        },
        {
          "name": "independentSectionCalculatedArea",
          "type": "double",
          "spec": "independentSectionCalculatedArea:double",
          "occurrenceCount": 2
        },
        {
          "name": "independentSectionCardinalDirection",
          "type": "int",
          "spec": "independentSectionCardinalDirection:int",
          "occurrenceCount": 8
        },
        {
          "name": "independentSectionCount",
          "type": "int",
          "spec": "independentSectionCount:int",
          "occurrenceCount": 2
        },
        {
          "name": "independentSectionNumber",
          "type": "string",
          "spec": "independentSectionNumber:string",
          "occurrenceCount": 2
        },
        {
          "name": "independentSectionObjectReference",
          "type": "string",
          "spec": "independentSectionObjectReference:string",
          "occurrenceCount": 20
        },
        {
          "name": "independentSectionPlanGrossArea",
          "type": "double",
          "spec": "independentSectionPlanGrossArea:double",
          "occurrenceCount": 2
        },
        {
          "name": "independentSectionPlanNetArea",
          "type": "double",
          "spec": "independentSectionPlanNetArea:double",
          "occurrenceCount": 2
        },
        {
          "name": "independentSectionUsage",
          "type": "int",
          "spec": "independentSectionUsage:int",
          "occurrenceCount": 2
        },
        {
          "name": "integrationState",
          "type": "int",
          "spec": "integrationState:int",
          "occurrenceCount": 2
        },
        {
          "name": "maksIdentityNumber",
          "type": "int",
          "spec": "maksIdentityNumber:int",
          "occurrenceCount": 3
        },
        {
          "name": "maksIntegrationState",
          "type": "int",
          "spec": "maksIntegrationState:int",
          "occurrenceCount": 3
        },
        {
          "name": "maksNumaratajIdentityNumber",
          "type": "int",
          "spec": "maksNumaratajIdentityNumber:int",
          "occurrenceCount": 2
        },
        {
          "name": "parcelNumber",
          "type": "string",
          "spec": "parcelNumber:string",
          "occurrenceCount": 1
        },
        {
          "name": "partCount",
          "type": "int",
          "spec": "partCount:int",
          "occurrenceCount": 2
        },
        {
          "name": "partUsage",
          "type": "int",
          "spec": "partUsage:int",
          "occurrenceCount": 16
        },
        {
          "name": "planArea",
          "type": "double",
          "spec": "planArea:double",
          "occurrenceCount": 20
        },
        {
          "name": "propertyLot",
          "type": "string",
          "spec": "propertyLot:string",
          "occurrenceCount": 2
        },
        {
          "name": "registeredFloorDefinition",
          "type": "string",
          "spec": "registeredFloorDefinition:string",
          "occurrenceCount": 2
        },
        {
          "name": "registeredInstallation",
          "type": "string",
          "spec": "registeredInstallation:string",
          "occurrenceCount": 2
        },
        {
          "name": "registeredQuality",
          "type": "string",
          "spec": "registeredQuality:string",
          "occurrenceCount": 2
        },
        {
          "name": "roofProjectionArea",
          "type": "double",
          "spec": "roofProjectionArea:double",
          "occurrenceCount": 1
        },
        {
          "name": "storeyNumber",
          "type": "string",
          "spec": "storeyNumber:string",
          "occurrenceCount": 2
        },
        {
          "name": "storeyUsage",
          "type": "int",
          "spec": "storeyUsage:int",
          "occurrenceCount": 2
        },
        {
          "name": "takbisNeighbourhoodReference",
          "type": "int",
          "spec": "takbisNeighbourhoodReference:int",
          "occurrenceCount": 1
        },
        {
          "name": "takbisPropertyIdentityNumber",
          "type": "int",
          "spec": "takbisPropertyIdentityNumber:int",
          "occurrenceCount": 3
        },
        {
          "name": "tenderRegistrationNumber",
          "type": "string",
          "spec": "tenderRegistrationNumber:string",
          "occurrenceCount": 1
        },
        {
          "name": "totalIndependentSectionCount",
          "type": "int",
          "spec": "totalIndependentSectionCount:int",
          "occurrenceCount": 1
        },
        {
          "name": "volume",
          "type": "double",
          "spec": "volume:double",
          "occurrenceCount": 16
        },
        {
          "name": "windowUsage",
          "type": "int",
          "spec": "windowUsage:int",
          "occurrenceCount": 38
        }
      ],
      "uniqueAttributeSpecsSorted": [
        "additionalNote:string",
        "architecturalPlanID:string",
        "architecturalProjectConfirmationDate:date",
        "blockName:string",
        "blockNumber:string",
        "buildingHeight:double",
        "buildingType:int",
        "calculatedArea:double",
        "constructionID:string",
        "doorUsage:int",
        "elevatorCount:int",
        "entrance:string",
        "geometrySuitability:int",
        "independentSectionCalculatedArea:double",
        "independentSectionCardinalDirection:int",
        "independentSectionCount:int",
        "independentSectionNumber:string",
        "independentSectionObjectReference:string",
        "independentSectionPlanGrossArea:double",
        "independentSectionPlanNetArea:double",
        "independentSectionUsage:int",
        "integrationState:int",
        "maksIdentityNumber:int",
        "maksIntegrationState:int",
        "maksNumaratajIdentityNumber:int",
        "parcelNumber:string",
        "partCount:int",
        "partUsage:int",
        "planArea:double",
        "propertyLot:string",
        "registeredFloorDefinition:string",
        "registeredInstallation:string",
        "registeredQuality:string",
        "roofProjectionArea:double",
        "storeyNumber:string",
        "storeyUsage:int",
        "takbisNeighbourhoodReference:int",
        "takbisPropertyIdentityNumber:int",
        "tenderRegistrationNumber:string",
        "totalIndependentSectionCount:int",
        "volume:double",
        "windowUsage:int"
      ],
      "unauthorizedAttributes": [],
      "matchesOrnek6Expected42": true
    }
  },
  "codelistsDetailed": [
    {
      "listName": "buildingGeometrySuitability",
      "dictionaryNameInXml": "buildingGeometrySuitability",
      "dictionaryGmlId": "buildingGeometrySuitabilityType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Uygundur",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Kat Uyumsuzlugu",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Şekil Uyumsuzlugu",
          "definitionGmlId": "id3"
        },
        {
          "code": 1004,
          "codeText": "1004",
          "description": "Kütle Uyumsuzlugu",
          "definitionGmlId": "id4"
        },
        {
          "code": 1005,
          "codeText": "1005",
          "description": "Bagimsiz Bolum Uyumsuzlugu",
          "definitionGmlId": "id5"
        },
        {
          "code": 1006,
          "codeText": "1006",
          "description": "Kat İrtifkı Tesisi",
          "definitionGmlId": "id6"
        }
      ]
    },
    {
      "listName": "buildingType",
      "dictionaryNameInXml": "buildingType",
      "dictionaryGmlId": "buildingTypeType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Ana Yapı",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Diğer",
          "definitionGmlId": "id2"
        }
      ]
    },
    {
      "listName": "cardinalDirection",
      "dictionaryNameInXml": "cardinalDirection",
      "dictionaryGmlId": "storeyUsageType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Kuzey",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Kuzeydoğu",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Doğu",
          "definitionGmlId": "id3"
        },
        {
          "code": 1004,
          "codeText": "1004",
          "description": "Güneydoğu",
          "definitionGmlId": "id4"
        },
        {
          "code": 1005,
          "codeText": "1005",
          "description": "Güney",
          "definitionGmlId": "id5"
        },
        {
          "code": 1006,
          "codeText": "1006",
          "description": "Güneybatı",
          "definitionGmlId": "id6"
        },
        {
          "code": 1007,
          "codeText": "1007",
          "description": "Batı",
          "definitionGmlId": "id7"
        },
        {
          "code": 1008,
          "codeText": "1008",
          "description": "Kuzeybatı",
          "definitionGmlId": "id8"
        },
        {
          "code": 1009,
          "codeText": "1009",
          "description": "Kapalı Cephe",
          "definitionGmlId": "id9"
        }
      ]
    },
    {
      "listName": "doorUsage",
      "dictionaryNameInXml": "doorUsage",
      "dictionaryGmlId": "doorUsageType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Bina/Yapı Giriş Kapı",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Dış Kapı",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Bağımsız Bölüm Kapı",
          "definitionGmlId": "id3"
        },
        {
          "code": 1004,
          "codeText": "1004",
          "description": "Kısım Kapı",
          "definitionGmlId": "id4"
        }
      ]
    },
    {
      "listName": "independentSectionGeometrySuitability",
      "dictionaryNameInXml": "independentSectionGeometrySuitability",
      "dictionaryGmlId": "independentSectionGeometrySuitabilityType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Uygundur",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Alan Uyumsuzlugu",
          "definitionGmlId": "id2"
        }
      ]
    },
    {
      "listName": "independentSectionPartGeometrySuitability",
      "dictionaryNameInXml": "independentSectionPartGeometrySuitability",
      "dictionaryGmlId": "independentSectionPartGeometrySuitabilityType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Uygundur",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Alan Uyumsuzlugu",
          "definitionGmlId": "id2"
        }
      ]
    },
    {
      "listName": "independentSectionUsage",
      "dictionaryNameInXml": "independentSectionUsage",
      "dictionaryGmlId": "partUsageType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Mesken",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Ticari",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Çoklu Kat",
          "definitionGmlId": "id3"
        },
        {
          "code": 1004,
          "codeText": "1004",
          "description": "Çatı Arası",
          "definitionGmlId": "id4"
        },
        {
          "code": 1005,
          "codeText": "1005",
          "description": "Depo",
          "definitionGmlId": "id5"
        },
        {
          "code": 1006,
          "codeText": "1006",
          "description": "Eklenti",
          "definitionGmlId": "id6"
        }
      ]
    },
    {
      "listName": "integrationState",
      "dictionaryNameInXml": "integrationState",
      "dictionaryGmlId": "storeyUsageType",
      "duplicateDefinitionIds": [
        "id3"
      ],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Sağlandı",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Proje Okunamadı",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Csv Karşılık Bulunamadı",
          "definitionGmlId": "id3"
        },
        {
          "code": 1004,
          "codeText": "1004",
          "description": "Kat İrtifkı Tesisi",
          "definitionGmlId": "id3"
        }
      ]
    },
    {
      "listName": "maksConstructionIntegrationState",
      "dictionaryNameInXml": "MaksIntegrationState",
      "dictionaryGmlId": "maksIntegrationStateType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Sağlandı",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Mimari Proje Karşılık Bulunamadı",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Kat İrtifakı Tesis",
          "definitionGmlId": "id3"
        }
      ]
    },
    {
      "listName": "maksIndependentSectionIntegrationState",
      "dictionaryNameInXml": "MaksIntegrationState",
      "dictionaryGmlId": "maksIntegrationStateType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Sağlandı",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Shape Karşılık Bulunamadı",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Kat İrtifakı Tesisi",
          "definitionGmlId": "id3"
        }
      ]
    },
    {
      "listName": "partUsage",
      "dictionaryNameInXml": "partUsage",
      "dictionaryGmlId": "partUsageType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Oda",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Banyo",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Salon",
          "definitionGmlId": "id3"
        },
        {
          "code": 1004,
          "codeText": "1004",
          "description": "Mutfak",
          "definitionGmlId": "id4"
        },
        {
          "code": 1005,
          "codeText": "1005",
          "description": "Kiler",
          "definitionGmlId": "id5"
        },
        {
          "code": 1006,
          "codeText": "1006",
          "description": "Tuvalet",
          "definitionGmlId": "id6"
        },
        {
          "code": 1007,
          "codeText": "1007",
          "description": "Kış Bahçesi",
          "definitionGmlId": "id7"
        },
        {
          "code": 1008,
          "codeText": "1008",
          "description": "Hol",
          "definitionGmlId": "id8"
        },
        {
          "code": 1009,
          "codeText": "1009",
          "description": "Dükkan",
          "definitionGmlId": "id9"
        },
        {
          "code": 1010,
          "codeText": "1010",
          "description": "Sığınak",
          "definitionGmlId": "id10"
        },
        {
          "code": 1011,
          "codeText": "1011",
          "description": "Danışma",
          "definitionGmlId": "id11"
        },
        {
          "code": 1012,
          "codeText": "1012",
          "description": "Kalorifer Dairesi",
          "definitionGmlId": "id12"
        },
        {
          "code": 1013,
          "codeText": "1013",
          "description": "Kapıcı Dairesi",
          "definitionGmlId": "id13"
        },
        {
          "code": 1014,
          "codeText": "1014",
          "description": "Elektrik Merkezi",
          "definitionGmlId": "id14"
        },
        {
          "code": 1015,
          "codeText": "1015",
          "description": "Isı Merkezi",
          "definitionGmlId": "id15"
        },
        {
          "code": 1016,
          "codeText": "1016",
          "description": "Otopark",
          "definitionGmlId": "id16"
        },
        {
          "code": 1017,
          "codeText": "1017",
          "description": "Güvenlik Odası",
          "definitionGmlId": "id17"
        },
        {
          "code": 1018,
          "codeText": "1018",
          "description": "Havuz",
          "definitionGmlId": "id18"
        },
        {
          "code": 1019,
          "codeText": "1019",
          "description": "Sosyal Tesis",
          "definitionGmlId": "id19"
        },
        {
          "code": 1020,
          "codeText": "1020",
          "description": "Spor Salonu",
          "definitionGmlId": "id20"
        },
        {
          "code": 1021,
          "codeText": "1021",
          "description": "Çöp Odası",
          "definitionGmlId": "id21"
        },
        {
          "code": 1022,
          "codeText": "1022",
          "description": "Niteliksiz Ortak Alan",
          "definitionGmlId": "id22"
        },
        {
          "code": 1024,
          "codeText": "1024",
          "description": "Merdiven",
          "definitionGmlId": "id24"
        },
        {
          "code": 1025,
          "codeText": "1025",
          "description": "Su Merkezi",
          "definitionGmlId": "id25"
        },
        {
          "code": 1026,
          "codeText": "1026",
          "description": "Dini Tesis",
          "definitionGmlId": "id26"
        },
        {
          "code": 1027,
          "codeText": "1027",
          "description": "Müştemilat",
          "definitionGmlId": "id27"
        },
        {
          "code": 1028,
          "codeText": "1028",
          "description": "Teknik Hacim",
          "definitionGmlId": "id28"
        },
        {
          "code": 1029,
          "codeText": "1029",
          "description": "İç Mekan Asansör",
          "definitionGmlId": "id29"
        },
        {
          "code": 1030,
          "codeText": "1030",
          "description": "Depo",
          "definitionGmlId": "id30"
        }
      ]
    },
    {
      "listName": "roomInstallationUsage",
      "dictionaryNameInXml": "roomInstallationUsage",
      "dictionaryGmlId": "roomInstallationUsageType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Merdiven",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Sütun",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Asansör",
          "definitionGmlId": "id3"
        }
      ]
    },
    {
      "listName": "storeyUsage",
      "dictionaryNameInXml": "storeyUsage",
      "dictionaryGmlId": "storeyUsageType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Mesken",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "Ticari",
          "definitionGmlId": "id2"
        },
        {
          "code": 1003,
          "codeText": "1003",
          "description": "Ortak Alan",
          "definitionGmlId": "id3"
        }
      ]
    },
    {
      "listName": "windowUsage",
      "dictionaryNameInXml": "windowUsage",
      "dictionaryGmlId": "windowUsageType",
      "duplicateDefinitionIds": [],
      "entries": [
        {
          "code": 1001,
          "codeText": "1001",
          "description": "Dış Pencere",
          "definitionGmlId": "id1"
        },
        {
          "code": 1002,
          "codeText": "1002",
          "description": "İç Pencere",
          "definitionGmlId": "id2"
        }
      ]
    }
  ],
  "docs": {
    "adimNotuMd": "# M0 + M1 + M2 + M3 + M4 + M5 + M6 + M7 + M8 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)\n\n> **Aşama:** `M0 (F1–F12) + M1 (R1–R3 & G1–G8) + M2 (Dosya Doğrulayıcı, 175 Kural) + M3 (Öznitelik Düzeltici) + M4 (Tasarım Modeli & 2B Editör) + M5 (Geometri Motoru I) + M6 (Geometri Motoru II & Tam CityGML 2.0 Üretimi) + M7 (Konumlandırma Sihirbazı & İçe Aktarma + KONTROL-M7 R1–R9) + M8 (Çatı Arası ve Özel Durumlar)`\n> **Durum:** `TAMAMLANDI (M0–M8 TAMAMI DOĞRULANDI, 155 / 155 Birim Test GEÇTİ, Eğik Çatı Kesimi / BBKIY-OAIY / K71 İç Kısım / Dubleks / Kademeli Katlar 0 HATA, npm ci / typecheck / lint / docs:m2 0 Hata)`\n\n---\n\n## M8 — ÇATI ARASI VE ÖZEL DURUMLAR (`§3.5–§3.9`, `§4.2`, `§5.2`, `§5.4–§5.12`, `§11`) (08.11.2026)\n\n> Ayrıntı: `docs/M8_CATI_ARASI_VE_OZEL_DURUMLAR.md`.\n\n| Madde | Durum |\n|---|---|\n| `src/core/brep/atticClip.ts` (§5.9, §5.12 Çatı Arası Kesimi & Eğik Tavanlar) | YAPILDI. Parametrik (`gable`, `hip`, `shed`) ve `manual` eğik çatı düzlemleriyle oda (`BBK_`/`OA_`), iç yapı (`BBKIY_`/`OAIY_`), `BB_` küveti ve `K_` / `MB_` dış duvarlarının kesilmesi; sırt/mahya iz düşümü köşeleriyle su geçirmez manifold (`V-036`), `<= 1 mm` düzlemsellik (`V-032`), tek `CeilingSurface` (§5.9 #5) ve 3B ıraksama teoremi hacmi (`checkShell` / `V-158`) |\n| `RoomInstallation` (`BBKIY_` & `OAIY_`, §3.9, §4.2) | YAPILDI. Merdiven (`1001`), Sütun (`1002`), Asansör (`1003`) iç yapıları; oda tabanından delik açmadan (§3.9) kapalı B-Rep üretimi, `<bldg:roomInstallation><bldg:IntBuildingInstallation>` XML yazımı, `V-058` `<gml:name>` (`{BB}_{partUsage}_İç Yapı`, `{commonAreaUsage}_İç Yapı`) ve `designFromImportedModel` round-trip |\n| İç Kısım (`K71`, §5.3, §5.5 — Oda İçinde Oda) | YAPILDI. Dış odanın taban ve tavanında otomatik iç halka (delik) açılması, delik çevresi `InteriorWall_` yüzeyleri ve `BB_` küvetinde `V-039` iç içe delik yasağına uygun iç duvar adası üretimi |\n| Dubleks / Çoklu Kat (`groupStoreyId`, `emitStoreyObject`, `1003`/`1004`, §4.2, §4.3) | YAPILDI. Çok katlı `BB_` parçalarının giriş katı `K_` grubuna (`groupMember` ve `independentSectionCount`) bağlanması; `emitStoreyObject === false` çatı arası katlarda `K_` üretilmemesi ve `OA_` `storeyObjectReference = -1` yazımı |\n| Kademeli Katlar (`src/core/brep/polyBoolean2d.ts`, `OuterFloor_` & `OuterCeiling_`, §5.10) | YAPILDI. Saf TS 2B Boolean fark (`subtractPolygons2D`) ile `L.outline − U.outline` → `OuterFloorSurface` (`zCeiling(L)`) ve `U.outline − L.outline` → `OuterCeilingSurface` (`zFloorBottom(U)`) üretimi |\n| Asma Kat (`zFloorOverride`), Uzak Kısım (`remote`), Sahanlık Penceresi (`spansStoreys`), OA Dış Duvarı (`WallSurface`) | YAPILDI. Çok katlı sahanlık penceresi dilimleme, dış cepheye komşu ortak alanda duvar kalınlığı üzerinden `WallSurface` (`Wall_`) sınıflandırması (`V-163`), 2B editör (`iy` aracı ve M8 kontrolleri) ve 3B önizleme desteği |\n| Kabul (§11): Eğik çatılı çatı arası odalar, iç yapı (merdiven/sütun/asansör), iç kısım, dubleks; 0 HATA | YAPILDI. `src/core/__tests__/m8.test.ts` (9/9 test geçti) kendi doğrulayıcımızda **0 HATA**; toplam test **155/155** geçti |\n\n---\n\n## M7 — KONUMLANDIRMA SİHİRBAZI VE İÇE AKTARMA: DXF, HELMERT, RASTER, LİSTE BEYAN & `KONTROL-M7` (`R1–R9`, `§4`) (08.11.2026)\n\n> Ayrıntı: `docs/M7_KONUMLANDIRMA_VE_ICE_AKTARMA.md`.\n\n| Madde | Durum |\n|---|---|\n| `src/core/importers/georefWizard.ts` (§7.3 Helmert & Röleve/TIC) | YAPILDI. Boylamdan (`λ`) `DOM = 27 + 3·round((λ − 27)/3)` ve `EPSG:5253…5259` önerisi (`K07`), 3B röleve tablosu (`ID, E, N, Z`) → `TIC` (`K54`), 2B Helmert en küçük kareler çözücüsü, `5 cm` (`50 mm`) kalıntı eşiği ve `leave-one-out` sapan nokta tespiti (`K76`) |\n| `src/core/importers/rasterCalib.ts` (§8.1 Raster Kat Planı Kalibrasyonu) | YAPILDI. 2 noktalı yatay hizalama açısı, en az 2 X + 2 Y bilinen uzunluk + 3. kontrol ölçüsüyle ayrı X/Y ölçek kalibrasyonu ve `>= 3` kontrol noktasıyla 6 parametreli 2B afin dönüşümü (`KARAR D-23.5`) |\n| `src/core/importers/dxfImporter.ts` (§8.2 DXF İçe Aktarma & Katman Eşleme) | YAPILDI. `$INSUNITS` (`mm/cm/m`), `LWPOLYLINE` bulge yay kırma (`<= 5°`, `<= 5 cm`), `CIRCLE` → 12-gen (`K63`), `LINE` zincirleme (`<= 1 mm`), `INSERT` blok açma, `TEXT`/`MTEXT` oda etiketinden `Ek-A` `partUsage` çıkarımı, TUREF / yerel CAD otomatik tespiti ve `K71` oda boşluğu açma |\n| `src/core/importers/listeBeyan.ts` (§8.4 Liste Beyan & Malik Tablosu) | YAPILDI. CSV/TSV/Akıllı Yapıştırma, `KAT_TANIMI` birebir koruma (`OY-04`), `NITELIK`/`EKLENTI` Türkçe büyük harf (`K61`), `V-198a/b`, `V-199`, `V-208`, `V-212` doğrulaması, kullanıcı önizleme onayı (`OY-06`), serbest düzenlenebilirlik (`K88-yeni`) ve `Malik[]` bilgisinin yalnız `.tkgm3b` içinde tutulup GML'e yazılmaması (`K99`) |\n| Kabul (§11): Gerçek bir projenin DXF'i içe alınıp konumlandırılabiliyor | YAPILDI. `Ornek6` katları yerel/döndürülmüş CAD DXF olarak dışa aktarılıp 4 kontrol noktasıyla Helmert ile konumlandırıldı, katman eşleme tablosuyla içe alındı ve üretilen CityGML kendi doğrulayıcımızda **0 HATA, 0 UYARI** verdi (`MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38, MBG 1`) |\n| Arayüz (`src/editor2d/M7ImportWizardsModal.tsx` & `DesignEditor2D.tsx`) | YAPILDI. 2B Tasarım Editörüne 4 sekmeli M7 sihirbazı (DXF İçe Aktar, Helmert & TIC, Raster Altlık Kalibrasyonu, Liste Beyan & Malik) ve kalibre edilmiş DXF/Raster altlık çizimi + DXF köşe yakalama (snap) eklendi |\n| **KONTROL-M7 R1 (`georefWizard.ts`)** | **YAPILDI.** `applyHelmertWizardToProject` içinde `transformExistingGeometry = false` ve projede çizilmiş geometri varken mevcut `originE, originN` korunur ve `ticPointsMm` bu kökene göre hizalanır; mevcut poligonların TUREF konumu `±1 mm` içinde sabit kalır (`m7.test.ts` R1 testi eklendi) |\n| **KONTROL-M7 R2 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Projede daha önce çizilmiş/aktarılmış geometri varken ikinci kat DXF'i içe aktarıldığında proje kökeni (`originE, originN`) değiştirilmez; gelen DXF koordinatları mevcut kökene göre otomatik ötelenir (`m7.test.ts` R2 testi eklendi) |\n| **KONTROL-M7 R3 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Eşleşmeyen `BB` katmanı modulo ile rastgele BB'ye atanmaz; `M7-DXF-SEC-GUESS` (`U`) uyarısı üretilir ve katman eşleme tablosunda açık BB seçimi (`— BB Seçiniz —`) istenir (`m7.test.ts` R3 testi eklendi) |\n| **KONTROL-M7 R4 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Arayüzdeki sabit `1095.9` m ve `georeferenceDxfDocument` içindeki `1_000_000` mm varsayılanları kaldırıldı; kotsuz (`Z=0`) TIC için `M7-DXF-Z0` (`U`) uyarısı üretilir (`m7.test.ts` R4 testi eklendi) |\n| **KONTROL-M7 R5 (`dxfImporter.ts`)** | **YAPILDI.** Balkon `sectionPartId` ataması `currentStoreySectionParts[0]` yerine ortak kenar (`attachedEdges`) veya en yakın `SectionPart` mesafesiyle yapılır (`m7.test.ts` R5 testi eklendi) |\n| **KONTROL-M7 R6 (`dxfImporter.ts`)** | **YAPILDI.** `inferPartUsageFromRoomLabel` içinde birleşik/özgül etiketler (`\"SPOR SALONU\" -> 1020`, `\"MERDİVEN HOLÜ\" -> 1024`) genel `SALON`/`HOL`/`ODA` kurallarından önce denetlenir (`m7.test.ts` R6 testi eklendi) |\n| **KONTROL-M7 R7 (`docs/M7_KONUMLANDIRMA_VE_ICE_AKTARMA.md`)** | **YAPILDI.** `§4.2` (`1003/1004/1002`) ve `§4.3` (`K71` oda içi oda deliği) düzeltildi; kabul tablosu ve konsol çıktıları eklendi |\n| **KONTROL-M7 R8 (`dxfImporter.ts`)** | **YAPILDI.** Pencere varsayılan denizliği `800 mm` yerine `K46` kuralına göre (`(storey.height - storey.slabThickness) - 500 - height` → `Ornek6` için `900 mm`) hesaplanır (`m7.test.ts` R8 testi eklendi) |\n| **KONTROL-M7 R9 (`M7ImportWizardsModal.tsx`)** | **YAPILDI.** Varlık içermeyen (`entities.length === 0`) DXF için `\"Koordinat sistemi belirlenemedi (varlık yok)\"` gösterilir |\n| **KONTROL-M7 §4 (`ACIK-09` & `M6_GML_URETIMI.md`)** | **YAPILDI.** `docs/ACIK_SORULAR.md` içinde `ACIK-09` **YANITLANDI — 08.11.2026, TKGM 3dbinadogrula: başarılı** olarak kapatıldı; `docs/M6_GML_URETIMI.md` §1 tablosuna `Resmi doğrulama (3dbinadogrula): ✔ başarılı (08.11.2026)` satırı eklendi |\n| Komutlar | `typecheck` (`tsconfig.json` + `tsconfig.core.json`) 0 hata ✔, `npm test` **146/146** ✔ |\n\n---\n\n## M6 — GEOMETRİ MOTORU II VE GML ÜRETİMİ (Claude, 08.11.2026 & Gemini Doğrulaması)\n\n> Ayrıntı: `docs/M6_GML_URETIMI.md`.\n\n| Madde | Durum |\n|---|---|\n| `src/core/brep/building.ts`, `src/core/gml/cityGmlWriter.ts`; tasarım modeline bina bilgisi, balkon, çatı, TIC | YAPILDI |\n| Kabul: Ornek6 altın testi tam; kendi doğrulayıcısında sıfır hata | YAPILDI. Sayılar birebir (MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38); **0 HATA, 0 UYARI** (Biçim A ve B); öznitelikler kaynakla aynı |\n| Yapay bina (düz/beşik/kırma çatı) sıfırdan | YAPILDI. 3/3 dosya 0 HATA |\n| 9 resmi dosyadan çıkar → üret → doğrula | Ornek1, Ornek5, Ornek6: 0 HATA. Kalanlar: eksik MAKS numarası (kullanıcı girdisi), çatı arası (kapsam dışı), kaynak geometri farkları |\n| Arayüz | YAPILDI. \"GML üret ve doğrula\" + \"GML'i kaydet\"; tarayıcıda Ornek6: H 0 · U 0 · 67 ms |\n| Komutlar | `typecheck` 0 hata ✔, `npm test` 130/130 ✔ |\n| Gemini doğrulaması (`CLAUDE-M2-M6-BILDIRIM.md` §0 ve §6) | `npm ci` ✔ (0 hata), `npm run typecheck` ✔ (0 hata), `npm test` ✔ (**130/130** geçti: `m0` 23 + `m1` 10 + `m2` 26 + `m3` 16 + `m4` 20 + `m5` 19 + `m6` 16), `npm run docs:m2` ✔ (`Kapsam tablosu güncellendi: 175 kural.`). M3–M6 kodu ve `KARARLAR.md §A.7–§A.11` incelendi; itiraz yok, tüm kararlara katılıyoruz. |\n\n---\n\n## M5 — GEOMETRİ MOTORU I (Claude, 08.11.2026)\n\n> Ayrıntı: `docs/M5_GEOMETRI_MOTORU.md`.\n\n| Madde | Durum |\n|---|---|\n| `src/core/brep/` (types, generate, shellCheck); `Opening` modeli ve GML'den açıklık çıkarma | YAPILDI |\n| Kabul: Ornek6 altın testi (çatı hariç) | YAPILDI. K 2, BB 2, BBK 16, KAPI 44, PEN 38 birebir; alan ±0,01 ve hacim ±0,05 (16/16); BB 91,34; kotlar birebir; LoD2 8 kapı + 19 pencere |\n| Kabuk denetimi | YAPILDI. 16/16 oda kapalı; BB küvetinde açık kenar yalnız döşeme üstünde (§5.6 alt yüz yok) |\n| Arayüz | YAPILDI. Tasarım Editörü → \"3B üret\" + 3B önizleme; tarayıcıda Ornek6 ile denendi, konsolda hata yok |\n| Komutlar | `typecheck` 0 hata ✔, `npm test` 114/114 ✔ |\n| M6'ya kalan | GML yazımı, LoD0/1/2, TIC, Envelope, balkon, çatı, W Boolean farkı (Clipper2), OA kalınlıklı duvar |\n\n---\n\n## M4 — TASARIM MODELİ VE 2B EDİTÖR (Claude, 08.11.2026)\n\n> Ayrıntı: `docs/M4_TASARIM_EDITORU.md`.\n\n| Madde | Durum |\n|---|---|\n| `src/core/design/` (types, geometry2d, snap, editor, checks, projectFile, fromImported) | YAPILDI |\n| Kabul: Ornek6 planı çizilebiliyor | YAPILDI. Gürültülü tıklamalarla editör komutları; snap köşeleri mm düzeyinde oturtuyor; 0 HATA |\n| Ornek6 alanları ve kotları | YAPILDI. 16/16 kısım ±0,01 m²; kotlar ±1 mm |\n| 9 dosyadan tasarım çıkarma | YAPILDI. 9/9 dosya çizim denetiminde 0 HATA |\n| Arayüz | YAPILDI. 2B panelde \"Tasarım Editörü\"; tarayıcıda gerçek fareyle kat sınırı çizildi (91,34 m², altlıkla mm düzeyinde aynı) |\n| Komutlar | `typecheck` 0 hata ✔, `npm test` 95/95 ✔ |\n\n---\n\n## M3 — ÖZNİTELİK DÜZELTİCİ VE GML YAZICISI (Claude, 08.11.2026)\n\n> Ayrıntı: `docs/M3_DUZELTICI.md`.\n\n| Madde | Durum |\n|---|---|\n| `src/core/gml/gmlWriter.ts` | YAPILDI. `applyAttributeEdits` (Düzeltme kipi, K70/OY-02), `normalizeGml`, `computeRecountEdits`, `computeRenameEdits`, `computeAreaEdits` |\n| `src/core/gml/names.ts` | YAPILDI. Ad kuralları; V-058 ve \"Adlar\" düğmesi aynı fonksiyonu kullanır |\n| Gidiş-dönüş testi (§11 kabul ölçütü) | YAPILDI. Boş düzenleme → SHA-256 aynı; düzenlemede halkaların ham metni birebir aynı |\n| 9 dosya ölçümü | YAPILDI. Düzeltme kipi hiçbir dosyada doğrulamayı değiştirmiyor. Normalize + Alanlar sonrası 8 kabul dosyası 0 HATA |\n| Arayüz | YAPILDI. Değer ve ad düzenleme; Sayımlar / Adlar / Alanlar / Normalize / Geri al / Kaydet; öncesi/sonrası özet şeridi. Tarayıcıda denendi |\n| Komutlar | `typecheck` 0 hata ✔, `npm test` 75/75 ✔ |\n\n---\n\n## M2 — DOSYA DOĞRULAYICI (Claude, 08.11.2026 & Gemini Doğrulaması)\n\n> Gemini'nin günlük limiti dolduğu için M2'yi kullanıcının isteğiyle Claude yazdı (`commit efa52cc`). Ayrıntı: `docs/M2_DOGRULAYICI.md`.\n\n| Madde | Durum |\n|---|---|\n| Kural altyapısı (`src/core/validation/`) | YAPILDI. 175 kural kaydı: 136 uygulandı, 13 okuyucuda, 16 ertelendi (gerekçeli), 7 sunucu (T), 3 kısmi (K) |\n| 8 kabul dosyası 0 HATA | YAPILDI. Ornek1–6, Amasya, Sincan: H = 0 (yerel `verify:samples`) |\n| Ret dosyasında V-202 | YAPILDI. `GML_M-17273333-F`: V-202 H + V-072/073/074/090/130/061 |\n| Her kural için test | YAPILDI. `m2.test.ts`: Ornek6 0 HATA + 18 \"tek hata ekleme\" testi + katalog testleri (59/59) |\n| Doğrulama paneli | YAPILDI. Worker içinde çalışır, H → U → B sıralı, poligon bulgusunda poligon vurgusu |\n| `verify:samples` | YAPILDI. Satıra `regime`, `validationMs`, `issueCounts`, `topRules` eklendi |\n| Okuyucu eki | YAPILDI. `surfaces`, `hostSurfaceTag`; TIC'te `gml:pos` desteği |\n| Komutlar | `npm ci` ✔, `typecheck` 0 hata ✔, `npm test` 59/59 ✔, `npm run docs:m2` (kapsam tablosu) ✔ |\n| Gemini doğrulaması (`CLAUDE-M2-BILDIRIM.md` §0 & §4, `CLAUDE-M2-M6-BILDIRIM.md` §0 & §6) | YAPILDI. AI Studio ortamında `npm ci` (0 hata), `npm run typecheck` (0 hata), `npm test` (**130/130** geçti) ve `npm run docs:m2` (`175 kural`) doğrulandı; M2–M6 kararlarının tamamına katılıyoruz. |\n\n---\n\n## 0. `KONTROL-M1-2.md` (`R1–R3`) ve `KONTROL-M1.md` (`G1–G8`) Durum Tablosu\n\n| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |\n|---|---|---|---|\n| **R1** | HATA (Gerileme — M2 öncesi zorunlu) | **YAPILDI** | Reddedilmiş örnek dosya (GML_M-17273333-F.gml) okunurken boşluk metin düğümünde (\"\\n            \") getNodeByLocalName çökmesi + verify:samples özyinelemeli alt klasör taraması — *getNodeByLocalName ve getAttrByLocalName girişlerine \"if (record === null || typeof record !== 'object') return ...\" koruması eklendi. Ayrıca scripts/verify-samples.ts alt klasörleri özyinelemeli tarayacak ve açılamayan dosyada {\"fileName\":...,\"error\":...} basıp çıkış kodu 1 dönecek şekilde güncellendi (§4.3 ve §4.4 gerileme testleri eklendi).* |\n| **R2** | HATA (Gerileme — M2 öncesi zorunlu) | **YAPILDI** | Kat biçimi tespitinin bozulması (Biçim B katlarında Floor_ >= 3 olduğunda A'ya düşmesi) ve G2 profil birleşimi (Sincan B + 10 mm -> \"B + 10 mm (profil dışı)\") — *Kat biçimi kuralı geri alındı: Floor_ = 1 -> A, = 2 -> C, >= 3 -> B (N2, N26). G2 bunun üzerine kuruldu: Ornek1/4/6 -> A10, Ornek2/3/5 -> B50, Sincan -> \"B + 10 mm (profil dışı)\" + V-215 BİLGİ, Amasya ve GML_M-17273333-F -> \"A, ofset bilinmiyor\" + V-215 BİLGİ (§4.2 gerileme testi eklendi).* |\n| **R3** | HATA (Gerileme — M2 öncesi zorunlu) | **YAPILDI** | Poligon listesinin kopyalanması (Ornek6 içinde 741 yerine 1.123 poligon; BB_ poligonlarının ikinci kez \"BalkonTeras\" olarak eklenmesi) — *directContainers içindeki çift localKey: \"lod2Geometry\" kaldırıldı; BB_ poligonları artık yalnızca \"BagimsizBolum\" olarak okunur (\"BalkonTeras\" yalnız BLKN_/TRS_ için kullanılır). Ayrıca model.polygons her gml:id için tek kayıt tutar ve çoklu sahiplikte ownerObjectGmlIds: string[] alanını kullanır. Ornek6 poligon sayısı 741 olarak doğrulandı (§4.1 gerileme testi eklendi).* |\n| **G1** | Orta (M2 öncesi zorunlu) | **YAPILDI** | GML okuma ve ayrıştırmanın Web Worker içine taşınması (PERF-01) + İlerleme Çubuğu + İptal düğmesi + Transferable Float64Array — *src/workers/gmlReader.worker.ts ve src/workers/gmlWorkerClient.ts oluşturuldu. parseCityGmlModel Web Worker içinde çalışır; poligon köşeleri packModelPolygonVerticesFloat64 ile tek bir Float64Array (Transferable ArrayBuffer) olarak ana iş parçacığına sıfır kopya maliyetiyle aktarılır; üst şeritte canlı %0–%100 ilerleme çubuğu ve worker.terminate() çağıran \"İptal\" düğmesi eklendi.* |\n| **G2** | Düşük | **YAPILDI** | detectedProducerProfile değerinin kat biçimi + kapı alt ofsetini birlikte değerlendirmesi (Sincan B + 10 mm -> \"B + 10 mm (profil dışı)\") — *resolveProducerProfileFromFormAndOffset eklendi: A+10->\"A10\", B+50->\"B50\", C+50->\"C50\"; ofset null ise \"<Form>, ofset bilinmiyor\"; Sincan (B+10 mm) gibi standart dışı kombinasyonlarda \"B + 10 mm (profil dışı)\" döndürülür ve V-215 BİLGİ (\"Profil dışı birleşim...\") üretilir.* |\n| **G3** | Düşük | **YAPILDI** | detectedDoorBottomOffsetMm === null olduğunda (Amasya, GML_M-17273333-F) readerIssues içine V-215 BİLGİ eklenmesi — *Oda tabanı ile eşleşen kapı bulunamadığında readerIssues dizisine V-215 BİLGİ (\"Kapı alt ofseti ölçülemedi (dosyada oda tabanı ile eşleşen kapı bulunamadı).\") eklenir.* |\n| **G4** | Düşük | **YAPILDI** | Eski rejim dosyalarında (Amasya, Sincan) propertyLot olmadığında 0/1 yerine \"—\" gösterilmesi ve V-198 BİLGİ üretilmesi — *analyzeBuildingLandShares içinde hasPropertyLotData bayrağı eklendi; hiçbir BB_ üzerinde propertyLot yoksa formattedTotalUnreduced = \"—\" döndürülür, V-198 BİLGİ (\"Arsa payı bilgisi yok (eski rejim dosyası).\") üretilir ve arayüzde 0/1 yerine \"—\" gösterilir.* |\n| **G5** | Düşük | **YAPILDI** | V-214 (intAttribute/doubleAttribute baş/son boşluk, ör. Ornek6 maksIdentityNumber = \"\\t5129820196\") önem derecesinin UYARI yerine BİLGİ (B) yapılması — *gmlReader.ts içinde V-214 severity alanı \"B\" (BİLGİ) olarak güncellendi; Ornek6 okunduğunda artık HATA: 0, UYARI: 0, BİLGİ: 2 üretir.* |\n| **G6** | Bilgi | **YAPILDI** | npm run verify:samples <klasör> komutunun alt klasörleri özyinelemeli taraması, tek satır JSON özet basması ve hata durumunda çıkış kodu 1 dönmesi — *scripts/verify-samples.ts içine özyinelemeli verifyGmlDirectorySamples eklendi; klasör ve alt klasörlerdeki tüm .gml dosyalarını okur, açılamayan dosyada {\"fileName\":...,\"error\":...} basıp çıkış kodu 1 döner.* |\n| **G7** | Bilgi | **YAPILDI** | src/App.tsx dosyasının modüler parçalara (TreePanel, AttributePanel, ValidationPanel, WorkspaceLayout, workspaceState) bölünmesi ve ağaç etiket tıklama düzeltmesi — *src/state/workspaceState.ts, src/panels/TreePanel.tsx, src/panels/AttributePanel.tsx, src/panels/ValidationPanel.tsx ve src/layout/WorkspaceLayout.tsx oluşturuldu; TreePanel içindeki metin/rozet elemanlarına pointer-events-none eklenerek satırın neresine tıklanırsa tıklansın seçimin tetiklenmesi sağlandı.* |\n| **G8** | Bilgi | **YAPILDI** | gmlReader.ts içinde sabit XML ad alanı öneklerine (core:, bldg:, gml:, grp:, gen:, xlink:) bağımlılığın kaldırılması — *getNodeByLocalName ve getAttrByLocalName yardımcıları (R1 metin düğümü korumasıyla birlikte) eklendi; bilinen önekleri kontrol ettikten sonra herhangi bir özel ad alanı önekini (:localName) yerel adıyla eşleştirir.* |\n\n---\n\n## 1. `KONTROL-M0.md` ve `KONTROL-M0-2.md` Bulguları (`F1–F12`) Durum Tablosu\n\n| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |\n|---|---|---|---|\n| **F1** | Orta (M1 öncesi zorunlu) | **YAPILDI (win32 girdileri doğrulandı)** | package.json esbuild çakışması + package-lock.json + Windows (win32) npm ci uyumluluğu — *node_modules ve package-lock.json silinip temiz npm install ile yeniden üretildi; @tailwindcss/oxide-win32-x64-msvc, lightningcss-win32-x64-msvc ve @esbuild/win32-x64 girdilerinin kilit dosyasında bulunduğu birim testiyle doğrulandı.* |\n| **F2** | Orta (M1 öncesi zorunlu) | **YAPILDI** | src/core/hash/canonical.ts ve readAttributes.ts içinde localeCompare kullanımı — *Tüm sıralamalarda işletim sistemi yerel ayarından bağımsız deterministik UTF-16 kod birimi karşılaştırması (compareCodeUnits: a < b ? -1 : a > b ? 1 : 0) kullanıldı.* |\n| **F3** | Orta (M1 öncesi zorunlu) | **YAPILDI** | src/core/ saflık kuralının (Mutlak Kural 4) derleyici ve statik test ile korunması — *tsconfig.core.json (lib: [\"ES2022\"], types: []) eklendi, npm run typecheck ve lint komutlarına bağlandı; ayrıca m0.test.ts içine statik kaynak tarama testi eklendi.* |\n| **F4** | Orta (M1 öncesi zorunlu) | **YAPILDI** | parseMaksIdValue fonksiyonunun bozuk/negatif girdilerde (\"12a\", \"-1\") çökmemesi — */^\\d{1,19}$/ kontrolü eklendi; geçersiz girdide çökmeden { value: null, exceedsInt32: false, issue: V-213 HATA } ve >2^31-1 durumunda V-213 BİLGİ döndürür.* |\n| **F5** | Düşük | **YAPILDI** | readAttributes.ts içinde <gml:posList srsDimension=\"3\"> desteği ve kapısız odada null + BİLGİ — *Etiket eşleşmeleri <gml:pos\\b[^>]*> ve <gml:posList\\b[^>]*> olarak genişletildi; kapı bulunamazsa detectedDoorBottomOffsetMm: null + V-215 BİLGİ döndürülür.* |\n| **F6** | Düşük | **YAPILDI** | readAttributes.ts kat biçimi tespitinin tüm K_ bloklarını kontrol etmesi (+ M1 GMLReader) — *Dosyadaki tüm K_ blokları taranarak detectedStoreyForms ve hasInconsistentStoreyForms raporlanır (M1 GMLReader içinde tam XML ağacıyla da doğrulanmıştır).* |\n| **F7** | Düşük | **YAPILDI** | parsePropertyLot içinde \"+5/10\" ve \"-5/10\" işaretli payların reddedilmesi — *Düzenli ifade /^(\\d+)\\/(\\d+)$/ olarak sıkılaştırıldı; \"+5/10\" ve \"-5/10\" artık V-198a HATA üretir.* |\n| **F8** | Düşük | **YAPILDI** | Birim test kapsamı genişletmesi (30° dönüklü Helmert, K89 sıra/yerel ayar bağımsızlığı, statik saflık) — *m0.test.ts içine 30° dönüklü + 100 ppm Helmert testi, İ/I/i/ı/_ sıralama bağımsızlığı testi ve statik src/core saflık testi eklendi (22/22 test geçti).* |\n| **F9** | Düşük | **YAPILDI** | .env.example içindeki GEMINI_API_KEY şablon kalıntısının temizlenmesi — *.env.example dosyasından yapay zeka anahtarı kalıntıları tamamen kaldırıldı.* |\n| **F10** | Bilgi | **YAPILDI** | Önizleme arayüzünde kaydedilmiş denetim çıktısı tarih/saat etiketinin açık gösterimi — *src/App.tsx üst bilgi şeridine \"Kaydedilmiş Denetim Çıktısı: <tarih>\" rozeti ve KONTROL-M0 / KONTROL-M1 durum tabloları eklendi.* |\n| **F11** | Bilgi | **YAPILDI** | docs/ACIK_SORULAR.md güncellemesi (<bldg:class>Teras</bldg:class> Ornek3 içinde 9 kez doğrulandı) — *docs/ACIK_SORULAR.md güncellendi: <bldg:class>Teras</bldg:class> kesinleşti.* |\n| **F12** | Bilgi | **YAPILDI** | package.json adının \"tkgm-3d-bina\" yapılması ve TKGM3D_UUID_NAMESPACE sabitinin KARARLAR.md içine işlenmesi — *package.json name alanı \"tkgm-3d-bina\" yapıldı ve TKGM3D_UUID_NAMESPACE (\"6ba7b810-9dad-11d1-80b4-00c04fd430c8\") docs/KARARLAR.md §A.2 içine kalıcı olarak işlendi.* |\n\n---\n\n## 2. `M0`–`M8` Kapsamında Oluşturulan / Doğrulanan Dosyalar\n\n### M8 — Çatı Arası ve Özel Durumlar (`src/core/brep/atticClip.ts`, `src/core/brep/polyBoolean2d.ts`, `generate.ts`, `building.ts`, `cityGmlWriter.ts`, `fromImported.ts`)\n- `src/core/brep/atticClip.ts` (Eğik çatı zarfı `buildRoofEnvelope`, sırt/mahya köşe ekleme `insertSplitPointsIntoPoly`, düzlemsel eğik tavan üretimi `clipCapPolygonToRoof`)\n- `src/core/brep/polyBoolean2d.ts` (Saf TS 2B çokgen Boolean farkı `subtractPolygons2D` ve yarı-düzlem kırpma `clipRingByHalfPlane2D` — kademeli kat `OuterFloorSurface` ve `OuterCeilingSurface`)\n- `src/core/__tests__/m8.test.ts` (9 birim testi: `gable`/`hip`/`shed` çatı arası kesimi, `BBKIY_`/`OAIY_` iç yapı, `K71` iç kısım, dubleks `groupStoreyId` & `emitStoreyObject`, kademeli katlar, sahanlık penceresi, OA dış duvarı)\n- `docs/M8_CATI_ARASI_VE_OZEL_DURUMLAR.md`\n\n### M6 — Geometri Motoru II ve Tam CityGML 2.0 Üretimi (`src/core/brep/building.ts`, `src/core/gml/cityGmlWriter.ts`)\n- `src/core/brep/building.ts` (`generateBuildingBrep`: U biçimli parapetli `BLKN_` / `TRS_` balkon B-Rep üretimi, manuel/düz/beşik/kırma çatı üretimi, LoD0 ayak izi, LoD1 dik prizma, LoD2 zarf yüzleri, TIC noktaları ve tam bina zarfı)\n- `src/core/gml/cityGmlWriter.ts` (`writeCityGml`: Biçim A ve B kat temsili, K92 standart sıralı öznitelikler, `xlink:href` referansları, tam CityGML 2.0 XML üretimi)\n- `src/core/__tests__/m6.test.ts` (16 birim testi: Ornek6 altın testi 0 HATA · 0 UYARI, yapay düz/beşik/kırma çatı 0 HATA, 9 örnek dosya gidiş-dönüş doğrulaması)\n- `docs/M6_GML_URETIMI.md`\n\n### M5 — Geometri Motoru I (`src/core/brep/` — Kat, BB, Oda, Kapı/Pencere B-Rep)\n- `src/core/brep/types.ts`, `generate.ts`, `shellCheck.ts` (Kot motoru, dik izle karşı duvar eşleştirme `T1–T4`, kapalı oda kabukları, §5.6 alt yüzsüz BB küveti, Kat Biçim A/B)\n- `src/viewer3d/BrepPreview3D.tsx` (Tasarım Editörü 3B B-Rep önizleme sahnesi)\n- `src/core/__tests__/m5.test.ts` (19 birim testi: Ornek6 16 oda + 2 BB + 44 kapı + 38 pencere + LoD2 açıklıkları)\n- `docs/M5_GEOMETRI_MOTORU.md`\n\n### M4 — Tasarım Modeli ve 2B Editör (`src/core/design/` & `src/editor2d/DesignEditor2D.tsx`)\n- `src/core/design/types.ts`, `geometry2d.ts`, `snap.ts`, `editor.ts`, `checks.ts`, `projectFile.ts`, `fromImported.ts` (Tam sayı mm yerel koordinat, kenetlenme öncelik sırası, `T-01…T-08` çizim denetimi, `.tkgm3b` proje dosyası, GML'den tasarım çıkarma)\n- `src/editor2d/DesignEditor2D.tsx` (Etkileşimli 2B SVG kat planı editörü ve altlık katmanı)\n- `src/core/__tests__/m4.test.ts` (20 birim testi: Ornek6 plan çizimi, alan ve kot doğrulaması, 9 dosya çıkarma testi)\n- `docs/M4_TASARIM_EDITORU.md`\n\n### M3 — Öznitelik Düzeltici ve GML Yazıcısı (`src/core/gml/gmlWriter.ts`, `src/core/gml/names.ts`)\n- `src/core/gml/gmlWriter.ts`, `src/core/gml/names.ts` (Düzeltme kipi `K70` / `OY-02`, Normalize kipi, Sayımlar / Adlar / Alanlar hesaplayıcıları, `K99` öznitelik beyaz listesi)\n- `src/core/__tests__/m3.test.ts` (16 birim testi: boş düzenlemede birebir SHA-256, halka metni korunumu, 8 kabul dosyası 0 HATA)\n- `docs/M3_DUZELTICI.md`\n\n### M2 — Dosya Doğrulayıcı (`src/core/validation/` — Şartname §6, `V-001…V-216`)\n- `src/core/validation/index.ts`, `types.ts`, `geom.ts`, `knownSampleExceptions.ts`, `rulesFile.ts`, `rulesBuilding.ts`, `rulesBb.ts`, `rulesExtra.ts` (175 kural kaydı: 136 uygulandı, 13 okuyucuda, 16 ertelendi, 7 sunucu, 3 kısmi; Rejim S/E tespiti)\n- `src/core/__tests__/m2.test.ts` (26 birim testi: Ornek6 0 HATA, 18 mutasyon/negatif kural testi, geometri yardımcıları ve 175 kural kataloğu tamlık testi)\n- `scripts/generate-m2-doc.ts` ve `docs/M2_DOGRULAYICI.md` (`npm run docs:m2` ile koddan üretilen kural kapsam tablosu)\n\n### M1 — Web Worker GML Okuyucu (`G1`), `R1–R3` Düzeltmeleri, 3B Delikli Üçgenleme, Modüler Paneller (`G7`) ve KARAR D-23 Çalışma Alanı\n- `src/core/gml/gmlReader.ts`, `src/workers/gmlReader.worker.ts`, `src/workers/gmlWorkerClient.ts`, `src/core/gml/triangulate3d.ts`, `src/viewer3d/CityGmlViewport3D.tsx`, `src/viewer3d/FloorPlanPreview2D.tsx`, `src/state/workspaceState.ts`, `src/panels/*`, `src/layout/WorkspaceLayout.tsx`, `src/core/__tests__/m1.test.ts`\n\n---\n\n## 3. `npm run typecheck`, `npm run lint` ve `npm run docs:m2` Gerçek Çıktısı\n\n```text\n> tkgm-3d-bina@0.1.0 typecheck\n> tsc --noEmit && tsc -p tsconfig.core.json --noEmit\n(Çıkış Kodu: 0 — 0 hata)\n\n> tkgm-3d-bina@0.1.0 docs:m2\n> tsx scripts/generate-m2-doc.ts\n\nKapsam tablosu güncellendi: 175 kural.\n```\n\n---\n\n## 4. `npm test` (`vitest run`) Gerçek Çıktısı (`m0`..`m8` — 155 / 155 Test)\n\n```text\nRUN  v5.1.0 /app/applet\n\n ✓ src/core/__tests__/m1.test.ts (10 tests) 2679ms\n   ✓ M1 Adım 1 — CityGML 2.0 GML Okuyucu (gmlReader.ts) ve KONTROL-M1-2 §4 Gerileme Testleri (R1–R3) (7)\n     ✓ KONTROL-M1-2 §4.1 (R3): Ornek6 altın değerlerini (polygons.length === 741, benzersiz gml:id, MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38, MBG 1, biçim A, ofset 10, profil A10) birebir doğrular 1101ms\n     ✓ KONTROL-M1 G1: Float64Array transferable poligon köşe paketleme ve geri yükleme (packModelPolygonVerticesFloat64 / hydrateModelPolygonVerticesFloat64) sıfır kayıpla çalışır 494ms\n   ✓ M1 Adım 2 — 3B Düzlemsel Poligon + İç Delik (DoorLinearRing_ / WindowLinearRing_) Üçgenleme (triangulate3d.ts) (2)\n     ✓ fixtures/ornek6.gml içindeki tüm iç delikli (DoorLinearRing_ / WindowLinearRing_) duvar poligonlarını sıfır kayıpla üçgenler 510ms\n   ✓ M1 Adım 3 — KARAR D-23.4: Kalıp (F5–F8) ve Panel Boyutu Değişiminin K89 CanonicalHash Üzerinde Etkisizliği (1)\n     ✓ D-23.4 / K89: F5 (Standart), F6 (Yan Yana), F7 (Çizim), F8 (Denetim) ve <1366px sekme modları CanonicalModelHash değerini asla değiştirmez 389ms\n ✓ src/core/__tests__/m3.test.ts (16 tests) 4610ms\n   ✓ M3 — Gidiş-dönüş (şartname §11 kabul ölçütü) (6)\n     ✓ OY-02: Düzeltme kipi yalnız 3 haneden kısa değerleri tamamlar; bütün köşe değerleri ve öznitelikler sayısal olarak aynı 783ms\n     ✓ K70: düzenleme yoksa ve tamamlama kapalıysa çıktı girdiyle bayt bayt aynıdır (SHA-256 eşit) 311ms\n     ✓ K70: öznitelik düzenlemesi geometri metnine dokunmaz; yalnız istenen değerler değişir 391ms\n     ✓ K70: düzenlenen dosya doğrulayıcıda yine 0 HATA verir 397ms\n     ✓ Öznitelik ekleme ve silme: biçim korunur, geri alınınca dosya özgün haline döner 1005ms\n     ✓ Ad (gml:name) düzenlemesi yalnız nesnenin kendi adını değiştirir (yüzey adları değişmez) 492ms\n   ✓ M3 — Sayımlar ve adlar (3)\n     ✓ §7.7: bozulan partCount yeniden hesaplanır ve V-128 kaybolur 572ms\n     ✓ §7.7 / V-058: bozulan ad yeniden üretilir ve dosya özgün haline döner 410ms\n ✓ src/core/__tests__/m6.test.ts (16 tests) 1896ms\n   ✓ M6 — Ornek6 altın testi, tam (§10.4) (10)\n     ✓ Kendi doğrulayıcısında sıfır HATA ve sıfır UYARI (Biçim A = Ornek6, Biçim B = varsayılan); üretim uyarısı yok 589ms\n     ✓ Biçim (§3.1, K70): CRLF, BOM yok, utf-8 bildirimi, posList, tam 3 ondalık; iki yazım bayt bayt aynı 584ms\n ✓ src/core/__tests__/m8.test.ts (9 tests) 1404ms\n   ✓ M8 — Çatı Arası Kesimi (Gable, Hip, Shed, Manual) (§5.9, §5.11, §5.12) (4)\n     ✓ gable eğik çatı altında çatı arası katı: tek CeilingSurface, kapalı manifold kabuk, ıraksama hacmi ve 0 HATA 525ms\n ✓ src/core/__tests__/m2.test.ts (26 tests) 8618ms\n   ✓ M2 — Ornek6 resmi kabul örneği (4)\n     ✓ V-105 / N19: Ornek6 Sürdürülebilirlik rejimindedir (GroundSurface var) 500ms\n   ✓ M2 — Ornek6 üzerinde tek hata ekleme (her kural gerçekten yakalıyor mu?) (18)\n     ✓ V-001: dosya adı M- ile başlamıyor → HATA 495ms\n     ✓ V-002: dosya adı constructionID ile uyuşmuyor → HATA 390ms\n     ✓ V-004: GML ad alanı 3.2 → HATA 410ms\n     ✓ V-014: srsName EPSG:4326 → HATA 396ms\n     ✓ V-021: poligonda srsName → HATA 509ms\n     ✓ V-033: halka kapanmıyor (son pos silindi) → HATA 605ms\n     ✓ V-050: aynı gml:id iki kez → HATA 395ms\n     ✓ V-056: WallSurface elemanında gml:id → HATA 504ms\n     ✓ V-057: kısım sınıf değeri yanlış → HATA 496ms\n     ✓ V-058: kat adı storeyNumber ile uyuşmuyor → HATA 495ms\n     ✓ V-059: yüzey adı yanlış → HATA 406ms\n     ✓ V-061: BB zorunlu partCount yok → HATA 479ms\n     ✓ V-072: bina geometrySuitability 1005 → HATA 406ms\n     ✓ V-202: ret paketi (bina geometrySuitability 1005) → HATA 504ms\n     ✓ V-112: kat parent bina değil → HATA 389ms\n     ✓ V-130: BB integrationState 1003 → HATA 411ms\n     ✓ V-160: kısım BB referansı yok → HATA 422ms\n     ✓ V-188: balkon BB referansı yok → HATA 389ms\n ✓ src/core/__tests__/m7.test.ts (16 tests) 1017ms\n   ✓ M7 — Konumlandırma Sihirbazı ve İçe Aktarma (DXF, Helmert, Raster, Liste Beyan) (16)\n     ✓ 4. §11 M7 Altın Kabul Testi: Gerçek Proje (Ornek6) DXF İçe Aktarma + Helmert Konumlandırma + 0 HATA CityGML (2)\n       ✓ Ornek6 projesinin yerel/döndürülmüş CAD DXF çizimlerini Helmert ile konumlandırıp katman eşlemesiyle içe alır ve 0 HATA ile CityGML üretir 792ms\n ✓ src/core/__tests__/m0.test.ts (23 tests) 388ms\n ✓ src/core/__tests__/m5.test.ts (19 tests) 409ms\n ✓ src/core/__tests__/m4.test.ts (20 tests) 28ms\n\n Test Files  9 passed (9)\n      Tests  155 passed (155)\n   Start at  16:44:35\n   Duration  12.73s (tests 67%, import 30%, transform 2%, worker 1%)\n\n    Isolate  9 workers spawned · ~570ms startup each (spawn + environment, per file)\n             at least ~1.14s faster with isolate: false — reuses workers across files instead of one per file\n```\n\n---\n\n## 5. `npm run verify:samples fixtures` (`G6`, `R1 / R3` & `M2` Doğrulama Özeti) Gerçek Çıktısı\n\n```json\n{\"fileName\":\"ornek6.gml\",\"sizeMB\":0.68,\"durationMs\":265,\"memoryMB\":26.3,\"objectCount\":108,\"polygonCount\":741,\"detectedStoreyForm\":\"A\",\"detectedDoorBottomOffsetMm\":10,\"detectedProducerProfile\":\"A10\",\"landShareTotal\":\"2/2\",\"hasPropertyLotData\":true,\"regime\":\"S\",\"validationMs\":62,\"issueCounts\":{\"H\":1,\"U\":0,\"B\":3},\"topRules\":[\"H:V-001x1\"]}\n```\n\n---\n\n## 6. `npm run trace` Gerçek Çıktısı (`K98`)\n\n```text\n=== TKGM 3B BINA M0 + M1 KURAL-KOD-TEST IZLENEBILIRLIK MATRISI (K98) ===\nToplam Izlenen Kural Sayisi (M0 + M1): 230\n----------------------------------------------------------------------\nKURAL   | KAYNAK MODULLER                        | TEST DOSYALARI\n----------------------------------------------------------------------\nD-23.1  | src/core/gml/gmlReader.ts              | -\nD-23.4  | -                                      | src/core/__tests__/m1.test.ts\nD-23.5  | -                                      | src/core/__tests__/m7.test.ts\nD-23.6  | src/core/gml/gmlReader.ts              | src/core/__tests__/m1.test.ts\nK01     | src/core/gml/gmlReader.ts, src/core/model/index.ts | -\nK02     | src/core/gml/gmlReader.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m3.test.ts\nK06     | src/core/gml/gmlReader.ts, src/core/importers/georefWizard.ts, src/core/model/index.ts | src/core/__tests__/m1.test.ts\nK07     | src/core/gml/gmlReader.ts, src/core/importers/georefWizard.ts, src/core/model/index.ts | src/core/__tests__/m7.test.ts\nK08     | src/core/gml/gmlReader.ts, src/core/gml/triangulate3d.ts, src/core/importers/dxfImporter.ts, src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nK09     | src/core/gml/gmlReader.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK10     | src/core/validation/rulesExtra.ts      | -\nK11     | src/core/validation/rulesExtra.ts      | -\nK12     | src/core/gml/gmlReader.ts, src/core/hash/canonical.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK13     | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nK14     | src/core/gml/gmlReader.ts, src/core/model/index.ts | -\nK15     | src/core/validation/rulesExtra.ts      | -\nK18     | src/core/validation/rulesExtra.ts      | -\nK27     | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nK29     | src/core/importers/listeBeyan.ts       | -\nK30     | src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nK31     | src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts\nK36     | src/core/gml/triangulate3d.ts, src/core/math/ring.ts | src/core/__tests__/m0.test.ts\nK45a    | src/core/brep/generate.ts, src/core/design/fromImported.ts, src/core/design/types.ts, src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts, src/core/__tests__/m5.test.ts\nK46     | src/core/importers/dxfImporter.ts      | src/core/__tests__/m7.test.ts\nK48     | src/core/brep/generate.ts, src/core/brep/types.ts, src/core/validation/rulesExtra.ts | -\nK50     | src/core/gml/triangulate3d.ts, src/core/math/ring.ts | src/core/__tests__/m0.test.ts\nK54     | src/core/importers/georefWizard.ts     | src/core/__tests__/m7.test.ts\nK55     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK59     | src/core/validation/rulesExtra.ts      | -\nK60     | src/core/codelists/index.ts, src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK61     | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts | src/core/__tests__/m7.test.ts\nK62     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -\nK63     | src/core/importers/dxfImporter.ts      | src/core/__tests__/m7.test.ts\nK67     | src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nK68     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -\nK69     | src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nK70     | src/core/gml/cityGmlWriter.ts, src/core/gml/gmlWriter.ts, src/core/model/index.ts | src/core/__tests__/m3.test.ts, src/core/__tests__/m6.test.ts\nK71     | src/core/brep/generate.ts, src/core/brep/polyBoolean2d.ts, src/core/brep/shellCheck.ts, src/core/design/checks.ts, src/core/importers/dxfImporter.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m8.test.ts\nK76     | src/core/importers/dxfImporter.ts, src/core/importers/georefWizard.ts, src/core/importers/rasterCalib.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nK78     | src/core/validation/rulesBuilding.ts, src/core/validation/rulesExtra.ts | -\nK79     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nK80     | src/core/validation/rulesExtra.ts      | -\nK83     | src/core/validation/rulesExtra.ts      | -\nK84     | src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK85     | src/core/validation/rulesExtra.ts      | -\nK86     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -\nK87     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nK88     | src/core/design/projectFile.ts, src/core/gml/cityGmlWriter.ts, src/core/importers/listeBeyan.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m6.test.ts, src/core/__tests__/m7.test.ts\nK89     | src/core/gml/gmlReader.ts, src/core/hash/canonical.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK90     | src/core/model/index.ts                | -\nK91     | src/core/codelists/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nK92     | src/core/hash/canonical.ts, src/core/importers/dxfImporter.ts, src/core/importers/listeBeyan.ts | src/core/__tests__/m0.test.ts\nK93     | src/core/gml/gmlReader.ts, src/core/validation/rulesExtra.ts | -\nK99     | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/gml/readAttributes.ts, src/core/importers/listeBeyan.ts, src/core/model/index.ts, src/core/model/malik.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m3.test.ts, src/core/__tests__/m7.test.ts\nK100    | src/core/model/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts\nV-001   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts\nV-002   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts\nV-003   | src/core/validation/rulesFile.ts       | -\nV-004   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts\nV-005   | src/core/validation/rulesFile.ts       | -\nV-006   | src/core/validation/rulesFile.ts       | -\nV-007   | src/core/validation/rulesFile.ts       | -\nV-008   | src/core/validation/rulesFile.ts       | -\nV-010   | src/core/validation/rulesFile.ts       | -\nV-011   | src/core/validation/rulesFile.ts       | -\nV-012   | src/core/validation/rulesFile.ts       | -\nV-013   | src/core/validation/rulesFile.ts       | -\nV-014   | src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts\nV-015   | src/core/validation/rulesFile.ts       | -\nV-016   | src/core/validation/rulesFile.ts       | -\nV-017   | src/core/validation/rulesFile.ts       | -\nV-018   | src/core/validation/rulesExtra.ts, src/core/validation/rulesFile.ts | -\nV-019   | src/core/importers/georefWizard.ts, src/core/validation/rulesFile.ts | -\nV-020   | src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-021   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts\nV-030   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts\nV-031   | src/core/gml/gmlReader.ts, src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-032   | src/core/brep/atticClip.ts, src/core/gml/gmlWriter.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-033   | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts\nV-034   | src/core/design/checks.ts, src/core/design/editor.ts, src/core/importers/dxfImporter.ts, src/core/validation/geom.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts, src/core/__tests__/m4.test.ts\nV-035   | src/core/validation/geom.ts, src/core/validation/rulesFile.ts | -\nV-036   | src/core/validation/rulesFile.ts       | -\nV-037   | src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-038   | src/core/design/checks.ts, src/core/validation/rulesFile.ts | -\nV-039   | src/core/brep/generate.ts, src/core/validation/rulesFile.ts | -\nV-040   | src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-041   | src/core/validation/rulesFile.ts       | -\nV-042a  | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-042b  | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-050   | src/core/hash/canonical.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts\nV-051   | src/core/hash/canonical.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts\nV-052   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nV-053   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nV-054   | src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nV-055   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -\nV-056   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts\nV-057   | src/core/model/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts\nV-058   | src/core/gml/gmlWriter.ts, src/core/gml/names.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts\nV-059   | src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts\nV-060   | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m3.test.ts, src/core/__tests__/m6.test.ts\nV-061   | src/core/design/checks.ts, src/core/gml/gmlWriter.ts, src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m2.test.ts\nV-062   | src/core/gml/cityGmlWriter.ts, src/core/gml/gmlWriter.ts, src/core/model/index.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m3.test.ts\nV-063   | src/core/codelists/index.ts, src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts\nV-064   | src/core/validation/rulesBuilding.ts   | -\nV-070   | src/core/validation/rulesBuilding.ts   | -\nV-071   | src/core/validation/rulesBuilding.ts   | -\nV-072   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts\nV-073   | src/core/validation/rulesBuilding.ts   | -\nV-074   | src/core/validation/rulesBuilding.ts   | -\nV-075   | src/core/validation/rulesBuilding.ts   | -\nV-076   | src/core/math/landShare.ts, src/core/validation/rulesBuilding.ts | -\nV-077   | src/core/validation/rulesBuilding.ts   | -\nV-078   | src/core/validation/rulesBuilding.ts   | -\nV-079   | src/core/validation/rulesBuilding.ts   | -\nV-080   | src/core/validation/rulesBuilding.ts   | -\nV-081   | src/core/validation/rulesBuilding.ts   | -\nV-082   | src/core/validation/rulesBuilding.ts   | -\nV-083   | src/core/validation/rulesBuilding.ts   | -\nV-084   | src/core/validation/rulesBuilding.ts   | -\nV-085   | src/core/validation/rulesBuilding.ts   | -\nV-090   | src/core/validation/rulesBuilding.ts   | -\nV-091   | src/core/validation/rulesBuilding.ts   | -\nV-092   | src/core/validation/rulesBuilding.ts   | -\nV-093   | src/core/validation/rulesBuilding.ts   | -\nV-094   | src/core/validation/rulesBuilding.ts   | -\nV-095   | src/core/validation/rulesBuilding.ts   | -\nV-096   | src/core/validation/rulesBuilding.ts   | -\nV-097   | src/core/validation/rulesBuilding.ts   | -\nV-098   | src/core/validation/rulesBuilding.ts   | -\nV-099   | src/core/validation/rulesBuilding.ts   | -\nV-100   | src/core/design/checks.ts, src/core/validation/rulesBuilding.ts | -\nV-101   | src/core/validation/rulesBuilding.ts   | -\nV-102   | src/core/validation/rulesBuilding.ts   | -\nV-103   | src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | -\nV-104   | src/core/validation/rulesBuilding.ts   | -\nV-105   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts\nV-106   | src/core/validation/rulesBuilding.ts   | -\nV-107   | src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | -\nV-108   | src/core/validation/rulesBuilding.ts   | -\nV-110   | src/core/validation/rulesBuilding.ts   | -\nV-111   | src/core/validation/rulesBuilding.ts   | -\nV-112   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts\nV-113   | src/core/validation/rulesBuilding.ts   | -\nV-114   | src/core/validation/rulesBuilding.ts   | -\nV-115   | src/core/validation/rulesBuilding.ts   | -\nV-116   | src/core/validation/rulesBuilding.ts   | -\nV-117   | src/core/validation/rulesBuilding.ts   | -\nV-118   | src/core/validation/rulesBuilding.ts   | -\nV-120   | src/core/validation/rulesBb.ts         | -\nV-121   | src/core/validation/rulesBb.ts         | -\nV-122   | src/core/validation/rulesBb.ts         | -\nV-123   | src/core/validation/rulesBb.ts         | -\nV-124   | src/core/validation/rulesBb.ts         | -\nV-125   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -\nV-126   | src/core/validation/rulesBb.ts         | -\nV-127   | src/core/validation/rulesBb.ts         | -\nV-128   | src/core/validation/rulesBb.ts         | src/core/__tests__/m3.test.ts\nV-129   | src/core/validation/rulesBb.ts         | -\nV-130   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts\nV-131   | src/core/validation/rulesBb.ts         | -\nV-132   | src/core/validation/rulesBb.ts         | -\nV-133   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts | -\nV-134   | src/core/validation/rulesBb.ts         | -\nV-135   | src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts | -\nV-136   | src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts | -\nV-137   | src/core/validation/rulesBb.ts         | -\nV-138   | src/core/validation/rulesBb.ts         | -\nV-139   | src/core/validation/rulesBb.ts         | -\nV-140   | src/core/validation/rulesBb.ts         | -\nV-141   | src/core/validation/rulesBb.ts         | -\nV-150   | src/core/validation/rulesBb.ts         | -\nV-151   | src/core/design/checks.ts, src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | src/core/__tests__/m8.test.ts\nV-152   | src/core/validation/rulesBb.ts         | src/core/__tests__/m8.test.ts\nV-153   | src/core/validation/rulesBb.ts         | -\nV-154   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -\nV-155   | src/core/gml/gmlWriter.ts, src/core/validation/rulesBb.ts | -\nV-156   | src/core/validation/rulesBb.ts         | -\nV-157   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -\nV-158   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts\nV-159   | src/core/validation/rulesBb.ts         | -\nV-160   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | src/core/__tests__/m2.test.ts\nV-161   | src/core/validation/rulesBb.ts         | -\nV-162   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -\nV-163   | src/core/validation/rulesBb.ts         | -\nV-164   | src/core/validation/rulesBb.ts         | -\nV-165   | src/core/validation/rulesBb.ts         | -\nV-166   | src/core/validation/rulesBb.ts         | -\nV-170   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -\nV-171   | src/core/validation/rulesBb.ts         | -\nV-172   | src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | -\nV-173   | src/core/validation/rulesBb.ts         | -\nV-174   | src/core/validation/rulesBb.ts         | -\nV-180   | src/core/validation/rulesBb.ts         | -\nV-181   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -\nV-182   | src/core/validation/rulesBb.ts         | -\nV-183   | src/core/validation/rulesBb.ts         | -\nV-184   | src/core/validation/rulesBb.ts         | -\nV-185   | src/core/validation/rulesBb.ts         | -\nV-186   | src/core/validation/knownSampleExceptions.ts, src/core/validation/rulesBb.ts | -\nV-187   | src/core/validation/rulesBb.ts         | -\nV-188   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts\nV-190   | src/core/validation/rulesBb.ts         | -\nV-191   | src/core/validation/rulesBb.ts         | -\nV-192   | src/core/validation/rulesBb.ts         | -\nV-193   | src/core/validation/rulesBb.ts         | -\nV-194   | src/core/validation/rulesBb.ts         | -\nV-195   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts\nV-196   | src/core/validation/rulesExtra.ts      | src/core/__tests__/m2.test.ts, src/core/__tests__/m8.test.ts\nV-197   | src/core/validation/rulesExtra.ts      | -\nV-198   | src/core/math/landShare.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts, src/core/__tests__/m7.test.ts\nV-198a  | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nV-198b  | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts\nV-199   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nV-200   | src/core/validation/rulesExtra.ts      | -\nV-201   | src/core/importers/georefWizard.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m8.test.ts\nV-202   | src/core/validation/rulesExtra.ts      | src/core/__tests__/m2.test.ts\nV-203   | src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | -\nV-204   | src/core/validation/rulesExtra.ts, src/core/validation/rulesFile.ts | -\nV-205   | src/core/validation/rulesExtra.ts      | -\nV-206   | src/core/validation/rulesExtra.ts      | -\nV-207   | src/core/validation/rulesExtra.ts      | -\nV-208   | src/core/importers/listeBeyan.ts, src/core/model/malik.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nV-209   | src/core/validation/rulesExtra.ts      | -\nV-210   | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -\nV-211   | src/core/gml/gmlReader.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m1.test.ts\nV-212   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts\nV-213   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts\nV-214   | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/validation/index.ts, src/core/validation/rulesBuilding.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m1.test.ts, src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts\nV-215   | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts\nV-216   | src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m2.test.ts\n```\n\n---\n\n## 7. `npm run verify:samples` Gerçek Çıktısı (`15 Resmi Dosya SHA-256 + Ornek6 42 Öznitelik`)\n\n```json\n{\n  \"verifiedFileCount\": 15,\n  \"all15ReferenceFilesVerified\": true,\n  \"referenceFiles\": [\n    {\n      \"file\": \"ornek6.gml\",\n      \"sizeBytes\": 717200,\n      \"sha256\": \"7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/buildingGeometrySuitability.xml\",\n      \"sizeBytes\": 1603,\n      \"sha256\": \"f399e6460ea7d8f211b29c5465da9639e0879cd2f4d59cc370faeb6cc1194f39\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/buildingType.xml\",\n      \"sizeBytes\": 770,\n      \"sha256\": \"fc5de1b9c6224bd780612772ce5265c66fe4d1bad9562560bb37980b02798197\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/cardinalDirection.xml\",\n      \"sizeBytes\": 2053,\n      \"sha256\": \"8aa0bc43e64e0417355fb9129fb6a3b67c9c98bace0534d25fbdae4dbd034dc9\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/doorUsage.xml\",\n      \"sizeBytes\": 1180,\n      \"sha256\": \"c394c54ec9765d2ea5b18b4cc618307ce8d33da162f715408ac8c575fc790775\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/independentSectionGeometrySuitability.xml\",\n      \"sizeBytes\": 831,\n      \"sha256\": \"8c13ff3a583a949075dd17e7f63a27ad29a929d47c4505c8334884db5e77c3f0\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/independentSectionPartGeometrySuitability.xml\",\n      \"sizeBytes\": 835,\n      \"sha256\": \"eabb6a64ac72be922c41ea518f20b8ec0d3ecebf8a9cfdda9c432c35001838a2\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/independentSectionUsage.xml\",\n      \"sizeBytes\": 1519,\n      \"sha256\": \"1620a4d341a1393408f330ed2529f2134b6e667b898a9651eac9bebf80de741e\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/integrationState.xml\",\n      \"sizeBytes\": 1181,\n      \"sha256\": \"c234e8ef749233026b5e9fe91acea661f174f9ed1e0a4054287e0f9519493238\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/maksConstructionIntegrationState.xml\",\n      \"sizeBytes\": 1013,\n      \"sha256\": \"945c852cddb5680e31c0d02f0e1481802f82ad7226db0d669b1e2f454079e1f8\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/maksIndependentSectionIntegrationState.xml\",\n      \"sizeBytes\": 1007,\n      \"sha256\": \"4d97b5589b28ec16b5cc5b6b0485f472ce75e76be18ae84fa02c3e2ee67c966f\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/partUsage.xml\",\n      \"sizeBytes\": 5842,\n      \"sha256\": \"07a42ced5cef9d420e33b213409b872e6264d673bf5554d63f115432c763761d\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/roomInstallationUsage.xml\",\n      \"sizeBytes\": 950,\n      \"sha256\": \"5d969360f5031280f4612efad738b23c93b7ca5bfeedad52b9fa69dc7100d98b\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/storeyUsage.xml\",\n      \"sizeBytes\": 949,\n      \"sha256\": \"f7a31e305d7cde8542f859be43947dfec3f092bb9c770e76301e62c6dd3f1119\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/windowUsage.xml\",\n      \"sizeBytes\": 779,\n      \"sha256\": \"c2109006e89f7bb88e81bf9135bf42546471760b02f11f4ae9e2c1c0e50b5563\",\n      \"verified\": true\n    }\n  ],\n  \"codelistSummary\": [\n    {\n      \"listName\": \"buildingGeometrySuitability\",\n      \"entryCount\": 6,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"buildingType\",\n      \"entryCount\": 2,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"cardinalDirection\",\n      \"entryCount\": 9,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"doorUsage\",\n      \"entryCount\": 4,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"independentSectionGeometrySuitability\",\n      \"entryCount\": 2,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"independentSectionPartGeometrySuitability\",\n      \"entryCount\": 2,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"independentSectionUsage\",\n      \"entryCount\": 6,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"integrationState\",\n      \"entryCount\": 4,\n      \"duplicateDefinitionIds\": [\n        \"id3\"\n      ]\n    },\n    {\n      \"listName\": \"maksConstructionIntegrationState\",\n      \"entryCount\": 3,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"maksIndependentSectionIntegrationState\",\n      \"entryCount\": 3,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"partUsage\",\n      \"entryCount\": 29,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"roomInstallationUsage\",\n      \"entryCount\": 3,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"storeyUsage\",\n      \"entryCount\": 3,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"windowUsage\",\n      \"entryCount\": 2,\n      \"duplicateDefinitionIds\": []\n    }\n  ],\n  \"ornek6Inspection\": {\n    \"constructionID\": \"70125626-A\",\n    \"buildingGmlId\": \"MB_b9e3888a-63b3-4f4c-9d75-58af494f6733\",\n    \"srsName\": \"EPSG:5254\",\n    \"envelopeLowerCorner\": \"532566.5734 4288398.1441 1095.9000\",\n    \"envelopeUpperCorner\": \"532580.0220 4288410.3896 1103.7000\",\n    \"roofProjectionArea\": 120.79,\n    \"buildingHeight\": 7.45,\n    \"confirmationDate\": \"1999-12-09\",\n    \"totalIndependentSectionCountAttr\": 2,\n    \"counts\": {\n      \"MB\": 1,\n      \"K\": 2,\n      \"BB\": 2,\n      \"BBK\": 16,\n      \"OA\": 0,\n      \"BBKIY\": 0,\n      \"OAIY\": 0,\n      \"BLKN\": 4,\n      \"TRS\": 0,\n      \"KAPI\": 44,\n      \"PEN\": 38,\n      \"MBG\": 1\n    },\n    \"coordinateEncoding\": \"mixed\",\n    \"detectedStoreyForm\": \"A\",\n    \"detectedStoreyForms\": [\n      \"A\",\n      \"A\"\n    ],\n    \"hasInconsistentStoreyForms\": false,\n    \"detectedDoorBottomOffsetMm\": 10,\n    \"doorOffsetInfoIssue\": null,\n    \"detectedProducerProfile\": \"A10\",\n    \"uniqueGenericAttributes\": [\n      {\n        \"name\": \"additionalNote\",\n        \"type\": \"string\",\n        \"spec\": \"additionalNote:string\",\n        \"occurrenceCount\": 23\n      },\n      {\n        \"name\": \"architecturalPlanID\",\n        \"type\": \"string\",\n        \"spec\": \"architecturalPlanID:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"architecturalProjectConfirmationDate\",\n        \"type\": \"date\",\n        \"spec\": \"architecturalProjectConfirmationDate:date\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"blockName\",\n        \"type\": \"string\",\n        \"spec\": \"blockName:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"blockNumber\",\n        \"type\": \"string\",\n        \"spec\": \"blockNumber:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"buildingHeight\",\n        \"type\": \"double\",\n        \"spec\": \"buildingHeight:double\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"buildingType\",\n        \"type\": \"int\",\n        \"spec\": \"buildingType:int\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"calculatedArea\",\n        \"type\": \"double\",\n        \"spec\": \"calculatedArea:double\",\n        \"occurrenceCount\": 20\n      },\n      {\n        \"name\": \"constructionID\",\n        \"type\": \"string\",\n        \"spec\": \"constructionID:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"doorUsage\",\n        \"type\": \"int\",\n        \"spec\": \"doorUsage:int\",\n        \"occurrenceCount\": 44\n      },\n      {\n        \"name\": \"elevatorCount\",\n        \"type\": \"int\",\n        \"spec\": \"elevatorCount:int\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"entrance\",\n        \"type\": \"string\",\n        \"spec\": \"entrance:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"geometrySuitability\",\n        \"type\": \"int\",\n        \"spec\": \"geometrySuitability:int\",\n        \"occurrenceCount\": 23\n      },\n      {\n        \"name\": \"independentSectionCalculatedArea\",\n        \"type\": \"double\",\n        \"spec\": \"independentSectionCalculatedArea:double\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionCardinalDirection\",\n        \"type\": \"int\",\n        \"spec\": \"independentSectionCardinalDirection:int\",\n        \"occurrenceCount\": 8\n      },\n      {\n        \"name\": \"independentSectionCount\",\n        \"type\": \"int\",\n        \"spec\": \"independentSectionCount:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionNumber\",\n        \"type\": \"string\",\n        \"spec\": \"independentSectionNumber:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionObjectReference\",\n        \"type\": \"string\",\n        \"spec\": \"independentSectionObjectReference:string\",\n        \"occurrenceCount\": 20\n      },\n      {\n        \"name\": \"independentSectionPlanGrossArea\",\n        \"type\": \"double\",\n        \"spec\": \"independentSectionPlanGrossArea:double\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionPlanNetArea\",\n        \"type\": \"double\",\n        \"spec\": \"independentSectionPlanNetArea:double\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionUsage\",\n        \"type\": \"int\",\n        \"spec\": \"independentSectionUsage:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"integrationState\",\n        \"type\": \"int\",\n        \"spec\": \"integrationState:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"maksIdentityNumber\",\n        \"type\": \"int\",\n        \"spec\": \"maksIdentityNumber:int\",\n        \"occurrenceCount\": 3\n      },\n      {\n        \"name\": \"maksIntegrationState\",\n        \"type\": \"int\",\n        \"spec\": \"maksIntegrationState:int\",\n        \"occurrenceCount\": 3\n      },\n      {\n        \"name\": \"maksNumaratajIdentityNumber\",\n        \"type\": \"int\",\n        \"spec\": \"maksNumaratajIdentityNumber:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"parcelNumber\",\n        \"type\": \"string\",\n        \"spec\": \"parcelNumber:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"partCount\",\n        \"type\": \"int\",\n        \"spec\": \"partCount:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"partUsage\",\n        \"type\": \"int\",\n        \"spec\": \"partUsage:int\",\n        \"occurrenceCount\": 16\n      },\n      {\n        \"name\": \"planArea\",\n        \"type\": \"double\",\n        \"spec\": \"planArea:double\",\n        \"occurrenceCount\": 20\n      },\n      {\n        \"name\": \"propertyLot\",\n        \"type\": \"string\",\n        \"spec\": \"propertyLot:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"registeredFloorDefinition\",\n        \"type\": \"string\",\n        \"spec\": \"registeredFloorDefinition:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"registeredInstallation\",\n        \"type\": \"string\",\n        \"spec\": \"registeredInstallation:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"registeredQuality\",\n        \"type\": \"string\",\n        \"spec\": \"registeredQuality:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"roofProjectionArea\",\n        \"type\": \"double\",\n        \"spec\": \"roofProjectionArea:double\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"storeyNumber\",\n        \"type\": \"string\",\n        \"spec\": \"storeyNumber:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"storeyUsage\",\n        \"type\": \"int\",\n        \"spec\": \"storeyUsage:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"takbisNeighbourhoodReference\",\n        \"type\": \"int\",\n        \"spec\": \"takbisNeighbourhoodReference:int\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"takbisPropertyIdentityNumber\",\n        \"type\": \"int\",\n        \"spec\": \"takbisPropertyIdentityNumber:int\",\n        \"occurrenceCount\": 3\n      },\n      {\n        \"name\": \"tenderRegistrationNumber\",\n        \"type\": \"string\",\n        \"spec\": \"tenderRegistrationNumber:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"totalIndependentSectionCount\",\n        \"type\": \"int\",\n        \"spec\": \"totalIndependentSectionCount:int\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"volume\",\n        \"type\": \"double\",\n        \"spec\": \"volume:double\",\n        \"occurrenceCount\": 16\n      },\n      {\n        \"name\": \"windowUsage\",\n        \"type\": \"int\",\n        \"spec\": \"windowUsage:int\",\n        \"occurrenceCount\": 38\n      }\n    ],\n    \"uniqueAttributeSpecsSorted\": [\n      \"additionalNote:string\",\n      \"architecturalPlanID:string\",\n      \"architecturalProjectConfirmationDate:date\",\n      \"blockName:string\",\n      \"blockNumber:string\",\n      \"buildingHeight:double\",\n      \"buildingType:int\",\n      \"calculatedArea:double\",\n      \"constructionID:string\",\n      \"doorUsage:int\",\n      \"elevatorCount:int\",\n      \"entrance:string\",\n      \"geometrySuitability:int\",\n      \"independentSectionCalculatedArea:double\",\n      \"independentSectionCardinalDirection:int\",\n      \"independentSectionCount:int\",\n      \"independentSectionNumber:string\",\n      \"independentSectionObjectReference:string\",\n      \"independentSectionPlanGrossArea:double\",\n      \"independentSectionPlanNetArea:double\",\n      \"independentSectionUsage:int\",\n      \"integrationState:int\",\n      \"maksIdentityNumber:int\",\n      \"maksIntegrationState:int\",\n      \"maksNumaratajIdentityNumber:int\",\n      \"parcelNumber:string\",\n      \"partCount:int\",\n      \"partUsage:int\",\n      \"planArea:double\",\n      \"propertyLot:string\",\n      \"registeredFloorDefinition:string\",\n      \"registeredInstallation:string\",\n      \"registeredQuality:string\",\n      \"roofProjectionArea:double\",\n      \"storeyNumber:string\",\n      \"storeyUsage:int\",\n      \"takbisNeighbourhoodReference:int\",\n      \"takbisPropertyIdentityNumber:int\",\n      \"tenderRegistrationNumber:string\",\n      \"totalIndependentSectionCount:int\",\n      \"volume:double\",\n      \"windowUsage:int\"\n    ],\n    \"unauthorizedAttributes\": [],\n    \"matchesOrnek6Expected42\": true\n  }\n}\n```\n",
    "kararlarMd": "# TKGM 3B SAYISAL YAPI MODELİ (CityGML 2.0) — KESİN KARAR LİSTESİ (`docs/KARARLAR.md`)\n\n> **Kaynaklar:** `claude_uygulama_sartnamesi_v3.md`, `CLAUDE12.md Ek-A`, `CLAUDE13.md §1–§4`, `AISTUDIO_BASLANGIC_TALIMATI.md`, `DOSYA_LISTESI.txt`\n> **Sürüm:** `v3.5.5` (`M0` Çekirdek Kilidi)\n\n---\n\n## A.1 Dosya Kuralları\n- **Standart (`K01`, `V-004`):** CityGML 2.0 + GML 3.1.1 (`http://www.opengis.net/gml`). GML 3.2 yasaktır (`-904`).\n- **Kodlama (`K02`, `V-003`):** UTF-8, **BOM'suz**, satır sonu `CRLF` (`\\r\\n`). İlk satır: `<?xml version=\"1.0\" encoding=\"utf-8\"?>` (`encoding=\"utf-8\"` küçük harf).\n- **Dosya Adı (`K03`, `K04`, `V-001`, `V-002`, `V-010`):** `M-<constructionID>.gml`. Dosyada tam 1 adet `bldg:Building` bulunur.\n- **CRS (`K06`, `K07`, `V-014`, `V-015`, `V-021`):** `srsName=\"EPSG:5253…5259\"` ve `srsDimension=\"3\"` **yalnız** `gml:Envelope` üzerinde bulunur. Polygon, MultiSurface vb. alt elemanlarda `srsName` **yasaktır**.\n- **Koordinat Sırası ve Kot (`K08`, `K10`, `V-020`, `V-201`):** `Y(doğu/easting) X(kuzey/northing) Z(ortometrik gerçek kot, TUREF)`. Yerel `0` tabanlı kot yasaktır.\n- **Sayı Biçimi (`K09`, `K70`, `V-030`, `CLAUDE13 §2.2`):**\n  - Üretimde (`GMLWriter`): `gml:posList`, koordinatlar her zaman tam 3 ondalık (`toFixed(3)`), alan/hacim/yükseklik `toFixed(2)`.\n  - Okumada (`GMLReader`): Hem `gml:pos` hem `gml:posList` ve **1–12 ondalık hane** kabul edilir. İçe alınan dosyada `≠ 3` ondalık hane (`< 3` veya `> 3`) **yalnızca `V-030 BİLGİ (B)`** düzeyindedir, asla `HATA` değildir (18 gerçek kabul dosyasında Z koordinatları 2 hanelidir).\n\n---\n\n## A.2 Kimlik (`gml:id`), Adlar (`gml:name`) ve Sınıflar\n- **`gml:id` Biçimi (`K12`, `K92`, `V-050`, `V-051`):** `<Önek>_<küçük harf deterministik uuidv5>`. Süslü parantez yok, dosya içinde tekrar yok.\n  - **Kilitli `UUIDv5` Ad Alanı (`K92`, `F12`):** `TKGM3D_UUID_NAMESPACE = \"6ba7b810-9dad-11d1-80b4-00c04fd430c8\"` (`M3` ve sonraki tüm sürümlerde aynı deterministik `gml:id` üretimini garanti etmek üzere kalıcı olarak kilitlenmiştir).\n  - **Nesne Önekleri (12 adet — `V-052`):** `MB_`, `K_`, `BB_`, `BBK_`, `OA_`, `BBKIY_`, `OAIY_`, `BLKN_`, `TRS_`, `MBG_`, `KAPI_`, `PEN_`\n  - **Poligon Önekleri (14 adet — `V-053`):** `Floor_`, `Wall_`, `Roof_`, `InteriorWall_`, `Ceiling_`, `Ground_`, `OuterFloor_`, `OuterCeiling_`, `Closure_`, `Lod1Poligon_`, `Lod0FootPrint_`, `Lod0RoofEdge_`, `Door_`, `Window_`\n  - **Halka Önekleri (3 adet — `V-054`, `V-055`):** `LinearRing_`, `DoorLinearRing_`, `WindowLinearRing_`\n- **`gml:id` Verilmeyecek Elemanlar (`K13`, `V-056`):** `*Surface` (`WallSurface`, `RoofSurface`, `GroundSurface`, `FloorSurface`, `InteriorWallSurface`, `CeilingSurface`, `OuterFloorSurface`, `OuterCeilingSurface`), `MultiSurface`, `Solid`, `CompositeSolid`, `CompositeSurface`, `MultiCurve`, `LineString`.\n- **`gml:name` Kuralı (`K14`, `V-058`, `V-059`):** Yalnızca nesnelere ve `*Surface` elemanlarına (`Duvar`, `Çatı`, `Zemin`, `Taban`, `Tavan`, `İçDuvar`, `DışTaban`, `DışTavan`) verilir; `gml:Polygon` ve `gml:LinearRing` elemanlarına `gml:name` verilmez.\n- **`constructionID` (`K19`, `V-070`, `V-071`):** `<takbisPropertyIdentityNumber>-<HARF>` (örn. `70125626-A`; `blockName` `\"-1\"` olsa bile harf korunur).\n- **Sınıf Değerleri (`V-057`):**\n  - `bldg:class`: `MimariBina`, `BagimsizBolumKisim`, `OrtakAlan`, `BagimsizBolumKisimIcYapi`, `OrtakAlanIcYapi`, `Balkon`, `Teras`. Kapı ve Pencerede `bldg:class` **yoktur** (`V-204`).\n  - `grp:class`: `Kat`, `MimariBinaGrup`.\n  - `gen:class`: `BagimsizBolum` (`Ornek6`'dan doğrulandı; `gen:function`/`gen:usage` yoktur).\n- **Referanslar (`K93`, `V-211`):** Tüm `xlink:href` değerleri `#` ile başlar (`xlink:href=\"#MB_...\"`). `independentSectionObjectReference` ve `storeyObjectReference` değerleri ise `#` olmadan ID metnidir (`BB_...`, `K_...` veya `-1`).\n\n---\n\n## A.3 Öznitelik Beyaz Listesi (`ALLOWED_GENERIC_ATTRIBUTES` — Kodda Sabit, 45 Adet)\n\n### 1. `Ornek6` (`fixtures/ornek6.gml`) İçinden Doğrulanan 42 `gen:*Attribute` (`ad:tip`):\n1. `additionalNote:string`\n2. `architecturalPlanID:string`\n3. `architecturalProjectConfirmationDate:date`\n4. `blockName:string`\n5. `blockNumber:string`\n6. `buildingHeight:double`\n7. `buildingType:int`\n8. `calculatedArea:double`\n9. `constructionID:string`\n10. `doorUsage:int`\n11. `elevatorCount:int`\n12. `entrance:string`\n13. `geometrySuitability:int`\n14. `independentSectionCalculatedArea:double`\n15. `independentSectionCardinalDirection:int`\n16. `independentSectionCount:int`\n17. `independentSectionNumber:string`\n18. `independentSectionObjectReference:string`\n19. `independentSectionPlanGrossArea:double`\n20. `independentSectionPlanNetArea:double`\n21. `independentSectionUsage:int`\n22. `integrationState:int`\n23. `maksIdentityNumber:int` *(Modelde `string | bigint | null`, XML'de `gen:intAttribute` — `V-213`)*\n24. `maksIntegrationState:int`\n25. `maksNumaratajIdentityNumber:int` *(Modelde `string | bigint | null`, XML'de `gen:intAttribute` — `V-213`)*\n26. `parcelNumber:string`\n27. `partCount:int`\n28. `partUsage:int`\n29. `planArea:double`\n30. `propertyLot:string`\n31. `registeredFloorDefinition:string`\n32. `registeredInstallation:string`\n33. `registeredQuality:string`\n34. `roofProjectionArea:double`\n35. `storeyNumber:string`\n36. `storeyUsage:int`\n37. `takbisNeighbourhoodReference:int`\n38. `takbisPropertyIdentityNumber:int`\n39. `tenderRegistrationNumber:string`\n40. `totalIndependentSectionCount:int`\n41. `volume:double`\n42. `windowUsage:int`\n\n### 2. Ortak Alan (`OA_`) ve İç Yapı (`BBKIY_` / `OAIY_`) İçin Ek 3 `gen:*Attribute`:\n43. `commonAreaUsage:int` (`OA_` içinde — değerleri `partUsage.xml` kod listesinden okunur)\n44. `storeyObjectReference:string` (`OA_` içinde)\n45. `roomInstallationUsage:int` (`BBKIY_` / `OAIY_` içinde)\n\n### 3. Kesinlikle Yazılmayanlar (`YASAK` — `V-060`, `K67`, `K68`, `K88-yeni`, `V-216`):\n- `measuredHeight`, `lod2Solid`, Texture/Appearance (`app:Appearance`), `verticalDatum`, `storeyHeight`, `calculatedVolume`, `grp:function`, **malik/kişi bilgileri (`Malik`)** ve listede olmayan hiçbir ad.\n\n---\n\n## A.4 Tapu / Beyan Verileri (`K88-yeni`), `Malik` Modeli ve `K83` İptali (`CLAUDE13 §1`)\n- **`K88-yeni`:** `independentSectionNumber`, `propertyLot`, `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition`, `maksIdentityNumber` ve **malikler (`Malik`)** kullanıcı verisidir. Kullanıcı bu verileri elle girebilir, tablodan/listeden yapıştırabilir ve her zaman serbestçe değiştirebilir (kilitli alan yoktur). İsteğe bağlı `otomatikOneri` ayarı (`kapalı` / `açık`, varsayılan: `kapalı`) yalnızca kullanıcı onayıyla yazar.\n- **`Malik` (Kat İrtifakı / Malik Listesi) Veri Modeli (`src/core/model/malik.ts`):**\n  - `interface Malik { bbAnahtari: string; adSoyadVeyaUnvan: string; tcKimlikVeyaVergiNo?: string; hissePay: bigint; hissePayda: bigint; not?: string; }`\n  - Bir bağımsız bölümde birden fazla hissedar (`Malik`) bulunabilir; bir BB içindeki malik hisseleri toplamı `BigInt` kesir aritmetiği ile hesaplanır ve `∑(hissePay / hissePayda) ≠ 1` ise **`V-208 BİLGİ`** üretilir (GML doğrulamasını engellemez).\n  - **GML Yasağı:** Malik bilgileri **yalnızca** proje dosyasında (`.tkgm3b` / `.tkgm3d`) ve kullanıcının kendi dışa aktardığı malik/kat irtifakı listesi raporlarında tutulur; **TKGM CityGML (`.gml`) dosyasına asla yazılmaz**.\n- **`K83` İptali:** `stripPersonalData.ts` modülü kullanıcı kararıyla iptal edilmiş ve `M0` kapsamından çıkarılmıştır.\n\n---\n\n## A.5 15 Resmi Referans Dosyası ve SHA-256 Kilidi (`CLAUDE13 §2.1`)\n- `fixtures/ornek6.gml` (`717200` B, SHA-256: `7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03`)\n- `resources/codelists/*.xml` altındaki 14 resmi XML kod listesi (`resources/DOSYA_LISTESI.txt` ile bayt-bayt kilitli). `commonAreaUsage.xml` adında ayrı bir dosya yoktur; `commonAreaUsage` özniteliği `partUsage.xml` dosyasından okunur.\n\n---\n\n## A.6 Arayüz Yerleşimi (`KARAR D-23` — `claude_uygulama_sartnamesi_v3.md §7.2, §7.4, §7.6, §7.7`)\n\n### D-23.1 Varsayılan Yerleşim (Şartname §7.2 Aynen Korunur)\n\n```text\n┌─────────────┬────────────────────────────┬────────────────────────────┐\n│ PROJE AĞACI │ 2B ÇİZİM (aktif kat)       │ 3B SAHNE (canlı)            │\n│  ~%15       │  ~%45                      │  ~%40                       │\n├─────────────┴────────────────────────────┼────────────────────────────┤\n│ DOĞRULAMA PANELİ (H/U/B, tıkla → git)     │ ÖZNİTELİK PANELİ (seçili)   │\n└──────────────────────────────────────────┴────────────────────────────┘\n```\n\n### D-23.2 Paneller Esnek Olacak\n1. **Boyutlandırma:** Panel sınırları sürüklenerek değişir. Her panel daraltılıp açılabilir.\n2. **Kütüphane:** `react-resizable-panels` (MIT) önerilir. npm ile kurulur ve derlemeye gömülür (`K91`).\n3. **Hazır Düzenler:** Görünüm menüsünde ve kısayolla seçilir.\n\n   | Ad | Kısayol | Kullanım | Düzen |\n   |---|---|---|---|\n   | **Standart** | `F5` | Varsayılan | D-23.1 |\n   | **Yan Yana** (kullanıcının tarif ettiği) | `F6` | — | Sol yarı 2B çizim; sağ yarıda üstte 3B, altta ağaç ve öznitelik |\n   | **Çizim** | `F7` | Plan çizerken | 2B büyük; 3B küçük önizleme; ağaç daraltılmış |\n   | **Denetim** | `F8` | Hazır GML incelerken | 3B büyük; doğrulama paneli geniş; 2B gizli |\n\n   - **Not:** Hazır GML incelenirken 2B paneli gizlenir, çünkü içe aktarılan GML'de çizim katmanı yoktur (`§7.7`).\n4. **İkinci Monitör:** 3B sahne `\"Ayrı pencerede aç\"` komutuyla ikinci bir Electron penceresine taşınabilir.\n   - Seçim ve vurgulama iki pencere arasında eş zamanlı kalır.\n   - Pencere kapanınca 3B sahne ana pencereye geri döner.\n   - Tarayıcı geliştirme ortamında bu komut gizlenir.\n5. **Küçük Ekran (genişlik `< 1366 px`):**\n   - 2B ve 3B tek alanda sekme olarak gösterilir.\n   - Ağaç açılır kenar paneli olur.\n\n### D-23.3 Seçim Eşgüdümü (Zorunlu)\n- **Tek Seçim Kaynağı:** Seçili nesne tek bir `selection` durumunda tutulur.\n  - Ağaçta, 2B'de, 3B'de veya doğrulama panelinde yapılan seçim diğer üçünde de vurgulanır.\n  - Öznitelik paneli bu seçimi gösterir.\n- **Çift Tıklama:**\n  - Ağaçta bir kata çift tıklanınca 2B'de o kat aktif olur.\n  - 3B'de o kat öne alınır (kat patlatma veya kesit).\n- **Hata Seçimi:** Doğrulama panelinde bir hata seçilince ilgili poligon 3B'de kırmızı olur ve kamera oraya gider (`§7.6`). Nesnenin 2B karşılığı varsa 2B'de de gösterilir.\n\n### D-23.4 Arayüz Durumu ve Kanonik Özet\n- **Nerede Saklanır:**\n  - Panel boyutları, seçili hazır düzen, kamera ve ayrı pencere durumu, **kullanıcı ayarı** olarak saklanır (Electron `userData`).\n  - Bunlar proje dosyasına (`.tkgm3b`) **yazılmaz**.\n- **`K89`:** Bu durumlar kanonik model özetini **değiştirmez**. Test:\n  - Aynı model iki farklı yerleşimde aynı özeti vermeli.\n  - Aynı model farklı nesne sırasıyla da aynı özeti vermeli.\n\n### D-23.5 Aşamalara Dağılım (Yol Haritası §11 Değişmez)\n\n| Aşama | Yerleşimde Gelen |\n|---|---|\n| **M1** | Pencere iskeleti, D-23.1 düzeni, boyutlandırma, ağaç + 3B görüntüleyici + öznitelik paneli (içe aktarılan GML için), seçim eşgüdümü. 2B paneli yer tutucu: `\"M4'te gelecek\"`. |\n| **M2** | Doğrulama paneli, tıkla → git. |\n| **M4** | 2B çizim editörü (`§7.4`), Çizim ve Yan Yana hazır düzenleri tam çalışır. |\n| **M6** | Çizimden canlı 3B (her değişiklikte 3B yenilenir; `300 ms` gecikmeli toplu güncelleme önerilir). |\n| **M7** | DXF ve resim altlık katmanı. |\n| **M10** | İkinci monitör penceresi paketlenmiş Electron'da test edilir. |\n\n### D-23.6 Kabul Testi (`M1` Sonunda Kontrol Edilecek)\n1. `Ornek6` açılır.\n2. Ağaçta `BBK_` seçilince 3B'de aynı nesne vurgulanır ve öznitelik panelinde `partUsage` görünür.\n3. Panel boyutları değiştirilip uygulama kapatılıp açılınca aynı kalır.\n4. Hazır düzenler `F5–F8` ile değişir. Kanonik özet değişmez.\n5. Genişlik `1280 px`'e indirilince sekme düzenine geçer.\n\n\n\n---\n\n## A.7 M2 Doğrulayıcı — Rejim ve Ölçüme Dayalı Ciddiyetler (Claude, 08.11.2026)\n\n- **Rejim (N19, AS-1):**\n  - Binada GroundSurface varsa **S** (Sürdürülebilirlik), yoksa **E** (eski kılavuz).\n  - Rejim E'de o dönem istenmeyen öğelerin eksikliği BİLGİ'dir: MAKS/tapu öznitelikleri, GroundSurface, açıklıklar, boş blockName, Envelope dışı TIC, BB'de `InteriorWall_`.\n- **Ölçüme dayalı UYARI'lar:** Şartnamede H olan şu kurallar, TKGM'nin kabul ettiği resmi örneklerde ihlal edildiği için U'dur. Ölçümler `docs/M2_DOGRULAYICI.md` §4'te.\n  - V-076, V-096 (çatı en alçak noktası kısmı), V-117, V-126, V-137, V-138, V-163.\n  - V-164'ün \"açıklık 10 cm'den fazla taşıyor\" kısmı.\n- **V-158:** Oda hacmi, tavan altı prizma yöntemiyle hesaplanır; %1'den büyük sapma UYARI'dır.\n- **§6.14 bilinen istisnalar** `src/core/validation/knownSampleExceptions.ts` dosyasındadır.\n  - Şu an tek kayıt: Ornek2 V-186 (balkon 1002).\n  - Eşleşen bulgu silinmez, BİLGİ'ye düşer ve gerekçesi gösterilir.\n- **Kabul ölçütü (M2 ve sonrası):** 8 kabul dosyasında 0 HATA; ret dosyasında V-202 HATA. Bir kural değişikliği bu ölçütü bozarsa geri alınır.\n\n---\n\n## A.8 M3 Düzeltici ve Yazıcı (Claude, 08.11.2026)\n\n- **Düzeltme kipi (varsayılan, K70):**\n  - Yalnız öznitelik ve ad metinleri değişir.\n  - Geometri metni korunur; 3 haneden kısa koordinatlar sıfırla 3'e tamamlanır (OY-02).\n  - Düzenleme yoksa ve tamamlanacak koordinat yoksa çıktı girdiyle bayt bayt aynıdır.\n- **Normalize:**\n  - `posList` + tam 3 ondalık; ardışık eş noktalar silinir; int/double değerler kırpılır; CRLF, BOM yok.\n  - Sonrasında doğrulama yeniden çalışır ve kural bazında öncesi/sonrası farkı gösterilir.\n- **Alanlar:** `calculatedArea` (kısım ve OA), taban poligonlarının alanından 2 ondalıkla yeniden yazılabilir. Normalize sonrası V-155 için önerilir.\n- **Ad kuralları:** Tek kaynak `src/core/gml/names.ts`. V-058 denetimi ve \"Adlar\" düğmesi bu dosyayı kullanır.\n- **Yazıcı güvenliği:**\n  - Beyaz liste dışı öznitelik yazılmaz (K99). Malik alanları bu yüzden GML'e yazılamaz.\n  - Var olan özniteliğin tipi değiştirilmez; tekrar eden öznitelik düzenlenmez.\n\n---\n\n## A.9 M4 Tasarım Modeli ve 2B Editör (Claude, 08.11.2026)\n\n- **Tasarım modeli:** Şartname §4.2; mm tamsayı; köken tam metre.\n  - **Eklenen alanlar:**\n    - `idSeq`: deterministik kimlik sayacı; `randomUUID` kullanılmaz (Mutlak Kural 6).\n    - `zFloorOverride`: asma kat (§5.2 ÖNERİ).\n    - `remote`: uzak kısım (§4.2).\n- **Snap sırası (§7.4):** köşe > kenar orta > kenar üzeri > dik > paralel > ızgara 1 cm. Tolerans ekranda 8 piksel.\n- **Çizim anı denetimleri (§5.3):**\n  - Alan tabanlıdır: kesişim ≤ 0,1 m²; kat sınırı için boşluk ≤ çevre × 1 mm.\n  - Yalnız aynı kottaki elemanlar karşılaştırılır; delikler dahildir.\n  - Uzak kısım içerme denetiminden muaftır.\n  - Çatı arası (usage 1004) için içerme ihlali UYARI'dır (§5.9).\n- **Proje dosyası `.tkgm3b`:** JSON, deterministik. Malik listesi yalnız burada tutulur, GML'e yazılmaz (K88-yeni).\n\n## A.10 M5 Geometri Motoru I (Claude, 08.11.2026)\n\n- **Çıktı:** B-rep yapısı (`src/core/brep/`). Koordinatlar tamsayı mm; kimlikler `uuidv5` ile deterministik. GML'e yazım M6'dadır.\n- **Kat biçimi:** varsayılan Biçim B + döşeme kenarları (§4.2). Ornek6 ölçümü Biçim A ve döşeme kenarsızdır; `ORNEK6_BREP_OPTIONS`.\n- **Açıklık:**\n  - Karşı yüz uzaklığı karşı kenara dik ölçülür. Eğik binada kenar ucundan ölçmek yanlış sonuç verdi.\n  - En ince duvar 10 mm, en kalın 1000 mm.\n  - Delik köşeleri açıklık noktalarının kendisidir.\n- **Kapı kotu:** Oda ve BB deliği `zFloorTop + 10 mm` (K45a). LoD2 (T1) kapısı `zFloorTop`'tan başlar (Ornek6 ölçümü).\n- **BB küveti:** Alt yüz üretilmez (§5.6). Kapalılık denetiminde açık kenarlar yalnız `zFloorTop`'ta kabul edilir.\n- **Açıklık modeli:** `DesignBuilding.openings` isteğe bağlıdır. M4 proje dosyaları açılır; yoksa boş dizi varsayılır.\n\n## A.11 M6 Geometri Motoru II ve GML Üretimi (Claude, 08.11.2026)\n\n- **Yeni tasarım alanları:** `info`, `sectionInfo`, `cardinalDirections`, `balconies`, `roof`, `tic`. Hepsi isteğe bağlı; yoksa varsayılanlar kullanılır.\n- **Balkon:** BB döşemesiyle aynı taban kutusu. Korkuluk ortak olmayan kenar zinciri boyunca içe ofsetli; her yüz ayrı WallSurface (Ornek6). Korkuluk yüksekliği 0 = korkuluksuz.\n- **Çatı:** `manual` (GML'den çıkarma), `flat`, `gable`/`hip` (yalnız dikdörtgen plan). `roofProjectionArea` = max(yukarı bakan izdüşüm, aşağı bakan izdüşüm).\n- **LoD2:** Dış duvar kat başına kenar × [zFloorBottom, zCeiling], her poligon ayrı WallSurface; T1 kapı tabanı zFloorTop.\n- **Yazıcı:**\n  - Değeri olmayan sayısal öznitelik yazılmaz; boş metin `<gen:value/>`.\n  - `storeyUsage`: Ticari/Mesken + OA varsa 1003.\n- **Açıklık çıkarma:** LoD2 ↔ oda eşleşmesinde kot aralığı %50 örtüşmesi yeterli (Ornek4).\n\n## A.12 M7 Konumlandırma Sihirbazı ve İçe Aktarma (08.11.2026)\n\n- **Helmert ve Röleve / TIC (`src/core/importers/georefWizard.ts`):**\n  - Boylamdan (`λ`) `DOM = 27 + 3 · round((λ − 27) / 3)` ile `EPSG:5253…5259` önerisi (`K07`).\n  - 3B röleve köşe tablosu (`ID, E, N, Z`) doğrudan `building.tic` (`Pt3[]`) noktalarına ve tam sayı metre yerel orijine (`originE, originN`) dönüştürülür (`K08`, `K54`, `K69`).\n  - 2B Helmert en küçük kareler çözücüsünde maksimum kalıntı eşiği `50 mm` (`5 cm`) olarak uygulanır ve `>= 3` noktada `leave-one-out` sapan nokta (`outlierCandidate`) tespiti çalışır (`K76`).\n- **Raster Kat Planı Kalibrasyonu (`src/core/importers/rasterCalib.ts`):**\n  - 2 noktalı yatay referans açısından döndürme açısı, ayrı X ve Y ölçek kalibrasyonu (en az 2 X + 2 Y bilinen uzunluk + 3. kontrol ölçüsü) ve `>= 3` kontrol noktasıyla 6 parametreli en küçük kareler 2B afin dönüşümü uygulanır (`§8.1`, `KARAR D-23.5`).\n- **DXF İçe Aktarma (`src/core/importers/dxfImporter.ts`):**\n  - `$INSUNITS` (`4=mm`, `5=cm`, `6=m`) otomatik okunur; koordinatların zaten TUREF TM aralığında olup olmadığı (`300000 < E < 700000`, `2500000 < N < 5000000`) otomatik algılanır.\n  - `LWPOLYLINE` bulge yayları `<= 5°` ve `<= 5 cm` yay sehimiyle kırıklanır (`K63`), `CIRCLE` nesneleri 12-gen kolona çevrilir (`K63`), `LINE` yığınları `<= 1 mm` toleransla kapalı halkalara zincirlenir, `INSERT` blokları açılır ve `TEXT`/`MTEXT` oda etiketlerinden `Ek-A` `partUsage` kodu çıkarılır.\n  - İçe aktarılan `Part` (`BBK`) odaları kapsayan `SectionPart` poligonundan otomatik delik olarak düşülür (`K71`).\n- **Liste Beyan ve Malik Listesi (`src/core/importers/listeBeyan.ts`):**\n  - CSV/TSV/Akıllı Yapıştırma verilerinde `KAT_TANIMI` (`registeredFloorDefinition`) olduğu gibi korunur (`OY-04`), `NITELIK` ve `EKLENTI` Türkçe büyük harfe çevrilir (`K61`), kullanıcı önizlemeyi onaylamadan (`OY-06`) projeye yazılmaz ve tüm alanlar serbestçe düzenlenebilir kalır (`K88-yeni`).\n  - `Malik[]` listesi yalnızca `.tkgm3b` proje dosyasında saklanır; GML çıktısına asla yazılmaz (`K99`).\n\n## A.13 M8 Çatı Arası ve Özel Durumlar (08.11.2026)\n\n- **Çatı Arası Kesimi (`src/core/brep/atticClip.ts`, `§5.9`, `§5.12`):**\n  - Eğik çatı (`gable`, `hip`, `shed` ve `manual`) altındaki çatı arası katlarda (`clipToRoof: true`, `SectionPart.usage === 1004` veya `Roof.eaveZ`) tavan poligonları çatı düzlemleriyle kesilir; sırt/mahya iz düşümü halka kenarlarına köşe olarak eklenerek su geçirmez manifold (`V-036`) ve `<= 1 mm` düzlemsellik (`V-032`) korunur.\n  - Her odada tüm eğik ve yatay `Ceiling_` poligonları tek bir `<bldg:CeilingSurface>` altında toplanır (`§5.9 #5`); hacim 3B ıraksama teoremiyle (`checkShell` / `V-158`) hesaplanır.\n- **İç Yapı (`RoomInstallation`: `BBKIY_` ve `OAIY_`, `§3.9`, `§4.2`):**\n  - Merdiven (`1001`), sütun (`1002`) ve asansör (`1003`) iç yapıları bağlı olduğu odanın taban poligonundan delik olarak çıkarılmaz (`§3.9`); kendi `FloorSurface`, `InteriorWallSurface` ve `CeilingSurface` yüzeyleriyle `<bldg:roomInstallation><bldg:IntBuildingInstallation>` olarak yazılır.\n- **İç Kısım (`K71`), Dubleks (`groupStoreyId`, `emitStoreyObject`), Sahanlık Penceresi (`spansStoreys`), OA Dış Duvarı ve Kademeli Katlar (`§5.10`):**\n  - Oda içinde oda (`K71`) otomatik delik ve iç duvar adası üretir; kademeli katlarda `subtractPolygons2D` ile `L − U` için `OuterFloorSurface` (`OuterFloor_`) ve `U − L` için `OuterCeilingSurface` (`OuterCeiling_`) üretilir.",
    "acikSorularMd": "# AÇIK SORULAR VE DOĞRULAMA BEKLEYEN MADDELER (`docs/ACIK_SORULAR.md`)\n\n> **Kural (`K97` / `Mutlak Kural 1`):** Örnek dosyada veya normatif şartnamede (`claude_uygulama_sartnamesi_v3.md`, `docs/KARARLAR.md`) karşılığı olmayan hiçbir XML etiketi, öznitelik veya sınıf adı uydurulmaz; doğrulama bekleyen noktalar buraya kaydedilir.\n\n## Kayıtlı Açık Sorular (`M0` / `KONTROL-M0` İtibarıyla)\n\n1. **`ACIK-01` — Teras Nesnesinin `gml:id` Öneki (`KONTROL-M0 F11`, `CLAUDE12 Ek-A §A.2` & `OY-12 #35a`):**\n   - **Doğrulanan Kısım (`KONTROL-M0 F11`):** `<bldg:class>Teras</bldg:class>` sınıf değeri `Ornek3-M-87754451-B.gml` dosyasında **9 kez** ölçülmüş ve **kesinleşmiştir** (açık soru değildir).\n   - **Açık Kalan Tek Nokta:** `Ornek3-M-87754451-B.gml` içindeki bu 9 adet `<bldg:class>Teras</bldg:class>` nesnesinin gerçek `gml:id` öneki (`TRS_` mi yoksa `BLKN_` mi olduğu) `M1` öncesinde Claude tarafından `Ornek3` içinden ölçülerek bildirilecektir.\n   - **Mevcut Uygulama:** Bu ölçüm paylaşılana kadar yeni üretimde varsayılan dış yapı sınıfı `Balkon` (`BLKN_`) olarak kullanılır; `TRS_` öneki teyit edilmeden üretimde kullanılmaz.\n\n\n### ACIK-01 — YANITLANDI (Claude, 08.11.2026, M2 ölçümü)\n- `Ornek3-M-87754451-B.gml` içindeki 9 Teras nesnesi: `bldg:BuildingInstallation`, `gml:id` öneki **`TRS_`**, `<bldg:class>Teras</bldg:class>`.\n- Adları: `-1_-1_-1_Teras`. `independentSectionObjectReference = -1` (V-187).\n- Geometri: FloorSurface (`Floor_`) + WallSurface (`Wall_`).\n- **`TRS_` öneki üretimde kullanılabilir.**\n\n## M2 ile açılan sorular (Claude, 08.11.2026)\n\n2. **ACIK-02 — V-005 XSD doğrulaması:** CityGML 2.0 / GML 3.1.1 XSD dosyaları repoda yok. Ağ erişimi olmadan (K91) şema doğrulaması için resmi XSD kopyaları `resources/xsd/` altına SHA ile kilitlenerek eklenmeli. Kaynak dosyaları kullanıcı sağlamalı.\n3. **ACIK-03 — V-123 BB taban kalınlığı alt sınırı:** Şartnamede sayı yok (\"{...} m\"). Resmi örneklerdeki en küçük kalınlık ölçülüp önerilecek.\n4. **ACIK-04 — V-206 storeyUsage ↔ BB kullanım uyumu:** Uyum tablosu tanımlı değil.\n5. **ACIK-05 — V-165 \"Mükerrer kullanım amacı\":** TKGM mesajının tam anlamı doğrulanmalı (şartname notu).\n6. **ACIK-06 — V-126 BB alan tanımı:** Ornek1'de 70 BB'nin 62'sinde `independentSectionCalculatedArea`, alt taban alanından ~0,9 m² büyük. Hangi yüzeyin alanı olduğu belirlenmeli; şimdilik UYARI.\n\n## M6 ile açılan sorular (Claude, 08.11.2026)\n\n7. **ACIK-07 — storeyUsage 1003 \"nitelikli ortak alan\":** Rehber, katta nitelikli OA varsa 1003 eklenmesini söylüyor. Hangi `commonAreaUsage` kodlarının \"nitelikli\" sayıldığı kod listesinde yok.\n   - Yazıcı şimdilik katta herhangi bir OA varsa 1003 ekliyor.\n   - Ornek5 Kat -1'deki `1003,1002` ile uyumlu.\n8. **ACIK-08 — maksNumaratajIdentityNumber:** Eski kılavuz dosyalarında (Amasya, Sincan; rejim E) yok. Yeni dosyada (GroundSurface'li, rejim S) V-061 zorunlu sayıyor.\n   - Bu numaranın kaynağı MAKS. Kullanıcı girmeli.\n   - Kullanıcıya hangi ekranda sorulacağı belirlenecek (M7 sihirbazı).\n9. **ACIK-09 — Üretilen GML'in resmi kabulü (§10.6): YANITLANDI — 08.11.2026, TKGM 3dbinadogrula: başarılı.** Ornek6'dan üretilen dosya resmi TKGM `3dbinadogrula` doğrulamasından başarılı sonuçla geçti (08.11.2026)."
  }
} as const;
