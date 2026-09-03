create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('住宿', '食物', '景點', '交通', '其他')),
  city text not null,
  address text,
  google_maps_url text,
  google_place_id text,
  google_rating numeric,
  google_review_count integer,
  photo_url text,
  note text,
  status text not null default 'wishlist' check (status in ('wishlist', 'visited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  visited_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_index integer not null default 0,
  place_id uuid references public.places(id) on delete set null,
  type text not null check (type in ('place', 'transport', 'custom')),
  title text not null,
  start_time time,
  end_time time,
  sort_order integer not null default 0,
  transport_type text,
  details text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.place_reviews enable row level security;
alter table public.trips enable row level security;
alter table public.trip_items enable row level security;

drop policy if exists "profiles are private" on public.profiles;
drop policy if exists "places are private" on public.places;
drop policy if exists "reviews are private" on public.place_reviews;
drop policy if exists "trips are private" on public.trips;
drop policy if exists "trip items are private" on public.trip_items;

create policy "profiles are private"
  on public.profiles
  for all
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "places are private"
  on public.places
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "reviews are private"
  on public.place_reviews
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "trips are private"
  on public.trips
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "trip items are private"
  on public.trip_items
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists places_user_status_idx on public.places (user_id, status);
create index if not exists places_user_city_idx on public.places (user_id, city);
create index if not exists trip_items_trip_day_order_idx on public.trip_items (trip_id, day_index, sort_order);
