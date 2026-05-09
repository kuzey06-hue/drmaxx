import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, upsertGoogleUser, verifyPassword } from "./users";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID  ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "Email",
      credentials: {
        email:    { label: "E-posta", type: "email"    },
        password: { label: "Şifre",   type: "password" },
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
    signIn:  "/giris",
    signOut: "/",
    error:   "/giris",
  },

  callbacks: {
    /** Google girişinde kullanıcıyı DB'ye kaydet / güncelle */
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await upsertGoogleUser({
          email: user.email,
          name:  user.name  ?? user.email.split("@")[0],
          image: user.image ?? undefined,
        });
      }
      return true;
    },

    /** JWT'ye DB id'yi yaz */
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    /** Session'a id ve image aktar */
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET ?? "drmaxx_nextauth_secret_change_in_prod",
};
