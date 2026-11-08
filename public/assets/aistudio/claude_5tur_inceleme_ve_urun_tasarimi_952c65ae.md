# TKGM 3B Dijital Bina Uygulaması — 5. Tur Değerlendirme

**Konu:** Gemini v5, ChatGPT ve DeepSeek belgelerinin denetimi, yeni araştırma ve ölçümler, üç bakış açısından ürün tasarımı.

> **Hazırlayan:** Claude, 07.11.2026
>
> **Bakış açıları:** Bu belge üç farklı rol üstlenilerek yazıldı:
> - **Yazılım mühendisi:** mimari, doğruluk, test edilebilirlik
> - **Harita mühendisi:** koordinat, kot, aplikasyon, kadastro kontrolü
> - **Son kullanıcı:** günlük iş, zaman, ret döngüsü, kullanım kolaylığı
>
> **İncelenen belgeler:**
> 1. Gemini: `implementation_plan (4).md` (bu belgede "**Gemini v5**")
> 2. ChatGPT: `TKGM_3B_Dijital_Bina_Uygulamasi_Inceleme_ve_Uygulama_Onerisi.md`
> 3. DeepSeek paylaşımı `chat.deepseek.com/share/nd2m1ovd7pwl485xa6` (Chrome ile açılıp tam metni okundu)
>
> **Normatif belge:** `claude_uygulama_sartnamesi_v3.md` (v3.1, bu turda v3.2 değişiklikleri önerildi; bkz. Bölüm 8).
>
> **Kanıt etiketleri:**
> - [ÖLÇÜLDÜ]: TKGM GML dosyalarında programla sayıldı
> - [OKUNDU]: kaynak metinde yazıyor
> - [RAKİP]: rakip yazılımın kendi belgesinden
> - ÖNERİ: tasarım tercihi
> - DOĞRULANMALI: hâlâ belirsiz

---

## İçindekiler
0. Özet Hüküm
1. Bu Turda Yapılan Araştırma
2. Gemini v5 Denetimi
3. ChatGPT Belgesi Denetimi
4. DeepSeek Değerlendirmesi Denetimi
5. Yeni Ölçüm: Açıklık Kotlarının Temsiller Arası Tutarlılığı (N11)
6. Mevzuattan Gelen Yeni Gereksinimler (Genelge 2025/2 Madde Madde)
7. Rakip Analizi: GMLCity, LiCity, Yapınet — Kullanıcılar Bugün Ne Yaşıyor?
8. Şartname v3.2 İçin Değişiklik Listesi
9. Üç Bakış Açısından Ürün Tasarımı
10. Yeni Özellik Önerileri (Öncelikli)
11. Güncellenmiş Yol Haritası
12. Gemini'ye Talimat Metni
13. Açık Sorular (Güncel)
14. Kaynaklar

---

## 0. Özet Hüküm

1. **Gemini v5 kodlamaya başlamak için yeterli.** Şartname v3.1'i normatif kabul etmiş. Formül tablosu, tolerans matrisi, M0–M10 görev listesi ve kabul testleri yerinde. **M0–M3 için "Proceed" verilebilir.** Ancak 9 düzeltme ve 6 eksik var (Bölüm 2). En kritik olanı **M3'teki "yeniden yazarken 3 haneye yuvarla" davranışı**: mevcut bir dosyayı düzeltirken geometrisi bozulabilir.
2. **Gemini'nin G-EK2 önerisi ölçümle doğrulandı, DeepSeek'in itirazı yanlış.** Bina dış duvarındaki açıklık ile odadaki karşılığının genişliği ve üst kotu **4 dosyada, 297 açıklığın tamamında birebir aynı**. Alt kot ya birebir aynı (Ornek2 71/71, Sincan 101/101) ya da dış duvarda 1 cm aşağıda (Ornek6, Ornek4). Bkz. Bölüm 5.
3. **Gemini'nin G-EK1 önerisini (açıklığın duvar köşesine değmemesi) bir rakip de doğruluyor.** GMLCity rehberi: kapı/pencere geometrisi "duvarı mutlaka kesmeli ama duvarın başlangıç ve bitiş köşe noktalarına değmemeli". [RAKİP]
4. **ChatGPT'nin belgesi değerli ama eski bilgiye dayanıyor.** Yalnız ilk üç Gemini planını görmüş, TKGM kaynaklarına doğrudan erişememiş, ikincil bir kopya (Lider Yazılım portalı) kullanmış. Bu yüzden 5 teknik önerisi ölçülmüş kanıtla çelişiyor:
   - 30 cm TIC
   - `buildingHeight` string
   - `measuredHeight` açık bırakılmalı
   - GroundSurface belirsiz
   - `lod2Solid` belirsiz

   Buna karşılık **hukuki sorumluluk, kontrol statüleri ("DIŞ KONTROL GEREKLİ"), otomatik düzeltme sınırları, kaynak iz kaydı ve 2027 BIM/IFC yönetmeliği** konularında çok değerli katkılar yapıyor. Bunlar plana alınmalı (Bölüm 3).
5. **DeepSeek'in değerlendirmesi dikkatli ama iki yanlış içeriyor.** G-EK2'nin "çeliştiği" iddiası ve V-042'nin val3dity eşlemesi. **İki doğru ve değerli önerisi** var: V-042'yi iki düzeyli yapmak (< 1 mm hata, 1–10 mm uyarı) ve ölçüm iddialarının tekrarlanabilir olması (Bölüm 4).
6. **Mevzuattan yazılımı doğrudan etkileyen ve hiçbir planda olmayan bir gereksinim çıktı.** Genelge 2025/2 Madde 6/4'e göre doğrulama sonrası otomatik oluşan **"Yapı Özet Formu"** içindeki TIC, kadastroda **Yapı Aplikasyon Projesi ile koordinat, kot, taban oturumu, alan ve parsel içindeki yerleşim bakımından** elektronik olarak karşılaştırılıyor. Uyuşmazsa dosya iade ediliyor. Uygulama bu karşılaştırmayı **göndermeden önce** yerelde yapmalı (Bölüm 6, F1).
7. **Asıl müşteri harita mühendisidir.** [OKUNDU, Genelge Madde 3] Model "yapı aplikasyon projesi müellifi sorumluluğunda üretilen" bir eldir. Tasarım kararları bu kullanıcının gününe göre verilmeli (Bölüm 9).
8. **İleriye dönük stratejik fırsat:** 05.08.2026 tarihli ve 33331 sayılı Resmî Gazete'de yayımlanan "Mimarlık ve Mühendislik Projelerinin Dijital Olarak Hazırlanması Hakkında Yönetmelik", BIM modelinin **IFC** formatında teslimini düzenliyor (haberlere göre yürürlük 1 Eylül 2027, kademeli). Bu, mimari projelerin yakında IFC olarak geleceği anlamına geliyor. **IFC'den TKGMCityGML üretimi** büyük bir zaman tasarrufu ve rakiplere karşı fark olur (F8).

---

## 1. Bu Turda Yapılan Araştırma

| Konu | Kaynak | Sonuç |
|---|---|---|
| Gemini v5 | `implementation_plan (4).md` | Tamamı okundu (224 satır) |
| ChatGPT | `TKGM_3B_..._Onerisi.md` | Tamamı okundu (704 satır) |
| DeepSeek | Paylaşım bağlantısı (Chrome) | Tam metin okundu |
| Genelge 2025/2 | Lexpera tam metin (Madde 1–8) + TKGM duyuru sayfası | Madde madde okundu. TKGM'nin orijinal PDF'i taranmış görüntü, metin katmanı yok. 25.02.2026 değişiklik PDF'i içerik döndürmedi; Lexpera konsolide metninden yalnız Madde 3'teki tanım düzeltmesi görüldü |
| Rakip: GMLCity | `gmlcity.com.tr/rehber` (sürüm 2026.1.18.1400) | Tüm rehber okundu |
| Rakip: LiCity (Lider Yazılım) | Lider portalı kullanım kitabı + ürün sayfası (sürüm 3.4.0.0, 25.08.2026) | Okundu (kitapta 2 sayfa var) |
| Rakip: Yapınet (Netcad) | Ürün sayfası | Okundu. Teknik wiki TLS hatası verdi |
| BIM/IFC yönetmelikleri | Arama sonuçları (alomaliye, hakedis, legalbank, lexpera) | 05.08.2026, RG 33331; IFC (TS EN ISO 16739-1) ve ISO 19650. Yürürlük tarihleri haberlerden, resmî metinden teyit **DOĞRULANMALI** |
| **Yeni ölçüm N11** | Ornek6, Ornek4, Ornek2, Sincan | Bina dış duvarı açıklıkları ile oda açıklıklarının kot ve genişlik karşılaştırması (Bölüm 5) |

