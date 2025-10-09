/**
 * Estados disponibles para una reserva.
 */
export enum EstadoReserva {
  PENDIENTE = "pendiente",
  CONFIRMADA = "confirmada", 
  CANCELADA = "cancelada",
  COMPLETADA = "completada",
  NO_SHOW = "no_show",
  TENTATIVA = "tentativa"
}

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

/**
 * Cotización de reserva con desglose de precios
 */
export interface CotizacionReserva {
  /** ID de la cancha cotizada */
  canchaId: number;
  /** Fecha de inicio */
  fechaInicio: string;
  /** Fecha de fin */
  fechaFin: string;
  /** Precio base por hora */
  precioBase: number;
  /** Duración en horas */
  duracionHoras: number;
  /** Subtotal (precio base * horas) */
  subtotal: number;
  /** Descuentos aplicados */
  descuentos: number;
  /** Cargos adicionales */
  cargosAdicionales: number;
  /** Precio total final */
  precioTotal: number;
  /** Token de hold temporal (opcional) */
  holdToken?: string;
  /** Tiempo de expiración del hold */
  holdExpiraEn?: Date;
  /** Disponibilidad confirmada */
  disponible: boolean;
  /** Desglose de cargos/descuentos */
  desglose?: {
    concepto: string;
    monto: number;
  }[];
}
