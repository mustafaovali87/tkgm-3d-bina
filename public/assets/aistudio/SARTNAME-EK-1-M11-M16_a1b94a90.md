# CLAUDE, 08.11.2026, 23:00, 3DBİNA UYGULAMASI — ŞARTNAME EKİ 1: SORUNLAR, ÇÖZÜMLER VE M11–M16 AŞAMALARI

> **GÜNCELLEME (08.11.2026, 23:40):** `SARTNAME-EK-2-HARITA-MUHENDISI-IS-AKISI.md` bu ekten **önce** uygulanır.
> - Bu ekteki aşama numaraları EK-2 §8'e göre değişti: M11 → M14'e birleşti, M12 → M16, M13 → M17, M14 → M18, M15'in bir kısmı → M11 ve M19, M16 → M15.
> - Sorun numaraları (P-01 – P-24) değişmedi.

> **Amaç:**
> - M0–M10 yol haritası bittikten sonra kalan sorunları **kanıtıyla** listelemek.
> - Her sorun için çözüm önermek.
> - Bunları yeni aşamalara (M11–M16) bölen, kabul ölçütleri ölçülebilir bir şartname eki vermek.
>
> **Ana şartnameyle ilişki:** Bu ek `claude_uygulama_sartnamesi_v3.md`'yi **değiştirmez, tamamlar**. Çelişki olursa §0.2'deki kaynak önceliği geçerlidir:
> 1. resmi TKGM belgeleri;
> 2. ölçülen örnek dosyalar;
> 3. ana şartname;
> 4. bu ek.
>
> **Durum tarihi:** GitHub `main` `e2c84bb` (KONTROL-M9 düzeltmeleri + Gemini M10 birleştirmesi).
>
> **Ölçümler:** Claude, 9 resmi örnek dosyayla (`ORNEKLER_YEREL`, yalnız yerelde) ve kod okumasıyla yaptı. Her sorunun "Kanıt" satırında ölçümün kendisi yazılıdır.

---

## 0. Kısa durum

### 0.1 Aşamaların durumu

| Aşama | Durum |
|---|---|
| M0–M8 | Bitti, kontrol edildi |
| M9 | Araçlar bitti. Ornek6'dan sıfırdan üretilen GML, 08.11.2026'da TKGM 3dbinadogrula'dan **"Dosya kontrolleriniz başarılı"** sonucunu aldı. Şartnamedeki kabul ölçütü (**gerçek bir proje** ile "Başarılı + doğrulama kodu") kullanıcıyı bekliyor. |
| M10 | Gemini'de sürüyor. Bu belgede M10 eksikleri de var (§1.1). |

### 0.2 Sayılarla bugünkü durum

