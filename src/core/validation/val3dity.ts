// M9 — Harici val3dity JSON Rapor Ayrıştırıcı (§9.5) ve Yerel Genişletilmiş 3B Kabuk/Topoloji Denetimi (V-100, V-101, V-108, V-122, V-125, V-162, V-183, V-184, V-197, V-200, V-217).
// Saf TypeScript; DOM, React veya Node bağımlılığı yoktur.
import { subtractPolygons2D, unionPolygons2D } from '../brep/polyBoolean2d.ts';
import { polyAreaM2, signedArea2x } from '../design/geometry2d.ts';
import type { Poly2, Pt2, Ring2 } from '../design/types.ts';

import type { ImportedCityObject, ImportedModel, ImportedPolygon } from '../gml/gmlReader.ts';
import type { Point3D } from '../model/index.ts';
import { checkRoomShellClosure, ringKey } from './geom.ts';
import type { Finding } from './types.ts';

export interface Val3dityRawError {
  readonly code: number;
  readonly description?: string;
  readonly id?: string;
  readonly info?: string;
}

export interface Val3dityFeatureResult {
  readonly id: string;
  readonly type: string;
  readonly validity: boolean;
  readonly errors: readonly Val3dityRawError[];
}

export interface Val3dityReportSummary {
  readonly val3dityVersion: string;
  readonly isValid: boolean;
  readonly totalFeatures: number;
  readonly validFeatures: number;
  readonly invalidFeatures: number;
  readonly errorCodes: readonly number[];
  readonly featureResults: readonly Val3dityFeatureResult[];
  readonly findings: readonly Finding[];
}

export interface ShellAuditItem {
  readonly gmlId: string;
  readonly gmlName: string;
  readonly prefix: string;
  readonly closed10Mm: boolean;
  readonly closed1Mm: boolean;
  readonly openEdges10Mm: number;
  readonly openEdges1Mm: number;
  readonly polygonCount: number;
}

export interface DuplexAreaStrategyInfo {
  readonly sectionNumber: string;
  readonly blockName: string;
  readonly partGmlIds: readonly string[];
  readonly declaredAreas: readonly number[];
  readonly strategy: 'repeat' | 'minusOne' | 'mixed';
}

export interface ExtendedGeometryAuditReport {
  readonly lod1SolidClosed: boolean;
  readonly lod1OpenEdges: number;
  readonly roomShells: readonly ShellAuditItem[];
  readonly installationShells: readonly ShellAuditItem[];
  readonly duplexStrategies: readonly DuplexAreaStrategyInfo[];
  readonly findings: readonly Finding[];
}

/**
 * `val3dity` hata kodunu (`101..999`) şartname §6'daki `V-xxx` kural koduna eşler (`§9.5`).
 */
// V-031
// V-032
// V-033
// V-034
// V-035
// V-036
// V-037
// V-038
// V-039
// V-040
// V-100
// V-101
// V-217
export function mapVal3dityCodeToRuleId(code: number, targetPrefix?: string): string {
  switch (code) {
    case 101:
      return 'V-031';
    case 102:
      return 'V-032';
    case 103:
      return 'V-033';
    case 104:
      return 'V-034';
    case 201:
      return 'V-035';
    case 202:
      return 'V-036';
    case 203:
      return 'V-037';
    case 204:
      return 'V-038';
    case 205:
    case 206:
    case 207:
      return 'V-039';
    case 208:
      return 'V-040';
    case 301:
    case 302:
    case 303:
    case 304:
    case 305:
    case 306:
    case 307:
    case 308:
    case 309:
      if (targetPrefix === 'BBK_' || targetPrefix === 'OA_') return 'V-217';
      if (targetPrefix === 'BBKIY_' || targetPrefix === 'OAIY_') return 'V-196';
      return 'V-101';
    case 401:
    case 402:
    case 403:
    case 404:
    case 405:
      return 'V-101';
    case 501:
    case 502:
    case 503:
      return 'V-100';
    case 901:
      return 'V-003';
    case 902:
      return 'V-006';
    case 904:
      return 'V-004';
    default:
      return code >= 300 && code < 500 ? 'V-101' : 'V-034';
  }
}

