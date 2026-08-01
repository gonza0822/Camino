import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db/mongo-client";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validators/auth";
import { verifyCredentials, hasPasswordAccount } from "@/lib/services/authService";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const user = await verifyCredentials(parsed.data.email, parsed.data.password);
      if (!user) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image ?? undefined,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          // Always show the account picker (needed in Capacitor WebView after first login).
          prompt: "select_account",
        },
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const exists = await hasPasswordAccount(user.email);
        if (exists) return false;
      }
      return true;
    },
  },
});
