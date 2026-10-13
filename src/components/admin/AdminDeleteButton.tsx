"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type AdminDeleteButtonProps = {
  onDelete: () => Promise<void>;
  redirectTo: string;
  disabled?: boolean;
};

export function AdminDeleteButton({
  onDelete,
  redirectTo,
  disabled,
}: AdminDeleteButtonProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function click() {
    if (!window.confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      await onDelete();
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={click}
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
    >
      {pending ? t("deleting") : t("delete")}
    </button>
  );
}
