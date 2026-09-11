# SPEC 06 — Nueva publicación (modal dialog)

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-09-10
> **Objective:** Implementar el modal del comp `crear-publicacion.dc.html` que se abre desde "Nueva publicación" (sidebar, en cualquier página main) y desde "Compartí un momento…" (feed), con chips de destinatarios multi-select excluyentes con "Toda la sala", TIPO single-select requerido y "Publicar" agregando la publicación al tope del feed en memoria.

## Scope

**In:**

- Modal/dialog centrado con overlay backdrop que replica fielmente el comp `crear-publicacion.dc.html`: card de 580px máx (no 520px como SPEC 04), fondo `#FBF4EC`, borde `#ECE0D0`, radius 24px, sombra `0 20px 50px -24px rgba(63,54,46,.35)`; header con "Cancelar" (`#94887B` 700 15px), título "Nueva publicación" (Fredoka 600 18px `#3F362E`) y "Publicar" (`#D9583C` 800 15px), borde inferior en header.
- Sección PARA: chips de los 8 niños de sala Soles desde `app/data/kids.ts` (avatar 26px con el color de cada niño e inicial Fredoka 600 13px, mismos valores que `components/kid-card.tsx`) + chip "Toda la sala" (sin avatar, padding 6px 16px). Ninguno seleccionado al abrir.
- Lógica PARA: multi-select entre niños; "Toda la sala" es excluyente en ambas direcciones — clic en "Toda la sala" deselecciona a todos los niños ya seleccionados, y clic en un niño deselecciona "Toda la sala". Estados: chip seleccionado borde 1.5px `#3F362E`, fondo `#3F362E`, texto blanco; inactivo borde `#ECE0D0`, fondo `#FFFDF9`, texto `#6E6359`.
- Sección TIPO: 7 pills single-select requerido — Comida (`#9A7B1E` bg, texto blanco), Siesta (`#E7DCF6`/`#7B5FC0`), Actividad (`#2E89A6`/blanco), Logro (`#CFEBD8`/`#3E9B6C`), Ánimo (`#F9D2DE`/`#C56486`), Foto (`#FBD8CC`/`#D9684A`), Anuncio (`#CCD8F4`/`#4E72C8`), radius 999, padding 8px 16px, 800 13.5px. Pills inactivas en estilo neutro (borde `#ECE0D0`, fondo `#FFFDF9`, texto `#6E6359`, mismo lenguaje que los chips PARA); la seleccionada muestra su color pleno del comp.
- Sección DESCRIPCIÓN: textarea que inicia vacío (el texto del comp es contenido demo) con placeholder "Contá cómo le fue hoy…", min-height 120px, resize vertical, radius 14px, borde 1.5px `#EADFD0`, fondo blanco.
- Sección FOTOS: decorativa — dos tiles estáticos del comp (tile 96×96 con icono de imagen `#CBB89F` sobre `#F4ECE1` + tile "Agregar" dashed `#DBCDBA` con plus `#C5503A`). Sin upload real.
- Validación al Publicar: destinatario (≥1 en PARA), tipo (1 en TIPO) y descripción no vacía son requeridos — borde rojo (`red-500`) en los chips/pills pendientes y en el textarea vacío, el modal no cierra, sin mensajes de error (patrón SPEC 04/05).
- "Publicar" válido: construye un `Post`, lo agrega al tope del feed en memoria (estado React compartido vía contexto en el layout `(main)`, sin persistencia), cierra el modal y resetea el formulario.
- Extensión del modelo: `PostKind` agrega `"food" | "nap" | "mood" | "photo"`; `components/post-card.tsx` agrega sus visuals (badges COMIDA/SIESTA/ÁNIMO/FOTO con los colores del comp) para renderizar los posts nuevos.
- Integración: el botón "Nueva publicación" del sidebar (hoy `href="#"` en `components/app-sidebar.tsx`) pasa a `<button>` y abre el modal desde cualquier página `(main)`; en el drawer móvil además cierra el drawer. El link "Compartí un momento…" del feed (hoy `href="#"` en `app/(main)/page.tsx`) abre el mismo modal.
- Cierre del modal: "Cancelar", clic en backdrop y tecla Escape, sin cambios y reseteando el formulario.
- Overlay con scroll vertical (`overflow-y-auto` + padding) para viewports bajos, dado que el modal es alto (~700px).
- Sin hover states — el comp no define ninguno; interactividad limitada a `cursor-pointer`.

**Out of scope (for future specs):**

- Upload real de fotos (file picker, miniaturas, persistencia de imágenes).
- Persistencia (BD, API, localStorage) — el post se pierde al recargar.
- Editar o eliminar publicaciones (el link "Editar" del feed queda inerte).
- Comentarios, corazones o notificaciones a padres.
- Reflejar la publicación en otras vistas (ej. perfil del niño).
- Validación de longitud mínima de la descripción.

## Data model

Cambio en `app/data/feed.ts`:

