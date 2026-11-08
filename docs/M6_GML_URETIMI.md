# M6 — GEOMETRİ MOTORU II VE GML ÜRETİMİ

> **Yazan:** Claude, kullanıcı adına, 08.11.2026. Gemini'nin günlük limiti dolduğu için kullanıcının isteğiyle Claude yazdı.
> **Kaynaklar:** Şartname §3 (XML şablonları, sayı biçimleri, adlar, önekler), §4.2 (`Building`, `Balcony`, `Roof`, `tic`), §5.8 (balkon/teras), §5.9 (çatı), §5.10 (LoD2), §5.11 (LoD0/LoD1/TIC/Envelope), §10.4 (altın senaryo), §11 (M6 kabul: "Ornek6 altın testi tam; kendi doğrulayıcısında sıfır hata").

## 1. Kabul sonucu

**Ornek6 altın testi (tam):** Ornek6'dan tasarım çıkarıldı, sıfırdan GML üretildi, bizim okuyucumuzla okundu ve kendi doğrulayıcımızdan geçirildi.

| §10.4 ölçütü | Sonuç |
|---|---|
| Nesne sayıları MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38 (+ MBG 1) | ✔ birebir |
| Her BBK `calculatedArea` ±0,01 / `volume` ±0,05 | ✔ 16/16. İki Tuvalet'te 0,01 fark: mm ızgarası, tolerans içinde. |
| BB `independentSectionCalculatedArea` 91,34 | ✔ |
| Kotlar ±1 mm | ✔ birebir |
| LoD2 açıklıkları 8 kapı + 19 pencere | ✔ 16 dış duvar yüzeyinde |
| **Kendi doğrulayıcısında hata** | ✔ **0 HATA, 0 UYARI**. Hem Biçim A (Ornek6) hem Biçim B (varsayılan). Kalan 2 BİLGİ: MAKS sayısı 32 bit üstü ve profil bilgisi. |
| Öznitelikler | ✔ MB, K, BB, BBK, BLKN, KAPI, PEN, MBG'nin adı ve tüm öznitelikleri kaynakla aynı (alan/hacim toleranslı) |
| LoD0 / LoD1 | ✔ FootPrint ve RoofEdge 91,34 m² (1095,900 / 1101,500); LoD1 10 yüz |
| LoD2 | ✔ Roof 66, Wall 16, Ground 1; `roofProjectionArea` 120,79, `buildingHeight` 7,45 |
| Envelope / TIC | ✔ Kaynakla ±1 mm aynı; TIC kapalı 15 nokta |
| Balkonlar | ✔ 4,30 / 16,38 m²; taban kutusu 1095,900–1096,100; korkuluk 1,0 m × 100 mm, U şekli (8/10 köşe), her yüz ayrı WallSurface (Ornek6 biçimi) |
| Dosya biçimi | ✔ CRLF, BOM yok, `utf-8`, `posList`, tam 3 ondalık; iki yazım bayt bayt aynı; malik alanı yok |
| Komutlar | `typecheck` 0 hata, `npm test` **130/130** (M6: 16 yeni test) |
| Tarayıcıda | ✔ Tasarım Editörü → "GML'den tasarım çıkar" → **GML üret ve doğrula**: `M-70125626-A.gml · 532 KB · H 0 · U 0 · 67 ms`. 3B önizlemede çatı, balkonlar, açıklıklar görünüyor. Konsolda hata yok. |

**Yapay bina (sıfırdan):** Kod içinde tanımlı bina:
- 10 × 6 m, 2 kat;
- iki ticari/mesken oda, kapılar, pencereler;
- balkon;
- TIC.

Düz, beşik ve kırma çatıyla ayrı ayrı üretildi. Üçünde de kendi doğrulayıcımızda **0 HATA**; çatı gövdesi kapalı; izdüşüm alanı = saçaklı kontur alanı (77 m²).

## 2. Modüller

