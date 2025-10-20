/**
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * ==============================
 * 
 * Este middleware verifica que las solicitudes a rutas protegidas incluyan
 * un token JWT en el encabezado Authorization.
 * 
 * IMPORTANTE: Este BFF actúa como PROXY. Los tokens son generados por FastAPI,
 * por lo que NO intentamos verificarlos aquí. Solo validamos que exista el token
 * y lo pasamos a FastAPI, quien es el responsable de verificarlo.
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
 * Middleware que valida la presencia del token JWT (sin verificarlo)
 * El token será verificado por FastAPI cuando se haga el proxy
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ [authMiddleware] No se proporcionó token de autenticación');
      res.status(401).json({ ok: false, error: 'No se proporcionó token de autenticación' });
      return;
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    if (!token || token.length === 0) {
      console.log('⚠️ [authMiddleware] Token vacío');
      res.status(401).json({ ok: false, error: 'Token inválido' });
      return;
    }
    
    // 🔥 DECODIFICAR sin verificar (para logging y debug solamente)
    // No usamos jwt.verify() porque el token fue generado por FastAPI con su propio secreto
    try {
      const decoded = jwt.decode(token) as any;
      console.log('✅ [authMiddleware] Token presente:', {
        sub: decoded?.sub,
        rol: decoded?.rol,
        exp: decoded?.exp,
        expDate: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
      });
      
      // Adjuntar información decodificada (sin verificar) al request para logging
      req.user = decoded;
    } catch (decodeError) {
      console.warn('⚠️ [authMiddleware] No se pudo decodificar token para logging');
    }
    
    // Continuar con la solicitud - FastAPI verificará el token
    next();
  } catch (error) {
    console.error('❌ [authMiddleware] Error en middleware:', error);
    res.status(401).json({ ok: false, error: 'Error al procesar token' });
  }
};