# GEMINI, 08.11.2026, 03:45, 3DBİNA UYGULAMASI — KODLAMA ÖNCESİ NİHAİ KONSOLİDE ŞARTNAME (v3.5.5) VE `CLAUDE13` KAPANIŞ ONAYI

> **Belge Kimliği:** `GEMINI14.md` (Konsolide Uygulama Şartnamesi **v3.5.5 — Kodlama Öncesi Kesinleşmiş Nihai Sürüm**)
> **Durum:** `TANIMLI / KODLANMADI` (`D-22` — Kullanıcı **Proceed** butonuna bastığı anda `M0` 10 adımlı çekirdek kodlaması başlayacaktır).
> **Doğruluk Kaynakları (`D-21`):**
> 1. `/public/assets/aistudio/claude_uygulama_sartnamesi_v3_58f23bf6.md` (Normatif Şartname v3 — `K01–K69`, `V-001–V-195`, `§3.1–3.13` XML Şablonları, `Ek-A..C`)
> 2. `/public/assets/aistudio/CLAUDE13_fdab3576.md` (`CLAUDE13.md` — Son Kontrol, Kullanıcı Kararı `K88-yeni`/`Malik`/`K83 İptali` ve 15 Resmi Dosya SHA-256 Kilidi)
> 3. `/public/assets/aistudio/CLAUDE12_07794bba.md` (`CLAUDE12.md` ve `Ek-A` Kesin Karar Listesi — `docs/KARARLAR.md`)
> 4. `/public/assets/aistudio/AISTUDIO_BASLANGIC_TALIMATI_a724ac74.md` (Mutlak Kurallar + `M0` 10 Adımlı Görev Listesi)
> 5. `/public/assets/aistudio/DOSYA_LISTESI_1e8e75ac.txt` + `/public/assets/aistudio/ornek6_7839a667.xml` + 14 Resmi TKGM `codelists/*.xml` Dosyası

---

## BÖLÜM 0: `CLAUDE13` UYUM TABLOSU, 15 RESMİ DOSYA SHA-256 KİLİDİ VE KULLANICI SORUSUNA NET YANIT

### 0.1 Okunan Dosyaların ve 15 Resmi Referans Dosyasının Doğrulama Tablosu (`D-19`)

| Dosya Adı (Çalışma Alanı Yolu) | Tür / Yazan | Boyut (Bayt) | SHA-256 Özeti (`DOSYA_LISTESI.txt` ile Birebir Eşleşen) | Durum |
|---|---|---|---|---|
| `CLAUDE13_fdab3576.md` (`CLAUDE13.md`) | Claude (`03:35`) | 14.702 B (159 satır) | — | **TAM OKUNDU & İŞLENDİ** |
| `DOSYA_LISTESI_1e8e75ac.txt` | Resmi Liste | 1.615 B (19 satır) | — | **TAM OKUNDU & KİLİTLENDİ** |
| `ornek6_7839a667.xml` (`ornek6.gml`) | Resmi Altın GML | `717.200` B | `7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03` | **TAM OKUNDU (`fixtures/ornek6.gml`)** |
| `buildingGeometrySuitability_f399e646.xml` | Resmi Codelist (1/14) | `1.603` B | `f399e6460ea7d8f211b29c5465da9639e0879cd2f4d59cc370faeb6cc1194f39` | **TAM OKUNDU** |
| `buildingType_fc5de1b9.xml` | Resmi Codelist (2/14) | `770` B | `fc5de1b9c6224bd780612772ce5265c66fe4d1bad9562560bb37980b02798197` | **TAM OKUNDU** |
| `cardinalDirection_8aa0bc43.xml` | Resmi Codelist (3/14) | `2.053` B | `8aa0bc43e64e0417355fb9129fb6a3b67c9c98bace0534d25fbdae4dbd034dc9` | **TAM OKUNDU** |
| `doorUsage_c394c54e.xml` | Resmi Codelist (4/14) | `1.180` B | `c394c54ec9765d2ea5b18b4cc618307ce8d33da162f715408ac8c575fc790775` | **TAM OKUNDU** |
| `independentSectionGeometrySuitability_8c13ff3a.xml` | Resmi Codelist (5/14) | `831` B | `8c13ff3a583a949075dd17e7f63a27ad29a929d47c4505c8334884db5e77c3f0` | **TAM OKUNDU** |
| `independentSectionPartGeometrySuitability_eabb6a64.xml` | Resmi Codelist (6/14) | `835` B | `eabb6a64ac72be922c41ea518f20b8ec0d3ecebf8a9cfdda9c432c35001838a2` | **TAM OKUNDU** |
| `independentSectionUsage_1620a4d3.xml` | Resmi Codelist (7/14) | `1.519` B | `1620a4d341a1393408f330ed2529f2134b6e667b898a9651eac9bebf80de741e` | **TAM OKUNDU** |
| `integrationState_c234e8ef.xml` | Resmi Codelist (8/14) | `1.181` B | `c234e8ef749233026b5e9fe91acea661f174f9ed1e0a4054287e0f9519493238` | **TAM OKUNDU (çift `id3` doğrulandı)** |
| `maksConstructionIntegrationState_945c852c.xml` | Resmi Codelist (9/14) | `1.013` B | `945c852cddb5680e31c0d02f0e1481802f82ad7226db0d669b1e2f454079e1f8` | **TAM OKUNDU** |
| `maksIndependentSectionIntegrationState_4d97b558.xml` | Resmi Codelist (10/14) | `1.007` B | `4d97b5589b28ec16b5cc5b6b0485f472ce75e76be18ae84fa02c3e2ee67c966f` | **TAM OKUNDU** |
| `partUsage_07a42ced.xml` | Resmi Codelist (11/14) | `5.842` B | `07a42ced5cef9d420e33b213409b872e6264d673bf5554d63f115432c763761d` | **TAM OKUNDU (`partUsage` + `commonAreaUsage`)** |
| `roomInstallationUsage_5d969360.xml` | Resmi Codelist (12/14) | `950` B | `5d969360f5031280f4612efad738b23c93b7ca5bfeedad52b9fa69dc7100d98b` | **TAM OKUNDU** |
| `storeyUsage_f7a31e30.xml` | Resmi Codelist (13/14) | `949` B | `f7a31e305d7cde8542f859be43947dfec3f092bb9c770e76301e62c6dd3f1119` | **TAM OKUNDU** |
| `windowUsage_c2109006.xml` | Resmi Codelist (14/14) | `779` B | `c2109006e89f7bb88e81bf9135bf42546471760b02f11f4ae9e2c1c0e50b5563` | **TAM OKUNDU** |

---

### 0.2 KULLANICI SORUSUNA NET YANIT: "ANLAŞILMAYAN VEYA YAPAMAYACAĞIN BİR ŞEY VARMI?"

**Kısa Cevap:** **HAYIR — Anlaşılmayan, tereddütte kalan veya yapamayacağım HİÇBİR ŞEY YOKTUR (%100 net, eksiksiz ve kodlamaya hazırdır).**

`CLAUDE13.md` içinde belirtilen **4 son düzeltme ve kullanıcı kararı** bu şartnameye (`v3.5.5`) eksiksiz işlenmiştir:
1. **Kullanıcı Kararı (`CLAUDE13 §1` — `K88-yeni`, `Malik` Modeli ve `K83` İptali):**
   - Eski `K88` ve `K83` (`stripPersonalData.ts`) **iptal edilmiştir**.
   - Tapu/beyan alanları (`independentSectionNumber`, `propertyLot`, `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition`, `maksIdentityNumber`) ve **Malikler (Kat İrtifakı Listesi)** kullanıcı verisidir: elle girilir, tablodan/listeden yapıştırılır ve her zaman serbestçe düzenlenir (hiçbir alan kilitlenmez). İsteğe bağlı `otomatikOneri` ayarı (varsayılan `kapalı`) yalnızca kullanıcı onayıyla yazar.
   - `Malik` veri modeli (`bbAnahtari`, `adSoyadVeyaUnvan`, `tcKimlikVeyaVergiNo?`, `hissePay: bigint`, `hissePayda: bigint`, `not?`) yalnız proje dosyasında (`.tkgm3b`/`.tkgm3d`) ve kullanıcı raporlarında tutulur; **GML çıktısına asla yazılmaz** (`ALLOWED_GENERIC_ATTRIBUTES` 45 öznitelik olarak kalır).
   - `M0` Adım 7'de `stripPersonalData.ts` yerine **`src/core/model/malik.ts`** (`Malik` modeli + `BigInt` hisse toplamı `= 1` kontrolü + sahte örnek adlarla birim testler) kodlanacaktır.
2. **Yüklenen 15 Resmi Dosyanın Bayt-Bayt Kopyalanması (`CLAUDE13 §2.1`):**
   - Çalışma alanına yüklediğiniz `ornek6_7839a667.xml` (`717.200 B`) ve 14 adet `<ad>_<hash>.xml` kod listesi dosyası **asla baştan üretilmeyecek veya yeniden biçimlendirilmeyecektir**.
   - `M0` Adım 1'de `/public/assets/aistudio/` altındaki bu 15 dosya **bayt-bayt değiştirilmeden** `fixtures/ornek6.gml` ve `resources/codelists/<ad>.xml` yollarına kopyalanacak ve `DOSYA_LISTESI_1e8e75ac.txt` içindeki SHA-256 özetleriyle birebir eşleştiği zorunlu birim testiyle doğrulanacaktır.
   - `commonAreaUsage.xml` adında ayrı bir dosya oluşturulmayacak; 14 resmi XML dosyası kullanılacak ve `commonAreaUsage` özniteliği `partUsage.xml` (`5.842 B`) içinden okunacaktır (`CLAUDE13 §4`).
3. **Okumada Koordinat Ondalık Hane Kuralı (`CLAUDE13 §2.2`):**
   - `A.1`, `K09` ve `V-030` içindeki *"okumada `< 3` hane `HATA`"* ifadesi kaldırılmıştır. İçe alınan GML dosyasında `1–12` ondalık hane (`≠ 3` hane, `< 3` veya `> 3`) yalnızca **`BİLGİ (B)`** düzeyindedir (18 gerçek kabul dosyasında Z koordinatları 2 hanelidir). Üretimde (`GMLWriter`) ise her zaman `toFixed(3)` yazılır.
