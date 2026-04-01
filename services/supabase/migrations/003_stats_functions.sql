-- ─── Stats: get_user_stats ────────────────────────────────────────────────────
-- Returns summary + by-subject + by-day for a date range.
-- Called from StatsService to avoid N+1 queries.

create or replace function get_user_stats(
  p_user_id   uuid,
  p_start_date date,
  p_end_date   date
)
returns json language plpgsql security definer as $$
declare
  v_total_duration  bigint;
  v_record_count    bigint;
  v_streak          int;
  v_longest_streak  int;
  v_by_subject      json;
  v_by_day          json;
begin
  -- Total duration & count
  select
    coalesce(sum(duration), 0),
    count(*)
  into v_total_duration, v_record_count
  from time_records
  where user_id = p_user_id
    and start_time::date between p_start_date and p_end_date;

  -- Streak calculation
  with daily_activity as (
    select distinct start_time::date as activity_date
    from time_records
    where user_id = p_user_id
    order by 1 desc
  ),
  gaps as (
    select
      activity_date,
      activity_date - (row_number() over (order by activity_date desc))::int as grp
    from daily_activity
  ),
  streaks as (
    select count(*) as streak_len
    from gaps
    group by grp
    order by min(activity_date) desc
  )
  select
    (select streak_len from streaks limit 1),
    (select max(streak_len) from streaks)
  into v_streak, v_longest_streak;

  -- By subject
  select json_agg(row_to_json(s)) into v_by_subject
  from (
    select
      tr.subject_id,
      coalesce(sub.name, '未分类') as subject_name,
      coalesce(sub.color, '#8E8E93') as subject_color,
      sum(tr.duration)::int as duration,
      count(*)::int as record_count,
      round(sum(tr.duration)::numeric / nullif(v_total_duration, 0) * 100, 1) as percentage
    from time_records tr
    left join subjects sub on sub.id = tr.subject_id
    where tr.user_id = p_user_id
      and tr.start_time::date between p_start_date and p_end_date
    group by tr.subject_id, sub.name, sub.color
    order by duration desc
  ) s;

  -- By day
  select json_agg(row_to_json(d)) into v_by_day
  from (
    select
      start_time::date::text as date,
      sum(duration)::int as duration,
      count(*)::int as record_count
    from time_records
    where user_id = p_user_id
      and start_time::date between p_start_date and p_end_date
    group by start_time::date
    order by date
  ) d;

  return json_build_object(
    'range', 'custom',
    'startDate', p_start_date::text,
    'endDate', p_end_date::text,
    'summary', json_build_object(
      'totalDuration', v_total_duration,
      'avgDailyDuration', case
        when p_end_date - p_start_date + 1 > 0
        then v_total_duration / (p_end_date - p_start_date + 1)
        else 0
      end,
      'maxDailyDuration', coalesce((
        select max(d) from (
          select sum(duration) as d from time_records
          where user_id = p_user_id and start_time::date between p_start_date and p_end_date
          group by start_time::date
        ) t
      ), 0),
      'streak', coalesce(v_streak, 0),
      'longestStreak', coalesce(v_longest_streak, 0),
      'recordCount', v_record_count
    ),
    'bySubject', coalesce(v_by_subject, '[]'::json),
    'byDay', coalesce(v_by_day, '[]'::json)
  );
end;
$$;

-- ─── Stats: get_calendar_data ─────────────────────────────────────────────────
create or replace function get_calendar_data(
  p_user_id    uuid,
  p_start_date date,
  p_end_date   date
)
returns json language plpgsql security definer as $$
begin
  return (
    select json_agg(row_to_json(day_data))
    from (
      select
        d::text as date,
        coalesce(sum(tr.duration), 0)::int as total_duration,
        count(tr.id) > 0 as has_records
      from generate_series(p_start_date, p_end_date, '1 day'::interval) d
      left join time_records tr
        on tr.user_id = p_user_id
        and tr.start_time::date = d::date
      group by d
      order by d
    ) day_data
  );
end;
$$;

-- ─── Goals: get_goals_with_progress ──────────────────────────────────────────
create or replace function get_goals_with_progress(p_user_id uuid)
returns json language plpgsql security definer as $$
begin
  return (
    select json_agg(row_to_json(g))
    from (
      select
        goals.*,
        coalesce(sub.name, null) as subject_name,
        coalesce(sub.color, null) as subject_color,
        coalesce(actual.duration, 0)::int as actual_duration,
        round(coalesce(actual.duration, 0)::numeric / goals.target_duration, 4) as progress,
        coalesce(actual.duration, 0) >= goals.target_duration as is_completed
      from goals
      left join subjects sub on sub.id = goals.subject_id
      left join lateral (
        select sum(duration) as duration
        from time_records tr
        where tr.user_id = goals.user_id
          and (goals.subject_id is null or tr.subject_id = goals.subject_id)
          and tr.start_time >= case goals.type
            when 'daily'   then date_trunc('day', now())
            when 'weekly'  then date_trunc('week', now())
            when 'monthly' then date_trunc('month', now())
            else '1970-01-01'::timestamptz
          end
      ) actual on true
      where goals.user_id = p_user_id
      order by goals.created_at
    ) g
  );
end;
$$;
