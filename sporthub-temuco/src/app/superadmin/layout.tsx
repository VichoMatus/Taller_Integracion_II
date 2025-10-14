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
  return (
    <AdminsLayout 
      userRole="superadmin" 
      userName={userName}
      notificationCount={3}
    >
      {children}
    </AdminsLayout>
  );
}