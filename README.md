# LocalReady

Travel language preparator (scaffold).

## Flow

1. **Login** — Google OAuth (`/{locale}/login`)
2. **Home** — `/{locale}`
   - No destination saved yet → pick a destination
   - After a pick → lesson list for your last destination (stored in Neon on `user.lastCorridorId`)
3. **Change destination** — `/{locale}/destinations` (picker again)

## Stack

- Next.js 15, TypeScript, Tailwind
- **Auth:** Auth.js (NextAuth v5) + Google provider
- **Database:** Neon PostgreSQL + Drizzle ORM

## Setup

### 1. Install

```bash
npm install
```

### 2. Neon database

1. Create a project at [neon.tech](https://neon.tech) (Singapore region is fine for APAC).
2. Copy the **connection string** (pooled recommended for serverless).

### 3. Environment

```bash
cp .env.example .env.local
```

Put secrets in **`.env.local`** (not only `.env`). Drizzle CLI (`npm run db:push`) loads that file via `drizzle.config.ts`.

**Neon:** Dashboard → your project → **Connect** → copy the connection string. Prefer **pooled** (`-pooler` in the host) for serverless. It must look like:

`postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

Fill in:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL URL |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | App URL, e.g. `http://localhost:43123` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client |

Google Cloud Console → OAuth client → **Authorized redirect URI**:

`http://localhost:43123/api/auth/callback/google`

### 4. Apply schema

From the repo root (with `DATABASE_URL` set in `.env.local`):

```bash
npm run db:push
```

If you see *"Either connection url or host, database are required"*, `DATABASE_URL` is empty — fix `.env.local` and try again.

Or migrations: `npm run db:generate` then `npm run db:migrate`.

### 5. Run

```bash
npm run dev
```

Open http://localhost:43123/en/login

## Build

```bash
npm run build
```

`DATABASE_URL` must be set in production.
