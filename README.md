# Unified Business Data Portal (MVP scaffold)

Internal-style portal for **deviewai.com**: global search, results table, Customer 360 with PRD modules, and **ChatGPT-powered case summaries** via the OpenAI API.

The app now supports **Supabase as the first real data source**. If Supabase env vars are not set, it falls back to the bundled demo records.

- Product spec: [`PRD.md`](./PRD.md)
- **Local dev:** `npm install` then `npm run dev`
- **Access:** one code for everything — see [`.env.example`](./.env.example). Copy to `.env.local` (never commit `.env.local`).

## Authentication (simplified)

| Environment | What to set |
|-------------|-------------|
| **Local** | Optional `PORTAL_ACCESS_CODE` in `.env.local`. If omitted, defaults to **`deview-demo`**. |
| **Production (Vercel)** | **`PORTAL_ACCESS_CODE`** — at least **8 characters**. Exact variable name. Enable for **Production** and for **Preview** if you open branch/preview URLs (otherwise previews won’t see the var). Then **redeploy**. Alternates also work: **`ACCESS_CODE`** or **`PORTAL_CODE`**. |

The same value is used to verify sign-in and to derive signed session cookies (PBKDF2 + JWT). No separate `SESSION_SECRET` or portal password.

**Optional:** `OPENAI_API_KEY` for AI case summaries.

## Supabase

Set these server-side environment variables to read portal data from Supabase:

| Variable | Required | Notes |
|-------------|-------------|-------------|
| `SUPABASE_URL` | Yes | Example: `https://project-ref.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | Used by the server for portal reads; falls back to `SUPABASE_ANON_KEY` if omitted |
| `SUPABASE_ANON_KEY` | Optional | Fallback key if you do not want to use the service role key yet |
| `SUPABASE_PORTAL_TABLE` | Optional | Defaults to `portal_customer_profiles` |

Expected Supabase shape for the first integration:

- One table or view, default name `portal_customer_profiles`
- Search columns at top level:
  `id`, `status`, `loan_type`, `application_number`, `loan_number`, `apply_date`, `id_number`, `name`, `mobile`, `partaker_type`, `blacklist_flag`, `source_system`, `age`, `job`, `company_unit`
- Profile module columns as `jsonb`:
  `apply_info`, `partakers`, `credit_ref`, `documents`, `mortgage`, `dsr`, `loan_history`, `partaking_history`, `approval_info`, `repay_history`, `repay_condition`, `crm`, `oca_write_off`

The JSON payloads may use either `camelCase` or `snake_case` keys. The adapter accepts both.

Bootstrap files included in this repo:

- Schema: [`supabase/schema.sql`](./supabase/schema.sql)
- SQL seed: [`supabase/seed.sql`](./supabase/seed.sql)
- REST seed script: `npm run seed:supabase`

Minimal example row:

```sql
create table public.portal_customer_profiles (
  id text primary key,
  status text not null,
  loan_type text not null,
  application_number text not null,
  loan_number text not null,
  apply_date text not null,
  id_number text not null,
  name text not null,
  mobile text not null,
  partaker_type text not null,
  blacklist_flag boolean not null default false,
  source_system text not null,
  age integer not null,
  job text not null,
  company_unit text not null,
  apply_info jsonb not null,
  partakers jsonb not null default '[]'::jsonb,
  credit_ref jsonb not null,
  documents jsonb not null default '[]'::jsonb,
  mortgage jsonb not null,
  dsr jsonb not null,
  loan_history jsonb not null default '[]'::jsonb,
  partaking_history jsonb not null default '[]'::jsonb,
  approval_info jsonb not null default '[]'::jsonb,
  repay_history jsonb not null default '[]'::jsonb,
  repay_condition jsonb not null,
  crm jsonb not null default '[]'::jsonb,
  oca_write_off jsonb not null
);
```

Other behavior: rate-limited login, security headers, API `401` JSON when unauthenticated, request size limits, bounded OpenAI timeouts, **AI assistant** (`/assistant`) grounded on the open borrower record when launched from a profile, and UI aligned with the **Project_1_questions_for_development** discovery brief (HKID search, age/job filters, masked phones, module labels A/B/C/F).

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import in [Vercel](https://vercel.com/new).
3. Set **`PORTAL_ACCESS_CODE`** (8+ chars) and optionally **`OPENAI_API_KEY`**.
4. Redeploy after changes.

Do not commit real secrets; use Vercel project settings for production.
