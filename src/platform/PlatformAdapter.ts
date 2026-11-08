// K100
// K91
/**
 * Platform soyutlama arayüzü (`src/platform/PlatformAdapter.ts`).
 * `src/core/` modülleri doğrudan DOM (`window`, `document`) veya Node (`fs`, `path`)
 * API'lerine bağımlı olmaz; tüm dosya okuma/yazma işlemleri bu arayüz üzerinden yürütülür.
 */
export interface PlatformFileEntry {
  readonly path: string;
  readonly sizeBytes: number;
  readonly content: string | Uint8Array;
}

export interface PlatformAdapter {
  readonly platformName: 'web-preview' | 'node-cli' | 'electron-desktop';
  readTextFile(path: string): Promise<string>;
  readBinaryFile(path: string): Promise<Uint8Array>;
  writeTextFile(path: string, content: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
}

/**
 * Bellekte çalışan deterministik platform adaptörü (birim testler ve web önizlemesi için).
 */
export class InMemoryPlatformAdapter implements PlatformAdapter {
  public readonly platformName: 'web-preview' | 'node-cli' | 'electron-desktop';
  private readonly files = new Map<string, Uint8Array>();
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder('utf-8');

  constructor(
    initialFiles: Record<string, string | Uint8Array> = {},
    platformName: 'web-preview' | 'node-cli' | 'electron-desktop' = 'web-preview'
  ) {
    this.platformName = platformName;
    for (const [filePath, data] of Object.entries(initialFiles)) {
      const normalized = this.normalizePath(filePath);
      this.files.set(
        normalized,
        typeof data === 'string' ? this.encoder.encode(data) : new Uint8Array(data)
      );
    }
  }

  private normalizePath(p: string): string {
    return p.replace(/\\/g, '/').replace(/^\/+/, '');
  }

  public async readTextFile(path: string): Promise<string> {
    const bytes = await this.readBinaryFile(path);
    return this.decoder.decode(bytes);
  }

  public async readBinaryFile(path: string): Promise<Uint8Array> {
    const normalized = this.normalizePath(path);
    const found = this.files.get(normalized);
    if (!found) {
      throw new Error(`Dosya bulunamadı: ${normalized}`);
    }
    return new Uint8Array(found);
  }

  public async writeTextFile(path: string, content: string): Promise<void> {
    const normalized = this.normalizePath(path);
    this.files.set(normalized, this.encoder.encode(content));
  }

  public async fileExists(path: string): Promise<boolean> {
    const normalized = this.normalizePath(path);
    return this.files.has(normalized);
  }
}
