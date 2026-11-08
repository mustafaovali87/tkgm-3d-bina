// M9 — TKGM 3dbinadogrula Teslim Ön-Kontrolü (Pre-Flight), Resmi Doğrulama Kodu Kaydı ve Rapor Üretici (§7.1, §10.6, ACIK-09, K02, K03, K88-yeni, K89, K99).
// Saf TypeScript; DOM, React veya Node bağımlılığı yoktur.
import type { CodelistRegistry } from '../codelists/index.ts';
import type { DesignProject } from '../design/types.ts';
import type { ImportedModel } from '../gml/gmlReader.ts';
import { sha256Hex } from '../hash/canonical.ts';
import type {
  ImportedParcelBoundary,
  MultiBuildingParcelCheckReport,
} from '../importers/parcelImporter.ts';
import { validateParcelAndMultiBuilding } from '../importers/parcelImporter.ts';
import { formatBigIntFraction } from '../math/landShare.ts';
import { validateBbMalikShares, type Malik } from '../model/malik.ts';
import { ALL_RULES, validateCityGml } from './index.ts';
import type { Finding, ValidationReport } from './types.ts';
import {
  runExtendedGeometryAudit,
  type ExtendedGeometryAuditReport,
  type Val3dityReportSummary,
} from './val3dity.ts';

export interface OfficialVerificationRecord {
  readonly status: 'bekliyor' | 'basarili' | 'hatali';
  /** 3dbinadogrula.tkgm.gov.tr tarafından verilen Doğrulama Kodu. */
  readonly verificationCode: string;
  /** Doğrulama tarihi (YYYY-MM-DD). */
  readonly verifiedAt: string;
  /** Doğrulama anındaki CityGML dosyasının SHA-256 özeti (K89). */
  readonly fileSha256: string;
  /** Doğrulama anındaki kanonik model SHA-256 özeti (K89). */
  readonly canonicalHashSha256: string;
  /** Sunucudan dönen mesajlar (varsa). */
  readonly serverMessages: readonly string[];
  /** Kullanıcı notu. */
  readonly note?: string;
}

export interface ServerMessageMatch {
  readonly rawMessage: string;
  readonly matchedRuleIds: readonly string[];
  readonly confidence: 'exact' | 'keyword' | 'unmatched';
}

export interface SubmissionChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly status: 'pass' | 'warn' | 'fail';
  readonly detail: string;
  readonly ruleRef: string;
}

export interface SubmissionReadinessParams {
  readonly xml: string;
  readonly fileName: string;
  readonly model: ImportedModel;
  readonly codelists: CodelistRegistry;
  readonly parcel?: ImportedParcelBoundary;
  readonly siblingModels?: readonly ImportedModel[];
  readonly val3dityReport?: Val3dityReportSummary;
  readonly officialVerification?: OfficialVerificationRecord;
}

export interface SubmissionReadinessReport {
  readonly fileName: string;
  readonly expectedFileName: string;
  readonly constructionID: string;
  readonly fileSizeBytes: number;
  readonly fileSha256: string;
  readonly canonicalHashSha256: string;
  readonly validationReport: ValidationReport;
  readonly extendedGeometry: ExtendedGeometryAuditReport;
  readonly parcelMultiBuilding: MultiBuildingParcelCheckReport | null;
  readonly val3ditySummary: Val3dityReportSummary | null;
  readonly officialVerification: OfficialVerificationRecord | null;
  readonly hashMatchesOfficialRecord: boolean | null;
  readonly matchedServerMessages: readonly ServerMessageMatch[];
  readonly checklist: readonly SubmissionChecklistItem[];
  readonly totalErrors: number;
  readonly totalWarnings: number;
  readonly readyForTkgmUpload: boolean;
}

/**
 * TKGM `3dbinadogrula.tkgm.gov.tr` sunucusundan dönen hata mesajını bilinen `V-xxx` kurallarıyla eşleştirir (`§10.6`).
 */
