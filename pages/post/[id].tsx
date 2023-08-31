import CancelBtn from "@/components/cancelBtn";
import InputField from "@/components/inputField";
import OkBtn from "@/components/okBtn";
import ReactMD from "@/components/write/reactMD";
import { getUserData, userCheck } from "@/hooks/useData";
import {
  getDeliveryDomain,
  getFormatDate,
  getFormatFullDate,
} from "@/hooks/useUtils";
import {
  setLoading,
  createErrorMsg,
  setHeadTitle,
  createAlert,
} from "@/hooks/useEvent";
import prisma from "@/lib/server/client";
import useMutation from "@/lib/server/useMutation";
import { Comment, Post, Reply } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import useSWR, { SWRConfig, unstable_serialize } from "swr";
import { getToken } from "next-auth/jwt";
import LabelBtn from "@/components/labelBtn";
import Image from "next/image";
import CompImg from "@/components/CompImg";

interface PostDataProps {
  postData: Post & {
    category: { name: string };
    comments: (Comment & { replys: Reply[] })[];
  };
  nearPostData: NearPostType[];
}
type NearPostType = {
  title: string;
  id: number;
  createdAt: string;
  thumbnail: string;
};
interface CommentForm {
  content: string;
  name: string;
  password: string;
}
interface ErrorFormData extends CommentForm {}
interface mutationResponse {
  ok: boolean;
  error: string;
}
interface CommentSWR {
  data: Post & {
    category: { name: string };
    comments: (Comment & { replys: Reply[] })[];
  };
  ok: boolean;
}
let commentData: Comment;

