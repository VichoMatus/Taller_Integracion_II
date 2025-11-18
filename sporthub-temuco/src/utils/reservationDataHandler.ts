/**
 * Utilidades para preparar y serializar datos de reserva de canchas
 */

export interface ReservationData {
  // Datos de la cancha
  canchaId: number;
  canchaNombre: string;
  canchaImagen?: string;
  canchaTipo: string;
  canchaTechada: boolean;
  
  // Datos del complejo
  complejoId: number;
  complejoNombre: string;
  complejoDireccion: string;
  complejoCoords?: {
    lat: number;
    lng: number;
  };
  
  // Datos de contacto
  telefono?: string;
  instagram?: string;
  
  // Datos de precio
  precioPorHora: number;
  
  // Horario
  horarioAtencion?: string;
  
  // Campos adicionales dinámicos
  [key: string]: any;
}

/**
 * Prepara los datos de una cancha de fútbol para el sistema de reservas
 * @param canchaData - Datos de la cancha desde la API
 * @param complejoData - Datos del complejo desde la API
 * @param contactData - Datos de contacto estáticos (opcional)
 * @returns Objeto con todos los datos necesarios para hacer una reserva
 */
export function prepareFutbolReservationData(
  canchaData: any,
  complejoData: any,
  contactData?: { phone?: string; instagram?: string }
): ReservationData {
  return {
    // Datos de la cancha
    canchaId: canchaData.id,
    canchaNombre: canchaData.name || canchaData.nombre,
    canchaImagen: canchaData.images?.[0] || `/sports/futbol/canchas/Cancha${canchaData.id}.png`,
    canchaTipo: canchaData.tipo || canchaData.sport || 'futbol',
    canchaTechada: canchaData.techada || false,
    
    // Datos del complejo
    complejoId: complejoData?.id || canchaData.establecimientoId || 0,
    complejoNombre: complejoData?.nombre || 'Complejo Deportivo',
    complejoDireccion: complejoData?.direccion || canchaData.location || 'Dirección no disponible',
    complejoCoords: canchaData.coordinates || (complejoData?.latitud && complejoData?.longitud ? {
      lat: parseFloat(complejoData.latitud),
      lng: parseFloat(complejoData.longitud)
    } : undefined),
    
    // Datos de contacto
    telefono: contactData?.phone || complejoData?.telefono,
    instagram: contactData?.instagram,
    
    // Datos de precio
    precioPorHora: canchaData.priceFrom || canchaData.precioPorHora || 25000,
    
    // Horario
    horarioAtencion: complejoData?.horarioAtencion || canchaData.schedule
  };
}

/**
 * Serializa los datos de reserva para pasarlos por URL o localStorage
 * @param data - Datos de reserva preparados
 * @returns String JSON codificado en base64
 */
export function serializeReservationData(data: ReservationData): string {
  try {
    const jsonStr = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonStr));
  } catch (error) {
    console.error('Error serializando datos de reserva:', error);
    return '';
  }
}

/**
 * Deserializa los datos de reserva desde un string codificado
 * @param serialized - String JSON codificado en base64
 * @returns Datos de reserva o null si hay error
 */
export function deserializeReservationData(serialized: string): ReservationData | null {
  try {
    const jsonStr = decodeURIComponent(atob(serialized));
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error deserializando datos de reserva:', error);
    return null;
  }
}

/**
 * Guarda los datos de reserva en localStorage
 * @param data - Datos de reserva preparados
 * @param key - Clave para guardar en localStorage (default: 'reservationData')
 */
export function saveReservationData(data: ReservationData, key: string = 'reservationData'): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error guardando datos de reserva:', error);
  }
}

/**
 * Recupera los datos de reserva desde localStorage
 * @param key - Clave en localStorage (default: 'reservationData')
 * @returns Datos de reserva o null si no existen
 */
export function loadReservationData(key: string = 'reservationData'): ReservationData | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error cargando datos de reserva:', error);
    return null;
  }
}

/**
 * Limpia los datos de reserva de localStorage
 * @param key - Clave en localStorage (default: 'reservationData')
 */
export function clearReservationData(key: string = 'reservationData'): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error limpiando datos de reserva:', error);
  }
}

/**
 * Convierte datos de reserva a URLSearchParams para pasar por query string
 * @param data - Datos de reserva preparados
 * @returns URLSearchParams con los datos serializados
 */
export function dataToSearchParams(data: ReservationData): URLSearchParams {
  const params = new URLSearchParams();
  
  // Agregar todos los campos al URLSearchParams
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && typeof value !== 'object') {
      params.append(key, String(value));
    }
  });
  
  return params;
}

/**
 * Recupera datos de reserva desde URLSearchParams
 * @param searchParams - URLSearchParams con los datos
 * @returns Objeto parcial con los datos de reserva
 */
export function searchParamsToData(searchParams: URLSearchParams): Partial<ReservationData> {
  const data: Partial<ReservationData> = {};
  
  searchParams.forEach((value, key) => {
    // Convertir strings a tipos apropiados
    if (key === 'canchaId' || key === 'complejoId' || key === 'precioPorHora') {
      data[key] = parseInt(value, 10);
    } else if (key === 'canchaTechada') {
      data[key] = value === 'true';
    } else {
      data[key] = value;
    }
  });
  
  return data;
}
