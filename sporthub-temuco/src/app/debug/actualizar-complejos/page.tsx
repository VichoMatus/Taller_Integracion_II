'use client';
import { useState } from 'react';
import { complejosService } from '@/services/complejosService';

/**
 * 🔧 PÁGINA DE DEBUG PARA ACTUALIZAR COMPLEJOS
 * Úsala temporalmente para actualizar direcciones y coordenadas
 * Elimina esta página cuando termines
 */
export default function ActualizarComplejosPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Datos de complejos que necesitan actualización
  const complejosAActualizar = [
    {
      id: 2,
      nombre: 'Centro Deportivo Los Andes',
      direccion: 'Polideportivo Andes, Temuco',
      latitud: '-38.7293508',
      longitud: '-72.6134773',
      descripcion: 'Complejo deportivo con canchas múltiples'
    },
    // Agrega más complejos aquí según sea necesario
  ];

  const actualizarComplejos = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      for (const complejo of complejosAActualizar) {
        console.log(`📍 Actualizando complejo ${complejo.id}...`);
        
        await complejosService.updateComplejo(complejo.id, {
          nombre: complejo.nombre,
          direccion: complejo.direccion,
          latitud: complejo.latitud,
          longitud: complejo.longitud,
        });

        setMessage(prev => 
          prev + `✅ Complejo ${complejo.id} (${complejo.nombre}) actualizado\n`
        );
      }

      setMessage(prev => prev + '\n🎉 ¡Todos los complejos fueron actualizados correctamente!');
    } catch (err: any) {
      setError(`❌ Error: ${err.message}`);
      console.error('Error actualizando complejos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Debug: Actualizar Complejos</h1>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Complejos a actualizar:</h2>
        {complejosAActualizar.map(complejo => (
          <div key={complejo.id} style={{ marginBottom: '15px' }}>
            <p><strong>ID:</strong> {complejo.id}</p>
            <p><strong>Nombre:</strong> {complejo.nombre}</p>
            <p><strong>Dirección:</strong> {complejo.direccion}</p>
            <p><strong>Coordenadas:</strong> {complejo.latitud}, {complejo.longitud}</p>
          </div>
        ))}
      </div>

      <button
        onClick={actualizarComplejos}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? '⏳ Actualizando...' : '🚀 Actualizar Complejos'}
      </button>

      {message && (
        <pre style={{
          background: '#e8f5e9',
          padding: '10px',
          borderRadius: '4px',
          marginTop: '20px',
          whiteSpace: 'pre-wrap'
        }}>
          {message}
        </pre>
      )}

      {error && (
        <pre style={{
          background: '#ffebee',
          padding: '10px',
          borderRadius: '4px',
          marginTop: '20px',
          color: '#c62828',
          whiteSpace: 'pre-wrap'
        }}>
          {error}
        </pre>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3e0', borderRadius: '4px' }}>
        <h3>⚠️ Instrucciones:</h3>
        <ol>
          <li>Esta página es solo para DESARROLLO</li>
          <li>Agrega los complejos que necesites actualizar arriba</li>
          <li>Haz clic en "Actualizar Complejos"</li>
          <li>Verifica los cambios en los mapas</li>
          <li>⚡ Elimina esta página cuando termines (/src/app/debug/actualizar-complejos/page.tsx)</li>
        </ol>
      </div>
    </div>
  );
}
