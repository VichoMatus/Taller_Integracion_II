import { apiBackend } from '../config/backend';
import {
  Resena,
  ResenaCreateRequest,
  ResenaUpdateRequest,
  ResenaListQuery,
  ReportarResenaInput,
  ReporteResponse
} from '../types/resena';
import { handleApiError } from "../services/ApiError";

/**
 * Servicio para gestión de reseñas.
 * Basado en la API de Taller4 implementada en el backend.
 * 
 * Endpoints disponibles:
 * - GET    /resenas                    → Lista reseñas (con filtros)
 * - POST   /resenas                    → Crea reseña (requiere reserva confirmada)
 * - PATCH  /resenas/{id}               → Actualiza reseña (solo autor)
 * - DELETE /resenas/{id}               → Elimina reseña (autor/admin/superadmin)
 * - POST   /resenas/{id}/reportar      → Reporta reseña
 */
export const resenaService = {
  /**
   * Lista reseñas con filtros opcionales.
   * @param query - Filtros: id_cancha, id_complejo, order, page, page_size
   * @returns Array de reseñas (incluye promedioRating y totalResenas si hay filtro por cancha/complejo)
   */
  async listarResenas(query?: ResenaListQuery): Promise<Resena[]> {
    try {
      const { data } = await apiBackend.get('/resenas', { params: query });
      
      // El backend devuelve { ok, data } donde data es el array
      return data.data || data;
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
      // Fallback: si el endpoint GET /resenas/:id falla en FastAPI o la ruta no existe,
      // intentar obtener desde la lista y filtrar con page_size seguro.
      try {
        // FastAPI limita page_size <= 100, por lo que iteramos páginas de 100 hasta encontrar la reseña
        const pageSize = 100;
        let page = 1;
        while (true) {
          // En caso de que el BFF/FASTAPI valide page_size, enviamos page_size=100 explícito
          const res = await apiBackend.get('/resenas', { params: { page, page_size: pageSize } });
          const items = res.data?.data || res.data || [];
          if (!Array.isArray(items) || items.length === 0) break;
          const found = items.find((r: any) => Number(r.id) === Number(id));
          if (found) return found;
          // si el número de items es menor que pageSize, estamos al final
          if (items.length < pageSize) break;
          page += 1;
          // límite de seguridad: no iterar más de 20 páginas
          if (page > 20) break;
        }
      } catch (fallthroughErr: any) {
        // Si recibimos un error 422 del backend (page_size demasiado grande) intentamos con menor page_size
        console.warn('Fallback para obtener reseña por lista falló:', fallthroughErr);
        if (fallthroughErr?.response?.status === 422) {
          console.warn('BFF rechazó page_size, reintentando con page_size=50...');
          try {
            const fallbackPageSize = 50;
            let fallbackPage = 1;
            while (true) {
              const res = await apiBackend.get('/resenas', { params: { page: fallbackPage, page_size: fallbackPageSize } });
              const items = res.data?.data || res.data || [];
              if (!Array.isArray(items) || items.length === 0) break;
              const found = items.find((r: any) => Number(r.id) === Number(id));
              if (found) return found;
              if (items.length < fallbackPageSize) break;
              fallbackPage += 1;
              if (fallbackPage > 40) break;
            }
          } catch (err2: any) {
            console.warn('Segundo fallback también falló:', err2);
          }
        }
      }
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

  /**
   * Actualiza una reseña existente.
   * Solo el autor puede actualizar su reseña.
   * @param id - ID de la reseña
   * @param input - Campos a actualizar (calificacion, comentario)
   * @returns Reseña actualizada
   */
  async actualizarResena(id: number, input: ResenaUpdateRequest): Promise<Resena> {
    try {
      const { data } = await apiBackend.patch(`/resenas/${id}`, input);
      return data.data || data;
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Elimina una reseña.
   * Permisos: autor, admin/dueño del complejo, o superadmin.
   * @param id - ID de la reseña
   */
  async eliminarResena(id: number): Promise<void> {
    try {
      await apiBackend.delete(`/resenas/${id}`);
    } catch (err) {
      handleApiError(err);
    }
  },

  /**
   * Reporta una reseña por contenido inapropiado.
   * 1 reporte por usuario por reseña (UPSERT).
   * @param id - ID de la reseña
   * @param input - Motivo del reporte (opcional)
   * @returns Datos del reporte
   */
  async reportarResena(id: number, input: ReportarResenaInput): Promise<ReporteResponse> {
    try {
      const { data } = await apiBackend.post(`/resenas/${id}/reportar`, input);
      return data.data || data;
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
