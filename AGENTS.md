<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MCPs

- Playwright: screenshots y cualquier artefacto de Playwright van en `.playwright-mcp/` (gitignored).
- Context7: usar para traer documentación actualizada del framework.

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
- Estado actual: scaffold de create-next-app; las pantallas reales están por implementar a partir de los diseños.

## Diseños — fuente de verdad de la UI

- `references/pantallas/*.dc.html` — comps HTML estáticos autocontenidos (estilos inline) de cada pantalla de OpenDayCare, en español. No forman parte de la app Next; abrirlos en el navegador para consultarlos. `support.js` en esa carpeta es soporte de los comps, no código de la app.
- `references/screenshots/*.png` — capturas de las pantallas clave.
- UI en español. Los diseños usan Fredoka (títulos) y Nunito (texto) con paleta cálida (fondo `#F6ECDF`, acento `#F4977E`); el layout actual carga Geist — al implementar pantallas hay que alinear las fuentes con los diseños.

## Workflow de specs

- Features grandes: `/spec` (define y guarda `specs/NN-slug.md` en estado `Draft`; el usuario lo pasa a `Approved`) → `/spec-impl NN-slug` (crea branch `spec-NN-slug` e implementa paso a paso) → `/spec-check NN-slug` (verifica criterios de aceptación). `specs/` aún no existe.
- Skills instalados en `.agents/skills/`, versionados por `skills-lock.json`.
- `CLAUDE.md` solo importa este archivo (`@AGENTS.md`); no duplicar contenido ahí.

## Agente spec-verifier

- Definido en `.opencode/agent/spec-verifier.md`. Verifica los criterios de aceptación de un spec en `specs/`.
- Ejecuta `npm run lint`, `npx tsc --noEmit`, `npm run build`; inspecciona la implementación; compara pantallas con los comps de `references/pantallas/` usando Playwright MCP con visión; valida prácticas de Next.js 16 vía Context7 y `node_modules/next/dist/docs/`.
- Marca los checkboxes del spec (`- [ ]` → `- [x]`) solo con evidencia concreta. **Nunca modifica código de la app**, solo edita `specs/**`.
- Se invoca vía comando `/spec-check NN-slug` (o `/spec-check 01`, `/spec-check feed-home`, etc.). Si no se pasa argumento, lista los specs disponibles y pregunta cuál verificar.
- Todos los artefactos de Playwright van en `.playwright-mcp/` (gitignored).

## Spec Driven Development

- /spec usaremos esta habilidad para crear las implementaciones.
- /spec-impl esta es skill para hacer las implementaciones.


## Reglas de codigo

- Usar codigo limpio, nombres, funciones y variables en ingles.
