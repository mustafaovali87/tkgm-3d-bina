# M8 — Çatı Arası ve Özel Durumlar (`docs/M8_CATI_ARASI_VE_OZEL_DURUMLAR.md`)

> **Kapsam:** `claude_uygulama_sartnamesi_v3.md §3.5–§3.9`, `§4.2`, `§4.3`, `§5.2`, `§5.3`, `§5.4 #6`, `§5.5`, `§5.9`, `§5.10`, `§5.11`, `§5.12`, `§11`, `KONTROL-M8 (R1–R5)`

---

## 1. Çatı Arası Kesimi ve Eğik Tavanlı Hacimler (`src/core/brep/atticClip.ts`, `src/core/brep/generate.ts`, `§5.9`, `§5.12`)

1. **Çatı Zarfı (`RoofEnvelope`) ve Kat Tavanını Aşan Çatı Arası Odalar / BB'ler (`KONTROL-M8 R1`):**
   - Parametrik çatı kipleri (`gable` beşik, `hip` kırma, `shed` tek eğim/sundurma) ve içe aktarılmış elle çatı yüzleri (`manual`) için her `(x, y)` noktasındaki tavan/çatı kotu $z_{\text{roof}}(x, y)$ ve düzlem sırt/mahya kırık doğruları hesaplanır.
   - `isAtticStorey(building, storey)` fonksiyonu yalnız `Storey.clipToRoof` veya `Roof.eaveZ` koşuluna değil; aynı zamanda kata `zFloorOverride >= zCeiling(storey)` ile bağlanan çatı arası `Part` / `SectionPart` (`usage: 1004`), `zTopOverride > zCeiling(storey)` veya `Part.ceilingFaces` varlığına da bakar (`Ornek2` uyumu).
   - Oda için efektif tavan üst sınırı `partTopZ(part, ctx)` ve BB küveti için `spTopZ(sp, ctx)` hesaplanarak `zFloorOverride >= zCeiling(storey)` olan çatı arası odalarda ve BB küvetlerinde duvarların `zCeiling(storey)` ile erken kesilmesi engellenir; duvarlar tavan yüzlerinin / çatı zarfının gerçek kotuna ($z_{\text{top}}(x, y)$) kadar uzanır.
   - Aynı katta hem normal kat odaları (`[zFloorTop, zCeiling]`) hem de `zFloorOverride` ile üst kotta yer alan çatı arası odaları (`Ornek2` `Kat_2`) bulunduğunda, normal kat odalarının düz tavanı `zCeiling` kotunda korunur; yalnızca çatı zarfıyla kesişen veya çatı arası kotunda olan hacimler çatıya göre kırpılır.
2. **İçe Aktarılmış Eğik Tavan Yüzleriyle (`ceilingFaces`) Duvar Tepelerinin Birebir Kenetlenmesi (`prepareExplicitCeilingForPoly`):**
   - `Part.ceilingFaces` veya `RoomInstallation.ceilingFaces` bulunduğunda, tavan dış sınır köşeleri $\le 3\text{ mm}$ içindeki oda köşe ve kenarlarına oturtulur; oda köşelerinin üzerine düşen tavan kenarları o köşede bölünür.
   - Tavan yüzleri kümesinin eşleşmemiş yönlü 3B dış sınır yarı-kenarları ($\partial(\text{Ceiling})$) her oda duvar kenarı ($a \to b$) boyunca zincirlenerek duvarın üst profilini (`topProfileForEdge(a, b)`) oluşturur. Böylece duvarların üst kenarları ile `ceilingFaces` dış kenarları birebir aynı 3B `(x, y, z)` köşelerini paylaşır ve `checkShell(r).closed === true` (`openEdges = 0`) garanti edilir.
   - Bir duvar kenarı üzerinde kapı veya pencere açıklığı varken açıklığın yatay açıklık aralığına (`[lo, hi]`) düşen mahya/T-kavşağı noktaları duvarı dikey olarak bölmez (`B-OP-01` önlemi); bunun yerine duvarın üst kenar zincirine (`topChain`) tepe köşesi olarak eklenir.
