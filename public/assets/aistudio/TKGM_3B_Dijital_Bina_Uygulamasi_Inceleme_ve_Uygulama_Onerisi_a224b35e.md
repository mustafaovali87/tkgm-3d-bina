# TKGM 3B Dijital Bina ve CityGML Üretim Uygulaması
## Teknik inceleme, mevzuat değerlendirmesi ve Windows uygulaması önerisi

**İnceleme tarihi:** 7 Kasım 2026  
**Belge türü:** Ön araştırma ve ürün/teknik mimari önerisi  
**Durum:** Uygulama henüz geliştirilmemiştir. Bu belge, kodlamaya başlanmadan önce kapsamı ve kritik teknik kararları belirlemek içindir.

---

## 1. Yönetici özeti

Üç taslak birlikte değerlendirildiğinde, **üçüncü dosyadaki (v3) yaklaşım en iyi başlangıç noktasıdır**. Bununla birlikte dosyanın “6 resmî örnek GML ile satır satır kalibre edildiği” ve “tam uyumlu” olduğu iddiaları, bu inceleme sırasında bağımsız olarak doğrulanamamıştır. V3'ün güçlü tarafları; TKGM'ye özgü nesne hiyerarşisini düşünmesi, 2.5B parametrik tasarım modeli önermesi, TUREF'e oturtma sihirbazı, Liste Beyan aktarımı ve geometri üretimini GML yazımından ayırmasıdır.

**Benim önerim:** Windows üzerinde çalışan, çevrimdışı kullanılabilen, tek bir merkezi proje/veri modeli üzerinden 2B çizim, 3B görüntüleme, TKGM CityGML üretimi ve katmanlı doğrulama yapan bir masaüstü uygulaması geliştirmek. İlk aşamada PWA + Electron şeklinde iki ayrı dağıtım hedefini birlikte yürütmek yerine, sağlam bir Windows uygulaması ve güvenilir GML motoru önceliklendirilmelidir. Web sürümü daha sonra değerlendirilebilir.

Bu ürünün asıl değeri “2B çizimi 3B'ye çevirmek” değil; **mimari proje, yapı aplikasyon projesi, bağımsız bölüm beyanı, koordinat/kot ve TKGM CityGML şeması arasındaki ilişkileri tutarlı biçimde yönetmek** olmalıdır.

Uygulama; mimari proje veya yapı aplikasyon projesi hazırlayan, imzalayan ya da onaylayan yetkili kişinin yerine geçmemeli; resmî TKGM doğrulama servisine eriştiği veya MEGSİS/TAKBİS/MAKS veritabanlarını sorguladığı izlenimini de vermemelidir. Yerel kontrollerde başarılı olmak, TKGM portalından doğrulama kodu alınacağı veya işlemin tapuda kesin kabul göreceği anlamına gelmez.

**En kritik geliştirme kararı:** GML şeması, öznitelik türleri, nesne kimlikleri ve geometrik kurallar sabit kodlanmadan önce, TKGM'nin güncel rehberi, kod listeleri, kabul edilmiş örnek GML'ler ve canlı doğrulama servisiyle bir “altın test seti” oluşturulmalıdır. Erişilebilir rehber kopyasında dahi bazı maddeler ve hata tablosu birbiriyle çelişmektedir.

---

## 2. İncelemenin kapsamı ve sınırlamaları

### 2.1 İncelenen kullanıcı dosyaları

- `implementation_plan.md` — İlk taslak: LoD3 + LoD4, CAD/3B editör ve genel GML üretim yaklaşımı.
- `implementation_plan (1).md` — İkinci taslak: LoD0 + LoD1 + LoD2 + LoD4, CityGML 2.0, `M-<YapıID>.gml`, TIC, kod listeleri ve `val3dity`.
- `implementation_plan (2).md` — Üçüncü taslak: 2.5B parametrik model, kalın cidarlı B-Rep üretimi, MB/K/BB/BBK/OA hiyerarşisi, milimetre ızgarası, Helmert jeoreferanslama, DXF/KML/raster ve Liste Beyan içe aktarma.

### 2.2 Bağlantıların erişilebilirliği

- TKGM 2025/2 Genelge'nin güncel PDF metni TKGM alan adında incelendi.
- `https://cbs.tkgm.gov.tr/surdurulebilirlik/` ve `https://dijitalbina.tkgm.gov.tr/` sayfalarının doğrudan içeriği bu inceleme oturumunda istikrarlı biçimde alınamadı. Bu nedenle bu iki uygulamanın ekran/işlevleri veya güncel kod listelerinin tümü incelenmiş gibi kabul edilmemelidir.
- Dijital Bina Üretim Rehberi ve hata kodları için erişilebilen metin, TKGM sayfalarına dayandığı anlaşılan üçüncü taraf bir dokümantasyon aynasıdır (Lider Yazılım / Licad GIS). Bu içerik yararlı teknik ipuçları sağlıyor; fakat doğrudan güncel TKGM kaynağı olarak değil, **ikincil kaynak** olarak değerlendirilmelidir.
- DeepSeek paylaşım bağlantısı 403 erişim hatası verdi. Google AI Studio bağlantısı oturum açma ekranına yönlendi. Bu iki paylaşımın içeriği doğrudan incelenemedi. İlgili sohbetlerin dışa aktarılmış Markdown/PDF metni ayrıca verilirse eleştiri bunları da kapsayabilir.

### 2.3 Kanıt seviyeleri

Bu raporda aşağıdaki ayrım kullanılmıştır:

- **Mevzuat / birincil kaynak:** Resmî TKGM Genelgesi, Resmî Gazete'de yayımlanmış yönetmelik metni, Harita Genel Müdürlüğü yayını.
- **Teknik rehber / ikincil kopya:** TKGM Dijital Bina Üretim Rehberi ve hata tablosunun erişilebilen kopyası. Nihai uygulama kuralına dönüştürülmeden önce resmî güncel sürümle teyit edilmelidir.
- **Kullanıcı taslağı:** Üç Markdown dosyasındaki öneri veya iddialar. Bunlar kaynak veri değil, doğrulanacak tasarım hipotezleri olarak ele alınmıştır.
- **Mühendislik önerisi:** Uygulamanın güvenilir ve sürdürülebilir olması için bu raporda önerilen mimari/iş akışı.

---

## 3. Üç taslağın karşılaştırılması

| Konu | İlk taslak | İkinci taslak | Üçüncü taslak | Değerlendirmem |
|---|---|---|---|---|
| Detay seviyeleri | LoD3 + LoD4 | LoD0/1/2/4 | LoD0/1/2/4 | TKGM rehber kopyası LoD0, LoD1, LoD2 ve LoD4'ü tarif ediyor. İlk taslaktaki LoD3 ana hedef olmamalı. |
| Veri standardı | Genel CityGML yaklaşımı | CityGML 2.0 profili | CityGML 2.0 ve GML 3.1.1 iddiası | TKGM profili esas alınmalı; GML/CityGML namespace ve XSD sürümü örnek GML üzerinden kesinleştirilmeli. |
| Geometri | Basit extrude | LoD'lere göre türetim | 2.5B parametrik + B-Rep | Üçüncü taslak daha gerçekçi; fakat tüm geometrinin zorunlu olarak tam B-Rep çekirdeğiyle kurulması ilk sürüm için aşırı kapsam olabilir. |
| Koordinat | TUREF ve yerel ofset | TUREF / EPSG | Helmert sihirbazı + TUREF | En güçlü fikir üçüncü taslaktaki jeoreferanslama sihirbazı; ancak dönüşüm parametrelerinin kaynağı ve doğruluk raporu sıkı denetlenmeli. |
| İçe aktarma | GML/DXF/KML | GML/DXF/KML | GML/DXF/KML, raster ve CSV | Üçüncü taslak pratik ofis iş akışına daha yakın. |
| Validasyon | “300+ kural” iddiası | `val3dity` + TKGM kuralları | Çok katmanlı yerel kontrol | En doğru yön katmanlı kontrol; “300+ kuralın tümü yerelde yapılır” vaadi gerçekçi değil. |
| Dağıtım | PWA + Electron | PWA + Electron | Windows uygulamasına uygun | İlk sürüm için Windows masaüstü öncelikli olmalı. PWA ve EXE aynı şey değildir; iki platformu birden hedeflemek çekirdeği geciktirir. |

### 3.1 İlk taslaktan korunacak fikirler

