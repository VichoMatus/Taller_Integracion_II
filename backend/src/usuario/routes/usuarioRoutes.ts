// src/usuario/route/usuarioRoute.ts
import { Router } from "express";
import { UsuarioController } from "../interfaces/controllers/usuarioControllers";

const router = Router();
const controller = new UsuarioController();

/**
 * Montar en app:
 * app.use("/api/usuarios", usuarioRouter)
 */

// Crear
router.post("/", controller.crear);

// Listar (filtros: q, rol, esta_activo, verificado, page, size)
router.get("/", controller.listar);

// Obtener uno por id
router.get("/:id", controller.obtener);

// Actualizar por id
router.put("/:id", controller.actualizar);

// Eliminar por id
router.delete("/:id", controller.eliminar);

// Activar/Desactivar/Verificar
router.patch("/:id/activar", controller.activar);
router.patch("/:id/desactivar", controller.desactivar);
router.patch("/:id/verificar", controller.verificar);

export default router;
