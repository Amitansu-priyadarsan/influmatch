-- =========================================================
-- 03_pricing_negotiation_ratings.sql
-- Run AFTER 02_campaigns.sql.
-- Adds:
--   • pricing on campaigns (cash / barter / mixed)
--   • per-application proposal (creator counter-offer)
--   • application_comments (negotiation thread)
--   • ratings + cached score on app_users
-- =========================================================

-- ---------- Pricing on campaigns -------------------------
alter table public.campaigns
    add column if not exists compensation_type   text not null default 'cash'
        check (compensation_type in ('cash', 'barter', 'mixed')),
    add column if not exists price_min            integer,
    add column if not exists price_max            integer,
    add column if not exists barter_description   text,
    add column if not exists barter_value         integer;

-- ---------- Creator proposal on apply --------------------
alter table public.applications
    add column if not exists proposed_price  integer,
    add column if not exists proposed_note   text;

-- ---------- Negotiation thread ---------------------------
create table if not exists public.application_comments (
    id            uuid primary key default gen_random_uuid(),
    campaign_id   uuid not null,
    influencer_id uuid not null,
    author_id     uuid not null references public.app_users(id) on delete cascade,
    body          text not null,
    created_at    timestamptz not null default now(),
    foreign key (campaign_id, influencer_id)
        references public.applications(campaign_id, influencer_id)
        on delete cascade
);

create index if not exists app_comments_thread_idx
    on public.application_comments (campaign_id, influencer_id, created_at);

alter table public.application_comments enable row level security;

-- ---------- Ratings --------------------------------------
create table if not exists public.ratings (
    id           uuid primary key default gen_random_uuid(),
    campaign_id  uuid not null references public.campaigns(id) on delete cascade,
    from_user_id uuid not null references public.app_users(id) on delete cascade,
    to_user_id   uuid not null references public.app_users(id) on delete cascade,
    score        integer not null check (score between 1 and 5),
    comment      text,
    created_at   timestamptz not null default now(),
    unique (campaign_id, from_user_id, to_user_id)
);

create index if not exists ratings_to_idx on public.ratings (to_user_id);

alter table public.ratings enable row level security;

-- ---------- Cached aggregate on app_users ----------------
alter table public.app_users
    add column if not exists rating_score        numeric(4,2),
    add column if not exists rating_count        integer not null default 0,
    add column if not exists rating_updated_at   timestamptz;
