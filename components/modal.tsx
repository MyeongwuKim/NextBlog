import { NextPage } from "next";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import * as ReactDOMClient from "react-dom/client";
import CancelBtn from "./cancelBtn";
import OkBtn from "./okBtn";

interface AlertProps {
  msg: string;
  btnMsgs: string[];
  width?: number;
  callback?: () => void;
  modalHandler: Dispatch<SetStateAction<null>>;
}

const Modal: NextPage<AlertProps> = ({
  msg,
  btnMsgs,
  callback,
  width,
  modalHandler,
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div
      id="_modalContainer"
      className="fixed z-[9998] w-full h-full bg-[rgba(0,0,0,0.4)]
      flex justify-center items-center"
    >
      <div
        id="_modalView"
        style={{
          width,
        }}
        onClick={() => {
          //document.getElementById("cautionWindow").remove();
        }}
        className={`p-4 top-16 flex flex-col items-center bg-gray-100
       z-[99] h-auto dark:bg-zinc-800 rounded-md shadow-xl`}
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
                modalHandler(null);
              }}
            />
          ) : null}
          <OkBtn
            content={btnMsgs.length == 1 ? btnMsgs[0] : btnMsgs[1]}
            height={40}
            width={120}
            onClickEvt={() => {
              if (callback) callback();
              modalHandler(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Modal;
