-- Abhinav RAG support tables
-- Run after 001_init.sql

create extension if not exists vector;

create table if not exists evidence_embeddings (
  id uuid primary key default gen_random_uuid(),
  item_id text not null unique,
  item_type text not null, -- intervention | evidence
  title text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz default now()
);

create index if not exists idx_evidence_embeddings_vector
  on evidence_embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 20);
