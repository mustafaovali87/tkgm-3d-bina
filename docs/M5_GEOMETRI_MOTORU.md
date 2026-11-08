# M5 — GEOMETRİ MOTORU I

> **Yazan:** Claude, kullanıcı adına, 08.11.2026. Gemini'nin günlük limiti dolduğu için kullanıcının isteğiyle Claude yazdı.
> **Kaynaklar:** Şartname §4.2 (`Opening`, `ProjectSettings`), §5.1 (genel ilkeler), §5.2 (kot motoru), §5.3 (W ve kenar etiketleri), §5.4 (açıklık çözümleme, T1–T5), §5.5 (oda kabuğu), §5.6 (BB küveti), §5.7 (kat kabuğu), §5.12 (alan/hacim), §10.4 (altın senaryo), §11 (M5 kabul: "Ornek6 altın testi (çatı hariç)").

## 1. Kabul sonucu — Ornek6 altın testi (çatı hariç)

| §10.4 ölçütü | Beklenen | Sonuç |
|---|---|---|
| Nesne sayıları | K 2, BB 2, BBK 16, KAPI 44, PEN 38 | ✔ birebir (KAPI = 36 oda + 8 LoD2; PEN = 19 oda + 19 LoD2) |
| BLKN 4 | balkon | M6 (balkon/teras M6 kapsamında) |
| Her BBK `calculatedArea` | ±0,01 | ✔ 16/16 |
| Her BBK `volume` | ±0,05 | ✔ 16/16 |
| BB `independentSectionCalculatedArea` | 91,34 ±0,01 | ✔ 91,34 / 91,34 |
| Kotlar | ±1 mm | ✔ Kat_Z 1095,900 / 1096,100 / 1098,700; Kat_1 1098,700 / 1098,900 / 1101,500 (birebir) |
| LoD2 açıklıkları | 8 kapı + 19 pencere | ✔ Üretildi (T1). Kaynaktaki 27 LoD2 açıklığının her biri ≤ 3 mm konum, ±1 mm kot, aynı usage. LoD2 duvarlarına bağlanması M6'da. |
| Oda açıklıkları | — | ✔ Kaynaktaki 55 oda açıklığının (36 kapı + 19 pencere) her biri aynı odada ≤ 3 mm konum, ±1 mm kotla üretildi |
| Kendi doğrulayıcısında hata | sıfır | M6. GML yazımı (LoD0/1/2, TIC, Envelope) M6'da; M5 çıktısı B-rep yapısıdır. |
| Oda kabukları kapalı | §5.5 madde 6 | ✔ 16/16; diverjans hacmi = `volume` ±0,05 |
| Üretim uyarısı | — | ✔ 0 H, 0 U |
| Komutlar | — | `typecheck` 0 hata, `npm test` **114/114** (M5: 19 yeni test) |
| Tarayıcıda | — | ✔ Tasarım Editörü → "GML'den tasarım çıkar" → "3B üret": K 2 · BB 2 · oda 16 · KAPI 44 · PEN 38, kapalı kabuk 16/16, 12 ms, H 0 · U 0; 3B önizleme açıldı, konsolda hata yok |

## 2. Modüller

| Dosya | İçerik |
|---|---|
| `src/core/design/types.ts` | `Opening` eklendi (§4.2): `kind`, `usage`, `storeyId`, `anchor {a, b}`, `sill`, `height`, `spansStoreys?`. `DesignBuilding.openings?` isteğe bağlı: M4 proje dosyaları açılmaya devam eder. |
| `src/core/design/projectFile.ts` | Açıklık koordinatları ve yükseklikleri mm tamsayı denetimi. |
| `src/core/design/fromImported.ts` | Açıklık çıkarma ve döşeme kalınlığı ölçümü (aşağıda §4). |
| `src/core/brep/types.ts` | Çıktı yapısı: `BrepBuilding {levels, storeys, sectionParts, rooms, lod2Openings, issues}`. Koordinatlar x, y yerel mm, z mutlak mm; hepsi tamsayı. `BrepOptions {storeyStyle: 'A' \| 'B', emitSlabEdges}`. |
| `src/core/brep/generate.ts` | `generateBrep(project, building?, options?)`, `resolveOpenings(building)`, `storeyLevels`, `round2`. |
| `src/core/brep/shellCheck.ts` | `checkShell(obj)`: T-kavşakta bölünmüş kenar sayımıyla kapalılık, açık kenar kotları, diverjans hacmi. |
| `src/viewer3d/BrepPreview3D.tsx` | Üretilen B-rep'in 3B önizlemesi. Katmanlar: kısımlar, BB küvetleri, kat kabukları, açıklıklar. |
| `src/editor2d/DesignEditor2D.tsx` | Yan sütunda "Geometri motoru": Biçim A/B seçimi, **3B üret**, özet (sayılar, kapalı kabuk, süre), üretim uyarıları (tıklayınca eleman seçilir). Çizimde açıklıklar: kapı kahverengi, pencere mavi. |

