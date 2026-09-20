# SPEC 12 — Creación de publicaciones con imagen

> **Status:** Approved
> **Depends on:** SPEC 07, SPEC 08, SPEC 10
> **Date:** 2026-09-20
> **Objective:** Implementar la creación de publicaciones por parte del staff con texto formateado básico (toolbar markdown) e imagen opcional (upload a Supabase Storage), persistiendo el post en la base de datos y mostrándolo inmediatamente en el feed.

## Scope

**In:**

- Migración `007_create_posts.sql` con las tablas `posts`, `post_likes`, `post_comments`, enums `post_kind` y `post_audience_type`, RLS con políticas SELECT abiertas (temporal).
- Bucket de Supabase Storage `post-images` para almacenar las imágenes de las publicaciones.
- Server Action `createPost` que sube la imagen a Storage (si existe) e inserta el post en la BD.
- Componente `MarkdownToolbar` con botones de negrita, cursiva y lista (inserta sintaxis markdown `**texto**`, `_texto_`, `- item`).
- Componente `ImageUploader` con selector de archivo, preview de imagen y manejo de upload a Supabase Storage.
- Actualizar `CreatePostDialog` para integrar `MarkdownToolbar`, `ImageUploader` y llamar al Server Action `createPost` al publicar.
- Tras publicar exitosamente, el nuevo post se agrega al estado local del `FeedProvider` para que aparezca inmediatamente en el feed sin recargar.
- Las columnas de `posts` incluyen `image_url` (nullable) y `body` (texto con markdown).

**Out of scope (for future specs):**

- Leer el feed desde la base de datos (se lee del mock + estado local por ahora).
- Dar like a publicaciones (la tabla `post_likes` se crea pero sin UI).
- Comentar en publicaciones (la tabla `post_comments` se crea pero sin UI).
- Editar publicaciones existentes (el link "Editar" del diseño se deja inerte).
- Eliminar publicaciones.
- Notificaciones a padres cuando se publica algo dirigido a su hijo.
- Editor rich text completo (solo toolbar simple con markdown).
- Múltiples imágenes por post (solo una imagen).
- Vista de padres para publicar (solo staff crea posts).

## Data model

### Migración SQL — tablas `posts`, `post_likes`, `post_comments`

```sql
-- Enum para el tipo de publicación
CREATE TYPE post_kind AS ENUM ('food', 'nap', 'activity', 'achievement', 'mood', 'photo', 'announcement');

-- Enum para el tipo de audiencia
CREATE TYPE post_audience_type AS ENUM ('child', 'room');

-- Tabla principal de publicaciones
CREATE TABLE public.posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id      uuid NOT NULL REFERENCES public.daycares(id),
  author_id       uuid NOT NULL REFERENCES public.users(id),
  kind            post_kind NOT NULL,
  body            text NOT NULL,
  image_url       text,
  audience_type   post_audience_type NOT NULL,
  audience_child_ids uuid[],  -- NULL si audience_type = 'room'
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_daycare_created ON public.posts(daycare_id, created_at DESC);
CREATE INDEX idx_posts_author ON public.posts(author_id);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Temporal: SELECT abierto hasta auth completa
CREATE POLICY "posts_select_public" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "posts_insert_authenticated" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "posts_update_authenticated" ON public.posts
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "posts_delete_authenticated" ON public.posts
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- Tabla de likes (estructura, sin UI en esta spec)
CREATE TABLE public.post_likes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes_select_public" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "post_likes_insert_authenticated" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_likes_delete_authenticated" ON public.post_likes
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Tabla de comentarios (estructura, sin UI en esta spec)
CREATE TABLE public.post_comments (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES public.users(id),
  body      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_comments_post ON public.post_comments(post_id, created_at DESC);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_comments_select_public" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "post_comments_insert_authenticated" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Bucket de Storage para imágenes de posts
-- Se crea vía SQL usando la extensión supabase_extensions o manualmente desde el dashboard
-- El nombre del bucket será: post-images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Política de Storage: permitir upload a usuarios autenticados
CREATE POLICY "post_images_upload_authenticated" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "post_images_read_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');
```

### Server Action types

