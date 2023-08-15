import { registLoadingState } from "@/hooks/useGlobal";
import { useEffect, useState } from "react";

const Loading = () => {
  const [enable, setEnable] = useState<boolean>(false);
  useEffect(() => {
    registLoadingState(setEnable);
  }, []);
  return (
    <div
      className={`${
        enable ? "block" : "hidden"
      } z-[9999] bg-[rgba(0,0,0,0.2)] w-full h-full flex justify-center items-center absolute  left-0 top-0`}
    >
      <div className="loadingio-spinner-spinner-q4iokninqxs">
        <div className="ldio-fa83pt8hugh">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
