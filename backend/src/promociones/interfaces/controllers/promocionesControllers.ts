// src/promociones/interfaces/controllers/promocionesControllers.ts
import { Request, Response } from "express";
import {
  PromocionCreate,
  PromocionUpdate,
  PromocionListQuery,
  PromoEvalRequest,
} from "../../types/promocionesTypes";
import { PromocionesService } from "../../services/promocionesServices";

export class PromocionesController {
  private service = new PromocionesService();

  // GET /promociones
  listar = async (req: Request, res: Response) => {
    try {
      const query: PromocionListQuery = {
        q: req.query.q as string,
        estado: req.query.estado as any,
        id_cancha: req.query.id_cancha as string,
        id_complejo: req.query.id_complejo as string,
        vigentes: typeof req.query.vigentes !== "undefined"
          ? req.query.vigentes === "true"
          : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      };
      const list = await this.service.listar(query);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.message || "Error al listar promociones",
      });
    }
  };

  // GET /promociones/:id
  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.obtener(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.message || "Error al obtener promoción",
      });
    }
  };

  // POST /promociones
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as PromocionCreate;

      if (!body?.nombre || !body?.tipo || typeof body?.valor !== "number") {
        return res.status(400).json({ error: "nombre, tipo y valor son requeridos" });
      }
      if (!body?.fecha_inicio || !body?.fecha_fin) {
        return res.status(400).json({ error: "fecha_inicio y fecha_fin son requeridas" });
      }

      const created = await this.service.crear(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.message || "Error al crear promoción",
      });
    }
  };

  // PUT /promociones/:id
  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as PromocionUpdate;
      const updated = await this.service.actualizar(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.message || "Error al actualizar promoción",
      });
    }
  };

  // DELETE /promociones/:id
  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminar(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.message || "Error al eliminar promoción",
      });
    }
  };

  // PATCH /promociones/:id/activar
  activar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.activar(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.message || "Error al activar promoción",
      });
    }
  };

  // PATCH /promociones/:id/desactivar
  desactivar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.desactivar(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.message || "Error al desactivar promoción",
      });
    }
  };

  // POST /promociones/evaluar
  evaluar = async (req: Request, res: Response) => {
    try {
      const body = req.body as PromoEvalRequest;
      if (!body?.id_promocion || typeof body?.precio_base !== "number") {
        return res.status(400).json({ error: "id_promocion y precio_base son requeridos" });
      }
      const result = await this.service.evaluar(body);
      res.json(result);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({
        error: err?.message || "Error al evaluar promoción",
      });
    }
  };
}
