-- Create relationship_type enum if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
    CREATE TYPE public.relationship_type AS ENUM ('mother', 'father', 'guardian');
  END IF;
END $$;

-- Create invitation_status enum if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
    CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
  END IF;
END $$;

-- invitations table
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

-- parent_children table
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
