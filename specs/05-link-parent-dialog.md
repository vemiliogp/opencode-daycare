# SPEC 05 — Vincular padre (modal dialog)

> **Status:** Implemented
> **Depends on:** SPEC 02
> **Date:** 2026-09-10
> **Objective:** Implementar un modal/dialog con el formulario del comp `vincular-padre.dc.html` que se abre al pulsar "Vincular otro padre" en el perfil `/kids/{id}`, con validación de nombre y email, pills de parentesco y código de invitación estático, agregando el padre como PENDIENTE al listado en memoria.

## Scope

**In:**

- Modal/dialog centrado con overlay backdrop que replica fielmente el comp `vincular-padre.dc.html`: header (título "Vincular padre" Fredoka 600 18px, subtítulo dinámico "a {nombre del niño}", botón X de 34×34 radius 10px `#F0E6D8`), banner informativo `#E3ECFB` con icono y texto dinámico "…Solo verá el feed de {primer nombre}.", campos NOMBRE DEL PADRE/MADRE y EMAIL, pills de PARENTESCO (Mamá/Papá/Tutor/a), caja de código de invitación (`#FBF1D6`, borde dashed `#E6D08A`, "7K4P9" Fredoka 34px letter-spacing 7px, "Vence en 7 días") y CTA "Enviar invitación" con gradiente `#F4977E→#EE8164`.
- Card de 480px de ancho máx (no 520px como SPEC 04), fondo `#FBF4EC`, radius 24px, sombra `0 20px 50px -24px rgba(63,54,46,.35)`.
- Pills single-select: "Mamá" preseleccionada (estado activo: borde `#9FB8EC`, fondo `#CCD8F4`, texto `#4E72C8`; inactivas: borde `#ECE0D0`, fondo `#FFFDF9`, texto `#6E6359`).
- Validación al enviar: nombre y email requeridos + formato de email básico — borde rojo en campos inválidos, el modal no cierra (patrón SPEC 04, sin mensajes de error).
- "Enviar invitación": agrega el padre con `status: "pending"` al listado "PADRES VINCULADOS" del perfil (estado React en memoria, sin persistencia) y cierra el modal — badge "PENDIENTE" y subtítulo "{rol} · invitación enviada".
- Extender `ParentRole` con `"tutor"`: label "Tutor/a" y avatar rosa `#F4B8CC` con inicial blanca en el listado del perfil.
- Cierre del modal: botón X, clic en backdrop y tecla Escape, sin cambios y reseteando el formulario.
- Conectar el link "Vincular otro padre" existente en `app/(main)/kids/[id]/page.tsx` (hoy `href="#"`) para abrir el modal.
- Sin hover states en pills/CTA/X — el comp no define ninguno (a diferencia de `ninos.dc.html`); interactividad limitada a `cursor-pointer`.

**Out of scope (for future specs):**

- Envío real de correo y flujo de activación del padre invitado.
- Persistencia (BD, API, localStorage) — se pierde al recargar.
- Generación aleatoria o expiración real del código de invitación.
- Edición/desvinculación de padres ya vinculados.
- Propagar el nuevo padre al listado `/kids` (contador de padres) — rutas distintas con mock separado.
- Responsive fino del modal más allá del comportamiento heredado de SPEC 04.

## Data model

Cambio mínimo en `app/data/kids.ts`:

```ts
export type ParentRole = "mother" | "father" | "tutor";
```

El tipo `Parent` no cambia. El padre generado al enviar:

```ts
// Datos generados al enviar
const newParent: Parent = {
  name: name.trim(),                        // "Diego Fernández"
  initial: name.trim().charAt(0).toUpperCase(),
  role,                                     // "mother" | "father" | "tutor"
  status: "pending",                        // badge PENDIENTE / "invitación enviada"
};
```

Derivados en el componente (no viven en data): `roleLabel` agrega `tutor → "Tutor/a"`; `parentAvatarColors` agrega `tutor: { bg: "#F4B8CC", text: "#fff" }`.

## Implementation plan

