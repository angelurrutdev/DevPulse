import React, { useState } from 'react';
import type { Article, CategoryName } from '../types/news';
import { formatRelativeDate } from '../utils/formatters';
import {
  ExternalLink,
  Bookmark,
  Clock,
  User,
  Sparkles,
  Radio,
  Code2,
  Cpu,
  Flame,
  MessageSquare,
  Play,
  Hash,
  ShieldCheck,
  Eye,
  Link2,
  Check,
} from 'lucide-react';
import { XIcon, RedditIcon, LinkedInIcon } from './SocialIcons';

interface ArticleCardProps {
  article: Article;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  onSelectHashtag?: (tag: string) => void;
  onQuickView?: (article: Article) => void;
  viewMode?: 'grid' | 'compact';
}

const CATEGORY_STYLES: Record<
  CategoryName,
  { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  'IA & ML': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    border: 'border-purple-500/25',
    icon: Sparkles,
  },
  Telecomunicaciones: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-300',
    border: 'border-sky-500/25',
    icon: Radio,
  },
  'Software & Dev': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    border: 'border-emerald-500/25',
    icon: Code2,
  },
  'General Tech': {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-500/25',
    icon: Cpu,
  },
};

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  isBookmarked,
  onToggleBookmark,
  onSelectHashtag,
  onQuickView,
  viewMode = 'grid',
}) => {
  const [copied, setCopied] = useState(false);
  const catStyle = CATEGORY_STYLES[article.category] || CATEGORY_STYLES['General Tech'];
  const CategoryIcon = catStyle.icon;
  const isMidu = article.source.id === 'midudev';
  const isVideo = article.mediaType === 'video';

  // Calculate rough reading time
  const wordCount = (article.title + ' ' + article.snippet).split(/\s+/).length;
  const readingTimeMin = Math.max(1, Math.round(wordCount / 60));

  // Social share URLs
  const cleanTitle = article.title.replace(/\n+/g, ' ').trim();
  const rawTags = (article.hashtags || []).map((t) => t.replace('#', '')).join(',');
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    cleanTitle
  )}&url=${encodeURIComponent(article.link)}&hashtags=${encodeURIComponent(rawTags || 'dev,tech')}`;
  const redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(
    article.link
  )}&title=${encodeURIComponent(cleanTitle)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    article.link
  )}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
    }
  };

  // Compact / Editorial row mode (macOS List inspiration)
  if (viewMode === 'compact') {
    return (
      <article
        onClick={() => onQuickView?.(article)}
        className={`apple-glass-card group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
          isMidu ? 'border-amber-400/30 hover:border-amber-400/60 shadow-md shadow-amber-950/20' : ''
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Source avatar / badge */}
          <div className="flex-shrink-0">
            {article.source.avatarUrl ? (
              <img
                src={article.source.avatarUrl}
                alt=""
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 ring-1 ring-white/10">
                <span className="text-xs font-bold">{article.source.name.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-200">{article.source.name}</span>
              <span className="text-slate-500">•</span>
              <span className={`inline-flex items-center gap-1 ${catStyle.text} text-[11px] font-medium`}>
                <CategoryIcon className="h-3 w-3" />
                {article.category}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[11px]">{formatRelativeDate(article.pubDate)}</span>
            </div>

            <h3 className="mt-1 text-sm font-bold text-white transition-colors group-hover:text-cyan-300 truncate">
              {article.title}
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView?.(article);
            }}
            className="apple-press rounded-xl border border-white/10 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Vista rápida"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleBookmark(article);
            }}
            className={`apple-press rounded-xl p-1.5 transition-colors ${
              isBookmarked
                ? 'bg-amber-400/25 text-amber-300 ring-1 ring-amber-400/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title={isBookmarked ? 'Quitar de guardados' : 'Guardar artículo'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press inline-flex items-center gap-1 rounded-xl bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25"
          >
            <span>{isVideo ? 'Ver' : 'Leer'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </article>
    );
  }

  // Standard Grid Card Mode
  return (
    <article
      className={`apple-glass-card group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 ${
        isMidu
          ? 'border-amber-400/30 hover:border-amber-400/60 shadow-xl shadow-amber-950/20'
          : ''
      }`}
    >
      <div>
        {/* Top Header: Source Badge + Category Badge + Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Source Badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold tracking-wide ${article.source.badgeColor}`}
              title={article.source.name}
            >
              {article.source.avatarUrl ? (
                <img
                  src={article.source.avatarUrl}
                  alt=""
                  className="h-3.5 w-3.5 rounded-full object-cover"
                />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              )}
              <span>{article.source.name}</span>
              {article.source.verified && (
                <ShieldCheck className="h-3 w-3 text-current" title="Fuente Oficial Verificada" />
              )}
            </span>

            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-medium ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            >
              <CategoryIcon className="h-3 w-3" />
              <span>{article.category}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick View trigger */}
            {onQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(article);
                }}
                className="apple-press rounded-xl p-1.5 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                title="Vista previa rápida"
                aria-label="Vista previa rápida"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleBookmark(article);
              }}
              className={`apple-press rounded-xl p-1.5 transition-colors ${
                isBookmarked
                  ? 'bg-amber-400/25 text-amber-300 ring-1 ring-amber-400/40'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
              title={isBookmarked ? 'Quitar de guardados' : 'Guardar artículo'}
              aria-label={isBookmarked ? 'Quitar de guardados' : 'Guardar artículo'}
            >
              <Bookmark
                className={`h-4 w-4 transition-transform active:scale-90 ${
                  isBookmarked ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Media Thumbnail with Video Overlay if present */}
        {article.imageUrl && (
          <div
            onClick={() => onQuickView?.(article)}
            className="relative mt-3.5 overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950 cursor-pointer"
          >
            <img
              src={article.imageUrl}
              alt=""
              loading="lazy"
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-opacity group-hover:bg-black/10">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600/90 text-white shadow-xl shadow-red-600/40 ring-2 ring-white/40 transition-transform group-hover:scale-110">
                  <Play className="h-5 w-5 fill-white pl-0.5" />
                </span>
              </div>
            )}
            {isVideo && (
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
                Video / Short
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="mt-3.5 text-base font-bold text-white transition-colors duration-150 group-hover:text-cyan-300 subheading-title">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="focus:outline-none focus:underline"
          >
            {article.title}
          </a>
        </h3>

        {/* Snippet */}
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300/90 line-clamp-3">
          {article.snippet}
        </p>

        {/* Reading time + Hacker news stats */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400/90">
            <Clock className="h-3 w-3 text-cyan-400/80" />
            {readingTimeMin} min de lectura
          </span>

          {(article.hnScore !== undefined || article.hnComments !== undefined) && (
            <div className="flex items-center gap-2.5 text-orange-400/90 text-[11px]">
              {article.hnScore !== undefined && (
                <span className="flex items-center gap-1 font-semibold">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {article.hnScore} pts
                </span>
              )}
              {article.hnComments !== undefined && (
                <span className="flex items-center gap-1 font-semibold">
                  <MessageSquare className="h-3 w-3" />
                  {article.hnComments}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hashtags Pills */}
        {article.hashtags && article.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {article.hashtags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectHashtag?.(tag);
                }}
                className={`apple-press inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                  tag === '#midudev'
                    ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                    : 'bg-slate-800/80 text-cyan-300 hover:bg-cyan-500/20'
                }`}
                title={`Filtrar por ${tag}`}
              >
                <Hash className="h-2.5 w-2.5 opacity-60" />
                <span>{tag.replace('#', '')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Date, Author & Direct Actions */}
      <div className="mt-5 border-t border-white/[0.08] pt-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px]">
              {formatRelativeDate(article.pubDate)}
            </span>
            {article.author && (
              <span className="hidden sm:flex items-center gap-1 truncate max-w-[110px] text-slate-400 text-[11px]">
                <User className="h-3 w-3" />
                {article.author}
              </span>
            )}
          </div>

          {/* Social Share & View Article Buttons */}
          <div className="flex items-center gap-1">
            {/* Quick Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`apple-press rounded-lg p-1.5 transition-colors ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title={copied ? '¡Copiado!' : 'Copiar enlace'}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Link2 className="h-3.5 w-3.5" />}
            </button>

            {/* Share to Twitter / X */}
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-sky-500/15 hover:text-sky-300"
              title="Compartir en Twitter / X"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>

            {/* Share to Reddit */}
            <a
              href={redditShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-orange-500/15 hover:text-orange-300"
              title="Compartir en Reddit"
            >
              <RedditIcon className="h-3.5 w-3.5" />
            </a>

            {/* Share to LinkedIn */}
            <a
              href={linkedinShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-500/15 hover:text-blue-300"
              title="Compartir en LinkedIn"
            >
              <LinkedInIcon className="h-3.5 w-3.5" />
            </a>

            {/* Read full article button */}
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press inline-flex items-center gap-1 rounded-xl bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/25 hover:text-cyan-100 ring-1 ring-cyan-500/30"
              title={`Leer en ${article.source.domain}`}
            >
              <span>{isVideo ? 'Ver' : 'Leer'}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
