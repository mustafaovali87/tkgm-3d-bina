import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  OfficialCodelistName,
  parseCodelistXml,
} from '../codelists/index.ts';
import {
  extractGenericAttributesFromGml,
  inspectCityGmlSample,
} from '../gml/readAttributes.ts';
import {
  computeCanonicalModelHash,
  deterministicGmlId,
  sha256Hex,
  uuidv5,
} from '../hash/canonical.ts';
import {
  detectOutlierLeaveOneOut,
  HelmertControlPair,
  solveHelmert2D,
} from '../math/helmert2d.ts';
import {
  analyzeBuildingLandShares,
  formatBigIntFraction,
  parsePropertyLot,
} from '../math/landShare.ts';
import {
  analyzeRingPlanarity3D,
  checkHoleToOuterRingClearance2D,
  polygonNetArea2D,
  ringOrientation2D,
  signedArea2D,
  validateRingTopology3D,
} from '../math/ring.ts';
import {
  ALLOWED_GENERIC_ATTRIBUTES,
  assertAllowedGenericAttribute,
  checkCoordinateDecimalPlaces,
  formatCoordinateFixed3FromMm,
  isAllowedGenericAttribute,
  metersToMm,
  ORNEK6_GENERIC_ATTRIBUTES,
  parseMaksIdValue,
} from '../model/index.ts';
import {
  assertMalikNeverInGmlWhitelist,
  DEFAULT_BEYAN_DUZENLEME_AYAR,
  Malik,
  validateBbMalikShares,
} from '../model/malik.ts';
import { InMemoryPlatformAdapter } from '../../platform/PlatformAdapter.ts';

// K91: Sıfır çalışma anı ağ isteği kilidi — herhangi bir test fetch çağırırsa anında hata fırlatılır.
beforeAll(() => {
  globalThis.fetch = (() => {
    throw new Error('K91 İHLALİ: Çalışma ve test anında ağ isteği (fetch) kesinlikle yasaktır!');
  }) as unknown as typeof fetch;
});

describe('M0 Adım 1 — 15 Resmi Referans Dosyası SHA-256 Kilidi ve PlatformAdapter (CLAUDE13 §2.1, K91, K100)', () => {
  it('K91 / CLAUDE13 §2.1: ornek6.gml ve 14 codelists/*.xml dosyasının bayt boyutu ve SHA-256 özeti DOSYA_LISTESI.txt ile birebir eşleşir', () => {
    const listPath = path.resolve(process.cwd(), 'resources', 'DOSYA_LISTESI.txt');
    const rawList = fs.readFileSync(listPath, 'utf-8');
    const rows = rawList
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('dosya'));

    expect(rows.length).toBe(15);

    for (const row of rows) {
      const [relFile, expectedBytesStr, expectedSha] = row.split(/\t+/);
      const targetPath =
        relFile === 'ornek6.gml'
          ? path.resolve(process.cwd(), 'fixtures', 'ornek6.gml')
          : path.resolve(process.cwd(), 'resources', relFile);

      expect(fs.existsSync(targetPath)).toBe(true);
      const buf = fs.readFileSync(targetPath);
      expect(buf.byteLength).toBe(Number.parseInt(expectedBytesStr, 10));
      expect(sha256Hex(buf)).toBe(expectedSha);
    }

    // CLAUDE13 §4: commonAreaUsage.xml adında ayrı bir dosya bulunmamalıdır
    const nonExistentCommonAreaPath = path.resolve(
      process.cwd(),
      'resources',
      'codelists',
      'commonAreaUsage.xml'
    );
    expect(fs.existsSync(nonExistentCommonAreaPath)).toBe(false);
  });

  it('K100 / K91: InMemoryPlatformAdapter dosya okuma/yazma işlemlerini ağ veya DOM olmadan yürütür ve fetch yasağı aktiftir', async () => {
    const adapter = new InMemoryPlatformAdapter({
      'proje/ornek.txt': 'TKGM-3B',
    });
    expect(await adapter.fileExists('proje/ornek.txt')).toBe(true);
    expect(await adapter.readTextFile('proje/ornek.txt')).toBe('TKGM-3B');

    await adapter.writeTextFile('proje/yeni.txt', 'TEST-VERI');
    expect(await adapter.readTextFile('/proje/yeni.txt')).toBe('TEST-VERI');

    expect(() => globalThis.fetch('https://tkgm.gov.tr')).toThrow(/K91 İHLALİ/);
  });
});

