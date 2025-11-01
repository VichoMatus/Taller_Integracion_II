import { Resena } from "../../domain/resena/Resena";

/**
 * Tipo que representa la estructura de reseña en FastAPI de Taller4.
 * Basado en ResenaOut del schema de Python.
 * Utiliza convención snake_case como es estándar en Python.
 */
export type FastResena = {
  id_resena: number;
  id_usuario: number;
  id_cancha?: number | null;
  id_complejo?: number | null;
  calificacion: number; // En BD es 'puntuacion', pero la API lo expone como 'calificacion'
  comentario?: string | null;
  esta_activa: boolean;
  created_at: string;
  updated_at?: string | null;
  // Campos adicionales cuando se filtra por cancha/complejo
  promedio_rating?: number | null;
  total_resenas?: number | null;
};

/**
 * Convierte reseña de formato FastAPI (snake_case) a formato del dominio (camelCase).
 * La API de Taller4 devuelve 'calificacion' aunque en BD es 'puntuacion'.
 *
 * @param r - Reseña en formato FastAPI
 * @returns Reseña en formato del dominio
 */
export const toResena = (r: FastResena): Resena => ({
  id: r.id_resena,
  usuarioId: r.id_usuario,
  canchaId: r.id_cancha ?? undefined,
  complejoId: r.id_complejo ?? undefined,
  calificacion: r.calificacion,
  comentario: r.comentario ?? undefined,
  estado: r.esta_activa ? "activa" : "oculta",
  fechaCreacion: new Date(r.created_at),
  fechaActualizacion: r.updated_at ? new Date(r.updated_at) : undefined,
  // Campos agregados cuando se consulta por cancha/complejo
  promedioRating: r.promedio_rating ?? undefined,
  totalResenas: r.total_resenas ?? undefined,
});
