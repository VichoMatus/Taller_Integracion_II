/**
 * Estados disponibles para una cancha.
 */
export type EstadoCancha = "disponible" | "ocupada" | "mantenimiento" | "inactiva";

/**
 * Tipos de canchas disponibles en el sistema.
 */
export type TipoCancha = "futbol" | "basquet" | "tenis" | "padel" | "volley";

/**
 * Entidad principal de cancha del sistema.
 * Representa una cancha deportiva con sus características y estado.
 */
export interface Cancha {
  /** Identificador único de la cancha */
  id: number;
  /** Nombre descriptivo de la cancha */
  nombre: string;
  /** Tipo de deporte que se practica */
  tipo: TipoCancha;
  /** Estado actual de la cancha */
  estado: EstadoCancha;
  /** Precio por hora de alquiler */
  precioPorHora: number;
  /** Descripción adicional de la cancha (opcional) */
  descripcion?: string;
  /** Capacidad máxima de personas */
  capacidad: number;
  /** Indica si la cancha tiene techo */
  techada: boolean;
  /** Indica si la cancha está activa en el sistema */
  activa: boolean;
  /** ID del establecimiento al que pertenece */
  establecimientoId: number;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
  /** URL de imagen de la cancha (opcional) */
  imagenUrl?: string;
}
