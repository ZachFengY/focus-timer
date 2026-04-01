-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- For text search

-- ─── Subjects ─────────────────────────────────────────────────────────────────
create table if not exists subjects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 50),
  color       text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon        text,
  is_deleted  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index subjects_user_id_idx on subjects(user_id) where not is_deleted;

-- ─── Time Records ─────────────────────────────────────────────────────────────
create table if not exists time_records (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references subjects(id) on delete set null,
  mode        text not null check (mode in ('countup', 'countdown')),
  duration    integer not null check (duration >= 0), -- seconds
  start_time  timestamptz not null,
  end_time    timestamptz,
  created_at  timestamptz not null default now()
);

create index time_records_user_id_idx on time_records(user_id);
create index time_records_start_time_idx on time_records(user_id, start_time desc);
create index time_records_subject_idx on time_records(subject_id) where subject_id is not null;

-- ─── Pause Records ────────────────────────────────────────────────────────────
create table if not exists pause_records (
  id             uuid primary key default uuid_generate_v4(),
  time_record_id uuid not null references time_records(id) on delete cascade,
  start_time     timestamptz not null,
  end_time       timestamptz
);

create index pause_records_time_record_idx on pause_records(time_record_id);

-- ─── Goals ────────────────────────────────────────────────────────────────────
create table if not exists goals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            text not null check (type in ('daily', 'weekly', 'monthly', 'subject')),
  target_duration integer not null check (target_duration > 0), -- seconds
  subject_id      uuid references subjects(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index goals_user_id_idx on goals(user_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subjects_updated_at before update on subjects
  for each row execute procedure update_updated_at();

create trigger goals_updated_at before update on goals
  for each row execute procedure update_updated_at();
