'use client';

import { useState } from 'react';

interface ApiResponse {
  ok: boolean;
  data?: any;
  error?: string;
}

interface TestLog {
  timestamp: string;
  action: string;
  data: any;
  success: boolean;
}

export default function TestResetPasswordPage() {
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<TestLog[]>([]);
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  const addLog = (action: string, data: any, success: boolean) => {
    const log: TestLog = {
      timestamp: new Date().toLocaleTimeString(),
      action,
      data,
      success
    };
    setLogs(prev => [log, ...prev]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      
      addLog('Test Connection', {
        status: response.status,
        url: `${BACKEND_URL}/health`,
        response: data
      }, response.ok);
      
    } catch (error: any) {
      addLog('Test Connection', {
        url: `${BACKEND_URL}/health`,
        error: error.message
      }, false);
    }
    setIsLoading(false);
  };

  const testForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    
    setIsLoading(true);
    const requestData = { email: forgotEmail };
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      addLog('Forgot Password', {
        url: `${BACKEND_URL}/api/auth/forgot-password`,
        request: requestData,
        status: response.status,
        response: result
      }, response.ok);
      
      if (response.ok) {
        // Auto-llenar email en reset form
        setResetEmail(forgotEmail);
        
        // Si hay un token en modo desarrollo, extraerlo
        if (result.data?.message?.includes('token=')) {
          const tokenMatch = result.data.message.match(/token=([A-Za-z0-9]+)/);
          if (tokenMatch) {
            setResetCode(tokenMatch[1]);
          }
        }
      }
      
    } catch (error: any) {
      addLog('Forgot Password', {
        url: `${BACKEND_URL}/api/auth/forgot-password`,
        request: requestData,
        error: error.message
      }, false);
    }
    setIsLoading(false);
  };

  const testResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetCode || !newPassword) return;
    
    setIsLoading(true);
    const requestData = { 
      email: resetEmail, 
      code: resetCode, 
      new_password: newPassword 
    };
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      addLog('Reset Password', {
        url: `${BACKEND_URL}/api/auth/reset-password`,
        request: { ...requestData, new_password: '[HIDDEN]' },
        status: response.status,
        response: result
      }, response.ok);
      
      if (response.ok) {
        // Limpiar formulario
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
      }
      
    } catch (error: any) {
      addLog('Reset Password', {
        url: `${BACKEND_URL}/api/auth/reset-password`,
        request: { ...requestData, new_password: '[HIDDEN]' },
        error: error.message
      }, false);
    }
    setIsLoading(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Test Reset Password - SportHub
          </h1>
          <p className="text-gray-600 mb-4">
            Herramienta de debug para probar endpoints de recuperación de contraseña
          </p>
          
          {/* Connection Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Backend URL:</strong> {BACKEND_URL}
                </p>
              </div>
              <button 
                onClick={testConnection}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forms Section */}
          <div className="space-y-6">
            {/* Forgot Password Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📧 1. Solicitar Reset de Contraseña
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Envía un código de recuperación al email. La API debería enviar el correo.
              </p>
              
              <form onSubmit={testForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="forgot-email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading || !forgotEmail}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Código de Reset'}
                </button>
              </form>
            </div>

            {/* Reset Password Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🔑 2. Restablecer Contraseña
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Usa el código recibido por email para establecer una nueva contraseña.
              </p>
              
              <form onSubmit={testResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 mb-2">
                    Código (6 dígitos):
                  </label>
                  <input
                    type="text"
                    id="reset-code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña:
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading || !resetEmail || !resetCode || !newPassword}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
              </form>
            </div>
          </div>

          {/* Debug Logs Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                🐛 Debug Logs
              </h2>
              <button 
                onClick={clearLogs}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Limpiar
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No hay logs aún. Ejecuta una acción para ver los detalles.</p>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg text-sm ${
                      log.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${
                        log.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {log.success ? '✅' : '❌'} {log.action}
                      </span>
                      <span className="text-gray-500 text-xs">{log.timestamp}</span>
                    </div>
                    <pre className={`text-xs whitespace-pre-wrap overflow-x-auto ${
                      log.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-amber-800 mb-2">📝 Instrucciones de Uso:</h3>
          <ol className="text-sm text-amber-700 space-y-1">
            <li>1. <strong>Test Connection:</strong> Verifica que el backend esté corriendo en puerto 4000</li>
            <li>2. <strong>Forgot Password:</strong> Ingresa un email válido y revisa si llega el correo</li>
            <li>3. <strong>Reset Password:</strong> Usa el código del email para restablecer</li>
            <li>4. <strong>Debug Logs:</strong> Revisa los logs detallados para identificar errores</li>
          </ol>
          <p className="text-xs text-amber-600 mt-2">
            <strong>Nota:</strong> Si el endpoint forgot-password funciona pero no llega el correo, 
            el problema está en la configuración SMTP de la API FastAPI.
          </p>
        </div>
      </div>
    </div>
  );
}
