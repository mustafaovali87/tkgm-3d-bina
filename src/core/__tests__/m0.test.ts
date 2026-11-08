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
  compareCodeUnits,
  computeCanonicalModelHash,
  deterministicGmlId,
  sha256Hex,
  TKGM3D_UUID_NAMESPACE,
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

function collectProductionCoreFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      collectProductionCoreFiles(full, acc);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('M0 Adım 1 — 15 Resmi Referans Dosyası SHA-256 Kilidi, PlatformAdapter ve src/core Saflık Koruması (CLAUDE13 §2.1, K91, K100, F3, F8)', () => {
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

  it('F3 / F8 / K100 / Mutlak Kural 4: src/core/**/*.ts üretim dosyalarında fetch, window, document, Math.random, Date.now, randomUUID, localeCompare veya @google/genai bulunmaz', () => {
    const coreDir = path.resolve(process.cwd(), 'src', 'core');
    const prodFiles = collectProductionCoreFiles(coreDir);
    expect(prodFiles.length).toBeGreaterThanOrEqual(7);

    const forbiddenPatterns: ReadonlyArray<{ label: string; regex: RegExp }> = [
      { label: 'fetch(', regex: /\bfetch\s*\(/ },
      { label: 'window.', regex: /\bwindow\s*\./ },
      { label: 'document.', regex: /\bdocument\s*\./ },
      { label: 'Math.random', regex: /\bMath\.random\b/ },
      { label: 'Date.now', regex: /\bDate\.now\b/ },
      { label: 'randomUUID', regex: /\brandomUUID\b/ },
      { label: '@google/genai', regex: /@google\/genai/ },
      { label: 'localeCompare', regex: /\.localeCompare\s*\(/ },
    ];

    for (const filePath of prodFiles) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      // Yorum satırlarını temizleyerek gerçek kod gövdesini tara
      const codeOnly = raw
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      for (const pat of forbiddenPatterns) {
        expect(
          pat.regex.test(codeOnly),
          `${path.relative(process.cwd(), filePath)} içinde yasaklı ifade bulundu: ${pat.label}`
        ).toBe(false);
      }
    }
  });

  it('F1 (KONTROL-M0-2): package-lock.json içinde Windows (win32-x64) platform paketleri (@tailwindcss/oxide-win32-x64-msvc, lightningcss-win32-x64-msvc, @esbuild/win32-x64) mevcuttur', () => {
    const lockPath = path.resolve(process.cwd(), 'package-lock.json');
    expect(fs.existsSync(lockPath)).toBe(true);
    const lockContent = fs.readFileSync(lockPath, 'utf-8');
    expect(lockContent).toContain('@tailwindcss/oxide-win32-x64-msvc');
    expect(lockContent).toContain('lightningcss-win32-x64-msvc');
    expect(lockContent).toContain('@esbuild/win32-x64');
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

describe('M0 Adım 3 — Veri Modeli, 45 Öznitelik Beyaz Listesi, Koordinat Haneleri ve MAKS BigInt (K09, K76, K99, V-030, V-060, V-213, F4)', () => {
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

  it('V-213 / F4: parseMaksIdValue 10 haneli sayıyı (" 5415689768 ") BigInt + BİLGİ olarak saklar; geçersiz ("12a", "-1") girdilerde çökmez ve V-213 HATA döndürür', () => {
    const parsed10Digit = parseMaksIdValue(' 5415689768 ', 'BB_1');
    expect(parsed10Digit.value).toBe(5415689768n);
    expect(parsed10Digit.exceedsInt32).toBe(true);
    expect(parsed10Digit.issue?.ruleId).toBe('V-213');
    expect(parsed10Digit.issue?.severity).toBe('B');
    expect(parsed10Digit.issue?.targetGmlId).toBe('BB_1');

    const normal32 = parseMaksIdValue('431289685');
    expect(normal32.value).toBe(431289685n);
    expect(normal32.exceedsInt32).toBe(false);
    expect(normal32.issue).toBeNull();

    // F4: Bozuk girdi ('12a') SyntaxError fırlatmamalı, V-213 HATA ('H') üretmelidir
    const invalidAlpha = parseMaksIdValue('12a', 'MB_1');
    expect(invalidAlpha.value).toBeNull();
    expect(invalidAlpha.exceedsInt32).toBe(false);
    expect(invalidAlpha.issue?.ruleId).toBe('V-213');
    expect(invalidAlpha.issue?.severity).toBe('H');

    // F4: Negatif girdi ('-1') V-213 HATA ('H') üretmelidir
    const invalidNegative = parseMaksIdValue('-1', 'MB_1');
    expect(invalidNegative.value).toBeNull();
    expect(invalidNegative.exceedsInt32).toBe(false);
    expect(invalidNegative.issue?.ruleId).toBe('V-213');
    expect(invalidNegative.issue?.severity).toBe('H');

    // F4: Boş girdi ('', null, undefined) -> value: null, issue: null
    expect(parseMaksIdValue('')).toEqual({
      value: null,
      exceedsInt32: false,
      issue: null,
    });
    expect(parseMaksIdValue(null)).toEqual({
      value: null,
      exceedsInt32: false,
      issue: null,
    });
  });
});

describe('M0 Adım 4 — BigInt Arsa Payı Motoru (K27, K31, K84, V-198, V-198a, V-198b, V-199, V-212, F7)', () => {
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

  it('K84 / V-198 / V-198a / V-198b / K30 / F7: Boşluklu pay (" 98 / 6534 ") dubleks parçalarda tek BB sayılır; "+5/10" ve "-5/10" V-198a HATA üretir', () => {
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

    // V-198a: pay > payda
    const badLot = parsePropertyLot('7000/6534');
    expect(badLot.isValid).toBe(false);
    expect(badLot.issues[0]?.ruleId).toBe('V-198a');
    expect(badLot.issues[0]?.severity).toBe('H');

    // F7: İşaretli "+5/10" ve "-5/10" GML şemasında (/^\d+\/\d+$/) geçersizdir -> V-198a HATA
    const plusSignLot = parsePropertyLot('+5/10');
    expect(plusSignLot.isValid).toBe(false);
    expect(plusSignLot.issues[0]?.ruleId).toBe('V-198a');
    expect(plusSignLot.issues[0]?.severity).toBe('H');

    const minusSignLot = parsePropertyLot('-5/10');
    expect(minusSignLot.isValid).toBe(false);
    expect(minusSignLot.issues[0]?.ruleId).toBe('V-198a');
    expect(minusSignLot.issues[0]?.severity).toBe('H');

    // V-198b: pay === 0 -> UYARI
    const zeroLot = parsePropertyLot('0/6534');
    expect(zeroLot.isValid).toBe(true);
    expect(zeroLot.issues[0]?.ruleId).toBe('V-198b');
    expect(zeroLot.issues[0]?.severity).toBe('U');
  });
});

describe('M0 Adım 5 — 2B Helmert Dönüşümü ve Leave-One-Out Uyuşumsuz Nokta Tespiti (K08, K69, V-020, F8)', () => {
  it('K08 / V-020: Sıfır dönüklü +50 ppm ölçekli 2B Helmert dönüşümü doğrulanır', () => {
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

  it('F8 / K08: Sıfır olmayan dönüklük (30 derece) + 100 ppm ölçekli 2B Helmert dönüşümü (a = s*cos(30°), b = s*sin(30°)) tam doğrulanır', () => {
    const s = 1.0001; // +100 ppm
    const thetaRad = Math.PI / 6; // 30°
    const expectedA = s * Math.cos(thetaRad);
    const expectedB = s * Math.sin(thetaRad);
    const tE = 532568.58;
    const tN = 4288398.7;

    const localPts = [
      { id: 'K1', x: 0, y: 0 },
      { id: 'K2', x: 12, y: 0 },
      { id: 'K3', x: 12, y: 8 },
      { id: 'K4', x: 0, y: 8 },
    ];

    const pairs: HelmertControlPair[] = localPts.map((p) => ({
      id: p.id,
      localX: p.x,
      localY: p.y,
      targetE: expectedA * p.x - expectedB * p.y + tE,
      targetN: expectedB * p.x + expectedA * p.y + tN,
    }));

    const res = solveHelmert2D(pairs);
    expect(res.a).toBeCloseTo(expectedA, 9);
    expect(res.b).toBeCloseTo(expectedB, 9);
    expect(res.tE).toBeCloseTo(tE, 6);
    expect(res.tN).toBeCloseTo(tN, 6);
    expect(res.rotationRad).toBeCloseTo(thetaRad, 9);
    expect(res.scale).toBeCloseTo(s, 9);
    expect(res.scalePpm).toBeCloseTo(100, 3);
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

describe('M0 Adım 8 — Deterministik uuidv5 ve SHA-256 Kanonik Model Özeti (K12, K89, K92, V-050, V-051, F2, F8, F12)', () => {
  it('K12 / K92 / V-050 / V-051 / F12: Deterministik uuidv5 kilitli TKGM3D_UUID_NAMESPACE ile süslü parantezsiz küçük harf GUID üretir', () => {
    expect(TKGM3D_UUID_NAMESPACE).toBe('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
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

  it('K89 / F2 / F8: CanonicalHash üretici profili (A10 -> B50) ile değişir, kamera/UI görünümü ile değişmez ve yerel ayara duyarlı ID sıralamalarından (İ/I/i/ı/_) etkilenmez', () => {
    const objectsOrderA = [
      { gmlId: 'BB_İ_1', attributes: { independentSectionNumber: '1', propertyLot: '1/4' } },
      { gmlId: 'BB_I_1', attributes: { independentSectionNumber: '2', propertyLot: '1/4' } },
      { gmlId: 'BB_i_1', attributes: { independentSectionNumber: '3', propertyLot: '1/4' } },
      { gmlId: 'BB_ı_1', attributes: { independentSectionNumber: '4', propertyLot: '1/4' } },
      { gmlId: 'BB__1', attributes: { independentSectionNumber: '5', propertyLot: '1/4' } },
      { gmlId: 'BB_Z_1', attributes: { independentSectionNumber: '6', propertyLot: '1/4' } },
    ];
    const objectsOrderB = [...objectsOrderA].reverse();

    const baseModel = {
      schemaVersion: '3.5.5',
      producerProfile: 'A10' as const,
      codelistsCombinedSha256: 'abc123',
      buildingAttributes: {
        constructionID: '70125626-A',
        maksIdentityNumber: 431289685n,
      },
      coordinatesMm: [532568580, 4288398700, 1095900],
      objectAttributes: objectsOrderA,
    };

    const hashView1 = computeCanonicalModelHash(baseModel, {
      cameraPosition: [10, 20, 30],
      selectedGmlId: 'BB_1',
      activeTab: '3d',
      zoomLevel: 1.5,
      darkMode: false,
    });

    const hashView2 = computeCanonicalModelHash(
      {
        ...baseModel,
        objectAttributes: objectsOrderB,
      },
      {
        cameraPosition: [999, -500, 42],
        selectedGmlId: null,
        activeTab: 'validation',
        zoomLevel: 4.0,
        darkMode: true,
      }
    );

    // Kamera/UI durumu veya objectAttributes dizi sırası özeti asla değiştirmez
    expect(hashView1).toBe(hashView2);

    // UTF-16 kod birimi sıralaması deterministiktir: 'BB_I_1' (0x49) < 'BB_Z_1' (0x5A) < 'BB__1' (0x5F) < 'BB_i_1' (0x69) < 'BB_İ_1' (0x130) < 'BB_ı_1' (0x131)
    const sortedIds = objectsOrderA.map((o) => o.gmlId).sort(compareCodeUnits);
    expect(sortedIds).toEqual([
      'BB_I_1',
      'BB_Z_1',
      'BB__1',
      'BB_i_1',
      'BB_İ_1',
      'BB_ı_1',
    ]);

    // Üretici profili A10 -> B50 değiştiğinde özet değişir
    const hashProfileB50 = computeCanonicalModelHash({
      ...baseModel,
      producerProfile: 'B50',
    });
    expect(hashProfileB50).not.toBe(hashView1);
  });
});

describe('M0 Adım 9 — fixtures/ornek6.gml Öznitelik ve Yapı Doğrulaması (K55, K79, K87, K99, V-060, V-215, F5, F6)', () => {
  it('K99 / V-060 / K87: fixtures/ornek6.gml içinden çıkan 42 gen:*Attribute listesi docs/KARARLAR.md §A.3 ile birebir aynıdır', () => {
    const ornek6Path = path.resolve(process.cwd(), 'fixtures', 'ornek6.gml');
    const xml = fs.readFileSync(ornek6Path, 'utf-8');

    const extracted = extractGenericAttributesFromGml(xml);
    expect(extracted.unauthorizedSpecs).toEqual([]);
    expect(extracted.specsSorted.length).toBe(42);
    expect(extracted.specsSorted).toEqual([...ORNEK6_GENERIC_ATTRIBUTES].sort(compareCodeUnits));

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
    expect(report.detectedStoreyForms).toEqual(['A', 'A']);
    expect(report.hasInconsistentStoreyForms).toBe(false);
    expect(report.detectedDoorBottomOffsetMm).toBe(10);
    expect(report.doorOffsetInfoIssue).toBeNull();
    expect(report.detectedProducerProfile).toBe('A10');
  });

  it('F5 / F6: srsDimension="3" öznitelikli <gml:posList> ve kapısız oda durumunda null + BİLGİ (V-215) ve çok katlı uyumsuzluk tespiti çalışır', () => {
    const syntheticXml = `<?xml version="1.0" encoding="utf-8"?>
<CityModel xmlns:gml="http://www.opengis.net/gml" xmlns:bldg="http://www.opengis.net/citygml/building/2.0" xmlns:grp="http://www.opengis.net/citygml/cityobjectgroup/2.0" xmlns:gen="http://www.opengis.net/citygml/generics/2.0">
  <gml:boundedBy><gml:Envelope srsName="EPSG:5254" srsDimension="3"><gml:lowerCorner>500000 4000000 100</gml:lowerCorner><gml:upperCorner>500010 4000010 106</gml:upperCorner></gml:Envelope></gml:boundedBy>
  <bldg:Building gml:id="MB_00000000-0000-5000-8000-000000000001">
    <gen:stringAttribute name="constructionID"><gen:value>100-A</gen:value></gen:stringAttribute>
    <bldg:interiorRoom>
      <bldg:Room gml:id="BBK_00000000-0000-5000-8000-000000000002">
        <bldg:boundedBy>
          <bldg:FloorSurface>
            <gml:Polygon gml:id="Floor_00000000-0000-5000-8000-000000000003">
              <gml:exterior><gml:LinearRing gml:id="LinearRing_00000000-0000-5000-8000-000000000004">
                <gml:posList srsDimension="3">500000 4000000 100.000 500010 4000000 100.000 500010 4000010 100.000 500000 4000000 100.000</gml:posList>
              </gml:LinearRing></gml:exterior>
            </gml:Polygon>
          </bldg:FloorSurface>
        </bldg:boundedBy>
      </bldg:Room>
    </bldg:interiorRoom>
  </bldg:Building>
  <grp:CityObjectGroup gml:id="K_00000000-0000-5000-8000-000000000010">
    <gml:Polygon gml:id="Floor_1"/><gml:Polygon gml:id="Floor_2"/>
  </grp:CityObjectGroup>
  <grp:CityObjectGroup gml:id="K_00000000-0000-5000-8000-000000000011">
    <gml:Polygon gml:id="Floor_3"/>
  </grp:CityObjectGroup>
</CityModel>`;

    const rep = inspectCityGmlSample(syntheticXml);
    expect(rep.coordinateEncoding).toBe('gml:posList');
    expect(rep.detectedStoreyForms).toEqual(['C', 'A']);
    expect(rep.hasInconsistentStoreyForms).toBe(true);
    expect(rep.detectedDoorBottomOffsetMm).toBeNull();
    expect(rep.doorOffsetInfoIssue?.ruleId).toBe('V-215');
    expect(rep.doorOffsetInfoIssue?.severity).toBe('B');
  });
});
