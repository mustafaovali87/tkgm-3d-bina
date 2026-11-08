# AI STUDIO BAŞLANGIÇ TALİMATI — TKGM 3B Mimari Bina GML Uygulaması

> Bu metni AI Studio projesinin **ilk mesajı** (veya sistem talimatı) olarak yapıştırın. Hazırlayan: Claude (denetçi), kullanıcı adına, 08.11.2026.

## Görev

Harita mühendisleri için TKGM "3B Sayısal Yapı Modeli" GML dosyası (TKGMCityGML, `M-<constructionID>.gml`) üreten ve doğrulayan bir uygulama yazacaksın.
- **Geliştirme:** Bu AI Studio web projesi (React + TypeScript).
- **Teslim:** Electron ile paketlenmiş, çevrimdışı çalışan Windows uygulaması.

Kodu sen yazacaksın. Kodu **Claude denetleyecek**: GitHub üzerinden çekecek, testleri kendisi çalıştıracak ve gerçek TKGM dosyalarıyla karşılaştıracak.

## Doğruluk kaynakları (bu projeye yüklenen dosyalar)

1. `claude_uygulama_sartnamesi_v3.md`: Normatif şartname. Kurallar (K01–K69), doğrulama kuralları (V-001–V-195) ve §3 XML şablonları.
2. `CLAUDE12.md` Ek-A: Kesin karar listesi (sonraki turların değişiklikleri). Repo içinde `docs/KARARLAR.md` olarak sakla.
3. `fixtures/ornek6.gml`: TKGM'nin resmi örnek dosyası. **Altın dosya.**
4. `resources/codelists/*.xml`: 14 resmi TKGM kod listesi.

## Mutlak kurallar

1. **Hafızadan şema yazma.** Öznitelik adı, sınıf değeri, kod değeri, `gml:name` deseni veya XML eleman sırası **yalnız** bu dosyalardan alınır. Dosyalarda yoksa kod yazma; `docs/ACIK_SORULAR.md` dosyasına yaz ve sor.
2. **Öznitelik beyaz listesi kodda sabit** (`docs/KARARLAR.md` §A.3). Yazıcı listede olmayan bir ad yazamaz; bunu doğrulayan bir test olmalı.
3. **Kod değerleri** her zaman `resources/codelists` XML'lerinden okunur; TypeScript'e elle yazılmaz.
4. **`src/core/` saf TypeScript.** DOM, React, `window`, `document`, `fs`, `path` kullanmaz. Dosya erişimi `PlatformAdapter` arayüzü üzerinden yapılır: tarayıcıda dosya seç/indir, Electron'da Node.
5. **Çalışma anında ağ isteği yok.** Gemini API, `@google/genai`, `GEMINI_API_KEY`, CDN/importmap ile çalışma anında paket indirme **kullanılmaz**. Tüm paketler npm ile kurulur ve derlemeye gömülür. Testlerde `fetch` çağrısı test hatasıdır.
6. **Deterministik çıktı.** `gml:id` için uuidv5 kullanılır; `Math.random`, `Date.now`, `crypto.randomUUID` kullanılmaz. Aynı model iki kez yazıldığında aynı baytlar çıkar.
7. **Tapu değerleri otomatik üretilmez.** Bağımsız bölüm numarası, arsa payı, nitelik, eklenti, kat tanımı ve MAKS numarası liste beyandan aynen alınır. Uygulama yalnız karşılaştırır.
8. **Kişisel veri yok.** T.C. kimlik no, ad, telefon, e-posta repoya, fikstüre veya loga girmez.
9. **TypeScript `strict`, `any` yasak.** MAKS no `string` veya `bigint` olarak tutulur. Arsa payı `BigInt` ile hesaplanır. Koordinatlar mm tamsayıdır.
10. **"Tamamlandı" yalnız test çıktısıyla yazılır.** Her adımda `docs/ADIM_NOTU.md` güncellenir: ne yapıldı, hangi testler eklendi, test sonucu (geçen/kalan sayıları), bilinen eksikler.
11. **Var olan dosyaları baştan yazma.** Yalnız ilgili bölümü değiştir. Geçen bir test kırılırsa önce onu düzelt.
12. **Her oturumun başında** `docs/KARARLAR.md`, `docs/ADIM_NOTU.md` ve `docs/ACIK_SORULAR.md` dosyalarını oku.

## Kural izlenebilirliği

- Bir kuralı uygulayan her fonksiyonun üstüne kural kodu yorumu yaz (`// K45`, `// V-198a`).
- Her test adı kural koduyla başlasın (`test('V-198a: payda 0 → HATA', …)`).
- `npm run trace` komutu, hangi kural kodunun hangi dosyada ve hangi testte geçtiğini tablo olarak üretsin.

## package.json betikleri (zorunlu)

`typecheck` · `lint` · `test` (vitest, tarayıcısız) · `trace` · `verify:samples <klasör>`

`verify:samples` her GML için JSON rapor üretir:
- nesne sayıları
- öznitelik adı ve tipi listesi
- sınıf değerleri
- kat biçimi (A/B/C)
- kapı deliği ve kapı nesnesi alt ofsetleri
- delik–kenar en küçük mesafe
- arsa payı toplamı (BigInt)
- GroundSurface sayısı ve halka yönü

## İlk iş: yalnız M0 (arayüz yok)

1. Proje iskeleti: React + Vite + TS strict, vitest, eslint. `src/core/` ve `src/platform/` ayrımı.
2. `src/core/codelists`: 14 XML'i okuyan yükleyici + testler (her listenin kod/etiket çiftleri).
3. `src/core/model`: veri modeli tipleri (Ek-A'ya göre).
4. `src/core/math/landShare.ts`: BigInt arsa payı. GEMINI11'deki `verifyLandSharesBigIntV351` mantığı ve 3 fikstür (Ornek1 #41 → 59/2178; FUA5P9 → 103500/104683, fark −1183; boşluklu pay + küçük harf).
5. `src/core/math/helmert2d.ts`: benzerlik dönüşümü, ölçek ve ppm, artıklar + elle çözülmüş testler.
6. `src/core/math/ring.ts`: işaretli alan ve halka yönü. Test: (0,0) (10,0) (10,10) (0,10) → +100 → CCW; ters sıra → CW.
7. `src/core/privacy/stripPersonalData.ts` + test.
8. `src/core/hash/canonical.ts`: kanonik özet. Profil değişirse özet değişir, kamera değişirse değişmez.
9. `src/core/gml/readAttributes.ts` (salt okuma): `fixtures/ornek6.gml` içinden öznitelik adı:tipi listesini çıkar. Test: liste `docs/KARARLAR.md` §A.3 ile **birebir** aynı olmalı.
10. `docs/ADIM_NOTU.md`'yi doldur ve GitHub'a senkronize et. Ardından dur; Claude'un kontrol raporunu bekle.

M0 bitmeden arayüz, 3B sahne veya GML yazıcısı yazma. GML yazıcısı M3'te, yalnız Ornek6 altın dosya testiyle yazılır.