export function matchServerMessageToRule(serverMessage: string): ServerMessageMatch {
  const clean = serverMessage.trim();
  if (!clean) {
    return { rawMessage: serverMessage, matchedRuleIds: [], confidence: 'unmatched' };
  }

  const matched = new Set<string>();
  let exact = false;

  // 1) val3dity / GML tireli hata kodu (-101 .. -904)
  const codeMatch = /-(\d{3})\b/.exec(clean);
  if (codeMatch) {
    const code = Number(codeMatch[1]);
    if (code === 101) matched.add('V-031');
    else if (code === 102) matched.add('V-032');
    else if (code === 103) matched.add('V-033');
    else if (code === 104) matched.add('V-034');
    else if (code === 201) matched.add('V-035');
    else if (code === 202) matched.add('V-036');
    else if (code === 203) matched.add('V-037');
    else if (code === 204) matched.add('V-038');
    else if (code >= 205 && code <= 207) matched.add('V-039');
    else if (code === 208) matched.add('V-040');
    else if (code >= 301 && code <= 405) {
      matched.add('V-101');
      matched.add('V-217');
    } else if (code >= 501 && code <= 503) matched.add('V-100');
    else if (code === 901) matched.add('V-003');
    else if (code === 902) matched.add('V-006');
    else if (code === 904) matched.add('V-004');
    if (matched.size > 0) exact = true;
  }

  const lower = clean.toLocaleLowerCase('tr-TR');

  // 2) Şartname §6 tkgmMessage ve anahtar ifadeler
  const KEYWORD_MAP: ReadonlyArray<{ readonly pattern: RegExp; readonly ruleIds: readonly string[]; readonly isExact?: boolean }> = [
    { pattern: /m-\s*ile\s*başlamalı/i, ruleIds: ['V-001'], isExact: true },
    { pattern: /dosya\s*adı\s*ile\s*yapıid\s*uyuşmuyor/i, ruleIds: ['V-002'], isExact: true },
    { pattern: /sadece\s*bir\s*bina\s*olmalıdır/i, ruleIds: ['V-010'], isExact: true },
    { pattern: /epsg\s*kodu\s*yanlış|srsname\s*geçersiz/i, ruleIds: ['V-014'], isExact: true },
    { pattern: /srsdimension\s*(?:özelliği|değeri)/i, ruleIds: ['V-015'], isExact: true },
    { pattern: /dış\s*çerçevenin\s*\(envelope\)\s*içinde\s*değil/i, ruleIds: ['V-018'], isExact: true },
    { pattern: /koordinat\s*\(tm\)\s*değerleri\s*geçersiz/i, ruleIds: ['V-020'], isExact: true },
    { pattern: /poligonlar\s*srsname\s*değerine\s*sahip\s*olmamalıdır/i, ruleIds: ['V-021'], isExact: true },
    { pattern: /linearring\s*planar\s*değil/i, ruleIds: ['V-037'], isExact: true },
    { pattern: /geometri\s*elementinin\s*idsi\s*olmamalıdır/i, ruleIds: ['V-056'], isExact: true },
    { pattern: /sınıf\s*değeri\s*geçersiz/i, ruleIds: ['V-057'], isExact: true },
    { pattern: /isimlendirme\s*hatası/i, ruleIds: ['V-058'], isExact: true },
    { pattern: /yüzey\s*\(surface\)\s*name\s*değeri\s*hatalı/i, ruleIds: ['V-059'], isExact: true },
    { pattern: /takbispropertyidentitynumber\s*ile\s*yapıid\s*uyuşmuyor/i, ruleIds: ['V-070'], isExact: true },
    { pattern: /1002\s*\(diğer\s*yapı\)\s*atanamaz/i, ruleIds: ['V-071', 'V-202'], isExact: true },
    { pattern: /bina\s*geometrik\s*uygunluğu\s*1006/i, ruleIds: ['V-072', 'V-202'], isExact: true },
    { pattern: /ihalekayıtno\s*boş\s*bırakılmalı/i, ruleIds: ['V-073', 'V-202'], isExact: true },
    { pattern: /mimari\s*plan\s*id\s*boş\s*bırakılmalıdır/i, ruleIds: ['V-074', 'V-202'], isExact: true },
    { pattern: /toplam\s*bağımsız\s*bölüm\s*sayısı\s*gmldeki\s*ile\s*uyuşmuyor/i, ruleIds: ['V-076'], isExact: true },
    { pattern: /toplam\s*kat\s*adedi\s*ile\s*gml/i, ruleIds: ['V-077'], isExact: true },
    { pattern: /lod2terrainintersection.*multicurve/i, ruleIds: ['V-090'], isExact: true },
    { pattern: /tic.*en\s*üst\s*noktası\s*ile\s*footprint/i, ruleIds: ['V-093'], isExact: true },
    { pattern: /lod1solid.*compositesolid/i, ruleIds: ['V-098'], isExact: true },
    { pattern: /zemin\(ground\)\s*yüzeyi\s*1\s*tane\s*olmalıdır/i, ruleIds: ['V-105'], isExact: true },
    { pattern: /katın\s*parent\s*değeri\s*binanın\s*idsine\s*eşit\s*olmalıdır/i, ruleIds: ['V-112'], isExact: true },
    { pattern: /yan\s*duvarlar,\s*tabanın\s*üstünden\s*başlamalıdır/i, ruleIds: ['V-124'], isExact: true },
    { pattern: /entegrasyon\s*durumu\s*1004\s*olmalıdır/i, ruleIds: ['V-130'], isExact: true },
    { pattern: /pencereye\s*uygun\s*delik\s*bulunamadı/i, ruleIds: ['V-117', 'V-139', 'V-172'], isExact: true },
    { pattern: /calculatedarea.*geometriden\s*hesaplanan/i, ruleIds: ['V-155'], isExact: true },
    { pattern: /girilen\s*hacim\s*\(volume\),\s*geometriden\s*hesaplanan/i, ruleIds: ['V-158'], isExact: true },
    { pattern: /oda\s*yüksekliği\s*1\.5\s*metreden\s*az\s*olamaz/i, ruleIds: ['V-159'], isExact: true },
    { pattern: /kısımdaki\s*pencere\s*objesinin\s*binada\s*karşılığı\s*bulunamadı|lk_outerwindowpairnotfound/i, ruleIds: ['V-164'], isExact: true },
    { pattern: /duvar\s*yüzeyinde.*uygun\s*delik\s*bulunamadı/i, ruleIds: ['V-172'], isExact: true },
    { pattern: /balkon\s*taban\s*kalınlığı\s*aynı\s*olmalıdır/i, ruleIds: ['V-182'], isExact: true },
    { pattern: /aynı\s*parselde\s*kesişen\s*binalar|yüzde.*kesişmektedir/i, ruleIds: ['V-192'], isExact: true },
    { pattern: /binanın\s*tabanı\s*ile\s*(?:bulunduğu\s*)?parsel/i, ruleIds: ['V-193'], isExact: true },
  ];

  for (const entry of KEYWORD_MAP) {
    if (entry.pattern.test(clean) || entry.pattern.test(lower)) {
      for (const id of entry.ruleIds) matched.add(id);
      if (entry.isExact) exact = true;
    }
  }

  // 3) Doğrudan V-xxx kodu geçiyorsa
  for (const m of clean.matchAll(/\b(V-\d{3}[ab]?)\b/gi)) {
    const code = m[1].toUpperCase().replace(/([AB])$/, (s) => s.toLowerCase());
    if (ALL_RULES.some((r) => r.id === code)) {
      matched.add(code);
      exact = true;
    }
  }

  return {
    rawMessage: serverMessage,
    matchedRuleIds: [...matched],
    confidence: matched.size === 0 ? 'unmatched' : exact ? 'exact' : 'keyword',
  };
}

