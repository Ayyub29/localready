import { getTranslations } from "next-intl/server";
import { logout } from "@/app/[locale]/login/actions";

type HomeHeaderProps = {
  locale: string;
  email?: string | null;
};

export async function HomeHeader({ locale, email }: HomeHeaderProps) {
  const t = await getTranslations("destinations");

  return (
    <header className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          LocalReady
        </p>
        {email && <p className="text-xs text-slate-500">{email}</p>}
      </div>
      <form action={logout.bind(null, locale)}>
        <button
          type="submit"
          className="text-sm font-medium text-slate-500 underline"
        >
          {t("signOut")}
        </button>
      </form>
    </header>
  );
}
