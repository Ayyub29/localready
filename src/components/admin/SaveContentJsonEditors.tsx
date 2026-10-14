"use client";

import { AdminJsonSavePanel } from "@/components/admin/AdminJsonSavePanel";
import {
  adminSaveFillBlank,
  adminSaveFlashcardDeck,
  adminSaveMiniLesson,
  adminSavePhraseList,
} from "@/lib/admin/server-actions";
import type { StoredFillBlankQuiz } from "@/lib/content/stored-fill-blank-types";
import type { StoredFlashcardDeck } from "@/lib/content/stored-flashcard-deck-types";
import type { StoredMiniLesson } from "@/lib/content/stored-mini-lesson-types";
import type { StoredPhraseList } from "@/lib/content/stored-phrase-list-types";

type JsonEditorProps = {
  corridorId: string;
  title: string;
  initialJson: string;
};

export function SaveMiniLessonJson({ corridorId, title, initialJson }: JsonEditorProps) {
  return (
    <AdminJsonSavePanel
      title={title}
      initialJson={initialJson}
      onSave={async (parsed) => {
        await adminSaveMiniLesson(corridorId, parsed as StoredMiniLesson);
      }}
    />
  );
}

export function SaveFillBlankJson({ corridorId, title, initialJson }: JsonEditorProps) {
  return (
    <AdminJsonSavePanel
      title={title}
      initialJson={initialJson}
      onSave={async (parsed) => {
        await adminSaveFillBlank(corridorId, parsed as StoredFillBlankQuiz);
      }}
    />
  );
}

export function SavePhraseListJson({ corridorId, title, initialJson }: JsonEditorProps) {
  return (
    <AdminJsonSavePanel
      title={title}
      initialJson={initialJson}
      onSave={async (parsed) => {
        await adminSavePhraseList(corridorId, parsed as StoredPhraseList);
      }}
    />
  );
}

export function SaveFlashcardDeckJson({ corridorId, title, initialJson }: JsonEditorProps) {
  return (
    <AdminJsonSavePanel
      title={title}
      initialJson={initialJson}
      onSave={async (parsed) => {
        await adminSaveFlashcardDeck(corridorId, parsed as StoredFlashcardDeck);
      }}
    />
  );
}
