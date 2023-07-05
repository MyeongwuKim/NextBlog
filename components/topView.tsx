import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import SettingBox from "./settingBox";

interface TopViewProps {
  openCallback: (mode: "signin" | "signup" | "none") => void;
  loadingCallback?: (isLoading: boolean) => void;
}

const TopView: NextPage<TopViewProps> = ({ openCallback, loadingCallback }) => {
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
            <div className="relative flex flex-row items-center justify-center w-auto h-auto rounded-full bg-slate-500">
              <span className="relative p-2 text-sm font-semibold text-center text-white">
                명우
              </span>
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

        <SettingBox
          enable={ddenable}
          dropdownCallback={ddEnableCallback}
          loadingCallback={loadingCallback}
        />
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

export default TopView;
