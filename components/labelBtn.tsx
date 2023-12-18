import { useEffect } from "react";

interface LabelBtnProps {
  anyRef?: any;
  onClick?: () => void;
  contents: string;
  id?: string;
  addStyle?: string;
  isDisable?: boolean;
}

const LabelBtn = ({
  anyRef,
  onClick,
  contents,
  id,
  addStyle,
  isDisable,
}: LabelBtnProps) => {
  return (
    <button
      id={id}
      ref={(element) => {
        if (anyRef) anyRef.current[id] = element;
      }}
      disabled={isDisable}
      onClick={onClick}
      className={`enabled:text-gray-400 enabled:dark:text-gray-500 
      md:disabled:border-b-2 md:disabled:border-zinc-600 md:disabled:dark:border-gray-300
      disabled:dark:text-gray-300 disabled:text-zinc-600  disabled:pointer-events-none
      enabled:hover:text-zinc-600 enabled:hover:dark:text-gray-300
       text-center truncate  w-auto text-lg font-semibold ${addStyle}`}
    >
      <span className="relative"> {contents}</span>
    </button>
  );
};

export default LabelBtn;
