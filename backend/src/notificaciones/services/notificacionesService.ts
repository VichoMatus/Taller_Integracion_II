// src/notificacion/service/notificacionService.ts
import axios from "axios";
import {
  Notificacion,
  NotificacionCreateRequest,
  NotificacionEmailRequest,
  NotificacionListQuery,
} from "../types/notificacionesTypes";

const API_BASE = "http://api-h1d7oi-6fc869-168-232-167-73.traefik.me";

// Simulación de repositorio/base de datos - en producción esto sería una conexión real
const mockNotificaciones: Notificacion[] = [];
let idCounter = 1;

export class NotificacionService {
  async crear(payload: NotificacionCreateRequest): Promise<Notificacion> {
    const nuevaNotificacion: Notificacion = {
      id_notificacion: idCounter++,
      id_destinatario: payload.id_destinatario,
      titulo: payload.titulo,
      cuerpo: payload.cuerpo,
      leida: false,
      created_at: new Date().toISOString()
    };
    
    mockNotificaciones.push(nuevaNotificacion);
    return nuevaNotificacion;
  }

  async listarParaUsuario(id_usuario: number, query?: NotificacionListQuery): Promise<Notificacion[]> {
    let notificaciones = mockNotificaciones.filter(n => n.id_destinatario === id_usuario);
    
    if (query?.solo_no_leidas) {
      notificaciones = notificaciones.filter(n => !n.leida);
    }
    
    // Ordenar por fecha de creación descendente
    return notificaciones.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async marcarLeida(id_notificacion: number, id_usuario: number): Promise<Notificacion | null> {
    const notificacion = mockNotificaciones.find(n => 
      n.id_notificacion === id_notificacion && 
      n.id_destinatario === id_usuario
    );
    
    if (!notificacion) {
      return null;
    }
    
    notificacion.leida = true;
    return notificacion;
  }

  async marcarTodasLeidas(id_usuario: number): Promise<number> {
    const notificacionesUsuario = mockNotificaciones.filter(n => 
      n.id_destinatario === id_usuario && !n.leida
    );
    
    notificacionesUsuario.forEach(n => n.leida = true);
    return notificacionesUsuario.length;
  }

  async crearYEnviarEmail(payload: NotificacionEmailRequest): Promise<Notificacion> {
    // Primero crear la notificación
    const notificacion = await this.crear(payload);
    
    // Aquí iría la lógica para enviar email
    // Por ahora solo simulamos que se envía
    console.log(`Enviando email a usuario ${payload.id_destinatario}:`);
    console.log(`Asunto: ${payload.titulo}`);
    console.log(`Cuerpo: ${payload.cuerpo}`);
    
    return notificacion;
  }
}
