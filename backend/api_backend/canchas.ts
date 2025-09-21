import axios, { AxiosResponse, AxiosError } from 'axios';

// URL base de la API externa (ajusta según corresponda)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// Configuración de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

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

export interface CanchaFoto {
  id_foto: number;
  id_cancha: number;
  url_foto: string;
  orden: number;
}

export interface CanchaDetalle extends Cancha {
  fotos?: CanchaFoto[];
  complejo_nombre?: string;
  complejo_direccion?: string;
}

export interface CanchasQueryParams {
  q?: string;
  id_complejo?: number;
  deporte?: string;
  cubierta?: boolean;
  max_precio?: number;
  lat?: number;
  lon?: number;
  max_km?: number;
  sort_by?: 'distancia' | 'precio' | 'rating' | 'nombre' | 'recientes';
  order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// Manejo de errores centralizado
function handleApiError(error: AxiosError): never {
  if (error.response) {
    // Error de respuesta del servidor
    throw new Error(`API Error ${error.response.status}: ${error.response.data || error.message}`);
  } else if (error.request) {
    // Error de red/conexión
    throw new Error('Network Error: Unable to connect to API');
  } else {
    // Error de configuración
    throw new Error(`Request Error: ${error.message}`);
  }
}

// Obtiene y normaliza la lista de canchas
export async function fetchCanchas(params: CanchasQueryParams = {}): Promise<CanchasList> {
  try {
    const response: AxiosResponse<CanchasList> = await apiClient.get('/canchas', { params });
    
    // Normalización de datos para el frontend
    const normalizedData = {
      ...response.data,
      items: response.data.items.map((cancha: Cancha) => ({
        ...cancha,
        // Asegurar que precio_desde tenga un valor por defecto
        precio_desde: cancha.precio_desde || 0,
        // Asegurar que rating_promedio esté en el rango correcto
        rating_promedio: cancha.rating_promedio ? Math.min(Math.max(cancha.rating_promedio, 0), 5) : null,
        // Formatear nombre del deporte
        deporte: cancha.deporte?.toLowerCase(),
      }))
    };
    
    return normalizedData;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene el detalle de una cancha con información adicional
export async function fetchCanchaDetalle(id_cancha: number): Promise<CanchaDetalle> {
  try {
    // Obtener cancha base
    const [canchaResponse, fotosResponse] = await Promise.allSettled([
      apiClient.get<Cancha>(`/canchas/${id_cancha}`),
      apiClient.get<CanchaFoto[]>(`/canchas/${id_cancha}/fotos`)
    ]);

    if (canchaResponse.status === 'rejected') {
      throw new Error(`Error fetching cancha ${id_cancha}: ${canchaResponse.reason}`);
    }

    const cancha = canchaResponse.value.data;
    
    // Agregar fotos si están disponibles
    const fotos = fotosResponse.status === 'fulfilled' ? fotosResponse.value.data : [];
    
    // Crear objeto detallado
    const canchaDetalle: CanchaDetalle = {
      ...cancha,
      fotos: fotos.sort((a: CanchaFoto, b: CanchaFoto) => a.orden - b.orden),
      precio_desde: cancha.precio_desde || 0,
      rating_promedio: cancha.rating_promedio ? Math.min(Math.max(cancha.rating_promedio, 0), 5) : null,
      deporte: cancha.deporte?.toLowerCase(),
    };

    return canchaDetalle;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene las fotos de una cancha específica
export async function fetchCanchaFotos(id_cancha: number): Promise<CanchaFoto[]> {
  try {
    const response: AxiosResponse<CanchaFoto[]> = await apiClient.get(`/canchas/${id_cancha}/fotos`);
    
    // Ordenar fotos por orden ascendente
    return response.data.sort((a: CanchaFoto, b: CanchaFoto) => a.orden - b.orden);
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Busca canchas por deporte específico
export async function fetchCanchasByDeporte(deporte: string, params: Omit<CanchasQueryParams, 'deporte'> = {}): Promise<CanchasList> {
  return fetchCanchas({ ...params, deporte });
}

// Busca canchas cercanas a una ubicación
export async function fetchCanchasCercanas(
  lat: number, 
  lon: number, 
  max_km: number = 5, 
  params: Omit<CanchasQueryParams, 'lat' | 'lon' | 'max_km'> = {}
): Promise<CanchasList> {
  return fetchCanchas({ 
    ...params, 
    lat, 
    lon, 
    max_km,
    sort_by: 'distancia',
    order: 'asc'
  });
}
