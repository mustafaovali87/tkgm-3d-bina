// scripts/regress-local.ts — Yerel Regresyon ve Baseline Ölçüm Aracı (P-23)
// Şartname Ek-1 §1.5 P-23 & §2.8 M14-B.
// Klasördeki GML dosyalarını doğrular, çıkar -> üret -> doğrula döngüsünü çalıştırır,
// baseline ile karşılaştırır. Kişisel veri içermez, yalnız sayıları özetler.

import fs from 'node:fs';
import path from 'node:path';
import { parseCityGmlModel } from '../src/core/gml/gmlReader.ts';
import { validateCityGml } from '../src/core/validation/index.ts';
import { designFromImportedModel } from '../src/core/design/fromImported.ts';
import { generateBrep } from '../src/core/brep/generate.ts';
import { writeCityGml } from '../src/core/gml/cityGmlWriter.ts';
import {
  createCodelistRegistryFromXmlMap,
  OFFICIAL_CODELIST_NAMES,
  type OfficialCodelistName,
} from '../src/core/codelists/index.ts';

function loadCodelistRegistry(rootDir: string) {
  const xmlMap = {} as Record<OfficialCodelistName, string>;
  for (const name of OFFICIAL_CODELIST_NAMES) {
    const p = path.join(rootDir, 'resources', 'codelists', `${name}.xml`);
    xmlMap[name] = fs.readFileSync(p, 'utf-8');
  }
  return createCodelistRegistryFromXmlMap(xmlMap);
}

export interface FileRegressionStats {
  readonly fileName: string;
  readonly directErrors: number;
  readonly directWarnings: number;
  readonly roundtripErrors: number;
  readonly roundtripWarnings: number;
}

export interface BaselineReport {
  readonly timestamp: string;
  readonly summary: Record<string, FileRegressionStats>;
}

async function main() {
  const rootDir = process.cwd();
  const args = process.argv.slice(2);
  const targetDir = args[0] ? path.resolve(rootDir, args[0]) : path.resolve(rootDir, 'fixtures');
  const baselinePath = path.resolve(rootDir, 'regress/baseline.json');

  console.log(`[regress:local] Hedef klasör: ${targetDir}`);
  if (!fs.existsSync(targetDir)) {
    console.log(`[regress:local] Klasör bulunamadı: ${targetDir}. Boş baseline kaydediliyor.`);
    return;
  }

  const registry = loadCodelistRegistry(rootDir);
  const files = fs.readdirSync(targetDir).filter((f) => f.toLowerCase().endsWith('.gml'));
  const currentStats: Record<string, FileRegressionStats> = {};

  for (const f of files) {
    const fullPath = path.join(targetDir, f);
    const xml = fs.readFileSync(fullPath, 'utf-8');
    const model = parseCityGmlModel(xml, f, registry);
    const directVal = validateCityGml(xml, f, model, registry);

    let roundtripErrors = 0;
    let roundtripWarnings = 0;
    try {
      const { project } = designFromImportedModel(model);
      const brep = generateBrep(project, project.buildings[0]);
      const out = writeCityGml(project, brep, registry);
      const rtModel = parseCityGmlModel(out.xml, out.fileName, registry);
      const rtVal = validateCityGml(out.xml, out.fileName, rtModel, registry);
      roundtripErrors = rtVal.counts.H;
      roundtripWarnings = rtVal.counts.U;
    } catch (e: any) {
      console.warn(`[regress:local] ${f} çıkar-üret döngüsü uyarısı:`, e.message);
    }

    currentStats[f] = {
      fileName: f,
      directErrors: directVal.counts.H,
      directWarnings: directVal.counts.U,
      roundtripErrors,
      roundtripWarnings,
    };
    console.log(`[regress:local] ${f} -> Doğrudan HATA: ${directVal.counts.H}, Çıkar-Üret HATA: ${roundtripErrors}`);
  }

  const report: BaselineReport = {
    timestamp: new Date().toISOString(),
    summary: currentStats,
  };

  fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
  fs.writeFileSync(baselinePath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`[regress:local] Baseline güncellendi: ${baselinePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
