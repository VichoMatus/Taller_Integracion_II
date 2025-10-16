/**
 * SERVICIO DE CANCHAS
 * ===================
 * Llama al endpoint del BFF para obtener las canchas disponibles
 */

import { apiBackend } from '../config/backend';
import { 
  CreateCanchaInput, 
  UpdateCanchaInput, 
  FotoCancha, 
  AddFotoInput,
  CanchaBackendResponse 
} from '../types/cancha';

export const canchaService = {
  /**
   * Obtener todas las canchas disponibles
   */
  async getCanchas() {
    try {
      const response = await apiBackend.get('/api/canchas');
      return response.data; // Los datos ya vienen listos en JSON
    } catch (error: any) {
      // Manejo de error si la URL no responde o hay error de red
      if (error.response) {
        throw new Error('Error al obtener canchas: ' + (error.response.data?.message || error.response.statusText));
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor de canchas. Verifica la URL o tu conexión.');
      } else {
        throw new Error('Error inesperado: ' + error.message);
      }
    }
  },

  /**
   * Obtener una cancha por ID
   */
  async getCanchaById(id: number) {
    try {
      const response = await apiBackend.get(`/canchas/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener la cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Crear una nueva cancha
   */
  async createCancha(input: CreateCanchaInput) {
    try {
      const response = await apiBackend.post('/api/canchas', input);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al crear la cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Actualizar una cancha existente
   */
  async updateCancha(id: number, input: UpdateCanchaInput) {
    try {
      const response = await apiBackend.patch(`/api/canchas/${id}`, input);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al actualizar la cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Eliminar una cancha
   */
  async deleteCancha(id: number) {
    try {
      const response = await apiBackend.delete(`/api/canchas/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al eliminar la cancha: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Obtener fotos de una cancha
   */
  async getFotosCancha(id: number): Promise<FotoCancha[]> {
    try {
      const response = await apiBackend.get(`/api/canchas/${id}/fotos`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener las fotos: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Agregar foto a una cancha
   */
  async addFotoCancha(id: number, fotoData: AddFotoInput): Promise<FotoCancha> {
    try {
      const response = await apiBackend.post(`/api/canchas/${id}/fotos`, fotoData);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al agregar la foto: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Eliminar foto de una cancha
   */
  async deleteFotoCancha(canchaId: number, mediaId: number): Promise<void> {
    try {
      const response = await apiBackend.delete(`/api/canchas/${canchaId}/fotos/${mediaId}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al eliminar la foto: ' + (error.response?.data?.message || error.message));
    }
  }
};

// Ejemplo de uso en un componente React:
// import { canchaService } from '../services/canchaService';
// useEffect(() => {
//   canchaService.getCanchas().then(data => setCanchas(data));
// }, []);
