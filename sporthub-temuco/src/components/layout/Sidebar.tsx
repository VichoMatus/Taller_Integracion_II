'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import './Sidebar.css'; 
import indexStyles from './StylesSportsSideBar/IndexSideBar.module.css';
import basquetbolStyles from './StylesSportsSideBar/BasquetbolSideBar.module.css';
import futbolStyles from './StylesSportsSideBar/FutbolSideBar.module.css';
import padelStyles from './StylesSportsSideBar/PadelSideBar.module.css';
import crossfitentrenamientofuncionalStyles from './StylesSportsSideBar/CrossfitEntrenamientoFuncionalSideBar.module.css';
import escaladaStyles from './StylesSportsSideBar/EscaladaSideBar.module.css';
// import tenisStyles from './StylesSportsSideBar/TenisSideBar.module.css';
// import futbolStyles from './StylesSportsSideBar/FutbolSideBar.module.css';
import tenisStyles from './StylesSportsSideBar/TenisSideBar.module.css';
import voleiStyles from './StylesSportsSideBar/VoleibolSideBar.module.css';
import natacionStyles from './StylesSportsSideBar/NatacionSideBar.module.css';
import patinajeStyles from './StylesSportsSideBar/PatinajeSideBar.module.css';
import enduroStyles from './StylesSportsSideBar/EnduroSideBar.module.css';
// import tenisStyles from './StylesSportsSideBar/TenisSideBar.module.css';
import futbolamericanoStyles from './StylesSportsSideBar/FutbolAmericanoSideBar.module.css';
import rugbyStyles from './StylesSportsSideBar/RugbySideBar.module.css';
import mountainbikeStyles from './StylesSportsSideBar/MountainBikeSideBar.module.css';

interface SidebarProps {
  userRole: 'admin' | 'superadmin' | 'usuario';
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'crossfitentrenamientofuncional' | 'natacion' | 'patinaje'| 'enduro' | 'rugby' | 'futbol-americano' | 'mountain-bike' | 'escalada';
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
    
    // Ensure Favoritos and Mensajería use the generic Sports styles (not the sport-specific ones)
    if (pathname && (pathname.startsWith('/sports/favoritos') || pathname.startsWith('/sports/mensajeria'))) {
      return indexStyles;
    }
 
    switch (sport) {
      case 'basquetbol':
        return basquetbolStyles;
      case 'futbol':
        return futbolStyles; 
      case 'tenis':
       return tenisStyles;
      case 'voleibol':
        return voleiStyles;
      case 'padel':
        return padelStyles;
      case 'crossfitentrenamientofuncional':
        return crossfitentrenamientofuncionalStyles;
      case 'natacion':
        return natacionStyles;
      case 'patinaje':
        return patinajeStyles;
        // return tenisStyles;
        return basquetbolStyles; // temporal
      case 'voleibol':
      case 'padel':
      case 'enduro':
        return enduroStyles;
      case 'futbol-americano':
        return futbolamericanoStyles;
      case 'rugby':
        return rugbyStyles;
      case 'mountain-bike':
        return mountainbikeStyles;


      case 'escalada':
        return escaladaStyles;
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
      href: '/sports/favoritos',
      active: pathname === '/sports/favoritos'
    },
    {
      name: 'Perfil',
      icon: '👤',
      href: '/usuario/perfil',
      active: pathname === '/usuario/perfil'
    },
    {
      name: 'Mensajería',
      icon: '💬',
      href: '/sports/mensajeria',
      active: pathname && pathname.startsWith('/sports/mensajeria')
    }
  ];

  const menuItems = userRole === 'superadmin' ? superAdminMenuItems : userRole === 'admin' ? adminMenuItems : usuarioMenuItems;
  const userTitle = userRole === 'superadmin' ? 'Superadministrador' : userRole === 'admin' ? 'Administrador' : 'Usuario';

  return (
    <div className={styles ? styles.sidebarContainer : 'sidebarContainer'}>
      {/* Header */}
      <div className={styles ? styles.sidebarHeader : 'sidebarHeader'}>
        <div className={styles ? styles.sidebarLogoContainer : 'sidebarLogoContainer'}>
          <div className={styles ? styles.sidebarLogoIcon : 'sidebarLogoIcon'}>
            SH
          </div>
          <div>
            <h1 className={styles ? styles.sidebarTitle : 'sidebarTitle'}>SportHub</h1>
            <p className={styles ? styles.sidebarSubtitle : 'sidebarSubtitle'}>{userTitle}</p>
          </div>
        </div>
        {userRole === 'usuario' && sport && styles && <div className={styles.sportIcon}></div>}
      </div>

      {/* Navigation */}
      <nav className={styles ? styles.sidebarNav : 'sidebarNav'}>
        <ul className={styles ? styles.sidebarMenu : 'sidebarMenu'}>
          {menuItems.map((item) => (
            <li key={item.name} className={styles ? styles.sidebarMenuItem : 'sidebarMenuItem'}>
              <Link
                href={item.href}
                className={`${styles ? styles.sidebarMenuLink : 'sidebarMenuLink'} ${
                  item.active ? (styles ? styles.active : 'active') : ''
                }`}
              >
                <span className={styles ? styles.sidebarMenuIcon : 'sidebarMenuIcon'}>
                  {item.icon}
                </span>
                <span className={styles ? styles.sidebarMenuText : 'sidebarMenuText'}>
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={styles ? styles.sidebarLogout : 'sidebarLogout'}>
        <button className={styles ? styles.sidebarLogoutButton : 'sidebarLogoutButton'}>
          <span className={styles ? styles.sidebarLogoutIcon : 'sidebarLogoutIcon'}>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;