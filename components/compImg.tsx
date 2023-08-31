import { getDeliveryDomain } from "@/hooks/useUtils";
import Image from "next/image";
import { useEffect } from "react";

interface CompImgProps {
  thumbnail: string;
  onClickEvt?: () => void;
  style: string;
}
const CompImg = ({ thumbnail, style, onClickEvt }: CompImgProps) => {
  return (
    <div
      onClick={() => {
        if (onClickEvt) onClickEvt;
      }}
      className={`${onClickEvt ? "cursor-pointer" : ""} ${style}`}
    >
      {thumbnail ? (
        <Image
          src={thumbnail ? `${getDeliveryDomain(thumbnail, "thumbnail")}` : ""}
          alt="thumbnail"
          fill={true}
          className={`relative w-full h-full `}
        />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-full h-full dark:bg-zinc-700 
              bg-zinc-100 text-zinc-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      )}
    </div>
  );
};

export default CompImg;
