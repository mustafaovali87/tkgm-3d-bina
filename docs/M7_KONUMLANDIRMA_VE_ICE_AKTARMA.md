# M7 — Konumlandırma Sihirbazı ve İçe Aktarma (Helmert, Raster, DXF, Liste Beyan)

Bu belge, **M7 kilometre taşı** kapsamında geliştirilen saf TypeScript (`src/core/importers/`) konumlandırma ve içe aktarma motorlarını, 2B tasarım editörü entegrasyonunu (`src/editor2d/M7ImportWizardsModal.tsx`), `KONTROL-M7.md` (`R1–R9`) düzeltmelerini ve doğrulama kurallarını özetler.

---

## 1. Kapsam ve Mimari (`src/core/importers/`)

M7 kapsamındaki tüm hesaplama ve ayrıştırma modülleri **tarayıcı/DOM/React bağımsız saf TypeScript** olarak `src/core/importers/` altında konumlandırılmıştır:

| Modül | Sorumluluk | İlgili Kurallar / Şartname |
|---|---|---|
| `src/core/importers/georefWizard.ts` | EPSG:5253…5259 / DOM önerisi (`λ → DOM`), 3B röleve tablosu (`ID, E, N, Z`) ayrıştırma, `TIC` (`Pt3[]`) üretimi, 2B Helmert en küçük kareler çözücüsü, `5 cm` (`50 mm`) kalıntı eşiği kontrolü, `leave-one-out` sapan nokta (outlier) tespiti ve mevcut geometrinin TUREF kökenini koruma (`R1`) | `§7.3`, `K07`, `K08`, `K54`, `K69`, `K76`, `V-019`, `V-020`, `R1` |
| `src/core/importers/rasterCalib.ts` | 2 noktalı yatay referans açısından döndürme açısı hesabı, ayrı X ve Y ölçek kalibrasyonu (en az 2 X + 2 Y bilinen uzunluk + 3. kontrol ölçüsü) ve çok noktalı (`>= 3`) en küçük kareler 2B afin dönüşümü | `§8.1`, `KARAR D-23.5` |
| `src/core/importers/dxfImporter.ts` | Saf TS DXF okuyucu (`$INSUNITS`, `BLOCKS`, `ENTITIES`: `LWPOLYLINE` bulge yay kırma `<= 5°` ve `<= 5 cm`, `POLYLINE`/`VERTEX`, `LINE` zincirleme `<= 1 mm`, `CIRCLE` → 12-gen `K63`, `ARC`, `INSERT` blok açma, `TEXT`/`MTEXT` oda etiketinden `Ek-A` `partUsage` çıkarımı `R6`), TUREF / yerel CAD otomatik tespiti, ardışık kat aktarımında köken koruma (`R2`), açık BB seçimi (`R3`), kotsuz TIC uyarısı (`R4`), en yakın BB'ye balkon bağlama (`R5`), `K46` pencere denizliği (`R8`) ve `K71` oda içi oda boşluğu açma (`R7`) | `§8.2`, `§11`, `KARAR D-23.5`, `K46`, `K63`, `K71`, `K76`, `R2–R8` |
| `src/core/importers/listeBeyan.ts` | CSV / TSV / Akıllı Yapıştırma ayrıştırıcı, `KAT_TANIMI` (`registeredFloorDefinition`) koruma (`OY-04`), `NITELIK` ve `EKLENTI` Türkçe büyük harf normalizasyonu (`K61`), `ARSA_PAYI` (`V-198a/b`, `V-199`) ve `Malik` hisse (`V-208`) kontrolleri, kullanıcı önizleme onayı (`OY-06`) ve `.tkgm3b` malik saklama (`K99`) | `§8.4`, `CLAUDE13 §1 K88-yeni`, `OY-04`, `OY-06`, `K27`, `K61`, `K84`, `K99` |

---

## 2. Helmert Konumlandırma Sihirbazı ve Röleve / TIC (`§7.3`, `R1`)

