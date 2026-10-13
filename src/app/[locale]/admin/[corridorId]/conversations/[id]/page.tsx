import { notFound } from "next/navigation";
import { AdminConversationEditor } from "@/components/admin/AdminConversationEditor";
import { isCorridorId } from "@/data/catalog";
import { readContentJson } from "@/lib/admin/content-io";
import type { StoredConversation } from "@/lib/content/stored-conversation-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; id: string }> };

function newConversation(corridorId: CorridorId, id: string): StoredConversation {
  return {
    schemaVersion: 1,
    id,
    corridorId,
    situation: "basics",
    source: "manual",
    title: { en: "New conversation", id: "Percakapan baru" },
    description: { en: "", id: "" },
    turns: [],
    createdAt: new Date().toISOString(),
  };
}

export default async function AdminConversationEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, id } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  let doc: StoredConversation | null = null;
  if (id !== "new") {
    doc = await readContentJson<StoredConversation>(c, "conversations", id);
    if (!doc) notFound();
  } else {
    doc = newConversation(c, `${c}-conversation-${Date.now()}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit conversation</h1>
      <AdminConversationEditor corridorId={c} initial={doc} />
    </div>
  );
}