1. `app/data/kids.ts` + `app/(main)/kids/[id]/page.tsx`: agregar `"tutor"` a `ParentRole` y completar `roleLabel`/`parentAvatarColors` (tutor → "Tutor/a", `#F4B8CC`/blanco). Manual: `npx tsc --noEmit` pasa y `/kids/mateo-fernandez` se ve igual (los 8 mock no usan tutor).
2. `components/link-parent-dialog.tsx`: modal completo según el comp — overlay backdrop, card 480px, header con subtítulo dinámico, banner, inputs, pills single-select (Mamá default), código estático, CTA. Props `open`/`kidName`/`onClose`/`onSend`; estado interno `name`/`email`/`role`/`submitted` con reset al cerrar. Manual: renderizado aislado idéntico al comp.
3. `components/linked-parents-card.tsx` (client): extraer la card "PADRES VINCULADOS" actual de `page.tsx` tal cual, con `useState(parents)` inicial desde props; "Vincular otro padre" abre el dialog; `onSend` agrega el padre y cierra. Manual: montado en el perfil, abre/cierra el modal.
4. `app/(main)/kids/[id]/page.tsx`: reemplazar la card inline por `<LinkedParentsCard>` con props del niño (`kid.name`, `kid.parents`); limpiar código muerto migrado. Manual: clic en "Vincular otro padre" abre el modal; enviar con datos válidos cierra y muestra el padre PENDIENTE.
5. Fidelidad visual: comparación lado a lado (desktop ≥1024px) modal vs comp `vincular-padre.dc.html` — colores, tipografía, letter-spacing del código, dashed border, gradiente, sombras. Manual: `npm run lint`, `npx tsc --noEmit`, `npm run build` sin errores.

## Acceptance criteria

- [x] `npm run dev` abre `/kids/mateo-fernandez` sin errores en consola.
- [x] Clic en "Vincular otro padre" abre un modal centrado con overlay backdrop semitransparente.
- [x] El modal reproduce 1:1 el comp `vincular-padre.dc.html` en desktop (≥1024px): card 480px `#FBF4EC` radius 24, header con X, banner `#E3ECFB`, inputs radius 14 border `#EADFD0`, pills radius 999, caja de código dashed `#E6D08A` con "7K4P9" Fredoka 600 34px letter-spacing 7px, CTA gradiente con icono de envío — verificado lado a lado.
- [x] El subtítulo y el banner son dinámicos: en el perfil de otro niño muestran su nombre (ej. "a Sofía Méndez", "Solo verá el feed de Sofía").
- [x] "Mamá" viene preseleccionada; clic en otra pill la activa y desactiva la anterior.
- [x] Enviar con nombre vacío o email vacío/inválido muestra borde rojo en el/los campos y no cierra el modal.
- [x] Al enviar nombre y email válidos, el modal se cierra y el padre aparece en "PADRES VINCULADOS" con badge "PENDIENTE" y subtítulo "{rol} · invitación enviada".
- [x] El avatar del tutor es rosa `#F4B8CC` con inicial blanca; mamá (morado) y papá (periwinkle) sin cambios.
- [x] Clic en X, clic en backdrop o Escape cierra el modal sin cambios; el formulario se resetea al cerrar.
- [x] Ningún elemento del modal tiene hover state; los interactivos muestran `cursor-pointer`.
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Decisions

- **Sí:** modal dentro del perfil, no ruta separada — patrón SPEC 04.
- **Sí:** el padre se agrega como PENDIENTE en memoria (React state), sin persistencia — patrón SPEC 04.
- **Sí:** código estático "7K4P9" + "Vence en 7 días", mock literal del comp (decisión del usuario).
- **Sí:** "Mamá" preseleccionada, como se ve en el comp (decisión del usuario).
- **Sí:** validación requeridos + formato de email con borde rojo, sin mensajes (decisión del usuario, patrón SPEC 04).
- **Sí:** `tutor` con avatar rosa `#F4B8CC` + texto blanco (decisión del usuario).
- **Sí:** subtítulo y banner dinámicos con el nombre del niño del perfil (decisión del usuario).
- **Sí:** sin hovers — el comp no define ninguno; 1:1 estricto (decisión del usuario).
- **No:** envío real de correo, BD/persistencia, generación/expiración del código.
- **No:** extraer el perfil completo a client — solo la card de padres pasa a client; el resto de la página sigue siendo server component.

## What is **not** in this spec

- Envío real de correo y activación de la cuenta del padre.
- Persistencia entre sesiones.
- Código de invitación generado o con expiración real.
- Edición o desvinculación de padres.
- Actualización del contador de padres en el listado `/kids`.

Cada una de esas, si llega, va en su propia spec.
