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
    
    // Extraer token del header de autorización
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    
    if (!body || !body.rol) {
        return res.status(400).json({ error: "El campo rol es obligatorio." });
    }
    
    if (!token) {
      return res.status(401).json({ error: "Token de autenticación requerido." });
    }
    
    try {
      const usuario = await cambioRolService.promover(id_usuario, body, token);
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
    
    // Extraer token del header de autorización
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    
    if (!body || !body.rol) {
      return res.status(400).json({ error: "El campo rol es obligatorio." });
    }
    
    if (!token) {
      return res.status(401).json({ error: "Token de autenticación requerido." });
    }
    
    try {
      const usuario = await cambioRolService.degradar(id_usuario, body, token);
      return res.json(usuario);
    } catch (err: any) {
      return res.status(err?.status || err?.response?.status || 500).json({
        error: err?.message || err?.response?.data?.error || "Error al degradar rol",
      });
    }
  }
}
