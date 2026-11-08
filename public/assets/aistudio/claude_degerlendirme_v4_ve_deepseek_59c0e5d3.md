# Gemini v4 Planı ve DeepSeek Değerlendirmesi — Denetim, Yeni Ölçüm Bulguları ve Sonraki Adım

> **Belge:** Claude'un 4. tur değerlendirmesi (07.11.2026)
>
> **İncelenenler:**
> - Gemini `implementation_plan (3).md` (v4)
> - DeepSeek paylaşımlı sohbet `chat.deepseek.com/share/3z2ehfey4wgac452fa` (Chrome ile açılıp metni okundu)
> - Bu turda TKGM'nin **8 GML dosyası** üzerinde yapılan yeni ölçümler: Ornek1, 2, 4, 5, 6 + Amasya + Sincan (başarılı) + Başarısız örnek
>
> **İlgili normatif belge:** `claude_uygulama_sartnamesi_v3.md`. Bu turda **v3.1** olarak düzeltildi (Bölüm 4'te değişiklik listesi). Bu belgede "Şartname" denince o belge kastedilir.
>
> **Etiketler:**
> - [ÖLÇÜLDÜ]: örnek dosyalarda programla sayıldı
> - [OKUNDU]: kaynak metinde yazıyor
> - ÖNERİ: tasarım tercihi
> - DOĞRULANMALI: hâlâ belirsiz

---

## 0. Özet Hüküm

1. **Gemini v4 doğru yöne gidiyor ama hâlâ bir özet.** Şartname'nin başlıklarını almış, mühendislik ayrıntılarını almamış: formüller, toleranslar, test hiyerarşisi, aşamalar, kütüphaneler, `core/` izolasyonu. DeepSeek'in bu tespiti **büyük ölçüde doğru** ve ben de katılıyorum.
2. **DeepSeek'in değerlendirmesi faydalı ama hatasız değil.** 7 noktada yanlış veya kaynaksız iddia var (Bölüm 2). En önemlisi kapı eşiği konusunda: DeepSeek, Şartname v3'teki eski önerimi ("kapı deliği döşemeye kadar iner") onaylamış. Bu turdaki ölçüm o önerinin **yanlış** olduğunu gösterdi (Bölüm 3, N1).
3. **Bu turun en önemli yeni bulgusu:** TKGM örneklerinde **hiçbir kapı/pencere deliği duvar poligonunun kenarına değmiyor**. Kapı deliği döşemenin **1 cm üstünden** başlıyor. Ne Gemini, ne DeepSeek, ne de önceki raporum bunu yakalamıştı. Kod bu kurala uymazsa üretilen duvarların büyük kısmı geçersiz poligon olur.
4. **Önerim (DeepSeek'ten farklı):** Gemini'ye bir kez daha plan (v5) yazdırmak yerine **Şartname v3.1 "normatif belge" olarak dondurulsun**. Gemini'nin planı onun özeti olarak kalsın ve şartnameye atıf yapsın. **Kodlama, Şartname'deki M0–M3 aşamalarıyla (okuyucu + doğrulayıcı + öznitelik düzeltici) hemen başlasın.** Plan döngüsü artık değer üretmiyor. Kalan belirsizlikler ancak gerçek dosyayı 3dbinadogrula'ya yükleyerek çözülebilir.

---

## 1. Gemini v4 Denetimi

### 1.1 v4'te doğru olanlar
- İki çalışma modu: (1) GML açma, doğrulama ve öznitelik düzeltme; (2) CAD'den GML üretme.
- Y/K/T üçlü doğrulama raporu, "%100 uyumlu" iddiasının kaldırılması.
- `blockNumber` ve `parcelNumber` string, onay tarihi `dateAttribute`, `1900-01-01` kuralı.
- Türkçe büyük harf, `registeredFloorDefinition` aynen.
- Kat dış sınırı bağımsız katman; `storeyId` / `groupStoreyId` ayrımı.
- Biçim B döşeme kutusu, açıklık halkası kopyası, kapı ve pencerede `class` yok.
- TIC 30 cm kaldırıldı, kod listeleri çalışma anında indiriliyor, `IntBuildingInstallation` → `lod4Geometry`, 12-gen sütun.
- Sınıf etiketlerinin tamamı doğru (`grp:class`, `gen:class`, `bldg:class` ayrımı).

### 1.2 v4'te hâlâ eksik veya yanlış olanlar

DeepSeek'in listesiyle örtüşenler kısaltılarak verildi; **benim ek bulgularım** ayrıca işaretlendi.

| # | Konu | Durum | Not |
|---|---|---|---|
| G4-1 | Alan, hacim ve sayım formülleri (Şartname 5.12) | ❌ yok | DeepSeek ile aynı |
| G4-2 | Tolerans tablosu (Şartname H13) | ❌ yok | DeepSeek ile aynı |
| G4-3 | Test hiyerarşisi (10.1–10.7) ve M0–M10 aşamaları (11) | ❌ yok | DeepSeek ile aynı |
| G4-4 | `buildingHeight` 0 < h < 950 | ⚠️ açık yazılmamış | DeepSeek ile aynı |
| G4-5 | Çoklu FootPrint/RoofEdge, 1 CeilingSurface/n poligon, LoD1 büyük alan kuralı | ⚠️ yok | DeepSeek ile aynı |
| G4-6 | `core/` izolasyonu, kütüphane listesi, deterministik GUID (uuidv5), SAX + Worker | ❌ yok | DeepSeek ile aynı |
| G4-7 | **"masaüstü/web"** ifadesi | ❌ | Kullanıcı Windows uygulaması istedi. Hedef yalnız Electron olmalı. |
| G4-8 | **"sunucu vekili"** (kod listesi indirmede) | ❌ (ek bulgu) | Masaüstü uygulamada ara sunucuya gerek yok. Uygulama 14 URL'yi doğrudan indirir. Ara sunucu gereksiz bir altyapı, bakım ve gizlilik yükü getirir; kaldırılmalı. |
| G4-9 | **TKGM örnek dosyalarının uygulamaya "hazır test paketi" olarak gömülmesi** | ⚠️ (ek bulgu) | Örnekler TKGM'nin yayımladığı dosyalardır ve uygulama içinde **dağıtım izni** belirsiz. Test için depoda tutulabilir. Kurulum paketine konulmamalı ya da kullanıcı ilk açılışta TKGM'den kendisi indirmeli (URL'ler Şartname 0.1'de). |
| G4-10 | **Kapı deliği alt kotu** | ❌ (yeni bulgu) | v4 "4 söve/lento" diyor ama kapı deliğinin döşemeden 10 mm yukarıda başlaması gerektiğini bilmiyor (Bölüm 3, N1). |
| G4-11 | **Biçim A'nın da kabul edildiği** | ⚠️ (ek bulgu) | v4 "B varsayılan, A seçilebilir" diyor. Bu doğru. Yeni ölçüm, başarılı örneklerin yarısının A olduğunu gösterdi (N2). Seçenek korunmalı. |
| G4-12 | **"5-Temsilli açıklık"** | ✅ | Şartname 5.4'teki T1–T5 ile uyumlu. |

---

## 2. DeepSeek Değerlendirmesinin Denetimi

DeepSeek, Şartname v3'ü ve Gemini v4'ü karşılaştırmış. **Doğru tespitleri:** v4 eksik, formül/tolerans/test/aşama/kütüphane listeleri planda yok, önce M1–M3. Ancak şu noktalar **yanlış veya kaynaksız**:

| # | DeepSeek'in iddiası | Gerçek durum |
|---|---|---|
| D1 | "Clipper2 vs Booster karşılaştırması (150 köşeli poligonda 3 sn vs 3,5 dk) gibi performans gerekçeleri yok" | Bu karşılaştırma ne Şartname'de ne de incelediğimiz herhangi bir TKGM kaynağında var. **Kaynaksız bir rakam**; plana konulmamalı. |
| D2 | Kütüphane lisansları (Clipper2 BSL-1.0, manifold Apache-2.0, earcut ISC, saxes ISC, xmllint-wasm MIT…) "Şartname 6.2'de" | Şartname'de lisanslar listelenmedi (yalnız val3dity GPL-3.0 ve citygml-tools Apache-2.0 için "kontrol edilmeli" dendi). Kütüphane tablosu Bölüm **9.1**'de, 6.2 doğrulama bölümü. Lisanslar büyük ihtimalle doğru ama **paket kurulurken tek tek doğrulanmalı**; plana "kesin" diye yazılmamalı. |
| D3 | Çatı arası düzlem birleştirmede "5° normal toleransı" | Şartname 5.9 **0.01°** diyor. 5° kullanılırsa farklı eğimli iki çatı yüzü tek "düzleme" birleşir ve düzlemsel olmayan poligon (-203) üretilir. **Yanlış.** |
| D4 | "additionalNote boş yazılırsa hata tablosu 'additionalNote boş olamaz' mesajı üretebilir" | Hata tablosunda böyle bir mesaj **yok**. Rehber: "Bu alanın TKGMCityGML içerisinde yer alması zorunlu değildir." `-` varsayılanı doğru, ama gerekçesi örneklerle uyumdur, hata riski değil. |
| D5 | Kapı eşiği: "Ornek6'da 1 cm boşluk var… kod deliği döşemeye kadar indirirse 'BB kat geometrisinin içinde kalmalı' ve 'yan duvarlar tabanın üstünden başlamalı' kuralları arasında sıkışabilir"; öneri "eşik yüzü yok, delik döşemeye iner" | Gerekçe yanlış, öneri de yanlış. 1 cm'nin sebebi o kurallar değil; **delik halkasının poligon kenarına değmemesi** gerekliliğidir. Delik döşemeye inerse dış halkaya değer ve poligon geçersiz olur (-205/-206). Ölçüm: 8 dosyada kenara değen delik sayısı **0** (N1). Bu öneri ilk olarak benim Şartname v3'ümde yer almıştı; **v3.1'de düzeltildi**. |
| D6 | "Şartname H1: PWA + Electron gereksiz" | Bu madde Şartname v3'te H1 değil (v3'te H1 `blockNumber` tipi); ikinci incelemedeki (v2 raporu) H1'dir. İçerik doğru, atıf yanlış. Küçük ama planın kaynak izlenebilirliğini bozar. |
| D7 | "v4 %85 hazır" ve "Gemini v5 üretsin, ben yeniden karşılaştırayım" | Yüzde ölçülemez. Ayrıca **plan döngüsü (v1 → v5) giderek daha az yeni bilgi üretiyor**. Her yeni planın yaptığı, Şartname'yi yeniden özetlemek. Doğru adım Şartname'yi normatif kabul edip koda geçmek (Bölüm 5). |

**DeepSeek'in eklediği doğru ve değerli noktalar:**
- "Her v4 maddesinin yanına 'Detay: Şartname §X.Y' atfı konmalı."
- "Kaynak önceliği ve kanıt etiketleri planda da kalmalı."

İkisi de Bölüm 5'teki öneriye dahil edildi.

---

## 3. Bu Turda Yapılan Yeni Ölçümler (8 Dosya)

Ölçümler için C# ile yazılmış iki inceleme aracı kullanıldı (Probe2, Probe3). Her açıklık deliği için delik halkasının alt ve üst kotu, bulunduğu poligonun alt ve üst kotuyla karşılaştırıldı. Oda hacimleri üç farklı formülle denendi, kat geometrisi biçimi ve ortak alan duvar türü tek tek sınıflandırıldı.

### N1 🔴 Açıklık deliği duvar poligonunun kenarına asla değmez; kapı deliği döşemenin 10 mm üstünden başlar

| Dosya | Poligon türü | Kapı deliği alt kenarı – poligon alt kenarı | Adet |
|---|---|---|---|
| Ornek6 | Oda iç duvarı | **+0.010 m** | 36/36 |
| Ornek6 | BB küveti duvarı | +0.010 m (36), > 1 cm (8, dış yüz poligonu daha aşağıdan başlıyor) | 44 |
| Ornek6 | LoD2 dış duvar, Kat duvarı | > 1 cm (duvar kat altından başlıyor) | 8 + 8 |
| Ornek4 | Oda iç duvarı | **+0.010 m** | 126/126 |
| Ornek4 | BB küveti | +0.010 m (115), > 1 cm (15) | 130 |
| Sincan (başarılı) | Oda | **+0.010 m** | 311/311 |
| Ornek2 | Oda kapı nesnesi | **+0.050 m** | 99/99 |
| **8 dosyanın tamamı** | **herhangi bir poligon** | **kenara değen delik** | **0** |

Pencerelerde de üst kenar hiçbir yerde tavana değmiyor ("TOUCHES-top" = 0).

**Neden:** OGC Simple Features ve val3dity'ye göre bir poligonun iç halkası dış halkayla bir kenar boyunca temas edemez (-205/-206). Kapı deliği döşemeye kadar inerse, oda iç duvarının alt kenarıyla çakışır ve poligon geçersiz olur.

**Kural (Şartname v3.1'e işlendi, K45 ve K45a):**
- Kapı deliğinin alt kenarı = `zFloorTop + 10 mm`. Bu, oda duvarında, BB küvetinde, OA dış duvarında ve LoD2'de **aynı kot**tur.
- Kapı nesnesi (`Door_`) bu deliğin kopyasıdır, dolayısıyla o da +10 mm'den başlar.
- Hiçbir delik, bulunduğu poligonun dış halkasına 10 mm'den yakın olamaz.
- BB küvetinde kapı altında 1 cm'lik duvar şeridi ve bunun üst yüzü (yatay `Wall_`, eşik yüzü) üretilir.
- Kapı yüksekliği hesaplanırken taban `zFloorTop + 10 mm` alınır. Örnek: Ornek6'da kapı 1096.110 → 1098.300.
- **Doğrulayıcıya eklenecek kural (V-042, yeni):** "Delik halkası, dış halkaya 1 mm'den yakın olamaz." Hata düzeyi: H.

### N2 🟠 Kat geometrisinde Biçim A ve Biçim B, ikisi de "başarılı" örneklerde var

| Biçim | Dosyalar |
|---|---|
| **A** (tek taban poligonu, duvarlar kat altından) | Ornek6, Ornek4, Ornek1, **Amasya (başarılı)** |
| **B** (döşeme kutusu + kenar yüzleri, duvarlar döşeme üstünden) | Ornek2, Ornek5, **Sincan (başarılı)** |

Sonuç: Doğrulayıcı ikisini de kabul ediyor. Şartname'deki "B varsayılan, A seçilebilir" kararı korunuyor (K55 güncellendi).

### N3 🟠 Ortak alanın dış cephe duvarı: iç yüz de `Wall_`

| Dosya | OA sayısı | OA taban sınırında `Wall_` (iç yüz) | Dış yüzde `Wall_` | Bölmelerde `InteriorWall_` |
|---|---|---|---|---|
| Ornek2 | 8 | ✓ | ✓ | ✓ |
| Ornek5 | 16 | ✓ | ✓ | ✓ |
| Ornek4 | 10 | ✓ | ✓ | ✓ |
| Amasya | 2 | ✓ | ✓ | ✓ |
| Sincan | 15 | ✓ | ✓ | ✓ |

**Kural:** OA'nın dış cephe kenarındaki iç yüz, kalınlıklı dış duvarın tüm yüzleri (iç, dış, üst kapak, açıklık yan yüzleri) `bldg:WallSurface` (`Wall_`) olarak yazılır. OA'nın iç bölme kenarları `InteriorWallSurface` olur. Şartname 5.5 madde 4'teki "DOĞRULANMALI" notu **kapandı**.

### N4 🟠 Oda hacmi: yeni örnekler oda yüksekliğini, Amasya kat yüksekliğini kullanıyor

| Dosya | `volume / (calculatedArea × oda yüksekliği)` | Adet |
|---|---|---|
| Ornek6 | 1.00 | 16/16 |
| Ornek2 (düz tavan) | 1.00 | 34/34 |
| Ornek4 | 1.00 (112), 0.99 (16) | 128 |
| Sincan (başarılı) | 1.00 | 142/142 |
| **Amasya (başarılı)** | **1.08**, yani hacim = alan × **2.80** (kat yüksekliği), oda yüksekliği 2.60 | 16/16 |

**Sonuç:**
- Doğrulayıcı hacmi tolerans içinde **uyarı** olarak değerlendiriyor ([OKUNDU, SÜRÜM v2.23]: "Hacim kontrolü tolerans dahilindeki hatalarda uyarı verecek şekilde güncellendi").
- Amasya'nın %8 farkla geçmesi bunu doğruluyor.
- **Kural:** `volume = calculatedArea × (zCeiling − zFloorTop)`, yani oda yüksekliği. En yeni örneklerle uyumlu olan budur. Değişiklik yok.

### N5 🟡 İç yapı (sütun, merdiven) oda hacminden düşülmüyor

- Ornek5'te 9/9, Ornek4'te 8/8 iç yapılı odada hacim = alan × yükseklik (iç yapı düşülmemiş).
- Ornek2'deki 9 odanın 4'ünde fark var; bunlar eğik tavanlı çatı arası odaları (N6).
- **Kural:** Oda hacmi ve alanı iç yapıdan bağımsız hesaplanır (Şartname K59 ile uyumlu).

### N6 🟡 Eğik tavanlı oda hacmi hâlâ kesinleşmedi

- Ornek2'deki 8 eğik tavanlı odada `volume` değeri her zaman `alan × en düşük yükseklik` ile `alan × en yüksek yükseklik` arasında. Örnek: oda 5 "Oda": 49.56 < **64.21** < 83.96.
- Tavan poligonlarının altındaki hacmi integrallemeyi denedim. Örneklerdeki tavanlar birbiriyle çakışan ve ters yönlü poligonlar içerdiği için tutarlı sonuç alınamadı.
- **Kural (değişmedi):** Eğik tavanda hacim = kapalı kabuğun gerçek çokyüzlü hacmi (Şartname 5.12). Doğrulayıcı bunu uyarı düzeyinde kontrol ettiği için risk düşük. DOĞRULANMALI: ilk çatı aralı gerçek projede.

### N7 🟡 Eğik tavanlı odalarda yükseklik

Ornek2'deki 9 eğik odanın en düşük ve en yüksek yükseklikleri: 1.6/1.7, 1.2/2.0, 1.9/2.1, 1.9/2.9 m. En düşük nokta 1.5 m'nin altına inebiliyor (1.2 m). **Şartname H18 önerisi doğrulandı:** 1.5 m kontrolü odanın **en yüksek** tavan noktasına göre yapılmalı.

### N8 🟡 Ornek1'de bağımsız bölüm taban deliği

- 70 BB'nin 62'sinde tabanda **tek** delik var: 3.038 m², yaklaşık 0.92 × 3.73 m (şaft).
- `independentSectionCalculatedArea` her seferinde dış kontur alanından **tam 2.10 m²** küçük (62/62). Bu değer ne delikli net alan (dış − 3.04) ne de dış alan.
- Bu dosya muhtemelen eski bir hesap yöntemiyle üretilmiş ve doğrulayıcı farkı (%0.6) tolere etmiş.
- **Kural (değişmedi):** BB tabanında delik bırakılmamalı. Şaft BB dışına niteliksiz OA (1022) olarak, ya da BB içinde Teknik Hacim (1028) kısmı olarak alınmalı. Böylece `calculatedArea = taban alanı` belirsizliksiz sağlanır.

### N9 ✅ Önceki bulguların teyidi
- LoD1: bodrum varsa 2 solid (Ornek2, Ornek5, Ornek1, Sincan), yoksa 1 (Ornek6, Ornek4, Amasya).
- RoofEdge çoklu poligon: Ornek5'te 2.
- BB taban üst kotunda yatay `Wall_` yok (8/8 dosya). Döşeme üstü yalnız `Floor_`.

### N10 🟡 Eski örneklerde açıklık halka öneki tutarsız
- Ornek2'de kapı deliklerinin halka id'leri `DoorLinearRing_` ile başlamıyor (Ornek2'de LoD2'deki 27 kapı deliği farklı önekli).
- Sincan'da kapı delikleri `WindowLinearRing_` önekiyle sınıflandı.
- Demek ki TKGM doğrulayıcısı bu öneki eski dosyalarda katı denetlemiyor ya da örnekler kural öncesinden kalma. **Uygulama yine de kurala (`DoorLinearRing_`) uyar.** Doğrulayıcımız bu örnekler için istisna dosyasına (`knownSampleExceptions.json`) ekleme yapar.

---

## 4. Şartname v3 → v3.1 Değişiklikleri (bu turda dosyaya işlendi)

| Bölüm | Değişiklik |
|---|---|
| K45 | Kapı alt kenarı = `zFloorTop + 10 mm` eklendi (N1) |
| **K45a (yeni)** | Hiçbir delik, bulunduğu poligonun dış halkasına değmez (N1) |
| K55 | Biçim A ve B'nin ikisinin de başarılı örneklerde bulunduğu eklendi (N2) |
| 5.4 madde 3 | Kapı `sill = 10 mm` (eskiden 0) |
| 5.5 madde 4 | OA dış cephe iç yüzü `Wall_`, "DOĞRULANMALI" kapandı (N3) |
| 5.6 madde 3 | "Eşik yüzü üretilmez, delik döşemeye iner" önerisi **kaldırıldı**; yerine +10 mm kuralı ve eşik yüzü |

**Ayrıca eklenmesi gerekenler** (bir sonraki şartname düzenlemesinde; kodu etkilemez, doğrulayıcıya eklenir):
- **V-042 (yeni):** Delik halkası ile dış halka arası ≥ 1 mm. Düzey: H.
- **V-158 notu:** Hacim karşılaştırması uyarı düzeyinde; Amasya'daki %8 fark kabul edilmiş.
- **`knownSampleExceptions.json`:** Ornek1 BB alanı (N8), Ornek2 ve Sincan halka önekleri (N10), Amasya hacim formülü (N4).
- **Bölüm 12, açık sorular:** 10. soru (Biçim A/B) "ikisi de kabul ediliyor" olarak cevaplandı. 4. ve 5. sorular (eğik tavan hacmi ve yükseklik) N6 ve N7 bulgularıyla güncellendi.

---

## 5. Sonraki Adım Önerisi

### 5.1 Neden yeni bir plan (v5) değil?

| Tur | Belge | Yeni bilginin kaynağı |
|---|---|---|
| 1 | Gemini v1 | — (genel fikir) |
| 2 | Claude inceleme 1 | TKGM rehberi |
| 3 | Gemini v2, Claude inceleme 2 | 6 örnek dosya + kod listeleri |
| 4 | Gemini v3, Claude şartname v3 | Kılavuz + sürüm geçmişi + ölçümler |
| 5 | Gemini v4, DeepSeek, Claude v3.1 | Yeni ölçümler (N1–N10) |

Her turda yeni bilgi **ölçümden ve kaynaktan** geldi, planı yeniden yazmaktan değil. Gemini'nin her yeni planı Şartname'yi yeniden özetliyor. Kalan belirsizlikler artık ancak:
- (a) kod yazıp TKGM örneklerine karşı test ederek,
- (b) ilk gerçek dosyayı 3dbinadogrula'ya yükleyerek

çözülebilir.

### 5.2 Önerilen karar

1. **`claude_uygulama_sartnamesi_v3.md` (v3.1) normatif belge olarak dondurulsun.** Gemini'nin planı bunun "yönetici özeti" olsun ve her maddesi Şartname bölümüne atıf yapsın (DeepSeek'in önerisi).
2. **Kodlamaya M0 → M1 → M2 → M3 ile başlansın:** altyapı + GML okuyucu + doğrulayıcı + öznitelik düzeltici. Kabul kriteri: 8 TKGM dosyası (6 örnek + Amasya + Sincan) doğrulayıcımızda istisnalar dışında **sıfır hata**; Başarısız örnekte beklenen hataların hepsi.
3. Bu üç aşama, çizim motoru olmadan da kullanılabilir bir ürün çıkarır: reddedilen GML'yi açıp düzeltme.
4. M4 ve sonrası (CAD + geometri motoru), M2 doğrulayıcısı TKGM örneklerinde sıfır hata verdikten sonra başlar. Doğrulayıcı, üretim motorunun hakemidir.

---

## 6. Gemini'ye Gönderilecek Metin (kopyala-yapıştır)

> Gemini,
>
> v4 planın doğru yönde; sınıf etiketleri, veri tipleri, Biçim B, açıklık halkası kopyası, dinamik kod listeleri ve Y/K/T raporu tamam. Bundan sonra yeni bir plan sürümü yerine şu şekilde ilerleyelim:
>
> 1. **`claude_uygulama_sartnamesi_v3.md` (v3.1) normatif belgedir.** Planındaki her madde ilgili Şartname bölümüne atıf yapsın (örn. "Alan/hacim: Şartname §5.12"). Planla şartname çelişirse şartname geçerlidir.
> 2. Planından şunları düzelt:
>    - (a) "masaüstü/web" yerine yalnız **Windows (Electron)**.
>    - (b) Kod listesi indirmede **"sunucu vekili" yok**; 14 URL doğrudan indirilir, yerelde önbelleğe alınır.
>    - (c) TKGM örnek GML'leri kurulum paketine **gömülmez**; test deposunda tutulur veya kullanıcı TKGM'den indirir.
> 3. **Yeni kural (v3.1, K45/K45a):** Hiçbir kapı/pencere deliği bulunduğu poligonun dış halkasına değmez. Kapı deliği `zFloorTop + 10 mm`'den başlar (TKGM'nin 8 dosyasında kenara değen delik sayısı 0; oda kapıları Ornek6 36/36, Ornek4 126/126, Sincan 311/311 +10 mm). BB küvetinde kapı altında 1 cm'lik duvar şeridi ve eşik yüzü üretilir. Doğrulayıcıya V-042 eklenir.
> 4. **Kesinleşenler:** OA dış cephe iç yüzü `Wall_`. Kat Biçim A ve B ikisi de kabul (B varsayılan). Oda hacmi = alan × oda yüksekliği. İç yapı hacimden düşülmez. 1.5 m kontrolü en yüksek tavan noktasına göre.
> 5. **Kodlamaya Şartname §11 M0–M3 ile başla:** Electron + TS iskeleti, `core/` (DOM'suz), kod listesi servisi, SAX GML okuyucu, V-001…V-195 + V-042 doğrulayıcı, öznitelik düzeltici ve yazıcı. Kabul: 6 Ornek + Amasya + Sincan'da `knownSampleExceptions.json` dışında sıfır hata; Başarısız örnekte beklenen hatalar (1005, dolu ihale no, kapı/pencere yok, ortometrik olmayan Z).
> 6. M4 (CAD) ve M5 (geometri motoru), M2 bu kabulü geçtikten sonra başlar.
> 7. Planında ve arayüzde kaynaksız rakam (performans karşılaştırması, lisans adı) kesin bilgi gibi yazılmasın; paket seçilirken doğrulanıp `package.json`'a kesin sürümle konsun.

---

## 7. Hâlâ Açık Olan Konular (yalnız gerçek yüklemeyle çözülür)

| # | Konu | Mevcut karar |
|---|---|---|
| 1 | Koordinat "tam 3 hane" mi, "en fazla 3" mü | Tam 3 hane yaz (en katı yorum) |
| 2 | Büyük harf denetlenen alanlar | Üretici metinleri TR büyük; `registeredFloorDefinition` aynen |
| 3 | Eğik tavan hacmi (N6) | Gerçek çokyüzlü hacim; uyarı düzeyinde |
| 4 | Müstakil yapıda BB giriş kapısı 1001 mi 1003 mü | Ornek6 (villa): 1003 kapı mevcut (2 adet) → **1003 de konmalı** |
| 5 | Uzak kısım mı, ayrı BB parçası mı (başka kattaki depo) | Ayrı BB parçası (1005/1006) varsayılan |
| 6 | MAKS servisine erişim | Kullanıcı girer; yerelde uyarı |
| 7 | `roofProjectionArea` saçak dahil mi | Saçak dahil (Ornek6 ile uyumlu); RoofEdge farkı uyarı |

Bu tablodaki 4. madde bu turda kısmen netleşti: [ÖLÇÜLDÜ] müstakil villa olan Ornek6'da da `doorUsage=1003` "Bağımsız Bölüm Kapı" iki adet var. Güvenli yol, müstakil yapılarda da BB'ye bir 1003 kapı atamaktır.
