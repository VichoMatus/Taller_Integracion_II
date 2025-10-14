import { Complejo, EstadoComplejo, ServicioComplejo } from "../../domain/complejo/Complejo";
import { Cancha, TipoCancha, EstadoCancha } from "../../domain/cancha/Cancha";
import { ReservaOwner, EstadisticasOwner } from "../../domain/admin/Owner";

// === DTOs PANEL OWNER ===

/**
 * DTO de entrada para crear complejo.
 */
export interface CreateComplejoIn {
  nombre: string;
  direccion: string;
  telefono?: string;
  descripcion?: string;
  activo?: boolean;
}

/**
 * DTO de entrada para actualizar complejo.
 */
export interface UpdateComplejoIn {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  descripcion?: string;
  activo?: boolean;
}

/**
 * DTO de entrada para crear cancha.
 */
export interface CreateCanchaIn {
  nombre: string;
  deporte: string;
  superficie: string;
  precio_base: number;
  complejo_id: number;
  activo?: boolean;
}

/**
 * DTO de entrada para actualizar cancha.
 */
export interface UpdateCanchaIn {
  nombre?: string;
  deporte?: string;
  superficie?: string;
  precio_base?: number;
  activo?: boolean;
}

/**
 * DTO para filtros de reservas.
 */
export interface FiltrosReservasIn {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
}

// === DTOs DE SALIDA ===

/**
 * DTO de salida para operaciones con mensaje.
 */
export interface ResponseOut<T> {
  data: T;
  message?: string;
}

/**
 * DTO de salida para listado de recursos del owner.
 */
export interface MisRecursosOut {
  complejos: Complejo[];
  canchas: Cancha[];
  total_reservas: number;
  ingresos_mes: number;
}

// === MAPPERS ===

/**
 * Convierte DTO de entrada a entidad Complejo para creación.
 */
export const mapCreateComplejoToEntity = (input: CreateComplejoIn, ownerId: number): Omit<Complejo, 'id'> => ({
  nombre: input.nombre,
  descripcion: input.descripcion,
  direccion: input.direccion,
  comuna: '', // Se completará desde la API
  region: '', // Se completará desde la API
  telefono: input.telefono,
  email: undefined,
  estado: 'activo' as EstadoComplejo,
  horaApertura: '06:00',
  horaCierre: '23:00', 
  servicios: [] as ServicioComplejo[],
  activo: input.activo ?? true,
  duenioId: ownerId,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
  imagenUrl: undefined,
  calificacion: undefined,
  totalResenas: undefined
});

/**
 * Convierte DTO de entrada a entidad Cancha para creación.
 */
export const mapCreateCanchaToEntity = (input: CreateCanchaIn, ownerId: number): Omit<Cancha, 'id'> => ({
  nombre: input.nombre,
  tipo: input.deporte as TipoCancha, // Mapping simple del campo deporte
  estado: 'disponible' as EstadoCancha,
  precioPorHora: input.precio_base,
  descripcion: undefined,
  capacidad: 22, // Valor por defecto
  techada: false, // Valor por defecto
  activa: input.activo ?? true,
  establecimientoId: input.complejo_id,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
  imagenUrl: undefined
});
