/// <reference lib="webworker" />
// G1 (PERF-01): Büyük CityGML dosyalarını (örn. Ornek3 39.7 MB) ana iş parçacığını dondurmadan
// arka planda okuyan ve poligon köşelerini Float64Array (Transferable ArrayBuffer) ile sıfır kopya aktaran Web Worker.

import {
  GmlReadProgress,
  ImportedModel,
  packModelPolygonVerticesFloat64,
  parseCityGmlModel,
} from '../core/gml/gmlReader.ts';
import { getOfflineCodelistRegistry } from '../data/offlineFixtures.ts';
import { validateCityGml, type ValidationReport } from '../core/validation/index.ts';

export interface GmlWorkerRequest {
  readonly type: 'PARSE_GML';
  readonly xmlContent: string;
  readonly fileName: string;
}

export type GmlWorkerResponse =
  | {
      readonly type: 'PROGRESS';
      readonly progress: GmlReadProgress;
    }
  | {
      readonly type: 'SUCCESS';
      readonly strippedModel: ImportedModel;
      readonly packedVerticesBuffer: ArrayBuffer;
      readonly durationMs: number;
      readonly validation: ValidationReport;
    }
  | {
      readonly type: 'ERROR';
      readonly message: string;
    };

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<GmlWorkerRequest>) => {
  const msg = event.data;
  if (!msg || msg.type !== 'PARSE_GML') return;

  const t0 = performance.now();
  try {
    const registry = getOfflineCodelistRegistry();
    const model = parseCityGmlModel(msg.xmlContent, msg.fileName, registry, {
      onProgress: (progress) => {
        const progressMsg: GmlWorkerResponse = {
          type: 'PROGRESS',
          progress,
        };
        ctx.postMessage(progressMsg);
      },
    });

    ctx.postMessage({
      type: 'PROGRESS',
      progress: {
        percent: 96,
        phase: 'Poligon köşeleri Float64Array tamponuna paketleniyor (Zero-Copy Transfer)',
        detail: `${model.polygons.length} poligon`,
      },
    } satisfies GmlWorkerResponse);

    // M2: Dosya doğrulayıcı (şartname §6) arka planda, model paketlenmeden önce çalışır.
    ctx.postMessage({
      type: 'PROGRESS',
      progress: { percent: 90, phase: 'Doğrulama kuralları çalıştırılıyor (M2)', detail: ` poligon` },
    } satisfies GmlWorkerResponse);
    const validation = validateCityGml(msg.xmlContent, msg.fileName, model, registry);

    const { strippedModel, packedBuffer } = packModelPolygonVerticesFloat64(model);
    const durationMs = Math.round(performance.now() - t0);
    const transferBuffer = packedBuffer.buffer as ArrayBuffer;

    const response: GmlWorkerResponse = {
      type: 'SUCCESS',
      strippedModel,
      packedVerticesBuffer: transferBuffer,
      durationMs,
      validation,
    };

    ctx.postMessage(response, [transferBuffer]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.postMessage({
      type: 'ERROR',
      message,
    } satisfies GmlWorkerResponse);
  }
};
