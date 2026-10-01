ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON TABLE public.projects TO anon;
DROP POLICY IF EXISTS "Allow anonymous project submissions" ON public.projects;
CREATE POLICY "Allow anonymous project submissions"
ON public.projects
FOR INSERT TO anon
WITH CHECK (true);

ALTER TABLE public.professional_applications ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON TABLE public.professional_applications TO anon;
DROP POLICY IF EXISTS "Allow anonymous professional applications" ON public.professional_applications;
CREATE POLICY "Allow anonymous professional applications"
ON public.professional_applications
FOR INSERT TO anon
WITH CHECK (true);