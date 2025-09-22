'use client';

import React from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminsLayout 
      userRole="superadmin" 
      userName="Superadministrador" 
      notificationCount={3}
    >
      {children}
    </AdminsLayout>
  );
}