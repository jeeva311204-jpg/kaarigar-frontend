import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, CloudOff, RefreshCw } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'sync';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          let bg = 'bg-paper-100 border-paper-300 text-indigo-950';
          let icon = <Info className="w-5 h-5 text-indigo-700 shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-[#F2F8F4] border-[#A8D5B5] text-emerald-950 shadow-craft-md';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-[#FCF2F0] border-terracotta-300 text-terracotta-900 shadow-craft-md';
            icon = <AlertCircle className="w-5 h-5 text-terracotta-600 shrink-0" />;
          } else if (toast.type === 'sync') {
            bg = 'bg-turmeric-50 border-turmeric-300 text-turmeric-900 shadow-craft-md';
            icon = <RefreshCw className="w-5 h-5 text-turmeric-600 shrink-0 animate-spin" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border flex items-start gap-3 shadow-craft animate-in fade-in slide-in-from-bottom-3 duration-200 ${bg}`}
              role="alert"
            >
              {icon}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-snug">{toast.title}</div>
                {toast.message && (
                  <div className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.message}</div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-700 p-1 -mr-1 -mt-1 rounded-lg transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