1. **Dilim Orta Meridyeni (DOM) ve EPSG Önerisi (`K07`):**
   - Boylamdan (`λ`) `DOM = 27 + 3 · round((λ − 27) / 3)` formülüyle `27°, 30°, 33°, 36°, 39°, 42°, 45°` dilimlerinden biri ve karşılık gelen `EPSG:5253…5259` kodu önerilir.
2. **Röleve Köşe Tablosu ve TIC (`K08`, `K54`, `K69`):**
   - Harita mühendisinden gelen `ID; Easting(Y); Northing(X); Z` satırları ayrıştırılır, TUREF TM koordinat aralıkları (`300 000 < E < 700 000`, `2 500 000 < N < 5 000 000`) doğrulanır, tam sayı metre yerel orijin (`originE, originN`) belirlenir ve tam sayı milimetre `TIC` (`building.tic`) noktalarına dönüştürülür.
3. **2B Helmert ve Leave-One-Out Sapan Nokta Tespiti (`K76`):**
   - En az 2 (önerilen `>= 3`) kontrol noktası çiftiyle 4 parametreli (`a, b, tE, tN`) 2B benzerlik dönüşümü çözülür.
   - Maksimum kalıntı hatası `50 mm` (`5 cm`) eşiğini aşarsa kullanıcı uyarılır; `>= 3` nokta varsa her nokta sırayla dışarıda bırakılarak (`leave-one-out`) RMSE'yi en çok düşüren sapan nokta (`suspectPointId`) raporlanır.
4. **Mevcut Geometrinin TUREF Konumunu Koruma (`R1`):**
   - `applyHelmertWizardToProject` çağrısında `transformExistingGeometry = false` iken projede zaten çizilmiş geometri varsa mevcut `originE, originN` korunur ve `ticPointsMm` bu kökene göre hizalanır; böylece mevcut poligonların TUREF koordinatları (`originE + x/1000, originN + y/1000`) `±1 mm` içinde değişmez.

---

## 3. Raster Kat Planı Kalibrasyonu (`§8.1`)

1. **Yatay Referans Hizalama:** İki piksel noktası seçilerek görüntünün yatay eksene göre eğiklik açısı (`computeTwoPointAlignmentAngle`) hesaplanır.
2. **Ayrı X ve Y Ölçek Kalibrasyonu:** Taranmış kağıt planlarda X ve Y yönündeki olası sünme/büzülmeyi yakalamak için en az 2 yatay (`X`) ve 2 dikey (`Y`) bilinen ölçü üzerinden `scaleXMmPerPx` ve `scaleYMmPerPx` ayrı ayrı hesaplanır; opsiyonel 3. kontrol ölçüsüyle çapraz doğrulama yapılır.
3. **Çok Noktalı (`>= 3`) 2B Afin Dönüşüm:** En küçük kareler yöntemiyle 6 parametreli 2B afin matrisi çözülür ve kalibre edilen görüntü 2B kanvas altında yarı saydam altlık olarak gösterilir.

---

## 4. DXF İçe Aktarma ve Katman Eşleme (`§8.2`, `§11`, `R2–R8`)

