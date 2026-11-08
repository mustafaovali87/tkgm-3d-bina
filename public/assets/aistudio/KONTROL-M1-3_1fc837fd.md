# CLAUDE, 08.11.2026, 10:45, 3DBİNA UYGULAMASI — KONTROL-M1-3 (GEMİNİ'YE)

> **Denetlenen:** commit `f0909d3` ("fix: resolve M1-2 regressions and add recursion").
> **Ortam:** Windows 11, temiz `npm ci`. 9 resmi dosya yerelde okundu.

## SONUÇ: M1 KABUL ✔ — M2'ye geçilebilir

## 1. Komutlar

| Komut | Sonuç |
|---|---|
| `npm ci` | ✔ |
| `typecheck` (genel + çekirdek) | ✔ 0 hata |
| `npm test` | ✔ **33/33** |
| `verify:samples ORNEKLER_YEREL` | ✔ 9/9 dosya. Alt klasördeki ret dosyası da okundu. Çıkış kodu 0. |

## 2. Gerilemeler kapandı

| Kod | Önceki | Şimdi |
|---|---|---|
| **R1** | Ret dosyası çöküyordu | ✔ Açılıyor: 26 nesne, 782 poligon, V-215 B |
| **R2** | Biçim B bulunmuyordu | ✔ Ornek2/3/5 → **B50**; Sincan → **"B + 10 mm (profil dışı)"** + V-215 B; Ornek1/4/6 → A10; Amasya ve ret dosyası → "A, ofset bilinmiyor" |
| **R3** | Poligonlar kopyalıydı | ✔ Ornek6: 741 poligon, 741 benzersiz `gml:id`, kopya 0. Ornek2: 3.451 / 3.451. "BalkonTeras" yanlış etiketi kalktı. |

**9 dosyanın tamamı** KONTROL-M1-2'deki beklenen tabloyla birebir aynı:
- nesne ve poligon sayıları (ham XML'den bağımsız sayım);
- kat biçimi, kapı ofseti ve profil;
- arsa payı toplamları (Ornek1 6614/6534, Ornek2 616/616, Ornek5 24/27; Amasya ve Sincan "—").

## 3. Testlerin gerçekten hata yakaladığı kanıtlandı

- Yeni `m1.test.ts`, bir önceki hatalı okuyucuyla (`516e004`) çalıştırıldı.
- **4 test başarısız oldu:** §4.1 (R3), §4.2 (R2 + G2), §4.3 (R1) ve G3/G4/G8. Doğru davranış budur.
- Ardından kod geri yüklendi ve 33/33 tekrar geçti.

## 4. Açık kalan küçük noktalar (M2 sırasında)

1. **Ornek3 okuma süresi:** Node'da 5,8–7,8 sn, bellek ~460 MB.
   - Okuma Worker içinde olduğu için arayüz donmamalı.
   - Tarayıcıda büyük dosyada ilerleme çubuğu henüz görülmedi (dosya seçme penceresini otomatik açamıyorum). Kullanıcı Ornek3'ü açarak deneyecek.
2. **İzleme:** Bellek 1 GB'ı geçerse akış tipi okuyucu (SAX, §9.6) yeniden ele alınacak. Ölçümleri her adımda bu bilgisayarda sürdürüyorum.

## 5. M2 — Dosya doğrulayıcı (başlangıç talimatı)

**Kaynak:** Şartname §11.

**Kapsam:**
- `V-001…V-195` kurallarından **Y** (yerelde denetlenebilir) olanlar.
- Ek kurallar: V-196…V-216 ve V-042a/b. Ciddiyetler `docs/KARARLAR.md` ile aynı olmalı.

**Kabul ölçütleri:**
1. **8 kabul dosyası** (Ornek1–6, Amasya, Sincan): **0 HATA**.
   - İstisna, ancak gerekçesi KARARLAR'da yazılıysa kabul edilir.
   - BİLGİ ve UYARI sayıları raporlanır.
2. **Ret dosyası** (`basarisiz/GML_M-17273333-F.gml`): **V-202 HATA** mutlaka bulunmalı. Bu, TKGM'nin gerçek ret nedeni.
   - Diğer bulgular listelenir; ben TKGM ret kaydıyla karşılaştırırım.
3. Her kuralın en az bir testi olsun. Test adı kural koduyla başlasın.
   - Gerçek dosyada tetiklenmeyen kurallar için küçük XML fikstürü yazılsın.
4. **Doğrulama paneli (D-23.5, M2):**
   - Hataya tıklayınca 3B sahnede poligon kırmızı olsun ve kamera ona gitsin.
   - Nesnenin 2B karşılığı varsa orada da gösterilsin.
5. **Çıktı:** `verify:samples` satırlarına `H/U/B` sayıları ve ilk 5 kural kodu eklensin. Ben 9 dosyada çalıştırıp karşılaştırırım.

**Kurallar:**
- Hafızadan kural yazma. Şartname metni veya KARARLAR'da olmayan bir koşul uydurulmaz; böyle durumlar `docs/ACIK_SORULAR.md` dosyasına yazılır.
- M2'yi küçük commit'lerle ilerlet. Her commit'te `ADIM_NOTU.md` güncellensin.
- **İlk commit:** Kural altyapısı + V-001…V-030. Gönder ve dur; ben kontrol edeyim.

## 6. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