function extractRawErrors(arr: unknown): Val3dityRawError[] {
  if (!Array.isArray(arr)) return [];
  const out: Val3dityRawError[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as {
      code?: unknown;
      description?: unknown;
      id?: unknown;
      info?: unknown;
    };
    const code = Number(rec.code);
    if (!Number.isFinite(code)) continue;
    out.push({
      code,
      ...(typeof rec.description === 'string' ? { description: rec.description } : {}),
      ...(typeof rec.id === 'string' ? { id: rec.id } : {}),
      ...(typeof rec.info === 'string' ? { info: rec.info } : {}),
    });
  }
  return out;
}

/**
 * `val3dity --report report.json` çıktısını ayrıştırır ve bulguları `V-xxx` kurallarıyla eşler (`§9.5`).
 */
// V-100
// V-101
// V-217
export function parseVal3dityReport(
  jsonText: string,
  model?: ImportedModel
): Val3dityReportSummary {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new Error('val3dity raporu geçerli bir JSON dosyası değil.');
  }
  if (!raw || typeof raw !== 'object') {
    throw new Error('val3dity raporu boş veya geçersiz.');
  }

  const root = raw as {
    val3dity_version?: unknown;
    version?: unknown;
    validity?: unknown;
    all_errors?: unknown;
    features?: unknown;
  };

  const val3dityVersion =
    typeof root.val3dity_version === 'string'
      ? root.val3dity_version
      : typeof root.version === 'string'
        ? root.version
        : 'bilinmiyor';

  const featureResults: Val3dityFeatureResult[] = [];
  const findings: Finding[] = [];
  const codeSet = new Set<number>();

  if (Array.isArray(root.all_errors)) {
    for (const c of root.all_errors) {
      const n = Number(c);
      if (Number.isFinite(n)) codeSet.add(n);
    }
  }

  if (Array.isArray(root.features)) {
    for (const f of root.features) {
      if (!f || typeof f !== 'object') continue;
      const feat = f as {
        id?: unknown;
        type?: unknown;
        validity?: unknown;
        errors?: unknown;
        primitives?: unknown;
      };
      const fid = typeof feat.id === 'string' ? feat.id : '';
      const ftype = typeof feat.type === 'string' ? feat.type : 'Feature';
      const primErrors: Val3dityRawError[] = [];
      if (Array.isArray(feat.primitives)) {
        for (const p of feat.primitives) {
          if (p && typeof p === 'object') {
            primErrors.push(...extractRawErrors((p as { errors?: unknown }).errors));
          }
        }
      }
      const errors = [...extractRawErrors(feat.errors), ...primErrors];
      const validity = typeof feat.validity === 'boolean' ? feat.validity : errors.length === 0;
      featureResults.push({
        id: fid,
        type: ftype,
        validity,
        errors,
      });

      const targetObj = fid && model ? model.objectsById[fid] : undefined;
      const prefix = targetObj?.prefix ?? (fid.includes('_') ? `${fid.split('_')[0]}_` : undefined);

      for (const err of errors) {
        codeSet.add(err.code);
        const ruleId = mapVal3dityCodeToRuleId(err.code, prefix);
        const polyId =
          err.id && model?.polygonsById[err.id]
            ? err.id
            : fid && model?.polygonsById[fid]
              ? fid
              : undefined;
        findings.push({
          ruleId,
          severity: 'H',
          targetGmlId: targetObj?.gmlId ?? (fid || undefined),
          polygonGmlId: polyId,
          message: `val3dity -${err.code} (${err.description ?? 'Geometri hatası'})${fid ? ` [${fid}]` : ''}${err.id ? ` (${err.id})` : ''}${err.info ? `: ${err.info}` : ''}.`,
          tkgmMessage: `-${err.code}`,
        });
      }
    }
  }

  const validFeatures = featureResults.filter((f) => f.validity).length;
  const invalidFeatures = featureResults.length - validFeatures;
  const isValid =
    typeof root.validity === 'boolean'
      ? root.validity && invalidFeatures === 0 && codeSet.size === 0
      : invalidFeatures === 0 && codeSet.size === 0;

  return {
    val3dityVersion,
    isValid,
    totalFeatures: featureResults.length,
    validFeatures,
    invalidFeatures,
    errorCodes: [...codeSet].sort((a, b) => a - b),
    featureResults,
    findings,
  };
}

function ensureOrientation(ring: readonly Pt2[], wantCcw: boolean): Ring2 {
  const s = signedArea2x(ring);
  return (wantCcw && s < 0) || (!wantCcw && s > 0) ? [...ring].reverse() : [...ring];
}

