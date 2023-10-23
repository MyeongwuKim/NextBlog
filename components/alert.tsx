import { NextPage } from "next";
import { useEffect, useState } from "react";
import * as ReactDOMClient from "react-dom/client";
import CancelBtn from "./cancelBtn";
import OkBtn from "./okBtn";

interface AlertProps {
  msg: string;
  btnMsgs: string[];
  root: ReactDOMClient.Root;
  width?: number;
  callback?: () => void;
}

let alertWidth = 400;

// let posX = (window.innerWidth - alertWidth) / 2;
const Alert: NextPage<AlertProps> = ({
  msg,
  btnMsgs,
  root,
  callback,
  width,
}) => {
  return (
    <div id="alertWindow" className="fixed left-0 top-0 z-[9998]">
      <div
        style={{
          width,
          left: `calc(${(window.innerWidth - alertWidth) / 2}px)`,
        }}
        id="alertBody"
        onClick={() => {
          //document.getElementById("cautionWindow").remove();
        }}
        className={`absolute p-4 top-16 flex flex-col items-center bg-gray-100
       z-[99]  h-auto dark:bg-zinc-800 rounded-md shadow-xl`}
      >
        <div
          dangerouslySetInnerHTML={{ __html: msg }}
          className="relative text-center mb-4 font-semibold text-lg break-words w-full h-auto"
        ></div>
        <div className="w-full flex flex-row justify-between">
          {btnMsgs.length > 1 ? (
            <CancelBtn
              content={btnMsgs[0]}
              height={40}
              width={120}
              onClickEvt={() => {
                root.unmount();
              }}
            />
          ) : null}
          <OkBtn
            content={btnMsgs.length == 1 ? btnMsgs[0] : btnMsgs[1]}
            height={40}
            width={120}
            onClickEvt={() => {
              root.unmount();
              callback();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Alert;
