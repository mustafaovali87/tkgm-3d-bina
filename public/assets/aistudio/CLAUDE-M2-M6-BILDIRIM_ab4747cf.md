# CLAUDE, 08.11.2026, 16:15, 3DBİNA UYGULAMASI — M2 + M3 + M4 + M5 + M6 BİLDİRİMİ (GEMİNİ'YE)

> **Yazan:** Claude, kullanıcı adına. Senin günlük limitin dolduğu için kullanıcının isteğiyle beş aşamayı ben yazdım:
> - **M2:** dosya doğrulayıcı
> - **M3:** öznitelik düzeltici + GML yazıcısı
> - **M4:** tasarım modeli + 2B editör
> - **M5:** geometri motoru I
> - **M6:** geometri motoru II + tasarımdan GML üretimi
>
> **GitHub `main`:**
> - `efa52cc` — M2
> - `9c3acca` — senin eşitlemen
> - `95c3d2f` — M3
> - `4be58fc` — M4
> - `20e9182` — M5
> - `4d79892` — M6
>
> **Ayrıntılı belgeler (repoda):**
> - `docs/M2_DOGRULAYICI.md`
> - `docs/M3_DUZELTICI.md`
> - `docs/M4_TASARIM_EDITORU.md`
> - `docs/M5_GEOMETRI_MOTORU.md`
> - `docs/M6_GML_URETIMI.md`
> - `docs/KARARLAR.md` §A.7–§A.11
> - `docs/ACIK_SORULAR.md` ACIK-07, ACIK-08, ACIK-09 (yeni)

## 0. Önce: Çalışma alanını eşitle

- `docs/ADIM_NOTU.md` dosyasında bir eşitleme çakışması oldu: sen M2 doğrulama notlarını yazarken ben de M3 bölümünü ekledim.
- Kullanıcı çakışmayı **GitHub sürümünü tutarak** çözdü (AI Studio → GitHub → Çatışmaları çözün → GitHub tarafı "Kale"). GitHub sürümü M3, M4, M5 ve M6 bölümlerini içeriyor.
- **Senin M2 doğrulama sonucun kaybolmadı, aşağıda kayıtlı:**
  - `npm ci` temiz;
  - `typecheck` 0 hata;
  - 59/59 test;
  - `docs:m2` aynı tabloyu üretti (175 kural);
  - M2 kararlarının hiçbirine itirazın yok.
- Bunu `ADIM_NOTU.md`'deki M2 bölümüne **"Gemini doğrulaması"** satırı olarak yeniden ekle.
- Çalışma alanında şu dosyaların olduğunu kontrol et:
  - **M3:**
    - `src/core/gml/gmlWriter.ts`
    - `src/core/gml/names.ts`
    - `src/core/__tests__/m3.test.ts`
    - `docs/M3_DUZELTICI.md`
  - **M4:**
    - `src/core/design/` (7 dosya)
    - `src/editor2d/DesignEditor2D.tsx`
    - `src/core/__tests__/m4.test.ts`
    - `docs/M4_TASARIM_EDITORU.md`
  - **M5:**
    - `src/core/brep/` (3 dosya: `types.ts`, `generate.ts`, `shellCheck.ts`)
    - `src/viewer3d/BrepPreview3D.tsx`
    - `src/core/__tests__/m5.test.ts`
    - `docs/M5_GEOMETRI_MOTORU.md`
  - **M6:**
    - `src/core/brep/building.ts`
    - `src/core/gml/cityGmlWriter.ts`
    - `src/core/__tests__/m6.test.ts`
    - `docs/M6_GML_URETIMI.md`
- Sonra şu komutları çalıştır ve sonuçları `docs/ADIM_NOTU.md`'ye yaz:

| Komut | Beklenen sonuç |
|---|---|
| `npm ci` | temiz |
| `npm run typecheck` | **0 hata** |
| `npm test` | **130/130** (m0: 23, m1: 10, m2: 26, m3: 16, m4: 20, m5: 19, m6: 16) |
| `npm run docs:m2` | 175 kural |

## 1. M2 — Dosya doğrulayıcı (özet)

Ayrıntı: `docs/M2_DOGRULAYICI.md`. Sen doğruladın ve katıldın.

- **Kurallar:** `src/core/validation/` içinde 175 kural kaydı var:
  - 136 uygulandı
  - 13 okuyucuda
  - 16 ertelendi (gerekçeli)
  - 7 sunucu (T)
  - 3 kısmi (K)
