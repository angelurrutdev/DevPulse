import React from 'react';
import type { TrendingHashtag } from '../types/news';
import {
  Hash,
  X,
  TrendingUp,
} from 'lucide-react';
import { XIcon, RedditIcon, LinkedInIcon } from './SocialIcons';

interface HashtagBarProps {
  hashtags: TrendingHashtag[];
  activeHashtag: string | null;
  onSelectHashtag: (tag: string | null) => void;
}

export const HashtagBar: React.FC<HashtagBarProps> = ({
  hashtags,
  activeHashtag,
  onSelectHashtag,
}) => {
  if (!hashtags || hashtags.length === 0) return null;

  const currentTopic = activeHashtag ? activeHashtag.replace('#', '') : 'webdev';

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
          <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
          <span>Hashtags & Redes Trending</span>
        </div>

        {/* Quick Social Outlinks for current topic */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="hidden sm:inline">Explorar #{currentTopic} en:</span>
          <a
            href={`https://twitter.com/search?q=${encodeURIComponent(activeHashtag || '#webdev')}&f=live`}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-slate-900/60 px-2 py-1 text-slate-300 hover:border-sky-500/40 hover:text-sky-300"
            title="Buscar en Twitter / X"
          >
            <XIcon className="h-3 w-3 text-sky-400" />
            <span className="hidden sm:inline">Twitter / X</span>
          </a>

          <a
            href={`https://www.reddit.com/r/programming/search/?q=${encodeURIComponent(currentTopic)}&restrict_sr=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-slate-900/60 px-2 py-1 text-slate-300 hover:border-orange-500/40 hover:text-orange-300"
            title="Buscar debates en Reddit r/programming"
          >
            <RedditIcon className="h-3 w-3 text-orange-400" />
            <span className="hidden sm:inline">Reddit</span>
          </a>

          <a
            href={`https://www.linkedin.com/feed/hashtag/?keywords=${encodeURIComponent(currentTopic)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-slate-900/60 px-2 py-1 text-slate-300 hover:border-blue-500/40 hover:text-blue-300"
            title="Explorar hashtag en LinkedIn"
          >
            <LinkedInIcon className="h-3 w-3 text-blue-400" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
        </div>
      </div>

      {/* Hashtag Scroll Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {activeHashtag && (
          <button
            type="button"
            onClick={() => onSelectHashtag(null)}
            className="apple-press inline-flex flex-shrink-0 items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25"
            title="Quitar filtro de hashtag"
          >
            <X className="h-3.5 w-3.5" />
            <span>Quitar #{activeHashtag.replace('#', '')}</span>
          </button>
        )}

        {hashtags.map(({ tag, count }) => {
          const isActive = activeHashtag === tag;
          const isMidu = tag === '#midudev';

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectHashtag(isActive ? null : tag)}
              className={`apple-press group inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? isMidu
                    ? 'border border-amber-400/80 bg-amber-400/25 text-amber-200 ring-2 ring-amber-400/40 shadow-sm shadow-amber-400/20'
                    : 'border border-cyan-400/80 bg-cyan-400/20 text-cyan-200 ring-2 ring-cyan-400/40 shadow-sm shadow-cyan-400/20'
                  : isMidu
                    ? 'border border-amber-400/30 bg-amber-500/10 text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/20'
                    : 'border border-white/[0.08] bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Hash
                className={`h-3 w-3 ${
                  isMidu
                    ? 'text-amber-400'
                    : isActive
                      ? 'text-cyan-400'
                      : 'text-slate-400 group-hover:text-cyan-400'
                }`}
              />
              <span className="font-semibold">{tag.replace('#', '')}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-bold ${
                  isActive
                    ? isMidu
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-cyan-400 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