---

## 2. Gemini v5 Denetimi

### 2.1 Doğru ve güçlü olanlar
- Şartname v3.1'i normatif üst belge ilan etmesi ve bölüm atıfları.
- Formül tablosu (§2.2), tolerans matrisi (§2.3), kot motoru formülleri (§2.1).
- M0–M10 görev kırılımı ve her aşamanın kabul testi. Özellikle **M2 kabulü** (8 dosyada sıfır hata + Başarısız örnekte beklenen hatalar).
- Okuyucuda toleranslı, yazıcıda katı davranış (G-EK4).
- Çok bileşenli BB duvar üst kapağı (G-EK3). Clipper2 `PolyTree` ile doğal sonuç; hatırlatma olarak doğru.
- Kod listelerinde ara sunucu (vekil) yok; TKGM örnekleri kurulum paketine gömülmüyor; yalnız Electron hedefleniyor.

### 2.2 Düzeltilmesi gerekenler

| # | Konu | Sorun | Düzeltme |
|---|---|---|---|
| G5-1 🔴 | **M3: Düzeltme modunda 3 haneye yuvarlama** | v5 M3.1 yazıcı "tam 3 ondalık" yazıyor, M3 kabulü "3 hane yuvarlanmış köşe kümeleri birebir korunsun" diyor. Mevcut bir dosya (örnek: Ornek2'de 8–12 haneli koordinatlar) 3 haneye yuvarlanınca **komşu yüzeylerin ortak köşeleri farklı yuvarlanabilir, eğik yüzler düzlemsellikten çıkabilir, ince açıklık halkaları dış halkaya değebilir.** Sonuç: kullanıcı yalnız bir özniteliği düzeltmek isterken geometri hatası alır. | **Öznitelik düzeltme modunda varsayılan "geometriyi aynen koru"** olmalı: koordinat metni dokunulmadan yazılır. Ayrı bir komut "Koordinatları 3 haneye normalize et" sunulur; çalıştırıldıktan sonra doğrulayıcı **otomatik yeniden çalışır** ve öncesi/sonrası farkı gösterilir. Yeni üretimde (M5+) zaten mm ızgarası olduğu için sorun yok. |
| G5-2 🔴 | **Yapı Özet Formu ve TIC karşılaştırması yok** | Genelge Madde 6/4 (Bölüm 6) | Yeni görev M7.3: "Yapı Özet Formu önizleme + TIC ↔ aplikasyon karşılaştırma raporu" (F1) |
| G5-3 🔴 | **Kadastro dönüşüm parametreleri ve çift koordinat seti** | Genelge Madde 6/4: arşiv koordinatı başka sistemdeyse kadastronun "imzalı ve onaylı dönüşüm parametreleri" kullanılır ve **iki koordinat seti de** yapı aplikasyon projesinde gösterilir. v5'teki Helmert sihirbazı yalnız "plan → TUREF" oturtmasını kapsıyor. | Georef modeline `officialTransform` eklenmeli: kaynak sistem adı, parametreler, kaynak belge no/tarih, uygulanan nokta listesi. Raporda iki koordinat seti yan yana gösterilmeli (Bölüm 9.2). |
| G5-4 🟠 | **V-042 tek düzeyli** | DeepSeek'in önerisi doğru: eski örneklerde 1–10 mm arası aralıklar olabilir. | V-042a **Hata:** delik ↔ dış halka < 1 mm (temas/kesişim). V-042b **Uyarı:** 1–10 mm. Üretim hedefi ≥ 10 mm. |
| G5-5 🟠 | **V-042'nin val3dity eşlemesi** | v5 "-205/-206" diyor. Delik dış halkaya **kenar boyunca değerse** halkalar kesişir; val3dity bunu **201 (INTERSECTION_RINGS)** olarak raporlar. 205 iç halkanın dış halkayı bölmesi, 206 iç halkanın dışarıda kalması içindir. | Eşleme: -201 (birincil), -205/-206 (ilgili durumlar). |
| G5-6 🟠 | **G-EK2'nin dayanağı** | Ölçümle doğrulandı (N11) ama planda "ölçüm" olarak etiketlenmemiş. | G-EK2 metnine: "[ÖLÇÜLDÜ N11] genişlik ve üst kot 297/297 aynı; alt kot Ornek2 71/71, Sincan 101/101 aynı, Ornek6/Ornek4'te LoD2 1 cm aşağıda. Karar: tüm temsillerde **tek mutlak z aralığı** [zFloorTop+10, üst]." |
| G5-7 🟠 | **G-EK1 kırpma davranışı** | 4 yönlü 10 mm güvenlik bandı doğru, ama sessiz kırpma kullanıcıyı yanıltır. | Kırpma gerekirse açık bildirim: "Pencere duvara sığmıyor: 1.20 → 1.18 m kısaltıldı (onay?)". Otomatik kırpma kullanıcı onayıyla yapılmalı. |
| G5-8 🟡 | **Kapı yüksekliği formülü** | v5: `zDoorTop = min(zFloorTop + 10 + doorHeight, zCeiling − 10)`. Projede kapı yüksekliği genellikle tabandan ölçülür (2.10 m); +10 mm eşikle üst kot 2.11 m olur. | ÖNERİ: `zDoorTop = zFloorTop + doorHeight` (projeden), `zDoorBottom = zFloorTop + 10`. Kapının görünür yüksekliği 1 cm kısalır ama üst kot projeyle birebir kalır. Lento ve pencere hizası projeyle uyuşur. [ÖLÇÜLDÜ] Ornek6 kapı üstü 1098.300 = zFloorTop 1096.100 + 2.200; alt 1096.110. Formül bununla birebir uyuşuyor. |
| G5-9 🟡 | **"Sapma ≤ %1" (M4 kabulü)** | Çizim doğruluğu kullanıcı çizimine bağlı; kabul testi için belirsiz. | M4 kabulü: Ornek6 tasarım JSON'u (elle girilmiş referans) **yüklendiğinde** canlı alanların Ornek6 `calculatedArea` değerleriyle ±0.01 m² eşleşmesi. |

### 2.3 Eksikler (v5'te hiç yok)
1. **Kullanıcının değer bulma yardımı:** MAKS numarası, TAKBİS mahalle referansı, Taşınmaz No nereden bulunur? (F4)
2. **Ret döngüsü araçları:** TKGM doğrulama sonucunu uygulamaya geri alıp hatalı nesneyi gösterme (F2).
3. **Proje dosyası biçimi, otomatik kayıt, sürüm geçmişi ve çökme kurtarma** (Bölüm 9.3).
4. **DXF'ten otomatik oda/BB bulma** ve metin etiketlerinden kullanım ve alan okuma (F3). En büyük zaman tasarrufu budur.
5. **Teslim paketi:** GML + Yapı Özet Formu önizleme + kontrol raporu + iz kaydı (F7).
6. **Gizlilik ve telemetri politikası.** Rakip GMLCity sözleşmesi hata kayıtlarını ve dosyaları otomatik paylaşabildiğini yazıyor [RAKİP]. Bizim ilkemiz: **veri bilgisayardan çıkmaz**; hata raporu yalnız kullanıcı onayıyla gönderilir.

---

## 3. ChatGPT Belgesi Denetimi

### 3.1 Bağlam
ChatGPT yalnız ilk üç Gemini planını görmüş (Şartname v3/v3.1, ölçümler ve ilk iki inceleme raporu elinde yok). TKGM sayfalarına "istikrarlı biçimde erişemediğini" kendisi yazıyor ve rehber için Lider Yazılım portalındaki **ikincil bir kopya** kullanmış. Bu yüzden belgesi "dikkatli bir dış gözlemci" niteliğinde: yön doğru, ama ölçülmüş kanıt yok.

### 3.2 Değerli katkıları (plana alınmalı)

| # | Katkı | Plana nasıl girer |
|---|---|---|
| C1 | **Sorumluluk sınırı:** yazılım; mimarın, harita mühendisinin, idarenin ve kadastronun yerine geçmez. "TKGM onaylı" ifadesi yalnız gerçek doğrulama kodu varsa kullanılır. | Arayüz metinleri ve kullanım sözleşmesi; "Doğrulama kodu" alanı yalnız kullanıcı girişiyle dolar (6 karakter, harf+rakam, [OKUNDU Madde 3]). |
| C2 | **Kontrol statüleri:** HATA / UYARI / BİLGİ / **DIŞ KONTROL GEREKLİ** / **DOĞRULANAMADI** | Y/K/T kapsamına ek olarak bulgu statüsü olarak eklenmeli. "Doğrulanamadı" = kuralın kaynağı henüz teyit edilmemiş (örn. V-064 büyük harf). |
| C3 | **Kural metadata'sı:** `ruleId`, kaynak belge, kaynak sürümü/tarihi, uygulanma koşulu, düzey, **otomatik düzeltme güven seviyesi**, test örneği | Şartname §6'daki kural tanımına `autofixConfidence` ve `sourceVersion` alanları eklenmeli. |
| C4 | **Otomatik düzeltme sınırları:** yalnız kayıpsız ve tek anlamlı işlemler; koordinat kaydırma, alan küçültme, kot değiştirme, mülkiyet ilişkisi uydurma **asla otomatik değil** | Şartname G4 ile aynı; ChatGPT'nin listesi daha açık, birebir alınmalı. |
| C5 | **Koordinat iz kaydı:** kaynak sistem, düşey datum, jeoit modeli, ölçü epoğu, dönüşüm parametreleri, kontrol noktaları, artıklar | Georef modeline eklenmeli (Bölüm 9.2). |
| C6 | **EPSG dilimini sessizce seçme**, öner ve onaylat | Şartname 7.3 zaten "öner" diyor; arayüzde onay kutusu zorunlu olmalı. |
| C7 | **Kaynak koordinatları yüksek hassasiyetle sakla**, modelleme ızgarasına kontrollü dönüştür | Doğru. Aplikasyon noktaları ham hassasiyetle (en az 4 hane) saklanmalı; mm ızgarası yalnız üretilen geometride kullanılmalı. |
| C8 | **IFC ve BIM yönetmelikleri** (05.08.2026, RG 33331) | Stratejik faz; IFC içe aktarma (F8). |
| C9 | **Şema paketi kavramı:** kod listeleri + kural seti + XSD, sürüm ve SHA-256 ile ayrı yönetilir | Kod listesi servisinin genişletilmiş hali: "TKGM Profil Paketi" (Bölüm 9.3). |
| C10 | **Dışa aktarma manifestosu:** hangi şema/kod listesi sürümüyle üretildi | Teslim paketine (F7). |
| C11 | **Özel test senaryoları listesi** (tek BB, dubleks, bodrum, çatı arası, iç oda, kolon, eğimli arazi, reddedilmiş GML) | Şartname §10'a "senaryo matrisi" olarak eklenmeli. |

### 3.3 Ölçülmüş kanıtla çelişen önerileri (alınmamalı)

| # | ChatGPT'nin önerisi | Kanıt | Karar |
|---|---|---|---|
| X1 | "TIC'i gerekiyorsa 0,30 m aralığı aşmayacak şekilde sıklaştır" | [OKUNDU, Kılavuz Sürüm Takibi v2.0, 27.01.2021] "TIC tanımındaki 30 cm hassasiyeti kaldırıldı". [ÖLÇÜLDÜ] 6 örneğin ve 2 başarılı dosyanın hiçbirinde 30 cm aralık yok, TIC yalnız köşelerden oluşuyor. | Sıklaştırma yapılmaz. TIC = aplikasyon 3B köşeleri. |
| X2 | "`buildingHeight` rehbere göre `gen:stringAttribute`" | [ÖLÇÜLDÜ 9/9] `gen:doubleAttribute` (Amasya ve Sincan başarılı dosyalar dahil). [OKUNDU, Kılavuz Mimari Bina tablosu] `gen:doubleAttribute`. | `doubleAttribute`. Rehber v3.0.3'teki "string" bir yazım hatası. |
| X3 | "`measuredHeight` 'kesinlikle yok' kararı test edilmeden kodlanmasın" | [ÖLÇÜLDÜ 9/9] hiçbir dosyada yok, iki başarılı dosya dahil. Hata tablosundaki measuredHeight mesajları fotogrametrik modeller içindir ([OKUNDU, Kılavuz LoD sayfası]: fotogrametrik/mimari ayrımı). | Yazılmaz. |
| X4 | "GroundSurface hangi tiplerde var, belirsiz" | [ÖLÇÜLDÜ 9/9] her dosyada tam 1. [OKUNDU, Rehber Sürüm 3.0.0] "Lod2MultiSurface içerisine GroundSurface tanımı eklendi". | 1 adet yazılır. |
| X5 | "lod2Solid / lod2MultiSurface belirsiz" | [ÖLÇÜLDÜ] Örneklerin eleman sayımlarında `bldg:lod2Solid` **0** adet, `bldg:lod2MultiSurface` her dosyada var. | Yalnız `lod2MultiSurface`. |
| X6 | "BB `geometrySuitability` doğrulanmış sayılamaz" | [ÖLÇÜLDÜ] tüm BB'lerde 1001 (Ornek2 ve Ornek5'te bazıları 1002). [KODLİST] BB listesinde yalnız 1001/1002. [HATA-TABLOSU] "1001 veya 1002 olmalıdır". | BB 1001/1002, kesin. |
| X7 | "2026 değişikliği TUREF/dönüşüm parametresi/TIC karşılaştırması getirdi" | [OKUNDU, Lexpera konsolide] bu hükümler **2025'teki orijinal** Madde 6/4'te zaten var. 25.02.2026 Makam Olur'u (No. 19620371) yalnız "Onaylı Mimari Proje" tanımını düzeltiyor ("yetkili mimar/mühendis" → "yetkili mimar"). Değişiklik PDF'i okunamadı; tam kıyas **DOĞRULANMALI**. | Hükümler geçerli; tarih atfı düzeltilmeli. |
| X8 | "İlk sürüm: C#/.NET + WPF + Three.js (WebView2)" | Teknik bir tercih, yanlış değil. Ancak WPF + WebView2 karışımı **iki dil, iki çalışma zamanı ve bir köprü** demek; 2B çizim WPF'de, 3B web'de olur. Seçim bağlamı: Bölüm 9.3. | Electron + TypeScript kararı korunmalı. Gerekçe: tek dil, three.js/web-ifc/manifold-3d doğal ortamı, core/ Node'da test. |
| X9 | "Proje saklama SQLite" | Mümkün, ancak ilk sürüm için gereksiz karmaşıklık. | `.tkgm3b` ZIP kapsayıcı (project.json + ekler + geçmiş). SQLite gerekirse sonra (Bölüm 9.3). |

