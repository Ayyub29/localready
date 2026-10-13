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
        situation         # when/where (basics, hotel, emergency, …) — required
        title?            # short label (en + id)
        description       # what is happening in this scene (en + id)
        turns[]           # chat lines (local / traveler / narrator rare)
      miniLessons?[]      # short bites; may anchor after a turn id
      phraseLists?[]      # ordered phrase review cards
      playback?[]         # unit order: conversation | miniLesson | phraseList
      conversations[].turns[]
        role: narrator | local | traveler
        target?, romanization?, line (gloss), phraseId?
  emergencyPhrases[]      # derived slice for cheatsheet (from emergency lesson)
```

**Legacy (avoid):** per-vignette `phrases[]` without playback. **Quizzes:** `fillBlankQuizzes[]`, `flashcardDecks[]` via lesson manifest refs.

## Player order (per vignette)

1. Each **culture** card (if any)  
2. Walk **playback** (or legacy: each **conversation** in array order):  
   - **conversation**: **description** → **turn** → … (insert **mini lesson** after anchored turn)  
   - **miniLesson** (standalone): intro → examples  
   - **phraseList**: one step per phrase  
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
