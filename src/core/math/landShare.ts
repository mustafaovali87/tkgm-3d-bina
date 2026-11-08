// K27
// K31
// K61
// K84
// V-076
// V-133
// V-198
// V-198a
// V-198b
// V-199
// V-212
import { ValidationIssue } from '../model/index.ts';

/**
 * `BigInt` tabanlı rasyonel kesir (`pay / payda`).
 */
export interface BigIntFraction {
  readonly numerator: bigint;
  readonly denominator: bigint;
}

/**
 * İki `bigint` sayının en büyük ortak bölenini (`EBOB / GCD`) hesaplar (`// K84`).
 */
// K84
export function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x === 0n ? 1n : x;
}

/**
 * Kesri en sade haline (`gcd` ile bölerek) getirir (`// K84`).
 */
// K84
export function reduceBigIntFraction(
  numerator: bigint,
  denominator: bigint
): BigIntFraction {
  if (denominator === 0n) {
    throw new Error('Payda sıfır olamaz.');
  }
  const sign = denominator < 0n ? -1n : 1n;
  const num = numerator * sign;
  const den = denominator * sign;
  if (num === 0n) {
    return { numerator: 0n, denominator: 1n };
  }
  const common = gcdBigInt(num, den);
  return {
    numerator: num / common,
    denominator: den / common,
  };
}

/**
 * İki `BigIntFraction` değerini toplar ve sadeleştirir (`// K84`).
 */
// K84
export function addBigIntFractions(
  a: BigIntFraction,
  b: BigIntFraction
): BigIntFraction {
  const num = a.numerator * b.denominator + b.numerator * a.denominator;
  const den = a.denominator * b.denominator;
  return reduceBigIntFraction(num, den);
}

/**
 * Kesri `"pay/payda"` metnine dönüştürür.
 */
export function formatBigIntFraction(fraction: BigIntFraction): string {
  return `${fraction.numerator.toString()}/${fraction.denominator.toString()}`;
}

/**
 * Türkçe büyük harf normalizasyonu (`// K61`, `// K84`).
 */
// K61
// K84
export function normalizeTurkishUpper(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toLocaleUpperCase('tr-TR');
}

export interface ParsedPropertyLotResult {
  readonly raw: string;
  readonly cleanPropertyLot: string;
  readonly hadWhitespace: boolean;
  readonly isValid: boolean;
  readonly fraction: BigIntFraction | null;
  readonly unreducedFraction: BigIntFraction | null;
  readonly issues: readonly ValidationIssue[];
}

/**
 * `propertyLot` (`"pay/payda"`) metnini ayrıştırır (`// K27`, `// K84`, `// V-133`, `// V-198`, `// V-198a`, `// V-198b`).
 */
// K27
// K84
// V-133
// V-198
// V-198a
// V-198b
export function parsePropertyLot(
  rawLot: string,
  targetGmlId?: string
): ParsedPropertyLotResult {
  const issues: ValidationIssue[] = [];
  const hadWhitespace = /\s/.test(rawLot);
  const clean = rawLot.replace(/\s+/g, '');

  if (hadWhitespace && clean.length > 0) {
    issues.push({
      ruleId: 'V-198',
      severity: 'B',
      message: `propertyLot değerinde boşluk karakteri tespit edildi ve temizlendi: "${rawLot}" -> "${clean}".`,
      targetGmlId,
    });
  }

  const match = /^(\d+)\/(\d+)$/.exec(clean);
  if (!match) {
    issues.push({
      ruleId: 'V-198a',
      severity: 'H',
      message: `propertyLot biçimi geçersiz ("pay/payda" bekleniyor, girilen: "${rawLot}").`,
      targetGmlId,
    });
    return {
      raw: rawLot,
      cleanPropertyLot: clean,
      hadWhitespace,
      isValid: false,
      fraction: null,
      unreducedFraction: null,
      issues,
    };
  }

  const pay = BigInt(match[1]);
  const payda = BigInt(match[2]);

  if (payda <= 0n || pay < 0n || pay > payda) {
    issues.push({
      ruleId: 'V-198a',
      severity: 'H',
      message: `propertyLot sınır hatası (0 <= pay <= payda ve payda > 0 olmalı, girilen: "${clean}").`,
      targetGmlId,
    });
    return {
      raw: rawLot,
      cleanPropertyLot: clean,
      hadWhitespace,
      isValid: false,
      fraction: null,
      unreducedFraction: null,
      issues,
    };
  }

  if (pay === 0n) {
    issues.push({
      ruleId: 'V-198b',
      severity: 'U',
      message: `propertyLot payı sıfır ("${clean}").`,
      targetGmlId,
    });
  }

  const unreduced: BigIntFraction = { numerator: pay, denominator: payda };
  const reduced = reduceBigIntFraction(pay, payda);

  return {
    raw: rawLot,
    cleanPropertyLot: `${pay.toString()}/${payda.toString()}`,
    hadWhitespace,
    isValid: true,
    fraction: reduced,
    unreducedFraction: unreduced,
    issues,
  };
}

