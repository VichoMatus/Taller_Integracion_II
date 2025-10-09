/**
 * SCRIPT DE PRUEBA DE REGISTER
 * ============================
 * 
 * Probar el endpoint de register para comparar con forgot-password
 */

// Configurar variables de entorno desde .env
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ 
  path: path.resolve(__dirname, '../../.env')
});

import { AuthService } from '../auth/services/authService';

async function testRegister() {
  console.log('🧪 PRUEBA DEL REGISTER');
  console.log('======================');
  
  const authService = new AuthService();
  
  const testUser = {
    nombre: 'Usuario Test',
    email: 'test@ejemplo.com',
    telefono: '+56912345678',
    password: 'TestPassword123',
    confirmPassword: 'TestPassword123'
  };
  
  console.log(`📧 Probando register con email: ${testUser.email}`);
  
  try {
    const result = await authService.register(testUser);
    console.log('✅ Resultado:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRegister()
  .then(() => {
    console.log('\n🎯 Prueba completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error en la prueba:', error);
    process.exit(1);
  });