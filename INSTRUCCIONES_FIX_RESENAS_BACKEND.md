# 🐛 ERROR CRÍTICO: Endpoint GET /resenas en FastAPI

**Fecha**: 30 de octubre de 2025  
**Prioridad**: 🔴 ALTA  
**Módulo Afectado**: FastAPI - Reseñas  
**Responsable**: Equipo Backend (FastAPI)

---

## 📋 Descripción del Problema

El endpoint `GET /api/resenas` está devolviendo un error SQL que impide listar las reseñas.

### Error SQL Completo

```
(psycopg2.errors.UndefinedTable) missing FROM-clause entry for table "agg"
LINE 21:     SELECT b.*, agg.promedio_rating, agg.total_resenas
                         ^^^

[SQL: 
    WITH base AS (
      SELECT
        r.id_resena,
        r.id_usuario,
        r.id_cancha,
        r.id_complejo,
        r.puntuacion AS calificacion,
        r.comentario,
        r.esta_activa,
        r.created_at,
        NULL::timestamptz AS updated_at
      FROM resenas r
      ORDER BY r.created_at DESC
      LIMIT %(limit)s OFFSET %(offset)s
    )
    
    SELECT b.*, agg.promedio_rating, agg.total_resenas  ❌ ERROR AQUÍ
    FROM base b
]
```

**Causa**: La consulta intenta usar `agg.promedio_rating` y `agg.total_resenas` pero el CTE (Common Table Expression) `agg` **no está definido**.

---

## ✅ SOLUCIÓN (Opción Recomendada)

### SQL Corregido

Eliminar las referencias a las columnas `agg.*` que no existen:

```sql
WITH base AS (
  SELECT
    r.id_resena,
    r.id_usuario,
    r.id_cancha,
    r.id_complejo,
    r.puntuacion AS calificacion,
    r.comentario,
    r.esta_activa,
    r.created_at,
    NULL::timestamptz AS updated_at
  FROM resenas r
  WHERE 1=1
  -- Aquí irían los filtros opcionales (id_cancha, id_complejo, etc.)
  ORDER BY r.created_at DESC
  LIMIT %(limit)s OFFSET %(offset)s
)

SELECT b.*  -- ✅ Sin agg.promedio_rating ni agg.total_resenas
FROM base b
```

### Código Python Sugerido

Si estás usando **raw SQL** en tu repositorio:

```python
def listar_resenas(
    db: Session,
    id_cancha: Optional[int] = None,
    id_complejo: Optional[int] = None,
    order: str = "recientes",
    page: int = 1,
    page_size: int = 20
):
    offset = (page - 1) * page_size
    
    query = """
        WITH base AS (
          SELECT
            r.id_resena,
            r.id_usuario,
            r.id_cancha,
            r.id_complejo,
            r.puntuacion AS calificacion,
            r.comentario,
            r.esta_activa,
            r.created_at,
            NULL::timestamptz AS updated_at
          FROM resenas r
          WHERE 1=1
    """
    
    params = {"limit": page_size, "offset": offset}
    
    # Filtros opcionales
    if id_cancha:
        query += " AND r.id_cancha = :id_cancha"
        params["id_cancha"] = id_cancha
    
    if id_complejo:
        query += " AND r.id_complejo = :id_complejo"
        params["id_complejo"] = id_complejo
    
    # Ordenamiento
    if order == "mejor":
        query += " ORDER BY r.puntuacion DESC, r.created_at DESC"
    elif order == "peor":
        query += " ORDER BY r.puntuacion ASC, r.created_at DESC"
    else:  # recientes (default)
        query += " ORDER BY r.created_at DESC"
    
    query += """
          LIMIT :limit OFFSET :offset
        )
        SELECT b.*
        FROM base b
    """
    
    result = db.execute(text(query), params)
    return result.fetchall()
```

Si usas **SQLAlchemy ORM**:

