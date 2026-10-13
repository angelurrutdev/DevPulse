import React, { useRef, useEffect } from 'react';
import {
  Activity,
  Search,
  X,
  RefreshCw,
  Bookmark,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import { formatRelativeDate } from '../utils/formatters';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastFetched: string;
  savedCount: number;
  isSavedView: boolean;
  onToggleSavedView: () => void;
  onSelectMidu?: () => void;
  isMiduActive?: boolean;
  viewMode?: 'grid' | 'compact';
  onToggleViewMode?: (mode: 'grid' | 'compact') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  lastFetched,
  savedCount,
  isSavedView,
  onToggleSavedView,
  onSelectMidu,
  isMiduActive,
  viewMode = 'grid',
  onToggleViewMode,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Apple-grade keyboard accessibility: press '/' or '⌘K' / 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="apple-glass sticky top-0 z-40 transition-all duration-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        {/* Brand / Logo: DevPulse */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Activity className="h-5 w-5 text-white animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white display-title">
                  Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Pulse</span>
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  RADAR EN VIVO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ecosistema developer, midudev & tendencias tech
              </p>
            </div>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:hidden">
            {onToggleViewMode && (
              <button
                type="button"
                onClick={() => onToggleViewMode(viewMode === 'grid' ? 'compact' : 'grid')}
                className="apple-press rounded-xl border border-white/10 bg-slate-900/60 p-2 text-slate-400"
                title={viewMode === 'grid' ? 'Vista compacta' : 'Vista en cuadrícula'}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </button>
            )}

            {onSelectMidu && (
              <button
                type="button"
                onClick={onSelectMidu}
                className={`apple-press rounded-xl p-2 transition-colors ${
                  isMiduActive
                    ? 'border border-amber-400/50 bg-amber-400/20 text-amber-300'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
                title="Filtrar por midudev"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="apple-press rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:text-slate-200"
              title="Actualizar feeds"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onToggleSavedView}
              className={`apple-press relative rounded-xl border p-2 transition-colors ${
                isSavedView
                  ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400'
              }`}
              title="Ver guardados"
            >
              <Bookmark className="h-4 w-4" />
              {savedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-950">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Center: Search input with Apple shortcut badge */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por tecnología, hashtag, título o autor... (/)"
            className="w-full rounded-2xl border border-white/[0.08] bg-slate-900/70 py-2 pl-9 pr-14 text-xs sm:text-sm text-slate-100 placeholder-slate-400 transition-all focus:border-cyan-400/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                searchInputRef.current?.focus();
              }}
              className="apple-press absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="hidden sm:inline-flex items-center rounded-md border border-white/10 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 font-mono shadow-sm">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Desktop actions: View switch, Last synced, Midu Spotlight, Refresh, Bookmarks */}
        <div className="hidden items-center gap-2.5 sm:flex">
          {/* Segmented View Mode Toggle (Grid vs Compact) */}
          {onToggleViewMode && (
            <div className="flex items-center rounded-xl border border-white/[0.08] bg-slate-900/60 p-0.5">
              <button
                type="button"
                onClick={() => onToggleViewMode('grid')}
                className={`apple-press rounded-lg p-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista en tarjetas"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('compact')}
                className={`apple-press rounded-lg p-1.5 transition-all ${
                  viewMode === 'compact'
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista editorial compacta"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {onSelectMidu && (
            <button
              type="button"
              onClick={onSelectMidu}
              className={`apple-press inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                isMiduActive
                  ? 'border-amber-400/80 bg-amber-400/25 text-amber-200 shadow-sm shadow-amber-400/20 ring-1 ring-amber-400/40'
                  : 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
              }`}
              title="Filtrar canal de midudev"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>midudev</span>
            </button>
          )}

          <span className="text-xs text-slate-400" title={`Última sincronización: ${lastFetched}`}>
            {formatRelativeDate(lastFetched)}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            title="Recargar todos los feeds y APIs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSavedView}
            className={`apple-press inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              isSavedView
                ? 'border-amber-400/60 bg-amber-400/20 text-amber-300 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/40'
                : 'border-white/[0.08] bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
            title="Ver artículos guardados"
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSavedView ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
            <span>Guardados</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isSavedView
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {savedCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
