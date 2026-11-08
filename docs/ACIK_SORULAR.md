# AÇIK SORULAR VE DOĞRULAMA BEKLEYEN MADDELER (`docs/ACIK_SORULAR.md`)

> **Kural (`K97` / `Mutlak Kural 1`):** Örnek dosyada veya normatif şartnamede (`claude_uygulama_sartnamesi_v3.md`, `docs/KARARLAR.md`) karşılığı olmayan hiçbir XML etiketi, öznitelik veya sınıf adı uydurulmaz; doğrulama bekleyen noktalar buraya kaydedilir.

## Kayıtlı Açık Sorular (`M0` / `KONTROL-M0` İtibarıyla)

1. **`ACIK-01` — Teras Nesnesinin `gml:id` Öneki (`KONTROL-M0 F11`, `CLAUDE12 Ek-A §A.2` & `OY-12 #35a`):**
   - **Doğrulanan Kısım (`KONTROL-M0 F11`):** `<bldg:class>Teras</bldg:class>` sınıf değeri `Ornek3-M-3446194-A.gml` dosyasında **9 kez** ölçülmüş ve **kesinleşmiştir** (açık soru değildir).
   - **Açık Kalan Tek Nokta:** `Ornek3-M-3446194-A.gml` içindeki bu 9 adet `<bldg:class>Teras</bldg:class>` nesnesinin gerçek `gml:id` öneki (`TRS_` mi yoksa `BLKN_` mi olduğu) `M1` öncesinde Claude tarafından `Ornek3` içinden ölçülerek bildirilecektir.
   - **Mevcut Uygulama:** Bu ölçüm paylaşılana kadar yeni üretimde varsayılan dış yapı sınıfı `Balkon` (`BLKN_`) olarak kullanılır; `TRS_` öneki teyit edilmeden üretimde kullanılmaz.
