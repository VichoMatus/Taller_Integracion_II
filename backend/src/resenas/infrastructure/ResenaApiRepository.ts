import { AxiosInstance } from "axios";
import { ResenaRepository, ResenaFilters, CreateResenaInput, UpdateResenaInput } from "../domain/ResenaRepository";
import { Resena } from "../../domain/resena/Resena";
import { toResena, FastResena } from "./mappers";
import { httpError } from "../../infra/http/errors";

/**
 * Implementación del repositorio de reseñas utilizando FastAPI de Taller4 como backend.
 * Maneja la comunicación HTTP con el servicio de reseñas y convierte entre formatos.
 * Basado en la API documentada en Taller4/backend/app/modules/resenas/router.py
 */
export class ResenaApiRepository implements ResenaRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista reseñas desde FastAPI con filtros opcionales (por cancha o complejo).
   * GET /resenas con query params: id_cancha, id_complejo, order, page, page_size
   * 
   * NOTA: El API de Taller4 tiene un bug SQL cuando NO se proporciona id_cancha o id_complejo.
   * Como workaround, siempre enviamos page_size con un máximo de 100 (validación de FastAPI).
   */
  async listResenas(filters: ResenaFilters): Promise<Resena[]> {
    const params: any = {};
    
    if (filters.idCancha) params.id_cancha = filters.idCancha;
    if (filters.idComplejo) params.id_complejo = filters.idComplejo;
    if (filters.order) params.order = filters.order;
    
    // Asegurar que page y page_size cumplan con las validaciones de FastAPI
    params.page = filters.page || 1;
    params.page_size = Math.min(filters.pageSize || 20, 100); // Máximo 100 por validación de FastAPI
    
    console.log('🔍 [ResenaApiRepository.listResenas] Filtros recibidos:', filters);
    console.log('📤 [ResenaApiRepository.listResenas] Params a enviar a FastAPI:', params);
    console.log('🌐 [ResenaApiRepository.listResenas] URL completa:', this.http.defaults.baseURL + '/resenas');
    
    try {
      const params: any = {};
      
      if (filters.idCancha) params.id_cancha = filters.idCancha;
      if (filters.idComplejo) params.id_complejo = filters.idComplejo;
      if (filters.order) params.order = filters.order;
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      
      const { data } = await this.http.get<FastResena[]>(`/resenas`, { params });
      return data.map(toResena);
    } catch (e: any) {
      console.error('❌ [ResenaApiRepository.listResenas] Error al obtener reseñas:', {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data,
        paramsEnviados: params
      });
      
      // Si el error es un bug SQL conocido (falta de CTE 'agg'), retornar array vacío con advertencia
      if (e.response?.status === 400 && e.response?.data?.detail?.includes('missing FROM-clause entry for table "agg"')) {
        console.warn('⚠️ [ResenaApiRepository.listResenas] Bug conocido de SQL en Taller4 detectado. Retornando array vacío.');
        console.warn('   Esto ocurre cuando no hay filtro de id_cancha o id_complejo.');
        return [];
      }
      
      throw httpError(e);
    }
  }

  /**
   * Obtiene una reseña específica por ID desde FastAPI.
   * GET /resenas/{id}
   * 
   * IMPORTANTE: Este endpoint NO debe enviar query params, solo el ID en la ruta.
   */
  async getResena(id: number): Promise<Resena> {
    console.log('🔍 [ResenaApiRepository.getResena] Obteniendo reseña ID:', id);
    console.log('🌐 [ResenaApiRepository.getResena] URL completa:', this.http.defaults.baseURL + `/resenas/${id}`);
    
    try {
      // Asegurarse de NO enviar query params
      const { data } = await this.http.get<FastResena>(`/resenas/${id}`, { 
        params: {} // Explícitamente sin parámetros
      });
      
      console.log('✅ [ResenaApiRepository.getResena] Reseña obtenida:', data);
      
      return toResena(data);
    } catch (e: any) {
      console.error('❌ [ResenaApiRepository.getResena] Error al obtener reseña:', {
        id,
        message: e.message,
        status: e.response?.status,
        data: e.response?.data,
        url: e.config?.url,
        params: e.config?.params
      });
      throw httpError(e);
    }
  }

  /**
   * Crea una nueva reseña en FastAPI (requiere reserva confirmada).
   * POST /resenas
   * Body: { id_cancha?, id_complejo?, calificacion, comentario? }
   */
  async createResena(input: CreateResenaInput): Promise<Resena> {
    try {
      const payload: any = {
        calificacion: input.calificacion
      };
      
      if (input.idCancha) payload.id_cancha = input.idCancha;
      if (input.idComplejo) payload.id_complejo = input.idComplejo;
      if (input.comentario) payload.comentario = input.comentario;
      
      const { data } = await this.http.post<FastResena>(`/resenas`, payload);
      return toResena(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Actualiza una reseña en FastAPI (solo el autor).
   * PATCH /resenas/{id}
   * Body: { calificacion?, comentario? }
   */
  async updateResena(id: number, input: UpdateResenaInput): Promise<Resena> {
    try {
      const payload: any = {};
      
      if (input.calificacion !== undefined) payload.calificacion = input.calificacion;
      if (input.comentario !== undefined) payload.comentario = input.comentario;
      
      const { data } = await this.http.patch<FastResena>(`/resenas/${id}`, payload);
      return toResena(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Elimina una reseña en FastAPI (permisos: autor, admin/dueno, superadmin).
   * DELETE /resenas/{id}
   */
  async deleteResena(id: number): Promise<void> {
    try {
      await this.http.delete(`/resenas/${id}`);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Reporta una reseña por contenido inapropiado.
   * POST /resenas/{id}/reportar
   * Body: { motivo?: string }
   * 1 reporte por usuario por reseña (UPSERT).
   */
  async reportarResena(resenaId: number, motivo?: string): Promise<any> {
    try {
      const payload: any = {};
      if (motivo) payload.motivo = motivo;
      
      const { data } = await this.http.post(`/resenas/${resenaId}/reportar`, payload);
      return data;
    } catch (e) {
      throw httpError(e);
    }
  }
}