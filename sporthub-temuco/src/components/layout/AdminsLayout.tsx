'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Sidebar.css';

interface LayoutProps {
  userRole: 'admin' | 'usuario' | 'super_admin';
  userName: string;
  notificationCount?: number;
  avatarUrl?: string | null;
  children: React.ReactNode;
}

const Layout = ({ userRole, userName, avatarUrl, children }: LayoutProps) => {
  return (
    <div className="flex bg-gray-50" style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
      <Sidebar userRole={userRole} />
      <div className="flex flex-col flex-1" style={{ marginLeft: '256px', paddingLeft: 0, minHeight: '100vh' }}>
        <Header 
          userRole={userRole} 
          userName={userName} 
          avatarUrl={avatarUrl}
        />
        <main style={{ paddingLeft: 0, flex: 1, paddingBottom: '60px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;