export interface IndependentSectionShareInput {
  readonly gmlId?: string;
  readonly blockName: string;
  readonly entrance: string;
  readonly independentSectionNumber: string;
  readonly propertyLot: string;
  readonly registeredQuality: string;
}

/**
 * Bağımsız bölümün 5'li birleşik tekil anahtarını üretir (`// K31`, `// K84`, `CLAUDE9 N32`):
 * `(blockName, entrance, independentSectionNumber, cleanPropertyLot, normalizedQuality)`
 */
// K31
// K84
export function computeCompositeBbKey(input: IndependentSectionShareInput): {
  readonly compositeKey: string;
  readonly shortBbKey: string;
  readonly cleanPropertyLot: string;
  readonly normalizedQuality: string;
  readonly parsedLot: ParsedPropertyLotResult;
} {
  const block = input.blockName.trim();
  const entrance = input.entrance.trim();
  const bbNo = input.independentSectionNumber.trim();
  const parsedLot = parsePropertyLot(input.propertyLot, input.gmlId);
  const normQuality = normalizeTurkishUpper(input.registeredQuality);

  const shortBbKey = `${block}|${entrance}|${bbNo}`;
  const compositeKey = `${block}|${entrance}|${bbNo}|${parsedLot.cleanPropertyLot}|${normQuality}`;

  return {
    compositeKey,
    shortBbKey,
    cleanPropertyLot: parsedLot.cleanPropertyLot,
    normalizedQuality: normQuality,
    parsedLot,
  };
}

export interface BuildingLandShareAnalysis {
  readonly totalPartObjects: number;
  readonly uniqueBbCount: number; // K31, V-076 (5'li birleşik anahtar sayısı)
  readonly uniqueShortBbNoCount: number; // 3'lü (blockName, entrance, bbNo) sayısı
  readonly totalShareReduced: BigIntFraction;
  readonly totalShareUnreduced: BigIntFraction; // Ortak payda korunarak toplam (örn. 103500/104683)
  readonly diffFromOneReduced: BigIntFraction; // total - 1
  readonly diffFromOneUnreduced: BigIntFraction; // ortak paydada pay - payda (örn. -1183/104683)
  readonly isCompleteShareEqualOne: boolean;
  readonly issues: readonly ValidationIssue[];
}

/**
 * Binadaki tüm BB parçalarının arsa paylarını ve benzersiz BB sayısını `BigInt` ile analiz eder
 * (`// K31`, `// K84`, `// V-076`, `// V-198`, `// V-198a`, `// V-198b`, `// V-199`, `// V-212`).
 * - Dubleks/tripleks parçalar aynı 5'li anahtarı taşıdığı için arsa payı toplamına **1 kez** katılır (`K30`, `K31`).
 * - `Ornek1 #41` gibi aynı `(blockName, entrance, independentSectionNumber)` altında farklı `propertyLot`
 *   veya farklı `registeredQuality` taşıyan kayıtlar ayrı BB olarak sayılır ve `V-212 UYARI` üretilir (`N32`).
 * - Toplam arsa payı `≠ 1` ise `V-199 BİLGİ` üretilir (`FUA5P9`: `103500/104683`).
 */
