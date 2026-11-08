// M6 — Tasarım + B-rep'ten TKGM CityGML 2.0 dosyası yazar (şartname §3 şablonları, §3.1 sayı biçimleri, K70 normalize biçimi).
// Eleman sırası CityGML 2.0 XSD sırasıdır; öznitelik sırası Ornek6'daki gibidir. posList, 3 ondalık, CRLF, BOM yok.
// Saf TS. Malik bilgisi bu yazıcıya hiç girmez (K88-yeni).
import type { BrepBuilding, BrepObject, BrepOpening, BrepPolygon, BrepSurface, Pt3 } from '../brep/types.ts';
import type { CodelistLookupKey, CodelistRegistry } from '../codelists/index.ts';
import type { DesignBuilding, DesignProject, IndependentSection, SectionPart } from '../design/types.ts';
import { DEFAULT_BUILDING_INFO, DEFAULT_SECTION_INFO } from '../design/types.ts';
import { uuidv5 } from '../hash/canonical.ts';

const NS =
  'xmlns="http://www.opengis.net/citygml/2.0" xmlns:core="http://www.opengis.net/citygml/2.0" xmlns:gml="http://www.opengis.net/gml" xmlns:grp="http://www.opengis.net/citygml/cityobjectgroup/2.0" xmlns:gen="http://www.opengis.net/citygml/generics/2.0" xmlns:bldg="http://www.opengis.net/citygml/building/2.0" xmlns:app="http://www.opengis.net/citygml/appearance/2.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/citygml/2.0 http://schemas.opengis.net/citygml/2.0/cityGMLBase.xsd http://www.opengis.net/citygml/appearance/2.0 http://schemas.opengis.net/citygml/appearance/2.0/appearance.xsd http://www.opengis.net/citygml/building/2.0 http://schemas.opengis.net/citygml/building/2.0/building.xsd http://www.opengis.net/citygml/generics/2.0 http://schemas.opengis.net/citygml/generics/2.0/generics.xsd http://www.opengis.net/citygml/cityobjectgroup/2.0 http://schemas.opengis.net/citygml/cityobjectgroup/2.0/cityObjectGroup.xsd"';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Tamsayı mm → "1234.567" (tamsayı aritmetiği; yuvarlama hatası yok, §4.1). */
export function fmtMm(v: number): string {
  const n = Math.round(v);
  const s = n < 0 ? '-' : '';
  const a = Math.abs(n);
  return `${s}${Math.floor(a / 1000)}.${String(a % 1000).padStart(3, '0')}`;
}
const fmt2 = (v: number) => (Math.round(v * 100) / 100).toFixed(2);

export interface GmlWriteResult {
  readonly xml: string;
  readonly fileName: string;
  readonly constructionID: string;
}

class W {
  private readonly lines: string[] = [];
  private depth = 0;
  line(s: string) {
    this.lines.push(`${'\t'.repeat(this.depth)}${s}`);
  }
  open(s: string) {
    this.line(s);
    this.depth++;
  }
  close(s: string) {
    this.depth--;
    this.line(s);
  }
  text() {
    return `${this.lines.join('\r\n')}\r\n`;
  }
}

