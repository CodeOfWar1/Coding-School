-- Assignments on top of public.classes (teaching groups).
-- Prerequisite: run profiles_teacher_role.sql first.
-- If you already have public.classes with different columns, adjust the CREATE below or skip it.

-- -----------------------------------------------------------------------------
-- classes (create if missing — fixes: relation "public.classes" does not exist)
-- -----------------------------------------------------------------------------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references public.courses (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.classes enable row level security;

drop policy if exists "Admins manage classes" on public.classes;
create policy "Admins manage classes" on public.classes
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Junction: many teachers per class (admin-managed)
create table if not exists public.class_teachers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, teacher_id)
);

create index if not exists class_teachers_teacher_id_idx on public.class_teachers (teacher_id);
create index if not exists class_teachers_class_id_idx on public.class_teachers (class_id);

-- Junction: pupils in a class (admin-managed)
create table if not exists public.class_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, student_user_id)
);

create index if not exists class_students_class_id_idx on public.class_students (class_id);
create index if not exists class_students_student_id_idx on public.class_students (student_user_id);

-- coding_tasks / coding_submissions (assignment activity)
create table if not exists public.coding_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  deadline timestamptz,
  created_at timestamptz not null default now()
);

alter table public.coding_tasks add column if not exists class_id uuid references public.classes (id) on delete cascade;
alter table public.coding_tasks add column if not exists teacher_id uuid references public.profiles (id) on delete set null;
alter table public.coding_tasks add column if not exists instructions text;
alter table public.coding_tasks add column if not exists points_max integer not null default 100;
alter table public.coding_tasks add column if not exists pass_threshold integer not null default 60;
alter table public.coding_tasks add column if not exists published boolean not null default false;
alter table public.coding_tasks add column if not exists starter_code text;

create table if not exists public.coding_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.coding_tasks (id) on delete cascade,
  student_id uuid not null,
  code_body text,
  status text not null default 'submitted' check (status in ('submitted', 'graded', 'returned')),
  score numeric,
  pass_fail text check (pass_fail in ('pass', 'fail')),
  feedback text,
  graded_by uuid references public.profiles (id) on delete set null,
  graded_at timestamptz,
  submitted_at timestamptz not null default now(),
  unique (task_id, student_id)
);

-- RLS
alter table public.class_teachers enable row level security;
alter table public.class_students enable row level security;
alter table public.coding_tasks enable row level security;
alter table public.coding_submissions enable row level security;

-- Teachers read their class assignments
drop policy if exists "Teachers read own class_teachers" on public.class_teachers;
create policy "Teachers read own class_teachers" on public.class_teachers
  for select using (teacher_id = auth.uid());

drop policy if exists "Admins manage class_teachers" on public.class_teachers;
create policy "Admins manage class_teachers" on public.class_teachers
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Teachers read pupils in their classes; students read own membership
drop policy if exists "Teachers read class_students in their classes" on public.class_students;
create policy "Teachers read class_students in their classes" on public.class_students
  for select using (
    exists (
      select 1 from public.class_teachers ct
      where ct.class_id = class_students.class_id and ct.teacher_id = auth.uid()
    )
  );

drop policy if exists "Students read own class_students" on public.class_students;
create policy "Students read own class_students" on public.class_students
  for select using (student_user_id = auth.uid());

drop policy if exists "Admins manage class_students" on public.class_students;
create policy "Admins manage class_students" on public.class_students
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Teachers read classes they teach
drop policy if exists "Teachers read assigned classes" on public.classes;
create policy "Teachers read assigned classes" on public.classes
  for select using (
    exists (
      select 1 from public.class_teachers ct
      where ct.class_id = classes.id and ct.teacher_id = auth.uid()
    )
  );

-- Students read classes they are in
drop policy if exists "Students read their classes" on public.classes;
create policy "Students read their classes" on public.classes
  for select using (
    exists (
      select 1 from public.class_students cs
      where cs.class_id = classes.id and cs.student_user_id = auth.uid()
    )
  );

-- Tasks: teachers in class; students see published in their class
drop policy if exists "Teachers manage tasks in their classes" on public.coding_tasks;
create policy "Teachers manage tasks in their classes" on public.coding_tasks
  for all using (
    exists (
      select 1 from public.class_teachers ct
      where ct.class_id = coding_tasks.class_id and ct.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.class_teachers ct
      where ct.class_id = coding_tasks.class_id and ct.teacher_id = auth.uid()
    )
  );

drop policy if exists "Students read published tasks in their classes" on public.coding_tasks;
create policy "Students read published tasks in their classes" on public.coding_tasks
  for select using (
    published = true
    and exists (
      select 1 from public.class_students cs
      where cs.class_id = coding_tasks.class_id and cs.student_user_id = auth.uid()
    )
  );

drop policy if exists "Teachers grade submissions in their classes" on public.coding_submissions;
create policy "Teachers grade submissions in their classes" on public.coding_submissions
  for all using (
    exists (
      select 1 from public.coding_tasks t
      join public.class_teachers ct on ct.class_id = t.class_id
      where t.id = coding_submissions.task_id and ct.teacher_id = auth.uid()
    )
  );

drop policy if exists "Students manage own submissions" on public.coding_submissions;
create policy "Students manage own submissions" on public.coding_submissions
  for all using (student_id = auth.uid())
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.coding_tasks t
      join public.class_students cs on cs.class_id = t.class_id
      where t.id = coding_submissions.task_id
        and t.published = true
        and cs.student_user_id = auth.uid()
    )
  );
