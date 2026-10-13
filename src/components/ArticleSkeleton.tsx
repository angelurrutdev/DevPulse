import React from 'react';

interface ArticleSkeletonProps {
  count?: number;
}

export const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-lg animate-pulse"
        >
          <div>
            {/* Top badges */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded bg-slate-800" />
                <div className="h-5 w-24 rounded bg-slate-800" />
              </div>
              <div className="h-6 w-6 rounded-lg bg-slate-800" />
            </div>

            {/* Title */}
            <div className="mt-4 space-y-2">
              <div className="h-5 w-5/6 rounded bg-slate-800" />
              <div className="h-5 w-3/4 rounded bg-slate-800" />
            </div>

            {/* Snippet */}
            <div className="mt-4 space-y-2">
              <div className="h-3.5 w-full rounded bg-slate-800/70" />
              <div className="h-3.5 w-full rounded bg-slate-800/70" />
              <div className="h-3.5 w-2/3 rounded bg-slate-800/70" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-3">
            <div className="h-4 w-24 rounded bg-slate-800" />
            <div className="h-4 w-20 rounded bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
};
