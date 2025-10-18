# 🏟️ Guía de Uso - Endpoints Admin/Owner Frontend

## 📋 Resumen del Sistema
Sistema completo de administración para owners de complejos deportivos integrado con Next.js + Docker.

---

## 🛠️ Componentes Implementados

### Backend
- **Domain**: `src/domain/admin/Owner.ts` - Entidades de negocio
- **Repository**: `src/admin/infrastructure/AdminApiRepository.ts` - Conexión API
- **Types**: `src/types/admin.ts` - Interfaces TypeScript

### Frontend  
- **Service**: `src/services/adminService.ts` - Llamadas API
- **Hook**: `src/hooks/useAdmin.ts` - Estado React
- **Types**: `src/types/admin.ts` - Tipos compartidos

---

## 🎯 Ejemplos de Uso en Frontend

### 1. Importar el Hook

```typescript
import { useAdmin, useAdminDashboard, useComplejos } from '@/hooks/useAdmin';
```

### 2. Dashboard Principal

```typescript
// Ejemplo: Componente Dashboard
'use client';
import { useAdminDashboard } from '@/hooks/useAdmin';

export default function AdminDashboard() {
  const {
    isLoading,
    error,
    complejos,
    canchas,
    estadisticas,
    loadDashboard,
    clearMessages
  } = useAdminDashboard();

  // El hook ya carga automáticamente los datos

  return (
    <div>
      <h1>Dashboard Admin</h1>
      
      {error && (
        <div className="error">
          {error}
          <button onClick={clearMessages}>Cerrar</button>
        </div>
      )}
      
      {estadisticas && (
        <div className="stats">
          <div>Complejos: {estadisticas.total_complejos}</div>
          <div>Canchas: {estadisticas.total_canchas}</div>
          <div>Reservas/Mes: {estadisticas.reservas_mes}</div>
          <div>Ingresos/Mes: ${estadisticas.ingresos_mes}</div>
        </div>
      )}
      
      <div className="resources">
        <h2>Mis Complejos ({complejos.length})</h2>
        {complejos.map(complejo => (
          <div key={complejo.id}>
            <h3>{complejo.nombre}</h3>
            <p>{complejo.direccion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Gestión de Complejos

```typescript
// Ejemplo: Crear Complejo
'use client';
import { useState } from 'react';
import { useComplejos } from '@/hooks/useAdmin';

export default function CrearComplejo() {
  const {
    isLoading,
    error,
    success,
    complejos,
    createComplejo,
    clearMessages
  } = useComplejos();

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    descripcion: '',
    telefono: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createComplejo(formData);
    
    if (success) {
      // Reiniciar formulario
      setFormData({ nombre: '', direccion: '', descripcion: '', telefono: '' });
    }
  };

  return (
    <div>
      <h2>Crear Nuevo Complejo</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del complejo"
          value={formData.nombre}
          onChange={e => setFormData(prev => ({...prev, nombre: e.target.value}))}
          required
        />
        
        <input
          type="text"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={e => setFormData(prev => ({...prev, direccion: e.target.value}))}
          required
        />
        
        <textarea
          placeholder="Descripción (opcional)"
          value={formData.descripcion}
          onChange={e => setFormData(prev => ({...prev, descripcion: e.target.value}))}
        />
        
        <input
          type="tel"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={e => setFormData(prev => ({...prev, telefono: e.target.value}))}
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Complejo'}
        </button>
      </form>
    </div>
  );
}
```

### 4. Gestión de Canchas

```typescript
// Ejemplo: Lista y creación de canchas
'use client';
import { useCanchas } from '@/hooks/useAdmin';