describe('M0 Adım 2 — 14 Resmi TKGM XML Kod Listesi Yükleyici (K60, K91, V-063)', () => {
  const xmlMap = {} as Record<OfficialCodelistName, string>;

  beforeAll(() => {
    for (const name of OFFICIAL_CODELIST_NAMES) {
      const filePath = path.resolve(
        process.cwd(),
        'resources',
        'codelists',
        `${name}.xml`
      );
      xmlMap[name] = fs.readFileSync(filePath, 'utf-8');
    }
  });

  it('K60 / V-063: 14 resmi XML kod listesinin tamamı çevrimdışı ayrıştırılır ve Türkçe açıklamaları doğrulanır', () => {
    expect(OFFICIAL_CODELIST_NAMES.length).toBe(14);
    const registry = createCodelistRegistryFromXmlMap(xmlMap);

    // buildingType: 1001 = Ana Yapı, 1002 = Diğer Yapı
    expect(registry.isValidCode('buildingType', 1001)).toBe(true);
    expect(registry.getDescription('buildingType', 1001)).toBe('Ana Yapı');
    expect(registry.isValidCode('buildingType', 9999)).toBe(false);

    // buildingGeometrySuitability: 1006 = 3B Sayısal Yapı Modeli
    expect(registry.isValidCode('buildingGeometrySuitability', 1006)).toBe(true);

    // doorUsage.xml: 1001 = Bina/Yapı Giriş Kapı, 1002 = Dış Kapı, 1003 = Bağımsız Bölüm Kapı, 1004 = Kısım Kapı
    expect(registry.getList('doorUsage').entries.length).toBe(4);
    expect(registry.getDescription('doorUsage', 1003)).toBe('Bağımsız Bölüm Kapı');

    // cardinalDirection: 1001..1009 (9 yön, 1009 = Kapalı Cephe)
    expect(registry.getList('cardinalDirection').entries.length).toBe(9);
    expect(registry.getDescription('cardinalDirection', 1009)).toBe('Kapalı Cephe');

    // commonAreaUsage sorguları partUsage.xml üzerinden yanıtlanır (CLAUDE13 §4)
    expect(registry.resolveListName('commonAreaUsage')).toBe('partUsage');
    expect(registry.isValidCode('commonAreaUsage', 1001)).toBe(true);
  });

  it('K60 / V-063: integrationState.xml içindeki mükerrer gml:id="id3" (1003 ve 1004) hatasız okunur', () => {
    const parsedIntegration = parseCodelistXml(
      'integrationState',
      xmlMap.integrationState
    );
    expect(parsedIntegration.entries.length).toBe(4);
    expect(parsedIntegration.duplicateDefinitionIds).toEqual(['id3']);
    expect(parsedIntegration.byCode.get(1003)?.description).toBe(
      'Csv Karşılık Bulunamadı'
    );
    expect(parsedIntegration.byCode.get(1004)?.description).toBe(
      'Kat İrtifkı Tesisi'
    );
  });
});

