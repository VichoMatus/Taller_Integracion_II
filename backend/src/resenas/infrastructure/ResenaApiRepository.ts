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
   */
  async listResenas(filters: ResenaFilters): Promise<Resena[]> {
    try {
      const params: any = {};
      
      if (filters.idCancha) params.id_cancha = filters.idCancha;
      if (filters.idComplejo) params.id_complejo = filters.idComplejo;
      if (filters.order) params.order = filters.order;
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      
      const { data } = await this.http.get<FastResena[]>(`/resenas`, { params });
      return data.map(toResena);
    } catch (e) {
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
