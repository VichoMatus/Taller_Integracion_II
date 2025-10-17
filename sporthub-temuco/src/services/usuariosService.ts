import apiBackend from "../config/backend";
import { handleApiError } from "../services/ApiError";
import {
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioListQuery,
} from "../types/usuarios";

export const usuariosService = {
  // Listar usuarios
  async listar(params?: UsuarioListQuery): Promise<Usuario[]> {
    try {
      console.log('🔍 [usuariosService] Listando usuarios con params:', params);
      
      // Agregar el token en los headers de la petición
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      
      // Asegurarse de que el rol esté en minúsculas para consistencia
      if (params?.rol) {
        params.rol = params.rol.toLowerCase();
      }

      const { data } = await apiBackend.get<Usuario[]>("/usuarios", { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ [usuariosService] Usuarios obtenidos:', data);
      return Array.isArray(data) ? data : [];
      
    } catch (e) {
      console.error('❌ [usuariosService] Error al listar usuarios:', e);
      handleApiError(e);
    }
  },

  // Crear un nuevo administrador
  async createAdministrador(payload: UsuarioCreateRequest): Promise<Usuario> {
    try {
      const adminPayload = {
        ...payload,
        rol: 'admin'
      };
      const { data } = await apiBackend.post<Usuario>("/usuarios", adminPayload);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  // Obtener usuario por ID
  async obtener(id: string | number): Promise<Usuario> {
    try {
      const { data } = await apiBackend.get<Usuario>(`/usuarios/${id}`);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  // Crear usuario
  async crear(payload: UsuarioCreateRequest): Promise<Usuario> {
    try {
      const { data } = await apiBackend.post<Usuario>("/usuarios", payload);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  // Actualizar usuario
  async actualizar(
    id: string | number,
    payload: UsuarioUpdateRequest
  ): Promise<Usuario> {
    try {
      const { data } = await apiBackend.put<Usuario>(`/usuarios/${id}`, payload);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  // Eliminar usuario
  async eliminar(id: string | number): Promise<void> {
    try {
      await apiBackend.delete(`/usuarios/${id}`);
    } catch (e) {
      handleApiError(e);
    }
  },

  // Activar / Desactivar / Verificar
  async activar(id: string | number): Promise<Usuario> {
    try {
      const { data } = await apiBackend.patch<Usuario>(`/usuarios/${id}/activar`);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async desactivar(id: string | number): Promise<Usuario> {
    try {
      const { data } = await apiBackend.patch<Usuario>(`/usuarios/${id}/desactivar`);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async verificar(id: string | number): Promise<Usuario> {
    try {
      const { data } = await apiBackend.patch<Usuario>(`/usuarios/${id}/verificar`);
      return data;
    } catch (e) {
      handleApiError(e);
    }
  },
};

export const createAdministrador = usuariosService.createAdministrador;
