import { Router } from "express";
import { ENV } from "../../../config/env";
import { buildHttpClient } from "../../../infra/http/client";
import { getBearerFromReq } from "../../../interfaces/auth";
import { ReservaApiRepository } from "../../infrastructure/ReservaApiRepository";
import { 
  ListReservas, 
  GetReserva, 
  CreateReserva, 
  UpdateReserva, 
  DeleteReserva,
  VerificarDisponibilidad,
  GetReservasByUsuario,
  ConfirmarPago,
  CancelarReserva
} from "../../application/ReservasUseCases";
import { ReservasController } from "../controllers/reservas.controller";
import { requireRole } from "../../../admin/presentation/guards/guards";

/**
 * Router para endpoints de reservas.
 * Maneja la gestión completa de reservas de canchas.
 */
const router = Router();

/**
 * Factory function para crear controlador con dependencias inyectadas.
 * Configura cliente HTTP y repositorio para cada request.
 */
const ctrl = (req: any) => {
  const http = buildHttpClient(ENV.FASTAPI_URL, () => getBearerFromReq(req));
  const repo = new ReservaApiRepository(http);
  return new ReservasController(
    new ListReservas(repo),
    new GetReserva(repo),
    new CreateReserva(repo),
    new UpdateReserva(repo),
    new DeleteReserva(repo),
    new VerificarDisponibilidad(repo),
    new GetReservasByUsuario(repo),
    new ConfirmarPago(repo),
    new CancelarReserva(repo)
  );
};

// === Endpoints Públicos ===

/** POST /reservas/verificar-disponibilidad - Verifica disponibilidad de cancha (público) */
router.post("/verificar-disponibilidad", (req, res) => ctrl(req).verificarDisponibilidad(req, res));

// === Endpoints de Usuario Autenticado ===
// Requieren autenticación pero permiten a usuarios gestionar sus propias reservas

/** GET /reservas/usuario/:usuarioId - Obtiene reservas de un usuario */
router.get("/usuario/:usuarioId", (req, res) => ctrl(req).getByUsuario(req, res));

/** POST /reservas - Crea nueva reserva */
router.post("/", (req, res) => ctrl(req).create(req, res));

/** GET /reservas/:id - Obtiene reserva específica */
router.get("/:id", (req, res) => ctrl(req).get(req, res));

/** PATCH /reservas/:id - Actualiza reserva */
router.patch("/:id", (req, res) => ctrl(req).update(req, res));

/** POST /reservas/:id/confirmar-pago - Confirma pago de reserva */
router.post("/:id/confirmar-pago", (req, res) => ctrl(req).confirmarPago(req, res));

/** POST /reservas/:id/cancelar - Cancela reserva */
router.post("/:id/cancelar", (req, res) => ctrl(req).cancelar(req, res));

// === Endpoints Administrativos ===
// Requieren rol admin o superadmin

/** GET /reservas - Lista todas las reservas con filtros */
router.get("/", requireRole("admin", "superadmin"), (req, res) => ctrl(req).list(req, res));

/** DELETE /reservas/:id - Elimina reserva */
router.delete("/:id", requireRole("admin", "superadmin"), (req, res) => ctrl(req).delete(req, res));

export default router;
