// src/horarios/service/horariosServices.ts
import axios from "axios";
import {
  Horario,
  HorarioCreate,
  HorarioUpdate,
  HorarioListQuery,
} from "../types/horariosTypes";

// BFF -> llama al backend real
const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

export class HorariosService {
  async listar(params?: HorarioListQuery): Promise<Horario[]> {
    const { data } = await axios.get(`${API_BASE}/horarios`, { params });
    return data;
    // Si tu backend devuelve paginado, tipa Page<Horario> y ajusta aquí.
  }

  async obtener(id: string | number): Promise<Horario> {
    const { data } = await axios.get(`${API_BASE}/horarios/${id}`);
    return data;
  }

  async crear(payload: HorarioCreate): Promise<Horario> {
    const { data } = await axios.post(`${API_BASE}/horarios`, payload);
    return data;
  }

  async actualizar(id: string | number, payload: HorarioUpdate): Promise<Horario> {
    const { data } = await axios.put(`${API_BASE}/horarios/${id}`, payload);
    return data;
  }

  async eliminar(id: string | number): Promise<void> {
    await axios.delete(`${API_BASE}/horarios/${id}`);
  }

  async activar(id: string | number): Promise<Horario> {
    const { data } = await axios.patch(`${API_BASE}/horarios/${id}/activar`);
    return data;
  }

  async desactivar(id: string | number): Promise<Horario> {
    const { data } = await axios.patch(`${API_BASE}/horarios/${id}/desactivar`);
    return data;
  }
}
