// src/notificacion/service/notificacionService.ts
import axios from "axios";
import {
  Notificacion,
  NotificacionCreateRequest,
  NotificacionUpdateRequest,
  NotificacionListQuery,
  UnreadCount,
} from "../types/notificacionesTypes";

const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

export class NotificacionService {
  async crear(payload: NotificacionCreateRequest): Promise<Notificacion> {
    const { data } = await axios.post(`${API_BASE}/notificaciones`, payload);
    return data;
  }

  async listar(query?: NotificacionListQuery): Promise<Notificacion[]> {
    const { data } = await axios.get(`${API_BASE}/notificaciones`, { params: query });
    return data;
  }

  async obtener(id: number | string): Promise<Notificacion> {
    const { data } = await axios.get(`${API_BASE}/notificaciones/${id}`);
    return data;
  }

  async actualizar(id: number | string, payload: NotificacionUpdateRequest): Promise<Notificacion> {
    const { data } = await axios.put(`${API_BASE}/notificaciones/${id}`, payload);
    return data;
  }

  async eliminar(id: number | string): Promise<void> {
    await axios.delete(`${API_BASE}/notificaciones/${id}`);
  }

  async marcarLeida(id: number | string): Promise<Notificacion> {
    const { data } = await axios.patch(`${API_BASE}/notificaciones/${id}/leer`);
    return data;
  }

  async marcarTodasLeidas(id_usuario: number | string): Promise<{ updated: number }> {
    const { data } = await axios.patch(`${API_BASE}/notificaciones/leer-todas`, { id_usuario });
    return data;
  }

  async contarNoLeidas(id_usuario: number | string): Promise<UnreadCount> {
    const { data } = await axios.get(`${API_BASE}/notificaciones/no-leidas`, { params: { id_usuario } });
    return data;
  }
}
