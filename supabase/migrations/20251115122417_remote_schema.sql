create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "description" text
);


alter table "public"."tags" enable row level security;

create table "public"."timelines" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "description" text,
    "author" uuid not null
);


alter table "public"."timelines" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "icon_url" text,
    "bio" text
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE UNIQUE INDEX timelines_pkey ON public.timelines USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."timelines" add constraint "timelines_pkey" PRIMARY KEY using index "timelines_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."timelines" add constraint "timelines_author_fkey" FOREIGN KEY (author) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."timelines" validate constraint "timelines_author_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."timelines" to "anon";

grant insert on table "public"."timelines" to "anon";

grant references on table "public"."timelines" to "anon";

grant select on table "public"."timelines" to "anon";

grant trigger on table "public"."timelines" to "anon";

grant truncate on table "public"."timelines" to "anon";

grant update on table "public"."timelines" to "anon";

grant delete on table "public"."timelines" to "authenticated";

grant insert on table "public"."timelines" to "authenticated";

grant references on table "public"."timelines" to "authenticated";

grant select on table "public"."timelines" to "authenticated";

grant trigger on table "public"."timelines" to "authenticated";

grant truncate on table "public"."timelines" to "authenticated";

grant update on table "public"."timelines" to "authenticated";

grant delete on table "public"."timelines" to "service_role";

grant insert on table "public"."timelines" to "service_role";

grant references on table "public"."timelines" to "service_role";

grant select on table "public"."timelines" to "service_role";

grant trigger on table "public"."timelines" to "service_role";

grant truncate on table "public"."timelines" to "service_role";

grant update on table "public"."timelines" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "INSERT_ALLOW"
on "public"."tags"
as permissive
for insert
to public
with check (true);


create policy "SELECT_ALLOW"
on "public"."tags"
as permissive
for select
to public
using (true);


create policy "INSERT_ONLY_USER"
on "public"."timelines"
as permissive
for all
to public
using ((author = auth.uid()))
with check ((author = auth.uid()));


create policy "SELECT_ALL_ALLOW"
on "public"."timelines"
as permissive
for select
to public
using (true);


create policy "ALLOE_UPDATE_ONLY_USER"
on "public"."users"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));


create policy "ALLOW_SELECT"
on "public"."users"
as permissive
for select
to public
using (true);


create policy "Enable insert for users based on user_id"
on "public"."users"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = id));



