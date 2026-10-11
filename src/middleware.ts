import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const SESSION_COOKIE = "lr_session";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|id)(\/.*)?$/);
  if (!localeMatch) {
    return intlMiddleware(request);
  }

  const locale = localeMatch[1];
  const subpath = localeMatch[2] ?? "";
  const loggedIn = request.cookies.get(SESSION_COOKIE)?.value === "1";
  const isLogin = subpath === "/login";

  if (!loggedIn && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (loggedIn && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/destinations`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|id)/:path*"],
};
