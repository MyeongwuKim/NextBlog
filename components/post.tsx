import { NextPage } from "next";

interface IPost {
  category?: string;
  title?: string;
  date?: string;
  content?: string;
  tag?: string[];
}

const CPost: NextPage<IPost> = ({ title, date, content, tag }) => {
  return (
    <div className="w-full h-auto mb-16">
      <div className="mb-4 text-3xl font-bold">
        [공부] 타입스크립트에 관하여 조금 끄적타입스크립트에 관하여 조금
        끄적타입스크립트에 관하여 조금 끄적
      </div>
      <div className="mb-4 space-x-3 text-lg dark:text-gray-400 text-slate-400">
        <span>2022.10.10</span>
        <span>10개의 댓글 </span>
        <span>하트 5개</span>
      </div>
      {/* <div className="relative mb-4 text-lg">공부,코딩,알고리즘</div> */}
      <div className="border-b-[2px] mb-4" />
      <div className="mb-4 font-semibold">
        타입스크립트에 대해 알아보자아아ㅏ 타입스크립트에 대해 알아보자아아ㅏ
        타입스크립트에 대해 알아보자아아ㅏ 타입스크립트에 대해 알아보자아아ㅏ
        타입스크립트에 대해 알아보자아아ㅏ 타입스크립트에 대해 알아보자아아ㅏ
        타입스크립트에 대해 알아보자아아ㅏ 타입스크립트에 대해 알아보자아아ㅏ
        타입스크립트에 대해 알아보자아아ㅏ 타입스크립트에 대해 알아보자아아ㅏ
        타입스크립트에 대해 알아보자아아ㅏ 타입스크립트에 대해 알아보자아아ㅏ
        타입스크립트에 대해 알아보자아아ㅏ 타입스크립트에 대해 알아보자아아ㅏ
        타입스크립트에 대해 알아보자아아ㅏ
      </div>
      <div className="relative h-8">
        <button className="absolute right-0 items-center inline-block p-2 text-lg font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-700">
          Read More
        </button>
      </div>
    </div>
  );
};

export default CPost;
