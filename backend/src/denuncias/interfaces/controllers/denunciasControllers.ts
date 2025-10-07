// src/denuncias/interfaces/controllers/denunciasControllers.ts
import { Request, Response } from "express";
import {
  DenunciaCreate,
  DenunciaUpdate,
  DenunciaListQuery,
  DenunciaEstado,
} from "../../types/denunciasTypes";
import { DenunciasService } from "../../service/denunciasServices";

export class DenunciasController {
  private service = new DenunciasService();

  // GET /denuncias
  listar = async (req: Request, res: Response) => {
    try {
      const query: DenunciaListQuery = {
        id_usuario_reporta: req.query.id_usuario_reporta as string,
        id_usuario_denunciado: req.query.id_usuario_denunciado as string,
        id_reserva: req.query.id_reserva as string,
        id_cancha: req.query.id_cancha as string,
        estado: req.query.estado as DenunciaEstado,
        categoria: req.query.categoria as string,
        desde: req.query.desde as string,
        hasta: req.query.hasta as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      };
      const list = await this.service.listar(query);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al listar denuncias" });
    }
  };

  // GET /denuncias/:id
  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.obtener(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al obtener denuncia" });
    }
  };

  // POST /denuncias
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as DenunciaCreate;
      if (!body?.id_usuario_reporta || !body?.asunto || !body?.descripcion) {
        return res.status(400).json({ error: "id_usuario_reporta, asunto y descripcion son requeridos" });
      }
      const created = await this.service.crear(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al crear denuncia" });
    }
  };

  // PUT /denuncias/:id
  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as DenunciaUpdate;
      const updated = await this.service.actualizar(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al actualizar denuncia" });
    }
  };

  // DELETE /denuncias/:id
  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminar(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al eliminar denuncia" });
    }
  };

  // PATCH /denuncias/:id/estado
  cambiarEstado = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { estado } = req.body as { estado: DenunciaEstado };
      if (!estado) {
        return res.status(400).json({ error: "estado es requerido" });
      }
      const updated = await this.service.cambiarEstado(id, estado);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ error: err?.message || "Error al cambiar estado" });
    }
  };
}
