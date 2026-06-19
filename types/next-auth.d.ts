import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "AGENT" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "AGENT" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "AGENT" | "ADMIN";
  }
}