```ts
// lib/actions/create-post.ts

interface CreatePostInput {
  daycareId: string;
  authorId: string;
  kind: PostKind;           // 'food' | 'nap' | 'activity' | 'achievement' | 'mood' | 'photo' | 'announcement'
  body: string;             // texto con markdown
  imageFile?: File;         // archivo de imagen (opcional, máximo 5MB)
  audienceType: 'child' | 'room';
  audienceChildIds?: string[];  // array de child IDs si audienceType = 'child'
}

interface CreatePostResult {
  success: boolean;
  postId?: string;
  imageUrl?: string;
  error?: string;
}
```

### Image upload util

```ts
// lib/upload-image.ts

interface UploadImageResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

// Sube un File al bucket 'post-images' con path: posts/{daycareId}/{timestamp}-{random}.{ext}
// Retorna la URL pública de la imagen subida
```

### FeedProvider actualizado

El `FeedProvider` mantiene su estado local de posts (mock + posts creados en sesión). Tras crear un post exitosamente, se llama a `addPost` con el nuevo post transformado al tipo `Post` existente para que aparezca inmediatamente en el feed.

## Implementation plan

1. **Crear `supabase/migrations/007_create_posts.sql`** con las tablas `posts`, `post_likes`, `post_comments`, enums, índices, RLS, y bucket de Storage. Aplicar con `supabase_apply_migration`.
   - Manual: verificar que las 3 tablas existen con las columnas correctas y el bucket `post-images` fue creado.

2. **Crear `lib/upload-image.ts`** con la función `uploadImage(file, daycareId)` que sube un `File` al bucket `post-images` usando el cliente de Supabase Storage y retorna la URL pública.
   - Manual: llamar la función con un archivo de prueba, verificar que la imagen aparece en el bucket y la URL es accesible.

3. **Crear `lib/actions/create-post.ts`** con el Server Action `createPost(input)`: si hay `imageFile`, llama a `uploadImage`; inserta el post en la BD con `image_url` (o null); retorna `{ success, postId, imageUrl }`.
   - Manual: llamar el action con datos de prueba (sin imagen y con imagen), verificar que se inserta en la BD con los valores correctos.

4. **Crear `components/markdown-toolbar.tsx`** con un componente que recibe un `textareaRef` y un valor/onChange, e inserta markdown alrededor de la selección o en la posición del cursor. Botones: **N** (negrita), *C* (cursiva), ≡ (lista).
   - Manual: seleccionar texto y hacer clic en cada botón → se envuelve con la sintaxis correspondiente. Cursor sin selección → inserta placeholders.

5. **Crear `components/image-uploader.tsx`** con un componente que muestra: preview de la imagen seleccionada (thumbnail 96x96 como el diseño), botón "Agregar" para seleccionar archivo, y botón "X" para quitar la imagen. Internamente maneja un `File` state.
   - Manual: hacer clic en "Agregar", seleccionar imagen → aparece preview con thumbnail. Clic en "X" → preview desaparece.

6. **Actualizar `components/create-post-dialog.tsx`** para:
   - Integrar `MarkdownToolbar` encima del textarea de descripción.
   - Reemplazar los placeholders de foto con `ImageUploader`.
   - Al hacer clic en "Publicar", llamar al Server Action `createPost` con los datos del formulario (incluyendo el archivo de imagen si existe).
   - Tras éxito, llamar a `addPost` con el post nuevo y cerrar el dialog.
   - Durante el envío, mostrar estado de carga (disabled en el botón "Publicar", texto "Publicando…").
   - En error, mostrar mensaje de error debajo del textarea.
   - Manual: abrir dialog, completar campos, publicar → post aparece en el feed, fila en BD, imagen en Storage.

7. **Actualizar `FeedProvider`** para que tras llamar a `addPost`, el post se agregue al array de posts. El post transformado incluye `photoCaption` si hay `image_url`.
   - Manual: crear post → aparece en el feed sin recargar la página.

8. **Verificación final**: `npm run lint`, `npx tsc --noEmit`, `npm run build` sin errores. Flujo completo: abrir dialog, seleccionar destinatario, elegir tipo, escribir texto con markdown, subir imagen, publicar → post visible en feed, fila en BD, imagen accesible en Storage.

