// src/usuario/service/usuarioService.ts
import axios from "axios";
import {
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioListQuery,
} from "../types/usuarioTypes";

const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

export class UsuarioService {
  async crear(payload: UsuarioCreateRequest): Promise<Usuario> {
    const { data } = await axios.post(`${API_BASE}/usuarios`, payload);
    return data;
  }

  async listar(query?: UsuarioListQuery): Promise<Usuario[]> {
    const { data } = await axios.get(`${API_BASE}/usuarios`, { params: query });
    return data;
  }

  async obtener(id: number | string): Promise<Usuario> {
    const { data } = await axios.get(`${API_BASE}/usuarios/${id}`);
    return data;
  }

  async actualizar(id: number | string, payload: UsuarioUpdateRequest): Promise<Usuario> {
    const { data } = await axios.put(`${API_BASE}/usuarios/${id}`, payload);
    return data;
  }

  async eliminar(id: number | string): Promise<void> {
    await axios.delete(`${API_BASE}/usuarios/${id}`);
  }

  async activar(id: number | string): Promise<Usuario> {
    const { data } = await axios.patch(`${API_BASE}/usuarios/${id}/activar`);
    return data;
  }

  async desactivar(id: number | string): Promise<Usuario> {
    const { data } = await axios.patch(`${API_BASE}/usuarios/${id}/desactivar`);
    return data;
  }

  async verificar(id: number | string): Promise<Usuario> {
    const { data } = await axios.patch(`${API_BASE}/usuarios/${id}/verificar`);
    return data;
  }
}
