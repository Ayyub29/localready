# LocalReady — Build Specification (v1)

**Product:** LocalReady  
**Tagline (EN):** Get locally ready before you land.  
**Tagline (ID):** Siap jalan sebelum kamu terbang.  
**Status:** Scaffold + M1 in progress  
**Last updated:** 2026-10-11

This document is the single source of truth for what we are building. Implementation should match this spec unless explicitly changed in chat.

---

## 1. Product summary

LocalReady is a **travel language preparator**: situational **lesson kits** (phrases + culture + exercises) before a trip, plus a **phrase cheatsheet** for use on the ground. It is **not** a full language course (no CEFR path, no grammar tree).

**Learner languages (UI + explanations):** Indonesian (`id`) and English (`en`).  
**Target languages:** Japanese, Korean, Thai, Vietnamese, and Bahasa Indonesia (for visitors to Indonesia).

**Platform:** Web app + **PWA** (installable, offline cheatsheet when entitled). Native store wrappers (Capacitor / Play) later without rewriting core product.

**Primary market test:** Indonesia (QRIS payments, Bahasa UI). English UI for global/expat users and the **Indonesia inbound** pack.

---

## 2. Destination corridors (v1 catalog)

Five corridors. **China is out of scope** for v1.

| Corridor ID | Destination | Target language | Audience |
|-------------|-------------|-----------------|----------|
| `ja-jp` | Japan | Japanese | ID / EN travelers |
| `ko-kr` | Korea | Korean | ID / EN travelers |
| `th-th` | Thailand | Thai | ID / EN travelers |
| `vi-vn` | Vietnam | Vietnamese | ID / EN travelers |
| `id-id` | Indonesia | Indonesian | EN (and later other) visitors |

Each corridor shares the same **lesson template** (8 situations) but has its own phrase bank, culture cards, audio, and quizzes.

### Content rollout phases

| Phase | Corridors | Goal |
|-------|-----------|------|
| **Scaffold** | All 5 visible in UI; **lesson 1 + emergency cheatsheet** per corridor | Prove navigation, i18n, data model |
| **M2** | **Japan** + **Korea** — 8 lessons each, curated | Beta quality |
| **M3** | **Thailand** + **Vietnam** — 8 lessons each | SEA expansion |
| **M4** | **Indonesia inbound** — 8 lessons | EN-first marketing |
| **M5** | PWA offline, QRIS, entitlements | Revenue beta |

`meta.status`: `live` = full curriculum shipped; `preview` = lesson 1 + emergency only.

---

## 3. User-facing surfaces

### 3.1 Modes

| Mode | User job | Key UI |
|------|----------|--------|
| **Prepare** | Learn before departure | Curriculum → lesson player → exercises |
| **Travel (cheatsheet)** | Fast help on the ground | Situation filter, search, favorites, Quick Speak |

Bottom (or top) nav on trip views: **Prepare** | **Cheatsheet** | **Account**.

### 3.2 Routes (web)

| Route | Purpose |
|-------|---------|
| `/{locale}` | Marketing landing |
| `/{locale}/destinations` | Pick corridor → start trip |
| `/{locale}/trip/{corridorId}` | Trip home (progress, continue lesson) |
| `/{locale}/trip/{corridorId}/curriculum` | All lesson kits |
| `/{locale}/trip/{corridorId}/lessons/{lessonId}` | Lesson player |
| `/{locale}/trip/{corridorId}/cheatsheet` | Travel mode |
| `/{locale}/trip/{corridorId}/cheatsheet/quick/{phraseId}` | Full-screen phrase |
| `/{locale}/account` | Profile, locale, licenses, purchases (stub → real) |
| `/{locale}/paywall` | Weekly SKUs + QRIS (M5) |

`locale` ∈ `en` | `id`.

### 3.3 Onboarding (trip setup)

On first visit to a corridor (or `/destinations`):

