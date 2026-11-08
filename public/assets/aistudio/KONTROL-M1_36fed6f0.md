# CLAUDE, 08.11.2026, 05:35, 3DBİNA UYGULAMASI — KONTROL-M1 (GEMİNİ'YE)

> **Yazan:** Claude (denetçi), kullanıcı adına.
> **Denetlenen:** commit `699bdc2` ("feat: implement M1 3D GML viewer and D-23 layout").
> **Ortam:** Windows 11, Node 26.13. Uygulama `npm run dev` ile yerel tarayıcıda açıldı.
> **Örnekler:** 9 resmi TKGM dosyası bu bilgisayarda okundu. Ornek1–6, Amasya, Sincan ve reddedilmiş `GML_M-17273333-F`. Bu dosyalar buluta yüklenmedi.

## SONUÇ: M1 KABUL (koşullu)

- Okuyucu 9 dosyanın tamamını açıyor.
- Nesne ve poligon sayıları bağımsız sayımla **birebir** aynı.
- D-23.6 kabul testinin 5 maddesi de geçti.
- **M2'ye geçmeden önce G1 yapılmalı.** G2–G5, M2'nin ilk commit'inde yapılabilir.

---

## 1. Komutlar (temiz kurulum)

| Komut | Sonuç |
|---|---|
| `npm ci` | ✔ 174 paket, hata yok |
| `npm run typecheck` (genel + `tsconfig.core.json`) | ✔ 0 hata |
| `npm test` | ✔ **28/28** (m0: 23, m1: 5) |
| Tarayıcı konsolu | ✔ 0 hata |

## 2. 9 resmi dosya — bağımsız ölçüm

- **Okuma:** `parseCityGmlModel` bu bilgisayarda Node ile çalıştırıldı. Süre ve bellek ölçüldü.
- **Karşılaştırma:**
  - Nesne sayısı, ham XML'de nesne önekiyle başlayan `gml:id` değerlerinden ayrı olarak sayıldı. 12 önek: `MB_`, `K_`, `BB_`, `BBK_`, `OA_`, `BBKIY_`, `OAIY_`, `BLKN_`, `TRS_`, `MBG_`, `KAPI_`, `PEN_`.
  - Poligon sayısı da `gml:Polygon` etiketlerinden ayrı sayıldı.

| Dosya | MB | Süre (ms) | Bellek (MB) | Nesne | Poligon (okuyucu = bağımsız) | Sayım farkı | Kat biçimi | Kapı ofseti | Profil |
|---|---|---|---|---|---|---|---|---|---|
| Ornek1 | 28,7 | 2.167 | 331 | 3.458 | 29.163 = 29.163 | yok | A | 10 | A10 |
| Ornek2 | 2,8 | 169 | 30 | 309 | 3.451 = 3.451 | yok | B | 50 | B50 |
| **Ornek3** | **39,7** | **8.245** | **400** | 5.114 | 45.528 = 45.528 | yok | B | 50 | B50 |
| Ornek4 | 3,9 | 789 | 92 | 531 | 3.929 = 3.929 | yok | A | 10 | A10 |
| Ornek5 | 3,1 | 613 | 24 | 443 | 3.661 = 3.661 | yok | B | 50 | B50 |
| Ornek6 | 0,7 | 147 | — | 108 | 741 = 741 | yok | A | 10 | A10 |
| Amasya | 0,5 | 51 | 9 | 26 | 446 = 446 | yok | A | — | A10 |
| Sincan | 5,4 | 800 | 84 | 691 | 4.725 = 4.725 | yok | B | 10 | **B50 ✘** (bkz. G2) |
| GML_M-17273333-F (ret) | 0,8 | 48 | 11 | 26 | 782 = 782 | yok | A | — | A10 |

**Önceki ölçümlerle karşılaştırma (tutarlı):**
- **Kat biçimi:** Ornek1/4/6 ve Amasya **A**; Ornek2/3/5 ve Sincan **B** (N2, N26).
- **Kapı ofseti:** Ornek1/4/6 **10 mm**; Ornek2/3/5 **50 mm**; Sincan **B + 10 mm** (N12, AS-7).
- **Arsa payı:** Ornek1 toplamı **6614/6534** (N21 ile aynı). Ornek2 **616/616**, Ornek5 **24/27**.
- **Halkalar:** 4 köşeden az olan halka: 0 (9 dosyada).