**Not:** ChatGPT'nin "6 örnek GML bağımsız olarak temin edilemedi" tespiti kendi oturumu için doğru. Bu turda ve önceki turlarda örnekler indirildi ve ölçüldü. **ÖNERİ:** Ölçüm betikleri (C# Probe/Analyzer) proje deposuna `tools/measure/` olarak konmalı; böylece her yapay zekâ ve her geliştirici bulguları kendisi tekrar üretebilir. DeepSeek'in "iddialar doğrulanabilir olsun" talebi de böylece karşılanır.

---

## 4. DeepSeek Değerlendirmesi Denetimi

| # | DeepSeek'in iddiası | Değerlendirme |
|---|---|---|
| S1 | "v5, M0–M3 için Proceed; M4 öncesi v6 gerekir" | ✅ Katılıyorum. Ama M4 öncesi gereken şey yeni bir plan değil, **Şartname v3.2 değişiklikleri** (Bölüm 8). |
| S2 | "K45 ile K45a farklı formülasyonlarda" | ⚠️ Kısmen doğru. v5 §2.1 zaten birleşik formül veriyor. Ama formül kapı üst kotunu 1 cm yükseltiyor; düzeltme G5-8'de. |
| S3 | "G-EK2 Ornek6 ile çelişiyor (pencere üst 1098.399 ≠ 1098.30)" | ❌ **Yanlış.** DeepSeek varsayılan pencere ölçüsünü (tavana 50 cm) projedeki gerçek ölçüyle karşılaştırmış. G-EK2'nin iddiası "LoD2 ve oda açıklığı aynı z'dedir"; varsayılanlarla ilgisi yok. [ÖLÇÜLDÜ N11] Ornek6'da 19 pencerenin tamamında LoD2 ve oda kotları birebir aynı. |
| S4 | "V-042'yi iki düzeyli yap" | ✅ Doğru ve alınmalı (G5-4). |
| S5 | "V-042 için val3dity -205/-206 'yakınlık' değil 'kesişme' mesajı" | ⚠️ Gözlem doğru, sonuç eksik. Kenar boyunca temas halka kesişimidir (**-201**). V-042a (temas) -201'e eşlenir, V-042b (yakınlık) TKGM'ye özel uyarıdır. |
| S6 | "8 dosya / 3.400 açıklık iddiası hangi araçla ölçüldü?" | ✅ Haklı talep. Araç: C# ile yazılmış Probe3 (delik alt/üst kotu ↔ dış halka alt/üst kotu). Betikler repoya konmalı (Bölüm 3, Not). |
| S7 | "G-EK1 sessiz kırpma yapmasın" | ✅ Alındı (G5-7). |
| S8 | "Açık sorular, sözlük, varsayılanlar planda olsun" | ✅ Ama bunlar Şartname'de zaten var; plan atıf yapsın yeter. |

