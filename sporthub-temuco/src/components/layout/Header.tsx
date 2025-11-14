'use client';

import React from 'react';
import './Header.css';
import { NotificacionesDropdown } from '@/components/notificacionesdrop/NotificacionesDropdown';

interface HeaderProps {
  userName: string;
  userRole: 'usuario' | 'admin' | 'super_admin';
}

const Header = ({ userName, userRole }: HeaderProps) => {
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
        {/* Componente de notificaciones con dropdown funcional */}
        <NotificacionesDropdown />

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
