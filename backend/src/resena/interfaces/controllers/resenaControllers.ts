// src/interfaces/controllers/resenaControllers.ts
import { Request, Response } from "express";
import {
  ResenaCreateRequest,
  ResenaUpdateRequest,
  ResenaListQuery,
} from "../../types/resenaTypes";
import { ResenaService } from "../../services/resenaService";

export class ResenaController {
  private service = new ResenaService();

  // POST /resenas
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as ResenaCreateRequest;

      // Validaciones básicas (puedes reemplazar por zod/joi)
      if (!body?.id_usuario || !body?.id_cancha || typeof body?.calificacion !== "number") {
        return res.status(400).json({ error: "id_usuario, id_cancha y calificacion son requeridos" });
      }
      if (body.calificacion < 1 || body.calificacion > 5) {
        return res.status(400).json({ error: "calificacion debe estar entre 1 y 5" });
      }

      const created = await this.service.crearResena(body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear reseña" });
    }
  };

  // GET /resenas
  listar = async (req: Request, res: Response) => {
    try {
      const query: ResenaListQuery = {
        id_usuario: req.query.id_usuario as string,
        id_cancha: req.query.id_cancha as string,
        calificacion_min: req.query.calificacion_min ? Number(req.query.calificacion_min) : undefined,
        calificacion_max: req.query.calificacion_max ? Number(req.query.calificacion_max) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      };

      if (query.calificacion_min && (query.calificacion_min < 1 || query.calificacion_min > 5)) {
        return res.status(400).json({ error: "calificacion_min debe estar entre 1 y 5" });
      }
      if (query.calificacion_max && (query.calificacion_max < 1 || query.calificacion_max > 5)) {
        return res.status(400).json({ error: "calificacion_max debe estar entre 1 y 5" });
      }

      const list = await this.service.listarResenas(query);
      res.json(list);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar reseñas" });
    }
  };

  // GET /resenas/:id
  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const entity = await this.service.obtenerResena(id);
      res.json(entity);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al obtener reseña" });
    }
  };

  // PUT /resenas/:id
  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as ResenaUpdateRequest;

      if (typeof body.calificacion === "number" && (body.calificacion < 1 || body.calificacion > 5)) {
        return res.status(400).json({ error: "calificacion debe estar entre 1 y 5" });
      }

      const updated = await this.service.actualizarResena(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al actualizar reseña" });
    }
  };

  // DELETE /resenas/:id
  eliminar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.eliminarResena(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al eliminar reseña" });
    }
  };

  // GET /resenas/promedio?id_cancha=...
  promedio = async (req: Request, res: Response) => {
    try {
      const id_cancha = req.query.id_cancha as string;
      if (!id_cancha) {
        return res.status(400).json({ error: "id_cancha es requerido" });
      }
      const resumen = await this.service.promedioPorCancha(id_cancha);
      res.json(resumen);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al obtener promedio" });
    }
  };
}
