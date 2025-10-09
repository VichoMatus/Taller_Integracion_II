// src/grupos/service/gruposServices.ts
import axios from "axios";
import {
  Grupo,
  GrupoCreate,
  GrupoUpdate,
  GrupoListQuery,
  GrupoMiembro,
  AddMiembroRequest,
  UpdateMiembroRequest,
  TransferOwnerRequest,
} from "../types/gruposTypes";

const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

export class GruposService {
  // ===== Grupos =====
  async listar(params?: GrupoListQuery): Promise<Grupo[]> {
    const { data } = await axios.get(`${API_BASE}/grupos`, { params });
    return data;
  }

  async obtener(id: string | number): Promise<Grupo> {
    const { data } = await axios.get(`${API_BASE}/grupos/${id}`);
    return data;
  }

  async crear(payload: GrupoCreate): Promise<Grupo> {
    const { data } = await axios.post(`${API_BASE}/grupos`, payload);
    return data;
  }

  async actualizar(id: string | number, payload: GrupoUpdate): Promise<Grupo> {
    const { data } = await axios.put(`${API_BASE}/grupos/${id}`, payload);
    return data;
  }

  async eliminar(id: string | number): Promise<void> {
    await axios.delete(`${API_BASE}/grupos/${id}`);
  }

  // ===== Miembros =====
  async listarMiembros(id_grupo: string | number): Promise<GrupoMiembro[]> {
    const { data } = await axios.get(`${API_BASE}/grupos/${id_grupo}/miembros`);
    return data;
  }

  async agregarMiembro(id_grupo: string | number, payload: AddMiembroRequest): Promise<GrupoMiembro> {
    const { data } = await axios.post(`${API_BASE}/grupos/${id_grupo}/miembros`, payload);
    return data;
  }

  async actualizarMiembro(id_grupo: string | number, id_miembro: string | number, payload: UpdateMiembroRequest): Promise<GrupoMiembro> {
    const { data } = await axios.put(`${API_BASE}/grupos/${id_grupo}/miembros/${id_miembro}`, payload);
    return data;
  }

  async eliminarMiembro(id_grupo: string | number, id_miembro: string | number): Promise<void> {
    await axios.delete(`${API_BASE}/grupos/${id_grupo}/miembros/${id_miembro}`);
  }

  // ===== Ownership =====
  async transferirOwner(id_grupo: string | number, payload: TransferOwnerRequest): Promise<Grupo> {
    const { data } = await axios.patch(`${API_BASE}/grupos/${id_grupo}/transferir-owner`, payload);
    return data;
  }
}
