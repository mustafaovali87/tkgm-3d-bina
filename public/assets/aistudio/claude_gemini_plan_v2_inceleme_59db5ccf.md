# Gemini "Birleşik Uygulama Planı (Rehber v3.0.3 Uyumlu)" — Kaynak Temelli Ayrıntılı İnceleme, Sorunlar ve Çözümler

> **Bu belge kimin için:** Gemini (plan yazarı) ve proje sahibi.
> **Amaç:** Gemini'nin ikinci planını, TKGM'nin **kendi yayımladığı birincil kaynaklarla** satır satır karşılaştırmak; her sorunu kanıtıyla göstermek ve somut çözümünü yazmak.
> **Kural:** Bu belgedeki her teknik iddia aşağıdaki etiketlerden biriyle kaynağa bağlanmıştır. Etiketsiz tahmin yoktur; tahmin olan yerler açıkça "öneri" veya "doğrulanmalı" diye işaretlenmiştir.

---

## 0. Neyi, Nasıl İnceledim (Kanıt Tabanı)

| Etiket | Kaynak | Ne yaptım |
|---|---|---|
| **[REHBER]** | `https://cbs.tkgm.gov.tr/surdurulebilirlik/` — Dijital Bina Üretim Rehberi ver. 3.0.3 | Sayfanın HTML'ini indirip düz metne çevirdim (3.161 satır) ve **baştan sona okudum**: üretim kuralları, TKGMCityGML bölümü, kod listesi tabloları, sürüm notları, S.S.S. |
| **[HATA-TABLOSU]** | Aynı sayfadaki "Hata ve Çözüm Önerileri" tablosu | Otomatik doğrulamanın mesajlarının **tamamını** okudum (yaklaşık 300 mesaj, val3dity kodları -101…-999 dahil). |
| **[ÖRNEK-n]** | TKGM'nin resmi örnek dosyaları `.../surdurulebilirlik/data/OrnekN-M-*.gml` (6 adet, toplam ~79 MB) | Altısını da indirdim. Akış tabanlı bir XML ayrıştırıcıyla her elemanı, her `gml:id` önekini, her `bldg:class` değerini, her generic özniteliği, koordinat hane sayılarını, TIC nokta aralıklarını ve kat/bağımsız bölüm geometrilerinin kapanma biçimini **ölçtüm**. Ornek6 ve Ornek2'nin ilgili bölümlerini ham XML olarak okudum. |
| **[KODLİST]** | `http://cbs.tkgm.gov.tr/3d/schema/1.0/*CodeList.xml` (14 dosya) | Hepsini indirip içeriklerini okudum. |

Örnek dosyaların içeriği:
- Ornek1: tek bloklu apartman
- Ornek2: çatı aralı apartman
- Ornek3: çok bloklu rezidans
- Ornek4: dubleks ticari
- Ornek5: zemin kattan bitişik yapı
- Ornek6: villa

