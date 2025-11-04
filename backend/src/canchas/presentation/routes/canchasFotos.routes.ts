import { Router } from "express";
import multer from "multer";
import { subirFotoCancha } from "../controllers/canchasFotos.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Endpoint para subir foto de cancha (imagen ya procesada)
router.post("/:id/fotos", upload.single("image"), subirFotoCancha);

export default router;
