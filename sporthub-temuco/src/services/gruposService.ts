// src/services/gruposService.ts
import api from "@/config/backend";
import { handleApiError } from "../services/ApiError";
import { Grupo, GrupoCreate, GrupoUpdate, GrupoListQuery } from "@/types/grupos";

export const gruposService = {
  async listar(params?: GrupoListQuery): Promise<Grupo[]> {
    try {
      const { data } = await api.get<Grupo[]>("/grupos", { params });
      return data;
    } catch (e) { handleApiError(e); }
  },
  async obtener(id: string | number): Promise<Grupo> {
    try {
      const { data } = await api.get<Grupo>(`/grupos/${id}`);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async crear(payload: GrupoCreate): Promise<Grupo> {
    try {
      const { data } = await api.post<Grupo>("/grupos", payload);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async actualizar(id: string | number, payload: GrupoUpdate): Promise<Grupo> {
    try {
      const { data } = await api.put<Grupo>(`/grupos/${id}`, payload);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async eliminar(id: string | number): Promise<void> {
    try {
      await api.delete(`/grupos/${id}`);
    } catch (e) { handleApiError(e); }
  },

  // Acciones específicas
  async agregarMiembro(id_grupo: string | number, id_usuario: string | number, rol: "ADMIN" | "MIEMBRO" = "MIEMBRO"): Promise<Grupo> {
    try {
      const { data } = await api.post<Grupo>(`/grupos/${id_grupo}/miembros`, { id_usuario, rol });
      return data;
    } catch (e) { handleApiError(e); }
  },
  async quitarMiembro(id_grupo: string | number, id_usuario: string | number): Promise<Grupo> {
    try {
      const { data } = await api.delete<Grupo>(`/grupos/${id_grupo}/miembros`, { params: { id_usuario } });
      return data;
    } catch (e) { handleApiError(e); }
  },
};
