# CLAUDE, 08.11.2026, 22:10, 3DBİNA UYGULAMASI — KONTROL-M9 DÜZELTMELERİ VE M10 TEST DURUMU (GEMİNİ'YE)

> **Ne oldu:**
> - `KONTROL-M9.md`'deki maddeleri (R1–R4), kullanıcının isteğiyle **ben düzelttim**. Senin yapmana gerek yok.
> - Bu sırada GitHub'a gönderdiğin M10 commit'ini (`0b6a9d1`) benim düzeltmelerimle birleştirdim. Çakışma yalnız `KARARLAR.md`'deydi: ikimiz de "A.15" eklemiştik. Senin bölümün **A.15 (M10)** kaldı, benimki **A.16** oldu.
>
> **GitHub `main`:**
> - `50c96b1` — KONTROL-M9 düzeltmeleri
> - `e2c84bb` — birleştirme
>
> **Ayrıntı:**
> - `docs/ADIM_NOTU.md` ("KONTROL-M9 DÜZELTMELERİ" bölümü)
> - `docs/KARARLAR.md` §A.16
> - `docs/ACIK_SORULAR.md` ACIK-10 (güncellendi), ACIK-12, ACIK-13

## 0. Önce: AI Studio'yu eşitle (M10'a devam etmeden)

1. AI Studio → GitHub paneli → değişiklikleri **çek** (pull).
2. Çakışma çıkarsa:
   - `docs/KARARLAR.md`'de iki bölümü de koru (A.15 seninki, A.16 benimki).
   - Diğer dosyalarda **GitHub tarafını** seç.
3. Sonra şunları çalıştır:
   - `npm ci`
   - `npm run typecheck` (0 hata beklenir)
   - `npm test`: **185 testten 183'ü geçmeli**. Kalan 2 başarısız test senin M10 şablon testlerin (aşağıda §2).

## 1. Yaptığım düzeltmeler (KONTROL-M9)

| Madde | Ne yaptım | Sonuç (yerelde ölçüldü) |
|---|---|---|
| **R1** — V-217 resmi dosyalarda yanlış HATA | `rulesExtra.ts`: V-217 `H` → `U`. Gerekçe: 9 resmi dosyanın 7'sinde ihlal var ve TKGM kabul etmiş (KARARLAR §A.7 politikası). `m8.test.ts`'teki V-217 testi UYARI bekliyor. | **8 kabul dosyasında yeniden 0 HATA**; ret dosyasında V-202 hâlâ HATA. `docs:m2` 176 kural. |
| **R2** — Ornek2 çatı arası odaları açık kabuk | `atticClip.ts` `prepareExplicitCeilingForPoly` (aşağıdaki 3 işlem); `generate.ts` `wallFaces` (4. işlem) | **8/8 çatı arası odası kapalı kabuk.** Hacim kaynak özniteliğinden %0,2–1,3 farklı. Örnek: 5_Oda 64,77 / 64,21; 7_Oda 97,84 / 98,07. |
| **R2 testi** | `m8.test.ts`: "KONTROL-M9 R2 (Ornek2 benzeri)". Ters yönlü, 3 mm kaymış köşeli ve ince parçalı beşik tavan kullanıyor. | Kapalı kabuk; analitik hacim 64,80 m³ ±0,05. Düzeltme geri alınınca test başarısız oluyor (doğrulandı). |
| **R3** — WGS84 → TUREF mutlak doğruluk | `m9.test.ts`'e iki bağımsız ölçüt eklendi: GRS80 meridyen yayı sabitleri ve Karney/Krüger 6. derece serisi. | Senin dönüşümün 8 noktada (Edirne → Iğdır, 6 dilim) **±5 mm** doğru. |
| **R4** — Ornek2 kalan V-035 | `generate.ts`: kısım izleri birbirine değiyorsa BB küveti kapağı `subtractPolygons2D` ile üretiliyor (`B-BB-05`, BİLGİ). | V-035 = 0 |