- 2B/3B eşzamanlı çalışma alanı.
- Kat yöneticisi ve tipik katı çoğaltma.
- DXF/KML altlıkları.
- Katman, snap, ölçü ve alan hesapları.
- Mevcut GML'yi açıp hatalı veriyi düzenleyebilme.

### 3.2 İkinci taslaktan korunacak fikirler

- TKGM'nin kullandığı LoD0/LoD1/LoD2/LoD4 ayrımını temel almak.
- Dosya adlandırması `M-<YapıID>.gml`.
- TKGM'ye özgü sınıf ve nesne hiyerarşisi.
- `val3dity` ile geometri doğrulamasını TKGM'ye özgü semantik kontrollerden ayırmak.

### 3.3 Üçüncü taslaktan korunacak fikirler

- Tek ve merkezi tasarım modeli (Single Source of Truth).
- 2.5B parametrik geometri: XY plan geometrisi + kat kotları + duvar/döşeme/çatı parametreleri.
- İç koordinatlarda milimetre tabanlı hesap ve T-kavşak/kenar bölme çözümü.
- Helmert dönüşüm ve kontrol noktası artık hatalarının raporlanması.
- Liste Beyan tablosu ile BB özelliklerini toplu eşleştirme.
- GML çıktısını rastgele XML metni olarak değil, kontrollü veri modelinden üretme.

---

## 4. TKGM teknik gerekliliklerine ilişkin doğrulanabilen bulgular

### 4.1 Detay seviyeleri

Erişilebilen Dijital Bina Üretim Rehberi kopyasında TKGM CityGML için LoD0, LoD1, LoD2 ve LoD4 detay düzeyleri birlikte sayılmıştır. Bu nedenle ilk taslaktaki LoD3/LoD4 yaklaşımını ana teslim profili olarak kullanmamak gerekir. [2]

Önerilen kapsam:

- **LoD0:** `lod0FootPrint` ve `lod0RoofEdge`.
- **LoD1:** Zemin üstü/zemin altı kütleleri ve `CompositeSolid` ilişkisi.
- **LoD2:** Dış kabuk, duvar, çatı, arazi kesişim eğrisi ve bina eklentileri.
- **LoD4:** Bağımsız bölüm kısımları/odalar, iç duvar, taban, tavan ve açıklıklar.

Bununla birlikte LoD2'de hangi üst geometrinin (`lod2MultiSurface`, `lod2Solid` veya profilin belirlediği kombinasyon) zorunlu olduğu yalnızca taslak metninden kararlaştırılmamalıdır. Erişilebilir rehber kopyasında `lod2MultiSurface` anlatımıyla birlikte hata tablosunda `lod2Solid` için de kontrol mesajı vardır. Nihai yapı, XSD ve kabul edilmiş GML örnekleriyle doğrulanmalıdır. [2][3]

### 4.2 Dosya adı ve nesne hiyerarşisi

Rehber kopyası CityGML 2.0 tabanlı TKGM profilini ve `M-` + YapıID + `.gml` biçimindeki dosya adlandırmasını tarif ediyor. Aynı kaynakta tek bina, kat grupları, bağımsız bölümler, kısım/oda ve mimari bina grup ilişkileri örnekleniyor. [2]

Bu nedenle şu ön ekler veri modelinde merkezi bir kimlik fabrikası tarafından yönetilmelidir:

- `MB_` — Mimari Bina (`bldg:Building`)
- `K_` — Kat (`grp:CityObjectGroup`)
- `BB_` — Bağımsız Bölüm (`gen:GenericCityObject`)
- `BBK_` — Bağımsız Bölüm Kısım (`bldg:Room`)
- `OA_` — Ortak Alan (`bldg:Room`)
- `MBG_` — Mimari Bina Grup (`grp:CityObjectGroup`)
- `BLKN_` / `TRS_` — Balkon / Teras (`bldg:BuildingInstallation`)
- `KAPI_` / `PEN_` — Kapı / Pencere (`bldg:Door` / `bldg:Window`)
- Yüzey ve halka kimlikleri — örneğin `Wall_`, `InteriorWall_`, `Floor_`, `Ceiling_`, `Roof_`, `LinearRing_` vb.

**Önemli:** Ön ekler, sınıf adları ve `gml:id` verilen eleman türleri birbiriyle karıştırılmamalıdır. Örneğin `WallSurface` nesne sınıfı ile onun altındaki `Wall_...` geometri ID'si farklı şeylerdir. Kimlik kuralı tek bir merkezi fonksiyonda olmalı; aynı ID'nin iki kez üretilmesi teknik olarak engellenmelidir.

### 4.3 TUREF, EPSG ve yükseklik referansı

Rehber kopyasında 3 derecelik TUREF TM sistemleri için şu eşleştirme listesi yer alıyor: TM27/EPSG:5253, TM30/5254, TM33/5255, TM36/5256, TM39/5257, TM42/5258 ve TM45/5259. Aynı tabloda GRS80, Transverse Mercator, metre ve ortometrik yükseklik bilgisi de belirtiliyor. [2]

2025/2 Genelge'nin 25.02.2026 tarihli değişiklik metni, model ve Yapı Aplikasyon Projesinin TUREF koordinat sisteminde üretilmesini; kadastro arşivindeki koordinatlar başka sistemde ise kadastro müdürlüğünce üretilmiş imzalı/onaylı dönüşüm parametrelerinin kullanılmasını ve her iki koordinatın yapı aplikasyon projesinde gösterilmesini öngörüyor. [1]

Büyük Ölçekli Harita ve Harita Bilgileri Üretim Yönetmeliği'nin 2025'te güncellenen 1. maddesi, TUREF tabanlı XYZ veya GRS80 elipsoidal koordinatlarla birlikte güncel Türkiye Jeoit Modeli'ne dayalı Helmert ortometrik yüksekliklerini tarif ediyor. [4]

**Uygulama kararı:**

1. Kullanıcıdan hangi koordinat sisteminin ve hangi düşey referansın kullanıldığını açıkça seçmesini iste.
2. EPSG dilimini sırf Y koordinatına bakarak sessizce otomatik belirleme. Önerilen dilimi göster, kullanıcının onayını ve proje belgesiyle uyum kontrolünü iste.
3. Elipsoidal yükseklik ile ortometrik yüksekliği tek bir `Z` alanına açıklamasız karıştırma.
4. Resmî onaylı dönüşüm parametreleri kullanılmışsa parametre dosyası/değerleri, kaynak, tarih, kontrol noktaları ve artık hataları proje içinde sakla.
5. 3B görüntüleyicide büyük TUREF koordinatlarını doğrudan WebGL'e göndermek yerine yerel orijin/ofset kullan; fakat GML çıktısında gerçek TUREF koordinatlarını koru.

### 4.4 TIC (Terrain Intersection Curve)

Genelge, Yapı Aplikasyon Projesi ile modelden otomatik oluşturulan Yapı Özet Formu'ndaki TIC bilgilerinin **koordinat, kot, taban oturumu, alan ve parsel içindeki yerleşim** bakımından elektronik ortamda karşılaştırılmasını düzenliyor. Uyumlu değilse işlem iade ediliyor. [1]

Erişilebilir hata tablosu kopyasında arazi kesişiminin 30 cm aralıklarla nokta üretilerek gösterilmesi gerektiğine ilişkin bir kontrol mesajı bulunuyor. [3] Bu, teknik doğrulama beklentisi olarak ele alınmalıdır; 30 cm hükmünü Genelge'nin kendisinde yer alan ayrı bir kanun maddesi gibi sunmak doğru değildir.

**Uygulama kararı:** TIC, yalnızca binanın dış poligonunu 30 cm aralıkla örnekleyerek üretilmemelidir. Önce arazi modeli/uygun aplikasyon kotları ve zemin-kesişim geometrisi tanımlanmalı; ardından kesişim eğrisi hesaplanmalı ve gerekiyorsa örnek noktaları 0,30 m aralığı aşmayacak şekilde sıklaştırılmalıdır. Köşe ve kırılma noktaları örnekleme sırasında kaybedilmemelidir. Sonuç Yapı Aplikasyon Projesi ile karşılaştırılabilir rapor üretmelidir.

### 4.5 Kod listeleri ve öznitelik tipleri: kritik uyuşmazlık

Rehber kopyası, sabit değerlerin yalnızca tanımlı codelist'lerden seçilmesini söylüyor. Aynı kaynakta örnek olarak:

