import Link from "next/link";
import type { Locale } from "@/lib/types";

type ContentPaywallProps = {
  locale: Locale;
  variant: "signIn" | "subscribe";
};

export function ContentPaywall({ locale, variant }: ContentPaywallProps) {
  const isId = locale === "id";

  if (variant === "signIn") {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-center space-y-3">
        <p className="text-sm font-medium text-amber-950">
          {isId
            ? "Masuk untuk menyimpan progress dan membuka lebih banyak konten."
            : "Sign in to save progress and unlock more content."}
        </p>
        <Link
          href={`/${locale}/login`}
          className="inline-block rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {isId ? "Masuk" : "Sign in"}
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-center space-y-2">
      <p className="text-sm font-medium text-amber-950">
        {isId
          ? "Ini cuplikan gratis. Beli trip kit untuk pelajaran, kuis, dan progress lengkap."
          : "This is a free preview. Purchase the trip kit for full lessons, quizzes, and progress."}
      </p>
      <p className="text-xs text-amber-900/80">
        {isId
          ? "Pembayaran & langganan menyusul — progress kamu sudah tersimpan untuk akun ini."
          : "Checkout & subscriptions are coming soon — your progress is already saved to this account."}
      </p>
    </section>
  );
}
