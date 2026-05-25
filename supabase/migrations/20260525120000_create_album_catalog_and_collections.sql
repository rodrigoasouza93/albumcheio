-- migration: create_album_catalog_and_collections
-- purpose: create shared album catalog and private user collections with RLS
-- affected tables: profiles, albums, album_sections, stickers, collection_items

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_not_blank check (length(btrim(name)) > 0)
);

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  edition text,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint albums_name_not_blank check (length(btrim(name)) > 0),
  constraint albums_edition_not_blank check (edition is null or length(btrim(edition)) > 0),
  constraint albums_status_valid check (status in ('draft', 'published', 'archived'))
);

create table public.album_sections (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  name text not null,
  code text not null,
  kind text not null default 'custom',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint album_sections_name_not_blank check (length(btrim(name)) > 0),
  constraint album_sections_code_normalized check (code = upper(btrim(code)) and length(code) > 0),
  constraint album_sections_kind_valid check (kind in ('tournament', 'team', 'custom')),
  constraint album_sections_sort_order_non_negative check (sort_order >= 0),
  constraint album_sections_album_id_id_unique unique (album_id, id),
  constraint album_sections_album_code_unique unique (album_id, code)
);

create table public.stickers (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  section_id uuid not null references public.album_sections(id) on delete cascade,
  code text not null,
  number integer,
  title text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stickers_code_normalized check (code = upper(btrim(code)) and length(code) > 0),
  constraint stickers_number_positive check (number is null or number > 0),
  constraint stickers_title_not_blank check (title is null or length(btrim(title)) > 0),
  constraint stickers_sort_order_non_negative check (sort_order >= 0),
  constraint stickers_album_code_unique unique (album_id, code),
  constraint stickers_section_belongs_to_album foreign key (album_id, section_id)
    references public.album_sections(album_id, id)
    on delete cascade
);

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  quantity_total integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collection_items_quantity_total_non_negative check (quantity_total >= 0),
  constraint collection_items_user_sticker_unique unique (user_id, sticker_id)
);

create index albums_status_idx on public.albums (status);
create index albums_created_by_idx on public.albums (created_by);

create index album_sections_album_sort_idx on public.album_sections (album_id, sort_order, id);
create index album_sections_album_kind_idx on public.album_sections (album_id, kind);

create index stickers_album_section_sort_idx on public.stickers (album_id, section_id, sort_order, id);
create index stickers_album_sort_idx on public.stickers (album_id, sort_order, id);
create index stickers_section_id_idx on public.stickers (section_id);

create index collection_items_user_quantity_idx
  on public.collection_items (user_id, quantity_total, sticker_id);
create index collection_items_user_owned_idx
  on public.collection_items (user_id, sticker_id)
  where quantity_total > 0;
create index collection_items_user_duplicates_idx
  on public.collection_items (user_id, quantity_total, sticker_id)
  where quantity_total > 1;
create index collection_items_sticker_id_idx on public.collection_items (sticker_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger albums_set_updated_at
before update on public.albums
for each row execute function public.set_updated_at();

create trigger album_sections_set_updated_at
before update on public.album_sections
for each row execute function public.set_updated_at();

create trigger stickers_set_updated_at
before update on public.stickers
for each row execute function public.set_updated_at();

create trigger collection_items_set_updated_at
before update on public.collection_items
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.album_sections enable row level security;
alter table public.stickers enable row level security;
alter table public.collection_items enable row level security;

create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy profiles_delete_own
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

create policy albums_select_authenticated
  on public.albums for select
  to authenticated
  using (true);

create policy albums_insert_authenticated
  on public.albums for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

create policy albums_update_authenticated
  on public.albums for update
  to authenticated
  using (true)
  with check (true);

create policy albums_delete_authenticated
  on public.albums for delete
  to authenticated
  using (true);

create policy album_sections_select_authenticated
  on public.album_sections for select
  to authenticated
  using (true);

create policy album_sections_insert_authenticated
  on public.album_sections for insert
  to authenticated
  with check (true);

create policy album_sections_update_authenticated
  on public.album_sections for update
  to authenticated
  using (true)
  with check (true);

create policy album_sections_delete_authenticated
  on public.album_sections for delete
  to authenticated
  using (true);

create policy stickers_select_authenticated
  on public.stickers for select
  to authenticated
  using (true);

create policy stickers_insert_authenticated
  on public.stickers for insert
  to authenticated
  with check (true);

create policy stickers_update_authenticated
  on public.stickers for update
  to authenticated
  using (true)
  with check (true);

create policy stickers_delete_authenticated
  on public.stickers for delete
  to authenticated
  using (true);

create policy collection_items_select_own
  on public.collection_items for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy collection_items_insert_own
  on public.collection_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy collection_items_update_own
  on public.collection_items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy collection_items_delete_own
  on public.collection_items for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.albums,
  public.album_sections,
  public.stickers,
  public.collection_items
to authenticated;
