/**
 * Mapeo de deportes entre frontend y backend
 * 
 * IMPORTANTE: El backend FastAPI espera:
 * - Campo "deporte": string (nombre del deporte en minúsculas) ✅ USADO
 * - Campo "id_deporte": number (ID numérico del deporte) ❌ DESHABILITADO
 * 
 * 🔥 NOTA: Los IDs en este archivo NO se usan actualmente porque no coinciden
 * con los IDs reales de la base de datos. El backend FastAPI resolverá el ID
 * correcto basándose en el nombre del deporte.
 * 
 * Este mapeo resuelve el error 403 normalizando los nombres de deportes.
 */

export interface DeporteInfo {
  id: number;
  nombre: string;
  nombreDisplay: string;
  variantes: string[]; // Nombres alternativos aceptados
}

/**
 * Mapeo completo de deportes con los nombres EXACTOS de la base de datos
 * 
 * ⚠️ CRÍTICO: Los nombres en "nombre" deben coincidir EXACTAMENTE con la columna
 * "deporte" en la tabla "canchas" de la base de datos.
 * 
 * Verificado desde la BD:
 * - futbol ✅
 * - tenis ✅
 * - basquetbol ✅ (NO "basquet")
 * - paddle ✅ (NO "padel")
 * - futbolito ✅ (NO "futbol_sala")
 * - baby futbol ✅
 * - volley ✅
 */
export const DEPORTES_MAP: Record<string, DeporteInfo> = {
  'futbol': {
    id: 1,
    nombre: 'futbol', // Nombre EXACTO en BD
    nombreDisplay: 'Fútbol',
    variantes: ['futbol', 'fútbol', 'football', 'soccer']
  },
  'basquet': {
    id: 2,
    nombre: 'basquetbol', // ⚠️ En BD es "basquetbol", NO "basquet"
    nombreDisplay: 'Básquetbol',
    variantes: ['basquet', 'básquet', 'basketball', 'basquetbol', 'básquetbol']
  },
  // Alias para el nombre real de BD (basquetbol)
  'basquetbol': {
    id: 2,
    nombre: 'basquetbol',
    nombreDisplay: 'Básquetbol',
    variantes: ['basquet', 'básquet', 'basketball', 'basquetbol', 'básquetbol']
  },
  'tenis': {
    id: 3,
    nombre: 'tenis', // Nombre EXACTO en BD
    nombreDisplay: 'Tenis',
    variantes: ['tenis', 'tennis']
  },
  'padel': {
    id: 4,
    nombre: 'paddle', // ⚠️ En BD es "paddle", NO "padel"
    nombreDisplay: 'Pádel',
    variantes: ['padel', 'pádel', 'paddle']
  },
  // Alias para el nombre real de BD (paddle)
  'paddle': {
    id: 4,
    nombre: 'paddle',
    nombreDisplay: 'Pádel',
    variantes: ['padel', 'pádel', 'paddle']
  },
  'volley': {
    id: 5,
    nombre: 'voleibol', // ⚠️ En BD es "voleibol" (con i), NO "volley"
    nombreDisplay: 'Voleibol',
    variantes: ['volley', 'voley', 'voleibol', 'volleyball']
  },
  // Alias para el nombre real de BD (voleibol)
  'voleibol': {
    id: 5,
    nombre: 'voleibol',
    nombreDisplay: 'Voleibol',
    variantes: ['volley', 'voley', 'voleibol', 'volleyball']
  },
  'futbol_sala': {
    id: 6,
    nombre: 'futbolito', // ⚠️ En BD es "futbolito", NO "futbol_sala"
    nombreDisplay: 'Fútbol Sala',
    variantes: ['futbol_sala', 'futbol sala', 'futsal', 'fútbol sala', 'futbolito']
  },
  // Alias para el nombre real de BD (futbolito)
  'futbolito': {
    id: 6,
    nombre: 'futbolito',
    nombreDisplay: 'Fútbol Sala',
    variantes: ['futbol_sala', 'futbol sala', 'futsal', 'fútbol sala', 'futbolito']
  }
};

