// K12
// K89
// K92
// V-050
// V-051
import { ObjectIdPrefix, PolygonIdPrefix, ProducerProfile, RingIdPrefix } from '../model/index.ts';

/**
 * TKGM 3B Bina projesi sabit UUIDv5 ad alanı (`K92`, `docs/KARARLAR.md §A.2`).
 * Kalıcı olarak kilitlenmiştir; tüm sürümlerde aynı deterministik `gml:id` üretimini garanti eder.
 */
export const TKGM3D_UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

/**
 * Saf TypeScript UTF-8 kodlayıcı (`tsconfig.core.json` `lib: ["ES2022"], types: []` altında
 * DOM/Node `TextEncoder` globaline ihtiyaç duymadan çalışır — `F3`).
 */
export function utf8Encode(str: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      const c2 = str.charCodeAt(i + 1);
      if (c2 >= 0xdc00 && c2 <= 0xdfff) {
        c = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
        bytes.push(
          0xf0 | (c >> 18),
          0x80 | ((c >> 12) & 0x3f),
          0x80 | ((c >> 6) & 0x3f),
          0x80 | (c & 0x3f)
        );
        i++;
      } else {
        bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    } else {
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

/**
 * İşletim sistemi yerel ayarından (`tr-TR`, `en-US` vb.) bağımsız deterministik UTF-16 kod birimi karşılaştırması (`F2`, `K89`).
 */
export function compareCodeUnits(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function rotr32(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

function rotl32(x: number, n: number): number {
  return (x << n) | (x >>> (32 - n));
}

/**
 * Saf TypeScript SHA-256 uygulaması (`src/core/` içinde Node `crypto` veya `window.crypto` bağımlılığı olmadan çalışır).
 */
// K89
export function sha256Bytes(data: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLen = BigInt(data.length) * 8n;
  const padLen = ((56 - ((data.length + 1) % 64)) + 64) % 64;
  const totalLen = data.length + 1 + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(data);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setBigUint64(totalLen - 8, bitLen, false);

  const w = new Uint32Array(64);

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(w[i - 15], 7) ^ rotr32(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr32(w[i - 2], 17) ^ rotr32(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// K89
export function sha256Hex(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? utf8Encode(input) : input;
  return bytesToHex(sha256Bytes(bytes));
}

/**
 * RFC 4122 `uuidv5` için saf TypeScript SHA-1 hesaplayıcısı (`// K92`).
 */
function sha1Bytes(data: Uint8Array): Uint8Array {
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const bitLen = BigInt(data.length) * 8n;
  const padLen = ((56 - ((data.length + 1) % 64)) + 64) % 64;
  const totalLen = data.length + 1 + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(data);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setBigUint64(totalLen - 8, bitLen, false);

  const w = new Uint32Array(80);

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 80; i++) {
      w[i] = rotl32(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i++) {
      let f = 0;
      let k = 0;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (rotl32(a, 5) + f + e + k + w[i]) >>> 0;
      e = d;
      d = c;
      c = rotl32(b, 30) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const out = new Uint8Array(20);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  return out;
}

function uuidToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error(`Geçersiz UUID ad alanı: "${uuid}"`);
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * RFC 4122 uyumlu deterministik `uuidv5` üretir (`// K12`, `// K92`, `// V-051`).
 * Süslü parantez içermez, küçük harf `[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}` biçimindedir.
 */
// K12
// K92
// V-051
export function uuidv5(
  name: string,
  namespace: string = TKGM3D_UUID_NAMESPACE
): string {
  const nsBytes = uuidToBytes(namespace);
  const nameBytes = utf8Encode(name);
  const combined = new Uint8Array(nsBytes.length + nameBytes.length);
  combined.set(nsBytes, 0);
  combined.set(nameBytes, nsBytes.length);

  const hash = sha1Bytes(combined);
  const bytes = hash.slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Nesne, Poligon veya LinearRing için deterministik `gml:id` üretir (`// K12`, `// K92`, `// V-050`, `// V-051`, `// V-052`, `// V-053`, `// V-055`).
 */
// K12
// K92
// V-050
// V-051
export function deterministicGmlId(
  prefix: ObjectIdPrefix | PolygonIdPrefix | RingIdPrefix,
  projectSeed: string,
  entityPath: string
): string {
  const guid = uuidv5(`${projectSeed}::${prefix}::${entityPath}`);
  return `${prefix}${guid}`;
}

export interface CanonicalModelHashInput {
  readonly schemaVersion: string;
  readonly producerProfile: ProducerProfile;
  readonly codelistsCombinedSha256: string;
  readonly buildingAttributes: Record<string, string | number | bigint | boolean | null>;
  readonly coordinatesMm: readonly number[];
  readonly objectAttributes: ReadonlyArray<{
    readonly gmlId: string;
    readonly attributes: Record<string, string | number | bigint | boolean | null | readonly number[]>;
  }>;
}

export interface IgnoredUiViewState {
  readonly cameraPosition?: readonly [number, number, number];
  readonly selectedGmlId?: string | null;
  readonly activeTab?: string;
  readonly zoomLevel?: number;
  readonly darkMode?: boolean;
  readonly preset?: string;
  readonly panelSizes?: Readonly<Record<string, number>>;
  readonly groupLayouts?: Readonly<Record<string, unknown>>;
  readonly activeStoreyId?: string | null;
  readonly explosionFactor?: number;
  readonly narrowViewportTabs?: boolean;
  readonly narrowCenterTab?: string;
}

function canonicalStringifyValue(val: unknown): string {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'bigint') return `"bigint:${val.toString()}"`;
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'null';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'string') return JSON.stringify(val);
  if (Array.isArray(val)) {
    return `[${val.map((item) => canonicalStringifyValue(item)).join(',')}]`;
  }
  if (typeof val === 'object') {
    const record = val as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort(compareCodeUnits);
    const parts = sortedKeys.map(
      (k) => `${JSON.stringify(k)}:${canonicalStringifyValue(record[k])}`
    );
    return `{${parts.join(',')}}`;
  }
  return JSON.stringify(String(val));
}

/**
 * Doğrulama raporunun bağlandığı deterministik **SHA-256 Kanonik Model Özeti** (`// K89`, `F2`).
 * - Geometri (mm), öznitelikler, üretici profili (`A10/B50/C50`), kod listesi özeti veya şema sürümü değişirse özet değişir.
 * - Kamera konumu, seçili nesne, aktif sekme veya yakınlaştırma gibi arayüz (`uiViewState`) durumları özeti **kesinlikle değiştirmez**.
 * - Sıralama yerel ayardan (`localeCompare`) bağımsız deterministik UTF-16 kod birimi (`compareCodeUnits`) ile yapılır.
 */
// K89
export function computeCanonicalModelHash(
  modelInput: CanonicalModelHashInput,
  _ignoredUiState?: IgnoredUiViewState
): string {
  const canonicalPayload = {
    schemaVersion: modelInput.schemaVersion,
    producerProfile: modelInput.producerProfile,
    codelistsCombinedSha256: modelInput.codelistsCombinedSha256,
    buildingAttributes: modelInput.buildingAttributes,
    coordinatesMm: modelInput.coordinatesMm,
    objectAttributes: [...modelInput.objectAttributes].sort((a, b) =>
      compareCodeUnits(a.gmlId, b.gmlId)
    ),
  };

  const serialized = canonicalStringifyValue(canonicalPayload);
  return sha256Hex(serialized);
}
