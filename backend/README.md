# InfluMatch — FastAPI backend

## 1. Run the SQL schema in Supabase

Open Supabase dashboard → **SQL Editor** → New query → paste the contents of
[`schema.sql`](./schema.sql) and run.

This creates `app_users`, `influencer_profiles`, `owner_profiles`, and `tokens`
with RLS enabled (no policies — only the backend's service-role key can read/write).

## 2. Environment

`.env` is already populated at `backend/.env` with the live Supabase
service-role JWT and admin credentials. It is gitignored.

> The frontend's publishable key cannot be used here — it's locked out by RLS.
> The backend uses the service-role key, which bypasses RLS.

## 3. Install + run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API will be at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## 4. Token flow

```
Anonymous visit
  ──► POST /api/v1/session
      → { session_token: "sess_..." }
      Frontend stores in localStorage as `influmatch.session_token`
      Frontend sends header: X-Session-Token: sess_...

User signs in / signs up
  ──► POST /api/v1/auth/signup  (header: X-Session-Token)
  ──► POST /api/v1/auth/signin  (header: X-Session-Token)
      → { auth_token: "auth_...", user: {...} }
      Frontend deletes session_token, stores auth_token
      All subsequent calls: Authorization: Bearer auth_...

Sign out
  ──► POST /api/v1/auth/logout  (header: Authorization: Bearer)
      → revokes the auth_token; frontend should also call /session again
```

## 5. Endpoints

| Method | Path | Header | Body |
|---|---|---|---|
| `POST` | `/api/v1/session` | — | — |
| `POST` | `/api/v1/auth/signup` | `X-Session-Token` | `{ role, email, password, name? }` |
| `POST` | `/api/v1/auth/signin` | `X-Session-Token` | `{ email, password }` |
| `GET`  | `/api/v1/auth/me` | `Authorization: Bearer` | — |
| `POST` | `/api/v1/auth/logout` | `Authorization: Bearer` | — |
| `POST` | `/api/v1/onboarding/influencer` | `Authorization: Bearer` | influencer profile fields |
| `POST` | `/api/v1/onboarding/owner` | `Authorization: Bearer` | owner profile fields |

## 6. Admin

The admin user lives **only** in `.env` — never in the database.
Sign in at the regular `/auth/signin` endpoint with `ADMIN_EMAIL` /
`ADMIN_PASSWORD`. The backend issues a normal `auth_token` (with
`meta = {"role":"admin", ...}` in the `tokens` row).
