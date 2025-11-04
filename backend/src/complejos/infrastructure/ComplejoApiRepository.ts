import { AxiosInstance } from "axios";
import { ComplejoRepository, ComplejoFilters, CreateComplejoInput, UpdateComplejoInput } from "../domain/ComplejoRepository";
import { Complejo, EstadoComplejo } from "../../domain/complejo/Complejo";
import { toComplejo, FastComplejo } from "./mappers";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";
import { toSnake } from "../../app/common/case";

/**
 * Implementación del repositorio de complejos utilizando FastAPI como backend.
 * Maneja la comunicación HTTP con el servicio de complejos y convierte entre formatos.
 */
export class ComplejoApiRepository implements ComplejoRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista complejos desde FastAPI con paginación y filtros.
   * @param filters - Parámetros de filtrado y paginación
   * @returns Promise con complejos paginados
   */
  async listComplejos(filters: ComplejoFilters): Promise<Paginated<Complejo>> {
    try {
      // Convertir filtros a snake_case para FastAPI
      const params = toSnake(filters);
      const { data } = await this.http.get(`/complejos`, { params });
      return normalizePage<Complejo>(data, x => toComplejo(x as FastComplejo));
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene un complejo específico desde FastAPI.
   * @param id - ID del complejo
   * @returns Promise con el complejo encontrado
   */
  async getComplejo(id: number): Promise<Complejo> {
    try {
      const { data } = await this.http.get<FastComplejo>(`/complejos/${id}`);
      return toComplejo(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Crea un nuevo complejo en FastAPI.
   * @param input - Datos del complejo a crear
   * @returns Promise con el complejo creado
   */
  async createComplejo(input: CreateComplejoInput): Promise<Complejo> {
    try {
      const payload = toSnake(input);
      const { data } = await this.http.post<FastComplejo>(`/complejos`, payload);
      return toComplejo(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Actualiza un complejo en FastAPI.
   * @param id - ID del complejo
   * @param input - Datos a actualizar
   * @returns Promise con el complejo actualizado
   */
  async updateComplejo(id: number, input: UpdateComplejoInput): Promise<Complejo> {
    try {
      const payload = toSnake(input);
      const { data } = await this.http.patch<FastComplejo>(`/complejos/${id}`, payload);
      return toComplejo(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Elimina un complejo en FastAPI.
   * @param id - ID del complejo a eliminar
   */
  async deleteComplejo(id: number): Promise<void> {
    try {
      await this.http.delete(`/complejos/${id}`);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Cambia el estado de un complejo en FastAPI.
   * @param id - ID del complejo
   * @param estado - Nuevo estado
   * @returns Promise con el complejo actualizado
   */
  async cambiarEstado(id: number, estado: EstadoComplejo): Promise<Complejo> {
    try {
      const { data } = await this.http.patch<FastComplejo>(`/complejos/${id}/estado`, { estado });
      return toComplejo(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene complejos de un dueño específico desde FastAPI.
   * @param duenioId - ID del dueño
   * @returns Promise con lista de complejos
   */
  async getComplejosByDuenio(duenioId: number): Promise<Complejo[]> {
    try {
      console.log(`[ComplejoApiRepository] 🔍 Obteniendo complejos del dueño ID: ${duenioId}`);
      console.log(`[ComplejoApiRepository] 📡 Llamando a: GET /complejos/duenio/${duenioId}`);
      console.log(`[ComplejoApiRepository] 🌐 Base URL del cliente:`, this.http.defaults.baseURL);
      
      const { data } = await this.http.get<FastComplejo[]>(`/complejos/duenio/${duenioId}`);
      
      console.log(`[ComplejoApiRepository] ✅ Respuesta recibida:`, data);
      console.log(`[ComplejoApiRepository] 📊 Cantidad de complejos: ${data.length}`);
      
      const mapped = data.map(toComplejo);
      console.log(`[ComplejoApiRepository] 🗺️ Complejos mapeados:`, mapped);
      
      return mapped;
    } catch (e: any) {
      console.error(`[ComplejoApiRepository] ❌ Error obteniendo complejos del dueño ${duenioId}:`, e.message);
      console.error(`[ComplejoApiRepository] 📊 Status:`, e.response?.status);
      console.error(`[ComplejoApiRepository] 📊 Data:`, e.response?.data);
      throw httpError(e);
    }
  }
}