- **Kabul ölçütü:**
  - 8 resmi kabul dosyasında **0 HATA**.
  - TKGM ret dosyasında **V-202 HATA**.
- **Rejim tespiti:**
  - Binada GroundSurface varsa **S** (Sürdürülebilirlik), yoksa **E** (eski kılavuz).
  - E rejiminde o dönem yazılmayan öğeler BİLGİ olarak raporlanır.
- **Ölçüme dayalı UYARI'lar:** Şu kurallar resmi örneklerde ihlal edildiği ve TKGM bu dosyaları kabul ettiği için UYARI yapıldı:
  - V-076, V-096 (kısmen), V-117, V-126, V-137, V-138, V-163, V-164 (kısmen)

## 2. M3 — Öznitelik düzeltici ve GML yazıcısı

Ayrıntı: `docs/M3_DUZELTICI.md`.

**`src/core/gml/gmlWriter.ts` (saf TS):**

| Fonksiyon | Ne yapar |
|---|---|
| `applyAttributeEdits(xml, düzenlemeler)` | **Düzeltme kipi (K70):** Yalnız öznitelik ve ad metinleri değişir; geometri metni korunur. OY-02: 3 haneden kısa koordinatlar sıfırla 3'e tamamlanır, değer değişmez. |
| `normalizeGml(xml)` | **Normalize (K70):** `posList` + tam 3 ondalık, ardışık eş noktalar silinir, int/double değerler kırpılır, CRLF, BOM yok. İkinci çalıştırmada değişiklik yapmaz. |
| `computeRecountEdits` | `totalIndependentSectionCount`, Kat `independentSectionCount` ve BB `partCount` değerlerini yeniden sayar. |
| `computeRenameEdits` | Adları yeniden üretir. `names.ts` içindeki kuralları kullanır; **V-058 de aynı fonksiyonu kullanır**. |
| `computeAreaEdits` | Kısım ve OA `calculatedArea` değerini taban poligon alanından yazar (V-155). |

**Güvenlik:**
- Beyaz liste dışı öznitelik yazılamaz (K99). Malik alanları bu yüzden GML'e giremez.
- Var olan özniteliğin tipi değiştirilemez; tipe uymayan değer reddedilir.
- Tekrar eden öznitelik düzenlenmez.

**Arayüz:**
- Öznitelik panelinde değere veya nesne adına tıklayarak düzenleme yapılır.
- Üst şeritte şu düğmeler var: **Sayımlar · Adlar · Alanlar · Normalize · ↶ Geri al · 💾 Kaydet**.
- Her işlemden sonra dosya Worker'da yeniden okunur ve doğrulanır; seçim korunur.
- Özet şeridi "H a→b" biçiminde doğrulama değişimini gösterir. Normalize'da kural bazında öncesi/sonrası farkı da çıkar.

**Ölçüm (9 resmi dosya):**
- Düzeltme kipi hiçbir dosyada doğrulamayı değiştirmiyor.
- Normalize, mm yuvarlaması yüzünden bazı odalarda V-155 HATA'sı doğuruyor: Ornek1'de 1, Ornek3'te 17, Ornek4'te 1.
- "Alanlar" uygulanınca 8 kabul dosyasında HATA yeniden 0.

**Testler (`m3.test.ts`, 16):**
- Gidiş-dönüş: düzenleme yoksa SHA-256 aynı.
- Düzenleme sonrası 948 halkanın ham metni birebir aynı.
- Hatalı düzenlemeler reddediliyor.
- Bozulan sayım veya ad onarılınca dosya özgün haline bayt bayt dönüyor.
- Normalize özellikleri sağlanıyor.

## 3. M4 — Tasarım modeli ve 2B editör

Ayrıntı: `docs/M4_TASARIM_EDITORU.md`.

**Kabul ölçütü (§11 "Ornek6 planı çizilebiliyor"):**
- Testte Ornek6'nın 2 kat sınırı, 2 BB parçası ve 16 kısmı altlık üzerinde 3–5 mm gürültülü tıklamalarla editör komutlarıyla çizildi.
- Snap bütün köşeleri altın tasarıma mm düzeyinde oturttu. Çizim denetimi 0 HATA.
- Tarayıcıda gerçek fareyle çizilen kat sınırı altlıkla aynı çıktı: 91,34 m².

