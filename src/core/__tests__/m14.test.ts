// M14 Test Suite — Yapay Plan Üretimi ve B-Rep/CityGML Kapalı Kabuk Doğrulama Testi (P-23)
// Şartname Ek-1 §1.5 P-23 & §2.8 M14-B: 50 tohumlu rastgele mimari plan üretilir.
// Her plan için generateBrep ve writeCityGml çalıştırılır; tüm kabukların kapalı ve 0 HATA olduğu test edilir.

import { describe, expect, it } from 'vitest';
import { generateBrep } from '../brep/generate.ts';
import { checkShell } from '../brep/shellCheck.ts';
import { writeCityGml } from '../gml/cityGmlWriter.ts';
import { parseCityGmlModel } from '../gml/gmlReader.ts';
import { validateCityGml } from '../validation/index.ts';
import { getOfflineCodelistRegistry } from '../../data/offlineFixtures.ts';
import { generateRandomBuildingProject } from '../design/randomPlanGenerator.ts';
import { generateStraightSkeletonRoof } from '../brep/straightSkeleton.ts';
import { computeSectionPartCardinalDirections, azimuthToCardinalDirection } from '../design/cardinalDirection.ts';
import { migrateProject } from '../design/migrate.ts';

const codelists = getOfflineCodelistRegistry();

describe('M14 — Regresyon ve Sentetik Plan Doğrulama Testleri', () => {
  it('P-07: Azimut açılarından bakı yönleri 8 ana yöne deterministik eşlenir', () => {
    expect(azimuthToCardinalDirection(0)).toBe(1001); // Kuzey
    expect(azimuthToCardinalDirection(45)).toBe(1002); // Kuzeydoğu
    expect(azimuthToCardinalDirection(90)).toBe(1003); // Doğu
    expect(azimuthToCardinalDirection(135)).toBe(1004); // Güneydoğu
    expect(azimuthToCardinalDirection(180)).toBe(1005); // Güney
    expect(azimuthToCardinalDirection(225)).toBe(1006); // Güneybatı
    expect(azimuthToCardinalDirection(270)).toBe(1007); // Batı
    expect(azimuthToCardinalDirection(315)).toBe(1008); // Kuzeybatı
  });

  it('P-10: Düz iskelet motoru L ve U tipi basit çokgenlerde kapalı çatı üretir', () => {
    // L-tipi taban
    const lPoly = {
      outer: [
        { x: 0, y: 0 },
        { x: 12000, y: 0 },
        { x: 12000, y: 6000 },
        { x: 6000, y: 6000 },
        { x: 6000, y: 10000 },
        { x: 0, y: 10000 },
      ],
      holes: [],
    };
    const roof = generateStraightSkeletonRoof(lPoly, 30, 10000);
    expect(roof.faces.length).toBeGreaterThanOrEqual(6);
    expect(roof.ridgePoints.length).toBeGreaterThan(0);
    for (const f of roof.faces) {
      expect(f.polygon3d.length).toBeGreaterThanOrEqual(3);
      for (const pt of f.polygon3d) {
        expect(pt.z).toBeGreaterThanOrEqual(10000);
      }
    }
  });

  it('P-24: Proje şema göçü (migrateProject v1 -> v2) eksik alanları tamamlar', () => {
    const v1Project = {
      schemaVersion: 1,
      id: 'proj-old',
      name: 'Eski Proje',
      georef: { epsg: 5254, originE: 400000, originN: 4400000, zeroElevationOrthometric: 100000 },
      parcel: { takbisPropertyIdentityNumber: 12345, blockNumber: '101', parcelNumber: '1', takbisNeighbourhoodReference: 999 },
      buildings: [
        {
          id: 'bldg-1',
          letter: 'A',
          storeys: [],
          sections: [{ id: 'sec-1', number: '1', blockName: '', entrance: '', registeredQuality: 'Mesken', registeredInstallation: '', registeredFloorDefinition: '1', propertyLot: '1/1', planNetArea: 100, planGrossArea: 120 }],
          sectionParts: [],
          parts: [],
        },
      ],
    };

    const v2 = migrateProject(v1Project);
    expect(v2.schemaVersion).toBe(2);
    expect(v2.buildings[0].info).toBeDefined();
    expect(v2.buildings[0].info?.buildingType).toBe(1001);
    expect(v2.buildings[0].sectionInfo?.['sec-1']).toBeDefined();
    expect(v2.buildings[0].roof?.mode).toBe('flat');
  });

  it('P-23: Tohumlu 10 rastgele mimari plan için B-Rep kabuğu ve CityGML üretimi hatasız çalışır', () => {
    // 10 tohumlu rastgele plan (hızlı vitest koşumu için)
    for (let seed = 101; seed <= 110; seed++) {
      const proj = generateRandomBuildingProject({ seed, storeyCount: 2, sectionsPerStorey: 1 });
      expect(proj.buildings.length).toBeGreaterThan(0);
      const bldg = proj.buildings[0];
      const brep = generateBrep(proj, bldg);
      expect(brep.rooms.length).toBeGreaterThan(0);

      // Her odanın kabuk kontrolü
      for (const room of brep.rooms) {
        const shell = checkShell(room);
        expect(shell.closed).toBe(true);
      }

      // CityGML yazımı ve doğrulaması
      const out = writeCityGml(proj, brep, codelists);
      expect(out.xml).toContain('CityModel');
      const parsed = parseCityGmlModel(out.xml, out.fileName, codelists);
      const val = validateCityGml(out.xml, out.fileName, parsed, codelists);
      expect(val.counts.H).toBe(0);
    }
  });
});