**Önemli ilke:** Rehberin metni, hata tablosu ve örnek dosyalar bazı yerlerde **birbiriyle çelişiyor** (Bölüm 4'te tek tek listeledim). Bu durumda önerdiğim karar sırası:
1. TKGM'nin doğrulamadan geçmiş olarak yayımladığı **örnek GML'ler**
2. **Hata tablosu** (doğrulayıcının gerçekte kontrol ettikleri)
3. **Kod listesi XML'leri**
4. Rehberin düz metni

Gerekçe: örnekler doğrulayıcıdan geçmiş somut çıktılardır. Rehber metninde ise eski kalmış ve yazım hatası içeren yerler var (örneğin kod listesi tablosunda "Elektrik Merkezivalet", "Kalorifer Daires").

---

## 1. Genel Hüküm

Gemini'nin ikinci planı ilkine göre belirgin biçimde iyileşmiş:
- LoD3 kaldırılmış.
- LoD0/1/2/4 eklenmiş.
- CityGML 2.0 sınıflarına geçilmiş.
- ID önekleri, `M-<YapıID>.gml` adı ve "srsName sadece zarfta" kuralı doğru yazılmış.

**Ancak plan hâlâ dosyanın doğrulamadan geçmesini engelleyecek düzeyde eksik ve hatalı.** En ağır sorunlar şunlar:

1. **Geometri modeli yanlış.** Plan, bağımsız bölümü, katı ve balkonu "2B poligonu yükselt" mantığıyla kuruyor. Örnek dosyalar ve hata tablosu ise başka bir yapı gerektiriyor:
   - kalın döşeme (taban kalınlığı)
   - kalın duvar
   - pencere ve kapı boşluklarının duvarı delip geçen yan yüzeyleri (söve/lento yüzeyleri)
   - üstü açık bağımsız bölüm kabuğu
   - üstü açık kat kabuğu
   - kapalı oda kabukları

   Bu, uygulamanın çekirdeğidir ve planda hiç yok.
2. **Öznitelik adları ve yerleri yanlış.** Bağımsız bölüm için `shareOfLand`, `planArea`, `calculatedArea`, `cardinalDirection` yazılmış. Gerçek adlar `propertyLot`, `independentSectionPlanNetArea`, `independentSectionPlanGrossArea`, `independentSectionCalculatedArea`, `independentSectionCardinalDirection`. Doğrulayıcı, listede olmayan özniteliği **hata** sayıyor.
3. **"Oda" ile "Bağımsız Bölüm Kısım" iki ayrı katman yapılmış.** Gerçekte ikisi **aynı nesne** (`bldg:Room`, sınıf `BagimsizBolumKisim`, önek `BBK_`). Plan uygulanırsa her oda iki kez üretilir.
4. **Zorunlu nesneler eksik:**
   - Mimari Bina Grup (`MBG_`)
   - Ortak Alan İç Yapı / Kısım İç Yapı (`OAIY_` / `BBKIY_`)
   - ortak alanın `commonAreaUsage` ve `storeyObjectReference` öznitelikleri
   - odaların `independentSectionObjectReference` ve `volume` öznitelikleri
5. **LoD0 RoofEdge, TIC ve 1006 kodu konusunda hatalı kararlar:**
   - RoofEdge "çatının dış sınırından" üretilmez.
   - TIC'in 30 cm'de bir noktaya bölünmesi örneklerle çelişiyor.
   - 1006 kodu bağımsız bölüm kod listesinde **yok**.
6. **Koordinatları 3 haneye yuvarlamanın yan etkisi düşünülmemiş.** Yuvarlama, komşu yüzeylerin köşelerini ayırıp kabuk kapanmasını bozabilir. Çözüm: iç hesaplarda milimetre tamsayı ızgarası.
7. **"%100 kalibre" iddiası doğru değil.** Doğrulayıcının önemli bir kısmı çevrimiçi veritabanı kontrolü yapıyor (MEGSİS parsel geometrisi, TAKBİS, MAKS, BuildingService çakışması). Bunlar yerelde taklit edilemez.

Aşağıda her maddenin kanıtı ve çözümü var.

---

## 2. Doğrulanmış Referans Yapı (Örneklerden Çıkarılan "Doğru Cevap")

Gemini'nin dosya üreticisini bu iskelete göre kurması gerekir. İskelet, Ornek6 ve Ornek2'nin ham XML'inden birebir çıkarılmıştır. Değerler örnektir, yapı bağlayıcıdır.

### 2.1 Kök ve ad alanları [ÖRNEK-1..6]

```xml
<?xml version="1.0" encoding="utf-8"?>
<core:CityModel xmlns="http://www.opengis.net/citygml/2.0"
  xmlns:core="http://www.opengis.net/citygml/2.0"
  xmlns:gml="http://www.opengis.net/gml"                      <!-- GML 3.1.1 ad alanı. 3.2 DEĞİL -->
  xmlns:grp="http://www.opengis.net/citygml/cityobjectgroup/2.0"
  xmlns:gen="http://www.opengis.net/citygml/generics/2.0"
  xmlns:bldg="http://www.opengis.net/citygml/building/2.0"
  xmlns:app="http://www.opengis.net/citygml/appearance/2.0"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="... citygml 2.0 xsd'leri ...">
  <gml:boundedBy>
    <gml:Envelope srsDimension="3" srsName="EPSG:5254">   <!-- dosyadaki TEK srsName -->
      <gml:lowerCorner>x y z</gml:lowerCorner>
      <gml:upperCorner>x y z</gml:upperCorner>
    </gml:Envelope>
  </gml:boundedBy>
  <core:cityObjectMember> <bldg:Building gml:id="MB_..."> ... </bldg:Building> </core:cityObjectMember>
  <core:cityObjectMember> <grp:CityObjectGroup gml:id="K_..."> ... </grp:CityObjectGroup> </core:cityObjectMember>   <!-- her kat için -->
  <core:cityObjectMember> <gen:GenericCityObject gml:id="BB_..."> ... </gen:GenericCityObject> </core:cityObjectMember> <!-- her BB-kat parçası için -->
  <core:cityObjectMember> <grp:CityObjectGroup gml:id="MBG_..."> ... </grp:CityObjectGroup> </core:cityObjectMember>  <!-- en sonda, 1 adet -->
</core:CityModel>
```

Kanıtlar:
- 6 örneğin hepsinde `srsName` dosyada yalnızca 1 kez geçiyor.
- [HATA-TABLOSU]: "Poligonlar SrsName değerine sahip olmamalıdır." ve "MultiSurfacelar SrsName değerine sahip olmamalıdır."
- [HATA-TABLOSU]: "Gml dosyası versiyonu desteklenmiyor (v3 desteklenmez) -904". Ad alanı `http://www.opengis.net/gml/3.2` kullanılırsa dosya baştan reddedilir.

### 2.2 `bldg:Building` (Mimari Bina) içi sıra [ÖRNEK-6]

1. `gml:name` → `Mimari Bina_<constructionID>`
2. `gen:*Attribute` öznitelikleri (bkz. 3.4)
3. `bldg:class` → `MimariBina`
4. `bldg:storeysAboveGround`, `bldg:storeysBelowGround`. Bunlar **`bldg:` elemanlarıdır, `gen:` özniteliği değildir.**
5. `bldg:lod0FootPrint` → `gml:MultiSurface` → `Polygon id="Lod0FootPrint_…"`
6. `bldg:lod0RoofEdge` → `gml:MultiSurface` → `Polygon id="Lod0RoofEdge_…"`
7. `bldg:lod1Solid` → `gml:CompositeSolid` → `gml:solidMember` → `gml:Solid` → `gml:exterior` → `gml:CompositeSurface` → `gml:surfaceMember` → `Polygon id="Lod1Poligon_…"`. Bu poligonlar **satır içi** yazılır, xlink kullanılmaz.
8. `bldg:lod2MultiSurface` → `gml:MultiSurface`. İçinde boundedBy'daki tüm Roof_/Wall_/Ground_ poligonlarına `surfaceMember xlink:href="#…"` referansları bulunur.
9. `bldg:lod2TerrainIntersection` → `gml:MultiCurve` → `gml:curveMember` → `gml:LineString` → `gml:posList`
10. `bldg:outerBuildingInstallation` → `bldg:BuildingInstallation gml:id="BLKN_…"` veya `"TRS_…"` (her balkon/teras için)
11. `bldg:boundedBy` → `bldg:RoofSurface` (**1 adet**, içinde çok sayıda Roof_ poligonu)
12. `bldg:boundedBy` → `bldg:GroundSurface` (1 adet)
13. `bldg:boundedBy` → `bldg:WallSurface` (dış duvar yüzeyi başına 1 adet). İçinde `bldg:lod2MultiSurface` ve `bldg:opening` → `bldg:Door` / `bldg:Window` bulunur.
14. `bldg:boundedBy` → `bldg:OuterFloorSurface` / `bldg:OuterCeilingSurface` (varsa)
15. `bldg:interiorRoom` → `bldg:Room gml:id="BBK_…"` (bağımsız bölüm kısmı) veya `"OA_…"` (ortak alan)

### 2.3 Örneklerde ölçülen nesne sayıları (tutarlılık kanıtı)

| Örnek | BB (GenericCityObject) | BBK (Room) | OA (Room) | BBKIY | OAIY | Balkon | Teras | Kat | MBG |
|---|---|---|---|---|---|---|---|---|---|
| Ornek6 (villa) | 2 | 16 | 0 | 0 | 0 | 4 | 0 | 2 | 1 |
| Ornek2 (çatı aralı apt.) | 17 | 42 | 8 | 9 | 1 | 12 | 0 | 4 | 1 |
| Ornek4 (dubleks ticari) | 26 | 128 | 10 | 8 | 0 | 0 | 0 | 3 | 1 |
| Ornek5 (zemin bitişik) | 27 | 83 | 16 | 11 | 4 | 10 | 0 | 6 | 1 |
| Ornek3 (çok bloklu) | 181 | 893 | 74 | 50 | 422 | 108 | 9 | 16 | 1 |

Her örnekte tam 1 RoofSurface, 1 GroundSurface ve 1 MimariBinaGrup var.

---

## 3. Sorunlar ve Çözümler (Madde Madde)

Biçim: **Gemini planında** → **Kaynak ne diyor (kanıt)** → **Etkisi** → **Çözüm**.
Önem dereceleri:
- 🔴 **Kritik:** dosya doğrulamadan geçmez.
- 🟠 **Önemli:** belirli yapı tiplerinde reddedilir, yanlış veri üretir veya kullanılamaz hale gelir.
- 🟡 **İyileştirme:** doğruluk, kullanılabilirlik veya bakım.

---

### A. Veri Modeli ve Nesne Hiyerarşisi

#### A1 🔴 "Oda" ile "Bağımsız Bölüm Kısım" ayrı nesne yapılmış
- **Gemini:** Katman listesinde ayrı ayrı "*Bağımsız Bölüm Kısım (`BBK_`)*" ve "*Oda (`interiorRoom`)*" var. Veri modelinde de ikisi ayrı.
- **Kanıt:**
  - [ÖRNEK-6]: `bldg:Room gml:id="BBK_7e157915-…"`, `gml:name` = `-1_-1_1_Oda`, `bldg:class` = `BagimsizBolumKisim`. Odanın kendisi BBK'dır.
  - [REHBER]: "Bağımsız bölüm kısımlar TKGMCityGML içerisinde **interiorRoom** ile gösterilmelidir."
  - [ÖRNEK-6] istatistik: Room 16 adet, BBK_ önekli id 16 adet; aynı sayı.
- **Etkisi:** Her oda iki kez üretilir. Bağımsız bölüm alanı kısım toplamından küçük kalır ve "Bağımsız Bölüm Çizim Alanı, kısım çizim alanlarının toplamından büyük olmalıdır" hatası çıkar. `partCount` de tutmaz.
- **Çözüm:** Tek bir "Kısım" nesnesi tanımlanmalı. Türü:
  - `BBK` (bağımsız bölüme ait oda; `bldg:Room`, class `BagimsizBolumKisim`)
  - `OA` (ortak alan; `bldg:Room`, class `OrtakAlan`)

  Kısımlar `bldg:Building/bldg:interiorRoom` altına yazılır. Bağımsız bölüme bağlantı içerme ile değil, `independentSectionObjectReference` string özniteliğiyle kurulur.

#### A2 🔴 Mimari Bina Grup (`MBG_`) nesnesi planda yok
- **Gemini:** Hiç geçmiyor.
- **Kanıt:**
  - [REHBER] "Mimari Bina Grup" bölümü: "Mimari projeden üretilen 3B bina, kat, bağımsız bölüm … referanslarını barındırmalıdır."
  - [HATA-TABLOSU]: "Kat referansı, MimariBinaGrup içinde bulunamadı", "Bağımsız bölüm referansı, MimariBinaGrup içinde bulunamadı", "Bina referansı, MimariBinaGrup içinde bulunamadı".
  - [ÖRNEK-1..6]: 6 dosyanın hepsinde 1 adet `grp:CityObjectGroup gml:id="MBG_…"` var. Adı `Mimari Bina Grup_<constructionID>`, `grp:class` = `MimariBinaGrup`. `grp:groupMember` olarak sırasıyla MB, tüm K'ler ve tüm BB'ler xlink ile listeleniyor. Geometrisi ve özniteliği yok.
- **Çözüm:** Dosya yazıcısı son `cityObjectMember` olarak MBG'yi otomatik üretmeli. Kullanıcı bunu hiç görmemeli.

#### A3 🔴 Kat (`K_`) nesnesinin geometrisi, üyeleri ve numaralandırması eksik veya yanlış
- **Gemini:** "`storeyNumber` (`-2`, `-1`, `0`, `1`...)". Kat geometrisi tanımlanmamış.
- **Kanıt:**
  - [ÖRNEK-2,4,5,6]: Zemin kat `storeyNumber` = **`Z`**, adı `Kat_Z`. Bodrumlar `-1`, `-5`, normal katlar `1`, `2` …
  - [REHBER]: Bağımsız bölüm içeren çatı katı için `storeyNumber` = `"CK_ " + EnSonKatNo+1` (projede değer yoksa) veya `"CK_ " + ProjedekiDeğer`. Çatı katında yalnız ortak alan veya eklenti varsa **kat objesi oluşturulmaz**. Dubleksin ikinci katı çatıdaysa kat objesi oluşturulmaz ve ilk katın referansı kullanılır.
  - [REHBER]: "Asma kat bir kat değildir… kat geometrisi gibi TKGMCityGML içerisinde tanımlanmamalıdır."
  - [ÖRNEK-6] geometri analizi: Kat geometrisi (`grp:geometry/gml:MultiSurface`) şunlardan oluşuyor:
    - kat tabanında 1 adet `Floor_` yatay poligon
    - katın dış konturunda `Wall_` dikey poligonlar (kapı/pencere varsa delikli)
    - **tavan yok** (üstü açık kabuk)

    Kat_Z için: 1 Floor (z=1095.9) + 3 deliksiz Wall + 5 delikli Wall. Duvarlar kat tabanından kat tavanına uzanıyor (1095.9 → 1098.7).
  - [HATA-TABLOSU]: "Kat geometrisinde en az 3 tane idsi "Wall_" ile başlayan poligon olmalıdır", "Kat geometrisinde en az 1 tane idsi "Floor_" ile başlayan poligon olmalıdır", "Kat geometrisinde pencereye uygun delik bulunamadı."
  - [ÖRNEK-2,5,6] grup üyeleri: Kat'ın `grp:groupMember` listesinde **yalnız BB** var, OA yok. Bodrum katlarda üye yok (`independentSectionCount=0`, `storeyUsage=1003`).
  - [HATA-TABLOSU]: "GroupMember sayısı ile bağımsız bölüm sayısı eşit olmalıdır." Rehberdeki örnek kod OA'yı da üye gösteriyor; bu çelişki için bkz. Bölüm 4.
  - [HATA-TABLOSU]: "Katın parent değeri binanın IDsine eşit olmalıdır."
- **Çözüm:**
  - `storeyNumber` serbest metin (string) olmalı. Varsayılan öneriler: `Z`, `-1…-n`, `1…n`, `CK_n`.
  - Asma kat "kat" olarak tanımlanamamalı. Arayüz bunu engellemeli ve bunun yerine "Çoklu Kat (1003)" bağımsız bölüm önermeli.
  - Kat geometrisi otomatik üretilmeli: dış kontur tabanı + dış kontur duvarları (kat yüksekliği boyunca, kapı/pencere delikli) + tavansız.
  - `groupMember` = yalnız o kata ait BB parçaları.
  - `independentSectionCount` = o kattaki BB `GenericCityObject` sayısı (bkz. A6).
  - `grp:parent` = `#MB_…`.

#### A4 🔴 Bağımsız Bölüm (`BB_`) öznitelik adları yanlış, bir kısmı eksik
- **Gemini:** `independentSectionUsage`, `cardinalDirection`, `shareOfLand`, `planArea`, `calculatedArea`, `geometrySuitability (1001/1002)`, `integrationState (1004)` …
- **Kanıt: [ÖRNEK-6] satır 9040–9111 ve [REHBER] BB tablosu birebir.** BB'nin gerçek öznitelik kümesi:

| Ad | Tip | Değer kuralı |
|---|---|---|
| `geometrySuitability` | int | **1001** (Uygundur). Alan uyumsuzluğunda 1002. 1006 **değil** (bkz. B1) |
| `integrationState` | int | **1004** |
| `independentSectionNumber` | string | projedeki BB no |
| `blockName` | string | projedeki blok. Yoksa örneklerde `-1` |
| `entrance` | string | projedeki giriş. Yoksa **boş** `<gen:value/>` |
| `takbisPropertyIdentityNumber` | int | **-1** |
| `maksIdentityNumber` | int | MAKS BB kimlik no |
| `maksNumaratajIdentityNumber` | int | MAKS numarataj no |
| `maksIntegrationState` | int | **1003** |
| `registeredQuality` | string | liste beyanındaki nitelik, **aynen** (örn. `MESKEN`, `DÜKKAN`, `DUBLEKS KONUT`) |
| `registeredInstallation` | string | liste beyanındaki eklenti, aynen (boş olabilir) |
| `registeredFloorDefinition` | string | liste beyanındaki kat tanımı, aynen (örn. `Zemin Kat`, `4. Bodrum Kat`) |
| `propertyLot` | string | arsa payı **`pay/payda`** (örn. `1/2`, `4094/1908994`) |
| `additionalNote` | string | isteğe bağlı. Örneklerde `-` |
| `independentSectionCardinalDirection` | int | **tekrarlanabilir**: her cephe için ayrı eleman. Aynı değer iki kez yazılamaz |
| `independentSectionUsage` | int | 1001 Mesken / 1002 Ticari / 1003 Çoklu Kat / 1004 Çatı Arası / 1005 Depo / 1006 Eklenti |
| `partCount` | int | bu BB'ye bağlı kısım (BBK) sayısı |
| `independentSectionPlanNetArea` | double | projedeki net alan, yoksa -1 |
| `independentSectionPlanGrossArea` | double | projedeki brüt alan, yoksa -1 |
| `independentSectionCalculatedArea` | double | çizimden hesaplanan alan |

- [HATA-TABLOSU]: "{...} özelliği proje kapsamında bulunması gereken özelliklerden değil." Yani `shareOfLand` gibi uydurma bir ad doğrudan hata verir.
- [HATA-TABLOSU]: "CardinalDirection aynı değerden birden fazla içeremez."
- [ÖRNEK-6]: Bir BB'de `independentSectionCardinalDirection` 4 kez geçiyor (1001, 1003, 1005, 1007).
- **Çözüm:**
  - Öznitelik adları bir sabit tablodan (şema tanım dosyası) yazdırılmalı, serbest metinle girilmemeli.
  - Cephe bilgisi çoklu seçim olmalı; her seçim ayrı `gen:intAttribute` olarak yazılmalı. 1009 "Kapalı Cephe" diğerleriyle birlikte seçilememeli (öneri).
  - `partCount` ve `independentSectionCalculatedArea` otomatik hesaplanmalı.
  - `registered*` alanları ve `propertyLot` liste beyanından aynen girilmeli. Excel/CSV'den toplu içe aktarma eklenmeli (bkz. F5).

#### A5 🔴 Kısım (`BBK_` Room) öznitelikleri eksik
- **Gemini:** Yalnız `partUsage` ve genel geometri anılıyor.
- **Kanıt: [ÖRNEK-6] satır 3937–3960, [REHBER] BBK tablosu.** Gerçek öznitelik kümesi:
  - `independentSectionObjectReference` (string, `BB_…`; birden fazla BB'ye aitse her biri ayrı değer)
  - `partUsage` (int, partUsage listesi)
  - `geometrySuitability` (int, **1001**)
  - `additionalNote` (string, isteğe bağlı)
  - `planArea` (double, projede yoksa **-1.0**)
  - `calculatedArea` (double)
  - `volume` (double, m³)
- [HATA-TABLOSU] ilgili mesajlar:
  - "Girilen hacim (Volume), geometriden hesaplanan ile eşit değil."
  - "Hacim değeri hesaplanan alandan büyük olmalıdır."
  - "Hesaplanan alan ile geometrik alan uyuşmuyor."
  - "Hesaplanan alan ile plandan gelen alan eşit değil (Tolerans %10)."
  - "Oda yüksekliği 1.5 metreden az olamaz."
  - "Mükerrer kullanım amacı."
- **Çözüm:** `calculatedArea` ve `volume` **geometriden otomatik hesaplanmalı**, kullanıcıya girdirilmemeli. `planArea` kullanıcıdan alınmalı ("yok" seçeneği -1 yazar). %10 sapma anında uyarı olarak gösterilmeli.

#### A6 🔴 Dubleks/çoklu katlı bağımsız bölüm sayımı yanlış kurgulanmış
- **Gemini:** Değinilmiyor.
- **Kanıt:**
  - [ÖRNEK-2]: 17 adet `gen:GenericCityObject` (BB) var. Kat üyeleri 5+4+8 = 17. Ama `totalIndependentSectionCount` = **13**.
  - [ÖRNEK-5]: 27 GenericCityObject, total = **24**.
  - [REHBER]: "Dubleks yapılarda farklı kattaki bağımsız bölüm modelleri için ayrı ayrı belirtilmelidir". Net ve brüt alan her katta aynı toplam değerle tekrarlanır. Çoklu kat parçasında `independentSectionUsage` = 1003.
  - [HATA-TABLOSU]: "Toplam bağımsız bölüm sayısı gmldeki ile uyuşmuyor", "Kat bilgisinde verilen BB sayısı ile gmldeki BB sayısı uyuşmuyor".
- **Sonuç:** Bir dubleks daire, her katı için ayrı bir `GenericCityObject` olarak yazılır. Bunlar aynı `independentSectionNumber`'ı taşır. Sayımlar şöyle:
  - `totalIndependentSectionCount` = **benzersiz BB numarası** sayısı
  - Kat'ın `independentSectionCount`'u = o kattaki **BB parçası** sayısı
- **Çözüm:**
  - Veri modelinde "Bağımsız Bölüm" (mülkiyet birimi) ile "Bağımsız Bölüm Parçası" (kat başına geometri) ayrılmalı.
  - Yazıcı her parçayı ayrı BB_ GUID'iyle yazmalı.
  - Sayımlar otomatik yapılmalı.
  - Hangi parçanın "ana giriş" (1001/1002) hangisinin "Çoklu Kat" (1003) olduğu kullanıcıya sorulmalı.

#### A7 🔴 Ortak Alan (`OA_`) öznitelikleri ve geometri kuralları yok
- **Gemini:** "Ortak Alan (`OA_`)" katman olarak var. Öznitelik ve geometri kuralı yok.
- **Kanıt:**
  - [ÖRNEK-2] OA odası öznitelikleri: `storeyObjectReference` (string, `K_…`; kata bağlanamıyorsa -1), `commonAreaUsage` (int, **partUsage listesinden**, örn. 1022 Niteliksiz Ortak Alan), `calculatedArea`. `geometrySuitability`, `planArea` ve `volume` **yok**.
  - Ad: `<Kullanım Amaç Texti>_Ortak Alan` (örn. `Niteliksiz Ortak Alan_Ortak Alan`).
  - [REHBER]: "Komşu olan niteliksiz ortak alanlar tek parça olarak aktarılmalıdır… Ortak alanlar bir bağımsız bölüm ile ilişkili olmadıkları için **dış duvarları (WallSurface) kısım ile birlikte çizilmelidir**… Çatı katında yer alan niteliksiz ortak alanların üretilmesine gerek yoktur."
  - [ÖRNEK-2]: OA'nın `lod4MultiSurface` referanslarında `InteriorWall_` ile birlikte `Wall_` poligonları da var.
  - [REHBER]: Ortak alandaki merdiven ve asansör ortak alan olarak üretilir; kullanım amacı `commonAreaUsage` ile verilir.
  - [HATA-TABLOSU]: "Ortak alan taban, yan duvar ve tavana sahip olmalıdır", "Ortak alanda en az 1 tane tavan olmalıdır", "Referanslanan kat nesnesi bulunamadı."
- **Çözüm:**
  - OA için ayrı öznitelik şeması tanımlanmalı.
  - Komşu niteliksiz ortak alanları birleştiren bir araç eklenmeli (2B poligon birleşimi).
  - Dış cepheye bakan OA duvarları hem `Wall_` olarak işaretlenmeli hem de OA kabuğuna dahil edilmeli.

#### A8 🟠 Kısım İç Yapı / Ortak Alan İç Yapı (`BBKIY_` / `OAIY_`) yok
- **Gemini:** Hiç yok.
- **Kanıt:**
  - [REHBER]: "Kısım içerisinde yer alan sütun ve merdiven gibi odadan fiziken ayrılamayan… yapılaşmalar kısım geometrisine dahil edilmeden **roomInstallation** olarak … aktarılmalıdır… roomInstallation çiziminde tavan, yan duvarlar ve taban çizilmelidir."
  - [ÖRNEK-2] satır 6655–6689 yapısı: `bldg:Room/bldg:roomInstallation/bldg:IntBuildingInstallation gml:id="BBKIY_…"`, `bldg:class` = `BagimsizBolumKisimIcYapi`, öznitelik `roomInstallationUsage` (1001 Merdiven / 1002 Sütun / 1003 Asansör), geometri `bldg:lod4Geometry` (xlink ile Floor/InteriorWall/Ceiling).
  - Ad: `<blok>_<giriş>_<bbNo>_<kısım kullanım texti>_İç Yapı`. OAIY için `<OA kullanım texti>_İç Yapı`.
  - [HATA-TABLOSU]: "İç yapılardan üst üste binenler var -701".
  - Ornek3'te 422 OAIY ve 50 BBKIY var; büyük yapılarda yaygın.
- **Çözüm:**
  - "İç Yapı" çizim aracı eklenmeli: oda içinde kapalı poligon çizilir, tür seçilir (sütun/merdiven/asansör).
  - Kapalı kabuk otomatik üretilmeli: taban + yan duvarlar + tavan.
  - Odanın taban/tavan poligonu İç Yapı izdüşümü kadar delinmeli veya kesilmeli. **Bu, örneklerle doğrulanmalı**: Ornek2'de oda tabanında iç yapı deliği olup olmadığına bakılmalı.
  - Merdiven kuralı uygulanmalı: duvarla ayrılmış ve m²'si yazılı merdiven **BBK partUsage 1024** olur, duvarsız ve oda içindeki merdiven ise **roomInstallation 1001** olur.

#### A9 🔴 Balkon/Teras yanlış yerde ve yanlış geometriyle tanımlanmış
- **Gemini:** "Balkon (`BLKN_`), Teras (`TRS_`)… `lod4MultiSurface` (… `Floor_`…) geometrileriyle üretilir."
- **Kanıt:**
  - [ÖRNEK-6] satır 368–405: Balkon `bldg:Building/bldg:outerBuildingInstallation/bldg:BuildingInstallation gml:id="BLKN_…"` altında. Geometri **`bldg:lod2Geometry`** (LoD4 değil). İçinde xlink ile `bldg:boundedBy/bldg:FloorSurface` (lod2MultiSurface) ve `bldg:boundedBy/bldg:WallSurface` poligonları var.
  - Balkon tabanı **kapalı bir kutu**: alt yüzey z=1095.9, üst yüzey z=1096.1, artı 4 yan yüzey. 6 poligonun hepsi `Floor_` önekli ve tek bir FloorSurface içinde. Kalınlık 0.20 m, BB taban kalınlığıyla aynı.
  - Korkuluk duvarları kalın (en/boy) prizmalar olarak `Wall_` poligonlarıyla modellenmiş. Üst yüzey z=1097.1 yatay "U" şeklinde.
  - Öznitelikler: `independentSectionObjectReference`, `geometrySuitability` (**1001**), `additionalNote`, `planArea`, `calculatedArea`.
  - Ad: `<blok>_<giriş>_<bbNo>_Balkon` / `_Teras`.
  - [REHBER]:
    - "Balkonların yapı ile ortak olan duvarı aktarılmamalıdır."
    - "Balkon tabanı en dış sınıra kadar uzatılacak, balkon taban kalınlığı ilgili bağımsız bölümün taban kalınlığı ile aynı olmalıdır. Balkonda bulunan iç ve dış duvarlar, balkon tabanı üzerinden başlatılarak çizilmelidir."
    - "Eğer yan duvar yüksekliği projede belirtilmemiş ise 1,10 m alınmalıdır. Balkon yan duvar kalınlığı projede belirtilmedi ise **10 cm** alınmalıdır."
    - "Kavisli balkon… yeterli parçaya bölünerek…"
  - [HATA-TABLOSU]:
    - "Balkonlar yan duvar ve tabanlara sahip olmalıdır."
    - "Balkon zemin kalınlığı çok az."
    - "Balkon ile bağımsız bölüm arasında boşluk var."
    - "Balkon duvarı, bağımsız bölüm duvarından daha uzun olamaz."
    - "Bağımsız bölüm taban kalınlığı ile balkon taban kalınlığı aynı olmalıdır."
    - "Balkon yanduvar kalınlığı en az {...} m olmalıdır."
    - "Sürdürülebilirlik kapsamındaki üretimlerde balkon geometrik uygunluk 1001 olmalıdır."
- **Çözüm:**
  - Balkon/teras ayrı bir nesne türü olmalı.
  - Kullanıcı yalnızca balkonun dış sınırını çizmeli. Program şunları üretmeli:
    1. taban kutusu (BB döşeme kalınlığı)
    2. bina ile ortak kenar hariç diğer kenarlarda kalın korkuluk prizmaları (varsayılan 110 cm yükseklik, 10 cm kalınlık)
    3. FloorSurface ve WallSurface'leri `outerBuildingInstallation` altına yazma
  - Balkon BB kenarına **zorla yapıştırılmalı** (snap kilidi).
  - Teras için `independentSectionObjectReference` = `-1` ve ad `-1_-1_-1_Teras` olmalı ([ÖRNEK-3]'teki 9 terasın hepsi böyle; ayrıca bkz. Bölüm 4, Ç11).

#### A10 🟠 LoD2 dış kabuğunun alt yüzey türleri yanlış anlatılmış
- **Gemini:** "Dış duvarlar (`Wall_`), **tek parça** birleşik zemin (`Ground_`), **tek parça** çatı (`Roof_`)…"
- **Kanıt:**
  - [ÖRNEK-6]: `bldg:RoofSurface` elemanı **1 adet**, ama içinde **66 adet** `Roof_` poligonu var.
  - [REHBER]: "Çatıda yer alan **her bir kırılım için ayrı bir yüzey** oluşturulmalıdır." Dış duvarlar için de: "Dış duvarlarda yer alan her bir kırılım için ayrı bir yüzey oluşturulmalıdır."
  - [ÖRNEK-6]: 56 adet `bldg:WallSurface` elemanı, toplam 450 `Wall_` poligonu. Dış duvarlar **kat kat bölünmüş**: Kat_Z duvarı 1095.9 → 1098.7, Kat_1 duvarı 1098.7 → 1101.5.
  - [HATA-TABLOSU]: "Çatı yüzeyi sadece 1 tane olmalıdır", "Zemin(ground) yüzeyi 1 tane olmalıdır". Bu mesajlar **eleman** sayısını kastediyor, poligon sayısını değil.
- **Çözüm:**
  - 1 RoofSurface elemanı, içinde her düzlemsel çatı yüzü ayrı Roof_ poligonu.
  - 1 GroundSurface.
  - Dış duvarlar her kat ve her cephe kırılımı için ayrı WallSurface (ayrı poligon).
  - Kapı ve pencereler ilgili WallSurface poligonunda delik (`gml:interior`) olarak açılmalı ve aynı WallSurface'in `bldg:opening` öğesinde nesne olarak yazılmalı.

#### A11 🟠 OuterFloor / OuterCeiling kuralları belirsiz
- **Gemini:** "çıkma altları (`OuterFloor_`/`OuterCeiling_`)".
- **Kanıt:**
  - [REHBER]: OuterFloorSurface "yüzey yönü yukarıya bakan kapalı yatay geometriler", yani alt kat çıkıntısının üst yüzeyi. Adı `DışTaban`.
  - Rehber OuterCeiling için de aynı cümleyi kopyalamış. Bu bir metin hatası; mantıken aşağı bakan yüzeydir (çıkma altı). Adı `DışTavan`. [ÖRNEK-3,5]'te OuterCeiling 1 eleman var.
  - Rehberin ID tablosunda OuterCeiling öneki yok. [ÖRNEK-3]'te `OuterCeiling_` kullanılmış.
- **Çözüm:**
  - Kademeli kütlelerde üst kat alt kattan geri çekiliyorsa, açıkta kalan alt kat üst yüzeyi `OuterFloorSurface` olur.
  - Üst kat alt kattan taşıyorsa (çıkma), taşan kısmın alt yüzeyi `OuterCeilingSurface` olur.
  - Önek `OuterCeiling_`. Yönelim örneklerden doğrulanmalı.

---

### B. Kod Değerleri

#### B1 🔴 Bağımsız bölüm için 1006 seçeneği sunulmuş
- **Gemini, Karar 2:** "öznitelik panelinde **"Sürdürülebilirlik Portalı Uyumlu (BB: 1001/1002, Bina: 1006 — Önerilen)"** varsayılan… kullanıcı dilerse tek tıkla değiştirebilir." Revizyon 4'te de: "BB `geometrySuitability` için hem **1001/1002** … hem **1006** seçimi desteklenmiştir."
- **Kanıt:**
  - [KODLİST] `independentSectionGeometrySuitability.xml` yalnız iki değer içeriyor: **1001 Uygundur, 1002 Alan Uyumsuzluğu**. 1006 yok.
  - [REHBER] kod listesi tablosu: BB için yalnız "1001 Uygundur".
  - [HATA-TABLOSU]: "Sürdürülebilirlik kapsamındaki üretimlerde bağımsız bölüm geometrik uygunluk 1001 veya 1002 olmalıdır."
  - [ÖRNEK-1..6]: Tüm BB'lerde 1001.
  - Rehberin BB öznitelik tablosundaki "1006 yazılmalıdır" cümlesi eski kalmış bir metin.
  - [HATA-TABLOSU]: "Codelist içerisinde belirtilmemiş herhangi bir değer… tanımlanmamalıdır" ve "{...} değeri kodlistesinin içinde bulunamadı."
- **Çözüm:**
  - Bina = **1006** (kilitli).
  - BB = **1001** varsayılan. **1002** yalnız alan uyumsuzluğunda ve `additionalNote` dolu ise seçilebilir.
  - BBK = **1001** (kilitli).
  - Balkon/Teras = **1001** (kilitli).
  - 1006 seçeneği BB panelinden tamamen kaldırılmalı.
  - [HATA-TABLOSU]: "Kısımda olan geometri uyumsuzluk kodu bağımsız bölümde bulunamadı." Bu yüzden bir kısma 1002 verilirse bağlı BB'ye de 1002 verilmeli. Ancak sürdürülebilirlik kuralı BBK için yalnız 1001'e izin veriyor; BBK'da 1002 hiç kullanılmamalı.

#### B2 🔴 Bina düzeyindeki sabit kodlar kilitlenmemiş
- **Kanıt [REHBER kod listesi tabloları + ÖRNEK-1..6]:**
  - `buildingType` = **1001** ([HATA-TABLOSU]: "MimariBina bina tipine 1002 (Diğer Yapı) atanamaz.")
  - `geometrySuitability` = **1006**
  - `maksIntegrationState` = **1003**
  - BB `integrationState` = **1004**
  - BB `maksIntegrationState` = **1003**
  - BB `takbisPropertyIdentityNumber` = **-1**
  - `tenderRegistrationNumber` ve `architecturalPlanID` **boş** (`<gen:value/>`)
- **Çözüm:** Bu alanlar arayüzde salt okunur gösterilmeli ve yazıcıda sabit kodlanmalı. Gemini'nin planında yalnızca boş alanlar kilitli; kalanlar değiştirilebilir durumda.

#### B3 🟠 Ad üretiminde kod listesi metni kaynağı
- **Kanıt:**
  - [REHBER] ad kuralları: BBK adı `…_<Kısım Kullanım Amaç Texti>`, Kapı adı = `<Kapı Kullanım Amaç Texti>`, Pencere adı = `<Pencere Kullanım Amaç Texti>`.
  - [ÖRNEK]: `Dış Kapı`, `Bağımsız Bölüm Kapı`, `Bina/Yapı Giriş Kapı`, `Dış Pencere`, `-1_-1_1_Salon`, `E_-1_2_Tuvalet`.
  - Rehberin HTML tablosunda yazım hataları var ("Kalorifer Daires", "Elektrik Merkezivalet"). XML kod listesinde doğru yazılmış ("Kalorifer Dairesi", "Elektrik Merkezi").
  - [HATA-TABLOSU]: "Name değeri yanlış. (Girilen : {...} Beklenen : {...})"
- **Çözüm:** Adlarda kullanılacak metinler **XML kod listesindeki `gml:description`** değerinden alınmalı, rehber tablosundan değil. Kod listeleri uygulamaya gömülü XML olarak paketlenmeli ve isteğe bağlı güncelleme kontrolü eklenmeli.

#### B4 🟠 blockName ve entrance boş değer kuralı
- **Kanıt:**
  - [REHBER]: "Eğer yok ise boş geçilir."
  - [REHBER] BB örnek kodu ve [ÖRNEK-2,5,6]: `blockName` = `-1`, `entrance` = boş.
  - Ad üretiminde: "Karşılığı olmayan bilgilerin yerine -1 yazılmalıdır" ve "blockName ve entrance alanlarında… "/", "-", "_" gibi karakterler yokmuş gibi kabul edilerek name değeri üretilmelidir." Örnek: blok `A1/12` adda `A112` olur.
- **Çözüm:**
  - Öznitelik değeri: blok yoksa `-1`, giriş yoksa boş (örneklerdeki gibi).
  - Ad üretiminde ikisi de yoksa `-1`.
  - Ada girerken `/ - _` karakterleri silinmeli; öznitelik değeri ise **aynen** kalmalı.

---

### C. Geometri: Uygulamanın Çekirdeği (Planda En Büyük Eksik)

#### C1 🔴 Bağımsız bölüm geometrisi "üstü açık kalın cidarlı küvet" olmalı; plan bunu hiç modellemiyor
- **Gemini:** BB bir poligon. "Kat Dış Sınırı / BB / Oda" katmanları basit yükseltmeyle 3B'ye çevriliyor.
- **Kanıt: [ÖRNEK-6] geometri analizi (BB "-1_-1_1"):**

| Poligon grubu | Adet | Anlamı |
|---|---|---|
| `Floor_` yatay z=1095.9 | 1 | döşemenin **alt** yüzü |
| `Floor_` yatay z=1096.1 | 1 | döşemenin **üst** yüzü (taban kalınlığı **0.20 m**) |
| `Wall_` dikey (95 deliksiz + 25 delikli) | 120 | duvarların **dış** ve **iç** yüzleri. Delikler kapı/pencere boşlukları |
| `Wall_` yatay z=1097.0 / 1097.9 | 13 + 3 | pencere **denizlikleri** (boşluğun alt yan yüzü, duvar kalınlığı boyunca) |
| `Wall_` yatay z=1098.3 / 1098.399 | 20 + 16 | kapı ve pencere **lentoları** (boşluğun üst yan yüzü) |
| `Wall_` yatay z=1096.11 | 12 | kapı eşiği yan yüzleri |
| `Wall_` yatay z=1098.7, **delikli** | 1 | duvarların **üst kapağı**. Halka şeklinde poligon: dış kontur = BB dış sınırı, delik = iç boşluk |

  Toplam 187 poligon. **Tavan (Ceiling) yok.**

- [REHBER]:
  - "Bölümler **tavanları açık, tabanları ise kapalı** yüzey olacak şekilde idareye teslim edilmelidir."
  - "**İç ve dış duvarlar arasındaki boşluğu kapatan kısım da bir polygon olarak gösterilmelidir.**"
  - "Kapı ve Pencerelerin Bağımsız Bölüm geometrilerinde denk geldiği yüzeyler **hole (boşluklu)** yüzey yapısı kullanılarak ifade edilmelidir."
  - "Bağımsız bölümler… her polygon ayrı surfaceMember… lod2Geometry içine…"
- [HATA-TABLOSU]:
  - "Bağımsız bölüm duvarlarının üstü kapalı olmalıdır." Bu, duvar üst kapağıdır; tavanla çelişmez.
  - "Bağımsız bölüm geometrisinde en az 3 tane idsi "Wall_" ile başlayan poligon olmalıdır."
  - "… en az 1 tane idsi "Floor_" ile başlayan poligon …"
  - "Bağımsız bölüm taban kalınlığı en az {...} m olmalıdır."
  - "Yan duvarlar, tabanın üstünden başlamalıdır."
  - "Bağımsız bölüm geometrisinde pencereye uygun delik bulunamadı."
  - "Bağımsız bölüm, kat geometrisinin içinde kalmalıdır."
  - "Bağımsız bölüm çizim alanı, bağımsız bölüm geometrisinin taban alanına eşit değildir."
- **Etkisi:** Bu yapı üretilmezse her BB onlarca hata alır. Uygulamanın değeri tam olarak bu karmaşık geometriyi kullanıcı yerine üretmesidir.
- **Çözüm (algoritma, Bölüm 6'da ayrıntılı):** Her BB parçası için:
  1. **Dış kontur** (BB sınırı; kat dış sınırıyla ve komşu BB/OA ile ortak çizgiler)
  2. **İç kontur** (dış konturun duvar kalınlığı kadar içe ofseti; aslında odaların birleşimi)
  3. Döşeme alt ve üst yüzleri (dış konturdan)
  4. Dış yüz duvarları ve iç yüz duvarları (kenar başına)
  5. Duvar üst kapağı (dış kontur − iç kontur halkası)
  6. Her kapı/pencere için: dış yüzde delik + iç yüzde delik + 4 yan yüz (denizlik, lento, 2 söve)

  Duvar kalınlığı, dış ve iç kontur arasındaki farktan doğal olarak çıkar. Bu yüzden kullanıcının çizmesi gereken iki şey var: **BB sınırı** ve **oda (kısım) sınırları**. İç kontur, odaların birleşiminden türetilebilir. Bu önerinin örnek dosyayla karşılaştırılarak doğrulanması gerekir.

#### C2 🔴 Döşeme (taban) kalınlığı ve kot yığılımı tanımlanmamış
- **Gemini:** Kat için yalnız `elevation` ve `height` var.
- **Kanıt [ÖRNEK-6]:**

| Kot (m) | Ne |
|---|---|
| 1095.9 | Kat_Z tabanı = Footprint = TIC = BB-1 döşeme altı = balkon tabanı altı |
| 1096.1 | BB-1 döşeme üstü = oda tabanı (Floor_) = kapı alt kenarı |
| 1098.7 | oda tavanı (Ceiling_) = Kat_Z üst = Kat_1 tabanı = BB-2 döşeme altı = BB-1 duvar üst kapağı |
| 1098.9 | BB-2 döşeme üstü = Kat_1 oda tabanları |
| 1101.5 | Kat_1 üst = RoofEdge = LoD1 üst = çatının en alçak noktası |

  Döşeme, **üstteki** BB'ye aittir. Oda tavanı, bir üst katın döşeme altına eşittir. Örneğin Kat_Z oda yüksekliği 1098.7 − 1096.1 = 2.6 m, kat yüksekliği 2.8 m.
- [HATA-TABLOSU]: "Bağımsız bölüm taban kalınlığı ile balkon taban kalınlığı aynı olmalıdır", "Oda yüksekliği 1.5 metreden az olamaz", "RoofEdge en üst katın tavanına eşit olmalıdır", "RoofEdge ile zemin üstü Lod1Solidin tavanı aynı yükseklikte olmalıdır."
- **Çözüm:**
  - Kat modeline `slabThickness` (varsayılan 0.20 m, proje kesitinden) eklenmeli.
  - Kat kotu = önceki kat kotu + önceki kat yüksekliği.
  - Oda tabanı = kat kotu + döşeme kalınlığı. Oda tavanı = kat kotu + kat yüksekliği.
  - Mutlak kotlar: ±0.00 kotu + aplikasyon projesindeki ortometrik yükseklik.
  - Hepsi tek bir "kot motoru"ndan türetilmeli; kullanıcı her nesneye ayrı kot girmemeli.

#### C3 🔴 Kapı ve pencerelerin dosyada kaç yerde ve nasıl tekrarlandığı planlanmamış
- **Gemini:** "Duvar kenarına tıklandığında … açıklık (`DoorLinearRing_` / `WindowLinearRing_`) otomatik oluşturulur."
- **Kanıt:** Tek bir fiziksel pencere dosyada aşağıdaki yerlerin **hepsinde** görünür:

| Yer | Nasıl | Kanıt |
|---|---|---|
| LoD2 dış duvar (`WallSurface`, dış yüz düzlemi) | duvar poligonunda `gml:interior` deliği (`WindowLinearRing_`) **ve** aynı WallSurface'in `bldg:opening/bldg:Window` nesnesi (`PEN_`, `lod4MultiSurface`, 1 deliksiz `Window_` poligonu) | [ÖRNEK-6] satır 2667–2771 |
| Kat geometrisi (dış yüz) | yalnız delik, pencere nesnesi **yok** | [ÖRNEK-6] satır 8547–8564; [REHBER] "Kat ve BB için kapı geometrisi oluşturulmayacaktır" |
| BB geometrisi (dış yüz + iç yüz + söve/lento) | delikler + yan yüzler, nesne **yok** | C1 tablosu |
| Oda (`Room`) `InteriorWallSurface` (iç yüz düzlemi) | delik **ve** `bldg:opening/bldg:Window` nesnesi | [ÖRNEK-6] satır 3994–4046 |

- Kapılar için ek kurallar:
  - [REHBER]: "Kısımlar ve ortak alanlar arasında yer alan kapılar **her bir kısım için ayrı ayrı** çizilmelidir." İki oda arasındaki kapı, her iki odanın duvarında ayrı Door nesnesi olarak bulunur.
  - [REHBER]: "Bina dış kısmında yer alan kapılar, bina giriş holü ortak alan olarak tanımlanmalı ve bu kısım için de kapı çizilmelidir."
  - Balkon kapısı: [REHBER] "Balkon kapısı binanın iç ve dış yüzeylerinde göz ardı edilerek çizilmelidir." Bu cümle belirsiz; **örneklerle doğrulanmalı**.
  - Havalandırma boşluğuna açılan banyo/WC pencereleri **çizilmez**.
- [HATA-TABLOSU]:
  - "Kısımdaki pencere objesinin binada karşılığı bulunamadı."
  - "Kısımdaki kapı objesinin binada karşılığı bulunamadı."
  - "Duvar yüzeyinde pencereye uygun delik bulunamadı."
  - "Kat geometrisinde pencereye uygun delik bulunamadı."
  - "Pencerede sadece 1 tane poligon bulunmalıdır", "Pencere deliksiz olmalıdır" (kapı için de aynısı)
  - "Bağımsız bölümde pencere bulunamadı."
  - "Kısımda kapı bulunamadı."
  - "Bağımsız bölümde, kapı kullanım amacı 1003 olan bir kapı elementi bulunamadı."
  - "İç ve dış linearRinglerin noktaları farklı yönlerde sıralanmalıdır -208."
  - Ayrıca -205, -206, -207 (iç halka dış halkayı kesemez, dışarıda kalamaz, iç halkalar iç içe olamaz).
- **Çözüm:**
  - Kapı/pencere tek bir **"Açıklık" (Opening)** varlığı olarak modellenmeli. Alanları: bağlı olduğu duvar kenarı, kenar üzerindeki konum, genişlik, eşik/denizlik yüksekliği, yükseklik, türü (kapı/pencere), kullanım kodu.
  - Yazıcı bu tek varlıktan yukarıdaki tüm temsilleri **aynı X-Y konumunda** ve ilgili yüzün düzleminde üretmeli: dış yüzde dış koordinatlar, iç yüzde iç koordinatlar.
  - İç halkalar dış halkanın ters yönünde yazılmalı.
  - Açıklık, kenar uçlarına ve diğer açıklıklara en az 1 cm mesafede olmalı (bkz. C8).
  - Doğrulayıcı kuralları otomatik kontrol edilmeli:
    - Her BB'de en az 1 pencere.
    - Her kısımda en az 1 kapı.
    - Apartmanlarda her BB'de en az bir 1003 kapı (müstakil yapılarda 1001; bkz. Bölüm 4 açık soru).

#### C4 🔴 LoD0 RoofEdge'in kaynağı yanlış
- **Gemini:** "LoD0: Zemin kat dış konturundan (balkonlar hariç) `lod0FootPrint` ve **çatı dış sınırından** `lod0RoofEdge` üretilir."
- **Kanıt:**
  - [ÖRNEK-6]: FootPrint ve RoofEdge **aynı 9 noktalı poligon**, yalnız z farklı (1095.9 / 1101.5). İkisinin alanı da 91.34 m². Çatı poligonları ise saçakla birlikte daha geniş: Roof_ poligonu (532568.143, 4288398.144) noktasından başlıyor, footprint (532568.58, 4288398.70) noktasından.
  - [REHBER]: "RoofEdge yapı çatı oturumunu, FootPrint ise yapı arazi oturumunu gösteren yatay (sabit yükseklik seviyesinde) poligonlar." "Çıkma balkonlar RoofEdge ve FootPrint alanına dahil edilmemelidir."
  - [HATA-TABLOSU]:
    - "FootPrint ve RoofEdge üst üste oturmalıdır (Yükseklikleri farklı, aynı poligonlar)."
    - "RoofEdge çatının en alt noktasıyla aynı hizada olmalıdır."
    - "RoofEdge en üst katın tavanına eşit olmalıdır."
    - "TIC'in en üst noktasına en yakın olan katın tabanı FootPrint olarak atanmış olmalıdır."
    - "TIC'in en üst noktası ile footprintin yüksekliği eşit olmalıdır."
    - "FootPrint, TIC eğrisinin altında kalmamalıdır."
  - İstisna, [ÖRNEK-5] (zemin kattan bitişik yapı): footprint 375.74 m², RoofEdge 113.80 m². Zemin kat üst katlardan büyük olduğunda iki poligon farklı. LoD1'in "alanı büyük olanı referans al" kuralı ([REHBER]) bu durumu kapsıyor.
- **Çözüm:**
  - FootPrint = TIC'in en üst noktasına en yakın katın dış konturu, z = TIC'in en üst z'si.
  - RoofEdge = **en üst katın dış konturu** (saçak dahil değil), z = en üst kat tavanı = çatının en alçak noktası.
  - Kademeli yapılarda iki kontur farklı olabilir. Bu durumda uyarı verilmeli ve LoD1 "büyük alan" kuralı uygulanmalı.
  - Saçak çatı poligonlarında kalmalı, RoofEdge'e girmemeli.

#### C5 🔴 LoD1 kuralları eksik
- **Gemini:** "Zemin üstü (`FootPrint` → `RoofEdge`) ve zemin altı (`En Alt Taban` → `FootPrint`) birbirine değen iki `gml:Solid`."
- **Kanıt:**
  - [ÖRNEK-6]: Bodrumsuz yapıda `CompositeSolid` içinde **tek** `solidMember` var (10 poligon: alt + üst + 8 yan).
  - [ÖRNEK-2]: Bodrumlu yapıda 2 solid var; ayrım kotu 950.66 (= TIC en üst = FootPrint).
  - [REHBER]: "Yer üstü solid için, Lod0RoofEdge ile Lod0FootPrint karşılaştırılarak **alanı büyük olan referans alınıp** solid oluşturulur…". Yer altı için de aynı kural.
  - [HATA-TABLOSU]:
    - "Lod1 geometrisinde surface memberlar CompositeSurface içerisinde **inline** tanımlanmalıdır."
    - "Lod1Solid elementinin tabanında/tavanında en fazla {...} tane poligon olabilir."
    - "Birden fazla solid member olması durumunda solid geometriler birbirine değmeli ama kesişmemelidir."
    - -501, -502, -503
- **Çözüm:**
  - Bodrum yoksa tek solid üretilmeli.
  - Her solid'in tabanı ve tavanı **tek poligon** olmalı (en güvenli yorum; örneklerde de öyle).
  - Yan yüzler kontur kenarı başına bir dikdörtgen.
  - Büyük alan kuralı uygulanmalı.
  - Önek `Lod1Poligon_`, xlink kullanılmamalı.

#### C6 🟠 TIC (arazi kesişim eğrisi) 30 cm enterpolasyonu örneklerle çelişiyor
- **Gemini:** "zemin kesişim çevresi boyunca her **30 cm'de bir** (`0.300m`) nokta enterpolasyonu yapılarak `lod2TerrainIntersection` (TIC) üretilir." Doğrulayıcı listesinde de "TIC noktalarının 30 cm aralıkla dizilmiş olması" var.
- **Kanıt:**
  - [ÖRNEK-1..6] ölçümü. 6 TIC'in hepsi kapalı tek bir LineString ve **yalnızca köşe noktalarından** oluşuyor:

| Örnek | Nokta | Ardışık noktalar arası mesafe |
|---|---|---|
| Ornek6 | 15 | 1.00 – 9.73 m |
| Ornek2 | 7 | 1.39 – 28.80 m |
| Ornek5 | 10 | 2.07 – 15.32 m |
| Ornek4 | 14 | 3.24 – 64.20 m |
| Ornek1 | 23 | 0.30 – 30.55 m |
| Ornek3 | 58 | 0.09 – 131.60 m |

  - [REHBER] TIC bölümü: "Yapı aplikasyon projesi içerisinde bina arazi oturumunu ifade eden ve **3B koordinatlar ile tanımlanan geometri**, TKGMCityGML içerisinde TIC olarak tanımlanmalıdır." TIC bölümünde 30 cm'den hiç söz edilmiyor.
  - [REHBER S.S.S.]: "İlgili mimari proje yapı aplikasyon projesi içerisinde tanımlanan **3B yapı köşe koordinatlarını** … Lod2TerrainIntersection bölümünde tanımlanmalıdır."
  - 30 cm ifadesi **yalnız** hata tablosunda geçiyor ("Arazi kesişimi 30cm aralıklarla nokta üretilerek gösterilmelidir"). Aynı tabloda fotogrametrik modellere ait mesajlar da var. Bu mesaj büyük olasılıkla fotogrametrik üretim içindir.
  - Örneklerde köşe başına z farklı olabiliyor (Ornek4'te 11 farklı z). Ornek6'da TIC, zemin kattaki balkon/teras izini de içeriyor.
- **Çözüm:**
  - Varsayılan: TIC = aplikasyon projesindeki **3B köşe koordinatları** (her köşenin kendi ortometrik z'si), kapalı LineString, `posList`.
  - Seçenek olarak "30 cm'de bir sıklaştır" anahtarı konulmalı: kenarlar boyunca 0.30 m aralıkla doğrusal z enterpolasyonu. Varsayılan **kapalı**.
  - İlk gerçek dosyada iki sürüm de 3dbinadogrula'da denenmeli; sonuç kural setine işlenmeli.
  - TIC'in tamamı zarf (envelope) içinde kalmalı ([HATA-TABLOSU]: "Terrain kesişim eğrisi, tanımlanan dış çerçevenin içinde değil").
  - FootPrint z = TIC en üst z.

#### C7 🔴 Kabuk kapanması (watertight) için kenar eşleşmesi planlanmamış
- **Gemini:** "`val3dity -302` (kapalı olmayan su geçirmez shell)… denetimi." Yalnız denetim var; üretim tarafında bunu garantileyen bir mekanizma yok.
- **Kanıt:**
  - [HATA-TABLOSU]: -301 (en az 4 poligon), -302 (kapalı), -303 (her kenar en fazla 2 poligona ait), -305 (ayrık poligon), -306 (kendini kesen kabuk), -307 (ters yönlü poligon), -401/-402 (kesişen kabuklar), -405 (normaller dışa bakmalı).
  - Kapalı olması gereken kabuklar:
    - LoD1 solid'leri
    - oda kabukları (taban + duvarlar + tavan; aksi halde `volume` hesaplanamaz)
    - iç yapı kabukları
    - balkon taban kutusu ve korkuluk prizmaları
    - bina LoD2 kabuğu (duvar + çatı + zemin)
- **Sorun:** Komşu yüzeylerin köşeleri birbirine denk gelmezse kabuk "kapalı değil" sayılır. Örnek: dış duvar kat kat bölündüğünde çatı poligonunun kenarında ara nokta yoksa veya bir pencere deliği olan duvar ile komşu duvarın köşeleri uyuşmazsa ("T-kavşak").
- **Çözüm:** Yazmadan önce her kabuk için bir **kenar eşleştirme** adımı çalıştırılmalı:
  1. Kabuğun tüm köşeleri ortak bir milimetre ızgarasında toplanır.
  2. Her poligon kenarı, üzerine düşen başka köşelerle bölünür ("T-kavşak giderme").
  3. Her kenarın tam iki poligonda ters yönde kullanıldığı (manifold) doğrulanır.
  4. Normal yönleri dışa çevrilir.

  Bu adım üretim hattının zorunlu parçası olmalı; sonradan çalışan "otomatik onar" düğmesine bırakılmamalı.

#### C8 🔴 3 hane yuvarlama yan etkisi
- **Gemini:** "tüm koordinatlar virgülden sonra tam **3 basamak** hassasiyetle yazılır."
- **Kanıt:**
  - [HATA-TABLOSU]: "Koordinatlar noktadan sonra 3 basamağa sahip olmalıdır (Örnek: 123.456)."
  - [ÖRNEK] ölçümü: resmi örneklerde koordinat hane sayısı dağınık:
    - Ornek6: çoğunlukla 4 hane (14.246 değer)
    - Ornek4: 4 hane
    - Ornek2: 1–12 hane arası
    - Ornek3: 1–11 hane arası

    Yani örnekler bu kurala uymuyor. Kural ya yeni eklendi ya da "en fazla 3" anlamında.
  - [HATA-TABLOSU] -204: "…arasındaki mesafe de **1 cm** limit değerinden düşük. Birbirlerine çok yakın vertexler bulunmakta." -203: düzlemsellik.
- **Sorun:** Model serbest kayan noktalı sayılarla üretilip en son 3 haneye yuvarlanırsa iki risk var:
  - aynı köşeyi paylaşan iki poligonun köşeleri farklı yuvarlanabilir (kabuk açılır)
  - eğik yüzler (çatı) düzlemsellikten çıkabilir
- **Çözüm:**
  - Tüm geometri **tamsayı milimetre** cinsinden üretilmeli: TUREF koordinatı × 1000, `int64` veya JS'de güvenli tamsayı. Yerel ofset (floating origin) çıkarıldıktan sonra değerler küçük kalır.
  - Yazımda `toFixed(3)` her zaman tam 3 hane verir; örnekteki gibi `1095.9` değil `1095.900` yazılır.
  - Eğik çatı yüzlerinde, köşeler ızgaraya oturtulduktan sonra düzlemsellik sapması (val3dity varsayılan toleransı 1 cm) kontrol edilmeli. Gerekirse çatı yüzü üçgenlere bölünmeli; her üçgen kendiliğinden düzlemseldir.
  - Aynı poligondaki ardışık köşeler arasında en az 10 mm mesafe zorunlu tutulmalı (-204, -102).

#### C9 🟠 Çatı modelleme
- **Gemini:** Düz, beşik, kırma, teras ve parapet parametrik çatı.
- **Kanıt:**
  - [REHBER]: "Çatı geometrisi, üretilen yapı modelinin üzerini tamamen kapatacak şekilde olmalıdır." "LoD2 detay seviyesi yeterli." "Baca vb. üretilmez."
  - [REHBER]: "…çatı arasında mülkiyete ilişkin bir geometrinin hacimsel karşılığını temsil edecek şekilde çatı temel geometrisi oluşturulmalıdır."
  - [REHBER]: "…çatı katlarında bağımsız bölümler yer alıyorsa bu bölümlerin duvarları z ekseninde extrude edildiğinde çatının eğimi göz önünde bulundurularak **kesilerek** çatı içinden taşması engellenmelidir."
  - [HATA-TABLOSU]: "Duvar sayısı 3'ten az olamaz… Çatı ile çatı arası bağımsız bölüm duvarları arasında **fazla trimleme** olabilir", "Çatı sayısı 2'den fazla", "Çatı üstü yapılarda zemin yüzeyi bulunmamalıdır", "Yan duvarlar, tabanın üstünden başlamalıdır."
  - [ÖRNEK-6]: Saçaklı çatıda saçak altı da Roof_ poligonuyla kapatılmış. Roof z aralığı 1101.5 – 1103.7.
- **Çözüm:**
  - Parametrik çatı üretici, en üst kat konturundan düzlemsel yüzler (mahya, kırma) üretmeli. Karmaşık planlar için "straight skeleton" algoritması kullanılmalı.
  - Saçak altı yüzleri de RoofSurface'e eklenmeli.
  - **Çatı arası BB/oda kesme (trim):** çatı katındaki BB, oda ve OA kabukları çatı düzlemleriyle kesilmeli. Bu güvenilir bir 3B boolean (CSG) kütüphanesi gerektirir. Öneri: `manifold-3d` (WASM). Kesim sonrası her odada en az 3 duvar ve en az 1.5 m yükseklik kontrol edilmeli.
  - Elle çatı çizimi (düzlem düzlem) de desteklenmeli; parametrik tipler her projeye uymaz.

#### C10 🟠 Kısım içinde kısım, galeri boşluğu, havalandırma, kademeli kat
- **Gemini:** Yok.
- **Kanıt [REHBER]:**
  - "Kısım duvarları ile ilişkisi olmayan oda içerisindeki banyo, kiler gibi iç kısımların yer alması durumunda, iç kısımda yer alan kısımlar dış kısımdan çıkartılarak ayrı bir kısım olarak çizilmelidir. Dış odanın iç oda ile kesiştiği kısımda kalan alanında tavan ve taban olmamalıdır." Dış odanın taban ve tavanı delikli poligon olur.
  - "Galeri boşlukları … teknik hacim (partUsage 1028) olarak … aktarılmalıdır."
  - "Bağımsız bölüm dışarısında kalan havalandırma boşlukları niteliksiz ortak alan, bağımsız bölüm içerisindeki havalandırma boşlukları teknik hacim."
  - "Amerikan tipi mutfak → Salon olarak birlikte."
  - "Yangın merdivenleri modele dâhil edilmelidir (basamak detayı gerekmez)."
  - Kademeli katlı yapılar ve 2025/2 Genelgesi blok ayırma kuralı.
- **Çözüm:**
  - 2B çizim motoru delikli poligonları (iç içe oda) desteklemeli.
  - Odaların taban ve tavan poligonları delikli üretilebilmeli.
  - Galeri, havalandırma ve yangın merdiveni için hazır "kısım tipi" şablonları eklenmeli.

---

### D. Hesaplanan Değerler

#### D1 🔴 Kullanıcıya girdirilmemesi, otomatik hesaplanması gereken alanlar

| Alan | Nasıl hesaplanır | Kontrol eden hata mesajı |
|---|---|---|
| BBK `calculatedArea` | oda Floor_ poligonunun alanı (delikler düşülür) | "Hesaplanan alan ile geometrik alan uyuşmuyor" |
| BBK `volume` | oda kapalı kabuğunun hacmi (diverjans/tetrahedron toplamı) | "Girilen hacim … eşit değil", "Hacim > alan" |
| OA `calculatedArea` | aynı | aynı |
| Balkon `calculatedArea` | balkon taban üst yüzünün alanı (**örneklerle doğrulanmalı**: iç net alan mı, dış sınır mı) | "CalculatedArea 0'dan büyük olmalıdır" |
| BB `independentSectionCalculatedArea` | BB dış konturunun alanı ("duvar kalınlıkları çıkartılmadan") = BB döşeme alanı | "BB çizim alanı, BB geometrisinin taban alanına eşit değil", "BB çizim alanı kısım toplamından büyük olmalı" |
| BB `partCount` | bu BB'ye referans veren BBK sayısı (örneklerde 6 dosyada da birebir tuttu) | "Bağımsız bölüm kısım sayısı hatalı" |
| Kat `independentSectionCount` | kattaki BB parçası sayısı | "Kat bilgisinde verilen BB sayısı ile gmldeki BB sayısı uyuşmuyor" |
| Bina `totalIndependentSectionCount` | benzersiz BB numarası sayısı (bkz. A6) | "Toplam bağımsız bölüm sayısı gmldeki ile uyuşmuyor" |
| `storeysAboveGround` / `storeysBelowGround` | Kat nesnelerinden (zemin dahil üstte; toplam 0 olamaz) | "Toplam kat adedi ile gml dosyasındaki kat adedi uyuşmuyor" |
| `roofProjectionArea` | çatı poligonlarının 2B izdüşüm birleşiminin alanı, 2 hane. Ornek6: 120.79 m² (saçak dahil), RoofEdge 91.34 m² | "RoofProjectionArea değeri ile RoofEdge elemanından hesaplanan uymuyor". Bu mesaj ile örnek çelişiyor; bkz. Bölüm 4 |
| `elevatorCount` | "İç Mekan Asansör" ve asansör iç yapılarından öneri (kullanıcı onaylar) | — |
| Envelope | TIC dahil tüm geometrinin 3B min/max değeri | "Yüzey elemanı, tanımlanan dış çerçevenin içinde değil" |

- **Gemini:** "Hesaplanan 3B taban alanı ile mimari plandan girilen alan… %10" kontrolü var, ama değerlerin otomatik hesaplanıp yazılacağı açıkça belirtilmemiş.
- **Çözüm:** Yukarıdaki tüm alanlar salt okunur olmalı ve yazım anında geometriden hesaplanmalı. `buildingHeight` ise **projeden girilir** ([REHBER]: "kot aldığı noktadan saçak seviyesine kadar … Planlı Alanlar İmar Yönetmeliği 'Bina Yüksekliği'"). Hesaplanan saçak yüksekliği yalnız öneri ve uyarı olarak gösterilmeli.

#### D2 🔴 `buildingHeight` ile `measuredHeight` karıştırılmış
- **Gemini:** "`buildingHeight` (2 hane, `0–950`)" ve "`buildingHeight` / `measuredHeight` `0` ile `950` arasında olmalı."
- **Kanıt:**
  - [ÖRNEK-1..6]: **Hiçbirinde `measuredHeight` yok.**
  - `0–950`, "Lod1Solid'in en yüksek noktası ile measuredHeight eşit olmalıdır" ve "measuredHeight Uom m" mesajları **measuredHeight** içindir. Aynı tabloda "Mimari ve Fotogrametrik bina…" ifadeleri geçiyor; bu mesajlar fotogrametrik (eğik görüntüden üretilen) bina modelleri içindir.
  - `buildingHeight`, mimari projeden alınan yapı yüksekliğidir. Örneklerde `doubleAttribute` (7.45, 12.20, 37.10). Rehber tablosu `gen:stringAttribute` diyor; bkz. Bölüm 4.
- **Çözüm:**
  - `measuredHeight` dosyaya **yazılmamalı** (örneklerde yok; gereksiz öznitelik hatası riski).
  - `buildingHeight` örneklerdeki gibi `doubleAttribute`, 2 hane.

---

### E. Kimlik ve Adlandırma

#### E1 🔴 constructionID ile TAKBİS taşınmaz numarası bağı zorlanmamış
- **Kanıt:**
  - [REHBER] Yapı ID: "Taşınmaz Kimlik Numarası-A, -B … (29'dan sonra AA, AB…)". Dijital Bina üretiminde tüm yapılar **Ana Yapı**dır, yani harfli.
  - [ÖRNEK-6]: `constructionID` = `70125626-A`, `takbisPropertyIdentityNumber` = `70125626`.
  - [HATA-TABLOSU]: "TakbisPropertyIdentityNumber ile yapıID uyuşmuyor", "Dosya adı ile yapıID uyuşmuyor", "Bina tipi ve adaNo uyuşmuyor."
- **Çözüm:**
  - Kullanıcı yalnız **Taşınmaz Kimlik No** ve **blok harfi** girer.
  - `constructionID` = `<taşınmazNo>-<harf>` olarak üretilir.
  - Dosya adı `M-<constructionID>.gml` olarak otomatik verilir. Kullanıcı farklı ad verirse dışa aktarmada uyarı çıkar.
  - Harf, parsel girişinden saat yönünde atanır. Arayüzde parsel krokisi üzerinde gösterilmeli.

#### E2 🔴 gml:id ve gml:name kapsam kuralları eksik
- **Kanıt:**
  - [REHBER]: "**Belirtilen durum dışında kalan nesnelere id tanımı yapılmamalıdır.**" ve "**Belirtilen durum dışında kalan nesnelere name tanımı yapılmamalıdır.**"
  - [HATA-TABLOSU]: "{...} geometri elementinin IDsi olmamalıdır", "ID bulunmayan poligon tespit edilmiştir", "Poligon ID önek hatası", "LinearRing ID LinearRing_ ile başlamalıdır", "Yüzey (surface) name değeri hatalı."
  - [ÖRNEK-6]: `bldg:WallSurface`, `bldg:RoofSurface`, `gml:MultiSurface`, `gml:Solid`, `gml:CompositeSurface` elemanlarında **id yok**. `gml:Polygon` ve `gml:LinearRing` elemanlarında **her zaman** id var. Yüzey elemanlarında yalnızca `gml:name` var (Duvar/Çatı/Zemin/Taban/Tavan/İçDuvar/DışTaban/DışTavan).
- **Tam önek tablosu** ([REHBER] + [ÖRNEK]):

| Nesne | Önek |
|---|---|
| Building | `MB_` |
| Kat | `K_` |
| BB | `BB_` |
| BBK | `BBK_` |
| BBKIY | `BBKIY_` |
| OA | `OA_` |
| OAIY | `OAIY_` |
| Balkon / Teras | `BLKN_` / `TRS_` |
| MBG | `MBG_` |
| Door nesnesi / poligonu | `KAPI_` / `Door_` |
| Window nesnesi / poligonu | `PEN_` / `Window_` |
| Poligonlar | `Floor_`, `Wall_`, `Roof_`, `InteriorWall_`, `Ceiling_`, `Ground_`, `OuterFloor_`, `OuterCeiling_`, `Closure_`, `Lod1Poligon_`, `Lod0RoofEdge_`, `Lod0FootPrint_` |
| Halkalar | `LinearRing_`, `DoorLinearRing_`, `WindowLinearRing_` |

- Not: Rehberin tablosunda tavan için `"CeilingSurface_"+GUID` yazıyor ama örneği `Ceiling_…`. Hata mesajı "Ceil ile başlaması gerekiyor" diyor. Örnekler `Ceiling_` kullanıyor; o kullanılmalı.
- Not: Kat ve BB geometrisinde Floor ve Wall önekleri kullanılıyor; ayrı bir önek yok ([ÖRNEK-6]).
- Not: Kapı nesnesinin dış halkası da `DoorLinearRing_` önekli ([ÖRNEK-6] satır 2733).
- **Çözüm:** ID ve ad üretimi tek bir merkezi "ID/Name fabrikası"ndan yapılmalı. Bu fabrika her nesne türü için yukarıdaki tabloyu uygulamalı, listede olmayan elemanlara ID veya ad yazmayı engellemeli. GUID'ler küçük harf, süslü parantezsiz olmalı.

---

### F. Girdi, Konumlandırma ve İş Akışı

#### F1 🔴 Konumlandırma (georeferans) iş akışı yok
- **Gemini:** "TUREF Dilimi … ve Su Basman / Arazi Kotu girilir." DXF/KML altlık içe aktarılır.
- **Kanıt:**
  - [REHBER]: "…yapı aplikasyon projesi yardımı ile projenin 3 boyutlu arazi-bina kesişim geometrilerinin de georeferans işlemleri gerçekleştirilecektir."
  - [HATA-TABLOSU]: "Megsisten gelen parsel geometrisi … kesişmelidir", "Binanın çakıştığı parselin ada/parsel no bilgisi ile girilen uyuşmuyor", "Bu pozisyonda BuildingServiste zaten bir bina var", "Geometrinin koordinat (TM) değerleri geçersiz", "EPSG kodu, arayüzden girilen EPSG kodları ile uyuşmuyor."
- **Sorun:** Mimari proje yerel CAD koordinatındadır (genellikle 0,0 civarı, mm veya cm birimli, döndürülmüş). Gerçek konum yapı aplikasyon projesindeki köşe koordinatlarından gelir.
- **Çözüm:** "Konumlandırma sihirbazı":
  1. Aplikasyon köşe koordinatlarının (Y, X, Z ortometrik) elle girilmesi veya CSV/DXF'ten alınması.
  2. Mimari plan üzerinde karşılık gelen köşelerin tıklanması.
  3. 2B Helmert (4 parametre: öteleme, dönüklük, ölçek; ölçek 1'e kilitlenebilir) dönüşümünün hesaplanması.
  4. Artık hata raporu (her nokta için cm cinsinden), eşik aşılırsa uyarı.
  5. Dilim orta meridyeninin Y koordinatından otomatik önerilmesi.

  ±0.00 kotunun ortometrik karşılığı da aynı sihirbazda girilmeli.

#### F2 🟠 Taranmış (raster) proje desteği yok
- **Kanıt:**
  - [REHBER] "Raster Planların Düzenlenmesi": "Planların tarama esnasında oluşan rotasyonları giderilmelidir… lokal deformasyonlar… Ölçeklendirme yapılırken… hem x hem de y eksenlerinde… 3. bir yüzeyin de ölçüsü referans alınarak…"
  - [dijitalbina.tkgm.gov.tr]: "Mevcut tapu arşivindeki mimari projeler taranıp vektörleştirilmekte." Kullanıcıların önemli bir kısmının elinde DXF değil, taranmış PDF/TIFF olacaktır.
- **Çözüm:**
  - PDF/PNG/TIFF altlık yükleme.
  - Eğiklik düzeltme (iki nokta ile yatay hizalama).
  - x ve y ekseninde ayrı ölçek (afin ölçekleme) ve 3. ölçü ile kontrol.
  - Her kat planı ayrı altlık olarak yüklenmeli; katlar arası hizalama için ortak referans noktaları kullanılmalı.

#### F3 🟠 DXF içe aktarma ayrıntıları eksik
- **Gemini:** "`LWPOLYLINE`, `POLYLINE`, `LINE` (DXF)".
- **Çözüm (öneri):**
  - Birim tespiti: `$INSUNITS` değeri; yoksa kullanıcıya mm/cm/m sorulmalı.
  - LWPOLYLINE `bulge` değeriyle tanımlanan yaylar, kavisli balkonlar için parçalara bölünmeli.
  - `INSERT` blokları açılmalı; `HATCH` sınırları ve `ARC`/`CIRCLE` da desteklenmeli.
  - Katman → nesne türü eşleme tablosu kaydedilebilmeli (proje şablonu).
  - Açık polilinlerde kapatma toleransı uygulanmalı.
  - DWG doğrudan okunamaz; kullanıcı ODA File Converter gibi bir araçla DXF'e çevirmeli. Bu yardım metninde yazılmalı.

#### F4 🟠 KML içe aktarmanın amacı belirsiz
- **Gemini:** KML altlık.
- **Sorun:** KML, WGS84 coğrafi koordinat kullanır. TUREF TM'ye dönüşüm gerekir (EPSG:4326 → EPSG:5253..5259, ITRF96/TUREF ile WGS84 pratikte aynı kabul edilir). Ayrıca KML'nin buradaki kullanım amacı (parsel sınırı mı, kaba bina izi mi) tanımlanmamış.
- **Çözüm:** `proj4js` ile dönüşüm yapılmalı. KML yalnız parsel/çevre altlığı olarak kullanılmalı; ölçüye esas geometri olarak kullanılmamalı.

#### F5 🟠 Liste beyan (bağımsız bölüm listesi) verisinin toplu girişi yok
- **Kanıt [REHBER]:** `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition`, `propertyLot` "Liste içerisindeki tanımlamanın **aynısı** bu alana girilmelidir."
- **Çözüm:**
  - Excel/CSV şablonu sunulmalı. Sütunlar: BB no, blok, giriş, kat tanımı, nitelik, eklenti, arsa payı, net alan, brüt alan, MAKS BB no, MAKS numarataj no, cephe.
  - İçe aktarma BB numarasıyla eşleşmeli.
  - Eksik veya fazla BB raporlanmalı.

#### F6 🟠 Çok bloklu proje ve 2025/2 Genelgesi
- **Gemini:** "Tek bloklu veya ortak tabanlı binalar."
- **Kanıt:** [REHBER] ve 2025/2 Genelgesi m.4/3:
  - Bloklar mülkiyete konu alanları ayırmadan fiziken bölünebiliyorsa ayrı ayrı modeller üretilir; doğrulama kodu tek olur.
  - Taban alanı aynı olan veya zemini ortak çalışan yapılar için tek model üretilebilir.
- **Çözüm:**
  - Proje düzeyinde birden fazla "Yapı" (A, B, C…) desteklenmeli; her biri ayrı `M-<id>.gml` olmalı.
  - Hepsi aynı parsel bağlamında gösterilmeli ve birbirleriyle çakışma kontrolü yapılmalı ([HATA-TABLOSU]: "Aynı parselde kesişen binalar var").
  - Blok ayırma kararı için bir yardımcı soru akışı eklenmeli.

---

### G. Doğrulama Motoru

#### G1 🔴 "%100 kalibre" ve "TKGM'ye yüklenmeye hazır" iddiaları
- **Kanıt:** [HATA-TABLOSU]'ndaki mesajların önemli bir kısmı **çevrimiçi veritabanı** gerektiriyor:
  - MEGSİS parsel geometrisi
  - TAKBİS kayıtları
  - MAKS kayıtları
  - BuildingService (aynı konumda kayıtlı bina)
  - "veritabanı ile uyuşmuyor" türü mesajlar
  - "Parsel servisi null döndü"
  - "Maks değeri -1 olmalıdır (2019–2020 projeleri)"
- **Çözüm:**
  - Yerel doğrulayıcı kurallarını üç sınıfa ayırmalı:
    1. **Yerelde kesin kontrol edilebilir:** şema, hiyerarşi, ID/ad, kod listesi, geometri, sayımlar, alanlar.
    2. **Yerelde kısmen kontrol edilebilir:** parsel içinde kalma (kullanıcı parsel sınırını girdiyse), TIC–zarf ilişkisi.
    3. **Yalnız TKGM'de kontrol edilebilir:** MEGSİS, TAKBİS, MAKS, BuildingService.
  - Rapor her sınıfı ayrı göstermeli.
  - Arayüzde "%100 uyumlu" gibi ifadeler kullanılmamalı. "Yerel kontroller başarılı. Resmi sonuç için 3dbinadogrula.tkgm.gov.tr'ye yükleyin" yazılmalı.

#### G2 🟠 val3dity'nin yeniden yazılması gerçekçi değil
- **Gemini:** "`TKGM & val3dity Validator`" — val3dity kurallarını uygulama içinde yazmayı öneriyor.
- **Değerlendirme:** val3dity, kabuk topolojisi, düzlemsellik ve kabuk kesişimi için hesaplamalı geometri çekirdeği kullanan kapsamlı bir araçtır. Uygulama içinde güvenilir bir eşdeğer yazmak aylar sürer.
- **Çözüm (öneri):**
  - Hafif kontroller (-101, -102, -103, -104, -203, -208, -302 kenar eşleşmesi, -303, -307 yönelim) uygulama içinde yazılmalı. Bunlar zaten C7/C8 üretim adımının parçası.
  - Tam kontrol için resmi **val3dity** komut satırı aracı (açık kaynak, TU Delft) isteğe bağlı harici araç olarak çağrılmalı. Kullanıcı kurar veya uygulama ayrı bir yürütülebilir olarak paketler. **Lisansının (GPLv3) dağıtım biçimine etkisi hukuken kontrol edilmeli.**

#### G3 🟠 Yerel kural kataloğu eksik
- **Gemini'nin listesi:** dosya adı, tek bina, 4 cityObjectMember, zarf CRS, 3 hane, duvar ≥3, tavan = 1, taban = 1, çatı = 1, zemin = 1, -104, -302, TIC 30 cm, boş alanlar, 0–950, %10.
- **Eksik kalan ve yerelde kontrol edilebilen kurallar ([HATA-TABLOSU]'ndan):**
  1. En az 1 kat, en az 1 BB.
  2. Kat `parent` = MB id. MBG üyeleri tam (MB + tüm K + tüm BB).
  3. Kat `groupMember` sayısı = kattaki BB sayısı = `independentSectionCount`.
  4. Kısım `independentSectionObjectReference` geçerli BB'yi gösteriyor. OA `storeyObjectReference` geçerli K'yi gösteriyor veya -1.
  5. Balkon referansı geçerli. Teras kuralı (Bölüm 4).
  6. `partCount` = BBK sayısı. `totalIndependentSectionCount` = benzersiz BB no sayısı.
  7. `independentSectionCalculatedArea` = BB taban alanı ≥ Σ kısım alanı.
  8. `calculatedArea` = taban poligonu alanı. `volume` = kabuk hacmi ve hacim > alan.
  9. Oda yüksekliği ≥ 1.5 m.
  10. Her BB'de en az 3 `Wall_` ve en az 1 `Floor_`. Her Kat'ta da aynı.
  11. Kısımda taban, duvar ve tavan var. Kısımda en az 1 kapı. BB'de en az 1 pencere. BB'de 1003 kapı (apartman).
  12. Kapı/pencere: 1 poligon, deliksiz. Karşılık gelen delik dış duvarda, katta ve BB'de mevcut. Kısımdaki her açıklığın binada karşılığı var.
  13. FootPrint z = TIC en üst z. RoofEdge z = en üst kat tavanı = çatının en alçak noktası = LoD1 üst z.
  14. LoD1 inline, tavan ve taban poligon sayısı sınırı, solid'ler değiyor ama kesişmiyor.
  15. Zarf: alt köşe < üst köşe, TIC dahil, `srsDimension=3`, EPSG 5253–5259 ve Y koordinatı ile dilim uyumu (Y ≈ 500000 ± 200000 m).
  16. `architecturalProjectConfirmationDate` biçimi YYYY-AA-GG.
  17. `cardinalDirection` tekrarsız.
  18. Listede olmayan öznitelik yok. ID ve ad yalnız izin verilen elemanlarda. Önekler doğru.
  19. Halka kuralları -101 … -208. Kabuk kuralları -301 … -307 (kapalı olması gereken kabuklarda).
  20. Balkon: taban kalınlığı = BB taban kalınlığı, yan duvar kalınlığı ≥ 0.10, BB'ye boşluksuz değiyor, korkuluk BB duvarından uzun değil.
  21. BB kat geometrisi içinde kalıyor. Oda BB'ye değiyor (boşluk/kesişim yok).
  22. Koordinatlar tam 3 hane.
  23. Kod listesi değerleri listede var. Sabit kodlar doğru (1001, 1006, 1003, 1004, -1).
  24. Dosya adı = `M-` + constructionID + `.gml`. constructionID öneki = takbisPropertyIdentityNumber.
  25. Texture/appearance kullanılmıyor (kullanılırsa PNG ve ParameterizedTexture kuralları devreye girer; önerim hiç yazılmaması).

#### G4 🟡 "Otomatik Onar" kapsamı sınırlanmalı
- **Gemini:** "Türkçe hata mesajı ve otomatik onarım seçeneği sunulur."
- **Risk:** Otomatik onarım alanları sessizce değiştirirse %10 tolerans ve alan eşitliği kontrolleri bozulur; mülkiyet verisi değişmiş olur.
- **Çözüm:**
  - Otomatik onarım yalnız **topolojik ve alan değiştirmeyen** işlemlerle sınırlı olmalı: halka kapatma, ardışık tekrar noktayı silme, 1 cm altı yakın köşeleri birleştirme, yönelim düzeltme, T-kavşak bölme.
  - Alan değiştiren her işlem kullanıcı onayı gerektirmeli ve öncesi/sonrası alan farkı gösterilmeli.

---

### H. Platform ve Yazılım Mimarisi

#### H1 🟠 PWA ile Electron'u birlikte hedeflemek gereksiz karmaşıklık
- **Gemini:** "hibrit (Web PWA + Windows `.exe` Electron)", "Windows Uygulamasını Kur" butonu.
- **Değerlendirme:** Kullanıcı açıkça Windows uygulaması istedi. PWA'nın dosya sistemi erişimi sınırlıdır (File System Access API yalnız Chromium'da ve izin istemli). Büyük dosya ve harici araç çağırma (val3dity) PWA'da mümkün değil. İki hedefi aynı anda test etmek iş yükünü ikiye katlar.
- **Çözüm (öneri):**
  - Tek hedef: **Electron** (alternatif Tauri). Arayüz kodu web teknolojisiyle yazıldığı için ileride web sürümü ayrıca çıkarılabilir.
  - Kurulum: `electron-builder` NSIS paketi.
  - İmzasız `.exe` SmartScreen uyarısı verir. Kod imzalama sertifikası ihtiyacı not edilmeli.

#### H2 🟠 Büyük GML dosyalarının açılması
- **Gemini:** "`DOMParser` ile mevcut TKGM CityGML dosyasındaki `gml:posList`… ayrıştırarak…"
- **Kanıt [ÖRNEK]:** Ornek3 39.8 MB: 50.626 LinearRing, 23.492 Wall poligonu, 11.285 InteriorWall. Ornek1 28.7 MB.
- **Sorun:** Tarayıcı DOM'una 40 MB XML yüklemek yüzlerce MB bellek kullanır ve arayüz donar.
- **Çözüm:**
  - Akış tabanlı (SAX) ayrıştırıcı (`saxes` vb.) bir Worker içinde çalışmalı.
  - Three.js tarafında nesne türüne göre geometri birleştirme (merged BufferGeometry) yapılmalı.
  - Delikli poligonların çizimi için `earcut` ile üçgenleme yapılmalı (3B poligon önce kendi düzlemine izdüşürülmeli).
  - Seçim için id → üçgen aralığı haritası tutulmalı.

#### H3 🟠 Geometri kütüphaneleri planda yok
- **Gereksinimler ve öneriler:**
  - 2B poligon birleşim/fark/ofset (oda birleşimi → BB iç konturu, OA birleştirme, delik kesme): **Clipper2** (WASM/JS).
  - 3B boolean (çatı arası kesme): **manifold-3d** (WASM).
  - Çatı üretimi: straight skeleton (CGAL WASM portu veya özel uygulama).
  - Üçgenleme: **earcut**.
  - Koordinat dönüşümü: **proj4js**.
  - DXF: `dxf-parser` (sınırlı) veya `@mlightcad/libredwg-web` gibi daha kapsamlı bir seçenek (lisansları kontrol edilmeli).

#### H4 🟠 Veri modeli 3B üretimi taşıyamaz
- **Gemini:** `SpatialPolygon.vertices: Array<{y, x}>` + kat kotu.
- **Sorun:** Saf 2B + kot modeli şunları ifade edemez: eğik çatı, çatıyla kesilmiş duvar, köşe başına farklı z'li TIC, kademeli kat, delikli oda, duvar boşluğu yan yüzleri.
- **Çözüm (öneri):** İki katmanlı model kurulmalı.
  1. **Tasarım modeli (kullanıcının düzenlediği, 2.5B):** Proje, Yapı, Kat, BB, BBParçası, Kısım, İçYapı, Balkon, Açıklık, Çatı, TIC, Konumlandırma.
  2. **Üretilmiş B-rep (salt okunur, 3B):** tasarım modelinden her değişiklikte yeniden üretilen; poligon (dış halka + delikler, 3B, mm tamsayı) ve kabuk listeleri.

  GML yazıcı yalnız B-rep'ten beslenmeli. Böylece 2B/3B senkronu "tek doğruluk kaynağı" ilkesiyle sağlanır. Gemini'nin Karar 1'deki fikri doğru; ama kaynak 2.5B tasarım modeli olmalı, B-rep ondan türemeli.

#### H5 🟡 GML'i içe alıp düzenleme gerçekçi hedef olmalı
- **Gemini:** "reddedilen bir `.gml` dosyası açılıp öznitelik veya topoloji hataları düzeltilerek yeniden … kaydedilebilir."
- **Değerlendirme:** Bir GML'den tasarım modeline geri dönmek (B-rep'ten oda/BB/açıklık çıkarmak) zordur. Örneğin pencere deliklerinden "Açıklık" nesnesi yeniden kurulmalıdır.
- **Çözüm (öneri):** İki aşamalı yapılmalı.
  1. **Aşama:** GML görüntüleme, öznitelik düzenleme, kod düzeltme, yeniden yazma. Geometri olduğu gibi korunur. Bu hem en sık ihtiyaç hem de güvenli.
  2. **Aşama:** Geometriden tasarım modeline dönüşüm (kat konturu, oda poligonları, açıklıklar). Test seti olarak 6 resmi örnek kullanılmalı.

---

## 4. Kaynaklar Arası Çelişkiler ve Önerilen Kararlar

| # | Konu | Rehber metni | Hata tablosu | Örnek GML'ler | Önerilen karar |
|---|---|---|---|---|---|
| Ç1 | BB `geometrySuitability` | "1006 yazılmalıdır" (BB tablosu) / "1001" (kod listesi tablosu) | "1001 veya 1002 olmalıdır" | hepsi 1001 | **1001** (1002 istisna) |
| Ç2 | BBK ve Balkon `geometrySuitability` | "1006" (tablo) / "1001" (kod listesi) | "1001 olmalıdır" | BBK 1001; Ornek2'de bir balkon **1002** | **1001**. Ornek2 balkonu bu kuralla çelişiyor (eski örnek olabilir) |
| Ç3 | Koordinat hane sayısı | — | "3 basamak olmalı" | 1–12 hane | **Tam 3 hane** yaz (kural en yeni ve en katı olan) |
| Ç4 | TIC 30 cm | TIC bölümünde yok; S.S.S. "köşe koordinatları" | "30 cm aralıkla" | yalnız köşeler | Varsayılan **köşeler**, isteğe bağlı sıklaştırma; ilk gerçek testte kesinleştir |
| Ç5 | Kat `groupMember` içeriği | örnek kodda BB + OA | "groupMember sayısı = BB sayısı" | yalnız BB | **Yalnız BB** |
| Ç6 | `buildingHeight` tipi | `gen:stringAttribute` | — | `gen:doubleAttribute` | **double** (örnekler) |
| Ç7 | `propertyLot` tipi | `gen:intAttribute` (ama değer "pay/payda") | — | `gen:stringAttribute` | **string** |
| Ç8 | BB `blockName` yoksa | "boş geçilir" | "Blok Adı gml içerisinde var iken veritabanında boş olamaz" | `-1` | **`-1`** (örnekler ve rehberin kendi örnek kodu) |
| Ç9 | BB tavanı | "tavanları açık" | "duvarlarının üstü kapalı olmalıdır" | tavan yok, duvar üst kapağı var | İkisi de doğru: **tavan yok + duvar üst halkası var** |
| Ç10 | GroundSurface | "zemini tamamen kapatacak" | hem "1 tane olmalı" hem "Mimari binada GroundSurface bulunamaz" | hepsinde 1 adet | **1 adet** (ikinci mesaj büyük olasılıkla fotogrametrik modeller için) |
| Ç11 | Teras BB referansı | "ilişkilendirilebiliyorsa BB id, aksi halde -1" | "Terasın bağımsız bölüm referans değeri -1 olmalıdır" (bkz. `cbs.tkgm.gov.tr/3d/html/teras.html`) | Ornek3'teki **9 terasın 9'unda da** `independentSectionObjectReference` = `-1`, adı `-1_-1_-1_Teras` | **-1**. Teras adı da `-1_-1_-1_Teras` biçiminde üretilmeli |
| Ç12 | `roofProjectionArea` | "çatı sınırlarının izdüşümü" | "RoofEdge'den hesaplanan ile uymuyor" | Ornek6: 120.79 (saçak dahil) ≠ RoofEdge 91.34 | **Çatı izdüşümü** (örnek ve rehber). Uyarı olarak raporla |
| Ç13 | Tavan poligon öneki | tablo "CeilingSurface_", örnek "Ceiling_" | "Ceil ile başlamalı" | `Ceiling_` | **`Ceiling_`** |
| Ç14 | `srsName` | zarfta yeterli | "MultiSurface elementinde EPSG kod bulunamadı" ve tersine "MultiSurfacelar SrsName değerine sahip olmamalıdır" | yalnız zarfta | **Yalnız zarfta** |
| Ç15 | Kat'ta BB yoksa Kat nesnesi | çatı katı için "oluşturulmamalı" | "En az 1 tane kat olmalı" | bodrumlarda BB'siz Kat nesnesi **var** (Ornek2/5 Kat -1, `storeyUsage=1003`) | Ortak alanlı bodrum/normal katlar için Kat **oluştur**. Yalnız çatı katı istisnası uygulanır |
| Ç16 | BB 1003 kapı zorunluluğu | kapı tipleri tanımı | "BB'de 1003 kapı bulunamadı" | Ornek4/5'te BB giriş kapıları 1001 de var | Apartmanlarda zorunlu, müstakil BB'de 1001 kabul edilmeli. **TKGM'ye sorulmalı** |

---

## 5. Gemini Planı İçin Değişiklik Talimatları (Kontrol Listesi)

**Veri modeli**
- [ ] "Oda" ve "BBK" katmanlarını tek "Kısım" nesnesinde birleştir (tür: BBK / OA).
- [ ] "Bağımsız Bölüm" (mülkiyet) ile "BB Parçası" (kat başına geometri) ayrımını ekle.
- [ ] MBG, BBKIY, OAIY, Balkon/Teras (outerBuildingInstallation) ve Açıklık (Opening) varlıklarını ekle.
- [ ] Kat modeline `slabThickness`, `storeyNumber: string` (Z, -n, n, CK_n) ve asma kat yasağını ekle.
- [ ] 2.5B tasarım modeli → 3B B-rep (mm tamsayı) → GML hattını kur.

**Öznitelikler**
- [ ] BB, BBK, OA, Balkon, Kat ve Bina öznitelik adlarını Bölüm 3 (A4, A5, A7, A9) tablolarıyla birebir değiştir. `shareOfLand`, `planArea` (BB'de), `cardinalDirection` ve `measuredHeight`'i kaldır.
- [ ] `storeysAboveGround/BelowGround`'u `bldg:` elemanı olarak yaz.
- [ ] Sabit kodları kilitle (B1, B2). BB panelinden 1006'yı kaldır.
- [ ] Hesaplanan alanları otomatik ve salt okunur yap (D1).

**Geometri**
- [ ] BB'yi "kalın cidarlı, üstü açık küvet" olarak üret (C1).
- [ ] Kat geometrisini "dış kontur tabanı + delikli dış duvarlar + tavansız" olarak üret (A3).
- [ ] Odaları kapalı kabuk olarak üret: taban (döşeme üstü), iç duvarlar, tavan (üst döşeme altı) (C2).
- [ ] Açıklıkları tek kaynaktan 4 temsil halinde üret (C3).
- [ ] RoofEdge = en üst kat konturu (C4). LoD1 kurallarını uygula (C5).
- [ ] TIC'i aplikasyon köşeleriyle üret; 30 cm isteğe bağlı olsun (C6).
- [ ] Kenar eşleştirme ve T-kavşak bölme adımını üretim hattına ekle (C7).
- [ ] Tamsayı mm ızgarasında çalış, tam 3 hane yaz, 1 cm köşe aralığı uygula (C8).
- [ ] Çatı arası BB/oda kesimini 3B boolean ile yap (C9).
- [ ] Delikli oda ve iç kısım desteği ekle (C10).

**Girdi**
- [ ] Konumlandırma sihirbazı (Helmert + artık hata raporu) (F1).
- [ ] Raster altlık ve ölçekleme (F2). DXF birim/bulge/blok desteği (F3).
- [ ] Liste beyan Excel/CSV içe aktarma (F5). Çok bloklu proje (F6).

**Doğrulama**
- [ ] Kural kataloğunu G3 listesine göre genişlet. Kuralları yerel / kısmi / yalnız TKGM olarak sınıflandır (G1).
- [ ] val3dity'yi harici araç olarak entegre et (G2).
- [ ] "%100 uyumlu" ifadesini kaldır. Otomatik onarımı alan değiştirmeyen işlemlerle sınırla (G4).

**Platform**
- [ ] Yalnız Electron (Windows) hedefle, PWA'yı kaldır (H1).
- [ ] SAX + Worker ayrıştırıcı, birleştirilmiş geometri (H2).
- [ ] Clipper2, manifold-3d, earcut ve proj4js kütüphanelerini plana ekle (H3).

---

## 6. Önerilen Geometri Üretim Hattı (Algoritma Taslağı)

Girdiler: konumlandırılmış kat planları (BB sınırları, kısım sınırları, OA, iç yapılar, balkonlar, açıklıklar), kat kotları ve yükseklikleri, döşeme kalınlığı, çatı tanımı, TIC köşeleri.

1. **Normalizasyon (2B, mm tamsayı):**
   - Her kattaki tüm poligonlar ortak ızgaraya oturtulur.
   - Komşu poligonların ortak kenarları birebir eşlenir; her ortak kenarda iki taraf da aynı köşeleri içerir.
   - Kat dış konturu = o kattaki BB, OA ve balkon dışındaki tüm parçaların birleşimi (Clipper2 union). **Balkon hariç.**
2. **Kot motoru:**
   - Her kat için `zFloorBottom` (kat tabanı), `zFloorTop` (= `zFloorBottom` + döşeme), `zCeiling` (= sonraki katın `zFloorBottom`) hesaplanır.
   - En üst kat için `zCeiling` = RoofEdge z.
3. **Açıklık çözümleme:**
   - Her açıklık, ait olduğu duvar kenarına (BB sınırı / kısım sınırı / kat dış konturu) bağlanır.
   - Dış yüz ve iç yüz koordinatları (duvar kalınlığı boyunca) ve z aralığı (eşik/denizlik, yükseklik; varsayılanlar [REHBER]) hesaplanır.
4. **Kısım (oda) kabukları (LoD4):**
   - Taban = kısım poligonu @ `zFloorTop` (iç kısım varsa delikli).
   - Tavan = aynı @ `zCeiling`.
   - Kenar başına InteriorWall (açıklık delikli). OA'da dış cephe kenarları `Wall_` olarak.
   - Door/Window nesneleri.
   - Kapalılık, yönelim, `calculatedArea` ve `volume` kontrol edilir.
5. **İç yapı kabukları:** taban + duvar + tavan prizmaları. Oda taban ve tavanındaki etkisi örneklerle doğrulanmalı.
6. **BB parçası küveti:**
   - Döşeme alt ve üst yüzü (BB dış konturu).
   - Dış ve iç duvar yüzleri (iç kontur = kısım birleşimi).
   - Açıklık delikleri ve 4 yan yüz.
   - Duvar üst halkası @ `zCeiling`.
   - `independentSectionCalculatedArea` = dış kontur alanı.
7. **Kat kabuğu:** dış kontur tabanı @ `zFloorBottom` + delikli dış duvarlar `zFloorBottom` → `zCeiling`.
8. **Balkon/teras:** taban kutusu (döşeme kalınlığı) + korkuluk prizmaları (110 cm / 10 cm varsayılan); BB'ye ortak kenarda duvar yok.
9. **LoD2 bina kabuğu:**
   - Kat kat dış duvarlar (her kat ve her kırılım ayrı WallSurface; açıklık delikleri ve Door/Window nesneleri).
   - Kademe farkları için OuterFloor ve OuterCeiling.
   - Çatı yüzleri (saçak altı dahil).
   - GroundSurface.
   - Tüm kabuk için kenar eşleştirme ve kapalılık kontrolü.
10. **Çatı arası kesimi:** çatı katındaki 4–6. adım çıktıları çatı hacmiyle kesilir (manifold-3d), ardından kontroller yeniden çalıştırılır.
11. **LoD0 / LoD1 / TIC / Zarf:** C4, C5, C6 ve D1 kurallarıyla üretilir.
12. **Kimlik ve ad ataması:** E2 tablosuna göre.
13. **Yazım:** Bölüm 2 iskeleti, tam 3 hane, `posList` (örneklerde hem `pos` hem `posList` var; ikisi de kabul ediliyor). UTF-8 BOM'suz (öneri).
14. **Yerel doğrulama** (G3) → rapor → kullanıcı.

---

## 7. Test ve Kabul Kriterleri (Öneri)

1. **Okuma–yazma testi:** 6 resmi örnek okunur, tasarım modeline dönüştürülmeden B-rep olarak geri yazılır. Eleman, ID öneki, sınıf, öznitelik ve sayım istatistikleri orijinalle karşılaştırılır (bu incelemede kullanılan analiz betiğinin aynısı). Fark sıfır olmalı (hane sayısı hariç).
2. **Yerel doğrulayıcının yanlış alarm testi:** 6 örnek yerel doğrulayıcıdan geçirilir. Çıkan her hata ya gerçek bir sorun olmalı (örneğin dosyanın eski bir kurala göre üretilmiş olması) ya da kural düzeltilmeli. Örnekler TKGM'nin "doğru" kabul ettiği dosyalardır.
3. **Altın senaryo:** Ornek6'nın (villa, 2 BB, 16 oda) planı uygulamada sıfırdan çizilir. Üretilen GML örnekle şu açılardan karşılaştırılır: alanlar (±%1), hacimler, nesne sayıları, kotlar.
4. **Resmi test:** İlk gerçek proje 3dbinadogrula.tkgm.gov.tr'ye yüklenir. Çıkan her mesaj kural kataloğuna geri işlenir (özellikle Ç3, Ç4, Ç11, Ç16).
5. **Performans:** Ornek3 (40 MB) 10 saniye içinde açılmalı ve görüntülenmeli; bellek 1.5 GB altında kalmalı.

---

## 8. TKGM'ye (dijitalbina@tkgm.gov.tr) Sorulması Önerilen Açık Sorular

1. "Arazi kesişimi 30 cm aralıklarla nokta üretilerek gösterilmelidir" kuralı mimari (sürdürülebilirlik) üretimlerinde uygulanıyor mu, yoksa yalnız fotogrametrik modellerde mi? Örnek dosyalarda TIC yalnız köşe noktalarından oluşuyor.
2. "Koordinatlar noktadan sonra 3 basamağa sahip olmalıdır" kuralı "tam 3" mü, "en fazla 3" mü? Örnek dosyalar 1–12 hane içeriyor.
3. (Kapandı: Ornek3'teki 9 terasın hepsinde -1 kullanılmış ve hata tablosu da -1 istiyor. Yine de kat terası bir BB'ye tahsisliyse bunun liste beyanda nasıl gösterileceği sorulabilir.)
4. Müstakil yapıda BB ana giriş kapısı 1001 mi 1003 mü olmalı? "Bağımsız bölümde 1003 kapı bulunamadı" kuralı müstakil yapılarda uygulanıyor mu?
5. `roofProjectionArea` saçak dahil çatı izdüşümü mü, yoksa RoofEdge alanı mı?

---

*Bu belge; Rehber ver. 3.0.3 (sayfa erişimi 07.11.2026), 6 resmi örnek GML ve 14 kod listesi XML'i esas alınarak hazırlanmıştır. Rehber ve doğrulayıcı güncellendikçe Bölüm 4 kararlarının yeniden gözden geçirilmesi gerekir.*
