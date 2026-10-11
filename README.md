# LocalReady

Travel language preparator (scaffold).

## Flow (current)

1. **Login** — `/{locale}/login` (stub: Continue sets session cookie)
2. **Choose destination** — `/{locale}/destinations`
3. **Lesson list** — `/{locale}/destinations/{corridorId}` (8 situations, display only)

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:43123/en/login

## Build

```bash
npm run build
```
