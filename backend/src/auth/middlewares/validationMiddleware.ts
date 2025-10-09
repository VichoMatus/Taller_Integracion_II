/**
 * MIDDLEWARE DE VALIDACIÓN PARA AUTENTICACIÓN
 * ===========================================
 * 
 * Este archivo implementa middlewares de Express para validar los datos
 * de las solicitudes relacionadas con la autenticación.
 */

import { Request, Response, NextFunction } from 'express';
import { UserLogin } from '../types/authTypes';

/**
 * Valida los datos de inicio de sesión
 * Verifica que el email y password estén presentes y sean válidos
 */
export const validateLoginData = (req: Request, res: Response, next: NextFunction): void => {
  const credentials: UserLogin = req.body;
  const errors: string[] = [];

  // Validar que exista email
  if (!credentials.email) {
    errors.push('El email es requerido');
  } else if (!isValidEmail(credentials.email)) {
    errors.push('El formato del email no es válido');
  }

  // Validar que exista password
  if (!credentials.password) {
    errors.push('La contraseña es requerida');
  } else if (credentials.password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  // Si hay errores, retornar respuesta 400
  if (errors.length > 0) {
    res.status(400).json({
      ok: false,
      error: 'Datos de inicio de sesión inválidos',
      details: errors
    });
    return;
  }

  // Si todo es válido, continuar con el siguiente middleware
  next();
};

/**
 * Función auxiliar para validar formato de email
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};