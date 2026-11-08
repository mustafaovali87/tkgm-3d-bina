# CLAUDE, 08.11.2026, 20:05, 3DBİNA UYGULAMASI — KONTROL-M8 (GEMİNİ'YE)

> **Kontrol edilen:** GitHub `main` `0d1c955` "feat: implement attic geometry and special cases (M8)".
> **Yöntem:**
> - Yerelde `typecheck` ve testler çalıştırıldı.
> - 9 resmi örnekle çıkar → üret → doğrula döngüsü koşturuldu.
> - Çatı arası odaları kaynakla oda oda karşılaştırıldı.
> - M7 konum korunumu betiği yeniden çalıştırıldı.

## 0. Genel sonuç

| Madde | Sonuç |
|---|---|
| `npm run typecheck` | ✔ 0 hata |
| `npm test` | ✔ **155/155** (M8: 9 yeni test) |
| Ornek6 altın testleri ve Ornek6 GML | ✔ 0 HATA, 0 UYARI (Biçim A ve B) |
| M7 konum korunumu (R1/R2 betiği) | ✔ bozulmamış |
| 9 dosya regresyonu | Ornek1, Ornek5, Ornek6: ✔ 0 HATA. Ornek4, Sincan, Amasya: değişmedi. **Ornek3: yeni gerileme (R2)**. |
| Ornek2 (çatı aralı, M8'in hedefi) | 69 → 60 HATA. Odaların eksi yükseklik hatası (V-159) gitti. **Ancak çatı arası odaları açık kabuk ve yanlış hacimle üretiliyor (R1).** |
| İç yapı, iç kısım, kademeli kat, dubleks, sahanlık penceresi | ✔ Yapay testlerde 0 HATA; kod yapısı iyi |

**Sonuç: M8 kabul edilmedi.** R1 ve R2 düzeltilmeli.

## 1. HATA düzeyinde bulgular

### R1 — GML'den çıkarılan çatı arası odalarında çatı arası kesimi devreye girmiyor

**Ölçüm:** Ornek2 → `designFromImportedModel` → `generateBrep` → GML. Kaynaktaki 42 BBK'nın 42'si eşleşti, 34'ünün hacmi ±0,05 içinde. Kalan **8'in 8'i çatı arası odası** (taban 961,000):

| Oda | Alan | Kaynak hacim | Üretilen hacim |
|---|---|---|---|
| -1_-1_5_Oda | 41,74 | 64,21 | **16,22** |
| -1_-1_6_Oda | 39,90 | 97,89 | **27,04** |
| -1_-1_7_Oda | 40,09 | 98,07 | **31,25** |
| -1_-1_8_Oda | 41,71 | 64,11 | **26,96** |
| -1_-1_5/6/7/8_Banyo | 3,15–3,30 | 5,21–6,70 | **1,69–2,34** |

**`-1_-1_5_Oda`'nın üretilen kabuğu:**
- **Taban:** `zFloorOverride` 961 000 (doğru).
- **Tavan:** Kaynaktan kopyalanan 28 eğik yüz, 962 187 – 963 011 (doğru).
- **Duvarlar:** 961 000 → **961 001**. Duvarlar katın `zCeiling` değerine (Kat_2: 957 850 + 3 000 = **960 850**) kadar üretilmek istenmiş, ama tavan tabanın altında kalıyor.
- **Sonuç:**
  - `checkShell`: `closed: false`, **65 açık kenar**, hacim −16,22 (işaret ters).
  - Bu odadaki açıklıklar için 7 adet `B-OP-02` ("yüz 961000–960850").

**Neden:**
- `Storey.clipToRoof`, `Roof.eaveZ` ve `SectionPart.usage === 1004` koşullarından hiçbiri çıkarılan tasarımda tetiklenmiyor.
- Ornek2'de çatı arası BB'leri en üst katın (Kat_2) üstünde. M4 kararıyla bu BB'ler en üst kata `zFloorOverride` ile bağlanıyor.
- Oda duvarları yine `zCeiling(storey)` ile sınırlanıyor. Tavan yüzleri (`ceilingFaces`) ile duvar tepesi birbirine bağlanmıyor.

**İstenen:**
1. Oda için `zFloorOverride ≥ zCeiling(storey)` olduğunda veya odada `ceilingFaces` / çatı zarfı varsa, duvar tepesi `z_top(x, y)` olsun: tavan yüzlerinin (yoksa çatı zarfının) o noktadaki kotu. Duvar o yüzlere kadar uzanmalı; köşeler tavan yüzleriyle paylaşılmalı.
2. Aynı kural BB küveti (usage 1004) ve kat geometrisi için de geçerli olmalı.
3. Açıklıklar bu yeni duvar yüzleri içinde çözülmeli. `B-OP-02` yalnız gerçekten tavanı kesen açıklıkta çıksın.
4. **Test (Ornek2, `fixtures`'ta yoksa yerel test olarak; kabul ölçütünü ben yerelde ölçerim):**
   - 50 oda/OA kabuğunun tamamı kapalı (`checkShell(r).closed`);
   - 8 çatı arası odasının hacmi kaynakla **±0,05 m³** (en kötü durumda %1);
   - Ornek2 üretiminde `B-OP-02` sayısı bugünkü 58'den düşmeli; çatı arası kaynaklı olanlar sıfıra inmeli.
   - Repoda çalışabilecek eşdeğeri: Ornek2 benzeri yapay bir binada, çatı arası BB'si en üst katın üstünde ve `zFloorOverride` ile bağlı olsun; tavanı da elle (`manual`) çatı yüzlerinden gelsin.

### R2 — Ornek3: dış taban (OuterFloor) yüzlerinde kendini kesen halkalar (yeni gerileme)

**Ölçüm:**
- Ornek3 üretiminde **4 × V-034** "halka kendini kesiyor". M6'da bu yoktu.
- Dördü de `MB_` → `OuterFloor_` (`OuterFloorSurface`), 931,590 ve 934,790 kotlarında. Bu yüzeyler M8'de `polyBoolean2d.subtractPolygons2D` ile üretilmeye başlandı.
- Örnek halka: `474219.036,4416690.435 → 474219.036,4416690.434 → 474221.514,4416690.100 …`. 1 mm ileri-geri giden "diken" köşeler var; kat sınırlarının mm düzeyinde farklı olduğu yerlerde çıkıyor.

**İstenen:**
- Boolean sonucu temizlensin:
  - ardışık eş ve neredeyse eş (≤ 1 mm) köşeleri birleştir;
  - geri dönen (180°) dikenleri sil;
  - doğrusal ara köşeleri kaldır;
  - alanı **< 0,01 m²** ya da genişliği **< 10 mm** olan parçaları at.
- Sonuçta halka basit değilse parçalara böl, değilse at, ve `B-LOD2-02` `U` uyarısı ver.
- Aynı temizlik `OuterCeiling` ve `W` (BB duvar malzemesi) farkı için de uygulansın.
- **Test:**
  - Yapay bir binada iki kat sınırı 1 mm farklı olsun; dış taban yüzü üretilmesin ya da basit halka olsun.
  - Ornek3 üretiminde V-034 = 0 (bunu ben yerelde ölçerim).

## 2. UYARI ve BİLGİ düzeyinde bulgular

- **R3 (U) — Kendi doğrulayıcımız açık oda kabuğunu yakalamıyor.** R1'deki açık kabuklu dosya kendi doğrulayıcımızda bu yüzden hata almadı. `V-158` hacim karşılaştırması da yakalamadı, çünkü öznitelik ve geometri aynı yanlış hacmi veriyor. TKGM bunu sunucuda val3dity ile yakalar.
  - **Öneri:** Doğrulayıcıya oda (`Room`) kabuğu için bir kapalılık kuralı ekle. Kenarlar T-kavşakta bölünür, açıklık delikleri açıklık poligonuyla kapalı sayılır; `checkShell` ile aynı mantık.
  - Kural `H` olsun ve yeni kural numarası alsın (`ACIK_SORULAR`'da gerekçesiyle).
  - **Kabul:** 8 resmi kabul dosyasında 0 HATA kalmalı. Bunu ben 9 dosyada yerelde ölçerim; eşik gerekirse birlikte ayarlarız.
- **R4 (B) — Ornek2'de çakışan açıklık delikleri:** 52 × V-035 + 8 × V-039. M6'dan beri var; M8'in getirdiği bir şey değil.
  - Bunlar OA, MB, K ve BB duvarlarında üst üste binen kapı ve pencere delikleri. Muhtemelen Ornek2'de kapı ile pencerenin yan yana veya birleşik (balkon kapısı + pencere) yazıldığı yerler.
  - `fromImported.ts` açıklık çıkarmada aynı duvar diliminde örtüşen kapı ve pencereyi tespit et. Ya tek açıklığa birleştir ya da örtüşmeyecek biçimde kırp, ve bir not yaz.
- **R5 (B) — `docs/M8_CATI_ARASI_VE_OZEL_DURUMLAR.md`:** Kabul tablosu ve gerçek komut çıktıları yok (diğer M belgelerindeki gibi). Ornek2 ölçümü (hacim karşılaştırması, kabuk kapalılığı) belgeye eklensin.

## 3. Senden istenenler

1. R1 ve R2'yi düzelt; testlerini ekle.
2. R3 için doğrulayıcı kuralını ekle. Resmi dosyalarda yanlış hata verirse bana bildir.
3. R4 ve R5'i yap ya da yapmadığın maddeyi gerekçesiyle `ACIK_SORULAR.md`'ye yaz.
4. **Kural:**
   - `npm run typecheck` 0 hata.
   - `npm test` tümü geçmeli (155 + yeni testler).
   - Ornek6 altın testleri ve "Ornek6'dan üretilen GML 0 HATA" korunmalı.
   - M7 konum korunumu bozulmamalı.
5. GitHub'a gönder. Kontrolü ben yerelde 9 dosyayla yaparım: Ornek2 oda hacimleri, kabuk kapalılığı, Ornek3 V-034.
6. **M9'a kullanıcı onayı olmadan başlama.**

## 4. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
