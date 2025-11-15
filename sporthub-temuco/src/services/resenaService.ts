import { apiBackend } from '../config/backend';
import {
  Resena,
  ResenaCreateRequest,
  ResenaUpdateRequest,
  ResenaListQuery,
  ResenaExtendida,
  EstadisticasComplejo,
  LikeResponse,
  ReportarResenaInput,
  ReporteResponse,
  ResponderResenaInput
} from '../types/resena';
import { handleApiError } from "../services/ApiError";

export const resenaService = {
  async crearResena(input: ResenaCreateRequest): Promise<Resena> {
    try {
      const { data } = await apiBackend.post('/resenas', input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async listarResenas(query?: ResenaListQuery): Promise<Resena[]> {
    try {
      const { data } = await apiBackend.get('/resenas', { params: query });
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Obtiene una reseña específica por ID.
   * @param id - ID de la reseña
   * @returns Reseña encontrada
   */
  async obtenerResena(id: string | number): Promise<Resena> {
    try {
      const { data } = await apiBackend.get(`/resenas/${id}`);
      return data.data || data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Crea una nueva reseña.
   * Requiere tener una reserva confirmada del destino (cancha o complejo).
   * @param input - Datos de la reseña (id_cancha o id_complejo, calificacion, comentario)
   * @returns Reseña creada
   */
  async crearResena(input: ResenaCreateRequest): Promise<Resena> {
    try {
      // Transformar snake_case a camelCase para el BFF
      const bffInput = {
        idCancha: input.id_cancha,
        idComplejo: input.id_complejo,
        calificacion: input.calificacion,
        comentario: input.comentario
      };
      
      const { data } = await apiBackend.post('/resenas', bffInput);
      return data.data || data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async actualizarResena(id: number | string, input: ResenaUpdateRequest): Promise<Resena> {
    try {
      const { data } = await apiBackend.patch(`/resenas/${id}`, input);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  async eliminarResena(id: number | string): Promise<void> {
    try {
      await apiBackend.delete(`/resenas/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  },

  async obtenerResenasPorComplejo(complejoId: number): Promise<Resena[]> {
    try {
      const { data } = await apiBackend.get(`/resenas/complejo/${complejoId}`);
      return data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Obtiene reseñas de una cancha específica.
   * Incluye promedioRating y totalResenas en cada reseña.
   * @param canchaId - ID de la cancha
   * @returns Array de reseñas de la cancha
   */
  async obtenerResenasPorCancha(canchaId: number, order?: "recientes" | "mejor" | "peor", page?: number, pageSize?: number): Promise<Resena[]> {
    try {
      // El BFF espera idCancha en lugar de id_cancha
      const { data } = await apiBackend.get('/resenas', { 
        params: {
          idCancha: canchaId,
          order,
          page,
          pageSize
        }
      });
      
      return data.data || data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Obtiene reseñas de un complejo específico.
   * Incluye promedioRating y totalResenas en cada reseña.
   * @param complejoId - ID del complejo
   * @returns Array de reseñas del complejo
   */
  async obtenerResenasPorComplejo(complejoId: number, order?: "recientes" | "mejor" | "peor", page?: number, pageSize?: number): Promise<Resena[]> {
    try {
      // El BFF espera idComplejo en lugar de id_complejo
      const { data } = await apiBackend.get('/resenas', { 
        params: {
          idComplejo: complejoId,
          order,
          page,
          pageSize
        }
      });
      
      return data.data || data;
    } catch (err) {
      handleApiError(err);
    }
  }
};
