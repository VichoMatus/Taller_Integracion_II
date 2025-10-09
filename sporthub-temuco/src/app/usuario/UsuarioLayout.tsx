'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import './UserLayout.css';

interface UserLayoutProps {
  children: React.ReactNode;
  userName: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | undefined;
  notificationCount?: number;
}

const UserLayout = ({
  children,
  userName,
  sport = undefined, // Ya está correcto
  notificationCount = 0,
}: UserLayoutProps) => {
  return (
    <div className="user-layout-container">
      {/* Header */}
      <Header
        userName={userName}
        userRole="usuario"
        notificationCount={notificationCount}
      />

      <div className="user-layout-main">
        {/* Sidebar */}
        <Sidebar userRole="usuario" sport={sport} />

        {/* Contenido principal */}
        <main className="user-layout-content">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserLayout;