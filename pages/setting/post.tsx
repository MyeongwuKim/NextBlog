import { setHeadTitle } from "@/hooks/useEvent";
import { NextPage } from "next";
import { useEffect } from "react";

const Post: NextPage = () => {
  useEffect(() => {
    setHeadTitle("작성글");
  }, []);
  return (
    <div className="h-full  w-full  flex flex-col">
      <div className="w-full h-full">Post!</div>
    </div>
  );
};

export default Post;
