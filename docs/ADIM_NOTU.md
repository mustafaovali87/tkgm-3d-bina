# M0 ADIM NOTU VE GERÇEK KONSOL ÇIKTILARI (`docs/ADIM_NOTU.md`)

> **Aşama:** `M0` (10 Adımlı Saf TypeScript Çekirdeği + 15 Resmi Dosya SHA-256 Kilidi + Birim Testler + İzlenebilirlik + `Ornek6` Doğrulaması)
> **Durum:** `TAMAMLANDI (19 / 19 Birim Test GEÇTİ, 15 / 15 Resmi Dosya SHA-256 DOĞRULANDI, 0 Tip/Lint Hatası)`

---

## 1. `M0` Kapsamında Oluşturulan / Doğrulanan Dosyalar

- `docs/KARARLAR.md` (`CLAUDE12 Ek-A` + `CLAUDE13 §1–§4` nihai karar listesi)
- `docs/ACIK_SORULAR.md` (`K97` doğrulama bekleyen noktalar)
- `docs/ADIM_NOTU.md` (Bu belge — gerçek konsol ve test çıktıları)
- `fixtures/ornek6.gml` (`717200` bayt, SHA-256: `7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03`)
- `resources/codelists/*.xml` (14 resmi TKGM XML kod listesi, `resources/DOSYA_LISTESI.txt` ile bayt-bayt kilitli)
- `src/platform/PlatformAdapter.ts` (`K100` platform soyutlama katmanı)
- `src/core/codelists/index.ts` (`K60`, `K91`, `V-063` çevrimdışı XML kod listesi ayrıştırıcısı)
- `src/core/model/index.ts` (`ALLOWED_GENERIC_ATTRIBUTES` 45 öznitelik beyaz listesi, `K09/V-030` ondalık hane denetimi, `V-213` `BigInt` MAKS ID, mm ızgara tipleri)
- `src/core/math/landShare.ts` (`BigInt` rasyonel arsa payı motoru, `K84`, `V-198`, `V-198a`, `V-198b`, `V-199`, `V-212`)
- `src/core/math/helmert2d.ts` (2B Helmert dönüşümü, `ppm` ölçek hesabı ve `leave-one-out` uyuşumsuz nokta tespiti)
- `src/core/math/ring.ts` (Shoelace işaretli alan, `CCW/CW` halka yönü, 3B düzlemsellik `V-037`, delik–kenar mesafesi `K45a`, `V-042a/b`)
- `src/core/model/malik.ts` (`CLAUDE13 §1` `K88-yeni` Malik veri modeli ve `BigInt` hisse toplamı `= 1/1` kontrolü `V-208`)
- `src/core/hash/canonical.ts` (Saf TS `uuidv5` `K92` ve deterministik SHA-256 `CanonicalHash` `K89`)
- `src/core/gml/readAttributes.ts` (`fixtures/ornek6.gml` salt-okunur 42 `gen:*Attribute` ve yapı denetçisi)
- `src/core/__tests__/m0.test.ts` (19 birim testi + `K91` global `fetch` yasağı kilidi)
- `scripts/trace.ts` (`npm run trace` kural-kod-test izlenebilirlik matrisi)
- `scripts/verify-samples.ts` (`npm run verify:samples` 15 resmi dosya SHA-256 + `ornek6.gml` doğrulama betiği)

---

## 2. `npm run typecheck` ve `npm run lint` Gerçek Çıktısı

```text
> react-example@0.0.0 typecheck
> tsc --noEmit
(Çıkış Kodu: 0 — 0 hata)
```

---

## 3. `npm test` (`vitest run`) Gerçek Çıktısı

```text
RUN  v5.1.0 /app/applet

 ✓ src/core/__tests__/m0.test.ts (19 tests) 114ms

 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  01:07:26
   Duration  477ms (tests 49%, import 33%, transform 16%, worker 3%)
```

---

## 4. `npm run trace` Gerçek Çıktısı (`K98`)

