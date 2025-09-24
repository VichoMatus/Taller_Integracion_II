import { Resena } from "../../domain/resena/Resena";

/**
 * Tipo que representa la estructura de reseña en FastAPI.
 * Utiliza convención snake_case como es estándar en Python.
 */
export type FastResena = {
  id: number;
  usuario_id: number;
  complejo_id: number;
  calificacion: number;
  comentario: string;
  estado: Resena["estado"];
  fecha_creacion: string;
  fecha_actualizacion: string;
  respuesta_dueno?: string;
  fecha_respuesta?: string;
  verificada: boolean;
  likes: number;
  reportes: number;
  usuario?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
    avatar_url?: string;
  };
  complejo?: {
    id: number;
    nombre: string;
    direccion: string;
    calificacion_promedio?: number;
  };
};

/**
 * Convierte reseña de formato FastAPI (snake_case) a formato del dominio (camelCase).
 *
 * @param r - Reseña en formato FastAPI
 * @returns Reseña en formato del dominio
 */
export const toResena = (r: FastResena): Resena => ({
  id: r.id,
  usuarioId: r.usuario_id,
  complejoId: r.complejo_id,
  calificacion: r.calificacion,
  comentario: r.comentario,
  estado: r.estado,
  fechaCreacion: new Date(r.fecha_creacion),
  fechaActualizacion: new Date(r.fecha_actualizacion),
  respuestaDueno: r.respuesta_dueno,
  fechaRespuesta: r.fecha_respuesta ? new Date(r.fecha_respuesta) : undefined,
  verificada: r.verificada,
  likes: r.likes,
  reportes: r.reportes,
  usuario: r.usuario ? {
    ...r.usuario,
    avatarUrl: r.usuario.avatar_url,
  } : undefined,
  complejo: r.complejo ? {
    ...r.complejo,
    calificacionPromedio: r.complejo.calificacion_promedio,
  } : undefined,
});
