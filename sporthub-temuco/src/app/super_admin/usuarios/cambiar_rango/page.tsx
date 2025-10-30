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
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Cargar usuarios cuando el usuario empiece a buscar
  useEffect(() => {
    const cargarUsuarios = async () => {
      if (searchTerm.trim().length === 0) {
        setMostrarResultados(false);
        setUsuarios([]);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        setMostrarResultados(true);
        
        console.log('🔍 [CambiarRangoUsuario] Buscando usuarios...');
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

    // Debounce: esperar 500ms después de que el usuario deje de escribir
    const timer = setTimeout(() => {
      cargarUsuarios();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Seleccionar usuario
  const handleSeleccionarUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setRolSeleccionado(usuario.rol as 'usuario' | 'admin' | 'super_admin');
    setError('');
    setSuccess('');
  };

  // Manejar cambio de rol
  const handleCambiarRol = async () => {
    if (!usuarioSeleccionado) {
      setError('Debes seleccionar un usuario primero');
      return;
    }

    // Verificar si el rol cambió
    if (rolSeleccionado === usuarioSeleccionado.rol) {
      setError('El rol seleccionado es el mismo que el actual');
      return;
    }

    // Confirmar cambio
    const confirmacion = window.confirm(
      `¿Estás seguro de cambiar el rol de "${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido}" de "${usuarioSeleccionado.rol}" a "${rolSeleccionado}"?`
    );

    if (!confirmacion) return;

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      console.log('🔄 [CambiarRangoUsuario] Cambiando rol a:', rolSeleccionado);
      await superAdminService.cambiarRolUsuario(Number(usuarioSeleccionado.id_usuario), rolSeleccionado);
      
      setSuccess(`✅ Rol cambiado exitosamente a "${rolSeleccionado}"`);
      
      // Recargar usuarios
      const data = await superAdminService.listarUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
      
      // Actualizar usuario seleccionado
      const usuarioActualizado = Array.isArray(data) 
        ? data.find(u => u.id_usuario === usuarioSeleccionado.id_usuario)
        : null;
      if (usuarioActualizado) {
        setUsuarioSeleccionado(usuarioActualizado);
        setRolSeleccionado(usuarioActualizado.rol as 'usuario' | 'admin' | 'super_admin');
      }
    } catch (err: any) {
      console.error('❌ [CambiarRangoUsuario] Error al cambiar rol:', err);
      setError('Error al cambiar el rol: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(searchLower) ||
      u.apellido?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="estadisticas-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cambiar Rango de Usuario</h1>
          <p className="text-gray-600 mt-1">Selecciona un usuario y modifica su rol en el sistema</p>
        </div>
        
        <button
          onClick={() => router.back()}
          className="export-button"
          disabled={isSaving}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="error-container" style={{ marginBottom: '1.5rem' }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {success && (
        <div className="success-container" style={{ marginBottom: '1.5rem' }}>
          <p><strong>Éxito:</strong> {success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Usuarios */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2 className="admin-table-title">Seleccionar Usuario</h2>
            <p className="admin-cell-subtitle mt-1">Escribe para buscar usuarios por nombre o email</p>
          </div>
          <div className="p-6">
            {/* Búsqueda */}
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
                <p className="text-lg font-semibold text-gray-400 mb-2">Busca un usuario</p>
                <p className="admin-cell-subtitle">Escribe el nombre, apellido o email del usuario que deseas modificar</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="admin-cell-subtitle mt-4">Buscando usuarios...</p>
              </div>
            ) : mostrarResultados && usuariosFiltrados.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-24 h-24 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-lg font-semibold text-gray-400 mb-2">No se encontraron usuarios</p>
                <p className="admin-cell-subtitle">Intenta con otro término de búsqueda</p>
              </div>
            ) : (
              <>
                <p className="admin-cell-subtitle mb-3">{usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}</p>
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                  {usuariosFiltrados.map((usuario) => (
                    <button
                      key={usuario.id_usuario}
                      onClick={() => handleSeleccionarUsuario(usuario)}
                      className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                        usuarioSeleccionado?.id_usuario === usuario.id_usuario
                          ? 'border-orange-500 bg-orange-50 shadow-md transform scale-[1.01]'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="admin-cell-title mb-1">
                            {usuario.nombre} {usuario.apellido}
                          </div>
                          <div className="admin-cell-subtitle">{usuario.email}</div>
                        </div>
                        <span className={`status-badge ml-3 ${
                          usuario.rol === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                          usuario.rol === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {usuario.rol}
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
          <div className="p-6">
            
            {usuarioSeleccionado ? (
              <>
                {/* Información del Usuario */}
                <div className="mb-6 p-5" style={{ backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 className="admin-cell-title mb-3">Usuario Seleccionado</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="admin-cell-subtitle">Nombre: </span>
                      <span className="admin-cell-text font-semibold">
                        {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                      </span>
                    </div>
                    <div>
                      <span className="admin-cell-subtitle">Email: </span>
                      <span className="admin-cell-text">{usuarioSeleccionado.email}</span>
                    </div>
                    <div>
                      <span className="admin-cell-subtitle">Rol actual: </span>
                      <span className={`status-badge ${
                        usuarioSeleccionado.rol === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        usuarioSeleccionado.rol === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {usuarioSeleccionado.rol}
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
                  disabled={isSaving || rolSeleccionado === usuarioSeleccionado.rol}
                  className="export-button w-full justify-center"
                  style={{ 
                    opacity: (isSaving || rolSeleccionado === usuarioSeleccionado.rol) ? 0.5 : 1,
                    cursor: (isSaving || rolSeleccionado === usuarioSeleccionado.rol) ? 'not-allowed' : 'pointer'
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
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p>Selecciona un usuario de la lista para cambiar su rol</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
