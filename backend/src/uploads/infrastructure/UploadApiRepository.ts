import { AxiosInstance } from "axios";
import { UploadRepository, UploadFilters, CreateUploadInput, UpdateUploadInput } from "../domain/UploadRepository";
import { Upload, TipoArchivo, CategoriaUpload } from "../../domain/upload/Upload";
import { toUpload, FastUpload } from "./mappers";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";
import { toSnake } from "../../app/common/case";

/**
 * Implementación del repositorio de uploads utilizando FastAPI como backend.
 * Maneja la comunicación HTTP con el servicio de uploads y convierte entre formatos.
 */
export class UploadApiRepository implements UploadRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista uploads desde FastAPI con paginación y filtros.
   */
  async listUploads(filters: UploadFilters): Promise<Paginated<Upload>> {
    try {
      const params = toSnake({
        ...filters,
        fechaDesde: filters.fechaDesde?.toISOString(),
        fechaHasta: filters.fechaHasta?.toISOString(),
      });
      const { data } = await this.http.get(`/uploads`, { params });
      return normalizePage<Upload>(data, x => toUpload(x as FastUpload));
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene un upload específico desde FastAPI.
   */
  async getUpload(id: number): Promise<Upload> {
    try {
      const { data } = await this.http.get<FastUpload>(`/uploads/${id}`);
      return toUpload(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Crea un nuevo registro de upload en FastAPI.
   */
  async createUpload(input: CreateUploadInput): Promise<Upload> {
    try {
      const payload = toSnake({
        ...input,
        fechaExpiracion: input.fechaExpiracion?.toISOString(),
      });
      const { data } = await this.http.post<FastUpload>(`/uploads`, payload);
      return toUpload(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Actualiza un upload en FastAPI.
   */
  async updateUpload(id: number, input: UpdateUploadInput): Promise<Upload> {
    try {
      const payload = toSnake({
        ...input,
        fechaExpiracion: input.fechaExpiracion?.toISOString(),
      });
      const { data } = await this.http.patch<FastUpload>(`/uploads/${id}`, payload);
      return toUpload(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Elimina un upload en FastAPI.
   */
  async deleteUpload(id: number): Promise<void> {
    try {
      await this.http.delete(`/uploads/${id}`);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene uploads de un usuario específico desde FastAPI.
   */
  async getUploadsByUsuario(usuarioId: number, categoria?: CategoriaUpload): Promise<Upload[]> {
    try {
      const params = categoria ? { categoria } : {};
      const { data } = await this.http.get<FastUpload[]>(`/uploads/usuario/${usuarioId}`, { params });
      return data.map(toUpload);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene uploads de una entidad específica desde FastAPI.
   */
  async getUploadsByEntidad(entidadId: number, tipoEntidad: string): Promise<Upload[]> {
    try {
      const params = { tipo_entidad: tipoEntidad };
      const { data } = await this.http.get<FastUpload[]>(`/uploads/entidad/${entidadId}`, { params });
      return data.map(toUpload);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Busca upload por hash desde FastAPI.
   */
  async findByHash(hashArchivo: string): Promise<Upload | undefined> {
    try {
      const { data } = await this.http.get<FastUpload>(`/uploads/hash/${hashArchivo}`);
      return toUpload(data);
    } catch (e: any) {
      if (e.response?.status === 404) {
        return undefined;
      }
      throw httpError(e);
    }
  }

  /**
   * Marca upload como procesado en FastAPI.
   */
  async markAsProcessed(id: number, url: string, thumbnailUrl?: string, metadatos?: any): Promise<Upload> {
    try {
      const payload = {
        url,
        thumbnail_url: thumbnailUrl,
        metadatos,
        estado: 'completado'
      };
      const { data } = await this.http.post<FastUpload>(`/uploads/${id}/processed`, payload);
      return toUpload(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Marca upload como error en FastAPI.
   */
  async markAsError(id: number, error: string): Promise<Upload> {
    try {
      const payload = { error, estado: 'error' };
      const { data } = await this.http.post<FastUpload>(`/uploads/${id}/error`, payload);
      return toUpload(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene uploads expirados desde FastAPI.
   */
  async getExpiredUploads(): Promise<Upload[]> {
    try {
      const { data } = await this.http.get<FastUpload[]>(`/uploads/expired`);
      return data.map(toUpload);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene estadísticas de uploads desde FastAPI.
   */
  async getStats(usuarioId?: number): Promise<{
    totalArchivos: number;
    tamanototal: number;
    porTipo: Record<TipoArchivo, number>;
    porCategoria: Record<CategoriaUpload, number>;
  }> {
    try {
      const params = usuarioId ? { usuario_id: usuarioId } : {};
      const { data } = await this.http.get(`/uploads/stats`, { params });
      
      return {
        totalArchivos: data.total_archivos,
        tamanototal: data.tamano_total,
        porTipo: data.por_tipo,
        porCategoria: data.por_categoria,
      };
    } catch (e) {
      throw httpError(e);
    }
  }
}
