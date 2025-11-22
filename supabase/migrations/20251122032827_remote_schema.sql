revoke delete on table "public"."likes" from "anon";

revoke insert on table "public"."likes" from "anon";

revoke references on table "public"."likes" from "anon";

revoke select on table "public"."likes" from "anon";

revoke trigger on table "public"."likes" from "anon";

revoke truncate on table "public"."likes" from "anon";

revoke update on table "public"."likes" from "anon";

revoke delete on table "public"."likes" from "authenticated";

revoke insert on table "public"."likes" from "authenticated";

revoke references on table "public"."likes" from "authenticated";

revoke select on table "public"."likes" from "authenticated";

revoke trigger on table "public"."likes" from "authenticated";

revoke truncate on table "public"."likes" from "authenticated";

revoke update on table "public"."likes" from "authenticated";

revoke delete on table "public"."likes" from "service_role";

revoke insert on table "public"."likes" from "service_role";

revoke references on table "public"."likes" from "service_role";

revoke select on table "public"."likes" from "service_role";

revoke trigger on table "public"."likes" from "service_role";

revoke truncate on table "public"."likes" from "service_role";

revoke update on table "public"."likes" from "service_role";

revoke delete on table "public"."tags" from "anon";

revoke insert on table "public"."tags" from "anon";

revoke references on table "public"."tags" from "anon";

revoke select on table "public"."tags" from "anon";

revoke trigger on table "public"."tags" from "anon";

revoke truncate on table "public"."tags" from "anon";

revoke update on table "public"."tags" from "anon";

revoke delete on table "public"."tags" from "authenticated";

revoke insert on table "public"."tags" from "authenticated";

revoke references on table "public"."tags" from "authenticated";

revoke select on table "public"."tags" from "authenticated";

revoke trigger on table "public"."tags" from "authenticated";

revoke truncate on table "public"."tags" from "authenticated";

revoke update on table "public"."tags" from "authenticated";

revoke delete on table "public"."tags" from "service_role";

revoke insert on table "public"."tags" from "service_role";

revoke references on table "public"."tags" from "service_role";

revoke select on table "public"."tags" from "service_role";

revoke trigger on table "public"."tags" from "service_role";

revoke truncate on table "public"."tags" from "service_role";

revoke update on table "public"."tags" from "service_role";

revoke delete on table "public"."timelines" from "anon";

revoke insert on table "public"."timelines" from "anon";

revoke references on table "public"."timelines" from "anon";

revoke select on table "public"."timelines" from "anon";

revoke trigger on table "public"."timelines" from "anon";

revoke truncate on table "public"."timelines" from "anon";

revoke update on table "public"."timelines" from "anon";

revoke delete on table "public"."timelines" from "authenticated";

revoke insert on table "public"."timelines" from "authenticated";

revoke references on table "public"."timelines" from "authenticated";

revoke select on table "public"."timelines" from "authenticated";

revoke trigger on table "public"."timelines" from "authenticated";

revoke truncate on table "public"."timelines" from "authenticated";

revoke update on table "public"."timelines" from "authenticated";

revoke delete on table "public"."timelines" from "service_role";

revoke insert on table "public"."timelines" from "service_role";

revoke references on table "public"."timelines" from "service_role";

revoke select on table "public"."timelines" from "service_role";

revoke trigger on table "public"."timelines" from "service_role";

revoke truncate on table "public"."timelines" from "service_role";

revoke update on table "public"."timelines" from "service_role";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

revoke delete on table "public"."users" from "service_role";

revoke insert on table "public"."users" from "service_role";

revoke references on table "public"."users" from "service_role";

revoke select on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

revoke update on table "public"."users" from "service_role";

alter table "public"."likes" drop constraint "likes_user_id_fkey1";

create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "content" text not null,
    "attachments" text[],
    "author" uuid not null,
    "to_user" uuid not null
);


alter table "public"."messages" enable row level security;

alter table "public"."likes" add column "type" text not null;

alter table "public"."likes" alter column "id" set default gen_random_uuid();

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."likes" add constraint "likes_type_check" CHECK ((type = ANY (ARRAY['like'::text, 'skip'::text]))) not valid;

alter table "public"."likes" validate constraint "likes_type_check";

alter table "public"."likes" add constraint "likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."likes" validate constraint "likes_user_id_fkey";

alter table "public"."messages" add constraint "messages_author_fkey" FOREIGN KEY (author) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_author_fkey";

alter table "public"."messages" add constraint "messages_to_user_fkey" FOREIGN KEY (to_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_to_user_fkey";


