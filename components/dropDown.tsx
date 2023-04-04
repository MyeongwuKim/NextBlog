import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";

interface IDropDown {
  useTag: boolean;
  items: IDropDownItem[];
  buttnStyle: IButtnStyle;
  menuStyle: IMenuStyle;
  callback?: (result: any) => void;
  showValue?: any;
}
interface IButtnStyle {
  width: number;
  height: number;
}
interface IMenuStyle {
  width: number;
  height: number | string;
  left?: number;
  top?: number;
  right?: number;
}
interface IDropDownItem {
  tag?: any;
  name: string;
  value: any;
  selected: boolean;
}
var selectIdx: number;
/**드랍다운 메뉴(데이터리스트,현재값,버튼스타일,메뉴스타일,콜백) */
const CDropDown: NextPage<IDropDown> = ({
  useTag,
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
    selectIdx = 0;
  }, []);
  useEffect(() => {
    setOpenState(false);
    items.forEach((item, idx) => {
      if (item.value == showValue) {
        items[selectIdx].selected = false;
        selectIdx = idx;
        item.selected = true;
        setBoxItems(items);
        // if (callback) callback(item.value);
      }
    });
  }, [showValue]);
  console.log(showValue);
  return (
    <div>
      <div className="relative">
        <div
          style={{ width: buttnStyle.width, height: buttnStyle.height }}
          className={`select-none relative flex items-center justify-between dark:bg-zinc-900  hover:dark:bg-slate-800
          `}
          onClick={() => {
            setOpenState((prev) => (prev ? false : true));
          }}
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
          className={`absolute dark:bg-zinc-900 z-20 ${
            open ? "block" : "hidden"
          }`}
        >
          {items.map((item: IDropDownItem, idx) => {
            return (
              <div
                onClick={() => {
                  if (callback) callback(item.value);
                }}
                key={idx}
                className="select-none flex justify-between px-2  items-center hover:dark:bg-slate-800"
              >
                <div
                  className={`text-lg mb-1 ${
                    item.selected ? "text-emerald-500" : ""
                  }`}
                >
                  {item.tag ? item.tag : item.name}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-4 h-4 text-emerald-500 ${
                    item.selected ? "block" : "hidden"
                  } ${item.tag ? "hidden" : "block"}
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
    </div>
  );
};

export default CDropDown;
