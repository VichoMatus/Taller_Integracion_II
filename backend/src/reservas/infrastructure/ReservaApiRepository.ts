import { AxiosInstance } from "axios";
import { ReservaRepository, ReservaFilters, CreateReservaInput, UpdateReservaInput, DisponibilidadInput, CotizacionInput } from "../domain/ReservaRepository";
import { Reserva, MetodoPago, CotizacionReserva } from "../../domain/reserva/Reserva";
import { toReserva, FastReserva } from "./mappers";
import { httpError } from "../../infra/http/errors";
import { Paginated, normalizePage } from "../../app/common/pagination";
import { toSnake } from "../../app/common/case";

/**
 * Implementación del repositorio de reservas utilizando FastAPI como backend.
 * Maneja la comunicación HTTP con el servicio de reservas y convierte entre formatos.
 */
export class ReservaApiRepository implements ReservaRepository {
  constructor(private http: AxiosInstance) {}

  /**
   * Lista reservas desde FastAPI con paginación y filtros.
   */
  async listReservas(filters: ReservaFilters): Promise<Paginated<Reserva>> {
    try {
      const params = toSnake({
        ...filters,
        fechaDesde: filters.fechaDesde?.toISOString(),
        fechaHasta: filters.fechaHasta?.toISOString(),
      });
      const { data } = await this.http.get(`/reservas`, { params });
      return normalizePage<Reserva>(data, x => toReserva(x as FastReserva));
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene una reserva específica desde FastAPI.
   */
  async getReserva(id: number): Promise<Reserva> {
    try {
      const { data } = await this.http.get<FastReserva>(`/reservas/${id}`);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Crea una nueva reserva en FastAPI.
   */
  async createReserva(input: CreateReservaInput): Promise<Reserva> {
    try {
      const payload = toSnake({
        ...input,
        fechaInicio: input.fechaInicio.toISOString(),
        fechaFin: input.fechaFin.toISOString(),
      });
      const { data } = await this.http.post<FastReserva>(`/reservas`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Actualiza una reserva en FastAPI.
   */
  async updateReserva(id: number, input: UpdateReservaInput): Promise<Reserva> {
    try {
      const payload = toSnake({
        ...input,
        fechaInicio: input.fechaInicio?.toISOString(),
        fechaFin: input.fechaFin?.toISOString(),
      });
      const { data } = await this.http.patch<FastReserva>(`/reservas/${id}`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Elimina una reserva en FastAPI.
   */
  async deleteReserva(id: number): Promise<void> {
    try {
      await this.http.delete(`/reservas/${id}`);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Verifica disponibilidad de una cancha en FastAPI.
   */
  async verificarDisponibilidad(input: DisponibilidadInput): Promise<boolean> {
    try {
      const payload = {
        cancha_id: input.canchaId,
        fecha_inicio: input.fechaInicio.toISOString(),
        fecha_fin: input.fechaFin.toISOString(),
        ...(input.reservaId && { reserva_id: input.reservaId }),
      };
      
      const { data } = await this.http.post<{ disponible: boolean }>(`/reservas/verificar-disponibilidad`, payload);
      return data.disponible;
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Obtiene reservas de un usuario específico desde FastAPI.
   */
  async getReservasByUsuario(usuarioId: number, incluirPasadas = false): Promise<Reserva[]> {
    try {
      const params = { incluir_pasadas: incluirPasadas };
      const { data } = await this.http.get<FastReserva[]>(`/reservas/usuario/${usuarioId}`, { params });
      return data.map(toReserva);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Confirma el pago de una reserva en FastAPI.
   */
  async confirmarPago(id: number, metodoPago: MetodoPago): Promise<Reserva> {
    try {
      const payload = { metodo_pago: metodoPago };
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/confirmar-pago`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Cancela una reserva en FastAPI.
   */
  async cancelarReserva(id: number, motivo?: string): Promise<Reserva> {
    try {
      const payload = motivo ? { motivo } : {};
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/cancelar`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Cotiza el precio de una reserva en FastAPI.
   */
  async cotizarReserva(input: CotizacionInput): Promise<CotizacionReserva> {
    try {
      const payload = toSnake({
        ...input,
        canchaId: input.canchaId
      });
      const { data } = await this.http.post<any>(`/reservas/cotizar`, payload);
      return data; // Asumir que FastAPI retorna en formato correcto
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Marca asistencia del usuario a la reserva.
   */
  async checkInReserva(id: number): Promise<Reserva> {
    try {
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/check-in`, {});
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }

  /**
   * Marca inasistencia del usuario a la reserva.
   */
  async noShowReserva(id: number, observaciones?: string): Promise<Reserva> {
    try {
      const payload = observaciones ? { observaciones } : {};
      const { data } = await this.http.post<FastReserva>(`/reservas/${id}/no-show`, payload);
      return toReserva(data);
    } catch (e) {
      throw httpError(e);
    }
  }
}
