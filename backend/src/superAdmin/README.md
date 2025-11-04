# 👑 SuperAdmin Module - Endpoints

## 📋 **Endpoints Disponibles**

### 🔐 **Autenticación de Administrador**

#### `POST /api/superadmin/auth/login`
Iniciar sesión como administrador o superadministrador.

#### `POST /api/superadmin/auth/logout`
Cerrar sesión del administrador.

### 👥 **Gestión de Usuarios**

#### `GET /api/superadmin/users`
Obtener lista paginada de usuarios del sistema.

#### `GET /api/superadmin/users/:id`
Obtener detalles específicos de un usuario.

#### `PATCH /api/superadmin/users/:id`
Actualizar datos de un usuario específico.

#### `DELETE /api/superadmin/users/:id`
Desactivar/eliminar usuario del sistema (soft delete).

### 🏟️ **Gestión de Complejos Deportivos**

#### `GET /api/superadmin/complejos`
Listar todos los complejos deportivos.

#### `GET /api/superadmin/complejos/:id`
Obtener detalles de un complejo deportivo específico.

#### `GET /api/superadmin/complejos/:id/canchas`
Obtener todas las canchas de un complejo específico.

### 🛠️ **Administración del Sistema (SuperAdmin)**

#### `POST /api/superadmin/system/parameters`
Actualizar configuración del sistema.

#### `GET /api/superadmin/system/statistics`
Obtener estadísticas del sistema.

#### `GET /api/superadmin/system/logs`
Obtener logs del sistema.

### 📊 **Estadísticas Completas (SuperAdmin)**

#### `GET /api/super_admin/estadisticas/completas`
Obtener estadísticas completas del sistema para el dashboard de SuperAdmin.

**Headers requeridos:**
```
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": {
    "metricas_generales": {
      "usuarios_totales": 1250,
      "canchas_registradas": 45,
      "cantidad_administradores": 8,
      "reservas_hoy": 23
    },
    "metricas_mensuales": {
      "ganancias_mes": 1850000.50,
      "reservas_totales_mes": 342,
      "ocupacion_mensual": 67.8,
      "valoracion_promedio": 4.3
    },
    "reservas_por_dia": [
      {
        "fecha": "2025-10-05",
        "dia_semana": "Martes",
        "cantidad_reservas": 12,
        "ingresos": 48000
      },
      // ... 29 días más
    ],
    "reservas_por_deporte": [
      {
        "deporte": "futbol",
        "cantidad_reservas": 180,
        "porcentaje": 52.6,
        "ingresos": 900000
      },
      {
        "deporte": "tenis",
        "cantidad_reservas": 98,
        "porcentaje": 28.7,
        "ingresos": 490000
      },
      // ... otros deportes
    ],
    "top_canchas": [
      {
        "cancha_id": 12,
        "cancha_nombre": "Cancha Fútbol 7 Premium",
        "complejo_nombre": "Complejo Central",
        "tipo_deporte": "futbol",
        "cantidad_reservas": 67,
        "ocupacion_porcentaje": 15.95,
        "tendencia": "subida",
        "variacion_porcentaje": 23.5
      },
      // ... top 5
    ],
    "top_horarios": [
      {
        "dia_semana": "Sábado",
        "hora_inicio": "18:00",
        "cantidad_reservas": 45,
        "ingresos": 225000,
        "tendencia": "subida",
        "variacion_porcentaje": 12.5
      },
      // ... top 5
    ],
    "fecha_generacion": "2025-11-04T15:30:00.000Z",
    "periodo_analisis": "2025-10-05 - 2025-11-04"
  }
}
```

**Estructura de datos:**

**Métricas Generales:**
- `usuarios_totales`: Total de usuarios registrados en la plataforma
- `canchas_registradas`: Total de canchas en el sistema
- `cantidad_administradores`: Usuarios con rol admin o super_admin
- `reservas_hoy`: Reservas realizadas el día actual

**Métricas Mensuales:**
- `ganancias_mes`: Ingresos totales del último mes (solo reservas pagadas)
- `reservas_totales_mes`: Total de reservas en los últimos 30 días
- `ocupacion_mensual`: Porcentaje de ocupación (0-100)
- `valoracion_promedio`: Calificación promedio de todas las canchas (0-5)

**Reservas por Día:**
- Array de 30 elementos (últimos 30 días)
- Cada día incluye: fecha, día de la semana, cantidad de reservas e ingresos
- Útil para gráfico de líneas o barras

**Reservas por Deporte:**
- Agrupación de reservas por tipo de cancha (fútbol, tenis, etc.)
- Incluye cantidad, porcentaje del total e ingresos
- Útil para gráfico de torta o barras

**Top 5 Canchas:**
- Las 5 canchas más populares del mes
- Incluye: nombre, complejo, tipo, reservas, ocupación y tendencia
- Tendencia: 'subida', 'bajada' o 'estable' vs mes anterior
- Variación en porcentaje respecto al mes anterior

**Top 5 Horarios:**
- Los 5 horarios más solicitados
- Incluye: día, hora, cantidad de reservas, ingresos y tendencia
- Útil para optimizar precios en horarios peak

**Ejemplo de uso desde el frontend:**
```typescript
// Servicio
export const getEstadisticasSuperAdmin = async () => {
  const response = await apiBackend.get('/super_admin/estadisticas/completas');
  return response.data;
};

// Componente React
const DashboardSuperAdmin = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  
  useEffect(() => {
    const cargarEstadisticas = async () => {
      const result = await getEstadisticasSuperAdmin();
      if (result.ok) {
        setEstadisticas(result.data);
      }
    };
    cargarEstadisticas();
  }, []);

  if (!estadisticas) return <Loading />;

  return (
    <div className="dashboard">
      <h1>Dashboard SuperAdmin</h1>
      
      {/* KPIs Principales */}
      <div className="kpis">
        <KPI 
          label="Usuarios Totales" 
          value={estadisticas.metricas_generales.usuarios_totales} 
        />
        <KPI 
          label="Ganancias del Mes" 
          value={`$${estadisticas.metricas_mensuales.ganancias_mes.toLocaleString()}`} 
        />
        <KPI 
          label="Ocupación" 
          value={`${estadisticas.metricas_mensuales.ocupacion_mensual.toFixed(1)}%`} 
        />
      </div>

      {/* Gráficos */}
      <BarChart 
        data={estadisticas.reservas_por_dia}
        xKey="dia_semana"
        yKey="cantidad_reservas"
        title="Reservas por Día"
      />
      
      <PieChart 
        data={estadisticas.reservas_por_deporte}
        labelKey="deporte"
        valueKey="cantidad_reservas"
        title="Reservas por Deporte"
      />

      {/* Top Canchas */}
      <TopList 
        items={estadisticas.top_canchas}
        title="Top 5 Canchas"
      />

      {/* Top Horarios */}
      <TopList 
        items={estadisticas.top_horarios}
        title="Horarios Más Solicitados"
      />
    </div>
  );
};
```

### 📊 **Dashboard y Utilidades**

#### `GET /api/superadmin/dashboard`
Obtener datos para el dashboard principal de administración.

#### `GET /api/superadmin/search?q=term`
Realizar búsqueda global en todo el sistema.
