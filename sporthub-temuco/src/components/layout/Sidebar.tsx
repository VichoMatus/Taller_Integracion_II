'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';

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
      active: pathname === '/admin' || pathname === '/admin/'
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
      href: '/usuario/perfil',
      active: pathname === '/usuario/perfil'
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
    <div className="sidebar-container">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <div className="sidebar-logo-icon">
            SH
          </div>
          <div>
            <h1 className="sidebar-title">SportHub</h1>
            <p className="sidebar-subtitle">{userTitle}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.name} className="sidebar-menu-item">
              <Link
                href={item.href}
                className={`sidebar-menu-link ${item.active ? 'active' : ''}`}
              >
                <span className="sidebar-menu-icon">{item.icon}</span>
                <span className="sidebar-menu-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="sidebar-logout">
        <button className="sidebar-logout-button">
          <span className="sidebar-logout-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;