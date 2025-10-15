'use client';

import React, { useState, useEffect } from 'react';
import './perfiladmin.css';
import AdminLayout from '@/components/layout/AdminsLayout';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  avatar_url?: string;
  rol: string;
}

export default function PerfilAdministrador() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const horasPorDia = [
    { dia: 'Lunes', horas: 6 },
    { dia: 'Martes', horas: 7 },
    { dia: 'Miércoles', horas: 5 },
    { dia: 'Jueves', horas: 8 },
    { dia: 'Viernes', horas: 4 },
    { dia: 'Sábado', horas: 2 },
    { dia: 'Domingo', horas: 0 },
  ];

  const [hoveredDia, setHoveredDia] = useState<string | null>(null);

  useEffect(() => {
    // Debug: Ver qué hay en localStorage
    console.log('=== DEBUG AUTH ===');
    console.log('Token en localStorage:', localStorage.getItem('token'));
    console.log('Access token en localStorage:', localStorage.getItem('access_token'));
    console.log('Refresh token en localStorage:', localStorage.getItem('refresh_token'));
    console.log('¿Está autenticado según authService?:', authService.isAuthenticated());
    console.log('Token obtenido con getToken():', authService.getToken());
    console.log('==================');

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // PRIMERO: Verificar si hay autenticación
        if (!authService.isAuthenticated()) {
          console.log('❌ No hay usuario autenticado, redirigiendo al login...');
          router.push('/login');
          return;
        }

        console.log('✅ Usuario autenticado, obteniendo datos...');

        // SEGUNDO: Obtener datos del usuario
        const userData = await authService.me() as UserProfile;
        console.log('📊 Datos del usuario obtenidos:', userData);
        
        // TERCERO: Verificar que el usuario sea admin
        if (userData.rol !== 'admin') {
          console.log('🚫 Usuario no es admin, rol actual:', userData.rol);
          router.push('/acceso-denegado');
          return;
        }

        console.log('✅ Usuario es admin, mostrando datos...');
        setUserData(userData);
        
      } catch (err: any) {
        console.error('❌ Error fetching user data:', err);
        console.error('Mensaje de error:', err.message);
        console.error('Stack trace:', err.stack);
        
        // Si hay error, probablemente el token es inválido
        authService.clearSession();
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        
        // Redirigir al login después de un tiempo
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
        <div className="admin-container">
          <div className="loading-message">
            <div>Verificando autenticación...</div>
            <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
              Revisa la consola del navegador para ver el debug
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout userRole="admin" userName="Admin" notificationCount={3}>
        <div className="admin-container">
          <div className="error-message">
            {error}
            <div style={{ fontSize: '12px', marginTop: '10px' }}>
              Redirigiendo al login...
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Datos del usuario desde la API
  const userName = userData ? `${userData.nombre} ${userData.apellido}`.trim() : "Administrador";
  const userEmail = userData?.email || "Admin@gmail.com";
  const userPhone = userData?.telefono || "No especificado";
  const userRole = userData?.rol || "admin";
  const userImage = userData?.avatar_url || null;

  return (
    <AdminLayout 
      userRole={ "admin"} 
      userName={userData?.nombre || "Admin"} 
      notificationCount={3}
    >
      <div className="admin-container">
        
        {/* Panel Izquierdo - Perfil */}
        <div className="profile-card">
          <div className="avatar-container">
            {userImage ? (
              <img 
                src={userImage} 
                alt="Foto de perfil" 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-default">
                <span className="avatar-initial">{getInitial(userName)}</span>
              </div>
            )}
            <div className="online-status"></div>
          </div>

          <h2 className="profile-name">{userName}</h2>
          <div className="profile-role">{userRole.toUpperCase()}</div>

          <div className="profile-details">
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Teléfono</span>
                <span className="detail-value">{userPhone}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Correo</span>
                <span className="detail-value">{userEmail}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">ID Usuario</span>
                <span className="detail-value">#{userData?.id_usuario}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-content">
                <span className="detail-label">Encargado de</span>
                <span className="detail-value highlight">Reservas y Gestión</span>
              </div>
            </div>
          </div>

          <button className="edit-button">
            Editar Perfil
          </button>
        </div>

        {/* Panel Derecho - Contenido */}
        <div className="content-panel">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Panel del Administrador</h1>
            <p className="dashboard-subtitle">
              Bienvenido de vuelta, {userData?.nombre || 'Administrador'}. Aquí tienes tu resumen semanal
            </p>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Horas Trabajadas - Semana 12</h3>
            </div>

            <div className="chart-content">
              <div className="bars-container">
                {horasPorDia.map((dia) => (
                  <div
                    key={dia.dia}
                    className="bar-wrapper"
                    onMouseEnter={() => setHoveredDia(dia.dia)}
                    onMouseLeave={() => setHoveredDia(null)}
                  >
                    {hoveredDia === dia.dia && (
                      <div className="tooltip-content">
                        {dia.horas}h {dia.dia}
                      </div>
                    )}
                    
                    <div 
                      className={`bar ${hoveredDia === dia.dia ? 'bar-hover' : ''}`}
                      style={{ height: `${dia.horas * 12}px` }}
                    ></div>
                    
                    <span className="bar-label">{dia.dia.substring(0, 3)}</span>
                    <span className="bar-value">{dia.horas}h</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-footer">
              <div className="stats-container">
                <div className="stat-item">
                  <span className="stat-label">Total Semanal: </span>
                  <span className="stat-value">32 horas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Promedio Diario: </span>
                  <span className="stat-value">4.6 horas</span>
                </div>
              </div>
              
              <button className="excel-button">
                Generar Reporte Excel
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">156</span>
                <span className="stat-text">Usuarios Activos</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">89%</span>
                <span className="stat-text">Eficiencia</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <span className="stat-number">32h</span>
                <span className="stat-text">Esta Semana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}