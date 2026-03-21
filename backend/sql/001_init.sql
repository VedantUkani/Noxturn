-- Noxturn minimal schema (MVP)
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text not null,
  role text not null default 'nurse',
  commute_minutes integer default 30,
  timezone text default 'America/Phoenix',
  created_at timestamptz default now()
);

create table if not exists schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  block_type text not null,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  commute_before_minutes integer default 0,
  commute_after_minutes integer default 0,
  source text default 'manual',
  created_at timestamptz default now()
);

create index if not exists idx_schedule_blocks_user_time
on schedule_blocks(user_id, start_time);

create table if not exists risk_episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  label text not null,
  severity text not null,
  severity_score numeric not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  explanation_json jsonb not null,
  contributing_features jsonb,
  suggested_interventions text[],
  created_at timestamptz default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  plan_mode text not null,
  plan_start timestamptz not null,
  plan_end timestamptz not null,
  circadian_strain_score numeric default 0,
  recovery_status_score numeric default 0,
  risk_summary jsonb not null default '{}'::jsonb,
  next_best_action jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists plan_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  scheduled_time timestamptz not null,
  duration_minutes integer not null,
  anchor_flag boolean default false,
  optional_flag boolean default false,
  source_reason text,
  evidence_ref text,
  status text default 'planned',
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists wearable_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  sleep_duration_hours numeric,
  sleep_start timestamptz,
  sleep_end timestamptz,
  restlessness_score numeric,
  resting_hr numeric,
  source text default 'mock',
  raw_data jsonb,
  created_at timestamptz default now(),
  unique(user_id, date)
);
