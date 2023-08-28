import { Dispatch, SetStateAction } from "react";
import ErrorMsg from "@/components/errorMsg";
import * as ReactDOMClient from "react-dom/client";
import Alert from "@/components/alert";

let loadingState: Dispatch<SetStateAction<boolean>>;
let root = null;
let withHeadState: Dispatch<SetStateAction<string>>;

export const registLoadingState = (
  state: Dispatch<SetStateAction<boolean>>
) => {
  loadingState = state;
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

export const createErrorMsg = (msg: string, isWarning: boolean) => {
  loadingState((prev) => (prev == true ? !prev : prev));
  if (!document.getElementById("cautionWindow")) {
    root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
  } else {
    root.unmount();
    root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
  }

  root.render(<ErrorMsg root={root} msg={msg} isWarning={isWarning} />);
};

export const createAlert = (
  msg: string,
  btnMsgs: string[],
  callback?: () => void,
  width?: number
) => {
  loadingState((prev) => (prev == true ? !prev : prev));
  if (!document.getElementById("cautionWindow")) {
    root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
  } else {
    root.unmount();
    root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
  }

  root.render(
    <Alert
      root={root}
      msg={msg}
      btnMsgs={btnMsgs}
      callback={callback}
      width={width}
    />
  );
};