4. **Oylama Tablosu (`OY-01..09`) ve `Biçim C` Düzeltmesi (`CLAUDE13 §2.3`):**
   - `OY-01..09` satırlarında Qwen sütunu `*(Katılmadı)*` (`4.70 / 5.45`) olarak düzeltilmiş; `OY-01` önerme metni `GEMINI10 §2.1`'deki orijinal haline ve `Biçim C`'nin gerçek ölçüm tanımına (*iki yatay `Floor_` poligonu + dikey döşeme kenar poligonu yok + duvar `zFloorBottom`'dan başlar*, `44/44` kat) kavuşturulmuştur.

---

### 0.3 `CLAUDE12` / `CLAUDE13` Teknik Teyit Özeti (`UYARI-C12-1 .. 6` Kapanış Durumu)

1. **`UYARI-C12-1` (`BB` Sınıf Değeri):** `<gen:class>BagimsizBolum</gen:class>` (`gen:function`/`usage` yok) — `CLAUDE13 §4`'te onaylandı.
2. **`UYARI-C12-2` (`45` Öznitelik Beyaz Listesi):** `42 (Ornek6) + 2 (OA: commonAreaUsage, storeyObjectReference) + 1 (İç Yapı: roomInstallationUsage) = 45 gen:*Attribute` — `CLAUDE13 §4`'te onaylandı.
3. **`UYARI-C12-3` (`K60` / `K91` Çevrimdışı Kod Listeleri):** Sıfır ağ isteği, yerel `resources/codelists/*.xml` — `CLAUDE13 §4`'te onaylandı.
4. **`UYARI-C12-4` (14 Kod Listesi XML Dosyası):** Yüklenen 14 resmi XML dosyası birebir kullanılır (`commonAreaUsage.xml` yoktur, `commonAreaUsage` için `partUsage.xml` okunur) — `CLAUDE13 §4`'te kesinleşti.
5. **`UYARI-C12-5` (`maksIdentityNumber` Tipi):** Modelde `string | bigint | null`, XML'de `gen:intAttribute` — `CLAUDE13 §4`'te onaylandı.
6. **`UYARI-C12-6` (`175` Doğrulama Kuralı Satırı):** `150 (v3) + 25 (yeni) = 175` satır — `CLAUDE13 §3`'te makine kontrolüyle onaylandı.

---

### 0.4 Hazırlık Adımlarının Durumu (`M0` Başlangıcı İçin %100 Hazır)

| No | Hazırlık Kalemi | Durum ve İcra Şekli |
|---|---|---|
| **1** | `AISTUDIO_BASLANGIC_TALIMATI.md`, `claude_uygulama_sartnamesi_v3.md`, `CLAUDE12.md`, `CLAUDE13.md` | **TAMAMLANDI:** Tüm belgeler `/public/assets/aistudio/` içinde yüklüdür ve okunmuştur. `M0` Adım 1'de `docs/KARARLAR.md`, `docs/ACIK_SORULAR.md` ve `docs/ADIM_NOTU.md` oluşturulacaktır. |
| **2** | 14 Resmi TKGM Kod Listesi (`resources/codelists/*.xml`) + `ornek6.gml` (`fixtures/ornek6.gml`) + `DOSYA_LISTESI.txt` | **TAMAMLANDI:** 15 resmi dosyanın tamamı `/public/assets/aistudio/` içine yüklenmiştir. `M0` Adım 1'de bayt-bayt kopyalanacak ve `DOSYA_LISTESI_1e8e75ac.txt` içindeki SHA-256 özetleriyle birim testinde doğrulanacaktır. |
| **3** | `M0` (10 Adımlı Çekirdek + Birim Testler + Denetim Konsolu) | **HAZIR:** Siz **Proceed** butonuna bastığınız anda `M0`'ın 10 adımı (`codelists`, `model`, `landShare`, `helmert2d`, `ring`, `malik`, `canonical`, `readAttributes`, `trace`, `verify:samples`) kodlanıp tüm test çıktıları `docs/ADIM_NOTU.md` içine yazılacaktır. |

---

## BÖLÜM 1: KESİNLEŞMİŞ OYLAMA KAYDI (`OY-01 .. OY-12` — `D-20` & `CLAUDE13 §2.3` DÜZELTMELİ)

> **Kural (`D-20` & `CLAUDE13 §2.3`):** Oy tablosundaki önerme metni, açıldığı turdaki (`GEMINI10 §2.1` ve `GEMINI11 §0.4`) metnin birebir kopyasıdır. `OY-01 .. OY-09` oylamalarında Qwen (`QWEN10`) oy pusulası doldurmadığı için Qwen sütunu `*(Katılmadı)*` olarak kaydedilmiştir (Toplam EVET: `4.70 / 5.45`, Kabul Eşiği `> 2.725`). Qwen yalnız `OY-10`'da oy kullanmıştır (`5.45 / 5.45`).
> **Kullanıcı Kararı Notu (`CLAUDE13 §1`):** Kullanıcı kararı oy tablosunun üstündedir; `OY-06`, `OY-09` ve `OY-10` içinde geçen eski `K88` (salt-okunur beyan kilidi) ve `K83` (`stripPersonalData`) maddeleri **Kullanıcı Kararı (`CLAUDE13 §1`)** ile `K88-yeni` (serbest düzenlenebilir beyan + `Malik` modeli) ve `K83 İptali` olarak güncellenmiştir.

| Oy Kodu | Açıldığı Turdaki Önerme Metni (`D-20` Birebir) | Claude (2.2) | Gemini (1.5) | DeepSeek (1.0) | Qwen (0.75) | Toplam EVET | Nihai Karar |
|---|---|---|---|---|---|---|---|
| **OY-01** | **Kat Geometrisi `Biçim C` ve Varsayılan `A10` (`GEMINI10 §2.1`):** *"Biçim C 3. profil olsun, varsayılan A10 kalsın"* — `Biçim C` (**iki yatay `Floor_` poligonu + dikey döşeme kenar poligonu yok + duvar `zFloorBottom`'dan başlar**; `CLAUDE8 N26` ölçümü: 18 gerçek dosyada `44/44` kat `Biçim C`, 6 resmi örnekte 4 `Biçim A` + 2 `Biçim B`) 3. üretici profili (`C50`) olarak eklensin; yeni üretimde varsayılan **`A10` (`Biçim A + 10 mm`)** kalsın. | **EVET** (2.2) | **EVET** (1.5) | **EVET** (1.0) | *(Katılmadı)* | **4.70 / 5.45** | **KESİN KABUL (`K55 rev2`, `K79`)** |
| **OY-02** | **Koordinat Hane Sayısı (`< 3` Hane Üretimde Yasak):** Üretimde (`GMLWriter`) ve Normalize kayıtta `< 3` ondalık hane (`1` veya `2` hane) seçeneği kaldırılsın; üretim her zaman tam `toFixed(3)` olsun; Düzeltme modunda (`K70`) yalnızca `≥ 3` hane ise kaynak hane korunsun, `< 3` ise `3` haneye tamamlansın *(Okumada `≠ 3` hane `V-030 BİLGİ`dir — `CLAUDE13 §2.2`)*. | **EVET** (2.2) | **EVET** (1.5) | **EVET** (1.0) | *(Katılmadı)* | **4.70 / 5.45** | **KESİN KABUL (`K09`, `K70`)** |
| **OY-03** | **Tek GML Fark (`Diff`) Motoru:** `G-KOLAY-16`, `G-KOLAY-17` ve `D-KOLAY-21` birleştirilerek tek bir `diffImportedModels(oldModel, newModel)` motoru yazılsın (öznitelik, alan, kot ve `gml:id` farklarını raporlasın). | **EVET** (2.2) | **EVET** (1.5) | **EVET** (1.0) | *(Katılmadı)* | **4.70 / 5.45** | **KESİN KABUL (`M3`)** |
| **OY-04** | **`registeredFloorDefinition` Büyük Harfe Zorlanmaması:** `registeredFloorDefinition` özniteliği liste beyandan **aynen** alınsın, `K61` büyük harf dönüşümüne sokulmasın (`N27` kanıtı: `"Zemin Kat"`, `"1. Kat"`, `"Bodrum Kat"`). | **EVET** (2.2) | **EVET** (1.5) | **EVET** (1.0) | *(Katılmadı)* | **4.70 / 5.45** | **KESİN KABUL (`K61`, `V-064`)** |
| **OY-05** | **Simetrik Kat Klonlamada Yalnız XY Dönüşümü:** Kat klonlama/simetri aracında yalnızca 2B tasarım düzlemindeki `(X, Y)` koordinatları yansıtılsın ve halka yönleri (`CW/CCW`) otomatik düzeltilsin; `Z` kotları asla ters çevrilmesin, yeni katın kot zincirinden hesaplansın. | **EVET** (2.2) | **EVET** (1.5) | **EVET** (1.0) | *(Katılmadı)* | **4.70 / 5.45** | **KESİN KABUL (`M4`)** |
| **OY-06** | **Smart Paste / OCR Onay Zorunluluğu (`K88`):** Panodan tablo yapıştırma veya OCR ile okunan bağımsız bölüm listesi doğrudan modele yazılmasın; önizleme tablosunda kullanıcı satır satır onayladıktan sonra modele aktarılsın *(Kullanıcı Kararı `CLAUDE13 §1`: Aktarım sonrasında da tüm alanlar kullanıcı tarafından serbestçe düzenlenebilir)*. | **EVET** (2.2) | **EVET** (1.5) | **EVET** (1.0) | *(Katılmadı)* | **4.70 / 5.45** | **KESİN KABUL (`K88-yeni`, `M7`)** |
| **OY-07** | **`OpeningType.toleranceMm` Alanının Eklenmesi:** Açıklık tiplerine kullanıcı tarafından değiştirilebilir `toleranceMm` alanı eklensin mi? | **HAYIR** (0) | **HAYIR** (0) | **HAYIR** (0) | *(Katılmadı)* | **0.00 / 5.45** | **KESİN RET** (Sabit üretici profili `A10/B50/C50` kullanılır) |
| **OY-08** | **Çatı İzdüşüm Alanı < Taban Alanı Durumunun `HATA` Yapılması:** `roofProjectionArea < footPrintArea` durumu `HATA` olsun mu? | **HAYIR** (0) | **HAYIR** (0) | **HAYIR** (0) | *(Katılmadı)* | **0.00 / 5.45** | **KESİN RET** (`V-079` `UYARI/BİLGİ` olarak kalır) |
| **OY-09** | **5+ Katlı Binada Asansör Zorunluluğu ve Otomatik BB Numarası Üretimi:** 5+ katta asansör yoksa `HATA` verilsin ve BB numaraları otomatik üretilsin mi? | **HAYIR** (0) | **HAYIR** (0) | **HAYIR** (0) | *(Katılmadı)* | **0.00 / 5.45** | **KESİN RET** (`CLAUDE13 §1` `K88-yeni`: İsteğe bağlı öneri yalnız kullanıcı onayıyla çalışır) |
| **OY-10** | **11. Tur Teknik Paketi (`N31–N36`):** `V-124` (`zFloorBottom ≤ zWallMin ≤ zFloorTop`), `V-198a/b/c` ve `V-212` (`BigInt` arsa payı + `uniqueBbCount`), `K42 rev2` (kesitten döşeme kalınlığı), `K86 rev2` (`1900-01-01` rozeti), `K92` (`uuidv5`), `K93` (`xlink:href="#..."`), `K83` *(Kullanıcı kararıyla `K83` iptal edildi — `CLAUDE13 §1`)*. | **EVET** (2.2) | **EVET** (1.5) | **EVET** (1.0) | **EVET** (0.75) | **5.45 / 5.45** | **KESİN KABUL (`K83` Hariç — `CLAUDE13 §1`)** |
| **OY-11** | **ChatGPT Mimari Tezi: PWA İptali + C# WPF Reddi + Electron & Saf TypeScript (`PlatformAdapter`) Mimarisi:** PWA (service worker, manifest, mobil) kapsam dışı bırakılsın; C# WPF + WebView2 çift dil mimarisi reddedilsin; AI Studio'da `src/core/` saf TypeScript + `PlatformAdapter` ile geliştirilip Windows masaüstü için Electron `.exe` (`M10`) olarak paketlensin; çalışma anında `@google/genai` ve ağ isteği (`K91`) kullanılmasın. | **EVET** (2.2, şerhli) | **EVET** (1.5) | **EVET** (1.0) | *(Katılmadı)* | **4.70 / 5.45** | **KESİN KABUL (`CLAUDE12 §1.2` Şerhiyle)** |
| **OY-12** | **Kullanıcı Kolaylıkları (`G-KOLAY-29 .. 38`) Triyajı (`CLAUDE12 §1.3` Dağılımı):** `v1` kapsamına alınanlar: **`30`** (`M5` OA boşluk algoritması olarak), **`33a`** (otomatik cephe yönü `K29`), **`33c`** (sütun >50cm / 12-gen `S.S.S. 18`), **`35a`** (balkon/teras sihirbazı, sınıf `Balkon`), **`35b`** (`1900-01-01` rozeti `K86`). **Ret:** **`33b`** (onaysız otomatik BB no). **`v1.x`:** `31`, `32`, `35c` (`S.S.S. 29/31`), `36a` (`S.S.S. 30`). **`v2`:** `37` (çoklu monitör). **Mükerrer birleştirilenler:** `29→10`, `34→16`, `36b→14`, `38→17`. | **EVET** (2.2) | **EVET** (1.5) | **EVET** (1.0, kısmen/bölünerek) | *(Katılmadı)* | **4.70 / 5.45** | **KESİN KABUL (`CLAUDE12 §1.3` Dağılımıyla)** |

---

## BÖLÜM 2: `CLAUDE12 Ek-A` — KESİN KARAR LİSTESİ (`docs/KARARLAR.md` İÇERİĞİ)

> Bu bölüm kodlama başladığında repo içinde `docs/KARARLAR.md` olarak birebir kaydedilecek olan tekil karar kaynağıdır (`D-21`).

### A.1 Dosya Kuralları
- **Standart:** CityGML 2.0 + GML 3.1.1 (`http://www.opengis.net/gml`). GML 3.2 yasaktır (`-904`).
- **Kodlama:** UTF-8, **BOM'suz**, satır sonu `CRLF` (`\r\n`). İlk satır: `<?xml version="1.0" encoding="utf-8"?>` (`encoding="utf-8"` küçük harf).
- **Dosya Adı:** `M-<constructionID>.gml`. Dosyada tam 1 adet `bldg:Building` bulunur.
- **CRS:** `srsName="EPSG:5253…5259"` ve `srsDimension="3"` **yalnız** `gml:Envelope` üzerinde bulunur. Polygon, MultiSurface vb. alt elemanlarda `srsName` **yasaktır**.
- **Koordinat Sırası ve Kot:** `Y(doğu/easting) X(kuzey/northing) Z(ortometrik gerçek kot, TUREF)`. Yerel `0` tabanlı kot yasaktır.
- **Sayı Biçimi (`CLAUDE13 §2.2`):** Üretimde `gml:posList`, koordinatlar `toFixed(3)`, alan/hacim/yükseklik `toFixed(2)`. Okumada hem `gml:pos` hem `gml:posList` ve **1–12 ondalık hane** desteklenir; içe alınan dosyada `≠ 3` ondalık hane (`< 3` veya `> 3`) **yalnızca `V-030 BİLGİ (B)`** düzeyindedir, asla `HATA` değildir (18 gerçek kabul dosyasında Z koordinatları 2 hanelidir).

### A.2 Kimlik (`gml:id`), Adlar (`gml:name`) ve Sınıflar
- **`gml:id` Biçimi:** `<Önek>_<küçük harf deterministik uuidv5>`. Süslü parantez yok, dosya içinde tekrar yok.
  - **Nesne Önekleri (12 adet):** `MB_`, `K_`, `BB_`, `BBK_`, `OA_`, `BBKIY_`, `OAIY_`, `BLKN_`, `TRS_`, `MBG_`, `KAPI_`, `PEN_`
  - **Poligon Önekleri (15 adet):** `Floor_`, `Wall_`, `Roof_`, `InteriorWall_`, `Ceiling_`, `Ground_`, `OuterFloor_`, `OuterCeiling_`, `Closure_`, `Lod1Poligon_`, `Lod0FootPrint_`, `Lod0RoofEdge_`, `Door_`, `Window_`
  - **Halka Önekleri (3 adet):** `LinearRing_`, `DoorLinearRing_`, `WindowLinearRing_`
- **`gml:id` Verilmeyecek Elemanlar (`K13`):** `*Surface` (`WallSurface`, `RoofSurface`, `GroundSurface`, `FloorSurface`, `InteriorWallSurface`, `CeilingSurface`, `OuterFloorSurface`, `OuterCeilingSurface`), `MultiSurface`, `Solid`, `CompositeSolid`, `CompositeSurface`, `MultiCurve`, `LineString`.
- **`gml:name` Kuralı (`K14`):** Yalnızca nesnelere ve `*Surface` elemanlarına verilir; `gml:Polygon` ve `gml:LinearRing` elemanlarına `gml:name` verilmez.
- **`constructionID` (`K19`):** `<takbisPropertyIdentityNumber>-<HARF>` (örn. `70125626-A`; `blockName` `"-1"` olsa bile harf korunur).
- **Sınıf Değerleri (`V-057`):**
  - `bldg:class`: `MimariBina`, `BagimsizBolumKisim`, `OrtakAlan`, `BagimsizBolumKisimIcYapi`, `OrtakAlanIcYapi`, `Balkon`, `Teras` *(Teras sınıf değeri `v3 §3.10`'da `Teras` olarak geçer, gerçek örnekle ayrıca teyit edilecektir)*. Kapı ve Pencerede `bldg:class` **yoktur**.
  - `grp:class`: `Kat`, `MimariBinaGrup`.
  - `gen:class`: `BagimsizBolum` (`v3 §3.6` `Ornek6`'dan doğrulandı).
- **Referanslar (`K93`):** Tüm `xlink:href` değerleri `#` ile başlar (`xlink:href="#MB_..."`). `independentSectionObjectReference` ve `storeyObjectReference` değerleri ise `#` olmadan ID metnidir (`BB_...`, `K_...` veya `-1`).

### A.3 Öznitelik Beyaz Listesi (`ALLOWED_GENERIC_ATTRIBUTES` — Kodda Sabit, 45 Adet)
1. **`Ornek6` İçinden Doğrulanan 42 `gen:*Attribute` (`ad:tip`):**
   - `additionalNote:string`
   - `architecturalPlanID:string`
   - `architecturalProjectConfirmationDate:date`
   - `blockName:string`
   - `blockNumber:string`
   - `buildingHeight:double`
   - `buildingType:int`
   - `calculatedArea:double`
   - `constructionID:string`
   - `doorUsage:int`
   - `elevatorCount:int`
   - `entrance:string`
   - `geometrySuitability:int`
   - `independentSectionCalculatedArea:double`
   - `independentSectionCardinalDirection:int`
   - `independentSectionCount:int`
   - `independentSectionNumber:string`
   - `independentSectionObjectReference:string`
   - `independentSectionPlanGrossArea:double`
   - `independentSectionPlanNetArea:double`
   - `independentSectionUsage:int`
   - `integrationState:int`
   - `maksIdentityNumber:int` *(Modelde `string | bigint | null`, XML'de `gen:intAttribute`)*
   - `maksIntegrationState:int`
   - `maksNumaratajIdentityNumber:int` *(Modelde `string | bigint | null`, XML'de `gen:intAttribute`)*
   - `parcelNumber:string`
   - `partCount:int`
   - `partUsage:int`
   - `planArea:double`
   - `propertyLot:string`
   - `registeredFloorDefinition:string`
   - `registeredInstallation:string`
   - `registeredQuality:string`
   - `roofProjectionArea:double`
   - `storeyNumber:string`
   - `storeyUsage:int`
   - `takbisNeighbourhoodReference:int`
   - `takbisPropertyIdentityNumber:int`
   - `tenderRegistrationNumber:string`
   - `totalIndependentSectionCount:int`
   - `volume:double`
   - `windowUsage:int`
2. **Ortak Alan (`OA_`) ve İç Yapı (`BBKIY_` / `OAIY_`) İçin Ek 3 `gen:*Attribute` (`Ornek1`, `Ornek2`, `Sincan`):**
   - `commonAreaUsage:int` (`OA_` içinde — değerleri `partUsage.xml` kod listesinden okunur)
   - `storeyObjectReference:string` (`OA_` içinde)
   - `roomInstallationUsage:int` (`BBKIY_` / `OAIY_` içinde — `UYARI-C12-2`)
3. **Kesinlikle Yazılmayanlar (`YASAK`):** `measuredHeight`, `lod2Solid`, Texture/Appearance (`app:Appearance`), `verticalDatum`, `storeyHeight`, `calculatedVolume`, `grp:function`, **malik/kişi bilgileri (`Malik`)** ve şema-dışı hiçbir ad.

### A.4 Tapu / Beyan Verileri (`K88-yeni`), `Malik` Modeli ve `K83` İptali (`CLAUDE13 §1` Kullanıcı Kararı)
- **`K88-yeni` (Serbest Kullanıcı Girişi ve Düzenleme):** `independentSectionNumber`, `propertyLot`, `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition`, `maksIdentityNumber` ve **malikler (`Malik`)** kullanıcı verisidir. Kullanıcı bu verileri elle girebilir, tablodan/listeden yapıştırabilir ve her zaman serbestçe değiştirebilir (kilitli alan yoktur). İsteğe bağlı `otomatikOneri` ayarı (`kapalı` / `açık`, varsayılan: `kapalı`) yalnızca kullanıcı onayıyla yazar.
- **`Malik` (Kat İrtifakı / Malik Listesi) Veri Modeli (`src/core/model/malik.ts`):**
  - `interface Malik { bbAnahtari: string; adSoyadVeyaUnvan: string; tcKimlikVeyaVergiNo?: string; hissePay: bigint; hissePayda: bigint; not?: string; }`
  - Bir bağımsız bölümde birden fazla hissedar (`Malik`) bulunabilir; bir BB içindeki malik hisseleri toplamı `BigInt` kesir aritmetiği ile hesaplanır ve `∑(hissePay / hissePayda) ≠ 1` ise **`V-208 BİLGİ`** üretilir (GML doğrulamasını engellemez).
  - **GML Yasağı:** Malik bilgileri **yalnızca** proje dosyasında (`.tkgm3b` / `.tkgm3d`) ve kullanıcının kendi dışa aktardığı malik/kat irtifakı listesi raporlarında tutulur; **TKGM CityGML (`.gml`) dosyasına asla yazılmaz**.
- **`K83` İptali:** `stripPersonalData.ts` modülü kullanıcı kararıyla iptal edilmiş ve `M0` kapsamından çıkarılmıştır.

### A.5 Sabitler, Geometri, Hesaplar ve 15 Resmi Dosya Kilidi
- `/public/assets/aistudio/` altındaki `ornek6_7839a667.xml` ve 14 adet `codelists/*.xml` dosyası **bayt-bayt** `fixtures/ornek6.gml` ve `resources/codelists/<ad>.xml` olarak kullanılır; `DOSYA_LISTESI_1e8e75ac.txt` içindeki SHA-256 özetleri birim testiyle kilitlenir.
- `CLAUDE12 Ek-A §A.4 – §A.7` maddelerinin tamamı aşağıdaki **Bölüm 3 (`K01–K100`)**, **Bölüm 4 (`V-001–V-216`)** ve **Bölüm 5 (`§3.1–3.13` XML Şablonları)** içinde eksiksiz yer almaktadır.

---

## BÖLÜM 3: KESİNLEŞMİŞ KURALLAR TABLOSU (`K01 – K100`, TAM 101 SATIR — `K45a` DAHİL)

> **Kaynak Garantisi (`N37` Onarımı):** `K01–K69` (ve `K45a`) satırlarının **Başlık (`Kural`)**, **Değer / Davranış** ve **Kaynak** sütunları `/public/assets/aistudio/claude_uygulama_sartnamesi_v3_58f23bf6.md` (satır 324–396) içinden **kelimesi kelimesine** alınmıştır; sonraki turlarda (`N1–N36` ve `OY-01..OY-12`) oybirliğiyle eklenen güncellemeler köşeli parantez içinde `[v3.5.4 Notu: ...]` olarak yanına eklenmiştir. `K70–K100` ise 6–12. turlarda kesinleşen 31 kuraldır.

| Kod | Kural | Değer / Davranış | Kaynak |
|---|---|---|---|
| **K01** | GML sürümü | CityGML 2.0 + GML 3.1.1 (`http://www.opengis.net/gml`). GML 3.2 yasak (-904) | ÖLÇÜLDÜ 9/9, HATA |
| **K02** | Kodlama | UTF-8, **BOM'suz**, ilk satır `<?xml version="1.0" encoding="utf-8"?>`, satır sonu CRLF (ÖNERİ; örneklerin hepsi CRLF) | ÖLÇÜLDÜ 9/9 |
| **K03** | Dosya adı | `M-` + constructionID + `.gml` | REHBER, HATA |
| **K04** | Dosyada bina sayısı | Tam 1 `bldg:Building` | HATA |
| **K05** | cityObjectMember | ≥ 4 (MB + ≥1 K + ≥1 BB + MBG) | HATA |
| **K06** | CRS | Yalnız `gml:Envelope` üzerinde `srsName="EPSG:525x" srsDimension="3"`. Polygon ve MultiSurface'de srsName **yasak** | ÖLÇÜLDÜ, HATA |
| **K07** | EPSG | DOM 27→5253, 30→5254, 33→5255, 36→5256, 39→5257, 42→5258, 45→5259 | REHBER |
| **K08** | Koordinat aralığı | 300000 < Y(easting) < 700000 ve 2500000 < X(northing) < 5000000 | KURAL-2021 |
| **K09** | Koordinat hane | Tam 3 ondalık (`123.456`) *[v3.5.5 Notu (`OY-02`, `CLAUDE13 §2.2`): Üretimde her zaman `toFixed(3)`; okumada 1–12 hane kabul edilir ve `≠ 3` hane (`<3` veya `>3`) yalnızca `BİLGİ (B)` düzeyindedir, `HATA` değildir]* | HATA (örnekler 1–12 hane; en katı kural seçildi) |
| **K10** | Yükseklik | Ortometrik (TUREF), gerçek kotlar. Yerel 0-tabanlı kot **yasak** | REHBER; BAŞARISIZ örnekte z = 0.63–12.0 |
| **K11** | Envelope | Tüm geometri **ve TIC** dahil 3B min/max. Z farkı < 900 m, XY farkı < 1000 m, alan > 0, lower < upper | HATA, KURAL-2021 |
| **K12** | gml:id | Yalnız listedeki nesneler, Polygon ve LinearRing'ler. Önek + `_` + küçük harf GUID, süslü parantez yok. Tekrar yok | REHBER, ÖLÇÜLDÜ (0 tekrar) |
| **K13** | id **olmayacak** elemanlar | `*Surface` elemanları, `MultiSurface`, `Solid`, `CompositeSolid`, `CompositeSurface`, `MultiCurve`, `LineString` | ÖLÇÜLDÜ (0 adet), HATA |
| **K14** | gml:name | Yalnız listedeki nesneler ve yüzey elemanları (Duvar, Çatı, Zemin, Taban, Tavan, İçDuvar, DışTaban, DışTavan). Polygon'a ad yok | REHBER |
| **K15** | Bina `buildingType` | 1001 (kilitli) | HATA |
| **K16** | Bina `geometrySuitability` | 1006 (kilitli) | HATA, ÖLÇÜLDÜ 9/9 (Başarısız: 1005) |
| **K17** | Bina `maksIntegrationState` | 1003 | ÖLÇÜLDÜ, REHBER |
| **K18** | Bina `tenderRegistrationNumber`, `architecturalPlanID` | Boş: `<gen:value/>` | HATA, ÖLÇÜLDÜ (Başarısız: dolu) |
| **K19** | constructionID | `<takbisPropertyIdentityNumber>-<HARF>`. Harf A, B, … (29'dan sonra AA, AB…). Mimari bina hep **Ana Yapı** (harf) | REHBER, HATA |
| **K20** | BB `geometrySuitability` | 1001 (varsayılan) / 1002 (alan uyumsuzluğu + additionalNote) | KODLİST, HATA |
| **K21** | BBK ve Balkon/Teras `geometrySuitability` | 1001 (kilitli) | HATA |
| **K22** | BB `integrationState` | 1004 | HATA, ÖLÇÜLDÜ |
| **K23** | BB `maksIntegrationState` | 1003 | ÖLÇÜLDÜ, REHBER |
| **K24** | BB `takbisPropertyIdentityNumber` | -1 | REHBER, ÖLÇÜLDÜ |
| **K25** | BB `blockName` | Projedeki blok adı **aynen**; yoksa `-1`. Boş bırakılamaz | KILAVUZ Sürd. md.8, ÖLÇÜLDÜ |
| **K26** | BB `entrance` | Projedeki giriş; yoksa **boş** `<gen:value/>` | ÖLÇÜLDÜ |
| **K27** | `propertyLot` | string, `pay/payda`, tek adet, boş olamaz, pay ≤ payda | KILAVUZ Sürd. md.9 |
| **K28** | `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition` | string, BB içinde **tam 1'er adet**. `registeredInstallation` boş olabilir | KILAVUZ Sürd. md.10–12 |
| **K29** | `independentSectionCardinalDirection` | Cephe başına 1 eleman, aynı değer tekrarlanamaz | HATA |
| **K30** | Dubleks | Her kattaki parça ayrı `GenericCityObject`, aynı `independentSectionNumber`. Net/brüt alan her parçada **aynı toplam değer**, `calculatedArea` parçaya özel. Giriş katı parçası usage 1001/1002, diğerleri 1003 *[v3.5.4 Notu (`K85`): İkincil parça net/brüt alanı için `repeat` (varsayılan) ve `minusOne` stratejisi desteklenir]* | REHBER, KILAVUZ |
| **K31** | `totalIndependentSectionCount` | Benzersiz BB numarası sayısı *[v3.5.4 Notu (`K84`): Birleşik anahtar `(blockName, entrance, independentSectionNumber, cleanLot, normQuality)` sayısı]* | ÖLÇÜLDÜ (Ornek2: 17 parça → 13) |
| **K32** | Kat `independentSectionCount` | O katın `groupMember` sayısı (= BB parça sayısı) | HATA, ÖLÇÜLDÜ |
| **K33** | Kat `groupMember` | Yalnız BB parçaları (OA değil) | ÖLÇÜLDÜ 9/9, HATA |
| **K34** | storeysAbove + storeysBelow | = Kat nesnesi sayısı | ÖLÇÜLDÜ 9/9 |
| **K35** | MBG | 1 adet, en sonda; üyeler: MB, tüm K, tüm BB | ÖLÇÜLDÜ, HATA |
| **K36** | Kısım `calculatedArea` | Floor_ poligonunun net alanı | ÖLÇÜLDÜ (1.143/1.143) |
| **K37** | Kısım `volume` | Kapalı oda kabuğunun hacmi. Düz tavanda = alan × yükseklik | ÖLÇÜLDÜ (1.020/1.022 düz) |
| **K38** | BB `independentSectionCalculatedArea` | BB küveti alt Floor_ alanı | ÖLÇÜLDÜ |
| **K39** | Balkon `calculatedArea` | Balkon taban kutusu üst yüz alanı | ÖLÇÜLDÜ (151/151) |
| **K40** | `planArea` (BBK, balkon) | Projedeki değer; yoksa `-1.0` | ÖLÇÜLDÜ |
| **K41** | BB net/brüt plan alanı | Projedeki değer; yoksa `-1` | ÖLÇÜLDÜ |
| **K42** | Taban (döşeme) kalınlığı | Projeden; yoksa 0.20 m. Döşeme **üstteki** BB'ye aittir *[v3.5.4 Notu (`K42 rev2`, `N36`): Yeni kat eklenirken mimari kesitten okunan döşeme kalınlığı zorunlu alandır; 200 mm yalnız hızlı öneri butonudur]* | KILAVUZ S.S.S.22, ÖLÇÜLDÜ (0.10/0.12/0.15/0.20) |
| **K43** | Balkon taban kalınlığı | = ilgili BB taban kalınlığı (≥ 0.10) | REHBER, SÜRÜM |
| **K44** | Balkon korkuluk | Yükseklik projeden, yoksa 1.10 m; kalınlık yoksa 0.10 m (≥ 0.05) | REHBER |
| **K45** | Kapı varsayılan | Yükseklik 2.10 m (tabandan). Kat yüksekliği < 2.10 m ise tavanın 0.30 m altına kadar. **Kapı alt kenarı = zFloorTop + 10 mm** (delik duvar poligonunun kenarına asla değmez; v3.1 düzeltmesi) *[v3.5.4 Notu (`K45 rev3`): Projeden girilen değer önceliklidir; girilmezse 2.10 m + mavi `VARSAYILAN` rozeti atanır. Profil `A10` (+10mm), `B50` (+50mm), `C50` (+50mm delik / 0mm nesne)]* | REHBER; ÖLÇÜLDÜ (Ornek6 36/36, Ornek4 126/126, Sincan 311/311 oda kapısı +10 mm; Ornek2 +50 mm; 6 dosyada kenara değen delik 0) |
| **K45a** | Açıklık deliği–poligon sınırı | Hiçbir delik halkası, bulunduğu poligonun dış halkasına değmez (alt ve üst ≥ 10 mm boşluk) *[v3.5.4 Notu: Doğrulamada `< 1 mm` HATA (`V-042a`), `1–9 mm` BİLGİ (`V-042b`)]* | ÖLÇÜLDÜ (0 / ~3.400 delik); OGC/val3dity -205/-206 |
| **K46** | Pencere varsayılan | Mesken: tavana 0.50 m, yükseklik 1.30 m. Ticari: tabandan 0.10 m, tavana 0.10 m. Banyo/WC ve küçük bodrum: tavana 0.50 m, yükseklik 0.50 m *[v3.5.4 Notu (`K46 rev2`): Projeden girilen değer önceliklidir; yoksa varsayılan + mavi rozet]* | REHBER |
| **K47** | Havalandırmaya açılan banyo/WC penceresi | Çizilmez | REHBER |
| **K48** | Kapı/pencere nesnesi | 1 poligon, deliksiz, `lod4MultiSurface`. Halkası, duvardaki delik halkasının **sırasıyla aynı** kopyası | ÖLÇÜLDÜ (>3.000/3.000) |
| **K49** | Açıklık temsilleri | LoD2 WallSurface (delik + nesne) · Kat (delik) · BB küveti (dış delik + iç delik + yan yüzler) · Her komşu Kısım (delik + nesne) | ÖLÇÜLDÜ, REHBER |
| **K50** | Halka yönü | Dış halka dışarıdan bakınca CCW; iç halka ters | KILAVUZ, HATA -208, ÖLÇÜLDÜ |
| **K51** | LoD0 | FootPrint z = TIC en üst z (1 mm). RoofEdge z = en üst kat tavanı = çatının en alçak noktası (1 mm). Çıkma balkonlar hariç. Blok başına ayrı poligon olabilir | REHBER, HATA, SÜRÜM |
| **K52** | LoD1 | CompositeSolid. Yer üstü (FootPrint ↔ RoofEdge) + varsa yer altı (FootPrint ↔ en alt taban). Büyük alanlı kontur referans. Poligonlar satır içi, `Lod1Poligon_` | REHBER, HATA |
| **K53** | LoD2 | boundedBy: 1 RoofSurface (n poligon), 1 GroundSurface, n WallSurface (kat ve kırılım başına), OuterFloor ve OuterCeiling. `lod2MultiSurface` = tümüne xlink | ÖLÇÜLDÜ, REHBER |
| **K54** | TIC | `lod2TerrainIntersection/MultiCurve/curveMember/LineString/posList`. Kapalı. Aplikasyon 3B köşeleri. **30 cm sıklaştırma yok** | SÜRÜM v2.0, ÖLÇÜLDÜ |
| **K55** | Kat geometrisi | `grp:geometry/MultiSurface`. Döşeme kutusu (`Floor_`) + dış duvarlar (`Wall_`) döşeme üstünden kat tepesine, delikli. Tavan yok. ≥3 Wall_, ≥1 Floor_ *[v3.5.5 Notu (`OY-01`, `N26`, `CLAUDE13 §2.3`): 18 gerçek kabul dosyasında `44/44` kat `Biçim C` (iki yatay `Floor_` poligonu + dikey döşeme kenar poligonu yok + duvar `zFloorBottom`'dan başlar) olarak ölçülmüştür; yeni üretimde varsayılan **`Biçim A` (`A10`)** olup `Biçim B` (`B50`) ve `Biçim C` (`C50`) profil seçeneğidir]* | HATA, ÖLÇÜLDÜ. Biçim B: Ornek2, Ornek5, Sincan(başarılı). Biçim A: Ornek6, Ornek4, Ornek1, Amasya(başarılı). **İkisi de kabul ediliyor** |
| **K56** | BB küveti | `gen:lod2Geometry/MultiSurface`. Döşeme kutusu (`Floor_`) + iç ve dış duvar yüzleri + açıklık yan yüzleri + duvar üst halkası (`Wall_`). Tavan yok. Her poligon ayrı surfaceMember | ÖLÇÜLDÜ, REHBER |
| **K57** | Kısım kabuğu | `lod4MultiSurface` (xlink) + boundedBy: 1 FloorSurface, ≥3 InteriorWallSurface (OA'da dış cephe WallSurface), 1 CeilingSurface | HATA, ÖLÇÜLDÜ |
| **K58** | Oda yüksekliği | ≥ 1.5 m (en yüksek nokta; bkz. H18) | HATA |
| **K59** | İç Yapı | `bldg:roomInstallation/bldg:IntBuildingInstallation`, `lod4Geometry`. Taban, duvar ve tavan kapalı. Oda tabanını **delmez** | ÖLÇÜLDÜ (10/10, 15/15) |
| **K60** | Kod listeleri | Çalışma anında URL'den, önbellekli *[v3.5.4 Notu (`CLAUDE12 §4.4 md.12`, `K91`): Otomatik ağ isteği yasaktır; 14 XML dosyası `resources/codelists/*.xml` olarak gömülüdür ve çevrimdışı okunur]* | KILAVUZ, CLAUDE12 |
| **K61** | Büyük harf | Üretici metinleri Türkçe büyük harf; `registeredFloorDefinition` aynen | KILAVUZ, ÖLÇÜLDÜ |
| **K62** | Onay tarihi yoksa | Belge tarihi; o da yoksa `1900-01-01` *[v3.5.4 Notu (`K86 rev2`): Otomatik `1900-01-01` yazılırsa mavi bilgi rozeti gösterilir]* | KILAVUZ S.S.S.27 |
| **K63** | Sütun | > 50 cm ise çizilir; yuvarlak = 12-gen; OA'da çizilmez | KILAVUZ S.S.S.18 |
| **K64** | `buildingHeight` | Projeden, kot noktasından saçağa. `doubleAttribute`, 2 hane, 0 < h < 950 *[v3.5.4 Notu (`K64 rev2`): Geometriyle ezilmez; beyan değeridir]* | ÖLÇÜLDÜ, REHBER, KURAL-2021 |
| **K65** | `roofProjectionArea` | Çatı poligonlarının 2B izdüşüm birleşiminin alanı, 2 hane (saçak dahil) *[v3.5.4 Notu (`K65 rev2`): İçe alınan dosyada `≤ %5` fark BİLGİ]* | REHBER; ÖLÇÜLDÜ Ornek6: 120.79 ≠ RoofEdge 91.34 |
| **K66** | `elevatorCount` | Asansör sayısı, yoksa 0 | REHBER |
| **K67** | Texture/Appearance | **Yazılmaz** (zorunlu değil; yazılırsa PNG ve ParameterizedTexture kuralları devreye girer) | ÖNERİ |
| **K68** | `measuredHeight` | Yazılmaz | ÖLÇÜLDÜ 9/9 |
| **K69** | Bina–parsel | Bina tabanı MEGSİS parselini kesmeli; ada/parsel numaraları eşleşmeli | HATA (yalnız TKGM'de) |
| **K70** | İki kayıt modu (Düzeltme vs Normalize) | İçe alınan GML düzenlenirken varsayılan **Düzeltme Modu**dur (kaynak dosyanın `pos`/`posList`, `≥3` ise ondalık hane, kat biçimi `A/B/C`, kapı stili `A10/B50/C50` ve `GroundSurface` yönü korunur). **Normalize Kayıt** ise `posList` + `3` ondalık + seçili profil ile yazar (`OY-02`). | CLAUDE7–12, ÖLÇÜLDÜ |
| **K71** | İç-oda (oda içinde oda) topolojisi | Bir BBK tamamen başka bir BBK'nın içinde yer alıyorsa (örn. yatak odası içindeki ebeveyn banyosu), dış odanın `Floor_` ve `Ceiling_` poligonlarında iç odanın dış sınırı `gml:interior` (delik) olarak açılır. | CLAUDE6–11, ÖLÇÜLDÜ (`Ornek1`, `Ornek2`) |
| **K72** | Dubleks iç merdiven boşluğu | Çok katlı BB'de üst kat döşemesinde merdiven yırtığı varsa, üst kat BB küveti ve oda tabanından bu boşluk `gml:interior` olarak düşülür; `independentSectionCalculatedArea` her parçanın kendi net alt taban alanıdır. | CLAUDE6–11, REHBER |
| **K73** | Bitişik nizam / sağır duvar (`1009`) | Komşu parsele bitişik penceresiz cephe veya tamamen içte kalan cephe için `independentSectionCardinalDirection = 1009` (Kapalı Cephe) atanır. | CLAUDE6–11, KODLİST |
| **K74** | Kademeli temel ve eğimli arazi TIC | Kademeli tabanda `GroundSurface` her kademede ayrı `Ground_` poligonu içerir; `LoD0 FootPrint` kotu `max(TIC z)` (±1 mm) ile eşlenir. | CLAUDE6–11, REHBER |
| **K75** | Çok bloklu parsel proje konteyneri (`.tkgm3d`) | TKGM'ye her blok ayrı `M-<constructionID>.gml` olarak yüklenir (`K04`); ancak uygulama çok bloklu siteleri tek `.tkgm3d` proje dosyasında yönetip toplu ZIP/GML olarak dışa aktarabilir. | CLAUDE6–11, 2025/2 Genelgesi m.4/3 |
| **K76** | Geometri motoru sayısal kararlılık (Grid Snap) | 2B/3B boolean ve kesim işlemlerinde kayan nokta hatasını önlemek için tasarım koordinatları `1 mm` (`0.001 m`) tam sayı ızgarasına (`bigint` / güvenli tam sayı) kilitlenir; GML çıktısında `toFixed(3)` metreye çevrilir. | CLAUDE6–12 |
| **K77** | Boş GML şablonu (`ExportEmptyShell`) yasağı | Geometri olmadan yalnız öznitelik içeren boş GML şablonu dışa aktarmak (`-902` hatası ürettiği için) yasaktır. | CLAUDE7, HATA -902 |
| **K78** | `GroundSurface` zorunluluğu ve halka yönü | Üretimde her binada **tam 1 adet** `bldg:GroundSurface` (`gml:name = "Zemin"`) yazılır ve dış halkası dışarıdan (alttan) bakınca CCW (üstten bakınca CW, `nz ≈ -1`) yönlüdür. Doğrulamada `nz > 0` ise `V-209 BİLGİ` verilir (`N22`). | CLAUDE7–12, N22 |
| **K79** | Üretici uyumluluk profilleri (`A10`, `B50`, `C50`) | Üretimde 3 profil desteklenir: **`A10` (Varsayılan — `OY-01`):** Kat Biçim A + kapı deliği/nesnesi `+10 mm`; **`B50`:** Kat Biçim B + kapı deliği/nesnesi `+50 mm`; **`C50`:** Kat Biçim C + kapı deliği `+50 mm`, kapı nesnesi `0 mm` (`zFloorTop`). | CLAUDE8–12, N26 |
| **K80** | `Door` / `Window` halka kopyası ve ayrı ID | Kapı ve pencere poligonunun dış halkası, duvardaki delik halkası (`DoorLinearRing_` / `WindowLinearRing_`) ile **aynı köşe sırasına** sahip olmalı, ancak **farklı `gml:id`** taşımalıdır. | CLAUDE7–12, N10 |
| **K81** | BB kapısı (`doorUsage = 1003`) çift temsil kuralı | Bağımsız bölüm giriş kapısı (`1003`), hem açıldığı Ortak Alan (`OA_`) duvarında hem de ilgili BB Kısmı (`BBK_`) duvarında delik + `bldg:Door` nesnesi olarak yer alır. Müstakil binada dışarıdan doğrudan girilen kapı `1001` veya `1003` olabilir (`V-138` apartmanda HATA, müstakilde UYARI). | CLAUDE8–12, N18 |
| **K82** | Çatı katı eğik tavan hacim ve alan hesabı | Eğik tavanlı (çatı arası) odalarda `calculatedArea` taban (`Floor_`) alanıdır; `volume` ise taban poligonunun eğik tavan düzlemleriyle kesilmiş gerçek 3B kapalı prizma hacmidir (`manifold-3d` / prizma integrali). | CLAUDE8–12, N19 |
| **K83** | **[İPTAL — Kullanıcı Kararı (`CLAUDE13 §1`)]** *(Eski: Kişisel veri `sender` temizleme kuralı)* | **Kullanıcı kararıyla iptal edilmiştir (`CLAUDE13 §1`).** `stripPersonalData.ts` modülü yazılmaz ve `M0` kapsamından çıkarılmıştır. | CLAUDE13 §1 (Kullanıcı Kararı) |
| **K84** | Benzersiz BB kimliği ve arsa payı (`BigInt`) | Bir BB'nin tekil kimliği `(blockName, entrance, independentSectionNumber, cleanPropertyLot, normalizedQuality)` 5'lisidir. Arsa payları `BigInt` (`pay/payda`, `gcd` sadeleştirmeli) ile toplanır; toplam `≠ 1` ise `V-199 BİLGİ`, aynı BB no altında farklı pay/nitelik varsa `V-212 UYARI` verilir (`N32`). | CLAUDE9–12, N20, N32 |
| **K85** | Çok katlı BB (Dubleks/Tripleks) alan stratejisi | Çok parçalı BB'lerde ana parçaya proje net/brüt alanı yazılır; ikincil parçalarda kullanıcı seçimine göre **`repeat`** (varsayılan: aynı değeri tekrarla — `Ornek2`) veya **`minusOne`** (`-1` yaz — `662P0J`) uygulanır. | CLAUDE9–12, N28 |
| **K86** | Mimari proje onay tarihi (`architecturalProjectConfirmationDate`) | Yeni projede onay tarihi kullanıcıdan zorunlu istenir; "Belgede tarih yok" işaretlenirse `1900-01-01` (`S.S.S. 27`) atanır ve arayüzde mavi `VARSAYILAN (1900-01-01)` rozeti gösterilir (`N31`). | CLAUDE10–12, N31 |
| **K87** | İçe alınan GML'den üretici profili tespiti (`detectProducerProfile`) | GML okunduğunda kat biçimi (`A/B/C`), kapı alt ofseti (`10/50 mm`), ondalık hane sayısı ve `pos`/`posList` tercihi otomatik ölçülür (üretici yazılıma isim verilmez, yalnız teknik profil saklanır). | CLAUDE10–12, D12-S3 |
| **K88** | **Tapu / Beyan Verileri ve Malikler (`K88-yeni` — Kullanıcı Kararı `CLAUDE13 §1`)** | `independentSectionNumber`, `propertyLot`, `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition`, `maksIdentityNumber` ve **malikler (`Malik`)** kullanıcı verisidir: elle girilir, tablodan/listeden yapıştırılır ve her zaman serbestçe düzenlenir (hiçbir alan kilitlenmez). İsteğe bağlı `otomatikOneri` ayarı (varsayılan `kapalı`) yalnız kullanıcı onayıyla yazar. Malik verisi (`hissePay/hissePayda: bigint`) yalnız proje dosyasında (`.tkgm3b`/`.tkgm3d`) ve raporlarda tutulur; **GML'e asla yazılmaz**. | CLAUDE13 §1 (Kullanıcı Kararı) |
| **K89** | Kanonik model özeti (`CanonicalHash` — SHA-256) | Doğrulama raporu; tüm geometri (mm), tüm öznitelikler, seçili üretici profili, 14 kod listesi özeti ve şema sürümünden oluşan deterministik **SHA-256 kanonik özete** bağlanır. Kamera/arayüz durumu özeti değiştirmez; model değişirse özet değişir. | CLAUDE10–12 |
| **K90** | Doğrulama ciddiyet (`Severity`) disiplini | Resmi TKGM kılavuzu/hata tablosunda veya gerçek ret dosyasında (`GML_M-17273333-F.gml`) kanıtı olmayan hiçbir kurala `HATA (H)` ciddiyeti verilmez (`UYARI` veya `BİLGİ` olur). | CLAUDE9–12, Ek-A §A.7 |
| **K91** | Sıfır çalışma anı ağ isteği (Zero Network / Offline-First) | Uygulama çalışma anında TKGM'ye, Gemini API'ye (`@google/genai`), CDN'e veya herhangi bir dış sunucuya otomatik ağ isteği (`fetch`) yapmaz. Testlerde `fetch` çağrısı yakalanırsa test başarısız sayılır. | CLAUDE10–12, Mutlak Kural 5 |
| **K92** | Deterministik `uuidv5` kimlik üretimi | Tüm `gml:id` değerleri proje sabit tohumu + nesne/poligon yolundan deterministik `uuidv5` ile üretilir. Aynı model iki kez dışa aktarıldığında bayt-bayt aynı GML dosyası oluşur. | CLAUDE11–12, Mutlak Kural 6 |
| **K93** | İç referans (`xlink:href`) bütünlüğü | Dosya içi tüm `xlink:href` referansları `#` ile başlar ve hedef `gml:id` dosya içinde tam 1 kez tanımlanmış olmalıdır. | CLAUDE11–12, Ek-A §A.2 |
| **K94** | Büyük GML dosyaları için akış/worker ayrıştırması | `40 MB+` (`Ornek3`) dosyaların arayüzü dondurmadan `< 10 sn` içinde açılması için okuma ve doğrulama işlemleri Web Worker / arka plan iş parçacığında çalışır. | CLAUDE6–11, §10.7 |
| **K95** | Geometri onarım işlemlerinin izlenebilirliği | Otomatik geometri onarımları (ardışık çift nokta silme, halka kapatma, halka yönü çevirme) sessizce yapılmaz; kullanıcıya öncesi/sonrası gösterilip onaylatılır ve loglanır. | CLAUDE8–11 |
| **K96** | Harici doğrulama araçları (`val3dity`) entegrasyonu | `val3dity.exe` yalnızca Electron masaüstü sürümünde (`PlatformAdapter` üzerinden), kullanıcı kendi bilgisayarına kurmuşsa isteğe bağlı harici kontrol olarak çağrılır; kurulu değilse dahili doğrulayıcı tam kapasite çalışır. | CLAUDE6–12, §1.3 |
| **K97** | Bilinmeyen / şema dışı durumlarda `ACIK_SORULAR.md` kuralı | Örnek dosyada veya normatif şartnamede karşılığı olmayan hiçbir öznitelik veya sınıf uydurulmaz; `docs/ACIK_SORULAR.md` dosyasına kaydedilir. | CLAUDE12, Mutlak Kural 1 |
| **K98** | Kural–Kod–Test izlenebilirlik zorunluluğu (`npm run trace`) | Her kural fonksiyonunun üstünde `// Kxx` veya `// V-xxx` yorumu, her birim testin adında kural kodu bulunur ve `npm run trace` komutu kural kapsama matrisini üretir. | CLAUDE12, §4.4 md.3 |
| **K99** | Öznitelik beyaz listesi kilidi (`ALLOWED_GENERIC_ATTRIBUTES`) | GML yazıcısı yalnız `docs/KARARLAR.md §A.3` içindeki 45 `gen:*Attribute` adını/tipini yazabilir; liste dışı öznitelik yazma girişimi çalışma ve test anında engellenir. | CLAUDE12, Mutlak Kural 2 |
| **K100** | Platform mimarisi (`src/core` Saf TS + Electron Teslimi) | `src/core/` tamamen platform-bağımsız saf TypeScript olarak yazılır; geliştirme AI Studio web önizlemesinde yapılır, nihai ürün Electron ile Windows `.exe` olarak paketlenir (`OY-11`). | CLAUDE12, §1.2 |

---

## BÖLÜM 4: DOĞRULAMA MOTORU KURAL KATALOĞU (`V-001 – V-216`, TAM 175 SATIR)

> **Kaynak Garantisi (`N37` Onarımı):** Aşağıdaki `6.2 – 6.13` alt tablolarındaki **150 satır**, `/public/assets/aistudio/claude_uygulama_sartnamesi_v3_58f23bf6.md` (satır 1213–1420) içinden **tek bir numara bile atlanmadan birebir** alınmıştır (`V-014..019`, `V-031..039`, `V-059`, `V-105..108`, `V-127..129`, `V-139`, `V-150..159`, `V-174`, `V-180..188` dahil tam 150 satır). Sonraki turlarda (`N1–N36`) eklenen **25 yeni kural** (`V-042a`, `V-042b` ve `V-196..V-216` — `V-198a/b` dahil) `6.4` sonunda ve `6.14` altında yer almaktadır. **Toplam = 150 + 25 = 175 tam satır.**
> **Kapsam:** `Y` = Yalnız GML dosyasından (yerel, çevrimdışı), `K` = Kullanıcı girdisi/aplikasyon ile, `T` = Yalnız TKGM sunucusunda (bilgi amaçlı). **Düzey:** `H` = Hata, `U` = Uyarı, `B` = Bilgi.

### 4.1 Dosya ve Şema (`6.2` — 8 Kural: `V-001 .. V-008`)

| ID | Kontrol | Kapsam | Düzey | TKGM mesajı / kaynak |
|---|---|---|---|---|
| **V-001** | Dosya adı `M-` ile başlıyor ve `.gml` ile bitiyor | Y | H | KURAL-2021 "M- ile başlamalıdır" |
| **V-002** | Dosya adındaki YapıID = constructionID | Y | H | "Dosya adı ile yapıID uyuşmuyor." |
| **V-003** | UTF-8, iyi biçimli XML | Y | H | "Geçersiz gml dosyası.-901" |
| **V-004** | GML ad alanı 3.1.1 (`http://www.opengis.net/gml`) | Y | H | "Gml dosyası versiyonu desteklenmiyor.(v3 desteklenmez.)-904" |
| **V-005** | CityGML 2.0 XSD şema doğrulaması (yerel XSD kopyalarıyla, ağ erişimi olmadan) | Y | H | "-- Şematik kontrolde hatalar var." |
| **V-006** | Boş geometri yok (boş posList, boş MultiSurface) | Y | H | "Gml dosyası boş geometriler bulunduramaz.-902", "MultiSurface içerisinde surfaceMember bulunamadı." |
| **V-007** | Texture/Appearance yok (varsa PNG, ParameterizedTexture, tek dosya ve adı GML ile aynı) | Y | U | texture mesajları |
| **V-008** | Tek `core:CityModel` | Y | H | KURAL-2021 |

### 4.2 CityModel ve Envelope (`6.3` — 12 Kural: `V-010 .. V-021`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-010** | Tam 1 `bldg:Building` | Y | H | "Sadece bir bina olmalıdır." |
| **V-011** | ≥ 4 `cityObjectMember` | Y | H | "En az 4 tane cityObjectMember olmalıdır." |
| **V-012** | ≥ 1 Kat, ≥ 1 BB | Y | H | "En az 1 tane kat olmalıdır.", "En az 1 tane bağımsız bölüm olmalıdır." |
| **V-013** | Tam 1 MBG | Y | H | KURAL-2021 |
| **V-014** | Tek Envelope; `srsName` var ve `EPSG:5253`…`5259` | Y | H | "SrsName geçersiz.", "EPSG kodu yanlış." |
| **V-015** | `srsDimension="3"` | Y | H | "Dış çerçeve geçersiz. SrsDimension özelliği bulunamadı.", "SrsDimension değeri yanlış.(Beklenen : 3)" |
| **V-016** | lower < upper (her eksen) | Y | H | "Dış çerçeve geçersiz. Alt köşe koordinatları, üst köşe koordinatlarından daha büyük." |
| **V-017** | Z farkı < 900 m; XY farkı < 1000 m; alan > 0 | Y | H | "Köşeler arası yükseklik farkı", "Köşeler arası mesafe çok fazla.", "Dış çerçeve alanı çok düşük." |
| **V-018** | Tüm geometri ve TIC Envelope içinde | Y | H | "Yüzey elemanı, tanımlanan dış çerçevenin(envelope) içinde değil.", "Terrain kesişim eğrisi, … içinde değil." |
| **V-019** | EPSG dilimi ile easting tutarlı: `|E − 500000| ≤ 200000`; dilim DOM ile parsel boylamı eşleşmeli | K | H | "EPSG kodu, arayüzden girilen EPSG kodları ile uyuşmuyor." |
| **V-020** | Koordinat aralığı 300000 < E < 700000, 2500000 < N < 5000000 | Y | H | "Geometrinin ({...}) koordinat (TM) değerleri geçersiz." |
| **V-021** | Envelope dışında hiçbir elemanda `srsName` yok | Y | H | "Poligonlar SrsName değerine sahip olmamalıdır.", "MultiSurfacelar SrsName değerine sahip olmamalıdır." |

### 4.3 Koordinat ve Halka Geometrisi (`6.4` — 12 Kural: `V-030 .. V-041` + 2 Yeni Kural: `V-042a, V-042b` = 14 Kural)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-030** | Her koordinat tam 3 ondalık *[v3.5.5 Notu (`CLAUDE13 §2.2`): Üretimde tam 3 hane zorunlu (`H`); içe alınan dosyada `≠ 3` hane (`<3` veya `>3`, 1–12 hane) yalnızca `BİLGİ (B)` düzeyindedir, `HATA` değildir]* | Y | H/B | "Koordinatlar noktadan sonra 3 basamağa sahip olmalıdır.(Örnek : 123.456)" |
| **V-031** | Halka ≥ 3 eşsiz nokta (+ kapanış = ≥ 4 pos) | Y | H | "-101", "{...} linearRing 3ten daha az noktaya sahip." |
| **V-032** | Ardışık eşit nokta yok | Y | H | "-102" |
| **V-033** | Halka kapalı (ilk = son) | Y | H | "-103" |
| **V-034** | Halka kendini kesmez | Y | H | "-104" |
| **V-035** | Poligon halkaları birbirini kesmez | Y | H | "-201", "Interior LinearRingler kesişiyor." |
| **V-036** | Özdeş halka yok | Y | H | "-202" |
| **V-037** | Düzlemsellik (sapma ≤ 1 mm önerilir; val3dity 1 cm) | Y | H | "-203", "{...} linearRing planar değil." |
| **V-038** | Köşe aralığı ≥ 10 mm | Y | U | "-204" |
| **V-039** | İç halka dış halkayı bölmez; içinde kalır; iç halkalar iç içe değil | Y | H | "-205", "-206", "-207" |
| **V-040** | İç halka yönü dış halkaya ters | Y | H | "-208" |
| **V-041** | Aynı yüzeye ait poligonlar kesişmez | Y | H | "Aynı yüzeye ait poligonlar kesişmemelidir." |
| **V-042a** | İç halka (delik) ile dış halka arasındaki en küçük mesafe `< 1 mm` (delik kenara değiyor/kesiyor) | Y | H | OGC `-205/-206`, `K45a` (6 resmi + 18 gerçek dosyada 0 ihlal) |
| **V-042b** | İç halka (delik) ile dış halka arasındaki en küçük mesafe `1 mm ≤ d < 10 mm` | Y | B | `K45a`, üretici profilinden daha dar eşik bilgisi |

### 4.4 ID, Ad ve Sınıf (`6.5` — 15 Kural: `V-050 .. V-064`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-050** | gml:id tekil | Y | H | "{...} değeri birden fazla bulundu." |
| **V-051** | GUID biçimi (`[0-9a-f]{8}-[0-9a-f]{4}-…`), süslüsüz | Y | H | KURAL-2021 |
| **V-052** | Nesne önekleri (MB_, K_, BB_, BBK_, OA_, BBKIY_, OAIY_, BLKN_, TRS_, MBG_, KAPI_, PEN_) | Y | H | "ID, {...} değeri ile başlamalıdır.", "Bina IDsi geçersiz." |
| **V-053** | Poligon önekleri yüzey türüne uygun (WallSurface/InteriorWall → `Wall`/`InteriorWall`, Roof → `Roof`, Ceiling → `Ceil`, Floor → `Floor`, Ground → `Ground`) | Y | H | "… ID atama hatası (… ile başlaması gerekiyor)", "Poligon ID önek hatası." |
| **V-054** | Her Polygon ve LinearRing'de id var | Y | H | "ID bulunmayan poligon tespit edilmiştir.", "LinearRing ID LinearRing_ ile başlamalıdır." |
| **V-055** | Açıklık halkaları `DoorLinearRing_` / `WindowLinearRing_` | Y | H | "LinearRingin IDsi, WindowLinearRing_ ile başlamalıdır." (Door için de) |
| **V-056** | İzin verilmeyen elemanlarda id yok (K13) | Y | H | "{...} geometri elementinin IDsi olmamalıdır." |
| **V-057** | Sınıf değerleri (MimariBina, Kat, BagimsizBolum, BagimsizBolumKisim, OrtakAlan, BagimsizBolumKisimIcYapi, OrtakAlanIcYapi, Balkon, Teras, MimariBinaGrup) | Y | H | "Sınıf değeri geçersiz. (Beklenen: … Girilen: …)" |
| **V-058** | Nesne adları 3.12'ye uygun | Y | H | "Name değeri yanlış.", "İsimlendirme hatası." |
| **V-059** | Yüzey adları (Duvar, Çatı, Zemin, Taban, Tavan, İçDuvar, DışTaban, DışTavan) | Y | H | "Yüzey (surface) name değeri hatalı." |
| **V-060** | Listede olmayan generic öznitelik yok (`docs/KARARLAR.md §A.3` beyaz listesi) | Y | H | "{...} özelliği proje kapsamında bulunması gereken özelliklerden değil." |
| **V-061** | Her zorunlu öznitelik tam 1 kez (cardinalDirection ve storeyUsage hariç) | Y | H | "{...} bulunamadı.", "{...} birden fazla bulundu. Sadece bir adet olmalıdır." |
| **V-062** | Öznitelik tipi doğru (string/int/double/date) | Y | H | "{...} geçerli bir değer değil." |
| **V-063** | Kod listesi değerleri listede | Y | H | "{...} değeri kodlistesinin içinde bulunamadı.(Değer: …)" |
| **V-064** | Büyük harf gerektiren alanlar TR büyük harf (`registeredFloorDefinition` hariç — `OY-04`) | Y | U | "{...} değeri büyük harfle yazılmalıdır." |

### 4.5 Mimari Bina Öznitelikleri (`6.6` — 16 Kural: `V-070 .. V-085`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-070** | constructionID = `takbisPropertyIdentityNumber-HARF(LER)` | Y | H | "TakbisPropertyIdentityNumber ile yapıID uyuşmuyor." |
| **V-071** | YapıID harfle bitiyor (Ana Yapı); `buildingType` = 1001 | Y | H | "MimariBina bina tipine 1002 (Diğer Yapı) atanamaz." |
| **V-072** | `geometrySuitability` = 1006 | Y | H | "Sürdürülebilirlik kapsamındaki üretimlerde Bina geometrik uygunluğu 1006 olarak girilmelidir." |
| **V-073** | `tenderRegistrationNumber` boş | Y | H | "…İhaleKayıtNo boş bırakılmalı." |
| **V-074** | `architecturalPlanID` boş | Y | H | "…Mimari plan id boş bırakılmalıdır." |
| **V-075** | `maksIntegrationState` = 1003 | Y | H | REHBER |
| **V-076** | `totalIndependentSectionCount` = benzersiz BB no sayısı | Y | H | "Toplam bağımsız bölüm sayısı gmldeki ile uyuşmuyor." |
| **V-077** | storeysAbove + storeysBelow > 0 ve = Kat nesnesi sayısı | Y | H | "StoreysAboveGround ve StoreysBellowGround toplamı sıfır olamaz.", "Toplam kat adedi ile gml dosyasındaki kat adedi uyuşmuyor." |
| **V-078** | `roofProjectionArea` > 0 | Y | H | KURAL-2021 |
| **V-079** | `roofProjectionArea` ≈ çatı izdüşümü (bilgi: RoofEdge alanı ile farkı; `≤ %5` BİLGİ, `> %5` UYARI) | Y | U/B | "RoofProjectionArea değeri ile RoofEdge elemanından hesaplanan uymuyor." (bkz. Ç12) |
| **V-080** | 0 < `buildingHeight` < 950 | Y | H | KURAL-2021 |
| **V-081** | Onay tarihi `YYYY-MM-DD`, ayırıcı `-` | Y | H | "…tarih formatı geçersiz.", "…değerinde ayırıcı tespit edilemedi." |
| **V-082** | `elevatorCount` ≥ 0 | Y | H | — |
| **V-083** | Ada/parsel/taşınmaz MEGSİS ve TAKBİS ile eşleşiyor | T | H | "Parsel no (…) veritabanı ile uyuşmuyor.", "Binanın çakıştığı parselin ada no bilgisi…", "Parsel servisi null döndü." |
| **V-084** | Aynı konumda kayıtlı başka bina yok | T | H | "Bu pozisyonda BuildingServiste zaten bir bina var." |
| **V-085** | MAKS yapı no doğru | T | H | "Gmldeki {...} değeri ile Makstaki {...} değeri eşit olmalıdır." |

### 4.6 LoD0, LoD1, LoD2, TIC (`6.7` — 19 Kural: `V-090 .. V-108`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-090** | TIC var; MultiCurve/curveMember/LineString | Y | H | "Lod2TerrainIntersection özelliğinin içinde, MultiCurve elemanı bulunamadı." |
| **V-091** | TIC kapalı | Y | H | KURAL-2021 |
| **V-092** | FootPrint ve RoofEdge var; önekler doğru | Y | H | — |
| **V-093** | FootPrint z = max(TIC z) (±1 mm) | Y | H | "TIC'in en üst noktası ile footprintin yüksekliği eşit olmalıdır." |
| **V-094** | FootPrint, TIC'in altında kalmıyor | Y | H | "FootPrint, TIC eğrisinin altında kalmamalıdır." |
| **V-095** | FootPrint, TIC en üstüne en yakın katın tabanı | Y | U | "TIC'in en üst noktasına en yakın olan katın tabanı FootPrint olarak atanmış olmalıdır." |
| **V-096** | RoofEdge tek kotta, = en üst kat tavanı (±1 mm), = çatının en alçak noktası | Y | H | "RoofEdge en üst katın tavanına eşit olmalıdır.", "RoofEdge çatının en alt noktasıyla aynı hizada olmalıdır." |
| **V-097** | FootPrint ve RoofEdge planda örtüşüyor (aynı kontur, farklı kot; kademeli yapıda uyarı) | Y | U | "FootPrint ve RoofEdge üst üste oturmalıdır." |
| **V-098** | LoD1: CompositeSolid → solidMember → Solid → exterior → CompositeSurface → surfaceMember → Polygon (satır içi, xlink yok) | Y | H | "Lod1Solid elemanı içerisinde CompositeSolid bulunamadı." ve benzeri 6 mesaj, "…inline tanımlanmalıdır." |
| **V-099** | LoD1 yer üstü tavanı = RoofEdge z | Y | H | "RoofEdge ile zemin üstü Lod1Solidin tavanı aynı yükseklikte olmalıdır." |
| **V-100** | LoD1 solid'ler değiyor, kesişmiyor, tekrar yok | Y | H | "-501", "-502", "-503" |
| **V-101** | LoD1 kabuk geçerli (kapalı, manifold, dışa yönlü) | Y | H | "-301 … -307", "-401 … -405" |
| **V-102** | LoD1 taban ve tavan poligon sayısı ≤ sınır (ÖNERİ: 1) | Y | U | "Lod1Solid elemetinin tabanında en fazla {...} tane poligon olabilir." |
| **V-103** | LoD2: boundedBy yalnız izin verilen yüzey türleri (Wall, Roof, Ground, OuterFloor, OuterCeiling) | Y | H | "BoundedBy elemanı yüzey, duvar ve çatı yüzeylerini barındırmalı.", "Geçersiz yüzey tipi." |
| **V-104** | Tam 1 RoofSurface elemanı | Y | H | "Çatı yüzeyi sadece 1 tane olmalıdır.", "Çatı sayısı 2den fazla." |
| **V-105** | Tam 1 GroundSurface elemanı | Y | H | "Zemin(ground) yüzeyi 1 tane olmalıdır." |
| **V-106** | ≥ 3 WallSurface | Y | H | "Yan duvar (WallSurface) sayısı 3ten az olamaz." |
| **V-107** | `lod2MultiSurface` xlink'leri boundedBy'daki poligonları gösteriyor; boundedBy'daki her LoD2 poligonu referanslı | Y | H | "Referanslanan geometri elemanı ({...}) BoundedBy içerisinde bulunamadı.", "BoundedBy içerisinde {...} idli poligon bulunamadı." |
| **V-108** | Çatı binayı tamamen örtüyor: RoofEdge ⊂ proj(Roof) | Y | H | REHBER |

### 4.7 Kat (`6.8` — 9 Kural: `V-110 .. V-118`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-110** | `grp:geometry/MultiSurface` var | Y | H | "MultiSurface elemanı, Geometry içerisinde bulunamadı." |
| **V-111** | ≥ 3 Wall_, ≥ 1 Floor_ | Y | H | "Kat geometrisinde en az 3 tane idsi "Wall_" ile başlayan poligon olmalıdır." (Floor için de) |
| **V-112** | parent = MB id | Y | H | "Katın parent değeri binanın IDsine eşit olmalıdır." |
| **V-113** | groupMember'lar var ve BB_ | Y | H | "Referanslanan grup üyesi (groupMember) gml dosyası içinde bulunamadı." |
| **V-114** | `independentSectionCount` = groupMember sayısı | Y | H | "Kat bilgisinde verilen BB sayısı ile gmldeki BB sayısı uyuşmuyor.", "GroupMember sayısı ile bağımsız bölüm sayısı eşit olmalıdır." |
| **V-115** | `storeyNumber` var, ad = `Kat_`+no | Y | H | — |
| **V-116** | `storeyUsage` ≥ 1, kod listesinde | Y | H | — |
| **V-117** | Her dış açıklık için kat duvarında delik | Y | H | "Kat geometrisinde pencereye uygun delik bulunamadı." |
| **V-118** | MAKS kat no | T | U | SÜRÜM v2.49 |

### 4.8 Bağımsız Bölüm (`6.9` — 22 Kural: `V-120 .. V-141`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-120** | `gen:lod2Geometry/MultiSurface` var | Y | H | "MultiSurface elemanı, Lod2Geometry altında bulunamadı." |
| **V-121** | ≥ 3 Wall_, ≥ 1 Floor_ | Y | H | "Bağımsız Bölüm geometrisinde en az 3 tane idsi "Wall_" ile başlayan poligon olmalıdır." |
| **V-122** | Duvar üst kapağı var (çatı katı kesimlilerde gevşek) | Y | H | "Bağımsız bölüm duvarlarının üstü kapalı olmalıdır." |
| **V-123** | Taban kalınlığı ≥ sınır (çatı katı hariç) | Y | H | "Bağımsız bölüm taban kalınlığı en az {...} m olmalıdır." |
| **V-124** | Yan duvarlar taban üstünden başlıyor *[v3.5.4 Notu (`N36`): `zFloorBottom - 1mm ≤ zWallMin ≤ zFloorTop + 1mm`; tam `zFloorBottom`'dan başlıyorsa Biçim C BİLGİ]* | Y | H | "Yan duvarlar, tabanın üstünden başlamalıdır." |
| **V-125** | BB ⊂ Kat (1 mm) | Y | H | "Bağımsız bölüm, kat geometrisinin içinde kalmalıdır." |
| **V-126** | `independentSectionCalculatedArea` = alt taban alanı (±0.01) | Y | H | "Bağımsız bölüm çizim alan, bağımsız bölüm geometrisinin taban alanına eşit değildir." |
| **V-127** | BB alanı ≥ Σ kısım alanı | Y | H | "Bağımsız Bölüm Çizim Alanı, kısım çizim alanlarının toplamından büyük olmalıdır." |
| **V-128** | `partCount` = bağlı BBK sayısı | Y | H | "Bağımsız bölüm kısım sayısı hatalı." |
| **V-129** | `geometrySuitability` ∈ {1001, 1002}; 1001 ise tek değer | Y | H | "…bağımsız bölüm geometrik uygunluk 1001 veya 1002 olmalıdır.", "GeometriUygunluğu 1001 girildi ise başka değer girilemez." |
| **V-130** | `integrationState` = 1004 | Y | H | "…entegrasyon durumu 1004 olmalıdır." |
| **V-131** | `integrationState` ≠ 1001 ise `takbisPropertyIdentityNumber` = -1 | Y | H | "IntegrationState 1001 değil ise, takbisPropertyIdentityNumber -1 değerini almalıdır." |
| **V-132** | `blockName` boş değil | Y | H | KILAVUZ md.8 |
| **V-133** | `propertyLot` `pay/payda`, pay ≤ payda, tek, boş değil | Y | H | KILAVUZ md.9 |
| **V-134** | `registered*` tek ve string | Y | H | KILAVUZ md.10–12 |
| **V-135** | `cardinalDirection` tekrarsız | Y | H | "CardinalDirection aynı değerden birden fazla içeremez." |
| **V-136** | Net plan alanı < brüt plan alanı (ikisi de > 0 ise) | Y | U | KURAL-2021 "Bağımsız Bölüm Brüt Alandan küçük olmalıdır" |
| **V-137** | Her BB'de ≥ 1 pencere (BB'nin herhangi bir kısmında) | Y | H | "Bağımsız bölümde pencere bulunamadı." |
| **V-138** | BB'de doorUsage = 1003 kapı (apartman) | Y | H/U | "Bağımsız bölümde, kapı kullanım amacı 1003 olan bir kapı elementi bulunamadı." |
| **V-139** | Her pencere için BB geometrisinde delik | Y | H | "Bağımsız bölüm geometrisinde pencereye uygun delik bulunamadı." |
| **V-140** | Kısımda 1002 varsa BB'de 1002 | Y | H | "Kısımda olan geometri uyumsuzluk kodu bagimsiz bolumde bulunamadı." |
| **V-141** | MAKS BB no, numarataj no, TAKBİS eşleşmesi | T | H | MAKS ve TAKBİS mesajları |

### 4.9 Kısım (BBK) ve Ortak Alan (OA) (`6.10` — 17 Kural: `V-150 .. V-166`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-150** | `lod4MultiSurface` var, xlink'ler boundedBy'da | Y | H | "{...} içerisinde Lod4MultiSurface elemanı bulunamadı." |
| **V-151** | boundedBy yalnız FloorSurface, InteriorWallSurface, CeilingSurface (OA'da + WallSurface) | Y | H | KURAL-2021 |
| **V-152** | Tam 1 FloorSurface elemanı, tam 1 CeilingSurface elemanı | Y | H | "Taban yüzeyi (FloorSurface) sayısı 1den fazla olamaz.", "Tavan yüzeyi … 1den fazla olamaz." |
| **V-153** | ≥ 3 InteriorWallSurface (OA: InteriorWall + Wall ≥ 3) | Y | H | "Yan duvar (InteriorWallSurface) sayısı 3ten az olamaz." |
| **V-154** | Taban, duvar ve tavan mevcut | Y | H | "Kısım taban,duvar ve tavan yüzeylerine sahip olmalıdır.", "Ortak alan taban,yan duvar ve tavana sahip olmalıdır." |
| **V-155** | `calculatedArea` > 0 ve = taban alanı (±0.01) | Y | H | "CalculatedArea 0dan büyük olmalıdır.", "Verilen calculatedArea ({...}) ile geometriden hesaplanan değer ({...}) uymamaktadır." |
| **V-156** | `planArea` > 0 veya -1 | Y | H | "PlanArea 0dan büyük olmalıdır." |
| **V-157** | \|calc − plan\| / plan ≤ 10% | Y | U | "Hesaplanan alan ile plandan gelen alan eşit değil. (Tolerans %10)" |
| **V-158** | `volume` = geometrik hacim; `volume` > `calculatedArea` | Y | H/U | "Girilen hacim (Volume), geometriden hesaplanan ile eşit değil.", "Hacim değeri hesaplanan alandan büyük olmalıdır." |
| **V-159** | Oda yüksekliği ≥ 1.5 m | Y | H | "Oda yüksekliği 1.5 metreden az olamaz." |
| **V-160** | `independentSectionObjectReference` geçerli BB_ | Y | H | "Referansı verilen bağımsız bölüm bulunamadı." |
| **V-161** | OA `storeyObjectReference` geçerli K_ veya -1 | Y | H | "Referanslanan kat nesnesi bulunamadı." |
| **V-162** | Oda BB'ye değiyor, boşluk ≤ 1 mm, kesişim ≤ 0.1 m² (kesimli çatı katında gevşek) | Y | H | "Oda, bağımsız bölüme değmelidir…" (2 mesaj) |
| **V-163** | Her kısımda ≥ 1 kapı | Y | H | "Kısımda kapı bulunamadı." |
| **V-164** | Kısım açıklıklarının binada karşılığı var (EXT olanlar LoD2'de, aynı hizada) | Y | H | "Kısımdaki pencere objesinin binada karşılığı bulunamadı." (LK_OuterWindowPairNotFound), kapı için de |
| **V-165** | Mükerrer kullanım amacı (aynı BB'de anlamsız tekrar) | Y | U | "Mükerrer kullanım amacı.({...})". DOĞRULANMALI: tam anlamı |
| **V-166** | OA'da ≥ 1 taban ve ≥ 1 tavan | Y | H | "Ortak alanda en az 1 tane tavan olmalıdır." |

### 4.10 Açıklıklar (`6.11` — 5 Kural: `V-170 .. V-174`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-170** | Kapı ve pencere WallSurface veya InteriorWallSurface içinde (`opening`) | Y | H | "Pencere objesi duvar yüzeyinde (WallSurface) olmalıdır." |
| **V-171** | 1 poligon, deliksiz, `lod4MultiSurface` | Y | H | "Pencerede sadece 1 tane poligon bulunmalıdır.", "Pencere deliksiz olmalıdır." (kapı için de) |
| **V-172** | Açıklık poligonu ile duvardaki delik halkası özdeş noktalara sahip | Y | H | "Duvar yüzeyinde pencereye uygun delik bulunamadı." |
| **V-173** | `doorUsage` ve `windowUsage` kod listesinde | Y | H | — |
| **V-174** | Açıklık duvar poligonuyla çakışmıyor (duvar delinmiş) | Y | H | REHBER "overlap olmamalıdır" |

### 4.11 Balkon ve Teras (`6.12` — 9 Kural: `V-180 .. V-188`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-180** | `lod2Geometry/MultiSurface` var | Y | H | — |
| **V-181** | Taban (FloorSurface) ve yan duvar (WallSurface) var | Y | H | "Balkonlar yan duvar ve tabanlara sahip olmalıdır." |
| **V-182** | Taban kalınlığı ≥ 0.10 ve = BB taban kalınlığı | Y | H | "Balkon zemin kalınlığı çok az.", "Teras zemin kalınlığı çok az.", "Bağımsız bölüm taban kalınlığı ile balkon taban kalınlığı aynı olmalıdır." |
| **V-183** | Yan duvar kalınlığı ≥ 0.05 | Y | H | "Balkon yanduvar kalınlığı en az {...} m olmalıdır." |
| **V-184** | Balkon BB'ye boşluksuz değiyor (1 mm) | Y | H | "Balkon ile bağımsız bölüm arasında boşluk var." |
| **V-185** | Korkuluk tepesi ≤ BB duvar tepesi | Y | H | "Balkon duvarı, bağımsız bölüm duvarından daha uzun olamaz." |
| **V-186** | `geometrySuitability` = 1001 | Y | H | "…balkon geometrik uygunluk 1001 olmalıdır." |
| **V-187** | Teras referansı -1 | Y | H | "Terasın bağımsız bölüm referans değer -1 olmalıdır." |
| **V-188** | Balkon referansı geçerli BB_ | Y | H | "Referansı verilen bağımsız bölüm bulunamadı." |

### 4.12 MBG ve Parsel Düzeyi (`6.13` — 6 Kural: `V-190 .. V-195`)

| ID | Kontrol | Kapsam | Düzey | Mesaj |
|---|---|---|---|---|
| **V-190** | MBG'de MB, tüm K, tüm BB var; hepsi dosyada mevcut | Y | H | "Kat referansı, MimariBinaGrup içinde bulunamadı." ve benzeri 4 mesaj |
| **V-191** | MBG adı ve sınıfı | Y | H | — |
| **V-192** | Aynı parseldeki binalar kesişmiyor (1 m) | K | H | "Aynı parselde kesişen binalar var.", "{...} ve {...} idli binalar yüzde {...} kesişmektedir." |
| **V-193** | Bina tabanı parsel ile kesişiyor | K/T | H | "Binanın tabanı ile bulunduğu parsel kesişmiyor.", "Binanın tabanı ile megsisten gelen parsel geometrisi kesişmelidir." |
| **V-194** | Parseldeki tüm BB'ler üretilmiş | T | H | "Veritabanında bulunan {...} idli bağımsız bölüm, gml dosyalarının içinde bulunamadı." |
| **V-195** | MAKS yapı geometrisi ↔ parsel ve TIC | T | U | SÜRÜM v2.49 |

### 4.13 6–12. Turlarda (`N1–N36`) Eklenen Kurallar (`6.14` — 23 Kural: `V-196 .. V-216`, `V-198a/b` dahil)

| ID | Kontrol | Kapsam | Düzey | Kaynak / Mesaj |
|---|---|---|---|---|
| **V-196** | İç yapı (`BBKIY_`/`OAIY_`) taban, duvar ve tavan yüzeylerine sahip; oda tabanını delmiyor | Y | H | `K59`, ÖLÇÜLDÜ (`Ornek2` 10/10) |
| **V-197** | İç-oda (`K71`) varsa dış odanın `Floor_` ve `Ceiling_` poligonlarında iç odanın dış halkası kadar delik (`gml:interior`) açılmış | Y | U | `K71`, ÖLÇÜLDÜ (`Ornek1`, `Ornek2`) |
| **V-198** | `propertyLot` içinde boşluk karakteri var (örn. `" 98 / 6534 "`) — ayrıştırıcı temizler ve bilgi verir | Y | B | `K84`, `CLAUDE9 N20` |
| **V-198a** | `propertyLot` biçim hatası (`pay/payda` değil), `payda ≤ 0`, `pay < 0` veya `pay > payda` | Y | H | `K27`, `K84`, KILAVUZ md.9 |
| **V-198b** | `propertyLot` içinde `pay == 0` (`0/payda`) | Y | U | `K84`, `CLAUDE10` |
| **V-199** | Benzersiz BB'lerin (`K84`) `BigInt` arsa payı toplamı `∑(pay/payda) ≠ 1` (Çok bloklu parselde blok toplamı `< 1` olması normaldir — `FUA5P9`: `103500/104683`) | Y | B | `K84`, `N20` (`CLAUDE9`: HATA değil **BİLGİ**) |
| **V-200** | Çok katlı BB (dubleks/tripleks) parçaları arasında `independentSectionPlanNetArea` / `GrossArea` tutarlılığı (`repeat` veya `minusOne` stratejisi) | Y | B | `K30`, `K85`, `N28` |
| **V-201** | Zemin kotu ortometrik aralık kontrolü (`minZ < 0.5 m` veya `maxZ > 5000 m` ise yerel `0` tabanlı kot şüphesi) | Y | U | `K10`, `v3 §10.2` (`GML_M-17273333-F.gml`: `0.63–12.02 m`) |
| **V-202** | Sürdürülebilirlik ret paketi toplu kontrolü: Bina `geometrySuitability ≠ 1006` VEYA `buildingType ≠ 1001` VEYA `tenderRegistrationNumber` dolu VEYA `architecturalPlanID` dolu | Y | H | `GML_M-17273333-F.gml` (Kanıtlı Ret Dosyası), `K15–K18` |
| **V-203** | Kapı/pencere poligonunun `gml:id`'si ile duvardaki delik halkasının `gml:id`'si aynı (farklı olmalı) veya köşe dizilimi farklı | Y | H | `K48`, `K80` |
| **V-204** | `bldg:Door` veya `bldg:Window` içinde `bldg:class` elemanı kullanılmış (v2.29 ile kaldırıldı) | Y | U | `v3 §3.4` Notu, SÜRÜM v2.29 |
| **V-205** | `gml:Envelope` alt/üst köşeleri ile tüm poligon + TIC gerçek `min/max` kutusu arasındaki fark `> 1 mm` | Y | U | `K11`, `V-018` |
| **V-206** | Kat `storeyUsage` değerleri ile o kattaki BB `independentSectionUsage` ve nitelikli `OA` varlığının uyumu | Y | U | `v3 §3.5` Notu |
| **V-207** | Ortak Alan (`OA_`) içinde `geometrySuitability`, `planArea` veya `volume` yazılmış (yazılmamalı) | Y | U | `v3 §3.8` Notu |
| **V-208** | **[`K83` İptali / `K88-yeni` Malik Hisse Kontrolü]:** *(Eski `<sender>` kuralı kullanıcı kararıyla iptal edilmiştir)* Proje dosyasındaki bir BB'ye ait maliklerin (`Malik`) `BigInt` hisse toplamı `∑(hissePay/hissePayda) ≠ 1` ise bilgi verir (GML doğrulamasını engellemez) | K | B | `K88-yeni`, `CLAUDE13 §1` |
| **V-209** | `GroundSurface` poligonunun halka yönü üstten bakınca CCW (`nz > 0`) — üretimde CW (`nz < 0`) olmalı, içe alınan dosyada BİLGİ | Y | B | `K78`, `N22` (`Sincan` ve `Ornek1..6`) |
| **V-210** | `architecturalProjectConfirmationDate` değeri `1900-01-01` (belgede tarih yok varsayılanı kullanılmış) | Y | B | `K62`, `K86`, `S.S.S. 27` |
| **V-211** | Tüm `xlink:href` referanslarının `#` ile başladığı (`K93`) ve hedef `gml:id`'nin dosyada var olduğu | Y | H | `K93`, `V-107`, `V-113`, `V-150`, `V-190` |
| **V-212** | Aynı `(blockName, entrance, independentSectionNumber)` altında farklı `propertyLot` veya farklı `registeredQuality` taşıyan birden fazla BB kaydı var (`Ornek1 #41` anomali uyarısı) | Y | U | `K84`, `CLAUDE9 N32` |
| **V-213** | `maksIdentityNumber` veya `maksNumaratajIdentityNumber` değeri 32-bit işaretli tamsayı sınırını (`2147483647`) aşıyor (`BigInt` / `string` olarak korundu) | Y | B | `CLAUDE10 N33` (`899AK3`, `662P0J`) |
| **V-214** | `intAttribute` veya `doubleAttribute` değerinde baştan/sondan boşluk veya TAB (`\t`) karakteri var (`Ornek6` TAB hatası) | Y | U | `v3 §3.1`, `§6.14` |
| **V-215** | Kat geometrisi profili (`Biçim A / B / C`) ve kapı alt ofseti (`+10 mm / +50 mm`) tespiti | Y | B | `K55`, `K79`, `K87` |
| **V-216** | `bldg:Building` içinde `measuredHeight` veya `lod2Solid` yazılmış (`K68` ve `Ek-A §A.3` gereği yazılmamalı) | Y | U | `K68`, `Ek-A §A.3` |

---

## BÖLÜM 5: DOSYA FORMATI — BİREBİR XML ŞABLONLARI (`v3 §3.1 – 3.13`, `Ornek6` DOĞRULAMALI)

> **Kaynak Garantisi (`N37` Onarımı):** Aşağıdaki şablonlar `/public/assets/aistudio/claude_uygulama_sartnamesi_v3_58f23bf6.md` (`§3.1–3.13`, satır 400–789) içinden **birebir** alınmıştır. Eleman sırası CityGML 2.0 XSD sırasıdır (`gml:name` → `gen:*Attribute` → sınıfa özgü elemanlar).

### 5.1 Kök (`core:CityModel` — `§3.2`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<core:CityModel xmlns="http://www.opengis.net/citygml/2.0"
                xmlns:core="http://www.opengis.net/citygml/2.0"
                xmlns:gml="http://www.opengis.net/gml"
                xmlns:grp="http://www.opengis.net/citygml/cityobjectgroup/2.0"
                xmlns:gen="http://www.opengis.net/citygml/generics/2.0"
                xmlns:bldg="http://www.opengis.net/citygml/building/2.0"
                xmlns:app="http://www.opengis.net/citygml/appearance/2.0"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.opengis.net/citygml/2.0 http://schemas.opengis.net/citygml/2.0/cityGMLBase.xsd http://www.opengis.net/citygml/appearance/2.0 http://schemas.opengis.net/citygml/appearance/2.0/appearance.xsd http://www.opengis.net/citygml/building/2.0 http://schemas.opengis.net/citygml/building/2.0/building.xsd http://www.opengis.net/citygml/generics/2.0 http://schemas.opengis.net/citygml/generics/2.0/generics.xsd http://www.opengis.net/citygml/cityobjectgroup/2.0 http://schemas.opengis.net/citygml/cityobjectgroup/2.0/cityObjectGroup.xsd">
  <gml:boundedBy>
    <gml:Envelope srsDimension="3" srsName="EPSG:5254">
      <gml:lowerCorner>{minX} {minY} {minZ}</gml:lowerCorner>
      <gml:upperCorner>{maxX} {maxY} {maxZ}</gml:upperCorner>
    </gml:Envelope>
  </gml:boundedBy>
  <core:cityObjectMember> …Building… </core:cityObjectMember>
  <core:cityObjectMember> …Kat (her kat için, alttan üste)… </core:cityObjectMember>
  <core:cityObjectMember> …BB parçası (her biri için)… </core:cityObjectMember>
  <core:cityObjectMember> …MBG (tek, en sonda)… </core:cityObjectMember>
</core:CityModel>
```

### 5.2 Mimari Bina (`bldg:Building` — `§3.3`)

```xml
<bldg:Building gml:id="MB_{guid}">
  <gml:name>Mimari Bina_{constructionID}</gml:name>
  <gen:stringAttribute name="constructionID"><gen:value>{70125626-A}</gen:value></gen:stringAttribute>
  <gen:intAttribute name="takbisPropertyIdentityNumber"><gen:value>{70125626}</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksIdentityNumber"><gen:value>{int}</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksIntegrationState"><gen:value>1003</gen:value></gen:intAttribute>
  <gen:stringAttribute name="blockNumber"><gen:value>{ada}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="parcelNumber"><gen:value>{parsel}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="tenderRegistrationNumber"><gen:value/></gen:stringAttribute>
  <gen:intAttribute name="buildingType"><gen:value>1001</gen:value></gen:intAttribute>
  <gen:intAttribute name="geometrySuitability"><gen:value>1006</gen:value></gen:intAttribute>
  <gen:stringAttribute name="architecturalPlanID"><gen:value/></gen:stringAttribute>
  <gen:stringAttribute name="additionalNote"><gen:value>-</gen:value></gen:stringAttribute>
  <gen:intAttribute name="takbisNeighbourhoodReference"><gen:value>{int}</gen:value></gen:intAttribute>
  <gen:intAttribute name="totalIndependentSectionCount"><gen:value>{n}</gen:value></gen:intAttribute>
  <gen:intAttribute name="elevatorCount"><gen:value>{n}</gen:value></gen:intAttribute>
  <gen:doubleAttribute name="roofProjectionArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
  <gen:doubleAttribute name="buildingHeight"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
  <gen:dateAttribute name="architecturalProjectConfirmationDate"><gen:value>{YYYY-MM-DD}</gen:value></gen:dateAttribute>
  <bldg:class>MimariBina</bldg:class>
  <bldg:storeysAboveGround>{n}</bldg:storeysAboveGround>
  <bldg:storeysBelowGround>{n}</bldg:storeysBelowGround>
  <bldg:lod0FootPrint><gml:MultiSurface>
    <gml:surfaceMember><gml:Polygon gml:id="Lod0FootPrint_{guid}"><gml:exterior><gml:LinearRing gml:id="LinearRing_{guid}"><gml:posList>…</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></gml:surfaceMember>
  </gml:MultiSurface></bldg:lod0FootPrint>
  <bldg:lod0RoofEdge><gml:MultiSurface>
    <gml:surfaceMember><gml:Polygon gml:id="Lod0RoofEdge_{guid}">…</gml:Polygon></gml:surfaceMember>
  </gml:MultiSurface></bldg:lod0RoofEdge>
  <bldg:lod1Solid><gml:CompositeSolid>
    <gml:solidMember><gml:Solid><gml:exterior><gml:CompositeSurface>
      <gml:surfaceMember><gml:Polygon gml:id="Lod1Poligon_{guid}">…</gml:Polygon></gml:surfaceMember>
    </gml:CompositeSurface></gml:exterior></gml:Solid></gml:solidMember>
  </gml:CompositeSolid></bldg:lod1Solid>
  <bldg:lod2MultiSurface><gml:MultiSurface>
    <gml:surfaceMember xlink:href="#Roof_{guid}"/>
    <gml:surfaceMember xlink:href="#Wall_{guid}"/>
    <gml:surfaceMember xlink:href="#OuterFloor_{guid}"/>
    <gml:surfaceMember xlink:href="#OuterCeiling_{guid}"/>
    <gml:surfaceMember xlink:href="#Ground_{guid}"/>
  </gml:MultiSurface></bldg:lod2MultiSurface>
  <bldg:lod2TerrainIntersection><gml:MultiCurve><gml:curveMember><gml:LineString>
    <gml:posList>{x y z …, kapalı}</gml:posList>
  </gml:LineString></gml:curveMember></gml:MultiCurve></bldg:lod2TerrainIntersection>
  <bldg:outerBuildingInstallation> …Balkon/Teras… </bldg:outerBuildingInstallation>
  <bldg:boundedBy><bldg:RoofSurface><gml:name>Çatı</gml:name><bldg:lod2MultiSurface><gml:MultiSurface>…Roof_ poligonları…</gml:MultiSurface></bldg:lod2MultiSurface></bldg:RoofSurface></bldg:boundedBy>
  <bldg:boundedBy><bldg:GroundSurface><gml:name>Zemin</gml:name><bldg:lod2MultiSurface><gml:MultiSurface>…Ground_ poligonu…</gml:MultiSurface></bldg:lod2MultiSurface></bldg:GroundSurface></bldg:boundedBy>
  <bldg:boundedBy><bldg:WallSurface> …(5.3)… </bldg:WallSurface></bldg:boundedBy>
  <bldg:boundedBy><bldg:OuterFloorSurface><gml:name>DışTaban</gml:name>…</bldg:OuterFloorSurface></bldg:boundedBy>
  <bldg:boundedBy><bldg:OuterCeilingSurface><gml:name>DışTavan</gml:name>…</bldg:OuterCeilingSurface></bldg:boundedBy>
  <bldg:interiorRoom> …BBK/OA Room… </bldg:interiorRoom>
</bldg:Building>
```

### 5.3 Dış Duvar Yüzeyi ve Açıklıklar (`bldg:WallSurface` / `bldg:Door` / `bldg:Window` — `§3.4`)

```xml
<bldg:WallSurface>
  <gml:name>Duvar</gml:name>
  <bldg:lod2MultiSurface><gml:MultiSurface>
    <gml:surfaceMember>
      <gml:Polygon gml:id="Wall_{guid}">
        <gml:exterior><gml:LinearRing gml:id="LinearRing_{guid}"><gml:posList>{CCW, dışarıdan}</gml:posList></gml:LinearRing></gml:exterior>
        <gml:interior><gml:LinearRing gml:id="DoorLinearRing_{guidA}"><gml:posList>{H halkası, ters yön}</gml:posList></gml:LinearRing></gml:interior>
        <gml:interior><gml:LinearRing gml:id="WindowLinearRing_{guidB}"><gml:posList>{…}</gml:posList></gml:LinearRing></gml:interior>
      </gml:Polygon>
    </gml:surfaceMember>
  </gml:MultiSurface></bldg:lod2MultiSurface>
  <bldg:opening>
    <bldg:Door gml:id="KAPI_{guid}">
      <gml:name>{doorUsage açıklaması, örn. Dış Kapı}</gml:name>
      <gen:intAttribute name="doorUsage"><gen:value>{1001..1004}</gen:value></gen:intAttribute>
      <bldg:lod4MultiSurface><gml:MultiSurface><gml:surfaceMember>
        <gml:Polygon gml:id="Door_{guid}"><gml:exterior>
          <gml:LinearRing gml:id="DoorLinearRing_{guidC}"><gml:posList>{H halkasının AYNI SIRALI kopyası}</gml:posList></gml:LinearRing>
        </gml:exterior></gml:Polygon>
      </gml:surfaceMember></gml:MultiSurface></bldg:lod4MultiSurface>
    </bldg:Door>
  </bldg:opening>
  <bldg:opening>
    <bldg:Window gml:id="PEN_{guid}">
      <gml:name>{Dış Pencere | İç Pencere}</gml:name>
      <gen:intAttribute name="windowUsage"><gen:value>{1001|1002}</gen:value></gen:intAttribute>
      <bldg:lod4MultiSurface><gml:MultiSurface><gml:surfaceMember>
        <gml:Polygon gml:id="Window_{guid}"><gml:exterior>
          <gml:LinearRing gml:id="WindowLinearRing_{guidD}"><gml:posList>{…}</gml:posList></gml:LinearRing>
        </gml:exterior></gml:Polygon>
      </gml:surfaceMember></gml:MultiSurface></bldg:lod4MultiSurface>
    </bldg:Window>
  </bldg:opening>
</bldg:WallSurface>
```

### 5.4 Kat (`grp:CityObjectGroup` — `§3.5`)

```xml
<grp:CityObjectGroup gml:id="K_{guid}">
  <gml:name>Kat_{storeyNumber}</gml:name>
  <gen:stringAttribute name="storeyNumber"><gen:value>{Z | -1 | 1 | CK_5}</gen:value></gen:stringAttribute>
  <gen:intAttribute name="storeyUsage"><gen:value>{1001|1002|1003}</gen:value></gen:intAttribute>
  <gen:intAttribute name="independentSectionCount"><gen:value>{n}</gen:value></gen:intAttribute>
  <grp:class>Kat</grp:class>
  <grp:groupMember xlink:href="#BB_{guid}"/>
  <grp:parent xlink:href="#MB_{guid}"/>
  <grp:geometry><gml:MultiSurface>
    <gml:surfaceMember><gml:Polygon gml:id="Floor_{guid}">…</gml:Polygon></gml:surfaceMember>
    <gml:surfaceMember><gml:Polygon gml:id="Wall_{guid}">…</gml:Polygon></gml:surfaceMember>
  </gml:MultiSurface></grp:geometry>
</grp:CityObjectGroup>
```

### 5.5 Bağımsız Bölüm Parçası (`gen:GenericCityObject` — `§3.6`)

```xml
<gen:GenericCityObject gml:id="BB_{guid}">
  <gml:name>{blok}_{giriş}_{bbNo}_Bağımsız Bölüm</gml:name>
  <gen:intAttribute name="geometrySuitability"><gen:value>1001</gen:value></gen:intAttribute>
  <gen:intAttribute name="integrationState"><gen:value>1004</gen:value></gen:intAttribute>
  <gen:stringAttribute name="independentSectionNumber"><gen:value>{no}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="blockName"><gen:value>{blok | -1}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="entrance"><gen:value>{giriş}</gen:value></gen:stringAttribute>
  <gen:intAttribute name="takbisPropertyIdentityNumber"><gen:value>-1</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksIdentityNumber"><gen:value>{int}</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksNumaratajIdentityNumber"><gen:value>{int}</gen:value></gen:intAttribute>
  <gen:intAttribute name="maksIntegrationState"><gen:value>1003</gen:value></gen:intAttribute>
  <gen:stringAttribute name="registeredQuality"><gen:value>{MESKEN}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="registeredInstallation"><gen:value>{… | boş}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="registeredFloorDefinition"><gen:value>{Zemin Kat}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="propertyLot"><gen:value>{pay/payda}</gen:value></gen:stringAttribute>
  <gen:stringAttribute name="additionalNote"><gen:value>-</gen:value></gen:stringAttribute>
  <gen:intAttribute name="independentSectionCardinalDirection"><gen:value>{1001..1009}</gen:value></gen:intAttribute>
  <gen:intAttribute name="independentSectionUsage"><gen:value>{1001..1006}</gen:value></gen:intAttribute>
  <gen:intAttribute name="partCount"><gen:value>{n}</gen:value></gen:intAttribute>
  <gen:doubleAttribute name="independentSectionPlanNetArea"><gen:value>{0.00 | -1}</gen:value></gen:doubleAttribute>
  <gen:doubleAttribute name="independentSectionPlanGrossArea"><gen:value>{0.00 | -1}</gen:value></gen:doubleAttribute>
  <gen:doubleAttribute name="independentSectionCalculatedArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
  <gen:class>BagimsizBolum</gen:class>
  <gen:lod2Geometry><gml:MultiSurface>
    <gml:surfaceMember><gml:Polygon gml:id="Floor_{guid}">…</gml:Polygon></gml:surfaceMember>
    <gml:surfaceMember><gml:Polygon gml:id="Wall_{guid}">…</gml:Polygon></gml:surfaceMember>
  </gml:MultiSurface></gen:lod2Geometry>
</gen:GenericCityObject>
```

### 5.6 Bağımsız Bölüm Kısmı (`bldg:Room` BBK — `§3.7`), Ortak Alan (`OA` — `§3.8`), İç Yapı (`§3.9`), Balkon/Teras (`§3.10`) ve MBG (`§3.11`)

```xml
<!-- BBK (§3.7) -->
<bldg:interiorRoom>
  <bldg:Room gml:id="BBK_{guid}">
    <gml:name>{blok}_{giriş}_{bbNo}_{partUsage açıklaması}</gml:name>
    <gen:stringAttribute name="independentSectionObjectReference"><gen:value>BB_{guid}</gen:value></gen:stringAttribute>
    <gen:intAttribute name="partUsage"><gen:value>{1001..1030}</gen:value></gen:intAttribute>
    <gen:intAttribute name="geometrySuitability"><gen:value>1001</gen:value></gen:intAttribute>
    <gen:stringAttribute name="additionalNote"><gen:value>-</gen:value></gen:stringAttribute>
    <gen:doubleAttribute name="planArea"><gen:value>{0.00 | -1.0}</gen:value></gen:doubleAttribute>
    <gen:doubleAttribute name="calculatedArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
    <gen:doubleAttribute name="volume"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
    <bldg:class>BagimsizBolumKisim</bldg:class>
    <bldg:lod4MultiSurface><gml:MultiSurface>
      <gml:surfaceMember xlink:href="#Floor_{guid}"/>
      <gml:surfaceMember xlink:href="#InteriorWall_{guid}"/>
      <gml:surfaceMember xlink:href="#Ceiling_{guid}"/>
    </gml:MultiSurface></bldg:lod4MultiSurface>
    <bldg:boundedBy><bldg:FloorSurface><gml:name>Taban</gml:name><bldg:lod4MultiSurface><gml:MultiSurface>…Floor_…</gml:MultiSurface></bldg:lod4MultiSurface></bldg:FloorSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:InteriorWallSurface><gml:name>İçDuvar</gml:name><bldg:lod4MultiSurface><gml:MultiSurface>…InteriorWall_…</gml:MultiSurface></bldg:lod4MultiSurface><bldg:opening>…</bldg:opening></bldg:InteriorWallSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:CeilingSurface><gml:name>Tavan</gml:name><bldg:lod4MultiSurface><gml:MultiSurface>…Ceiling_…</gml:MultiSurface></bldg:lod4MultiSurface></bldg:CeilingSurface></bldg:boundedBy>
    <bldg:roomInstallation> …İç Yapı (§3.9)… </bldg:roomInstallation>
  </bldg:Room>
</bldg:interiorRoom>

<!-- OA (§3.8) -->
<bldg:interiorRoom>
  <bldg:Room gml:id="OA_{guid}">
    <gml:name>{commonAreaUsage açıklaması}_Ortak Alan</gml:name>
    <gen:stringAttribute name="storeyObjectReference"><gen:value>{K_{guid} | -1}</gen:value></gen:stringAttribute>
    <gen:intAttribute name="commonAreaUsage"><gen:value>{1001..1030}</gen:value></gen:intAttribute>
    <gen:doubleAttribute name="calculatedArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
    <bldg:class>OrtakAlan</bldg:class>
    <bldg:lod4MultiSurface>…</bldg:lod4MultiSurface>
    <bldg:boundedBy><bldg:FloorSurface>…</bldg:FloorSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:InteriorWallSurface>…</bldg:InteriorWallSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:WallSurface><gml:name>Duvar</gml:name>…</bldg:WallSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:CeilingSurface>…</bldg:CeilingSurface></bldg:boundedBy>
    <bldg:roomInstallation> …OAIY… </bldg:roomInstallation>
  </bldg:Room>
</bldg:interiorRoom>

<!-- İç Yapı (§3.9) -->
<bldg:roomInstallation>
  <bldg:IntBuildingInstallation gml:id="BBKIY_{guid}">
    <gml:name>{blok}_{giriş}_{bbNo}_{oda partUsage açıklaması}_İç Yapı</gml:name>
    <gen:intAttribute name="roomInstallationUsage"><gen:value>{1001|1002|1003}</gen:value></gen:intAttribute>
    <bldg:class>BagimsizBolumKisimIcYapi</bldg:class>
    <bldg:lod4Geometry><gml:MultiSurface>
      <gml:surfaceMember xlink:href="#Floor_{guid}"/>
      <gml:surfaceMember xlink:href="#InteriorWall_{guid}"/>
      <gml:surfaceMember xlink:href="#Ceiling_{guid}"/>
    </gml:MultiSurface></bldg:lod4Geometry>
    <bldg:boundedBy><bldg:FloorSurface>…</bldg:FloorSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:InteriorWallSurface>…</bldg:InteriorWallSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:CeilingSurface>…</bldg:CeilingSurface></bldg:boundedBy>
  </bldg:IntBuildingInstallation>
</bldg:roomInstallation>

<!-- Balkon / Teras (§3.10) -->
<bldg:outerBuildingInstallation>
  <bldg:BuildingInstallation gml:id="BLKN_{guid}">
    <gml:name>{blok}_{giriş}_{bbNo}_Balkon</gml:name>
    <gen:stringAttribute name="independentSectionObjectReference"><gen:value>{BB_{guid} | -1}</gen:value></gen:stringAttribute>
    <gen:intAttribute name="geometrySuitability"><gen:value>1001</gen:value></gen:intAttribute>
    <gen:stringAttribute name="additionalNote"><gen:value>-</gen:value></gen:stringAttribute>
    <gen:doubleAttribute name="planArea"><gen:value>{0.00 | -1.0}</gen:value></gen:doubleAttribute>
    <gen:doubleAttribute name="calculatedArea"><gen:value>{0.00}</gen:value></gen:doubleAttribute>
    <bldg:class>Balkon</bldg:class>
    <bldg:lod2Geometry><gml:MultiSurface>
      <gml:surfaceMember xlink:href="#Floor_{guid}"/>
      <gml:surfaceMember xlink:href="#Wall_{guid}"/>
    </gml:MultiSurface></bldg:lod2Geometry>
    <bldg:boundedBy><bldg:FloorSurface><gml:name>Taban</gml:name><bldg:lod2MultiSurface>…</bldg:lod2MultiSurface></bldg:FloorSurface></bldg:boundedBy>
    <bldg:boundedBy><bldg:WallSurface><gml:name>Duvar</gml:name><bldg:lod2MultiSurface>…</bldg:lod2MultiSurface></bldg:WallSurface></bldg:boundedBy>
  </bldg:BuildingInstallation>
</bldg:outerBuildingInstallation>

<!-- MBG (§3.11) -->
<grp:CityObjectGroup gml:id="MBG_{guid}">
  <gml:name>Mimari Bina Grup_{constructionID}</gml:name>
  <grp:class>MimariBinaGrup</grp:class>
  <grp:groupMember xlink:href="#MB_{guid}"/>
  <grp:groupMember xlink:href="#K_{guid}"/>
  <grp:groupMember xlink:href="#BB_{guid}"/>
</grp:CityObjectGroup>
```

---

## BÖLÜM 6: UYGULAMA YOL HARİTASI (`M0 – M10`, DURUM: `TANIMLI / KODLANMADI` — `D-22`) VE `M0` 10 ADIMLI İCRA PLANI

### 6.1 `M0` (İlk Görev — Kullanıcı **Proceed** Dediğinde İcra Edilecek 10 Adım)

`AISTUDIO_BASLANGIC_TALIMATI.md` satır 55–68 ve `CLAUDE13.md §1–§2` uyarınca ilk kodlama turunda **yalnızca `M0` (10 adımlı saf TypeScript çekirdeği + birim testler + denetim konsolu)** inşa edilecektir:

1. **Adım 1 — Proje İskeleti, Belgeler ve 15 Resmi Dosyanın Bayt-Bayt Kopyalanması (`CLAUDE13 §2.1`):**
   - React + Vite + TypeScript (`strict: true`, `noImplicitAny: true`), `vitest`, `eslint`, `fast-xml-parser`.
   - `docs/KARARLAR.md` (`CLAUDE12 Ek-A` + `CLAUDE13 §1–§2` güncellemeleri), `docs/ACIK_SORULAR.md`, `docs/ADIM_NOTU.md`.
   - `src/core/` (saf TS) ve `src/platform/PlatformAdapter.ts` ayrımı.
   - `/public/assets/aistudio/ornek6_7839a667.xml` dosyasının **bayt-bayt değiştirilmeden** `fixtures/ornek6.gml` olarak; `/public/assets/aistudio/<ad>_<hash>.xml` altındaki 14 resmi XML kod listesinin **bayt-bayt değiştirilmeden** `resources/codelists/<ad>.xml` olarak kopyalanması (`commonAreaUsage.xml` oluşturulmaz).
   - **Zorunlu SHA-256 Kilidi Testi:** 15 dosyanın tamamının bayt boyutu ve SHA-256 özetinin `/public/assets/aistudio/DOSYA_LISTESI_1e8e75ac.txt` ile birebir eşleştiğini doğrulayan birim test.
2. **Adım 2 — `src/core/codelists`:**
   - `resources/codelists/*.xml` altındaki 14 resmi XML kod listesini okuyan çevrimdışı yükleyici (`integrationState.xml` içindeki mükerrer `gml:id="id3"` durumuna dayanıklı; `commonAreaUsage` sorgularını `partUsage.xml` üzerinden yanıtlayan yapı) + her listenin kod ve Türkçe `gml:description` etiketlerini doğrulayan birim testler (`// K60`, `// V-063`).
3. **Adım 3 — `src/core/model`:**
   - `docs/KARARLAR.md` ile birebir uyumlu veri modeli tipleri (`ALLOWED_GENERIC_ATTRIBUTES` 45'li sabit beyaz liste, `maksIdentityNumber: string | bigint | null`, mm tamsayı koordinat tipleri, `ProducerProfile: 'A10' | 'B50' | 'C50'`, `otomatikOneri: boolean`).
4. **Adım 4 — `src/core/math/landShare.ts`:**
   - `BigInt` tabanlı rasyonel arsa payı motoru (`gcd`, birleşik BB anahtarı `K84`, `V-198`, `V-198a`, `V-198b`, `V-199`, `V-212`).
   - 3 zorunlu fikstür testi:
     - `Ornek1 #41` (`98/6534 + 79/6534` → `59/2178`, `uniqueBbCount = 2`, `V-212 UYARI`)
     - `FUA5P9` (`103500/104683`, fark `-1183/104683`, `V-199 BİLGİ`)
     - Boşluklu pay (`" 98 / 6534 "`) + küçük harf nitelik normalizasyonu (`V-198 BİLGİ`).
5. **Adım 5 — `src/core/math/helmert2d.ts`:**
   - 2B benzerlik (Helmert) dönüşümü ($a, b, t_E, t_N$), ölçek ve `ppm` hesabı, nokta bazlı artık vektörler (`residuals`), `leave-one-out` uyuşumsuz nokta tespiti + elle çözülmüş birim testler.
6. **Adım 6 — `src/core/math/ring.ts`:**
   - Shoelace işaretli alan, `CW` / `CCW` halka yönü, 3B düzlemsellik (`V-037`), delik–kenar minimum mesafe (`K45a`, `V-042a/b`).
   - Zorunlu test: `(0,0)-(10,0)-(10,10)-(0,10)` → `+100` (`CCW`); ters sıra → `-100` (`CW`).
7. **Adım 7 — `src/core/model/malik.ts` (`CLAUDE13 §1` — Eski `stripPersonalData.ts` Yerine):**
   - `Malik` veri modeli (`bbAnahtari`, `adSoyadVeyaUnvan`, `tcKimlikVeyaVergiNo?`, `hissePay: bigint`, `hissePayda: bigint`, `not?`) ve bir BB'deki malik hisse toplamının `BigInt` kesir aritmetiği ile `1` (`1/1`) olup olmadığının kontrolü (`// K88`, `// V-208`).
   - **Zorunlu Test:** Yalnızca sahte örnek verilerle (`"ÖRNEK MALİK 1"`, `"11111111110"`, `1/2 + 1/2 = 1/1` tam hisse ve `1/3 + 1/3 = 2/3 ≠ 1` `BİLGİ` durumu) ve `Malik` verisinin GML öznitelik beyaz listesinde (`ALLOWED_GENERIC_ATTRIBUTES`) yer almadığının doğrulanması.
8. **Adım 8 — `src/core/hash/canonical.ts`:**
   - Deterministik `uuidv5` (`// K92`) ve SHA-256 kanonik model özeti (`// K89`).
   - Zorunlu test: Üretici profili (`A10` → `B50`) değişirse özet değişir; kamera/UI görünümü değişirse özet **değişmez**.
9. **Adım 9 — `src/core/gml/readAttributes.ts` ve `verify:samples`:**
   - Gerçek `fixtures/ornek6.gml` (`717.200 bayt`) içinden `gen:*Attribute` `ad:tip` listesini, nesne sayılarını (`MB=1, K=2, BB=2, BBK=16, BLKN=4, KAPI=44, PEN=38, MBG=1`), kotları ve alanları çıkaran salt-okunur ayrıştırıcı.
   - Zorunlu test: `fixtures/ornek6.gml` içinden çıkan 42 öznitelik listesi `docs/KARARLAR.md §A.3` (1. grup) ile **birebir aynı** olmalıdır (`// V-060`, `// K99`).
   - `npm run trace` ve `npm run verify:samples` betiklerinin çalıştırılması.
10. **Adım 10 — `docs/ADIM_NOTU.md` ve Denetim Konsolu:**
    - `npm run typecheck`, `npm run lint`, `npm test`, `npm run trace`, `npm run verify:samples` gerçek konsol çıktılarının `docs/ADIM_NOTU.md` içine yazılması ve Port 3000'de canlı Denetim Konsolu olarak gösterilmesi.

### 6.2 Tüm Aşamalar Özeti (`M0 – M10`)

| Aşama | Kapsam | Durum (`D-22`) |
|---|---|---|
| **M0** | Saf TS Çekirdek (`15 resmi dosya SHA-256 kilidi`, `codelists`, `model`, `landShare`, `helmert2d`, `ring`, `malik`, `canonical`, `readAttributes`, `trace`, `verify:samples`) | `TANIMLI / KODLANMADI` |
| **M1** | GML Okuyucu (`SAX/Worker`), `ImportedModel`, 3B Görüntüleyici ve Nesne Ağacı | `TANIMLI / KODLANMADI` |
| **M2** | Dosya Doğrulayıcı (`V-001 .. V-216` — 175 Kural) | `TANIMLI / KODLANMADI` |
| **M3** | Öznitelik Düzeltici, `diffImportedModels` (`OY-03`) ve Altın Dosya (`Ornek6`) GML Yazıcısı (`K70`, `K99`) | `TANIMLI / KODLANMADI` |
| **M4** | 2B CAD Tasarım Editörü (Kat, BB, BBK, OA, Sütun `S.S.S. 18`, Simetrik Klon `OY-05`) | `TANIMLI / KODLANMADI` |
| **M5** | Geometri Motoru I (Kot Zinciri `K42 rev2`, Kısım Kabukları, BB Küveti `V-124`, Kat Kabuğu `A10/B50/C50`, OA Boşluk `OY-12 #30`, Açıklıklar `K45a`) | `TANIMLI / KODLANMADI` |
| **M6** | Geometri Motoru II (Balkon/Teras `OY-12 #35a`, LoD0/LoD1/LoD2, `GroundSurface` `K78`, TIC `K54`, Envelope, Parametrik Çatı) | `TANIMLI / KODLANMADI` |
| **M7** | Konumlandırma (Helmert Sihirbazı), DXF İçe Aktarma, Serbest Düzenlenebilir Beyan ve Kat İrtifakı / Malik Listesi (`K88-yeni`, `Malik`) | `TANIMLI / KODLANMADI` |
| **M8** | Çatı Arası (`manifold-3d` Eğik Tavan `K82`), İç Yapı (`K59`), İç-Oda (`K71`), Dubleks (`K85`) | `TANIMLI / KODLANMADI` |
| **M9** | Resmi `Ornek1..6`, `Amasya`, `Sincan` ve `17273333-F` Kabul Testleri | `TANIMLI / KODLANMADI` |
| **M10** | Electron Windows Masaüstü (`.exe` / NSIS) Paketleme (`OY-11`) | `TANIMLI / KODLANMADI` |
