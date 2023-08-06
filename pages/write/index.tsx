import { GetServerSidePropsContext, NextPage } from "next";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Editor from "@/components/write/editor";
import Preview from "@/components/write/preview";
import { useTheme } from "next-themes";
import useCodeMirror from "@/lib/front/use-codemirror";
import ToolBar from "@/components/write/toolbar";
import {
  createErrorMsg,
  getCategoryData,
  setLoading,
  updateUserData,
} from "hooks/useGlobal";
import Image from "next/image";
import { Category, Post } from "@prisma/client";
import useMutation from "@/lib/server/useMutation";
import { useSession } from "next-auth/react";

interface PopupData {
  thumnail?: string;
  isPrivate: boolean;
  allow: boolean;
  category: CategoryCountType;
}

type CategoryCountType = Category & { _count: { post: number } };

interface WriteResponse {
  ok: boolean;
  error: string;
}

const Write: NextPage = () => {
  const categoryData = getCategoryData();
  const [selectCategory, setSelectCategory] = useState<CategoryCountType>(null);
  const { data: sessionData } = useSession();
  const [enablePopup, setEnablePopup] = useState<boolean>(false);
  const router = useRouter();
  const [doc, setDoc] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [imagesId, setImagesId] = useState<string[]>([]); //취소했을시 지울 요청할 이미지id 배열
  const [writeMutation, { loading: mutateLoading, data: resData }] =
    useMutation<WriteResponse>("/api/write");

  useEffect(() => {
    if (!resData) return;
    if (resData.ok) {
      createErrorMsg("포스트 작성을 완료하였습니다.", false);
      let newData = categoryData.map((category) => {
        if (category.id == selectCategory.id) {
          category = {
            ...selectCategory,
            _count: { post: selectCategory._count.post + 1 },
          };
        }
        return category;
      });
      updateUserData(newData);
    } else {
      console.log(resData.error);
      createErrorMsg(resData.error, true);
    }
  }, [resData]);

  const handleDocChange = useCallback((newDoc: string) => {
    setDoc(newDoc);
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setTitle(title);
  }, []);

  const addNewImageId = useCallback(
    (newId: string) => {
      setImagesId((prev) => [...prev, newId]);
    },
    [imagesId]
  );

  const onCancelEvt = () => {
    setLoading(true);
    let removeFunc = async (id) => {
      try {
        await (
          await fetch(`/api/files`, {
            method: "DELETE",
            body: JSON.stringify({ imageId: id }),
          })
        ).json();
      } catch {
        console.error("삭제중 오류발생");
      }
    };

    for (let id of imagesId) {
      removeFunc(id);
    }
    setLoading(false);
    router.replace("/");
  };

  const doWrite = ({ allow, category, isPrivate, thumnail }: PopupData) => {
    setSelectCategory(category);
    let data = {
      title,
      content: doc,
      categoryId: category.id,
      allow,
      isPrivate,
      accountId: sessionData?.accessToken?.id,
      thumnail: thumnail,
      imagesId,
    };
    setLoading(true);
    writeMutation(data);
  };

  const onWriteValid = () => {
    if (title.length <= 0) {
      createErrorMsg("제목을 입력해주세요.", true);
    } else if (doc.length <= 0) {
      createErrorMsg("내용을 입력해주세요.", true);
    } else {
      setEnablePopup(true);
    }
  };

  let [refContainer, editorView] = useCodeMirror<HTMLDivElement>({
    initialDoc: doc,
    onChange: handleDocChange,
  });

  useEffect(() => {}, [editorView]);

  return (
    <div className="h-full  w-full  flex flex-col">
      <div className="flex flex-col h-full ">
        <ToolBar
          editorView={editorView!}
          theme={useTheme().theme}
          imagesIdCallback={addNewImageId}
        />
        <div className="flex flex-row w-full h-[calc(100%-50px)] gap-2">
          <div className="flex w-full flex-col">
            <Editor
              editorView={editorView!}
              refContainer={refContainer}
              handleTitleChange={handleTitleChange}
            />
            <div
              id="editor_footer"
              className="h-[60px] relative flex items-center justify-center 
              w-full shadow-md dark:bg-zinc-800 dark:shadow-[0_0px_6px_-1px_rgba(0,0,0)]"
            >
              <button
                onClick={onWriteValid}
                className="text-white w-24 select-none absolute items-center inline-block p-2 
                text-lg font-semibold rounded-md right-2 bg-emerald-500 hover:bg-emerald-700"
              >
                작성하기
              </button>
              <button
                onClick={onCancelEvt}
                className="text-white w-24 select-none absolute items-center inline-block p-2 text-lg 
                font-semibold rounded-md left-2 bg-slate-600 hover:bg-slate-700"
              >
                취소
              </button>
            </div>
          </div>

          <Preview doc={doc} title={title} />
        </div>
      </div>
      <WritePopup
        enable={enablePopup}
        setPopupState={setEnablePopup}
        doWriteCallback={doWrite}
      />
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {},
  };
}

