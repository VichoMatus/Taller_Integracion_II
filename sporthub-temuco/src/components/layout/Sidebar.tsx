'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAuthStatus } from '@/hooks/useAuthStatus'; // 🔥 NUEVO IMPORT

import './Sidebar.css'; 
import indexStyles from './StylesSportsSideBar/IndexSideBar.module.css';
import basquetbolStyles from './StylesSportsSideBar/BasquetbolSideBar.module.css';
import futbolStyles from './StylesSportsSideBar/FutbolSideBar.module.css';
import padelStyles from './StylesSportsSideBar/PadelSideBar.module.css';
import crossfitentrenamientofuncionalStyles from './StylesSportsSideBar/CrossfitEntrenamientoFuncionalSideBar.module.css';
import escaladaStyles from './StylesSportsSideBar/EscaladaSideBar.module.css';
import atletismoStyles from './StylesSportsSideBar/AtletismoSideBar.module.css';
import ciclismoStyles from './StylesSportsSideBar/CiclismoSideBar.module.css';
import kartingStyles from './StylesSportsSideBar/KartingSideBar.module.css';
import tenisStyles from './StylesSportsSideBar/TenisSideBar.module.css';
import voleiStyles from './StylesSportsSideBar/VoleibolSideBar.module.css';
import natacionStyles from './StylesSportsSideBar/NatacionSideBar.module.css';
import patinajeStyles from './StylesSportsSideBar/PatinajeSideBar.module.css';
import enduroStyles from './StylesSportsSideBar/EnduroSideBar.module.css';
import futbolamericanoStyles from './StylesSportsSideBar/FutbolAmericanoSideBar.module.css';
import rugbyStyles from './StylesSportsSideBar/RugbySideBar.module.css';
import mountainbikeStyles from './StylesSportsSideBar/MountainBikeSideBar.module.css';

interface SidebarProps {
  userRole: 'admin' | 'super_admin' | 'super_admin' | 'usuario';
  sport?: 'basquetbol' | 'futbol' | 'tenis' | 'voleibol' | 'padel' | 'crossfitentrenamientofuncional' | 'natacion' | 'patinaje'| 'enduro' | 'rugby' | 'futbol-americano' | 'mountain-bike' | 'escalada' | 'atletismo' | 'skate' | 'ciclismo' | 'karting';
}