---

## 5. Yeni Ölçüm N11 — Açıklık Kotlarının Temsiller Arası Tutarlılığı

**Yöntem:**
- Bina dış duvarındaki (`bldg:Building/bldg:boundedBy/bldg:WallSurface/bldg:opening`) her kapı ve pencere için z aralığı, plan merkezi ve genişlik hesaplandı.
- Aynı türdeki oda açıklıklarından (`bldg:Room//bldg:opening`), plan merkezi 0.8 m içinde olan ve kotu en yakın olan eşleştirildi.

| Dosya | LoD2 açıklık | Karşılığı bulundu | z alt ve üst **birebir aynı** | Yalnız alt kot farklı (LoD2 1 cm aşağıda) | Genişlik aynı |
|---|---|---|---|---|---|
| Ornek6 | 27 | 27 | 19 (pencerelerin hepsi) | 8 (kapıların hepsi: LoD2 1096.100, oda 1096.110) | 27/27 |
| Ornek4 | 98 | 98 | 34 | 64 (alt kot farkı 0.010) | 98/98 |
| Ornek2 | 71 | 71 | **71** | 0 | 71/71 |
| Sincan (başarılı) | 101 | 101 | **101** | 0 | 101/101 |
| **Toplam** | **297** | **297** | **225** | **72** | **297/297** |

**Sonuçlar:**
1. Her bina açıklığının odada bir karşılığı var (297/297). Bu, V-164 ("Kısımdaki pencere objesinin binada karşılığı bulunamadı" / `LK_OuterWindowPairNotFound`) kuralının tersten de geçerli olduğunu gösteriyor.
2. Genişlik ve üst kot her zaman aynı. Alt kotta 1 cm fark kabul ediliyor (eski üretim), ama yeni örnekler (Ornek2, Sincan) **tamamen aynı** kotu kullanıyor.
3. **Karar:** Bir açıklığın tüm temsilleri **tek mutlak z aralığı** kullanır: `[zFloorTop + 10 mm, zFloorTop + üstKot]`. Bina dış duvarı kat altından başladığı için bu aralık LoD2 duvarında kenara değmez.

---

## 6. Mevzuattan Gelen Yeni Gereksinimler (Genelge 2025/2, Madde Madde)

Kaynak: Lexpera'daki orijinal metin (Madde 1–8). TKGM'nin orijinal PDF'i taranmış görüntü olduğu için satır satır karşılaştırılamadı. Ekler (Ek-1 iş akışı, Ek-2 idare kontrol formu, Ek-3 evrak tipleri, Ek-4 kadastro kontrol formu) okunamadı.

| Madde | Hüküm (özet / kısa alıntı) | Yazılıma etkisi |
|---|---|---|
| 3 | Model "yapı aplikasyon projesi müellifi sorumluluğunda üretilen" ve onaylı mimari projeye dayanan bir ektir. | **Hedef kullanıcı harita mühendisi.** Proje kartında müellif bilgisi, aplikasyon projesi referansı ve mimari proje onay bilgisi tutulmalı. |
| 3 | Doğrulama kodu "altı haneli harflerden ve rakamlardan oluşan" bir koddur. | Proje kartında `validationCode` alanı (kullanıcı girer; biçim kontrolü `^[A-Z0-9]{6}$`, DOĞRULANMALI: büyük/küçük harf). Durum çizelgesi: Taslak → Yerel kontroller geçti → TKGM'de doğrulandı (kod girildi) → Belediyeye verildi. |
| 3 | **Yapı Özet Formu:** model doğrulandıktan sonra otomatik oluşur. İçeriği: parsel, bina, bağımsız bölüm ve adres bilgileri. | Uygulama aynı içeriği **önizleme** olarak üretmeli (F1). Kullanıcı ve belediye kontrol personeli için insan okunur bir özet. |
| 3 | **Yapı Aplikasyon Projesi:** harita mühendisince hazırlanır. Ulusal koordinat sisteminde köşe koordinatları, röper noktaları, bina ve parsel zemininin **ortometrik kotları** içerir. | Aplikasyon verisi ayrı bir veri nesnesi olmalı (köşe noktaları + kotlar + röper); TIC bundan türetilir. |
| 3 | **Ortometrik kot:** TUSAGA-Aktif GNSS + **TG20** jeoid ondülasyonu. | Georef'te düşey datum alanı: "Ortometrik (TG20)" varsayılan; başka bir kaynak seçilirse uyarı. |
| 3 | **Bina zemin kotu** ve **parsel zemin kotu** tanımlı. | Aplikasyon nesnesinde iki ayrı alan. |
| 4/1 | Model, yetkili idarece tapuya elektronik gönderilir; zorunlu. | Bilgi. |
| 4/3, 8/4 | Parseldeki her yapı için ayrı model; **tek doğrulama kodu**. Ortak taban/zemin istisnası. | Proje, parseldeki birden fazla yapıyı birlikte tutmalı (zaten modelde var). Teslim: tüm `M-*.gml` dosyaları tek paket. |
| 4/4 | Kat/BB ilavesi veya esaslı tadilatta **yalnız değişen veya yeni yapılar** modellenir. | Proje türü seçimi: Kat İrtifakı Tesisi / Kat Mülkiyeti Tesisi / Kat veya BB İlavesi / Esaslı Tadilat. İlave ve tadilatta yalnız ilgili yapı üretilir. |
| 5/4 | İdare, Yapı Özet Formu'nu **onaylı mimari proje ve liste beyanı** ile karşılaştırır. | F1 önizlemesi yanında **liste beyan ↔ model karşılaştırma raporu** (BB no, nitelik, kat, arsa payı, brüt/net). |
| 5/6 | Modelde değişiklik = **yeni doğrulama kodu**. | Model değişince "doğrulandı" durumu düşer ve kullanıcı uyarılır. |
| 6/3 | Kadastro, binanın hangi parselde olduğunu ve köşe koordinatlarıyla kotların varlığını kontrol eder. | Parsel sınırı yüklenirse bina ⊂ parsel kontrolü (V-193, K). |
| **6/4** | "Üç boyutlu sayısal yapı modeli ve Yapı Aplikasyon Projesi **TUREF** koordinat sisteminde üretilir." Arşiv başka sistemdeyse kadastronun **imzalı ve onaylı dönüşüm parametreleri** kullanılır ve **iki koordinat seti de** gösterilir. Parsel köşeleri arşivle eşleşmeli; yanılma sınırı yönetmeliği uygulanır. | G5-3: resmî dönüşüm parametreleri ve çift koordinat raporu. |
| **6/4** | Aplikasyon projesindeki TIC ile Yapı Özet Formu'ndaki TIC "**koordinat, kot, taban oturumu, alan ve parsel içerisindeki yerleşimi**" bakımından elektronik olarak karşılaştırılır; uyumsuzsa iade. | **F1:** gönderim öncesi aynı karşılaştırma. |
| 7/3 | Belediyenin gönderdiği evrak, **1 yıl** içinde WebTapu başvurusu yapılmazsa otomatik silinir. | Durum çizelgesinde hatırlatma (ÖNERİ). |
| 8/1 | İmar Kanunu geçici 16. madde kapsamında model **gerekmez**. | Proje türü sihirbazında bilgi notu. |
| 8/3 | Yıkılıp yeniden yapılan binada eski model pasife alınır. | Bilgi. |
| 8/5 | 01.01.2019'dan sonra mimari projelerde bağımsız bölüm listesinde **brüt ve net alan** zorunlu. | Liste beyan içe aktarmada: onay tarihi ≥ 2019 ve brüt/net boşsa uyarı. |

---