## 3. Arayüz — D-23.6 kabul testi (tarayıcıda denendi)

| # | Test | Sonuç |
|---|---|---|
| 1 | Ornek6 açılır | ✔ Gömülü olarak açılıyor. D-23.1 düzeni doğru: ağaç / 2B / 3B / doğrulama / öznitelik. |
| 2 | Ağaçta `BBK_` seçilince 3B ve 2B'de vurgulanır, öznitelik panelinde `partUsage` görünür | ✔ "Salon" seçildi: 2B ve 3B'de turuncu vurgu, panelde `partUsage 1003 Salon (partUsage.xml)`. |
| 3 | Panel boyutu ve düzen kaydedilir | ✔ `localStorage` (`tkgm3d_d23_layout_v1`). Electron'da `userData` dizinine taşınmalı (D-23.4). M10'da kontrol edilecek. |
| 4 | F5–F8 düzen değiştirir, özet değişmez | ✔ F6 → "Yan Yana" düzeni. K89 özeti önce ve sonra `bae9d74f40cd80a7`. F5 tuşunda `preventDefault` var. |
| 5 | Genişlik < 1366 px → sekme düzeni | ✔ 1200 px'te sekme moduna geçiyor, 1600 px'te geri dönüyor. 3B tuval yeniden boyutlanıyor. |

**Not:** Ağaçta satırın ad yazısına ilk tıklamada kamera döndü ama seçim değişmedi. Satırın kendisine tıklayınca seçim çalıştı. Bir kez görüldü, tekrar denenmedi; M2'de bakılsın.

---

## 4. Bulgular

### M2'den önce

**G1 (Orta) — Büyük dosyada arayüz donar.**
- **Durum:**
  - Okuma ana iş parçacığında yapılıyor; `new Worker` yok.
  - Ornek3 Node'da **8,2 sn** sürüyor. Kabul sınırı olan 10 sn'ye çok yakın ve tarayıcıda daha yavaş olabilir.
  - Bu süre boyunca pencere hiçbir tıklamaya yanıt vermez.
  - Bellek kullanımı yaklaşık **400 MB**. `fast-xml-parser` tüm dosyayı nesne ağacına çeviriyor; şartnamede akış tipi okuyucu (SAX, §9.6) öngörülüyordu.
- **Yapılacak:**
  1. `parseCityGmlModel` bir **Web Worker** içinde çalışsın (PERF-01). Arayüzde ilerleme çubuğu ve "İptal" düğmesi olsun.
  2. Sonuç ana iş parçacığına aktarılsın. Poligon köşeleri `Float64Array` olarak transfer edilirse kopya maliyeti düşer.
  3. **Kabul:** Ornek3 açılırken arayüz donmamalı (ilerleme çubuğu akmalı).
- Akış tipi okuyucuya şimdi geçmek şart değil. Bellek 1 GB'ı aşarsa yeniden ele alınır. Bu bilgisayarda Ornek3'ün süresini ve belleğini her adımda ölçmeye devam edeceğim.

### M2'nin ilk commit'inde

**G2 (Düşük) — Üretici profili yalnız kat biçimine bakıyor.**
- Yer: `gmlReader.ts:1154`. B biçimi → `B50`, C → `C50`, diğerleri → `A10`.
- Sincan **Biçim B + kapı 10 mm**, ama okuyucu `B50` diyor (N12 / AS-7: bu ikisi bağımsızdır).
- **Yapılacak:**
  - Profil, biçim ile ölçülen kapı ofsetinin birleşimiyle bulunsun.
  - Tanımlı profillere uymayan bir birleşimde (ör. B + 10) profil adı ve ofseti olduğu gibi gösterilsin ve **BİLGİ** üretilsin: "profil dışı birleşim".
  - Ofset ölçülemiyorsa profil "biçim A, ofset bilinmiyor" diye gösterilsin.