## 3. Motor (şartname §5)

### 3.1 Kot motoru (§5.2)
- `zFloorBottom = zBottom`, `zFloorTop = zFloorBottom + slabThickness`, `zCeiling = zFloorBottom + height`.
- Oda tabanı `zFloorOverride ?? zFloorTop` (asma kat). BB tabanı `zFloorOverride ?? zFloorBottom`.
- Denetim: döşeme > 0 (H), oda yüksekliği ≥ 1500 (H).

### 3.2 Açıklık çözümleme (§5.4)
1. **Çizim yüzü:** `[a, b]` bir kısım kenarı (öncelikli) ya da kat dış sınırı üzerinde olmalı (1 mm). Değilse `B-OP-04` H.
2. **Malzeme tarafı:** kısımda kısmın dışı, kat sınırında içi.
3. **Karşı yüz:** malzeme tarafında, paralel (< 0,5°), 10–1000 mm arası, `[a, b]` ile örtüşen en yakın kenar. Uzaklık karşı kenarın kendi doğrusuna dik ölçülür.
   - **Ölçümle bulunan hata:** ilk sürümde uzaklık kenarın ucundan ölçülüyordu. Ornek6 eğik konumlu olduğu için birkaç metrelik kenarda açı farkı mm'leri büyüttü. Sonuç: 14 dış pencere EXT sayılmadı, Mutfak penceresi 1 mm "duvara" yerleşti. Dik ölçüme geçince hepsi düzeldi.
4. **Temsiller:**
   - Her iki yüz çizgisindeki kısımlar → **T4** (o kısmın InteriorWall poligonunda delik + açıklık nesnesi).
   - Kat sınırı → **T1** (LoD2 dış yüz halkası) + **T2** (kat dış duvarında delik).
   - Kesit merkezi bir BB parçasının içinde ve kısımlarının dışındaysa → **T3** (BB küvetinde iki yüzde delik + 4 yan yüz).
5. **Z aralığı:**
   - Taban = oda tabanı + sill; kapıda sill = 10 mm (K45a).
   - T1 kapı tabanı = `zFloorTop`. Ornek6 ölçümü: LoD2 kapısı 1096,100, oda kapısı 1096,110.
   - Tepe > `zCeiling − 1` ise `B-OP-06` H.
6. **Delik köşeleri** açıklık noktalarının kendisidir. Böylece BB yan yüzleri, delik ve karşı odanın açıklık poligonu aynı köşeleri paylaşır; bunun sonucunda küvette açıklık kaynaklı açık kenar kalmaz.

### 3.3 Oda kabuğu (§5.5)
- **Floor** `@zFloorTop` (normal aşağı), **Ceiling** `@zCeiling` (normal yukarı).
- **Duvarlar:**
  - Her kenar için dikey dörtgen; T-kavşaklarda bölünür (kattaki tüm halka köşeleri, 1 mm).
  - Bir kenarın parçaları tek InteriorWallSurface'tedir.
  - OA'nın dış cephe kenarı `Wall_` olur (v3.1 KESİNLEŞTİ). Kalınlıklı `W_OA` M6'ya bırakıldı.
- **Açıklık nesnesi** halkası = delik halkasının aynı sıralı kopyası (K48).

### 3.4 BB küveti (§5.6)
- **Döşeme kutusu:** alt `@zFloorBottom`, üst `@zFloorTop`.
- **Döşeme kenar yüzleri:** `emitSlabEdges` açıksa üretilir. Ornek6'da kapalı: dış duvar döşeme altından başlar.
- **Duvar malzemesi:** `W = outline − ⋃ kısımlar`.
  - W'nin dış ve delik kenarları dikey `Wall_` olur.
  - Üst kapak `@zCeiling` delikli üretilir (Ornek6: 8 delik).
  - Alt yüz üretilmez (§5.6).
- **Açıklıklar:** iki yüzde delik + eşik/denizlik, lento ve 2 söve.
- **Ornek6'da küvet başına:**
  - 2 Floor_;
  - 8 dış + 32 oda yüzü + 40/42 söve dikey;
  - 40/42 yatay yan yüz;
  - 1 kapak (8 delik).
  - Açık kenarlar **yalnız `zFloorTop`'ta**: kısımların tabanları ve döşeme üstü dış konturu. Bu, alt yüzün üretilmemesinden gelir ve Ornek6'nın kendi yapısıyla aynıdır.

