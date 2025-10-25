// utils/canchaUtils.ts
import { 
  Cancha, 
  TipoCancha, 
  EstadoCancha, 
  CanchaFilters, 
  CreateCanchaInput,
  CanchaBackendResponse 
} from '../types/cancha';

/**
 * UTILIDADES PARA CANCHAS
 * Funciones helper para manejo de datos, formato y validaciones
 * Sincronizado con Taller4 v1.0
 */

// =============================================
// CONVERSIONES Y MAPEO DE DATOS
// =============================================

/**
 * Convierte respuesta del backend (snake_case) al formato frontend (camelCase)
 */
export const adaptCanchaFromBackend = (backendCancha: CanchaBackendResponse): Cancha => {
  return {
    id: backendCancha.id_cancha,
    nombre: backendCancha.nombre,
    tipo: mapDeporteToTipo(backendCancha.deporte),
    techada: backendCancha.cubierta,
    activa: backendCancha.activo,
    establecimientoId: backendCancha.id_complejo,
    precioPorHora: backendCancha.precio_desde,
    rating: backendCancha.rating_promedio,
    totalResenas: backendCancha.total_resenas,
    distanciaKm: backendCancha.distancia_km,
    descripcion: backendCancha.descripcion,
    capacidad: backendCancha.capacidad,
    imagenUrl: backendCancha.foto_principal,
    fechaCreacion: backendCancha.fecha_creacion,
    fechaActualizacion: backendCancha.fecha_actualizacion,
    estado: backendCancha.activo ? 'disponible' : 'inactiva'
  };
};

/**
 * Convierte filtros del frontend al formato esperado por el backend
 */
export const adaptFiltersToBackend = (filters: CanchaFilters) => {
  const backendFilters: any = {};
  
  // Mapeo de campos
  if (filters.q) backendFilters.q = filters.q;
  if (filters.page) backendFilters.page = filters.page;
  if (filters.pageSize) backendFilters.page_size = filters.pageSize;
  if (filters.page_size) backendFilters.page_size = filters.page_size;
  
  // Establecimiento/Complejo
  if (filters.id_complejo) backendFilters.id_complejo = filters.id_complejo;
  if (filters.establecimientoId) backendFilters.id_complejo = filters.establecimientoId;
  
  // Deporte - mapear tipo a string
  if (filters.tipo) backendFilters.deporte = filters.tipo;
  if (filters.deporte) backendFilters.deporte = filters.deporte;
  
  // Cubierta/Techada - soporte para ambos
  if (filters.cubierta !== undefined) backendFilters.cubierta = filters.cubierta;
  if (filters.techada !== undefined) backendFilters.cubierta = filters.techada;
  
  // Otros filtros nuevos
  if (filters.iluminacion !== undefined) backendFilters.iluminacion = filters.iluminacion;
  if (filters.max_precio) backendFilters.max_precio = filters.max_precio;
  if (filters.precioMax) backendFilters.max_precio = filters.precioMax;
  
  // Geolocalización
  if (filters.lat) backendFilters.lat = filters.lat;
  if (filters.lon) backendFilters.lon = filters.lon;
  if (filters.max_km) backendFilters.max_km = filters.max_km;
  
  // Ordenamiento
  if (filters.sort_by) backendFilters.sort_by = filters.sort_by;
  if (filters.order) backendFilters.order = filters.order;
  
  return backendFilters;
};

// =============================================
// MAPEO DE DEPORTES Y TIPOS
// =============================================

/**
 * Mapea string de deporte del backend a TipoCancha del frontend
 */
export const mapDeporteToTipo = (deporte: string): TipoCancha => {
  const deporteMap: Record<string, TipoCancha> = {
    'futbol': 'futbol',
    'fútbol': 'futbol',
    'soccer': 'futbol',
    'basquetbol': 'basquet',
    'básquetbol': 'basquet',
    'basketball': 'basquet',
    'basquet': 'basquet',
    'tenis': 'tenis',
    'tennis': 'tenis',
    'padel': 'padel',
    'pádel': 'padel',
    'voleibol': 'volley',
    'voley': 'volley',
    'volley': 'volley',
    'volleyball': 'volley'
  };
  
  return deporteMap[deporte.toLowerCase()] || 'futbol';
};

