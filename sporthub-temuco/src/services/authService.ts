/**
 * Servicio de Autenticación - Arquitectura Limpia
 * Maneja toda la lógica de registro, validaciones y comunicación con API
 */

export interface RegistroData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string | null;
}

export interface RegistroResponse {
  ok: boolean;
  data?: {
    access_token: string;
    user: {
      id: string;
      nombre: string;
      apellido: string;
      email: string;
    };
  };
  error?: string;
}

class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth/register';

  /**
   * Valida los datos del formulario antes de enviarlos
   */
  validateRegistroData(data: RegistroData): string | null {
    // Validar campos requeridos
    if (!data.nombre.trim()) return 'El nombre es requerido';
    if (!data.apellido.trim()) return 'El apellido es requerido';
    if (!data.email.trim()) return 'El email es requerido';
    if (!data.password) return 'La contraseña es requerida';
    if (!data.confirmPassword) return 'La confirmación de contraseña es requerida';

    // Validar formato de email
    if (!this.isValidEmail(data.email)) {
      return 'El formato del email no es válido';
    }

    // Validar longitud de contraseña
    if (data.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar que las contraseñas coincidan
    if (data.password !== data.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    // Validar teléfono si se proporciona
    if (data.telefono && !this.isValidPhone(data.telefono)) {
      return 'El formato del teléfono no es válido. Ejemplo: +56912345678';
    }

    return null; // Sin errores
  }

  /**
   * Registra un nuevo usuario
   */
  async registrarUsuario(data: RegistroData): Promise<RegistroResponse> {
    try {
      // Validar datos antes de enviar
      const validationError = this.validateRegistroData(data);
      if (validationError) {
        return {
          ok: false,
          error: validationError
        };
      }

      // Preparar datos para envío (limpiar y normalizar)
      const telefonoLimpio = data.telefono ? data.telefono.trim() : '';
      const dataToSend = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        telefono: telefonoLimpio || null  // Si está vacío, enviar null
      };

      // Realizar petición al API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.ok && result.data) {
        // Guardar token y datos del usuario en localStorage
        this.saveUserSession(result.data);
        return result;
      } else {
        return {
          ok: false,
          error: result.error || 'Error desconocido en el registro'
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        ok: false,
        error: 'Error de conexión. Verifica que el servidor esté funcionando.'
      };
    }
  }

  /**
   * Guarda la sesión del usuario en localStorage
   */
  private saveUserSession(data: NonNullable<RegistroResponse['data']>): void {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de teléfono internacional
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Extrae datos del formulario HTML
   */
  extractFormData(form: HTMLFormElement): RegistroData {
    const formData = new FormData(form);
    
    return {
      nombre: (formData.get('nombre') as string) || '',
      apellido: (formData.get('apellido') as string) || '',
      email: (formData.get('email') as string) || '',
      password: (formData.get('password') as string) || '',
      confirmPassword: (formData.get('confirmPassword') as string) || '',
      telefono: (formData.get('telefono') as string) || ''
    };
  }
}

// Exportar instancia singleton
export const authService = new AuthService();