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

export interface CanchaComplejo {
  id_cancha: number;
  id_complejo: number;
  nombre: string;
  deporte: string;
  superficie?: string;
  capacidad?: number;
  iluminacion: boolean;
  techada: boolean;
  esta_activa: boolean;
}

export interface HorarioComplejo {
  id_horario: number;
  id_complejo: number;
  id_cancha?: number;
  dia_semana: string;
  hora_apertura: string;
  hora_cierre: string;
}

export interface BloqueoComplejo {
  id_bloqueo: number;
  id_complejo: number;
  id_cancha: number;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio?: string;
  hora_fin?: string;
  motivo?: string;
}

export interface ResumenComplejo {
  id_complejo: number;
  desde: string;
  hasta: string;
  reservas_confirmadas: number;
  horas_reservadas: number;
  ingresos_confirmados: number;
  ocupacion: number;
}

export interface ComplejoDetalle extends Complejo {
  canchas?: CanchaComplejo[];
  horarios?: HorarioComplejo[];
  bloqueos?: BloqueoComplejo[];
  resumen?: ResumenComplejo;
}

export interface ComplejosQueryParams {
  q?: string;
  comuna?: string;
  id_comuna?: number;
  deporte?: string;
  lat?: number;
  lon?: number;
  max_km?: number;
  sort_by?: 'distancia' | 'rating' | 'nombre' | 'recientes';
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

// Obtiene y normaliza la lista de complejos
export async function fetchComplejos(params: ComplejosQueryParams = {}): Promise<ComplejosList> {
  try {
    const response: AxiosResponse<ComplejosList> = await apiClient.get('/complejos', { params });
    
    // Normalización de datos para el frontend
    const normalizedData = {
      ...response.data,
      items: response.data.items.map((complejo: Complejo) => ({
        ...complejo,
        // Asegurar que rating_promedio esté en el rango correcto
        rating_promedio: complejo.rating_promedio ? Math.min(Math.max(complejo.rating_promedio, 0), 5) : null,
        // Normalizar coordenadas
        latitud: complejo.latitud || null,
        longitud: complejo.longitud || null,
        // Asegurar que total_resenas sea un número válido
        total_resenas: complejo.total_resenas || 0,
      }))
    };
    
    return normalizedData;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene el detalle completo de un complejo con canchas, horarios y bloqueos
export async function fetchComplejoDetalle(id_complejo: number): Promise<ComplejoDetalle> {
  try {
    // Obtener toda la información del complejo en paralelo
    const [complejoResponse, canchasResponse, horariosResponse, bloqueosResponse] = await Promise.allSettled([
      apiClient.get<Complejo>(`/complejos/${id_complejo}`),
      apiClient.get<CanchaComplejo[]>(`/complejos/${id_complejo}/canchas`),
      apiClient.get<HorarioComplejo[]>(`/complejos/${id_complejo}/horarios`),
      apiClient.get<BloqueoComplejo[]>(`/complejos/${id_complejo}/bloqueos`)
    ]);

    if (complejoResponse.status === 'rejected') {
      throw new Error(`Error fetching complejo ${id_complejo}: ${complejoResponse.reason}`);
    }

    const complejo = complejoResponse.value.data;
    
    // Agregar datos adicionales si están disponibles
    const canchas = canchasResponse.status === 'fulfilled' ? canchasResponse.value.data : [];
    const horarios = horariosResponse.status === 'fulfilled' ? horariosResponse.value.data : [];
    const bloqueos = bloqueosResponse.status === 'fulfilled' ? bloqueosResponse.value.data : [];
    
    // Crear objeto detallado
    const complejoDetalle: ComplejoDetalle = {
      ...complejo,
      canchas: canchas.filter((cancha: CanchaComplejo) => cancha.esta_activa),
      horarios: horarios.sort((a: HorarioComplejo, b: HorarioComplejo) => {
        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        return dias.indexOf(a.dia_semana.toLowerCase()) - dias.indexOf(b.dia_semana.toLowerCase());
      }),
      bloqueos: bloqueos.filter((bloqueo: BloqueoComplejo) => new Date(bloqueo.fecha_fin) >= new Date()),
      rating_promedio: complejo.rating_promedio ? Math.min(Math.max(complejo.rating_promedio, 0), 5) : null,
      total_resenas: complejo.total_resenas || 0,
    };

    return complejoDetalle;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene las canchas de un complejo específico
export async function fetchComplejoCanchas(id_complejo: number): Promise<CanchaComplejo[]> {
  try {
    const response: AxiosResponse<CanchaComplejo[]> = await apiClient.get(`/complejos/${id_complejo}/canchas`);
    
    // Filtrar solo canchas activas y ordenar por nombre
    return response.data
      .filter((cancha: CanchaComplejo) => cancha.esta_activa)
      .sort((a: CanchaComplejo, b: CanchaComplejo) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene los horarios de un complejo específico
export async function fetchComplejoHorarios(id_complejo: number): Promise<HorarioComplejo[]> {
  try {
    const response: AxiosResponse<HorarioComplejo[]> = await apiClient.get(`/complejos/${id_complejo}/horarios`);
    
    // Ordenar por día de la semana
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    return response.data.sort((a: HorarioComplejo, b: HorarioComplejo) => 
      dias.indexOf(a.dia_semana.toLowerCase()) - dias.indexOf(b.dia_semana.toLowerCase())
    );
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene los bloqueos activos de un complejo
export async function fetchComplejoBloqueos(id_complejo: number): Promise<BloqueoComplejo[]> {
  try {
    const response: AxiosResponse<BloqueoComplejo[]> = await apiClient.get(`/complejos/${id_complejo}/bloqueos`);
    
    // Filtrar solo bloqueos futuros y ordenar por fecha
    const today = new Date();
    return response.data
      .filter((bloqueo: BloqueoComplejo) => new Date(bloqueo.fecha_fin) >= today)
      .sort((a: BloqueoComplejo, b: BloqueoComplejo) => 
        new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
      );
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene el resumen de un complejo en un rango de fechas
export async function fetchComplejoResumen(
  id_complejo: number, 
  desde: string, 
  hasta: string
): Promise<ResumenComplejo> {
  try {
    const response: AxiosResponse<ResumenComplejo> = await apiClient.get(
      `/complejos/${id_complejo}/resumen`,
      { params: { desde, hasta } }
    );
    
    return {
      ...response.data,
      // Asegurar que la ocupación esté en el rango 0-1
      ocupacion: Math.min(Math.max(response.data.ocupacion, 0), 1),
      // Asegurar que los ingresos sean un número válido
      ingresos_confirmados: response.data.ingresos_confirmados || 0,
    };
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Busca complejos por deporte específico
export async function fetchComplejosByDeporte(
  deporte: string, 
  params: Omit<ComplejosQueryParams, 'deporte'> = {}
): Promise<ComplejosList> {
  return fetchComplejos({ ...params, deporte });
}

// Busca complejos cercanos a una ubicación
export async function fetchComplejosCercanos(
  lat: number, 
  lon: number, 
  max_km: number = 10, 
  params: Omit<ComplejosQueryParams, 'lat' | 'lon' | 'max_km'> = {}
): Promise<ComplejosList> {
  return fetchComplejos({ 
    ...params, 
    lat, 
    lon, 
    max_km,
    sort_by: 'distancia',
    order: 'asc'
  });
}
