import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "./modal";
import { registModalState } from "hooks/useEvent";

interface Modal {
  msg: string;
  btnMsgs: string[];
  width?: number;
  callback?: () => void;
}

const ModalPotal = () => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [useModal, setUseModal] = useState<Modal | null>(null);
  registModalState(setUseModal);

  useEffect(() => {
    setElement(document.getElementById("modal"));
  }, []);

  if (!element) {
    return <></>;
  }
  return createPortal(
    !useModal ? (
      <></>
    ) : (
      <Modal
        btnMsgs={useModal.btnMsgs}
        msg={useModal.msg}
        modalHandler={setUseModal}
      />
    ),
    element
  );
};

export default ModalPotal;
