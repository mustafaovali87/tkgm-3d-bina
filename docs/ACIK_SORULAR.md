# AÇIK SORULAR VE DOĞRULAMA BEKLEYEN MADDELER (`docs/ACIK_SORULAR.md`)

> **Kural (`K97` / `Mutlak Kural 1`):** Örnek dosyada veya normatif şartnamede (`claude_uygulama_sartnamesi_v3.md`, `docs/KARARLAR.md`) karşılığı olmayan hiçbir XML etiketi, öznitelik veya sınıf adı uydurulmaz; doğrulama bekleyen noktalar buraya kaydedilir.

## Kayıtlı Açık Sorular (`M0` İtibarıyla)

1. **`ACIK-01` — Teras (`TRS_`) Nesnesi `<bldg:class>` Değeri (`CLAUDE12 Ek-A §A.2` & `OY-12 #35a`):**
   - **Durum:** Normatif `claude_uygulama_sartnamesi_v3.md §3.10` içinde Teras nesnesi için `<bldg:class>Teras</bldg:class>` ve ID öneki `TRS_` tanımlıdır; ancak elimizdeki 6 resmi + 18 gerçek örnek dosyada `BLKN_` (`Balkon`) örneği bulunurken `TRS_` (`Teras`) örneği henüz ölçülmemiştir.
   - **Mevcut Uygulama:** `OY-12 #35a` kararı gereği varsayılan dış yapı sınıfı `Balkon` (`BLKN_`) olarak kullanılır; `Teras` (`TRS_`) seçeneği gerçek bir TKGM kabul örneğiyle teyit edilene kadar açık soru olarak izlenmektedir.
