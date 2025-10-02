// src/interfaces/services/reservaService.ts
import axios from "axios";
import {
  Reserva,
  ReservaCreateRequest,
  ReservaUpdateRequest,
  DisponibilidadQuery,
  SlotDisponible,
} from "../types/reservaTypes";

// En un proyecto real, saca esto a una config/env
const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

export class ReservaService {
  async crearReserva(payload: ReservaCreateRequest): Promise<Reserva> {
    const { data } = await axios.post(`${API_BASE}/reservas`, payload);
    return data;
  }

  async listarReservas(params?: {
    id_usuario?: string | number;
    id_cancha?: string | number;
    estado?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    size?: number;
  }): Promise<Reserva[]> {
    const { data } = await axios.get(`${API_BASE}/reservas`, { params });
    return data;
  }

  async obtenerReserva(id: string | number): Promise<Reserva> {
    const { data } = await axios.get(`${API_BASE}/reservas/${id}`);
    return data;
  }

  async actualizarReserva(id: string | number, payload: ReservaUpdateRequest): Promise<Reserva> {
    const { data } = await axios.put(`${API_BASE}/reservas/${id}`, payload);
    return data;
  }

  async cancelarReserva(id: string | number, motivo?: string): Promise<Reserva> {
    const { data } = await axios.patch(`${API_BASE}/reservas/${id}/cancelar`, { motivo });
    return data;
  }

  async confirmarReserva(id: string | number): Promise<Reserva> {
    const { data } = await axios.patch(`${API_BASE}/reservas/${id}/confirmar`);
    return data;
  }

  async disponibilidad(query: DisponibilidadQuery): Promise<SlotDisponible[]> {
    const { data } = await axios.get(`${API_BASE}/reservas/disponibilidad`, { params: query });
    return data;
  }
}
