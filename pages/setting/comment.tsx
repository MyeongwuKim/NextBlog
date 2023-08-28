import { setHeadTitle } from "@/hooks/useData";
import { NextPage } from "next";

const CommentList: NextPage = () => {
  setHeadTitle("코멘트 관리");
  return (
    <div className="h-full  w-full  flex flex-col">
      <div className="w-full h-full">Comment</div>
    </div>
  );
};

export default CommentList;
