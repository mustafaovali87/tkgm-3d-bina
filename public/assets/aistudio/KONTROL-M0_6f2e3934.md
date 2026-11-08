# CLAUDE, 08.11.2026, 04:25, 3DBİNA UYGULAMASI — KONTROL-M0 (GEMİNİ'YE)

> **Yazan:** Claude (denetçi), kullanıcı adına.
> **Denetlenen:** `mustafaovali87/tkgm-3d-bina`, dal `main`, commit `6d94c59` ("feat: initialize core audit and validation system").
> **Yöntem:** Repo bu bilgisayara klonlandı. Komutlar Gemini ortamından bağımsız olarak yeniden çalıştırıldı. Sonuçlar resmi dosyalarla ve ayrı yazılmış denetim betikleriyle karşılaştırıldı.

## SONUÇ: M0 KABUL (koşullu)

- Çekirdek doğru çalışıyor. Gemini'nin beyan ettiği sonuçların tamamı bağımsız olarak tekrarlandı.
- **M1'e geçmeden önce düzeltilmesi gereken 4 madde var: F1–F4.** Diğerleri M1 içinde yapılabilir.

---

## 1. Bağımsız çalıştırma sonuçları (bu bilgisayarda, Node 26.13 / npm 11.20)

| Komut | Sonuç |
|---|---|
| `npm ci` | **ÇALIŞMADI.** `package-lock.json` yok; repoda yalnız `bun.lock` var (bkz. F1). |
| `npm install` | **HATA (ERESOLVE).** Ancak `--legacy-peer-deps` ile kuruldu (bkz. F1). |
| `npm run typecheck` | 0 hata ✔ |
| `npm test` | **19/19 geçti** ✔ (Gemini ile aynı) |
| `npm run trace` | Çalıştı ✔. Tablo üretiliyor. Bazı kuralların test sütunu `-` (beklenen, M0 kapsamı dışı). |
| `npm run verify:samples -- fixtures` | Çalıştı ✔. 42 öznitelik, `unauthorizedAttributes: []`, `matchesOrnek6Expected42: true` |

## 2. Bağımsız olarak doğrulananlar

1. **15 referans dosya:** Repodaki `fixtures/ornek6.gml` ve 14 `resources/codelists/*.xml`, kullanıcının bilgisayarındaki orijinallerle **SHA-256 düzeyinde birebir aynı (15/15, 0 fark).** `resources/DOSYA_LISTESI.txt` de orijinalle aynı. CLAUDE13 §2.1 tam yerine getirilmiş.
2. **Ornek6 nesne sayıları:** Repo kodundan bağımsız sayıldı.

   | Önek | Sayı |
   |---|---|
   | `MB_` | 1 |
   | `K_` | 2 |
   | `BB_` | 2 |
   | `BBK_` | 16 |
   | `BLKN_` | 4 |
   | `KAPI_` | 44 |
   | `PEN_` | 38 |
   | `MBG_` | 1 |
   | `OA` | 0 |

   - Diğer değerler: `srsName=EPSG:5254`, `roofProjectionArea=120.79`, `buildingHeight=7.45`, onay tarihi `1999-12-09`.
   - Testteki değerlerin hepsi doğru.
3. **Kapı alt ofseti (+10 mm):** Değer gerçekten ölçülerek bulunuyor. Varsayılan değere düşülmediği ayrıca denetlendi: BBK bloğu, FloorSurface ve KAPI bulundu.
4. **Sınıflar ve referanslar (Ornek6):**
   - `xlink:href` değerlerinin 256/256'sı `#` ile başlıyor.
   - `independentSectionObjectReference` değerleri `#` olmadan `BB_…` biçiminde.
   - Sınıflar `KARARLAR.md §A.2` ile uyumlu: `gen:class BagimsizBolum` ×2, `grp:class Kat` ×2, `MimariBinaGrup` ×1, `bldg:class` `MimariBina` / `BagimsizBolumKisim` / `Balkon`.
5. **uuidv5:** RFC 4122 test vektörü doğru: `uuidv5("www.example.com", DNS) = 2ed6657d-e927-568b-95e1-2665a8aea6a2`.
6. **SHA-256:** `"abc"` test vektörü doğru. 717 KB dosyada da doğru sonuç veriyor (SHA testi geçiyor).
7. **Helmert:** 30° dönüklük + 100 ppm ölçekli ek bir senaryo denendi. `a`, `b` ve ppm 9 haneye kadar doğru çıktı (repodaki test dönüklüğü denemiyor; bkz. F8).
8. **Arsa payı:**
   - Farklı paydalı toplam doğru: 1/3 + 1/6 + 1/2 = 1/1.
   - Fikstür 1 (59/2178) ve fikstür 2 (−1183/104683) doğru.
   - Ciddiyetler `KARARLAR` ile uyumlu: boşluk V-198 B, pay 0 V-198b U, biçim V-198a H, toplam ≠ 1 V-199 B.
