CREATE TABLE users (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id              uuid NOT NULL REFERENCES daycares(id),
  email                   text UNIQUE NOT NULL,
  password_hash           text NOT NULL,
  role                    user_role NOT NULL DEFAULT 'staff',
  status                  user_status NOT NULL DEFAULT 'active',
  full_name               text,
  avatar_url              text,
  notify_on_post          boolean NOT NULL DEFAULT true,
  daily_summary_enabled   boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (true);

INSERT INTO users (email, password_hash, daycare_id, role, status, full_name)
SELECT
  'vemiliogp@gmail.com',
  crypt('12345678', gen_salt('bf')),
  (SELECT id FROM daycares WHERE name = 'Guardería Sala Soles'),
  'staff',
  'active',
  'Staff Demo';
