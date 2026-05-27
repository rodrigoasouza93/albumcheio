-- seed: copa-2026-album
-- purpose: populate the shared catalog with the 2026 World Cup sticker album
-- source: checklist and sticker PDFs provided in May 2026

begin;

insert into public.albums (id, name, edition, description, status)
values (
  '00000000-0000-4000-8000-000000202600',
  'Figurinhas da Copa 2026',
  'World Cup 2026',
  'Catálogo base da Copa 2026 com seleções, FIFA World Cup History e figurinhas Coca-Cola.',
  'published'
)
on conflict (id) do update
set
  name = excluded.name,
  edition = excluded.edition,
  description = excluded.description,
  status = excluded.status;

with team_sections (group_code, name, code, sort_order) as (
  values
    ('A', 'México', 'MEX', 110),
    ('A', 'África do Sul', 'RSA', 120),
    ('A', 'Coreia do Sul', 'KOR', 130),
    ('A', 'Rep. Tcheca', 'CZE', 140),
    ('B', 'Canadá', 'CAN', 210),
    ('B', 'Bósnia', 'BIH', 220),
    ('B', 'Catar', 'QAT', 230),
    ('B', 'Suíça', 'SUI', 240),
    ('C', 'Brasil', 'BRA', 310),
    ('C', 'Marrocos', 'MAR', 320),
    ('C', 'Haiti', 'HAI', 330),
    ('C', 'Escócia', 'SCO', 340),
    ('D', 'Estados Unidos', 'USA', 410),
    ('D', 'Paraguai', 'PAR', 420),
    ('D', 'Australia', 'AUS', 430),
    ('D', 'Turquia', 'TUR', 440),
    ('E', 'Alemanha', 'GER', 510),
    ('E', 'Curaçao', 'CUW', 520),
    ('E', 'Costa do Marfim', 'CIV', 530),
    ('E', 'Equador', 'ECU', 540),
    ('F', 'Holanda', 'NED', 610),
    ('F', 'Japão', 'JPN', 620),
    ('F', 'Suécia', 'SWE', 630),
    ('F', 'Tunísia', 'TUN', 640),
    ('G', 'Bélgica', 'BEL', 710),
    ('G', 'Egito', 'EGY', 720),
    ('G', 'Irã', 'IRN', 730),
    ('G', 'Nova Zelandia', 'NZL', 740),
    ('H', 'Espanha', 'ESP', 810),
    ('H', 'Cabo Verde', 'CPV', 820),
    ('H', 'Arábia Saudita', 'KSA', 830),
    ('H', 'Uruguai', 'URU', 840),
    ('I', 'França', 'FRA', 910),
    ('I', 'Senegal', 'SEN', 920),
    ('I', 'Iraque', 'IRQ', 930),
    ('I', 'Noruega', 'NOR', 940),
    ('J', 'Argentina', 'ARG', 1010),
    ('J', 'Argélia', 'ALG', 1020),
    ('J', 'Áustria', 'AUT', 1030),
    ('J', 'Jordânia', 'JOR', 1040),
    ('K', 'Portugal', 'POR', 1110),
    ('K', 'Congo', 'COD', 1120),
    ('K', 'Uzbequistão', 'UZB', 1130),
    ('K', 'Colômbia', 'COL', 1140),
    ('L', 'Inglaterra', 'ENG', 1210),
    ('L', 'Croácia', 'CRO', 1220),
    ('L', 'Gana', 'GHA', 1230),
    ('L', 'Panama', 'PAN', 1240)
),
all_sections (name, code, kind, sort_order) as (
  values
    ('FIFA World Cup History', 'FWC', 'tournament', 10),
    ('Figurinhas da Coca-Cola', 'CC', 'custom', 1300)
  union all
  select
    team_sections.name,
    team_sections.code,
    'team',
    team_sections.sort_order
  from team_sections
),
upserted_sections as (
  insert into public.album_sections (album_id, name, code, kind, sort_order)
  select
    '00000000-0000-4000-8000-000000202600',
    all_sections.name,
    all_sections.code,
    all_sections.kind,
    all_sections.sort_order
  from all_sections
  on conflict (album_id, code) do update
  set
    name = excluded.name,
    kind = excluded.kind,
    sort_order = excluded.sort_order
  returning id, album_id, code, kind, sort_order
),
existing_sections as (
  select id, album_id, code, kind, sort_order
  from public.album_sections
  where album_id = '00000000-0000-4000-8000-000000202600'
),
sections as (
  select * from upserted_sections
  union
  select * from existing_sections
),
team_stickers as (
  select
    sections.album_id,
    sections.id as section_id,
    (sections.code || sticker_numbers.number::text) as code,
    sticker_numbers.number,
    (sections.code || ' ' || sticker_numbers.number::text) as title,
    (sections.sort_order * 100 + sticker_numbers.number) as sort_order
  from sections
  cross join generate_series(1, 20) as sticker_numbers(number)
  where sections.kind = 'team'
),
tournament_stickers as (
  select
    sections.album_id,
    sections.id as section_id,
    ('FWC' || lpad(sticker_numbers.number::text, 2, '0')) as code,
    sticker_numbers.number + 1 as number,
    ('FIFA World Cup History ' || lpad(sticker_numbers.number::text, 2, '0')) as title,
    (1000 + sticker_numbers.number) as sort_order
  from sections
  cross join generate_series(0, 19) as sticker_numbers(number)
  where sections.code = 'FWC'
),
coca_cola_stickers as (
  select
    sections.album_id,
    sections.id as section_id,
    ('CC' || sticker_numbers.number::text) as code,
    sticker_numbers.number,
    ('Coca-Cola ' || sticker_numbers.number::text) as title,
    (130000 + sticker_numbers.number) as sort_order
  from sections
  cross join generate_series(1, 14) as sticker_numbers(number)
  where sections.code = 'CC'
),
all_stickers as (
  select * from tournament_stickers
  union all
  select * from team_stickers
  union all
  select * from coca_cola_stickers
)
insert into public.stickers (album_id, section_id, code, number, title, sort_order)
select
  album_id,
  section_id,
  code,
  number,
  title,
  sort_order
from all_stickers
on conflict (album_id, code) do update
set
  section_id = excluded.section_id,
  number = excluded.number,
  title = excluded.title,
  sort_order = excluded.sort_order;

commit;
