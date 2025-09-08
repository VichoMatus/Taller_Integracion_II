-- =============================================================
--  SportHubTemuco - Esquema completo (Web + Móvil)
--  Base en español, con roles y módulos: usuarios, complejos,
--  canchas, reglas de precio, horarios, bloqueos, reservas,
--  promociones, notificaciones, reseñas, grupos, pagos, denuncias.
--  Incluye PostGIS para búsqueda por distancia y exclusiones
--  en reservas (no solapamiento) con tstzrange.
-- =============================================================

-- Modo seguro
BEGIN;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;           -- para EXCLUDE con =
CREATE EXTENSION IF NOT EXISTS pgcrypto;             -- por si se usan uuid/funcs

-- Tipos enumerados
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario') THEN
        CREATE TYPE rol_usuario AS ENUM ('usuario','dueno','admin','superadmin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_reserva') THEN
        CREATE TYPE estado_reserva AS ENUM ('pendiente','confirmada','cancelada','expirada');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_promocion') THEN
        CREATE TYPE estado_promocion AS ENUM ('activa','inactiva');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dia_semana') THEN
        CREATE TYPE dia_semana AS ENUM ('lunes','martes','miercoles','jueves','viernes','sabado','domingo');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacidad_grupo') THEN
        CREATE TYPE privacidad_grupo AS ENUM ('publico','privado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_miembro_grupo') THEN
        CREATE TYPE rol_miembro_grupo AS ENUM ('miembro','admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_membresia') THEN
        CREATE TYPE estado_membresia AS ENUM ('pendiente','aceptado','rechazado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_denuncia') THEN
        CREATE TYPE estado_denuncia AS ENUM ('abierta','en_revision','resuelta','rechazada');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_pago') THEN
        CREATE TYPE estado_pago AS ENUM ('creado','autorizado','pagado','fallido','reembolsado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_descuento') THEN
        CREATE TYPE tipo_descuento AS ENUM ('porcentaje','monto_fijo');
    END IF;
END $$;

