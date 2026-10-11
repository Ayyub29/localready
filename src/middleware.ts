import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|id)(\/.*)?$/);
  if (!localeMatch) {
    return intlMiddleware(request);
  }

  const locale = localeMatch[1];
  const subpath = localeMatch[2] ?? "";
  const isLoggedIn = !!request.auth;
  const isLogin = subpath === "/login";

  if (!isLoggedIn && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/destinations`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
