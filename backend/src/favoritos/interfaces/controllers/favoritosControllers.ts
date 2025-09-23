// src/favorito/interfaces/controllers/favoritoControllers.ts
import { Request, Response } from "express";
import {
  FavoritoCreateRequest,
  FavoritoListQuery,
} from "../../types/favoritoTypes";
import { FavoritoService } from "../../services/favoritosServices";

export class FavoritoController {
  private service = new FavoritoService();

  // POST /favoritos
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as FavoritoCreateRequest;
      if (!body?.id_usuario || !body?.id_cancha) {
        return res.status(400).json({ error: "id_usuario e id_cancha son requeridos" });
      }
      const created = await this.service.crear(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear favorito" });
    }
  };

  // GET /favoritos
  listar = async (req: Request, res: Response) => {
    try {
      const query: FavoritoListQuery = {
        id_usuario: req.query.id_usuario as string,
        id_cancha: req.query.id_cancha as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      };
      const list = await this.service.listar(query);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar favoritos" });
    }
  };

  // GET /favoritos/:id
  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.obtener(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al obtener favorito" });
    }
  };

  // DELETE /favoritos/:id
  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminar(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al eliminar favorito" });
    }
  };

  // DELETE /favoritos? id_usuario=&id_cancha=
  eliminarPorClave = async (req: Request, res: Response) => {
    try {
      const id_usuario = req.query.id_usuario as string;
      const id_cancha = req.query.id_cancha as string;
      if (!id_usuario || !id_cancha) {
        return res.status(400).json({ error: "id_usuario e id_cancha son requeridos" });
      }
      await this.service.eliminarPorClave(id_usuario, id_cancha);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al eliminar por clave" });
    }
  };

  // GET /favoritos/es-favorito?id_usuario=&id_cancha=
  esFavorito = async (req: Request, res: Response) => {
    try {
      const id_usuario = req.query.id_usuario as string;
      const id_cancha = req.query.id_cancha as string;
      if (!id_usuario || !id_cancha) {
        return res.status(400).json({ error: "id_usuario e id_cancha son requeridos" });
      }
      const result = await this.service.esFavorito(id_usuario, id_cancha);
      res.json(result);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al consultar es_favorito" });
    }
  };

  // GET /favoritos/count?id_usuario=
  contarPorUsuario = async (req: Request, res: Response) => {
    try {
      const id_usuario = req.query.id_usuario as string;
      if (!id_usuario) {
        return res.status(400).json({ error: "id_usuario es requerido" });
      }
      const result = await this.service.contarPorUsuario(id_usuario);
      res.json(result);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al contar favoritos" });
    }
  };
}
