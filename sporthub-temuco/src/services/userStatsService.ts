import api from "../config/backend";

export interface UserStats {
  reservas_totales: number;
  canchas_reservadas: number;
  total_gastado: number;
  favoritos: number;
}

class UserStatsService {
  /**
   * Obtiene las estadísticas del usuario actual
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get('/api/usuarios/estadisticas');
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      
      // Retornar valores por defecto en lugar de lanzar error
      return {
        reservas_totales: 0,
        canchas_reservadas: 0, // ← CAMBIO AQUÍ
        total_gastado: 0,
        favoritos: 0
      };
    }
  }

  /**
   * Obtiene el número de favoritos del usuario
   */
  async getFavoritos(): Promise<number> {
    try {
      const response = await api.get('/api/favoritos');
      return response.data.length || 0;
    } catch (error) {
      console.error('Error obteniendo favoritos:', error);
      return 0;
    }
  }
}

export const userStatsService = new UserStatsService();
export default userStatsService;