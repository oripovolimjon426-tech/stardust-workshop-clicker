-- Global leaderboard schema for Stardust Workshop.
create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 18),
  score bigint not null check (score between 0 and 1000000000000000),
  level integer not null default 1 check (level between 1 and 999),
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_score_idx
  on public.leaderboard (score desc, created_at asc);

alter table public.leaderboard enable row level security;

create policy "Anyone can read leaderboard"
  on public.leaderboard for select using (true);

create policy "Anyone can submit leaderboard score"
  on public.leaderboard for insert
  with check (
    char_length(player_name) between 1 and 18
    and score between 0 and 1000000000000000
    and level between 1 and 999
  );

grant select, insert on public.leaderboard to anon, authenticated;
