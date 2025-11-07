'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { Usuario } from '@/types/usuarios';

export default function CambiarRangoUsuarioPage() {
  const router = useRouter();
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<'usuario' | 'admin' | 'super_admin'>('usuario');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        console.log('🔍 [CambiarRangoUsuario] Cargando usuarios...');
        const data = await superAdminService.listarUsuarios();
        console.log('✅ [CambiarRangoUsuario] Usuarios cargados:', data);
        
        setUsuarios(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('❌ [CambiarRangoUsuario] Error al cargar usuarios:', err);
        setError('Error al cargar los usuarios: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    cargarUsuarios();
  }, []);

  // Seleccionar usuario desde el dropdown
  const handleSeleccionarUsuario = (idUsuario: string) => {
    const usuario = usuarios.find(u => u.id_usuario.toString() === idUsuario);
    if (usuario) {
      setUsuarioSeleccionado(usuario);
      setRolSeleccionado(usuario.rol as 'usuario' | 'admin' | 'super_admin');
      setError('');
      setSuccess('');
    }
  };

  // Abrir modal de confirmación
  const handleAbrirConfirmacion = () => {
    if (!usuarioSeleccionado) {
      setError('Debes seleccionar un usuario primero');
      return;
    }

    // Verificar si el rol cambió
    if (rolSeleccionado === usuarioSeleccionado.rol) {
      setError('El rol seleccionado es el mismo que el actual');
      return;
    }

    setShowConfirmModal(true);
  };

  // Confirmar cambio de rol
  const handleCambiarRol = async () => {
    setShowConfirmModal(false);

    if (!usuarioSeleccionado) return;

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      console.log('🔄 [CambiarRangoUsuario] Cambiando rol a:', rolSeleccionado);
      await superAdminService.cambiarRolUsuario(Number(usuarioSeleccionado.id_usuario), rolSeleccionado);
      
      setSuccess(`✅ Rol cambiado exitosamente a "${rolSeleccionado}"`);
      
      // Esperar 1.5 segundos y redirigir al panel de usuarios
      setTimeout(() => {
        router.push('/super_admin/usuarios');
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ [CambiarRangoUsuario] Error al cambiar rol:', err);
      setError('Error al cambiar el rol: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios;

  return (
    <div className="admin-page-layout">
      {/* Modal de Confirmación */}
      {showConfirmModal && usuarioSeleccionado && (
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
                ¿Estás seguro de cambiar el rol de <strong>{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</strong> de "<strong>{usuarioSeleccionado.rol}</strong>" a "<strong>{rolSeleccionado}</strong>"?
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
          <h1 className="admin-page-title">Cambiar Rango de Usuario</h1>
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
          
          {/* Sección: Seleccionar Usuario */}
          <div className="edit-section">
            <h3 className="edit-section-title">Seleccionar Usuario</h3>
            <div className="edit-form-group">
              <label className="edit-form-label">Usuario:</label>
              <select
                value={usuarioSeleccionado?.id_usuario || ''}
                onChange={(e) => handleSeleccionarUsuario(e.target.value)}
                className="edit-form-input"
                disabled={isLoading}
              >
                <option value="">-- Seleccione un usuario --</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id_usuario} value={usuario.id_usuario}>
                    {usuario.nombre} {usuario.apellido} ({usuario.email}) - Rol: {usuario.rol}
                  </option>
                ))}
              </select>
            </div>

            {isLoading && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f4f6',
                  borderTop: '3px solid #f97316',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '14px' }}>Cargando usuarios...</p>
              </div>
            )}
          </div>

          {/* Sección: Cambiar Rol */}
          {usuarioSeleccionado && (
            <div className="edit-section">
              <h3 className="edit-section-title">Cambiar Rol</h3>

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
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '0.25rem' }}>Control total del sistema y gestión de usuarios</p>
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
                  disabled={isSaving || rolSeleccionado === usuarioSeleccionado.rol}
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
