# LocalReady content pipeline

**Pools** (conversations, phrase lists, mini lessons) + **phrase corpus** → human **lesson manifest** → compile runtime pack.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** (pools, vignettes, ingest). **[PIPELINE.md](./PIPELINE.md)** (per-pool steps + lesson 0). Runtime shape: **[CONVERSATION.md](./CONVERSATION.md)**.

## Phrase pool file

`content/open/{corridorId}/phrases-pool.json`

Each item: `pending` | `approved` | `rejected`, sources `wikivoyage` | `ai` | `manual`.

## 1. Automatic seeding (CLI)

```bash
# Wikivoyage phrasebook → pending items
npm run content:seed:wv -- ja-jp

# Optional: AI suggestions (needs OPENAI_API_KEY)
npm run content:seed:ai -- ja-jp train 12
```

Raw Wikivoyage snapshots: `content/open/{corridorId}/wv-raw/`.

## 2. Human filter & manual inject (API)

Set in `.env.local`:

```env
CONTENT_INJECT_SECRET=your-long-random-secret
```

### List / filter pool

```bash
curl -s -H "Authorization: Bearer $CONTENT_INJECT_SECRET" \
  "http://localhost:43123/api/content/pool?corridorId=ja-jp&status=pending&limit=20"
```

### Approve / reject

```bash
curl -s -X PATCH -H "Authorization: Bearer $CONTENT_INJECT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"corridorId":"ja-jp","updates":[{"id":"ja-jp-pool-xxxxxxxx","status":"approved","meaningId":"Permisi"}]}' \
  http://localhost:43123/api/content/pool
```

### Manual inject (defaults to approved)

```bash
curl -s -X POST -H "Authorization: Bearer $CONTENT_INJECT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "corridorId": "ja-jp",
    "phrases": [{
      "target": "すみません",
      "romanization": "sumimasen",
      "meaningEn": "Excuse me",
      "meaningId": "Permisi / maaf",
      "situationHints": ["basics", "airport"]
    }]
  }' \
  http://localhost:43123/api/content/inject
```

Set `"approve": false` to insert as `pending`.

**Note:** API writes to the repo `content/` folder. Use on local dev or a trusted host with a persistent disk; serverless deploys are read-only.

## Lesson manifests (human assembly)

Pools live under `content/conversations/`, `content/mini-lessons/`, `content/phrase-lists/`, `content/fill-blank/`, `content/flashcard-decks/`.  
Lessons reference them from `content/lessons/{corridorId}/{lessonId}.json`.

```bash
# Merge hand-authored basics phrases (stable ids) into id-id pool
npm run content:seed:basics-phrases

# Compile all manifests for a corridor → runtime pack
npm run content:compile:pack -- id-id

# Or one lesson
npm run content:compile:lesson -- id-id id-id-basics
```

Import phrases from CSV:

```bash
npm run content:import:phrases -- id-id path/to/phrases.csv
```

## Starter packs (legacy dev shortcut)

Build **basics** + **emergency** from templates + phrase pool only:

```bash
npm run content:build:starter
```

Prefer **compile:pack** when lesson manifests exist.

Output: `content/packs/{corridorId}.json` — loaded by the lesson player.

## Master dialogues (EN → translate later)

```bash
npm run content:validate:dialogue
```

Masters live in `content/dialogue-master/en/`. Per-corridor translations go in `content/dialogue-master/translations/{corridorId}/`.

## Next steps (not implemented yet)

- `content:translate-dialogue` — master EN → draft translation JSON
- `content:compile:dialogue` — master + translation → merge into `content/packs/`
- `content:validate` / `content:derive` — pack + cheatsheet