-- Función util para fecha_actualizacion
CREATE OR REPLACE FUNCTION set_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- Catálogos
-- =====================================
CREATE TABLE IF NOT EXISTS deportes (
  id_deporte    SERIAL PRIMARY KEY,
  nombre        VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO deportes (nombre) VALUES
('futbol'),('futbolito'),('baby futbol'),('paddle'),('tenis'),
('basquetbol'),('voleibol')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS comunas (
  id_comuna     SERIAL PRIMARY KEY,
  nombre        VARCHAR(80) UNIQUE NOT NULL
);

-- =====================================
-- Núcleo: usuarios
-- =====================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario      BIGSERIAL PRIMARY KEY,
  nombre          VARCHAR(120),
  apellido        VARCHAR(120),
  email           VARCHAR(160) UNIQUE NOT NULL,
  telefono        VARCHAR(30),
  contrasena_hash TEXT NOT NULL,
  rol             rol_usuario NOT NULL DEFAULT 'usuario',
  esta_activo     BOOLEAN NOT NULL DEFAULT TRUE,
  verificado      BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url      VARCHAR(512),
  google_id       VARCHAR(120),
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_usuarios_updated
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

-- =====================================
-- Complejos y servicios
-- =====================================
CREATE TABLE IF NOT EXISTS complejos (
  id_complejo   BIGSERIAL PRIMARY KEY,
  id_dueno      BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  nombre        VARCHAR(160) NOT NULL,
  descripcion   TEXT,
  direccion     VARCHAR(200),
  id_comuna     INT REFERENCES comunas(id_comuna) ON DELETE SET NULL,
  latitud       NUMERIC(9,6),
  longitud      NUMERIC(9,6),
  loc           geography(Point, 4326),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_complejos_updated
BEFORE UPDATE ON complejos
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

-- Sincronizar loc cuando lat/long existan (solo una vez si se desea)
-- (Para cambios app-side, actualizar loc desde la app)
UPDATE complejos
SET loc = ST_SetSRID(ST_MakePoint(longitud::float, latitud::float),4326)::geography
WHERE loc IS NULL AND latitud IS NOT NULL AND longitud IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_complejos_loc_gist ON complejos USING GIST (loc);

CREATE TABLE IF NOT EXISTS servicios (
  id_servicio  SERIAL PRIMARY KEY,
  nombre       VARCHAR(80) UNIQUE NOT NULL,
  icono        VARCHAR(60)
);

INSERT INTO servicios (nombre, icono) VALUES
('Estacionamiento','car'),
('Iluminación','sun'),
('Camarines','hanger'),
('Duchas','shower'),
('Arriendo implementos','package')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS complejo_servicios (
  id_complejo  BIGINT NOT NULL REFERENCES complejos(id_complejo) ON DELETE CASCADE,
  id_servicio  INT    NOT NULL REFERENCES servicios(id_servicio) ON DELETE RESTRICT,
  PRIMARY KEY (id_complejo, id_servicio)
);

-- Fotos de complejo
CREATE TABLE IF NOT EXISTS fotos_complejo (
  id_foto     BIGSERIAL PRIMARY KEY,
  id_complejo BIGINT NOT NULL REFERENCES complejos(id_complejo) ON DELETE CASCADE,
  url_foto    VARCHAR(512) NOT NULL,
  orden       INT NOT NULL DEFAULT 1,
  fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_complejo, orden)
);

-- =====================================
-- Canchas y fotos
-- =====================================
CREATE TABLE IF NOT EXISTS canchas (
  id_cancha     BIGSERIAL PRIMARY KEY,
  id_complejo   BIGINT NOT NULL REFERENCES complejos(id_complejo) ON DELETE CASCADE,
  nombre        VARCHAR(160) NOT NULL,
  id_deporte    INT NOT NULL REFERENCES deportes(id_deporte) ON DELETE RESTRICT,
  cubierta      BOOLEAN NOT NULL DEFAULT FALSE,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_canchas_complejo ON canchas(id_complejo);

CREATE TRIGGER trg_canchas_updated
BEFORE UPDATE ON canchas
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

CREATE TABLE IF NOT EXISTS fotos_cancha (
  id_foto    BIGSERIAL PRIMARY KEY,
  id_cancha  BIGINT NOT NULL REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  url_foto   VARCHAR(512) NOT NULL,
  orden      INT NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_cancha, orden)
);

-- =====================================
-- Reglas de precio, horarios y bloqueos
-- =====================================
CREATE TABLE IF NOT EXISTS reglas_precio (
  id_regla        BIGSERIAL PRIMARY KEY,
  id_cancha       BIGINT NOT NULL REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  dia             dia_semana,                                 -- opcional; null = todos
  hora_inicio     TIME NOT NULL,
  hora_fin        TIME NOT NULL,
  precio_por_hora NUMERIC(10,2) NOT NULL CHECK (precio_por_hora >= 0),
  vigente_desde   DATE,
  vigente_hasta   DATE,
  fecha_creacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (hora_inicio < hora_fin)
);

CREATE INDEX IF NOT EXISTS idx_reglas_precio_cancha ON reglas_precio(id_cancha);

CREATE TRIGGER trg_reglas_precio_updated
BEFORE UPDATE ON reglas_precio
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

CREATE TABLE IF NOT EXISTS horarios_atencion (
  id_horario    BIGSERIAL PRIMARY KEY,
  id_complejo   BIGINT NOT NULL REFERENCES complejos(id_complejo) ON DELETE CASCADE,
  id_cancha     BIGINT REFERENCES canchas(id_cancha) ON DELETE CASCADE, -- null = horario general del complejo
  dia           dia_semana NOT NULL,
  hora_apertura TIME NOT NULL,
  hora_cierre   TIME NOT NULL,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (hora_apertura < hora_cierre)
);

CREATE INDEX IF NOT EXISTS idx_horarios_complejo ON horarios_atencion(id_complejo, dia);
CREATE INDEX IF NOT EXISTS idx_horarios_cancha   ON horarios_atencion(id_cancha, dia);

CREATE TRIGGER trg_horarios_updated
BEFORE UPDATE ON horarios_atencion
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

CREATE TABLE IF NOT EXISTS bloqueos (
  id_bloqueo    BIGSERIAL PRIMARY KEY,
  id_cancha     BIGINT NOT NULL REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  inicio        TIMESTAMPTZ NOT NULL,
  fin           TIMESTAMPTZ NOT NULL,
  motivo        VARCHAR(200),
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (inicio < fin)
);

CREATE INDEX IF NOT EXISTS idx_bloqueos_cancha ON bloqueos(id_cancha);
-- Quita el índice anterior (por si se creó a medias)
DROP INDEX IF EXISTS idx_bloqueos_rango;

-- Índice GIST por rango de tiempo SIN date_trunc y con zona horaria
CREATE INDEX IF NOT EXISTS idx_bloqueos_rango
  ON bloqueos USING GIST (
    tstzrange(inicio, fin, '[)')
  );

CREATE TRIGGER trg_bloqueos_updated
BEFORE UPDATE ON bloqueos
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

-- =====================================
-- Reservas (sin solapamiento por cancha)
-- =====================================
CREATE TABLE IF NOT EXISTS reservas (
  id_reserva    BIGSERIAL PRIMARY KEY,
  id_cancha     BIGINT NOT NULL REFERENCES canchas(id_cancha) ON DELETE RESTRICT,
  id_usuario    BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  inicio        TIMESTAMPTZ NOT NULL,
  fin           TIMESTAMPTZ NOT NULL,
  estado        estado_reserva NOT NULL DEFAULT 'pendiente',
  precio_total  NUMERIC(12,2) CHECK (precio_total IS NULL OR precio_total >= 0),
  notas         TEXT,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (inicio < fin)
);

CREATE INDEX IF NOT EXISTS idx_reservas_cancha ON reservas(id_cancha);
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_reservas_rango ON reservas USING GIST (tstzrange(inicio, fin, '[)'));

-- Exclusión de solapamientos por cancha, solo si la reserva está activa (pendiente/confirmada)
-- Nota: requiere btree_gist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'excl_reservas_solapadas'
    ) THEN
        ALTER TABLE reservas
        ADD CONSTRAINT excl_reservas_solapadas
        EXCLUDE USING GIST (
            id_cancha WITH =,
            tstzrange(inicio, fin, '[)') WITH &&
        )
        WHERE (estado IN ('pendiente','confirmada'));
    END IF;
