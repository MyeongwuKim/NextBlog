import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import OkBtn from "@/components/okBtn";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import CancelBtn from "@/components/cancelBtn";
import InputField from "@/components/inputField";
import { setLoading, setHeadTitle, createToast } from "@/hooks/useEvent";
import LabelBtn from "@/components/labelBtn";
import { getToken } from "next-auth/jwt";
import { GetServerSidePropsContext } from "next";

interface SighinForm {
  email: string;
  password: string;
  errorMsg?: string;
}

const SignIn = () => {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    clearErrors,
    formState: { errors: formErrors },
  } = useForm<SighinForm>();
  const onValid = useCallback(async (data: SighinForm) => {
    sighinEvt(data);
  }, []);
  useEffect(() => {
    setHeadTitle("로그인");
  }, []);

  const onInValid: SubmitErrorHandler<SighinForm> = useCallback((errors) => {
    let msg = "";
    if (errors.email) {
      msg = errors.email?.message!;
    } else if (errors.password) {
      msg = errors.password?.message!;
    }
    setError("errorMsg", { message: msg });
  }, []);

  const sighinEvt = async (data: SighinForm) => {
    setLoading(true);
    let id = data.email.split("@")[0];
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    }).then(({ ok, error }) => {
      setLoading(false);
      if (ok) {
        router.push(`${id}`);
      } else {
        createToast(error, true);
      }
    });
  };
  return (
    <div className="w-full h-full flex-col">
      <div className="w-full mx-auto px-4 md:px-6 py-24">
        <div
          className="font-extrabold text-3xl md:text-4xl [text-wrap:balance] 
        bg-clip-text text-transparent bg-gradient-to-r from-slate-500/60 to-50% to-slate-500
        dark:from-slate-200/60 to-50% dark:to-slate-200 "
        >
          <div className="text-center">
            <span>로그인</span>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center items-center flex-col">
        <form
          className="w-[400px]"
          method="post"
          onSubmit={handleSubmit(onValid, onInValid)}
        >
          <div className="relative w-full  flex items-start flex-col">
            <div className="w-full h-auto mb-4">
              <div className="relative flex flex-row items-center mb-2 w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <span className="font-semibold text-xl">이메일</span>
              </div>
              <InputField
                id="email"
                height="60px"
                width="100%"
                placeholder="이메일 입력"
                register={{
                  ...register("email", {
                    required: {
                      value: true,
                      message: "이메일을 입력해주세요.",
                    },
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "이메일 형식이 아닙니다.",
                    },
                    onChange: () => {
                      if (formErrors.errorMsg) {
                        clearErrors();
                      }
                    },
                  }),
                }}
              />
            </div>
            <div className="w-full h-auto">
              <div className="relative w-full flex flex-row items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span className="font-semibold text-xl">패스워드</span>
              </div>
              <InputField
                id="password"
                type="password"
                height="60px"
                width="100%"
                placeholder="패스워드 입력"
                register={{
                  ...register("password", {
                    required: {
                      value: true,
                      message: "비밀번호를 입력해주세요.",
                    },
                    minLength: {
                      value: 8,
                      message: "비밀번호는 8자 이상이여야 합니다.",
                    },
                    onChange: () => {
                      if (formErrors.errorMsg) {
                        clearErrors();
                      }
                    },
                  }),
                }}
              />

              <div
                className={`relative w-full flex flex-row justify-center mt-2 font-semibold `}
              ></div>
              <div className="w-full h-6 relative text-center font-medium text-lg text-red-500">
                <span>{formErrors?.errorMsg?.message}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 h-auto right-0 relative w-full flex flex-col justify-center items-center gap-4">
            <OkBtn
              type="submit"
              content="로그인"
              width={"100%"}
              height={55}
              onClickEvt={() => {
                clearErrors();
              }}
            />
            <LabelBtn
              contents="뒤로가기"
              onClick={() => {
                clearErrors();
                router.back();
              }}
            />
          </div>
        </form>
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
  if (token) {
    return {
      redirect: {
        permanent: true,
        destination: "/",
      },
      props: {},
    };
  }
  return {
    props: {},
  };
};
export default SignIn;
