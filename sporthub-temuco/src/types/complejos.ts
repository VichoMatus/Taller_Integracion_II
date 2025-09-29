// Tipos y interfaces para el recurso Complejo en el frontend

export type EstadoComplejo = "activo" | "inactivo" | "mantenimiento" | "cerrado";

export type ServicioComplejo =
  | "estacionamiento"
  | "cafeteria"
  | "vestuarios"
  | "iluminacion"
  | "duchas"
  | "wifi";

export interface Complejo {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono?: string;
  email?: string;
  estado: EstadoComplejo;
  horaApertura: string;
  horaCierre: string;
  servicios: ServicioComplejo[];
  activo: boolean;
  duenioId: number;
  fechaCreacion: string; // ISO string
  fechaActualizacion: string; // ISO string
  imagenUrl?: string;
  calificacion?: number;
  totalResenas?: number;
}

export interface ComplejoFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  estado?: EstadoComplejo;
  comuna?: string;
  region?: string;
  servicios?: ServicioComplejo[];
  duenioId?: number;
  calificacionMin?: number;
}

export interface CreateComplejoInput {
  nombre: string;
  descripcion?: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono?: string;
  email?: string;
  horaApertura: string;
  horaCierre: string;
  servicios: ServicioComplejo[];
  duenioId: number;
  imagenUrl?: string;
}

export interface UpdateComplejoInput {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  comuna?: string;
  region?: string;
  telefono?: string;
  email?: string;
  estado?: EstadoComplejo;
  horaApertura?: string;
  horaCierre?: string;
  servicios?: ServicioComplejo[];
  activo?: boolean;
  imagenUrl?: string;
}

export interface HorarioComplejo {
  dia: string; // Ej: 'Lunes', 'Martes', etc.
  horaApertura: string; // '08:00'
  horaCierre: string;   // '22:00'
}

export interface ResumenComplejo {
  totalCanchas: number;
  totalReservas: number;
  reservasHoy: number;
  ingresosHoy: number;
  ingresosMes: number;
  calificacionPromedio: number;
  totalUsuarios: number;
  [key: string]: number; // Para KPIs adicionales
}
