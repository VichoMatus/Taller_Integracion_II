import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { AsignarRol } from "../../application/AsignarRol";
import { ListUsers, GetUser, PatchUser, RemoveUser } from "../../application/UsersUseCases";
import { canAssignRole } from "../guards/policies";

/**
 * Controlador para operaciones administrativas.
 * Maneja las peticiones HTTP para gestión de usuarios y roles.
 */
export class AdminController {
  constructor(
    private asignarRolUC: AsignarRol,
    private listUsersUC: ListUsers,
    private getUserUC: GetUser,
    private patchUserUC: PatchUser,
    private removeUserUC: RemoveUser
  ) {}

  /**
   * Lista usuarios con paginación y filtros.
   * GET /admin/users
   */
  list = async (req: Request, res: Response) => {
    try {
      const out = await this.listUsersUC.execute({
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        q: req.query.q as string | undefined,
        rol: req.query.rol as any,
      });
      res.json(ok(out));
    } catch (e: any) { res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); }
  };

  /**
   * Obtiene un usuario específico.
   * GET /admin/users/:id
   */
  get = async (req: Request, res: Response) => {
    try { res.json(ok(await this.getUserUC.execute(Number(req.params.id)))); }
    catch (e: any) { res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); }
  };

  /**
   * Actualiza un usuario.
   * PATCH /admin/users/:id
   */
  patch = async (req: Request, res: Response) => {
    try { res.json(ok(await this.patchUserUC.execute(Number(req.params.id), req.body))); }
    catch (e: any) { res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); }
  };

  /**
   * Elimina un usuario.
   * DELETE /admin/users/:id
   */
  remove = async (req: Request, res: Response) => {
    try { await this.removeUserUC.execute(Number(req.params.id)); res.json(ok({ removed: true })); }
    catch (e: any) { res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); }
  };

  /**
   * Asigna un rol a un usuario.
   * POST /admin/users/:id/role
   * Incluye validación de permisos según políticas de seguridad.
   */
  asignarRol = async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const rol = req.body?.rol as string;
      if (!userId || !rol) return res.status(400).json(fail(400, "userId y rol son requeridos"));

      const current = (req as any)?.user?.rol as "admin" | "superadmin" | undefined
        || (req.headers["x-user-role"] as any);
      if (current && !canAssignRole(current, rol)) {
        return res.status(403).json(fail(403, "Solo superadmin puede asignar admin/superadmin"));
      }

      const out = await this.asignarRolUC.execute(userId, { rol } as any);
      res.json(ok(out));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