```ts
export type PostKind =
  | "achievement" | "activity" | "announcement"   // existentes
  | "food" | "nap" | "mood" | "photo";             // nuevos
```

Opciones de TIPO para el modal (en `app/data/feed.ts`):

```ts
export const postKindOptions: { value: PostKind; label: string }[] = [
  { value: "food", label: "Comida" },
  { value: "nap", label: "Siesta" },
  { value: "activity", label: "Actividad" },
  { value: "achievement", label: "Logro" },
  { value: "mood", label: "Ánimo" },
  { value: "photo", label: "Foto" },
  { value: "announcement", label: "Anuncio" },
];
```

Post generado al publicar:

```ts
const newPost: Post = {
  id: `${slugify(primerNombre)}-${Date.now()}`,  // slugify de app/data/kids.ts
  kind,                                          // PostKind elegido
  authorName,                                    // reglas de audiencia abajo
  authorInitial,                                 // inicial del primer niño; "" para toda la sala
  time,                                          // "HH:MM" de new Date() local
  publishedByYou: true,
  audience,                                      // reglas de audiencia abajo
  body: description.trim(),
  hearts: 0,
  comments: 0,
};
```

Reglas de audiencia según la selección PARA:

- 1 niño → `authorName` = primer nombre (ej. "Mateo"), `audience` = "Para: familia de Mateo".
- ≥2 niños → `authorName` = primeros nombres unidos con " y " (ej. "Mateo y Sofía"), `authorInitial` = inicial del primero, `audience` = "Para: familias de Mateo y Sofía".
- "Toda la sala" → `authorName` = "Anuncio general", `authorInitial` = "", `audience` = "Para: toda la sala"; el avatar de la card usa el megáfono (visual de announcement existente).

Nuevos `kindVisuals` en `components/post-card.tsx` (badge con colores del comp, avatar celeste con inicial):

```ts
food:         { badgeClass: "bg-[#9A7B1E] text-white", badgeLabel: "COMIDA" }
nap:          { badgeClass: "bg-[#E7DCF6] text-[#7B5FC0]", badgeLabel: "SIESTA" }
mood:         { badgeClass: "bg-[#F9D2DE] text-[#C56486]", badgeLabel: "ÁNIMO" }
photo:        { badgeClass: "bg-[#FBD8CC] text-[#D9684A]", badgeLabel: "FOTO" }
```

## Implementation plan

1. `app/data/feed.ts` + `components/post-card.tsx`: extender `PostKind` con los 4 valores nuevos, agregar `postKindOptions` y completar `kindVisuals` (badges COMIDA/SIESTA/ÁNIMO/FOTO con los colores del comp). Manual: `npx tsc --noEmit` pasa y el feed existente se ve igual (los 3 mock no usan tipos nuevos).
2. `components/feed-provider.tsx` (client): `FeedProvider` con `posts` (`useState` inicial desde `feedData.posts`), `addPost(post)` que inserta al tope, y estado `postDialogOpen` con `openPostDialog`/`closePostDialog`; exponer todo vía hook `useFeed`. Manual: `npx tsc --noEmit` pasa.
3. `components/create-post-dialog.tsx` (client): modal completo según el comp — overlay backdrop, card 580px, header Cancelar/Publicar, PARA (8 chips con avatar por niño + "Toda la sala", multi-select con exclusividad bidireccional, sin selección inicial), TIPO single-select (inactivas neutras, activa a color pleno), textarea vacío, FOTOS estático, tiles 96×96. Estado interno `selectedKidIds`/`wholeRoom`/`kind`/`description`/`submitted` con reset al cerrar (patrón `AddKidDialog`). Manual: render aislado idéntico al comp.
4. `components/create-post-dialog.tsx` (validación y envío): al pulsar "Publicar", validar PARA/TIPO/descripción — borde rojo en pendientes y no cerrar. Si es válido, aplicar las reglas de audiencia, construir el `Post`, llamar `addPost` y cerrar con reset. Manual: publicar sin campos marca rojo; completo agrega y cierra.
5. `app/(main)/layout.tsx` + `components/app-sidebar.tsx`: envolver sidebar y children en `<FeedProvider>` y renderizar `<CreatePostDialog>` dentro del provider; "Nueva publicación" pasa de `<a href="#">` a `<button>` (mismo estilo gradiente) que abre el modal y, en drawer móvil, también lo cierra. Manual: abre el modal desde `/` y desde `/kids`.
6. `app/(main)/page.tsx` + `components/feed-posts.tsx` + `components/share-moment-link.tsx`: extraer la lista de posts a un client component que consume `useFeed().posts`; extraer el link "Compartí un momento…" (mismo estilo actual) a un client component que llama `openPostDialog`. La página sigue siendo server component. Manual: publicar agrega el post al tope del feed; el link abre el modal.
7. Fidelidad visual: comparación lado a lado (desktop ≥1024px) modal vs comp `crear-publicacion.dc.html` — colores, tipografía, chips, pills, textarea, tiles, sombras. Manual: `npm run lint`, `npx tsc --noEmit`, `npm run build` sin errores.

