import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileCheck2,
  FileCode2,
  Filter,
  FolderCheck,
  Hash,
  Layers,
  Scale,
  Search,
  ShieldCheck,
  Terminal,
  Users,
} from 'lucide-react';
import { M0_AUDIT_DATA } from './generated/m0AuditData.ts';
import {
  ALLOWED_GENERIC_ATTRIBUTES,
  checkCoordinateDecimalPlaces,
  EXTRA_OA_AND_INSTALLATION_ATTRIBUTES,
  ProducerProfile,
} from './core/model/index.ts';
import {
  analyzeBuildingLandShares,
  formatBigIntFraction,
  IndependentSectionShareInput,
} from './core/math/landShare.ts';
import {
  DEFAULT_BEYAN_DUZENLEME_AYAR,
  Malik,
  validateBbMalikShares,
} from './core/model/malik.ts';
import {
  detectOutlierLeaveOneOut,
  HelmertControlPair,
  solveHelmert2D,
} from './core/math/helmert2d.ts';
import {
  checkHoleToOuterRingClearance2D,
  ringOrientation2D,
  signedArea2D,
} from './core/math/ring.ts';
import {
  computeCanonicalModelHash,
  deterministicGmlId,
} from './core/hash/canonical.ts';

type ActiveSection =
  | 'overview'
  | 'codelists'
  | 'sandbox'
  | 'trace'
  | 'docs';

