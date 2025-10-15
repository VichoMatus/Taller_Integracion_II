'use client';

import React, { useState, useEffect } from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';
import { useSuperAdminProtection } from '@/hooks/useSuperAdminProtection';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState('Superadministrador');
  
  useSuperAdminProtection();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.nombre) {
      setUserName(userData.nombre);
    }
  }, []);
  // Mapear super_admin a superadmin para mantener consistencia en la UI
  const storedRole = localStorage.getItem('user_role');
  const userRole = (storedRole === 'super_admin' ? 'superadmin' : storedRole) || 'superadmin';
  
  return (
    <AdminsLayout 
      userRole={userRole as 'admin' | 'superadmin'} 
      userName={userName}
      notificationCount={3}
    >
      {children}
    </AdminsLayout>
  );
}