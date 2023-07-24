import "@/styles/globals.css";
import "@/styles/preview.css";
import "@/styles/codemirror.css";
import "@/styles/loading.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import Layout from "@/components/layout";
import { SWRConfig } from "swr";
import * as ReactDOMClient from "react-dom/client";
import Loading from "@/components/loading";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";
import ErrorMsg from "@/components/errorMsg";
import prisma from "@/lib/server/client";
import App from "next/app";
import { Category } from "@prisma/client";
import dynamic from "next/dynamic";

dynamic(import("@/components/preview"));
dynamic(import("@/components/editor"));

let root = null;

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

type ActionType = {
  setLoading: Dispatch<SetStateAction<boolean>>;
  createError: (msg: string, isWarning: boolean) => void;
  updateLayoutData: (data: Category[] | ProfileType) => void;
};
/**전역적으로 쓰이는 기능: 에러팝업,로딩화면 */
export const MyAppContext = createContext<ActionType>(null);

function MyApp({
  Component,
  pageProps,
  profile,
  category,
}: AppProps & LayoutData) {
  // var data = {data1:{
  //   name: 'John',
  //   age: 20,
  //   job: 'developer'
  // },data2:{  email: 'test@test.com',
  //   address: 'Seoul',
  //   job: 'doctor'}}

  // data = {...data,data1:{...data.data1,age:1}}
  const [layoutData, setLayoutData] = useState<LayoutData>();
  const [enableLoading, setEnableLoading] = useState<boolean>(false);
  const creatErrorMsg = (msg: string, isWarning: boolean) => {
    setEnableLoading((prev) => !prev);
    if (!document.getElementById("cautionWindow")) {
      root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
    } else {
      root.unmount();
      root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
    }
    root.render(<ErrorMsg root={root} msg={msg} isWarning={isWarning} />);
  };
  const updateLayoutData = (data: Category[] | ProfileType) => {
    setLayoutData((prev) => {
      var newPrev;
      if (Array.isArray(data)) {
        newPrev = {
          ...prev,
          category: data,
        };
      } else {
        newPrev = {
          ...prev,
          profile: data,
        };
      }
      console.log(newPrev);
      return newPrev;
    });
  };
  const globalAction: ActionType = {
    setLoading: setEnableLoading,
    createError: creatErrorMsg,
    updateLayoutData,
  };

  useEffect(() => {
    setLayoutData({ category, profile });
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute="class">
        <Loading enable={enableLoading} />
        <div id="errorCont" />
        <SWRConfig
          value={{
            fetcher: (url: string) =>
              fetch(url).then((response: Response) => {
                return response.json();
              }),
          }}
        >
          <MyAppContext.Provider value={globalAction}>
            <Layout
              category={layoutData?.category}
              profile={layoutData?.profile}
            >
              <Component {...pageProps} />
            </Layout>
          </MyAppContext.Provider>
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
  const profileData = await prisma.account.findUnique({
    where: { email: "mw1992@naver.com" },
    select: {
      avatar: true,
      email: true,
      github: true,
      name: true,
      id: true,
      introduce: true,
      category: {
        orderBy: { order: "asc" },
      },
    },
  });

  let profile = { ...profileData };
  delete profile.category;
  let { category } = profileData;

  return { ...ctx, profile, category };
};

export default MyApp;
