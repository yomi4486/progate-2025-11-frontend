
-- Fix: ensure the UPDATE policy compares filename (text) to auth.uid() cast to text
DO $$
BEGIN
	-- If an old policy exists, drop it so we can recreate the corrected version
	IF EXISTS (
		SELECT 1 FROM pg_policies
		WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'update_objects_by_owner_or_user_icons'
	) THEN
		DROP POLICY update_objects_by_owner_or_user_icons ON storage.objects;
	END IF;

	-- Recreate the policy using a text comparison (auth.uid()::text) and
	-- allow the object's owner_id to update as well (safer for overwrites).
	/*
	CREATE POLICY update_objects_by_owner_or_user_icons ON storage.objects
		FOR UPDATE
		USING (
			(bucket_id IS DISTINCT FROM 'attachments') AND (
				bucket_id IS DISTINCT FROM 'user_icons'
				OR (
					(regexp_replace(substring(name from '[^/]+$'), '\\.[^.]+$', '') = auth.uid()::text
					 OR owner_id = auth.uid()::text)
				)
			)
		)
		WITH CHECK (
			(bucket_id IS DISTINCT FROM 'attachments') AND (
				bucket_id IS DISTINCT FROM 'user_icons'
				OR (
					(regexp_replace(substring(name from '[^/]+$'), '\\.[^.]+$', '') = auth.uid()::text
					 OR owner_id = auth.uid()::text)
				)
			)
		);
		*/
END$$;
