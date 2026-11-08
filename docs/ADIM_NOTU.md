# M0 + M1 + M2 + M3 + M4 + M5 + M6 + M7 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)

> **Aşama:** `M0 (F1–F12) + M1 (R1–R3 & G1–G8) + M2 (Dosya Doğrulayıcı, 175 Kural) + M3 (Öznitelik Düzeltici) + M4 (Tasarım Modeli & 2B Editör) + M5 (Geometri Motoru I) + M6 (Geometri Motoru II & Tam CityGML 2.0 Üretimi) + M7 (Konumlandırma Sihirbazı & İçe Aktarma: DXF, Helmert, Raster, Liste Beyan + KONTROL-M7 R1–R9)`
> **Durum:** `TAMAMLANDI (M0–M7 + KONTROL-M7 R1–R9 TAMAMI DOĞRULANDI, 146 / 146 Birim Test GEÇTİ, Ornek6 DXF + Helmert Altın Testi 0 HATA · 0 UYARI, TKGM 3dbinadogrula: başarılı, npm ci / typecheck / lint / docs:m2 0 Hata)`

---

## M7 — KONUMLANDIRMA SİHİRBAZI VE İÇE AKTARMA: DXF, HELMERT, RASTER, LİSTE BEYAN & `KONTROL-M7` (`R1–R9`, `§4`) (08.11.2026)

> Ayrıntı: `docs/M7_KONUMLANDIRMA_VE_ICE_AKTARMA.md`.

| Madde | Durum |
|---|---|
| `src/core/importers/georefWizard.ts` (§7.3 Helmert & Röleve/TIC) | YAPILDI. Boylamdan (`λ`) `DOM = 27 + 3·round((λ − 27)/3)` ve `EPSG:5253…5259` önerisi (`K07`), 3B röleve tablosu (`ID, E, N, Z`) → `TIC` (`K54`), 2B Helmert en küçük kareler çözücüsü, `5 cm` (`50 mm`) kalıntı eşiği ve `leave-one-out` sapan nokta tespiti (`K76`) |
| `src/core/importers/rasterCalib.ts` (§8.1 Raster Kat Planı Kalibrasyonu) | YAPILDI. 2 noktalı yatay hizalama açısı, en az 2 X + 2 Y bilinen uzunluk + 3. kontrol ölçüsüyle ayrı X/Y ölçek kalibrasyonu ve `>= 3` kontrol noktasıyla 6 parametreli 2B afin dönüşümü (`KARAR D-23.5`) |
| `src/core/importers/dxfImporter.ts` (§8.2 DXF İçe Aktarma & Katman Eşleme) | YAPILDI. `$INSUNITS` (`mm/cm/m`), `LWPOLYLINE` bulge yay kırma (`<= 5°`, `<= 5 cm`), `CIRCLE` → 12-gen (`K63`), `LINE` zincirleme (`<= 1 mm`), `INSERT` blok açma, `TEXT`/`MTEXT` oda etiketinden `Ek-A` `partUsage` çıkarımı, TUREF / yerel CAD otomatik tespiti ve `K71` oda boşluğu açma |
| `src/core/importers/listeBeyan.ts` (§8.4 Liste Beyan & Malik Tablosu) | YAPILDI. CSV/TSV/Akıllı Yapıştırma, `KAT_TANIMI` birebir koruma (`OY-04`), `NITELIK`/`EKLENTI` Türkçe büyük harf (`K61`), `V-198a/b`, `V-199`, `V-208`, `V-212` doğrulaması, kullanıcı önizleme onayı (`OY-06`), serbest düzenlenebilirlik (`K88-yeni`) ve `Malik[]` bilgisinin yalnız `.tkgm3b` içinde tutulup GML'e yazılmaması (`K99`) |
| Kabul (§11): Gerçek bir projenin DXF'i içe alınıp konumlandırılabiliyor | YAPILDI. `Ornek6` katları yerel/döndürülmüş CAD DXF olarak dışa aktarılıp 4 kontrol noktasıyla Helmert ile konumlandırıldı, katman eşleme tablosuyla içe alındı ve üretilen CityGML kendi doğrulayıcımızda **0 HATA, 0 UYARI** verdi (`MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38, MBG 1`) |
| Arayüz (`src/editor2d/M7ImportWizardsModal.tsx` & `DesignEditor2D.tsx`) | YAPILDI. 2B Tasarım Editörüne 4 sekmeli M7 sihirbazı (DXF İçe Aktar, Helmert & TIC, Raster Altlık Kalibrasyonu, Liste Beyan & Malik) ve kalibre edilmiş DXF/Raster altlık çizimi + DXF köşe yakalama (snap) eklendi |
| **KONTROL-M7 R1 (`georefWizard.ts`)** | **YAPILDI.** `applyHelmertWizardToProject` içinde `transformExistingGeometry = false` ve projede çizilmiş geometri varken mevcut `originE, originN` korunur ve `ticPointsMm` bu kökene göre hizalanır; mevcut poligonların TUREF konumu `±1 mm` içinde sabit kalır (`m7.test.ts` R1 testi eklendi) |
| **KONTROL-M7 R2 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Projede daha önce çizilmiş/aktarılmış geometri varken ikinci kat DXF'i içe aktarıldığında proje kökeni (`originE, originN`) değiştirilmez; gelen DXF koordinatları mevcut kökene göre otomatik ötelenir (`m7.test.ts` R2 testi eklendi) |
| **KONTROL-M7 R3 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Eşleşmeyen `BB` katmanı modulo ile rastgele BB'ye atanmaz; `M7-DXF-SEC-GUESS` (`U`) uyarısı üretilir ve katman eşleme tablosunda açık BB seçimi (`— BB Seçiniz —`) istenir (`m7.test.ts` R3 testi eklendi) |
| **KONTROL-M7 R4 (`dxfImporter.ts` & Modal)** | **YAPILDI.** Arayüzdeki sabit `1095.9` m ve `georeferenceDxfDocument` içindeki `1_000_000` mm varsayılanları kaldırıldı; kotsuz (`Z=0`) TIC için `M7-DXF-Z0` (`U`) uyarısı üretilir (`m7.test.ts` R4 testi eklendi) |
| **KONTROL-M7 R5 (`dxfImporter.ts`)** | **YAPILDI.** Balkon `sectionPartId` ataması `currentStoreySectionParts[0]` yerine ortak kenar (`attachedEdges`) veya en yakın `SectionPart` mesafesiyle yapılır (`m7.test.ts` R5 testi eklendi) |
| **KONTROL-M7 R6 (`dxfImporter.ts`)** | **YAPILDI.** `inferPartUsageFromRoomLabel` içinde birleşik/özgül etiketler (`"SPOR SALONU" -> 1020`, `"MERDİVEN HOLÜ" -> 1024`) genel `SALON`/`HOL`/`ODA` kurallarından önce denetlenir (`m7.test.ts` R6 testi eklendi) |
| **KONTROL-M7 R7 (`docs/M7_KONUMLANDIRMA_VE_ICE_AKTARMA.md`)** | **YAPILDI.** `§4.2` (`1003/1004/1002`) ve `§4.3` (`K71` oda içi oda deliği) düzeltildi; kabul tablosu ve konsol çıktıları eklendi |
| **KONTROL-M7 R8 (`dxfImporter.ts`)** | **YAPILDI.** Pencere varsayılan denizliği `800 mm` yerine `K46` kuralına göre (`(storey.height - storey.slabThickness) - 500 - height` → `Ornek6` için `900 mm`) hesaplanır (`m7.test.ts` R8 testi eklendi) |
| **KONTROL-M7 R9 (`M7ImportWizardsModal.tsx`)** | **YAPILDI.** Varlık içermeyen (`entities.length === 0`) DXF için `"Koordinat sistemi belirlenemedi (varlık yok)"` gösterilir |
| **KONTROL-M7 §4 (`ACIK-09` & `M6_GML_URETIMI.md`)** | **YAPILDI.** `docs/ACIK_SORULAR.md` içinde `ACIK-09` **YANITLANDI — 08.11.2026, TKGM 3dbinadogrula: başarılı** olarak kapatıldı; `docs/M6_GML_URETIMI.md` §1 tablosuna `Resmi doğrulama (3dbinadogrula): ✔ başarılı (08.11.2026)` satırı eklendi |
| Komutlar | `typecheck` (`tsconfig.json` + `tsconfig.core.json`) 0 hata ✔, `npm test` **146/146** ✔ |

