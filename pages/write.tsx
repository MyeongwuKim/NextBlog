import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { render } from "react-dom";
import { useRouter } from "next/router";

//WYSIWYG에디터
//예전 방식 contentEditable,execCommand 활용 -> 이제 웹표준이아님

const write: NextPage = () => {
  const [style, setStyle] = useState<string>();
  const router = useRouter();
  const titleArea = useRef<any>();
  const bodyArea = useRef<any>();

  const onTitleChange = (e: any) => {
    const { current } = titleArea;
    current!.style.height = "auto";
    current!.style.height = current!.scrollHeight + "px";
  };
  const onBodyInput = () => {
    let { current } = bodyArea;
    const selection = document.getSelection(); //현재 커서 정보
    const newRange = document.createRange(); //새로 설정할 커서정보
    const curNode = selection?.focusNode?.parentNode!; //커서가 현재 위치한 노드

    if (current.innerHTML.length - 1 <= 0) {
      //처음에 div태그가 없어서 만들어준후 커서를 앞으로 한칸 옮긴다
      current.innerHTML = `<div>${current.innerHTML}</div>`;
      newRange.setStart(curNode, 1);
      newRange.setEnd(curNode, 1);
      selection!.removeAllRanges();
      selection!.addRange(newRange);
    } else {
    }
  };
  return (
    <div className="flex justify-center w-full h-full">
      <div className="flex-[0.45_1_0%] flex-col flex h-full">
        <div className="flex scroll-auto flex-col dark:bg-zinc-900 min-w-[500px] h-[calc(100%-60px)]">
          <div className="relative h-auto max-h-[50%]">
            <textarea
              rows={1}
              ref={titleArea}
              onChange={onTitleChange}
              placeholder="제목을 입력해주세요.."
              className={`my-4 relative overflow-auto w-full p-0 px-4
          font-bold text-2xl border-none resize-none bg-[rgba(0,0,0,0)]
            focus:border-gray-500 focus:ring-0`}
            />
          </div>
          <div
            id="editor"
            className=" relative px-4  dark:bg-zinc-900 min-h-[50px]"
          >
            <div className="flex items-center justify-start border-y-[2px] h-full dark:border-gray-500 font-semibold">
              <button
                onClick={() => {
                  setStyle("font-size: 2.25rem; font-weight:700;");
                }}
                className="relative w-10 h-full text-sm"
              >
                H1
              </button>
              <button className="relative w-10 h-full text-sm">H2</button>
              <button className="relative w-10 h-full text-sm">H3</button>
              <span className="relative  h-2/4 border-[1px] dark:border-gray-500" />
              <button className="relative w-10 h-full text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={0}
                  stroke="currentColor"
                  className="w-5 h-5 m-auto"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div
            id="editor_body_scroll"
            className="overflow-auto relative h-full  focus:outline-none px-4 py-4 w-full
            bg-[rgba(0,0,0,0)] dark:bg-zinc-900"
          >
            <div
              id="editor_body"
              onInput={onBodyInput}
              ref={bodyArea}
              placeholder="내용을 입력해주세요.."
              contentEditable="true"
              className="relative focus:outline-none  w-full  h-full
            bg-[rgba(0,0,0,0)] dark:bg-zinc-900"
            ></div>
          </div>
        </div>
        <div className="h-[60px] relative flex items-center w-full  border-t-[1px] border-gray-400 dark:bg-zinc-700 bg-gray-200">
          <button className="absolute items-center inline-block p-2 text-lg font-semibold rounded-lg right-2 bg-emerald-500 hover:bg-emerald-700">
            Write Post
          </button>
          <button
            onClick={() => {
              router.back();
            }}
            className="absolute items-center inline-block p-2 text-lg font-semibold rounded-lg left-2 bg-slate-600 hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default write;
