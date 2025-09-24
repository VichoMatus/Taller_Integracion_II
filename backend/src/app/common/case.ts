/**
 * Convierte objetos de camelCase a snake_case recursivamente.
 * Útil para enviar datos a APIs que usan convención Python/FastAPI.
 *
 * @param o - Objeto, array o valor primitivo a convertir
 * @returns Objeto con claves convertidas a snake_case
 *
 * @example
 * ```typescript
 * const input = { firstName: "John", lastName: "Doe", userInfo: { isActive: true } };
 * const output = toSnake(input);
 * // { first_name: "John", last_name: "Doe", user_info: { is_active: true } }
 * ```
 */
export const toSnake = (o: any): any => {
  if (Array.isArray(o)) return o.map(toSnake);
  if (o && typeof o === "object") {
    return Object.fromEntries(
      Object.entries(o).map(([k, v]) => [
        k.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`),
        toSnake(v),
      ])
    );
  }
  return o;
};

/**
 * Convierte objetos de snake_case a camelCase recursivamente.
 * Útil para procesar respuestas de APIs que usan convención Python/FastAPI.
 *
 * @param o - Objeto, array o valor primitivo a convertir
 * @returns Objeto con claves convertidas a camelCase
 *
 * @example
 * ```typescript
 * const input = { first_name: "John", last_name: "Doe", user_info: { is_active: true } };
 * const output = toCamel(input);
 * // { firstName: "John", lastName: "Doe", userInfo: { isActive: true } }
 * ```
 */
export const toCamel = (o: any): any => {
  if (Array.isArray(o)) return o.map(toCamel);
  if (o && typeof o === "object") {
    return Object.fromEntries(
      Object.entries(o).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        toCamel(v),
      ])
    );
  }
  return o;
};