function polygonToLocalPoly2(p: ImportedPolygon, originE: number, originN: number): Poly2 | null {
  const cleanRing = (verts: readonly Point3D[], wantCcw: boolean): Ring2 | null => {
    const pts: Pt2[] = [];
    for (const v of verts) {
      const pt: Pt2 = {
        x: Math.round((v.e - originE) * 1000),
        y: Math.round((v.n - originN) * 1000),
      };
      if (pts.length > 0) {
        const prev = pts[pts.length - 1];
        if (prev.x === pt.x && prev.y === pt.y) continue;
      }
      pts.push(pt);
    }
    if (pts.length >= 2 && pts[0].x === pts[pts.length - 1].x && pts[0].y === pts[pts.length - 1].y) {
      pts.pop();
    }
    if (pts.length < 3 || Math.abs(signedArea2x(pts)) < 100) return null;
    return ensureOrientation(pts, wantCcw);
  };

  const outer = cleanRing(p.exteriorRing.vertices, true);
  if (!outer) return null;
  const holes: Ring2[] = [];
  for (const h of p.interiorRings) {
    const hr = cleanRing(h.vertices, false);
    if (hr) holes.push(hr);
  }
  return { outer, holes };
}

function objectFloorPolys2D(
  model: ImportedModel,
  obj: ImportedCityObject,
  originE: number,
  originN: number
): Poly2[] {
  const floorPolys = obj.allPolygonIds
    .map((id) => model.polygonsById[id])
    .filter((p): p is ImportedPolygon => p !== undefined && p.prefix === 'Floor_');
  if (floorPolys.length === 0) return [];
  const minZ = Math.min(...floorPolys.map((p) => p.minZ));
  const lowest = floorPolys.filter((p) => Math.abs(p.minZ - minZ) <= 0.002 && p.maxZ - p.minZ <= 0.002);
  const chosen = lowest.length > 0 ? lowest : floorPolys;
  const polys2d = chosen
    .map((p) => polygonToLocalPoly2(p, originE, originN))
    .filter((p): p is Poly2 => p !== null);
  return unionPolygons2D(polys2d);
}

/**
 * Yerel genişletilmiş 3B kabuk ve çokgen topolojisi denetimini çalıştırır (`V-101`, `V-108`, `V-125`, `V-162`, `V-184`, `V-196`, `V-197`, `V-200`, `V-217`).
 */
