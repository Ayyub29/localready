import { buildMcqOptions } from "@/lib/content/mcq-options";
import type { FillBlankQuestion } from "@/lib/lesson-content-types";
import type { StoredFillBlankQuestion } from "@/lib/content/stored-fill-blank-types";

export function compileFillBlankQuestion(
  q: StoredFillBlankQuestion,
  allQuestions: StoredFillBlankQuestion[],
): FillBlankQuestion {
  const correct = q.answers[0]?.trim() ?? "";
  const fromOthers = allQuestions
    .flatMap((item) => item.answers)
    .map((a) => a.trim())
    .filter((a) => a && a.toLowerCase() !== correct.toLowerCase());
  const distractors = q.distractors?.length
    ? q.distractors
    : [...new Set(fromOthers)];

  const { options, correctOptionId } = buildMcqOptions(
    correct,
    distractors,
    q.id,
  );

  return {
    id: q.id,
    instruction: q.instruction,
    before: q.before,
    after: q.after,
    answers: q.answers,
    hint: q.hint,
    phraseId: q.phraseId,
    choices: options,
    correctChoiceId: correctOptionId,
  };
}
