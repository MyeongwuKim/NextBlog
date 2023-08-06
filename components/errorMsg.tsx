import { NextPage } from "next";
import { useEffect } from "react";
import * as ReactDOMClient from "react-dom/client";

interface ErrorMsgProps {
  msg: string;
  isWarning: boolean;
  root: ReactDOMClient.Root;
}
const fixedTime = 2;
let fixedWidth = 0;
let timer = null;

const ErrorMsg: NextPage<ErrorMsgProps> = ({ msg, root, isWarning }) => {
  useEffect(() => {
    fixedWidth = document.getElementById("cautionBody").clientWidth;
    if (timer) {
      clearInterval(timer);
    }
    timeoutLogic();
  });

  const timeoutLogic = () => {
    let timeBar = document.getElementById("cautionTimeBar");
    timeBar.style.width = fixedWidth.toString();
    +"px";
    let rate = Number((fixedWidth / fixedTime).toFixed(2));
    let currentTime = fixedTime;

    timer = setInterval(() => {
      if (timeBar.clientWidth <= 0) {
        clearInterval(timer);
        root.unmount();
      }
      currentTime -= 0.1;
      timeBar.style.width =
        (rate * Number(currentTime.toFixed(2))).toString() + "px";
    }, 100);
  };

  return (
    <div id="cautionWindow" className="absolute left-0 top-0 ">
      <div
        id="cautionBody"
        onClick={() => {
          root.unmount();
          //document.getElementById("cautionWindow").remove();
        }}
        className={`absolute left-2 top-2 flex flex-col items-center bg-gray-100
       z-[99] w-[280px] min-h-[120px] h-auto dark:bg-zinc-800 rounded-md shadow-xl`}
      >
        <div
          style={{ width: "280px" }}
          id="cautionTimeBar"
          className={`absolute left-0 transition-all h-2 ${
            isWarning ? "bg-red-500" : "bg-green-500"
          } rounded-t-md`}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-8 h-8 ${
            isWarning ? "text-red-500" : "text-green-500"
          } mt-6`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <div className="text-center p-2 font-semibold text-lg break-words w-full h-auto">
          {msg}
        </div>
      </div>
    </div>
  );
};

export default ErrorMsg;
