/**
 * SERVICIO DE AUTENTICACIÓN LOCAL
 * ==============================
 * 
 * Este servicio implementa la lógica de autenticación usando el repositorio local
 * en lugar de consumir una API externa. Se puede usar como alternativa durante
 * el desarrollo o cuando no se requiere integración con una API externa.
 */

import { UserLogin, TokenResponse, ApiResponse, UserPublic } from '../types/authTypes';
import { UserRepository } from '../repositories/userRepository';
import { generateAccessToken } from '../config/jwtConfig';

export class LocalAuthService {
  private userRepository: UserRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
  }
  
  /**
   * Autentica a un usuario con sus credenciales
   * @param credentials - Email y contraseña del usuario
   * @returns Promise<ApiResponse<TokenResponse>> - Tokens y datos del usuario
   */
  async login(credentials: UserLogin): Promise<ApiResponse<TokenResponse>> {
    try {
      // Validar credenciales con el repositorio
      const user = await this.userRepository.validateCredentials(credentials);
      
      // Si no es válido, retornar error
      if (!user) {
        return { 
          ok: false, 
          error: 'Credenciales inválidas'
        };
      }
      
      // Generar access token
      const access_token = generateAccessToken(user);
      
      // Retornar respuesta exitosa
      return {
        ok: true,
        data: {
          access_token,
          token_type: 'bearer',
          user
        }
      };
    } catch (error: any) {
      // Manejar cualquier error inesperado
      return { 
        ok: false, 
        error: error.message || 'Error durante la autenticación'
      };
    }
  }
  
  /**
   * Obtiene los datos del usuario autenticado
   * @param userId - ID del usuario
   * @returns Promise<ApiResponse<UserPublic>> - Datos del usuario
   */
  async getProfile(userId: number): Promise<ApiResponse<UserPublic>> {
    try {
      // Buscar usuario por ID
      const user = await this.userRepository.findById(userId);
      
      // Si no existe, retornar error
      if (!user) {
        return { 
          ok: false, 
          error: 'Usuario no encontrado'
        };
      }
      
      // Retornar datos del usuario
      return {
        ok: true,
        data: user
      };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.message || 'Error al obtener perfil de usuario'
      };
    }
  }
}