END $$;

CREATE TRIGGER trg_reservas_updated
BEFORE UPDATE ON reservas
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

-- =====================================
-- Promociones
-- =====================================
CREATE TABLE IF NOT EXISTS promociones (
  id_promocion  BIGSERIAL PRIMARY KEY,
  id_complejo   BIGINT REFERENCES complejos(id_complejo) ON DELETE CASCADE,
  id_cancha     BIGINT REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  titulo        VARCHAR(160) NOT NULL,
  descripcion   TEXT,
  tipo          tipo_descuento NOT NULL,                  -- porcentaje | monto_fijo
  valor         NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
  estado        estado_promocion NOT NULL DEFAULT 'activa',
  vigente_desde DATE,
  vigente_hasta DATE,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ( (id_complejo IS NOT NULL) OR (id_cancha IS NOT NULL) ),
  CHECK ( NOT (id_complejo IS NOT NULL AND id_cancha IS NOT NULL) ) -- exactamente uno
);

CREATE INDEX IF NOT EXISTS idx_promos_complejo ON promociones(id_complejo);
CREATE INDEX IF NOT EXISTS idx_promos_cancha   ON promociones(id_cancha);

CREATE TRIGGER trg_promos_updated
BEFORE UPDATE ON promociones
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

-- =====================================
-- Notificaciones
-- =====================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion  BIGSERIAL PRIMARY KEY,
  id_destinatario  BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  titulo           VARCHAR(160) NOT NULL,
  cuerpo           TEXT NOT NULL,
  leida            BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notificaciones(id_destinatario, leida);

