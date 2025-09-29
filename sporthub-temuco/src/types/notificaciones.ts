export type NotificacionEstado = "PENDIENTE" | "LEIDA";

export interface Notificacion {
  id_notificacion: number | string;
  id_usuario: number | string;
  titulo: string;
  mensaje: string;
  tipo?: string | null;       // "RESERVA", "SISTEMA", "PAGO"
  data?: Record<string, any>; // payload extra
  estado: NotificacionEstado;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface NotificacionCreateRequest {
  id_usuario: number | string;
  titulo: string;
  mensaje: string;
  tipo?: string | null;
  data?: Record<string, any>;
}

export interface NotificacionUpdateRequest {
  titulo?: string;
  mensaje?: string;
  tipo?: string | null;
  data?: Record<string, any>;
  estado?: NotificacionEstado;
}

export interface NotificacionListQuery {
  id_usuario?: number | string;
  estado?: NotificacionEstado;
  tipo?: string;
  page?: number;
  size?: number;
}

export interface UnreadCount {
  id_usuario: number | string;
  no_leidas: number;
}
