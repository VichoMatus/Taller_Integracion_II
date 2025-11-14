import api from "../config/backend";
import { Notificacion } from "@/types/notificaciones";

export const notificacionesService = {
  
  // Listar notificaciones del usuario autenticado
  async list(soloNoLeidas: boolean = false): Promise<Notificacion[]> {
    try {
      const params = soloNoLeidas ? { solo_no_leidas: true } : {};
      
      const { data } = await api.get<Notificacion[]>('/api/v1/notificaciones', { params });
      
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('❌ Error listando notificaciones:', err);
      return [];
    }
  },

  // Marcar una notificación como leída
  async marcarLeida(id: number): Promise<Notificacion | null> {
    try {
      const { data } = await api.post<Notificacion>(`/api/v1/notificaciones/${id}/leer`);
      return data;
    } catch (err) {
      console.error('❌ Error marcando como leída:', err);
      return null;
    }
  },

  // Marcar todas las notificaciones como leídas
  async marcarTodasLeidas(): Promise<boolean> {
    try {
      await api.post<{ message: string }>('/api/v1/notificaciones/leer-todas');
      return true;
    } catch (err) {
      console.error('❌ Error marcando todas como leídas:', err);
      return false;
    }
  },

  // Crear notificación (solo para admin/testing)
  async crear(titulo: string, cuerpo: string, id_destinatario: number): Promise<Notificacion | null> {
    try {
      const { data } = await api.post<Notificacion>('/api/v1/notificaciones', {
        titulo,
        cuerpo,
        id_destinatario
      });
      return data;
    } catch (err) {
      console.error('❌ Error creando notificación:', err);
      return null;
    }
  },

  // Eliminar notificación
  async remove(id: number): Promise<boolean> {
    try {
      await api.delete<void>(`/api/v1/notificaciones/${id}`);
      return true;
    } catch (err) {
      console.error('❌ Error eliminando notificación:', err);
      return false;
    }
  }
};