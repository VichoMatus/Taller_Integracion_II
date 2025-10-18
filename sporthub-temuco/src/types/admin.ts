/**
 * Tipos para el módulo Admin/Owner
 */

// === ENTIDADES PRINCIPALES ===

export interface Complejo {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono?: string;
  email?: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento' | 'cerrado';
  horaApertura: string;
  horaCierre: string;
  servicios: string[];
  activo: boolean;
  duenioId: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  imagenUrl?: string;
  calificacion?: number;
  totalResenas?: number;
}

export interface Cancha {
  id: number;
  nombre: string;
  tipo: 'futbol' | 'basquet' | 'tenis' | 'padel' | 'volley';
  estado: 'disponible' | 'ocupada' | 'mantenimiento' | 'inactiva';
  precioPorHora: number;
  descripcion?: string;
  capacidad: number;
  techada: boolean;
  activa: boolean;
  establecimientoId: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  imagenUrl?: string;
}

export interface ReservaOwner {
  id: number;
  usuario_id: number;
  cancha_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  precio_total: number;
  usuario_nombre?: string;
  usuario_email?: string;
  cancha_nombre?: string;
  complejo_nombre?: string;
}

export interface EstadisticasOwner {
  ingresos_totales: number;
  ocupacion_promedio: number;
  reservas_mes: number;
  canchas_activas: number;
}

// === DTOs DE ENTRADA ===

export interface CreateComplejoInput {
  nombre: string;
  direccion: string;
  telefono?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateComplejoInput {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CreateCanchaInput {
  nombre: string;
  deporte: string;
  superficie: string;
  precio_base: number;
  complejo_id: number;
  activo?: boolean;
}

export interface UpdateCanchaInput {
  nombre?: string;
  deporte?: string;
  superficie?: string;
  precio_base?: number;
  activo?: boolean;
}

export interface FiltrosReservasInput {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
}

// === DTOs DE SALIDA ===

export interface MisRecursosResponse {
  complejos: Complejo[];
  canchas: Cancha[];
  total_reservas: number;
  ingresos_mes: number;
}

export interface AdminStatusResponse {
  ok: boolean;
  module: string;
  message: string;
  fastapi_url: string;
  endpoint_tested: string;
  status: number;
  endpoints_found: string[];
  success: boolean;
  available_endpoints: string[];
  timestamp: string;
}