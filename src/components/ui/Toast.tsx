"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, Info, X, ExternalLink, ArrowRight } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  badge?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const [exiting, setExiting] = useState(false);
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleManualDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 200);
  };

  const icons = {
    success: <Check className="w-4 h-4 text-emerald-700" />,
    error: <AlertCircle className="w-4 h-4 text-rose-700" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-700" />,
    info: <Info className="w-4 h-4 text-nep-indigo" />,
  };

  const borders = {
    success: "border-emerald-300 bg-emerald-50/95",
    error: "border-rose-300 bg-rose-50/95",
    warning: "border-amber-300 bg-amber-50/95",
    info: "border-nep-indigo/30 bg-white/95",
  };

  const iconBgs = {
    success: "bg-emerald-100",
    error: "bg-rose-100",
    warning: "bg-amber-100",
    info: "bg-nep-indigo/10",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 overflow-hidden relative ${
        borders[toast.type]
      } ${
        exiting 
          ? "opacity-0 -translate-y-2 scale-95" 
          : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-3 duration-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-xl ${iconBgs[toast.type]} shrink-0 mt-0.5`}>
          {icons[toast.type]}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-heading text-xs font-bold text-nep-ink leading-tight">
              {toast.title}
            </h4>
            {toast.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-black/5 text-nep-ink/80 border border-black/10">
                {toast.badge}
              </span>
            )}
          </div>

          {toast.message && (
            <p className="text-[11px] text-nep-ink/75 mt-0.5 leading-relaxed line-clamp-2">
              {toast.message}
            </p>
          )}

          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                handleManualDismiss();
              }}
              className="mt-2 text-[10px] font-bold text-nep-indigo hover:text-nep-red transition-colors flex items-center gap-1 cursor-pointer underline"
            >
              <span>{toast.action.label}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleManualDismiss}
          className="text-nep-ink/40 hover:text-nep-ink p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          title="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtle Auto-dismiss Progress Bar */}
      {duration > 0 && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 overflow-hidden"
        >
          <div
            className="h-full bg-nep-ink/30 transition-all ease-linear"
            style={{
              animation: `toastProgressBar ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}
