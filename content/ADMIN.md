# Admin (planned)

Browser UI at **`/{locale}/admin`** (`en` or `id`) for content authors. Same locales as the learner app. Legacy **`/admin`** redirects to `/en/admin`. **Content you author must stay bilingual** wherever the data model uses `LocalizedString` (`en` + `id`).

### Bilingual content (required)

| Learner locale | What they see |
|----------------|----------------|
| **`en`** | English glosses (`meaning.en`, `line.en`, `title.en`, `prompt.en`, …) |
| **`id`** | Indonesian learner UI copy (`meaning.id`, `line.id`, `title.id`, …) — not a translation of the corridor language line |

For **`id-id`**, `target` is Indonesian; `meaningEn` / `line.en` explain it in English; `meaningId` / `line.id` explain it when the app UI is in Bahasa Indonesia. **Do not ship empty `id` fields** on user-visible strings. Phrase inject, conversations, lessons, and JSON quiz files should always fill both.

Admin UI strings live in `messages/en.json` and `messages/id.json` under the `admin` key. Writes the same Git-backed stores documented in [ARCHITECTURE.md](./ARCHITECTURE.md) and [PIPELINE.md](./PIPELINE.md).

## Access control

| Mechanism | Use |
|-----------|-----|
| **`ADMIN_ALLOWLIST`** | Comma-separated Google account emails allowed to open `/{locale}/admin/*`. Empty = no access (layout returns 404). |
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
/{locale}/admin                          Hub (corridor picker, links)
/{locale}/admin/[corridorId]/phrases     Pool review + inject
/{locale}/admin/[corridorId]/conversations
/{locale}/admin/[corridorId]/mini-lessons
/{locale}/admin/[corridorId]/quizzes     fill-blank (+ flashcards tab)
/{locale}/admin/[corridorId]/lessons     Manifest editor
/{locale}/admin/[corridorId]/cheatsheet  Situation → phrase picks
/{locale}/admin/situations               Global situation titles, order, enabled flags (`content/situations/default.json`)
/{locale}/admin/[corridorId]/situations   Per-corridor overrides (`content/situations/{corridorId}.json`, merged over default)
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
| `/{locale}/admin` | Corridor picker (EN/ID UI) |
| `/{locale}/admin/[corridorId]` | Section overview |
| `/{locale}/admin/[corridorId]/phrases` | Inject + approve/reject pool |
| `/{locale}/admin/[corridorId]/conversations` | List + form editor (turns) |
| `/{locale}/admin/[corridorId]/mini-lessons` | List + JSON editor |
| `/{locale}/admin/[corridorId]/quizzes` | Fill-blank, phrase lists, flashcards (JSON editors) |
| `/{locale}/admin/[corridorId]/lessons` | Manifest editor (vignette sequence from pool refs) |
| `/{locale}/admin/[corridorId]/cheatsheet` | Per-situation phrase picks + build catalog |

Server actions live in `src/lib/admin/server-actions.ts` (session-gated). Local dev: `ADMIN_DEV_BYPASS=true` or `ADMIN_ALLOWLIST=your@gmail.com`.

## Implementation phases (remaining)

1. Rich form editors for mini lessons, fill-blank, phrase lists (beyond JSON).
2. Compile pack / extract phrases buttons from admin.
3. Session-backed `/api/admin/*` instead of bearer-only inject API for scripts.
4. Git PR export when `content/` is read-only in hosted deploys.

## Related docs

- [PIPELINE.md](./PIPELINE.md) — compile/extract/cheatsheet scripts
- [ARCHITECTURE.md](./ARCHITECTURE.md) — pools vs lesson vs pack
