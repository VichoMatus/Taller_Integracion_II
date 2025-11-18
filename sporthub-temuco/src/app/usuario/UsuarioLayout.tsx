'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import './UserLayout.css';

interface UserLayoutProps {
  children: React.ReactNode;
  userName: string;
  avatarUrl?: string | null;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | undefined;
}

const UserLayout = ({
  children,
  userName,
  avatarUrl = null,
  sport = undefined,
}: UserLayoutProps) => {
  return (
    <div className="user-layout-container">
      {/* Header */}
      <Header
        userName={userName}
        userRole="usuario"
        avatarUrl={avatarUrl}
      />

      <div className="user-layout-main">
        {/* Sidebar */}
        <Sidebar userRole="usuario" sport={sport} />

        {/* Contenido principal */}
        <main className="user-layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
