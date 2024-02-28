import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import LabelBtn from "./labelBtn";

const items: ItemProps[] = [
  { name: "프로필 ss관리", router: "profile" },
  { name: "글 관리", router: "post" },
  { name: "댓글 관리", router: "comment" },
  { name: "카테고리 관리", router: "category" },
];

interface ItemProps {
  name: string;
  router: string;
}

const SettingSide = () => {
  const router = useRouter();

  return (
    <div className="pl-10 py-10 h-full w-full">
      <div
        className={`overflow-auto flex flex-col justify-center items-center
         left-0 h-auto w-full border-r-[2px] border-gray-200
        dark:border-zinc-800 
 `}
      >
        {items.map((item, i) => (
          <LabelBtn
            key={i}
            url={`${router?.query.userId}/manage/${item.router}`}
            isDisable={
              router.pathname.replace("/manage/", "") == item.router
                ? true
                : false
            }
            id={item.router}
            contents={item.name}
          />
        ))}
      </div>
    </div>
  );
};

export default SettingSide;
