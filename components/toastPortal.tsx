import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { registToastsState } from "hooks/useEvent";
import Toast from "./toast";

interface ToastProps {
  msg: string;
  isWarning: boolean;
  index: number;
}

const ToastPotal = () => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [toastArr, setToastArr] = useState<ToastProps[]>([]);
  registToastsState(setToastArr);

  useEffect(() => {
    setElement(document.getElementById("toast"));
  }, []);

  if (!element) {
    return <></>;
  }
  return createPortal(
    toastArr.length <= 0 ? (
      <></>
    ) : (
      <div
        id="toasts"
        className="pointer-events-none flex-wrap justify-start gap-2
        fixed w-full h-full flex flex-col"
      >
        {toastArr.map((v, i) => (
          <Toast
            key={v.index}
            isWarning={v.isWarning}
            msg={v.msg}
            index={v.index}
            toastArrHandler={setToastArr}
          />
        ))}
      </div>
    ),
    element
  );
};

export default ToastPotal;
