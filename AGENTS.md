# Agent / contributor notes

## Git workflow

- **`main`** — production; merge via PR when stable. Cloudflare Workers builds should track `main` after merge.
- **`dev`** — integration branch cut from `main` after each merge to `main`. Day-to-day work branches off **`dev`**, not stale feature branches.
- **New feature branches:** `git fetch origin && git checkout dev && git pull origin dev && git checkout -b cursor/<short-name>-2228` (or your naming scheme), then open PRs **into `dev`** unless releasing straight to `main`.

## Local app

```bash
npm install
cp .env.example .env.local   # DATABASE_URL, AUTH_*, etc.
npm run db:push
ADMIN_DEV_BYPASS=true npm run dev   # http://localhost:43123
```

## Deploy (Cloudflare)

See `docs/CLOUDFLARE.md` — `npm ci && npm run deploy:cf`, worker secrets on the dashboard.

## UI / design research (ScreensDesign MCP)

Repo ships `.cursor/mcp.json` for `https://api.screensdesign.com/v1/mcp`. **You** must connect and OAuth in Cursor (Pro account). Agents cannot authenticate on your behalf. See `docs/SCREENDESIGN_MCP.md`.
