/**
 * Example lesson: one situation (`basics`), multiple airport vignettes.
 * Flow per vignette: optional culture → scenario → phrases → quiz.
 *
 * Learner UI language: Indonesian (`id`) + English (`en`) in meanings.
 */
import type { LessonContent } from "@/lib/lesson-content-types";
import { legacyLessonUnitOrder } from "@/lib/lesson-content-types";

const corridorId = "ja-jp";

export const jaJpBasicsAirportLesson: LessonContent = {
  id: `${corridorId}-basics`,
  corridorId,
  situation: "basics",
  order: 1,
  title: {
    id: "Jam pertama di bandara",
    en: "First hour at the airport",
  },
  free: true,
  unitOrder: legacyLessonUnitOrder,
  vignettes: [
    {
      id: `${corridorId}-basics-v-luggage`,
      title: {
        id: "Bagasi hilang / tertinggal",
        en: "Lost or missing luggage",
      },
      culture: [
        {
          id: `${corridorId}-basics-culture-1`,
          title: {
            id: "Sopan dulu, grammar belakangan",
            en: "Politeness first, grammar second",
          },
          body: {
            id: "Di bandara Jepang, nada halus dan sedikit membungkuk lebih penting daripada kalimat sempurna. Mulai dengan permisi dan terima kasih.",
            en: "At Japanese airports, a polite tone and a small bow matter more than perfect grammar. Lead with excuse me and thank you.",
          },
          do: [
            {
              id: "Ucapkan sumimasen sebelum bertanya",
              en: "Say sumimasen before asking something",
            },
          ],
          avoid: [
            {
              id: "Berbicara terlalu keras di loket",
              en: "Speaking loudly at counters",
            },
          ],
        },
      ],
      scenario: {
        id: "Koper kamu tidak muncul di carousel. Kamu ke meja informasi bagasi.",
        en: "Your bag never shows on the carousel. You go to the baggage service desk.",
      },
      phrases: [
        {
          id: `${corridorId}-lug-1`,
          target: "すみません、荷物が見つかりません",
          romanization: "Sumimasen, nimotsu ga mitsukarimasen",
          meaning: {
            id: "Permisi, bagasi saya tidak ketemu.",
            en: "Excuse me, I can't find my luggage.",
          },
        },
        {
          id: `${corridorId}-lug-2`,
          target: "これは私の荷物ですか",
          romanization: "Kore wa watashi no nimotsu desu ka",
          meaning: {
            id: "Apakah ini bagasi saya?",
            en: "Is this my luggage?",
          },
        },
      ],
      quiz: [
        {
          id: `${corridorId}-lug-q1`,
          type: "pick-phrase",
          prompt: {
            id: "Pilih frasa untuk bilang bagasi tidak ketemu.",
            en: "Pick the phrase for missing luggage.",
          },
          phraseIds: [`${corridorId}-lug-1`, `${corridorId}-lug-2`],
          correctPhraseId: `${corridorId}-lug-1`,
        },
      ],
    },
    {
      id: `${corridorId}-basics-v-taxi`,
      title: {
        id: "Naik taksi resmi",
        en: "Official taxi",
      },
      scenario: {
        id: "Kamu keluar ke antrian taksi. Mau ke hotel di pusat kota.",
        en: "You join the official taxi queue. You need to reach your hotel downtown.",
      },
      phrases: [
        {
          id: `${corridorId}-taxi-1`,
          target: "タクシー乗り場はどこですか",
          romanization: "Takushii noriba wa doko desu ka",
          meaning: {
            id: "Di mana lokasi naik taksi?",
            en: "Where is the taxi stand?",
          },
        },
        {
          id: `${corridorId}-taxi-2`,
          target: "この住所までお願いします",
          romanization: "Kono jushou made onegaishimasu",
          meaning: {
            id: "Tolong ke alamat ini.",
            en: "To this address, please.",
          },
        },
      ],
      quiz: [
        {
          id: `${corridorId}-taxi-q1`,
          type: "mcq",
          prompt: {
            id: "Mau tanya lokasi taksi — frasa mana?",
            en: "You want the taxi stand — which phrase?",
          },
          options: [
            {
              id: "タクシー乗り場はどこですか",
              en: "タクシー乗り場はどこですか",
            },
            {
              id: "この住所までお願いします",
              en: "この住所までお願いします",
            },
          ],
          correctIndex: 0,
        },
      ],
    },
    {
      id: `${corridorId}-basics-v-city`,
      title: {
        id: "Ke pusat kota (kereta / bus)",
        en: "Into the city (train / bus)",
      },
      scenario: {
        id: "Kamu cari cara termurah ke Shinjuku. Petunjuk pakai bahasa Jepang.",
        en: "You look for the cheapest way to Shinjuku. Signs are in Japanese.",
      },
      phrases: [
        {
          id: `${corridorId}-city-1`,
          target: "新宿へはどう行けばいいですか",
          romanization: "Shinjuku e wa dou ikeba ii desu ka",
          meaning: {
            id: "Bagaimana cara ke Shinjuku?",
            en: "How do I get to Shinjuku?",
          },
        },
        {
          id: `${corridorId}-city-2`,
          target: "一番安いのはどれですか",
          romanization: "Ichiban yasui no wa dore desu ka",
          meaning: {
            id: "Yang paling murah yang mana?",
            en: "Which is the cheapest option?",
          },
        },
      ],
      quiz: [
        {
          id: `${corridorId}-city-q1`,
          type: "pick-phrase",
          prompt: {
            id: "Pilih frasa untuk tanya arah ke Shinjuku.",
            en: "Pick the phrase to ask how to get to Shinjuku.",
          },
          phraseIds: [`${corridorId}-city-1`, `${corridorId}-city-2`],
          correctPhraseId: `${corridorId}-city-1`,
        },
      ],
    },
  ],
};
