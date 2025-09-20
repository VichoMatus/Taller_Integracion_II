'use client';

import React from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminsLayout 
      userRole="admin" 
      userName="Administrador" 
      notificationCount={3}
    >
      {children}
    </AdminsLayout>
  );
}