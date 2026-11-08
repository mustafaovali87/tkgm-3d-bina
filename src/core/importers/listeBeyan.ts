// M7 — Liste Beyan ve Malik Tablosu İçe Aktarma / Doğrulama Motoru
// (şartname §8.4, CLAUDE13 §1 K88-yeni, OY-04, OY-06, K27, K31, K61, K84, K99, V-133, V-198a/b, V-199, V-208, V-212).
// Saf TypeScript; DOM, React veya Node bağımlılığı yoktur.
import { uuidv5 } from '../hash/canonical.ts';
import {
  analyzeBuildingLandShares,
  BuildingLandShareAnalysis,
  normalizeTurkishUpper,
  parsePropertyLot,
} from '../math/landShare.ts';
import {
  BbMalikShareSummary,
  Malik,
  validateBbMalikShares,
} from '../model/malik.ts';
import type { ValidationIssue } from '../model/index.ts';
import {
  DEFAULT_SECTION_INFO,
  DesignBuilding,
  DesignProject,
  IndependentSection,
  SectionInfo,
} from '../design/types.ts';

export interface ListeBeyanParsedRow {
  readonly rowNumber: number;
  readonly bbNo: string; // BB_NO (zorunlu)
  readonly blok: string; // BLOK (yoksa "-1")
  readonly giris: string; // GIRIS (boş olabilir)
  readonly katTanimi: string; // KAT_TANIMI (OY-04: aynen korunur!)
  readonly nitelik: string; // NITELIK (K61: TR büyük harf)
  readonly eklenti: string; // EKLENTI (K61: TR büyük harf, boş olabilir)
  readonly arsaPayi: string; // ARSA_PAYI ("pay/payda")
  readonly netAlan: number; // NET_ALAN (yoksa -1)
  readonly brutAlan: number; // BRUT_ALAN (yoksa -1)
  readonly maksBbNo: number | null; // MAKS_BB_NO
  readonly maksNumaratajNo: number | null; // MAKS_NUMARATAJ_NO
  readonly kullanim: 1001 | 1002 | 1003 | 1004 | 1005 | 1006; // KULLANIM (1001..1006)
  readonly cepheler: readonly number[]; // CEPHE (1001..1009, örn. "1001;1003")
  /** İsteğe bağlı malik sütunları (K88-yeni: yalnız .tkgm3b proje dosyasında tutulur, GML'e asla yazılmaz). */
  readonly malikAdSoyad?: string;
  readonly malikTcVergiNo?: string;
  readonly malikHisse?: string; // "pay/payda", yoksa "1/1"
  readonly malikNot?: string;
  readonly rowIssues: readonly ValidationIssue[];
}

export interface ListeBeyanParseResult {
  readonly detectedDelimiter: ',' | ';' | '\t';
  readonly rows: readonly ListeBeyanParsedRow[];
  readonly landShareAnalysis: BuildingLandShareAnalysis;
  readonly malikList: readonly Malik[];
  readonly malikSummaries: readonly BbMalikShareSummary[];
  readonly issues: readonly ValidationIssue[];
  readonly hasBlockingErrors: boolean;
}

const VALID_USAGES = new Set([1001, 1002, 1003, 1004, 1005, 1006]);
const VALID_DIRECTIONS = new Set([1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009]);

/**
 * Sütun başlığını standart anahtara eşler (büyük/küçük harf, Türkçe karakter ve boşluk/altçizgi duyarsız).
 */
