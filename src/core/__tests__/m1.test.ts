// K06, K09, K12, K55, K60, K84, K89, V-211, D-23.4, KONTROL-M1 (G1–G8)
import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  OfficialCodelistName,
} from '../codelists/index.ts';
import {
  hydrateModelPolygonVerticesFloat64,
  packModelPolygonVerticesFloat64,
  parseCityGmlModel,
} from '../gml/gmlReader.ts';
import {
  triangulatePolygonWithHoles3D,
  turefToLocalThree,
} from '../gml/triangulate3d.ts';
import { computeCanonicalModelHash } from '../hash/canonical.ts';

// K91: Sıfır çalışma anı ağ isteği kilidi
beforeAll(() => {
  globalThis.fetch = (() => {
    throw new Error('K91 İHLALİ: Çalışma ve test anında ağ isteği (fetch) kesinlikle yasaktır!');
  }) as unknown as typeof fetch;
});

describe('M1 Adım 1 — CityGML 2.0 GML Okuyucu (gmlReader.ts) ve ImportedModel Hiyerarşisi (K06, K09, K12, K55, K60, K84, K89, V-211)', () => {
  let ornek6Xml = '';
  const xmlMap = {} as Record<OfficialCodelistName, string>;

  beforeAll(() => {
    ornek6Xml = fs.readFileSync(
      path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'),
      'utf-8'
    );
    for (const name of OFFICIAL_CODELIST_NAMES) {
      xmlMap[name] = fs.readFileSync(
        path.resolve(process.cwd(), 'resources', 'codelists', `${name}.xml`),
        'utf-8'
      );
    }
  });

  it('fixtures/ornek6.gml dosyasını eksiksiz ImportedModel ağacına ayrıştırır, xlink:href referanslarını çözer ve kod listesi açıklamalarını bağlar', () => {
    const registry = createCodelistRegistryFromXmlMap(xmlMap);
    const model = parseCityGmlModel(ornek6Xml, 'Ornek6-M-70125626-A.gml', registry);

    expect(model.fileName).toBe('Ornek6-M-70125626-A.gml');
    expect(model.srsName).toBe('EPSG:5254');
    expect(model.buildingGmlId).toBe('MB_b9e3888a-63b3-4f4c-9d75-58af494f6733');
    expect(model.constructionID).toBe('70125626-A');
    expect(model.objects.length).toBe(108);
    expect(model.detectedStoreyForm).toBe('A');
    expect(model.detectedDoorBottomOffsetMm).toBe(10);
    expect(model.detectedProducerProfile).toBe('A10');

    // K_ kat nesneleri ve BB_ bağımsız bölümlerin kat eşleşmesi
    const storeys = model.objects.filter((o) => o.prefix === 'K_');
    const bbs = model.objects.filter((o) => o.prefix === 'BB_');
    expect(storeys.length).toBe(2);
    expect(bbs.length).toBe(2);
    for (const bbObj of bbs) {
      expect(bbObj.storeyGmlId).not.toBeNull();
      expect(bbObj.allPolygonIds.length).toBeGreaterThan(0);
    }

    // D-23.6 #2: BBK_ seçildiğinde partUsage ve kod listesi Türkçe karşılığı görünür olmalıdır
    const bbkObjects = model.objects.filter((o) => o.prefix === 'BBK_');
    expect(bbkObjects.length).toBe(16);
    for (const bbk of bbkObjects) {
      expect(bbk.storeyGmlId).not.toBeNull();
      expect(bbk.referencedBbGmlId).not.toBeNull();
      const partUsageAttr = bbk.attributes.find((a) => a.name === 'partUsage');
      expect(partUsageAttr).toBeDefined();
      expect(partUsageAttr?.codelistDescription).toBeTruthy();
    }

    // V-211: Ornek6 içinde çözülemeyen xlink:href bulunmamalıdır (0 HATA, 0 UYARI)
    const v211Errors = model.readerIssues.filter((i) => i.ruleId === 'V-211');
    expect(v211Errors.length).toBe(0);
    expect(model.readerIssues.filter((i) => i.severity === 'H').length).toBe(0);
    expect(model.readerIssues.filter((i) => i.severity === 'U').length).toBe(0);

    // G5: Ornek6 içindeki maksIdentityNumber = "\t5129820196" baş/son boşluğu V-214 BİLGİ (B) olarak raporlanır
    const v214Issues = model.readerIssues.filter((i) => i.ruleId === 'V-214');
    expect(v214Issues.length).toBe(1);
    expect(v214Issues[0]?.severity).toBe('B');

    // K06: Yerel sahne merkezi (P_origin) TUREF zarf merkezine ayarlanmıştır
    expect(model.originTuref.e).toBeGreaterThan(532500);
    expect(model.originTuref.n).toBeGreaterThan(4288300);
    expect(model.originTuref.z).toBeGreaterThan(1090);

    // K89: Kanonik model özeti 64 karakterlik deterministik SHA-256 üretir
    expect(model.canonicalHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('V-211: Kırık xlink:href="#OlmayanPoligon_1" referansını yakalar ve V-211 HATA (H) üretir', () => {
    const registry = createCodelistRegistryFromXmlMap(xmlMap);
    const brokenXml = `<?xml version="1.0" encoding="utf-8"?>
<CityModel xmlns:gml="http://www.opengis.net/gml" xmlns:bldg="http://www.opengis.net/citygml/building/2.0" xmlns:grp="http://www.opengis.net/citygml/cityobjectgroup/2.0" xmlns:gen="http://www.opengis.net/citygml/generics/2.0" xmlns:xlink="http://www.w3.org/1999/xlink">
  <gml:boundedBy><gml:Envelope srsName="EPSG:5254" srsDimension="3"><gml:lowerCorner>532560 4288390 1095</gml:lowerCorner><gml:upperCorner>532580 4288410 1103</gml:upperCorner></gml:Envelope></gml:boundedBy>
  <core:cityObjectMember xmlns:core="http://www.opengis.net/citygml/2.0">
    <bldg:Building gml:id="MB_00000000-0000-5000-8000-000000000001">
      <gen:stringAttribute name="constructionID"><gen:value>70125626-A</gen:value></gen:stringAttribute>
    </bldg:Building>
  </core:cityObjectMember>
  <core:cityObjectMember xmlns:core="http://www.opengis.net/citygml/2.0">
    <grp:CityObjectGroup gml:id="BB_00000000-0000-5000-8000-000000000002">
      <gen:stringAttribute name="independentSectionNumber"><gen:value>1</gen:value></gen:stringAttribute>
      <gen:stringAttribute name="propertyLot"><gen:value>1/1</gen:value></gen:stringAttribute>
      <grp:geometry>
        <gml:MultiSurface>
          <gml:surfaceMember xlink:href="#OlmayanPoligon_1"/>
        </gml:MultiSurface>
      </grp:geometry>
    </grp:CityObjectGroup>
  </core:cityObjectMember>
</CityModel>`;

    const model = parseCityGmlModel(brokenXml, 'KirikXlinkTest.gml', registry);
    const v211 = model.readerIssues.find((i) => i.ruleId === 'V-211');
    expect(v211).toBeDefined();
    expect(v211?.severity).toBe('H');
    expect(v211?.targetGmlId).toBe('BB_00000000-0000-5000-8000-000000000002');
  });

  it('KONTROL-M1 G1: Float64Array transferable poligon köşe paketleme ve geri yükleme (packModelPolygonVerticesFloat64 / hydrateModelPolygonVerticesFloat64) sıfır kayıpla çalışır', () => {
    const registry = createCodelistRegistryFromXmlMap(xmlMap);
    const model = parseCityGmlModel(ornek6Xml, 'Ornek6-M-70125626-A.gml', registry);
    const originalFirstPolyCoords = JSON.stringify(model.polygons[0]?.exteriorRing.vertices);

    const { strippedModel, packedBuffer } = packModelPolygonVerticesFloat64(model);
    expect(packedBuffer.length).toBeGreaterThan(1000);
    // Paketleme sonrasında strippedModel içindeki vertices dizileri boşaltılmıştır (kopya maliyetini önlemek için)
    expect(strippedModel.polygons[0]?.exteriorRing.vertices.length).toBe(0);

    const hydrated = hydrateModelPolygonVerticesFloat64(strippedModel, packedBuffer);
    expect(JSON.stringify(hydrated.polygons[0]?.exteriorRing.vertices)).toBe(
      originalFirstPolyCoords
    );
  });

  it('KONTROL-M1 G2, G3, G4, G8: Sincan (B + 10 mm -> B10 profil dışı), Amasya (ofset null -> V-215 B + eski rejim propertyLot yok -> V-198 B ve "—") ve farklı XML ad alanı öneklerini doğru ayrıştırır', () => {
    const registry = createCodelistRegistryFromXmlMap(xmlMap);

    // 1. Amasya senaryosu: Kat biçimi A, kapı yok (offset = null), propertyLot yok (eski rejim), farklı XML önekleri (c:, b:, g:, gr:, gn:, xl:)
    const amasyaLikeXml = `<?xml version="1.0" encoding="utf-8"?>
<c:CityModel xmlns:c="http://www.opengis.net/citygml/2.0" xmlns:g="http://www.opengis.net/gml" xmlns:b="http://www.opengis.net/citygml/building/2.0" xmlns:gr="http://www.opengis.net/citygml/cityobjectgroup/2.0" xmlns:gn="http://www.opengis.net/citygml/generics/2.0" xmlns:xl="http://www.w3.org/1999/xlink">
  <g:boundedBy><g:Envelope srsName="EPSG:5254" srsDimension="3"><g:lowerCorner>500000 4000000 100</g:lowerCorner><g:upperCorner>500010 4000010 105</g:upperCorner></g:Envelope></g:boundedBy>
  <c:cityObjectMember>
    <b:Building g:id="MB_11111111-1111-4111-8111-111111111111">
      <gn:stringAttribute name="constructionID"><gn:value>17273333-F</gn:value></gn:stringAttribute>
    </b:Building>
  </c:cityObjectMember>
  <c:cityObjectMember>
    <gr:CityObjectGroup g:id="K_11111111-1111-4111-8111-111111111112">
      <gn:stringAttribute name="storeyNumber"><gn:value>0</gn:value></gn:stringAttribute>
      <gr:groupMember xl:href="#BB_11111111-1111-4111-8111-111111111113"/>
    </gr:CityObjectGroup>
  </c:cityObjectMember>
  <c:cityObjectMember>
    <gr:CityObjectGroup g:id="BB_11111111-1111-4111-8111-111111111113">
      <gn:stringAttribute name="independentSectionNumber"><gn:value>1</gn:value></gn:stringAttribute>
      <gr:geometry>
        <g:MultiSurface>
          <g:surfaceMember>
            <g:Polygon g:id="Polygon_Floor_1">
              <g:exterior>
                <g:LinearRing g:id="Ring_Floor_1">
                  <g:posList srsDimension="3">500000 4000000 100 500005 4000000 100 500005 4000005 100 500000 4000005 100 500000 4000000 100</g:posList>
                </g:LinearRing>
              </g:exterior>
            </g:Polygon>
          </g:surfaceMember>
        </g:MultiSurface>
      </gr:geometry>
    </gr:CityObjectGroup>
  </c:cityObjectMember>
</c:CityModel>`;

    const amasyaModel = parseCityGmlModel(amasyaLikeXml, 'Amasya-RejimE.gml', registry);
    expect(amasyaModel.detectedStoreyForm).toBe('A');
    expect(amasyaModel.detectedDoorBottomOffsetMm).toBeNull();
    expect(amasyaModel.detectedProducerProfile).toBe('biçim A, ofset bilinmiyor');
    // G3: Kapı alt ofseti ölçülemedi -> V-215 BİLGİ
    const v215Null = amasyaModel.readerIssues.find((i) => i.ruleId === 'V-215');
    expect(v215Null).toBeDefined();
    expect(v215Null?.severity).toBe('B');
    expect(v215Null?.message).toContain('Kapı alt ofseti ölçülemedi');
    // G4: propertyLot yok -> "—" ve V-198 BİLGİ
    expect(amasyaModel.landShareAnalysis.hasPropertyLotData).toBe(false);
    expect(amasyaModel.landShareAnalysis.formattedTotalUnreduced).toBe('—');
    const v198Info = amasyaModel.landShareAnalysis.issues.find((i) => i.ruleId === 'V-198');
    expect(v198Info).toBeDefined();
    expect(v198Info?.severity).toBe('B');
    expect(v198Info?.message).toContain('Arsa payı bilgisi yok (eski rejim dosyası)');

    // 2. Sincan senaryosu: Kat biçimi B (groupMember role="kat elemani" inline Room + Door, ofset 10 mm) -> B10 profil dışı birleşim
    const sincanLikeXml = `<?xml version="1.0" encoding="utf-8"?>
<core:CityModel xmlns:core="http://www.opengis.net/citygml/2.0" xmlns:gml="http://www.opengis.net/gml" xmlns:bldg="http://www.opengis.net/citygml/building/2.0" xmlns:grp="http://www.opengis.net/citygml/cityobjectgroup/2.0" xmlns:gen="http://www.opengis.net/citygml/generics/2.0" xmlns:xlink="http://www.w3.org/1999/xlink">
  <gml:boundedBy><gml:Envelope srsName="EPSG:5254" srsDimension="3"><gml:lowerCorner>500000 4000000 100</gml:lowerCorner><gml:upperCorner>500010 4000010 105</gml:upperCorner></gml:Envelope></gml:boundedBy>
  <core:cityObjectMember>
    <bldg:Building gml:id="MB_22222222-2222-4222-8222-222222222221">
      <gen:stringAttribute name="constructionID"><gen:value>SINCAN-1</gen:value></gen:stringAttribute>
    </bldg:Building>
  </core:cityObjectMember>
  <core:cityObjectMember>
    <grp:CityObjectGroup gml:id="K_22222222-2222-4222-8222-222222222222">
      <gen:stringAttribute name="storeyNumber"><gen:value>0</gen:value></gen:stringAttribute>
      <grp:groupMember role="kat elemani">
        <bldg:Room gml:id="BBK_22222222-2222-4222-8222-222222222223">
          <gen:intAttribute name="partUsage"><gen:value>1</gen:value></gen:intAttribute>
          <bldg:lod4Solid>
            <gml:Solid>
              <gml:exterior>
                <gml:CompositeSurface>
                  <gml:surfaceMember>
                    <gml:Polygon gml:id="Poly_Floor_B">
                      <gml:exterior>
                        <gml:LinearRing gml:id="Ring_Floor_B">
                          <gml:posList>500000 4000000 100.000 500004 4000000 100.000 500004 4000004 100.000 500000 4000004 100.000 500000 4000000 100.000</gml:posList>
                        </gml:LinearRing>
                      </gml:exterior>
                    </gml:Polygon>
                  </gml:surfaceMember>
                </gml:CompositeSurface>
              </gml:exterior>
            </gml:Solid>
          </bldg:lod4Solid>
          <bldg:boundedBy>
            <bldg:WallSurface>
              <bldg:opening>
                <bldg:Door gml:id="KAPI_22222222-2222-4222-8222-222222222224">
                  <bldg:lod4MultiSurface>
                    <gml:MultiSurface>
                      <gml:surfaceMember>
                        <gml:Polygon gml:id="Poly_Door_B">
                          <gml:exterior>
                            <gml:LinearRing gml:id="DoorLinearRing_B">
                              <gml:posList>500001 4000000 100.010 500002 4000000 100.010 500002 4000000 102.110 500001 4000000 102.110 500001 4000000 100.010</gml:posList>
                            </gml:LinearRing>
                          </gml:exterior>
                        </gml:Polygon>
                      </gml:surfaceMember>
                    </gml:MultiSurface>
                  </bldg:lod4MultiSurface>
                </bldg:Door>
              </bldg:opening>
            </bldg:WallSurface>
          </bldg:boundedBy>
        </bldg:Room>
      </grp:groupMember>
    </grp:CityObjectGroup>
  </core:cityObjectMember>
</core:CityModel>`;

    const sincanModel = parseCityGmlModel(sincanLikeXml, 'Sincan-B10.gml', registry);
    expect(sincanModel.detectedStoreyForm).toBe('B');
    expect(sincanModel.detectedDoorBottomOffsetMm).toBe(10);
    expect(sincanModel.detectedProducerProfile).toBe('B10 (biçim B, ofset 10 mm)');
    const v215NonStandard = sincanModel.readerIssues.find((i) => i.ruleId === 'V-215');
    expect(v215NonStandard).toBeDefined();
    expect(v215NonStandard?.severity).toBe('B');
    expect(v215NonStandard?.message).toContain('Profil dışı birleşim: kat biçimi B, kapı alt ofseti 10 mm');
  });
});

describe('M1 Adım 2 — 3B Düzlemsel Poligon + İç Delik (DoorLinearRing_ / WindowLinearRing_) Üçgenleme (triangulate3d.ts)', () => {
  it('Kapı ve pencere delikli dikey duvar poligonunu yerel koordinatlarda hatasız üçgenler', () => {
    const origin = { e: 532570, n: 4288400, z: 1096 };
    const exteriorWall = [
      { e: 532570, n: 4288400, z: 1096.0 },
      { e: 532576, n: 4288400, z: 1096.0 },
      { e: 532576, n: 4288400, z: 1098.8 },
      { e: 532570, n: 4288400, z: 1098.8 },
      { e: 532570, n: 4288400, z: 1096.0 },
    ];
    // K45a: +10 mm (0.010 m) kapı alt ofseti
    const doorHole = [
      { e: 532571, n: 4288400, z: 1096.01 },
      { e: 532571, n: 4288400, z: 1098.11 },
      { e: 532572, n: 4288400, z: 1098.11 },
      { e: 532572, n: 4288400, z: 1096.01 },
      { e: 532571, n: 4288400, z: 1096.01 },
    ];
    const windowHole = [
      { e: 532573.5, n: 4288400, z: 1096.9 },
      { e: 532573.5, n: 4288400, z: 1098.1 },
      { e: 532575.0, n: 4288400, z: 1098.1 },
      { e: 532575.0, n: 4288400, z: 1096.9 },
      { e: 532573.5, n: 4288400, z: 1096.9 },
    ];

    const mesh = triangulatePolygonWithHoles3D(
      exteriorWall,
      [doorHole, windowHole],
      origin
    );

    expect(mesh.positions.length).toBeGreaterThan(0);
    expect(mesh.indices.length).toBeGreaterThan(0);
    expect(mesh.indices.length % 3).toBe(0);
    expect(mesh.boundaryLinePositions.length).toBeGreaterThan(0);
    expect(mesh.holeLinePositions.length).toBeGreaterThan(0);

    // K06: turefToLocalThree dönüşümü ([E - E0, Z - Z0, -(N - N0)])
    const localPt = turefToLocalThree({ e: 532576, n: 4288405, z: 1098.8 }, origin);
    expect(localPt[0]).toBeCloseTo(6, 6);
    expect(localPt[1]).toBeCloseTo(2.8, 6);
    expect(localPt[2]).toBeCloseTo(-5, 6);
  });

  it('fixtures/ornek6.gml içindeki tüm iç delikli (DoorLinearRing_ / WindowLinearRing_) duvar poligonlarını sıfır kayıpla üçgenler', () => {
    const ornek6Xml = fs.readFileSync(
      path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'),
      'utf-8'
    );
    const xmlMap = {} as Record<OfficialCodelistName, string>;
    for (const name of OFFICIAL_CODELIST_NAMES) {
      xmlMap[name] = fs.readFileSync(
        path.resolve(process.cwd(), 'resources', 'codelists', `${name}.xml`),
        'utf-8'
      );
    }
    const registry = createCodelistRegistryFromXmlMap(xmlMap);
    const model = parseCityGmlModel(ornek6Xml, 'Ornek6-M-70125626-A.gml', registry);

    const polygonsWithHoles = model.polygons.filter(
      (p) => p.interiorRings.length > 0
    );
    expect(polygonsWithHoles.length).toBeGreaterThan(20);

    for (const poly of polygonsWithHoles) {
      const tri = triangulatePolygonWithHoles3D(
        poly.exteriorRing.vertices,
        poly.interiorRings.map((r) => r.vertices),
        model.originTuref
      );
      expect(
        tri.indices.length,
        `${poly.gmlId} (${poly.interiorRings.length} delikli) üçgenlenemedi`
      ).toBeGreaterThan(0);
    }
  });
});

describe('M1 Adım 3 — KARAR D-23.4: Kalıp (F5–F8) ve Panel Boyutu Değişiminin K89 CanonicalHash Üzerinde Etkisizliği', () => {
  it('D-23.4 / K89: F5 (Standart), F6 (Yan Yana), F7 (Çizim), F8 (Denetim) ve <1366px sekme modları CanonicalModelHash değerini asla değiştirmez', () => {
    const ornek6Xml = fs.readFileSync(
      path.resolve(process.cwd(), 'fixtures', 'ornek6.gml'),
      'utf-8'
    );
    const xmlMap = {} as Record<OfficialCodelistName, string>;
    for (const name of OFFICIAL_CODELIST_NAMES) {
      xmlMap[name] = fs.readFileSync(
        path.resolve(process.cwd(), 'resources', 'codelists', `${name}.xml`),
        'utf-8'
      );
    }
    const registry = createCodelistRegistryFromXmlMap(xmlMap);
    const model = parseCityGmlModel(ornek6Xml, 'Ornek6-M-70125626-A.gml', registry);

    const canonicalInput = {
      schemaVersion: '3.5.5',
      producerProfile: model.detectedProducerProfile,
      codelistsCombinedSha256: 'tkgm-14-codelists-v3.5.5',
      buildingAttributes: {
        constructionID: model.constructionID,
      },
      coordinatesMm: [532568580, 4288398700, 1095900],
      objectAttributes: model.objects.map((o) => ({
        gmlId: o.gmlId,
        attributes: o.attributesMap,
      })),
    };

    const hashF5 = computeCanonicalModelHash(canonicalInput, {
      preset: 'F5_STANDART',
      panelSizes: { tree: 15, cad2d: 45, scene3d: 40, bottom: 26 },
      selectedGmlId: model.buildingGmlId,
      explosionFactor: 0,
    });

    const hashF6 = computeCanonicalModelHash(canonicalInput, {
      preset: 'F6_YAN_YANA',
      panelSizes: { left2d: 50, rightTop3d: 55, rightBottom: 45 },
      selectedGmlId: model.objects[1]?.gmlId ?? null,
      explosionFactor: 2.5,
    });

    const hashF7 = computeCanonicalModelHash(canonicalInput, {
      preset: 'F7_CIZIM',
      panelSizes: { tree: 0, cad2d: 72, scene3d: 28, bottom: 22 },
      selectedGmlId: null,
      explosionFactor: 0,
    });

    const hashF8 = computeCanonicalModelHash(canonicalInput, {
      preset: 'F8_DENETIM',
      panelSizes: { tree: 18, cad2d: 0, scene3d: 82, bottom: 38 },
      selectedGmlId: model.objects[2]?.gmlId ?? null,
      explosionFactor: 4.0,
      narrowViewportTabs: true,
    });

    expect(hashF5).toBe(hashF6);
    expect(hashF6).toBe(hashF7);
    expect(hashF7).toBe(hashF8);
  });
});
