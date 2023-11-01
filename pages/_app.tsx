import "@/styles/globals.css";
import "@/styles/preview.css";
import "@/styles/codemirror.css";
import "@/styles/loading.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import { SWRConfig } from "swr";
import Loading from "@/components/loading";
import dynamic from "next/dynamic";
import { Category } from "@prisma/client";
import prisma from "@/lib/server/client";
import App from "next/app";
import { useEffect, useState } from "react";
import { registHeadState } from "@/hooks/useEvent";
import WithHead from "@/components/WithHead";
import { getToken } from "next-auth/jwt";
import { NextApiRequest } from "next";
dynamic(import("@/components/write/preview"));
dynamic(import("@/components/write/editor"));

interface LayoutData {
  profile?: ProfileType;
  category?: Category[];
}

type ProfileType = {
  avatar?: string;
  email: string;
  github?: string;
  name: string;
  id: number;
  introduce?: string;
};

function MyApp({
  Component,
  pageProps,
  profile,
  category,
}: AppProps & LayoutData) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute="class">
        <Loading />
        <div id="cautionCont" className="fixed z-[99]" />
        <SWRConfig
          value={{
            fallback: {
              "/api/profile": {
                ok: true,
                profile,
              },
              "/api/category": {
                ok: true,
                originCategory: category,
              },
            },
            fetcher: (url: string) =>
              fetch(url).then((response: Response) => {
                return response.json();
              }),
            revalidateOnFocus: false,
          }}
        >
          <WithHead>
            <Component {...pageProps} />
          </WithHead>
        </SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}

MyApp.getInitialProps = async (
  context: AppContext
): Promise<LayoutData & AppInitialProps> => {
  const ctx = await App.getInitialProps(context);

  const {
    ctx: { req },
  } = context;

  if (req?.url.startsWith("/_next")) {
    return { ...ctx };
  }

  let token = await getToken({
    req: req as NextApiRequest,
    cookieName: process.env.NEXTAUTH_TOKENNAME,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const profileData = await prisma.account.findUnique({
    where: { email: "mw1992@naver.com" },
    select: {
      avatar: true,
      email: true,
      github: true,
      name: true,
      id: true,
      introduce: true,
    },
  });

  let categoryData = await prisma.category.findMany({
    where: {
      account: {
        email: "mw1992@naver.com",
      },
    },
    include: {
      post: {
        where: token
          ? {}
          : {
              NOT: {
                isPrivate: true,
              },
            },
        select: {
          id: true,
        },
      },
    },
  });

  return { ...ctx, profile: profileData, category: categoryData };
};

export default MyApp;
