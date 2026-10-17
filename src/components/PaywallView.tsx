import { Link } from "@/i18n/navigation";
import { Button } from "@/components/Button";
import { formatIdr, PASS_DURATION_DAYS, SKUS } from "@/lib/pricing";
import { pickLocalized } from "@/lib/locale";
import type { CorridorId, Locale } from "@/lib/types";
import type { Destination } from "@/data/catalog";

type PaywallViewProps = {
  locale: Locale;
  corridor: CorridorId | null;
  destination: Destination | null;
  isSignedIn: boolean;
  hasFullAccess: boolean;
  messages: {
    title: string;
    subtitle: string;
    tripPassTitle: string;
    tripPassDesc: string;
    subscriptionTitle: string;
    subscriptionDesc: string;
    duration: string;
    includesLessons: string;
    includesCheatsheet: string;
    includesQuizzes: string;
    includesAllCorridors: string;
    recommended: string;
    checkoutSoon: string;
    checkoutHint: string;
    signInFirst: string;
    signInCta: string;
    alreadyUnlocked: string;
    backHome: string;
    freeReminder: string;
  };
};

function SkuCard({
  highlighted,
  title,
  description,
  priceLabel,
  durationLabel,
  bullets,
  recommendedLabel,
  checkoutLabel,
  checkoutDisabled,
}: {
  highlighted: boolean;
  title: string;
  description: string;
  priceLabel: string;
  durationLabel: string;
  bullets: string[];
  recommendedLabel: string;
  checkoutLabel: string;
  checkoutDisabled: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 space-y-4 ${
        highlighted
          ? "border-teal-400 bg-teal-50/80 shadow-sm ring-1 ring-teal-200"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        {highlighted && (
          <span className="shrink-0 rounded-full bg-teal-700 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            {recommendedLabel}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-teal-900">{priceLabel}</p>
        <p className="text-xs text-slate-500">{durationLabel}</p>
      </div>
      <ul className="space-y-2 text-sm text-slate-700">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-teal-700" aria-hidden>✓</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        className="w-full"
        disabled={checkoutDisabled}
        aria-disabled={checkoutDisabled}
      >
        {checkoutLabel}
      </Button>
    </article>
  );
}

export function PaywallView({
  locale,
  corridor,
  destination,
  isSignedIn,
  hasFullAccess,
  messages,
}: PaywallViewProps) {
  const tripPrice = formatIdr(SKUS.trip_pass.priceIdr, locale);
  const subPrice = formatIdr(SKUS.subscription.priceIdr, locale);
  const durationLabel = messages.duration.replace(
    "{days}",
    String(PASS_DURATION_DAYS),
  );

  const destinationName =
    destination ? pickLocalized(destination.name, locale) : null;

  const tripBullets = [
    messages.includesLessons,
    messages.includesCheatsheet,
    messages.includesQuizzes,
  ];
  const subBullets = [
    messages.includesAllCorridors,
    messages.includesLessons,
    messages.includesCheatsheet,
    messages.includesQuizzes,
  ];

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-2xl bg-teal-900 px-5 py-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-200/90">
          LocalReady
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">{messages.title}</h1>
        <p className="mt-2 text-sm text-teal-100/95">{messages.subtitle}</p>
        {destinationName && (
          <p className="mt-3 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium">
            {destinationName}
          </p>
        )}
      </section>

      {hasFullAccess ? (
        <section className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-5 text-center text-sm text-teal-950">
          {messages.alreadyUnlocked}
          <div className="mt-3">
            <Link href="/" className="font-semibold text-teal-800 underline">
              {messages.backHome}
            </Link>
          </div>
        </section>
      ) : (
        <>
          {!isSignedIn && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-center space-y-3">
              <p className="text-sm text-amber-950">{messages.signInFirst}</p>
              <Link
                href="/profile"
                className="inline-block rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white"
              >
                {messages.signInCta}
              </Link>
            </section>
          )}

          <p className="text-center text-xs text-slate-500">{messages.freeReminder}</p>

          <div className="space-y-4">
            <SkuCard
              highlighted={corridor !== null}
              title={
                destinationName
                  ? messages.tripPassTitle.replace("{destination}", destinationName)
                  : messages.tripPassTitle.replace("{destination}", "…")
              }
              description={messages.tripPassDesc}
              priceLabel={tripPrice}
              durationLabel={durationLabel}
              bullets={tripBullets}
              recommendedLabel={messages.recommended}
              checkoutLabel={messages.checkoutSoon}
              checkoutDisabled={true}
            />
            <SkuCard
              highlighted={corridor === null}
              title={messages.subscriptionTitle}
              description={messages.subscriptionDesc}
              priceLabel={subPrice}
              durationLabel={durationLabel}
              bullets={subBullets}
              recommendedLabel={messages.recommended}
              checkoutLabel={messages.checkoutSoon}
              checkoutDisabled={true}
            />
          </div>

          <p className="text-center text-xs text-slate-500">{messages.checkoutHint}</p>
        </>
      )}

      {!hasFullAccess && (
        <p className="text-center">
          <Link href="/" className="text-sm font-medium text-teal-800 underline">
            {messages.backHome}
          </Link>
        </p>
      )}
    </div>
  );
}
