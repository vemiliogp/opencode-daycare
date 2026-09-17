# SPEC 10 — Tablas rooms y children + conectar /kids a BD real

> **Status:** Approved
> **Depends on:** SPEC 07, SPEC 08, SPEC 02, SPEC 04
> **Date:** 2026-09-17
> **Objective:** Crear las tablas rooms y children en Supabase con seed de 3 salas en "Guardería Sala Soles", y conectar las páginas /kids y /kids/{id} a datos reales de la base de datos reemplazando el mock.

## Scope

**In:**

- Migración `005_create_rooms_and_children.sql` con las tablas `rooms` y `children` según el schema de referencia.
- Seed de 3 salas para "Guardería Sala Soles": "Soles", "Lunas", "Estrellas" (nombres del mock de SPEC 04).
- RLS habilitada con políticas SELECT abiertas (temporal hasta auth completa).
- Reemplazar el mock de `app/data/kids.ts` por queries reales a Supabase en `app/(main)/kids/page.tsx` (server component).
- `app/(main)/kids/[id]/page.tsx` lee el perfil del niño desde la BD en lugar del mock.
- El modal "Agregar niño" persiste el nuevo niño en la BD en lugar de solo agregarlo en memoria.
- Mantener compatibilidad visual: los datos de BD se transforman al formato que los componentes de UI ya esperan (`Kid`, `AvatarColor`, etc.).

**Out of scope (for future specs):**

- Tablas `parent_children`, `invitations`, `posts` y el resto del esquema.
- Edición de niño existente (botón "Editar" sigue inerte).
- Eliminación/archivado de niños.
- Policies RLS restrictivas basadas en auth (se ajustarán cuando auth esté completa).
- Upload de foto del niño en el dialog de agregar.
- Validación avanzada de duplicados en el formulario.

## Data model

### Migración SQL — tablas `rooms` y `children`

```sql
-- rooms
CREATE TABLE public.rooms (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES public.daycares(id),
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_public" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "rooms_insert_authenticated" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "rooms_update_authenticated" ON public.rooms
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- children
CREATE TABLE public.children (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid NOT NULL REFERENCES public.rooms(id),
  full_name     text NOT NULL,
  birth_date    date NOT NULL,
  enrolled_at   date NOT NULL DEFAULT CURRENT_DATE,
  medical_notes text,
  allergy_tags  text[],
  photo_consent boolean NOT NULL DEFAULT true,
  status        child_status NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "children_select_public" ON public.children
  FOR SELECT USING (true);

CREATE POLICY "children_insert_authenticated" ON public.children
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "children_update_authenticated" ON public.children
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Seed: 3 salas para "Guardería Sala Soles"
INSERT INTO public.rooms (daycare_id, name)
SELECT id, unnest(ARRAY['Soles', 'Lunas', 'Estrellas'])
FROM public.daycares
WHERE name = 'Guardería Sala Soles';
```

### Capa de transformación (nuevo archivo)

`lib/db/kids.ts` — funciones que leen de Supabase y devuelven el tipo `Kid` que la UI ya consume:

```ts
import { createClient } from "@/utils/supabase/server";

export async function fetchKids(cookies: Awaited<ReturnType<typeof cookies>>): Promise<Kid[]> {
  // Query children JOIN rooms, transformar a Kid[]
}

export async function fetchKidById(
  id: string,
  cookies: Awaited<ReturnType<typeof cookies>>,
): Promise<Kid | null> {
  // Query single child JOIN rooms, transformar a Kid o null
}

export async function fetchRooms(cookies: Awaited<ReturnType<typeof cookies>>): Promise<string[]> {
  // Query rooms donde daycare_id = "Guardería Sala Soles", devolver names
}

export async function createChild(
  input: { fullName: string; birthDate: string; roomId: string; allergyTags?: string[]; medicalNotes?: string },
  cookies: Awaited<ReturnType<typeof cookies>>,
): Promise<Kid> {
  // INSERT into children, retornar Kid transformado
}
```

La transformación mapea:
- `full_name` → `name`, `initial` (primera letra), `avatarColor` (asignar cíclicamente de `avatarColors`).
- `birth_date` → calcular `ageYears`, formatear `birthDate` como "12 mar 2022".
- `enrolled_at` → formatear como "feb 2025".
- `allergy_tags` → `allergyLabel` (primer tag en uppercase), `allergyNote` viene de `medical_notes`.
- `room` → nombre de la sala desde el JOIN.
- `parents` → `[]` vacío (hasta que exista `parent_children`).

### El array `kids` mock en `app/data/kids.ts`

