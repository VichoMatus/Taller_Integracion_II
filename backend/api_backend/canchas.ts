// URL base de la API externa (ajusta según corresponda)
const API_BASE_URL = 'http://localhost:8000';

export interface Cancha {
  id_cancha: number;
  id_complejo: number;
  nombre: string;
  deporte: string;
  cubierta: boolean;
  activo: boolean;
  precio_desde?: number;
  rating_promedio?: number;
  total_resenas: number;
  distancia_km?: number;
}

export interface CanchasList {
  items: Cancha[];
  total: number;
  page: number;
  page_size: number;
}

// Helper para construir URL con parámetros
function buildUrlWithParams(baseUrl: string, params: Record<string, any> = {}): string {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key].toString());
    }
  });
  return url.toString();
}

// Obtiene y normaliza la lista de canchas
export async function fetchCanchas(params: Record<string, any> = {}): Promise<CanchasList> {
  const url = buildUrlWithParams(`${API_BASE_URL}/canchas`, params);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching canchas: ${response.status}`);
  }
  
  const data = await response.json();
  // Aquí podrías transformar los datos si la API cambia el formato
  return data;
}

// Obtiene el detalle de una cancha
export async function fetchCanchaDetalle(id_cancha: number, params: Record<string, any> = {}): Promise<Cancha> {
  const url = buildUrlWithParams(`${API_BASE_URL}/canchas/${id_cancha}`, params);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching cancha ${id_cancha}: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}
