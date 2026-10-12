import type { ConversationTurn, Phrase } from "../../src/lib/lesson-content-types";

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

export function greetingsConversation(
  vignetteId: string,
  phrases: Phrase[],
): ConversationTurn[] {
  const [hi, howAre, fine, nameAsk, nameAns, niceMeet] = phrases;
  const turns: ConversationTurn[] = [
    {
      id: `${vignetteId}-t0`,
      role: "narrator",
      line: {
        en: "You walk up to the hotel front desk. The staff member looks up and smiles.",
        id: "Kamu mendekati resepsionis hotel. Staf melihatmu dan tersenyum.",
      },
    },
  ];
  if (hi) {
    turns.push(speechTurn(`${vignetteId}-t1`, "local", STAFF, hi));
    turns.push(speechTurn(`${vignetteId}-t2`, "traveler", YOU, hi));
  }
  if (howAre) {
    turns.push(speechTurn(`${vignetteId}-t3`, "local", STAFF, howAre));
  }
  if (fine) {
    turns.push(speechTurn(`${vignetteId}-t4`, "traveler", YOU, fine));
  }
  if (nameAsk) {
    turns.push(speechTurn(`${vignetteId}-t5`, "local", STAFF, nameAsk));
  }
  if (nameAns) {
    turns.push(speechTurn(`${vignetteId}-t6`, "traveler", YOU, nameAns));
  }
  if (niceMeet) {
    turns.push(speechTurn(`${vignetteId}-t7`, "traveler", YOU, niceMeet));
  }
  return turns;
}

export function politeConversation(
  vignetteId: string,
  phrases: Phrase[],
): ConversationTurn[] {
  const [excuse, thanks, sorry, please, yes] = phrases;
  return [
    {
      id: `${vignetteId}-t0`,
      role: "narrator",
      line: {
        en: "The shop is crowded. You gently get the clerk's attention.",
        id: "Toko sedang ramai. Kamu dengan sopan menarik perhatian pegawai.",
      },
    },
    ...(excuse
      ? [speechTurn(`${vignetteId}-t1`, "traveler", YOU, excuse)]
      : []),
    {
      id: `${vignetteId}-t2`,
      role: "local",
      label: STAFF,
      line: { en: "Yes? How can I help?", id: "Ya? Ada yang bisa dibantu?" },
      target: undefined,
    },
    ...(thanks ? [speechTurn(`${vignetteId}-t3`, "traveler", YOU, thanks)] : []),
    ...(sorry ? [speechTurn(`${vignetteId}-t4`, "traveler", YOU, sorry)] : []),
    ...(please ? [speechTurn(`${vignetteId}-t5`, "traveler", YOU, please)] : []),
    ...(yes ? [speechTurn(`${vignetteId}-t6`, "traveler", YOU, yes)] : []),
  ];
}

export function emergencyConversation(
  vignetteId: string,
  phrases: Phrase[],
): ConversationTurn[] {
  const [help, lost, sick, doctor, phone] = phrases;
  const turns: ConversationTurn[] = [
    {
      id: `${vignetteId}-t0`,
      role: "narrator",
      line: {
        en: "You feel stuck and need help from someone on the street.",
        id: "Kamu merasa kesulitan dan butuh bantuan orang di jalan.",
      },
    },
  ];
  if (help) turns.push(speechTurn(`${vignetteId}-t1`, "traveler", YOU, help));
  if (help) {
    turns.push({
      id: `${vignetteId}-t2`,
      role: "local",
      label: PASSERBY,
      line: { en: "Are you okay? What's wrong?", id: "Kamu oke? Ada apa?" },
    });
  }
  if (lost) turns.push(speechTurn(`${vignetteId}-t3`, "traveler", YOU, lost));
  if (sick) turns.push(speechTurn(`${vignetteId}-t4`, "traveler", YOU, sick));
  if (doctor) turns.push(speechTurn(`${vignetteId}-t5`, "traveler", YOU, doctor));
  if (phone) turns.push(speechTurn(`${vignetteId}-t6`, "traveler", YOU, phone));
  return turns;
}