- `buildingType` için `1001` Ana Yapı,
- Mimari Bina `geometrySuitability` için `1006`,
- Bağımsız Bölüm `integrationState` için `1004`,
- Bağımsız Bölüm `maksIntegrationState` için `1003`,
- `independentSectionUsage` için 1001 Mesken, 1002 Ticari, 1003 Çoklu Kat, 1004 Çatı Arası, 1005 Depo, 1006 Eklenti,
- `independentSectionPart`/kısım uygunluğu için `1001` Uygundur

bilgileri yer alıyor. [2]

Ancak aynı kopyada bağımsız bölümün `geometrySuitability` alanına ilişkin tabloda `1006` ifadesi bulunurken, ayrı `independentSection Geometry Suitability` kod listesinde `1001` yazıyor; oda/kısım alanına ilişkin tabloda da `1006` denmesine rağmen örnek XML'de `1001` örneği gösteriliyor. Kullanıcı v3 taslağındaki BB için `1001/1002`, bina için `1006` yaklaşımı bu yüzden tek başına doğrulanmış sayılamaz. Sürdürülebilirlik portalı ve güncel resmî kod listeleri erişilebilir hale getirilerek, her nesne türü için gerçek doğrulama testi yapılmalıdır. [2][3]

Öznitelik tipi açısından da taslak v3'teki tüm `double`/`int` varsayımları körü körüne alınmamalıdır. Rehber kopyası örneğin `buildingHeight` alanını `gen:stringAttribute`, proje onay tarihini `gen:dateAttribute` olarak tarif ediyor. Uygulama, sayısal gibi görünen her alanı XML'de otomatik `double` yazmamalı; tür eşlemesi şema ve kabul edilmiş örnek XML'den gelmelidir. [2]

**Önerim:** Kod listelerini yazılım sürümünden bağımsız bir “şema paketi” olarak yönetmek. Her paketin sürüm numarası, indirme tarihi, kaynağı ve SHA-256 özeti tutulmalı. Kod listesini güncellemek, uygulamanın tüm kodunu yeniden yazmayı gerektirmemeli.

### 4.6 `measuredHeight` ile `buildingHeight` aynı şey kabul edilmemeli

V3 taslağı GML'de `measuredHeight` yazılmaması gerektiğini belirtiyor. Buna karşılık erişilebilir rehber/hata tablosu kopyasında `measuredHeight` değerinin 0–950 aralığında olması, biriminin metre olması ve LoD1 geometrisinin en yüksek noktasıyla uyumlu olması yönünde kontroller var. [3] Aynı rehber kopyası `buildingHeight` özniteliğini ise mimari projeden alınan, kot alınan noktadan saçak seviyesine kadar olan bina yüksekliği olarak ve `gen:stringAttribute` tipinde açıklıyor. [2]

Bunlar **iki ayrı veri kavramı** olarak ele alınmalı:

- `buildingHeight`: TKGM iş kuralının tarif ettiği mimari yükseklik özniteliği.
- `measuredHeight`: CityGML standardı/profil içinde bulunup bulunmadığı ve nasıl yazıldığı örnek GML/XSD ve canlı portal kontrolüyle kesinleştirilecek, geometriyle tutarlı olması beklenen yükseklik bilgisi.

V3'teki “kesinlikle yok” kararı, kabul edilmiş resmî GML örnekleri ve mevcut doğrulayıcıyla test edilmeden kodlanmamalıdır.

### 4.7 GroundSurface ve bazı geometri kuralları

Rehber kopyasının bir bölümünde `GroundSurface` yüzeyinin tanımı ve örnek XML'i gösteriliyor. Hata tablosunda ise “Mimari binada GroundSurface bulunamaz” ifadesi var. [3] Aynı kaynakta çatı üstü yapı ve diğer özel durumlar için de farklı kontroller bulunuyor. Bu, model tipine/nesneye/versiyona bağlı koşul olabilir veya doküman kopyasındaki bir tutarsızlık olabilir. Kesin karar, gerçek örnek GML ve canlı doğrulama üzerinden verilmelidir. [2]

Benzer biçimde `lod2MultiSurface`/`lod2Solid` hiyerarşisi, bazı ID önekleri ve nesne bazlı yüzey sayıları da örnek dosyalara göre test edilmelidir. Uygulama “bir bina için her zaman tam bir GroundSurface vardır” gibi tek satırlı varsayımlarla tasarlanmamalıdır.

### 4.8 Kapı/pencere geometrisi

Rehber kopyası kapı ve pencereleri dış duvar üzerindeki `bldg:opening` ilişkileriyle, ayrıca ilgili kapı/pencere nesneleri ve LoD4 geometrileriyle ele alıyor. İç duvar/oda geometrileri de `boundedBy` ve `lod4MultiSurface` bağlantılarıyla gösteriliyor. [2]

V3'teki “tek kapı/pencere kaydından dört farklı geometri temsili üretme” yaklaşımı teknik olarak doğru bir tasarım ilkesi olabilir; fakat dört kopya geometri ayrı ayrı çizilmemelidir. Tek bir parametrik açıklık nesnesi (duvar referansı, açıklık genişliği/yüksekliği, tabandan kotu, söve/lento kalınlığı ve açıldığı oda) tutulmalı; gerekiyorsa farklı CityGML bağlamlarına ait yüzeyler bu kaynaktan türetilmelidir. Her bağlam için gerçekten hangi temsilin istendiği örnek dosya ile kanıtlanmalıdır.

Kapı ve pencere ölçüleri mümkün olduğunda mimari proje ve kesitten alınmalı; rehberdeki varsayılanlar sadece proje bilgisinin gerçekten bulunmadığı koşullarda ve kullanıcı onayıyla kullanılmalıdır. Varsayılan ölçünün sessizce uygulanması uygun değildir. [2]

---

## 5. İlgili mevzuat ve uygulamaya etkisi

> Bu bölüm ürün gereksinimleri için teknik mevzuat okumasıdır; hukuki mütalaa değildir. Uygulamanın kullanıldığı işlem türüne göre güncel mevzuat ve idare görüşü ayrıca kontrol edilmelidir.

### 5.1 TKGM 2025/2 sayılı Genelge — 25.02.2026 değişikliğiyle birlikte

Bu uygulamanın ana mevzuat dayanağı, kat irtifakı/kat mülkiyeti tesisi işlemlerinde 3B Sayısal Yapı Modelini düzenleyen TKGM 2025/2 sayılı Genelge'dir. TKGM'nin güncel değişiklik PDF'sinde 25.02.2026 tarihli düzeltme/değişiklik bilgileri yer almaktadır. [1]

Ürün açısından önemli sonuçlar:

1. 3B model, yapı aplikasyon projesinin eki niteliğindedir.
2. Onaylı mimari proje ve ilgili resmî süreç verileri esas alınmalıdır.
3. Model, yapı ruhsatı düzenlemeye yetkili kurum üzerinden güvenli elektronik ortamda tapu müdürlüğüne gönderilen iş akışının parçasıdır.
4. Aynı parselde birden fazla yapı bulunması hâlinde genel kural her yapı için ayrı modeldir; Genelge'de ortak zemin/taban veya ortak ruhsat gibi durumlar için özel istisnalar yer alır.
5. Kadastro kontrolünde TUREF, arşiv koordinat uyumu ve gerekiyorsa imzalı/onaylı dönüşüm parametreleri önemlidir.
6. Modelden oluşturulan TIC/Yapı Özet Formu verileri, Yapı Aplikasyon Projesi ile koordinat, kot, oturum, alan ve parseldeki konum bakımından karşılaştırılır.
7. Modeli üreten yazılım, resmî kontrol, onay, yetki ve imza sorumluluğunu ortadan kaldırmaz.

Bu nedenle programın proje kartı, “hangi yapı/ruhsat/bağımsız bölüm ve hangi onaylı mimari proje esas alındı?” sorusuna cevap verecek bir iz kaydı taşımalıdır. [1]

### 5.2 634 sayılı Kat Mülkiyeti Kanunu

Genelge, 634 sayılı Kat Mülkiyeti Kanunu'nun 12 ve 14. maddelerini dayanakları arasında göstermektedir. Bu çerçevede 3B model; bağımsız bölüm, eklenti, ortak yer, arsa payı, numara ve proje ilişkilerini gelişigüzel üretmemeli, onaylı mimari proje ve kat mülkiyeti beyanlarıyla tutarlı olmalıdır. [1]

