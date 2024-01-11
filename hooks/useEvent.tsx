import { Dispatch, SetStateAction } from "react";
import CautionMsg from "@/components/toast";
import * as ReactDOMClient from "react-dom/client";
import Alert from "@/components/modal";

interface Modal {
  msg: string;
  btnMsgs: string[];
  width?: number;
  callback?: () => void;
}
interface ToastProps {
  msg: string;
  isWarning: boolean;
}
let loadingState: Dispatch<SetStateAction<boolean>>;
let root = null;
let withHeadState: Dispatch<SetStateAction<string>>;
let modalState: Dispatch<SetStateAction<Modal | null>>;
let toastsState: Dispatch<SetStateAction<ToastProps[]>>;

export const registLoadingState = (
  state: Dispatch<SetStateAction<boolean>>
) => {
  loadingState = state;
};

export const registModalState = (
  state: Dispatch<SetStateAction<Modal | null>>
) => {
  modalState = state;
};

export const registToastsState = (
  state: Dispatch<SetStateAction<ToastProps[]>>
) => {
  toastsState = state;
};

export const registHeadState = (state: Dispatch<SetStateAction<string>>) => {
  withHeadState = state;
};

export const setHeadTitle = (title: string) => {
  withHeadState(title);
};

export const setLoading = (enable: boolean) => {
  loadingState(enable);
};

export const createModal = (
  msg: string,
  btnMsgs: string[],
  callback?: () => void,
  width?: number
) => {
  let modalInfo = { msg, btnMsgs, width, callback };
  loadingState((prev) => (prev == true ? !prev : prev));
  modalState(modalInfo);
};

export const createToast = (msg: string, isWarning: boolean) => {
  let lastToast = document.getElementById("toasts")?.lastChild as HTMLElement;
  let number = lastToast
    ? Number(lastToast.id.replace("_toastContainer", "")) + 1
    : 0;
  console.log(lastToast);

  let toastInfo = { msg, isWarning, index: number };
  toastsState((prev) => {
    let newPrev = [...prev];
    newPrev.push(toastInfo);
    return newPrev;
  });
};
