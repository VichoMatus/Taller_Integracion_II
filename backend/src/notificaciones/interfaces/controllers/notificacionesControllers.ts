// src/notificacion/interfaces/controllers/notificacionControllers.ts
import { Request, Response } from "express";
import {
  NotificacionCreateRequest,
  NotificacionEmailRequest,
  NotificacionListQuery,
  Notificacion,
} from "../../types/notificacionesTypes";
import { NotificacionService } from "../../services/notificacionesService";
import { UserPublic } from "../../../auth/types/authTypes";

interface AuthenticatedRequest extends Request {
  user?: UserPublic;
}

export class NotificacionController {
  private service = new NotificacionService();

  // GET /notificaciones - Listar notificaciones del usuario autenticado
  listar = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id_usuario) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const { solo_no_leidas } = req.query;
      const query: NotificacionListQuery = {
        solo_no_leidas: solo_no_leidas === 'true'
      };
      
      const notificaciones = await this.service.listarParaUsuario(req.user.id_usuario, query);
      res.json(notificaciones);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar notificaciones" });
    }
  };

  // POST /notificaciones - Crear notificación in-app (backend/admin)
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as NotificacionCreateRequest;
      if (!body?.id_destinatario || !body?.titulo || !body?.cuerpo) {
        return res.status(400).json({ error: "id_destinatario, titulo y cuerpo son requeridos" });
      }
      const created = await this.service.crear(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear notificación" });
    }
  };

  // POST /notificaciones/:id/leer - Marcar una notificación como leída
  marcarLeida = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id_usuario) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const { id } = req.params;
      const idNotificacion = parseInt(id);
      
      if (isNaN(idNotificacion)) {
        return res.status(400).json({ error: "ID de notificación inválido" });
      }

      const notificacion = await this.service.marcarLeida(idNotificacion, req.user.id_usuario);
      
      if (!notificacion) {
        return res.status(404).json({ error: "Notificación no encontrada" });
      }

      res.json(notificacion);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al marcar como leída" });
    }
  };

  // POST /notificaciones/leer-todas - Marcar todas las notificaciones como leídas
  marcarTodasLeidas = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id_usuario) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const count = await this.service.marcarTodasLeidas(req.user.id_usuario);
      res.json({ message: `Se marcaron ${count} notificaciones como leídas.` });
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al marcar todas como leídas" });
    }
  };

  // POST /notificaciones/email - Crear notificación y enviar correo
  crearYEnviarEmail = async (req: Request, res: Response) => {
    try {
      const body = req.body as NotificacionEmailRequest;
      if (!body?.id_destinatario || !body?.titulo || !body?.cuerpo) {
        return res.status(400).json({ error: "id_destinatario, titulo y cuerpo son requeridos" });
      }

      const notificacion = await this.service.crearYEnviarEmail(body);
      res.status(201).json(notificacion);
    } catch (err: any) {
      if (err.message?.includes("correo registrado")) {
        return res.status(400).json({ error: err.message });
      }
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear notificación y enviar email" });
    }
  };
}