3. **Tek `CeilingSurface`, Iraksama Hacmi ve Açıklık Çözümleme (`§5.4`, `§5.9 #5`, `§5.12`):**
   - Bir odanın tüm düz ve eğik `Ceiling_` poligonları **tek bir `<bldg:CeilingSurface>`** altında toplanır (`§5.9 #5`).
   - Oda hacmi, kapalı kabuk üzerinden 3B ıraksama teoremiyle (`checkShell` / `V-158` tavan altı prizma hacmiyle birebir eşdeğer, $\pm 0{,}05\text{ m}^3$ doğrulukta) hesaplanır.
   - `resolveOpening` içinde açıklıklar `hostPartId` ve `zBaseOverride` ile kendi kat/çatı-arası kotundaki (`[z0, z1]`) odaya ve BB küvetine bağlanır; alt kat pencerelerinin aynı `(x, y)` izdüşümündeki çatı arası odalarına yanlış bağlanarak sahte `B-OP-02` üretmesi engellenir.

---

## 2. İç Yapı: `BBKIY_` ve `OAIY_` (`RoomInstallation` — `§3.9`, `§4.2`)

1. **Veri Modeli ve Kurallar:**
   - `DesignBuilding.installations` dizisinde `RoomInstallation` (`id`, `partId`, `usage: 1001 | 1002 | 1003`, `polygon`, `zTopOverride`, `ceilingFaces`) olarak tutulur (`1001 = Merdiven`, `1002 = Sütun`, `1003 = Asansör`).
   - `BBK_` içindeyse `BBKIY_`, `OA_` içindeyse `OAIY_` öneki ve `BagimsizBolumKisimIcYapi` / `OrtakAlanIcYapi` sınıfı alır.
   - `<gml:name>` değeri `src/core/gml/names.ts` içinde `BBKIY_` için `{BagimsizBolumNo}_{partUsageAdı}_İç Yapı`, `OAIY_` için `{commonAreaUsageAdı}_İç Yapı` olarak üretilir (`V-058`).
   - **Kritik Kural (`§3.9`):** İç yapı kendi `FloorSurface`, `InteriorWallSurface` ve `CeilingSurface` poligonlarına sahiptir; **bağlı olduğu odanın `FloorSurface` poligonundan delik olarak çıkarılmaz**.
2. **XML Yazımı ve İçe Aktarma (`cityGmlWriter.ts`, `fromImported.ts`):**
   - İlgili `<bldg:Room>` içinde `</bldg:boundedBy>` sonrasında `<bldg:roomInstallation><bldg:IntBuildingInstallation gml:id="BBKIY_...|OAIY_...">` olarak yazılır (`§3.9`).
   - `designFromImportedModel` içe aktarılan GML'deki `BBKIY_` ve `OAIY_` nesnelerini `parentGmlId` üzerinden ilgili `Part` (`BBK`/`OA`) elemanına bağlayarak geri çıkarır.

---

## 3. Özel Durumlar (`K71`, Dubleks, Asma Kat, Uzak Kısım, Sahanlık Penceresi, OA Dış Duvarı, Kademeli Katlar, `V-217`)

1. **İç Kısım (`K71` — Oda İçinde Oda, `§5.3`, `§5.5`):**
   - Aynı katta ve aynı taban kotunda bir `Part` (`BBK`), başka bir `Part` çokgeninin tamamen içindeyse (`ringInsidePoly`), dış odanın `Floor_` ve `Ceiling_` poligonlarında otomatik olarak iç halka (delik) açılır, delik çevresinde `InteriorWall_` yüzeyleri üretilir ve `BB_` küvetinde (`W`) iç odanın duvarları ada olarak korunur.
2. **Dubleks / Çoklu Kat (`groupStoreyId`, `emitStoreyObject`, `usage: 1003 / 1004` — `§4.2`, `§4.3`):**
   - Çok katlı bağımsız bölümün üst kat parçaları (`SectionPart`) fiziksel katında (`storeyId`) çizilirken GML grup üyeliği `groupStoreyId` ile giriş katına (`K_`) bağlanabilir (`Ornek4` uyumu).
   - Ayrı `K_` nesnesi olmayan çatı arası / dubleks katlarda `Storey.emitStoreyObject = false` seçildiğinde `K_` nesnesi üretilmez, `storeysAboveGround` yalnız `emitStoreyObject !== false` olan katları sayar ve bu kattaki ortak alanların (`OA_`) `storeyObjectReference` özniteliği `"-1"` olarak yazılır (`§4.2`).
