import { apiBackend } from '../config/backend';
import {
  Resena,
  ResenaCreateRequest,
  ResenaUpdateRequest,
  ResenaListQuery,
  ResumenCalificacion
} from '../types/resena';

export const resenaService = {
  /**
   * Crear una nueva reseña
   */
  async crearResena(input: ResenaCreateRequest): Promise<Resena> {
    try {
      const response = await apiBackend.post('/api/resenas', input);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al crear reseña: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Listar reseñas (con filtros)
   */
  async listarResenas(query?: ResenaListQuery): Promise<Resena[]> {
    try {
      const response = await apiBackend.get('/api/resenas', { params: query });
      return response.data;
    } catch (error: any) {
      throw new Error('Error al listar reseñas: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Obtener una reseña por ID
   */
  async obtenerResena(id: number | string): Promise<Resena> {
    try {
      const response = await apiBackend.get(`/api/resenas/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener reseña: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Actualizar una reseña
   */
  async actualizarResena(id: number | string, input: ResenaUpdateRequest): Promise<Resena> {
    try {
      const response = await apiBackend.put(`/api/resenas/${id}`, input);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al actualizar reseña: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Eliminar una reseña
   */
  async eliminarResena(id: number | string): Promise<void> {
    try {
      await apiBackend.delete(`/api/resenas/${id}`);
    } catch (error: any) {
      throw new Error('Error al eliminar reseña: ' + (error.response?.data?.error || error.message));
    }
  },

  /**
   * Obtener resumen de calificaciones de una cancha
   */
  async obtenerResumenCalificacion(id_cancha: number | string): Promise<ResumenCalificacion> {
    try {
      const response = await apiBackend.get(`/api/resenas/cancha/${id_cancha}/resumen`);
      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener resumen de calificaciones: ' + (error.response?.data?.error || error.message));
    }
  }
};
