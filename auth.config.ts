import type { NextAuthConfig } from "next-auth";

// Edge-compatible base config used by middleware. No providers here — providers
// that need Node APIs (Prisma, bcrypt) live in lib/auth.ts instead, since
// Next.js middleware runs in the Edge runtime and can't bundle them.
export default {
  // Vercel auto-detects its own host as trusted; other hosts (e.g. Hostinger)
  // don't, and NextAuth rejects every request with "UntrustedHost" otherwise —
  // which hangs every page since proxy.ts calls auth() on each request.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as "AGENT" | "ADMIN";
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as "AGENT" | "ADMIN";
      return session;
    },
  },
} satisfies NextAuthConfig;
