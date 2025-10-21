'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { superAdminService } from '@/services/superAdminService';
import { Usuario, UserDisplay } from '@/types/usuarios';
import { useSuperAdminProtection } from '@/hooks/useSuperAdminProtection';
import '@/app/super_admin/dashboard.css';

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
    // router.push(`/super_admin/usuarios/editar/${userId}`);
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

  // Funciones para clases CSS
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Premium':
        return 'status-premium';
      case 'Regular':
        return 'status-regular';
      default:
        return '';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'status-active';
      case 'Inactivo':
        return 'status-inactive';
      case 'Por revisar':
        return 'status-pending';
      default:
        return '';
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
    <div className="admin-page-layout">
      <div className="admin-main-header">
        <div className="admin-header-nav">
          <h1 className="admin-page-title">Panel de Gestión de Usuarios</h1>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
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
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${getTypeBadgeClass(user.type)}`}>
                      {user.type}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.lastAccess}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="btn-edit"
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn-delete"
                        title="Eliminar usuario"
                      >
                        🗑️
                      </button>
                      {user.status === 'Por revisar' && (
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="btn-approve"
                          title="Aprobar usuario"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length > 0 && (
            <div className="table-footer">
              <div className="table-info">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
              </div>
              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-pagination"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
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
  );
}