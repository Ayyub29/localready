import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/** Auth.js expects AUTH_GOOGLE_*; accept common alternate names from dashboards/tutorials. */
function googleOAuthEnv() {
  const clientId =
    process.env.AUTH_GOOGLE_ID ??
    process.env.AUTH_GOOGLE_CLIENT_ID ??
    process.env.GOOGLE_CLIENT_ID;
  const clientSecret =
    process.env.AUTH_GOOGLE_SECRET ??
    process.env.AUTH_GOOGLE_CLIENT_SECRET ??
    process.env.GOOGLE_CLIENT_SECRET;
  return { clientId, clientSecret };
}

const googleOAuth = googleOAuthEnv();

export const authConfig = {
  providers: [
    Google({
      clientId: googleOAuth.clientId,
      clientSecret: googleOAuth.clientSecret,
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
