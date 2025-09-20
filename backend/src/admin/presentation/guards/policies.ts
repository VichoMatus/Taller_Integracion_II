/**
 * Política de seguridad para asignación de roles.
 * 
 * Reglas:
 * - Solo superadmin puede asignar roles "admin" o "superadmin"
 * - Admin puede asignar cualquier otro rol (usuario, etc.)
 * 
 * @param current - Rol del usuario que intenta asignar el rol
 * @param target - Rol que se desea asignar
 * @returns true si la asignación está permitida, false en caso contrario
 * 
 * @example
 * ```typescript
 * canAssignRole("admin", "user")      // true
 * canAssignRole("admin", "admin")     // false
 * canAssignRole("superadmin", "admin") // true
 * ```
 */
export const canAssignRole = (current: "admin" | "superadmin", target: string) => {
  const elevates = target === "admin" || target === "superadmin";
  return elevates ? current === "superadmin" : true;
};
