import CPost from "@/components/post";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import useSWRInfinite from "swr/infinite";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Account, Post } from "@prisma/client";
import prisma from "@/lib/server/client";
import { setHeadTitle, setLoading } from "@/hooks/useEvent";
import { userCheck } from "@/hooks/useData";
import { useSession } from "next-auth/react";
import post from "./api/post";
import SpinnerLoading from "@/components/loading/spinnerLoading";

//CBody 그대로 두고, query string에따라 PostList를 요청받게함
//Post클릭시 글 이동

interface SWRResponse {
  ok: boolean;
  data: (Post & { _count: { comments: number } })[];
}

function saveScrollPos(url) {
  const scrollPos = { x: window.scrollX, y: window.scrollY };
  sessionStorage.setItem(url, JSON.stringify(scrollPos));
}
function restoreScrollPos(url) {
  const scrollPos = JSON.parse(sessionStorage.getItem(url));
  if (scrollPos) {
    window.scrollTo(scrollPos.x, scrollPos.y);
  }
}

const PostList: NextPage = () => {
  const router = useRouter();
  const {
    data: pagePostsData,
    setSize,
    isLoading,
  } = useSWRInfinite<SWRResponse>(
    (pageOffset, previousPageData: SWRResponse) => {
      if (previousPageData && previousPageData.data.length <= 0) {
        return null;
      }
      return `/api/post?pageoffset=${pageOffset}${
        router?.query.category ? `&categoryId=${router?.query.category}` : ""
      }`;
    }
  );
  const { data } = useSession();
  const isMe = userCheck(data);
  const [postsData, setPostsData] = useState<
    (Post & { _count: { comments: number } })[]
  >([]);

  useEffect(() => {
    const { name } = router.query;
    let title = name ? `${name} 카테고리 글목록` : "Home";
    setHeadTitle(title);

    window.history.scrollRestoration = "manual";
    if ("scrollRestoration" in window.history) {
      //카테고리 이동시에는 스크롤값 삭제, 카테고리 ->포스트 이동시 스크롤값 저장
      const onRouteChangeStart = (url) => {
        if (url.indexOf("category") > 0 || url == "/") {
          if (router.asPath != url) sessionStorage.removeItem(router.asPath);
        } else saveScrollPos(router.asPath);
      };

      const onRouteChangeComplete = (url) => {
        restoreScrollPos(url);
      };

      router.events.on("routeChangeStart", onRouteChangeStart);
      router.events.on("routeChangeComplete", onRouteChangeComplete);
      // router.beforePopState(() => {
      //   console.log("%c beforePopState", "background:green; color:white");
      //   return true;
      // });

      return () => {
        router.events.off("routeChangeStart", onRouteChangeStart);
        router.events.off("routeChangeComplete", onRouteChangeComplete);
        router.beforePopState(() => true);
      };
    }
  }, [router]);

  useEffect(() => {
    if (!pagePostsData) return;
    let arr = [];
    let pageData = pagePostsData?.map((pageData) => {
      let { data } = pageData;
      arr = [...arr, ...data];
      return data;
    });
    setPostsData(arr);
  }, [pagePostsData]);

  // useEffect(() => {
  //   pageOffset = 0;
  //   const { name } = router.query;
  //   let title = name ? `${name} 카테고리 글목록` : "Home";
  //   setHeadTitleState(title);
  //   setPostsData(posts);
  // }, [posts]);

  const scrollToBottomEvt = useCallback(async () => {
    let rootHeight = document.getElementById("rootComp").clientHeight;
    let scrollHeight = document.getElementById("scrollArea").clientHeight + 60;

    if (scrollHeight - window.scrollY - rootHeight <= 0) {
      const { category } = router.query;
      console.log("!!");
      setSize((size) => {
        return size + 1;
      });
    }
  }, [pagePostsData]);

  useEffect(() => {
    window.addEventListener("scroll", scrollToBottomEvt);
    return () => {
      window.removeEventListener("scroll", scrollToBottomEvt);
    };
  }, [pagePostsData]);

  if (isLoading)
    return (
      <div
        id="PostLoading"
        className="flex items-center justify-center w-full h-[300px]"
      >
        <SpinnerLoading />
      </div>
    );
  return (
    <div className="h-auto relative">
      {/* <div className="md:hidden">
        <ServiceView />
      </div> */}
      <div className="h-auto relative">
        {postsData?.length > 0 ? (
          postsData?.map((post, i) => {
            return (
              <div
                key={i}
                className={`${
                  post?.isPrivate ? `${isMe ? "block" : "hidden"}` : "block"
                }`}
              >
                <CPost post={post} />
              </div>
            );
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
            <div className="relative text-xl font-bold">
              작성된 글이 없습니다
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ServiceView: NextPage = ({}) => {
  const btnRef = useRef<any>({});
  let hide = false;
  const [mdElements, setMdElements] = useState<HTMLElement[]>();
  useEffect(() => {
    if (document.getElementById("reactMD")) {
      let eles = document.getElementById("reactMD").children;
      let elesArr = [];
      for (let i = 0; i < eles.length; i++) {
        if (eles[i].getAttribute("level")) {
          elesArr.push(eles[i]);
        }
      }
      setMdElements(elesArr);
    }
  }, [hide]);
  return (
    <div
      id="serviceView"
      className="h-0 w-full relative flex items-end justify-end"
    ></div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  return {
    props: {},
  };
};

export default PostList;