/**
 * Mapea TipoCancha del frontend a string para el backend
 */
export const mapTipoToDeporte = (tipo: TipoCancha): string => {
  const tipoMap: Record<TipoCancha, string> = {
    'futbol': 'futbol',
    'basquet': 'basquetbol',
    'tenis': 'tenis',
    'padel': 'padel',
    'volley': 'voleibol'
  };
  
  return tipoMap[tipo] || 'futbol';
};

// =============================================
// FORMATEO Y PRESENTACIÓN
// =============================================

/**
 * Formatea el nombre del deporte para mostrar
 */
export const formatearDeporte = (tipo: TipoCancha | string): string => {
  const deporteNames: Record<string, string> = {
    'futbol': 'Fútbol',
    'basquet': 'Básquetbol',
    'tenis': 'Tenis',
    'padel': 'Pádel',
    'volley': 'Vóleibol'
  };
  
  return deporteNames[tipo] || tipo;
};

/**
 * Formatea el precio por hora
 */
export const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(precio);
};

/**
 * Formatea la distancia
 */
export const formatearDistancia = (distanciaKm: number): string => {
  if (distanciaKm < 1) {
    return `${Math.round(distanciaKm * 1000)}m`;
  }
  return `${distanciaKm.toFixed(1)}km`;
};

/**
 * Formatea el rating con estrellas
 */
export const formatearRating = (rating: number): string => {
  const estrellas = '⭐'.repeat(Math.floor(rating));
  return `${estrellas} ${rating.toFixed(1)}`;
};

/**
 * Formatea el estado de la cancha
 */
export const formatearEstado = (estado: EstadoCancha): { texto: string; color: string } => {
  const estadoMap: Record<EstadoCancha, { texto: string; color: string }> = {
    'disponible': { texto: 'Disponible', color: 'green' },
    'ocupada': { texto: 'Ocupada', color: 'red' },
    'mantenimiento': { texto: 'En Mantenimiento', color: 'orange' },
    'inactiva': { texto: 'Inactiva', color: 'gray' }
  };
  
  return estadoMap[estado] || { texto: estado, color: 'gray' };
};

// =============================================
// VALIDACIONES
// =============================================

/**
 * Valida los datos de entrada para crear cancha
 */
export const validarCreateCancha = (input: CreateCanchaInput): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!input.nombre || input.nombre.trim().length === 0) {
    errors.push('El nombre es requerido');
  }
  
  if (input.nombre && input.nombre.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }
  
  if (!input.tipo) {
    errors.push('El tipo de cancha es requerido');
  }
  
  if (!input.establecimientoId || input.establecimientoId <= 0) {
    errors.push('El establecimiento es requerido');
  }
  
  if (input.precioPorHora <= 0) {
    errors.push('El precio por hora debe ser mayor a 0');
  }
  
  if (input.capacidad && input.capacidad <= 0) {
    errors.push('La capacidad debe ser mayor a 0');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Valida filtros de búsqueda
 */
export const validarFiltrosBusqueda = (filters: CanchaFilters): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (filters.page && filters.page < 1) {
    errors.push('La página debe ser mayor a 0');
  }
  
  if (filters.pageSize && (filters.pageSize < 1 || filters.pageSize > 100)) {
    errors.push('El tamaño de página debe estar entre 1 y 100');
  }
  
  if (filters.max_precio && filters.max_precio < 0) {
    errors.push('El precio máximo no puede ser negativo');
  }
  
  if (filters.lat && (filters.lat < -90 || filters.lat > 90)) {
    errors.push('La latitud debe estar entre -90 y 90');
  }
  
  if (filters.lon && (filters.lon < -180 || filters.lon > 180)) {
    errors.push('La longitud debe estar entre -180 y 180');
  }
  
  if (filters.max_km && filters.max_km <= 0) {
    errors.push('El radio máximo debe ser mayor a 0');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// =============================================
// GEOLOCALIZACIÓN
// =============================================

/**
 * Calcula la distancia entre dos puntos geográficos (Haversine)
 */
export const calcularDistancia = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  
  return Math.round(distancia * 10) / 10; // Redondear a 1 decimal
};

/**
 * Obtiene la ubicación actual del usuario
 */
export const obtenerUbicacionUsuario = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Error de geolocalización: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
};

