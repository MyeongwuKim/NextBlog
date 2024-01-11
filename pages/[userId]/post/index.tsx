import CancelBtn from "@/components/cancelBtn";
import InputField from "@/components/inputField";
import OkBtn from "@/components/okBtn";
import { getGlobalSWR, userCheck } from "@/hooks/useData";
import {
  getDeliveryDomain,
  getFormatDate,
  getFormatFullDate,
} from "@/hooks/useUtils";
import {
  setLoading,
  createToast,
  setHeadTitle,
  createModal,
} from "@/hooks/useEvent";
import useMutation from "@/lib/server/useMutation";
import { Comment, Post, Reply } from "@prisma/client";
import {
  GetServerSideProps,
  GetStaticPaths,
  GetStaticProps,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import useSWR, { KeyedMutator } from "swr";
import LabelBtn from "@/components/labelBtn";
import CompImg from "@/components/compImg";
import dynamic from "next/dynamic";
import SpinnerLoading from "@/components/loading/spinnerLoading";
import DotLoading from "@/components/loading/dotLoading";

interface CommentForm {
  content: string;
  name: string;
}
interface ErrorFormData extends CommentForm {}
interface mutationResponse {
  ok: boolean;
  error: string;
}
type PostDataType = Post & {
  category: { name: string };
};
type NearPostType = {
  title: string;
  id: number;
  createdAt: string;
  thumbnail: string;
};
type BackForthDataType = {
  prev: { title: string; id: number };
  next: { title: string; id: number };
};
interface BackForthResponse {
  ok: boolean;
  backForthPostsData: BackForthDataType;
}
interface NearPostsResponse {
  ok: boolean;
  nearPostsData: NearPostType[];
}
interface CommentsResponse {
  commentsData: (Comment & { replys: Reply[] })[];
}
interface PostResponse {
  postData: PostDataType;
  ok: boolean;
}
interface DeleteResponse {
  ok: boolean;
  error: string;
}

const DynamicComponent = dynamic(
  () =>
    import("@/components/post/postBody").then((mode) => {
      return mode;
    }),
  {
    ssr: false,
    loading: ({ isLoading }) => {
      return <SpinnerLoading />;
    },
  }
);

const PostDetail: NextPage = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { swrProfileResponse, swrCategoryResponse } = getGlobalSWR();
  const isMe = userCheck(sessionData);
  const { register, handleSubmit, getValues, reset } = useForm<CommentForm>();
  const {
    data: postResponse,
    isLoading,
    mutate: postMutation,
  } = useSWR<PostResponse>(`/api/post/${router.query.id}`);
  const {
    data: commentsResponse,
    isLoading: commentsLoading,
    mutate: commentsMutate,
  } = useSWR<CommentsResponse>(`/api/comments/${router.query.id}`);
  const { data: nearPostsResponse, isLoading: nearPostsLoading } =
    useSWR<NearPostsResponse>(`/api/post/near/${router.query.id}`);
  const { data: backForthPostsResponse, isLoading: backForthPostsLoading } =
    useSWR<BackForthResponse>(`/api/post/backforth/${router.query.id}`);
  const [createComment, { loading, data: createCommentsData, error }] =
    useMutation<mutationResponse>("/api/comments/create");
  const [postDeleteMutation, { data: deleteRespose }] =
    useMutation<mutationResponse>(`/api/post/delete`);
  const [mdElements, setMdElements] = useState<HTMLElement[]>();
  const [appendixEnable, setAppendixEnable] = useState<boolean>(false);
  let [commentDelete, { data: commentsDeleteResponse, error: commentError }] =
    useMutation<DeleteResponse>("/api/comments/delete");
  let [replyDelete, { data: replyResponse, error: replyError }] =
    useMutation<DeleteResponse>("/api/reply/delete");
  const [btnState, setBtnState] = useState<boolean>(false);
  const [dynamicLoading, setDynamicLoading] = useState<boolean>(true);
  const [allDataLoading, setAllDataLoading] = useState<boolean>(true);

  useEffect(() => {
    setHeadTitle(postResponse?.postData?.title);
  }, [postResponse]);

  useEffect(() => {
    if (
      !isLoading &&
      !backForthPostsLoading &&
      !commentsLoading &&
      !nearPostsLoading
    )
      setAllDataLoading(false);
    else {
      setAllDataLoading(true);
    }
  }, [isLoading, backForthPostsLoading, commentsLoading, nearPostsLoading]);
  useEffect(() => {
    if (!deleteRespose) return;
    if (deleteRespose.ok) {
      createToast("삭제가 완료 되었습니다.", false);
      router.replace("/");
    } else {
    }
  }, [deleteRespose]);

  useEffect(() => {
    if (!createCommentsData) return;
    if (createCommentsData.ok) {
      commentsMutate();
    } else createToast(createCommentsData.error, true);
  }, [createCommentsData]);

  useEffect(() => {
    if (error) createToast(error as any, true);
  }, [error]);

  useEffect(() => {
    if (!commentsDeleteResponse) return;
    if (commentsDeleteResponse.ok)
      createToast("댓글 삭제를 완료했습니다", false);
    else createToast(commentsDeleteResponse.error, false);
  }, [commentsDeleteResponse]);

  useEffect(() => {
    if (!replyResponse) return;

    if (replyResponse.ok) createToast("답글 삭제를 완료했습니다", false);
    else createToast(replyResponse.error, false);
  }, [replyResponse]);

  const appendixEvt = () => {
    if (document.getElementById("reactMD")) {
      let eles = document.getElementById("reactMD").children;
      let elesArr = [];

      for (let i = 0; i < eles.length; i++) {
        if (eles[i].getAttribute("level")) {
          elesArr.push(eles[i]);
        }
      }
      if (elesArr.length <= 0) setAppendixEnable(false);
      else {
        setAppendixEnable(true);
        setMdElements(elesArr);
      }
    }
  };

  const commentDeleteMutate = useCallback(
    (id, isReply: boolean, commentIndex, replyIndex) => {
      if (isReply) {
        //대댓글 삭제
        commentsMutate((prev) => {
          return {
            ...prev,
            commentsData: prev.commentsData.map((comment, i) => {
              if (commentIndex == i) {
                return {
                  ...comment,
                  replys: comment.replys.filter((reply, j) => {
                    if (j != replyIndex) return { ...reply };
                  }),
                };
              }
              return { ...comment };
            }),
          };
        }, false);
        replyDelete({ replyId: id });
      } else {
        //코멘트삭제
        commentsMutate((prev) => {
          prev.commentsData.splice(commentIndex, 1);
          return {
            ...prev,
            commentsData: [...prev.commentsData],
          };
        }, false);
        commentDelete({ commentId: id });
      }
    },
    [commentsResponse]
  );

  const onValid = (data) => {
    reset();
    commentsMutate((prev) => {
      let commentMutationData: Comment & { replys: Reply[] } = {
        categoryId: postResponse.postData.categoryId,
        content: data.content,
        createdAt: new Date(),
        historyId: null,
        id: null,
        isMe,
        name: data.name,
        postId: postResponse.postData.id,
        replys: [],
        updatedAt: new Date(),
      };
      data = {
        ...data,
        postId: postResponse.postData.id,
        categoryId: postResponse.postData.categoryId,
      };
      return {
        ...prev,
        commentsData: [...prev.commentsData, commentMutationData],
      };
    }, false);
    createComment(data);
  };
  const onInValid: SubmitErrorHandler<ErrorFormData> = (error) => {
    let { content, name } = error;
    let message = "";
    if (name) {
      message = name.message;
    } else if (content) {
      message = content.message;
    }
    createToast(message, true);
  };

  const checkChange = () => {
    let { content, name } = getValues();

    if (isMe) {
      if (content.length <= 0) setBtnState(false);
      else setBtnState(true);
    } else {
      if (content.length <= 0 || name.length <= 0) setBtnState(false);
      else setBtnState(true);
    }
  };

  return (
    <div>
      <div
        className={`
        ${isLoading || router.isFallback ? "hidden" : "block"} ${
          appendixEnable ? "block" : "hidden"
        } md:hidden`}
      >
        <Appendix postId={postResponse?.postData?.id} mdElements={mdElements} />
      </div>

      <div className="w-full">
        <div>
          {allDataLoading ||
          dynamicLoading ||
          router.isFallback ||
          !postResponse?.postData ? (
            <div className="mb-5 h-[48px]">
              <DotLoading width={"22%"} height={40} dotAmount={4} />
            </div>
          ) : (
            <span className="mb-5 text-5xl font-bold leading-tight">
              {postResponse?.postData?.title}
            </span>
          )}
        </div>
        {allDataLoading ||
        dynamicLoading ||
        router.isFallback ||
        !postResponse?.postData ? (
          <div className="h-[18px] mb-5">
            <DotLoading width={"8%"} height={18} dotAmount={2} />
          </div>
        ) : (
          <div className="mb-5 flex justify-between">
            <div className="text-lg dark:text-gray-400 text-slate-400 flex">
              <span className="mr-2">
                {getFormatDate(postResponse?.postData?.createdAt)} 작성
              </span>
              <span
                className={`${
                  postResponse?.postData?.isPrivate ? "block" : "hidden"
                } flex`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 m-auto"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                비공개
              </span>
            </div>

            <div className={`flex ${isMe ? "block" : "hidden"}`}>
              <span
                onClick={() => {
                  router.push(
                    `/${router.query.userId}/write?id=${postResponse?.postData?.id}`
                  );
                }}
                className="text-lg cursor-pointer
          dark:text-gray-400 text-slate-400 mr-3 underline"
              >
                수정
              </span>
              <span
                onClick={() => {
                  createModal(
                    "이 글 및 이미지 파일을 완전히 삭제합니다.<br> 계속하시겠습니까?",
                    ["취소", "확인"],

                    () => {
                      setLoading(true);
                      postDeleteMutation(postResponse?.postData?.id);
                    },
                    350
                  );
                }}
                className="text-lg cursor-pointer
          dark:text-gray-400 text-slate-400 underline"
              >
                삭제
              </span>
            </div>
          </div>
        )}

        <div className="border-y-[1px] border-gray-200 dark:border-zinc-800" />
        {allDataLoading || router.isFallback || !postResponse?.postData ? (
          <SpinnerLoading />
        ) : (
          <div>
            <DynamicComponent
              dynamicLoadingState={setDynamicLoading}
              postResponse={postResponse}
              profileData={swrProfileResponse?.profile}
              appendixEvt={appendixEvt}
            />
            <div className={`${dynamicLoading ? "hidden" : "block"}`}>
              <div className="w-full mb-16 min-h-[40px]">
                <div className="mb-4 text-xl font-semibold">
                  {nearPostsResponse?.nearPostsData?.length > 0
                    ? `[${postResponse?.postData?.category?.name}] 카테고리 관련글`
                    : ""}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {nearPostsResponse?.nearPostsData?.map((nearPost, i) => (
                    <NearPost
                      key={i}
                      title={nearPost?.title}
                      createdAt={nearPost?.createdAt}
                      id={nearPost?.id}
                      thumbnail={nearPost?.thumbnail}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-16 h-[90px] w-full flex flex-row justify-between gap-2">
                {!backForthPostsResponse
                  ? []
                  : Object.keys(backForthPostsResponse?.backForthPostsData).map(
                      (dir, i) => {
                        if (!backForthPostsResponse?.backForthPostsData[dir]) {
                          return <div key={i}></div>;
                        }
                        return (
                          <NextPost
                            key={i}
                            data={
                              backForthPostsResponse?.backForthPostsData[dir]
                            }
                            dir={dir}
                          />
                        );
                      }
                    )}
              </div>
              <div className="border-t-[1px]  border-gray-200 dark:border-zinc-800 flex items-center ">
                <div className="text-lg my-4 font-semibold">
                  {commentsResponse?.commentsData.length}개의 댓글
                </div>
              </div>
              <div className="grid grid-flow-row">
                {dynamicLoading
                  ? ""
                  : commentsResponse?.commentsData?.map((commentData, i) => (
                      <CommentItem
                        commentsMutate={commentsMutate}
                        allow={postResponse?.postData.allow}
                        commentData={commentData}
                        postId={postResponse?.postData?.id}
                        categoryId={postResponse?.postData?.categoryId}
                        index={i}
                        key={commentData.id}
                        commentDeleteMutate={commentDeleteMutate}
                      />
                    ))}
              </div>
              <div className="border-y-[1px] border-gray-200 dark:border-zinc-800 mb-6" />
              <div
                className={`h-[50px] mb-8 ${
                  postResponse?.postData?.allow ? "hidden" : "block"
                } text-xl font-semibold flex items-center justify-center text-gray-400`}
              >
                <span>댓글 작성이 금지된 게시물입니다.</span>
              </div>
              <form
                className={`${
                  postResponse?.postData?.allow ? "block" : "hidden"
                }`}
                method="post"
                onSubmit={handleSubmit(onValid, onInValid)}
              >
                <div
                  className={`${
                    isMe ? "hidden" : "block"
                  } flex  gap-4 w-full h-[50px] relative mb-4`}
                >
                  <InputField
                    register={
                      isMe
                        ? null
                        : {
                            ...register("name", {
                              required: {
                                value: true,
                                message: "이름을 입력해주세요.",
                              },
                              onChange: checkChange,
                            }),
                          }
                    }
                    height="100%"
                    width="40%"
                    placeholder="이름"
                    id="name"
                  />
                </div>
                <InputField
                  register={{
                    ...register("content", {
                      required: true,
                      maxLength: {
                        value: 500,
                        message: "댓글은 500자까지 입력할 수 있습니다.",
                      },
                      onChange: checkChange,
                    }),
                  }}
                  height="120px"
                  width="100%"
                  placeholder="코멘트"
                  id="content"
                  fieldtype="textarea"
                />

                <div className="relative flex items-center justify-end w-full h-16 gap-3">
                  <CancelBtn
                    content="취소"
                    height={45}
                    onClickEvt={() => {}}
                    width={90}
                  />
                  <OkBtn
                    isEnable={btnState}
                    content="작성"
                    height={45}
                    onClickEvt={() => {}}
                    width={90}
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CommentItemProps {
  replyCallback: () => void;
  isReply: boolean;
  data: Comment | Reply;
  allow: boolean;
  deleteEvt: () => void;
}

interface CommentProps {
  allow: boolean;
  postId: number;
  index: number;
  categoryId: number;
  commentData: Comment & {
    replys: Reply[];
  };
  commentsMutate: KeyedMutator<CommentsResponse>;
  commentDeleteMutate: (
    id: number,
    isReply: boolean,
    commentIndex: number,
    replyIndex?: number
  ) => void;
}
export const NextPost = ({
  dir,
  data,
}: {
  data: { id: number; title: string };
  dir: string;
}) => {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        router.push(`/${router.query.userId}/post?id=${data.id}`);
      }}
      className="w-[48%] px-4 dark:bg-zinc-800 bg-gray-100 
      shadow-[0_6px_0_rgba(0,0,0,0.2)] hover:shadow-[0_4px_0px_rgba(0,0,0,0.2)]
      dark:shadow-[0_6px_0_rgb(0,0,0)] dark:hover:shadow-[0_4px_0px_rgb(0,0,0)]
       ease-out hover:translate-y-1 transition-all rounded"
    >
      <div
        className={`w-full flex ${
          dir == "prev" ? "flex-row" : "flex-row-reverse"
        } h-full justify-start items-center`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`flex-none relative w-8 h-8 ${
            dir == "prev" ? "mr-4" : "rotate-180 ml-4"
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="w-[50px] flex-1 relative">
          <div className="w-auto">{dir == "prev" ? "이전" : "다음"} 게시물</div>
          <div className="font-bold text-lg  relative truncate">
            {data.title}
          </div>
        </div>
      </div>
    </button>
  );
};

export const CommentItem = ({
  commentData,
  postId,
  allow,
  categoryId,
  commentsMutate,
  commentDeleteMutate,
  index,
}: CommentProps) => {
  let { data: sessionData } = useSession();
  let { swrProfileResponse } = getGlobalSWR();
  let isMe = userCheck(sessionData);
  const { register, handleSubmit, getValues, setFocus, reset } =
    useForm<CommentForm>();
  const [enableReply, setEnableReply] = useState<boolean>(false);
  const [showReply, setShowReply] = useState<boolean>(false);
  const [createReply, { loading, data: replyResponse, error }] =
    useMutation<mutationResponse>("/api/reply/create");

  useEffect(() => {
    if (!replyResponse) return;

    if (replyResponse.ok) {
      commentsMutate();
    } else {
      createToast(replyResponse.error, true);
    }
  }, [replyResponse]);
  const checkChange = () => {
    let { content, name } = getValues();

    if (isMe) {
      if (content.length <= 0) setEnableReply(false);
      else setEnableReply(true);
    } else {
      if (content.length <= 0 || name.length <= 0) setEnableReply(false);
      else setEnableReply(true);
    }
  };

  const onReplyBtnClick = useCallback(() => {
    reset();
    setFocus("name", { shouldSelect: true });
    setShowReply(true);
  }, []);

  const onValid = (data) => {
    reset();
    setShowReply(false);
    let commentdata: Reply = {
      ...data,
      commentId: commentData.id,
      postId,
      categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isMe,
    };
    commentsMutate((prev) => {
      let newComments = prev.commentsData[index];
      newComments.replys = [...newComments.replys, commentdata];
      return prev;
    }, false);
    createReply(commentdata);
  };
  const onInValid: SubmitErrorHandler<ErrorFormData> = (error) => {
    let { content, name } = error;
    let message = "";
    if (name) {
      message = name.message;
    } else if (content) {
      message = content.message;
    }
    createToast(message, true);
  };

  return (
    <div className="w-full">
      <CommentBody
        allow={allow}
        data={commentData}
        isReply={false}
        replyCallback={onReplyBtnClick}
        deleteEvt={() => {
          commentDeleteMutate(commentData.id, false, index);
        }}
      />
      <div className="mt-4 ml-6 grid grid-flow-row">
        {commentData?.replys?.map((replyData, i) => (
          <CommentBody
            key={i}
            allow={allow}
            data={replyData}
            isReply={true}
            replyCallback={onReplyBtnClick}
            deleteEvt={() => {
              commentDeleteMutate(replyData.id, true, index, i);
            }}
          />
        ))}
      </div>
      <form
        method="post"
        onSubmit={handleSubmit(onValid, onInValid)}
        className={`mt-4 ${showReply ? "block" : "hidden"}`}
      >
        <div className="flex flex-row pl-10 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-6 h-6 scale-y-[-1] mt-4`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
            />
          </svg>
          {isMe ? (
            <div
              className="border-2 dark:border-zinc-800 relative flex-none flex
                   flex-row items-center justify-center w-16 h-16 rounded-full bg-slate-500"
            >
              <img
                src={
                  swrProfileResponse?.profile?.avatar
                    ? `${getDeliveryDomain(
                        swrProfileResponse?.profile?.avatar,
                        "avatar"
                      )}`
                    : ""
                }
                className={`${
                  swrProfileResponse?.profile?.avatar ? "block" : "hidden"
                } w-full h-full rounded-full `}
              />
              <span className="text-sm font-semibold text-center text-white ">
                {!swrProfileResponse?.profile?.avatar
                  ? swrProfileResponse?.profile?.name
                  : ""}
              </span>
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full flex-none
border-[1px] dark:border-zinc-800 items-center flex"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 m-auto text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          )}
          <div className="flex flex-col flex-1">
            <div
              className={`${
                isMe ? "hidden" : "block"
              } flex justify-between w-full h-[50px] relative mb-4`}
            >
              <InputField
                register={
                  isMe
                    ? null
                    : {
                        ...register("name", {
                          required: {
                            value: true,
                            message: "이름을 입력해주세요.",
                          },
                          onChange: checkChange,
                        }),
                      }
                }
                height="100%"
                width="40%"
                placeholder="이름"
                id="name"
              />
            </div>
            <InputField
              register={{
                ...register("content", {
                  required: true,
                  maxLength: {
                    value: 500,
                    message: "댓글은 500자까지 입력할 수 있습니다.",
                  },
                  onChange: checkChange,
                }),
              }}
              height="120px"
              width="100%"
              placeholder="코멘트"
              id="comment"
              fieldtype="textarea"
            />
          </div>
        </div>

        <div className="relative flex items-center justify-end w-full h-16 gap-2">
          <CancelBtn
            content="취소"
            height={45}
            onClickEvt={() => {
              setShowReply(false);
            }}
            width={90}
          />
          <OkBtn
            isEnable={enableReply}
            content="작성"
            height={45}
            onClickEvt={() => {}}
            width={90}
          />
        </div>
      </form>
    </div>
  );
};

export const CommentBody = ({
  allow,
  isReply,
  replyCallback,
  data,
  deleteEvt,
}: CommentItemProps) => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { swrProfileResponse } = getGlobalSWR();
  const isMe = userCheck(sessionData);
  const [targetEle, setTargetEle] = useState<HTMLElement>(null);
  const [eleAnimate, setEleAnimate] = useState<boolean>(false);

  useEffect(() => {
    if (!data) return;
    let query = { ...router.query };
    delete query.id;
    delete query.userId;

    let targetEle = document.getElementById(
      Object.keys(query)[0] + query[Object.keys(query)[0]]
    );
    if (targetEle) {
      setTargetEle(targetEle);

      let { top } = (targetEle as HTMLElement).getClientRects()[0];
      window.scrollTo({ top: window.scrollY + top });
    }
  }, [data]);

  useEffect(() => {
    if (targetEle) {
      setEleAnimate(true);
      setTimeout(() => {
        setEleAnimate(false);
      }, 5000);
    }
  }, [targetEle]);

  return (
    <div
      id={isReply ? `reply${data.id}` : `comment${data.id}`}
      className={`${
        eleAnimate &&
        targetEle?.id == (isReply ? `reply${data.id}` : `comment${data.id}`)
          ? "animate-pulse dark:bg-zinc-700 bg-gray-200"
          : ""
      } w-full flex flex-row mb-4`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-6 h-6 scale-y-[-1] mt-4 mr-[4px] ${
          isReply ? "block " : "hidden"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
        />
      </svg>
      {data.isMe ? (
        <div
          className="border-2 dark:border-zinc-800 relative flex-none flex
                   flex-row items-center justify-center w-16 h-16 rounded-full bg-slate-500"
        >
          <img
            src={
              swrProfileResponse?.profile?.avatar
                ? `${getDeliveryDomain(
                    swrProfileResponse?.profile?.avatar,
                    "avatar"
                  )}`
                : ""
            }
            className={`${
              swrProfileResponse?.profile?.avatar ? "block" : "hidden"
            } w-full h-full rounded-full `}
          />
          <span className="text-sm font-semibold text-center text-white ">
            {!swrProfileResponse?.profile?.avatar
              ? swrProfileResponse?.profile?.name
              : ""}
          </span>
        </div>
      ) : (
        <div
          className="w-16 h-16 rounded-full flex-none
border-[1px] dark:border-zinc-800 items-center flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 m-auto text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
      )}

      <div className="flex ml-4 flex-col w-full">
        <div className="w-full flex flex-row justify-between">
          <div className="text-lg font-bold flex items-center">
            {data.isMe ? swrProfileResponse?.profile?.name : data.name}
            <span
              className={`${
                data.isMe ? "inline" : "hidden"
              } ml-2 dark:text-gray-400 text-slate-400 text-sm`}
            >
              작성자
            </span>
          </div>
          <div className={`${isMe ? "block" : "hidden"}`}>
            <span
              onClick={deleteEvt}
              className={`${data.id ? "block" : "hidden"} text-sm cursor-pointer
dark:text-gray-400 text-slate-400 underline`}
            >
              삭제
            </span>
          </div>
        </div>

        <div className="text-lg">{data.content}</div>
        <div className="text-sm ">
          <span className="dark:text-gray-400 text-slate-400 mr-4">
            {getFormatFullDate(data.createdAt)}
          </span>
          <span
            onClick={() => {
              replyCallback();
            }}
            className={`${
              allow ? "block" : "hidden"
            } font-bold text-base text-emerald-400 cursor-pointer`}
          >
            답글
          </span>
        </div>
      </div>
    </div>
  );
};

export const NearPost = ({ createdAt, id, title, thumbnail }: NearPostType) => {
  const router = useRouter();
  const [createTime, setCreateTime] = useState<string>();
  useEffect(() => {}, []);

  return (
    <div className="flex flex-col gap-2 items-center">
      <CompImg
        onClickEvt={() => {
          router.push(`/${router.query.userId}/post?id=${id}`);
        }}
        style="w-full h-28"
        thumbnail={thumbnail}
      />
      <LabelBtn
        contents={title}
        onClick={() => {
          router.push(`/${router.query.userId}/post?id=${id}`);
        }}
      />
      <div className="text-sm text-gray-400">{getFormatDate(createdAt)}</div>
    </div>
  );
};

let scrollTop = 0;
let prevBtn = null;
let topPos = 80;
export const Appendix = ({ postId, mdElements }) => {
  const btnRef = useRef<any>({});

  useEffect(() => {
    scrollTop = 0;
    if (!mdElements) return;

    window.addEventListener("scroll", (e) => {
      scrollEvt(window.scrollY);
    });
  }, [postId, mdElements]);

  const scrollEvt = (scrollY) => {
    if (!btnRef.current[0]) return;
    scrollTop = scrollY;

    let appendixList = document.getElementsByClassName("appendix");
    let index = null;
    for (let i = 0; i < appendixList.length; i++) {
      let appendix = (appendixList[i] as HTMLElement).getClientRects()[0];
      let nextAppendix = (
        appendixList[i + 1] as HTMLElement
      )?.getClientRects()[0];

      if (appendix && nextAppendix) {
        if (appendix.top <= -1 && nextAppendix.top > 0) {
          index = i;
          break;
        }
      } else if (!nextAppendix) {
        if (appendix.top <= 0) {
          index = i;
          break;
        }
      }
    }
    if (prevBtn) {
      if (index == null) {
        prevBtn.disabled = false;
        prevBtn = null;
        return;
      } else {
        if (Number(prevBtn.id) != index) {
          prevBtn.disabled = false;
        }
      }
    }
    if (index > -1 && index != null) {
      if (btnRef.current[index].disabled) return;
      btnRef.current[index].disabled = true;
      prevBtn = btnRef.current[index];
    }
  };

  return (
    <div
      id="appendix"
      style={{ top: topPos }}
      className={`relative w-full flex justify-end left-[240px] `}
    >
      <div
        id="appendixBody"
        className={`overscroll-auto fixed flex-col items-start justify-start
          w-[200px] border-l-[2px] h-auto border-gray-200 px-4
dark:border-zinc-800
`}
      >
        <div className="flex flex-row mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
          <span className="font-bold text-xl ml-2">목차</span>
        </div>
        {mdElements?.map((ele, i) => {
          let level = ele.getAttribute("level");
          let addStyle = "";

          switch (level) {
            case "2":
              addStyle = "ml-2";
              break;
            case "3":
              addStyle = "ml-4";
              break;
          }
          return (
            <div key={i}>
              <LabelBtn
                onClick={() => {
                  let { top } = (
                    document.getElementsByClassName("appendix")[
                      i
                    ] as HTMLElement
                  ).getClientRects()[0];
                  window.scrollTo({ top: window.scrollY + top + 1 });
                }}
                id={i.toString()}
                contents={ele.innerText}
                addStyle={addStyle}
                anyRef={btnRef}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// export const getServerSideProps: GetServerSideProps = async ({
//   query,
//   params,
// }) => {
//   return {
//     props: {
//       title: query?.title,
//       createdAt: query?.createdAt,
//     },
//   };
// };
export const getStaticPaths: GetStaticPaths = async ({}) => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    revalidate: 10,
    props: {},
  };
};

export default PostDetail;
