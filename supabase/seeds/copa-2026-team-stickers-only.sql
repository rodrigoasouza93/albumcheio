-- seed: copa-2026-team-stickers-only
-- purpose: backfill only team stickers for an already-created 2026 World Cup album

begin;

with team_sections (code, sort_order) as (
  values
    ('MEX', 110),
    ('RSA', 120),
    ('KOR', 130),
    ('CZE', 140),
    ('CAN', 210),
    ('BIH', 220),
    ('QAT', 230),
    ('SUI', 240),
    ('BRA', 310),
    ('MAR', 320),
    ('HAI', 330),
    ('SCO', 340),
    ('USA', 410),
    ('PAR', 420),
    ('AUS', 430),
    ('TUR', 440),
    ('GER', 510),
    ('CUW', 520),
    ('CIV', 530),
    ('ECU', 540),
    ('NED', 610),
    ('JPN', 620),
    ('SWE', 630),
    ('TUN', 640),
    ('BEL', 710),
    ('EGY', 720),
    ('IRN', 730),
    ('NZL', 740),
    ('ESP', 810),
    ('CPV', 820),
    ('KSA', 830),
    ('URU', 840),
    ('FRA', 910),
    ('SEN', 920),
    ('IRQ', 930),
    ('NOR', 940),
    ('ARG', 1010),
    ('ALG', 1020),
    ('AUT', 1030),
    ('JOR', 1040),
    ('POR', 1110),
    ('COD', 1120),
    ('UZB', 1130),
    ('COL', 1140),
    ('ENG', 1210),
    ('CRO', 1220),
    ('GHA', 1230),
    ('PAN', 1240)
),
team_stickers as (
  select
    album_sections.album_id,
    album_sections.id as section_id,
    (album_sections.code || sticker_numbers.number::text) as code,
    sticker_numbers.number,
    (album_sections.code || ' ' || sticker_numbers.number::text) as title,
    (team_sections.sort_order * 100 + sticker_numbers.number) as sort_order
  from team_sections
  join public.album_sections
    on album_sections.album_id = '00000000-0000-4000-8000-000000202600'
    and album_sections.code = team_sections.code
    and album_sections.kind = 'team'
  cross join generate_series(1, 20) as sticker_numbers(number)
)
insert into public.stickers (album_id, section_id, code, number, title, sort_order)
select
  album_id,
  section_id,
  code,
  number,
  title,
  sort_order
from team_stickers
on conflict (album_id, code) do update
set
  section_id = excluded.section_id,
  number = excluded.number,
  title = excluded.title,
  sort_order = excluded.sort_order;

commit;