-- =====================================
-- Reseñas
-- =====================================
CREATE TABLE IF NOT EXISTS resenas (
  id_resena     BIGSERIAL PRIMARY KEY,
  id_usuario    BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_complejo   BIGINT REFERENCES complejos(id_complejo) ON DELETE CASCADE,
  id_cancha     BIGINT REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  puntuacion    SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario    TEXT,
  esta_activa   BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ( (id_complejo IS NOT NULL) <> (id_cancha IS NOT NULL) ) -- XOR: uno u otro
);

-- Una reseña activa por usuario y objetivo
CREATE UNIQUE INDEX IF NOT EXISTS uq_resena_user_complejo
ON resenas (id_usuario, id_complejo)
WHERE id_complejo IS NOT NULL AND esta_activa = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_resena_user_cancha
ON resenas (id_usuario, id_cancha)
WHERE id_cancha IS NOT NULL AND esta_activa = TRUE;

-- =====================================
-- Grupos y miembros
-- =====================================
CREATE TABLE IF NOT EXISTS grupos (
  id_grupo     BIGSERIAL PRIMARY KEY,
  id_creador   BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  nombre       VARCHAR(120) NOT NULL,
  descripcion  TEXT,
  privacidad   privacidad_grupo NOT NULL DEFAULT 'publico',
  cupos        INT CHECK (cupos IS NULL OR cupos >= 1),
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_grupos_updated
BEFORE UPDATE ON grupos
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

CREATE TABLE IF NOT EXISTS grupo_miembros (
  id_grupo        BIGINT NOT NULL REFERENCES grupos(id_grupo) ON DELETE CASCADE,
  id_usuario      BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  rol             rol_miembro_grupo NOT NULL DEFAULT 'miembro',
  estado          estado_membresia NOT NULL DEFAULT 'pendiente',
  fecha_ingreso   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_grupo, id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_grupo_miembros_estado ON grupo_miembros(id_grupo, estado);

-- =====================================
-- Pagos y Webhooks
-- =====================================
CREATE TABLE IF NOT EXISTS pagos (
  id_pago       BIGSERIAL PRIMARY KEY,
  id_reserva    BIGINT NOT NULL REFERENCES reservas(id_reserva) ON DELETE CASCADE,
  proveedor     VARCHAR(40) NOT NULL,                         -- 'khipu','mercadopago','stripe', etc.
  id_externo    VARCHAR(120),                                 -- payment_intent/collection_id/etc.
  moneda        VARCHAR(10) NOT NULL DEFAULT 'CLP',
  monto         NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
  estado        estado_pago NOT NULL DEFAULT 'creado',
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_reserva ON pagos(id_reserva);
CREATE INDEX IF NOT EXISTS idx_pagos_estado  ON pagos(estado);

CREATE TRIGGER trg_pagos_updated
BEFORE UPDATE ON pagos
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

CREATE TABLE IF NOT EXISTS webhook_eventos (
  id_evento     BIGSERIAL PRIMARY KEY,
  proveedor     VARCHAR(40) NOT NULL,
  tipo_evento   VARCHAR(80),
  payload       JSONB NOT NULL,
  recibido_el   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  procesado_el  TIMESTAMPTZ,
  estado        VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','ok','error'))
);

-- =====================================
-- Denuncias / Reportes
-- =====================================
CREATE TABLE IF NOT EXISTS denuncias (
  id_denuncia    BIGSERIAL PRIMARY KEY,
  id_reportante  BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  tipo_objeto    VARCHAR(20) NOT NULL CHECK (tipo_objeto IN ('resena','usuario','complejo','cancha')),
  id_objeto      BIGINT NOT NULL,
  motivo         VARCHAR(120) NOT NULL,
  comentario     TEXT,
  estado         estado_denuncia NOT NULL DEFAULT 'abierta',
  fecha_creacion     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_denuncias_tipo ON denuncias(tipo_objeto, id_objeto);
CREATE TRIGGER trg_denuncias_updated
BEFORE UPDATE ON denuncias
FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

-- =====================================
-- Vistas/Helpers opcionales
-- =====================================
-- Vista de disponibilidad básica por cancha (slots por día se calculan en la app)
-- (Se deja a nivel de servicio por complejidad de combinaciones).

COMMIT;


-- ================= FULL + PATCH DE PRODUCCION ================

-- =============================================================
--  SportHubTemuco - Patch de Producción (opcional pero recomendado)
--  Agrega: sesiones/tokens, dispositivos push, auditoría, outbox,
--  favoritos, colaboradores de complejos, liquidaciones, y políticas.
--  Además: soft-delete y campos de aceptación de términos.
-- =============================================================

BEGIN;

-- ==========================
-- ALTERs a tablas existentes
-- ==========================

-- Usuarios: aceptar términos y privacidad + soft-delete
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS terminos_aceptados_el   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eliminado_el            TIMESTAMPTZ;

-- Complejos: políticas de cancelación/reembolso + soft-delete
ALTER TABLE complejos
  ADD COLUMN IF NOT EXISTS horas_cancelacion_gratis  INT CHECK (horas_cancelacion_gratis IS NULL OR horas_cancelacion_gratis >= 0),
  ADD COLUMN IF NOT EXISTS porcentaje_reembolso      INT CHECK (porcentaje_reembolso IS NULL OR (porcentaje_reembolso BETWEEN 0 AND 100)),
  ADD COLUMN IF NOT EXISTS eliminado_el              TIMESTAMPTZ;

-- Canchas: soft-delete
ALTER TABLE canchas
  ADD COLUMN IF NOT EXISTS eliminado_el TIMESTAMPTZ;

-- Grupos: soft-delete
ALTER TABLE grupos
  ADD COLUMN IF NOT EXISTS eliminado_el TIMESTAMPTZ;

-- ==========================
-- Nuevos módulos
-- ==========================

-- 1) Refresh tokens (sesiones largas / revocables)
CREATE TABLE IF NOT EXISTS renovar_tokens (
  id_refresh          BIGSERIAL PRIMARY KEY,
  id_usuario          BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  token_hash          TEXT NOT NULL,
  dispositivo_info    TEXT,
  ip                  VARCHAR(45),
  datos_usuario       TEXT,
  expira_el           TIMESTAMPTZ NOT NULL,
  revocado            BOOLEAN NOT NULL DEFAULT FALSE,
  creado_el           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (token_hash)
);
CREATE INDEX IF NOT EXISTS idx_refresh_user ON renovar_tokens(id_usuario);

-- 2) Tokens de reseteo de contraseña
CREATE TABLE IF NOT EXISTS contrasena_reseteo_tokens (
  id_reset     BIGSERIAL PRIMARY KEY,
  id_usuario   BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  codigo_hash  TEXT NOT NULL,
  expira_el    TIMESTAMPTZ NOT NULL,
  usado_el     TIMESTAMPTZ,
  creado_el    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_usuario, codigo_hash)
);

-- 3) Tokens de verificación de email
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id_token     BIGSERIAL PRIMARY KEY,
  id_usuario   BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  codigo_hash  TEXT NOT NULL,
  expira_el    TIMESTAMPTZ NOT NULL,
  usado_el     TIMESTAMPTZ,
  creado_el    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_usuario, codigo_hash)
);

