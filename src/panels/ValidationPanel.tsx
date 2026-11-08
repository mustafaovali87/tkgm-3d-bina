// G7 & KARAR D-23.1 / D-23.3: Doğrulama & Denetim Paneli (HATA / UYARI / BİLGİ, Tıkla -> Nesneye Git)
import React, { useMemo, useState } from 'react';
import { ValidationIssue } from '../core/model/index.ts';
import { MaximizedPanelId } from '../state/workspaceState.ts';

export interface ValidationPanelProps {
  readonly fileName: string;
  readonly allIssues: readonly ValidationIssue[];
  readonly issueCounts: { readonly H: number; readonly U: number; readonly B: number };
  readonly maximizedPanelId: MaximizedPanelId;
  readonly onIssueClick: (issue: ValidationIssue) => void;
  readonly onToggleMaximizePanel: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  fileName,
  allIssues,
  issueCounts,
  maximizedPanelId,
  onIssueClick,
  onToggleMaximizePanel,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'H' | 'U' | 'B'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredIssues = useMemo(() => {
    return allIssues.filter((i) => {
      if (severityFilter !== 'ALL' && i.severity !== severityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          i.ruleId.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q) ||
          (i.targetGmlId ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allIssues, severityFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
            DOĞRULAMA & DENETİM PANELİ (Tıkla → Nesneye Git)
          </span>
          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={() => setSeverityFilter('ALL')}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                severityFilter === 'ALL'
                  ? 'bg-slate-700 text-white border-slate-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Tümü ({allIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter('H')}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                severityFilter === 'H'
                  ? 'bg-rose-500/30 text-rose-200 border-rose-500'
                  : 'bg-rose-950/40 text-rose-400 border-rose-900/50'
              }`}
            >
              HATA ({issueCounts.H})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter('U')}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                severityFilter === 'U'
                  ? 'bg-amber-500/30 text-amber-200 border-amber-500'
                  : 'bg-amber-950/40 text-amber-400 border-amber-900/50'
              }`}
            >
              UYARI ({issueCounts.U})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter('B')}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                severityFilter === 'B'
                  ? 'bg-sky-500/30 text-sky-200 border-sky-500'
                  : 'bg-sky-950/40 text-sky-400 border-sky-900/50'
              }`}
            >
              BİLGİ ({issueCounts.B})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="V-030, V-211, gml:id..."
            className="w-36 px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={onToggleMaximizePanel}
            title="Tam Ekran / Geri Al"
            className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {maximizedPanelId === 'validation' ? '❐' : '□'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70">
        {filteredIssues.length === 0 ? (
          <div className="p-4 text-xs text-slate-400 flex items-center justify-between">
            <span>
              Seçili filtrede bulgu yok. ({fileName} içinde HATA: {issueCounts.H}, UYARI:{' '}
              {issueCounts.U}, BİLGİ: {issueCounts.B})
            </span>
          </div>
        ) : (
          filteredIssues.map((issue, idx) => {
            const sevBadge =
              issue.severity === 'H'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : issue.severity === 'U'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/40';
            return (
              <div
                key={`${issue.ruleId}-${issue.targetGmlId ?? idx}-${idx}`}
                onClick={() => onIssueClick(issue)}
                className="px-3 py-1.5 text-xs hover:bg-slate-800/70 cursor-pointer flex items-center justify-between gap-2 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded border shrink-0 ${sevBadge}`}
                  >
                    {issue.severity} · {issue.ruleId}
                  </span>
                  <span className="text-slate-200 truncate" title={issue.message}>
                    {issue.message}
                  </span>
                </div>
                {issue.targetGmlId && (
                  <span className="text-[10px] font-mono text-amber-300/90 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                    → {issue.targetGmlId.slice(0, 18)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