| Dosya | İçerik |
|---|---|
| `src/core/design/types.ts` | Yeni alanlar (hepsi isteğe bağlı, eski projeler açılır): `BuildingInfo` (MAKS no, bina tipi, geometri uygunluğu, asansör, onay tarihi, proje yüksekliği…), `SectionInfo` (BB MAKS/numarataj no, entegrasyon durumları), `cardinalDirections`, `Balcony`, `Roof` (`flat`/`gable`/`hip`/`manual`), `tic`. |
| `src/core/design/fromImported.ts` | Bina ve BB öznitelikleri, bakılar, balkonlar, elle çatı yüzleri ve TIC çıkarılır. Balkon için ortak kenarlar, korkuluk yüksekliği ve kalınlığı ölçülür. |
| `src/core/brep/building.ts` | `generateShell`: balkon/teras, çatı, LoD2 dış duvarları (T1 açıklıklarıyla), zemin, LoD0, LoD1, TIC, Envelope, `roofProjectionArea`, `buildingHeight`, kat sayıları. `offsetRing` (gönye köşeli ofset). |
| `src/core/gml/cityGmlWriter.ts` | `writeCityGml(project, brep, codelists)` → TKGM CityGML 2.0 metni. Eleman sırası, öznitelik sırası ve adlar §3'e göre; açıklama metinleri kod listesinden birebir. |
| `src/editor2d/DesignEditor2D.tsx` | **GML üret ve doğrula** düğmesi; sonuç satırı (H/U/B, boyut, süre), ilk 30 bulgu, **GML'i kaydet**. |
| `src/viewer3d/BrepPreview3D.tsx` | Yeni katman: çatı ve balkonlar. |

## 3. Kurallar

### 3.1 Balkon / teras (§5.8)

- **Taban kutusu:** BB döşemesiyle aynı kot ve kalınlık. Alt, üst ve tüm kenar yüzleri tek FloorSurface'te.
- **Korkuluk:**
  - Ortak olmayan ardışık kenar zinciri boyunca içe ofsetli şerit.
  - Uçları bina kenarı doğrusunda kesilir.
  - Kapak ve tüm yan yüzler var; her poligon ayrı WallSurface (Ornek6).
  - Korkuluk yüksekliği 0 ise korkuluk üretilmez.
- **Denetimler:**
  - taban ≥ 100 mm;
  - korkuluk ≥ 50 mm;
  - korkuluk tepesi ≤ BB duvar tepesi;
  - bina ile ortak kenar var.
- **Ornek6 ölçümleri:**
  - Ortak kenar 1 ise kapak 8 köşeli, ortak kenar 2 ise (köşeyi saran balkon) 10 köşeli.
  - Taban kenar yüzü sayısı = dış sınır kenar sayısı.

### 3.2 Çatı (§5.9)

- **Elle (`manual`):** Yüzler aynen yazılır. GML'den çıkarmada bu kullanılır (Ornek6: 66 yüz).
- **Düz (`flat`):** Saçak kadar gönye ofset kontur:
  - alt yüz `@ RoofEdge`;
  - alın yüzleri;
  - üst yüz `@ RoofEdge + kalınlık`.
- **Beşik (`gable`) / kırma (`hip`):**
  - Dikdörtgen planda (±1°) üretilir.
  - Mahya yüksekliği = (W/2)·tan(eğim). Beşikte uçlar dikey kalkan üçgeni olur.
  - Dikdörtgen olmayan planda `B-CAT-04` H verilir; düz veya elle çatı önerilir.
  - Genel straight-skeleton sonraki sürüme bırakıldı.
- **`roofProjectionArea`:** Yukarı bakan yüzlerin izdüşüm alanı toplamı ile aşağı bakanlarınki arasından büyük olan.
  - Kapalı gövdede ikisi eşittir (Ornek6: 120,79).
  - Yalnız üst yüzlü çatılarda da (Ornek1, Ornek5) doğru sonuç verir.

### 3.3 LoD2 (§5.10)

- **Dış duvar:** Her kat sınırı kenarı × `[zFloorBottom, zCeiling]`.
  - Her poligon ayrı WallSurface (Ornek6: 16).
  - T1 açıklıkları ilgili yüzeyin `opening`'ine yazılır; kapı tabanı `zFloorTop`.
- **Ground:** En alt kat sınırı `@ zFloorBottom`.
- **`lod2MultiSurface`:** Roof → Wall → (OuterFloor → OuterCeiling) → Ground sırasında xlink'ler. Balkon poligonları dahil değil.
- **OuterFloor / OuterCeiling:** Ardışık katların sınırı farklıysa `B-LOD2-02` UYARI verilir. Boolean fark (Clipper2) gerekiyor; sonraki iş.

### 3.4 LoD0, LoD1, TIC, Envelope (§5.11)

