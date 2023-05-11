import { darkTheme, lightTheme } from "@/define";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NextPage } from "next";

const CSideMenu: NextPage = () => {
  const { theme, setTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoaded(true);
  }, [loaded]);

  return (
    <div
      className={`overflow-auto left-0 h-full border-r-[1px] dark:bg-zinc-900
      bg-gray-100
       `}
    >
      <div className="relative flex w-auto pl-3 mt-2 justify-items-start">
        <div className="basis-10">
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
                  className="w-8 h-8"
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
        <div className="basis-10">
          <button>
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
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </div>
        <div className="basis-10">
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
              className="w-8 h-8"
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
      <div className="relative grid gap-4 mt-5 justify-items-center">
        <div className="relative flex flex-row items-center justify-center rounded-full w-36 h-36 bg-slate-500">
          <span className="text-3xl font-semibold text-center text-white ">
            명우
          </span>
        </div>
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={`${useTheme().theme == "dark" ? "white" : "black"}`}
            className="w-10 h-10 rounded-3xl"
          >
            <path
              d="M 12 2.2467 A 
            10.0004 10.0004 0 0 0 8.83752 21.7342 c 0.5 0.08752 0.6875 -0.21247 0.6875 -0.475 c 0 -0.23749 -0.01251 -1.025 -0.01251 -1.86249 C 7 19.8592 6.35 18.7842 6.15 18.2217 A 3.636 3.636 0 0 0 5.125 16.8092 c -0.35 -0.1875 -0.85 -0.65 -0.01251 -0.66248 A 2.00117 2.00117 0 0 1 6.65 17.1717 a 2.13742 2.13742 0 0 0 2.91248 0.825 A 2.10376 2.10376 0 0 1 10.2 16.6592 c -2.225 -0.25 -4.55 -1.11254 -4.55 -4.9375 a 3.89187 3.89187 0 0 1 1.025 -2.6875 a 3.59373 3.59373 0 0 1 0.1 -2.65 s 0.83747 -0.26251 2.75 1.025 a 9.42747 9.42747 0 0 1 5 0 c 1.91248 -1.3 2.75 -1.025 2.75 -1.025 a 3.59323 3.59323 0 0 1 0.1 2.65 a 3.869 3.869 0 0 1 1.025 2.6875 c 0 3.83747 -2.33752 4.6875 -4.5625 4.9375 a 2.36814 2.36814 0 0 1 0.675 1.85 c 0 1.33752 -0.01251 2.41248 -0.01251 2.75 c 0 0.26251 0.1875 0.575 0.6875 0.475 A 10.0053 10.0053 0 0 0 12 2.2467 Z"
            />
          </svg>
        </button>
        <div className="w-full pl-3 pr-3 font-semibold">
          안녕하세요 저는 김명우입니다. 여기는 자기소개란. 할말
          대충쓰는곳입니다.
        </div>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="relative w-full h-auto pl-10 pr-10 text-lg text-center"
          >
            <div
              onClick={() => {}}
              className="w-full h-auto mb-2 border-b-2 border-gray-400 cursor-pointer hover:border-white"
            >
              <div className="relative mb-2">{i}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CSideMenu;
