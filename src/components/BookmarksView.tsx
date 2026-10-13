import React, { useState, useMemo } from 'react';
import type { Article } from '../types/news';
import { ArticleCard } from './ArticleCard';
import { Bookmark, Trash2, ArrowLeft, Search } from 'lucide-react';

interface BookmarksViewProps {
  bookmarks: Article[];
  searchQuery: string;
  onToggleBookmark: (article: Article) => void;
  onClearBookmarks: () => void;
  onBackToFeed: () => void;
  onQuickView?: (article: Article) => void;
  viewMode?: 'grid' | 'compact';
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  searchQuery,
  onToggleBookmark,
  onClearBookmarks,
  onBackToFeed,
  onQuickView,
  viewMode = 'grid',
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const q = searchQuery.toLowerCase().trim();
    return bookmarks.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.snippet.toLowerCase().includes(q) ||
        article.source.name.toLowerCase().includes(q)
    );
  }, [bookmarks, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header of bookmarks */}
      <div className="apple-glass flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl p-5 shadow-xl sm:p-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToFeed}
            className="apple-press rounded-xl border border-white/10 bg-slate-800/80 p-2.5 text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Volver al feed principal"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100 display-title">
              <Bookmark className="h-5 w-5 text-amber-400 fill-amber-400" />
              Artículos Guardados
            </h2>
            <p className="text-xs text-slate-400">
              {bookmarks.length} {bookmarks.length === 1 ? 'artículo guardado' : 'artículos guardados'} en este navegador
            </p>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <div>
            {!showConfirmClear ? (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vaciar lista
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300">¿Borrar todos?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearBookmarks();
                    setShowConfirmClear(false);
                  }}
                  className="apple-press rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 shadow-md"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="apple-press rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {bookmarks.length === 0 ? (
        <div className="apple-glass rounded-3xl p-12 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 shadow-lg">
            <Bookmark className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-100">
            No tienes artículos guardados aún
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-slate-400">
            Haz clic en el icono de marcador en cualquier tarjeta de noticia para guardar artículos y leerlos más tarde.
          </p>
          <button
            type="button"
            onClick={onBackToFeed}
            className="apple-press mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 hover:brightness-110"
          >
            Explorar Feed
          </button>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="apple-glass rounded-3xl p-8 text-center shadow-xl">
          <Search className="mx-auto h-8 w-8 text-slate-400" />
          <h4 className="mt-3 text-sm font-semibold text-slate-300">
            Ningún artículo guardado coincide con "{searchQuery}"
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Intenta buscar con otros términos clave.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'compact' ? 'space-y-3' : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
          {filteredBookmarks.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
              onQuickView={onQuickView}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