describe('M0 Adım 3 — Veri Modeli, 45 Öznitelik Beyaz Listesi, Koordinat Haneleri ve MAKS BigInt (K09, K76, K99, V-030, V-060, V-213)', () => {
  it('K99 / V-060: ALLOWED_GENERIC_ATTRIBUTES tam 45 öznitelik içerir (42 Ornek6 + 3 OA/İçYapı) ve liste dışını reddeder', () => {
    expect(ORNEK6_GENERIC_ATTRIBUTES.length).toBe(42);
    expect(ALLOWED_GENERIC_ATTRIBUTES.length).toBe(45);

    expect(isAllowedGenericAttribute('constructionID', 'string')).toBe(true);
    expect(isAllowedGenericAttribute('commonAreaUsage', 'int')).toBe(true);
    expect(isAllowedGenericAttribute('storeyObjectReference', 'string')).toBe(true);
    expect(isAllowedGenericAttribute('roomInstallationUsage', 'int')).toBe(true);

    // Yasaklı öznitelikler (measuredHeight, sender, malik vb.) reddedilir
    expect(isAllowedGenericAttribute('measuredHeight', 'double')).toBe(false);
    expect(isAllowedGenericAttribute('malik', 'string')).toBe(false);
    expect(() =>
      assertAllowedGenericAttribute('measuredHeight', 'double')
    ).toThrow(/V-060 \/ K99 ihlali/);
  });

  it('K09 / V-030 / CLAUDE13 §2.2: Okumada != 3 ondalık hane (<3 veya >3) BİLGİ (B) üretir, HATA değildir; yazmada != 3 hane HATA (H) üretir', () => {
    // Okuma modu: 2 hane (18 gerçek kabul dosyası Z koordinatı) -> BİLGİ ('B'), asla HATA değil!
    const read2Decimals = checkCoordinateDecimalPlaces('1095.90', 'read');
    expect(read2Decimals).not.toBeNull();
    expect(read2Decimals?.severity).toBe('B');
    expect(read2Decimals?.ruleId).toBe('V-030');

    // Okuma modu: 4 hane (Ornek6 pos koordinatı) -> BİLGİ ('B')
    const read4Decimals = checkCoordinateDecimalPlaces('532568.5800', 'read');
    expect(read4Decimals).not.toBeNull();
    expect(read4Decimals?.severity).toBe('B');

    // Okuma modu: tam 3 hane -> sorun yok (null)
    expect(checkCoordinateDecimalPlaces('532568.580', 'read')).toBeNull();

    // Yazma modu: != 3 hane -> HATA ('H')
    const write2Decimals = checkCoordinateDecimalPlaces('1095.90', 'write');
    expect(write2Decimals?.severity).toBe('H');

    // Millimetre ızgarası (K76) -> toFixed(3)
    const mm = metersToMm(1095.9);
    expect(mm).toBe(1095900);
    expect(formatCoordinateFixed3FromMm(mm)).toBe('1095.900');
  });

  it('V-213: 10 haneli maksIdentityNumber (5415689768 > 2^31-1) BigInt olarak kayıpsız saklanır', () => {
    const parsed = parseMaksIdValue('5415689768');
    expect(parsed.value).toBe(5415689768n);
    expect(parsed.exceedsInt32).toBe(true);

    const normal32 = parseMaksIdValue('431289685');
    expect(normal32.value).toBe(431289685n);
    expect(normal32.exceedsInt32).toBe(false);
  });
});

