BEGIN;

-- =========================================
-- 0) Extensiones necesarias
-- =========================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================
-- 1) Función de trigger y limpieza de la antigua
--    (de set_updated_at -> set_fecha_actualizacion)
-- =========================================
-- Crea (o reemplaza) la función nueva
CREATE OR REPLACE FUNCTION public.set_fecha_actualizacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.fecha_actualizacion := now();
  RETURN NEW;
END;
$$;

-- Borra la antigua si existe (y sus triggers que la usaban)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname='set_updated_at') THEN
    EXECUTE 'DROP FUNCTION public.set_updated_at() CASCADE';
  END IF;
END $$;

-- =========================================
-- 2) Utilidad: renombrar columnas si existen
-- =========================================
DO $$
DECLARE
  r record;
BEGIN
  -- Mapeos: tabla, col_anterior -> col_nueva
  FOR r IN
    SELECT * FROM (
      VALUES
        -- usuarios
        ('usuarios','hashed_password','contrasena_hash'),
        ('usuarios','created_at','fecha_creacion'),
        ('usuarios','updated_at','fecha_actualizacion'),
        ('usuarios','terms_accepted_at','terminos_aceptados_el'),
        ('usuarios','deleted_at','eliminado_el'),

        -- complejos
        ('complejos','created_at','fecha_creacion'),
        ('complejos','updated_at','fecha_actualizacion'),
        ('complejos','deleted_at','eliminado_el'),

        -- canchas
        ('canchas','created_at','fecha_creacion'),
        ('canchas','updated_at','fecha_actualizacion'),
        ('canchas','deleted_at','eliminado_el'),

        -- reglas_precio
        ('reglas_precio','created_at','fecha_creacion'),
        ('reglas_precio','updated_at','fecha_actualizacion'),

        -- horarios_atencion
        ('horarios_atencion','created_at','fecha_creacion'),
        ('horarios_atencion','updated_at','fecha_actualizacion'),

        -- bloqueos
        ('bloqueos','created_at','fecha_creacion'),
        ('bloqueos','updated_at','fecha_actualizacion'),

        -- reservas
        ('reservas','created_at','fecha_creacion'),
        ('reservas','updated_at','fecha_actualizacion'),

        -- promociones
        ('promociones','created_at','fecha_creacion'),
        ('promociones','updated_at','fecha_actualizacion'),

        -- notificaciones
        ('notificaciones','created_at','fecha_creacion'),

        -- fotos
        ('fotos_complejo','created_at','fecha_creacion'),
        ('fotos_cancha','created_at','fecha_creacion'),

        -- resenas
        ('resenas','created_at','fecha_creacion'),

        -- grupos
        ('grupos','created_at','fecha_creacion'),
        ('grupos','updated_at','fecha_actualizacion'),

        -- grupo_miembros
        ('grupo_miembros','joined_at','fecha_ingreso'),

        -- pagos
        ('pagos','created_at','fecha_creacion'),
        ('pagos','updated_at','fecha_actualizacion'),

        -- webhook_eventos
        ('webhook_eventos','recibido_at','recibido_el'),
        ('webhook_eventos','procesado_at','procesado_el'),

        -- denuncias
        ('denuncias','created_at','fecha_creacion'),
        ('denuncias','updated_at','fecha_actualizacion'),

        -- outbox (patch)
        ('outbox','created_at','fecha_creacion'),
        ('outbox','updated_at','fecha_actualizacion'),

        -- auditoria (patch)
        ('auditoria','created_at','fecha_creacion'),
        ('auditoria','user_agent','datos_usuario'),

        -- favoritos (patch)
        ('favoritos','created_at','fecha_creacion'),

        -- liquidaciones (patch)
        ('liquidaciones','created_at','creado_el')

    ) AS m(tabla, old_col, new_col)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name=r.tabla
        AND column_name=r.old_col
    ) AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name=r.tabla
        AND column_name=r.new_col
    ) THEN
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN %I TO %I;', r.tabla, r.old_col, r.new_col);
    END IF;
  END LOOP;
END $$;

-- =========================================
-- 3) Triggers: crear (si faltan) con la nueva función
--    para todas las tablas que ahora tengan fecha_actualizacion
-- =========================================
DO $$
DECLARE
  t record;
  trig_name text;
  has_col boolean;
  exists_trig boolean;
BEGIN
  FOR t IN
    SELECT c.relname AS tabla
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    -- ¿Tiene la columna fecha_actualizacion?
    SELECT EXISTS(
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name=t.tabla AND column_name='fecha_actualizacion'
    ) INTO has_col;

    IF has_col THEN
      trig_name := format('trg_%s_updated', t.tabla); -- usamos el nombre clásico

      SELECT EXISTS(
        SELECT 1 FROM pg_trigger tr
        JOIN pg_class cc ON cc.oid = tr.tgrelid
        WHERE tr.tgname = trig_name AND cc.relname = t.tabla
      ) INTO exists_trig;

      IF NOT exists_trig THEN
        EXECUTE format(
          'CREATE TRIGGER %I
             BEFORE UPDATE ON public.%I
             FOR EACH ROW
             EXECUTE FUNCTION public.set_fecha_actualizacion();',
          trig_name, t.tabla
        );
      END IF;
    END IF;
  END LOOP;
END $$;

