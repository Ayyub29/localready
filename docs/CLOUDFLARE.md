# Deploy LocalReady on Cloudflare Workers

LocalReady uses [**OpenNext**](https://opennext.js.org/cloudflare/get-started) (`@opennextjs/cloudflare`), not Vercel.

## One-time: Cloudflare API token

1. [Create an API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with **Edit Cloudflare Workers** (or use the “Edit Cloudflare Workers” template).
2. Copy your **Account ID** from the Cloudflare dashboard (Workers & Pages → Overview).

## Deploy from your machine

```bash
npm install
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
npm run deploy:cf
```

Wrangler prints the live URL (default: `https://localready.<subdomain>.workers.dev` unless you add a custom domain in the dashboard).

## Production secrets (Workers → localready → Settings → Variables)

Set these as **encrypted** variables (not in git):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Neon pooled URL |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | **Exact** public URL, e.g. `https://localready.your-subdomain.workers.dev` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth |
| `ADMIN_ALLOWLIST` | Comma-separated emails allowed to open `/en/admin` |
| `CONTENT_INJECT_SECRET` | Optional; API inject |

**Do not** set `ADMIN_DEV_BYPASS=true` in production.

### Google OAuth

In Google Cloud Console, add an authorized redirect URI:

`https://<your-workers-host>/api/auth/callback/google`

## Git-connected deploys (recommended)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Connect to Git** → `Ayyub29/localready`.
2. Production branch: `main` (or your feature branch for a preview worker).
3. Build command: `npm run deploy:cf`  
   Or split: build in CI with `npx opennextjs-cloudflare build`, then `npx opennextjs-cloudflare deploy` with `CLOUDFLARE_API_TOKEN` in CI secrets.
4. Add the same encrypted variables as above in the worker settings.

## Local Workers preview

```bash
cp .dev.vars.example .dev.vars
# Put secrets in .dev.vars or rely on .env.local via NEXTJS_ENV=development
npm run preview:cf
```

Day-to-day UI work can still use `npm run dev` (port 43123).

## Content on Workers (no `fs`)

Workers cannot read `content/` from disk at runtime. Deployments set `LOCALREADY_BUNDLED_CONTENT=1` in `wrangler.jsonc` so corridor packs and situation defaults are **bundled at build time**. Local dev still reads `content/` from disk for admin edits.

## Admin on Cloudflare

The admin UI **reads** bundled `content/` from the deployment. **Saving** admin forms writes to the local filesystem, which **does not persist** on Cloudflare Workers. Use admin with writes on **local dev** (`npm run dev` + `ADMIN_DEV_BYPASS=true` or allowlist). On Workers you can still test navigation and forms; use production admin only after you add durable storage (R2 / Git export) if you need hosted authoring.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run deploy:cf` | Build OpenNext bundle + `wrangler deploy` |
| `npm run preview:cf` | Build + local Workers runtime preview |