describe('M0 Adım 4 — BigInt Arsa Payı Motoru (K27, K31, K84, V-198, V-198a, V-198b, V-199, V-212)', () => {
  it('K84 / V-212: Fikstür 1 — Ornek1 #41 (aynı BB no altında 98/6534 MESKEN ve 79/6534 DEPO) -> toplam 59/2178, uniqueBbCount = 2 ve V-212 UYARI', () => {
    const result = analyzeBuildingLandShares([
      {
        gmlId: 'BB_41_a',
        blockName: 'A',
        entrance: '1',
        independentSectionNumber: '41',
        propertyLot: '98/6534',
        registeredQuality: 'MESKEN',
      },
      {
        gmlId: 'BB_41_b',
        blockName: 'A',
        entrance: '1',
        independentSectionNumber: '41',
        propertyLot: '79/6534',
        registeredQuality: 'DEPO',
      },
    ]);

    expect(result.uniqueBbCount).toBe(2);
    expect(result.uniqueShortBbNoCount).toBe(1);
    expect(formatBigIntFraction(result.totalShareUnreduced)).toBe('177/6534');
    expect(formatBigIntFraction(result.totalShareReduced)).toBe('59/2178');

    const v212 = result.issues.find((i) => i.ruleId === 'V-212');
    expect(v212).toBeDefined();
    expect(v212?.severity).toBe('U');
  });

  it('K84 / V-199: Fikstür 2 — FUA5P9 çok bloklu parsel arsa payı (103500/104683, fark -1183/104683) -> V-199 BİLGİ (HATA değil)', () => {
    const result = analyzeBuildingLandShares([
      {
        gmlId: 'BB_1',
        blockName: 'A',
        entrance: '1',
        independentSectionNumber: '1',
        propertyLot: '50000/104683',
        registeredQuality: 'MESKEN',
      },
      {
        gmlId: 'BB_2',
        blockName: 'A',
        entrance: '1',
        independentSectionNumber: '2',
        propertyLot: '53500/104683',
        registeredQuality: 'MESKEN',
      },
    ]);

    expect(result.uniqueBbCount).toBe(2);
    expect(formatBigIntFraction(result.totalShareUnreduced)).toBe('103500/104683');
    expect(formatBigIntFraction(result.diffFromOneUnreduced)).toBe('-1183/104683');
    expect(result.isCompleteShareEqualOne).toBe(false);

    const v199 = result.issues.find((i) => i.ruleId === 'V-199');
    expect(v199).toBeDefined();
    expect(v199?.severity).toBe('B');
  });

  it('K84 / V-198 / K30: Fikstür 3 — Boşluklu pay (" 98 / 6534 ") + küçük harf nitelik ("mesken") dubleks parçalarda tek BB sayılır ve V-198 BİLGİ üretir', () => {
    const result = analyzeBuildingLandShares([
      {
        gmlId: 'BB_dubleks_alt',
        blockName: '-1',
        entrance: '',
        independentSectionNumber: '2',
        propertyLot: ' 98 / 6534 ',
        registeredQuality: 'mesken',
      },
      {
        gmlId: 'BB_dubleks_ust',
        blockName: '-1',
        entrance: '',
        independentSectionNumber: '2',
        propertyLot: '98/6534',
        registeredQuality: 'MESKEN',
      },
    ]);

    expect(result.totalPartObjects).toBe(2);
    expect(result.uniqueBbCount).toBe(1);
    expect(formatBigIntFraction(result.totalShareUnreduced)).toBe('98/6534');
    expect(result.issues.some((i) => i.ruleId === 'V-198' && i.severity === 'B')).toBe(
      true
    );

    // V-198a ve V-198b kontrolleri
    const badLot = parsePropertyLot('7000/6534');
    expect(badLot.isValid).toBe(false);
    expect(badLot.issues[0]?.ruleId).toBe('V-198a');
    expect(badLot.issues[0]?.severity).toBe('H');

    const zeroLot = parsePropertyLot('0/6534');
    expect(zeroLot.isValid).toBe(true);
    expect(zeroLot.issues[0]?.ruleId).toBe('V-198b');
    expect(zeroLot.issues[0]?.severity).toBe('U');
  });
});

