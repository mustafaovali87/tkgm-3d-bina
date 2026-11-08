# M2 — DOSYA DOĞRULAYICI (`src/core/validation/`)

> **Yazan:** Claude, kullanıcı adına. 08.11.2026.
> Gemini'nin günlük kullanım limiti dolduğu için M2'yi kullanıcının isteğiyle Claude yazdı.
> **Kaynaklar:**
> - Kurallar: `claude_uygulama_sartnamesi_v3.md` §6 (V-001…V-195) ve GEMINI13 tablosu (V-196…V-216).
> - Ciddiyetler: `docs/KARARLAR.md`.
> - Ölçümler: 9 resmi TKGM dosyası, yerelde.

## 1. Kabul sonucu (şartname §11, M2)

| Dosya | Rejim | HATA | UYARI | BİLGİ | Not |
|---|---|---|---|---|---|
| Ornek1 | S | **0** | 77 | 142 | |
| Ornek2 | S | **0** | 21 | 29 | V-186 (1002 balkon) bilinen istisna → BİLGİ |
| Ornek3 | S | **0** | 80 | 141 | |
| Ornek4 | S | **0** | 83 | 29 | |
| Ornek5 | S | **0** | 32 | 5 | |
| Ornek6 | S | **0** | 0 | 3 | V-030, V-213, V-214 |
| Amasya | E | **0** | 21 | 9 | |
| Sincan | E | **0** | 4 | 36 | |
| **GML_M-17273333-F (TKGM ret)** | E | **10** | 7 | 7 | **V-202** + V-072/073/074 (aynı ret nedeni), V-090 boş TIC, V-130, V-061 |

**Çalıştırma:**
- Komut: `npm run verify:samples <klasör>`. Satır başına `regime`, `issueCounts` ve `topRules` yazılır.
- Gerçek dosyalar buluta yüklenmez; tabloyu Claude yerelde çıkarır.
- Ornek6 sonucu ve 18 "tek hata ekleme" testi `src/core/__tests__/m2.test.ts` içinde.

## 2. Mimari

| Dosya | İçerik |
|---|---|
| `types.ts` | `Finding` (`ValidationIssue` + `tkgmMessage`, `polygonGmlId`, istisna alanları), `RuleDefinition` (`id`, `severity`, `source`, `status`, `note`, `run`), `ValidationReport` |
| `geom.ts` | Saf geometri: Newell normali, 2B izdüşüm, kenar kesişimi, nokta-çokgen, halka anahtarı, açıklık anahtarı, tavan altı prizma hacmi |
| `rulesFile.ts` | §6.2 dosya/şema, §6.3 Envelope, §6.4 halka geometrisi, §6.5 kimlik/ad/sınıf |
| `rulesBuilding.ts` | §6.5 öznitelikler, §6.6 Mimari Bina, §6.7 LoD0/1/2/TIC, §6.8 Kat |
| `rulesBb.ts` | §6.9 BB, §6.10 Kısım/OA, §6.11 Açıklıklar, §6.12 Balkon/Teras, §6.13 MBG |
| `rulesExtra.ts` | V-196…V-216 |
| `knownSampleExceptions.ts` | §6.14 bilinen örnek istisnaları (gerekçeli; bulgu silinmez, düzeyi düşer) |
| `index.ts` | `validateCityGml(xml, dosyaAdı, model, kodListeleri)`, `detectRegime`, `ALL_RULES` |

