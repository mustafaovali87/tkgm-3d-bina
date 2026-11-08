// K60
// K91
// V-063
import { XMLParser } from 'fast-xml-parser';

/**
 * 14 Resmi TKGM XML Kod Listesi dosya adları (`resources/codelists/<ad>.xml`).
 * Not (`CLAUDE13 §4`): `commonAreaUsage.xml` adında ayrı bir dosya yoktur;
 * `commonAreaUsage` özniteliği `partUsage.xml` dosyasından doğrulanır.
 */
export const OFFICIAL_CODELIST_NAMES = [
  'buildingGeometrySuitability',
  'buildingType',
  'cardinalDirection',
  'doorUsage',
  'independentSectionGeometrySuitability',
  'independentSectionPartGeometrySuitability',
  'independentSectionUsage',
  'integrationState',
  'maksConstructionIntegrationState',
  'maksIndependentSectionIntegrationState',
  'partUsage',
  'roomInstallationUsage',
  'storeyUsage',
  'windowUsage',
] as const;

export type OfficialCodelistName = (typeof OFFICIAL_CODELIST_NAMES)[number];

/**
 * GML öznitelik adından ilgili resmi kod listesi adına eşleme tablosu (`V-063`).
 */
export type CodelistLookupKey =
  | OfficialCodelistName
  | 'commonAreaUsage';

export interface CodelistEntry {
  readonly code: number;
  readonly codeText: string;
  readonly description: string;
  readonly definitionGmlId: string;
}

export interface ParsedCodelist {
  readonly listName: OfficialCodelistName;
  readonly dictionaryNameInXml: string;
  readonly dictionaryGmlId: string;
  readonly entries: readonly CodelistEntry[];
  readonly byCode: ReadonlyMap<number, CodelistEntry>;
  readonly duplicateDefinitionIds: readonly string[];
}

export class CodelistRegistry {
  private readonly lists = new Map<OfficialCodelistName, ParsedCodelist>();

  constructor(parsedLists: readonly ParsedCodelist[]) {
    for (const item of parsedLists) {
      this.lists.set(item.listName, item);
    }
  }

  // K60
  // V-063
  public resolveListName(key: CodelistLookupKey): OfficialCodelistName {
    if (key === 'commonAreaUsage') {
      return 'partUsage';
    }
    return key;
  }

  public getList(key: CodelistLookupKey): ParsedCodelist {
    const resolved = this.resolveListName(key);
    const found = this.lists.get(resolved);
    if (!found) {
      throw new Error(`Kod listesi yüklü değil: ${resolved}`);
    }
    return found;
  }

  // V-063
  public isValidCode(key: CodelistLookupKey, code: number): boolean {
    const list = this.getList(key);
    return list.byCode.has(code);
  }

  public getDescription(key: CodelistLookupKey, code: number): string | undefined {
    const list = this.getList(key);
    return list.byCode.get(code)?.description;
  }

  public getAllLists(): readonly ParsedCodelist[] {
    return OFFICIAL_CODELIST_NAMES.map((name) => this.getList(name));
  }
}

interface RawDefinitionNode {
  '@_gml:id'?: string;
  '@_id'?: string;
  'gml:description'?: string | number;
  description?: string | number;
  'gml:name'?: string | number;
  name?: string | number;
}

interface RawDictionaryEntryNode {
  'gml:Definition'?: RawDefinitionNode | RawDefinitionNode[];
  Definition?: RawDefinitionNode | RawDefinitionNode[];
}

interface RawDictionaryRoot {
  'gml:Dictionary'?: {
    '@_gml:id'?: string;
    name?: string;
    'gml:name'?: string;
    dictionaryEntry?: RawDictionaryEntryNode | RawDictionaryEntryNode[];
    'gml:dictionaryEntry'?: RawDictionaryEntryNode | RawDictionaryEntryNode[];
  };
}

/**
 * Tek bir TKGM GML `Dictionary` XML metnini çevrimdışı ayrıştırır (`// K60`, `// K91`, `// V-063`).
 * `integrationState.xml` içindeki mükerrer `gml:id="id3"` durumunu hata vermeden okur
 * ve `duplicateDefinitionIds` alanında raporlar.
 */
// K60
// K91
// V-063
export function parseCodelistXml(
  listName: OfficialCodelistName,
  xmlContent: string
): ParsedCodelist {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
    parseTagValue: false,
  });

  const parsed = parser.parse(xmlContent) as RawDictionaryRoot;
  const dict = parsed['gml:Dictionary'];
  if (!dict) {
    throw new Error(`${listName}.xml içinde gml:Dictionary kök elemanı bulunamadı.`);
  }

  const dictionaryGmlId = String(dict['@_gml:id'] ?? '');
  const dictionaryNameInXml = String(dict.name ?? dict['gml:name'] ?? listName);

  const rawEntries = dict.dictionaryEntry ?? dict['gml:dictionaryEntry'] ?? [];
  const entryArray = Array.isArray(rawEntries) ? rawEntries : [rawEntries];

  const entries: CodelistEntry[] = [];
  const byCode = new Map<number, CodelistEntry>();
  const seenDefIds = new Set<string>();
  const duplicateDefIds: string[] = [];

  for (const rawEntry of entryArray) {
    const defNode = rawEntry['gml:Definition'] ?? rawEntry.Definition;
    if (!defNode) continue;
    const defs = Array.isArray(defNode) ? defNode : [defNode];

    for (const def of defs) {
      const defId = String(def['@_gml:id'] ?? def['@_id'] ?? '').trim();
      if (defId) {
        if (seenDefIds.has(defId)) {
          duplicateDefIds.push(defId);
        }
        seenDefIds.add(defId);
      }

      const codeText = String(def['gml:name'] ?? def.name ?? '').trim();
      const description = String(def['gml:description'] ?? def.description ?? '').trim();
      const code = Number.parseInt(codeText, 10);

      if (!Number.isFinite(code)) {
        throw new Error(`${listName}.xml içinde geçersiz kod değeri: "${codeText}"`);
      }

      const entry: CodelistEntry = {
        code,
        codeText,
        description,
        definitionGmlId: defId,
      };
      entries.push(entry);
      byCode.set(code, entry);
    }
  }

  return {
    listName,
    dictionaryNameInXml,
    dictionaryGmlId,
    entries,
    byCode,
    duplicateDefinitionIds: duplicateDefIds,
  };
}

/**
 * 14 resmi XML kod listesi haritasından `CodelistRegistry` oluşturur (`// K60`, `// V-063`).
 */
export function createCodelistRegistryFromXmlMap(
  xmlByListName: Record<OfficialCodelistName, string>
): CodelistRegistry {
  const parsedLists: ParsedCodelist[] = [];
  for (const name of OFFICIAL_CODELIST_NAMES) {
    const xml = xmlByListName[name];
    if (typeof xml !== 'string' || xml.trim().length === 0) {
      throw new Error(`Eksik veya boş kod listesi XML'i: ${name}`);
    }
    parsedLists.push(parseCodelistXml(name, xml));
  }
  return new CodelistRegistry(parsedLists);
}