describe('M0 Adım 5 — 2B Helmert Dönüşümü ve Leave-One-Out Uyuşumsuz Nokta Tespiti (K08, K69, V-020)', () => {
  it('K08 / V-020: Elle çözülmüş 2B Helmert dönüşümü (a, b, tE, tN, ölçek ppm ve artıklar) tam doğrulanır', () => {
    // Bilinen dönüşüm: scale = 1.00005 (+50 ppm), rotation = 0, tE = 532500, tN = 4288300
    const s = 1.00005;
    const tE = 532500;
    const tN = 4288300;
    const pairs: HelmertControlPair[] = [
      { id: 'P1', localX: 0, localY: 0, targetE: tE, targetN: tN },
      { id: 'P2', localX: 20, localY: 0, targetE: tE + 20 * s, targetN: tN },
      { id: 'P3', localX: 20, localY: 15, targetE: tE + 20 * s, targetN: tN + 15 * s },
      { id: 'P4', localX: 0, localY: 15, targetE: tE, targetN: tN + 15 * s },
    ];

    const res = solveHelmert2D(pairs);
    expect(res.a).toBeCloseTo(s, 9);
    expect(res.b).toBeCloseTo(0, 9);
    expect(res.tE).toBeCloseTo(tE, 6);
    expect(res.tN).toBeCloseTo(tN, 6);
    expect(res.scalePpm).toBeCloseTo(50, 3);
    expect(res.rmseMeters).toBeLessThan(1e-9);
  });

  it('K69: Leave-one-out analizi 4 kontrol noktasından hatalı girilen 1 uyuşumsuz noktayı (P3) yakalar', () => {
    const pairs: HelmertControlPair[] = [
      { id: 'P1', localX: 0, localY: 0, targetE: 532500, targetN: 4288300 },
      { id: 'P2', localX: 10, localY: 0, targetE: 532510, targetN: 4288300 },
      // P3 noktasında 0.85 m (850 mm) kaba aplikasyon hatası var:
      { id: 'P3', localX: 10, localY: 10, targetE: 532510.85, targetN: 4288310 },
      { id: 'P4', localX: 0, localY: 10, targetE: 532500, targetN: 4288310 },
    ];

    const outlier = detectOutlierLeaveOneOut(pairs);
    expect(outlier.suspectPointId).toBe('P3');
    expect(outlier.bestReducedRmseMm).toBeLessThan(0.01);
    expect(outlier.fullRmseMm).toBeGreaterThan(300);
  });
});

describe('M0 Adım 6 — Halka Geometrisi, Shoelace Alan, Düzlemsellik ve Delik-Kenar Mesafesi (K36, K45a, K50, V-031..V-042b)', () => {
  it('K36 / K50 / V-040: (0,0)-(10,0)-(10,10)-(0,10) -> +100 (CCW) ve ters sıra -> -100 (CW)', () => {
    const ccwSquare = [
      { e: 0, n: 0 },
      { e: 10, n: 0 },
      { e: 10, n: 10 },
      { e: 0, n: 10 },
      { e: 0, n: 0 },
    ];
    const cwSquare = [...ccwSquare].reverse();

    expect(signedArea2D(ccwSquare)).toBeCloseTo(100, 9);
    expect(ringOrientation2D(ccwSquare)).toBe('CCW');

    expect(signedArea2D(cwSquare)).toBeCloseTo(-100, 9);
    expect(ringOrientation2D(cwSquare)).toBe('CW');

    // İç delikli poligon net alanı (100 - 4 = 96 m2)
    const hole = [
      { e: 2, n: 2 },
      { e: 2, n: 4 },
      { e: 4, n: 4 },
      { e: 4, n: 2 },
      { e: 2, n: 2 },
    ];
    expect(polygonNetArea2D(ccwSquare, [hole])).toBeCloseTo(96, 9);
  });

  it('V-031 / V-032 / V-033 / V-037: 3B halka topolojisi ve düzlemsellik kontrolü çalışır', () => {
    const planarWall = [
      { e: 0, n: 0, z: 1096.1 },
      { e: 5, n: 0, z: 1096.1 },
      { e: 5, n: 0, z: 1098.7 },
      { e: 0, n: 0, z: 1098.7 },
      { e: 0, n: 0, z: 1096.1 },
    ];
    expect(validateRingTopology3D(planarWall, 'LinearRing_1')).toEqual([]);
    const planarity = analyzeRingPlanarity3D(planarWall);
    expect(planarity.isPlanar1Mm).toBe(true);
    expect(planarity.maxDeviationMm).toBeCloseTo(0, 6);
  });

  it('K45a / V-042a / V-042b: Delik ile dış halka arasındaki minimum mesafe (+10mm uyumlu, 5mm V-042b BİLGİ, 0mm V-042a HATA)', () => {
    const wall2D = [
      { e: 0, n: 0 },
      { e: 4, n: 0 },
      { e: 4, n: 2.6 },
      { e: 0, n: 2.6 },
    ];

    // +10 mm (0.010 m) kapı alt ofseti -> K45a tam uyumlu (issue === null)
    const door10mm = [
      { e: 1, n: 0.01 },
      { e: 1.9, n: 0.01 },
      { e: 1.9, n: 2.11 },
      { e: 1, n: 2.11 },
    ];
    const okCheck = checkHoleToOuterRingClearance2D(wall2D, door10mm, 'DoorLinearRing_ok');
    expect(okCheck.minDistanceMm).toBeCloseTo(10, 5);
    expect(okCheck.issue).toBeNull();

    // +5 mm (0.005 m) -> V-042b BİLGİ
    const door5mm = [
      { e: 1, n: 0.005 },
      { e: 1.9, n: 0.005 },
      { e: 1.9, n: 2.1 },
      { e: 1, n: 2.1 },
    ];
    const infoCheck = checkHoleToOuterRingClearance2D(wall2D, door5mm, 'DoorLinearRing_5mm');
    expect(infoCheck.issue?.ruleId).toBe('V-042b');
    expect(infoCheck.issue?.severity).toBe('B');

    // 0 mm (tabana değiyor) -> V-042a HATA
    const doorTouching = [
      { e: 1, n: 0 },
      { e: 1.9, n: 0 },
      { e: 1.9, n: 2.1 },
      { e: 1, n: 2.1 },
    ];
    const errCheck = checkHoleToOuterRingClearance2D(wall2D, doorTouching, 'DoorLinearRing_0mm');
    expect(errCheck.issue?.ruleId).toBe('V-042a');
    expect(errCheck.issue?.severity).toBe('H');
  });
});

