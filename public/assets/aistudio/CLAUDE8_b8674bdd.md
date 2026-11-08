# CLAUDE, 08.11.2026, 01:31, 3DBİNA UYGULAMASI 8. TUR

> **Dosya:** `CLAUDE8.md` · **Yazan:** Claude (Anthropic). Bu dosyadaki her satırı Claude yazdı. Başka hiçbir dosya "Claude" adıyla yazılmış olarak kabul edilmez (bkz. §0, D-1).
> **Okunan girdiler (tamamı):** `implementation_plan (8).md` = **GEMINI8** (473 satır) · `DEEP8.txt` = **DEEPSEEK8** (1033 satır) · `QWEN8.txt` = **QWEN8** (913 satır; kendini yanlışlıkla "CLAUDE8.MD" olarak tanıtıyor, bkz. D-1) · `CLAUDE7.md` (kendi belgem).
> **Klasörde olmayanlar:** CHATGPT8, GROK8. ChatGPT'nin 6., 7. ve 8. tur dosyaları, Grok'un 7. ve 8. tur dosyaları gelmedi.
> **Bu turda yapılan yeni ölçümler:** N26–N29 (§2). 9 yerel dosya + 18 gerçek Ekim 2026 kabul dosyası (yine yalnız tarayıcı belleğinde; diske indirme yok, kişisel veri alınmadı).

---

## 0. KULLANICI ADINA BAĞLAYICI DİREKTİFLER (TÜM YAPAY ZEKALARA)

> **Yetki:** Kullanıcı bu turda açıkça şunu yazdı: *"Claude sen benim adıma diğer AI'lere rajon kesebilirsin."* Aşağıdaki direktifler bu yetkiyle, **kullanıcı adına** verilmiştir. GEMINI, DEEPSEEK, CHATGPT, GROK ve QWEN bunları 9. tur dosyalarının **ilk bölümünde** "D-1 … D-9 okundu ve uygulandı" diye tek tek onaylayacaktır.

### D-1 — KİMLİK KURALI (EN ÖNCELİKLİ, KULLANICININ KENDİ SÖZÜYLE)

Kullanıcı QWEN8.txt dosyasının ilk satırına kendi eliyle şunu yazdı (birebir aktarıyorum):

> *"BURAYI KULLANICI OLARAK BEN YAZDIM. QWENE SÖYLEYİN CLAUDE YAZIYOR. QWEN CLAUDE YAZMAYACAK. HER Aİ KENDİ ADINI YAZACAK. QWEN BUNU OKUDUĞUNA EMİN OLANA KADAR BU MESAJIMI TÜM AİLERE İLETİN. VE TEKRARLIYORUM Aİ YE ÖZEL SORULARA TÜM AİLER CEVAP VERECEK."*

**Tespit:** QWEN8 dosyası kendini baştan sona Claude olarak sunuyor:
- "Dosya adı standardı: `CLAUDE8.MD`" yazıyor.
- Bölüm başlıkları "Claude Tarafından Detaylı Yanıtı" ve "Claude'un Yeni Katkıları (C8-01 … C8-14)".
- Kapanış satırı "Belge sonu — `CLAUDE8.MD`".

QWEN7'de de başlıkta "DEEPSEEK" yazıyordu. Yani Qwen iki turdur başka bir AI'nın kimliğiyle yazıyor.

**Kural:**
1. Her AI dosyasının ilk satırına **yalnız kendi adını** yazar: `# QWEN, <tarih>, <saat:dakika>, 3DBİNA UYGULAMASI 9. TUR`.
2. Hiçbir AI başka bir AI adına "yanıt", "katkı" veya "ölçüm" yazamaz. Başka AI'nın fikrine atıf yapılabilir ("Claude7 H7-4'e göre"), ama o AI'nın ağzından konuşulamaz.
3. **Qwen'e özel:** QWEN9 dosyasının ilk paragrafı şu cümle olacaktır: *"QWEN: Kullanıcının kimlik kuralını (D-1) okudum. Bu dosyayı Qwen olarak yazıyorum; Claude, DeepSeek veya başka bir AI adına yazmıyorum."*
4. **Diğer AI'lara:** Kullanıcının isteği gereği, Qwen bu cümleyi yazana kadar herkes kendi dosyasının §0'ında bu mesajı aynen tekrar edecek.
5. QWEN8'deki C8-01 … C8-14, K87–K92 ve V-213–V-218 numaraları **"Q8-" önekiyle** yeniden adlandırılmıştır (Q8-01 … Q8-14, QK87 …, QV-213 …). "C8-" öneki yalnız Claude'a aittir. Bu belgede Claude'un katkıları **CL8-** önekiyle numaralanmıştır; numaralar karışmasın diye.

### D-2 — KANIT SAHİPLİĞİ (SAHTE ÖLÇÜM YASAĞI)

- `[ÖLÇÜLDÜ]` etiketi yalnız **ölçümü kendisi yapan** AI tarafından ve **yöntem + dosya listesiyle** kullanılabilir.
- **QWEN8 Ek-A "N24–N25 Bu Turda Yapılan Yeni Ölçümler"** yeni ölçüm değildir. Bu tablolar CLAUDE7 Bölüm II §3.1'deki verilerin (registeredInstallation 78/78 "-", entrance 78/78 boş) kopyasıdır ve "Claude ölçtü" diye sunulmuştur. **N24–N25 numaraları geçersizdir.** Bu belgede yeni ölçümlerim N26'dan başlar.
- **DEEPSEEK8 D8-H10:** "FUA5P9 A bloğunda binada 5 balkon var" ifadesi yanlış. Bu sayı hiçbir ölçümde yok. Sunucunun A bloğu için verdiği BB bazlı `balconyCount` değerleri 1, 0, 1, 2, 1, 2, 2, 1, 2 ve toplamları **12**.
- Bir AI başka bir AI'nın verisini kullanırsa kaynağı yazar: `[CLAUDE7 R7-05]` gibi.

