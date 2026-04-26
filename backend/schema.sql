-- =========================================================
-- InfluMatch — Supabase schema
-- Run this in Supabase SQL editor (Project → SQL → New query).
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS.
-- =========================================================

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- Users (single table, role-tagged). Admin is NOT stored here;
-- admin credentials live in backend env.
-- ---------------------------------------------------------
create table if not exists public.app_users (
    id            uuid primary key default gen_random_uuid(),
    email         text unique not null,
    password_hash text not null,
    role          text not null check (role in ('influencer', 'owner')),
    onboarded     boolean not null default false,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index if not exists app_users_email_idx on public.app_users (lower(email));

-- ---------------------------------------------------------
-- Influencer profile
-- ---------------------------------------------------------
create table if not exists public.influencer_profiles (
    user_id      uuid primary key references public.app_users(id) on delete cascade,
    full_name    text,
    phone        text,
    city         text,
    bio          text,
    niche        text,
    niches       jsonb,
    platforms    jsonb,
    instagram    text,
    followers    text,
    avatar_url   text,
    gallery      jsonb,
    updated_at   timestamptz not null default now()
);

-- Add the column on existing installs (no-op if already present).
alter table public.influencer_profiles add column if not exists avatar_url text;
alter table public.influencer_profiles add column if not exists gallery jsonb;

-- ---------------------------------------------------------
-- Brand / owner profile
-- ---------------------------------------------------------
create table if not exists public.owner_profiles (
    user_id      uuid primary key references public.app_users(id) on delete cascade,
    business     text,
    city         text,
    category     text,
    website      text,
    phone        text,
    budget       text,
    description  text,
    avatar_url   text,
    gallery      jsonb,
    updated_at   timestamptz not null default now()
);

-- Add the column on existing installs (no-op if already present).
alter table public.owner_profiles add column if not exists avatar_url text;
alter table public.owner_profiles add column if not exists gallery jsonb;

-- ---------------------------------------------------------
-- Tokens (both anonymous "session" tokens and signed-in "auth" tokens)
-- ---------------------------------------------------------
create table if not exists public.tokens (
    token       text primary key,
    user_id     uuid references public.app_users(id) on delete cascade,
    kind        text not null check (kind in ('session', 'auth')),
    -- meta carries non-user subjects (e.g. admin tokens have meta = {"role":"admin","email":"..."}).
    meta        jsonb,
    created_at  timestamptz not null default now(),
    expires_at  timestamptz,
    revoked     boolean not null default false
);

create index if not exists tokens_user_idx on public.tokens (user_id);
create index if not exists tokens_kind_idx on public.tokens (kind);

-- ---------------------------------------------------------
-- RLS — enabled with no policies. The backend uses the
-- service_role key which bypasses RLS; the publishable
-- (anon) key on the frontend will be denied. This means
-- the frontend CANNOT touch these tables directly — it must
-- go through the FastAPI backend.
-- ---------------------------------------------------------
alter table public.app_users            enable row level security;
alter table public.influencer_profiles  enable row level security;
alter table public.owner_profiles       enable row level security;
alter table public.tokens               enable row level security;
