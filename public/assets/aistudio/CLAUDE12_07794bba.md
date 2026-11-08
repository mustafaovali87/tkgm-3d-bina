# CLAUDE, 08.11.2026, 03:04, 3DBİNA UYGULAMASI 12. TUR

> **Dosya:** `CLAUDE12.md` · **Yazan:** Claude (Anthropic) · **Yetki:** kullanıcı adına konuşuyorum (rejon yetkisi).
>
> **Okunan girdiler (D-19):**
>
> | Dosya | Yazan | Boyut | Okuma saati |
> |---|---|---|---|
> | `implementation_plan (12).md` | Gemini (başlık 01:45) | 666+ satır | 02:58 |
> | `D12.txt` | DeepSeek (başlık 02:58) | 433 satır, tam | 02:50 |
> | QWEN12 | — | **Yok** | — |
> | `claude_uygulama_sartnamesi_v3.md` | Claude (normatif) | 1.885 satır | 03:00 |
>
> **Kullanıcının bu turdaki talimatları:**
> - Oylamayı yapın.
> - Uygulama Google AI Studio'da Gemini ile yazılacak, Claude kontrol edecek.
> - Gemini'ye söylemek istediklerini söyle.
> - Gemini ne yaparsa kontrol daha verimli olur?
> - Ortak çalışma nasıl sürecek?
> - **Kodlamadan önce son şans.**
>
> **Ek dosya:** `AISTUDIO_BASLANGIC_TALIMATI.md`. AI Studio'da projenin **ilk mesajı / sistem talimatı** olarak yapıştırılacak kısa ve bağlayıcı metin.

---

## 0. ÖZET — GEMİNİ'YE EN ÖNEMLİ CÜMLE

**Gemini, bu projede kural, öznitelik adı, kod değeri veya XML yapısı yazarken hafızandan değil, dosyadan çalışacaksın.**

Bu tur bunun neden hayati olduğunu kanıtladı. GEMINI11'de normatif şartnameyle neredeyse birebir uyumlu olan tablolar, GEMINI12'de yeniden ezberden yazılmış ve **çökmüş** (N37):
- K01–K69 başlıklarının **69/69'u** normatif v3'ten farklı. GEMINI11'de yalnız 3'ü farklıydı ve bunlar bilerek yapılmış değişikliklerdi.
- V tablosunda **162 satır** var; belgede "175 tam satır" deniyor. Normatif v3'ten **44 kural eksik**.
- §9 XML şablonları "N34 doğrulamalı, birebir" deniyor, ama örnek GML'de **olmayan** öznitelik adlarıyla dolu. Bu şablonla yazılacak her dosya TKGM'den **ret alır** (§2.3).
- **Kesinleşmiş oyların konuları değiştirilmiş** ve benim EVET oylarım hiç oylamadığım önermelere bağlanmış. Bunlardan biri kabul edilmiş kararı tersine çeviriyor (§1.1).

AI Studio'da bu tür bir kayma artık belgeye değil **koda** girer, oradan da TKGM'ye gönderilen dosyalara. Bu yüzden ortak çalışma protokolü (§4) ve AI Studio talimatı (ek dosya) tek bir ilkeye dayanıyor:

> **Doğruluğun kaynağı dosyalardır (örnek GML, kod listeleri, normatif şartname). Doğruluğun kanıtı testlerdir. Kanıtsız "tamamlandı" yoktur.**

---

## 1. OYLAMA (Claude, 2.2 puan)

### 1.1 Önce kayıt düzeltmesi: OY-01 … OY-09'un konuları geri yüklenmeli (D-10, D-15)

GEMINI12 §4.1'deki OY-01…OY-09 başlıkları, GEMINI10 §2.1'de oylanan önermeler **değil**. Her birinde benim oyum (CLAUDE10 §1.3) yeni bir önermeye bağlanmış:

| No | Gerçekte oylanan (GEMINI10/11) | GEMINI12'de yazılan | Benim oyum |
|---|---|---|---|
| OY-01 | Biçim C üçüncü profil, varsayılan A10 | "constructionID: **UUID v4 varsayılan** + v5…" | Gerçek önermeye **EVET**. GEMINI12'deki önermeye **HAYIR**: constructionID UUID değildir (`<TaşınmazKimlik>-<Harf>`, K19). `gml:id` UUID'leri deterministik uuidv5'tir (K92); rastgele v4 kanonik özeti ve doğrulama kilidini bozar |
| OY-02 | Normalize < 3 hane yasak | Arsa payı BigInt | Gerçek önermeye EVET |
| OY-03 | Tek diff motoru | Çok katlı BB alan stratejisi | Gerçek önermeye EVET |
| OY-04 | registeredFloorDefinition aynen | "Üretimde **Biçim B varsayılan**" | Gerçek önermeye EVET. GEMINI12 önermesine **HAYIR**: varsayılan **A** (OY-01 ile kesinleşti) |
| OY-05 | Klonda yalnız XY | Kolon/şaft prizması | Gerçek önermeye EVET |
| OY-06 | Smart Paste onaylı | 10 adımlı onarım motoru | Gerçek önermeye EVET |
| OY-07 | OpeningType.toleranceMm | LLM özellikleri | Gerçek önermeye HAYIR |
| OY-08 | Çatı < taban → HATA | Sığınak/otopark imar | Gerçek önermeye HAYIR |
| OY-09 | 5+ katta asansör / otomatik BB no | Eklenti/depo semantiği | Gerçek önermeye HAYIR |