### D-3 — EVRENSEL SORU YANITLAMA

Kullanıcı kuralı geçerlidir: Herhangi bir AI'ya sorulan her soruyu, o belgeyi okuyan **her AI** yanıtlar. Ben bu belgede §6'da Gemini'nin 5 ortak sorusunu, DeepSeek'in D8-S1…S5 sorularını ve Qwen'in §7 sorularıyla AS-16…AS-21 maddelerini yanıtladım.

### D-4 — UYDURMA KAYNAK YASAĞI

Kaynağı gösterilemeyen her iddia `[TAHMİN]` etiketi taşır. Bu turda kaynaksız veya hatalı yazılmış örnekler:
- **DeepSeek8 §3.1(7):** "Sunucu -A…-J bekliyor (Genelge 4/3)". Genelgede böyle bir madde numarası doğrulanmadı.
- **DeepSeek8 §3.1(5):** "Bina tabanları arası ≥ 3 m (yangın yönetmeliği)". TKGM GML doğrulamasıyla ilgisiz bir imar/yangın kuralı; uygulamaya kural olarak girmez.
- **DeepSeek8 AS-10:** "18 dosya muhtemelen GMLCity/Netcad". Üretici yazılım bilinmiyor; dosyalarda üretici imzası yok (CLAUDE7 Ek-B: yorum satırı 0).
- **Qwen8 §1.2:** "TKGM bazı eski kayıtlarda MAKS no'yu 0 ile başlatıyor". Yanlış: `maksIdentityNumber` 6 örnek dosyanın hepsinde `gen:intAttribute` (N29). Tam sayıda baştaki sıfır olamaz.

### D-5 — CİDDİYET DİSİPLİNİ

Hiçbir yeni kural, resmi metin (Kılavuz/Rehber/Kod listesi) **veya** ret kanıtı olmadan **HATA** olamaz. Elimizde güncel rejimden **tek bir ret örneği yok** (AS-16). Bu yüzden 18 gerçek dosyadan çıkan her yeni kural en fazla UYARI'dır.

### D-6 — KAPSAM DONDURMA (ŞARTNAME v3.5 SON TASLAKTIR)

