import api from "../config/backend";
import {
  Notificacion,
  NotificacionCreateRequest,
  NotificacionUpdateRequest,
  NotificacionListQuery,
  UnreadCount,
} from "../types/notificaciones";

export const notificacionesService = {
  list(params?: NotificacionListQuery) {
    return api.get<Notificacion[]>("/notificaciones", { params }).then(r => r.data);
  },
  get(id: string | number) {
    return api.get<Notificacion>(`/notificaciones/${id}`).then(r => r.data);
  },
  create(payload: NotificacionCreateRequest) {
    return api.post<Notificacion>("/notificaciones", payload).then(r => r.data);
  },
  update(id: string | number, payload: NotificacionUpdateRequest) {
    return api.put<Notificacion>(`/notificaciones/${id}`, payload).then(r => r.data);
  },
  remove(id: string | number) {
    return api.delete<void>(`/notificaciones/${id}`).then(r => r.data);
  },
  marcarLeida(id: string | number) {
    return api.patch<Notificacion>(`/notificaciones/${id}/leer`).then(r => r.data);
  },
  marcarTodasLeidas(id_usuario: string | number) {
    return api
      .patch<{ updated: number }>("/notificaciones/leer-todas", { id_usuario })
      .then(r => r.data);
  },
  noLeidasCount(id_usuario: string | number) {
    return api
      .get<UnreadCount>("/notificaciones/no-leidas", { params: { id_usuario } })
      .then(r => r.data);
  },
};
