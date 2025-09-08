# 🏆 SportHub Temuco - Taller Integración II

Aplicación web completa con arquitectura limpia que incluye frontend (Next.js), backend (Express + TypeScript) y base de datos (PostgreSQL).

## 🚀 Configuración e Instalación

### Prerrequisitos
- **Docker** y **Docker Compose** instalados
- **Git** para clonar el repositorio
- **DBeaver** (opcional) para gestión de base de datos

### 📋 Pasos para ejecutar la aplicación

#### 1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd Taller_Integracion_II
```

#### 2. **Instalar Docker Compose** (si no está instalado)
```bash
# En Arch Linux
sudo pacman -S docker-compose

# En Ubuntu/Debian
sudo apt-get install docker-compose

# En otras distribuciones, consultar documentación
```

#### 3. **Inicializar la aplicación completa**
```bash
# Ejecutar todos los servicios (Frontend + Backend + Base de datos)
docker-compose up --build

# O en modo detached (en segundo plano)
docker-compose up -d --build
```

#### 4. **Verificar que todo esté funcionando**
- **Frontend (Next.js):** http://localhost:3000
- **Backend (Express API):** http://localhost:4000
- **Base de datos (PostgreSQL):** localhost:5432

### 🔧 Comandos útiles

#### **Gestión de contenedores**
```bash
# Ver contenedores ejecutándose
docker-compose ps

# Detener todos los servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir imágenes (si cambias dependencias)
docker-compose up --build
```

#### **Gestión individual de servicios**
```bash
# Solo frontend y base de datos
docker-compose up frontend db

# Solo backend y base de datos
docker-compose up backend db

# Reiniciar solo el backend
docker-compose restart backend
```

#### **Acceder a contenedores**
```bash
# Acceder al contenedor del backend
docker exec -it taller_integracion_ii-backend-1 sh

# Acceder al contenedor del frontend
docker exec -it taller_integracion_ii-frontend-1 sh

# Acceder a PostgreSQL
docker exec -it pg_local psql -U sporthub_admin -d sporthubBD
```

### 🗄️ Configuración de Base de Datos

#### **Datos de conexión PostgreSQL:**
- **Host:** localhost
- **Puerto:** 5432
- **Usuario:** sporthub_admin
- **Contraseña:** 1234
- **Base de datos:** sporthubBD

#### **Conectar con DBeaver:**
1. Crear nueva conexión PostgreSQL
2. Usar los datos anteriores
3. Probar conexión

### 📁 Estructura del Proyecto

```
Taller_Integracion_II/
├── sporthub-temuco/          # Frontend (Next.js + TypeScript)
│   ├── src/                  # Código fuente
│   ├── public/               # Archivos estáticos
│   ├── Dockerfile            # Configuración Docker
│   └── package.json          # Dependencias
├── backend/                  # Backend (Express + TypeScript)
│   ├── src/                  # Código fuente con arquitectura limpia
│   │   ├── application/      # Casos de uso
│   │   ├── domain/           # Entidades y reglas de negocio
│   │   ├── infrastructure/   # Base de datos, APIs externas
│   │   ├── interfaces/       # Controllers, rutas HTTP
│   │   └── index.ts          # Punto de entrada
│   ├── Dockerfile            # Configuración Docker
│   └── package.json          # Dependencias
├── docker-compose.yml        # Orquestación de servicios
└── README.md                 # Este archivo
```

### 🐛 Solución de Problemas

#### **Error: "docker-compose command not found"**
```bash
# Usar la versión nueva de Docker Compose
docker compose up --build
```

#### **Error: Puerto ya en uso**
```bash
# Verificar qué está usando el puerto
sudo lsof -i :3000
sudo lsof -i :4000
sudo lsof -i :5432

# Detener servicios que usen esos puertos
docker-compose down
```

#### **Error: Contenedor ya existe**
```bash
# Eliminar contenedores existentes
docker-compose down
docker container prune

# Reiniciar limpio
docker-compose up --build
```

### 🔄 Flujo de Desarrollo

1. **Hacer cambios en el código** (frontend o backend)
2. **Los cambios se reflejan automáticamente** (hot reload activado)
3. **Para cambios en dependencias:** `docker-compose up --build`
4. **Para apagar todo:** `docker-compose down`

### 🛑 Apagar la Aplicación

```bash
# Detener servicios (conserva volúmenes)
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Al apagar el PC, los contenedores se detienen automáticamente
# Para reiniciar después: docker-compose up
```

---

**¡Listo para desarrollar! 🎉**

Si encuentras algún problema, revisa la sección de solución de problemas o verifica que Docker esté ejecutándose correctamente.

