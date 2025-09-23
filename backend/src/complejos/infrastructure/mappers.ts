import { Complejo } from "../../domain/complejo/Complejo";

/**
 * Tipo que representa la estructura de complejo en FastAPI.
 * Utiliza convención snake_case como es estándar en Python.
 */
export type FastComplejo = {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono?: string;
  email?: string;
  estado: Complejo["estado"];
  hora_apertura: string;
  hora_cierre: string;
  servicios: Complejo["servicios"];
  activo: boolean;
  duenio_id: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  imagen_url?: string;
  calificacion?: number;
  total_resenas?: number;
};

/**
 * Convierte complejo de formato FastAPI (snake_case) a formato del dominio (camelCase).
 *
 * @param r - Complejo en formato FastAPI
 * @returns Complejo en formato del dominio
 */
export const toComplejo = (r: FastComplejo): Complejo => ({
  id: r.id,
  nombre: r.nombre,
  descripcion: r.descripcion,
  direccion: r.direccion,
  comuna: r.comuna,
  region: r.region,
  telefono: r.telefono,
  email: r.email,
  estado: r.estado,
  horaApertura: r.hora_apertura,
  horaCierre: r.hora_cierre,
  servicios: r.servicios,
  activo: r.activo,
  duenioId: r.duenio_id,
  fechaCreacion: new Date(r.fecha_creacion),
  fechaActualizacion: new Date(r.fecha_actualizacion),
  imagenUrl: r.imagen_url,
  calificacion: r.calificacion,
  totalResenas: r.total_resenas,
});
