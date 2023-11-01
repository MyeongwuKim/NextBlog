import CancelBtn from "@/components/cancelBtn";
import InputField from "@/components/inputField";
import OkBtn from "@/components/okBtn";
import ReactMD from "@/components/write/reactMD";
import { getGlobalSWR, userCheck } from "@/hooks/useData";
import {
  getDeliveryDomain,
  getFormatDate,
  getFormatFullDate,
} from "@/hooks/useUtils";
import {
  setLoading,
  createCautionMsg,
  setHeadTitle,
  createAlert,
} from "@/hooks/useEvent";
import useMutation from "@/lib/server/useMutation";
import { Comment, Post, Reply } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import useSWR, { KeyedMutator, useSWRConfig } from "swr";
import { getToken } from "next-auth/jwt";
import LabelBtn from "@/components/labelBtn";
import CompImg from "@/components/compImg";
import prisma from "@/lib/server/client";

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
  comments: (Comment & { replys: Reply[] })[];
};
type NearPostType = {
  title: string;
  id: number;
  createdAt: string;
  thumbnail: string;
};
type HeadtailDataType = {
  prev: { title: string; id: number };
  next: { title: string; id: number };
};
interface PostResponse {
  data: {
    postData: PostDataType;
    headTailPostData: HeadtailDataType[];
    nearPostData: NearPostType[];
  };
  ok: boolean;
}
let commentData: Comment;

