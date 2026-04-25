-- =========================================================
-- 02_campaigns.sql
-- Run this in Supabase SQL editor AFTER schema.sql.
-- Adds campaigns + applications tables.
-- =========================================================

create table if not exists public.campaigns (
    id                       uuid primary key default gen_random_uuid(),
    owner_id                 uuid not null references public.app_users(id) on delete cascade,
    title                    text not null,
    brand                    text,
    offer                    text not null,
    promo_code               text not null,
    start_date               date not null,
    end_date                 date not null,
    status                   text not null default 'open'
                                check (status in ('open', 'active', 'submitted', 'closed')),
    assigned_influencer_id   uuid references public.app_users(id) on delete set null,
    submitted_post           text,
    created_at               timestamptz not null default now(),
    updated_at               timestamptz not null default now()
);

create index if not exists campaigns_owner_idx          on public.campaigns(owner_id);
create index if not exists campaigns_status_idx         on public.campaigns(status);
create index if not exists campaigns_assigned_idx       on public.campaigns(assigned_influencer_id);

create table if not exists public.applications (
    campaign_id    uuid not null references public.campaigns(id) on delete cascade,
    influencer_id  uuid not null references public.app_users(id) on delete cascade,
    status         text not null default 'pending'
                       check (status in ('pending', 'accepted', 'rejected')),
    message        text,
    applied_at     timestamptz not null default now(),
    primary key (campaign_id, influencer_id)
);

create index if not exists applications_influencer_idx on public.applications(influencer_id);
create index if not exists applications_status_idx     on public.applications(status);

alter table public.campaigns    enable row level security;
alter table public.applications enable row level security;
