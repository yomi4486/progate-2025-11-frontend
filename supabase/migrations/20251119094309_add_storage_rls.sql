-- Public read: allow anyone to SELECT objects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'public_read_on_objects'
  ) THEN
    CREATE POLICY public_read_on_objects ON storage.objects
      FOR SELECT
      USING (true);
  END IF;
END$$;

-- Allow INSERT for now (all users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'public_insert_on_objects'
  ) THEN
    CREATE POLICY public_insert_on_objects ON storage.objects
      FOR INSERT
      WITH CHECK (true);
  END IF;
END$$;

-- Allow DELETE for now (all users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'public_delete_on_objects'
  ) THEN
    CREATE POLICY public_delete_on_objects ON storage.objects
      FOR DELETE
      USING (true);
  END IF;
END$$;

-- UPDATE policy rules:
-- - Prevent updates to objects in the 'attachments' bucket.
-- - Allow updates to objects in the 'user_icons' bucket only when
--   the file name (last path segment without extension) equals auth.uid().
-- - Allow updates to other buckets for now.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'update_objects_by_owner_or_user_icons'
  ) THEN
    CREATE POLICY update_objects_by_owner_or_user_icons ON storage.objects
      FOR UPDATE
      USING (
        -- allow update when NOT in 'attachments' and either not in 'user_icons' or filename matches auth.uid()
        (bucket_id IS DISTINCT FROM 'attachments') AND (
          bucket_id IS DISTINCT FROM 'user_icons'
          OR (
            -- extract last path segment
            regexp_replace(substring(name from '[^/]+$'), '\\.[^.]+$', '') = auth.uid()::text
          )
        )
      )
      WITH CHECK (
        (bucket_id IS DISTINCT FROM 'attachments') AND (
          bucket_id IS DISTINCT FROM 'user_icons'
          OR (
            regexp_replace(substring(name from '[^/]+$'), '\\.[^.]+$', '') = auth.uid()::text
          )
        )
      );
  END IF;
END$$;

-- Note: This migration makes storage.objects broadly readable and generally writable,
-- except attachments cannot be updated and user_icons updates are gated by filename==uid.
-- If you prefer to tie INSERT/DELETE restrictions to auth.uid()/owner fields, tighten
-- the WITH CHECK / USING expressions accordingly.
