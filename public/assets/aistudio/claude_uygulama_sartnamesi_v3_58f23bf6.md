# TKGM 3B Dijital Bina (TKGMCityGML) Windows Uygulaması — Eksiksiz Uygulama Şartnamesi ve Gemini v3 Planının Denetimi

> **Belgenin amacı:** Bu belgeyi okuyan herhangi bir yapay zekâ veya yazılımcı, başka bir kaynağa ihtiyaç duymadan uygulamayı uçtan uca yazabilmelidir. Belge, TKGM'nin birincil kaynaklarından **ölçülerek ve okunarak** elde edilen bilgilerle yazıldı. Tahmin olan her şey açıkça **"ÖNERİ"** veya **"DOĞRULANMALI"** diye işaretlendi.
>
> **Okuma sırası:**
> - Bölüm 0–1: kaynaklar ve Gemini v3 planının denetimi (ne doğru, ne yanlış)
> - Bölüm 2: kesinleşmiş kurallar ve karar tablosu
> - Bölüm 3: dosya formatı (birebir XML şablonları)
> - Bölüm 4: veri modeli
> - Bölüm 5: geometri motoru ve algoritmalar
> - Bölüm 6: doğrulama kural kataloğu
> - Bölüm 7: arayüz ve iş akışları
> - Bölüm 8: içe aktarma
> - Bölüm 9: platform ve kod mimarisi
> - Bölüm 10: test stratejisi
> - Bölüm 11: yol haritası ve kabul kriterleri
> - Bölüm 12: açık sorular
> - Ekler: kod listeleri, varsayılanlar, toleranslar, sözlük

---

## 0. Kaynaklar, Yöntem ve Kaynak Önceliği

### 0.1 İncelenen birincil kaynaklar

