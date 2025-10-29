import { Request, Response } from "express";
import { CambioRolRequest } from "../../types/cambioRolTypes";
import { cambioRolService } from "../../services/cambioRolServices";

/**
 * Controlador para operaciones de cambio de rol de usuarios.
 */
export class CambioRolController {
  async promover(req: Request, res: Response): Promise<Response> {
    const { id_usuario } = req.params;
    const body = req.body as CambioRolRequest;
    if (!body || !body.rol) {
        return res.status(400).json({ error: "El campo rol es obligatorio." });
    }
    try {
      const usuario = await cambioRolService.promover(id_usuario, body);
      return res.json(usuario);
    } catch (err: any) {
      // Al no usar ApiError, aseguramos un código genérico si no viene del backend
      return res.status(err?.status || err?.response?.status || 500).json({
        error: err?.message || err?.response?.data?.error || "Error al promover rol",
      });
    }
  }

  async degradar(req: Request, res: Response): Promise<Response> {
    const { id_usuario } = req.params;
    const body = req.body as CambioRolRequest;
    if (!body || !body.rol) {
      return res.status(400).json({ error: "El campo rol es obligatorio." });
    }
    try {
      const usuario = await cambioRolService.degradar(id_usuario, body);
      return res.json(usuario);
    } catch (err: any) {
      return res.status(err?.status || err?.response?.status || 500).json({
        error: err?.message || err?.response?.data?.error || "Error al degradar rol",
      });
    }
  }
}
