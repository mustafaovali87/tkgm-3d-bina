import { describe, expect, it } from 'vitest';
import {
  PROJECT_TEMPLATES_CATALOG,
  loadProjectTemplate,
  createApartmanTemplate,
  createVillaTemplate,
  createDubleksTemplate,
  createTicariZeminTemplate,
  type TemplateTypeId,
} from '../templates/projectTemplates.ts';
import { generateBrep } from '../brep/generate.ts';
import { writeCityGml } from '../gml/cityGmlWriter.ts';
import { parseCityGmlModel } from '../gml/gmlReader.ts';
import { validateCityGml } from '../validation/index.ts';
import { getOfflineCodelistRegistry } from '../../data/offlineFixtures.ts';
import { DualWindowCoordinator, type DualWindowMessage } from '../../platform/dualWindowProtocol.ts';
import { InMemoryPlatformAdapter } from '../../platform/PlatformAdapter.ts';

describe('M10 — Mimari Proje Şablonları & Hazır Modeller (F10)', () => {
  it('Şablon kataloğu 4 standart mimari şablon içerir', () => {
    expect(PROJECT_TEMPLATES_CATALOG.length).toBe(4);
    const ids = PROJECT_TEMPLATES_CATALOG.map((t) => t.id);
    expect(ids).toContain('apartman');
    expect(ids).toContain('villa');
    expect(ids).toContain('dubleks');
    expect(ids).toContain('ticariZemin');
  });

  it('Apartman şablonu 4 kat ve 8 bağımsız bölüm içerir', () => {
    const proj = createApartmanTemplate();
    expect(proj.buildings.length).toBe(1);
    const bldg = proj.buildings[0];
    expect(bldg.storeys.length).toBe(4);
    expect(bldg.sections.length).toBe(8);
    expect(proj.parcel.takbisPropertyIdentityNumber).toBeGreaterThan(0);
    expect(proj.georef.epsg).toBe(5254);
  });

  it('Villa şablonu beşik çatılı 2 katlı müstakil villadır', () => {
    const proj = createVillaTemplate();
    const bldg = proj.buildings[0];
    expect(bldg.storeys.length).toBe(2);
    expect(bldg.sections.length).toBe(1);
    expect(bldg.sections[0].registeredQuality).toBe('VİLLA');
    expect(bldg.roof?.mode).toBe('gable');
  });

  it('Dubleks şablonu çatı piyesli dubleks daire içerir', () => {
    const proj = createDubleksTemplate();
    const bldg = proj.buildings[0];
    expect(bldg.storeys.length).toBe(2);
    expect(bldg.sections.length).toBe(1);
    expect(bldg.sections[0].registeredQuality).toBe('DUBLEKS MESKEN');
    expect(bldg.sectionParts.length).toBe(2);
  });

  it('Ticari + Konut şablonu zemin dükkan ve üst kat konutları içerir', () => {
    const proj = createTicariZeminTemplate();
    const bldg = proj.buildings[0];
    expect(bldg.storeys.length).toBe(3);
    const qualities = bldg.sections.map((s) => s.registeredQuality);
    expect(qualities).toContain('DÜKKAN');
    expect(qualities).toContain('MESKEN');
  });

  it('loadProjectTemplate bilinmeyen id verildiğinde hata fırlatır', () => {
    expect(() => loadProjectTemplate('bilinmeyen' as unknown as TemplateTypeId)).toThrow();
  });
});

describe('M10 — Şablon B-Rep ve CityGML Üretim Doğrulaması', () => {
  const codelists = getOfflineCodelistRegistry();

  it('Apartman şablonundan B-Rep ve CityGML üretimi hatasız çalışır ve doğrulamadan geçer', () => {
    const proj = loadProjectTemplate('apartman');
    const brep = generateBrep(proj);
    expect(brep.storeys.length).toBeGreaterThan(0);
    expect(brep.rooms.length).toBeGreaterThan(0);

    const { xml: gml } = writeCityGml(proj, brep, codelists);
    expect(gml).toContain('<bldg:Building');
    expect(gml).toContain('posList');

    const model = parseCityGmlModel(gml, 'apartman.gml', codelists);
    expect(model.objects.length).toBeGreaterThan(0);

    const report = validateCityGml(gml, 'apartman.gml', model, codelists);
    const errors = report.findings.filter((f) => f.severity === 'H');
    expect(errors.length).toBe(0);
  });

  it('Villa şablonundan B-Rep ve CityGML üretimi hatasız çalışır', () => {
    const proj = loadProjectTemplate('villa');
    const brep = generateBrep(proj);
    expect(brep.storeys.length).toBeGreaterThan(0);

    const { xml: gml } = writeCityGml(proj, brep, codelists);
    const model = parseCityGmlModel(gml, 'villa.gml', codelists);
    expect(model.objects.length).toBeGreaterThan(0);

    const report = validateCityGml(gml, 'villa.gml', model, codelists);
    const errors = report.findings.filter((f) => f.severity === 'H');
    expect(errors.length).toBe(0);
  });
});

describe('M10 — Çift Monitör İletişim Protokolü (DualWindowCoordinator)', () => {
  it('Coordinator oluşturulur ve mesaj aboneliği çalışır', () => {
    const coordinator = new DualWindowCoordinator('win_test_1');
    const received: DualWindowMessage[] = [];

    const unsubscribe = coordinator.subscribe((msg) => {
      received.push(msg);
    });

    coordinator.selectObject('BBK_101');
    expect(received.length).toBe(1);
    expect(received[0].type).toBe('SELECT_OBJECT');
    if (received[0].type === 'SELECT_OBJECT') {
      expect(received[0].gmlId).toBe('BBK_101');
    }

    coordinator.selectStorey('KAT_01');
    expect(received.length).toBe(2);
    expect(received[1].type).toBe('SELECT_STOREY');

    coordinator.sendSyncState({
      selectedGmlId: 'BBK_101',
      activeStoreyId: 'KAT_01',
      activeTab: '3d',
      sourceFileName: 'test.gml',
      detachedPanel: 'viewer3d',
      timestamp: Date.now(),
    });
    expect(received.length).toBe(3);
    expect(received[2].type).toBe('SYNC_STATE');

    unsubscribe();
    coordinator.selectObject(null);
    expect(received.length).toBe(3);

    coordinator.destroy();
  });
});

describe('M10 — Platform Adaptörü (InMemoryPlatformAdapter)', () => {
  it('Platform adaptörü dosya yazma, okuma ve varlık denetimi işlemlerini çevrimdışı yürütür', async () => {
    const adapter = new InMemoryPlatformAdapter({}, 'web-preview');
    expect(adapter.platformName).toBe('web-preview');

    await adapter.writeTextFile('/projects/ornek.gml', '<bldg:Building/>');
    const exists = await adapter.fileExists('/projects/ornek.gml');
    expect(exists).toBe(true);

    const content = await adapter.readTextFile('/projects/ornek.gml');
    expect(content).toBe('<bldg:Building/>');

    const notExists = await adapter.fileExists('/projects/yok.gml');
    expect(notExists).toBe(false);
  });
});
