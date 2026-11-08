# M7 — Konumlandırma Sihirbazı ve İçe Aktarma (Helmert, Raster, DXF, Liste Beyan)

Bu belge, **M7 kilometre taşı** kapsamında geliştirilen saf TypeScript (`src/core/importers/`) konumlandırma ve içe aktarma motorlarını, 2B tasarım editörü entegrasyonunu (`src/editor2d/M7ImportWizardsModal.tsx`) ve doğrulama kurallarını özetler.

---

## 1. Kapsam ve Mimari (`src/core/importers/`)

M7 kapsamındaki tüm hesaplama ve ayrıştırma modülleri **tarayıcı/DOM/React bağımsız saf TypeScript** olarak `src/core/importers/` altında konumlandırılmıştır:

| Modül | Sorumluluk | İlgili Kurallar / Şartname |
|---|---|---|
| `src/core/importers/georefWizard.ts` | EPSG:5253…5259 / DOM önerisi (`λ → DOM`), 3B röleve tablosu (`ID, E, N, Z`) ayrıştırma, `TIC` (`Pt3[]`) üretimi, 2B Helmert en küçük kareler çözücüsü, `5 cm` (`50 mm`) kalıntı eşiği kontrolü ve `leave-one-out` sapan nokta (outlier) tespiti | `§7.3`, `K07`, `K08`, `K54`, `K69`, `K76`, `V-019`, `V-020` |
| `src/core/importers/rasterCalib.ts` | 2 noktalı yatay referans açısından döndürme açısı hesabı, ayrı X ve Y ölçek kalibrasyonu (en az 2 X + 2 Y bilinen uzunluk + 3. kontrol ölçüsü) ve çok noktalı (`>= 3`) en küçük kareler 2B afin dönüşümü | `§8.1`, `KARAR D-23.5` |
| `src/core/importers/dxfImporter.ts` | Saf TS DXF okuyucu (`$INSUNITS`, `BLOCKS`, `ENTITIES`: `LWPOLYLINE` bulge yay kırma `<= 5°` ve `<= 5 cm`, `POLYLINE`/`VERTEX`, `LINE` zincirleme `<= 1 mm`, `CIRCLE` → 12-gen `K63`, `ARC`, `INSERT` blok açma, `TEXT`/`MTEXT` oda etiketinden `Ek-A` `partUsage` çıkarımı), TUREF / yerel CAD otomatik tespiti, katman eşleme tablosu ve `K71` oda boşluğu açma | `§8.2`, `§11`, `KARAR D-23.5`, `K63`, `K71`, `K76` |
| `src/core/importers/listeBeyan.ts` | CSV / TSV / Akıllı Yapıştırma ayrıştırıcı, `KAT_TANIMI` (`registeredFloorDefinition`) koruma (`OY-04`), `NITELIK` ve `EKLENTI` Türkçe büyük harf normalizasyonu (`K61`), `ARSA_PAYI` (`V-198a/b`, `V-199`) ve `Malik` hisse (`V-208`) kontrolleri, kullanıcı önizleme onayı (`OY-06`) ve `.tkgm3b` malik saklama (`K99`) | `§8.4`, `CLAUDE13 §1 K88-yeni`, `OY-04`, `OY-06`, `K27`, `K61`, `K84`, `K99` |

---

## 2. Helmert Konumlandırma Sihirbazı ve Röleve / TIC (`§7.3`)

1. **Dilim Orta Meridyeni (DOM) ve EPSG Önerisi (`K07`):**
   - Boylamdan (`λ`) `DOM = 27 + 3 · round((λ − 27) / 3)` formülüyle `27°, 30°, 33°, 36°, 39°, 42°, 45°` dilimlerinden biri ve karşılık gelen `EPSG:5253…5259` kodu önerilir.
2. **Röleve Köşe Tablosu ve TIC (`K08`, `K54`, `K69`):**
   - Harita mühendisinden gelen `ID; Easting(Y); Northing(X); Z` satırları ayrıştırılır, TUREF TM koordinat aralıkları (`300 000 < E < 700 000`, `2 500 000 < N < 5 000 000`) doğrulanır, tam sayı metre yerel orijin (`originE, originN`) belirlenir ve tam sayı milimetre `TIC` (`building.tic`) noktalarına dönüştürülür.