interface CategoryListProps {
  selectCallback: (category: Category) => void;
}
export const CategoryList = ({ selectCallback }: CategoryListProps) => {
  let categoryList: Category[] = getCategoryData();
  let [selectName, setSelectName] = useState<string>("");
  let [selectCategory, setSelectCategory] = useState<Category>(null);
  let btnRef = useRef<any>({});

  const onCategoryClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    category: Category
  ) => {
    if (selectCategory) {
      btnRef.current[selectCategory.id].disabled = false;
    }
    btnRef.current[category.id].disabled = true;

    setSelectCategory(category);
    setSelectName(category.name);
    selectCallback(category);
  };

  return (
    <div className="w-full h-72 flex flex-col">
      <div className="flex-none text-xl font-semibold mb-4">카테고리</div>
      <input
        readOnly={true}
        defaultValue={selectName}
        className="flex-none overflow-hidden break-all text-ellipsis h-10 mb-2
          border-2 bg-transparent pl-2 text-lg outline-none pointer-events-none
          rounded-sm dark:border-zinc-700 w-full mr-2 relative"
      />
      <div className="relative w-full grow px-2 dark:bg-zinc-700 overflow-auto">
        {categoryList?.map((category, idx) => (
          <button
            onClick={(e) => onCategoryClick(e, category)}
            ref={(element) => {
              btnRef.current[category.id] = element;
            }}
            disabled={false}
            key={category.id}
            className="relative w-full flex items-center disabled:bg-emerald-500
            enabled:hover:dark:bg-zinc-600 enabled:hover:bg-gray-100
            enabled:hover:dark:text-zinc-400 enabled:hover:text-gray-300
              justify-center font-sans text-lg border-b-[1px]
              overflow-hidden break-all text-ellipsis h-12
              "
          >
            <span className="pointer-events-none relative w-full h-6">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface WritePopupProps {
  enable: boolean;
  setPopupState: React.Dispatch<React.SetStateAction<boolean>>;
  doWriteCallback: (popupData: PopupData) => void;
}

export const WritePopup = ({
  enable,
  setPopupState,
  doWriteCallback,
}: WritePopupProps) => {
  const btnRef = useRef<any>({});
  const [selectCategory, setSelectCategory] = useState<CategoryCountType>();
  const [disableBtn, setDisableBtn] = useState<boolean>(true);
  const [thumbnailPreView, setThumbnailPreview] = useState<string>("");
  const [hoverThumnail, setHoverThumnail] = useState<boolean>(false);
  useEffect(() => {
    btnRef.current["publicBtn"].disabled = true;
    btnRef.current["allowBtn"].disabled = true;
  });
  const onClickComment = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    let btnId = (e.target as HTMLElement).id;
    let enableId = btnId == "allowBtn" ? "disAllowBtn" : "allowBtn";
    btnRef.current[btnId].disabled = true;
    btnRef.current[enableId].disabled = false;
  };
  const onClickPublicPrivate = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    let btnId = (e.target as HTMLElement).id;
    let enableId = btnId == "publicBtn" ? "privateBtn" : "publicBtn";
    btnRef.current[btnId].disabled = true;
    btnRef.current[enableId].disabled = false;
  };

  const onCategorySelect = useCallback((category: CategoryCountType) => {
    setDisableBtn(false);
    setSelectCategory(category);
  }, []);
  return (
    <div
      className={`${enable ? "block" : "hidden"} w-full h-full absolute 
      bg-[rgba(0,0,0,0.5)] z-[99]
      top-0 left-0 flex items-center justify-center`}
    >
      <div
        className="p-6 w-[480px] h-[600px] relative bg-white dark:bg-zinc-800  shadow-md z-50  
      border-gray-300 rounded-xl  dark:shadow-black"
      >
        <div className="text-xl font-semibold mb-4">공개여부</div>
        <div className="flex flex-row w-full justify-between mb-4">
          <button
            id="publicBtn"
            ref={(element) => {
              btnRef.current["publicBtn"] = element;
            }}
            onClick={onClickPublicPrivate}
            disabled={false}
            className={`flex justify-center items-center w-52 h-10 rounded-sm
            border-gray-100 border-2 dark:border-none
            disabled:text-emerald-500 disabled:ring-1 ring-emerald-500 shadow-sm
            bg-white enabled:hover:text-zinc-300
            dark:bg-zinc-700 dark:enabled:hover:text-zinc-500  text-zinc-400`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mr-2 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            공개
          </button>
          <button
            id="privateBtn"
            ref={(element) => {
              btnRef.current["privateBtn"] = element;
            }}
            onClick={onClickPublicPrivate}
            disabled={false}
            className={`flex justify-center items-center  w-52 h-10 rounded-sm
            border-gray-100 border-2 dark:border-none
            disabled:text-emerald-500 disabled:ring-1 ring-emerald-500 shadow-sm
            bg-white enabled:hover:text-zinc-300
            dark:bg-zinc-700 dark:enabled:hover:text-zinc-500  text-zinc-400`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mr-2 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
            비공개
          </button>
        </div>
        <div className="text-xl font-semibold mb-4">댓글여부</div>
        <div className="flex flex-row w-full justify-between mb-4">
          <button
            id="allowBtn"
            ref={(element) => {
              btnRef.current["allowBtn"] = element;
            }}
            onClick={onClickComment}
            disabled={false}
            className={`flex justify-center items-center w-52 h-10 rounded-sm
            border-gray-100 border-2 dark:border-none
            disabled:text-emerald-500 disabled:ring-1 ring-emerald-500 shadow-sm
            bg-white enabled:hover:text-zinc-300
            dark:bg-zinc-700 dark:enabled:hover:text-zinc-500  text-zinc-400`}
          >
            댓글 허용
          </button>
          <button
            id="disAllowBtn"
            ref={(element) => {
              btnRef.current["disAllowBtn"] = element;
            }}
            onClick={onClickComment}
            disabled={false}
            className={`flex justify-center items-center w-52 h-10 rounded-sm
            border-gray-100 border-2 dark:border-none
            disabled:text-emerald-500 disabled:ring-1 ring-emerald-500 shadow-sm
            bg-white enabled:hover:text-zinc-300
            dark:bg-zinc-700 dark:enabled:hover:text-zinc-500  text-zinc-400`}
          >
            댓글 비허용
          </button>
        </div>
        <div className="grid grid-cols-2 mb-4 w-full h-72 gap-4">
          <div className="w-full h-full flex flex-col ">
            <div className="text-xl font-semibold mb-4">썸네일</div>
            <label
              onChange={(e: any) => {
                const file: any = e.target.files[0];
                setThumbnailPreview(URL.createObjectURL(file));
                URL.revokeObjectURL(file);
              }}
              htmlFor="picture"
              className={`w-full h-full border-dashed border-4  
            round-sm dark:bg-zinc-700 flex 
            bg-zinc-100 hover:text-zinc-300
        dark:hover:text-zinc-500  text-zinc-400 cursor-pointer
        ${thumbnailPreView.length <= 0 ? "block" : "hidden"}`}
            >
              <input
                id="picture"
                type="file"
                className="hidden"
                accept="image/*"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-full h-full`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </label>
            {thumbnailPreView.length > 0 && (
              <div
                onPointerEnter={(e) => {
                  setHoverThumnail(true);
                }}
                onPointerLeave={() => {
                  setHoverThumnail(false);
                }}
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
                <Image
                  src={thumbnailPreView.length > 0 ? thumbnailPreView : ""}
                  alt="thumbnail"
                  fill={true}
                  className={`w-full h-full  transition-colors ${
                    thumbnailPreView.length <= 0 ? "hidden" : "block"
                  }`}
                />
                <div
                  className={`absolute bg-[rgba(0,0,0,0.5)] w-full h-full
              ${hoverThumnail ? "block" : "hidden"}`}
                />
                <button
                  onClick={() => {
                    setThumbnailPreview("");
                  }}
                  className="absolute w-full h-full flex justify-center items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-16 h-16 text-white ${
                      hoverThumnail ? "block" : "hidden"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <CategoryList selectCallback={onCategorySelect} />
        </div>

        <div className="w-full flex flex-row h-10 justify-between">
          <button
            onClick={() => {
              setPopupState(false);
            }}
            className="text-white select-none relative items-center 
            inline-block text-lg font-semibold rounded-md w-52 h-10
            bg-slate-600 hover:bg-slate-700"
          >
            취소
          </button>
          <button
            disabled={disableBtn}
            onClick={() => {
              doWriteCallback({
                isPrivate: btnRef.current["publicBtn"].disabled ? false : true,
                allow: btnRef.current["allowBtn"].disabled ? true : false,
                category: selectCategory,
              });
              setPopupState(false);
            }}
            className="text-white select-none relative items-center 
            disabled:bg-emerald-900 disabled:text-gray-400
            w-52 h-10  text-lg font-semibold rounded-md 
            bg-emerald-500 hover:bg-emerald-700"
          >
            작성하기
          </button>
        </div>
      </div>
    </div>
  );
};
export default Write;
