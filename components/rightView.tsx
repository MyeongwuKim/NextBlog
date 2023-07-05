import { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  ButtonHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Loading from "./loading";
import App from "next/app";
import ProfileBox from "./settingBox";

interface RightProps {
  openCallback: (mode: "signin" | "signup" | "none") => void;
  loadingCallback?: (isLoading: boolean) => void;
}

const RightView: NextPage<RightProps> = ({ openCallback, loadingCallback }) => {
  const { data, update, status } = useSession();
  const profileBtn = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [ddenable, setddEnable] = useState<boolean>(false);
  const ddEnableCallback = useCallback((enable: boolean) => {
    setddEnable(enable);
  }, []);

  return (
    <>
      <div
        className={`w-full relative flex flex-row justify-start   pl-4 mt-2`}
      ></div>
    </>
  );
};

export default RightView;

{
  /* <button
onClick={() => {
  loadingCallback(true);
  signOut({ redirect: false }).then((res) => {
    update();
    loadingCallback(false);
  });
}}
className={`${
  status == "authenticated" ? "span" : "hidden"
} order-1 mr-2`}
>
<div className="relative flex flex-row items-center justify-center w-auto h-auto rounded-2xl bg-slate-500">
  <span className="relative py-2 px-3 text-sm font-semibold text-center text-white">
    Sign Out
  </span>
</div>
</button>
<button
onClick={() => {
  router.push("/write");
}}
className={`${
  status == "authenticated" ? "span" : "hidden"
} order-last basis-10`}
>
<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  strokeWidth={1.5}
  stroke="currentColor"
  className="w-8 h-8"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
  />
</svg>
</button> */
}
