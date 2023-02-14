import CSideMenu from "./side";
import { NextPage } from "next";
import CPost from "./post";

interface IBodyProps {
  children: React.ReactNode;
}
const CBody: NextPage<IBodyProps> = ({ children }) => {
  return (
    <div className="flex w-full h-full grid-cols-2 overflow-auto auto-cols-auto">
      <div className="flex-[0.7_0.7_0%]">
        <CSideMenu></CSideMenu>
      </div>
      <div className="flex-[1.5_1.5_0%] w-full overflow-auto px-14">
        <div className="w-full h-[60px]"></div>
        {children}
      </div>
      <div className="flex-[0.5_0.5_0%]"></div>
    </div>
  );
};

export default CBody;
