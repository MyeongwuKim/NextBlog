import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface callbackData {
  content: string;
  link: string;
}
interface ILinkBox {
  enable: boolean;
  width: string;
  height: string;
  posY: number;
  posX: number;
  callback: (data: callbackData | void) => void;
}
/**링크박스 (데이터리스트,현재값,버튼스타일,메뉴스타일,콜백) */
const CLinkBox: NextPage<ILinkBox> = ({
  enable,
  width,
  height,
  posX,
  posY,
  callback,
}) => {
  const [open, setOpenState] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<callbackData>();

  useEffect(() => {
    setOpenState(enable);
    clearErrors(["content", "link"]);
  }, [enable]);
  return (
    <div id="linkbox" className={`${open ? "block" : "hidden"}`}>
      <div
        id="linkbox_box"
        style={{ width, height, left: posX, top: posY }}
        className={`absolute dark:bg-zinc-800 z-20 rounded-lg `}
      >
        <form
          onSubmit={handleSubmit(
            (data) => {
              callback(data);
            },
            (error) => {
              console.log(error);
            }
          )}
        >
          <div className="h-auto w-full relative p-4 font-semibold text-slate-200 text-lg">
            <div className="flex items-center">
              <span className="w-auto basis-[40px] mr-2">내용</span>
              <input
                id="content"
                placeholder="내용입력"
                {...register("content", {
                  required: "한글자 이상 입력해주세요",
                })}
                className="outline-none w-full bg-transparent border-b-2 focus:border-emerald-500"
              />
            </div>

            {errors.content && errors.content.type == "required" ? (
              <div className="text-sm mt-1 text-red-500 absolute right-10">
                {errors.content?.message}
              </div>
            ) : (
              ""
            )}

            <div className="mb-6" />
            <div className="flex items-center">
              <span className="w-auto basis-[40px] mr-2">링크</span>
              <input
                id="link"
                placeholder="링크주소 입력"
                {...register("link", {
                  required: "한글자 이상 입력해주세요",
                })}
                className="outline-none w-full bg-transparent border-b-2 focus:border-emerald-500"
              />
            </div>
            {errors.link && errors.link.type == "required" ? (
              <div className="text-sm mt-1 text-red-500 absolute right-10">
                {errors.link?.message}
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            id="linkbox_footer"
            className="h-[60px] relative bottom-0 flex items-center w-full"
          >
            <button
              type="submit"
              className="py-2 px-4 select-none absolute items-center text-lg font-semibold rounded-lg right-2 bg-gray-500 hover:bg-gray-700"
            >
              Ok
            </button>
          </div>
        </form>
      </div>
      <div
        onClick={() => {
          setOpenState((prev) => (prev ? false : true));
          callback();
        }}
        id="linkBox_closePanel"
        className={`z-10 w-full h-full fixed top-0 left-0 ${
          open ? "block" : "hidden"
        }
      `}
      ></div>
    </div>
  );
};

export default CLinkBox;
