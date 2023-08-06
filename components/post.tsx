import { Post } from "@prisma/client";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface PostProps {
  post: Post & { _count: { comments: number } };
}

const CPost: NextPage<PostProps> = ({ post }) => {
  const router = useRouter();
  const [createTime, setCreateTime] = useState<string>();
  useEffect(() => {
    let date = [
      new Date(post?.createdAt).getFullYear(),
      "/",
      "0" + (new Date(post?.createdAt).getMonth() + 1),
      "/",
      "0" + new Date(post?.createdAt).getDate(),
    ].join("");
    setCreateTime(date);
  }, [post]);
  return (
    <div className="w-full h-auto mb-16">
      <div className="mb-4 text-3xl font-bold">{post?.title}</div>
      <div className="mb-4 space-x-3 text-lg dark:text-gray-400 text-slate-400">
        <span>{createTime} 작성</span>
        <span>{post._count.comments} 개의 댓글 </span>
      </div>
      {/* <div className="relative mb-4 text-lg">공부,코딩,알고리즘</div> */}
      <div className="border-b-[2px] mb-4" />
      <div className="mb-4 font-semibold min-h-[40px] max-h-[300px]">
        {post?.content}
      </div>
      <div className="relative h-8">
        <button
          onClick={() => {
            router.push(`/post/name=${post?.id}`);
          }}
          className="absolute right-0 items-center inline-block p-2 text-lg font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-700"
        >
          Read More
        </button>
      </div>
    </div>
  );
};

export default CPost;
