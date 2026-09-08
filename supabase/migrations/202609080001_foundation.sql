-- Cook foundation. Apply only to a new, approved Supabase project.
begin;
create extension if not exists pg_trgm with schema extensions;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Home cook' check (char_length(display_name) between 1 and 80),
 country text not null default 'US' check (country ~ '^[A-Z]{2}$'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_preferences (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 diet text not null default 'anything' check (diet in ('anything','vegetarian','vegan')),
 skill text not null default 'beginner' check (skill in ('beginner','comfortable','confident')),
 household integer not null default 2 check (household between 1 and 20),
 minutes integer not null default 30 check (minutes between 5 and 300),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.allergens (id text primary key, name text not null unique);
create table public.user_allergies (
 user_id uuid not null references public.profiles(id) on delete cascade,
 allergen_id text not null references public.allergens(id), primary key(user_id,allergen_id)
);
create table public.ingredients (
 id text primary key, name text not null unique, category text not null,
 allergens_verified boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.ingredient_allergens (
 ingredient_id text not null references public.ingredients(id) on delete cascade,
 allergen_id text not null references public.allergens(id), primary key(ingredient_id,allergen_id)
);
create table public.ingredient_aliases (
 ingredient_id text not null references public.ingredients(id) on delete cascade,
 alias text not null, locale text not null default 'en', primary key(ingredient_id,alias,locale)
);
create table public.products (
 id uuid primary key default gen_random_uuid(), name text not null, brand text not null default '',
 ingredient_id text references public.ingredients(id),
 source text not null check(source in ('openfoodfacts','cook')),
 source_id text not null, source_url text, license text not null,
 country_codes text[] not null default '{}',
 -- Keep source data lineage; no private user records or photos in this public catalog.
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(source,source_id)
);
create table public.product_barcodes (
 barcode text primary key check(barcode ~ '^[0-9]{8,14}$'),
 product_id uuid not null references public.products(id) on delete cascade
);
create table public.private_products (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 name text not null check(char_length(name) between 2 and 100), brand text not null default '',
 barcode text, nutrition_per_100 jsonb, created_at timestamptz not null default now(),
 unique(id,user_id)
);
create table public.pantry_items (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 ingredient_id text references public.ingredients(id), product_id uuid references public.products(id),
 private_product_id uuid,
 quantity numeric(12,3) not null check(quantity >= 0 and quantity <= 100000),
 unit text not null check(unit in ('g','ml','piece')), expires_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(num_nonnulls(ingredient_id,product_id,private_product_id)=1),
 foreign key(private_product_id,user_id) references public.private_products(id,user_id) on delete cascade
);
create table public.recipes (
 id uuid primary key default gen_random_uuid(), author_id uuid references public.profiles(id) on delete cascade,
 source text not null default 'community' check(source in ('cook','community')),
 title text not null check(char_length(title) between 3 and 150), description text not null default '',
 servings integer not null check(servings between 1 and 100), minutes integer not null check(minutes between 1 and 1440),
 status text not null default 'draft' check(status in ('draft','pending','published','rejected')),
 nutrition jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(source='cook' or author_id is not null)
);
create table public.recipe_ingredients (
 id uuid primary key default gen_random_uuid(), recipe_id uuid not null references public.recipes(id) on delete cascade,
 ingredient_id text not null references public.ingredients(id), quantity numeric(12,3) not null check(quantity>0),
 unit text not null check(unit in ('g','ml','piece')), optional boolean not null default false
);
create table public.recipe_steps (
 recipe_id uuid not null references public.recipes(id) on delete cascade,
 position integer not null check(position>0), title text not null, body text not null,
 beginner_tip text, timer_seconds integer check(timer_seconds between 1 and 86400), primary key(recipe_id,position)
);
create table public.recipe_saves (
 user_id uuid not null references public.profiles(id) on delete cascade,
 recipe_id uuid not null references public.recipes(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,recipe_id)
);
create table public.shopping_items (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 ingredient_id text not null references public.ingredients(id), quantity numeric(12,3) not null check(quantity>0),
 unit text not null check(unit in ('g','ml','piece')), checked boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.reports (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 recipe_id uuid not null references public.recipes(id) on delete cascade,
 reason text not null check(char_length(reason) between 10 and 2000), created_at timestamptz not null default now()
);
create table public.scan_sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','review','confirmed','failed')),
 expires_at timestamptz not null default now()+interval '24 hours', created_at timestamptz not null default now()
);
create index pantry_owner on public.pantry_items(user_id,expires_on);
create index private_product_owner on public.private_products(user_id);
create index shopping_owner on public.shopping_items(user_id,checked);
create index reports_owner on public.reports(user_id);
create index scan_owner on public.scan_sessions(user_id);
create index recipe_author on public.recipes(author_id);
create index recipe_published on public.recipes(created_at desc) where status='published';
create index recipe_ingredient_parent on public.recipe_ingredients(recipe_id);
create index product_name_search on public.products using gin ((name || ' ' || brand) extensions.gin_trgm_ops);
create index product_countries on public.products using gin(country_codes);
create index product_barcode_parent on public.product_barcodes(product_id);
create index ingredient_alias_search on public.ingredient_aliases using gin(alias extensions.gin_trgm_ops);
-- Default deny, with explicit policies and privileges below.
do $$ declare t text; begin
 foreach t in array array['profiles','user_preferences','allergens','user_allergies','ingredients','ingredient_allergens','ingredient_aliases','products','product_barcodes','private_products','pantry_items','recipes','recipe_ingredients','recipe_steps','recipe_saves','shopping_items','reports','scan_sessions'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end $$;
create policy own_profile on public.profiles for all to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
grant select,insert,update,delete on public.profiles to authenticated;
do $$ declare t text; begin
 foreach t in array array['user_preferences','user_allergies','private_products','pantry_items','shopping_items'] loop
 execute format('create policy own_rows on public.%I for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()))',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
 foreach t in array array['allergens','ingredients','ingredient_allergens','ingredient_aliases','products','product_barcodes'] loop
 execute format('create policy public_read on public.%I for select to anon,authenticated using(true)',t);
 execute format('grant select on public.%I to anon,authenticated',t);
 end loop;
end $$;
create policy visible_recipes on public.recipes for select to anon,authenticated using(status='published' or author_id=(select auth.uid()));
create policy create_drafts on public.recipes for insert to authenticated with check(author_id=(select auth.uid()) and source='community' and status in ('draft','pending'));
create policy edit_drafts on public.recipes for update to authenticated using(author_id=(select auth.uid()) and status in ('draft','pending','rejected')) with check(author_id=(select auth.uid()) and source='community' and status in ('draft','pending'));
create policy delete_own_recipe on public.recipes for delete to authenticated using(author_id=(select auth.uid()) and source='community');
grant select on public.recipes to anon,authenticated;
grant insert,update,delete on public.recipes to authenticated;
-- Users cannot mark their own recipe as published. A trusted moderation process does that.
do $$ declare t text; begin
 foreach t in array array['recipe_ingredients','recipe_steps'] loop
 execute format('create policy readable_recipe on public.%I for select to anon,authenticated using(exists(select 1 from public.recipes r where r.id=recipe_id))',t);
 execute format('create policy draft_owner on public.%I for all to authenticated using(exists(select 1 from public.recipes r where r.id=recipe_id and r.author_id=(select auth.uid()) and r.status in (''draft'',''pending''))) with check(exists(select 1 from public.recipes r where r.id=recipe_id and r.author_id=(select auth.uid()) and r.status in (''draft'',''pending'')))',t);
 execute format('grant select on public.%I to anon,authenticated',t);
 execute format('grant insert,update,delete on public.%I to authenticated',t);
 end loop;
end $$;
create policy own_saves_read on public.recipe_saves for select to authenticated using(user_id=(select auth.uid()));
create policy own_saves_delete on public.recipe_saves for delete to authenticated using(user_id=(select auth.uid()));
create policy visible_saves_insert on public.recipe_saves for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.recipes r where r.id=recipe_id));
grant select,insert,delete on public.recipe_saves to authenticated;
create policy own_reports on public.reports for select to authenticated using(user_id=(select auth.uid()));
create policy report_visible on public.reports for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.recipes r where r.id=recipe_id and r.status='published'));
grant select,insert on public.reports to authenticated;
create policy own_scans on public.scan_sessions for select to authenticated using(user_id=(select auth.uid()));
grant select on public.scan_sessions to authenticated;
-- Scan creation and state changes are server-only, after quotas/consent checks.
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end $$;
do $$ declare t text; begin
 foreach t in array array['profiles','user_preferences','products','pantry_items','recipes','shopping_items'] loop
 execute format('create trigger touch before update on public.%I for each row execute function public.touch_updated_at()',t);
 end loop;
end $$;
-- Private storage. No public bucket and no public photo policy.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('scan-images','scan-images',false,10485760,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy own_scan_upload on storage.objects for insert to authenticated with check(bucket_id='scan-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy own_scan_read on storage.objects for select to authenticated using(bucket_id='scan-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy own_scan_delete on storage.objects for delete to authenticated using(bucket_id='scan-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
