'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usuariosService } from '@/services/usuariosService';
import { tokenUtils } from '@/utils/tokenUtils';
import { Usuario, UserDisplay } from '@/types/usuarios';
import '@/app/admin/dashboard.css';

const ITEMS_PER_PAGE = 10;

export default function UsuariosPage() {
  const router = useRouter();
  
  // Estados del componente
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper functions
  const getUserType = (rol: string): 'Regular' | 'Premium' => {
    return (rol === 'admin' || rol === 'super_admin') ? 'Premium' : 'Regular';
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

      // Decodificar token para verificar rol y expiración
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        console.log('🎟️ Token payload:', payload);
        
        // Verificar expiración
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.error('❌ Token expirado');
          localStorage.clear();
          router.push('/login');
          return;
        }

        // Verificar rol
        const userRole = payload.role || localStorage.getItem('user_role');
        console.log('👤 Rol del usuario:', userRole);
        
        if (userRole !== 'super_admin') {
          console.error('❌ Rol incorrecto:', userRole);
          setError('Acceso denegado. Se requiere rol de super_admin.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
      } catch (e) {
        console.error('❌ Error decodificando token:', e);
        localStorage.clear();
        router.push('/login');
        return;
      }

      // Obtener usuarios
      console.log('🔄 Iniciando petición de usuarios...');
      try {
        const usuariosReales = await usuariosService.listar();
        console.log('✅ Usuarios obtenidos:', usuariosReales);
        
        // Mapear usuarios al formato de visualización
        const usersMapeados = usuariosReales.map(mapUsuarioToDisplay);
        console.log('📋 Usuarios mapeados:', usersMapeados);
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
        await usuariosService.eliminar(userId);
        cargarUsuarios();
      } catch (error: any) {
        setError('Error al eliminar usuario: ' + error.message);
      }
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await usuariosService.actualizar(userId, { verificado: true });
      cargarUsuarios();
    } catch (error: any) {
      setError('Error al aprobar usuario: ' + error.message);
    }
  };

  // Funciones para clases CSS
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Premium':
        return 'bg-purple-100 text-purple-800';
      case 'Regular':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-red-100 text-red-800';
      case 'Por revisar':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Panel de Gestión de Usuarios</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="input-search px-4 py-2 pr-10 rounded-lg border focus:outline-none focus:ring-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Actividad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(user.type)}`}>
                          {user.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastAccess}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️
                          </button>
                          {user.status === 'Por revisar' && (
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="text-green-600 hover:text-green-900"
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
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}