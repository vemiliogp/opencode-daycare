# SPEC 04 — Agregar niño (modal dialog)

> **Status:** Approved
> **Depends on:** SPEC 02
> **Date:** 2026-09-10
> **Objective:** Implementar un modal/dialog con el formulario del comp `agregar-nino.dc.html` que se abre al pulsar "Agregar niño" en la página `/kids`, con validación de campos obligatorios, máscara de fecha automática y salas mock, agregando el niño al array local en memoria.

## Scope

**In:**

- Modal/dialog centrado con overlay backdrop que replica fielmente el comp `agregar-nino.dc.html`: header (Cancelar, título "Agregar niño", Guardar), campos de nombre completo, fecha de nacimiento (con máscara `dd/mm/aaaa`), sala (dropdown con salas mock), alergias (etiquetas, texto libre) y notas médicas (textarea).
- Campos obligatorios: nombre, fecha de nacimiento y sala — validación visual al intentar guardar (borde rojo en campo vacío).
- Máscara automática en el input de fecha: formatea mientras el usuario escribe (`dd/mm/aaaa`), solo acepta dígitos, agrega slashes automáticamente.
- Dropdown de sala con al menos 4 salas mock (Soles, Lunas, Estrellas, Luceros) usando el estilo del comp.
- Botón "Guardar": valida campos obligatorios, agrega el nuevo niño al array `kids` en memoria (estado local React, sin persistencia real), cierra el modal y actualiza la UI de `/kids`.
- Botón "Cancelar" y cierre al hacer clic en el backdrop: cierra el modal sin cambios.
- Conectar el botón "Agregar niño" existente en `app/(main)/kids/page.tsx` (actualmente `href="#"`) para abrir el modal.
- Fidelidad visual 1:1 con el comp: fondo `#FBF4EC`, bordes redondeados, paleta cálida, fuentes Fredoka + Nunito.

**Out of scope (for future specs):**

- Persistencia real del niño agregado (base de datos, API, localStorage).
- Validación avanzada (formato de fecha válido, duplicados, longitud mínima).
- Upload de foto del niño.
- Asignación de padres desde el modal.
- Edición de niño existente.

## Data model

This spec extends the existing data model in `app/data/kids.ts`. Las salas mock se agregan como un array constante:

```ts
export const rooms: string[] = ["Soles", "Lunas", "Estrellas", "Luceros"];
```

El tipo `Kid` ya existe y no cambia. El nuevo niño se construye con los valores del formulario y se agrega al array `kids` en memoria (sin persistencia):

```ts
// Datos generados al guardar
const newKid: Kid = {
  id: slugify(name),          // ej. "martina-lopez"
  name,                       // "Martina López"
  initial: name.charAt(0).toUpperCase(),
  avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
  ageYears: calculateAge(birthDate),
  birthDate: formatBirthDate(birthDate),
  room,                       // "Soles"
  enrollment: currentMonthYear(),
  allergyLabel: allergies.toUpperCase() || undefined,
  allergyNote: notes || undefined,
  parents: [],
};
```

## Implementation plan

1. `app/data/kids.ts`: agregar constante `rooms` con 4 salas mock y helper `slugify` para generar IDs. Manual: importar `rooms` en consola de dev muestra el array.

2. `components/add-kid-dialog.tsx`: componente del modal/dialog completo — overlay con backdrop semitransparente, card centrada con el formulario del comp, estado interno para cada campo, máscara de fecha automática, validación visual de campos obligatorios. Manual: renderizar en un wrapper aislado y verificar que el modal se muestra centrado con el backdrop.

3. `app/(main)/kids/page.tsx`: agregar estado `open` para el modal, conectar el botón "Agregar niño" existente para abrirlo (`onClick` en lugar de `href`), importar y renderizar `AddKidDialog` con props `open`/`onClose`/`onSave`. Al guardar, agregar el nuevo niño al array local y cerrar el modal. Manual: clic en "Agregar niño" abre el modal; clic en "Cancelar" o backdrop lo cierra.

4. `components/add-kid-dialog.tsx` (validación): al pulsar "Guardar", validar que nombre, fecha y sala estén completos — mostrar borde rojo en campos vacíos. Si todo válido, llamar `onSave` con los datos del formulario. Manual: intentar guardar con campos vacíos muestra bordes rojos; completarlos y guardar cierra el modal.

5. `app/(main)/kids/page.tsx` (integración con KidsBrowser): pasar el array `kids` actualizado (con el nuevo niño si se agregó) al componente `KidsBrowser`. Manual: después de guardar un nuevo niño, la grilla muestra la nueva card.

