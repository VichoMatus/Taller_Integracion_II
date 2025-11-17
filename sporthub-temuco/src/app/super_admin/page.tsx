"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { canchaService } from '@/services/canchaService';
import { Usuario } from '@/types/usuarios';
import StatsCard from '@/components/charts/StatsCard';

interface DashboardStats {
  totalUsuarios: number;
  totalCanchas: number;
  totalAdministradores: number;
  reservasHoy: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para los datos reales
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalCanchas: 0,
    totalAdministradores: 0,
    reservasHoy: 0
  });
  
  const [administradores, setAdministradores] = useState<Usuario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [canchas, setCanchas] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar datos del dashboard
  const cargarDatos = async () => {
    if (!mounted) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      let newStats: DashboardStats;
      let usuariosData: Usuario[] = [];
      let adminsData: Usuario[] = [];
      
      // Estrategia híbrida: Calcular manualmente Usuarios y Canchas, usar backend para Admins y Reservas
      try {
        console.log('📊 [Dashboard] Solicitando métricas desde endpoint optimizado...');
        const metricas = await superAdminService.obtenerMetricasGenerales();
        
        // Cargar TODOS los datos para cálculo manual
        console.log('📊 [Dashboard] Cargando listas completas para cálculo manual...');
        usuariosData = await superAdminService.listarUsuarios({ page_size: 100 });
        adminsData = await superAdminService.listarAdministradores({ page_size: 100 });
        
        // Obtener TODAS las canchas (sin límite de paginación)
        const todasLasCanchasResponse = await canchaService.getCanchasAdmin({ 
          page_size: 100,
          incluir_inactivas: true
        }) as any;
        const todasLasCanchas = Array.isArray(todasLasCanchasResponse.items) 
          ? todasLasCanchasResponse.items 
          : [];
        
        // ✅ CALCULAR MANUALMENTE: Usuarios Totales y Canchas Totales
        const usuariosTotalesCalculados = usuariosData.length + adminsData.length;
        const canchasTotalesCalculadas = todasLasCanchas.length;
        
        console.log('📊 [Dashboard] Cálculos manuales:', {
          usuarios: usuariosData.length,
          administradores: adminsData.length,
          usuariosTotales: usuariosTotalesCalculados,
          canchasTotales: canchasTotalesCalculadas
        });
        
        // ✅ Estadísticas finales (3 manuales + 1 del backend)
        newStats = {
          totalUsuarios: usuariosTotalesCalculados,  // ✅ Manual
          totalCanchas: canchasTotalesCalculadas,    // ✅ Manual
          totalAdministradores: adminsData.length,   // ✅ Manual
          reservasHoy: metricas.reservas_hoy || 0    // ✅ Backend (único que sigue usando el endpoint)
        };
        
        console.log('✅ [Dashboard] Métricas finales (híbrido):', newStats);
        
      } catch (endpointError: any) {
        console.error('❌ [Dashboard] Error al obtener métricas del backend:', endpointError);
        throw endpointError;
      }
      
      // Actualizar estados
      setStats(newStats);
      setUsuarios(usuariosData.slice(0, 3));
      setAdministradores(adminsData.slice(0, 3));
      
      // Cargar canchas para la tabla
      const canchasResponse = await canchaService.getCanchas({ page: 1, page_size: 3 }) as any;
      const canchasArray = Array.isArray(canchasResponse.items) ? canchasResponse.items : [];
      setCanchas(canchasArray);
      
      console.log('✅ Dashboard cargado exitosamente');
    } catch (error: any) {
      console.error('❌ Error cargando datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      cargarDatos();
    }
  }, [mounted]);

  // Funciones de navegación
  const navegarAdministradores = () => router.push('/super_admin/administradores');
  const navegarUsuarios = () => router.push('/super_admin/usuarios');
  const navegarCanchas = () => router.push('/super_admin/canchas');

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando panel de administración...
      </div>
    );
  }

  // Debug: Log cuando se renderiza con los stats actuales
  console.log('🔄 Renderizando dashboard - Estado actual:', {
    isLoading,
    stats,
    mounted
  });

  return (
    <div className="admin-dashboard-container">
      {/* Mensaje de Error */}
      {error && (
        <div className="error-message" style={{ marginBottom: '20px', padding: '12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px' }}>
          {error}
        </div>
      )}
      
      {/* Grid de estadísticas principales */}
      <div className="stats-grid">
        <StatsCard
          title="Usuarios Totales"
          value={stats.totalUsuarios}
          emoji="👥"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="blue"
          onClick={navegarUsuarios}
          loading={isLoading}
          ariaLabel="Ver todos los usuarios"
        />
        
        <StatsCard
          title="Canchas Registradas"
          value={stats.totalCanchas}
          emoji="⚽"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="green"
          onClick={navegarCanchas}
          loading={isLoading}
          ariaLabel="Ver todas las canchas"
        />
        
        <StatsCard
          title="Administradores"
          value={stats.totalAdministradores}
          emoji="🛡️"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          color="purple"
          onClick={navegarAdministradores}
          loading={isLoading}
          ariaLabel="Ver todos los administradores"
        />
        
        <StatsCard
          title="Reservas Hoy"
          emoji="📅"
          value={stats.reservasHoy}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="yellow"
          loading={isLoading}
          empty={stats.reservasHoy === 0}
          emptyMessage="Por implementar"
          ariaLabel="Reservas de hoy"
        />
      </div>

      {/* Grid de secciones de gestión lado a lado */}
      <div className="management-sections-grid">
        {/* Sección Gestionar Administradores */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Gestionar Administradores</h2>
            <div className="section-header-buttons">
              <button 
                className="section-view-all"
                onClick={navegarAdministradores}
              >
                Ver todo
              </button>
            </div>
          </div>
          
          <table className="management-table">
            <thead>
              <tr>
                <th>Administrador</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando...
                  </td>
                </tr>
              ) : administradores.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                    No hay administradores registrados
                  </td>
                </tr>
              ) : (
                administradores.map((admin) => (
                  <tr key={admin.id_usuario}>
                    <td>{`${admin.nombre} ${admin.apellido}`}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span className={`status-badge ${admin.esta_activo ? 'status-active' : 'status-inactive'}`}>
                        {admin.esta_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sección Gestionar Usuarios */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Gestionar Usuarios</h2>
            <div className="section-header-buttons">
              <button 
                className="section-view-all"
                onClick={navegarUsuarios}
              >
                Ver todo
              </button>
            </div>
          </div>
          
          <table className="management-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>{`${usuario.nombre} ${usuario.apellido}`}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`status-badge ${usuario.esta_activo ? 'status-active' : 'status-inactive'}`}>
                        {usuario.esta_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección de Gestión de Canchas */}
      <div className="management-section courts-section">
        <div className="section-header">
          <h2 className="section-title">Gestión de canchas</h2>
          <div className="section-header-buttons">
            <button 
              className="section-view-all"
              onClick={navegarCanchas}
            >
              Ver todo
            </button>
          </div>
        </div>
        
        <table className="management-table">
          <thead>
            <tr>
              <th>Cancha</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                  Cargando...
                </td>
              </tr>
            ) : canchas.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                  No hay canchas registradas
                </td>
              </tr>
            ) : (
              canchas.map((cancha) => (
                <tr key={cancha.id}>
                  <td>{cancha.nombre}</td>
                  <td style={{ textTransform: 'capitalize' }}>{cancha.tipo}</td>
                  <td>
                    <span className={`status-badge ${cancha.activa ? 'status-active' : 'status-inactive'}`}>
                      {cancha.activa ? 'Disponible' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}