/**
 * `3dbinadogrula.tkgm.gov.tr` yüklemesi öncesinde tüm dosya, şema, geometri, parsel ve resmi kod
 * kontrollerini çalıştırarak `SubmissionReadinessReport` üretir (`§7.1`, `§10.6`, `K02`, `K03`, `K89`).
 */
// K02
// K03
// K89
// V-001
// V-002
// V-003
// V-192
// V-193
// V-202
// V-217
export function evaluateSubmissionReadiness(
  params: SubmissionReadinessParams
): SubmissionReadinessReport {
  const { xml, fileName, model, codelists, parcel, siblingModels, val3dityReport, officialVerification } = params;
  const mb = model.objects.find((o) => o.prefix === 'MB_');
  const constructionID = mb?.attributesMap.constructionID ?? 'BILINMIYOR';
  const expectedFileName = `M-${constructionID}.gml`;

  const fileSha256 = sha256Hex(xml);
  const canonicalHashSha256 = model.canonicalHash;
  const validationReport = validateCityGml(xml, fileName, model, codelists);
  const extendedGeometry = runExtendedGeometryAudit(model);

  const parcelMultiBuilding =
    parcel || (siblingModels && siblingModels.length > 0)
      ? validateParcelAndMultiBuilding(model, { parcel, siblingModels })
      : null;

  const val3ditySummary = val3dityReport ?? null;

  const hashMatchesOfficialRecord = officialVerification
    ? officialVerification.canonicalHashSha256 === canonicalHashSha256 ||
      officialVerification.fileSha256 === fileSha256
    : null;

  const matchedServerMessages = (officialVerification?.serverMessages ?? []).map(matchServerMessageToRule);

  const checklist: SubmissionChecklistItem[] = [];

  // 1. Dosya Adı ve Yapı Kimliği (K03, V-001, V-002)
  const baseName = fileName.split(/[\\/]/).pop() ?? fileName;
  const nameOk = baseName === expectedFileName;
  checklist.push({
    id: 'CHK-FILENAME',
    label: 'Dosya Adı ve Yapı Kimliği (M-<constructionID>.gml)',
    status: nameOk ? 'pass' : 'fail',
    detail: nameOk
      ? `${baseName} (constructionID: ${constructionID})`
      : `Beklenen: "${expectedFileName}", Mevcut: "${baseName}"`,
    ruleRef: 'K03 / V-001 / V-002',
  });

  // 2. UTF-8, BOM'suz ve CRLF Biçimi (K02, V-003)
  const hasBom = model.hasUtf8Bom || xml.charCodeAt(0) === 0xfeff;
  const hasCrlf = xml.includes('\r\n');
  const declOk = /^<\?xml version="1\.0" encoding="utf-8"\?>/.test(xml.replace(/^\uFEFF/, ''));
  checklist.push({
    id: 'CHK-ENCODING',
    label: 'Kodlama ve Satır Sonu (UTF-8, BOM\'suz, CRLF)',
    status: !hasBom && declOk ? (hasCrlf ? 'pass' : 'warn') : 'fail',
    detail: `Bildirim: ${declOk ? 'uygun' : 'hatalı'} · BOM: ${hasBom ? 'var (silinmeli)' : 'yok'} · Satır sonu: ${hasCrlf ? 'CRLF' : 'LF'}`,
    ruleRef: 'K02 / V-003',
  });

  // 3. Sürdürülebilirlik Rejimi ve Sabit Değerler (V-105, V-202)
  const v202Errors = validationReport.findings.filter((f) => f.ruleId === 'V-202' && f.severity === 'H');
  checklist.push({
    id: 'CHK-REGIME',
    label: 'Sürdürülebilirlik Rejimi (GroundSurface & V-202 Sabitleri)',
    status: validationReport.regime === 'S' && v202Errors.length === 0 ? 'pass' : 'fail',
    detail:
      validationReport.regime === 'S' && v202Errors.length === 0
        ? 'Rejim S (GroundSurface mevcut, buildingType=1001, geometrySuitability=1006)'
        : `Rejim: ${validationReport.regime}, V-202 ihlali: ${v202Errors.length}`,
    ruleRef: 'V-105 / V-202',
  });

  // 4. M2 Dosya Doğrulayıcı (176 Kural — 0 HATA)
  checklist.push({
    id: 'CHK-VALIDATION',
    label: 'TKGM Şema ve Semantik Doğrulayıcı (176 Kural)',
    status:
      validationReport.counts.H === 0
        ? validationReport.counts.U === 0
          ? 'pass'
          : 'warn'
        : 'fail',
    detail: `HATA: ${validationReport.counts.H} · UYARI: ${validationReport.counts.U} · BİLGİ: ${validationReport.counts.B} (${validationReport.durationMs} ms)`,
    ruleRef: '§6 V-001…V-217',
  });

  // 5. 3B Kabuk Kapalılığı (LoD1, BBK, OA, BBKIY, OAIY — V-101, V-196, V-217)
  const openRooms = extendedGeometry.roomShells.filter((r) => !r.closed10Mm);
  const openInsts = extendedGeometry.installationShells.filter((i) => !i.closed10Mm);
  const shellsOk = extendedGeometry.lod1SolidClosed && openRooms.length === 0 && openInsts.length === 0;
  checklist.push({
    id: 'CHK-SHELLS',
    label: '3B Kabuk Kapalılığı (LoD1, Oda ve İç Yapı Manifold Denetimi)',
    status: shellsOk ? 'pass' : openRooms.length > 0 ? 'fail' : 'warn',
    detail: `LoD1: ${extendedGeometry.lod1SolidClosed ? 'Kapalı' : `${extendedGeometry.lod1OpenEdges} açık kenar`} · Oda (${extendedGeometry.roomShells.length - openRooms.length}/${extendedGeometry.roomShells.length} kapalı) · İç Yapı (${extendedGeometry.installationShells.length - openInsts.length}/${extendedGeometry.installationShells.length} kapalı)`,
    ruleRef: 'V-101 / V-196 / V-217',
  });

  // 6. Arsa Payı (propertyLot) Bütünlüğü (K84, V-198a)
  const ls = model.landShareAnalysis;
  const lsHasError = ls.issues.some((i) => i.severity === 'H');
  checklist.push({
    id: 'CHK-LANDSHARE',
    label: 'Arsa Payı (BigInt Kesir Kontrolü)',
    status: lsHasError ? 'fail' : ls.isCompleteShareEqualOne ? 'pass' : 'warn',
    detail: ls.hasPropertyLotData
      ? `Toplam: ${ls.formattedTotalReduced} (Ham: ${ls.formattedTotalUnreduced}) · Benzersiz BB: ${ls.uniqueBbCount}`
      : 'Arsa payı verisi yok',
    ruleRef: 'K84 / V-198',
  });

  // 7. Parsel Sınırı ve Çok Blok Kontrolü (V-019, V-192, V-193)
  if (parcelMultiBuilding) {
    const pmErrors = parcelMultiBuilding.findings.filter((f) => f.severity === 'H');
    const pmWarns = parcelMultiBuilding.findings.filter((f) => f.severity === 'U');
    checklist.push({
      id: 'CHK-PARCEL',
      label: 'Parsel Sınırı (KML/GeoJSON) ve Çok Blok Kesişim Kontrolü',
      status: pmErrors.length > 0 ? 'fail' : pmWarns.length > 0 ? 'warn' : 'pass',
      detail:
        parcelMultiBuilding.parcelOverlapRatio !== null
          ? `Parsel örtüşme: %${(parcelMultiBuilding.parcelOverlapRatio * 100).toFixed(1)} · Blok çifti: ${parcelMultiBuilding.buildingPairOverlaps.length} · HATA: ${pmErrors.length}`
          : `Çok blok karşılaştırması (${parcelMultiBuilding.buildingPairOverlaps.length} çift) · HATA: ${pmErrors.length}`,
      ruleRef: 'V-019 / V-192 / V-193',
    });
  }

  // 8. Harici val3dity Raporu (varsa)
  if (val3ditySummary) {
    checklist.push({
      id: 'CHK-VAL3DITY',
      label: `Harici val3dity Raporu (v${val3ditySummary.val3dityVersion})`,
      status: val3ditySummary.isValid ? 'pass' : 'fail',
      detail: val3ditySummary.isValid
        ? `Tüm özellikler geçerli (${val3ditySummary.validFeatures}/${val3ditySummary.totalFeatures})`
        : `${val3ditySummary.invalidFeatures} geçersiz özellik, hata kodları: ${val3ditySummary.errorCodes.map((c) => `-${c}`).join(', ')}`,
      ruleRef: '§9.5 / V-031…V-101',
    });
  }

  // 9. Resmi 3dbinadogrula Doğrulama Kodu Kaydı (varsa)
  if (officialVerification) {
    const codeOk =
      officialVerification.status === 'basarili' &&
      officialVerification.verificationCode.trim().length > 0 &&
      hashMatchesOfficialRecord === true;
    checklist.push({
      id: 'CHK-OFFICIAL',
      label: 'TKGM 3dbinadogrula Resmi Doğrulama Kaydı',
      status:
        officialVerification.status === 'hatali'
          ? 'fail'
          : codeOk
            ? 'pass'
            : 'warn',
      detail:
        officialVerification.status === 'basarili'
          ? `Doğrulama Kodu: ${officialVerification.verificationCode} (${officialVerification.verifiedAt})${hashMatchesOfficialRecord ? ' · SHA-256 Kilidi Eşleşiyor' : ' · UYARI: Model doğrulamadan sonra değişmiş!'}`
          : `Durum: ${officialVerification.status} (${officialVerification.serverMessages.length} sunucu mesajı)`,
      ruleRef: '§7.1 / §10.6 / ACIK-09',
    });
  }

  const extraErrors =
    (parcelMultiBuilding?.findings.filter((f) => f.severity === 'H').length ?? 0) +
    (val3ditySummary?.findings.filter((f) => f.severity === 'H').length ?? 0);
  const extraWarnings =
    extendedGeometry.findings.filter((f) => f.severity === 'U').length +
    (parcelMultiBuilding?.findings.filter((f) => f.severity === 'U').length ?? 0);

  const totalErrors = validationReport.counts.H + extraErrors;
  const totalWarnings = validationReport.counts.U + extraWarnings;
  const readyForTkgmUpload =
    totalErrors === 0 &&
    nameOk &&
    !hasBom &&
    declOk &&
    validationReport.regime === 'S' &&
    openRooms.length === 0;

  return {
    fileName,
    expectedFileName,
    constructionID,
    fileSizeBytes: xml.length,
    fileSha256,
    canonicalHashSha256,
    validationReport,
    extendedGeometry,
    parcelMultiBuilding,
    val3ditySummary,
    officialVerification: officialVerification ?? null,
    hashMatchesOfficialRecord,
    matchedServerMessages,
    checklist,
    totalErrors,
    totalWarnings,
    readyForTkgmUpload,
  };
}

