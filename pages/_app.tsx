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
import useSWR, { useSWRConfig } from "swr";
import WithHead from "@/components/WithHead";
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

function MyApp({ Component, pageProps }: AppProps & LayoutData) {
  const { mutate } = useSWRConfig();
  let { data: profileData } = useSWR("/api/profile");
  let { data: categoryData } = useSWR("/api/category");

  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute="class">
        <Loading />
        <div id="cautionCont" className="fixed z-[99]" />
        <SWRConfig
          value={{
            fetcher: (url: string) =>
              fetch(url).then((response: Response) => {
                return response.json();
              }),
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
  return { ...ctx };
};

export default MyApp;