const PostSWR = ({ postData, nearPostData }: PostDataProps) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize(`/api/post/${postData.id}`)]: {
            ok: true,
            data: postData,
          },
        },
      }}
    >
      <PostDetail postId={postData.id} nearPostData={nearPostData} />
    </SWRConfig>
  );
};
const PostDetail: NextPage<{
  postId: number;
  nearPostData: NearPostType[];
}> = ({ postId, nearPostData }) => {
  const router = useRouter();
  const { register, handleSubmit, getValues, reset } = useForm<CommentForm>();
  let { data: sessionData } = useSession();
  let userData = getUserData();
  let isMe = userCheck(sessionData);
  const [createTime, setCreateTime] = useState<string>();
  const [btnState, setBtnState] = useState<boolean>(false);
  const [createComments, { loading, data: responseData, error }] =
    useMutation<mutationResponse>("/api/comments/create");
  const {
    data: { data: postData },
    isLoading,
    mutate: postMutation,
  } = useSWR<CommentSWR>(postId ? `/api/post/${postId}` : null);
  const [postDeleteMutation, { data: deleteRespose }] =
    useMutation<mutationResponse>(postId ? `/api/post/delete/${postId}` : null);

  useEffect(() => {
    setHeadTitle(postData?.title);
    console.log(nearPostData);
    document.getElementById("scrollArea").scrollTop = 0;
  }, [postData]);
  useEffect(() => {
    if (!deleteRespose) return;
    if (deleteRespose.ok) {
      createErrorMsg("삭제가 완료 되었습니다.", false);
      router.replace("/");
    } else {
    }
  }, [deleteRespose]);
  useEffect(() => {
    if (!responseData) return;
    if (responseData.ok) {
      reset();
      postMutation((prev) => {
        return prev;
      });
      setLoading(false);
    } else createErrorMsg(responseData.error, true);
  }, [responseData]);

  useEffect(() => {
    if (error) createErrorMsg(error as any, true);
  }, [error]);

  const onValid = (data) => {
    setLoading(true);
    data = { ...data, postId: postData.id };
    commentData = data;
    createComments(data);
  };
  const onInValid: SubmitErrorHandler<ErrorFormData> = (error) => {
    let { password, content, name } = error;
    let message = "";
    if (name) {
      message = name.message;
    } else if (password) {
      message = password.message;
    } else if (content) {
      message = content.message;
    }
    createErrorMsg(message, true);
  };

  const checkChange = () => {
    let { content, name, password } = getValues();

    if (isMe) {
      if (content.length <= 0) setBtnState(false);
      else setBtnState(true);
    } else {
      if (content.length <= 0 || name.length <= 0 || password.length <= 0)
        setBtnState(false);
      else setBtnState(true);
    }
  };

  useEffect(() => {
    setCreateTime(getFormatDate(postData?.createdAt));
  }, []);
  return (
    <div className="flex flex-row w-full">
      <div className="w-full flex-[0.6_0.6_0%]">
        <div className="mb-5 text-5xl font-bold leading-tight">
          <span className="mr-2">[{postData?.category.name}]</span>
          {postData?.title}
        </div>
        <Appendix />
        <div className="mb-5 flex justify-between">
          <div className="text-lg dark:text-gray-400 text-slate-400 flex">
            <span className="mr-2">{createTime} 작성</span>
            <span
              className={`${postData?.isPrivate ? "block" : "hidden"} flex`}
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
                router.push(`/write?id=${postData?.id}`);
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
                    postDeleteMutation({});
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
        <div className="my-16" id="reactMD">
          <ReactMD doc={postData?.content} />
        </div>
        <div className="mb-8 text-xl font-semibold">Post By</div>
        <div className="py-12 mb-16 border-y-[1px] flex border-gray-200 dark:border-zinc-800">
          <div
            className="border-2 dark:border-zinc-800 relative flex 
              flex-row items-center justify-center w-36 h-36 rounded-full bg-slate-500"
          >
            <img
              src={
                userData?.avatar
                  ? `${getDeliveryDomain(userData?.avatar, "avatar")}`
                  : ""
              }
              className={`${
                userData?.avatar ? "block" : "hidden"
              } w-full h-full rounded-full `}
            />
            <span className="text-3xl font-semibold text-center text-white ">
              {!userData?.avatar ? userData?.name : ""}
            </span>
          </div>
          <div className="ml-4">
            <div className="mb-2 text-xl font-bold">{userData?.name}</div>
            <div className="text-lg font-semibold">{userData?.introduce}</div>
          </div>
        </div>
        <div>
          <div className="w-full mb-16">
            <div className="mb-4 text-xl font-semibold">
              [{postData?.category?.name}] 카테고리 관련글
            </div>
            <div className="grid grid-cols-4 gap-4">
              {nearPostData?.map((nearPost, i) => (
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
          <div className="mb-16 min-h-[100px] w-full"></div>
          <div className="border-t-[1px]  border-gray-200 dark:border-zinc-800 flex items-center ">
            <div className="text-lg my-4 font-semibold">
              {postData?.comments.length}개의 댓글
            </div>
          </div>
          <div className="grid grid-flow-row gap-6">
            {postData?.comments.map((commentData) => (
              <CommentItem
                allow={postData.allow}
                commentData={commentData}
                postId={postData?.id}
                key={commentData.id}
              />
            ))}
          </div>
          <div className="border-y-[1px] border-gray-200 dark:border-zinc-800 mb-6" />
          <div
            className={`h-[50px] mb-8 ${
              postData?.allow ? "hidden" : "block"
            } text-xl font-semibold flex items-center justify-center text-gray-400`}
          >
            <span>댓글 작성이 금지된 게시물입니다.</span>
          </div>
          <form
            className={`${postData?.allow ? "block" : "hidden"}`}
            method="post"
            onSubmit={handleSubmit(onValid, onInValid)}
          >
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
                width="49%"
                placeholder="이름"
                id="name"
              />
              <InputField
                register={
                  isMe
                    ? null
                    : {
                        ...register("password", {
                          required: true,
                          minLength: {
                            value: 4,
                            message: "비밀번호는 4자 이상이여야 합니다.",
                          },
                          onChange: checkChange,
                        }),
                      }
                }
                height="100%"
                width="49%"
                placeholder="비밀번호"
                id="password"
                type="password"
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
    </div>
  );
};

interface CommentItemProps {
  replyCallback: () => void;
  isReply: boolean;
  data: Comment | Reply;
  allow: boolean;
}

interface CommentProps {
  allow: boolean;
  postId: number;
  commentData: Comment & {
    replys: Reply[];
  };
}

export const CommentItem = ({ commentData, postId, allow }: CommentProps) => {
  let { data: sessionData } = useSession();
  let userData = getUserData();
  let isMe = userCheck(sessionData);
  const { register, handleSubmit, getValues, setFocus, reset } =
    useForm<CommentForm>();
  const [enableReply, setEnableReply] = useState<boolean>(false);
  const [showReply, setShowReply] = useState<boolean>(false);
  const [createReply, { loading, data, error }] =
    useMutation<mutationResponse>("/api/reply/create");
  const { isLoading, mutate: postMutation } = useSWR<CommentSWR>(
    postId ? `/api/post/${postId}` : null
  );

  useEffect(() => {
    if (!data) return;

    if (data.ok) {
      setLoading(false);
      reset();
      setShowReply(false);
      postMutation((prev) => prev);
    } else {
      createErrorMsg(data.error, true);
    }
  }, [data]);
  const checkChange = () => {
    let { content, name, password } = getValues();

    if (isMe) {
      if (content.length <= 0) setEnableReply(false);
      else setEnableReply(true);
    } else {
      if (content.length <= 0 || name.length <= 0 || password.length <= 0)
        setEnableReply(false);
      else setEnableReply(true);
    }
  };

  const onReplyBtnClick = useCallback(() => {
    reset();
    setFocus("name", { shouldSelect: true });
    setShowReply(true);
  }, []);

  const onValid = (data) => {
    setLoading(true);
    data = { ...data, commentId: commentData.id, postId };
    createReply(data);
  };
  const onInValid: SubmitErrorHandler<ErrorFormData> = (error) => {
    let { password, content, name } = error;
    let message = "";
    if (name) {
      message = name.message;
    } else if (password) {
      message = password.message;
    } else if (content) {
      message = content.message;
    }
    createErrorMsg(message, true);
  };

  return (
    <div className="w-full">
      <CommentBody
        allow={allow}
        data={commentData}
        isReply={false}
        replyCallback={onReplyBtnClick}
      />
      <div className="mt-4 ml-6 grid grid-flow-row gap-4">
        {commentData?.replys?.map((replyData) => (
          <CommentBody
            allow={allow}
            key={replyData.id}
            data={replyData}
            isReply={true}
            replyCallback={onReplyBtnClick}
          />
        ))}
      </div>
      <form
        method="post"
        onSubmit={handleSubmit(onValid, onInValid)}
        className={`mt-4 ${showReply ? "block" : "hidden"}`}
      >
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
            width="49%"
            placeholder="이름"
            id="name"
          />
          <InputField
            register={
              isMe
                ? null
                : {
                    ...register("password", {
                      required: true,
                      minLength: {
                        value: 4,
                        message: "비밀번호는 4자 이상이여야 합니다.",
                      },
                      onChange: checkChange,
                    }),
                  }
            }
            height="100%"
            width="49%"
            placeholder="비밀번호"
            id="password"
            type="password"
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
}: CommentItemProps) => {
  let userData = getUserData();
  let { data: sessionData } = useSession();
  let isMe = userCheck(sessionData);
  let [commentDelete, { data: commentsResponse, error: commentError }] =
    useMutation<DeleteResponse>("/api/comments/delete");
  let [replyDelete, { data: replyResponse, error: replyError }] =
    useMutation<DeleteResponse>("/api/reply/delete");

  const { isLoading, mutate: postMutation } = useSWR<CommentSWR>(
    data?.postId ? `/api/post/${data?.postId}` : null
  );

  useEffect(() => {
    if (commentError) {
      createErrorMsg(commentError as any, true);
    } else if (replyError) {
      createErrorMsg(replyError as any, true);
    }
  }, [commentError, replyError]);

  useEffect(() => {
    let ok = false;
    let error = "";
    if (commentsResponse || replyResponse) {
      if (commentsResponse) {
        ok = commentsResponse.ok;
        error = commentsResponse.error;
      } else if (replyResponse) {
        ok = replyResponse.ok;
        error = replyResponse.error;
      }

      if (ok) {
        createErrorMsg("삭제를 완료했습니다", false);
        postMutation();
      } else {
        createErrorMsg(error, true);
      }
    }
  }, [commentsResponse, replyResponse]);

  const onDelete = () => {
    setLoading(true);
    let id = data.id;
    if (isReply) {
      //대댓글 삭제
      replyDelete({ replyId: id });
    } else {
      //코멘트삭제
      commentDelete({ commentId: id });
    }
  };
  return (
    <div className="w-full flex flex-row">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        style={{}}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-6 h-6 scale-y-[-1] mt-4 mr-[1px] ${
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
              userData?.avatar
                ? `${getDeliveryDomain(userData?.avatar, "avatar")}`
                : ""
            }
            className={`${
              userData?.avatar ? "block" : "hidden"
            } w-full h-full rounded-full `}
          />
          <span className="text-sm font-semibold text-center text-white ">
            {!userData?.avatar ? userData?.name : ""}
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
            {data.isMe ? userData?.name : data.name}
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
              onClick={onDelete}
              className="text-sm cursor-pointer
dark:text-gray-400 text-slate-400 underline"
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

  return (
    <div className="flex flex-col gap-2">
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
    </div>
  );
};
export const Appendix = () => {
  const btnRef = useRef<any>({});
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
  }, []);

  return (
    <div className="relative w-full">
      <div
        className={`flex flex-col items-start justify-start right-40
         h-auto w-auto border-l-[2px] border-gray-200 px-4 fixed 
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
            className="w-6 h-6 m-auto"
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
            case "3":
              addStyle = "ml-4";
          }
          return (
            <LabelBtn
              id="1"
              key={i}
              contents={ele.innerText}
              addStyle={addStyle}
              anyRef={btnRef}
            />
          );
        })}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let token = await getToken({
    req: ctx.req,
    cookieName: process.env.NEXTAUTH_TOKENNAME,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const postData = await prisma.post.findUnique({
    where: {
      id: Number(ctx.params.id),
    },
    include: {
      category: {
        select: {
          name: true,
          id: true,
        },
      },
      comments: {
        include: { replys: true },
      },
    },
  });

  let privateCheck = postData?.isPrivate && !token ? true : false;

  if (privateCheck) {
    return {
      props: {
        title: "에러",
        contents: "접근 권한이 없는 페이지입니다.",
      },
    };
  }
  const getPageData = async (take, orderBy) => {
    return await prisma.category.findUnique({
      where: {
        id: postData?.category.id,
      },
      select: {
        post: {
          cursor: {
            id: Number(ctx.params.id),
          },
          skip: 1,
          take,
          select: {
            title: true,
            thumbnail: true,
            createdAt: true,
            id: true,
          },
          orderBy: {
            createdAt: orderBy,
          },
        },
      },
    });
  };

  let { post: prevPost } = await getPageData(4, "desc");
  let { post: nextPost } = await getPageData(4, "asc");
  let pageData = [];
  let totalPostCount = prevPost.length + nextPost.length;

  const setPageData = (data, maxLength, reverse?) => {
    let selectData = [];
    if (data.length > 0) {
      for (
        let i = reverse ? maxLength - 1 : 0;
        reverse ? i > -1 : i < maxLength;
        reverse ? i-- : i++
      ) {
        selectData.push(data[i]);
      }
    }
    return selectData;
  };

  if (totalPostCount > 0) {
    let order = { left: 0, right: 0 };
    if (nextPost.length >= 2 && prevPost.length >= 2) {
      order = { left: 2, right: 2 };
    } else {
      let firstOne = nextPost.length > prevPost.length ? prevPost : nextPost;
      let secondOne = nextPost.length > prevPost.length ? nextPost : prevPost;
      let firstIter = firstOne.length;
      let secondIter =
        secondOne.length < 4 ? secondOne.length : secondOne.length - firstIter;

      order = {
        left: prevPost.length < nextPost.length ? secondIter : firstIter,
        right: prevPost.length < nextPost.length ? firstIter : secondIter,
      };
    }

    let selectedNextPost = setPageData(nextPost, order.left, true);
    let selectedPrevPost = setPageData(prevPost, order.right);
    pageData = [...selectedNextPost, ...selectedPrevPost];
  }

  return {
    props: {
      postData: JSON.parse(JSON.stringify(postData)),
      nearPostData: JSON.parse(JSON.stringify(pageData)),
      title: postData?.title,
    },
  };
};

export default PostSWR;
