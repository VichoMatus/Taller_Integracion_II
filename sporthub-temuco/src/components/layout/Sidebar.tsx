'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import './Sidebar.css'; 
import indexStyles from './StylesSportsSideBar/IndexSideBar.module.css';
import basquetbolStyles from './StylesSportsSideBar/BasquetbolSideBar.module.css';
// import futbolStyles from './StylesSportsSideBar/FutbolSideBar.module.css';
// import tenisStyles from './StylesSportsSideBar/TenisSideBar.module.css';

interface SidebarProps {
  userRole: 'admin' | 'superadmin' | 'usuario';
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | undefined;
}

const Sidebar = ({ userRole, sport = undefined }: SidebarProps) => { // Cambiado a undefined por defecto
  const pathname = usePathname();

  // Función para obtener los estilos según el rol Y deporte
  const getSportStyles = () => {
    // 🔥 Si es admin o superadmin, devolver null (usará las clases CSS normales)
    if (userRole === 'admin' || userRole === 'superadmin') {
      return null; 
    }

    // 🔥 PRIMERO: Si no hay deporte seleccionado, usar indexStyles (color base)
    if (!sport) {
      return indexStyles;
    }

    if (pathname === '/' || pathname === '/sports' || pathname === '/sports/') {
      return indexStyles;
    }

    if (pathname === '/' || pathname === '/sports/reservacancha' || pathname === '/sports/reservacancha/') {
      return indexStyles;
    }
 
    switch (sport) {
      case 'basquetbol':
        return basquetbolStyles;
      case 'futbol':
        // return futbolStyles;
        return basquetbolStyles; // temporal
      case 'tenis':
        // return tenisStyles;
        return basquetbolStyles; // temporal
      case 'voleibol':
      case 'padel':
      default:
        return indexStyles; // Cambiado a indexStyles para casos no manejados
    }
  };

  const styles = getSportStyles();

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

  const usuarioMenuItems = [
    {
      name: 'Deportes',
      icon: '🏟️',
      href: '/sports',
      active: pathname === '/sports' || pathname === '/sports/' || pathname === '/'
    },
    {
      name: 'Reservas',
      icon: '📅',
      href: '/reservas',
      active: pathname === '/reservas'
    },
    {
      name: 'Mapa',
      icon: '🗺️',
      href: '/mapa',
      active: pathname === '/mapa'
    },
    {
      name: 'Favoritos',
      icon: '⭐',
      href: '/favoritos',
      active: pathname === '/favoritos'
    },
    {
      name: 'Perfil',
      icon: '👤',
      href: '/perfil',
      active: pathname === '/perfil'
    },
    {
      name: 'Mensajería',
      icon: '💬',
      href: '/mensajeria',
      active: pathname === '/mensajeria'
    }
  ];

  const menuItems = userRole === 'superadmin' ? superAdminMenuItems : userRole === 'admin' ? adminMenuItems : usuarioMenuItems;
  const userTitle = userRole === 'superadmin' ? 'Superadministrador' : userRole === 'admin' ? 'Administrador' : 'Usuario';

  return (
    <div className={styles ? styles.sidebarContainer : 'sidebar-container'}>
      {/* Header */}
      <div className={styles ? styles.sidebarHeader : 'sidebar-header'}>
        <div className={styles ? styles.sidebarLogoContainer : 'sidebar-logo-container'}>
          <div className={styles ? styles.sidebarLogoIcon : 'sidebar-logo-icon'}>
            SH
          </div>
          <div>
            <h1 className={styles ? styles.sidebarTitle : 'sidebar-title'}>SportHub</h1>
            <p className={styles ? styles.sidebarSubtitle : 'sidebar-subtitle'}>{userTitle}</p>
          </div>
        </div>
        {userRole === 'usuario' && sport && styles && <div className={styles.sportIcon}></div>}
      </div>

      {/* Navigation */}
      <nav className={styles ? styles.sidebarNav : 'sidebar-nav'}>
        <ul className={styles ? styles.sidebarMenu : 'sidebar-menu'}>
          {menuItems.map((item) => (
            <li key={item.name} className={styles ? styles.sidebarMenuItem : 'sidebar-menu-item'}>
              <Link
                href={item.href}
                className={`${styles ? styles.sidebarMenuLink : 'sidebar-menu-link'} ${
                  item.active ? (styles ? styles.active : 'active') : ''
                }`}
              >
                <span className={styles ? styles.sidebarMenuIcon : 'sidebar-menu-icon'}>
                  {item.icon}
                </span>
                <span className={styles ? styles.sidebarMenuText : 'sidebar-menu-text'}>
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={styles ? styles.sidebarLogout : 'sidebar-logout'}>
        <button className={styles ? styles.sidebarLogoutButton : 'sidebar-logout-button'}>
          <span className={styles ? styles.sidebarLogoutIcon : 'sidebar-logout-icon'}>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;