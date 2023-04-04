import CBody from "@/components/body";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const PostDetail: NextPage = () => {
  return (
    <CBody>
      <div className="w-full h-auto p-6 mb-10 bg-gray-200 rounded-lg dark:bg-zinc-900">
        <div className="mb-10 text-xl font-semibold">알고리즘</div>
        <div className="flex justify-between ">
          <button>리스트 열기</button>
          <div>
            <span className="mr-4">1/1</span>
            <span>{"< >"}</span>
          </div>
        </div>
      </div>
      <div className="mb-5 text-5xl font-bold leading-tight">
        <span className="mr-2">[알고리즘]</span>
        <span>타입스크립트에 관하여타입스크립트에</span>
        관하여타입스크립트에 관하여
      </div>
      <div className="mb-5">
        <span className="text-lg font-semibold">mw1992</span>
        <span className="mx-2 text-lg dark:text-gray-400 text-slate-400">
          ·
        </span>
        <span className="text-lg dark:text-gray-400 text-slate-400">
          2022.12.14
        </span>
      </div>
      <div className="border-b-[1px]" />
      <div className="my-20">
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
        내용이 들어가는 곳입니다! 내용이 들어가는 곳입니다! <p></p>
      </div>
      <div className="mb-4 text-xl font-semibold">Post By</div>
      <div className="py-4 mb-5 border-y-[1px] flex">
        <div className="rounded-full w-36 h-36 bg-slate-500"></div>
        <div className="ml-4">
          <div className="mb-2 text-xl font-semibold">mw1992</div>
          <div className="text-lg dark:text-gray-400 text-slate-400">
            열심히 사는 김명우입니다
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="mb-4 text-lg font-semibold">0개의 댓글</div>
        <div className="w-full h-44 flex flex-col border-gray-400 rounded-lg border-[1px] shadow-sm dark:bg-zinc-900">
          <textarea
            placeholder="코멘트를 입력해주세요.."
            className="w-full border-none rounded-t-lg 
            border-gray-500 resize-none h-2/3 bg-[rgba(0,0,0,0)] focus:border-gray-500 focus:ring-0"
          />
          <div className="relative flex items-center w-full rounded-b-lg h-1/3 border-t-[1px] border-gray-400 dark:bg-zinc-700 bg-gray-200">
            <button className="absolute items-center inline-block p-2 text-lg font-semibold rounded-lg right-2 bg-emerald-500 hover:bg-emerald-700">
              Comment
            </button>
          </div>
        </div>
      </div>
    </CBody>
  );
};

export default PostDetail;
