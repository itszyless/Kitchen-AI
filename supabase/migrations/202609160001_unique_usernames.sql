begin;
create table public.account_usernames (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
 created_at timestamptz not null default now()
);
create unique index account_usernames_case_unique on public.account_usernames(lower(username));
alter table public.account_usernames enable row level security;
revoke all on public.account_usernames from public, anon, authenticated;
grant select on public.account_usernames to authenticated;
create policy own_username on public.account_usernames for select to authenticated using(user_id = (select auth.uid()));

-- Keep valid, unambiguous legacy names. Duplicate legacy names are not silently assigned.
insert into public.account_usernames(user_id,username)
select id, raw_user_meta_data->>'username' from auth.users u
where raw_user_meta_data->>'username' ~ '^[A-Za-z0-9_]{3,20}$'
and (select count(*) from auth.users other where lower(other.raw_user_meta_data->>'username') = lower(u.raw_user_meta_data->>'username')) = 1;

create function public.sync_account_username() returns trigger
language plpgsql security definer set search_path = '' as $$
declare candidate text := new.raw_user_meta_data->>'username';
begin
 if TG_OP = 'UPDATE' and candidate is not distinct from old.raw_user_meta_data->>'username' then return new; end if;
 if candidate is null then
   if exists(select 1 from public.account_usernames where user_id=new.id) then raise exception 'Username cannot be removed'; end if;
   return new;
 end if;
 if candidate !~ '^[A-Za-z0-9_]{3,20}$' then raise exception 'Invalid username'; end if;
 insert into public.account_usernames(user_id,username) values(new.id,candidate)
 on conflict(user_id) do update set username=excluded.username;
 return new;
end $$;
revoke all on function public.sync_account_username() from public, anon, authenticated;
create trigger sync_account_username after insert or update of raw_user_meta_data on auth.users for each row execute function public.sync_account_username();

create function public.username_available(requested text) returns boolean
language sql stable security definer set search_path = '' as $$
 select requested ~ '^[A-Za-z0-9_]{3,20}$' and not exists(select 1 from public.account_usernames where lower(username)=lower(requested))
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon,authenticated;

create function public.claim_username(requested text) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if requested is null or requested !~ '^[A-Za-z0-9_]{3,20}$' then raise exception 'Invalid username'; end if;
 update auth.users set raw_user_meta_data=coalesce(raw_user_meta_data,'{}'::jsonb) || jsonb_build_object('username',requested) where id=auth.uid();
end $$;
revoke all on function public.claim_username(text) from public,anon;
grant execute on function public.claim_username(text) to authenticated;

-- Email resolution is server-only; never expose an email lookup to anonymous clients.
create function public.username_login_email(requested text) returns text
language sql stable security definer set search_path = '' as $$
 select u.email from public.account_usernames n join auth.users u on u.id=n.user_id where lower(n.username)=lower(requested)
$$;
revoke all on function public.username_login_email(text) from public,anon,authenticated;
grant execute on function public.username_login_email(text) to service_role;

create table public.username_login_limits (
 bucket text primary key, window_start timestamptz not null, attempts integer not null
);
alter table public.username_login_limits enable row level security;
revoke all on public.username_login_limits from public,anon,authenticated;
create function public.reserve_username_login(bucket_key text, maximum integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare total integer;
begin
 delete from public.username_login_limits where window_start < now()-interval '1 day';
 insert into public.username_login_limits values(bucket_key,now(),1)
 on conflict(bucket) do update set
 attempts=case when username_login_limits.window_start < now()-interval '15 minutes' then 1 else username_login_limits.attempts+1 end,
 window_start=case when username_login_limits.window_start < now()-interval '15 minutes' then now() else username_login_limits.window_start end
 returning attempts into total;
 return total <= maximum;
end $$;
revoke all on function public.reserve_username_login(text,integer) from public,anon,authenticated;
grant execute on function public.reserve_username_login(text,integer) to service_role;
commit;
