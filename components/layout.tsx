import SignIn from "@/components/signIn";
import SignUp from "@/components/signup";
import LeftView from "@/components/leftView";
import RightView from "@/components/rightView";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Loading from "./loading";
import { useTheme } from "next-themes";
import TopView from "./topView";
import SettingSide from "./settingSide";

interface LayoutProps {
  children: React.ReactNode;
}
const fullPageList = ["write", "setting"];

const Layout: NextPage<LayoutProps> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {}, [router]);

  const [loading, setLoading] = useState<boolean>(false);
  const [signMode, setSignMode] = useState<"signin" | "signup" | "none">(
    "none"
  );
  const signModeCallback = useCallback((mode: "signin" | "signup" | "none") => {
    setSignMode(mode);
  }, []);
  const loadingCallback = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  return (
    <div className=" absolute w-full h-full min-w-[640px] bg-slate-50 text-slate-800 dark:bg-black dark:text-gray-200">
      <div className="w-full h-full">
        <Loading enable={loading} />
        <SignIn
          enable={signMode == "signin" ? true : false}
          openCallback={signModeCallback}
          loadingCallback={loadingCallback}
        />
        <SignUp
          enable={signMode == "signup" ? true : false}
          openCallback={signModeCallback}
        />
        <div className="flex flex-col w-full h-full">
          <TopView
            loadingCallback={loadingCallback}
            openCallback={setSignMode}
          />
          <div className="flex w-full h-full flex-row overflow-auto">
            <div
              className={`${
                fullPageList.some((page) => {
                  return router.pathname.includes(page);
                })
                  ? "hidden"
                  : "block"
              } flex-[0.25_0.25_0%]`}
            >
              <LeftView />
            </div>
            <div
              className={`${
                router.pathname.includes("setting") ? "block" : "hidden"
              } flex-[0.25_0.25_0%]`}
            >
              <div className="f-full flex-[0.25_0.25_0%] flex justify-center items-center">
                <SettingSide />
              </div>
            </div>

            <div
              className={`h-[calc(100%-0px)] w-full py-10 ${
                fullPageList.some((page) => {
                  return router.pathname.includes(page);
                })
                  ? "flex-[1_1_0%]"
                  : "flex-[0.5_0.5_0%]"
              }`}
            >
              <div
                className={`h-[calc(100%-0px)] w-full overflow-auto px-10 ${
                  fullPageList.some((page) => {
                    return router.pathname.includes(page);
                  })
                    ? "flex-[1_1_0%]"
                    : "flex-[0.5_0.5_0%]"
                }`}
              >
                {children}
              </div>
            </div>
            <div
              className={`${
                fullPageList.some((page) => {
                  return router.pathname.includes(page);
                })
                  ? "hidden"
                  : "block"
              } flex-[0.25_0.25_0%]`}
            >
              <RightView
                openCallback={signModeCallback}
                loadingCallback={loadingCallback}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
