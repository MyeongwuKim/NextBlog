import { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

interface DropDownProps {
  enable: boolean;
  dropdownCallback: (enable: boolean) => void;
  loadingCallback?: (enable: boolean) => void;
}
interface position {
  top: number;
  right: number;
}
var selectIdx: number;
/**드랍다운 메뉴(데이터리스트,현재값,버튼스타일,메뉴스타일,콜백) */
const SettingBox: NextPage<DropDownProps> = ({
  enable,
  dropdownCallback,
  loadingCallback,
}) => {
  const menuBox = useRef<HTMLDivElement>(null);
  const { update } = useSession();
  const router = useRouter();

  return (
    <div
      id="dropdown-menu"
      style={{ top: 45 }}
      className={`z-40 w-[130px] h-[130px] fixed ${
        enable ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={` w-full h-full text-lg font-semibold
        [&>button]:p-2 
        flex-col flex items-center justify-center relative dark:bg-zinc-900  bg-gray-100 z-20 ${
          enable ? "block" : "hidden"
        }`}
      >
        <button
          className="w-full flex hover:dark:bg-zinc-800 hover:bg-gray-200"
          onClick={() => {
            dropdownCallback(false);
            router.push("/setting/profile");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 my-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>

          <span className="ml-2">설정</span>
        </button>
        <button
          onClick={() => {
            dropdownCallback(false);
            router.push("/write");
          }}
          className="w-full flex hover:dark:bg-zinc-800 hover:bg-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          <span className="ml-2">글쓰기</span>
        </button>
        <button
          className="w-full flex hover:dark:bg-zinc-800 hover:bg-gray-200"
          onClick={() => {
            loadingCallback(true);
            dropdownCallback(false);
            signOut({ redirect: false }).then((res) => {
              if (
                router.pathname.includes("setting") ||
                router.pathname.includes("write")
              ) {
                router.reload();
              }
              update();
              loadingCallback(false);
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          <span className="ml-2">로그아웃</span>
        </button>
      </div>

      <div
        onClick={() => {
          dropdownCallback(false);
        }}
        id="dropdown-closePanel"
        className={`z-10 w-full h-full fixed top-0 left-0 ${"block"}
      `}
      />
    </div>
  );
};

export default SettingBox;
