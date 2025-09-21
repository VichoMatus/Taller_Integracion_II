'use client';

import React from 'react';

interface HeaderProps {
  userName: string;
  userRole: 'usuario' | 'admin' | 'superadmin';
  notificationCount?: number;
}

const Header = ({ userName, userRole, notificationCount = 0 }: HeaderProps) => {
  const roleLabel =
    userRole === 'superadmin'
      ? 'Superadministrador'
      : userRole === 'admin'
      ? 'Administrador'
      : 'Usuario';

  const panelTitle =
    userRole === 'superadmin'
      ? 'Panel de Superadministrador'
      : userRole === 'admin'
      ? 'Panel de Administración'
      : 'Panel de Usuario';

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <header className="
      fixed top-0 left-0 right-0 h-16
      bg-gradient-to-r from-white/90 via-gray-50/80 to-white/90
      shadow-xl hover:shadow-2xl transition-shadow duration-300
      border-b border-gray-200 z-50
      flex items-center justify-between px-6 backdrop-blur-sm
    ">
      {/* Título */}
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900 transition-colors duration-200 hover:text-blue-600">
          {panelTitle}
        </h1>
      </div>

      {/* Notificaciones y perfil */}
      <div className="flex items-center space-x-4">
        {/* Notificaciones */}
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-25">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50"></span>
                <span className="relative inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold">
                  {notificationCount}
                </span>
              </span>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-gray-300/30"></div>

        {/* Avatar */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden md:block">
            <p className="font-medium text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500">{roleLabel}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer transform transition-transform hover:scale-110 shadow-lg">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
