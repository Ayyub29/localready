# Runtime pack — conversational vignettes

Shipped content lives in **`content/packs/{corridorId}.json`**. The app loads this on the server only (`loadCorridorPack`).

## Shape (runtime)

```
CorridorContentPack
  lessons[]
    vignettes[]
      culture?[]          # optional cards
      conversations[]     # one vignette → many dialogues
        id
        title?            # short label (en + id)
        description       # scene setup (en + id) — shown before turns
        turns[]           # chat lines (local / traveler / narrator rare)
      conversations[].turns[]
        role: narrator | local | traveler
        target?, romanization?, line (gloss), phraseId?
  emergencyPhrases[]      # derived slice for cheatsheet (from emergency lesson)
```

**Not in runtime packs:** `quiz`, per-vignette `phrases[]` (phrases are implied by `turns` + `phraseId`; cheatsheet uses `emergencyPhrases` or future derive script).

## Player order (per vignette)

1. Each **culture** card (if any)  
2. For each **conversation**: **description** → **turn** → **turn** → …  
3. Next vignette  

## Authoring (Git, not runtime)

| Layer | Path |
|-------|------|
| Phrase pool | `content/open/{corridor}/phrases-pool.json` |
| EN dialogue masters | `content/dialogue-master/en/*.json` |
| Translations | `content/dialogue-master/translations/{corridor}/` |
| **Compiled ship** | `content/packs/{corridor}.json` |

`npm run content:build:starter` — pool + templates → pack (dev).  
`content:compile:dialogue` (planned) — master + translation → merge into pack.

Types: `src/lib/lesson-content-types.ts` (`VignetteConversation`, `ConversationTurn`).