```python
from sqlalchemy import select

def listar_resenas(
    db: Session,
    id_cancha: Optional[int] = None,
    id_complejo: Optional[int] = None,
    order: str = "recientes",
    page: int = 1,
    page_size: int = 20
):
    query = select(Resena)
    
    # Filtros
    if id_cancha:
        query = query.where(Resena.id_cancha == id_cancha)
    if id_complejo:
        query = query.where(Resena.id_complejo == id_complejo)
    
    # Ordenamiento
    if order == "mejor":
        query = query.order_by(Resena.puntuacion.desc(), Resena.created_at.desc())
    elif order == "peor":
        query = query.order_by(Resena.puntuacion.asc(), Resena.created_at.desc())
    else:
        query = query.order_by(Resena.created_at.desc())
    
    # Paginación
    offset = (page - 1) * page_size
    query = query.limit(page_size).offset(offset)
    
    return db.execute(query).scalars().all()
```

---

## 🔍 Dónde Buscar el Código

Archivos probables en el repositorio de FastAPI:

```
app/
├── modules/resenas/
│   ├── repository.py    ← 🎯 BUSCAR AQUÍ PRIMERO
│   ├── service.py
│   └── router.py
├── repositories/
│   └── resena_repository.py
└── services/
    └── resena_service.py
```

Comando para encontrar el archivo:

```bash
grep -r "agg.promedio_rating" app/
grep -r "WITH base AS" app/ | grep resena
```

---

## 🧪 Testing de la Corrección

### 1. Después de Aplicar el Fix

```bash
# Reiniciar FastAPI
uvicorn main:app --reload

# Probar endpoint sin filtros
curl -X GET "http://localhost:8000/api/resenas?page=1&page_size=10"

# Probar con filtro por cancha
curl -X GET "http://localhost:8000/api/resenas?id_cancha=1"

# Probar con ordenamiento
curl -X GET "http://localhost:8000/api/resenas?order=mejor"
```

### 2. Verificar en Frontend

Una vez corregido, ir a:
```
http://localhost:3000/admin/resenas
```

Debería:
- ✅ Mostrar lista de reseñas (si existen en BD)
- ✅ NO mostrar el mensaje de advertencia amarillo
- ✅ Permitir buscar, filtrar y ordenar

---

## 📊 Impacto Actual

### Funcionalidades Bloqueadas

- ❌ Listar reseñas en panel de administración
- ❌ Ver estadísticas de reseñas por cancha/complejo
- ❌ Filtrar reseñas en cualquier parte del frontend

### Funcionalidades que SÍ Funcionan

- ✅ Crear reseñas individuales (POST)
- ✅ Actualizar reseñas (PATCH)
- ✅ Eliminar reseñas (DELETE)
- ✅ Reportar reseñas (POST)

**Nota**: El error solo afecta al endpoint de LISTADO (GET).

---

## 📝 Commit Sugerido

```bash
git checkout -b fix/resenas-sql-undefined-table

# Editar archivo con el fix

git add app/modules/resenas/repository.py
git commit -m "fix(resenas): remove undefined CTE 'agg' from list query

- Removed agg.promedio_rating and agg.total_resenas from SELECT
- Simplified query to return only base resena data
- Fixes psycopg2.errors.UndefinedTable SQL error

Resolves: GET /resenas endpoint error"

git push origin fix/resenas-sql-undefined-table
```

---

## ❓ ¿Por Qué Existía `agg`?

Probablemente era código incompleto o copiado de otro endpoint. Las columnas `promedio_rating` y `total_resenas`:

- No se usan en el frontend actual
- No están en la interfaz `Resena` del BFF
- Pueden calcularse aparte si se necesitan después

Si más adelante necesitas promedios:
- Crea un endpoint separado: `GET /resenas/estadisticas`
- O calcula en el frontend con los datos ya obtenidos

---

## ✅ Checklist

- [ ] Localizado archivo con la consulta SQL
- [ ] Eliminadas referencias a `agg.promedio_rating` y `agg.total_resenas`
- [ ] Reiniciado FastAPI
- [ ] Testeado con curl (sin error SQL)
- [ ] Verificado en frontend `/admin/resenas`
- [ ] Commit realizado

---

## 🆘 Ayuda Adicional

Si necesitas más información o encuentras problemas al aplicar el fix, contactar al equipo de frontend.

**Archivos de referencia**:
- Este documento: `INSTRUCCIONES_FIX_RESENAS_BACKEND.md`
- Documentación adicional: `FIX_RESENAS_SQL_COMPLETO.md` (más detalles técnicos)

---

**Tiempo estimado para aplicar el fix**: 10-15 minutos ⏱️
