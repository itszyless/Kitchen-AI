create table public.acquisition_responses (
 user_id uuid primary key references auth.users(id) on delete cascade,
 source text not null check (source in ('App Store','Google Play','TikTok','YouTube','TV','X','Instagram','Google','Facebook','Friends or family','Others')),
 created_at timestamptz not null default now()
);
alter table public.acquisition_responses enable row level security;
revoke all on public.acquisition_responses from anon, authenticated;
grant insert (user_id, source), select on public.acquisition_responses to authenticated;
create policy "Insert own acquisition response" on public.acquisition_responses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Read own acquisition response" on public.acquisition_responses for select to authenticated using ((select auth.uid()) = user_id);
create index acquisition_responses_created_at_idx on public.acquisition_responses(created_at);
