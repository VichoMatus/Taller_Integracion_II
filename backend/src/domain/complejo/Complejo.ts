/**
 * Estados disponibles para un complejo deportivo.
 */
export type EstadoComplejo = "activo" | "inactivo" | "mantenimiento" | "cerrado";

/**
 * Tipos de servicios que puede ofrecer un complejo.
 */
export type ServicioComplejo = "estacionamiento" | "cafeteria" | "vestuarios" | "iluminacion" | "duchas" | "wifi";

/**
 * Entidad principal de complejo deportivo del sistema.
 * Representa un establecimiento que contiene múltiples canchas y servicios.
 */
export interface Complejo {
  /** Identificador único del complejo */
  id: number;
  /** Nombre del complejo deportivo */
  nombre: string;
  /** Descripción del complejo */
  descripcion?: string;
  /** Dirección física del complejo */
  direccion: string;
  /** Comuna o ciudad donde se ubica */
  comuna: string;
  /** Región del complejo */
  region: string;
  /** Número de teléfono de contacto */
  telefono?: string;
  /** Email de contacto del complejo */
  email?: string;
  /** Estado actual del complejo */
  estado: EstadoComplejo;
  /** Hora de apertura (formato HH:mm) */
  horaApertura: string;
  /** Hora de cierre (formato HH:mm) */
  horaCierre: string;
  /** Servicios disponibles en el complejo */
  servicios: ServicioComplejo[];
  /** Indica si el complejo está activo en el sistema */
  activo: boolean;
  /** ID del usuario dueño del complejo */
  duenioId: number;
  /** Fecha de creación del complejo */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
  /** URL de imagen principal del complejo */
  imagenUrl?: string;
  /** Calificación promedio (1-5 estrellas) */
  calificacion?: number;
  /** Cantidad total de reseñas */
  totalResenas?: number;
}