export function writeCityGml(project: DesignProject, brep: BrepBuilding, codelists: CodelistRegistry, building: DesignBuilding = project.buildings[0]): GmlWriteResult {
  const { originE, originN, epsg } = project.georef;
  const E = (x: number) => fmtMm(originE * 1000 + x);
  const N = (y: number) => fmtMm(originN * 1000 + y);
  const pos = (p: Pt3) => `${E(p.x)} ${N(p.y)} ${fmtMm(p.z)}`;
  const posList = (r: readonly Pt3[]) => [...r, r[0]].map(pos).join(' ');
  const ringId = (prefix: string, polyId: string, role: string) => `${prefix}${uuidv5(`${polyId}::${role}`)}`;
  const desc = (list: CodelistLookupKey, code: number) => codelists.getDescription(list, code) ?? String(code);
  const info = building.info ?? DEFAULT_BUILDING_INFO;
  const cid = `${project.parcel.takbisPropertyIdentityNumber}-${building.letter}`;
  const w = new W();

  const attr = (type: 'string' | 'int' | 'double' | 'date', name: string, value: string | number | null) => {
    const v = value === null || value === '' ? null : String(value);
    // Değeri olmayan sayısal öznitelik yazılmaz (boş int/double geçersiz, V-062; kaynak dosyalar da yazmıyor)
    if (v === null && type !== 'string') return;
    if (v === null) {
      w.open(`<gen:${type}Attribute name="${name}">`);
      w.line('<gen:value/>');
      w.close(`</gen:${type}Attribute>`);
    } else {
      w.open(`<gen:${type}Attribute name="${name}">`);
      w.line(`<gen:value>${esc(v)}</gen:value>`);
      w.close(`</gen:${type}Attribute>`);
    }
  };
  const polygon = (p: BrepPolygon) => {
    const ext = p.kind === 'Door_' ? 'DoorLinearRing_' : p.kind === 'Window_' ? 'WindowLinearRing_' : 'LinearRing_';
    w.open(`<gml:Polygon gml:id="${p.id}">`);
    w.open('<gml:exterior>');
    w.open(`<gml:LinearRing gml:id="${ringId(ext, p.id, 'dis')}">`);
    w.line(`<gml:posList>${posList(p.outer)}</gml:posList>`);
    w.close('</gml:LinearRing>');
    w.close('</gml:exterior>');
    p.holes.forEach((h, i) => {
      const k = p.holeKinds?.[i];
      const pre = k === 'door' ? 'DoorLinearRing_' : k === 'window' ? 'WindowLinearRing_' : 'LinearRing_';
      w.open('<gml:interior>');
      w.open(`<gml:LinearRing gml:id="${ringId(pre, p.id, `ic:${i}`)}">`);
      w.line(`<gml:posList>${posList(h)}</gml:posList>`);
      w.close('</gml:LinearRing>');
      w.close('</gml:interior>');
    });
    w.close('</gml:Polygon>');
  };
  const multiSurface = (ps: readonly BrepPolygon[]) => {
    w.open('<gml:MultiSurface>');
    for (const p of ps) {
      w.open('<gml:surfaceMember>');
      polygon(p);
      w.close('</gml:surfaceMember>');
    }
    w.close('</gml:MultiSurface>');
  };
  const xlinks = (ps: readonly BrepPolygon[]) => {
    w.open('<gml:MultiSurface>');
    for (const p of ps) w.line(`<gml:surfaceMember xlink:href="#${p.id}"/>`);
    w.close('</gml:MultiSurface>');
  };
  const opening = (o: BrepOpening) => {
    const tag = o.prefix === 'KAPI_' ? 'bldg:Door' : 'bldg:Window';
    w.open('<bldg:opening>');
    w.open(`<${tag} gml:id="${o.id}">`);
    w.line(`<gml:name>${esc(desc(o.prefix === 'KAPI_' ? 'doorUsage' : 'windowUsage', o.usage))}</gml:name>`);
    attr('int', o.prefix === 'KAPI_' ? 'doorUsage' : 'windowUsage', o.usage);
    w.open('<bldg:lod4MultiSurface>');
    multiSurface([o.polygon]);
    w.close('</bldg:lod4MultiSurface>');
    w.close(`</${tag}>`);
    w.close('</bldg:opening>');
  };
  const SURFACE_NAME: Record<BrepSurface['tag'], string> = {
    FloorSurface: 'Taban',
    CeilingSurface: 'Tavan',
    WallSurface: 'Duvar',
    InteriorWallSurface: 'İçDuvar',
    RoofSurface: 'Çatı',
    GroundSurface: 'Zemin',
    OuterFloorSurface: 'DışTaban',
    OuterCeilingSurface: 'DışTavan',
  };
  const boundedBy = (s: BrepSurface, lod: 'lod2' | 'lod4') => {
    if (s.polygons.length === 0) return;
    w.open('<bldg:boundedBy>');
    w.open(`<bldg:${s.tag}>`);
    w.line(`<gml:name>${SURFACE_NAME[s.tag]}</gml:name>`);
    w.open(`<bldg:${lod}MultiSurface>`);
    multiSurface(s.polygons);
    w.close(`</bldg:${lod}MultiSurface>`);
    for (const o of s.openings) opening(o);
    w.close(`</bldg:${s.tag}>`);
    w.close('</bldg:boundedBy>');
  };

  // ---- Kimlik eşlemeleri
  const kIdOf = new Map(brep.storeys.map((k) => [k.designId, k.id]));
  const bbIdOf = new Map(brep.sectionParts.map((b) => [b.designId, b.id]));
  const sectionOf = (sp: SectionPart | undefined): IndependentSection | undefined => building.sections.find((s) => s.id === sp?.sectionId);
  const namePart = (v: string | undefined) => (v === undefined || v.trim() === '' ? '-1' : v.trim());
  const bbPrefix = (sp: SectionPart | undefined) => {
    const s = sectionOf(sp);
    return `${namePart(s?.blockName)}_${namePart(s?.entrance)}_${s?.number ?? '-1'}`;
  };
  const spById = new Map(building.sectionParts.map((s) => [s.id, s]));
  const sh = brep.shell;

  // ---- Kök
  w.line('<?xml version="1.0" encoding="utf-8"?>');
  w.open(`<core:CityModel ${NS}>`);
  w.open('<gml:boundedBy>');
  w.open(`<gml:Envelope srsDimension="3" srsName="EPSG:${epsg}">`);
  w.line(`<gml:lowerCorner>${pos(sh.envelope.min)}</gml:lowerCorner>`);
  w.line(`<gml:upperCorner>${pos(sh.envelope.max)}</gml:upperCorner>`);
  w.close('</gml:Envelope>');
  w.close('</gml:boundedBy>');

  // ---- Mimari Bina (§3.3)
  w.open('<core:cityObjectMember>');
  w.open(`<bldg:Building gml:id="${sh.id}">`);
  w.line(`<gml:name>Mimari Bina_${esc(cid)}</gml:name>`);
  attr('string', 'constructionID', cid);
  attr('int', 'takbisPropertyIdentityNumber', project.parcel.takbisPropertyIdentityNumber);
  attr('int', 'maksIdentityNumber', info.maksIdentityNumber);
  attr('int', 'maksIntegrationState', info.maksIntegrationState);
  attr('string', 'blockNumber', project.parcel.blockNumber);
  attr('string', 'parcelNumber', project.parcel.parcelNumber);
  attr('string', 'tenderRegistrationNumber', info.tenderRegistrationNumber);
  attr('int', 'buildingType', info.buildingType);
  for (const g of info.geometrySuitability) attr('int', 'geometrySuitability', g);
  attr('string', 'architecturalPlanID', info.architecturalPlanID);
  attr('string', 'additionalNote', info.additionalNote || '-');
  attr('int', 'takbisNeighbourhoodReference', project.parcel.takbisNeighbourhoodReference);
  attr('int', 'totalIndependentSectionCount', new Set(building.sectionParts.map((s) => sectionOf(s)?.number)).size);
  attr('int', 'elevatorCount', info.elevatorCount);
  attr('double', 'roofProjectionArea', fmt2(sh.roofProjectionArea));
  attr('double', 'buildingHeight', fmt2(sh.buildingHeight));
  attr('date', 'architecturalProjectConfirmationDate', info.architecturalProjectConfirmationDate);
  w.line('<bldg:class>MimariBina</bldg:class>');
  w.line(`<bldg:storeysAboveGround>${sh.storeysAboveGround}</bldg:storeysAboveGround>`);
  w.line(`<bldg:storeysBelowGround>${sh.storeysBelowGround}</bldg:storeysBelowGround>`);
  w.open('<bldg:lod0FootPrint>');
  multiSurface(sh.lod0FootPrint);
  w.close('</bldg:lod0FootPrint>');
  w.open('<bldg:lod0RoofEdge>');
  multiSurface(sh.lod0RoofEdge);
  w.close('</bldg:lod0RoofEdge>');
  w.open('<bldg:lod1Solid>');
  w.open('<gml:CompositeSolid>');
  for (const solid of sh.lod1Solids) {
    w.open('<gml:solidMember>');
    w.open('<gml:Solid>');
    w.open('<gml:exterior>');
    w.open('<gml:CompositeSurface>');
    for (const p of solid) {
      w.open('<gml:surfaceMember>');
      polygon(p);
      w.close('</gml:surfaceMember>');
    }
    w.close('</gml:CompositeSurface>');
    w.close('</gml:exterior>');
    w.close('</gml:Solid>');
    w.close('</gml:solidMember>');
  }
  w.close('</gml:CompositeSolid>');
  w.close('</bldg:lod1Solid>');
  const byTag = (t: BrepSurface['tag']) => sh.lod2Surfaces.filter((s) => s.tag === t);
  const lod2Order = [...byTag('RoofSurface'), ...byTag('WallSurface'), ...byTag('OuterFloorSurface'), ...byTag('OuterCeilingSurface'), ...byTag('GroundSurface')];
  w.open('<bldg:lod2MultiSurface>');
  xlinks(lod2Order.flatMap((s) => s.polygons));
  w.close('</bldg:lod2MultiSurface>');
  w.open('<bldg:lod2TerrainIntersection>');
  w.open('<gml:MultiCurve>');
  w.open('<gml:curveMember>');
  w.open('<gml:LineString>');
  w.line(`<gml:posList>${posList(sh.tic)}</gml:posList>`);
  w.close('</gml:LineString>');
  w.close('</gml:curveMember>');
  w.close('</gml:MultiCurve>');
  w.close('</bldg:lod2TerrainIntersection>');

  // Balkon / teras (§3.10)
  for (const b of sh.balconies) {
    const db = (building.balconies ?? []).find((x) => x.id === b.designId);
    const sp = db?.sectionPartId ? spById.get(db.sectionPartId) : undefined;
    const ref = sp ? (bbIdOf.get(sp.id) ?? '-1') : '-1';
    const polys = b.surfaces.flatMap((s) => s.polygons);
    w.open('<bldg:outerBuildingInstallation>');
    w.open(`<bldg:BuildingInstallation gml:id="${b.id}">`);
    w.line(`<gml:name>${esc(b.prefix === 'TRS_' && !sp ? '-1_-1_-1_Teras' : `${bbPrefix(sp)}_${b.prefix === 'TRS_' ? 'Teras' : 'Balkon'}`)}</gml:name>`);
    attr('string', 'independentSectionObjectReference', ref);
    attr('int', 'geometrySuitability', 1001);
    attr('string', 'additionalNote', '-');
    attr('double', 'planArea', db && db.planArea >= 0 ? fmt2(db.planArea) : '-1.0');
    attr('double', 'calculatedArea', fmt2(b.attributes.calculatedArea));
    w.line(`<bldg:class>${b.prefix === 'TRS_' ? 'Teras' : 'Balkon'}</bldg:class>`);
    w.open('<bldg:lod2Geometry>');
    xlinks([...polys.filter((p) => p.kind === 'Floor_'), ...polys.filter((p) => p.kind !== 'Floor_')]);
    w.close('</bldg:lod2Geometry>');
    for (const s of b.surfaces) boundedBy(s, 'lod2');
    w.close('</bldg:BuildingInstallation>');
    w.close('</bldg:outerBuildingInstallation>');
  }
  // Bina sınır yüzeyleri: Çatı, Zemin, Duvarlar, DışTaban, DışTavan (Ornek6 sırası)
  for (const s of [...byTag('RoofSurface'), ...byTag('GroundSurface'), ...byTag('WallSurface'), ...byTag('OuterFloorSurface'), ...byTag('OuterCeilingSurface')]) boundedBy(s, 'lod2');

  // Kısımlar ve ortak alanlar (§3.7, §3.8)
  for (const r of brep.rooms) room(r);
  w.close('</bldg:Building>');
  w.close('</core:cityObjectMember>');

  function room(r: BrepObject) {
    const part = building.parts.find((p) => p.id === r.designId);
    if (!part) return;
    const polys = r.surfaces.flatMap((s) => s.polygons);
    w.open('<bldg:interiorRoom>');
    w.open(`<bldg:Room gml:id="${r.id}">`);
    if (part.kind === 'BBK') {
      const sp = spById.get(part.sectionPartIds[0] ?? '');
      w.line(`<gml:name>${esc(`${bbPrefix(sp)}_${desc('partUsage', part.usage)}`)}</gml:name>`);
      for (const spId of part.sectionPartIds) attr('string', 'independentSectionObjectReference', bbIdOf.get(spId) ?? '-1');
      attr('int', 'partUsage', part.usage);
      attr('int', 'geometrySuitability', 1001);
      attr('string', 'additionalNote', '-');
      attr('double', 'planArea', part.planArea >= 0 ? fmt2(part.planArea) : '-1.0');
      attr('double', 'calculatedArea', fmt2(r.attributes.calculatedArea));
      attr('double', 'volume', fmt2(r.attributes.volume));
      w.line('<bldg:class>BagimsizBolumKisim</bldg:class>');
    } else {
      w.line(`<gml:name>${esc(`${desc('commonAreaUsage', part.usage)}_Ortak Alan`)}</gml:name>`);
      attr('string', 'storeyObjectReference', kIdOf.get(part.storeyId) ?? '-1');
      attr('int', 'commonAreaUsage', part.usage);
      attr('double', 'calculatedArea', fmt2(r.attributes.calculatedArea));
      w.line('<bldg:class>OrtakAlan</bldg:class>');
    }
    w.open('<bldg:lod4MultiSurface>');
    xlinks(polys);
    w.close('</bldg:lod4MultiSurface>');
    for (const s of r.surfaces) boundedBy(s, 'lod4');
    w.close('</bldg:Room>');
    w.close('</bldg:interiorRoom>');
  }

  // ---- Katlar (§3.5)
  for (const k of brep.storeys) {
    const s = building.storeys.find((x) => x.id === k.designId)!;
    const sps = building.sectionParts.filter((x) => x.storeyId === s.id);
    const usages = new Set<number>();
    for (const sp of sps) usages.add(sp.usage === 1002 ? 1002 : 1001);
    if (building.parts.some((p) => p.kind === 'OA' && p.storeyId === s.id)) usages.add(1003);
    if (usages.size === 0) usages.add(1001);
    w.open('<core:cityObjectMember>');
    w.open(`<grp:CityObjectGroup gml:id="${k.id}">`);
    w.line(`<gml:name>Kat_${esc(s.storeyNumber)}</gml:name>`);
    attr('string', 'storeyNumber', s.storeyNumber);
    for (const u of [...usages].sort()) attr('int', 'storeyUsage', u);
    attr('int', 'independentSectionCount', sps.length);
    w.line('<grp:class>Kat</grp:class>');
    for (const sp of sps) w.line(`<grp:groupMember xlink:href="#${bbIdOf.get(sp.id)}"/>`);
    w.line(`<grp:parent xlink:href="#${sh.id}"/>`);
    w.open('<grp:geometry>');
    multiSurface(k.surfaces.flatMap((x) => x.polygons));
    w.close('</grp:geometry>');
    w.close('</grp:CityObjectGroup>');
    w.close('</core:cityObjectMember>');
  }

  // ---- Bağımsız bölüm parçaları (§3.6)
  for (const b of brep.sectionParts) {
    const sp = spById.get(b.designId)!;
    const sec = sectionOf(sp);
    const si = (sec && building.sectionInfo?.[sec.id]) ?? DEFAULT_SECTION_INFO;
    w.open('<core:cityObjectMember>');
    w.open(`<gen:GenericCityObject gml:id="${b.id}">`);
    w.line(`<gml:name>${esc(`${bbPrefix(sp)}_Bağımsız Bölüm`)}</gml:name>`);
    attr('int', 'geometrySuitability', si.geometrySuitability);
    attr('int', 'integrationState', si.integrationState);
    attr('string', 'independentSectionNumber', sec?.number ?? '');
    attr('string', 'blockName', sec?.blockName && sec.blockName.trim() !== '' ? sec.blockName : '-1');
    attr('string', 'entrance', sec?.entrance ?? '');
    attr('int', 'takbisPropertyIdentityNumber', -1);
    attr('int', 'maksIdentityNumber', si.maksIdentityNumber);
    attr('int', 'maksNumaratajIdentityNumber', si.maksNumaratajIdentityNumber);
    attr('int', 'maksIntegrationState', si.maksIntegrationState);
    attr('string', 'registeredQuality', sec?.registeredQuality ?? '');
    attr('string', 'registeredInstallation', sec?.registeredInstallation ?? '');
    attr('string', 'registeredFloorDefinition', sec?.registeredFloorDefinition ?? '');
    attr('string', 'propertyLot', sec?.propertyLot ?? '');
    attr('string', 'additionalNote', si.additionalNote || '-');
    for (const d of building.cardinalDirections?.[sp.id] ?? []) attr('int', 'independentSectionCardinalDirection', d);
    attr('int', 'independentSectionUsage', sp.usage);
    attr('int', 'partCount', building.parts.filter((p) => p.sectionPartIds.includes(sp.id)).length);
    attr('double', 'independentSectionPlanNetArea', sec && sec.planNetArea >= 0 ? fmt2(sec.planNetArea) : '-1');
    attr('double', 'independentSectionPlanGrossArea', sec && sec.planGrossArea >= 0 ? fmt2(sec.planGrossArea) : '-1');
    attr('double', 'independentSectionCalculatedArea', fmt2(b.attributes.independentSectionCalculatedArea));
    w.line('<gen:class>BagimsizBolum</gen:class>');
    w.open('<gen:lod2Geometry>');
    multiSurface(b.surfaces.flatMap((x) => x.polygons));
    w.close('</gen:lod2Geometry>');
    w.close('</gen:GenericCityObject>');
    w.close('</core:cityObjectMember>');
  }

  // ---- MBG (§3.11)
  w.open('<core:cityObjectMember>');
  w.open(`<grp:CityObjectGroup gml:id="${sh.mbgId}">`);
  w.line(`<gml:name>Mimari Bina Grup_${esc(cid)}</gml:name>`);
  w.line('<grp:class>MimariBinaGrup</grp:class>');
  w.line(`<grp:groupMember xlink:href="#${sh.id}"/>`);
  for (const k of brep.storeys) w.line(`<grp:groupMember xlink:href="#${k.id}"/>`);
  for (const b of brep.sectionParts) w.line(`<grp:groupMember xlink:href="#${b.id}"/>`);
  w.close('</grp:CityObjectGroup>');
  w.close('</core:cityObjectMember>');
  w.close('</core:CityModel>');
  return { xml: w.text(), fileName: `M-${cid}.gml`, constructionID: cid };
}
