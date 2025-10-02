// src/notificacion/type/notificacionTypes.ts

export type NotificacionEstado = "PENDIENTE" | "LEIDA";

export interface Notificacion {
  id_notificacion: number | string;
  id_usuario: number | string;
  titulo: string;
  mensaje: string;
  tipo?: string | null;      // p.ej.: "RESERVA", "SISTEMA", "PAGO"
  data?: Record<string, any> | null; // payload adicional (JSON)
  estado: NotificacionEstado;
  fecha_creacion: string;       // ISO
  fecha_actualizacion: string;  // ISO
}

export interface NotificacionCreateRequest {
  id_usuario: number | string;
  titulo: string;
  mensaje: string;
  tipo?: string | null;
  data?: Record<string, any> | null;
}

export interface NotificacionUpdateRequest {
  titulo?: string;
  mensaje?: string;
  tipo?: string | null;
  data?: Record<string, any> | null;
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
