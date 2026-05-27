-- migration: prevent_catalog_rls_recursion
-- purpose: keep catalog read rules while avoiding recursive RLS policy checks
-- affected tables: albums, album_sections, stickers

create or replace function public.can_read_catalog_album(
  target_album_id uuid,
  target_album_status text default null
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    (select auth.uid()) is not null
    and (
      public.is_admin()
      or coalesce(
        target_album_status,
        (
          select albums.status
          from public.albums
          where albums.id = target_album_id
        )
      ) = 'published'
      or exists (
        select 1
        from public.collection_items
        join public.stickers on stickers.id = collection_items.sticker_id
        where collection_items.user_id = (select auth.uid())
          and stickers.album_id = target_album_id
      )
    );
$$;

revoke all on function public.can_read_catalog_album(uuid, text) from public;
revoke all on function public.can_read_catalog_album(uuid, text) from anon;
grant execute on function public.can_read_catalog_album(uuid, text) to authenticated;

drop policy if exists albums_select_authenticated on public.albums;
drop policy if exists album_sections_select_authenticated on public.album_sections;
drop policy if exists stickers_select_authenticated on public.stickers;

create policy albums_select_authenticated
  on public.albums for select
  to authenticated
  using (public.can_read_catalog_album(albums.id, albums.status));

create policy album_sections_select_authenticated
  on public.album_sections for select
  to authenticated
  using (public.can_read_catalog_album(album_sections.album_id));

create policy stickers_select_authenticated
  on public.stickers for select
  to authenticated
  using (public.can_read_catalog_album(stickers.album_id));
