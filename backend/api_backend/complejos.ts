// Aqui se deviera ajustar con la api cuando fucnione bien
const API_BASE_URL = 'http://localhost:8000';

export interface Complejo {
  id_complejo: number;
  id_dueno: number;
  nombre: string;
  direccion?: string;
  comuna?: string;
  id_comuna?: number;
  latitud?: number;
  longitud?: number;
  descripcion?: string;
  activo: boolean;
  rating_promedio?: number;
  total_resenas: number;
  distancia_km?: number;
}

export interface ComplejosList {
  items: Complejo[];
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

// Obtiene y normaliza la lista de complejos
export async function fetchComplejos(params: Record<string, any> = {}): Promise<ComplejosList> {
  const url = buildUrlWithParams(`${API_BASE_URL}/complejos`, params);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching complejos: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

// Obtiene el detalle de un complejo
export async function fetchComplejoDetalle(id_complejo: number, params: Record<string, any> = {}): Promise<Complejo> {
  const url = buildUrlWithParams(`${API_BASE_URL}/complejos/${id_complejo}`, params);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching complejo ${id_complejo}: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}
