import { AxiosInstance } from "axios";
import { AdminRepository } from "../domain/AdminRepository";
import { Complejo } from "../../domain/complejo/Complejo";
import { Cancha } from "../../domain/cancha/Cancha";
import { ReservaOwner, EstadisticasOwner } from "../../domain/admin/Owner";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";

/**
 * Implementación del repositorio para dueños de complejos deportivos utilizando FastAPI como backend.
 * Maneja la gestión de complejos, canchas, reservas y estadísticas para owners.
 */
export class AdminApiRepository implements AdminRepository {
  constructor(private http: AxiosInstance) {}

  // =============== PANEL DEL OWNER ===============

  /**
   * Obtiene los complejos del dueño usando endpoint existente.
   */
  async getMisComplejos(ownerId: number): Promise<Complejo[]> {
    try {
      // Usar endpoint existente /complejos con filtro de dueño
      const { data } = await this.http.get(`/complejos`, { 
        params: { duenio_id: ownerId } 
      });
      return data.items || data || [];
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene las canchas del dueño usando endpoint existente.
   */
  async getMisCanchas(ownerId: number): Promise<Cancha[]> {
    try {
      // Usar endpoint existente /canchas con filtro de dueño
      const { data } = await this.http.get(`/canchas`, { 
        params: { duenio_id: ownerId } 
      });
      return data.items || data || [];
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene las reservas del dueño usando endpoint existente.
   */
  async getMisReservas(ownerId: number, params: { fecha_desde?: string; fecha_hasta?: string; estado?: string } = {}): Promise<ReservaOwner[]> {
    try {
      // Usar endpoint existente /reservas con filtro de dueño
      const { data } = await this.http.get(`/reservas`, { 
        params: { duenio_id: ownerId, ...params } 
      });
      return data.items || data || [];
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene las estadísticas del dueño - simulando con datos de reservas.
   */
  async getMisEstadisticas(ownerId: number): Promise<EstadisticasOwner> {
    try {
      // Como no hay endpoint específico, calculamos básicas con reservas
      const reservas = await this.getMisReservas(ownerId);
      const complejos = await this.getMisComplejos(ownerId);
      const canchas = await this.getMisCanchas(ownerId);
      
      return {
        ingresos_totales: reservas.reduce((sum, r) => sum + (r.precio_total || 0), 0),
        ocupacion_promedio: reservas.length > 0 ? 75 : 0, // Placeholder
        reservas_mes: reservas.filter(r => r.estado === 'confirmada').length,
        canchas_activas: canchas.length
      };
    } catch (e) { throw httpError(e); }
  }

  // =============== GESTIÓN DE COMPLEJOS ===============

  /**
   * Crea un nuevo complejo usando endpoint existente.
   */
  async createComplejo(ownerId: number, complejo: Omit<Complejo, 'id'>): Promise<Complejo> {
    try {
      const { data } = await this.http.post(`/complejos`, {
        ...complejo,
        duenio_id: ownerId
      });
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene un complejo específico usando endpoint existente.
   */
  async getComplejo(ownerId: number, complejoId: number): Promise<Complejo> {
    try {
      const { data } = await this.http.get(`/complejos/${complejoId}`);
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Actualiza un complejo usando endpoint existente.
   */
  async updateComplejo(ownerId: number, complejoId: number, updates: Partial<Complejo>): Promise<Complejo> {
    try {
      const { data } = await this.http.put(`/complejos/${complejoId}`, updates);
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Elimina un complejo usando endpoint existente.
   */
  async deleteComplejo(ownerId: number, complejoId: number): Promise<void> {
    try {
      await this.http.delete(`/complejos/${complejoId}`);
    } catch (e) { throw httpError(e); }
  }

  // =============== GESTIÓN DE CANCHAS ===============

  /**
   * Crea una nueva cancha usando endpoint existente.
   */
  async createCancha(ownerId: number, cancha: Omit<Cancha, 'id'>): Promise<Cancha> {
    try {
      const { data } = await this.http.post(`/canchas`, {
        ...cancha,
        duenio_id: ownerId
      });
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Obtiene una cancha específica usando endpoint existente.
   */
  async getCancha(ownerId: number, canchaId: number): Promise<Cancha> {
    try {
      const { data } = await this.http.get(`/canchas/${canchaId}`);
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Actualiza una cancha usando endpoint existente.
   */
  async updateCancha(ownerId: number, canchaId: number, updates: Partial<Cancha>): Promise<Cancha> {
    try {
      const { data } = await this.http.put(`/canchas/${canchaId}`, updates);
      return data;
    } catch (e) { throw httpError(e); }
  }

  /**
   * Elimina una cancha usando endpoint existente.
   */
  async deleteCancha(ownerId: number, canchaId: number): Promise<void> {
    try {
      await this.http.delete(`/canchas/${canchaId}`);
    } catch (e) { throw httpError(e); }
  }
}
