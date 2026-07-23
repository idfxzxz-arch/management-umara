create type public.user_role as enum ('developer', 'manager', 'staff', 'staff_magang');
create type public.user_status as enum ('active', 'inactive');
create type public.client_type as enum ('OP', 'Badan');
create type public.client_status as enum ('Aktif', 'Prospek', 'Nonaktif');
create type public.task_status as enum ('todo', 'progress', 'review', 'done');
create type public.attendance_status as enum ('Hadir', 'Terlambat', 'Izin', 'Remote');
create type public.tax_category as enum ('Aktivasi Coretax', 'SP2DK/Pemeriksaan', 'SPT Masa', 'SPT Tahunan');
create type public.tax_status as enum ('Draft', 'Berjalan', 'Review', 'Selesai');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'staff',
  phone text,
  avatar text,
  status public.user_status not null default 'active',
  is_first_login boolean not null default true,
  password_changed_at timestamptz,
  points integer not null default 0,
  attendance_rate numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  npwp text,
  type public.client_type not null default 'Badan',
  status public.client_status not null default 'Aktif',
  pic text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client text,
  pic text,
  deadline date,
  status public.task_status not null default 'todo',
  points integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  staff text,
  date date not null default current_date,
  check_in time,
  check_out time,
  status public.attendance_status not null default 'Hadir',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tax (
  id uuid primary key default gen_random_uuid(),
  category public.tax_category not null,
  service text not null,
  client text,
  pic text,
  deadline date,
  status public.tax_status not null default 'Draft',
  attachment text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.attendance enable row level security;
alter table public.tax enable row level security;

create policy "authenticated users can read users" on public.users for select to authenticated using (true);
create policy "authenticated users can manage users" on public.users for all to authenticated using (true) with check (true);
create policy "authenticated users can manage clients" on public.clients for all to authenticated using (true) with check (true);
create policy "authenticated users can manage tasks" on public.tasks for all to authenticated using (true) with check (true);
create policy "authenticated users can manage attendance" on public.attendance for all to authenticated using (true) with check (true);
create policy "authenticated users can manage tax" on public.tax for all to authenticated using (true) with check (true);

insert into public.users (id, name, email, role, status, is_first_login)
values (
  '3e178526-1445-4f3f-a624-2b3b9e9b4c89',
  'Developer UMARA',
  'developer@umaratax.com',
  'developer',
  'active',
  true
)
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  updated_at = now();