- UI language already set via locale prefix; switcher in header.
- **Destination** = corridor choice.
- Optional: **departure date** (for future “days until trip” home; scaffold may omit).
- Optional: **comfort level** (`beginner` | `basics` | `some`) — v1 affects copy only.

**Guest rule (target):** Lesson 1 free without account; account required before lesson 2 and before purchase. Scaffold may use **local progress only** until auth ships.

---

## 4. Lesson kit structure

Each **lesson** is one **situation** (e.g. restaurant, train). Linear steps:

1. **Scenario** — short narrative (`LocalizedString`).
2. **Phrases** — target text, romanization (where applicable), meanings (id + en), optional usage note, **audio** (TTS file or URL).
3. **Culture** — 1–2 cards: title, body, optional Do / Avoid lists.
4. **Exercises** (required to complete lesson):
   - **Flashcards** (subset of lesson phrases).
   - **Quiz** (MCQ + pick-phrase).
   - **Pronunciation** — play model → user records → playback; **self-check** in v1 (no cloud scoring).
5. **Complete** — link to cheatsheet for that situation.

### Standard curriculum (8 lessons per corridor)

| # | Situation key | Focus |
|---|---------------|--------|
| 1 | `basics` | First hour, greetings |
| 2 | `train` | Transit, tickets |
| 3 | `money` | Paying, convenience |
| 4 | `restaurant` | Ordering, bill |
| 5 | `hotel` | Check-in, room |
| 6 | `directions` | Lost, maps |
| 7 | `culture` | Temples, etiquette, dress |
| 8 | `emergency` | Help, health, allergies |

Lesson 1 is **free** per corridor; lessons 2–8 behind **trip pass** (M5). **Emergency phrases** on cheatsheet always free.

### 4.1 Curriculum order (non-linear)

- Lessons are listed in **default order** (1–8 / `basics` → `emergency`) as the **recommended path**.
- Users may **start any unlocked lesson in any order**; there are **no prerequisites** between lessons.
- **Recommended next** = first incomplete lesson in default order (badge only, not a gate).
- **Continue** on trip home = last opened lesson for that corridor if still unlocked; otherwise recommended next.

---

## 5. Cheatsheet (travel mode)

- Filter by **situation** (same keys as lessons).
- Row: large **target text**, romanization toggle, meaning in active locale, play audio, favorite.
- **Search** on meaning + romanization.
- **Quick Speak:** full-screen target for showing locals.
- **Emergency** section pinned, always visible.

Offline (M5): downloadable pack = JSON + audio for **entitled** corridor.

---

## 6. Content & Wikivoyage

### 6.1 Source strategy

