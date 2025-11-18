"use client";

import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast { id: number; type: ToastType; title?: string; message: string }

interface ToastContextValue {
  show: (type: ToastType, message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useAdminToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useAdminToast must be used within AdminToastProvider');
  return ctx;
};

export const AdminToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (type: ToastType, message: string, title?: string) => {
    const id = Math.floor(Math.random() * 1000000);
    const toast: Toast = { id, type, message, title };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="admin-toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`admin-toast admin-toast-${t.type}`} role="status">
            {t.title && <div className="admin-toast-title">{t.title}</div>}
            <div className="admin-toast-message">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default AdminToastProvider;
