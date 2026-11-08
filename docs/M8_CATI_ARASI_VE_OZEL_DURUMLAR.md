# M8 — Çatı Arası ve Özel Durumlar (`docs/M8_CATI_ARASI_VE_OZEL_DURUMLAR.md`)

> **Kapsam:** `claude_uygulama_sartnamesi_v3.md §3.5–§3.9`, `§4.2`, `§4.3`, `§5.2`, `§5.3`, `§5.4 #6`, `§5.5`, `§5.9`, `§5.10`, `§5.11`, `§5.12`, `§11`

---

## 1. Çatı Arası Kesimi ve Eğik Tavanlı Hacimler (`src/core/brep/atticClip.ts`, `§5.9`, `§5.12`)

1. **Çatı Zarfı (`RoofEnvelope`):**
   - Parametrik çatı kipleri (`gable` beşik, `hip` kırma, `shed` tek eğim/sundurma) ve içe aktarılmış elle çatı yüzleri (`manual`) için her `(x, y)` noktasındaki tavan/çatı kotu $z_{\text{roof}}(x, y)$ ve düzlem sırt/mahya kırık doğruları (`ridgeSegments`) hesaplanır.
   - Çatı arası katı (`Storey.clipToRoof === true`, `SectionPart.usage === 1004` veya `Roof.eaveZ` tanımlı) bulunduğunda:
     - Saçak kotu (`zRoofEdge = resolveRoofEdgeZ(building)`) diz boyu duvar yüksekliğine (`kneeWallHeight`, varsayılan `1600 mm`) veya `Roof.eaveZ` değerine bağlanır.
     - `Lod0RoofEdge_`, `LoD1` prizma üst kotu ve parametrik `Roof_` alt kotu `zRoofEdge` ile eşleştirilerek `V-096` ve `V-099` kurallarıyla tam uyum sağlanır.
2. **Sırt / Mahya Bölmesi ve Tavan Kesimi (`clipCapPolygonToRoof`):**
   - Çatı sırt doğrularının oda, BB küveti veya kat dış halkasını kestiği noktalara köşe eklenir (`insertSplitPointsIntoPoly`), böylece komşu iki duvarın ve eğik tavan yüzlerinin sırt noktasında birebir ortak köşe paylaşması (su geçirmez manifold, `V-036`) garanti edilir.
   - Yatay tavan adayı $z_{\text{cap}}$ ile çatı düzlemleri kesiştirilerek (`clipRingByHalfPlane2D`) odanın üst yüzü eğik çatı kanatlarına ve varsa orta yatay tavan şeridine bölünür.
   - Her eğik tavan poligonunda en küçük kareler düzlem denetimi (`fitPlaneMaxDevMm`) çalışır; yuvarlama sapması `> 0.8 mm` olan dörtgen/çokgenler köşegen boyunca üçgenlere bölünerek `V-032` (`<= 1 mm` düzlemsellik) kesin olarak sağlanır.
3. **Tek `CeilingSurface` ve Iraksama Hacmi (`§5.9 #5`, `§5.12`):**
   - Bir odanın tüm düz ve eğik `Ceiling_` poligonları **tek bir `<bldg:CeilingSurface>`** altında toplanır (`§5.9 #5`).
   - Oda, iç yapı, BB küveti ve kat/LoD2 dış duvarları $z_{\text{top}}(x, y) = \min(z_{\text{cap}}, z_{\text{roof}}(x, y))$ fonksiyonuyla kesilir (yamuk/beşgen/üçgen duvar poligonları).
   - Oda hacmi, kapalı kabuk üzerinden 3B ıraksama teoremiyle (`checkShell` / `V-158` tavan altı prizma hacmiyle birebir eşdeğer) hesaplanır:
     $$V = \frac{1}{6}\left|\sum_{f} \sum_{t \in \text{tri}(f)} \mathbf{p}_0 \cdot (\mathbf{p}_1 \times \mathbf{p}_2)\right|$$
   - Çatı altında en yüksek noktası `< 1.5 m` kalan oda için `G-07` (`V-152`) ve `< 3` duvarı kalan oda için `G-06` (`V-154`) bulguları üretilir (`§5.9 #6`).

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

## 3. Özel Durumlar (`K71`, Dubleks, Asma Kat, Uzak Kısım, Sahanlık Penceresi, OA Dış Duvarı, Kademeli Katlar)

1. **İç Kısım (`K71` — Oda İçinde Oda, `§5.3`, `§5.5`):**
   - Aynı katta ve aynı taban kotunda bir `Part` (`BBK`), başka bir `Part` çokgeninin tamamen içindeyse (`ringInsidePoly`), dış odanın `Floor_` ve `Ceiling_` poligonlarında otomatik olarak iç halka (delik) açılır, delik çevresinde `InteriorWall_` yüzeyleri üretilir ve `BB_` küvetinde (`W`) iç odanın duvarları ada olarak korunur.
2. **Dubleks / Çoklu Kat (`groupStoreyId`, `emitStoreyObject`, `usage: 1003 / 1004` — `§4.2`, `§4.3`):**
   - Çok katlı bağımsız bölümün üst kat parçaları (`SectionPart`) fiziksel katında (`storeyId`) çizilirken GML grup üyeliği `groupStoreyId` ile giriş katına (`K_`) bağlanabilir (`Ornek4` uyumu).
   - Ayrı `K_` nesnesi olmayan çatı arası / dubleks katlarda `Storey.emitStoreyObject = false` seçildiğinde `K_` nesnesi üretilmez, `storeysAboveGround` yalnız `emitStoreyObject !== false` olan katları sayar ve bu kattaki ortak alanların (`OA_`) `storeyObjectReference` özniteliği `"-1"` olarak yazılır (`§4.2`).
3. **Asma Kat (`zFloorOverride` — `§5.2`), Uzak Kısım (`remote` — `H11a`), Sahanlık Penceresi (`spansStoreys` — `§5.4 #6`) ve OA Dış Duvarı (`§3.8`, `§5.5 #4`):**
   - `zFloorOverride` ile aynı kat içinde farklı taban kotundaki asma kat odaları modellenir.
   - `remote: true` ile bağımsız bölüm ana konturu dışındaki eklenti/depo kısımları `T-04` içerme hatasından muaf tutulur.
   - `Opening.spansStoreys` ile birden fazla katı kesen merdiven sahanlığı pencereleri her ilgili katta kendi kot aralığıyla üretilir.
   - Ortak alan (`OA_`) kenarı kat dış sınırına duvar kalınlığı (`<= 600 mm`) içinde paralel ve arada başka oda/BB yoksa `WallSurface` (`Wall_`) olarak sınıflandırılır (`V-163` uyumu).
4. **Kademeli Katlar (`src/core/brep/polyBoolean2d.ts`, `OuterFloorSurface` & `OuterCeilingSurface` — `§5.10`):**
   - Ardışık iki kat (`L` alt, `U` üst) farklı dış sınıra sahip olduğunda saf TypeScript 2B Boolean fark algoritması (`subtractPolygons2D`) ile:
     - `L.outline − U.outline` farkı `zCeiling(L)` kotunda yukarı bakan `OuterFloorSurface` (`OuterFloor_`),
     - `U.outline − L.outline` farkı `zFloorBottom(U)` kotunda aşağı bakan `OuterCeilingSurface` (`OuterCeiling_`) olarak `MB_` (`lod2Surfaces`) üzerinde üretilir.
