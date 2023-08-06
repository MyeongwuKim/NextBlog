import CPost from "@/components/post";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { getToken } from "next-auth/jwt";
import { Account, Post } from "@prisma/client";
import prisma from "@/lib/server/client";

//CBody 그대로 두고, query string에따라 PostList를 요청받게함
//Post클릭시 글 이동

interface PostListProps {
  Posts: (Post & { _count: { comments: number } })[];
}

const PostList: NextPage<PostListProps> = ({ Posts }) => {
  const router = useRouter();
  useEffect(() => {}, [router]);
  useEffect(() => {
    console.log(Posts);
  }, [Posts]);
  return (
    <div>
      {Posts?.map((post) => {
        return <CPost key={post.id} post={post} />;
      })}
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
