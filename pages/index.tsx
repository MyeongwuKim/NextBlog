import CancelBtn from "@/components/cancelBtn";
import LabelBtn from "@/components/labelBtn";
import OkBtn from "@/components/okBtn";
import { createModal, createToast, setHeadTitle } from "@/hooks/useEvent";
import { GetServerSidePropsContext } from "next";
import { getToken } from "next-auth/jwt";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

const Home = ({ isLogin, id }) => {
  const router = useRouter();

  useEffect(() => {
    setHeadTitle("끄적끄적 블로그");
  }, []);

  return (
    <div className="w-full h-full flex-col">
      <div className="relative flex flex-col justify-start overflow-hidden">
        <div className="w-full mx-auto px-4 md:px-6 py-24">
          <div className="text-center">
            <div
              className="font-extrabold text-3xl md:text-4xl [text-wrap:balance] 
            from-slate-500/60 to-50% to-slate-500
            bg-clip-text text-transparent bg-gradient-to-r dark:from-slate-200/60 to-50% dark:to-slate-200"
            >
              <div className="mb-4">내맘대로</div>
              <div className="mb-4">암거나 적는 블로그</div>
              <span className="text-emerald-500 inline-flex flex-col h-[calc(theme(fontSize.3xl)*theme(lineHeight.tight))] md:h-[calc(theme(fontSize.4xl)*theme(lineHeight.tight))] overflow-hidden">
                <ul className="block animate-text-slide-5 text-left leading-tight [&_li]:block">
                  <li>공부</li>
                  <li>코딩</li>
                  <li>여행</li>
                  <li>일기</li>
                  <li>암거나</li>
                  <li aria-hidden="true">공부</li>
                </ul>
              </span>
              <span className="ml-2 ">끄적끄적</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col justify-center gap-4 items-center">
        {isLogin ? (
          <>
            <div className="text-lg font-semibold">
              이미 로그인 되어있습니다.
            </div>
            <div className="w-[100%] max-w-[400px] px-4">
              <OkBtn
                content="내 블로그로"
                width={"100%"}
                height={56}
                onClickEvt={() => router.push(`/${id}`)}
              />
            </div>
            <LabelBtn
              contents="로그아웃 하기"
              onClick={() => {
                signOut().then(() => {
                  router.reload();
                });
              }}
            />
          </>
        ) : (
          <>
            <div className="w-[100%] max-w-[400px] px-4">
              <OkBtn
                content="로그인"
                width={"100%"}
                height={46}
                onClickEvt={() => router.push("/signin")}
              />
            </div>
            <div className="w-[100%] max-w-[400px] px-4">
              <CancelBtn
                content="가입하기"
                width={"100%"}
                height={46}
                onClickEvt={() => router.push("/signup")}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  let token = await getToken({
    req: ctx.req,
    cookieName: process.env.NEXTAUTH_TOKENNAME,
    secret: process.env.NEXTAUTH_SECRET,
  });

  let isLogin = token ? true : false;
  let id = token ? token?.email?.split("@")[0] : null;

  return {
    props: {
      isLogin,
      id,
    },
  };
};
export default Home;
