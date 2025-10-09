// src/horarios/interfaces/controllers/horariosControllers.ts
import { Request, Response } from "express";
import {
  HorarioCreate,
  HorarioUpdate,
  HorarioListQuery,
} from "../../types/horariosTypes";
import { HorariosService } from "../../services/horariosServices";

export class HorariosController {
  private service = new HorariosService();

  // GET /horarios
  listar = async (req: Request, res: Response) => {
    try {
      const query: HorarioListQuery = {
        id_cancha: req.query.id_cancha as string,
        id_complejo: req.query.id_complejo as string,
        dia_semana: req.query.dia_semana as any,
        activo: typeof req.query.activo !== "undefined"
          ? req.query.activo === "true"
          : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      };
      const list = await this.service.listar(query);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al listar horarios" });
    }
  };

  // GET /horarios/:id
  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.obtener(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al obtener horario" });
    }
  };

  // POST /horarios
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as HorarioCreate;
      if (!body?.id_cancha || body?.inicio == null || body?.fin == null || body?.dia_semana == null) {
        return res.status(400).json({ error: "id_cancha, dia_semana, inicio y fin son requeridos" });
      }
      const created = await this.service.crear(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al crear horario" });
    }
  };

  // PUT /horarios/:id
  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as HorarioUpdate;
      const updated = await this.service.actualizar(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al actualizar horario" });
    }
  };

  // DELETE /horarios/:id
  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminar(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al eliminar horario" });
    }
  };

  // PATCH /horarios/:id/activar
  activar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.activar(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al activar horario" });
    }
  };

  // PATCH /horarios/:id/desactivar
  desactivar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.desactivar(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al desactivar horario" });
    }
  };
}
