import { NextPage } from "next";
import { useState } from "react";

const Profile: NextPage = () => {
  const [passwordState, setPasswordState] = useState<boolean>(false);

  return (
    <div className="w-full h-full">
      <div className="relative text-xl mb-5 font-bold">
        유저의 정보를 변경할 수 있습니다.
      </div>
      <div className="relative h-auto w-full flex flex-col items-center">
        <div className="mb-4 relative h-auto w-full flex items-center justify-center border-gray-200 dark:border-zinc-800">
          <div className="mb-4 relative flex flex-row items-center justify-center w-48 h-48 rounded-full bg-slate-500">
            <span className="text-3xl font-semibold text-center text-white ">
              명우
            </span>
          </div>
        </div>
        <div className="relative items-center mb-4  h-14 w-full flex">
          <div className="w-1/4 pl-4 text-2xl font-semibold font-sans">
            유저이름
          </div>
          <input
            id="name"
            type="text"
            placeholder="이름을 입력해주세요"
            className="border-2 rounded-xl focus:ring-1 
          focus:ring-emerald-500
          focus:outline-none font-sans dark:border-slate-800 blur:border-gray-200
          p-2 bg-transparent ring-0 dark:text-gray-200  dark:placeholder:text-gray-400 placeholder:text-gray-200 text-2xl text-slate-800 w-3/4 h-14"
          />
        </div>
        <div className="relative items-center mb-4 h-14 w-full flex">
          <div className="w-1/4 pl-4 text-2xl font-semibold font-sans">
            이메일
          </div>
          <input
            id="email"
            type="text"
            placeholder="이메일을 입력해주세요"
            className="border-2 rounded-xl focus:ring-1 
          focus:ring-emerald-500
          focus:outline-none font-sans dark:border-slate-800 blur:border-gray-200
          p-2 bg-transparent ring-0 dark:text-gray-200  dark:placeholder:text-gray-400 placeholder:text-gray-200 text-2xl text-slate-800 w-3/4 h-14"
          />
        </div>
        <div className="relative items-center mb-4 h-14 w-full flex">
          <div className="w-1/4 pl-4 text-2xl font-semibold font-sans">
            비밀번호
          </div>
          <button
            onClick={() => {
              setPasswordState(true);
            }}
            className={`${
              passwordState ? "hidden" : "block"
            } relative select-none 
        w-36 inline-block p-2 text-lg font-semibold h-full rounded-lg bg-slate-600 hover:bg-slate-700`}
          >
            변경하기
          </button>
          <div
            className={`${
              passwordState ? "block" : "hidden"
            } w-3/4 flex gap-3 h-full relative`}
          >
            <div className="w-1/3">
              <button
                onClick={() => {
                  setPasswordState(false);
                }}
                className={` select-none w-36 inline-block 
            p-2 text-lg font-semibold h-full rounded-lg bg-slate-600 hover:bg-slate-700`}
              >
                취소
              </button>
            </div>
            <input
              id="password"
              type="password"
              placeholder="기존 비밀번호"
              className="border-2 rounded-xl focus:ring-1 
          focus:ring-emerald-500 w-1/3
          focus:outline-none font-sans dark:border-slate-800 blur:border-gray-200
          p-2 bg-transparent ring-0 dark:text-gray-200  dark:placeholder:text-gray-400 placeholder:text-gray-200 text-2xl text-slate-800"
            />
            <input
              id="password"
              type="password"
              placeholder="수정할 비밀번호"
              className="border-2 rounded-xl focus:ring-1 
          focus:ring-emerald-500 w-1/3
          focus:outline-none font-sans dark:border-slate-800 blur:border-gray-200
          p-2 bg-transparent ring-0 dark:text-gray-200  dark:placeholder:text-gray-400 placeholder:text-gray-200 text-2xl text-slate-800"
            />
          </div>
        </div>
        <div className="relative items-center mb-10  h-auto w-full flex-cols">
          <div className="w-full pl-4 mb-4 text-2xl font-semibold font-sans">
            블로그 소개
          </div>
          <div className="w-full h-36 pl-4">
            <textarea
              id="introduce"
              placeholder=""
              className="focus:ring-1 
            focus:ring-emerald-500 border-2 h-full rounded-xl 
          focus:outline-none font-sans dark:border-slate-800 border-gray-200
          p-2 bg-transparent ring-0 dark:text-gray-200  dark:placeholder:text-gray-400 placeholder:text-gray-200 text-2xl text-slate-800 resize-none w-full boder-2 "
            />
          </div>
        </div>
        <div className="relative">
          <button className="relative select-none w-36 h-14 inline-block p-2 text-lg font-semibold rounded-lg  bg-emerald-500 hover:bg-emerald-700">
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

{
  /* <button className="mt-4 relative select-none w-36 inline-block p-2 text-lg font-semibold rounded-lg  bg-emerald-500 hover:bg-emerald-700">
사진 업로드
</button>
<button
onClick={() => {}}
className="mt-4 relative select-none w-36 inline-block p-2 text-lg font-semibold rounded-lg bg-slate-600 hover:bg-slate-700"
>
지우기
</button> */
}

{
  /* <input
id="password"
type="text"
placeholder="input your password"
className="p-2 dark:bg-zinc-900 dark:text-gray-200 border-2 dark:placeholder:text-gray-400 placeholder:text-gray-200 rounded-xl font-serif text-2xl text-slate-800 resize-none w-full h-14 boder-2 border-gray-300"
/> */
}
