# M9 — Resmî Test, Ön-Kontrol (Pre-Flight), KML/GeoJSON Parsel ve Teslim Raporu

**Şartname Referansları:** §7.1, §8.3, §9.5, §10.6, §11  
**İlgili Kurallar & Kararlar:** K02, K03, K07, K08, K88-yeni, K89, K92, K99; V-019, V-100, V-101, V-108, V-125, V-162, V-192, V-193, V-196, V-197, V-200, V-217; ACIK-09, ACIK-10  
**Test Paketi:** `src/core/__tests__/m9.test.ts` (13/13 test geçti; toplam m0..m9: 172/172 test)

---

## 1. Kapsam ve Amaç

M9 aşaması, üretilen veya düzenlenen CityGML 2.0 3B Sayısal Yapı Modellerinin Çevre, Şehircilik ve İklim Değişikliği Bakanlığı / Tapu ve Kadastro Genel Müdürlüğü (TKGM) `3dbinadogrula.tkgm.gov.tr` portalına yüklenmeden önce **resmî test ortamı gereksinimlerine göre yerel olarak ön-denetimden (pre-flight check) geçirilmesini**, harici parsel sınırlarıyla (KML / GeoJSON) ve çok bloklu parsellerle doğrulanmasını, harici `val3dity` test raporlarıyla eşleştirilmesini ve belediye/kadastro idaresine sunulacak çevrimdışı HTML teknik raporlarının üretilmesini sağlar.

---

## 2. Geliştirilen Temel Modüller

### 2.1. Parsel İçe Aktarma ve Koordinat Dönüşümü (`src/core/importers/parcelImporter.ts`)
- **WGS84 ↔ TUREF TM 3° Elipsoidal Dönüşüm (`wgs84ToTurefTm`, `turefTmToWgs84`):**
  - GRS80 elipsoidi parametreleri ($a = 6378137.0$ m, $f = 1/298.257222101$, $k_0 = 1.0$, $FE = 500000.0$ m).
  - TUREF TM 3° projeksiyonu (EPSG:5253..5259, DOM 27°..45°).
  - Sub-milimetre meridyen yayı ve ters dönüşüm hassasiyeti.
- **KML ve GeoJSON Ayrıştırıcı (`parseParcelKmlOrGeoJson`):**
  - `<Polygon>`, `<LinearRing>`, `<coordinates>` KML etiketlerini ve GeoJSON `Polygon`/`MultiPolygon` geometrilerini hiyerarşik olarak (dış halka + delikler) ayrıştırır.
  - WGS84 boylamından otomatik EPSG dilim tespiti (`suggestEpsgFromLongitude`).
  - Proje yerel milimetre koordinat ızgarasına (`Poly2[]`) ve TUREF metre düzlemine dönüştürme.
- **Parsel ve Çok Blok Kesişim Denetimi (`validateParcelAndMultiBuilding`):**
  - `V-019`: Model `srsName` EPSG dilimi ile parsel boylamı diliminin uyumu.
  - `V-193`: Bina tabanı (`GroundSurface` / `lod0FootPrint`) ile parsel geometrisinin kesişimi ve parsel dışına taşma denetimi ($> 0.05$ m² taşmada UYARI, hiç kesişmeme durumunda HATA).
  - `V-192`: Aynı parseldeki çok bloklu yapılarda (2025/2 Genelgesi m.4/3) blok ayak izi kesişim yüzdesi ve minimum yaklaşma mesafesi denetimi.

### 2.2. Harici val3dity Raporu ve Yerel 3B Kabuk Denetimi (`src/core/validation/val3dity.ts`)
- **val3dity Rapor Ayrıştırıcı (`parseVal3dityReport`):**
  - `val3dity --report report.json` JSON çıktısını okur.
  - Hata kodlarını (`101..503`) Şartname §6 kural kodlarına (`V-031..V-040`, `V-100`, `V-101`, `V-217`) deterministik olarak eşler (`mapVal3dityCodeToRuleId`).
