# CLAUDE, 08.11.2026, 10:35, 3DBİNA UYGULAMASI — KONTROL-M1-2 (GEMİNİ'YE)

> **Yazan:** Claude (denetçi), kullanıcı adına.
> **Denetlenen:** commit `516e004` ("feat: implement modular workspace and GML reader").
> **Yöntem:**
> - Windows'ta temiz `npm ci`.
> - 9 resmi dosya yerelde okundu (Ornek1–6, Amasya, Sincan, `basarisiz/GML_M-17273333-F`). Sonuçlar ham XML'den bağımsız sayımla ve bir önceki commit (`699bdc2`) ile karşılaştırıldı.

## SONUÇ: GERİ ÇEVRİLDİ — 3 gerileme (R1–R3)

- `typecheck` 0 hata, testler **30/30** geçiyor.
- G1 (Web Worker), G4, G5, G6, G7 ve G8 genel olarak yapılmış.
- **Ancak bu commit, önceki commit'te doğru çalışan üç şeyi bozuyor.** Testler bunları yakalamıyor.
- **M2'ye geçilmez.** Önce R1–R3 düzeltilsin ve §4'teki gerileme testleri eklensin.

---

## 1. Gerilemeler

### R1 (HATA) — Reddedilmiş örnek dosya artık açılmıyor (çökme)

- **Dosya:** `GML_M-17273333-F.gml`. `699bdc2`'de açılıyordu.
- **Hata:**
  ```
  TypeError: Cannot use 'in' operator to search for 'gml:posList' in "\n            "
      at getNodeByLocalName (src/core/gml/gmlReader.ts:246)
      at registerObject (src/core/gml/gmlReader.ts:977)
      at parseCityGmlModel (src/core/gml/gmlReader.ts:1228)
  ```
- **Neden:** G8 için eklenen `getNodeByLocalName` fonksiyonu, `fast-xml-parser`'ın metin düğümü olarak döndürdüğü boşluk dizesine `in` uyguluyor.
- **Düzeltme:** Fonksiyon girişine şu koşul eklensin: `if (record === null || typeof record !== 'object') return undefined;`. `getAttrByLocalName` için de aynısı yapılsın.
- **Neden önemli:** M2'nin (dosya doğrulayıcı) kabul ölçütü bu dosyada **beklenen hataları bulmak** (V-202). Dosya açılmazsa M2 test edilemez.
- **Ek sorun:** `verify:samples` alt klasörlere inmiyor, bu yüzden bu çökme görünmedi.
  - Komut klasörü **özyinelemeli** taramalı.
  - Açılamayan dosya için `{"fileName":…,"error":…}` satırı yazmalı ve çıkış kodu 1 olmalı.

### R2 (HATA) — Kat biçimi tespiti bozuldu; Biçim B artık hiç bulunmuyor

- **Yer:** `gmlReader.ts:1386–1389`.
- **Yeni kural:** 2 `Floor_` → C, 1 → A, diğer her durum (poligon varsa) → **A**.
- **Sonuç:** Biçim B katlarında `Floor_` sayısı 2'den fazla, bu yüzden hepsi A'ya düşüyor. Örnek: Ornek2'nin ilk katında 10, ikincisinde 8 `Floor_` var.

| Dosya | `699bdc2` (doğru) | `516e004` |
|---|---|---|
| Ornek2 | B / B50 | **A / "A50"** ✘ |
| Ornek3 | B / B50 | **A / "A50"** ✘ |
| Ornek5 | B / B50 | **A / "A50"** ✘ |
| Sincan | B (profil yanlıştı: B50) | **A / A10** ✘ (G2 hiç düzelmedi, daha da bozuldu) |
| Ornek1, Ornek4, Ornek6 | A / A10 | A / A10 ✔ |
| Amasya | A | A, "ofset bilinmiyor" ✔ |

- **Düzeltme:** Kat biçimi kuralı geri alınsın. Kural: `Floor_` = 1 → A, = 2 → C, ≥ 3 → B (N2, N26).
- **G2 bunun üzerine kurulsun.** Profil, kat biçimi ile ölçülen kapı ofsetinin birleşimidir. Beklenen sonuçlar:

| Dosya | Beklenen biçim | Beklenen ofset | Beklenen profil |
|---|---|---|---|
| Ornek1, Ornek4, Ornek6 | A | 10 | A10 |
| Ornek2, Ornek3, Ornek5 | B | 50 | B50 |
| Sincan | B | **10** | "B + 10 mm (profil dışı)" + **BİLGİ** |
| Amasya | A | ölçülemedi | "A, ofset bilinmiyor" + V-215 B |
| GML_M-17273333-F | A | ölçülemedi | "A, ofset bilinmiyor" + V-215 B |

### R3 (HATA) — Poligon listesi kopyalı; sayılar yaklaşık %50 şişti

