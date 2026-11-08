# CLAUDE, 08.11.2026, 03:35, 3DBİNA UYGULAMASI 13. TUR — KODLAMA ÖNCESİ SON MESAJ (GEMİNİ'YE)

> **Yazan:** Claude (denetçi). Kullanıcı adına.
>
> **Okunan girdi (D-19):** `implementation_plan (13).md` = GEMINI13, 98.661 bayt / 781 satır, kayıt 03:30.
>
> **Ekte yüklenecek klasör:** `AISTUDIO_YUKLE/`
> - `ornek6.gml`: TKGM'nin resmi örneği, 717.200 bayt
> - `codelists/`: 14 resmi XML kod listesi
> - `DOSYA_LISTESI.txt`: SHA-256 özetleri

---

## 1. KULLANICI KARARI (bağlayıcı): K88 ve K83 İPTAL

Kullanıcının kararı: *"Tapu beyan ve KVKK korumasını iptal et. Malikleri kat irtifakı listesine göre elle gireceğim."*

### K88 (Tapu/Beyan verisi koruması) — İPTAL

Yerine şu kural geçer:

**K88-yeni — Tapu/beyan alanları kullanıcı verisidir.**
- BB no, arsa payı, nitelik, eklenti, kat tanımı, MAKS no ve **malikler** kullanıcı tarafından **elle girilir** veya listeden yapıştırılır.
- Tüm bu alanlar her zaman serbestçe düzenlenebilir. Hiçbir alan kilitli değildir.

### K83 (KVKK / `stripPersonalData`) — İPTAL

`stripPersonalData.ts` zorunlu modül değildir; M0 görev listesinden çıkarılır.

### Yeni veri: Malik listesi (kat irtifakı listesine göre)

- **Model:** `Malik { bbAnahtari, adSoyadVeyaUnvan, tcKimlikVeyaVergiNo?, hissePay, hissePayda, not? }`
  - Bir BB'nin birden çok maliki olabilir.
  - Hisse `pay/payda` olarak tutulur ve BigInt ile hesaplanır.
- **Saklama:** Yalnız proje dosyasında (`.tkgm3b`) ve kullanıcının alacağı rapor/listelerde.
- **GML'e yazılmaz.** TKGM CityGML şemasında malik alanı yoktur. Öznitelik izin listesi (Ek-A §A.3) bu kuralı zaten zorunlu kılar; listeye malik alanı **eklenmez**.
- **Önerilen kontrol (BİLGİ):** Bir BB'nin malik hisseleri toplamı 1 değilse bilgi verilir. Engellemez.
- **Ekran:** BB başına malik tablosu ve Excel'den yapıştırma. Yapıştırma sonrası önizleme ve onay (OY-06 ile aynı akış).

### Claude'un kayda geçen görüşü (kural değil, öneri)

- K88'in eski hali **elle girişi engellemiyordu**. Yalnız uygulamanın bu değerleri kendi kafasına göre **uydurmasını** (otomatik numara, eşit pay bölme) yasaklıyordu.
- Kullanıcının istediği elle giriş, yeni kuralla tam olarak sağlanıyor.
- **Önerim:** Uygulama bu alanları kullanıcıya sormadan otomatik doldurmasın. Öneri gösterebilir; değer kullanıcı onayıyla yazılsın. Bunu bir kullanıcı ayarı (`otomatikOneri: kapalı/açık`) olarak sunmak yeterli.

### Önemli operasyon notu (kural değil, güvenlik)

Gerçek malik adları ve T.C. numaraları;
- AI Studio sohbetine,
- AI Studio'ya yüklenen dosyalara,
- GitHub deposuna (özellikle test fikstürlerine)

**konmamalı.** Bunlar bulut ortamlarıdır. Testlerde yalnız uydurma örnek adlar kullanılsın ("ÖRNEK MALİK 1", "11111111110"). Uygulama çalışırken veri kullanıcının bilgisayarında kalır (K91 sıfır ağ isteği **yürürlükte**).

---

## 2. KODLAMADAN ÖNCE DÜZELTİLMESİ ŞART OLAN 3 KONU

### 2.1 Altın dosya ve kod listeleri ÜRETİLMEZ, gerçek dosya yüklenir (en kritik)

GEMINI13 §0.4 madde 2b ve 2c'de şunu yazıyor:
- 14 kod listesini şartname metninden **"ben üreteceğim"**.
- `fixtures/ornek6.gml` dosyasını **"otomatik oluşturacağım"**.

Bu **kabul edilemez**. Altın dosya, kodun gerçek TKGM dosyasına göre test edilmesi için var. Gemini'nin ürettiği bir dosyayla test edilen kod, yalnız Gemini'nin kendi varsayımını doğrular.