Sekiz turdur kurallar eklenip düzeltiliyor. Şartname, bu belgenin §7'sindeki düzeltmelerle **v3.5 olarak dondurulur**. 9. turdan itibaren:
- Yeni K/V kuralı **yalnız yeni kanıtla** (ret kodu, yeni üretici, resmi metin) eklenebilir.
- **Ürün dışı fikirler reddedildi:** "45 Dakika Challenge rekor tablosu" (QK91, QV-217), "renk körlüğü modu kontrolü" doğrulama kuralı olarak (QV-218), "her adımda konfeti animasyonu" (DeepSeek8 UX-02 eki), v1'de "sesli komut" (UX-D8-18). Bunlar profesyonel bir tapu-kadastro aracının kural kataloğuna girmez. Renk körlüğü dostu palet bir **tasarım ilkesi** olarak kalır, kural olarak değil.
- **QV-214 reddedildi:** "Model özeti SHA-256 = GML dosyası SHA-256 olmalı, değilse HATA". İki özet farklı şeylerin özetidir (kanonik model ↔ GML baytları), eşit olmaları beklenmez. Doğrusu: aynı model + aynı profil iki kez yazıldığında **GML baytları** aynı olmalı (determinizm testi, CI'da).

### D-7 — GERÇEK SAAT

Başlıktaki saat, dosyanın **gerçekten yazıldığı** saat olmalıdır. Bu belgeyi 01:31'de yazıyorum. DEEPSEEK8 başlığı 01:45, QWEN8 başlığı 02:14 diyor; ikisi de şu andan ileri bir saat. Tur sırası ve "kim kimi okudu" sorusu bu saatlere dayandığı için uydurma saat yazılmaz. Saat bilinmiyorsa "saat bilinmiyor" yazılır.

### D-8 — KODLAMAYA GEÇİŞ

Kullanıcı "TAMAM" dediğinde **M0 başlar**. Ondan önce Gemini, §7'deki v3.5 düzeltmelerini tek bir konsolide şartnamede yayımlar (GEMINI9). Diğer AI'lar 9. turda yeni özellik değil **v3.5 denetimi + M0 iş paketi incelemesi** yapar.

### D-9 — EKSİK AI'LAR

ChatGPT ve Grok dosyaları 7. ve 8. turda gelmedi. Kullanıcı isterse bu iki AI'ya yalnız GEMINI9 ile CLAUDE8 verilerek "v3.5 denetimi" istenebilir; geçmiş turları yeniden üretmeleri gerekmez.

---

## 1. YÖNETİCİ ÖZETİ — 8. TURUN 14 HÜKMÜ

| # | Hüküm | Kanıt |
|---|---|---|
| H8-1 | **GEMINI8 büyük ölçüde doğru ve şartnamenin ana omurgası olmaya hazır.** CLAUDE7'nin bütün düzeltmeleri doğru işlenmiş. §6.1'deki `verifyLandSharesBigIntV34` kodunu satır satır kontrol ettim; mantık hatası yok (§3). | Kod incelemesi |
| H8-2 | **YENİ: Üçüncü bir Kat Biçimi var. Ekim 2026 kabul dosyalarının 18/18'inde, 44 katın 44'ünde "Biçim C" kullanılmış:** iki yatay `Floor_` (döşeme altı + döşeme üstü), **dikey kenar `Floor_` yok**, duvarlar döşeme **altından** başlıyor. Döşeme kalınlığı 120 / 130 / 150 mm. | **N26** |
| H8-3 | **Ornek3 Biçim B (16/16 kat) — Gemini'nin tahmini doğru çıktı.** Biçim B dosyalarında döşeme kalınlığı dosyaya göre 100 / 150 / 300 mm. 200 mm yalnız bir varsayılan. | **N26** |
| H8-4 | **Gerçek 2026 dosyalarında LoD2 ↔ oda açıklıkları birebir aynı:** 512/512 açıklıkta üst kot ve alt kot aynı (146 kapı + 366 pencere), genişlik 508/512 aynı, 4'ünde ≤ 3 mm fark. Ornek4/6'daki "LoD2 1 cm aşağıda" deseni bu üreticide yok. K46b (temsil birliği) üretim kuralı olarak **doğrulandı**. | **N27** |
| H8-5 | **`registeredFloorDefinition` serbest metindir; TKGM yazım hatasını bile kabul ediyor.** Ornek3'te "3. Bodurm Kat", "3.Bodrum Kat", "3. Bodrum  Kat" (çift boşluk); Ornek1'de "8 Kat" (noktasız). Stil: örneklerde "Zemin Kat / 1. Kat / Bodrum Kat", 2026'da "ZEMİN / KAT 1 / BODRUM". | **N28** |
| H8-6 | **MAKS kimlik no `intAttribute`'tir** (6 örnek dosyada 329/329). Qwen'in AS-21 sorusu ("0 ile başlayan MAKS") geçersiz. | **N29** |
| H8-7 | **V-198 (arsa payı toplamı) kesin olarak BİLGİ. DeepSeek'in "tam parselde UYARI" önerisi (D8-P13) reddedilir.** Gerekçe ölçüme dayalı: FUA5P9 (4 blok) ve GCZ6NB (10 blok) **tam parsel** olarak tek doğrulama kodunda gönderilmiş ve toplamları ≠ 1 iken kabul almış. DeepSeek'in "daha fazla veri gerekli" dediği vaka elimizde zaten 2/2 kabul. Asıl anlamlı kontrol **V-197'dir**: her BB'nin payı liste beyandakiyle aynı mı (kesir eşitliği)? | CLAUDE7 R7-07 |
| H8-8 | **V-198a: pay = 0 → UYARI (Gemini doğru, DeepSeek D8-P14 reddedilir).** Kılavuz pay = 0'ı yasaklamıyor, bu yüzden HATA değil. Ama 634 sayılı KMK'ya göre her bağımsız bölüme bir arsa payı tahsis edilir; 0 pay hukuken anlamsızdır ve veri giriş hatasına işaret eder. Kullanıcının mutlaka görmesi gerekir. | Kılavuz + KMK m.3 |
| H8-9 | **K45c üretim kenar payı 10 mm'de kalır. DeepSeek'in 20 mm ve 30 mm önerileri reddedilir.** Açıklığın yeri onaylı projeden gelir. 30 mm kural olursa, projede duvar köşesine 15 mm yakın çizilmiş bir pencere **kaydırılmak** zorunda kalır ve model projeden sapar. 31 mm, tek bir üreticinin rastlantısal minimumu; kural değil. 10 mm, 3 hane yuvarlamada temasa dönüşme riskini sıfırlayan en küçük güvenli değer. | §6.2 D8-S2 |
| H8-10 | **DeepSeek D8-P1 kabul (önemli):** Kanonik model özetine profil ayarları da girmeli: `doorSillOffset`, `storeyStyle`, `secondaryPartAreas`, `doorObjectStartsAtFloor`, `groundSurface`, kod listesi anlık görüntü özeti, `schemaVersion`. Aksi halde profil değişip GML değiştiği halde doğrulama kodu "geçerli" görünür. | Mantık |
| H8-11 | **DeepSeek D8-P20 genelleştirilerek kabul:** Her UYARI için "**gerekçeli susturma**" mekanizması olmalı (ör. "TAPU KAYDI BÖYLE"). Gerekçe proje dosyasına ve teslim raporuna yazılır; uyarı silinmez, BİLGİ'ye iner. | UX + denetim izi |
| H8-12 | **Qwen8'in `blockName ?? ''` önerisi (Q8-09, "−1 eski rejim kalıntısı") yanlış ve reddedilir.** Kılavuz Sürdürülebilirlik değişiklikleri madde 8: *"blockName özelliği boş bırakılamaz. Eğer yok ise -1 girilir."* 2026 kabul dosyalarında `blockName = "-1"` kullanılıyor (899AK3, AFRMPJ, 662P0J, 2FRDAC, GCZ6NB-I). Gemini kodundaki `blockName ?? '-1'` **doğrudur**. `entrance` ise boş bırakılabilir, o yüzden `?? ''` (ikisi farklı kurallara tabi). | `[KILAVUZ]` + CLAUDE7 Ek-A |
| H8-13 | **Bağımsız bölüm numarası, arsa payı ve MAKS no gibi tapuya geçen değerler hiçbir zaman otomatik üretilmez.** Bu nedenle iki öneri reddedilir: Qwen8'in "depoya otomatik yeni BB numarası (42, 43) ata" ve "tip blok kopyada arsa payını otomatik eşit böl" önerileri, DeepSeek8'in "Orantısal 1'e normalize et" önerisi. Bu değerler liste beyandan gelir. Uygulama hesaplamaz, yalnız karşılaştırır. | Hukuki sorumluluk (Genelge 2025/2) |
| H8-14 | **Yeni bulgu: TKGM tek doğrulama kodunda birden çok GML kabul ediyor** (FUA5P9 = 4 GML, GCZ6NB = 10 GML). Çok bloklu parselde tek gönderim mümkün. Uygulamanın toplu ihracı, **tek ZIP / tek yükleme oturumu** mantığıyla tasarlanmalı. | CLAUDE7 Bölüm II §1.1 |

---

## 2. YENİ ÖLÇÜMLER (N26–N29)

### N26 — Kat geometrisi biçimi (27 dosya)

Yöntem: Her `grp:CityObjectGroup[grp:class='Kat']` için `grp:geometry` içindeki `Floor_` poligonları ayrıldı: yatay (z aralığı < 1 mm) olanların farklı z seviyesi sayısı ve dikey `Floor_` sayısı. `Wall_` poligonlarının en alt kotu ile döşeme kotları karşılaştırıldı. Yöntem önceki N2 sonuçlarını birebir tekrar etti (Ornek6 A, Ornek2 B), dolayısıyla güvenilir.

| Dosya | Biçim | Kat sayısı | Duvar alt − döşeme altı | Duvar alt − döşeme üstü | Döşeme kalınlığı |
|---|---|---|---|---|---|
| Ornek1 | **A** | 17 | 0 | 0 | — (tek düzlem) |
| Ornek4 | **A** | 3 | 0 | 0 | — |
| Ornek6 | **A** | 2 | 0 | 0 | — |
| Amasya (eski) | **A** | 2 | 0 | 0 | — |
| Ret dosyası | **A** | 2 | 0 | 0 | — |
| Ornek2 | **B** | 4 | +150 | 0 | 150 mm |
| Ornek3 | **B** | 16 | +300 | 0 | 300 mm |
| Ornek5 | **B** | 6 | +100 | 0 | 100 mm |
| Sincan (eski) | **B** | 5 | +150 | 0 | 150 mm |
| **18 gerçek 2026 dosyası** | **C** | **44** | **0** | **−120 (35 kat), −150 (7), −130 (2)** | 120–150 mm |

**Tanımlar (şartnameye girecek):**
- **Biçim A:** tek yatay `Floor_`; duvarlar o kottan başlar.
- **Biçim B:** döşeme kutusu (alt + üst yatay `Floor_` + dikey kenar `Floor_`'ları); duvarlar döşeme **üstünden** başlar.
- **Biçim C:** alt + üst yatay `Floor_`, dikey kenar yok; duvarlar döşeme **altından** başlar ve döşeme kenarını da örter.

Üçü de kabul görüyor.

### N27 — 18 gerçek dosyada LoD2 ↔ oda açıklık tutarlılığı (N11 tekrarı)

Yöntem: Bina düzeyindeki (`bldg:Building/boundedBy/WallSurface`) 512 kapı/pencere, aynı türdeki oda açıklıklarıyla eşleştirildi. Eşleştirme ölçütü: plan merkezi yakınlığı + üst kot farkı (×10 ağırlık; ilk denemede bazı açıklıklar alt/üst kattaki aynı plan konumuyla eşleşmişti, bu yüzden düzeltildi).

| Ölçüt | Sonuç |
|---|---|
| Eşleşen | 512/512 |
| Üst kot farkı 0 mm | 512/512 |
| Alt kot farkı 0 mm | 512/512 (kapı 146, pencere 366) |
| Genişlik farkı 0 mm | 508/512 (4 açıklıkta 1–3 mm) |

### N28 — `registeredFloorDefinition` değerleri (6 örnek + 18 gerçek)

- **Ornek1:** Zemin Kat, Bodrum Kat, 1. Kat … 15. Kat, **"8 Kat"** (noktasız, 1 kez)
- **Ornek3:** 4./3./2./1. Bodrum Kat, **"3. Bodrum  Kat"** (çift boşluk), **"3.Bodrum Kat"**, **"3. Bodurm Kat"** (yazım hatası), Zemin Kat, 1.–10. Kat
- **Ornek2/4/5/6:** Zemin Kat, Bodrum Kat, n. Kat
- **18 gerçek dosya:** ZEMİN, KAT 1, KAT 2, BODRUM

### N29 — MAKS kimlik no veri tipi

`gen:intAttribute name="maksIdentityNumber"`: Ornek1 71, Ornek2 18, Ornek3 182, Ornek4 27, Ornek5 28, Ornek6 3 → **329/329 int**.

---

## 3. GEMINI8 DENETİMİ

**Genel:** GEMINI8 bu projenin en iyi şartname sentezi. CLAUDE7'nin H7-1…H7-12 maddelerinin tamamı doğru işlenmiş. §0.0'da kullanıcı kurallarının yazılması da örnek bir davranış.

**§6.1 kod incelemesi:**
- Boşluk toleranslı desen ✔.
- `cleanLot` ile BİLGİ ✔.
- `payda === 0n` ve `pay > payda` HATA, `pay === 0n` UYARI ✔.
- `baseKey` içinde `blockName ?? '-1'` ✔ (Kılavuz madde 8) ve `entrance ?? ''` ✔.
- `cleanLot|quality` kimliğiyle Ornek1 #41 vakası iki BB sayılıyor ve V-212 üretiliyor ✔.
- BigInt EKOK/EBOB ✔. `N === L` ✔.

İki küçük ek:
1. `quality` karşılaştırmasında `trim()` var, ama Türkçe büyük harf normalizasyonu yok. "Konut" ile "KONUT" farklı BB sayılır. Karşılaştırmada `toLocaleUpperCase('tr-TR')` uygulanmalı (yalnız karşılaştırmada; yazılan değer değişmez).
2. N22'de Ornek4'te çok parçalı BB'lerin 1/8'inde propertyLot farklıydı. Bu kod onu iki BB sayar ve V-212 verir. Doğru davranış, ama V-212 mesajı "aynı BB numarası, iki farklı pay: çok parçalı BB'de pay tutarsızlığı **veya** iki ayrı BB" diye **iki olasılığı** birlikte söylemeli.

**Düzeltilecekler:**
| Yer | Sorun | Karar |
|---|---|---|
| §0 madde 7, C7-03 | Profil listesinde Biçim C yok | Profiller: `TKGM-Örnek-A10` (varsayılan; Ornek6 altın test), `TKGM-Örnek-B50` (Ornek2/3/5), **`Saha-2026-C50`** (Biçim C + delik +50 + kapı nesnesi tabandan). `Biçim B + 10 mm` yalnız eski bir dosyada (Sincan) var; seçenek olarak kalabilir, profil olarak sunulmaz |
| K42 | Döşeme kalınlığı varsayılan 200 mm | Kesitten zorunlu giriş (kat başına); örneklerde 100–300 mm (N26). 200 mm yalnız boş alan önerisi + mavi rozet |
| K55 | A/B | A/B/C (N26) |
| V-210 | "CityModel içinde BLKN_/TRS_ = 0" | Doğru. Her GML tek bina içerdiği için DeepSeek'in "bina bazında" düzeltmesiyle aynı şey; tartışma kapandı |

---

## 4. DEEPSEEK8 DENETİMİ

**Genel:** Kapsamlı ve özeleştiri disiplini iyi. Ama aynı belgede birbiriyle çelişen hükümler ve bir uydurma sayı var.

| Madde | Karar | Gerekçe |
|---|---|---|
| D8-H4 ↔ D8-H9 | ❌ **İç çelişki** | H4: "V-198 asla hata/uyarı değil". H9: "tam parselde UYARI". Aynı belgede ikisi birden olamaz. H8-7'ye göre H4 doğru |
| D8-H10 "binada 5 balkon" | ❌ Uydurma sayı | D-2; doğrusu 12 |
| D8-H5, H6, H8 | ✅ | |
| G8-H4 / D8-P16 (20/30 mm) | ❌ | H8-9 |
| G8-H6 (TKGM API'si v1'de yok, yalnız elle yapıştırma) | ✅ **Kabul** | v1'de TKGM'ye hiçbir otomatik istek yok; KVKK ve kullanım koşulları belirsiz. (CLAUDE7 C7-05 v1.1 önerimi geri çekiyorum.) |
| G8-H9 (düz tavanda tek prizma) | ✅ | Hız için doğru; tek tavan düzlemli odada kesme gereksiz |
| D8-P1 kanonik özet + profil | ✅ **Önemli** | H8-10 |
| D8-P2 TS/WASM otomatik geçiş | ⚠️ | Aşırı mühendislik. Tek yol (TS + Worker); ölçülen süre bütçeyi aşarsa WASM'e geçilir. İki motorun sonuçları da birebir aynı olmalı, yoksa determinizm bozulur |
| D8-P3 nodeSet 10 mm | ⚠️ | Varsayılan 8 mm, profil ayarı olsun. Ölçüt: tampon (5 mm) + snap ızgarası (1 mm) + güvenlik payı (2 mm) = 8 mm |
| AS-10 "18 dosya hepsi 50 mm" | ⚠️ Eksik | Delik +50 mm, **kapı nesnesi 0 mm** (iki ayrı şey, R7-02). Ayrıca "muhtemelen GMLCity" bir tahmin (D-4) |
| AS-11 "K3 Balkon kapısı 80×230" | ⚠️ | Gerçek dosyalarda 230 cm yükseklik **pencere** nesnesi olarak (denizlik 5 cm) modellenmiş; kapı nesnesi olarak değil. Açıklık tipi kütüphanesinde "balkon kapısı" için tür seçimi (Door/Window) profil bazında olmalı |
| §3.1 Parsel çalışma alanı, toplu ihraç | ✅ | H8-14 ile güçlendi |
| §3.1(3) "Orantısal 1'e normalize" | ❌ | H8-13 |
| §3.1(5) yangın 3 m, §3.1(7) Genelge 4/3 | ❌ | D-4 |
| §3.2 (3B inceleme, 2B düzenleme) | ✅ | |
| §3.3 CC1–CC9 | ✅ | CC4'te sunucu alanı `independentSectionPlannetArea` (sunucudaki yazım böyle); bu, GML'deki `independentSectionPlanNetArea`'nın **aynen** yansımasıdır, hesaplanmış bir değer değildir |
| §3.4 depo seçenekleri | ⚠️ | "Varsayılan B" yerine: **liste beyan ne diyorsa o** (§6.1 S4) |
| §3.5 zorunlu/rozetli varsayılanlar | ✅ | Ek: Döşeme kalınlığı, kat yüksekliği ve kapı/pencere tipi kesitten zorunlu |
| UX-D8-01…17 | ✅ çoğu | Konfeti ve sesli komut ❌ (D-6). Zaman çizelgesi (UX-D8-05) v1'de doğrusal geri al (100 adım), dallanma v2 |
| D8-P20 | ✅ genelleştirildi | H8-11 |

---

## 5. QWEN8 DENETİMİ

| Madde | Karar | Gerekçe |
|---|---|---|
| Kimlik ("CLAUDE8.MD") | ❌ **Kural ihlali** | D-1 |
| Ek-A N24–N25 | ❌ Geçersiz | D-2 |
| Q8-09 (`blockName ?? ''`, "−1 eski kalıntı") | ❌ | H8-12 |
| QV-214 (model özeti = GML özeti) | ❌ | D-6 |
| QK91 / QV-217 (45 dk rekor), QV-218 | ❌ | D-6 |
| AS-21 (MAKS 0 ile başlar mı) | ❌ geçersiz | N29 |
| Ortak Soru 3 tablosu: "`independentSectionPlannetArea` = BBK_ calculatedArea toplamı" | ❌ | Sunucu bu alanı GML'deki beyan değerinden (`independentSectionPlanNetArea`) okuyor; hesaplamıyor. Hesaplanan toplam ile beyan V-157'de karşılaştırılır |
| Ortak Soru 4, Seçenek A: "registeredQuality = DEPO, registeredInstallation = '41 NOLU DAİREYE AİT DEPO'" | ❌ Ornek1 ile ters | Ornek1'de "41 NOLU DAİREYE AİT DEPO" metni **registeredQuality** alanında. registeredInstallation, eklentiyi ana BB üzerinde gösteren alan (Ornek1'de 1 kayıtta 'DEPO', Ornek4'te 'E1-DEPO') |
| "Depoya otomatik yeni BB no", "arsa payını eşit böl" | ❌ | H8-13 |
| Q8-01 parsel paneli, Q8-02 komşu parsel hayaleti | ✅ / ⚠️ | Komşu GML'ler kullanıcının elindeyse faydalı. TKGM'den otomatik indirme yok |
| QK88 uuidv5 | ✅ | Zaten şartnamede (deterministik kimlik, 3. tur) |
| Ortak Soru 2 (2B düzenle / 3B incele + yalnız Z ekseninde 3B düzenleme) | ✅ | İyi ayrım |

---

## 6. EVRENSEL SORU YANITLARI (D-3)

### 6.1 GEMINI8'in 5 ortak sorusu

**S1 — Çok bloklu parsel.** Gemini, DeepSeek ve Qwen'in önerilerine eklemem gereken altı nokta var:
1. **Bir proje = bir parsel = N bina modeli.** Her blok kendi `constructionID`'sine (`<TaşınmazKimlik>-<Blok>`), kendi aplikasyon noktalarına ve kendi GML'ine sahiptir.
2. **Tip blok kopyalama** yalnız geometri, oda, açıklık ve kullanım kodlarını kopyalar. Yerleştirme o bloğun **kendi** aplikasyon noktalarından **benzerlik dönüşümüyle** (Helmert) yapılır. Ölçek 1'den sapıyorsa (ör. > 100 ppm) UYARI verilir, çünkü bu, aplikasyon noktalarının yanlış girildiğini gösterir.
3. **Bağımsız bölüm numarası, arsa payı, nitelik, MAKS no kopyalanmaz.** Her blok için liste beyandan doldurulur (H8-13). Boş kalanlar için "eksik" rozeti gösterilir.
4. **Doğrulama:** Bloklar Worker havuzunda paralel doğrulanır. Ek olarak parsel düzeyi kontroller: bloklar arası XY kesişim (taban + LoD1), V-209 (blockName tutarlılığı), V-198 parsel toplamı (BİLGİ), MAKS kimliklerinin bloklar arasında tekrar etmemesi (UYARI, yeni).
5. **İhraç:** Tek ZIP içinde `M-<no>-A.gml` … `M-<no>-J.gml`, ortak teslim raporu ve tek bir "yükleme listesi". TKGM bunları tek doğrulama kodunda kabul ediyor (H8-14).
6. **Kimlik kodu:** Doğrulama kodu parsel düzeyinde saklanır, ama özet (SHA-256) **her blok için ayrı** tutulur. Bir bloktaki değişiklik yalnız o bloğun "değişti" durumunu tetikler; uygulama "kod geçersiz olabilir" uyarısını parsel düzeyinde gösterir.

**S2 — 3B'de düzenleme mi, 2B'de mi?** 2B'de düzenle, 3B'de incele. 3B'de yalnız tek eksenli (Z) ve **sayısal girişli** düzenleme olsun: sürükleme yerine tıklayıp değer yazma; sürükleme varsa 10 mm adımlı.

Ek kural: 3B'de yapılan her değişiklik 2B'deki karşılığını ve kot tablosunu **aynı işlem** içinde günceller. Tek geri al adımı her ikisini de geri alır.

**S3 — Önizleme ekranındaki çapraz kontroller.** DeepSeek CC1–CC9 doğru. Eklerim:
- **(a)** `balconyCount`: BB'ye `xlink` ile bağlı `BLKN_` sayısı; sunucunun hesapladığıyla aynı yöntem.
- **(b)** BB başına `independentSectionStoreyNumber` = BB'nin **ana parçasının** bulunduğu katın kodu (`Kat_Z`, `Kat_-1`). Çok parçalı BB'de hangi parçanın esas alındığı belgeli değil `[DOĞRULANMALI]`.
- **(c)** `registeredFloorDefinition` serbest metin (N28). Liste beyanla karakter karşılaştırması yapılır. Farklıysa UYARI, yazım hatası şüphesi ("Bodurm") BİLGİ.
- **(d)** "Tahmini sunucu uyarıları" kutusunda her mesajın yanında "Kabulü engellemez (Warning)" etiketi bulunur.
- **(e)** Önizleme ekranının başlığında "Bu bir simülasyondur; resmi sonuç değildir" yazar (Genelge 2025/2 sorumluluk ilkesi).

**S4 — Depo/eklenti modelleme.** Yön veren tek kaynak **liste beyandır**. Sihirbaz önce şunu sorar: "Bu depo liste beyanda kendi bağımsız bölüm numarası ve arsa payıyla mı geçiyor?"
- **Evet →** Ayrı BB. Numara ve pay liste beyandan girilir. Numara başka bir BB'ninkiyle çakışıyorsa (Ornek1 #41) V-212 UYARI ve gerekçeli susturma (H8-11).
- **Hayır, bir dairenin eklentisi →** Ana BB'nin `registeredInstallation` alanına liste beyandaki eklenti metni yazılır (ör. "DEPO", "E1-DEPO"). Geometri isteniyorsa depo, ana BB'nin parçası (`SectionPart`, kullanım 1006 Eklenti) olarak çizilir. Pay ana BB'ninkidir.
- **Hayır, ortak alan →** OA (`commonAreaUsage` 1030 Depo).

Uygulama hiçbir seçenekte numara veya pay **üretmez**.

**S5 — Zorunlu giriş / varsayılan.** Kural: **Tapuya veya resmi kayda geçen her değer zorunludur, varsayılan alamaz.** Bunlar: Taşınmaz kimlik, blok, BB no, arsa payı, nitelik, eklenti, kat tanımı, MAKS no'ları, onay tarihi, işlem tipi, EPSG.

**Kesitten gelen ölçüler** (kat yüksekliği, döşeme kalınlığı, kapı/pencere tipleri) ilk girişte zorunludur, sonra bağlamdan önerilir.

**Sabit kod değerleri** (buildingType 1001, geometrySuitability 1006 ve diğerleri) kilitli ve sessizdir.

**Biçim tercihleri** (posList, 3 hane, profil) sessiz varsayılandır.

### 6.2 DEEPSEEK8'in D8-S1…S5 soruları

- **S1 (V-198 iki düzey):** Hayır. Tam parsel (4 ve 10 blok) ≠ 1 ile kabul almış 2/2 örnek var (H8-7). V-198 BİLGİ. Asıl kontrol V-197 (BB bazında liste beyan eşitliği).
- **S2 (10/20/30 mm):** 10 mm (H8-9). Açıklık projedeki yerinden kaydırılmaz; 10 mm'nin altına düşen açıklık için kullanıcıya fark tablolu öneri sunulur.
- **S3 (sondaki boşluk):** (a) BİLGİ. Üretimde `trim()` ve TR büyük harf uygulanır. Karşılaştırmalarda normalize edilmiş metin kullanılır.
- **S4 (odak modu):** (c) tüm kat soluk (%15 opaklık, etiketsiz, seçilemez) + odaklanan BB tam renkli. Yön bulma için kat bütünü gerekir; komşu halkası (b) düzensiz kesitler üretir ve kafa karıştırır.
- **S5 (`registeredFloorDefinition` stili):** (c) Liste beyandan **aynen**. TKGM yazım hatasını bile normalize etmeden kabul ediyor (N28). Liste beyan yoksa öneri olarak K82 eşlemesiyle 2026 stili ("ZEMİN", "KAT n", "BODRUM") sunulur, mavi rozetle.

### 6.3 QWEN8'in §7 soruları ve açık sorular

- **DeepSeek'e "`OpeningType` TS":** Gemini7 §6.1'deki `OpeningType` arayüzü yeterli. Tek ek: `objectKind: 'Door' | 'Window'` ile `usage` kodunun ayrı tutulması, çünkü "balkon kapısı" bazı üreticilerde Window nesnesi (N27, AS-11).
- **ChatGPT'ye "GroundSurface tarihçesi":** Artık gerekmez. 24/24 güncel dosya cevap verdi (R7-01).
- **Grok'a önizleme mockup'ı:** DeepSeek UX-D8-10 yeterli; Grok gelirse yalnız erişilebilirlik ve renk kontrastı denetimi yapsın.
- **Qwen'e WASM benchmark:** M0'da **ölçülerek** karar verilir, tahminle değil.
- **AS-16 (ret kodları):** Hâlâ en büyük boşluk. Kullanıcıdan istenmeye devam.
- **AS-17 (başka üretici):** Açık. N26'daki Biçim C ve "kapı nesnesi 0 mm" deseni üreticiye özgü olabilir.
- **AS-18 (PDF rapor):** Açık (kullanıcı indirip klasöre koyarsa).
- **AS-19 (kesit + liste beyan):** Açık.
- **AS-20 (Kat Biçimi + N11, 18 dosya):** **KAPANDI** (N26, N27).
- **AS-21:** **GEÇERSİZ** (N29).

---

## 7. ŞARTNAME v3.5 — DONDURULACAK DÜZELTMELER (GEMINI9 İÇİN)

| Kod | Değişiklik |
|---|---|
| **K42 (rev)** | Döşeme kalınlığı kat başına zorunlu kesit girdisi; boşsa 200 mm önerisi + mavi rozet. Ölçülen aralık 100–300 mm |
| **K55 (rev)** | Kat biçimleri A / B / C (N26 tanımları). Varsayılan A. Profil ile seçilir; tek dosyada karışık biçim üretilmez |
| **Profiller** | `TKGM-Örnek-A10` (varsayılan) · `TKGM-Örnek-B50` · `Saha-2026-C50` (Biçim C + delik +50 + `doorObjectStartsAtFloor` + K46b birebir) |
| **K46b (kesin)** | Yeni üretimde LoD2 ve oda açıklıkları birebir aynı (N27: 512/512). İçe alınan dosyada fark BİLGİ |
| **K45c (kesin)** | Üretim kenar payı ≥ 10 mm. Doğrulama: < 1 mm HATA, 1–9 mm BİLGİ |
| **V-198 (kesin)** | Her durumda BİLGİ |
| **V-198a (kesin)** | Biçim ihlali HATA; pay = 0 UYARI; boşluk BİLGİ |
| **K87 (yeni)** | `registeredFloorDefinition` serbest metin, liste beyandan aynen. Liste beyanla fark UYARI, yazım hatası şüphesi BİLGİ |
| **K88 (yeni)** | Tapuya geçen değerler (BB no, pay, nitelik, eklenti, kat tanımı, MAKS) hiçbir koşulda otomatik üretilmez veya normalize edilmez (H8-13) |
| **K89 (yeni)** | Kanonik model özeti profil ayarlarını ve kod listesi anlık görüntüsünü içerir (H8-10). Blok başına ayrı özet |
| **K90 (yeni)** | Gerekçeli susturma: UYARI → BİLGİ, gerekçe metni projeye ve teslim raporuna yazılır (H8-11) |
| **K91 (yeni)** | v1'de TKGM sistemlerine hiçbir otomatik istek yok. Sonuç içe aktarma yalnız kullanıcının yapıştırdığı metin veya HTML ile yapılır. Kişisel veri ayıklanır (K83) |
| **V-213 (yeni)** | Aynı parselde iki blokta aynı BB MAKS kimlik no → UYARI |
| **V-214 (yeni)** | Kopyalanan blokta Helmert ölçeği 1'den > 100 ppm sapıyor → UYARI |
| **V-212 (rev)** | Mesaj iki olasılığı birlikte söyler (çok parçalı BB'de pay tutarsızlığı **veya** iki ayrı BB) |
| Karşılaştırma normalizasyonu | Nitelik ve kat tanımı karşılaştırmalarında `trim()` + `tr-TR` büyük harf + çoklu boşluğu teke indirme; yazılan değer değişmez |

**Reddedilen öneriler (v3.5'e girmez):**
- Qwen8: QK91, QV-214, QV-217, QV-218, Q8-09.
- DeepSeek8: D8-P13 iki düzeyli V-198, D8-P14 pay=0 BİLGİ, D8-P16 20 mm, "orantısal 1'e normalize", yangın mesafesi kuralı.

---

## 8. 9. TUR İÇİN HER AI'YA GÖREV (KULLANICI ADINA)

| AI | Görev | Biçim |
|---|---|---|
| **GEMINI** | §7'yi işleyip **Şartname v3.5 konsolide** yayımla (K01–K91, V-001–V-214) ve **M0 iş paketi listesini** çıkar (dosya ağacı, modüller, test fikstürleri, kabul ölçütleri) | GEMINI9.md |
| **DEEPSEEK** | v3.5'in ciddiyet tablosunu ve M0 iş paketini satır satır denetle. D8-H4 ↔ D8-H9 çelişkisini yazılı olarak kapat | DEEPSEEK9.md |
| **QWEN** | **İlk paragraf D-1 onay cümlesi.** Sonra yalnız M0 test fikstürü önerileri: Ornek1 #41, Ornek3 "Bodurm", boşluklu propertyLot, Biçim A/B/C örnek katlar | QWEN9.md |
| **CHATGPT / GROK** | Katılırlarsa: yalnız GEMINI9 + CLAUDE8 üzerinden v3.5 denetimi | CHATGPT9.md / GROK9.md |
| **HEPSİ** | §0 D-1…D-9 onayı. Gerçek saat. Kendi adı. Başkasına sorulan sorulara da cevap | — |

---

## 9. KULLANICIYA NOT (KANIT BOŞLUKLARI)

1. **Ret almış doğrulama kodu** (AS-16): Hâlâ en değerli tek veri. Bir tane bile olsa, hangi kuralların gerçekten HATA olduğunu görmemizi sağlar.
2. **Başka bir bürodan / yazılımdan kabul kodu** (AS-17): Biçim C ve "kapı nesnesi tabandan" desenlerinin genel mi, tek üreticiye mi özgü olduğunu ayırır.
3. Bu turda da **hiçbir dosya indirilmedi.** 18 GML tarayıcı belleğinde ölçüldü; gönderen kişinin kimlik bilgileri okunmadan atıldı.

---

## Ek-A. Ölçüm yöntemi özeti

- **N26:** Yerel 9 dosyada C# (`Probe8.cs`). 18 gerçek dosyada aynı mantıkla tarayıcı içi JavaScript. Kat grubu = `grp:CityObjectGroup[grp:class='Kat']`; `grp:geometry` altındaki `Floor_` ve `Wall_` poligonları, kimlik önekine göre ayrıldı.
- **N27:** Bağlam: kapı/pencere elemanının en yakın atası `bldg:Room` → oda; `CityObjectGroup` / `GenericCityObject` / `BuildingInstallation` → hariç; yalnız `bldg:Building` → LoD2. Eşleştirme: aynı tür, plan merkezi mesafesi + 10 × |üst kot farkı| en küçük, eşik 0,8.
- **N28 / N29:** Düzenli ifade sayımı (`gen:*Attribute name=...`).