6. Fidelidad visual: verificar que los estilos del modal coinciden 1:1 con el comp `agregar-nino.dc.html` — colores, tipografía, espaciado, bordes, sombras. Manual: comparar lado a lado en desktop (≥1024px).

## Acceptance criteria

- [x] `npm run dev` abre `/kids` sin errores en consola. (Verificado con Playwright: 0 errores / 0 warnings en consola tras cargar y durante todas las interacciones del modal.)
- [x] Clic en el botón "Agregar niño" en `/kids` abre un modal/dialog centrado con overlay backdrop oscuro semitransparente. (Overlay `fixed inset-0` z-50 `bg-black/40`, centrado exacto cx/cy verificado vía `getBoundingClientRect`; screenshot `.playwright-mcp/spec04-modal-open.png`.)
- [x] El modal reproduce fielmente el comp `agregar-nino.dc.html` en desktop (≥1024px): header con Cancelar/título/Guardar, campos de nombre, fecha, sala, alergias, notas médicas — verificado lado a lado. (Comparado a 1280px con estilos computados DOM contra DOM: card `#FBF4EC`/radius 24px/border `#ECE0D0`/max-w 520px/shadow idéntica; header padding 20px 26px; título Fredoka 600 18px `#3F362E`; Cancelar `#94887B` 700 15px; Guardar `#D9583C` 800 15px; labels 12px/800/0.7px/`#94887B`; inputs 13px 16px/radius 14px/`#EADFD0`/blanco/15px; fila fecha+sala gap 14px; placeholders idénticos; fuentes Nunito/Fredoka cargadas. Screenshots `.playwright-mcp/spec04-app-modal.png` y `spec04-comp-reference.png`.)
- [x] El input de fecha aplica máscara automática: al escribir dígitos se formatea como `dd/mm/aaaa` (slashes automáticos). (Tipeo `12032022` → `12/03/2022`; `04062022` → `04/06/2022`; `applyDateMask` en components/add-kid-dialog.tsx:13.)
- [x] El dropdown de sala muestra al menos 4 opciones (Soles, Lunas, Estrellas, Luceros). (Verificado vía DOM: options = Soles, Lunas, Estrellas, Luceros; selección de "Lunas" funcionando.)
- [x] Al intentar guardar con nombre vacío, borde rojo en el campo de nombre; igual para fecha y sala. (Guardar con nombre y fecha vacíos: borde `red-500` en ambos (computed `lab(55.48…)`), modal no cierra; screenshot `.playwright-mcp/spec04-validation-red-borders.png`. Sala: el select viene preseleccionado con "Soles" (no puede quedar vacío por UI) y la validación equivalente existe en `isRoomError`, components/add-kid-dialog.tsx:106.)
- [x] Al completar los 3 campos obligatorios y guardar, el modal se cierra y el nuevo niño aparece en la grilla de `/kids`. (Guardado "Cata Blanco" 04/06/2022 sala Lunas: modal cerrado, card visible en grilla, contador 8 → 9 niños.)
- [x] Clic en "Cancelar" o en el backdrop fuera del modal cierra el dialog sin cambios. (Ambos verificados: clic en Cancelar cierra; clic en overlay cierra; además Escape. Estado del form se resetea al cerrar.)
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores. (Los tres ejecutados tras `npm ci`: lint 0 problemas, tsc sin errores, build compilado con /kids estática.)

## Decisions

- **Sí:** modal/dialog dentro de `/kids` (no ruta separada). El diseño es una card centrada que sugiere overlay, y es más fluido para el usuario.
- **Sí:** máscara automática de fecha en el input (no validación post-hoc). Mejor UX — el usuario ve el formato mientras escribe.
- **Sí:** validación visual mínima (borde rojo en campos vacíos). Sin mensajes de error complejos ni validación avanzada.
- **Sí:** salas mock en `app/data/kids.ts` como array constante simple. Sin backend ni configuración dinámica.
- **Sí:** el niño nuevo se agrega al array en memoria (React state), sin persistencia. Se pierde al recargar — la persistencia llegará con otra spec.
- **No:** persistencia real (BD, API, localStorage) — fuera de alcance de este spec.
- **No:** upload de foto ni asignación de padres desde el modal — el comp no los incluye.
- **No:** validación de duplicados ni formato de fecha estricto — se maneja en spec futura si es necesario.

## What is **not** in this spec

- Persistencia del niño agregado entre sesiones.
- Validación avanzada de campos (duplicados, formato de fecha, longitud mínima).
- Upload de foto del niño.
- Asignación de padres desde el modal.
- Edición de niño existente.
- Pantalla de detalle del niño recién agregado.

Cada una de esas, si llega, va en su propia spec.
