begin;
create table public.ai_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  calls integer not null default 0 check (calls >= 0),
  primary key(user_id,day)
);
alter table public.ai_daily_usage enable row level security;
revoke all on public.ai_daily_usage from anon,authenticated;
create function public.reserve_ai_call() returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if auth.uid() is null then return false; end if;
 -- Serialize the global allowance as well as per-account limits.
 perform pg_advisory_xact_lock(90810910);
 if (select coalesce(sum(calls),0) from public.ai_daily_usage where day=current_date) >= 100 then return false; end if;
 insert into public.ai_daily_usage(user_id,day,calls) values(auth.uid(),current_date,1)
 on conflict(user_id,day) do update set calls=public.ai_daily_usage.calls+1 where public.ai_daily_usage.calls<10 returning calls into n;
 return n is not null;
end $$;
revoke all on function public.reserve_ai_call() from public,anon;
grant execute on function public.reserve_ai_call() to authenticated;
commit;
