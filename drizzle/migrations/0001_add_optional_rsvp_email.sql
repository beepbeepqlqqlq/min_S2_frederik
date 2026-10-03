ALTER TABLE public.rsvp_submissions
ADD COLUMN email TEXT NULL CHECK (email IS NULL OR char_length(email) <= 254);

COMMENT ON COLUMN public.rsvp_submissions.phone IS 'DEPRECATED: retained for backward compatibility; new RSVP submissions use optional email.';