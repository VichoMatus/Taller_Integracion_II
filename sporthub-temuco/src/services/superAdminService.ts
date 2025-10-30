import apiBackend from "../config/backend";
import { handleApiError } from "../services/ApiError";
import { tokenUtils } from "../utils/tokenUtils";
import {
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioListQuery,
} from "../types/usuarios";

/**
 * SERVICIO SUPERADMIN - FRONTEND
 * ==============================
 * 
 * Este servicio maneja las peticiones específicas de SuperAdmin
 * usando las rutas correctas del backend (/api/super_admin/*)
 * 
 * Diferencias con usuariosService:
 * - Usa rutas /api/super_admin/* en lugar de /api/usuarios/*
 * - Manejo específico de autenticación SuperAdmin
 * - Métodos adicionales para funciones de administración
 */
class SuperAdminService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token disponible');
    }

    // Validar token
    const decoded = tokenUtils.decodeToken(token);
    if (!decoded) {
      tokenUtils.clearTokenAndRedirect();
      throw new Error('Token inválido');
    }

    // Verificar expiración
    if (tokenUtils.isTokenExpired(token)) {
      tokenUtils.clearTokenAndRedirect();
      throw new Error('Token expirado');
    }

    // Verificar rol específico de super_admin
    const storedRole = localStorage.getItem('user_role');
    console.log('🔍 [superAdminService] Verificando roles:', {
      tokenRole: decoded.role,
      storedRole,
      tokenPreview: `${token.substring(0, 20)}...`
    });

    if (decoded.role !== 'super_admin' && storedRole !== 'super_admin') {
      console.error('❌ Rol incorrecto:', {
        tokenRole: decoded.role,
        storedRole,
        required: 'super_admin'
      });
      tokenUtils.clearTokenAndRedirect();
      throw new Error('Acceso denegado: se requiere rol super_admin');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
    try {
      const response = await request;
      return response.data;
    } catch (error: any) {
      // Si es error de autorización, limpiar token y redirigir
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        tokenUtils.clearTokenAndRedirect();
      }
      handleApiError(error);
      throw error;
    }
  }

  /**
   * MÉTODOS DE GESTIÓN DE USUARIOS (SUPERADMIN)
   * ===========================================
   */

  // Listar usuarios usando la ruta de SuperAdmin (solo usuarios regulares)
  async listarUsuarios(params?: UsuarioListQuery): Promise<Usuario[]> {
    console.log('🔍 [superAdminService] Iniciando listado de usuarios');
    
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
    
    // 🎯 FILTRO IMPORTANTE: Solo obtener usuarios con rol 'usuario' (no admins ni super_admins)
    const filteredParams = {
      ...params,
      rol: 'usuario'  // Forzar filtro por rol usuario
    };
    
    console.log('🎯 Parámetros de filtro aplicados:', filteredParams);

    // Crear headers
    const headers = this.getAuthHeaders();
    console.log('📨 Headers de la petición:', {
      ...headers,
      'Authorization': headers.Authorization?.substring(0, 20) + '...'
    });

    try {
      console.log('📡 Realizando petición GET a /super_admin/users con filtro de usuarios');
      const response = await apiBackend.get<any>("/super_admin/users", { 
        params: filteredParams,
        headers
      });
      
      console.log('✅ Respuesta recibida:', response.status);
      console.log('📊 Datos de respuesta:', response.data);
      
      // Manejar diferentes formatos de respuesta
      console.log('📊 Estructura completa de la respuesta:', JSON.stringify(response.data, null, 2));
      
      let usuarios = [];
      
      // Caso 1: Respuesta con formato ApiResponse { ok: true, data: {...} }
      if (response.data && typeof response.data === 'object' && response.data.ok) {
        console.log('📋 Formato ApiResponse detectado');
        const responseData = response.data.data;
        
        // Subcase: datos paginados { users: [...], total: X, page: Y }
        if (responseData && responseData.users && Array.isArray(responseData.users)) {
          usuarios = responseData.users;
          console.log('👥 Usuarios extraídos de paginación:', usuarios.length);
        }
        // Subcase: array directo de usuarios
        else if (Array.isArray(responseData)) {
          usuarios = responseData;
          console.log('👥 Usuarios extraídos de array directo:', usuarios.length);
        }
        // Subcase: objeto único de usuario
        else if (responseData && responseData.id_usuario) {
          usuarios = [responseData];
          console.log('� Usuario único extraído:', usuarios.length);
        }
      }
      // Caso 2: Respuesta directa como array
      else if (Array.isArray(response.data)) {
        usuarios = response.data;
        console.log('👥 Array directo de usuarios:', usuarios.length);
      }
      // Caso 3: Respuesta con formato FastAPI directo { users: [...] }
      else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        usuarios = response.data.users;
        console.log('👥 Usuarios extraídos de FastAPI directo:', usuarios.length);
      }
      // Caso 4: Respuesta con items (formato alternativo de paginación)
      else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        usuarios = response.data.items;
        console.log('👥 Usuarios extraídos de items:', usuarios.length);
      }
      
      // 🎯 FILTRO DOBLE: Asegurar que solo se muestren usuarios con rol 'usuario'
      const usuariosFiltrados = usuarios.filter((usuario: any) => {
        const rolValido = usuario.rol === 'usuario' || usuario.rol === 'user';
        if (!rolValido) {
          console.log(`🚫 Filtrando usuario con rol '${usuario.rol}':`, usuario.email);
        }
        return rolValido;
      });
      
      // Validar que tenemos usuarios válidos
      if (usuariosFiltrados.length > 0) {
        console.log('✅ Usuarios filtrados encontrados:', usuariosFiltrados.length);
        console.log('👥 Primeros usuarios:', usuariosFiltrados.slice(0, 2).map((u: any) => ({ email: u.email, rol: u.rol })));
        return usuariosFiltrados;
      } else {
        console.warn('⚠️ No se encontraron usuarios con rol "usuario" en la respuesta');
        console.warn('📊 Total de usuarios antes del filtro:', usuarios.length);
        console.warn('📊 Roles encontrados:', usuarios.map((u: any) => u.rol));
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error completo en la petición:', error);
      console.error('❌ Error en la petición:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      // Re-lanzar un error más descriptivo
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint no encontrado. Verifica la configuración de rutas.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Error de autenticación. Token inválido o expirado.');
      } else {
        throw new Error(`Error del servidor: ${error.response?.status || 'Desconocido'}`);
      }
    }
  }

  // Listar administradores usando la ruta de SuperAdmin (solo administradores)
  async listarAdministradores(params?: UsuarioListQuery): Promise<Usuario[]> {
    console.log('🔍 [superAdminService] Iniciando listado de administradores');
    
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
    
    // 🎯 FILTRO IMPORTANTE: Solo obtener usuarios con rol 'admin'
    const filteredParams = {
      ...params,
      rol: 'admin'  // Forzar filtro por rol administrador
    };
    
    console.log('🎯 Parámetros de filtro aplicados (admin):', filteredParams);

    // Crear headers
    const headers = this.getAuthHeaders();
    console.log('📨 Headers de la petición:', {
      ...headers,
      'Authorization': headers.Authorization?.substring(0, 20) + '...'
    });

    try {
      console.log('📡 Realizando petición GET a /super_admin/users con filtro de administradores');
      const response = await apiBackend.get<any>("/super_admin/users", { 
        params: filteredParams,
        headers
      });
      
      console.log('✅ Respuesta recibida:', response.status);
      console.log('📊 Datos de respuesta:', response.data);
      
      // Manejar diferentes formatos de respuesta
      console.log('📊 Estructura completa de la respuesta:', JSON.stringify(response.data, null, 2));
      
      let administradores = [];
      
      // Caso 1: Respuesta con formato ApiResponse { ok: true, data: {...} }
      if (response.data && typeof response.data === 'object' && response.data.ok) {
        console.log('📋 Formato ApiResponse detectado');
        const responseData = response.data.data;
        
        // Subcase: datos paginados { users: [...], total: X, page: Y }
        if (responseData && responseData.users && Array.isArray(responseData.users)) {
          administradores = responseData.users;
          console.log('👥 Administradores extraídos de paginación:', administradores.length);
        }
        // Subcase: array directo de usuarios
        else if (Array.isArray(responseData)) {
          administradores = responseData;
          console.log('👥 Administradores extraídos de array directo:', administradores.length);
        }
        // Subcase: objeto único de usuario
        else if (responseData && responseData.id_usuario) {
          administradores = [responseData];
          console.log('👤 Administrador único extraído:', administradores.length);
        }
      }
      // Caso 2: Respuesta directa como array
      else if (Array.isArray(response.data)) {
        administradores = response.data;
        console.log('👥 Array directo de administradores:', administradores.length);
      }
      // Caso 3: Respuesta con formato FastAPI directo { users: [...] }
      else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        administradores = response.data.users;
        console.log('👥 Administradores extraídos de FastAPI directo:', administradores.length);
      }
      // Caso 4: Respuesta con items (formato alternativo de paginación)
      else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        administradores = response.data.items;
        console.log('👥 Administradores extraídos de items:', administradores.length);
      }
      
      // 🎯 FILTRO DOBLE: Asegurar que solo se muestren usuarios con rol 'admin'
      const administradoresFiltrados = administradores.filter((usuario: any) => {
        const rolValido = usuario.rol === 'admin';
        if (!rolValido) {
          console.log(`🚫 Filtrando usuario con rol '${usuario.rol}':`, usuario.email);
        }
        return rolValido;
      });
      
      // Validar que tenemos administradores válidos
      if (administradoresFiltrados.length > 0) {
        console.log('✅ Administradores filtrados encontrados:', administradoresFiltrados.length);
        console.log('👥 Primeros administradores:', administradoresFiltrados.slice(0, 2).map((u: any) => ({ email: u.email, rol: u.rol })));
        return administradoresFiltrados;
      } else {
        console.warn('⚠️ No se encontraron administradores con rol "admin" en la respuesta');
        console.warn('📊 Total de usuarios antes del filtro:', administradores.length);
        console.warn('📊 Roles encontrados:', administradores.map((u: any) => u.rol));
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error completo en la petición:', error);
      console.error('❌ Error en la petición:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      // Re-lanzar un error más descriptivo
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint no encontrado. Verifica la configuración de rutas.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Error de autenticación. Token inválido o expirado.');
      } else {
        throw new Error(`Error del servidor: ${error.response?.status || 'Desconocido'}`);
      }
    }
  }

  // Obtener usuario por ID
  async obtenerUsuario(id: string | number): Promise<Usuario> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.get<Usuario>(`/super_admin/users/${id}`, { headers })
    );
  }

  // Actualizar usuario
  async actualizarUsuario(id: string | number, payload: UsuarioUpdateRequest): Promise<Usuario> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.patch<Usuario>(`/super_admin/users/${id}`, payload, { headers })
    );
  }

  // Eliminar usuario (desactivar)
  async eliminarUsuario(id: string | number): Promise<void> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.delete(`/super_admin/users/${id}`, { headers })
    );
  }

  /**
   * MÉTODOS ESPECÍFICOS DE SUPERADMIN
   * =================================
   */

  // Obtener estadísticas del sistema
  async obtenerEstadisticas(): Promise<any> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.get<any>('/super_admin/system/statistics', { headers })
    );
  }

  // Obtener datos del dashboard
  async obtenerDashboard(): Promise<any> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.get<any>('/super_admin/dashboard', { headers })
    );
  }

  // Búsqueda global
  async busquedaGlobal(query: string): Promise<any> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.get<any>(`/super_admin/search?q=${encodeURIComponent(query)}`, { headers })
    );
  }

  // Obtener complejos
  async obtenerComplejos(params?: any): Promise<any> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.get<any>('/super_admin/complejos', { params, headers })
    );
  }

  // Obtener complejo por ID
  async obtenerComplejo(id: string | number): Promise<any> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.get<any>(`/super_admin/complejos/${id}`, { headers })
    );
  }

  // Obtener canchas de un complejo
  async obtenerCanchasComplejo(id: string | number): Promise<any> {
    const headers = this.getAuthHeaders();
    return this.handleRequest(
      apiBackend.get<any>(`/super_admin/complejos/${id}/canchas`, { headers })
    );
  }

  /**
   * Promocionar rol de un usuario
   * Solo super_admin puede promover a 'admin' o 'super_admin'
   */
  async cambiarRolUsuario(idUsuario: number, nuevoRol: 'usuario' | 'admin' | 'super_admin'): Promise<Usuario> {
    const headers = this.getAuthHeaders();
    const endpoint = `/admin/usuarios/${idUsuario}/rol`;
    
    console.log(`🔄 [superAdminService] Cambiando rol de usuario ${idUsuario} a ${nuevoRol}`);
    console.log(`📍 [superAdminService] Endpoint: ${endpoint}`);
    console.log(`📍 [superAdminService] BaseURL: ${apiBackend.defaults.baseURL}`);
    console.log(`📍 [superAdminService] Headers:`, headers);
    console.log(`📍 [superAdminService] Body:`, { rol: nuevoRol });
    
    try {
      const response = await this.handleRequest(
        apiBackend.post<Usuario>(
          endpoint,
          { rol: nuevoRol },
          { headers }
        )
      );
      console.log(`✅ [superAdminService] Rol cambiado exitosamente:`, response);
      return response;
    } catch (error: any) {
      console.error(`❌ [superAdminService] Error al cambiar rol:`, error);
      console.error(`❌ [superAdminService] Error message:`, error.message);
      console.error(`❌ [superAdminService] Error config:`, error.config);
      throw error;
    }
  }
}

export const superAdminService = new SuperAdminService();
