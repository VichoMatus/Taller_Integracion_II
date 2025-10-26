// Tipos y interfaces para el recurso Cancha en el frontend

export type EstadoCancha = "disponible" | "ocupada" | "mantenimiento" | "inactiva";

export type TipoCancha = "futbol" | "basquet" | "tenis" | "padel" | "volley";

// Tipo basado en lo que realmente devuelve FastAPI (CanchaOut)
export interface Cancha {
  id: number;
  nombre: string;
  tipo: TipoCancha;
  techada: boolean;
  activa: boolean;
  establecimientoId: number;
  // Campos opcionales de solo lectura que FastAPI puede devolver:
  precioPorHora?: number; // precio_desde en el backend
  rating?: number; // rating_promedio
  totalResenas?: number; // total_resenas
  distanciaKm?: number; // distancia_km
  descripcion?: string;
  capacidad?: number;
  imagenUrl?: string;
  fechaCreacion?: string; // ISO string
  fechaActualizacion?: string; // ISO string
  // Campo calculado para UI
  estado?: EstadoCancha;
}

export interface CanchaFilters {
  // Filtros básicos
  page?: number;
  pageSize?: number;
  page_size?: number; // Alias para backend
  q?: string;
  id_complejo?: number; // Nuevo nombre (establecimientoId)
  establecimientoId?: number; // Legacy support
  
  // Filtros deportivos
  tipo?: TipoCancha; // Legacy
  deporte?: string; // Nuevo formato Taller4
  cubierta?: boolean; // Nuevo formato Taller4
  techada?: boolean; // Legacy support
  iluminacion?: boolean; // Nuevo
  
  // Filtros económicos
  max_precio?: number; // Nuevo formato Taller4
  precioMax?: number; // Legacy support
  capacidadMin?: number;
  
  // Filtros geográficos (NUEVO en Taller4)
  lat?: number;
  lon?: number;
  max_km?: number;
  
  // Ordenamiento (NUEVO en Taller4)
  sort_by?: 'distancia' | 'precio' | 'rating' | 'nombre' | 'recientes';
  order?: 'asc' | 'desc';
  
  // Estado
  estado?: EstadoCancha;
}

// Filtros específicos para panel admin (NUEVO)
export interface CanchaAdminFilters {
  id_complejo?: number;
  q?: string;
  incluir_inactivas?: boolean;
  sort_by?: 'nombre' | 'precio' | 'rating' | 'recientes';
  order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface CreateCanchaInput {
  nombre: string;
  tipo: TipoCancha;
  id_deporte?: number; // ID numérico del deporte (requerido por API)
  precioPorHora: number;
  descripcion?: string;
  capacidad: number;
  techada: boolean;
  establecimientoId: number;
  imagenUrl?: string;
}

// SOLO campos que FastAPI acepta en UPDATE (CanchaUpdateIn)
export interface UpdateCanchaInput {
  nombre?: string;
  tipo?: TipoCancha;
  id_deporte?: number; // ID numérico del deporte
  techada?: boolean;
  activa?: boolean;
  precioPorHora?: number;
  capacidad?: number;
  descripcion?: string;
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

// Respuesta del backend Taller4 (formato actualizado)
export interface CanchaBackendResponse {
  id_cancha: number;
  id_complejo: number;
  nombre: string;
  deporte: string;
  cubierta: boolean;
  activo: boolean;
  precio_desde: number;
  rating_promedio?: number;
  total_resenas?: number; // Actualizado: era total_reviews
  distancia_km?: number; // NUEVO: cálculo de distancia
  descripcion?: string;
  capacidad?: number;
  iluminacion?: boolean; // NUEVO
  foto_principal?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

// Respuesta paginada del backend (NUEVO)
export interface CanchaListResponse {
  items: Cancha[];
  total?: number;
  page?: number;
  page_size?: number;
}

// Input para búsqueda geográfica (NUEVO)
export interface CanchaGeoBusqueda {
  lat: number;
  lon: number;
  radio_km?: number;
  deporte?: string;
  cubierta?: boolean;
  max_precio?: number;
}
