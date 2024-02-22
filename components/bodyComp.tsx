import { NextPage } from "next";
import { useRouter } from "next/router";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTheme } from "next-themes";
import { Category } from "@prisma/client";
import DropDownBox from "./dropdownBox";
import { signOut, useSession } from "next-auth/react";
import { getGlobalSWR, registUserDataState, userCheck } from "@/hooks/useData";
import { getDeliveryDomain } from "@/hooks/useUtils";
import LabelBtn from "./labelBtn";
import { setLoading } from "@/hooks/useEvent";
import useSWR from "swr";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactElement;
}
interface UserData {
  profile?: ProfileType;
  category?: CategoryCountType[];
}

interface TopViewProps {
  profile?: ProfileType;
  setCategoryEnabled?: Dispatch<SetStateAction<boolean>>;
  pos: number;
}

interface ProfileRespose {
  ok: boolean;
  profileData: ProfileType;
}
type ProfileType = {
  avatar?: string;
  email: string;
  github?: string;
  name: string;
  id: number;
  introduce?: string;
};

interface CategoryResponse {
  ok: boolean;
  categirtData: CategoryCountType;
}
type CategoryCountType = Category & {
  post: { isPrivate: boolean }[];
  _count: { post: number };
};

interface CategoryViewProps {
  profile?: ProfileType;
  category?: CategoryCountType[];
  setCategoryEnabled?: Dispatch<SetStateAction<boolean>>;
  categoryEnabled?: boolean;
}
const fullPageList = ["write", "post"];
const categoryHideList = ["post", "manage"];
let lastScroll = 0;

