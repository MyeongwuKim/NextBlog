import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";

interface IDropDown {
  showValue?: number;
  items: IDropDownItem[];
  buttnStyle: IButtnStyle;
  menuStyle: IMenuStyle;
  callback?: (result: any) => void;
}
interface IButtnStyle {
  width: number;
  height: number;
}
interface IMenuStyle {
  width: number;
  height: number;
  left: number;
  top: number;
}
interface IDropDownItem {
  name: string;
  value: string;
  selected: boolean;
}
var selectIndex: number;
/**드랍다운 메뉴(데이터리스트,현재값,버튼스타일,메뉴스타일,콜백) */
const CDropDown: NextPage<IDropDown> = ({
  items,
  showValue,
  buttnStyle,
  menuStyle,
  callback,
}) => {
  const menuBox = useRef<HTMLDivElement>(null);
  const [open, setOpenState] = useState<boolean>(false);
  const [boxItems, setBoxItems] = useState<IDropDownItem[]>(items);

  useEffect(() => {
    boxItems[0].selected = true;
    selectIndex = 0;
  }, []);

  return (
    <>
      <div
        onClick={() => {
          setOpenState((prev) => (prev ? false : true));
        }}
        style={{ width: buttnStyle.width, height: buttnStyle.height }}
        className={`select-none relative flex items-center justify-between dark:bg-zinc-900  hover:dark:bg-slate-800
        `}
      >
        <div className="text-[18px] text-center">{showValue}</div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-4 ${open ? "hidden" : "block"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-4 ${open ? "block" : "hidden"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 15.75l7.5-7.5 7.5 7.5"
            />
          </svg>
        </div>
      </div>
      <div
        id="dropdown-menu"
        ref={menuBox}
        style={{
          left: menuStyle.left,
          top: menuStyle.top,
          width: menuStyle.width,
          height: menuStyle.height,
        }}
        className={`absolute dark:bg-zinc-900 z-20 overflow-auto ${
          open ? "block" : "hidden"
        }`}
      >
        {items.map((item: IDropDownItem, idx) => {
          return (
            <div
              onClick={() => {
                setOpenState((prev) => (prev ? false : true));
                if (selectIndex == idx) return;
                items[selectIndex].selected = false;
                selectIndex = idx;
                item.selected = true;
                setBoxItems(items);
                if (callback) callback(item.value);
              }}
              key={idx}
              className="select-none flex justify-between px-2  items-center hover:dark:bg-slate-800"
            >
              <div className="text-lg mb-1">{item.name}</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-4 h-4 text-emerald-500 ${
                  item.selected ? "block" : "hidden"
                }
                `}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
          );
        })}
      </div>
      <div
        onClick={() => {
          setOpenState((prev) => (prev ? false : true));
        }}
        id="dropdown-closePanel"
        className={`z-10 w-full h-full fixed top-0 left-0 ${
          open ? "block" : "hidden"
        }
      `}
      ></div>
    </>
  );
};

export default CDropDown;
