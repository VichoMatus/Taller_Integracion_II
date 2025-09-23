// src/favorito/route/favoritoRoute.ts
import { Router } from "express";
import { FavoritoController } from "../interfaces/controllers/favoritosControllers";

const router = Router();
const controller = new FavoritoController();

/**
 * Montar en app:
 * app.use("/api/favoritos", favoritoRouter)
 */

// Crear favorito (id_usuario, id_cancha)
router.post("/", controller.crear);

// Listar favoritos (por usuario, por cancha, paginado)
router.get("/", controller.listar);

// Obtener uno por id
router.get("/:id", controller.obtener);

// Eliminar por id
router.delete("/:id", controller.eliminar);

// Eliminar por clave compuesta (id_usuario + id_cancha)
router.delete("/", controller.eliminarPorClave);

// ¿Es favorito? (boolean + eco de ids)
router.get("/es-favorito", controller.esFavorito);

// Contar favoritos de un usuario
router.get("/count", controller.contarPorUsuario);

export default router;
