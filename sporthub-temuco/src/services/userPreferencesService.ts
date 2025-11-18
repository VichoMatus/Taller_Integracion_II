import api from "../config/backend";

export interface UserPreferences {
  notificaciones_email: boolean;
  notificaciones_promociones: boolean;
  notificaciones_recordatorios: boolean;
}

class UserPreferencesService {
  /**
   * Obtiene las preferencias del usuario actual
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await api.get('/api/usuarios/preferencias');
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo preferencias:', error);
      
      // Retornar valores por defecto
      return {
        notificaciones_email: true,
        notificaciones_promociones: true,
        notificaciones_recordatorios: true
      };
    }
  }

  /**
   * Actualiza una preferencia específica
   */
  async updatePreference(key: keyof UserPreferences, value: boolean): Promise<void> {
    try {
      await api.patch('/api/usuarios/preferencias', {
        [key]: value
      });
      console.log(`Preferencia ${key} actualizada a ${value}`);
    } catch (error) {
      console.error('Error actualizando preferencia:', error);
      throw new Error('No se pudo actualizar la preferencia');
    }
  }

  /**
   * Actualiza todas las preferencias
   */
  async updateAllPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await api.put('/api/usuarios/preferencias', preferences);
      console.log('Preferencias actualizadas:', preferences);
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      throw new Error('No se pudieron actualizar las preferencias');
    }
  }
}

export const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;