## Acceptance criteria

- [x] Migración `007_create_posts.sql` aplicada correctamente.
- [x] Tabla `posts` existe con columnas: `id`, `daycare_id`, `author_id`, `kind`, `body`, `image_url`, `audience_type`, `audience_child_ids`, `created_at`.
- [x] Tabla `post_likes` existe con columnas: `id`, `post_id`, `user_id`, `created_at` + unique constraint `(post_id, user_id)`.
- [x] Tabla `post_comments` existe con columnas: `id`, `post_id`, `user_id`, `body`, `created_at`.
- [x] Enum `post_kind` creado con valores: food, nap, activity, achievement, mood, photo, announcement.
- [x] Enum `post_audience_type` creado con valores: child, room.
- [x] Bucket `post-images` creado y accesible públicamente.
- [x] RLS habilitada en las 3 tablas con políticas SELECT/INSERT/UPDATE (y DELETE en posts y likes).
- [x] `MarkdownToolbar` inserta sintaxis markdown al hacer clic en los botones (negrita, cursiva, lista).
- [x] `ImageUploader` muestra preview de imagen seleccionada y permite quitarla.
- [x] `CreatePostDialog` integra toolbar de markdown y uploader de imagen.
- [x] Al publicar con imagen, la imagen se sube a Storage y `image_url` se guarda en el post.
- [x] Al publicar sin imagen, `image_url` es null en la BD.
- [x] El botón "Publicar" muestra estado de carga durante el envío.
- [x] Tras publicar exitosamente, el post aparece en el feed sin recargar la página.
- [x] Los campos requeridos (destinatario, tipo, descripción) validan antes de enviar.
- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan sin errores.

## Decisions

- **Sí:** Server Action para crear posts (no API route). Más simple, integra directo con el componente del dialog.
- **Sí:** Toolbar simple con markdown en lugar de rich text editor. Menos dependencias, mismo resultado visual, consistente con MVP.
- **Sí:** Una sola imagen por post. El diseño muestra un único thumbnail — suficiente para la fase actual.
- **Sí:** Preview de imagen antes de publicar. El usuario ve qué va a subir y puede quitarla.
- **Sí:** Tablas `post_likes` y `post_comments` se crean ahora (sin UI). Evita migración futura invasiva y permite que los counts en el feed sean reales más adelante.
- **Sí:** SELECT abierto en RLS para posts (temporal). Se restringirá cuando auth completa esté activa.
- **No:** Leer feed desde BD en esta spec. Se mantiene mock + estado local. La lectura real viene en otra spec.
- **No:** Editar publicaciones. El link "Editar" del diseño queda inerte por ahora.
- **No:** Notificaciones a padres. El campo `notify_on_post` existe en `users` pero no se usa en esta spec.
- **No:** Múltiples imágenes. El diseño sugiere una sola foto por post.

## Risks

| Riesgo | Mitigación |
| ------ | ---------- |
| Imagen muy grande (>5MB) | Validar tamaño del archivo en el cliente antes de subir. Mostrar error si excede el límite. |
| El upload de imagen falla pero el post se inserta | Hacer el upload antes del INSERT. Si falla, no se inserta el post. |
| RLS abierta expone posts entre daycares | Aceptable para MVP; las políticas SELECT incluyen `daycare_id` como filtro cuando auth esté completa. |
| Markdown no se renderiza en el feed | El feed actual muestra `post.body` como texto plano. El renderizado de markdown viene en otra spec. |
| Bucket de Storage no existe | La migración lo crea con `INSERT INTO storage.buckets`. Si falla, se puede crear manualmente desde el dashboard. |

## What is **not** in this spec

- Leer el feed desde la base de datos.
- Dar like a publicaciones (solo estructura de tabla).
- Comentar en publicaciones (solo estructura de tabla).
- Editar o eliminar publicaciones.
- Notificaciones a padres.
- Editor rich text completo.
- Múltiples imágenes por post.
- Vista de padres para publicar.

Cada una de esas, si llega, va en su propia spec.
