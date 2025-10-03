/**
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * ==============================
 * 
 * Este middleware verifica que las solicitudes a rutas protegidas incluyan
 * un token JWT válido en el encabezado Authorization.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPublic } from '../types/authTypes';

// Extender el tipo Request de Express para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: UserPublic;
    }
  }
}

/**
 * Middleware que verifica el token JWT
 * Extracts and validates the token from the Authorization header
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ ok: false, error: 'No se proporcionó token de autenticación' });
      return;
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as UserPublic;
    
    // Adjuntar el usuario al objeto request para usar en otros controladores
    req.user = decoded;
    
    // Continuar con la solicitud
    next();
  } catch (error) {
    res.status(401).json({ ok: false, error: 'Token inválido o expirado' });
  }
};