3. **Kademeli Katlar ve Boolean Halka Temizliği (`src/core/brep/polyBoolean2d.ts`, `KONTROL-M8 R2` — `§5.10`):**
   - Ardışık iki kat (`L` alt, `U` üst) farklı dış sınıra sahip olduğunda `subtractPolygons2DWithStatus` ile `L.outline − U.outline` → `OuterFloorSurface` (`zCeiling(L)`) ve `U.outline − L.outline` → `OuterCeilingSurface` (`zFloorBottom(U)`) üretilir.
   - **Diken ve Kıymık Temizliği (`R2`):** Kat sınırlarının $1\text{ mm}$ düzeyinde farklı olduğu kenarlarda (`Ornek3`) kendini kesen (`V-034`) halkalar oluşmaması için ardışık $\le 2\text{ mm}$ köşeler birleştirilir, $180^\circ$ geri dönen dikenler (`pruneRingSpikesAndCollinear`) ve doğrusal ara köşeler silinir, sekiz-biçimli / kendine değen halkalar basit alt döngülere (`decomposeToSimpleLoops`) ayrılır, alanı $< 0{,}01\text{ m}^2$ veya etkin şerit kalınlığı $2A/P < 10\text{ mm}$ olan kıymıklar atılır; basit olmayan kalıntı atıldığında `B-LOD2-02` (`U`) uyarısı verilir.
4. **Oda 3B Kabuk Kapalılığı Kuralı (`V-217`, `KONTROL-M8 R3`, `ACIK-10`):**
   - `src/core/validation/rulesExtra.ts` ve `src/core/validation/geom.ts` (`checkRoomShellClosure`) içine `V-217` (`severity: 'H'`) kuralı eklendi. Her `BBK_` ve `OA_` nesnesinin taban, duvar ve tavan dış halkaları (ve K71 iç halkaları) T-kavşaklarda bölünerek denetlenir; $10\text{ mm}$ (`val3dity` $1\text{ cm}$ toleransı) üzerinde açık kenarı olan odalar `H` (HATA), $1\text{–}10\text{ mm}$ mikro açıklıklar `B` (BİLGİ) olarak raporlanır.
5. **Çakışan Açıklık Deliklerinin Kırpılması / Elenmesi (`KONTROL-M8 R4`, `ACIK-11`):**
   - `fromImported.ts` içinde aynı duvar diliminde ve örtüşen Z aralığında üst üste binen veya bitişik kenar paylaşan kapı/pencere açıklıkları tespit edilerek $10\text{ mm}$ güvenlik payıyla kırpılır veya tamamen içeride kalıyorsa atlanır (`ExtractionNote` kaydedilir). Ayrıca `wallFaces` aynı duvar parçasına düşen çakışık deliği `B-OP-10` (`U`) uyarısıyla eleyerek `V-035` / `V-039` oluşumunu engeller.

---

## 4. `KONTROL-M8` (`R1–R5`) Kabul ve Durum Tablosu

