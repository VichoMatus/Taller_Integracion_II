'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import './UserLayout.css';

interface UserLayoutProps {
  children: React.ReactNode;
  userName: string;
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | undefined; //Por ahora quiza solo esta esto asi
  // pero en un futuoro la idea es que se muestre el deporte para que el usuario vea su deporte favorito, esto si aun no se implementa
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
    </div>
  );
};

export default UserLayout;
