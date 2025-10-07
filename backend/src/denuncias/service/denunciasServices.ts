// src/denuncias/service/denunciasServices.ts
import axios from "axios";
import {
  Denuncia,
  DenunciaCreate,
  DenunciaUpdate,
  DenunciaListQuery,
} from "../types/denunciasTypes";

const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

export class DenunciasService {
  async listar(params?: DenunciaListQuery): Promise<Denuncia[]> {
    const { data } = await axios.get(`${API_BASE}/denuncias`, { params });
    return data;
  }

  async obtener(id: string | number): Promise<Denuncia> {
    const { data } = await axios.get(`${API_BASE}/denuncias/${id}`);
    return data;
  }

  async crear(payload: DenunciaCreate): Promise<Denuncia> {
    const { data } = await axios.post(`${API_BASE}/denuncias`, payload);
    return data;
  }

  async actualizar(id: string | number, payload: DenunciaUpdate): Promise<Denuncia> {
    const { data } = await axios.put(`${API_BASE}/denuncias/${id}`, payload);
    return data;
  }

  async eliminar(id: string | number): Promise<void> {
    await axios.delete(`${API_BASE}/denuncias/${id}`);
  }

  async cambiarEstado(id: string | number, estado: Denuncia["estado"]): Promise<Denuncia> {
    const { data } = await axios.patch(`${API_BASE}/denuncias/${id}/estado`, { estado });
    return data;
  }
}
