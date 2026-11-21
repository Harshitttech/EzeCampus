import React from 'react';
import { CheckCircle2, Info, X, AlertCircle } from 'lucide-react';
import { useCampus } from '../context/CampusContext';

export const ToastStack: React.FC = () => {
  const { toasts, dismissToast } = useCampus();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2.5rem)]"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.tone === 'success'
            ? CheckCircle2
            : toast.tone === 'error'
              ? AlertCircle
              : Info;
        const accent =
          toast.tone === 'success'
            ? 'text-emerald-600 dark:text-emerald-400'
            : toast.tone === 'error'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-indigo-600 dark:text-indigo-400';

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-lg text-sm text-slate-800 dark:text-slate-100"
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${accent}`} />
            <p className="flex-1 leading-snug">{toast.text}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
