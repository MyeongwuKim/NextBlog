import CPost from "@/components/post";
import { readFileSync, readdirSync } from "fs";
import {
  GetServerSidePropsContext,
  GetStaticPaths,
  GetStaticProps,
  NextPage,
} from "next";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

//CBody 그대로 두고, query string에따라 PostList를 요청받게함
//Post클릭시 글 이동
const Home: NextPage = ({}) => {
  const router = useRouter();
  useEffect(() => {}, [router]);

  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => {
        return <CPost key={i} postId={i.toString()} />;
      })}
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // let token = await getToken({
  //   req: context.req,
  //   cookieName: process.env.NEXTAUTH_TOKENNAME,
  //   secret: process.env.NEXTAUTH_SECRET,
  // });

  return {
    props: {},
  };
}

export default Home;