-- 4) Dispositivos para notificaciones push
CREATE TABLE IF NOT EXISTS dispositivos_push (
  id_dispositivo  BIGSERIAL PRIMARY KEY,
  id_usuario      BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  token           VARCHAR(512) NOT NULL UNIQUE,
  plataforma      VARCHAR(20) NOT NULL CHECK (plataforma IN ('android','ios','web')),
  habilitado      BOOLEAN NOT NULL DEFAULT TRUE,
  last_active     TIMESTAMPTZ,
  creado_el       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_user ON dispositivos_push(id_usuario, plataforma);

-- 5) Auditoría de acciones
CREATE TABLE IF NOT EXISTS auditoria (
  id_auditoria      BIGSERIAL PRIMARY KEY,
  actor_id          BIGINT REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  accion            VARCHAR(80) NOT NULL,                  -- ej: 'crear_reserva', 'cambiar_rol'
  objeto_tipo       VARCHAR(30),                           -- 'usuario','complejo','cancha','reserva', etc.
  id_objeto         BIGINT,
  snapshot          JSONB,
  ip                VARCHAR(45),
  datos_usuario     TEXT,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auditoria_objeto ON auditoria(objeto_tipo, id_objeto);
CREATE INDEX IF NOT EXISTS idx_auditoria_actor ON auditoria(actor_id, fecha_creacion);

-- 6) Outbox (entregas confiables: email/push/webhook)
CREATE TABLE IF NOT EXISTS outbox (
  id_outbox        BIGSERIAL PRIMARY KEY,
  tipo             VARCHAR(20) NOT NULL CHECK (tipo IN ('email','push','webhook')),
  payload          JSONB NOT NULL, 
  estado           VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','enviado','error')),
  reintentos       INT NOT NULL DEFAULT 0,
  proximo_intento  TIMESTAMPTZ,
  fecha_creacion       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_outbox_estado ON outbox(estado, proximo_intento);

-- 7) Favoritos (guardar canchas o complejos)
CREATE TABLE IF NOT EXISTS favoritos (
  id_favorito  BIGSERIAL PRIMARY KEY,
  id_usuario   BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_complejo  BIGINT REFERENCES complejos(id_complejo) ON DELETE CASCADE,
  id_cancha    BIGINT REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ( (id_complejo IS NOT NULL) <> (id_cancha IS NOT NULL) ) -- XOR
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_fav_user_complejo
  ON favoritos (id_usuario, id_complejo)
  WHERE id_complejo IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_fav_user_cancha
  ON favoritos (id_usuario, id_cancha)
  WHERE id_cancha IS NOT NULL;

-- 8) Colaboradores/gestores de un complejo
CREATE TABLE IF NOT EXISTS complejo_usuarios (
  id_complejo  BIGINT NOT NULL REFERENCES complejos(id_complejo) ON DELETE CASCADE,
  id_usuario   BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  rol          VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (rol IN ('manager','staff')),
  agregado_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_complejo, id_usuario)
);