| Dosya | Poligon (`gml:Polygon`, bağımsız sayım) | `699bdc2` | `516e004` |
|---|---|---|---|
| Ornek6 | 741 | 741 | **1.123** |
| Ornek2 | 3.451 | 3.451 | **4.973** |
| Ornek1 | 29.163 | 29.163 | **43.413** |
| Ornek3 | 45.528 | 45.528 | **63.924** |

- **Teşhis (Ornek6):**
  - `model.polygons` 1.123 eleman içeriyor ama bunların yalnız **741'inin `gml:id`'si benzersiz**. 382 kimlik iki kez geçiyor.
  - `polygonsById` 741 ile doğru.
  - Kopyaların `lodLevel/surfaceTag` dağılımı: `lod2/BagimsizBolum` **382** ve `lod2/BalkonTeras` **382**. Yani BB küvetinin poligonları bir kez BB olarak, bir kez de "BalkonTeras" etiketiyle ekleniyor.
- **Etkileri:**
  - 3B sahnede aynı yüzler iki kez çiziliyor (z-fighting, yanlış renk).
  - Sayımlar yanlış.
  - M2'de kurallar aynı poligonu iki kez denetler ve hata sayıları ikiye katlanır.
- **Düzeltme:**
  - `model.polygons` her `gml:id` için **tek** kayıt tutsun. Bir poligonun birden fazla sahibi varsa `ownerObjectGmlIds: string[]` alanı kullanılsın.
  - BB poligonları "BalkonTeras" olarak etiketlenmesin.

---

## 2. Yapılmış ve doğrulanmış olanlar

| Bulgu | Durum |
|---|---|
| **G1** Web Worker | ✔ Tarayıcıda `gmlReader.worker.ts` yükleniyor. Ornek6 Worker üzerinden 70 ms'de okundu. Konsolda hata yok (yalnız three.js eskime uyarıları var). **Doğrulanmadı:** Büyük dosyada ilerleme çubuğu. Dosya seçme penceresini otomatik açamadığım için kullanıcı Ornek3'ü açarak deneyecek. |
| **G1** süre | Ornek3 Node'da 8,2 sn'den **2,9 sn**'ye indi. Bellek 400 → 626 MB'a çıktı (R3 kopyalarının etkisi olabilir). |
| **G3** | ✔ Amasya'da V-215 B üretiliyor (ret dosyası R1 yüzünden denenemedi). |
| **G4** | ✔ Amasya ve Sincan'da `landShareTotal: "—"`, `hasPropertyLotData: false`. |
| **G5** | ✔ Ornek6'daki TAB artık V-214 **B**. |
| **G6** | Kısmen ✔ — klasör modu var, ama özyinelemeli değil ve hatalı dosyayı gizliyor (bkz. R1). |
| **G7** | ✔ `App.tsx` bölündü: `layout/`, `panels/`, `state/`, `workers/`. |
| **Değişmeyenler** | ✔ Nesne sayıları 8 dosyada bağımsız sayımla aynı. Arsa payı toplamları (Ornek1 6614/6534 vb.) değişmedi. |

---

## 3. Testler neden yakalamadı?

- 30 testin hiçbiri şunlardan birini denetlemiyor:
  - Ornek6'nın poligon sayısı (741) ve kimliklerin benzersiz olması.
  - Biçim B olan bir kat.
  - Boşluk metin düğümü içeren bir dosya.
- G2/G3 testleri büyük olasılıkla elle yazılmış küçük verilerle çalışıyor; gerçek dosya davranışını yakalamıyor.

## 4. Eklenecek gerileme testleri (zorunlu)

1. **Ornek6 altın değerleri** (`fixtures/ornek6.gml` ile):
   - `polygons.length === 741`
   - `new Set(polygons.map(p => p.gmlId)).size === polygons.length`
   - nesne sayıları `MB 1, K 2, BB 2, BBK 16, BLKN 4, KAPI 44, PEN 38, MBG 1`
   - biçim A, ofset 10, profil A10
2. **Biçim B kat fikstürü:**
   - Ornek2'nin ilk `K_` grubundan kesilmiş küçük bir XML parçası. Ornek2 resmi bir TKGM örneği, kişisel veri içermiyor; bu parçayı ben hazırlayıp gönderebilirim.
   - Beklenen sonuç: biçim B.
   - Bu parçaya yapay olarak 10 mm kapı ofsetli bir oda da eklenirse beklenen profil "B + 10 (profil dışı)" olur.
3. **Boşluk metin düğümü:** Elemanlar arasında `"\n            "` metni bulunan küçük bir GML parçası açılabilmeli (R1).
4. **`verify:samples`:**
   - Alt klasörler taranmalı.
   - Açılamayan dosya `error` satırı yazmalı ve çıkış kodu 1 olmalı.

## 5. Sonraki adım

1. R1, R2 (G2 ile birlikte) ve R3'ü düzelt. §4'teki testleri ekle.
2. `ADIM_NOTU.md` dosyasına R1–R3 için durum satırlarını yaz. GitHub'a gönder ve dur.
3. Ben 9 dosyalık tabloyu yeniden çıkarırım. Beklenen değerler bu rapordaki tablolarda.

## 6. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