const PostDetail: NextPage = ({
  title,
  createdAt,
}: {
  title: string;
  createdAt: string;
}) => {
  const router = useRouter();
  const { register, handleSubmit, getValues, reset } = useForm<CommentForm>();
  let { data: sessionData } = useSession();
  let { profileData } = getGlobalSWR();
  let isMe = userCheck(sessionData);
  const [createTime, setCreateTime] = useState<string>();
  const [btnState, setBtnState] = useState<boolean>(false);
  const [createComment, { loading, data: responseData, error }] =
    useMutation<mutationResponse>("/api/comments/create");
  const {
    data: postResponse,
    isLoading,
    mutate: postMutation,
  } = useSWR<PostResponse>(`/api/post/${router.query.id}`);
  const [postDeleteMutation, { data: deleteRespose }] =
    useMutation<mutationResponse>(`/api/post/delete`);
  const [mdElements, setMdElements] = useState<HTMLElement[]>();
  const [hide, setHide] = useState<boolean>(false);
  let [commentDelete, { data: commentsResponse, error: commentError }] =
    useMutation<DeleteResponse>("/api/comments/delete");
  let [replyDelete, { data: replyResponse, error: replyError }] =
    useMutation<DeleteResponse>("/api/reply/delete");

  useEffect(() => {
    console.log(postResponse);
    setHeadTitle(postResponse?.data.postData?.title);
    setCreateTime(getFormatDate(postResponse?.data.postData?.createdAt));
    //window.scrollTo({ top: 0 });
    if (document.getElementById("reactMD")) {
      let eles = document.getElementById("reactMD").children;
      let elesArr = [];

      for (let i = 0; i < eles.length; i++) {
        if (eles[i].getAttribute("level")) {
          elesArr.push(eles[i]);
        }
      }
      if (elesArr.length <= 0) setHide(true);
      else {
        setHide(false);
        setMdElements(elesArr);
      }
    }
  }, [postResponse]);

  useEffect(() => {
    if (!deleteRespose) return;
    if (deleteRespose.ok) {
      createCautionMsg("삭제가 완료 되었습니다.", false);
      router.replace("/");
    } else {
    }
  }, [deleteRespose]);
  useEffect(() => {
    if (!responseData) return;
    if (responseData.ok) {
      postMutation();
    } else createCautionMsg(responseData.error, true);
  }, [responseData]);

  useEffect(() => {
    if (error) createCautionMsg(error as any, true);
  }, [error]);

  useEffect(() => {
    if (!commentsResponse) return;
    if (commentsResponse.ok)
      createCautionMsg("댓글 삭제를 완료했습니다", false);
    else createCautionMsg(commentsResponse.error, false);
  }, [commentsResponse]);

  useEffect(() => {
    if (!replyResponse) return;

    if (replyResponse.ok) createCautionMsg("답글 삭제를 완료했습니다", false);
    else createCautionMsg(replyResponse.error, false);
  }, [replyResponse]);

  const commentDeleteMutate = useCallback(
    (id, isReply: boolean, commentIndex, replyIndex) => {
      if (isReply) {
        //대댓글 삭제
        postMutation((prev) => {
          return {
            ...prev,
            data: {
              ...prev.data,
              postData: {
                ...prev.data.postData,
                comments: prev.data.postData.comments.map((comment, i) => {
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
              },
            },
          };
        }, false);
        replyDelete({ replyId: id });
      } else {
        //코멘트삭제
        postMutation((prev) => {
          prev.data.postData.comments.splice(commentIndex, 1);
          return {
            ...prev,
            data: {
              ...prev.data,
              postData: {
                ...prev.data.postData,
                comments: [...prev.data.postData.comments],
              },
            },
          };
        }, false);
        commentDelete({ commentId: id });
      }
    },
    [postResponse]
  );

  const onValid = (data) => {
    reset();
    postMutation((prev) => {
      let commentMutationData: Comment & { replys: Reply[] } = {
        categoryId: prev.data.postData.categoryId,
        content: data.content,
        createdAt: new Date(),
        historyId: null,
        id: null,
        isMe,
        name: data.name,
        postId: prev.data.postData.id,
        replys: [],
        updatedAt: new Date(),
      };
      data = {
        ...data,
        postId: prev.data.postData.id,
        categoryId: prev.data.postData.categoryId,
      };
      return {
        ...prev,
        data: {
          ...prev.data,
          postData: {
            ...prev.data.postData,
            comments: [...prev.data.postData.comments, commentMutationData],
          },
        },
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
    createCautionMsg(message, true);
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

  // if (isLoading)
  //   return (

  //   );
  return (
    <div>
      <div
        className={`${isLoading ? "hidden" : "block"} ${
          hide ? "hidden" : "block"
        }`}
      >
        <Appendix
          postId={postResponse?.data?.postData?.id}
          mdElements={mdElements}
        />
      </div>

      <div className="w-full">
        <div className="mb-5 text-5xl font-bold leading-tight">
          {postResponse ? postResponse?.data?.postData?.title : title}
        </div>
        <div className="mb-5 flex justify-between">
          <div className="text-lg dark:text-gray-400 text-slate-400 flex">
            <span className="mr-2">
              {isLoading ? getFormatDate(createdAt) : createTime} 작성
            </span>
            <span
              className={`${
                postResponse?.data?.postData?.isPrivate ? "block" : "hidden"
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
                router.push(`/write?id=${postResponse?.data.postData?.id}`);
              }}
              className="text-lg cursor-pointer
          dark:text-gray-400 text-slate-400 mr-3 underline"
            >
              수정
            </span>
            <span
              onClick={() => {
                createAlert(
                  "이 글 및 이미지 파일을 완전히 삭제합니다.<br> 계속하시겠습니까?",
                  ["취소", "확인"],
                  () => {
                    setLoading(true);
                    postDeleteMutation(postResponse?.data.postData?.id);
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
        <div className="border-y-[1px] border-gray-200 dark:border-zinc-800" />
        {isLoading ? (
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
        ) : (
          <div>
            <div className="my-16" id="reactMD">
              <ReactMD doc={postResponse?.data?.postData?.html} />
            </div>
            <div className="mb-8 text-xl font-semibold">Post By</div>
            <div className="py-12 mb-16 border-y-[1px] flex border-gray-200 dark:border-zinc-800">
              <div
                className="border-2 dark:border-zinc-800 relative flex 
              flex-row items-center justify-center w-36 h-36 rounded-full bg-slate-500"
              >
                <img
                  src={
                    profileData?.avatar
                      ? `${getDeliveryDomain(profileData?.avatar, "avatar")}`
                      : ""
                  }
                  className={`${
                    profileData?.avatar ? "block" : "hidden"
                  } w-full h-full rounded-full `}
                />
                <span className="text-3xl font-semibold text-center text-white ">
                  {!profileData?.avatar ? profileData?.name : ""}
                </span>
              </div>
              <div className="ml-4">
                <div className="mb-2 text-xl font-bold">
                  {profileData?.name}
                </div>
                <div className="text-lg font-semibold">
                  {profileData?.introduce}
                </div>
              </div>
            </div>
            <div>
              <div className="w-full mb-16 min-h-[40px]">
                <div className="mb-4 text-xl font-semibold">
                  {postResponse?.data?.nearPostData.length > 0
                    ? `[${postResponse?.data?.postData?.category?.name}] 카테고리 관련글`
                    : ""}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {postResponse?.data?.nearPostData?.map((nearPost, i) => (
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
                {!postResponse?.data?.headTailPostData
                  ? []
                  : Object.keys(postResponse?.data?.headTailPostData).map(
                      (dir, i) => {
                        if (!postResponse?.data?.headTailPostData[dir]) {
                          return <div key={i}></div>;
                        }
                        return (
                          <NextPost
                            key={i}
                            data={postResponse?.data?.headTailPostData[dir]}
                            dir={dir}
                          />
                        );
                      }
                    )}
              </div>
              <div className="border-t-[1px]  border-gray-200 dark:border-zinc-800 flex items-center ">
                <div className="text-lg my-4 font-semibold">
                  {postResponse?.data?.postData?.comments.length}개의 댓글
                </div>
              </div>
              <div className="grid grid-flow-row">
                {postResponse?.data?.postData?.comments.map(
                  (commentData, i) => (
                    <CommentItem
                      postMutation={postMutation}
                      allow={postResponse?.data?.postData.allow}
                      commentData={commentData}
                      postId={postResponse?.data?.postData?.id}
                      categoryId={postResponse?.data?.postData?.categoryId}
                      index={i}
                      key={commentData.id}
                      commentDeleteMutate={commentDeleteMutate}
                    />
                  )
                )}
              </div>
              <div className="border-y-[1px] border-gray-200 dark:border-zinc-800 mb-6" />
              <div
                className={`h-[50px] mb-8 ${
                  postResponse?.data?.postData?.allow ? "hidden" : "block"
                } text-xl font-semibold flex items-center justify-center text-gray-400`}
              >
                <span>댓글 작성이 금지된 게시물입니다.</span>
              </div>
              <form
                className={`${
                  postResponse?.data?.postData?.allow ? "block" : "hidden"
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
  postMutation: KeyedMutator<PostResponse>;
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
        router.push(`/post/${data.id}`);
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
  postMutation,
  commentDeleteMutate,
  index,
}: CommentProps) => {
  let { data: sessionData } = useSession();
  let { profileData } = getGlobalSWR();
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
      postMutation();
    } else {
      createCautionMsg(replyResponse.error, true);
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
    postMutation((prev) => {
      let newComments = prev.data.postData.comments[index];
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
    createCautionMsg(message, true);
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
                  profileData?.avatar
                    ? `${getDeliveryDomain(profileData?.avatar, "avatar")}`
                    : ""
                }
                className={`${
                  profileData?.avatar ? "block" : "hidden"
                } w-full h-full rounded-full `}
              />
              <span className="text-sm font-semibold text-center text-white ">
                {!profileData?.avatar ? profileData?.name : ""}
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

interface DeleteResponse {
  ok: boolean;
  error: string;
}
export const CommentBody = ({
  allow,
  isReply,
  replyCallback,
  data,
  deleteEvt,
}: CommentItemProps) => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { profileData } = getGlobalSWR();
  const isMe = userCheck(sessionData);
  const [targetEle, setTargetEle] = useState<HTMLElement>(null);
  const [eleAnimate, setEleAnimate] = useState<boolean>(false);

  useEffect(() => {
    if (!data) return;
    let query = { ...router.query };
    delete query.id;
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
              profileData?.avatar
                ? `${getDeliveryDomain(profileData?.avatar, "avatar")}`
                : ""
            }
            className={`${
              profileData?.avatar ? "block" : "hidden"
            } w-full h-full rounded-full `}
          />
          <span className="text-sm font-semibold text-center text-white ">
            {!profileData?.avatar ? profileData?.name : ""}
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
            {data.isMe ? profileData?.name : data.name}
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
          router.push(`/post/${id}`);
        }}
        style="w-full h-28"
        thumbnail={thumbnail}
      />
      <LabelBtn
        contents={title}
        onClick={() => {
          router.push(`/post/${id}`);
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
      className={`relative flex justify-end left-[260px]`}
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

export const getServerSideProps: GetServerSideProps = async ({
  query,
  params,
}) => {
  return {
    props: {
      title: query?.title,
      createdAt: query?.createdAt,
    },
  };
};
// export const getStaticPaths: GetStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: true,
//   };
// };

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   let fallback = await getPostData(params.id);
//   mutate(`/api/post/${params.id}`, fallback);
//   return {
//     props: {
//       fallback: fallback,
//     },
//   };
// };

export default PostDetail;