/**
 * Obtiene el ID numérico de un deporte a partir de su nombre
 * @param nombreDeporte Nombre del deporte (puede ser cualquier variante)
 * @returns ID del deporte o undefined si no se encuentra
 */
export const getDeporteId = (nombreDeporte: string): number | undefined => {
  const nombreNormalizado = nombreDeporte.toLowerCase().trim();
  
  // Buscar en el mapa principal
  if (DEPORTES_MAP[nombreNormalizado]) {
    return DEPORTES_MAP[nombreNormalizado].id;
  }
  
  // Buscar en las variantes
  for (const deporte of Object.values(DEPORTES_MAP)) {
    if (deporte.variantes.some(v => v === nombreNormalizado)) {
      return deporte.id;
    }
  }
  
  return undefined;
};

/**
 * Obtiene el nombre normalizado de un deporte
 * @param nombreDeporte Nombre del deporte (puede ser cualquier variante)
 * @returns Nombre normalizado (ej: 'futbol', 'basquet') o el nombre original si no se encuentra
 */
export const getNombreDeporteNormalizado = (nombreDeporte: string): string => {
  const nombreNormalizado = nombreDeporte.toLowerCase().trim();
  
  // Buscar en el mapa principal
  if (DEPORTES_MAP[nombreNormalizado]) {
    return DEPORTES_MAP[nombreNormalizado].nombre;
  }
  
  // Buscar en las variantes
  for (const deporte of Object.values(DEPORTES_MAP)) {
    if (deporte.variantes.some(v => v === nombreNormalizado)) {
      return deporte.nombre;
    }
  }
  
  // Si no se encuentra, devolver el nombre normalizado
  return nombreNormalizado;
};

/**
 * Obtiene el nombre display (para mostrar en UI) de un deporte
 * @param nombreDeporte Nombre del deporte
 * @returns Nombre formateado para mostrar
 */
export const getDeporteDisplay = (nombreDeporte: string): string => {
  const nombreNormalizado = nombreDeporte.toLowerCase().trim();
  
  // Buscar en el mapa principal
  if (DEPORTES_MAP[nombreNormalizado]) {
    return DEPORTES_MAP[nombreNormalizado].nombreDisplay;
  }
  
  // Buscar en las variantes
  for (const deporte of Object.values(DEPORTES_MAP)) {
    if (deporte.variantes.some(v => v === nombreNormalizado)) {
      return deporte.nombreDisplay;
    }
  }
  
  // Si no se encuentra, capitalizar primera letra
  return nombreDeporte.charAt(0).toUpperCase() + nombreDeporte.slice(1);
};

/**
 * Obtiene toda la información de un deporte
 * @param nombreDeporte Nombre del deporte
 * @returns Información completa del deporte o undefined
 */
export const getDeporteInfo = (nombreDeporte: string): DeporteInfo | undefined => {
  const nombreNormalizado = nombreDeporte.toLowerCase().trim();
  
  // Buscar en el mapa principal
  if (DEPORTES_MAP[nombreNormalizado]) {
    return DEPORTES_MAP[nombreNormalizado];
  }
  
  // Buscar en las variantes
  for (const deporte of Object.values(DEPORTES_MAP)) {
    if (deporte.variantes.some(v => v === nombreNormalizado)) {
      return deporte;
    }
  }
  
  return undefined;
};

/**
 * Lista de todos los deportes disponibles (para selectores)
 */
export const DEPORTES_DISPONIBLES = Object.values(DEPORTES_MAP);

/**
 * Valida si un deporte es válido
 * @param nombreDeporte Nombre del deporte a validar
 * @returns true si el deporte existe en el mapeo
 */
export const esDeporteValido = (nombreDeporte: string): boolean => {
  return getDeporteId(nombreDeporte) !== undefined;
};
