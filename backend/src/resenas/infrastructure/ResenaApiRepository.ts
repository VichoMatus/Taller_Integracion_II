import { AxiosInstance } from "axios";
import { ResenaRepository, ResenaFilters, CreateResenaInput, UpdateResenaInput, EstadisticasResenas } from "../domain/ResenaRepository";
import { Resena } from "../../domain/resena/Resena";
import { toResena, FastResena } from "./mappers";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";
import { toSnake } from "../../app/common/case";

/**
 * Implementación del repositorio de reseñas utilizando FastAPI como backend.
 * Maneja la comunicación HTTP con el servicio de reseñas y convierte entre formatos.
 */
export class ResenaApiRepository implements ResenaRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista reseñas desde FastAPI con paginación y filtros.
   */
  async listResenas(filters: ResenaFilters): Promise<Paginated<Resena>> {
    try {
      const params = toSnake({
        ...filters,
        fechaDesde: filters.fechaDesde?.toISOString(),
        fechaHasta: filters.fechaHasta?.toISOString(),
      });
      const { data } = await this.http.get(`/resenas`, { params });
      return normalizePage<Resena>(data, x => toResena(x as FastResena));
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene una reseña específica desde FastAPI.
   */
  async getResena(id: number): Promise<Resena> {
    try {
      const { data } = await this.http.get<FastResena>(`/resenas/${id}`);
      return toResena(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Crea una nueva reseña en FastAPI.
   */
  async createResena(input: CreateResenaInput): Promise<Resena> {
    try {
      const payload = toSnake(input);
      const { data } = await this.http.post<FastResena>(`/resenas`, payload);
      return toResena(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Actualiza una reseña en FastAPI.
   */
  async updateResena(id: number, input: UpdateResenaInput): Promise<Resena> {
    try {
      const payload = toSnake(input);
      const { data } = await this.http.patch<FastResena>(`/resenas/${id}`, payload);
      return toResena(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Elimina una reseña en FastAPI.
   */
  async deleteResena(id: number): Promise<void> {
    try {
      await this.http.delete(`/resenas/${id}`);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene reseñas de un usuario específico desde FastAPI.
   */
  async getResenasByUsuario(usuarioId: number): Promise<Resena[]> {
    try {
      const { data } = await this.http.get<FastResena[]>(`/resenas/usuario/${usuarioId}`);
      return data.map(toResena);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene reseñas de un complejo específico desde FastAPI.
   */
  async getResenasByComplejo(complejoId: number, incluirOcultas = false): Promise<Resena[]> {
    try {
      const params = { incluir_ocultas: incluirOcultas };
      const { data } = await this.http.get<FastResena[]>(`/resenas/complejo/${complejoId}`, { params });
      return data.map(toResena);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Verifica si un usuario ya reseñó un complejo en FastAPI.
   */
  async usuarioYaReseno(usuarioId: number, complejoId: number): Promise<boolean> {
    try {
      const { data } = await this.http.get<{ yaReseno: boolean }>(`/resenas/verificar/${usuarioId}/${complejoId}`);
      return data.yaReseno;
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Da like a una reseña en FastAPI.
   */
  async darLike(resenaId: number, usuarioId: number): Promise<Resena> {
    try {
      const payload = { usuario_id: usuarioId };
      const { data } = await this.http.post<FastResena>(`/resenas/${resenaId}/like`, payload);
      return toResena(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Quita like de una reseña en FastAPI.
   */
  async quitarLike(resenaId: number, usuarioId: number): Promise<Resena> {
    try {
      const payload = { usuario_id: usuarioId };
      const { data } = await this.http.delete<FastResena>(`/resenas/${resenaId}/like`, { data: payload });
      return toResena(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Reporta una reseña en FastAPI.
   */
  async reportarResena(resenaId: number, usuarioId: number, motivo: string): Promise<void> {
    try {
      const payload = { usuario_id: usuarioId, motivo };
      await this.http.post(`/resenas/${resenaId}/reportar`, payload);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene estadísticas de reseñas desde FastAPI.
   */
  async getEstadisticas(complejoId: number): Promise<EstadisticasResenas> {
    try {
      const { data } = await this.http.get<any>(`/resenas/estadisticas/${complejoId}`);
      return {
        totalResenas: data.total_resenas,
        calificacionPromedio: data.calificacion_promedio,
        distribucionCalificaciones: {
          estrella1: data.distribucion_calificaciones.estrella_1,
          estrella2: data.distribucion_calificaciones.estrella_2,
          estrella3: data.distribucion_calificaciones.estrella_3,
          estrella4: data.distribucion_calificaciones.estrella_4,
          estrella5: data.distribucion_calificaciones.estrella_5,
        },
        porcentajeVerificadas: data.porcentaje_verificadas,
      };
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Responde a una reseña en FastAPI.
   */
  async responderResena(resenaId: number, respuesta: string): Promise<Resena> {
    try {
      const payload = { respuesta };
      const { data } = await this.http.post<FastResena>(`/resenas/${resenaId}/responder`, payload);
      return toResena(data);
    } catch (e) {
      throw httpError(e);
    }
  }
}
