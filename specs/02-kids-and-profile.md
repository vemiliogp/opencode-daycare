# SPEC 02 — Niños y perfil de niño (/kids, /kids/{id})

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-09-08
> **Objective:** Implementar los comps `references/pantallas/ninos.dc.html` y `references/pantallas/perfil-nino.dc.html` como `/kids` y `/kids/{id}` con mock data tipada, fidelidad visual 1:1 y navegación completa entre feed, listado y perfil, sin autenticación ni BD.

## Scope

**In:**

- Ruta `/kids` con el listado del comp: header "GESTIÓN / Niños" + botón "Agregar niño" (inerte), buscador, divisor "SALA SOLES · 8 niños" y grid de 2 columnas con las 8 cards (avatar coloreado con inicial, nombre, "N años · N padres vinculados", badge o chevron, hover con elevación).
- Ruta `/kids/{id}` con el perfil del comp: link "Volver a Niños", cabecera (avatar, nombre, "N años · Sala Soles", "Editar" inerte), card "Alergias y notas" (condicional), card de datos (Fecha de nacimiento, Sala, Ingreso) y columna derecha con "Resumen del día" (inerte) y "PADRES VINCULADOS" + "Vincular otro padre" (inerte).
- Mock data tipada de los 8 niños en `app/data/kids.ts`: los datos de Mateo salen literales de los comps; los otros 7 se inventan coherentes con el patrón del comp (edades, badges y colores según el listado).
- Buscador funcional: filtro en vivo por nombre y contador dinámico ("N niños").
- Sidebar (`components/app-sidebar.tsx`): Niños → `/kids` y estado activo dinámico por ruta (Feed activo en `/`, Niños activo en `/kids` y `/kids/*`), en desktop y en el drawer móvil.
- `notFound()` para ids que no existan en el mock.
- Responsive heredado de SPEC 01: drawer en `<lg`; el grid colapsa a 1 columna y la columna derecha del perfil pasa abajo en pantallas angostas.

**Out of scope (for future specs):**

- Autenticación y pantalla login.
- Base de datos y persistencia (perfiles y vinculaciones son mock de solo lectura).
- Pantallas Agregar/Editar niño, Resumen del día, Vincular padre, Avisos y Mi cuenta (sus botones quedan inertes con `href="#"`).
- Edición, vinculación y resúmenes reales.
- Metadata específica por ruta.
- Responsive fino más allá del drawer y el colapso de grid/columnas.

## Data model

Nueva estructura en `app/data/kids.ts` (única fuente de contenido; la futura BD reemplaza este archivo):

```ts
export type AvatarColor = "sky" | "pink" | "green" | "yellow" | "purple" | "periwinkle";
export type ParentStatus = "active" | "pending";
export type ParentRole = "mother" | "father";

export type Parent = {
  name: string;         // "Lucía Fernández"
  initial: string;      // "L"
  role: ParentRole;     // "Mamá" / "Papá" se derivan en el componente
  status: ParentStatus; // "ACTIVA"/"PENDIENTE" y subtítulos se derivan en el componente
};

export type Kid = {
  id: string;             // "mateo-fernandez" → /kids/mateo-fernandez
  name: string;           // "Mateo Fernández"
  initial: string;        // "M"
  avatarColor: AvatarColor;
  ageYears: number;       // 3
  birthDate: string;      // "12 mar 2022" (display, como SPEC 01)
  room: string;           // "Soles"
  enrollment: string;     // "feb 2025" (display)
  allergyLabel?: string;  // "MANÍ" / "LACTOSA" → badge naranja en el listado
  allergyNote?: string;   // texto de la card "Alergias y notas" del perfil
  parents: Parent[];
};

export const kids: Kid[] = [/* los 8 del comp */];
```

Derivados en el componente (no viven en data):

