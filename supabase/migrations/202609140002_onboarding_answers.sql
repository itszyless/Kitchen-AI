create table public.onboarding_answers (
user_id uuid primary key references auth.users(id) on delete cascade,
answers jsonb not null check (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 20000),
created_at timestamptz not null default now()
);
alter table public.onboarding_answers enable row level security;
revoke all on public.onboarding_answers from anon, authenticated;
grant select, insert on public.onboarding_answers to authenticated;
create policy "Read own onboarding answers" on public.onboarding_answers for select to authenticated using ((select auth.uid()) = user_id);
create policy "Save own onboarding answers" on public.onboarding_answers for insert to authenticated with check ((select auth.uid()) = user_id);
