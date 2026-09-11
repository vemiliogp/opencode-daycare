# SPEC 08 — Tabla users + seed usuario staff

> **Status:** Implemented
> **Depends on:** SPEC 07
> **Date:** 2026-09-11
> **Objective:** Crear la tabla `users` en Supabase con seed de un usuario staff de prueba (vemiliogp@gmail.com), RLS abierta y migración reproducible.

## Scope

**In:**

- Migración `002_create_users.sql` con tabla `users` (sin dependencia de Supabase Auth).
- Columna `email` unique not null para identificación propia.
- Columna `password_hash` not null con bcrypt vía `pgcrypto` (`gen_salt('bf')`).
- Seed de un usuario `staff` vinculado a "Guardería Sala Soles" directamente en la migración.
- RLS habilitada con política `SELECT` abierta (como `daycares`).

**Out of scope (for future specs):**

- UI de login / signup.
- Tablas `rooms`, `children`, y resto del esquema.
- Policies RLS restrictivas basadas en roles.

## Data model

SQL de la tabla `users` basada en `@docs/opendaycare-database-schema.md` con adaptaciones:

```sql
CREATE TABLE users (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id              uuid NOT NULL REFERENCES daycares(id),
  email                   text UNIQUE NOT NULL,
  password_hash           text NOT NULL,
  role                    user_role NOT NULL DEFAULT 'staff',
  status                  user_status NOT NULL DEFAULT 'active',
  full_name               text,
  avatar_url              text,
  notify_on_post          boolean NOT NULL DEFAULT true,
  daily_summary_enabled   boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
```

Adaptaciones respecto al schema original:

- **Sin FK a `auth.users`**: `id` es `gen_random_uuid()`, manejado por la app.
- **`email` y `password_hash` propios**: Autenticación sin depender de Supabase Auth.
- **Seed directo en la migración**: `INSERT INTO users` con `crypt('12345678', gen_salt('bf'))`.

## Implementation plan

1. Crear `supabase/migrations/002_create_users.sql` con:
   - Tabla `users` (FK a `daycares`, sin trigger ni FK a `auth.users`).
   - RLS habilitada con política `SELECT` abierta (temporal).
   - Seed del usuario staff con `crypt('12345678', gen_salt('bf'))`.
2. Aplicar migración vía `supabase_apply_migration`.
3. Verificar: 1 fila en `users` con rol `staff`, FK a "Guardería Sala Soles", nombre "Staff Demo".

## Acceptance criteria

- [x] `supabase/migrations/002_create_users.sql` existe.
- [x] Tabla `users` con `id` auto-generado, `email` unique not null, `password_hash` not null.
- [x] FK `daycare_id` a `daycares(id)`.
- [x] RLS habilitada en `users` con política `users_select_public` para SELECT.
- [x] 1 fila en `users` con rol `staff`, status `active`, full_name "Staff Demo".
- [x] FK `daycare_id` apunta a "Guardería Sala Soles".
- [x] Password hasheado con `crypt('12345678', gen_salt('bf'))`.

## Decisions

- **No:** FK a `auth.users`. El `id` es `gen_random_uuid()` y se gestiona desde la app.
- **No:** trigger en `auth.users`. El seed se hace directamente en la migración.
- **Sí:** columnas `email` y `password_hash` en `users` con `pgcrypto` para bcrypt.
- **Sí:** seed directo en la migración con `INSERT INTO users`.
- **Sí:** RLS abierta (SELECT público), igual que `daycares` en SPEC 07.
- **No:** seed de más de un usuario. Solo staff para pruebas; padres se crean con invitaciones (SPEC futura).

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| RLS abierta expone datos | Aceptable para MVP; se restringe cuando auth esté activa |
| Password bcrypt en DB | Usar `pgcrypto` con `gen_salt('bf')`; migrar a auth dedicado en el futuro |

## What is **not** in this spec

- UI de login / signup (solo se crea el usuario de prueba via Auth Admin API).
- Resto de tablas (`rooms`, `children`, `invitations`, etc.).
- Policies RLS basadas en roles o sesiones.
- UI de gestión de usuarios.

Cada una de esas, si llega, va en su propia spec.
