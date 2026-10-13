import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/** Legacy `/admin` → default locale admin home. */
export default function AdminLegacyRedirect() {
  redirect(`/${routing.defaultLocale}/admin`);
}