function normalizeHeaderKey(rawHeader: string): string {
  return rawHeader
    .trim()
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toUpperCase()
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S')
    .replace(/İ/g, 'I')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function detectDelimiter(headerLine: string): ',' | ';' | '\t' {
  const tabCount = (headerLine.match(/\t/g) ?? []).length;
  const semiCount = (headerLine.match(/;/g) ?? []).length;
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  if (tabCount >= semiCount && tabCount >= commaCount && tabCount > 0) return '\t';
  if (semiCount >= commaCount && semiCount > 0) return ';';
  return ',';
}

function splitCsvRow(line: string, delimiter: ',' | ';' | '\t'): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function parseOptionalDouble(raw: string): number {
  const clean = raw.trim().replace(',', '.');
  if (!clean || clean === '-' || clean === '-1') return -1;
  const n = Number(clean);
  return Number.isFinite(n) && n > 0 ? n : -1;
}

function parseOptionalInt(raw: string): number | null {
  const clean = raw.trim();
  if (!clean || clean === '-' || clean === '-1') return null;
  if (!/^\d{1,15}$/.test(clean)) return null;
  const n = Number(clean);
  return Number.isSafeInteger(n) ? n : null;
}

/**
 * CSV, TSV veya Excel'den panoya kopyalanmış Liste Beyan (+ isteğe bağlı Malik) tablosunu ayrıştırır ve doğrular (`§8.4`, `// K27`, `// K61`, `// K84`, `// K88`, `// OY-04`, `// OY-06`).
 * - `KAT_TANIMI` (`registeredFloorDefinition`) **aynen** korunur (`OY-04`).
 * - `NITELIK` ve `EKLENTI` Türkçe büyük harfe çevrilir (`K61`).
 * - Eksik `BB_NO`, geçersiz `ARSA_PAYI` (`V-198a/b`), mükerrer BB (`V-212`) ve toplam arsa payı (`V-199`) raporlanır.
 */
// K27
// K31
// K61
// K84
// K88
// V-133
// V-135
// V-136
// V-198a
// V-198b
// V-199
// V-208
// V-212
export function parseListeBeyanText(text: string): ListeBeyanParseResult {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('Liste beyan metni boş.');
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvRow(lines[0], delimiter).map(normalizeHeaderKey);

  const colIndex = (aliases: readonly string[]): number => {
    for (const a of aliases) {
      const idx = headers.indexOf(a);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idxBbNo = colIndex(['BB_NO', 'BAGIMSIZ_BOLUM_NO', 'BBNO', 'NO', 'BB']);
  const idxBlok = colIndex(['BLOK', 'BLOCK', 'BLOK_ADI', 'BLOCK_NAME']);
  const idxGiris = colIndex(['GIRIS', 'ENTRANCE', 'KAPI_GIRIS']);
  const idxKat = colIndex(['KAT_TANIMI', 'KAT', 'REGISTERED_FLOOR_DEFINITION']);
  const idxNitelik = colIndex(['NITELIK', 'VASIF', 'REGISTERED_QUALITY']);
  const idxEklenti = colIndex(['EKLENTI', 'REGISTERED_INSTALLATION']);
  const idxArsaPayi = colIndex(['ARSA_PAYI', 'ARSAPAYI', 'PROPERTY_LOT', 'PAY_PAYDA']);
  const idxNetAlan = colIndex(['NET_ALAN', 'NET', 'PLAN_NET_AREA']);
  const idxBrutAlan = colIndex(['BRUT_ALAN', 'BRUT', 'PLAN_GROSS_AREA']);
  const idxMaksBb = colIndex(['MAKS_BB_NO', 'MAKS_IDENTITY_NUMBER', 'MAKS_NO']);
  const idxMaksNum = colIndex(['MAKS_NUMARATAJ_NO', 'NUMARATAJ_NO', 'MAKS_NUMARATAJ']);
  const idxKullanim = colIndex(['KULLANIM', 'USAGE', 'INDEPENDENT_SECTION_USAGE']);
  const idxCephe = colIndex(['CEPHE', 'BAKI', 'CARDINAL_DIRECTION']);
  const idxMalikAd = colIndex(['MALIK', 'MALIK_AD', 'MALIK_ADI', 'AD_SOYAD', 'UNVAN']);
  const idxMalikTc = colIndex(['TC_VERGI_NO', 'TC_KIMLIK', 'TC_NO', 'VERGI_NO']);
  const idxMalikHisse = colIndex(['MALIK_HISSE', 'HISSE', 'HISSE_PAYI']);
  const idxMalikNot = colIndex(['MALIK_NOT', 'NOT']);

  if (idxBbNo === -1) {
    throw new Error('Liste beyan başlık satırında "BB_NO" sütunu bulunamadı (§8.4).');
  }

  const rows: ListeBeyanParsedRow[] = [];
  const allIssues: ValidationIssue[] = [];
  const malikList: Malik[] = [];
  const seenShortKeys = new Map<string, number>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i], delimiter);
    const getCol = (idx: number) => (idx >= 0 && idx < cols.length ? cols[idx].trim() : '');

    const rowIssues: ValidationIssue[] = [];
    const bbNo = getCol(idxBbNo);
    const rawBlok = getCol(idxBlok);
    const blok = rawBlok.length > 0 ? normalizeTurkishUpper(rawBlok) : '-1';
    const giris = normalizeTurkishUpper(getCol(idxGiris));
    // OY-04: registeredFloorDefinition (KAT_TANIMI) aynen alınır, büyük harfe zorlanmaz!
    const katTanimi = getCol(idxKat);
    // K61: NITELIK ve EKLENTI Türkçe büyük harfe çevrilir
    const nitelik = normalizeTurkishUpper(getCol(idxNitelik) || 'MESKEN');
    const eklenti = normalizeTurkishUpper(getCol(idxEklenti));
    const rawArsaPayi = getCol(idxArsaPayi);

    if (!bbNo) {
      const iss: ValidationIssue = {
        ruleId: 'V-061',
        severity: 'H',
        message: `Satır ${i + 1}: BB_NO (bağımsız bölüm numarası) boş bırakılamaz (§8.4).`,
      };
      rowIssues.push(iss);
      allIssues.push(iss);
    }

    let cleanArsaPayi = rawArsaPayi;
    if (!rawArsaPayi) {
      const iss: ValidationIssue = {
        ruleId: 'V-133',
        severity: 'H',
        message: `Satır ${i + 1} (BB ${bbNo || '?'}): ARSA_PAYI boş bırakılamaz (§8.4, K27).`,
      };
      rowIssues.push(iss);
      allIssues.push(iss);
    } else {
      const lotRes = parsePropertyLot(rawArsaPayi, `BB_${bbNo}`);
      cleanArsaPayi = lotRes.cleanPropertyLot;
      rowIssues.push(...lotRes.issues);
      allIssues.push(...lotRes.issues);
    }

    const shortKey = `${blok}|${giris}|${bbNo}`;
    const prevRow = seenShortKeys.get(shortKey);
    const malikAdSoyad = getCol(idxMalikAd);
    // Eğer aynı BB için birden fazla malik satırı değilse tekrarlanan BB numarasını uyar
    if (prevRow !== undefined && !malikAdSoyad) {
      const iss: ValidationIssue = {
        ruleId: 'V-212',
        severity: 'U',
        message: `Satır ${i + 1}: Bağımsız bölüm (${shortKey}) satır ${prevRow} ile tekrarlanıyor (§8.4).`,
      };
      rowIssues.push(iss);
      allIssues.push(iss);
    } else if (bbNo) {
      seenShortKeys.set(shortKey, i + 1);
    }

    const netAlan = parseOptionalDouble(getCol(idxNetAlan));
    const brutAlan = parseOptionalDouble(getCol(idxBrutAlan));
    if (netAlan > 0 && brutAlan > 0 && netAlan >= brutAlan) {
      const iss: ValidationIssue = {
        ruleId: 'V-136',
        severity: 'U',
        message: `Satır ${i + 1} (BB ${bbNo}): Net alan (${netAlan.toFixed(2)}) brüt alandan (${brutAlan.toFixed(2)}) küçük olmalıdır.`,
      };
      rowIssues.push(iss);
      allIssues.push(iss);
    }

    const maksBbNo = parseOptionalInt(getCol(idxMaksBb));
    const maksNumaratajNo = parseOptionalInt(getCol(idxMaksNum));

    const rawUsage = Number.parseInt(getCol(idxKullanim), 10);
    const kullanim = (
      VALID_USAGES.has(rawUsage)
        ? rawUsage
        : nitelik.includes('DÜKKAN') || nitelik.includes('İŞYERİ') || nitelik.includes('OFİS')
        ? 1002
        : 1001
    ) as 1001 | 1002 | 1003 | 1004 | 1005 | 1006;

    const rawCephe = getCol(idxCephe);
    const cepheler: number[] = [];
    if (rawCephe) {
      const parts = rawCephe.split(/[;|,\s]+/).filter((x) => x.length > 0);
      for (const cp of parts) {
        const code = Number.parseInt(cp, 10);
        if (!VALID_DIRECTIONS.has(code)) {
          const iss: ValidationIssue = {
            ruleId: 'V-063',
            severity: 'H',
            message: `Satır ${i + 1} (BB ${bbNo}): Geçersiz cephe kodu "${cp}" (1001..1009 bekleniyor).`,
          };
          rowIssues.push(iss);
          allIssues.push(iss);
        } else if (cepheler.includes(code)) {
          const iss: ValidationIssue = {
            ruleId: 'V-135',
            severity: 'H',
            message: `Satır ${i + 1} (BB ${bbNo}): Tekrarlanan cephe kodu "${code}" (K29).`,
          };
          rowIssues.push(iss);
          allIssues.push(iss);
        } else {
          cepheler.push(code);
        }
      }
    }

    const malikTcVergiNo = getCol(idxMalikTc) || undefined;
    const rawMalikHisse = getCol(idxMalikHisse) || '1/1';
    const malikNot = getCol(idxMalikNot) || undefined;

    if (malikAdSoyad && bbNo) {
      const mMatch = /^(\d+)\/(\d+)$/.exec(rawMalikHisse.replace(/\s+/g, ''));
      const pay = mMatch ? BigInt(mMatch[1]) : 1n;
      const payda = mMatch ? BigInt(mMatch[2]) : 1n;
      malikList.push({
        bbAnahtari: shortKey,
        adSoyadVeyaUnvan: normalizeTurkishUpper(malikAdSoyad),
        ...(malikTcVergiNo ? { tcKimlikVeyaVergiNo: malikTcVergiNo } : {}),
        hissePay: pay,
        hissePayda: payda,
        ...(malikNot ? { not: malikNot } : {}),
      });
    }

    rows.push({
      rowNumber: i + 1,
      bbNo,
      blok,
      giris,
      katTanimi,
      nitelik,
      eklenti,
      arsaPayi: cleanArsaPayi,
      netAlan,
      brutAlan,
      maksBbNo,
      maksNumaratajNo,
      kullanim,
      cepheler,
      ...(malikAdSoyad ? { malikAdSoyad: normalizeTurkishUpper(malikAdSoyad) } : {}),
      ...(malikTcVergiNo ? { malikTcVergiNo } : {}),
      ...(malikAdSoyad ? { malikHisse: rawMalikHisse } : {}),
      ...(malikNot ? { malikNot } : {}),
      rowIssues,
    });
  }

  // Tekil BB satırlarından bina arsa payı analizini çalıştır
  const validShareInputs = rows
    .filter((r) => r.bbNo.length > 0 && r.arsaPayi.length > 0)
    .map((r) => ({
      gmlId: `BB_${r.bbNo}`,
      blockName: r.blok,
      entrance: r.giris,
      independentSectionNumber: r.bbNo,
      propertyLot: r.arsaPayi,
      registeredQuality: r.nitelik,
    }));

  const landShareAnalysis = analyzeBuildingLandShares(validShareInputs);
  for (const iss of landShareAnalysis.issues) {
    if (iss.ruleId === 'V-199' || iss.ruleId === 'V-212') {
      allIssues.push(iss);
    }
  }

  // Malik hisse kontrolleri (V-208)
  const uniqueBbKeys = Array.from(new Set(malikList.map((m) => m.bbAnahtari)));
  const malikSummaries: BbMalikShareSummary[] = uniqueBbKeys.map((bbKey) => {
    const summary = validateBbMalikShares(bbKey, malikList);
    if (summary.issue) {
      allIssues.push(summary.issue);
    }
    return summary;
  });

  const hasBlockingErrors = allIssues.some((i) => i.severity === 'H');

  return {
    detectedDelimiter: delimiter,
    rows,
    landShareAnalysis,
    malikList,
    malikSummaries,
    issues: allIssues,
    hasBlockingErrors,
  };
}

