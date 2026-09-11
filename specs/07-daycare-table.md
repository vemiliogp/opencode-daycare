# SPEC 07 — Tabla daycares + migración Supabase

> **Status:** Approved
> **Depends on:** Ninguna (primera migración de BD)
> **Date:** 2026-09-11
> **Objective:** Crear la tabla `daycares` en Supabase con RLS, enums compartidos, seed de 5 guarderías y patrón de migraciones reproducible vía MCP.

## Scope

**In:**

- Carpeta `supabase/migrations/` con `001_create_daycares.sql`.
- 6 enums compartidos: `user_role`, `user_status`, `relationship_type`, `invitation_status`, `post_type`, `child_status`.
- Tabla `daycares` (`id uuid PK gen_random_uuid()`, `name text`, `created_at timestamptz`).
- RLS habilitada con política `SELECT` abierta (temporal hasta que exista auth).
- Seed de 5 daycares: "Guardería Sala Soles", "Guardería Arcoíris", "Guardería Los Pequeños Exploradores", "Guardería Luna Estrella", "Guardería Patitos Felices".

**Out of scope (for future specs):**

- Tablas `users`, `rooms`, `children` y el resto del esquema.
- Auth de Supabase.
- UI de administración de guarderías.
- Policies complejas de RLS (se ajustarán cuando exista auth).

## Data model

Esquema directo de `@docs/opendaycare-database-schema.md`:

```sql
CREATE TYPE user_role AS ENUM ('staff', 'parent', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active');
CREATE TYPE relationship_type AS ENUM ('father', 'mother', 'guardian');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
CREATE TYPE post_type AS ENUM ('meal', 'nap', 'activity', 'achievement', 'photo', 'announcement');
CREATE TYPE child_status AS ENUM ('active', 'archived');

CREATE TABLE daycares (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE daycares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daycares_select_public" ON daycares
  FOR SELECT USING (true);

INSERT INTO daycares (name) VALUES
  ('Guardería Sala Soles'),
  ('Guardería Arcoíris'),
  ('Guardería Los Pequeños Exploradores'),
  ('Guardería Luna Estrella'),
  ('Guardería Patitos Felices');
```

> **Nota:** Los enums se crean aquí porque las tablas futuras los necesitan. Convención: todo en inglés en DB; español solo en UI.

## Implementation plan

1. Crear `supabase/migrations/001_create_daycares.sql` con enums, tabla, RLS y seed.
2. Aplicar migración vía `supabase_apply_migration`.
3. Verificar con `supabase_execute_sql` → 5 filas en `daycares`.
4. Verificar RLS con `supabase_execute_sql` → política `daycares_select_public` en `pg_policies`.

## Acceptance criteria

- [x] `supabase/migrations/001_create_daycares.sql` existe.
- [x] Los 6 enums existen en la base de datos.
- [x] Tabla `daycares` con columnas `id` (uuid PK), `name` (text), `created_at` (timestamptz).
- [x] RLS habilitada en `daycares` con política `daycares_select_public` para SELECT.
- [x] 5 filas en `daycares`, incluyendo "Guardería Sala Soles".
- [x] `supabase_apply_migration` confirma aplicación sin errores.
- [x] Sin tablas adicionales creadas (solo `daycares` + enums).

## Decisions

- **Sí:** enums en la primera migración aunque no todos se usen en `daycares`. Las tablas futuras los necesitan; mejor tenerlos desde el inicio.
- **Sí:** política RLS abierta (`FOR SELECT USING (true)`). RLS habilitado desde el inicio (best practice) pero sin auth no tiene sentido restringir.
- **Sí:** seed de 5 daycares en la misma migración. "Guardería Sala Soles" es el daycare principal del demo.
- **Sí:** migraciones vía MCP (`supabase_apply_migration`), no CLI local.
- **No:** `supabase init` ni `config.toml` — patrón simple de carpetas de migraciones.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| Enums ya existen (re-ejecución) | `supabase_apply_migration` no re-ejecuta migraciones aplicadas |
| RLS abierta expone nombres | Aceptable para MVP — se ajusta con auth |
| Seed en español | Solo demo; en producción se gestiona desde admin |

## What is **not** in this spec

- Resto de tablas (`users`, `rooms`, `children`, etc.).
- Autenticación / login.
- UI de administración.
- Policies RLS complejas.

Cada una de esas, si llega, va en su propia spec.
