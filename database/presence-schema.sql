-- Spidey Tracker // PostgreSQL presence schema
-- Compatible with Supabase, Neon, and standard PostgreSQL.
-- The browser must never connect to this database directly. Use backend/server.py
-- or another backend with a private DATABASE_URL.

create extension if not exists pgcrypto;

create table if not exists public.presence_sessions (
  session_id uuid primary key default gen_random_uuid(),
  username varchar(24) not null,
  username_normalized varchar(24)
    generated always as (lower(btrim(username))) stored,
  latitude double precision,
  longitude double precision,
  location_shared boolean not null default false,
  status varchar(16) not null default 'online'
    check (status in ('online', 'offline')),
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint presence_username_format
    check (username ~ '^[A-Za-z0-9_ -]{3,24}$'),
  constraint presence_coordinates_pair
    check (
      (latitude is null and longitude is null)
      or (latitude is not null and longitude is not null)
    ),
  constraint presence_latitude_range
    check (latitude is null or latitude between -90 and 90),
  constraint presence_longitude_range
    check (longitude is null or longitude between -180 and 180)
);

-- Only one active session may use a username at a time.
create unique index if not exists presence_one_active_username
  on public.presence_sessions (username_normalized)
  where status = 'online';

create index if not exists presence_online_last_seen_idx
  on public.presence_sessions (last_seen desc)
  where status = 'online';

create table if not exists public.appearance_events (
  event_id uuid primary key default gen_random_uuid(),
  session_id uuid references public.presence_sessions(session_id)
    on delete set null,
  username_snapshot varchar(24) not null,
  event_type varchar(24) not null
    check (event_type in ('joined', 'went_offline', 'location_updated')),
  latitude double precision,
  longitude double precision,
  happened_at timestamptz not null default now(),
  constraint appearance_latitude_range
    check (latitude is null or latitude between -90 and 90),
  constraint appearance_longitude_range
    check (longitude is null or longitude between -180 and 180)
);

create index if not exists appearance_events_happened_at_idx
  on public.appearance_events (happened_at desc);

create index if not exists appearance_events_session_id_idx
  on public.appearance_events (session_id);

create or replace function public.set_presence_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists presence_sessions_updated_at
  on public.presence_sessions;

create trigger presence_sessions_updated_at
before update on public.presence_sessions
for each row execute function public.set_presence_updated_at();

create or replace view public.online_presence as
select
  session_id,
  username,
  latitude,
  longitude,
  location_shared,
  last_seen,
  created_at
from public.presence_sessions
where status = 'online'
  and last_seen >= now() - interval '90 seconds';

-- Run this every 30–60 seconds from the backend scheduler.
-- It marks stale sessions offline and preserves a history event.
create or replace function public.expire_stale_presence(
  p_timeout interval default interval '90 seconds'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count integer;
begin
  with expired as (
    update public.presence_sessions
    set status = 'offline',
        updated_at = now()
    where status = 'online'
      and last_seen < now() - p_timeout
    returning session_id, username, latitude, longitude
  )
  insert into public.appearance_events (
    session_id, username_snapshot, event_type, latitude, longitude
  )
  select session_id, username, 'went_offline', latitude, longitude
  from expired;

  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;

-- For Supabase: keep access behind the backend service role.
alter table public.presence_sessions enable row level security;
alter table public.appearance_events enable row level security;