## 7. Rakip Analizi — Kullanıcılar Bugün Ne Yaşıyor?

### 7.1 GMLCity (Netcad eklentisi; sürüm 2026.1.18.1400) [RAKİP]
- **Çalışma biçimi:** Netcad içinde COM ile çalışan bir ağaç ve öznitelik paneli. Kullanıcı Netcad çiziminden alanları ve noktaları seçer; GMLCity koordinatları düğümlere yazar. Proje dosyası `.gmlcity`.
- **Akış:** Dilim seç → Bina öznitelikleri → Kat ekle (bodrum ayrı) → BB ekle → Ortak alan → Oda → Kapı/Pencere → Balkon/Teras → "CityGML Oluştur".
- **Konumlandırma:** Yapı aplikasyon **B1–B4** ve mimari **M1–M4** köşe noktaları sırayla seçilir; "Mimari Referans Koordinatı" tüm katlarda aynı olmalı. Eksikse "dönüşüm parametreleri hesaplanamaz" uyarısı. → Bu, bizim Helmert sihirbazımızla aynı fikrin 4 noktalı sabit sürümü.
- **Kot:** "Bina Zemin Kesişim Kotu", "Bina Başlangıç Kotu", "Kat Yüksekliği (cm)", "Taban Kalınlığı (cm)" girilir. "Kot Kotlarını Düzelt" aracı tüm katların kotlarını yeniden hesaplar. Kat düzeyinde "Taban Kotu", "Taban Kalınlığı Üstü Kotu", "Tavan Kotu". → Bizim kot motorumuzla birebir aynı kavramlar; terminoloji arayüzde **bu kelimelerle** kullanılmalı.
- **Değer kaynakları:** Rehber, "Takbis Mahalle Referans No" için **parselsorgu.tkgm.gov.tr**, MAKS Yapı Kimlik No ve BB Kimlik/Numarataj No için **adres.nvi.gov.tr Adres Sorgu** gösteriyor. → F4.
- **Açıklık kuralı:** "Kapı Geometri … duvarı **mutlaka kesmeli** ama duvarın başlangıç ve bitiş **köşe noktalarına değmemeli**". Aynı kural pencere için de geçerli. → G-EK1'in bağımsız teyidi.
- **Uyarılar ve sorunlar** (rehberin kendisi söylüyor):
  - Sık kaydedin, takılma Netcad/GMLCity'yi kapatabilir.
  - COM ile veri alımında takılma ve yanıt alamama olabilir.
  - Diğer Netcad modüllerini ve FZKViewer'ı kapatın.
  - Çoklu kotlu trimli geometri ve çoklu iç içe oda gibi "ekstrem" projelerde GML üretilemeyebilir.
  - Kesişim noktalarına dikkat edin.
  - Aynı doğru üzerinde birden fazla nokta seçmeyin.
  - TIC noktalarında Z yoksa 0 olur.
- **Toplu düzenleme:** "Bina Editörü" (tablo, kopyala/yapıştır), "Kat kopyalama", "Bağ. Böl. Aynala".
- **Lisans:** Test sürümü süreli ve ücretsiz. Sözleşmede "ticari amaçla kullanılması yasaktır" maddesi ve **otomatik hata kaydı ve dosya paylaşımı** maddesi var.

### 7.2 LiCity (Lider Yazılım, Licad GIS modülü; sürüm 3.4.0.0, 25.08.2026) [RAKİP]
- Licad GIS içinde çalışan modül. Kat irtifakı ve kat mülkiyeti öncesi CityGML üretir. Kullanım kitabı yalnız iki sayfadan oluşuyor; fiyat yayımlanmamış.

### 7.3 Yapınet (Netcad) [RAKİP]
- Netcad'in 3B şehir modeli ve 3B kadastro altlığı üretim aracı. Çatı bileşenleri ve "GML 3D editör/görüntüleyici" içeriyor; validasyon hatalarını 3B'de inceleme imkânı sunuyor. Teknik ayrıntılar okunamadı.

### 7.4 Pazardan çıkan dersler

| Rakiplerin zayıflığı | Bizim farkımız |
|---|---|
| Ana CAD'e bağımlı eklenti (Netcad, Licad) | Bağımsız Windows uygulaması. DXF'i kendisi okur; CAD gerekmez. |
| COM tabanlı veri alımı, donma, "sık kaydet" | Kendi veri modeli, otomatik kayıt, geri al, çökme kurtarma |
| Ağaç + öznitelik formu ağırlıklı, görsel geri bildirim zayıf | Canlı 2B/3B, her nesnede alan ve sapma rozetleri, hata → nesneye git |
| Karmaşık projelerde "üretilemeyebilir" | Kenar eşleştirme ve T-kavşak çözümü, çatı arası kesimi (manifold-3d), örnek dosyalarla regresyon testi |
| Hata ayıklama: TKGM mesajı ↔ nesne eşleştirmesi elle | Ret mesajı içe aktarıcı (F2) |
| Değerlerin nereden bulunacağı rehbere gömülü | Alan yanında "Nereden bulurum?" yardımı ve bağlantı (F4) |
| Telemetri ve dosya paylaşımı sözleşmede var | Varsayılan olarak hiçbir veri dışarı gitmez |

---

## 8. Şartname v3.2 İçin Değişiklik Listesi

| Kod | Değişiklik | Gerekçe |
|---|---|---|
| K45 (rev) | Kapı: `zBottom = zFloorTop + 10 mm`, `zTop = zFloorTop + kapıYüksekliği` (projeden; yoksa 2100) | Ornek6: alt 1096.110, üst 1098.300 = 1096.100 + 2.200 (G5-8) |
| K45b (yeni) | Bir açıklığın tüm temsilleri (LoD2, Kat, BB, Kısım, OA) **aynı plan genişliği ve aynı z aralığına** sahiptir | N11: 297/297 genişlik ve üst kot aynı; yeni örneklerde alt kot da aynı |
| K45c (yeni) | Açıklık, duvar poligonunun dikey kenarlarına (duvar köşelerine) ≥ 10 mm uzak olmalı (G-EK1). Sığmazsa kullanıcıya bildirilir | GMLCity rehberi [RAKİP]; OGC halka kuralı |
| V-042a / V-042b | < 1 mm: Hata (val3dity -201). 1–10 mm: Uyarı | DeepSeek önerisi, Bölüm 4 S4–S5 |
| K70 (yeni) | **Öznitelik düzeltme modunda geometri koordinat metni korunur**; normalize etme ayrı komuttur ve sonrasında yeniden doğrulama zorunludur | G5-1 |
| K71 (yeni) | Georef: `verticalDatum` (varsayılan "Ortometrik / TG20"), `officialTransform` (kaynak sistem, parametreler, belge no/tarih), aplikasyon noktaları ham hassasiyetle | Genelge 3, 6/4; ChatGPT C5, C7 |
| K72 (yeni) | Proje kartı: işlem tipi (KİT / KMT / Kat-BB İlavesi / Esaslı Tadilat), müellif, onaylı mimari proje no/tarih, ruhsat no, doğrulama kodu (6 karakter) | Genelge 3, 4/4 |
| V-196 (yeni, K) | **TIC ↔ Aplikasyon karşılaştırması:** koordinat (köşe başına sapma), kot, taban oturumu (poligon alan farkı), parsel içinde yerleşim | Genelge 6/4 |
| V-197 (yeni, Y) | **Liste beyan ↔ model:** her BB no modelde var mı, nitelik, kat tanımı ve arsa payı birebir mi, brüt/net dolu mu (onay ≥ 2019 ise zorunlu) | Genelge 5/4, 8/5 |
| V-198 (yeni, Y) | **Arsa payı toplamı:** Σ pay/payda = 1 (ortak paydaya genişletilerek); ≠ 1 ise uyarı | KMK; liste beyan tutarlılığı (ÖNERİ) |
| Bulgu statüleri | H / U / B + **DIŞ KONTROL GEREKLİ** + **DOĞRULANAMADI** | ChatGPT C2 |
| Kural metadata | `sourceVersion`, `autofixConfidence`, `testFixture` alanları | ChatGPT C3 |

---

## 9. Üç Bakış Açısından Ürün Tasarımı

### 9.1 Son kullanıcı gözüyle (harita mühendisi, LİHKAB / serbest büro)

