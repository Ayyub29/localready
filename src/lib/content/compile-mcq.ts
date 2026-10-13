import { conversationUtterance } from "@/lib/content/conversation-utterance";
import { buildMcqOptions } from "@/lib/content/mcq-options";
import type {
  ConversationTurn,
  FillBlankQuestion,
  VignetteConversation,
} from "@/lib/lesson-content-types";
import type { StoredFillBlankQuestion } from "@/lib/content/stored-fill-blank-types";
import type { CorridorId } from "@/lib/types";

function travelerUtterances(
  conversations: VignetteConversation[],
  corridorId: CorridorId,
): string[] {
  const out: string[] = [];
  for (const conv of conversations) {
    for (const turn of conv.turns) {
      if (turn.role !== "traveler") continue;
      const u = conversationUtterance(turn, corridorId);
      if (u) out.push(u);
    }
  }
  return out;
}

export function enrichConversationTravelerMcq(
  conversation: VignetteConversation,
  siblingConversations: VignetteConversation[],
  corridorId: CorridorId,
): VignetteConversation {
  const pool = travelerUtterances(
    [conversation, ...siblingConversations],
    corridorId,
  );

  const turns = conversation.turns.map((turn) => {
    if (turn.role !== "traveler") return turn;
    const correct = conversationUtterance(turn, corridorId);
    if (!correct) return turn;
    const { options, correctOptionId } = buildMcqOptions(
      correct,
      pool,
      turn.id,
    );
    return {
      ...turn,
      choices: options,
      correctChoiceId: correctOptionId,
    };
  });

  return { ...conversation, turns };
}

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

export function isTravelerMcqTurn(turn: ConversationTurn): boolean {
  return (
    turn.role === "traveler" &&
    (turn.choices?.length ?? 0) > 0 &&
    Boolean(turn.correctChoiceId)
  );
}
