-- create type "storage"."buckettype" as enum ('STANDARD', 'ANALYTICS', 'VECTOR');

-- alter table "storage"."buckets" drop constraint "buckets_owner_fkey";

-- alter table "storage"."objects" drop constraint "objects_owner_fkey";

-- drop function if exists "storage"."search"(prefix text, bucketname text, limits integer, levels integer, offsets integer);

-- create table "storage"."buckets_analytics" (
--     "name" text not null,
--     "type" storage.buckettype not null default 'ANALYTICS'::storage.buckettype,
--     "format" text not null default 'ICEBERG'::text,
--     "created_at" timestamp with time zone not null default now(),
--     "updated_at" timestamp with time zone not null default now(),
--     "id" uuid not null default gen_random_uuid(),
--     "deleted_at" timestamp with time zone
-- );


-- alter table "storage"."buckets_analytics" enable row level security;

-- create table "storage"."buckets_vectors" (
--     "id" text not null,
--     "type" storage.buckettype not null default 'VECTOR'::storage.buckettype,
--     "created_at" timestamp with time zone not null default now(),
--     "updated_at" timestamp with time zone not null default now()
-- );


-- alter table "storage"."buckets_vectors" enable row level security;

-- create table "storage"."prefixes" (
--     "bucket_id" text not null,
--     "name" text not null,
--     "level" integer not null generated always as (storage.get_level(name)) stored,
--     "created_at" timestamp with time zone default now(),
--     "updated_at" timestamp with time zone default now()
-- );


-- alter table "storage"."prefixes" enable row level security;

-- create table "storage"."s3_multipart_uploads" (
--     "id" text not null,
--     "in_progress_size" bigint not null default 0,
--     "upload_signature" text not null,
--     "bucket_id" text not null,
--     "key" text not null,
--     "version" text not null,
--     "owner_id" text,
--     "created_at" timestamp with time zone not null default now(),
--     "user_metadata" jsonb
-- );


-- alter table "storage"."s3_multipart_uploads" enable row level security;

-- create table "storage"."s3_multipart_uploads_parts" (
--     "id" uuid not null default gen_random_uuid(),
--     "upload_id" text not null,
--     "size" bigint not null default 0,
--     "part_number" integer not null,
--     "bucket_id" text not null,
--     "key" text not null,
--     "etag" text not null,
--     "owner_id" text,
--     "version" text not null,
--     "created_at" timestamp with time zone not null default now()
-- );


-- alter table "storage"."s3_multipart_uploads_parts" enable row level security;

-- create table "storage"."vector_indexes" (
--     "id" text not null default gen_random_uuid(),
--     "name" text not null,
--     "bucket_id" text not null,
--     "data_type" text not null,
--     "dimension" integer not null,
--     "distance_metric" text not null,
--     "metadata_configuration" jsonb,
--     "created_at" timestamp with time zone not null default now(),
--     "updated_at" timestamp with time zone not null default now()
-- );


-- alter table "storage"."vector_indexes" enable row level security;

-- alter table "storage"."buckets" add column "allowed_mime_types" text[];

-- alter table "storage"."buckets" add column "avif_autodetection" boolean default false;

-- alter table "storage"."buckets" add column "file_size_limit" bigint;

-- alter table "storage"."buckets" add column "owner_id" text;

-- alter table "storage"."buckets" add column "public" boolean default false;

-- alter table "storage"."buckets" add column "type" storage.buckettype not null default 'STANDARD'::storage.buckettype;

-- alter table "storage"."buckets" enable row level security;

-- alter table "storage"."migrations" enable row level security;

-- alter table "storage"."objects" add column "level" integer;

-- alter table "storage"."objects" add column "owner_id" text;

-- alter table "storage"."objects" add column "path_tokens" text[] generated always as (string_to_array(name, '/'::text)) stored;

-- alter table "storage"."objects" add column "user_metadata" jsonb;

-- alter table "storage"."objects" add column "version" text;

-- alter table "storage"."objects" alter column "id" set default gen_random_uuid();

