import apiBackend from "../config/backend";
import { handleApiError } from "../services/ApiError";
import { tokenUtils } from "../utils/tokenUtils";
import {
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioListQuery,
  UsuarioContactoPublico,
  UsuarioRol,
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
      // Solo cerrar sesión en 401 (token inválido/expirado)
      // 403 significa "autenticado pero sin permisos" - no cerrar sesión
      if (error?.response?.status === 401) {
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
      params.rol = params.rol.toLowerCase() as UsuarioRol;
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

  // Obtener usuario por ID
  async obtener(id: string | number): Promise<Usuario> {
    return this.handleRequest(
      apiBackend.get<Usuario>(`/usuarios/${id}`)
    );
  }

  // Crear usuario
  async crear(payload: UsuarioCreateRequest): Promise<Usuario> {
    return this.handleRequest(
      apiBackend.post<Usuario>("/usuarios", payload)
    );
  }

  // Crear administrador
  async createAdministrador(payload: UsuarioCreateRequest): Promise<Usuario> {
    const adminPayload: UsuarioCreateRequest = {
      ...payload,
      rol: 'admin' as UsuarioRol
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

  // Obtener información pública de contacto (no requiere super_admin)
  async obtenerContacto(id: string | number): Promise<UsuarioContactoPublico> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token disponible');
      }

      const response = await apiBackend.get<UsuarioContactoPublico>(`/usuarios/${id}/contacto`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      // Solo cerrar sesión en 401, no en 403
      if (error?.response?.status === 401) {
        tokenUtils.clearTokenAndRedirect();
      }
      console.error('Error al obtener contacto del usuario:', error);
      throw error;
    }
  }
}

export const usuariosService = new UsuariosService();