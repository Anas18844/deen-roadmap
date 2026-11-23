begin;
select plan(10);

-- compute_points: video = 1 point per started 10 minutes, min 1; book = 1 per started 20 pages, default 5.
select is(public.compute_points('video', 600, null), 1, 'video 10 min = 1 point');
select is(public.compute_points('video', 601, null), 2, 'video just over 10 min = 2 points');
select is(public.compute_points('video', 3600, null), 6, 'video 60 min = 6 points');
select is(public.compute_points('video', null, null), 1, 'video without duration = 1 point');
select is(public.compute_points('book', null, 100), 5, 'book 100 pages = 5 points');
select is(public.compute_points('book', null, 21), 2, 'book 21 pages = 2 points');
select is(public.compute_points('book', null, null), 5, 'book without pages = 5 points');

-- trigger sets points automatically, and respects manual overrides
select tests.make_level(1, 1);
insert into public.items (section_id, kind, title, url, duration_seconds)
select s.id, 'video', 'محاضرة طويلة', 'https://youtu.be/long', 1800
from public.sections s join public.tracks t on t.id = s.track_id join public.levels l on l.id = t.level_id
where l.number = 1;

select is((select points from public.items where url = 'https://youtu.be/long'), 3, 'insert computes points from duration');

update public.items set points = 10, points_is_manual = true where url = 'https://youtu.be/long';
update public.items set duration_seconds = 60 where url = 'https://youtu.be/long';
select is((select points from public.items where url = 'https://youtu.be/long'), 10, 'manual points survive duration change');

select is(public.item_level_number((select id from public.items where url = 'https://youtu.be/long')), 1,
          'item_level_number walks up to the level');

select * from finish();
rollback;