-- CREATE UNIQUE INDEX buckets_analytics_pkey ON storage.buckets_analytics USING btree (id);

-- CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);

-- CREATE UNIQUE INDEX buckets_vectors_pkey ON storage.buckets_vectors USING btree (id);

-- CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);

-- CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);

-- CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");

-- CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);

-- CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);

-- CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");

-- CREATE UNIQUE INDEX prefixes_pkey ON storage.prefixes USING btree (bucket_id, level, name);

-- CREATE UNIQUE INDEX s3_multipart_uploads_parts_pkey ON storage.s3_multipart_uploads_parts USING btree (id);

-- CREATE UNIQUE INDEX s3_multipart_uploads_pkey ON storage.s3_multipart_uploads USING btree (id);

-- CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);

-- CREATE UNIQUE INDEX vector_indexes_pkey ON storage.vector_indexes USING btree (id);

-- alter table "storage"."buckets_analytics" add constraint "buckets_analytics_pkey" PRIMARY KEY using index "buckets_analytics_pkey";

-- alter table "storage"."buckets_vectors" add constraint "buckets_vectors_pkey" PRIMARY KEY using index "buckets_vectors_pkey";

-- alter table "storage"."prefixes" add constraint "prefixes_pkey" PRIMARY KEY using index "prefixes_pkey";

-- alter table "storage"."s3_multipart_uploads" add constraint "s3_multipart_uploads_pkey" PRIMARY KEY using index "s3_multipart_uploads_pkey";

-- alter table "storage"."s3_multipart_uploads_parts" add constraint "s3_multipart_uploads_parts_pkey" PRIMARY KEY using index "s3_multipart_uploads_parts_pkey";

-- alter table "storage"."vector_indexes" add constraint "vector_indexes_pkey" PRIMARY KEY using index "vector_indexes_pkey";

-- alter table "storage"."prefixes" add constraint "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) not valid;

-- alter table "storage"."prefixes" validate constraint "prefixes_bucketId_fkey";

-- alter table "storage"."s3_multipart_uploads" add constraint "s3_multipart_uploads_bucket_id_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) not valid;

-- alter table "storage"."s3_multipart_uploads" validate constraint "s3_multipart_uploads_bucket_id_fkey";

-- alter table "storage"."s3_multipart_uploads_parts" add constraint "s3_multipart_uploads_parts_bucket_id_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) not valid;

-- alter table "storage"."s3_multipart_uploads_parts" validate constraint "s3_multipart_uploads_parts_bucket_id_fkey";

-- alter table "storage"."s3_multipart_uploads_parts" add constraint "s3_multipart_uploads_parts_upload_id_fkey" FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE not valid;

-- alter table "storage"."s3_multipart_uploads_parts" validate constraint "s3_multipart_uploads_parts_upload_id_fkey";

-- alter table "storage"."vector_indexes" add constraint "vector_indexes_bucket_id_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id) not valid;

-- alter table "storage"."vector_indexes" validate constraint "vector_indexes_bucket_id_fkey";

-- set check_function_bodies = off;

-- CREATE OR REPLACE FUNCTION storage.add_prefixes(_bucket_id text, _name text)
--  RETURNS void
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $function$
-- DECLARE
--     prefixes text[];
-- BEGIN
--     prefixes := "storage"."get_prefixes"("_name");