- **TIC:** Tasarımdan alınır. Yoksa en alt kat sınırı döşeme altında kullanılır ve `B-TIC-01` UYARI verilir. `zTIC = max z`.
- **FootPrint:** `zTIC`'e en yakın taban kotlu katın sınırı `@ zTIC`.
- **RoofEdge:** En üst kat `@ zCeiling`.
- **LoD1:** `[zTIC, zRoofEdge]` prizması; alanı büyük kontur kullanılır. `zFloorBottom(s0) < zTIC` ise ayrıca yer altı prizması.
- **Envelope:** Tüm noktalar ve TIC.
- **Büyük binalar:** Ornek3'te 900+ odalı binada `Math.min(...dizi)` yığını taşırdı; döngüye çevrildi.

### 3.5 Yazıcı (§3)

- Değeri olmayan **sayısal** öznitelik yazılmaz. Boş `int` geçersizdir (V-062) ve kaynak dosyalar da yazmıyor.
- Boş **metin** `<gen:value/>` olarak yazılır.
- Halka kimlikleri:
  - dış halka `LinearRing_`;
  - kapı/pencere deliği ve poligonu `DoorLinearRing_` / `WindowLinearRing_`. Delik türü B-rep'te `holeKinds` ile taşınır.
- `storeyUsage`: BB kullanımı 1002 ise Ticari, değilse Mesken; katta OA varsa ayrıca 1003. "Nitelikli OA" ayrımı kod listesinde yok; ACIK_SORULAR.
- Kimlikler deterministik: halka kimliği = `uuidv5(poligon kimliği + rol)`.

## 4. Ölçüm: 9 resmi dosyadan çıkar → üret → doğrula (yerelde, Biçim B)

| Dosya | Sayılar (üretilen/kaynak) | Kendi doğrulayıcısı | Kalan HATA'nın nedeni |
|---|---|---|---|
| **Ornek6** | birebir | **0 H, 0 U** | — |
| **Ornek1** | BLKN 125/125, PEN 510/512 | **0 H**, 13 U | — |
| **Ornek5** | BLKN 10/10, PEN 84/84 | **0 H**, 31 U | — |
| Amasya | birebir | 2 H | V-061: BB'de `maksNumaratajIdentityNumber` yok. Kaynak eski kılavuz (rejim E); yeni dosyada zorunlu, kullanıcının girmesi gerek. |
| Sincan | BLKN 17/17 | 19 H | 16 × V-061 (aynı neden) + 3 × V-164 |
| Ornek3 | BLKN 108/108, TRS 9/9 | 13 H | V-164: 17 oda penceresinin dış yüzü kat sınırı üzerinde değil |
| Ornek4 | PEN 204/212 | 13 H | Örtüşen pencereler (9), çok katlı BB alanı (4) |
| Ornek2 | BLKN 12/12 | 69 H | Çatı arası odaları (eğik tavan kesimi §5.9) ve bu odalardaki açıklıklar. Çatı arası kesimi yapılmadı. |

**Çıkan ve düzeltilen hatalar:**
- **Balkon korkuluk yüksekliği:** Duvar tepesi yerine ilk yatay duvardan ölçülüyordu (0 yükseklik). Yeni kural: en yüksek nokta; duvar yoksa korkuluksuz.
- **Çatı izdüşümü:** Yalnız üst yüzlü çatılarda 0 çıkıyordu.
- **Boş MAKS numarası:** `<gen:value/>` olarak yazılıyordu (V-062).
- **Açıklık tekrarı:** Bazı üreticiler LoD2 açıklığını oda açıklığından farklı kotla yazıyor (Ornek4). Bu yüzden aynı yere ikinci bir açıklık ekleniyordu. Yeni kural: aynı duvar diliminde kot aralıkları %50 örtüşüyorsa aynı açıklık.
- **Ornek3:** Yığın taşması düzeltildi (yukarıda §3.4).

## 5. Kapsam dışı / sonraki işler

| Konu | Not |
|---|---|
| Çatı arası kesimi ve eğik tavan (§5.9 manifold-3d) | Ornek2 türü yapılar |
| OuterFloor/OuterCeiling ve kademeli katlarda W için Boolean fark (Clipper2) | Uyarı veriliyor |
| Genel straight-skeleton çatı (dikdörtgen dışı beşik/kırma) | Şu an düz veya elle çatı |
| OA kalınlıklı dış duvarı (T5), iç yapılar (BBKIY/OAIY), sahanlık penceresi | — |
| Editörde balkon, çatı, TIC ve bina bilgisi girişi; açıklık çizim aracı | Şu an GML'den çıkarılıyor veya proje dosyasında |
| 3dbinadogrula'da resmi kabul (§10.6) | Kullanıcı yükler; çıkan her mesaj test vakasına dönüşür |
