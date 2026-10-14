import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { StoredConversation } from "@/lib/content/stored-conversation-types";
import type { CorridorId, SituationKey } from "@/lib/types";

export async function loadStoredConversationsForLesson(
  corridorId: CorridorId,
  situation: SituationKey,
): Promise<StoredConversation[]> {
  const dir = path.join(process.cwd(), "content", "conversations", corridorId);
  try {
    const files = await readdir(dir);
    const out: StoredConversation[] = [];
    for (const file of files) {
      if (!file.endsWith(".json") || file.startsWith("_")) continue;
      const raw = await readFile(path.join(dir, file), "utf8");
      const doc = JSON.parse(raw) as StoredConversation;
      if (doc.situation === situation && doc.corridorId === corridorId) {
        out.push(doc);
      }
    }
    return out;
  } catch {
    return [];
  }
}
