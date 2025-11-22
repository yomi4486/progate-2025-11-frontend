revoke delete on table "public"."messages" from "anon";

revoke insert on table "public"."messages" from "anon";

revoke references on table "public"."messages" from "anon";

revoke select on table "public"."messages" from "anon";

revoke trigger on table "public"."messages" from "anon";

revoke truncate on table "public"."messages" from "anon";

revoke update on table "public"."messages" from "anon";

revoke delete on table "public"."messages" from "authenticated";

revoke insert on table "public"."messages" from "authenticated";

revoke references on table "public"."messages" from "authenticated";

revoke select on table "public"."messages" from "authenticated";

revoke trigger on table "public"."messages" from "authenticated";

revoke truncate on table "public"."messages" from "authenticated";

revoke update on table "public"."messages" from "authenticated";

revoke delete on table "public"."messages" from "service_role";

revoke insert on table "public"."messages" from "service_role";

revoke references on table "public"."messages" from "service_role";

revoke select on table "public"."messages" from "service_role";

revoke trigger on table "public"."messages" from "service_role";

revoke truncate on table "public"."messages" from "service_role";

revoke update on table "public"."messages" from "service_role";

alter table "public"."likes" drop constraint "likes_type_check";

alter table "public"."likes" drop constraint "likes_user_id_fkey";

alter table "public"."messages" drop constraint "messages_author_fkey";

alter table "public"."messages" drop constraint "messages_to_user_fkey";

alter table "public"."messages" drop constraint "messages_pkey";

drop index if exists "public"."messages_pkey";

drop table "public"."messages";

alter table "public"."likes" drop column "type";

alter table "public"."likes" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."likes" add constraint "likes_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."likes" validate constraint "likes_user_id_fkey1";

grant delete on table "public"."likes" to "anon";

grant insert on table "public"."likes" to "anon";

grant references on table "public"."likes" to "anon";

grant select on table "public"."likes" to "anon";

grant trigger on table "public"."likes" to "anon";

grant truncate on table "public"."likes" to "anon";

grant update on table "public"."likes" to "anon";

grant delete on table "public"."likes" to "authenticated";

grant insert on table "public"."likes" to "authenticated";

grant references on table "public"."likes" to "authenticated";

grant select on table "public"."likes" to "authenticated";

grant trigger on table "public"."likes" to "authenticated";

grant truncate on table "public"."likes" to "authenticated";

grant update on table "public"."likes" to "authenticated";

grant delete on table "public"."likes" to "service_role";

grant insert on table "public"."likes" to "service_role";

grant references on table "public"."likes" to "service_role";

grant select on table "public"."likes" to "service_role";

grant trigger on table "public"."likes" to "service_role";

grant truncate on table "public"."likes" to "service_role";

grant update on table "public"."likes" to "service_role";

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


