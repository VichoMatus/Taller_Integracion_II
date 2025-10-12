'use client';

import React, { useState, useEffect } from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';
import { useAdminProtection } from '@/hooks/useAdminProtection';

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
    <AdminsLayout 
      userRole="admin" 
      userName={userName}
      notificationCount={3}
    >
      {children}
    </AdminsLayout>
  );
}