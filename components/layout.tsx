import SignIn from "@/components/signIn";
import SignUp from "@/components/signup";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Loading from "./loading";
import { useTheme } from "next-themes";
import SettingSide from "./settingSide";
import { Category } from "@prisma/client";
import SettingBox from "./settingBox";
import { useSession } from "next-auth/react";

interface LayoutProps {
  children: React.ReactElement;
  profile?: ProfileType;
  category?: Category[];
}

interface TopViewProps {
  openCallback: (mode: "signin" | "signup" | "none") => void;
  profile?: ProfileType;
}

interface LeftViewProps {
  profile?: ProfileType;
  category?: Category[];
}

type ProfileType = {
  avatar?: string;
  email: string;
  name: string;
  id: number;
  github?: string;
  introduce?: string;
};

const uploadPrefix = "https://imagedelivery.net/0VaIqAONZ2vq2gejAGX7Sw/";
const uploadSuffix = "/avatar";

const fullPageList = ["write", "setting"];

const Layout: NextPage<LayoutProps> = ({ children, profile, category }) => {
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
        />
        <SignUp
          enable={signMode == "signup" ? true : false}
          openCallback={signModeCallback}
        />
        <div className="flex flex-col w-full h-full">
          <TopView openCallback={setSignMode} profile={profile} />
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
              <LeftView profile={profile} category={category} />
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
              <RightView />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;

export const TopView: NextPage<TopViewProps> = ({ openCallback, profile }) => {
  const { theme, setTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  const { data, update, status } = useSession();

  const [ddenable, setddEnable] = useState<boolean>(false);
  const ddEnableCallback = useCallback((enable: boolean) => {
    setddEnable(enable);
  }, []);

  useEffect(() => {
    setLoaded(true);
  }, [loaded]);

  return (
    <div
      className="px-6 dark:bg-zinc-900 border-b-[2px] border-gray-200 dark:border-zinc-800
    bg-gray-100 relative flex w-auto  h-[60px] justify-end items-center"
    >
      <div className="flex flex-col">
        <button
          onClick={() => {
            openCallback("signin");
          }}
          className={`inline ${
            status == "unauthenticated" ? "" : "hidden"
          } order-1 mr-2`}
        >
          <div className="relative flex flex-row items-center justify-center w-auto h-auto rounded-2xl bg-slate-500">
            <span className="relative py-2 px-3 text-sm font-semibold text-center text-white">
              로그인
            </span>
          </div>
        </button>
        <button
          onClick={(e) => {
            setddEnable(true);
          }}
          className={`${
            status == "authenticated" ? "span" : "hidden"
          } order-1 mr-2`}
        >
          <div className="flex-row flex items-center">
            <div
              className=" border-2 dark:border-zinc-800
            relative flex flex-row items-center justify-center w-8 h-8 rounded-full bg-slate-500"
            >
              <img
                src={
                  profile?.avatar
                    ? `${uploadPrefix}${profile?.avatar}${uploadSuffix}`
                    : ""
                }
                className={`${
                  profile?.avatar ? "block" : "hidden"
                } w-full h-full rounded-full absolute `}
              />
            </div>
            <div className={`w-4 h-4 ml-2 ${ddenable ? "inline" : "hidden"}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`w-4 h-4`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 15.75l7.5-7.5 7.5 7.5"
                />
              </svg>
            </div>
            <div className={`w-4 h-4 ml-2 ${!ddenable ? "inline" : "hidden"}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`w-4 h-4`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </button>

        <SettingBox enable={ddenable} dropdownCallback={ddEnableCallback} />
      </div>

      <div className="basis-10 flex items-center">
        <button
          onClick={() => {
            if (theme == "dark") setTheme("light");
            else setTheme("dark");
          }}
        >
          {loaded ? (
            theme == "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-[36px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            )
          ) : null}
        </button>
      </div>
      <div className="basis-10 flex items-center">
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-[36px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </div>
      <div className="basis-10 flex items-center">
        <button
          onClick={() => {
            router.push("/");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-[36px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const RightView: NextPage = () => {
  const { data, update, status } = useSession();
  const router = useRouter();
  const [ddenable, setddEnable] = useState<boolean>(false);
  const ddEnableCallback = useCallback((enable: boolean) => {
    setddEnable(enable);
  }, []);

  return (
    <>
      <div
        className={`w-full relative flex flex-row justify-start pl-4 mt-2 py-10 `}
      >
        <div></div>
      </div>
    </>
  );
};

export const LeftView: NextPage<LeftViewProps> = ({ profile, category }) => {
  const { theme, setTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoaded(true);
  }, [loaded]);

  return (
    <div className="pl-10 h-full w-full  py-10">
      <div
        className={`overflow-auto w-full px-6 left-0 h-full border-r-[2px] border-gray-200 dark:border-zinc-800 
   
       `}
      >
        <div className="relative w-full flex flex-col mt-5 items-center">
          <div className="relative flex flex-row items-center justify-center rounded-full w-36 h-36 bg-slate-500">
            <div
              className="border-2 dark:border-zinc-800 relative flex 
              flex-row items-center justify-center w-36 h-36 rounded-full bg-slate-500"
            >
              <img
                src={
                  profile?.avatar
                    ? `${uploadPrefix}${profile?.avatar}${uploadSuffix}`
                    : ""
                }
                className={`${
                  profile?.avatar ? "block" : "hidden"
                } w-full h-full rounded-full `}
              />
              <span className="text-3xl font-semibold text-center text-white ">
                {!profile?.avatar ? profile?.name : ""}
              </span>
            </div>
          </div>
          <button
            className="mt-4"
            onClick={() => {
              if (profile.github) window.open(profile.github);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="dark:fill-white w-10 h-10 rounded-3xl"
            >
              <path
                d="M 12 2.2467 A 
            10.0004 10.0004 0 0 0 8.83752 21.7342 c 0.5 0.08752 0.6875 -0.21247 0.6875 -0.475 c 0 -0.23749 -0.01251 -1.025 -0.01251 -1.86249 C 7 19.8592 6.35 18.7842 6.15 18.2217 A 3.636 3.636 0 0 0 5.125 16.8092 c -0.35 -0.1875 -0.85 -0.65 -0.01251 -0.66248 A 2.00117 2.00117 0 0 1 6.65 17.1717 a 2.13742 2.13742 0 0 0 2.91248 0.825 A 2.10376 2.10376 0 0 1 10.2 16.6592 c -2.225 -0.25 -4.55 -1.11254 -4.55 -4.9375 a 3.89187 3.89187 0 0 1 1.025 -2.6875 a 3.59373 3.59373 0 0 1 0.1 -2.65 s 0.83747 -0.26251 2.75 1.025 a 9.42747 9.42747 0 0 1 5 0 c 1.91248 -1.3 2.75 -1.025 2.75 -1.025 a 3.59323 3.59323 0 0 1 0.1 2.65 a 3.869 3.869 0 0 1 1.025 2.6875 c 0 3.83747 -2.33752 4.6875 -4.5625 4.9375 a 2.36814 2.36814 0 0 1 0.675 1.85 c 0 1.33752 -0.01251 2.41248 -0.01251 2.75 c 0 0.26251 0.1875 0.575 0.6875 0.475 A 10.0053 10.0053 0 0 0 12 2.2467 Z"
              />
            </svg>
          </button>
          <div className="w-full text-center font-semibold my-4 border-b-2 py-4 border-gray-200 dark:border-zinc-800">
            {profile?.introduce}
          </div>
          <div
            className="cursor-pointer
              p-2
              hover:dark:bg-zinc-800 hover:bg-gray-200
               relative w-full h-auto  text-lg text-center"
          >
            전체보기
          </div>
          {category?.map((v, i) => (
            <div
              key={i}
              className="cursor-pointer
              p-2
              hover:dark:bg-zinc-800 hover:bg-gray-200
               relative w-full h-auto text-center text-lg "
            >
              <span className="w-full break-words">{v.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
