import { useEffect } from "react";

interface LabelBtnProps {
  anyRef?: any;
  onClick?: () => void;
  contents: string;
  id?: string;
  addStyle?: string;
}

const LabelBtn = ({
  anyRef,
  onClick,
  contents,
  id,
  addStyle,
}: LabelBtnProps) => {
  return (
    <button
      id={id}
      ref={(element) => {
        if (anyRef) anyRef.current[id] = element;
      }}
      disabled={false}
      onClick={onClick}
      className={`enabled:text-gray-400 text-left enabled:dark:text-gray-500 disabled:text-emerald-500
      disabled:pointer-events-none  enabled:hover:text-zinc-800
        enabled:hover:dark:text-gray-200 truncate  w-auto text-lg font-semibold ${addStyle}`}
    >
      <span className="relative"> {contents}</span>
    </button>
  );
};

export default LabelBtn;
