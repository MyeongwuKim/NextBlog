import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";

interface DropDownProps {
  info: { top: number; left: number; width?: number; height?: number };
  enable: boolean;
  items: { name: string; clickEvt?: () => void }[];
  dropdownCallback: (enable: boolean, selectData?: string) => void;
  defaultItemNumber?: number | string;
}
/**드랍다운 메뉴(데이터리스트,현재값,버튼스타일,메뉴스타일,콜백) */
let selectedBtn: HTMLElement = null;
const DropDownBox: NextPage<DropDownProps> = ({
  info,
  enable,
  dropdownCallback,
  items,
  defaultItemNumber,
}) => {
  const [closePanelSize, setClosePanelSize] = useState<{
    width: number;
    height: number;
  }>();
  const btnRef = useRef({});
  useEffect(() => {
    setClosePanelSize({
      height: window.innerHeight,
      width: window.innerWidth,
    });
    window.addEventListener("scroll", () => {
      dropdownCallback(false);
    });

    window.addEventListener("resize", () => {
      setClosePanelSize({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    });
    return window.removeEventListener("reset", () => {});
  }, []);

  useEffect(() => {
    if (defaultItemNumber == undefined) return;
    let ele = btnRef.current[`dropItem${defaultItemNumber}`] as HTMLElement;
    ele.classList.add("text-emerald-500");
    selectedBtn = ele;
  }, [defaultItemNumber]);

  return (
    <div
      onClick={() => {
        dropdownCallback(false);
      }}
      style={{ width: closePanelSize?.width, height: closePanelSize?.height }}
      className={`${enable ? "block" : "hidden"} fixed left-0 top-0`}
    >
      <div
        id="dropdown-menu"
        style={{
          top: info?.top,
          left: info?.left,
          width: info?.width ? info?.width : 140,
        }}
        className={`z-40 h-auto fixed ${
          enable ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`w-full h-full text-lg font-semibold
        [&>button]:p-2 shadow-lg dark:shadow-black
        flex-col flex items-center  relative dark:bg-zinc-800  bg-gray-50 z-20 ${
          enable ? "block" : "hidden"
        }`}
        >
          {items?.map((item, i) => {
            return (
              <button
                type="button"
                ref={(ele) => {
                  btnRef.current["dropItem" + i] = ele;
                }}
                key={i}
                className="w-full flex hover:dark:bg-zinc-700 hover:bg-gray-200 justify-center"
                onClick={() => {
                  if (typeof defaultItemNumber != "undefined") {
                    if (selectedBtn)
                      selectedBtn.classList.remove("text-emerald-500");

                    let ele = btnRef.current[`dropItem${i}`] as HTMLElement;
                    ele.classList.add("text-emerald-500");
                    selectedBtn = ele;
                  }

                  item.clickEvt();
                  dropdownCallback(false, item.name);
                }}
              >
                <div id={"dropItem" + i.toString()} defaultValue={""}>
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DropDownBox;