```text
=== TKGM 3B BINA M0 KURAL-KOD-TEST IZLENEBILIRLIK MATRISI (K98) ===
Toplam Izlenen Kural Sayisi (M0 Cekirdek): 68
----------------------------------------------------------------------
KURAL   | KAYNAK MODULLER                        | TEST DOSYALARI
----------------------------------------------------------------------
K01     | src/core/model/index.ts                | -
K06     | src/core/model/index.ts                | -
K07     | src/core/model/index.ts                | -
K08     | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts
K09     | src/core/model/index.ts                | src/core/__tests__/m0.test.ts
K12     | src/core/hash/canonical.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts
K13     | src/core/model/index.ts                | -
K14     | src/core/model/index.ts                | -
K27     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
K30     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
K31     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
K36     | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
K45a    | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
K50     | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
K55     | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts
K60     | src/core/codelists/index.ts            | src/core/__tests__/m0.test.ts
K61     | src/core/math/landShare.ts             | -
K62     | src/core/model/index.ts                | -
K67     | src/core/model/index.ts                | -
K68     | src/core/model/index.ts                | -
K69     | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts
K70     | src/core/model/index.ts                | -
K76     | src/core/model/index.ts                | src/core/__tests__/m0.test.ts
K79     | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts
K84     | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
K86     | src/core/model/index.ts                | -
K87     | src/core/gml/readAttributes.ts         | src/core/__tests__/m0.test.ts
K88     | src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts
K89     | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts
K90     | src/core/model/index.ts                | -
K91     | src/core/codelists/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts
K92     | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts
K99     | src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts
K100    | src/core/model/index.ts, src/platform/PlatformAdapter.ts | src/core/__tests__/m0.test.ts
V-014   | src/core/model/index.ts                | -
V-020   | src/core/math/helmert2d.ts             | src/core/__tests__/m0.test.ts
V-030   | src/core/model/index.ts                | src/core/__tests__/m0.test.ts
V-031   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
V-032   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
V-033   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
V-037   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
V-040   | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
V-042a  | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
V-042b  | src/core/math/ring.ts                  | src/core/__tests__/m0.test.ts
V-050   | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts
V-051   | src/core/hash/canonical.ts             | src/core/__tests__/m0.test.ts
V-052   | src/core/hash/canonical.ts, src/core/model/index.ts | -
V-053   | src/core/hash/canonical.ts, src/core/model/index.ts | -
V-054   | src/core/model/index.ts                | -
V-055   | src/core/hash/canonical.ts, src/core/model/index.ts | -
V-056   | src/core/model/index.ts                | -
V-057   | src/core/model/index.ts                | -
V-059   | src/core/model/index.ts                | -
V-060   | src/core/gml/readAttributes.ts, src/core/model/index.ts, src/core/model/malik.ts | src/core/__tests__/m0.test.ts
V-062   | src/core/model/index.ts                | -
V-063   | src/core/codelists/index.ts            | src/core/__tests__/m0.test.ts
V-076   | src/core/math/landShare.ts             | -
V-133   | src/core/math/landShare.ts             | -
V-198   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
V-198a  | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
V-198b  | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
V-199   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
V-208   | src/core/model/malik.ts                | src/core/__tests__/m0.test.ts
V-210   | src/core/model/index.ts                | -
V-212   | src/core/math/landShare.ts             | src/core/__tests__/m0.test.ts
V-213   | src/core/model/index.ts                | src/core/__tests__/m0.test.ts
V-215   | src/core/gml/readAttributes.ts, src/core/model/index.ts | src/core/__tests__/m0.test.ts
V-216   | src/core/model/index.ts                | -
```

---

## 5. `npm run verify:samples` Gerçek Çıktısı (`15 Resmi Dosya SHA-256 + Ornek6 42 Öznitelik`)

