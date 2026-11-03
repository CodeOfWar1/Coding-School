-- Fix teacher invite: "Database error saving new user" / profile creation failed
-- Run this entire file in Supabase SQL Editor, then try Invite Teacher again.

-- Optional display column (safe if you already have it)
alter table public.profiles add column if not exists full_name text;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_check1;

alter table public.profiles
  add constraint profiles_role_check
  check (
    role is null
    or role in (
      'student',
      'parent',
      'admin',
      'finance',
      'teacher',
      'inactive'
    )
  );

-- Signup trigger: only columns that exist on your profiles table
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
  safe_role text;
  v_first text;
  v_last text;
begin
  meta_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  safe_role := case
    when meta_role in ('student', 'parent', 'admin', 'finance', 'teacher', 'inactive')
      then meta_role
    else 'student'
  end;

  v_first := new.raw_user_meta_data->>'first_name';
  v_last := new.raw_user_meta_data->>'last_name';

  insert into public.profiles (id, email, first_name, last_name, role, full_name)
  values (
    new.id,
    new.email,
    v_first,
    v_last,
    safe_role,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      nullif(trim(coalesce(v_first, '') || ' ' || coalesce(v_last, '')), '')
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(excluded.first_name, profiles.first_name),
    last_name = coalesce(excluded.last_name, profiles.last_name),
    role = coalesce(excluded.role, profiles.role),
    full_name = coalesce(excluded.full_name, profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles" on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Allow admins to insert profiles when fixing a failed signup (optional safety net)
drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert profiles" on public.profiles
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
