# M3 — ÖZNİTELİK DÜZELTİCİ VE GML YAZICISI

> **Yazan:** Claude, kullanıcı adına, 08.11.2026. Gemini'nin günlük limiti dolduğu için kullanıcının isteğiyle Claude yazdı.
> **Kaynaklar:**
> - Şartname §7.7 (GML görüntüleyici ve öznitelik düzeltici) ve §11 (M3 kabul ölçütü: "Gidiş-dönüş testi geçiyor").
> - K70: iki kayıt kipi. OY-02: hane kuralı. K99: öznitelik beyaz listesi.

## 1. Ne yapar

| İşlev | Nerede | Davranış |
|---|---|---|
| Öznitelik değeri düzenleme | Öznitelik paneli, değere tıkla | Değer değişir, tip denetlenir (V-062). Çok değerli öznitelikler (`independentSectionCardinalDirection`, `storeyUsage`) bu sürümde düzenlenmez. |
| Nesne adı düzenleme | Öznitelik panelinde nesne adına tıkla | Yalnız nesnenin kendi `gml:name` değeri değişir; yüzey adları değişmez. |
| **Sayımlar** | Üst şerit | `totalIndependentSectionCount`, Kat `independentSectionCount` ve BB `partCount` değerlerini dosyadaki nesnelerden yeniden sayar. |
| **Adlar** | Üst şerit | Adları V-058 ile **aynı kuralla** yeniden üretir. Kurallar `src/core/gml/names.ts` içinde, iki yer aynı fonksiyonu kullanır. |
| **Alanlar** | Üst şerit | Kısım ve OA `calculatedArea` değerini taban poligonlarının alanından yeniden yazar (2 ondalık, V-155). |
| **Normalize** | Üst şerit | K70 Normalize kaydı: `posList` + tam 3 ondalık. Ardından doğrulama yeniden çalışır ve öncesi/sonrası kural farkları şeritte gösterilir. |
| **Geri al** | Üst şerit | Son 20 işlem geri alınabilir. |
| **Kaydet** | Üst şerit | Geçerli metni `M-<constructionID>.gml` adıyla indirir (Düzeltme kipi). |

Her işlemden sonra dosya Worker'da yeniden okunur ve doğrulanır. Seçili nesne korunur. Şeritte "Doğrulama: H a→b, U …" özeti çıkar.

## 2. İki kayıt kipi (K70, OY-02)

**Düzeltme (varsayılan):**
- Yalnız istenen öznitelik ve ad metinleri değişir.
- Geometri metni korunur; `pos`/`posList` biçimi değişmez.
- OY-02 gereği 3 haneden kısa koordinatlar sıfırla 3 haneye tamamlanır (örnek: `1095.9` → `1095.900`). Sayısal değer değişmez.
- 3 hane ve daha uzun koordinatlar aynen kalır.

**Normalize:**
- Halkalar ve TIC çizgileri tek `gml:posList` ve tam 3 ondalıkla yazılır. Envelope köşeleri de 3 ondalığa yuvarlanır.
- Yuvarlamadan sonra ardışık eş noktalar silinir. Halka 4 noktanın altına düşerse o halkaya dokunulmaz ve uyarı verilir.
- int ve double değerlerin baş/son boşlukları kırpılır (V-214).
- Çıktı: BOM yok, CRLF, `encoding="utf-8"`.
- İkinci kez normalize etmek hiçbir şeyi değiştirmez.

## 3. Güvenlik kuralları (kodda zorlanır)

- **Beyaz liste:** Listede olmayan bir öznitelik yazılamaz (K99, V-060). Malik alanları bu yüzden GML'e hiçbir yoldan giremez.
- **Tip:** Var olan özniteliğin tipi değiştirilemez. Değer tipe uymuyorsa (tam sayı alanına metin gibi) reddedilir.
- **Tekrar:** Bir öznitelik nesnede iki kez varsa (V-061) düzenleme reddedilir; önce tekrarın giderilmesi istenir.
- **Kaçış:** Metin değerlerde `&`, `<`, `>`, `"` karakterleri XML kaçışıyla yazılır.

## 4. Ölçüm: 9 resmi dosya (yerelde)

| Dosya | Önce H | Düzeltme (boş) H | Normalize H | Normalize + Alanlar H |
|---|---|---|---|---|
| Ornek1 | 0 | 0 | **1** (V-155) | 0 |
| Ornek2 | 0 | 0 | 0 | 0 |
| Ornek3 | 0 | 0 | **17** (V-155) | 0 |
| Ornek4 | 0 | 0 | **1** (V-155) | 0 |
| Ornek5 | 0 | 0 | 0 | 0 |
| Ornek6 | 0 | 0 | 0 | 0 |
| Amasya | 0 | 0 | 0 | 0 |
| Sincan | 0 | 0 | 0 | 0 |
| Ret dosyası | 10 | 10 | 10 | 10 |

- **Neden:** Normalize koordinatları mm'ye yuvarladığı için bazı oda tabanlarının alanı 0,01 m²'den fazla değişiyor (V-155).
- **Çözüm:** K70 bu durumu öngörüyor (öncesi/sonrası tablosu). "Alanlar" düğmesi `calculatedArea` değerini yeni geometriden yazar ve HATA tekrar 0 olur. `calculatedArea` tanımı gereği geometriden hesaplanan alandır.
- **Süre:** Normalize, en büyük dosya Ornek3'te yaklaşık 0,5 sn sürüyor.

## 5. Testler (`src/core/__tests__/m3.test.ts`, 16 test)

- **Gidiş-dönüş:**
  - Düzenleme yoksa ve hane tamamlama kapalıysa çıktı bayt bayt aynıdır (SHA-256 eşit).
  - Hane tamamlama açıkken bütün köşe değerleri, TIC ve öznitelikler sayısal olarak aynıdır; doğrulama 0 HATA.
- **Düzenleme:** Yalnız istenen değerler değişir; 948 halkanın ham koordinat metni birebir aynı kalır.
- **Ekle/sil:** Bir öznitelik silinip geri eklenince dosya geçerli kalır.
- **Ret:** Hatalı tip, beyaz liste dışı ad (`malik`), tip değişikliği ve çok değerli öznitelik düzenlemesi reddedilir.
- **Sayım ve ad:** Bozulan `partCount` ve bozulan ad yeniden hesaplanınca dosya özgün haline **bayt bayt** döner.
- **Normalize:** `posList` + 3 hane; V-030 ve V-214 kalmaz; 0 HATA; nesne, poligon ve halka sayısı aynı; köşeler ≤ 0,5 mm kayar; CRLF, BOM yok; ikinci normalize değişiklik yapmaz.

## 6. Kapsam dışı (sonraki sürüm)

- Çok değerli özniteliklerin (yön, kat kullanımı) liste olarak düzenlenmesi.
- `diffImportedModels` (OY-03): iki GML'in nesne nesne farkı. Şu an yalnız kural bazında öncesi/sonrası farkı var.
- Electron'da "Farklı kaydet" penceresi (PlatformAdapter, M10). Tarayıcıda indirme olarak çalışıyor.