/**
 * Kullanıcı önizleme tablosunda onayladıktan sonra (`OY-06`, `K88-yeni`) ayrıştırılan Liste Beyan satırlarını
 * `DesignProject` modeline (`sections`, `sectionInfo`, `cardinalDirections`) uygular ve güncellenmiş `Malik[]` listesini döndürür.
 * - Aynı `(blok, giris, bbNo)` birden fazla malik satırında geçiyorsa tek bir `IndependentSection` oluşturulur.
 * - Var olan BB numaralarıyla eşleşen `SectionPart` bağlantıları korunur.
 */
// K88
// K92
export function applyApprovedListeBeyanToProject(
  project: DesignProject,
  parsed: ListeBeyanParseResult,
  existingMalikler: readonly Malik[] = []
): { readonly project: DesignProject; readonly malikler: readonly Malik[] } {
  const b0 = project.buildings[0];
  if (!b0) {
    throw new Error('Projede bina bulunamadı.');
  }

  let idSeq = project.idSeq;
  const sections: IndependentSection[] = [];
  const sectionInfoMap: Record<string, SectionInfo> = { ...(b0.sectionInfo ?? {}) };
  const cardinalDirectionsMap: Record<string, readonly number[]> = {
    ...(b0.cardinalDirections ?? {}),
  };

  const byShortKey = new Map<string, { section: IndependentSection; row: ListeBeyanParsedRow }>();

  for (const row of parsed.rows) {
    if (!row.bbNo) continue;
    const shortKey = `${row.blok}|${row.giris}|${row.bbNo}`;
    if (byShortKey.has(shortKey)) continue;

    // Mevcut projede aynı numaralı BB varsa ID'sini koru (çizilmiş BB parçaları kopmasın)
    const existingSec = b0.sections.find(
      (s) =>
        s.number === row.bbNo &&
        (s.blockName === row.blok || s.blockName === '-1' || row.blok === '-1')
    );
    const secId =
      existingSec?.id ??
      (() => {
        const id = uuidv5(`${project.id}:bolum:${idSeq}`);
        idSeq += 1;
        return id;
      })();

    const sec: IndependentSection = {
      id: secId,
      number: row.bbNo,
      blockName: row.blok,
      entrance: row.giris,
      registeredQuality: row.nitelik,
      registeredInstallation: row.eklenti,
      registeredFloorDefinition: row.katTanimi, // OY-04: aynen korunur
      propertyLot: row.arsaPayi,
      planNetArea: row.netAlan,
      planGrossArea: row.brutAlan,
    };

    sections.push(sec);
    byShortKey.set(shortKey, { section: sec, row });

    sectionInfoMap[secId] = {
      ...(sectionInfoMap[secId] ?? DEFAULT_SECTION_INFO),
      maksIdentityNumber: row.maksBbNo,
      maksNumaratajIdentityNumber: row.maksNumaratajNo,
    };
  }

  // BB parçalarının usage ve cardinalDirections bilgilerini eşle
  const updatedSectionParts = b0.sectionParts.map((sp) => {
    const sec = sections.find((s) => s.id === sp.sectionId);
    if (!sec) return sp;
    const shortKey = `${sec.blockName}|${sec.entrance}|${sec.number}`;
    const entry = byShortKey.get(shortKey);
    if (!entry) return sp;
    if (entry.row.cepheler.length > 0) {
      cardinalDirectionsMap[sp.id] = entry.row.cepheler;
    }
    return {
      ...sp,
      usage: entry.row.kullanim,
    };
  });

  // Henüz SectionPart çizilmemiş olsa bile, ilk eşleşmede kullanılmak üzere sectionId anahtarıyla da cepheleri sakla
  for (const { section, row } of byShortKey.values()) {
    if (row.cepheler.length > 0 && !cardinalDirectionsMap[section.id]) {
      cardinalDirectionsMap[section.id] = row.cepheler;
    }
  }

  const nextBuilding: DesignBuilding = {
    ...b0,
    sections,
    sectionParts: updatedSectionParts,
    sectionInfo: sectionInfoMap,
    cardinalDirections: cardinalDirectionsMap,
  };

  const mergedMalikler =
    parsed.malikList.length > 0 ? [...parsed.malikList] : [...existingMalikler];

  return {
    project: {
      ...project,
      idSeq,
      buildings: project.buildings.map((b, i) => (i === 0 ? nextBuilding : b)),
    },
    malikler: mergedMalikler,
  };
}

