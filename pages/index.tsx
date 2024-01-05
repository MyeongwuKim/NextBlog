import CancelBtn from "@/components/cancelBtn";
import OkBtn from "@/components/okBtn";
import { setHeadTitle } from "@/hooks/useEvent";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    setHeadTitle("끄적끄적 블로그");
  }, []);
  useEffect(() => {
    console.log(router);
  }, [router]);
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
              <div className="mb-4">아무거나 끄적이는 사이트</div>
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
      <div className="flex flex-col justify-center gap-4 items-center">
        <div className="w-[50%] max-w-[400px]">
          <OkBtn
            content="로그인"
            width={"100%"}
            height={56}
            onClickEvt={() => router.push("/signin")}
          />
        </div>
        <div className="w-[50%] max-w-[400px]">
          <CancelBtn
            content="가입하기"
            width={"100%"}
            height={56}
            onClickEvt={() => router.push("/signup")}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
