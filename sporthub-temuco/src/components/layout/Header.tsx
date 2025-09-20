'use client';

import React from 'react';

interface HeaderProps {
  userName: string;
  userRole: 'usuario' | 'admin' | 'superadmin';
  notificationCount?: number;
}

const Header = ({ userName, userRole, notificationCount = 0 }: HeaderProps) => {
  return (
    <header className={`fixed top-0 left-64 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-30 flex items-center justify-between px-6 ${userRole}`}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {userRole === 'superadmin' ? 'Panel de Superadministrador' : userRole === 'admin' ? 'Panel de Administración' : 'Panel de Usuario'}
        </h1>


      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-xs text-white items-center justify-center">
                  {notificationCount}
                </span>
              </span>
            )}
          </button>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden md:block">
            <p className="font-medium text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500">
              {userRole === 'superadmin' ? 'Superadministrador' : userRole === 'admin' ? 'Administrador' : 'Usuario'}
            </p>

          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-800 font-semibold">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;