Uygulamadaki karşılığı:

- Bağımsız bölüm numarası ve blok/giriş bilgileri, çizimden bağımsız bir kayıt olarak tutulmalı.
- Arsa payı pay/payda olarak saklanmalı; toplam/payda kontrolü ve beyan listesi karşılaştırması yapılmalı.
- Eklentiler ve ortak alanlar mülkiyet ilişkilerinden ayrı ele alınmalı.
- Dubleks/çok katlı bağımsız bölümün tek mülkiyet birimi ile katlara yayılan geometrik parçaları birbirine karıştırılmamalı.

### 5.3 3194 sayılı İmar Kanunu ve onaylı proje ilişkisi

2026 tarihli dijital proje yönetmelikleri 3194 sayılı İmar Kanunu kapsamındaki yapı ruhsatı ve proje teslim işlemlerini esas almaktadır. 3B bina modelinin kaynağı, serbest elle çizilmiş varsayımsal bir yapı değil; ilgili işlemde geçerli olan onaylı proje ve yetkili teknik veriler olmalıdır. [5][6]

### 5.4 2026 tarihli dijital mimarlık/mühendislik proje yönetmelikleri — ileriye dönük tasarım etkisi

5 Ağustos 2026 tarihli ve 33331 sayılı Resmî Gazete'de iki ayrı yönetmelik yayımlanmıştır:

- **Mimarlık ve Mühendislik Projelerinin Dijital Olarak Hazırlanması Hakkında Yönetmelik:** 1 Eylül 2027 tarihinde yürürlüğe girer. 3B sayısal yapı modellerinin BIM tabanlı hazırlanmasını ve IFC formatında teslimini düzenler. 2B proje çizim dosyaları için PDF/A hükümleri de yer alır. Yönetmelik, belirli istisnalar ve kademeli geçiş takvimi içerir. [5][8]
- **Mimarlık ve Mühendislik Projelerinin Elektronik Ortamda Teslimi ve Yönetilmesi Hakkında Yönetmelik:** 1 Eylül 2028 tarihinde yürürlüğe girer; kapsadığı proje işlemlerinin e-PYS üzerinden teslim, inceleme, onay ve saklanması süreçlerini düzenler. [6][8]

Bu iki düzenleme, TKGM CityGML profiliyle aynı şey değildir. **IFC, BIM ve yapı ruhsatı/proje teslimi için; TKGM CityGML ise tapu/kadastro işleminde 3B sayısal yapı modelinin özel profilidir.** Birinin yerine diğerini koymak doğru olmaz.

**Stratejik öneri:** Uygulamanın iç veri modeli, ileride IFC çıktısına dönüşebilecek kadar disiplinli kurulmalı; ancak ilk sürümün kabul kriteri TKGM CityGML üretimi olmalıdır. IFC desteği ikinci ana ürün fazı olarak tasarlanabilir.

### 5.5 Büyük Ölçekli Harita ve Harita Bilgileri Üretim Yönetmeliği

2018 tarihli Yönetmeliğin 4 Ekim 2025'te yayımlanan değişiklikle güncellenen 1. maddesi, TUREF tabanlı koordinatların ve güncel Türkiye Jeoit Modeli'ne dayalı ortometrik yüksekliklerin kullanılmasını düzenlemektedir. [4]

Bunun yazılım gereksinimi, sadece ekranda `EPSG:525x` seçeneği göstermek değildir. Kaynak koordinat sistemi, düşey referans, jeoit/datum bilgisi, dönüşüm yöntemi, ölçü epoğu ve resmi dönüşüm parametreleri proje metadata'sında izlenebilir olmalıdır.

### 5.6 Yetki ve sorumluluk sınırı

Genelgeye göre model; onaylı mimari proje ve yapı aplikasyon projesiyle uyumlu olmalı, yetkili kurum/kadastro/tapu iş akışında kontrol edilmelidir. Bu yazılım:

- mimari proje müellifinin imzasını,
- harita mühendisinin aplikasyon/koordinat sorumluluğunu,
- ruhsat vermeye yetkili idarenin onayını,
- kadastro ve tapu müdürlüklerinin kontrolünü

ikame etmemelidir. Kullanıcı arayüzünde “TKGM tarafından onaylandı” gibi bir sonuç yalnızca gerçek resmî sistem doğrulama kodu ve doğrulanabilir belge varsa gösterilmelidir. [1]

---

## 6. Önerdiğim ürün: Windows TKGM 3B Bina Modelleme ve GML Stüdyosu

### 6.1 Ürünün sınırı

İlk sürümün hedefi, tüm mimari/BIM disiplinlerini (statik, mekanik, elektrik, metraj, keşif vb.) kapsayan tam bir Revit alternatifi olmak değildir. Hedef; kat mülkiyeti/irtifakı süreci için gerekli TKGM 3B modelini üretmeye odaklanan, hassas 2B/3B geometri ve mülkiyet semantiği bulunan bir mühendislik aracıdır.

Kullanıcı, mimari planı sıfırdan çizmek zorunda kalmadan DXF veya mevcut GML üzerinden başlayabilmeli; eksik bilgileri uygulama içinde tamamlayabilmeli; modeli 2B ve 3B kontrol ettikten sonra GML çıktısı alabilmelidir.

### 6.2 Kullanıcı iş akışı

1. **Proje aç:** İl/ilçe/mahalle, ada/parsel, yapı kimliği, yapı/ruhsat bilgileri ve proje sürümü.
2. **Koordinat ve kot tanımla:** TUREF dilimi, kaynak sistem, düşey datum, aplikasyon kontrol noktaları ve gerekiyorsa resmî dönüşüm parametreleri.
3. **Altlık içe aktar:** DXF/DWG (destek kapsamına göre), KML, mevcut GML, CSV/Excel Liste Beyan, taranmış plan görseli.
4. **2B katları oluştur:** Dış sınır, bağımsız bölüm, kısım/oda, ortak alan, balkon/teras ve gerekiyorsa eklenti geometrilerini çiz veya düzenle.
5. **Kat/kot bilgilerini tanımla:** Kat numarası, kat taban kotu, döşeme kalınlığı, kat yüksekliği, zemin altı/üstü sayısı.
6. **Mülkiyet verisini bağla:** BB no, blok, giriş, nitelik, eklenti, arsa payı, net/brüt alan, MAKS/TAKBİS alanları ve beyan listesi bilgileri.
7. **Açıklıkları ekle:** Kapı/pencere nesnelerini ilgili duvarlara ve odalara iliştir; mimari proje ölçülerini kullan.
8. **3B üret ve incele:** LoD0, LoD1, LoD2, LoD4 katmanlarını ayrı ayrı aç/kapat; kesit, patlatılmış kat görünümü ve hata vurgusu.
9. **Doğrula:** Şema, kod listesi, semantik, topoloji, yükseklik, alan ve proje uyumu kontrollerini çalıştır.
10. **GML üret:** `M-<YapıID>.gml` dosyası ve beraberinde doğrulama raporu/proje arşivi.
11. **Resmî sistemde doğrula:** Kullanıcı GML'yi TKGM'nin ilgili resmî doğrulama uygulamasına yükler; program sonuç kodunu kendiliğinden varmış gibi göstermemelidir.

### 6.3 Arayüz tasarımı

Önerim, taslaklardaki çift görünüm yaklaşımını korumak; fakat arayüzü üç sabit bölgeye indirgemektir:

- **Sol:** Proje ağacı ve katmanlar. Bina, katlar, BB'ler, kısımlar/odalar, ortak alanlar, balkonlar, açıklıklar.
- **Orta:** Sekmeli veya bölünebilir 2B/3B çalışma alanı. 2B çizim görünümü ile 3B model görünümü eşzamanlı çalışır. Kullanıcı isterse bir görünümü tam ekran yapabilir.
- **Sağ:** Seçilen nesnenin özellikleri. Geometri, mülkiyet ilişkisi, kod listesi alanları, kaynak dosya referansı ve hesaplanan değerler.
- **Alt panel:** Doğrulama bulguları. Hata, uyarı, bilgilendirme ve çevrimiçi kontrol gerektiren durumlar ayrı gösterilir.

2B CAD tarafında mutlaka bulunması gerekenler: köşe/kenar/orta nokta snap, diklik, paralellik, ölçülü çizim, koordinat girişi, alan/çevre, katman görünürlüğü, kopyala/taşı/döndür, undo/redo, çoklu seçim, kesişim ve boşluk uyarıları.

