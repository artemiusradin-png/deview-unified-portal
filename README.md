# Unified Business Data Portal (MVP scaffold)

Internal-style portal for **deviewai.com**: global search, results table, Customer 360 with PRD modules, and **ChatGPT-powered case summaries** via the OpenAI API.

- Product spec: [`PRD.md`](./PRD.md)
- **Local dev:** `npm install` then `npm run dev`
- **Sign in (dev):** password `deview-demo` unless `PORTAL_DEMO_PASSWORD` is set in `.env.local`
- **Secrets:** copy [`.env.example`](./.env.example) to `.env.local` (never commit `.env.local`)

## Production hardening (Vercel / `NODE_ENV=production`)

Set these in the Vercel project **Environment Variables** (and redeploy):

| Variable | Requirement |
|----------|-------------|
| `SESSION_SECRET` | **Required.** At least **32 characters** (e.g. `openssl rand -hex 32`). Used to sign HTTP-only session JWTs. In Vercel, enable it for **Production** (and Preview if you use previews), then **Redeploy** so new builds and Edge middleware see it. |
| `PORTAL_DEMO_PASSWORD` | **Required.** At least **16 characters.** The demo gate password is not defaulted in production. |
| `OPENAI_API_KEY` | Required for AI summaries. |

Behavior includes: **HS256 signed sessions**, **constant-time password check**, **login rate limiting** (per IP, best-effort on serverless), **security headers** (CSP, HSTS, `X-Frame-Options: DENY`, etc.), **401 JSON** for unauthenticated API calls (no HTML redirect), **request size limits**, **strict `customerId`** validation on AI route, and **bounded OpenAI timeouts**.

For stronger brute-force protection at scale, add **Vercel Firewall** rules or an edge rate-limit backed by Redis (e.g. Upstash) in front of `/api/auth/login`.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the environment variables above.
4. Redeploy after any secret change.

Do not commit real secrets; use Vercel project settings for production keys.