**`src/core/design/` (saf TS):**

| Dosya | İçerik |
|---|---|
| `types.ts` | §4.2 veri modeli; mm tamsayı. Eklenen alanlar: `idSeq`, `zFloorOverride` (asma kat), `remote` (uzak kısım). M5'te `Opening` eklendi. |
| `geometry2d.ts` | Tamsayı geometri; delikli kesişim alanı. |
| `snap.ts` | §7.4 sırası: köşe > kenar orta > kenar üzeri > dik > paralel > ızgara 1 cm. |
| `editor.ts` | Saf reducer: Seç / Kat sınırı / BB / Kısım / OA / Ölçü, geri al. Kısım BB'ye otomatik bağlanır; iç kısım delik açar; kimlik `uuidv5` ile. |
| `checks.ts` | §5.3 denetimleri T-01…T-08: alan tabanlı, 0,1 m² / 1 mm toleranslı, yalnız aynı kotta, delikler dahil. |
| `projectFile.ts` | `.tkgm3b`; malik listesi yalnız burada. |
| `fromImported.ts` | GML'den tasarım çıkarır (§10.4): fiziksel kat, asma kat, çatı arası, uzak kısım. M5'te açıklıklar ve döşeme kalınlığı eklendi. |

**Arayüz:** 2B panelde **"Tasarım Editörü"** sekmesi.
- İçe aktarılan GML planı altlık olarak gösterilir.
- Snap göstergesi, canlı alan ve %10 sapma (§7.5).
- Denetim listesi; proje kaydet/aç.

**Ölçüm:** 9 resmi dosyadan tasarım çıkarıldı; çizim denetiminde 9/9 dosyada 0 HATA. 2.245 kısmın 2.223'ü ±0,01 m² içinde; kalanların farkı mm ızgarasından.

## 4. M5 — Geometri motoru I (yeni)

Ayrıntı: `docs/M5_GEOMETRI_MOTORU.md`.

### 4.1 Kabul: Ornek6 altın testi, çatı hariç (§10.4, §11)

| Ölçüt | Sonuç |
|---|---|
| Nesne sayıları K 2, BB 2, BBK 16, KAPI 44, PEN 38 | ✔ birebir. KAPI = 36 oda + 8 LoD2; PEN = 19 oda + 19 LoD2. |
| BLKN 4 | M6 (balkon M6 kapsamında) |
| Her BBK `calculatedArea` ±0,01 / `volume` ±0,05 | ✔ 16/16 |
| BB `independentSectionCalculatedArea` 91,34 ±0,01 | ✔ iki BB'de 91,34 |
| Kotlar ±1 mm | ✔ Kat_Z 1095,900 / 1096,100 / 1098,700; Kat_1 1098,700 / 1098,900 / 1101,500 (birebir) |
| LoD2 açıklıkları 8 kapı + 19 pencere | ✔ Konum ≤ 3 mm, kot ±1 mm, usage aynı. LoD2 duvarına bağlanması M6'da. |
| Oda açıklıkları | ✔ Kaynaktaki 55 oda açıklığının her biri aynı odada ≤ 3 mm konum, ±1 mm kotla üretildi. |
| Oda kabukları | ✔ 16/16 kapalı. Diverjans hacmi = `volume` ±0,05. |
| Kendi doğrulayıcısında 0 HATA | **M6.** GML yazımı (LoD0/1/2, TIC, Envelope) M6'da. M5 çıktısı B-rep yapısıdır. |

### 4.2 Dosyalar

| Dosya | İçerik |
|---|---|
| `src/core/brep/types.ts` | Çıktı yapısı `BrepBuilding {levels, storeys, sectionParts, rooms, lod2Openings, issues}`. Koordinatlar tamsayı mm. `BrepOptions {storeyStyle 'A'\|'B', emitSlabEdges}`. |
| `src/core/brep/generate.ts` | `generateBrep`, `resolveOpenings`, `storeyLevels`, `round2`. |
| `src/core/brep/shellCheck.ts` | `checkShell`: T-kavşakta bölünmüş kenar sayımıyla kapalılık, açık kenar kotları, diverjans hacmi. |
| `src/core/design/types.ts` | `Opening` (§4.2): `kind`, `usage`, `storeyId`, `anchor {a, b}`, `sill`, `height`. `DesignBuilding.openings?` isteğe bağlı, bu yüzden M4 proje dosyaları açılır. |
| `src/viewer3d/BrepPreview3D.tsx` | 3B önizleme. Katmanlar: kısımlar / BB küvetleri / kat kabukları / açıklıklar. |
| `src/editor2d/DesignEditor2D.tsx` | Yan sütunda **Biçim A/B** seçimi, **3B üret** düğmesi, özet ve üretim uyarıları (tıklayınca eleman seçilir). Çizimde kapılar kahverengi, pencereler mavi. |

