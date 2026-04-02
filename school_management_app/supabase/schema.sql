create type app_role as enum ('student', 'parent', 'finance', 'admin');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null,
  created_at timestamptz default now()
);

create table if not exists parent_students (
  id bigserial primary key,
  parent_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  unique(parent_id, student_id)
);

create table if not exists coding_tasks (
  id bigserial primary key,
  title text not null,
  description text not null,
  deadline timestamptz not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists coding_submissions (
  id bigserial primary key,
  task_id bigint not null references coding_tasks(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  code text not null,
  score numeric default 0,
  feedback text,
  submitted_at timestamptz default now()
);

create table if not exists public_registrations (
  id bigserial primary key,
  student_name text not null,
  parent_name text not null,
  parent_email text not null,
  created_at timestamptz default now()
);

create table if not exists payments (
  id bigserial primary key,
  student_id uuid references profiles(id),
  registration_id bigint references public_registrations(id),
  amount numeric not null,
  method text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists receipts (
  id bigserial primary key,
  payment_id bigint not null references payments(id) on delete cascade,
  receipt_number text unique not null,
  receipt_url text,
  generated_at timestamptz default now()
);

create table if not exists landing_content (
  id int primary key,
  hero_title text default 'Learn to code with confidence',
  hero_text text default 'Join our coding school and build real projects.',
  hero_image_url text,
  hero_image_url_secondary text
);
