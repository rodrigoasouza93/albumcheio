-- migration: tighten_catalog_rls_and_function_search_path
-- purpose: make shared catalog policies explicit and pin trigger function search_path
-- affected tables: albums, album_sections, stickers

alter function public.set_updated_at() set search_path = public, pg_temp;

drop policy if exists albums_update_authenticated on public.albums;
drop policy if exists albums_delete_authenticated on public.albums;

create policy albums_update_authenticated
  on public.albums for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy albums_delete_authenticated
  on public.albums for delete
  to authenticated
  using ((select auth.uid()) is not null);

drop policy if exists album_sections_insert_authenticated on public.album_sections;
drop policy if exists album_sections_update_authenticated on public.album_sections;
drop policy if exists album_sections_delete_authenticated on public.album_sections;

create policy album_sections_insert_authenticated
  on public.album_sections for insert
  to authenticated
  with check ((select auth.uid()) is not null);

create policy album_sections_update_authenticated
  on public.album_sections for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy album_sections_delete_authenticated
  on public.album_sections for delete
  to authenticated
  using ((select auth.uid()) is not null);

drop policy if exists stickers_insert_authenticated on public.stickers;
drop policy if exists stickers_update_authenticated on public.stickers;
drop policy if exists stickers_delete_authenticated on public.stickers;

create policy stickers_insert_authenticated
  on public.stickers for insert
  to authenticated
  with check ((select auth.uid()) is not null);

create policy stickers_update_authenticated
  on public.stickers for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy stickers_delete_authenticated
  on public.stickers for delete
  to authenticated
  using ((select auth.uid()) is not null);
