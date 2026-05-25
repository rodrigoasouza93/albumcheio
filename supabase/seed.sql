insert into public.albums (id, name, edition, description, status)
values (
  '00000000-0000-4000-8000-000000000001',
  'World Football Sample',
  '2026 Test Edition',
  'Minimal shared catalog used for local development and integration tests.',
  'published'
)
on conflict (id) do update
set
  name = excluded.name,
  edition = excluded.edition,
  description = excluded.description,
  status = excluded.status;

insert into public.album_sections (id, album_id, name, code, kind, sort_order)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    'Opening',
    'OPEN',
    'tournament',
    10
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    'Brazil',
    'BRA',
    'team',
    20
  )
on conflict (id) do update
set
  name = excluded.name,
  code = excluded.code,
  kind = excluded.kind,
  sort_order = excluded.sort_order;

insert into public.stickers (id, album_id, section_id, code, number, title, sort_order)
values
  (
    '00000000-0000-4000-8000-000000001001',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'FWC01',
    1,
    'Tournament Emblem',
    10
  ),
  (
    '00000000-0000-4000-8000-000000001002',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000102',
    'BRA01',
    1,
    'Brazil Badge',
    20
  ),
  (
    '00000000-0000-4000-8000-000000001003',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000102',
    'BRA02',
    2,
    'Brazil Player Sample',
    30
  )
on conflict (id) do update
set
  code = excluded.code,
  number = excluded.number,
  title = excluded.title,
  sort_order = excluded.sort_order;
