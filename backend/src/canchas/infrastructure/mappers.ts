import { Cancha } from "../../domain/cancha/Cancha";

/**
 * Tipo que representa la estructura de cancha en FastAPI.
 * Utiliza convención snake_case como es estándar en Python.
 */
export type FastCancha = {
  id: number;
  nombre: string;
  tipo: Cancha["tipo"];
  estado: Cancha["estado"];
  precio_por_hora: number;
  descripcion?: string;
  capacidad: number;
  techada: boolean;
  activa: boolean;
  establecimiento_id: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  imagen_url?: string;
};

/**
 * Convierte cancha de formato FastAPI (snake_case) a formato del dominio (camelCase).
 *
 * @param r - Cancha en formato FastAPI
 * @returns Cancha en formato del dominio
 */
export const toCancha = (r: FastCancha): Cancha => ({
  id: r.id,
  nombre: r.nombre,
  tipo: r.tipo,
  estado: r.estado,
  precioPorHora: r.precio_por_hora,
  descripcion: r.descripcion,
  capacidad: r.capacidad,
  techada: r.techada,
  activa: r.activa,
  establecimientoId: r.establecimiento_id,
  fechaCreacion: new Date(r.fecha_creacion),
  fechaActualizacion: new Date(r.fecha_actualizacion),
  imagenUrl: r.imagen_url,
});
