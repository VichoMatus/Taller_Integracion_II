import { AxiosInstance } from "axios";
import { CanchaRepository, CanchaFilters, CreateCanchaInput, UpdateCanchaInput } from "../domain/CanchaRepository";
import { Cancha, EstadoCancha, TipoCancha } from "../../domain/cancha/Cancha";
import { toCancha, FastCancha } from "./mappers";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";
import { toSnake } from "../../app/common/case";

/**
 * Implementación del repositorio de canchas utilizando FastAPI como backend.
 * Maneja la comunicación HTTP con el servicio de canchas y convierte entre formatos.
 */
export class CanchaApiRepository implements CanchaRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista canchas desde FastAPI con paginación y filtros.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con canchas paginadas
   */
  async listCanchas(filters: CanchaFilters): Promise<Paginated<Cancha>> {
    try {
      // Convertir filtros a snake_case para FastAPI
      const params = toSnake(filters);
      const { data } = await this.http.get(`/canchas`, { params });
      return normalizePage<Cancha>(data, x => toCancha(x as FastCancha));
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene una cancha específica desde FastAPI.
   * @param id - ID de la cancha
   * @returns Promise con la cancha encontrada
   */
  async getCancha(id: number): Promise<Cancha> {
    try {
      const { data } = await this.http.get<FastCancha>(`/canchas/${id}`);
      return toCancha(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Crea una nueva cancha en FastAPI.
   * @param input - Datos de la cancha a crear
   * @returns Promise con la cancha creada
   */
  async createCancha(input: CreateCanchaInput): Promise<Cancha> {
    try {
      const payload = toSnake(input);
      const { data } = await this.http.post<FastCancha>(`/canchas`, payload);
      return toCancha(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Actualiza una cancha en FastAPI.
   * @param id - ID de la cancha
   * @param input - Datos a actualizar
   * @returns Promise con la cancha actualizada
   */
  async updateCancha(id: number, input: UpdateCanchaInput): Promise<Cancha> {
    try {
      const payload = toSnake(input);
      const { data } = await this.http.patch<FastCancha>(`/canchas/${id}`, payload);
      return toCancha(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Elimina una cancha en FastAPI.
   * @param id - ID de la cancha a eliminar
   */
  async deleteCancha(id: number): Promise<void> {
    try {
      await this.http.delete(`/canchas/${id}`);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Cambia el estado de una cancha en FastAPI.
   * @param id - ID de la cancha
   * @param estado - Nuevo estado
   * @returns Promise con la cancha actualizada
   */
  async cambiarEstado(id: number, estado: EstadoCancha): Promise<Cancha> {
    try {
      const { data } = await this.http.patch<FastCancha>(`/canchas/${id}/estado`, { estado });
      return toCancha(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene canchas disponibles en un período desde FastAPI.
   * @param fechaInicio - Fecha y hora de inicio
   * @param fechaFin - Fecha y hora de fin
   * @param tipo - Tipo de cancha (opcional)
   * @returns Promise con lista de canchas disponibles
   */
  async getCanchasDisponibles(fechaInicio: Date, fechaFin: Date, tipo?: TipoCancha): Promise<Cancha[]> {
    try {
      const params = {
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        ...(tipo && { tipo })
      };
      
      const { data } = await this.http.get<FastCancha[]>(`/canchas/disponibles`, { params });
      return data.map(toCancha);
    } catch (e) {
      throw httpError(e);
    }
  }
}