const BodyComp: NextPage<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { swrProfileResponse, swrCategoryResponse, categoryMutate } =
    getGlobalSWR(router ? (router?.query?.userId as string) : null);
  const { data: sessionData } = useSession();
  const [userData, setUserData] = useState<UserData>();
  const [topViewPos, setTopViewPos] = useState<number>(0);
  const [categoryEnabled, setCategoryEnabled] = useState<boolean>(false);

  registUserDataState(setUserData);

  useEffect(() => {
    if (sessionData === undefined) return;
    categoryMutate();
  }, [sessionData]);
  useEffect(() => {
    setUserData({
      profile: swrProfileResponse?.profile,
      category: swrCategoryResponse?.originCategory,
    });
  }, [swrProfileResponse, swrCategoryResponse]);

  const onScrollEvt = (e: Event) => {
    if (window.scrollY > lastScroll) {
      setTopViewPos(-60);
    } else if (window.scrollY < lastScroll) {
      setTopViewPos(0);
    }
    lastScroll = window.scrollY;
  };
  useEffect(() => {
    window.addEventListener("scroll", onScrollEvt);
    return () => {
      window.removeEventListener("scroll", onScrollEvt);
    };
  }, []);
  return (
    <div id="body" className="w-full h-full">
      <div id="topViewContainer" className="h-[60px] relative w-full">
        <TopView
          pos={topViewPos}
          profile={userData?.profile}
          setCategoryEnabled={setCategoryEnabled}
        />
      </div>
      <div
        id="dd"
        className={`h-[calc(100%-60px)] flex-1 ${
          fullPageList.some((page) => {
            if (router.pathname.includes("manage")) return false;
            return router.pathname.includes(page);
          })
            ? "w-full mx-auto"
            : ""
        }
      `}
      >
        <div
          className={`relative w-full ${
            fullPageList.some((page) => {
              if (router.pathname.includes("manage")) return false;
              return router.pathname.includes(page);
            })
              ? "web:hidden"
              : "web:block"
          }
            `}
        >
          <div
            id="categoryViewContainer"
            className={`fixed left-0 w-[350px] top-[60px] h-full
             md:w-full md:block md:z-[50] md:transition-all
             md:top-[0px]  ${
               categoryEnabled ? `md:left-[0%]` : `md:left-[-100%]`
             }
            ${
              categoryHideList.some((page) => {
                return router.pathname.includes(page);
              })
                ? "hidden"
                : "block"
            }`}
          >
            <div className="w-full h-full sm:grid-cols-1 md:grid md:grid-cols-2 ">
              <div className="w-full h-full overflow-auto md:dark:bg-zinc-900 md:bg-white">
                <CategoryView
                  setCategoryEnabled={setCategoryEnabled}
                  profile={userData?.profile}
                  category={userData?.category}
                />
              </div>
              <div
                className="sm:hidden"
                onClick={() => {
                  setCategoryEnabled(false);
                }}
              />
            </div>
          </div>
          <div
            id="settingViewContainer"
            className={`web:fixed md:absolute web:w-[350px] web:top-[60px] md:w-full ${
              router.pathname.includes("manage") ? "block" : "hidden"
            }`}
          >
            <div className="f-full">
              <SettingSide />
            </div>
          </div>
        </div>
        <div
          id="scrollArea"
          className={`py-8 px-[30px] max-w-[960px] md:w-full
                 ${
                   fullPageList.some((page) => {
                     if (router.pathname.includes("manage")) return false;
                     return router.pathname.includes(page);
                   })
                     ? "h-[calc(100%-30px)] mx-auto"
                     : "ml-[360px] md:ml-0"
                 }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default BodyComp;

export const TopView: NextPage<TopViewProps> = ({
  pos,
  profile,
  setCategoryEnabled,
}) => {
  const { theme, setTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  const { data, update, status } = useSession();

  const [dropBoxInfo, setDropBoxInfo] = useState<{
    left: number;
    top: number;
    enable: boolean;
  }>();

  const ddEnableCallback = useCallback((enable: boolean) => {
    setDropBoxInfo((prev) => {
      return { ...prev, enable };
    });
  }, []);

  useEffect(() => {
    setLoaded(true);
  }, [loaded]);

  return (
    <div
      style={{
        transform: `translateY(${pos}px)`,
        transition: "transform 0.2s linear",
      }}
      className={`z-[1] px-4 border-b-[2px] border-gray-200 
      dark:border-zinc-800 w-full bg-white dark:bg-zinc-900
     fixed flex h-[60px] justify-between items-center`}
    >
      <div className="h-8 flex items-center">
        <button
          className={`hidden left-6 ${
            router.pathname.includes("manage") ? "md:hidden" : "md:block"
          }
        ${router.pathname.includes("write") ? "md:hidden" : "md:block"}
        `}
          id="menuBtn"
          onClick={() => {
            setCategoryEnabled(true);
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
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div
          onClick={() => router.push(`/${router.query.userId}`)}
          className="w-auto cursor-pointer ml-4"
        >
          <span className="font-extrabold text-xl sm:text-base">
            {router.query.userId}
            <span className="text-base sm:text-xs"> Log</span>
          </span>
        </div>
      </div>

      <div className="w-1/3 flex flex-row gap-2 justify-end">
        <div className="flex flex-col">
          <button
            onClick={() => {
              router.push("/signin");
            }}
            className={`inline ${
              status == "unauthenticated" ? "" : "hidden"
            } order-1 mr-2`}
          >
            <div className="relative flex flex-row items-center justify-center w-auto h-auto rounded-2xl bg-slate-500">
              <span className="relative py-2 px-3 text-sm font-semibold text-center text-white">
                로그인
              </span>
            </div>
          </button>
          <button
            id="userProfileBtn"
            onClick={(e) => {
              let btn = document.getElementById("userProfileBtn");
              setDropBoxInfo({
                left: btn.getClientRects()[0].left,
                top: btn.getClientRects()[0].top + 25,
                enable: true,
              });
            }}
            className={`${
              status == "authenticated" ? "span" : "hidden"
            } order-1 mr-2`}
          >
            <div className="flex-row flex items-center">
              <div
                className=" border-2 dark:border-zinc-800
            relative flex flex-row items-center justify-center w-8 h-8 rounded-full bg-slate-500"
              >
                <img
                  src={
                    profile?.avatar
                      ? `${getDeliveryDomain(profile?.avatar, "avatar")}`
                      : ""
                  }
                  className={`${
                    profile?.avatar ? "block" : "hidden"
                  } w-full h-full rounded-full absolute `}
                />
              </div>
              <div
                className={`w-4 h-4 ml-2 ${
                  dropBoxInfo?.enable ? "inline" : "hidden"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className={`w-4 h-4`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
              </div>
              <div
                className={`w-4 h-4 ml-2 ${
                  !dropBoxInfo?.enable ? "inline" : "hidden"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className={`w-4 h-4`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>
          </button>
          <DropDownBox
            info={{ left: dropBoxInfo?.left, top: dropBoxInfo?.top + 15 }}
            items={[
              {
                categoryName: null,
                child: [
                  {
                    name: "관리",
                    clickEvt: () => {
                      router.push(`/${router.query.userId}/manage/profile`);
                    },
                  },
                  {
                    name: "글쓰기",
                    clickEvt: () => {
                      router.push(`/${router.query.userId}/write`);
                    },
                  },
                  {
                    name: "로그아웃",
                    clickEvt: () => {
                      setLoading(true);
                      signOut({ redirect: false }).then((res) => {
                        update();
                        setLoading(false);
                        router.replace("/").then(() => {});
                      });
                    },
                  },
                ],
              },
            ]}
            enable={dropBoxInfo?.enable}
            dropdownCallback={ddEnableCallback}
          />
        </div>
        <div className="flex items-center">
          <button
            id="topview_ThemeBtn"
            onClick={() => {
              if (theme == "dark") setTheme("light");
              else setTheme("dark");
            }}
          >
            {loaded ? (
              theme == "dark" ? (
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
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-[36px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              )
            ) : null}
          </button>
        </div>
        <div className="flex items-center ">
          <Link
            className="text-zinc-600 dark:text-gray-200"
            id="topview_SearchBtn"
            href={`/${router.query.userId}/search`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-[36px]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};
type LatestDataType = {
  postId: number;
  isReply: boolean;
  comment: { content: string; id: number };
  reply: { content: string; id: number };
};

export const CategoryView: NextPage<CategoryViewProps> = ({
  profile,
  category,
  setCategoryEnabled,
}) => {
  const router = useRouter();
  const { data } = useSession();
  const isMe = userCheck(data);
  const [countAll, setCountAll] = useState<number>(0);
  const [latestData, setLatestData] = useState<LatestDataType[]>([]);

  useEffect(() => {
    setCategoryEnabled(false);

    const callMutate = async () => {
      let res = await fetch(`/api/comments/latest`);
      let { historyData } = await res.json();
      setLatestData(historyData);
    };
    if (router.pathname.replace("[userId]", "") == "/") callMutate();
  }, [router]);

  useEffect(() => {
    if (!category) return;
    let totalCount = 0;
    for (let i = 0; i < category.length; i++) {
      let c = category[i];
      totalCount += c.post.length;
    }
    setCountAll(totalCount);
  }, [category, isMe]);

  return (
    <div
      id="categoryView"
      className={`relative h-full w-full border-gray-200 block dark:border-zinc-800 border-r-[2px]
      `}
    >
      <button
        onClick={() => setCategoryEnabled(false)}
        className={`z-[1] hidden md:block absolute right-4 top-4 `}
      >
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div
        className={`pb-[80px] w-full px-8 left-0 h-full overflow-auto 
   
       `}
      >
        <div className="relative h-auto w-full flex flex-col mt-4 items-center">
          <div className="relative flex flex-row items-center justify-center rounded-full w-36 h-36 bg-slate-500">
            <div
              className="border-2 dark:border-zinc-800 relative flex 
              flex-row items-center justify-center w-36 h-36 rounded-full bg-slate-500"
            >
              <img
                src={
                  profile?.avatar
                    ? `${getDeliveryDomain(profile?.avatar, "avatar")}`
                    : ""
                }
                className={`${
                  profile?.avatar ? "block" : "hidden"
                } w-full h-full rounded-full `}
              />
              <span className="text-3xl font-semibold text-center text-white ">
                {!profile?.avatar ? profile?.name : ""}
              </span>
            </div>
          </div>
          <button
            className="relative h-auto mt-4"
            onClick={() => {
              if (profile.github) window.open(profile.github);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="dark:fill-white w-10 h-10 rounded-3xl"
            >
              <path
                d="M 12 2.2467 A 
            10.0004 10.0004 0 0 0 8.83752 21.7342 c 0.5 0.08752 0.6875 -0.21247 0.6875 -0.475 c 0 -0.23749 -0.01251 -1.025 -0.01251 -1.86249 C 7 19.8592 6.35 18.7842 6.15 18.2217 A 3.636 3.636 0 0 0 5.125 16.8092 c -0.35 -0.1875 -0.85 -0.65 -0.01251 -0.66248 A 2.00117 2.00117 0 0 1 6.65 17.1717 a 2.13742 2.13742 0 0 0 2.91248 0.825 A 2.10376 2.10376 0 0 1 10.2 16.6592 c -2.225 -0.25 -4.55 -1.11254 -4.55 -4.9375 a 3.89187 3.89187 0 0 1 1.025 -2.6875 a 3.59373 3.59373 0 0 1 0.1 -2.65 s 0.83747 -0.26251 2.75 1.025 a 9.42747 9.42747 0 0 1 5 0 c 1.91248 -1.3 2.75 -1.025 2.75 -1.025 a 3.59323 3.59323 0 0 1 0.1 2.65 a 3.869 3.869 0 0 1 1.025 2.6875 c 0 3.83747 -2.33752 4.6875 -4.5625 4.9375 a 2.36814 2.36814 0 0 1 0.675 1.85 c 0 1.33752 -0.01251 2.41248 -0.01251 2.75 c 0 0.26251 0.1875 0.575 0.6875 0.475 A 10.0053 10.0053 0 0 0 12 2.2467 Z"
              />
            </svg>
          </button>
          <div className="w-full h-auto relative text-center py-4 my-4 border-b-2 border-gray-200 dark:border-zinc-800">
            {profile?.introduce}
          </div>
          <div className={`relative ${category ? "block" : "hidden"}`}>
            <LabelBtn
              url={`/${router.query.userId}`}
              isDisable={Object.keys(router.query).length == 1 ? true : false}
              id={"total"}
              contents={`전체(${countAll})`}
            />
          </div>
          {category?.map((v, i) => {
            let count = 0;
            for (let i = 0; i < v.post?.length; i++) {
              let p = v.post[i];
              if (!p.isPrivate || (p.isPrivate && isMe)) {
                count++;
              }
            }

            return (
              <LabelBtn
                url={`/${
                  router.query.userId
                }/?category=${v.id.toString()}&name=${v.name}`}
                isDisable={
                  router?.query?.category == v.id.toString() ? true : false
                }
                id={"category" + v.id.toString()}
                key={i}
                contents={`${v.name}(${count})`}
                addStyle="mt-2 relative"
              />
            );
          })}
          <div id="latestView" className="my-2 mt-4 flex flex-col items-center">
            <div className="text-lg">최근 댓글</div>
            {latestData?.map((data, i) => {
              let type = data.isReply ? data.reply : data.comment;
              return (
                <LabelBtn
                  key={i}
                  url={`/${router.query.userId}/post?id=${data.postId}&${
                    data.isReply ? `reply=${type.id}` : `comment=${type.id}`
                  }`}
                  contents={type.content}
                  addStyle="mt-2 relative w-full"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const items: ItemProps[] = [
  { name: "프로필 관리", router: "profile" },
  { name: "글 관리", router: "post" },
  { name: "댓글 관리", router: "comment" },
  { name: "카테고리 관리", router: "category" },
];

interface ItemProps {
  name: string;
  router: string;
}

export const SettingSide = () => {
  const router = useRouter();

  return (
    <div className="web:py-10 md:py-4 md:px-[30px] h-full w-full">
      <div
        className={`overflow-auto flex web:flex-col md:flex-row md:gap-2
        web:justify-center
         left-0 h-auto w-full border-r-[2px] border-gray-200
        dark:border-zinc-800 
 `}
      >
        {items.map((item, i) => (
          <LabelBtn
            isDisable={
              router.pathname.replace(`/[userId]/manage/`, "") == item.router
                ? true
                : false
            }
            key={i}
            id={item.router}
            url={`/${router.query.userId}/manage/${item.router}`}
            contents={item.name}
            isShallow={true}
          />
        ))}
      </div>
    </div>
  );
};
