'use client';

import React from 'react';
import { useCampus } from '@/context/CampusContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCampus();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
        let borderClass = 'border-indigo-500/30';
        let bgGlow = 'rgba(99, 102, 241, 0.08)';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          borderClass = 'border-emerald-500/30';
          bgGlow = 'rgba(16, 185, 129, 0.08)';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-500/30';
          bgGlow = 'rgba(245, 158, 11, 0.08)';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          borderClass = 'border-rose-500/30';
          bgGlow = 'rgba(244, 63, 94, 0.08)';
        }

        return (
          <div
            key={toast.id}
            style={{ backgroundColor: '#0f141f', backgroundImage: `radial-gradient(circle at top left, ${bgGlow}, transparent 70%)` }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${borderClass} shadow-xl shadow-black/40 animate-slide-up transition-all backdrop-blur-md`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white tracking-wide">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mr-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