```json
{
  "verifiedFileCount": 15,
  "all15ReferenceFilesVerified": true,
  "referenceFiles": [
    {
      "file": "ornek6.gml",
      "sizeBytes": 717200,
      "sha256": "7839a667f50cad0c90547a18a81c69274b21e9b4e33d02461085415869750f03",
      "verified": true
    },
    {
      "file": "codelists/buildingGeometrySuitability.xml",
      "sizeBytes": 1603,
      "sha256": "f399e6460ea7d8f211b29c5465da9639e0879cd2f4d59cc370faeb6cc1194f39",
      "verified": true
    },
    {
      "file": "codelists/buildingType.xml",
      "sizeBytes": 770,
      "sha256": "fc5de1b9c6224bd780612772ce5265c66fe4d1bad9562560bb37980b02798197",
      "verified": true
    },
    {
      "file": "codelists/cardinalDirection.xml",
      "sizeBytes": 2053,
      "sha256": "8aa0bc43e64e0417355fb9129fb6a3b67c9c98bace0534d25fbdae4dbd034dc9",
      "verified": true
    },
    {
      "file": "codelists/doorUsage.xml",
      "sizeBytes": 1180,
      "sha256": "c394c54ec9765d2ea5b18b4cc618307ce8d33da162f715408ac8c575fc790775",
      "verified": true
    },
    {
      "file": "codelists/independentSectionGeometrySuitability.xml",
      "sizeBytes": 831,
      "sha256": "8c13ff3a583a949075dd17e7f63a27ad29a929d47c4505c8334884db5e77c3f0",
      "verified": true
    },
    {
      "file": "codelists/independentSectionPartGeometrySuitability.xml",
      "sizeBytes": 835,
      "sha256": "eabb6a64ac72be922c41ea518f20b8ec0d3ecebf8a9cfdda9c432c35001838a2",
      "verified": true
    },
    {
      "file": "codelists/independentSectionUsage.xml",
      "sizeBytes": 1519,
      "sha256": "1620a4d341a1393408f330ed2529f2134b6e667b898a9651eac9bebf80de741e",
      "verified": true
    },
    {
      "file": "codelists/integrationState.xml",
      "sizeBytes": 1181,
      "sha256": "c234e8ef749233026b5e9fe91acea661f174f9ed1e0a4054287e0f9519493238",
      "verified": true
    },
    {
      "file": "codelists/maksConstructionIntegrationState.xml",
      "sizeBytes": 1013,
      "sha256": "945c852cddb5680e31c0d02f0e1481802f82ad7226db0d669b1e2f454079e1f8",
      "verified": true
    },
    {
      "file": "codelists/maksIndependentSectionIntegrationState.xml",
      "sizeBytes": 1007,
      "sha256": "4d97b5589b28ec16b5cc5b6b0485f472ce75e76be18ae84fa02c3e2ee67c966f",
      "verified": true
    },
    {
      "file": "codelists/partUsage.xml",
      "sizeBytes": 5842,
      "sha256": "07a42ced5cef9d420e33b213409b872e6264d673bf5554d63f115432c763761d",
      "verified": true
    },
    {
      "file": "codelists/roomInstallationUsage.xml",
      "sizeBytes": 950,
      "sha256": "5d969360f5031280f4612efad738b23c93b7ca5bfeedad52b9fa69dc7100d98b",
      "verified": true
    },
    {
      "file": "codelists/storeyUsage.xml",
      "sizeBytes": 949,
      "sha256": "f7a31e305d7cde8542f859be43947dfec3f092bb9c770e76301e62c6dd3f1119",
      "verified": true
    },
    {
      "file": "codelists/windowUsage.xml",
      "sizeBytes": 779,
      "sha256": "c2109006e89f7bb88e81bf9135bf42546471760b02f11f4ae9e2c1c0e50b5563",
      "verified": true
    }
  ],
  "codelistSummary": [
    {
      "listName": "buildingGeometrySuitability",
      "entryCount": 6,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "buildingType",
      "entryCount": 2,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "cardinalDirection",
      "entryCount": 9,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "doorUsage",
      "entryCount": 4,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "independentSectionGeometrySuitability",
      "entryCount": 2,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "independentSectionPartGeometrySuitability",
      "entryCount": 2,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "independentSectionUsage",
      "entryCount": 6,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "integrationState",
      "entryCount": 4,
      "duplicateDefinitionIds": [
        "id3"
      ]
    },
    {
      "listName": "maksConstructionIntegrationState",
      "entryCount": 3,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "maksIndependentSectionIntegrationState",
      "entryCount": 3,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "partUsage",
      "entryCount": 29,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "roomInstallationUsage",
      "entryCount": 3,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "storeyUsage",
      "entryCount": 3,
      "duplicateDefinitionIds": []
    },
    {
      "listName": "windowUsage",
      "entryCount": 2,
      "duplicateDefinitionIds": []
    }
  ],
  "ornek6Inspection": {
    "constructionID": "70125626-A",
    "buildingGmlId": "MB_b9e3888a-63b3-4f4c-9d75-58af494f6733",
    "srsName": "EPSG:5254",
    "envelopeLowerCorner": "532566.5734 4288398.1441 1095.9000",
    "envelopeUpperCorner": "532580.0220 4288410.3896 1103.7000",
    "roofProjectionArea": 120.79,
    "buildingHeight": 7.45,
    "confirmationDate": "1999-12-09",
    "totalIndependentSectionCountAttr": 2,
    "counts": {
      "MB": 1,
      "K": 2,
      "BB": 2,
      "BBK": 16,
      "OA": 0,
      "BBKIY": 0,
      "OAIY": 0,
      "BLKN": 4,
      "TRS": 0,
      "KAPI": 44,
      "PEN": 38,
      "MBG": 1
    },
    "coordinateEncoding": "mixed",
    "detectedStoreyForm": "A",
    "detectedDoorBottomOffsetMm": 10,
    "detectedProducerProfile": "A10",
    "uniqueGenericAttributes": [
      {
        "name": "additionalNote",
        "type": "string",
        "spec": "additionalNote:string",
        "occurrenceCount": 23
      },
      {
        "name": "architecturalPlanID",
        "type": "string",
        "spec": "architecturalPlanID:string",
        "occurrenceCount": 1
      },
      {
        "name": "architecturalProjectConfirmationDate",
        "type": "date",
        "spec": "architecturalProjectConfirmationDate:date",
        "occurrenceCount": 1
      },
      {
        "name": "blockName",
        "type": "string",
        "spec": "blockName:string",
        "occurrenceCount": 2
      },
      {
        "name": "blockNumber",
        "type": "string",
        "spec": "blockNumber:string",
        "occurrenceCount": 1
      },
      {
        "name": "buildingHeight",
        "type": "double",
        "spec": "buildingHeight:double",
        "occurrenceCount": 1
      },
      {
        "name": "buildingType",
        "type": "int",
        "spec": "buildingType:int",
        "occurrenceCount": 1
      },
      {
        "name": "calculatedArea",
        "type": "double",
        "spec": "calculatedArea:double",
        "occurrenceCount": 20
      },
      {
        "name": "constructionID",
        "type": "string",
        "spec": "constructionID:string",
        "occurrenceCount": 1
      },
      {
        "name": "doorUsage",
        "type": "int",
        "spec": "doorUsage:int",
        "occurrenceCount": 44
      },
      {
        "name": "elevatorCount",
        "type": "int",
        "spec": "elevatorCount:int",
        "occurrenceCount": 1
      },
      {
        "name": "entrance",
        "type": "string",
        "spec": "entrance:string",
        "occurrenceCount": 2
      },
      {
        "name": "geometrySuitability",
        "type": "int",
        "spec": "geometrySuitability:int",
        "occurrenceCount": 23
      },
      {
        "name": "independentSectionCalculatedArea",
        "type": "double",
        "spec": "independentSectionCalculatedArea:double",
        "occurrenceCount": 2
      },
      {
        "name": "independentSectionCardinalDirection",
        "type": "int",
        "spec": "independentSectionCardinalDirection:int",
        "occurrenceCount": 8
      },
      {
        "name": "independentSectionCount",
        "type": "int",
        "spec": "independentSectionCount:int",
        "occurrenceCount": 2
      },
      {
        "name": "independentSectionNumber",
        "type": "string",
        "spec": "independentSectionNumber:string",
        "occurrenceCount": 2
      },
      {
        "name": "independentSectionObjectReference",
        "type": "string",
        "spec": "independentSectionObjectReference:string",
        "occurrenceCount": 20
      },
      {
        "name": "independentSectionPlanGrossArea",
        "type": "double",
        "spec": "independentSectionPlanGrossArea:double",
        "occurrenceCount": 2
      },
      {
        "name": "independentSectionPlanNetArea",
        "type": "double",
        "spec": "independentSectionPlanNetArea:double",
        "occurrenceCount": 2
      },
      {
        "name": "independentSectionUsage",
        "type": "int",
        "spec": "independentSectionUsage:int",
        "occurrenceCount": 2
      },
      {
        "name": "integrationState",
        "type": "int",
        "spec": "integrationState:int",
        "occurrenceCount": 2
      },
      {
        "name": "maksIdentityNumber",
        "type": "int",
        "spec": "maksIdentityNumber:int",
        "occurrenceCount": 3
      },
      {
        "name": "maksIntegrationState",
        "type": "int",
        "spec": "maksIntegrationState:int",
        "occurrenceCount": 3
      },
      {
        "name": "maksNumaratajIdentityNumber",
        "type": "int",
        "spec": "maksNumaratajIdentityNumber:int",
        "occurrenceCount": 2
      },
      {
        "name": "parcelNumber",
        "type": "string",
        "spec": "parcelNumber:string",
        "occurrenceCount": 1
      },
      {
        "name": "partCount",
        "type": "int",
        "spec": "partCount:int",
        "occurrenceCount": 2
      },
      {
        "name": "partUsage",
        "type": "int",
        "spec": "partUsage:int",
        "occurrenceCount": 16
      },
      {
        "name": "planArea",
        "type": "double",
        "spec": "planArea:double",
        "occurrenceCount": 20
      },
      {
        "name": "propertyLot",
        "type": "string",
        "spec": "propertyLot:string",
        "occurrenceCount": 2
      },
      {
        "name": "registeredFloorDefinition",
        "type": "string",
        "spec": "registeredFloorDefinition:string",
        "occurrenceCount": 2
      },
      {
        "name": "registeredInstallation",
        "type": "string",
        "spec": "registeredInstallation:string",
        "occurrenceCount": 2
      },
      {
        "name": "registeredQuality",
        "type": "string",
        "spec": "registeredQuality:string",
        "occurrenceCount": 2
      },
      {
        "name": "roofProjectionArea",
        "type": "double",
        "spec": "roofProjectionArea:double",
        "occurrenceCount": 1
      },
      {
        "name": "storeyNumber",
        "type": "string",
        "spec": "storeyNumber:string",
        "occurrenceCount": 2
      },
      {
        "name": "storeyUsage",
        "type": "int",
        "spec": "storeyUsage:int",
        "occurrenceCount": 2
      },
      {
        "name": "takbisNeighbourhoodReference",
        "type": "int",
        "spec": "takbisNeighbourhoodReference:int",
        "occurrenceCount": 1
      },
      {
        "name": "takbisPropertyIdentityNumber",
        "type": "int",
        "spec": "takbisPropertyIdentityNumber:int",
        "occurrenceCount": 3
      },
      {
        "name": "tenderRegistrationNumber",
        "type": "string",
        "spec": "tenderRegistrationNumber:string",
        "occurrenceCount": 1
      },
      {
        "name": "totalIndependentSectionCount",
        "type": "int",
        "spec": "totalIndependentSectionCount:int",
        "occurrenceCount": 1
      },
      {
        "name": "volume",
        "type": "double",
        "spec": "volume:double",
        "occurrenceCount": 16
      },
      {
        "name": "windowUsage",
        "type": "int",
        "spec": "windowUsage:int",
        "occurrenceCount": 38
      }
    ],
    "uniqueAttributeSpecsSorted": [
      "additionalNote:string",
      "architecturalPlanID:string",
      "architecturalProjectConfirmationDate:date",
      "blockName:string",
      "blockNumber:string",
      "buildingHeight:double",
      "buildingType:int",
      "calculatedArea:double",
      "constructionID:string",
      "doorUsage:int",
      "elevatorCount:int",
      "entrance:string",
      "geometrySuitability:int",
      "independentSectionCalculatedArea:double",
      "independentSectionCardinalDirection:int",
      "independentSectionCount:int",
      "independentSectionNumber:string",
      "independentSectionObjectReference:string",
      "independentSectionPlanGrossArea:double",
      "independentSectionPlanNetArea:double",
      "independentSectionUsage:int",
      "integrationState:int",
      "maksIdentityNumber:int",
      "maksIntegrationState:int",
      "maksNumaratajIdentityNumber:int",
      "parcelNumber:string",
      "partCount:int",
      "partUsage:int",
      "planArea:double",
      "propertyLot:string",
      "registeredFloorDefinition:string",
      "registeredInstallation:string",
      "registeredQuality:string",
      "roofProjectionArea:double",
      "storeyNumber:string",
      "storeyUsage:int",
      "takbisNeighbourhoodReference:int",
      "takbisPropertyIdentityNumber:int",
      "tenderRegistrationNumber:string",
      "totalIndependentSectionCount:int",
      "volume:double",
      "windowUsage:int"
    ],
    "unauthorizedAttributes": [],
    "matchesOrnek6Expected42": true
  }
}
```
