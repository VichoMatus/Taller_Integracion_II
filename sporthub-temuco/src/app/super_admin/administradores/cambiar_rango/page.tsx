'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { Usuario } from '@/types/usuarios';

export default function CambiarRangoAdministradorPage() {
  const router = useRouter();
  
  const [administradores, setAdministradores] = useState<Usuario[]>([]);
  const [adminSeleccionado, setAdminSeleccionado] = useState<Usuario | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<'usuario' | 'admin' | 'super_admin'>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Cargar administradores cuando el admin empiece a buscar
  useEffect(() => {
    const cargarAdministradores = async () => {
      if (searchTerm.trim().length === 0) {
        setMostrarResultados(false);
        setAdministradores([]);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        setMostrarResultados(true);
        
        console.log('🔍 [CambiarRangoAdmin] Buscando administradores...');
        const data = await superAdminService.listarAdministradores();
        console.log('✅ [CambiarRangoAdmin] administradores cargados:', data);
        
        setAdministradores(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('❌ [CambiarRangoAdmin] Error al cargar administradores:', err);
        setError('Error al cargar los administradores: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce: esperar 500ms después de que el admin deje de escribir
    const timer = setTimeout(() => {
      cargarAdministradores();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Seleccionar administrador
  const handleSeleccionarAdmin = (admin: Usuario) => {
    setAdminSeleccionado(admin);
    setRolSeleccionado(admin.rol as 'usuario' | 'admin' | 'super_admin');
    setError('');
    setSuccess('');
  };

  // Abrir modal de confirmación
  const handleAbrirConfirmacion = () => {
    if (!adminSeleccionado) {
      setError('Debes seleccionar un administrador primero');
      return;
    }

    // Verificar si el rol cambió
    if (rolSeleccionado === adminSeleccionado.rol) {
      setError('El rol seleccionado es el mismo que el actual');
      return;
    }

    setShowConfirmModal(true);
  };

  // Confirmar cambio de rol
  const handleCambiarRol = async () => {
    setShowConfirmModal(false);

    if (!adminSeleccionado) return;

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      console.log('🔄 [CambiarRangoAdmin] Cambiando rol a:', rolSeleccionado);
      await superAdminService.cambiarRolUsuario(Number(adminSeleccionado.id_usuario), rolSeleccionado);
      
      setSuccess(`✅ Rol cambiado exitosamente a "${rolSeleccionado}"`);
      
      // Recargar administradores
      const data = await superAdminService.listarAdministradores();
      setAdministradores(Array.isArray(data) ? data : []);
      
      // Actualizar admin seleccionado
      const adminActualizado = Array.isArray(data) 
        ? data.find(u => u.id_usuario === adminSeleccionado?.id_usuario)
        : null;
      if (adminActualizado) {
        setAdminSeleccionado(adminActualizado);
        setRolSeleccionado(adminActualizado.rol as 'usuario' | 'admin' | 'super_admin');
      }
    } catch (err: any) {
      console.error('❌ [CambiarRangoAdmin] Error al cambiar rol:', err);
      setError('Error al cambiar el rol: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar administradores
  const administradoresFiltrados = administradores.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(searchLower) ||
      u.apellido?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="admin-page-layout">
      {/* Modal de Confirmación */}
      {showConfirmModal && adminSeleccionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#fff7ed',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#f97316' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                Confirmar Cambio de Rol
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                ¿Estás seguro de cambiar el rol de <strong>{adminSeleccionado.nombre} {adminSeleccionado.apellido}</strong> de "<strong>{adminSeleccionado.rol}</strong>" a "<strong>{rolSeleccionado}</strong>"?
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarRol}
                className="btn-guardar"
                style={{ flex: 1 }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {success && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 9999,
          minWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#dcfce7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <svg style={{ width: '32px', height: '32px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            ¡Éxito!
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            {success}
          </p>
          <button
            onClick={() => setSuccess('')}
            className="btn-guardar"
            style={{ width: '100%' }}
          >
            Aceptar
          </button>
        </div>
      )}

      {/* Overlay para modales */}
      {(showConfirmModal || success) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998
        }} onClick={() => {
          setShowConfirmModal(false);
          setSuccess('');
        }}></div>
      )}

      {/* Header */}
      <div className="admin-main-header">
        <div className="admin-header-nav">
          <button onClick={() => router.back()} className="btn-volver">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="admin-page-title">Cambiar Rango de Administrador</h1>
        </div>
      </div>

      {/* Mensajes de Error */}
      {error && (
        <div className="error-container">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Formulario Principal */}
      <div className="edit-court-container">
        <div className="edit-court-card">
          
          {/* Sección: Buscar Administrador */}
          <div className="edit-section">
            <h3 className="edit-section-title">Buscar Administrador</h3>
            <div className="edit-form-group">
              <label className="edit-form-label">Buscar por nombre, apellido o email:</label>
              <input
                type="text"
                placeholder="Escribe para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="edit-form-input"
                autoFocus
              />
            </div>

            {!mostrarResultados && searchTerm.trim().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                <p style={{ fontSize: '14px' }}>Escribe en el campo de búsqueda para ver los administradores disponibles</p>
              </div>
            ) : isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f4f6',
                  borderTop: '3px solid #f97316',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '14px' }}>Buscando administradores...</p>
              </div>
            ) : mostrarResultados && administradoresFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                <p style={{ fontSize: '14px' }}>No se encontraron administradores con ese criterio de búsqueda</p>
              </div>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '0.75rem' }}>
                  {administradoresFiltrados.length} admin{administradoresFiltrados.length !== 1 ? 's' : ''} encontrado{administradoresFiltrados.length !== 1 ? 's' : ''}
                </p>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {administradoresFiltrados.map((admin) => (
                    <button
                      key={admin.id_usuario}
                      onClick={() => handleSeleccionarAdmin(admin)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        border: adminSeleccionado?.id_usuario === admin.id_usuario ? '2px solid #f97316' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: adminSeleccionado?.id_usuario === admin.id_usuario ? '#fff7ed' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (adminSeleccionado?.id_usuario !== admin.id_usuario) {
                          e.currentTarget.style.borderColor = '#fed7aa';
                          e.currentTarget.style.backgroundColor = '#fffbf5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (adminSeleccionado?.id_usuario !== admin.id_usuario) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                            {admin.nombre} {admin.apellido}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{admin.email}</div>
                        </div>
                        <span className={`status-badge ${
                          admin.rol === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                          admin.rol === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {admin.rol}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sección: Cambiar Rol */}
          {adminSeleccionado && (
            <div className="edit-section">
              <h3 className="edit-section-title">Cambiar Rol</h3>
              
              {/* Información del admin Seleccionado */}
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                marginBottom: '1.5rem'
              }}>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '0.5rem' }}>admin seleccionado:</p>
                <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                  {adminSeleccionado.nombre} {adminSeleccionado.apellido}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '0.5rem' }}>{adminSeleccionado.email}</p>
                <div>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Rol actual: </span>
                  <span className={`status-badge ${
                    adminSeleccionado.rol === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                    adminSeleccionado.rol === 'admin' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {adminSeleccionado.rol}
                  </span>
                </div>
              </div>

              {/* Selector de Rol */}
              <div className="edit-form-grid">
                <div className="edit-form-group">
                  <label className="edit-form-label">Seleccionar nuevo rol:</label>
                  
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    border: rolSeleccionado === 'usuario' ? '2px solid #f97316' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: rolSeleccionado === 'usuario' ? '#fff7ed' : 'white',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="rol"
                      value="usuario"
                      checked={rolSeleccionado === 'usuario'}
                      onChange={(e) => setRolSeleccionado(e.target.value as 'usuario')}
                      disabled={isSaving}
                      style={{ marginTop: '0.25rem', marginRight: '0.75rem' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>Usuario</div>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>Permisos básicos: puede realizar reservas y ver complejos</p>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    border: rolSeleccionado === 'admin' ? '2px solid #f97316' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: rolSeleccionado === 'admin' ? '#fff7ed' : 'white',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="rol"
                      value="admin"
                      checked={rolSeleccionado === 'admin'}
                      onChange={(e) => setRolSeleccionado(e.target.value as 'admin')}
                      disabled={isSaving}
                      style={{ marginTop: '0.25rem', marginRight: '0.75rem' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>Administrador</div>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>Gestión de complejos, canchas y horarios</p>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    marginBottom: '1rem',
                    border: rolSeleccionado === 'super_admin' ? '2px solid #f97316' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: rolSeleccionado === 'super_admin' ? '#fff7ed' : 'white',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="rol"
                      value="super_admin"
                      checked={rolSeleccionado === 'super_admin'}
                      onChange={(e) => setRolSeleccionado(e.target.value as 'super_admin')}
                      disabled={isSaving}
                      style={{ marginTop: '0.25rem', marginRight: '0.75rem' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>Super Administrador</div>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '0.25rem' }}>Control total del sistema y gestión de administradores</p>
                      <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ Precaución: Acceso sin restricciones</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botón de Confirmación */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleAbrirConfirmacion}
                  disabled={isSaving || rolSeleccionado === adminSeleccionado.rol}
                  className="btn-guardar"
                >
                  {isSaving ? 'Guardando...' : 'Confirmar Cambio de Rol'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}




