# CLAUDE, 08.11.2026, 00:58, 3DBİNA UYGULAMASI 7. TUR

> **Dosya yapısı:** Bu dosya iki bölümden oluşur.
> - **BÖLÜM I — 7. Tur Kapanış Denetimi (00:58):** Gemini v7 (`implementation_plan (7).md`, başlık "GEMİNİ, 08.11.2026, 00:35") ile `QWEN7.txt`'nin satır satır denetimi ve yeni ölçümler (N21–N23).
> - **BÖLÜM II — 7. Tur Hazırlık Verisi (00:47):** 6 doğrulama kodundan gelen 18 gerçek kabul GML'inin ölçümleri (R7-01 … R7-14). Bölüm I, Bölüm II'ye sık atıf yapar.
>
> **Okunan girdiler:** Gemini v7 (542 satır, tamamı), QWEN7.txt (86 satır, tamamı), CLAUDE7 Bölüm II (kendi hazırlık belgem). ChatGPT 7 ve Grok 7 dosyaları klasörde yok.

---

# BÖLÜM I — 7. TUR KAPANIŞ DENETİMİ

## I.0 Yönetici Özeti — 12 Hüküm

**Zamanlama notu (önemli):** Gemini v7 **00:35**'te yazılmış. Gerçek kabul verilerini içeren CLAUDE7 Bölüm II ise **00:47**'de yazıldı. Yani Gemini v7, 6 doğrulama kodundan çıkan bulguları **görmeden** hazırlandı. QWEN7 de Bölüm II'ye hiç atıf yapmıyor. Bu yüzden ikisinde de, kendi döneminde doğru olan ama artık güncellenmesi gereken üç madde var (H7-1, H7-2, H7-3). Bunlar o AI'ların "hatası" sayılmamalı; yalnız sırayla gelen veri yüzünden eskimiş durumdalar.

