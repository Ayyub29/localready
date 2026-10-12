import { pickLocalized } from "@/lib/locale";
import type { ConversationTurn } from "@/lib/lesson-content-types";
import type { Locale } from "@/lib/types";

type ConversationThreadProps = {
  locale: Locale;
  turns: ConversationTurn[];
  /** Show turns from 0 through `visibleThrough` (inclusive). */
  visibleThrough: number;
};

export function ConversationThread({
  locale,
  turns,
  visibleThrough,
}: ConversationThreadProps) {
  const visible = turns.slice(0, visibleThrough + 1);

  return (
    <div className="flex flex-col gap-3">
      {visible.map((turn, index) => {
        const isLatest = index === visibleThrough;
        const faded = !isLatest;

        if (turn.role === "narrator") {
          return (
            <p
              key={turn.id}
              className={`text-center text-sm leading-relaxed text-slate-600 ${faded ? "opacity-60" : ""}`}
            >
              {pickLocalized(turn.line, locale)}
            </p>
          );
        }

        const isTraveler = turn.role === "traveler";
        return (
          <div
            key={turn.id}
            className={`flex ${isTraveler ? "justify-end" : "justify-start"} ${faded ? "opacity-70" : ""}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                isTraveler
                  ? "rounded-br-md bg-teal-700 text-white"
                  : "rounded-bl-md border border-border bg-card text-slate-900"
              }`}
            >
              {turn.label && (
                <p
                  className={`mb-1 text-xs font-medium ${
                    isTraveler ? "text-teal-100" : "text-slate-500"
                  }`}
                >
                  {pickLocalized(turn.label, locale)}
                </p>
              )}
              {turn.target && (
                <p className={`text-lg font-semibold leading-snug ${isTraveler ? "" : ""}`}>
                  {turn.target}
                </p>
              )}
              {turn.romanization && (
                <p
                  className={`text-sm ${isTraveler ? "text-teal-100" : "text-teal-800"}`}
                >
                  {turn.romanization}
                </p>
              )}
              <p
                className={`mt-1 text-sm ${isTraveler ? "text-teal-50" : "text-slate-600"}`}
              >
                {pickLocalized(turn.line, locale)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