**Persona — "Ayşe, serbest harita mühendisi":**
- Ayda 15–30 kat irtifakı dosyası hazırlıyor.
- Mimari proje çoğu zaman belediyeden PDF veya taranmış TIFF, bazen DWG/DXF olarak geliyor.
- Yapı aplikasyon projesini kendisi hazırlıyor (Netcad veya başka bir CAD).
- Liste beyanı mimari projenin kapağında; kendisi Excel'e geçiriyor.
- En büyük derdi:
  - (1) dosyanın TKGM'de veya kadastroda reddedilip ne olduğunun anlaşılamaması,
  - (2) MAKS numaralarını tek tek bulmak,
  - (3) her katta odaları yeniden çizmek,
  - (4) programın çökmesi.

**Ayşe'nin istediği iş akışı (hedef süre ÖNERİ, ölçülecek):**

| Adım | Süre hedefi (orta boy apartman, 4 kat, 12 BB) |
|---|---|
| Proje kartı + parsel + işlem tipi | 3 dk |
| Aplikasyon noktalarını içe al (DXF/CSV) ve TIC | 5 dk |
| Mimari DXF/PDF'i katlara yerleştir ve oturt (Helmert) | 10 dk |
| Odaları ve BB'leri **otomatik bul**, düzelt | 30–60 dk |
| Liste beyanı Excel'den al, BB'lerle eşleştir | 10 dk |
| Kapı ve pencereler (yarı otomatik) | 30–45 dk |
| Çatı (parametrik) | 10 dk |
| Doğrula, düzelt, GML üret | 15 dk |
| **Toplam** | **~2–2.5 saat** |

Bu süreler rakiplerle karşılaştırma yapılarak ölçülmeli. Hedef, elle tek tek çizime göre yarı yarıya zaman.

**Kullanıcı dostu tasarım ilkeleri:**
1. **"Eksikler listesi" her zaman görünür.** Sağ üstte bir sayaç: "GML üretmek için 7 eksik var". Tıklanınca liste açılır. Örnekler: "3 BB'nin MAKS no'su yok", "Kat 2'de 1 odanın kapısı yok", "TIC Z değerleri eksik".
2. **Her alanın yanında "Bu değeri nereden bulurum?"** (F4). Kısa açıklama + bağlantı + örnek değer.
3. **Türkçe, sade, eylem odaklı hata mesajları.** TKGM'nin mesajı aynen + "Ne demek?" + "Nasıl düzeltirim?" + **[Nesneye git]** + (varsa) **[Otomatik düzelt]** (yalnız güvenli işlemler, C4).
4. **Asla veri kaybı yok.** 2 dakikada bir otomatik kayıt, son 20 sürüm, çökme sonrası "kurtarılan proje" sorusu, sınırsız geri al.
5. **Klavye ve fare verimliliği.** CAD kullanıcılarının alışkanlığı: komut satırı (örn. `K` kat sınırı, `R` oda), sağ tık bağlam menüsü, Esc ile iptal, Enter ile tekrar, ölçü girişi (uzunluk/açı).
6. **Görsel geri bildirim.** Kapalı olmayan poligon kırmızı kesik çizgi; çakışma taralı kırmızı; boşluk turuncu. Alan sapması rozet rengiyle: yeşil < %5, sarı %5–10, kırmızı > %10.
7. **Terminoloji rakiplerle ve TKGM ile aynı:** "Bina Zemin Kesişim Kotu", "Taban Kotu", "Taban Kalınlığı Üstü Kotu", "Tavan Kotu", "Kat Yüksekliği", "Taban Kalınlığı", "Yapı Aplikasyon B1–B4", "Mimari M1–M4", "Bağımsız Bölüm Kısım", "Niteliksiz Ortak Alan".
8. **Çevrimdışı çalışır.** İnternet yalnız kod listesi güncellemesi ve (isteğe bağlı) yardım bağlantıları için gerekir.
9. **Erişilebilirlik:** yazı boyutu ayarı, yüksek kontrast tema, renk körlüğüne uygun palet (kırmızı/yeşil yerine şekil + renk).
10. **İlk kullanım:** örnek proje (Ornek6 benzeri, ama uygulamanın kendi ürettiği; TKGM dosyası değil) ile 10 dakikalık rehberli tur.

### 9.2 Harita mühendisi gözüyle (koordinat, kot, aplikasyon, kadastro)

1. **Koordinat sistemi:**
   - TUREF TM 3°; EPSG 5253–5259. Doğu = Y (easting, 500000 ± 200000), Kuzey = X (northing).
   - GML sırası **Y X Z** (easting northing height). [ÖLÇÜLDÜ] Bu, Türk harita uygulamasındaki "Y, X" sırasıyla aynı. Arayüzde de **Y, X** etiketi kullanılmalı; "X, Y" karışıklığı engellenmeli.
2. **Aplikasyon verisi:**
   - Köşe noktaları B1…Bn (n ≥ 3; GMLCity 4 sabit nokta kullanıyor, biz n nokta + en küçük kareler).
   - Her noktada Y, X, **ortometrik Z** (bina zemin kotu) ve kaynak (GNSS/TUSAGA-Aktif, total station, röper).
   - Parsel zemin kotları ayrı.
   - Röper noktaları (en az 2) ayrıca tutulmalı; aplikasyon krokisi raporunda görünür.
3. **Mimari plan → TUREF dönüşümü:**
   - 2B benzerlik dönüşümü (Helmert 4 parametre). **Ölçek varsayılan 1'e kilitli.** Mimari plan metre birimindedir; ölçek ≠ 1 çıkarsa ya plan birimi (cm/mm) yanlıştır ya da nokta eşleşmesi.
   - Ölçek serbest bırakılırsa ölçek değeri (ppm) ve artıklar raporlanmalı.
   - Eşik (ÖNERİ): artık > 5 cm uyarı, > 10 cm hata.
4. **Kadastro dönüşüm parametreleri (Genelge 6/4):**
   - Parsel arşivi ED50 / yerel / ITRF96 eski epok ise kadastro müdürlüğünün imzalı ve onaylı parametreleri (genellikle 2B afin veya Helmert) girilir.
   - Uygulama bu parametreyle parsel köşelerini TUREF'e taşır.
   - Rapor iki koordinat setini yan yana gösterir.
   - Parametreler proje içinde belge no ve tarihle saklanır; **uygulama parametre üretmez**.
5. **Kot zinciri:**
   - ±0.00 (mimari) → ortometrik.
   - Kullanıcı ±0.00'ın neye karşılık geldiğini seçer (genellikle zemin kat döşeme üstü).
   - Aplikasyon projesindeki "bina zemin kotu" ile karşılaştırılır.
   - **FootPrint z = max(TIC z)** (1 mm).
   - Kat kotları kot motorundan.
   - Uyarı: TIC'in en üst noktası ile zemin kat taban kotu arası > 0.5 m ise "zemin kat seçimi doğru mu?" sorusu sorulur.
6. **Parsel kontrolü:**
   - Parsel geometrisi kullanıcının parsel sorgu uygulamasından veya kadastrodan aldığı KML/GeoJSON/DXF'ten yüklenir.
   - Bina tabanı ⊂ parsel (taşma alanı m² olarak raporlanır).
   - Çekme mesafeleri **bilgi** olarak gösterilir (imar kontrolü uygulamanın işi değildir).
7. **TIC ↔ aplikasyon karşılaştırması (V-196):**

   | Ölçüt | Hesap | Eşik (ÖNERİ) |
   |---|---|---|
   | Koordinat | Her TIC köşesinin aplikasyon köşesine uzaklığı | > 1 cm uyarı |
   | Kot | Köşe başına ΔZ | > 1 cm uyarı |
   | Taban oturumu | TIC poligonu ile aplikasyon poligonu arası simetrik fark alanı | > 0.1 m² uyarı |
   | Alan | Alan farkı | — |
   | Parsel yerleşimi | TIC ⊂ parsel | dışarıdaysa hata |

   Kadastro aynı karşılaştırmayı yapıyor (Genelge 6/4). Ancak kadastronun eşikleri bilinmiyor. **DOĞRULANMALI.**
8. **Hassasiyet:** GML çıktısı mm (3 hane). Aplikasyon ölçüleri genellikle cm doğrulukta; 3 hane yeterli. İç hesap mm tamsayı.

### 9.3 Yazılım mühendisi gözüyle