--     IF array_length(prefixes, 1) > 0 THEN
--         INSERT INTO storage.prefixes (name, bucket_id)
--         SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
--     END IF;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb)
--  RETURNS void
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--   INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
--   -- hack to rollback the successful insert
--   RAISE sqlstate 'PT200' using
--   message = 'ROLLBACK',
--   detail = 'rollback successful insert';
-- END
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[])
--  RETURNS void
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $function$
-- DECLARE
--     v_rows_deleted integer;
-- BEGIN
--     LOOP
--         WITH candidates AS (
--             SELECT DISTINCT
--                 t.bucket_id,
--                 unnest(storage.get_prefixes(t.name)) AS name
--             FROM unnest(bucket_ids, names) AS t(bucket_id, name)
--         ),
--         uniq AS (
--              SELECT
--                  bucket_id,
--                  name,
--                  storage.get_level(name) AS level
--              FROM candidates
--              WHERE name <> ''
--              GROUP BY bucket_id, name
--         ),
--         leaf AS (
--              SELECT
--                  p.bucket_id,
--                  p.name,
--                  p.level
--              FROM storage.prefixes AS p
--                   JOIN uniq AS u
--                        ON u.bucket_id = p.bucket_id
--                            AND u.name = p.name
--                            AND u.level = p.level
--              WHERE NOT EXISTS (
--                  SELECT 1
--                  FROM storage.objects AS o
--                  WHERE o.bucket_id = p.bucket_id
--                    AND o.level = p.level + 1
--                    AND o.name COLLATE "C" LIKE p.name || '/%'
--              )
--              AND NOT EXISTS (
--                  SELECT 1
--                  FROM storage.prefixes AS c
--                  WHERE c.bucket_id = p.bucket_id
--                    AND c.level = p.level + 1
--                    AND c.name COLLATE "C" LIKE p.name || '/%'
--              )
--         )
--         DELETE
--         FROM storage.prefixes AS p
--             USING leaf AS l
--         WHERE p.bucket_id = l.bucket_id
--           AND p.name = l.name
--           AND p.level = l.level;

--         GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
--         EXIT WHEN v_rows_deleted = 0;
--     END LOOP;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.delete_prefix(_bucket_id text, _name text)
--  RETURNS boolean
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $function$
-- BEGIN
--     -- Check if we can delete the prefix
--     IF EXISTS(
--         SELECT FROM "storage"."prefixes"
--         WHERE "prefixes"."bucket_id" = "_bucket_id"
--           AND level = "storage"."get_level"("_name") + 1
--           AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
--         LIMIT 1
--     )
--     OR EXISTS(
--         SELECT FROM "storage"."objects"
--         WHERE "objects"."bucket_id" = "_bucket_id"
--           AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
--           AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
--         LIMIT 1
--     ) THEN
--     -- There are sub-objects, skip deletion
--     RETURN false;
--     ELSE
--         DELETE FROM "storage"."prefixes"
--         WHERE "prefixes"."bucket_id" = "_bucket_id"
--           AND level = "storage"."get_level"("_name")
--           AND "prefixes"."name" = "_name";
--         RETURN true;
--     END IF;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.delete_prefix_hierarchy_trigger()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- DECLARE
--     prefix text;
-- BEGIN
--     prefix := "storage"."get_prefix"(OLD."name");

--     IF coalesce(prefix, '') != '' THEN
--         PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
--     END IF;

--     RETURN OLD;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.enforce_bucket_name_length()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- begin
--     if length(new.name) > 100 then
--         raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
--     end if;
--     return new;
-- end;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.get_level(name text)
--  RETURNS integer
--  LANGUAGE sql
--  IMMUTABLE STRICT
-- AS $function$
-- SELECT array_length(string_to_array("name", '/'), 1);
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.get_prefix(name text)
--  RETURNS text
--  LANGUAGE sql
--  IMMUTABLE STRICT
-- AS $function$
-- SELECT
--     CASE WHEN strpos("name", '/') > 0 THEN
--              regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
--          ELSE
--              ''
--         END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.get_prefixes(name text)
--  RETURNS text[]
--  LANGUAGE plpgsql
--  IMMUTABLE STRICT
-- AS $function$
-- DECLARE
--     parts text[];
--     prefixes text[];
--     prefix text;
-- BEGIN
--     -- Split the name into parts by '/'
--     parts := string_to_array("name", '/');
--     prefixes := '{}';

--     -- Construct the prefixes, stopping one level below the last part
--     FOR i IN 1..array_length(parts, 1) - 1 LOOP
--             prefix := array_to_string(parts[1:i], '/');
--             prefixes := array_append(prefixes, prefix);
--     END LOOP;

