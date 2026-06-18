create extension if not exists vector;

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  job_title text not null,
  job_desc text not null,
  qualifications jsonb not null,
  cv_text text,
  score integer not null,
  summary text not null,
  checklist jsonb not null,
  lang text default 'id',
  created_at timestamptz default now()
);
