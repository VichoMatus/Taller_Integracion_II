export type EstadoReserva = "pendiente" | "confirmada" | "cancelada" | "completada" | "no_show";

export type MetodoPago = "efectivo" | "tarjeta" | "transferencia" | "online";

export interface Reserva {
  id: number;
  usuarioId: number;
  canchaId: number;
  complejoId: number;
  fechaInicio: string; // ISO string
  fechaFin: string;   // ISO string
  estado: EstadoReserva;
  precioTotal: number;
  metodoPago?: MetodoPago;
  pagado: boolean;
  notas?: string;
  fechaCreacion: string; // ISO string
  fechaActualizacion: string; // ISO string
  codigoConfirmacion?: string;
  usuario?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
    telefono?: string;
  };
  cancha?: {
    id: number;
    nombre: string;
    tipo: string;
    precioPorHora: number;
  };
  complejo?: {
    id: number;
    nombre: string;
    direccion: string;
    telefono?: string;
  };
}

export interface ReservaFilters {
  page?: number;
  pageSize?: number;
  usuarioId?: number;
  canchaId?: number;
  complejoId?: number;
  estado?: EstadoReserva;
  fechaDesde?: string; // ISO string
  fechaHasta?: string; // ISO string
  pagado?: boolean;
  codigoConfirmacion?: string;
}

// ==========================================
// FORMATOS LEGACY (Compatibilidad)
// ==========================================

export interface CreateReservaInput {
  usuarioId: number;
  canchaId: number;
  fechaInicio: string; // ISO string
  fechaFin: string;   // ISO string
  metodoPago?: MetodoPago;
  notas?: string;
}

export interface UpdateReservaInput {
  estado?: EstadoReserva;
  metodoPago?: MetodoPago;
  pagado?: boolean;
  notas?: string;
  fechaInicio?: string; // ISO string
  fechaFin?: string;   // ISO string
}

// Tipos para cotización de reservas (legacy)
export interface CotizacionInput {
  canchaId: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface CotizacionResponse {
  precioBase: number;
  descuentos: number;
  impuestos: number;
  total: number;
  disponible: boolean;
  mensaje?: string;
  holdId?: string; // Para mantener temporal la reserva
}

// ==========================================
// FORMATOS NUEVOS (Taller4 - Sincronizados)
// ==========================================

export interface CreateReservaInputNew {
  id_cancha: number;
  fecha: string;      // YYYY-MM-DD
  inicio: string;     // HH:MM
  fin: string;        // HH:MM
  notas?: string;
}

export interface UpdateReservaInputNew {
  fecha?: string;     // YYYY-MM-DD
  inicio?: string;    // HH:MM
  fin?: string;       // HH:MM
  notas?: string;
}

export interface CotizacionInputNew {
  id_cancha: number;
  fecha: string;      // YYYY-MM-DD
  inicio: string;     // HH:MM
  fin: string;        // HH:MM
  cupon?: string;     // Código promocional
}

export interface CotizacionResponseNew {
  moneda: string;     // "CLP"
  subtotal: number;
  descuento: number;
  total: number;
  detalle?: string;
}

// Tipos para acciones específicas de reserva
export interface ConfirmarReservaResponse {
  id: number;
  estado: EstadoReserva;
  codigoConfirmacion: string;
  mensaje: string;
}

export interface CheckInResponse {
  id: number;
  estado: EstadoReserva;
  horaCheckIn: string;
  mensaje: string;
}

export interface NoShowResponse {
  id: number;
  estado: EstadoReserva;
  horaNoShow: string;
  penalizacion?: number;
  mensaje: string;
}
