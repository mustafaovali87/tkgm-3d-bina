# CLAUDE, 08.11.2026, 00:18, 3DBİNA UYGULAMASI 6. TUR

> **Dosya adı standardı:** `CLAUDE6.md` (AİADI + TURSAYISI). Bu tur sırası: Gemini → DeepSeek → ChatGPT → Grok → **Claude (turu kapatan denetim)**.
> **Okunan girdiler (tamamı, satır satır):**
> - Gemini: `implementation_plan (6).md` (6. Tur Master İş, Ürün ve Uygulama Planı, Şartname v3.2'ye bağlı)
> - DeepSeek: `DEEPSEEK6.txt` (875 satır; D6-01..D6-14, D6-N1..D6-N14, measure-report şeması, R1–R10)
> - Grok: `GROK6.txt` (Proceed matrisi, K56-ek, tolerans matrisi, UX/performans bütçeleri)
> - **ChatGPT 6. tur dosyası çalışma klasöründe yok.** (`*6*` taramasında yalnız DEEPSEEK6.txt, GROK6.txt ve Gemini'nin planı çıktı.) ChatGPT'nin bu turdaki görüşü bu yüzden değerlendirilemedi; 5. turdaki raporu (`TKGM_3B_Dijital_Bina_Uygulamasi_Inceleme_ve_Uygulama_Onerisi.md`) önceki turda denetlenmişti. ChatGPT'nin 6. tur dosyası gelirse 7. turda ek olarak işlenmelidir.
> - Normatif üst belgeler: `claude_uygulama_sartnamesi_v3.md` (v3.1), `claude_degerlendirme_v4_ve_deepseek.md` (N1–N10), `claude_5tur_inceleme_ve_urun_tasarimi.md` (N11, v3.2 değişiklikleri).
> - Birincil kanıt: 6 resmi TKGM örnek GML'i (Ornek1–Ornek6), kabul edilmiş 2 gerçek dosya (Amasya M-11597670-A, Sincan M-3036492-A), reddedilmiş 1 gerçek dosya (GML_M-17273333-F), 14 kod listesi, Rehber v3.0.3 metni, 3B Kadastro Üretim Kılavuzu (HelpNDoc) tam metni.

> **Etiketler:** `[ÖLÇÜLDÜ-6]` bu turda yeni yazdığım ölçüm aracıyla 9 dosya üzerinde ölçüldü · `[ÖLÇÜLDÜ N1–N11]` önceki turlarda ölçüldü · `[KILAVUZ]` TKGM Üretim Kılavuzu metni (satır no ile) · `[REHBER]` Rehber v3.0.3 · `[ÖNERİ]` benim mühendislik önerim (resmi değil) · `[DOĞRULANMALI]` resmi doğrulayıcıda test edilmesi gereken açık konu · `[DÜZELTME]` daha önce bir AI'nın (benim dahil) yazdığı yanlış bir bilginin düzeltilmesi.

---

## İÇİNDEKİLER

0. Yönetici Özeti — Bu Turun 14 Kesin Hükmü
1. Bu Turda Yapılan Yeni Ölçümler (N12–N19) — Yöntem, Ham Sonuç, Yorum
2. Kanıt Katmanlaması: "Eski Rejim" ve "Sürdürülebilirlik Rejimi" Dosyaları — Kendi Hatamın Düzeltilmesi
3. Büyük Çelişki: Kılavuz "Mimari Binada GroundSurface Bulunamaz" Diyor, Resmi Örneklerin 6/6'sında Var
4. Gemini v6 Planının Satır Satır Denetimi
5. DeepSeek 6. Tur Denetimi
6. Grok 6. Tur Denetimi
7. ChatGPT 6. Tur — Dosya Yok (Not)
8. Yeni Mühendislik Çözümleri ve Fikirler (C6-01 … C6-18)
9. Şartname v3.3 Değişiklik Listesi (Kesin Metin Önerileri)
10. Doğrulayıcı (V-kuralları) Güncellemeleri — Ciddiyet Tablosu
11. DXF'ten Oda Bulma: "Clipper2 Union of LINE" Neden Teknik Olarak Hatalı, Doğru v1 Algoritması
12. Kullanıcı Deneyimi: Üç Bakış Açısıyla Yeniden Tasarlanan Akışlar
13. Test, Kabul ve Tolerans Matrisi (Düzeltilmiş)
14. Yol Haritası ve Proceed Kararı
15. Açık Sorular — Resmi Doğrulayıcıda Test Edilecek Liste
16. Gemini'ye 7. Tur İçin Kesin Talimat Listesi
17. DeepSeek, ChatGPT ve Grok'a 7. Tur Notları
Ek-A. Ölçüm Aracı (Probe6) Yöntemi ve Tekrarlanabilirlik
Ek-B. Ham Ölçüm Çıktıları (9 dosya)

---

## 0. Yönetici Özeti — Bu Turun 14 Kesin Hükmü

Bu turda diğer AI'ların "ölçülmeli" dediği her şeyi **gerçekten ölçtüm** (9 GML dosyası, ~13.000 açıklık deliği, ~11.000 oda kenarı çifti). Sonuçlar, üç AI'nın da (Gemini, DeepSeek, Grok) bazı önerilerinin **ölçümle çeliştiğini** gösteriyor. Ayrıca **benim önceki turlardaki bir ifademin de yanlış olduğunu** buldum ve aşağıda açıkça düzeltiyorum.

| # | Hüküm | Kanıt | Etki |
|---|---|---|---|
| H1 | **Kapı yüksekliği projeye özgüdür; tek bir "doğru varsayılan" yoktur.** Ölçülen değerler: 210 cm (Ornek1, %92), 215 (Ornek2), 245 (Ornek3), 240 (Ornek4), 225 (Ornek5), 220 (Ornek6), 221 (Sincan). "2100 mı 2200 mü" tartışması yanlış sorudur. | `[ÖLÇÜLDÜ-6]` N12 | K45: `doorHeight` zorunlu proje parametresi; 2100 yalnız "boş kalırsa" önerisi + rozet. |
| H2 | **Kapı alt boşluğu iki biçimde kabul edilmiş: +10 mm ve +50 mm.** +10 mm: Ornek1 (1701/1701), Ornek4 (126/126), Ornek6 (36/36), Sincan (311/311). +50 mm: Ornek2 (91/91), Ornek3 (2139/2139), Ornek5 (184/184). Hiçbir dosyada kapı alt kenarı oda tabanına (0 mm) inmiyor. | `[ÖLÇÜLDÜ-6]` N12 | K45 rev2: `doorSillOffset ∈ {10, 50}` mm, varsayılan 10; `0` yasak (delik dış halkaya değer). |
| H3 | **DeepSeek'in "Ornek6 kapı üstü 1098.399 = +2.299 m" iddiası yanlıştır.** 1098.399 Ornek6'daki **pencerenin** üst kotudur. Kapı üst kotu 1098.300 = zFloorTop (1096.100) + 2.200 m. | `[ÖLÇÜLDÜ N1, N11]` + `[ÖLÇÜLDÜ-6]` (Ornek6 kapı 220 cm ×36) | DeepSeek §4.2 C5-3, §6.1 D6-N1 ve §11 madde 2 düzeltilmeli. |
| H4 | **Gemini v6 G6-EK2'deki Türkçe mahal sözlüğü kodları tamamen yanlış.** (SALON→1009, ODA→1013, MUTFAK→1007, WC→1014, HOL→1001.) Ölçülen gerçek eşleşme: Oda=1001, Banyo=1002, Salon=1003, Mutfak=1004, Kiler=1005, Tuvalet=1006, Hol=1008, Dükkan=1009, Niteliksiz Ortak Alan=1022, Teknik Hacim=1028. 1009 "Dükkan"dır; Salon'u 1009 yazmak her salonu dükkân yapar. | `[ÖLÇÜLDÜ-6]` N17 (9 dosyada ~1.900 oda adı = kod eşleşmesi, sıfır istisna) + `[KODLİST]` | Kritik veri bozma hatası. Sözlük §8 C6-07'deki tabloyla değiştirilmeli. |
| H5 | **Gemini v6 §2.1 pencere varsayılanları Rehber'le çelişiyor.** Rehber: mesken pencere-tavan 50 cm, pencere yüksekliği 130 cm; ıslak/bodrum tavana 50 cm, yükseklik 50 cm. Gemini: "sill 800, üst = tavan−500" (yükseklik oda yüksekliğine göre değişir) ve "ıslak 400×400, tavan−300" (Rehber'de yok). | `[REHBER]` | K46 varsayılanları Rehber'e göre yazılmalı (§9). |
| H6 | **Grok/DeepSeek'in "K56-ek sabit duvar kalınlığı" önerisi kural olarak reddedilmelidir.** Profesyonel CAD kaynaklı dosyalarda bölme duvarlar 10/20/25 cm'de toplanıyor (Ornek1, 3, 4, 6), ama Ornek5, Sincan, Amasya ve reddedilen dosyada 8–19 cm arası **sürekli dağılım** var ve bu dosyalar kabul edilmiş. Üstelik TKGM modelinde iç duvar **ayrı nesne değildir**: iki odanın net poligonları arasındaki boşluk duvardır. | `[ÖLÇÜLDÜ-6]` N14 | Sabit kalınlık **isteğe bağlı bir yardımcı** ("standart kalınlığa yasla" önerisi) olabilir, doğrulama kuralı olamaz. |
| H7 | **`buildingHeight` ile geometri arasında hiçbir sabit ilişki yok. DeepSeek/Grok'un V-064b önerisi (fark > 30 cm ise uyarı) 6 resmi örneğin 5'inde yanlış alarm verir.** Ornek2: 12.20 vs RoofEdge−FootPrint 10.19; Ornek3: 37.10 vs 50.84; Ornek4: 12.60 vs 11.49; Ornek5: 15.50 vs 14.90; Ornek6: 7.45 vs 5.60. Yalnız Ornek1'de eşit (48.60). Kılavuz tanımı: "Mimari projede binanın kot aldığı noktadan saçak seviyesine kadar". | `[ÖLÇÜLDÜ-6]` N15 + `[KILAVUZ]` s.3431 | V-064b reddedilir; yerine yalnız **BİLGİ** düzeyinde "beyan ↔ geometri karşılaştırma kartı" (§10). |
| H8 | **Arsa payı toplamı resmi örneklerde 1 değildir ve TKGM kabul etmiştir.** Benzersiz BB bazında toplam: Ornek1 = 362/363, Ornek5 = 8/9, Ornek3 (B bloğu) ≈ 0.494, Ornek4 ≈ 0.513, Ornek2 = 1/1, Ornek6 = 1/1. | `[ÖLÇÜLDÜ-6]` N16 | V-198 (Gemini'de "≠1 ise uyarı") **BİLGİ**'ye indirilmeli; çok bloklu parselde toplam blok GML'leri arasında hesaplanmalı (kapsam `K`). |
| H9 | **Aynı BB birden çok `GenericCityObject` parçası olarak yazılabiliyor (dubleks / çok katlı BB).** Ornek1: 70 parça, 67 benzersiz BB; Ornek4: 26 parça, 12 benzersiz BB; Ornek3: 181/173. Parçalar üzerinden toplam alınırsa arsa payı **1'den büyük** çıkar (Ornek1: 2281/2178). | `[ÖLÇÜLDÜ-6]` N16 | V-198 toplamı **BB kimliğine** (blok + giriş + BB no) göre tekilleştirerek almalı. Gemini/DeepSeek pseudo-kodunda bu yok. |
| H10 | **Açıklık deliği ↔ duvar dikey kenarı arasında resmi örneklerde 1 mm'ye kadar yaklaşım var** (Ornek2: 25 delik 1–9 mm; Ornek3: 233 delik 1–9 mm; Ornek4: 4; Ornek5: 3). Temas (0 mm) hiçbir dosyada yok. | `[ÖLÇÜLDÜ-6]` N13 | K45c "≥10 mm" **üretim hedefi** olarak doğru, ama doğrulayıcıda 1–10 mm **UYARI değil BİLGİ** olmalı; yoksa TKGM'nin kendi örneği bizim uygulamada sarı yanar. |
| H11 | **`additionalNote = "-"` 9/9 dosyada %100.** (Ornek1: 955/955 … Sincan: 176/176.) DeepSeek'in K73 önerisi doğrulandı. | `[ÖLÇÜLDÜ-6]` N18 | K73 kabul. |
| H12 | **`[DÜZELTME]` Benim (ve beni kaynak alan Gemini'nin) "GroundSurface 9/9 tam 1 adet" ifadem yanlıştır.** Doğrusu: **6/9** — 6 resmi örneğin hepsinde 1 adet var; Amasya, Sincan ve reddedilen dosyada **hiç yok**. | `[ÖLÇÜLDÜ-6]` N19 | Gemini v6 §0-A tablosundaki "GroundSurface 9/9" satırı düzeltilmeli. |
| H13 | **Kılavuz "Mimari binada GroundSurface alınmayacak" ve doğrulayıcı hata mesajı "Mimari binada GroundSurface bulunamaz" diyor — ama TKGM'nin kendi 6 örneğinde var.** Bu, projenin en ciddi açık sorusudur. | `[KILAVUZ]` s.599, s.2928, s.877 ("Yalnızca fotogrametrik model için") | Profil anahtarı + resmi doğrulayıcıda A/B testi (§3, §15 AS-1). |
| H14 | **Amasya ve Sincan "eski rejim" dosyalarıdır** (maksIntegrationState, propertyLot, registeredQuality, registeredInstallation yok). Bunlar *geometri* kanıtı olarak değerlidir ama *öznitelik zorunluluğu* için kanıt olamaz. | `[ÖLÇÜLDÜ-6]` + `[KILAVUZ]` "Sürdürülebilirlik kapsamında değişiklikler" | Kaynak önceliğine "rejim" boyutu eklenmeli (§2). |

**Proceed özeti:** M0–M2 **yeşil** (hemen başlanabilir). M3 **yeşil**, ama K70 gidiş-dönüş testine "GroundSurface korunur/eklenmez" kuralı eklenmeli. M4–M6 **sarı**: §9'daki K45 rev2, K46 rev, mahal sözlüğü düzeltmesi ve AS-1 (GroundSurface) kararı işlenmeden üretim motoru yazılmamalı. M7+ **turuncu** (saha + gerçek iade mesajları). IFC (eski M11) **v1 dışı** — bu konuda DeepSeek ve Grok'a katılıyorum.

---

## 1. Bu Turda Yapılan Yeni Ölçümler (N12–N19)

### 1.0 Neden ölçtüm?

DeepSeek ve Grok bu turda haklı olarak "iddialar ölçülmeden kural olamaz" dediler ve N12 (kapı/pencere histogramı) ile duvar kalınlığı histogramını "M0'da yazılsın" diye ertelediler. Ertelemenin bedeli şudur: Gemini v6 bu ölçümler yapılmadan K45 varsayılanını, K56-ek'i ve V-064b'yi şartnameye yazmaya hazırlanıyor. Yanlış bir varsayılan bir kez koda girerse binlerce dosyaya yayılır. Bu yüzden ölçümleri **bu turda** yaptım. Yöntem Ek-A'da, ham çıktı Ek-B'de.

**Örneklem:** 9 dosya — Ornek1 (70 BB, 1892 kapı, büyük konut), Ornek2 (çatı aralı mesken, eğik tavan), Ornek3 (B bloğu, ofis/dükkân, 2549 kapı), Ornek4 (dubleks), Ornek5 (EPSG:5254), Ornek6 (2 BB'lik küçük konut), Amasya (kabul, eski rejim, açıklıksız), Sincan (kabul, eski rejim), GML_M-17273333-F (ret).

### 1.1 N12 — Kapı ve Pencere Kot Dağılımı

Yöntem: Her `bldg:Room` için taban kotu (FloorSurface z) ve tek düz tavan kotu (CeilingSurface z) alındı; odaya bağlı her `bldg:Door`/`bldg:Window` deliğinin min/max z'si bu kotlara göre ifade edildi. Eğik tavanlı odalar (tavan halkasında z farkı > 1 mm veya birden çok tavan yüzeyi) pencere-tavan ölçümünden dışlandı.

**Kapı üst kotu − oda tabanı (cm):**

| Dosya | Dağılım | Baskın değer |
|---|---|---|
| Ornek1 | 210×1568, 220×133 | **210** (%92) |
| Ornek2 | 215×65, 245×20, 265×6 | **215** |
| Ornek3 | 245×2113, 285×16, 345×4, 235×3, 485×2, 305×1 | **245** |
| Ornek4 | 240×107, 250×8, 210×7, 220×4 | **240** |
| Ornek5 | 225×167, 205×17 | **225** |
| Ornek6 | 220×36 | **220** |
| Sincan | 221×311 | **221** |
| Amasya / Ret | açıklık yok | — |

**Kapı alt kotu − oda tabanı (mm):**

| Dosya | Değer | Oran |
|---|---|---|
| Ornek1, Ornek4, Ornek6, Sincan | **10 mm** | 1701/1701, 126/126, 36/36, 311/311 |
| Ornek2, Ornek3, Ornek5 | **50 mm** | 91/91, 2139/2139, 184/184 |

**Yorum (yazılım + harita mühendisi):**
1. "Kapı = zFloorTop + 10 mm" kuralı (benim 4. turda koyduğum K45) **yarım doğruydu**: 3 resmi örnek ve 2139 kapılık en büyük dosya 50 mm kullanıyor. Her ikisi de kabul görmüş. Kural, "alt kenar tabana değmemeli, 10 mm veya 50 mm boşluk" olmalı. Neden boşluk var? Çünkü kapı deliği tabana inerse duvar poligonunun alt kenarına **temas** eder ve delik dış halkaya değmiş olur (val3dity −201 / TKGM "kapı duvarı kesmeli ama köşelere değmemeli"). Boşluğun 10 ya da 50 mm olması üretici yazılımın tercihidir (muhtemelen Netcad-GMLCity ve Licad farklı değer kullanıyor — `[DOĞRULANMALI]`, bu sadece bir tahmin).
2. Kapı yüksekliği 205–485 cm arasında; büyük değerler (285, 345, 485) dükkân/otopark/çift kat yüksekliğindeki girişler. Yani **kapı tipi** kavramı gerekli: "iç kapı", "daire giriş kapısı", "dükkân vitrini/kepenk", "otopark kapısı".
3. Ornek1'de 2 değer (210/220) var: muhtemelen iç kapı 210, daire giriş kapısı 220. Bu, **kapı tipine göre varsayılan** modelini destekliyor.

**Pencere ölçümleri (denizlik = taban → pencere alt; tavan boşluğu = pencere üst → tavan):**

| Dosya | Denizlik (cm) | Yükseklik (cm) | Tavan boşluğu (cm) | Islak hacim penceresi |
|---|---|---|---|---|
| Ornek1 | 55×129, 20×124 | 159×129, 199×124 | 49×124, 54×124 | — |
| Ornek2 | 5×16, 80×6, 190×4, 110×3 | 450×16, 160×6, 50×6 | 30×16, 45×10 | denizlik 190 / h 50 / tavana 45 (×4) |
| Ornek3 | 5×402 | 240×228, 480×144, 280×30 | 45×146, 35×144, 75×70 | — |
| Ornek4 | 11×64, 10×48, 3×18 | 290×45, 388×30, 219×22, 396×18 | 1×58, 80×43, 85×23 | — |
| Ornek5 | 90×35 | 125×35 | 50×37 | — |
| Ornek6 | 90×15, 180×4 | 140×15, 50×4 | 30×19 | denizlik 180 / h 50 / tavana 30 (×4) |
| Sincan | 70×62, 10×18 | 140×48, 210×18, 150×14 | 55×48, 45×32 | — |

**Yorum:**
1. Pencere ölçüleri **projeden projeye çok değişiyor**. Ornek3 (ofis) 5 cm denizlikli boydan pencereler (cephe camı) kullanıyor; Ornek4 tavana 1 cm kalacak kadar yüksek pencereler.
2. Rehber'in mesken varsayılanı (tavana 50 cm, yükseklik 130 cm) Ornek5'e çok yakın (tavana 50, yükseklik 125). Ornek6 ve Sincan'da tavana 30–55 cm, yükseklik 140 cm.
3. Islak hacim pencereleri (banyo/WC) **50 cm yükseklik** iki dosyada da tutuyor (Rehber'le uyumlu); tavan boşluğu 30 ve 45 cm (Rehber 50 diyor). Gemini'nin "400×400, tavan−300" önerisi hiçbir ölçümle ve Rehber'le örtüşmüyor.
4. **Sonuç:** Pencere varsayılanları Rehber'deki gibi kalmalı ama uygulama mutlaka **"projedeki pencere tipleri"** tablosunu öne çıkarmalı (P1: 140×90 denizlik, P2: 50×180 denizlik…). Kullanıcı DXF'te pencere bloğu adı veya kesitten bir kez girer, tüm açıklıklar tipten beslenir.

### 1.2 N13 — Açıklık Deliği ↔ Duvar Dikey Kenarı Mesafesi

Yöntem: İçinde `gml:interior` bulunan **tüm dikey** poligonlar (z aralığı > 0.3 m) için duvarın yatay doğrultusu bulundu; her deliğin bu doğrultudaki uç noktalarının dış halkanın uçlarına olan en küçük mesafesi hesaplandı. Bu, önceki N1 ölçümünün (deliğin dış halka **herhangi** bir kenarına değmemesi) yatay bileşenini ayrıca inceler.

| Dosya | Delik sayısı | 0 mm (temas) | 1–9 mm | 1–5 cm | En küçük |
|---|---|---|---|---|---|
| Ornek1 | 5381 | 0 | 0 | 148 | 25 mm |
| Ornek2 | 508 | 0 | **25** | 29 | **1 mm** |
| Ornek3 | 8183 | 0 | **233** | 362 | **1 mm** |
| Ornek4 | 790 | 0 | 4 | 101 | 6 mm |
| Ornek5 | 680 | 0 | 3 | 12 | 2 mm |
| Ornek6 | 191 | 0 | 0 | 0 | 93 mm |
| Sincan | 1129 | 0 | 0 | 0 | 56 mm |

**Yorum:** TKGM doğrulayıcısı **temas yoksa** kabul ediyor; 1 mm'lik yan boşluklar resmi örneklerde var. Bu, 5. turda önerdiğim V-042b'nin (1–10 mm = UYARI) **ithal edilen dosyalarda gereksiz sarı alarm** üreteceğini gösteriyor. Karar:
- **Üretim** (bizim yazdığımız geometri): hedef ≥ 10 mm (K45c) — güvenli marj, yuvarlama ve 3 hane normalize sonrası temas riskini sıfırlar.
- **Doğrulama** (herhangi bir dosya): < 1 mm (ya da 3 hane normalize sonrası 0.000) = **HATA**; 1–10 mm = **BİLGİ** ("TKGM örneklerinde de görülür, risk düşük; 3 hane yuvarlamada temasa dönüşebilir mi kontrol edildi: Hayır/Evet").
- Özel durum: K70 düzeltme modunda yuvarlama yapılmaz; ama kullanıcı "3 haneye normalize et" çalıştırırsa 1 mm boşluk 0.000'a düşebilir. Bu durumda normalize komutu deliği **10 mm içe kaydırma önerisi** göstermeli (REQUIRES_USER_CONFIRMATION).

### 1.3 N14 — Duvar Kalınlığı (Oda ↔ Oda Boşluğu) Dağılımı

Yöntem: Aynı kattaki farklı odaların taban poligonlarının kenar çiftlerinden; paralel (sapma < 0.01), aralarındaki mesafe 2–60 cm ve birbirine izdüşümde en az 30 cm örtüşen çiftler seçildi. Her kenar için en yakın komşu oda kenarına olan mesafe = bölme duvar kalınlığı.

| Dosya | Dağılım (cm × kenar) | Karakter |
|---|---|---|
| Ornek1 | 10×2256, 20×996, 25×428 | Standart (CAD, 3 kalınlık) |
| Ornek2 | 10×105, 20×105, 25×16, 30×15 | Standart |
| Ornek3 | 10×3081, 20×1274, 60×140, 35×118, 40×70 … | Standart + perde/kolon hattı |
| Ornek4 | 10×271, 20×252, 30×17 + küçük dağınık | Çoğunlukla standart |
| Ornek5 | 12×69, 11×59, 13×38, 16×38, 15×36, 14×33, 10×27, 9×17 … | **Sürekli dağılım** (8–19 cm) |
| Ornek6 | 20×30, 10×10 | Standart |
| Amasya | 17×16, 19×10, 16×8, 14×7 … | **Sürekli dağılım** |
| Sincan | 10×128, 12×113, 11×106, 13×55, 26×45, 9×44 … | **Sürekli dağılım** |
| Ret dosyası | 11×7, 13×7, 12×6, 10×5, 9×5 … | Sürekli dağılım |

**Yorum (üç bakış):**
- *Harita mühendisi:* Sürekli dağılım, mimari projenin taranmış/elle sayısallaştırılmış olduğunu veya röleveden çizildiğini gösterir. Bu dosyalar kabul edilmiş → TKGM duvar kalınlığını **kontrol etmiyor**.
- *Yazılım mühendisi:* TKGM şemasında iç bölme duvarı ayrı nesne değil. BB "küvet"i (gen:lod2Geometry) yalnız dış kabuğu modelliyor; odalar net poligon. Duvar = boşluk. Yani "duvar kalınlığı parametresi" üretim motorunun girdisi değil, **çizimin sonucu**. DeepSeek'in D6-04'te sorduğu "W = BB.outline − ⋃parts" farkı zaten doğru tanım; sabit kalınlık zorlamak, kullanıcının çizdiği (ve onaylı projede yazan) net alanları **değiştirir** → `calculatedArea` projedeki net alandan sapar → V-157 (%10 sapma) gibi kurallar tetiklenir. Yani K56-ek yarardan çok zarar getirir.
- *Son kullanıcı:* Kullanıcı "duvarlarım 19,5 cm çıkmış, sorun mu?" diye soracak. Cevap: "Hayır, TKGM kontrol etmiyor; ama istersen tek tıkla 20 cm'ye yaslayabilirim (alanlar şu kadar değişir: tablo)."

**Karar:** K56-ek **kural olarak reddedilir**; yerine C6-05 "Duvar Kalınlığı Asistanı" (isteğe bağlı, önizlemeli, fark tablolu) eklenir.

### 1.4 N15 — `buildingHeight` ↔ Geometri

| Dosya | buildingHeight | RoofEdge − FootPrint | ÇatıMax − FootPrint | RoofEdge − Ground | ÇatıMax − Ground |
|---|---|---|---|---|---|
| Ornek1 | 48.60 | **48.60** | 54.40 | 48.80 | 54.60 |
| Ornek2 | 12.20 | 10.19 | 13.40 | 14.00 | 17.21 |
| Ornek3 | 37.10 | 50.84 | 52.34 | 60.50 | 62.00 |
| Ornek4 | 12.60 | 11.49 | 11.49 | 11.75 | 11.75 |
| Ornek5 | 15.50 | 14.90 | 16.80 | 18.60 | 20.50 |
| Ornek6 | 7.45 | 5.60 | 7.80 | 5.60 | 7.80 |

**Yorum:** Hiçbir geometrik büyüklük `buildingHeight` ile tutarlı biçimde örtüşmüyor. Bunun nedeni tanımda: "Mimari projede **binanın kot aldığı noktadan** (±0.00 genelde yol/tretuvar kotuna bağlı) **saçak seviyesine** kadar". Kot alınan nokta FootPrint değildir (FootPrint TIC'in en üst noktasına en yakın kat zemini, `[KILAVUZ]` s.570); saçak kotu RoofEdge değildir (RoofEdge en üst kat tavanı). Ornek3'te beyan 37.10, geometri 50.84: bodrumlar + çatı katları beyan dışı. **V-064b (fark > 30 cm uyarı) 6 örneğin 5'inde yanlış alarm verir → reddedilir.** Yerine: V-064c **BİLGİ** kartı (değerleri yan yana gösterir, kural koymaz) + mevcut 0 < h < 950 aralık kontrolü.

DeepSeek'in D6-N2'deki "çatı 1101.50 → 1103.30" değeri de ölçümle örtüşmüyor: Ornek6 çatı z aralığı **1101.5 – 1103.7** (`[ÖLÇÜLDÜ N-5.tur]`; bu tur: ÇatıMax − FootPrint = 7.80 → 1095.90 + 7.80 = 1103.70).

### 1.5 N16 — Arsa Payı (`propertyLot`) Toplamları

| Dosya | BB parçası | Benzersiz BB | Σ benzersiz BB | Σ tüm parçalar (yanlış yöntem) |
|---|---|---|---|---|
| Ornek1 | 70 | 67 | **362/363** | 2281/2178 (>1!) |
| Ornek2 | 17 | 13 | **1/1** | 115/77 |
| Ornek3 (B blok) | 181 | 173 | **471197/954497** (≈0.494) | 491597/954497 |
| Ornek4 | 26 | 12 | **4542/8861** (≈0.513) | 10544/8861 |
| Ornek5 | 27 | 24 | **8/9** | 1/1 (tesadüf) |
| Ornek6 | 2 | 2 | **1/1** | 1/1 |
| Amasya, Sincan, Ret | propertyLot yok (eski rejim) | | | |

**Yorum:**
1. Ornek3 ve Ornek4'te toplam ~0.5: parselde başka blok(lar) var; arsa payı **parsel** geneline dağıtılmış. Ornek3 dosya adı zaten `-B` (B bloğu).
2. Ornek1'de 1/363 eksik, Ornek5'te 1/9 eksik — muhtemelen bu payların sahibi GML'de BB olarak bulunmayan bir birim (ör. ayrı bir blok, kapıcı dairesi başka yapı vb.) ya da yuvarlama. TKGM kabul etmiş.
3. **Sonuç:** Arsa payı toplamı ≠ 1 bir **hata değildir**; TKGM'nin kendi örneklerinde var. V-198 ciddiyeti **BİLGİ** olmalı. Kapsam `K` (parseldeki tüm blok GML'leri birlikte verilirse toplam = 1 beklenir; o zaman ≠ 1 için **UYARI**).
4. **BigInt kesin aritmetik önerisi (Gemini G6-EK1) doğru ve gerekli**: Ornek3'ün paydası 954497 — kayan noktada toplamak gerçekten hatalı sonuç verir. Ama toplama **BB kimliğine göre tekilleştirilmiş** küme üzerinden yapılmalı; aksi halde dubleks/çok parçalı BB'ler payı 2–3 kez sayar (Ornek1: 2281/2178).

### 1.6 N17 — Oda Adı ↔ `partUsage` Kodu

9 dosyada `bldg:Room[class=BagimsizBolumKisim]` için `gml:name` sonundaki etiket ile `partUsage` değeri karşılaştırıldı:

| Etiket | Kod | Görüldüğü dosyalar (adet) |
|---|---|---|
| Oda | 1001 | O1 373, O2 12, O3 362, O4 27, O5 21, O6 4, Amasya 5, Sincan 47, Ret 3 |
| Banyo | 1002 | O1 124, O2 12, O3 232, O4 12, O5 7, O6 2, Amasya 4, Sincan 31, Ret 3 |
| Salon | 1003 | O1 63, O2 8, O5 7, O6 2, Amasya 1, Sincan 16, Ret 1 |
| Mutfak | 1004 | O1 62, O3 108, O4 12, O5 7, O6 2, Amasya 2, Sincan 16, Ret 1 |
| Kiler | 1005 | O1 1, O3 22, O4 18, O5 3, Amasya 2, Ret 1 |
| Tuvalet | 1006 | O1 67, O2 5, O3 64, O5 7, O6 4, Sincan 16 |
| Hol | 1008 | O1 63, O3 30, O5 14, O6 2, Amasya 2, Sincan 16, Ret 2 |
| Dükkan | 1009 | O1 4, O2 5, O3 75, O5 17 |
| Niteliksiz Ortak Alan | 1022 | O4 13 |
| Merdiven | 1024 | Ret 2 |
| Otopark | 1016 | Ret 1 |
| Teknik Hacim | 1028 | O1 2, O4 46 |

**Sıfır istisna.** Ayrıca bu, oda `gml:name` sonekinin **kod listesindeki Türkçe etiketin kendisi** olduğunu gösteriyor (ör. `..._Oda`, `..._Teknik Hacim`). Bu kural hem üretimde (ad = kod etiketi) hem doğrulamada (ad ↔ kod tutarlılığı, V-yeni BİLGİ/UYARI) kullanılmalı.

### 1.7 N18 — Liste Beyan Öznitelikleri (`additionalNote`, `registeredQuality`, `registeredInstallation`)

| Dosya | additionalNote | registeredInstallation | registeredQuality |
|---|---|---|---|
| Ornek1 | '-'×955 | boş×69, 'DEPO'×1 | KONUT×62, DÜKKAN×6, KAPICI DAİRESİ×1, 41 NOLU DAİREYE AİT DEPO×1 |
| Ornek2 | '-'×72 | '-'×17 | ÇATI ARALI MESKEN×8, DÜKKAN×5, MESKEN×4 |
| Ornek3 | '-'×1192 | 'YOK'×181 | OFİS×100, DÜKKAN×64, KATLI OFİS×16, OTO YIKAMA (DÜKKAN)×1 |
| Ornek4 | '-'×155 | boş×14, 'E1-DEPO'×4, 'E2-DEPO'×4, 'E3-DEPO'×4 | KONUT×18, DUBLEKS KONUT×8 |
| Ornek5 | '-'×121 | '0.00'×27 | MESKEN×27 |
| Ornek6 | '-'×23 | boş×2 | MESKEN×2 |
| Amasya | '-'×21 | yok | yok |
| Sincan | '-'×176 | yok | yok |

**Yorum:**
1. `additionalNote = "-"` → **K73 kabul** (DeepSeek doğru).
2. `registeredQuality` serbest metin ama **9/9 TÜRKÇE BÜYÜK HARF** (Ö, Ç, İ, Ş doğru). Liste beyandan birebir kopyalanıyor. V-064 (büyük harf) kapsamına bu alan kesin girmeli; `toLocaleUpperCase('tr-TR')` şart.
3. `registeredInstallation` için **format yok**: boş, '-', 'YOK', '0.00', 'DEPO', 'E1-DEPO' hepsi kabul görmüş. Uygulama bu alanı zorlamamalı; yalnız "liste beyanla aynı mı" (V-197, kapsam K) kontrolü yapmalı. Varsayılan: **boş** `<gen:value/>` (Ornek6 ve Ornek1 böyle) — ama Kılavuz "registeredInstallation bulunamadı" hatası tanımlıyor → **eleman mutlaka yazılmalı, değeri boş olabilir**.

### 1.8 N19 — GroundSurface ve Rejim Öznitelikleri Varlığı

| Dosya | GroundSurface | propertyLot | registeredQuality | maksIntegrationState | Door/Window | Onay tarihi | Durum |
|---|---|---|---|---|---|---|---|
| Ornek1 | 1 | 70 | 70 | 1003 | 1892/512 | 2022-12-12 | Resmi örnek |
| Ornek2 | 1 | 17 | 17 | 1003 | 126/88 | 2022-09-23 | Resmi örnek |
| Ornek3 | 1 | 181 | 181 | 1003 | 2549/810 | 2023-06-20 | Resmi örnek |
| Ornek4 | 1 | 26 | 26 | 1003 | 142/212 | 2022-12-28 | Resmi örnek |
| Ornek5 | 1 | 27 | 27 | 1003 | 200/84 | 2000-01-01 | Resmi örnek |
| Ornek6 | 1 | 2 | 2 | 1003 | 44/38 | 1999-12-09 | Resmi örnek |
| Amasya | **0** | **0** | **0** | **yok** | **0/0** | 2015-10-30 | Kabul (eski) |
| Sincan | **0** | **0** | **0** | **yok** | 330/164 | 2000-01-01 | Kabul (eski) |
| Ret | 0 | 0 | 0 | yok | 0/0 | 2018-03-23 | Ret; geometrySuitability=1005, tender ve architecturalPlanID **dolu** |

**Yorum:** Ret dosyası, Kılavuz'un "Sürdürülebilirlik kapsamında" değişiklik listesindeki üç kuralı birden ihlal ediyor: geometrySuitability 1006 olmalı (1005 yazılmış), architecturalPlanID ve tenderRegistrationNumber **boş** olmalı (dolu). Bu, önceki turlarda bulduğumuz ret nedenleriyle tutarlı ve şartnamedeki sabit değer kurallarını (K-sabitler) güçlü biçimde doğruluyor.

---

## 2. Kanıt Katmanlaması: "Eski Rejim" ve "Sürdürülebilirlik Rejimi"

### 2.1 Sorun

Önceki turlarda "9 dosya" diye bir küme halinde konuştuk ve bazı istatistikleri (ör. "GroundSurface 9/9") bu kümenin tamamına mal ettik. Bu turda gördük ki küme **homojen değil**:

- **Rejim S (Sürdürülebilirlik):** Ornek1–6. Kılavuz'un "Sürdürülebilirlik Kapsamında TKGM CityGML Modelinde Yapılan Değişiklikler" sayfasındaki tüm yeni öznitelikleri taşıyor (maksIntegrationState, propertyLot, registeredQuality, registeredInstallation, blockName -1 kuralı, kapı/pencere zorunluluğu).
- **Rejim E (Eski):** Amasya, Sincan. Bu yeni öznitelikleri taşımıyor; Amasya'da kapı/pencere bile yok. Kabul edilmişler, ama **kabul tarihlerindeki** kurallarla. Kılavuz: "Kapı ve Pencere — Sürdürülebilirlik kapsamında üretilen modellerde dökümanda tarif edilen şekilde kapı ve pencere çizilmelidir." Yani Amasya bugün gönderilse büyük ihtimalle reddedilir.

### 2.2 Kendi hatamın düzeltilmesi `[DÜZELTME]`

5. tur raporumda (ve onu kaynak alan Gemini v6 §0-A satırında) "`GroundSurface` 9/9 tam 1 adet" yazdı. Bu turda 9 dosyada tek tek saydım: **6/9**. Doğru ifade: "6 resmi örneğin 6'sında tam 1 adet; 2 eski kabul dosyasında ve reddedilen dosyada yok." Benzer şekilde "no lod2Solid 9/9" ve "no measuredHeight 9/9" ifadeleri doğru kalıyor (bu tur tekrar kontrol ettim: lod1 CompositeSolid 9/9 var, lod2Solid 0/9). Gemini'nin bu satırı düzeltmesi gerekir.

### 2.3 Yeni kaynak öncelik kuralı `[ÖNERİ]` (Şartname §0.2'ye eklenmeli)

| Soru tipi | Birinci kaynak | İkinci kaynak | Eski rejim dosyaları |
|---|---|---|---|
| Geometri biçimi (delik, kot, küvet, açıklık tutarlılığı) | Rejim S örnekleri | Rejim E kabul dosyaları (destekleyici) | Geçerli kanıt |
| Öznitelik **zorunluluğu** (var mı/yok mu) | Kılavuz "Sürdürülebilirlik değişiklikleri" + Rejim S örnekleri | Rehber | **Kanıt değildir** |
| Öznitelik **değeri/biçimi** | Kod listeleri + Rejim S örnekleri | Kılavuz örnek XML | Yalnız rejim S'de olmayan alanlar için |
| Kılavuz ↔ Örnek çelişkisi | **Açık soru** → profil anahtarı + resmi doğrulayıcıda test | — | — |

**Uygulamaya yansıması (C6-02):** İçe aktarılan her GML için "Rejim Tespiti" yapılır (maksIntegrationState / propertyLot / registeredQuality varlığına bakarak). Rejim E dosya açıldığında kullanıcıya: "Bu dosya eski kurallarla üretilmiş görünüyor. Bugün gönderilirse eksik olabilecek 7 öznitelik ve 0 kapı/pencere var. **Güncel rejime yükselt** sihirbazını açayım mı?" Bu, rakiplerde olmayan, harita mühendisinin eski dosyayı kat mülkiyetine çevirirken çok işine yarayacak bir özellik.

---

## 3. Büyük Çelişki: GroundSurface

### 3.1 Kanıtlar (birebir kaynak)

- `[KILAVUZ]` s.582 (LoD1, mimari bina): "Mimari binalar için Lod0RoofEdge ile Lod0FootPrint arasında kalan bölüm yer üstü, FootPrint ile GroundSurface* arasında kalan bölüm ise yer altı solid yapıyı oluşturmalıdır."
- `[KILAVUZ]` s.599 (dipnot): "* Mimari binada GroundSurface alınmayacak olup binanın en alt düzlemini ifade etmek için kullanılmıştır."
- `[KILAVUZ]` s.877 (GroundSurface sayfası): "Yalnızca fotogrametrik model için hazırlanmalıdır."
- `[KILAVUZ]` s.2928 (doğrulayıcı hata listesi): "Mimari binada GroundSurface bulunamaz." Çözüm: "TKGM klavuzda belirtilen GML hiyerarşisine uygunluk kontrol edilmelidir."
- `[KILAVUZ]` s.2303 (fotogrametrik örnek): "Binanın tabanı Citygml'e GroundSurface olarak aktarılmalıdır."
- `[KILAVUZ]` s.595 (LoD2 genel): "LOD2 geometrisi WallSurface, OuterFloorSurface, RoofSurface ve GroundSurface olarak ayrılarak…"
- `[ÖLÇÜLDÜ-6]` Rejim S resmi örneklerin **6/6**'sında `bldg:GroundSurface` var: `gml:name = "Zemin"`, poligon kimliği `Ground_<uuid>`, Ornek6'da z = 1095.9 (en alt katın döşeme alt kotu; zFloorTop 1096.100 − döşeme 0.20).
- `[ÖLÇÜLDÜ-6]` Rejim E kabul dosyalarında **yok**.

### 3.2 Yorum

"Bulunamaz" Türkçede hem "bulunamadı (eksik)" hem "bulunmamalı (yasak)" gibi okunabilir; ama aynı listede eksiklik mesajları "… bulunamadı" (geçmiş zaman) kalıbında yazılmış (ör. "propertyLot bulunamadı", "MultiSurface elemanı … bulunamadı"). "Bulunamaz" geniş zaman olumsuz yeterlilik kalıbı → **yasak** anlamı daha güçlü. Dipnot ve GroundSurface sayfası da bunu destekliyor.

Öte yandan TKGM'nin kendi web sayfasında yayımladığı 6 örnek dosyanın hepsinde GroundSurface var ve bu örnekler sürdürülebilirlik rejiminin en güncel öznitelik setini taşıyor. Üç olası açıklama:
1. Doğrulayıcı "mimari bina"yı başka bir ölçütle ayırıyor (ör. buildingType veya geometrySuitability) ve örnekler o ölçüte göre hatayı tetiklemiyor. Ama örneklerde buildingType=1001, geometrySuitability=1006 — bizim üreteceğimizle aynı. Bu açıklama zayıf.
2. Kural sonradan eklendi/kaldırıldı; örnekler veya kılavuz güncel değil.
3. Kural yalnız GroundSurface'in **yanlış yerde** (ör. BB/Room altında) bulunmasını yakalıyor.

**Hangisi olduğunu masa başında bilemeyiz.** Bu yüzden:

### 3.3 Karar `[ÖNERİ]`

- **Profil anahtarı:** `profile.lod2.groundSurface = 'include' | 'omit'`. Varsayılan **`include`** (resmi örneklere birebir uyum; şu ana kadar elimizdeki en güçlü "bugün kabul edilen" kanıt TKGM'nin kendi örnekleri).
- **AS-1 (Açık Soru 1) — en yüksek öncelik:** Kullanıcı (harita mühendisi) kendi gerçek projelerinden birini, resmi doğrulama sisteminde **iki varyantla** test etmeli: (a) GroundSurface'li, (b) GroundSurface'siz. Sonuç profil paketine yazılır ve profil sürümü artırılır. Uygulama bu testi kolaylaştırmak için "A/B test paketi üret" komutu sunar (C6-03).
- **K70 düzeltme modu:** İthal dosyada GroundSurface varsa korunur, yoksa **eklenmez** (kullanıcı açıkça istemedikçe).
- **Doğrulayıcı:** V-200 (yeni) — "GroundSurface varlığı profil ayarıyla uyumsuz" → **DOĞRULANAMADI** statüsü, açıklamada her iki kaynağın birebir alıntısı.
- **Gemini'nin LoD1 yer altı solid üretimi** (FootPrint ↔ "GroundSurface" arası) GroundSurface **elemanından** değil, "binanın en alt düzlemi" kavramından (en alt katın döşeme alt kotu) hesaplanmalı; böylece `omit` profilinde de LoD1 doğru üretilir.

---

## 4. Gemini v6 Planının Satır Satır Denetimi

Genel değerlendirme: Gemini v6, önceki turlara göre **en derli toplu** plan. K70, K71, K72, V-196, V-197, 5 bulgu statüsü, Y/K/T kapsamı, kural metadata şeması, `validationCode` + SHA-256 kilit fikri (G6-EK4) çok iyi işlenmiş. Ama bu turun ölçümleri birkaç **veri bozan** hatayı ortaya çıkardı. Aşağıda bölüm bölüm:

### 4.1 §0-A Karar Matrisi

| Satır | Durum | Not |
|---|---|---|
| Platform (Electron + TS) | ✅ Doğru | Tek dil, core/ Node'da test, three.js/Clipper2/manifold doğal. Ek not: Electron sürümü ve `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false` güvenlik bayrakları şartnamede yazılı olmalı (§8 C6-16). |
| K70 düzeltme modu | ✅ Doğru | Eklenmesi gereken: GroundSurface korunur/eklenmez (§3.3). |
| N11 / K45 / K45b "kapıda [zFloorTop+10, zFloorTop+doorHeight]" | ⚠️ Eksik | +50 mm de kabul görmüş (3 resmi örnek). K45 rev2 (§9). |
| K45c "4 yönlü ≥ 10 mm" | ⚠️ Kısmen | Üretim hedefi olarak doğru; doğrulamada 1–10 mm BİLGİ olmalı (N13). |
| V-042a / V-042b | ⚠️ Ciddiyet | V-042b UYARI → **BİLGİ** (resmi örneklerde 262 delik bu aralıkta). |
| V-196 ve F1 | ✅ Doğru | Eşikler [ÖNERİ]/[DOĞRULANMALI] etiketlenmeli (DeepSeek D6-05 haklı). |
| K71 | ✅ Doğru | |
| "TKGM Onaylı" ibaresi yalnız validationCode ile | ✅ Çok iyi | Ek: kod alanı 6 karakter alfanümerik, büyük harfe çevrilerek saklanır; GML'e **yazılmaz** (GML'de alanı yok), yalnız proje dosyasında ve raporda. |
| X1–X5 reddi ("GroundSurface 9/9 tam 1 adet") | ❌ Yanlış veri | **6/9**; bkz. §2.2. Ayrıca GroundSurface'in kılavuzla çelişkisi açık soru (§3). |

### 4.2 §0-B G6-EK1 … G6-EK6

**G6-EK1 (BigInt arsa payı):** Aritmetik doğru ve gerekli (Ornek3 paydası 954497). Üç eksik:
1. Toplam **benzersiz BB** üzerinden alınmalı (H9).
2. Ciddiyet **BİLGİ** (tek blok GML) / **UYARI** (kullanıcı parseldeki tüm blokları beyan ettiyse) — H8.
3. Kılavuz'daki 6 biçim kuralı ayrı ve **HATA** düzeyinde kontrol edilmeli: string, BB içinde zorunlu, tek adet, boş olamaz, "pay/payda" biçimi, pay ≤ payda (`[KILAVUZ]` s.3443–3448). Gemini planında bu 6 kural yok; asıl ret sebebi olabilecek kontroller bunlar.
   Ek öneri: aynı BB'nin tüm parçalarında propertyLot **aynı** olmalı (parçalar arası tutarlılık) → UYARI `[ÖNERİ]`.

**G6-EK2 (DXF yarı-kenar graf + mahal sözlüğü):**
- Mahal sözlüğü kodları **yanlış** (H4). Doğru tablo §8 C6-07.
- "BALKON → BLKN" eşleştirmesi doğru yönde (balkon oda değil, BuildingInstallation).
- DCEL'in v1'de ağır olduğu konusunda DeepSeek/Grok'a katılıyorum; ama onların önerdiği "Clipper2 Union of LINE" de teknik olarak hatalı. Doğru v1 algoritması §11'de.
- Alan regex'i `/([0-9]+[.,][0-9]+)\s*(?:m2|m²)/i` iyi başlangıç; ama Türk mimari projelerinde "NET: 12,45 m²", "12.45m2", "A=12,45", "12,45 M2" gibi biçimler de var. Çoklu desen + "en yakın metin" yerine "poligonun içindeki metin" kuralı + belirsizlikte kullanıcıya sor.

**G6-EK3 (F2 TKGM sonuç içe aktarıcı):** ✅ Çok değerli. Ek: Kılavuz'daki hata listesi (≈200 mesaj) **mesaj kalıbı → V-kodu → nesne tipi** eşleme tablosu olarak profil paketine konmalı; "(Girilen : ... , Beklenen : ...)" gibi kalıplar regex şablonuna çevrilmeli. Otomatik kazıma yok, kullanıcı yapıştırır — bu ilkeyi Gemini doğru koymuş.

**G6-EK4 (Eksikler sayacı + SHA-256 kilit):** ✅ Fikir mükemmel. DeepSeek'in "X Eksik yerine H/U/B" düzeltmesi doğru. Ek: SHA-256 **kanonik model** üzerinden alınmalı (JSON anahtar sırası sabit, sayılar mm tamsayı, UI durumu hariç); aksi halde pencere boyutunu değiştirmek bile "model değişti" der. Ayrıca özet **GML dosyasının** da SHA-256'sı olarak raporda basılmalı: kurumda "TKGM'ye gönderilen dosya bu mu?" sorusuna kanıt.

**G6-EK5 (Y/X/Z ergonomisi):** ✅ Doğru ve önemli. Ek: "Y" sütununa 6 haneli (500000 civarı), "X" sütununa 7 haneli (4.xxx.xxx) değer girildiğinde otomatik **makullük kontrolü** (EPSG dilimine göre Y aralığı ~ 300.000–700.000; X Türkiye için ~ 3.950.000–4.700.000). Ters girilirse anında "Y ile X yer değiştirmiş olabilir, düzelteyim mi?" önerisi.

**G6-EK6 (tools/measure):** ✅ Bu turda Ek-A'da çalışan bir referans uygulama verdim (C# prob; TypeScript'e çevrilecek).

### 4.3 §1.2 Kural Tablosu

- **K45 (Revize):** "roomHeight < 2100 ise zCeiling − 300" kuralı iyi niyetli ama tehlikeli: Ornek2'de eğik tavanlı çatı aralı odalarda min tavan 1.2 m (`[ÖLÇÜLDÜ N7]`). Kapı tavana değil **duvarın o noktadaki yüksekliğine** sığmalı; eğik tavanlı odada kapı duvarın yüksek tarafında olmalı. Kural: `doorTop ≤ wallTopAt(doorSpan) − 10 mm`; sığmıyorsa kullanıcıya göster (sessiz kırpma yok — Gemini'nin K45c ilkesiyle uyumlu).
- **K45b:** ✅ Yeni üretimde katı uygulanır. Ama N11'de Ornek6/Ornek4'te LoD2 alt kotu 1 cm aşağıda; bu **kabul edilmiş** bir sapma. DeepSeek D6-03 haklı: düzeltme modunda korunur.
- **K45c:** Üretimde ≥10 mm. Doğrulamada BİLGİ (§1.2).
- **V-042b:** UYARI → BİLGİ.
- **V-196:** [ÖNERİ] etiketi eklenmeli.
- **V-197:** ✅ Doğru. Ek: `registeredQuality` büyük harf (N18) ve liste beyan metniyle **birebir** (boşluk/parantez dahil: "OTO YIKAMA (DÜKKAN)").
- **V-198:** ciddiyet ve tekilleştirme düzeltmesi (§4.2).

### 4.4 §2.1 Kot Motoru

- `slabThickness` varsayılan 200 mm: Ornek6'da GroundSurface 1095.9, zFloorTop 1096.1 → 0.20 m ✅. Ama tüm katlar için sabit değil; kullanıcı kat kat girer (proje kesiti).
- Pencere varsayılanları **yanlış** (H5). Doğru metin §9 K46 rev.
- `roomHeight ≥ 1500 mm` (K58): Ornek2'de eğik tavanda min 1.2 m var (`[ÖLÇÜLDÜ N7]`) — kural "en yüksek nokta ≥ 1.5 m" olarak yorumlanmıştı (5. tur). Gemini formülü `max(zCeiling) − zFloorTop` ile bunu doğru yazmış ✅.

### 4.5 §2.2 Alan/Hacim

- Kısım `volume` = alan × (zCeiling − zFloorTop) ✅ (N4). Ama Amasya'da kat yüksekliği kullanılmış (oran 1.08) ve kabul edilmiş → hacim kontrolü UYARI, hata değil ✅ (Gemini 5. turdan almış).
- Eğik tavan hacmi için diverjans teoremi ✅ doğru yöntem. Ek: kapalılık şartı — Room yüzeyleri bir **kapalı kabuk** oluşturmuyorsa (TKGM örneklerinde oda kabuğu bazen açık olabilir; `[DOĞRULANMALI]`) diverjans yanlış sonuç verir. Güvenli yöntem: taban poligonunu üçgenle, her üçgenin üstündeki tavan yüksekliğini tavan düzlemlerinden ray-cast ile bul, prizmaları topla ("2.5B hacim"). Tek-değerli tavan (çatı arası) için kesin, kapalılık gerektirmez.
- BB `independentSectionCalculatedArea` = en alt yatay Floor_ alanı ✅ (N8). Ornek1 istisnası (şaft deliği) not edilmeli.
- `roofProjectionArea`: "saçak dahil" ifadesi `[DOĞRULANMALI]` — ölçüp doğrulayalım (7. tur için açık iş).

### 4.6 §3 Ürün Tasarımı, §4 Aşamalar

- `.tkgm3b` ZIP ✅. DeepSeek'in sürüm yükseltme (migration) stratejisi eklenmeli.
- M11 (IFC) hâlâ yol haritasında → v1 dışına alınmalı (DeepSeek D6-13, Grok ile hemfikirim). Gerekçe: IFC→TKGM dönüşümü ayrı bir ürün kadar büyük; web-ifc lisansı (MPL-2.0) uygun ama IFC'deki IfcSpace kalitesi Türk projelerinde çok düşük; v1'in değer önerisi DXF/elle çizim + doğrulama.
- M5/M6 kabul tolerans matrisi yok → §13'teki düzeltilmiş tablo eklenmeli.
- DCEL M7.2'de → §11'deki v1 algoritmasıyla değiştirilmeli.

---

## 5. DeepSeek 6. Tur Denetimi

Genel: DeepSeek bu turda **en disiplinli eleştirmen**: tolerans matrisi, K45* konsolidasyonu, K73, measure-report, migration, H/U/B rozeti gibi önerileri çoğunlukla doğru. Ama ölçüm yapmadan "ölçülmüş gibi" yazdığı birkaç sayı var.

| Madde | Hüküm | Gerekçe / Kanıt |
|---|---|---|
| D6-01 Tolerans matrisi | ✅ Kabul, düzeltmeyle | "Poligon köşe sayısı ±%5" reddedilir: T-kavşak çözümü farklı yazılımlarda farklı köşe üretir, sayı karşılaştırması anlamsız. Yerine **simetrik fark alanı ≤ 0.01 m²** ve **Hausdorff ≤ 2 mm** (§13). |
| D6-02 Kapı 2100/2200 | ✅ Sorusu doğru, varsayımı yanlış | Cevap: tek varsayılan yok; 205–485 cm (H1). |
| D6-03 1 cm LoD2 farkı K70 ile korunsun | ✅ Kabul | |
| D6-04 Duvar kalınlığı | ⚠️ Kısmen | Soru doğru, K56-ek önerisi reddedilir (H6). |
| D6-05 V-196 eşikleri [ÖNERİ] | ✅ Kabul | |
| D6-06 BigInt `N === L` uyarısı | ⚠️ | `N === L` kontrolü L ve N aynı paydaya getirildiği için **doğru**dur (N ≡ L mod L kontrolü ise yanlış olurdu: N=2L de geçerdi). DeepSeek'in "N % L === 0n yazılmalı" önerisi **hatalı** — fazla payı (N = 2L) "doğru" sayar. Ayrıca tekilleştirme eksik (H9). |
| D6-07 DCEL ağır | ✅ Kabul; çözüm önerisi hatalı | §11. |
| D6-08 H/U/B rozeti | ✅ Kabul | Ek: DIŞ_KONTROL ve DOĞRULANAMADI ayrı gri rozetler. |
| D6-09 Ornek6 buildingHeight | ⚠️ | "tavan 2.60 m'de (1098.70)" doğru; "saçak 7.45−5.60=1.85 çatı yüksekliği" yorumu yanlış: buildingHeight kot→saçak, çatı yüksekliği değil (H7). |
| D6-10 posList | ✅ | Örneklerde posList kullanılıyor; val3dity okuyor. |
| D6-11 / D6-N4 Türkçe büyük harf | ✅ Kabul | Ek: `registeredQuality` alanı kapsamda (N18). |
| D6-12 M dizisi çakışması | ✅ | Tek numaralandırma Gemini'de. |
| D6-13 M11 v1 dışı | ✅ Kabul | |
| D6-14 Kanıt etiketleri | ✅ Kabul | Ek: `[ÖLÇÜLDÜ]` etiketi yalnız bir ölçüm betiği + dosya SHA-256 ile verilebilsin. |
| D6-N1 "Ornek6 üst z 1098.399 = +2.299" | ❌ **Yanlış** | 1098.399 pencere üstü. Kapı üstü 1098.300 = +2.200 (H3). |
| D6-N2 "çatı 1101.50 → 1103.30" + V-064b | ❌ **Yanlış** | Çatı max 1103.70; V-064b 5/6 resmi örnekte yanlış alarm (H7). |
| D6-N3 Clipper2 Union | ❌ Teknik hata | §11. |
| D6-N5 posList sırası Y X Z | ✅ | Ek: srsDimension=3 her posList'te mi yoksa Envelope'ta mı — örneklerde ne var, birebir kopyalanmalı. |
| D6-N6 additionalNote "-" (K73) | ✅ **Doğrulandı** 9/9 | N18. |
| D6-N7 Türk duvar pratiği | ⚠️ | Bilgi olarak doğru, kural olarak yanlış (N14). |
| D6-N8 Yapı Özet Formu 14 alan | ⚠️ [DOĞRULANMALI] | Resmi formun alan listesi bulunamadı; 14 alanlık tablo DeepSeek'in **tahmini**. Uygulamada "form şablonu" profil paketinden okunmalı, sabit kodlanmamalı. |
| D6-N9 Onarım fark tablosu | ✅ Kabul (K74) | |
| D6-N10 Örnek GML dağıtımı | ✅ | Örnek dosyalar repoya konmaz; ilk çalıştırmada kullanıcıdan/TKGM sayfasından elle indirilir, SHA-256 ile doğrulanır. |
| D6-N11 .tkgm3b migration | ✅ Kabul | |
| D6-N12 Ölçüm araçlarının testi | ✅ Kabul | Ek-A'daki 9 dosyalık çıktı "altın değer" (golden) olarak kullanılabilir. |
| D6-N13 F2 parsing | ✅ | |
| D6-N14 K45* konsolidasyonu | ✅ Kabul | Yeni numaralandırma §9'da. |
| measure-report.json şeması | ✅ Yapı iyi | Örnek sayılar **uydurma** (ölçülmemiş) — şemanın örnek değerleri "örnek" diye işaretlenmeli; ya da Ek-B'deki gerçek değerler kullanılmalı. |
| Risk R1–R10 | ✅ | R-ek: "Kılavuz ↔ örnek çelişkisi" (GroundSurface) yeni en yüksek risk. |

---

## 6. Grok 6. Tur Denetimi

Grok bu turda büyük ölçüde DeepSeek'i onaylayıp sentezliyor; özgün katkıları UX ve performans bütçeleri.

| Madde | Hüküm | Not |
|---|---|---|
| Proceed matrisi (M0–M3 yeşil, M3.5–M6 sarı, M7+ turuncu, M11 kırmızı) | ✅ Kabul | Benim matrisimle aynı. |
| 2.1 N12 analyzer | ✅ Yapıldı (bu turda) | "Varsayılan 800–500 mm pencere mesken" Rehber'e aykırı (H5). |
| 2.2 K56-ek | ❌ Kural olarak red | H6. "Tutarsızlık uyarısı (min/max/std)" → kabul edilmiş dosyalarda gereksiz sarı; yalnız **BİLGİ** + asistan. |
| 2.3 F3-A1 Clipper2 Union | ❌ Teknik hata | §11. Alan eşikleri (0.5 / 1.0 m²) mantıklı ama 0.5 m² altı her zaman "kolon/şaft" değildir: Ornek1'de 3.038 m² şaft deliği var, küçük şaftlar BB deliği olabilir → "yok say" yerine "şaft/kolon adayı" listesi. |
| 2.4 measure-report + CI + SHA-256 | ✅ Kabul | |
| 2.5 Tolerans matrisi | ✅ düzeltmeyle | Köşe sayısı satırı red (§13). |
| 2.6 K45* konsolidasyonu | ✅ | |
| 2.7 K74 onarım güven sınırları | ✅ Kabul | "T-kavşak düzeltme"yi SAFE_LOSSLESS saymak tartışmalı: T-kavşağa köşe eklemek alanı değiştirmez ama **köşe sayısını ve kimlikleri** değiştirir → K70 modunda yine onay gerektirmeli. |
| 2.8 UX: komut satırı, kısayollar | ✅ Kabul | Kısayol çakışması: `D` (door) Türkçe kullanıcı için "Duvar" çağrıştırır. Öneri: Türkçe kısayol seti (K=Kapı, P=Pencere, O=Oda, B=BB, T=Kat) + İngilizce alternatif profil. |
| 2.8 Renkli sapma rozeti (%5/%10) | ✅ | Eşikler V-157 ile aynı kaynaktan (profil) okunmalı. |
| 2.8 Çökme kurtarma (20 sürüm) | ✅ | |
| 2.9 Performans bütçeleri | ✅ Kabul | Ek: Ornek3 (≈10.000 delikli poligon) için doğrulama < 5 sn (Worker'da); 3 hane normalize + yeniden doğrulama < 3 sn. |
| 2.10 Gizlilik, lisans | ✅ | "Deneme sürümünde filigranlı rapor" iyi; GML'e asla filigran yazılmaz (veri bütünlüğü). |
| Talimat 12: "additionalNote '-' (K73) ve V-064b" | ⚠️ yarı | K73 ✅, V-064b ❌. |

---

## 7. ChatGPT 6. Tur — Dosya Yok

Çalışma klasöründe ChatGPT'nin 6. tur dosyası (ör. `CHATGPT6.md`) bulunmuyor. Bu yüzden ChatGPT'nin 6. tur katkısı bu denetime girmedi. 5. turdaki ChatGPT raporunun (C1–C11, X1–X9) değerlendirmesi `claude_5tur_inceleme_ve_urun_tasarimi.md` dosyasında; Gemini v6 bunu doğru işlemiş (§0-A). ChatGPT'nin 6. tur dosyası sonradan gelirse 7. turda ayrıca denetlenmeli.

---

## 8. Yeni Mühendislik Çözümleri ve Fikirler (C6-01 … C6-18)

### C6-01 — Açıklık Tipi Kütüphanesi (Kapı/Pencere Tipleri)

**Problem:** Kapı yüksekliği 205–485 cm, alt boşluk 10/50 mm, pencereler projeden projeye çok farklı (N12). Tek varsayılan çalışmaz.
**Çözüm:** Proje kartında "Açıklık Tipleri" tablosu:

| Tip kodu | Tür | Kullanım (doorUsage/windowUsage) | Genişlik | Yükseklik | Denizlik/Alt boşluk | Kaynak |
|---|---|---|---|---|---|---|
| K1 | Kapı | iç kapı | 90 | 210 | 10 mm | Proje kesiti |
| K2 | Kapı | daire giriş | 100 | 220 | 10 mm | Proje kesiti |
| K3 | Kapı | dükkân | 300 | 285 | 10 mm | Proje |
| P1 | Pencere | mesken | 140 | 140 | 90 cm | Proje |
| P2 | Pencere | ıslak hacim | 60 | 50 | tavana 50 cm | Rehber varsayılanı |

- DXF'te kapı/pencere **blok adları** (ör. "KAPI90", "P140x140") tiplere eşlenir; blok genişliği otomatik okunur.
- Tipi "Rehber varsayılanı" olan her açıklık **mavi rozet** taşır ("varsayılan kullanıldı, projeden kontrol et").
- **Proje genelinde alt boşluk:** `doorSillOffset` = 10 mm (varsayılan) veya 50 mm. Tek değer, tüm kapılar (resmi örneklerde dosya içinde karışık kullanım yok — N12'de her dosya tek değer).

### C6-02 — Rejim Tespiti ve "Güncel Rejime Yükselt" Sihirbazı

Eski rejim (E) dosyası açıldığında:
1. Eksik zorunlu öznitelikler listelenir (maksIntegrationState, propertyLot, registeredQuality, registeredInstallation, BB maksIdentityNumber…).
2. Kapı/pencere yoksa "Açıklık ekleme" adımı açılır (C6-01 tipleriyle).
3. Geometri K70 ile korunur; yalnız eklemeler yapılır.
4. Sonunda fark raporu: "Eklenen: 16 propertyLot, 16 registeredQuality, 330 kapı… Değişen geometri: 0."

### C6-03 — Resmi Doğrulayıcı İçin A/B Test Paketi Üretici

Açık sorular (GroundSurface, 3 hane kuralı, büyük harf kapsamı…) ancak resmi doğrulayıcıda test edilerek kapanır. Uygulama bir komutla aynı projeden **varyantlar** üretir (ör. `M-xxx-A_GS.gml`, `M-xxx-A_noGS.gml`) ve kullanıcıya hangi sırayla yükleyeceğini ve sonucu nereye yazacağını gösterir. Kullanıcı sonucu (kabul/ret + mesaj) yapıştırır → F2 içe aktarıcı → profil paketine "deneyimsel kanıt" olarak eklenir (tarih, doğrulayıcı sürümü, varyant). **Otomatik yükleme yok** (TKGM sistemine otomatik erişim yapmama ilkesi korunur).

### C6-04 — Oda Adı = Kod Etiketi Kuralı

N17: oda `gml:name` soneki her zaman kod listesindeki Türkçe etikettir. Üretimde ad otomatik türetilir (kullanıcı adı ayrıca girmez); doğrulamada ad ↔ kod uyuşmazlığı → UYARI (V-203).

### C6-05 — Duvar Kalınlığı Asistanı (isteğe bağlı)

- Kat çiziminden bölme boşlukları ölçülür, histogram gösterilir (N14 aracıyla aynı).
- "10/20/25 cm'ye yasla" önerisi: hangi odanın hangi kenarı kaç mm kayacak, alanlar ne kadar değişecek tablosu.
- Varsayılan **kapalı**; doğrulama kuralı değil.

### C6-06 — Arsa Payı Paneli (Parsel Düzeyi)

- BB'ler tekilleştirilerek listelenir; her BB'nin payı, toplam (BigInt), eksik/fazla kesir.
- "Parselde başka blok var mı?" sorusu: Evet ise diğer blokların toplam payı girilir (veya diğer blok GML'leri içe alınır) → parsel toplamı.
- Liste beyan Excel/CSV içe aktarımı (F11) ile karşılaştırma (V-197).

### C6-07 — Doğru Türkçe Mahal Sözlüğü (G6-EK2'nin yerine)

`partUsage` (BB kısmı) için:

| DXF metni (normalize: TR büyük harf, boşluk/nokta temizlenmiş) | Kod | Etiket |
|---|---|---|
| ODA, YATAK ODASI, YATAK, ÇOCUK ODASI, ÇALIŞMA ODASI, MİSAFİR ODASI, EBEVEYN | 1001 | Oda |
| BANYO, DUŞ, EBEVEYN BANYO, E.BANYO | 1002 | Banyo |
| SALON, OTURMA, OTURMA ODASI, YAŞAM, SALON+MUTFAK* | 1003 | Salon |
| MUTFAK, AÇIK MUTFAK | 1004 | Mutfak |
| KİLER | 1005 | Kiler |
| WC, W.C., TUVALET, LAVABO** | 1006 | Tuvalet |
| KIŞ BAHÇESİ | 1007 | Kış Bahçesi |
| HOL, ANTRE, KORİDOR, GİRİŞ, KOR. | 1008 | Hol |
| DÜKKAN, MAĞAZA, İŞYERİ, OFİS*** | 1009 | Dükkan |
| SIĞINAK | 1010 | Sığınak |
| DEPO | 1030 | Depo |
| TEKNİK HACİM, TESİSAT, ŞAFT**** | 1028 | Teknik Hacim |
| MERDİVEN | 1024 | Merdiven |
| İÇ ASANSÖR | 1029 | İç Mekan Asansör |

\* "SALON+MUTFAK" gibi birleşik metinlerde kullanıcıya sorulur (tek poligon, tek kod).
\** "LAVABO" bazen banyo içi armatür etiketidir; poligon alanı < 2 m² ise 1006 öner, değilse sor.
\*** OFİS için ayrı kod yok; Ornek3'te ofis BB'lerinin kısımları da Oda/Dükkan vb. kodlarla yazılmış — bu yüzden "OFİS" **nitelik** (registeredQuality) sözlüğüne gider, partUsage'e değil. Kısım için kullanıcıya sor.
\**** ŞAFT çoğunlukla oda değil BB/kat deliğidir (Ornek1 3.038 m²) — önce "delik mi oda mı" sorulur.

Balkon / Teras: **oda değil** → BLKN_ / TRS_ BuildingInstallation. Ortak alan (OA) için aynı kod listesi `commonAreaUsage` alanında kullanılır (Sincan'da commonAreaUsage 15 adet; Kapıcı Dairesi 1013, Otopark 1016, Sığınak 1010 vb. genelde OA). Eşleşmeyen metin → "Tanınmadı" + kullanıcı seçimi + **öğren** (proje sözlüğüne eklenir).

### C6-08 — "Örnekten Öğren" (Learn-from-accepted)

Kullanıcının daha önce **kabul edilmiş** bir GML'i varsa (kendi bürosundan), uygulama onu okuyup açıklık tiplerini, alt boşluğu (10/50), pencere tavan boşluğunu, oda adlandırma alışkanlığını, kat biçimini (A/B) çıkarır ve yeni proje için **varsayılan profil** olarak önerir. Kurumun kendi "kabul görmüş" stilini sürdürmek harita bürosu için çok değerli; rakiplerde yok.

### C6-09 — Kılavuz Hata Mesajı Kataloğu (makine okunur)

Kılavuz'daki ~200 hata mesajı + çözüm önerisi → `profiles/tkgm/error-catalog.json`: `{pattern, vCode, objectType, severity, fixHint, source:"Kılavuz s.N"}`. F2 içe aktarıcı ve kendi doğrulayıcımız aynı katalogdan beslenir; mesaj metinleri **TKGM'nin birebir Türkçesi** olur — kullanıcı TKGM ekranında ne görecekse bizde de onu görür.

### C6-10 — Kapı Sığma Kontrolü (Eğik Tavan)

`doorTop ≤ wallTopAt(span) − 10 mm`. Çatı aralı odalarda kapı, duvarın o aralıktaki **en düşük** üst kotuna göre kontrol edilir. Sığmıyorsa kırmızı kontur + "kapıyı 40 cm sağa kaydırırsan sığar" önerisi.

### C6-11 — Normalize Sonrası Temas Koruyucu

"3 haneye normalize et" komutu çalışmadan önce, yuvarlamanın 1–9 mm boşlukları sıfıra indirip indirmeyeceğini simüle eder (N13'te resmi örneklerde 262 böyle delik var). Risk varsa liste + "delikleri 10 mm içe al" önerisi (REQUIRES_USER_CONFIRMATION, fark tablosu K74).

### C6-12 — Kanonik Model Özeti

SHA-256 kilidi (G6-EK4) için kanonik serileştirme: anahtarlar alfabetik, sayılar mm tamsayı, UUID'ler deterministik (uuidv5), UI/kamera/seçim durumu hariç. Aynı model → aynı özet → aynı GML baytları (deterministik yazıcı). Bu, "TKGM'ye gönderilen dosya ile projedeki model aynı mı?" sorusunu kriptografik olarak cevaplar.

### C6-13 — Beyan ↔ Geometri Bilgi Kartı (V-064b yerine)

Bina panelinde yan yana: buildingHeight (beyan), RoofEdge−FootPrint, ÇatıMax−FootPrint, kat sayısı × ortalama kat yüksekliği. **Kural yok**, yalnız görsel; kullanıcı yanlış birim/ondalık girdiyse (ör. 745 yerine 7.45) gözüyle yakalar. Yalnız 0 < h < 950 aralığı HATA.

### C6-14 — Liste Beyan Metin Normalizasyonu

`registeredQuality` için: TR büyük harf, çift boşluk tek boşluğa, baş/son boşluk kırp, parantez korunur. Liste beyan CSV'sinden gelen metinle **karakter karakter** karşılaştırma; farklıysa diff görünümü ("KONUT" vs "MESKEN" farklı kelimeler — otomatik düzeltilmez, kullanıcı karar verir).

### C6-15 — "İlk 10 Dakika" Akışı (Son Kullanıcı)

1. Proje kartı (işlem tipi, ada/parsel, MAKS yapı no) — 2 dk.
2. Yapı aplikasyon noktaları (B1..Bn, M1..Mn) yapıştır (Excel'den Y X Z) — 1 dk; makullük kontrolü (C… G6-EK5 eki).
3. DXF kat planlarını sürükle-bırak; katları sırala; kot tablosunu kesitten gir — 3 dk.
4. Otomatik oda bulma + mahal sözlüğü — 2 dk; "tanınmadı" listesi.
5. Açıklık tipleri — 1 dk.
6. Doğrula → H/U/B rozeti → GML yaz → Yapı Özet Formu önizleme — 1 dk.

### C6-16 — Electron Güvenlik Taban Çizgisi

`contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, sıkı CSP, `webSecurity: true`, uzak içerik yükleme yok, IPC kanalları beyaz liste, dosya erişimi yalnız kullanıcının seçtiği yollar. Otomatik güncelleme imzalı (NSIS + kod imzalama). Bu satırlar şartname §9'a eklenmeli; Gemini/DeepSeek/Grok hiçbiri yazmamış.

### C6-17 — Ölçüm Aracı = Doğrulayıcının Kardeşi

N12–N19 ölçümleri doğrulayıcının BİLGİ kartlarına dönüşür: kullanıcı kendi dosyasında "kapı yüksekliği dağılımın 210×40, 220×4" görür; resmi örneklerle aynı biçimde. Kod tekrarı yok (`core/measure` → `core/validate` paylaşır).

### C6-18 — Kat Biçimi (A/B) ve Alt Boşluk (10/50) "Stil Profili"

N11/N12'ye göre kabul görmüş iki "stil" var: Ornek1/4/6/Sincan (Kat Biçimi A + 10 mm) ve Ornek2/3/5 (Kat Biçimi B + 50 mm) — tam örtüşme olmayabilir, `[DOĞRULANMALI]` (Kat Biçimi ölçümünde Ornek3 yoktu). Stil profili tek ayardan seçilir; karışık stil üretilmez.

---

## 9. Şartname v3.3 Değişiklik Listesi (Kesin Metin Önerileri)

> Numaralandırma: DeepSeek D6-N14 konsolidasyonu benimsendi; eski numaralar alias olarak kalır.

**K45 (rev2) — Kapı Z aralığı.**
`zDoorBottom = zFloorTop + doorSillOffset`, `doorSillOffset ∈ {10, 50}` mm (proje genelinde tek değer; varsayılan 10). `zDoorTop = zFloorTop + doorType.height` (C6-01 açıklık tipi; proje kesitinden; boşsa 2100 + "varsayılan" rozeti). `doorSillOffset = 0` **yasak**. Kaynak: `[ÖLÇÜLDÜ-6 N12]` 7 dosya, 4.565 kapı.

**K45a — Delik dış halkaya değmez** (değişmedi).

**K45b → K46b — Temsil birliği** (değişmedi; yeni üretimde katı, K70 modunda kaynak korunur).

**K45c (rev) — Üretim kenar payı.** Üretilen her açıklık deliği, duvar poligonunun tüm kenarlarına ≥ 10 mm uzak. Sığmazsa sessiz kırpma yok. **Doğrulama tarafında** 1–10 mm = BİLGİ (resmi örneklerde var, `[ÖLÇÜLDÜ-6 N13]`).

**K45d (yeni) — Eğik tavanda kapı.** `doorTop ≤ wallTopAt(span) − 10 mm` (C6-10).

**K46 (rev) — Pencere Z aralığı.** Projeden (C6-01 pencere tipi). Boşsa `[REHBER]`: mesken/konut → üst = tavan − 500 mm, yükseklik 1300 mm (denizlik = oda yüksekliği − 1800 mm; < 600 mm çıkarsa kullanıcıya sor); ticari → alt = taban + 100 mm, üst = tavan − 100 mm; ıslak hacim/bodrum küçük pencere → üst = tavan − 500 mm, yükseklik 500 mm. Varsayılan kullanılan her pencere rozetli.

**K56-ek — REDDEDİLDİ** (kural olarak). C6-05 asistanı.

**K73 (yeni) — `additionalNote = "-"`** her nesnede (`[ÖLÇÜLDÜ-6 N18]` 9/9).

**K74 (yeni) — Onarım fark tablosu** (DeepSeek D6-N9, Grok 2.7). T-kavşak köşe ekleme K70 modunda onaylı.

**K75 (yeni) — `propertyLot` biçimi** `[KILAVUZ s.3443–3448]`: stringAttribute; her BB'de tam 1 adet; boş değil; `^\s*\d+\s*/\s*\d+\s*$` (boşluksuz yazılır: `pay/payda`); pay ≤ payda; payda > 0. Aynı BB'nin tüm parçalarında aynı değer `[ÖNERİ]`.

**K76 (yeni) — `registeredQuality`**: stringAttribute, her BB'de 1 adet, TR büyük harf, liste beyan metni birebir.

**K77 (yeni) — `registeredInstallation`**: eleman her BB'de **yazılır**; değer boş olabilir (`<gen:value/>`); biçim serbest (`[ÖLÇÜLDÜ-6 N18]`).

**K78 (yeni) — GroundSurface profili**: `include` (varsayılan) | `omit`. AS-1 sonucu ile kesinleşir. LoD1 yer altı solid "en alt düzlem" kavramından hesaplanır, elemandan değil.

**K79 (yeni) — Oda adı soneki = kod etiketi** (`[ÖLÇÜLDÜ-6 N17]`).

**K80 (yeni) — Rejim tespiti ve kaynak önceliği** (§2.3).

**Şartname §0.2 Kaynak Önceliği** — "Rejim" sütunu eklenir (§2.3 tablo).

**Şartname §9 Platform** — C6-16 güvenlik taban çizgisi eklenir.

---

## 10. Doğrulayıcı (V-kuralları) Güncellemeleri — Ciddiyet Tablosu

| Kural | Eski ciddiyet | Yeni ciddiyet | Kapsam | Gerekçe |
|---|---|---|---|---|
| V-042a delik temas (< 1 mm veya 3 hanede 0.000) | HATA | HATA | Y | N1, N13 |
| V-042b 1–10 mm | UYARI | **BİLGİ** | Y | N13 (resmi örneklerde 262 delik) |
| V-064 büyük harf | DOĞRULANAMADI | registeredQuality için **HATA**, diğerleri DOĞRULANAMADI | Y | N18 |
| V-064b buildingHeight ↔ geometri | (önerilmişti) UYARI | **REDDEDİLDİ** → V-064c BİLGİ kartı | Y | N15 |
| V-196 TIC ↔ aplikasyon | UYARI | UYARI [ÖNERİ eşikler] | K | Genelge 6/4 |
| V-197 liste beyan ↔ model | UYARI/HATA | UYARI | K | |
| V-198 arsa payı toplamı | UYARI | **BİLGİ** (tek blok) / UYARI (tüm parsel beyan edildiyse) | K | N16 |
| V-198a (yeni) propertyLot biçim 6 kuralı | — | **HATA** | Y | Kılavuz |
| V-198b (yeni) aynı BB parçalarında farklı propertyLot | — | UYARI | Y | [ÖNERİ] |
| V-199 (yeni) rejim E tespiti | — | BİLGİ + sihirbaz | Y | §2 |
| V-200 (yeni) GroundSurface ↔ profil | — | DOĞRULANAMADI | Y | §3 |
| V-201 (yeni) registeredQuality/registeredInstallation eleman eksik | — | HATA | Y | Kılavuz "bulunamadı" mesajları |
| V-202 (yeni) sabit değerler (gs 1006, tender boş, archPlan boş, maksInt 1003) | (vardı) | HATA | Y | Ret dosyası N19 |
| V-203 (yeni) oda adı ↔ partUsage | — | UYARI | Y | N17 |
| V-204 (yeni) kapı alt boşluğu dosya içinde karışık (10 ve 50 birlikte) | — | BİLGİ | Y | N12 (hiçbir örnekte karışık yok) |
| V-205 (yeni) kapı tavana/duvar üstüne sığmıyor | — | HATA | Y | K45d |

---

## 11. DXF'ten Oda Bulma: "Clipper2 Union of LINE" Neden Hatalı, Doğru v1 Algoritması

### 11.1 Hata

Clipper2'nin Boolean işlemleri (Union, Difference…) **kapalı yollar** (polygon) üzerinde tanımlıdır. Açık yollar (open paths / LINE) Clipper2'de yalnız **subject** olarak verilebilir ve kapalı bir clip ile **kırpılır**; açık yolların birleşimi kapalı alan **üretmez**, PolyTree'de oda çıkmaz. Yani "tüm LINE'ları Clipper2 Union'a ver, PolyTree'den odaları al" (DeepSeek D6-N3, Grok 2.3) çalışmaz. Bu, M7'de haftalar kaybettirecek bir tasarım hatası.

### 11.2 Doğru v1 — iki seçenek, birlikte

**Yol A: "Duvar Çizgisi Tamponu" (Clipper2 ile, hızlı, sağlam)**
1. Duvar katmanlarındaki LINE/LWPOLYLINE/ARC (yaylar 5 mm kirişle parçalanır) → açık yollar.
2. Her çizgi `ClipperOffset` ile **w/2 = 5 mm** tamponlanır (açık yol, `EndType.Butt` / `Square`) → ince kapalı şeritler.
3. Şeritlerin **Union**'ı → duvar çizgi ağı tek "malzeme" poligonu (5 mm uç-uca açıklıklar bu adımda kapanır = snap toleransı).
4. PolyTree'de bu poligonun **delikleri** = kapalı odalar/boşluklar.
5. Her delik +5 mm dışa ofsetlenir (tamponun yediği payı geri vermek için) → oda net konturu (çizgi ekseniyle birebir).
6. Alan < 0.5 m² → "kolon/şaft adayı"; 0.5–1 m² → sor; ≥ 1 m² → oda adayı.
Avantaj: tamamen Clipper2 (zaten bağımlılık), tamsayı aritmetik (mm), uç-uca boşlukları tolerans içinde kendiliğinden kapatır, kendi kendine kesişmeye dayanıklı.
Dezavantaj: tampon payı küçük köşelerde ±5 mm sapma bırakabilir → adım 5'ten sonra köşeler orijinal çizgi uç noktalarına **snap** edilir (en yakın kesişim noktası, < 6 mm).

**Yol B: "Düğümleme + Poligonlaştırma" (JTS Polygonizer mantığı)**
1. Snap-round (5 mm ızgara) ile tüm kesişimler düğümlenir (noding).
2. Sarkan uçlar (dangles) ve köprüler budanır.
3. Düzlemsel graf yüzleri çıkarılır (minimal döngüler).
Bu, aslında DCEL'in hafif versiyonu; JSTS (JTS'nin JS portu) `Polygonizer` sınıfı bunu hazır yapar. Lisans: JSTS EPL-1.0/EDL-1.0 (ikili lisans; ticari kullanıma uygun ama lisans metni ürüne eklenmeli `[DOĞRULANMALI]`).

**Öneri:** v1 = **Yol A** (bağımlılık eklemez, sağlam). Yol B, "yolu A'nın bulamadığı odalar" için yedek ve v1.1. Tam DCEL editörü (oda bölme/birleştirme) M8.

### 11.3 Metin eşleştirme

- Her oda poligonu için **içinde kalan** TEXT/MTEXT (ekleme noktası poligon içinde) toplanır; birden çoksa: mahal sözlüğüne uyan + alan desenine uyan ayrı ayrı alınır.
- MTEXT biçim kodları (`\P`, `{\fArial|b0;…}`, `%%c`) temizlenir.
- Alan metni bulunduysa çizimden hesaplanan net alanla karşılaştırılır; fark > %3 → "metin ile çizim uyuşmuyor" BİLGİ (çizim hatası/eski revizyon yakalanır).

---

## 12. Kullanıcı Deneyimi: Üç Bakış Açısıyla

### 12.1 Harita mühendisi (yapı aplikasyon müellifi)
- **Korkusu:** "TKGM'den iade gelir, müşteri bekler." → F2 (iade mesajı yapıştır → nesneye git) + C6-09 (TKGM'nin birebir mesajı) + C6-03 (A/B test).
- **İsteği:** Eski kabul görmüş dosyalarındaki stil sürsün → C6-08.
- **Zaman:** Ortalama bir 8 daireli bina için hedef **45 dakika** (rakiplerde kullanıcı forumlarında yarım gün–1 gün anlatılıyor `[DOĞRULANMALI]`).

### 12.2 Yazılım mühendisi
- Ölçüm = test: Ek-B değerleri `golden/measure-report.json` olur; CI her derlemede 6 resmi örneği okur-yazar-ölçer, değerler değişirse kırmızı.
- Deterministik yazıcı + kanonik özet (C6-12).
- Profil paketi (kod listeleri, hata kataloğu, varsayılanlar, GroundSurface ayarı) koddan ayrık; TKGM kural değiştirince **yalnız profil** güncellenir.

### 12.3 Son kullanıcı (büro teknikeri)
- Türkçe, sade terimler (G6-EK5): "Kat Tabanı Kotu", "Tavan Kotu", "Kapı Alt Boşluğu (1 cm / 5 cm)".
- Her sarı/mavi rozet tıklanabilir ve **neden** + **ne yapmalıyım** + **kaynak** gösterir.
- Hiçbir şey sessizce değişmez: her otomatik düzeltme fark tablolu (K74).

---

## 13. Test, Kabul ve Tolerans Matrisi (Düzeltilmiş)

| Metrik | Tolerans | Not |
|---|---|---|
| Nesne sayıları (Bina, Kat, BB (benzersiz), BBK, OA, KAPI, PEN, BLKN, TRS) | Birebir | |
| Açıklık sayısı oda başına | Birebir | |
| calculatedArea (kısım), independentSectionCalculatedArea, balkon alanı | ±0.01 m² | |
| volume | ±0.05 m³ veya ±%0.5 (büyüğü) | Büyük hacimlerde mutlak tolerans dar |
| Kotlar (zFloorBottom, zFloorTop, zCeiling, açıklık alt/üst) | ±1 mm | |
| Poligon şekli | Simetrik fark alanı ≤ 0.01 m² ve Hausdorff ≤ 2 mm | "Köşe sayısı ±%5" **kaldırıldı** |
| Kapı alt boşluğu | Birebir (10 veya 50 mm) | N12 |
| Delik ↔ kenar | ≥ 1 mm (temas yok) | Üretimde ≥ 10 mm |
| Arsa payı toplamı | Kaynak dosyayla birebir kesir | BigInt |
| GML yazma determinizmi | Aynı girdi → aynı bayt (SHA-256 eşit) | |
| K70 gidiş-dönüş | Koordinat metni bayt bayt aynı | GroundSurface varlığı korunur |

**Kabul seti:** Ornek1–6 + Amasya + Sincan (geometri), Ret dosyası (V-202 tüm ihlalleri yakalanmalı: gs 1005, tender dolu, archPlan dolu).

---

## 14. Yol Haritası ve Proceed Kararı

| Aşama | İçerik | Durum | Ön koşul |
|---|---|---|---|
| M0 | Repo, core/ izolasyon, profil paketi, `tools/measure` (Ek-A'nın TS portu), golden rapor | 🟢 | — |
| M1 | Akış tabanlı okuyucu, 3B görüntüleyici, rejim tespiti (V-199) | 🟢 | |
| M2 | Doğrulayıcı (V-001..V-205), H/U/B/DIŞ/DOĞRULANAMADI, hata kataloğu (C6-09) | 🟢 | §10 ciddiyet tablosu işlenmiş olmalı |
| M3 | K70 öznitelik düzeltici, normalize + temas koruyucu (C6-11), K74 | 🟢 | |
| M3.5 | F2 iade mesajı içe aktarıcı, A/B test paketi (C6-03) | 🟢 | |
| M4 | 2.5B tasarım modeli, açıklık tipleri (C6-01), mahal sözlüğü (C6-07) | 🟡 | K45 rev2, K46 rev, sözlük düzeltmesi |
| M5–M6 | Geometri motoru (küvet, oda, açıklık, LoD0/1/2) | 🟡 | **AS-1 (GroundSurface) kararı**, §13 tolerans |
| M7 | DXF Yol A (§11), Yapı Özet Formu (şablon profilden), teslim paketi | 🟠 | Saha verisi |
| M8 | DCEL editör, çatı arası 3B kesim, Yol B | 🟠 | |
| M9–M10 | Saha doğrulaması, paketleme/imza/güncelleme | 🟠 | |
| IFC | v1 dışı (2027+) | 🔴 | |

**Proceed:** Kullanıcı "TAMAM" dediğinde M0'dan başlanabilir. M0–M3.5 bu turdaki düzeltmelerden **bağımsız** değil ama etkilenen kısımlar (ciddiyet seviyeleri, yeni V-kuralları) M2'de profil verisi olduğu için kodu bloklamaz.

---

## 15. Açık Sorular — Resmi Doğrulayıcıda Test Edilecek Liste

> Bu soruların hiçbiri masa başında kapanmaz. Kullanıcı (harita mühendisi) kendi gerçek projeleriyle resmi sistemde deneyerek kapatır. Uygulama C6-03 ile varyant üretir.

| Kod | Soru | Test | Öncelik |
|---|---|---|---|
| **AS-1** | Mimari binada GroundSurface olmalı mı? | Aynı proje: GS'li / GS'siz | 🔴 En yüksek |
| AS-2 | Kapı alt boşluğu 10 ve 50 dışında (ör. 0, 5, 20 mm) kabul ediliyor mu? | 0 mm'yi denemeye gerek yok (temas = kesin hata); 20 mm varyantı | 🟡 |
| AS-3 | Arsa payı toplamı ≠ 1 tek bloklu binada uyarı/hata veriyor mu? | Kasıtlı 99/100 toplamlı varyant | 🟡 |
| AS-4 | Koordinat 3 hane kuralı: 4+ hane ret mi? (Ornek2 8–12 hane ile kabul) | 4 hane varyant | 🟡 |
| AS-5 | registeredQuality küçük harf ret mi? | "Mesken" varyantı | 🟡 |
| AS-6 | roofProjectionArea saçak dahil mi? | Ölçüm (7. tur) + varyant | 🟢 |
| AS-7 | Kat Biçimi A/B ile alt boşluk 10/50 birlikte mi değişiyor? (stil profili) | Ölçüm (7. tur) | 🟢 |
| AS-8 | Yapı Özet Formu resmi alan listesi | Kullanıcı gerçek bir formu paylaşırsa | 🟡 |
| AS-9 | V-196 (TIC ↔ aplikasyon) kadastro eşikleri | İade mesajlarından | 🟡 |

---

## 16. Gemini'ye 7. Tur İçin Kesin Talimat Listesi

**Kritik (veri bozar — M4 öncesi zorunlu):**
1. G6-EK2 mahal sözlüğünü **tamamen** C6-07 tablosuyla değiştir (SALON=1003, ODA=1001, MUTFAK=1004, WC/TUVALET=1006, HOL/ANTRE=1008; 1009 = DÜKKAN).
2. §2.1 pencere varsayılanlarını Rehber'e göre K46 rev metniyle değiştir; "400×400, tavan−300" ve "sill 800" ifadelerini kaldır.
3. K45 rev2: `doorSillOffset ∈ {10, 50}`; kapı yüksekliği açıklık tipinden; 2100 yalnız boş tip için rozetli.
4. §0-A "GroundSurface 9/9" → "6/9 (resmi örnekler 6/6; eski rejim 0/2; ret 0/1)"; K78 profil anahtarı + AS-1.
5. V-198: benzersiz BB üzerinden toplam; ciddiyet BİLGİ/UYARI; V-198a (Kılavuz 6 biçim kuralı, HATA) ekle.

**Yüksek:**
6. V-042b ciddiyetini BİLGİ yap; K45c'yi "üretim hedefi" olarak yeniden yaz.
7. K56-ek'i ekleme (reddedildi); C6-05 asistanını M4 opsiyonel özelliği olarak ekle.
8. V-064b'yi ekleme; C6-13 bilgi kartını ekle.
9. K73, K75, K76, K77, K79, K80'i şartname tablosuna ekle; V-199..V-205'i doğrulayıcı listesine ekle.
10. F3 v1 algoritmasını §11 Yol A olarak yaz ("Clipper2 Union of LINE" ifadesini kullanma).
11. §2.3 rejim tablosunu Kaynak Önceliği'ne ekle; C6-02 sihirbazını M1/M3 kapsamına al.
12. §13 tolerans tablosunu §4.5 olarak ekle (köşe sayısı satırı yok).

**Orta:**
13. C6-01 açıklık tipi kütüphanesi, C6-03 A/B test paketi, C6-08 örnekten öğren, C6-09 hata kataloğu, C6-11 normalize koruyucu, C6-12 kanonik özet, C6-16 Electron güvenliği.
14. IFC'yi v1 dışına al.
15. Eğik tavan hacmi için "2.5B prizma" yöntemini diverjans teoremine alternatif/yedek olarak yaz.
16. Ek-B ölçümlerini `golden/measure-report.json` olarak M0 çıktısına bağla.

---

## 17. DeepSeek, ChatGPT ve Grok'a 7. Tur Notları

- **DeepSeek:** D6-N1 (2.299) ve D6-N2 (1103.30, V-064b) düzeltmelerini kabul et; D6-06'daki `N % L === 0n` önerisini geri çek (fazla payı doğru sayar); D6-N3'ü §11 ile değiştir. measure-report örnek değerlerini Ek-B'den al.
- **Grok:** K56-ek ve V-064b desteğini geri çek; pencere varsayılanı "800–500" ifadesini Rehber'e göre düzelt; Türkçe kısayol seti öner.
- **ChatGPT:** 6. tur dosyası gelmedi; 7. turda özellikle AS-1 (GroundSurface) için Kılavuz'un farklı sürümlerinde bu dipnotun ne zaman eklendiğini araştırabilir (HelpNDoc sürüm geçmişi).
- **Hepsi:** "Ölçüldü" etiketi yalnız tekrar üretilebilir ölçümle (betik + dosya + SHA-256) kullanılsın. Bu turda benim de bir "9/9" hatam çıktı (§2.2) — kural herkes için.

---

## Ek-A. Ölçüm Aracı (Probe6) Yöntemi ve Tekrarlanabilirlik

- Dil: C# (.NET Framework, PowerShell `Add-Type` ile derlenir), yalnız `System.Xml`, `System.Core`, `System.Numerics`. Dosya dışı bağımlılık yok; GML XmlResolver=null ile (dış varlık yüklenmez) okunur.
- **N12:** `bldg:interiorRoom/bldg:Room` → FloorSurface ilk halkası z (taban), tek düz CeilingSurface z (tavan). Odanın `.//bldg:opening/*` her açıklığı için halka min/max z. Eğik/çoklu tavanlı odalar pencere-tavan ölçümünden çıkarıldı (kapı ölçümleri de aynı filtre altında; Ornek2'de çatı aralı odaların kapıları bu nedenle sayı dışı kalmış olabilir).
- **N13:** `gml:interior` içeren ve z aralığı > 0.3 m olan tüm poligonlar. Yatay doğrultu = dış halkanın ilk ≥ 5 cm'lik plan kenarı. Delik ve dış halka noktaları bu doğrultuya izdüşürülür; uç farklarının küçüğü = yan boşluk.
- **N14:** Aynı kat (z 0.1 m'ye yuvarlanmış) oda taban kenarları; uzunluk ≥ 0.3 m; paralellik |çapraz çarpım|/uzunluk ≤ 0.01; mesafe 2–60 cm; izdüşüm örtüşmesi ≥ 0.3 m; her kenar için en küçük mesafe, cm'ye yuvarlanmış.
- **N15:** buildingHeight; lod0FootPrint ve lod0RoofEdge ilk halka z; RoofSurface tüm noktalar max z; GroundSurface z.
- **N16:** `gen:GenericCityObject` (BB) propertyLot; BB kimliği = blockName|entrance|independentSectionNumber; BigInteger EKOK/EBOB ile tam kesir toplamı.
- **N17:** `bldg:Room[bldg:class='BagimsizBolumKisim']` gml:name son `_` sonrası etiket ↔ partUsage.
- **N18–N19:** düzenli ifade sayımları (stringAttribute değerleri, eleman varlığı).
- Betik: `scratchpad\scripts\Probe6.cs` (TypeScript'e çevrilip `tools/measure` altında M0 çıktısı olmalı).

## Ek-B. Ham Ölçüm Çıktıları (9 dosya)

```
#### Ornek1-M-130942262-A.gml
N12 kapı üst − oda tabanı: 210cm×1568  220cm×133
  kapı alt − oda tabanı: 10mm×1701
  pencere denizlik: 55cm×129  20cm×124  1cm×4
  pencere yüksekliği: 159cm×129  199cm×124  266cm×2  366cm×2
  pencere üst → tavan: 49cm×124  54cm×124  154cm×5  1cm×4
N13 toplam 5381, <10mm 0, en küçük 0.025 m  (>20cm×3383  5-20cm×1850  1-5cm×148)
N14 10cm×2256  20cm×996  25cm×428  50cm×11  30cm×4  45cm×2
N15 buildingHeight=48.60 | RoofEdge−FootPrint=48.60 | çatıMax−FootPrint=54.40 | RoofEdge−Ground=48.80 | çatıMax−Ground=54.60
N16 BB parçası=70, benzersiz BB=67, Σ(benzersiz)=362/363, Σ(tüm parçalar)=2281/2178
N17 Oda=1001×373 Banyo=1002×124 Tuvalet=1006×67 Hol=1008×63 Salon=1003×63 Mutfak=1004×62 Dükkan=1009×4 Teknik Hacim=1028×2 Kiler=1005×1

#### Ornek2-M-104527-A.gml
N12 kapı üst: 215cm×65  245cm×20  265cm×6 | kapı alt: 50mm×91
  pencere denizlik: 5cm×16  80cm×6  190cm×4  110cm×3  160cm×2
  pencere yüksekliği: 450cm×16  160cm×6  50cm×6  100cm×3
  pencere üst → tavan: 30cm×16  45cm×10  275cm×5
  ıslak: sill190/h50/top45×4  sill160/h50/top275×2  sill5/h450/top30×1
N13 toplam 508, <10mm 25, en küçük 0.001 m
N14 10cm×105  20cm×105  25cm×16  30cm×15  31cm×1
N15 buildingHeight=12.20 | RoofEdge−FootPrint=10.19 | çatıMax−FootPrint=13.40 | RoofEdge−Ground=14.00 | çatıMax−Ground=17.21
N16 17 / 13, Σ=1/1, Σtüm=115/77
N17 Banyo=1002×12 Oda=1001×12 Salon=1003×8 Dükkan=1009×5 Tuvalet=1006×5

#### Ornek3-M-87754451-B.gml
N12 kapı üst: 245cm×2113  285cm×16  345cm×4  235cm×3  485cm×2  305cm×1 | kapı alt: 50mm×2139
  pencere denizlik: 5cm×402  1cm×4 | yükseklik: 240cm×228  480cm×144  280cm×30  200cm×4
  pencere üst → tavan: 45cm×146  35cm×144  75cm×70  5cm×30  175cm×12  219cm×4
N13 toplam 8183, <10mm 233, en küçük 0.001 m
N14 10cm×3081  20cm×1274  60cm×140  35cm×118  40cm×70  25cm×69  6cm×28 ...
N15 buildingHeight=37.10 | RoofEdge−FootPrint=50.84 | çatıMax−FootPrint=52.34 | RoofEdge−Ground=60.50 | çatıMax−Ground=62.00
N16 181 / 173, Σ=471197/954497, Σtüm=491597/954497
N17 Oda=1001×362 Banyo=1002×232 Mutfak=1004×108 Dükkan=1009×75 Tuvalet=1006×64 Hol=1008×30 Kiler=1005×22

#### Ornek4-M-1605835-A.gml
N12 kapı üst: 240cm×107  250cm×8  210cm×7  220cm×4 | kapı alt: 10mm×126
  pencere denizlik: 11cm×64  10cm×48  3cm×18
  pencere yüksekliği: 290cm×45  388cm×30  219cm×22  396cm×18  303cm×8 ...
  pencere üst → tavan: 1cm×58  80cm×43  85cm×23  15cm×6
N13 toplam 790, <10mm 4, en küçük 0.006 m
N14 10cm×271  20cm×252  30cm×17  14cm×8 ...
N15 buildingHeight=12.60 | RoofEdge−FootPrint=11.49 | çatıMax−FootPrint=11.49 | RoofEdge−Ground=11.75 | çatıMax−Ground=11.75
N16 26 / 12, Σ=4542/8861, Σtüm=10544/8861
N17 Teknik Hacim=1028×46 Oda=1001×27 Kiler=1005×18 Niteliksiz Ortak Alan=1022×13 Banyo=1002×12 Mutfak=1004×12

#### Ornek5-M-47057336-A.gml
N12 kapı üst: 225cm×167  205cm×17 | kapı alt: 50mm×184
  pencere denizlik: 90cm×35  1cm×5  85cm×2 | yükseklik: 125cm×35 ... | üst → tavan: 50cm×37 ...
N13 toplam 680, <10mm 3, en küçük 0.002 m
N14 12cm×69  11cm×59  13cm×38  16cm×38  15cm×36  14cm×33  10cm×27  9cm×17 ...
N15 buildingHeight=15.50 | RoofEdge−FootPrint=14.90 | çatıMax−FootPrint=16.80 | RoofEdge−Ground=18.60 | çatıMax−Ground=20.50
N16 27 / 24, Σ=8/9, Σtüm=1/1
N17 Oda=1001×21 Dükkan=1009×17 Hol=1008×14 Banyo=1002×7 Mutfak=1004×7 Salon=1003×7 Tuvalet=1006×7 Kiler=1005×3

#### Ornek6-M-70125626-A.gml
N12 kapı üst: 220cm×36 | kapı alt: 10mm×36
  pencere denizlik: 90cm×15  180cm×4 | yükseklik: 140cm×15  50cm×4 | üst → tavan: 30cm×19
  ıslak: sill180/h50/top30×4
N13 toplam 191, <10mm 0, en küçük 0.093 m
N14 20cm×30  10cm×10
N15 buildingHeight=7.45 | RoofEdge−FootPrint=5.60 | çatıMax−FootPrint=7.80 | RoofEdge−Ground=5.60 | çatıMax−Ground=7.80
N16 2 / 2, Σ=1/1
N17 Oda=1001×4 Tuvalet=1006×4 Banyo=1002×2 Hol=1008×2 Mutfak=1004×2 Salon=1003×2

#### Amasya M-11597670-A.gml (kabul, eski rejim)
N12/N13 açıklık yok
N14 17cm×16  19cm×10  16cm×8  14cm×7  15cm×4  18cm×4  20cm×3  8cm×2  9cm×2  21cm×1
N15 GroundSurface yok; buildingHeight=5.80
N16 propertyLot yok
N17 Oda=1001×5 Banyo=1002×4 Hol=1008×2 Kiler=1005×2 Mutfak=1004×2 Salon=1003×1

#### Sincan M-3036492-A.gml (kabul, eski rejim)
N12 kapı üst: 221cm×311 | kapı alt: 10mm×311
  pencere denizlik: 70cm×62  10cm×18  90cm×2 | yükseklik: 140cm×48  210cm×18  150cm×14  60cm×2
  pencere üst → tavan: 55cm×48  45cm×32  115cm×2
N13 toplam 1129, <10mm 0, en küçük 0.056 m
N14 10cm×128  12cm×113  11cm×106  13cm×55  26cm×45  9cm×44  14cm×37  27cm×32 ...
N15 GroundSurface yok; buildingHeight=12.4
N16 propertyLot yok
N17 Oda=1001×47 Banyo=1002×31 Hol=1008×16 Mutfak=1004×16 Salon=1003×16 Tuvalet=1006×16

#### GML_M-17273333-F.gml (ret)
Açıklık yok; GroundSurface yok; propertyLot yok
N14 11cm×7  13cm×7  12cm×6  10cm×5  9cm×5  15cm×4  20cm×3 ...
buildingHeight=6.50; geometrySuitability=1005; tenderRegistrationNumber=2018605711; architecturalPlanID dolu
N17 Banyo=1002×3 Oda=1001×3 Hol=1008×2 Merdiven=1024×2 Kiler=1005×1 Mutfak=1004×1 Otopark=1016×1 Salon=1003×1
```

---

*Son söz (turu kapatırken):* Bu turun en önemli dersi, "ölçülmeli" denen her şeyin gerçekten ölçüldüğünde **en az bir AI'yı** (bu sefer ben dahil) düzelttiği. Uygulamanın kalitesini belirleyecek olan şey bu disiplin: her kural ya bir resmi metne ya da tekrar üretilebilir bir ölçüme bağlı olacak; ikisi çelişiyorsa (GroundSurface) uygulama bunu saklamayacak, kullanıcıya gösterecek ve resmi doğrulayıcıda test etmesini kolaylaştıracak.
