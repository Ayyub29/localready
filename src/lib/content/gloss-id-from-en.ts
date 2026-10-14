/**
 * Bahasa Indonesia learner glosses for common English phrasebook lines.
 * Used when pool/pack rows copied meaningEn into line.id (starter packs).
 */
const EN_TO_ID: Record<string, string> = {
  "Good afternoon.": "Selamat siang.",
  "How are you?": "Apa kabar?",
  'What\'s your name? (lit. "Your name is...")':
    'Siapa nama Anda? (secara harfiah: "Nama Anda...")',
  "My name is ... .": "Nama saya ... .",
  "Nice to meet you. (formal)": "Senang bertemu dengan Anda. (formal)",
  "Fine, thank you.": "Baik, terima kasih.",
  "Please. (request)": "Tolong. (permintaan)",
  "Please. (offer)": "Silakan. (menawarkan)",
  "Thank you very much. (formal)": "Terima kasih banyak. (formal)",
  "Are you okay? What's wrong?": "Apakah Anda baik-baik saja? Ada apa?",
  "I need your help.": "Saya butuh bantuan Anda.",
  "I'll call the police.": "Saya akan menelepon polisi.",
  "I'm lost.": "Saya tersesat.",
  "It's an emergency.": "Ini darurat.",
  "Police!": "Polisi!",
  "Yes? How can I help?": "Ya? Ada yang bisa saya bantu?",
};

export function glossIdFromMeaningEn(meaningEn: string): string | undefined {
  const key = meaningEn.trim();
  return EN_TO_ID[key];
}

/** Bahasa Indonesia gloss for a turn line, even when pack JSON still mirrors English into `id`. */
export function learnerGlossId(line: { en: string; id: string }): string {
  const en = line.en?.trim() ?? "";
  const rawId = line.id?.trim() ?? "";
  if (rawId && rawId !== en) return rawId;
  return glossIdFromMeaningEn(en) ?? rawId ?? en;
}