9. **Kurallara uyum:**
   - `src/core` içinde şunların hiçbiri yok: `Math.random`, `Date.now`, `new Date`, `randomUUID`, `fetch`, `window`, `document`, `any`.
   - Gemini API kullanılmıyor.
   - 45 öznitelik beyaz listesi doğru. Malik alanları GML yasak listesinde.
   - `<3 hane HATA` kuralı kaldırılmış: okumada sapma BİLGİ, yazmada HATA.
10. **K83 / K88:** `stripPersonalData` yok. `malik.ts` gelmiş ve yalnız uydurma örnek adlarla test edilmiş. CLAUDE13 §1 tam yerine getirilmiş.

---

## 3. Bulgular

### M1'den önce düzeltilecekler

**F1 (Orta) — Kurulum tekrarlanamıyor.**
- `package.json` içinde `esbuild ^0.25` var, ama `vite 8.3` sürümü `esbuild ^0.27 || ^0.28` istiyor. Sonuç: `npm install` ERESOLVE hatası veriyor.
- Repoda `package-lock.json` yok, bu yüzden `npm ci` hiç çalışmıyor.
- Electron paketlemesi ve bağımsız denetim için kilit dosyası şart.
- **Yapılacak:**
  - `esbuild` satırını kaldır veya `^0.28` yap.
  - `npm install` ile `package-lock.json` üret ve commit et.
  - `bun.lock` dosyasını sil veya ikisini tutarlı tut. Tek kaynak `package-lock.json` olsun.

**F2 (Orta) — Kanonik özet makineye göre değişebilir (K89).**
- Yer: `src/core/hash/canonical.ts:322`, `a.gmlId.localeCompare(b.gmlId)`.
- Yerel ayar (locale) verilmemiş. Sıralama, bilgisayarın dil ayarına göre değişebilir. Örneğin Türkçe sistemde `I/İ` ve `_` ile harf sırası farklı olabilir. O zaman aynı model iki bilgisayarda farklı özet verir. Bu, Mutlak Kural 6'ya aykırı.
- **Yapılacak:** Kod birimi karşılaştırması kullan: `(a.gmlId < b.gmlId ? -1 : a.gmlId > b.gmlId ? 1 : 0)`. Aynı değişikliği `readAttributes.ts:85` ve `:227` satırlarında da yap ('en' sabit olduğu için risk düşük, ama tek yöntem olsun).
- **Test:** Sıralaması yerel ayara duyarlı ID'lerle (`BB_İ…`, `BB_i…`, `BB_Z…`, `BB__…`) özet sabit kalmalı.

**F3 (Orta) — `src/core` saflığı derleyiciyle zorlanmıyor (Mutlak Kural 4).**
- `tsconfig.json` tüm projeye `DOM` kütüphanesini ve `node`/`vite` tiplerini veriyor. Bu yüzden `src/core` içine `document` veya `fs` yazılsa da tip denetimi geçer. Şu an ihlal yok, ama koruma da yok.
- `lint` betiği yalnızca `tsc --noEmit`; başlangıç talimatında eslint isteniyordu.
- **Yapılacak (ikisinden biri yeterli):**
  - Ya ayrı bir `tsconfig.core.json`: `include: ["src/core"]`, `lib: ["ES2022"]`, `types: []`, ve `typecheck` bunu da çalıştırsın.
  - Ya da eslint'e `no-restricted-globals` (`window`, `document`, `fetch`) ve `no-restricted-imports` (`fs`, `path`, `node:*`, `react`) kuralı, `src/core/**` için.
- Test dosyaları (`__tests__`) `node:fs` kullanabilir; onları hariç tut.

**F4 (Orta) — Kullanıcı girdisinde çökme.**
- `parseMaksIdValue('12a')` bir istisna fırlatıyor: `Cannot convert 12a to a BigInt`.
- MAKS no kullanıcı tarafından elle girilecek (K88-yeni). Hatalı girdi uygulamayı çökertmemeli, doğrulama mesajı üretmeli.
- **Yapılacak:** `/^\d{1,19}$/` kontrolü ekle. Uymayan girdide `{ value: null, issue: { ruleId: 'V-213', severity: 'H', … } }` dön.
- **Test:** `'12a'`, `' 5415689768 '`, `'-1'`, `''` girdileri.

### M1 içinde yapılacaklar

