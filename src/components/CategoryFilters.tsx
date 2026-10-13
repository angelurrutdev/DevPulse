import React from 'react';
import type { CategoryFilterId } from '../types/news';
import {
  Layers,
  Sparkles,
  Radio,
  Code2,
  Cpu,
  Bookmark,
} from 'lucide-react';

interface CategoryFiltersProps {
  activeCategory: CategoryFilterId;
  onSelectCategory: (category: CategoryFilterId) => void;
  counts: Record<CategoryFilterId, number>;
  savedCount: number;
}

interface FilterTab {
  id: CategoryFilterId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const TABS: FilterTab[] = [
  { id: 'all', label: 'Todo el feed', icon: Layers, accentColor: 'text-cyan-400' },
  { id: 'software-dev', label: 'Software & Dev', icon: Code2, accentColor: 'text-emerald-400' },
  { id: 'ia-ml', label: 'IA & Machine Learning', icon: Sparkles, accentColor: 'text-purple-400' },
  { id: 'telecom', label: 'Telecomunicaciones', icon: Radio, accentColor: 'text-sky-400' },
  { id: 'general-tech', label: 'General Tech', icon: Cpu, accentColor: 'text-blue-400' },
  { id: 'saved', label: 'Guardados', icon: Bookmark, accentColor: 'text-amber-400' },
];

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
  savedCount,
}) => {
  return (
    <div className="relative scroll-edge-mask">
      <nav
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none py-1"
        aria-label="Filtros de Categoría Segmentados"
      >
        {TABS.map((tab, idx) => {
          const isActive = activeCategory === tab.id;
          const Icon = tab.icon;
          const count = tab.id === 'saved' ? savedCount : counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`apple-press group relative flex flex-shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'border border-cyan-400/60 bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-indigo-500/25 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                  : 'border border-transparent bg-slate-900/40 text-slate-300 hover:border-white/10 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                  isActive ? tab.accentColor : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span className="tracking-tight">{tab.label}</span>

              {/* Counter badge with tabular numbers */}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold badge-tracking transition-colors ${
                  isActive
                    ? 'bg-cyan-400/25 text-cyan-200 ring-1 ring-cyan-400/40'
                    : 'bg-slate-800/80 text-slate-400 group-hover:bg-slate-700/80 group-hover:text-slate-200'
                }`}
              >
                {count}
              </span>

              {/* Subtle hotkey indicator */}
              <span className="hidden lg:inline text-[10px] text-slate-500 opacity-60 font-mono">
                {idx + 1}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
