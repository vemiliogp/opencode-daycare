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
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Política de Storage: permitir upload a usuarios autenticados
CREATE POLICY "post_images_upload_authenticated" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "post_images_read_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');
