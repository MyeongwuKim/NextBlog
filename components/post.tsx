import { getDeliveryDomain, getFormatDate } from "@/hooks/useUtils";
import { Post } from "@prisma/client";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
        <div className={`mr-4 flex-none basis-2/6 h-40`}>
          {post?.thumbnail ? (
            <Image
              src={
                post?.thumbnail
                  ? `${getDeliveryDomain(post?.thumbnail, "thumbnail")}`
                  : ""
              }
              alt="thumbnail"
              fill={true}
              className={`relative w-full h-full `}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-full h-full dark:bg-zinc-700 
              bg-zinc-100 text-zinc-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          )}
        </div>
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
