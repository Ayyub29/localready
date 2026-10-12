import type {
  ConversationTurn,
  LessonContent,
  Phrase,
  VignetteConversation,
} from "@/lib/lesson-content-types";

function turnToPhrase(turn: ConversationTurn): Phrase | null {
  if (!turn.target?.trim()) return null;
  return {
    id: turn.phraseId ?? turn.id,
    target: turn.target,
    romanization: turn.romanization,
    meaning: turn.line,
  };
}

export function phrasesFromConversation(
  conversation: VignetteConversation,
): Phrase[] {
  const out: Phrase[] = [];
  const seen = new Set<string>();
  for (const turn of conversation.turns) {
    if (turn.role !== "traveler" && turn.role !== "local") continue;
    const phrase = turnToPhrase(turn);
    if (!phrase || seen.has(phrase.id)) continue;
    seen.add(phrase.id);
    out.push(phrase);
  }
  return out;
}

export function phrasesFromLesson(lesson: LessonContent): Phrase[] {
  const out: Phrase[] = [];
  const seen = new Set<string>();
  for (const vignette of lesson.vignettes) {
    for (const conv of vignette.conversations ?? []) {
      for (const p of phrasesFromConversation(conv)) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        out.push(p);
      }
    }
    for (const p of vignette.phrases ?? []) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}
