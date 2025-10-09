/**
 * Manejador del formulario de registro - Arquitectura limpia
 * Separa la lógica de negocio de la presentación
 */

class RegistroHandler {
  constructor() {
    this.apiUrl = 'http://localhost:4000/api/auth/register';
    this.form = null;
  }

  /**
   * Inicializa el manejador del formulario
   */
  init() {
    this.form = document.getElementById('registro-form');
    if (!this.form) {
      console.error('Formulario de registro no encontrado');
      return;
    }
    
    this.attachEventListeners();
  }

  /**
   * Adjunta los event listeners al formulario
   */
  attachEventListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Validación en tiempo real de confirmación de contraseña
    const confirmPasswordField = document.getElementById('confirm-password');
    const passwordField = document.getElementById('password');
    
    if (confirmPasswordField && passwordField) {
      confirmPasswordField.addEventListener('input', () => {
        this.validatePasswordMatch();
      });
      
      passwordField.addEventListener('input', () => {
        this.validatePasswordMatch();
      });
    }
  }

  /**
   * Maneja el envío del formulario
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    try {
      // Validar formulario antes del envío
      if (!this.validateForm()) {
        return;
      }

      // Obtener datos del formulario
      const formData = this.getFormData();
      
      // Mostrar indicador de carga
      this.setLoadingState(true);
      
      // Enviar datos al backend
      const response = await this.submitToAPI(formData);
      
      // Procesar respuesta
      await this.handleResponse(response);
      
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Obtiene los datos del formulario
   */
  getFormData() {
    const formData = new FormData(this.form);
    
    return {
      nombre: formData.get('nombre')?.trim() || '',
      apellido: formData.get('apellido')?.trim() || '',
      email: formData.get('email')?.trim().toLowerCase() || '',
      password: formData.get('password') || '',
      confirmPassword: formData.get('confirmPassword') || '',
      telefono: formData.get('telefono')?.trim() || ''
    };
  }

  /**
   * Valida el formulario antes del envío
   */
  validateForm() {
    const data = this.getFormData();
    
    // Validar campos requeridos
    if (!data.nombre || !data.apellido || !data.email || !data.password || !data.confirmPassword) {
      this.showError('Todos los campos marcados como obligatorios deben ser completados.');
      return false;
    }

    // Validar email
    if (!this.isValidEmail(data.email)) {
      this.showError('Por favor ingresa un email válido.');
      return false;
    }

    // Validar contraseña
    if (data.password.length < 6) {
      this.showError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    // Validar confirmación de contraseña
    if (data.password !== data.confirmPassword) {
      this.showError('Las contraseñas no coinciden.');
      return false;
    }

    // Validar teléfono si se proporciona
    if (data.telefono && !this.isValidPhone(data.telefono)) {
      this.showError('El formato del teléfono no es válido. Ejemplo: +56912345678');
      return false;
    }

    return true;
  }

  /**
   * Valida si las contraseñas coinciden en tiempo real
   */
  validatePasswordMatch() {
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirm-password')?.value || '';
    const confirmField = document.getElementById('confirm-password');
    
    if (confirmPassword && password !== confirmPassword) {
      confirmField.setCustomValidity('Las contraseñas no coinciden');
      confirmField.classList.add('error');
    } else {
      confirmField.setCustomValidity('');
      confirmField.classList.remove('error');
    }
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de teléfono
   */
  isValidPhone(phone) {
    // Acepta formatos como +56912345678, +1234567890, etc.
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Envía los datos al API
   */
  async submitToAPI(data) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Maneja la respuesta del API
   */
  async handleResponse(result) {
    if (result.ok && result.data) {
      // Guardar token y datos del usuario
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      // Mostrar mensaje de éxito
      this.showSuccess('¡Registro exitoso! Bienvenido a SportHub');
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } else {
      throw new Error(result.error || 'Error desconocido en el registro');
    }
  }

  /**
   * Maneja errores durante el proceso
   */
  handleError(error) {
    console.error('Error en registro:', error);
    
    let errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    this.showError(errorMessage);
  }

  /**
   * Establece el estado de carga del formulario
   */
  setLoadingState(isLoading) {
    const submitButton = this.form.querySelector('button[type="submit"]');
    const inputs = this.form.querySelectorAll('input');
    
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.textContent = 'Creando cuenta...';
      inputs.forEach(input => input.disabled = true);
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Crear cuenta';
      inputs.forEach(input => input.disabled = false);
    }
  }

  /**
   * Muestra mensaje de error
   */
  showError(message) {
    // Remover mensajes anteriores
    this.clearMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      background-color: #fee;
      color: #c53030;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
      border-left: 4px solid #c53030;
    `;
    
    this.form.insertBefore(errorDiv, this.form.firstChild);
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccess(message) {
    // Remover mensajes anteriores
    this.clearMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      background-color: #e6fffa;
      color: #2d7d63;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
      border-left: 4px solid #38a169;
    `;
    
    this.form.insertBefore(successDiv, this.form.firstChild);
  }

  /**
   * Limpia mensajes de error y éxito
   */
  clearMessages() {
    const existingMessages = this.form.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(message => message.remove());
  }

  /**
   * Limpia el formulario
   */
  resetForm() {
    this.form.reset();
    this.clearMessages();
  }
}

// Inicialización automática cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  const registroHandler = new RegistroHandler();
  registroHandler.init();
});

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RegistroHandler;
}