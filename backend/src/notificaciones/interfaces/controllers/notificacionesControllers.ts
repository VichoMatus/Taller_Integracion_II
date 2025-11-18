// src/notificacion/interfaces/controllers/notificacionControllers.ts
import { Request, Response } from "express";
import {
  NotificacionCreateRequest,
  NotificacionUpdateRequest,
  NotificacionListQuery,
} from "../../types/notificacionesTypes";
import { NotificacionService } from "../../services/notificacionesService";

export class NotificacionController {
  private service = new NotificacionService();

  // POST /notificaciones
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as NotificacionCreateRequest;
      if (!body?.id_usuario || !body?.titulo || !body?.mensaje) {
        return res.status(400).json({ error: "id_usuario, titulo y mensaje son requeridos" });
      }
      const created = await this.service.crear(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear notificación" });
    }
  };

  // GET /notificaciones
  listar = async (req: Request, res: Response) => {
    try {
      const query: NotificacionListQuery = {
        id_usuario: req.query.id_usuario as string,
        estado: req.query.estado as any,
        tipo: req.query.tipo as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      };
      const list = await this.service.listar(query);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar notificaciones" });
    }
  };

  // GET /notificaciones/:id
  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.obtener(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al obtener notificación" });
    }
  };

  // PUT /notificaciones/:id
  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as NotificacionUpdateRequest;
      const updated = await this.service.actualizar(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al actualizar notificación" });
    }
  };

  // DELETE /notificaciones/:id
  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminar(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al eliminar notificación" });
    }
  };

  // PATCH /notificaciones/:id/leer
  marcarLeida = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await this.service.marcarLeida(id);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al marcar como leída" });
    }
  };

  // PATCH /notificaciones/leer-todas
  marcarTodasLeidas = async (req: Request, res: Response) => {
    try {
      const { id_usuario } = req.body || {};
      if (!id_usuario) {
        return res.status(400).json({ error: "id_usuario es requerido" });
      }
      const result = await this.service.marcarTodasLeidas(id_usuario);
      res.json(result);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al marcar todas como leídas" });
    }
  };

  // GET /notificaciones/no-leidas?id_usuario=...
  contarNoLeidas = async (req: Request, res: Response) => {
    try {
      const id_usuario = req.query.id_usuario as string;
      if (!id_usuario) {
        return res.status(400).json({ error: "id_usuario es requerido" });
      }
      const count = await this.service.contarNoLeidas(id_usuario);
      res.json(count);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al contar no leídas" });
    }
  };
}
