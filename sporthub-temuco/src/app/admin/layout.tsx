'use client';

import React, { useState, useEffect } from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';
import { useAdminProtection } from '@/hooks/useAdminProtection';
import { AdminToastProvider } from '@/components/admin/AdminToast';
import './dashboard.css'; // Asegurar que el CSS se carga en todo el admin

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState('Administrador');
  
  // Aplicar protección de autenticación y autorización
  useAdminProtection();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.nombre) {
      setUserName(userData.nombre);
    }
  }, []);

  return (
    <AdminToastProvider>
      <AdminsLayout 
        userRole="admin" 
        userName={userName}
        notificationCount={3}
      >
        {children}
      </AdminsLayout>
    </AdminToastProvider>
  );
}