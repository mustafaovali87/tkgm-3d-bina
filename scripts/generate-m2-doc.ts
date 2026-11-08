// M2: docs/M2_DOGRULAYICI.md içindeki kural kapsam tablosunu koddan (ALL_RULES) üretir.
// Elle yazılmış tablo zamanla koddan ayrışmasın diye tablo yalnız bu betikle güncellenir.
import fs from 'node:fs';
import path from 'node:path';
import { ALL_RULES } from '../src/core/validation/index.ts';

const STATUS_TR: Record<string, string> = {
  uygulandi: 'Uygulandı',
  okuyucuda: 'Okuyucuda',
  sunucu: 'Sunucu (T)',
  kismi: 'Kısmi (K)',
  ertelendi: 'Ertelendi',
};

const counts = new Map<string, number>();
for (const r of ALL_RULES) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);

const esc = (s: string) => s.replace(/\|/g, '\\|');
const rows = ALL_RULES.map((r) => `| ${r.id} | ${r.severity} | ${STATUS_TR[r.status]} | ${esc(r.source)} | ${esc(r.note ?? '')} |`);

const begin = '<!-- KAPSAM-TABLOSU:BASLA -->';
const end = '<!-- KAPSAM-TABLOSU:BITIR -->';
const table = [
  begin,
  '',
  `Toplam ${ALL_RULES.length} kural: ` + [...counts.entries()].map(([k, v]) => `${STATUS_TR[k]} ${v}`).join(', ') + '.',
  '',
  '| Kural | Düzey | Durum | Kaynak | Not |',
  '|---|---|---|---|---|',
  ...rows,
  '',
  end,
].join('\n');

const file = path.join(process.cwd(), 'docs', 'M2_DOGRULAYICI.md');
const current = fs.readFileSync(file, 'utf-8');
const re = new RegExp(`${begin}[\\s\\S]*?${end}`);
if (!re.test(current)) throw new Error('docs/M2_DOGRULAYICI.md içinde KAPSAM-TABLOSU işaretleri yok.');
fs.writeFileSync(file, current.replace(re, table), 'utf-8');
console.log(`Kapsam tablosu güncellendi: ${ALL_RULES.length} kural.`);