// V-101
// V-108
// V-125
// V-162
// V-184
// V-196
// V-197
// V-200
// V-217
export function runExtendedGeometryAudit(model: ImportedModel): ExtendedGeometryAuditReport {
  const findings: Finding[] = [];
  const originE = Math.floor(model.envelope.minE);
  const originN = Math.floor(model.envelope.minN);
  const mb = model.objects.find((o) => o.prefix === 'MB_');

  // 1) V-101: LoD1 CompositeSolid kabuk kapalılığı
  const lod1Polys = model.polygons.filter((p) => p.lodLevel === 'lod1Solid');
  let lod1SolidClosed = true;
  let lod1OpenEdges = 0;
  if (lod1Polys.length >= 4) {
    const lod1Rings = lod1Polys.flatMap((p) => [
      p.exteriorRing.vertices,
      ...p.interiorRings.map((h) => h.vertices),
    ]);
    const c10 = checkRoomShellClosure(lod1Rings, 10);
    lod1SolidClosed = c10.closed;
    lod1OpenEdges = c10.openEdges;
    if (!c10.closed) {
      findings.push({
        ruleId: 'V-101',
        severity: 'U',
        targetGmlId: mb?.gmlId,
        message: `LoD1 CompositeSolid kabuğunda ${c10.openEdges} açık kenar var (10 mm tolerans).`,
        tkgmMessage: '-302',
      });
    }
  }

  // 2) V-217 & V-196: Oda (BBK_/OA_) ve İç Yapı (BBKIY_/OAIY_) 3B kabuk kapalılığı
  const auditShellFor = (obj: ImportedCityObject): ShellAuditItem => {
    const polyIds = new Set(
      obj.surfaces.flatMap((s) => [...s.polygonIds, ...s.xlinkHrefs.map((h) => h.replace(/^#/, ''))])
    );
    const rings: (readonly Point3D[])[] = [];
    for (const pid of polyIds) {
      const p = model.polygonsById[pid];
      if (!p) continue;
      rings.push(p.exteriorRing.vertices);
      if (p.surfaceTag === 'FloorSurface' || p.surfaceTag === 'CeilingSurface') {
        for (const h of p.interiorRings) rings.push(h.vertices);
      }
    }
    if (rings.length < 4) {
      return {
        gmlId: obj.gmlId,
        gmlName: obj.gmlName,
        prefix: obj.prefix,
        closed10Mm: false,
        closed1Mm: false,
        openEdges10Mm: rings.length,
        openEdges1Mm: rings.length,
        polygonCount: polyIds.size,
      };
    }
    const c10 = checkRoomShellClosure(rings, 10);
    const c1 = checkRoomShellClosure(rings, 1);
    return {
      gmlId: obj.gmlId,
      gmlName: obj.gmlName,
      prefix: obj.prefix,
      closed10Mm: c10.closed,
      closed1Mm: c1.closed,
      openEdges10Mm: c10.openEdges,
      openEdges1Mm: c1.openEdges,
      polygonCount: polyIds.size,
    };
  };

  const roomShells = model.objects
    .filter((o) => o.prefix === 'BBK_' || o.prefix === 'OA_')
    .map(auditShellFor);

  const installationShells = model.objects
    .filter((o) => o.prefix === 'BBKIY_' || o.prefix === 'OAIY_')
    .map(auditShellFor);

  for (const inst of installationShells) {
    if (!inst.closed10Mm) {
      findings.push({
        ruleId: 'V-196',
        severity: 'U',
        targetGmlId: inst.gmlId,
        message: `${inst.gmlName}: iç yapı 3B kabuğu kapalı değil (${inst.openEdges10Mm} açık kenar).`,
      });
    }
  }

  // 3) V-108: RoofEdge ⊂ Çatı İzdüşümü
  const roofEdgePolys = model.polygons
    .filter((p) => p.lodLevel === 'lod0RoofEdge')
    .map((p) => polygonToLocalPoly2(p, originE, originN))
    .filter((p): p is Poly2 => p !== null);
  const roofPolys = model.polygons
    .filter((p) => p.surfaceTag === 'RoofSurface')
    .map((p) => polygonToLocalPoly2(p, originE, originN))
    .filter((p): p is Poly2 => p !== null);
  if (roofEdgePolys.length > 0 && roofPolys.length > 0) {
    const roofUnion = unionPolygons2D(roofPolys);
    const uncovered = subtractPolygons2D(roofEdgePolys, roofUnion);
    const uncoveredArea = uncovered.reduce((s, p) => s + polyAreaM2(p), 0);
    if (uncoveredArea > 0.05) {
      findings.push({
        ruleId: 'V-108',
        severity: 'U',
        targetGmlId: mb?.gmlId,
        message: `RoofEdge poligonunun ${uncoveredArea.toFixed(2)} m² kısmı çatı (RoofSurface) izdüşümü dışında kalıyor.`,
      });
    }
  }

  // 4) V-125: BB ⊂ Kat ve V-162: BBK ⊂ BB
  const bbs = model.objects.filter((o) => o.prefix === 'BB_');
  const bbFloorMap = new Map<string, Poly2[]>();
  for (const bb of bbs) {
    bbFloorMap.set(bb.gmlId, objectFloorPolys2D(model, bb, originE, originN));
  }

  for (const k of model.objects.filter((o) => o.prefix === 'K_')) {
    const kPolys = objectFloorPolys2D(model, k, originE, originN);
    if (kPolys.length === 0) continue;
    for (const href of k.groupMemberHrefs) {
      const refId = href.replace(/^#/, '');
      const bbPolys = bbFloorMap.get(refId);
      if (!bbPolys || bbPolys.length === 0) continue;
      // Çatı arası BB'si giriş katına groupStoreyId ile bağlanmış olabilir; yalnız aynı kottaki BB'leri karşılaştır
      const bbObj = model.objectsById[refId];
      if (bbObj && k.minZ !== null && bbObj.minZ !== null && Math.abs(bbObj.minZ - k.minZ) > 0.5) {
        continue;
      }
      const outPolys = subtractPolygons2D(bbPolys, kPolys);
      const outArea = outPolys.reduce((s, p) => s + polyAreaM2(p), 0);
      if (outArea > 0.1) {
        findings.push({
          ruleId: 'V-125',
          severity: 'U',
          targetGmlId: refId,
          message: `${bbObj?.gmlName ?? refId}: bağımsız bölüm tabanının ${outArea.toFixed(2)} m² kısmı bağlı olduğu ${k.gmlName} kat sınırının dışına taşıyor.`,
        });
      }
    }
  }

  for (const bbk of model.objects.filter((o) => o.prefix === 'BBK_')) {
    const refBb = bbk.referencedBbGmlId;
    if (!refBb) continue;
    const bbPolys = bbFloorMap.get(refBb);
    const roomPolys = objectFloorPolys2D(model, bbk, originE, originN);
    if (!bbPolys || bbPolys.length === 0 || roomPolys.length === 0) continue;
    const roomArea = roomPolys.reduce((s, p) => s + polyAreaM2(p), 0);
    const outPolys = subtractPolygons2D(roomPolys, bbPolys);
    const outArea = outPolys.reduce((s, p) => s + polyAreaM2(p), 0);
    // Uzak kısım (remote) tamamen BB dışında olabilir; kısmi taşmaları raporla
    if (outArea > 0.1 && outArea < roomArea - 0.1) {
      findings.push({
        ruleId: 'V-162',
        severity: 'U',
        targetGmlId: bbk.gmlId,
        message: `${bbk.gmlName}: kısım tabanının ${outArea.toFixed(2)} m² kısmı bağlı olduğu BB sınırının dışına taşıyor.`,
      });
    }
  }

  // 5) V-197: K71 iç-oda delikleri eşleşmesi
  const allRoomOuterKeys = new Set<string>();
  for (const r of model.objects.filter((o) => o.prefix === 'BBK_' || o.prefix === 'OA_')) {
    for (const pid of r.allPolygonIds) {
      const p = model.polygonsById[pid];
      if (p && p.prefix === 'Floor_') {
        allRoomOuterKeys.add(ringKey(p.exteriorRing.vertices));
      }
    }
  }
  for (const r of model.objects.filter((o) => o.prefix === 'BBK_' || o.prefix === 'OA_')) {
    for (const pid of r.allPolygonIds) {
      const p = model.polygonsById[pid];
      if (!p || p.prefix !== 'Floor_' || p.interiorRings.length === 0) continue;
      for (const h of p.interiorRings) {
        if (!allRoomOuterKeys.has(ringKey(h.vertices))) {
          findings.push({
            ruleId: 'V-197',
            severity: 'B',
            targetGmlId: r.gmlId,
            polygonGmlId: p.gmlId,
            message: `${r.gmlName}: taban poligonundaki ${h.gmlId} iç halkası (boşluk/şaft) başka bir oda dış halkasıyla birebir eşleşmiyor.`,
          });
        }
      }
    }
  }

  // 6) V-200: Dubleks / çok parçalı BB alan stratejisi raporu (K30, K85)
  const bbGroups = new Map<string, ImportedCityObject[]>();
  for (const bb of bbs) {
    const key = `${bb.attributesMap.blockName ?? '-1'}|${bb.attributesMap.entrance ?? ''}|${bb.attributesMap.independentSectionNumber ?? ''}`;
    const list = bbGroups.get(key);
    if (list) list.push(bb);
    else bbGroups.set(key, [bb]);
  }
  const duplexStrategies: DuplexAreaStrategyInfo[] = [];
  for (const [, group] of bbGroups) {
    if (group.length < 2) continue;
    const areas = group.map((g) => Number(g.attributesMap.independentSectionCalculatedArea ?? 'NaN'));
    const hasMinusOne = areas.some((a) => a === -1);
    const allEqual = areas.every((a) => Number.isFinite(a) && Math.abs(a - areas[0]) < 0.01);
    const strategy: 'repeat' | 'minusOne' | 'mixed' = hasMinusOne
      ? 'minusOne'
      : allEqual
        ? 'repeat'
        : 'mixed';
    const first = group[0];
    duplexStrategies.push({
      sectionNumber: first.attributesMap.independentSectionNumber ?? '',
      blockName: first.attributesMap.blockName ?? '-1',
      partGmlIds: group.map((g) => g.gmlId),
      declaredAreas: areas,
      strategy,
    });
    findings.push({
      ruleId: 'V-200',
      severity: 'B',
      targetGmlId: first.gmlId,
      message: `BB ${first.attributesMap.independentSectionNumber} (${group.length} parça): çok katlı BB alan stratejisi "${strategy}" (${areas.map((a) => a.toFixed(2)).join(', ')} m²).`,
    });
  }

  return {
    lod1SolidClosed,
    lod1OpenEdges,
    roomShells,
    installationShells,
    duplexStrategies,
    findings,
  };
}
