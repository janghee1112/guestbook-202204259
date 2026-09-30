create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists entries_created_at_idx on entries (created_at desc);
