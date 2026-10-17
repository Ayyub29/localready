import { Link } from "@/i18n/navigation";
import type { CorridorId, Locale } from "@/lib/types";

type ContentPaywallProps = {
  locale: Locale;
  variant: "signIn" | "subscribe";
  corridorId?: CorridorId;
};

function paywallHref(corridorId?: CorridorId): string {
  if (corridorId) return `/paywall?corridor=${corridorId}`;
  return "/paywall";
}

export function ContentPaywall({
  locale,
  variant,
  corridorId,
}: ContentPaywallProps) {
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
          href="/profile"
          className="inline-block rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {isId ? "Masuk" : "Sign in"}
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-center space-y-3">
      <p className="text-sm font-medium text-amber-950">
        {isId
          ? "Ini cuplikan gratis. Beli trip kit untuk pelajaran, kuis, dan progress lengkap."
          : "This is a free preview. Purchase the trip kit for full lessons, quizzes, and progress."}
      </p>
      <Link
        href={paywallHref(corridorId)}
        className="inline-block rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white"
      >
        {isId ? "Lihat paket trip" : "View trip plans"}
      </Link>
      <p className="text-xs text-amber-900/80">
        {isId
          ? "Pembayaran QRIS menyusul — harga dan manfaat sudah bisa kamu lihat di halaman paket."
          : "QRIS checkout is coming soon — see plans and pricing on the paywall page."}
      </p>
    </section>
  );
}