| Etiket | Kaynak | Ne yapıldı |
|---|---|---|
| **[REHBER]** | Dijital Bina Üretim Rehberi ver. **3.0.3** (19.03.2025) — `https://cbs.tkgm.gov.tr/surdurulebilirlik/` | 3.161 satırın tamamı okundu, ~300 satırlık "Hata ve Çözüm Önerileri" tablosu dahil. |
| **[KILAVUZ]** | "3B Kadastro Üretim Kılavuzu" (HelpNDoc sitesi, sürüm **v2.50**, 06.05.2025) — `https://cbs.tkgm.gov.tr/3d/html/` | İçindekilerin tamamı çıkarıldı. Mimari model, TKGMCityGML veri modeli, kod listeleri, doğrulama, sürüm geçmişi (v1 → v2.50), sürdürülebilirlik ve 35 adet "Üreticiler Tarafından Sorulanlar" sayfası okundu (68 sayfa, 3.617 satır). |
| **[SÜRÜM]** | Kılavuzun "Version Takibi" sayfası | Hangi kuralın ne zaman eklendiği veya kaldırıldığı buradan alındı. |
| **[ÖRNEK-1…6]** | Rehberdeki 6 resmi örnek: `…/surdurulebilirlik/data/OrnekN-M-*.gml` (toplam ~79 MB) | Her dosya bir XML ayrıştırıcıyla (C#) eleman eleman tarandı. Yüzey normalleri, alanlar, hacimler, kotlar, ID önekleri, öznitelikler, açıklık eşleşmeleri ölçüldü. |
| **[BAŞARILI]** | Kılavuzdaki "Başarılı Örnek GML" arşivi: Amasya `M-11597670-A.gml`, Sincan `M-3036492-A.gml` | Yapı istatistikleri çıkarıldı. |
| **[BAŞARISIZ]** | Kılavuzdaki "Başarısız Örnek GML": `GML_M-17273333-F.gml` | Neden başarısız olduğu analiz edildi (bkz. 10.4). |
| **[KODLİST]** | `http://cbs.tkgm.gov.tr/3d/schema/1.0/*CodeList.xml` (14 dosya) | Hepsi indirilip okundu (tam tablo Ek-A'da). |
| **[KURAL-2021]** | `3d_mimari_model_dogrulama_kurallari.xlsx` (Mart 2021, eski masaüstü doğrulayıcının test senaryoları) | Sayfası metne dönüştürülüp okundu. Eski kurallar içeriyor; yalnız güncel kaynaklarla çelişmeyen maddeler kullanıldı. |
| **[TKGM-SAYFA]** | `cbs.tkgm.gov.tr/3d/html/teras.html`, `door_usage_code_list.html` | Okundu. |
| **[XSD]** | CityGML 2.0 şemaları (`schemas.opengis.net/citygml/2.0/…`) | Eleman sıralaması bu şemaya göre verildi. Örneklerdeki sırayla birebir uyumlu. |

### 0.2 Kaynak önceliği (çelişki olduğunda)

TKGM'nin kaynakları zaman içinde değişmiş ve birbirleriyle çelişiyor. Kesin kural: **yüksek öncelikli kaynak düşük öncelikliyi geçersiz kılar.**

1. **Örnek GML'ler [ÖRNEK-1…6] ve [BAŞARILI]:** TKGM'nin "doğrulamadan geçen" olarak yayımladığı somut çıktılar.
2. **[REHBER] Hata tablosu:** doğrulayıcının bugün gerçekte kontrol ettikleri.
3. **[KODLİST] XML dosyaları.**
4. **[REHBER] düz metni (v3.0.3, 2025).**
5. **[KILAVUZ] HelpNDoc (v2.50).** Sürdürülebilirlikten önceki ihale (fotogrametri + mimari) dönemine aittir ve bazı kuralları sonradan değişmiştir. Örnekler: "Mimari binada GroundSurface alınmayacak" (sonra rehber 3.0.0'da eklendi); "odalarda kapı-pencere boşluğu bırakılmamalı" (S.S.S. 12; örneklerde boşluk var).
6. **[KURAL-2021]:** yalnız tamamlayıcı bilgi olarak.

### 0.3 Bu belgenin yöntemi

- Bir kural için "**[ÖLÇÜLDÜ]**" yazıyorsa, kural örnek dosyalarda programla sayılarak doğrulanmıştır ve yanında oranı verilmiştir. Örnek: "759/759 oda".
- "**[OKUNDU]**" kural metinden alınmıştır.
- "**ÖNERİ**" bu belgenin yazarının mühendislik önerisidir; kaynakta yoktur.
- "**DOĞRULANMALI**" konu belirsizdir; ilk gerçek yüklemede 3dbinadogrula.tkgm.gov.tr ile kesinleştirilmelidir.

---

## 1. Gemini v3 Planının Denetimi

Gemini'nin üçüncü planı (`implementation_plan (2).md`), ikinci incelemedeki bulguların büyük kısmını doğru şekilde benimsemiş. Aşağıda önce doğru olanlar, sonra hâlâ yanlış veya eksik olanlar var.

### 1.1 Gemini v3'te doğru olanlar (korunmalı)

| # | Konu | Durum |
|---|---|---|
| D1 | GML 3.1.1 ad alanı (`http://www.opengis.net/gml`), CityGML 2.0 | ✅ Doğru [ÖLÇÜLDÜ 9/9 dosya] |
| D2 | `srsName` / `srsDimension` yalnız Envelope'ta | ✅ Doğru [ÖLÇÜLDÜ: 9 dosyada `srsName` 1 kez] |
| D3 | LoD0 + LoD1 + LoD2 + LoD4 | ✅ |
| D4 | Oda = Kısım = `bldg:Room` (BBK/OA), MBG eklendi, İç Yapı (BBKIY/OAIY) eklendi | ✅ |
| D5 | BB "kalın cidarlı üstü açık küvet" | ✅ Kavram doğru (ayrıntı eksikleri 1.2'de) |
| D6 | Tek kaynaktan 4 temsilli açıklık | ✅ Kavram doğru (yön ve halka kopyalama kuralı eksik, bkz. H6) |
| D7 | Tamsayı milimetre ızgarası ve T-kavşak bölme | ✅ |
| D8 | Teras: `independentSectionObjectReference = -1`, ad `-1_-1_-1_Teras` | ✅ [ÖLÇÜLDÜ: Ornek3'te 9/9] |
| D9 | BB 1006 yasak; Bina 1006; BBK ve Balkon 1001 kilitli | ✅ |
| D10 | Dubleks: benzersiz BB no sayısı ve kattaki BB parçası sayısı ayrımı | ✅ [ÖLÇÜLDÜ: Ornek2'de 17 parça, total 13] |
| D11 | Konumlandırma (Helmert) sihirbazı, raster ve DXF altlık, liste beyan CSV | ✅ |
| D12 | 3 katmanlı doğrulama raporu (yerel / kısmi / TKGM'de) | ✅ |
| D13 | `measuredHeight` yazılmaz | ✅ [ÖLÇÜLDÜ: 9/9 dosyada yok] |

### 1.2 Gemini v3'te hâlâ yanlış veya eksik olanlar

#### H1 🔴 `blockNumber` ve `parcelNumber` tipi yanlış
- **Gemini:** "`blockNumber` (int), `parcelNumber` (int)"
- **Kanıt:** [ÖLÇÜLDÜ 9/9] her dosyada `<gen:stringAttribute name="blockNumber">` ve `<gen:stringAttribute name="parcelNumber">`. [REHBER] ve [KILAVUZ] tablolarında da `gen:stringAttribute`.
- **Etki:** `gen:intAttribute` yazılırsa "Sınıf/tip geçersiz" türü hata alınır. Ayrıca ada no "0", parsel no "12A" gibi değerler int'e sığmaz.
- **Düzeltme:** İkisi de `gen:stringAttribute`.

#### H2 🔴 `architecturalProjectConfirmationDate` tipi yanlış
- **Gemini:** "(string, `YYYY-MM-DD`)"
- **Kanıt:** [ÖLÇÜLDÜ] `<gen:dateAttribute name="architecturalProjectConfirmationDate"><gen:value>1999-12-09</gen:value>`. [REHBER] ve [KILAVUZ]: `gen:dateAttribute`.
- **Düzeltme:** `gen:dateAttribute`, değer `YYYY-MM-DD`.
  - Tarih projede yoksa: CSV'deki **belge tarihi**; o da yoksa **`1900-01-01`** ([KILAVUZ] S.S.S. 27: "01/01/1900 değeri girilmelidir"; ISO biçimde `1900-01-01`).

#### H3 🔴 "Kat dış konturu = BB ∪ OA" yanlış bir sadeleştirme
- **Gemini:** "Clipper2 Poligon Birleşim/Fark (Kat dış konturu = BB ∪ OA; …)"
- **Kanıt:**
  1. [REHBER] ve [KILAVUZ]: "Vektör çizimi yapılırken, **katın dış sınırları**, bağımsız bölüm ayrım çizgileri, … **farklı layerlarda** çizilir." Kat dış sınırı kullanıcının ayrıca çizdiği **bağımsız bir veridir**.
  2. [ÖLÇÜLDÜ: Ornek2 Kat 2] Kata bağlı BB parçalarının taban alanı toplamı (378.7 m²), kat tabanından (~222 m²) **büyük**. Sebep: [REHBER] kuralına göre "Çoklu Kat, Depo, Eklenti ve Çatı Arası yapılar… bağlı olduğu bağımsız bölümün **girişinin olduğu kata referans edilmelidir**." Çatı arasındaki BB parçaları 2. katın grubunda ama 2. katın konturunda değil.
  3. OA odaları (`bldg:Room`) duvar kalınlığını içermez. OA'nın dış duvarı ile kat dış sınırı arasında, ne BB ne OA olan bir duvar şeridi kalır.
- **Düzeltme:**
  - "Kat dış sınırı" kullanıcının çizdiği (veya DXF'ten aldığı) ayrı bir katmandır.
  - Program yalnızca tutarlılığı **doğrular**:
    - (a) Bu kattaki her BB parçası kat sınırının içinde mi? [HATA-TABLOSU]: "Bağımsız bölüm, kat geometrisinin içinde kalmalıdır", tolerans 1 mm ([SÜRÜM] v2.15).
    - (b) Kat sınırı ile BB ve OA dış kenarları arasında 50 cm'den büyük boşluk var mı? (ÖNERİ: uyarı)
  - Kat konturu yalnızca kolaylık için önerilebilir: "BB ∪ OA'nın dışa ofseti" düğmesi, kullanıcı onaylar.

#### H4 🟠 Kat geometrisinde döşeme biçimi belirsiz
- **Gemini:** "1 adet `Floor_` taban poligonu (`zFloorBottom`) + kapı/pencere delikli dış `Wall_` poligonları (`zFloorBottom` → `zCeiling`), tavansız"
- **Kanıt [ÖLÇÜLDÜ]:** İki farklı biçim var, ikisi de kabul edilmiş:
  - **Biçim A** (Ornek6): 1 yatay `Floor_` (kat taban kotu) + dış duvarlar kat tabanından kat tepesine.
  - **Biçim B** (Ornek2): döşeme **kutusu** (alt `Floor_` + üst `Floor_` + dikey `Floor_` kenar yüzleri) + dış duvarlar **döşeme üstünden** kat tepesine. Örnek: Kat Z: Floor H@949.85, Floor H@950.00, 6 dikey Floor, Wall 950.00 → 954.85.
- **Düzeltme (ÖNERİ):** **Biçim B** kullanılmalı. Gerekçeler:
  - [KILAVUZ] S.S.S. 22 diyor ki: "Bütün yan duvarların iç ve dış yüzeyleri **döşeme (zemin) üst kotundan** başlatılarak çizilecektir. **Zemininde yan yüzeyler oluşturulacaktır.**"
  - [HATA-TABLOSU]: "Yan duvarlar, tabanın üstünden başlamalıdır."
  - Bu iki kural Biçim B ile birebir örtüşüyor ve BB küveti ile aynı mantığı kullanıyor.
  - Biçim A da kabul edildiği için, gerekirse ayar ile seçilebilir.

#### H5 🟠 BB taban kalınlığının yan yüzleri belirtilmemiş
- **Gemini:** "Döşeme alt yüzü (`Floor_` @ `zFloorBottom`), döşeme üst yüzü (`Floor_` @ `zFloorTop`)…"
- **Kanıt [ÖLÇÜLDÜ]:**
  - Ornek2 ve Ornek5'te BB döşemesinin **dikey kenar yüzleri** de `Floor_` önekiyle yazılmış (BB başına 4–14 adet).
  - Ornek6, Ornek4 ve Ornek1'de bu yüzler yok.
  - [KILAVUZ] S.S.S. 22: "Zemininde yan yüzeyler oluşturulacaktır."
- **Düzeltme:** BB döşemesi **kapalı kutu** olarak üretilmeli: alt + üst + dikey kenar yüzleri, hepsi `Floor_` önekli.

#### H6 🔴 Yüzey yönlendirme (normal) ve kapı/pencere poligonu kuralı yok
- **Gemini:** Hiç bahsetmiyor.
- **Kanıt:**
  - [OKUNDU, KILAVUZ "Genel Hususlar"]: "Poligon çizimlerinde **dış sınırlar saat yönü tersinde, iç alanların sınırları saat yönünde** olmalıdır."
  - [HATA-TABLOSU] -208: "İç ve dış linearRinglerin noktaları farklı yönlerde sıralanmalıdır."
  - [ÖLÇÜLDÜ] Delikli poligonların **tamamında** iç halka dış halkaya ters yönde. Ornek6 LoD2 duvarlarında 11/11, BB'lerde 53/53; Ornek2 BB'lerde 164/164.
  - [ÖLÇÜLDÜ] **Kapı ve pencere poligonunun dış halkası, duvardaki deliğin halkasının nokta sırası dahil birebir kopyasıdır.** Tüm örneklerde istisnasız, toplam 3.000'den fazla açıklıkta:
    - LoD2: Ornek6'da 8 kapı + 19 pencere, Ornek2'de 27 + 44, Ornek4'te 16 + 82, Ornek5'te 16 + 42, Ornek1'de 191 + 255.
    - Oda içi: Ornek1'de 1.701 kapı + 257 pencere, ve diğer örnekler.

    Sonuç: açıklık poligonunun normali duvar normalinin **tersini** gösterir.
  - [ÖLÇÜLDÜ] Diğer yüzeylerin normal yönleri örnekten örneğe **tutarsız**. Örneğin oda tabanları Ornek6'da çoğunlukla aşağı, Ornek2'de yukarı bakıyor; bina GroundSurface Ornek6'da aşağı, Ornek2'de yukarı. Bu da doğrulayıcının MultiSurface'lerde yön kontrolü **yapmadığını** gösteriyor.
- **Düzeltme:**
  - (a) Her poligonun dış halkası, **nesnenin dışından bakıldığında saat yönünün tersine** sıralanmalı (normal nesnenin dışına baksın). CityGML ve val3dity geleneği budur; kılavuz kuralıyla da uyumludur.
  - (b) İç halkalar ters yönde olmalı.
  - (c) **Kapı/Pencere poligonu = ilgili delik halkasının aynı sırayla kopyası** (yeni GUID'li `DoorLinearRing_`/`WindowLinearRing_` id ile). Örneklerde tek tip olan kural budur.
  - (d) LoD1 Solid'ler gerçek katı cisimlerdir ve val3dity'ye girer. Normaller **kesinlikle dışa** bakmalı (-307, -405).

#### H7 🔴 Alan ve hacim formülleri tanımlanmamış
- **Gemini:** "Otomatik Alan/Hacim/Sayım Hesaplayıcı"
- **Kanıt [ÖLÇÜLDÜ]:**
  - **Kısım `calculatedArea` = kısmın `Floor_` poligonunun net alanı** (delikler düşülmüş, ±0.01 m²). Sonuçlar: Ornek6 16/16, Ornek2 42/42 BBK + 8/8 OA, Ornek4 128/128 + 10/10, Ornek5 83/83 + 16/16, Ornek1 759/759 + 81/81. **İstisnasız.**
  - **Kısım `volume` (düz tavanlı oda) = taban alanı × (tavan kotu − taban kotu)** (±%1). Sonuçlar: Ornek6 16/16, Ornek4 128/128, Ornek5 83/83, Ornek1 759/759, Ornek2'de düz tavanlı 36 odanın 34'ü.
  - Eğik tavanlı çatı arası odalarda (Ornek2'de 6 oda) bu formül tutmuyor; değer gerçek çokyüzlü hacmi. DOĞRULANMALI: tam formül.
  - **BB `independentSectionCalculatedArea` = BB küvetinin en alt yatay `Floor_` poligonunun alanı.** Sonuçlar: Ornek6 2/2, Ornek2 17/17, Ornek4 26/26, Ornek5 27/27.
    - **İstisna, Ornek1:** 70 BB'nin 62'sinde BB tabanında ~3 m² delik (şaft) var. Değer, dış kontur alanı ile net alan arasında kalıyor (dış konturdan 2.10 m² küçük, net alandan 0.93 m² büyük). Rehber "havalandırma boşlukları… **çıkartılmadan** hesaplanacaktır" diyor.
  - **Balkon `calculatedArea` = balkon taban kutusunun üst yatay yüzünün alanı** [ÖLÇÜLDÜ: Ornek6 4/4, Ornek2 12/12, Ornek5 10/10, Ornek1 125/125].
- **Düzeltme:** Bölüm 5.12'deki formüller uygulanmalı. **ÖNERİ:** BB tabanında delik bırakılmamalı (şaftlar BB dışına niteliksiz OA olarak alınmalı ya da BB içi şaft "Teknik Hacim 1028" kısmı olarak modellenmeli, taban deliksiz kalmalı). Böylece BB alanı = taban alanı eşitliği belirsizliksiz sağlanır.

#### H8 🟠 TIC "30 cm sıklaştırma" seçeneği kaldırılmalı
- **Gemini:** "varsayılan köşe noktaları + opsiyonel 30cm sıklaştırma"
- **Kanıt:** [SÜRÜM] **v2.0 (27.01.2021): "TIC tanımındaki 30 cm hassasiyeti kaldırıldı."** Hata tablosundaki 30 cm mesajı eski bir kalıntıdır. [ÖLÇÜLDÜ] 6 örneğin hiçbirinde 30 cm aralık yok.
- **Düzeltme:** Seçenek kaldırılmalı. TIC = yapı aplikasyon projesindeki **3B köşe noktaları**; [KILAVUZ]: "arazi-bina kesişimindeki her bir kırılımı yakalayacak şekilde".

#### H9 🔴 Kod listeleri programa gömülmemeli
- **Gemini:** "14 Resmi TKGM CodeList Seçici"
- **Kanıt:** [OKUNDU, KILAVUZ "CodeList Kullanımı"]: "CodeList'ler geliştirilen yazılım içerisine **gömülmeyecek**, dinamik olarak dışarıdan **url üzerinden alınacaktır**. Bu yöntem ile üreticilerin CodeList'lerin son haline erişilmesi sağlanacaktır."
- **Düzeltme:**
  - Program her açılışta (ve elle "Güncelle" düğmesiyle) 14 URL'yi indirmeli.
  - Başarılı olursa yerel önbelleğe yazmalı (`%APPDATA%/…/codelists/*.xml` + indirme tarihi).
  - İnternet yoksa önbellek kullanılmalı ve bu durum arayüzde gösterilmeli ("Kod listeleri 12.03.2026 tarihli önbellekten").
  - Önbellek hiç yoksa kurulumla gelen yedek kopya kullanılmalı ve **uyarı** verilmeli.

#### H10 🔴 Büyük harf kuralı eksik
- **Kanıt:**
  - [KILAVUZ "Genel Hususlar"]: "Yüklenici tarafından belirlenecek olan değerler **Türkçe karakterler ile büyük harf** olarak kaydedilecektir."
  - [HATA-TABLOSU]: "{...} değeri büyük harfle yazılmalıdır."
  - [KURAL-2021]: birçok alanda "Hepsi büyük harf mi?"
  - [ÖLÇÜLDÜ]: `registeredQuality` = `MESKEN`, `DÜKKAN`, `DUBLEKS KONUT`, `OTO YIKAMA (DÜKKAN)`.
- **İstisna [ÖLÇÜLDÜ]:** `registeredFloorDefinition` örneklerde `Zemin Kat`, `Bodrum Kat`, `4. Bodrum Kat` (karışık harf). Bu alan "liste beyanındaki gibi aynen" yazılır.
- **Düzeltme:**
  - Serbest metin alanları için Türkçe kurallı büyük harf dönüştürücü yazılmalı: `i→İ`, `ı→I`, `ş→Ş`, `ğ→Ğ`, `ü→Ü`, `ö→Ö`, `ç→Ç`. JS'de `toLocaleUpperCase('tr-TR')`.
  - Uygulanacak alanlar: `registeredQuality`, `registeredInstallation`, `blockName`, `entrance`, il/ilçe/mahalle adları.
  - `registeredFloorDefinition` liste beyanından **aynen** alınmalı.
  - DOĞRULANMALI: doğrulayıcının hangi alanları büyük harf kontrol ettiği.

#### H11 🔴 Bölümün başka kattaki eklentisi (depo, otopark, kiler) kuralı yok
- **Kanıt:**
  - [KILAVUZ "Bodrum Katlarda Bulunan Depo vb."]: "2020 ve sonraki yıllarda … bağımsız bölümler ile ilişkili olan eklentiler (depo, otopark, kiler vb.) **her bir bağımsız bölümün kısmı** olarak çizilecek… Bu kısımların geometrisi bağımsız bölüm gibi temsil edilmeyip **ortak alan geometrisi gibi** temsil edilecektir. Bu kısımların meta dataları bağımsız bölüm kısım gibi olacaktır."
  - S.S.S. 19: "İlgili depo bağımsız bölüme ait olduğundan, bağımsız bölüme kısım olarak eklenmelidir."
  - [REHBER] alternatif yol: "Bağımsız bölüm içerisinde erişim olmayan durumlarda ilgili depo ve eklentiler, **bağımsız bölüm gibi** çizilmeli ve … codelist (1005 Depo / 1006 Eklenti)."
- **Düzeltme:** İki seçenek desteklenmeli; kullanıcı seçer.
  - (a) **Uzak kısım:** `bldg:Room` (BBK), `independentSectionObjectReference` = ana BB parçası. Geometri OA gibi: dış duvarlar `WallSurface` ile, BB küveti yok. `partCount`'a dahil.
  - (b) **Ayrı BB parçası:** usage 1005/1006, kendi küveti.
- **[REHBER] öncelikli olduğu için varsayılan (b) olmalı (ÖNERİ).** Rehber 2025 tarihli ve Ornek2/Ornek5'te 1005/1006 kullanımı mevcut olabilir. DOĞRULANMALI.

#### H12 🟠 Kılavuzdaki özel durum kuralları eksik
Gemini planında yok, [KILAVUZ] S.S.S.'den okundu:

| Durum | Kural |
|---|---|
| Sütun (S.S.S. 18) | Mülkiyete esas alanlarda çapı veya bir kenarı **50 cm'den uzun** sütunlar çizilir. **Yuvarlak sütun 12 kenarlı çokgen.** Ortak alandaki sütunlar çizilmez. → `roomInstallation` (BBKIY, 1002 Sütun) |
| Kepenk (S.S.S. 29) | Projede kapı yerine kepenk varsa **pencere** olarak temsil edilir. |
| Sahanlık penceresi (S.S.S. 30) | İki katı kesen pencere, proje yüksekliğiyle **her iki kata da** eklenir. |
| Balkon çıkışı (S.S.S. 31) | Belirtilmemişse **kapı** olarak çizilir. |
| Yangın merdiveni (S.S.S. 24) | OA, `commonAreaUsage=1022`, `storeyObjectReference=-1`. Bitişikse kat dış sınırı onu içine alır, değilse almaz. |
| Işıklık (S.S.S. 16) | Ortak alan. |
| İç içe ortak alan (S.S.S. 14) | Ortak alana ait alt kısımlar (sığınak WC'si gibi) gösterilmez. Başka bir OA'yı kapsayan OA varsa ayrı OA. |
| Komşu niteliksiz OA (S.S.S. 15, 28) | Birleştirilebilir. Nitelikli OA veya BB'ye komşu olanlar ayrı çizilir. |
| BB numarası yoksa | Bina girişinin solundan başlayarak **saat yönünün tersine** 1'den numaralanır. Giriş altındaki katlarda `b1`, `b2`… |
| Kısım alanı %10'dan fazla farklıysa | Gerekçesiyle işlenir. BB için `geometrySuitability=1002` (Alan Uyumsuzluğu) + `additionalNote` gerekçe. |
| Galeri boşluğu | Teknik Hacim (1028). Asma kat içindeki boş fuaye galeri sayılmaz. |
| Havalandırma | BB dışındaysa niteliksiz OA (1022), BB içindeyse Teknik Hacim (1028). |
| Asma kat | **Kat değildir.** Alt kattaki kat geometrisi asma katı da kapsayacak yükseklikte tanımlanır. Asma kattaki BB geometrisi "Çoklu Kat (1003)". |
| Çatı katı | Yalnız OA veya eklenti varsa **Kat nesnesi oluşturulmaz** (OA `storeyObjectReference=-1`). Dubleksin üst katıysa kat oluşturulmaz. BB varsa kat oluşturulur, `storeyNumber="CK_"+n`. |
| Kat alanı (Ornek2 Kat -1) | Yalnız ortak alan içeren bodrum katta **Kat nesnesi oluşturulur**, `storeyUsage=1003`, `independentSectionCount=0`, üye yok [ÖLÇÜLDÜ: Ornek2 ve Ornek5'te Kat -1]. |
| Dolgu alanı (S.S.S. 4) | Bina dış sınırı dolgunun **dışından** çizilir. |
| Kısım içinde kısım | İç kısım dış kısımdan çıkarılır. Dış kısmın tabanı ve tavanı **delikli** olur. |
| Amerikan mutfak | Salon olarak tek kısım (1003), alan toplamı. |
| Bağımsız bölüm içi merdiven | Duvarla ayrılıp alanı yazılıysa BBK 1024 "Merdiven"; değilse `roomInstallation` 1001. |

#### H13 🟠 Toleranslar belirtilmemiş
- **Kanıt [SÜRÜM]:**

| Kural | Tolerans | Kaynak |
|---|---|---|
| TIC en üst kotu ↔ zemin kat tabanı ↔ FootPrint | 1 mm | v2.20 |
| RoofEdge ↔ en üst kat tavanı | 1 mm (+ "RoofEdge kontrolüne tolerans eklendi") | v2.20, v2.27 |
| Oda ↔ BB ↔ Kat değme | 1 mm | v2.15 |
| BB ↔ oda kesişimi | 0.1 m² | v2.22 |
| Balkon ↔ BB kesişimi | 1 mm | v2.19 |
| Aynı parseldeki mimari binaların üst üste binmesi | 1 m | v2.15 |
| Balkon taban kalınlığı en az | 10 cm | v2.6 |
| Balkon yan duvar kalınlığı en az | 5 cm | v2.6 |
| Hacim kontrolü | tolerans içindeyse **uyarı** | v2.23 |
| Çatı katlarında taban kalınlık kontrolü | **kaldırıldı** | v2.30 |
| Kesilmiş çatı katında oda–BB değme | **kaldırıldı** | v2.23 |
| Plan alanı ↔ hesaplanan alan | %10 | [HATA-TABLOSU] |
| [KURAL-2021] kısım alanı ↔ geometri | %5 | eski |

- **Düzeltme:** Bölüm 6'daki doğrulayıcı bu toleransları kullanmalı.

#### H14 🟠 Bina yüksekliği aralığı (bu belgenin önceki incelemesindeki bir hatanın düzeltmesi)
- İkinci incelemede (D2) "0–950 aralığı yalnız fotogrametrik `measuredHeight` içindir" demiştim. **Bu eksikti.** [KURAL-2021] mimari bina için açıkça şunu içeriyor: "**Yapı Yüksekliği** … 0'dan büyük ve 950'den küçük mü?"
- **Düzeltme:** `buildingHeight` için 0 < h < 950 kontrolü yapılmalı. `measuredHeight` yine yazılmamalı. Gemini v3'ün bu aralığı koruması doğru.

#### H15 🟠 Kat sayısı eşitliği
- **Kanıt [ÖLÇÜLDÜ 9/9]:** `storeysAboveGround + storeysBelowGround = Kat (grp:class=Kat) nesnesi sayısı`. Örnekler: Ornek1 16+1=17, Ornek3 11+5=16, Ornek5 5+1=6, Sincan 4+1=5…
- [HATA-TABLOSU]: "Toplam kat adedi ile gml dosyasındaki kat adedi uyuşmuyor."
- **Düzeltme:**
  - Zemin üstü sayısı = `storeyNumber`'ı `Z`, `1`, `2`, … veya `CK_n` olan katlar.
  - Zemin altı = negatif numaralı katlar.
  - Toplam, Kat nesnesi sayısına eşit olmalı.
  - Kat nesnesi oluşturulmayan çatı katı (yalnız OA olan) sayılmaz.

#### H16 🟠 RoofEdge ve FootPrint birden fazla poligon olabilir
- **Kanıt:** [ÖLÇÜLDÜ] Ornek5'te `lod0RoofEdge` içinde **2 poligon** var. [KILAVUZ]: "Binaların birden fazla blok içermesi durumunda… her bir blok için ayrı poligonlar oluşturulup FootPrint ve RoofEdge hazırlanmalıdır."
- **Düzeltme:** LoD0 üreticisi MultiSurface içinde n poligona izin vermeli. Örnek: en üst katı iki ayrı kütleden oluşan yapı.

#### H17 🟠 Eğik tavanlı odalarda tavan bir eleman ama çok poligon
- **Kanıt:** [ÖLÇÜLDÜ] Ornek2'de çatı arası odalarında `CeilingSurface` eleman sayısı 1, ama içinde 4–31 poligon var.
- [HATA-TABLOSU]: "Tavan yüzeyi (CeilingSurface) sayısı 1'den fazla olamaz." Bu kural **eleman** sayısını kastediyor.
- **Düzeltme:** Oda başına tam 1 `CeilingSurface` elemanı olmalı, içinde gerektiği kadar düzlemsel poligon. `FloorSurface` için de aynısı.

#### H18 🟠 Oda yüksekliği kuralının çatı arasındaki yorumu
- **Kanıt:** [ÖLÇÜLDÜ] Ornek2'de taban ile en alçak tavan arası 1.3 m olan 2 oda var, dosya yine de kabul edilmiş. [HATA-TABLOSU]: "Oda yüksekliği 1.5 metreden az olamaz."
- **Düzeltme (ÖNERİ):** Oda yüksekliği = **en yüksek tavan noktası − taban**. Bu < 1.5 m ise hata. En alçak nokta < 1.5 m ise yalnız bilgi. DOĞRULANMALI.

#### H19 🟡 Kalibrasyon şablonları iddiası
- **Gemini:** "TKGM'nin resmi örnek senaryolarını … tek tıkla sahneye yükleyen, B-Rep olarak yeniden üretip doğrulama testinden geçiren hazır kalibrasyon veri setleri"
- **Sorun:** Bir GML'den tasarım modeline (kat sınırı, BB, kısım, açıklık parametreleri) geri dönmek çok zordur ve plan bunun nasıl yapılacağını tanımlamıyor.
- **Düzeltme:** İki ayrı yetenek tanımlanmalı.
  - (1) **GML gidiş-dönüş testi (kolay, zorunlu):** okuma → bellekte B-rep → aynı yapıda yazma → yapısal karşılaştırma.
  - (2) **"Elle yeniden çizim" altın testi (zorunlu):** Ornek6 villası test verisi olarak tasarım modeli JSON'una **elle** girilir. Program GML üretir, sonuç Ornek6 ile sayısal olarak karşılaştırılır (Bölüm 10).

  GML → tasarım modeli otomatik dönüştürücü (3) ilk sürüm kapsamı dışındadır.

#### H20 🟡 "Satır satır kalibre edilmiş" iddiası
- Plan henüz hiçbir dosya üretmedi. Arayüzde ve belgelerde "%100 uyumlu", "kalibre edilmiş" gibi ifadeler kullanılmamalı. Kabul kriteri yalnızca Bölüm 10–11'deki testlerdir.

#### H21 🟠 IntBuildingInstallation geometri özelliğinin adı
- **Kanıt:**
  - [ÖLÇÜLDÜ] Ornek2'de İç Yapı geometrisi **`bldg:lod4Geometry`** içinde (10/10).
  - [REHBER] ve [KILAVUZ] örnek kodu `bldg:lod4MultiSurface` ve küçük harfli `bldg:intBuildingInstallation` yazıyor. CityGML 2.0 XSD'ye göre `IntBuildingInstallation`'da `lod4MultiSurface` diye bir özellik **yoktur**, `lod4Geometry` vardır.
- **Düzeltme:** `<bldg:IntBuildingInstallation gml:id="BBKIY_…">` … `<bldg:lod4Geometry><gml:MultiSurface>` + xlink'ler. Ayrıca `bldg:boundedBy` içinde `FloorSurface`, `InteriorWallSurface`, `CeilingSurface`.

#### H22 🟠 Rehberdeki örnek kodlarda başka hatalar da var; örnekler esas alınmalı

| Rehber örneği | Doğrusu ([ÖLÇÜLDÜ] + XSD) |
|---|---|
| Balkon: `<gen:class>Balkon</gen:class>` | `<bldg:class>Balkon</bldg:class>` |
| Kat: tabloda `<bldg:class>Kat</bldg:class>` | `<grp:class>Kat</grp:class>` |
| BB: tabloda `<bldg:class>BagimsizBolum</bldg:class>` | `<gen:class>BagimsizBolum</gen:class>` |
| BBK örneği `<gen:class>BagimsizBolumKisim</gen:class>` | `<bldg:class>BagimsizBolumKisim</bldg:class>` |
| Kapı örneği `<gml:surfaceMember><gml:exterior><gml:MultiSurface><gml:LinearRing>` | `<gml:surfaceMember><gml:Polygon gml:id="Door_…"><gml:exterior><gml:LinearRing gml:id="DoorLinearRing_…">` |
| Tavan xlink `#Ceil_…` | Poligon id öneki `Ceiling_` |
| Kat adı `Kat 0` (boşluklu) | `Kat_0` / `Kat_Z` (alt çizgili) |
| `CK_ ` (sonda boşluk) | DOĞRULANMALI: boşluksuz `CK_3` önerilir |
| Bağımsız bölüm adı `A _1_12_Bağımsız Bölüm` (boşluklu) | `A_1_12_Bağımsız Bölüm` (boşluksuz) |
| İç Yapı adı `blok_giriş_no _Salon_İç Yapı` (boşluklu) | `blok_giriş_no_Salon_İç Yapı` [ÖLÇÜLDÜ: `-1_-1_11_Dükkan_İç Yapı`] |

#### H23 🟠 MAKS değerleri
- **Kanıt:**
  - [KILAVUZ "Sürdürülebilirlik Değişiklikleri"]: "maksIdentityNumber (MAKS Bağımsız Bölüm Kimlik No)… Bu değer **tkgm tarafından sağlanan servislerden sorgulanarak** tespit edilmelidir."
  - [SÜRÜM] v2.49: MAKS yapı geometrisi ile parsel ve TIC kesişimi, MAKS BB no ve kat no kontrolleri devreye alındı.
  - [ÖLÇÜLDÜ] Ornek5'te `maksIdentityNumber=11111` ve BB'lerde `1` gibi yer tutucu değerler var.
- **Düzeltme:**
  - Program MAKS numaralarını kullanıcıdan almalı.
  - Bilinen herkese açık bir MAKS API'si olmadığı için otomatik sorgu yapılmamalı. DOĞRULANMALI: TKGM'nin üreticilere açık bir servisi var mı.
  - Değerler tamsayı olmalı ([KILAVUZ] Sürdürülebilirlik S-C 1: "numarataj… ID değeridir… tamsayı").
  - Eksik MAKS değeri için "yerel kontrol: uyarı / TKGM: hata" olarak raporlanmalı.

#### H24 🟡 Doğrulama için TKGM'nin önerdiği araçlar
- [KILAVUZ Sürdürülebilirlik S-C 4]: "Bu hataların bir kısmı val3dity'den gelmektedir. Dosyayı cityjson'a dönüştürüp (`https://github.com/citygml4j/citygml-tools`) val3dity ile kontrol edebilirsiniz."
- **ÖNERİ:** Uygulama isteğe bağlı olarak:
  1. `citygml-tools to-cityjson` ile CityJSON üretir.
  2. `val3dity` komut satırını çalıştırır.
  3. JSON raporunu kendi hata listesine ekler.

  Her iki araç da kullanıcı tarafından ayrıca kurulmalı. Dağıtım lisansları (citygml-tools Apache-2.0, val3dity GPL-3.0) **hukuken kontrol edilmeli**. Ayrıca TKGM'nin eski bir masaüstü doğrulayıcısı (`kadastro_3d_gml_validation.zip`, 15 MB, 2024) yayımlanmıştır. İçeriği incelenmedi ve çalıştırılmadı; kullanıcı kendi bilgisayarında denemek isterse ayrıca değerlendirilmelidir.

---

## 2. Kesinleşmiş Kurallar — Tek Tablo (Karar Kaydı)

Bu tablo uygulamanın "sözleşmesi"dir. Kod bu tabloya göre yazılır, tablo değişirse kod değişir. Her kural için kaynak ve güven düzeyi verilmiştir.

| Kod | Kural | Değer / Davranış | Kaynak |
|---|---|---|---|
| K01 | GML sürümü | CityGML 2.0 + GML 3.1.1 (`http://www.opengis.net/gml`). GML 3.2 yasak (-904) | ÖLÇÜLDÜ 9/9, HATA |
| K02 | Kodlama | UTF-8, **BOM'suz**, ilk satır `<?xml version="1.0" encoding="utf-8"?>`, satır sonu CRLF (ÖNERİ; örneklerin hepsi CRLF) | ÖLÇÜLDÜ 9/9 |
| K03 | Dosya adı | `M-` + constructionID + `.gml` | REHBER, HATA |
| K04 | Dosyada bina sayısı | Tam 1 `bldg:Building` | HATA |
| K05 | cityObjectMember | ≥ 4 (MB + ≥1 K + ≥1 BB + MBG) | HATA |
| K06 | CRS | Yalnız `gml:Envelope` üzerinde `srsName="EPSG:525x" srsDimension="3"`. Polygon ve MultiSurface'de srsName **yasak** | ÖLÇÜLDÜ, HATA |
| K07 | EPSG | DOM 27→5253, 30→5254, 33→5255, 36→5256, 39→5257, 42→5258, 45→5259 | REHBER |
| K08 | Koordinat aralığı | 300000 < Y(easting) < 700000 ve 2500000 < X(northing) < 5000000 | KURAL-2021 |
| K09 | Koordinat hane | Tam 3 ondalık (`123.456`) | HATA (örnekler 1–12 hane; en katı kural seçildi) |
| K10 | Yükseklik | Ortometrik (TUREF), gerçek kotlar. Yerel 0-tabanlı kot **yasak** | REHBER; BAŞARISIZ örnekte z = 0.63–12.0 |
| K11 | Envelope | Tüm geometri **ve TIC** dahil 3B min/max. Z farkı < 900 m, XY farkı < 1000 m, alan > 0, lower < upper | HATA, KURAL-2021 |
| K12 | gml:id | Yalnız listedeki nesneler, Polygon ve LinearRing'ler. Önek + `_` + küçük harf GUID, süslü parantez yok. Tekrar yok | REHBER, ÖLÇÜLDÜ (0 tekrar) |
| K13 | id **olmayacak** elemanlar | `*Surface` elemanları, `MultiSurface`, `Solid`, `CompositeSolid`, `CompositeSurface`, `MultiCurve`, `LineString` | ÖLÇÜLDÜ (0 adet), HATA |
| K14 | gml:name | Yalnız listedeki nesneler ve yüzey elemanları (Duvar, Çatı, Zemin, Taban, Tavan, İçDuvar, DışTaban, DışTavan). Polygon'a ad yok | REHBER |
| K15 | Bina `buildingType` | 1001 (kilitli) | HATA |
| K16 | Bina `geometrySuitability` | 1006 (kilitli) | HATA, ÖLÇÜLDÜ 9/9 (Başarısız: 1005) |
| K17 | Bina `maksIntegrationState` | 1003 | ÖLÇÜLDÜ, REHBER |
| K18 | Bina `tenderRegistrationNumber`, `architecturalPlanID` | Boş: `<gen:value/>` | HATA, ÖLÇÜLDÜ (Başarısız: dolu) |
| K19 | constructionID | `<takbisPropertyIdentityNumber>-<HARF>`. Harf A, B, … (29'dan sonra AA, AB…). Mimari bina hep **Ana Yapı** (harf) | REHBER, HATA |
| K20 | BB `geometrySuitability` | 1001 (varsayılan) / 1002 (alan uyumsuzluğu + additionalNote) | KODLİST, HATA |
| K21 | BBK ve Balkon/Teras `geometrySuitability` | 1001 (kilitli) | HATA |
| K22 | BB `integrationState` | 1004 | HATA, ÖLÇÜLDÜ |
| K23 | BB `maksIntegrationState` | 1003 | ÖLÇÜLDÜ, REHBER |
| K24 | BB `takbisPropertyIdentityNumber` | -1 | REHBER, ÖLÇÜLDÜ |
| K25 | BB `blockName` | Projedeki blok adı **aynen**; yoksa `-1`. Boş bırakılamaz | KILAVUZ Sürd. md.8, ÖLÇÜLDÜ |
| K26 | BB `entrance` | Projedeki giriş; yoksa **boş** `<gen:value/>` | ÖLÇÜLDÜ |
| K27 | `propertyLot` | string, `pay/payda`, tek adet, boş olamaz, pay ≤ payda | KILAVUZ Sürd. md.9 |
| K28 | `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition` | string, BB içinde **tam 1'er adet**. `registeredInstallation` boş olabilir | KILAVUZ Sürd. md.10–12 |
| K29 | `independentSectionCardinalDirection` | Cephe başına 1 eleman, aynı değer tekrarlanamaz | HATA |
| K30 | Dubleks | Her kattaki parça ayrı `GenericCityObject`, aynı `independentSectionNumber`. Net/brüt alan her parçada **aynı toplam değer**, `calculatedArea` parçaya özel. Giriş katı parçası usage 1001/1002, diğerleri 1003 | REHBER, KILAVUZ |
| K31 | `totalIndependentSectionCount` | Benzersiz BB numarası sayısı | ÖLÇÜLDÜ (Ornek2: 17 parça → 13) |
| K32 | Kat `independentSectionCount` | O katın `groupMember` sayısı (= BB parça sayısı) | HATA, ÖLÇÜLDÜ |
| K33 | Kat `groupMember` | Yalnız BB parçaları (OA değil) | ÖLÇÜLDÜ 9/9, HATA |
| K34 | storeysAbove + storeysBelow | = Kat nesnesi sayısı | ÖLÇÜLDÜ 9/9 |
| K35 | MBG | 1 adet, en sonda; üyeler: MB, tüm K, tüm BB | ÖLÇÜLDÜ, HATA |
| K36 | Kısım `calculatedArea` | Floor_ poligonunun net alanı | ÖLÇÜLDÜ (1.143/1.143) |
| K37 | Kısım `volume` | Kapalı oda kabuğunun hacmi. Düz tavanda = alan × yükseklik | ÖLÇÜLDÜ (1.020/1.022 düz) |
| K38 | BB `independentSectionCalculatedArea` | BB küveti alt Floor_ alanı | ÖLÇÜLDÜ |
| K39 | Balkon `calculatedArea` | Balkon taban kutusu üst yüz alanı | ÖLÇÜLDÜ (151/151) |
| K40 | `planArea` (BBK, balkon) | Projedeki değer; yoksa `-1.0` | ÖLÇÜLDÜ |
| K41 | BB net/brüt plan alanı | Projedeki değer; yoksa `-1` | ÖLÇÜLDÜ |
| K42 | Taban (döşeme) kalınlığı | Projeden; yoksa 0.20 m. Döşeme **üstteki** BB'ye aittir | KILAVUZ S.S.S.22, ÖLÇÜLDÜ (0.10/0.12/0.15/0.20) |
| K43 | Balkon taban kalınlığı | = ilgili BB taban kalınlığı (≥ 0.10) | REHBER, SÜRÜM |
| K44 | Balkon korkuluk | Yükseklik projeden, yoksa 1.10 m; kalınlık yoksa 0.10 m (≥ 0.05) | REHBER |
| K45 | Kapı varsayılan | Yükseklik 2.10 m (tabandan). Kat yüksekliği < 2.10 m ise tavanın 0.30 m altına kadar. **Kapı alt kenarı = zFloorTop + 10 mm** (delik duvar poligonunun kenarına asla değmez; v3.1 düzeltmesi) | REHBER; ÖLÇÜLDÜ (Ornek6 36/36, Ornek4 126/126, Sincan 311/311 oda kapısı +10 mm; Ornek2 +50 mm; 6 dosyada kenara değen delik 0) |
| K45a | Açıklık deliği–poligon sınırı | Hiçbir delik halkası, bulunduğu poligonun dış halkasına değmez (alt ve üst ≥ 10 mm boşluk) | ÖLÇÜLDÜ (0 / ~3.400 delik); OGC/val3dity -205/-206 |
| K46 | Pencere varsayılan | Mesken: tavana 0.50 m, yükseklik 1.30 m. Ticari: tabandan 0.10 m, tavana 0.10 m. Banyo/WC ve küçük bodrum: tavana 0.50 m, yükseklik 0.50 m | REHBER |
| K47 | Havalandırmaya açılan banyo/WC penceresi | Çizilmez | REHBER |
| K48 | Kapı/pencere nesnesi | 1 poligon, deliksiz, `lod4MultiSurface`. Halkası, duvardaki delik halkasının **sırasıyla aynı** kopyası | ÖLÇÜLDÜ (>3.000/3.000) |
| K49 | Açıklık temsilleri | LoD2 WallSurface (delik + nesne) · Kat (delik) · BB küveti (dış delik + iç delik + yan yüzler) · Her komşu Kısım (delik + nesne) | ÖLÇÜLDÜ, REHBER |
| K50 | Halka yönü | Dış halka dışarıdan bakınca CCW; iç halka ters | KILAVUZ, HATA -208, ÖLÇÜLDÜ |
| K51 | LoD0 | FootPrint z = TIC en üst z (1 mm). RoofEdge z = en üst kat tavanı = çatının en alçak noktası (1 mm). Çıkma balkonlar hariç. Blok başına ayrı poligon olabilir | REHBER, HATA, SÜRÜM |
| K52 | LoD1 | CompositeSolid. Yer üstü (FootPrint ↔ RoofEdge) + varsa yer altı (FootPrint ↔ en alt taban). Büyük alanlı kontur referans. Poligonlar satır içi, `Lod1Poligon_` | REHBER, HATA |
| K53 | LoD2 | boundedBy: 1 RoofSurface (n poligon), 1 GroundSurface, n WallSurface (kat ve kırılım başına), OuterFloor ve OuterCeiling. `lod2MultiSurface` = tümüne xlink | ÖLÇÜLDÜ, REHBER |
| K54 | TIC | `lod2TerrainIntersection/MultiCurve/curveMember/LineString/posList`. Kapalı. Aplikasyon 3B köşeleri. **30 cm sıklaştırma yok** | SÜRÜM v2.0, ÖLÇÜLDÜ |
| K55 | Kat geometrisi | `grp:geometry/MultiSurface`. Döşeme kutusu (`Floor_`) + dış duvarlar (`Wall_`) döşeme üstünden kat tepesine, delikli. Tavan yok. ≥3 Wall_, ≥1 Floor_ | HATA, ÖLÇÜLDÜ. Biçim B: Ornek2, Ornek5, Sincan(başarılı). Biçim A: Ornek6, Ornek4, Ornek1, Amasya(başarılı). **İkisi de kabul ediliyor**; B varsayılan |
| K56 | BB küveti | `gen:lod2Geometry/MultiSurface`. Döşeme kutusu (`Floor_`) + iç ve dış duvar yüzleri + açıklık yan yüzleri + duvar üst halkası (`Wall_`). Tavan yok. Her poligon ayrı surfaceMember | ÖLÇÜLDÜ, REHBER |
| K57 | Kısım kabuğu | `lod4MultiSurface` (xlink) + boundedBy: 1 FloorSurface, ≥3 InteriorWallSurface (OA'da dış cephe WallSurface), 1 CeilingSurface | HATA, ÖLÇÜLDÜ |
| K58 | Oda yüksekliği | ≥ 1.5 m (en yüksek nokta; bkz. H18) | HATA |
| K59 | İç Yapı | `bldg:roomInstallation/bldg:IntBuildingInstallation`, `lod4Geometry`. Taban, duvar ve tavan kapalı. Oda tabanını **delmez** | ÖLÇÜLDÜ (10/10, 15/15) |
| K60 | Kod listeleri | Çalışma anında URL'den, önbellekli | KILAVUZ |
| K61 | Büyük harf | Üretici metinleri Türkçe büyük harf; `registeredFloorDefinition` aynen | KILAVUZ, ÖLÇÜLDÜ |
| K62 | Onay tarihi yoksa | Belge tarihi; o da yoksa `1900-01-01` | KILAVUZ S.S.S.27 |
| K63 | Sütun | > 50 cm ise çizilir; yuvarlak = 12-gen; OA'da çizilmez | KILAVUZ S.S.S.18 |
| K64 | `buildingHeight` | Projeden, kot noktasından saçağa. `doubleAttribute`, 2 hane, 0 < h < 950 | ÖLÇÜLDÜ, REHBER, KURAL-2021 |
| K65 | `roofProjectionArea` | Çatı poligonlarının 2B izdüşüm birleşiminin alanı, 2 hane (saçak dahil) | REHBER; ÖLÇÜLDÜ Ornek6: 120.79 ≠ RoofEdge 91.34 |
| K66 | `elevatorCount` | Asansör sayısı, yoksa 0 | REHBER |
| K67 | Texture/Appearance | **Yazılmaz** (zorunlu değil; yazılırsa PNG ve ParameterizedTexture kuralları devreye girer) | ÖNERİ |
| K68 | `measuredHeight` | Yazılmaz | ÖLÇÜLDÜ 9/9 |
| K69 | Bina–parsel | Bina tabanı MEGSİS parselini kesmeli; ada/parsel numaraları eşleşmeli | HATA (yalnız TKGM'de) |

---

## 3. Dosya Formatı — Birebir XML Şablonları

Aşağıdaki şablonlar örnek dosyaların ham XML'inden çıkarılmıştır. **Eleman sırası CityGML 2.0 XSD sırasıdır**; değiştirilmemelidir. Generic öznitelikler (`gen:*Attribute`) şema gereği `gml:name`'den sonra ve sınıfa özgü elemanlardan (`bldg:class` vb.) önce gelir. Kendi aralarındaki sıra şema açısından serbesttir; örneklerdeki sıra aşağıda verilmiştir ve aynen kullanılmalıdır (ÖNERİ).

### 3.1 Sayı biçimleri

| Veri | Biçim | Örnek |
|---|---|---|
| Koordinat | `toFixed(3)`, nokta ondalık ayırıcı, binlik ayırıcı yok | `532568.580 4288398.700 1095.900` |
| Koordinat listesi | `gml:posList` (tek satır, boşlukla ayrılmış). Kapalı halkada ilk nokta sonda tekrar | — |
| Alan (double) | `toFixed(2)` | `15.72`, `120.79` |
| Bilinmeyen alan (BBK, balkon `planArea`) | `-1.0` | örneklerle aynı |
| Bilinmeyen alan (BB plan net/brüt) | `-1` | örneklerle aynı |
| Hacim | `toFixed(2)` | `40.86` |
| Yükseklik (`buildingHeight`) | `toFixed(2)` | `7.45` |
| int | Tamsayı, boşluksuz, tab karaktersiz | `431289685` (Ornek6'da bir değer başında TAB vardı; bu bir hatadır, tekrarlanmamalı) |
| Tarih | `YYYY-MM-DD` | `1999-12-09` |
| Boş değer | `<gen:value/>` | — |

**Not:** `gml:pos` yerine `gml:posList` kullanılması ÖNERİdir; örneklerin yarısı `pos`, yarısı `posList` kullanıyor ve ikisi de kabul edilmiş. `posList` dosyayı yaklaşık %40 küçültür.

### 3.2 Kök

```xml
<?xml version="1.0" encoding="utf-8"?>
<core:CityModel xmlns="http://www.opengis.net/citygml/2.0"
                xmlns:core="http://www.opengis.net/citygml/2.0"
                xmlns:gml="http://www.opengis.net/gml"
                xmlns:grp="http://www.opengis.net/citygml/cityobjectgroup/2.0"
                xmlns:gen="http://www.opengis.net/citygml/generics/2.0"
                xmlns:bldg="http://www.opengis.net/citygml/building/2.0"
                xmlns:app="http://www.opengis.net/citygml/appearance/2.0"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.opengis.net/citygml/2.0 http://schemas.opengis.net/citygml/2.0/cityGMLBase.xsd http://www.opengis.net/citygml/appearance/2.0 http://schemas.opengis.net/citygml/appearance/2.0/appearance.xsd http://www.opengis.net/citygml/building/2.0 http://schemas.opengis.net/citygml/building/2.0/building.xsd http://www.opengis.net/citygml/generics/2.0 http://schemas.opengis.net/citygml/generics/2.0/generics.xsd http://www.opengis.net/citygml/cityobjectgroup/2.0 http://schemas.opengis.net/citygml/cityobjectgroup/2.0/cityObjectGroup.xsd">
  <gml:boundedBy>
    <gml:Envelope srsDimension="3" srsName="EPSG:5254">
      <gml:lowerCorner>{minX} {minY} {minZ}</gml:lowerCorner>
      <gml:upperCorner>{maxX} {maxY} {maxZ}</gml:upperCorner>
    </gml:Envelope>
  </gml:boundedBy>
  <core:cityObjectMember> …Building… </core:cityObjectMember>
  <core:cityObjectMember> …Kat (her kat için, alttan üste)… </core:cityObjectMember>
  <core:cityObjectMember> …BB parçası (her biri için)… </core:cityObjectMember>
  <core:cityObjectMember> …MBG (tek, en sonda)… </core:cityObjectMember>
</core:CityModel>
```

Sıra [ÖLÇÜLDÜ Ornek6]: Building → tüm Katlar → tüm BB'ler → MBG.

### 3.3 Mimari Bina (`bldg:Building`)

```xml
<bldg:Building gml:id="MB_{guid}">
  <gml:name>Mimari Bina_{constructionID}</gml:name>
  <gen:stringAttribute name="constructionID"><gen:value>{70125626-A}</gen:value></gen:stringAttribute>
  <gen:intAttribute name="takbisPropertyIdentityNumber"><gen:value>{70125626}</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksIdentityNumber"><gen:value>{int}</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksIntegrationState"><gen:value>1003</gen:value></gen:intAttribute>
  <gen:stringAttribute name="blockNumber"><gen:value>{ada}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="parcelNumber"><gen:value>{parsel}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="tenderRegistrationNumber"><gen:value/></gen:stringAttribute>
  <gen:intAttribute name="buildingType"><gen:value>1001</gen:value></gen:intAttribute>
  <gen:intAttribute name="geometrySuitability"><gen:value>1006</gen:value></gen:intAttribute>
  <gen:stringAttribute name="architecturalPlanID"><gen:value/></gen:stringAttribute>
  <gen:stringAttribute name="additionalNote"><gen:value>-</gen:value></gen:stringAttribute>
  <gen:intAttribute name="takbisNeighbourhoodReference"><gen:value>{int}</gen:value></gen:intAttribute>
  <gen:intAttribute name="totalIndependentSectionCount"><gen:value>{n}</gen:value></gen:intAttribute>
  <gen:intAttribute name="elevatorCount"><gen:value>{n}</gen:value></gen:intAttribute>
  <gen:doubleAttribute name="roofProjectionArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
  <gen:doubleAttribute name="buildingHeight"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
  <gen:dateAttribute name="architecturalProjectConfirmationDate"><gen:value>{YYYY-MM-DD}</gen:value></gen:dateAttribute>
  <bldg:class>MimariBina</bldg:class>
  <bldg:storeysAboveGround>{n}</bldg:storeysAboveGround>
  <bldg:storeysBelowGround>{n}</bldg:storeysBelowGround>
  <bldg:lod0FootPrint><gml:MultiSurface>
    <gml:surfaceMember><gml:Polygon gml:id="Lod0FootPrint_{guid}"><gml:exterior><gml:LinearRing gml:id="LinearRing_{guid}"><gml:posList>…</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></gml:surfaceMember>
  </gml:MultiSurface></bldg:lod0FootPrint>
  <bldg:lod0RoofEdge><gml:MultiSurface>
    <gml:surfaceMember><gml:Polygon gml:id="Lod0RoofEdge_{guid}">…</gml:Polygon></gml:surfaceMember>
  </gml:MultiSurface></bldg:lod0RoofEdge>
  <bldg:lod1Solid><gml:CompositeSolid>
    <gml:solidMember><gml:Solid><gml:exterior><gml:CompositeSurface>
      <gml:surfaceMember><gml:Polygon gml:id="Lod1Poligon_{guid}">…</gml:Polygon></gml:surfaceMember>
      …(taban, tavan ve her kenar için bir yan yüz)…
    </gml:CompositeSurface></gml:exterior></gml:Solid></gml:solidMember>
    <!-- varsa ikinci solidMember: yer altı -->
  </gml:CompositeSolid></bldg:lod1Solid>
  <bldg:lod2MultiSurface><gml:MultiSurface>
    <gml:surfaceMember xlink:href="#Roof_{guid}"/> …tüm Roof_…
    <gml:surfaceMember xlink:href="#Wall_{guid}"/> …tüm bina dış duvarı Wall_…
    <gml:surfaceMember xlink:href="#OuterFloor_{guid}"/> …varsa…
    <gml:surfaceMember xlink:href="#OuterCeiling_{guid}"/> …varsa…
    <gml:surfaceMember xlink:href="#Ground_{guid}"/>
  </gml:MultiSurface></bldg:lod2MultiSurface>
  <bldg:lod2TerrainIntersection><gml:MultiCurve><gml:curveMember><gml:LineString>
    <gml:posList>{x y z …, kapalı}</gml:posList>
  </gml:LineString></gml:curveMember></gml:MultiCurve></bldg:lod2TerrainIntersection>
  <bldg:outerBuildingInstallation> …Balkon/Teras… </bldg:outerBuildingInstallation>   (her biri için)
  <bldg:boundedBy><bldg:RoofSurface><gml:name>Çatı</gml:name><bldg:lod2MultiSurface><gml:MultiSurface>…Roof_ poligonları…</gml:MultiSurface></bldg:lod2MultiSurface></bldg:RoofSurface></bldg:boundedBy>
  <bldg:boundedBy><bldg:GroundSurface><gml:name>Zemin</gml:name><bldg:lod2MultiSurface><gml:MultiSurface>…Ground_ poligonu…</gml:MultiSurface></bldg:lod2MultiSurface></bldg:GroundSurface></bldg:boundedBy>
  <bldg:boundedBy><bldg:WallSurface> …(3.4)… </bldg:WallSurface></bldg:boundedBy>   (her dış duvar yüzeyi için)
  <bldg:boundedBy><bldg:OuterFloorSurface><gml:name>DışTaban</gml:name>…</bldg:OuterFloorSurface></bldg:boundedBy>
  <bldg:boundedBy><bldg:OuterCeilingSurface><gml:name>DışTavan</gml:name>…</bldg:OuterCeilingSurface></bldg:boundedBy>
  <bldg:interiorRoom> …BBK/OA Room… </bldg:interiorRoom>   (her kısım için)
</bldg:Building>
```

**Notlar:**
- [ÖLÇÜLDÜ Ornek6] RoofSurface ve GroundSurface, WallSurface'lerden önce geliyor. XSD açısından `boundedBy` elemanlarının kendi aralarındaki sırası serbesttir.
- [ÖLÇÜLDÜ] `lod2MultiSurface` içindeki xlink'ler Building'in kendi `boundedBy` poligonlarını gösterir. Balkon poligonları burada **yoktur** (Ornek6: Roof 66, Wall 16, Ground 1; balkon Floor/Wall yok).
- `additionalNote` isteğe bağlıdır; örneklerde `-`.

### 3.4 Dış duvar yüzeyi (açıklıklı)

```xml
<bldg:WallSurface>
  <gml:name>Duvar</gml:name>
  <bldg:lod2MultiSurface><gml:MultiSurface>
    <gml:surfaceMember>
      <gml:Polygon gml:id="Wall_{guid}">
        <gml:exterior><gml:LinearRing gml:id="LinearRing_{guid}"><gml:posList>{CCW, dışarıdan}</gml:posList></gml:LinearRing></gml:exterior>
        <gml:interior><gml:LinearRing gml:id="DoorLinearRing_{guidA}"><gml:posList>{H halkası, ters yön}</gml:posList></gml:LinearRing></gml:interior>
        <gml:interior><gml:LinearRing gml:id="WindowLinearRing_{guidB}"><gml:posList>{…}</gml:posList></gml:LinearRing></gml:interior>
      </gml:Polygon>
    </gml:surfaceMember>
  </gml:MultiSurface></bldg:lod2MultiSurface>
  <bldg:opening>
    <bldg:Door gml:id="KAPI_{guid}">
      <gml:name>{doorUsage açıklaması, örn. Dış Kapı}</gml:name>
      <gen:intAttribute name="doorUsage"><gen:value>{1001..1004}</gen:value></gen:intAttribute>
      <bldg:lod4MultiSurface><gml:MultiSurface><gml:surfaceMember>
        <gml:Polygon gml:id="Door_{guid}"><gml:exterior>
          <gml:LinearRing gml:id="DoorLinearRing_{guidC}"><gml:posList>{H halkasının AYNI SIRALI kopyası}</gml:posList></gml:LinearRing>
        </gml:exterior></gml:Polygon>
      </gml:surfaceMember></gml:MultiSurface></bldg:lod4MultiSurface>
    </bldg:Door>
  </bldg:opening>
  <bldg:opening>
    <bldg:Window gml:id="PEN_{guid}">
      <gml:name>{Dış Pencere | İç Pencere}</gml:name>
      <gen:intAttribute name="windowUsage"><gen:value>{1001|1002}</gen:value></gen:intAttribute>
      <bldg:lod4MultiSurface>… Window_{guid} / WindowLinearRing_{guid} …</bldg:lod4MultiSurface>
    </bldg:Window>
  </bldg:opening>
</bldg:WallSurface>
```

**Notlar:**
- Kapı ve pencere nesnelerinde `bldg:class` **yoktur** ([SÜRÜM] v2.29: "Kapı ve Pencere örneklerinde yer alan class özelliği kaldırıldı"; [ÖLÇÜLDÜ]).
- Kapı/pencere halkası ile delik halkası aynı koordinatlara sahiptir ama **farklı gml:id** taşır.

### 3.5 Kat (`grp:CityObjectGroup`)

```xml
<grp:CityObjectGroup gml:id="K_{guid}">
  <gml:name>Kat_{storeyNumber}</gml:name>
  <gen:stringAttribute name="storeyNumber"><gen:value>{Z | -1 | 1 | CK_5}</gen:value></gen:stringAttribute>
  <gen:intAttribute name="storeyUsage"><gen:value>{1001|1002|1003}</gen:value></gen:intAttribute>   (çoklu olabilir)
  <gen:intAttribute name="independentSectionCount"><gen:value>{n}</gen:value></gen:intAttribute>
  <grp:class>Kat</grp:class>
  <grp:groupMember xlink:href="#BB_{guid}"/>   (bu kata bağlı her BB parçası)
  <grp:parent xlink:href="#MB_{guid}"/>
  <grp:geometry><gml:MultiSurface>
    <gml:surfaceMember><gml:Polygon gml:id="Floor_{guid}">…döşeme alt…</gml:Polygon></gml:surfaceMember>
    <gml:surfaceMember><gml:Polygon gml:id="Floor_{guid}">…döşeme üst…</gml:Polygon></gml:surfaceMember>
    <gml:surfaceMember><gml:Polygon gml:id="Floor_{guid}">…döşeme kenarı (her kenar)…</gml:Polygon></gml:surfaceMember>
    <gml:surfaceMember><gml:Polygon gml:id="Wall_{guid}">…dış duvar (delikli)…</gml:Polygon></gml:surfaceMember>
  </gml:MultiSurface></grp:geometry>
</grp:CityObjectGroup>
```

**Notlar:**
- `storeyUsage` değerleri: kattaki BB kullanımlarına göre **Mesken (1001) / Ticari (1002)**. Katta **nitelikli** ortak alan varsa ayrıca **1003** eklenir ([REHBER]).
- [ÖLÇÜLDÜ] Ornek5 Kat -1: `1003,1002`; Ornek2 Kat Z: `1002`.

### 3.6 Bağımsız Bölüm Parçası (`gen:GenericCityObject`)

```xml
<gen:GenericCityObject gml:id="BB_{guid}">
  <gml:name>{blok}_{giriş}_{bbNo}_Bağımsız Bölüm</gml:name>
  <gen:intAttribute name="geometrySuitability"><gen:value>1001</gen:value></gen:intAttribute>
  <gen:intAttribute name="integrationState"><gen:value>1004</gen:value></gen:intAttribute>
  <gen:stringAttribute name="independentSectionNumber"><gen:value>{no}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="blockName"><gen:value>{blok | -1}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="entrance"><gen:value>{giriş}</gen:value></gen:stringAttribute>   (yoksa <gen:value/>)
  <gen:intAttribute name="takbisPropertyIdentityNumber"><gen:value>-1</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksIdentityNumber"><gen:value>{int}</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksNumaratajIdentityNumber"><gen:value>{int}</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksIntegrationState"><gen:value>1003</gen:value></gen:intAttribute>
  <gen:stringAttribute name="registeredQuality"><gen:value>{MESKEN}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="registeredInstallation"><gen:value>{… | boş}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="registeredFloorDefinition"><gen:value>{Zemin Kat}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="propertyLot"><gen:value>{pay/payda}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="additionalNote"><gen:value>-</gen:value></gen:stringAttribute>
  <gen:intAttribute name="independentSectionCardinalDirection"><gen:value>{1001..1009}</gen:value></gen:intAttribute>   (her cephe için)
  <gen:intAttribute name="independentSectionUsage"><gen:value>{1001..1006}</gen:value></gen:intAttribute>
  <gen:intAttribute name="partCount"><gen:value>{n}</gen:value></gen:intAttribute>
  <gen:doubleAttribute name="independentSectionPlanNetArea"><gen:value>{0.00 | -1}</gen:value></gen:doubleAttribute>
  <gen:doubleAttribute name="independentSectionPlanGrossArea"><gen:value>{0.00 | -1}</gen:value></gen:doubleAttribute>
  <gen:doubleAttribute name="independentSectionCalculatedArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
  <gen:class>BagimsizBolum</gen:class>
  <gen:lod2Geometry><gml:MultiSurface>
    <gml:surfaceMember><gml:Polygon gml:id="Floor_{guid}">…</gml:Polygon></gml:surfaceMember>   (döşeme kutusu)
    <gml:surfaceMember><gml:Polygon gml:id="Wall_{guid}">…</gml:Polygon></gml:surfaceMember>    (iç/dış yüzler, söve/lento, üst halka)
  </gml:MultiSurface></gen:lod2Geometry>
</gen:GenericCityObject>
```

**Not:** Rehber v2.25'e göre Bina'nın `geometrySuitability` alanına birden fazla değer girilebilir; BB için de "1001 girildiyse başka değer girilemez" kuralı var. Uygulama BB'ye **tek değer** yazmalıdır.

### 3.7 Bağımsız Bölüm Kısmı (`bldg:Room`, BBK)

```xml
<bldg:interiorRoom>
  <bldg:Room gml:id="BBK_{guid}">
    <gml:name>{blok}_{giriş}_{bbNo}_{partUsage açıklaması}</gml:name>
    <gen:stringAttribute name="independentSectionObjectReference"><gen:value>BB_{guid}</gen:value></gen:stringAttribute>   (birden fazla BB ise her biri ayrı eleman)
    <gen:intAttribute name="partUsage"><gen:value>{1001..1030}</gen:value></gen:intAttribute>
    <gen:intAttribute name="geometrySuitability"><gen:value>1001</gen:value></gen:intAttribute>
    <gen:stringAttribute name="additionalNote"><gen:value>-</gen:value></gen:stringAttribute>
    <gen:doubleAttribute name="planArea"><gen:value>{0.00 | -1.0}</gen:value></gen:doubleAttribute>
    <gen:doubleAttribute name="calculatedArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
    <gen:doubleAttribute name="volume"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
    <bldg:class>BagimsizBolumKisim</bldg:class>
    <bldg:lod4MultiSurface><gml:MultiSurface>
      <gml:surfaceMember xlink:href="#Floor_{guid}"/>
      <gml:surfaceMember xlink:href="#InteriorWall_{guid}"/> …
      <gml:surfaceMember xlink:href="#Ceiling_{guid}"/> …
    </gml:MultiSurface></bldg:lod4MultiSurface>
    <bldg:boundedBy><bldg:FloorSurface><gml:name>Taban</gml:name><bldg:lod4MultiSurface><gml:MultiSurface>…Floor_…</gml:MultiSurface></bldg:lod4MultiSurface></bldg:FloorSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:InteriorWallSurface><gml:name>İçDuvar</gml:name><bldg:lod4MultiSurface><gml:MultiSurface>…InteriorWall_ (delikli olabilir)…</gml:MultiSurface></bldg:lod4MultiSurface>
      <bldg:opening>…Door/Window (3.4 ile aynı yapı)…</bldg:opening>
    </bldg:InteriorWallSurface></bldg:boundedBy>   (≥3 adet)
    <bldg:boundedBy><bldg:CeilingSurface><gml:name>Tavan</gml:name><bldg:lod4MultiSurface><gml:MultiSurface>…Ceiling_…</gml:MultiSurface></bldg:lod4MultiSurface></bldg:CeilingSurface></bldg:boundedBy>
    <bldg:roomInstallation> …İç Yapı (3.9)… </bldg:roomInstallation>
  </bldg:Room>
</bldg:interiorRoom>
```

**Notlar:**
- [ÖLÇÜLDÜ] Bir InteriorWallSurface elemanı birden fazla poligon içerebilir. Ornek6'da 4 eleman için 6–12 poligon var; T-kavşaklarda duvar parçalanıyor.
- Açıklıklar, ilgili poligonun ait olduğu InteriorWallSurface elemanının `bldg:opening`'ine yazılır.

### 3.8 Ortak Alan (`bldg:Room`, OA)

```xml
<bldg:interiorRoom>
  <bldg:Room gml:id="OA_{guid}">
    <gml:name>{commonAreaUsage açıklaması}_Ortak Alan</gml:name>
    <gen:stringAttribute name="storeyObjectReference"><gen:value>{K_{guid} | -1}</gen:value></gen:stringAttribute>
    <gen:intAttribute name="commonAreaUsage"><gen:value>{partUsage listesinden, örn. 1022}</gen:value></gen:intAttribute>
    <gen:doubleAttribute name="calculatedArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
    <bldg:class>OrtakAlan</bldg:class>
    <bldg:lod4MultiSurface>…Floor_, InteriorWall_, Wall_ (dış cephe), Ceiling_ xlink'leri…</bldg:lod4MultiSurface>
    <bldg:boundedBy><bldg:FloorSurface>…</bldg:FloorSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:InteriorWallSurface>…</bldg:InteriorWallSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:WallSurface><gml:name>Duvar</gml:name><bldg:lod4MultiSurface>…Wall_…</bldg:lod4MultiSurface>…opening…</bldg:WallSurface></bldg:boundedBy>   (dış cephe duvarları)
    <bldg:boundedBy><bldg:CeilingSurface>…</bldg:CeilingSurface></bldg:boundedBy>
    <bldg:roomInstallation> …OAIY… </bldg:roomInstallation>
  </bldg:Room>
</bldg:interiorRoom>
```

**Notlar:**
- OA'da `geometrySuitability`, `planArea` ve `volume` **yoktur** [ÖLÇÜLDÜ].
- [ÖLÇÜLDÜ Ornek2] OA'nın dış duvar parçaları `bldg:WallSurface` olarak yazılıyor ve içinde hem dikey yüzler hem yatay yüzler (duvar kalınlığı kapakları) bulunuyor (130 DOWN, 23 UP). Yani OA dış duvarı, BB küvetindeki gibi **kalınlıklı** modellenmiş. Uygulama da OA'nın dış duvarını kalınlıklı üretmelidir (ÖNERİ, örnekle uyumlu).

### 3.9 İç Yapı (`bldg:IntBuildingInstallation`)

```xml
<bldg:roomInstallation>
  <bldg:IntBuildingInstallation gml:id="BBKIY_{guid}">   (OA içindeyse OAIY_)
    <gml:name>{blok}_{giriş}_{bbNo}_{oda partUsage açıklaması}_İç Yapı</gml:name>   (OA içindeyse "{OA kullanım}_İç Yapı")
    <gen:intAttribute name="roomInstallationUsage"><gen:value>{1001 Merdiven | 1002 Sütun | 1003 Asansör}</gen:value></gen:intAttribute>
    <bldg:class>BagimsizBolumKisimIcYapi</bldg:class>   (OA içindeyse OrtakAlanIcYapi)
    <bldg:lod4Geometry><gml:MultiSurface>
      <gml:surfaceMember xlink:href="#Floor_{guid}"/>
      <gml:surfaceMember xlink:href="#InteriorWall_{guid}"/> …
      <gml:surfaceMember xlink:href="#Ceiling_{guid}"/>
    </gml:MultiSurface></bldg:lod4Geometry>
    <bldg:boundedBy><bldg:FloorSurface>…</bldg:FloorSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:InteriorWallSurface>…</bldg:InteriorWallSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:CeilingSurface>…</bldg:CeilingSurface></bldg:boundedBy>
  </bldg:IntBuildingInstallation>
</bldg:roomInstallation>
```

[ÖLÇÜLDÜ Ornek2] İç yapı tabanı = oda tabanı kotu (10/10). Tavan, düz tavanda oda tavanı; eğik tavanda çok poligonlu. Oda tabanı **delinmiyor** (10/10, 15/15).

### 3.10 Balkon / Teras (`bldg:BuildingInstallation`)

```xml
<bldg:outerBuildingInstallation>
  <bldg:BuildingInstallation gml:id="BLKN_{guid}">   (teras: TRS_)
    <gml:name>{blok}_{giriş}_{bbNo}_Balkon</gml:name>   (teras: -1_-1_-1_Teras)
    <gen:stringAttribute name="independentSectionObjectReference"><gen:value>{BB_{guid} | -1}</gen:value></gen:stringAttribute>
    <gen:intAttribute name="geometrySuitability"><gen:value>1001</gen:value></gen:intAttribute>
    <gen:stringAttribute name="additionalNote"><gen:value>-</gen:value></gen:stringAttribute>
    <gen:doubleAttribute name="planArea"><gen:value>{0.00 | -1.0}</gen:value></gen:doubleAttribute>
    <gen:doubleAttribute name="calculatedArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
    <bldg:class>Balkon</bldg:class>   (Teras)
    <bldg:lod2Geometry><gml:MultiSurface>
      <gml:surfaceMember xlink:href="#Floor_{guid}"/> …(taban kutusunun 6+ yüzü)…
      <gml:surfaceMember xlink:href="#Wall_{guid}"/> …(korkuluk prizmalarının tüm yüzleri)…
    </gml:MultiSurface></bldg:lod2Geometry>
    <bldg:boundedBy><bldg:FloorSurface><gml:name>Taban</gml:name><bldg:lod2MultiSurface>…tüm Floor_…</bldg:lod2MultiSurface></bldg:FloorSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:WallSurface><gml:name>Duvar</gml:name><bldg:lod2MultiSurface>…Wall_…</bldg:lod2MultiSurface></bldg:WallSurface></bldg:boundedBy>
  </bldg:BuildingInstallation>
</bldg:outerBuildingInstallation>
```

**Notlar:**
- [ÖLÇÜLDÜ] Taban: 1 FloorSurface elemanı, içinde alt + üst + yan yüzler (6–11 poligon).
- Korkuluk duvarları iki biçimde kabul edilmiş:
  - Ornek6: her poligon ayrı WallSurface elemanı (9–11 eleman).
  - Ornek2: tek WallSurface içinde 6–12 poligon.

  [KILAVUZ]: "yan duvar sayısı kadar wallSurface oluşturulup…" Bu yüzden **her yüz ayrı WallSurface** (Ornek6 biçimi) ÖNERİLİR.
- Korkuluk yüksekliği taban üstünden ölçülür. [ÖLÇÜLDÜ] Ornek6: ~1.0 m, Ornek2: ~1.2 m (projeden).

### 3.11 Mimari Bina Grup (MBG)

```xml
<grp:CityObjectGroup gml:id="MBG_{guid}">
  <gml:name>Mimari Bina Grup_{constructionID}</gml:name>
  <grp:class>MimariBinaGrup</grp:class>
  <grp:groupMember xlink:href="#MB_{guid}"/>
  <grp:groupMember xlink:href="#K_{guid}"/> …(tüm katlar)…
  <grp:groupMember xlink:href="#BB_{guid}"/> …(tüm BB parçaları)…
</grp:CityObjectGroup>
```

### 3.12 Ad üretim kuralları (tam liste)

| Nesne | Ad |
|---|---|
| Bina | `Mimari Bina_{constructionID}` |
| Kat | `Kat_{storeyNumber}` |
| BB | `{B}_{G}_{N}_Bağımsız Bölüm` |
| BBK | `{B}_{G}_{N}_{partUsage açıklaması}` |
| BBKIY | `{B}_{G}_{N}_{oda partUsage açıklaması}_İç Yapı` |
| OA | `{commonAreaUsage açıklaması}_Ortak Alan` |
| OAIY | `{OA kullanım açıklaması}_İç Yapı` |
| Balkon | `{B}_{G}_{N}_Balkon` |
| Teras | `{B}_{G}_{N}_Teras` (BB'siz: `-1_-1_-1_Teras`) |
| Kapı | doorUsage açıklaması (`Bina/Yapı Giriş Kapı`, `Dış Kapı`, `Bağımsız Bölüm Kapı`, `Kısım Kapı`) |
| Pencere | windowUsage açıklaması (`Dış Pencere`, `İç Pencere`) |
| MBG | `Mimari Bina Grup_{constructionID}` |
| Yüzey elemanları | FloorSurface `Taban`, WallSurface `Duvar`, RoofSurface `Çatı`, InteriorWallSurface `İçDuvar`, CeilingSurface `Tavan`, GroundSurface `Zemin`, OuterFloorSurface `DışTaban`, OuterCeilingSurface `DışTavan` |

**Kısaltmalar:**
- `{B}` = blockName, ad için `/`, `-`, `_` karakterleri silinmiş hali; boşsa `-1`.
- `{G}` = entrance, aynı şekilde temizlenmiş; boşsa `-1`.
- `{N}` = independentSectionNumber; yoksa `-1`.

**Açıklama metinleri** kod listesi XML'indeki `gml:description` değeridir, **birebir** kullanılır (yazım ve büyük/küçük harf aynen).

### 3.13 ID önekleri (tam liste)

| Nesne / poligon | Önek |
|---|---|
| Building | `MB_` |
| Kat | `K_` |
| BB parçası | `BB_` |
| BBK | `BBK_` |
| OA | `OA_` |
| BBKIY | `BBKIY_` |
| OAIY | `OAIY_` |
| Balkon | `BLKN_` |
| Teras | `TRS_` |
| MBG | `MBG_` |
| Kapı nesnesi | `KAPI_` |
| Pencere nesnesi | `PEN_` |
| FloorSurface poligonu (oda, BB, kat, balkon) | `Floor_` |
| Dış duvar / BB duvarı / kat duvarı / balkon duvarı / OA dış duvarı | `Wall_` |
| Çatı | `Roof_` |
| Oda iç duvarı | `InteriorWall_` |
| Tavan | `Ceiling_` |
| Zemin | `Ground_` |
| Dış taban | `OuterFloor_` |
| Dış tavan | `OuterCeiling_` |
| Kapatma | `Closure_` |
| LoD1 | `Lod1Poligon_` |
| LoD0 | `Lod0FootPrint_`, `Lod0RoofEdge_` |
| Kapı poligonu | `Door_` |
| Pencere poligonu | `Window_` |
| Dış halkalar (genel) | `LinearRing_` |
| Kapı deliği halkası ve kapı poligonu halkası | `DoorLinearRing_` |
| Pencere deliği halkası ve pencere poligonu halkası | `WindowLinearRing_` |

---

## 4. Veri Modeli

İki katman vardır:
1. **Tasarım modeli (Design Model, 2.5B):** Kullanıcının düzenlediği, JSON olarak kaydedilen tek doğruluk kaynağı.
2. **Üretilmiş B-rep (3B):** Tasarım modelinden **her değişiklikte yeniden** ve deterministik üretilen salt okunur geometri.

GML yazıcı ve 3B görüntüleyici **yalnız** B-rep'ten beslenir. GML okuyucu ise ayrı bir "içe aktarılmış B-rep" üretir (bkz. 9.6).

### 4.1 Birimler ve koordinatlar

- **İç birim: milimetre, tamsayı.** Tüm tasarım koordinatları `int` (JS `number` ama `Number.isInteger` garantili).
- **Yerel köken:** Proje ilk konumlandığında parselin (veya ilk aplikasyon noktasının) TUREF koordinatı `origin = (E0, N0)` tam metreye yuvarlanarak sabitlenir. Yerel koordinat `x = round((E − E0)·1000)`, `y = round((N − N0)·1000)`, `z = round(H·1000)` (mutlak ortometrik). Böylece değerler küçük kalır ve WebGL titremesi olmaz.
- **Dışa yazım:** `E = E0 + x/1000` → `toFixed(3)`. Köken tam metre olduğu için ondalık kısım tam olarak `x mod 1000`'dir; yuvarlama hatası **oluşmaz**.
- **Eksenler:** x = Doğu (TUREF Y / easting), y = Kuzey (TUREF X / northing), z = yukarı. GML `pos` sırası: **easting northing height** [ÖLÇÜLDÜ: `532568.58 4288398.70 1095.90`].

### 4.2 TypeScript arayüzleri (normatif)

```ts
type Mm = number;                 // tamsayı milimetre
type Pt2 = { x: Mm; y: Mm };
type Pt3 = { x: Mm; y: Mm; z: Mm };
type Ring2 = Pt2[];               // kapanış noktası TEKRAR EDİLMEZ (yazarken eklenir), CCW
type Poly2 = { outer: Ring2; holes: Ring2[] };   // holes CW
type Guid = string;               // küçük harf, süslüsüz, crypto.randomUUID()

interface Project {
  schemaVersion: 1;
  id: Guid;
  name: string;
  georef: Georef;
  parcel: Parcel;
  buildings: Building[];          // her biri ayrı M-*.gml
  settings: ProjectSettings;
  codelistSnapshot: CodelistSnapshotInfo; // hangi tarihli kod listesiyle çalışıldı
}

interface Georef {
  epsg: 5253|5254|5255|5256|5257|5258|5259;
  originE: number; originN: number;          // tam metre
  helmert?: { a: number; b: number; tx: Mm; ty: Mm; scaleLocked: boolean; residualsMm: number[] };
  controlPoints: { localCad: Pt2; turef: { E: number; N: number; H?: number }; use: boolean }[];
  zeroElevationOrthometric: Mm;   // ±0.00 kotunun ortometrik karşılığı
}

interface Parcel {
  takbisPropertyIdentityNumber: number;      // Taşınmaz Kimlik No (tapuzeminref)
  blockNumber: string;                       // ada
  parcelNumber: string;                      // parsel
  takbisNeighbourhoodReference: number;
  il?: string; ilce?: string; mahalle?: string;
  boundary?: Ring2;                          // isteğe bağlı (KML/GeoJSON/elle)
}

interface Building {
  id: Guid;                                  // MB_ guid'i
  letter: string;                            // A, B, …, AA
  constructionID: string;                    // türetilir: `${takbis}-${letter}`
  maksIdentityNumber: number | null;
  buildingHeightProject: number;             // metre, projeden (2 hane)
  elevatorCount: number;
  architecturalProjectConfirmationDate: string; // YYYY-MM-DD
  additionalNote: string;                    // varsayılan "-"
  storeys: Storey[];                         // alttan üste sıralı
  sections: IndependentSection[];
  sectionParts: SectionPart[];
  parts: Part[];                             // BBK + OA
  installations: RoomInstallation[];
  balconies: Balcony[];
  openings: Opening[];
  roof: Roof;
  tic: Pt3[];                                // kapalı değil; yazarken kapatılır
  mbgId: Guid;
}

interface Storey {
  id: Guid;                                  // K_ guid'i
  storeyNumber: string;                      // "Z" | "-1" | "1" | "CK_5"
  zBottom: Mm;                               // döşeme altı (mutlak)
  height: Mm;                                // döşeme altından bir üst kat döşeme altına
  slabThickness: Mm;                         // varsayılan 200
  outline: Poly2[];                          // KAT DIŞ SINIRI (kullanıcı çizer); birden fazla kütle olabilir
  usageManual?: number[];                    // storeyUsage elle eklenenler (örn. 1003)
  emitStoreyObject: boolean;                 // çatı katı istisnaları için false
}

interface IndependentSection {               // mülkiyet birimi (liste beyandan)
  id: Guid;
  number: string;                            // independentSectionNumber
  blockName: string;                         // aynen; yoksa "-1"
  entrance: string;                          // aynen; yoksa ""
  maksIdentityNumber: number | null;
  maksNumaratajIdentityNumber: number | null;
  registeredQuality: string;                 // TR büyük harf
  registeredInstallation: string;            // TR büyük harf, boş olabilir
  registeredFloorDefinition: string;         // aynen
  propertyLot: string;                       // "pay/payda"
  planNetArea: number | -1;
  planGrossArea: number | -1;
  geometrySuitability: 1001 | 1002;
  additionalNote: string;
}

interface SectionPart {                      // BB parçası (GenericCityObject)
  id: Guid;                                  // BB_ guid'i
  sectionId: Guid;
  storeyId: Guid;                            // geometrinin bulunduğu kat
  groupStoreyId: Guid;                       // hangi Kat'ın groupMember'ı (çoklu katta giriş katı)
  usage: 1001|1002|1003|1004|1005|1006;
  outline: Poly2;                            // BB DIŞ SINIRI (kat sınırı + BB ayırma çizgileri)
  cardinalDirections: number[];              // tekrarsız
  slabThicknessOverride?: Mm;
}

interface Part {                             // Kısım = bldg:Room
  id: Guid;                                  // BBK_ / OA_ guid'i
  kind: 'BBK' | 'OA';
  storeyId: Guid;
  sectionPartIds: Guid[];                    // BBK: ≥1; OA: []
  storeyRef: Guid | -1;                      // OA için storeyObjectReference
  usage: number;                             // BBK partUsage / OA commonAreaUsage
  polygon: Poly2;                            // NET kısım alanı (iç yüzler)
  planArea: number | -1;
  remote: boolean;                           // BB'sine fiziksel bağlı değil (uzak depo/otopark; H11a)
  additionalNote: string;
}

interface RoomInstallation {                 // BBKIY / OAIY
  id: Guid; partId: Guid; usage: 1001|1002|1003; polygon: Poly2;
}

interface Balcony {
  id: Guid;                                  // BLKN_ / TRS_
  kind: 'Balkon' | 'Teras';
  storeyId: Guid;
  sectionPartId: Guid | null;                // teras: null → "-1"
  outline: Ring2;                            // DIŞ sınır (bina kenarına snap)
  attachedEdges: [Pt2, Pt2][];               // bina ile ortak kenarlar (korkuluk YOK)
  parapetHeight: Mm;                         // varsayılan 1100
  parapetThickness: Mm;                      // varsayılan 100, ≥ 50
  planArea: number | -1;
}

interface Opening {
  id: Guid;                                  // KAPI_/PEN_ guid'leri türetilir (temsil başına ayrı)
  kind: 'door' | 'window';
  usage: number;                             // doorUsage / windowUsage
  storeyId: Guid;
  anchor: { a: Pt2; b: Pt2 };                // açıklığın plan genişliği, bir duvar yüzü üzerinde
  sill: Mm;                                  // kısım tabanından (oda Floor_) yükseklik
  height: Mm;
  spansStoreys?: Guid[];                     // sahanlık penceresi (S.S.S.30)
}

interface Roof {
  mode: 'parametric' | 'manual' | 'flat';
  eaveOverhang: Mm;                          // saçak
  params?: { type: 'gable'|'hip'|'shed'|'flat'; pitchDeg: number; ridgeDir?: number; ridgeHeight?: Mm };
  facets?: { outer: Pt3[]; holes: Pt3[][] }[];   // manual: düzlemsel 3B poligonlar
  thickness: Mm;                             // çatı gövdesi kalınlığı (saçak alın yüksekliği)
}

interface ProjectSettings {
  storeyGeometryStyle: 'A' | 'B';            // varsayılan 'B'
  emitSlabEdges: boolean;                    // varsayılan true
  coordinateDecimals: 3;
  usePosList: boolean;                       // varsayılan true
}
```

### 4.3 Türetilen (salt okunur) değerler

| Değer | Türetme |
|---|---|
| `constructionID` | `${parcel.takbisPropertyIdentityNumber}-${building.letter}` |
| Dosya adı | `M-${constructionID}.gml` |
| `storeysAboveGround` | `storeyNumber` ∈ {`Z`, pozitif, `CK_*`} ve `emitStoreyObject` olan kat sayısı |
| `storeysBelowGround` | negatif numaralı ve `emitStoreyObject` olan kat sayısı |
| Kat `independentSectionCount` | `sectionParts.filter(p => p.groupStoreyId === storey.id).length` |
| Kat `storeyUsage` | BB parçalarının usage'ından {1001 mesken, 1002 ticari} + nitelikli OA varsa 1003 + `usageManual` |
| `totalIndependentSectionCount` | benzersiz `IndependentSection.number` (sectionParts'ta kullanılan) |
| BB `partCount` | `parts.filter(p => p.sectionPartIds.includes(sp.id)).length` |
| Alan ve hacimler | Bölüm 5.12 |
| `roofProjectionArea` | Bölüm 5.12 |
| Envelope | Bölüm 5.11 |

---

## 5. Geometri Motoru (B-rep Üretimi)

### 5.1 Genel ilkeler

1. **Determinizm:** Aynı tasarım modelinden her zaman aynı B-rep çıkar (GUID'ler hariç). GUID'ler tasarım nesnesine bağlı kalıcı tohumlardan türetilir (ÖNERİ: `uuidv5(namespace=objectId, name=role+index)`). Böylece dosyalar arası fark (diff) anlamlı olur ve doğrulama hataları aynı ID'leri gösterir.
2. **Milimetre ızgarası:** Her üretilen köşe `Math.round` ile tamsayıya oturtulur.
3. **Kenar eşleştirme (T-kavşak):** Bir yüzeyin kenarı üzerine (1 mm toleransla) düşen ve **aynı kabuğa veya komşu kabuğa ait** her köşe, o kenara eklenir. Örnek [ÖLÇÜLDÜ]: Ornek6'da bir oda iç duvarı, komşu odaların bağlandığı noktalarda 6–12 poligona bölünmüş.
4. **Yönlendirme:** Her poligon, ait olduğu hacmin dışından bakıldığında CCW (normal hacim dışına). İç halkalar CW. Açıklık nesnesi halkası = delik halkasının aynı sıralı kopyası (K48).
5. **Düzlemsellik:** Dikey ve yatay yüzler zaten düzlemseldir. Eğik çatı yüzlerinde köşeler ızgaraya oturunca sapma 0.5 mm'yi aşabilir. Sapma > 1 mm ise yüz üçgenlere bölünür (her üçgen düzlemseldir). val3dity varsayılan düzlemsellik toleransı 1 cm'dir; 1 mm güvenli eşiktir (ÖNERİ).
6. **En küçük kenar:** Aynı halkada ardışık iki köşe arası < 10 mm olamaz (-204, -102). Üretim sonrası temizleme adımı bu köşeleri birleştirir ve **uyarı** verir.

### 5.2 Kot motoru

Her kat `s` için (alttan üste, `s0` en alt):

```
zFloorBottom(s) = s.zBottom                  // kullanıcı girer veya: zFloorBottom(s-1) + height(s-1)
zFloorTop(s)    = zFloorBottom(s) + slabThickness(s)
zCeiling(s)     = zFloorBottom(s) + height(s)    // = zFloorBottom(s+1)
roomHeight(s)   = zCeiling(s) − zFloorTop(s)     // ≥ 1500 kontrolü
```

[ÖLÇÜLDÜ Ornek6] Kat_Z: alt 1095.900, üst 1096.100 (döşeme 0.20), tavan 1098.700. Kat_1: alt 1098.700, üst 1098.900, tavan 1101.500 = RoofEdge.

**Mutlak kot:** `z = georef.zeroElevationOrthometric + projeKotu`. Projede ±0.00 genellikle zemin kat döşeme üstüdür. DOĞRULANMALI: projeden okunmalı; sihirbaz sorar: "±0.00 hangi yüzey?"

**Asma kat:** Ayrı Storey değildir. Alt katın `height` değeri asma katı kapsayacak kadar büyük tutulur. Asma kattaki BB parçasının `storeyId` = alt kat, `usage` = 1003. Asma kat tabanı kotu için `SectionPart.zFloorOverride` gerekir (ÖNERİ: modele eklenmeli).

### 5.3 Plan topolojisinin hazırlanması (her kat)

1. **Girdiler:** kat dış sınırı (`outline`), BB parçası sınırları, kısım (oda) poligonları, iç yapılar, balkonlar, açıklıklar.
2. **Doğrulamalar (çizim anında, 2B):**
   - Kısım ⊂ BB parçası (BBK için; uzak kısım hariç). Tolerans: kesişim alanı ≤ 0.1 m², boşluk ≤ 1 mm.
   - BB parçası ⊂ kat sınırı (1 mm).
   - BB parçaları ve OA bölgeleri birbiriyle kesişmez (alan ≤ 0.1 m²).
   - Kısımlar birbiriyle kesişmez (iç kısım hariç; iç kısım dış kısmın deliği olarak modellenir).
3. **Duvar malzemesi bölgesi (BB başına):** `W = BB.outline − ⋃ kısım.polygon` (Clipper2 `Difference`, tamsayı). `W` delikli çokgen kümesidir; BB'nin dış ve iç duvarlarını ve kısımlar arası bölme duvarlarını içerir.
4. **Kenar etiketleme:** `W`'nin her kenarı için:
   - Kat dış sınırı üzerindeyse `EXT` (dış cephe)
   - Başka bir BB'nin sınırı üzerindeyse `PARTY` (BB ayırma)
   - Bir OA sınırı üzerindeyse `TO_OA`
   - Bir kısım sınırı üzerindeyse `ROOM_FACE`

   Bu etiketler, açıklıkların hangi temsillere yazılacağını belirler.

### 5.4 Açıklık çözümleme (bir açıklık → n temsil)

Kullanıcı açıklığı **bir yüz üzerinde** iki nokta (a, b) ile çizer; yüz, kat dış sınırı veya bir kısım kenarı olabilir.

1. **Duvar dilimini bul:** `ab` doğrultusuna dik yönde, `ab`'nin iki tarafında karşı yüzü ara. Karşı yüz: başka bir kısım kenarı, kat sınırı ya da balkon sınırı; `ab`'ye paralel (açı < 0.5°), en fazla 1000 mm uzakta. Bulunan iki paralel çizgi arası **duvar dilimi**dir: genişlik `ab`, kalınlık `t`.
2. **Dilimin kesit dikdörtgeni** (planda) `R = [a, b, b + n·t, a + n·t]`. Bu dikdörtgen tamamen `W` (duvar malzemesi) içinde olmalı, değilse hata ("açıklık duvar dışına taşıyor").
3. **Z aralığı:**
   - Taban: `zFloorTop(s) + sill`.
   - Tepe: taban + height.
   - Kapı: `sill = 10` mm (v3.1; delik duvar alt kenarına değmemeli, K45a), height = projeden; yoksa 2100. `roomHeight < 2100` ise tepe = `zCeiling − 300`.
   - Pencere varsayılanları K46'ya göre, kısım kullanımına bakılarak (mesken/ticari/ıslak hacim).
   - Tepe ≤ `zCeiling − 1` mm olmalı (açıklık tavanı kesmemeli).
4. **Temsiller:**

| Temsil | Koşul | Üretilen |
|---|---|---|
| (T1) LoD2 dış duvar | `ab` veya karşı yüz `EXT` kenarındaysa | Dış yüz düzlemindeki dikdörtgen halka → ilgili LoD2 `Wall_` poligonunda delik + WallSurface `opening` nesnesi |
| (T2) Kat geometrisi | `EXT` ise | Kat dış duvar poligonunda delik (nesne yok) |
| (T3) BB küveti | açıklık o BB'nin `W`'si içindeyse | Dış yüzde delik, iç yüzde delik, 4 yan yüz (alt = denizlik/eşik, üst = lento, 2 söve), hepsi `Wall_` |
| (T4) Kısım | `ab` veya karşı yüz bir kısmın `ROOM_FACE`'iyse; **her iki taraftaki kısım için ayrı ayrı** | O kısmın InteriorWall (OA dış cephesinde Wall_) poligonunda delik + `opening` nesnesi (o kısmın yüz düzleminde) |
| (T5) OA dış duvarı | OA kalınlıklı dış duvarı ise | OA'nın Wall_ yüzlerinde T3 benzeri |

   [ÖLÇÜLDÜ Ornek6] Pencere: LoD2 dış yüzünde (x≈532568.58 hattı) ve oda iç yüzünde (x≈532568.43 hattı) ayrı ayrı. Z aralığı aynı (1097.000–1098.399).
5. **Usage atama (öneri, kullanıcı değiştirebilir):**

| Durum | Usage |
|---|---|
| EXT kapı, kısım OA ve bina girişi | 1001 |
| EXT kapı, kısım BB'ye ait, müstakil yapı ana girişi | 1001 |
| EXT kapı, balkon/bahçe/teras | 1002 |
| BB ↔ OA kapısı (apartman BB ana girişi) | 1003 |
| Aynı BB içi kısım ↔ kısım veya OA ↔ OA | 1004 |
| EXT pencere | 1001 Dış Pencere |
| İç pencere | 1002 İç Pencere |

6. **Sahanlık penceresi:** `spansStoreys` doluysa, her katta o katın Z aralığıyla kırpılmış temsiller üretilir.

### 5.5 Kısım (oda) kabuğu üretimi

Her `Part p` (kat s) için:
1. **Floor:** `p.polygon` @ `zFloorTop(s)`. Normal aşağı (kabuğun dışı). Delikler iç kısımlardır.
2. **Ceiling:** `p.polygon` @ `zCeiling(s)`. Normal yukarı. Çatı arası kesimi varsa 5.9'a bakılır.
3. **Duvarlar:** `p.polygon`'un her kenarı (dış halka ve delik halkaları) için dikey dörtgen `[zFloorTop, zCeiling]`.
   - Kenar, T-kavşak noktalarında bölünür: komşu kısımların, BB sınırının ve kat sınırının bu kenar üzerine düşen köşeleri.
   - Her parça ayrı `InteriorWall_` poligonu olur.
   - Aynı doğrusal kenarın parçaları **aynı InteriorWallSurface elemanında** toplanır ([ÖLÇÜLDÜ]: eleman sayısı ≈ kenar sayısı, poligon sayısı daha fazla).
4. **OA özel:** Kenar `EXT` ise OA'nın dış duvarı **kalınlıklı** olarak üretilir. OA bölgesi ile kat sınırı arasındaki duvar malzemesi `W_OA` için BB küvetindeki gibi dış yüz, iç yüz, üst kapak ve açıklık yan yüzleri üretilir. Hepsi `bldg:WallSurface` (`Wall_`) olarak OA odasının `boundedBy`'ına yazılır [ÖLÇÜLDÜ Ornek2]. İç yüz = OA'nın InteriorWall'ı değil, Wall_ olarak.
   - **KESİNLEŞTİ (v3.1):** OA'nın dış cephe kenarındaki iç yüz `Wall_` (WallSurface) olarak yazılır; OA'nın iç bölme kenarları `InteriorWall_` olur. [ÖLÇÜLDÜ] Ornek2 8/8, Ornek5 16/16, Ornek4 10/10, Amasya 2/2, Sincan 15/15 OA'da OA taban sınırı üzerinde `Wall_` dikey yüzleri ve dış yüzde ayrıca `Wall_` yüzleri var.
5. **Açıklıklar:** T4 temsilleri.
6. **Kontroller:** ≥3 duvar poligonu, 1 Floor elemanı, 1 Ceiling elemanı, kapalı kabuk (her kenar 2 poligonda, açıklık delikleri kapı/pencere poligonuyla kapanmış sayılır), yükseklik ≥ 1500.

### 5.6 BB parçası küveti üretimi

Her `SectionPart sp` (kat s):
1. **Döşeme kutusu:**
   - Alt: `sp.outline` @ `zFloorBottom` (normal aşağı).
   - Üst: `sp.outline` @ `zFloorTop` (normal yukarı).
   - Kenar yüzleri: `outline` kenarları × `[zFloorBottom, zFloorTop]` (normal dışa).
   - Hepsi `Floor_`.
   - [ÖLÇÜLDÜ] Ornek6'da üst yüz BB dış konturunun tamamı (9 nokta).
2. **Duvar prizması:** `W = sp.outline − ⋃ parts(sp)`. `W`'nin her bileşeni:
   - Yan yüzler: dış halka kenarları (`EXT`/`PARTY`/`TO_OA` → BB dış yüzü) ve delik halkası kenarları (`ROOM_FACE` → BB iç yüzü), hepsi `[zFloorTop, zCeiling]`, `Wall_`.
   - Üst kapak: `W` @ `zCeiling`, normal yukarı, delikli olabilir (Ornek6'da "Wall H@1098.7 holes" = 1 poligon), `Wall_`.
   - Alt yüz **üretilmez**; döşeme üst yüzü ile çakışır. [ÖLÇÜLDÜ] Ornek6 BB'de zFloorTop'ta ek Wall_ yok; yalnız Floor_.
3. **Açıklıklar:** Her açıklık dikdörtgeni `R × [zb, zt]` için:
   - Duvarın iki yüzünde dikdörtgen delik (halka id `DoorLinearRing_`/`WindowLinearRing_`).
   - 4 yan yüz: alt `R@zb` (normal yukarı; malzeme dışına bakar), üst `R@zt` (normal aşağı), iki söve (`R`'nin kalınlık yönündeki kenarları × [zb, zt]).
   - [ÖLÇÜLDÜ] Ornek6 BB'de 74 yukarı + 74 aşağı yatay Wall_ var (yaklaşık 37 açıklık × 2).
   - **KESİNLEŞTİ (v3.1):** Kapı deliğinin alt kenarı `zFloorTop + 10 mm`'dir; kapı altında 1 cm'lik bir duvar şeridi kalır ve eşik yüzü (`Wall_`, yatay, `zFloorTop + 10 mm`) normal bir alt yan yüz olarak üretilir. [ÖLÇÜLDÜ] Ornek6 ve Ornek4'te BB kapı deliklerinin tamamı döşeme üstünden 0.010 m yukarıda (36+115), dış duvardakiler ise duvar poligonu daha aşağıdan başladığı için daha yukarıda; incelenen 6 dosyada hiçbir delik poligon sınırına değmiyor. Önceki sürümdeki "eşik yüzü üretilmez, delik döşemeye iner" önerisi **yanlıştı ve kaldırıldı**: delik dış halkaya değerse poligon geçersiz olur.
4. **Kontroller:**
   - ≥3 `Wall_`, ≥1 `Floor_`.
   - Taban kalınlığı > 0 (çatı katında kontrol yok, [SÜRÜM] v2.30).
   - Her pencerenin BB'de deliği var.
   - BB ⊂ Kat.
   - `independentSectionCalculatedArea` = alt Floor_ alanı.

### 5.7 Kat kabuğu (Biçim B)

- Döşeme kutusu: `outline` @ `zFloorBottom`/`zFloorTop` + kenarlar (`Floor_`).
- Dış duvarlar: `outline` kenarları × `[zFloorTop, zCeiling]` (`Wall_`), T1 ile aynı EXT açıklık delikleri.
- Tavan yok.
- Bir kattaki birden fazla kütle (`outline: Poly2[]`) için hepsi aynı MultiSurface'e yazılır.

### 5.8 Balkon / Teras

1. **Taban kutusu:** `outline` @ `zFloorBottom(s)` ve `zFloorBottom(s) + slabThickness(BB)`. Taban kotu BB'nin döşeme kotuyla aynıdır [ÖLÇÜLDÜ Ornek6: balkon 1095.9–1096.1 = BB döşemesi]. Kenar yüzleriyle birlikte tek FloorSurface elemanında, hepsi `Floor_`.
2. **Korkuluk:** `outline`'ın `attachedEdges` dışındaki kenarları boyunca içe `parapetThickness` kadar ofsetli şerit `P = outline − offset(outline, −t)`. Bina kenarlarında şerit kesilir. `P` × `[tabanÜstü, tabanÜstü + parapetHeight]`: yan yüzler + üst kapak, hepsi `Wall_`. Her poligon ayrı WallSurface elemanı.
   - [ÖLÇÜLDÜ Ornek6] Üst kapak poligonu yatay "U" şeklinde, 9 noktalı.
3. **Bina ile ortak kenar:** Korkuluk ve duvar üretilmez ([REHBER]).
4. **Kontroller:**
   - Balkon taban kalınlığı = BB taban kalınlığı ve ≥ 100.
   - Korkuluk ≥ 50.
   - Balkon BB'ye değiyor (≤ 1 mm boşluk).
   - Korkuluk tepesi ≤ BB duvar tepesi ("Balkon duvarı, BB duvarından daha uzun olamaz").
   - Çıkma balkon LoD0'a girmez.
5. **calculatedArea** = taban üst yüz alanı (K39).

### 5.9 Çatı gövdesi ve çatı arası kesimi

**Çatı gövdesi modeli** [ÖLÇÜLDÜ Ornek6, 66 Roof_ poligonu: 1 aşağı bakan yatay, 15 yukarı/eğik, 50 dikey]:
- Çatı, RoofEdge kotuna oturan **kapalı bir gövdedir**.
- **Alt yüz:** RoofEdge kotunda, saçak dahil çatı izdüşümü, normal aşağı.
- **Üst yüzler:** eğimli veya düz çatı düzlemleri.
- **Yan yüzler:** saçak alnı (kalınlık) ve beşik çatıda kalkan üçgenleri (dikey).
- Hepsi tek `RoofSurface` elemanında `Roof_` poligonları olarak yazılır.

**Parametrik üretim:**
1. Taban konturu = RoofEdge konturunun `eaveOverhang` kadar dışa ofseti (Clipper2 `InflatePaths`, `JoinType.Miter`).
2. Düz çatı: üst yüz = taban konturu @ (RoofEdge z + thickness). Yan yüzler = kontur × thickness.
3. Beşik/kırma: **straight skeleton** (ÖNERİ: `straight-skeleton` WASM veya CGAL port). Her çatı yüzü, iskelet bölgesinin taban kenarından eğim açısıyla yükseltilmesidir. Beşikte uç bölgeler dikey kalkan yüzlerine dönüşür.
4. Çok karmaşık planlarda kullanıcı "elle çatı" moduna geçer ve 3B düzlemsel yüzleri doğrudan çizer.

**Çatı arası kesimi** (çatı katında BB veya OA varsa):
1. Çatı iç hacmi `Vroof` = (RoofEdge düzlemi üstü) ∩ (çatı üst yüzlerinin altı), `manifold-3d` ile.
2. Çatı katındaki her kısım prizması, BB duvar prizması ve kat duvarları `∩ Vroof` ile kesilir. Kat dış duvarları ve dış cephe LoD2 duvarları da RoofEdge üstünde kalan kısımda çatı yüzüne kadar uzar.
3. Kesim sonucu üçgen ağdır. **Düzlem birleştirme** adımı:
   - Üçgenleri düzleme göre grupla (normal açısı < 0.01°, ofset farkı < 0.5 mm).
   - Her grubu kendi düzlem koordinatına izdüşür.
   - Clipper2 Union ile delikli poligonlara çevir.
   - 3B'ye geri taşı ve ızgaraya oturt.
4. **Sınıflandırma:**
   - Yatay ve aşağıya bakan, `zFloorTop` kotundaki yüz → Floor.
   - Dikey yüz → InteriorWall/Wall.
   - Diğer tüm üst yüzler (eğik dahil) → Ceiling (oda) veya Wall_ (BB küveti üst kapağı).
5. [ÖLÇÜLDÜ Ornek2] Çatı arası odalarında tek CeilingSurface elemanı ve 4–31 poligon var.
6. **Kontroller:** her odada ≥3 duvar ("fazla trimleme" hatası), en yüksek nokta ≥ 1.5 m.

### 5.10 LoD2 bina kabuğu

- **Dış duvarlar:** Her kat için kat `outline` kenarları × `[zFloorBottom(s), zCeiling(s)]`.
  - Alt kattan üst kata geçişte kontur farklıysa, kenar parçaları her katta ayrı WallSurface olur.
  - [ÖLÇÜLDÜ Ornek6] LoD2 duvarı 1095.9 → 1098.7, yani kat altından kat tepesine. Kat kabuğu ise Biçim B'de döşeme üstünden başlar; ikisi farklı nesneler oldukları için çelişmez.
  - EXT açıklık delikleri ve nesneleri (T1) eklenir.
- **GroundSurface:** En alt katın `outline`'ı @ `zFloorBottom(s0)` (birleşik tek poligon). Birden fazla kütle varsa her biri bir poligon, eleman yine 1.
- **OuterFloorSurface:** Ardışık katlar (alt L, üst U) için `L.outline − U.outline` bölgesi @ `zCeiling(L)`, normal yukarı.
  - Bu bölge en üst katın çatısıyla örtülüyorsa üretilmez.
  - Balkon veya teras tabanıyla çakışıyorsa yine üretilir (bina yüzeyi).
- **OuterCeilingSurface:** `U.outline − L.outline` bölgesi @ `zFloorBottom(U)`, normal aşağı (çıkma altı).
- **RoofSurface:** 5.9.
- **`lod2MultiSurface`:** yukarıdaki tüm poligonlara xlink. Balkon poligonları dahil **değildir**.

### 5.11 LoD0, LoD1, TIC, Envelope

- **TIC:** `building.tic` noktaları (aplikasyon 3B köşeleri) + kapanış noktası. `zTIC = max(tic.z)`.
- **FootPrint:** `zTIC`'e en yakın `zFloorBottom`'a sahip katın `outline`'ı (balkonlar hariç; çok kütleli ise her kütle bir poligon) @ `zTIC`. Normal yukarı.
  - [ÖLÇÜLDÜ] Ölçülen 5 örneğin 5'inde (Ornek1, 2, 4, 5, 6) FootPrint z = TIC max.
  - [KILAVUZ] "kat zemini z yönünde TIC'in en üst noktasına indirilmeli". Yani yalnız LoD0/LoD1 değil, DOĞRULANMALI: o katın geometrisi de mi? Ornek2'de Kat Z tabanı 949.85, FootPrint 950.66; kat geometrisi indirilmemiş. Sadece LoD0/LoD1 yeterli görünüyor.
- **RoofEdge:** En üst katın (`emitStoreyObject` olsun olmasın, BB içeren en üst kat) `outline`'ı @ `zCeiling(top)`. Birden fazla kütle → çoklu poligon. Saçak yok.
- **LoD1 yer üstü:** `A = area(FootPrint) ≥ area(RoofEdge) ? FootPrint : RoofEdge` konturu, `[zTIC, zRoofEdge]` prizması. Taban 1 poligon, tavan 1 poligon, kenar başına 1 yan yüz. Normaller dışa.
- **LoD1 yer altı:** Yalnız `zFloorBottom(s0) < zTIC` ise. Kontur = `area(FootPrint) ≥ area(Ground) ? FootPrint : Ground`. Prizma `[zFloorBottom(s0), zTIC]`. Yer üstüyle ortak yüzde değmeli, kesişmemeli.
- **Envelope:** Tüm üretilen 3B noktalar (TIC dahil, balkonlar ve çatı saçağı dahil) üzerinden min/max.

### 5.12 Alan, hacim ve sayım hesapları (normatif)

| Değer | Formül | Yuvarlama |
|---|---|---|
| Kısım `calculatedArea` | `area(p.polygon)` (dış − delikler), mm² → m² | 2 hane |
| Kısım `volume` | Kesimsiz: `area × (zCeiling − zFloorTop)`. Kesimli: kapalı kabuk hacmi (diverjans teoremi: `V = Σ (p0 · nArea)/3`, tüm yüzler dışa yönlü, açıklıklar kapalı sayılır) | 2 hane |
| BB `independentSectionCalculatedArea` | `area(sp.outline)` (delik yok varsayımı, bkz. H7) | 2 hane |
| Balkon `calculatedArea` | `area(outline)` (taban üst yüzü) | 2 hane |
| OA `calculatedArea` | `area(p.polygon)` | 2 hane |
| `roofProjectionArea` | `area(⋃ proj_xy(Roof_ yüzleri))` = saçak dahil çatı taban konturu alanı | 2 hane |
| Plan ↔ hesap sapması | `|calc − plan| / plan` > 0.10 ise: BB'de 1002 + not önerisi; BBK'da yalnız uyarı (BBK 1001 kilitli) | — |

**Alan hesabı:** Tamsayı mm koordinatlarla shoelace formülü `BigInt` veya `number` ile yapılır (2^53 sınırı: 10 km × 10 km = 10^14 mm² < 9·10^15 güvenli). Sonuç `/1e6` → m². Yuvarlama "half away from zero" ile 2 haneye. Doğrulayıcıyla uyum için ±0.01 farkı kabul edilir.

---

## 6. Doğrulama Kural Kataloğu

### 6.1 Açıklama

**Kapsam:**
- **Y** = yerelde kesin kontrol edilebilir.
- **K** = kısmi (kullanıcı ek veri, örn. parsel sınırı verirse).
- **T** = yalnız TKGM sunucusunda (MEGSİS, TAKBİS, MAKS, BuildingService).

**Düzey:** **H** = hata, **U** = uyarı, **B** = bilgi.

**Mesaj:** TKGM doğrulayıcısının mesajı ([HATA-TABLOSU]'ndan **birebir**). Kullanıcı aynı mesajı 3dbinadogrula'da görünce eşleştirebilsin diye uygulama da aynı metni göstermelidir. Yanında "Çözüm Önerisi" ve uygulamanın kendi açıklaması verilmelidir.

**Uygulama biçimi:** Her kural bir fonksiyondur: `(gmlDom | brep, project) → Finding[]`. `Finding = { ruleId, severity, scope, message, objectIds[], location?: Pt3 }`. Hata listesinde bir satıra tıklanınca ilgili nesne 2B ve 3B'de seçilir ve kırmızı vurgulanır.

**İki aşamalı çalışma:**
- (1) **Tasarım doğrulaması:** çizim sırasında canlı, 2B.
- (2) **Dosya doğrulaması:** üretilen GML'in kendisi üzerinde. Bu aşama, uygulama dışından gelen GML'leri de denetleyebilmek için GML DOM'u üzerinde çalışır ve tasarım modelini kullanmaz.

### 6.2 Dosya ve şema

| ID | Kontrol | Kapsam | Düzey | TKGM mesajı / kaynak |
|---|---|---|---|---|
| V-001 | Dosya adı `M-` ile başlıyor ve `.gml` ile bitiyor | Y | H | KURAL-2021 "M- ile başlamalıdır" |
| V-002 | Dosya adındaki YapıID = constructionID | Y | H | "Dosya adı ile yapıID uyuşmuyor." |
| V-003 | UTF-8, iyi biçimli XML | Y | H | "Geçersiz gml dosyası.-901" |
| V-004 | GML ad alanı 3.1.1 (`http://www.opengis.net/gml`) | Y | H | "Gml dosyası versiyonu desteklenmiyor.(v3 desteklenmez.)-904" |
| V-005 | CityGML 2.0 XSD şema doğrulaması (yerel XSD kopyalarıyla, ağ erişimi olmadan) | Y | H | "-- Şematik kontrolde hatalar var." |
| V-006 | Boş geometri yok (boş posList, boş MultiSurface) | Y | H | "Gml dosyası boş geometriler bulunduramaz.-902", "MultiSurface içerisinde surfaceMember bulunamadı." |
| V-007 | Texture/Appearance yok (varsa PNG, ParameterizedTexture, tek dosya ve adı GML ile aynı) | Y | U | texture mesajları |
| V-008 | Tek `core:CityModel` | Y | H | KURAL-2021 |

### 6.3 CityModel ve Envelope

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-010 | Tam 1 `bldg:Building` | Y | H | "Sadece bir bina olmalıdır." |
| V-011 | ≥ 4 `cityObjectMember` | Y | H | "En az 4 tane cityObjectMember olmalıdır." |
| V-012 | ≥ 1 Kat, ≥ 1 BB | Y | H | "En az 1 tane kat olmalıdır.", "En az 1 tane bağımsız bölüm olmalıdır." |
| V-013 | Tam 1 MBG | Y | H | KURAL-2021 |
| V-014 | Tek Envelope; `srsName` var ve `EPSG:5253`…`5259` | Y | H | "SrsName geçersiz.", "EPSG kodu yanlış." |
| V-015 | `srsDimension="3"` | Y | H | "Dış çerçeve geçersiz. SrsDimension özelliği bulunamadı.", "SrsDimension değeri yanlış.(Beklenen : 3)" |
| V-016 | lower < upper (her eksen) | Y | H | "Dış çerçeve geçersiz. Alt köşe koordinatları, üst köşe koordinatlarından daha büyük." |
| V-017 | Z farkı < 900 m; XY farkı < 1000 m; alan > 0 | Y | H | "Köşeler arası yükseklik farkı", "Köşeler arası mesafe çok fazla.", "Dış çerçeve alanı çok düşük." |
| V-018 | Tüm geometri ve TIC Envelope içinde | Y | H | "Yüzey elemanı, tanımlanan dış çerçevenin(envelope) içinde değil.", "Terrain kesişim eğrisi, … içinde değil." |
| V-019 | EPSG dilimi ile easting tutarlı: `|E − 500000| ≤ 200000`; dilim DOM ile parsel boylamı eşleşmeli | K | H | "EPSG kodu, arayüzden girilen EPSG kodları ile uyuşmuyor." |
| V-020 | Koordinat aralığı 300000 < E < 700000, 2500000 < N < 5000000 | Y | H | "Geometrinin ({...}) koordinat (TM) değerleri geçersiz." |
| V-021 | Envelope dışında hiçbir elemanda `srsName` yok | Y | H | "Poligonlar SrsName değerine sahip olmamalıdır.", "MultiSurfacelar SrsName değerine sahip olmamalıdır." |

### 6.4 Koordinat ve halka geometrisi (tüm poligonlar)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-030 | Her koordinat tam 3 ondalık | Y | H | "Koordinatlar noktadan sonra 3 basamağa sahip olmalıdır.(Örnek : 123.456)" |
| V-031 | Halka ≥ 3 eşsiz nokta (+ kapanış = ≥ 4 pos) | Y | H | "-101", "{...} linearRing 3ten daha az noktaya sahip." |
| V-032 | Ardışık eşit nokta yok | Y | H | "-102" |
| V-033 | Halka kapalı (ilk = son) | Y | H | "-103" |
| V-034 | Halka kendini kesmez | Y | H | "-104" |
| V-035 | Poligon halkaları birbirini kesmez | Y | H | "-201", "Interior LinearRingler kesişiyor." |
| V-036 | Özdeş halka yok | Y | H | "-202" |
| V-037 | Düzlemsellik (sapma ≤ 1 mm önerilir; val3dity 1 cm) | Y | H | "-203", "{...} linearRing planar değil." |
| V-038 | Köşe aralığı ≥ 10 mm | Y | U | "-204" |
| V-039 | İç halka dış halkayı bölmez; içinde kalır; iç halkalar iç içe değil | Y | H | "-205", "-206", "-207" |
| V-040 | İç halka yönü dış halkaya ters | Y | H | "-208" |
| V-041 | Aynı yüzeye ait poligonlar kesişmez | Y | H | "Aynı yüzeye ait poligonlar kesişmemelidir." |

### 6.5 ID, ad ve sınıf

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-050 | gml:id tekil | Y | H | "{...} değeri birden fazla bulundu." |
| V-051 | GUID biçimi (`[0-9a-f]{8}-[0-9a-f]{4}-…`), süslüsüz | Y | H | KURAL-2021 |
| V-052 | Nesne önekleri (MB_, K_, BB_, BBK_, OA_, BBKIY_, OAIY_, BLKN_, TRS_, MBG_, KAPI_, PEN_) | Y | H | "ID, {...} değeri ile başlamalıdır.", "Bina IDsi geçersiz." |
| V-053 | Poligon önekleri yüzey türüne uygun (WallSurface/InteriorWall → `Wall`/`InteriorWall`, Roof → `Roof`, Ceiling → `Ceil`, Floor → `Floor`, Ground → `Ground`) | Y | H | "… ID atama hatası (… ile başlaması gerekiyor)", "Poligon ID önek hatası." |
| V-054 | Her Polygon ve LinearRing'de id var | Y | H | "ID bulunmayan poligon tespit edilmiştir.", "LinearRing ID LinearRing_ ile başlamalıdır." |
| V-055 | Açıklık halkaları `DoorLinearRing_` / `WindowLinearRing_` | Y | H | "LinearRingin IDsi, WindowLinearRing_ ile başlamalıdır." (Door için de) |
| V-056 | İzin verilmeyen elemanlarda id yok (K13) | Y | H | "{...} geometri elementinin IDsi olmamalıdır." |
| V-057 | Sınıf değerleri (MimariBina, Kat, BagimsizBolum, BagimsizBolumKisim, OrtakAlan, BagimsizBolumKisimIcYapi, OrtakAlanIcYapi, Balkon, Teras, MimariBinaGrup) | Y | H | "Sınıf değeri geçersiz. (Beklenen: … Girilen: …)" |
| V-058 | Nesne adları 3.12'ye uygun | Y | H | "Name değeri yanlış.", "İsimlendirme hatası." |
| V-059 | Yüzey adları (Duvar, Çatı, Zemin, Taban, Tavan, İçDuvar, DışTaban, DışTavan) | Y | H | "Yüzey (surface) name değeri hatalı." |
| V-060 | Listede olmayan generic öznitelik yok | Y | H | "{...} özelliği proje kapsamında bulunması gereken özelliklerden değil." |
| V-061 | Her zorunlu öznitelik tam 1 kez (cardinalDirection ve storeyUsage hariç) | Y | H | "{...} bulunamadı.", "{...} birden fazla bulundu. Sadece bir adet olmalıdır." |
| V-062 | Öznitelik tipi doğru (string/int/double/date) | Y | H | "{...} geçerli bir değer değil." |
| V-063 | Kod listesi değerleri listede | Y | H | "{...} değeri kodlistesinin içinde bulunamadı.(Değer: …)" |
| V-064 | Büyük harf gerektiren alanlar TR büyük harf | Y | U (DOĞRULANMALI) | "{...} değeri büyük harfle yazılmalıdır." |

### 6.6 Mimari Bina öznitelikleri

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-070 | constructionID = `takbisPropertyIdentityNumber-HARF(LER)` | Y | H | "TakbisPropertyIdentityNumber ile yapıID uyuşmuyor." |
| V-071 | YapıID harfle bitiyor (Ana Yapı); `buildingType` = 1001 | Y | H | "MimariBina bina tipine 1002 (Diğer Yapı) atanamaz." |
| V-072 | `geometrySuitability` = 1006 | Y | H | "Sürdürülebilirlik kapsamındaki üretimlerde Bina geometrik uygunluğu 1006 olarak girilmelidir." |
| V-073 | `tenderRegistrationNumber` boş | Y | H | "…İhaleKayıtNo boş bırakılmalı." |
| V-074 | `architecturalPlanID` boş | Y | H | "…Mimari plan id boş bırakılmalıdır." |
| V-075 | `maksIntegrationState` = 1003 | Y | H | REHBER |
| V-076 | `totalIndependentSectionCount` = benzersiz BB no sayısı | Y | H | "Toplam bağımsız bölüm sayısı gmldeki ile uyuşmuyor." |
| V-077 | storeysAbove + storeysBelow > 0 ve = Kat nesnesi sayısı | Y | H | "StoreysAboveGround ve StoreysBellowGround toplamı sıfır olamaz.", "Toplam kat adedi ile gml dosyasındaki kat adedi uyuşmuyor." |
| V-078 | `roofProjectionArea` > 0 | Y | H | KURAL-2021 |
| V-079 | `roofProjectionArea` ≈ çatı izdüşümü (bilgi: RoofEdge alanı ile farkı) | Y | U | "RoofProjectionArea değeri ile RoofEdge elemanından hesaplanan uymuyor." (bkz. Ç12) |
| V-080 | 0 < `buildingHeight` < 950 | Y | H | KURAL-2021 |
| V-081 | Onay tarihi `YYYY-MM-DD`, ayırıcı `-` | Y | H | "…tarih formatı geçersiz.", "…değerinde ayırıcı tespit edilemedi." |
| V-082 | `elevatorCount` ≥ 0 | Y | H | — |
| V-083 | Ada/parsel/taşınmaz MEGSİS ve TAKBİS ile eşleşiyor | T | H | "Parsel no (…) veritabanı ile uyuşmuyor.", "Binanın çakıştığı parselin ada no bilgisi…", "Parsel servisi null döndü." |
| V-084 | Aynı konumda kayıtlı başka bina yok | T | H | "Bu pozisyonda BuildingServiste zaten bir bina var." |
| V-085 | MAKS yapı no doğru | T | H | "Gmldeki {...} değeri ile Makstaki {...} değeri eşit olmalıdır." |

### 6.7 LoD0, LoD1, LoD2, TIC

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-090 | TIC var; MultiCurve/curveMember/LineString | Y | H | "Lod2TerrainIntersection özelliğinin içinde, MultiCurve elemanı bulunamadı." |
| V-091 | TIC kapalı | Y | H | KURAL-2021 |
| V-092 | FootPrint ve RoofEdge var; önekler doğru | Y | H | — |
| V-093 | FootPrint z = max(TIC z) (±1 mm) | Y | H | "TIC'in en üst noktası ile footprintin yüksekliği eşit olmalıdır." |
| V-094 | FootPrint, TIC'in altında kalmıyor | Y | H | "FootPrint, TIC eğrisinin altında kalmamalıdır." |
| V-095 | FootPrint, TIC en üstüne en yakın katın tabanı | Y | U | "TIC'in en üst noktasına en yakın olan katın tabanı FootPrint olarak atanmış olmalıdır." |
| V-096 | RoofEdge tek kotta, = en üst kat tavanı (±1 mm), = çatının en alçak noktası | Y | H | "RoofEdge en üst katın tavanına eşit olmalıdır.", "RoofEdge çatının en alt noktasıyla aynı hizada olmalıdır." |
| V-097 | FootPrint ve RoofEdge planda örtüşüyor (aynı kontur, farklı kot; kademeli yapıda uyarı) | Y | U | "FootPrint ve RoofEdge üst üste oturmalıdır." |
| V-098 | LoD1: CompositeSolid → solidMember → Solid → exterior → CompositeSurface → surfaceMember → Polygon (satır içi, xlink yok) | Y | H | "Lod1Solid elemanı içerisinde CompositeSolid bulunamadı." ve benzeri 6 mesaj, "…inline tanımlanmalıdır." |
| V-099 | LoD1 yer üstü tavanı = RoofEdge z | Y | H | "RoofEdge ile zemin üstü Lod1Solidin tavanı aynı yükseklikte olmalıdır." |
| V-100 | LoD1 solid'ler değiyor, kesişmiyor, tekrar yok | Y | H | "-501", "-502", "-503" |
| V-101 | LoD1 kabuk geçerli (kapalı, manifold, dışa yönlü) | Y | H | "-301 … -307", "-401 … -405" |
| V-102 | LoD1 taban ve tavan poligon sayısı ≤ sınır (ÖNERİ: 1) | Y | U | "Lod1Solid elemetinin tabanında en fazla {...} tane poligon olabilir." |
| V-103 | LoD2: boundedBy yalnız izin verilen yüzey türleri (Wall, Roof, Ground, OuterFloor, OuterCeiling) | Y | H | "BoundedBy elemanı yüzey, duvar ve çatı yüzeylerini barındırmalı.", "Geçersiz yüzey tipi." |
| V-104 | Tam 1 RoofSurface elemanı | Y | H | "Çatı yüzeyi sadece 1 tane olmalıdır.", "Çatı sayısı 2den fazla." |
| V-105 | Tam 1 GroundSurface elemanı | Y | H | "Zemin(ground) yüzeyi 1 tane olmalıdır." |
| V-106 | ≥ 3 WallSurface | Y | H | "Yan duvar (WallSurface) sayısı 3ten az olamaz." |
| V-107 | `lod2MultiSurface` xlink'leri boundedBy'daki poligonları gösteriyor; boundedBy'daki her LoD2 poligonu referanslı | Y | H | "Referanslanan geometri elemanı ({...}) BoundedBy içerisinde bulunamadı.", "BoundedBy içerisinde {...} idli poligon bulunamadı." |
| V-108 | Çatı binayı tamamen örtüyor: RoofEdge ⊂ proj(Roof) | Y | H | REHBER |

### 6.8 Kat

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-110 | `grp:geometry/MultiSurface` var | Y | H | "MultiSurface elemanı, Geometry içerisinde bulunamadı." |
| V-111 | ≥ 3 Wall_, ≥ 1 Floor_ | Y | H | "Kat geometrisinde en az 3 tane idsi "Wall_" ile başlayan poligon olmalıdır." (Floor için de) |
| V-112 | parent = MB id | Y | H | "Katın parent değeri binanın IDsine eşit olmalıdır." |
| V-113 | groupMember'lar var ve BB_ | Y | H | "Referanslanan grup üyesi (groupMember) gml dosyası içinde bulunamadı." |
| V-114 | `independentSectionCount` = groupMember sayısı | Y | H | "Kat bilgisinde verilen BB sayısı ile gmldeki BB sayısı uyuşmuyor.", "GroupMember sayısı ile bağımsız bölüm sayısı eşit olmalıdır." |
| V-115 | `storeyNumber` var, ad = `Kat_`+no | Y | H | — |
| V-116 | `storeyUsage` ≥ 1, kod listesinde | Y | H | — |
| V-117 | Her dış açıklık için kat duvarında delik | Y | H | "Kat geometrisinde pencereye uygun delik bulunamadı." |
| V-118 | MAKS kat no | T | U | SÜRÜM v2.49 |

### 6.9 Bağımsız Bölüm

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-120 | `gen:lod2Geometry/MultiSurface` var | Y | H | "MultiSurface elemanı, Lod2Geometry altında bulunamadı." |
| V-121 | ≥ 3 Wall_, ≥ 1 Floor_ | Y | H | "Bağımsız Bölüm geometrisinde en az 3 tane idsi "Wall_" ile başlayan poligon olmalıdır." |
| V-122 | Duvar üst kapağı var (çatı katı kesimlilerde gevşek) | Y | H | "Bağımsız bölüm duvarlarının üstü kapalı olmalıdır." |
| V-123 | Taban kalınlığı ≥ sınır (çatı katı hariç) | Y | H | "Bağımsız bölüm taban kalınlığı en az {...} m olmalıdır." |
| V-124 | Yan duvarlar taban üstünden başlıyor | Y | H | "Yan duvarlar, tabanın üstünden başlamalıdır." |
| V-125 | BB ⊂ Kat (1 mm) | Y | H | "Bağımsız bölüm, kat geometrisinin içinde kalmalıdır." |
| V-126 | `independentSectionCalculatedArea` = alt taban alanı (±0.01) | Y | H | "Bağımsız bölüm çizim alan, bağımsız bölüm geometrisinin taban alanına eşit değildir." |
| V-127 | BB alanı ≥ Σ kısım alanı | Y | H | "Bağımsız Bölüm Çizim Alanı, kısım çizim alanlarının toplamından büyük olmalıdır." |
| V-128 | `partCount` = bağlı BBK sayısı | Y | H | "Bağımsız bölüm kısım sayısı hatalı." |
| V-129 | `geometrySuitability` ∈ {1001, 1002}; 1001 ise tek değer | Y | H | "…bağımsız bölüm geometrik uygunluk 1001 veya 1002 olmalıdır.", "GeometriUygunluğu 1001 girildi ise başka değer girilemez." |
| V-130 | `integrationState` = 1004 | Y | H | "…entegrasyon durumu 1004 olmalıdır." |
| V-131 | `integrationState` ≠ 1001 ise `takbisPropertyIdentityNumber` = -1 | Y | H | "IntegrationState 1001 değil ise, takbisPropertyIdentityNumber -1 değerini almalıdır." |
| V-132 | `blockName` boş değil | Y | H | KILAVUZ md.8 |
| V-133 | `propertyLot` `pay/payda`, pay ≤ payda, tek, boş değil | Y | H | KILAVUZ md.9 |
| V-134 | `registered*` tek ve string | Y | H | KILAVUZ md.10–12 |
| V-135 | `cardinalDirection` tekrarsız | Y | H | "CardinalDirection aynı değerden birden fazla içeremez." |
| V-136 | Net plan alanı < brüt plan alanı (ikisi de > 0 ise) | Y | U | KURAL-2021 "Bağımsız Bölüm Brüt Alandan küçük olmalıdır" |
| V-137 | Her BB'de ≥ 1 pencere (BB'nin herhangi bir kısmında) | Y | H | "Bağımsız bölümde pencere bulunamadı." |
| V-138 | BB'de doorUsage = 1003 kapı (apartman) | Y | H/U | "Bağımsız bölümde, kapı kullanım amacı 1003 olan bir kapı elementi bulunamadı." |
| V-139 | Her pencere için BB geometrisinde delik | Y | H | "Bağımsız bölüm geometrisinde pencereye uygun delik bulunamadı." |
| V-140 | Kısımda 1002 varsa BB'de 1002 | Y | H | "Kısımda olan geometri uyumsuzluk kodu bagimsiz bolumde bulunamadı." |
| V-141 | MAKS BB no, numarataj no, TAKBİS eşleşmesi | T | H | MAKS ve TAKBİS mesajları |

### 6.10 Kısım (BBK) ve Ortak Alan (OA)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-150 | `lod4MultiSurface` var, xlink'ler boundedBy'da | Y | H | "{...} içerisinde Lod4MultiSurface elemanı bulunamadı." |
| V-151 | boundedBy yalnız FloorSurface, InteriorWallSurface, CeilingSurface (OA'da + WallSurface) | Y | H | KURAL-2021 |
| V-152 | Tam 1 FloorSurface elemanı, tam 1 CeilingSurface elemanı | Y | H | "Taban yüzeyi (FloorSurface) sayısı 1den fazla olamaz.", "Tavan yüzeyi … 1den fazla olamaz." |
| V-153 | ≥ 3 InteriorWallSurface (OA: InteriorWall + Wall ≥ 3) | Y | H | "Yan duvar (InteriorWallSurface) sayısı 3ten az olamaz." |
| V-154 | Taban, duvar ve tavan mevcut | Y | H | "Kısım taban,duvar ve tavan yüzeylerine sahip olmalıdır.", "Ortak alan taban,yan duvar ve tavana sahip olmalıdır." |
| V-155 | `calculatedArea` > 0 ve = taban alanı (±0.01) | Y | H | "CalculatedArea 0dan büyük olmalıdır.", "Verilen calculatedArea ({...}) ile geometriden hesaplanan değer ({...}) uymamaktadır." |
| V-156 | `planArea` > 0 veya -1 | Y | H | "PlanArea 0dan büyük olmalıdır." |
| V-157 | |calc − plan| / plan ≤ 10% | Y | U | "Hesaplanan alan ile plandan gelen alan eşit değil. (Tolerans %10)" |
| V-158 | `volume` = geometrik hacim; `volume` > `calculatedArea` | Y | H/U | "Girilen hacim (Volume), geometriden hesaplanan ile eşit değil.", "Hacim değeri hesaplanan alandan büyük olmalıdır." |
| V-159 | Oda yüksekliği ≥ 1.5 m | Y | H | "Oda yüksekliği 1.5 metreden az olamaz." |
| V-160 | `independentSectionObjectReference` geçerli BB_ | Y | H | "Referansı verilen bağımsız bölüm bulunamadı." |
| V-161 | OA `storeyObjectReference` geçerli K_ veya -1 | Y | H | "Referanslanan kat nesnesi bulunamadı." |
| V-162 | Oda BB'ye değiyor, boşluk ≤ 1 mm, kesişim ≤ 0.1 m² (kesimli çatı katında gevşek) | Y | H | "Oda, bağımsız bölüme değmelidir…" (2 mesaj) |
| V-163 | Her kısımda ≥ 1 kapı | Y | H | "Kısımda kapı bulunamadı." |
| V-164 | Kısım açıklıklarının binada karşılığı var (EXT olanlar LoD2'de, aynı hizada) | Y | H | "Kısımdaki pencere objesinin binada karşılığı bulunamadı." (LK_OuterWindowPairNotFound), kapı için de |
| V-165 | Mükerrer kullanım amacı (aynı BB'de anlamsız tekrar) | Y | U | "Mükerrer kullanım amacı.({...})". DOĞRULANMALI: tam anlamı |
| V-166 | OA'da ≥ 1 taban ve ≥ 1 tavan | Y | H | "Ortak alanda en az 1 tane tavan olmalıdır." |

### 6.11 Açıklıklar

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-170 | Kapı ve pencere WallSurface veya InteriorWallSurface içinde (`opening`) | Y | H | "Pencere objesi duvar yüzeyinde (WallSurface) olmalıdır." |
| V-171 | 1 poligon, deliksiz, `lod4MultiSurface` | Y | H | "Pencerede sadece 1 tane poligon bulunmalıdır.", "Pencere deliksiz olmalıdır." (kapı için de) |
| V-172 | Açıklık poligonu ile duvardaki delik halkası özdeş noktalara sahip | Y | H | "Duvar yüzeyinde pencereye uygun delik bulunamadı." |
| V-173 | `doorUsage` ve `windowUsage` kod listesinde | Y | H | — |
| V-174 | Açıklık duvar poligonuyla çakışmıyor (duvar delinmiş) | Y | H | REHBER "overlap olmamalıdır" |

### 6.12 Balkon ve Teras

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-180 | `lod2Geometry/MultiSurface` var | Y | H | — |
| V-181 | Taban (FloorSurface) ve yan duvar (WallSurface) var | Y | H | "Balkonlar yan duvar ve tabanlara sahip olmalıdır." |
| V-182 | Taban kalınlığı ≥ 0.10 ve = BB taban kalınlığı | Y | H | "Balkon zemin kalınlığı çok az.", "Teras zemin kalınlığı çok az.", "Bağımsız bölüm taban kalınlığı ile balkon taban kalınlığı aynı olmalıdır." |
| V-183 | Yan duvar kalınlığı ≥ 0.05 | Y | H | "Balkon yanduvar kalınlığı en az {...} m olmalıdır." |
| V-184 | Balkon BB'ye boşluksuz değiyor (1 mm) | Y | H | "Balkon ile bağımsız bölüm arasında boşluk var." |
| V-185 | Korkuluk tepesi ≤ BB duvar tepesi | Y | H | "Balkon duvarı, bağımsız bölüm duvarından daha uzun olamaz." |
| V-186 | `geometrySuitability` = 1001 | Y | H | "…balkon geometrik uygunluk 1001 olmalıdır." |
| V-187 | Teras referansı -1 | Y | H | "Terasın bağımsız bölüm referans değer -1 olmalıdır." |
| V-188 | Balkon referansı geçerli BB_ | Y | H | "Referansı verilen bağımsız bölüm bulunamadı." |

### 6.13 MBG ve parsel düzeyi

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| V-190 | MBG'de MB, tüm K, tüm BB var; hepsi dosyada mevcut | Y | H | "Kat referansı, MimariBinaGrup içinde bulunamadı." ve benzeri 4 mesaj |
| V-191 | MBG adı ve sınıfı | Y | H | — |
| V-192 | Aynı parseldeki binalar kesişmiyor (1 m) | K | H | "Aynı parselde kesişen binalar var.", "{...} ve {...} idli binalar yüzde {...} kesişmektedir." |
| V-193 | Bina tabanı parsel ile kesişiyor | K/T | H | "Binanın tabanı ile bulunduğu parsel kesişmiyor.", "Binanın tabanı ile megsisten gelen parsel geometrisi kesişmelidir." |
| V-194 | Parseldeki tüm BB'ler üretilmiş | T | H | "Veritabanında bulunan {...} idli bağımsız bölüm, gml dosyalarının içinde bulunamadı." |
| V-195 | MAKS yapı geometrisi ↔ parsel ve TIC | T | U | SÜRÜM v2.49 |

### 6.14 Kural uygulama notları

- Her kural **saf fonksiyon** olmalı ve birim testle örnek dosyalara karşı çalıştırılmalı. TKGM örnekleri **sıfır hata** üretmelidir. Örnekte hata çıkıyorsa ya kural yanlıştır ya da örnek eski kurala göredir; bu durum `knownSampleExceptions.json` dosyasına gerekçesiyle yazılır.
  - Bilinen istisnalar [ÖLÇÜLDÜ]:
    - Ornek1–6'nın koordinat hane sayısı (V-030).
    - Ornek2 balkonlarındaki 1002 (V-186).
    - Ornek6'daki TAB karakterli int (V-062).
    - Ornek5'teki MAKS yer tutucuları (T).
- Uygulama TKGM'nin **bilmediği** kurallar uydurmamalı. Kataloğa eklenen her kural bir TKGM kaynağına bağlanmalı (`source` alanı zorunlu).

---

## 7. Arayüz ve İş Akışı

### 7.1 Yasal süreçteki yer

Uygulamanın görevi **yalnız** şudur: mimari projeden ve yapı aplikasyon projesinden geçerli `M-<YapıID>.gml` üretmek ve yerel doğrulamasını yapmak. Sonraki adımlar uygulamanın dışındadır ve kullanıcıya yardım metninde anlatılır:
1. Dosyanın 3dbinadogrula.tkgm.gov.tr'ye yüklenmesi ve **Doğrulama Kodu** alınması.
2. Belediyenin kontrolü ve WebTapu'ya yüklemesi.
3. Kadastro (MEGSİS) onayı.
4. Tapu tescili.

Çok bloklu yapılarda (2025/2 Genelgesi m.4/3) birden fazla GML tek doğrulama koduyla gönderilir.

### 7.2 Ana pencere düzeni

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Menü: Dosya | Düzen | Görünüm | Çizim | Üret | Doğrula | Yardım      [Kod listesi: ✓ 07.11.2026] │
├──────────────┬───────────────────────────────────┬──────────────────────────────────┤
│ PROJE AĞACI  │ 2B ÇİZİM (aktif kat)              │ 3B SAHNE                          │
│ ▸ Parsel     │  • altlık (raster/DXF) katmanı    │  • LoD0 / LoD1 / LoD2 / LoD4 / BB │
│ ▸ Bina A     │  • kat sınırı / BB / kısım /      │  • kat patlatma, kesit düzlemi    │
│   ▸ Katlar   │    OA / iç yapı / balkon / açıklık│  • seçili nesne vurgusu           │
│   ▸ BB'ler   │  • ölçü, alan etiketi             │  • ölçüm aracı                    │
│   ▸ Çatı     │  • snap: uç/orta/dik/paralel/ızgara│                                  │
│   ▸ TIC      │                                   │                                   │
├──────────────┴───────────────────────────────────┼──────────────────────────────────┤
│ DOĞRULAMA PANELİ (Y/K/T sekmeleri, filtre, tıkla→git) │ ÖZNİTELİK PANELİ (seçili nesne)  │
└───────────────────────────────────────────────────┴──────────────────────────────────┘
```

### 7.3 Sihirbaz akışı (ilk proje)

1. **Proje oluştur:**
   - Taşınmaz Kimlik No, ada, parsel, TAKBİS mahalle ref, il/ilçe/mahalle (TR büyük harf).
   - Bina harfi (A…). constructionID ve dosya adı canlı gösterilir.
2. **Belgeler:** Mimari proje (PDF/TIFF/PNG/DXF), yapı aplikasyon projesi (DXF/PDF), liste beyan (Excel/CSV). Her biri isteğe bağlı.
3. **Konumlandırma:**
   - Aplikasyon köşeleri tablosu (Y, X, Z ortometrik). Elle girilir, CSV'den veya DXF katmanından alınır.
   - Bunlar **TIC** olarak da kaydedilir.
   - Plan üzerinde karşılık gelen köşeleri tıklama.
   - Helmert sonucu: dönüklük, ölçek, nokta başına artık (cm). Eşik 5 cm (ÖNERİ, değiştirilebilir).
   - EPSG önerisi: `DOM = 27 + 3·round((λ − 27)/3)`, `λ` = parsel boylamı. Ya da kullanıcı seçer.
   - ±0.00 kotunun ortometrik karşılığı girilir.
4. **Kat tanımları:** Tablo halinde numara, ±0.00'a göre taban kotu, kat yüksekliği, döşeme kalınlığı. Asma kat engeli ve açıklaması, çatı katı seçenekleri (Kat nesnesi oluştur / oluşturma).
5. **Liste beyan:** Excel/CSV içe aktarma (bkz. 8.4) veya elle tablo. Her satır bir `IndependentSection`.
6. **Çizim:** Kat kat; araçlar 7.4'te.
7. **Çatı:** Parametrik veya elle.
8. **Üret ve doğrula:** "GML Üret" → B-rep → Y kurallar → rapor → `M-*.gml` kaydet. İsteğe bağlı val3dity çalıştırması.

### 7.4 Çizim araçları (2B)

| Araç | Davranış | Kısayol (ÖNERİ) |
|---|---|---|
| Kat sınırı | Kapalı çokgen; çok kütle desteği | `K` |
| BB parçası | Kapalı çokgen; kat sınırı ve diğer BB'lere snap. BB seçimi açılır listeden (liste beyan) | `B` |
| Kısım (BBK) | Kapalı çokgen; BB parçasına zorunlu ait; partUsage seçimi; plan alanı girişi; canlı alan ve sapma göstergesi | `R` |
| Ortak alan | Kapalı çokgen; commonAreaUsage; komşu niteliksiz OA'ları **Birleştir** | `O` |
| İç kısım | Bir kısmın içine kısım çizilince otomatik delik | — |
| İç yapı | Oda içine kapalı çokgen; Sütun / Merdiven / Asansör; yuvarlak sütun için 12-gen yardımcı | `I` |
| Balkon / Teras | Dış sınır; bina kenarına otomatik snap; ortak kenarlar otomatik tespit | `L` |
| Kapı / Pencere | Bir duvar yüzüne iki tık; genişlik ölçüyle düzeltilebilir; varsayılan yükseklikler K45/K46 | `D` / `W` |
| Kopyala kat | Seçili katın BB, kısım ve açıklıklarını başka kata kopyalar (yeni GUID'lerle); kat sınırını da kopyalar | `Ctrl+Shift+C` |
| Ölçü | İki nokta mesafesi, alan | `M` |

**Snap sırası:** köşe > kenar orta > kenar üzeri > dik > paralel > ızgara (1 cm). Snap toleransı ekranda 8 piksel. Snap sonucu her zaman **mm tamsayı**.

### 7.5 Canlı göstergeler

- Kısım ve BB üzerinde: hesaplanan alan, plan alanı, sapma (%). %10'u aşınca kırmızı.
- Katta: BB sayısı, kat kullanımı.
- Yapıda: toplam BB, kat sayısı, constructionID.

### 7.6 3B sahne

- Three.js. Yerel köken: TUREF − origin, metreye bölünmüş float32.
- Katmanlar: LoD0 (iz ve çatı kenarı çizgileri), LoD1 (saydam kütle), LoD2 (duvar, çatı, zemin), BB küvetleri (renk BB başına), Kısımlar (partUsage renk paleti), Açıklıklar (kapı kahve, pencere camgöbeği), Balkonlar, TIC (kırmızı çizgi).
- Kat patlatma (katlar arası dikey ayrım kaydırıcısı), kesit düzlemi (yatay, kaydırıcıyla), seçimde öznitelik paneli.
- Doğrulama hatası seçilince ilgili poligon kırmızı ve kamera ona odaklanır.

### 7.7 GML görüntüleyici ve öznitelik düzeltici (içe aktarılmış GML)

- Herhangi bir TKGMCityGML açılır (SAX ayrıştırıcı, bkz. 9.6). Ağaç: Bina → Katlar → BB'ler → Kısımlar.
- Öznitelikler düzenlenebilir: kod değerleri, adlar, sayımlar, `additionalNote`, MAKS no, tarih.
- Geometri **değiştirilmez**. "Sayımları yeniden hesapla" ve "Adları yeniden üret" düğmeleri vardır.
- Kaydetmede biçimlendirme yeniden yazılır (3 hane, posList).
- Dosya doğrulayıcısı (6.x) burada da çalışır. Böylece reddedilmiş bir dosyanın öznitelik hataları hızla düzeltilir.

---

## 8. İçe Aktarma

### 8.1 Raster mimari proje (PDF/TIFF/PNG/JPG)

- PDF sayfaları `pdf.js` ile görüntüye çevrilir (300 dpi).
- **Hizalama:** iki nokta ile döndürme (yatay referans çizgisi).
- **Ölçekleme** [REHBER]: x ve y için ayrı ölçek (afin); en az 2 yatay + 2 dikey ölçü; 3. bir yüzeyle kontrol. Kullanıcı "bu iki nokta arası 4.35 m" der. Program ölçek faktörlerini ve artıkları gösterir.
- **Yerel deformasyon:** İsteğe bağlı çok noktalı (≥ 4) projektif veya afin dönüşüm (ÖNERİ).
- Her kat planı ayrı altlık. Katlar arası hizalama ortak referans noktalarıyla yapılır.
- Altlık görüntüsü proje klasörüne kopyalanır; proje JSON'u göreli yol tutar.

### 8.2 DXF

- Ayrıştırıcı: ENTITIES içinde LINE, LWPOLYLINE (bulge → yay, 5° veya en fazla 5 cm sapma ile parçalanır), POLYLINE, ARC, CIRCLE, INSERT (blok açılır, dönüşüm uygulanır), HATCH sınırları.
- **Birim:** `$INSUNITS` (4 = mm, 5 = cm, 6 = m); yoksa kullanıcı seçer.
- **Katman eşleme tablosu:** DXF katmanı → {kat sınırı, BB, kısım (+ kullanım), OA, iç yapı, balkon, kapı, pencere, yok say}. Proje şablonu olarak kaydedilir.
- **Kapalılık:** İlk ve son nokta arası ≤ 1 mm ise kapalı kabul edilir; aksi halde uyarı.
- **Koordinatlar:** DXF zaten TUREF'te ise (aplikasyon DXF'i) Helmert gerekmez; doğrudan kullanılır.
- DWG desteklenmez. Yardım metninde dönüştürme yolu anlatılır (ör. ODA File Converter).

### 8.3 KML / GeoJSON (parsel sınırı)

- WGS84 → TUREF TM dönüşümü `proj4` ile.
- TUREF ≈ ITRF96 ≈ WGS84 pratik eşdeğer. EPSG:5253–5259 tanımları proj4 string olarak gömülür: `+proj=tmerc +lat_0=0 +lon_0={DOM} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0 +units=m +no_defs`.
- Yalnız altlık ve parsel kontrolü (V-193) için kullanılır; ölçüye esas geometri değildir.
- Kullanıcı parsel geometrisini TKGM Parsel Sorgu uygulamasından kendisi indirebilir. DOĞRULANMALI: hangi formatlarda indirilebildiği.

### 8.4 Liste beyan (Excel/CSV)

**Şablon sütunları:**

| Sütun | Alan | Not |
|---|---|---|
| BB_NO | independentSectionNumber | zorunlu |
| BLOK | blockName | yoksa -1 |
| GIRIS | entrance | boş olabilir |
| KAT_TANIMI | registeredFloorDefinition | aynen |
| NITELIK | registeredQuality | TR büyük harf |
| EKLENTI | registeredInstallation | TR büyük harf, boş olabilir |
| ARSA_PAYI | propertyLot | `pay/payda`, pay ≤ payda |
| NET_ALAN | independentSectionPlanNetArea | yoksa -1 |
| BRUT_ALAN | independentSectionPlanGrossArea | yoksa -1 |
| MAKS_BB_NO | maksIdentityNumber | int |
| MAKS_NUMARATAJ_NO | maksNumaratajIdentityNumber | int |
| KULLANIM | independentSectionUsage | 1001–1006 |
| CEPHE | cardinalDirection | `1001;1003` gibi çoklu |

- **Okuyucular:** Excel için SheetJS (lisansı kontrol edilmeli), CSV için PapaParse. Ayırıcı otomatik algılanır (`,` `;` TAB). Kodlama UTF-8 veya Windows-1254 algılanır.
- **Doğrulama raporu:** eksik zorunlu, geçersiz arsa payı, tekrarlanan BB no.

---

## 9. Platform ve Kod Mimarisi

### 9.1 Teknoloji (ÖNERİ, gerekçeli)

| Katman | Seçim | Gerekçe |
|---|---|---|
| Masaüstü kabuğu | **Electron** (+ `electron-builder` NSIS kurulum) | Kullanıcı Windows uygulaması istedi. Node erişimiyle dosya sistemi, büyük dosya ve harici araç (val3dity) çağırma mümkün. PWA hedeflenmez. |
| Dil | **TypeScript** (strict) | Tip güvenliği; veri modeli 4.2 birebir. |
| Arayüz | React + Vite | Yaygın, hızlı geliştirme. |
| 2B çizim | HTML Canvas 2D (veya Konva) + kendi snap motoru | mm tamsayı kontrolü bizde kalmalı. |
| 3B | **three.js** | Olgun; delikli poligon için **earcut** üçgenleme. |
| 2B poligon işlemleri | **Clipper2** JS/WASM portu (tamsayı) | Birleşim, fark, ofset; tamsayı aritmetiği mm ızgarasıyla birebir uyumlu. Paket adı başta npm'de doğrulanmalı. |
| Kesin geometrik testler | `robust-predicates` | Kendini kesme ve yönelim testleri. |
| 3B boolean | **manifold-3d** (WASM) | Çatı arası kesimi; manifold garantili. |
| Straight skeleton | Uygun WASM paketi veya kendi uygulaması | Kırma/beşik çatı. DOĞRULANMALI: paket seçimi. |
| CRS | **proj4** | KML/GeoJSON dönüşümü. |
| XML okuma | **saxes** (SAX, akış) | 40 MB GML; Worker içinde. |
| XML yazma | Kendi akış yazıcısı (string builder, parça parça diske) | Bellek dostu; deterministik biçim. |
| XSD doğrulama | `xmllint-wasm` (libxml2 WASM) veya Node `libxmljs2` | CityGML 2.0 XSD'leri yerel kopya (ağsız). |
| DXF | `dxf-parser` + kendi bulge/INSERT işleme | — |
| PDF raster | `pdfjs-dist` | — |
| Excel/CSV | SheetJS CE / PapaParse | — |
| Test | Vitest (birim), Playwright-Electron (uçtan uca) | — |
| Kalıcı ayarlar | JSON dosyası `%APPDATA%/TKGM3B/` | — |

**Sürüm kuralı:** Bağımlılıklar `package.json`'da **kesin sürümle** sabitlenmeli (`^` yok) ve `package-lock.json` depoya eklenmeli.

### 9.2 Klasör yapısı

```
tkgm3b/
├─ package.json, tsconfig.json, vite.config.ts, electron-builder.yml
├─ resources/
│  ├─ codelists/fallback/*.xml          # kurulumla gelen yedek (önbellek yoksa)
│  ├─ xsd/citygml-2.0/**                 # yerel XSD kopyaları
│  └─ samples/                           # test için TKGM örnekleri (lisans/izin kontrol edilmeli)
├─ src/
│  ├─ main/                              # Electron ana süreç: dosya, menü, harici araç çalıştırma
│  ├─ preload/
│  ├─ renderer/
│  │  ├─ app/  (React kabuk, paneller)
│  │  ├─ editor2d/ (canvas, araçlar, snap)
│  │  ├─ viewer3d/ (three.js sahne)
│  │  └─ wizards/
│  ├─ core/                              # UI'dan BAĞIMSIZ, saf TS (Node'da test edilir)
│  │  ├─ model/        (4.2 tipleri, zod şemaları, proje JSON okuma/yazma, migrasyon)
│  │  ├─ units/        (mm ızgarası, köken, biçimlendirme)
│  │  ├─ codelists/    (indir, önbellek, sorgu: code→description)
│  │  ├─ georef/       (Helmert, EPSG, proj4 tanımları)
│  │  ├─ topology/     (Clipper2 sarmalayıcı, kenar etiketleme, T-kavşak)
│  │  ├─ brep/         (poligon, halka, yön, düzlem birleştirme)
│  │  ├─ generators/   (kot, kısım, bbKüvet, kat, balkon, açıklık, çatı, lod0, lod1, lod2, tic, envelope)
│  │  ├─ metrics/      (alan, hacim, sayımlar)
│  │  ├─ ids/          (GUID v5, önek, ad fabrikası)
│  │  ├─ gml/
│  │  │  ├─ writer/    (3.x şablonları; akış yazıcı)
│  │  │  └─ reader/    (SAX → ImportedModel)
│  │  ├─ validation/
│  │  │  ├─ rules/     (V-001 … V-195, her biri ayrı dosya, source alanlı)
│  │  │  └─ runner.ts
│  │  └─ importers/    (dxf, raster-calib, kml, geojson, listeBeyan)
│  └─ workers/        (gml-parse.worker.ts, generate.worker.ts, validate.worker.ts)
└─ tests/
   ├─ unit/**  ├─ golden/**  ├─ roundtrip/**  └─ e2e/**
```

**Kural:** `core/` içinde DOM, React veya Electron import edilmez. Tüm geometri ve GML mantığı Node'da başsız (headless) test edilebilir.

### 9.3 Üretim hattı (pipeline)

```
DesignModel (JSON)
  → validateDesign()            [2B tasarım kuralları, canlı]
  → computeElevations()         [5.2]
  → buildTopology(storey)       [5.3: W bölgeleri, kenar etiketleri]
  → resolveOpenings()           [5.4]
  → generate*                   [5.5–5.11] → BRep (poligonlar, kabuklar, nesne ağacı)
  → weldAndSplit()              [T-kavşak, ızgara, yön, düzlemsellik]
  → computeMetrics()            [5.12]
  → assignIdsAndNames()         [3.12, 3.13]
  → writeGml(stream)            [3.x]
  → validateGml(file)           [6.x]  (+ isteğe bağlı val3dity)
```

Her aşama saf fonksiyondur, Worker'da çalışır ve ilerleme bildirir.

### 9.4 Kod listesi servisi (K60)

- `CodelistService.refresh()`: 14 URL, zaman aşımı 10 sn, `If-Modified-Since`. Başarılıysa önbelleğe yazar.
- `getDescription(listName, code)`: ad üretiminde **bu** kullanılır.
- `isValid(listName, code)`: V-063.
- Arayüz durum çubuğu: "Kod listeleri: çevrimiçi (tarih)" / "önbellek (tarih)" / "YEDEK, güncel değil!".
- Proje kaydına `codelistSnapshot` (indirme tarihleri ve SHA-256) yazılır. Böylece hangi listeyle üretildiği bilinir.

### 9.5 Harici araçlar (isteğe bağlı)

- **val3dity:** Kullanıcı yolunu ayarlardan gösterir. Uygulama çalıştırmadan önce sürümünü sorar (`--version`). Çıktı JSON raporu ayrıştırılır, hata kodları (-101…-999) V-03x/V-10x'e eşlenir.
- **citygml-tools:** CityGML → CityJSON dönüşümü (val3dity doğrudan CityGML de okuyabilir; DOĞRULANMALI).
- Bu araçlar **uygulama ile dağıtılmaz** (lisans). Yalnız kullanıcı kurarsa kullanılır.

### 9.6 GML okuyucu (içe aktarma)

- SAX akışı, Worker'da.
- `gml:id` → düğüm indeksi; xlink'ler ikinci geçişte çözülür.
- `ImportedModel`: nesne ağacı (Building, Storeys, Sections, Rooms, Installations, Openings) + poligonlar (Float64Array, yerel kökene göre).
- 40 MB dosya için hedef: < 10 sn, < 1.5 GB bellek.
- Hem `pos` hem `posList` desteklenir. srsDimension her zaman 3.
- Bilinmeyen eleman ve öznitelikler korunur ("raw" alanında) ve yeniden yazılırken atılmaz (yalnız öznitelik düzeltme modunda).

### 9.7 Güvenlik ve dayanıklılık

- XML ayrıştırmada DTD ve dış varlık **kapalı** (XXE).
- Proje dosyası otomatik kaydı (her 2 dk, son 10 sürüm).
- Geri al / yinele (komut deseni; tasarım modeli değişiklikleri).
- Uzun işlemlerde iptal düğmesi.

---

## 10. Test Stratejisi

### 10.1 Birim testleri

- Shoelace alanı, hacim (kapalı kabuk), düzlemsellik, kendini kesme, halka yönü, Helmert (bilinen çözümler).
- Ad fabrikası: tüm 3.12 örnekleri. Blok adında `/`, `-`, `_` temizleme; `-1` yerleştirme.
- TR büyük harf: `"istanbul ılıca" → "İSTANBUL ILICA"`.
- Kot motoru: Ornek6 değerleri (1095.900 / 1096.100 / 1098.700 / 1098.900 / 1101.500).

### 10.2 Örnek dosyalara karşı doğrulayıcı testi (zorunlu)

- 6 resmi örnek + Amasya + Sincan dosya doğrulayıcısından geçirilir. Beklenen: `knownSampleExceptions.json` dışında **sıfır hata**.
- `GML_M-17273333-F.gml` (Başarısız) için beklenen hatalar (en az şunlar):
  - Bina `geometrySuitability` 1005 (V-072)
  - `tenderRegistrationNumber` dolu (V-073)
  - Hiç kapı/pencere yok (V-137, V-163)
  - Z değerleri 0.63–12.02 → ortometrik değil. Uyarı kuralı: "zemin kotu < 0.5 m ya da > 5000 m ise şüpheli" (ÖNERİ)

### 10.3 Gidiş-dönüş (round-trip)

- `read(Ornek6) → ImportedModel → write → read → karşılaştır`.
- Nesne sayıları, öznitelikler, poligon köşe kümeleri (3 hane yuvarlamayla) ve xlink bütünlüğü aynı olmalı.

### 10.4 Altın senaryo: Ornek6 villasını sıfırdan üretme

1. Ornek6'dan (bu belgedeki analiz betiğine benzer bir araçla) kat sınırları, BB sınırları, oda poligonları, açıklık konumları, kotlar ve çatı yüzleri çıkarılır. Bunlar **tasarım modeli JSON'una elle veya yarı otomatik** girilir: `tests/golden/ornek6.design.json`.
2. Uygulama GML üretir.
3. **Karşılaştırma ölçütleri:**

| Ölçüt | Tolerans |
|---|---|
| Nesne sayıları (MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38) | birebir |
| Her BBK `calculatedArea` | ±0.01 |
| Her BBK `volume` | ±0.05 |
| BB `independentSectionCalculatedArea` (91.34) | ±0.01 |
| Kotlar | ±1 mm |
| Açıklık sayısı (LoD2: 8 kapı + 19 pencere) | birebir |
| Kendi doğrulayıcısında hata | sıfır |

### 10.5 Özellik tabanlı testler

- Rastgele dikdörtgen bölmeli planlar (1–6 oda, 1–3 BB, 1–4 kat) üretilir.
- Her biri için GML üretimi, doğrulayıcının sıfır hata vermesi, kapalı kabuk ve alan tutarlılığı kontrol edilir.

### 10.6 Resmi kabul testi

- İlk gerçek proje 3dbinadogrula'ya yüklenir. Çıkan **her** mesaj bir test vakasına dönüştürülür ve kural kataloğu güncellenir.
- Özellikle şu açık konular kesinleştirilir: koordinat hane kuralı, büyük harf kontrol edilen alanlar, OA dış duvar iç yüzü türü, kapı eşik yüzü, eğik tavan hacmi.

### 10.7 Performans

- Ornek3 (40 MB): açılış < 10 sn, 3B ilk görüntü < 3 sn.
- 20 katlı, 80 BB'lik projede tam üretim + doğrulama < 30 sn.

---

## 11. Yol Haritası ve Kabul Kriterleri

| Aşama | İçerik | Kabul kriteri |
|---|---|---|
| **M0** Altyapı | Electron + React + TS iskeleti; `core/` paketi; kod listesi servisi; proje JSON şeması | Uygulama açılıyor; kod listeleri indiriliyor ve önbelleğe alınıyor |
| **M1** GML okuyucu + görüntüleyici | SAX okuyucu, ImportedModel, three.js görüntüleme, nesne ağacı | 8 örnek açılıyor; Ornek3 < 10 sn |
| **M2** Dosya doğrulayıcı | V-001…V-195'in Y kapsamındakiler | 8 örnek sıfır hata (istisnalar hariç); Başarısız örnekte beklenen hatalar |
| **M3** Öznitelik düzeltici + yazıcı | Öznitelik düzenleme, yeniden yazma (3 hane, posList) | Gidiş-dönüş testi geçiyor |
| **M4** Tasarım modeli + 2B editör | Kat, BB, kısım, OA çizimi, snap, canlı alan | Ornek6 planı çizilebiliyor |
| **M5** Geometri motoru I | Kot motoru, kısım kabukları, BB küveti, kat kabuğu, açıklıklar (düz çatılı, çatı arası yok) | Ornek6 altın testi (çatı hariç) |
| **M6** Geometri motoru II | Balkon/teras, LoD0/1/2, TIC, Envelope, parametrik çatı | Ornek6 altın testi tam; kendi doğrulayıcısında sıfır hata |
| **M7** Konumlandırma ve içe aktarma | Helmert sihirbazı, raster kalibrasyon, DXF, liste beyan | Gerçek bir projenin DXF'i içe alınıp konumlandırılabiliyor |
| **M8** Çatı arası ve özel durumlar | manifold-3d kesim, iç yapı, iç kısım, dubleks, asma kat, uzak kısım | Ornek2 benzeri çatı aralı test vakası |
| **M9** Resmi test | Gerçek projeyle 3dbinadogrula | "Başarılı" + Doğrulama Kodu |
| **M10** Paketleme | NSIS kurulum, otomatik güncelleme (isteğe bağlı), kullanıcı kılavuzu | Temiz Windows 11 makinesinde kurulum ve çalışma |

**Önemli:** M1–M3, çizim aracı olmadan da tek başına değerlidir. Mevcut GML'leri açıp doğrulama ve öznitelik düzeltme, reddedilen dosyaları hızla düzeltmek için en sık ihtiyaçtır. Bu yüzden ilk teslim bu üçü olmalıdır.

---

## 12. TKGM'ye Sorulması Önerilen Açık Sorular

1. "Koordinatlar noktadan sonra 3 basamağa sahip olmalıdır" kuralı "tam 3" mü, "en fazla 3" mü? (Örnekler 1–12 hane.)
2. Hangi öznitelikler büyük harf kontrolüne tabidir? `registeredFloorDefinition` örneklerde karışık harfli.
3. BB tabanında şaft deliği varsa `independentSectionCalculatedArea` nasıl hesaplanır? (Ornek1'de değer ne net ne brüt alana eşit.)
4. Çatı arası (eğik tavanlı) oda hacmi hangi yöntemle hesaplanıyor?
5. Oda yüksekliği 1.5 m kuralı eğik tavanda en yüksek nokta mı, ortalama mı? (Ornek2'de 1.3 m'lik odalar var.)
6. `roofProjectionArea` saçak dahil mi? (Ornek6'da RoofEdge alanından büyük; hata tablosunda RoofEdge ile karşılaştırma var.)
7. Müstakil yapıda BB ana giriş kapısı 1001 mi, 1003 mü olmalı? "BB'de 1003 kapı bulunamadı" kuralı müstakil yapıda uygulanıyor mu?
8. BB'nin başka kattaki deposu/otoparkı: uzak kısım (BBK) mı, ayrı BB parçası (1005/1006) mı tercih edilmeli?
9. MAKS BB ve numarataj numaraları üreticinin erişebileceği bir servisten alınabiliyor mu?
10. Kat geometrisi için Biçim A (tek taban) ile Biçim B (döşeme kutusu) arasında tercih var mı?
11. Rehberdeki eski masaüstü doğrulayıcı (`kadastro_3d_gml_validation.zip`) sürdürülebilirlik GML'leri için hâlâ geçerli mi?

---

## Ek-A. Kod Listeleri (14 dosyanın tam içeriği, 07.11.2026'da indirildi)

> Uygulama bu tabloyu **kullanmaz**; çalışma anında URL'den indirir (K60). Tablo yalnız geliştirici referansıdır.

**buildingType:** 1001 Ana Yapı · 1002 Diğer

**buildingGeometrySuitability:** 1001 Uygundur · 1002 Kat Uyumsuzlugu · 1003 Şekil Uyumsuzlugu · 1004 Kütle Uyumsuzlugu · 1005 Bagimsiz Bolum Uyumsuzlugu · 1006 Kat İrtifkı Tesisi

**maksConstructionIntegrationState:** 1001 Sağlandı · 1002 Mimari Proje Karşılık Bulunamadı · 1003 Kat İrtifakı Tesis

**storeyUsage:** 1001 Mesken · 1002 Ticari · 1003 Ortak Alan

**independentSectionGeometrySuitability:** 1001 Uygundur · 1002 Alan Uyumsuzlugu

**independentSectionUsage:** 1001 Mesken · 1002 Ticari · 1003 Çoklu Kat · 1004 Çatı Arası · 1005 Depo · 1006 Eklenti

**integrationState:** 1001 Sağlandı · 1002 Proje Okunamadı · 1003 Csv Karşılık Bulunamadı · 1004 Kat İrtifkı Tesisi (XML'de `gml:id="id3"` iki kez kullanılmış; ayrıştırıcı bu hataya dayanıklı olmalı)

**cardinalDirection:** 1001 Kuzey · 1002 Kuzeydoğu · 1003 Doğu · 1004 Güneydoğu · 1005 Güney · 1006 Güneybatı · 1007 Batı · 1008 Kuzeybatı · 1009 Kapalı Cephe

**maksIndependentSectionIntegrationState:** 1001 Sağlandı · 1002 Shape Karşılık Bulunamadı · 1003 Kat İrtifakı Tesisi

**independentSectionPartGeometrySuitability:** 1001 Uygundur · 1002 Alan Uyumsuzlugu

**partUsage** (BBK `partUsage` ve OA `commonAreaUsage`): 1001 Oda · 1002 Banyo · 1003 Salon · 1004 Mutfak · 1005 Kiler · 1006 Tuvalet · 1007 Kış Bahçesi · 1008 Hol · 1009 Dükkan · 1010 Sığınak · 1011 Danışma · 1012 Kalorifer Dairesi · 1013 Kapıcı Dairesi · 1014 Elektrik Merkezi · 1015 Isı Merkezi · 1016 Otopark · 1017 Güvenlik Odası · 1018 Havuz · 1019 Sosyal Tesis · 1020 Spor Salonu · 1021 Çöp Odası · 1022 Niteliksiz Ortak Alan · 1024 Merdiven · 1025 Su Merkezi · 1026 Dini Tesis · 1027 Müştemilat · 1028 Teknik Hacim · 1029 İç Mekan Asansör · 1030 Depo (1023 yok)

**roomInstallationUsage:** 1001 Merdiven · 1002 Sütun · 1003 Asansör

**doorUsage:** 1001 Bina/Yapı Giriş Kapı · 1002 Dış Kapı · 1003 Bağımsız Bölüm Kapı · 1004 Kısım Kapı

**windowUsage:** 1001 Dış Pencere · 1002 İç Pencere

**partUsage karşılık tablosu** [REHBER]:

| Kod | Kapsadığı mahaller |
|---|---|
| Oda | Ebeveyn, yatak, giyinme, oturma, çocuk, dinlenme, çalışma, misafir odası, ofis, batar kat |
| Banyo | Ebeveyn banyosu, jakuzi, sauna, havuz (ortak alan değilse) |
| Salon | Salon+mutfak, yemek odası, yaşam alanı, salon+hol |
| Kiler | Sandık, ütü, çamaşır, puset odası, süpürgelik |
| Depo | Kömürlük |
| Tuvalet | WC, hela |
| Hol | Sofa, antre, boşluk |
| Dükkan | Mağaza |
| Dini Tesis | Mescit, cemevi, ibadethane |
| Su Merkezi | Su deposu, hidrofor, sayaç odası |
| Niteliksiz Ortak Alan | Apartman boşluğu, merdiven, asansör, havalandırma, ışıklık, makine dairesi, asansör dairesi, kaçış menfezi, yangın holü, yangın merdiveni, kullanılmayan alan |
| Elektrik Merkezi | Jeneratör odası |
| Sığınak | Yangın odası |

## Ek-B. Varsayılan Değerler

| Parametre | Varsayılan | Kaynak |
|---|---|---|
| Döşeme kalınlığı | 0.20 m | KILAVUZ S.S.S.22 |
| Kapı yüksekliği | 2.10 m | REHBER |
| Düşük katta kapı | tavanın 0.30 m altı | REHBER |
| Mesken pencere | tavana 0.50, yükseklik 1.30 | REHBER |
| Ticari pencere | tabandan 0.10, tavana 0.10 | REHBER |
| Islak hacim ve küçük bodrum penceresi | tavana 0.50, yükseklik 0.50 | REHBER |
| Balkon korkuluk yüksekliği | 1.10 m | REHBER |
| Balkon korkuluk kalınlığı | 0.10 m | REHBER |
| Yuvarlak sütun | 12-gen | KILAVUZ |
| Sütun çizim eşiği | > 0.50 m | KILAVUZ |
| Çıkıntı ihmal eşiği | < 0.50 m ve alanı etkilemiyorsa | REHBER |
| Onay tarihi yoksa | belge tarihi → `1900-01-01` | KILAVUZ |
| `additionalNote` | `-` | ÖLÇÜLDÜ |

## Ek-C. Sözlük

| Terim | Anlamı |
|---|---|
| BB | Bağımsız Bölüm (mülkiyet birimi) |
| BB parçası | Bir BB'nin tek kattaki geometrisi (`GenericCityObject`) |
| BBK | Bağımsız Bölüm Kısmı (oda; `bldg:Room`) |
| OA | Ortak Alan (`bldg:Room`). Nitelikli (otopark, sığınak…) / niteliksiz (merdiven, hol…) |
| BBKIY / OAIY | Kısım / Ortak Alan İç Yapısı (sütun, merdiven, asansör) |
| MBG | Mimari Bina Grup |
| TIC | Terrain Intersection Curve, arazi–bina kesişim eğrisi |
| Küvet | BB geometrisi: döşeme kutusu + kalın duvarlar, tavansız |
| Kat dış sınırı | Kullanıcının çizdiği, katın dış cephe konturu |
| DOM | Dilim orta meridyeni |
| TUREF | Türkiye Ulusal Referans Çerçevesi |
| MAKS | Mekânsal Adres Kayıt Sistemi |
| MEGSİS | Mekânsal Gayrimenkul Sistemi |
| TAKBİS | Tapu ve Kadastro Bilgi Sistemi |
| Liste beyan | Bağımsız bölüm listesi (nitelik, kat, arsa payı, eklenti) |
| Yapı aplikasyon projesi | Binanın parsele konumlandığı, köşe koordinatlarını veren proje |

---

## Son Not (Gemini'ye)

1. Bu belge, ikinci incelemedeki önerilerin bir kısmını **düzeltmektedir**:
   - TIC 30 cm seçeneği tamamen kaldırılmalı (kılavuz v2.0'da kaldırılmış).
   - `buildingHeight` için 0–950 aralığı geçerlidir.
   - Kat geometrisi için Biçim B önerilir.
   - Kod listeleri çalışma anında indirilmelidir.
2. Gemini v3'teki **H1–H24** maddeleri plana işlenmelidir.
3. Kodlamaya **M0–M3 aşamalarıyla** (okuyucu, doğrulayıcı, öznitelik düzeltici) başlanmalıdır. Bu aşamalar TKGM örnekleriyle sıfır hata verecek şekilde doğrulanmadan çizim ve geometri motoruna geçilmemelidir. Doğrulayıcı, üretim motorunun "test hakemi"dir.
4. Plan veya kodda "%100 uyumlu" ifadesi kullanılmamalıdır. Kabul ölçütü yalnızca Bölüm 10–11'deki testler ve 3dbinadogrula.tkgm.gov.tr'den alınan "Başarılı" sonucudur.
