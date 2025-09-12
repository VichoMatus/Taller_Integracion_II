'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userRole: 'admin' | 'superadmin';
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const pathname = usePathname();

  const adminMenuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      href: '/admin',
      active: pathname === '/admin'
    },
    {
      name: 'Estadísticas',
      icon: '📈',
      href: '/admin/estadisticas',
      active: pathname === '/admin/estadisticas'
    },
    {
      name: 'Gestionar Reseñas',
      icon: '⭐',
      href: '/admin/resenas',
      active: pathname === '/admin/resenas'
    },
    {
      name: 'Gestionar Canchas',
      icon: '🏟️',
      href: '/admin/canchas',
      active: pathname === '/admin/canchas'
    },
    {
      name: 'Gestionar Reservas',
      icon: '📅',
      href: '/admin/reservas',
      active: pathname === '/admin/reservas'
    },
    {
      name: 'Perfil',
      icon: '👤',
      href: '/admin/perfil',
      active: pathname === '/admin/perfil'
    }
  ];

  const superAdminMenuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      href: '/superadmin',
      active: pathname === '/superadmin'
    },
    {
      name: 'Gestión Administradores',
      icon: '👥',
      href: '/superadmin/administradores',
      active: pathname === '/superadmin/administradores'
    },
    {
      name: 'Gestión Usuarios',
      icon: '👤',
      href: '/superadmin/usuarios',
      active: pathname === '/superadmin/usuarios'
    },
    {
      name: 'Gestión de Canchas',
      icon: '🏟️',
      href: '/superadmin/canchas',
      active: pathname === '/superadmin/canchas'
    },
    {
      name: 'Estadísticas Globales',
      icon: '📈',
      href: '/superadmin/estadisticas',
      active: pathname === '/superadmin/estadisticas'
    },
    {
      name: 'Perfil',
      icon: '🔧',
      href: '/superadmin/perfil',
      active: pathname === '/superadmin/perfil'
    }
  ];

  const menuItems = userRole === 'superadmin' ? superAdminMenuItems : adminMenuItems;
  const userTitle = userRole === 'superadmin' ? 'Superadministrador' : 'Administrador';

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">SH</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SportHub</h1>
            <p className="text-sm text-gray-500">{userTitle}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  item.active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-4 right-4">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
          <span className="text-lg">🚪</span>
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;