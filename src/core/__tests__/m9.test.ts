// M9 — Resmî Test (3dbinadogrula), Ön-Kontrol (Pre-Flight), KML/GeoJSON Parsel Sınırı ve Çok Blok Denetimleri
// Şartname §7.1, §8.3, §9.5, §10.6, §11; K02, K03, K07, K88-yeni, K89, K99; V-019, V-100, V-101, V-192, V-193, V-217; ACIK-09, ACIK-10
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  wgs84ToTurefTm,
  turefTmToWgs84,
  parseParcelKmlOrGeoJson,
  validateParcelAndMultiBuilding,
} from '../importers/parcelImporter.ts';
import {
  parseVal3dityReport,
  runExtendedGeometryAudit,
} from '../validation/val3dity.ts';
import {
  evaluateSubmissionReadiness,
  generateSubmissionReportHtml,
  generateMalikIrtifakReportHtml,
  matchServerMessageToRule,
  type OfficialVerificationRecord,
} from '../validation/submissionPackage.ts';
import { sha256Hex } from '../hash/canonical.ts';


import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  type OfficialCodelistName,
} from '../codelists/index.ts';
import { parseCityGmlModel } from '../gml/gmlReader.ts';
import { designFromImportedModel } from '../design/fromImported.ts';
import type { Malik } from '../model/malik.ts';

const xmlMap = {} as Record<OfficialCodelistName, string>;
for (const n of OFFICIAL_CODELIST_NAMES) {
  xmlMap[n] = fs.readFileSync(
    path.resolve(process.cwd(), 'resources', 'codelists', `${n}.xml`),
    'utf-8'
  );
}
const registry = createCodelistRegistryFromXmlMap(xmlMap);
const ORNEK6_XML = fs.readFileSync(
  path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'),
  'utf-8'
);
const ornek6Model = parseCityGmlModel(ORNEK6_XML, 'M-70125626-A.gml', registry);

