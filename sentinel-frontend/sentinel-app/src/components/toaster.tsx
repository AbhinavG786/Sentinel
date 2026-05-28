"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let toastListeners: Array<(toast: Toast) => void> = [];

export function toast(type: ToastType, title: string, message?: string) {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach((l) => l({ id, type, title, message }));
}

toast.success = (title: string, message?: string) => toast("success", title, message);
toast.error = (title: string, message?: string) => toast("error", title, message);
toast.warning = (title: string, message?: string) => toast("warning", title, message);
toast.info = (title: string, message?: string) => toast("info", title, message);

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-emerald-500/30",
  error: "border-red-500/30",
  warning: "border-yellow-500/30",
  info: "border-blue-500/30",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast) => {
      setToasts((prev) => [t, ...prev].slice(0, 5));
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 5000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-xl animate-slide-in-right",
            "bg-[#111827]/95 backdrop-blur-sm min-w-[300px] max-w-[380px]",
            borderColors[t.type]
          )}
        >
          <div className="mt-0.5 flex-shrink-0">{icons[t.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{t.title}</p>
            {t.message && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{t.message}</p>
            )}
          </div>
          <button
            onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
