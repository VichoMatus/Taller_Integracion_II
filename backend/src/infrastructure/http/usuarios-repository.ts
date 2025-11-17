import axios, { AxiosResponse } from 'axios';
import { buildHttpClient } from '../../infra/http/client';

export interface Usuario {
  id_usuario: number;
  nombre?: string;
  apellido?: string;
  email: string;
  telefono?: string;
  avatar_url?: string;
  rol: 'usuario' | 'admin' | 'super_admin';
  verificado?: boolean;
  esta_activo?: boolean;
}

export interface UsuariosList {
  items: Usuario[];
  total: number;
  page: number;
  page_size: number;
}

export interface UsuarioQueryParams {
  q?: string;
  rol?: string;
  activo?: boolean;
  verificado?: boolean;
  page?: number;
  page_size?: number;
  order_by?: string;
  order?: string;
}

export interface UsuarioUpdateData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  avatar_url?: string;
  rol?: string;
  verificado?: boolean;
  esta_activo?: boolean;
}

export interface UsuarioRepository {
  findAll(params: UsuarioQueryParams): Promise<UsuariosList>;
  findById(id: number): Promise<Usuario | null>;
  update(id: number, data: UsuarioUpdateData): Promise<Usuario>;
  delete(id: number): Promise<{ detail: string }>;
}

export class HttpUsuarioRepository implements UsuarioRepository {
  private apiClient;

  constructor(baseURL: string = process.env.API_BASE_URL || 'http://api-h1d7oi-6fc869-168-232-167-73.traefik.me') {
    this.apiClient = buildHttpClient(baseURL, () => undefined);
  }

  async findAll(params: UsuarioQueryParams): Promise<UsuariosList> {
    try {
      const response: AxiosResponse<UsuariosList> = await this.apiClient.get('/usuarios', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching usuarios: ${error}`);
    }
  }

  async findById(id: number): Promise<Usuario | null> {
    try {
      const response: AxiosResponse<Usuario> = await this.apiClient.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Error fetching usuario ${id}: ${error}`);
    }
  }

  async update(id: number, data: UsuarioUpdateData): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await this.apiClient.patch(`/usuarios/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error updating usuario ${id}: ${error}`);
    }
  }

  async delete(id: number): Promise<{ detail: string }> {
    try {
      const response: AxiosResponse<{ detail: string }> = await this.apiClient.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error deleting usuario ${id}: ${error}`);
    }
  }
}