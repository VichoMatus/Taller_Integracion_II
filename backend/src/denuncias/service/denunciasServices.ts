// src/denuncias/service/denunciasServices.ts
import axios from "axios";
import {
  Denuncia,
  DenunciaCreate,
  DenunciaUpdate,
  DenunciaListQuery,
} from "../types/denunciasTypes";

// URL del taller4 backend - SIEMPRE usar la API subida
const API_BASE = "http://api-h1d7oi-a881cc-168-232-167-73.traefik.me/api/v1";

export class DenunciasService {
  /**
   * Listar mis denuncias (usuario autenticado)
   */
  async listarMias(token: string): Promise<Denuncia[]> {
    const { data } = await axios.get(`${API_BASE}/denuncias/mias`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  }

  /**
   * Crear nueva denuncia
   */
  async crear(payload: DenunciaCreate, token: string): Promise<Denuncia> {
    const { data } = await axios.post(`${API_BASE}/denuncias`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  }

  /**
   * Listar todas las denuncias (solo admin)
   */
  async listarAdmin(params: DenunciaListQuery, token: string): Promise<Denuncia[]> {
    const { data } = await axios.get(`${API_BASE}/denuncias/admin`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  }

  /**
   * Ver detalle de una denuncia (solo admin)
   */
  async obtenerAdmin(id: number, token: string): Promise<Denuncia> {
    const { data } = await axios.get(`${API_BASE}/denuncias/admin/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  }

  /**
   * Actualizar estado de una denuncia (solo admin)
   */
  async actualizarAdmin(id: number, payload: DenunciaUpdate, token: string): Promise<Denuncia> {
    const { data } = await axios.put(`${API_BASE}/denuncias/admin/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  }
}
