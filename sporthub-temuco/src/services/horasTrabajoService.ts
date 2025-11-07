import api from "../config/backend";

export interface HoraTrabajo {
  id_hora: number;
  id_usuario: number;
  fecha: string;
  hora_inicio: string;
  hora_fin?: string;
  horas_trabajadas?: number;
  tipo_actividad?: string;
  descripcion?: string;
  estado: 'activo' | 'pausado' | 'finalizado';
  created_at?: string;
  updated_at?: string;
}

export interface HorasPorDia {
  dia: string;
  horas: number;
  color: string;
}

export interface ResumenSemanal {
  total_horas: number;
  promedio_diario: number;
  dia_mas_productivo: string;
  horas_por_dia: HorasPorDia[];
  fecha_inicio?: string;
  fecha_fin?: string;
}

class HorasTrabajoService {
  private baseUrl = '/horas-trabajo';

  /**
   * 🔹 ENDPOINT NECESARIO EN BACKEND: GET /api/horas-trabajo/resumen-semanal
   * 
   * Parámetros opcionales:
   * - fecha_inicio (string, formato: YYYY-MM-DD)
   * - fecha_fin (string, formato: YYYY-MM-DD)
   * 
   * Respuesta esperada:
   * {
   *   total_horas: number,
   *   promedio_diario: number,
   *   dia_mas_productivo: string,
   *   horas_por_dia: [
   *     { dia: 'Lunes', horas: 6, color: '#5a6993' },
   *     ...
   *   ],
   *   fecha_inicio: 'YYYY-MM-DD',
   *   fecha_fin: 'YYYY-MM-DD'
   * }
   */
  async obtenerResumenSemanal(
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ResumenSemanal> {
    const params = new URLSearchParams();
    
    if (fecha_inicio) {
      params.append('fecha_inicio', fecha_inicio);
    }
    if (fecha_fin) {
      params.append('fecha_fin', fecha_fin);
    }

    const url = params.toString() 
      ? `${this.baseUrl}/resumen-semanal?${params}`
      : `${this.baseUrl}/resumen-semanal`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * 🔹 ENDPOINT NECESARIO EN BACKEND: POST /api/horas-trabajo/iniciar
   * 
   * Body (opcional):
   * {
   *   tipo_actividad?: string,
   *   descripcion?: string
   * }
   * 
   * Respuesta esperada:
   * {
   *   message: string,
   *   data: HoraTrabajo
   * }
   */
  async iniciarSesion(data?: {
    tipo_actividad?: string;
    descripcion?: string;
  }): Promise<HoraTrabajo> {
    const response = await api.post(`${this.baseUrl}/iniciar`, data || {});
    return response.data.data;
  }

  /**
   * 🔹 ENDPOINT NECESARIO EN BACKEND: PATCH /api/horas-trabajo/:id_hora/finalizar
   * 
   * Respuesta esperada:
   * {
   *   message: string,
   *   data: HoraTrabajo
   * }
   */
  async finalizarSesion(id_hora: number): Promise<HoraTrabajo> {
    const response = await api.patch(`${this.baseUrl}/${id_hora}/finalizar`);
    return response.data.data;
  }

  /**
   * 🔹 ENDPOINT NECESARIO EN BACKEND: GET /api/horas-trabajo/activa
   * 
   * Respuesta esperada:
   * {
   *   message: string,
   *   data: HoraTrabajo
   * }
   * 
   * Si no hay sesión activa, retorna 404
   */
  async obtenerSesionActiva(): Promise<HoraTrabajo | null> {
    try {
      const response = await api.get(`${this.baseUrl}/activa`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 🔹 ENDPOINT NECESARIO EN BACKEND: GET /api/horas-trabajo
   * 
   * Parámetros:
   * - limite (number, default: 50)
   * - offset (number, default: 0)
   * 
   * Respuesta esperada:
   * {
   *   data: HoraTrabajo[],
   *   total: number,
   *   limite: number,
   *   offset: number
   * }
   */
  async obtenerHistorial(
    limite: number = 50,
    offset: number = 0
  ): Promise<{ data: HoraTrabajo[], total: number }> {
    const response = await api.get(
      `${this.baseUrl}?limite=${limite}&offset=${offset}`
    );
    return response.data;
  }

  /**
   * 🔹 ENDPOINT NECESARIO EN BACKEND: POST /api/horas-trabajo/manual
   * 
   * Body:
   * {
   *   fecha: string (YYYY-MM-DD),
   *   hora_inicio: string (HH:MM:SS),
   *   hora_fin: string (HH:MM:SS),
   *   tipo_actividad?: string,
   *   descripcion?: string
   * }
   * 
   * Respuesta esperada:
   * {
   *   message: string,
   *   data: HoraTrabajo
   * }
   */
  async registrarManual(data: {
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    tipo_actividad?: string;
    descripcion?: string;
  }): Promise<HoraTrabajo> {
    const response = await api.post(`${this.baseUrl}/manual`, data);
    return response.data.data;
  }
}

export const horasTrabajoService = new HorasTrabajoService();
export default horasTrabajoService;