3. **2B Helmert ve Leave-One-Out Sapan Nokta Tespiti (`K76`):**
   - En az 2 (önerilen `>= 3`) kontrol noktası çiftiyle 4 parametreli (`a, b, tx, ty`) 2B benzerlik dönüşümü çözülür.
   - Maksimum kalıntı hatası `50 mm` (`5 cm`) eşiğini aşarsa kullanıcı uyarılır; `>= 3` nokta varsa her nokta sırayla dışarıda bırakılarak (`leave-one-out`) RMSE'yi en çok düşüren sapan nokta (`outlierCandidate`) raporlanır.

---

## 3. Raster Kat Planı Kalibrasyonu (`§8.1`)

1. **Yatay Referans Hizalama:** İki piksel noktası seçilerek görüntünün yatay eksene göre eğiklik açısı (`computeTwoPointAlignmentAngle`) hesaplanır.
2. **Ayrı X ve Y Ölçek Kalibrasyonu:** Taranmış kağıt planlarda X ve Y yönündeki olası sünme/büzülmeyi yakalamak için en az 2 yatay (`X`) ve 2 dikey (`Y`) bilinen ölçü üzerinden `scaleXMmPerPx` ve `scaleYMmPerPx` ayrı ayrı hesaplanır; opsiyonel 3. kontrol ölçüsüyle çapraz doğrulama yapılır.
3. **Çok Noktalı (`>= 3`) 2B Afin Dönüşüm:** En küçük kareler yöntemiyle 6 parametreli 2B afin matrisi çözülür ve kalibre edilen görüntü 2B kanvas altında yarı saydam altlık olarak gösterilir.

---

## 4. DXF İçe Aktarma ve Katman Eşleme (`§8.2`, `§11`)

1. **Birim ve Koordinat Tespiti:** `$INSUNITS` (`4=mm`, `5=cm`, `6=m`) otomatik okunur. Koordinatlar TUREF TM aralığındaysa doğrudan yerel orijine göre milimetreye çevrilir; yerel CAD koordinatlarındaysa (`0..100 m`) Helmert matrisiyle TUREF tasarım koordinatlarına dönüştürülür.
2. **Geometri Dönüşümleri:**
   - `LWPOLYLINE` bulge yayları maksimum `5°` açı adımı ve `5 cm` yay sehimi kısıtıyla doğru parçalarına kırıklanır (`K63`).
   - `CIRCLE` nesneleri 12-gen kapalı poligona dönüştürülür (`K63`).
   - `LINE` yığınları `<= 1 mm` uç birleştirme toleransıyla kapalı poligon halkalarına (`chainLinesToRingsMm`) zincirlenir.
   - `INSERT` blok referansları ölçek ve döndürme açısıyla açılır.
   - `TEXT` / `MTEXT` oda etiketleri poligon içinde nokta (`pointInRingMm`) testiyle eşleştirilerek `Ek-A` `partUsage` (`SALON -> 3`, `MUTFAK -> 7`, `BANYO -> 8` vb.) otomatik önerilir.
3. **K71 İkiz Yüzey Önleme:** İçe aktarılan oda (`Part`) poligonları, kapsayan `SectionPart` poligonundan otomatik olarak delik (`hole`) şeklinde düşülür.

---

## 5. Liste Beyan ve Malik Listesi (`§8.4`, `K88-yeni`, `OY-04`, `OY-06`, `K99`)

1. **Akıllı Yapıştırma ve CSV/TSV:** Noktalı virgül (`;`), virgül (`,`) veya sekme (`\t`) ayraçlı veriler otomatik algılanır.
2. **Metin Koruma ve Normalizasyon:** `KAT_TANIMI` (`registeredFloorDefinition`) kullanıcının girdiği şekliyle birebir korunur (`OY-04`); `NITELIK` ve `EKLENTI` Türkçe büyük harfe (`i → İ`, `ı → I`) dönüştürülür (`K61`).
3. **Önizleme Onayı ve Düzenlenebilirlik:** Doğrulama özet tablosu (`V-198a/b`, `V-199`, `V-208`, `V-212`) kullanıcıya gösterilir; yalnızca **Onayla ve Projeye Aktar** (`OY-06`) adımıyla projeye işlenir ve tüm alanlar proje içinde serbestçe düzenlenebilir kalır (`K88-yeni`).
4. **Malik Gizliliği (`K99`):** `Malik[]` listesi yalnızca `.tkgm3b` proje dosyasında saklanır; üretilen CityGML (`.gml`) çıktısına **asla** yazılmaz.