3B tarafta: perspektif/ortografik kamera, kat patlatma, katman izolasyonu, kesit düzlemi, transparan kabuk, oda/BB seçimi, yüzey normal yönü görünümü, koordinat/kot sorgusu ve 3B hata işaretleri.

### 6.4 Nesne/veri modeli

Merkezde tek bir veri modeli olmalı; 2B görünüm, 3B görünüm, alan/hacim hesapları ve GML yazıcısı aynı modelden beslenmelidir.

Önerilen çekirdek varlıklar:

- `Project`: proje kimliği, idari bilgiler, ruhsat/onay bilgileri, kaynak belgeler, sürüm.
- `SpatialReference`: yatay CRS, EPSG, düşey datum, koordinat eksen sırası, birim, dönüşüm parametreleri ve kontrol noktaları.
- `Building`: `constructionID`, TAKBİS/MAKS bağları, bina özellikleri, bina zarfı ve modelleme profili.
- `Storey`: kat numarası/tanımı, zemin altı/üstü sınıfı, kotlar, döşeme kalınlığı, yükseklik.
- `IndependentSection`: mülkiyete konu mantıksal BB kimliği, BB no, blok/giriş, beyan alanları, arsa payı ve alanlar.
- `IndependentSectionPart`: aynı BB'nin farklı katta veya farklı hacimdeki geometrik parçaları.
- `RoomPart`: BBK veya ortak alan türündeki kısım/oda; kullanım kodu, alan ve hacim.
- `CommonArea`: ortak alan geometrisi ve kullanım niteliği.
- `Annex`: eklenti, depo, otopark vb. ve hangi BB'ye ait olduğu.
- `BalconyTerrace`: balkon/teras geometrisi ve mülkiyet ilişkisi.
- `Opening`: kapı/pencere türü, açıklık ölçüsü, kotu, duvarı ve ilişkili mahal.
- `RoomInstallation`: sütun, iç merdiven, asansör gibi odaya dahil edilmeyecek iç yapı nesneleri.
- `Surface`: türetilmiş 3B poligon; yüzey türü, kaynak sınırları, normal yönü, ID ve GML referansları.

**Dubleks/çok katlı BB kuralı:** Bir bağımsız bölümün hukuki/mülkiyet kimliği ile o bölümün her kattaki geometrik parçaları ayrı tutulmalıdır. V3 taslağındaki “kat başına BB parçası” fikri yararlı; fakat her örnekte mülkiyet birimi sayısını artıracak biçimde uygulanmamalıdır. Kullanım kodu ve katlar arası ilişki rehberin ilgili örneğiyle doğrulanmalıdır. [2]

### 6.5 2.5B parametrik geometri yaklaşımı

Başlangıçta her katın bütün yüzeylerini ayrı ayrı çizdirmek yerine, şu girdilerden geometri türetilmelidir:

- kapalı 2B dış sınır ve mülkiyet/oda sınırları,
- duvar kalınlıkları ve duvarın iç/dış niteliği,
- taban/döşeme altı ve üstü kotları,
- tavan/kat yüksekliği,
- kapı/pencere açıklıkları,
- çatı tip ve eğim parametreleri,
- balkon/teras ve parapet geometrileri.

Bu girdilerden 3B yüzeyler ve kapalı hacimler deterministik olarak üretilir. B-Rep veya watertight shell üretiminde zorlanılan özel durumlarda çekirdek geometri kütüphanesi devreye alınabilir. Ancak uygulama, daha ilk sürümde bütün tasarımı tam bir genel amaçlı katı modelleme yazılımına dönüştürmeye çalışmamalıdır.

### 6.6 Geometri motorunda uygulanacak kurallar

- Kapalı ring; ilk ve son nokta eşitliği; eşsiz nokta sayısı; ardışık tekrarların temizlenmesi.
- Öz-kesişim, ters halka yönü, sıfır alanlı poligon ve düzlemsellik kontrolü.
- Komşu BB/oda sınırlarının ortak köşeleri ve kenarları aynı koordinat kaynağından türetilmeli.
- T-kavşaklarda bir yüzeyin kenarına düşen komşu köşe, ilgili kenarda bölme yapılarak her iki tarafta aynı topolojiye bağlanmalı.
- İç/dış kabuklar, normal yönleri, delikler ve açıklık çevreleri tutarlı olmalı.
- Alan ve hacim hesapları raporlanmalı; yuvarlanmış gösterim değeri ile hassas iç hesap değeri birbirinden ayrılmalı.
- 3 ondalık metre çıktı hassasiyeti taslaklarda önerilmiştir; bunun nihai zorunluluğu güncel XSD/örnek GML/portal testiyle kesinleştirilmeli. İç hesapta yalnızca üç ondalığa erken yuvarlama yapılmamalı.

**Milimetre ızgarası notu:** Yerel çizim ve topoloji hesaplarında tam sayı milimetre kullanımı kararlı bir yaklaşımdır. Fakat ölçülmüş TUREF koordinatlarını projeye alırken otomatik yuvarlayıp veri kaybettirmek doğru değildir. Kaynak koordinatlar yüksek hassasiyetle saklanmalı; yerel modelleme ızgarasına dönüşüm kontrollü olmalı; ihracat hassasiyeti profil ayarıyla uygulanmalıdır.

---

## 7. Windows uygulaması için önerdiğim teknik mimari

### 7.1 Tercih: Windows masaüstü öncelikli

İlk ürün olarak PWA + Electron birlikteliği önermiyorum. PWA, tarayıcı izinleri ve yerel dosya erişimi bakımından Windows CAD uygulamasının tüm ihtiyaçlarını tek başına karşılayan bir EXE değildir. Electron ise ayrı bir dağıtım ve bakım katmanı getirir. Aynı anda iki istemci hedeflemek geometri çekirdeğinin geliştirilmesini ve test edilmesini geciktirebilir.

**Önerilen ilk sürüm:** C#/.NET tabanlı Windows masaüstü uygulaması. Windows'a özgü bir kullanıcı deneyimi, çevrimdışı çalışma, yerel dosya erişimi, büyük projelerde daha kontrollü bellek ve süreç yönetimi sağlar.

### 7.2 Önerilen bileşenler

| Katman | Öneri | Kullanım |
|---|---|---|
| Masaüstü kabuğu | C# / .NET + WPF | Pencere, menüler, proje yönetimi, özellik paneli, dosya işlemleri |
| 2B çizim | SkiaSharp veya özel WPF çizim yüzeyi | Kat planı, snap, ölçüm, seçim, katman yönetimi |
| 3B görünüm | Three.js, WebView2 içinde yerel paketlenmiş içerik | Bina/kat/oda, kesit, patlatma ve geometri görselleştirme |
| 2B geometri/topoloji | NetTopologySuite + Clipper2 | Poligon kesişimi, fark/birleşim, alan, ring ve kenar işlemleri |
| CRS/dönüşüm | PROJ tabanlı dönüşüm katmanı | TUREF ve kaynak koordinat dönüşümleri; parametre yönetimi |
| GML/XML | .NET `XmlWriter` + namespace/ID yöneticisi + XSD doğrulayıcı | Kontrollü CityGML/TKGM GML üretimi |
| 3B doğrulama | `val3dity` ayrı işlem/servis olarak | Shell/solid ve 3B topoloji kontrolü |
| Proje saklama | SQLite + proje klasörü | Geometri, nitelik, sürüm geçmişi, kaynak dosya bağlantıları |
| Günlük/rapor | Yapılandırılmış log + HTML/PDF rapor | Hata kaydı, işlem geçmişi, dışa aktarma raporu |

`val3dity`, 3B geometri geçerliliğini kontrol eden ayrı bir araç olarak kullanılmalıdır; TKGM'nin kod listesi, iş kuralı, veritabanı entegrasyonu veya parsel eşleşmesi kontrollerinin yerine geçmez. [7]

### 7.3 GML üreticisi ayrı bir çekirdek olmalı

GML üretimini doğrudan arayüz koduna bağlamamalıyız. Ayrı bir `TKGM CityGML Export Engine` olmalı:

1. Tasarım modelini kontrol eder.
2. İlgili TKGM profil/sürüm paketini yükler.
3. Nesne hiyerarşisini ve ilişkileri kurar.
4. Her geometriye kurala uygun ID üretir.
5. XML namespace ve eleman sırasını şema profiline göre oluşturur.
6. `xlink:href` ve referans bütünlüğünü kontrol eder.
7. XSD doğrulaması yapar.
8. Yerel TKGM kurallarını ve `val3dity` kontrollerini çalıştırır.
9. Son GML ile birlikte kontrol raporu verir.

XML'i string birleştirmeyle üretmek yerine `XmlWriter` veya eşdeğer güvenli XML API'si kullanılmalıdır. Bu, XML kaçış karakterleri, UTF-8, namespace ve eleman sırası hatalarını azaltır.

### 7.4 Eklenti ve lisans stratejisi

Açık kaynak geometri kütüphanelerinin sürümleri, lisansları ve dağıtım yükümlülükleri ayrıca incelenmelidir. Özellikle Open CASCADE gibi daha kapsamlı B-Rep motoru sonradan eklenirse, lisans/dağıtım şartları geliştirmenin parçası olarak kontrol edilmelidir. İlk sürümde NetTopologySuite/Clipper2 ve özel yüzey üretimiyle hedefe ulaşılması mümkünse gereksiz native bağımlılık eklenmemelidir.

---

## 8. Doğrulama motoru: “300+ kural” yerine yönetilebilir ve izlenebilir sistem

Taslaklardaki “300+ TKGM kuralı yerel olarak doğrulanacak” hedefini olduğu gibi kabul etmiyorum. TKGM doğrulama uygulamasındaki kuralların bir kısmı dosya içeriğinden kontrol edilebilir; bir kısmı güncel kod listesi veya resmî örnek gerektirir; bir kısmı ise MAKS/TAKBİS/MEGSİS/parsel verisi gibi dış sistemlere bağlıdır. Rehber kopyası, veritabanı eşleşmesi ve parsel çakışması gibi dosya dışı denetimlere de işaret ediyor. [3]

Bunun yerine her kuralı kaynağı, sürümü ve uygulanabilirliği ile tanımlayan bir kural kataloğu öneriyorum.

### 8.1 Dört kontrol sınıfı

**A. XML ve şema kontrolleri**

- XML iyi biçimlenmiş mi?
- UTF-8 kodlama, namespace ve XSD uygun mu?
- Beklenen `CityModel`, `cityObjectMember` ve nesne sayıları doğru mu?
- `gml:id` tekil mi, `xlink:href` hedefleri var mı?
- `srsName`, `srsDimension` ve zarf tanımı profile uygun mu?
- Dosya adı `M-<YapıID>.gml` ile uyumlu mu?

**B. TKGM semantik/kod listesi kontrolleri**

- Sınıf, `gml:name`, ID ön eki ve nesne ilişkisi doğru mu?
- Tüm zorunlu öznitelikler mevcut mu?
- Kod listesi değeri doğru nesne sınıfına mı uygulanmış?
- BB, BBK, OA, balkon/teras, kapı/pencere ilişkileri tutarlı mı?
- Bağımsız bölüm ve kat sayıları/üyelikleri uyumlu mu?
- MAKS/TAKBİS alanları doğru kaynaktan mı gelmiş, yoksa kullanıcı tarafından henüz girilmemiş mi?

**C. Geometri ve topoloji kontrolleri**

- Ring kapanışı, öz-kesişim, düzlemsellik, normal yönü.
- Yüzeyler arasında açıklık/çakışma, T-kavşak ve kenar eşleşmesi.
- Shell kapalılığı, solid kesişimi ve non-manifold durumları.
- Alan/hacim, kat kotu, duvar/döşeme ilişkisi.
- TIC aralıkları, arazi kesişimi ve footprint/roofedge ilişkileri.

**D. Proje ve dış veri kontrolleri**

- Yapı aplikasyon projesi koordinat/kot/oturum/alan/parsel yerleşimiyle karşılaştırma.
- Parsel sınırı yüklüyse parsel içinde kalma/çakışma analizi.
- Liste Beyan ile BB numarası, nitelik, eklenti ve arsa payı karşılaştırması.
- Gerçek MAKS/TAKBİS/MEGSİS verisi gerektiren kontroller.

D sınıfındaki kontrollerde gerekli veri yoksa uygulama “başarılı” dememeli; **“kontrol edilemedi / dış sistem doğrulaması gerekli”** demelidir.

### 8.2 Sonuç statüleri

Her bulgu şu statülerden biriyle gösterilmelidir:

- **HATA:** GML ihracını engelleyen kesin yerel hata.
- **UYARI:** Kullanıcı tarafından gözden geçirilmesi gereken tutarsızlık.
- **BİLGİ:** Hesaplanan veya kullanıcıya hatırlatılan bilgi.
- **DIŞ KONTROL GEREKLİ:** Bu uygulamanın erişemediği resmî veritabanı veya portal kontrolü.
- **DOĞRULANAMADI:** Kuralın resmî sürümü/şema kaynağı henüz teyit edilmemiş.

Her kural satırında şu metadata tutulmalıdır: `ruleId`, açıklama, kaynak belge, kaynak sürümü/tarihi, uygulanma koşulu, hata seviyesi, otomatik düzeltme güven seviyesi ve test örneği.

### 8.3 Otomatik düzeltme sınırları

Otomatik düzeltme yalnızca kayıpsız ve tek anlamlı işlemlerde yapılmalıdır: ardışık aynı noktanın temizlenmesi, ring'in ilk noktasını sona ekleyerek kapatılması gibi. Koordinat kaydırma, alan küçültme, çakışan bağımsız bölüm sınırlarını rastgele kırpma, bina kotunu değiştirme veya mülkiyet ilişkisi uydurma otomatik yapılmamalı; kullanıcı onayı ve işlem günlüğü gerektirmelidir.

---

## 9. İçe aktarma, dışa aktarma ve dosya yönetimi

### 9.1 İçe aktarma

- **GML:** Mevcut TKGM GML'yi açma, ağaçta nesne seçme, 2B/3B görüntüleme, hata bulgularını nesneye bağlama ve kontrollü düzenleme.
- **DXF:** En azından LINE, LWPOLYLINE, POLYLINE, ARC/CIRCLE, layer, block ve birim bilgileri. Bulge/yay içeren polyline'lar gerçek eğri olarak desteklenmeli veya kontrollü segmentasyona çevrilmelidir.
- **DWG:** Doğrudan DWG desteği lisans/SDK bağımlılığı doğurabilir. İlk sürümde DXF güvenilir desteklenmeli; DWG, uygun lisanslı dönüştürücü veya kullanıcı tarafında DXF'e dönüştürme akışı ile ele alınmalı.
- **KML:** WGS84 koordinatları; doğru dönüşüm profiliyle TUREF'e aktarılmalı. KML verisi otomatik olarak yapı kotu kaynağı kabul edilmemeli.
- **CSV/Excel:** Liste Beyan toplu aktarımı, sütun eşleştirme, önizleme, hatalı kayıt raporu ve yinelenen BB numarası kontrolü.
- **Raster plan:** PNG/JPG/TIFF görselini referans altlık olarak ekleme; kontrol noktaları ile ölçekleme/döndürme/ötelenme. Bu dönüşüm, onaylı harita koordinat dönüşümünün yerine geçmemelidir.

### 9.2 Dışa aktarma

İlk sürümün ana çıktısı:

- `M-<YapıID>.gml`
- doğrulama raporu (HTML ve tercihen PDF)
- kullanılan şema/kod listesi sürümü manifestosu
- kaynak proje dosyası ve işlem geçmişi

Kullanıcı yalnızca `.gml` almak istiyorsa tek dosya indirme seçeneği bulunmalı; proje arşivi ayrı seçenek olmalıdır. GML'ye bağlı harici texture/asset dosyaları varsa bunların paketlenme kuralı ayrıca desteklenmelidir.

### 9.3 GML düzenleme ve geri açma

Mevcut GML'yi açıp tekrar kaydetmek, sadece XML metnini yeniden serialize etmekten ibaret olmamalı. Okuyucu; semantik nesneleri, geometrileri, ilişkileri ve referansları proje modeline çevirmeli. Kullanıcı düzenleme yaptıktan sonra ihracat motoru GML'yi yeniden üretmeli. Kaynak dosyayla çıktı arasındaki değişiklikler raporlanmalı.

---

## 10. Test ve kabul stratejisi

Bu tür bir uygulamada en büyük risk, ekranda düzgün görünen modelin TKGM sisteminde reddedilmesidir. Bu nedenle test, arayüzden önce tasarlanmalıdır.

