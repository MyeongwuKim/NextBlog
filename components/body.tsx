import CSideMenu from "./side";
import { NextPage } from "next";
import { useRouter } from "next/router";

interface IBodyProps {
  children: React.ReactNode;
}
const CBody: NextPage<IBodyProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="flex w-full h-full grid-cols-2 overflow-auto auto-cols-auto">
      <div className="flex-[0.7_0.7_0%]">
        <CSideMenu></CSideMenu>
      </div>
      <div className="flex-[1.5_1.5_0%] w-full overflow-auto px-14">
        <div className="w-full h-[60px]" />
        {children}
      </div>
      <div className="flex-[0.5_0.5_0%]">
        <div className="relative flex flex-row justify-end w-auto pl-3 mt-2">
          <button className="order-1 mr-2">
            <div className="relative flex flex-row items-center justify-center w-auto h-auto rounded-full bg-slate-500">
              <span className="relative p-2 text-sm font-semibold text-center text-white">
                명우
              </span>
            </div>
          </button>
          <button
            onClick={() => {
              router.push("/write");
            }}
            className="order-last basis-10"
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default CBody;