--     RETURN prefixes;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
--  RETURNS TABLE(size bigint, bucket_id text)
--  LANGUAGE plpgsql
--  STABLE
-- AS $function$
-- BEGIN
--     return query
--         select sum((metadata->>'size')::bigint) as size, obj.bucket_id
--         from "storage".objects as obj
--         group by obj.bucket_id;
-- END
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text)
--  RETURNS TABLE(key text, id text, created_at timestamp with time zone)
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--     RETURN QUERY EXECUTE
--         'SELECT DISTINCT ON(key COLLATE "C") * from (
--             SELECT
--                 CASE
--                     WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
--                         substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
--                     ELSE
--                         key
--                 END AS key, id, created_at
--             FROM
--                 storage.s3_multipart_uploads
--             WHERE
--                 bucket_id = $5 AND
--                 key ILIKE $1 || ''%'' AND
--                 CASE
--                     WHEN $4 != '''' AND $6 = '''' THEN
--                         CASE
--                             WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
--                                 substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
--                             ELSE
--                                 key COLLATE "C" > $4
--                             END
--                     ELSE
--                         true
--                 END AND
--                 CASE
--                     WHEN $6 != '''' THEN
--                         id COLLATE "C" > $6
--                     ELSE
--                         true
--                     END
--             ORDER BY
--                 key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
--         USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text)
--  RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--     RETURN QUERY EXECUTE
--         'SELECT DISTINCT ON(name COLLATE "C") * from (
--             SELECT
--                 CASE
--                     WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
--                         substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
--                     ELSE
--                         name
--                 END AS name, id, metadata, updated_at
--             FROM
--                 storage.objects
--             WHERE
--                 bucket_id = $5 AND
--                 name ILIKE $1 || ''%'' AND
--                 CASE
--                     WHEN $6 != '''' THEN
--                     name COLLATE "C" > $6
--                 ELSE true END
--                 AND CASE
--                     WHEN $4 != '''' THEN
--                         CASE
--                             WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
--                                 substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
--                             ELSE
--                                 name COLLATE "C" > $4
--                             END
--                     ELSE
--                         true
--                 END
--             ORDER BY
--                 name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
--         USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[])
--  RETURNS void
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $function$
-- DECLARE
--     v_bucket text;
--     v_top text;
-- BEGIN
--     FOR v_bucket, v_top IN
--         SELECT DISTINCT t.bucket_id,
--             split_part(t.name, '/', 1) AS top
--         FROM unnest(bucket_ids, names) AS t(bucket_id, name)
--         WHERE t.name <> ''
--         ORDER BY 1, 2
--         LOOP
--             PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
--         END LOOP;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.objects_delete_cleanup()
--  RETURNS trigger
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $function$
-- DECLARE
--     v_bucket_ids text[];
--     v_names      text[];
-- BEGIN
--     IF current_setting('storage.gc.prefixes', true) = '1' THEN
--         RETURN NULL;
--     END IF;

--     PERFORM set_config('storage.gc.prefixes', '1', true);

--     SELECT COALESCE(array_agg(d.bucket_id), '{}'),
--            COALESCE(array_agg(d.name), '{}')
--     INTO v_bucket_ids, v_names
--     FROM deleted AS d
--     WHERE d.name <> '';

--     PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
--     PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

--     RETURN NULL;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.objects_insert_prefix_trigger()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--     PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
--     NEW.level := "storage"."get_level"(NEW."name");

--     RETURN NEW;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.objects_update_cleanup()
--  RETURNS trigger
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $function$
-- DECLARE
--     -- NEW - OLD (destinations to create prefixes for)
--     v_add_bucket_ids text[];
--     v_add_names      text[];

--     -- OLD - NEW (sources to prune)
--     v_src_bucket_ids text[];
--     v_src_names      text[];
-- BEGIN
--     IF TG_OP <> 'UPDATE' THEN
--         RETURN NULL;
--     END IF;

--     -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
--     WITH added AS (
--         SELECT n.bucket_id, n.name
--         FROM new_rows n
--         WHERE n.name <> '' AND position('/' in n.name) > 0
--         EXCEPT
--         SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
--     ),
--     moved AS (
--          SELECT o.bucket_id, o.name
--          FROM old_rows o
--          WHERE o.name <> ''
--          EXCEPT
--          SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
--     )
--     SELECT
--         -- arrays for ADDED (dest) in stable order
--         COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
--         COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
--         -- arrays for MOVED (src) in stable order
--         COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
--         COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
--     INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

--     -- Nothing to do?
--     IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
--         RETURN NULL;
--     END IF;

--     -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
--     DECLARE
--         v_all_bucket_ids text[];
--         v_all_names text[];
--     BEGIN
--         -- Combine source and destination arrays for consistent lock ordering
--         v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
--         v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

--         -- Single lock call ensures consistent global ordering across all transactions
--         IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
--             PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
--         END IF;
--     END;

--     -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
--     IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
--         WITH candidates AS (
--             SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
--             FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
--             WHERE name <> ''
--         )
--         INSERT INTO storage.prefixes (bucket_id, name)
--         SELECT c.bucket_id, c.name
--         FROM candidates c
--         ON CONFLICT DO NOTHING;
--     END IF;

--     -- 4) Prune source prefixes bottom-up for OLD−NEW
--     IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
--         -- re-entrancy guard so DELETE on prefixes won't recurse
--         IF current_setting('storage.gc.prefixes', true) <> '1' THEN
--             PERFORM set_config('storage.gc.prefixes', '1', true);
--         END IF;

--         PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
--     END IF;

--     RETURN NULL;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.objects_update_level_trigger()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--     -- Ensure this is an update operation and the name has changed
--     IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
--         -- Set the new level
--         NEW."level" := "storage"."get_level"(NEW."name");
--     END IF;
--     RETURN NEW;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.objects_update_prefix_trigger()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- DECLARE
--     old_prefixes TEXT[];
-- BEGIN
--     -- Ensure this is an update operation and the name has changed
--     IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
--         -- Retrieve old prefixes
--         old_prefixes := "storage"."get_prefixes"(OLD."name");

--         -- Remove old prefixes that are only used by this object
--         WITH all_prefixes as (
--             SELECT unnest(old_prefixes) as prefix
--         ),
--         can_delete_prefixes as (
--              SELECT prefix
--              FROM all_prefixes
--              WHERE NOT EXISTS (
--                  SELECT 1 FROM "storage"."objects"
--                  WHERE "bucket_id" = OLD."bucket_id"
--                    AND "name" <> OLD."name"
--                    AND "name" LIKE (prefix || '%')
--              )
--          )
--         DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

--         -- Add new prefixes
--         PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
--     END IF;
--     -- Set the new level
--     NEW."level" := "storage"."get_level"(NEW."name");

--     RETURN NEW;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.operation()
--  RETURNS text
--  LANGUAGE plpgsql
--  STABLE
-- AS $function$
-- BEGIN
--     RETURN current_setting('storage.operation', true);
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.prefixes_delete_cleanup()
--  RETURNS trigger
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $function$
-- DECLARE
--     v_bucket_ids text[];
--     v_names      text[];
-- BEGIN
--     IF current_setting('storage.gc.prefixes', true) = '1' THEN
--         RETURN NULL;
--     END IF;

--     PERFORM set_config('storage.gc.prefixes', '1', true);

--     SELECT COALESCE(array_agg(d.bucket_id), '{}'),
--            COALESCE(array_agg(d.name), '{}')
--     INTO v_bucket_ids, v_names
--     FROM deleted AS d
--     WHERE d.name <> '';

--     PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
--     PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

--     RETURN NULL;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.prefixes_insert_trigger()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--     PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
--     RETURN NEW;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
--  RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
--  LANGUAGE plpgsql
-- AS $function$
-- declare
--     can_bypass_rls BOOLEAN;
-- begin
--     SELECT rolbypassrls
--     INTO can_bypass_rls
--     FROM pg_roles
--     WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

--     IF can_bypass_rls THEN
--         RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
--     ELSE
--         RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
--     END IF;
-- end;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
--  RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
--  LANGUAGE plpgsql
--  STABLE
-- AS $function$
-- declare
--     v_order_by text;
--     v_sort_order text;
-- begin
--     case
--         when sortcolumn = 'name' then
--             v_order_by = 'name';
--         when sortcolumn = 'updated_at' then
--             v_order_by = 'updated_at';
--         when sortcolumn = 'created_at' then
--             v_order_by = 'created_at';
--         when sortcolumn = 'last_accessed_at' then
--             v_order_by = 'last_accessed_at';
--         else
--             v_order_by = 'name';
--         end case;

--     case
--         when sortorder = 'asc' then
--             v_sort_order = 'asc';
--         when sortorder = 'desc' then
--             v_sort_order = 'desc';
--         else
--             v_sort_order = 'asc';
--         end case;

--     v_order_by = v_order_by || ' ' || v_sort_order;

--     return query execute
--         'with folders as (
--            select path_tokens[$1] as folder
--            from storage.objects
--              where objects.name ilike $2 || $3 || ''%''
--                and bucket_id = $4
--                and array_length(objects.path_tokens, 1) <> $1
--            group by folder
--            order by folder ' || v_sort_order || '
--      )
--      (select folder as "name",
--             null as id,
--             null as updated_at,
--             null as created_at,
--             null as last_accessed_at,
--             null as metadata from folders)
--      union all
--      (select path_tokens[$1] as "name",
--             id,
--             updated_at,
--             created_at,
--             last_accessed_at,
--             metadata
--      from storage.objects
--      where objects.name ilike $2 || $3 || ''%''
--        and bucket_id = $4
--        and array_length(objects.path_tokens, 1) = $1
--      order by ' || v_order_by || ')
--      limit $5
--      offset $6' using levels, prefix, search, bucketname, limits, offsets;
-- end;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
--  RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
--  LANGUAGE plpgsql
--  STABLE
-- AS $function$
-- declare
--     v_order_by text;
--     v_sort_order text;
-- begin
--     case
--         when sortcolumn = 'name' then
--             v_order_by = 'name';
--         when sortcolumn = 'updated_at' then
--             v_order_by = 'updated_at';
--         when sortcolumn = 'created_at' then
--             v_order_by = 'created_at';
--         when sortcolumn = 'last_accessed_at' then
--             v_order_by = 'last_accessed_at';
--         else
--             v_order_by = 'name';
--         end case;

--     case
--         when sortorder = 'asc' then
--             v_sort_order = 'asc';
--         when sortorder = 'desc' then
--             v_sort_order = 'desc';
--         else
--             v_sort_order = 'asc';
--         end case;

--     v_order_by = v_order_by || ' ' || v_sort_order;

--     return query execute
--         'with folders as (
--            select (string_to_array(name, ''/''))[level] as name
--            from storage.prefixes
--              where lower(prefixes.name) like lower($2 || $3) || ''%''
--                and bucket_id = $4
--                and level = $1
--            order by name ' || v_sort_order || '
--      )
--      (select name,
--             null as id,
--             null as updated_at,
--             null as created_at,
--             null as last_accessed_at,
--             null as metadata from folders)
--      union all
--      (select path_tokens[level] as "name",
--             id,
--             updated_at,
--             created_at,
--             last_accessed_at,
--             metadata
--      from storage.objects
--      where lower(objects.name) like lower($2 || $3) || ''%''
--        and bucket_id = $4
--        and level = $1
--      order by ' || v_order_by || ')
--      limit $5
--      offset $6' using levels, prefix, search, bucketname, limits, offsets;
-- end;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text)
--  RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
--  LANGUAGE plpgsql
--  STABLE
-- AS $function$
-- DECLARE
--     sort_col text;
--     sort_ord text;
--     cursor_op text;
--     cursor_expr text;
--     sort_expr text;
-- BEGIN
--     -- Validate sort_order
--     sort_ord := lower(sort_order);
--     IF sort_ord NOT IN ('asc', 'desc') THEN
--         sort_ord := 'asc';
--     END IF;

--     -- Determine cursor comparison operator
--     IF sort_ord = 'asc' THEN
--         cursor_op := '>';
--     ELSE
--         cursor_op := '<';
--     END IF;
    
--     sort_col := lower(sort_column);
--     -- Validate sort column  
--     IF sort_col IN ('updated_at', 'created_at') THEN
--         cursor_expr := format(
--             '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
--             sort_col, cursor_op
--         );
--         sort_expr := format(
--             'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
--             sort_col, sort_ord, sort_ord
--         );
--     ELSE
--         cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
--         sort_expr := format('name COLLATE "C" %s', sort_ord);
--     END IF;

--     RETURN QUERY EXECUTE format(
--         $sql$
--         SELECT * FROM (
--             (
--                 SELECT
--                     split_part(name, '/', $4) AS key,
--                     name,
--                     NULL::uuid AS id,
--                     updated_at,
--                     created_at,
--                     NULL::timestamptz AS last_accessed_at,
--                     NULL::jsonb AS metadata
--                 FROM storage.prefixes
--                 WHERE name COLLATE "C" LIKE $1 || '%%'
--                     AND bucket_id = $2
--                     AND level = $4
--                     AND %s
--                 ORDER BY %s
--                 LIMIT $3
--             )
--             UNION ALL
--             (
--                 SELECT
--                     split_part(name, '/', $4) AS key,
--                     name,
--                     id,
--                     updated_at,
--                     created_at,
--                     last_accessed_at,
--                     metadata
--                 FROM storage.objects
--                 WHERE name COLLATE "C" LIKE $1 || '%%'
--                     AND bucket_id = $2
--                     AND level = $4
--                     AND %s
--                 ORDER BY %s
--                 LIMIT $3
--             )
--         ) obj
--         ORDER BY %s
--         LIMIT $3
--         $sql$,
--         cursor_expr,    -- prefixes WHERE
--         sort_expr,      -- prefixes ORDER BY
--         cursor_expr,    -- objects WHERE
--         sort_expr,      -- objects ORDER BY
--         sort_expr       -- final ORDER BY
--     )
--     USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.update_updated_at_column()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--     NEW.updated_at = now();
--     RETURN NEW; 
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.extension(name text)
--  RETURNS text
--  LANGUAGE plpgsql
--  IMMUTABLE
-- AS $function$
-- DECLARE
--     _parts text[];
--     _filename text;
-- BEGIN
--     SELECT string_to_array(name, '/') INTO _parts;
--     SELECT _parts[array_length(_parts,1)] INTO _filename;
--     RETURN reverse(split_part(reverse(_filename), '.', 1));
-- END
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION storage.foldername(name text)
--  RETURNS text[]
--  LANGUAGE plpgsql
--  IMMUTABLE
-- AS $function$
-- DECLARE
--     _parts text[];
-- BEGIN
--     -- Split on "/" to get path segments
--     SELECT string_to_array(name, '/') INTO _parts;
--     -- Return everything except the last segment
--     RETURN _parts[1 : array_length(_parts,1) - 1];
-- END
-- $function$
-- ;

-- grant delete on table "storage"."buckets_analytics" to "anon";

-- grant insert on table "storage"."buckets_analytics" to "anon";

-- grant references on table "storage"."buckets_analytics" to "anon";

-- grant select on table "storage"."buckets_analytics" to "anon";

-- grant trigger on table "storage"."buckets_analytics" to "anon";

-- grant truncate on table "storage"."buckets_analytics" to "anon";

-- grant update on table "storage"."buckets_analytics" to "anon";

-- grant delete on table "storage"."buckets_analytics" to "authenticated";

-- grant insert on table "storage"."buckets_analytics" to "authenticated";

-- grant references on table "storage"."buckets_analytics" to "authenticated";

-- grant select on table "storage"."buckets_analytics" to "authenticated";

-- grant trigger on table "storage"."buckets_analytics" to "authenticated";

-- grant truncate on table "storage"."buckets_analytics" to "authenticated";

-- grant update on table "storage"."buckets_analytics" to "authenticated";

-- grant delete on table "storage"."buckets_analytics" to "service_role";

-- grant insert on table "storage"."buckets_analytics" to "service_role";

-- grant references on table "storage"."buckets_analytics" to "service_role";

-- grant select on table "storage"."buckets_analytics" to "service_role";

-- grant trigger on table "storage"."buckets_analytics" to "service_role";

-- grant truncate on table "storage"."buckets_analytics" to "service_role";

-- grant update on table "storage"."buckets_analytics" to "service_role";

-- grant select on table "storage"."buckets_vectors" to "anon";

-- grant select on table "storage"."buckets_vectors" to "authenticated";

-- grant select on table "storage"."buckets_vectors" to "service_role";

-- grant delete on table "storage"."prefixes" to "anon";

-- grant insert on table "storage"."prefixes" to "anon";

-- grant references on table "storage"."prefixes" to "anon";

-- grant select on table "storage"."prefixes" to "anon";

-- grant trigger on table "storage"."prefixes" to "anon";

-- grant truncate on table "storage"."prefixes" to "anon";

-- grant update on table "storage"."prefixes" to "anon";

-- grant delete on table "storage"."prefixes" to "authenticated";

-- grant insert on table "storage"."prefixes" to "authenticated";

-- grant references on table "storage"."prefixes" to "authenticated";

-- grant select on table "storage"."prefixes" to "authenticated";

-- grant trigger on table "storage"."prefixes" to "authenticated";

-- grant truncate on table "storage"."prefixes" to "authenticated";

-- grant update on table "storage"."prefixes" to "authenticated";

-- grant delete on table "storage"."prefixes" to "service_role";

-- grant insert on table "storage"."prefixes" to "service_role";

-- grant references on table "storage"."prefixes" to "service_role";

-- grant select on table "storage"."prefixes" to "service_role";

-- grant trigger on table "storage"."prefixes" to "service_role";

-- grant truncate on table "storage"."prefixes" to "service_role";

-- grant update on table "storage"."prefixes" to "service_role";

-- grant select on table "storage"."s3_multipart_uploads" to "anon";

-- grant select on table "storage"."s3_multipart_uploads" to "authenticated";

-- grant delete on table "storage"."s3_multipart_uploads" to "service_role";

-- grant insert on table "storage"."s3_multipart_uploads" to "service_role";

-- grant references on table "storage"."s3_multipart_uploads" to "service_role";

-- grant select on table "storage"."s3_multipart_uploads" to "service_role";

-- grant trigger on table "storage"."s3_multipart_uploads" to "service_role";

-- grant truncate on table "storage"."s3_multipart_uploads" to "service_role";

-- grant update on table "storage"."s3_multipart_uploads" to "service_role";

-- grant select on table "storage"."s3_multipart_uploads_parts" to "anon";

-- grant select on table "storage"."s3_multipart_uploads_parts" to "authenticated";

-- grant delete on table "storage"."s3_multipart_uploads_parts" to "service_role";

-- grant insert on table "storage"."s3_multipart_uploads_parts" to "service_role";

-- grant references on table "storage"."s3_multipart_uploads_parts" to "service_role";

-- grant select on table "storage"."s3_multipart_uploads_parts" to "service_role";

-- grant trigger on table "storage"."s3_multipart_uploads_parts" to "service_role";

-- grant truncate on table "storage"."s3_multipart_uploads_parts" to "service_role";

-- grant update on table "storage"."s3_multipart_uploads_parts" to "service_role";

-- grant select on table "storage"."vector_indexes" to "anon";

-- grant select on table "storage"."vector_indexes" to "authenticated";

-- grant select on table "storage"."vector_indexes" to "service_role";

-- CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();

-- CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

-- CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

-- CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

-- CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();

-- CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

-- CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();



-- Create public storage buckets for user icons and attachments
DO $$
BEGIN
	PERFORM storage.create_bucket('user_icons', TRUE);
EXCEPTION WHEN others THEN
	RAISE NOTICE 'user_icons bucket creation skipped: %', SQLERRM;
END
$$;

DO $$
BEGIN
	PERFORM storage.create_bucket('attachments', TRUE);
EXCEPTION WHEN others THEN
	RAISE NOTICE 'attachments bucket creation skipped: %', SQLERRM;
END
$$;