### 4.3 Motorun kuralları (şartname §5)

- **Kot motoru (§5.2):**
  - `zFloorTop = zBottom + slabThickness`
  - `zCeiling = zBottom + height`
  - Oda tabanı `zFloorOverride ?? zFloorTop`
- **Açıklık çözümleme (§5.4):**
  - `[a, b]` bir kısım kenarı veya kat sınırı üzerinde olmalı.
  - Karşı yüz: malzeme tarafında, paralel (< 0,5°), 10–1000 mm arası, örtüşen en yakın kenar.
  - Temsiller:
    - T4: iki yüzdeki kısımlar;
    - T1 + T2: dış cephe;
    - T3: BB duvar malzemesi `W`.
  - **Ölçümle bulunan hata ve düzeltmesi:** Karşı yüz uzaklığı önce kenarın ucundan ölçülüyordu. Ornek6 eğik konumlu olduğu için 14 dış pencere EXT sayılmadı. Uzaklık artık karşı kenara **dik** ölçülüyor.
- **Kapı kotu:**
  - Oda ve BB deliği `zFloorTop + 10 mm` (K45a).
  - LoD2 (T1) kapısı `zFloorTop`'tan başlar (Ornek6: 1096,100 ile 1096,110).
- **Oda kabuğu (§5.5):**
  - Floor/Ceiling;
  - kenar başına InteriorWall, T-kavşakta bölünür;
  - OA dış cephe kenarı `Wall_`;
  - açıklık nesnesi halkası = delik halkasının aynı sıralı kopyası (K48).
- **BB küveti (§5.6):**
  - Döşeme kutusu;
  - `W = sınır − kısımlar` yan yüzleri;
  - delikli üst kapak (Ornek6: 8 delik);
  - açıklıkta iki yüzde delik + eşik/denizlik, lento, 2 söve.
  - Alt yüz üretilmez. Bu yüzden açık kenarlar yalnız `zFloorTop`'ta kalır; Ornek6'nın kendi yapısı da böyle.
- **Kat kabuğu (§5.7):**
  - Biçim B varsayılan.
  - Ornek6 Biçim A: 1 alt Floor_ + 8 dış duvar; delik sayısı = o kattaki EXT açıklık sayısı.
- **Determinizm (§5.1):**
  - Kimlik `prefix + uuidv5(proje:bina::prefix::rol yolu)`.
  - İki üretim birebir aynı.
  - Kimlikler benzersiz, koordinatlar tamsayı.

### 4.4 Ölçüm: 9 resmi dosyada üretim (yerelde)

| Dosya | Süre | Kapalı oda | Üretim uyarısı |
|---|---|---|---|
| Ornek6 | 4 ms | 16/16 | yok |
| Amasya | 8 ms | 18/18 | yok |
| Sincan | 61 ms | 157/157 | yok |
| Ornek1 | 0,6 sn | 840/840 | 16 H: kaynakta kapı deliği oda tabanına iniyor; K45a yasaklar |
| Ornek3 | 1,5 sn | 967/967 | 59 H |
| Ornek5 | 45 ms | 99/99 | 4 H |
| Ornek4 | 64 ms | 106/138 | uzak kısım, tavanı kesen pencere |
| Ornek2 | 39 ms | 38/50 | çatı arası, eğik tavan → M6 |

- Bu farklar M5 kabulünün dışında.
- Hepsi üretim uyarısı olarak raporlanıyor; sessizce düzeltilmiyor.

### 4.5 Testler (`m5.test.ts`, 19)

- **Ornek6 altın testi:** 14 test.
  - Sayılar;
  - alan/hacim;
  - kotlar;
  - oda yüzleri;
  - 55 oda + 27 LoD2 açıklık eşleşmesi;
  - kapalı kabuk;
  - küvet yapısı ve yan yüz sayıları;
  - Biçim A duvarları ve delikleri;
  - determinizm;
  - Biçim B;
  - yuvarlama.
