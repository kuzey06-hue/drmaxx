import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, upsertGoogleUser, verifyPassword } from "./users";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const hasGoogleProvider = !!(googleClientId && googleClientSecret);

export const authOptions: NextAuthOptions = {
  providers: [
    ...(hasGoogleProvider
      ? [
          GoogleProvider({
            clientId: googleClientId as string,
            clientSecret: googleClientSecret as string,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await findUserByEmail(credentials.email);
        if (!user || !user.passwordHash) return null;
        if (!verifyPassword(credentials.password, user.passwordHash)) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/giris",
    signOut: "/",
    error: "/giris",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          await upsertGoogleUser({
            email: user.email,
            name: user.name ?? user.email.split("@")[0],
            image: user.image ?? undefined,
          });
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET ?? "drmaxx_nextauth_secret_change_in_prod",
};