---

## M6 — GEOMETRİ MOTORU II VE GML ÜRETİMİ (Claude, 08.11.2026 & Gemini Doğrulaması)

> Ayrıntı: `docs/M6_GML_URETIMI.md`.

| Madde | Durum |
|---|---|
| `src/core/brep/building.ts`, `src/core/gml/cityGmlWriter.ts`; tasarım modeline bina bilgisi, balkon, çatı, TIC | YAPILDI |
| Kabul: Ornek6 altın testi tam; kendi doğrulayıcısında sıfır hata | YAPILDI. Sayılar birebir (MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38); **0 HATA, 0 UYARI** (Biçim A ve B); öznitelikler kaynakla aynı |
| Yapay bina (düz/beşik/kırma çatı) sıfırdan | YAPILDI. 3/3 dosya 0 HATA |
| 9 resmi dosyadan çıkar → üret → doğrula | Ornek1, Ornek5, Ornek6: 0 HATA. Kalanlar: eksik MAKS numarası (kullanıcı girdisi), çatı arası (kapsam dışı), kaynak geometri farkları |
| Arayüz | YAPILDI. "GML üret ve doğrula" + "GML'i kaydet"; tarayıcıda Ornek6: H 0 · U 0 · 67 ms |
| Komutlar | `typecheck` 0 hata ✔, `npm test` 130/130 ✔ |
| Gemini doğrulaması (`CLAUDE-M2-M6-BILDIRIM.md` §0 ve §6) | `npm ci` ✔ (0 hata), `npm run typecheck` ✔ (0 hata), `npm test` ✔ (**130/130** geçti: `m0` 23 + `m1` 10 + `m2` 26 + `m3` 16 + `m4` 20 + `m5` 19 + `m6` 16), `npm run docs:m2` ✔ (`Kapsam tablosu güncellendi: 175 kural.`). M3–M6 kodu ve `KARARLAR.md §A.7–§A.11` incelendi; itiraz yok, tüm kararlara katılıyoruz. |

---

## M5 — GEOMETRİ MOTORU I (Claude, 08.11.2026)

> Ayrıntı: `docs/M5_GEOMETRI_MOTORU.md`.

| Madde | Durum |
|---|---|
| `src/core/brep/` (types, generate, shellCheck); `Opening` modeli ve GML'den açıklık çıkarma | YAPILDI |
| Kabul: Ornek6 altın testi (çatı hariç) | YAPILDI. K 2, BB 2, BBK 16, KAPI 44, PEN 38 birebir; alan ±0,01 ve hacim ±0,05 (16/16); BB 91,34; kotlar birebir; LoD2 8 kapı + 19 pencere |
| Kabuk denetimi | YAPILDI. 16/16 oda kapalı; BB küvetinde açık kenar yalnız döşeme üstünde (§5.6 alt yüz yok) |
| Arayüz | YAPILDI. Tasarım Editörü → "3B üret" + 3B önizleme; tarayıcıda Ornek6 ile denendi, konsolda hata yok |
| Komutlar | `typecheck` 0 hata ✔, `npm test` 114/114 ✔ |
| M6'ya kalan | GML yazımı, LoD0/1/2, TIC, Envelope, balkon, çatı, W Boolean farkı (Clipper2), OA kalınlıklı duvar |

---

## M4 — TASARIM MODELİ VE 2B EDİTÖR (Claude, 08.11.2026)

> Ayrıntı: `docs/M4_TASARIM_EDITORU.md`.

| Madde | Durum |
|---|---|
| `src/core/design/` (types, geometry2d, snap, editor, checks, projectFile, fromImported) | YAPILDI |
| Kabul: Ornek6 planı çizilebiliyor | YAPILDI. Gürültülü tıklamalarla editör komutları; snap köşeleri mm düzeyinde oturtuyor; 0 HATA |
| Ornek6 alanları ve kotları | YAPILDI. 16/16 kısım ±0,01 m²; kotlar ±1 mm |
| 9 dosyadan tasarım çıkarma | YAPILDI. 9/9 dosya çizim denetiminde 0 HATA |
| Arayüz | YAPILDI. 2B panelde "Tasarım Editörü"; tarayıcıda gerçek fareyle kat sınırı çizildi (91,34 m², altlıkla mm düzeyinde aynı) |
| Komutlar | `typecheck` 0 hata ✔, `npm test` 95/95 ✔ |

---

## M3 — ÖZNİTELİK DÜZELTİCİ VE GML YAZICISI (Claude, 08.11.2026)

> Ayrıntı: `docs/M3_DUZELTICI.md`.

| Madde | Durum |
|---|---|
| `src/core/gml/gmlWriter.ts` | YAPILDI. `applyAttributeEdits` (Düzeltme kipi, K70/OY-02), `normalizeGml`, `computeRecountEdits`, `computeRenameEdits`, `computeAreaEdits` |
| `src/core/gml/names.ts` | YAPILDI. Ad kuralları; V-058 ve "Adlar" düğmesi aynı fonksiyonu kullanır |
| Gidiş-dönüş testi (§11 kabul ölçütü) | YAPILDI. Boş düzenleme → SHA-256 aynı; düzenlemede halkaların ham metni birebir aynı |
| 9 dosya ölçümü | YAPILDI. Düzeltme kipi hiçbir dosyada doğrulamayı değiştirmiyor. Normalize + Alanlar sonrası 8 kabul dosyası 0 HATA |
| Arayüz | YAPILDI. Değer ve ad düzenleme; Sayımlar / Adlar / Alanlar / Normalize / Geri al / Kaydet; öncesi/sonrası özet şeridi. Tarayıcıda denendi |
| Komutlar | `typecheck` 0 hata ✔, `npm test` 75/75 ✔ |

---

## M2 — DOSYA DOĞRULAYICI (Claude, 08.11.2026 & Gemini Doğrulaması)