- **Yapay plan:** 5 test.
  - Oda arası kapı iki odada;
  - dış pencere T1/T2/T4;
  - kapı +10 mm;
  - hatalı açıklık uyarıları (B-OP-04/05/06);
  - proje dosyası gidiş-dönüşü ve M4 dosyası uyumluluğu.

### 4.6 M5'ten M6'ya devredilenler

GML yazımı, balkon, çatı ve T1'in LoD2 duvarına bağlanması M6'da yapıldı (§5). Hâlâ açık olanlar §5.5'te.

## 5. M6 — Geometri motoru II ve GML üretimi (yeni)

Ayrıntı: `docs/M6_GML_URETIMI.md`.

### 5.1 Kabul: Ornek6 altın testi tam; kendi doğrulayıcısında sıfır hata (§10.4, §11)

Akış: Ornek6'dan tasarım çıkarılır → tasarımdan sıfırdan GML yazılır → bizim okuyucumuzla okunur → kendi doğrulayıcımızdan geçirilir.

| Ölçüt | Sonuç |
|---|---|
| Nesne sayıları MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38 (+ MBG 1) | ✔ birebir |
| BBK alan ±0,01 / hacim ±0,05; BB 91,34; kotlar | ✔ (iki Tuvalet'te 0,01 fark: mm ızgarası) |
| LoD2 açıklıkları 8 kapı + 19 pencere | ✔ 16 dış duvar yüzeyinde |
| **Kendi doğrulayıcısında** | ✔ **0 HATA, 0 UYARI**. Hem Biçim A (Ornek6) hem Biçim B. |
| Öznitelikler | ✔ MB, K, BB, BBK, BLKN, KAPI, PEN, MBG'nin adı ve tüm öznitelikleri kaynakla aynı |
| LoD0 / LoD1 / LoD2 | ✔ FootPrint ve RoofEdge 91,34 m²; LoD1 10 yüz; Roof 66, Wall 16, Ground 1; `roofProjectionArea` 120,79; `buildingHeight` 7,45 |
| Envelope / TIC | ✔ ±1 mm; TIC kapalı 15 nokta |
| Dosya biçimi | ✔ CRLF, BOM yok, `posList`, tam 3 ondalık, deterministik (iki yazım bayt bayt aynı); malik alanı yok |
| Tarayıcıda | ✔ "GML üret ve doğrula": `M-70125626-A.gml · 532 KB · H 0 · U 0 · 67 ms`. 3B önizlemede çatı ve balkonlar görünüyor. |

Ayrıca **yapay bina** sıfırdan üretildi: 2 kat, 4 oda, kapı/pencere, balkon, TIC. Düz, beşik ve kırma çatıyla ayrı ayrı denendi; 3/3 dosya 0 HATA.

### 5.2 Dosyalar

| Dosya | İçerik |
|---|---|
| `src/core/design/types.ts` | Yeni alanlar (hepsi isteğe bağlı): `BuildingInfo`, `SectionInfo`, `cardinalDirections`, `Balcony`, `Roof` (`flat`/`gable`/`hip`/`manual`), `tic`. |
| `src/core/design/fromImported.ts` | Bina/BB öznitelikleri, bakılar, balkonlar (ortak kenar, korkuluk yüksekliği/kalınlığı ölçülür), elle çatı yüzleri, TIC. |
| `src/core/brep/building.ts` | `generateShell`: balkon, çatı, LoD2 dış duvarları (T1 açıklıklı), zemin, LoD0, LoD1, TIC, Envelope; `offsetRing`. |
| `src/core/gml/cityGmlWriter.ts` | `writeCityGml(project, brep, codelists)`: §3 şablonları, öznitelik sırası Ornek6'daki gibi, adlar kod listesinden. |
| `src/editor2d/DesignEditor2D.tsx` | **GML üret ve doğrula**, bulgu listesi, **GML'i kaydet**. |

### 5.3 Kurallar (özet)

- **Balkon (§5.8):**
  - BB döşemesiyle aynı taban kutusu.
  - Korkuluk ortak olmayan kenar zinciri boyunca içe ofsetli. Kapak 8/10 köşeli U; her yüz ayrı WallSurface (Ornek6).
  - Yükseklik 0 ise korkuluk yok.
- **Çatı (§5.9):**
  - `manual` GML'den çıkarmada kullanılır.
  - `flat`: saçak gönye ofseti + kalınlık.
  - `gable`/`hip`: yalnız dikdörtgen planda; değilse `B-CAT-04` H.
  - `roofProjectionArea` = max(yukarı bakan, aşağı bakan izdüşüm).
- **LoD2 (§5.10):** Kat başına kenar × [zFloorBottom, zCeiling]; her poligon ayrı WallSurface; T1 kapı tabanı zFloorTop.
- **LoD0/LoD1/TIC (§5.11):**
  - FootPrint = zTIC'e en yakın kat @ zTIC.
  - RoofEdge = en üst kat @ zCeiling.
  - LoD1 = [zTIC, zRoofEdge] prizması.
  - TIC yoksa en alt kat sınırı kullanılır ve `B-TIC-01` UYARI verilir.
- **Yazıcı:**
  - Değeri olmayan sayısal öznitelik yazılmaz (boş int V-062 hatası).
  - `storeyUsage`: Ticari/Mesken + katta OA varsa 1003 (ACIK-07).

### 5.4 Ölçüm: 9 resmi dosyadan çıkar → üret → doğrula (yerelde)

| Dosya | Kendi doğrulayıcısı | Kalan HATA'nın nedeni |
|---|---|---|
| Ornek6, Ornek1, Ornek5 | **0 HATA** | — |
| Amasya, Sincan | 2 / 19 H | Çoğu V-061: `maksNumaratajIdentityNumber` kaynakta yok (eski kılavuz). Yeni dosyada zorunlu; kullanıcı girmeli (ACIK-08). Sincan'da ayrıca 3 × V-164. |
| Ornek3 | 13 H | V-164: oda penceresinin dış yüzü kat sınırında değil |
| Ornek4 | 13 H | Örtüşen pencereler, çok katlı BB alanı |
| Ornek2 | 69 H | Çatı arası odaları; çatı arası kesimi yapılmadı |

**Ölçerken bulunan ve düzeltilen hatalar:**
- **Balkon korkuluk yüksekliği:** 0 çıkıyordu (yanlış duvardan ölçülüyordu).
- **Çatı izdüşüm alanı:** Yalnız üst yüzlü çatılarda 0 çıkıyordu.
- **Boş MAKS numarası:** `<gen:value/>` olarak yazılıyordu.
- **Açıklık tekrarı:** LoD2 ↔ oda açıklık eşleşmesi kot farkında kaçıyordu; aynı yere iki açıklık düşüyordu (Ornek4).
- **Büyük binada çökme:** Ornek3'te `Math.min(...dizi)` yığını taşıyordu.

### 5.5 Açık kalanlar (sonraki işler)

- Çatı arası kesimi ve eğik tavan (§5.9, manifold-3d).
- Kademeli katlarda OuterFloor/OuterCeiling ve W için Boolean fark (Clipper2). Şu an UYARI veriliyor.
- Genel straight-skeleton çatı.
- OA kalınlıklı dış duvarı (T5), iç yapılar (BBKIY/OAIY), sahanlık penceresi.
- Editörde balkon, çatı, TIC, bina bilgisi girişi ve açıklık çizim aracı.
- **Resmi kabul (§10.6, ACIK-09):** Üretilen dosya 3dbinadogrula'ya henüz yüklenmedi. Kullanıcı yükleyecek; çıkan her mesaj test vakasına dönüşecek.

## 6. Senden istenenler

1. §0'daki eşitlemeyi ve komutları yap; sonuçları `ADIM_NOTU.md`'ye yaz.
2. M3, M4, M5 ve M6 kodunu oku. Katılmadığın bir yer varsa gerekçesiyle `docs/ACIK_SORULAR.md`'ye yaz.
3. **Kural:** M2–M6 kodunda bir değişiklik önerirsen, değişiklikten sonra şunlar gösterilmeli:
   - 8 kabul dosyasında hâlâ 0 HATA;
   - 130 testin geçtiği;
   - Ornek6 altın testinin (M5 ve M6) bozulmadığı;
   - Ornek6'dan üretilen GML'in kendi doğrulayıcısında hâlâ 0 HATA verdiği.

   9 dosyalık ölçümü ben yerelde yaparım.
4. **M7'ye (konumlandırma ve içe aktarma: Helmert sihirbazı, raster kalibrasyon, DXF, liste beyan) kullanıcı onay vermeden başlama.**

## 7. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
