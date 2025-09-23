/**
 * Estados disponibles para una reserva.
 */
export type EstadoReserva = "pendiente" | "confirmada" | "cancelada" | "completada" | "no_show";

/**
 * Métodos de pago disponibles.
 */
export type MetodoPago = "efectivo" | "tarjeta" | "transferencia" | "online";

/**
 * Entidad principal de reserva del sistema.
 * Representa una reserva de cancha con fechas, horarios y detalles de pago.
 */
export interface Reserva {
  /** Identificador único de la reserva */
  id: number;
  /** ID del usuario que realiza la reserva */
  usuarioId: number;
  /** ID de la cancha reservada */
  canchaId: number;
  /** ID del complejo donde está la cancha */
  complejoId: number;
  /** Fecha y hora de inicio de la reserva */
  fechaInicio: Date;
  /** Fecha y hora de fin de la reserva */
  fechaFin: Date;
  /** Estado actual de la reserva */
  estado: EstadoReserva;
  /** Precio total de la reserva */
  precioTotal: number;
  /** Método de pago utilizado */
  metodoPago?: MetodoPago;
  /** Indica si el pago ha sido confirmado */
  pagado: boolean;
  /** Notas adicionales de la reserva */
  notas?: string;
  /** Fecha de creación de la reserva */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
  /** Código de confirmación único */
  codigoConfirmacion?: string;
  /** Información del usuario (desnormalizada para consultas) */
  usuario?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
    telefono?: string;
  };
  /** Información de la cancha (desnormalizada para consultas) */
  cancha?: {
    id: number;
    nombre: string;
    tipo: string;
    precioPorHora: number;
  };
  /** Información del complejo (desnormalizada para consultas) */
  complejo?: {
    id: number;
    nombre: string;
    direccion: string;
    telefono?: string;
  };
}
