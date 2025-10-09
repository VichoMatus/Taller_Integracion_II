// src/services/horariosService.ts
import api from "@/config/backend";
import { handleApiError } from "../services/ApiError";
import { Horario, HorarioCreate, HorarioUpdate, HorarioListQuery } from "@/types/horarios";

export const horariosService = {
  async listar(params?: HorarioListQuery): Promise<Horario[]> {
    try {
      const { data } = await api.get<Horario[]>("/horarios", { params });
      return data;
    } catch (e) { handleApiError(e); }
  },
  async obtener(id: string | number): Promise<Horario> {
    try {
      const { data } = await api.get<Horario>(`/horarios/${id}`);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async crear(payload: HorarioCreate): Promise<Horario> {
    try {
      const { data } = await api.post<Horario>("/horarios", payload);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async actualizar(id: string | number, payload: HorarioUpdate): Promise<Horario> {
    try {
      const { data } = await api.put<Horario>(`/horarios/${id}`, payload);
      return data;
    } catch (e) { handleApiError(e); }
  },
  async eliminar(id: string | number): Promise<void> {
    try {
      await api.delete(`/horarios/${id}`);
    } catch (e) { handleApiError(e); }
  },
};
