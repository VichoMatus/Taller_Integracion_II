// src/usuario/interfaces/controllers/usuarioControllers.ts
import { Request, Response } from "express";
import {
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioListQuery,
} from "../../types/usuarioTypes";
import { UsuarioService } from "../../services/usuarioService";

export class UsuarioController {
  private service = new UsuarioService();

  // POST /usuarios
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as UsuarioCreateRequest;

      if (!body?.nombre || !body?.apellido || !body?.email) {
        return res.status(400).json({ error: "nombre, apellido y email son requeridos" });
      }

      // valida que venga 'contrasena' o 'contrasena_hash' si tu backend lo exige
      if (!body.contrasena && !body.contrasena_hash && !body.google_id) {
        // si permites registro social, puedes no exigir contraseña al venir google_id
        return res.status(400).json({ error: "contrasena o contrasena_hash o google_id es requerido" });
      }

      const created = await this.service.crear(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear usuario" });
    }
  };

  // GET /usuarios
  listar = async (req: Request, res: Response) => {
    try {
      const query: UsuarioListQuery = {
        q: req.query.q as string,
        rol: req.query.rol as any,
        esta_activo: typeof req.query.esta_activo !== "undefined"
          ? req.query.esta_activo === "true"
          : undefined,
        verificado: typeof req.query.verificado !== "undefined"
          ? req.query.verificado === "true"
          : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      };

      const list = await this.service.listar(query);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar usuarios" });
    }
  };

  // GET /usuarios/:id
  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.obtener(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al obtener usuario" });
    }
  };

  // PUT /usuarios/:id
  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as UsuarioUpdateRequest;
      const updated = await this.service.actualizar(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al actualizar usuario" });
    }
  };

  // DELETE /usuarios/:id
  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminar(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al eliminar usuario" });
    }
  };

  // PATCH /usuarios/:id/activar
  activar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.activar(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al activar usuario" });
    }
  };

  // PATCH /usuarios/:id/desactivar
  desactivar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.desactivar(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al desactivar usuario" });
    }
  };

  // PATCH /usuarios/:id/verificar
  verificar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.verificar(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al verificar usuario" });
    }
  };
}
