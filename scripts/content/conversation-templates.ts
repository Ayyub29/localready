import type { ConversationTurn, Phrase, VignetteConversation } from "../../src/lib/lesson-content-types";
import type { SituationKey } from "../../src/lib/types";

const YOU = { en: "You", id: "Kamu" };
const STAFF = { en: "Staff", id: "Staf" };
const PASSERBY = { en: "Someone nearby", id: "Orang di sekitar" };

function speechTurn(
  id: string,
  role: "local" | "traveler",
  label: { en: string; id: string },
  phrase: Phrase,
): ConversationTurn {
  return {
    id,
    role,
    label,
    target: phrase.target,
    romanization: phrase.romanization,
    line: phrase.meaning,
    phraseId: phrase.id,
  };
}

export function greetingsScene(
  convId: string,
  situation: SituationKey,
  phrases: Phrase[],
): VignetteConversation {
  const [hi, howAre, fine, nameAsk, nameAns, niceMeet] = phrases;
  const turns: ConversationTurn[] = [];
  if (hi) {
    turns.push(speechTurn(`${convId}-t1`, "local", STAFF, hi));
    turns.push(speechTurn(`${convId}-t2`, "traveler", YOU, hi));
  }
  if (howAre) {
    turns.push(speechTurn(`${convId}-t3`, "local", STAFF, howAre));
  }
  if (fine) {
    turns.push(speechTurn(`${convId}-t4`, "traveler", YOU, fine));
  }
  if (nameAsk) {
    turns.push(speechTurn(`${convId}-t5`, "local", STAFF, nameAsk));
  }
  if (nameAns) {
    turns.push(speechTurn(`${convId}-t6`, "traveler", YOU, nameAns));
  }
  if (niceMeet) {
    turns.push(speechTurn(`${convId}-t7`, "traveler", YOU, niceMeet));
  }
  return {
    id: convId,
    situation,
    title: { en: "Say hello at the desk", id: "Sapaan di meja resepsionis" },
    description: {
      en: "You walk up to the hotel front desk. The staff member looks up and smiles.",
      id: "Kamu mendekati resepsionis hotel. Staf melihatmu dan tersenyum.",
    },
    turns,
  };
}

export function politeScene(
  convId: string,
  situation: SituationKey,
  phrases: Phrase[],
): VignetteConversation {
  const [excuse, thanks, sorry, please, yes] = phrases;
  const turns: ConversationTurn[] = [
    ...(excuse ? [speechTurn(`${convId}-t1`, "traveler", YOU, excuse)] : []),
    {
      id: `${convId}-t2`,
      role: "local",
      label: STAFF,
      line: { en: "Yes? How can I help?", id: "Ya? Ada yang bisa dibantu?" },
    },
    ...(thanks ? [speechTurn(`${convId}-t3`, "traveler", YOU, thanks)] : []),
    ...(sorry ? [speechTurn(`${convId}-t4`, "traveler", YOU, sorry)] : []),
    ...(please ? [speechTurn(`${convId}-t5`, "traveler", YOU, please)] : []),
    ...(yes ? [speechTurn(`${convId}-t6`, "traveler", YOU, yes)] : []),
  ];
  return {
    id: convId,
    situation,
    title: { en: "Get attention in a shop", id: "Minta perhatian di toko" },
    description: {
      en: "The shop is crowded. You gently get the clerk's attention.",
      id: "Toko sedang ramai. Kamu dengan sopan menarik perhatian pegawai.",
    },
    turns,
  };
}

export function emergencyScene(
  convId: string,
  situation: SituationKey,
  phrases: Phrase[],
): VignetteConversation {
  const [help, lost, sick, doctor, phone] = phrases;
  const turns: ConversationTurn[] = [];
  if (help) turns.push(speechTurn(`${convId}-t1`, "traveler", YOU, help));
  if (help) {
    turns.push({
      id: `${convId}-t2`,
      role: "local",
      label: PASSERBY,
      line: { en: "Are you okay? What's wrong?", id: "Kamu oke? Ada apa?" },
    });
  }
  if (lost) turns.push(speechTurn(`${convId}-t3`, "traveler", YOU, lost));
  if (sick) turns.push(speechTurn(`${convId}-t4`, "traveler", YOU, sick));
  if (doctor) turns.push(speechTurn(`${convId}-t5`, "traveler", YOU, doctor));
  if (phone) turns.push(speechTurn(`${convId}-t6`, "traveler", YOU, phone));
  return {
    id: convId,
    situation,
    title: { en: "Ask for help", id: "Minta bantuan" },
    description: {
      en: "Something went wrong and you need help from someone nearby.",
      id: "Ada masalah dan kamu butuh bantuan orang di sekitar.",
    },
    turns,
  };
}
