// M7 — Konumlandırma Sihirbazı ve İçe Aktarma (DXF, Helmert, Raster, Liste Beyan)
// Şartname §7.3, §8.1, §8.2, §8.4, §11; KARAR D-23.5; CLAUDE13 §1 K88-yeni; OY-04; OY-06
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getEpsgMetadata,
  suggestEpsgFromLongitude,
  isValidTurefCoord,
  parseSurveyPointsText,
  runHelmertGeorefWizard,
  applyHelmertWizardToProject,
  computeTwoPointAlignmentAngle,
  calibrateRasterAxes,
  solveRasterAffine2D,
  transformPixelToDesignMm,
  inferPartUsageFromRoomLabel,
  suggestRoleForDxfLayerName,
  tessellateBulgeSegment,
  circleTo12GonMeters,
  parseDxfText,
  georeferenceDxfDocument,
  importDxfIntoDesignStorey,
  exportDesignStoreyToDxf,
  parseListeBeyanText,
  applyApprovedListeBeyanToProject,
  generateListeBeyanTemplateCsv,
  type DxfLayerMappingTable,
} from '../importers/index.ts';
import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  type OfficialCodelistName,
} from '../codelists/index.ts';
import { designFromImportedModel } from '../design/fromImported.ts';
import { serializeProject, parseProject } from '../design/projectFile.ts';
import type { DesignProject, Pt2 } from '../design/types.ts';
import { generateBrep } from '../brep/generate.ts';
import { ORNEK6_BREP_OPTIONS } from '../brep/types.ts';
import { writeCityGml } from '../gml/cityGmlWriter.ts';
import { parseCityGmlModel, type ImportedModel } from '../gml/gmlReader.ts';
import { validateCityGml } from '../validation/index.ts';

const xmlMap = {} as Record<OfficialCodelistName, string>;
for (const n of OFFICIAL_CODELIST_NAMES) {
  xmlMap[n] = fs.readFileSync(
    path.resolve(process.cwd(), 'resources', 'codelists', `${n}.xml`),
    'utf-8'
  );
}
const registry = createCodelistRegistryFromXmlMap(xmlMap);
const ORNEK6 = fs.readFileSync(
  path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'),
  'utf-8'
);
const srcModel = parseCityGmlModel(ORNEK6, 'M-70125626-A.gml', registry);
const golden = designFromImportedModel(srcModel);
const refProject = golden.project;

const countByPrefix = (m: ImportedModel, p: string) =>
  m.objects.filter((o) => o.prefix === p).length;

