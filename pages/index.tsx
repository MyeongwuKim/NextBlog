import CPost from "@/components/post";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/layout";
import { getToken } from "next-auth/jwt";
import { Account } from "@prisma/client";
import prisma from "@/lib/server/client";
import { request } from "http";

//CBody 그대로 두고, query string에따라 PostList를 요청받게함
//Post클릭시 글 이동

interface HomeProps {
  profile: ProfileType;
  category: CategoryType[];
}

type ProfileType = {
  avatar?: string;
  email: string;
  name: string;
  id: number;
  introduce?: string;
};

type CategoryType = {
  name: string;
  count: number;
};

const Home: NextPage<HomeProps> = ({ profile, category }) => {
  const router = useRouter();
  useEffect(() => {}, [router]);
  useEffect(() => {}, []);
  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => {
        return <CPost key={i} postId={i.toString()} />;
      })}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context: GetServerSidePropsContext
) => {
  const profileData = await prisma.account.findUnique({
    where: { email: "mw1992@naver.com" },
    select: {
      avatar: true,
      email: true,
      name: true,
      id: true,
      introduce: true,
      category: {
        orderBy: { order: "asc" },
        select: {
          name: true,
          _count: {
            select: {
              post: true,
            },
          },
        },
      },
    },
  });

  let profile = { ...profileData };
  delete profile.category;
  let category = profileData.category.map((v) => {
    let newData = { name: v.name, count: v._count.post };
    return newData;
  });

  return {
    props: {
      profile,
      category,
    },
  };
};
export default Home;
