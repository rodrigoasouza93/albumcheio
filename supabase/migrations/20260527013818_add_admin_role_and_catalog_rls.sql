-- migration: add_admin_role_and_catalog_rls
-- purpose: add protected profile roles and restrict catalog mutations to admins
-- affected tables: profiles, albums, album_sections, stickers

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_valid;

alter table public.profiles
  add constraint profiles_role_valid check (role in ('user', 'admin'));

create index if not exists profiles_role_idx
  on public.profiles (id, role);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.prevent_profile_role_self_change()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only administrators can change profile roles'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_self_change on public.profiles;

create trigger profiles_prevent_role_self_change
before update on public.profiles
for each row execute function public.prevent_profile_role_self_change();

drop policy if exists albums_select_authenticated on public.albums;
drop policy if exists albums_insert_authenticated on public.albums;
drop policy if exists albums_update_authenticated on public.albums;
drop policy if exists albums_delete_authenticated on public.albums;

create policy albums_select_authenticated
  on public.albums for select
  to authenticated
  using (
    public.is_admin()
    or status = 'published'
    or exists (
      select 1
      from public.collection_items
      join public.stickers on stickers.id = collection_items.sticker_id
      where collection_items.user_id = (select auth.uid())
        and stickers.album_id = albums.id
    )
  );

create policy albums_insert_admin
  on public.albums for insert
  to authenticated
  with check (public.is_admin());

create policy albums_update_admin
  on public.albums for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy albums_delete_admin
  on public.albums for delete
  to authenticated
  using (public.is_admin());

drop policy if exists album_sections_select_authenticated on public.album_sections;
drop policy if exists album_sections_insert_authenticated on public.album_sections;
drop policy if exists album_sections_update_authenticated on public.album_sections;
drop policy if exists album_sections_delete_authenticated on public.album_sections;

create policy album_sections_select_authenticated
  on public.album_sections for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.albums
      where albums.id = album_sections.album_id
        and albums.status = 'published'
    )
    or exists (
      select 1
      from public.collection_items
      join public.stickers on stickers.id = collection_items.sticker_id
      where collection_items.user_id = (select auth.uid())
        and stickers.album_id = album_sections.album_id
    )
  );

create policy album_sections_insert_admin
  on public.album_sections for insert
  to authenticated
  with check (public.is_admin());

create policy album_sections_update_admin
  on public.album_sections for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy album_sections_delete_admin
  on public.album_sections for delete
  to authenticated
  using (public.is_admin());

drop policy if exists stickers_select_authenticated on public.stickers;
drop policy if exists stickers_insert_authenticated on public.stickers;
drop policy if exists stickers_update_authenticated on public.stickers;
drop policy if exists stickers_delete_authenticated on public.stickers;

create policy stickers_select_authenticated
  on public.stickers for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.albums
      where albums.id = stickers.album_id
        and albums.status = 'published'
    )
    or exists (
      select 1
      from public.collection_items
      where collection_items.user_id = (select auth.uid())
        and collection_items.sticker_id = stickers.id
    )
  );

create policy stickers_insert_admin
  on public.stickers for insert
  to authenticated
  with check (public.is_admin());

create policy stickers_update_admin
  on public.stickers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy stickers_delete_admin
  on public.stickers for delete
  to authenticated
  using (public.is_admin());
