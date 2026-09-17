# SPEC 09 — Autenticación real y protección de rutas

> **Status:** Implemented
> **Depends on:** SPEC 03, SPEC 08
> **Date:** 2026-09-17
> **Objective:** Implementar login real con Supabase Auth (email/password), protección de rutas `(main)` vía proxy (Next.js 16), redirect inverso desde `/login` si hay sesión, y logout funcional — dejando la activación de cuenta como mock.

## Scope

**In:**

- Login real contra Supabase Auth con `signInWithPassword({ email, password })` en `LoginForm`.
- Proxy (`proxy.ts` en la raíz) protegiendo todas las rutas `(main)`: redirige a `/login` si no hay sesión.
- Redirect inverso: si ya hay sesión y el usuario accede a `/login`, redirigir a `/`.
- Logout funcional en el sidebar — `signOut()` y redirect a `/login`.
- Sesión manejada con `getSession()` del Supabase client en el proxy para refrescar cookies.
- Manejo de errores de login con feedback visual en el formulario.

**Out of scope (for future specs):**

- Activación real de cuenta (`/activar-cuenta` sigue siendo mock estático).
- Recuperación de contraseña ("¿Olvidaste tu contraseña?" sigue inerte).
- Registro/signup desde la UI.
- RLS restrictivas basadas en sesiones.

## Data model

No introduce nuevas estructuras. Supabase Auth gestiona internamente `auth.users`. La tabla `public.users` (SPEC 08) permanece sin cambios por ahora.

## Implementation plan

1. **Actualizar `utils/supabase/server.ts`** para exportar una función `createServerClient` que use `parseCookieHeader` y pueda usarse desde el proxy.

2. **Crear `proxy.ts` en la raíz del proyecto** con `export default async function proxy(req: NextRequest)`:
   - Crear Supabase client con `createServerClient` de `@supabase/ssr`, usando `parseCookieHeader(req.headers.get('cookie') ?? '')` para `getAll` y `setAll` con headers sobre la response.
   - Llamar `getSession()` para refrescar la sesión y las cookies.
   - Rutas protegidas: todo lo que NO sea `/login`, `/activar-cuenta`, `/_next/*`, `favicon.ico`, archivos estáticos.
   - Sin sesión + ruta protegida → redirect a `/login`.
   - Con sesión + `/login` → redirect a `/`.
   - Config matcher: `[/:path*]` excluyendo estáticos de Next.js.
   - Manual: sin sesión, `/` redirige a `/login`; con sesión, `/login` redirige a `/`.

3. **Actualizar `LoginForm`** (`components/login-form.tsx`):
   - Inputs controlados para email y password (actualmente `defaultValue` hardcodeado).
   - Submit: `signInWithPassword({ email, password })` con Supabase browser client.
   - Éxito: redirect a `/` con `useRouter().push("/")`.
   - Error: mensaje visible ("Credenciales inválidas", etc.).
   - Usuario no confirmado: mensaje específico.
   - Manual: credenciales válidas → redirect a `/`. Inválidas → error visible.

4. **Agregar botón de logout en `AppSidebar`** (`components/app-sidebar.tsx`):
   - Botón "Cerrar sesión" → `signOut()` + redirect a `/login`.
   - Manual: click en "Cerrar sesión" → redirect a `/login`, rutas protegidas bloqueadas.

5. **Verificación end-to-end**:
   - `npm run lint`, `npx tsc --noEmit`, `npm run build` pasan sin errores.
   - Sin sesión → `/` y `/kids` redirigen a `/login`.
   - Con sesión → `/login` redirige a `/`.
   - Login válido → feed accesible. Login inválido → error visible.
   - Logout → redirect a `/login`, rutas protegidas bloqueadas.

## Acceptance criteria

- [x] Existe `proxy.ts` en la raíz con `export default async function proxy`.
- [x] El proxy usa `parseCookieHeader` y `setAll` con headers.
- [x] Sin sesión activa, `/` redirige a `/login`.
- [x] Sin sesión activa, `/kids` redirige a `/login`.
- [x] Con sesión activa, `/login` redirige a `/`.
- [x] `LoginForm` usa inputs controlados para email y password.
- [x] Login con credenciales válidas redirige a `/`.
- [x] Login con credenciales inválidas muestra error visible.
- [x] Sidebar tiene botón "Cerrar sesión" funcional.
- [x] Logout ejecuta `signOut()` y redirige a `/login`.
- [x] Después de logout, rutas protegidas redirigen a `/login`.
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.
- [x] `/activar-cuenta` permanece sin cambios (mock estático).

## Decisions

- **Sí:** `proxy.ts` con `export default async function proxy` (patrón oficial Next.js 16 para autenticación). El proxy corre en el servidor Node.js con acceso completo a `cookies()` y APIs del servidor, a diferencia del Edge Runtime de `middleware.ts`.
- **Sí:** `getSession()` en el proxy para refrescar cookies automáticamente (patrón recomendado `@supabase/ssr`).
- **Sí:** `parseCookieHeader` + `setAll` con headers — patrón documentado por Supabase SSR para el proxy de Next.js 16.
- **Sí:** Client-side `signInWithPassword` con Supabase browser client — patrón más simple y recomendado para email/password.
- **Sí:** Redirect inverso desde `/login` → `/` si hay sesión.
- **No:** Activación de cuenta real — queda como mock ("la activación queda para luego").
- **No:** Recuperación de contraseña — el link sigue inerte.
- **No:** Vinculación `public.users` ↔ `auth.users` por ahora — llegará en spec futuro.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| `cookies()` de Next.js 16 es asíncrono | En el proxy usamos `req.headers.get('cookie')` directamente — no depende de `cookies()` de Next.js |
| Usuario staff de SPEC 08 no existe en Supabase Auth | Crear manualmente en Supabase Dashboard o via Admin API para pruebas |
| Discrepancia entre `public.users` y `auth.users` | Temporalmente aceptable; se vincularán en spec futuro |

## What is **not** in this spec

- Activación real de cuenta desde `/activar-cuenta`.
- Recuperación/reseteo de contraseña.
- Registro de nuevos usuarios desde la UI.
- Vinculación entre `public.users` y `auth.users`.
- RLS restrictivas basadas en roles o sesiones.

Cada una de esas, si llega, va en su propia spec.
