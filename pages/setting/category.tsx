import CategoryItem from "@/components/categoryItem";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { getToken } from "next-auth/jwt";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Category } from "@prisma/client";
import useSWR, { SWRConfig } from "swr";
import useMutation from "@/lib/server/useMutation";
import { useSession } from "next-auth/react";
import prisma from "@/lib/server/client";
import { updateUserData, createErrorMsg, setLoading } from "@/hooks/useGlobal";

let prevTarget: HTMLElement = null;
let removeIdList: number[] = [];

interface CategoryProps {
  originCategory: (Category & { _count: { post: number } })[];
}
interface CategoryResponse {
  ok: boolean;
  updateData?: Category[];
  error: string;
}
const MyCategory: NextPage = () => {
  const {
    data: { originCategory },
    mutate: categoryUpdate,
  } = useSWR<CategoryProps>("/api/category");
  const [categoryMutation, { loading: mutateLoading, data: resData }] =
    useMutation<CategoryResponse>("/api/category");
  const [saveState, setSaveState] = useState<boolean>(true);
  const [categoryData, setCategoryData] = useState<Category[]>();
  const categoryRef = useRef<any>([]);
  const categoryPageRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();

  useEffect(() => {
    setCategoryData(JSON.parse(JSON.stringify(originCategory)));
  }, []);

  useEffect(() => {
    if (!resData) return;
    setLoading(false);
    if (resData.ok) {
      setSaveState(false);
      createErrorMsg("변경사항을 저장하였습니다.", false);
      updateUserData(resData.updateData);
    } else {
      createErrorMsg(resData.error, true);
    }
  }, [resData]);

  useEffect(() => {
    if (originCategory.length != categoryData?.length) {
      setSaveState(true);
    } else {
      let originOrders = originCategory.map((item) => item.order);
      let changeOrders = categoryData.map((item) => item.order);
      let originNames = originCategory.map((item) => item.name);
      let changeNames = categoryData.map((item) => item.name);
      if (
        JSON.stringify(originOrders) != JSON.stringify(changeOrders) ||
        JSON.stringify(originNames) != JSON.stringify(changeNames)
      ) {
        setSaveState(true);
      } else setSaveState(false);
    }
  }, [categoryData]);

  const categoryMutate = () => {
    if (!categoryValid()) {
      createErrorMsg("변경사항을 저장할수 없습니다.", true);
    } else {
      setLoading(true);
      const data = { mutate: categoryData, remove: removeIdList };
      categoryMutation(data);
    }
  };

  const categoryValid = (): boolean => {
    let isOk = true;
    for (let i = 0; i < categoryData.length; i++) {
      let name = categoryData[i].name;

      if (name.length <= 0) {
        isOk = false;
        break;
      }
    }
    return isOk;
  };

  const changeCategoryState = useCallback(
    (index, value) => {
      categoryData[index].name = value;
      setCategoryData([...categoryData]);
    },
    [categoryData]
  );

  const changeCategoryOrder = useCallback(
    (changeIndex, originIndex) => {
      if (changeIndex < 0) changeIndex = 0;

      let removeData = categoryData.splice(originIndex, 1);
      categoryData.splice(changeIndex, 0, removeData[0]);

      const newCategoryData = categoryData.map((v, i) => {
        v.order = i;
        return v;
      });

      setCategoryData(JSON.parse(JSON.stringify(newCategoryData)));
    },
    [categoryData]
  );

  const overCategory = useCallback((overIndex, posIndex) => {
    let targetElement = categoryRef.current[overIndex] as HTMLElement;
    if (prevTarget && prevTarget != targetElement) {
      prevTarget.classList.remove("border-b-2", "border-t-2", "border-red-500");
    }

    prevTarget = targetElement;

    prevTarget.classList.remove(
      overIndex == posIndex ? "border-t-2" : "border-b-2"
    );
    prevTarget.classList.add(
      overIndex == posIndex ? "border-b-2" : "border-t-2",
      "border-red-500"
    );
  }, []);

  const endCategory = useCallback(() => {
    if (prevTarget) {
      prevTarget.classList.remove("border-b-2", "border-t-2", "border-red-500");
      prevTarget = null;
    }
  }, []);

  const removeCategory = useCallback(
    (index) => {
      removeIdList.push(categoryData[index].id);
      let newData = categoryData.filter((v, i) => {
        if (i != index) {
          return true;
        }
      });
      newData.forEach((v, i) => {
        if (i >= index) v.order--;
      });

      setCategoryData([...newData]);
    },
    [categoryData]
  );

  const onAddCategory = () => {
    setCategoryData([
      ...categoryData,
      {
        id: originCategory.length - (categoryData.length + 1),
        name: "",
        accountId: data.accessToken.id,
        order: categoryData.length,
        createdAt: null,
        updatedAt: null,
      },
    ]);
  };

  return (
    <div ref={categoryPageRef} className="h-full  w-full  flex flex-col">
      <div className="w-full h-full">
        <div className="relative text-xl mb-5 font-bold">
          카테고리 순서를 변경하고 주제 연결을 설정할 수 있습니다.
        </div>
        <div className="relative flex-col flex font-semibold text-lg">
          {categoryData?.map((category, i) => {
            return (
              <div
                ref={(element) => {
                  categoryRef.current[i] = element;
                }}
                key={category.id}
              >
                <CategoryItem
                  data={category}
                  index={i}
                  changeOrderCallback={changeCategoryOrder}
                  overCallback={overCategory}
                  endCallback={endCategory}
                  removeCallback={removeCategory}
                  changeStateCallback={changeCategoryState}
                />
              </div>
            );
          })}
        </div>
        <button
          onClick={onAddCategory}
          className="border-2 mb-1 select-none w-full flex items-center h-16 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 mx-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="font-semibold text-lg">카테고리 추가</span>
        </button>
        <div className="relative flex-row justify-center flex items-center mt-4">
          <button
            onClick={categoryMutate}
            disabled={saveState ? false : true}
            className="text-gray-200 first-line:relative select-none w-36 h-14 inline-block p-2 text-lg font-semibold rounded-lg disabled:bg-emerald-900 bg-emerald-500 enabled:hover:bg-emerald-700"
          >
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  );
};

const CategorySWR: NextPage<CategoryProps> = ({ originCategory }) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          "/api/category": {
            ok: true,
            originCategory,
          },
        },
      }}
    >
      <MyCategory />
    </SWRConfig>
  );
};
export const getServerSideProps: GetServerSideProps<CategoryProps> = async (
  context: GetServerSidePropsContext
) => {
  let token = await getToken({
    req: context.req,
    cookieName: process.env.NEXTAUTH_TOKENNAME,
    secret: process.env.NEXTAUTH_SECRET,
  });
  let categoryList = await prisma.category.findMany({
    where: {
      account: {
        id: parseInt(token?.id.toString()),
      },
    },
    orderBy: { order: "asc" },
    select: {
      order: true,
      name: true,
      id: true,
      _count: {
        select: {
          post: true,
        },
      },
    },
  });

  return {
    props: {
      originCategory: JSON.parse(JSON.stringify(categoryList)),
    },
  };
};

export default CategorySWR;
