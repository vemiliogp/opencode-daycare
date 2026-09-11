CREATE TYPE user_role AS ENUM ('staff', 'parent', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active');
CREATE TYPE relationship_type AS ENUM ('father', 'mother', 'guardian');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
CREATE TYPE post_type AS ENUM ('meal', 'nap', 'activity', 'achievement', 'photo', 'announcement');
CREATE TYPE child_status AS ENUM ('active', 'archived');

CREATE TABLE daycares (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE daycares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daycares_select_public" ON daycares
  FOR SELECT USING (true);

INSERT INTO daycares (name) VALUES
  ('Guardería Sala Soles'),
  ('Guardería Arcoíris'),
  ('Guardería Los Pequeños Exploradores'),
  ('Guardería Luna Estrella'),
  ('Guardería Patitos Felices');
