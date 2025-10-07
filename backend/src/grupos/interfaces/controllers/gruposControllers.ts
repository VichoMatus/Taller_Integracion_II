// src/grupos/interfaces/controllers/gruposControllers.ts
import { Request, Response } from "express";
import {
  GrupoCreate,
  GrupoUpdate,
  GrupoListQuery,
  AddMiembroRequest,
  UpdateMiembroRequest,
  TransferOwnerRequest,
} from "../../types/gruposTypes";
import { GruposService } from "../../services/gruposServices";

export class GruposController {
  private service = new GruposService();

  // ===== Grupos =====
  listar = async (req: Request, res: Response) => {
    try {
      const query: GrupoListQuery = {
        q: req.query.q as string,
        id_owner: req.query.id_owner as string,
        estado: req.query.estado as any,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      };
      const list = await this.service.listar(query);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar grupos" });
    }
  };

  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.obtener(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al obtener grupo" });
    }
  };

  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as GrupoCreate;
      if (!body?.nombre || !body?.id_owner) {
        return res.status(400).json({ error: "nombre e id_owner son requeridos" });
      }
      const created = await this.service.crear(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear grupo" });
    }
  };

  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as GrupoUpdate;
      const updated = await this.service.actualizar(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al actualizar grupo" });
    }
  };

  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminar(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al eliminar grupo" });
    }
  };

  // ===== Miembros =====
  listarMiembros = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const list = await this.service.listarMiembros(id);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar miembros" });
    }
  };

  agregarMiembro = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as AddMiembroRequest;
      if (!body?.id_usuario) {
        return res.status(400).json({ error: "id_usuario es requerido" });
      }
      const created = await this.service.agregarMiembro(id, body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al agregar miembro" });
    }
  };

  actualizarMiembro = async (req: Request, res: Response) => {
    try {
      const { id, id_miembro } = req.params;
      const body = req.body as UpdateMiembroRequest;
      if (!body?.rol) {
        return res.status(400).json({ error: "rol es requerido" });
      }
      const updated = await this.service.actualizarMiembro(id, id_miembro, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al actualizar miembro" });
    }
  };

  eliminarMiembro = async (req: Request, res: Response) => {
    try {
      const { id, id_miembro } = req.params;
      await this.service.eliminarMiembro(id, id_miembro);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al eliminar miembro" });
    }
  };

  // ===== Ownership =====
  transferirOwner = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as TransferOwnerRequest;
      if (!body?.id_nuevo_owner) {
        return res.status(400).json({ error: "id_nuevo_owner es requerido" });
      }
      const updated = await this.service.transferirOwner(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al transferir ownership" });
    }
  };
}
