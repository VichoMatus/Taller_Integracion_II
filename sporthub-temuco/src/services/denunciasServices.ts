// src/services/denunciasService.ts
import api from "@/config/backend";
import { handleApiError } from "../services/ApiError";
import { Denuncia, DenunciaCreate, DenunciaUpdate, DenunciaListQuery } from "@/types/denuncias";

export const denunciasService = {
  async listar(params?: DenunciaListQuery): Promise<Denuncia[]> {
    try {
      const { data } = await api.get<Denuncia[]>("/denuncias", { params });
      return data;
    } catch (e) { handleApiError(e); }
  },
  async obtener(id: string | number): Promise<Denuncia> {
    try {
      const { data } = await api.get<Denuncia>(`/denuncias/${id}`);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async crear(payload: DenunciaCreate): Promise<Denuncia> {
    try {
      const { data } = await api.post<Denuncia>("/denuncias", payload);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async actualizar(id: string | number, payload: DenunciaUpdate): Promise<Denuncia> {
    try {
      const { data } = await api.put<Denuncia>(`/denuncias/${id}`, payload);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async eliminar(id: string | number): Promise<void> {
    try {
      await api.delete(`/denuncias/${id}`);
    } catch (e) { handleApiError(e); }
  },

  // Acciones específicas
  async cambiarEstado(id: string | number, estado: Denuncia["estado"]): Promise<Denuncia> {
    try {
      const { data } = await api.patch<Denuncia>(`/denuncias/${id}/estado`, { estado });
      return data;
    } catch (e) { handleApiError(e); }
  },
  async asignar(id: string | number, asignado_a: string | number | null): Promise<Denuncia> {
    try {
      const { data } = await api.patch<Denuncia>(`/denuncias/${id}/asignar`, { asignado_a });
      return data;
    } catch (e) { handleApiError(e); }
  },
};
