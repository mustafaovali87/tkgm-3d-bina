// K91: Sıfır çalışma anı ağ isteği — 15 resmi referans dosyası derleme anında (?raw) gömülür.
import ornek6GmlRaw from '../../fixtures/ornek6.gml?raw';
import buildingGeometrySuitabilityXml from '../../resources/codelists/buildingGeometrySuitability.xml?raw';
import buildingTypeXml from '../../resources/codelists/buildingType.xml?raw';
import cardinalDirectionXml from '../../resources/codelists/cardinalDirection.xml?raw';
import doorUsageXml from '../../resources/codelists/doorUsage.xml?raw';
import independentSectionGeometrySuitabilityXml from '../../resources/codelists/independentSectionGeometrySuitability.xml?raw';
import independentSectionPartGeometrySuitabilityXml from '../../resources/codelists/independentSectionPartGeometrySuitability.xml?raw';
import independentSectionUsageXml from '../../resources/codelists/independentSectionUsage.xml?raw';
import integrationStateXml from '../../resources/codelists/integrationState.xml?raw';
import maksConstructionIntegrationStateXml from '../../resources/codelists/maksConstructionIntegrationState.xml?raw';
import maksIndependentSectionIntegrationStateXml from '../../resources/codelists/maksIndependentSectionIntegrationState.xml?raw';
import partUsageXml from '../../resources/codelists/partUsage.xml?raw';
import roomInstallationUsageXml from '../../resources/codelists/roomInstallationUsage.xml?raw';
import storeyUsageXml from '../../resources/codelists/storeyUsage.xml?raw';
import windowUsageXml from '../../resources/codelists/windowUsage.xml?raw';
import {
  CodelistRegistry,
  createCodelistRegistryFromXmlMap,
  OfficialCodelistName,
} from '../core/codelists/index.ts';
import { ImportedModel, parseCityGmlModel } from '../core/gml/gmlReader.ts';

export const OFFLINE_CODELIST_XML_MAP: Readonly<Record<OfficialCodelistName, string>> = {
  buildingGeometrySuitability: buildingGeometrySuitabilityXml,
  buildingType: buildingTypeXml,
  cardinalDirection: cardinalDirectionXml,
  doorUsage: doorUsageXml,
  independentSectionGeometrySuitability: independentSectionGeometrySuitabilityXml,
  independentSectionPartGeometrySuitability: independentSectionPartGeometrySuitabilityXml,
  independentSectionUsage: independentSectionUsageXml,
  integrationState: integrationStateXml,
  maksConstructionIntegrationState: maksConstructionIntegrationStateXml,
  maksIndependentSectionIntegrationState: maksIndependentSectionIntegrationStateXml,
  partUsage: partUsageXml,
  roomInstallationUsage: roomInstallationUsageXml,
  storeyUsage: storeyUsageXml,
  windowUsage: windowUsageXml,
};

let cachedRegistry: CodelistRegistry | null = null;
let cachedOrnek6Model: ImportedModel | null = null;

export function getOfflineCodelistRegistry(): CodelistRegistry {
  if (!cachedRegistry) {
    cachedRegistry = createCodelistRegistryFromXmlMap(OFFLINE_CODELIST_XML_MAP);
  }
  return cachedRegistry;
}

export function getDefaultOrnek6Model(): ImportedModel {
  if (!cachedOrnek6Model) {
    cachedOrnek6Model = parseCityGmlModel(
      ornek6GmlRaw,
      'Ornek6-M-70125626-A.gml',
      getOfflineCodelistRegistry()
    );
  }
  return cachedOrnek6Model;
}

export const ORNEK6_RAW_XML = ornek6GmlRaw;