**F5 (Düşük) — Okuyucu `<gml:posList>` etiketini yalnız özniteliksiz biçimde tanıyor.**
- Yer: `readAttributes.ts:177` ve `:266`.
- `<gml:posList srsDimension="3">` gibi bir dosyada iki sorun çıkar:
  - `coordinateEncoding` yanlış bulunur.
  - Kapı ofseti hiç ölçülemez ve sessizce varsayılan **10** değerine düşer (`:201`).
- Varsayılana sessizce düşmek hatayı gizler.
- **Yapılacak:**
  - Regex `<gml:posList\b[^>]*>` olsun.
  - Ölçülemeyen ofset `null` + BİLGİ mesajı olsun, `10` olmasın.

**F6 (Düşük) — Kat biçimi tespiti yalnız ilk `K_` grubundaki `Floor_` sayısına bakıyor.**
- Kurallar: 1 → A, 2 → C, diğer → B.
- Ornek6 için doğru. Biçim B/C dosyaları repoda olmadığından henüz test edilmedi.
- M1'de GML okuyucu yazılınca tüm katlara bakılsın ve tutarsızlık BİLGİ olarak raporlansın.
- Gerçek kabul dosyalarıyla karşılaştırmayı ben bu bilgisayarda yapacağım. 18 gerçek dosya buluta yüklenmeyecek.

**F7 (Düşük) — `parsePropertyLot('+5/10')` uyarısız kabul ediliyor.**
- İşaret karakteri arsa payında anlamsız.
- **Yapılacak:** Regex `^(\d+)\/(\d+)$` olsun. `+` veya `-` içeren girdi V-198a HATA versin.

**F8 (Düşük) — Bazı testler kendini doğruluyor.**
- **`fetch` yasağı testi:** Testin kendi koyduğu sahte `fetch`'i deniyor, uygulama kodunu değil.
- **K89 "UI durumu özeti değiştirmez" testi:** Fonksiyon bu parametreyi zaten okumuyor (`_ignoredUiState`), bu yüzden kendiliğinden geçiyor.
- Yanlış değiller, ama güvence saymıyorum.
- **Yapılacak:**
  - Helmert testine dönüklüklü (ör. 30°) bir fikstür ekle.
  - K89 için "aynı model, farklı nesne sırası → aynı özet" testi ekle.

**F9 (Düşük) — `.env.example` dosyasında şablon kalıntısı var.**
- `GEMINI_API_KEY` ve `APP_URL` duruyor. Mutlak Kural 5 gereği uygulama bunları kullanmaz.
- **Yapılacak:** Dosyayı sil veya boşalt.

**F10 (Bilgi) — Denetim konsolu canlı değil.**
- `src/generated/m0AuditData.ts` dosyası, Gemini ortamında 01:08'de alınmış çıktının sabit kopyası. Konsol canlı sonuç göstermiyor.
- Kabul edilebilir. Ekranda "kaydedilmiş çıktı, `<tarih>`" diye etiketlensin.

**F11 (Bilgi) — `ACIK-01` (Teras) için yanıt.**
- `<bldg:class>Teras</bldg:class>` Ornek3'te **9 kez** geçiyor (CLAUDE13 §3'te doğrulandı). Yani sınıf değeri ölçülmüş durumda.
- Açık kalan tek nokta Teras nesnesinin `gml:id` öneki (`TRS_` mi?). Bunu Ornek3 üzerinden ben ölçüp bildireceğim. O zamana kadar `TRS_` öneki kullanılmasın.

**F12 (Bilgi) — Ad ve sabitlerle ilgili iki karar.**
- `package.json` içinde `"name": "react-example"` yazıyor; `tkgm-3d-bina` olsun.
- `TKGM3D_UUID_NAMESPACE` şu an standart DNS ad alanı (`6ba7b810-…`). Çalışıyor, ama M3'te GML yazıcısı ilk kez ID ürettikten sonra **bu değer bir daha değiştirilemez**: her değişiklik tüm `gml:id` değerlerini değiştirir.
- Projeye özel sabit bir UUID mi kullanılsın, DNS ad alanı mı kalsın? Bu M3'ten önce `KARARLAR.md`'ye yazılsın.

---

## 4. M1'e başlarken

1. Önce F1–F4'ü düzelt, testleri çalıştır ve GitHub'a gönder.
2. Ben aynı commit'i burada `npm ci` ile kurup yeniden çalıştıracağım. **`npm ci` hatasız çalışmalı.**
3. F5–F12 M1 commit'lerinde yapılabilir. `docs/ADIM_NOTU.md` içinde her bulgu kodu (F1…F12) için "yapıldı / bekliyor" satırı olsun.
4. Bu rapordaki bir maddeyi yanlış buluyorsan gerekçesiyle yaz. İkna edemezsek kullanıcı karar verir.

## 5. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
