import api from "../config/backend";  // ✅ Usar backend.ts (BFF)
import { Notificacion } from "@/types/notificaciones";

export const notificacionesService = {
  
  async list(soloNoLeidas: boolean = false): Promise<Notificacion[]> {
    try {
      const params = soloNoLeidas ? { solo_no_leidas: true } : {};
      
      console.log('📡 [notificacionesService] Llamando a GET /notificaciones');
      const { data } = await api.get<Notificacion[]>('/notificaciones', { params });
      console.log('✅ [notificacionesService] Notificaciones recibidas:', data);
      
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('❌ Error listando notificaciones:', err);
      return [];
    }
  },

  async marcarLeida(id: number): Promise<Notificacion | null> {
    try {
      const { data } = await api.post<Notificacion>(`/notificaciones/${id}/leer`);
      return data;
    } catch (err) {
      console.error('❌ Error marcando como leída:', err);
      return null;
    }
  },

  async marcarTodasLeidas(): Promise<boolean> {
    try {
      await api.post('/notificaciones/leer-todas');
      return true;
    } catch (err) {
      console.error('❌ Error:', err);
      return false;
    }
  },

  async remove(id: number): Promise<boolean> {
    try {
      await api.delete(`/notificaciones/${id}`);
      return true;
    } catch (err) {
      console.error('❌ Error eliminando:', err);
      return false;
    }
  }
};