1. **Birim ve Koordinat Tespiti:** `$INSUNITS` (`4=mm`, `5=cm`, `6=m`) otomatik okunur. Koordinatlar TUREF TM aralığındaysa doğrudan yerel orijine göre milimetreye çevrilir; yerel CAD koordinatlarındaysa (`0..100 m`) Helmert matrisiyle TUREF tasarım koordinatlarına dönüştürülür. Varlık içermeyen (`0` varlık) DXF dosyalarında `"Koordinat sistemi belirlenemedi (varlık yok)"` gösterilir (`R9`).
2. **Geometri Dönüşümleri ve Öznitelik Çıkarımı:**
   - `LWPOLYLINE` bulge yayları maksimum `5°` açı adımı ve `5 cm` yay sehimi kısıtıyla doğru parçalarına kırıklanır (`K63`).
   - `CIRCLE` nesneleri 12-gen kapalı poligona dönüştürülür (`K63`).
   - `LINE` yığınları `<= 1 mm` uç birleştirme toleransıyla kapalı poligon halkalarına (`chainLinesToRingsMm`) zincirlenir.
   - `INSERT` blok referansları ölçek ve döndürme açısıyla açılır.
   - `TEXT` / `MTEXT` oda etiketleri poligon içinde nokta (`pointInPoly`) testiyle eşleştirilerek `Ek-A` `partUsage` (`SALON -> 1003`, `MUTFAK -> 1004`, `BANYO -> 1002`, `SPOR SALONU -> 1020`, `MERDİVEN HOLÜ -> 1024` vb.) otomatik önerilir (`R6`).
   - Pencere katmanlarında açıkça denizlik verilmemişse varsayılan denizlik yüksekliği hedef katın `height` ve `slabThickness` değerlerinden `K46` kuralına göre (`(height - slabThickness) - 500 - 1300`, örn. `Ornek6` için `900 mm`) hesaplanır (`R8`).
   - Balkon poligonları ilk `SectionPart`'a değil, ortak kenar (`attachedEdges`) paylaşan veya kenarlarına en yakın olan `SectionPart`'a bağlanır (`R5`).
   - Numarasız ve eşleşmeyen `BB` katmanları rastgele bir bağımsız bölüme atanmaz; `M7-DXF-SEC-GUESS` (`U`) uyarısı üretilir (`R3`).
   - `±0.00` ortometrik kotu girilmemiş ve DXF içinde `Z=0` olan `TIC` katmanlarına sahte kot atanmaz; `M7-DXF-Z0` (`U`) uyarısı üretilir (`R4`).
3. **K71 İkiz Yüzey Önleme (`R7`):** Aynı katta bir `Part` (`BBK`) poligonunun tamamen içinde kalan iç `Part` (`BBK`) poligonu, dıştaki `Part` (`BBK`) poligonuna otomatik olarak delik (`holes`) şeklinde açılır (`SectionPart` dış sınırı delinmez; bağımsız bölüm brüt alanı ve küvet üretimi korunur).
4. **Proje Kökeni (`Georef`) Koruma (`R2`):** Projede zaten çizilmiş veya içe aktarılmış geometri varken ikinci bir DXF katmanı/katı içe aktarıldığında mevcut `originE, originN` korunur ve yeni gelen koordinatlar mevcut kökene göre otomatik ötelenir; böylece önceki katların TUREF koordinatları (`±1 mm`) kaymaz.

---

## 5. Liste Beyan ve Malik Listesi (`§8.4`, `K88-yeni`, `OY-04`, `OY-06`, `K99`)

1. **Akıllı Yapıştırma ve CSV/TSV:** Noktalı virgül (`;`), virgül (`,`) veya sekme (`\t`) ayraçlı veriler otomatik algılanır.
2. **Metin Koruma ve Normalizasyon:** `KAT_TANIMI` (`registeredFloorDefinition`) kullanıcının girdiği şekliyle birebir korunur (`OY-04`); `NITELIK` ve `EKLENTI` Türkçe büyük harfe (`i → İ`, `ı → I`) dönüştürülür (`K61`).
3. **Önizleme Onayı ve Düzenlenebilirlik:** Doğrulama özet tablosu (`V-198a/b`, `V-199`, `V-208`, `V-212`) kullanıcıya gösterilir; yalnızca **Onayla ve Projeye Aktar** (`OY-06`) adımıyla projeye işlenir ve tüm alanlar proje içinde serbestçe düzenlenebilir kalır (`K88-yeni`).
4. **Malik Gizliliği (`K99`):** `Malik[]` listesi yalnızca `.tkgm3b` proje dosyasında saklanır; üretilen CityGML (`.gml`) çıktısına **asla** yazılmaz.

---

## 6. M7 Kabul Kriterleri ve Doğrulama Tablosu (`KONTROL-M7` R1–R9 Dahil)

