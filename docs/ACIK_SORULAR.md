# AÇIK SORULAR VE DOĞRULAMA BEKLEYEN MADDELER (`docs/ACIK_SORULAR.md`)

> **Kural (`K97` / `Mutlak Kural 1`):** Örnek dosyada veya normatif şartnamede (`claude_uygulama_sartnamesi_v3.md`, `docs/KARARLAR.md`) karşılığı olmayan hiçbir XML etiketi, öznitelik veya sınıf adı uydurulmaz; doğrulama bekleyen noktalar buraya kaydedilir.

## Kayıtlı Açık Sorular (`M0` / `KONTROL-M0` İtibarıyla)

1. **`ACIK-01` — Teras Nesnesinin `gml:id` Öneki (`KONTROL-M0 F11`, `CLAUDE12 Ek-A §A.2` & `OY-12 #35a`):**
   - **Doğrulanan Kısım (`KONTROL-M0 F11`):** `<bldg:class>Teras</bldg:class>` sınıf değeri `Ornek3-M-87754451-B.gml` dosyasında **9 kez** ölçülmüş ve **kesinleşmiştir** (açık soru değildir).
   - **Açık Kalan Tek Nokta:** `Ornek3-M-87754451-B.gml` içindeki bu 9 adet `<bldg:class>Teras</bldg:class>` nesnesinin gerçek `gml:id` öneki (`TRS_` mi yoksa `BLKN_` mi olduğu) `M1` öncesinde Claude tarafından `Ornek3` içinden ölçülerek bildirilecektir.
   - **Mevcut Uygulama:** Bu ölçüm paylaşılana kadar yeni üretimde varsayılan dış yapı sınıfı `Balkon` (`BLKN_`) olarak kullanılır; `TRS_` öneki teyit edilmeden üretimde kullanılmaz.


### ACIK-01 — YANITLANDI (Claude, 08.11.2026, M2 ölçümü)
- `Ornek3-M-87754451-B.gml` içindeki 9 Teras nesnesi: `bldg:BuildingInstallation`, `gml:id` öneki **`TRS_`**, `<bldg:class>Teras</bldg:class>`.
- Adları: `-1_-1_-1_Teras`. `independentSectionObjectReference = -1` (V-187).
- Geometri: FloorSurface (`Floor_`) + WallSurface (`Wall_`).
- **`TRS_` öneki üretimde kullanılabilir.**

## M2 ile açılan sorular (Claude, 08.11.2026)

2. **ACIK-02 — V-005 XSD doğrulaması:** CityGML 2.0 / GML 3.1.1 XSD dosyaları repoda yok. Ağ erişimi olmadan (K91) şema doğrulaması için resmi XSD kopyaları `resources/xsd/` altına SHA ile kilitlenerek eklenmeli. Kaynak dosyaları kullanıcı sağlamalı.
3. **ACIK-03 — V-123 BB taban kalınlığı alt sınırı:** Şartnamede sayı yok ("{...} m"). Resmi örneklerdeki en küçük kalınlık ölçülüp önerilecek.
4. **ACIK-04 — V-206 storeyUsage ↔ BB kullanım uyumu:** Uyum tablosu tanımlı değil.
5. **ACIK-05 — V-165 "Mükerrer kullanım amacı":** TKGM mesajının tam anlamı doğrulanmalı (şartname notu).
6. **ACIK-06 — V-126 BB alan tanımı:** Ornek1'de 70 BB'nin 62'sinde `independentSectionCalculatedArea`, alt taban alanından ~0,9 m² büyük. Hangi yüzeyin alanı olduğu belirlenmeli; şimdilik UYARI.

## M6 ile açılan sorular (Claude, 08.11.2026)

7. **ACIK-07 — storeyUsage 1003 "nitelikli ortak alan":** Rehber, katta nitelikli OA varsa 1003 eklenmesini söylüyor. Hangi `commonAreaUsage` kodlarının "nitelikli" sayıldığı kod listesinde yok.
   - Yazıcı şimdilik katta herhangi bir OA varsa 1003 ekliyor.
   - Ornek5 Kat -1'deki `1003,1002` ile uyumlu.