| Kod | Önem | Konu | Durum ve Kanıt |
|---|---|---|---|
| **R1** | HATA | `Ornek2`: En üst kata `zFloorOverride` ile bağlı çatı arası BB (`1004`) ve `ceilingFaces` / `manual` çatı altındaki odalarda duvarların `zCeiling(storey)` yerine $z_{\text{top}}(x,y)$'ye uzanması, `checkShell(r).closed === true`, hacim $\pm 0{,}05\text{ m}^3$, `B-OP-02` sıfırlanması | **YAPILDI.** `atticClip.ts` (`isAtticStorey`, `buildRoofEnvelope`, `prepareExplicitCeilingForPoly`), `generate.ts` (`partTopZ`, `spTopZ`, `resolveOpening` Z-katman filtrelemesi, `wallFaces` `topChain`) ve `building.ts` güncellendi; `m8.test.ts` R1 testi geçti (`closed: true`, hacim farkı $< 0{,}01\text{ m}^3$, `B-OP-02 = 0`, GML round-trip `0 HATA`). |
| **R2** | HATA | `Ornek3`: `OuterFloor_` / `OuterCeiling_` Boolean farkında $1\text{ mm}$ diken ve kendini kesen halkaların (`4 × V-034`) temizlenmesi, $< 0{,}01\text{ m}^2$ / $< 10\text{ mm}$ kıymıkların elenmesi ve `B-LOD2-02` (`U`) uyarısı | **YAPILDI.** `polyBoolean2d.ts` (`pruneRingSpikesAndCollinear`, `decomposeToSimpleLoops`, `subtractPolygons2DWithStatus`) güncellendi; `m8.test.ts` R2 testi ($1\text{ mm}$ kayık kat sınırı) `V-034 = 0` ve `0 HATA` ile geçti. |
| **R3** | UYARI | Doğrulayıcıya `Room` (`BBK_` / `OA_`) 3B kabuk kapalılığı kuralı (`V-217`, `H`) eklenmesi ve `ACIK_SORULAR.md`'ye işlenmesi | **YAPILDI.** `geom.ts` (`checkRoomShellClosure`) ve `rulesExtra.ts` (`V-217`, `H`) eklendi; `ACIK_SORULAR.md` (`ACIK-10`) ve `M2_DOGRULAYICI.md` (`176 kural`) güncellendi; `m8.test.ts` R3 testi açık oda kabuğunu `V-217 HATA` olarak yakaladı, `Ornek6` `0 HATA` korundu. |
| **R4** | BİLGİ | `Ornek2`: Aynı duvar diliminde çakışan kapı ve pencere deliklerinin (`V-035` / `V-039`) `fromImported.ts` ve `wallFaces` içinde kırpılması / elenmesi ve not düşülmesi | **YAPILDI.** `fromImported.ts` ve `generate.ts` (`wallFaces` `B-OP-10`) güncellendi; `ACIK_SORULAR.md` (`ACIK-11`) işlendi; `m8.test.ts` R4 testi `V-035 = 0`, `V-039 = 0` ve `0 HATA` ile geçti. |
| **R5** | BİLGİ | `docs/M8_CATI_ARASI_VE_OZEL_DURUMLAR.md` kabul tablosu ve gerçek komut çıktılarının eklenmesi | **YAPILDI.** Bu bölümde (§4 ve §5) kabul tablosu ve gerçek konsol çıktıları eklendi. |

---

## 5. Gerçek Komut ve Test Çıktıları (`08.11.2026`)

### 5.1 `npm run typecheck` ve `npm run docs:m2`
```text
$ npm run typecheck
> tkgm-3d-bina@0.1.0 typecheck
> tsc --noEmit && tsc -p tsconfig.core.json --noEmit
(0 hata, çıkış kodu 0)

$ npm run docs:m2
> tkgm-3d-bina@0.1.0 docs:m2
> tsx scripts/generate-m2-doc.ts
Kapsam tablosu güncellendi: 176 kural.
```

### 5.2 `npm test` (`159 / 159` Birim ve Kabul Testi)
```text
 RUN  v5.1.0 /app/applet

 ✓ src/core/__tests__/m2.test.ts (26 tests) 2723ms
 ✓ src/core/__tests__/m3.test.ts (16 tests) 1594ms
 ✓ src/core/__tests__/m1.test.ts (10 tests) 759ms
 ✓ src/core/__tests__/m6.test.ts (16 tests) 756ms
 ✓ src/core/__tests__/m7.test.ts (16 tests) 341ms
 ✓ src/core/__tests__/m8.test.ts (13 tests) 672ms
 ✓ src/core/__tests__/m0.test.ts (23 tests) 125ms
 ✓ src/core/__tests__/m5.test.ts (19 tests) 209ms
 ✓ src/core/__tests__/m4.test.ts (20 tests) 32ms

 Test Files  9 passed (9)
      Tests  159 passed (159)
```
