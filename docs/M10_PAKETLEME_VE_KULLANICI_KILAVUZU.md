# M10 — PAKETLEME, ÇİFT MONİTÖR VE KULLANICI KILAVUZU

**Sürüm:** v1.0.0 (M10 Tamamlandı)  
**Tarih:** 2026-11-08  
**Standart Uyumluluğu:** TKGM 3B Şehir Modelleri Üretimi Teknik Şartnamesi v3.5.5, KARAR D-23.5, KARARLAR.md §169, OY-12, K60, K91.

---

## 1. Genel Bakış ve M10 Kapsamı

TKGM 3B CityGML 2.0 Dijital Bina Stüdyosu; kadastro, tapu ve mimari projelerin TKGM 3B standartlarına uygun olarak tasarlanması, doğrulanması, otomatik düzeltilmesi, 2B/3B görselleştirilmesi ve resmî teslim paketlerinin üretilmesi için geliştirilmiş bağımsız, çevrimdışı ve tam entegre bir masaüstü/web uygulamasıdır.

M10 aşaması ile aşağıdaki temel yetenekler sisteme kazandırılmıştır:
1. **Platform Soyutlama Katmanı (`PlatformAdapter`):** Çekirdek geometri, doğrulama ve GML motorunun DOM/Node bağımlılıklarından tamamen yalıtılması. Web, CLI ve Masaüstü (Electron) ortamlarında deterministik ve sıfır dış bağımlılıkla çalışma.
2. **Çift Monitör / İkinci Pencere Protokolü (`DualWindowCoordinator`):** Ana pencere ile harici monitördeki ikinci pencere (3B Sahne veya 2B Çizim) arasında kesintisiz, gecikmesiz ve çift yönlü senkronizasyon (BroadcastChannel, LocalStorage fallback, Electron IPC).
3. **Hazır Mimari Proje Şablonları (F10):** Standart 4 katlı apartman, 2 katlı beşik çatılı villa, çatı piyesli dubleks daire ve zemin katı ticari dükkanlı karma konut şablonları. Tek tıkla geçerli B-Rep ve CityGML üretimi.
4. **Windows 11 NSIS Kurulum & Taşınabilir (Portable) Paketleme:** `electron-builder.json5` ve Electron ana süreç yönetimi ile `.gml` ve `.tkgm3b` dosya ilişkilendirmeleri, masaüstü simgesi ve otomatik güncelleme/çevrimdışı kurulum altyapısı.

---

## 2. Windows 11 Masaüstü Kurulumu ve Paketleme

### 2.1. Gereksinimler
- Windows 10/11 x64 (veya modern Linux / macOS).
- Node.js 20+ LTS (derleme ve paketleme için).
- İnternet bağlantısı kurulum sonrasında **kesinlikle gerekmez**; uygulama %100 çevrimdışı çalışır.

### 2.2. Kurulum Paketlerinin Üretilmesi
Masaüstü yürütülebilir dosyalarını derlemek için:

```bash
# Bağımlılıkları yükle
npm install

# Web uygulamasını ve Electron ana sürecini derle
npm run build
npx tsc -p electron/tsconfig.json

# Windows NSIS ve Portable paketlerini oluştur
npx electron-builder --win
```

Üretilen paketler `dist-electron/` dizininde yer alır:
- `TKGM-3B-Studio-Setup-1.0.0.exe`: Windows 11 NSIS Kurulum Sihirbazı (Masaüstü kısayolu, Başlat menüsü ve dosya ilişkilendirmeleriyle kurulur).
- `TKGM-3B-Studio-1.0.0-portable.exe`: Tek dosyadan doğrudan çalışan taşınabilir sürüm.

### 2.3. Dosya İlişkilendirmeleri
Kurulum tamamlandığında Windows Gezgini'nde:
- `.gml` (CityGML 2.0 Coğrafi İşaretleme Dili Dosyaları)
- `.tkgm3b` (TKGM 3B Stüdyo Proje Dosyaları)
dosyalarına çift tıklandığında doğrudan TKGM 3B Stüdyo içinde açılır.

---

## 3. Çift Monitör ve İkinci Ekran Kullanımı

Büyük mimari projelerde ve kadastro denetimlerinde konforu artırmak amacıyla KARAR D-23.5 uyarınca çift monitör desteği sağlanmıştır.

### 3.1. Nasıl Başlatılır?
1. Üst komut şeridindeki **`🖥️+🖥️ 2. Ekran`** düğmesine tıklayın.
2. Sistem otomatik olarak bağlı ikincil monitörü tespit eder (`screen.getAllDisplays()`).
3. İkincil monitörde tam ekran bağımsız bir pencere açılır.
4. Varsayılan olarak 3B TUREF Yerel Merkezli Sahne ikinci ekrana taşınır; ana ekranda 2B Çizim Editörü, Ağaç ve Doğrulama panelleri genişletilir.

