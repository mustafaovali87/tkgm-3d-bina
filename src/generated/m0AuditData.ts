// Otomatik üretilen M0 gerçek denetim verisi (scripts/generate-adim-notu.ts)
export const M0_AUDIT_DATA = {
  "generatedAtIso": "2026-11-08T01:30:00Z",
  "specVersion": "v3.5.5 (GEMINI14 / CLAUDE13 + KONTROL-M0 F1–F12 Tamamlandı)",
  "stage": "M0 — Çekirdek ve Doğrulama Altyapısı (KONTROL-M0 F1–F12 Doğrulandı)",
  "kontrolM0Findings": [
    {
      "code": "F1",
      "severity": "Orta (M1 öncesi zorunlu)",
      "summary": "package.json esbuild çakışması + package-lock.json eksikliği + npm ci doğrulaması",
      "status": "YAPILDI",
      "resolutionNote": "package.json içinden vite@^8.3.0 ile çakışan esbuild@^0.25.0 kaldırıldı, package-lock.json üretildi ve npm ci 0 hata ile doğrulandı."
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
      "resolutionNote": "Dosyadaki tüm K_ blokları taranarak detectedStoreyForms ve hasInconsistentStoreyForms raporlanır (M1 GMLReader içinde tam XML ağacıyla da doğrulanacaktır)."
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
      "resolutionNote": "src/App.tsx üst bilgi şeridine \"Kaydedilmiş Denetim Çıktısı: <tarih>\" rozeti ve KONTROL-M0 F1–F12 durum tablosu eklendi."
    },
    {
      "code": "F11",
      "severity": "Bilgi",
      "summary": "docs/ACIK_SORULAR.md güncellemesi (<bldg:class>Teras</bldg:class> Ornek3 içinde 9 kez doğrulandı)",
      "status": "YAPILDI",
      "resolutionNote": "docs/ACIK_SORULAR.md güncellendi: <bldg:class>Teras</bldg:class> kesinleşti; yalnız Ornek3 içindeki gml:id öneki M1 öncesinde Claude ölçümüyle netleşecektir."
    },
    {
      "code": "F12",
      "severity": "Bilgi",
      "summary": "package.json adının \"tkgm-3d-bina\" yapılması ve TKGM3D_UUID_NAMESPACE sabitinin KARARLAR.md içine işlenmesi",
      "status": "YAPILDI",
      "resolutionNote": "package.json name alanı \"tkgm-3d-bina\" yapıldı ve TKGM3D_UUID_NAMESPACE (\"6ba7b810-9dad-11d1-80b4-00c04fd430c8\") docs/KARARLAR.md §A.2 içine kalıcı olarak işlendi."
    }
  ],
  "typecheckOutput": "> tkgm-3d-bina@0.1.0 typecheck\n> tsc --noEmit && tsc -p tsconfig.core.json --noEmit\n(Çıkış Kodu: 0 — 0 hata)",
  "vitestOutput": "RUN  v5.1.0 /app/applet\n\n ✓ src/core/__tests__/m0.test.ts (22 tests) 118ms\n\n Test Files  1 passed (1)\n      Tests  22 passed (22)\n   Start at  01:31:31\n   Duration  653ms (transform 47%, tests 28%, import 23%, worker 1%)",
  "traceReport": {
    "rows": [
      {
        "ruleId": "K01",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K06",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K07",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K08",
        "sourceFiles": [
          "src/core/math/helmert2d.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K09",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K12",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K13",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K14",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K27",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K30",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K31",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K36",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K45a",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K50",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K55",
        "sourceFiles": [
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K60",
        "sourceFiles": [
          "src/core/codelists/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K61",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K62",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K67",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K68",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K69",
        "sourceFiles": [
          "src/core/math/helmert2d.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K70",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K76",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K79",
        "sourceFiles": [
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K84",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K86",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "K87",
        "sourceFiles": [
          "src/core/gml/readAttributes.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K88",
        "sourceFiles": [
          "src/core/model/index.ts",
          "src/core/model/malik.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K89",
        "sourceFiles": [
          "src/core/hash/canonical.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
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
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K92",
        "sourceFiles": [
          "src/core/hash/canonical.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "K99",
        "sourceFiles": [
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts",
          "src/core/model/malik.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
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
        "ruleId": "V-014",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-020",
        "sourceFiles": [
          "src/core/math/helmert2d.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-030",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-031",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-032",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-033",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-037",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-040",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-042a",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-042b",
        "sourceFiles": [
          "src/core/math/ring.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-050",
        "sourceFiles": [
          "src/core/hash/canonical.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-051",
        "sourceFiles": [
          "src/core/hash/canonical.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-052",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-053",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-054",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-055",
        "sourceFiles": [
          "src/core/hash/canonical.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-056",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-057",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-059",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-060",
        "sourceFiles": [
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts",
          "src/core/model/malik.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-062",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-063",
        "sourceFiles": [
          "src/core/codelists/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-076",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-133",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-198",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-198a",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-198b",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-199",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-208",
        "sourceFiles": [
          "src/core/model/malik.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-210",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      },
      {
        "ruleId": "V-212",
        "sourceFiles": [
          "src/core/math/landShare.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-213",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-215",
        "sourceFiles": [
          "src/core/gml/readAttributes.ts",
          "src/core/model/index.ts"
        ],
        "testFiles": [
          "src/core/__tests__/m0.test.ts"
        ]
      },
      {
        "ruleId": "V-216",
        "sourceFiles": [
          "src/core/model/index.ts"
        ],
        "testFiles": []
      }
    ],
    "summaryText": "=== TKGM 3B BINA M0 KURAL-KOD-TEST IZLENEBILIRLIK MATRISI (K98) ===\nToplam Izlenen Kural Sayisi (M0 Cekirdek): 68\n----------------------------------------------------------------------\nKURAL   | KAYNAK MODULLER                        | TEST DOSYALARI\n----------------------------------------------------------------------\nK01     | src/core/model/index.ts                | -\nK06     | src/core/model/index.ts                | -\nK07     | src/core/model/index.ts                | -\nK08     | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts\nK09     | src/core/model/index.ts                | src/core/__tests__/m0.test.ts\nK12     | src/core/hash/canonical.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts\nK13     | src/core/model/index.ts                | -\nK14     | src/core/model/index.ts                | -\nK27     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nK30     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nK31     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nK36     | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nK45a    | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nK50     | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nK55     | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts\nK60     | src/core/codelists/index.ts            | src/core/__tests__/m0.test.ts\nK61     | src/core/math/landShare.ts             | -\nK62     | src/core/model/index.ts                | -\nK67     | src/core/model/index.ts                | -\nK68     | src/core/model/index.ts                | -\nK69     | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts\nK70     | src/core/model/index.ts                | -\nK76     | src/core/model/index.ts                | src/core/__tests__/m0.test.ts\nK79     | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts\nK84     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nK86     | src/core/model/index.ts                | -\nK87     | src/core/gml/readAttributes.ts         | src/core/__tests__/m0.test.ts\nK88     | src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts\nK89     | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts\nK90     | src/core/model/index.ts                | -\nK91     | src/core/codelists/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts\nK92     | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts\nK99     | src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts\nK100    | src/core/model/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts\nV-014   | src/core/model/index.ts                | -\nV-020   | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts\nV-030   | src/core/model/index.ts                | src/core/__tests__/m0.test.ts\nV-031   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-032   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-033   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-037   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-040   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-042a  | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-042b  | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-050   | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts\nV-051   | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts\nV-052   | src/core/hash/canonical.ts, src/core/model/index.ts | -\nV-053   | src/core/hash/canonical.ts, src/core/model/index.ts | -\nV-054   | src/core/model/index.ts                | -\nV-055   | src/core/hash/canonical.ts, src/core/model/index.ts | -\nV-056   | src/core/model/index.ts                | -\nV-057   | src/core/model/index.ts                | -\nV-059   | src/core/model/index.ts                | -\nV-060   | src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts\nV-062   | src/core/model/index.ts                | -\nV-063   | src/core/codelists/index.ts            | src/core/__tests__/m0.test.ts\nV-076   | src/core/math/landShare.ts             | -\nV-133   | src/core/math/landShare.ts             | -\nV-198   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-198a  | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-198b  | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-199   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-208   | src/core/model/malik.ts                | src/core/__tests__/m0.test.ts\nV-210   | src/core/model/index.ts                | -\nV-212   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-213   | src/core/model/index.ts                | src/core/__tests__/m0.test.ts\nV-215   | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts\nV-216   | src/core/model/index.ts                | -"
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
    "adimNotuMd": "# M0 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)\n\n> **Aşama:** `M0 + KONTROL-M0 Düzeltmeleri (F1–F12)` (Saf TypeScript Çekirdeği + `tsconfig.core.json` Saflık Kilidi + `package-lock.json` + 15 Resmi Dosya SHA-256 Kilidi + 22 Birim Test)\n> **Durum:** `TAMAMLANDI (F1–F12 TAMAMI YAPILDI, 22 / 22 Birim Test GEÇTİ, 15 / 15 Resmi Dosya SHA-256 DOĞRULANDI, npm ci / typecheck / lint 0 Hata)`\n\n---\n\n## 0. `KONTROL-M0.md` Bulguları (`F1–F12`) Durum Tablosu\n\n| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |\n|---|---|---|---|\n| **F1** | Orta (M1 öncesi zorunlu) | **YAPILDI** | package.json esbuild çakışması + package-lock.json eksikliği + npm ci doğrulaması — *package.json içinden vite@^8.3.0 ile çakışan esbuild@^0.25.0 kaldırıldı, package-lock.json üretildi ve npm ci 0 hata ile doğrulandı.* |\n| **F2** | Orta (M1 öncesi zorunlu) | **YAPILDI** | src/core/hash/canonical.ts ve readAttributes.ts içinde localeCompare kullanımı — *Tüm sıralamalarda işletim sistemi yerel ayarından bağımsız deterministik UTF-16 kod birimi karşılaştırması (compareCodeUnits: a < b ? -1 : a > b ? 1 : 0) kullanıldı.* |\n| **F3** | Orta (M1 öncesi zorunlu) | **YAPILDI** | src/core/ saflık kuralının (Mutlak Kural 4) derleyici ve statik test ile korunması — *tsconfig.core.json (lib: [\"ES2022\"], types: []) eklendi, npm run typecheck ve lint komutlarına bağlandı; ayrıca m0.test.ts içine statik kaynak tarama testi eklendi.* |\n| **F4** | Orta (M1 öncesi zorunlu) | **YAPILDI** | parseMaksIdValue fonksiyonunun bozuk/negatif girdilerde (\"12a\", \"-1\") çökmemesi — */^\\d{1,19}$/ kontrolü eklendi; geçersiz girdide çökmeden { value: null, exceedsInt32: false, issue: V-213 HATA } ve >2^31-1 durumunda V-213 BİLGİ döndürür.* |\n| **F5** | Düşük | **YAPILDI** | readAttributes.ts içinde <gml:posList srsDimension=\"3\"> desteği ve kapısız odada null + BİLGİ — *Etiket eşleşmeleri <gml:pos\\b[^>]*> ve <gml:posList\\b[^>]*> olarak genişletildi; kapı bulunamazsa detectedDoorBottomOffsetMm: null + V-215 BİLGİ döndürülür.* |\n| **F6** | Düşük | **YAPILDI** | readAttributes.ts kat biçimi tespitinin tüm K_ bloklarını kontrol etmesi (+ M1 GMLReader) — *Dosyadaki tüm K_ blokları taranarak detectedStoreyForms ve hasInconsistentStoreyForms raporlanır (M1 GMLReader içinde tam XML ağacıyla da doğrulanacaktır).* |\n| **F7** | Düşük | **YAPILDI** | parsePropertyLot içinde \"+5/10\" ve \"-5/10\" işaretli payların reddedilmesi — *Düzenli ifade /^(\\d+)\\/(\\d+)$/ olarak sıkılaştırıldı; \"+5/10\" ve \"-5/10\" artık V-198a HATA üretir.* |\n| **F8** | Düşük | **YAPILDI** | Birim test kapsamı genişletmesi (30° dönüklü Helmert, K89 sıra/yerel ayar bağımsızlığı, statik saflık) — *m0.test.ts içine 30° dönüklü + 100 ppm Helmert testi, İ/I/i/ı/_ sıralama bağımsızlığı testi ve statik src/core saflık testi eklendi (22/22 test geçti).* |\n| **F9** | Düşük | **YAPILDI** | .env.example içindeki GEMINI_API_KEY şablon kalıntısının temizlenmesi — *.env.example dosyasından yapay zeka anahtarı kalıntıları tamamen kaldırıldı.* |\n| **F10** | Bilgi | **YAPILDI** | Önizleme arayüzünde kaydedilmiş denetim çıktısı tarih/saat etiketinin açık gösterimi — *src/App.tsx üst bilgi şeridine \"Kaydedilmiş Denetim Çıktısı: <tarih>\" rozeti ve KONTROL-M0 F1–F12 durum tablosu eklendi.* |\n| **F11** | Bilgi | **YAPILDI** | docs/ACIK_SORULAR.md güncellemesi (<bldg:class>Teras</bldg:class> Ornek3 içinde 9 kez doğrulandı) — *docs/ACIK_SORULAR.md güncellendi: <bldg:class>Teras</bldg:class> kesinleşti; yalnız Ornek3 içindeki gml:id öneki M1 öncesinde Claude ölçümüyle netleşecektir.* |\n| **F12** | Bilgi | **YAPILDI** | package.json adının \"tkgm-3d-bina\" yapılması ve TKGM3D_UUID_NAMESPACE sabitinin KARARLAR.md içine işlenmesi — *package.json name alanı \"tkgm-3d-bina\" yapıldı ve TKGM3D_UUID_NAMESPACE (\"6ba7b810-9dad-11d1-80b4-00c04fd430c8\") docs/KARARLAR.md §A.2 içine kalıcı olarak işlendi.* |\n\n---\n\n## 1. `M0` Kapsamında Oluşturulan / Doğrulanan Dosyalar\n\n- `package.json` ve `package-lock.json` (`F1`, `F3`, `F12` — `\"name\": \"tkgm-3d-bina\"`, `esbuild` çakışması giderildi, `npm ci` hatasız çalışır)\n- `tsconfig.core.json` (`F3` — `lib: [\"ES2022\"]`, `types: []` ile `src/core/` içinde DOM/Node global kullanımı derleyici düzeyinde yasaklandı)\n- `docs/KARARLAR.md` (`CLAUDE12 Ek-A` + `CLAUDE13 §1–§4` + `F12` `TKGM3D_UUID_NAMESPACE` kilidi)\n- `docs/ACIK_SORULAR.md` (`F11` `<bldg:class>Teras</bldg:class>` `Ornek3` içinde 9 kez doğrulandı; yalnız `gml:id` öneki `M1` öncesi ölçülecek)\n- `docs/ADIM_NOTU.md` (Bu belge — `F1–F12` durum tablosu ve gerçek konsol çıktıları)\n- `fixtures/ornek6.gml` (`717200` bayt, SHA-256: `7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03`)\n- `resources/codelists/*.xml` (14 resmi TKGM XML kod listesi, `resources/DOSYA_LISTESI.txt` ile bayt-bayt kilitli)\n- `src/platform/PlatformAdapter.ts` (`K100` platform soyutlama katmanı)\n- `src/core/codelists/index.ts` (`K60`, `K91`, `V-063` çevrimdışı XML kod listesi ayrıştırıcısı)\n- `src/core/model/index.ts` (`ALLOWED_GENERIC_ATTRIBUTES` 45 öznitelik beyaz listesi, `K09/V-030` ondalık hane denetimi, `F4` güvenli `parseMaksIdValue`)\n- `src/core/math/landShare.ts` (`BigInt` rasyonel arsa payı motoru, `F7` `/^(\\d+)\\/(\\d+)$/` sıkılaştırması, `K84`, `V-198..V-212`)\n- `src/core/math/helmert2d.ts` (2B Helmert dönüşümü, `ppm` ölçek hesabı ve `leave-one-out` uyuşumsuz nokta tespiti)\n- `src/core/math/ring.ts` (Shoelace işaretli alan, `CCW/CW` halka yönü, 3B düzlemsellik `V-037`, delik–kenar mesafesi `K45a`, `V-042a/b`)\n- `src/core/model/malik.ts` (`CLAUDE13 §1` `K88-yeni` Malik veri modeli ve `BigInt` hisse toplamı `= 1/1` kontrolü `V-208`)\n- `src/core/hash/canonical.ts` (`F2` deterministik `compareCodeUnits`, `F3` saf TS `utf8Encode`, `uuidv5` `K92` ve SHA-256 `CanonicalHash` `K89`)\n- `src/core/gml/readAttributes.ts` (`F2`, `F5`, `F6` — `fixtures/ornek6.gml` 42 `gen:*Attribute` ve çok katlı yapı denetçisi)\n- `src/core/__tests__/m0.test.ts` (22 birim testi + `K91` global `fetch` yasağı + `F3/F8` statik `src/core` saflık testi)\n- `scripts/trace.ts` (`npm run trace` kural-kod-test izlenebilirlik matrisi)\n- `scripts/verify-samples.ts` (`npm run verify:samples` 15 resmi dosya SHA-256 + `ornek6.gml` doğrulama betiği)\n\n---\n\n## 2. `npm run typecheck` ve `npm run lint` (`tsc --noEmit && tsc -p tsconfig.core.json --noEmit`) Gerçek Çıktısı\n\n```text\n> tkgm-3d-bina@0.1.0 typecheck\n> tsc --noEmit && tsc -p tsconfig.core.json --noEmit\n(Çıkış Kodu: 0 — 0 hata)\n```\n\n---\n\n## 3. `npm test` (`vitest run`) Gerçek Çıktısı\n\n```text\nRUN  v5.1.0 /app/applet\n\n ✓ src/core/__tests__/m0.test.ts (22 tests) 118ms\n\n Test Files  1 passed (1)\n      Tests  22 passed (22)\n   Start at  01:31:31\n   Duration  653ms (transform 47%, tests 28%, import 23%, worker 1%)\n```\n\n---\n\n## 4. `npm run trace` Gerçek Çıktısı (`K98`)\n\n```text\n=== TKGM 3B BINA M0 KURAL-KOD-TEST IZLENEBILIRLIK MATRISI (K98) ===\nToplam Izlenen Kural Sayisi (M0 Cekirdek): 68\n----------------------------------------------------------------------\nKURAL   | KAYNAK MODULLER                        | TEST DOSYALARI\n----------------------------------------------------------------------\nK01     | src/core/model/index.ts                | -\nK06     | src/core/model/index.ts                | -\nK07     | src/core/model/index.ts                | -\nK08     | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts\nK09     | src/core/model/index.ts                | src/core/__tests__/m0.test.ts\nK12     | src/core/hash/canonical.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts\nK13     | src/core/model/index.ts                | -\nK14     | src/core/model/index.ts                | -\nK27     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nK30     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nK31     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nK36     | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nK45a    | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nK50     | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nK55     | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts\nK60     | src/core/codelists/index.ts            | src/core/__tests__/m0.test.ts\nK61     | src/core/math/landShare.ts             | -\nK62     | src/core/model/index.ts                | -\nK67     | src/core/model/index.ts                | -\nK68     | src/core/model/index.ts                | -\nK69     | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts\nK70     | src/core/model/index.ts                | -\nK76     | src/core/model/index.ts                | src/core/__tests__/m0.test.ts\nK79     | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts\nK84     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nK86     | src/core/model/index.ts                | -\nK87     | src/core/gml/readAttributes.ts         | src/core/__tests__/m0.test.ts\nK88     | src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts\nK89     | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts\nK90     | src/core/model/index.ts                | -\nK91     | src/core/codelists/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts\nK92     | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts\nK99     | src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts\nK100    | src/core/model/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts\nV-014   | src/core/model/index.ts                | -\nV-020   | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts\nV-030   | src/core/model/index.ts                | src/core/__tests__/m0.test.ts\nV-031   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-032   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-033   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-037   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-040   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-042a  | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-042b  | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts\nV-050   | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts\nV-051   | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts\nV-052   | src/core/hash/canonical.ts, src/core/model/index.ts | -\nV-053   | src/core/hash/canonical.ts, src/core/model/index.ts | -\nV-054   | src/core/model/index.ts                | -\nV-055   | src/core/hash/canonical.ts, src/core/model/index.ts | -\nV-056   | src/core/model/index.ts                | -\nV-057   | src/core/model/index.ts                | -\nV-059   | src/core/model/index.ts                | -\nV-060   | src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts\nV-062   | src/core/model/index.ts                | -\nV-063   | src/core/codelists/index.ts            | src/core/__tests__/m0.test.ts\nV-076   | src/core/math/landShare.ts             | -\nV-133   | src/core/math/landShare.ts             | -\nV-198   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-198a  | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-198b  | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-199   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-208   | src/core/model/malik.ts                | src/core/__tests__/m0.test.ts\nV-210   | src/core/model/index.ts                | -\nV-212   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts\nV-213   | src/core/model/index.ts                | src/core/__tests__/m0.test.ts\nV-215   | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts\nV-216   | src/core/model/index.ts                | -\n```\n\n---\n\n## 5. `npm run verify:samples` Gerçek Çıktısı (`15 Resmi Dosya SHA-256 + Ornek6 42 Öznitelik`)\n\n```json\n{\n  \"verifiedFileCount\": 15,\n  \"all15ReferenceFilesVerified\": true,\n  \"referenceFiles\": [\n    {\n      \"file\": \"ornek6.gml\",\n      \"sizeBytes\": 717200,\n      \"sha256\": \"7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/buildingGeometrySuitability.xml\",\n      \"sizeBytes\": 1603,\n      \"sha256\": \"f399e6460ea7d8f211b29c5465da9639e0879cd2f4d59cc370faeb6cc1194f39\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/buildingType.xml\",\n      \"sizeBytes\": 770,\n      \"sha256\": \"fc5de1b9c6224bd780612772ce5265c66fe4d1bad9562560bb37980b02798197\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/cardinalDirection.xml\",\n      \"sizeBytes\": 2053,\n      \"sha256\": \"8aa0bc43e64e0417355fb9129fb6a3b67c9c98bace0534d25fbdae4dbd034dc9\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/doorUsage.xml\",\n      \"sizeBytes\": 1180,\n      \"sha256\": \"c394c54ec9765d2ea5b18b4cc618307ce8d33da162f715408ac8c575fc790775\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/independentSectionGeometrySuitability.xml\",\n      \"sizeBytes\": 831,\n      \"sha256\": \"8c13ff3a583a949075dd17e7f63a27ad29a929d47c4505c8334884db5e77c3f0\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/independentSectionPartGeometrySuitability.xml\",\n      \"sizeBytes\": 835,\n      \"sha256\": \"eabb6a64ac72be922c41ea518f20b8ec0d3ecebf8a9cfdda9c432c35001838a2\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/independentSectionUsage.xml\",\n      \"sizeBytes\": 1519,\n      \"sha256\": \"1620a4d341a1393408f330ed2529f2134b6e667b898a9651eac9bebf80de741e\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/integrationState.xml\",\n      \"sizeBytes\": 1181,\n      \"sha256\": \"c234e8ef749233026b5e9fe91acea661f174f9ed1e0a4054287e0f9519493238\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/maksConstructionIntegrationState.xml\",\n      \"sizeBytes\": 1013,\n      \"sha256\": \"945c852cddb5680e31c0d02f0e1481802f82ad7226db0d669b1e2f454079e1f8\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/maksIndependentSectionIntegrationState.xml\",\n      \"sizeBytes\": 1007,\n      \"sha256\": \"4d97b5589b28ec16b5cc5b6b0485f472ce75e76be18ae84fa02c3e2ee67c966f\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/partUsage.xml\",\n      \"sizeBytes\": 5842,\n      \"sha256\": \"07a42ced5cef9d420e33b213409b872e6264d673bf5554d63f115432c763761d\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/roomInstallationUsage.xml\",\n      \"sizeBytes\": 950,\n      \"sha256\": \"5d969360f5031280f4612efad738b23c93b7ca5bfeedad52b9fa69dc7100d98b\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/storeyUsage.xml\",\n      \"sizeBytes\": 949,\n      \"sha256\": \"f7a31e305d7cde8542f859be43947dfec3f092bb9c770e76301e62c6dd3f1119\",\n      \"verified\": true\n    },\n    {\n      \"file\": \"codelists/windowUsage.xml\",\n      \"sizeBytes\": 779,\n      \"sha256\": \"c2109006e89f7bb88e81bf9135bf42546471760b02f11f4ae9e2c1c0e50b5563\",\n      \"verified\": true\n    }\n  ],\n  \"codelistSummary\": [\n    {\n      \"listName\": \"buildingGeometrySuitability\",\n      \"entryCount\": 6,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"buildingType\",\n      \"entryCount\": 2,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"cardinalDirection\",\n      \"entryCount\": 9,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"doorUsage\",\n      \"entryCount\": 4,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"independentSectionGeometrySuitability\",\n      \"entryCount\": 2,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"independentSectionPartGeometrySuitability\",\n      \"entryCount\": 2,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"independentSectionUsage\",\n      \"entryCount\": 6,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"integrationState\",\n      \"entryCount\": 4,\n      \"duplicateDefinitionIds\": [\n        \"id3\"\n      ]\n    },\n    {\n      \"listName\": \"maksConstructionIntegrationState\",\n      \"entryCount\": 3,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"maksIndependentSectionIntegrationState\",\n      \"entryCount\": 3,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"partUsage\",\n      \"entryCount\": 29,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"roomInstallationUsage\",\n      \"entryCount\": 3,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"storeyUsage\",\n      \"entryCount\": 3,\n      \"duplicateDefinitionIds\": []\n    },\n    {\n      \"listName\": \"windowUsage\",\n      \"entryCount\": 2,\n      \"duplicateDefinitionIds\": []\n    }\n  ],\n  \"ornek6Inspection\": {\n    \"constructionID\": \"70125626-A\",\n    \"buildingGmlId\": \"MB_b9e3888a-63b3-4f4c-9d75-58af494f6733\",\n    \"srsName\": \"EPSG:5254\",\n    \"envelopeLowerCorner\": \"532566.5734 4288398.1441 1095.9000\",\n    \"envelopeUpperCorner\": \"532580.0220 4288410.3896 1103.7000\",\n    \"roofProjectionArea\": 120.79,\n    \"buildingHeight\": 7.45,\n    \"confirmationDate\": \"1999-12-09\",\n    \"totalIndependentSectionCountAttr\": 2,\n    \"counts\": {\n      \"MB\": 1,\n      \"K\": 2,\n      \"BB\": 2,\n      \"BBK\": 16,\n      \"OA\": 0,\n      \"BBKIY\": 0,\n      \"OAIY\": 0,\n      \"BLKN\": 4,\n      \"TRS\": 0,\n      \"KAPI\": 44,\n      \"PEN\": 38,\n      \"MBG\": 1\n    },\n    \"coordinateEncoding\": \"mixed\",\n    \"detectedStoreyForm\": \"A\",\n    \"detectedStoreyForms\": [\n      \"A\",\n      \"A\"\n    ],\n    \"hasInconsistentStoreyForms\": false,\n    \"detectedDoorBottomOffsetMm\": 10,\n    \"doorOffsetInfoIssue\": null,\n    \"detectedProducerProfile\": \"A10\",\n    \"uniqueGenericAttributes\": [\n      {\n        \"name\": \"additionalNote\",\n        \"type\": \"string\",\n        \"spec\": \"additionalNote:string\",\n        \"occurrenceCount\": 23\n      },\n      {\n        \"name\": \"architecturalPlanID\",\n        \"type\": \"string\",\n        \"spec\": \"architecturalPlanID:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"architecturalProjectConfirmationDate\",\n        \"type\": \"date\",\n        \"spec\": \"architecturalProjectConfirmationDate:date\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"blockName\",\n        \"type\": \"string\",\n        \"spec\": \"blockName:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"blockNumber\",\n        \"type\": \"string\",\n        \"spec\": \"blockNumber:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"buildingHeight\",\n        \"type\": \"double\",\n        \"spec\": \"buildingHeight:double\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"buildingType\",\n        \"type\": \"int\",\n        \"spec\": \"buildingType:int\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"calculatedArea\",\n        \"type\": \"double\",\n        \"spec\": \"calculatedArea:double\",\n        \"occurrenceCount\": 20\n      },\n      {\n        \"name\": \"constructionID\",\n        \"type\": \"string\",\n        \"spec\": \"constructionID:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"doorUsage\",\n        \"type\": \"int\",\n        \"spec\": \"doorUsage:int\",\n        \"occurrenceCount\": 44\n      },\n      {\n        \"name\": \"elevatorCount\",\n        \"type\": \"int\",\n        \"spec\": \"elevatorCount:int\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"entrance\",\n        \"type\": \"string\",\n        \"spec\": \"entrance:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"geometrySuitability\",\n        \"type\": \"int\",\n        \"spec\": \"geometrySuitability:int\",\n        \"occurrenceCount\": 23\n      },\n      {\n        \"name\": \"independentSectionCalculatedArea\",\n        \"type\": \"double\",\n        \"spec\": \"independentSectionCalculatedArea:double\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionCardinalDirection\",\n        \"type\": \"int\",\n        \"spec\": \"independentSectionCardinalDirection:int\",\n        \"occurrenceCount\": 8\n      },\n      {\n        \"name\": \"independentSectionCount\",\n        \"type\": \"int\",\n        \"spec\": \"independentSectionCount:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionNumber\",\n        \"type\": \"string\",\n        \"spec\": \"independentSectionNumber:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionObjectReference\",\n        \"type\": \"string\",\n        \"spec\": \"independentSectionObjectReference:string\",\n        \"occurrenceCount\": 20\n      },\n      {\n        \"name\": \"independentSectionPlanGrossArea\",\n        \"type\": \"double\",\n        \"spec\": \"independentSectionPlanGrossArea:double\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionPlanNetArea\",\n        \"type\": \"double\",\n        \"spec\": \"independentSectionPlanNetArea:double\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"independentSectionUsage\",\n        \"type\": \"int\",\n        \"spec\": \"independentSectionUsage:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"integrationState\",\n        \"type\": \"int\",\n        \"spec\": \"integrationState:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"maksIdentityNumber\",\n        \"type\": \"int\",\n        \"spec\": \"maksIdentityNumber:int\",\n        \"occurrenceCount\": 3\n      },\n      {\n        \"name\": \"maksIntegrationState\",\n        \"type\": \"int\",\n        \"spec\": \"maksIntegrationState:int\",\n        \"occurrenceCount\": 3\n      },\n      {\n        \"name\": \"maksNumaratajIdentityNumber\",\n        \"type\": \"int\",\n        \"spec\": \"maksNumaratajIdentityNumber:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"parcelNumber\",\n        \"type\": \"string\",\n        \"spec\": \"parcelNumber:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"partCount\",\n        \"type\": \"int\",\n        \"spec\": \"partCount:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"partUsage\",\n        \"type\": \"int\",\n        \"spec\": \"partUsage:int\",\n        \"occurrenceCount\": 16\n      },\n      {\n        \"name\": \"planArea\",\n        \"type\": \"double\",\n        \"spec\": \"planArea:double\",\n        \"occurrenceCount\": 20\n      },\n      {\n        \"name\": \"propertyLot\",\n        \"type\": \"string\",\n        \"spec\": \"propertyLot:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"registeredFloorDefinition\",\n        \"type\": \"string\",\n        \"spec\": \"registeredFloorDefinition:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"registeredInstallation\",\n        \"type\": \"string\",\n        \"spec\": \"registeredInstallation:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"registeredQuality\",\n        \"type\": \"string\",\n        \"spec\": \"registeredQuality:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"roofProjectionArea\",\n        \"type\": \"double\",\n        \"spec\": \"roofProjectionArea:double\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"storeyNumber\",\n        \"type\": \"string\",\n        \"spec\": \"storeyNumber:string\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"storeyUsage\",\n        \"type\": \"int\",\n        \"spec\": \"storeyUsage:int\",\n        \"occurrenceCount\": 2\n      },\n      {\n        \"name\": \"takbisNeighbourhoodReference\",\n        \"type\": \"int\",\n        \"spec\": \"takbisNeighbourhoodReference:int\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"takbisPropertyIdentityNumber\",\n        \"type\": \"int\",\n        \"spec\": \"takbisPropertyIdentityNumber:int\",\n        \"occurrenceCount\": 3\n      },\n      {\n        \"name\": \"tenderRegistrationNumber\",\n        \"type\": \"string\",\n        \"spec\": \"tenderRegistrationNumber:string\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"totalIndependentSectionCount\",\n        \"type\": \"int\",\n        \"spec\": \"totalIndependentSectionCount:int\",\n        \"occurrenceCount\": 1\n      },\n      {\n        \"name\": \"volume\",\n        \"type\": \"double\",\n        \"spec\": \"volume:double\",\n        \"occurrenceCount\": 16\n      },\n      {\n        \"name\": \"windowUsage\",\n        \"type\": \"int\",\n        \"spec\": \"windowUsage:int\",\n        \"occurrenceCount\": 38\n      }\n    ],\n    \"uniqueAttributeSpecsSorted\": [\n      \"additionalNote:string\",\n      \"architecturalPlanID:string\",\n      \"architecturalProjectConfirmationDate:date\",\n      \"blockName:string\",\n      \"blockNumber:string\",\n      \"buildingHeight:double\",\n      \"buildingType:int\",\n      \"calculatedArea:double\",\n      \"constructionID:string\",\n      \"doorUsage:int\",\n      \"elevatorCount:int\",\n      \"entrance:string\",\n      \"geometrySuitability:int\",\n      \"independentSectionCalculatedArea:double\",\n      \"independentSectionCardinalDirection:int\",\n      \"independentSectionCount:int\",\n      \"independentSectionNumber:string\",\n      \"independentSectionObjectReference:string\",\n      \"independentSectionPlanGrossArea:double\",\n      \"independentSectionPlanNetArea:double\",\n      \"independentSectionUsage:int\",\n      \"integrationState:int\",\n      \"maksIdentityNumber:int\",\n      \"maksIntegrationState:int\",\n      \"maksNumaratajIdentityNumber:int\",\n      \"parcelNumber:string\",\n      \"partCount:int\",\n      \"partUsage:int\",\n      \"planArea:double\",\n      \"propertyLot:string\",\n      \"registeredFloorDefinition:string\",\n      \"registeredInstallation:string\",\n      \"registeredQuality:string\",\n      \"roofProjectionArea:double\",\n      \"storeyNumber:string\",\n      \"storeyUsage:int\",\n      \"takbisNeighbourhoodReference:int\",\n      \"takbisPropertyIdentityNumber:int\",\n      \"tenderRegistrationNumber:string\",\n      \"totalIndependentSectionCount:int\",\n      \"volume:double\",\n      \"windowUsage:int\"\n    ],\n    \"unauthorizedAttributes\": [],\n    \"matchesOrnek6Expected42\": true\n  }\n}\n```\n",
    "kararlarMd": "# TKGM 3B SAYISAL YAPI MODELİ (CityGML 2.0) — KESİN KARAR LİSTESİ (`docs/KARARLAR.md`)\n\n> **Kaynaklar:** `claude_uygulama_sartnamesi_v3.md`, `CLAUDE12.md Ek-A`, `CLAUDE13.md §1–§4`, `AISTUDIO_BASLANGIC_TALIMATI.md`, `DOSYA_LISTESI.txt`\n> **Sürüm:** `v3.5.5` (`M0` Çekirdek Kilidi)\n\n---\n\n## A.1 Dosya Kuralları\n- **Standart (`K01`, `V-004`):** CityGML 2.0 + GML 3.1.1 (`http://www.opengis.net/gml`). GML 3.2 yasaktır (`-904`).\n- **Kodlama (`K02`, `V-003`):** UTF-8, **BOM'suz**, satır sonu `CRLF` (`\\r\\n`). İlk satır: `<?xml version=\"1.0\" encoding=\"utf-8\"?>` (`encoding=\"utf-8\"` küçük harf).\n- **Dosya Adı (`K03`, `K04`, `V-001`, `V-002`, `V-010`):** `M-<constructionID>.gml`. Dosyada tam 1 adet `bldg:Building` bulunur.\n- **CRS (`K06`, `K07`, `V-014`, `V-015`, `V-021`):** `srsName=\"EPSG:5253…5259\"` ve `srsDimension=\"3\"` **yalnız** `gml:Envelope` üzerinde bulunur. Polygon, MultiSurface vb. alt elemanlarda `srsName` **yasaktır**.\n- **Koordinat Sırası ve Kot (`K08`, `K10`, `V-020`, `V-201`):** `Y(doğu/easting) X(kuzey/northing) Z(ortometrik gerçek kot, TUREF)`. Yerel `0` tabanlı kot yasaktır.\n- **Sayı Biçimi (`K09`, `K70`, `V-030`, `CLAUDE13 §2.2`):**\n  - Üretimde (`GMLWriter`): `gml:posList`, koordinatlar her zaman tam 3 ondalık (`toFixed(3)`), alan/hacim/yükseklik `toFixed(2)`.\n  - Okumada (`GMLReader`): Hem `gml:pos` hem `gml:posList` ve **1–12 ondalık hane** kabul edilir. İçe alınan dosyada `≠ 3` ondalık hane (`< 3` veya `> 3`) **yalnızca `V-030 BİLGİ (B)`** düzeyindedir, asla `HATA` değildir (18 gerçek kabul dosyasında Z koordinatları 2 hanelidir).\n\n---\n\n## A.2 Kimlik (`gml:id`), Adlar (`gml:name`) ve Sınıflar\n- **`gml:id` Biçimi (`K12`, `K92`, `V-050`, `V-051`):** `<Önek>_<küçük harf deterministik uuidv5>`. Süslü parantez yok, dosya içinde tekrar yok.\n  - **Kilitli `UUIDv5` Ad Alanı (`K92`, `F12`):** `TKGM3D_UUID_NAMESPACE = \"6ba7b810-9dad-11d1-80b4-00c04fd430c8\"` (`M3` ve sonraki tüm sürümlerde aynı deterministik `gml:id` üretimini garanti etmek üzere kalıcı olarak kilitlenmiştir).\n  - **Nesne Önekleri (12 adet — `V-052`):** `MB_`, `K_`, `BB_`, `BBK_`, `OA_`, `BBKIY_`, `OAIY_`, `BLKN_`, `TRS_`, `MBG_`, `KAPI_`, `PEN_`\n  - **Poligon Önekleri (14 adet — `V-053`):** `Floor_`, `Wall_`, `Roof_`, `InteriorWall_`, `Ceiling_`, `Ground_`, `OuterFloor_`, `OuterCeiling_`, `Closure_`, `Lod1Poligon_`, `Lod0FootPrint_`, `Lod0RoofEdge_`, `Door_`, `Window_`\n  - **Halka Önekleri (3 adet — `V-054`, `V-055`):** `LinearRing_`, `DoorLinearRing_`, `WindowLinearRing_`\n- **`gml:id` Verilmeyecek Elemanlar (`K13`, `V-056`):** `*Surface` (`WallSurface`, `RoofSurface`, `GroundSurface`, `FloorSurface`, `InteriorWallSurface`, `CeilingSurface`, `OuterFloorSurface`, `OuterCeilingSurface`), `MultiSurface`, `Solid`, `CompositeSolid`, `CompositeSurface`, `MultiCurve`, `LineString`.\n- **`gml:name` Kuralı (`K14`, `V-058`, `V-059`):** Yalnızca nesnelere ve `*Surface` elemanlarına (`Duvar`, `Çatı`, `Zemin`, `Taban`, `Tavan`, `İçDuvar`, `DışTaban`, `DışTavan`) verilir; `gml:Polygon` ve `gml:LinearRing` elemanlarına `gml:name` verilmez.\n- **`constructionID` (`K19`, `V-070`, `V-071`):** `<takbisPropertyIdentityNumber>-<HARF>` (örn. `70125626-A`; `blockName` `\"-1\"` olsa bile harf korunur).\n- **Sınıf Değerleri (`V-057`):**\n  - `bldg:class`: `MimariBina`, `BagimsizBolumKisim`, `OrtakAlan`, `BagimsizBolumKisimIcYapi`, `OrtakAlanIcYapi`, `Balkon`, `Teras`. Kapı ve Pencerede `bldg:class` **yoktur** (`V-204`).\n  - `grp:class`: `Kat`, `MimariBinaGrup`.\n  - `gen:class`: `BagimsizBolum` (`Ornek6`'dan doğrulandı; `gen:function`/`gen:usage` yoktur).\n- **Referanslar (`K93`, `V-211`):** Tüm `xlink:href` değerleri `#` ile başlar (`xlink:href=\"#MB_...\"`). `independentSectionObjectReference` ve `storeyObjectReference` değerleri ise `#` olmadan ID metnidir (`BB_...`, `K_...` veya `-1`).\n\n---\n\n## A.3 Öznitelik Beyaz Listesi (`ALLOWED_GENERIC_ATTRIBUTES` — Kodda Sabit, 45 Adet)\n\n### 1. `Ornek6` (`fixtures/ornek6.gml`) İçinden Doğrulanan 42 `gen:*Attribute` (`ad:tip`):\n1. `additionalNote:string`\n2. `architecturalPlanID:string`\n3. `architecturalProjectConfirmationDate:date`\n4. `blockName:string`\n5. `blockNumber:string`\n6. `buildingHeight:double`\n7. `buildingType:int`\n8. `calculatedArea:double`\n9. `constructionID:string`\n10. `doorUsage:int`\n11. `elevatorCount:int`\n12. `entrance:string`\n13. `geometrySuitability:int`\n14. `independentSectionCalculatedArea:double`\n15. `independentSectionCardinalDirection:int`\n16. `independentSectionCount:int`\n17. `independentSectionNumber:string`\n18. `independentSectionObjectReference:string`\n19. `independentSectionPlanGrossArea:double`\n20. `independentSectionPlanNetArea:double`\n21. `independentSectionUsage:int`\n22. `integrationState:int`\n23. `maksIdentityNumber:int` *(Modelde `string | bigint | null`, XML'de `gen:intAttribute` — `V-213`)*\n24. `maksIntegrationState:int`\n25. `maksNumaratajIdentityNumber:int` *(Modelde `string | bigint | null`, XML'de `gen:intAttribute` — `V-213`)*\n26. `parcelNumber:string`\n27. `partCount:int`\n28. `partUsage:int`\n29. `planArea:double`\n30. `propertyLot:string`\n31. `registeredFloorDefinition:string`\n32. `registeredInstallation:string`\n33. `registeredQuality:string`\n34. `roofProjectionArea:double`\n35. `storeyNumber:string`\n36. `storeyUsage:int`\n37. `takbisNeighbourhoodReference:int`\n38. `takbisPropertyIdentityNumber:int`\n39. `tenderRegistrationNumber:string`\n40. `totalIndependentSectionCount:int`\n41. `volume:double`\n42. `windowUsage:int`\n\n### 2. Ortak Alan (`OA_`) ve İç Yapı (`BBKIY_` / `OAIY_`) İçin Ek 3 `gen:*Attribute`:\n43. `commonAreaUsage:int` (`OA_` içinde — değerleri `partUsage.xml` kod listesinden okunur)\n44. `storeyObjectReference:string` (`OA_` içinde)\n45. `roomInstallationUsage:int` (`BBKIY_` / `OAIY_` içinde)\n\n### 3. Kesinlikle Yazılmayanlar (`YASAK` — `V-060`, `K67`, `K68`, `K88-yeni`, `V-216`):\n- `measuredHeight`, `lod2Solid`, Texture/Appearance (`app:Appearance`), `verticalDatum`, `storeyHeight`, `calculatedVolume`, `grp:function`, **malik/kişi bilgileri (`Malik`)** ve listede olmayan hiçbir ad.\n\n---\n\n## A.4 Tapu / Beyan Verileri (`K88-yeni`), `Malik` Modeli ve `K83` İptali (`CLAUDE13 §1`)\n- **`K88-yeni`:** `independentSectionNumber`, `propertyLot`, `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition`, `maksIdentityNumber` ve **malikler (`Malik`)** kullanıcı verisidir. Kullanıcı bu verileri elle girebilir, tablodan/listeden yapıştırabilir ve her zaman serbestçe değiştirebilir (kilitli alan yoktur). İsteğe bağlı `otomatikOneri` ayarı (`kapalı` / `açık`, varsayılan: `kapalı`) yalnızca kullanıcı onayıyla yazar.\n- **`Malik` (Kat İrtifakı / Malik Listesi) Veri Modeli (`src/core/model/malik.ts`):**\n  - `interface Malik { bbAnahtari: string; adSoyadVeyaUnvan: string; tcKimlikVeyaVergiNo?: string; hissePay: bigint; hissePayda: bigint; not?: string; }`\n  - Bir bağımsız bölümde birden fazla hissedar (`Malik`) bulunabilir; bir BB içindeki malik hisseleri toplamı `BigInt` kesir aritmetiği ile hesaplanır ve `∑(hissePay / hissePayda) ≠ 1` ise **`V-208 BİLGİ`** üretilir (GML doğrulamasını engellemez).\n  - **GML Yasağı:** Malik bilgileri **yalnızca** proje dosyasında (`.tkgm3b` / `.tkgm3d`) ve kullanıcının kendi dışa aktardığı malik/kat irtifakı listesi raporlarında tutulur; **TKGM CityGML (`.gml`) dosyasına asla yazılmaz**.\n- **`K83` İptali:** `stripPersonalData.ts` modülü kullanıcı kararıyla iptal edilmiş ve `M0` kapsamından çıkarılmıştır.\n\n---\n\n## A.5 15 Resmi Referans Dosyası ve SHA-256 Kilidi (`CLAUDE13 §2.1`)\n- `fixtures/ornek6.gml` (`717200` B, SHA-256: `7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03`)\n- `resources/codelists/*.xml` altındaki 14 resmi XML kod listesi (`resources/DOSYA_LISTESI.txt` ile bayt-bayt kilitli). `commonAreaUsage.xml` adında ayrı bir dosya yoktur; `commonAreaUsage` özniteliği `partUsage.xml` dosyasından okunur.\n",
    "acikSorularMd": "# AÇIK SORULAR VE DOĞRULAMA BEKLEYEN MADDELER (`docs/ACIK_SORULAR.md`)\n\n> **Kural (`K97` / `Mutlak Kural 1`):** Örnek dosyada veya normatif şartnamede (`claude_uygulama_sartnamesi_v3.md`, `docs/KARARLAR.md`) karşılığı olmayan hiçbir XML etiketi, öznitelik veya sınıf adı uydurulmaz; doğrulama bekleyen noktalar buraya kaydedilir.\n\n## Kayıtlı Açık Sorular (`M0` / `KONTROL-M0` İtibarıyla)\n\n1. **`ACIK-01` — Teras Nesnesinin `gml:id` Öneki (`KONTROL-M0 F11`, `CLAUDE12 Ek-A §A.2` & `OY-12 #35a`):**\n   - **Doğrulanan Kısım (`KONTROL-M0 F11`):** `<bldg:class>Teras</bldg:class>` sınıf değeri `Ornek3-M-3446194-A.gml` dosyasında **9 kez** ölçülmüş ve **kesinleşmiştir** (açık soru değildir).\n   - **Açık Kalan Tek Nokta:** `Ornek3-M-3446194-A.gml` içindeki bu 9 adet `<bldg:class>Teras</bldg:class>` nesnesinin gerçek `gml:id` öneki (`TRS_` mi yoksa `BLKN_` mi olduğu) `M1` öncesinde Claude tarafından `Ornek3` içinden ölçülerek bildirilecektir.\n   - **Mevcut Uygulama:** Bu ölçüm paylaşılana kadar yeni üretimde varsayılan dış yapı sınıfı `Balkon` (`BLKN_`) olarak kullanılır; `TRS_` öneki teyit edilmeden üretimde kullanılmaz.\n"
  }
} as const;