**R2'nin nedeni (bilgin olsun):**
- Ornek2 kaynak dosyasında **tüm yüzler ters yönlü** (normaller içe bakıyor).
- Senin `prepareExplicitCeilingForPoly`'n tavan sınır kenarlarını duvar kenarıyla aynı yönde arıyor. Yön ters olunca kenarları reddedip düz çizgiye düşüyordu; mahya noktası duvarda eksik kalıyordu.
- Eklediğim işlemler:
  1. Tavan yüzleri yukarı yönlendiriliyor (Newell z < 0 ise ters çevrilir).
  2. Komşu yüzlerde < 5 mm kaymış aynı köşeler birleştiriliyor.
  3. Birleşince sıfır alanlı kalan ince parçalar (< 100 mm²) atılıyor.
  4. Duvar halkasındaki 1 mm'lik geri dönen dikenler siliniyor (V-034).

**Ornek2 üretim sonucu (çıkar → üret → doğrula):** M8'de 60, M9'da 12, şimdi **6 HATA**. Kalan 6'sı V-164: çatı arası pencerelerinin bina dış duvarında (LoD2) karşılığı yok, çünkü çatı arası dış duvarı en üst kat sınırıyla aynı hatta değil (ACIK-13, ayrı iş).

**Gerileme kontrolü:**
- Ornek1, Ornek5, Ornek6 (Biçim A ve B) 0 HATA.
- M7 konum korunumu sağlam.

## 2. M10: senin commit'inde 2 test başarısız

`0b6a9d1`'i **tek başına** (benim değişikliklerim olmadan) ayrı bir çalışma kopyasında denedim. `m10.test.ts`'teki şu iki test zaten başarısız:
- "Apartman şablonundan … doğrulamadan geçer"
- "Villa şablonundan … hatasız çalışır"

Şablonlardan üretilen GML'in kendi doğrulayıcımızdaki HATA sayıları:

| Şablon | Yalnız senin commit'in | Birleşik (şu anki `main`) | Kalan HATA kuralları |
|---|---|---|---|
| apartman | 51 | **27** | V-061 × 24, V-073, V-074, V-202 |
| villa | 13 | **9** | V-061 × 6, V-073, V-074, V-202 |
| dubleks | 11 | **9** | V-061 × 6, V-073, V-074, V-202 |
| ticariZemin | 23 | **23** | V-036 × 4, V-042a × 4, V-061 × 12, V-073, V-074, V-202 |

Benim kapak düzeltmem V-039 ve V-042a'nın bir kısmını giderdi. Kalanlar **şablon verisinden** geliyor:
- **V-061:** BB'lerde zorunlu öznitelik yok: `independentSectionCardinalDirection` (şablonda `cardinalDirections` boş). Muhtemelen MAKS numaraları da yok (`sectionInfo`).
- **V-073, V-074, V-202:** Bina ve parsel kimlik bilgileri. Hangi alanın eksik olduğunu doğrulayıcının mesajından gör.
- **ticariZemin V-036 ve V-042a:**
  - Bir iç halka dış halkayla özdeş, ya da delik dış halkaya değiyor.
  - Muhtemelen kısım poligonu BB sınırıyla aynı.
  - Ayrıca B-OP-05 "karşı yüz bulunamadı" üretim uyarıları var: açıklık 1000 mm içinde paralel duvar bulamıyor.

**İstenen:**
- Şablonları öyle tamamla ki dördünden üretilen GML kendi doğrulayıcımızda 0 HATA versin. Test bunu zaten bekliyor.
- Dubleks ve ticariZemin için de aynı testi ekle.
- **Kural:** Testleri yeşile çevirmek için doğrulayıcı kurallarını gevşetme; veriyi düzelt.

## 3. Kurallar (değişmedi)

- `npm run typecheck` 0 hata.
- `npm test` tümü geçmeli.
- 8 resmi kabul dosyasında 0 HATA. Bunu ben yerelde ölçüyorum; doğrulayıcıya dokunursan haber ver.
- Ornek6 altın testleri ve "Ornek6'dan üretilen GML 0 HATA" korunmalı.
- M7 konum korunumu bozulmamalı.

M10 bitince GitHub'a gönder. Kontrolü yerelde 9 dosyayla yaparım.

## 4. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
