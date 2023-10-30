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
    if (document.body.clientHeight - window.scrollY - window.innerHeight <= 0) {
      const { category } = router.query;
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
        <svg
          aria-hidden="true"
          className="w-24 h-24 text-gray-200 animate-spin dark:text-gray-600 fill-blue-500"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  return (
    <div className="h-auto relative">
      <ServiceView />
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