1. **Platform kararı (Electron + TS) ve gerekçesi**, ChatGPT'nin .NET önerisine karşı:

   | Ölçüt | Electron + TS | .NET WPF (+WebView2 için 3B) |
   |---|---|---|
   | Dil sayısı | 1 | 2 (C# + JS) |
   | 3B | three.js doğal | WebView2 içinde three.js, köprü gerekir |
   | IFC (gelecek) | `web-ifc` (WASM) doğal | xBIM/IfcOpenShell (native) |
   | 2B poligon | Clipper2 JS/WASM | Clipper2 C# + NetTopologySuite (olgun) |
   | 3B boolean | manifold-3d WASM | manifold C# bağlayıcı sınırlı; OpenCascade ağır |
   | Paket boyutu | ~150–200 MB | ~80–150 MB |
   | Bellek | Yüksek (Chromium) | Daha düşük |
   | Başsız test | core/ Node'da | core/ .NET test projesinde |

   **Sonuç:** İki yol da yapılabilir. Hibrit (WPF + WebView2) en karmaşık olanıdır. Mevcut karar (Electron) korunmalı ve **bir daha tartışmaya açılmamalı**. Platform değişikliği en pahalı yeniden yazımdır.
2. **Proje dosyası `.tkgm3b`:** ZIP kapsayıcı:
   - `project.json` (Şartname §4.2 şeması + `schemaVersion`)
   - `attachments/` (altlık PDF/TIFF/DXF kopyaları)
   - `history/` (son 20 otomatik sürüm)
   - `exports/` (üretilen GML'ler + manifest)

   Avantajları: tek dosya, e-postayla taşınabilir, sürüm geçişi (migration) kolay. SQLite gerekmez.
3. **TKGM Profil Paketi:** kod listeleri + kural kataloğu sürümü + XSD + bilinen istisnalar + `manifest.json` (SHA-256). Kod listeleri çevrimiçi güncellenir. Kural kataloğu uygulama sürümüyle gelir.
4. **Deterministik çıktı:** uuidv5(objectId + rol + sıra). Aynı model ve aynı profil her zaman aynı bayt dizisini üretir. Bu, regresyon testinin temelidir.
5. **Ölçüm araçları repoda:** `tools/measure/` altında Analyzer ve Probe betikleri (C# veya TS portu). CI'da 8 örnek üzerinde çalışır; çıktıları `measure-report.json` olarak tutulur. Böylece şartname iddiaları sürekli doğrulanır.
6. **CI ve kalite:**
   - Her commit'te birim + örnek doğrulayıcı + gidiş-dönüş + altın senaryo testleri.
   - Performans bütçeleri (Ornek3 < 10 sn).
   - Lint, tip kontrolü, `npm audit`, lisans taraması (izin verilen lisans listesi).
7. **Dağıtım:**
   - NSIS kurulum ve kod imzalama sertifikası (SmartScreen uyarısını önler).
   - İsteğe bağlı otomatik güncelleme (imzalı).
   - Kurulumsuz "portable" seçenek.
8. **Gizlilik ve güvenlik:**
   - Telemetri yok (veya açık onayla).
   - Proje verisi yerelde.
   - XXE kapalı.
   - Dış bağlantılar yalnız TKGM kod listesi URL'leri ve kullanıcının tıkladığı yardım bağlantıları.
   - TKGM web sistemlerine (3dbinadogrula, parselsorgu) **otomatik erişim / kazıma yapılmaz**. Bu sistemler kullanıcı oturumu ve kullanım koşullarına tabidir. Uygulama yalnız bağlantı açar.
9. **Lisanslama:** Çevrimdışı lisans dosyası (makine kimliği bağlı, imzalı). Deneme sürümü kısıtlaması "filigranlı rapor / GML üretimi kapalı" gibi veri bozmayan yöntemlerle yapılır.
10. **Hata raporlama:** Çökme dökümü yerelde; kullanıcı "Gönder" derse e-posta taslağı veya destek portalı.

---

## 10. Yeni Özellik Önerileri (Öncelikli)

| # | Özellik | Neden | Öncelik | Aşama |
|---|---|---|---|---|
| **F1** | **Yapı Özet Formu önizlemesi + TIC ↔ Aplikasyon karşılaştırma raporu (V-196)** | Genelge 6/4'teki kadastro iadelerini önceden yakalar | 🔴 | M7 |
| **F2** | **TKGM doğrulama sonucu içe aktarıcı:** kullanıcı 3dbinadogrula sonuç metnini yapıştırır veya dosya olarak verir; uygulama mesajlardaki GUID ve nesne adlarını ayıklar, ilgili nesneyi 2B/3B'de gösterir ve Şartname kural kataloğuyla eşleştirir | Ret döngüsünü saatlerden dakikalara indirir. GMLCity rehberi GUID'in "doğrulama sisteminde hata belirteci" olarak kullanıldığını söylüyor [RAKİP] | 🔴 | M3 sonrası (M3.5) |
| **F3** | **DXF'ten otomatik oda ve BB bulma:** duvar çizgilerinden düzlemsel graf → kapalı yüzler (polygonize). Odanın içine düşen **metin etiketleri** ("SALON 24,50 m²", "YATAK ODASI", "D:3") → partUsage, planArea, BB no. Duvar çizgisi çiftlerinden duvar kalınlığı ve kapı/pencere boşluklarından açıklık önerisi | En çok zaman alan iş elle çizim; rakiplerde yok | 🔴 | M4–M7 |
| **F4** | **"Nereden bulurum?" yardımı:** Taşınmaz No (tapu/TAKBİS), TAKBİS Mahalle Ref (parsel sorgu), MAKS Yapı ve BB Kimlik No + Numarataj No (adres sorgu), onay tarihi (proje kapağı), arsa payı (liste beyan) | Rakip rehberinde dağınık; kullanıcı zaman kaybediyor | 🟠 | M4 |
| **F5** | **Kat kopyala / BB aynala / tip kat** | Apartmanlarda katlar tekrar ediyor; GMLCity'de var | 🟠 | M4 |
| **F6** | **Toplu tablo editörü** (Excel benzeri: BB'ler, odalar, açıklıklar; kopyala/yapıştır, doldur) | Liste beyan ve öznitelik girişi; GMLCity "Bina Editörü" | 🟠 | M4 |
| **F7** | **Teslim paketi:** `M-*.gml` (parseldeki tüm yapılar) + Yapı Özet Formu önizleme (PDF) + yerel kontrol raporu (HTML/PDF) + profil manifestosu + koordinat iz kaydı | İdare ve kadastro kontrolü için düzenli dosya | 🟠 | M7 |
| **F8** | **IFC içe aktarma** (`web-ifc`): IfcBuildingStorey → Kat, IfcSpace → Kısım, IfcWall/IfcDoor/IfcWindow → açıklıklar, IfcSlab → döşeme kalınlığı | 2027'den itibaren BIM/IFC zorunluluğu kademeli başlıyor; büyük otomasyon fırsatı | 🟡 (stratejik) | M11 |
| **F9** | **Doğrulama durumu çizelgesi:** Taslak → Yerel OK → TKGM kodu girildi → Belediyeye verildi; model değişince kod geçersiz uyarısı; 1 yıl hatırlatması | Genelge 5/6, 7/3 | 🟡 | M7 |
| **F10** | **Proje şablonları** (apartman, villa, dubleks, ticari zemin) | Hızlı başlangıç | 🟡 | M10 |
| **F11** | **Arsa payı toplam kontrolü (V-198)** ve liste beyan karşılaştırması (V-197) | Kat mülkiyeti tutarlılığı | 🟠 | M4 |
| **F12** | **Ölçüm araçları repoda ve CI'da** (`tools/measure`) | Şartname iddialarının sürekli doğrulanması | 🟠 | M0 |

---

## 11. Güncellenmiş Yol Haritası

| Aşama | İçerik | Kabul |
|---|---|---|
| **M0** | Altyapı, `core/`, kod listesi servisi, **TKGM Profil Paketi**, `tools/measure` CI | Birim testleri; 8 örnekte ölçüm raporu üretiliyor |
| **M1** | SAX okuyucu + 3B görüntüleyici | 8 örnek açılıyor; Ornek3 < 10 sn |
| **M2** | Doğrulayıcı V-001…V-195 + V-042a/b + bulgu statüleri | 8 örnekte istisnalar dışında sıfır hata; Başarısız örnekte beklenenler |
| **M3** | Öznitelik düzeltici + yazıcı; **geometriyi koruma modu (K70)**; normalize komutu | Gidiş-dönüş: düzeltme modunda koordinat metni birebir aynı |
| **M3.5** | **F2 ret mesajı içe aktarıcı** | Örnek TKGM mesaj metinleri (rehberdeki hata tablosu) nesneye eşleniyor |
| **M4** | Tasarım modeli + 2B editör + F4/F5/F6/F11 + liste beyan | Ornek6 tasarım JSON'u yüklenince alanlar ±0.01 |
| **M5–M6** | Geometri motoru I–II | Ornek6 altın testi |
| **M7** | Konumlandırma, DXF/raster, **F1 + F7 + F9**, **F3 (aşama 1: polygonize + metin)** | Gerçek bir projeden 2–3 saatte geçerli GML |
| **M8** | Çatı arası, özel durumlar, F3 (aşama 2: duvar kalınlığı + açıklık önerisi) | Ornek2 benzeri test |
| **M9** | Resmî test (3dbinadogrula) + pilot kullanıcılar (3–5 harita bürosu) | "Başarılı" + doğrulama kodu; pilot geri bildirimi |
| **M10** | Paketleme, imzalama, şablonlar, kılavuz | Temiz Windows 11'de kurulum |
| **M11** | IFC içe aktarma (F8) | Örnek IFC'den model |

---

## 12. Gemini'ye Talimat Metni (kopyala-yapıştır)

> Gemini,
>
> v5 planın M0–M3 için yeterli; kodlamaya başlayabilirsin. Aşağıdaki maddeleri plana ve Şartname'ye (v3.2 olarak) işle:
>
> 1. **K70 — Öznitelik düzeltme modunda geometri korunur.** Mevcut GML'nin koordinat metni değiştirilmeden yazılır. "3 haneye normalize et" ayrı bir komuttur; çalıştıktan sonra doğrulayıcı otomatik yeniden çalışır ve fark gösterilir. M3 kabulü: düzeltme modunda koordinat metni birebir aynı.
> 2. **Açıklık kotları (N11, 297/297 ölçüm):** Bir açıklığın tüm temsilleri aynı plan genişliği ve aynı z aralığındadır. `zBottom = zFloorTop + 10 mm`, `zTop = zFloorTop + projeYüksekliği` (Ornek6: 1096.110 / 1098.300). G-EK2 doğrulandı; `[ÖLÇÜLDÜ N11]` etiketiyle yaz.
> 3. **G-EK1:** Açıklık duvar köşelerine ≥ 10 mm uzak (GMLCity rehberi de aynı kuralı söylüyor). Sığmazsa sessiz kırpma yok; kullanıcıya bildir ve onay iste.
> 4. **V-042a** (< 1 mm, Hata, val3dity -201) ve **V-042b** (1–10 mm, Uyarı).
> 5. **Bulgu statüleri:** H / U / B + "DIŞ KONTROL GEREKLİ" + "DOĞRULANAMADI". Kural metadata'sına `sourceVersion`, `autofixConfidence`, `testFixture` ekle.
> 6. **Genelge 2025/2 gereksinimleri:** K71 (düşey datum TG20, resmî dönüşüm parametreleri, çift koordinat seti), K72 (işlem tipi, müellif, doğrulama kodu 6 karakter), **V-196** (TIC ↔ aplikasyon: koordinat, kot, taban oturumu, alan, parsel), **V-197** (liste beyan ↔ model), **V-198** (arsa payı toplamı).
> 7. **Yeni özellikler:** F1 (Yapı Özet Formu önizleme + TIC raporu, M7), **F2 (TKGM sonuç mesajı içe aktarıcı, M3.5)**, F3 (DXF'ten otomatik oda/BB + metin etiketleri, M7–M8), F4 ("Nereden bulurum?" yardımı), F5 (kat kopyala/aynala), F6 (toplu tablo), F7 (teslim paketi), F9 (durum çizelgesi), F11, F12 (`tools/measure` CI'da). F8 (IFC içe aktarma) M11.
> 8. **Proje dosyası `.tkgm3b`** (ZIP: project.json + attachments + history + exports). Otomatik kayıt 2 dk, 20 sürüm, çökme kurtarma.
> 9. **Gizlilik:** telemetri yok; TKGM sistemlerine otomatik erişim/kazıma yok; yalnız kod listesi URL'leri.
> 10. **Platform kararı (Electron + TS) kesindir;** tekrar tartışılmaz.
> 11. ChatGPT'nin şu önerileri ölçümle çeliştiği için **alınmaz**: 30 cm TIC sıklaştırma, `buildingHeight` string, `measuredHeight` yazma, GroundSurface/lod2Solid belirsizliği. ChatGPT'nin sorumluluk sınırı, kontrol statüleri, otomatik düzeltme sınırları ve koordinat iz kaydı önerileri **alınır**.
>
> Bu maddeleri işledikten sonra M0'dan kodlamaya başla. Her aşamanın sonunda kabul testi sonuçlarını raporla.

---

## 13. Açık Sorular (Güncel)

| # | Soru | Durum |
|---|---|---|
| 1 | Koordinat "tam 3 hane" mi, "en fazla 3" mü? | Açık. Tam 3 yazılıyor; düzeltme modunda koruma (K70) |
| 2 | Büyük harf denetimi hangi alanlarda? | Açık |
| 3 | Eğik tavan hacmi formülü | Açık. Uyarı düzeyinde |
| 4 | Kadastronun TIC karşılaştırma eşikleri | **Yeni, açık** |
| 5 | Doğrulama kodunda büyük/küçük harf | Yeni, açık |
| 6 | Yapı Özet Formu'nun tam alan listesi | **Yeni, açık.** İlk gerçek doğrulamada form görülünce F1 birebir eşlenmeli |
| 7 | Uzak kısım mı, ayrı BB parçası mı (başka kattaki depo) | Ayrı BB parçası varsayılan |
| 8 | MAKS servisine erişim | Kullanıcı girer (adres sorgu) |
| 9 | 2026 değişikliğinin tam metni | Yeni, açık. Lexpera'da yalnız tanım düzeltmesi görüldü |
| 10 | BIM yönetmeliği yürürlük takvimi | Yeni, açık. Resmî Gazete metninden teyit |

---

## 14. Kaynaklar

- TKGM Dijital Bina Üretim Rehberi 3.0.3: https://cbs.tkgm.gov.tr/surdurulebilirlik/
- TKGM 3B Kadastro Üretim Kılavuzu (HelpNDoc v2.50, sürüm takibi ve S.S.S.): https://cbs.tkgm.gov.tr/3d/html/
- TKGM örnek GML'leri, başarılı/başarısız arşivler: `cbs.tkgm.gov.tr/surdurulebilirlik/data/`, `cbs.tkgm.gov.tr/3d/samples/`
- 2025/2 Genelge duyurusu: https://www.tkgm.gov.tr/duyurular/20252-sayili-kat-irtifaki-ve-kat-mulkiyeti-tesisi-islemlerinde-uc-boyutlu-sayisal-yapi-modeli
- 2025/2 Genelge metni (Lexpera): https://www.lexpera.com.tr/resmi-gazete-disindaki-kaynak/metin/kat-irtifaki-ve-kat-mulkiyeti-tesisi-islemlerinde-uc-boyutlu-sayisal-yapi-modeli-hakkinda-genelge
- GMLCity Kullanım Rehberi: https://gmlcity.com.tr/rehber/index.html ve https://gmlcity.com.tr/
- LiCity (Lider Yazılım): https://www.lideryazilim.com/UrunDetay.html?p1=47 ve https://portal.lideryazilim.com/books/licity-kullanim-kitabi/page/licity-nedir
- Yapınet (Netcad): https://www.netcad.com/tr/urunler/yapinet
- Dijital proje yönetmeliği (05.08.2026, RG 33331): https://www.alomaliye.com/2026/08/05/mimarlik-ve-muhendislik-projelerinin-dijital-olarak-hazirlanmasi-hakkinda-yonetmelik/ ve https://www.hakedis.org/mimarlik-ve-muhendislik-projelerinin-dijital-olarak-hazirlanmasi-ve-elektronik-ortamda-teslimi-hakkinda-yonetmelikler-yayinlandi/
- Elektronik teslim yönetmeliği: https://legalbank.net/belge/mimarlik-ve-muhendislik-projelerinin-elektronik-ortamda-teslimi-ve-yonetilmesi-hakkinda-yonetmelik/8094909
- val3dity hata kodları: https://val3dity.readthedocs.io/en/latest/errors/
- Kat irtifakı 3BSYM bağlamı (firma sayfaları, ikincil): https://www.derinharita.net/hizmetlerimiz/3b-say%C4%B1sal-yap%C4%B1-modeli , https://www.canakkaleharita.com/turkiye-geneli-3b-sayisal-yapi-modeli-citygml-uretimi