const Sidebar = ({ userRole, sport = undefined }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // 🔥 USAR EL HOOK DE AUTENTICACIÓN
  const { isAuthenticated, isLoading, user } = useAuthStatus();

  // 🔥 FUNCIÓN DE LOGOUT MEJORADA
  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando proceso de logout...');
      
      // Llamar al servicio de logout
      await authService.logout();
      
      console.log('✅ Logout exitoso, redirigiendo al login...');
      
      // recargar la pagina para ver el cambio
      window.location.reload();
      
    } catch (error: any) {
      console.error('❌ Error durante el logout:', error);
      
      // Aunque haya error, limpiar la sesión local y redirigir
      authService.clearSession();
      window.location.reload();
    }
  };

  // Función para obtener los estilos según el rol Y deporte
  const getSportStyles = () => {
    // 🔥 Si es admin o super_admin (cualquier variante), devolver null (usará las clases CSS normales)
    if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'super_admin') {
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
      case 'skate':
        return indexStyles;
      case 'atletismo':
        console.log('🏃 Using atletismoStyles for Atletismo');
        return atletismoStyles;
      case 'ciclismo':
        return ciclismoStyles;
      case 'karting':
        return kartingStyles;
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
        return indexStyles; 
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
      href: '/super_admin',
      active: pathname === '/super_admin'
    },
    {
      name: 'Gestión Administradores',
      icon: '👥',
      href: '/super_admin/administradores',
      active: pathname === '/super_admin/administradores'
    },
    {
      name: 'Gestión Usuarios',
      icon: '👤',
      href: '/super_admin/usuarios',
      active: pathname === '/super_admin/usuarios'
    },
    {
      name: 'Gestión de Canchas',
      icon: '🏟️',
      href: '/super_admin/canchas',
      active: pathname === '/super_admin/canchas'
    },
    {
      name: 'Estadísticas Globales',
      icon: '📈',
      href: '/super_admin/estadisticas',
      active: pathname === '/super_admin/estadisticas'
    },
    {
      name: 'Perfil',
      icon: '🔧',
      href: '/super_admin/perfil',
      active: pathname === '/super_admin/perfil'
    }
  ];

  // 🔥 MENÚS DINÁMICOS SEGÚN AUTENTICACIÓN
  const usuarioMenuItemsDeslogueado = [
    {
      name: 'Deportes',
      icon: '🏟️',
      href: '/sports',
      active: pathname === '/sports' || pathname === '/sports/' || pathname === '/'
    },
    {
      name: 'Mapa',
      icon: '🗺️',
      href: '/mapa',
      active: pathname === '/mapa'
    }
  ];

  const usuarioMenuItemsLogueado = [
    {
      name: 'Deportes',
      icon: '🏟️',
      href: '/sports',
      active: pathname === '/sports' || pathname === '/sports/' || pathname === '/'
    },
    {
      name: 'Mis Reservas',
      icon: '📅',
      href: '/usuario/Reservas',
      active: pathname === '/usuario/historial-reservas'
    },
    {
      name: 'Historial de Pagos',
      icon: '💳',
      href: '/usuario/pagos',
      active: pathname === '/usuario/pagos'
    },
    {
      name: 'Mapa',
      icon: '🗺️',
      href: '/mapa',
      active: pathname === '/mapa'
    },
    {
      name: 'Perfil',
      icon: '👤',
      href: '/usuario/perfil',
      active: pathname === '/usuario/perfil'
    },
    {
      name: 'Quejas y Sugerencias',
      icon: '💬',
      href: '/usuario/quejas-sugerencias',
      active: pathname && pathname.startsWith('/usuario/quejas-sugerencias')
    }
  ];

  // 🔥 LÓGICA PARA DETERMINAR QUÉ MENÚ MOSTRAR
  const getMenuItems = () => {
    if (userRole === 'super_admin') return superAdminMenuItems;
    if (userRole === 'admin') return adminMenuItems;
    
    // Para usuarios normales, depende del estado de autenticación
    if (userRole === 'usuario') {
      return isAuthenticated ? usuarioMenuItemsLogueado : usuarioMenuItemsDeslogueado;
    }
    
    return usuarioMenuItemsDeslogueado; // Fallback
  };

  const menuItems = getMenuItems();
  const userTitle = userRole === 'super_admin' ? 'Superadministrador' : userRole === 'admin' ? 'Administrador' : 'Usuario';

  // 🔥 FUNCIÓN PARA DETERMINAR EL HREF DEL HEADER
  const getHeaderHref = () => {
    switch (userRole) {
      case 'admin':
        return '/sports';
      case 'super_admin':
        return '/sports';
      case 'usuario':
        return '/sports';
      default:
        return '/sports';
    }
  };

  // 🔥 MOSTRAR LOADING SI ESTÁ CARGANDO (solo para usuarios)
  if (userRole === 'usuario' && isLoading) {
    return (
      <div className={styles ? styles.sidebarContainer : 'sidebar-container'}>
        <div className={styles ? styles.sidebarHeader : 'sidebar-header'}>
          <div className={styles ? styles.loadingContainer : 'loading-container'}>
            <div className={styles ? styles.loadingSpinner : 'loading-spinner'}>⏳</div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles ? styles.sidebarContainer : 'sidebar-container'}>
      {/* Header - 🔥 AHORA ES CLICKEABLE */}
      <Link href={getHeaderHref()} className={styles ? styles.sidebarHeaderLink : 'sidebar-header-link'}>
        <div className={styles ? styles.sidebarHeader : 'sidebar-header'}>
          <div className={styles ? styles.sidebarLogoContainer : 'sidebar-logo-container'}>
            <div className={styles ? styles.sidebarLogoIcon : 'sidebar-logo-icon'}>
              SH
            </div>
            <div>
              <h1 className={styles ? styles.sidebarTitle : 'sidebar-title'}>SportHub</h1>
              <p className={styles ? styles.sidebarSubtitle : 'sidebar-subtitle'}>
                {userRole === 'usuario' && isAuthenticated && user 
                  ? `${user.nombre || user.email}` 
                  : userTitle
                }
              </p>
            </div>
          </div>
          {userRole === 'usuario' && sport && styles && <div className={styles.sportIcon}></div>}
        </div>
      </Link>

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

      {/* 🔥 LOGOUT BUTTON - SOLO SI ESTÁ AUTENTICADO */}
      {isAuthenticated && (
        <div className={styles ? styles.sidebarLogout : 'sidebar-logout'}>
          <button 
            className={styles ? styles.sidebarLogoutButton : 'sidebar-logout-button'}
            onClick={handleLogout}
          >
            <span className={styles ? styles.sidebarLogoutIcon : 'sidebar-logout-icon'}>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default Sidebar;