- **Yerel Genişletilmiş 3B Geometri ve Topoloji Denetimi (`runExtendedGeometryAudit`):**
  - `V-101`: LoD1 `CompositeSolid` bina kabuk kapalılığı ve açık kenar analizi.
  - `V-108`: `lod0RoofEdge` poligonunun `RoofSurface` çatı izdüşümünün içinde kalma denetimi ($A_{\text{dış}} \le 0.05$ m²).
  - `V-125`: Bağımsız Bölüm (BB) tabanının Kat sınırının içinde kalma denetimi ($A_{\text{dış}} \le 0.1$ m²).
  - `V-162`: Oda / Kısım (BBK) tabanının bağlı olduğu BB sınırının içinde kalma denetimi.
  - `V-196`: İç Yapı (`BBKIY_` / `OAIY_`) kapalı 3B prizma kabuk kapalılığı ($10$ mm tolerans).
  - `V-197`: K71 iç-oda taban halkalarının şaft/iç döngü eşleşmesi.
  - `V-200`: Dubleks / çok parçalı BB alan stratejisi doğrulaması (`repeat` vs `minusOne`).
  - `V-217`: Bağımsız bölüm kısımlarının (`BBK_` / `OA_`) 3B manifold oda kabuğu kapalılığı ($10$ mm ve $1$ mm kenar kapalılık kontrolü).

### 2.3. Teslim Ön-Kontrolü ve Resmî Doğrulama Kaydı (`src/core/validation/submissionPackage.ts`)
- **Teslim Ön-Kontrolü (`evaluateSubmissionReadiness`):**
  - 10 adımlı kapsamlı kontrol listesi (`CHK-FILENAME`, `CHK-ENCODING`, `CHK-GML-SCHEMA`, `CHK-CRS`, `CHK-ATTRIBUTES`, `CHK-LANDSHARE`, `CHK-PARCEL`, `CHK-SHELLS`, `CHK-VAL3DITY`, `CHK-OFFICIAL`).
  - Ham dosya SHA-256 (`fileSha256`) ve K89 Kanonik Model Özeti (`canonicalHashSha256`).
  - Resmî doğrulama kodu (`OfficialVerificationRecord`) ve SHA-256 kilit eşleşmesi denetimi (`hashMatchesOfficialRecord`).
- **Sunucu Hata Mesajı Eşleyici (`matchServerMessageToRule`):**
  - TKGM sunucu hata mesajlarını Türkçe anahtar kelimeler ve düzenli ifadelerle `V-xxx` kurallarına bağlar.
- **Çevrimdışı HTML Rapor Üreticileri:**
  - `generateSubmissionReportHtml`: Sıfır harici bağımlılıklı, profesyonel baskı/PDF uyumlu teknik teslim raporu (malik kişisel verisi içermez, `K99`).
  - `generateMalikIrtifakReportHtml`: `K88-yeni` uyumlu `BigInt` arsa payı toplamlı kat irtifakı ve malik listesi tablosu.

---

## 3. Test Sonuçları ve Doğrulama Matrisi

| Test Grubu | Test Sayısı | Durum | Kapsanan Kurallar |
|---|---|---|---|
| 1. WGS84 ↔ TUREF TM ve Parsel İçe Aktarma | 3 | GEÇTİ | §8.3, K07, K08, V-019 |
| 2. Parsel ve Çok Blok Kesişim Denetimi | 3 | GEÇTİ | §6.13, V-019, V-192, V-193 |
| 3. val3dity ve Genişletilmiş 3B Kabuk Denetimi | 2 | GEÇTİ | §9.5, V-101, V-108, V-125, V-162, V-200, V-217 |
| 4. Teslim Ön-Kontrolü ve Resmî Doğrulama Kaydı | 3 | GEÇTİ | §7.1, §10.6, K02, K03, K89 |
| 5. HTML Rapor Üretimi (Teknik ve Malik Listesi) | 2 | GEÇTİ | §7.1, K88-yeni, K89, K99 |
| **Toplam M9 Testleri** | **13** | **GEÇTİ** | **13 / 13** |
| **Toplam Proje Testleri (`m0`..`m9`)** | **172** | **GEÇTİ** | **172 / 172** |

---

## 4. Kullanıcı Arayüzü Entegrasyonu

`src/App.tsx` üst araç çubuğuna M9 işlevleri eklenmiştir:
1. **🗺️ Parsel Düğmesi:** KML veya GeoJSON dosyasını seçerek parsel geometrisini yükler, EPSG dilimini ve bina tabanı kesişim oranını anında denetler.
2. **📄 Teslim Raporu Düğmesi:** 10 adımlı ön-kontrolü çalıştırıp resmî SHA-256 imzalı çevrimdışı HTML teknik doğrulama raporunu (`Teslim_Raporu_<binaID>.html`) tek tıkla indirir.
3. **📑 Kat İrtifakı Düğmesi:** K88-yeni / K99 uyumlu arsa payı ve malik tablosunu (`Malik_Irtifak_Listesi_<binaID>.html`) indirir.
