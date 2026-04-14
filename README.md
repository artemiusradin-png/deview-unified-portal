# Unified Business Data Portal (MVP scaffold)

Internal-style portal for **deviewai.com**: global search, results table, Customer 360 with PRD modules, and **ChatGPT-powered case summaries** via the OpenAI API.

- Product spec: [`PRD.md`](./PRD.md)
- **Local dev:** `npm install` then `npm run dev`
- **Access:** one code for everything — see [`.env.example`](./.env.example). Copy to `.env.local` (never commit `.env.local`).

## Authentication (simplified)

| Environment | What to set |
|-------------|-------------|
| **Local** | Optional `PORTAL_ACCESS_CODE` in `.env.local`. If omitted, defaults to **`deview-demo`**. |
| **Production (Vercel)** | **`PORTAL_ACCESS_CODE`** — at least **8 characters**. Exact variable name; enable for **Production**, then **redeploy**. |

The same value is used to verify sign-in and to derive signed session cookies (PBKDF2 + JWT). No separate `SESSION_SECRET` or portal password.

**Optional:** `OPENAI_API_KEY` for AI case summaries.

Other behavior: rate-limited login, security headers, API `401` JSON when unauthenticated, request size limits, and bounded OpenAI timeouts.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import in [Vercel](https://vercel.com/new).
3. Set **`PORTAL_ACCESS_CODE`** (8+ chars) and optionally **`OPENAI_API_KEY`**.
4. Redeploy after changes.

Do not commit real secrets; use Vercel project settings for production.
