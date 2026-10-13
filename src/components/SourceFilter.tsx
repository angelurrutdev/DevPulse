import React from 'react';
import type { SourceFilterId, SourceStatus } from '../types/news';
import { Newspaper, Sparkles } from 'lucide-react';

interface SourceFilterProps {
  activeSource: SourceFilterId;
  onSelectSource: (source: SourceFilterId) => void;
  sourcesStatus: SourceStatus[];
}

interface SourceOption {
  id: SourceFilterId;
  label: string;
  badge?: string;
  category?: 'all' | 'creator' | 'official' | 'community' | 'media';
}

const SOURCES: SourceOption[] = [
  { id: 'all', label: 'Todas', category: 'all' },
  { id: 'midudev', label: 'midudev', badge: '⭐ Creador', category: 'creator' },
  { id: 'cisco', label: 'Cisco', category: 'official' },
  { id: 'att-mexico', label: 'AT&T México', category: 'official' },
  { id: 'att', label: 'AT&T', category: 'official' },
  { id: 'huawei', label: 'Huawei', category: 'official' },
  { id: 'github', label: 'GitHub Blog', category: 'official' },
  { id: 'webdev', label: 'web.dev (Google)', category: 'official' },
  { id: 'vercel', label: 'Vercel', category: 'official' },
  { id: 'mozilla', label: 'Mozilla Hacks', category: 'official' },
  { id: 'huggingface', label: 'Hugging Face', category: 'community' },
  { id: 'devto', label: 'DEV Community', category: 'community' },
  { id: 'hackernews', label: 'Hacker News', category: 'community' },
  { id: 'medium', label: 'Medium', category: 'media' },
  { id: 'techcrunch', label: 'TechCrunch', category: 'media' },
  { id: 'nyt', label: 'NY Times', category: 'media' },
];

export const SourceFilter: React.FC<SourceFilterProps> = ({
  activeSource,
  onSelectSource,
  sourcesStatus,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-400 mr-2">
        <Newspaper className="h-3.5 w-3.5 text-cyan-400" />
        Fuentes:
      </span>

      {SOURCES.map((source) => {
        const isActive = activeSource === source.id;
        const isMidu = source.id === 'midudev';

        // Check source status
        const relevantStatus = sourcesStatus.find((s) => s.sourceId === source.id);
        const hasError = relevantStatus?.status === 'error';
        const isOk = relevantStatus?.status === 'ok';

        return (
          <button
            key={source.id}
            type="button"
            onClick={() => onSelectSource(source.id)}
            className={`apple-press inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-medium transition-all ${
              isActive
                ? isMidu
                  ? 'border border-amber-400/80 bg-amber-400/25 text-amber-200 ring-2 ring-amber-400/40 shadow-sm shadow-amber-400/20'
                  : 'border border-cyan-400/70 bg-cyan-500/20 text-white ring-1 ring-cyan-400/40 shadow-sm shadow-cyan-500/20'
                : isMidu
                  ? 'border border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'border border-slate-800/80 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {/* Status dot or icon */}
            {isMidu ? (
              <Sparkles className="h-3 w-3 text-amber-400" />
            ) : source.id !== 'all' ? (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasError ? 'bg-rose-500' : isOk ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
                title={hasError ? 'Incidencia temporal' : 'Feed conectado'}
              />
            ) : null}

            <span className="font-semibold">{source.label}</span>

            {source.badge && (
              <span
                className={`rounded px-1 text-[9px] font-bold ${
                  isActive
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {source.badge}
              </span>
            )}

            {relevantStatus && (
              <span className="text-[10px] opacity-70 tabular-nums">
                ({relevantStatus.itemCount})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
