'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  userRole: 'admin' | 'superadmin';
  userName: string;
  notificationCount?: number;
  children: React.ReactNode;
}

const Layout = ({ userRole, userName, notificationCount = 0, children }: LayoutProps) => {
  return (
    <div className="flex bg-gray-50" style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
      <Sidebar userRole={userRole} />
      <div className="flex flex-col flex-1" style={{ marginLeft: '256px', paddingLeft: 0, minHeight: '100vh' }}>
        <Header 
          userRole={userRole} 
          userName={userName} 
          notificationCount={notificationCount} 
        />
        <main style={{ paddingLeft: 0, flex: 1, paddingBottom: '60px' }}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;