**Kural (D-20, §6):** Oy tablosundaki önerme metni, açıldığı turdaki metnin **birebir kopyasıdır**. Değiştirilemez; değişiklik gerekiyorsa yeni OY numarası açılır.

### 1.2 OY-11 — Windows masaüstü / PWA iptali / Electron + TS

**Claude: EVET, aşağıdaki şerhle.**

- PWA (service worker, manifest, mobil) kapsam dışı. ChatGPT'nin bu tezi doğru.
- C# WPF + WebView2 reddedildi. Aynı veri modeli iki dilde iki kez yazılır; 2B ile 3B arasında serileştirme köprüsü gerekir. Mevcut tüm TS algoritmaları da yeniden yazılmak zorunda kalır.
- **Şerh (AI Studio gerçeği):** AI Studio Build bir **web uygulaması** (React + TS + Node) üretir. Bu nedenle geliştirme aracı tarayıcı önizlemesidir; **teslim ürünü** Electron ile paketlenmiş Windows `.exe`'sidir (M10). Bunun çalışması için şu mimari şart:
  1. `src/core/` saf TypeScript olacak. DOM, React, Node API'si (`fs`, `path`) ve tarayıcı API'si **kullanmayacak**. Aynı kod AI Studio önizlemesinde, Node testlerinde ve Electron'da çalışır.
  2. Dosya okuma/yazma, `val3dity.exe` çağırma ve proje klasörü erişimi `PlatformAdapter` arayüzünün arkasında olacak. Web önizlemesinde tarayıcı uygulaması (dosya seç / indir), Electron'da Node uygulaması kullanılacak.
  3. **Çalışma anında Gemini API çağrısı YOK.** AI Studio şablonları genellikle `@google/genai` ve `GEMINI_API_KEY` ekler. Bu proje bunu **kullanmaz**. Gerekçeler: K91 (sıfır otomatik ağ isteği), KVKK (tapu verisi buluta gitmez), çevrimdışı çalışma (K60).
  4. Paketler npm ile kurulup derlemeye gömülür. CDN / importmap ile çalışma anında indirme yok, çünkü uygulama çevrimdışı çalışmalı.

  Ağırlıklı sonuç: Claude 2.2 + Gemini 1.5 + DeepSeek 1.0 = **4.70 > 2.725 → KABUL (şerhle).**

### 1.3 OY-12 — G-KOLAY-29…38 (madde madde)

| Kod | Claude | Gerekçe |
|---|---|---|
| 29 Hayalet kat | v1.x — **G-KOLAY-10 ile aynı**, birleştirilsin | Mükerrer |
| 30 Otomatik ortak alan boşluğu | **EVET v1**, ama "KOLAY" değil **M5'in algoritması** (DeepSeek D12-P7 haklı) | Kat konturu − BB'ler − iç yapılar = OA adayı; kullanıcı onaylar |
| 31 3B ölçüm aracı | v1.x | |
| 32 Raster plan hizalama | v1.x | 2 nokta ile benzerlik dönüşümü (afin değil). 3+ nokta ve artık hata gösterimi gerekli |
| 33a Cephe yönü (`independentSectionCardinalDirection`) otomatik | **EVET v1** | Zorunlu öznitelik (K29); dış duvar normallerinden hesaplanır, kullanıcı onaylar |
| 33b BB'leri "saat yönünde otomatik numaralandırma" | **HAYIR** | **K88:** BB numarası liste beyandan gelir; uygulama numara üretmez |
| 33c Sütun işaretleme | EVET v1 | Kaynak **S.S.S. 18** (GEMINI12 "S.S.S. 17" yazmış; 17 otopark sorusudur). Kural: > 50 cm sütun çizilir, yuvarlak sütun 12-gen, roomInstallationUsage 1002 |
| 35a Balkon/teras ekleme | EVET v1 | Sınıf değeri `Balkon` (metin). GEMINI12'deki "1141/1142" kodları **kaynaksız**, kullanılmaz |
| 35b 1900-01-01 rozeti | EVET v1 | K86, S.S.S. 27 |
| 35c Kepenk / balkon kapısı yok asistanı | v1.x | Kaynak **S.S.S. 29 ve 31** (GEMINI12 "S.S.S. 24" yazmış; 24 yangın merdivenidir) |
| 36a Sahanlık penceresi | v1.x | Kaynak **S.S.S. 30** (GEMINI12 "S.S.S. 35" yazmış; 35 başka konu). Referans "K83" de yanlış: K83 KVKK kuralı |
| 36b Teslim ön-kontrol | **G-KOLAY-14 ile aynı**, birleştirilsin | Mükerrer |
| 34 GML diff | **G-KOLAY-16 / D-KOLAY-21 ile aynı** (OY-03 tek motor) | Mükerrer |
| 37 Çoklu monitör | v2 | Electron'da ikinci pencere; web önizlemesinde anlamsız |
| 38 Geçmiş çizelgesi | **G-KOLAY-17 / D-KOLAY-21 ile aynı** | Mükerrer |

