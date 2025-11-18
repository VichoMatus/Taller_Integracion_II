// src/usuario/service/usuarioService.ts
import axios from "axios";
import { API_CONFIG } from "../../config/config";
import {
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioListQuery,
  UsuarioContactoPublico,
} from "../types/usuarioTypes";

export class UsuarioService {
  private apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers
  });

  async crear(payload: UsuarioCreateRequest): Promise<Usuario> {
    const { data } = await this.apiClient.post(`/api/v1/usuarios`, payload);
    return data;
  }

  async listar(query?: UsuarioListQuery): Promise<Usuario[]> {
    const { data } = await this.apiClient.get(`/api/v1/usuarios`, { params: query });
    return data;
  }

  async obtener(id: number | string): Promise<Usuario> {
    const { data } = await this.apiClient.get(`/api/v1/usuarios/${id}`);
    return data;
  }

  async actualizar(id: number | string, payload: UsuarioUpdateRequest): Promise<Usuario> {
    const { data } = await this.apiClient.put(`/api/v1/usuarios/${id}`, payload);
    return data;
  }

  async eliminar(id: number | string): Promise<void> {
    await this.apiClient.delete(`/api/v1/usuarios/${id}`);
  }

  async activar(id: number | string): Promise<Usuario> {
    const { data } = await this.apiClient.patch(`/api/v1/usuarios/${id}/activar`);
    return data;
  }

  async desactivar(id: number | string): Promise<Usuario> {
    const { data } = await this.apiClient.patch(`/api/v1/usuarios/${id}/desactivar`);
    return data;
  }

  async verificar(id: number | string): Promise<Usuario> {
    const { data } = await this.apiClient.patch(`/api/v1/usuarios/${id}/verificar`);
    return data;
  }

  /**
   * Obtiene información pública de contacto de un usuario
   * Este endpoint es accesible sin permisos de super_admin
   */
  async obtenerContactoPublico(id: number | string): Promise<UsuarioContactoPublico> {
    const { data } = await this.apiClient.get(`/api/v1/usuarios/${id}/contacto_publico`);
    return data;
  }
}
