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
