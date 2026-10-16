-- Project photo uploads. Run once in the Supabase SQL editor.

-- 1) Column that stores the uploaded file paths on each project.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS photo_paths text[] NOT NULL DEFAULT '{}';

-- 2) Private bucket: images only, 10 MB max per file.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-photos',
  'project-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3) Policies. Uploads use one-time signed upload URLs created by the server with the
--    service-role key, and admins view photos through short-lived signed URLs, so no
--    anon or authenticated policies are needed. Remove any broad policies on this bucket.
DROP POLICY IF EXISTS "Public read project photos" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload project photos" ON storage.objects;
-- With RLS on storage.objects (Supabase default) and no policy granting access,
-- only the service role can read or write objects in 'project-photos'.
