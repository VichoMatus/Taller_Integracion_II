/**
 * Tipos de bloqueos disponibles.
 */
export type TipoBloqueo = "mantenimiento" | "evento_especial" | "reserva_privada" | "clausura_temporal" | "limpieza";

/**
 * Estados disponibles para un bloqueo.
 */
export type EstadoBloqueo = "activo" | "inactivo" | "vencido" | "cancelado";

/**
 * Entidad principal de bloqueo del sistema.
 * Representa un período de tiempo en que una cancha no está disponible para reservas públicas.
 */
export interface Bloqueo {
  /** Identificador único del bloqueo */
  id: number;
  /** ID de la cancha bloqueada */
  canchaId: number;
  /** ID del complejo donde está la cancha */
  complejoId: number;
  /** ID del usuario que creó el bloqueo */
  creadoPorId: number;
  /** Tipo de bloqueo */
  tipo: TipoBloqueo;
  /** Estado actual del bloqueo */
  estado: EstadoBloqueo;
  /** Fecha y hora de inicio del bloqueo */
  fechaInicio: Date;
  /** Fecha y hora de fin del bloqueo */
  fechaFin: Date;
  /** Título o nombre del bloqueo */
  titulo: string;
  /** Descripción detallada del bloqueo */
  descripcion?: string;
  /** Indica si es un bloqueo recurrente */
  recurrente: boolean;
  /** Patrón de recurrencia (si aplica) */
  patronRecurrencia?: string;
  /** Fecha de creación del bloqueo */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
  /** Información de la cancha (desnormalizada para consultas) */
  cancha?: {
    id: number;
    nombre: string;
    tipo: string;
  };
  /** Información del complejo (desnormalizada para consultas) */
  complejo?: {
    id: number;
    nombre: string;
    direccion: string;
  };
  /** Información del creador (desnormalizada para consultas) */
  creadoPor?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
  };
}
