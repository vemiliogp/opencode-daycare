# SPEC 01 — Feed como home (/)

> **Status:** Implemented
> **Depends on:** Ninguna
> **Date:** 2026-09-04
> **Objective:** Implementar el comp `references/pantallas/feed.dc.html` como home (`/`) de OpenDayCare, estático y sin BD, con fidelidad visual 1:1 en desktop y sidebar en drawer para móvil.

## Scope

**In:**

- Ruta `/` con el Feed del comp: saludo, trigger de publicación, divisor "PUBLICADO HOY" y los 3 posts (logro, actividad con placeholder de foto, anuncio).
- Sidebar compartida en `app/layout.tsx`: logo, botón "Nueva publicación", nav con Feed activo, usuario "Caro Giménez" y logout — según el comp.
- Fuentes Fredoka (títulos) y Nunito (texto) vía `next/font/google`, reemplazando Geist.
- Paleta del comp como tokens Tailwind v4 en `app/globals.css`.
- Mock data tipada en `app/data/feed.ts`.
- Responsive mínimo: en `<lg` la sidebar se abre como drawer con hamburguesa.

**Out of scope (for future specs):**

- Autenticación y pantalla login.
- Base de datos y persistencia (corazones y comentarios son solo display).
- Pantallas Niños, Avisos, Mi cuenta, crear/detalle publicación y foto.
- Interactividad de corazones, comentarios y edición.
- Fotos reales (queda el placeholder punteado del comp).
- Responsive fino más allá del drawer.

## Data model

Nueva estructura en `app/data/feed.ts` (única fuente de contenido; la futura BD reemplaza este archivo):

```ts
export type PostKind = "achievement" | "activity" | "announcement";

export type Post = {
  id: string;
  kind: PostKind;
  authorName: string;      // "Mateo" o "Anuncio general"
  authorInitial: string;   // "M"
  time: string;            // "14:20"
  publishedByYou: boolean; // "publicado por vos"
  audience: string;        // "Para: familia de Mateo" / "Para: toda la sala"
  body: string;
  photoCaption?: string;   // "Foto · pintando con témperas" (solo kind "activity")
  hearts: number;
  comments: number;
};

export const feedData = {
  greeting: "Buenas, Caro",
  meta: "12 niños · martes 17 jun",
  posts: [/* los 3 posts del comp */],
};
```

Colores de avatar/badge y la etiqueta visible en español (LOGRO, ACTIVIDAD, ANUNCIO) se derivan de `kind` en el componente (map kind → colores y etiqueta del comp); no se guardan en data. Los identificadores internos van en inglés; el español queda solo en la capa visual.

## Implementation plan

1. `app/globals.css` + `app/layout.tsx`: tokens de paleta en `@theme` (fondo `#F6ECDF`, superficie `#FFFDF9`, borde `#ECE0D0`, tinta `#3F362E`, acento `#F4977E`/`#EE8164`); quitar dark mode y Geist; cargar Fredoka y Nunito con `next/font/google` (verificar la API en `node_modules/next/dist/docs/` antes — Next 16 tiene breaking changes); `lang="es"` y metadata "OpenDayCare · Sala Soles". Manual: `npm run dev` muestra fondo cálido y fuentes nuevas.
2. `components/app-sidebar.tsx` (client component): sidebar desktop sticky de 248px según comp + drawer con hamburguesa en `<lg`; integrarla en `app/layout.tsx` envolviendo `{children}`. Links: logo y Feed → `/`; Niños, Avisos, Mi cuenta, "Nueva publicación" y logout → `href="#"` inertes. Manual: `/` muestra la sidebar; en ventana angosta el drawer abre y cierra.
3. `app/data/feed.ts`: tipos y mock data de los 3 posts + saludo/meta. Manual: `npx tsc --noEmit` pasa.
4. `app/page.tsx` + `components/post-card.tsx`: reemplazar el boilerplate por el feed (header, trigger inerte, divisor, lista de `PostCard`) leyendo `feedData`; los links de comentarios, foto y "Editar" son inertes. Manual: `/` igual al comp en desktop.

## Acceptance criteria

- [x] `npm run dev` levanta `/` sin errores en consola.
- [x] En desktop (≥1024px), `/` es visualmente 1:1 con `references/pantallas/feed.dc.html` (colores, tipografías, tamaños, espaciados y sombras), verificado lado a lado.
- [x] Los 3 posts se renderizan en orden (logro 14:20, actividad 09:40 con placeholder de foto, anuncio 07:50) con corazones 3/5/8 y comentarios 1/2/0.
- [x] La sidebar aparece en `/` desde el layout compartido, con Feed marcado activo.
- [x] Cero 404 al clickear Niños, Avisos, Mi cuenta, Nueva publicación, Editar, comentarios, foto y logout.
- [x] En viewport <1024px el botón hamburguesa abre la sidebar como drawer y se cierra tocando el overlay.
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Decisions

- **Sí:** mock data tipada en `app/data/feed.ts`. La futura BD cambia la fuente sin tocar la UI.
- **Sí:** valores internos en inglés (`PostKind` = `"achievement" | "activity" | "announcement"`). Regla del repo: código en inglés; el español queda solo en la capa visual (etiquetas de badge y textos derivados en el componente).
- **Sí:** sidebar como componente compartido en el layout raíz. Las pantallas futuras la heredan; el login se aislará con route groups.
- **Sí:** Fredoka + Nunito vía `next/font/google`. Self-hosted, sin FOUC ni CDN en runtime.
- **Sí:** Tailwind v4 con tokens del comp en `@theme`. Es el stack del proyecto; los inline styles literales del comp no generan design tokens reutilizables.
- **Sí:** drawer hamburguesa en móvil (elección explícita del usuario; no hay comp móvil).
- **Sí:** contenido estático tal cual el comp (saludo, "martes 17 jun", contadores). Lo dinámico llega con la BD.
- **Sí:** anclas inertes (`href="#"`) para pantallas inexistentes. Evita 404s.
- **Sí:** eliminar el dark mode del scaffold. El comp define fondo claro `#F6ECDF` como fuente de verdad.
- **No:** rutas futuras reales (/ninos, /avisos…) que hoy darían 404.
- **No:** likes/comentarios interactivos, fotos reales, autenticación, BD.

## Risks

| Riesgo                                                        | Mitigación                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Traducir inline styles del comp a Tailwind puede derivar radios/sombras | Comparación lado a lado comp vs `/` antes de dar por terminado   |
| La API de `next/font` en Next 16 puede diferir de lo conocido | Leer `node_modules/next/dist/docs/` antes del paso 1 (AGENTS.md) |
| El drawer exige estado en cliente dentro de un layout server  | Estado local a `app-sidebar.tsx`; sin contexto global            |

## What is **not** in this spec

- Autenticación / login.
- Base de datos, persistencia e interactividad de corazones y comentarios.
- Pantallas Niños, Avisos, Mi cuenta, crear/detalle publicación y foto.
- Fotos reales en los posts.

Cada una de esas, si llega, va en su propia spec.
