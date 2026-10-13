-- M2A: private diary only. Apply exclusively to project vvwzqehzamkflrokrcqs.
-- No schema/data changes to any client project. No SECURITY DEFINER or public views.
create table public.movie_nights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  movie_id text not null check (movie_id ~ '^[a-z][a-z0-9:-]{1,120}$'),
  title_en text check (char_length(title_en) <= 240),
  title_ar text check (char_length(title_ar) <= 240),
  runtime_minutes integer check (runtime_minutes between 1 and 600),
  catalog_version text not null check (char_length(catalog_version) between 1 and 100),
  is_synthetic boolean not null,
  status text not null check (status in ('chosen', 'watched')),
  chosen_at timestamptz,
  watched_on date,
  source text not null check (source in ('app', 'guest-import')),
  client_event_id text not null check (char_length(client_event_id) between 1 and 256),
  created_at timestamptz not null default now(),
  constraint chosen_has_no_watch_date check (status = 'watched' or watched_on is null),
  unique (user_id, client_event_id)
);
create unique index movie_nights_one_active_choice on public.movie_nights(user_id, movie_id) where status = 'chosen';
create unique index movie_nights_one_watch_per_day on public.movie_nights(user_id, movie_id, watched_on) where status = 'watched' and watched_on is not null;
create index movie_nights_owner_chosen_order on public.movie_nights(user_id, chosen_at desc nulls last, created_at desc);
create index movie_nights_owner_watched on public.movie_nights(user_id, movie_id) where status = 'watched';

alter table public.movie_nights enable row level security;
revoke all on public.movie_nights from anon, authenticated;
grant select, insert, delete on public.movie_nights to authenticated;
grant update(status, watched_on) on public.movie_nights to authenticated;
create policy diary_read_owner on public.movie_nights for select to authenticated using ((select auth.uid()) = user_id);
create policy diary_insert_owner on public.movie_nights for insert to authenticated with check ((select auth.uid()) = user_id);
create policy diary_update_owner on public.movie_nights for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy diary_delete_owner on public.movie_nights for delete to authenticated using ((select auth.uid()) = user_id);

-- Server timestamp and owner identity, partial uniqueness and idempotency protect retries.
create function public.choose_movie(p_movie_id text, p_title_en text, p_title_ar text,
  p_runtime_minutes integer, p_catalog_version text, p_is_synthetic boolean, p_event_id text)
returns setof public.movie_nights language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text), hashtext(p_movie_id));
  if exists(select 1 from public.movie_nights where user_id = auth.uid() and client_event_id = p_event_id) then
    return query select * from public.movie_nights where user_id = auth.uid() and client_event_id = p_event_id; return;
  end if;
  insert into public.movie_nights(user_id,movie_id,title_en,title_ar,runtime_minutes,catalog_version,is_synthetic,status,chosen_at,source,client_event_id)
  values(auth.uid(),p_movie_id,p_title_en,p_title_ar,p_runtime_minutes,p_catalog_version,p_is_synthetic,'chosen',now(),'app',p_event_id)
  on conflict do nothing;
  return query select * from public.movie_nights where user_id = auth.uid() and movie_id = p_movie_id and status = 'chosen';
end;
$$;

-- Explicit viewing may be recorded without inventing a prior selection timestamp.
create function public.record_movie_watched(p_movie_id text, p_title_en text, p_title_ar text,
  p_runtime_minutes integer, p_catalog_version text, p_is_synthetic boolean, p_event_id text, p_watched_on date)
returns setof public.movie_nights language plpgsql security invoker set search_path = '' as $$
declare active_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_watched_on is null or p_watched_on > current_date + 1 then raise exception 'Invalid watched date' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text), hashtext(p_movie_id));
  if exists(select 1 from public.movie_nights where user_id = auth.uid() and movie_id = p_movie_id and status = 'watched' and watched_on = p_watched_on) then
    return query select * from public.movie_nights where user_id = auth.uid() and movie_id = p_movie_id and status = 'watched' and watched_on = p_watched_on; return;
  end if;
  select id into active_id from public.movie_nights where user_id = auth.uid() and movie_id = p_movie_id and status = 'chosen';
  if active_id is not null then
    update public.movie_nights set status = 'watched',watched_on = p_watched_on where id = active_id and user_id = auth.uid();
    return query select * from public.movie_nights where id = active_id and user_id = auth.uid();
  else
    insert into public.movie_nights(user_id,movie_id,title_en,title_ar,runtime_minutes,catalog_version,is_synthetic,status,chosen_at,watched_on,source,client_event_id)
    values(auth.uid(),p_movie_id,p_title_en,p_title_ar,p_runtime_minutes,p_catalog_version,p_is_synthetic,'watched',null,p_watched_on,'app',p_event_id)
    on conflict do nothing;
    return query select * from public.movie_nights where user_id = auth.uid() and client_event_id = p_event_id;
  end if;
end;
$$;

create function public.import_guest_movie_nights(p_entries jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare item jsonb; inserted integer := 0; skipped integer := 0; affected integer; entry_status text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) > 500 then
    raise exception 'Import must be a bounded array' using errcode = '22023';
  end if;
  for item in select value from jsonb_array_elements(p_entries) loop
    entry_status := item->>'status';
    if entry_status not in ('chosen','watched') then raise exception 'Invalid import status' using errcode = '22023'; end if;
    perform pg_advisory_xact_lock(hashtext(auth.uid()::text), hashtext(item->>'movie_id'));
    -- Existing account records are preserved. Repeated imports cannot reset dates/status.
    if exists(select 1 from public.movie_nights where user_id = auth.uid() and movie_id = item->>'movie_id'
      and (entry_status = 'chosen' or status = 'watched')) then skipped := skipped + 1; continue; end if;
    insert into public.movie_nights(user_id,movie_id,title_en,title_ar,runtime_minutes,catalog_version,is_synthetic,status,chosen_at,watched_on,source,client_event_id)
    values(auth.uid(),item->>'movie_id',item->>'title_en',item->>'title_ar',(item->>'runtime_minutes')::integer,
      item->>'catalog_version',(item->>'is_synthetic')::boolean,entry_status,(item->>'chosen_at')::timestamptz,
      case when entry_status = 'watched' then (item->>'watched_on')::date else null end,'guest-import',item->>'client_event_id')
    on conflict do nothing;
    get diagnostics affected = row_count;
    inserted := inserted + affected; skipped := skipped + (1 - affected);
  end loop;
  return jsonb_build_object('inserted',inserted,'skipped',skipped);
end;
$$;

revoke all on function public.choose_movie(text,text,text,integer,text,boolean,text) from public, anon;
revoke all on function public.record_movie_watched(text,text,text,integer,text,boolean,text,date) from public, anon;
revoke all on function public.import_guest_movie_nights(jsonb) from public, anon;
grant execute on function public.choose_movie(text,text,text,integer,text,boolean,text) to authenticated;
grant execute on function public.record_movie_watched(text,text,text,integer,text,boolean,text,date) to authenticated;
grant execute on function public.import_guest_movie_nights(jsonb) to authenticated;
