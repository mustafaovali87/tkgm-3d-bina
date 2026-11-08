# TKGM 3B SAYISAL YAPI MODELİ (CityGML 2.0) — KESİN KARAR LİSTESİ (`docs/KARARLAR.md`)

> **Kaynaklar:** `claude_uygulama_sartnamesi_v3.md`, `CLAUDE12.md Ek-A`, `CLAUDE13.md §1–§4`, `AISTUDIO_BASLANGIC_TALIMATI.md`, `DOSYA_LISTESI.txt`
> **Sürüm:** `v3.5.5` (`M0` Çekirdek Kilidi)

---

## A.1 Dosya Kuralları
- **Standart (`K01`, `V-004`):** CityGML 2.0 + GML 3.1.1 (`http://www.opengis.net/gml`). GML 3.2 yasaktır (`-904`).
- **Kodlama (`K02`, `V-003`):** UTF-8, **BOM'suz**, satır sonu `CRLF` (`\r\n`). İlk satır: `<?xml version="1.0" encoding="utf-8"?>` (`encoding="utf-8"` küçük harf).
- **Dosya Adı (`K03`, `K04`, `V-001`, `V-002`, `V-010`):** `M-<constructionID>.gml`. Dosyada tam 1 adet `bldg:Building` bulunur.
- **CRS (`K06`, `K07`, `V-014`, `V-015`, `V-021`):** `srsName="EPSG:5253…5259"` ve `srsDimension="3"` **yalnız** `gml:Envelope` üzerinde bulunur. Polygon, MultiSurface vb. alt elemanlarda `srsName` **yasaktır**.
- **Koordinat Sırası ve Kot (`K08`, `K10`, `V-020`, `V-201`):** `Y(doğu/easting) X(kuzey/northing) Z(ortometrik gerçek kot, TUREF)`. Yerel `0` tabanlı kot yasaktır.
- **Sayı Biçimi (`K09`, `K70`, `V-030`, `CLAUDE13 §2.2`):**
  - Üretimde (`GMLWriter`): `gml:posList`, koordinatlar her zaman tam 3 ondalık (`toFixed(3)`), alan/hacim/yükseklik `toFixed(2)`.
  - Okumada (`GMLReader`): Hem `gml:pos` hem `gml:posList` ve **1–12 ondalık hane** kabul edilir. İçe alınan dosyada `≠ 3` ondalık hane (`< 3` veya `> 3`) **yalnızca `V-030 BİLGİ (B)`** düzeyindedir, asla `HATA` değildir (18 gerçek kabul dosyasında Z koordinatları 2 hanelidir).

---

## A.2 Kimlik (`gml:id`), Adlar (`gml:name`) ve Sınıflar
- **`gml:id` Biçimi (`K12`, `K92`, `V-050`, `V-051`):** `<Önek>_<küçük harf deterministik uuidv5>`. Süslü parantez yok, dosya içinde tekrar yok.
  - **Kilitli `UUIDv5` Ad Alanı (`K92`, `F12`):** `TKGM3D_UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"` (`M3` ve sonraki tüm sürümlerde aynı deterministik `gml:id` üretimini garanti etmek üzere kalıcı olarak kilitlenmiştir).
  - **Nesne Önekleri (12 adet — `V-052`):** `MB_`, `K_`, `BB_`, `BBK_`, `OA_`, `BBKIY_`, `OAIY_`, `BLKN_`, `TRS_`, `MBG_`, `KAPI_`, `PEN_`
  - **Poligon Önekleri (14 adet — `V-053`):** `Floor_`, `Wall_`, `Roof_`, `InteriorWall_`, `Ceiling_`, `Ground_`, `OuterFloor_`, `OuterCeiling_`, `Closure_`, `Lod1Poligon_`, `Lod0FootPrint_`, `Lod0RoofEdge_`, `Door_`, `Window_`
  - **Halka Önekleri (3 adet — `V-054`, `V-055`):** `LinearRing_`, `DoorLinearRing_`, `WindowLinearRing_`
