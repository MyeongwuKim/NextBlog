import { darkTheme, lightTheme } from "@/define";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NextPage } from "next";

const LeftView: NextPage = () => {
  const { theme, setTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoaded(true);
  }, [loaded]);

  return (
    <div className="pl-10 py-10  h-full ">
      <div
        className={`overflow-auto px-6 left-0 h-full border-r-[2px] border-gray-200 dark:border-zinc-800 
   
       `}
      >
        <div className="relative grid  mt-5 justify-items-center">
          <div className="relative flex flex-row items-center justify-center rounded-full w-36 h-36 bg-slate-500">
            <span className="text-3xl font-semibold text-center text-white ">
              명우
            </span>
          </div>
          <button className="mt-4">
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
          <div className="w-full  font-semibold my-4 border-b-2 py-4 border-gray-200 dark:border-zinc-800">
            안녕하세요 저는 김명우입니다. 여기는 자기소개란. 할말
            대충쓰는곳입니다.
          </div>
          <div
            className="cursor-pointer
              p-2
              hover:dark:bg-zinc-800 hover:bg-gray-200
               relative w-full h-auto  text-lg text-center"
          >
            전체보기
          </div>
          {["자바", "알고리즘", "잡담"].map((i) => (
            <div
              key={i}
              className="cursor-pointer
              p-2
              hover:dark:bg-zinc-800 hover:bg-gray-200
               relative w-full h-auto  text-lg text-center"
            >
              <span className="w-full p-6 relative">{i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftView;