// =============================================
// UTILIDADES DE FILTRADO Y BÚSQUEDA
// =============================================

/**
 * Filtra canchas por texto de búsqueda
 */
export const filtrarCanchasPorTexto = (canchas: Cancha[], busqueda: string): Cancha[] => {
  if (!busqueda.trim()) return canchas;
  
  const textoBusqueda = busqueda.toLowerCase();
  
  return canchas.filter(cancha => 
    cancha.nombre.toLowerCase().includes(textoBusqueda) ||
    cancha.tipo.toLowerCase().includes(textoBusqueda) ||
    cancha.descripcion?.toLowerCase().includes(textoBusqueda)
  );
};

/**
 * Ordena canchas por criterio
 */
export const ordenarCanchas = (
  canchas: Cancha[], 
  criterio: 'nombre' | 'precio' | 'rating' | 'distancia',
  orden: 'asc' | 'desc' = 'asc'
): Cancha[] => {
  const factor = orden === 'desc' ? -1 : 1;
  
  return [...canchas].sort((a, b) => {
    let comparison = 0;
    
    switch (criterio) {
      case 'nombre':
        comparison = a.nombre.localeCompare(b.nombre);
        break;
      case 'precio':
        comparison = (a.precioPorHora || 0) - (b.precioPorHora || 0);
        break;
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      case 'distancia':
        comparison = (a.distanciaKm || 0) - (b.distanciaKm || 0);
        break;
    }
    
    return comparison * factor;
  });
};

/**
 * Agrupa canchas por deporte
 */
export const agruparCanchasPorDeporte = (canchas: Cancha[]): Record<TipoCancha, Cancha[]> => {
  const grupos: Record<TipoCancha, Cancha[]> = {
    futbol: [],
    basquet: [],
    tenis: [],
    padel: [],
    volley: []
  };
  
  canchas.forEach(cancha => {
    if (grupos[cancha.tipo]) {
      grupos[cancha.tipo].push(cancha);
    }
  });
  
  return grupos;
};

// =============================================
// HELPERS DE ESTADO Y DISPONIBILIDAD
// =============================================

/**
 * Verifica si una cancha está disponible
 */
export const esCanchaDisponible = (cancha: Cancha): boolean => {
  return cancha.activa && cancha.estado === 'disponible';
};

/**
 * Obtiene el color del badge según el estado
 */
export const getColorEstado = (estado: EstadoCancha): string => {
  const colores = {
    'disponible': '#22c55e',   // green-500
    'ocupada': '#ef4444',      // red-500
    'mantenimiento': '#f59e0b', // amber-500
    'inactiva': '#6b7280'      // gray-500
  };
  
  return colores[estado] || colores.inactiva;
};

/**
 * Genera descripción completa de la cancha
 */
export const generarDescripcionCancha = (cancha: Cancha): string => {
  const partes: string[] = [
    `Cancha de ${formatearDeporte(cancha.tipo)}`,
    cancha.techada ? 'techada' : 'al aire libre',
  ];
  
  if (cancha.capacidad) {
    partes.push(`capacidad ${cancha.capacidad} personas`);
  }
  
  if (cancha.precioPorHora) {
    partes.push(`desde ${formatearPrecio(cancha.precioPorHora)}/hora`);
  }
  
  if (cancha.rating && cancha.totalResenas) {
    partes.push(`${cancha.rating.toFixed(1)}⭐ (${cancha.totalResenas} reseñas)`);
  }
  
  if (cancha.distanciaKm) {
    partes.push(`a ${formatearDistancia(cancha.distanciaKm)}`);
  }
  
  return partes.join(' • ');
};