- **`gml:id` Verilmeyecek Elemanlar (`K13`, `V-056`):** `*Surface` (`WallSurface`, `RoofSurface`, `GroundSurface`, `FloorSurface`, `InteriorWallSurface`, `CeilingSurface`, `OuterFloorSurface`, `OuterCeilingSurface`), `MultiSurface`, `Solid`, `CompositeSolid`, `CompositeSurface`, `MultiCurve`, `LineString`.
- **`gml:name` Kuralı (`K14`, `V-058`, `V-059`):** Yalnızca nesnelere ve `*Surface` elemanlarına (`Duvar`, `Çatı`, `Zemin`, `Taban`, `Tavan`, `İçDuvar`, `DışTaban`, `DışTavan`) verilir; `gml:Polygon` ve `gml:LinearRing` elemanlarına `gml:name` verilmez.
- **`constructionID` (`K19`, `V-070`, `V-071`):** `<takbisPropertyIdentityNumber>-<HARF>` (örn. `70125626-A`; `blockName` `"-1"` olsa bile harf korunur).
- **Sınıf Değerleri (`V-057`):**
  - `bldg:class`: `MimariBina`, `BagimsizBolumKisim`, `OrtakAlan`, `BagimsizBolumKisimIcYapi`, `OrtakAlanIcYapi`, `Balkon`, `Teras`. Kapı ve Pencerede `bldg:class` **yoktur** (`V-204`).
  - `grp:class`: `Kat`, `MimariBinaGrup`.
  - `gen:class`: `BagimsizBolum` (`Ornek6`'dan doğrulandı; `gen:function`/`gen:usage` yoktur).
- **Referanslar (`K93`, `V-211`):** Tüm `xlink:href` değerleri `#` ile başlar (`xlink:href="#MB_..."`). `independentSectionObjectReference` ve `storeyObjectReference` değerleri ise `#` olmadan ID metnidir (`BB_...`, `K_...` veya `-1`).

---

## A.3 Öznitelik Beyaz Listesi (`ALLOWED_GENERIC_ATTRIBUTES` — Kodda Sabit, 45 Adet)

### 1. `Ornek6` (`fixtures/ornek6.gml`) İçinden Doğrulanan 42 `gen:*Attribute` (`ad:tip`):
1. `additionalNote:string`
2. `architecturalPlanID:string`
3. `architecturalProjectConfirmationDate:date`
4. `blockName:string`
5. `blockNumber:string`
6. `buildingHeight:double`
7. `buildingType:int`
8. `calculatedArea:double`
9. `constructionID:string`
10. `doorUsage:int`
11. `elevatorCount:int`
12. `entrance:string`
13. `geometrySuitability:int`
14. `independentSectionCalculatedArea:double`
15. `independentSectionCardinalDirection:int`
16. `independentSectionCount:int`
17. `independentSectionNumber:string`
18. `independentSectionObjectReference:string`
19. `independentSectionPlanGrossArea:double`
20. `independentSectionPlanNetArea:double`
21. `independentSectionUsage:int`
22. `integrationState:int`
23. `maksIdentityNumber:int` *(Modelde `string | bigint | null`, XML'de `gen:intAttribute` — `V-213`)*
24. `maksIntegrationState:int`
25. `maksNumaratajIdentityNumber:int` *(Modelde `string | bigint | null`, XML'de `gen:intAttribute` — `V-213`)*
26. `parcelNumber:string`
27. `partCount:int`
28. `partUsage:int`
29. `planArea:double`
30. `propertyLot:string`
31. `registeredFloorDefinition:string`
32. `registeredInstallation:string`
33. `registeredQuality:string`
34. `roofProjectionArea:double`
35. `storeyNumber:string`
36. `storeyUsage:int`
37. `takbisNeighbourhoodReference:int`
38. `takbisPropertyIdentityNumber:int`
39. `tenderRegistrationNumber:string`
40. `totalIndependentSectionCount:int`
41. `volume:double`
42. `windowUsage:int`

### 2. Ortak Alan (`OA_`) ve İç Yapı (`BBKIY_` / `OAIY_`) İçin Ek 3 `gen:*Attribute`:
43. `commonAreaUsage:int` (`OA_` içinde — değerleri `partUsage.xml` kod listesinden okunur)
44. `storeyObjectReference:string` (`OA_` içinde)
45. `roomInstallationUsage:int` (`BBKIY_` / `OAIY_` içinde)

### 3. Kesinlikle Yazılmayanlar (`YASAK` — `V-060`, `K67`, `K68`, `K88-yeni`, `V-216`):
- `measuredHeight`, `lod2Solid`, Texture/Appearance (`app:Appearance`), `verticalDatum`, `storeyHeight`, `calculatedVolume`, `grp:function`, **malik/kişi bilgileri (`Malik`)** ve listede olmayan hiçbir ad.

---

## A.4 Tapu / Beyan Verileri (`K88-yeni`), `Malik` Modeli ve `K83` İptali (`CLAUDE13 §1`)
- **`K88-yeni`:** `independentSectionNumber`, `propertyLot`, `registeredQuality`, `registeredInstallation`, `registeredFloorDefinition`, `maksIdentityNumber` ve **malikler (`Malik`)** kullanıcı verisidir. Kullanıcı bu verileri elle girebilir, tablodan/listeden yapıştırabilir ve her zaman serbestçe değiştirebilir (kilitli alan yoktur). İsteğe bağlı `otomatikOneri` ayarı (`kapalı` / `açık`, varsayılan: `kapalı`) yalnızca kullanıcı onayıyla yazar.
- **`Malik` (Kat İrtifakı / Malik Listesi) Veri Modeli (`src/core/model/malik.ts`):**
  - `interface Malik { bbAnahtari: string; adSoyadVeyaUnvan: string; tcKimlikVeyaVergiNo?: string; hissePay: bigint; hissePayda: bigint; not?: string; }`
  - Bir bağımsız bölümde birden fazla hissedar (`Malik`) bulunabilir; bir BB içindeki malik hisseleri toplamı `BigInt` kesir aritmetiği ile hesaplanır ve `∑(hissePay / hissePayda) ≠ 1` ise **`V-208 BİLGİ`** üretilir (GML doğrulamasını engellemez).
  - **GML Yasağı:** Malik bilgileri **yalnızca** proje dosyasında (`.tkgm3b` / `.tkgm3d`) ve kullanıcının kendi dışa aktardığı malik/kat irtifakı listesi raporlarında tutulur; **TKGM CityGML (`.gml`) dosyasına asla yazılmaz**.
- **`K83` İptali:** `stripPersonalData.ts` modülü kullanıcı kararıyla iptal edilmiş ve `M0` kapsamından çıkarılmıştır.

---

## A.5 15 Resmi Referans Dosyası ve SHA-256 Kilidi (`CLAUDE13 §2.1`)
- `fixtures/ornek6.gml` (`717200` B, SHA-256: `7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03`)
- `resources/codelists/*.xml` altındaki 14 resmi XML kod listesi (`resources/DOSYA_LISTESI.txt` ile bayt-bayt kilitli). `commonAreaUsage.xml` adında ayrı bir dosya yoktur; `commonAreaUsage` özniteliği `partUsage.xml` dosyasından okunur.

---

## A.6 Arayüz Yerleşimi (`KARAR D-23` — `claude_uygulama_sartnamesi_v3.md §7.2, §7.4, §7.6, §7.7`)

### D-23.1 Varsayılan Yerleşim (Şartname §7.2 Aynen Korunur)

```text
┌─────────────┬────────────────────────────┬────────────────────────────┐
│ PROJE AĞACI │ 2B ÇİZİM (aktif kat)       │ 3B SAHNE (canlı)            │
│  ~%15       │  ~%45                      │  ~%40                       │
├─────────────┴────────────────────────────┼────────────────────────────┤
│ DOĞRULAMA PANELİ (H/U/B, tıkla → git)     │ ÖZNİTELİK PANELİ (seçili)   │
└──────────────────────────────────────────┴────────────────────────────┘
```

### D-23.2 Paneller Esnek Olacak
1. **Boyutlandırma:** Panel sınırları sürüklenerek değişir. Her panel daraltılıp açılabilir.
2. **Kütüphane:** `react-resizable-panels` (MIT) önerilir. npm ile kurulur ve derlemeye gömülür (`K91`).
3. **Hazır Düzenler:** Görünüm menüsünde ve kısayolla seçilir.

   | Ad | Kısayol | Kullanım | Düzen |
   |---|---|---|---|
   | **Standart** | `F5` | Varsayılan | D-23.1 |
   | **Yan Yana** (kullanıcının tarif ettiği) | `F6` | — | Sol yarı 2B çizim; sağ yarıda üstte 3B, altta ağaç ve öznitelik |
   | **Çizim** | `F7` | Plan çizerken | 2B büyük; 3B küçük önizleme; ağaç daraltılmış |
   | **Denetim** | `F8` | Hazır GML incelerken | 3B büyük; doğrulama paneli geniş; 2B gizli |

   - **Not:** Hazır GML incelenirken 2B paneli gizlenir, çünkü içe aktarılan GML'de çizim katmanı yoktur (`§7.7`).
4. **İkinci Monitör:** 3B sahne `"Ayrı pencerede aç"` komutuyla ikinci bir Electron penceresine taşınabilir.
   - Seçim ve vurgulama iki pencere arasında eş zamanlı kalır.
   - Pencere kapanınca 3B sahne ana pencereye geri döner.
   - Tarayıcı geliştirme ortamında bu komut gizlenir.
5. **Küçük Ekran (genişlik `< 1366 px`):**
   - 2B ve 3B tek alanda sekme olarak gösterilir.
   - Ağaç açılır kenar paneli olur.

### D-23.3 Seçim Eşgüdümü (Zorunlu)
- **Tek Seçim Kaynağı:** Seçili nesne tek bir `selection` durumunda tutulur.
  - Ağaçta, 2B'de, 3B'de veya doğrulama panelinde yapılan seçim diğer üçünde de vurgulanır.
  - Öznitelik paneli bu seçimi gösterir.
- **Çift Tıklama:**
  - Ağaçta bir kata çift tıklanınca 2B'de o kat aktif olur.
  - 3B'de o kat öne alınır (kat patlatma veya kesit).
- **Hata Seçimi:** Doğrulama panelinde bir hata seçilince ilgili poligon 3B'de kırmızı olur ve kamera oraya gider (`§7.6`). Nesnenin 2B karşılığı varsa 2B'de de gösterilir.

### D-23.4 Arayüz Durumu ve Kanonik Özet
- **Nerede Saklanır:**
  - Panel boyutları, seçili hazır düzen, kamera ve ayrı pencere durumu, **kullanıcı ayarı** olarak saklanır (Electron `userData`).
  - Bunlar proje dosyasına (`.tkgm3b`) **yazılmaz**.
- **`K89`:** Bu durumlar kanonik model özetini **değiştirmez**. Test:
  - Aynı model iki farklı yerleşimde aynı özeti vermeli.
  - Aynı model farklı nesne sırasıyla da aynı özeti vermeli.

### D-23.5 Aşamalara Dağılım (Yol Haritası §11 Değişmez)

| Aşama | Yerleşimde Gelen |
|---|---|
| **M1** | Pencere iskeleti, D-23.1 düzeni, boyutlandırma, ağaç + 3B görüntüleyici + öznitelik paneli (içe aktarılan GML için), seçim eşgüdümü. 2B paneli yer tutucu: `"M4'te gelecek"`. |
| **M2** | Doğrulama paneli, tıkla → git. |
| **M4** | 2B çizim editörü (`§7.4`), Çizim ve Yan Yana hazır düzenleri tam çalışır. |
| **M6** | Çizimden canlı 3B (her değişiklikte 3B yenilenir; `300 ms` gecikmeli toplu güncelleme önerilir). |
| **M7** | DXF ve resim altlık katmanı. |
| **M10** | İkinci monitör penceresi paketlenmiş Electron'da test edilir. |

### D-23.6 Kabul Testi (`M1` Sonunda Kontrol Edilecek)
1. `Ornek6` açılır.
2. Ağaçta `BBK_` seçilince 3B'de aynı nesne vurgulanır ve öznitelik panelinde `partUsage` görünür.
3. Panel boyutları değiştirilip uygulama kapatılıp açılınca aynı kalır.
4. Hazır düzenler `F5–F8` ile değişir. Kanonik özet değişmez.
5. Genişlik `1280 px`'e indirilince sekme düzenine geçer.



---

## A.7 M2 Doğrulayıcı — Rejim ve Ölçüme Dayalı Ciddiyetler (Claude, 08.11.2026)

- **Rejim (N19, AS-1):**
  - Binada GroundSurface varsa **S** (Sürdürülebilirlik), yoksa **E** (eski kılavuz).
  - Rejim E'de o dönem istenmeyen öğelerin eksikliği BİLGİ'dir: MAKS/tapu öznitelikleri, GroundSurface, açıklıklar, boş blockName, Envelope dışı TIC, BB'de `InteriorWall_`.
- **Ölçüme dayalı UYARI'lar:** Şartnamede H olan şu kurallar, TKGM'nin kabul ettiği resmi örneklerde ihlal edildiği için U'dur. Ölçümler `docs/M2_DOGRULAYICI.md` §4'te.
  - V-076, V-096 (çatı en alçak noktası kısmı), V-117, V-126, V-137, V-138, V-163.
  - V-164'ün "açıklık 10 cm'den fazla taşıyor" kısmı.
- **V-158:** Oda hacmi, tavan altı prizma yöntemiyle hesaplanır; %1'den büyük sapma UYARI'dır.
- **§6.14 bilinen istisnalar** `src/core/validation/knownSampleExceptions.ts` dosyasındadır.
  - Şu an tek kayıt: Ornek2 V-186 (balkon 1002).
  - Eşleşen bulgu silinmez, BİLGİ'ye düşer ve gerekçesi gösterilir.
- **Kabul ölçütü (M2 ve sonrası):** 8 kabul dosyasında 0 HATA; ret dosyasında V-202 HATA. Bir kural değişikliği bu ölçütü bozarsa geri alınır.

---

## A.8 M3 Düzeltici ve Yazıcı (Claude, 08.11.2026)

- **Düzeltme kipi (varsayılan, K70):**
  - Yalnız öznitelik ve ad metinleri değişir.
  - Geometri metni korunur; 3 haneden kısa koordinatlar sıfırla 3'e tamamlanır (OY-02).
  - Düzenleme yoksa ve tamamlanacak koordinat yoksa çıktı girdiyle bayt bayt aynıdır.
- **Normalize:**
  - `posList` + tam 3 ondalık; ardışık eş noktalar silinir; int/double değerler kırpılır; CRLF, BOM yok.
  - Sonrasında doğrulama yeniden çalışır ve kural bazında öncesi/sonrası farkı gösterilir.
- **Alanlar:** `calculatedArea` (kısım ve OA), taban poligonlarının alanından 2 ondalıkla yeniden yazılabilir. Normalize sonrası V-155 için önerilir.
- **Ad kuralları:** Tek kaynak `src/core/gml/names.ts`. V-058 denetimi ve "Adlar" düğmesi bu dosyayı kullanır.
- **Yazıcı güvenliği:**
  - Beyaz liste dışı öznitelik yazılmaz (K99). Malik alanları bu yüzden GML'e yazılamaz.
  - Var olan özniteliğin tipi değiştirilmez; tekrar eden öznitelik düzenlenmez.