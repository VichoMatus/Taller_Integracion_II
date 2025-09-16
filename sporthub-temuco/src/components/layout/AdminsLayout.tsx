'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  userRole: 'admin' | 'superadmin';
  userName: string;
  notificationCount?: number;
}

const Layout = ({ userRole, userName, notificationCount = 0 }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64">
        <Header 
          userRole={userRole} 
          userName={userName} 
          notificationCount={notificationCount} 
        />
        <main className="p-6 mt-16">
        </main>
      </div>
    </div>
  );
};

export default Layout;