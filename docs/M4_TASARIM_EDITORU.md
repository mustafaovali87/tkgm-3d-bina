# M4 — TASARIM MODELİ VE 2B EDİTÖR

> **Yazan:** Claude, kullanıcı adına, 08.11.2026. Gemini'nin günlük limiti dolduğu için kullanıcının isteğiyle Claude yazdı.
> **Kaynaklar:** Şartname §4.1–§4.2 (veri modeli), §5.2 (kot motoru, asma kat), §5.3 (çizim anı denetimleri), §7.4 (çizim araçları), §7.5 (canlı göstergeler), §10.4 (altın senaryo), §11 (M4 kabul: "Ornek6 planı çizilebiliyor").

## 1. Kabul sonucu

| Ölçüt | Sonuç |
|---|---|
| Ornek6 planı editörde çizilebiliyor | ✔ Test: 2 kat sınırı, 2 BB parçası ve 16 kısım, altlık üzerinde 3–5 mm gürültülü tıklamalarla editör komutlarıyla çizildi. Snap bütün köşeleri altın tasarıma mm düzeyinde oturttu; toplam alan farkı 0. |
| Ornek6 kısım alanları | ✔ 16/16 kısım GML `calculatedArea` ile ±0,01 m² içinde; BB parçaları `independentSectionCalculatedArea` ile ±0,01 m² içinde |
| Kotlar | ✔ Kat_Z alt 1095,900, Kat_1 alt 1098,700, kat yüksekliği 2,800 (±1 mm) |
| Çizim denetimi | ✔ Altın tasarım ve çizilen plan: 0 HATA |
| Tarayıcıda gerçek fare ile | ✔ Kat sınırı aracıyla altlık köşelerine tıklandı; çizilen sınır altlıkla mm düzeyinde aynı, alan **91,34 m²** (şartname §10.4 değeri) |
| Komutlar | `typecheck` 0 hata, `npm test` **95/95** |

## 2. Modüller (`src/core/design/`, saf TS)

| Dosya | İçerik |
|---|---|
| `types.ts` | §4.2 tasarım modeli: `DesignProject`, `Storey`, `IndependentSection`, `SectionPart`, `Part`. mm tamsayı, köken tam metre. Eklenen alanlar: `zFloorOverride` (asma kat, §5.2 ÖNERİ), `remote` (uzak kısım, §4.2), `idSeq` (deterministik kimlik). |
| `geometry2d.ts` | Tamsayı mm geometri: alan, yön, basitlik, nokta-çokgen, içerme. Kesişim alanı: kulak kırpma ile üçgenleme + Sutherland–Hodgman; delikler dahil. |
| `snap.ts` | §7.4 sırası: **köşe > kenar orta > kenar üzeri > dik > paralel > ızgara 1 cm**. Tolerans ekranda 8 piksel. Ortogonal kilit. Sonuç her zaman mm tamsayı. |
| `editor.ts` | Saf durum makinesi. Araçlar: Seç / Kat sınırı / BB / Kısım / Ortak alan / Ölçü. Ayrıca geri al/yinele, silme, kat ve bölüm ekleme. Kısım içinde kalan BB parçasına otomatik bağlanır; kısmın içine çizilen kısım **dış kısımda delik** açar. Kimlikler `uuidv5` ile üretilir (`randomUUID` yok). |
| `checks.ts` | §5.3 çizim anı denetimleri (aşağıda §3). |
| `projectFile.ts` | `.tkgm3b` proje dosyası (JSON, deterministik). Malik listesi yalnız burada; BigInt metin olarak saklanır. mm tamsayı olmayan koordinat reddedilir. |
| `fromImported.ts` | İçe aktarılan GML'den tasarım çıkarır (§10.4 "yarı otomatik"). Fiziksel kat taban kotundan bulunur; asma kat ve uzak kısım tespit edilir. |

