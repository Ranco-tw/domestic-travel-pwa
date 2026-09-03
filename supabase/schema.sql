create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_group_members (
  group_id uuid not null references public.travel_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.travel_groups(id) on delete cascade,
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
  group_id uuid references public.travel_groups(id) on delete cascade,
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
  group_id uuid references public.travel_groups(id) on delete cascade,
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

alter table public.places add column if not exists group_id uuid references public.travel_groups(id) on delete cascade;
alter table public.trips add column if not exists group_id uuid references public.travel_groups(id) on delete cascade;
alter table public.trip_items add column if not exists group_id uuid references public.travel_groups(id) on delete cascade;

insert into public.travel_groups (id, name)
values ('00000000-0000-4000-8000-000000000001', '我們的旅程')
on conflict (id) do update set name = excluded.name;

insert into public.travel_group_members (group_id, user_id, role)
select '00000000-0000-4000-8000-000000000001', id, 'owner'
from auth.users
where email in ('liuweihong@example.com', 'linyouyu@example.com')
on conflict (group_id, user_id) do update set role = excluded.role;

update public.places
set group_id = '00000000-0000-4000-8000-000000000001'
where group_id is null
  and user_id in (select user_id from public.travel_group_members where group_id = '00000000-0000-4000-8000-000000000001');

update public.trips
set group_id = '00000000-0000-4000-8000-000000000001'
where group_id is null
  and user_id in (select user_id from public.travel_group_members where group_id = '00000000-0000-4000-8000-000000000001');

update public.trip_items
set group_id = '00000000-0000-4000-8000-000000000001'
where group_id is null
  and user_id in (select user_id from public.travel_group_members where group_id = '00000000-0000-4000-8000-000000000001');

alter table public.profiles enable row level security;
alter table public.travel_groups enable row level security;
alter table public.travel_group_members enable row level security;
alter table public.places enable row level security;
alter table public.place_reviews enable row level security;
alter table public.trips enable row level security;
alter table public.trip_items enable row level security;

drop policy if exists "profiles are private" on public.profiles;
drop policy if exists "travel groups are visible to members" on public.travel_groups;
drop policy if exists "travel group memberships are private" on public.travel_group_members;
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

create policy "travel groups are visible to members"
  on public.travel_groups
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.travel_group_members members
      where members.group_id = travel_groups.id
        and members.user_id = (select auth.uid())
    )
  );

create policy "travel group memberships are private"
  on public.travel_group_members
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "places are private"
  on public.places
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.travel_group_members members
      where members.group_id = places.group_id
        and members.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.travel_group_members members
      where members.group_id = places.group_id
        and members.user_id = (select auth.uid())
    )
  );

create policy "reviews are private"
  on public.place_reviews
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.places
      join public.travel_group_members members on members.group_id = places.group_id
      where places.id = place_reviews.place_id
        and members.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.places
      join public.travel_group_members members on members.group_id = places.group_id
      where places.id = place_reviews.place_id
        and members.user_id = (select auth.uid())
    )
  );

create policy "trips are private"
  on public.trips
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.travel_group_members members
      where members.group_id = trips.group_id
        and members.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.travel_group_members members
      where members.group_id = trips.group_id
        and members.user_id = (select auth.uid())
    )
  );

create policy "trip items are private"
  on public.trip_items
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.travel_group_members members
      where members.group_id = trip_items.group_id
        and members.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.travel_group_members members
      where members.group_id = trip_items.group_id
        and members.user_id = (select auth.uid())
    )
  );

grant usage on schema public to authenticated;
grant select on public.travel_groups, public.travel_group_members to authenticated;
grant select, insert, update, delete on public.profiles, public.places, public.place_reviews, public.trips, public.trip_items to authenticated;

create index if not exists places_user_status_idx on public.places (user_id, status);
create index if not exists places_user_city_idx on public.places (user_id, city);
create index if not exists places_group_status_idx on public.places (group_id, status);
create index if not exists places_group_city_idx on public.places (group_id, city);
create index if not exists trips_group_idx on public.trips (group_id);
create index if not exists trip_items_group_trip_day_order_idx on public.trip_items (group_id, trip_id, day_index, sort_order);
create index if not exists trip_items_trip_day_order_idx on public.trip_items (trip_id, day_index, sort_order);