describe('M0 Adım 7 — Malik (Kat İrtifakı Listesi) Modeli ve Hisse Kontrolü (CLAUDE13 §1, K88, V-208)', () => {
  it('K88 / V-208: Sahte örnek maliklerle BigInt hisse toplamı 1/1 olduğunda tamHisseMi=true, != 1 olduğunda V-208 BİLGİ üretilir ve GML beyaz listesinde malik yoktur', () => {
    expect(DEFAULT_BEYAN_DUZENLEME_AYAR.otomatikOneri).toBe('kapali');
    expect(DEFAULT_BEYAN_DUZENLEME_AYAR.tumAlanlarSerbestDuzenlenebilir).toBe(true);
    expect(assertMalikNeverInGmlWhitelist()).toBe(true);

    const sahteMalikler: Malik[] = [
      {
        bbAnahtari: 'A|1|1',
        adSoyadVeyaUnvan: 'ÖRNEK MALİK 1',
        tcKimlikVeyaVergiNo: '11111111110',
        hissePay: 1n,
        hissePayda: 2n,
      },
      {
        bbAnahtari: 'A|1|1',
        adSoyadVeyaUnvan: 'ÖRNEK MALİK 2',
        tcKimlikVeyaVergiNo: '22222222220',
        hissePay: 2n,
        hissePayda: 4n,
      },
      {
        bbAnahtari: 'A|1|2',
        adSoyadVeyaUnvan: 'ÖRNEK MALİK 3',
        hissePay: 1n,
        hissePayda: 3n,
      },
    ];

    const bb1Check = validateBbMalikShares('A|1|1', sahteMalikler);
    expect(bb1Check.tamHisseMi).toBe(true);
    expect(formatBigIntFraction(bb1Check.toplamHisse)).toBe('1/1');
    expect(bb1Check.issue).toBeNull();

    const bb2Check = validateBbMalikShares('A|1|2', sahteMalikler);
    expect(bb2Check.tamHisseMi).toBe(false);
    expect(formatBigIntFraction(bb2Check.toplamHisse)).toBe('1/3');
    expect(bb2Check.issue?.ruleId).toBe('V-208');
    expect(bb2Check.issue?.severity).toBe('B');
  });
});

