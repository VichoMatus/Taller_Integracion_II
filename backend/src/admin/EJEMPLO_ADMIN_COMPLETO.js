/**
 * EJEMPLO PRÁCTICO - Panel Admin Completo
 * 
 * Este archivo muestra cómo implementar un panel de administración
 * completo usando los hooks y servicios ya configurados.
 * 
 * Copia y pega este código en tu componente React.
 */

'use client';

// 1. IMPORTS NECESARIOS
import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin'; // Hook principal
import { adminService } from '@/services/adminService'; // Servicio directo (opcional)

// 2. COMPONENTE PRINCIPAL
export default function EjemploAdminPanel() {
  
  // === CONFIGURACIÓN DEL HOOK ===
  const {
    state,
    loadDashboard,
    loadMisRecursos,
    createComplejo,
    updateComplejo,
    deleteComplejo,
    createCancha,
    updateCancha,
    deleteCancha,
    clearMessages
  } = useAdmin();

  // === ESTADOS LOCALES ===
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    descripcion: '',
    telefono: ''
  });

  // === EFECTOS ===
  useEffect(() => {
    // Cargar datos al inicializar
    loadMisRecursos();
  }, []);

  // === HANDLERS ===
  
  // Crear complejo
  const handleCreateComplejo = async (e) => {
    e.preventDefault();
    
    const success = await createComplejo({
      nombre: formData.nombre,
      direccion: formData.direccion,
      descripcion: formData.descripcion,
      telefono: formData.telefono
    });

    if (success) {
      setFormData({ nombre: '', direccion: '', descripcion: '', telefono: '' });
      setShowCreateForm(false);
    }
  };

  // Crear cancha de ejemplo
  const handleCreateCanchaEjemplo = async () => {
    await createCancha({
      complejo_id: state.data.complejos[0]?.id || 1, // Primer complejo
      nombre: 'Cancha Fútbol 1',
      tipo_deporte: 'Fútbol',
      capacidad_jugadores: 22,
      precio_hora: 25000,
      descripcion: 'Cancha de pasto sintético profesional'
    });
  };

  // Actualizar complejo
  const handleUpdateComplejo = async (id) => {
    await updateComplejo(id, {
      nombre: 'Complejo Actualizado',
      descripcion: 'Descripción actualizada'
    });
  };

  // Eliminar con confirmación
  const handleDeleteComplejo = async (id) => {
    if (confirm('¿Estás seguro de eliminar este complejo?')) {
      await deleteComplejo(id);
    }
  };

  // === RENDER ===
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🏟️ Panel Admin/Owner
          </h1>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => loadMisRecursos()}
              disabled={state.isLoading}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: state.isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {state.isLoading ? '⏳ Cargando...' : '🔄 Refrescar'}
            </button>
            
            <button 
              onClick={() => loadDashboard()}
              disabled={state.isLoading}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: state.isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              📊 Dashboard
            </button>
            
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {showCreateForm ? '❌ Cancelar' : '➕ Crear Complejo'}
            </button>
          </div>
        </header>

        {/* MENSAJES DE ESTADO */}
        {state.error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>❌ {state.error}</span>
            <button onClick={clearMessages} style={{ background: 'none', border: 'none', fontSize: '1.2rem' }}>
              ✕
            </button>
          </div>
        )}

        {state.success && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>✅ {state.success}</span>
            <button onClick={clearMessages} style={{ background: 'none', border: 'none', fontSize: '1.2rem' }}>
              ✕
            </button>
          </div>
        )}

        {/* FORMULARIO DE CREAR COMPLEJO */}
        {showCreateForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Crear Nuevo Complejo
            </h2>
            
            <form onSubmit={handleCreateComplejo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Nombre del complejo *"
                value={formData.nombre}
                onChange={e => setFormData(prev => ({...prev, nombre: e.target.value}))}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
              
              <input
                type="text"
                placeholder="Dirección *"
                value={formData.direccion}
                onChange={e => setFormData(prev => ({...prev, direccion: e.target.value}))}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
              
              <textarea
                placeholder="Descripción (opcional)"
                value={formData.descripcion}
                onChange={e => setFormData(prev => ({...prev, descripcion: e.target.value}))}
                rows={3}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
              
              <input
                type="tel"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={e => setFormData(prev => ({...prev, telefono: e.target.value}))}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={state.isLoading}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: state.isLoading ? 'not-allowed' : 'pointer',
                    opacity: state.isLoading ? 0.6 : 1
                  }}
                >
                  {state.isLoading ? '⏳ Creando...' : '✅ Crear'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ESTADÍSTICAS DASHBOARD */}
        {state.data.estadisticas && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              📊 Estadísticas
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {state.data.estadisticas.total_complejos}
                </div>
                <div style={{ color: '#6b7280' }}>Complejos</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {state.data.estadisticas.total_canchas}
                </div>
                <div style={{ color: '#6b7280' }}>Canchas</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {state.data.estadisticas.reservas_mes}
                </div>
                <div style={{ color: '#6b7280' }}>Reservas/Mes</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  ${state.data.estadisticas.ingresos_mes?.toLocaleString()}
                </div>
                <div style={{ color: '#6b7280' }}>Ingresos/Mes</div>
              </div>
            </div>
          </div>
        )}

        {/* LISTA DE COMPLEJOS */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              📋 Mis Complejos ({state.data.complejos.length})
            </h2>
          </div>
          
          {state.data.complejos.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
              No hay complejos registrados. ¡Crea tu primer complejo!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {state.data.complejos.map((complejo) => (
                <div 
                  key={complejo.id} 
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {complejo.nombre}
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                      📍 {complejo.direccion}
                    </p>
                    {complejo.descripcion && (
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {complejo.descripcion}
                      </p>
                    )}
                    {complejo.telefono && (
                      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        📞 {complejo.telefono}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'end' }}>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      ID: {complejo.id}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdateComplejo(complejo.id)}
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      
                      <button
                        onClick={() => handleDeleteComplejo(complejo.id)}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LISTA DE CANCHAS */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              ⚽ Mis Canchas ({state.data.canchas.length})
            </h2>
            
            {state.data.complejos.length > 0 && (
              <button
                onClick={handleCreateCanchaEjemplo}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                ➕ Crear Cancha Ejemplo
              </button>
            )}
          </div>
          
          {state.data.canchas.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
              No hay canchas registradas. {state.data.complejos.length === 0 ? 'Primero crea un complejo.' : 'Crea tu primera cancha!'}
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {state.data.canchas.map((cancha) => (
                <div 
                  key={cancha.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}
                >
                  <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {cancha.nombre}
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    🏃 {cancha.tipo_deporte}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    👥 {cancha.capacidad_jugadores} jugadores
                  </p>
                  <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    💰 ${cancha.precio_hora?.toLocaleString()}/hora
                  </p>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    ID: {cancha.id} | Complejo: {cancha.complejo_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * CÓMO USAR ESTE EJEMPLO:
 * 
 * 1. Copia este código en un archivo .tsx dentro de src/app/
 * 2. Ajusta las rutas de imports según tu estructura
 * 3. Personaliza los estilos (este ejemplo usa estilos inline para simplicidad)
 * 4. Agrega validaciones adicionales según tus necesidades
 * 
 * FUNCIONES DISPONIBLES:
 * - ✅ Cargar dashboard y recursos
 * - ✅ Crear, editar y eliminar complejos
 * - ✅ Crear canchas
 * - ✅ Ver estadísticas
 * - ✅ Manejo completo de estados (loading, error, success)
 */