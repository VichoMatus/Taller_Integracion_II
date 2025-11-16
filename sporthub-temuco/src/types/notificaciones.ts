export type NotificacionEstado = "PENDIENTE" | "LEIDA";

export interface Notificacion {
  id_notificacion: number;
  id_destinatario: number;      // ✅ Cambio: era id_usuario
  titulo: string;
  cuerpo: string;               // ✅ Cambio: era mensaje
  leida: boolean;               // ✅ Cambio: era estado
  created_at: string;           // ✅ Cambio: era fecha_creacion
  tipo?: string | null;
  data?: Record<string, any>;
}

export interface NotificacionCreateRequest {
  id_destinatario: number;      // ✅ Cambio
  titulo: string;
  cuerpo: string;               // ✅ Cambio
  tipo?: string | null;
  data?: Record<string, any>;
}

export interface NotificacionUpdateRequest {
  titulo?: string;
  cuerpo?: string;              // ✅ Cambio
  tipo?: string | null;
  data?: Record<string, any>;
  leida?: boolean;              // ✅ Cambio
}

export interface NotificacionListQuery {
  id_destinatario?: number;     // ✅ Cambio
  solo_no_leidas?: boolean;     // ✅ Cambio: era estado
  tipo?: string;
  page?: number;
  size?: number;
}

export interface UnreadCount {
  id_usuario: number;
  no_leidas: number;
}