### 3.5 Kat kabuğu (§5.7)
- **Biçim A (Ornek6):** 1 alt Floor_ + tabandan tavana dış duvarlar.
- **Biçim B (varsayılan):** döşeme kutusu + `zFloorTop`'tan duvarlar.
- Dış duvarlarda T2 delikleri var. Ornek6'da kat başına 8 duvar ve delik sayısı = o kattaki EXT açıklık sayısı.

### 3.6 Alan ve hacim (§5.12)
- `calculatedArea = round2(area(polygon))`.
- `volume = round2(area × (zCeiling − oda tabanı))`.
- BB alanı: `round2(area(outline))`.
- Yuvarlama "half away from zero".

### 3.7 Kimlik ve determinizm (§5.1)
- Her kimlik `prefix + uuidv5(proje:bina::prefix::rol yolu)` biçimindedir.
- Aynı tasarım her seferinde aynı çıktıyı verir (test: iki üretimin JSON'u birebir aynı).
- Kimlikler benzersiz, tüm koordinatlar tamsayı.

## 4. Tasarım çıkarma eklemeleri (`fromImported.ts`)

- **Döşeme kalınlığı:** kattaki olağan oda taban kotu − kat taban kotu. Ornek6'da 200 mm.
- **Açıklıklar:**
  - Önce oda açıklıkları okunur. Alt kenarın iki ucu `anchor` olur; `sill` oda tabanına göredir.
  - Aynı fiziksel açıklığın ikinci oda temsili ve LoD2 temsili tekrar eklenmez. Ölçüt: aynı kat, aynı tepe kotu (pencerede taban da), paralel, ≤ 1000 mm, %50 örtüşme.
  - LoD2'de kalan açıklık dış yüze `anchor`'lanır.
  - Ornek6 sonucu: **41 fiziksel açıklık** (19 pencere, 22 kapı).

## 5. Ölçüm: 9 resmi dosyada üretim (yerelde, `ORNEKLER_YEREL`)

Tasarım çıkarma + `generateBrep` (Ornek6 Biçim A, diğerleri B):

| Dosya | Süre | Oda (kaynak) | KAPI üretilen/kaynak | PEN üretilen/kaynak | Kapalı oda | Üretim uyarısı |
|---|---|---|---|---|---|---|
| Ornek6 | 4 ms | 16 (16) | 44/44 | 38/38 | 16/16 | yok |
| Amasya | 8 ms | 18 (18) | 0/0 | 0/0 | 18/18 | yok |
| Sincan | 61 ms | 157 (157) | 314/330 | 161/164 | 157/157 | yok |
| Ornek1 | 0,6 sn | 840 (840) | 1828/1892 | 514/512 | 840/840 | 16 H B-OP-02 |
| Ornek3 | 1,5 sn | 967 (967) | 2410/2549 | 761/810 | 967/967 | 59 H (B-OP-01/04/05) |
| Ornek4 | 64 ms | 138 (138) | 139/142 | 300/212 | 106/138 | 1 H |
| Ornek5 | 45 ms | 99 (99) | 171/200 | 84/84 | 99/99 | 4 H B-OP-05 |
| Ornek2 | 39 ms | 50 (50) | 124/126 | 71/88 | 38/50 | çatı arası (M6) |

**Fark nedenleri:**
- **Ornek2:** Çatı arası, eğik tavan ve sahanlık penceresi var; hepsi M6 kapsamında.
- **Ornek4:** Uzak kısım ve tavanı kesen pencereler var.
- **Ornek1 ve Ornek3:**
  - Duvara değen kapı delikleri (B-OP-02). Kaynakta delik oda tabanına iniyor; şartname v3.1 bunu yasaklar (K45a).
  - Karşı yüzü 1000 mm'den uzak açıklıklar.
- **Sayı farkı:** Kaynak programlar bazı açıklıkları yalnız tek odaya yazmış. Motor ise §5.4 gereği iki taraftaki kısma da yazıyor.

Bu farklar M5 kabulünün dışındadır. Hepsi üretim uyarısı olarak raporlanır, sessizce düzeltilmez.

## 6. Kapsam dışı

| Konu | Aşama |
|---|---|
| GML yazımı (LoD0/1/2, TIC, Envelope), T1'in LoD2 duvarına bağlanması, kendi doğrulayıcısında 0 HATA | M6 |
| Balkon/teras (BLKN 4), parametrik çatı, çatı arası ve eğik tavan, sahanlık penceresi (`spansStoreys`) | M6 |
| Kısım BB sınırına/başka kısma değdiğinde W'nin Boolean farkı (Clipper2) | M6. Şu an `B-BB-03` uyarısı verilir, basit delik varsayımı kullanılır. |
| OA kalınlıklı dış duvarı (T5, `W_OA`) | M6 |
| Editörde açıklık çizme aracı (D/W) | Sonraki adım. Şu an açıklıklar GML'den çıkarılır ve proje dosyasında saklanır. |
