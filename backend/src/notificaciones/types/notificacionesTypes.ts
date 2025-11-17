// src/notificacion/type/notificacionTypes.ts

export interface Notificacion {
  id_notificacion: number;
  id_destinatario: number;
  titulo: string;
  cuerpo: string;
  leida: boolean;
  created_at: string; // ISO datetime
}

export interface NotificacionCreateRequest {
  id_destinatario: number;
  titulo: string;
  cuerpo: string;
}

export interface NotificacionEmailRequest {
  id_destinatario: number;
  titulo: string;
  cuerpo: string;
}

export interface NotificacionListQuery {
  solo_no_leidas?: boolean;
}

export interface UnreadCount {
  id_usuario: number | string;
  no_leidas: number;
}
