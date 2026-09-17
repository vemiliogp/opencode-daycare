-- ============================================
-- 003_fix_users_auth_integration
-- ============================================
-- Align public.users with spec:
-- 1. Remove email/password_hash columns (Supabase Auth owns auth)
-- 2. Make id a FK → auth.users(id) ON DELETE CASCADE
-- 3. Create trigger to auto-create public.users on auth.signup
-- 4. Seed demo user via auth.users directly
-- ============================================

-- ── 1. Clear existing data ──────────────────
DELETE FROM public.users;

-- ── 2. Recreate table with correct schema ──
DROP TABLE public.users;

CREATE TABLE public.users (
  id                       uuid PRIMARY KEY,
  daycare_id               uuid NOT NULL REFERENCES public.daycares(id),
  role                     user_role NOT NULL DEFAULT 'staff',
  status                   user_status NOT NULL DEFAULT 'active',
  full_name                text,
  avatar_url               text,
  notify_on_post           boolean NOT NULL DEFAULT true,
  daily_summary_enabled    boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT users_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ── 3. RLS ──────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Everyone can read (matches current behavior)
CREATE POLICY "users_select_public" ON public.users
  FOR SELECT USING (true);

-- Users can update their own row
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Only authenticated users can insert (for trigger)
CREATE POLICY "users_insert_authenticated" ON public.users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── 4. Trigger function ─────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    daycare_id,
    role,
    status,
    full_name
  ) VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'daycare_id')::uuid,
      (SELECT id FROM public.daycares LIMIT 1)
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'staff'
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'status')::user_status,
      'active'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.email
    )
  );
  RETURN NEW;
END;
$$;

-- ── 5. Trigger on auth.users ────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── 6. Seed demo user in Supabase Auth ──────
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'vemiliogp@gmail.com',
  crypt('12345678', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"staff","full_name":"Victor Gonzalez"}',
  NOW(),
  NOW(),
  '',
  '',
  false
);
