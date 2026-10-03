CREATE TABLE public.rsvp_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
  attendance BOOLEAN NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 0 CHECK (guest_count BETWEEN 0 AND 1),
  guest_name TEXT CHECK (guest_name IS NULL OR char_length(guest_name) BETWEEN 1 AND 100),
  guest_side TEXT NOT NULL CHECK (guest_side IN ('min', 'frederik')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.rsvp_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvp_submissions TO service_role;
ALTER TABLE public.rsvp_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guests can submit RSVP"
ON public.rsvp_submissions FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE TABLE public.guestbook_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL CHECK (char_length(author) BETWEEN 1 AND 60),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  color_index INTEGER NOT NULL DEFAULT 0 CHECK (color_index BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.guestbook_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guestbook_messages TO service_role;
ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read guestbook messages"
ON public.guestbook_messages FOR SELECT TO anon, authenticated
USING (true);
CREATE POLICY "Anyone can add guestbook messages"
ON public.guestbook_messages FOR INSERT TO anon, authenticated
WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook_messages;