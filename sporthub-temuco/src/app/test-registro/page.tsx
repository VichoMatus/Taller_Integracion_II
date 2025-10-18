'use client';

import React, { useState } from 'react';
import { useRegistro } from '@/hooks/useRegistro';
import DebugPanel from '@/components/debug/DebugPanel';

/**
 * Página de prueba para el nuevo sistema de registro de 2 pasos
 * ============================================================
 * 
 * Esta página permite probar el flujo completo:
 * 1. Formulario de registro inicial
 * 2. Verificación de código OTP
 * 3. Confirmación de registro exitoso
 * 
 * Incluye debug information y controles de prueba
 */

const TestRegistroPage = () => {
  const {
    state,
    handleSubmitRegistro,
    handleSubmitVerification,
    clearMessages,
    resetFlow,
    resendOTP
  } = useRegistro();

  // Estado local para el formulario de verificación
  const [otpCode, setOtpCode] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  /**
   * Manejar envío del código OTP
   */
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitVerification({ code: otpCode });
  };

  /**
   * Llenar formulario con datos de prueba
   */
  const fillTestData = () => {
    const form = document.getElementById('registro-form') as HTMLFormElement;
    if (form) {
      (form.nombre as HTMLInputElement).value = 'Juan';
      (form.apellido as HTMLInputElement).value = 'Pérez';
      (form.email as HTMLInputElement).value = `test${Date.now()}@example.com`;
      (form.telefono as HTMLInputElement).value = '+56912345678';
      (form.password as HTMLInputElement).value = 'password123';
      (form.confirmPassword as HTMLInputElement).value = 'password123';
    }
  };

  /**
   * Funciones para el panel de debug
   */
  const handleSimulateOTP = (code: string) => {
    setOtpCode(code);
    console.log('OTP simulado:', code);
  };

  const handleForceStep = (step: string) => {
    console.log('Forzando paso:', step);
    // Esta función necesitaría ser implementada en el hook useRegistro
    // Por ahora solo logeamos la acción
  };

  const handleClearStorage = () => {
    localStorage.clear();
    console.log('Storage limpiado');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test: Registro de 2 Pasos
          </h1>
          <p className="text-gray-600">
            Página de prueba para el nuevo sistema de registro con verificación OTP
          </p>
        </div>

        {/* Indicador de paso actual */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progreso:</span>
            <div className="flex space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                state.currentStep === 'form' ? 'bg-blue-500' : 
                state.currentStep === 'verification' ? 'bg-green-500' : 'bg-green-500'
              }`} />
              <div className={`w-3 h-3 rounded-full ${
                state.currentStep === 'verification' ? 'bg-blue-500' : 
                state.currentStep === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <div className={`w-3 h-3 rounded-full ${
                state.currentStep === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              Paso actual: <strong>{
                state.currentStep === 'form' ? '1 - Datos del usuario' :
                state.currentStep === 'verification' ? '2 - Verificación OTP' :
                '3 - Registro completado'
              }</strong>
            </span>
          </div>
        </div>

        {/* Mensajes de estado */}
        {(state.error || state.success) && (
          <div className="mb-6">
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <div className="text-red-600 text-sm">
                    <strong>Error:</strong> {state.error}
                  </div>
                  <button
                    onClick={clearMessages}
                    className="ml-auto text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            {state.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-green-600 text-sm">
                    <strong>Éxito:</strong> {state.success}
                  </div>
                  <button
                    onClick={clearMessages}
                    className="ml-auto text-green-400 hover:text-green-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 1: Formulario de Registro */}
        {state.currentStep === 'form' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Paso 1: Datos del Usuario
              </h2>
              <button
                onClick={fillTestData}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
              >
                Llenar datos de prueba
              </button>
            </div>

            <form id="registro-form" onSubmit={handleSubmitRegistro} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    name="nombre"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    name="apellido"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+56912345678"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Repetir contraseña"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={state.isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
              >
                {state.isLoading ? 'Enviando...' : 'Enviar Código de Verificación'}
              </button>
            </form>
          </div>
        )}

        {/* PASO 2: Verificación OTP */}
        {state.currentStep === 'verification' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Paso 2: Verificación de Email
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                Hemos enviado un código de 6 dígitos a: <strong>{state.email}</strong>
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Revisa tu bandeja de entrada y spam. El código expira en 10 minutos.
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                  placeholder="123456"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el código de 6 dígitos que recibiste por email
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={state.isLoading || otpCode.length !== 6}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {state.isLoading ? 'Verificando...' : 'Verificar Código'}
                </button>
                
                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={state.isLoading}
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Reenviar
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={resetFlow}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Volver al formulario de registro
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Registro Completado */}
        {state.currentStep === 'completed' && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Registro Completado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu cuenta ha sido creada exitosamente y tu email ha sido verificado.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
              >
                Ir al Dashboard
              </button>
              
              <button
                onClick={resetFlow}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
              >
                Probar Nuevo Registro
              </button>
            </div>
          </div>
        )}

        {/* Panel de Debug */}
        <div className="mt-8 bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-medium">Debug Information</h3>
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-gray-400 hover:text-white text-sm"
            >
              {showDebugInfo ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showDebugInfo && (
            <pre className="text-green-400 text-xs overflow-x-auto">
              {JSON.stringify({
                currentStep: state.currentStep,
                isLoading: state.isLoading,
                hasError: !!state.error,
                hasSuccess: !!state.success,
                email: state.email,
                hasActionToken: !!state.actionToken,
                showVerificationForm: state.showVerificationForm,
                showSuccessMessage: state.showSuccessMessage,
                otpCodeLength: otpCode.length
              }, null, 2)}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>SportHub - Sistema de Registro de 2 Pasos v2.0</p>
          <p>Página de pruebas - No usar en producción</p>
        </div>
      </div>

      {/* Panel de Debug Flotante */}
      <DebugPanel
        state={state}
        onSimulateOTP={handleSimulateOTP}
        onForceStep={handleForceStep}
        onClearStorage={handleClearStorage}
      />
    </div>
  );
};

export default TestRegistroPage;