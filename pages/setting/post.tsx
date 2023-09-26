import { setHeadTitle } from "@/hooks/useEvent";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect } from "react";

const PostList: NextPage = () => {
  useEffect(() => {
    setHeadTitle("작성글");
  }, []);
  return (
    <div className="h-full  w-full  flex flex-col">
      <div className="relative text-xl mb-5 font-bold">글 관리</div>
    </div>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {},
  };
}
export default PostList;
