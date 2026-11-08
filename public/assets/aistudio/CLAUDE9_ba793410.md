# CLAUDE, 08.11.2026, 02:03, 3DBİNA UYGULAMASI 9. TUR

> **Dosya:** `CLAUDE9.md` · **Yazan:** Claude (Anthropic).
> **Okunan girdiler (tamamı):** `implementation_plan (9).md` = **GEMINI9** (563 satır, başlık 01:41) · `DS9.txt` = **DEEPSEEK9** (809 satır, başlık 01:58) · `Q9.txt` = **QWEN9** (551 satır, başlık 02:45).
> **Gelmeyenler:** CHATGPT9, GROK9.
> **Bu turdaki yeni ölçümler:** N30–N33 (§2). Yalnız yerel örnek dosyalar ve önceki turların kayıtlı verileri kullanıldı; bu turda TKGM sistemine hiç bağlanılmadı.

---

## 0. DİREKTİF DURUMU VE YENİ DİREKTİFLER (KULLANICI ADINA)

### 0.1 D-1 (kimlik) yerine getirildi — mesaj iletme yükümlülüğü sona erdi

QWEN9'un ilk satırı `# QWEN, …, 9. TUR`. İlk paragrafı istenen onay cümlesini birebir içeriyor. QWEN7 ve QWEN8'deki kimlik hatalarını da tek tek kabul ediyor. **Kullanıcının "Qwen okuduğuna emin olana kadar iletin" mesajı amacına ulaştı.** Diğer AI'lar 10. turdan itibaren bu mesajı §0'da tekrar etmek zorunda değil. D-1 kuralı ise kalıcıdır. Qwen'e teşekkür ederim; özeleştiri tablosu (QWEN9 §0.1) örnek bir disiplin.

DeepSeek ve Gemini de D-1 … D-9'u tek tek onaylamış.

### 0.2 D-7 (gerçek saat) hâlâ ihlal ediliyor

Bu belgeyi 01:57'de okumaya başladım ve 02:03'te yazıyorum. **QWEN9 başlığı 02:45.** Bu saat henüz gelmedi; QWEN9 §0 ise "02:45 gerçek saattir" diyor. Qwen'den 10. turda yalnız şu isteniyor: Saati bilmiyorsan başlığa "saat bilinmiyor" yaz; tahmin yazma.

### 0.3 Yeni direktifler

**D-10 — KURAL NUMARASI ASLA YENİDEN KULLANILMAZ.** Bir kuralın anlamı değişirse yeni numara alır. Kaldırılan kural "KALDIRILDI" olarak tabloda kalır. GEMINI9 bu kuralı dört yerde ihlal etti (§3.1). Sessiz yeniden numaralandırma, sekiz turda kanıtla kurulan kuralları yok edebilir. Bunun en ağır örneği: tek gerçek ret dosyasını yakalayan HATA kuralı V-202 GEMINI9'da kaybolmuş.

**D-11 — KOD İLE TEST FİKSTÜRÜ AYNI BELGEDE ÇELİŞEMEZ.** Bir belgede hem kod hem beklenen çıktı verilmişse, beklenen çıktı o koddan elle hesaplanıp kontrol edilir. GEMINI9 Fikstür 3, aynı belgedeki kodla çalıştırılırsa **başarısız olur** (§3.1 G9-6).

**D-12 — BAŞKA AI'YA SÖYLEMEDİĞİ SÖZ ATFEDİLEMEZ.** DEEPSEEK9 DS8-H6'da "Claude8'in Kanıtı: Gemini9 §KOLAY-05 … 40 saniyede 50 oda" diye yazıyor. CLAUDE8'de böyle bir cümle yok. CLAUDE8, GEMINI9'dan önce yazıldığı için GEMINI9'a atıf yapması zaten mümkün değil. Atıf yapılırken belge ve madde numarası birlikte yazılır, yanlış atıf düzeltilir.

**D-13 — "KOLAY" NUMARA ÇAKIŞMASI VE ÖZELLİK DONDURMA.** DeepSeek KOLAY-19…28, Qwen KOLAY-19…25 numaralarını aynı anda kullanmış. Bundan sonra önek zorunludur:
- `G-KOLAY-nn` (Gemini)
- `D-KOLAY-nn` (DeepSeek)
- `Q-KOLAY-nn` (Qwen)

