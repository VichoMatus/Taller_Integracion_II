// src/services/denunciasService.ts
import api from "@/config/backend";
import { handleApiError } from "../services/ApiError";
import { Denuncia, DenunciaCreate, DenunciaUpdate, DenunciaListQuery } from "@/types/denuncias";

export const denunciasService = {
  /**
   * Listar mis denuncias (usuario autenticado)
   */
  async listarMias(): Promise<Denuncia[]> {
    try {
      const { data } = await api.get<Denuncia[]>("/denuncias/mias");
      return data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },

  /**
   * Crear nueva denuncia
   */
  async crear(payload: DenunciaCreate): Promise<Denuncia> {
    try {
      const { data } = await api.post<Denuncia>("/denuncias", payload);
      return data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },

  /**
   * Listar todas las denuncias (solo admin)
   */
  async listarAdmin(params?: DenunciaListQuery): Promise<Denuncia[]> {
    try {
      const { data } = await api.get<Denuncia[]>("/denuncias/admin", { params });
      return data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },

  /**
   * Ver detalle de una denuncia (solo admin)
   */
  async obtenerAdmin(id: number): Promise<Denuncia> {
    try {
      const { data } = await api.get<Denuncia>(`/denuncias/admin/${id}`);
      return data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },

  /**
   * Actualizar estado de una denuncia (solo admin)
   */
  async actualizarAdmin(id: number, payload: DenunciaUpdate): Promise<Denuncia> {
    try {
      const { data } = await api.patch<Denuncia>(`/denuncias/admin/${id}`, payload);
      return data;
    } catch (e) {
      handleApiError(e);
      throw e;
    }
  },
};
