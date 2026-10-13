import type { StoredLessonManifest } from "@/lib/content/stored-lesson-manifest-types";
import type { StoredMiniLesson } from "@/lib/content/stored-mini-lesson-types";
import { storedToVignetteConversation } from "@/lib/content/stored-conversation-types";
import type {
  LessonContent,
  LessonVignette,
  MiniLesson,
  VignettePlaybackItem,
  VignettePhraseList,
} from "@/lib/lesson-content-types";
import {
  loadStoredConversationsMap,
  loadStoredMiniLessonsMap,
  loadStoredPhraseListsMap,
} from "@/lib/content/load-pool-files";
import { buildPhraseResolver } from "@/lib/content/resolve-phrase-id";

export type CompileLessonResult = {
  lesson: LessonContent;
  warnings: string[];
};

function compileMiniLesson(
  stored: StoredMiniLesson,
  anchor?: { conversationRef: string; afterTurnId: string },
): MiniLesson {
  return {
    id: stored.id,
    topic: stored.topic,
    description: stored.description,
    words: stored.words.map((w) => ({
      id: w.id,
      target: w.target,
      romanization: w.romanization,
      meaning: w.meaning,
      phraseId: w.phraseId,
      usageNote: w.usageNote,
    })),
    anchorConversationId: anchor?.conversationRef,
    insertAfterTurnId: anchor?.afterTurnId,
  };
}

export async function compileLessonManifest(
  manifest: StoredLessonManifest,
): Promise<CompileLessonResult> {
  const { corridorId } = manifest;
  const warnings: string[] = [];

  const conversations = await loadStoredConversationsMap(corridorId);
  const miniLessons = await loadStoredMiniLessonsMap(corridorId);
  const phraseLists = await loadStoredPhraseListsMap(corridorId);
  const resolvePhrase = await buildPhraseResolver(corridorId, conversations);

  const vignettes: LessonVignette[] = manifest.vignettes.map((vm) => {
    const vignetteConversations: ReturnType<typeof storedToVignetteConversation>[] =
      [];
    const vignetteMiniLessons: MiniLesson[] = [];
    const vignettePhraseLists: VignettePhraseList[] = [];
    const playback: VignettePlaybackItem[] = [];

    const conversationIds = new Set<string>();

    for (const item of vm.sequence) {
      if (item.kind === "miniLesson" && item.anchor) {
        const ml = miniLessons.get(item.ref);
        if (!ml) {
          warnings.push(`Missing mini lesson: ${item.ref}`);
          continue;
        }
        vignetteMiniLessons.push(
          compileMiniLesson(ml, {
            conversationRef: item.anchor.conversationRef,
            afterTurnId: item.anchor.afterTurnId,
          }),
        );
        continue;
      }

      if (item.kind === "conversation") {
        const stored = conversations.get(item.ref);
        if (!stored) {
          warnings.push(`Missing conversation: ${item.ref}`);
          continue;
        }
        if (!conversationIds.has(item.ref)) {
          vignetteConversations.push(storedToVignetteConversation(stored));
          conversationIds.add(item.ref);
        }
        playback.push({ kind: "conversation", conversationId: item.ref });
        continue;
      }

      if (item.kind === "miniLesson") {
        const ml = miniLessons.get(item.ref);
        if (!ml) {
          warnings.push(`Missing mini lesson: ${item.ref}`);
          continue;
        }
        vignetteMiniLessons.push(compileMiniLesson(ml));
        playback.push({ kind: "miniLesson", miniLessonId: item.ref });
        continue;
      }

      if (item.kind === "phraseList") {
        const pl = phraseLists.get(item.ref);
        if (!pl) {
          warnings.push(`Missing phrase list: ${item.ref}`);
          continue;
        }
        const phrases = [];
        for (const pid of pl.phraseIds) {
          const p = resolvePhrase(pid);
          if (!p) {
            warnings.push(`Unresolved phrase id ${pid} in list ${item.ref}`);
            continue;
          }
          phrases.push({ ...p, id: pid });
        }
        vignettePhraseLists.push({
          id: pl.id,
          title: pl.title,
          phrases,
        });
        playback.push({ kind: "phraseList", phraseListId: pl.id });
      }
    }

    return {
      id: vm.id,
      title: vm.title,
      culture: vm.culture,
      conversations: vignetteConversations,
      miniLessons: vignetteMiniLessons.length ? vignetteMiniLessons : undefined,
      phraseLists: vignettePhraseLists.length ? vignettePhraseLists : undefined,
      playback: playback.length ? playback : undefined,
    };
  });

  const lesson: LessonContent = {
    id: manifest.id,
    corridorId: manifest.corridorId,
    situation: manifest.situation,
    order: manifest.order,
    title: manifest.title,
    free: manifest.free,
    vignettes,
  };

  return { lesson, warnings };
}
