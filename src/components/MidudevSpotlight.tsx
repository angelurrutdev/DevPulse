import React from 'react';
import type { Article, SourceFilterId } from '../types/news';
import {
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle,
  Video,
} from 'lucide-react';
import { YouTubeIcon, TwitchIcon, XIcon } from './SocialIcons';

interface MidudevSpotlightProps {
  miduArticles: Article[];
  activeSource: SourceFilterId;
  onSelectSource: (source: SourceFilterId) => void;
  onArticleClick?: (article: Article) => void;
}

export const MidudevSpotlight: React.FC<MidudevSpotlightProps> = ({
  miduArticles,
  activeSource,
  onSelectSource,
}) => {
  const isOnlyMidu = activeSource === 'midudev';
  const latestPost = miduArticles[0];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.08] via-slate-900/60 to-purple-950/[0.15] p-5 backdrop-blur-2xl transition-all duration-300 hover:border-amber-400/40 sm:p-7 shadow-2xl shadow-amber-950/20">
      {/* Decorative ambient background orb */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-gradient-to-tr from-cyan-400/15 to-purple-600/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Creator Info */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative self-start sm:self-auto">
            <div className="h-16 w-16 overflow-hidden rounded-2xl ring-2 ring-amber-400/50 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-amber-500/20">
              <img
                src="https://avatars.githubusercontent.com/u/1561955?v=4"
                alt="midudev avatar"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md ring-2 ring-slate-950" title="Creador Oficial Verificado">
              <CheckCircle className="h-4 w-4 fill-slate-950 text-amber-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
                <Sparkles className="h-3 w-3" />
                Creador Destacado
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {miduArticles.length} noticias & videos frescos
              </span>
            </div>

            <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl display-title flex items-center gap-2">
              midudev
              <span className="text-xs font-normal text-slate-400">(@midudev)</span>
            </h3>

            <p className="max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Noticias, trucos y novedades de <strong className="text-amber-200">Claude Code, React, JavaScript, CSS, Inteligencia Artificial</strong> y el ecosistema developer.
            </p>
          </div>
        </div>

        {/* Latest Post Teaser & Action Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {/* Social Links Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://youtube.com/@midudev"
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-white"
              title="Canal de YouTube @midudev"
            >
              <YouTubeIcon className="h-3.5 w-3.5" />
              <span>YouTube</span>
            </a>

            <a
              href="https://twitch.tv/midudev"
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/20 hover:text-white"
              title="Canal de Twitch @midudev"
            >
              <TwitchIcon className="h-3.5 w-3.5" />
              <span>Twitch</span>
            </a>

            <a
              href="https://x.com/midudev"
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/20 hover:text-white"
              title="Cuenta de X/Twitter @midudev"
            >
              <XIcon className="h-3.5 w-3.5" />
              <span>X / Twitter</span>
            </a>

            <a
              href="https://midu.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 hover:text-white"
              title="Sitio web oficial midu.dev"
            >
              <span>midu.dev</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => onSelectSource(isOnlyMidu ? 'all' : 'midudev')}
            className={`apple-press inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
              isOnlyMidu
                ? 'bg-amber-400 text-slate-950 shadow-amber-400/30 ring-2 ring-amber-300'
                : 'border border-amber-400/50 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>{isOnlyMidu ? 'Mostrando solo Midudev (Haz clic para ver todo)' : 'Filtrar solo noticias de Midu'}</span>
          </button>
        </div>
      </div>

      {/* Latest Article Teaser if present */}
      {latestPost && (
        <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 rounded-md px-2 py-0.5">
              <Video className="h-3 w-3" />
              Último video:
            </span>
            <span className="font-semibold text-white truncate">{latestPost.title}</span>
          </div>

          <a
            href={latestPost.link}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press inline-flex items-center gap-1 text-amber-300 hover:text-amber-100 flex-shrink-0 font-medium"
          >
            <span>Ver video en YouTube</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </section>
  );
};
