import type { ConversationRole, ConversationTurn, VignetteConversation } from "@/lib/lesson-content-types";
import type { CorridorId, LocalizedString, SituationKey } from "@/lib/types";

/**
 * MultiWOZ-style master dialogue (English source of truth).
 * `system` ≈ local staff; `user` ≈ traveler. Translate per corridor later.
 */
export type MasterSpeaker = "user" | "system";

export type DialogueAct =
  | "greet"
  | "ask"
  | "inform"
  | "request"
  | "confirm"
  | "deny"
  | "thank"
  | "goodbye"
  | "narrate";

export type MasterDialogueTurn = {
  id: string;
  speaker: MasterSpeaker;
  /** English line; may include slot placeholders like {hotel-name}. */
  utterance: { en: string };
  acts?: DialogueAct[];
  /** Slot keys this turn fills or requests (MultiWOZ-style, simplified). */
  slots?: Record<string, string>;
};

export type MasterDialogue = {
  schemaVersion: 1;
  id: string;
  /** MultiWOZ domain name for reference (hotel, train, taxi, …). */
  multiwozDomain: string;
  /** LocalReady lesson situation key this vignette belongs to. */
  situation: SituationKey;
  title: { en: string };
  /** Optional slot names expected in this scenario (for writers / translators). */
  slotSchema?: string[];
  turns: MasterDialogueTurn[];
};

export type MasterDialogueTranslationTurn = {
  masterTurnId: string;
  target?: string;
  romanization?: string;
  /** Gloss for learners; `en` often matches master, `id` from review. */
  line: LocalizedString;
  phraseId?: string;
};

export type MasterDialogueTranslation = {
  schemaVersion: 1;
  masterId: string;
  corridorId: CorridorId;
  turns: MasterDialogueTranslationTurn[];
};

export function masterSpeakerToRole(speaker: MasterSpeaker): ConversationRole {
  return speaker === "user" ? "traveler" : "local";
}

/** Merge master + corridor translation into player `conversation` turns. */
export function compileConversation(
  master: MasterDialogue,
  translation: MasterDialogueTranslation,
  labels: { local: LocalizedString; traveler: LocalizedString },
): ConversationTurn[] {
  const byId = new Map(translation.turns.map((t) => [t.masterTurnId, t]));

  return master.turns.map((mt) => {
    const tr = byId.get(mt.id);
    const role = masterSpeakerToRole(mt.speaker);
    const line: LocalizedString = tr?.line ?? {
      en: mt.utterance.en,
      id: mt.utterance.en,
    };

    if (role === "traveler" || role === "local") {
      return {
        id: `${master.id}-${mt.id}`,
        role,
        label: role === "traveler" ? labels.traveler : labels.local,
        target: tr?.target,
        romanization: tr?.romanization,
        line,
        phraseId: tr?.phraseId,
      };
    }

    return {
      id: `${master.id}-${mt.id}`,
      role: "narrator",
      line,
    };
  });
}

/** Master + translation → runtime `VignetteConversation` (no quiz). */
export function compileVignetteConversation(
  master: MasterDialogue,
  translation: MasterDialogueTranslation,
  description: LocalizedString,
  labels: { local: LocalizedString; traveler: LocalizedString },
): VignetteConversation {
  const turns = compileConversation(master, translation, labels).filter(
    (t) => t.role !== "narrator",
  );
  return {
    id: master.id,
    title: { en: master.title.en, id: master.title.en },
    description,
    turns,
  };
}