-- 9) Liquidaciones a dueños (si administras cobros)
CREATE TABLE IF NOT EXISTS liquidaciones (
  id_liquidacion   BIGSERIAL PRIMARY KEY,
  id_dueno         BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  id_complejo      BIGINT REFERENCES complejos(id_complejo) ON DELETE SET NULL,
  periodo_inicio   DATE NOT NULL,
  periodo_fin      DATE NOT NULL,
  bruto            NUMERIC(12,2) NOT NULL DEFAULT 0,
  comision         NUMERIC(12,2) NOT NULL DEFAULT 0,
  neto             NUMERIC(12,2) GENERATED ALWAYS AS (GREATEST(bruto - comision, 0)) STORED,
  estado           VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagada','anulada')),
  fecha_pago       TIMESTAMPTZ,
  creado_el        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_liq_dueno_periodo ON liquidaciones(id_dueno, periodo_inicio, periodo_fin);

CREATE TABLE IF NOT EXISTS liquidacion_detalle (
  id_detalle      BIGSERIAL PRIMARY KEY,
  id_liquidacion  BIGINT NOT NULL REFERENCES liquidaciones(id_liquidacion) ON DELETE CASCADE,
  id_pago         BIGINT NOT NULL REFERENCES pagos(id_pago) ON DELETE RESTRICT,
  monto           NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
  descripcion     TEXT,
  UNIQUE (id_liquidacion, id_pago)
);

COMMIT;
