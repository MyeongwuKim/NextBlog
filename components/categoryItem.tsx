import { Category } from "@prisma/client";
import { NextPage } from "next";
import { useRef, useState } from "react";
import { DragEvent } from "react";
import NormalBtn from "./normalBtn";

interface CategoryItemProps {
  data: Category;
  index: number;
  changeOrderCallback: (changeIndex: number, originIndex: number) => void;
  overCallback: (overIndex: number, posIndex: number) => void;
  endCallback: () => void;
  removeCallback: (index) => void;
  changeStateCallback: (index, value) => void;
}
let selectIndex = -1;
let changeIndex = selectIndex;

const CategoryItem: NextPage<CategoryItemProps> = ({
  data,
  index,
  changeOrderCallback,
  overCallback,
  endCallback,
  removeCallback,
  changeStateCallback,
}) => {
  let inputRef = useRef<HTMLInputElement>(null);
  let [drag, setDrag] = useState<boolean>(false);
  let [itemFocus, setItemFocus] = useState<boolean>(false);
  let [itemModify, setItemModify] = useState<boolean>(false);

  const onDropEvt = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragStartEvt = (e: DragEvent) => {
    setDrag(true);
    selectIndex = index;
    e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 20, 20);
    let origin = e.currentTarget.parentElement as HTMLElement;
    origin.classList.add("opacity-50");
  };

  const onDragEndEvt = (e: DragEvent) => {
    changeOrderCallback(changeIndex, selectIndex);
    endCallback();
    selectIndex = -1;
    changeIndex = selectIndex;
    let origin = e.currentTarget.parentElement as HTMLElement;
    origin.classList.remove("opacity-50");
    setDrag(false);
  };

  const onDragOverEvt = (e: DragEvent) => {
    let target = e.currentTarget as HTMLElement;
    let { width, height, x, y } = target.getClientRects()[0];

    if (selectIndex.toString() == target.id) return;
    if (e.clientX >= x && e.clientX <= x + width) {
      if (
        (e.clientY >= y && e.clientY <= y + height / 2) ||
        e.clientY >= y + height / 2
      ) {
        if (e.clientY <= y + height / 2) changeIndex = parseInt(target.id) - 1;
        else if (e.clientY >= y + height / 2) changeIndex = parseInt(target.id);

        overCallback(parseInt(target.id), changeIndex);
      }
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onMouseEnter={() => {
        setItemFocus(true);
      }}
      onMouseLeave={() => {
        setItemFocus(false);
      }}
      id={index.toString()}
      draggable={false}
      onDragEnd={onDragEndEvt}
      onDragStart={onDragStartEvt}
      onDragOver={onDragOverEvt}
      className={`mb-1 select-none border-2 flex items-center h-16 dark:border-zinc-800 dark:bg-zinc-900 bg-gray-50`}
    >
      <div
        className={`relative h-full flex items-center justify-center border-r-2
    dark:border-zinc-800 mr-4 dark:bg-zinc-700 bg-gray-100`}
      >
        <span className="inline-block w-auto relative mx-4 h-auto">·</span>
      </div>
      <div draggable={true} className="w-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 mr-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </div>

      <input
        placeholder="카테고리 이름을 입력해주세요"
        className={`sm:text-base ${
          itemModify
            ? `border-2  focus:ring-2
        focus:ring-emerald-500 focus:border-b-0`
            : ""
        }
        focus:outline-none font-sans dark:border-zinc-700 blur:border-gray-200
        p-2 bg-transparent ring-0 dark:text-gray-200  dark:placeholder:text-gray-400 placeholder:text-gray-200 text-xl text-slate-800 w-1/3`}
        onChange={() => {}}
        ref={inputRef}
        readOnly={itemModify ? false : true}
        defaultValue={data?.name}
      />
      <div className={`${itemFocus ? "block" : "hidden"} absolute right-4`}>
        <div className={`${itemModify ? "hidden" : ""} flex flex-row gap-2`}>
          <NormalBtn
            onClickEvt={() => {
              setItemModify(true);
              inputRef.current.focus();
            }}
            width={45}
            height={40}
            content="수정"
          />
          <NormalBtn
            onClickEvt={() => {
              removeCallback(index);
            }}
            width={45}
            height={40}
            content="삭제"
          />
        </div>
        <div
          className={`${itemModify ? "block" : "hidden"} flex flex-row gap-2`}
        >
          <NormalBtn
            onClickEvt={() => {
              setItemModify(false);
            }}
            width={45}
            height={40}
            content="취소"
          />
          <NormalBtn
            onClickEvt={() => {
              inputRef.current.value = inputRef.current.value;
              changeStateCallback(index, inputRef.current.value);
              setItemModify(false);
            }}
            width={45}
            height={40}
            content="확인"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryItem;
