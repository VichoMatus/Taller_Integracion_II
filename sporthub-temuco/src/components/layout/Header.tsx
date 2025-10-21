'use client';

import React from 'react';
import './Header.css';

interface HeaderProps {
  userName: string;
  userRole: 'usuario' | 'admin' | 'super_admin';
  notificationCount?: number;
}

const Header = ({ userName, userRole, notificationCount = 0 }: HeaderProps) => {
  const userTitle = userRole === 'super_admin' ? 'Superadministrador' : userRole === 'admin' ? 'Administrador' : 'Usuario';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="header-container">
      {/* Sección izquierda - Título de bienvenida */}
      <div className="header-welcome">
        <h1 className="header-title">Bienvenido, {userTitle}.</h1>
      </div>

      {/* Sección central - Barra de búsqueda */}
      <div className="header-search">
        <div className="search-container">
          <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar"
            className="search-input"
          />
        </div>
      </div>

      {/* Sección derecha - Usuario y notificaciones */}
      <div className="header-user">
        {/* Botón de notificaciones */}
        <button className="notification-button">
          <svg className="notification-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationCount > 0 && (
            <span className="notification-badge">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Perfil de usuario */}
        <div className="user-profile">
          <div className="user-info">
            <p className="user-name">{userName}</p>
            <p className="user-role">{userTitle}</p>
          </div>
          <div className="user-avatar">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
