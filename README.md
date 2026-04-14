# Unified Business Data Portal (MVP scaffold)

Internal-style portal for **deviewai.com**: global search, results table, Customer 360 with PRD modules, and **ChatGPT-powered case summaries** via the OpenAI API.

- Product spec: [`PRD.md`](./PRD.md)
- **Local dev:** `npm install` then `npm run dev`
- **Sign in:** default password `deview-demo` unless `PORTAL_DEMO_PASSWORD` is set
- **OpenAI:** copy [`.env.example`](./.env.example) to `.env.local` and set `OPENAI_API_KEY` (see below)

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add environment variables:
   - `OPENAI_API_KEY` — your OpenAI API key
   - Optional: `PORTAL_DEMO_PASSWORD` — production demo gate password

Do not commit real secrets; use Vercel project settings for production keys.
