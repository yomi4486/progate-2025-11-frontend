drop policy "update_objects_by_owner_or_user_icons" on "storage"."objects";


  create policy "Enable read access for all users"
  on "storage"."objects"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "update_objects_by_owner_or_user_icons"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id IS DISTINCT FROM 'attachments'::text) AND ((bucket_id IS DISTINCT FROM 'user_icons'::text) OR (regexp_replace("substring"(name, '[^/]+
with check (((bucket_id IS DISTINCT FROM 'attachments'::text) AND ((bucket_id IS DISTINCT FROM 'user_icons'::text) OR (regexp_replace("substring"(name, '[^/]+;
::text), '\\.[^.]+{withcheck_clause};
::text, ''::text) = (auth.uid())::text)))){withcheck_clause};
::text), '\\.[^.]+;
::text), '\\.[^.]+{withcheck_clause};
::text, ''::text) = (auth.uid())::text)))){withcheck_clause};
::text, ''::text) = (auth.uid())::text))));
::text), '\\.[^.]+
with check (((bucket_id IS DISTINCT FROM 'attachments'::text) AND ((bucket_id IS DISTINCT FROM 'user_icons'::text) OR (regexp_replace("substring"(name, '[^/]+;
::text, ''::text) = (auth.uid())::text)))){withcheck_clause};
::text), '\\.[^.]+;
::text, ''::text) = (auth.uid())::text)))){withcheck_clause};
::text, ''::text) = (auth.uid())::text))));
::text, ''::text) = (auth.uid())::text))))
with check (((bucket_id IS DISTINCT FROM 'attachments'::text) AND ((bucket_id IS DISTINCT FROM 'user_icons'::text) OR (regexp_replace("substring"(name, '[^/]+;
::text), '\\.[^.]+;
::text, ''::text) = (auth.uid())::text))));