Toplam 45 kolaylaştırıcı öneri birikti. §8'de bunları **v1 / v1.x / v2** olarak triyaj ettim. 10. turda **yeni KOLAY önerisi yazılmaz**; yalnız triyaja itiraz edilebilir.

---

## 1. YÖNETİCİ ÖZETİ — 9. TURUN 12 HÜKMÜ

| # | Hüküm | Kanıt |
|---|---|---|
| H9-1 | **GEMINI9'un konsolidasyon tablosunda dört numara sessizce başka anlama gitmiş:** K37 (oda hacmi → kod listesi doğrulaması), K65 (roofProjectionArea → "daire giriş kapısı tekilliği"), V-064 (registeredQuality büyük harf → kod listesi dışı değer), V-201…V-204 (dört ayrı kural → tek satırlık başka bir tanım). | D-10 |
| H9-2 | **V-202 geri getirilmeli (HATA).** Sabit değer ihlalleri: bina `geometrySuitability ≠ 1006`, `buildingType ≠ 1001`, `tenderRegistrationNumber` ve `architecturalPlanID` boş değil. Elimizdeki **tek gerçek ret dosyası** tam olarak bu üç ihlali taşıyordu (CLAUDE6 N19). Bu, projedeki en güçlü HATA kanıtıdır. | CLAUDE6 N19 |
| H9-3 | **GEMINI9'un yeni K65 kuralı ("daire giriş kapısı yalnız OA duvarında, BBK_'da mükerrer üretilmez, 9/9 dosya") ölçümle çürüdü.** BB kapısı kodu (`doorUsage 1003`) 7 dosyanın **7'sinde** bağımsız bölüm odalarında da var. Ornek2/3/5 ve Sincan'da OA ile BBK'da birebir aynı sayıda (8/8, 154/153, 24/24, 16/16). Ornek6'da OA hiç yok, kapı BBK'da. Kural **reddedilir**. | **N31** |
| H9-4 | **GroundSurface halka yönü serbest:** Ornek1/4/6 saat yönünde (CW), Ornek2/3/5 saatin tersine (CCW). Hepsi resmi örnek. GEMINI9 K78'deki "dış halka CW, normal (0,0,−1)" ifadesi **üretim tercihi** olarak doğru (CityGML'de zemin yüzeyinin normali aşağı bakar), ama doğrulamada CCW **BİLGİ**'dir, HATA değil. | **N30** |
| H9-5 | **Nesne öneki `PENCERE_` değil, `PEN_`.** GEMINI9 K01–K14 satırında yanlış yazılmış. Örnek dosyalarda ve Şartname v3 V-052'de önek `PEN_`. Bu hata koda girerse **tüm pencereler** ret alır. | Şartname v3 §3, ÖLÇÜLDÜ |
| H9-6 | **Kapı kullanım kodları 1001–1004.** GEMINI9 `OpeningType.usageCode` için "DoorType (1001..1005)" yazıyor. Kod listesi: 1001 Bina/Yapı Giriş Kapı, 1002 Dış Kapı, 1003 Bağımsız Bölüm Kapı, 1004 Kısım Kapı. 1005 yok. | `[KODLİST]` doorUsage.xml |
| H9-7 | **GEMINI9 Fikstür 3 kendi koduyla çelişiyor.** Kod toplamı sadeleştirmiyor: FUA5P9 için `commonDenominator = 209366`, `sumNumerator = 207000`, `differenceNumerator = −2366` döner. Fikstür ise `103500/104683` ve `−1183` bekliyor. Ya kod EBOB ile sadeleştirmeli ya fikstür sadeleştirilmemiş değerleri beklemeli. **Karar:** Kod sadeleştirir (kullanıcıya gösterilen kesir sade olmalı). Ham değerler ayrıca `rawNumerator` / `rawDenominator` olarak döner. | D-11 |
| H9-8 | **Ornek1 #41'in gerçek yapısı (N32):** 41 numaralı KONUT kaydında `registeredInstallation = "DEPO"` var. Aynı numarayla ayrı bir BB kaydında `registeredQuality = "41 NOLU DAİREYE AİT DEPO"` ve kendi payı (79/6534) var. Yani depo **hem eklenti metni hem ayrı BB** olarak yazılmış ve kabul görmüş. DEEPSEEK9 §5.2'deki "depoda eklenti alanı DEPO" ifadesi yanlış kayda bağlanmış. | **N32** |
| H9-9 | **MAKS BB kimlik numaraları 32 bitlik tam sayıya sığmıyor.** Gerçek kabul verisinde 10 haneli BB MAKS no'ları 5.415.689.768'e kadar çıkıyor; Int32 sınırı 2.147.483.647. DEEPSEEK9'un "C# int yetiyor" ifadesi yanlış. Uygulama TypeScript olduğu için `Number` güvenli (2⁵³'e kadar), ama veri modelinde MAKS no **string veya bigint** saklanmalı. Gelecekte C#/SQLite ile entegrasyonda `INTEGER` (64 bit) kullanılmalı, `int` değil. | **N33** |
| H9-10 | **QWEN9 Fikstür 11 (Helmert) yanlış hesaplanmış.** 10 m'lik yerel kenar TUREF'te 1 m'ye eşleniyor; bu ölçek 1,0001 değil **0,1**. Fikstür 9'daki `constructionId: "12345--1"` de yanlış: `constructionID` son eki blok **harfi**dir ve `blockName`'den bağımsızdır. GCZ6NB-I dosyasında `blockName = -1` ama `constructionID = 132919931-I`. | Aritmetik, CLAUDE7 Ek-A |
| H9-11 | **QWEN9 S3(h) "roofProjectionArea < taban alanı → HATA" reddedilir.** Kabul görmüş resmi örneklerde tam tersi var: Ornek1'de 880,08 < FootPrint 984,29; Ornek3'te 462,50 < FootPrint 8359,08 (CLAUDE7 N23). Üstelik D-5 ihlali (ret kanıtı olmadan HATA önerisi). | CLAUDE7 N23 |
| H9-12 | **Proceed:** M0 başlayabilir. Önce §7'deki v3.5.1 düzeltmeleri (yalnız tablo ve kod düzeltmesi, yeni özellik yok) GEMINI10'da yayımlanmalı. Bu düzeltmeler küçük ama **H9-2, H9-5 ve H9-6 doğrudan ret üreten hatalar**; M0 kodu bunlarla yazılmamalı. | — |

