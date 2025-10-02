// routes/index.ts
import { Router } from "express";
import reservaRoutes from "./reserva";
import usuarioRoutes from "./usuario";
import resenaRoutes from "./resena";
import notificacionRoutes from "./notificacion";
import favoritoRoutes from "./favorito";

const router = Router();
router.use("/bff", reservaRoutes);
router.use("/bff", usuarioRoutes);
router.use("/bff", resenaRoutes);
router.use("/bff", notificacionRoutes);
router.use("/bff", favoritoRoutes);
export default router;
