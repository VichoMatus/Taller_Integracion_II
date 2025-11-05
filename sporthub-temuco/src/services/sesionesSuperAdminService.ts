import api from "../config/backend";

export interface Sesion {
  id_sesion: number;
  id_usuario: number;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'activa' | 'finalizada';
  duracion_minutos?: number;
}

export interface ResumenSesiones {
  total_sesiones: number;
  sesiones_activas: number;
  tiempo_promedio_minutos: number;
  ultima_conexion?: string;
}

class SessionService {
  private baseUrl = '/sesiones';

  /**
   * Obtener todas las sesiones del usuario actual
   */
  async obtenerMisSesiones(limite: number = 50, offset: number = 0): Promise<{
    sesiones: Sesion[];
    total: number;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/mis-sesiones`, {
        params: { limite, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de sesiones
   */
  async obtenerResumen(): Promise<ResumenSesiones> {
    try {
      const response = await api.get(`${this.baseUrl}/resumen`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de sesiones:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión específica
   */
  async cerrarSesion(id_sesion: number): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${id_sesion}/cerrar`);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Cerrar todas las sesiones excepto la actual
   */
  async cerrarTodasLasSesiones(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/cerrar-todas`);
    } catch (error) {
      console.error('Error al cerrar todas las sesiones:', error);
      throw error;
    }
  }
}

export const sessionService = new SessionService();
export default sessionService;