export default function GestionCanchas() {
  const {
    isLoading,
    error,
    canchas,
    createCancha,
    updateCancha,
    deleteCancha,
    loadMisRecursos
  } = useCanchas();

  const handleCrearCancha = async () => {
    const nuevaCancha = {
      complejo_id: 1, // ID del complejo seleccionado
      nombre: 'Cancha Fútbol 1',
      tipo_deporte: 'Fútbol',
      capacidad_jugadores: 22,
      precio_hora: 25000,
      descripcion: 'Cancha de pasto sintético'
    };

    await createCancha(nuevaCancha);
  };

  const handleEditarCancha = async (id: number) => {
    const datosActualizados = {
      nombre: 'Cancha Fútbol 1 - Renovada',
      precio_hora: 30000
    };

    await updateCancha(id, datosActualizados);
  };

  const handleEliminarCancha = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta cancha?')) {
      await deleteCancha(id);
    }
  };

  return (
    <div>
      <h2>Gestión de Canchas</h2>
      
      <button onClick={handleCrearCancha} disabled={isLoading}>
        Crear Nueva Cancha
      </button>
      
      <div className="canchas-grid">
        {canchas.map(cancha => (
          <div key={cancha.id} className="cancha-card">
            <h3>{cancha.nombre}</h3>
            <p>Tipo: {cancha.tipo_deporte}</p>
            <p>Capacidad: {cancha.capacidad_jugadores} jugadores</p>
            <p>Precio: ${cancha.precio_hora}/hora</p>
            
            <div className="actions">
              <button onClick={() => handleEditarCancha(cancha.id)}>
                Editar
              </button>
              <button onClick={() => handleEliminarCancha(cancha.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. Hook Personalizado General

```typescript
// Ejemplo: Uso completo del hook principal
'use client';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminPanel() {
  const {
    state,
    loadDashboard,
    loadMisRecursos,
    createComplejo,
    updateComplejo,
    deleteComplejo,
    createCancha,
    clearMessages
  } = useAdmin();

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMisRecursos();
  }, []);

  // Refrescar dashboard
  const handleRefreshDashboard = async () => {
    await loadDashboard();
  };

  return (
    <div>
      <h1>Panel de Administración</h1>
      
      {/* Estado de carga */}
      {state.isLoading && <div>Cargando...</div>}
      
      {/* Mensajes de error/éxito */}
      {state.error && (
        <div className="alert error">
          {state.error}
          <button onClick={clearMessages}>×</button>
        </div>
      )}
      
      {state.success && (
        <div className="alert success">
          {state.success}
          <button onClick={clearMessages}>×</button>
        </div>
      )}
      
      {/* Datos */}
      <div>
        <h2>Mis Complejos ({state.data.complejos.length})</h2>
        <h2>Mis Canchas ({state.data.canchas.length})</h2>
        
        {state.data.estadisticas && (
          <div className="estadisticas">
            <h2>Estadísticas</h2>
            <p>Total Complejos: {state.data.estadisticas.total_complejos}</p>
            <p>Total Canchas: {state.data.estadisticas.total_canchas}</p>
            <p>Reservas del Mes: {state.data.estadisticas.reservas_mes}</p>
            <p>Ingresos del Mes: ${state.data.estadisticas.ingresos_mes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔗 Endpoints Disponibles

### Dashboard
- `GET /admin/dashboard` - Resumen completo
- `GET /admin/mis-recursos` - Complejos y canchas

### Complejos
- `GET /admin/complejos` - Listar mis complejos
- `POST /admin/complejos` - Crear complejo
- `PUT /admin/complejos/:id` - Actualizar complejo
- `DELETE /admin/complejos/:id` - Eliminar complejo

### Canchas
- `GET /admin/canchas` - Listar mis canchas
- `POST /admin/canchas` - Crear cancha
- `PUT /admin/canchas/:id` - Actualizar cancha
- `DELETE /admin/canchas/:id` - Eliminar cancha

### Reservas
- `GET /admin/reservas` - Ver reservas de mis canchas

---

## 🎨 Estilos Recomendados (Tailwind CSS)

```css
/* Clases útiles para el admin */
.admin-container { @apply max-w-6xl mx-auto p-6; }
.admin-card { @apply bg-white rounded-lg shadow p-6 mb-6; }
.admin-title { @apply text-2xl font-bold text-gray-900 mb-4; }
.admin-button { @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600; }
.admin-error { @apply bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded; }
.admin-success { @apply bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded; }
```

---

## 🚀 Instrucciones de Desarrollo

### 1. Iniciar el sistema
```bash
docker-compose up frontend backend
```

### 2. Acceder a las páginas
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### 3. Estructura de carpetas
```
src/
├── services/adminService.ts    # Llamadas API
├── hooks/useAdmin.ts          # Hook React  
├── types/admin.ts             # TypeScript types
└── app/admin/                 # Páginas admin
```

### 4. Testing
- Todos los endpoints están configurados
- Los hooks manejan estado automáticamente
- Manejo de errores integrado

---

## 🔧 Notas Técnicas

- **Autenticación**: Usar JWT token en headers
- **Estados**: Loading, error y success manejados automáticamente  
- **TypeScript**: Tipos completos definidos
- **Docker**: Todo configurado para desarrollo
- **API**: Conexión al backend en puerto 4000

¡El sistema está completamente funcional y listo para usar! 🎉