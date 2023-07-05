import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const items: ItemProps[] = [
  { name: "프로필 관리", router: "profile" },
  { name: "글 관리", router: "post" },
  { name: "댓글 관리", router: "comment" },
  { name: "카테고리 관리", router: "category" },
];

interface ItemProps {
  name: string;
  router: string;
}

let prevBtn = null;
const SettingSide = () => {
  const router = useRouter();
  const [selectedBtn, setSelectedBtn] = useState<HTMLButtonElement>(null);
  const btnRef = useRef<any>({});

  useEffect(() => {
    if (!router.pathname.includes("setting")) return;
    let path = router.pathname.replace("/setting/", "");
    if (!prevBtn) {
      btnRef.current[path].disabled = true;
      prevBtn = btnRef.current[path];
    } else {
      prevBtn.disabled = false;
      btnRef.current[path].disabled = true;
      prevBtn = btnRef.current[path];
    }
  }, [router]);

  return (
    <div className="pl-10 py-10 h-full w-full">
      <div
        className={`overflow-auto flex flex-col justify-center items-center
         left-0 h-auto w-full border-r-[2px] border-gray-200
        dark:border-zinc-800 
 `}
      >
        {items.map((item, i) => (
          <button
            ref={(element) => {
              btnRef.current[item.router] = element;
            }}
            disabled={false}
            onClick={(e) => {
              router
                .push(`/setting/${item.router}`, undefined, { shallow: true })
                .then(() => {});
            }}
            id={item.router}
            className="disabled:text-emerald-500 
            isabled:pointer-events-none text-center p-2 enabled:hover:bg-gray-200 
            enabled:hover:dark:bg-zinc-800  w-full text-lg font-semibold"
            key={i}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingSide;
