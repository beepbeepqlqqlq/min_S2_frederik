DROP POLICY IF EXISTS "Guests can submit RSVP" ON public.rsvp_submissions;
CREATE POLICY "Guests can submit valid RSVP" ON public.rsvp_submissions
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND guest_side IN ('min', 'frederik')
  AND guest_count IN (0, 1)
  AND (email IS NULL OR char_length(email) <= 254)
  AND (guest_name IS NULL OR char_length(guest_name) <= 100)
  AND (guest_count = 0 OR (guest_name IS NOT NULL AND char_length(btrim(guest_name)) >= 1))
  AND created_at >= now() - interval '5 minutes'
);