## Acceptance criteria

- [ ] `npm run dev` abre `/` sin errores en consola.
- [ ] Clic en "Nueva publicación" en el sidebar abre el modal centrado con overlay backdrop, tanto desde `/` como desde `/kids`.
- [ ] Clic en "Compartí un momento…" en el feed abre el mismo modal.
- [ ] El modal reproduce 1:1 el comp `crear-publicacion.dc.html` en desktop (≥1024px): card 580px `#FBF4EC` radius 24, header Cancelar/título/Publicar, labels 12px/800/tracking 0.7px `#94887B`, chips radius 999 con avatar 26px, pills radius 999, textarea radius 14 borde `#EADFD0`, tiles FOTOS 96×96 — verificado lado a lado.
- [ ] PARA lista los 8 niños de sala Soles (Mateo, Sofía, Benjamín, Valentina, Tomás, Emma, Lucas, Olivia) con el color de avatar de cada uno.
- [ ] Al abrir el modal ningún chip PARA ni pill TIPO está seleccionado.
- [ ] Clic en un niño lo activa (borde/fondo `#3F362E`, texto blanco); clic en un segundo niño mantiene ambos activos (multi-select).
- [ ] Con niños seleccionados, clic en "Toda la sala" los deselecciona a todos y activa solo "Toda la sala".
- [ ] Con "Toda la sala" activa, clic en un niño deselecciona "Toda la sala" y activa ese niño.
- [ ] TIPO: clic en una pill la activa con su color pleno del comp (ej. Actividad `#2E89A6` texto blanco) y desactiva la anterior; las inactivas se ven neutras.
- [ ] Publicar sin destinatario, sin tipo o con descripción vacía muestra borde rojo en la sección pendiente y el modal no cierra.
- [ ] Publicar con todo completo cierra el modal y el post aparece al tope del feed con badge del tipo elegido, "publicado por vos", hora actual y 0 corazones / 0 comentarios.
- [ ] El post para 1 niño muestra "Para: familia de {nombre}"; para 2 niños "Para: familias de {n1} y {n2}"; para toda la sala "Para: toda la sala" con avatar megáfono.
- [ ] Clic en "Cancelar", en el backdrop o Escape cierra el modal sin cambios; reabrirlo muestra el formulario reseteado (sin chips, sin tipo, descripción vacía).
- [ ] En viewport <1024px, "Nueva publicación" en el drawer cierra el drawer y abre el modal.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Decisions

- **Sí:** modal en el layout `(main)` con contexto React (`FeedProvider`) — el botón vive en el sidebar presente en todas las páginas; el layout no se desmonta al navegar, así que los posts en memoria sobreviven entre rutas.
- **Sí:** "Publicar" agrega al feed en memoria, sin persistencia (patrón SPEC 04/05).
- **Sí:** "Compartí un momento…" abre el mismo modal (misma acción conceptual).
- **Sí:** los 8 niños de `kids.ts` sala Soles en PARA, no los 3 del comp (decisión del usuario).
- **Sí:** PARA inicia sin selección y es requerido al publicar (decisión del usuario).
- **Sí:** exclusividad bidireccional de "Toda la sala" (decisión del usuario).
- **Sí:** TIPO single-select requerido (decisión del usuario).
- **Sí:** pills TIPO inactivas en estilo neutro — el comp estático muestra las 7 a color y no define el estado inactivo; se reusa el lenguaje de los chips PARA (decisión del usuario).
- **Sí:** FOTOS decorativa con los dos tiles estáticos del comp; upload real en otra spec (decisión del usuario).
- **Sí:** textarea inicia vacío — el texto del comp es contenido demo, no default real.
- **Sí:** "Toda la sala" se publica como "Anuncio general" con avatar megáfono, reutilizando el visual de announcement existente.
- **Sí:** la página del feed sigue siendo server component; solo la lista de posts y el link pasan a client.
- **No:** upload real de fotos, persistencia, edición de posts, comentarios/notificaciones.
- **No:** ruta nueva para el modal — dialog overlay, patrón SPEC 04/05.

## Risks

| Risk                                                     | Mitigation                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Posts en memoria se pierden al recargar o cambiar de layout | Aceptado: es mock (patrón SPEC 04/05); la persistencia llega en otra spec.                                 |
| Modal alto (~700px) en viewports bajos queda recortado    | Overlay con `overflow-y-auto` y padding vertical; la card scrollea dentro del backdrop.                      |
| Cambios de estado del provider re-renderizando el árbol   | `children` del layout es un prop estable (server-rendered); solo los client components consumidores se actualizan. |

## What is **not** in this spec

- Upload real de fotos o miniaturas.
- Persistencia entre sesiones.
- Edición o eliminación de publicaciones.
- Comentarios, corazones o notificaciones interactivos.
- Reflejo de la publicación en el perfil del niño.

Cada una de esas, si llega, va en su propia spec.
