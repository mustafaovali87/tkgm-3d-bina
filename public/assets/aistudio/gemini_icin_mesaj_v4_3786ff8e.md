# Gemini'ye Mesaj — v4 Planı Sonrası

Ekler:
- `claude_uygulama_sartnamesi_v3.md` (v3.1, normatif belge)
- `claude_degerlendirme_v4_ve_deepseek.md` (bu turun ayrıntılı değerlendirmesi ve ölçümleri)

---

Gemini,

v4 planın doğru yönde. Sınıf etiketleri, veri tipleri, Biçim B, açıklık halkası kopyası, dinamik kod listeleri ve Y/K/T raporu tamam. Bundan sonra yeni bir plan sürümü yazmak yerine şu şekilde ilerleyelim.

## 1. Normatif belge

`claude_uygulama_sartnamesi_v3.md` (v3.1) **normatif belgedir**.
- Planındaki her madde ilgili Şartname bölümüne atıf yapsın. Örnek: "Alan/hacim: Şartname §5.12".
- Plan ile şartname çelişirse **şartname geçerlidir**.

## 2. Planında düzeltilecekler

- **(a)** "masaüstü/web" yerine yalnız **Windows (Electron)**.
- **(b)** Kod listesi indirmede **"sunucu vekili" olmayacak**. 14 URL doğrudan indirilir ve yerelde önbelleğe alınır (SHA-256 kaydı ve çevrimdışı yedekle).
- **(c)** TKGM örnek GML'leri kurulum paketine **gömülmez**. Test deposunda tutulur veya kullanıcı TKGM'den indirir; dağıtım izni belirsiz.

## 3. Yeni kural (Şartname v3.1, K45/K45a)

Hiçbir kapı/pencere deliği, bulunduğu poligonun dış halkasına değmez.
- **Kanıt:** TKGM'nin 8 dosyasında kenara değen delik sayısı 0. Oda kapı delikleri döşemenin tam +10 mm üstünden başlıyor: Ornek6 36/36, Ornek4 126/126, Sincan 311/311. Ornek2'de +50 mm.
- Kapı deliği `zFloorTop + 10 mm`'den başlar; kapı nesnesi bu deliğin kopyasıdır.
- BB küvetinde kapı altında 1 cm'lik duvar şeridi ve eşik yüzü (yatay `Wall_`) üretilir.
- Pencere ve kapı üstü de tavana değmez.
- Doğrulayıcıya **V-042** eklenir: "Delik halkası ile dış halka arası ≥ 1 mm" (Hata).
- Not: Şartname v3'teki "eşik yüzü yok, delik döşemeye iner" önerisi yanlıştı ve kaldırıldı.

## 4. Bu turda kesinleşenler

| Konu | Karar | Kanıt |
|---|---|---|
| OA dış cephe iç yüzü | `Wall_` (WallSurface); OA iç bölmeleri `InteriorWall_` | Ornek2/4/5, Amasya, Sincan: hepsinde |
| Kat geometrisi | Biçim A ve B ikisi de kabul; B varsayılan | A: Ornek6, Ornek4, Ornek1, Amasya. B: Ornek2, Ornek5, Sincan |
| Oda hacmi | alan × (zCeiling − zFloorTop) | Ornek6 16/16, Ornek2 34/34, Ornek4 128, Sincan 142/142. Amasya kat yüksekliğiyle %8 farkla kabul edilmiş → hacim kontrolü uyarı düzeyinde |
| İç yapı | Oda hacminden ve alanından düşülmez | Ornek5 9/9, Ornek4 8/8 |
| Oda yüksekliği ≥ 1.5 m | En yüksek tavan noktasına göre | Ornek2 eğik odalarda en düşük nokta 1.2 m'ye iniyor |
| BB tabanı | Delik bırakılmaz (şaft → OA 1022 veya Teknik Hacim 1028) | Ornek1'de delikli BB'lerde alan belirsiz (dış − 2.10 m²) |
| Müstakil yapıda BB kapısı | BB'ye bir adet 1003 kapı atanır | Ornek6 (villa) içinde 2 adet 1003 |

## 5. Kodlamaya başlangıç

Şartname §11 **M0–M3** ile başla:
- Electron + TypeScript iskeleti.
- `core/` modülü (DOM, React ve Electron import etmez; Node'da test edilir).
- Kod listesi servisi.
- SAX tabanlı GML okuyucu (Worker içinde).
- V-001…V-195 + V-042 doğrulayıcı.
- Öznitelik düzeltici ve GML yazıcı (3 hane, posList).

**Kabul kriterleri:**
- 6 Ornek + Amasya + Sincan dosyasında, `knownSampleExceptions.json` dışında **sıfır hata**.
- Başarısız örnekte (`GML_M-17273333-F.gml`) beklenen hataların hepsi yakalanmalı: bina geometrySuitability 1005, dolu ihale kayıt no, kapı/pencere yokluğu, ortometrik olmayan Z (0.63–12.02 m).

## 6. Sıra

M4 (CAD editörü) ve M5 (geometri motoru), M2 doğrulayıcısı yukarıdaki kabulü geçtikten sonra başlar. Doğrulayıcı, üretim motorunun hakemidir.

## 7. Kaynak disiplini

Planda ve arayüzde kaynaksız rakam yazılmasın; performans karşılaştırması ve lisans adı gibi bilgiler kesin bilgi gibi verilmesin. Her kütüphane seçilirken lisansı ve sürümü doğrulanıp `package.json`'a kesin sürümle (`^` olmadan) konsun.

Lütfen bu maddeleri planına işle. Ardından M0–M3 için dosya ve klasör yapısını, ilk görev listesini ve her görevin kabul testini ver.
