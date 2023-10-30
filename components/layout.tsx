import SignIn from "@/components/sign/signIn";
import SignUp from "@/components/sign/signup";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Category } from "@prisma/client";
import DropDownBox from "./dropdownBox";
import { signOut, useSession } from "next-auth/react";
import { registUserDataState, userCheck } from "@/hooks/useData";
import { getDeliveryDomain } from "@/hooks/useUtils";
import LabelBtn from "./labelBtn";
import { setLoading } from "@/hooks/useEvent";

interface LayoutProps {
  children: React.ReactElement;
  profile: ProfileType;
  category: CategoryCountType[];
}
type CategoryCountType = Category & {
  post: { isPrivate: boolean }[];
  _count: { post: number };
};
type ProfileType = {
  avatar?: string;
  email: string;
  github?: string;
  name: string;
  id: number;
  introduce?: string;
};
interface UserData {
  profile?: ProfileType;
  category?: CategoryCountType[];
}

interface TopViewProps {
  openCallback: (mode: "signin" | "signup" | "none") => void;
  profile?: ProfileType;
  pos: number;
}

interface CategoryViewProps {
  hide?: boolean;
  profile?: ProfileType;
  category?: CategoryCountType[];
}
const fullPageList = ["write"];
const categoryHideList = ["post", "manage"];
let lastScroll = 0;

const Layout: NextPage<LayoutProps> = ({ children, category, profile }) => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>();
  const [topViewPos, setTopViewPos] = useState<number>(0);
  registUserDataState(setUserData);
  const [signMode, setSignMode] = useState<"signin" | "signup" | "none">(
    "none"
  );
  const signModeCallback = useCallback((mode: "signin" | "signup" | "none") => {
    document.body.setAttribute("style", "");
    setSignMode(mode);
  }, []);
  useEffect(() => {
    setUserData({ profile, category });
  }, [profile, category]);

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
    <div id="layoutComp" className="w-full h-auto flex flex-col">
      <div
        className={`fixed z-50 w-full h-full top-0 left-0 ${
          signMode == "none" ? "hidden" : "block"
        }`}
      >
        <SignIn
          enable={signMode == "signin" ? true : false}
          openCallback={signModeCallback}
        />
        <SignUp
          enable={signMode == "signup" ? true : false}
          openCallback={signModeCallback}
        />
      </div>
      <div id="topViewContainer" className="h-[60px] relative w-full">
        <TopView
          pos={topViewPos}
          openCallback={setSignMode}
          profile={userData?.profile}
        />
      </div>
      <div
        className={`realtive w-full  pr-[340px] h-full  flex-1 ${
          fullPageList.some((page) => {
            return router.pathname.includes(page);
          })
            ? ""
            : "pl-[340px]"
        }
      `}
      >
        <div
          className={`relative w-full ${
            fullPageList.some((page) => {
              return router.pathname.includes(page);
            })
              ? "hidden"
              : "block"
          }
            `}
        >
          <div
            id="categoryViewContainer"
            className={`fixed left-0 w-[300px] h-full ${
              categoryHideList.some((page) => {
                return router.pathname.includes(page);
              })
                ? "hidden"
                : "block"
            } `}
          >
            <CategoryView
              profile={userData?.profile}
              category={userData?.category}
            />
          </div>
          <div
            id="settingViewContainer"
            className={`fixed left-0 w-[300px] h-full ${
              router.pathname.includes("manage") ? "block" : "hidden"
            }`}
          >
            <div className="f-full">
              <SettingSide />
            </div>
          </div>
        </div>
        <div
          className={`py-8
                 ${
                   fullPageList.some((page) => {
                     return router.pathname.includes(page);
                   })
                     ? "absolute w-full h-[calc(100%-70px)]"
                     : ""
                 }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;

export const TopView: NextPage<TopViewProps> = ({
  pos,
  openCallback,
  profile,
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
      className={`z-[1] px-6 border-b-[2px] border-gray-200 dark:border-zinc-800 w-full bg-white
      dark:bg-zinc-900
     fixed flex  h-[60px] justify-end items-center`}
    >
      <div className="flex flex-col">
        <button
          onClick={() => {
            document.body.setAttribute("style", "overflow:hidden");
            openCallback("signin");
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
          info={{ left: dropBoxInfo?.left, top: dropBoxInfo?.top }}
          items={[
            {
              categoryName: null,
              child: [
                {
                  name: "관리",
                  clickEvt: () => {
                    router.push("/manage/profile");
                  },
                },
                {
                  name: "글쓰기",
                  clickEvt: () => {
                    router.push("/write");
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
      <div className="basis-10 flex items-center">
        <button
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
      <div className="basis-10 flex items-center">
        <button>
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
        </button>
      </div>
      <div className="basis-10 flex items-center">
        <button
          onClick={() => {
            router.push("/");
          }}
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
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const CategoryView: NextPage<CategoryViewProps> = ({
  profile,
  category,
  hide,
}) => {
  const [countAll, setCountAll] = useState<number>(0);
  const router = useRouter();
  const { data } = useSession();
  const isMe = userCheck(data);

  useEffect(() => {
    if (!category) return;
    let totalCount = 0;
    for (let i = 0; i < category.length; i++) {
      let c = category[i];
      let p = c?.post;
      for (let j = 0; j < p?.length; j++) {
        if (!p[j].isPrivate || (p[j].isPrivate && isMe)) totalCount++;
      }
    }
    setCountAll(totalCount);
  }, [category, isMe]);

  return (
    <div className={`${hide ? "hidden" : "block"} h-full`}>
      <div
        className={`overflow-auto w-full px-8 left-0 h-full border-r-[2px] border-gray-200 dark:border-zinc-800 
   
       `}
      >
        <div className="relative w-full flex flex-col mt-5 items-center">
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
            className="mt-4"
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
          <div className="w-full text-center font-semibold my-4 border-b-2 py-4 border-gray-200 dark:border-zinc-800">
            {profile?.introduce}
          </div>
          <div className="relative">
            <LabelBtn
              onClick={() => {
                router.push("/", null);
              }}
              isDisable={Object.keys(router.query).length <= 0 ? true : false}
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
                onClick={() => {
                  // btnRef.current["category" + v.id].disabled = true;
                  router.query.category = v.id.toString();

                  router.push(`/?category=${v.id.toString()}&name=${v.name}`);
                }}
                isDisable={
                  router?.query?.category == v.id.toString() ? true : false
                }
                id={"category" + v.id.toString()}
                key={i}
                contents={`${v.name}(${count})`}
              />
            );
          })}
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
    <div className="pl-10 py-10 h-full w-full">
      <div
        className={`overflow-auto flex flex-col justify-center items-center
         left-0 h-auto w-full border-r-[2px] border-gray-200
        dark:border-zinc-800 
 `}
      >
        {items.map((item, i) => (
          <LabelBtn
            isDisable={
              router.pathname.replace(`/manage/`, "") == item.router
                ? true
                : false
            }
            key={i}
            id={item.router}
            onClick={() => {
              router
                .push(`/manage/${item.router}`, undefined, { shallow: true })
                .then(() => {});
            }}
            contents={item.name}
          />
        ))}
      </div>
    </div>
  );
};