### 10.1 Altın örnek GML paketi

Üçüncü taslak, TKGM'nin altı örnek GML dosyasının (`Ornek1..Ornek6`) kullanıldığını söylüyor. Bu inceleme sırasında bu dosyaların ham XML'leri bağımsız biçimde temin edilip satır satır karşılaştırılamadı. Bunlar uygulamaya başlamadan önce gerçek test girdisi olarak sağlanmalı veya resmî kaynaktan temin edilmelidir.

Her örnek için:

1. GML'yi içeri al.
2. Nesne ağacının beklenen sayısını ve bağlantılarını test et.
3. 2B ve 3B geometrileri çıkar.
4. Hiç değişiklik yapmadan yeniden GML üret.
5. XML sırası/ID'ler farklı olsa dahi semantik ve geometri eşdeğerliğini karşılaştır.
6. XSD, `val3dity` ve TKGM çevrimiçi doğrulama sonucunu kaydet.

### 10.2 Geliştirme boyunca özel senaryolar

- Tek katlı, tek BB'li basit yapı.
- Çok katlı apartman, çoklu BB ve ortak alanlar.
- Dubleks/çok katlı tek BB.
- Bodrum + zemin + normal katlar.
- Çatı arası / eğimli çatı.
- Balkon, teras ve çıkmalar.
- Kapı/pencere açıklığı bulunan dış duvar.
- İç oda, iç oda içinde banyo/kiler gibi alt hacim.
- Kolon, asansör ve iç merdiven gibi `roomInstallation` nesneleri.
- Parsel sınırına yakın veya kotu değişen araziye oturan bina.
- T-kavşak, girintili poligon, delikli poligon, ortak kenar ve farklı kotlar.
- Hatalı veya reddedilmiş GML'yi açma ve düzeltme.

### 10.3 Yayın öncesi kabul kriterleri

- GML XML olarak iyi biçimlenmiş ve hedef XSD'ye uygun.
- Tüm ID'ler tekil, referanslar çözümlenebilir.
- Test paketindeki örnekler açılabilir ve temel semantik bilgileri kaybolmaz.
- 2B/3B görünüm ile GML koordinatları aynı merkezi modelden üretilir.
- Geometri kontrolleri raporlanır; `val3dity` sonuçları saklanır.
- TUREF/CRS/düşey datum ve dönüşüm kaynağı raporda görülebilir.
- Zorunlu kod listeleri güncel profil paketinden gelir.
- Hata durumlarında kullanıcıya hangi nesne/kat/yüzeyde sorun olduğu gösterilir.
- Dış sistem gerektiren kontrol hiçbir zaman yerel “başarılı” olarak işaretlenmez.
- Resmî TKGM doğrulama uygulaması testinde kabul edilmemiş bir sürüm “TKGM uyumlu/garantili” olarak pazarlanmaz.

---

## 11. Geliştirme yol haritası

Aşağıdaki sıra, teknik riskleri erken azaltmak için önerilmiştir. Bu bir süre tahmini değil, bağımlılık sırasıdır.

### Aşama 0 — Şema ve test tabanı

- Güncel resmî rehber, XSD, kod listeleri ve 6 örnek GML'yi toplama.
- Örnek GML/portal sonuçlarıyla `GroundSurface`, `lod2Solid`/`lod2MultiSurface`, `measuredHeight`, BB/BBK geometrySuitability gibi çelişkili maddeleri karara bağlama.
- Test otomasyonunu ilk günden kurma.

**Çıkış koşulu:** GML profili için onaylanmış test referansları ve sürüm manifestosu.

### Aşama 1 — Proje ve koordinat altyapısı

- Windows uygulama kabuğu, proje aç/kaydet.
- TUREF/CRS ve düşey datum metadata'sı.
- Kontrol noktaları, Helmert dönüşüm, artık hata raporu.
- DXF/KML/GML ve raster altlık yükleme.

**Çıkış koşulu:** Bilinen referans noktalı test projesinin doğru koordinatlarla açılması ve kaydedilmesi.

### Aşama 2 — 2B CAD ve mülkiyet veri modeli

- Kat ağacı, snap, poligon çizimi, alan ve ölçü.
- BB, BBK, OA, balkon/teras ve eklenti oluşturma.
- Liste Beyan içe aktarma ve ilişki kontrolü.

**Çıkış koşulu:** Bir örnek kat planının topolojik olarak tutarlı ve BB/oda bilgileri bağlanmış şekilde tamamlanması.

### Aşama 3 — Geometri motoru ve 3B görüntü

- Kat kotları ve döşeme/duvar hacimleri.
- Çatı, balkon, teras, kapı/pencere açıklıkları.
- LoD0/1/2/4 türetimi.
- Kesit, patlatılmış katlar, geometri hata vurgusu.

**Çıkış koşulu:** Referans örneklerde geometri eşdeğerliği ve temel topoloji testleri.

### Aşama 4 — CityGML okuyucu/yazıcı ve yerel doğrulayıcı

- Mevcut GML okuyucu.
- TKGM CityGML 2.0 profilli yazıcı.
- Şema, kod listesi, ID/name ve ilişki denetimi.
- `val3dity` entegrasyonu.
- Kontrol raporu ve otomatik düzeltme güvenlik politikası.

**Çıkış koşulu:** Altın örnek GML paketini okuyup üretme, XSD ve yerel testleri geçme.

### Aşama 5 — TKGM portalı ile saha doğrulaması ve pilot

- Gerçek proje örnekleriyle pilot.
- TKGM resmî doğrulama uygulamasında yükleme/sonuç denemeleri.
- Ret mesajlarını kural kataloğuna ekleme.
- Sürüm ve kod listesi güncelleme mekanizması.

**Çıkış koşulu:** Pilot projelerde hata kodlarının anlaşılır biçimde açıklanması ve kabul oranının ölçülmesi.

### Aşama 6 — İleri geliştirmeler

- IFC dışa aktarma profili.
- DWG için lisanslı içe aktarma.
- Daha gelişmiş B-Rep çekirdeği.
- Çok bloklu/ortak tabanlı özel model senaryoları.
- Kurum içi şablonlar ve ekip/proje paylaşım özellikleri.

---

## 12. Kodlamaya başlamadan önce kapatılması gereken teknik kararlar

Aşağıdaki başlıklar “sonra bakarız” diye bırakılmamalıdır; yanlış kararlar GML motorunun yeniden yazılmasına neden olabilir.

| No | Açık konu | Şu anki durum | Uygulamadan önce gereken kanıt |
|---:|---|---|---|
| 1 | TKGM CityGML 2.0 profilinin güncel XSD ve GML namespace sürümü | Taslaklarda GML 3.1.1 ve CityGML 2.0 deniyor | Resmî XSD + kabul edilmiş örnek XML |
| 2 | `lod2MultiSurface` / `lod2Solid` hiyerarşisi | Erişilebilir rehber kopyasında ikisine dair ifadeler var | 6 örnek GML ve canlı doğrulama |
| 3 | `measuredHeight` yazılacak mı? | V3 yok diyor; hata tablosu varlığını ve geometrik eşitliğini denetliyor | Resmî örnek XML + XSD + portal testi |
| 4 | `GroundSurface` hangi bina tiplerinde var/yok? | Rehber tanımında var; hata tablosunda mimari bina için yok diyor | Örnek GML senaryoları ve resmî hata mesajı |
| 5 | BB ve BBK `geometrySuitability` kodları | Rehber kopyasının tablo, codelist ve XML örneklerinde uyuşmazlık var | Güncel resmî XML kod listeleri + portal testi |
| 6 | BB/BBK/kat yüzey ID önekleri ve min. yüzey sayıları | Nesneye göre ayrıştırılmalı; örnek ve validator metinleri çapraz kontrol edilmeli | Orijinal örnek GML + güncel hata tablosu |
| 7 | Koordinat çıktı hassasiyeti | Taslaklarda 3 ondalık metre | Resmî örnek GML, XSD ve validator testi |
| 8 | TIC 30 cm örnekleme | Rehber hata tablosunda mevcut | Güncel resmî rehber/portal kontrolü; algoritma ve köşe koruma |
| 9 | Blok/çoklu giriş/çok blok model ayrımı | Genelge özel senaryolar içeriyor | Her senaryo için örnek GML/iş akışı |
| 10 | Kapı/pencere çoklu geometri temsili | Tek kaynaklı nesneden üretim öneriliyor | Resmî örnek GML ve nesne ilişkisi |
| 11 | MAKS/TAKBİS alanlarının hangi safhada boş/gerçek veri olması | Taslaklarda kilitli sabitler var | Güncel kod listesi ve işlem aşamasına göre alan matrisi |
| 12 | DWG içe aktarma | Kütüphane/lisans seçimi açık | Kullanım ve dağıtım lisansı |