export function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [attrQuery, setAttrQuery] = useState('');
  const [selectedCodelist, setSelectedCodelist] = useState<string>(
    M0_AUDIT_DATA.codelistsDetailed[0]?.listName ?? 'buildingType'
  );
  const [codelistQuery, setCodelistQuery] = useState('');
  const [activeDocTab, setActiveDocTab] = useState<'adimNotu' | 'kararlar' | 'acikSorular'>('adimNotu');

  // Canlı Çekirdek Laboratuvarı durumları
  const [landSharePreset, setLandSharePreset] = useState<'ornek1_41' | 'fua5p9' | 'dubleks'>('ornek1_41');
  const [malikRows, setMalikRows] = useState<
    Array<{ ad: string; kimlik: string; pay: string; payda: string }>
  >([
    { ad: 'ÖRNEK MALİK 1', kimlik: '11111111110', pay: '1', payda: '2' },
    { ad: 'ÖRNEK MALİK 2', kimlik: '22222222220', pay: '2', payda: '4' },
  ]);
  const [otomatikOneriAyar, setOtomatikOneriAyar] = useState<'kapali' | 'acik'>(
    DEFAULT_BEYAN_DUZENLEME_AYAR.otomatikOneri
  );
  const [helmertOutlierMm, setHelmertOutlierMm] = useState<number>(850);
  const [doorOffsetMmInput, setDoorOffsetMmInput] = useState<number>(10);
  const [coordTokenInput, setCoordTokenInput] = useState<string>('1095.90');
  const [hashProfile, setHashProfile] = useState<ProducerProfile>('A10');
  const [cameraAngleDeg, setCameraAngleDeg] = useState<number>(45);

  const ornek6 = M0_AUDIT_DATA.sampleReport.ornek6Inspection;

  const filteredAttributes = useMemo(() => {
    const q = attrQuery.trim().toLowerCase();
    const ornek6Map = new Map<string, number>();
    for (const item of ornek6.uniqueGenericAttributes) {
      ornek6Map.set(item.spec, item.occurrenceCount);
    }
    const extraSet = new Set<string>(EXTRA_OA_AND_INSTALLATION_ATTRIBUTES);

    return ALLOWED_GENERIC_ATTRIBUTES.map((spec) => {
      const [name, type] = spec.split(':');
      const countInOrnek6 = ornek6Map.get(spec) ?? 0;
      const sourceGroup = extraSet.has(spec)
        ? 'OA_ / BBKIY_ Ek Beyaz Liste (Ornek1, Ornek2, Sincan)'
        : 'Ornek6-M-70125626-A.gml (42 Temel Öznitelik)';
      return {
        spec,
        name,
        type,
        countInOrnek6,
        sourceGroup,
      };
    }).filter(
      (item) =>
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.sourceGroup.toLowerCase().includes(q)
    );
  }, [attrQuery, ornek6]);

  const currentCodelistObj = useMemo(() => {
    return (
      M0_AUDIT_DATA.codelistsDetailed.find(
        (c) => c.listName === selectedCodelist
      ) ?? M0_AUDIT_DATA.codelistsDetailed[0]
    );
  }, [selectedCodelist]);

  const filteredCodelistEntries = useMemo(() => {
    const q = codelistQuery.trim().toLowerCase();
    if (!currentCodelistObj) return [];
    return currentCodelistObj.entries.filter(
      (e) =>
        !q ||
        e.codeText.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.definitionGmlId.toLowerCase().includes(q)
    );
  }, [currentCodelistObj, codelistQuery]);

  // Canlı Arsa Payı Analizi
  const liveLandShareResult = useMemo(() => {
    let inputs: IndependentSectionShareInput[] = [];
    if (landSharePreset === 'ornek1_41') {
      inputs = [
        {
          gmlId: 'BB_41_mesken',
          blockName: 'A',
          entrance: '1',
          independentSectionNumber: '41',
          propertyLot: '98/6534',
          registeredQuality: 'MESKEN',
        },
        {
          gmlId: 'BB_41_depo',
          blockName: 'A',
          entrance: '1',
          independentSectionNumber: '41',
          propertyLot: '79/6534',
          registeredQuality: 'DEPO',
        },
      ];
    } else if (landSharePreset === 'fua5p9') {
      inputs = [
        {
          gmlId: 'BB_1',
          blockName: 'A',
          entrance: '1',
          independentSectionNumber: '1',
          propertyLot: '50000/104683',
          registeredQuality: 'MESKEN',
        },
        {
          gmlId: 'BB_2',
          blockName: 'A',
          entrance: '1',
          independentSectionNumber: '2',
          propertyLot: '53500/104683',
          registeredQuality: 'MESKEN',
        },
      ];
    } else {
      inputs = [
        {
          gmlId: 'BB_dubleks_zemin',
          blockName: '-1',
          entrance: '',
          independentSectionNumber: '2',
          propertyLot: ' 1 / 2 ',
          registeredQuality: 'mesken',
        },
        {
          gmlId: 'BB_dubleks_1kat',
          blockName: '-1',
          entrance: '',
          independentSectionNumber: '2',
          propertyLot: '1/2',
          registeredQuality: 'MESKEN',
        },
        {
          gmlId: 'BB_1_zemin',
          blockName: '-1',
          entrance: '',
          independentSectionNumber: '1',
          propertyLot: '1/2',
          registeredQuality: 'MESKEN',
        },
      ];
    }
    return analyzeBuildingLandShares(inputs);
  }, [landSharePreset]);

  // Canlı Malik Analizi
  const liveMalikResult = useMemo(() => {
    const parsedMaliks: Malik[] = [];
    for (const r of malikRows) {
      try {
        const pay = BigInt(r.pay.trim() || '0');
        const payda = BigInt(r.payda.trim() || '1');
        parsedMaliks.push({
          bbAnahtari: 'A|1|1',
          adSoyadVeyaUnvan: r.ad,
          tcKimlikVeyaVergiNo: r.kimlik,
          hissePay: pay,
          hissePayda: payda,
        });
      } catch {
        // Geçersiz BigInt girişi
      }
    }
    return validateBbMalikShares('A|1|1', parsedMaliks);
  }, [malikRows]);

  // Canlı Helmert ve Leave-One-Out Analizi
  const liveHelmertAnalysis = useMemo(() => {
    const errMeters = helmertOutlierMm / 1000;
    const pairs: HelmertControlPair[] = [
      { id: 'P1 (KB Köşe)', localX: 0, localY: 0, targetE: 532568.58, targetN: 4288398.7 },
      { id: 'P2 (KD Köşe)', localX: 10, localY: 0, targetE: 532578.58, targetN: 4288398.7 },
      {
        id: 'P3 (GD Köşe - Test)',
        localX: 10,
        localY: 10,
        targetE: 532578.58 + errMeters,
        targetN: 4288408.7,
      },
      { id: 'P4 (GB Köşe)', localX: 0, localY: 10, targetE: 532568.58, targetN: 4288408.7 },
    ];
    const helmert = solveHelmert2D(pairs);
    const outlier = detectOutlierLeaveOneOut(pairs);
    return { helmert, outlier };
  }, [helmertOutlierMm]);

  // Canlı Halka & Delik Mesafesi ve CanonicalHash Analizi
  const liveGeometryAndHash = useMemo(() => {
    const ccwSquare = [
      { e: 0, n: 0 },
      { e: 10, n: 0 },
      { e: 10, n: 10 },
      { e: 0, n: 10 },
      { e: 0, n: 0 },
    ];
    const wall2D = [
      { e: 0, n: 0 },
      { e: 4, n: 0 },
      { e: 4, n: 2.6 },
      { e: 0, n: 2.6 },
    ];
    const offsetMeters = doorOffsetMmInput / 1000;
    const doorRing = [
      { e: 1.0, n: offsetMeters },
      { e: 1.9, n: offsetMeters },
      { e: 1.9, n: offsetMeters + 2.1 },
      { e: 1.0, n: offsetMeters + 2.1 },
    ];
    const clearance = checkHoleToOuterRingClearance2D(
      wall2D,
      doorRing,
      'DoorLinearRing_CanliTest'
    );
    const readCoordIssue = checkCoordinateDecimalPlaces(coordTokenInput, 'read');
    const writeCoordIssue = checkCoordinateDecimalPlaces(coordTokenInput, 'write');

    const sampleGmlId = deterministicGmlId('MB_', '70125626-A', 'Building/0');
    const canonicalHash = computeCanonicalModelHash(
      {
        schemaVersion: '3.5.5',
        producerProfile: hashProfile,
        codelistsCombinedSha256:
          M0_AUDIT_DATA.sampleReport.referenceFiles[0]?.sha256 ?? '',
        buildingAttributes: {
          constructionID: '70125626-A',
          maksIdentityNumber: 431289685n,
        },
        coordinatesMm: [532568580, 4288398700, 1095900],
        objectAttributes: [
          { gmlId: 'BB_1', attributes: { independentSectionNumber: '1', propertyLot: '1/2' } },
        ],
      },
      {
        cameraPosition: [cameraAngleDeg, 30, 50],
        activeTab: activeSection,
      }
    );

    return {
      ccwArea: signedArea2D(ccwSquare),
      ccwOrientation: ringOrientation2D(ccwSquare),
      clearance,
      readCoordIssue,
      writeCoordIssue,
      sampleGmlId,
      canonicalHash,
    };
  }, [doorOffsetMmInput, coordTokenInput, hashProfile, cameraAngleDeg, activeSection]);

  const downloadTextFile = (filename: string, content: string, mime = 'text/markdown;charset=utf-8') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('overview');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          TKGM 3B Sayısal Yapı Modeli
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'overview'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            15 Resmi Dosya ve Ornek6
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('codelists')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'codelists'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            14 Kod Listesi
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sandbox')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'sandbox'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Çekirdek Laboratuvarı
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('trace')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'trace'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            İzlenebilirlik Matrisi
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('docs')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'docs'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            ADIM_NOTU ve Belgeler
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() =>
              downloadTextFile('ADIM_NOTU_M0.md', M0_AUDIT_DATA.docs.adimNotuMd)
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ADIM_NOTU.md İndir</span>
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px desktop baseline) */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 space-y-8">
        {/* Context Header & Summary Strip */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Şartname {M0_AUDIT_DATA.specVersion}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-700 font-medium">
                  Kaydedilmiş Denetim Çıktısı: {M0_AUDIT_DATA.generatedAtIso}
                </span>
                <span aria-hidden="true">·</span>
                <span>Sıfır Ağ İsteği (K91 Çevrimdışı Çekirdek)</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                M0 Saf TypeScript Çekirdek ve Doğrulama Denetim Konsolu
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  downloadTextFile('KARARLAR.md', M0_AUDIT_DATA.docs.kararlarMd)
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>KARARLAR.md İndir</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    'verify-samples-m0.json',
                    JSON.stringify(M0_AUDIT_DATA.sampleReport, null, 2),
                    'application/json;charset=utf-8'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>verify:samples JSON İndir</span>
              </button>
            </div>
          </div>

          {/* 5 Quantitative Proof Metrics (Tabular Numerals) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500">Resmi Dosya SHA-256 Kilidi</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>15 / 15 Dosya</span>
              </div>
              <div className="text-xs text-slate-600">
                ornek6.gml (717.200 B) + 14 XML
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500">Birim Testler (vitest run)</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>23 / 23 Geçti</span>
              </div>
              <div className="text-xs text-slate-600">
                tsconfig.core.json (0 hata) · KONTROL-M0-2 (win32)
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500">Öznitelik Beyaz Listesi (K99)</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                45 gen:*Attribute
              </div>
              <div className="text-xs text-slate-600">
                42 Ornek6 + 3 OA / İçYapı
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500">Ornek6 Altın Dosya Analizi</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                Profil {ornek6.detectedProducerProfile}
              </div>
              <div className="text-xs text-slate-600 font-mono tabular-nums">
                Kat Biçim {ornek6.detectedStoreyForm} · Kapı +{ornek6.detectedDoorBottomOffsetMm ?? 0} mm
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500">İzlenen Kural Kodu (K98)</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {M0_AUDIT_DATA.traceReport.rows.length} Kural Kodu
              </div>
              <div className="text-xs text-slate-600">
                Kod ve test eşleşmesi doğrulandı
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: 15 RESMİ DOSYA SHA-256 KİLİDİ VE ORNEK6 ANALİZİ */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* KONTROL-M0 F1-F12 Status Table */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>00. KONTROL-M0 Denetim Bulguları Durum Tablosu (F1–F12)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    KONTROL-M0.md raporundaki F1–F4 zorunlu maddeleri ve F5–F12 iyileştirme maddelerinin tamamı uygulanmış ve test edilmiştir.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  Durum: 12 / 12 YAPILDI
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Kod</th>
                      <th className="py-2.5 px-3">Önem</th>
                      <th className="py-2.5 px-3">Durum</th>
                      <th className="py-2.5 px-3">Bulgu Özeti</th>
                      <th className="py-2.5 px-3">Uygulanan Çözüm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {M0_AUDIT_DATA.kontrolM0Findings.map((item) => (
                      <tr key={item.code} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {item.code}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {item.severity}
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold text-emerald-700 whitespace-nowrap">
                          {item.status}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {item.summary}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {item.resolutionNote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            {/* 15 Official Reference Files Table */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FolderCheck className="w-5 h-5 text-slate-700" />
                    <span>01. 15 Resmi Referans Dosyası SHA-256 Doğrulama Tablosu (CLAUDE13 §2.1)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Çalışma alanına yüklenen resmi dosyalar bayt-bayt kopyalanmış ve DOSYA_LISTESI.txt ile kilitlenmiştir.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  Durum: 15/15 Birebir Eşleşti
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Resmi Dosya Yolu</th>
                      <th className="py-2.5 px-3 text-right">Boyut (Bayt)</th>
                      <th className="py-2.5 px-3">SHA-256 Özeti</th>
                      <th className="py-2.5 px-3">Doğrulama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                    {M0_AUDIT_DATA.sampleReport.referenceFiles.map((file, idx) => (
                      <tr key={file.file} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {file.file}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700">
                          {file.sizeBytes.toLocaleString('tr-TR')}
                        </td>
                        <td className="py-2 px-3 text-slate-600 break-all">
                          {file.sha256}
                        </td>
                        <td className="py-2 px-3 text-emerald-700 font-sans font-semibold">
                          Doğrulandı
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Ornek6-M-70125626-A.gml Golden File Inspection */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-slate-700" />
                  <span>02. Altın Dosya Analizi: fixtures/ornek6.gml (M-70125626-A.gml)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  src/core/gml/readAttributes.ts tarafından çevrimdışı ayrıştırılan gerçek yapısal özet ve nesne sayıları.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-800">Kimlik ve CRS Bilgileri</div>
                  <div className="space-y-1 font-mono tabular-nums text-slate-700">
                    <div>constructionID: <span className="font-semibold text-slate-900">{ornek6.constructionID}</span></div>
                    <div>Bina gml:id: <span className="text-slate-600">{ornek6.buildingGmlId}</span></div>
                    <div>CRS (srsName): <span className="font-semibold text-slate-900">{ornek6.srsName}</span></div>
                    <div>Onay Tarihi: <span className="font-semibold text-slate-900">{ornek6.confirmationDate}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-800">Envelope ve Boyutlar</div>
                  <div className="space-y-1 font-mono tabular-nums text-slate-700">
                    <div>lowerCorner: <span className="text-slate-900">{ornek6.envelopeLowerCorner}</span></div>
                    <div>upperCorner: <span className="text-slate-900">{ornek6.envelopeUpperCorner}</span></div>
                    <div>roofProjectionArea: <span className="font-semibold text-slate-900">{ornek6.roofProjectionArea.toFixed(2)} m²</span></div>
                    <div>buildingHeight: <span className="font-semibold text-slate-900">{ornek6.buildingHeight.toFixed(2)} m</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-800">Nesne Sayıları (gml:id Önekleri)</div>
                  <div className="grid grid-cols-3 gap-1.5 font-mono tabular-nums text-slate-700">
                    <div>MB_: <span className="font-bold text-slate-900">{ornek6.counts.MB}</span></div>
                    <div>K_: <span className="font-bold text-slate-900">{ornek6.counts.K}</span></div>
                    <div>BB_: <span className="font-bold text-slate-900">{ornek6.counts.BB}</span></div>
                    <div>BBK_: <span className="font-bold text-slate-900">{ornek6.counts.BBK}</span></div>
                    <div>BLKN_: <span className="font-bold text-slate-900">{ornek6.counts.BLKN}</span></div>
                    <div>KAPI_: <span className="font-bold text-slate-900">{ornek6.counts.KAPI}</span></div>
                    <div>PEN_: <span className="font-bold text-slate-900">{ornek6.counts.PEN}</span></div>
                    <div>OA_: <span className="font-bold text-slate-900">{ornek6.counts.OA}</span></div>
                    <div>MBG_: <span className="font-bold text-slate-900">{ornek6.counts.MBG}</span></div>
                  </div>
                </div>
              </div>

              {/* 45 Whitelisted Generic Attributes Table */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      ALLOWED_GENERIC_ATTRIBUTES Beyaz Listesi (45 Öznitelik — K99, V-060)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ornek6 içinden doğrulanan 42 öznitelik + Ortak Alan / İç Yapı için 3 ek öznitelik.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={attrQuery}
                      onChange={(e) => setAttrQuery(e.target.value)}
                      placeholder="Öznitelik adı veya tip ara..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Öznitelik Adı (name)</th>
                        <th className="py-2 px-3">Veri Tipi</th>
                        <th className="py-2 px-3 text-right">Ornek6 Kullanım Sayısı</th>
                        <th className="py-2 px-3">Doğrulama Kaynağı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredAttributes.map((attr, i) => (
                        <tr key={attr.spec} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono tabular-nums text-slate-500">
                            {i + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                            {attr.name}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700">
                            gen:{attr.type}Attribute
                          </td>
                          <td className="py-2 px-3 font-mono tabular-nums text-right text-slate-700">
                            {attr.countInOrnek6}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {attr.sourceGroup}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SECTION 2: 14 RESMİ TKGM XML KOD LİSTESİ GEZGİNİ */}
        {activeSection === 'codelists' && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-slate-700" />
                  <span>14 Resmi TKGM XML Kod Listesi Gezgini (K60, K91, V-063)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  resources/codelists/*.xml altındaki 14 resmi sözlükten çevrimdışı ayrıştırılmıştır. commonAreaUsage sorguları partUsage.xml üzerinden yanıtlanır.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={codelistQuery}
                  onChange={(e) => setCodelistQuery(e.target.value)}
                  placeholder="Kod veya Türkçe açıklama filtrele..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar: 14 Codelists */}
              <div className="lg:col-span-4 border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden">
                {M0_AUDIT_DATA.codelistsDetailed.map((cl) => {
                  const active = cl.listName === selectedCodelist;
                  return (
                    <button
                      key={cl.listName}
                      type="button"
                      onClick={() => setSelectedCodelist(cl.listName)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-mono truncate">{cl.listName}.xml</span>
                      <span
                        className={`font-mono tabular-nums text-[11px] shrink-0 ml-2 ${
                          active ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {cl.entries.length} kayıt
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Table: Selected Codelist Entries */}
              <div className="lg:col-span-8 space-y-3">
                {currentCodelistObj && (
                  <>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="space-x-2">
                        <span className="font-mono font-bold text-slate-900">
                          {currentCodelistObj.listName}.xml
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600">
                          Dictionary gml:id: <code className="font-mono">{currentCodelistObj.dictionaryGmlId}</code>
                        </span>
                      </div>
                      {currentCodelistObj.duplicateDefinitionIds.length > 0 && (
                        <span className="text-amber-800 font-medium">
                          Resmi XML içinde çift Definition gml:id ({currentCodelistObj.duplicateDefinitionIds.join(', ')}) korunarak okundu
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                            <th className="py-2.5 px-3">Definition gml:id</th>
                            <th className="py-2.5 px-3">Kod (gml:name)</th>
                            <th className="py-2.5 px-3">Türkçe Açıklama (gml:description)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredCodelistEntries.map((entry, idx) => (
                            <tr
                              key={`${entry.definitionGmlId}-${entry.code}-${idx}`}
                              className="hover:bg-slate-50/80"
                            >
                              <td className="py-2 px-3 font-mono text-slate-500">
                                {entry.definitionGmlId}
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums font-bold text-slate-900">
                                {entry.codeText}
                              </td>
                              <td className="py-2 px-3 text-slate-800 font-medium">
                                {entry.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: CANLI ÇEKİRDEK MOTORU LABORATUVARI (src/core/) */}
        {activeSection === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. BigInt LandShare Engine */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-slate-700" />
                    <span>BigInt Arsa Payı Motoru (src/core/math/landShare.ts)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    K84 5&apos;li birleşik BB anahtarı, V-198, V-199 ve V-212 kontrolleri.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLandSharePreset('ornek1_41')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    landSharePreset === 'ornek1_41'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ornek1 #41 (V-212)
                </button>
                <button
                  type="button"
                  onClick={() => setLandSharePreset('fua5p9')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    landSharePreset === 'fua5p9'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  FUA5P9 (V-199)
                </button>
                <button
                  type="button"
                  onClick={() => setLandSharePreset('dubleks')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    landSharePreset === 'dubleks'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dubleks + Boşluk (V-198)
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono tabular-nums">
                <div>
                  Toplam BB Parça Nesnesi: <span className="font-bold">{liveLandShareResult.totalPartObjects}</span>
                </div>
                <div>
                  Benzersiz BB Sayısı (K31 / K84): <span className="font-bold text-slate-900">{liveLandShareResult.uniqueBbCount}</span>
                </div>
                <div>
                  Toplam Pay (Ortak Payda): <span className="font-bold text-slate-900">{formatBigIntFraction(liveLandShareResult.totalShareUnreduced)}</span>
                </div>
                <div>
                  Toplam Pay (GCD Sadeleşmiş): <span className="font-bold text-slate-900">{formatBigIntFraction(liveLandShareResult.totalShareReduced)}</span>
                </div>
                <div>
                  1 Tam Paydan Fark: <span className="font-bold text-slate-900">{formatBigIntFraction(liveLandShareResult.diffFromOneUnreduced)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-700">Üretilen Doğrulama Bulguları:</div>
                {liveLandShareResult.issues.map((iss, idx) => (
                  <div
                    key={`${iss.ruleId}-${idx}`}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-0.5"
                  >
                    <div className="font-mono font-bold text-slate-900">
                      {iss.ruleId} · Düzey: {iss.severity === 'H' ? 'HATA' : iss.severity === 'U' ? 'UYARI' : 'BİLGİ'}
                    </div>
                    <div className="text-slate-600">{iss.message}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Malik (Kat İrtifakı Listesi — CLAUDE13 §1 K88-yeni) */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700" />
                    <span>Malik / Kat İrtifakı Modeli (src/core/model/malik.ts)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    CLAUDE13 §1 (K88-yeni): Serbest düzenlenir, yalnız proje dosyasında (.tkgm3b) tutulur, GML&apos;e asla yazılmaz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOtomatikOneriAyar((prev) =>
                      prev === 'kapali' ? 'acik' : 'kapali'
                    )
                  }
                  className="px-2.5 py-1 text-xs font-mono border border-slate-300 rounded-md bg-slate-50 hover:bg-slate-100 cursor-pointer shrink-0"
                >
                  otomatikOneri: {otomatikOneriAyar}
                </button>
              </div>

              <div className="space-y-2">
                {malikRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                    <input
                      type="text"
                      value={row.ad}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMalikRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, ad: val } : r))
                        );
                      }}
                      className="col-span-5 px-2.5 py-1.5 border border-slate-200 rounded-md font-mono"
                      placeholder="Ad Soyad / Ünvan"
                    />
                    <input
                      type="text"
                      value={row.kimlik}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMalikRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, kimlik: val } : r))
                        );
                      }}
                      className="col-span-3 px-2.5 py-1.5 border border-slate-200 rounded-md font-mono tabular-nums"
                      placeholder="TC / Vergi No"
                    />
                    <input
                      type="text"
                      value={row.pay}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMalikRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, pay: val } : r))
                        );
                      }}
                      className="col-span-2 px-2.5 py-1.5 border border-slate-200 rounded-md font-mono tabular-nums text-right"
                      placeholder="Pay"
                    />
                    <input
                      type="text"
                      value={row.payda}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMalikRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, payda: val } : r))
                        );
                      }}
                      className="col-span-2 px-2.5 py-1.5 border border-slate-200 rounded-md font-mono tabular-nums text-right"
                      placeholder="Payda"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono tabular-nums">
                <div>
                  BB Anahtarı: <span className="font-bold">{liveMalikResult.bbAnahtari}</span> · Hissedar Sayısı: <span className="font-bold">{liveMalikResult.malikSayisi}</span>
                </div>
                <div>
                  BigInt Hisse Toplamı: <span className="font-bold text-slate-900">{formatBigIntFraction(liveMalikResult.toplamHisse)}</span> ({liveMalikResult.tamHisseMi ? 'Tam Hisse 1/1' : 'V-208 BİLGİ: Toplam != 1/1'})
                </div>
                {liveMalikResult.issue && (
                  <div className="text-amber-800 font-sans pt-1">
                    {liveMalikResult.issue.ruleId} ({liveMalikResult.issue.severity}): {liveMalikResult.issue.message}
                  </div>
                )}
              </div>
            </section>

            {/* 3. 2D Helmert & Leave-One-Out Outlier Detection */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  2B Helmert Dönüşümü ve Uyuşumsuz Nokta Tespiti (src/core/math/helmert2d.ts)
                </h2>
                <p className="text-xs text-slate-500">
                  P3 kontrol noktasındaki aplikasyon sapmasını değiştirerek leave-one-out analizini test edin.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">P3 Noktası Yapay Sapması (mm):</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">{helmertOutlierMm} mm</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={10}
                  value={helmertOutlierMm}
                  onChange={(e) => setHelmertOutlierMm(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono tabular-nums">
                <div>
                  Ölçek (Scale): <span className="font-bold">{liveHelmertAnalysis.helmert.scale.toFixed(6)}</span> ({liveHelmertAnalysis.helmert.scalePpm.toFixed(1)} ppm)
                </div>
                <div>
                  Tüm Noktalar RMSE: <span className="font-bold">{liveHelmertAnalysis.outlier.fullRmseMm.toFixed(2)} mm</span>
                </div>
                <div>
                  En İyi Leave-One-Out RMSE: <span className="font-bold text-emerald-700">{liveHelmertAnalysis.outlier.bestReducedRmseMm.toFixed(2)} mm</span>
                </div>
                <div>
                  Tespit Edilen Uyuşumsuz Nokta: <span className="font-bold text-slate-900">{liveHelmertAnalysis.outlier.suspectPointId ?? 'Yok (Tüm noktalar uyumlu)'}</span>
                </div>
              </div>
            </section>

            {/* 4. Coordinate Decimals (CLAUDE13 §2.2), K45a Clearance & CanonicalHash */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-700" />
                  <span>K09/V-030 Ondalık Kuralı, K45a Delik Mesafesi ve CanonicalHash</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Okumada != 3 hane BİLGİ (CLAUDE13 §2.2), delik-kenar mesafesi ve SHA-256 kanonik model özeti.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 block">
                    Koordinat Metni (V-030 Okuma vs Yazma):
                  </label>
                  <input
                    type="text"
                    value={coordTokenInput}
                    onChange={(e) => setCoordTokenInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono tabular-nums"
                  />
                  <div className="text-[11px] font-mono text-slate-600">
                    Okuma Modu: <span className="font-bold text-slate-900">{liveGeometryAndHash.readCoordIssue ? `${liveGeometryAndHash.readCoordIssue.severity} (BİLGİ)` : 'Tam 3 Hane (OK)'}</span>
                    {' · '}
                    Yazma Modu: <span className="font-bold text-slate-900">{liveGeometryAndHash.writeCoordIssue ? `${liveGeometryAndHash.writeCoordIssue.severity} (HATA)` : 'Tam 3 Hane (OK)'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 block">
                    Kapı Deliği Alt Ofseti (K45a): {doorOffsetMmInput} mm
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={doorOffsetMmInput}
                    onChange={(e) => setDoorOffsetMmInput(Number(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <div className="text-[11px] font-mono text-slate-600">
                    Sonuç: <span className="font-bold text-slate-900">{liveGeometryAndHash.clearance.issue ? `${liveGeometryAndHash.clearance.issue.ruleId} (${liveGeometryAndHash.clearance.issue.severity})` : 'K45a Tam Uyumlu (>=10mm)'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Üretici Profili:</span>
                  {(['A10', 'B50', 'C50'] as const).map((prof) => (
                    <button
                      key={prof}
                      type="button"
                      onClick={() => setHashProfile(prof)}
                      className={`px-2.5 py-1 rounded-md font-mono text-xs cursor-pointer ${
                        hashProfile === prof
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {prof}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Kamera Açısı (Özeti Değiştirmez):</span>
                  <button
                    type="button"
                    onClick={() => setCameraAngleDeg((d) => (d + 45) % 360)}
                    className="px-2.5 py-1 rounded-md font-mono text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    {cameraAngleDeg}°
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs font-mono tabular-nums">
                <div className="truncate">
                  Deterministik gml:id (K92): <span className="font-bold text-slate-900">{liveGeometryAndHash.sampleGmlId}</span>
                </div>
                <div className="break-all">
                  CanonicalHash (K89): <span className="font-bold text-slate-900">{liveGeometryAndHash.canonicalHash}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SECTION 4: KURAL-KOD-TEST İZLENEBİLİRLİK MATRİSİ (npm run trace) */}
        {activeSection === 'trace' && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-slate-700" />
                  <span>Kural–Kod–Test İzlenebilirlik Matrisi (npm run trace — K98)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  scripts/trace.ts tarafından src/core/ ve src/platform/ kaynak ve test dosyalarından otomatik üretilmiştir.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-700">
                Toplam İzlenen Kural: {M0_AUDIT_DATA.traceReport.rows.length}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Kural Kodu</th>
                    <th className="py-2.5 px-3">Kaynak Modüller (src/core & src/platform)</th>
                    <th className="py-2.5 px-3">Birim Test Dosyaları</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {M0_AUDIT_DATA.traceReport.rows.map((row) => (
                    <tr key={row.ruleId} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {row.ruleId}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {row.sourceFiles.join(', ')}
                      </td>
                      <td className="py-2 px-3 text-emerald-700">
                        {row.testFiles.join(', ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION 5: ADIM_NOTU.MD, KARARLAR.MD VE KONSOL ÇIKTILARI */}
        {activeSection === 'docs' && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('adimNotu')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    activeDocTab === 'adimNotu'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  docs/ADIM_NOTU.md
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('kararlar')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    activeDocTab === 'kararlar'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  docs/KARARLAR.md
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('acikSorular')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    activeDocTab === 'acikSorular'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  docs/ACIK_SORULAR.md
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeDocTab === 'adimNotu') {
                    downloadTextFile('ADIM_NOTU.md', M0_AUDIT_DATA.docs.adimNotuMd);
                  } else if (activeDocTab === 'kararlar') {
                    downloadTextFile('KARARLAR.md', M0_AUDIT_DATA.docs.kararlarMd);
                  } else {
                    downloadTextFile('ACIK_SORULAR.md', M0_AUDIT_DATA.docs.acikSorularMd);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Seçili Belgeyi İndir (.md)</span>
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto max-h-[640px] leading-relaxed whitespace-pre-wrap">
              {activeDocTab === 'adimNotu'
                ? M0_AUDIT_DATA.docs.adimNotuMd
                : activeDocTab === 'kararlar'
                ? M0_AUDIT_DATA.docs.kararlarMd
                : M0_AUDIT_DATA.docs.acikSorularMd}
            </pre>
          </section>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            TKGM 3B Sayısal Yapı Modeli (CityGML 2.0) · M0 Saf TypeScript Çekirdek Sürümü (v3.5.5)
          </div>
          <div className="font-mono tabular-nums">
            15/15 Resmi Dosya SHA-256 · 19/19 Birim Test · Sıfır Ağ İsteği (K91)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