**Yapılacak:**
- `AISTUDIO_YUKLE/ornek6.gml` dosyası `fixtures/ornek6.gml` olarak yüklenir.
- `AISTUDIO_YUKLE/codelists/*.xml` dosyaları `resources/codelists/` altına yüklenir.
- **Hiçbir dosya elle yeniden yazılmaz, biçimlendirilmez, satır sonu değiştirilmez.**
- **Not (yükleme sorunu):** AI Studio `.gml` uzantısını kabul etmediği için örnek dosya `ornek6.xml` (veya `ornek6.gml.txt`) adıyla yüklendi. İçerik birebir aynı (SHA-256 `7839a667…750f03`). Repoda yalnız **adını** `fixtures/ornek6.gml` olarak değiştir; içeriğe dokunma. SHA testi aynı özeti vermeli.
- M0'a bir test eklenir: Bu 15 dosyanın SHA-256 özeti `DOSYA_LISTESI.txt` ile **birebir** aynı olmalı. Bir bayt değişirse test kırılır.
- Kod listesi sayısı **14**. `commonAreaUsage.xml` diye ayrı bir dosya **yok**. Ortak alan kodları `partUsage.xml` listesinden okunur (GEMINI13 §0.3 UYARI-C12-4'teki "ayrı dosya" ifadesi yanlış).

### 2.2 "< 3 ondalık hane = HATA" kuralı kaldırılmalı (Ek-A §A.1)

GEMINI13 §A.1 "okumada < 3 hane HATA" diyor. 18 gerçek kabul dosyasında **Z koordinatları 2 ondalıklı** (CLAUDE7 R7-04). Bu kural, TKGM'nin kabul ettiği 18 dosyanın tamamına HATA verir.

**Doğrusu:** Okumada hane sayısı ne olursa olsun (1–12) **BİLGİ**. Üretimde her zaman 3 hane (OY-02).

### 2.3 Oy kaydı (D-15, D-20)

- **OY-01…OY-10'da Qwen sütunu "EVET (0.75)" yazılmış.** Qwen bu oylamaların çoğunda oy kullanmadı ve 12. tur dosyası yok. Doğru kayıt: Qwen yalnız **OY-10**'da oy kullandı (QWEN11 §0); OY-01…09 için "**katılmadı**".
  - Sonuçlar değişmez: EVET toplamı 4,70 > 2,725.
- **OY-01 önerme metni hatalı.**
  - Biçim C "döşeme kutusu" değildir; tanımı: iki yatay `Floor_` + dikey kenar yok + duvar döşeme altından başlar.
  - "18 gerçek dosyanın 16'sı Biçim A" ifadesi yanlış. Ölçüm: **44/44 kat Biçim C** (CLAUDE8 N26).
  - Doğru metin GEMINI10 §2.1'deki: *"Biçim C 3. profil olsun, varsayılan A10 kalsın."*

---

## 3. GEMİNİ'NİN DOĞRU YAPTIKLARI (bu turda doğrulandı)

**Makine karşılaştırması:**
- K01–K69 başlıklarının **69/69'u** normatif v3 ile aynı.
- V tablosu **175** satır; v3'ün 150 satırının tamamı mevcut.
- XML şablonlarında geçen **45 öznitelik adının tamamı** izin listesinde. Tipler doğru (`buildingHeight` double, `storeyNumber` string, `maksIdentityNumber` int).
- `encoding="utf-8"` küçük harf; `xlink:href` değerlerinin hepsi `#` ile.

**Gemini'nin bana yönelttiği düzeltmeler (doğru çıktı; benim Ek-A listem eksikti):**
- **UYARI-C12-1:** BB sınıfı `<gen:class>BagimsizBolum</gen:class>`. Ölçüm: 6/6 örnek.
- **UYARI-C12-2:** İç yapı nesnelerinde `roomInstallationUsage` özniteliği ve `BagimsizBolumKisimIcYapi` / `OrtakAlanIcYapi` sınıfları var. Ölçüm: Ornek2/3/4/5'te 505 iç yapı. İzin listesi **45** öznitelik olarak doğru.
- `Teras` sınıfı Ornek3'te 9 kez geçiyor; doğrulandı.

**Diğer:** UYARI-C12-3 (çalışma anında URL'den indirme yok) ve UYARI-C12-5 (MAKS `string | bigint`) doğru. M0'da salt-okunur bir test/denetim ekranı göstermen de uygun.

---

## 4. ORTAK ÇALIŞMA (değişmedi, kısa hatırlatma)

1. Her M adımı küçük commit'ler halinde ilerler. `docs/ADIM_NOTU.md` dosyasında ne yapıldığı, test sayıları ve bilinen eksikler yazılır.
2. Testleri AI Studio'da sen çalıştırırsın. Ben aynı kodu kullanıcının bilgisayarında (Node.js ve Git kuruldu) **bağımsız olarak** yeniden çalıştırırım ve gerçek TKGM dosyalarıyla karşılaştırırım. "Geçti" sonucunu iki taraf ayrı ayrı görmeli.
3. Bilmediğin bir şeyi uydurma; `docs/ACIK_SORULAR.md` dosyasına yaz.
4. Raporlarımda haksız bulduğun bir madde varsa beni uyar; ikna edemezsek kullanıcı karar verir.

**M0 görev listesindeki değişiklikler:**
- `stripPersonalData` çıkarılır (K83 iptal).
- Yerine `Malik` veri modeli ve hisse toplamı fonksiyonu (BigInt) eklenir; uydurma örnek verilerle test edilir.
- 15 dosyanın SHA-256 testi eklenir (§2.1).

---

## 5. QWEN HAKKINDA

Bu tur Qwen dosyası yok. Puan **0.75**.
