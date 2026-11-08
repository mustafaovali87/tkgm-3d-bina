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