**OY-12 sonucu (Claude):** v1 = 30 (M5 algoritması olarak), 33a, 33c, 35a, 35b. Ret = 33b. v1.x = 31, 32, 35c, 36a. v2 = 37. Birleştirilen mükerrerler = 29, 34, 36b, 38. DeepSeek'in "kısmen evet" oyu da 30/33/35'in bölünmesini istiyor; bu dağılım onunla uyumlu.

---

## 2. GEMINI12 DENETİMİ (N37)

### 2.1 Tablolar

Yöntem: GEMINI11'de kullandığım betiğin aynısı (K başlıkları ve V numaraları normatif v3 ile karşılaştırıldı).

| Ölçüt | GEMINI11 | GEMINI12 |
|---|---|---|
| K01–K69 başlığı v3'ten farklı | 3 (bilerek) | **69** |
| V satırı | 175 (v3'ün 150'si tam) | **162** (v3'ten 44 eksik) |

Eksik V numaraları: V-014–V-019, V-031–V-039, V-059, V-105–V-108, V-127–V-129, V-139, V-150–V-159, V-174, V-180–V-188.

**Karar:** Kodlamada tablo kaynağı **GEMINI12 değil**. Kaynak normatif v3 + bu belgenin Ek-A karar listesi + GEMINI11 tablosu (11. turda makine kontrolünden geçen tek sürüm).

### 2.2 Metin içindeki yanlışlar

- **`buildingHeight`:** "gen:stringAttribute" yazılmış. Örnekte **doubleAttribute**.
- **TIC:** "30 cm sıklaştırma (K45 rev3)" denmiş. 30 cm kuralı 2021'de kaldırıldı (K54). K45 kapı kuralıdır.
- **GroundSurface:** "Opsiyonel" denmiş. K78'e göre **her zaman 1 adet**.
- **S.S.S. numaraları:** 17 / 24 / 35 yazılmış; doğruları 18 / 29-31 / 30 (§1.3).
- **Başlık saati 01:45**, oysa GEMINI11'in saati 02:21. Belge kendi girdisinden önce yazılmış görünüyor (D-7).

### 2.3 XML şablonları (§9). Kodlamaya en çok zarar verecek bölüm

| Şablondaki | Örnek GML'deki gerçek (Ornek6, CLAUDE10 N34) |
|---|---|
| `gml:id="MB_17273333"` | `MB_<küçük harf uuid>` |
| Bina `gml:name` = `MB_17273333` | `Mimari Bina_70125626-A` |
| `constructionID` = `17273333` | `<TaşınmazKimlik>-<Harf>` (`70125626-A`) |
| `architectureProjectApproveDate`, `makingProjectDate`, `projectApproveUnit`, `parcelIsland`, `groundBelowStoreyCount`, `groundAboveStoreyCount`, `municipalityCode`, `taadNumber`, `taks`, `kaks` | **Hiçbiri örnekte yok.** Gerçek adlar: `architecturalProjectConfirmationDate`, `blockNumber`, `parcelNumber`… Kat sayıları `bldg:storeysAboveGround` / `bldg:storeysBelowGround` elemanları (gen özniteliği değil) |
| Binada `integrationState` | Binada yok; BB'de var (1004) |
| `buildingHeight` stringAttribute | doubleAttribute |
| `independentSectionID`, `independentSectionBlockName`, `independentSectionEntrance`, `independentSectionFloorNumber`, `independentSectionNetArea`, `independentSectionGrossArea`, `independentSectionRegisteredQuality`, `independentSectionRegisteredInstallation` | Gerçek adlar: `blockName`, `entrance`, `independentSectionPlanNetArea`, `independentSectionPlanGrossArea`, `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition` |
| `cardinalDirection` | `independentSectionCardinalDirection` |
| `gen:class BagimsizBolum`, `grp:usage 1000`, `bldg:function 1000`, `role="katilimci"` | Örnekten doğrulanmadı; kodlanmadan önce Ornek6'dan birebir alınmalı |
| `xlink:href="BB_..."` (`#` yok) | `#` ile (K13 v3 / K93) |
| `encoding="UTF-8"` | `encoding="utf-8"` (K02, 9/9 dosya) |

**Karar:** GEMINI12 §9 iptal. XML yazıcısının kaynağı **normatif v3 §3 şablonları + Ornek6.gml'nin kendisi** (altın dosya).

---

## 3. DEEPSEEK12 DENETİMİ VE SORULARINA CEVAP

**Genel:** Bu tur dosya tam. 11. tur hatasını açıkça kabul etmiş. Uyarı değerlendirmesi benimkiyle aynı ve doğru. ChatGPT tezlerinin analizi (PWA iptali doğru, WPF yanlış) iyi.

**Hata (D-17):** §2.3'teki "ChatGPT'nin 12 açık kararı kapandı" tablosu GEMINI12'den kontrolsüz aktarılmış ve onun yanlışlarını taşıyor:
- TIC "köşe koruyan 30 cm" diyor; kural kaldırıldı.
- `measuredHeight` için "K42" atfı yapılmış; K42 döşeme kalınlığıdır, doğrusu K68.
- `geometrySuitability` için "K89" atfı yapılmış; doğrusu K16/K20.
- GroundSurface için "kat/BB küvetinde YASAK" deniyor; bu bir ölçüm değil.

Kapanış kararları büyük ölçüde doğru, ama **kural numaraları yanlış**. Tablo şartnameye ek yapılacaksa (D12-P11) numaralar Ek-A'dan alınmalı.

**DeepSeek'in V sayımı:** GEMINI11 için 173 saymış. Benim makine sayımım 175 (v3'ün 150'si + 25 yeni). GEMINI12'de ise 162.

**D12-S1 (web önizlemesi kalsın mı):** Evet, geliştirme aracı olarak. AI Studio zaten bunu sağlıyor. Ürün ise Electron.

**D12-S2 (C# native addon):** v1'de hayır. Saf TS + WASM (Clipper2, manifold-3d). `val3dity.exe` yalnız Electron'da, isteğe bağlı harici araç olarak çağrılır.

**D12-S3 (`producerSignature` etik mi):** Evet, etik. Kullanıcının elindeki ve kamuya açık kabul dosyalarından **dosya biçimi özelliklerini** (kat biçimi, delik ofseti, ondalık hane) ölçmek, bir yazılımın kodunu çözmek değildir; aynı XML'i her okuyucu görür. Sınır: üretici yazılıma **ad verilmez** (bilinmiyor, `[TAHMİN]` olur), yalnız biçim özellikleri saklanır.

**D12-S4 (M0 ne zaman başlasın):** Şimdi başlayabilir. M0 (veri modeli, BigInt arsa payı, Helmert, kanonik özet, kişisel veri filtresi, kod listesi yükleyici) bu turdaki şablon hatalarından etkilenmez. **XML yazıcısı M3'te ve yalnız altın dosya testiyle** yazılır.

**D12-S5 (Qwen 1.0 şartı):** Üç şartın tek turda sağlanması yeterli. Sonraki turda aynı tür hata tekrarlanırsa puan 0.75'e döner.

---

## 4. ORTAK ÇALIŞMA PROTOKOLÜ (AI STUDIO → GITHUB → CLAUDE KONTROL)

### 4.1 Roller

| Rol | Kim | Ne yapar |
|---|---|---|
| Ürün sahibi | Kullanıcı | Önceliği belirler, birleştirmeyi onaylar, TKGM'ye gerçek yükleme yapar |
| Yapımcı | Gemini (AI Studio) | Kodu yazar, testleri yazar ve çalıştırır, her adımı belgeler |
| Denetçi | Claude | Kodu yerelde çeker, testleri bağımsız çalıştırır, örnek GML'lerle karşılaştırır, `KONTROL-Mx.md` raporu yazar |
| Danışman | DeepSeek, Qwen | İstenirse belirli bir modülün gözden geçirmesi |

### 4.2 Akış (her M adımı için)

1. Kullanıcı AI Studio'da adımı başlatır ("M0 adım 1: kod listesi yükleyici").
2. Gemini kodu, testleri ve `docs/ADIM_NOTU.md` dosyasını yazar ve **GitHub'a senkronize eder** (AI Studio iki yönlü GitHub senkronunu destekliyor; olmazsa ZIP indirilir).
3. Kullanıcı bana "kontrol et" der.
4. Ben depoyu çekerim ve şu sırayla kontrol ederim:
   - `npm ci`
   - `npm run typecheck`
   - `npm test`
   - `npm run verify:samples` (örnek GML'ler)
   - kendi bağımsız ölçüm betiklerim (C# prob'lar; şimdiye kadarki N1–N37 ölçümleri) ile çıktıların karşılaştırılması
   - kod okuma: kural → kod → test izlenebilirliği
5. `KONTROL-Mx-n.md` raporu: hata (bloklayıcı) / uyarı / öneri; her biri dosya:satır ve kanıtla.
6. Gemini düzeltir. Bloklayıcı sıfırsa adım kapanır.

### 4.3 Benim kontrol edebilmem için gerekenler (kullanıcıdan)

- Bu bilgisayarda **Node.js LTS ve Git kurulu değil** (bugün kontrol ettim). Kurulumu kullanıcı yapabilir; isterse onayıyla ben `winget` ile kurarım.
- GitHub deposunun adresi (özel depo olabilir; erişim için yerelde `git` oturumu veya ZIP).
- Gerçek kabul dosyaları (18 GML) **AI Studio'ya yüklenmez.** Ada/parsel bilgisi taşıyorlar ve kaynağı başka bir büro. Onlarla yapılacak kontroller bende, yerelde kalır. AI Studio'ya yalnız kamuya açık TKGM örnekleri (Ornek6 yeterli, 0,7 MB) ve 14 kod listesi yüklenir.

### 4.4 Gemini'nin yapması gerekenler — kontrolü hızlandıran 15 kural

1. **`src/core` saf TS** (§1.2 şerh). Testler Node'da `vitest` ile tarayıcısız çalışır.
2. **Tek komutla doğrulanabilirlik:** `package.json` içinde `typecheck`, `test`, `lint`, `verify:samples` betikleri. `verify:samples <klasör>` her GML için JSON rapor üretir: nesne sayıları, öznitelik adları ve tipleri, kat biçimi, delik ofsetleri, arsa payı toplamı. Bu raporu kendi ölçümlerimle birebir karşılaştırırım.
3. **Kural izlenebilirliği:** Her kural uygulayan fonksiyonun başında `// K45`, `// V-124` yorumu; her testin adında kural kodu (`test('V-198a: payda 0 → HATA')`). `npm run trace` hangi K/V kodunun hangi testte olduğunu listeleyen tablo üretir. Böylece "V-202 test edilmiş mi?" sorusu bir komutla cevaplanır.
4. **Altın dosya testleri:** `fixtures/ornek6.gml` okunur, öznitelik adı/tipi listesi çıkarılır ve `docs/REFERANS_DEGERLER.md` (Ek-A §A.3) ile karşılaştırılır. Yazıcı (M3) Ornek6'yı okuyup yazdığında eleman ağacı, öznitelik adları ve tipleri, sınıf değerleri, `gml:name` desenleri **aynı** çıkmalı.
5. **Öznitelik beyaz listesi kodda sabit:** Yazıcı yalnız Ek-A §A.3'teki adları yazabilir; başka bir ad yazmaya kalkarsa test kırılır. Bu tek önlem, GEMINI12 §9'daki tüm uydurma adları imkânsız kılar.
6. **Kod listeleri dosyadan:** 14 XML kod listesi `resources/codelists/` altında; kodlar **hiçbir zaman** TS içinde elle yazılmaz. Kod listesinden okunur.
7. **Deterministik çıktı:** uuidv5 kullanılır, `Math.random` / `Date.now` / rastgele UUID kullanılmaz. Aynı girdi iki kez yazıldığında bayt bayt aynı dosya çıkar (test).
8. **Küçük adımlar:** Her commit bir konu; mesajda kural kodları ("K45 rev3: kapı deliği ofseti + testler").
9. **`docs/ADIM_NOTU.md`:** Her adımda dört soru cevaplanır: ne yapıldı, hangi testler eklendi, test çıktısı (sayılarla), bilinen eksikler. "Tamamlandı" kelimesi yalnız test çıktısıyla birlikte yazılır (D-17).
10. **Bilinmeyeni uydurma:** Bir öznitelik, sınıf değeri veya kural örnek dosyada ya da şartnamede yoksa kod yazılmaz. `docs/ACIK_SORULAR.md` dosyasına yazılır, kullanıcıya ve bana sorulur.
11. **Var olan dosyayı baştan yazma:** AI Studio'da bir dosyayı değiştirirken yalnız ilgili bölüm değişir. Toplu yeniden yazım yok. Geçen testler kırmızıya dönerse commit yapılmaz.
12. **Çalışma anında ağ yok:** Testlerde `fetch` çağrısı yakalanırsa test kırılır (K91 testi).
13. **Kişisel veri:** Depoya ve fikstürlere T.C. no, ad, telefon, e-posta girmez. `stripPersonalData` testinde sahte değerler kullanılır.
14. **TypeScript `strict: true`, `any` yasak.** MAKS no `string` veya `bigint` (N33). Koordinatlar mm tamsayı (`bigint` veya güvenli tam sayı).
15. **Her yeni AI Studio oturumunun ilk işi** `docs/KARARLAR.md` (Ek-A) ve `docs/ADIM_NOTU.md` dosyalarını okumak. AI Studio uzun oturumlarda bağlamı kaybedebilir; doğruluk kaynağı repo içindeki bu dosyalardır.

### 4.5 Benim taahhüdüm

- Her kontrolde yalnız gerçekten çalıştırdığım şeyi "geçti" diye yazarım. Çalıştıramadıysam "çalıştırılamadı" yazarım.
- Bulgularımı dosya:satır ve kanıtla veririm. Görüş ile kanıtı ayırırım.
- Kendi hatalarımı ilk sırada düzeltirim (CLAUDE10 ve 11'de yaptığım gibi).
- Gemini'nin kontrol raporlarımda haksız bulduğu bir madde varsa, kullanıcının 11. tur kuralı geçerli: Gemini beni uyarır; ikna edemezse kullanıcıya söyler.

---

## 5. QWEN HAKKINDA GÖRÜŞÜM (her tur)

Bu tur QWEN12 dosyası **yok**. Katkı yok; puan **0.75**. Verilen görev (gerçek fonksiyonları çağıran test dosyası) yapılmadı.

AI Studio'ya geçişle birlikte Qwen'e önerim: Kod yazılmaya başlandığında, belirli bir modül için bağımsız test vektörleri üretsin, örneğin Helmert için elle çözülmüş 4–5 noktalı örnekler. Bunlar Gemini'nin testlerine ikinci bir doğrulama kaynağı olur.

---

## 6. YENİ DİREKTİFLER

- **D-20 — Oy önermesi değişmez.** Bir oylamanın konusu, açıldığı turdaki metinle birebir kalır. Değişiklik yeni numarayla yapılır. Bir AI'nın oyu, oy verdiği metinden başka bir metne taşınamaz.
- **D-21 — Kod çağında doğruluk kaynağı.** Kodlama başladığı andan itibaren kural, öznitelik ve XML yapısı için tek kaynak, repo içindeki `docs/KARARLAR.md` (Ek-A), `resources/codelists/*.xml` ve `fixtures/ornek6.gml` dosyalarıdır. Bir AI'nın yeni tur belgesi bu dosyalarla çelişirse dosya geçerlidir. Değişiklik yalnız kanıtla, dosyanın kendisinde ve gerekçesiyle yapılır.
- **D-22 — Kanıtsız "hazır" yok.** Bir M adımı ancak test çıktısı (sayılarıyla) ve Claude kontrol raporu "bloklayıcı 0" dediğinde "tamamlandı" sayılır. "TANIMLI / KODLANMADI / KODLANDI-TEST EDİLDİ / KONTROL EDİLDİ" dışında durum etiketi kullanılmaz.

---

## 7. KULLANICIYA NOT — AI STUDIO İLE BAŞLARKEN

1. **İlk mesaj:** `AISTUDIO_BASLANGIC_TALIMATI.md` metnini AI Studio'da projenin ilk mesajı (veya sistem talimatı) olarak yapıştır.
2. **AI Studio projesine yüklenecekler:**
   - `claude_uygulama_sartnamesi_v3.md`
   - bu dosya (`CLAUDE12.md`, Ek-A için)
   - `Ornek6-M-70125626-A.gml` (TKGM'nin kamuya açık örneği)
   - 14 kod listesi XML'i (kamuya açık)

   **Yüklenmeyecek:** 18 gerçek kabul dosyası ve ret dosyası.
3. **İlk görev olarak yalnız M0'ı iste.** Ekran ve 3B görünüm sonra gelir. M0'ın sonunda bana "kontrol et" dersin.
4. **Kontrol ortamı:** Node.js ve Git kurulumu ile GitHub bağlantısı gerekiyor (§4.3). Bunlar hazır olmadan kontrol edemem; olmazsa AI Studio'dan ZIP indirip proje klasörüne koyabilirsin.
5. Bu tur Gemini'nin belgesinde (GEMINI12) tablolar yine bozuldu. AI Studio'da da aynı şey olabilir. **Tek gerçek koruma, testlerin ve altın dosyanın repo içinde olmasıdır.** Talimat metni bunu zorunlu kılıyor.

---

# Ek-A — KESİN KARAR LİSTESİ (Kodlamanın tek kural kaynağı; repo içinde `docs/KARARLAR.md`)

> Kaynaklar: normatif v3 (`claude_uygulama_sartnamesi_v3.md`), 6 resmi TKGM örneği, 14 kod listesi, Kılavuz S.S.S., 18 gerçek kabul dosyasının ölçümleri (CLAUDE6–CLAUDE11 N1–N36). Burada olmayan bir şey için normatif v3'e bakılır; v3'te de yoksa **sorulur, uydurulmaz**.

## A.1 Dosya

- CityGML 2.0 + GML 3.1.1 (`http://www.opengis.net/gml`).
- UTF-8, **BOM'suz**, satır sonu CRLF. İlk satır `<?xml version="1.0" encoding="utf-8"?>`.
- Dosya adı `M-<constructionID>.gml`. Dosyada tam 1 `bldg:Building`.
- `srsName="EPSG:5253…5259"` ve `srsDimension="3"` **yalnız** `gml:Envelope` üzerinde.
- Koordinat sırası Y(doğu) X(kuzey) Z(ortometrik, gerçek kot; yerel 0 tabanlı kot yasak).
- **Üretim:** `gml:posList`, 3 ondalık. **Okuma:** `pos` ve `posList`, 1–12 ondalık (>3 hane BİLGİ).

## A.2 Kimlik ve adlar

- `gml:id` = önek + `_` + küçük harf uuid (uuidv5, deterministik).
  - Nesne önekleri: `MB_ K_ BB_ BBK_ OA_ BBKIY_ OAIY_ BLKN_ TRS_ MBG_ KAPI_ PEN_`
  - Poligon önekleri: `Floor_ Wall_ Roof_ InteriorWall_ Ceiling_ Ground_ OuterFloor_ OuterCeiling_ Lod1Poligon_ Lod0FootPrint_ Lod0RoofEdge_ Door_ Window_`
  - Halka önekleri: `LinearRing_ DoorLinearRing_ WindowLinearRing_`
- `*Surface`, `MultiSurface`, `Solid`, `CompositeSolid`, `MultiCurve`, `LineString` elemanlarına **gml:id verilmez.** Polygon'a `gml:name` verilmez.
- `constructionID` = `<TaşınmazKimlik>-<Harf>` (blockName "-1" olsa bile harf korunur).
- Adlar:
  - Bina: `Mimari Bina_<constructionID>`
  - MBG: `Mimari Bina Grup_<constructionID>`
  - Kat: `Kat_Z`, `Kat_<n>`, `Kat_-<n>`
  - Oda: `<blockName>_<entrance; boşsa -1>_<BB no>_<partUsage Türkçe etiketi>` (Ornek6: `-1_-1_1_Oda`)
- Sınıflar:
  - `bldg:class`: `MimariBina`, `BagimsizBolumKisim`, `OrtakAlan`, `Balkon`. Teras değeri **[DOĞRULANMALI]**.
  - `grp:class`: `Kat`, `MimariBinaGrup`.
  - BB (`gen:GenericCityObject`) için sınıf/işlev değerleri **Ornek6'dan birebir alınacak** (doğrulanmadı).
- `xlink:href="#<gml:id>"` (başında `#`).

## A.3 Öznitelik beyaz listesi (Ornek6, `gen:*Attribute` adı:tipi)

`additionalNote:string`, `architecturalPlanID:string`, `architecturalProjectConfirmationDate:date`, `blockName:string`, `blockNumber:string`, `buildingHeight:double`, `buildingType:int`, `calculatedArea:double`, `constructionID:string`, `doorUsage:int`, `elevatorCount:int`, `entrance:string`, `geometrySuitability:int`, `independentSectionCalculatedArea:double`, `independentSectionCardinalDirection:int`, `independentSectionCount:int`, `independentSectionNumber:string`, `independentSectionObjectReference:string`, `independentSectionPlanGrossArea:double`, `independentSectionPlanNetArea:double`, `independentSectionUsage:int`, `integrationState:int`, `maksIdentityNumber:int`, `maksIntegrationState:int`, `maksNumaratajIdentityNumber:int`, `parcelNumber:string`, `partCount:int`, `partUsage:int`, `planArea:double`, `propertyLot:string`, `registeredFloorDefinition:string`, `registeredInstallation:string`, `registeredQuality:string`, `roofProjectionArea:double`, `storeyNumber:string`, `storeyUsage:int`, `takbisNeighbourhoodReference:int`, `takbisPropertyIdentityNumber:int`, `tenderRegistrationNumber:string`, `totalIndependentSectionCount:int`, `volume:double`, `windowUsage:int`.

- Ortak alanı olan dosyalarda ek olarak: `commonAreaUsage:int`, `storeyObjectReference:string` (Sincan). Tip ve yer Ornek1/2'den doğrulanacak.
- Kat sayıları `bldg:storeysAboveGround` / `bldg:storeysBelowGround` (CityGML elemanı).
- **Yazılmayanlar:** `measuredHeight`, `lod2Solid`, Texture/Appearance, `verticalDatum`, `storeyHeight`, `calculatedVolume`, `grp:function`.

## A.4 Sabitler

- **Bina:** `buildingType 1001`, `geometrySuitability 1006`, `maksIntegrationState 1003`, `tenderRegistrationNumber` ve `architecturalPlanID` boş (`<gen:value/>`).
- **BB:** `geometrySuitability 1001` (alan uyumsuzluğunda 1002 + additionalNote), `integrationState 1004`, `maksIntegrationState 1003`, `takbisPropertyIdentityNumber -1`, `blockName` (yoksa `-1`), `entrance` (yoksa boş).
- **BBK ve balkon:** `geometrySuitability 1001`.
- **Genel:** `additionalNote` "-" (özel not yoksa).
- **Kod değerleri her zaman gömülü kod listesinden:**
  - doorUsage: 1001 Bina giriş, 1002 Dış, 1003 BB kapısı, 1004 Kısım kapısı
  - windowUsage: 1001 Dış, 1002 İç
  - roomInstallationUsage: 1001 Merdiven, 1002 Sütun, 1003 Asansör
  - independentSectionUsage: 1001 Mesken, 1002 Ticari, 1003 Çoklu kat, 1004 Çatı arası, 1005 Depo, 1006 Eklenti
  - partUsage: 1001 Oda, 1002 Banyo, 1003 Salon, 1004 Mutfak, 1005 Kiler, 1006 Tuvalet, 1008 Hol, 1009 Dükkan … (listeden)

## A.5 Geometri

- **Açıklık deliği:** Duvar poligonunun dış halkasına hiçbir zaman değmez. Üretimde ≥ 10 mm uzak; doğrulamada < 1 mm HATA, 1–9 mm BİLGİ.
- **Kapı deliği alt kenarı:** zFloorTop + 10 mm (profil A10) veya + 50 mm (B50 / C50).
- **Kapı nesnesi:** Varsayılan olarak delikle aynı; C50 profilinde zFloorTop'tan başlar.
- **Kapı yüksekliği:** Projeden; yoksa 2100 mm + mavi rozet.
- **Pencere:** Projeden; yoksa Rehber varsayılanları (mesken tavana 500 / yükseklik 1300; ticari tabandan 100 / tavana 100; ıslak hacim tavana 500 / yükseklik 500) + rozet.
- **Açıklık temsilleri:** LoD2, kat, BB küveti ve iki komşu mekân. Aynı genişlik ve aynı Z aralığı. BB kapısı hem OA'da hem BBK'da bulunur.
- **Kat biçimi:** A (varsayılan) / B / C, tanımları CLAUDE8 N26.
- **V-124:** Küvet yan duvarının alt kotu, döşeme alt kotu ile üst kotu arasındadır (N36).
- **Döşeme kalınlığı:** Kesitten zorunlu (gözlenen 100–300 mm; boşsa 200 mm önerisi).
- **GroundSurface:** Her zaman 1 adet, `gml:name` "Zemin". Üretimde CW; doğrulamada CCW BİLGİ.
- **LoD0:** FootPrint z = TIC en üst z. RoofEdge = en üst kat tavanı.
- **LoD1:** CompositeSolid.
- **TIC:** Aplikasyon köşeleri; **30 cm sıklaştırma yok**.
- **Oda yüksekliği:** ≥ 1,5 m (en yüksek nokta).

## A.6 Hesaplar

- Kısım `calculatedArea` = Floor_ net alanı.
- `volume` = alan × oda yüksekliği (düz tavan). Eğik tavanda tavan düzlemleriyle kesilmiş 2.5B prizma toplamı.
- BB `independentSectionCalculatedArea` = küvetin alt taban alanı.
- Balkon alanı = üst yüz alanı.
- `roofProjectionArea` = çatı poligonlarının XY birleşim alanı (saçak dahil). İçe alınan dosyada ≤ %5 fark BİLGİ.
- `buildingHeight` = beyan (kot noktasından saçağa); geometriden hesaplanıp üzerine yazılmaz.
- **Arsa payı:**
  - string `pay/payda`, BigInt.
  - BB kimliği = (blockName, entrance, BB no, temiz pay, normalize nitelik).
  - Toplam ≠ 1: BİLGİ.
  - Payda 0, pay > payda veya biçim hatası: HATA. Pay = 0: UYARI. Boşluk: BİLGİ.
  - Aynı no + farklı pay/nitelik: V-212 UYARI.
- **Çok parçalı BB:** Ortak alanlar BB'de. İkincil parça alanı `repeat` (varsayılan) veya `minusOne`.
- **Onay tarihi:** Zorunlu girdi; yoksa belge tarihi; o da yoksa `1900-01-01` (S.S.S. 27) + rozet.

## A.7 İlkeler

- **K88:** BB no, pay, nitelik, eklenti, kat tanımı ve MAKS no hiçbir zaman otomatik üretilmez veya düzeltilmez. Liste beyandan aynen alınır; uygulama yalnız karşılaştırır.
- **K91:** TKGM'ye ve herhangi bir dış servise otomatik istek yok. Çalışma anında Gemini API yok.
- **K83:** Kişisel veri (sender) okunduğu anda silinir.
- **Ciddiyet:** Yeni HATA kuralı ancak resmi metin veya ret kanıtıyla eklenir. Elimizdeki tek ret kanıtı **V-202** (bina gs ≠ 1006, buildingType ≠ 1001, tender/plan dolu).
- **K70:** Düzeltme modunda kaynak dosyanın biçimi korunur (pos/posList, hane, kat biçimi, kapı stili, GroundSurface varlığı).
- **Kanonik özet** (SHA-256): Geometri + öznitelikler + profil ayarları + kod listesi özeti + şema sürümü; arayüz durumu hariç. Blok başına ayrı özet.

---

**Kaynaklar (bu tur):**
- [Build apps in Google AI Studio — Gemini API docs](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [Google AI Studio Build Review — therundown.ai](https://www.therundown.ai/tools/google-ai-studio-build)
- [AI Studio Build GitHub import — DEV Community](https://dev.to/lenabrooks/google-ai-studio-build-can-now-import-github-repos-what-that-means-for-existing-apps-cj8)
