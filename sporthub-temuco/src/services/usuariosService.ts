import apiBackend from "../config/backend";
import { handleApiError } from "../services/ApiError";
import { tokenUtils } from "../utils/tokenUtils";
import {
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioListQuery,
} from "../types/usuarios";

class UsuariosService {
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
    console.log('🔍 [usuariosService] Verificando roles:', {
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

  // Listar usuarios
  async listar(params?: UsuarioListQuery): Promise<Usuario[]> {
    console.log('🔍 [usuariosService] Iniciando listado de usuarios');
    
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    // Log del token (solo los primeros caracteres por seguridad)
    console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
    
    if (params?.rol) {
      params.rol = params.rol.toLowerCase();
    }

    // Crear headers
    const headers = this.getAuthHeaders();
    console.log('📨 Headers de la petición:', {
      ...headers,
      'Authorization': headers.Authorization?.substring(0, 20) + '...'
    });

    try {
      console.log('📡 Realizando petición GET a /usuarios');
      const response = await apiBackend.get<Usuario[]>("/usuarios", { 
        params,
        headers
      });
      console.log('✅ Respuesta recibida:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en la petición:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Búsqueda de usuarios por texto para Admin (no requiere super_admin en el frontend)
  // Útil para autocompletar emails/nombres desde páginas Admin.
  async buscar(q: string, size = 8): Promise<Usuario[]> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
      const { data } = await apiBackend.get<Usuario[]>('/usuarios', { params: { q, size }, headers });
      return data;
    } catch (error) {
      console.error('Error en usuariosService.buscar:', error);
      handleApiError(error);
      return [];
    }
  }

  // Obtener usuario por ID
  async obtener(id: string | number): Promise<Usuario> {
    return this.handleRequest(
      apiBackend.get<Usuario>(`/usuarios/${id}`)
    );
  }

  // Obtener usuario por ID sin exigir rol super_admin en frontend
  // Útil cuando la vista es admin y queremos consultar un usuario por su ID
  async obtenerPublico(id: string | number): Promise<Usuario> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
      const { data } = await apiBackend.get<Usuario>(`/usuarios/${id}`, { headers });
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  // Crear usuario
  async crear(payload: UsuarioCreateRequest): Promise<Usuario> {
    return this.handleRequest(
      apiBackend.post<Usuario>("/usuarios", payload)
    );
  }

  // Crear administrador
  async createAdministrador(payload: UsuarioCreateRequest): Promise<Usuario> {
    const adminPayload = {
      ...payload,
      rol: 'admin'
    };
    return this.crear(adminPayload);
  }

  // Actualizar usuario
  async actualizar(id: string | number, payload: UsuarioUpdateRequest): Promise<Usuario> {
    return this.handleRequest(
      apiBackend.put<Usuario>(`/usuarios/${id}`, payload)
    );
  }

  // Eliminar usuario
  async eliminar(id: string | number): Promise<void> {
    return this.handleRequest(
      apiBackend.delete(`/usuarios/${id}`)
    );
  }

  // Operaciones de estado
  async activar(id: string | number): Promise<Usuario> {
    return this.handleRequest(
      apiBackend.patch<Usuario>(`/usuarios/${id}/activar`)
    );
  }

  async desactivar(id: string | number): Promise<Usuario> {
    return this.handleRequest(
      apiBackend.patch<Usuario>(`/usuarios/${id}/desactivar`)
    );
  }

  async verificar(id: string | number): Promise<Usuario> {
    return this.handleRequest(
      apiBackend.patch<Usuario>(`/usuarios/${id}/verificar`)
    );
  }
}

export const usuariosService = new UsuariosService();