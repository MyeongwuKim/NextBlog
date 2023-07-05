import CategoryItem from "@/components/categoryItem";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { getToken } from "next-auth/jwt";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as ReactDOMClient from "react-dom/client";
import client from "lib/client";
import { Category } from "@prisma/client";
import { useForm } from "react-hook-form";
import ErrorMsg from "@/components/errorMsg";
import useSWR, { SWRConfig } from "swr";

let prevTarget: HTMLElement = null;
interface CategoryProps {
  categoryList: Category[];
}
let root = null;

const MyCategory: NextPage = () => {
  const {
    data: { categoryList },
  } = useSWR("/api/category");
  const categoryRef = useRef<any>([]);
  const categoryPageRef = useRef<HTMLDivElement>(null);
  const [saveState, setSaveState] = useState<boolean>(true);
  const [categoryData, setCategoryData] = useState<Category[]>();

  useEffect(() => {
    setCategoryData(JSON.parse(JSON.stringify(categoryList)));
  }, [categoryList]);

  useEffect(() => {
    if (categoryList.length != categoryData?.length) {
      setSaveState(true);
    } else {
      let originOrders = categoryList.map((item) => item.order);
      let changeOrders = categoryData.map((item) => item.order);
      let originNames = categoryList.map((item) => item.name);
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
      if (!document.getElementById("cautionWindow")) {
        root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
      } else {
        root.unmount();
        root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
      }
      root.render(<ErrorMsg root={root} msg="변경사항을 저장할수 없습니다." />);
      return;
    } else {
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
      else if (changeIndex != categoryData.length - 1) changeIndex++;

      let removeData = categoryData.splice(originIndex, 1);
      categoryData.splice(changeIndex, 0, removeData[0]);

      const nextCounters = categoryData.map((v, i) => {
        return v;
      });
      setCategoryData([...nextCounters]);
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
      let newData = categoryData.filter((v, i) => {
        if (i != index) return true;
      });
      setCategoryData([...newData]);
    },
    [categoryData]
  );

  const onAddCategory = () => {
    setCategoryData([
      ...categoryData,
      {
        id: -1,
        name: "",
        accountId: null,
        createdAt: null,
        updatedAt: null,
        order: categoryData.length,
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
                key={category.order}
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
      <div id="errorCont"></div>
    </div>
  );
};

const CategorySWR: NextPage<CategoryProps> = ({ categoryList }) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          "/api/category": {
            ok: true,
            categoryList,
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
  let categoryList = await client.category.findMany({
    where: {
      account: {
        id: parseInt(token?.id.toString()),
      },
    },
    orderBy: { order: "asc" },
  });

  return {
    props: { categoryList: JSON.parse(JSON.stringify(categoryList)) },
  };
};

export default CategorySWR;
