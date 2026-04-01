-- ─── Row Level Security ────────────────────────────────────────────────────────
-- Users can only read/write their own data. Period.

alter table subjects enable row level security;
alter table time_records enable row level security;
alter table pause_records enable row level security;
alter table goals enable row level security;

-- Subjects
create policy "subjects: users own their data" on subjects
  for all using (auth.uid() = user_id);

-- Time Records
create policy "time_records: users own their data" on time_records
  for all using (auth.uid() = user_id);

-- Pause Records (access via parent time_record)
create policy "pause_records: access via time_record" on pause_records
  for all using (
    exists (
      select 1 from time_records tr
      where tr.id = pause_records.time_record_id
        and tr.user_id = auth.uid()
    )
  );

-- Goals
create policy "goals: users own their data" on goals
  for all using (auth.uid() = user_id);
