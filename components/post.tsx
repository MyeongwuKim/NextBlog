import { getDeliveryDomain, getFormatDate } from "@/hooks/useUtils";
import { Post } from "@prisma/client";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import WithHead from "./WithHead";
import CompImg from "./CompImg";

interface PostProps {
  post: Post & { _count: { comments: number } };
}

const CPost: NextPage<PostProps> = ({ post }) => {
  const router = useRouter();
  const [createTime, setCreateTime] = useState<string>();

  useEffect(() => {
    setCreateTime(getFormatDate(post?.createdAt));
  }, [post]);
  return (
    <div className="w-full h-auto mb-16">
      <div className="flex felx-row items-center mb-4">
        <CompImg
          style="mr-4 flex-none basis-2/6 h-40"
          thumbnail={post?.thumbnail}
        />
        <div className="basis-4/6 flex flex-col">
          <div className="flex items-center mb-4 space-x-2 text-lg dark:text-gray-400 text-slate-400">
            <span>{createTime} 작성</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            <span>{post._count.comments}</span>
          </div>
          <div
            className="mb-4 text-3xl font-bold basis-[100px]
          max-h-28 overflow-hidden break-all text-ellipsis"
          >
            {post.title}
          </div>
        </div>
      </div>
      <div className="border-b-[2px] mb-4" />
      <div
        style={{ display: "table" }}
        className="table-fixed
        overflow-hidden text-ellipsis w-full mb-4 font-semibold text-xl
        "
      >
        <p
          style={{
            display: "table-cell",
          }}
          className=" truncate"
        >
          {post?.preview}
        </p>
      </div>
      <div className="relative h-8">
        <button
          className="absolute text-white right-0 items-center 
         inline-block p-2 text-lg font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-700"
          onClick={() => {
            router.push(`/post/${post?.id}`);
          }}
        >
          Read More
        </button>
      </div>
    </div>
  );
};

export default CPost;