8. **ACIK-08 — maksNumaratajIdentityNumber:** Eski kılavuz dosyalarında (Amasya, Sincan; rejim E) yok. Yeni dosyada (GroundSurface'li, rejim S) V-061 zorunlu sayıyor.
   - Bu numaranın kaynağı MAKS. Kullanıcı girmeli.
   - Kullanıcıya hangi ekranda sorulacağı belirlenecek (M7 sihirbazı).
9. **ACIK-09 — Üretilen GML'in resmi kabulü (§10.6): YANITLANDI — 08.11.2026, TKGM 3dbinadogrula: başarılı.** Ornek6'dan üretilen dosya resmi TKGM `3dbinadogrula` doğrulamasından başarılı sonuçla geçti (08.11.2026).

## M8 / KONTROL-M8 ile eklenen kural ve kararlar (08.11.2026)

10. **ACIK-10 — V-217 Oda (`BBK_` / `OA_`) 3B kabuk kapalılığı kuralı (`KONTROL-M8 R3`, Şartname §5.5 madde 6):**
    - **Gerekçe:** Eğik tavanlı / çatı arası odalarda duvar tepeleri ile tavan yüzleri birleşmediğinde (`openEdges > 0`), hem `volume` özniteliği hem geometrik hacim aynı eksik kabuktan hesaplandığında `V-158` hatayı yakalayamamakta; TKGM sunucusu ise `val3dity` ile açık kabuğu reddetmektedir.
    - **Uygulama:** `src/core/validation/rulesExtra.ts` içine `V-217` (`severity: 'H'`) eklendi. Her `BBK_` ve `OA_` nesnesinin `FloorSurface`, `InteriorWallSurface` / `WallSurface` ve `CeilingSurface` poligonlarının dış halkaları (ve taban/tavan yapısal K71 iç halkaları) T-kavşaklarda bölünerek (`checkRoomShellClosure`) kenar eşleşmesi denetlenir. Duvarlardaki kapı/pencere delikleri (`interiorRings`) açıklık poligonlarıyla kapalı sayılır (`V-172` ayrıca denetler). Resmi örneklerdeki 2 ondalık hane (`10 mm`) yuvarlama farklarını ve `val3dity` `1 cm` yakalama toleransını gözetmek için `10 mm` üzerinde açık kalan kenarlar `H` (HATA), `1–10 mm` arasındaki mikro açıklıklar `B` (BİLGİ) olarak raporlanır.
11. **ACIK-11 — Aynı duvar diliminde çakışan kapı ve pencere açıklıkları (`KONTROL-M8 R4`):**
    - **Gerekçe:** `Ornek2` gibi bazı kaynak dosyalarda balkon kapısı ile bitişik pencere delikleri aynı duvar diliminde ortak kenar paylaşacak veya üst üste binecek biçimde tanımlanmış olup üretimde `V-035` / `V-039` delik kesişmesi üretmektedir.
    - **Uygulama:** `fromImported.ts` içinde aynı kat, aynı duvar dilimi ve örtüşen Z aralığındaki açıklıklar tespit edilerek yatayda `10 mm` güvenlik payıyla örtüşmeyecek biçimde kırpılır (veya tamamen içeride kalıyorsa atlanır) ve `ExtractionNote` olarak kaydedilir. Ayrıca `generate.ts` içindeki `wallFaces` fonksiyonu aynı duvar parçasına düşen çakışık ikinci deliği `B-OP-10` (`U`) uyarısıyla eleyerek `V-035` / `V-039` oluşumunu engeller.

## KONTROL-M9 ile güncellenenler (Claude, 08.11.2026)

10. **ACIK-10 güncellemesi — V-217 ciddiyeti ölçüme göre UYARI'ya düşürüldü (KONTROL-M9 R1):**
    - 9 resmi dosyanın **kendisi** doğrulandı. V-217 (10 mm), TKGM'nin kabul ettiği 7 dosyada ihlal buldu: Ornek1 81, Ornek3 71, Ornek5 16, Ornek4 10, Sincan 9, Ornek2 8, Amasya 2 oda. Yalnız Ornek6 temiz.
    - TKGM bu dosyaları kabul ettiğine göre sunucu oda kabuğu kapalılığını bu sıkılıkta zorunlu tutmuyor. KARARLAR §A.7'deki ölçüme dayalı ciddiyet politikasıyla V-217 `U` oldu.
    - Uygulamanın **kendi ürettiği** odalar için kapalılık testlerde zorunlu kaldı (m5, m6, m8: `checkShell(...).closed`). Ölçüm: Ornek1, Ornek3, Ornek5 ve Ornek2'den üretilen dosyalarda V-217 = 0.
12. **ACIK-12 — Ornek2 kaynak hacim öznitelikleri kendi geometrisiyle tutmuyor:**
    - Ornek2'nin çatı arası odalarında `volume` özniteliği ile kaynağın kendi kapalı kabuğunun hacmi farklı. Örnek: 5_Banyo öznitelik 5,33 m³; 8_Oda 64,11 m³, kabuk 64,78 m³.
    - Kaynak yüzlerin hepsi ters yönlü (normal içe bakıyor).
    - Bu yüzden altın ölçüt "kaynak öznitelik ±0,05" değil, şu: **üretilen kabuk kapalı ve öznitelik = üretilen kabuğun hacmi**.
    - Ornek2'den üretilen 8 çatı arası odasının hacmi kaynak özniteliklerinden %0,2–1,3 farklı.
13. **ACIK-13 — Çatı arası pencerelerinin LoD2 karşılığı (Ornek2'de 6 × V-164):**
    - Çatı arası odaları artık doğru üretildiği için pencereleri yerine oturuyor.
    - Ancak çatı arası dış duvarı en üst katın sınırıyla aynı hatta değil (diz duvarı/çatı içinde). Bu yüzden T1 (bina dış yüzü) temsili üretilmiyor ve V-164 HATA kalıyor.
    - **Çözüm önerisi:** Çatı arası katı için ayrı bir dış sınır (çatı arası dış duvarı) tanımlanmalı. LoD2 duvarları ve T1 açıklıkları bu sınıra göre üretilmeli.
    - Ayrı bir iş; M10 sonrası.