describe('M9 — Resmî Test, Ön-Kontrol, Parsel ve Doğrulama Raporu (§7.1, §8.3, §9.5, §10.6, §11)', () => {
  describe('1. WGS84 ↔ TUREF TM Dönüşümü ve Parsel İçe Aktarma (§8.3, K07, K08, V-019)', () => {
    it('WGS84 enlem/boylam koordinatlarını TUREF TM 3° metre koordinatına yüksek hassasiyetle dönüştürür ve geri döner', () => {
      // Ankara Kızılay civarı: ~32.854° E, 39.920° N -> DOM 33 (EPSG:5255)
      const lon = 32.85425;
      const lat = 39.92082;
      const turef = wgs84ToTurefTm(lon, lat);

      expect(turef.epsg).toBe(5255);
      expect(turef.dom).toBe(33);
      expect(turef.e).toBeGreaterThan(480000);
      expect(turef.e).toBeLessThan(520000);
      expect(turef.n).toBeGreaterThan(4410000);
      expect(turef.n).toBeLessThan(4430000);

      // Ters dönüşüm (TUREF -> WGS84)
      const roundtrip = turefTmToWgs84(turef.e, turef.n, turef.epsg);
      expect(roundtrip.lon).toBeCloseTo(lon, 6);
      expect(roundtrip.lat).toBeCloseTo(lat, 6);
    });

    it('KML dosyasından WGS84 parsel sınırını ayrıştırır, EPSG önerir ve yerel mm poligonuna dönüştürür', () => {
      // Ornek6 civarı parsel koordinatları (~500000 E, 4416000 N -> ~30.0° E, 39.89° N)
      const p1 = turefTmToWgs84(499990, 4415990, 5254);
      const p2 = turefTmToWgs84(500030, 4415990, 5254);
      const p3 = turefTmToWgs84(500030, 4416030, 5254);
      const p4 = turefTmToWgs84(499990, 4416030, 5254);

      const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Placemark>
    <name>Parsel 101/5</name>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>
            ${p1.lon},${p1.lat},0 ${p2.lon},${p2.lat},0 ${p3.lon},${p3.lat},0 ${p4.lon},${p4.lat},0 ${p1.lon},${p1.lat},0
          </coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>
</kml>`;

      const imported = parseParcelKmlOrGeoJson(kml, { targetEpsg: 5254 });
      expect(imported.sourceFormat).toBe('kml');
      expect(imported.coordinateSystem).toBe('wgs84');
      expect(imported.epsg).toBe(5254);
      expect(imported.areaM2).toBeGreaterThan(1500); // 40m x 40m = 1600 m2 civarı
      expect(imported.localPolygonsMm.length).toBe(1);
      expect(imported.localPolygonsMm[0].outer.length).toBe(4);
    });

    it('GeoJSON dosyasından TUREF koordinatlı parsel sınırını delikleriyle birlikte içe aktarır', () => {
      const geojson = JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [500000, 4416000],
                  [500100, 4416000],
                  [500100, 4416100],
                  [500000, 4416100],
                  [500000, 4416000],
                ],
                [
                  [500030, 4416030],
                  [500070, 4416030],
                  [500070, 4416070],
                  [500030, 4416070],
                  [500030, 4416030],
                ],
              ],
            },
          },
        ],
      });

      const imported = parseParcelKmlOrGeoJson(geojson, { targetEpsg: 5254 });
      expect(imported.sourceFormat).toBe('geojson');
      expect(imported.coordinateSystem).toBe('turef');
      expect(imported.localPolygonsMm[0].outer.length).toBe(4);
      expect(imported.localPolygonsMm[0].holes.length).toBe(1);
      // 100x100 - 40x40 = 10000 - 1600 = 8400 m2
      expect(imported.areaM2).toBeCloseTo(8400, 0);
    });
  });

  describe('2. Parsel ve Çok Blok Kesişim Denetimi (§6.13, V-019, V-192, V-193)', () => {
    it('V-193: bina tabanı parsel ile tam kesiştiğinde ve içinde kaldığında 0 HATA verir', () => {
      // Ornek6 footprint min/max değerlerini kapsayan geniş bir parsel
      const env = ornek6Model.envelope;
      const parcelPoly = {
        sourceFormat: 'turef' as const,
        coordinateSystem: 'turef' as const,
        epsg: 5254 as const,
        suggestedEpsg: null,
        centroidWgs84: null,
        centroidTuref: { e: (env.minE + env.maxE) / 2, n: (env.minN + env.maxN) / 2 },
        areaM2: 5000,
        turefPolygonsM: [
          {
            outer: [
              { e: env.minE - 20, n: env.minN - 20 },
              { e: env.maxE + 20, n: env.minN - 20 },
              { e: env.maxE + 20, n: env.maxN + 20 },
              { e: env.minE - 20, n: env.maxN + 20 },
            ],
            holes: [],
          },
        ],
        localPolygonsMm: [],
      };

      const report = validateParcelAndMultiBuilding(ornek6Model, { parcel: parcelPoly });
      expect(report.findings.filter((f) => f.ruleId === 'V-193')).toEqual([]);
      expect(report.parcelOverlapRatio).toBeCloseTo(1.0, 2);
      expect(report.parcelOutsideAreaM2).toBeLessThanOrEqual(0.01);
    });

    it('V-193: bina tabanı parsel dışına taştığında veya hiç kesişmediğinde HATA / UYARI üretir', () => {
      // Binanın 500 metre uzağında bir parsel
      const env = ornek6Model.envelope;
      const remoteParcel = {
        sourceFormat: 'turef' as const,
        coordinateSystem: 'turef' as const,
        epsg: 5254 as const,
        suggestedEpsg: null,
        centroidWgs84: null,
        centroidTuref: { e: env.minE + 500, n: env.minN + 500 },
        areaM2: 1000,
        turefPolygonsM: [
          {
            outer: [
              { e: env.minE + 450, n: env.minN + 450 },
              { e: env.minE + 550, n: env.minN + 450 },
              { e: env.minE + 550, n: env.minN + 550 },
              { e: env.minE + 450, n: env.minN + 550 },
            ],
            holes: [],
          },
        ],
        localPolygonsMm: [],
      };

      const report = validateParcelAndMultiBuilding(ornek6Model, { parcel: remoteParcel });
      const v193 = report.findings.filter((f) => f.ruleId === 'V-193' && f.severity === 'H');
      expect(v193.length).toBeGreaterThan(0);
      expect(v193[0].tkgmMessage).toContain('Binanın tabanı ile bulunduğu parsel kesişmiyor');
    });

    it('V-192: aynı parseldeki iki blok kesiştiğinde HATA ve kesişim yüzdesi raporlar', () => {
      // Ornek6 modelini kendisiyle karşılaştır (aynı blok -> %100 kesişim)
      const report = validateParcelAndMultiBuilding(ornek6Model, {
        siblingModels: [ornek6Model],
      });
      const v192 = report.findings.filter((f) => f.ruleId === 'V-192' && f.severity === 'H');
      expect(v192.length).toBeGreaterThan(0);
      expect(report.buildingPairOverlaps.length).toBe(1);
      expect(report.buildingPairOverlaps[0].overlapPercent).toBeCloseTo(100, 1);
    });
  });

  describe('3. Harici val3dity Raporu ve Genişletilmiş 3B Kabuk Denetimi (§9.5, V-101, V-217)', () => {
    it('val3dity JSON raporunu ayrıştırır ve hata kodlarını V-xxx kurallarına eşler', () => {
      const mockVal3dityJson = JSON.stringify({
        val3dity_version: '2.4.0',
        validity: false,
        all_errors: [104, 203, 302],
        features: [
          {
            id: 'BBK_12345678-0000-0000-0000-000000000001',
            type: 'Room',
            validity: false,
            errors: [
              { code: 302, description: 'SHELL_IS_NOT_CLOSED', info: '2 open edges' },
            ],
          },
          {
            id: 'Wall_12345678-0000-0000-0000-000000000002',
            type: 'Polygon',
            validity: false,
            errors: [
              { code: 104, description: 'RING_SELF_INTERSECTION' },
            ],
          },
        ],
      });

      const summary = parseVal3dityReport(mockVal3dityJson, ornek6Model);
      expect(summary.isValid).toBe(false);
      expect(summary.totalFeatures).toBe(2);
      expect(summary.invalidFeatures).toBe(2);
      expect(summary.errorCodes).toEqual([104, 203, 302]);

      // 302 kodu oda (BBK) üzerinde V-217 ile eşleşmeli
      const v217 = summary.findings.filter((f) => f.ruleId === 'V-217');
      expect(v217.length).toBe(1);
      expect(v217[0].message).toContain('val3dity -302');

      // 104 kodu V-034 ile eşleşmeli
      const v034 = summary.findings.filter((f) => f.ruleId === 'V-034');
      expect(v034.length).toBe(1);
    });

    it('Ornek6 üzerinde genişletilmiş geometri denetimi (V-101, V-108, V-125, V-162, V-200, V-217) sıfır HATA verir', () => {
      const audit = runExtendedGeometryAudit(ornek6Model);
      expect(audit.lod1SolidClosed).toBe(true);
      expect(audit.lod1OpenEdges).toBe(0);
      expect(audit.roomShells.length).toBe(16);
      expect(audit.roomShells.every((r) => r.closed10Mm)).toBe(true);
      const errors = audit.findings.filter((f) => f.severity === 'H');
      expect(errors).toEqual([]);
    });
  });

  describe('4. Teslim Ön-Kontrolü (Pre-Flight) ve Resmî Doğrulama Kaydı (§7.1, §10.6, K02, K03, K89)', () => {
    it('Ornek6 için teslim ön-kontrolü TESLİME HAZIR (0 HATA) sonucunu ve tüm kontrol kalemlerini doğrular', () => {
      const readiness = evaluateSubmissionReadiness({
        xml: ORNEK6_XML,
        fileName: 'M-70125626-A.gml',
        model: ornek6Model,
        codelists: registry,
      });

      expect(readiness.readyForTkgmUpload).toBe(true);
      expect(readiness.totalErrors).toBe(0);
      expect(readiness.expectedFileName).toBe('M-70125626-A.gml');
      expect(readiness.fileSha256.length).toBe(64);
      expect(readiness.canonicalHashSha256.length).toBe(64);

      // Kontrol listesinde HATA olan hiçbir madde bulunmamalı
      const failed = readiness.checklist.filter((item) => item.status === 'fail');
      expect(failed).toEqual([]);

      const filenameCheck = readiness.checklist.find((c) => c.id === 'CHK-FILENAME');
      expect(filenameCheck?.status).toBe('pass');

      const shellsCheck = readiness.checklist.find((c) => c.id === 'CHK-SHELLS');
      expect(shellsCheck?.status).toBe('pass');
    });

    it('Resmi TKGM 3dbinadogrula başarılı doğrulama kodu ve SHA-256 kilit eşleşmesini kontrol eder', () => {
      const fileHash = readinessForHash(ORNEK6_XML);
      const verification: OfficialVerificationRecord = {
        status: 'basarili',
        verificationCode: 'TKGM-2026-XYZ-8821',
        verifiedAt: '2026-11-08',
        fileSha256: fileHash,
        canonicalHashSha256: ornek6Model.canonicalHash,
        serverMessages: ['Model geometri ve semantik testlerini başarıyla geçti.'],
        note: 'TKGM 3dbinadogrula test ortamında onaylandı.',
      };

      const readiness = evaluateSubmissionReadiness({
        xml: ORNEK6_XML,
        fileName: 'M-70125626-A.gml',
        model: ornek6Model,
        codelists: registry,
        officialVerification: verification,
      });

      expect(readiness.hashMatchesOfficialRecord).toBe(true);
      const officialCheck = readiness.checklist.find((c) => c.id === 'CHK-OFFICIAL');
      expect(officialCheck?.status).toBe('pass');
      expect(officialCheck?.detail).toContain('TKGM-2026-XYZ-8821');
    });

    it('Sunucu hata mesajlarını eşleştirir (matchServerMessageToRule)', () => {
      const m1 = matchServerMessageToRule('Binanın tabanı ile bulunduğu parsel kesişmiyor.');
      expect(m1.matchedRuleIds).toContain('V-193');
      expect(m1.confidence).toBe('exact');

      const m2 = matchServerMessageToRule('Geometri hatası: -302 kabuk kapalı değil');
      expect(m2.matchedRuleIds).toContain('V-101');
      expect(m2.matchedRuleIds).toContain('V-217');

      const m3 = matchServerMessageToRule('Dosya adı ile yapıID uyuşmuyor.');
      expect(m3.matchedRuleIds).toContain('V-002');
    });
  });

  describe('5. Rapor Üretimi (HTML Teknik Doğrulama ve Kat İrtifakı / Malik Listesi) (§7.1, K88-yeni, K99)', () => {
    it('teknik doğrulama HTML raporu üretir; malik/kişisel veri içermez ve K89 SHA-256 özetini taşır', () => {
      const readiness = evaluateSubmissionReadiness({
        xml: ORNEK6_XML,
        fileName: 'M-70125626-A.gml',
        model: ornek6Model,
        codelists: registry,
      });

      const html = generateSubmissionReportHtml(readiness, ornek6Model);
      expect(html).toContain('TKGM 3B Sayısal Yapı Modeli (CityGML 2.0)');
      expect(html).toContain('70125626-A');
      expect(html).toContain(readiness.fileSha256);
      expect(html).toContain(readiness.canonicalHashSha256);
      expect(html).toContain('TESLİME HAZIR (0 HATA)');

      // K99 Güvenlik Denetimi: Raporda malik kişisel verisi olmamalı
      expect(html.toLowerCase()).not.toContain('tckimlik');
      expect(html.toLowerCase()).not.toContain('tc no');
    });

    it('kat irtifakı ve malik listesi raporunu BigInt hisse toplamlarıyla birlikte üretir (K88-yeni)', () => {
      const golden = designFromImportedModel(ornek6Model);
      const malikler: Malik[] = [
        {
          bbAnahtari: '-1||1',
          adSoyadVeyaUnvan: 'AHMET YILMAZ',
          tcKimlikVeyaVergiNo: '11111111110',
          hissePay: 1n,
          hissePayda: 2n,
        },
        {
          bbAnahtari: '-1||1',
          adSoyadVeyaUnvan: 'MEHMET DEMİR',
          tcKimlikVeyaVergiNo: '22222222220',
          hissePay: 1n,
          hissePayda: 2n,
        },
      ];

      const html = generateMalikIrtifakReportHtml(golden.project, malikler);
      expect(html).toContain('Kat İrtifakı ve Malik Listesi Tablosu');
      expect(html).toContain('AHMET YILMAZ');
      expect(html).toContain('MEHMET DEMİR');
      expect(html).toContain('1/1'); // Toplam hisse
      expect(html).toContain('K88-yeni / K99');
    });
  });
});

function readinessForHash(xml: string): string {
  return sha256Hex(xml);
}


// ---------------------------------------------------------------------------------------------
// KONTROL-M9 R3: WGS84 → TUREF TM mutlak doğruluğu. Gidiş-dönüş testi aynı hatayı iki yönde yapan dönüşümü yakalamaz;
// burada iki bağımsız ölçüt kullanılır:
//  (1) GRS80 meridyen yayı: ekvatordan 45°'ye 4 984 944.378 m, çeyrek meridyen (90°) 10 001 965.729 m (jeodezi sabitleri).
//  (2) Karney (2011) / Krüger n-serisi (6. derece, mikrometre doğruluğu) ile bağımsız TM hesabı.
const GRS80 = { a: 6378137.0, f: 1 / 298.257222101 };
function krugerTm(lonDeg: number, latDeg: number, lon0Deg: number): { e: number; n: number } {
  const { a, f } = GRS80;
  const n = f / (2 - f);
  const n2 = n * n, n3 = n2 * n, n4 = n3 * n, n5 = n4 * n, n6 = n5 * n;
  const A = (a / (1 + n)) * (1 + n2 / 4 + n4 / 64 + n6 / 256);
  const al = [
    0,
    n / 2 - (2 * n2) / 3 + (5 * n3) / 16 + (41 * n4) / 180 - (127 * n5) / 288 + (7891 * n6) / 37800,
    (13 * n2) / 48 - (3 * n3) / 5 + (557 * n4) / 1440 + (281 * n5) / 630 - (1983433 * n6) / 1935360,
    (61 * n3) / 240 - (103 * n4) / 140 + (15061 * n5) / 26880 + (167603 * n6) / 181440,
    (49561 * n4) / 161280 - (179 * n5) / 168 + (6601661 * n6) / 7257600,
    (34729 * n5) / 80640 - (3418889 * n6) / 1995840,
    (212378941 * n6) / 319334400,
  ];
  const phi = (latDeg * Math.PI) / 180;
  const dl = ((lonDeg - lon0Deg) * Math.PI) / 180;
  const e = (2 * Math.sqrt(n)) / (1 + n);
  const t = Math.sinh(Math.atanh(Math.sin(phi)) - e * Math.atanh(e * Math.sin(phi)));
  const xi1 = Math.atan2(t, Math.cos(dl));
  const eta1 = Math.atanh(Math.sin(dl) / Math.sqrt(1 + t * t));
  let xi = xi1;
  let eta = eta1;
  for (let j = 1; j <= 6; j++) {
    xi += al[j] * Math.sin(2 * j * xi1) * Math.cosh(2 * j * eta1);
    eta += al[j] * Math.cos(2 * j * xi1) * Math.sinh(2 * j * eta1);
  }
  return { e: 500000 + A * eta, n: A * xi };
}

describe('KONTROL-M9 R3 — WGS84 → TUREF TM mutlak doğruluk (bağımsız ölçütler)', () => {
  it('GRS80 meridyen yayı: orta meridyende E = 500000, N(45°) = 4 984 944.378 m (±5 mm)', () => {
    const p = wgs84ToTurefTm(30, 45, 5254);
    expect(Math.abs(p.e - 500000)).toBeLessThan(0.001);
    expect(Math.abs(p.n - 4984944.378)).toBeLessThan(0.005);
    // Bağımsız seri de aynı sabiti vermeli (testin kendisinin doğrulaması)
    expect(Math.abs(krugerTm(30, 45, 30).n - 4984944.378)).toBeLessThan(0.005);
    expect(Math.abs(krugerTm(30, 90 - 1e-9, 30).n - 10001965.729)).toBeLessThan(0.005);
  });
  it('Türkiye dilimlerinde 1,5°\'ye kadar doğu/batı uzaklıkta Krüger serisiyle ±5 mm aynı', () => {
    const pts: [number, number, 5253 | 5254 | 5255 | 5256 | 5257 | 5258 | 5259, number][] = [
      [26.6, 41.7, 5253, 27], // Edirne
      [28.98, 41.01, 5254, 30], // İstanbul
      [31.45, 40.2, 5254, 30], // dilim kenarı
      [32.85, 39.93, 5255, 33], // Ankara
      [35.33, 37.0, 5256, 36], // Adana
      [39.72, 41.0, 5257, 39], // Trabzon
      [42.5, 39.5, 5258, 42], // Ağrı batısı
      [44.05, 39.92, 5259, 45], // Iğdır
    ];
    for (const [lon, lat, epsg, dom] of pts) {
      const p = wgs84ToTurefTm(lon, lat, epsg);
      const k = krugerTm(lon, lat, dom);
      expect(Math.abs(p.e - k.e), `${lon},${lat} E`).toBeLessThan(0.005);
      expect(Math.abs(p.n - k.n), `${lon},${lat} N`).toBeLessThan(0.005);
    }
  });
});
