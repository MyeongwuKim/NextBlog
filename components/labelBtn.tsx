import Link from "next/link";
import { useEffect, useState } from "react";

interface LabelBtnProps {
  contents: string;
  anyRef?: any;
  url?: string;
  onClick?: () => void;
  isShallow?: boolean;
  id?: string;
  addStyle?: string;
  isDisable?: boolean;
}

const lblBtnStyle = `enabled:text-gray-400 enabled:dark:text-gray-500 
      md:disabled:border-b-2 md:disabled:border-zinc-600 md:disabled:dark:border-gray-300
      disabled:dark:text-gray-300 disabled:text-zinc-600  disabled:pointer-events-none
      enabled:hover:text-zinc-600 enabled:hover:dark:text-gray-300
       text-center truncate  w-auto text-lg font-semibold`;

const LabelBtn = ({
  url,
  onClick,
  anyRef,
  contents,
  id,
  addStyle,
  isDisable,
  isShallow,
}: LabelBtnProps) => {
  return url ? (
    <Link href={url} className={` ${lblBtnStyle} ${addStyle}`}>
      <button
        onClick={onClick ? onClick : null}
        id={id}
        ref={(element) => {
          if (anyRef) anyRef.current[id] = element;
        }}
        type="button"
        disabled={isDisable}
        className={`${lblBtnStyle} ${addStyle}`}
      >
        <span className="relative">{contents}</span>
      </button>
    </Link>
  ) : (
    <button
      onClick={onClick ? onClick : null}
      id={id}
      ref={(element) => {
        if (anyRef) anyRef.current[id] = element;
      }}
      type="button"
      disabled={isDisable}
      className={`${lblBtnStyle} ${addStyle}`}
    >
      <span className="relative">{contents}</span>
    </button>
  );
};

export default LabelBtn;
