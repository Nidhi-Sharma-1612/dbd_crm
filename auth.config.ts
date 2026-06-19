import type { NextAuthConfig } from "next-auth";

// Edge-compatible base config used by middleware. No providers here — providers
// that need Node APIs (Prisma, bcrypt) live in lib/auth.ts instead, since
// Next.js middleware runs in the Edge runtime and can't bundle them.
export default {
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
