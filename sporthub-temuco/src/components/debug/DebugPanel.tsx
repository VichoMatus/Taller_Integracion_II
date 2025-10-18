'use client';

import React, { useState, useEffect } from 'react';

/**
 * Panel de Debug Avanzado para Testing del Registro
 * =================================================
 * 
 * Herramientas útiles para desarrolladores y testers:
 * - Monitor de estado en tiempo real
 * - Simulador de códigos OTP
 * - Log de peticiones HTTP
 * - Controles de prueba avanzados
 */

interface DebugPanelProps {
  state: any;
  onSimulateOTP?: (code: string) => void;
  onForceStep?: (step: string) => void;
  onClearStorage?: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  state,
  onSimulateOTP,
  onForceStep,
  onClearStorage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<Array<{time: string, type: string, message: string}>>([]);
  const [simulatedOTP, setSimulatedOTP] = useState('123456');

  // Interceptar console.log para capturar logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('registro') || message.includes('auth') || message.includes('OTP')) {
        setLogs(prev => [...prev.slice(-9), {
          time: new Date().toLocaleTimeString(),
          type: 'log',
          message
        }]);
      }
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      setLogs(prev => [...prev.slice(-9), {
        time: new Date().toLocaleTimeString(),
        type: 'error',
        message
      }]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const generateRandomOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOTP(otp);
  };

  const getStorageInfo = () => {
    const storage = {
      token: localStorage.getItem('token'),
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token'),
    };
    return storage;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 mb-2"
        title="Panel de Debug"
      >
        🔧
      </button>

      {/* Debug Panel */}
      {isExpanded && (
        <div className="bg-gray-900 text-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-purple-400">Debug Panel</h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Estado Actual */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-yellow-400 mb-2">Estado Actual:</h5>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Paso:</span>
                <span className="text-green-400">{state.currentStep}</span>
              </div>
              <div className="flex justify-between">
                <span>Loading:</span>
                <span className={state.isLoading ? 'text-red-400' : 'text-green-400'}>
                  {state.isLoading ? 'SÍ' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-blue-400 truncate w-32" title={state.email}>
                  {state.email || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Token:</span>
                <span className={state.actionToken ? 'text-green-400' : 'text-red-400'}>
                  {state.actionToken ? 'PRESENTE' : 'AUSENTE'}
                </span>
              </div>
            </div>
          </div>

          {/* Simulador OTP */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-yellow-400 mb-2">Simulador OTP:</h5>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={simulatedOTP}
                  onChange={(e) => setSimulatedOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs flex-1"
                  placeholder="123456"
                  maxLength={6}
                />
                <button
                  onClick={generateRandomOTP}
                  className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                >
                  🎲
                </button>
              </div>
              <button
                onClick={() => onSimulateOTP?.(simulatedOTP)}
                className="w-full bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
                disabled={simulatedOTP.length !== 6}
              >
                Usar este código
              </button>
            </div>
          </div>

          {/* Controles de Navegación */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-yellow-400 mb-2">Navegación:</h5>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => onForceStep?.('form')}
                className="bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700"
              >
                Paso 1
              </button>
              <button
                onClick={() => onForceStep?.('verification')}
                className="bg-orange-600 text-white py-1 px-2 rounded text-xs hover:bg-orange-700"
              >
                Paso 2
              </button>
              <button
                onClick={() => onForceStep?.('completed')}
                className="bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
              >
                Paso 3
              </button>
            </div>
          </div>

          {/* Storage Info */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-yellow-400 mb-2">LocalStorage:</h5>
            <div className="text-xs space-y-1">
              {Object.entries(getStorageInfo()).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={value ? 'text-green-400' : 'text-red-400'}>
                    {value ? 'SET' : 'EMPTY'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={onClearStorage}
              className="w-full bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700 mt-2"
            >
              Limpiar Storage
            </button>
          </div>

          {/* Logs */}
          <div>
            <h5 className="text-sm font-semibold text-yellow-400 mb-2">Logs Recientes:</h5>
            <div className="bg-black rounded p-2 text-xs max-h-24 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No hay logs...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    <span className="text-gray-500">[{log.time}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setLogs([])}
              className="w-full bg-gray-700 text-white py-1 px-2 rounded text-xs hover:bg-gray-600 mt-1"
            >
              Limpiar Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;