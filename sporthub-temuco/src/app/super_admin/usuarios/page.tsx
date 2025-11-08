'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { Usuario, UserDisplay } from '@/types/usuarios';
import { useSuperAdminProtection } from '@/hooks/useSuperAdminProtection';

const ITEMS_PER_PAGE = 10;

export default function UsuariosPage() {
  const router = useRouter();
  
  // Protección de ruta
  useSuperAdminProtection();

  // Estados del componente
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Event handlers
  const handleCreateUser = () => {
    router.push('/super_admin/usuarios/crear');
  };

  const handleExportReport = () => {
    // TODO: Implementar la exportación del informe
    console.log('Exportando informe de usuarios...');
  };

  // Helper functions
  const getUserType = (rol: string): 'Regular' | 'Premium' => {
    // En esta vista solo mostramos usuarios regulares
    return 'Regular';
  };

  const getUserStatus = (esta_activo: boolean, verificado: boolean): 'Activo' | 'Inactivo' | 'Por revisar' => {
    if (!esta_activo) return 'Inactivo';
    if (!verificado) return 'Por revisar';
    return 'Activo';
  };

  const mapUsuarioToDisplay = (usuario: Usuario): UserDisplay => ({
    id: usuario.id_usuario.toString(),
    name: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
    email: usuario.email,
    rol: usuario.rol,
    verificado: usuario.verificado,
    esta_activo: usuario.esta_activo,
    type: getUserType(usuario.rol),
    status: getUserStatus(usuario.esta_activo, usuario.verificado),
    lastAccess: new Date(usuario.fecha_actualizacion).toLocaleDateString('es-CL')
  });

    // Función principal para cargar usuarios
  const cargarUsuarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Verificar autenticación y obtener token fresco
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('🔍 Verificando token:', token ? `${token.substring(0, 20)}...` : 'No encontrado');
      
      if (!token) {
        console.error('❌ No se encontró token');
        router.push('/login');
        return;
      }

      // PRUEBA DE CONECTIVIDAD PRIMERO
      try {
        console.log('🧪 Probando conectividad con backend...');
        const testResponse = await fetch('http://localhost:4000/api/super_admin/test', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('✅ Conectividad OK:', testData);
        } else {
          console.error('❌ Test de conectividad falló:', testResponse.status, testResponse.statusText);
        }
      } catch (testError) {
        console.error('❌ Error en test de conectividad:', testError);
        setError(`Error de conexión: ${testError instanceof Error ? testError.message : 'Desconocido'}`);
        return;
      }

      // Obtener usuarios
      console.log('🔄 Iniciando petición de usuarios...');
      try {
        const usuariosReales = await superAdminService.listarUsuarios();
        console.log('✅ Usuarios obtenidos del servicio:', usuariosReales);
        console.log('📊 Tipo de usuarios obtenidos:', typeof usuariosReales, Array.isArray(usuariosReales));
        console.log('📊 Cantidad de usuarios:', usuariosReales?.length || 0);
        
        if (!usuariosReales || !Array.isArray(usuariosReales)) {
          console.warn('⚠️ Los usuarios no son un array válido');
          setUsers([]);
          return;
        }
        
        if (usuariosReales.length === 0) {
          console.warn('⚠️ Array de usuarios vacío');
          setUsers([]);
          return;
        }
        
        // Mapear usuarios al formato de visualización
        console.log('🔄 Iniciando mapeo de usuarios...');
        const usersMapeados = usuariosReales.map((usuario, index) => {
          console.log(`👤 Mapeando usuario ${index + 1}:`, usuario);
          return mapUsuarioToDisplay(usuario);
        });
        console.log('📋 Usuarios mapeados correctamente:', usersMapeados);
        setUsers(usersMapeados);
      } catch (err) {
        console.error('❌ Error al listar usuarios:', err);
        throw err; // Re-lanzamos el error para que sea manejado por el catch exterior
      }
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
      setError(error.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Funciones de manejo de usuarios
  const handleEditUser = (userId: string) => {
    console.log('Editando usuario:', userId);
      router.push(`/super_admin/usuarios/editar/${userId}`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await superAdminService.eliminarUsuario(userId);
        cargarUsuarios();
      } catch (error: any) {
        setError('Error al eliminar usuario: ' + error.message);
      }
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await superAdminService.actualizarUsuario(userId, { verificado: true });
      cargarUsuarios();
    } catch (error: any) {
      setError('Error al aprobar usuario: ' + error.message);
    }
  };

  // Filtrar y paginar usuarios
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.type.toLowerCase().includes(searchLower) ||
      user.status.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Render
  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Usuarios</h1>
        
        <div className="admin-controls">
          <button className="export-button" onClick={handleExportReport}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button className="export-button" onClick={handleCreateUser}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Usuario
          </button>
          <button 
            onClick={() => router.push('/super_admin/usuarios/cambiar_rango')}
            className="export-button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cambiar Rango Usuario
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Contenedor Principal de la Tabla */}
          <div className="admin-table-container">
            {/* Header de la Tabla */}
            <div className="admin-table-header">
              <h2 className="admin-table-title">Lista de Usuarios ({filteredUsers.length})</h2>
              
              <div className="admin-search-filter">
                {/* Búsqueda */}
                <div className="admin-search-container">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                  <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Filtro */}
                <button className="btn-filtrar">
                  Filtrar
                </button>
              </div>
            </div>
            
            {/* Tabla Principal */}
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Última Actividad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-cell-title">{user.name}</div>
                      </td>
                      <td>
                        <div className="admin-cell-subtitle">{user.email}</div>
                      </td>
                      <td>
                        <div className="admin-cell-text">
                          {user.type}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          user.status === 'Activo' ? 'status-activo' :
                          user.status === 'Inactivo' ? 'status-inactivo' :
                          'status-por-revisar'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-cell-text">
                          {user.lastAccess}
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions-container">
                          <button 
                            className="btn-action btn-editar" 
                            title="Editar"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          
                          <button 
                            className="btn-action btn-eliminar" 
                            title="Eliminar"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          {user.status === 'Por revisar' && (
                            <button 
                              className="btn-action btn-aprobar" 
                              title="Aprobar"
                              onClick={() => handleApproveUser(user.id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            <div className="admin-pagination-container">
              <div className="admin-pagination-info">
                mostrando {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
              </div>
              
              <div className="admin-pagination-controls">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-pagination"
                >
                  Anterior
                </button>
                
                <div className="admin-pagination-numbers">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn-pagination ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn-pagination"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}