// K31
// K84
// V-076
// V-198
// V-198a
// V-198b
// V-199
// V-212
export function analyzeBuildingLandShares(
  sections: readonly IndependentSectionShareInput[]
): BuildingLandShareAnalysis {
  const issues: ValidationIssue[] = [];
  const uniqueByComposite = new Map<
    string,
    {
      readonly input: IndependentSectionShareInput;
      readonly shortBbKey: string;
      readonly cleanPropertyLot: string;
      readonly normalizedQuality: string;
      readonly parsedLot: ParsedPropertyLotResult;
    }
  >();

  const compositeKeysByShortKey = new Map<string, Set<string>>();

  for (const sec of sections) {
    const computed = computeCompositeBbKey(sec);
    issues.push(...computed.parsedLot.issues);

    if (!uniqueByComposite.has(computed.compositeKey)) {
      uniqueByComposite.set(computed.compositeKey, {
        input: sec,
        shortBbKey: computed.shortBbKey,
        cleanPropertyLot: computed.cleanPropertyLot,
        normalizedQuality: computed.normalizedQuality,
        parsedLot: computed.parsedLot,
      });
    }

    let setForShort = compositeKeysByShortKey.get(computed.shortBbKey);
    if (!setForShort) {
      setForShort = new Set<string>();
      compositeKeysByShortKey.set(computed.shortBbKey, setForShort);
    }
    setForShort.add(computed.compositeKey);
  }

  // V-212 kontrolü: Aynı (blockName, entrance, bbNo) altında farklı pay veya nitelik taşıyan kayıtlar
  for (const [shortKey, compSet] of compositeKeysByShortKey.entries()) {
    if (compSet.size > 1) {
      const details = Array.from(compSet)
        .map((ck) => {
          const item = uniqueByComposite.get(ck)!;
          return `[pay=${item.cleanPropertyLot}, nitelik=${item.normalizedQuality}]`;
        })
        .join(', ');
      issues.push({
        ruleId: 'V-212',
        severity: 'U',
        message: `Aynı bağımsız bölüm anahtarı (${shortKey}) altında farklı arsa payı veya nitelik taşıyan ${compSet.size} ayrı BB kaydı bulundu: ${details}.`,
      });
    }
  }

  let sumReduced: BigIntFraction = { numerator: 0n, denominator: 1n };
  let commonDenominator: bigint | null = null;
  let sameDenominator = true;
  let sumSameDenomNumerator = 0n;

  for (const item of uniqueByComposite.values()) {
    const frac = item.parsedLot.fraction;
    const unred = item.parsedLot.unreducedFraction;
    if (frac && unred) {
      sumReduced = addBigIntFractions(sumReduced, frac);
      if (commonDenominator === null) {
        commonDenominator = unred.denominator;
        sumSameDenomNumerator = unred.numerator;
      } else if (commonDenominator === unred.denominator) {
        sumSameDenomNumerator += unred.numerator;
      } else {
        sameDenominator = false;
      }
    }
  }

  const totalShareUnreduced: BigIntFraction =
    sameDenominator && commonDenominator !== null
      ? { numerator: sumSameDenomNumerator, denominator: commonDenominator }
      : sumReduced;

  const diffFromOneReduced = reduceBigIntFraction(
    sumReduced.numerator - sumReduced.denominator,
    sumReduced.denominator
  );

  const diffFromOneUnreduced: BigIntFraction =
    sameDenominator && commonDenominator !== null
      ? {
          numerator: sumSameDenomNumerator - commonDenominator,
          denominator: commonDenominator,
        }
      : diffFromOneReduced;

  const isCompleteShareEqualOne =
    sumReduced.numerator === 1n && sumReduced.denominator === 1n;

  if (!isCompleteShareEqualOne && uniqueByComposite.size > 0) {
    issues.push({
      ruleId: 'V-199',
      severity: 'B',
      message: `Benzersiz bağımsız bölümlerin arsa payı toplamı 1 tam değil: ${formatBigIntFraction(
        totalShareUnreduced
      )} (sadeleşmiş: ${formatBigIntFraction(
        sumReduced
      )}, fark: ${formatBigIntFraction(
        diffFromOneUnreduced
      )}). Çok bloklu parselde blok toplamının < 1 olması normaldir.`,
    });
  }

  return {
    totalPartObjects: sections.length,
    uniqueBbCount: uniqueByComposite.size,
    uniqueShortBbNoCount: compositeKeysByShortKey.size,
    totalShareReduced: sumReduced,
    totalShareUnreduced,
    diffFromOneReduced,
    diffFromOneUnreduced,
    isCompleteShareEqualOne,
    issues,
  };
}
