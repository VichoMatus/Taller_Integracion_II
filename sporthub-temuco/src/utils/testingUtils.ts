/**
 * Utilidades de Testing para Registro de 2 Pasos
 * ==============================================
 * 
 * Funciones de apoyo para facilitar las pruebas del sistema de registro.
 * Incluye simuladores, datos de prueba y helpers de debugging.
 */

// Datos de prueba predefinidos
export const TEST_DATA = {
  usuarios: [
    {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@test.com',
      telefono: '+56912345678',
      password: 'password123'
    },
    {
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@test.com',
      telefono: '+56987654321',
      password: 'secure456'
    },
    {
      nombre: 'Carlos',
      apellido: 'López',
      email: 'carlos.lopez@test.com',
      telefono: '+56955555555',
      password: 'mypass789'
    }
  ],
  
  otpCodes: [
    '123456',
    '654321',
    '111111',
    '999999',
    '000000'
  ]
};

// Simulador de códigos OTP
export class OTPSimulator {
  private static instance: OTPSimulator;
  private codes: Map<string, { code: string; expires: number }> = new Map();

  static getInstance(): OTPSimulator {
    if (!OTPSimulator.instance) {
      OTPSimulator.instance = new OTPSimulator();
    }
    return OTPSimulator.instance;
  }

  // Generar código OTP para un email
  generateOTP(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutos
    
    this.codes.set(email, { code, expires });
    
    console.log(`🔐 OTP generado para ${email}: ${code}`);
    return code;
  }

  // Validar código OTP
  validateOTP(email: string, code: string): boolean {
    const stored = this.codes.get(email);
    
    if (!stored) {
      console.log(`❌ No hay OTP para ${email}`);
      return false;
    }

    if (Date.now() > stored.expires) {
      console.log(`⏰ OTP expirado para ${email}`);
      this.codes.delete(email);
      return false;
    }

    if (stored.code !== code) {
      console.log(`❌ OTP inválido para ${email}. Esperado: ${stored.code}, Recibido: ${code}`);
      return false;
    }

    console.log(`✅ OTP válido para ${email}`);
    this.codes.delete(email);
    return true;
  }

  // Obtener OTP actual para un email (para testing)
  getCurrentOTP(email: string): string | null {
    const stored = this.codes.get(email);
    return stored && Date.now() <= stored.expires ? stored.code : null;
  }

  // Limpiar todos los códigos
  clearAll(): void {
    this.codes.clear();
    console.log('🧹 Todos los códigos OTP limpiados');
  }
}

// Helpers de testing
export const TestHelpers = {
  
  // Llenar formulario automáticamente
  fillRegistrationForm: (userIndex: number = 0) => {
    const user = TEST_DATA.usuarios[userIndex];
    const form = document.getElementById('registro-form') as HTMLFormElement;
    
    if (form && user) {
      (form.nombre as HTMLInputElement).value = user.nombre;
      (form.apellido as HTMLInputElement).value = user.apellido;
      (form.email as HTMLInputElement).value = `${user.email.split('@')[0]}+${Date.now()}@${user.email.split('@')[1]}`;
      (form.telefono as HTMLInputElement).value = user.telefono;
      (form.password as HTMLInputElement).value = user.password;
      (form.confirmPassword as HTMLInputElement).value = user.password;
      
      console.log('📝 Formulario llenado con datos de prueba:', user.nombre);
    }
  },

  // Simular envío de OTP
  simulateOTPDelivery: (email: string): string => {
    const simulator = OTPSimulator.getInstance();
    const code = simulator.generateOTP(email);
    
    // Simular delay de envío de email
    setTimeout(() => {
      console.log(`📧 [SIMULADO] Email enviado a ${email} con código: ${code}`);
    }, 1000);
    
    return code;
  },

  // Obtener código actual para un email
  getCurrentOTPForEmail: (email: string): string | null => {
    const simulator = OTPSimulator.getInstance();
    return simulator.getCurrentOTP(email);
  },

  // Validar estructura de respuesta del backend
  validateBackendResponse: (response: any, expectedType: 'init' | 'verify'): boolean => {
    if (expectedType === 'init') {
      return !!(response?.action_token && response?.message);
    } else {
      return !!(response?.access_token && response?.user);
    }
  },

  // Limpiar estado de testing
  clearTestState: () => {
    localStorage.clear();
    sessionStorage.clear();
    OTPSimulator.getInstance().clearAll();
    console.log('🧹 Estado de testing limpiado');
  },

  // Generar email único para testing
  generateTestEmail: (base: string = 'test'): string => {
    const timestamp = Date.now();
    return `${base}+${timestamp}@sporthub-test.com`;
  },

  // Log del estado completo
  logFullState: (hookState: any) => {
    console.group('🔍 Estado Completo del Sistema');
    console.log('Hook State:', hookState);
    console.log('LocalStorage:', {
      token: localStorage.getItem('token'),
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token')
    });
    console.log('Códigos OTP activos:', OTPSimulator.getInstance());
    console.groupEnd();
  }
};

// Configuración de testing automático
export const AutoTestConfig = {
  
  // Ejecutar test completo automático
  runFullTest: async (delayBetweenSteps: number = 2000) => {
    console.log('🚀 Iniciando test automático completo...');
    
    // Paso 1: Llenar formulario
    TestHelpers.fillRegistrationForm(0);
    console.log('✅ Paso 1: Formulario llenado');
    
    await new Promise(resolve => setTimeout(resolve, delayBetweenSteps));
    
    // Simular envío (esto dependería de la implementación específica)
    console.log('⏳ Paso 2: Enviando registro...');
    
    // El resto del test dependería de la implementación específica del hook
    console.log('ℹ️ Test automático configurado. Continuar manualmente.');
  },

  // Configurar interceptores para requests
  setupRequestInterceptors: () => {
    // Interceptar fetch para logging
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      console.log(`🌐 Request: ${options?.method || 'GET'} ${url}`);
      
      try {
        const response = await originalFetch(...args);
        console.log(`✅ Response: ${response.status} ${response.statusText}`);
        return response;
      } catch (error) {
        console.error(`❌ Request failed:`, error);
        throw error;
      }
    };
    
    console.log('🔧 Interceptores de request configurados');
  },

  // Restaurar interceptores originales
  restoreInterceptors: () => {
    // Esto requeriría guardar las referencias originales
    console.log('🔄 Interceptores restaurados');
  }
};

// Exportar instancia global para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).TestUtils = {
    data: TEST_DATA,
    helpers: TestHelpers,
    autoTest: AutoTestConfig,
    otpSimulator: OTPSimulator.getInstance()
  };
  
  console.log('🧪 Utilidades de testing disponibles en window.TestUtils');
}

export default {
  TEST_DATA,
  TestHelpers,
  AutoTestConfig,
  OTPSimulator
};