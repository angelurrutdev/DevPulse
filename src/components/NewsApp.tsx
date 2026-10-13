import React, { useMemo, useState, useEffect } from 'react';
import type { NewsApiResponse, Article, CategoryFilterId } from '../types/news';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { Navbar } from './Navbar';
import { CategoryFilters } from './CategoryFilters';
import { SourceFilter } from './SourceFilter';
import { HashtagBar } from './HashtagBar';
import { MidudevSpotlight } from './MidudevSpotlight';
import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import { BookmarksView } from './BookmarksView';
import { ErrorState } from './ErrorState';
import { ArticleQuickSheet } from './ArticleQuickSheet';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Hash,
} from 'lucide-react';

interface NewsAppProps {
  initialData?: NewsApiResponse | null;
}

export const NewsApp: React.FC<NewsAppProps> = ({ initialData }) => {
  const {
    articles,
    filteredArticles,
    sourcesStatus,
    trendingHashtags,
    lastFetched,
    isLoading,
    isRefreshing,
    error,
    categoryFilter,
    setCategoryFilter,
    sourceFilter,
    setSourceFilter,
    hashtagFilter,
    setHashtagFilter,
    searchQuery,
    setSearchQuery,
    categoryCounts,
    fetchNews,
  } = useNews({ initialData });

  const {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    clearBookmarks,
    bookmarkCount,
  } = useBookmarks();

  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [quickViewArticle, setQuickViewArticle] = useState<Article | null>(null);

  const isSavedView = categoryFilter === 'saved';

  // Filter midudev articles for the spotlight section
  const miduArticles = useMemo(
    () => articles.filter((a) => a.source.id === 'midudev'),
    [articles]
  );

  const isMiduOnly = sourceFilter === 'midudev';

  // Keyboard navigation for categories (1-5 keys)
  useEffect(() => {
    const handleCategoryKeys = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const keyMap: Record<string, CategoryFilterId> = {
        '1': 'all',
        '2': 'software-dev',
        '3': 'ia-ml',
        '4': 'telecom',
        '5': 'general-tech',
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        setCategoryFilter(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleCategoryKeys);
    return () => window.removeEventListener('keydown', handleCategoryKeys);
  }, [setCategoryFilter]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070913] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 overflow-x-hidden">
      {/* Ambient Physical Glow (Apple design depth & vibrancy) */}
      <div className="ambient-glow" aria-hidden="true">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* Top Floating Glass Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => fetchNews(true)}
        isRefreshing={isRefreshing}
        lastFetched={lastFetched}
        savedCount={bookmarkCount}
        isSavedView={isSavedView}
        onToggleSavedView={() => {
          setCategoryFilter(isSavedView ? 'all' : 'saved');
        }}
        onSelectMidu={() => {
          const next = isMiduOnly ? 'all' : 'midudev';
          setSourceFilter(next);
          if (next === 'midudev') {
            setCategoryFilter('all');
          }
        }}
        isMiduActive={isMiduOnly}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Main Container */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Midudev Spotlight Section (when not in saved view) */}
        {!isSavedView && miduArticles.length > 0 && (
          <MidudevSpotlight
            miduArticles={miduArticles}
            activeSource={sourceFilter}
            onSelectSource={(source) => {
              setSourceFilter(source);
              if (source === 'midudev') {
                setCategoryFilter('all');
              }
            }}
            onArticleClick={(article) => setQuickViewArticle(article)}
          />
        )}

        {/* Filters and Navigation Control Center */}
        {!isSavedView && (
          <div className="apple-glass space-y-4 rounded-3xl p-5 shadow-2xl sm:p-6">
            {/* Category tabs */}
            <CategoryFilters
              activeCategory={categoryFilter}
              onSelectCategory={(cat) => {
                setCategoryFilter(cat);
              }}
              counts={categoryCounts}
              savedCount={bookmarkCount}
            />

            {/* Trending Developer Hashtags & Social exploration */}
            <div className="border-t border-white/[0.08] pt-3.5">
              <HashtagBar
                hashtags={trendingHashtags}
                activeHashtag={hashtagFilter}
                onSelectHashtag={setHashtagFilter}
              />
            </div>

            {/* Official Developer Sources & Media filters */}
            <div className="border-t border-white/[0.08] pt-3">
              <SourceFilter
                activeSource={sourceFilter}
                onSelectSource={(source) => {
                  setSourceFilter(source);
                  if (source === 'midudev') {
                    setCategoryFilter('all');
                  }
                }}
                sourcesStatus={sourcesStatus}
              />
            </div>
          </div>
        )}

        {/* Active Hashtag or Search Filter Feedback Banner */}
        {((hashtagFilter && !isSavedView) || (searchQuery.trim() && !isSavedView)) && (
          <div className="apple-glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              {hashtagFilter && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/20 px-2.5 py-1 font-semibold text-cyan-300 ring-1 ring-cyan-500/30">
                  <Hash className="h-3 w-3" />
                  Hashtag: {hashtagFilter}
                </span>
              )}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Search className="h-3.5 w-3.5 text-cyan-400" />
                  Búsqueda: <strong className="text-white">"{searchQuery}"</strong>
                </span>
              )}

              <span className="text-slate-400">
                ({filteredArticles.length} resultados encontrados)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hashtagFilter && (
                <button
                  type="button"
                  onClick={() => setHashtagFilter(null)}
                  className="apple-press text-xs font-semibold text-cyan-400 underline hover:text-cyan-200"
                >
                  Quitar hashtag
                </button>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="apple-press text-xs font-semibold text-cyan-400 underline hover:text-cyan-200"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          </div>
        )}

        {/* View Switcher: Bookmarks vs News Feed */}
        {isSavedView ? (
          <BookmarksView
            bookmarks={bookmarks}
            searchQuery={searchQuery}
            onToggleBookmark={toggleBookmark}
            onClearBookmarks={clearBookmarks}
            onBackToFeed={() => setCategoryFilter('all')}
            onQuickView={(article) => setQuickViewArticle(article)}
            viewMode={viewMode}
          />
        ) : (
          <div>
            {/* Error Banner */}
            {error && (
              <div className="mb-6">
                <ErrorState
                  message={error}
                  onRetry={() => fetchNews(true)}
                  isRetrying={isRefreshing}
                />
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading ? (
              <ArticleSkeleton count={6} />
            ) : filteredArticles.length === 0 ? (
              /* Empty state */
              <div className="apple-glass rounded-3xl p-12 text-center shadow-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-300 ring-1 ring-white/10 shadow-lg">
                  <Search className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white display-title">
                  No se encontraron noticias
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-slate-400">
                  {searchQuery.trim()
                    ? `No hay artículos que coincidan con la búsqueda "${searchQuery}".`
                    : hashtagFilter
                      ? `No hay artículos etiquetados con "${hashtagFilter}".`
                      : 'No hay artículos disponibles con los filtros actuales.'}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="apple-press rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-md"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                  {hashtagFilter && (
                    <button
                      type="button"
                      onClick={() => setHashtagFilter(null)}
                      className="apple-press rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-md"
                    >
                      Limpiar hashtag
                    </button>
                  )}
                  {sourceFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSourceFilter('all')}
                      className="apple-press rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-md"
                    >
                      Restablecer fuentes
                    </button>
                  )}
                  {categoryFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      className="apple-press rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-md"
                    >
                      Ver todas las categorías
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Articles Feed */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Layers className="h-3.5 w-3.5 text-cyan-400" />
                    Mostrando {filteredArticles.length} artículos y videos
                  </span>
                  {isRefreshing && (
                    <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Sincronizando feeds oficiales...
                    </span>
                  )}
                </div>

                <div
                  className={
                    viewMode === 'compact'
                      ? 'space-y-3'
                      : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
                  }
                >
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      isBookmarked={isBookmarked(article.id)}
                      onToggleBookmark={toggleBookmark}
                      onSelectHashtag={(tag) => setHashtagFilter(tag)}
                      onQuickView={(art) => setQuickViewArticle(art)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Source Health & Status Section */}
        <section className="apple-glass mt-12 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Database className="h-3.5 w-3.5 text-cyan-400" />
                Estado de Redes & Feeds de Desarrolladores
              </h4>
              <p className="mt-0.5 text-xs text-slate-400">
                Sincronización en tiempo real con canales de creadores, blogs oficiales y APIs tech
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sourcesStatus.length > 0 ? (
                sourcesStatus.map((source) => (
                  <div
                    key={source.sourceId}
                    className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-900/60 px-2.5 py-1 text-xs shadow-sm"
                    title={source.error || `${source.itemCount} artículos obtenidos`}
                  >
                    {source.status === 'ok' ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-rose-400" />
                    )}
                    <span className="font-semibold text-slate-200">{source.name}</span>
                    <span className="text-[10px] text-slate-400 badge-tracking">({source.itemCount})</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">Fuentes listas</span>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Apple-style Interactive Quick Inspector Sheet */}
      <ArticleQuickSheet
        article={quickViewArticle}
        isOpen={!!quickViewArticle}
        onClose={() => setQuickViewArticle(null)}
        isBookmarked={quickViewArticle ? isBookmarked(quickViewArticle.id) : false}
        onToggleBookmark={toggleBookmark}
        onSelectHashtag={(tag) => setHashtagFilter(tag)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-slate-950/80 py-8 text-center text-xs text-slate-400 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-2">
          <p className="font-bold text-slate-200 flex items-center justify-center gap-1.5">
            DevPulse · Radar Developer & Tech News Hub
          </p>
          <p className="text-[11px] text-slate-400">
            Conectado a midudev, Cisco, AT&T México, Huawei, GitHub, Google web.dev, Vercel, Hugging Face, Hacker News, Medium y TechCrunch
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-400 pt-1">
            <span>Astro 7</span>
            <span>•</span>
            <span>React 19</span>
            <span>•</span>
            <span>Apple Fluid Interface Design</span>
            <span>•</span>
            <span>TailwindCSS</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-slate-900 px-1 py-0.5 text-[9px] font-mono">1-5</kbd>
              <span>Categorías</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-slate-900 px-1 py-0.5 text-[9px] font-mono">/</kbd>
              <span>Buscar</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