| # | Hüküm | Kanıt | Kime |
|---|---|---|---|
| **H7-1** | **"Kapı alt boşluğu 0 mm yasak" (Gemini K45 rev2) daraltılmalı.** Yasak yalnız duvardaki **delik halkası** için geçerli. 18 gerçek kabul dosyasında kapı **nesnesi** tabandan başlıyor (0 mm, 870/870), delik ise +50 mm'den. | Bölüm II R7-02, N20 | Gemini, Qwen |
| **H7-2** | **`propertyLot` için katı `^\d+/\d+$` deseni (Gemini §6.3 kodu, K75; Qwen "boşluk = HATA") doğrulayıcıda yanlış alarm üretir.** Gerçek kabul dosyalarında 33 BB'nin 28'i `"3712 / 97787"` biçiminde, biri sonda boşluklu. Gemini'nin kodu bu 28 değeri `syntaxErrors`'a (HATA) atar. Üstelik bu BB'ler toplamdan da düşer ve arsa payı toplamı da yanlış çıkar. | Bölüm II R7-05 | Gemini, **Qwen (D7 §3 doğrudan çelişiyor)** |
| **H7-3** | **V-198 "parsel tümüyle yüklüyse UYARI" (Gemini) → her durumda BİLGİ.** Tüm blokları yüklü iki gerçek parselde toplam 103500/104683 ve 97780/97787. İkisi de kabul. | Bölüm II R7-07 | Gemini |
| **H7-4** | **YENİ: BB kimlik anahtarı `blockName\|entrance\|independentSectionNumber` benzersiz değil.** Ornek1'de **iki ayrı BB aynı numarayı taşıyor:** "41 NOLU DAİREYE AİT DEPO" (kullanım 1005, pay 79/6534, Bodrum) ve KONUT (pay 98/6534, 10. Kat). Gemini'nin V-198 kodu bu ikisini "tek BB'nin iki parçası" sayar ve V-198b uyarısı verir. Bu, CLAUDE6 H9'daki benim tekilleştirme yöntemimin de eksiği. | **N21** (bu tur) | Gemini, Qwen, Claude (öz-düzeltme) |
| **H7-5** | **YENİ: Ornek1'in doğru tekilleştirilmiş arsa payı toplamı 1'den BÜYÜK: 6614/6534.** CLAUDE6'daki "362/363" değeri, depo kaydını yanlışlıkla eleyen yöntemin sonucuydu `[DÜZELTME]`. TKGM, **toplamı 1'i aşan** bir dosyayı da örnek olarak yayımlamış. V-198 kesinlikle BİLGİ. | **N21** | Hepsi |
| **H7-6** | **YENİ: Gemini G7-EK5'teki "dubleks parçalarda net/brüt alan birebir aynı" kuralı ölçümle çelişiyor.** Ornek1'de ikincil parçanın net alanı **−1,00** yazılmış. Ornek4'te 8 çok parçalı BB'nin 3'ünde net/brüt farklı. Kabul görmüş iki farklı yazım var: (a) değer tüm parçalarda tekrar edilir (Ornek2/3/5), (b) yalnız ana parçada değer, diğerlerinde −1 (Ornek1). | **N22** | Gemini |
| **H7-7** | **YENİ: Dubleks parçalarının `independentSectionUsage` kodu "giriş katı 1001/1002, diğer kat 1003" (Gemini) kuralından daha zengin.** Kod listesi: 1001 Mesken, 1002 Ticari, **1003 Çoklu Kat, 1004 Çatı Arası, 1005 Depo, 1006 Eklenti**. Ölçülen desenler: [1002,1003], [1001,1004] (Ornek2 çatı arası), [1001,1003], [1003,1002] (Ornek5, sıra ters), [1001,1006,1003,1006] (Ornek4, eklentili). | **N22** + `[KODLİST]` | Gemini |
| **H7-8** | **AS-6 (`roofProjectionArea`) Ornek6 için Gemini doğru (120,79 = çatı XY izdüşümü; RoofEdge 91,34).** Ama "birebir eşit" genellenemez: Ornek1'de değer 880,08, ölçülen çatı izdüşüm toplamı 867,98; Ornek5'te 109,43, ölçülen yaklaşık 114,5. Saçak dahil olduğu kesin. Ancak üreticiler arasında %1–5 fark var. Bizim hesap: XY birleşim alanı (Clipper2 Union). İçe alınan dosyada fark BİLGİ. | **N23** | Gemini |
| **H7-9** | **AS-7 (Kat Biçimi × kapı eşiği) Gemini'nin "Stil 1 varsayılan = Biçim B + 10 mm" kararı zayıf kanıta dayanıyor.** Bu kombinasyonun tek örneği Sincan, o da **eski rejim** dosyası. Ornek3'ün Kat Biçimi ölçülmedi, Gemini "(50 mm grubu)" diye tahminle yazmış. 18 gerçek kabul dosyasının Kat Biçimi de ölçülmedi. Önerim: varsayılan stil, altın testimiz olan **Ornek6 (Biçim A + 10 mm)** olsun. Böylece varsayılan çıktı TKGM'nin kendi örneğiyle birebir karşılaştırılabilir. | `[ÖLÇÜLDÜ N2, N12]` + eksik ölçüm | Gemini |
| **H7-10** | **Gemini K15–K19'daki "onay tarihi yoksa `1900-01-01`" ifadesinin kaynağı yok.** Kılavuz'da yalnız YYYY-AA-GG biçim kuralı var. Kabul görmüş dosyalarda yer tutucu olarak **`2000-01-01`** görülüyor (Ornek5, Sincan). Uydurma bir varsayılan yazılmamalı. Alan boşsa kullanıcıdan istenmeli (zorunlu alan). | `[KILAVUZ s.2648–2651]`, `[ÖLÇÜLDÜ-6 N19]` | Gemini |
| **H7-11** | **QWEN7 dosyasının başlığında "DEEPSEEK, … DEEPSEEK7.md" yazıyor.** Dosya adı ise QWEN7. Standart gereği başlık "QWEN, 08.11.2026, …, 3DBİNA UYGULAMASI 7. TUR" olmalı. İçerik ayrıca DeepSeek'in 6. tur hatalarını "kendi hatası" olarak geri alıyor. Hangi AI'nın yazdığı netleşmeli, yoksa sonraki turlarda kimin neyi savunduğu karışır. | Dosya başlığı | Kullanıcı, Qwen |
| **H7-12** | **Qwen D7-02: "`clipper2-wasm` (Rust derlemesi)" yanlış.** Clipper2 (Angus Johnson) bir **C++** (ve C#/Delphi) kütüphanesidir. WASM sürümleri C++'tan Emscripten ile derlenir. Saf JS/TS portları da var. Öneri (Worker'da çalıştırma) doğru, gerekçesi yanlış. | Kütüphane bilgisi | Qwen |

**Proceed:** M0–M3.5 **yeşil**; Gemini v7'nin aşama planı bu açıdan doğru. M4–M6 için H7-1, H7-2, H7-4, H7-6, H7-7 işlenmeden "yeşil" denmemeli. Bunlar **veri modelini** (BB kimliği, dubleks parça modeli) ve **doğrulayıcı temelini** etkiliyor; sonradan değiştirmek pahalı olur. Düzeltmeler küçük ve net olduğu için 8. turu beklemeden Gemini şartnameye işleyebilir.

---

## I.1 Bu Turdaki Yeni Ölçümler (N21–N23)

### N21 — BB kimliği ve Ornek1 arsa payı (düzeltilmiş)

Ornek1'deki çok parçalı gruplar (anahtar = blockName | entrance | independentSectionNumber):

| Anahtar | Parça | kullanım | propertyLot | registeredQuality | registeredFloorDefinition | net |
|---|---|---|---|---|---|---|
| 1 \| 12D \| 66 | 1 | 1002 Ticari | 150/6534 | DÜKKAN | Zemin Kat | 192,04 |
| | 2 | 1003 Çoklu Kat | 150/6534 | DÜKKAN | Bodrum Kat | **−1,00** |
| 1 \| 12C \| 65 | 1 | 1002 Ticari | 79/6534 | DÜKKAN | Bodrum Kat | 60,56 |
| | 2 | 1003 Çoklu Kat | 79/6534 | DÜKKAN | Zemin Kat | **−1,00** |
| 1 \| 12 \| 41 | — | 1005 Depo | **79/6534** | 41 NOLU DAİREYE AİT DEPO | Bodrum Kat | 39,06 |
| | — | 1005 Depo | **98/6534** | KONUT | 10. Kat | 132,84 |

Not: Ornek1'de `entrance` **dolu** (12, 12A, 12B, 12C, 12D). Gerçek kabul dosyalarında boştu. İki biçim de kabul görüyor.

**Sonuç ve yeni kimlik kuralı `[ÖNERİ]`:**
- Aynı anahtarı taşıyan kayıtlar ancak **propertyLot ve registeredQuality aynıysa** "tek BB'nin parçaları" sayılır.
- Bu ikisi farklıysa kayıtlar **ayrı BB'dir** ve V-212 (yeni, UYARI) uygulanır: "Aynı BB numarası iki farklı nitelikte kullanılmış (41: DEPO / KONUT). Liste beyanla kontrol edin."
- Bu kuralla Ornek1: 68 benzersiz BB, toplam **6614/6534** (fazla 80/6534). Önceki yöntemim 67 BB ve 6516/6534 (= 362/363) veriyordu, çünkü 98/6534'lük KONUT kaydını depo ile birleştirip eliyordu. `[DÜZELTME — CLAUDE6 H8/N16]`

### N22 — Çok parçalı BB'lerde öznitelik tutarlılığı (Ornek1–5)

| Dosya | Çok parçalı BB | Hep aynı | Parçaya göre farklı | Kullanım desenleri |
|---|---|---|---|---|
| Ornek1 | 3 (biri aslında N21 çakışması) | propertyLot, registeredQuality, registeredInstallation, MAKS no, geometrySuitability | net/brüt (−1), calculatedArea, partCount, registeredFloorDefinition, kullanım | [1002,1003]×2 |
| Ornek2 | 4 | propertyLot, nitelik, eklenti, **net/brüt**, MAKS, **registeredFloorDefinition** | kullanım, calculatedArea, partCount | [1001,**1004**]×4 |
| Ornek3 | 8 | propertyLot, nitelik, eklenti, net/brüt, MAKS | kullanım, calculatedArea, partCount, registeredFloorDefinition | [1002,1003]×8 |
| Ornek4 | 8 | nitelik, eklenti, MAKS (8/8); propertyLot 7/8; net/brüt 5/8 | kullanım, partCount, registeredFloorDefinition; net/brüt 3/8; propertyLot 1/8 | [1001,1003]×5, [1001,1006,1003,1006]×3 |
| Ornek5 | 3 | propertyLot, nitelik, eklenti, net/brüt, MAKS, partCount | kullanım, calculatedArea, registeredFloorDefinition | [**1003,1002**]×3 |

**Model kararı (G7-EK5'in düzeltilmiş hali):**
- `IndependentSection` (mülkiyet birimi), sahibi olduğu alanları **tek yerde** tutar: propertyLot, registeredQuality, registeredInstallation, MAKS no, net/brüt (Gemini'nin ana-parça fikri doğru).
- `SectionPart` kendine ait alanları tutar: `partUsage` (1001/1002 ana parça; 1003 çoklu kat; 1004 çatı arası; 1006 eklenti; 1005 depo), calculatedArea, partCount, registeredFloorDefinition (parçanın katı).
- **Yazım profili** (iki kabul görmüş biçim): `secondaryPartAreas: 'repeat'` (Ornek2/3/5, varsayılan) | `'minusOne'` (Ornek1).
- V-198b yalnız propertyLot / registeredQuality / MAKS farkında UYARI vermeli. Net/brüt farkı ve −1 değeri **BİLGİ** olmalı.

### N23 — `roofProjectionArea` ↔ çatı geometrisi

| Dosya | roofProjectionArea | Çatı poligonları XY izdüşüm toplamı | Not | RoofEdge | FootPrint |
|---|---|---|---|---|---|
| Ornek1 | 880,08 | 867,98 (214 poligon) | tek yüz; değer ölçümden %1,4 büyük | 737,89 | 984,29 |
| Ornek2 | 306,94 | **306,94** (4) | birebir | 225,45 | 232,59 |
| Ornek3 | 462,50 | 946,16 (26) → ÷2 ≈ 473,1 | çift yüzlü çatı; %2,3 fark | 445,08 | 8359,08* |
| Ornek4 | 486,61 | **486,61** (1) | birebir | 361,25 | 1284,00 |
| Ornek5 | 109,43 | 228,98 (44) → ÷2 ≈ 114,5 | çift yüzlü çatı; %4,6 fark | 218,41 | 375,74 |
| Ornek6 | 120,79 | 241,59 (66) → ÷2 = **120,79** | çift yüzlü çatı (üst + alt yüz), birebir | 91,34 | 91,34 |

\* Ornek3 FootPrint çok poligonlu (podyum + bloklar).

Çift yüzlü çatılarda (kalınlıklı çatı: üst ve alt yüz) basit toplam iki kat sayıyor. Doğru yöntem **XY izdüşümlerinin birleşimi (Union)**. Bu yöntem Ornek2/4/6'da birebir tutuyor, diğerlerinde %1–5 farkla. **Karar:** K65 "saçak dahil, XY birleşim" kesin. İçe alınan dosyada beyan ile hesap arasındaki fark ≤ %5 ise BİLGİ, > %5 ise UYARI `[ÖNERİ]`. Kesin eşik **[DOĞRULANMALI]**.

---

## I.2 Gemini v7 — Satır Satır Denetim

### I.2.1 Doğru ve iyi olanlar (korunmalı)

- **Öz-eleştiri (§0 madde 1, 2):** Mahal sözlüğü ve pencere varsayılanları tamamen düzeltilmiş. §7.2'deki genişletilmiş sözlük (1010–1030 kodları, BLKN/TRS ayrımı, "OFİS" → registeredQuality kuralı) çok iyi.
- **§1.2 ret tablosu:** DeepSeek/Grok hatalarının gerekçeleri ölçümle uyumlu.
- **G7-EK1 / AS-1:** Rehber v3.0.0 sürüm notu ("Lod2MultiSurface içerisine GroundSurface tanımı eklendi") gerçek bir kaynak. Bu not benim 3. ve 5. tur belgelerimde `[OKUNDU]` etiketiyle geçiyor. Tarihsel açıklama mantıklı. Bölüm II R7-01 (18/18 gerçek kabul) bunu **doğrudan doğruluyor**. Artık A/B testine gerek yok, `omit` profili de **gereksiz**. Kaldırılabilir veya yalnız "eski rejim dosyasını korurken" (K70) kullanılabilir.
- **G7-EK3 Analitik köşe kurtarma:** Doğru ve gerekli. (Qwen'in sorusuna cevap aşağıda, I.4.)
- **G7-EK6, G7-EK7, G7-EK8, G7-EK9:** Doğru ve uygulanabilir.
- **§9.1 Güvenlik:** Doğru. Bir ek: CSP'deki `http://cbs.tkgm.gov.tr` şifresiz. Kod listeleri **profil paketinde gömülü** gelmeli (çevrimdışı çalışma), URL'den güncelleme yalnız isteğe bağlı ve imza/özet karşılaştırmalı olmalı. Aksi halde "çalışma anında URL'den indirme" (K60) ağ yoksa uygulamayı durdurur.
- **§10.1 tolerans matrisi:** Doğru (CLAUDE6 §13 ile aynı).

### I.2.2 Düzeltilmesi gerekenler

| Yer | Sorun | Düzeltme |
|---|---|---|
| §0 madde 3, K45 rev2 | "0 mm yasak" kapı nesnesini de kapsıyor | Bölüm II K45 rev3: yasak yalnız delik için; kapı nesnesi profil seçeneğiyle tabandan başlayabilir (H7-1) |
| §6.3 kodu, K75 | `/^\d+\/\d+$/` katı; boşluklu geçerli değerleri HATA yapıyor ve toplamdan düşürüyor | `const m = raw.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/)`. Boşluk varsa **BİLGİ** ("üretimde boşluksuz yazılacak"). Biçim ihlali (harf, ondalık, eksik `/`) HATA (H7-2) |
| §6.3 kodu | `pay <= 0n` HATA: Kılavuz yalnız "pay paydadan büyük olamaz" ve "boş olamaz" diyor | `pay === 0n` için UYARI (0 paylı BB olağandışı ama Kılavuz yasaklamıyor) `[DOĞRULANMALI]` |
| §6.3 kodu, bbKey | Anahtar benzersiz değil (N21) | `bbKey + '\|' + propertyLot + '\|' + registeredQuality` ile grupla; aynı anahtar + farklı nitelik → V-212 (H7-4) |
| §6.3 kodu, durum | `isFullParcelLoaded → UYARI_PARCEL_MISMATCH` | Her durumda BİLGİ; fark yine de gösterilir (H7-3, H7-5) |
| §6.3 kodu | `entrance \|\| '-1'` | Boş giriş ile "-1" giriş farklı değerler; birleştirilmemeli. `entrance ?? ''` |
| G7-EK5 / V-198b | Net/brüt eşitliği kuralı | N22 modeli; net/brüt farkı ve −1 BİLGİ (H7-6) |
| G7-EK5 | Kullanım kodu kuralı eksik | 1003/1004/1005/1006 desenleri (H7-7) |
| §2.3 / C6-18 | Varsayılan stil B+10 (tek eski dosyaya dayanıyor) | Varsayılan A+10 (Ornek6 altın test). B+10 ve B+50 seçenek olarak kalır (H7-9). 18 gerçek dosyanın Kat Biçimi 8. turda ölçülmeli |
| K15–K19 | `1900-01-01` uydurma varsayılan | Tarih zorunlu alan; yer tutucu yazılmaz (H7-10) |
| K06–K11 | "Yeni üretimde tam 3 ondalık" | Doğru (üretim tercihi). Ancak doğrulamada >3 hane yalnız BİLGİ (R7-04). K70'te kaynak hane sayısı korunur |
| §9.2 | "Ornek3 (40 MB)" | Ölçülen 37,9 MB; yaklaşık doğru |
| G7-EK2 / §6.2 | "%100 bağımsız" iddiası | Yöntem doğru, ama şart var: üçgenler **tavan düzlemlerinin XY izdüşüm sınırlarıyla kesilmeli**, yani her parça tek tavan düzleminin altında kalmalı. Uygulama: tavan poligonlarının XY izdüşümünü taban poligonuyla Clipper2 Intersection ile kes, her parçayı earcut'la üçgenle, köşe yüksekliklerini o düzlemin denkleminden al. Böylece sonuç kesin (mahya ve kademe dahil). §6.2'deki "gerekirse" kelimesi "**her zaman**" olmalı |
| §0 madde 10, K78 | "`omit` seçilebilir + A/B paketi" | 18 gerçek kabul sonrası `omit` üretim seçeneği gereksiz; yalnız K70'te "kaynakta yoksa ekleme" kuralı kalsın |
| §8 golden | Yalnız Ornek6 | Bölüm II Ek-A tabloları (18 gerçek dosya) da eklenmeli. Ama bu dosyaların yerel kopyası yok; CI için kullanıcı izniyle indirme gerekir |

### I.2.3 Gemini'nin bana sorduğu 3 soru (§11 madde 1)

1. **AS-1 (GroundSurface):** ✅ Onaylıyorum. Üstelik artık gerçek 2026 kabul verisi (18/18) de var.
2. **AS-6 (roofProjectionArea):** ✅ Saçak dahil, onaylıyorum. "Birebir eşit" ifadesi yalnız Ornek2/4/6 için geçerli (N23).
3. **AS-7 (Biçim × eşik):** ⚠️ Kısmen onaylıyorum. "Doğrulayıcı çapraz kısıt uygulamıyor" sonucu makul (Sincan). Ama varsayılan stil seçimine itirazım var (H7-9).
4. **G7-EK2:** ✅ Koşullu onay (yukarıdaki kesme şartıyla).
5. **G7-EK3:** ✅ Onay. Genelleme kuralı aşağıda (I.4).

---

## I.3 QWEN7 — Denetim

| Madde | Hüküm | Not |
|---|---|---|
| Başlık | ❌ | "DEEPSEEK … DEEPSEEK7.md" yazıyor; dosya QWEN7 (H7-11) |
| §0 5 geri alma | ✅ İçerik doğru | DeepSeek'in 6. tur hataları doğru biçimde geri alınmış |
| §1 Gemini G7 onayları | ✅ | "Tek doğru çözüm" gibi mutlak ifadeler abartılı ama içerik doğru |
| D7-01 BigInt erken çıkış | ✅ | Desen eşleşmezse BigInt'e hiç gidilmez; `RangeError` riski de yok olur |
| D7-02 Worker / WASM | ✅ öneri, ❌ gerekçe | Clipper2 C++'tır, Rust değil (H7-12). Önce saf TS + Worker; ölçülen süre bütçeyi aşarsa WASM |
| D7-03 Kapı yayı + kiriş kontrolü | ✅ | Eşik: kiriş/R oranı ≈ √2 (90°). 70–120 cm dışı → "Açıklık adayı" mavi rozet |
| D7-04 Normalize → SHA değişir + onay | ✅ | Doğru. Ek: doğrulama kodunun düşeceği mesajda belirtilmeli |
| D7-05 Levenshtein | ⚠️ Riskli | Kısa Türkçe kelimelerde tehlikeli: "ODA"↔"ADA", "HOL"↔"SOL", "SALON"↔"BALKON" (mesafe 2). Kural: önce tam eşleşme + eş anlamlı sözlük; bulanık eşleşme yalnız **≥ 5 harfli** kelimelerde, mesafe ≤ 1, **asla otomatik atama değil**, yalnız öneri ve onay. "%95 güven" ve "%80 yük azalır" sayıları ölçülmemiş |
| D7-06 Performans regresyon testi | ✅ | CI süreleri gürültülü; mutlak değil göreli eşik (ör. ana daldan %30 yavaş → kırmızı) |
| D7-07 IPC + Zod | ✅ | Gemini §9.1 ile uyumlu |
| D7-08 Mavi gösterim | ✅ | |
| §3 V-198a "boşluk = HATA" | ❌ **Gerçek veriyle çelişiyor** | Bölüm II R7-05: boşluklu değerlerle 28 BB kabul aldı (H7-2) |
| §3 V-205 eyleme dönük buton | ✅ | |
| §5 "M4–M7 hepsi PROCEED" | ⚠️ | H7-1, H7-2, H7-4, H7-6, H7-7 işlenmeden M4–M6 yeşil değil |

---

## I.4 Qwen'in Bana Sorduğu Soru: G7-EK3 Köşe Kurtarmanın Yıldız Kavşakta Genellenmesi

**Cevap: En küçük kareler gerekmez.** Her oda köşesi, o odanın poligonunda **ardışık iki kenarın** kesişimidir. Kavşakta kaç çizgi buluşursa buluşsun, oda poligonu o noktada yalnız iki kenara sahiptir. Kural:

1. Yol A'nın 1. adımında (şerit tamponundan önce) orijinal DXF parçaları 1 mm ızgarada **düğümlenir**: tüm kesişim noktaları ve uç noktalar bir "düğüm kümesi" (`nodeSet`) olarak saklanır.
2. Delik poligonu +5 mm dışa ofsetlendikten sonra her köşe için ardışık iki kenarın taşıyıcı doğrularının kesişimi P hesaplanır.
3. Atlama koşulları: iki kenar arasındaki açı < 5° veya > 175° ise (neredeyse doğrusal, T-kavşağın düz tarafı) köşeye dokunulmaz. Tekrar eden köşe de silinir.
4. P'ye ≤ 8 mm uzaklıkta bir `nodeSet` düğümü varsa köşe **o düğüme** kenetlenir. P'ye değil düğüme kenetlenir, çünkü düğüm orijinal çizimden gelir ve komşu odaların da aynı noktaya kenetlenmesini garanti eder (ortak köşe = topolojik tutarlılık).
5. Düğüm yoksa P kullanılır (P ≤ 8 mm ise), o da yoksa köşe olduğu gibi kalır ve "köşe kurtarılamadı" BİLGİ'si verilir.
6. Yıldız kavşakta (≥ 3 çizgi) aynı düğüm her odanın kendi iki kenarıyla bulunur. Tüm komşu odalar **aynı düğüme** oturur. En küçük kareler kullanılsaydı her oda için farklı bir nokta çıkar ve odalar arasında mikro boşluk/bindirme oluşurdu. Yani en küçük kareler burada zararlı.

---

## I.5 Şartname v3.4'e Bölüm II'ye Ek Olarak İşlenecekler

- **K75 (rev4):** Doğrulama deseni `^\s*(\d+)\s*/\s*(\d+)\s*$`. Boşluk → BİLGİ; pay > payda, payda 0, boş, birden çok değer → HATA; pay 0 → UYARI `[DOĞRULANMALI]`.
- **K84 (yeni) — BB kimliği:** `(blockName, entrance, independentSectionNumber, propertyLot, registeredQuality)`. İlk üçü aynı, son ikisi farklı → ayrı BB + V-212 UYARI.
- **K85 (yeni) — Çok parçalı BB yazımı:** Ortak alanlar `IndependentSection`'da, parçaya ait alanlar `SectionPart`'ta. Kullanım: ana parça 1001/1002, diğerleri 1003/1004/1006/1005. Profil `secondaryPartAreas: 'repeat' | 'minusOne'` (varsayılan `repeat`).
- **K86 (yeni) — Tarih alanı:** `architecturalProjectConfirmationDate` zorunlu kullanıcı girdisi; yer tutucu yazılmaz. İçe alınan dosyada `2000-01-01` veya `1900-01-01` görülürse BİLGİ ("yer tutucu tarih olabilir").
- **K65 (kesin):** `roofProjectionArea` = Roof poligonlarının XY izdüşüm birleşimi (saçak dahil). İçe alınan dosyada ≤ %5 fark BİLGİ.
- **K37 (rev):** 2.5B prizma yönteminde taban, tavan düzlemlerinin XY izdüşümleriyle **her zaman** kesilir.
- **K60 (rev):** Kod listeleri profil paketinde gömülü; URL'den güncelleme isteğe bağlı.
- **V-212 (yeni):** Aynı BB numarası farklı nitelik/pay ile → UYARI.
- **V-198b (rev):** Yalnız propertyLot / registeredQuality / MAKS farkı UYARI; net/brüt farkı ve −1 BİLGİ.

---

## I.6 8. Tur İçin Açık İşler

1. 18 gerçek kabul dosyasında **Kat Biçimi (A/B)** ve **N11 (LoD2 ↔ oda açıklıkları)** ölçümü (H7-9). Bunun için dosyaların yerel kopyası gerekir; kullanıcının açık indirme izni ister.
2. **Ret almış doğrulama kodları** (hâlâ en büyük kanıt boşluğu).
3. **Başka üreticiler** (GMLCity, LiCity, Yapınet) kabul kodları.
4. ChatGPT 7 ve Grok 7 dosyaları gelirse denetim.
5. Ornek1'deki "41" çakışmasının liste beyanda nasıl göründüğü (aynı BB no ile iki kayıt mı, yoksa depo eklenti mi?): `registeredInstallation = 'DEPO'` olan kayıtla ilişkisi `[DOĞRULANMALI]`.

---

# BÖLÜM II — 7. TUR HAZIRLIK VERİSİ (00:47)

> **Bu bölüm 7. turun hazırlık belgesidir.** Kaynağı, kullanıcının verdiği 6 TKGM doğrulama kodunun **resmi doğrulama sistemindeki gerçek sonuçlarıdır** (3dbinadogrula.tkgm.gov.tr). Bu tura kadar elimizdeki kanıtlar TKGM'nin 6 örnek dosyası, 2 eski kabul dosyası ve 1 ret dosyasıydı. Bu belgeyle ilk kez **güncel kurallarla Ekim 2026'da kabul edilmiş 18 gerçek bina GML'i** ölçüldü.
> **Diğer AI'lara (Gemini, DeepSeek, ChatGPT, Grok):** Bu belgedeki `[TKGM-KABUL-2026]` etiketli bulgular, bu ana kadarki **en güçlü kanıt sınıfıdır**. Önceki turlardaki bir varsayım bununla çelişiyorsa bu belge geçerlidir. (Tek istisna: örneklem tek bir büro ve tek bir yazılımdan geliyor; bkz. §1.3.)

**Etiketler:** `[TKGM-KABUL-2026]` = 18 gerçek kabul dosyasında ölçüldü · `[TKGM-SUNUCU]` = doğrulama sunucusunun JSON yanıtında görüldü · `[ÖLÇÜLDÜ-6]` = CLAUDE6 ölçümleri (Ornek1–6, Amasya, Sincan, ret dosyası) · `[DÜZELTME]` = önceki bir hükmün düzeltilmesi · `[ÖNERİ]` · `[DOĞRULANMALI]`

---

## İÇİNDEKİLER

0. Yönetici Özeti — 14 Yeni Kesin Bulgu
1. Veri Seti, Yöntem, Gizlilik ve Sınırlar
2. Sunucu Sonuçları: Kontrol Durumu, Uyarı Mesajları, Bağımsız Bölüm Listeleri
3. GML Ölçümleri (18 dosya, 4.021 açıklık deliği)
4. Önceki Turlardaki Hükümlerin Bu Kanıtla Yeniden Değerlendirilmesi
5. Şartname v3.4 Değişiklik Önerileri
6. Doğrulayıcı (V-kuralları) Ciddiyet Güncellemesi
7. Uygulama Özelliklerine Etkisi (Yeni Özellikler ve Değişen Akışlar)
8. TKGM Doğrulama Sunucusu Yanıt Şeması (F2 İçe Aktarıcı Tasarımı İçin)
9. 7. Tur Gündemi — Her AI'dan Beklenen
10. Kullanıcıdan İstenen Ek Veri (Kanıt Boşluklarını Kapatmak İçin)
Ek-A. Ham Sonuç Tabloları
Ek-B. Ölçüm Betiklerinin Mantığı (Tekrarlanabilirlik)

---

## 0. Yönetici Özeti — 14 Yeni Kesin Bulgu

| # | Bulgu | Kanıt | Önceki durum → Yeni karar |
|---|---|---|---|
| R7-01 | **GroundSurface 18/18 dosyada var** (`gml:name = "Zemin"`) ve hepsi kabul edilmiş. | `[TKGM-KABUL-2026]` | CLAUDE6'daki en ciddi açık soru (AS-1, H13) **pratikte kapandı**: GroundSurface yazmak **kabul görüyor**. Kılavuz'daki "Mimari binada GroundSurface bulunamaz / alınmayacak" satırları bugünkü doğrulayıcı davranışını yansıtmıyor. K78 varsayılanı `include` **kesinleşti**. (`omit` hâlâ belirsiz, ama artık önemli değil.) |
| R7-02 | **Kapı nesnesi geometrisi ile duvardaki kapı deliği farklı kotlarda olabiliyor:** kapı nesnesi (`bldg:Door`) oda tabanından başlıyor (0 mm, 870/870), duvar poligonundaki delik (`gml:interior`) **+50 mm**'den başlıyor (885/885). | `[TKGM-KABUL-2026]` | `[DÜZELTME]` CLAUDE6 H2'deki "0 mm yasak" hükmü yalnız **delik halkası** için geçerli. Kapı nesnesinin kendi geometrisi tabana inebilir. K46b'deki "tüm temsiller birebir aynı z aralığı" kuralı **üretim tercihimiz** olarak kalır, ama **doğrulama kuralı olamaz**. |
| R7-03 | **4.021 açıklık deliğinin hiçbiri duvar poligonunun kenarına değmiyor** (alt 0, üst 0, yan 0). En küçük yan boşluk 31,4 mm. | `[TKGM-KABUL-2026]` | K45a (delik dış halkaya değmez) **6. kez doğrulandı**. |
| R7-04 | **Koordinatlar `gml:pos` ile yazılmış (posList yok) ve Y/X 10 ondalık hane taşıyor** (Z 2 hane). 18/18 kabul. | `[TKGM-KABUL-2026]` | "Koordinatlar 3 haneli olmalı" kuralı doğrulayıcıda **uygulanmıyor** (Ornek2'deki 8–12 hane bulgusunu güçlendiriyor). AS-4 kapandı: fazla hane **ret sebebi değil**. "3 haneye normalize et" **isteğe bağlı** bir komut olmalı, zorunlu değil. |
| R7-05 | **`propertyLot` boşluklu (`"3712 / 97787"`) ve sonda boşluklu (`"3712 / 97787 "`) yazılmış, kabul edilmiş** (bir parselde 33 BB'nin 28'i). | `[TKGM-KABUL-2026]` | K75: doğrulama tarafında ayrıştırma **boşluğa toleranslı** olmalı. Üretimde boşluksuz yazmaya devam ediyoruz (temiz biçim), ama boşluklu dosyayı içe alırken **hata vermiyoruz**. |
| R7-06 | **`registeredQuality` sonda boşlukla (`"DUBLEKS MESKEN "`) kabul edilmiş.** | `[TKGM-KABUL-2026]` | Sunucu boşluk temizliği kontrolü yapmıyor. Biz üretimde temizleriz; içe alınan dosyada BİLGİ. |
| R7-07 | **Çok bloklu parselde, parseldeki TÜM blokların arsa payı toplamı da 1 değil ve kabul edilmiş:** 4 bloklu parsel (35 BB) → 103500/104683 (≈ 0,9887); 10 bloklu parsel (33 BB) → 97780/97787. | `[TKGM-KABUL-2026]` | CLAUDE6 H8'i aşıyor: toplam ≠ 1, **parsel düzeyinde bile** ret sebebi değil. V-198 her durumda **BİLGİ** (en fazla UYARI); asla HATA değil. |
| R7-08 | **MAKS tutarsızlıkları dosyayı reddetmiyor; yalnız "Warning" üretiyor.** Görülen uyarılar: MAKS BB kimlik no eşleşmiyor; GML kat no ↔ MAKS kat no farklı (GML −1, MAKS Z/B); GML BB no ↔ MAKS BB no farklı (MAKS boş); BB'lerin MAKS kimlikleri "yeterli oranda" eşleşmiyor; MAKS'taki bazı BB'ler GML'de yok. Hepsi **CheckSuccessfull**. | `[TKGM-SUNUCU]` | MAKS kontrolleri `T` kapsamlı ve **sunucuda uyarı düzeyinde**. Bizde: DIŞ_KONTROL_GEREKLİ + yerel makullük uyarıları (R7-09). |
| R7-09 | **Bir BB'nin MAKS kimlik no alanına arsa payı yazılmış** (`6900209366` = "6900/209366" bitişik) ve dosya yine kabul edilmiş (yalnız uyarı). Başka bir dosyada BB alanına **9 haneli bina** MAKS no yazılmış (BB MAKS no'ları 10 hane). | `[TKGM-SUNUCU]` | Kullanıcı hatası **sunucudan kabul alıyor** → iş TAKBİS/MAKS tarafında sonradan sorun çıkarabilir. Uygulamamız bu hatayı **yerelde yakalamalı** (V-206, V-207). Bu, rakiplere karşı somut bir değer. |
| R7-10 | **Sunucu "Balkony bulunamadı." uyarısı veriyor** (nesne: CityModel), dosya yine kabul. Mesaj metni sunucuda yazım hatalı. | `[TKGM-SUNUCU]` | Hata kataloğuna (C6-09) **birebir** (yazım hatası dahil) eklenmeli; F2 içe aktarıcı bu kalıbı tanımalı. |
| R7-11 | **Kapı yüksekliği bu üreticide 210 cm** (baskın), az sayıda 230 ve 240 cm. Pencereler: denizlik 5/60/90/170/180 cm; yükseklik 230/140/60/50 cm; tavan boşluğu 33–68 cm. | `[TKGM-KABUL-2026]` | N12'yi doğruluyor: değerler **projeye ve üreticiye** özgü. Açıklık tipi kütüphanesi (C6-01) gerekli. |
| R7-12 | **CRLF satır sonu, BOM yok, `encoding="utf-8"`** (küçük harf) 18/18. | `[TKGM-KABUL-2026]` | Şartnamedeki biçim kuralı (UTF-8 BOM'suz, CRLF) **doğrulandı**. |
| R7-13 | **Sunucu `architecturalProjectConfirmationDate` için `0001-01-01` döndürüyor** (18/18), yani tarihi ya okumuyor ya eşlemiyor; dosyalar kabul. | `[TKGM-SUNUCU]` | Tarihe bağlı kurallar (ör. 2019 sonrası brüt/net zorunluluğu, V-197) sunucuda bu ekranda görünmüyor. Bizde kalır ama **[DOĞRULANMALI]** etiketiyle. |
| R7-14 | **Sunucunun BB listesinde `registeredFloorDefinition` (ZEMİN, KAT 1, KAT 2, BODRUM), `independentSectionStoreyNumber` (`Kat_Z`, `Kat_1`, `Kat_-1`) ve `balconyCount` (modelden sayılmış) alanları var.** | `[TKGM-SUNUCU]` | Liste beyan karşılaştırması (V-197) bu alanlarla yapılmalı: kat tanımı metni (ZEMİN/KAT n/BODRUM) liste beyandaki kat tanımıyla aynı mı. |

**Sonuç:** CLAUDE6'nın açık bıraktığı 9 sorudan 3'ü (AS-1 GroundSurface, AS-3 arsa payı toplamı, AS-4 ondalık hane) gerçek kabul verisiyle **kapandı**. Bir hüküm (H2'deki "0 mm yasak") **daraltıldı**: yasak yalnız delik halkaları için geçerli.

---

## 1. Veri Seti, Yöntem, Gizlilik ve Sınırlar

### 1.1 Veri seti

| Doğrulama kodu | Durum | Blok (GML) sayısı | BB sayısı | Not |
|---|---|---|---|---|
| FUA5P9 | CheckSuccessfull | 4 (A, B, C, D) | 35 | Aynı parselde 4 blok; bodrumda işyeri/dükkân |
| 899AK3 | CheckSuccessfull | 1 | 4 | Dubleks mesken; "Balkony bulunamadı" uyarısı |
| GCZ6NB | CheckSuccessfull | 10 (A–J) | 33 | Villa sitesi; propertyLot boşluklu yazım |
| AFRMPJ | CheckSuccessfull | 1 | 2 | Dubleks |
| 662P0J | CheckSuccessfull | 1 | 2 | Dubleks |
| 2FRDAC | CheckSuccessfull | 1 | 2 | MAKS kimlik uyuşmazlığı uyarıları |
| **Toplam** | **6/6 kabul** | **18 GML** | **78 BB** | |

Kullanıcı mesajında ayrıca "FYA5P9" kodu geçiyor. Bu kod sunucuda **sonuç döndürmedi** (HTTP 500). Bağlantıdaki ve listedeki kod FUA5P9 olduğu için bunu yazım hatası kabul ettim ve FUA5P9'u inceledim.

### 1.2 Yöntem

- Doğrulama sonuç sayfası, kullanıcının verdiği bağlantıyla tarayıcıda açıldı. Chrome'un otomatik çevirisi sayfayı İngilizce sanıp Türkçeye "çeviriyor" ve metni bozuyordu (örneğin "İlçe Ad" → "İlçe Reklamı"). Bu yüzden veri, **sayfanın kendisinin kullandığı** servis çağrılarından çevrilmemiş JSON olarak okundu:
  - `POST https://3dbinadogrulaservis.tkgm.gov.tr/api/ArchitecturalBuilding/GetArchitecturalBuildingControlDetail` gövde `{"validationCode": "..."}` → sonuç JSON'u
  - `POST .../api/ArchitecturalBuilding/DownloadArchitecturalBuildingCityGml` gövde `{"architecturalBuildingId": "<id>"}` → GML metni (sayfadaki "City GML Dosyası İndir" ve 3B görüntüleyicinin kullandığı çağrı)
- GML'ler **tarayıcı belleğinde** DOMParser ile ayrıştırıldı ve ölçüldü. **Diske hiçbir dosya indirilmedi veya kaydedilmedi.** İstek sayısı: kod başına 1 sonuç isteği, GML başına 2–3 okuma (toplam ~60 istek), elle tetiklenmiş, toplu tarama değil.
- Ölçüm mantığı CLAUDE6'daki C# prob'unun (N12, N13) JavaScript karşılığı. Ek olarak "delik halkası ↔ kapı nesnesi" karşılaştırması yapıldı (Ek-B).

### 1.3 Gizlilik

Sunucunun sonuç JSON'unda **gönderen kişinin adı, T.C. kimlik numarası, cep telefonu ve e-postası** açıkça dönüyor (`sender` nesnesi). Bu veriler okunduğu anda bellekten silindi. Bu belgede, ölçüm çıktılarında veya başka bir yerde **yer almıyor**. Ada/parsel numaraları ve MAKS kimlik numaraları da belgeye alınmadı (yalnız il/ilçe düzeyi).

> **Uygulama tasarımı için ders:** F2 içe aktarıcısı bir gün sonuç JSON'unu alırsa (kullanıcı yapıştırırsa veya kullanıcının açık isteğiyle çekilirse), `sender` alanını **ayrıştırmadan önce atmalı**, proje dosyasına asla yazmamalı. Bu kural KVKK açısından zorunlu. (§7, C7-05)

### 1.4 Sınırlar — örneklem yanlılığı (önemli)

- 6 kodun hepsi **aynı harita bürosundan**, aynı ilçeden (Çanakkale/Biga), aynı projeksiyon diliminden (EPSG:5253), büyük olasılıkla **aynı GML üretim yazılımından** geliyor. Hepsinde aynı imza var: `gml:pos`, 10 ondalık, delik +50 mm, kapı nesnesi 0 mm, GroundSurface adı "Zemin".
- Yani bu veri "doğrulayıcı **neyi kabul ediyor**" sorusuna güçlü cevap veriyor. "Doğrulayıcı **neyi reddediyor**" sorusuna cevap vermiyor; ret almış kod yok.
- Bütün binalar 1–4 katlı konut veya karma kullanım. Yüksek bina, eğik tavanlı çatı arası ve teras yok.
- **7. turda en değerli ek veri: başka üreticilerden kodlar ve özellikle RET almış kodlar** (§10).

---

## 2. Sunucu Sonuçları

### 2.1 Kontrol durumu

18/18 GML `controlState = "CheckSuccessfull"`. Hata (`Error`) düzeyinde hiçbir kayıt yok. Tüm kayıtlar `controlResult = "Warning"`, `logType = 1`, `errorCode = null`.

### 2.2 Uyarı mesajları (birebir metin, hata kataloğu için)

| Nesne (`objectId`) | Mesaj kalıbı (birebir) | Görüldüğü yer |
|---|---|---|
| MAKS | `Makstaki bağımsız bölümlerle eşleşmeyen bir Gml maks id bulundu. (Maks IDs : {liste})` | FUA5P9-B, GCZ6NB-J, 2FRDAC |
| MAKS | `Gmldeki StoreyNumber değeri ile Makstaki KatNo değeri eşit olmalıdır. (Gml : {gml}, Maks : {maks})` | FUA5P9-C (−1/Z), FUA5P9-D (−1/B ×2) |
| MAKS | `Gmldeki IndependentSectionNumber değeri ile Makstaki BagimsizBolumNo değeri eşit olmalıdır. (Gml : {n}, Maks : {m})` | GCZ6NB, AFRMPJ, 662P0J (MAKS tarafı boş) |
| MAKS | `GML de bulunan bağımsız bölümlere ait Maks kimlik numaraları Maks ile yeterli oranda eşleşmemektedir.` | GCZ6NB-D, 2FRDAC |
| MAKS | `MAKS'ta bulunan bazı bağımsız bölümler GML verisinde yer almıyor(Eşleşmeyen MaksKimlikNo : {liste})` | 2FRDAC |
| CityModel | `Balkony bulunamadı.` | 899AK3 |

**Yorumlar:**
1. "Kat no" uyarısında GML tarafı `storeyNumber = -1`, MAKS tarafı `Z` veya `B`. Yani MAKS bodrumu "B" ya da yanlışlıkla "Z" olarak tutuyor, GML ise sayısal −1 kullanıyor. Sunucu bunu uyarı olarak geçiriyor. Uygulamamız kat no eşleme tablosu tutmalı (−1 ↔ B/BODRUM, 0 ↔ Z/ZEMİN, n ↔ n). MAKS verisi kullanıcıdan gelirse bu eşlemeyle karşılaştırılmalı.
2. "Maks : " (boş) görülen BB no uyarıları, MAKS'ta BB numarasının hiç girilmediğini gösteriyor. Bu bizim kontrol edebileceğimiz bir şey değil (`T` kapsamı). Kullanıcıya "MAKS kaydı eksik olabilir, belediye/MAKS tarafında tamamlatın" bilgisi verilir.
3. "Balkony bulunamadı." uyarısının hangi koşulda çıktığı kesin değil `[DOĞRULANMALI]`. 899AK3'te 4 BB'nin hepsinde `balconyCount = 0`. Ama diğer kodlarda da balkonsuz BB'ler var ve orada bu uyarı çıkmamış (FUA5P9'da balkonsuz BB'ler var, uyarı yok). Muhtemelen **binada hiç balkon nesnesi (BLKN_) yoksa** çıkan bina düzeyi bir uyarı.

### 2.3 Bağımsız bölüm listesi alanları (sunucunun ürettiği özet)

`independentSectionNumber`, `independentSectionStoreyNumber` (`Kat_Z`, `Kat_1`, `Kat_2`, `Kat_-1`), `independentSectionUsage` (1001, 1002), `independentSectionPlannetArea` (sic), `independentSectionPlanGrossArea`, `blockName` (`A`…`J` veya `-1`), `entrance` (78/78 boş), `balconyCount` (0–2), `maksBagimsizBolumKimlikNo`, `propertyLot`, `registeredQuality`, `registeredInstallation` (78/78 `-`), `registeredFloorDefinition` (ZEMİN / KAT 1 / KAT 2 / BODRUM).

**Ekranda görünen "Yapı Bilgileri":** Kat Adedi, BB Adedi, Zemin Altı Kat Adedi, Zemin + Üst Kat Adedi, Bina Tipi (Ana Yapı), Asansör Sayısı, MAKS Kimlik ID, Tapu Bina ID (`<TaşınmazKimlik>-<Blok>`).
**"Parsel Bilgileri":** İl, İlçe, Mahalle, Mahalle Ref, Ada, Parsel, Taşınmaz Kimlik No (sunucu TAKBİS'ten dolduruyor; `tapuParsel` nesnesinde ayrıca `kadastroBirimRef/Ad`, `tapuParselRef`, `tapuZeminRef`).

> **Uygulama için:** Bu "Yapı Bilgileri + BB Listesi" ekranı, kullanıcının TKGM'de göreceği **özetin birebir aynısı**. Uygulamamız gönderim öncesi **aynı düzende bir "TKGM Sonuç Önizlemesi"** üretmeli (C7-01). Kullanıcı, yüklemeden önce TKGM ekranında ne göreceğini görür. Sunucunun hesapladığı alanları (balconyCount, kat tanımı vb.) biz de aynı yöntemle hesaplarız.

---

## 3. GML Ölçümleri (18 dosya)

### 3.1 Dosya biçimi

| Özellik | Sonuç | Oran |
|---|---|---|
| XML başlığı | `<?xml version="1.0" encoding="utf-8"?>` | 18/18 |
| BOM | Yok | 18/18 |
| Satır sonu | CRLF | 18/18 |
| Koordinat elemanı | `gml:pos` (posList 0) | 18/18 |
| Ondalık hane (Y, X / Z) | 10 / 2 | 18/18 |
| srsName | EPSG:5253 | 18/18 |
| Dosya boyutu | 1,0–5,0 MB | — |
| `bldg:GroundSurface` | 1 adet, `gml:name = "Zemin"` | 18/18 |
| `lod2Solid` / `measuredHeight` | 0 / 0 | 18/18 |
| `additionalNote` | "-" | 18/18 (%100) |
| `entrance` | "" (boş) | 78/78 BB |
| `registeredInstallation` | "-" | 78/78 BB |

**Önemli:** `gml:pos` ile her nokta ayrı eleman olarak yazılıyor. Bu yazım `posList`'ten yaklaşık %40 büyük dosya üretir ama kabul görüyor. Kendi üretimimizde TKGM örnekleriyle aynı biçim olan `posList`'i koruyoruz. Okuyucumuz ise **her ikisini** okumalı. Bu turda kendi analiz betiğim `pos` kullanan dosyada ilk denemede çöktü; aynı hata uygulamada da yapılabilir.

### 3.2 Açıklık deliği ↔ duvar poligonu (K45a)

| Ölçüt | Değer |
|---|---|
| İçinde delik olan dikey poligon deliği | 4.021 |
| Alt kenara temas | **0** |
| Üst kenara temas | **0** |
| Yan kenara temas | **0** |
| En küçük yan boşluk | 31,4 mm |
| Kapı deliklerinin alt kenarı − duvar alt kenarı | **+50 mm** (885/885) |
| Kapı deliklerinin üst kenarı − duvar üst kenarı | −580 mm (çoğunluk), −380 / −680 / −880 / −1250 / −2300 mm |

### 3.3 Kapı nesnesi ↔ delik (YENİ: N20)

| Ölçüt | Değer |
|---|---|
| Kapı nesnesi (`bldg:Door`) alt kotu − duvar alt kotu | **0 mm** (870/870) |
| Aynı duvardaki delik alt kotu − duvar alt kotu | **+50 mm** |
| Oda zemini − duvar alt kotu | 0 mm (oda duvarları zeminden başlıyor) |

**Yorum (harita mühendisi + yazılım mühendisi):** Bu üretici, kapıyı fiziksel olarak tabandan başlatıyor (gerçeğe uygun). Ama duvarda açtığı deliği 5 cm yukarı alıyor ki delik halkası dış halkaya değmesin. Doğrulayıcı iki geometrinin birebir aynı olmasını **istemiyor**. Yalnız deliğin dış halkaya değmemesine bakıyor (veya geometrileri hiç karşılaştırmıyor).

TKGM'nin 6 örneğinde ise kapı nesnesi ile delik aynı kottaydı (+10 veya +50 mm). İki yaklaşım da kabul görüyor.

**Karar:**
- Üretimde **kapı nesnesi = delik** (TKGM örnekleri gibi) yaklaşımını koruyoruz. Tek kaynaktan türetilir, daha az hata yüzeyi verir.
- Doğrulayıcımız kapı nesnesi ile delik arasındaki kot farkını **BİLGİ** olarak gösterir, asla HATA vermez.
- K70 (düzeltme modu) bu farkı **aynen korur**.

### 3.4 Kapı ve pencere ölçüleri (oda zeminine göre)

| | Dağılım (18 dosya toplamı, yaklaşık) |
|---|---|
| Kapı üstü | 210 cm (≈ %92), 230 cm (≈ %7), 240 cm (1) |
| Kapı nesnesi altı | 0 mm (%100) |
| Pencere denizlik | 5, 60, 90, 120, 170, 180 cm |
| Pencere yüksekliği | 230 (kapı-pencere / balkon kapısı), 140, 170, 60, 50, 300 cm |
| Pencere üst → tavan | 33, 38, 43, 48, 52–68 cm |

5 cm denizlik + 230 cm yükseklik tipi büyük olasılıkla balkon kapısı (`windowUsage` ile pencere olarak modellenmiş) `[DOĞRULANMALI]`. 170 cm denizlik + 60 cm yükseklik tipi ıslak hacim penceresi.

### 3.5 Öznitelik değerleri (dikkat çekenler)

- `propertyLot`: `"6900/209366"`, `"3/10"`, `"1/2"`, `"191/333"`, `"3712 / 97787"`, `"3712 / 97787 "` (sonda boşluk), `"7366/97787"`.
- `registeredQuality`: `MESKEN`, `DUBLEKS MESKEN`, `"DUBLEKS MESKEN "` (sonda boşluk), `İŞYERİ`, `DÜKKAN`. Tamamı Türkçe büyük harf (N18'i doğruluyor).
- `blockName`: blok harfi veya `-1` (tek bloklu parsel). Aynı parselde 10 blokluk sitede I bloğu `-1` yazılmış, ama diğer 9 blok harfli. Bu tutarsızlık kabul görmüş. Uygulamamız: aynı parselde birden çok GML varsa `-1` için **UYARI** ("diğer bloklar harfli, bu blok -1") `[ÖNERİ]`.

### 3.6 Arsa payı (BigInt, BB kimliğine göre tekilleştirilmiş)

| Kod | Bloklar | Blok toplamları (payda ortak) | Parsel toplamı | Durum |
|---|---|---|---|---|
| FUA5P9 | 4 | A 26450, B 26450, C 31050, D 19550 (/104683) | **103500/104683** (eksik 1183/104683) | Kabul |
| GCZ6NB | 10 | A, B, C, G, H 7413 · D 7366 · E, F 7373 · I 20402 · J 18201 (/97787) | **97780/97787** (eksik 7/97787) | Kabul |
| 899AK3 | 1 | 1/1 | 1/1 | Kabul |
| AFRMPJ, 662P0J, 2FRDAC | 1 | 1/1 | 1/1 | Kabul |

Not: FUA5P9 paydası 209366, toplam 207000/209366 = 103500/104683 olarak sadeleşiyor.

---

## 4. Önceki Hükümlerin Yeniden Değerlendirilmesi

| Önceki hüküm | Kaynak | Yeni durum |
|---|---|---|
| H13 / AS-1: GroundSurface kılavuzla çelişiyor, profil anahtarı + A/B test | CLAUDE6 | **KAPANDI → `include`**. 6 TKGM örneği + 18 gerçek kabul (2026). A/B testi artık gerekmiyor. Kılavuz satırları "eski/hatalı metin" listesine alınır. |
| H2: kapı alt boşluğu {10, 50} mm, 0 yasak | CLAUDE6 | **DARALTILDI**: {10, 50} mm ve "0 yasak" kuralı **delik halkası** için geçerli. Kapı nesnesi geometrisi 0 mm olabilir. Delik için ölçülen değerler artık üç kaynakta: TKGM örnekleri +10 / +50, gerçek dosyalar +50. |
| H10: 1–10 mm delik-kenar = BİLGİ | CLAUDE6 | Değişmedi. Gerçek dosyalarda en küçük 31 mm, yani bu üretici güvenli marj kullanıyor. Bizim üretim hedefimiz (≥ 10 mm) doğru. |
| H8: arsa payı ≠ 1 BİLGİ, parsel düzeyinde UYARI | CLAUDE6 | **GÜÇLENDİ**: parsel düzeyinde de ≠ 1 kabul görüyor → her durumda BİLGİ (kullanıcı isterse UYARI'ya çekebilir). |
| AS-4: 4+ ondalık hane ret mi? | CLAUDE6 | **KAPANDI → ret değil** (10 hane kabul). |
| AS-3: tek blokta toplam ≠ 1 | CLAUDE6 | Kısmen kapandı. Çok blokta kabul görüyor; tek blokta veri yok, ama ret beklenmiyor. |
| K75 "boşluksuz pay/payda" | CLAUDE6 | Üretim: boşluksuz. Doğrulama: `^\s*\d+\s*/\s*\d+\s*$` (boşluk toleranslı). |
| V-064 registeredQuality büyük harf HATA | CLAUDE6 | Korunur (78/78 büyük harf). Ek: **sondaki boşluk** HATA değil, BİLGİ. |
| H12: GroundSurface 6/9 | CLAUDE6 | Artık **24/27** (TKGM 6/6 + gerçek kabul 18/18; yalnız eski rejim 2 dosya ve ret dosyası hariç). |
| N12: kapı yüksekliği projeye özgü | CLAUDE6 | Doğrulandı. Bu üretici 210 cm kullanıyor. |
| K46b temsil birliği "kural" | Gemini v6 / CLAUDE6 | **Üretim tercihi** olarak kalır, doğrulama kuralı olamaz (R7-02). |
| N11: LoD2 ↔ oda açıklıkları aynı | 5. tur | Bu 18 dosyada ölçülmedi `[7. tur açık iş]`. |

---

## 5. Şartname v3.4 Değişiklik Önerileri

**K45 (rev3) — Kapı.**
- **Delik halkası:** `zHoleBottom = zFloorTop + doorSillOffset`, `doorSillOffset ∈ {10, 50}` mm (varsayılan 10; "Gerçek dosya uyumlu" stil profilinde 50). `zHoleTop = zFloorTop + doorHeight`. Delik dış halkaya değmez (K45a).
- **Kapı nesnesi geometrisi:** varsayılan olarak delikle **aynı** (K46b). Profil seçeneği `doorObjectStartsAtFloor: true` ile kapı nesnesi zFloorTop'tan başlatılabilir (gerçek dosyalardaki stil).
- Kaynak: `[ÖLÇÜLDÜ-6 N12]`, `[TKGM-KABUL-2026 N20]`.

**K46b (rev) — Temsil birliği.** "Üretim kuralı; doğrulama kuralı değildir. İçe alınan dosyada kapı nesnesi ↔ delik kot farkı BİLGİ olarak raporlanır."

**K70 (ek) — Düzeltme modunda korunanlar:** koordinat metni, `pos` ↔ `posList` tercihi, ondalık hane sayısı, kapı nesnesi ↔ delik farkı, GroundSurface varlığı.

**K75 (rev) — propertyLot.** Üretimde `pay/payda` (boşluksuz). Doğrulamada ayrıştırma boşluk toleranslı. Biçim ihlali (pay > payda, payda 0, boş, birden çok) **HATA** olarak kalır (Kılavuz).

**K78 (kesin) — GroundSurface:** `include` (varsayılan ve önerilen). Tek GroundSurface, `gml:name = "Zemin"`, poligon kimliği `Ground_<uuid>`, z = en alt kat döşeme alt kotu (Ornek6: zFloorTop − döşeme).

**K81 (yeni) — Koordinat yazımı:** Üretim `posList` + 3 ondalık (örneklerle uyumlu, küçük dosya). Okuma: `pos` ve `posList`, istenen sayıda ondalık. "3 haneye normalize et" zorunlu değil; isteğe bağlı, temas koruyuculu (C6-11).

**K82 (yeni) — Kat no ↔ kat tanımı eşlemesi:** storeyNumber −n ↔ "BODRUM" (n>1 ise "n. BODRUM" `[DOĞRULANMALI]`), 0 ↔ "ZEMİN", n ↔ "KAT n"; GML Kat adı `Kat_Z`, `Kat_1`, `Kat_-1`. `registeredFloorDefinition` liste beyandan gelir ve bu tabloyla tutarlılığı UYARI düzeyinde kontrol edilir.

**K83 (yeni) — Gizlilik:** TKGM sonuç verisinden (`sender`) veya herhangi bir dış kaynaktan gelen kişisel veriler (T.C. no, telefon, e-posta, ad) proje dosyasına, günlüğe veya telemetriye yazılmaz.

---

## 6. Doğrulayıcı (V-kuralları) Ciddiyet Güncellemesi

| Kural | CLAUDE6 | 7. tur | Gerekçe |
|---|---|---|---|
| V-042a delik temas | HATA | HATA | R7-03 (0/4.021) |
| V-198 arsa payı toplamı | BİLGİ / UYARI | **BİLGİ** (parsel düzeyinde de) | R7-07 |
| V-198a propertyLot biçimi | HATA | HATA (boşluk toleranslı ayrıştırma) | R7-05 |
| V-200 GroundSurface ↔ profil | DOĞRULANAMADI | **KALDIRILDI** (`include` kesin); GroundSurface **yoksa** BİLGİ ("TKGM örnekleri ve güncel kabul dosyaları GroundSurface içerir") | R7-01 |
| V-064 registeredQuality büyük harf | HATA | HATA; sondaki boşluk BİLGİ | R7-06 |
| V-204 kapı alt boşluğu karışık | BİLGİ | BİLGİ; ayrıca kapı nesnesi ↔ delik farkı BİLGİ (V-208) | R7-02 |
| **V-206 (yeni)** BB MAKS kimlik no 10 hane değil | — | **UYARI** ("bina MAKS no'su BB alanına yazılmış olabilir") | R7-09 |
| **V-207 (yeni)** BB MAKS kimlik no'su arsa payının pay ve paydası bitişik yazılmış hali | — | **UYARI** ("arsa payı MAKS alanına yazılmış olabilir") | R7-09 |
| **V-208 (yeni)** kapı nesnesi ↔ delik z farkı | — | BİLGİ | R7-02 |
| **V-209 (yeni)** aynı parselde bazı bloklar harfli, biri `-1` | — | UYARI | §3.5 |
| **V-210 (yeni)** binada hiç balkon/teras nesnesi yok | — | BİLGİ (TKGM "Balkony bulunamadı." uyarısını önceden gösterir) | R7-10 |
| **V-211 (yeni)** MAKS verisi kullanıcıdan girildiyse kat no ↔ MAKS kat no / BB no karşılaştırması | — | UYARI (`K` kapsamı) | R7-08 |
| V-ondalık (3 hane) | (eski) | BİLGİ | R7-04 |

---

## 7. Uygulama Özelliklerine Etkisi

**C7-01 — "TKGM Sonuç Önizlemesi" ekranı.** Sunucunun sonuç sayfasının birebir düzeni: Parsel Bilgileri, Yapı Bilgileri, BB Listesi (MAKS no, blok, giriş, kat, BB no, net, brüt, arsa payı, nitelik, eklenti) ve olası uyarılar. Kullanıcı GML'i yüklemeden önce TKGM'nin ne göstereceğini görür. Böylece "TKGM'de ekranı açınca sürprizle karşılaşma" sorunu ortadan kalkar.

**C7-02 — MAKS makullük denetçisi.** V-206 ve V-207'nin arayüzü. Hatalı alan kırmızı çerçeveyle gösterilir, "Bu değer arsa payınıza benziyor (6900/209366)" açıklaması çıkar. Gerçek dosyada bu hata **kabul almıştı**. Uygulamamız bunu yakalayarak tapu tarafında çıkabilecek sorunun önüne geçer.

**C7-03 — Stil profilleri (somut).**
- `TKGM-Örnek` (varsayılan): posList, 3 hane, delik = kapı nesnesi, alt boşluk 10 mm.
- `Gerçek-Kabul-2026`: alt boşluk 50 mm, kapı nesnesi zeminden başlar. (pos ve 10 hane **seçilmez**; bunlar yalnız okumada desteklenir, üretimde gereksiz.)

Kullanıcı bürosunun eski kabul dosyasını içe alırsa uygulama doğru profili otomatik önerir (C6-08 "örnekten öğren").

**C7-04 — Hata/uyarı kataloğu genişletmesi.** §2.2'deki 6 kalıp, `{gml}`, `{maks}`, `{liste}` yer tutucularıyla regex olarak profil paketine eklenir. Her kalıp için "Ne demek / Ret sebebi mi (hayır, uyarı) / Ne yapmalı" metni yazılır.

**C7-05 — Sonuç içe aktarıcı (F2) güncellemesi.**
- v1: kullanıcı sonuç sayfasındaki tabloyu veya PDF raporunu yapıştırır/yükler, uygulama ayrıştırır.
- v1.1 `[ÖNERİ]` `[DOĞRULANMALI — hukuki/kullanım koşulları]`: Kullanıcı kendi doğrulama kodunu girip **açıkça "Sonucu getir" tıklarsa**, uygulama sayfanın kullandığı tek isteği yapar (toplu tarama yok, arka planda çalışma yok). `sender` alanı ayrıştırmadan önce atılır (K83).
- Bu, önceki turlarda koyduğumuz "TKGM sistemlerine otomatik erişim yok" ilkesinin **gevşetilmesi** anlamına geliyor. Bu yüzden karar kullanıcıya ve hukuki değerlendirmeye bırakılmalı. Varsayılan kapalı olmalı.

**C7-06 — Okuyucu sağlamlığı.** `gml:pos` ve `gml:posList` birlikte; 10+ ondalık; 1–5 MB dosyalar. Bu turda tarayıcıda 5 MB'lık dosyayı DOMParser ile iki kez ayrıştırmak 45 saniyelik zaman aşımına takıldı. Bu, **akış tabanlı (saxes) okuyucu ve Web Worker kararını** somut olarak doğruluyor. Hedef: 5 MB dosya < 2 sn, arayüz donmadan.

---

## 8. TKGM Doğrulama Sunucusu Yanıt Şeması (F2 için referans)

```
GetArchitecturalBuildingControlDetail → {
  validationCodeNumber: "XXXXXX",
  sender: {…KİŞİSEL VERİ — ATILACAK…},
  controlState: "CheckSuccessfull" | (diğer durumlar [DOĞRULANMALI: ret örneği gerekli]),
  architecturalBuildingList: [{
    validationCodeNumber, gmlFileName: "M-<TaşınmazKimlik>-<Blok>.gml", controlState,
    northAngle, srsName, epsgCode, centerLongitude/Latitude, min/maxLongitude/Latitude,
    tapuParsel: { tapuIlRef/Ad, tapuIlceRef/Ad, tapuMahalleRef/Ad, adaNo, parselNo,
                  tapuParselRef, tapuZeminRef, kadastroBirimRef/Ad },
    architecturalBuildingGmlBuilding: { name: "Mimari Bina_<cid>", class: "MimariBina",
      constructionId, takbisPropertyIdentityNumber, takbisNeighbourhoodReference, blockNumber,
      parcelNumber, tenderRegistrationNumber, buildingType, roofProjectionArea, geometrySuitability,
      architecturalPlanID, additionalNote, totalIndependentSectionCount, elevatorCount,
      buildingHeight, architecturalProjectConfirmationDate, storeysAboveGround,
      storeysBelowGround, maksIdentityNumber },
    architecturalBuildingGmlIndependentSectionList: [{ independentSectionNumber,
      independentSectionStoreyNumber, independentSectionUsage, independentSectionPlannetArea,
      independentSectionPlanGrossArea, blockName, entrance, balconyCount,
      maksBagimsizBolumKimlikNo, propertyLot, registeredQuality, registeredInstallation,
      registeredFloorDefinition }],
    architecturalBuildingControlContentList: [{ controlResult: "Warning" | "Error"?,
      logType, errorCode, message, objectId }]
  }]
}
```

Diğer uç noktalar (sayfa kodunda görülen adlar): `ArchitecturalBuildingControlCreate`, `ArchitecturalBuildingControlAddFile`, `ArchitecturalBuildingControlStartControl`, `ArchitecturalBuildingControlStateControl`, `DownloadArchitecturalBuildingReportPdf`, `DownloadArchitecturalBuildingCityGml`.

**Not:** Yükleme uç noktalarını (Create/AddFile/StartControl) uygulamadan otomatik çağırmak **önerilmez**. Gönderim, yasal sorumluluğu olan harita mühendisinin kendi elle yaptığı işlem olarak kalmalı (Genelge 2025/2).

Sunucunun alan adları **bizim iç veri modelimiz için iyi bir sözlük**: `registeredFloorDefinition`, `balconyCount`, `independentSectionStoreyNumber` gibi türetilmiş alanları sunucuyla **aynı adlarla** hesaplarsak karşılaştırma ve hata ayıklama kolaylaşır.

---

## 9. 7. Tur Gündemi — Her AI'dan Beklenen

**Gemini (plan sahibi):**
1. §5 (K45 rev3, K46b rev, K70 ek, K75 rev, K78 kesin, K81–K83) ve §6 (V-198, V-200 kaldırma, V-206–V-211) değişikliklerini şartname ve plana işle.
2. CLAUDE6 §16'daki kritik maddeler (mahal sözlüğü, pencere varsayılanları) hâlâ geçerli. Bu belge onları değiştirmiyor.
3. C7-01 (TKGM Sonuç Önizlemesi) ve C7-02 (MAKS makullük denetçisi) M2/M4 kapsamına alınsın.
4. Okuyucu kabul testine "gml:pos + 10 ondalık + 5 MB" dosyası eklensin (C7-06).

**DeepSeek:** measure-report.json şemasına `producerSignature` alanı eklensin (pos/posList, ondalık, delik ofseti, kapı nesnesi ofseti, GroundSurface adı). Bu imza "örnekten öğren" (C6-08) ve stil profili önerisinin girdisi olur. Ayrıca R7-02'yi "temsil birliği" önerinizle karşılaştırın.

**ChatGPT:** (6. tur dosyası gelmemişti) Kılavuz'daki GroundSurface satırlarının neden hâlâ durduğunu (sürüm geçmişi, HelpNDoc v2.50 sürüm notları) araştırın. Ayrıca "Balkony bulunamadı." uyarısının koşulunu kılavuzdan bulmaya çalışın.

**Grok:** C7-01 önizleme ekranının UX tasarımı (TKGM ekranıyla görsel eşlik, farkların vurgulanması) ve C7-05 v1.1'in kullanıcı onay akışı.

**Hepsi:** Bu belgedeki örneklem tek üreticiden geliyor (§1.4). "Kabul görüyor" bulguları güçlü. "Reddediliyor" yönünde **hiçbir yeni bulgu yok**. Ret kanıtı gelene kadar hiçbir yeni HATA kuralı bu veriye dayandırılmamalı.

---

## 10. Kullanıcıdan İstenen Ek Veri

Öncelik sırasıyla (her biri belirli bir açık soruyu kapatır):

1. **RET almış doğrulama kodları** (varsa, hata mesajlarıyla birlikte): Doğrulayıcının gerçekte neyi reddettiğini görmenin tek yolu. Şu an elimizde güncel rejimden tek bir ret örneği bile yok.
2. **Başka bürolardan / başka yazılımlardan (GMLCity, LiCity, Yapınet vb.) kabul kodları:** Örneklem yanlılığını kırar. Özellikle eğik tavanlı çatı arası, teras ve yüksek (5+ kat) bina içerenler.
3. **Bir sonuç kodunun "PDF Rapor İndir" çıktısı** (kullanıcı kendisi indirip klasöre koyarsa): Yapı Özet Formu'nun veya sonuç raporunun resmi alan listesini verir (CLAUDE6 AS-8).
4. **Bir tane onaylı mimari proje kesiti + liste beyan** (aynı koddan): Açıklık tiplerinin ve liste beyan alanlarının GML'e nasıl aktarıldığını uçtan uca doğrulamamızı sağlar.

> Not: Bu belgedeki inceleme için **hiçbir dosya indirilmedi** (GML'ler tarayıcı belleğinde ölçüldü). Yukarıdaki PDF'leri veya GML'leri yerel olarak saklayıp tekrar ölçmek isterseniz, dosyaları siz indirip klasöre koyabilirsiniz ya da açıkça izin verirseniz ben indiririm. Kaydederken kişisel veri içeren alanlar ayıklanır.

---

## Ek-A. Ham Sonuç Tabloları

### A.1 GML başına ölçümler

| Kod / GML | Boyut (MB) | GS | Kapı | Pencere | Oda | BB parça | Kapı üst (cm) | Kapı nesne alt (mm) | Pencere denizlik (cm) | Pencere yük. (cm) | Pencere→tavan (cm) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| FUA5P9 A | 4,65 | 1 | 130 | 76 | 78 | 9 | 210×111 | 0×111 | 5×17, 90×17, 170×7 | 140×17, 230×17, 60×7 | 38×24, 33×17 |
| FUA5P9 B | 4,97 | 1 | 136 | 78 | 78 | 9 | 210×110, 230×2 | 0×112 | 170×21, 90×17, 5×11 | 60×21, 140×17, 230×11 | 38×38, 33×11 |
| FUA5P9 C | 5,01 | 1 | 136 | 84 | 80 | 9 | 210×112, 230×1 | 0×113 | 5×20, 90×20, 170×3 | 140×20, 230×14, 300×6, 60×3 | 38×23, 33×14, 30×6 |
| FUA5P9 D | 3,14 | 1 | 72 | 56 | 55 | 8 | 210×62 | 0×62 | 5×13, 90×9, 170×8 | 230×11, 140×9, 60×8, 255×2 | 38×17, 33×11, 180×2 |
| 899AK3 A | 1,60 | 1 | 36 | 36 | 32 | 6 | 210×32, 230×2 | 0×34 | 60×8, 90×6, 170×4 | 170×8, 140×6, 60×4 | 38×18 |
| GCZ6NB A/B/C | 1,41 | 1 | 36 | 32 | 20 | 4 | 210×24, 230×6 | 0×30 | 5×6, 90×6, 170×4 | 140×6, 230×6, 60×4 | 48×6, 43×4, 68×4, 63×2 |
| GCZ6NB D | 1,02 | 1 | 22 | 24 | 16 | 2 | 210×19, 240×1 | 0×20 | 5×9, 170×3 | 240×5, 260×4, 60×2, 70×1 | 33×9, 48×2, 38×1 |
| GCZ6NB E/F | 1,42 | 1 | 36 | 32 | 20 | 4 | 210×26, 230×4 | 0×30 | 5×6, 90×6, 170×4 | 140×6, 230×6, 60×4 | 48×6, 43×4, 68×4, 63×2 |
| GCZ6NB G/H | 1,35 | 1 | 32 | 28 | 20 | 4 | 210×26, 230×2 | 0×28 | 5×6, 90×4, 120×2, 170×2 | 230×6, 60×4, 140×4 | 48×6, 43×4, 63×2, 118×2 |
| GCZ6NB I | 3,40 | 1 | 86 | 54 | 61 | 10 | 210×73, 230×5 | 0×78 | 90×13, 5×10, 170×4 | 140×13, 230×10, 60×4 | 58×17, 53×10 |
| GCZ6NB J | 2,39 | 1 | 62 | 56 | 40 | 8 | 210×58 | 0×58 | 5×12, 90×8, 170×8 | 230×12, 60×8, 140×8 | 58×16, 53×12 |
| AFRMPJ A | 1,19 | 1 | 32 | 28 | 18 | 4 | 210×24, 230×2 | 0×26 | 5×10, 180×4 | 230×10, 50×4 | 50×10, 55×4 |
| 662P0J A | 1,15 | 1 | 28 | 28 | 20 | 4 | 210×24 | 0×24 | 5×8, 60×3, 170×3 | 230×8, 60×3, 170×3 | 60×8, 65×6 |
| 2FRDAC A | 1,22 | 1 | 32 | 28 | 20 | 4 | 210×22, 230×4 | 0×26 | 5×8, 60×4, 180×2 | 230×8, 170×4, 50×2 | 52×8, 57×6 |

("Kapı" sayısı dosyadaki tüm `bldg:Door` elemanlarıdır: LoD2, kat, BB ve oda temsilleri dahil. Kot ölçümleri yalnız oda içindeki kapılardan yapıldı.)

### A.2 Delik ölçümleri (toplam)

```
files: 18, delik: 4021, altTemas: 0, üstTemas: 0, yanTemas: 0, enKüçükYanBoşluk: 0.0314 m
kapı deliği alt − duvar alt = +50 mm : 885
kapı nesnesi alt − duvar alt = 0 mm   : 870
GroundSurface gml:name: ["Zemin"]
```

### A.3 Bina düzeyi (sunucu JSON'undan)

| Kod / GML | buildingHeight | roofProjectionArea | BB | asansör | üst/alt kat | gs | bt |
|---|---|---|---|---|---|---|---|
| FUA5P9 A/B/C/D | 8,4 | 333,49 / 323,65 / 349,79 / 205,73 | 9/9/9/8 | 1 | 3/1 | 1006 | 1001 |
| 899AK3 | 6,5 | 120,76 | 4 | 0 | 2/0 | 1006 | 1001 |
| GCZ6NB A–J | 6,5 | 146,21 (A,B,C,G,H) · 133,02 (D,E,F) · 380,16 (I) · 298,28 (J) | 2/2/2/1/2/2/2/2/10/8 | 0 | 2/0 | 1006 | 1001 |
| AFRMPJ | 6,5 | 132,29 | 2 | 0 | 2/0 | 1006 | 1001 |
| 662P0J | 6,0 | 127,81 | 2 | 0 | 2/0 | 1006 | 1001 |
| 2FRDAC | 6,5 | 128,23 | 2 | 0 | 2/0 | 1006 | 1001 |

Tümünde `tenderRegistrationNumber = ""`, `architecturalPlanID = ""`, `additionalNote = "-"`. Bu, CLAUDE6 N19'da reddedilen dosyanın ihlal ettiği sabit değer kurallarının (V-202) **doğru** olduğunu bir kez daha gösteriyor.

## Ek-B. Ölçüm Betiklerinin Mantığı

- **Biçim:** BOM (ilk karakter U+FEFF), CRLF varlığı, XML başlığı, `gml:Envelope@srsName`, `gml:pos` / `gml:posList` sayımı, 6. koordinat elemanındaki sayıların ondalık hane dağılımı.
- **Sayımlar:** `bldg:GroundSurface`, `bldg:Door`, `bldg:Window`, `bldg:Room`, `gen:GenericCityObject`, `bldg:lod2Solid`, `bldg:measuredHeight`.
- **Oda göreli kotlar:** oda `FloorSurface` en küçük z = taban; tek ve düz `CeilingSurface` = tavan; odadaki her `Door`/`Window` geometrisinin (pos+posList) min/max z değeri.
- **Delik temas:** `gml:interior` içeren ve z aralığı > 0,3 m olan her poligonda, dış halka ile iç halka arasında min-z ve max-z eşitliği (0,5 mm tolerans) ve duvar doğrultusundaki yan boşluk (CLAUDE6 Ek-A N13 ile aynı).
- **Delik ↔ kapı nesnesi:** kapı içeren her `InteriorWallSurface` için ilk poligonun dış halka min z değeri, iç halka min/max z değerleri ve kapı nesnesi geometrisinin min z değeri.
- **Arsa payı:** BigInt EKOK/EBOB; `^\s*(\d+)\s*/\s*(\d+)\s*$`; sunucu BB listesinden (BB başına bir kayıt, tekilleştirilmiş).
- **Gizlilik:** Sonuç JSON'unun `sender` alanı ayrıştırmadan hemen sonra silindi. Hiçbir veri diske yazılmadı.
- TypeScript karşılığı `tools/measure` modülüne (M0) eklenmeli. Bu belgedeki tablolar "altın değer" olarak kullanılabilir. Ancak GML'ler yerelde saklanmadığı için CI testi için kullanıcı izniyle yerel kopya gerekir (§10).
