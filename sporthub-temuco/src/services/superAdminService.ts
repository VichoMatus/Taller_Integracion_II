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

  // Listar usuarios usando la ruta de SuperAdmin
  async listarUsuarios(params?: UsuarioListQuery): Promise<Usuario[]> {
    console.log('🔍 [superAdminService] Iniciando listado de usuarios');
    
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
    
    if (params?.rol) {
      params.rol = params.rol.toLowerCase() as any;
    }

    // Crear headers
    const headers = this.getAuthHeaders();
    console.log('📨 Headers de la petición:', {
      ...headers,
      'Authorization': headers.Authorization?.substring(0, 20) + '...'
    });

    try {
      console.log('📡 Realizando petición GET a /super_admin/users');
      const response = await apiBackend.get<any>("/super_admin/users", { 
        params,
        headers
      });
      
      console.log('✅ Respuesta recibida:', response.status);
      console.log('📊 Datos de respuesta:', response.data);
      
      // El backend SuperAdmin devuelve un formato ApiResponse con { ok: boolean, data: Usuario[] }
      if (response.data.ok && response.data.data) {
        // Si la respuesta tiene paginación, extraer los usuarios del array
        const users = response.data.data.users || response.data.data;
        console.log('👥 Usuarios extraídos:', users);
        return Array.isArray(users) ? users : [];
      } else if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        return response.data;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response.data);
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
}

export const superAdminService = new SuperAdminService();