/**
 * Şartname §8.4 uyumlu örnek Liste Beyan CSV şablonu üretir.
 */
export function generateListeBeyanTemplateCsv(project?: DesignProject, malikler: readonly Malik[] = []): string {
  const header =
    'BB_NO;BLOK;GIRIS;KAT_TANIMI;NITELIK;EKLENTI;ARSA_PAYI;NET_ALAN;BRUT_ALAN;MAKS_BB_NO;MAKS_NUMARATAJ_NO;KULLANIM;CEPHE;MALIK_AD;TC_VERGI_NO;MALIK_HISSE';
  const b = project?.buildings[0];
  if (!b || b.sections.length === 0) {
    return [
      header,
      '1;-1;1;Zemin Kat;MESKEN;;1/2;75.00;90.00;199375835;209567999;1001;1001|1003|1005;ÖRNEK MALİK 1;11111111110;1/1',
      '2;-1;1;1. Kat;MESKEN;;1/2;75.00;90.00;199375833;209568001;1001;1001|1003|1005;ÖRNEK MALİK 2;22222222220;1/1',
    ].join('\r\n') + '\r\n';
  }

  const rows: string[] = [header];
  for (const s of b.sections) {
    const info = b.sectionInfo?.[s.id];
    const sp = b.sectionParts.find((x) => x.sectionId === s.id);
    const dirs = (sp ? b.cardinalDirections?.[sp.id] : undefined) ?? b.cardinalDirections?.[s.id] ?? [];
    const shortKey = `${s.blockName}|${s.entrance}|${s.number}`;
    const bbMaliks = malikler.filter((m) => m.bbAnahtari === shortKey || m.bbAnahtari === s.number);

    if (bbMaliks.length === 0) {
      rows.push(
        [
          s.number,
          s.blockName,
          s.entrance,
          s.registeredFloorDefinition,
          s.registeredQuality,
          s.registeredInstallation,
          s.propertyLot,
          s.planNetArea > 0 ? s.planNetArea.toFixed(2) : '-1',
          s.planGrossArea > 0 ? s.planGrossArea.toFixed(2) : '-1',
          info?.maksIdentityNumber ?? '',
          info?.maksNumaratajIdentityNumber ?? '',
          sp?.usage ?? 1001,
          dirs.join('|'),
          '',
          '',
          '',
        ].join(';')
      );
    } else {
      for (const m of bbMaliks) {
        rows.push(
          [
            s.number,
            s.blockName,
            s.entrance,
            s.registeredFloorDefinition,
            s.registeredQuality,
            s.registeredInstallation,
            s.propertyLot,
            s.planNetArea > 0 ? s.planNetArea.toFixed(2) : '-1',
            s.planGrossArea > 0 ? s.planGrossArea.toFixed(2) : '-1',
            info?.maksIdentityNumber ?? '',
            info?.maksNumaratajIdentityNumber ?? '',
            sp?.usage ?? 1001,
            dirs.join('|'),
            m.adSoyadVeyaUnvan,
            m.tcKimlikVeyaVergiNo ?? '',
            `${m.hissePay.toString()}/${m.hissePayda.toString()}`,
          ].join(';')
        );
      }
    }
  }
  return rows.join('\r\n') + '\r\n';
}
