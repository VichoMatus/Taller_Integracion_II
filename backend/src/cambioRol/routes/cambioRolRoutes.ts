import { Router } from "express";
import { CambioRolController } from "../interfaces/controllers/cambioRolControllers";

/**
 * Rutas para cambio de rol de usuarios.
 * Montar este router sobre `/api/admin/usuarios`.
 */
const router = Router();
const controller = new CambioRolController();

// Promocionar el rol de un usuario
router.post("/:id_usuario/rol", (req, res) => controller.promover(req, res));

// Degradar el rol de un usuario
router.post("/:id_usuario/rol/demote", (req, res) => controller.degradar(req, res));

export default router;
