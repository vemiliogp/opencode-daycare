# SPEC 11 — Invitación de padre y activación de cuenta

> **Status:** Approved
> **Depends on:** SPEC 03, SPEC 08, SPEC 09, SPEC 10
> **Date:** 2026-09-17
> **Objective:** Implementar el flujo completo de vinculación de padre: generar código de invitación al enviar el formulario, enviar email con Resend REST API desde Server Actions en Next.js, y permitir que el padre active su cuenta con el código pre-cargado, creando su cuenta en Supabase Auth + public.users + parent_children.

## Scope

**In:**

- Migración `006_create_invitations_and_parent_children.sql` con las tablas `invitations` y `parent_children`, índices, y RLS con políticas SELECT abiertas (temporal).
- Server Action `sendInvitation` que genera un código alfanumérico aleatorio de 5 caracteres, inserta la invitación en la BD, y llama a Resend REST API directamente para enviar el email.
- Actualizar `LinkParentDialog` para que al enviar llame al Server Action, y mostrar el código generado en la caja del formulario (reemplazando el mock estático "7K4P9").
- Actualizar `LinkedParentsCard` para agregar un botón "Reenviar invitación" visible solo para padres con `status: "pending"`, que llame a un Server Action para reenviar el email con el mismo código.
- Actualizar `/activar-cuenta` para ser funcional: leer el código de la URL (`?code=XXX`), cargar los datos de la invitación (email, nombre del niño), y permitir crear la cuenta con contraseña.
- Crear cuenta real en Supabase Auth via `signUp`, crear fila en `public.users` (trigger existente de SPEC 08), y crear vínculo en `parent_children`.
- Variable de entorno `RESEND_API_KEY` documentada como requerida (placeholder en `.env.example`).
- Email HTML con estilo inline: saludo con nombre del padre, código de invitación destacado, botón CTA al link de activación.
- Código de invitación pre-cargado en `/activar-cuenta?code=XXX`: el campo de código se muestra prellenado y readonly, el email se muestra prellenado (si la invitación tiene email), el padre solo completa contraseña y acepta términos.
- Redirección a `/` tras activación exitosa.

**Out of scope (for future specs):**

- Notificación al staff cuando un padre activa su cuenta.
- Hash del código de invitación (se guarda en texto plano).
- Expired/cancelled status management en la UI (el código se rechaza silenciosamente si expiró).
- Personalización del template de email por guardería.
- Reenvío de invitación con nuevo código (se reenvía el mismo código).
- Soporte para múltiples niños por padre desde la activación (un padre se vincula a un solo niño por invitación).
- Validación avanzada de contraseña (se requiere mínimo 8 caracteres).

## Data model

### Migración SQL — tablas `invitations` y `parent_children`

```sql
-- invitations
CREATE TABLE public.invitations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      uuid NOT NULL REFERENCES public.children(id),
  invited_by    uuid REFERENCES public.users(id),
  full_name     text NOT NULL,
  email         text NOT NULL,
  relationship  relationship_type NOT NULL,
  code          text UNIQUE NOT NULL,
  status        invitation_status NOT NULL DEFAULT 'pending',
  expires_at    timestamptz NOT NULL,
  accepted_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_code ON public.invitations(code);
CREATE INDEX idx_invitations_child_status ON public.invitations(child_id, status);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_select_public" ON public.invitations
  FOR SELECT USING (true);

CREATE POLICY "invitations_insert_authenticated" ON public.invitations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "invitations_update_authenticated" ON public.invitations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- parent_children
CREATE TABLE public.parent_children (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     uuid NOT NULL REFERENCES public.users(id),
  child_id      uuid NOT NULL REFERENCES public.children(id),
  relationship  relationship_type NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX idx_parent_children_child ON public.parent_children(child_id);

ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_children_select_public" ON public.parent_children
  FOR SELECT USING (true);

CREATE POLICY "parent_children_insert_authenticated" ON public.parent_children
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "parent_children_update_authenticated" ON public.parent_children
  FOR UPDATE USING (auth.uid() IS NOT NULL);
```

### Email sending types

