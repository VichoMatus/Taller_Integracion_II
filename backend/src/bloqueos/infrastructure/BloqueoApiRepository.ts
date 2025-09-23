import { AxiosInstance } from "axios";
import { BloqueoRepository, BloqueoFilters, CreateBloqueoInput, UpdateBloqueoInput, ConflictoBloqueoInput } from "../domain/BloqueoRepository";
import { Bloqueo } from "../../domain/bloqueo/Bloqueo";
import { toBloqueo, FastBloqueo } from "./mappers";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";
import { toSnake } from "../../app/common/case";

/**
 * Implementación del repositorio de bloqueos utilizando FastAPI como backend.
 * Maneja la comunicación HTTP con el servicio de bloqueos y convierte entre formatos.
 */
export class BloqueoApiRepository implements BloqueoRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista bloqueos desde FastAPI con paginación y filtros.
   */
  async listBloqueos(filters: BloqueoFilters): Promise<Paginated<Bloqueo>> {
    try {
      const params = toSnake({
        ...filters,
        fechaDesde: filters.fechaDesde?.toISOString(),
        fechaHasta: filters.fechaHasta?.toISOString(),
      });
      const { data } = await this.http.get(`/bloqueos`, { params });
      return normalizePage<Bloqueo>(data, x => toBloqueo(x as FastBloqueo));
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene un bloqueo específico desde FastAPI.
   */
  async getBloqueo(id: number): Promise<Bloqueo> {
    try {
      const { data } = await this.http.get<FastBloqueo>(`/bloqueos/${id}`);
      return toBloqueo(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Crea un nuevo bloqueo en FastAPI.
   */
  async createBloqueo(input: CreateBloqueoInput): Promise<Bloqueo> {
    try {
      const payload = toSnake({
        ...input,
        fechaInicio: input.fechaInicio.toISOString(),
        fechaFin: input.fechaFin.toISOString(),
      });
      const { data } = await this.http.post<FastBloqueo>(`/bloqueos`, payload);
      return toBloqueo(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Actualiza un bloqueo en FastAPI.
   */
  async updateBloqueo(id: number, input: UpdateBloqueoInput): Promise<Bloqueo> {
    try {
      const payload = toSnake({
        ...input,
        fechaInicio: input.fechaInicio?.toISOString(),
        fechaFin: input.fechaFin?.toISOString(),
      });
      const { data } = await this.http.patch<FastBloqueo>(`/bloqueos/${id}`, payload);
      return toBloqueo(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Elimina un bloqueo en FastAPI.
   */
  async deleteBloqueo(id: number): Promise<void> {
    try {
      await this.http.delete(`/bloqueos/${id}`);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Verifica conflictos entre bloqueos en FastAPI.
   */
  async verificarConflicto(input: ConflictoBloqueoInput): Promise<boolean> {
    try {
      const payload = {
        cancha_id: input.canchaId,
        fecha_inicio: input.fechaInicio.toISOString(),
        fecha_fin: input.fechaFin.toISOString(),
        ...(input.bloqueoId && { bloqueo_id: input.bloqueoId }),
      };
      
      const { data } = await this.http.post<{ hayConflicto: boolean }>(`/bloqueos/verificar-conflicto`, payload);
      return data.hayConflicto;
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene bloqueos activos para una cancha desde FastAPI.
   */
  async getBloqueosActivos(canchaId: number, fechaInicio: Date, fechaFin: Date): Promise<Bloqueo[]> {
    try {
      const params = {
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
      };
      
      const { data } = await this.http.get<FastBloqueo[]>(`/bloqueos/activos/${canchaId}`, { params });
      return data.map(toBloqueo);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene bloqueos de un creador específico desde FastAPI.
   */
  async getBloqueosByCreador(creadoPorId: number): Promise<Bloqueo[]> {
    try {
      const { data } = await this.http.get<FastBloqueo[]>(`/bloqueos/creador/${creadoPorId}`);
      return data.map(toBloqueo);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Activa un bloqueo en FastAPI.
   */
  async activarBloqueo(id: number): Promise<Bloqueo> {
    try {
      const { data } = await this.http.post<FastBloqueo>(`/bloqueos/${id}/activar`);
      return toBloqueo(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Desactiva un bloqueo en FastAPI.
   */
  async desactivarBloqueo(id: number): Promise<Bloqueo> {
    try {
      const { data } = await this.http.post<FastBloqueo>(`/bloqueos/${id}/desactivar`);
      return toBloqueo(data);
    } catch (e) {
      throw httpError(e);
    }
  }
}
