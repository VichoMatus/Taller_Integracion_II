# 🚀 Admin/Owner - Uso Básico

## ✅ Sistema Implementado
- **Backend**: Endpoints de admin listos
- **Frontend**: Hook `useAdmin` configurado
- **Docker**: Corriendo en puertos 3000/4000

---

## 🔥 Uso Rápido - 3 Pasos

### 1. Importar el Hook
```javascript
import { useAdmin } from '@/hooks/useAdmin';
```

### 2. Usar en tu Componente
```javascript
export default function MiComponenteAdmin() {
  const { state, loadMisRecursos, createComplejo } = useAdmin();
  
  // Cargar datos
  useEffect(() => {
    loadMisRecursos();
  }, []);
  
  // Crear complejo
  const handleCrear = async () => {
    await createComplejo({
      nombre: 'Mi Complejo',
      direccion: 'Av. Alemania 1234, Temuco'
    });
  };
  
  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={handleCrear}>Crear Complejo</button>
      
      <div>Complejos: {state.data.complejos.length}</div>
      <div>Canchas: {state.data.canchas.length}</div>
    </div>
  );
}
```

### 3. ¡Listo! 🎉

---

## 📋 Funciones Disponibles

```javascript
const {
  // ESTADO
  state: {
    isLoading,        // true/false
    error,           // string | null  
    success,         // string | null
    data: {
      complejos,     // Array de complejos
      canchas,       // Array de canchas
      estadisticas   // Stats del dashboard
    }
  },
  
  // ACCIONES
  loadDashboard,           // Cargar dashboard completo
  loadMisRecursos,         // Cargar complejos + canchas
  createComplejo(data),    // Crear complejo
  updateComplejo(id, data), // Actualizar complejo
  deleteComplejo(id),      // Eliminar complejo
  createCancha(data),      // Crear cancha
  updateCancha(id, data),  // Actualizar cancha
  deleteCancha(id),        // Eliminar cancha
  clearMessages()          // Limpiar error/success
  
} = useAdmin();
```

---

## 🏗️ Ejemplos de Datos

### Crear Complejo
```javascript
await createComplejo({
  nombre: 'Complejo Deportivo Central',
  direccion: 'Av. Alemania 1234, Temuco',
  descripcion: 'Complejo con canchas de fútbol',
  telefono: '+56 9 1234 5678'
});
```

### Crear Cancha
```javascript
await createCancha({
  complejo_id: 1,
  nombre: 'Cancha Fútbol 1',
  tipo_deporte: 'Fútbol',
  capacidad_jugadores: 22,
  precio_hora: 25000,
  descripcion: 'Cancha de pasto sintético'
});
```

---

## 🔗 URLs del Sistema
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Documentación**: Ver archivos README en el proyecto

---

## ⚡ Hooks Especializados

```javascript
// Dashboard específico
import { useAdminDashboard } from '@/hooks/useAdmin';
const { complejos, canchas, estadisticas, loadDashboard } = useAdminDashboard();

// Solo complejos
import { useComplejos } from '@/hooks/useAdmin';
const { complejos, createComplejo, updateComplejo, deleteComplejo } = useComplejos();

// Solo canchas  
import { useCanchas } from '@/hooks/useAdmin';
const { canchas, createCancha, updateCancha, deleteCancha } = useCanchas();
```

---

## 🎯 Próximos Pasos

1. **Copia** el código de ejemplo
2. **Personaliza** según tus necesidades
3. **Agrega** validaciones y estilos
4. **Conecta** con tu sistema de autenticación

**¡El sistema está 100% funcional y listo para usar!** 🚀