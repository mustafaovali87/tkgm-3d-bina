# TKGM 3B Dijital Bina GML Uygulaması — Claude Değerlendirmesi ve Birleşik Plan

Bu belge iki şey içerir:
1. TKGM kaynaklarından (Dijital Bina Üretim Rehberi, dijitalbina.tkgm.gov.tr, genelgeler) çıkarılan **teknik gereksinimler**.
2. Gemini'nin `implementation_plan.md` planının bu gereksinimlere göre **değerlendirmesi** ve iki planın **birleştirilmiş hâli**.

Kaynaklar:
- Dijital Bina Üretim Rehberi (ver. 3.0.3): https://cbs.tkgm.gov.tr/surdurulebilirlik/
- Dijital Bina portalı: https://dijitalbina.tkgm.gov.tr/ (dokümanlar, SSS, mevzuat)
- TKGM Otomatik Doğrulama: https://3dbinadogrula.tkgm.gov.tr/#/validasyon
- Örnek GML'ler: https://cbs.tkgm.gov.tr/surdurulebilirlik/data/Ornek1-M-130942262-A.gml … Ornek6 (Ornek1 erişilebilir, ~28 MB)
- Kod listeleri: http://cbs.tkgm.gov.tr/3d/schema/1.0/<ad>CodeList.xml

---

## 1. Süreç ve mevzuat

**Süreç:** Yapı ruhsatı → 3B model üretimi → 3dbinadogrula'ya yükleme → "Başarılı" + **Doğrulama Kodu** → Belediye kontrolü ve WebTapu'ya yükleme → Kadastro (MEGSİS) onayı → Tapu Müdürlüğü tescil. Her ret sonrası süreç yeni bir doğrulama koduyla baştan başlar.

**Mevzuat:** Anayasa m.35; 634 sayılı Kat Mülkiyeti Kanunu; 3402 sayılı Kadastro Kanunu; 4 sayılı CBK; 2017/6, 2021/2 (No 1907, Ek-2, Ek-3), 2021/4 ve **2025/2 Genelgeleri**.
- 2025/2 Genelgesi m.4/3: Bir parselde birden fazla blok varsa, bağımsız bölümler bölünmeden fiziksel olarak ayrılabilen bloklar için **ayrı model**; ortak taban/zemini olan ve bölünemeyen bloklar için **tek model** üretilir.

---

## 2. TKGMCityGML teknik gereksinimleri

### Dosya
- **CityGML 2.0** tabanlı TKGM profili, UTF-8. ("Gml dosyası versiyonu desteklenmiyor (v3 desteklenmez)" hatası var.)
- **Her dosyada tek bina** ("Sadece bir bina olmalıdır"), en az 4 `cityObjectMember`.
- Dosya adı: **`M-<YapıID>.gml`** — dosya adı ile constructionID uyuşmazsa hata.
- Doku (texture) kullanılırsa yalnızca PNG.

### Koordinat sistemi
- **TUREF**, GRS80, Transverse Mercator, 3° dilim, ölçek 1, false easting 500000, false northing 0, **ortometrik yükseklik**.
- Orta meridyen → EPSG: 27→5253, 30→5254, 33→5255, 36→5256, 39→5257, 42→5258, 45→5259.
- `srsName` / `srsDimension` **yalnızca bina zarfında**: `<gml:Envelope srsName="EPSG:5256" srsDimension="3">`.
- Koordinatlar **virgülden sonra 3 hane**.
- Not: Portal ana sayfası "ITRF-96" diyor, rehber TUREF/EPSG 5253–5259 veriyor; rehber esas alınmalı.

