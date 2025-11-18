'use client';

import React, { useState, useEffect } from 'react';
import './perfiladmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';
import { authService } from '@/services/authService';
import { adminService } from '@/services/adminService';
import { MeResponse } from '@/types/auth';
import { MisRecursosResponse, Complejo } from '@/types/admin';
import { useEstadisticas } from '@/hooks/useEstadisticas';
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

  const complejoId = complejoSeleccionado ?? (complejos.length > 0 ? complejos[0]?.id || null : null);

  // Hook de estadísticas
  const {
    estadisticas,
    isLoading: loadingEstadisticas,
    errorEstadisticas
  } = useEstadisticas(complejoId);

  useEffect(() => {
    const fetchUserData = async () => {
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
          
          if (recursosResponse.complejos && recursosResponse.complejos.length > 0) {
            const complejosValidos = recursosResponse.complejos.filter(complejo => 
              complejo.id !== undefined && complejo.id !== null
            );
            
            setComplejos(complejosValidos);
            
            if (complejosValidos.length > 0) {
              setComplejoSeleccionado(complejosValidos[0].id);
            } else {
              setComplejoSeleccionado(null);
            }
          } else {
            setComplejos([]);
            setComplejoSeleccionado(null);
          }
        } catch (recursosError: any) {
          console.error('Error cargando recursos:', recursosError);
          setRecursosError(recursosError.message || 'Error al cargar recursos');
          setComplejos([]);
          setComplejoSeleccionado(null);
        }
        
      } catch (err) {
        console.error('Error en fetchData:', err);
        setError('Error al cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <AdminLayout userRole="admin" userName="Admin" notificationCount={0}>
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
      <AdminLayout userRole="admin" userName="Admin" notificationCount={0}>
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

  // Calcular datos adicionales
  const totalCanchas = recursosData?.canchas?.length || 0;
  const totalReservas = recursosData?.total_reservas || 0;
  const ingresosMes = recursosData?.ingresos_mes || 0;

  return (
    <AdminLayout 
      userRole="admin" 
      userName={userData?.nombre || "Admin"} 
      notificationCount={0}
      avatarUrl={userData?.avatar_url || null}
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

                <div className="perfil-detail-item">
                  <div className="perfil-detail-icon">📊</div>
                  <div className="perfil-detail-content">
                    <span className="perfil-detail-label">Miembro desde</span>
                    <span className="perfil-detail-value">
                      {userData?.fecha_creacion ? new Date(userData.fecha_creacion).toLocaleDateString('es-CL') : 'Fecha no disponible'}
                    </span>
                  </div>
                </div>
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
                  <h1 className="perfil-main-title">Perfil de Administrador</h1>
                  <p className="perfil-main-subtitle">
                    Bienvenido {userData?.nombre} - Este es tu Perfil de Administrador
                  </p>
                </div>
                
                <div className="header-controls">
                  {complejos.length > 0 && (
                    <div className="complejo-selector">
                      <span>Complejo: </span>
                      <select 
                        value={complejoSeleccionado ?? ''} 
                        onChange={(e) => setComplejoSeleccionado(Number(e.target.value))}
                        className="complejo-select"
                      >
                        {complejos.map((complejo, index) => (
                          <option 
                            key={`complejo-${complejo.id || index}-${complejo.nombre || 'sin-nombre'}`} 
                            value={complejo.id}
                          >
                            {complejo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido Scrolleable */}
            <div className="perfil-main-content">
              
              {recursosError && (
                <div className="demo-banner error">
                  <div className="demo-banner-icon">⚠️</div>
                  <div className="demo-banner-content">
                    <strong>Error al cargar recursos</strong>
                    <p>{recursosError}</p>
                  </div>
                </div>
              )}

              {/* SECCIÓN DE RESUMEN EJECUTIVO */}
              <div className="resumen-section">
                <div className="section-header-premium">
                  <div className="section-title-wrapper">
                    <span className="section-icon-premium">🚀</span>
                    <div>
                      <h2 className="section-title-premium">Resumen Ejecutivo</h2>
                      <p className="section-subtitle-premium">
                        Vista general de tu gestión deportiva
                      </p>
                    </div>
                  </div>
                </div>

                <div className="resumen-grid">
                  <div className="resumen-card destacado">
                    <div className="resumen-icon">🏟️</div>
                    <div className="resumen-content">
                      <h3>Complejos Activos</h3>
                      <div className="resumen-value">{complejos.length}</div>
                      <p>Gestionando instalaciones deportivas</p>
                    </div>
                  </div>

                  <div className="resumen-card">
                    <div className="resumen-icon">⚽</div>
                    <div className="resumen-content">
                      <h3>Total Canchas</h3>
                      <div className="resumen-value">{totalCanchas}</div>
                      <p>Canchas disponibles para reservas</p>
                    </div>
                  </div>

                  <div className="resumen-card">
                    <div className="resumen-icon">📅</div>
                    <div className="resumen-content">
                      <h3>Reservas Totales</h3>
                      <div className="resumen-value">{totalReservas}</div>
                      <p>Reservas procesadas en el sistema</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE ESTADÍSTICAS RÁPIDAS */}
              <div className="estadisticas-section">
                <div className="section-header-premium">
                  <div className="section-title-wrapper">
                    <span className="section-icon-premium">📊</span>
                    <div>
                      <h2 className="section-title-premium">
                        {complejos.length > 0 ? 'Estadísticas del Complejo' : 'Estadísticas Generales'}
                      </h2>
                      <p className="section-subtitle-premium">
                        {estadisticas?.complejo_nombre || 'Selecciona un complejo para ver estadísticas detalladas'}
                      </p>
                      <br />
                    </div>
                  </div>

                  <button 
                    className="btn-estadisticas-completas"
                    onClick={() => router.push('/admin/estadisticas')}
                  >
                    <span>Ver Estadísticas Completas</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                {/* Estados de carga y error */}
                {loadingEstadisticas && (
                  <div className="estadisticas-loading">
                    <div className="spinner-small"></div>
                    <p>Cargando estadísticas...</p>
                  </div>
                )}

                {errorEstadisticas && (
                  <div className="estadisticas-error">
                    <p>⚠️ Error al cargar estadísticas</p>
                    <p className="error-subtext">Las estadísticas detalladas estarán disponibles pronto</p>
                  </div>
                )}

                {/* KPIs Principales - 3 TARJETAS */}
                {!loadingEstadisticas && (
                  <div className="kpis-grid">
                    {/* Total Canchas */}
                    <div className="kpi-card">
                      <div className="kpi-icon-wrapper gradient-blue">
                        <span className="kpi-icon">🏟️</span>
                      </div>
                      <div className="kpi-content">
                        <h3 className="kpi-title">Canchas</h3>
                        <div className="kpi-values">
                          <span className="kpi-main-value">{estadisticas?.canchas_activas || 0}</span>
                          <span className="kpi-sub-value">activas</span>
                        </div>
                        <div className="kpi-detail">
                          <span className="kpi-detail-text">
                            {estadisticas?.canchas_inactivas || 0} inactivas
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reservas del Mes */}
                    <div className="kpi-card">
                      <div className="kpi-icon-wrapper gradient-green">
                        <span className="kpi-icon">📅</span>
                      </div>
                      <div className="kpi-content">
                        <h3 className="kpi-title">Reservas del Mes</h3>
                        <div className="kpi-values">
                          <span className="kpi-main-value">{estadisticas?.reservas_confirmadas_ultimo_mes || 0}</span>
                          <span className="kpi-sub-value">confirmadas</span>
                        </div>
                        <div className="kpi-detail">
                          <span className="kpi-detail-text">
                            {estadisticas?.reservas_pendientes_ultimo_mes || 0} pendientes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ingresos Mensuales */}
                    <div className="kpi-card">
                      <div className="kpi-icon-wrapper gradient-purple">
                        <span className="kpi-icon">💰</span>
                      </div>
                      <div className="kpi-content">
                        <h3 className="kpi-title">Ingresos Mensuales</h3>
                        <div className="kpi-values">
                          <span className="kpi-main-value">
                            ${(estadisticas?.ingresos_ultimo_mes || 0).toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div className="kpi-detail">
                          <span className="kpi-detail-text">CLP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje informativo */}
                <div className="info-message">
                  <div className="info-icon">💡</div>
                  <div className="info-content">
                    <strong>¿Necesitas más datos?</strong>
                    <p>Accede a las estadísticas completas para ver análisis detallados, tendencias y reportes avanzados de tu complejo.</p>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DEL ADMINISTRADOR */}
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
                      <span className="info-card-icon-premium">📱</span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">Estado de Cuenta</h3>
                      <p className="info-card-value-premium">
                        {userData?.verificado ? 'Verificada ✓' : 'Pendiente de verificación'}
                      </p>
                    </div>
                  </div>

                  <div className="info-card-premium">
                    <div className="info-card-icon-wrapper gradient-pink">
                      <span className="info-card-icon-premium">🆔</span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">ID de Usuario</h3>
                      <p className="info-card-value-premium">#{userData?.id_usuario}</p>
                    </div>
                  </div>

                  <div className="info-card-premium">
                    <div className="info-card-icon-wrapper gradient-teal">
                      <span className="info-card-icon-premium">📅</span>
                    </div>
                    <div className="info-card-body">
                      <h3 className="info-card-title">Miembro Desde</h3>
                      <p className="info-card-value-premium">
                        {userData?.fecha_creacion ? new Date(userData.fecha_creacion).toLocaleDateString('es-CL') : 'No disponible'}
                      </p>
                    </div>
                  </div>

                  <div className="mensaje-admin-card">
                    <div className="mensaje-admin-header">
                      <div className="mensaje-admin-icon">💼</div>
                      <div className="mensaje-admin-title">
                        <h3>Mensaje Importante</h3>
                        <p>Para administradores del sistema</p>
                      </div>
                    </div>
                    <div className="mensaje-admin-content">
                      <p>
                        Como administrador de complejos deportivos, recuerda que tu rol es fundamental para garantizar 
                        la mejor experiencia a los usuarios. Mantén actualizada la información de tus complejos, 
                        revisa regularmente las reservas y asegúrate de que los precios y horarios sean precisos.
                      </p>
                      <div className="mensaje-admin-tips">
                        <div className="tip-item">
                          <span className="tip-icon">✅</span>
                          <span>Verifica diariamente las reservas pendientes</span>
                        </div>
                        <div className="tip-item">
                          <span className="tip-icon">✅</span>
                          <span>Mantén actualizados los horarios de atención</span>
                        </div>
                        <div className="tip-item">
                          <span className="tip-icon">✅</span>
                          <span>Responde prontamente a las consultas de usuarios</span>
                        </div>
                      </div>
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