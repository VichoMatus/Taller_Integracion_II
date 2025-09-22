'use client';

//Hola, si lees esto y no soy yo te cuento que este archivo es el layout para la seccion de usuario
//pero solo es provisional, faltan muchas cosas por modificar y mejorar
//ya que los componentes del admin que ajuste para que funcionen en el usuario no funcionan correctamente
//pronto cuando se realice la reunion de Frontend vere como modificarlo
//esto es solo como para crear bien las paginas y que funcionen correctamente con este
//layout probicional. eso  c;

import React, { ReactNode } from 'react';
import Link from 'next/link';

// Sidebar
interface SidebarProps {
  userRole: 'usuario';
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const menuItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Canchas', href: '/canchas' },
    { name: 'Mis Reservas', href: '/reservas' },
    { name: 'Perfil', href: '/perfil' },
  ];

  return (
    <aside className="w-[230px] flex-shrink-0 bg-white shadow-lg h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">SH</div>
        <h1 className="text-lg font-semibold text-gray-900">SportHub</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-6">
        <ul className="flex flex-col space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="block px-4 py-2 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full py-2 px-4 rounded hover:bg-red-50 text-red-600 font-medium transition-colors duration-200">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

// Header
interface HeaderProps {
  userName: string;
  notificationCount?: number;
}

const Header = ({ userName, notificationCount = 0 }: HeaderProps) => {
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="h-[64px] bg-gradient-to-r from-white/90 via-gray-50/80 to-white/90 shadow flex items-center justify-between px-6 border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-900">Panel de Usuario</h1>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-transform duration-150">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50"></span>
                <span className="relative inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold">{notificationCount}</span>
              </span>
            )}
          </button>
        </div>

        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
};

// Layout
type UsuarioLayoutProps = {
  children: ReactNode;
  userName?: string;
  notificationCount?: number;
};

export default function UsuarioLayout({
  children,
  userName = 'Usuario',
  notificationCount = 0,
}: UsuarioLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar userRole="usuario" />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header userName={userName} notificationCount={notificationCount} />

        {/* Main page content */}
        <main className="flex-1 mt-[64px] p-6 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4 text-sm text-gray-600">
          SportHub © 2025 - Conectamos deportistas con los mejores recintos deportivos
        </footer>
      </div>
    </div>
  );
}
