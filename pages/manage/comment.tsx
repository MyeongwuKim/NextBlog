import CancelBtn from "@/components/cancelBtn";
import DropDownBox from "@/components/dropdownBox";
import InputField from "@/components/inputField";
import NormalBtn from "@/components/normalBtn";
import OkBtn from "@/components/okBtn";
import { createCautionMsg, setHeadTitle, setLoading } from "@/hooks/useEvent";
import { getFormatFullDate, getTimeStamp } from "@/hooks/useUtils";
import prisma from "@/lib/server/client";
import useMutation from "@/lib/server/useMutation";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import useSWR, { SWRConfig, unstable_serialize } from "swr";

interface SWRdataProps {
  data: historyType[];
  ok: boolean;
}

interface historyResponse {
  ok: boolean;
  error: string;
}

type historyType = {
  id: number;
  isMe: boolean;
  name: string | null;
  content: string;
  createdAt: string;
  isReply: boolean;
  postId: number;
  category: string;
  categoryId: number;
  historyId: number;
  post: { title: string };
};

const CommentListSWR = ({
  historyData,
  query,
}: {
  historyData: historyType[];
  query: any;
}) => {
  let { name, content } = query;
  let urlKey = "/api/manage/comment";
  if (name) {
    urlKey = `/api/manage/comment?name=${name}`;
  } else if (content) {
    urlKey = `/api/manage/comment?content=${content}`;
  }

  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize(urlKey)]: {
            ok: true,
            data: historyData,
          },
        },
      }}
    >
      <CommentList url={urlKey} />
    </SWRConfig>
  );
};
const CommentList: NextPage<{ url: string }> = ({ url }) => {
  const router = useRouter();
  let {
    data: { data: historyData },
    mutate: historyMutate,
  } = useSWR<SWRdataProps>(url);

  const { register, reset, handleSubmit } = useForm();
  const {
    register: winRegister,
    handleSubmit: winHanldeSubmit,
    formState: { errors },
    reset: winReset,
    getValues,
    setError,
    setFocus,
  } = useForm<{ replyInput: string }>();

  const [allCheckbox, setAllCheckBox] = useState<boolean>(false);
  const [deleteEnable, setDeleteEnable] = useState<boolean>(false);
  const [dropBoxInfo, setDropBoxInfo] = useState<{
    left: number;
    top: number;
    enable: boolean;
    width: number;
  }>();
  const [search, setSearch] = useState<boolean>(false);
  const [replyWindow, setReplyWindow] = useState<{
    enable: boolean;
    data: historyType;
  }>({ data: null, enable: false });
  const [dropBoxText, setDropBoxText] = useState<string>("작성자");
  const [stateHistoryData, setStateHistoryData] = useState<historyType[]>();
  const checkBoxRef = useRef<any>({});
  const dropdownCallback = useCallback(
    (enable: boolean, selectData: string) => {
      setDropBoxInfo((prev) => {
        return { ...prev, enable };
      });
    },
    []
  );
  const [historyDelete, { data: deleteResponse, error: deleteErr }] =
    useMutation<historyResponse>("/api/manage/comment/delete");
  const [historyCreate, { data: createResponse, error: createErr }] =
    useMutation<historyResponse>("/api/manage/comment/create");

  const deleteCallback = useCallback(
    (id?: number) => {
      let newHistory;
      if (id >= 0) {
        newHistory = historyData.filter((item) => {
          if (item.historyId != id) return item;
        });
        historyDelete(id);
      } else {
        let ids = [];
        newHistory = historyData.filter((item) => {
          let checkBox = checkBoxRef.current[
            item.historyId
          ] as HTMLInputElement;
          if (!checkBox.checked) {
            return item;
          } else ids.push(item.historyId);
        });
        historyDelete(ids);
      }
      historyMutate((prev) => {
        return { ...prev, data: newHistory };
      }, false);
      setAllCheckBox(false);
    },
    [historyData]
  );

  useEffect(() => {
    setHeadTitle("댓글 관리");
    setStateHistoryData(historyData);
  }, [stateHistoryData]);
  useEffect(() => {
    if (!replyWindow.enable) winReset();
    else setFocus("replyInput");
  }, [replyWindow]);
  useEffect(() => {
    if (!deleteResponse) return;
    if (deleteResponse.ok) {
      createCautionMsg("댓글을 삭제 하였습니다.", false);
    } else {
      createCautionMsg(deleteResponse.error, true);
    }
  }, [deleteResponse]);

  useEffect(() => {
    if (!createResponse) return;
    if (createResponse.ok) {
      createCautionMsg("답글을 작성 하였습니다.", false);
      let {
        category,
        categoryId,
        name,
        postId,
        post: { title },
      } = replyWindow.data;
      let newData: historyType = {
        id: historyData[0].id + 1,
        isMe: true,
        isReply: true,
        createdAt: getFormatFullDate(new Date()),
        content: getValues("replyInput"),
        category,
        name,
        post: { title },
        categoryId,
        historyId: historyData[0].historyId + 1,
        postId,
      };
      historyMutate((prev) => {
        return { ...prev, data: [newData, ...prev.data] };
      }, false);
      setReplyWindow({ data: null, enable: false });
    } else {
      createCautionMsg(createResponse.error, true);
    }
  }, [createResponse]);

  const onValid = (data) => {
    let { searchInput } = data;
    let param = "";
    if (dropBoxText == "작성자") {
      param = "name";
    } else if (dropBoxText == "내용") {
      param = "content";
    }
    router.push(router.pathname + `?${param}=${searchInput}`);
  };

  const onReplyValid = ({ replyInput }) => {
    if (replyInput.length <= 0) {
      setFocus("replyInput");
      return setError("replyInput", { message: "내용을 입력해주세요." });
    }
    setLoading(true);
    historyCreate({ content: replyInput, data: replyWindow.data });
  };

  const onInValid: SubmitErrorHandler<{
    searchInput: string;
  }> = (error) => {
    let { searchInput } = error;
    let message = "";
    if (searchInput) {
      message = searchInput.message;
      createCautionMsg(message, true);
    }
  };

  const checkboxEvt = useCallback(() => {
    let checked = false;
    let checkBoxLength = Object.keys(checkBoxRef.current).length;
    let enableCount = 0;
    for (let i = 0; i < Object.keys(checkBoxRef.current).length; i++) {
      let checkbox = checkBoxRef.current[Object.keys(checkBoxRef.current)[i]];
      if (checkbox.checked) {
        checked = true;
        enableCount++;
      }
    }
    if (enableCount == checkBoxLength) setAllCheckBox(true);
    else setAllCheckBox(false);

    setDeleteEnable(checked);
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div
        className={`${
          replyWindow.enable ? "block" : "hidden"
        } z-50 fixed flex items-center justify-center
        bg-[rgba(0,0,0,0.2)] h-full w-full top-0 left-0`}
      >
        <form
          onSubmit={winHanldeSubmit(onReplyValid)}
          className=" flex flex-col p-4 shadow-md gap-2 dark:bg-zinc-800 rounded-md h-[200px] w-[350px]"
        >
          <div className="font-semibold text-lg">답글 입력</div>
          <InputField
            height="45px"
            width="100%"
            id="replyInput"
            register={{
              ...winRegister("replyInput"),
            }}
          />
          <div className="text-red-500 text-sm h-[20px]">
            {errors && errors?.replyInput?.message}
          </div>
          <div className="flex flex-row justify-center gap-4 mt-2">
            <OkBtn type="submit" width={85} height={45} content="확인" />
            <CancelBtn
              onClickEvt={() => {
                setReplyWindow({ enable: false, data: null });
              }}
              width={65}
              height={45}
              content="취소"
            />
          </div>
        </form>
      </div>
      <div className="relative text-xl mb-5 font-bold">
        {Object.keys(router.query).length <= 0 ? (
          "댓글 관리"
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <div
              onClick={() => {
                router.push(router.pathname);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 cursor-pointer my-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <span className="text-red-400">
              {router.query[Object.keys(router.query)[0]]}
            </span>
            검색결과
          </div>
        )}
      </div>
      <div
        className={`${
          search ? "hidden" : "block"
        } mb-2 select-none border-2 flex px-2 justify-between
        items-center h-16 dark:border-zinc-700  dark:bg-zinc-800 bg-gray-50`}
      >
        <div className="flex items-center">
          <input
            onChange={(e) => {
              if (Object.keys(checkBoxRef.current).length <= 0) {
                setAllCheckBox(false);
                return;
              } else setAllCheckBox(e.target.checked);

              for (
                let i = 0;
                i < Object.keys(checkBoxRef.current).length;
                i++
              ) {
                let checkbox =
                  checkBoxRef.current[Object.keys(checkBoxRef.current)[i]];
                if (checkbox) checkbox.checked = e.target.checked;
              }
              setDeleteEnable(e.target.checked);
            }}
            type="checkbox"
            checked={allCheckbox}
            className="mr-4 w-6 h-6 rounded ring-0
            bg-gray-50 border-gray-400 outline-none
            dark:bg-zinc-800 dark:border-zinc-700 focus:dark:ring-transparent
            checked:accent-blue-500  focus:dark:ring-0
            focus:dark:ring-offset-0
            "
          />
          <button
            onClick={() => {
              deleteCallback();
            }}
            disabled={!deleteEnable}
            className="disabled:dark:text-gray-500  disabled:text-gray-300
            underline
          disabled:pointer-events-none"
          >
            선택삭제
          </button>
        </div>
        <button
          onClick={() => {
            setSearch(true);
          }}
          className="flex flex-row"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 m-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit(onValid, onInValid)}>
        <div
          id="serchContainer"
          className={`${search ? "block" : "hidden"} mb-2 select-none 
        border-2 flex p-2 justify-between
        items-center h-16 dark:border-zinc-700`}
        >
          <div
            id="searchDropBox"
            onClick={() => {
              let btn = document.getElementById("searchDropBox");
              setDropBoxInfo({
                left: btn.getClientRects()[0].left,
                top: btn.getClientRects()[0].top + 35,
                enable: true,
                width: btn.getClientRects()[0].width,
              });
            }}
            className="cursor-pointer border-r-2 w-24 mr-2 dark:border-zinc-700 
          flex justify-center gap-2"
          >
            <span className="w-12">{dropBoxText}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-4 h-4 my-auto ${
                !dropBoxInfo?.enable ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
          </div>

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
            })}
            className="flex-1 bg-transparent w-full focus:outline-none
            dark:placeholder:text-gray-400 placeholder:text-gray-300 "
          />
          <button className="mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 m-auto cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
          <div
            onClick={() => {
              reset();
              setSearch(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </form>
      <div
        className={`mt-4 flex flex-col items-center gap-4 border-b-2
        dark:border-zinc-800 dark:bg-zinc-900 ${
          historyData?.length <= 0 ? "block" : "hidden"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <div className="font-semibold text-lg mb-4">검색 결과가 없습니다.</div>
      </div>
      {historyData?.map((itemData, i) => (
        <Item
          deleteCallback={deleteCallback}
          replayState={setReplyWindow}
          data={itemData}
          id={i}
          checkBoxRef={checkBoxRef}
          checkBoxEvt={checkboxEvt}
          key={i}
        />
      ))}
      <DropDownBox
        info={{
          left: dropBoxInfo?.left,
          top: dropBoxInfo?.top,
          width: dropBoxInfo?.width,
        }}
        enable={dropBoxInfo?.enable}
        dropdownCallback={dropdownCallback}
        defaultItemNumber={0}
        items={[
          {
            categoryName: null,
            child: [
              {
                name: "작성자",
                clickEvt: () => {
                  setDropBoxText("작성자");
                },
              },
              {
                name: "내용",
                clickEvt: () => {
                  setDropBoxText("내용");
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export const Item = ({
  checkBoxEvt,
  checkBoxRef,
  id,
  data,
  deleteCallback,
  replayState,
}: {
  data: historyType;
  checkBoxEvt: () => void;
  checkBoxRef: MutableRefObject<any>;
  id: number;
  deleteCallback: (id?: number) => void;
  replayState: Dispatch<SetStateAction<{ enable: boolean; data: historyType }>>;
}) => {
  const router = useRouter();
  const [enableHiddenView, setEnableHiddenView] = useState<boolean>(false);

  useEffect(() => {}, []);

  return (
    <div
      onMouseEnter={() => {
        setEnableHiddenView(true);
      }}
      onMouseLeave={() => {
        setEnableHiddenView(false);
      }}
      className={`relative mb-1 w-full h-auto p-2 hover:dark:bg-zinc-800 hover:bg-gray-50
      select-none border-b-2 flex items-center dark:border-zinc-800 dark:bg-zinc-900`}
    >
      <div className="flex flex-row w-full">
        <input
          id={data?.historyId.toString()}
          onChange={(e) => {
            checkBoxRef.current[data?.historyId].checked = e.target.checked;
            checkBoxEvt();
          }}
          ref={(element) => {
            checkBoxRef.current[data?.historyId] = element;
          }}
          type="checkbox"
          className="flex-none
          mr-4 w-6 h-6 rounded ring-0 m-auto
            bg-gray-50 border-gray-400 outline-none
            dark:bg-zinc-800 dark:border-zinc-700 focus:dark:ring-transparent
            checked:accent-blue-500 focus:dark:ring-0
            focus:dark:ring-offset-0"
        />
        <div className="grow flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <span
              onClick={() => {
                router.push(router.pathname + `?name=${data?.name}`);
              }}
              className="font-bold cursor-pointer"
            >
              {data?.isMe ? (
                <span className="rounded-md px-2 ring-2 ring-red-400 mr-2">
                  나
                </span>
              ) : null}
              {data?.name}
            </span>
            <span className="dark:text-gray-400 text-slate-400 mr-4">
              {getFormatFullDate(data?.createdAt)} 작성
            </span>
          </div>
          <div>
            {data?.isReply ? (
              <span className="font-bold text-emerald-500 mr-2">[답글]</span>
            ) : null}
            <span
              className="cursor-pointer"
              onClick={() => {
                let query = "comment";
                if (data.isReply) query = "reply";
                router.push(`/post/${data.postId}?${query}=${data.id}`);
              }}
            >
              {data?.content}
            </span>
          </div>
          <span className="dark:text-gray-400 text-slate-400 mr-4">
            {data?.post.title}
          </span>
        </div>
        <div className="flex-none w-[120px] ml-2  flex justify-end items-center">
          <div
            className={`${
              enableHiddenView ? "block" : "hidden"
            } flex flex-row right-2 gap-2`}
          >
            <NormalBtn
              onClickEvt={() => {
                replayState({ enable: true, data });
              }}
              content="답글"
              width={45}
              height={40}
            />
            <NormalBtn
              onClickEvt={() => deleteCallback(data.historyId)}
              content="삭제"
              width={45}
              height={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  let { name, content } = ctx.query;

  let selectList = {
    id: true,
    content: true,
    name: true,
    createdAt: true,
    postId: true,
    isMe: true,
    category: {
      select: {
        id: true,
        name: true,
      },
    },
    post: {
      select: {
        title: true,
      },
    },
  };
  let selectInfo = {};
  if (content) {
    selectInfo = {
      OR: [
        {
          comment: {
            content: {
              contains: content.toString(),
            },
          },
        },
        {
          reply: {
            content: {
              contains: content.toString(),
            },
          },
        },
      ],
    };
  }
  if (name) {
    selectInfo = {
      OR: [
        {
          comment: {
            name: {
              startsWith: name.toString(),
              endsWith: name.toString(),
            },
          },
        },
        {
          reply: {
            name: {
              startsWith: name.toString(),
              endsWith: name.toString(),
            },
          },
        },
      ],
    };
  }
  let commentsData = await prisma.history.findMany({
    orderBy: { createdAt: "desc" },
    where: selectInfo,
    select: {
      id: true,
      isReply: true,
      reply: {
        select: selectList,
      },
      comment: {
        select: selectList,
      },
    },
  });

  let formatCommentsData = commentsData.map((item) => {
    let formatData;
    let category;
    let categoryId;
    if (item.isReply) {
      delete item.comment;
      formatData = item.reply;
      category = item.reply.category.name;
      categoryId = item.reply.category.id;
    } else {
      delete item.reply;
      formatData = item.comment;
      category = item.comment.category.name;
      categoryId = item.comment.category.id;
    }

    return {
      ...formatData,
      isReply: item.isReply,
      category,
      categoryId,
      historyId: item.id,
    };
  });

  return {
    props: {
      historyData: JSON.parse(JSON.stringify(formatCommentsData)),
      query: ctx.query,
    },
  };
};

export default CommentListSWR;
