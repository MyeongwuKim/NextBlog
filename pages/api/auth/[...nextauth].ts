import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import client from "lib/client";
import { Account } from "@prisma/client";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      email: string;
      id: number;
    };
    accessToken: JWT;
  }
}
export default NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "email", type: "text", placeholder: "jsmith" },
        password: { label: "password", type: "password" },
      },
      authorize: async (credentials, req): Promise<any> => {
        const { email, password } = credentials as Record<
          "email" | "password",
          string
        >;

        const exUser = await client?.account.findUnique({
          where: {
            email,
          },
          select: {
            password: true,
            email: true,
          },
        });
        if (!exUser) {
          throw new Error("잘못된 입력값으로 인한 오류가 발생했습니다.");
        }
        const passwordResult = await bcrypt.compare(password, exUser.password);

        if (!passwordResult) {
          throw new Error("잘못된 입력값으로 인한 오류가 발생했습니다.");
        }
        return exUser;
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      session.accessToken = token;
      return session;
    },

    async jwt({ token, session, trigger }) {
      if (trigger == "update") {
        return token;
      }

      const exUser = await client.account.findUnique({
        where: { email: token.email },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

      token.id = exUser.id;

      return token;
    },
    async signIn() {
      return true;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NEXTAUTH_TOKENNAME,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 6000,
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
