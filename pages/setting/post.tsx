import { setHeadTitle } from "@/hooks/useData";
import { NextPage } from "next";

const Post: NextPage = () => {
  setHeadTitle("작성한 글 관리");
  return (
    <div className="h-full  w-full  flex flex-col">
      <div className="w-full h-full">Post!</div>
    </div>
  );
};

export default Post;