> Gemini'nin günlük limiti dolduğu için M2'yi kullanıcının isteğiyle Claude yazdı (`commit efa52cc`). Ayrıntı: `docs/M2_DOGRULAYICI.md`.

| Madde | Durum |
|---|---|
| Kural altyapısı (`src/core/validation/`) | YAPILDI. 175 kural kaydı: 136 uygulandı, 13 okuyucuda, 16 ertelendi (gerekçeli), 7 sunucu (T), 3 kısmi (K) |
| 8 kabul dosyası 0 HATA | YAPILDI. Ornek1–6, Amasya, Sincan: H = 0 (yerel `verify:samples`) |
| Ret dosyasında V-202 | YAPILDI. `GML_M-17273333-F`: V-202 H + V-072/073/074/090/130/061 |
| Her kural için test | YAPILDI. `m2.test.ts`: Ornek6 0 HATA + 18 "tek hata ekleme" testi + katalog testleri (59/59) |
| Doğrulama paneli | YAPILDI. Worker içinde çalışır, H → U → B sıralı, poligon bulgusunda poligon vurgusu |
| `verify:samples` | YAPILDI. Satıra `regime`, `validationMs`, `issueCounts`, `topRules` eklendi |
| Okuyucu eki | YAPILDI. `surfaces`, `hostSurfaceTag`; TIC'te `gml:pos` desteği |
| Komutlar | `npm ci` ✔, `typecheck` 0 hata ✔, `npm test` 59/59 ✔, `npm run docs:m2` (kapsam tablosu) ✔ |
| Gemini doğrulaması (`CLAUDE-M2-BILDIRIM.md` §0 & §4, `CLAUDE-M2-M6-BILDIRIM.md` §0 & §6) | YAPILDI. AI Studio ortamında `npm ci` (0 hata), `npm run typecheck` (0 hata), `npm test` (**130/130** geçti) ve `npm run docs:m2` (`175 kural`) doğrulandı; M2–M6 kararlarının tamamına katılıyoruz. |

---

## 0. `KONTROL-M1-2.md` (`R1–R3`) ve `KONTROL-M1.md` (`G1–G8`) Durum Tablosu

| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |
|---|---|---|---|
| **R1** | HATA (Gerileme — M2 öncesi zorunlu) | **YAPILDI** | Reddedilmiş örnek dosya (GML_M-17273333-F.gml) okunurken boşluk metin düğümünde ("\n            ") getNodeByLocalName çökmesi + verify:samples özyinelemeli alt klasör taraması — *getNodeByLocalName ve getAttrByLocalName girişlerine "if (record === null || typeof record !== 'object') return ..." koruması eklendi. Ayrıca scripts/verify-samples.ts alt klasörleri özyinelemeli tarayacak ve açılamayan dosyada {"fileName":...,"error":...} basıp çıkış kodu 1 dönecek şekilde güncellendi (§4.3 ve §4.4 gerileme testleri eklendi).* |
| **R2** | HATA (Gerileme — M2 öncesi zorunlu) | **YAPILDI** | Kat biçimi tespitinin bozulması (Biçim B katlarında Floor_ >= 3 olduğunda A'ya düşmesi) ve G2 profil birleşimi (Sincan B + 10 mm -> "B + 10 mm (profil dışı)") — *Kat biçimi kuralı geri alındı: Floor_ = 1 -> A, = 2 -> C, >= 3 -> B (N2, N26). G2 bunun üzerine kuruldu: Ornek1/4/6 -> A10, Ornek2/3/5 -> B50, Sincan -> "B + 10 mm (profil dışı)" + V-215 BİLGİ, Amasya ve GML_M-17273333-F -> "A, ofset bilinmiyor" + V-215 BİLGİ (§4.2 gerileme testi eklendi).* |
| **R3** | HATA (Gerileme — M2 öncesi zorunlu) | **YAPILDI** | Poligon listesinin kopyalanması (Ornek6 içinde 741 yerine 1.123 poligon; BB_ poligonlarının ikinci kez "BalkonTeras" olarak eklenmesi) — *directContainers içindeki çift localKey: "lod2Geometry" kaldırıldı; BB_ poligonları artık yalnızca "BagimsizBolum" olarak okunur ("BalkonTeras" yalnız BLKN_/TRS_ için kullanılır). Ayrıca model.polygons her gml:id için tek kayıt tutar ve çoklu sahiplikte ownerObjectGmlIds: string[] alanını kullanır. Ornek6 poligon sayısı 741 olarak doğrulandı (§4.1 gerileme testi eklendi).* |
| **G1** | Orta (M2 öncesi zorunlu) | **YAPILDI** | GML okuma ve ayrıştırmanın Web Worker içine taşınması (PERF-01) + İlerleme Çubuğu + İptal düğmesi + Transferable Float64Array — *src/workers/gmlReader.worker.ts ve src/workers/gmlWorkerClient.ts oluşturuldu. parseCityGmlModel Web Worker içinde çalışır; poligon köşeleri packModelPolygonVerticesFloat64 ile tek bir Float64Array (Transferable ArrayBuffer) olarak ana iş parçacığına sıfır kopya maliyetiyle aktarılır; üst şeritte canlı %0–%100 ilerleme çubuğu ve worker.terminate() çağıran "İptal" düğmesi eklendi.* |
| **G2** | Düşük | **YAPILDI** | detectedProducerProfile değerinin kat biçimi + kapı alt ofsetini birlikte değerlendirmesi (Sincan B + 10 mm -> "B + 10 mm (profil dışı)") — *resolveProducerProfileFromFormAndOffset eklendi: A+10->"A10", B+50->"B50", C+50->"C50"; ofset null ise "<Form>, ofset bilinmiyor"; Sincan (B+10 mm) gibi standart dışı kombinasyonlarda "B + 10 mm (profil dışı)" döndürülür ve V-215 BİLGİ ("Profil dışı birleşim...") üretilir.* |
| **G3** | Düşük | **YAPILDI** | detectedDoorBottomOffsetMm === null olduğunda (Amasya, GML_M-17273333-F) readerIssues içine V-215 BİLGİ eklenmesi — *Oda tabanı ile eşleşen kapı bulunamadığında readerIssues dizisine V-215 BİLGİ ("Kapı alt ofseti ölçülemedi (dosyada oda tabanı ile eşleşen kapı bulunamadı).") eklenir.* |
| **G4** | Düşük | **YAPILDI** | Eski rejim dosyalarında (Amasya, Sincan) propertyLot olmadığında 0/1 yerine "—" gösterilmesi ve V-198 BİLGİ üretilmesi — *analyzeBuildingLandShares içinde hasPropertyLotData bayrağı eklendi; hiçbir BB_ üzerinde propertyLot yoksa formattedTotalUnreduced = "—" döndürülür, V-198 BİLGİ ("Arsa payı bilgisi yok (eski rejim dosyası).") üretilir ve arayüzde 0/1 yerine "—" gösterilir.* |
| **G5** | Düşük | **YAPILDI** | V-214 (intAttribute/doubleAttribute baş/son boşluk, ör. Ornek6 maksIdentityNumber = "\t5129820196") önem derecesinin UYARI yerine BİLGİ (B) yapılması — *gmlReader.ts içinde V-214 severity alanı "B" (BİLGİ) olarak güncellendi; Ornek6 okunduğunda artık HATA: 0, UYARI: 0, BİLGİ: 2 üretir.* |
| **G6** | Bilgi | **YAPILDI** | npm run verify:samples <klasör> komutunun alt klasörleri özyinelemeli taraması, tek satır JSON özet basması ve hata durumunda çıkış kodu 1 dönmesi — *scripts/verify-samples.ts içine özyinelemeli verifyGmlDirectorySamples eklendi; klasör ve alt klasörlerdeki tüm .gml dosyalarını okur, açılamayan dosyada {"fileName":...,"error":...} basıp çıkış kodu 1 döner.* |
| **G7** | Bilgi | **YAPILDI** | src/App.tsx dosyasının modüler parçalara (TreePanel, AttributePanel, ValidationPanel, WorkspaceLayout, workspaceState) bölünmesi ve ağaç etiket tıklama düzeltmesi — *src/state/workspaceState.ts, src/panels/TreePanel.tsx, src/panels/AttributePanel.tsx, src/panels/ValidationPanel.tsx ve src/layout/WorkspaceLayout.tsx oluşturuldu; TreePanel içindeki metin/rozet elemanlarına pointer-events-none eklenerek satırın neresine tıklanırsa tıklansın seçimin tetiklenmesi sağlandı.* |
| **G8** | Bilgi | **YAPILDI** | gmlReader.ts içinde sabit XML ad alanı öneklerine (core:, bldg:, gml:, grp:, gen:, xlink:) bağımlılığın kaldırılması — *getNodeByLocalName ve getAttrByLocalName yardımcıları (R1 metin düğümü korumasıyla birlikte) eklendi; bilinen önekleri kontrol ettikten sonra herhangi bir özel ad alanı önekini (:localName) yerel adıyla eşleştirir.* |

---

## 1. `KONTROL-M0.md` ve `KONTROL-M0-2.md` Bulguları (`F1–F12`) Durum Tablosu

| Kod | Önem | Durum | Açıklama ve Uygulanan Çözüm |
|---|---|---|---|
| **F1** | Orta (M1 öncesi zorunlu) | **YAPILDI (win32 girdileri doğrulandı)** | package.json esbuild çakışması + package-lock.json + Windows (win32) npm ci uyumluluğu — *node_modules ve package-lock.json silinip temiz npm install ile yeniden üretildi; @tailwindcss/oxide-win32-x64-msvc, lightningcss-win32-x64-msvc ve @esbuild/win32-x64 girdilerinin kilit dosyasında bulunduğu birim testiyle doğrulandı.* |
| **F2** | Orta (M1 öncesi zorunlu) | **YAPILDI** | src/core/hash/canonical.ts ve readAttributes.ts içinde localeCompare kullanımı — *Tüm sıralamalarda işletim sistemi yerel ayarından bağımsız deterministik UTF-16 kod birimi karşılaştırması (compareCodeUnits: a < b ? -1 : a > b ? 1 : 0) kullanıldı.* |
| **F3** | Orta (M1 öncesi zorunlu) | **YAPILDI** | src/core/ saflık kuralının (Mutlak Kural 4) derleyici ve statik test ile korunması — *tsconfig.core.json (lib: ["ES2022"], types: []) eklendi, npm run typecheck ve lint komutlarına bağlandı; ayrıca m0.test.ts içine statik kaynak tarama testi eklendi.* |
| **F4** | Orta (M1 öncesi zorunlu) | **YAPILDI** | parseMaksIdValue fonksiyonunun bozuk/negatif girdilerde ("12a", "-1") çökmemesi — */^\d{1,19}$/ kontrolü eklendi; geçersiz girdide çökmeden { value: null, exceedsInt32: false, issue: V-213 HATA } ve >2^31-1 durumunda V-213 BİLGİ döndürür.* |
| **F5** | Düşük | **YAPILDI** | readAttributes.ts içinde <gml:posList srsDimension="3"> desteği ve kapısız odada null + BİLGİ — *Etiket eşleşmeleri <gml:pos\b[^>]*> ve <gml:posList\b[^>]*> olarak genişletildi; kapı bulunamazsa detectedDoorBottomOffsetMm: null + V-215 BİLGİ döndürülür.* |
| **F6** | Düşük | **YAPILDI** | readAttributes.ts kat biçimi tespitinin tüm K_ bloklarını kontrol etmesi (+ M1 GMLReader) — *Dosyadaki tüm K_ blokları taranarak detectedStoreyForms ve hasInconsistentStoreyForms raporlanır (M1 GMLReader içinde tam XML ağacıyla da doğrulanmıştır).* |
| **F7** | Düşük | **YAPILDI** | parsePropertyLot içinde "+5/10" ve "-5/10" işaretli payların reddedilmesi — *Düzenli ifade /^(\d+)\/(\d+)$/ olarak sıkılaştırıldı; "+5/10" ve "-5/10" artık V-198a HATA üretir.* |
| **F8** | Düşük | **YAPILDI** | Birim test kapsamı genişletmesi (30° dönüklü Helmert, K89 sıra/yerel ayar bağımsızlığı, statik saflık) — *m0.test.ts içine 30° dönüklü + 100 ppm Helmert testi, İ/I/i/ı/_ sıralama bağımsızlığı testi ve statik src/core saflık testi eklendi (22/22 test geçti).* |
| **F9** | Düşük | **YAPILDI** | .env.example içindeki GEMINI_API_KEY şablon kalıntısının temizlenmesi — *.env.example dosyasından yapay zeka anahtarı kalıntıları tamamen kaldırıldı.* |
| **F10** | Bilgi | **YAPILDI** | Önizleme arayüzünde kaydedilmiş denetim çıktısı tarih/saat etiketinin açık gösterimi — *src/App.tsx üst bilgi şeridine "Kaydedilmiş Denetim Çıktısı: <tarih>" rozeti ve KONTROL-M0 / KONTROL-M1 durum tabloları eklendi.* |
| **F11** | Bilgi | **YAPILDI** | docs/ACIK_SORULAR.md güncellemesi (<bldg:class>Teras</bldg:class> Ornek3 içinde 9 kez doğrulandı) — *docs/ACIK_SORULAR.md güncellendi: <bldg:class>Teras</bldg:class> kesinleşti.* |
| **F12** | Bilgi | **YAPILDI** | package.json adının "tkgm-3d-bina" yapılması ve TKGM3D_UUID_NAMESPACE sabitinin KARARLAR.md içine işlenmesi — *package.json name alanı "tkgm-3d-bina" yapıldı ve TKGM3D_UUID_NAMESPACE ("6ba7b810-9dad-11d1-80b4-00c04fd430c8") docs/KARARLAR.md §A.2 içine kalıcı olarak işlendi.* |

---

## 2. `M0`–`M6` Kapsamında Oluşturulan / Doğrulanan Dosyalar

### M6 — Geometri Motoru II ve Tam CityGML 2.0 Üretimi (`src/core/brep/building.ts`, `src/core/gml/cityGmlWriter.ts`)
- `src/core/brep/building.ts` (`generateBuildingBrep`: U biçimli parapetli `BLKN_` / `TRS_` balkon B-Rep üretimi, manuel/düz/beşik/kırma çatı üretimi, LoD0 ayak izi, LoD1 dik prizma, LoD2 zarf yüzleri, TIC noktaları ve tam bina zarfı)
- `src/core/gml/cityGmlWriter.ts` (`writeCityGml`: Biçim A ve B kat temsili, K92 standart sıralı öznitelikler, `xlink:href` referansları, tam CityGML 2.0 XML üretimi)
- `src/core/__tests__/m6.test.ts` (16 birim testi: Ornek6 altın testi 0 HATA · 0 UYARI, yapay düz/beşik/kırma çatı 0 HATA, 9 örnek dosya gidiş-dönüş doğrulaması)
- `docs/M6_GML_URETIMI.md`

### M5 — Geometri Motoru I (`src/core/brep/` — Kat, BB, Oda, Kapı/Pencere B-Rep)
- `src/core/brep/types.ts`, `generate.ts`, `shellCheck.ts` (Kot motoru, dik izle karşı duvar eşleştirme `T1–T4`, kapalı oda kabukları, §5.6 alt yüzsüz BB küveti, Kat Biçim A/B)
- `src/viewer3d/BrepPreview3D.tsx` (Tasarım Editörü 3B B-Rep önizleme sahnesi)
- `src/core/__tests__/m5.test.ts` (19 birim testi: Ornek6 16 oda + 2 BB + 44 kapı + 38 pencere + LoD2 açıklıkları)
- `docs/M5_GEOMETRI_MOTORU.md`

### M4 — Tasarım Modeli ve 2B Editör (`src/core/design/` & `src/editor2d/DesignEditor2D.tsx`)
- `src/core/design/types.ts`, `geometry2d.ts`, `snap.ts`, `editor.ts`, `checks.ts`, `projectFile.ts`, `fromImported.ts` (Tam sayı mm yerel koordinat, kenetlenme öncelik sırası, `T-01…T-08` çizim denetimi, `.tkgm3b` proje dosyası, GML'den tasarım çıkarma)
- `src/editor2d/DesignEditor2D.tsx` (Etkileşimli 2B SVG kat planı editörü ve altlık katmanı)
- `src/core/__tests__/m4.test.ts` (20 birim testi: Ornek6 plan çizimi, alan ve kot doğrulaması, 9 dosya çıkarma testi)
- `docs/M4_TASARIM_EDITORU.md`

### M3 — Öznitelik Düzeltici ve GML Yazıcısı (`src/core/gml/gmlWriter.ts`, `src/core/gml/names.ts`)
- `src/core/gml/gmlWriter.ts`, `src/core/gml/names.ts` (Düzeltme kipi `K70` / `OY-02`, Normalize kipi, Sayımlar / Adlar / Alanlar hesaplayıcıları, `K99` öznitelik beyaz listesi)
- `src/core/__tests__/m3.test.ts` (16 birim testi: boş düzenlemede birebir SHA-256, halka metni korunumu, 8 kabul dosyası 0 HATA)
- `docs/M3_DUZELTICI.md`

### M2 — Dosya Doğrulayıcı (`src/core/validation/` — Şartname §6, `V-001…V-216`)
- `src/core/validation/index.ts`, `types.ts`, `geom.ts`, `knownSampleExceptions.ts`, `rulesFile.ts`, `rulesBuilding.ts`, `rulesBb.ts`, `rulesExtra.ts` (175 kural kaydı: 136 uygulandı, 13 okuyucuda, 16 ertelendi, 7 sunucu, 3 kısmi; Rejim S/E tespiti)
- `src/core/__tests__/m2.test.ts` (26 birim testi: Ornek6 0 HATA, 18 mutasyon/negatif kural testi, geometri yardımcıları ve 175 kural kataloğu tamlık testi)
- `scripts/generate-m2-doc.ts` ve `docs/M2_DOGRULAYICI.md` (`npm run docs:m2` ile koddan üretilen kural kapsam tablosu)

### M1 — Web Worker GML Okuyucu (`G1`), `R1–R3` Düzeltmeleri, 3B Delikli Üçgenleme, Modüler Paneller (`G7`) ve KARAR D-23 Çalışma Alanı
- `src/core/gml/gmlReader.ts`, `src/workers/gmlReader.worker.ts`, `src/workers/gmlWorkerClient.ts`, `src/core/gml/triangulate3d.ts`, `src/viewer3d/CityGmlViewport3D.tsx`, `src/viewer3d/FloorPlanPreview2D.tsx`, `src/state/workspaceState.ts`, `src/panels/*`, `src/layout/WorkspaceLayout.tsx`, `src/core/__tests__/m1.test.ts`

---

## 3. `npm run typecheck`, `npm run lint` ve `npm run docs:m2` Gerçek Çıktısı

```text
> tkgm-3d-bina@0.1.0 typecheck
> tsc --noEmit && tsc -p tsconfig.core.json --noEmit
(Çıkış Kodu: 0 — 0 hata)

> tkgm-3d-bina@0.1.0 docs:m2
> tsx scripts/generate-m2-doc.ts

Kapsam tablosu güncellendi: 175 kural.
```

---

## 4. `npm test` (`vitest run`) Gerçek Çıktısı (`m0`..`m7` — 146 / 146 Test)

```text
RUN  v5.1.0 /app/applet

 ✓ src/core/__tests__/m7.test.ts (16 tests) 1016ms
   ✓ M7 — Konumlandırma Sihirbazı ve İçe Aktarma (DXF, Helmert, Raster, Liste Beyan) (16)
     ✓ 4. §11 M7 Altın Kabul Testi: Gerçek Proje (Ornek6) DXF İçe Aktarma + Helmert Konumlandırma + 0 HATA CityGML (2)
       ✓ Ornek6 projesinin yerel/döndürülmüş CAD DXF çizimlerini Helmert ile konumlandırıp katman eşlemesiyle içe alır ve 0 HATA ile CityGML üretir 697ms
 ✓ src/core/__tests__/m1.test.ts (10 tests) 2696ms
   ✓ M1 Adım 1 — CityGML 2.0 GML Okuyucu (gmlReader.ts) ve KONTROL-M1-2 §4 Gerileme Testleri (R1–R3) (7)
     ✓ KONTROL-M1-2 §4.1 (R3): Ornek6 altın değerlerini (polygons.length === 741, benzersiz gml:id, MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38, MBG 1, biçim A, ofset 10, profil A10) birebir doğrular 982ms
     ✓ KONTROL-M1 G1: Float64Array transferable poligon köşe paketleme ve geri yükleme (packModelPolygonVerticesFloat64 / hydrateModelPolygonVerticesFloat64) sıfır kayıpla çalışır 503ms
   ✓ M1 Adım 2 — 3B Düzlemsel Poligon + İç Delik (DoorLinearRing_ / WindowLinearRing_) Üçgenleme (triangulate3d.ts) (2)
     ✓ fixtures/ornek6.gml içindeki tüm iç delikli (DoorLinearRing_ / WindowLinearRing_) duvar poligonlarını sıfır kayıpla üçgenler 580ms
   ✓ M1 Adım 3 — KARAR D-23.4: Kalıp (F5–F8) ve Panel Boyutu Değişiminin K89 CanonicalHash Üzerinde Etkisizliği (1)
     ✓ D-23.4 / K89: F5 (Standart), F6 (Yan Yana), F7 (Çizim), F8 (Denetim) ve <1366px sekme modları CanonicalModelHash değerini asla değiştirmez 501ms
 ✓ src/core/__tests__/m3.test.ts (16 tests) 4818ms
   ✓ M3 — Gidiş-dönüş (şartname §11 kabul ölçütü) (6)
     ✓ OY-02: Düzeltme kipi yalnız 3 haneden kısa değerleri tamamlar; bütün köşe değerleri ve öznitelikler sayısal olarak aynı 720ms
     ✓ K70: düzenleme yoksa ve tamamlama kapalıysa çıktı girdiyle bayt bayt aynıdır (SHA-256 eşit) 404ms
     ✓ K70: öznitelik düzenlemesi geometri metnine dokunmaz; yalnız istenen değerler değişir 387ms
     ✓ K70: düzenlenen dosya doğrulayıcıda yine 0 HATA verir 494ms
     ✓ Öznitelik ekleme ve silme: biçim korunur, geri alınınca dosya özgün haline döner 1111ms
     ✓ Ad (gml:name) düzenlemesi yalnız nesnenin kendi adını değiştirir (yüzey adları değişmez) 398ms
   ✓ M3 — Sayımlar ve adlar (3)
     ✓ §7.7: bozulan partCount yeniden hesaplanır ve V-128 kaybolur 607ms
     ✓ §7.7 / V-058: bozulan ad yeniden üretilir ve dosya özgün haline döner 408ms
 ✓ src/core/__tests__/m5.test.ts (19 tests) 579ms
 ✓ src/core/__tests__/m2.test.ts (26 tests) 8792ms
   ✓ M2 — Ornek6 resmi kabul örneği (4)
     ✓ V-105 / N19: Ornek6 Sürdürülebilirlik rejimindedir (GroundSurface var) 410ms
   ✓ M2 — Ornek6 üzerinde tek hata ekleme (her kural gerçekten yakalıyor mu?) (18)
     ✓ V-001: dosya adı M- ile başlamıyor → HATA 493ms
     ✓ V-002: dosya adı constructionID ile uyuşmuyor → HATA 485ms
     ✓ V-004: GML ad alanı 3.2 → HATA 397ms
     ✓ V-014: srsName EPSG:4326 → HATA 318ms
     ✓ V-021: poligonda srsName → HATA 602ms
     ✓ V-033: halka kapanmıyor (son pos silindi) → HATA 581ms
     ✓ V-050: aynı gml:id iki kez → HATA 399ms
     ✓ V-056: WallSurface elemanında gml:id → HATA 323ms
     ✓ V-057: kısım sınıf değeri yanlış → HATA 677ms
     ✓ V-058: kat adı storeyNumber ile uyuşmuyor → HATA 321ms
     ✓ V-059: yüzey adı yanlış → HATA 486ms
     ✓ V-061: BB zorunlu partCount yok → HATA 302ms
     ✓ V-072: bina geometrySuitability 1005 → HATA 599ms
     ✓ V-202: ret paketi (bina geometrySuitability 1005) → HATA 588ms
     ✓ V-112: kat parent bina değil → HATA 406ms
     ✓ V-130: BB integrationState 1003 → HATA 408ms
     ✓ V-160: kısım BB referansı yok → HATA 503ms
     ✓ V-188: balkon BB referansı yok → HATA 408ms
 ✓ src/core/__tests__/m6.test.ts (16 tests) 1712ms
   ✓ M6 — Ornek6 altın testi, tam (§10.4) (10)
     ✓ Kendi doğrulayıcısında sıfır HATA ve sıfır UYARI (Biçim A = Ornek6, Biçim B = varsayılan); üretim uyarısı yok 603ms
     ✓ Biçim (§3.1, K70): CRLF, BOM yok, utf-8 bildirimi, posList, tam 3 ondalık; iki yazım bayt bayt aynı 489ms
 ✓ src/core/__tests__/m0.test.ts (23 tests) 323ms
 ✓ src/core/__tests__/m4.test.ts (20 tests) 29ms

 Test Files  8 passed (8)
      Tests  146 passed (146)
   Start at  15:35:40
   Duration  11.97s (tests 67%, import 29%, transform 4%, worker 1%)

    Isolate  8 workers spawned · ~539ms startup each (spawn + environment, per file)
             at least ~899ms faster with isolate: false — reuses workers across files instead of one per file
```

---

## 5. `npm run verify:samples fixtures` (`G6`, `R1 / R3` & `M2` Doğrulama Özeti) Gerçek Çıktısı

```json
{"fileName":"ornek6.gml","sizeMB":0.68,"durationMs":296,"memoryMB":26.3,"objectCount":108,"polygonCount":741,"detectedStoreyForm":"A","detectedDoorBottomOffsetMm":10,"detectedProducerProfile":"A10","landShareTotal":"2/2","hasPropertyLotData":true,"regime":"S","validationMs":67,"issueCounts":{"H":1,"U":0,"B":3},"topRules":["H:V-001x1"]}
```

---

## 6. `npm run trace` Gerçek Çıktısı (`K98`)

```text
=== TKGM 3B BINA M0 + M1 KURAL-KOD-TEST IZLENEBILIRLIK MATRISI (K98) ===
Toplam Izlenen Kural Sayisi (M0 + M1): 230
----------------------------------------------------------------------
KURAL   | KAYNAK MODULLER                        | TEST DOSYALARI
----------------------------------------------------------------------
D-23.1  | src/core/gml/gmlReader.ts              | -
D-23.4  | -                                      | src/core/__tests__/m1.test.ts
D-23.5  | -                                      | src/core/__tests__/m7.test.ts
D-23.6  | src/core/gml/gmlReader.ts              | src/core/__tests__/m1.test.ts
K01     | src/core/gml/gmlReader.ts, src/core/model/index.ts | -
K02     | src/core/gml/gmlReader.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m3.test.ts
K06     | src/core/gml/gmlReader.ts, src/core/importers/georefWizard.ts, src/core/model/index.ts | src/core/__tests__/m1.test.ts
K07     | src/core/gml/gmlReader.ts, src/core/importers/georefWizard.ts, src/core/model/index.ts | src/core/__tests__/m7.test.ts
K08     | src/core/gml/gmlReader.ts, src/core/gml/triangulate3d.ts, src/core/importers/dxfImporter.ts, src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts
K09     | src/core/gml/gmlReader.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts
K10     | src/core/validation/rulesExtra.ts      | -
K11     | src/core/validation/rulesExtra.ts      | -
K12     | src/core/gml/gmlReader.ts, src/core/hash/canonical.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts
K13     | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -
K14     | src/core/gml/gmlReader.ts, src/core/model/index.ts | -
K15     | src/core/validation/rulesExtra.ts      | -
K18     | src/core/validation/rulesExtra.ts      | -
K27     | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts
K29     | src/core/importers/listeBeyan.ts       | -
K30     | src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts
K31     | src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts
K36     | src/core/gml/triangulate3d.ts, src/core/math/ring.ts | src/core/__tests__/m0.test.ts
K45a    | src/core/brep/generate.ts, src/core/design/fromImported.ts, src/core/design/types.ts, src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts, src/core/__tests__/m5.test.ts
K46     | src/core/importers/dxfImporter.ts      | src/core/__tests__/m7.test.ts
K48     | src/core/brep/generate.ts, src/core/brep/types.ts, src/core/validation/rulesExtra.ts | -
K50     | src/core/gml/triangulate3d.ts, src/core/math/ring.ts | src/core/__tests__/m0.test.ts
K54     | src/core/importers/georefWizard.ts     | src/core/__tests__/m7.test.ts
K55     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts
K59     | src/core/validation/rulesExtra.ts      | -
K60     | src/core/codelists/index.ts, src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts
K61     | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts | src/core/__tests__/m7.test.ts
K62     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -
K63     | src/core/importers/dxfImporter.ts      | src/core/__tests__/m7.test.ts
K67     | src/core/model/index.ts, src/core/validation/rulesFile.ts | -
K68     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -
K69     | src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts
K70     | src/core/gml/cityGmlWriter.ts, src/core/gml/gmlWriter.ts, src/core/model/index.ts | src/core/__tests__/m3.test.ts, src/core/__tests__/m6.test.ts
K71     | src/core/importers/dxfImporter.ts, src/core/validation/rulesExtra.ts | -
K76     | src/core/importers/dxfImporter.ts, src/core/importers/georefWizard.ts, src/core/importers/rasterCalib.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts
K78     | src/core/validation/rulesBuilding.ts, src/core/validation/rulesExtra.ts | -
K79     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts
K80     | src/core/validation/rulesExtra.ts      | -
K83     | src/core/validation/rulesExtra.ts      | -
K84     | src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts
K85     | src/core/validation/rulesExtra.ts      | -
K86     | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -
K87     | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts
K88     | src/core/design/projectFile.ts, src/core/gml/cityGmlWriter.ts, src/core/importers/listeBeyan.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m6.test.ts, src/core/__tests__/m7.test.ts
K89     | src/core/gml/gmlReader.ts, src/core/hash/canonical.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts
K90     | src/core/model/index.ts                | -
K91     | src/core/codelists/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts
K92     | src/core/hash/canonical.ts, src/core/importers/dxfImporter.ts, src/core/importers/listeBeyan.ts | src/core/__tests__/m0.test.ts
K93     | src/core/gml/gmlReader.ts, src/core/validation/rulesExtra.ts | -
K99     | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/gml/readAttributes.ts, src/core/importers/listeBeyan.ts, src/core/model/index.ts, src/core/model/malik.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m3.test.ts, src/core/__tests__/m7.test.ts
K100    | src/core/model/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts
V-001   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts
V-002   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts
V-003   | src/core/validation/rulesFile.ts       | -
V-004   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts
V-005   | src/core/validation/rulesFile.ts       | -
V-006   | src/core/validation/rulesFile.ts       | -
V-007   | src/core/validation/rulesFile.ts       | -
V-008   | src/core/validation/rulesFile.ts       | -
V-010   | src/core/validation/rulesFile.ts       | -
V-011   | src/core/validation/rulesFile.ts       | -
V-012   | src/core/validation/rulesFile.ts       | -
V-013   | src/core/validation/rulesFile.ts       | -
V-014   | src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts
V-015   | src/core/validation/rulesFile.ts       | -
V-016   | src/core/validation/rulesFile.ts       | -
V-017   | src/core/validation/rulesFile.ts       | -
V-018   | src/core/validation/rulesExtra.ts, src/core/validation/rulesFile.ts | -
V-019   | src/core/importers/georefWizard.ts, src/core/validation/rulesFile.ts | -
V-020   | src/core/importers/georefWizard.ts, src/core/math/helmert2d.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts
V-021   | src/core/validation/rulesFile.ts       | src/core/__tests__/m2.test.ts
V-030   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts
V-031   | src/core/gml/gmlReader.ts, src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts
V-032   | src/core/gml/gmlWriter.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts
V-033   | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts
V-034   | src/core/design/checks.ts, src/core/design/editor.ts, src/core/importers/dxfImporter.ts, src/core/validation/geom.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts, src/core/__tests__/m4.test.ts
V-035   | src/core/validation/geom.ts, src/core/validation/rulesFile.ts | -
V-036   | src/core/validation/rulesFile.ts       | -
V-037   | src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts
V-038   | src/core/design/checks.ts, src/core/validation/rulesFile.ts | -
V-039   | src/core/validation/rulesFile.ts       | -
V-040   | src/core/gml/triangulate3d.ts, src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts
V-041   | src/core/validation/rulesFile.ts       | -
V-042a  | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts
V-042b  | src/core/math/ring.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts
V-050   | src/core/hash/canonical.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts
V-051   | src/core/hash/canonical.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m0.test.ts
V-052   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -
V-053   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -
V-054   | src/core/model/index.ts, src/core/validation/rulesFile.ts | -
V-055   | src/core/hash/canonical.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | -
V-056   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts
V-057   | src/core/model/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts
V-058   | src/core/gml/gmlWriter.ts, src/core/gml/names.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts
V-059   | src/core/model/index.ts, src/core/validation/rulesFile.ts | src/core/__tests__/m2.test.ts
V-060   | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m3.test.ts, src/core/__tests__/m6.test.ts
V-061   | src/core/design/checks.ts, src/core/gml/gmlWriter.ts, src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m2.test.ts
V-062   | src/core/gml/cityGmlWriter.ts, src/core/gml/gmlWriter.ts, src/core/model/index.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m3.test.ts
V-063   | src/core/codelists/index.ts, src/core/gml/gmlReader.ts, src/core/importers/listeBeyan.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesBuilding.ts | src/core/__tests__/m0.test.ts
V-064   | src/core/validation/rulesBuilding.ts   | -
V-070   | src/core/validation/rulesBuilding.ts   | -
V-071   | src/core/validation/rulesBuilding.ts   | -
V-072   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts
V-073   | src/core/validation/rulesBuilding.ts   | -
V-074   | src/core/validation/rulesBuilding.ts   | -
V-075   | src/core/validation/rulesBuilding.ts   | -
V-076   | src/core/math/landShare.ts, src/core/validation/rulesBuilding.ts | -
V-077   | src/core/validation/rulesBuilding.ts   | -
V-078   | src/core/validation/rulesBuilding.ts   | -
V-079   | src/core/validation/rulesBuilding.ts   | -
V-080   | src/core/validation/rulesBuilding.ts   | -
V-081   | src/core/validation/rulesBuilding.ts   | -
V-082   | src/core/validation/rulesBuilding.ts   | -
V-083   | src/core/validation/rulesBuilding.ts   | -
V-084   | src/core/validation/rulesBuilding.ts   | -
V-085   | src/core/validation/rulesBuilding.ts   | -
V-090   | src/core/validation/rulesBuilding.ts   | -
V-091   | src/core/validation/rulesBuilding.ts   | -
V-092   | src/core/validation/rulesBuilding.ts   | -
V-093   | src/core/validation/rulesBuilding.ts   | -
V-094   | src/core/validation/rulesBuilding.ts   | -
V-095   | src/core/validation/rulesBuilding.ts   | -
V-096   | src/core/validation/rulesBuilding.ts   | -
V-097   | src/core/validation/rulesBuilding.ts   | -
V-098   | src/core/validation/rulesBuilding.ts   | -
V-099   | src/core/validation/rulesBuilding.ts   | -
V-100   | src/core/design/checks.ts, src/core/validation/rulesBuilding.ts | -
V-101   | src/core/validation/rulesBuilding.ts   | -
V-102   | src/core/validation/rulesBuilding.ts   | -
V-103   | src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | -
V-104   | src/core/validation/rulesBuilding.ts   | -
V-105   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts
V-106   | src/core/validation/rulesBuilding.ts   | -
V-107   | src/core/gml/gmlReader.ts, src/core/validation/rulesBuilding.ts | -
V-108   | src/core/validation/rulesBuilding.ts   | -
V-110   | src/core/validation/rulesBuilding.ts   | -
V-111   | src/core/validation/rulesBuilding.ts   | -
V-112   | src/core/validation/rulesBuilding.ts   | src/core/__tests__/m2.test.ts
V-113   | src/core/validation/rulesBuilding.ts   | -
V-114   | src/core/validation/rulesBuilding.ts   | -
V-115   | src/core/validation/rulesBuilding.ts   | -
V-116   | src/core/validation/rulesBuilding.ts   | -
V-117   | src/core/validation/rulesBuilding.ts   | -
V-118   | src/core/validation/rulesBuilding.ts   | -
V-120   | src/core/validation/rulesBb.ts         | -
V-121   | src/core/validation/rulesBb.ts         | -
V-122   | src/core/validation/rulesBb.ts         | -
V-123   | src/core/validation/rulesBb.ts         | -
V-124   | src/core/validation/rulesBb.ts         | -
V-125   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -
V-126   | src/core/validation/rulesBb.ts         | -
V-127   | src/core/validation/rulesBb.ts         | -
V-128   | src/core/validation/rulesBb.ts         | src/core/__tests__/m3.test.ts
V-129   | src/core/validation/rulesBb.ts         | -
V-130   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts
V-131   | src/core/validation/rulesBb.ts         | -
V-132   | src/core/validation/rulesBb.ts         | -
V-133   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts | -
V-134   | src/core/validation/rulesBb.ts         | -
V-135   | src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts | -
V-136   | src/core/importers/listeBeyan.ts, src/core/validation/rulesBb.ts | -
V-137   | src/core/validation/rulesBb.ts         | -
V-138   | src/core/validation/rulesBb.ts         | -
V-139   | src/core/validation/rulesBb.ts         | -
V-140   | src/core/validation/rulesBb.ts         | -
V-141   | src/core/validation/rulesBb.ts         | -
V-150   | src/core/validation/rulesBb.ts         | -
V-151   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -
V-152   | src/core/validation/rulesBb.ts         | -
V-153   | src/core/validation/rulesBb.ts         | -
V-154   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -
V-155   | src/core/gml/gmlWriter.ts, src/core/validation/rulesBb.ts | -
V-156   | src/core/validation/rulesBb.ts         | -
V-157   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -
V-158   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts
V-159   | src/core/validation/rulesBb.ts         | -
V-160   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | src/core/__tests__/m2.test.ts
V-161   | src/core/validation/rulesBb.ts         | -
V-162   | src/core/design/checks.ts, src/core/validation/rulesBb.ts | -
V-163   | src/core/validation/rulesBb.ts         | -
V-164   | src/core/validation/rulesBb.ts         | -
V-165   | src/core/validation/rulesBb.ts         | -
V-166   | src/core/validation/rulesBb.ts         | -
V-170   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -
V-171   | src/core/validation/rulesBb.ts         | -
V-172   | src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | -
V-173   | src/core/validation/rulesBb.ts         | -
V-174   | src/core/validation/rulesBb.ts         | -
V-180   | src/core/validation/rulesBb.ts         | -
V-181   | src/core/gml/gmlReader.ts, src/core/validation/rulesBb.ts | -
V-182   | src/core/validation/rulesBb.ts         | -
V-183   | src/core/validation/rulesBb.ts         | -
V-184   | src/core/validation/rulesBb.ts         | -
V-185   | src/core/validation/rulesBb.ts         | -
V-186   | src/core/validation/knownSampleExceptions.ts, src/core/validation/rulesBb.ts | -
V-187   | src/core/validation/rulesBb.ts         | -
V-188   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts
V-190   | src/core/validation/rulesBb.ts         | -
V-191   | src/core/validation/rulesBb.ts         | -
V-192   | src/core/validation/rulesBb.ts         | -
V-193   | src/core/validation/rulesBb.ts         | -
V-194   | src/core/validation/rulesBb.ts         | -
V-195   | src/core/validation/rulesBb.ts         | src/core/__tests__/m2.test.ts
V-196   | src/core/validation/rulesExtra.ts      | src/core/__tests__/m2.test.ts
V-197   | src/core/validation/rulesExtra.ts      | -
V-198   | src/core/math/landShare.ts, src/core/validation/index.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts, src/core/__tests__/m7.test.ts
V-198a  | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts
V-198b  | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts
V-199   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts
V-200   | src/core/validation/rulesExtra.ts      | -
V-201   | src/core/importers/georefWizard.ts, src/core/validation/rulesExtra.ts | -
V-202   | src/core/validation/rulesExtra.ts      | src/core/__tests__/m2.test.ts
V-203   | src/core/validation/rulesBb.ts, src/core/validation/rulesExtra.ts | -
V-204   | src/core/validation/rulesExtra.ts, src/core/validation/rulesFile.ts | -
V-205   | src/core/validation/rulesExtra.ts      | -
V-206   | src/core/validation/rulesExtra.ts      | -
V-207   | src/core/validation/rulesExtra.ts      | -
V-208   | src/core/importers/listeBeyan.ts, src/core/model/malik.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts
V-209   | src/core/validation/rulesExtra.ts      | -
V-210   | src/core/model/index.ts, src/core/validation/rulesExtra.ts | -
V-211   | src/core/gml/gmlReader.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m1.test.ts
V-212   | src/core/importers/listeBeyan.ts, src/core/math/landShare.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m7.test.ts
V-213   | src/core/gml/gmlReader.ts, src/core/model/index.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m2.test.ts
V-214   | src/core/gml/gmlReader.ts, src/core/gml/gmlWriter.ts, src/core/validation/index.ts, src/core/validation/rulesBuilding.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m1.test.ts, src/core/__tests__/m2.test.ts, src/core/__tests__/m3.test.ts
V-215   | src/core/gml/gmlReader.ts, src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/validation/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m0.test.ts, src/core/__tests__/m1.test.ts
V-216   | src/core/model/index.ts, src/core/validation/rulesExtra.ts | src/core/__tests__/m2.test.ts
```

---

## 7. `npm run verify:samples` Gerçek Çıktısı (`15 Resmi Dosya SHA-256 + Ornek6 42 Öznitelik`)

```json
{
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
}
```
