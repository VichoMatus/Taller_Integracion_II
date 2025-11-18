// src/denuncias/route/denunciasRoutes.ts
import { Router } from "express";
import { DenunciasController } from "../interfaces/controllers/denunciasControllers";

const router = Router();
const controller = new DenunciasController();

/**
 * Montar en app:
 * app.use("/api/denuncias", denunciasRouter)
 * 
 * Rutas que coinciden con taller4/backend (schema simplificado)
 */

// Rutas de usuario
router.get("/mias", controller.listarMias);           // GET /api/denuncias/mias
router.post("/", controller.crear);                   // POST /api/denuncias

// Rutas de admin
router.get("/admin", controller.listarAdmin);         // GET /api/denuncias/admin
router.get("/admin/:id", controller.obtenerAdmin);    // GET /api/denuncias/admin/:id
router.put("/admin/:id", controller.actualizarAdmin); // PUT /api/denuncias/admin/:id

export default router;