describe('M7 — Konumlandırma Sihirbazı ve İçe Aktarma (DXF, Helmert, Raster, Liste Beyan)', () => {
  describe('1. EPSG / DOM Önerisi ve Röleve / TIC Dönüşümü (§7.3, K07, K08, K54, K69)', () => {
    it('boylamdan (λ) doğru TUREF TM dilim orta meridyenini (DOM) ve EPSG:5253..5259 kodunu önerir', () => {
      // İstanbul / Kocaeli ~ 29.8° -> DOM 30° -> EPSG:5254
      const s30 = suggestEpsgFromLongitude(29.8);
      expect(s30.epsg).toBe(5254);
      expect(s30.dom).toBe(30);

      // Ankara ~ 32.85° -> DOM 33° -> EPSG:5255
      const s33 = suggestEpsgFromLongitude(32.85);
      expect(s33.epsg).toBe(5255);
      expect(s33.dom).toBe(33);

      // İzmir ~ 27.14° -> DOM 27° -> EPSG:5253
      const s27 = suggestEpsgFromLongitude(27.14);
      expect(s27.epsg).toBe(5253);
      expect(s27.dom).toBe(27);

      // Van ~ 43.38° -> DOM 42° -> EPSG:5258
      const s42 = suggestEpsgFromLongitude(43.38);
      expect(s42.epsg).toBe(5258);
      expect(s42.dom).toBe(42);

      const meta = getEpsgMetadata(5255);
      expect(meta.dom).toBe(33);
      expect(meta.proj4Def).toContain('+lon_0=33');
    });

    it('3B röleve köşe tablosunu (ID, E, N, Z) ayrıştırır, TUREF aralığını doğrular ve TIC üretir', () => {
      const text = [
        '# Röleve köşe noktaları',
        'P1; 496972.340; 4524903.750; 34.480',
        'P2; 496984.990; 4524903.750; 34.480',
        'P3; 496984.990; 4524914.370; 34.480',
        'P4; 496972.340; 4524914.370; 34.480',
      ].join('\n');

      const points = parseSurveyPointsText(text);
      expect(points).toHaveLength(4);
      expect(isValidTurefCoord(points[0]!.e, points[0]!.n)).toBe(true);

      const pairs = points.map((p, idx) => ({
        id: p.id,
        localX: idx === 1 || idx === 2 ? 12.65 : 0,
        localY: idx >= 2 ? 10.62 : 0,
        targetE: p.e,
        targetN: p.n,
      }));

      const wiz = runHelmertGeorefWizard({
        epsg: 5254,
        surveyPoints: points,
        pairs,
        zeroElevationOrthometricMm: 34480,
      });

      expect(wiz.issues.filter((i) => i.severity === 'H')).toHaveLength(0);
      expect(wiz.georef.originE).toBe(496972);
      expect(wiz.georef.originN).toBe(4524903);
      expect(wiz.ticPointsMm).toHaveLength(4);
      expect(wiz.ticPointsMm[0]).toEqual({
        x: 340,
        y: 750,
        z: 34480,
      });
    });

    it('2B Helmert çözümünde 5 cm (50 mm) kalıntı eşiğini ve leave-one-out sapan nokta tespitini çalıştırır', () => {
      // Gerçek dönüşüm: 90 derece dönüş + öteleme (496972, 4524903)
      // (E, N) = (496972 - y_local, 4524903 + x_local)
      // K3 noktasında ~43 cm sapan hata (outlier) simüle edelim
      const pairs = [
        { id: 'K1', localX: 0, localY: 0, targetE: 496972.0, targetN: 4524903.0 },
        { id: 'K2', localX: 10, localY: 0, targetE: 496972.0, targetN: 4524913.0 },
        { id: 'K3', localX: 10, localY: 8, targetE: 496964.0 + 0.35, targetN: 4524913.0 - 0.25 },
        { id: 'K4', localX: 0, localY: 8, targetE: 496964.0, targetN: 4524903.0 },
      ];

      const wiz = runHelmertGeorefWizard({
        epsg: 5254,
        pairs,
        zeroElevationOrthometricMm: 34480,
        maxResidualThresholdMm: 50,
      });

      expect(wiz.exceedsThreshold).toBe(true);
      expect(wiz.outlierReport).not.toBeNull();
      expect(wiz.outlierReport?.suspectPointId).toBe('K3');
      expect(wiz.issues.some((w) => w.pointId === 'K3')).toBe(true);
    });
  });

  describe('2. Raster Kat Planı Kalibrasyonu (§8.1, KARAR D-23.5)', () => {
    it('2 noktalı yatay referans açısından döndürme açısını hesaplar', () => {
      // Sağ-aşağı 45 derece eğik bir çizgi (piksel v aşağı doğru artar -> dvUp = -100 -> 45 derece döndürme gerekir)
      const angle = computeTwoPointAlignmentAngle({ u: 100, v: 100 }, { u: 200, v: 200 });
      expect(angle.angleDeg).toBeCloseTo(45, 5);
    });

    it('2 X + 2 Y bilinen uzunluk ve 3. kontrol ölçüsüyle piksel ölçeğini kalibre eder', () => {
      // 1 piksel = 10 mm (X), 1 piksel = 10 mm (Y)
      const calib = calibrateRasterAxes(
        [
          { id: 'X1', axis: 'X', p1: { u: 0, v: 0 }, p2: { u: 500, v: 0 }, declaredMeters: 5.0 },
          { id: 'X2', axis: 'X', p1: { u: 0, v: 100 }, p2: { u: 320, v: 100 }, declaredMeters: 3.2 },
          { id: 'Y1', axis: 'Y', p1: { u: 0, v: 0 }, p2: { u: 0, v: 400 }, declaredMeters: 4.0 },
          { id: 'Y2', axis: 'Y', p1: { u: 200, v: 0 }, p2: { u: 200, v: 280 }, declaredMeters: 2.8 },
        ],
        {
          checkMeasurement: {
            p1: { u: 0, v: 0 },
            p2: { u: 300, v: 400 },
            declaredMeters: 5.0, // 3-4-5 üçgeni -> 5.00 m
          },
        }
      );

      expect(calib.scaleXMmPerPx).toBeCloseTo(10, 6);
      expect(calib.scaleYMmPerPx).toBeCloseTo(10, 6);
      expect(calib.anisotropyRatio).toBeCloseTo(1, 6);
      expect(calib.checkResidualMm).toBeCloseTo(0, 6);
      expect(calib.maxResidualMm).toBeCloseTo(0, 6);
    });

    it('>= 3 kontrol noktasıyla 2B afin (6 parametreli en küçük kareler) dönüşümünü çözer', () => {
      // Bilinen afin dönüşüm: x = 1000 + 10*u, y = 8000 - 10*v
      const pairs = [
        { id: 'C1', pixel: { u: 0, v: 0 }, targetMm: { x: 1000, y: 8000 } },
        { id: 'C2', pixel: { u: 500, v: 0 }, targetMm: { x: 6000, y: 8000 } },
        { id: 'C3', pixel: { u: 500, v: 400 }, targetMm: { x: 6000, y: 4000 } },
        { id: 'C4', pixel: { u: 0, v: 400 }, targetMm: { x: 1000, y: 4000 } },
      ];

      const res = solveRasterAffine2D(pairs);
      expect(res.maxResidualMm).toBeLessThan(1e-6);

      const pt = transformPixelToDesignMm({ u: 250, v: 200 }, res);
      expect(pt).toEqual({ x: 3500, y: 6000 });
    });
  });

  describe('3. DXF Okuyucu: $INSUNITS, Bulge Yay, INSERT Blok, CIRCLE 12-gen, LINE Zincirleme, TEXT Oda Etiketi (§8.2, K63, K76)', () => {
    it('Türkçe oda etiketlerinden Ek-A partUsage kodunu ve katman adlarından rol önerisini çıkarır', () => {
      expect(inferPartUsageFromRoomLabel('SALON')).toBe(1003);
      expect(inferPartUsageFromRoomLabel('YATAK ODASI 1')).toBe(1001);
      expect(inferPartUsageFromRoomLabel('MUTFAK')).toBe(1004);
      expect(inferPartUsageFromRoomLabel('BANYO')).toBe(1002);
      expect(inferPartUsageFromRoomLabel('TUVALET / WC')).toBe(1006);
      expect(inferPartUsageFromRoomLabel('ANTRE - HOL')).toBe(1008);
      expect(inferPartUsageFromRoomLabel('MERDİVEN EVİ')).toBe(1024);
      expect(inferPartUsageFromRoomLabel('MERDİVEN HOLÜ')).toBe(1024);
      expect(inferPartUsageFromRoomLabel('SPOR SALONU')).toBe(1020);
      expect(inferPartUsageFromRoomLabel('SIĞINAK')).toBe(1010);

      expect(suggestRoleForDxfLayerName('A-KAT_SINIRI').role).toBe('kat_siniri');
      expect(suggestRoleForDxfLayerName('M-BALKON').role).toBe('balkon');
      expect(suggestRoleForDxfLayerName('A-KAPI').role).toBe('kapi');
      expect(suggestRoleForDxfLayerName('A-PENCERE').role).toBe('pencere');
      expect(suggestRoleForDxfLayerName('ORTAK_ALAN').role).toBe('oa');
      expect(suggestRoleForDxfLayerName('BB_1').role).toBe('bb');
    });

    it('LWPOLYLINE bulge yayını <= 5° ve <= 5 cm sehim kısıtıyla kırıklar ve CIRCLE nesnesini 12-gene (K63) çevirir', () => {
      // Yarım daire (bulge = 1.0 -> 180 derece), çap = 4 m -> min 180/5 = 36 segment
      const arcPts = tessellateBulgeSegment({ x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, 1.0);
      expect(arcPts.length).toBeGreaterThanOrEqual(36);

      // K63 dairesel kolon -> 12-gen
      const colRing = circleTo12GonMeters(5, 5, 0, 0.3, 12);
      expect(colRing).toHaveLength(12);
    });

    it('$INSUNITS=5 (cm), LWPOLYLINE, LINE zinciri, CIRCLE, INSERT blok ve TEXT içeren karma DXF metnini ayrıştırır', () => {
      const sampleDxf = [
        '0', 'SECTION',
        '2', 'HEADER',
        '9', '$INSUNITS',
        '70', '5', // 5 = cm (0.01 m)
        '0', 'ENDSEC',
        '0', 'SECTION',
        '2', 'BLOCKS',
        '0', 'BLOCK',
        '2', 'KOLON_BLOK',
        '10', '0', '20', '0',
        '0', 'LWPOLYLINE',
        '8', 'KOLON',
        '70', '1',
        '10', '0', '20', '0',
        '10', '40', '20', '0',
        '10', '40', '20', '40',
        '10', '0', '20', '40',
        '0', 'ENDBLK',
        '0', 'ENDSEC',
        '0', 'SECTION',
        '2', 'ENTITIES',
        // Kat sınırı: 4 adet LINE ile 1000x800 cm (10x8 m) dikdörtgen
        '0', 'LINE', '8', 'KAT_SINIRI', '10', '0', '20', '0', '11', '1000', '21', '0',
        '0', 'LINE', '8', 'KAT_SINIRI', '10', '1000', '20', '0', '11', '1000', '21', '800',
        '0', 'LINE', '8', 'KAT_SINIRI', '10', '1000', '20', '800', '11', '0', '21', '800',
        '0', 'LINE', '8', 'KAT_SINIRI', '10', '0', '20', '800', '11', '0', '21', '0',
        // Oda LWPOLYLINE: 500x400 cm (5x4 m)
        '0', 'LWPOLYLINE', '8', 'ODA_DUVAR', '70', '1',
        '10', '0', '20', '0',
        '10', '500', '20', '0',
        '10', '500', '20', '400',
        '10', '0', '20', '400',
        // Oda içinde TEXT etiketi: SALON
        '0', 'TEXT', '8', 'ODA_YAZI', '10', '250', '20', '200', '1', 'SALON',
        // Dairesel kolon CIRCLE (yarıçap 30 cm -> çap 60 cm > 50 cm K63)
        '0', 'CIRCLE', '8', 'DAIRE_KOLON', '10', '700', '20', '500', '40', '30',
        // Blok referansı INSERT
        '0', 'INSERT', '8', 'KOLON', '2', 'KOLON_BLOK', '10', '100', '20', '100', '41', '1', '42', '1', '50', '0',
        '0', 'ENDSEC',
        '0', 'EOF',
      ].join('\n');

      const doc = parseDxfText(sampleDxf);
      expect(doc.detectedInsUnits).toBe(5);
      expect(doc.effectiveUnit).toBe('cm');
      expect(doc.unitToMeterFactor).toBeCloseTo(0.01, 6);
      expect(doc.isAlreadyTuref).toBe(false);

      const geo = georeferenceDxfDocument(doc, {
        helmert: {
          a: 1,
          b: 0,
          tE: 496972,
          tN: 4524903,
        },
        targetGeoref: {
          epsg: 5254,
          originE: 496972,
          originN: 4524903,
          zeroElevationOrthometric: 34480,
        },
      });

      expect(geo.byLayer['KAT_SINIRI']?.closedRingsMm).toHaveLength(1);
      expect(geo.byLayer['ODA_DUVAR']?.closedRingsMm).toHaveLength(1);
      expect(geo.byLayer['DAIRE_KOLON']?.closedRingsMm[0]).toHaveLength(12);
      expect(geo.byLayer['KOLON']?.closedRingsMm).toHaveLength(1);
      expect(geo.byLayer['ODA_YAZI']?.textsMm[0]?.text).toBe('SALON');
      expect(geo.byLayer['ODA_YAZI']?.textsMm[0]?.inferredPartUsage).toBe(1003);
    });
  });

  describe('4. §11 M7 Altın Kabul Testi: Gerçek Proje (Ornek6) DXF İçe Aktarma + Helmert Konumlandırma + 0 HATA CityGML', () => {
    it('Ornek6 projesinin yerel/döndürülmüş CAD DXF çizimlerini Helmert ile konumlandırıp katman eşlemesiyle içe alır ve 0 HATA ile CityGML üretir', () => {
      const gb = refProject.buildings[0]!;

      // Simüle edilen yerel CAD <-> TUREF Helmert dönüşümü (30 derece döndürme + TUREF öteleme):
      // E = a * x_local - b * y_local + tE
      // N = b * x_local + a * y_local + tN
      const theta = (30 * Math.PI) / 180;
      const forwardHelmert = {
        a: Math.cos(theta),
        b: Math.sin(theta),
        tE: refProject.georef.originE - 50,
        tN: refProject.georef.originN - 80,
      };

      // 4 kontrol noktası çifti (Yerel CAD metre <-> TUREF E, N metre)
      const localTestCorners = [
        { id: 'KP-1', x: 10, y: 10 },
        { id: 'KP-2', x: 40, y: 10 },
        { id: 'KP-3', x: 40, y: 35 },
        { id: 'KP-4', x: 10, y: 35 },
      ];
      const controlPairs = localTestCorners.map((c) => ({
        id: c.id,
        localX: c.x,
        localY: c.y,
        targetE: forwardHelmert.a * c.x - forwardHelmert.b * c.y + forwardHelmert.tE,
        targetN: forwardHelmert.b * c.x + forwardHelmert.a * c.y + forwardHelmert.tN,
      }));

      // Röleve noktalarını Ornek6 TIC noktalarından oluştur
      const surveyPoints = (gb.tic ?? []).map((t, idx) => ({
        id: `TIC-${idx + 1}`,
        e: refProject.georef.originE + t.x / 1000,
        n: refProject.georef.originN + t.y / 1000,
        z: t.z / 1000,
      }));

      // 1. Helmert Konumlandırma Sihirbazını çalıştır
      const wiz = runHelmertGeorefWizard({
        epsg: refProject.georef.epsg,
        surveyPoints,
        pairs: controlPairs,
        zeroElevationOrthometricMm: gb.storeys[0]!.zBottom,
      });

      expect(wiz.issues.filter((i) => i.severity === 'H')).toHaveLength(0);
      expect(wiz.helmert.maxResidualMm).toBeLessThan(0.1);
      expect(wiz.exceedsThreshold).toBe(false);

      // 2. Yeni bir hedef DesignProject oluştur (üstveri, bağımsız bölüm tanımları ve çatı hazır; katların 2B çizimleri boş)
      const sectionLevelCardinals: Record<string, readonly number[]> = {};
      for (const sp of gb.sectionParts) {
        const dirs = gb.cardinalDirections?.[sp.id];
        if (dirs) {
          sectionLevelCardinals[sp.sectionId] = dirs;
        }
      }

      let targetProject: DesignProject = {
        ...structuredClone(refProject),
        buildings: [
          {
            ...structuredClone(gb),
            storeys: gb.storeys.map((st) => ({
              ...structuredClone(st),
              outline: [],
            })),
            sectionParts: [],
            parts: [],
            openings: [],
            balconies: [],
            cardinalDirections: sectionLevelCardinals,
            tic: [],
          },
        ],
      };

      targetProject = applyHelmertWizardToProject(targetProject, wiz);
      expect(targetProject.buildings[0]!.tic).toHaveLength(gb.tic!.length);

      // 3. Ornek6'nın her katını yerel döndürülmüş CAD DXF olarak dışa aktar,
      //    sonra parseDxfText -> georeferenceDxfDocument -> importDxfIntoDesignStorey ile içe al!
      for (const refStorey of gb.storeys) {
        const dxfString = exportDesignStoreyToDxf(refProject, refStorey.id, {
          inverseHelmert: wiz.helmert,
          unit: 'm',
        });

        const parsedDxf = parseDxfText(dxfString);
        expect(parsedDxf.isAlreadyTuref).toBe(false);

        const georefDxf = georeferenceDxfDocument(parsedDxf, {
          helmert: wiz.helmert,
          targetGeoref: refProject.georef,
        });

        const layerMapping: Record<string, ReturnType<typeof suggestRoleForDxfLayerName>> = {};
        for (const layerName of parsedDxf.layers) {
          layerMapping[layerName] = suggestRoleForDxfLayerName(layerName);
        }

        const imp = importDxfIntoDesignStorey(
          targetProject,
          georefDxf,
          refStorey.id,
          layerMapping
        );
        targetProject = imp.project;
      }

      // 4. İçe aktarılan projeden 3B B-Rep ve CityGML üret ve doğrula
      const brep = generateBrep(targetProject, targetProject.buildings[0]!, ORNEK6_BREP_OPTIONS);
      expect(brep.issues).toEqual([]);

      const out = writeCityGml(targetProject, brep, registry);
      const outModel = parseCityGmlModel(out.xml, out.fileName, registry);
      const report = validateCityGml(out.xml, out.fileName, outModel, registry);

      const hErrors = report.findings
        .filter((f) => f.severity === 'H')
        .map((f) => `${f.ruleId}: ${f.message}`);

      expect(hErrors).toEqual([]);
      expect(report.counts.H).toBe(0);
      expect(report.counts.U).toBe(0);
      expect(
        ['MB_', 'K_', 'BB_', 'BBK_', 'OA_', 'BLKN_', 'KAPI_', 'PEN_', 'MBG_'].map((p) =>
          countByPrefix(outModel, p)
        )
      ).toEqual([1, 2, 2, 16, 0, 4, 44, 38, 1]);
    });

    it('zaten TUREF TM koordinatlarında olan bir DXF dosyasını otomatik algılar ve Helmert gerekmeden doğrudan içe alır', () => {
      const gb = refProject.buildings[0]!;
      const st0 = gb.storeys[0]!;

      const dxfText = exportDesignStoreyToDxf(refProject, st0.id, { unit: 'm' });
      const doc = parseDxfText(dxfText);

      expect(doc.isAlreadyTuref).toBe(true);

      const georefDxf = georeferenceDxfDocument(doc, {
        targetGeoref: refProject.georef,
      });

      const katRings = georefDxf.byLayer['KAT_SINIRI']?.closedRingsMm ?? [];
      expect(katRings).toHaveLength(1);
      const p0: Pt2 = katRings[0]![0]!;
      const refP0: Pt2 = st0.outline[0]!.outer[0]!;
      expect(Math.hypot(p0.x - refP0.x, p0.y - refP0.y)).toBeLessThanOrEqual(1);
    });
  });

  describe('5. Liste Beyan (CSV/TSV/Akıllı Yapıştırma) ve Malik Listesi (§8.4, K88-yeni, OY-04, OY-06, K99)', () => {
    it('şablon CSV ve TSV (Excel kopyala-yapıştır) metnini ayrıştırır, KAT_TANIMI metnini korur (OY-04), NITELIK/EKLENTI alanlarını Türkçe büyük harfe çevirir (K61) ve Malik bilgisini yalnız .tkgm3b dosyasında saklar (K99)', () => {
      const tsv = [
        'BB_NO\tBLOK\tGIRIS\tKAT_TANIMI\tNITELIK\tEKLENTI\tARSA_PAYI\tNET_ALAN\tBRUT_ALAN\tMAKS_BB_NO\tMAKS_NUMARATAJ_NO\tKULLANIM\tCEPHE\tMALIK_AD\tTC_VERGI_NO\tMALIK_HISSE\tMALIK_NOT',
        '1\tA\t1\tZemin + 1. Normal Kat\tdubleks mesken\t1 nolu kömürlük\t250/500\t110,50\t130,00\t1001\t2001\t1001\t1001;1002\tAhmet Yılmaz\t12345678901\t1/2\tİntifa hakkı var',
        '1\tA\t1\tZemin + 1. Normal Kat\tdubleks mesken\t1 nolu kömürlük\t250/500\t110,50\t130,00\t1001\t2001\t1001\t1001;1002\tAyşe Yılmaz\t12345678902\t1/2\t',
        '2\tA\t1\t2. Normal Kat\tişyeri - ofis\t\t250/500\t95.00\t115.00\t1002\t2002\t1002\t1001;1003\tMehmet Demir\t12345678903\t1/1\t',
      ].join('\n');

      const parsed = parseListeBeyanText(tsv);
      expect(parsed.detectedDelimiter).toBe('\t');
      expect(parsed.hasBlockingErrors).toBe(false);
      expect(parsed.malikList).toHaveLength(3);

      const r1 = parsed.rows[0]!;
      // OY-04: KAT_TANIMI olduğu gibi korunur
      expect(r1.katTanimi).toBe('Zemin + 1. Normal Kat');
      // K61: NITELIK ve EKLENTI Türkçe büyük harfe çevrilir (i -> İ)
      expect(r1.nitelik).toBe('DUBLEKS MESKEN');
      expect(r1.eklenti).toBe('1 NOLU KÖMÜRLÜK');
      expect(r1.arsaPayi).toBe('250/500');
      expect(r1.netAlan).toBeCloseTo(110.5, 4);
      expect(r1.brutAlan).toBeCloseTo(130.0, 4);
      expect(r1.cepheler).toEqual([1001, 1002]);

      const r3 = parsed.rows[2]!;
      expect(r3.nitelik).toBe('İŞYERİ - OFİS');

      // OY-06: Kullanıcı önizlemeyi onayladıktan sonra projeye aktarılır
      const applied = applyApprovedListeBeyanToProject(refProject, parsed);
      expect(applied.project.buildings[0]!.sections).toHaveLength(2);
      expect(applied.malikler).toHaveLength(3);

      // .tkgm3b proje dosyasında malik listesi saklanır ve geri okunur
      const savedJson = serializeProject(applied.project, applied.malikler);
      const reloaded = parseProject(savedJson);
      expect(reloaded.malikler).toHaveLength(3);
      expect(reloaded.malikler[0]?.adSoyadVeyaUnvan).toBe('AHMET YILMAZ');

      // K99: Malik bilgileri CityGML çıktısına ASLA yazılmaz!
      const brep = generateBrep(
        applied.project,
        applied.project.buildings[0]!,
        ORNEK6_BREP_OPTIONS
      );
      const gmlOut = writeCityGml(applied.project, brep, registry);
      expect(gmlOut.xml).not.toContain('AHMET YILMAZ');
      expect(gmlOut.xml).not.toContain('12345678901');
      expect(gmlOut.xml.toLowerCase()).not.toContain('malik');
    });

    it('hatalı ARSA_PAYI (V-198a/b), mükerrer BB_NO (V-212), arsa payı toplamı (V-199) ve malik hisse toplamı (V-208) uyarılarını yakalar', () => {
      const badCsv = [
        'BB_NO;KAT_TANIMI;NITELIK;ARSA_PAYI;NET_ALAN;BRUT_ALAN;MALIK_AD;MALIK_HISSE',
        '1;Zemin Kat;MESKEN;100/0;80;95;Ali Veli;1/3',
        '2;1. Kat;MESKEN;200/500;90;105;;',
        '2;1. Kat;MESKEN;200/500;90;105;;',
      ].join('\n');

      const parsed = parseListeBeyanText(badCsv);
      expect(parsed.hasBlockingErrors).toBe(true);
      expect(parsed.issues.some((e) => e.ruleId.startsWith('V-198'))).toBe(true);
      expect(parsed.issues.some((w) => w.ruleId === 'V-212')).toBe(true);
      expect(parsed.issues.some((w) => w.ruleId === 'V-208')).toBe(true);

      // Şablon CSV üreticisi de geçerli bir önizleme üretmeli
      const tpl = generateListeBeyanTemplateCsv();
      const tplPreview = parseListeBeyanText(tpl);
      expect(tplPreview.hasBlockingErrors).toBe(false);
      expect(tplPreview.rows).toHaveLength(2);
    });
  });

  describe('6. KONTROL-M7 Regresyon Testleri (R1, R2, R3, R4, R5, R8)', () => {
    it('R1: applyHelmertWizardToProject transformExistingGeometry=false iken mevcut geometrinin TUREF koordinatlarını ±1 mm içinde korur ve TIC ile aynı kökende hizalar', () => {
      const origB = refProject.buildings[0]!;
      const origVert = origB.storeys[0]!.outline[0]!.outer[0]!;
      const origTurefE = refProject.georef.originE + origVert.x / 1000;
      const origTurefN = refProject.georef.originN + origVert.y / 1000;

      // Farklı bir originE/originN (ör. +25 m Doğu, +40 m Kuzey) üreten kontrol noktaları ve röleve noktaları
      const shiftedSurvey = [
        { id: 'S1', e: refProject.georef.originE + 25.4, n: refProject.georef.originN + 40.6, z: 1095.9 },
        { id: 'S2', e: refProject.georef.originE + 35.4, n: refProject.georef.originN + 40.6, z: 1095.9 },
        { id: 'S3', e: refProject.georef.originE + 35.4, n: refProject.georef.originN + 50.6, z: 1095.9 },
      ];
      const wiz = runHelmertGeorefWizard({
        epsg: refProject.georef.epsg,
        surveyPoints: shiftedSurvey,
        pairs: [
          { id: 'P1', localX: 0, localY: 0, targetE: shiftedSurvey[0]!.e, targetN: shiftedSurvey[0]!.n },
          { id: 'P2', localX: 10, localY: 0, targetE: shiftedSurvey[1]!.e, targetN: shiftedSurvey[1]!.n },
          { id: 'P3', localX: 10, localY: 10, targetE: shiftedSurvey[2]!.e, targetN: shiftedSurvey[2]!.n },
        ],
        zeroElevationOrthometricMm: 1095900,
      });

      // Raporun kendi kökeni mevcut projeden farklıdır (+25 m, +40 m)
      expect(wiz.georef.originE).toBe(refProject.georef.originE + 25);
      expect(wiz.georef.originN).toBe(refProject.georef.originN + 40);

      // 1) transformExistingGeometry: false -> mevcut poligonların TUREF koordinatı değişmemeli ve TIC aynı kökende olmalı
      const appliedFalse = applyHelmertWizardToProject(refProject, wiz, {
        transformExistingGeometry: false,
      });
      const afterVertFalse = appliedFalse.buildings[0]!.storeys[0]!.outline[0]!.outer[0]!;
      const afterTurefE = appliedFalse.georef.originE + afterVertFalse.x / 1000;
      const afterTurefN = appliedFalse.georef.originN + afterVertFalse.y / 1000;
      expect(Math.abs(afterTurefE - origTurefE) * 1000).toBeLessThanOrEqual(1);
      expect(Math.abs(afterTurefN - origTurefN) * 1000).toBeLessThanOrEqual(1);

      const tic0 = appliedFalse.buildings[0]!.tic![0]!;
      const tic0TurefE = appliedFalse.georef.originE + tic0.x / 1000;
      const tic0TurefN = appliedFalse.georef.originN + tic0.y / 1000;
      expect(Math.abs(tic0TurefE - shiftedSurvey[0]!.e) * 1000).toBeLessThanOrEqual(1);
      expect(Math.abs(tic0TurefN - shiftedSurvey[0]!.n) * 1000).toBeLessThanOrEqual(1);

      // 2) transformExistingGeometry: true -> yeni köken kullanılır ve poligonlar Helmert ile dönüştürülür
      const appliedTrue = applyHelmertWizardToProject(refProject, wiz, {
        transformExistingGeometry: true,
      });
      expect(appliedTrue.georef.originE).toBe(wiz.georef.originE);
      expect(appliedTrue.georef.originN).toBe(wiz.georef.originN);
    });

    it('R2: iki ayrı TUREF DXF ardışık iki kata aktarıldığında (farklı min E/N kutuları olsa bile) ilk katın TUREF koordinatları kaymaz', () => {
      const gb = refProject.buildings[0]!;
      const st0 = gb.storeys[0]!;
      const st1 = gb.storeys[1]!;

      // Boş proje oluştur
      let proj: DesignProject = {
        ...structuredClone(refProject),
        georef: {
          epsg: refProject.georef.epsg,
          originE: 500000,
          originN: 4000000,
          zeroElevationOrthometric: st0.zBottom,
        },
        buildings: [
          {
            ...structuredClone(gb),
            storeys: gb.storeys.map((s) => ({ ...structuredClone(s), outline: [] })),
            sectionParts: [],
            parts: [],
            openings: [],
            balconies: [],
            tic: [],
          },
        ],
      };

      // 1. Kat_Z DXF'ini içe aktar (targetGeoref vermeden)
      const dxf0 = exportDesignStoreyToDxf(refProject, st0.id, { unit: 'm' });
      const parsed0 = parseDxfText(dxf0);
      const geo0 = georeferenceDxfDocument(parsed0);
      const map0: DxfLayerMappingTable = {};
      for (const l of parsed0.layers) {
        (map0 as Record<string, ReturnType<typeof suggestRoleForDxfLayerName>>)[l] =
          suggestRoleForDxfLayerName(l);
      }
      proj = importDxfIntoDesignStorey(proj, geo0, st0.id, map0).project;

      const zVertBefore = proj.buildings[0]!.storeys[0]!.outline[0]!.outer[0]!;
      const zTurefEBefore = proj.georef.originE + zVertBefore.x / 1000;
      const zTurefNBefore = proj.georef.originN + zVertBefore.y / 1000;

      // 2. İkinci kat için min E/N değeri +15 m / +22 m kaydırılmış ikinci bir TUREF DXF oluştur ve targetGeoref vermeden içe aktar
      const shiftedEast = refProject.georef.originE + 15.25;
      const shiftedNorth = refProject.georef.originN + 22.75;
      const dxf1 = [
        '0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '6', '0', 'ENDSEC',
        '0', 'SECTION', '2', 'ENTITIES',
        '0', 'LWPOLYLINE', '8', 'KAT_SINIRI', '70', '1',
        '10', shiftedEast.toFixed(3), '20', shiftedNorth.toFixed(3),
        '10', (shiftedEast + 8).toFixed(3), '20', shiftedNorth.toFixed(3),
        '10', (shiftedEast + 8).toFixed(3), '20', (shiftedNorth + 6).toFixed(3),
        '10', shiftedEast.toFixed(3), '20', (shiftedNorth + 6).toFixed(3),
        '0', 'ENDSEC', '0', 'EOF',
      ].join('\n');

      const parsed1 = parseDxfText(dxf1);
      const geo1 = georeferenceDxfDocument(parsed1); // targetGeoref özellikle verilmedi!
      expect(geo1.georef.originE).not.toBe(proj.georef.originE);

      proj = importDxfIntoDesignStorey(proj, geo1, st1.id, {
        KAT_SINIRI: { role: 'kat_siniri' },
      }).project;

      // Kat_Z TUREF koordinatları ±1 mm içinde sabit kalmalı
      const zVertAfter = proj.buildings[0]!.storeys[0]!.outline[0]!.outer[0]!;
      const zTurefEAfter = proj.georef.originE + zVertAfter.x / 1000;
      const zTurefNAfter = proj.georef.originN + zVertAfter.y / 1000;
      expect(Math.abs(zTurefEAfter - zTurefEBefore) * 1000).toBeLessThanOrEqual(1);
      expect(Math.abs(zTurefNAfter - zTurefNBefore) * 1000).toBeLessThanOrEqual(1);

      // Kat_1 köşesi de kendi gerçek TUREF koordinatında (shiftedEast, shiftedNorth) olmalı
      const k1Vert = proj.buildings[0]!.storeys[1]!.outline[0]!.outer[0]!;
      const k1TurefE = proj.georef.originE + k1Vert.x / 1000;
      const k1TurefN = proj.georef.originN + k1Vert.y / 1000;
      expect(Math.abs(k1TurefE - shiftedEast) * 1000).toBeLessThanOrEqual(1);
      expect(Math.abs(k1TurefN - shiftedNorth) * 1000).toBeLessThanOrEqual(1);
    });

    it('R3, R4, R5, R8: numarasız BB katmanı için M7-DXF-SEC-GUESS uyarısı verir, Z=0 ve kotsuz TIC için M7-DXF-Z0 uyarısı verir, balkonu en yakın BB parçasına bağlar ve pencere denizliğini K46 (900 mm) ile hesaplar', () => {
      const gb = refProject.buildings[0]!;
      const st0 = gb.storeys[0]!;

      // Numarasız BB katmanı ("BAGIMSIZ_BOLUM"), iki ayrı BB (BB_1 solda x:0..5, BB_2 sağda x:5..10),
      // sağdaki BB_2'ye bitişik balkon (x:10..11.5, y:1..4), Z=0 TIC ve standart PENCERE içeren DXF
      const e0 = refProject.georef.originE;
      const n0 = refProject.georef.originN;
      const dxf = [
        '0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '6', '0', 'ENDSEC',
        '0', 'SECTION', '2', 'ENTITIES',
        // Kat sınırı (0..10 x 0..8)
        '0', 'LWPOLYLINE', '8', 'KAT_SINIRI', '70', '1',
        '10', String(e0), '20', String(n0),
        '10', String(e0 + 10), '20', String(n0),
        '10', String(e0 + 10), '20', String(n0 + 8),
        '10', String(e0), '20', String(n0 + 8),
        // BB_1 solda (0..5 x 0..8)
        '0', 'LWPOLYLINE', '8', 'BB_1', '70', '1',
        '10', String(e0), '20', String(n0),
        '10', String(e0 + 5), '20', String(n0),
        '10', String(e0 + 5), '20', String(n0 + 8),
        '10', String(e0), '20', String(n0 + 8),
        // BB_2 sağda (5..10 x 0..8)
        '0', 'LWPOLYLINE', '8', 'BB_2', '70', '1',
        '10', String(e0 + 5), '20', String(n0),
        '10', String(e0 + 10), '20', String(n0),
        '10', String(e0 + 10), '20', String(n0 + 8),
        '10', String(e0 + 5), '20', String(n0 + 8),
        // Eşleşmeyen numarasız BB katmanı
        '0', 'LWPOLYLINE', '8', 'BAGIMSIZ_GENEL', '70', '1',
        '10', String(e0 + 1), '20', String(n0 + 1),
        '10', String(e0 + 4), '20', String(n0 + 1),
        '10', String(e0 + 4), '20', String(n0 + 4),
        '10', String(e0 + 1), '20', String(n0 + 4),
        // Sağdaki BB_2'ye bitişik balkon (x:10..11.5, y:1..4)
        '0', 'LWPOLYLINE', '8', 'BALKON', '70', '1',
        '10', String(e0 + 10), '20', String(n0 + 1),
        '10', String(e0 + 11.5), '20', String(n0 + 1),
        '10', String(e0 + 11.5), '20', String(n0 + 4),
        '10', String(e0 + 10), '20', String(n0 + 4),
        // Pencere (denizliği katman adında belirtilmemiş -> K46 ile 2900 - 200 - 500 - 1300 = 900 mm olmalı)
        '0', 'LINE', '8', 'PENCERE',
        '10', String(e0 + 6), '20', String(n0),
        '11', String(e0 + 7.5), '21', String(n0),
        // Z=0 olan TIC katmanı
        '0', 'LWPOLYLINE', '8', 'TIC', '70', '1',
        '10', String(e0), '20', String(n0),
        '10', String(e0 + 10), '20', String(n0),
        '10', String(e0 + 10), '20', String(n0 + 8),
        '0', 'ENDSEC', '0', 'EOF',
      ].join('\n');

      const doc = parseDxfText(dxf);
      // R4: zeroElevationOrthometricMm verilmeden georeference çağrılır -> zeroElevationOrthometric = 0 olmalı (1_000_000 değil!)
      const geo = georeferenceDxfDocument(doc);
      expect(geo.georef.zeroElevationOrthometric).toBe(0);

      const emptyProj: DesignProject = {
        ...structuredClone(refProject),
        georef: { epsg: 5254, originE: e0, originN: n0, zeroElevationOrthometric: 0 },
        buildings: [
          {
            ...structuredClone(gb),
            storeys: gb.storeys.map((s) => ({ ...structuredClone(s), outline: [] })),
            sectionParts: [],
            parts: [],
            openings: [],
            balconies: [],
            tic: [],
          },
        ],
      };

      const res = importDxfIntoDesignStorey(emptyProj, geo, st0.id, {
        KAT_SINIRI: { role: 'kat_siniri' },
        BB_1: suggestRoleForDxfLayerName('BB_1'),
        BB_2: suggestRoleForDxfLayerName('BB_2'),
        BAGIMSIZ_GENEL: { role: 'bb' }, // sectionIdOrNumber yok -> M7-DXF-SEC-GUESS üretmeli
        BALKON: { role: 'balkon' },
        PENCERE: suggestRoleForDxfLayerName('PENCERE'),
        TIC: { role: 'tic' },
      });

      // R3: BAGIMSIZ_GENEL rastgele BB'ye atanmamalı, M7-DXF-SEC-GUESS uyarısı üretilmeli
      expect(res.importedSectionParts).toBe(2);
      expect(res.issues.some((i) => i.code === 'M7-DXF-SEC-GUESS')).toBe(true);

      // R4: Z=0 ve zeroElevationOrthometric=0 iken M7-DXF-Z0 uyarısı üretilmeli
      expect(res.importedTicPoints).toBe(0);
      expect(res.issues.some((i) => i.code === 'M7-DXF-Z0')).toBe(true);

      // R5: Sağdaki balkon (x=10..11.5) soldaki BB_1'e değil sağdaki BB_2'nin SectionPart'ına bağlanmalı
      const sec2 = emptyProj.buildings[0]!.sections.find((s) => s.number === '2')!;
      const sp2 = res.project.buildings[0]!.sectionParts.find((sp) => sp.sectionId === sec2.id)!;
      const importedBalcony = res.project.buildings[0]!.balconies![0]!;
      expect(importedBalcony.sectionPartId).toBe(sp2.id);

      // R8: Ornek6 Kat_Z (height=2900, slabThickness=200) için K46 varsayılan pencere denizliği 900 mm olmalı
      const importedWin = res.project.buildings[0]!.openings![0]!;
      expect(importedWin.sill).toBe(900);
      expect(importedWin.height).toBe(1300);
    });
  });
});

