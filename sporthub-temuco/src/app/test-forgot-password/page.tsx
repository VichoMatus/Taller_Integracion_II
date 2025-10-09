/**
 * PÁGINA DE PRUEBA - RECUPERACIÓN DE CONTRASEÑA
 * =============================================
 * 
 * Esta página prueba el flujo completo de recuperación de contraseña:
 * 1. Solicitar reset (forgot-password)
 * 2. Ingresar código y nueva contraseña (reset-password)
 * 
 * Para usar esta página:
 * 1. Navegar a http://localhost:3000/test-forgot-password
 * 2. Probar el flujo completo
 */

'use client';

import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

export default function ForgotPasswordTestPage() {
  // Estados para el formulario
  const [step, setStep] = useState<'forgot' | 'reset'>('forgot');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para los resultados
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  
  // Función para agregar resultados
  const addResult = (result: Omit<TestResult, 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [newResult, ...prev]);
  };

  // Función para limpiar resultados
  const clearResults = () => {
    setResults([]);
  };

  // Función para probar forgot-password
  const testForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addResult({
        success: false,
        message: 'Email es requerido'
      });
      return;
    }

    setLoading(true);
    try {
      const payload: ForgotPasswordRequest = { email };
      console.log('🔄 Enviando forgot-password:', payload);
      
      const result = await authService.forgotPassword(payload);
      console.log('✅ Respuesta forgot-password:', result);
      
      addResult({
        success: true,
        message: 'Código de recuperación enviado correctamente',
        data: result
      });
      
      setStep('reset');
    } catch (error: any) {
      console.error('❌ Error forgot-password:', error);
      addResult({
        success: false,
        message: `Error: ${error.message || error.toString()}`,
        data: error
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para probar reset-password
  const testResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!email || !code || !newPassword) {
      addResult({
        success: false,
        message: 'Email, código y nueva contraseña son requeridos'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      addResult({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      addResult({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    setLoading(true);
    try {
      const payload: ResetPasswordRequest = { 
        email,
        code,
        new_password: newPassword 
      };
      console.log('🔄 Enviando reset-password:', { ...payload, new_password: '***' });
      
      const result = await authService.resetPassword(payload);
      console.log('✅ Respuesta reset-password:', result);
      
      addResult({
        success: true,
        message: 'Contraseña restablecida correctamente',
        data: result
      });
      
      // Limpiar formulario
      setEmail('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setStep('forgot');
    } catch (error: any) {
      console.error('❌ Error reset-password:', error);
      addResult({
        success: false,
        message: `Error: ${error.message || error.toString()}`,
        data: error
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para probar connectivity
  const testConnectivity = async () => {
    setLoading(true);
    try {
      const [forgotStatus, resetStatus, allStatus] = await Promise.all([
        authService.getEndpointStatus('forgot-password'),
        authService.getEndpointStatus('reset-password'), 
        authService.getAllEndpointsStatus()
      ]);
      
      addResult({
        success: true,
        message: 'Tests de conectividad completados',
        data: {
          'forgot-password': forgotStatus,
          'reset-password': resetStatus,
          'all-endpoints': allStatus
        }
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: `Error de conectividad: ${error.message}`,
        data: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔒 Test de Recuperación de Contraseña
          </h1>
          <p className="text-gray-600 mb-6">
            Prueba el flujo completo: forgot-password → reset-password
          </p>

          {/* Botones de utilidad */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={testConnectivity}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              🌐 Test Conectividad
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              🗑️ Limpiar Resultados
            </button>
            <button
              onClick={() => setStep(step === 'forgot' ? 'reset' : 'forgot')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              🔄 Cambiar Paso ({step === 'forgot' ? 'Reset' : 'Forgot'})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel izquierdo - Formularios */}
            <div className="space-y-6">
              
              {/* Paso 1: Forgot Password */}
              {step === 'forgot' && (
                <div className="border rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    📧 Paso 1: Solicitar Código
                  </h2>
                  <form onSubmit={testForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@ejemplo.com"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '🔄 Enviando...' : '📧 Enviar Código'}
                    </button>
                  </form>
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> Después de enviar, revisa la consola del navegador y los logs del backend para ver el código generado.
                    </p>
                  </div>
                </div>
              )}

              {/* Paso 2: Reset Password */}
              {step === 'reset' && (
                <div className="border rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    🔑 Paso 2: Restablecer Contraseña
                  </h2>
                  <form onSubmit={testResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@ejemplo.com"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Verificación *
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña * (min 6 caracteres)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                        minLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '🔄 Procesando...' : '🔑 Restablecer Contraseña'}
                    </button>
                  </form>
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-700">
                      <strong>Nota:</strong> El código debe ser el que recibiste por email o que aparece en los logs del backend.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel derecho - Resultados */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📊 Resultados de Pruebas
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay resultados aún.</p>
                    <p className="text-sm">Ejecuta una prueba para ver los resultados aquí.</p>
                  </div>
                ) : (
                  results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        result.success
                          ? 'bg-green-50 border-green-400'
                          : 'bg-red-50 border-red-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-sm font-medium ${
                            result.success ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {result.success ? '✅ Éxito' : '❌ Error'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {result.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            Ver detalles técnicos
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información de uso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            📋 Instrucciones de Uso
          </h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>1.</strong> Asegúrate de que el backend esté ejecutándose</p>
            <p><strong>2.</strong> Prueba primero la conectividad con el botón "Test Conectividad"</p>
            <p><strong>3.</strong> Para probar el flujo completo:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Ingresa un email válido en el paso 1 y envía el código</li>
              <li>Revisa los logs del backend para obtener el código generado</li>
              <li>Cambia al paso 2 e ingresa el código junto con la nueva contraseña</li>
            </ul>
            <p><strong>4.</strong> Todos los resultados aparecerán en tiempo real en el panel derecho</p>
            <p><strong>5.</strong> Usa la consola del navegador (F12) para ver logs detallados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