- **Seed** from [Wikivoyage](https://en.wikivoyage.org/) phrasebooks + country articles (CC BY-SA 4.0).
- **Product layer:** curated lessons, Indonesian + English copy, native review on target-language strings.
- **Attribution:** per-block `wvSource` where applicable; in-app **Open licenses** screen; SA-compliant export in `content/open/` when we ship WV-derived text.

### 6.2 In-repo format (scaffold)

TypeScript modules under `src/content/packs/{corridor}.ts` exporting `CorridorPack`. Later: JSON + import script `scripts/import-wikivoyage.ts`.

### 6.3 Audio

v1: placeholder or static MP3 per phrase key. Batch TTS generation script later (`public/audio/{corridor}/{phraseId}.mp3`).

---

## 7. Data model

### 7.1 Content types

See `src/lib/types.ts`: `CorridorMeta`, `Phrase`, `CultureCard`, `Lesson`, `QuizQuestion`, `CorridorPack`, `LocalizedString`, `Locale`, `CorridorId`.

### 7.2 User data (server — M5)

| Entity | Fields |
|--------|--------|
| `users` | id, email, locale, created_at |
| `trips` | user_id, corridor_id, depart_at? |
| `lesson_progress` | user_id, lesson_id, step, completed_at?, quiz_score? |
| `phrase_progress` | user_id, phrase_id, familiarity |
| `favorites` | user_id, phrase_id |
| `entitlements` | user_id, type (`trip_pass` \| `subscription`), corridor_id?, valid_until, provider_ref |
| `payments` | user_id, sku, amount_idr, status, provider_ref |

**Scaffold:** `localStorage` key `localready:v1` for active corridor + lesson progress.

### 7.3 Entitlement rules

- `trip_pass`: corridor_id match + `valid_until > now()`.
- `subscription`: all **released** corridors + `valid_until > now()`.

---

## 8. Monetization

| SKU | Access | Duration |
|-----|--------|----------|
| **Free** | Lesson 1 + emergency cheatsheet per corridor | — |
| **Trip pass (weekly)** | All lessons + full cheatsheet + offline for **one** corridor | 7 days |
| **Subscription (weekly)** | All **released** corridors | 7 days |

- Prices in **IDR** (configurable constants).
- **QRIS** via Midtrans or Xendit; webhook → `entitlements`.
- v1 beta may use **manual unlock** flag before payments live.

---

## 9. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS v4 |
| i18n | `next-intl` — `messages/en.json`, `messages/id.json` |
| UI | Minimal components (`Button`, header); shadcn later |
| DB (M5) | **Neon** (PostgreSQL, APAC/Singapore region) + Drizzle; **Hyperdrive** from Cloudflare Workers |
| Auth (M5) | **Google OAuth** (Auth.js / NextAuth v5 + Drizzle adapter) |
| PWA (M5) | Serwist / service worker |
| Payments (M5) | Midtrans or Xendit (QRIS) |
| Hosting | **Cloudflare Workers** (OpenNext); dev port **43123** |
| Repository | https://github.com/Ayyub29/localready |
| Audio | Deferred — text + romanization only until v2 |

---

## 10. API (M5)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/me` | User + entitlements |
| POST | `/api/trips` | Create/update trip |
| GET/POST | `/api/progress` | Lesson / phrase progress |
| GET/POST | `/api/favorites` | Favorites |
| POST | `/api/checkout` | QRIS session |
| POST | `/api/webhooks/payment` | Grant entitlement |

Scaffold: no API; client-only progress.

---

## 11. Milestones & acceptance

### Scaffold (current)

- [x] `en` / `id` routes work
- [x] Destinations list shows **5 corridors**
- [x] Trip home + curriculum list + lesson 1 player (minimal steps)
- [x] Cheatsheet with emergency + lesson phrases
- [x] `npm run build` passes
- [x] README + this SPEC committed

### M2 — Content + Japan/Korea depth

- [ ] 8 lessons × 2 corridors, WV attribution where used
- [ ] Native review sign-off per language

### M3 — Thailand + Vietnam

- [ ] 8 lessons each

### M4 — Indonesia inbound pack

- [ ] 8 lessons, EN-primary marketing

### M5 — Ship beta (Indonesia)

- [ ] Auth, Postgres, QRIS, paywall, PWA offline
- [ ] Analytics (lesson complete, purchase)

---

## 12. Explicit non-goals (v1)

- China corridor
- Live translation / camera / chat
- Cloud pronunciation scoring
- Full spaced-repetition engine
- Native iOS/Android store binaries (until Capacitor phase)
- 50-language catalog

---

## 13. Open decisions (defaults)

| Topic | Default |
|-------|---------|
| Payment provider | Midtrans (TBD) |
| Auth | Google OAuth at M5 |
| Database vendor | Neon (PostgreSQL) |
| Launch pair for full content | Japan + Korea |
| China | Excluded |
| Pronunciation | Record + self-check until M5+ |

---

## 14. Success metrics (beta)

- Activation: % users completing **lesson 1**
- Value: cheatsheet opens within 7 days
- Revenue: QRIS completion rate (M5)
