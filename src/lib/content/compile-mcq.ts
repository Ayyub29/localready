import { buildMcqOptions } from "@/lib/content/mcq-options";
import type { FillBlankQuestion, Phrase } from "@/lib/lesson-content-types";
import type { StoredFillBlankQuestion } from "@/lib/content/stored-fill-blank-types";

function phraseIdsFromQuestions(questions: StoredFillBlankQuestion[]): string[] {
  const ids = new Set<string>();
  for (const q of questions) {
    ids.add(q.correctPhraseId);
    q.distractorPhraseIds?.forEach((id) => ids.add(id));
  }
  return [...ids];
}

export function compileFillBlankQuestion(
  q: StoredFillBlankQuestion,
  resolvePhrase: (phraseId: string) => Phrase | null,
  allQuestions: StoredFillBlankQuestion[],
): FillBlankQuestion | null {
  const correctPhrase = resolvePhrase(q.correctPhraseId);
  if (!correctPhrase?.target?.trim()) {
    return null;
  }

  const poolIds = phraseIdsFromQuestions(allQuestions);
  const distractorIds =
    q.distractorPhraseIds?.length
      ? q.distractorPhraseIds.filter((id) => id !== q.correctPhraseId)
      : poolIds.filter((id) => id !== q.correctPhraseId);

  const distractorLabels: string[] = [];
  for (const id of distractorIds) {
    const p = resolvePhrase(id);
    if (p?.target?.trim()) distractorLabels.push(p.target.trim());
  }

  const { options, correctOptionId } = buildMcqOptions(
    correctPhrase.target.trim(),
    distractorLabels,
    q.id,
  );

  let cueGloss: FillBlankQuestion["cueGloss"];
  if (q.cuePhraseId) {
    const cuePhrase = resolvePhrase(q.cuePhraseId);
    if (cuePhrase) cueGloss = cuePhrase.meaning;
  }

  return {
    id: q.id,
    kind: q.kind,
    prompt: q.prompt,
    cueTarget: q.cueTarget,
    cueGloss,
    cueSpeaker: q.cueSpeaker,
    hint: q.hint,
    correctPhraseId: q.correctPhraseId,
    choices: options,
    correctChoiceId: correctOptionId,
  };
}