**G3 (Düşük) — Ölçülemeyen kapı ofseti sessiz kalıyor.**
- Amasya ve reddedilmiş dosyada `detectedDoorBottomOffsetMm = null`, ama `readerIssues` boş.
- KONTROL-M0 F5'in cevabında V-215 BİLGİ üretileceği yazılmıştı; M1 okuyucusunda bu yok.
- **Yapılacak:** Değer `null` ise `readerIssues` listesine **V-215 B** ekle: "kapı alt ofseti ölçülemedi".

**G4 (Düşük) — `propertyLot` olmayan eski dosyalarda yanlış arsa payı gösteriliyor.**
- Amasya ve Sincan'da (eski rejim, Rejim E) hiç `propertyLot` özniteliği yok.
- Okuyucu yine de `0/1` toplam ve `uniqueBb = 16` gösteriyor. Mesaj da üretmiyor.
- **Yapılacak:** Hiçbir BB'de `propertyLot` yoksa:
  - toplam hesaplanmasın;
  - "Arsa payı bilgisi yok (eski rejim dosyası)" **BİLGİ** mesajı üretilsin;
  - ekranda `0/1` yerine `—` gösterilsin.

**G5 (Düşük) — V-214 ciddiyeti.**
- `intAttribute` içindeki TAB karakteri **UYARI** veriyor.
- Ama TKGM'nin kendi resmi örneği Ornek6 bunu içeriyor (`maksIdentityNumber = "\t5129820196"`) ve kabul edilmiş durumda. Yani TKGM bunu reddetmiyor.
- **Öneri:**
  - Okumada **BİLGİ** olsun.
  - Üretimde boşluk hiç yazılmasın (yazıcı `trim` uygular).
- Katılmıyorsan gerekçeni yaz.

### Bilgi

**G6 — 9 dosyalık kabul testi repoda tekrarlanamıyor.**
- Ornek1 ve Ornek3 AI Studio'ya yüklenemeyecek kadar büyük; bu yüzden repodaki testler yalnız Ornek6'yı açıyor.
- **Öneri:** `npm run verify:samples <klasör>` komutu, M1 okuyucusuyla klasördeki her `.gml` dosyası için şunları tek satır JSON olarak yazsın:
  - süre, nesne ve poligon sayısı;
  - kat biçimi, kapı ofseti, profil;
  - arsa payı toplamı;
  - ciddiyet sayıları.
- Ben her adımda bu komutu yerel 9 dosyada çalıştırıp tabloyu karşılaştırırım (bu raporun §2'deki tablosu).

**G7 — `src/App.tsx` 2.653 satır.**
- M2'de doğrulama paneli de buraya eklenirse denetlenemez hale gelir.
- M2'den önce şu bileşenlere bölünsün: `layout/`, `panels/TreePanel`, `panels/AttributePanel`, `panels/ValidationPanel`. Ayrıca durum yönetimi (`selection`, `workspace`) ayrı bir dosyaya alınsın.
- Davranış değişmesin. 28 test ve D-23.6 maddeleri aynı sonucu vermeli.

**G8 — Ad alanı önekine bağımlılık.**
- Okuyucu öğeleri sabit öneklerle arıyor: `core:CityModel`, `gml:boundedBy`. Başka önek kullanan geçerli bir CityGML dosyası açılamaz.
- 9 resmi dosyanın hepsi standart önekleri kullandığı için şu an sorun yok.
- M3'ten (yazıcı) önce `removeNSPrefix` veya ad alanı URI'sine göre eşleme düşünülsün.

---

## 5. Sonraki adım

1. G1'i yap; Ornek3 açılırken ilerleme çubuğu görünsün.
2. G2–G5'i M2'nin ilk commit'ine koy. İstersen G6 ve G7'yi de aynı anda yap.
3. Her bulgu için `docs/ADIM_NOTU.md` dosyasına "yapıldı / bekliyor" satırı yaz ve GitHub'a gönder. Sonra dur.
4. Ben 9 dosyalık tabloyu ve D-23.6 testini yeniden çalıştırırım.

## 6. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
