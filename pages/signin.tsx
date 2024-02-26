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
          className="w-[90%] max-w-[400px] px-4"
          method="post"
          onSubmit={handleSubmit(onValid, onInValid)}
        >
          <div className="relative w-full flex items-center flex-col">
            <div className="w-full h-[46px] mb-4 relative">
              <InputField
                id="email"
                content="이메일"
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
            <div className="w-full h-[46px] mb-4 relative">
              <InputField
                id="password"
                type="password"
                content="비밀번호"
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
              <div className="w-full h-6 relative text-center font-medium text-lg sm:text-sm text-red-500">
                <span>{formErrors?.errorMsg?.message}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 h-auto right-0 relative w-full flex flex-col justify-center items-center gap-4">
            <OkBtn
              type="submit"
              content="로그인"
              width={"100%"}
              height={46}
              onClickEvt={() => {
                clearErrors();
              }}
            />
            <LabelBtn
              contents="뒤로가기"
              onClick={() => {
                if (!sessionStorage.getItem("prevUrl")) {
                  router.push("/");
                } else router.back();
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
