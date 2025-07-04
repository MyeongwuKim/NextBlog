import { GetServerSidePropsContext, NextPage } from "next";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import Editor from "@/components/write/editor";
import { useTheme } from "next-themes";
import useCodeMirror from "@/lib/front/use-codemirror";
import ToolBar from "@/components/write/toolbar";
import { getGlobalSWR } from "@/hooks/useData";
import { createToast, setHeadTitle, setLoading } from "@/hooks/useEvent";
import NextImage from "next/image";
import { Category, Post, Image } from "@prisma/client";
import useMutation from "@/lib/server/useMutation";
import { useSession } from "next-auth/react";
import {
  getDeliveryDomain,
  getFormatImagesId,
  getTimeStamp,
} from "@/hooks/useUtils";
import prisma from "@/lib/server/client";
import OkBtn from "@/components/okBtn";
import CancelBtn from "@/components/cancelBtn";
import InputField from "@/components/inputField";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { KeyedMutator, useSWRConfig } from "swr";
import dynamic from "next/dynamic";
import post from "@/pages/api/post";
import LabelBtn from "@/components/labelBtn";

interface PopupData {
  thumbnail?: string;
  isPrivate: boolean;
  allow: boolean;
  category: CategoryCountType;
}

type CategoryCountType = Category & { _count: { post: number } };

interface WriteResponse {
  ok: boolean;
  id: number;
  error: string;
}

interface WriteProps {
  postData?: Post & { images: { imageId: number }[] };
}

const DynamicComponent = dynamic(
  () =>
    import("@/components/write/preview").then((mode) => {
      return mode;
    }),
  {
    ssr: false,
    loading: () => {
      return <PreLoadView />;
    },
  }
);

