-- rooms
CREATE TABLE public.rooms (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES public.daycares(id),
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_public" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "rooms_insert_authenticated" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "rooms_update_authenticated" ON public.rooms
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- children
CREATE TABLE public.children (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid NOT NULL REFERENCES public.rooms(id),
  full_name     text NOT NULL,
  birth_date    date NOT NULL,
  enrolled_at   date NOT NULL DEFAULT CURRENT_DATE,
  medical_notes text,
  allergy_tags  text[],
  photo_consent boolean NOT NULL DEFAULT true,
  status        child_status NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "children_select_public" ON public.children
  FOR SELECT USING (true);

CREATE POLICY "children_insert_authenticated" ON public.children
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "children_update_authenticated" ON public.children
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Seed: 3 salas para "Guardería Sala Soles"
INSERT INTO public.rooms (daycare_id, name)
SELECT id, unnest(ARRAY['Soles', 'Lunas', 'Estrellas'])
FROM public.daycares
WHERE name = 'Guardería Sala Soles';
