// src/promociones/service/promocionesServices.ts
import axios from "axios";
import {
  Promocion,
  PromocionCreate,
  PromocionUpdate,
  PromocionListQuery,
  PromoEvalRequest,
  PromoEvalResponse,
} from "../types/promocionesTypes";

const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

export class PromocionesService {
  async listar(params?: PromocionListQuery): Promise<Promocion[]> {
    const { data } = await axios.get(`${API_BASE}/promociones`, { params });
    return data;
  }

  async obtener(id: string | number): Promise<Promocion> {
    const { data } = await axios.get(`${API_BASE}/promociones/${id}`);
    return data;
  }

  async crear(payload: PromocionCreate): Promise<Promocion> {
    const { data } = await axios.post(`${API_BASE}/promociones`, payload);
    return data;
  }

  async actualizar(id: string | number, payload: PromocionUpdate): Promise<Promocion> {
    const { data } = await axios.put(`${API_BASE}/promociones/${id}`, payload);
    return data;
  }

  async eliminar(id: string | number): Promise<void> {
    await axios.delete(`${API_BASE}/promociones/${id}`);
  }

  async activar(id: string | number): Promise<Promocion> {
    const { data } = await axios.patch(`${API_BASE}/promociones/${id}/activar`);
    return data;
  }

  async desactivar(id: string | number): Promise<Promocion> {
    const { data } = await axios.patch(`${API_BASE}/promociones/${id}/desactivar`);
    return data;
  }

  /** Evalúa la promo contra un precio base (si tu backend lo soporta) */
  async evaluar(req: PromoEvalRequest): Promise<PromoEvalResponse> {
    const { data } = await axios.post(`${API_BASE}/promociones/evaluar`, req);
    return data;
  }
}
