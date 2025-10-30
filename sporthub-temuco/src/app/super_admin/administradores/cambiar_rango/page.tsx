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

  // Cargar administradores cuando el usuario empiece a buscar
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
        console.log('✅ [CambiarRangoAdmin] Administradores cargados:', data);
        
        setAdministradores(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('❌ [CambiarRangoAdmin] Error al cargar administradores:', err);
        setError('Error al cargar los administradores: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce: esperar 500ms después de que el usuario deje de escribir
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

  // Manejar cambio de rol
  const handleCambiarRol = async () => {
    if (!adminSeleccionado) {
      setError('Debes seleccionar un administrador primero');
      return;
    }

    // Verificar si el rol cambió
    if (rolSeleccionado === adminSeleccionado.rol) {
      setError('El rol seleccionado es el mismo que el actual');
      return;
    }

    // Confirmar cambio
    const confirmacion = window.confirm(
      `¿Estás seguro de cambiar el rol de "${adminSeleccionado.nombre} ${adminSeleccionado.apellido}" de "${adminSeleccionado.rol}" a "${rolSeleccionado}"?`
    );

    if (!confirmacion) return;

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
        ? data.find(u => u.id_usuario === adminSeleccionado.id_usuario)
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
  const administradoresFiltrados = administradores.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    return (
      a.nombre?.toLowerCase().includes(searchLower) ||
      a.apellido?.toLowerCase().includes(searchLower) ||
      a.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="admin-dashboard-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-orange-500 transition-colors p-2 hover:bg-orange-50 rounded-lg"
              disabled={isSaving}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="admin-page-title">Cambiar Rango de Administrador</h1>
              <p className="admin-cell-subtitle mt-1">Selecciona un administrador y modifica su rol en el sistema</p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="error-container">
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="success-container">
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Administradores */}
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Seleccionar Administrador</h2>
              <p className="admin-cell-subtitle mt-1">Escribe para buscar administradores por nombre o email</p>
            </div>
            
            {/* Búsqueda */}
            <div className="p-6">
              <div className="admin-search-container mb-6">
                <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                  autoFocus
                />
              </div>

              {!mostrarResultados && searchTerm.trim().length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg font-semibold text-gray-400 mb-2">Busca un administrador</p>
                  <p className="admin-cell-subtitle">Escribe el nombre, apellido o email del administrador que deseas modificar</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  <p className="admin-cell-subtitle mt-4">Buscando administradores...</p>
                </div>
              ) : mostrarResultados && administradoresFiltrados.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-lg font-semibold text-gray-400 mb-2">No se encontraron administradores</p>
                  <p className="admin-cell-subtitle">Intenta con otro término de búsqueda</p>
                </div>
              ) : (
                <>
                  <p className="admin-cell-subtitle mb-3">{administradoresFiltrados.length} administrador{administradoresFiltrados.length !== 1 ? 'es' : ''} encontrado{administradoresFiltrados.length !== 1 ? 's' : ''}</p>
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                    {administradoresFiltrados.map((admin) => (
                      <button
                        key={admin.id_usuario}
                        onClick={() => handleSeleccionarAdmin(admin)}
                        className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                          adminSeleccionado?.id_usuario === admin.id_usuario
                            ? 'border-orange-500 bg-orange-50 shadow-md transform scale-[1.01]'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="admin-cell-title mb-1">
                              {admin.nombre} {admin.apellido}
                            </div>
                            <div className="admin-cell-subtitle">{admin.email}</div>
                          </div>
                          <span className={`status-badge ml-3 ${
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
                </>
              )}
            </div>
          </div>

          {/* Panel de Cambio de Rol */}
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Cambiar Rol</h2>
            </div>
            
            {adminSeleccionado ? (
              <div className="p-6">
                {/* Información del Administrador */}
                <div className="mb-6 p-5" style={{ backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 className="admin-cell-title mb-3">Administrador Seleccionado</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="admin-cell-subtitle">Nombre: </span>
                      <span className="admin-cell-text font-semibold">
                        {adminSeleccionado.nombre} {adminSeleccionado.apellido}
                      </span>
                    </div>
                    <div>
                      <span className="admin-cell-subtitle">Email: </span>
                      <span className="admin-cell-text">{adminSeleccionado.email}</span>
                    </div>
                    <div>
                      <span className="admin-cell-subtitle">Rol actual: </span>
                      <span className={`status-badge ${
                        adminSeleccionado.rol === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        adminSeleccionado.rol === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {adminSeleccionado.rol}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selector de Rol */}
                <div className="space-y-3 mb-6">
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    rolSeleccionado === 'usuario' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                  }`}>
                    <input
                      type="radio"
                      name="rol"
                      value="usuario"
                      checked={rolSeleccionado === 'usuario'}
                      onChange={(e) => setRolSeleccionado(e.target.value as 'usuario')}
                      className="mt-1 mr-3 w-4 h-4 text-orange-500"
                      disabled={isSaving}
                    />
                    <div className="flex-1">
                      <div className="admin-cell-title">Usuario</div>
                      <p className="admin-cell-subtitle mt-1">Permisos básicos: puede realizar reservas y ver complejos</p>
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    rolSeleccionado === 'admin' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                  }`}>
                    <input
                      type="radio"
                      name="rol"
                      value="admin"
                      checked={rolSeleccionado === 'admin'}
                      onChange={(e) => setRolSeleccionado(e.target.value as 'admin')}
                      className="mt-1 mr-3 w-4 h-4 text-orange-500"
                      disabled={isSaving}
                    />
                    <div className="flex-1">
                      <div className="admin-cell-title">Administrador</div>
                      <p className="admin-cell-subtitle mt-1">Gestión de complejos, canchas y horarios</p>
                    </div>
                  </label>

                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    rolSeleccionado === 'super_admin' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                  }`}>
                    <input
                      type="radio"
                      name="rol"
                      value="super_admin"
                      checked={rolSeleccionado === 'super_admin'}
                      onChange={(e) => setRolSeleccionado(e.target.value as 'super_admin')}
                      className="mt-1 mr-3 w-4 h-4 text-orange-500"
                      disabled={isSaving}
                    />
                    <div className="flex-1">
                      <div className="admin-cell-title">Super Administrador</div>
                      <p className="admin-cell-subtitle mt-1">Control total del sistema y gestión de usuarios</p>
                      <p className="text-sm text-red-600 mt-1 font-medium">⚠️ Precaución: Acceso sin restricciones</p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleCambiarRol}
                  disabled={isSaving || rolSeleccionado === adminSeleccionado.rol}
                  className="export-button w-full justify-center"
                  style={{ 
                    opacity: (isSaving || rolSeleccionado === adminSeleccionado.rol) ? 0.5 : 1,
                    cursor: (isSaving || rolSeleccionado === adminSeleccionado.rol) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmar Cambio de Rol
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="admin-cell-subtitle">Selecciona un administrador de la lista para cambiar su rol</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
