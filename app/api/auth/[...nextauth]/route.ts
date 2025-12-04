import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: '.applypro.org', // Works for both www.applypro.org and applypro.org
      }
    }
  },
  callbacks: {
    async signIn({ user }) {
      return true; // Allow sign in
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after sign in
      if (url.includes('/api/auth/signin') || url.includes('/api/auth/callback')) {
        return `${baseUrl}/dashboard`;
      }
      // If it's a valid redirect URL, use it
      if (url.startsWith(baseUrl)) return url;
      // Otherwise redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
    async session({ session, user }): Promise<Session> {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