describe('M0 Adım 8 — Deterministik uuidv5 ve SHA-256 Kanonik Model Özeti (K12, K89, K92, V-050, V-051)', () => {
  it('K12 / K92 / V-050 / V-051: Deterministik uuidv5 süslü parantezsiz küçük harf GUID üretir ve aynı girdide her zaman aynı gml:id verir', () => {
    const id1 = deterministicGmlId('MB_', '70125626-A', 'Building/0');
    const id2 = deterministicGmlId('MB_', '70125626-A', 'Building/0');
    const idDifferent = deterministicGmlId('MB_', '70125626-B', 'Building/0');

    expect(id1).toBe(id2);
    expect(id1).not.toBe(idDifferent);
    expect(id1).toMatch(
      /^MB_[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(uuidv5('test-seed')).toBe(uuidv5('test-seed'));
  });

  it('K89: Üretici profili (A10 -> B50) değiştiğinde CanonicalHash değişir; kamera/UI görünümü değiştiğinde CanonicalHash değişmez', () => {
    const baseModel = {
      schemaVersion: '3.5.5',
      producerProfile: 'A10' as const,
      codelistsCombinedSha256: 'abc123',
      buildingAttributes: {
        constructionID: '70125626-A',
        maksIdentityNumber: 431289685n,
      },
      coordinatesMm: [532568580, 4288398700, 1095900],
      objectAttributes: [
        { gmlId: 'BB_1', attributes: { independentSectionNumber: '1', propertyLot: '1/2' } },
      ],
    };

    const hashView1 = computeCanonicalModelHash(baseModel, {
      cameraPosition: [10, 20, 30],
      selectedGmlId: 'BB_1',
      activeTab: '3d',
      zoomLevel: 1.5,
      darkMode: false,
    });

    const hashView2 = computeCanonicalModelHash(baseModel, {
      cameraPosition: [999, -500, 42],
      selectedGmlId: null,
      activeTab: 'validation',
      zoomLevel: 4.0,
      darkMode: true,
    });

    // Kamera veya UI durumu özeti asla değiştirmez
    expect(hashView1).toBe(hashView2);

    // Üretici profili A10 -> B50 değiştiğinde özet değişir
    const hashProfileB50 = computeCanonicalModelHash({
      ...baseModel,
      producerProfile: 'B50',
    });
    expect(hashProfileB50).not.toBe(hashView1);
  });
});

describe('M0 Adım 9 — fixtures/ornek6.gml Öznitelik ve Yapı Doğrulaması (K55, K79, K87, K99, V-060, V-215)', () => {
  it('K99 / V-060 / K87: fixtures/ornek6.gml içinden çıkan 42 gen:*Attribute listesi docs/KARARLAR.md §A.3 ile birebir aynıdır', () => {
    const ornek6Path = path.resolve(process.cwd(), 'fixtures', 'ornek6.gml');
    const xml = fs.readFileSync(ornek6Path, 'utf-8');

    const extracted = extractGenericAttributesFromGml(xml);
    expect(extracted.unauthorizedSpecs).toEqual([]);
    expect(extracted.specsSorted.length).toBe(42);
    expect(extracted.specsSorted).toEqual([...ORNEK6_GENERIC_ATTRIBUTES].sort());

    const report = inspectCityGmlSample(xml);
    expect(report.matchesOrnek6Expected42).toBe(true);
    expect(report.constructionID).toBe('70125626-A');
    expect(report.srsName).toBe('EPSG:5254');
    expect(report.roofProjectionArea).toBeCloseTo(120.79, 2);
    expect(report.buildingHeight).toBeCloseTo(7.45, 2);
    expect(report.confirmationDate).toBe('1999-12-09');
    expect(report.counts).toEqual({
      MB: 1,
      K: 2,
      BB: 2,
      BBK: 16,
      OA: 0,
      BBKIY: 0,
      OAIY: 0,
      BLKN: 4,
      TRS: 0,
      KAPI: 44,
      PEN: 38,
      MBG: 1,
    });
    expect(report.detectedStoreyForm).toBe('A');
    expect(report.detectedDoorBottomOffsetMm).toBe(10);
    expect(report.detectedProducerProfile).toBe('A10');
  });
});