-- =========================================
-- 4) Migrar tablas del “patch” (nombres en español)
--    4.1 refresh_tokens -> renovar_tokens (y columnas)
-- =========================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='refresh_tokens' AND relkind='r') THEN
    -- Renombrar tabla si aún no existe la nueva
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='renovar_tokens' AND relkind='r') THEN
      EXECUTE 'ALTER TABLE public.refresh_tokens RENAME TO renovar_tokens';
    END IF;

    -- Renombrar columnas al estilo nuevo
    PERFORM 1 FROM information_schema.columns WHERE table_name='renovar_tokens' AND column_name='device_info';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.renovar_tokens RENAME COLUMN device_info TO dispositivo_info'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='renovar_tokens' AND column_name='user_agent';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.renovar_tokens RENAME COLUMN user_agent TO datos_usuario'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='renovar_tokens' AND column_name='expira_at';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.renovar_tokens RENAME COLUMN expira_at TO expira_el'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='renovar_tokens' AND column_name='creado_at';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.renovar_tokens RENAME COLUMN creado_at TO creado_el'; END IF;
  END IF;
END $$;

-- =========================================
-- 4.2 password_reset_tokens -> contrasena_reseteo_tokens (y columnas)
-- =========================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='password_reset_tokens' AND relkind='r') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='contrasena_reseteo_tokens' AND relkind='r') THEN
      EXECUTE 'ALTER TABLE public.password_reset_tokens RENAME TO contrasena_reseteo_tokens';
    END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='contrasena_reseteo_tokens' AND column_name='code_hash';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.contrasena_reseteo_tokens RENAME COLUMN code_hash TO codigo_hash'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='contrasena_reseteo_tokens' AND column_name='expira_at';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.contrasena_reseteo_tokens RENAME COLUMN expira_at TO expira_el'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='contrasena_reseteo_tokens' AND column_name='usado_at';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.contrasena_reseteo_tokens RENAME COLUMN usado_at TO usado_el'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='contrasena_reseteo_tokens' AND column_name='creado_at';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.contrasena_reseteo_tokens RENAME COLUMN creado_at TO creado_el'; END IF;
  END IF;
END $$;

-- =========================================
-- 4.3 email_verification_tokens (solo columnas)
-- =========================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='email_verification_tokens' AND relkind='r') THEN
    PERFORM 1 FROM information_schema.columns WHERE table_name='email_verification_tokens' AND column_name='code_hash';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.email_verification_tokens RENAME COLUMN code_hash TO codigo_hash'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='email_verification_tokens' AND column_name='expira_at';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.email_verification_tokens RENAME COLUMN expira_at TO expira_el'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='email_verification_tokens' AND column_name='usado_at';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.email_verification_tokens RENAME COLUMN usado_at TO usado_el'; END IF;

    PERFORM 1 FROM information_schema.columns WHERE table_name='email_verification_tokens' AND column_name='creado_at';
    IF FOUND THEN EXECUTE 'ALTER TABLE public.email_verification_tokens RENAME COLUMN creado_at TO creado_el'; END IF;
  END IF;
END $$;

-- =========================================
-- 5) Índices útiles (no se recrean si ya existen)
-- =========================================
CREATE INDEX IF NOT EXISTS idx_complejos_loc_gist ON complejos USING GIST (loc);
CREATE INDEX IF NOT EXISTS idx_canchas_complejo ON canchas(id_complejo);
CREATE INDEX IF NOT EXISTS idx_reglas_precio_cancha ON reglas_precio(id_cancha);
CREATE INDEX IF NOT EXISTS idx_horarios_complejo ON horarios_atencion(id_complejo, dia);
CREATE INDEX IF NOT EXISTS idx_horarios_cancha ON horarios_atencion(id_cancha, dia);
CREATE INDEX IF NOT EXISTS idx_bloqueos_cancha ON bloqueos(id_cancha);
DROP INDEX IF EXISTS idx_bloqueos_rango;
CREATE INDEX IF NOT EXISTS idx_bloqueos_rango ON bloqueos USING GIST (tstzrange(inicio, fin, '[)'));
CREATE INDEX IF NOT EXISTS idx_reservas_cancha ON reservas(id_cancha);
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_reservas_rango ON reservas USING GIST (tstzrange(inicio, fin, '[)'));
CREATE INDEX IF NOT EXISTS idx_promos_complejo ON promociones(id_complejo);
CREATE INDEX IF NOT EXISTS idx_promos_cancha ON promociones(id_cancha);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notificaciones(id_destinatario, leida);
CREATE UNIQUE INDEX IF NOT EXISTS uq_resena_user_complejo
  ON resenas (id_usuario, id_complejo)
  WHERE id_complejo IS NOT NULL AND esta_activa = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_resena_user_cancha
  ON resenas (id_usuario, id_cancha)
  WHERE id_cancha IS NOT NULL AND esta_activa = TRUE;
CREATE INDEX IF NOT EXISTS idx_grupo_miembros_estado ON grupo_miembros(id_grupo, estado);
CREATE INDEX IF NOT EXISTS idx_pagos_reserva ON pagos(id_reserva);
CREATE INDEX IF NOT EXISTS idx_pagos_estado  ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_denuncias_tipo ON denuncias(tipo_objeto, id_objeto);

COMMIT;
