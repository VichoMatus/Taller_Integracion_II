// src/services/promocionesService.ts
import api from "@/config/backend";
import { handleApiError } from "../services/ApiError";
import { Promocion, PromocionCreate, PromocionUpdate, PromocionListQuery } from "@/types/promociones";

export const promocionesService = {
  async listar(params?: PromocionListQuery): Promise<Promocion[]> {
    try {
      const { data } = await api.get<Promocion[]>("/promociones", { params });
      return data;
    } catch (e) { handleApiError(e); }
  },
  async obtener(id: string | number): Promise<Promocion> {
    try {
      const { data } = await api.get<Promocion>(`/promociones/${id}`);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async crear(payload: PromocionCreate): Promise<Promocion> {
    try {
      const { data } = await api.post<Promocion>("/promociones", payload);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async actualizar(id: string | number, payload: PromocionUpdate): Promise<Promocion> {
    try {
      const { data } = await api.put<Promocion>(`/promociones/${id}`, payload);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async eliminar(id: string | number): Promise<void> {
    try {
      await api.delete(`/promociones/${id}`);
    } catch (e) { handleApiError(e); }
  },

  // Acciones específicas
  async activar(id: string | number): Promise<Promocion> {
    try {
      const { data } = await api.patch<Promocion>(`/promociones/${id}/activar`);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async desactivar(id: string | number): Promise<Promocion> {
    try {
      const { data } = await api.patch<Promocion>(`/promociones/${id}/desactivar`);
      return data;
    } catch (e) { handleApiError(e); }
  },
};
