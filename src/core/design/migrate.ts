// P-24 — Proje Dosyası Şema Göçü (v1 -> v2)
// Şartname Ek-1 §2.9 / P-24:
// - Eski (v1) proje dosyalarında eksik olan alanları (openings, info, sectionInfo,
//   cardinalDirections, balconies, roof, tic, installations) varsayılan değerlerle tamamlar.
// - schemaVersion: 2 olarak günceller.
// - Saf TS, deterministik.

import type { DesignProject, DesignBuilding } from './types.ts';
import { DEFAULT_BUILDING_INFO, DEFAULT_SECTION_INFO, DEFAULT_ROOF } from './types.ts';
import { recommendBuildingCardinalDirections } from './cardinalDirection.ts';

export function migrateProject(rawProject: any): DesignProject {
  const version = rawProject.schemaVersion ?? 1;

  const migratedBuildings: DesignBuilding[] = (rawProject.buildings ?? []).map((b: any) => {
    const info = b.info ? { ...DEFAULT_BUILDING_INFO, ...b.info } : { ...DEFAULT_BUILDING_INFO };
    
    // sectionInfo doldur
    const sectionInfo: Record<string, any> = {};
    for (const sec of b.sections ?? []) {
      const existing = b.sectionInfo?.[sec.id];
      sectionInfo[sec.id] = existing ? { ...DEFAULT_SECTION_INFO, ...existing } : { ...DEFAULT_SECTION_INFO };
    }

    const buildingBase: DesignBuilding = {
      id: b.id,
      letter: b.letter ?? 'A',
      storeys: b.storeys ?? [],
      sections: b.sections ?? [],
      sectionParts: b.sectionParts ?? [],
      parts: b.parts ?? [],
      openings: b.openings ?? [],
      installations: b.installations ?? [],
      info,
      sectionInfo,
      balconies: b.balconies ?? [],
      roof: b.roof ? { ...DEFAULT_ROOF, ...b.roof } : { ...DEFAULT_ROOF },
      tic: b.tic,
    };

    // cardinalDirections yoksa veya boşsa otomatik öner
    const cardinalDirections =
      b.cardinalDirections && Object.keys(b.cardinalDirections).length > 0
        ? b.cardinalDirections
        : recommendBuildingCardinalDirections(buildingBase);

    return {
      ...buildingBase,
      cardinalDirections,
    };
  });

  return {
    schemaVersion: 2,
    id: rawProject.id,
    name: rawProject.name ?? 'Proje',
    idSeq: rawProject.idSeq ?? 1000,
    georef: rawProject.georef,
    parcel: rawProject.parcel,
    buildings: migratedBuildings,
  };
}
