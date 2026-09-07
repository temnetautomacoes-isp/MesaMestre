import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
          error: <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        };

        const bgBorders = {
          success: 'bg-white border-emerald-300 text-slate-800 shadow-emerald-950/10',
          warning: 'bg-white border-amber-300 text-slate-800 shadow-amber-950/10',
          error: 'bg-white border-rose-300 text-slate-800 shadow-rose-950/10',
          info: 'bg-white border-blue-300 text-slate-800 shadow-blue-950/10'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-xl p-3.5 shadow-lg flex items-start justify-between gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 ${bgBorders[toast.type]}`}
          >
            <div className="flex items-start gap-2.5">
              {icons[toast.type]}
              <div>
                <h4 className="text-sm font-bold text-[#0F2537] leading-tight">{toast.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{toast.description}</p>
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