- Colores de avatar: mapa `AvatarColor` → hex del comp; en niños con tinte de texto (`sky` #A9D9E8/#1F7A93, `pink` #F4B8CC/#C44A7A, `green` #B9DEC4/#3E8B62, `yellow` #F4DC8E/#9A7B1E, `purple` #C9B6E8/#7B5FC0) y en padres con texto blanco (`purple`, `periwinkle` #A9C7E8).
- Subtítulo de padres del listado: `parents.length` → "2 padres vinculados" / "1 padre vinculado" / "sin padres vinculados".
- Elemento derecho de la card: badge de alergia si hay `allergyLabel`; si no, badge "VINCULAR" si `parents.length === 0`; si no, chevron.
- Card "Alergias y notas" del perfil: se renderiza solo si existe `allergyNote`.
- Badges y subtítulos de padres: `status` → "ACTIVA" (verde) / "PENDIENTE" (amarillo) y "activa" / "invitación enviada".

## Implementation plan

1. `app/data/kids.ts`: tipos y mock de los 8 niños — Mateo literal de los comps; el resto inventado coherente (edades, badges y colores exactos del listado). Manual: `npx tsc --noEmit` pasa.
2. `components/app-sidebar.tsx`: Niños → `/kids`; estado activo dinámico con `usePathname()` (Feed en `/`, Niños en rutas `/kids*`); Avisos, Mi cuenta, "Nueva publicación" y logout siguen inertes; el drawer se cierra al navegar. Manual: navegar `/` ↔ `/kids` marca el ítem correcto.
3. `app/kids/page.tsx` (server) + `components/kids-browser.tsx` (client: input, contador, grid) + `components/kid-card.tsx`: listado según el comp con filtro en vivo por nombre. Manual: `/kids` 1:1 con el comp en desktop; escribir filtra y actualiza el contador.
4. `app/kids/[id]/page.tsx`: `await params` (en Next 16 `params` es Promise — confirmado en `node_modules/next/dist/docs/`), lookup por slug, `notFound()` si no existe, perfil según el comp. Manual: `/kids/mateo-fernandez` 1:1 con el comp; id inválido → 404; navegación completa entre las tres páginas.

## Acceptance criteria

- [x] `npm run dev` levanta `/kids` y `/kids/mateo-fernandez` sin errores en consola.
- [x] En desktop (≥1024px), `/kids` es visualmente 1:1 con `references/pantallas/ninos.dc.html` (colores, tipografías, tamaños, espaciados, sombras y hover), verificado lado a lado.
- [x] En desktop (≥1024px), `/kids/mateo-fernandez` es visualmente 1:1 con `references/pantallas/perfil-nino.dc.html`.
- [x] Las 8 cards se renderizan con iniciales/colores/edades del comp: Mateo badge MANÍ, Tomás badge LACTOSA, Valentina badge VINCULAR, el resto chevron.
- [x] Cada card navega al perfil de ese niño y "Volver a Niños" regresa a `/kids`.
- [x] El buscador filtra en vivo por nombre (case-insensitive) y el contador refleja el número de resultados; sin coincidencias muestra un estado vacío explícito.
- [x] La sidebar marca Feed activo en `/` y Niños activo en `/kids` y `/kids/{id}`, en desktop y en el drawer móvil.
- [x] Cero 404 al clickear "Agregar niño", "Editar", "Resumen del día", "Vincular otro padre", "Nueva publicación", Avisos, Mi cuenta y logout.
- [x] `/kids/id-inexistente` devuelve 404.
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Decisions

- **Sí:** perfiles completos para los 8 niños (decisión del usuario). Los 7 restantes se inventan coherentes con el patrón del comp; `app/data/kids.ts` es desechable por diseño.
- **Sí:** buscador con filtro en vivo y contador dinámico (decisión del usuario).
- **Sí:** botones hacia pantallas inexistentes inertes con `href="#"` (decisión del usuario; convención de SPEC 01, cero 404s).
- **Sí:** id = slug del nombre (`mateo-fernandez`) y `notFound()` para ids inválidos (decisiones del usuario).
- **Sí:** mock data tipada en `app/data/kids.ts` con identificadores en inglés (`AvatarColor`, `ParentStatus`, `ParentRole`); el español queda solo en la capa visual, como en SPEC 01.
- **Sí:** fechas y edad como strings de display ("12 mar 2022", 3). Sin BD no hay nada que calcular.
- **Sí:** colores de avatar como claves tipadas mapeadas a los hex del comp en el componente; nada de hex sueltos en data.
- **Sí:** card de alergias condicional (`allergyNote` presente) — niños sin alergias no muestran la card.
- **Sí:** grid de 2 columnas colapsando a 1 y columna derecha del perfil abajo en pantallas angostas (mínimo sensato junto al drawer de SPEC 01).
- **No:** rutas reales para Agregar/Editar/Resumen/Vincular (hoy darían 404).
- **No:** BD, autenticación, edición/vinculación reales, responsive fino.
- **Nota:** el comp de Niños dice "8 niños" mientras el feed dice "12 niños"; cada comp es la fuente de verdad de su pantalla hasta que exista BD.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| `params` es `Promise` en Next 16 (cambio vs. versiones previas) | `await params` en `[id]/page.tsx`; ya confirmado en `node_modules/next/dist/docs/` |
| Traducir inline styles del comp a Tailwind puede derivar radios/sombras/badges | Comparación lado a lado comp vs app antes de dar por terminado |
| Datos inventados de los 7 niños pueden diferir de la BD futura | El mock es desechable por diseño; la BD reemplaza `app/data/kids.ts` |

## What is **not** in this spec

- Autenticación / login.
- Base de datos, persistencia, edición y vinculación reales.
- Pantallas Agregar/Editar niño, Resumen del día, Vincular padre, Avisos y Mi cuenta.

Cada una de esas, si llega, va en su propia spec.
