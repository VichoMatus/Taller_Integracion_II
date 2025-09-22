import React from 'react';
import AdminsLayout from '@/components/layout/AdminsLayout';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const userName = 'Super Admin'; // TODO: Reemplazar por valor real
  const notificationCount = 5; // TODO: Reemplazar por valor real
  
  return (
    <AdminsLayout 
      userRole="superadmin" 
      userName={userName} 
      notificationCount={notificationCount}
    >
    </AdminsLayout>
  );
}