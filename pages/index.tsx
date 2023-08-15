import CPost from "@/components/post";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { getToken } from "next-auth/jwt";
import { Account, Post } from "@prisma/client";
import prisma from "@/lib/server/client";
import { getFormatImagesId } from "@/hooks/useUtils";

//CBody 그대로 두고, query string에따라 PostList를 요청받게함
//Post클릭시 글 이동

interface PostListProps {
  Posts: (Post & { _count: { comments: number } })[];
}

const PostList: NextPage<PostListProps> = ({ Posts }) => {
  const router = useRouter();
  useEffect(() => {}, [router]);
  useEffect(() => {}, [Posts]);
  return (
    <div>
      {Posts?.length > 0 ? (
        Posts?.map((post) => {
          return <CPost key={post.id} post={post} />;
        })
      ) : (
        <div className="w-full h-full flex items-center flex-col">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-40 h-40 relative mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
            />
          </svg>
          <div className="relative text-xl font-bold">작성된 글이 없습니다</div>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PostListProps> = async (
  context: GetServerSidePropsContext
) => {
  let { category } = context.query;
  let postData;
  if (category) {
    postData = await prisma.post.findMany({
      where: {
        categoryId: Number(category),
      },
      include: {
        _count: { select: { comments: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    postData = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: { select: { comments: true } },
      },
    });
  }

  return {
    props: {
      Posts: JSON.parse(JSON.stringify(postData)),
    },
  };
};
export default PostList;
