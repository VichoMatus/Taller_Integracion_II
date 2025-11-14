'use client';

import React, { useState, useEffect } from 'react';
import './perfiladmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';
import { authService } from '@/services/authService';
import { adminService } from '@/services/adminService';
import { useEstadisticas } from '@/hooks/useEstadisticas';
import { MeResponse } from '@/types/auth';
import { MisRecursosResponse, Complejo } from '@/types/admin';
import { useRouter } from 'next/navigation';

export default function PerfilAdministrador() {
  const [userData, setUserData] = useState<MeResponse | null>(null);
  const [recursosData, setRecursosData] = useState<MisRecursosResponse | null>(null);
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [complejoSeleccionado, setComplejoSeleccionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recursosError, setRecursosError] = useState<string | null>(null);
  const router = useRouter();

  const complejoId = complejoSeleccionado || complejos[0]?.id || null;
  
  const {
    estadisticas,
    reservasPorDia,
    reservasPorCancha,
    isLoading: statsLoading,
    cambiarPeriodo,
    diasAnalisis,
    cargarTodo
  } = useEstadisticas(complejoId);

  // Datos por defecto para demostración
  const estadisticasDefault = {
    complejo_nombre: "Mi Complejo Deportivo",
    ingresos_ultimo_mes: 850000,
    reservas_ultimo_mes: 45,
    reservas_confirmadas_ultimo_mes: 42,
    reservas_pendientes_ultimo_mes: 2,
    reservas_canceladas_ultimo_mes: 1,
    canchas_activas: 4,
    total_canchas: 5,
    ocupacion_promedio: 78.5,
    fecha_desde: new Date().toISOString().split('T')[0],
    fecha_hasta: new Date().toISOString().split('T')[0]
  };

  const reservasPorDiaDefault = {
    dias: [
      { dia_numero: 1, dia_nombre: "Lun", total_reservas: 8, ingresos: 120000 },
      { dia_numero: 2, dia_nombre: "Mar", total_reservas: 6, ingresos: 95000 },
      { dia_numero: 3, dia_nombre: "Mié", total_reservas: 7, ingresos: 110000 },
      { dia_numero: 4, dia_nombre: "Jue", total_reservas: 9, ingresos: 135000 },
      { dia_numero: 5, dia_nombre: "Vie", total_reservas: 12, ingresos: 180000 },
      { dia_numero: 6, dia_nombre: "Sáb", total_reservas: 15, ingresos: 225000 },
      { dia_numero: 0, dia_nombre: "Dom", total_reservas: 11, ingresos: 165000 }
    ],
    total_reservas: 68,
    dia_mas_popular: "Sábado",
    dia_menos_popular: "Martes"
  };

  const reservasPorCanchaDefault = {
    canchas: [
      { cancha_id: 1, cancha_nombre: "Cancha Fútbol 7", total_reservas: 18, ingresos: 270000, ocupacion_porcentaje: 85 },
      { cancha_id: 2, cancha_nombre: "Cancha Fútbol 5 A", total_reservas: 15, ingresos: 225000, ocupacion_porcentaje: 75 },
      { cancha_id: 3, cancha_nombre: "Cancha Fútbol 5 B", total_reservas: 12, ingresos: 180000, ocupacion_porcentaje: 65 },
      { cancha_id: 4, cancha_nombre: "Cancha Tenis", total_reservas: 8, ingresos: 120000, ocupacion_porcentaje: 45 }
    ],
    total_reservas: 53,
    cancha_mas_popular: "Cancha Fútbol 7",
    cancha_menos_popular: "Cancha Tenis",
    ingresos_totales: 795000
  };

  const statsReales = complejoId && estadisticas;
  const stats = statsReales ? estadisticas : estadisticasDefault;
  const reservasDia = statsReales && reservasPorDia ? reservasPorDia : reservasPorDiaDefault;
  const reservasCancha = statsReales && reservasPorCancha ? reservasPorCancha : reservasPorCanchaDefault;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const userDataResponse = await authService.me();
        setUserData(userDataResponse);
        
        try {
          const recursosResponse = await adminService.getMisRecursos();
          setRecursosData(recursosResponse);
          setComplejos(recursosResponse.complejos || []);
          
          if (recursosResponse.complejos?.length > 0) {
            setComplejoSeleccionado(recursosResponse.complejos[0].id);
          }
        } catch (recursosError: any) {
          setRecursosError(recursosError.message || 'Error al cargar recursos');
          setComplejos([]);
        }
        
      } catch (err) {
        setError('Error al cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (complejoId) cargarTodo();
  }, [complejoId, cargarTodo]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
        <div className="perfil-admin-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
        <div className="perfil-admin-container">
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const userName = userData ? `${userData.nombre} ${userData.apellido}`.trim() : "Administrador";
  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : 'A';

  return (
    <AdminLayout 
      userRole="admin" 
      userName={userData?.nombre || "Admin"} 
      notificationCount={3}
    >
      <div className="perfil-admin-container">
        <div className="perfil-admin-content">
          
          {/* SIDEBAR */}
          <aside className="perfil-sidebar">
            <div className="perfil-card">
              <div className="perfil-header-gradient"></div>
              
              <div className="perfil-avatar-section">
                <div className="perfil-avatar-wrapper">
                  {userData?.avatar_url ? (
                    <img 
                      src={userData.avatar_url} 
                      alt="Foto de perfil" 
                      className="perfil-avatar-img"
                    />
                  ) : (
                    <div className="perfil-avatar-default">
                      <span className="perfil-avatar-initial">{getInitial(userName)}</span>
                    </div>
                  )}
                  <div className="perfil-status-online"></div>
                </div>

                <div className="perfil-user-info">
                  <h2 className="perfil-user-name">{userName}</h2>
                  <span className="perfil-user-role">Administrador</span>
                  {userData?.verificado && (
                    <span className="perfil-verified-badge">✓ Verificado</span>
                  )}
                </div>
              </div>

              <div className="perfil-details-list">
                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">📧</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Correo</span>
                    <span className="perfil-detail-value">{userData?.email}</span>
                  </div>
                </div>
                
                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">📱</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Teléfono</span>
                    <span className="perfil-detail-value">{userData?.telefono || "No registrado"}</span>
                  </div>
                </div>

                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">🆔</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">ID Usuario</span>
                    <span className="perfil-detail-value">#{userData?.id_usuario}</span>
                  </div>
                </div>

                {complejos.length > 0 && (
                  <div className="perfil-detail-item">
                    <div className="perfil-detail-icon">🏟️</div>
                    <div className="perfil-detail-content">
                      <span className="perfil-detail-label">Complejos</span>
                      <span className="perfil-detail-value">{complejos.length} activos</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="perfil-actions">
                <button
                  className="perfil-btn perfil-btn-primary"
                  onClick={() => router.push('/admin/editarperfil')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar Perfil
                </button>
              </div>
            </div>
          </aside>

          {/* PANEL PRINCIPAL */}
          <main className="perfil-main">
            
            {/* Header Fijo */}
            <div className="perfil-main-header-fixed">
              <div className="perfil-main-header-content">
                <div>
                  <h1 className="perfil-main-title">Panel de Administrador</h1>
                  <p className="perfil-main-subtitle">
                    Bienvenido {userData?.nombre}
                    {!statsReales && " - Vista de demostración"}
                  </p>
                </div>
                
                <div className="header-controls">
                  {complejos.length > 0 && (
                    <div className="complejo-selector">
                      <span>Complejo: </span>
                      <select 
                        value={complejoSeleccionado || ''} 
                        onChange={(e) => setComplejoSeleccionado(Number(e.target.value))}
                        className="complejo-select"
                      >
                        {complejos.map(complejo => (
                          <option key={complejo.id} value={complejo.id}>
                            {complejo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="periodo-selector">
                    <span>Período: </span>
                    <select 
                      value={diasAnalisis} 
                      onChange={(e) => cambiarPeriodo(Number(e.target.value))}
                      className="periodo-select"
                      disabled={!statsReales}
                    >
                      <option value={7}>Última semana</option>
                      <option value={30}>Último mes</option>
                      <option value={90}>Últimos 3 meses</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido Scroleable */}
            <div className="perfil-main-content">
              
              {/* Banner informativo */}
              {!statsReales && (
                <div className={`demo-banner ${recursosError ? 'error' : 'info'}`}>
                  <div className="demo-banner-icon">
                    {recursosError ? '⚠️' : '👀'}
                  </div>
                  <div className="demo-banner-content">
                    <strong>
                      {recursosError ? 'Configuración Requerida' : 'Vista de Demostración'}
                    </strong>
                    <p>
                      {recursosError 
                        ? 'Crea tu primer complejo para acceder a las estadísticas reales.'
                        : 'Los datos mostrados son de demostración. Crea tu complejo para ver estadísticas reales.'
                      }
                    </p>
                    <div className="demo-banner-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => router.push('/admin/complejos')}
                      >
                        {complejos.length === 0 ? 'Crear Mi Primer Complejo' : 'Gestionar Complejos'}
                      </button>
                      {recursosError && (
                        <button 
                          className="btn-secondary"
                          onClick={() => window.location.reload()}
                        >
                          Reintentar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Estadísticas principales */}
              <div className="stats-section">
                <div className="section-header-premium">
                  <div className="section-title-wrapper">
                    <span className="section-icon-premium">📊</span>
                    <div>
                      <h2 className="section-title-premium">Estadísticas de las Canchas</h2>
                      <p className="section-subtitle-premium">
                        {statsReales 
                          ? `Datos en tiempo real de ${stats.complejo_nombre}` 
                          : 'Vista previa - Datos de demostración'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon income">💰</div>
                    <div className="stat-content">
                      <h3>Ingresos Totales</h3>
                      <p className="stat-value">
                        {statsLoading && statsReales ? 'Cargando...' : formatCurrency(stats.ingresos_ultimo_mes)}
                      </p>
                      <span className="stat-label">Últimos {diasAnalisis} días</span>
                      {!statsReales && <div className="demo-badge">Demo</div>}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon bookings">📅</div>
                    <div className="stat-content">
                      <h3>Total Reservas</h3>
                      <p className="stat-value">
                        {statsLoading && statsReales ? 'Cargando...' : stats.reservas_ultimo_mes}
                      </p>
                      <span className="stat-label">{stats.reservas_confirmadas_ultimo_mes} confirmadas</span>
                      {!statsReales && <div className="demo-badge">Demo</div>}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon courts">🏟️</div>
                    <div className="stat-content">
                      <h3>Canchas Activas</h3>
                      <p className="stat-value">
                        {statsLoading && statsReales ? 'Cargando...' : stats.canchas_activas}
                      </p>
                      <span className="stat-label">de {stats.total_canchas} totales</span>
                      {!statsReales && <div className="demo-badge">Demo</div>}
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className="charts-container">
                  <div className="chart-section">
                    <h3>Reservas por Día - Semana Actual</h3>
                    {statsLoading && statsReales ? (
                      <div className="loading-chart">Cargando...</div>
                    ) : (
                      <div className="chart-content">
                        <div className="days-grid">
                          {reservasDia?.dias.map((dia) => (
                            <div key={dia.dia_numero} className="day-bar">
                              <div className="day-label">{dia.dia_nombre}</div>
                              <div className="bar-container">
                                <div 
                                  className={`bar-fill ${!statsReales ? 'demo-data' : ''}`}
                                  style={{ 
                                    height: (reservasDia?.total_reservas || 0) > 0 
                                      ? `${(dia.total_reservas / Math.max(...(reservasDia?.dias || []).map(d => d.total_reservas))) * 100}%`
                                      : '10%'
                                  }}
                                ></div>
                              </div>
                              <div className="day-value">{dia.total_reservas}</div>
                              <div className="day-income">{formatCurrency(dia.ingresos)}</div>
                            </div>
                          ))}
                        </div>
                        
                        {!statsReales && (
                          <div className="chart-summary">
                            <span className="demo-indicator">📋 Datos de demostración - Crea tu complejo para ver estadísticas reales</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="chart-section">
                    <h3>Rendimiento por Cancha</h3>
                    {statsLoading && statsReales ? (
                      <div className="loading-chart">Cargando...</div>
                    ) : (
                      <div className="chart-content">
                        <div className="canchas-list">
                          {reservasCancha?.canchas.slice(0, 4).map((cancha, index) => (
                            <div key={cancha.cancha_id} className="cancha-item">
                              <div className="cancha-rank">#{index + 1}</div>
                              <div className="cancha-info">
                                <div className="cancha-name">{cancha.cancha_nombre}</div>
                                <div className="cancha-stats">
                                  <span>{cancha.total_reservas} reservas</span>
                                  <span>{formatCurrency(cancha.ingresos)}</span>
                                </div>
                              </div>
                              <div className={`ocupacion-badge ${!statsReales ? 'demo-data' : ''} ${
                                cancha.ocupacion_porcentaje >= 80 ? 'high' : 
                                cancha.ocupacion_porcentaje >= 60 ? 'medium' : 'low'
                              }`}>
                                {cancha.ocupacion_porcentaje.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="chart-summary">
                          <p>Cancha más popular: <strong>{reservasCancha?.cancha_mas_popular}</strong></p>
                          <p>Ingresos totales: <strong>{formatCurrency(reservasCancha?.ingresos_totales || 0)}</strong></p>
                          {!statsReales && <span className="demo-indicator">Datos de demo</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del perfil administrativo */}
              <div className="perfil-info-section">
                <div className="section-header-premium">
                  <div className="section-title-wrapper">
                    <span className="section-icon-premium">👤</span>
                    <div>
                      <h2 className="section-title-premium">Información del Administrador</h2>
                      <p className="section-subtitle-premium">Datos de tu cuenta y gestión</p>
                    </div>
                  </div>
                </div>
                
                <div className="info-grid-premium">
                  <div className="info-card-premium">
                    <div className="info-card-icon-wrapper gradient-purple">
                      <span className="info-card-icon-premium">👤</span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">Nombre Completo</h3>
                      <p className="info-card-value-premium">{userName}</p>
                    </div>
                  </div>

                  <div className="info-card-premium">
                    <div className="info-card-icon-wrapper gradient-blue">
                      <span className="info-card-icon-premium">📧</span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">Correo Electrónico</h3>
                      <p className="info-card-value-premium">{userData?.email}</p>
                    </div>
                  </div>

                  <div className="info-card-premium">
                    <div className="info-card-icon-wrapper gradient-green">
                      <span className="info-card-icon-premium">🏟️</span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">Complejos Administrados</h3>
                      <p className="info-card-value-premium">
                        {complejos.length > 0 ? `${complejos.length} complejo${complejos.length > 1 ? 's' : ''}` : 'Sin complejos'}
                      </p>
                    </div>
                  </div>

                  <div className="info-card-premium">
                    <div className="info-card-icon-wrapper gradient-orange">
                      <span className="info-card-icon-premium">📊</span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">Total de Canchas</h3>
                      <p className="info-card-value-premium">
                        {recursosData?.total_canchas || recursosData?.canchas?.length || 0} cancha{((recursosData?.total_canchas || recursosData?.canchas?.length || 0) !== 1) ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="info-card-premium">
                    <div className="info-card-icon-wrapper gradient-pink">
                      <span className="info-card-icon-premium">
                        {userData?.verificado ? '✅' : '⏳'}
                      </span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">Estado de Cuenta</h3>
                      <p className="info-card-value-premium">
                        {userData?.verificado ? 'Verificada' : 'Pendiente'}
                      </p>
                      {userData?.verificado && (
                        <span className="verified-badge-mini">✓ Verificado</span>
                      )}
                    </div>
                  </div>

                  <div className="info-card-premium">
                    <div className="info-card-icon-wrapper gradient-cyan">
                      <span className="info-card-icon-premium">📱</span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">Teléfono de Contacto</h3>
                      <p className="info-card-value-premium">{userData?.telefono || "No registrado"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}