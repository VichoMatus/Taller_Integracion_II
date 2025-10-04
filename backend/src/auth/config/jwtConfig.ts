/**
 * CONFIGURACIÓN JWT
 * ================
 * 
 * Este archivo contiene la configuración necesaria para la creación y validación
 * de tokens JWT (JSON Web Tokens) utilizados en la autenticación.
 * 
 * Funcionalidades:
 * - Generación de tokens JWT para usuarios autenticados
 * - Verificación de tokens JWT
 * - Decodificación de tokens para obtener datos del usuario
 */

import jwt from 'jsonwebtoken';
import { UserPublic } from '../types/authTypes';

// Configuración de JWT
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'default_secret_key_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  issuer: 'api.sporthub.com'
};

/**
 * Genera un token JWT para un usuario autenticado
 * @param user - Datos del usuario a incluir en el token
 * @returns string - Token JWT firmado
 */
export const generateAccessToken = (user: UserPublic): string => {
  return jwt.sign(
    { 
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.rol
    },
    JWT_CONFIG.secret,
    { 
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer
    }
  );
};

/**
 * Verifica y decodifica un token JWT
 * @param token - Token JWT a verificar
 * @returns UserPublic | null - Datos del usuario o null si el token es inválido
 */
export const verifyToken = (token: string): UserPublic | null => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as UserPublic;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Decodifica un token JWT sin verificar su firma
 * Útil para debugging o para extraer información sin validar
 * @param token - Token JWT a decodificar
 * @returns any - Payload del token
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};