### Detay seviyeleri (hepsi zorunlu)
- **LoD0:** `lod0FootPrint` + `lod0RoofEdge`. Taşan balkonlar ize dahil edilmez; iz arazi altında kalmaz.
- **LoD1:** `lod1Solid` → `CompositeSolid`: zemin üstü hacim (RoofEdge–FootPrint) + zemin altı hacim (FootPrint–en alt taban), birbirine değen iki solid.
- **LoD2:** WallSurface, RoofSurface, GroundSurface, OuterFloorSurface, OuterCeilingSurface, ClosureSurface → `lod2MultiSurface` (xlink:href ile). Çatı + zemin modeli tamamen kapatmalı. **`lod2TerrainIntersection` (TIC) 30 cm aralıklı noktalarla.**
- **LoD4:** Odalar (interiorRoom), iç duvar/taban/tavan, kapı ve pencereler (açıklık olarak) → `lod4MultiSurface`.
- **LoD3 istenmiyor.** Rehber: "Lod2 detay seviyesinde çatı geometrisi tanımı yeterlidir." Baca vb. buildingInstallation gerekmez.

### Nesneler, kimlik ve ad kuralları
| Nesne | gml:id ön eki | bldg:class / tip |
|---|---|---|
| Mimari Bina | `MB_` | MimariBina (`bldg:Building`) |
| Kat | `K_` | Kat (`grp:CityObjectGroup`, grp:parent / grp:groupMember) |
| Bağımsız Bölüm | `BB_` | BagimsizBolum (`gen:GenericCityObject`) |
| Bağımsız Bölüm Kısım | `BBK_` | BagimsizBolumKisim |
| Ortak Alan | `OA_` | OrtakAlan |
| Balkon / Teras | `BLKN_` / `TRS_` | Balkon / Teras |
| Kapı / Pencere | `KAPI_` / `PEN_` | Kapi / Pencere |

- gml:id = ön ek + `_` + GUID (süslü parantezsiz).
- Yüzey ön ekleri: `Wall_`, `Roof_`, `Floor_`, `Ground_`, `OuterFloor_`, `Closure_`, `InteriorWall_`, `LinearRing_`, `DoorLinearRing_`, `WindowLinearRing_`.
- gml:name: `Mimari Bina_<constructionID>`, `Kat_<storeyNumber>`, bağımsız bölüm `blokAdı_giriş_bbNo_Bağımsız Bölüm` (değer yoksa -1). Yüzey adları: Taban, Duvar, Çatı, İçDuvar, Tavan, Zemin, DışTaban.

