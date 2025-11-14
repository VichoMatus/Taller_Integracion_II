// Endpoint de status para revisar conectividad del módulo media
router.get("/media/status", async (req, res) => {
  try {
    const result = await ctrl(req).list(req, res); // reutiliza listMedia para verificar conectividad
    res.json({ ok: true, message: "Módulo media funcionando", result });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: "Error conectando con media", error: error.message });
  }
});
import { Router } from "express";
import { buildHttpClient } from "../../../infra/http/client";
import { MediaApiRepository } from "../../infrastructure/MediaApiRepository";
import { MediaController } from "../controllers/media.controller";

const router = Router();

const ctrl = (req: any) => {
  // Aquí deberías obtener el token del request si es necesario
  const http = buildHttpClient(process.env.API_BASE_URL || '', () => req.headers['authorization']?.replace('Bearer ', ''));
  const repo = new MediaApiRepository(http);
  return new MediaController(repo);
};


// Subir imagen
router.post("/media", (req, res) => ctrl(req).upload(req, res));
// Listar imágenes
router.get("/media", (req, res) => ctrl(req).list(req, res));
// Marcar imagen como principal
router.post("/media/:id_media/principal", (req, res) => ctrl(req).markPrincipal(req, res));
// Eliminar imagen
router.delete("/media/:id_media", (req, res) => ctrl(req).delete(req, res));
// Reemplazar imagen existente
router.put("/media/:id_media", (req, res) => ctrl(req).replace(req, res));
// Reordenar imágenes
router.post("/media/reorder", (req, res) => ctrl(req).reorder(req, res));

export default router;
