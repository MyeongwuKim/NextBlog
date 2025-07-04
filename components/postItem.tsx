import { getDeliveryDomain, getFormatDate } from "@/hooks/useUtils";
import { Post } from "@prisma/client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CompImg from "@/components/compImg";
import dynamic from "next/dynamic";
import Link from "next/link";

interface PostProps {
  post: Post & { _count: { comments: number } };
}
//포스트 리스트아이템
const PostItem: NextPage<PostProps> = ({ post }) => {
  const router = useRouter();
  const [createTime, setCreateTime] = useState<string>();

  const onClickEvt = () => {
    router.push(`/${router.query.userId}/post?id=${post?.id}`);
  };

  useEffect(() => {
    setCreateTime(getFormatDate(post?.createdAt));
  }, [post]);
  return (
    <div
      className="w-full  mb-8 flex flex-col dark:bg-zinc-800
    bg-white text-zinc-400 border border-gray-200 rounded-lg shadow dark:border-gray-700"
    >
      {post?.thumbnail ? (
        <CompImg
          url={`/${router.query.userId}/post?id=${post?.id}`}
          style="w-full h-48 rounded-t-lg"
          thumbnail={post?.thumbnail}
          imgStyle="rounded-t-lg"
        />
      ) : null}
      <div className="py-5 px-2 h-42">
        <div className="flex items-center mb-4 space-x-2 text-base sm:text-sm dark:text-gray-400 text-slate-400">
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
        <Link
          href={`/${router.query.userId}/post?id=${post?.id}`}
          className="cursor-pointer text-3xl sm:text-2xl font-bold h-52
          text-zinc-600 dark:text-gray-200"
        >
          <div className="truncate text-ellipsis">{post?.title}</div>
        </Link>
        <div className="truncate font-normal mt-4 text-gray-700 dark:text-gray-300">
          {post?.preview}
        </div>
      </div>
    </div>
  );
};

export default PostItem;