```ts
// lib/email.ts

interface SendInvitationEmailInput {
  code: string;
  parentName: string;
  parentEmail: string;
  childName: string;
  activationUrl: string;
}

interface ResendEmailResponse {
  id: string;
}

// Response: { success: true, emailId: string } | { success: false, error: string }
```

### Server Action types

```ts
// lib/actions/link-parent.ts

interface SendInvitationInput {
  fullName: string;
  email: string;
  relationship: string; // "mother" | "father" | "guardian"
  childId: string;
}

interface SendInvitationResult {
  success: boolean;
  code?: string;
  error?: string;
}
```

### Activation page data

```ts
// Datos cargados desde la BD para la página de activación
interface InvitationData {
  code: string;
  email: string;
  fullName: string;
  relationship: string;
  childFullName: string;
  childRoomName: string;
}
```

## Implementation plan

1. **Crear `supabase/migrations/006_create_invitations_and_parent_children.sql`** con las tablas `invitations` y `parent_children`, índices, y políticas RLS. Aplicar con `supabase_apply_migration`.
   - Manual: verificar con query que ambas tablas existen con las columnas correctas.

2. **Crear `lib/email.ts`** con la función `sendInvitationEmail` que llama a la Resend REST API (`POST https://api.resend.com/emails`) con el HTML inline del email (saludo personalizado, código de invitación en caja destacada, botón CTA al link de activación).
   - Manual: invocar la función desde un script o console.log, verificar que Resend retorna un ID de email enviado.

3. **Crear `lib/actions/link-parent.ts`** con el Server Action `sendInvitation`: generar código aleatorio, insertar invitación en BD usando el cliente autenticado de Supabase (policy RLS `invitations_insert_authenticated`), llamar a `sendInvitationEmail`. Retornar `{ success, code?, error? }`.
   - Manual: llamar desde React Server Component, verificar que se inserta en la BD y el email se envía.

4. **Actualizar `components/link-parent-dialog.tsx`** para llamar a `sendInvitation` al enviar, mostrar el código generado en la caja (reemplazando el mock estático), y cerrar el modal tras éxito.
   - Manual: enviar el formulario → el código en la caja cambia al generado, modal se cierra, padre aparece como PENDIENTE.

5. **Crear `lib/actions/reinvite-parent.ts`** con Server Action `reinviteParent`: validar invitación existente, reenviar el email con el mismo código (no regenerar).
   - Manual: desde perfil de un niño, hacer clic en "Reenviar invitación" → email reenviado.

6. **Actualizar `components/linked-parents-card.tsx`** para agregar botón "Reenviar invitación" visible solo para padres `pending`, que llame a `reinviteParent`.
   - Manual: padre pendiente muestra botón "Reenviar invitación"; clic → feedback visual de éxito.

7. **Actualizar `app/(auth)/activar-cuenta/page.tsx`** para ser funcional: leer `?code=` de la URL, cargar datos de invitación desde BD, mostrar email y código prellenados (readonly), campo de contraseña, checkbox de términos.
   - Manual: navegar a `/activar-cuenta?code=XXXXX` con un código válido → datos prellenados.

8. **Crear `lib/actions/activate-account.ts`** con Server Action `activateAccount`: validar código, hacer `signUp` en Supabase Auth con metadata, insertar `parent_children` vía Admin API.
   - Manual: completar el formulario de activación → cuenta creada, redirect a `/`.

9. **Agregar `RESEND_API_KEY` a `.env.example`** como placeholder documentado.
   - Manual: el archivo existe con la línea `RESEND_API_KEY=your_key_here`.

10. **Verificación final**: `npm run lint`, `npx tsc --noEmit`, `npm run build` sin errores. Flujo completo: enviar invitación → recibir email → activar cuenta → login con las credenciales.
    - Manual: ejecutar todo el flujo de punta a punta.

## Acceptance criteria

