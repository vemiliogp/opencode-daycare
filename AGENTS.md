<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MCPs

- Playwright: screenshots y cualquier artefacto de Playwright van en `.playwright-mcp/` (gitignored).
- Context7: usar para traer documentación actualizada del framework.
- Supabase: usar para todas las operaciones con la base de datos (migraciones, queries, edge functions, logs, branches). Leer logs y advisories antes de hacer cambios; preferir desarrollo local con Supabase CLI antes de aplicar cambios remotos.
- **Migraciones**: SIEMPRE usar migraciones para cualquier cambio en la base de datos (crear/alterar tablas, columnas, indexes, policies, triggers, funciones, extensions). Nunca ejecutar DDL directamente con `supabase_execute_sql`. Usar `supabase_apply_migration` para aplicar migraciones. Las migraciones deben ser descriptivas y en snake_case.

## Skills instalados

- **context7-mcp**: Fetch documentación actualizada de librerías/frameworks. Activar cuando el usuario pregunte sobre React, Next.js, Prisma, Supabase, etc.
- **supabase**: Cualquier tarea con Supabase (Database, Auth, Edge Functions, RLS, Storage, Realtime, CLI, migraciones, debugging). Cargar antes de crear/alterar tablas, policies, triggers, o diagnosticar errores.
- **supabase-postgres-best-practices**: Best practices de Postgres. Cargar ANTES de escribir o modificar cualquier cosa en la base de datos (schema, migraciones, RLS, indexes, queries, triggers).
- **spec**: Diseñar y desarrollar specs con el método spec-driven. Usar al iniciar una feature grande, antes de escribir código.
- **spec-impl**: Implementar un spec aprobado. Crea branch `spec-NN-slug` e implementa paso a paso.
- **customize-opencode**: Editar configuración de opencode (`opencode.json`, `.opencode/`, agentes, skills, plugins, MCP servers).

## Comandos

- Package manager: **npm** (hay `package-lock.json`). Ignorar las menciones a yarn/pnpm/bun del README (es boilerplate).
- `npm run dev` — dev server en http://localhost:3000.
- `npm run lint` — ESLint 9 flat config sobre todo el repo. Un solo archivo: `npx eslint app/page.tsx`.
- `npx tsc --noEmit` — typecheck (no existe script dedicado).
- `npm run build` — build de producción (incluye type-check).
- No hay tests ni CI. Verificación = lint + tsc + build.

## Stack y arquitectura

- Next.js 16.3.4 (App Router en `app/`), React 19, TypeScript strict, Tailwind CSS **v4** vía PostCSS (`@import "tailwindcss"` en `app/globals.css`; no hay `tailwind.config.*`).
- Path alias `@/*` → raíz del repo (NO `./app/*`): importar como `@/app/...`.
- **Supabase**: `@supabase/supabase-js` + `@supabase/ssr` para toda interacción con la base de datos y autenticación. Client helpers en `utils/supabase/server.ts` (Server Components), `utils/supabase/client.ts` (Client Components), `utils/supabase/middleware.ts` (Middleware). Variables de entorno en `.env.local`.
- Estado actual: scaffold de create-next-app; las pantallas reales están por implementar a partir de los diseños.

## Diseños — fuente de verdad de la UI

- `references/pantallas/*.dc.html` — comps HTML estáticos autocontenidos (estilos inline) de cada pantalla de OpenDayCare, en español. No forman parte de la app Next; abrirlos en el navegador para consultarlos. `support.js` en esa carpeta es soporte de los comps, no código de la app.
- `references/screenshots/*.png` — capturas de las pantallas clave.
- UI en español. Los diseños usan Fredoka (títulos) y Nunito (texto) con paleta cálida (fondo `#F6ECDF`, acento `#F4977E`); el layout actual carga Geist — al implementar pantallas hay que alinear las fuentes con los diseños.

## Workflow de specs

- Features grandes: `/spec` (define y guarda `specs/NN-slug.md` en estado `Draft`; el usuario lo pasa a `Approved`) → `/spec-impl NN-slug` (crea branch `spec-NN-slug` e implementa paso a paso) → `/spec-check NN-slug` (verifica criterios de aceptación). `specs/` aún no existe.
- **Specs de base de datos**: cualquier spec relacionado con cambios en la base de datos (schema, tablas, migraciones, RLS, triggers, indexes, funciones) debe guardarse en `specs/database/NN-slug.md` en lugar de `specs/`.
- Skills instalados en `.agents/skills/`, versionados por `skills-lock.json`.
- `CLAUDE.md` solo importa este archivo (`@AGENTS.md`); no duplicar contenido ahí.

