// K88
// K99
// V-060
// V-208
import {
  addBigIntFractions,
  BigIntFraction,
  formatBigIntFraction,
  reduceBigIntFraction,
} from '../math/landShare.ts';
import {
  ALLOWED_GENERIC_ATTRIBUTES,
  ValidationIssue,
} from './index.ts';

/**
 * Kat İrtifakı / Malik Listesi veri modeli (`CLAUDE13 §1` — Kullanıcı Kararı `K88-yeni`).
 * - Bir bağımsız bölümde (`bbAnahtari`) birden fazla hissedar (`Malik`) bulunabilir.
 * - Malik bilgileri **yalnızca** proje dosyasında (`.tkgm3b` / `.tkgm3d`) ve kullanıcı raporlarında tutulur;
 *   **TKGM CityGML (`.gml`) dosyasına asla yazılmaz** (`K99`, `V-060`).
 */
export interface Malik {
  readonly bbAnahtari: string;
  readonly adSoyadVeyaUnvan: string;
  readonly tcKimlikVeyaVergiNo?: string;
  readonly hissePay: bigint;
  readonly hissePayda: bigint;
  readonly not?: string;
}

/**
 * Kullanıcı Kararı (`CLAUDE13 §1` — `K88-yeni`):
 * Tapu/beyan verileri ve malikler her zaman kullanıcı tarafından serbestçe düzenlenebilir.
 * İsteğe bağlı otomatik öneri ayarı varsayılan olarak `'kapali'`dır; `'acik'` olduğunda da
 * yalnız kullanıcı onayıyla yazar.
 */
export interface BeyanDuzenlemeAyar {
  readonly otomatikOneri: 'kapali' | 'acik';
  readonly tumAlanlarSerbestDuzenlenebilir: true;
}

export const DEFAULT_BEYAN_DUZENLEME_AYAR: BeyanDuzenlemeAyar = {
  otomatikOneri: 'kapali',
  tumAlanlarSerbestDuzenlenebilir: true,
};

export interface BbMalikShareSummary {
  readonly bbAnahtari: string;
  readonly malikSayisi: number;
  readonly toplamHisse: BigIntFraction;
  readonly tamHisseMi: boolean; // toplam == 1/1
  readonly issue: ValidationIssue | null;
}

/**
 * Bir bağımsız bölüme (`bbAnahtari`) ait maliklerin hisse payı toplamını `BigInt` ile hesaplar (`// K88`, `// V-208`).
 * - Toplam `1/1` değilse `V-208 BİLGİ (B)` üretir (GML doğrulamasını engellemez).
 */
// K88
// V-208
export function validateBbMalikShares(
  bbAnahtari: string,
  malikler: readonly Malik[]
): BbMalikShareSummary {
  const ilgiliMalikler = malikler.filter((m) => m.bbAnahtari === bbAnahtari);

  if (ilgiliMalikler.length === 0) {
    return {
      bbAnahtari,
      malikSayisi: 0,
      toplamHisse: { numerator: 0n, denominator: 1n },
      tamHisseMi: false,
      issue: null,
    };
  }

  let sum: BigIntFraction = { numerator: 0n, denominator: 1n };

  for (const m of ilgiliMalikler) {
    if (m.hissePayda <= 0n || m.hissePay <= 0n || m.hissePay > m.hissePayda) {
      return {
        bbAnahtari,
        malikSayisi: ilgiliMalikler.length,
        toplamHisse: sum,
        tamHisseMi: false,
        issue: {
          ruleId: 'V-208',
          severity: 'B',
          message: `Bağımsız bölüm (${bbAnahtari}) malik hissesi geçersiz aralıkta: ${m.hissePay.toString()}/${m.hissePayda.toString()} (${m.adSoyadVeyaUnvan}).`,
          targetGmlId: bbAnahtari,
        },
      };
    }

    const current = reduceBigIntFraction(m.hissePay, m.hissePayda);
    sum = addBigIntFractions(sum, current);
  }

  const tamHisseMi = sum.numerator === 1n && sum.denominator === 1n;

  const issue: ValidationIssue | null = tamHisseMi
    ? null
    : {
        ruleId: 'V-208',
        severity: 'B',
        message: `Bağımsız bölüm (${bbAnahtari}) malik hisse toplamı 1/1 değil (Hesaplanan: ${formatBigIntFraction(
          sum
        )}, Malik sayısı: ${ilgiliMalikler.length}).`,
        targetGmlId: bbAnahtari,
      };

  return {
    bbAnahtari,
    malikSayisi: ilgiliMalikler.length,
    toplamHisse: sum,
    tamHisseMi,
    issue,
  };
}

/**
 * Malik alanlarının (`adSoyadVeyaUnvan`, `tcKimlikVeyaVergiNo`, `hissePay`, `hissePayda`)
 * GML öznitelik beyaz listesinde (`ALLOWED_GENERIC_ATTRIBUTES`) kesinlikle yer almadığını doğrular (`// K88`, `// K99`, `// V-060`).
 */
// K88
// K99
// V-060
export function assertMalikNeverInGmlWhitelist(): boolean {
  const forbiddenMalikKeys = [
    'malik',
    'adSoyadVeyaUnvan',
    'tcKimlikVeyaVergiNo',
    'hissePay',
    'hissePayda',
  ];
  for (const entry of ALLOWED_GENERIC_ATTRIBUTES) {
    const [attrName] = entry.split(':');
    if (forbiddenMalikKeys.includes(attrName)) {
      throw new Error(`Güvenlik ihlali: Malik alanı (${attrName}) GML beyaz listesinde bulunamaz!`);
    }
  }
  return true;
}