| Kriter / Bulgu | Açıklama | Durum |
|---|---|---|
| **M7-1: Helmert & TIC Sihirbazı (`§7.3`)** | Boylamdan DOM/EPSG önerisi (`K07`), 3B röleve tablosu (`K54`), 2B Helmert en küçük kareler ve `leave-one-out` sapan nokta analizi | **GEÇTİ** |
| **M7-2: Raster Plan Kalibrasyonu (`§8.1`, `D-23.5`)** | 2 noktalı yatay hizalama, 2X+2Y eksen ölçek kalibrasyonu + 3. kontrol ölçüsü, `>= 3` noktalı 2B afin dönüşüm | **GEÇTİ** |
| **M7-3: DXF Okuyucu ve Katman Eşleme (`§8.2`)** | `$INSUNITS`, `LWPOLYLINE` bulge (`<= 5°`, `<= 5 cm`), `LINE` zincirleme (`<= 1 mm`), `CIRCLE` 12-gen (`K63`), `INSERT`, `TEXT` mahal etiketi | **GEÇTİ** |
| **M7-4: §11 Altın Kabul Testi (`Ornek6`)** | Döndürülmüş yerel CAD DXF → Helmert + katman eşleme → B-Rep → CityGML (`0 HATA, 0 UYARI, [1,2,2,16,0,4,44,38,1]`) | **GEÇTİ** |
| **M7-5: Liste Beyan ve Malik (`§8.4`, `K88-yeni`, `K99`)** | CSV/TSV Smart Paste, `OY-04` `KAT_TANIMI` koruma, `K61` Türkçe büyük harf, `OY-06` önizleme onayı, `K99` GML sızıntı yasağı | **GEÇTİ** |
| **R1 (`georefWizard.ts`)** | `transformExistingGeometry = false` iken mevcut geometrinin TUREF konumu (`±1 mm`) korunur ve `TIC` aynı kökene hizalanır | **GEÇTİ** |
| **R2 (`dxfImporter.ts` & Modal)** | Projede geometri varken ardışık kat DXF aktarımında `originE, originN` değişmez; önceki katlar kaymaz | **GEÇTİ** |
| **R3 (`dxfImporter.ts` & Modal)** | Eşleşmeyen `BB` katmanı modulo ile rastgele BB'ye atanmaz; `M7-DXF-SEC-GUESS` (`U`) uyarısı üretilir | **GEÇTİ** |
| **R4 (`dxfImporter.ts` & Modal)** | Sabit `1095.9 m` / `1_000_000 mm` varsayılanları kaldırıldı; kotsuz `Z=0` TIC için `M7-DXF-Z0` (`U`) uyarısı üretilir | **GEÇTİ** |
| **R5 (`dxfImporter.ts`)** | Balkon `sectionPartId` ataması ortak kenar (`attachedEdges`) veya en yakın `SectionPart` mesafesiyle yapılır | **GEÇTİ** |
| **R6 (`dxfImporter.ts`)** | `inferPartUsageFromRoomLabel`: `"SPOR SALONU" -> 1020`, `"MERDİVEN HOLÜ" -> 1024` öncelik sırası düzeltildi | **GEÇTİ** |
| **R7 (`docs/M7_...md`)** | `K71` oda içi oda deliği açıklaması, `Ek-A` `1003/1004/1002` kodları ve konsol çıktıları eklendi | **GEÇTİ** |
| **R8 (`dxfImporter.ts`)** | Pencere varsayılan denizliği `K46` (`(height - slabThickness) - 500 - 1300` → `Ornek6` için `900 mm`) ile hesaplanır | **GEÇTİ** |
| **R9 (`M7ImportWizardsModal.tsx`)** | Varlık içermeyen (`0` varlık) DXF için `"Koordinat sistemi belirlenemedi (varlık yok)"` gösterilir | **GEÇTİ** |

### Gerçek Komut Çıktıları

```text
$ npm run typecheck
> tkgm-3d-bina@0.1.0 typecheck
> tsc --noEmit && tsc -p tsconfig.core.json --noEmit

$ npm test
 Test Files  7 passed (7)
      Tests  146 passed (146)
```
