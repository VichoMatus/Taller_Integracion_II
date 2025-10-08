import api from "../config/backend";
import {
  Notificacion,
  NotificacionCreateRequest,
  NotificacionUpdateRequest,
  NotificacionListQuery,
  UnreadCount,
} from "../types/notificaciones";
import { handleApiError } from "../services/ApiError";

export const notificacionesService = {
  async list(params?: NotificacionListQuery): Promise<Notificacion[]> {
    try {
      const { data } = await api.get<Notificacion[]>("/notificaciones", { params });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async get(id: string | number): Promise<Notificacion> {
    try {
      const { data } = await api.get<Notificacion>(`/notificaciones/${id}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async create(payload: NotificacionCreateRequest): Promise<Notificacion> {
    try {
      const { data } = await api.post<Notificacion>("/notificaciones", payload);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async update(id: string | number, payload: NotificacionUpdateRequest): Promise<Notificacion> {
    try {
      const { data } = await api.put<Notificacion>(`/notificaciones/${id}`, payload);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async remove(id: string | number): Promise<void> {
    try {
      await api.delete<void>(`/notificaciones/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  },

  async marcarLeida(id: string | number): Promise<Notificacion> {
    try {
      const { data } = await api.patch<Notificacion>(`/notificaciones/${id}/leer`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async marcarTodasLeidas(id_usuario: string | number): Promise<{ updated: number }> {
    try {
      const { data } = await api.patch<{ updated: number }>("/notificaciones/leer-todas", { id_usuario });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async noLeidasCount(id_usuario: string | number): Promise<UnreadCount> {
    try {
      const { data } = await api.get<UnreadCount>("/notificaciones/no-leidas", { params: { id_usuario } });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },
};
