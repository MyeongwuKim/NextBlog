import DropDownBox from "@/components/dropdownBox";
import SpinnerLoading from "@/components/loading/spinnerLoading";
import NormalBtn from "@/components/normalBtn";
import Pagination from "@/components/pagination";
import { getGlobalSWR } from "@/hooks/useData";
import {
  createModal,
  createToast,
  setHeadTitle,
  setLoading,
} from "@/hooks/useEvent";
import { getFormatFullDate } from "@/hooks/useUtils";
import useMutation from "@/lib/server/useMutation";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
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
import useSWR from "swr";

interface PostHistory {
  id: number;
  title: string;
  isPrivate: boolean;
  allow: boolean;
  content: string;
  html: string;
  createdAt: string;
  category: {
    name: string;
    id: number;
  };
  account: {
    name: string;
  };
}

interface Category {
  name: string;
  id: number;
}

interface SWRdataProps {
  data: {
    postHistory: PostHistory[];
    categoryList: Category[];
    endPageCount: number;
  };
  ok: boolean;
}

interface MutationResponse {
  ok: boolean;
  error: string;
}
const pageSize = 5;

const PostList: NextPage = ({ url }: { url: string }) => {
  const router = useRouter();
  let {
    data,
    mutate: historyMutate,
    isLoading,
  } = useSWR<SWRdataProps>(url, null, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });
  const { categoryMutate } = getGlobalSWR();
  const [postDeleteMutation, { data: deleteResponse }] =
    useMutation<MutationResponse>(`/api/post/delete`);
  const [mutateMutation, { data: mutateResponse }] =
    useMutation<MutationResponse>(`/api/manage/post/mutate`);
  const { register, reset, handleSubmit } = useForm();
  const [mutateEnable, setMutateEnable] = useState<boolean>(false);
  const [search, setSearch] = useState<boolean>(false);
  const [allCheckbox, setAllCheckBox] = useState<boolean>(false);
  const [dropBoxInfo, setDropBoxInfo] = useState<{
    left: number;
    top: number;
    enable: boolean;
    width: number;
  }>();
  const [mutateDropBoxInfo, setMutateDropBoxInfo] = useState<{
    left: number;
    top: number;
    enable: boolean;
    width: number;
  }>();
  const [pageNumArr, setPageNumArr] = useState<number[]>();
  const [dropBoxText, setDropBoxText] = useState<string>("제목");
  const checkBoxRef = useRef<any>({});
  const dropdownCallback = useCallback(
    (enable: boolean, selectData: string) => {
      setDropBoxInfo((prev) => {
        return { ...prev, enable };
      });
      setMutateDropBoxInfo((prev) => {
        return { ...prev, enable };
      });
    },
    []
  );
  useEffect(() => {
    setHeadTitle(`|${router.query.userId}| ` + "글 관리");
  }, [router]);
  useEffect(() => {
    if (data?.data.endPageCount > 0) {
      let curNumber = Number(
        router.query.pageoffset == undefined ? 1 : router.query.pageoffset
      );
      let endPageNumber = Math.ceil(data?.data.endPageCount / pageSize);
      let arr = [curNumber];
      let size = endPageNumber < pageSize ? endPageNumber : pageSize;
      let prev = curNumber;
      let next = curNumber;
      while (arr.length != size) {
        prev = prev - 1;
        next = next + 1;
        if (prev > 0) arr.splice(0, 0, prev);
        if (next <= endPageNumber) arr.splice(arr.length, 0, next);
      }
      setPageNumArr(arr);
    }
  }, [data?.data]);
  useEffect(() => {
    if (!mutateResponse) return;
    if (mutateResponse.ok) {
      categoryMutate();
      createToast("포스트 정보를 변경하였습니다.", false);
    } else {
      createToast(mutateResponse.error, true);
    }
  }, [mutateResponse]);
  useEffect(() => {
    if (!deleteResponse) return;
    if (deleteResponse.ok) {
      categoryMutate();
      createToast("포스트를 삭제하였습니다.", false);
      router.replace(router.asPath);
    } else {
      createToast(deleteResponse.error, true);
    }
  }, [deleteResponse]);
  useEffect(() => {
    reset();
  }, [search]);
  const onMutateEvt = useCallback(
    (type?: { [name: string]: any }, id?: number) => {
      setLoading(true);

      let ids = [];
      let newHistory = data?.data.postHistory.filter((item) => {
        let checkBox = checkBoxRef.current[item.id] as HTMLInputElement;
        if (checkBox.checked) {
          if (
            type.hasOwnProperty("categoryName") &&
            type.hasOwnProperty("categoryId")
          ) {
            item.category = { id: type.categoryId, name: type.categoryName };
          } else {
            let typeName = Object.keys(type)[0];
            item[typeName] = type[typeName];
          }
          ids.push(item.id);
        }
        return item;
      });
      mutateMutation({ type, postIds: ids });

      historyMutate((prev) => {
        return {
          ...prev,
          data: {
            ...prev.data,
            postHistory: newHistory,
          },
        };
      }, false);
      setAllCheckBox(false);
      allCheckBoxEvt(false);
    },
    [data?.data]
  );
  const onDeleteEvt = useCallback(
    (id?: number) => {
      let newHistory;
      let newEndPageCount = data?.data.endPageCount;
      if (id >= 0) {
        newHistory = data?.data.postHistory.filter((item) => {
          if (item.id != id) return item;
        });
        newEndPageCount--;
        postDeleteMutation(id);
      } else {
        let ids = [];
        newHistory = data?.data.postHistory.filter((item) => {
          let checkBox = checkBoxRef.current[item.id] as HTMLInputElement;
          if (checkBox.checked) ids.push(item.id);
          if (!checkBox.checked) {
            return item;
          }
        });
        newEndPageCount -= ids.length;
        postDeleteMutation(ids);
      }
      setAllCheckBox(false);
    },
    [data?.data.postHistory]
  );
  const allCheckBoxEvt = (checked: boolean) => {
    for (let i = 0; i < Object.keys(checkBoxRef.current).length; i++) {
      let checkbox = checkBoxRef.current[Object.keys(checkBoxRef.current)[i]];
      if (checkbox) checkbox.checked = checked;
    }
    setMutateEnable(checked);
  };
  const onSearchValid = (data) => {
    let { searchInput } = data;
    let param = "";
    if (dropBoxText == "제목") {
      param = "title";
    } else if (dropBoxText == "내용") {
      param = "content";
    } else if (dropBoxText == "카테고리") {
      param = "category";
    }
    router
      .push(`/${router.query.userId}/manage/post` + `?${param}=${searchInput}`)
      .then(() => {
        setSearch(false);
      });
  };
  const onSearchInvalid: SubmitErrorHandler<{
    searchInput: string;
  }> = (error) => {
    let { searchInput } = error;
    let message = "";
    if (searchInput) {
      message = searchInput.message;
      createToast(message, true);
    }
  };

  const checkboxEvt = useCallback(() => {
    let checked = false;
    let checkBoxLength = Object.keys(checkBoxRef.current).length;
    let enableCount = 0;
    for (let i = 0; i < Object.keys(checkBoxRef.current).length; i++) {
      let checkbox = checkBoxRef.current[Object.keys(checkBoxRef.current)[i]];
      if (checkbox != undefined && checkbox.checked) {
        checked = true;
        enableCount++;
      }
    }
    if (enableCount == checkBoxLength) setAllCheckBox(true);
    else setAllCheckBox(false);
    setMutateEnable(checked);
  }, []);

  if (isLoading) {
    return (
      <div
        id="PostLoading"
        className="flex items-center justify-center w-full h-[300px]"
      >
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="h-full  w-full  flex flex-col md:mt-5">
      <div className="relative text-xl sm:text-lg mb-5 font-bold">
        {["title", "content", "category"].filter((page, i) => {
          if (router.asPath.includes(page)) {
            return true;
          }
        }).length <= 0 ? (
          "글 관리"
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <div
              onClick={() => {
                router.push(`/${router.query.userId}/manage/post`);
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
              {
                router.query[
                  Object.keys(router.query).filter((v) => {
                    return v != "pageoffset";
                  })[0]
                ]
              }
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

              allCheckBoxEvt(e.target.checked);
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
            id="mutateDropBoxBtn"
            disabled={!mutateEnable}
            onClick={() => {
              //드랍박스 이벤트
              let btn = document.getElementById("mutateDropBoxBtn");
              setMutateDropBoxInfo({
                left: btn.getClientRects()[0].left,
                top: btn.getClientRects()[0].top + 35,
                enable: true,
                width: btn.getClientRects()[0].width,
              });
            }}
            className="disabled:dark:text-gray-500 disabled:text-gray-300
          disabled:pointer-events-none flex flex-row"
          >
            <span>변경</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-4 h-4 my-auto ml-2 ${
                !mutateDropBoxInfo?.enable ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
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
      <form onSubmit={handleSubmit(onSearchValid, onSearchInvalid)}>
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
            <span className="w-14">{dropBoxText}</span>
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
          data?.data.postHistory?.length <= 0 ? "block" : "hidden"
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
      {data?.data.postHistory?.map((post, i) => (
        <Item
          data={post}
          id={i}
          checkBoxRef={checkBoxRef}
          checkBoxEvt={checkboxEvt}
          setSearch={setSearch}
          deleteEvt={onDeleteEvt}
          key={post.id}
        />
      ))}
      <div className="relative mt-4">
        <Pagination
          pageSize={pageSize}
          endPageNumber={Math.ceil(data?.data.endPageCount / pageSize)}
          pageNumberArr={pageNumArr}
        />
      </div>
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
                name: "제목",
                clickEvt: () => {
                  setDropBoxText("제목");
                },
              },
              {
                name: "내용",
                clickEvt: () => {
                  setDropBoxText("내용");
                },
              },
              {
                name: "카테고리",
                clickEvt: () => {
                  setDropBoxText("카테고리");
                },
              },
            ],
          },
        ]}
      />
      <DropDownBox
        info={{
          left: mutateDropBoxInfo?.left,
          top: mutateDropBoxInfo?.top,
          width: 160,
        }}
        enable={mutateDropBoxInfo?.enable}
        dropdownCallback={dropdownCallback}
        items={[
          {
            categoryName: "상태 변경",
            child: [
              {
                name: "공개",
                clickEvt: () => onMutateEvt({ isPrivate: false }),
              },
              {
                name: "비공개",
                clickEvt: () => onMutateEvt({ isPrivate: true }),
              },
              {
                name: "댓글 허용",
                clickEvt: () => onMutateEvt({ allow: true }),
              },
              {
                name: "댓글 비허용",
                clickEvt: () => onMutateEvt({ allow: false }),
              },
              {
                name: "삭제",
                clickEvt: () => {
                  createModal(
                    "이 글 및 이미지 파일을 완전히 삭제합니다.<br> 계속하시겠습니까?",
                    ["취소", "확인"],
                    () => {
                      setLoading(true);
                      onDeleteEvt();
                    },
                    350
                  );
                },
              },
            ],
          },
          {
            categoryName: "카테고리 변경",
            child: data?.data.categoryList?.map((category) => {
              return {
                name: category.name,
                clickEvt: () => {
                  onMutateEvt({
                    categoryId: category.id,
                    categoryName: category.name,
                  });
                },
              };
            }),
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
  deleteEvt,
  setSearch,
}: {
  data: PostHistory;
  checkBoxEvt: () => void;
  checkBoxRef: MutableRefObject<any>;
  setSearch: Dispatch<SetStateAction<boolean>>;
  deleteEvt: (id: number) => void;
  id: number;
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
          id={data?.id.toString()}
          onChange={(e) => {
            checkBoxRef.current[data?.id].checked = e.target.checked;
            checkBoxEvt();
          }}
          ref={(element) => {
            checkBoxRef.current[data?.id] = element;
          }}
          type="checkbox"
          className="flex-none
          mr-4 w-6 h-6 rounded ring-0 m-auto
            bg-gray-50 border-gray-400 outline-none
            dark:bg-zinc-800 dark:border-zinc-700 focus:dark:ring-transparent
            checked:accent-blue-500 focus:dark:ring-0
            focus:dark:ring-offset-0"
        />
        <div className="grow flex flex-col gap-2 w-full">
          <div className="flex flex-row gap-2 w-full relative">
            <span className="font-bold min-w-[60px] sm:text-sm">
              {data?.account?.name}
            </span>
            <span className="dark:text-gray-400 text-slate-400 mr-4 sm:text-sm">
              {getFormatFullDate(data?.createdAt)}
            </span>
          </div>
          <div className="max-w-[230px] max-h-[48px]  truncate">
            <span
              onClick={() => {
                router.push(`/${router.query.userId}/post?id=${data?.id}`);
              }}
              className="cursor-pointer"
            >
              {data?.title}
            </span>
          </div>
          <div>
            <span
              onClick={() => {
                router
                  .push(
                    `/${router.query.userId}/manage/post` +
                      `?category=${data?.category.name}`
                  )
                  .then(() => {
                    setSearch(false);
                  });
              }}
              className="text-red-400 cursor-pointer font-semibold  w-auto"
            >
              {data?.category.name}
            </span>
          </div>
        </div>
        <div className="flex-none w-[100px] ml-2  flex justify-end items-center sm:w-[60px]">
          <div
            className={`${
              enableHiddenView ? "block" : "hidden"
            }  flex flex-row right-2 gap-2 sm:flex-col`}
          >
            <NormalBtn
              onClickEvt={() => {
                router.push(`/${router.query.userId}/write?id=${data?.id}`);
              }}
              content="수정"
              width={45}
              height={40}
            />
            <NormalBtn
              onClickEvt={() => {
                createModal(
                  "이 글 및 이미지 파일을 완전히 삭제합니다.<br> 계속하시겠습니까?",
                  ["취소", "확인"],
                  () => {
                    setLoading(true);
                    deleteEvt(data?.id);
                  },
                  350
                );
              }}
              content="삭제"
              width={45}
              height={40}
            />
          </div>
          <div
            className={`text-sm dark:text-gray-400 text-slate-400 
            ${
              enableHiddenView ? "hidden" : "block"
            }  flex flex-row right-2 gap-2 justify-center items-center sm:flex-col`}
          >
            <span>
              {data?.isPrivate ? (
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
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              ) : (
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
                    d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              )}
            </span>
            <span className="">
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
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-4 h-4 absolute ml-[20px] mt-[-30px] ${
                  data?.allow ? "hidden" : "block"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const { userId, title, content, category, pageoffset } = ctx.query;
  const url = ctx.resolvedUrl.replace(userId as string, "api");
  return {
    props: {
      url,
    },
  };
};
export default PostList;
