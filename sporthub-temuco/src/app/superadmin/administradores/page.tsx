'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/admin/dashboard.css';
import { usuariosService } from '@/services/usuariosService';
import { Usuario } from '@/types/usuarios';

import { useAuthProtection } from '@/hooks/useAuthProtection';

export default function AdministradoresPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 4;
  const [isAuthed, setIsAuthed] = useState(false);

  // Verificar la autenticación primero
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const userRole = localStorage.getItem('user_role');
        
        if (!token || !userRole) {
          router.push('/login');
          return;
        }

        if (userRole !== 'superadmin' && userRole !== 'super_admin') {
          setError('Acceso denegado. Se requiere rol de superadmin.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        // Si llegamos aquí, la autenticación es correcta
        setIsAuthed(true);
      } catch (error) {
        console.error('Error de autenticación:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Estado para almacenar todos los usuarios sin filtrar
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);

  // Función para cargar usuarios
  const cargarUsuarios = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 [AdministradoresPage] Iniciando carga de usuarios...');
      const userRole = localStorage.getItem('user_role');
      console.log('👤 [AdministradoresPage] Rol actual:', userRole);

      const data = await usuariosService.listar({
        rol: 'admin'
      });
      
      console.log('✅ [AdministradoresPage] Usuarios cargados:', data);
      setTodosUsuarios(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('❌ [AdministradoresPage] Error:', error);
      
      // Manejar diferentes tipos de errores
      if (error?.response?.status === 403) {
        console.error('🚫 [AdministradoresPage] Error de permisos');
        setError('No tienes permisos para ver esta información');
      } else if (error?.response?.status === 401) {
        console.error('🔒 [AdministradoresPage] Error de autenticación');
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(error.message || 'Error al cargar usuarios');
      }
      
      setTodosUsuarios([]); // Limpiar la lista en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar usuarios basado en el término de búsqueda
  const filtrarUsuarios = () => {
    if (!searchTerm.trim()) {
      setUsuarios(todosUsuarios);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const usuariosFiltrados = todosUsuarios.filter(usuario => 
      usuario.nombre.toLowerCase().includes(searchLower) ||
      usuario.apellido.toLowerCase().includes(searchLower) ||
      usuario.email.toLowerCase().includes(searchLower)
    );
    setUsuarios(usuariosFiltrados);
  };

  // Cargar usuarios solo cuando la autenticación esté confirmada
  useEffect(() => {
    if (isAuthed) {
      cargarUsuarios();
    }
  }, [isAuthed]);

  // Filtrar usuarios cuando cambie el término de búsqueda o la lista completa
  useEffect(() => {
    filtrarUsuarios();
  }, [searchTerm, todosUsuarios]);

  // Función para navegar a editar administrador
  const editAdmin = (adminId: string | number) => {
    router.push(`/superadmin/administradores/${adminId}`);
  };

  // Función para desactivar administrador
  const desactivarAdmin = async (adminId: string | number) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar este administrador?')) {
      try {
        await usuariosService.actualizar(adminId, { esta_activo: false });
        cargarUsuarios(); // Recargar la lista
      } catch (error: any) {
        setError(error.message || 'Error al desactivar administrador');
      }
    }
  };

  // Calcular paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = usuarios.slice(startIndex, endIndex);
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  if (!isAuthed) {
    return (
      <div className="admin-dashboard-container">
        <div className="text-center p-8">
          <p>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header Principal */}
      <div className="estadisticas-header">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Gestión de Administradores</h1>
        
        <div className="admin-controls">
          <button className="export-button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar informe
          </button>
          
          <button 
            onClick={() => router.push('/superadmin/administradores/nuevo')}
            className="export-button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Administrador
          </button>
        </div>
      </div>

      {/* Contenedor Principal de la Tabla */}
      <div className="admin-table-container">
        {/* Header de la Tabla */}
        <div className="admin-table-header">
          <h2 className="admin-table-title">Lista de Administradores</h2>
          
          <div className="admin-search-filter">
            {/* Búsqueda */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  // Resetear la página cuando se realiza una nueva búsqueda
                  if (currentPage !== 1) setCurrentPage(1);
                }}
                className="admin-search-input"
                aria-label="Buscar administradores"
              />
              <svg className="admin-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="admin-search-clear"
                  title="Limpiar búsqueda"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Estado de Carga */}
        {isLoading ? (
          <div className="loading-spinner">Cargando...</div>
        ) : (
          /* Tabla Principal */
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>
                      <div className="admin-cell-title">
                        <div className="admin-avatar">{usuario.nombre[0].toUpperCase()}</div>
                        {`${usuario.nombre} ${usuario.apellido}`}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cell-subtitle">{usuario.email}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${usuario.esta_activo ? 'status-activo' : 'status-inactivo'}`}>
                        {usuario.esta_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-cell-text">
                        {new Date(usuario.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <div className="admin-actions-container">
                        <button 
                          className="btn-action btn-editar" 
                          title="Editar"
                          onClick={() => editAdmin(usuario.id_usuario)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        {usuario.esta_activo && (
                          <button 
                            className="btn-action btn-eliminar" 
                            title="Desactivar"
                            onClick={() => desactivarAdmin(usuario.id_usuario)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="admin-pagination-container">
                <div className="admin-pagination-info">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, usuarios.length)} de {usuarios.length} administradores
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}