| Ölçüt | Değer |
|---|---|
| Test | 185 testten 183'ü geçiyor. Geçmeyen 2 test Gemini'nin M10 şablon testleri. |
| Resmi dosyalar (kendi halleri) | 8 kabul dosyasında 0 HATA; ret dosyasında V-202 HATA. |
| Ornek6, Ornek1, Ornek5 (çıkar → üret → doğrula) | 0 HATA |
| Ornek2 | 6 HATA |
| Ornek3 | 13 HATA |
| Ornek4 | 4 HATA |
| Amasya | 2 HATA (veri eksiği) |
| Sincan | 19 HATA (16'sı veri eksiği) |

---

## 1. SORUNLAR VE ÇÖZÜMLER

Her sorunda şu alanlar var: **Kanıt** (ölçüm), **Kök neden**, **Etki**, **Çözüm**, **Öncelik** (P1 en yüksek) ve **Aşama**.

### 1.1 Teslim ve paketleme (M10'dan kalanlar)

#### P-01 — Windows kurulum paketi kurulamaz durumda (P1, M10)

**Kanıt (kod okuması, `e2c84bb`):**
- `package.json` içinde `electron` ve `electron-builder` bağımlılıkları **yok**.
- `"main"` alanı **yok**. `electron:*` betikleri **yok**.
- `electron/tsconfig.json` dosyası **yok**. Ama `docs/M10_PAKETLEME_VE_KULLANICI_KILAVUZU.md` §2.2 şu komutu veriyor: `npx tsc -p electron/tsconfig.json`.
- Belge "otomatik güncelleme" diyor; kodda `autoUpdater` yok. Ayrıca bu, K91 ilkesiyle (çalışma anında ağ isteği yok) çelişir.

**Kök neden:** Electron dosyaları (`electron/main.ts`, `preload.ts`, `electron-builder.json5`) yazılmış, ama derleme zincirine bağlanmamış.

**Etki:** M10 kabul ölçütü "Temiz Windows 11 makinesinde kurulum ve çalışma" bu haliyle karşılanamaz.

**Çözüm:**
1. `devDependencies`: `electron` ve `electron-builder`. Sürümleri sabitle; `package-lock.json` güncellensin.
2. `electron/tsconfig.json` ekle: `module: "commonjs"` veya ESM, `outDir: dist-electron`, `types: ["node"]`.
3. `package.json` alanları:
   - `"main": "dist-electron/main.js"`;
   - `"electron:dev"` betiği: Vite + Electron;
   - `"electron:build"` betiği: `vite build && tsc -p electron/tsconfig.json && electron-builder --win`.
4. `loadFile` yolu `dist/index.html` ile tutarlı olsun. Vite `base: './'` olmalı; yoksa üretim derlemesinde varlıklar yüklenmez.
5. Otomatik güncelleme ifadesi belgeden çıkarılsın ya da "kapalı, isteğe bağlı" diye yazılsın (K91).
6. Kod imzalama yoksa Windows SmartScreen uyarısı belgelensin.

**Kabul:**
- Temiz Windows 11 makinesinde (ya da Windows Sandbox'ta) kurulum paketi kurulur.
- Uygulama ağ olmadan açılır.
- Ornek6 açılır, "GML üret ve doğrula" 0 HATA verir.
- `.gml` ve `.tkgm3b` çift tıkla açılır.
- Kurulum dosyasının SHA-256'sı belgeye yazılır.

#### P-02 — M10 şablonları kendi doğrulayıcımızdan geçmiyor (P1, M10)

**Kanıt:** Ayrı bir çalışma kopyasında `0b6a9d1` tek başına denendi. Şablonlardan üretilen GML'deki HATA sayıları:

| Şablon | `0b6a9d1` tek başına | Birleşik `main` |
|---|---|---|
| apartman | 51 | 27 |
| villa | 13 | 9 |
| dubleks | 11 | 9 |
| ticariZemin | 23 | 23 |

- Kalan kurallar: V-061 (BB'de `independentSectionCardinalDirection` yok), V-073, V-074, V-202. ticariZemin'de ayrıca V-036 ve V-042a.
- `m10.test.ts`'teki 2 test Gemini'nin kendi commit'inde de başarısız.

**Kök neden:** Şablon verisi eksik:
- bakı yönü (`cardinalDirections`), MAKS numaraları (`sectionInfo`), parsel/bina kimlikleri;
- ticariZemin'de kısım poligonu BB sınırıyla çakışıyor;
- bazı açıklıkların karşı yüzü yok (B-OP-05).

**Çözüm:**
- Şablon verisini tamamla. Bakı yönü elle yazılmasın, P-07'deki otomatik hesapla üretilsin.
- Dört şablon için de "üretilen GML 0 HATA" testi bulunsun.
- **Kural:** Testi yeşile çevirmek için doğrulayıcı gevşetilmez.

**Kabul:** Dört şablondan üretilen GML'de 0 HATA; şablon kabuklarında `checkShell` tamamı kapalı.

### 1.2 Veri girişi (kullanıcının girmesi gereken bilgiler)

#### P-03 — MAKS numaraları girilemiyor (P1, M11; ACIK-08)

**Kanıt:**
- Amasya'dan üretilen dosyada 2, Sincan'dan üretilen dosyada 16 × V-061: BB'de zorunlu `maksNumaratajIdentityNumber` yok.
- Kaynak dosyalar eski kılavuzla (rejim E) yazıldığı için bu alanı taşımıyor. Yeni dosya (rejim S) taşımak zorunda.

**Kök neden:** `SectionInfo.maksIdentityNumber` ve `maksNumaratajIdentityNumber` modelde var, ama editörde **giriş ekranı yok**. Değerler yalnız GML'den çıkarılıyor.

**Çözüm:** M11 bilgi panelleri (§2.1). Eksik zorunlu alanlar "GML üret"ten **önce** listelensin; tıklayınca ilgili alana gidilsin.

**Kabul:** Amasya ve Sincan'dan çıkarılan tasarıma MAKS numaraları panelden girildiğinde, üretilen GML'de V-061 = 0.

#### P-04 — Bina ve BB bilgileri için form yok (P1, M11)

**Kanıt:**
- `BuildingInfo` (MAKS no, bina tipi, geometri uygunluğu, asansör sayısı, onay tarihi, proje bina yüksekliği), `SectionInfo` ve `IndependentSection` alanları editörde **düzenlenemiyor**. Liste beyan sihirbazı (M7) yalnız `IndependentSection`'ın bir kısmını dolduruyor.
- Ana şartname §7.3 madde 1 ve 4 (proje oluşturma, kat tanımları tablosu) arayüzde tam değil.

**Çözüm:** M11 §2.1.

#### P-05 — Editörde balkon, kapı/pencere ve kat kopyalama araçları yok (P1, M11)

**Kanıt:**
- `editor.ts`: `EditorTool = 'sec' | 'kat' | 'bb' | 'kisim' | 'oa' | 'iy' | 'olcu'`. Ana şartname §7.4'teki **Balkon/Teras (`L`)**, **Kapı/Pencere (`D`/`W`)** ve **Kopyala kat (`Ctrl+Shift+C`)** araçları yok.
- Balkon ve açıklıklar bugün yalnız GML'den çıkarma ya da DXF katman eşlemesiyle geliyor. Sıfırdan çizimle tam bina üretmek mümkün değil.

**Çözüm:** M11 §2.2.

#### P-06 — Çatı ve TIC için giriş ekranı yok (P1, M11)

**Kanıt:**
- `Roof` (`mode`, `pitchDeg`, `eaveOverhang`, `thickness`, `eaveZ`) ve `tic` modelde var, ama editörde panel yok.
- TIC yoksa üretici en alt kat sınırını kullanıyor ve `B-TIC-01` uyarısı veriyor. M10 şablonlarının dördü de bu uyarıyı alıyor.

**Çözüm:** M11 §2.3. TIC için aplikasyon köşe tablosu: elle, CSV veya M7'deki röleve okuyucusu.

#### P-07 — Bakı yönü (`independentSectionCardinalDirection`) elle giriliyor (P2, M11)

**Kanıt:**
- Kod listesi: 1001 Kuzey, 1002 Kuzeydoğu, 1003 Doğu, 1004 Güneydoğu, 1005 Güney, 1006 Güneybatı, 1007 Batı, 1008 Kuzeybatı, 1009 Kapalı Cephe.
- Ornek6 BB 1: 1001, 1003, 1005, 1007.
- Şablonlarda bu alan boş, bu yüzden V-061 çıkıyor.

**Çözüm:** Geometriden otomatik öneri; kullanıcı değiştirebilir. Algoritma §2.4.

### 1.3 Geometri motoru

#### P-08 — Kat sınırında doğrusal ara köşe varsa dış pencere bina yüzüne bağlanmıyor (P1, M13)

**Kanıt:** Bu belge için ölçüldü. Bina dış yüzüne (T1) bağlanamayan oda pencerelerinin dış yüzünün kat sınırına uzaklığı:
- Ornek3'te 16 pencere: hepsi **0,0–0,8 mm**.
- Sincan'da 3 pencere: **1,0 mm**.

Bunlar Ornek3'teki 17 × V-164 ve Sincan'daki 3 × V-164 HATA'larının nedeni.

**Kök neden:**
- `resolveOpening` dış cepheyi `edgeCovers` ile arıyor: pencerenin iki ucu **tek bir** kat sınırı kenarı üzerinde olmalı (1 mm).
- Kaynak kat sınırlarında (K'nın en alt Floor_ poligonu) aynı doğru üzerinde ara köşeler var. Pencere bu köşenin iki yanına taştığında hiçbir kenar onu tek başına kapsamıyor.
- Sincan'da ayrıca mesafe tam 1,0 mm; tolerans sınırına takılıyor.

**Çözüm:**
1. Dış cephe ararken kat sınırının **doğrusal ardışık kenarları birleştirilmiş** bir kopyası kullanılsın (açı < 0,5°, sapma ≤ 1 mm).
2. Cephe yakalama toleransı 2 mm olsun. Açıklık halkası bulunan kenarın doğrusuna izdüşürülüp mm'ye oturtulsun.
3. LoD2 ve kat dış duvarı yüzleri bu birleşik kenarlarla üretilsin. Ara köşe T-kavşak noktası olarak kalsın, ama açıklık aralığının içine düşüyorsa duvarı bölmesin. Bu davranış `wallFaces`'te zaten var; dış duvarlar için de geçerli kılınsın.

**Kabul:**
- Ornek3'ten üretilen dosyada V-164 = 0, Sincan'dan üretilen dosyada 3 → 0.
- Ornek6 altın testleri bozulmaz.

#### P-09 — Çatı arası pencerelerinin bina yüzünde karşılığı yok (P2, M13; ACIK-13)

**Kanıt:**
- Ornek2'den üretilen dosyada 6 × V-164; hepsi çatı arası odalarında (taban 961,000).
- Ölçüm: bu pencerelerin dış yüzünün kat sınırına uzaklığı 5–50 cm (4 pencere, 2'si balkon kenarında) ve 0,5–2 m (2 pencere).

**Kök neden:**
- Çatı arası dış duvarı (diz duvarı veya çatı içindeki duvar), en üst katın sınırıyla aynı hatta değil.
- Modelde çatı arası için ayrı bir dış sınır yok. LoD2 duvarları ve T1 açıklıkları yalnız `Storey.outline`'dan üretiliyor.

**Çözüm:** M13 §2.6: çatı arası dış sınırı (`atticOutline`) ve çatı yüzündeki pencereler.

#### P-10 — Beşik/kırma çatı yalnız dikdörtgen planda (P2, M12)

**Kanıt:**
- `building.ts`: dikdörtgen değilse `B-CAT-04` HATA.
- L, T ve U planlı binalar, cumba ve çıkmalar için parametrik çatı yok. Kullanıcı ya düz çatıya ya da elle 3B yüz girişine düşüyor; elle giriş için arayüz de yok (P-06).
- Ornek6'nın 66 yüzlü çatısı yalnız GML'den çıkarılarak üretilebiliyor.

**Çözüm:** M12: düz iskelet (straight skeleton) tabanlı genel beşik/kırma, tek eğim, mansard ve çatı penceresi (§2.5).

#### P-11 — Köşeyi dönen vitrinler (P2, M13)

**Kanıt:**
- Ornek2'den üretilen dosyada 6 × `B-OP-01`. Zemin kat dükkanlarında 4,5 m yüksek pencereler; çizim noktaları bir köşenin iki yanında.
- Bu açıklıklar şu an atlanıyor: dosyada eksik pencere kalıyor.

**Kök neden:** Bir açıklık tek bir duvar yüzünde tanımlı (`anchor {a, b}`). Köşeyi dönen vitrin iki duvar yüzüne yayılıyor.

**Çözüm:**
- Çıkarma ve çizim sırasında köşeyi geçen açıklık, köşede **iki açıklığa bölünsün**: aynı kot aralığı, her yüzde ayrı temsil.
- Köşe dikmesi için en az 10 mm'lik bir duvar şeridi bırakılsın (V-042a). Kullanıcıya not gösterilsin.

**Kabul:** Ornek2'den üretilen dosyada `B-OP-01` = 0; pencere sayısı kaynağa yaklaşır (bugün 77 / 88).

#### P-12 — Karşı yüzü bulunamayan açıklıklar (P2, M13)

**Kanıt:** Üretim uyarısı `B-OP-05` (1000 mm içinde paralel karşı yüz yok):
- Ornek3: 20;
- Ornek5: 4;
- M10 şablonları: apartman 17, villa 1, ticariZemin 4.

**Kök neden (doğrulanacak):** Olası nedenler:
- duvar 1 m'den kalın (bodrum perdesi);
- karşı yüz bir OA ya da balkon sınırı ve arama listesinde değil;
- açıklık yanlış katta.

**Çözüm:**
- Her `B-OP-05` için en yakın paralel yüzün türü ve uzaklığı raporlansın (tanılama).
- Arama listesine balkon dış sınırı ve iç yapı sınırları eklensin.
- 1000 mm sınırı proje ayarı olsun (en çok 1500).

**Kabul:** Ornek3 ve Ornek5'te `B-OP-05`'in nedeni sınıflanmış olsun; gerçek hatalar dışında 0'a insin.

#### P-13 — Çok katlı BB alanı (V-127) (P2, M13)

**Kanıt:** Ornek4'ten üretilen dosyada 4 × V-127, örneğin "A_-1_6: BB çizim alanı (112,02) kısımların toplamından (135,14) küçük".

**Kök neden:** Dubleks bölümün kısımları bir parçaya bağlanırken parça alanı yalnız kendi katındaki taban. Kaynakta V-200'deki alan stratejisi (`repeat` / `minusOne`) farklı uygulanmış.

**Çözüm:**
- Çok katlı BB'de kısımlar fiziksel katındaki parçaya bağlansın (M4 kuralı); alan denetimi parça bazında yapılsın.
- Kaynak dosyadaki stratejiyi ölçüp `KARARLAR`'a yaz.

**Kabul:** Ornek4'ten üretilen dosyada V-127 = 0.

#### P-14 — Kısım BB sınırına değdiğinde BB duvarı (P3, M13)

**Kanıt:**
- `B-BB-03` uyarısı: M10 şablonlarında apartman 16, villa 4, dubleks 4, ticariZemin 4.
- Kapak artık Boolean farkla doğru üretiliyor (KONTROL-M9), ama **yan yüzler** hâlâ "dış sınır + delik halkaları" varsayımıyla üretiliyor. Değen kenarlarda üst üste binen yüzler oluşabilir.

**Çözüm:** BB duvar bölgesi `W = sınır − ⋃ kısımlar` tamamen Boolean farkla hesaplansın (`subtractPolygons2D` var). Yan yüzler W'nin halkalarından üretilsin. Sıfır kalınlıklı yerlerde (kısım sınıra değiyor) yan yüz üretilmesin.

**Kabul:** Şablonlarda `B-BB-03` = 0; BB küvetinde fazla kullanılan kenar sayısı 0.

### 1.4 Doğrulayıcı

| No | Sorun | Kanıt | Çözüm | Öncelik |
|---|---|---|---|---|
| P-15 | **Şema (XSD) doğrulaması yok** (ACIK-02) | V-005 "ertelendi". CityGML 2.0 ve GML 3.1.1 XSD dosyaları repoda yok. | Resmi XSD dosyaları `resources/xsd/` altına SHA-256 kilitli eklensin (kullanıcı sağlar). Çevrimdışı bir XSD doğrulayıcı seçilsin (ör. `libxml2` WASM). Lisans ve boyut ACIK'e yazılsın. | P2 |
| P-16 | Kat kullanımı 1003 ("nitelikli OA") belirsiz (ACIK-07) | Yazıcı katta herhangi bir OA varsa 1003 ekliyor. | Ölçüm: Ornek1–5'te hangi `commonAreaUsage` değerleriyle 1003 yazılmış, tablosu çıkarılsın; kural tabloya bağlansın. | P3 |
| P-17 | V-206 kat kullanımı ↔ BB kullanımı tablosu (ACIK-04) | ertelendi | P-16 ölçümüyle aynı tablo | P3 |
| P-18 | V-126 BB alan tanımı (ACIK-06) | Ornek1'de 70 BB'nin 62'sinde öznitelik, alt taban alanından ~0,9 m² büyük | Hangi yüzeyin alanı olduğu ölçülsün (üst taban mı, küvet dış izi mi). Kesinleşene kadar UYARI. | P3 |
| P-19 | V-123 taban kalınlığı alt sınırı (ACIK-03) | Şartnamede sayı yok | 9 dosyada en küçük taban kalınlığı ölçülsün | P3 |
| P-20 | TKGM sunucu mesajlarının tamamı yok | `matchServerMessageToRule` anahtar kelimeyle eşliyor. Bilinen mesaj kümesi örnek ret dosyasıyla sınırlı. | M16 saha geri bildirimi (§2.10) | P2 |

### 1.5 Mimari, performans ve test altyapısı

#### P-21 — Üretilen GML ana görüntüleyicide açılırsa tasarım kaybolur (P2, M15)

**Kanıt:**
- `DesignEditor2D` bileşeni `key={model.canonicalHash}` ile bağlanmış. Tasarım durumu bileşenin içinde tutuluyor.
- Başka bir GML açılınca editör yeniden kuruluyor ve tasarım sıfırlanıyor. M4 belgesi §5'te "Tasarımın App düzeyine taşınması" diye ertelenmişti.
- Bu yüzden "GML üret" sonucu ana 3B görüntüleyiciye ve doğrulama paneline aktarılamıyor; yalnız editör içinde özetleniyor.

**Çözüm:** M15 §2.9: tasarım projesi App düzeyine taşınır; üretilen GML "önizleme modeli" olarak ayrı tutulur.

#### P-22 — GML üretimi ana iş parçacığında (P2, M15)

**Kanıt:**
- `DesignEditor2D.runGml` üretim + yazım + okuma + doğrulamayı eşzamanlı çalıştırıyor.
- Ölçüm: Ornek3 boyutunda bir binada üretim ~1,5 sn, doğrulama ~1–4 sn. Arayüz bu sürede donar.
- Şartname §10.7: 20 katlı, 80 BB'lik projede tam üretim + doğrulama < 30 sn.

**Çözüm:** Üretim ve doğrulama Web Worker'a taşınsın (okuyucu zaten Worker'da). İlerleme çubuğu ve iptal düğmesi eklensin.

**Kabul:** Ornek3 tasarımında "GML üret ve doğrula" sırasında arayüz donmaz (ana iş parçacığında 100 ms'yi aşan blok yok). Ornek3 için toplam süre < 10 sn.

#### P-23 — Regresyon yalnız yerelde ölçülebiliyor (P1, M14)

**Kanıt:**
- Repoda yalnız `fixtures/ornek6.gml` var; diğer 8 örnek `ORNEKLER_YEREL`'de yalnız yerelde.
- KONTROL-M9'da yeni bir kural (V-217) 7 resmi dosyada yanlış HATA verdi ve testler bunu **yakalayamadı**. AI Studio'da çalışan Gemini bu ölçümü yapamıyor.

**Çözüm (iki katman):**
1. **Betik:** `npm run regress:local -- <klasör>`. Klasördeki her GML için şunu yapar:
   - (a) dosyanın kendisini doğrular;
   - (b) çıkar → üret → doğrula döngüsünü çalıştırır;
   - (c) önceki çalıştırmanın JSON özetiyle karşılaştırır.

   Herhangi bir sayı kötüleşirse çıkış kodu 1. Özet JSON'u yalnız sayıları içerir; kişisel veri içermez ve repoya konabilir (`regress/baseline.json`).
2. **Yapay derlem:** `randomPlanGenerator` (M9) ile tohumlu 50 bina. Her biri için üretim, 0 HATA, kapalı kabuk ve alan tutarlılığı testleri (ana şartname §10.5 "özellik tabanlı testler").

**Kabul:**
- `regress:local` 9 dosyada bugünkü sayıları baseline olarak kaydeder.
- Kasıtlı bozulan bir kuralı yakalar: test, V-217'yi geçici olarak H yapınca betiğin başarısız olduğunu gösterir.

#### P-24 — Proje dosyası şema sürümü 1'de kaldı (P2, M15)

**Kanıt:**
- M5–M9'da `DesignBuilding`'e en az 9 isteğe bağlı alan eklendi: `openings`, `info`, `sectionInfo`, `cardinalDirections`, `balconies`, `roof`, `tic`, `installations`, `ceilingFaces`…
- `schemaVersion` hâlâ 1. Eski dosyalar açılıyor, ama hangi sürümle kaydedildiği bilinmiyor.

**Çözüm:**
- `schemaVersion: 2` olsun ve `migrateProject(v1 → v2)` yazılsın: eksik alanlar varsayılanla doldurulur.
- Kaydederken her zaman en son sürüm yazılsın.
- Testte M4, M5 ve M8 dönemi proje dosyaları açılıp yeniden kaydedilebilmeli.

---

## 2. YENİ AŞAMALAR (M11–M16)

### Aşama tablosu

| Aşama | İçerik | Kabul ölçütü |
|---|---|---|
| **M10 (tamamlama)** | P-01, P-02 | §1.1 kabulleri |
| **M11** Bilgi panelleri ve çizim araçları | P-03 – P-07 | Ornek6 binası **hiç GML'den çıkarmadan**, yalnız editör araçlarıyla çizilip üretilir: §10.4 sayıları birebir, kendi doğrulayıcısında 0 HATA |
| **M12** Çatı motoru II | P-10 | §2.5 kabulleri |
| **M13** Cephe ve açıklık iyileştirmeleri | P-08, P-09, P-11 – P-14 | 9 dosyadan üretimde V-164, B-OP-01, V-127 sıfıra iner; Ornek2 6 HATA → 0 |
| **M14** Doğrulayıcı ve regresyon altyapısı | P-15 – P-19, P-23 | §2.8 kabulleri |
| **M15** Mimari: tasarım durumu, Worker, şema sürümü | P-21, P-22, P-24 | §2.9 kabulleri |
| **M16** Saha geri bildirimi (resmi test döngüsü) | P-20, M9 kabulü | En az bir gerçek proje "Başarılı + doğrulama kodu" |

**Önerilen sıra:** M10 tamamlama → M14 (regresyon altyapısı önce gelmeli ki sonraki işler ölçülebilsin) → M11 → M13 → M12 → M15 → M16. M16, ilk gerçek proje hazır olduğunda herhangi bir anda yapılabilir.

### 2.1 M11-A: Bilgi panelleri (P-03, P-04)

Tasarım Editörü'nde sağ sütunda sekmeli bir **"Bilgiler"** paneli.

| Sekme | Alanlar | Kaynak / doğrulama |
|---|---|---|
| Proje | Taşınmaz Kimlik No, ada, parsel, TAKBİS mahalle ref, bina harfi; `constructionID` ve dosya adı canlı | §7.3 madde 1; V-001, V-058 |
| Bina | `maksIdentityNumber`, `maksIntegrationState` (kod listesi), `buildingType` (kod listesi), `geometrySuitability` (çoklu seçim; 1006 kuralı D9), `elevatorCount`, `architecturalProjectConfirmationDate` (tarih seçici), `buildingHeight` (proje; boşsa hesaplanan gösterilir), `additionalNote` | §3.3; V-061 – V-064 |
| Katlar | Tablo: numara, ±0.00'a göre taban kotu, kat yüksekliği, döşeme kalınlığı, `emitStoreyObject`, `kneeWallHeight` (çatı arası). Satır ekle/sil/sırala | §7.3 madde 4 |
| Bağımsız bölümler | Liste beyan tablosu (M7 ile ortak) + MAKS no, MAKS numarataj no, entegrasyon durumları, bakı yönü (P-07 önerisiyle) | §3.6; V-061, V-198, V-199 |
| Eksikler | GML üretiminden önce kendi doğrulayıcısı "dosya-dışı" modda çalışır: tasarımdan zorunlu alan eksiklerini listeler. Tıklayınca ilgili sekme ve alan seçilir. | — |

**Kurallar:**
- Kod listesi alanları açılır listeden seçilir; serbest sayı girilemez (V-063).
- TR büyük harf alanları (V-064) yazarken çevrilir (`i → İ`).
- `registeredFloorDefinition` olduğu gibi korunur (OY-04).
- Malik bilgisi bu panelde **yok**; yalnız liste beyan/malik sihirbazında ve `.tkgm3b` dosyasında (K88-yeni).

### 2.2 M11-B: Çizim araçları (P-05)

| Araç | Kısayol | Davranış | Model |
|---|---|---|---|
| Balkon / Teras | `L` | Kapalı çokgen. Bina kenarına snap. Ortak kenarlar otomatik bulunur (≤ 2 mm, M6 çıkarma kuralı). Özellikler: tür (Balkon/Teras), bağlı BB (teras için "yok" → −1), korkuluk yüksekliği (varsayılan 1100) ve kalınlığı (100, ≥ 50), plan alanı. | `Balcony` |
| Kapı | `D` | Bir duvar yüzüne (kısım kenarı veya kat sınırı) iki tık. Genişlik ölçüyle düzeltilir. Kullanım (`doorUsage`) aşağıdaki öneri tablosuyla seçilir. `sill = 10` (K45a), yükseklik 2100. | `Opening` |
| Pencere | `W` | Aynı. Denizlik ve yükseklik K46'dan, odanın kullanımına göre: mesken için tavana 0,50 m, yükseklik 1,30 m; ıslak hacim için tavana 0,50 m, yükseklik 0,50 m; ticari için tabana 0,10 m, tavana 0,10 m. | `Opening` |
| Kopyala kat | `Ctrl+Shift+C` | Seçili katın sınırı, BB parçaları, kısımları, açıklıkları ve balkonları başka bir kata kopyalanır. Yeni kimlikler deterministik üretilir (Mutlak Kural 6). Bölüm bağları kullanıcıya sorulur: aynı bölüm (dubleks) mi, yeni bölüm mü. | tümü |
| Köşe düzenleme | `V` + sürükle | Seçili çokgenin köşesi sürüklenir; snap uygulanır. Paylaşılan köşeler (aynı mm konumu) birlikte taşınır; seçenekle kapatılabilir. Geri al/yinele. | tümü |

**Kapı kullanım önerisi (§5.4 madde 5):**

| Kapının konumu | `doorUsage` |
|---|---|
| Dış cephede (EXT) ve OA'da | 1001 |
| Balkon kenarında | 1002 |
| BB ile OA arasında | 1003 |
| Aynı BB içinde | 1004 |

**Açıklık çizim denetimleri (canlı, 2B):**
- Karşı yüz bulunamadı (`B-OP-05`);
- delik duvarın alt veya üst kenarına değiyor (`B-OP-02`, tepe ≤ zCeiling − 1);
- aynı duvarda başka açıklıkla çakışma (`B-OP-10`).

Uyarılar çizim sırasında gösterilir; kullanıcı açıklığı kaydırabilir.

### 2.3 M11-C: Çatı ve TIC panelleri (P-06)

- **Çatı paneli:**
  - kip (düz / beşik / kırma / tek eğim / mansard [M12] / elle);
  - eğim (°), saçak (mm), alın kalınlığı (mm), mahya yönü (beşikte), saçak kotu (`eaveZ`, çatı arası için).
  - Önizleme: 3B önizlemede çatı katmanı canlı güncellenir.
  - Hata: `B-CAT-*` panelde gösterilir.
- **TIC paneli:**
  - aplikasyon köşe tablosu (ID; Y; X; Z) — elle, CSV veya M7 röleve okuyucusu;
  - 2B'de kırmızı çizgi;
  - `zTIC = max z` ve FootPrint kotu gösterilir.
  - Kontroller: TIC var mı (V-090), kapalı mı (V-091), bina izini çevreliyor mu, FootPrint kotu ile uyumu (V-093/094/095).

### 2.4 M11-D: Bakı yönü otomatik önerisi (P-07)

Her BB parçası `sp` için:

1. `sp.outline` kenarlarından **dış cephede olanlar** seçilsin: kat sınırı (EXT) üzerinde ve uzunluğu ≥ 0,5 m.
2. Her kenarın dış normali `n = (u.y, −u.x)` (CCW halka için). Azimut: `θ = atan2(n.x, n.y)` (kuzeyden saat yönünde). Grid kuzeyi ile coğrafi kuzey farkı (meridyen yakınsaması, TUREF TM'de |γ| < 1,1°) ihmal edilir.
3. `θ` 8 yöne yuvarlansın, 45°'lik dilimler:

   | Açı aralığı | Yön (kod) |
   |---|---|
   | [−22,5°, 22,5°) | Kuzey (1001) |
   | [22,5°, 67,5°) | Kuzeydoğu (1002) |
   | … 45°'lik dilimlerle … | … |
   | [292,5°, 337,5°) | Kuzeybatı (1008) |

4. Yönler tekrarsız ve küçükten büyüğe yazılsın.
5. Dış cephe kenarı yoksa **1009 (Kapalı Cephe)**.

**Doğrulama ölçümü:** Algoritma Ornek1–6'daki BB'lerin kaynaktaki bakı değerleriyle karşılaştırılsın; uyum oranı belgeye yazılsın (beklenen > %90).

> **Not:** Kaynak dosyalar bakıyı muhtemelen elle girdi, bu yüzden %100 beklenmez. Ornek6 BB 1'in değerleri 1001, 1003, 1005, 1007. Bina yaklaşık 7° dönük olduğu için 8 yönlü yuvarlama bu dört ana yönü vermelidir.

### 2.5 M12: Çatı motoru II (P-10)

**Kipler:**

| Kip | Plan | Yöntem |
|---|---|---|
| Kırma | Her basit çokgen (dışbükey olmayan dahil) | **Düz iskelet** (straight skeleton). Her iskelet yüzü, taban kenarından eğimle yükseltilir. |
| Beşik | Her basit çokgen | Düz iskelet + kalkan dönüşümü. Seçilen "kalkan kenarları" üzerindeki iskelet yüzleri dikey kalkan üçgenine çevrilir; komşu yüzler o kenara kadar uzatılır. |
| Tek eğim (shed) | Her basit çokgen | Bir kenardan (yüksek kenar) eğimle tek düzlem. Yan yüzler dikey. |
| Mansard | Dikdörtgen ve basit çokgen | İki kademeli eğim: alt eğim (ör. 60°) belli bir yüksekliğe kadar, üstte düşük eğim (ör. 15°) kırma. İki düz iskelet ofsetiyle. |
| Çatı penceresi / kırma ek (dormer) | — | Çatı yüzüne dikdörtgen kesit: yüzde delik; dormer gövdesi (2 yan üçgen + ön duvar + üst çatı). **Ölçülmeli:** resmi örneklerde çatı yüzünde `opening` var mı? Yoksa çatı penceresi `RoofSurface` içinde nasıl temsil ediliyor? Ölçülmeden üretime alınmaz (Mutlak Kural 1). |

**Düz iskelet uygulaması:**
- Saf TS, çevrimdışı, `src/core/brep/straightSkeleton.ts`.
- Olay tabanlı algoritma (Felkel–Obdržálek): kenar olayları ve bölünme olayları.
- Sayısal kararlılık için koordinatlar mm tamsayı, hesap `number` ile; olay zamanları 1e-6 toleransla birleştirilir.
- Çıkış: her taban kenarı için bir iskelet yüzü (3B çokgen).
- Düzlemsellik: köşeler mm'ye oturunca sapma > 1 mm ise yüz üçgenlenir (§5.1 madde 5).

**Kapalı gövde:**
- Alt yüz (RoofEdge kotu, saçaklı kontur);
- alın yüzleri (kalınlık);
- üst yüzler.

`checkShell` kapalı olmalı.

**Çatı arası ile bağ:** Çatı arası kesimi (M8 `atticClip`), M12'nin ürettiği yüzleri "çatı zarfı" olarak kullanır; elle yüz gerektirmez.

**Kabul:**
1. L, T, U ve rastgele 8–20 köşeli 30 yapay planda (tohumlu) kırma ve beşik çatı üretilir:
   - gövde kapalı;
   - her yüz düzlemsel (≤ 1 mm);
   - izdüşüm alanı = saçaklı kontur alanı (±0,01 m²);
   - kendi doğrulayıcısında 0 HATA.
2. Dikdörtgen planda sonuç bugünkü M6 beşik/kırma çıktısıyla aynı: yüz sayısı ve köşeler ±1 mm.
3. Ornek6 planına kırma çatı uygulanınca çatı tepe kotu, izdüşüm alanı ve yüz sayısı raporlanır (Ornek6'nın elle çatısıyla karşılaştırma; birebir beklenmez).

### 2.6 M13: Cephe ve açıklık iyileştirmeleri (P-08, P-09, P-11 – P-14)

1. **Birleşik cephe kenarları (P-08):** §1.3 P-08 çözümü.
2. **Çatı arası dış sınırı (P-09).** Model eki:
   ```ts
   interface Storey {
     // …
     /** Çatı arası katı: dış duvarların (diz duvarı) plan sınırı. Yoksa outline kullanılır. */
     readonly atticOutline?: readonly Poly2[];
   }
   ```
   - LoD2 ve kat dış duvarlarının RoofEdge **üstünde kalan** kısmı `atticOutline` üzerinden çatı yüzüne kadar üretilir (§5.9 madde 2).
   - Çatı arası pencerelerinin T1 temsili bu duvarlara yerleşir.
   - GML'den çıkarmada: çatı arası odalarının dış yüzleri ile en üst kat sınırı arasında 5 cm – 2 m mesafe varsa `atticOutline` oda ve BB dış izlerinin birleşiminden önerilir.
   - **Ölçülmeli:** Ornek2 kaynağında bu pencerelerin MB temsili hangi yüzde: LoD2 duvarı mı, çatı yüzü mü? Çözüm buna göre seçilir.
3. **Köşe vitrini (P-11):** §1.3 çözümü.
4. **Karşı yüz tanılama (P-12):** §1.3 çözümü.
5. **Çok katlı BB alanı (P-13):** §1.3 çözümü.
6. **BB duvar bölgesi Boolean (P-14):** §1.3 çözümü.

**Kabul (yerelde 9 dosya, çıkar → üret → doğrula):**

| Dosya | Bugün | Hedef |
|---|---|---|
| Ornek2 | 6 HATA (V-164) | 0 |
| Ornek3 | 13 HATA (V-164 17 bulgu) | 0 |
| Ornek4 | 4 HATA (V-127) | 0 |
| Sincan | 19 HATA | yalnız V-061 (veri eksiği, M11'de girilir) |
| Ornek1, Ornek5, Ornek6 | 0 | 0 (korunur) |

### 2.7 M14-A: Doğrulayıcı tamamlama (P-15 – P-19)

- **XSD:**
  - Kullanıcı resmi CityGML 2.0 ve GML 3.1.1 XSD paketlerini sağlar; `resources/xsd/` altına SHA-256 kilitli eklenir.
  - V-005 "uygulandı" olur.
  - Kabul: 8 kabul dosyası şemadan geçer. Ret dosyasında şema hatası varsa raporlanır.
- **Ölçüme dayalı tablolar (P-16 – P-19):** Her biri için 9 dosyada ölçüm tablosu `KARARLAR`'a yazılır, ilgili kural tabloya bağlanır.
- **Kural:** Her kural değişikliğinden sonra `regress:local` çalıştırılır; 8 kabul dosyasında 0 HATA korunur.

### 2.8 M14-B: Regresyon altyapısı (P-23)

§1.5 P-23 çözümü.

**Ek kural:** Gemini'nin ve Claude'un her aşama teslimi `regress:local` çıktısını (yalnız sayılar) içermeli. Yerel klasörü olmayan taraf (AI Studio) baseline JSON'u testte okur ve **yalnız yapay derlem** testini çalıştırır.

### 2.9 M15: Mimari (P-21, P-22, P-24)

1. **Tasarım durumu App düzeyinde:** `DesignEditor2D` reducer'ı App'e taşınır. `model` (içe aktarılan GML) ile `designProject` ayrı durumlardır. "GML üret ve doğrula" sonucu ana görüntüleyiciye "üretilmiş model" olarak yüklenebilir; tasarım kaybolmaz.
2. **Worker:** Üretim, yazım ve doğrulama `generator.worker.ts`'e taşınır; ilerleme olayları ve iptal desteği olur.
3. **Şema sürümü:** `schemaVersion: 2` ve göç fonksiyonu.
4. **Kesit düzlemi:** Ana şartname §7.6'da var, uygulanmadı. Three.js `clippingPlanes` ile yatay kesit kaydırıcısı eklenir.

**Kabul:**
- (a) GML üretilip ana görüntüleyicide açıldıktan sonra Tasarım Editörü'ne dönülünce tasarım aynen duruyor.
- (b) Ornek3 tasarımında üretim sırasında arayüz donmuyor; süre < 10 sn.
- (c) M4, M5 ve M8 dönemi `.tkgm3b` dosyaları açılıp v2 olarak kaydediliyor; yeniden açılınca aynı GML üretiliyor (SHA-256 aynı).

### 2.10 M16: Saha geri bildirimi (P-20 ve M9 kabulü)

**Akış:**
1. Kullanıcı gerçek bir projeyi uygulamada hazırlar; DXF/raster altlık ve liste beyan kullanılır.
2. "GML üret ve doğrula" ile 0 HATA hedeflenir.
3. Dosya 3dbinadogrula'ya yüklenir.
4. TKGM'nin döndürdüğü **her** mesaj (hata, uyarı, bilgi) metin olarak Claude'a iletilir. Kişisel veri çıkarılır; doğrulama kodu repoya yazılmaz.
5. Her mesaj için:
   - kendi kural kataloğumuzda karşılığı var mı (`matchServerMessageToRule`);
   - yoksa yeni kural eklenir;
   - varsa ciddiyeti ve toleransı TKGM'ye göre ayarlanır;
   - test vakası eklenir.

**Kabul:**
- En az bir gerçek proje "Başarılı + doğrulama kodu" alır. Bu, ana şartnamedeki M9 kabul ölçütüdür.
- Kayıt: proje türü, kat ve BB sayısı, uygulamada geçen süre ve TKGM mesaj listesi (kişisel verisiz) `docs/M16_SAHA_GERI_BILDIRIMI.md` belgesine yazılır.

---

## 3. Ortak kurallar (her aşama için)

1. `src/core` saf TS kalır. DOM, Node, `Math.random`, `Date.now`, `randomUUID` ve `fetch` kullanılmaz (m0 testi denetler).
2. Çalışma anında ağ isteği yok (K91). Yeni npm paketi gerekirse lisansı ve boyutu `ACIK_SORULAR.md`'ye yazılır.
3. **Kişisel veri:**
   - Gerçek malik, TC ve proje verisi repoya ve AI Studio'ya konmaz.
   - Testler yapay veriyle yazılır.
   - Doğrulama kodları repoya yazılmaz.
4. **Testi geçirmek için doğrulayıcı gevşetilmez.** Ölçüme dayalı ciddiyet değişikliği ancak 9 resmi dosyadaki ölçümle yapılır (KARARLAR §A.7).
5. **Her teslimde:**
   - `npm run typecheck` 0 hata;
   - `npm test` tümü geçer;
   - Ornek6 altın testleri (M5, M6) ve "Ornek6'dan üretilen GML 0 HATA" korunur;
   - M7 konum korunumu bozulmaz;
   - (M14'ten sonra) `regress:local` kötüleşme göstermez.
6. **Belgelendirme:** Her aşama `docs/M<n>_*.md` belgesini, kabul tablosunu, gerçek komut çıktılarını, `ADIM_NOTU` ve `KARARLAR` güncellemelerini içerir.
7. Örnek dosyada veya resmi belgede karşılığı olmayan hiçbir XML öğesi, öznitelik ya da sınıf uydurulmaz (Mutlak Kural 1). Çatı penceresi gibi ölçülmemiş temsiller önce `ACIK_SORULAR`'a yazılır, ölçülür, sonra üretilir.

## 4. Sorun → aşama eşlemesi (özet dizin)

| Sorun | Kısa ad | Öncelik | Aşama |
|---|---|---|---|
| P-01 | Electron zinciri bağlı değil | P1 | M10 |
| P-02 | Şablonlar 0 HATA değil | P1 | M10 |
| P-03 | MAKS numarası girişi | P1 | M11 |
| P-04 | Bina ve BB bilgi formları | P1 | M11 |
| P-05 | Balkon, kapı/pencere, kat kopyalama, köşe düzenleme araçları | P1 | M11 |
| P-06 | Çatı ve TIC paneli | P1 | M11 |
| P-07 | Bakı yönü otomatik | P2 | M11 |
| P-08 | Birleşik cephe kenarı (Ornek3 16, Sincan 3 pencere) | P1 | M13 |
| P-09 | Çatı arası dış sınırı (Ornek2 6 pencere) | P2 | M13 |
| P-10 | Genel çatı (düz iskelet), mansard, çatı penceresi | P2 | M12 |
| P-11 | Köşe vitrini | P2 | M13 |
| P-12 | Karşı yüz tanılama | P2 | M13 |
| P-13 | Çok katlı BB alanı | P2 | M13 |
| P-14 | BB duvar bölgesi Boolean | P3 | M13 |
| P-15 | XSD | P2 | M14 |
| P-16 – P-19 | Ölçüme dayalı açık kurallar | P3 | M14 |
| P-20 | TKGM mesaj kataloğu | P2 | M16 |
| P-21 | Tasarım durumu App düzeyinde | P2 | M15 |
| P-22 | Worker'da üretim | P2 | M15 |
| P-23 | Regresyon altyapısı | P1 | M14 |
| P-24 | Proje şema sürümü | P2 | M15 |

## 5. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
