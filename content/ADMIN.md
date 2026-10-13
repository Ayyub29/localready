# Admin (planned)

Browser UI at **`/admin`** for content authors. Learner app stays under `/[locale]/…`. Admin is **English-first** (no locale prefix) and writes the same Git-backed stores documented in [ARCHITECTURE.md](./ARCHITECTURE.md) and [PIPELINE.md](./PIPELINE.md).

## Access control

| Mechanism | Use |
|-----------|-----|
| **`ADMIN_ALLOWLIST`** | Comma-separated Google account emails allowed to open `/admin/*`. Empty = no access (layout returns 404). |
| **Signed-in session** | Auth.js Google OAuth (`auth()`). Admin layout checks `session.user.email` against the allowlist. |
| **`CONTENT_INJECT_SECRET`** | Today: machine/script access to `POST /api/content/inject` and `GET/PATCH /api/content/pool`. Keep for CI and local CLI; admin UI can proxy these server-side later so editors never handle the bearer token. |

Non-allowlisted users should not see admin chrome (use `notFound()` rather than a login wall that advertises the route).

## Capabilities (target)

### 1. Inject units manually

Create or edit rows in the **authoring pools** (validate schema, stable ids):

| Unit | Store | Admin surface (planned) |
|------|--------|-------------------------|
| Phrase | `content/open/{corridor}/phrases-pool.json` | Form + bulk CSV; status `pending` / `approved` / `rejected` |
| Conversation | `content/conversations/{corridor}/*.json` | Turn editor, `phraseId` linker to pool |
| Mini lesson | `content/mini-lessons/{corridor}/*.json` | `description` + `words[]` |
| Quiz (fill-blank) | `content/fill-blank/{corridor}/*.json` | Situation/reply MCQ, `cuePhraseId` |
| Phrase list | `content/phrase-lists/{corridor}/*.json` | Ordered `phraseIds` |
| Flashcard deck | `content/flashcard-decks/{corridor}/*.json` | Cards ↔ phrase ids |

**Today:** phrases only via `POST /api/content/inject` + pool `GET/PATCH` (Bearer secret). Other pools are JSON/CLI.

### 2. Craft lesson (pick from pools)

Visual editor for **`content/lessons/{corridor}/{lessonId}.json`**:

- Situation, title, free/paid, vignettes.
- Per vignette: ordered `sequence` of `{ kind, ref, anchor? }` pointing at pool files.
- Preview step count (reuse `buildLessonSteps` in dev).
- **Compile:** trigger `content:compile:lesson` + `content:compile:pack` (server action or documented “copy compile log” in v1).

No auto-assembler in v1—human picks refs; optional AI *suggest sequence* later.

### 3. Craft cheatsheet

Editor for **`content/cheatsheets/{corridor}.json`**:

- Per `SituationKey`, ordered list of `phraseId`s (search approved pool + lesson phrases).
- **Build:** `npm run content:build:cheatsheet -- {corridor}` → `phrase-catalog-cheatsheet.json`.
- Future: approval flags per row (`approvedForCheatsheet`) instead of a separate manifest.

## Route map (planned)

```
/admin                          Hub (corridor picker, links)
/admin/[corridorId]/phrases     Pool review + inject
/admin/[corridorId]/conversations
/admin/[corridorId]/mini-lessons
/admin/[corridorId]/quizzes     fill-blank (+ flashcards tab)
/admin/[corridorId]/lessons     Manifest editor
/admin/[corridorId]/cheatsheet  Situation → phrase picks
```

Shared UX: corridor switcher, save → write JSON under `content/`, show “run compile” hints, diff-friendly ids.

## Deployment constraints

- **Hosted prod:** app servers are often read-only for `content/`. Admin either:
  - runs only in **local/dev** with writable tree, or
  - commits via **GitHub API** / export PR branch (later), or
  - writes to DB staging and a release job compiles packs (later).

Document which mode the environment uses in `ADMIN_DEPLOY_MODE=local|git-pr` (future env).

## UI (shipped)

| Route | Capability |
|-------|------------|
| `/admin` | Corridor picker |
| `/admin/[corridorId]` | Section overview |
| `/admin/[corridorId]/phrases` | Inject + approve/reject pool |
| `/admin/[corridorId]/conversations` | List + form editor (turns) |
| `/admin/[corridorId]/mini-lessons` | List + JSON editor |
| `/admin/[corridorId]/quizzes` | Fill-blank, phrase lists, flashcards (JSON editors) |
| `/admin/[corridorId]/lessons` | Manifest editor (vignette sequence from pool refs) |
| `/admin/[corridorId]/cheatsheet` | Per-situation phrase picks + build catalog |

Server actions live in `src/lib/admin/server-actions.ts` (session-gated). Local dev: `ADMIN_DEV_BYPASS=true` or `ADMIN_ALLOWLIST=your@gmail.com`.

## Implementation phases (remaining)

1. Rich form editors for mini lessons, fill-blank, phrase lists (beyond JSON).
2. Compile pack / extract phrases buttons from admin.
3. Session-backed `/api/admin/*` instead of bearer-only inject API for scripts.
4. Git PR export when `content/` is read-only in hosted deploys.

## Related docs

- [PIPELINE.md](./PIPELINE.md) — compile/extract/cheatsheet scripts
- [ARCHITECTURE.md](./ARCHITECTURE.md) — pools vs lesson vs pack