Özellikle 3–6 numaralı kararlar netleşmeden “GML motoru tamam” denmemelidir.

---

## 13. Nihai tavsiyem

### 13.1 Hangi dosyayı esas almalıyız?

**Üçüncü dosyayı temel alalım; fakat teknik doğrulama bekleyen noktalarını şartnameye dönüştürmeyelim.** İlk dosyadaki genel CAD/2B-3B deneyimi ve ikinci dosyadaki LoD/CityGML çerçevesi, üçüncü dosyanın parametrik veri modeline entegre edilsin.

### 13.2 Neleri ilk sürüme koymalıyız?

1. Windows masaüstü uygulaması.
2. Proje ve koordinat sihirbazı.
3. DXF/KML/GML içe aktarma; raster altlık.
4. 2B kat planı ve snap/ölçü/alan araçları.
5. Kat, BB, BBK, ortak alan, balkon/teras, eklenti ve açıklık tanımları.
6. Liste Beyan Excel/CSV aktarımı.
7. 3B görünüm ve LoD0/1/2/4 geometrilerinin üretilmesi.
8. TKGM GML dışa aktarma ve mevcut GML'yi düzeltme.
9. Şema + semantik + topoloji + `val3dity` doğrulama raporu.
10. Kaynak ve dönüşüm iz kaydı.

### 13.3 Neleri sonraya bırakmalıyız?

- PWA sürümü.
- Genel amaçlı BIM/IFC editörü ve tüm disiplinler.
- Tam kapsamlı DWG yazma/düzenleme motoru.
- Gelişmiş B-Rep/katı modelleme araçlarının tamamı.
- TKGM iç sistemlerine otomatik API bağlantısı (erişim ve yetki belgelenmeden).

### 13.4 Gerçekçi başarı ölçüsü

Uygulamanın başarısı, “3B bina ekranda güzel görünüyor” değildir. Başarı ölçüsü şudur:

- Onaylı mimari proje ve yapı aplikasyon projesinden gelen veriyi kaybetmeden modele aktarıyor mu?
- BB/BBK/ortak alan ve diğer nesneleri doğru ilişkilendiriyor mu?
- Koordinat ve kotları denetlenebilir biçimde koruyor mu?
- GML'yi güncel TKGM profiline göre üretiyor mu?
- Hata bulgularını doğru nesne üzerinde gösteriyor mu?
- Yerel kontrol ile resmî portal kontrolünü birbirinden ayırıyor mu?
- Üretilen dosya gerçek TKGM doğrulama uygulamasında test edildiğinde kabul alıyor mu?

**Sonuç:** Bu uygulama yapılabilir; ancak ana zorluk arayüz değil, TKGM GML profilinin ayrıntıları ve topolojik olarak sağlam geometri üretimidir. Bu nedenle geliştirme sırası önce resmî örnekler/şema/kurallar, sonra geometri çekirdeği, sonra CAD arayüzü olacak biçimde planlanmalıdır. Taslaklardaki tüm özellikleri bir anda yapmak yerine, önce tek bloklu ve ortak taban olmayan yapı senaryosunda güvenilir GML üreten çekirdek oluşturulmalı; sonra dubleks, ortak alan, balkon/teras, açıklık, çok blok ve özel geometriler eklenmelidir.

Bu rapor, uygulama geliştirme onayı veya kodlama başlangıcı değildir. Bir sonraki aşama, bu şartnameye göre uygulamanın ilk çalışan sürümünün kapsamını kilitlemek ve ardından geliştirmeye başlamaktır.

---

## 14. Kaynaklar

### Kullanıcının sağladığı teknik dosyalar

- **[K1]** `implementation_plan.md` — ilk uygulama planı (LoD3/LoD4, ilk mimari).
- **[K2]** `implementation_plan (1).md` — revize plan (LoD0/1/2/4, CityGML 2.0 yaklaşımı).
- **[K3]** `implementation_plan (2).md` — nihai v3 taslağı (2.5B, B-Rep, Helmert, Liste Beyan, çok katmanlı geometri).

### Dış kaynaklar

1. **TKGM — 2025/2 sayılı “Kat İrtifakı ve Kat Mülkiyeti Tesisi İşlemlerinde Üç Boyutlu Sayısal Yapı Modeli Hk. Genelge” ve 25.02.2026 değişiklik PDF'si:**  
   https://www.tkgm.gov.tr/sites/default/files/2026-02/Kat%20Irtifaki%20ve%20Kat%20Mulkiyeti%20Tesisi%20Islemlerinde%20Uc%20Boyutlu%20Sayisal%20Yapi%20Modeli%20Hk%20Genelge%20Degisiklik.pdf

2. **Dijital Bina Üretim Rehberi — Lider Yazılım / Licad GIS portalında erişilebilen kopya (ikincil kaynak; resmî güncel sürümle teyit edilmeli):**  
   https://portal.lideryazilim.com/books/tkgm-dokumanlari-ve-videolari/page/dijital-bina-uretim-rehberi

3. **3B Bina Doğrulama Uygulaması Hata Kodları — Lider Yazılım / Licad GIS portalında erişilebilen kopya (ikincil kaynak):**  
   https://portal.lideryazilim.com/books/tkgm-dokumanlari-ve-videolari/page/3b-bina-dogrulama-uygulamasi-hata-kodlari

4. **Harita Genel Müdürlüğü — Büyük Ölçekli Harita ve Harita Bilgileri Üretim Yönetmeliği (2018; 2025 değişikliği dahil PDF):**  
   https://www.harita.gov.tr/uploads/files/regulations/buyuk-olcekli-harita-ve-harita-bilgileri-uretim-yonetmeligi-65.pdf

5. **Mimarlık ve Mühendislik Projelerinin Dijital Olarak Hazırlanması Hakkında Yönetmelik — 05.08.2026 tarihli ve 33331 sayılı Resmî Gazete metninin erişilebilir mevzuat kopyası:**  
   https://www.lexpera.com.tr/resmi-gazete/metin/mimarlik-ve-muhendislik-projelerinin-dijital-olarak-hazirlanmasi-hakkinda-yonetmelik-33331

6. **Mimarlık ve Mühendislik Projelerinin Elektronik Ortamda Teslimi ve Yönetilmesi Hakkında Yönetmelik — 05.08.2026 tarihli ve 33331 sayılı Resmî Gazete metninin erişilebilir mevzuat kopyası:**  
   https://www.lexpera.com.tr/resmi-gazete/metin/mimarlik-ve-muhendislik-projelerinin-elektronik-ortamda-teslimi-ve-yonetilmesi-hakkinda-yonetmelik

7. **val3dity — 3B geometri doğrulama hata kodları ve teknik dokümantasyon:**  
   https://github.com/tudelft3d/val3dity/blob/main/docs/errors.rst

8. **TMMOB İnşaat Mühendisleri Odası — 05.08.2026 tarihli dijital proje ve e-PYS yönetmeliklerinin yayımlanmasına ilişkin duyuru:**  
   https://www.imo.org.tr/TR%2C218839/mimarlik-ve-muhendislik-projelerinin-dijital-olarak-hazirlanmasi-hakkinda-yonetmelik-ile-mimarlik-ve-muhendislik-projelerinin-elektronik-ortamda-teslimi-ve-yonetilmesi-hakkinda-yonetmelik-yayimlandi.html

9. **TKGM — Gelecek Odaklı Projeler / Taşınmaz Yönetim Bilgi Sistemi:**  
   https://tkgm.gov.tr/projeler/gelecek-odakli-projeler/tasinmaz-yonetim-bilgi-sistemi

10. **TKGM CBS Sürdürülebilirlik (kullanıcının verdiği portal):**  
    https://cbs.tkgm.gov.tr/surdurulebilirlik/

11. **TKGM Dijital Bina (kullanıcının verdiği portal):**  
    https://dijitalbina.tkgm.gov.tr/

---

**Belge sonu — 7 Kasım 2026**
