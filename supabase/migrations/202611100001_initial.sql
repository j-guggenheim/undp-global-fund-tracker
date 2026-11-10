begin;
-- Organization records and uploaded evidence are scoped to the authenticated account.
create table if not exists public.accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{"profile":{},"progress":{}}',
 updated_at timestamptz not null default now()
);
create table if not exists public.evidence (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 method text not null,
 name text not null,
 size integer not null check (size > 0 and size <= 10485760),
 created_at timestamptz not null default now()
);
create index if not exists evidence_user_id on public.evidence(user_id);
alter table public.accounts enable row level security;
alter table public.evidence enable row level security;
grant select,insert,update,delete on public.accounts,public.evidence to authenticated;
revoke all on public.accounts,public.evidence from anon;
drop policy if exists "Account owners manage their own record" on public.accounts;
create policy "Account owners manage their own record" on public.accounts for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "Account owners manage their own evidence" on public.evidence;
create policy "Account owners manage their own evidence" on public.evidence for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create or replace function public.initialize_partner_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.accounts(user_id,data) values(new.id,jsonb_build_object('profile',coalesce(new.raw_user_meta_data->'profile','{}'::jsonb),'progress','{}'::jsonb));
 return new;
end;
$$;
revoke execute on function public.initialize_partner_account() from public,anon,authenticated;
drop trigger if exists initialize_partner_account on auth.users;
create trigger initialize_partner_account after insert on auth.users for each row execute procedure public.initialize_partner_account();
insert into storage.buckets(id,name,public,file_size_limit) values('evidence','evidence',false,10485760) on conflict(id) do update set public=false,file_size_limit=10485760;
drop policy if exists "Read own evidence files" on storage.objects;
create policy "Read own evidence files" on storage.objects for select to authenticated using(bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "Upload own evidence files" on storage.objects;
create policy "Upload own evidence files" on storage.objects for insert to authenticated with check(bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "Delete own evidence files" on storage.objects;
create policy "Delete own evidence files" on storage.objects for delete to authenticated using(bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid()::text));

commit;
