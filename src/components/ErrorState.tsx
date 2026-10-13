import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-rose-200">
        Ocurrió un problema al cargar las noticias
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-rose-300/80">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-500 disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>{isRetrying ? 'Reintentando...' : 'Reintentar conexión'}</span>
      </button>
    </div>
  );
};