### YapıID (constructionID)
- Parselin `tapuzeminref` / `AnaTasinmazZeminRef` değerine dayanır.
- Ana yapılar harf (A, B, … 29'dan sonra AA, AB…), diğer yapılar rakam; parsel girişinden saat yönünde atanır.

### Mimari Bina öznitelikleri (gen: attribute)
Zorunlu: `constructionID`, `maksIdentityNumber`, `maksIntegrationState`, `takbisPropertyIdentityNumber`, `blockNumber` (ada), `parcelNumber`, `tenderRegistrationNumber` (**boş**), `buildingType`, `geometrySuitability`, `architecturalPlanID` (**boş**), `takbisNeighbourhoodReference`, `totalIndependentSectionCount`, `elevatorCount` (yoksa 0), `roofProjectionArea` (m², 2 hane), `buildingHeight` (m, 2 hane), `architecturalProjectConfirmationDate`; CityGML `storeysAboveGround`, `storeysBelowGround`. İsteğe bağlı: `additionalNote`.

### Kat ve Bağımsız Bölüm öznitelikleri
- Kat: `storeyNumber`, `storeyUsage` (çoklu olabilir), `independentSectionCount`.
- Bağımsız Bölüm: `geometrySuitability`, `integrationState` = 1004, `independentSectionNumber`, `blockName`, `entrance`, `takbisPropertyIdentityNumber` = -1, `maksIdentityNumber`, `maksNumaratajIdentityNumber`; ayrıca nitelik, kat tanımı, arsa payı, yön, kullanım, net/brüt/hesaplanan alanlar.
- **Çelişki:** Öznitelik tablosunda BB geometrySuitability 1006, sürdürülebilirlik hata mesajında "1001 veya 1002" yazıyor. Örnek GML'lere ve kod listesine bakılarak karar verilmeli.

### Kod listeleri
buildingType, buildingGeometrySuitability, maksConstructionIntegrationState, storeyUsage, independentSectionGeometrySuitability, independentSectionUsage, integrationState, cardinalDirection, maksIndependentSectionIntegrationState, independentSectionPartGeometrySuitability, partUsage, roomInstallationUsage, doorUsage, windowUsage.

### Varsayılan ölçüler (projede yoksa)
- Kapı 210 cm; kat yüksekliği 210 cm'den azsa tavanın 30 cm altına kadar.
- Pencere (mesken): tavandan 50 cm aşağıda, 130 cm yükseklik. Ticari: döşemeden 10 cm, tavanın 10 cm altına kadar. Banyo / küçük bodrum penceresi: 50×50 cm.
- Balkon/teras duvarı: 110 cm.
- Alanı etkilemeyen 50 cm'den küçük çıkıntılar ve merdiven detayları sadeleştirilir.

### Doğrulama kuralları (TKGM hata tablosundan örnekler)
- "Yan duvar (InteriorWallSurface) sayısı 3'ten az olamaz."
- "Tavan yüzeyi (CeilingSurface) sayısı 1'den fazla olamaz." / "Taban yüzeyi (FloorSurface) sayısı 1'den fazla olamaz."
- "Çatı yüzeyi sadece 1 tane olmalıdır." / "Zemin (ground) yüzeyi 1 tane olmalıdır."
- "Hesaplanan alan ile plandan gelen alan eşit değil (Tolerans %10)."
- "measuredHeight 0 ile 950 arasında olmalıdır."
- "Arazi kesişimi 30 cm aralıklarla nokta üretilerek gösterilmelidir."
- "Koordinatlar noktadan sonra 3 basamağa sahip olmalıdır."
- Sürdürülebilirlik: İhaleKayıtNo boş; bina geometrik uygunluk 1006; mimari plan id boş; BB geometrik uygunluk 1001/1002; entegrasyon durumu 1004; BB kısım ve balkon geometrik uygunluk 1001.
- Geometri ayrıca **val3dity** hatası vermemeli (ör. -104 kendini kesen ring, -302 kapalı olmayan shell): https://val3dity.readthedocs.io/en/latest/errors/

---

## 3. Gemini planının değerlendirmesi

### TKGM kurallarına uymayan noktalar
| Konu | Gemini planı | TKGM'nin istediği |
|---|---|---|
| Detay seviyeleri | LoD-3 + LoD-4 | **LoD0 + LoD1 + LoD2 + LoD4**; LoD3 yok |
| Nesne tipleri | `Storey`, `BuildingUnit` (CityGML 3.0) | CityGML 2.0: Kat = `CityObjectGroup`, Bağımsız Bölüm = `GenericCityObject` |
| srsName | Her poligonda `urn:ogc:def:crs:EPSG::5254` | Sadece zarfta `srsName="EPSG:5256" srsDimension="3"` |
| Eksik konular | — | `M-<YapıID>.gml` adı, ID ön ekleri + GUID, LoD0 izi, LoD1 iki parçalı CompositeSolid, 30 cm TIC, yüzey sayısı kuralları, %10 alan toleransı, kapı/pencere varsayılanları, zorunlu öznitelik listesi |
| Doğrulama | "300+ kural" denip genel geometri kontrolleri sayılmış | TKGM'nin kendi hata tablosu + val3dity kuralları |
| Öznitelik adları | `yibfNo`, `maksYapiId`, `cins` gibi Türkçe/serbest adlar | TKGM'nin İngilizce gen: attribute adları (`constructionID`, `maksIdentityNumber` …) birebir kullanılmalı |

### Gemini planından alınacak iyi fikirler
- Mevcut **.gml dosyasını açıp düzenleme** (reddedilen dosyayı düzeltmek için).
- **DXF + KML** altlık içe aktarma.
- 2B CAD + 3B sahne **çift ekran**, CityGML hiyerarşi ağacı.
- **Kat patlatma (exploded view)** ve kesit.
- Çatı tipleri: düz, beşik, kırma, teras, parapet (LoD2 çatı yüzeyi olarak üretilecek).
- **Floating origin:** TUREF koordinatları sahnede yerel ofsetle gösterilir, GML'e tam hassasiyetle yazılır.
- Snap motoru (köşe, orta nokta, diklik, ızgara), Shoelace alan hesabı, CCW normalizasyonu.
- Hatalı poligonları 2B/3B'de kırmızı gösterme, canlı XML önizleme, kat çoğaltma.

---

## 4. Birleşik plan

**İlke:** Arayüz ve kullanım fikirleri Gemini'den; GML formatı, öznitelikler ve doğrulama kuralları TKGM Üretim Rehberi'nden. Geliştirme TKGM'nin 6 örnek GML'si üzerinden kalibre edilir.

### Teknoloji
- Önerilen: **Electron + TypeScript + Three.js** (Vite ile), Windows `.exe` kurulum paketi. Alternatif: C# / .NET 8 WPF + HelixToolkit.
- Büyük GML'ler (28 MB) için akış tabanlı (streaming) XML ayrıştırıcı.

### Modüller
1. **Proje bilgileri:** Ada/parsel, YapıID (otomatik öneri), TAKBİS/MAKS numaraları, ruhsat ve proje onay tarihi, EPSG dilimi (koordinattan otomatik), su basman kotu.
2. **Kat yöneticisi:** Bodrum/zemin/normal/çatı katları, kot ve yükseklik, kat kopyalama.
3. **2B CAD editörü:** Snap, katmanlar (kat dış sınırı, bağımsız bölüm, bölüm kısmı, oda, ortak alan, balkon/teras), kapı ve pencereyi duvara yerleştirme.
4. **İçe aktarma:** DXF (katmanlarla), KML, **TKGM GML** (düzenleme için).
5. **3B sahne:** LoD0/1/2/4 görünümleri, kat patlatma, nesneye tıklayınca öznitelik paneli, floating origin.
6. **Geometri üretici:** LoD0 iz + çatı kenarı, LoD1 CompositeSolid (üst+alt), LoD2 kabuk ve çatı tipleri, 30 cm TIC, LoD4 oda kabukları, kapı/pencere açıklıkları ve varsayılan ölçüler.
7. **GML yazıcı:** CityGML 2.0 + TKGM ad alanları, ID ön ekleri + GUID, gml:name kuralları, kod listesi değerleri, 3 hane koordinat, `M-<YapıID>.gml`.
8. **Yerel doğrulayıcı:** TKGM hata tablosundaki kurallar + temel val3dity kontrolleri (kapalı shell, kendini kesen ring, düzlemsellik) + zorunlu öznitelikler + %10 alan toleransı. Türkçe hata mesajı, çözüm önerisi ve hatalı nesneyi vurgulama.
9. **Kalibrasyon testleri:** 6 örnek GML okunur → yeniden yazılır → yapısal karşılaştırma; kendi üretilen dosyaların örneklerle aynı şemada olduğu doğrulanır.

### Sıralama
1. Örnek GML'leri ve kod listelerini indirip incelemek; veri modelini bunlara göre kurmak.
2. GML okuyucu + yazıcı (örnekleri okuyup aynı yapıda yazabilme).
3. Yerel doğrulayıcı.
4. 3B sahne (okunan GML'leri görüntüleme).
5. 2B CAD editörü + kat yöneticisi + geometri üretici.
6. DXF / KML içe aktarma.
7. Windows kurulum paketi.

**İlk sürüm hedefi:** Basit tek bloklu bir apartmanı uçtan uca çizip TKGM doğrulamasından geçecek GML üretmek.

### Dikkat
- Uygulamanın yerel doğrulaması resmi doğrulamanın yerine geçmez; son kontrol 3dbinadogrula.tkgm.gov.tr'de yapılır.
- CRS (TUREF/ITRF-96) ve BB geometrySuitability (1006 / 1001-1002) çelişkileri örnek dosyalarla netleştirilmeli; gerekirse dijitalbina@tkgm.gov.tr'ye sorulmalı.