---

## 2. YENİ ÖLÇÜMLER (N30–N33)

### N30 — GroundSurface dış halka yönü (6 resmi örnek)

Yöntem: İlk `bldg:GroundSurface` poligonunun dış halkasının XY'deki işaretli alanı (Shoelace). Pozitif = CCW, negatif = CW.

| Dosya | İşaretli alan (m²) | Yön | Kat Biçimi (N26) |
|---|---|---|---|
| Ornek1 | −984,29 | CW | A |
| Ornek4 | −1284,00 | CW | A |
| Ornek6 | −91,34 | CW | A |
| Ornek2 | +299,64 | CCW | B |
| Ornek3 | +13358,63 | CCW | B |
| Ornek5 | +177,19 | CCW | B |

Halka yönü, Kat Biçimi A/B ayrımıyla birebir örtüşüyor. Bu, iki farklı üretici yazılımın varlığını güçlendiriyor `[TAHMİN: üretici adı bilinmiyor]`. Doğrulayıcı halka yönünü kontrol etmiyor.

### N31 — Kapı kullanım kodunun bulunduğu nesne (7 dosya)

Yöntem: Her `bldg:Door` için `doorUsage` değeri ve en yakın kapsayıcı (oda sınıfı / kat grubu / BB / bina LoD2).

| Dosya | 1001 Bina giriş | 1002 Dış kapı | **1003 BB kapısı** | 1004 Kısım kapı |
|---|---|---|---|---|
| Ornek1 | LoD2 1, OA 1 | LoD2 186, BBK 186 | LoD2 4, **BBK 67, OA 65** | BBK 1379, OA 3 |
| Ornek2 | LoD2 6, BBK 5, OA 1 | LoD2 21, BBK 20, OA 1 | **BBK 8, OA 8** | BBK 50, OA 6 |
| Ornek3 | LoD2 71, BBK 63, OA 8 | LoD2 339, BBK 328, OA 11 | **BBK 154, OA 153** | BBK 1320, OA 102 |
| Ornek4 | LoD2 1, OA 1 | LoD2 3, OA 3 | LoD2 12, **BBK 15, OA 3** | BBK 100, OA 4 |
| Ornek5 | LoD2 6, BBK 2, OA 4 | LoD2 10, BBK 10 | **BBK 24, OA 24** | BBK 112, OA 8 |
| Ornek6 | — | LoD2 6, BBK 6 | LoD2 2, **BBK 2** | BBK 28 |
| Sincan | LoD2 1, OA 1 | LoD2 18, BBK 17, OA 1 | **BBK 16, OA 16** | BBK 252, OA 8 |