- [ ] Migración `006_create_invitations_and_parent_children.sql` aplicada correctamente.
- [ ] Tabla `invitations` existe con todas las columnas: `id`, `child_id`, `invited_by`, `full_name`, `email`, `relationship`, `code`, `status`, `expires_at`, `accepted_at`, `created_at`.
- [ ] Tabla `parent_children` existe con columnas: `id`, `parent_id`, `child_id`, `relationship`, `created_at` + unique constraint `(parent_id, child_id)`.
- [ ] Índices creados: `idx_invitations_code`, `idx_invitations_child_status`, `idx_parent_children_child`.
- [ ] RLS habilitada en ambas tablas con políticas SELECT/INSERT/UPDATE.
- [ ] Email enviado correctamente con Resend: contiene código de invitación y link de activación.
- [ ] Server Action `sendInvitation` inserta invitación en BD con código aleatorio de 5 caracteres y envía email.
- [ ] `LinkParentDialog` muestra el código generado al enviar (reemplazando el mock estático).
- [ ] Modal se cierra tras envío exitoso y padre aparece como PENDIENTE.
- [ ] `LinkedParentsCard` muestra botón "Reenviar invitación" solo para padres pending.
- [ ] Reenvío envía nuevamente el email con el mismo código.
- [ ] `/activar-cuenta?code=XXXXX` carga datos de invitación y pre-llena email y código.
- [ ] Formulario de activación requiere contraseña (mínimo 8 caracteres) y aceptar términos.
- [ ] Activación exitosa crea cuenta en Supabase Auth, fila en `public.users`, y vínculo en `parent_children`.
- [ ] Tras activación, el usuario es redirigido a `/`.
- [ ] Login con las credenciales creadas funciona correctamente.
- [ ] `RESEND_API_KEY` documentada en `.env.example`.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Decisions

- **No:** Edge Function para enviar emails. Se usa Resend REST API directamente desde Server Actions de Next.js. Menos complejidad, menos latencia, un solo deploy.
- **Sí:** Resend REST API directa en lugar del SDK de Node. Evita dependencias adicionales; `fetch` nativo es suficiente.
- **Sí:** Server Action para la lógica de invitación. Más simple que una API route, integra directamente con los componentes React.
- **Sí:** Código de invitación de 5 caracteres alfanuméricos en texto plano. Suficiente para un MVP de corta duración (7 días).
- **Sí:** La activación crea la cuenta en Supabase Auth y el trigger existente de SPEC 08 crea la fila en `public.users`. No se duplica lógica de creación de usuario.
- **Sí:** `parent_children` se crea automáticamente tras el signup del padre. El flujo es atómico desde la perspectiva del usuario.
- **Sí:** `invited_by` nullable en la migración. El staff que envía la invitación se registra cuando se implemente la autenticación completa del staff.
- **Sí:** Email pre-llenado y código readonly en la activación. Minimiza errores del usuario y mejora UX.
- **Sí:** Reenvío reutiliza el mismo código (no se regenera). Simplifica la lógica y evita confusiones con códigos expirados.
- **No:** Hash del código de invitación. Se guarda en texto plano por simplicidad del MVP; se puede mejorar en el futuro.
- **No:** Notificación al staff sobre activación. Fuera del alcance de esta spec.
- **No:** Soporte para múltiples niños por padre desde la activación. Un padre se vincula a un solo niño por invitación.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| Resend no configurado (sin API key) | El email no se envía, pero la invitación se guarda en BD. El staff puede reenviar manualmente. |
| Server Action timeout (Vercel 10s en Hobby) | La llamada a Resend es rápida; si falla, la invitación queda en BD con estado pendiente para reenvío. |
| Código duplicado (colisión) | Probabilidad muy baja (36^5 = 60M combinaciones). El unique constraint en la BD rechaza duplicados; el Server Action re-genera. |
| Email llega a spam | Usar dominio verificado en Resend. Incluir instrucciones claras en el email. |
| El trigger de `public.users` no crea la fila correctamente | Verificar que el trigger de SPEC 08 está activo. Si falla, la activación retorna error y el usuario puede reintentar. |

## What is **not** in this spec

- Notificación al staff cuando un padre activa su cuenta.
- Hash del código de invitación en la BD.
- Gestión de estado expired/cancelled en la UI.
- Personalización del email por guardería.
- Soporte para múltiples niños por padre desde la activación.
- Validación avanzada de contraseña.

Cada una de esas, si llega, va en su propia spec.
