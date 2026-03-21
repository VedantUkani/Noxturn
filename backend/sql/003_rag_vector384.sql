-- Migration: switch evidence_embeddings from 1536-dim (OpenAI) to 384-dim (sentence-transformers)
-- Run this in Supabase SQL Editor BEFORE running the ingestion script.

-- Drop old table and index (data will be re-ingested)
drop table if exists evidence_embeddings;

-- Recreate with 384-dim vector to match all-MiniLM-L6-v2
create table evidence_embeddings (
  id          uuid primary key default gen_random_uuid(),
  item_id     text not null unique,
  item_type   text not null,          -- 'intervention' | 'evidence'
  title       text not null,
  content     text not null,
  metadata    jsonb default '{}'::jsonb,
  embedding   vector(384),
  created_at  timestamptz default now()
);

-- HNSW index is better than IVFFlat for small datasets (< 1000 rows)
create index if not exists idx_evidence_embeddings_hnsw
  on evidence_embeddings
  using hnsw (embedding vector_cosine_ops);

-- RPC function called by the Python retriever
-- Returns items ordered by cosine similarity to the query embedding
create or replace function match_embeddings(
  query_embedding vector(384),
  match_count     int,
  filter_type     text default null
)
returns table (
  item_id    text,
  item_type  text,
  title      text,
  content    text,
  metadata   jsonb,
  similarity float
)
language sql stable
as $$
  select
    item_id,
    item_type,
    title,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from evidence_embeddings
  where filter_type is null or item_type = filter_type
  order by embedding <=> query_embedding
  limit match_count;
$$;
