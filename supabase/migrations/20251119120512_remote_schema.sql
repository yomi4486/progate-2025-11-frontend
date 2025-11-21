-- Migration: create/replace policies for storage.objects
-- Cleaned up to fix syntax errors and ensure correct RLS behavior

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "update_objects_by_owner_or_user_icons" ON storage.objects;

-- Allow all users to read objects
CREATE POLICY "Enable read access for all users"
  ON storage.objects
  AS permissive
  FOR SELECT
  TO public
  USING (true);

-- Allow updates except for objects in `attachments` bucket.
-- For `user_icons` bucket, only allow update when the filename (without path and extension)
-- equals the calling user's uid (i.e. owners can update their own icon files).
CREATE POLICY "update_objects_by_owner_or_user_icons"
  ON storage.objects
  AS permissive
  FOR UPDATE
  TO public
  USING (
    bucket_id IS DISTINCT FROM 'attachments'
    AND (
      bucket_id IS DISTINCT FROM 'user_icons'
      OR (
        -- extract the filename (last path segment) and strip extension
        regexp_replace(regexp_replace(name, '^.*/', ''), '\\.[^.]+$', '') = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    bucket_id IS DISTINCT FROM 'attachments'
    AND (
      bucket_id IS DISTINCT FROM 'user_icons'
      OR (
        regexp_replace(regexp_replace(name, '^.*/', ''), '\\.[^.]+$', '') = auth.uid()::text
      )
    )
  );
