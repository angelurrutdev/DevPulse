import React, { useEffect, useState } from 'react';
import type { Article } from '../types/news';
import { formatRelativeDate } from '../utils/formatters';
import {
  X,
  ExternalLink,
  Bookmark,
  Check,
  Clock,
  User,
  ShieldCheck,
  Play,
  Flame,
  MessageSquare,
  Sparkles,
  Link2,
} from 'lucide-react';
import { XIcon, RedditIcon, LinkedInIcon } from './SocialIcons';

interface ArticleQuickSheetProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  onSelectHashtag?: (tag: string) => void;
}

export const ArticleQuickSheet: React.FC<ArticleQuickSheetProps> = ({
  article,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onSelectHashtag,
}) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key (Apple Agency & Safety principle)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const isMidu = article.source.id === 'midudev';
  const isVideo = article.mediaType === 'video';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Translucent physical backdrop scrim */}
      <div
        className="apple-modal-scrim absolute inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Apple Sheet / Modal Surface */}
      <div
        className={`apple-glass relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
          isMidu
            ? 'border border-amber-400/35 ring-1 ring-amber-400/30 shadow-amber-950/30'
            : 'border border-white/10 ring-1 ring-white/10'
        }`}
      >
        {/* Grab indicator for mobile sheet */}
        <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Top bar: Source + Category + Close button */}
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide ${article.source.badgeColor}`}
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
                <ShieldCheck className="h-3 w-3 text-current" />
              )}
            </span>

            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>{article.category}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              type="button"
              onClick={() => onToggleBookmark(article)}
              className={`apple-press rounded-xl p-2 transition-colors ${
                isBookmarked
                  ? 'bg-amber-400/25 text-amber-300 ring-1 ring-amber-400/40'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
              title={isBookmarked ? 'Quitar de guardados' : 'Guardar artículo'}
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
              />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="apple-press rounded-xl border border-white/10 bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Cerrar (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Media if present */}
        {article.imageUrl && (
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
            <img
              src={article.imageUrl}
              alt=""
              className="max-h-64 w-full object-cover"
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl ring-2 ring-white/50">
                  <Play className="h-6 w-6 fill-white pl-0.5" />
                </span>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="mt-5 text-xl sm:text-2xl font-black text-white display-title">
          {article.title}
        </h2>

        {/* Metadata bar */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            {formatRelativeDate(article.pubDate)}
          </span>

          {article.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {article.author}
            </span>
          )}

          {(article.hnScore !== undefined || article.hnComments !== undefined) && (
            <span className="flex items-center gap-3 text-orange-400">
              {article.hnScore !== undefined && (
                <span className="flex items-center gap-1 font-semibold">
                  <Flame className="h-3.5 w-3.5" />
                  {article.hnScore} pts
                </span>
              )}
              {article.hnComments !== undefined && (
                <span className="flex items-center gap-1 font-semibold">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {article.hnComments} comentarios
                </span>
              )}
            </span>
          )}
        </div>

        {/* Article Summary Lead */}
        <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 text-sm sm:text-base leading-relaxed text-slate-200 border border-white/[0.06]">
          {article.snippet}
        </div>

        {/* Hashtags */}
        {article.hashtags && article.hashtags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {article.hashtags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onSelectHashtag?.(tag);
                  onClose();
                }}
                className={`apple-press rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  tag === '#midudev'
                    ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 ring-1 ring-amber-400/30'
                    : 'bg-slate-800/80 text-cyan-300 hover:bg-cyan-500/20 ring-1 ring-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Quick Actions & Social Sharing */}
        <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`apple-press inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                copied
                  ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                  : 'border-white/10 bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>¡Enlace copiado!</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>

            {/* Social Share Icons */}
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press rounded-xl border border-white/10 bg-slate-800/70 p-2 text-slate-300 hover:bg-sky-500/20 hover:text-sky-300"
              title="Compartir en Twitter / X"
            >
              <XIcon className="h-4 w-4" />
            </a>

            <a
              href={redditShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press rounded-xl border border-white/10 bg-slate-800/70 p-2 text-slate-300 hover:bg-orange-500/20 hover:text-orange-300"
              title="Compartir en Reddit"
            >
              <RedditIcon className="h-4 w-4" />
            </a>

            <a
              href={linkedinShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-press rounded-xl border border-white/10 bg-slate-800/70 p-2 text-slate-300 hover:bg-blue-500/20 hover:text-blue-300"
              title="Compartir en LinkedIn"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
          </div>

          {/* Primary Action Button */}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 transition-all hover:brightness-110"
          >
            <span>{isVideo ? 'Ver video en YouTube' : 'Abrir artículo original'}</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
