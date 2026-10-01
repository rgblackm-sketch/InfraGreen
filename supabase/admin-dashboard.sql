ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS reference_number text;

ALTER TABLE public.professional_applications
  ADD COLUMN IF NOT EXISTS application_status text;
ALTER TABLE public.professional_applications
  ADD COLUMN IF NOT EXISTS reference_number text;

UPDATE public.projects
SET status = 'new'
WHERE status IS NULL;

UPDATE public.professional_applications
SET application_status = 'pending'
WHERE application_status IS NULL;

ALTER TABLE public.projects
  ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE public.professional_applications
  ALTER COLUMN application_status SET DEFAULT 'pending';

ALTER TABLE public.projects
  ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.professional_applications
  ALTER COLUMN application_status SET NOT NULL;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('new', 'reviewing', 'matching', 'connected', 'completed', 'closed'));

ALTER TABLE public.professional_applications
  DROP CONSTRAINT IF EXISTS professional_applications_status_check;
ALTER TABLE public.professional_applications
  ADD CONSTRAINT professional_applications_status_check
  CHECK (application_status IN ('pending', 'reviewing', 'approved', 'declined'));

CREATE UNIQUE INDEX IF NOT EXISTS projects_reference_number_unique
  ON public.projects(reference_number)
  WHERE reference_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS professional_applications_reference_number_unique
  ON public.professional_applications(reference_number)
  WHERE reference_number IS NOT NULL;
