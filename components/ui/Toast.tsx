'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm max-w-sm w-full backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-800 text-rose-100'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}

            <span className="flex-1 font-medium">{toast.message}</span>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