const Write: NextPage<WriteProps> = ({ postData }) => {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { swrCategoryResponse, categoryMutate } = getGlobalSWR(
    router?.query?.userId as string
  );
  const { data: sessionData } = useSession();
  const [enablePopup, setEnablePopup] = useState<boolean>(false);

  const [previewShow, setPreviewShow] = useState<boolean>(false);
  const [selectCategory, setSelectCategory] = useState<CategoryCountType>(null);
  const [preview, setPreview] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState<boolean>(true);
  const [doc, setDoc] = useState<string>(postData?.html);
  const [title, setTitle] = useState<string>(postData ? postData.title : "");
  const [imagesId, setImagesId] = useState<string[]>([]); //취소했을시 지울 요청할 이미지id 배열
  const [writeMutation, { loading: mutateLoading, data: resData }] =
    useMutation<WriteResponse>(`/api/write/${postData ? "modify" : "create"}`);

  useEffect(() => {
    setHeadTitle(`|${router.query.userId}| ` + "글 작성");
  }, [router.query]);

  useEffect(() => {
    if (previewLoading) setLoading(true);
    else setLoading(false);
  }, [previewLoading]);

  useEffect(() => {
    if (!postData) return;
    setImagesId(getFormatImagesId(postData.html));
  }, []);

  useEffect(() => {
    if (!resData) return;
    setLoading(false);
    if (resData.ok) {
      router
        .replace(
          postData
            ? `/${router.query.userId}/post?id=${postData?.id}`
            : `/${router.query.userId}/post?id=${resData?.id}`
        )
        .then(() => {
          categoryMutate();
          createToast(
            `포스트 ${postData ? "수정" : "작성"}을 완료하였습니다.`,
            false
          );
        });
    } else {
      createToast(resData.error, true);
    }
  }, [resData]);
  //프리뷰 만들기
  const setCotentPreview = useCallback((element) => {
    let previewContent = "";
    if (element?.children) {
      for (let i = 0; i < element.children.length; i++) {
        let child = element.children[i];
        if (child.tagName == "P" || child.tagName == "BLOCKQUOTE") {
          previewContent += child.outerText.split("\n").join(" ");
        }
      }
    }
    setPreview(previewContent.substring(0, 50));
  }, []);

  const handleDocChange = useCallback((newDoc: string) => {
    setDoc(newDoc);
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setTitle(title);
  }, []);

  // const addNewImageId = useCallback(
  //   (newId: string) => {
  //     setImagesId((prev) => [...prev, newId]);
  //   },
  //   [imagesId]
  // );

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
    let backUrl = postData
      ? `/${router.query.userId}/post?id=${postData.id}`
      : `/${router.query.userId}`;
    router.replace(backUrl);
  };

  const doWrite = async ({
    allow,
    category,
    isPrivate,
    thumbnail,
  }: PopupData) => {
    setSelectCategory(category);

    let data = {
      title,
      html: doc,
      content: document
        .getElementById("previewContent")
        .outerText.replace(/\n/g, ""),
      categoryId: category.id,
      allow,
      isPrivate,
      accountId: sessionData?.accessToken?.id,
      thumbnail,
      preview,
    };

    if (postData) {
      data["prevThumnail"] = postData?.thumbnail;
      data["postId"] = postData?.id;
      data["imagesId"] = postData?.images;
      //기존 섬네일 삭제
      if (thumbnail) {
        await fetch(`/api/files`, {
          method: "DELETE",
          body: JSON.stringify({ imageId: postData?.thumbnail }),
        });
      }
    }
    if (postData) {
      delete postData.images;
      mutate(`/api/post/${router.query.id}`, { ...postData, ...data });
    }
    setLoading(true);
    writeMutation(data);
  };

  const onWriteValid = () => {
    if (title.length <= 0) {
      createToast("제목을 입력해주세요.", true);
    } else if (doc.length <= 0) {
      createToast("내용을 입력해주세요.", true);
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
    <div id="write" className="m-auto h-full flex flex-col">
      <div className="flex flex-col h-full ">
        <ToolBar editorView={editorView!} theme={useTheme().theme} />
        <div className="flex w-full h-[calc(100%-50px)] gap-2">
          <div id="editorContainer" className="flex w-full flex-col h-full">
            <Editor
              defaultTitleValue={postData?.title}
              editorView={editorView!}
              refContainer={refContainer}
              handleTitleChange={handleTitleChange}
            />
            <div
              id="editor_footer"
              className="h-[60px] relative flex items-center justify-between
              px-4 
              w-full shadow-md dark:bg-zinc-800 dark:shadow-[0_0px_6px_-1px_rgba(0,0,0)]"
            >
              <CancelBtn
                content="취소"
                height={45}
                width={96}
                onClickEvt={onCancelEvt}
              />
              <OkBtn
                content={postData ? "수정하기" : "작성하기"}
                height={45}
                width={96}
                onClickEvt={onWriteValid}
              />
              <div className="absolute bottom-20 right-6 hidden sm:block">
                <LabelBtn
                  contents={"미리보기"}
                  onClick={() => {
                    setPreviewShow(true);
                  }}
                />
              </div>
            </div>
          </div>
          <div
            id="previewWrapper"
            className={`sm:z-[99] sm:top-0 sm:left-0 w-full h-full sm:fixed sm:bg-[rgba(0,0,0,0.5)] 
            sm:flex justify-center items-center ${
              previewShow ? "sm:visible" : "sm:hidden"
            } `}
          >
            <div
              id="previewContainer"
              className={`web:w-full web:h-full md:w-full md:h-full sm:!h-[83%] sm:px-[30px]`}
            >
              <button
                className="hidden sm:block z-[1] absolute top-[80px] right-[33px] "
                id="backBtn"
                onClick={() => {
                  setPreviewShow(false);
                }}
              >
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
              <DynamicComponent
                setCotentPreview={setCotentPreview}
                doc={doc}
                previewLoadingState={setPreviewLoading}
                title={title}
              />
            </div>
          </div>
        </div>
      </div>
      <WritePopup
        postData={postData}
        enable={enablePopup}
        categoryData={swrCategoryResponse?.originCategory}
        categoryMutate={categoryMutate}
        setPopupState={setEnablePopup}
        doWriteCallback={doWrite}
      />
    </div>
  );
};
interface CategoryListProps {
  selectCallback: (category: Category) => void;
  categoryId: number;
  categoryData;
  setCategoryPopup: Dispatch<SetStateAction<boolean>>;
}
export const CategoryList = ({
  selectCallback,
  categoryId,
  categoryData,
  setCategoryPopup,
}: CategoryListProps) => {
  let categoryList: Category[] = categoryData;
  let [selectName, setSelectName] = useState<string>("");
  let [selectCategory, setSelectCategory] = useState<Category>(null);
  let btnRef = useRef<any>({});

  useEffect(() => {
    if (!categoryList) return;
    if (categoryId) {
      for (let idx in categoryList) {
        if (categoryList[idx].id == categoryId) {
          onCategoryClick(null, categoryList[idx]);
          break;
        }
      }
    }
  }, [categoryList]);
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
    <div id="categoryListView" className="w-full  flex flex-col">
      <div className="flex-none text-xl sm:text-lg font-semibold mb-2">
        카테고리
      </div>
      <div>
        <div className="mt-3 w-full flex items-center justify-center">
          <div className="w-full h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 absolute right-8 translate-y-1/3 cursor-pointer"
              onClick={() => {
                setCategoryPopup(true);
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <input
              readOnly={true}
              defaultValue={selectName}
              className="flex-none overflow-hidden break-all text-ellipsis h-10 mb-2
          border-2 bg-transparent pl-2 text-lg outline-none pointer-events-none
          rounded-sm dark:border-zinc-700 w-full mr-2 relative"
            />
          </div>
        </div>
      </div>
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
              justify-center font-sans text-lg sm:text-base border-b-[1px]
              overflow-hidden break-all text-ellipsis h-[46px]
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
  postData: Post;
  enable: boolean;
  categoryData: Category[];
  categoryMutate: KeyedMutator<any>;
  setPopupState: React.Dispatch<React.SetStateAction<boolean>>;
  doWriteCallback: (popupData: PopupData) => void;
}

export const PreLoadView = () => {
  return (
    <div className="w-full overflow-auto bg-white dark:bg-zinc-800 dark:shadow-black flex flex-col shadow-md  h-[calc(100%-0px)]">
      <div className="font-bold text-2xl p-4 select-none relative h-auto break-words whitespace-pre-line" />
      <div className="bg-white dark:text-white p-4 dark:bg-zinc-800  preview markdown-body relative h-auto w-full  break-words"></div>
    </div>
  );
};

export const WritePopup = ({
  postData,
  enable,
  categoryData,
  categoryMutate,
  setPopupState,
  doWriteCallback,
}: WritePopupProps) => {
  const [addCategoryMutate, { data: categoryResponse, loading }] = useMutation(
    "/api/category/mutate"
  );
  const { data } = useSession();
  const timeStamp = getTimeStamp();
  const btnRef = useRef<any>({});
  const inputRef = useRef<any>();
  const [selectCategory, setSelectCategory] = useState<CategoryCountType>();
  const [disableBtn, setDisableBtn] = useState<boolean>(true);
  const [thumbnailPreView, setThumbnailPreview] = useState<string>("");
  const [hoverThumnail, setHoverThumnail] = useState<boolean>(false);
  const [categoryPopup, setCategoryPopup] = useState<boolean>(false);
  const {
    register,
    handleSubmit: winHanldeSubmit,
    formState: { errors },
    reset,
    getValues,
    setError,
    setFocus,
  } = useForm<{ categoryInput: string }>();

  useEffect(() => {
    if (!categoryResponse) return;
    setLoading(false);
    if (categoryResponse.ok) categoryMutate();
    else createToast(categoryResponse.error, true);
  }, [categoryResponse]);

  const onCategoryValid = ({ categoryInput }) => {
    if (categoryInput.length <= 0) {
      setFocus("categoryInput");
      return setError("categoryInput", { message: "내용을 입력해주세요." });
    }
    setLoading(true);
    setCategoryPopup(false);
    addCategoryMutate({
      mutate: [
        {
          name: categoryInput,
          accountId: data.accessToken.id,
          order: categoryData.length,
        },
      ],
    });
  };

  const onInValid: SubmitErrorHandler<{
    searchInput: string;
  }> = (error) => {
    let { searchInput } = error;
    let message = "";
    if (searchInput) {
      message = searchInput.message;
      createToast(message, true);
    }
  };
  useEffect(() => {
    if (categoryPopup) setFocus("categoryInput");
    reset();
  }, [categoryPopup]);
  useEffect(() => {
    if (postData) {
      if (postData?.thumbnail)
        setThumbnailPreview(
          getDeliveryDomain(postData?.thumbnail, "thumbnail")
        );
      onClickPublicPrivate(
        null,
        postData?.isPrivate
          ? btnRef.current["privateBtn"]
          : btnRef.current["publicBtn"]
      );
      onClickComment(
        null,
        postData?.allow
          ? btnRef.current["allowBtn"]
          : btnRef.current["disAllowBtn"]
      );
    } else {
      btnRef.current["publicBtn"].disabled = true;
      btnRef.current["allowBtn"].disabled = true;
    }
  }, [postData]);
  const onClickComment = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    btn?: HTMLButtonElement
  ) => {
    let btnId = btn ? btn.id : (e.target as HTMLElement).id;
    let enableId = btnId == "allowBtn" ? "disAllowBtn" : "allowBtn";
    btnRef.current[btnId].disabled = true;
    btnRef.current[enableId].disabled = false;
  };
  const onClickPublicPrivate = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    btn?: HTMLButtonElement
  ) => {
    let btnId = btn ? btn.id : (e.target as HTMLElement).id;
    let enableId = btnId == "publicBtn" ? "privateBtn" : "publicBtn";
    btnRef.current[btnId].disabled = true;
    btnRef.current[enableId].disabled = false;
  };
  const onDoWritePost = async () => {
    setLoading(true);
    let callBackData = {
      isPrivate: btnRef.current["publicBtn"].disabled ? false : true,
      allow: btnRef.current["allowBtn"].disabled ? true : false,
      category: selectCategory,
      thumbnail: null,
    };
    try {
      const form = new FormData();
      let userId = data.accessToken.id;
      let file = inputRef.current.files[0];
      if (file) {
        const { uploadURL } = await (
          await fetch(`/api/files`, { method: "POST" })
        ).json();
        form.append(
          "file",
          file as any,
          `${
            process.env.NODE_ENV
          }_${userId.toString()}_postThumbnail_${timeStamp()}`
        );
        const {
          result: { id },
        } = await (
          await fetch(uploadURL, {
            method: "POST",
            body: form,
          })
        ).json();

        callBackData.thumbnail = id;
      }

      setLoading(false);
      doWriteCallback(callBackData);
      setPopupState(false);
    } catch {
      setLoading(false);
      createToast("썸네일 이미지 업로드중 오류가 발생했습니다", true);
    }
  };
  const onCategorySelect = useCallback((category: CategoryCountType) => {
    setDisableBtn(false);
    setSelectCategory(category);
  }, []);

  return (
    <>
      <div
        className={`${
          categoryPopup ? "block" : "hidden"
        } z-[51] fixed flex items-center justify-center
         h-full w-full top-0 left-0`}
      >
        <form
          onSubmit={winHanldeSubmit(onCategoryValid)}
          className=" flex flex-col p-4 shadow-md gap-2 dark:bg-zinc-800 rounded-md h-[155px] w-[350px]"
        >
          <div className="h-[46px] w-full">
            <InputField
              content="카테고리 입력"
              id="categoryInput"
              register={{
                ...register("categoryInput"),
              }}
            />
          </div>
          <div className="text-red-500 text-sm h-[16px]">
            {errors && errors?.categoryInput?.message}
          </div>
          <div className="flex flex-row justify-center gap-4">
            <OkBtn type="submit" width={85} height={45} content="확인" />
            <CancelBtn
              onClickEvt={() => {
                setCategoryPopup(false);
              }}
              width={65}
              height={45}
              content="취소"
            />
          </div>
        </form>
      </div>
      <div
        className={`${enable ? "block" : "hidden"} w-full h-full absolute 
      bg-[rgba(0,0,0,0.5)] z-[50]
      top-0 left-0 flex items-center justify-center`}
      >
        <div
          className="p-6 max-w-[480px] w-[80%] xs:h-[500px] sm:h-[600px] h-[640px] sm:w relative bg-white dark:bg-zinc-800  shadow-md z-50  
      border-gray-300 rounded-xl  dark:sdhaow-black"
        >
          <div className="text-xl sm:text-lg font-semibold mb-4">공개여부</div>
          <div className="flex flex-row w-full justify-between mb-4 sm:text-sm">
            <button
              id="publicBtn"
              ref={(element) => {
                btnRef.current["publicBtn"] = element;
              }}
              onClick={onClickPublicPrivate}
              disabled={false}
              className={`flex justify-center items-center h-10 rounded-sm
            border-gray-100 border-2 dark:border-none
            disabled:text-emerald-500 disabled:ring-1 ring-emerald-500 shadow-sm
            bg-white enabled:hover:text-zinc-300 w-[48%] max-w-[208px]
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
              className={`flex justify-center items-center  h-10 rounded-sm
            border-gray-100 border-2 dark:border-none
            disabled:text-emerald-500 disabled:ring-1 ring-emerald-500 shadow-sm
            bg-white enabled:hover:text-zinc-300 w-[48%] max-w-[208px]
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
          <div className="text-xl sm:text-lg font-semibold mb-4">댓글여부</div>
          <div className="flex flex-row w-full justify-between mb-4 sm:text-sm">
            <button
              id="allowBtn"
              ref={(element) => {
                btnRef.current["allowBtn"] = element;
              }}
              onClick={onClickComment}
              disabled={false}
              className={`flex justify-center items-center h-10 rounded-sm
            border-gray-100 border-2 dark:border-none
            disabled:text-emerald-500 disabled:ring-1 ring-emerald-500 shadow-sm
            bg-white enabled:hover:text-zinc-300 w-[48%] max-w-[208px]
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
              className={`flex justify-center items-center  h-10 rounded-sm
            border-gray-100 border-2 dark:border-none
            disabled:text-emerald-500 disabled:ring-1 ring-emerald-500 shadow-sm
            bg-white enabled:hover:text-zinc-300 w-[48%] max-w-[208px]
            dark:bg-zinc-700 dark:enabled:hover:text-zinc-500  text-zinc-400`}
            >
              댓글 비허용
            </button>
          </div>
          <div className="flex flex-row  mb-2 w-full h-[calc(100%-240px)] gap-4">
            <div className="flex-1 flex flex-col ">
              <div className="text-xl sm:text-lg font-semibold mb-2">
                썸네일
              </div>
              <label
                onChange={(e: any) => {
                  const file: any = e.target.files[0];
                  setThumbnailPreview(URL.createObjectURL(file));
                  URL.revokeObjectURL(file);
                }}
                htmlFor="picture"
                className={`w-full h-auto border-dashed border-4  
            round-sm dark:bg-zinc-700 flex 
            bg-zinc-100 hover:text-zinc-300
        dark:hover:text-zinc-500  text-zinc-400 cursor-pointer
        ${thumbnailPreView.length <= 0 ? "block" : "hidden"}`}
              >
                <input
                  ref={inputRef}
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
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "auto",
                  }}
                >
                  <NextImage
                    src={thumbnailPreView.length > 0 ? thumbnailPreView : ""}
                    alt="thumbnail"
                    fill={true}
                    className={`relative w-full h-auto  transition-colors ${
                      thumbnailPreView.length <= 0 ? "hidden" : "block"
                    }`}
                  />
                  <div
                    className={`absolute bg-[rgba(0,0,0,0.5)] w-full h-full top-0
              ${hoverThumnail ? "block" : "hidden"}`}
                  />
                  <button
                    id="removeThumbnailBtn"
                    onClick={() => {
                      setThumbnailPreview("");
                    }}
                    className="absolute w-full h-full flex justify-center items-center top-0"
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
            <div className="flex-1">
              <CategoryList
                categoryData={categoryData}
                selectCallback={onCategorySelect}
                categoryId={postData?.categoryId}
                setCategoryPopup={setCategoryPopup}
              />
            </div>
          </div>

          <div className="w-full flex flex-row h-10 justify-between">
            <div className="max-w-[208px] w-[48%]">
              <CancelBtn
                onClickEvt={() => {
                  setThumbnailPreview("");
                  setPopupState(false);
                }}
                content="취소"
                height={40}
                width={"100%"}
              />
            </div>
            <div className="max-w-[208px] w-[48%]">
              <OkBtn
                onClickEvt={onDoWritePost}
                isEnable={!disableBtn}
                width={"100%"}
                height={40}
                content={postData ? "수정하기" : "작성하기"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let { id } = ctx.query;
  let postData;

  if (id) {
    postData = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        images: {
          select: {
            imageId: true,
          },
        },
        category: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }
  return {
    props: {
      postData: postData ? JSON.parse(JSON.stringify(postData)) : null,
    },
  };
}

export default Write;
