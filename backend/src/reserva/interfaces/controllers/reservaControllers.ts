// src/interfaces/controllers/reservaControllers.ts
import { Request, Response } from "express";
import {
  ReservaCreateRequest,
  ReservaUpdateRequest,
  DisponibilidadQuery,
} from "../../types/reservaTypes";
import { ReservaService } from "../../services/reservaServices";

export class ReservaController {
  private service = new ReservaService();

  // POST /reservas
  crear = async (req: Request, res: Response) => {
    try {
      const body = req.body as ReservaCreateRequest;
      // Validaciones simples (puedes reemplazar por zod/joi si quieres)
      if (!body?.id_usuario || !body?.id_cancha || !body?.inicio || !body?.fin) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }
      const reserva = await this.service.crearReserva(body);
      res.status(201).json(reserva);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear reserva" });
    }
  };

  // GET /reservas
  listar = async (req: Request, res: Response) => {
    try {
      const reservas = await this.service.listarReservas({
        id_usuario: req.query.id_usuario as string,
        id_cancha: req.query.id_cancha as string,
        estado: req.query.estado as string,
        desde: req.query.desde as string,
        hasta: req.query.hasta as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
      });
      res.json(reservas);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar reservas" });
    }
  };

  // GET /reservas/:id
  obtener = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reserva = await this.service.obtenerReserva(id);
      res.json(reserva);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al obtener reserva" });
    }
  };

  // PUT /reservas/:id
  actualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as ReservaUpdateRequest;
      const updated = await this.service.actualizarReserva(id, body);
      res.json(updated);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al actualizar reserva" });
    }
  };

  // PATCH /reservas/:id/cancelar
  cancelar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body || {};
      const cancelled = await this.service.cancelarReserva(id, motivo);
      res.json(cancelled);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al cancelar reserva" });
    }
  };

  // PATCH /reservas/:id/confirmar
  confirmar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const confirmed = await this.service.confirmarReserva(id);
      res.json(confirmed);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al confirmar reserva" });
    }
  };

  // GET /reservas/disponibilidad
  disponibilidad = async (req: Request, res: Response) => {
    try {
      const query: DisponibilidadQuery = {
        id_cancha: req.query.id_cancha as string,
        fecha: req.query.fecha as string,
        desde: req.query.desde as string,
        hasta: req.query.hasta as string,
      };
      if (!query.id_cancha) {
        return res.status(400).json({ error: "id_cancha es requerido" });
      }
      const slots = await this.service.disponibilidad(query);
      res.json(slots);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al consultar disponibilidad" });
    }
  };
}