### 3.2. Canlı Senkronizasyon Yetenekleri
- **Nesne Seçimi Eşleme:** İster ana ekrandaki Proje Ağacı'ndan veya 2B Plandan bir Bağımsız Bölüm (`BB_`) veya Kısım (`BBK_`) seçin, ister ikinci ekrandaki 3B modelden bir yüzeye tıklayın; her iki ekranda aynı anda vurgulanır ve öznitelik kartı açılır.
- **Kat Filtresi Eşleme:** Herhangi bir ekranda aktif kat değiştirildiğinde veya filtrelendiğinde, diğer ekrandaki 3B/2B görünüm anında ilgili kata odaklanır.
- **Sıfır Gecikme:** Masaüstünde Electron IPC, web tarayıcısında ise HTML5 `BroadcastChannel` kullanılarak mikro saniye düzeyinde haberleşme sağlanır.

---

## 4. Hazır Mimari Proje Şablonları (F10)

Şartnameye ve TKGM standartlarına tam uyumlu örnek projeleri incelemek veya sıfırdan çizim yapmak yerine hazır bir altyapıdan başlamak için 4 standart şablon sunulmuştur:

1. **4 Katlı Standart Apartman Şablonu:**
   - Zemin + 3 Normal Kat (Toplam 4 Kat).
   - 8 Adet 3+1 Mesken (Her katta 2 bağımsız bölüm).
   - Kat holü, ana giriş kapısı, merdiven ve asansör iç yapıları tam tanımlı.
2. **2 Katlı Müstakil Villa Şablonu:**
   - Zemin + 1. Kat (Toplam 2 Kat, 1 Bağımsız Bölüm).
   - Zemin katta geniş salon, mutfak ve zemin terası (`TRS_`).
   - 1. katta ebeveyn ve çocuk yatak odaları.
   - 35° eğimli beşik çatı (`Roof_` kabuğu ile kapalı hacim).
3. **Çatı Piyesli Dubleks Daire Şablonu:**
   - 3. Kat + Çatı Arası Katı.
   - Dubleks daire normal kat ile çatı arası piyesini iç merdivenle bağlar.
   - Kırma çatı eğimi altında kalan odalar otomatik olarak dizlik duvarı (`kneeWallHeight`) ve eğimli tavan düzlemleriyle kesilir.
4. **Zemin Ticari + Konut (Karma) Şablonu:**
   - Zemin katta 2 adet cadde cepheli dükkan/mağaza.
   - Üst normal katlarda 4 adet mesken.
   - Ticari ve mesken birimleri için farklı kullanım kodları ve tavan yükseklikleri.

### Şablon Yükleme Adımları:
1. Üst menüden **`📐 Şablonlar`** düğmesine tıklayın.
2. Açılan katalogdan dilediğiniz mimari şablonun altındaki **`✨ Bu Şablonu Projeye Yükle`** butonuna basın.
3. Model derhal B-Rep katı geometrisine dönüştürülür, CityGML 2.0 XML'i üretilir ve 3B/2B sahnede sıfır hata ile açılır.

---

## 5. Çevrimdışı Çalışma, KVKK ve Güvenlik İlkeleri (K60, K91)

- **Sıfır Dış Ağ Çağrısı:** Uygulama açılırken veya çalışırken Google Analytics, CDN, harici yazı tipi (font), telemetri veya uzak sunucu çağrısı **yapmaz**.
- **Kişisel Verilerin Korunması (KVKK):** Malik TC Kimlik No, ad-soyad, hisse payı ve TAKBİS mülkiyet verileri kullanıcının bilgisayarından asla ayrılmaz.
- **Kanonik Bütünlük (K89):** Projedeki geometriler, öznitelikler ve kod listeleri SHA-256 kanonik özetleme ile mühürlenir; yerleşim değişse veya panel boyutu oynasa dahi dosya özeti değişmez.

---

## 6. Sürüm Özeti (M0 – M10 Yol Haritası Tamamlandı)

- **M0:** Proje Altyapısı, 14 Codelist XML, Ornek6 Fix, TypeScript Strict.
- **M1:** 5 Modüler Panel, Three.js TUREF Yerel Merkezli 3B Sahne, Web Worker Okuyucu (G1–G8).
- **M2:** Dosya Doğrulayıcı (V-001..V-030..V-060, Arsa Payı, Okuyucu Raporu).
- **M3:** Öznitelik Düzeltici & GML Yazıcı (Normalize K70, Sayımlar, Adlandırma, Alanlar).
- **M4:** 2B Tasarım Editörü (DXF içe aktarım, duvar/oda/açıklık/kat çizimi).
- **M5:** Geometri Motoru (3B B-Rep Katı Model, Kot Motoru, Hacim Kapama).
- **M6:** CityGML 2.0 Üretici & Dışa Aktarıcı (MB_, K_, BB_, BBK_, OA_, posList).
- **M7:** Doğrulama & İnce Ayar (KONTROL-M7 R1–R9 düzeltmeleri, 0 kayma, 146/146 test).
- **M8:** Çatı Arası ve Özel Durumlar (KONTROL-M8 R1–R5, Dubleks, İç Yapılar).
- **M9:** Teslim Paketi ve Çoklu Yapı Doğrulama (HTML Raporları, Parsel KML/GeoJSON).
- **M10:** Masaüstü Paketleme, Çift Monitör Protokolü, Mimari Şablonlar (v1.0 Final).
