import { Request, Response } from "express";
import axios from "axios";

const FASTAPI_URL = process.env.API_BASE_URL || 'http://api-h1d7oi-a881cc-168-232-167-73.traefik.me';

export class NotificacionController {
  crear = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;
      const response = await axios.post(
        `${FASTAPI_URL}/api/v1/notificaciones`,
        req.body,
        { headers: { Authorization: token } }
      );
      res.status(201).json(response.data);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al crear notificación" });
    }
  };


  listar = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;
      const { solo_no_leidas } = req.query;
      const response = await axios.get(`${FASTAPI_URL}/api/v1/notificaciones`, {
        headers: { Authorization: token },
        params: { solo_no_leidas }
      });
      res.json(response.data);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al listar notificaciones" });
    }
  };

  obtener = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;
      const { id } = req.params;
      const response = await axios.get(`${FASTAPI_URL}/api/v1/notificaciones/${id}`, {
        headers: { Authorization: token }
      });
      res.json(response.data);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al obtener notificación" });
    }
  };

  actualizar = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;
      const { id } = req.params;
      const response = await axios.put(
        `${FASTAPI_URL}/api/v1/notificaciones/${id}`,
        req.body,
        { headers: { Authorization: token } }
      );
      res.json(response.data);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al actualizar notificación" });
    }
  };

  eliminar = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;
      const { id } = req.params;
      await axios.delete(`${FASTAPI_URL}/api/v1/notificaciones/${id}`, {
        headers: { Authorization: token }
      });
      res.status(204).send();
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al eliminar notificación" });
    }
  };

  marcarLeida = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;
      const { id } = req.params;
      const response = await axios.post(
        `${FASTAPI_URL}/api/v1/notificaciones/${id}/leer`,
        {},
        { headers: { Authorization: token } }
      );
      res.json(response.data);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al marcar como leída" });
    }
  };

  marcarTodasLeidas = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;
      const response = await axios.post(
        `${FASTAPI_URL}/api/v1/notificaciones/leer-todas`,
        {},
        { headers: { Authorization: token } }
      );
      res.json(response.data);
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al marcar todas como leídas" });
    }
  };

  contarNoLeidas = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;
      const response = await axios.get(`${FASTAPI_URL}/api/v1/notificaciones`, {
        headers: { Authorization: token },
        params: { solo_no_leidas: true }
      });
      const count = Array.isArray(response.data) ? response.data.length : 0;
      res.json({ count });
    } catch (err: any) {
      res.status(err?.response?.status || 500).json({ error: err?.message || "Error al contar no leídas" });
    }
  };
}