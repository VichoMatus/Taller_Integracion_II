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

export interface Horario {
  id_horario: number;
  id_complejo: number;
  id_cancha?: number;
  dia_semana: string;
  hora_apertura: string;
  hora_cierre: string;
}

export interface DisponibilidadSlot {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
  precio?: number;
  id_cancha: number;
  id_complejo: number;
}

export interface DisponibilidadDia {
  fecha: string;
  dia_semana: string;
  slots: DisponibilidadSlot[];
}

export interface DisponibilidadCancha {
  id_cancha: number;
  nombre_cancha: string;
  deporte: string;
  dias: DisponibilidadDia[];
}

export interface DisponibilidadComplejo {
  id_complejo: number;
  nombre_complejo: string;
  canchas: DisponibilidadCancha[];
}

export interface ConsultaDisponibilidad {
  id_complejo?: number;
  id_cancha?: number;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio?: string;
  hora_fin?: string;
  solo_disponibles?: boolean;
}

export interface BloqueoTemporal {
  id_bloqueo: number;
  id_complejo: number;
  id_cancha: number;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio?: string;
  hora_fin?: string;
  motivo?: string;
  activo: boolean;
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

// Obtiene los horarios de un complejo específico
export async function fetchHorariosComplejo(id_complejo: number): Promise<Horario[]> {
  try {
    const response: AxiosResponse<Horario[]> = await apiClient.get(`/complejos/${id_complejo}/horarios`);
    
    // Ordenar por día de la semana y hora
    const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    return response.data.sort((a: Horario, b: Horario) => {
      const diaA = diasOrden.indexOf(a.dia_semana.toLowerCase());
      const diaB = diasOrden.indexOf(b.dia_semana.toLowerCase());
      
      if (diaA !== diaB) {
        return diaA - diaB;
      }
      
      return a.hora_apertura.localeCompare(b.hora_apertura);
    });
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene los horarios de una cancha específica
export async function fetchHorariosCancha(id_cancha: number): Promise<Horario[]> {
  try {
    const response: AxiosResponse<Horario[]> = await apiClient.get(`/canchas/${id_cancha}/horarios`);
    
    // Ordenar por día de la semana y hora
    const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    return response.data.sort((a: Horario, b: Horario) => {
      const diaA = diasOrden.indexOf(a.dia_semana.toLowerCase());
      const diaB = diasOrden.indexOf(b.dia_semana.toLowerCase());
      
      if (diaA !== diaB) {
        return diaA - diaB;
      }
      
      return a.hora_apertura.localeCompare(b.hora_apertura);
    });
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Consulta la disponibilidad de canchas en un rango de fechas
export async function fetchDisponibilidad(consulta: ConsultaDisponibilidad): Promise<DisponibilidadComplejo> {
  try {
    const response: AxiosResponse<DisponibilidadComplejo> = await apiClient.get('/disponibilidad', {
      params: consulta
    });
    
    // Normalizar y ordenar los datos de disponibilidad
    const disponibilidadNormalizada: DisponibilidadComplejo = {
      ...response.data,
      canchas: response.data.canchas.map((cancha: DisponibilidadCancha) => ({
        ...cancha,
        dias: cancha.dias
          .sort((a: DisponibilidadDia, b: DisponibilidadDia) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .map((dia: DisponibilidadDia) => ({
            ...dia,
            slots: dia.slots
              .sort((a: DisponibilidadSlot, b: DisponibilidadSlot) => a.hora_inicio.localeCompare(b.hora_inicio))
              .map((slot: DisponibilidadSlot) => ({
                ...slot,
                precio: slot.precio || 0,
              }))
          }))
      }))
    };
    
    return disponibilidadNormalizada;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene la disponibilidad de una cancha específica
export async function fetchDisponibilidadCancha(
  id_cancha: number,
  fecha_inicio: string,
  fecha_fin: string,
  solo_disponibles: boolean = true
): Promise<DisponibilidadCancha> {
  try {
    const consulta: ConsultaDisponibilidad = {
      id_cancha,
      fecha_inicio,
      fecha_fin,
      solo_disponibles
    };
    
    const disponibilidad = await fetchDisponibilidad(consulta);
    
    // Buscar la cancha específica en la respuesta
    const canchaDisponibilidad = disponibilidad.canchas.find(c => c.id_cancha === id_cancha);
    
    if (!canchaDisponibilidad) {
      throw new Error(`No se encontró disponibilidad para la cancha ${id_cancha}`);
    }
    
    return canchaDisponibilidad;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene la disponibilidad para un día específico
export async function fetchDisponibilidadDia(
  id_complejo: number,
  fecha: string
): Promise<DisponibilidadComplejo> {
  return fetchDisponibilidad({
    id_complejo,
    fecha_inicio: fecha,
    fecha_fin: fecha,
    solo_disponibles: false
  });
}

// Obtiene los bloqueos temporales activos
export async function fetchBloqueosActivos(id_complejo: number): Promise<BloqueoTemporal[]> {
  try {
    const response: AxiosResponse<BloqueoTemporal[]> = await apiClient.get(`/complejos/${id_complejo}/bloqueos`);
    
    // Filtrar solo bloqueos activos y futuros
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return response.data
      .filter((bloqueo: BloqueoTemporal) => {
        return bloqueo.activo && new Date(bloqueo.fecha_fin) >= hoy;
      })
      .sort((a: BloqueoTemporal, b: BloqueoTemporal) => 
        new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
      );
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Verifica si un slot específico está disponible
export async function verificarSlotDisponible(
  id_cancha: number,
  fecha: string,
  hora_inicio: string,
  hora_fin: string
): Promise<boolean> {
  try {
    const response: AxiosResponse<{ disponible: boolean }> = await apiClient.get('/disponibilidad/verificar', {
      params: {
        id_cancha,
        fecha,
        hora_inicio,
        hora_fin
      }
    });
    
    return response.data.disponible;
  } catch (error) {
    // Si hay error, asumir que no está disponible por seguridad
    console.warn('Error verificando disponibilidad de slot:', error);
    return false;
  }
}

// Obtiene los próximos slots disponibles para una cancha
export async function fetchProximosSlots(
  id_cancha: number,
  limite: number = 10
): Promise<DisponibilidadSlot[]> {
  try {
    const hoy = new Date();
    const fechaInicio = hoy.toISOString().split('T')[0];
    
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 7); // Próximos 7 días
    const fechaFinStr = fechaFin.toISOString().split('T')[0];
    
    const disponibilidad = await fetchDisponibilidadCancha(id_cancha, fechaInicio, fechaFinStr, true);
    
    // Extraer y limitar los slots disponibles
    const slots: DisponibilidadSlot[] = [];
    
    for (const dia of disponibilidad.dias) {
      for (const slot of dia.slots) {
        if (slot.disponible) {
          slots.push(slot);
          if (slots.length >= limite) {
            break;
          }
        }
      }
      if (slots.length >= limite) {
        break;
      }
    }
    
    return slots;
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}

// Obtiene estadísticas de ocupación para un complejo
export async function fetchEstadisticasOcupacion(
  id_complejo: number,
  fecha_inicio: string,
  fecha_fin: string
): Promise<{
  ocupacion_promedio: number;
  total_slots: number;
  slots_ocupados: number;
  slots_disponibles: number;
  ingresos_estimados: number;
}> {
  try {
    const disponibilidad = await fetchDisponibilidad({
      id_complejo,
      fecha_inicio,
      fecha_fin,
      solo_disponibles: false
    });
    
    let totalSlots = 0;
    let slotsOcupados = 0;
    let ingresosEstimados = 0;
    
    for (const cancha of disponibilidad.canchas) {
      for (const dia of cancha.dias) {
        for (const slot of dia.slots) {
          totalSlots++;
          if (!slot.disponible) {
            slotsOcupados++;
            ingresosEstimados += slot.precio || 0;
          }
        }
      }
    }
    
    const slotsDisponibles = totalSlots - slotsOcupados;
    const ocupacionPromedio = totalSlots > 0 ? (slotsOcupados / totalSlots) : 0;
    
    return {
      ocupacion_promedio: Math.round(ocupacionPromedio * 100) / 100,
      total_slots: totalSlots,
      slots_ocupados: slotsOcupados,
      slots_disponibles: slotsDisponibles,
      ingresos_estimados: Math.round(ingresosEstimados * 100) / 100
    };
  } catch (error) {
    handleApiError(error as AxiosError);
  }
}