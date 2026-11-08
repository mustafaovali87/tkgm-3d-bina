// G1 (PERF-01): Web Worker istemcisi — ilerleme bildirimi (onProgress) ve anında İptal (worker.terminate()) desteği.
import {
  GmlReadProgress,
  hydrateModelPolygonVerticesFloat64,
  ImportedModel,
  parseCityGmlModel,
} from '../core/gml/gmlReader.ts';
import { getOfflineCodelistRegistry } from '../data/offlineFixtures.ts';
import { validateCityGml, type ValidationReport } from '../core/validation/index.ts';
import type { GmlWorkerRequest, GmlWorkerResponse } from './gmlReader.worker.ts';

export interface GmlWorkerJob {
  readonly promise: Promise<{
    readonly model: ImportedModel;
    readonly durationMs: number;
    readonly validation: ValidationReport;
  }>;
  readonly cancel: () => void;
}

export class GmlWorkerCancelledError extends Error {
  constructor() {
    super('GML okuma işlemi kullanıcı tarafından iptal edildi.');
    this.name = 'GmlWorkerCancelledError';
  }
}

export function parseCityGmlInWorker(
  xmlContent: string,
  fileName: string,
  onProgress?: (progress: GmlReadProgress) => void
): GmlWorkerJob {
  // Web Worker desteklenmeyen ortamlarda (örn. eski gömülü ortam) yedek senkron çalışma
  if (typeof Worker === 'undefined') {
    let cancelled = false;
    const promise = Promise.resolve().then(() => {
      const t0 = performance.now();
      const model = parseCityGmlModel(
        xmlContent,
        fileName,
        getOfflineCodelistRegistry(),
        {
          onProgress: (p) => {
            if (!cancelled) onProgress?.(p);
          },
        }
      );
      if (cancelled) throw new GmlWorkerCancelledError();
      const validation = validateCityGml(xmlContent, fileName, model, getOfflineCodelistRegistry());
      return { model, durationMs: Math.round(performance.now() - t0), validation };
    });
    return {
      promise,
      cancel: () => {
        cancelled = true;
      },
    };
  }

  const worker = new Worker(
    new URL('./gmlReader.worker.ts', import.meta.url),
    { type: 'module' }
  );

  let rejectFn: ((reason?: unknown) => void) | null = null;
  let isSettled = false;

  const promise = new Promise<{
    readonly model: ImportedModel;
    readonly durationMs: number;
    readonly validation: ValidationReport;
  }>((resolve, reject) => {
    rejectFn = reject;

    worker.onmessage = (event: MessageEvent<GmlWorkerResponse>) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'PROGRESS') {
        onProgress?.(data.progress);
        return;
      }

      if (data.type === 'SUCCESS') {
        isSettled = true;
        worker.terminate();
        const packedFloat64 = new Float64Array(data.packedVerticesBuffer);
        const hydrated = hydrateModelPolygonVerticesFloat64(
          data.strippedModel,
          packedFloat64
        );
        onProgress?.({
          percent: 100,
          phase: 'Tamamlandı',
          detail: `${hydrated.objects.length} nesne, ${hydrated.polygons.length} poligon (${data.durationMs} ms)`,
        });
        resolve({
          model: hydrated,
          durationMs: data.durationMs,
          validation: data.validation,
        });
        return;
      }

      if (data.type === 'ERROR') {
        isSettled = true;
        worker.terminate();
        reject(new Error(data.message));
      }
    };

    worker.onerror = (err) => {
      isSettled = true;
      worker.terminate();
      reject(new Error(err.message || 'Web Worker GML okuma hatası'));
    };

    const req: GmlWorkerRequest = {
      type: 'PARSE_GML',
      xmlContent,
      fileName,
    };
    worker.postMessage(req);
  });

  const cancel = () => {
    if (!isSettled) {
      isSettled = true;
      worker.terminate();
      rejectFn?.(new GmlWorkerCancelledError());
    }
  };

  return { promise, cancel };
}
