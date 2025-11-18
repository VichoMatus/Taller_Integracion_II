// src/denuncias/interfaces/controllers/denunciasControllers.ts
import { Request, Response } from "express";
import {
  DenunciaCreate,
  DenunciaUpdate,
  DenunciaListQuery,
  EstadoDenuncia,
  TipoObjeto,
} from "../../types/denunciasTypes";
import { DenunciasService } from "../../service/denunciasServices";

export class DenunciasController {
  private service = new DenunciasService();

  // GET /api/denuncias/mias - Mis denuncias
  listarMias = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }
      const list = await this.service.listarMias(token);
      res.json({ ok: true, data: list });
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ ok: false, error: err?.response?.data || err?.message || "Error al listar denuncias" });
    }
  };

  // POST /api/denuncias - Crear denuncia
  crear = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }
      
      const body = req.body as DenunciaCreate;
      if (!body?.tipo_objeto || !body?.id_objeto || !body?.titulo) {
        return res.status(400).json({ error: "tipo_objeto, id_objeto y titulo son requeridos" });
      }
      
      const created = await this.service.crear(body, token);
      res.status(201).json({ ok: true, data: created });
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ ok: false, error: err?.response?.data || err?.message || "Error al crear denuncia" });
    }
  };

  // GET /api/denuncias/admin - Listar todas (admin)
  listarAdmin = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }
      
      const query: DenunciaListQuery = {
        estado: req.query.estado as EstadoDenuncia,
        tipo_objeto: req.query.tipo_objeto as TipoObjeto,
      };
      
      const list = await this.service.listarAdmin(query, token);
      res.json({ ok: true, data: list });
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ ok: false, error: err?.response?.data || err?.message || "Error al listar denuncias" });
    }
  };

  // GET /api/denuncias/admin/:id - Ver detalle (admin)
  obtenerAdmin = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }
      
      const { id } = req.params;
      const entity = await this.service.obtenerAdmin(Number(id), token);
      res.json({ ok: true, data: entity });
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ ok: false, error: err?.response?.data || err?.message || "Error al obtener denuncia" });
    }
  };

  // PUT /api/denuncias/admin/:id - Actualizar estado (admin)
  actualizarAdmin = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }
      
      const { id } = req.params;
      const body = req.body as DenunciaUpdate;
      
      if (!body?.estado) {
        return res.status(400).json({ error: "estado es requerido" });
      }
      
      const updated = await this.service.actualizarAdmin(Number(id), body, token);
      res.json({ ok: true, data: updated });
    } catch (err: any) {
      res.status(err?.response?.status || 500)
         .json({ ok: false, error: err?.response?.data || err?.message || "Error al actualizar denuncia" });
    }
  };
}