**Arayüz:** `src/editor2d/DesignEditor2D.tsx`. 2B panel başlığında **GML İzdüşümü / Tasarım Editörü** geçişi var.
- **Çizim alanı:** SVG, mm koordinat. Kaydırma orta/sağ tuşla, yakınlaştırma tekerlekle; "sığdır" düğmesi.
- **Snap göstergesi:** Durum satırında snap türü yazar.
- **Altlık:** İçe aktarılan GML planı altlık olarak açılıp kapatılabilir.
- **Canlı alan:** Kısım etiketlerinde canlı alan var. Plan alanından sapma %10'u aşarsa etiket kırmızı olur (§7.5).
- **Yan sütun:**
  - araçlar
  - aktif kat ve liste beyan bölümü
  - kullanım kodları (`partUsage.xml`'den)
  - seçili elemanın özellikleri
  - denetim listesi (tıklayınca eleman seçilir)
  - proje kaydet/aç, "GML'den tasarım çıkar", "Boş çizimle başla"
- **Kısayollar:** V/K/B/R/O/M, Enter veya çift tık kapatır, Esc vazgeçer, Delete siler, Ctrl+Z/Y geri al/yinele, Shift dik/yatay çizer.

## 3. Çizim anı denetimleri (§5.3)

| Kod | Dosya kuralı | Düzey | Denetim |
|---|---|---|---|
| T-01 | V-034 | H | Çokgen basit (kendini kesmez, ardışık eş nokta yok) |
| T-02 | V-038 | U | En kısa kenar ≥ 10 mm |
| T-03 | V-125 | H | BB parçası kat sınırının içinde. Tolerans: dışta kalan alan ≤ çevre × 1 mm. Çatı arası (usage 1004) için U (§5.9). |
| T-04 | V-162 | H | Kısım bağlı olduğu BB parçasının içinde (dışta ≤ 0,1 m²). Uzak kısım hariç; çatı arasında U. |
| T-05 | V-100 | H | Aynı kottaki BB parçaları ve OA'lar örtüşmez (≤ 0,1 m², delikler hesaba katılır) |
| T-06 | V-162 | H | Aynı kottaki kısımlar örtüşmez (≤ 0,1 m²; iç kısım/delik ilişkisi hariç) |
| T-07 | V-157 | U | Çizim alanı ile plan alanı farkı ≤ %10 |
| T-08 | V-160 / V-061 | H | Kısım bir BB parçasına, BB parçası bir bağımsız bölüme bağlı |

## 4. Ölçüm: 9 resmi dosyadan tasarım çıkarma (yerelde)

| Dosya | BB parçası | Kısım/OA | Alan ±0,01 | Çizim denetimi |
|---|---|---|---|---|
| Ornek1 | 70 | 840 | 839/840 | 0 H |
| Ornek2 | 17 | 50 | 50/50 | 0 H, 4 U (çatı arası) |
| Ornek3 | 181 | 967 | 951/967 | 0 H |
| Ornek4 | 26 | 138 | 137/138 | 0 H (4 uzak kısım) |
| Ornek5 | 27 | 99 | 99/99 | 0 H, 8 U (plan alanı sapması) |
| Ornek6 | 2 | 16 | 16/16 | 0 H |
| Amasya | 2 | 18 | 18/18 | 0 H |
| Sincan | 16 | 157 | 157/157 | 0 H |
| Ret dosyası | 2 | 16 | 16/16 | 0 H, 3 U |

**Alan farkı:** ±0,01 m² dışında kalan 18 kısım (Ornek3'te 16, Ornek1 ve Ornek4'te birer) koordinatların mm ızgarasına oturtulmasından kaynaklanıyor (§4.1). M3'teki Normalize ile aynı etki.

**Ölçümle bulunan ve modele işlenen yapı özellikleri:**
- **Çok katlı BB parçası:** GML'de giriş katının grubuna bağlı (Ornek4), bu yüzden fiziksel kat taban kotundan bulunur.
- **Asma kat:** Aynı katta farklı kotlu odalar var (Ornek1 teknik hacim) → `zFloorOverride`.
- **Çatı arası:** BB'ler en üst katın üstünde (Ornek2) → en üst kata bağlanır, kotu korunur.
- **Döşeme delikleri:** Şaft ve iç odalar BB ve otopark tabanında delik olarak var (Ornek1, Ornek3); örtüşme hesabı delikleri dikkate alır.
- **Uzak kısım:** Kiler ve teknik hacim BB'sinden ayrı yerde (Ornek4) → `remote`.

## 5. Kapsam dışı (sonraki aşamalar)

| Konu | Aşama |
|---|---|
| Açıklıklar (kapı/pencere), balkon/teras, iç yapı çizimi | M5–M6 ve M8 |
| Tasarımdan 3B B-rep ve GML üretimi | M5–M6 |
| DXF ve raster altlık, Helmert konumlandırma | M7. Şu an altlık = içe aktarılan GML planı. |
| Köşe sürükleyerek düzenleme | Sonraki sürüm. Şu an sil ve yeniden çiz; geri al/yinele var. |
| Kat sınırını BB ∪ OA'dan öneren yardımcı | KOLAY listesi |
| Tasarımın App düzeyine taşınması | M5'te 3B üretimi beslemek için. Şu an editör kendi durumunu tutuyor; proje dosyası ile kalıcı. |
