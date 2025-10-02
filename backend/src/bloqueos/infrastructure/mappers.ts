import { Bloqueo } from "../../domain/bloqueo/Bloqueo";

/**
 * Tipo que representa la estructura de bloqueo en FastAPI.
 * Utiliza convención snake_case como es estándar en Python.
 */
export type FastBloqueo = {
  id: number;
  cancha_id: number;
  complejo_id: number;
  creado_por_id: number;
  tipo: Bloqueo["tipo"];
  estado: Bloqueo["estado"];
  fecha_inicio: string;
  fecha_fin: string;
  titulo: string;
  descripcion?: string;
  recurrente: boolean;
  patron_recurrencia?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  cancha?: {
    id: number;
    nombre: string;
    tipo: string;
  };
  complejo?: {
    id: number;
    nombre: string;
    direccion: string;
  };
  creado_por?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
  };
};

/**
 * Convierte bloqueo de formato FastAPI (snake_case) a formato del dominio (camelCase).
 *
 * @param r - Bloqueo en formato FastAPI
 * @returns Bloqueo en formato del dominio
 */
export const toBloqueo = (r: FastBloqueo): Bloqueo => ({
  id: r.id,
  canchaId: r.cancha_id,
  complejoId: r.complejo_id,
  creadoPorId: r.creado_por_id,
  tipo: r.tipo,
  estado: r.estado,
  fechaInicio: new Date(r.fecha_inicio),
  fechaFin: new Date(r.fecha_fin),
  titulo: r.titulo,
  descripcion: r.descripcion,
  recurrente: r.recurrente,
  patronRecurrencia: r.patron_recurrencia,
  fechaCreacion: new Date(r.fecha_creacion),
  fechaActualizacion: new Date(r.fecha_actualizacion),
  cancha: r.cancha,
  complejo: r.complejo,
  creadoPor: r.creado_por,
});
