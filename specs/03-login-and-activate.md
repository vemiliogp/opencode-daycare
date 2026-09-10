# SPEC 03 — Login y activar cuenta (/login, /activar-cuenta)

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-09-10
> **Objective:** Implementar los comps de login (sin selector Personal/Familia) y activar-cuenta como `/login` y `/activar-cuenta` dentro de un route group `(auth)` sin sidebar, con navegación cruzada entre ambas pantallas y fidelidad visual 1:1.

## Scope

**In:**

- Ruta `/login` con el formulario del comp simplificado: sin los botones "Personal" y "Familia", solo email + contraseña + link "¿Olvidaste tu contraseña?" + botón "Iniciar sesión" que redirige al feed (`/`).
- Ruta `/activar-cuenta` con el comp completo: código de invitación, email, crear contraseña, checkbox de consentimiento estático y botón "Activar mi cuenta" — todo sin lógica real.
- Route group `(auth)` en `app/(auth)/` con layout propio que **no** hereda la sidebar del layout raíz.
- Navegación cruzada: link "Activá tu cuenta" en `/login` → `/activar-cuenta` y link "Iniciar sesión" en `/activar-cuenta` → `/login`.
- Fuentes Fredoka + Nunito y tokens Tailwind v4 en `@theme` (heredados de SPEC 01, se verifica que el layout de auth los utilice sin depender de la sidebar).

**Out of scope (for future specs):**

- Autenticación real (login con credenciales válidas, tokens, sesiones).
- Base de datos y persistencia.
- Pantalla de recuperación de contraseña (el link "¿Olvidaste tu contraseña?" queda inerte).
- Flujo real de activación de cuenta (el botón "Activar mi cuenta" solo redirige).
- Validación de formularios (email, contraseña, código de invitación).
- Estado del checkbox de consentimiento (sin lógica, solo visual).

## Data model

This feature introduces no new data structures. Los datos mock de los comps (email, código de invitación, nombre del niño) se hardcodean directamente en los componentes como literales de display, sin types ni archivos data dedicados.

## Implementation plan

1. `app/(auth)/layout.tsx`: layout con fondo `#FBF4EC`, sin sidebar, centrando el contenido. Carga Fredoka + Nunito si no están disponibles en este subtree. Manual: `npm run dev` y navegar a `/login` muestra fondo cálido centrado.
2. `app/(auth)/login/page.tsx` + `components/login-form.tsx`: formulario del comp sin selector de rol — solo email (prellenado), contraseña, link "¿Olvidaste tu contraseña?" (inerte) y botón "Iniciar sesión" con `Link` hacia `/`. Manual: `/login` 1:1 con el comp en desktop (lado izquierdo del split: panel decorativo con gradiente + logo + tagline; lado derecho: formulario centrado).
3. `app/(auth)/activar-cuenta/page.tsx` + `components/activate-form.tsx`: formulario del comp — logo, título "Bienvenida a OpenDayCare", card del niño (Mateo · Sala Soles), código de invitación prellenado, email prellenado, campo contraseña, checkbox estático ya marcado, botón "Activar mi cuenta" inerte. Manual: `/activar-cuenta` 1:1 con el comp en desktop.
4. Navegación cruzada: link "Activá tu cuenta" en `/login` apunta a `/activar-cuenta` con `next/link`; link "Iniciar sesión" en `/activar-cuenta` apunta a `/login` con `next/link`. Manual: clic en ambos links navega correctamente entre pantallas.
5. `app/globals.css` (si aplica): confirmar que los tokens de paleta están accesibles desde el route group `(auth)`. Manual: colores en ambas pantallas coinciden con los comps.

## Acceptance criteria

- [x] `npm run dev` levanta `/login` y `/activar-cuenta` sin errores en consola.
- [x] En desktop (≥1024px), `/login` es visualmente 1:1 con `references/pantallas/login.dc.html` (panel izquierdo con gradiente + logo + tagline, panel derecho con formulario), sin los botones Personal/Familia, verificado lado a lado.
- [x] En desktop (≥1024px), `/activar-cuenta` es visualmente 1:1 con `references/pantallas/activar-cuenta.dc.html`, verificado lado a lado.
- [x] `/login` no muestra sidebar ni layout heredado de `app/layout.tsx`.
- [x] `/activar-cuenta` no muestra sidebar ni layout heredado de `app/layout.tsx`.
- [x] El botón "Iniciar sesión" en `/login` navega a `/` (feed).
- [x] El link "Activá tu cuenta" en `/login` navega a `/activar-cuenta`.
- [x] El link "Iniciar sesión" en `/activar-cuenta` navega a `/login`.
- [x] El checkbox en `/activar-cuenta` se muestra marcado visualmente (estado estático, sin lógica).
- [x] El link "¿Olvidaste tu contraseña?" en `/login` es inerte (no navega, no da 404).
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Decisions

- **Sí:** route group `(auth)` para aislar login y activar-cuenta del layout raíz con sidebar. Evita contaminación del diseño auth con la shell de la app.
- **Sí:** sin selector de rol (Personal/Familia) en `/login` — decisión explícita del usuario.
- **Sí:** formulario sin validación ni auth real. Mock estático hasta que exista BD.
- **Sí:** checkbox de consentimiento estático (marcado por defecto, sin lógica). Aceptación diferida.
- **Sí:** botón "Iniciar sesión" redirige a `/` (feed). El flujo real de autenticación llegará con otra spec.
- **Sí:** navegación cruzada con `next/link` entre `/login` y `/activar-cuenta`.
- **No:** validación de email, contraseña o código de invitación (llegará con BD).
- **No:** pantalla de recuperación de contraseña (link inerte por ahora).
- **No:** datos en `app/data/` — no hay nuevas estructuras; valores hardcodeados como literales de display.

## What is **not** in this spec

- Autenticación real, sesiones, tokens.
- Base de datos y persistencia.
- Validación de formularios.
- Pantalla de recuperación de contraseña.
- Flujo real de activación de cuenta.

Cada una de esas, si llega, va en su propia spec.
