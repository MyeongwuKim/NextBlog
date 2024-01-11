import "@/styles/globals.css";
import "@/styles/preview.css";
import "@/styles/codemirror.css";
import "@/styles/loading.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import { SWRConfig } from "swr";
import Loading from "@/components/loading";
import { Category } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import RootComp from "@/components/rootComp";
import { useRouter } from "next/router";
import PortalContainer from "@/components/modalPortal";
import ToastPotal from "@/components/toastPortal";

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
  const router = useRouter();

  useEffect(() => {
    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    // return () => {
    //   router.events.off("routeChangeStart", handleRouteChange);
    // };
  }, [router]);

  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute="class">
        <Loading />
        <PortalContainer />
        <ToastPotal />
        <SWRConfig
          value={{
            fetcher: (url: string) =>
              fetch(url).then((response: Response) => {
                return response.json();
              }),
            revalidateOnFocus: false,
          }}
        >
          <RootComp>
            <Component {...pageProps} />
          </RootComp>
        </SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}

// MyApp.getInitialProps = async (
//   context: AppContext
// ): Promise<LayoutData & AppInitialProps> => {
//   const ctx = await App.getInitialProps(context);
//   const {
//     ctx: { req },
//   } = context;

//   if (req?.url.startsWith("/_next")) {
//     return { ...ctx };
//   }
//   console.log("req!!");
//   console.log(req);
//   let token = await getToken({
//     req: req as NextApiRequest,
//     cookieName: process.env.NEXTAUTH_TOKENNAME,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   const profileData = await prisma.account.findUnique({
//     where: { email: "mw1992@naver.com" },
//     select: {
//       avatar: true,
//       email: true,
//       github: true,
//       name: true,
//       id: true,
//       introduce: true,
//     },
//   });

//   let categoryData = await prisma.category.findMany({
//     where: {
//       account: {
//         email: "mw1992@naver.com",
//       },
//     },
//     include: {
//       post: {
//         where: token
//           ? {}
//           : {
//               NOT: {
//                 isPrivate: true,
//               },
//             },
//         select: {
//           id: true,
//         },
//       },
//     },
//   });

//   return { ...ctx, profile: profileData, category: categoryData };
// };

export default MyApp;
