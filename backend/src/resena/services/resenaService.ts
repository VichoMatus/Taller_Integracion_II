// src/interfaces/services/resenaService.ts
import axios from "axios";
import {
  Resena,
  ResenaCreateRequest,
  ResenaUpdateRequest,
  ResenaListQuery,
  ResumenCalificacion,
} from "../types/resenaTypes";

// Mueve a env/config en tu proyecto real
const API_BASE = "http://api-url";

export class ResenaService {
  async crearResena(payload: ResenaCreateRequest): Promise<Resena> {
    const { data } = await axios.post(`${API_BASE}/resenas`, payload);
    return data;
  }

  async listarResenas(query?: ResenaListQuery): Promise<Resena[]> {
    const { data } = await axios.get(`${API_BASE}/resenas`, { params: query });
    return data;
  }

  async obtenerResena(id: number | string): Promise<Resena> {
    const { data } = await axios.get(`${API_BASE}/resenas/${id}`);
    return data;
  }

  async actualizarResena(id: number | string, payload: ResenaUpdateRequest): Promise<Resena> {
    const { data } = await axios.put(`${API_BASE}/resenas/${id}`, payload);
    return data;
  }

  async eliminarResena(id: number | string): Promise<void> {
    await axios.delete(`${API_BASE}/resenas/${id}`);
  }

  async promedioPorCancha(id_cancha: number | string): Promise<ResumenCalificacion> {
    const { data } = await axios.get(`${API_BASE}/resenas/promedio`, { params: { id_cancha } });
    return data;
  }
}