function escapeHtml(text?: string | null): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Belediye / Kadastro teslim paketi için kendi kendine yeten (çevrimdışı, sıfır dış bağlantılı)
 * HTML Teknik Doğrulama ve Teslim Raporu üretir (`§7.1`, `§10.6`, `K99`: malik verisi içermez).
 */
// K89
// K99
export function generateSubmissionReportHtml(
  readiness: SubmissionReadinessReport,
  model: ImportedModel
): string {
  const mb = model.objects.find((o) => o.prefix === 'MB_');
  const attrs = mb?.attributesMap ?? {};
  const storeys = model.objects.filter((o) => o.prefix === 'K_');
  const bbs = model.objects.filter((o) => o.prefix === 'BB_');
  const bbks = model.objects.filter((o) => o.prefix === 'BBK_');
  const oas = model.objects.filter((o) => o.prefix === 'OA_');

  const checklistRows = readiness.checklist
    .map((item) => {
      const badge =
        item.status === 'pass'
          ? 'UYGUN'
          : item.status === 'warn'
            ? 'UYARI'
            : 'HATA';
      const color =
        item.status === 'pass'
          ? '#15803d'
          : item.status === 'warn'
            ? '#b45309'
            : '#b91c1c';
      return `<tr>
        <td><code>${escapeHtml(item.ruleRef)}</code></td>
        <td><strong>${escapeHtml(item.label)}</strong></td>
        <td style="color:${color};font-weight:700">${badge}</td>
        <td>${escapeHtml(item.detail)}</td>
      </tr>`;
    })
    .join('\n');

  const bbRows = bbs
    .map((bb) => {
      const a = bb.attributesMap;
      const rooms = bbks.filter((r) => r.referencedBbGmlId === bb.gmlId);
      const roomAreaSum = rooms.reduce((s, r) => s + (Number(r.attributesMap.calculatedArea) || 0), 0);
      return `<tr>
        <td>${escapeHtml(a.blockName ?? '-1')}</td>
        <td>${escapeHtml(a.entrance ?? '')}</td>
        <td><strong>${escapeHtml(a.independentSectionNumber ?? '')}</strong></td>
        <td>${escapeHtml(a.registeredFloorDefinition ?? '')}</td>
        <td>${escapeHtml(a.registeredQuality ?? '')}</td>
        <td style="text-align:right;font-variant-numeric:tabular-nums">${escapeHtml(a.propertyLot ?? '—')}</td>
        <td style="text-align:right;font-variant-numeric:tabular-nums">${escapeHtml(a.independentSectionCalculatedArea ?? '—')}</td>
        <td style="text-align:right;font-variant-numeric:tabular-nums">${roomAreaSum.toFixed(2)}</td>
        <td style="text-align:right;font-variant-numeric:tabular-nums">${rooms.length}</td>
      </tr>`;
    })
    .join('\n');

  const topFindings: readonly Finding[] = [
    ...readiness.validationReport.findings,
    ...(readiness.parcelMultiBuilding?.findings ?? []),
    ...(readiness.val3ditySummary?.findings ?? []),
  ].slice(0, 100);

  const findingRows =
    topFindings.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:#15803d">Hiçbir doğrulama bulgusu yok (0 HATA, 0 UYARI, 0 BİLGİ).</td></tr>`
      : topFindings
          .map(
            (f) => `<tr>
          <td><code>${escapeHtml(f.ruleId)}</code></td>
          <td><strong>${escapeHtml(f.severity)}</strong></td>
          <td><code>${escapeHtml(f.targetGmlId ?? f.polygonGmlId ?? '—')}</code></td>
          <td>${escapeHtml(f.message)}</td>
        </tr>`
          )
          .join('\n');

  const officialSection = readiness.officialVerification
    ? `<section>
      <h2>2. TKGM 3dbinadogrula.tkgm.gov.tr Resmi Doğrulama Kaydı</h2>
      <table>
        <tbody>
          <tr><th>Doğrulama Durumu</th><td><strong>${escapeHtml(readiness.officialVerification.status.toUpperCase())}</strong></td></tr>
          <tr><th>Doğrulama Kodu</th><td><code>${escapeHtml(readiness.officialVerification.verificationCode || '—')}</code></td></tr>
          <tr><th>Doğrulama Tarihi</th><td>${escapeHtml(readiness.officialVerification.verifiedAt || '—')}</td></tr>
          <tr><th>SHA-256 Kilit Uyumu</th><td>${readiness.hashMatchesOfficialRecord ? 'UYGUN (Dosya özeti doğrulanan sürümle birebir aynı)' : 'UYARI (Model doğrulamadan sonra değişmiş)'}</td></tr>
        </tbody>
      </table>
    </section>`
    : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>TKGM 3B Sayısal Yapı Modeli Teslim ve Doğrulama Raporu — ${escapeHtml(readiness.expectedFileName)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 24px auto; max-width: 1080px; line-height: 1.45; font-size: 13px; }
    h1 { font-size: 18px; margin-bottom: 4px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
    h2 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-variant-numeric: tabular-nums; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-weight: 600; color: #334155; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }
    .summary-bar { display: flex; gap: 16px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>TKGM 3B Sayısal Yapı Modeli (CityGML 2.0) — Teknik Doğrulama ve Teslim Raporu</h1>
  <div class="summary-bar">
    <div><strong>Dosya:</strong> <code>${escapeHtml(readiness.fileName)}</code></div>
    <div><strong>Yapı Kimliği (constructionID):</strong> <code>${escapeHtml(readiness.constructionID)}</code></div>
    <div><strong>CRS:</strong> <code>${escapeHtml(model.srsName ?? '—')}</code></div>
    <div><strong>Teslim Durumu:</strong> <strong style="color:${readiness.readyForTkgmUpload ? '#15803d' : '#b91c1c'}">${readiness.readyForTkgmUpload ? 'TESLİME HAZIR (0 HATA)' : 'DÜZELTME GEREKLİ'}</strong></div>
  </div>

  <section>
    <h2>1. Yapı Kimliği ve Kanonik Özet (K89)</h2>
    <table>
      <tbody>
        <tr><th>TAKBİS Taşınmaz Kimlik No</th><td><code>${escapeHtml(attrs.takbisPropertyIdentityNumber ?? '—')}</code></td><th>Ada / Parsel</th><td>${escapeHtml(attrs.blockNumber ?? '—')} / ${escapeHtml(attrs.parcelNumber ?? '—')}</td></tr>
        <tr><th>Bina Yüksekliği / Çatı İzdüşümü</th><td>${escapeHtml(attrs.buildingHeight ?? '—')} m / ${escapeHtml(attrs.roofProjectionArea ?? '—')} m²</td><th>Proje Onay Tarihi</th><td>${escapeHtml(attrs.architecturalProjectConfirmationDate ?? '—')}</td></tr>
        <tr><th>Nesne Sayıları</th><td colspan="3">Kat (K_): ${storeys.length} · Bağımsız Bölüm Parçası (BB_): ${bbs.length} · Kısım (BBK_): ${bbks.length} · Ortak Alan (OA_): ${oas.length} · Poligon: ${model.polygons.length}</td></tr>
        <tr><th>Dosya SHA-256</th><td colspan="3"><code>${escapeHtml(readiness.fileSha256)}</code></td></tr>
        <tr><th>Kanonik Model SHA-256 (K89)</th><td colspan="3"><code>${escapeHtml(readiness.canonicalHashSha256)}</code></td></tr>
      </tbody>
    </table>
  </section>

  ${officialSection}

  <section>
    <h2>3. Teslim Ön-Kontrol Listesi (Pre-Flight)</h2>
    <table>
      <thead>
        <tr><th>Kural</th><th>Kontrol Kalemi</th><th>Durum</th><th>Açıklama</th></tr>
      </thead>
      <tbody>
        ${checklistRows}
      </tbody>
    </table>
  </section>

  <section>
    <h2>4. Bağımsız Bölüm ve Alan İcmali</h2>
    <table>
      <thead>
        <tr><th>Blok</th><th>Giriş</th><th>BB No</th><th>Kat Tanımı</th><th>Nitelik</th><th>Arsa Payı</th><th>BB Çizim Alanı (m²)</th><th>Kısımlar Toplamı (m²)</th><th>Kısım Adedi</th></tr>
      </thead>
      <tbody>
        ${bbRows}
      </tbody>
    </table>
  </section>

  <section>
    <h2>5. Doğrulama Bulguları (HATA: ${readiness.validationReport.counts.H} · UYARI: ${readiness.validationReport.counts.U} · BİLGİ: ${readiness.validationReport.counts.B})</h2>
    <table>
      <thead>
        <tr><th>Kural</th><th>Düzey</th><th>Hedef Kimlik</th><th>Açıklama</th></tr>
      </thead>
      <tbody>
        ${findingRows}
      </tbody>
    </table>
  </section>
</body>
</html>`;
}

/**
 * Kullanıcının kendi arşiv ve kat irtifakı dosyası için ayrı **Kat İrtifakı ve Malik Listesi Raporu** üretir
 * (`KARARLAR.md §A.4`, `K88-yeni`, `K99`: Bu bilgiler yalnızca `.tkgm3b` ve bu raporda yer alır, GML'e asla yazılmaz).
 */
// K88
// K99
export function generateMalikIrtifakReportHtml(
  project: DesignProject,
  malikler: readonly Malik[]
): string {
  const b = project.buildings[0];
  const sections = b?.sections ?? [];

  const rows = sections
    .map((sec) => {
      const bbKey = `${sec.blockName}|${sec.entrance}|${sec.number}`;
      const secMalikler = malikler.filter(
        (m) => m.bbAnahtari === bbKey || m.bbAnahtari === sec.number || m.bbAnahtari === sec.id
      );
      const summary = validateBbMalikShares(bbKey, secMalikler.map((m) => ({ ...m, bbAnahtari: bbKey })));
      const malikListHtml =
        secMalikler.length === 0
          ? '<em>Malik girilmedi</em>'
          : secMalikler
              .map(
                (m) =>
                  `${escapeHtml(m.adSoyadVeyaUnvan)}${m.tcKimlikVeyaVergiNo ? ` (${escapeHtml(m.tcKimlikVeyaVergiNo)})` : ''} — <strong>${m.hissePay.toString()}/${m.hissePayda.toString()}</strong>`
              )
              .join('<br/>');
      return `<tr>
        <td>${escapeHtml(sec.blockName)}</td>
        <td><strong>${escapeHtml(sec.number)}</strong></td>
        <td>${escapeHtml(sec.registeredFloorDefinition)}</td>
        <td>${escapeHtml(sec.registeredQuality)}</td>
        <td style="text-align:right;font-variant-numeric:tabular-nums">${escapeHtml(sec.propertyLot)}</td>
        <td>${malikListHtml}</td>
        <td style="text-align:right;font-variant-numeric:tabular-nums">${secMalikler.length > 0 ? formatBigIntFraction(summary.toplamHisse) : '—'}</td>
      </tr>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Kat İrtifakı ve Malik Listesi Raporu — ${escapeHtml(project.name)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 24px auto; max-width: 960px; line-height: 1.45; font-size: 13px; }
    h1 { font-size: 18px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
    .notice { background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 12px; margin-bottom: 14px; font-size: 12px; color: #334155; }
    table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Kat İrtifakı ve Malik Listesi Tablosu — ${escapeHtml(project.name)}</h1>
  <div class="notice">
    <strong>Not (K88-yeni / K99):</strong> Malik bilgileri yalnızca yerel proje dosyasında (<code>.tkgm3b</code>) ve bu kullanıcı raporunda tutulur; TKGM CityGML (<code>.gml</code>) dosyasına kesinlikle yazılmaz.
  </div>
  <table>
    <thead>
      <tr><th>Blok</th><th>BB No</th><th>Kat Tanımı</th><th>Nitelik</th><th>Arsa Payı</th><th>Malikler ve Hisseleri</th><th>Toplam Malik Hissesi</th></tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}