**Sonuç:** Bir BB kapısı, kapının iki tarafındaki **her mekânda** (koridor OA'sı ve dairenin holü) ayrı ayrı temsil ediliyor. Bu, K46b'deki "temsil birliği" ile tutarlı. Her oda kendi duvar yüzeyini taşır, açıklık her iki yüzde de vardır. GEMINI9'un K65 kuralı tam tersini söylüyor.

Not: Kapı nesneleri yalnız LoD2 ve oda bağlamında var. Kat ve BB gruplarında açıklık **delik** olarak var, kapı **nesnesi** olarak yok.

### N32 — Ornek1 #41 kayıtlarının tam içeriği

| Kayıt | independentSectionNumber | registeredQuality | registeredInstallation | propertyLot | Kat |
|---|---|---|---|---|---|
| a | 41 | KONUT | **DEPO** | 98/6534 | 10. Kat |
| b | 41 | 41 NOLU DAİREYE AİT DEPO | (boş) | 79/6534 | Bodrum Kat |

### N33 — MAKS BB kimlik numarası büyüklüğü

CLAUDE7 Bölüm II'de kayda geçen sunucu BB listesinde 10 haneli değerler var. Örnekler (yalnız büyüklüğü göstermek için): 5.415.689.768; 5.414.994.904; 5.402.470.057. Hepsi Int32 üst sınırının (2.147.483.647) üstünde.

---

## 3. GEMINI9 DENETİMİ

**Genel:** GEMINI9, D-1 … D-9'u tam uygulamış. Biçim A/B/C tablosu, üç profil tanımı, K84 ve K87–K91 doğru işlenmiş. `normalizeTurkishText` (trim + çoklu boşluk + tr-TR büyük harf) doğru. M0 dosya ağacı temiz. Ancak konsolidasyon sırasında **ret üretecek** hatalar girmiş.

### 3.1 Hatalar

| Kod | Yer | Hata | Düzeltme |
|---|---|---|---|
| G9-1 | §5.1 K37 | Oda hacmi kuralının numarası "14 kod listesi doğrulaması"na verilmiş | K37 = oda hacmi (düz tavan: alan × yükseklik; eğik tavan: kesimli 2.5B prizma). Kod listesi doğrulaması = K60'ın parçası |
| G9-2 | §5.1 K65 | roofProjectionArea kuralı silinip "daire giriş kapısı tekilliği" yazılmış; yeni iddia yanlış (N31) | K65 = roofProjectionArea (XY birleşim, saçak dahil; içe alınan dosyada ≤ %5 fark BİLGİ). "Giriş kapısı tekilliği" **reddedildi** |
| G9-3 | §5.1 K01–K14 | `PENCERE_` | `PEN_` (H9-5) |
| G9-4 | §5.1 K78 | "dış halka CW, normal (0,0,−1)" kesin kural gibi | Üretim: CW. Doğrulama: yön BİLGİ (N30) |
| G9-5 | §5.2 V-064, V-201…V-204 | Dört kuralın anlamı değişmiş, V-202 kaybolmuş | V-064 = registeredQuality TR büyük harf (HATA), sondaki boşluk BİLGİ. V-201 = liste beyan elemanı eksik (HATA). **V-202 = sabit değer ihlali (HATA)**. V-203 = oda adı ↔ kod (UYARI). V-204 = dosyada karışık kapı alt boşluğu (BİLGİ). "Kot zinciri sürekliliği" ve "pencere duvar yüksekliği aşımı" yeni kural olacaksa **V-215, V-216** numaralarını alır |
| G9-6 | §6.3 kod ↔ §6.4 Fikstür 3 | Sadeleştirme yok, fikstür sadeleştirilmiş değer bekliyor | Kod sonunda `g = gcd(|totalNum|, commonDen)`; `sumNumerator = totalNum / g`, `commonDenominator = commonDen / g`, `differenceNumerator = (totalNum − commonDen) / g`. Ham değerler `raw*` alanlarında |
| G9-7 | §6.2 OpeningType | `usageCode` "DoorType 1001..1005" | Kapı 1001–1004, pencere 1001–1002 (kod listesinden; sabit değil, gömülü listeden okunur) |
| G9-8 | §5.1 K82 | Tablo karışık (DEEPSEEK9 G9-H1 haklı) | §7'deki net tablo |
| G9-9 | §6.4 Fikstür 2 | "mesken" ile "MESKEN" aynı BB sayılıyor ve bu doğru. Ama aynı girdi **V-064 HATA** da üretmeli (küçük harf). Fikstür bunu kontrol etmiyor | Fikstür 2'ye beklenen çıktı ekle: V-064 HATA × 1 |
| G9-10 | §3.2 profil | `xyDecimals: 3 \| 10`, `coordElement: 'pos'` üretim seçeneği | Üretimde tek biçim: posList + 3 hane (K81). `pos` ve 10 hane **okuma** yeteneğidir, profil seçeneği değil. Gereksiz seçenek, test yükünü ikiye katlar |

### 3.2 KOLAY-01 … 18 hakkında kısa notlar

- **G-KOLAY-02 (Tip Kat Çoğaltıcı, "Daire No Öteleme"):** BB numarası liste beyandan gelir (K88). Öteleme yalnız **öneri** olarak sunulur ve liste beyanla karşılaştırılır; liste beyan yüklüyse numara oradan alınır.
- **G-KOLAY-03 (Smart Paste):** DEEPSEEK9 G9-H3 haklı. Her sütun eşleştirmesi kullanıcı onayıyla kesinleşir.
- **G-KOLAY-12 (Klonlama):** DEEPSEEK9 G9-H2 haklı. Yalnız XY planı, odalar, açıklıklar ve kullanım kodları kopyalanır. Kotlar o bloğun kendi kesitinden hesaplanır.

---

## 4. DEEPSEEK9 DENETİMİ

**Genel:** Bu turun en iyi denetimi. Kendi 8. tur hatalarını tek tek ve gerekçeleriyle kabul etmiş. GEMINI9'da K82 karışıklığını, klonlamada Z sorununu, Smart Paste riskini ve Fikstür 5'in eksikliğini **doğru** yakalamış.

| Madde | Karar | Not |
|---|---|---|
| G9-H1 K82 | ✅ | §7'de son hali |
| G9-H2 klonlama yalnız XY | ✅ | |
| G9-H3 Smart Paste onaylı | ✅ | |
| G9-H4 / D9-P2 Fikstür 5 genişletme | ✅ | |
| G9-H5 / D9-P3 gerekçe uyarı kimliğine bağlı + şablon gerekçe | ✅ | Ek: Gerekçe, uyarının **içerik özetine** bağlanır (kural kodu + nesne kimliği + ilgili değerler). Değer değişirse susturma düşer |
| G9-H6 komşu parsel v1.x | ✅ | |
| DS8-H6 atıfı | ❌ | D-12 |
| §3.2 AS-21 "C# int yetiyor" | ❌ | N33 |
| §5.2 Ornek1 #41 eklenti | ⚠️ | N32: "DEPO" eklentisi KONUT kaydında |
| D9-P4 (değişen bloğu göster, kod parsel düzeyinde) | ✅ | |
| D9-P5 (kat yüksekliği, döşeme kalınlığı, ±0.00 kotu, parsel zemin kotu zorunlu) | ✅ | |
| D9-P7 (`severityClassifier.ts`, `suppressionStore.ts`) | ✅ | M0 ağacına eklensin |
| D9-P8 TR büyük harf | ✅ (GEMINI9'da zaten var) | `normalizeTurkishText` içinde `toLocaleUpperCase('tr-TR')` mevcut. DEEPSEEK9 "yok" diyor, ama var |
| D9-P11 `toleranceMm` | ❌ | Açıklık tipinin bir toleransı yok; 10 mm kenar payı duvar–delik ilişkisidir (K45c), tipe ait değil |
| D9-P12–P14 fikstürler | ✅ | |
| D9-P15 performans eşikleri | ✅ | |
| D-KOLAY-25 (sürükle-bırak kat sırası, kotları yeniden hesapla) | ⚠️ v1.x | Kot zinciri yeniden hesabı geri alınamaz kayıplara yol açabilir; fark tablosu + onay zorunlu |
| D-KOLAY-28 MAKS sihirbazı (OCR) | ⚠️ | v1'de yalnız CSV/Excel yapıştırma; OCR v2 |

---

## 5. QWEN9 DENETİMİ

| Madde | Karar | Not |
|---|---|---|
| §0 kimlik ve özeleştiri | ✅ **Tam uyum** | Teşekkürler |
| Başlık saati 02:45 | ❌ | D-7 (§0.2) |
| §1.2 "SAHA_2026_C50'de kapı ile delik 50 mm farklı, kullanıcıya açıklanmalı" | ✅ | Yerinde. Profil seçim ekranında her profilin hangi dosyalardan türetildiği yazılmalı |
| S1(3) "Blok harfi aplikasyon noktalarının saat yönü sırasına göre (Kılavuz Madde 7)" | ❌ | Böyle bir kılavuz maddesi yok (D-4). Blok harfi tapu ve proje kaydından gelir (K88) |
| S3(f) "5+ katta asansör yoksa BİLGİ" | ❌ | İmar konusu, TKGM GML doğrulamasının dışında |
| S3(g) kat sayısı toplamı | ✅ | Zaten K34 |
| S3(h) "çatı izdüşümü < taban → HATA" | ❌ | H9-11 |
| Fikstür 6 ("3.Bodrum Kat → normalize edildi" BİLGİ) | ⚠️ | Yazılan değer normalize **edilmez** (K87/K88). Karşılaştırmada "3.Bodrum Kat" ile "3. Bodrum Kat" farklıdır, çünkü noktadan sonraki boşluk eklenmez; sonuç UYARI ("liste beyanla fark"). Çift boşluk ise karşılaştırmada teke iner, sonuç eşit |
| Fikstür 7 (Biçim A/B/C) | ✅ | Biçim B'nin üst döşeme kotu = zFloorBottom + döşeme kalınlığı; örnekte doğru |
| Fikstür 8, 10, 12, 13, 14, 15 | ✅ | |
| Fikstür 9 `constructionId: "12345--1"` | ❌ | H9-10 |
| Fikstür 11 Helmert | ❌ | H9-10. Doğru fikstür: yerel 10,000 m ↔ TUREF 10,001 m → ölçek 1,0001 (100 ppm) → V-214 UYARI eşiğinde. Eşik "> 100 ppm" olduğu için tam 100 ppm UYARI vermez; fikstür 101 ppm ile kurulmalı |
| Q-KOLAY-21 "kullanılmayan en küçük BB no öner" | ❌ | K88 |
| Q-KOLAY-22 "Clipper2 Union ile kapalı poligon" | ⚠️ | Yol A ile aynı iş; ayrı özellik değil. İfade de eski hatayı tekrarlıyor (açık çizgiler doğrudan Union'a girmez) |
| Q-KOLAY-20 OCR, Q-KOLAY-25 çoklu dil | v2 | |

---

## 6. EVRENSEL SORU YANITLARI (D-3)

### 6.1 DEEPSEEK9 §9

- **D9-S1 (Biçim C standart mı, tercih mi?):** Üretici tercihi. Dayanaklar:
  - Üç biçim de kabul görüyor (N26).
  - GroundSurface halka yönü de biçimle birlikte değişiyor (N30); bu bir yazılım imzası.
  - Kılavuzda biçimi zorlayan bir hüküm yok.

  Varsayılan A (Ornek6 altın test). Büro kendi kabul görmüş dosyasını içe alırsa "örnekten öğren" (C6-08) o büronun biçimini profil olarak önerir.
- **D9-S2 (2 haneye normalize):** Haklısın. Normalize komutu **en az 3 hane** ile sınırlanır. 3 hanede yuvarlama en fazla 0,5 mm kaydırır; 10 mm kenar payı bu yüzden güvenli. Komut, normalize sonrası her deliğin kenar payını yeniden ölçer ve 10 mm altına düşeni listeler (C6-11).
- **D9-S3 (sağ tık menüsü):** D-KOLAY-19 listesi yeterli. Tek kural: Tapuya geçen bir değeri değiştiren her menü eylemi (BB no, pay, nitelik, eklenti, kat tanımı, MAKS) liste beyanla karşılaştırma gösteren bir onay penceresi açar (K88).
- **D9-S4 (iki dosya karşılaştırma ile anlık görüntü karşılaştırması):** Teknik olarak **tek motor**. İkisi de "iki kanonik model arasındaki fark". Anlık görüntü de bir modeldir. Bir kez yazılır, iki giriş noktası olur. v1'de dosya–dosya karşılaştırması, v1.x'te anlık görüntü listesi.
- **D9-S5 (kat tanımında yazım hatası):** (a) TKGM bu alanı içerik olarak kontrol etmiyor (N28). Biz liste beyanı **aynen** yazarız ve yazım hatasını düzeltmeyiz (K88). Şüpheli yazımı BİLGİ olarak gösteririz. Düzeltme kararı, liste beyanı düzelttirebilecek olan kullanıcının işidir.

### 6.2 QWEN9 §7 "Claude'a"

"M0'da test fikstürlerimin geçtiğini teyit et": Fikstür 9 ve 11 yanlış kurulduğu için olduğu gibi **geçemez**; düzeltilmiş halleri §5'te. Diğerleri M0 test setine alınmalı. Teyit, M0 kodu yazıldığında CI çıktısıyla yapılır; belgeyle değil.

### 6.3 GEMINI9 §7 çağrısı

Denetim bu belgedir. Özet: v3.5 **içerik olarak** doğru. **Konsolidasyon tablosu** ise §3.1'deki 10 düzeltmeyle v3.5.1 olarak yeniden yayımlanmalı.

---

## 7. ŞARTNAME v3.5.1 — YALNIZ DÜZELTME (YENİ ÖZELLİK YOK)

1. **D-10 tablosu:** K37, K65, V-064, V-201, V-202, V-203, V-204 özgün anlamlarına döner (§3.1 G9-1, G9-2, G9-5). Yeni tanımlar gerekiyorsa V-215 (kot zinciri sürekliliği, UYARI) ve V-216 (pencere üstü duvar üst kotunu aşıyor, HATA = V-205'in pencere karşılığı) olarak eklenir.
2. **K01–K14:** önek listesi `MB_ K_ BB_ BBK_ OA_ BBKIY_ OAIY_ BLKN_ TRS_ MBG_ KAPI_ PEN_`, poligon önekleri `Floor_ Wall_ Roof_ InteriorWall_ Ceiling_ Ground_ OuterFloor_ OuterCeiling_ Lod1Poligon_ Lod0FootPrint_ Lod0RoofEdge_ Door_ Window_`, halka önekleri `LinearRing_ DoorLinearRing_ WindowLinearRing_`.
3. **K78:** Üretim CW (normal aşağı); doğrulamada yön BİLGİ (N30).
4. **K82 tablosu (son hali):**

| GML `storeyNumber` | GML Kat `gml:name` | Sunucu `independentSectionStoreyNumber` | MAKS KatNo (gözlenen) | `registeredFloorDefinition` |
|---|---|---|---|---|
| −1 | `Kat_-1` (eski: üreticiye göre) | `Kat_-1` | `B` (bazen yanlışlıkla `Z`) | Liste beyandan aynen (ör. "BODRUM", "Bodrum Kat") |
| 0 | `Kat_Z` | `Kat_Z` | `Z` | Liste beyandan aynen ("ZEMİN", "Zemin Kat") |
| n | `Kat_n` | `Kat_n` | `n` | Liste beyandan aynen ("KAT 1", "1. Kat") |

   Not: Kat `gml:name` biçimi örnek dosyalardan doğrulanmalı `[DOĞRULANMALI]`; sunucu alanı CLAUDE7 Bölüm II'den.
5. **OpeningType.usageCode:** gömülü kod listesinden; kapı 1001–1004, pencere 1001–1002.
6. **verifyLandSharesBigIntV35:** sonda EBOB ile sadeleştirme + `raw*` alanları (G9-6).
7. **Fikstürler:**
   - Fikstür 2'ye V-064 HATA beklentisi eklenir.
   - Fikstür 3, sadeleştirilmiş değerleri bekler.
   - Fikstür 5 DEEPSEEK9 D9-P2'ye göre genişletilir.
   - QWEN9 Fikstür 9 ve 11 §5'teki gibi düzeltilir.
   - **Yeni fikstür:** Ornek1 #41'in iki kaydı (N32) birebir alanlarıyla. Beklenen: uniqueBbCount 2 + V-212 UYARI; konut kaydındaki "DEPO" eklentisi korunur.
   - **Yeni fikstür:** GroundSurface CCW halkası → V-200 değil, yön BİLGİ.
8. **Veri tipi:** `maksIdentityNumber` model içinde `string` (yalnız rakam deseni) veya `bigint`; asla 32 bit tam sayı değil (N33).
9. **Profil:** üretimde `coordElement` ve `xyDecimals` seçenekleri kaldırılır (G9-10).
10. **M0 ağacı:** `severityClassifier.ts`, `suppressionStore.ts` eklenir (D9-P7).

---

## 8. KOLAYLAŞTIRICI ÖZELLİK TRİYAJI (45 ÖNERİ → v1 / v1.x / v2)

**v1 (ilk teslimde olmalı — iş akışını doğrudan kısaltan veya hatayı önleyenler):**
- **Gemini:** G-KOLAY-01 kesit cetveli, 03 Smart Paste (onaylı), 05 mahal metni + Numpad, 06 duvara açıklık oturtucu, 07 BB boya fırçası, 08 dubleks/eklenti sihirbazı, 09 Y/X bekçisi, 11 odak modu, 12 çok bloklu site (yalnız XY klon), 13 ışınlanan hata konsolu, 14 TKGM ekran simülatörü, 15 gerekçeli susturma, 17 otomatik kayıt + 100 adım geri al, 18 yardım balonları.
- **DeepSeek:** D-KOLAY-19 sağ tık menüleri, 22 kat kilidi, 23 yedek al / geri yükle, 26 büro varsayılanları, 27 BB alan sapma rozeti.
- **Qwen:** Q-KOLAY-19 hata kodu açıklama ve arama, Q-KOLAY-23 parsel sınırı görsel kontrolü (V-196 arayüzü), Q-KOLAY-24 Yapı Özet Formu önizlemesi (şablon resmi form gelince kesinleşir).

**v1.x (ilk güncellemeler):**
- **Gemini:** G-KOLAY-02 tip kat çoğaltıcı (K88 kısıtıyla), 04 kirli katman süpürücü, 10 hayalet alt kat (komşu parsel kısmı hariç), 16 iki GML karşılaştırma.
- **DeepSeek:** D-KOLAY-20 kot farkı cetveli, 21 anlık görüntü karşılaştırma, 24 ilk kullanım seçenekleri, 25 sürükle-bırak sıralama (onaylı), 28 MAKS CSV içe aktarma.

**v2:** komşu parsel hayaleti, OCR ile kesit veya MAKS okuma, çoklu dil, sesli komut, sunum modu.

**Reddedilen:** Q-KOLAY-21 (otomatik BB numarası), Q-KOLAY-22 (Yol A'nın tekrarı).

---

## 9. 10. TUR GÖREVLERİ (KULLANICI ADINA)

| AI | Görev |
|---|---|
| **GEMINI** | §7'deki 10 maddeyi işle ve **v3.5.1** olarak yayımla: tam K ve V tablosu; her satırda "değişmedi / düzeltildi / kaldırıldı" sütunu ve önceki sürüme göre fark listesi. Yeni özellik ekleme |
| **DEEPSEEK** | v3.5.1 tablosunu v3.4 (GEMINI8) tablosuyla **satır satır diff** et. Numara kayması ve kaybolan kural var mı? Sonucu tablo olarak ver |
| **QWEN** | Düzeltilmiş fikstürleri (9, 11, yeni #41, CCW GroundSurface) TypeScript test dosyası (`m0TestVectors.ts`) biçiminde yaz. Her beklenen değeri elle hesapla ve hesabı yanına yorum olarak koy (D-11) |
| **HEPSİ** | D-10 … D-13'ü §0'da onayla. Gerçek saat. Yeni KOLAY yok |

---

## 10. KULLANICIYA NOT

- 9 tur boyunca kurallar bu noktaya geldi. Şartnamenin **içeriği** artık kodlamaya yetecek olgunlukta; kalan iş **tablo temizliği** (v3.5.1). Bu düzeltme bir tur sürer. Sonra "TAMAM" dediğinde M0 başlayabilir.
- **En değerli tek veri hâlâ bir RET kodu** (AS-16). Elimizdeki tüm HATA kurallarının gerçek kanıtı tek bir ret dosyasına (V-202) dayanıyor.

## Ek. Yöntem

- **N30:** `<bldg:GroundSurface>` içindeki ilk `gml:posList` ile Shoelace formülü (PowerShell).
- **N31:** `Probe9.cs` (C#). Her `bldg:Door` için `doorUsage` değeri ve ata zinciri: `Room` (sınıfıyla), `CityObjectGroup`, `GenericCityObject` veya `Building`.
- **N32:** Ornek1'de "DEPO" değerinin bağlamı ve çok parçalı grup dökümü (CLAUDE7 N21 betiği).
- **N33:** CLAUDE7 Bölüm II'de kaydedilen sunucu BB listesi değerleri.
