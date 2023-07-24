import React, { useCallback, useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

interface Props {
  refContainer: React.RefObject<HTMLDivElement> | null;
  editorView: EditorView;
  handleTitleChange: (title: string) => void;
}

interface IPostData {}

const Editor: React.FC<Props> = (props) => {
  const titleArea = useRef<any>();
  const { editorView, refContainer, handleTitleChange } = props;
  const router = useRouter();
  const { register, handleSubmit, setValue } = useForm();

  const onTitleChange = (e: any) => {
    const { current } = titleArea;
    handleTitleChange(current.value);
    current!.style.height = "auto";
    current!.style.height = current!.scrollHeight + "px";
  };

  return (
    <div className="h-full w-full dark:bg-black bg-white">
      <div className="flex flex-col relative  h-[calc(100%-60px)]">
        <div
          id="editor_title"
          className=" flex-auto select-none relative  max-h-[30%]"
        >
          <textarea
            spellCheck={false}
            tabIndex={1}
            rows={1}
            ref={titleArea}
            onChange={onTitleChange}
            placeholder="제목을 입력해주세요"
            className={`placeholder-gray-300 p-4 placeholder:font-semibold relative w-full max-h-[100%] overflow-auto
          font-bold text-2xl border-none resize-none bg-[rgba(0,0,0,0)] outline-none
             focus:ring-0`}
          />
        </div>
        <div className="border-[1px] border-gray-300 dark:border-zinc-800"></div>
        <div
          onClick={() => {
            editorView?.focus();
          }}
          className="cursor-text p-4 relative h-full overflow-auto"
        >
          <div id="editor-wrapper" className="relative" ref={refContainer}>
            <div
              id="editor-placeholder"
              className="h-full flex items-center left-1 absolute z-[99] font-semibold text-[20px] text-gray-300"
            >
              <span
                className={`${
                  editorView?.contentDOM.innerText.trim().length > 0 ||
                  editorView?.contentDOM.children.length > 1
                    ? "hidden"
                    : "inline-block"
                }`}
              >
                내용을 입력해주세요
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        id="editor_footer"
        className="h-[60px] relative flex items-center w-full  border-t-[2px] border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 bg-gray-100"
      >
        <button className=" w-24 select-none absolute items-center inline-block p-2 text-lg font-semibold rounded-lg right-2 bg-emerald-500 hover:bg-emerald-700">
          작성하기
        </button>
        <button
          onClick={() => {
            router.back();
          }}
          className="w-24 select-none absolute items-center inline-block p-2 text-lg font-semibold rounded-lg left-2 bg-slate-600 hover:bg-slate-700"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default Editor;
