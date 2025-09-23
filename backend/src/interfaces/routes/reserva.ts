import { Router } from "express";
import { getReservationCards } from "../controllers/reserva";

const router = Router();
router.get("/reservas/cards", getReservationCards); // endpoint del BFF
export default router;