**Okuyucu eki (`gmlReader.ts`, geriye uyumlu):**
- `ImportedCityObject.surfaces`: yüzey elemanları; her birinde tür, ad, gml:id var mı, poligonlar ve açıklıklar.
- `ImportedCityObject.hostSurfaceTag`: kapı ve pencerenin bağlı olduğu yüzey türü.
- TIC artık `gml:pos` ile yazılmış dosyalardan da okunuyor (önceden Amasya ve Ornek4'te okunmuyordu).

**Arayüz:**
- Doğrulama, Web Worker içinde okumadan hemen sonra çalışır. Ornek3'te yaklaşık 0,5 sn sürer.
- Panel HATA → UYARI → BİLGİ sırasıyla listeler.
- Bulgu bir poligonu gösteriyorsa (`polygonGmlId`) tıklamada o poligon vurgulanır.

## 3. Rejim (N19, AS-1)

| Rejim | Nasıl tespit edilir | Örnekler |
|---|---|---|
| **S** (Sürdürülebilirlik) | Binada GroundSurface var | Ornek1–6 |
| **E** (eski kılavuz) | Binada GroundSurface yok | Amasya, Sincan, ret dosyası |

Rejim E'de o dönem istenmeyen ya da yazılmayan şeyler HATA yerine **BİLGİ** olarak raporlanır:
- MAKS ve tapu öznitelikleri;
- GroundSurface;
- kapı ve pencereler;
- boş `blockName`;
- Envelope dışında kalan TIC;
- BB küvetinde `InteriorWall_` öneki.

## 4. Ölçüme dayalı ciddiyet kararları (resmi örnekler TKGM'den geçmiş olduğu için)

Şartnamede **H** olan, ama resmi kabul örneklerinde ihlal edilen kurallar **U** yapıldı. Her birinin ölçümü kodda `source` alanında yazılı:

| Kural | Ölçüm |
|---|---|
| V-076 | Ornek1: beyan 66, benzersiz BB no 67 |
| V-096 (çatı en alçak noktası kısmı) | Ornek1'de 0,10 m, Ornek2'de 1,35 m fark |
| V-117 | Ornek2: 13 dış pencerenin kat geometrisinde deliği yok |
| V-126 | Ornek1: 70 BB'nin 62'sinde fark var; Rejim E dosyalarında da var |
| V-137 | 42 BB penceresiz (dükkan, depo, bodrum) |
| V-138 | 63 BB'de 1003 kapı yok |
| V-163 | 90 kısım kapısız (teknik hacim, kiler, niteliksiz OA) |
| V-158 | Şartnamede H/U. Geometrik hacim %1 toleransla U |

**V-164 (oda penceresinin binadaki karşılığı):**
- Aynı hizada hiç bina penceresi yoksa **HATA**.
- Hizada pencere var ama oda penceresinin yatay açıklığı onu 10 cm'den fazla aşıyorsa **UYARI**.
- Ölçüm: Ornek3'te tek bir bina vitrini içeride birden fazla dükkana bölünmüş; Ornek2 ve Ornek3'te iç ve dış yüz genişlikleri 1–9 cm farklı.

> **Gemini'ye not:** Bu kararlar TKGM'nin kabul ettiği resmi dosyalara dayanır. Daha katı bir eşik önerirsen, o eşiğin 8 kabul dosyasında 0 HATA verdiğini göstermen gerekir.

## 5. Ertelenen ve sunucu kuralları

Ertelenen her kural bir gerekçeyle kayıtlı (aşağıdaki tablo, `npm run docs:m2` ile koddan üretilir):
- **V-005:** XSD dosyaları repoda yok.
- **V-041, V-100, V-101, V-108, V-122, V-125, V-162, V-174, V-183, V-184:** Çokgen boolean / val3dity düzeyi geometri işlemleri gerektiriyor.
- **V-123:** Sınır değer şartnamede sayı olarak yok.
- **V-165:** Mesajın anlamı doğrulanmalı.
- **V-197, V-200, V-206:** Henüz tanımsız.

## 6. Kural kapsam tablosu

<!-- KAPSAM-TABLOSU:BASLA -->

Toplam 176 kural: Uygulandı 137, Ertelendi 16, Kısmi (K) 3, Okuyucuda 13, Sunucu (T) 7.

| Kural | Düzey | Durum | Kaynak | Not |
|---|---|---|---|---|
| V-001 | H | Uygulandı | Şartname §6.2, KURAL-2021 |  |
| V-002 | H | Uygulandı | Şartname §6.2 |  |
| V-003 | H | Uygulandı | Şartname §6.2, -901 |  |
| V-004 | H | Uygulandı | Şartname §6.2, -904 |  |
| V-005 | H | Ertelendi | Şartname §6.2 | CityGML 2.0 XSD dosyaları repoda yok. Ağ erişimi olmadan şema doğrulaması için XSD kopyaları eklenmeli (ACIK_SORULAR). |
| V-006 | H | Uygulandı | Şartname §6.2, -902 |  |
| V-007 | U | Uygulandı | Şartname §6.2 |  |
| V-008 | H | Uygulandı | Şartname §6.2, KURAL-2021 |  |
| V-010 | H | Uygulandı | Şartname §6.3 |  |
| V-011 | H | Uygulandı | Şartname §6.3 |  |
| V-012 | H | Uygulandı | Şartname §6.3 |  |
| V-013 | H | Uygulandı | Şartname §6.3, KURAL-2021 |  |
| V-014 | H | Uygulandı | Şartname §6.3 |  |
| V-015 | H | Uygulandı | Şartname §6.3 |  |
| V-016 | H | Uygulandı | Şartname §6.3 |  |
| V-017 | H | Uygulandı | Şartname §6.3 |  |
| V-018 | H | Uygulandı | Şartname §6.3 |  |
| V-019 | H | Kısmi (K) | Şartname §6.3 (yalnız Y kısmı: \|E − 500000\| ≤ 200000) | EPSG dilimi ↔ parsel boylamı eşleşmesi parsel bilgisi gerektirir (K). Yalnız easting aralığı denetlenir. |
| V-020 | H | Uygulandı | Şartname §6.3 |  |
| V-021 | H | Uygulandı | Şartname §6.3 |  |
| V-030 | B | Uygulandı | Şartname §6.4 + KARARLAR §A.1 (okumada ≠3 hane yalnız BİLGİ, CLAUDE13 §2.2) |  |
| V-031 | H | Uygulandı | Şartname §6.4, -101 |  |
| V-032 | H | Uygulandı | Şartname §6.4, -102 |  |
| V-033 | H | Uygulandı | Şartname §6.4, -103 |  |
| V-034 | H | Uygulandı | Şartname §6.4, -104 (+ V-035, V-036, V-039, V-040 aynı izdüşümle) |  |
| V-035 | H | Uygulandı | Şartname §6.4, -201 | V-034 ile birlikte çalışır. |
| V-036 | H | Uygulandı | Şartname §6.4, -202 | V-034 ile birlikte çalışır. |
| V-037 | H | Uygulandı | Şartname §6.4, -203 (val3dity düzlemsellik toleransı 1 cm; 1–10 mm BİLGİ) |  |
| V-038 | U | Uygulandı | Şartname §6.4, -204 |  |
| V-039 | H | Uygulandı | Şartname §6.4, -205/-206/-207 | V-034 ile birlikte çalışır. |
| V-040 | H | Uygulandı | Şartname §6.4, -208 | V-034 ile birlikte çalışır. |
| V-041 | H | Ertelendi | Şartname §6.4 | Aynı yüzeydeki eş düzlemli poligonların alan kesişimi (çokgen boolean) gerekir; M2.x. |
| V-042a | H | Uygulandı | K45a, KARARLAR (6 resmi + 18 gerçek dosyada 0 ihlal) | V-042b (1–10 mm BİLGİ) aynı fonksiyonda. |
| V-042b | B | Uygulandı | K45a, KARARLAR | V-042a ile birlikte çalışır. |
| V-050 | H | Uygulandı | Şartname §6.5 |  |
| V-051 | H | Uygulandı | Şartname §6.5, KURAL-2021 |  |
| V-052 | H | Uygulandı | Şartname §6.5 |  |
| V-053 | H | Uygulandı | Şartname §6.5 (önek eşlemesi 9 resmi dosyadan ölçüldü) |  |
| V-054 | H | Uygulandı | Şartname §6.5 |  |
| V-055 | H | Uygulandı | Şartname §6.5 |  |
| V-056 | H | Uygulandı | Şartname §6.5, K13 |  |
| V-057 | H | Uygulandı | Şartname §6.5 |  |
| V-058 | H | Uygulandı | Şartname §6.5, §3.12 (ad desenleri 9 resmi dosyadan ölçüldü, N17) |  |
| V-059 | H | Uygulandı | Şartname §6.5 |  |
| V-060 | H | Okuyucuda | Şartname §6.5, K99 | gmlReader.parseGenericAttributesFromNode |
| V-061 | H | Uygulandı | Şartname §6.5 (zorunlu küme Ornek1–6 ortak kümesi; Rejim E farkı Amasya/Sincan, N19) |  |
| V-062 | H | Uygulandı | Şartname §6.5 (TAB/boşluk V-214 BİLGİ ile ayrıca raporlanır, değer kırpılarak denetlenir) |  |
| V-063 | H | Okuyucuda | Şartname §6.5, K60 | gmlReader + resources/codelists |
| V-064 | U | Uygulandı | Şartname §6.5 (DOĞRULANMALI), OY-04 |  |
| V-070 | H | Uygulandı | Şartname §6.6 |  |
| V-071 | H | Uygulandı | Şartname §6.6 |  |
| V-072 | H | Uygulandı | Şartname §6.6 |  |
| V-073 | H | Uygulandı | Şartname §6.6 |  |
| V-074 | H | Uygulandı | Şartname §6.6 |  |
| V-075 | H | Uygulandı | Şartname §6.6, REHBER |  |
| V-076 | U | Uygulandı | Şartname §6.6, K31. Ölçüldü: Ornek1 beyan 66, benzersiz BB no 67 (N21), TKGM kabul etmiş → UYARI |  |
| V-077 | H | Uygulandı | Şartname §6.6 |  |
| V-078 | H | Uygulandı | Şartname §6.6, KURAL-2021 |  |
| V-079 | U | Uygulandı | Şartname §6.6 (Ç12, N23: saçak dahil olduğu için roofProjectionArea ≥ RoofEdge alanı beklenir) |  |
| V-080 | H | Uygulandı | Şartname §6.6, KURAL-2021 |  |
| V-081 | H | Uygulandı | Şartname §6.6 |  |
| V-082 | H | Uygulandı | Şartname §6.6 |  |
| V-083 | H | Sunucu (T) | Şartname §6.6 | MEGSİS/TAKBİS sorgusu (T). |
| V-084 | H | Sunucu (T) | Şartname §6.6 | BuildingService (T). |
| V-085 | H | Sunucu (T) | Şartname §6.6 | MAKS (T). |
| V-090 | H | Uygulandı | Şartname §6.7 |  |
| V-091 | H | Uygulandı | Şartname §6.7, KURAL-2021 |  |
| V-092 | H | Uygulandı | Şartname §6.7 |  |
| V-093 | H | Uygulandı | Şartname §6.7 | V-094 aynı fonksiyonda. |
| V-094 | H | Uygulandı | Şartname §6.7 | V-093 ile birlikte çalışır. |
| V-095 | U | Uygulandı | Şartname §6.7 |  |
| V-096 | H | Uygulandı | Şartname §6.7. RoofEdge = çatı en alt noktası kısmı UYARI: Ornek1 (0.10 m) ve Ornek2 (1.35 m) farklı, TKGM kabul etmiş |  |
| V-097 | U | Uygulandı | Şartname §6.7 |  |
| V-098 | H | Uygulandı | Şartname §6.7 |  |
| V-099 | H | Uygulandı | Şartname §6.7 |  |
| V-100 | H | Ertelendi | Şartname §6.7, -501..-503 | Katılar arası kesişim (val3dity düzeyi); M2.x. |
| V-101 | H | Ertelendi | Şartname §6.7, -301..-405 | Kabuk geçerliliği (kapalılık, manifold, yön) val3dity düzeyi; M2.x. |
| V-102 | U | Uygulandı | Şartname §6.7 (ÖNERİ: taban/tavan 1 poligon) |  |
| V-103 | H | Uygulandı | Şartname §6.7 |  |
| V-104 | H | Uygulandı | Şartname §6.7 |  |
| V-105 | H | Uygulandı | Şartname §6.7, K78 (Rejim E dosyalarında GroundSurface o dönem yasaktı: N19, AS-1) |  |
| V-106 | H | Uygulandı | Şartname §6.7 |  |
| V-107 | H | Uygulandı | Şartname §6.7 |  |
| V-108 | H | Ertelendi | Şartname §6.7, REHBER | RoofEdge ⊂ çatı izdüşümü için çokgen birleşimi gerekir; M2.x. |
| V-110 | H | Uygulandı | Şartname §6.8 | V-111 aynı fonksiyonda. |
| V-111 | H | Uygulandı | Şartname §6.8 | V-110 ile birlikte çalışır. |
| V-112 | H | Uygulandı | Şartname §6.8 |  |
| V-113 | H | Uygulandı | Şartname §6.8 | V-114 aynı fonksiyonda. |
| V-114 | H | Uygulandı | Şartname §6.8 | V-113 ile birlikte çalışır. |
| V-115 | H | Uygulandı | Şartname §6.8 |  |
| V-116 | H | Uygulandı | Şartname §6.8 |  |
| V-117 | U | Uygulandı | Şartname §6.8. Ölçüldü: Ornek2'de 13 dış pencerenin kat geometrisinde deliği yok, TKGM kabul etmiş → UYARI |  |
| V-118 | U | Sunucu (T) | Şartname §6.8, SÜRÜM v2.49 | MAKS kat no (T). |
| V-120 | H | Uygulandı | Şartname §6.9 | V-121 aynı fonksiyonda. |
| V-121 | H | Uygulandı | Şartname §6.9 | V-120 ile birlikte çalışır. |
| V-122 | H | Ertelendi | Şartname §6.9 | Duvar üst kapağının kapalılığı kenar eşleştirmesi gerektirir; M2.x. |
| V-123 | H | Ertelendi | Şartname §6.9 | Taban kalınlığı alt sınırı şartnamede sayı olarak yok ("{...} m"); ACIK_SORULAR. |
| V-124 | H | Uygulandı | Şartname §6.9 + N36 (zFloorBottom − 1 mm ≤ zWallMin ≤ zFloorTop + 1 mm) |  |
| V-125 | H | Ertelendi | Şartname §6.9 | BB ⊂ Kat için 3B içerme testi gerekir; M2.x. |
| V-126 | U | Uygulandı | Şartname §6.9 (±0.01 m²). Ölçüldü: Ornek1 70 BB'nin 62'sinde ve Rejim E dosyalarında fark var, TKGM kabul etmiş → UYARI |  |
| V-127 | H | Uygulandı | Şartname §6.9 |  |
| V-128 | H | Uygulandı | Şartname §6.9 |  |
| V-129 | H | Uygulandı | Şartname §6.9 |  |
| V-130 | H | Uygulandı | Şartname §6.9 |  |
| V-131 | H | Uygulandı | Şartname §6.9 |  |
| V-132 | H | Uygulandı | Şartname §6.9, KILAVUZ md.8 |  |
| V-133 | H | Okuyucuda | Şartname §6.9, KILAVUZ md.9 | landShare.parsePropertyLot (V-198/V-198a/V-198b). |
| V-134 | H | Uygulandı | Şartname §6.9 | Tek ve string olma koşulu V-061 (tekrar) ve V-060 (tip) ile denetlenir. |
| V-135 | H | Uygulandı | Şartname §6.9 |  |
| V-136 | U | Uygulandı | Şartname §6.9, KURAL-2021 |  |
| V-137 | U | Uygulandı | Şartname §6.9. Ölçüldü: Ornek1–5'te 42 BB penceresiz (dükkan/depo/bodrum), TKGM kabul etmiş → UYARI. Rejim E'de açıklık yok → BİLGİ |  |
| V-138 | U | Uygulandı | Şartname §6.9 (H/U). Ölçüldü: Ornek1–5'te 63 BB'de 1003 kapı yok, TKGM kabul etmiş → UYARI (N31) |  |
| V-139 | H | Uygulandı | Şartname §6.9 |  |
| V-140 | H | Uygulandı | Şartname §6.9 |  |
| V-141 | H | Sunucu (T) | Şartname §6.9 | MAKS/TAKBİS (T). |
| V-150 | H | Uygulandı | Şartname §6.10 |  |
| V-151 | H | Uygulandı | Şartname §6.10, KURAL-2021 |  |
| V-152 | H | Uygulandı | Şartname §6.10 | V-153, V-154, V-166 aynı fonksiyonda. |
| V-153 | H | Uygulandı | Şartname §6.10 | V-152 ile birlikte; yüzey elemanı yerine poligon sayılır (İç Yapılarda tek eleman çok poligon, ölçüldü). |
| V-154 | H | Uygulandı | Şartname §6.10 | V-152 ile birlikte çalışır. |
| V-155 | H | Uygulandı | Şartname §6.10 (±0.01 m²) |  |
| V-156 | H | Uygulandı | Şartname §6.10 |  |
| V-157 | U | Uygulandı | Şartname §6.10 (tolerans %10) |  |
| V-158 | U | Uygulandı | Şartname §6.10 (H/U; geometrik hacim karşılaştırması %1 toleransla UYARI) |  |
| V-159 | H | Uygulandı | Şartname §6.10 |  |
| V-160 | H | Uygulandı | Şartname §6.10 |  |
| V-161 | H | Uygulandı | Şartname §6.10 |  |
| V-162 | H | Ertelendi | Şartname §6.10 | Oda–BB temas/kesişim alanı için 3B boolean gerekir; M2.x. |
| V-163 | U | Uygulandı | Şartname §6.10. Ölçüldü: Ornek1/3/4/5'te 90 kısım kapısız (teknik hacim, kiler, niteliksiz OA), TKGM kabul etmiş → UYARI |  |
| V-164 | H | Uygulandı | Şartname §6.10 (LK_OuterWindowPairNotFound) |  |
| V-165 | U | Ertelendi | Şartname §6.10 | Mesajın tam anlamı DOĞRULANMALI (şartname notu). |
| V-166 | H | Uygulandı | Şartname §6.10 | V-152 ile birlikte çalışır. |
| V-170 | H | Uygulandı | Şartname §6.11 |  |
| V-171 | H | Uygulandı | Şartname §6.11 |  |
| V-172 | H | Uygulandı | Şartname §6.11 (N20: alt kot farkı bilgi olarak raporlanır) | V-203 aynı fonksiyonda. |
| V-173 | H | Okuyucuda | Şartname §6.11 | doorUsage/windowUsage kod listesi denetimi (V-063). |
| V-174 | H | Ertelendi | Şartname §6.11, REHBER | Açıklık–duvar alan çakışması için çokgen kesişimi gerekir; V-172 delik eşleşmesi kısmen karşılar. M2.x. |
| V-180 | H | Uygulandı | Şartname §6.12 | V-181 aynı fonksiyonda. |
| V-181 | H | Uygulandı | Şartname §6.12 | V-180 ile birlikte çalışır. |
| V-182 | H | Uygulandı | Şartname §6.12 |  |
| V-183 | H | Ertelendi | Şartname §6.12 | Korkuluk duvar kalınlığı için karşılıklı yüz eşleştirmesi gerekir; M2.x. |
| V-184 | H | Ertelendi | Şartname §6.12 | Balkon–BB temas boşluğu için 3B yakınlık testi gerekir; M2.x. |
| V-185 | H | Uygulandı | Şartname §6.12 |  |
| V-186 | H | Uygulandı | Şartname §6.12 (bilinen istisna: Ornek2 balkonlarında 1002, §6.14) |  |
| V-187 | H | Uygulandı | Şartname §6.12 |  |
| V-188 | H | Uygulandı | Şartname §6.12 |  |
| V-190 | H | Uygulandı | Şartname §6.13 |  |
| V-191 | H | Uygulandı | Şartname §6.13 | MBG adı V-058, sınıfı V-057 içinde denetlenir. |
| V-192 | H | Kısmi (K) | Şartname §6.13 | Aynı parseldeki diğer binaların GML'leri gerekir (K). |
| V-193 | H | Kısmi (K) | Şartname §6.13 | Parsel geometrisi gerekir (K/T). |
| V-194 | H | Sunucu (T) | Şartname §6.13 | Veritabanı (T). |
| V-195 | U | Sunucu (T) | Şartname §6.13 | MAKS (T). |
| V-196 | H | Uygulandı | K59, ÖLÇÜLDÜ (Ornek2 10/10) | Yalnız taban/duvar/tavan varlığı; oda tabanını delmeme koşulu M2.x. |
| V-197 | U | Ertelendi | K71 | İç-oda deliği eşleştirmesi; M2.x. |
| V-198 | B | Okuyucuda | K84 | landShare.parsePropertyLot |
| V-198a | H | Okuyucuda | K27, K84 | landShare.parsePropertyLot |
| V-198b | U | Okuyucuda | K84 | landShare.parsePropertyLot |
| V-199 | B | Okuyucuda | K84, N20 | landShare.analyzeBuildingLandShares |
| V-200 | B | Ertelendi | K30, K85 | Dubleks parça alan stratejisi raporu; M2.x. |
| V-201 | U | Uygulandı | K10 (GML_M-17273333-F: 0.63–12.02 m) |  |
| V-202 | H | Uygulandı | K15–K18; TKGM ret dosyası GML_M-17273333-F (kanıtlı ret nedeni) |  |
| V-203 | H | Uygulandı | K48, K80 | V-172 ile birlikte çalışır. |
| V-204 | U | Uygulandı | v3 §3.4, SÜRÜM v2.29 |  |
| V-205 | U | Uygulandı | K11, V-018 |  |
| V-206 | U | Ertelendi | v3 §3.5 | storeyUsage ↔ BB kullanım uyum tablosu tanımlı değil; ACIK_SORULAR. |
| V-207 | U | Uygulandı | v3 §3.8 |  |
| V-208 | B | Uygulandı | K83 (iptal edildi; yalnız bilgi) |  |
| V-209 | B | Uygulandı | K78, N30 (içe alınan dosyada CCW yalnız bilgi; üretimde CW) |  |
| V-210 | B | Uygulandı | K62, K86, Kılavuz S.S.S. 27 |  |
| V-211 | H | Okuyucuda | K93 | gmlReader xlink çözümleme |
| V-212 | U | Okuyucuda | K84, N32 | landShare.analyzeBuildingLandShares |
| V-213 | B | Okuyucuda | N33 | model.parseMaksIdValue |
| V-214 | B | Okuyucuda | KONTROL-M1 G5 | gmlReader.parseGenericAttributesFromNode |
| V-215 | B | Okuyucuda | K55, K79, K87 | gmlReader.resolveProducerProfileFromFormAndOffset |
| V-216 | U | Uygulandı | K68, Ek-A §A.3 |  |
| V-217 | H | Uygulandı | Şartname §5.5 madde 6, KONTROL-M8 R3 (ACIK-10; val3dity 3B oda kabuğu kapalılığı) |  |

<!-- KAPSAM-TABLOSU:BITIR -->
