import OkBtn from "@/components/okBtn";
import { setHeadTitle } from "@/hooks/useEvent";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Custom404 = () => {
  const router = useRouter();

  useEffect(() => {
    setHeadTitle("에러페이지");
  }, [router]);

  return (
    <div className="absolute w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-32 h-32 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
          />
        </svg>

        <div className="text-2xl mb-4">이런.. 잘못된 접근 입니다.</div>
        <OkBtn
          content="돌아가기"
          width={120}
          height={45}
          onClickEvt={() => {
            router.back();
          }}
        ></OkBtn>
      </div>
    </div>
  );
};

export default Custom404;