Se mantiene solo los tipos (`Kid`, `AvatarColor`, `Parent`, etc.) y los helpers (`slugify`, `calculateAge`, `currentMonthYear`, `formatBirthDate`, `avatarColors`, `rooms` para fallback). El array `kids` se elimina o se deja vacío — la UI lo recibe de la BD.

## Implementation plan

1. Crear `supabase/migrations/005_create_rooms_and_children.sql` con las tablas `rooms` y `children`, RLS, y seed de 3 salas. Aplicar con `supabase_apply_migration`.
   - Manual: verificar con query que existen 3 filas en `rooms` vinculadas a "Guardería Sala Soles".

2. Crear `lib/db/kids.ts` con `fetchKids`, `fetchKidById`, `fetchRooms`, `createChild` y la lógica de transformación DB → `Kid`.
   - Manual: llamar `fetchKids` desde un server component y verificar que retorna array vacío (sin children seedeados).

3. Modificar `app/(main)/kids/page.tsx` para ser server component: leer cookies, llamar `fetchKids`, pasar los kids reales a `KidsBrowser`. Eliminar el estado local con mock. El botón "Agregar niño" sigue abriendo el modal pero ahora `onSave` llama a `createChild` y revalida la página.
   - Manual: `/kids` se renderiza desde la BD (sin niños aún, muestra estado vacío o 0 niños).

4. Modificar `app/(main)/kids/[id]/page.tsx` para leer de la BD: server component con `fetchKidById`, `notFound()` si no existe.
   - Manual: id válido muestra perfil; id inexistente → 404.

5. Modificar `components/add-kid-dialog.tsx` para que `onSave` llame a un server action que ejecute `createChild` y haga `revalidatePath("/kids")`. El dropdown de sala usa `fetchRooms` en lugar del array mock.
   - Manual: abrir modal, completar campos, guardar → el niño aparece en la grilla tras revalidar.

6. Verificar `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Acceptance criteria

- [x] Migración `005_create_rooms_and_children.sql` aplicada correctamente.
- [x] Tabla `rooms` existe con columnas `id`, `daycare_id`, `name`, `created_at`.
- [x] Tabla `children` existe con todas las columnas del schema (`room_id`, `full_name`, `birth_date`, `enrolled_at`, `medical_notes`, `allergy_tags`, `photo_consent`, `status`, `created_at`, `updated_at`).
- [x] 3 filas en `rooms`: "Soles", "Lunas", "Estrellas" vinculadas a "Guardería Sala Soles".
- [x] 0 filas en `children` (sin seed de niños).
- [x] RLS habilitada en `rooms` y `children` con políticas SELECT/INSERT/UPDATE.
- [x] `/kids` se renderiza como server component leyendo de la BD (no del mock).
- [x] `/kids/{id}` lee el perfil desde la BD; id inexistente devuelve 404.
- [x] "Agregar niño" abre el modal, guardar persiste en la BD y el nuevo niño aparece en la grilla tras revalidar.
- [x] El dropdown de salas del modal carga desde la BD (3 salas).
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Decisions

- **Sí:** server component para `/kids` y `/kids/{id}`. Next 16 App Router permite queries directas desde server components con `createClient`.
- **Sí:** server action para crear niño (no API route). Más simple, menos boilerplate, mismo security model con RLS.
- **Sí:** mantener los tipos y helpers en `app/data/kids.ts` pero eliminar el array `kids` mock. Los componentes de UI siguen usando los mismos tipos.
- **Sí:** 3 salas seedeadas (Soles, Lunas, Estrellas) — los mismos nombres del mock de SPEC 04 para consistencia.
- **Sí:** `allergy_tags` como `text[]` de Postgres (según schema original). La UI traduce a español.
- **Sí:** `parents` vacío en la transformación hasta que exista la tabla `parent_children`.
- **No:** seed de niños — la tabla arranca vacía, se poblan desde el modal o futuras specs.
- **No:** migrar a Supabase Auth como FK en esta spec — `children` no referencia auth directamente.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| La transformación DB → `Kid` pierde datos visuales (colores de avatar) | Asignación cíclica determinista basada en `id` para consistencia; los colores no son críticos para la funcionalidad |
| RLS abierta expone datos de niños | Aceptable para MVP; se restringe cuando auth completa esté activa |
| `birth_date` como `date` vs string en UI | La capa de transformación formatea al estilo "12 mar 2022" que la UI espera |

## What is **not** in this spec

- Tablas `parent_children`, `invitations`, `posts` y el resto del esquema.
- Edición de niño existente (botón "Editar" sigue inerte).
- Eliminación o archivado de niños.
- Policies RLS restrictivas basadas en auth.
- Upload de foto del niño en el dialog.
- Validación avanzada de duplicados.

Cada una de esas, si llega, va en su propia spec.
