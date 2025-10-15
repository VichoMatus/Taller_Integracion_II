// Tipos y interfaces para el recurso Cancha en el frontend

export type EstadoCancha = "disponible" | "ocupada" | "mantenimiento" | "inactiva";

export type TipoCancha = "futbol" | "basquet" | "tenis" | "padel" | "volley";

export interface Cancha {
  id: number;
  nombre: string;
  tipo: TipoCancha;
  estado: EstadoCancha;
  precioPorHora: number;
  descripcion?: string;
  capacidad: number;
  techada: boolean;
  activa: boolean;
  establecimientoId: number;
  fechaCreacion: string; // ISO string
  fechaActualizacion: string; // ISO string
  imagenUrl?: string;
}

export interface CanchaFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  tipo?: TipoCancha;
  estado?: EstadoCancha;
  establecimientoId?: number;
  techada?: boolean;
  precioMax?: number;
  capacidadMin?: number;
}

export interface CreateCanchaInput {
  nombre: string;
  tipo: TipoCancha;
  precioPorHora: number;
  descripcion?: string;
  capacidad: number;
  techada: boolean;
  establecimientoId: number;
  imagenUrl?: string;
}

export interface UpdateCanchaInput {
  nombre?: string;
  tipo?: TipoCancha;
  estado?: EstadoCancha;
  precioPorHora?: number;
  descripcion?: string;
  capacidad?: number;
  techada?: boolean;
  activa?: boolean;
  imagenUrl?: string;
}

// Tipos para gestión de fotos de canchas
export interface FotoCancha {
  id: number;
  url: string;
  nombre?: string;
  descripcion?: string;
  fechaSubida: string;
  canchaId: number;
}

export interface AddFotoInput {
  url?: string;
  file?: File;
  nombre?: string;
  descripcion?: string;
}

// Respuesta del backend (basado en los datos reales)
export interface CanchaBackendResponse {
  id_cancha: number;
  id_complejo: number;
  nombre: string;
  deporte: string;
  cubierta: boolean;
  activo: boolean;
  precio_desde: number;
  rating_promedio: number;
  total_reviews: number;
  disponible_hoy: boolean;
  foto_principal?: string;
}