## Agente spec-verifier

- Definido en `.opencode/agent/spec-verifier.md`. Verifica los criterios de aceptación de un spec en `specs/`.
- Ejecuta `npm run lint`, `npx tsc --noEmit`, `npm run build`; inspecciona la implementación; compara pantallas con los comps de `references/pantallas/` usando Playwright MCP con visión; valida prácticas de Next.js 16 vía Context7 y `node_modules/next/dist/docs/`.
- Marca los checkboxes del spec (`- [ ]` → `- [x]`) solo con evidencia concreta. **Nunca modifica código de la app**, solo edita `specs/**`.
- Se invoca vía comando `/spec-check NN-slug` (o `/spec-check 01`, `/spec-check feed-home`, etc.). Si no se pasa argumento, lista los specs disponibles y pregunta cuál verificar.
- Todos los artefactos de Playwright van en `.playwright-mcp/` (gitignored).

## Agente db-migrator

- Definido en `.opencode/agents/db-migrator.md`. Verifica y aplica migraciones pendientes de Supabase.
- Compara archivos locales en `supabase/migrations/` con migraciones aplicadas en la BD.
- Aplica migraciones pendientes en orden secuencial vía `supabase_apply_migration`.
- Detecta y reporta drift (migraciones en BD sin archivo local o viceversa).
- Invocado vía `/migrate` o invocado automáticamente por `spec-impl` cuando un paso requiere aplicar una migración.
- NUNCA usa `supabase_execute_sql` para DDL — siempre `supabase_apply_migration`.
- Detiene la ejecución al primer error y reporta claramente.

## Agente react-best-practices

- Definido en `.opencode/agents/react-best-practices.md`. Aplica mejores prácticas de React a archivos indicados usando Context7 para verificar documentación oficial actualizada.
- Revisa hooks, state management, re-renders, efectos, Server/Client boundaries, performance, composición de componentes, TypeScript y accesibilidad.
- Aplica mejoras directamente a los archivos indicados preservando funcionalidad. Corre `npm run lint` y `npx tsc --noEmit` después de los cambios.
- Se invoca vía comando `/react-review app/components/Header.tsx` (o múltiples archivos separados por espacios). Si no se pasan archivos, pregunta cuáles revisar.
- Siempre cita la documentación de React que respalda cada cambio.

## Agente accessibility-checker

- Definido en `.opencode/agents/accessibility-checker.md`. Audita y repara problemas de accesibilidad WCAG 2.2 AA en componentes React (`.tsx`) y HTML estático (`.dc.html`).
- Ejecuta auditorías automatizadas con axe-core vía Playwright, pruebas de navegación por teclado, y revisión manual de código semantic HTML, ARIA, labels, focus management.
- Aplica fixes directamente en los archivos preservando funcionalidad y diseño visual. Corre `npm run lint`, `npx tsc --noEmit` y re-ejecuta axe-core post-fix.
- Se invoca vía comando `/a11y-check app/components/Header.tsx` (o múltiples archivos separados por espacios). Si no se pasan archivos, pregunta cuáles revisar.
- Todos los artefactos de Playwright van en `.playwright-mcp/` (gitignored).

## Agente db-security-auditor

- Definido en `.opencode/agents/db-security-auditor.md`. Audita la seguridad de la base de datos Supabase, con foco en políticas RLS, roles de acceso y aislamiento de datos entre familias (niños/padres).
- Previene fugas de datos entre tenants: verifica que un padre solo pueda ver a sus propios hijos, no los de otras familias.
- Revisa cada tabla: RLS habilitado, políticas por operación (SELECT/INSERT/UPDATE/DELETE), predicados correctos (`TO authenticated` + ownership check, no solo `TO authenticated`), indexes en columnas de políticas.
- Audita funciones `SECURITY DEFINER` (bypassean RLS), vistas (bypassean RLS por defecto), uso de `user_metadata` vs `app_metadata` en autorización, y exposición de claves `service_role`.
- Ejecuta queries de verificación para probar que el aislamiento funciona entre familias y daycares.
- Solo audita y reporta — NO modifica la base de datos ni aplica migraciones.
- Se invoca vía comando `/db-security-audit` (o con tablas/archivos específicos). Si no se pasa argumento, audita todo el proyecto.

## Spec Driven Development

- /spec usaremos esta habilidad para crear las implementaciones.
- /spec-impl esta es skill para hacer las implementaciones.


## Reglas de codigo

- Usar codigo limpio, nombres, funciones y variables en ingles.
