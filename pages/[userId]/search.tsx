import SpinnerLoading from "@/components/loading/spinnerLoading";
import PostItem from "@/components/postItem";
import CPost from "@/components/postItem";
import { createToast } from "@/hooks/useEvent";
import { Post } from "@prisma/client";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWRInfinite from "swr/infinite";

interface SWRResponse {
  ok: boolean;
  data: (Post & { _count: { comments: number } })[];
}

const Search = () => {
  const [reqUrl, setReqUrl] = useState<string>("");
  const [postsData, setPostsData] = useState<
    (Post & { _count: { comments: number } })[]
  >([]);
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const {
    data: pagePostsData,
    setSize,
    isLoading,
  } = useSWRInfinite<SWRResponse>(
    (pageOffset, previousPageData: SWRResponse) => {
      if (previousPageData && previousPageData.data.length <= 0) {
        return null;
      }
      let paramData = reqUrl.replace("/api/search?", "").split("&");
      let param1 = `pageoffset=${pageOffset}`;
      let param2 = paramData[1];
      let url = ["/api/search?", param1, "&", param2].join("");

      return reqUrl.length <= 0 ? null : url;
    }
  );

  useEffect(() => {
    if (!pagePostsData) return;

    let arr = [];
    pagePostsData?.map((pageData) => {
      let { data } = pageData;
      arr = [...arr, ...data];
      return data;
    });
    setPostsData(arr);
  }, [pagePostsData]);

  const onValid = (data) => {
    if (data.trim().length <= 0) {
      setReqUrl("");
      return;
    }
    setReqUrl(`/api/search?pageoffset=${0}&s=${data}`);
  };

  const onInvalid = (error) => {
    createToast(error.searchInput.message, true);
  };

  const scrollToBottomEvt = useCallback(async () => {
    let clientHeight = document.getElementById("scrollArea").clientHeight;
    let scrollHeight = document.getElementById("scrollArea").scrollHeight;
    let scrollTop = document.getElementById("scrollArea").scrollTop;

    if (scrollHeight - scrollTop - clientHeight <= 10) {
      const { category } = router.query;
      setSize((size) => {
        return size + 1;
      });
    }
  }, [postsData]);

  return (
    <div id="_searchViewContainer" className="w-full h-full px-4">
      <div className="flex h-16 w-full items-center justify-end">
        <button id="backBtn" onClick={() => router.back()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="text-lg mt-4 font-semibold">게시물 검색</div>
      <form
        id="_searchInputView"
        className="flex w-full h-16 mt-4 select-none border-2  px-2 justify-between
        items-center dark:border-zinc-700  dark:bg-zinc-800 bg-gray-50"
      >
        <input
          placeholder="내용을 입력해주세요.(2자이상)"
          {...register("searchInput", {
            required: {
              value: true,
              message: "내용을 입력해주세요.",
            },
            minLength: {
              value: 2,
              message: "내용은 2자이상 이여야 합니다.",
            },
            onChange(e) {
              onValid(e.target.value);
            },
          })}
          className="flex-1 bg-transparent w-full focus:outline-none text-lg
            dark:placeholder:text-gray-400 placeholder:text-gray-300 "
        />
        <button className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 m-auto cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </form>
      {reqUrl.length > 0 ? (
        <div
          onScroll={scrollToBottomEvt}
          id="scrollArea"
          className="overflow-auto relative grid w-full h-[calc(100%-220px)] mt-6 gap-2"
        >
          {isLoading ? (
            <SpinnerLoading></SpinnerLoading>
          ) : postsData?.length > 0 ? (
            postsData?.map((post, i) => {
              return (
                <div key={i}>
                  <PostItem post={post} />
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
                검색 결과가 없습니다.
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Search;
