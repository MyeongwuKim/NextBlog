import { GetServerSideProps, NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { useRouter } from "next/router";

interface ISignInProps {
  enable: boolean;
  openCallback: (mode: "signin" | "signup" | "none") => void;
}
interface IWindowInfo {
  posX: number;
  posY: number;
}
interface ISighInData {
  email: string;
  password: string;
  errorMsg?: string;
}

const width = 500;
const height = 500;

const SignIn: NextPage<ISignInProps> = ({ enable = true, openCallback }) => {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    clearErrors,
    formState: { errors: formErrors },
  } = useForm<ISighInData>();
  const [windowInfo, setWindowInfo] = useState<IWindowInfo>();
  const windowSizeEvt = () => {
    let posX = (window.innerWidth - width) / 2;
    let posY = (window.innerHeight - height) / 2;
    setWindowInfo({
      posX: posX,
      posY: posY,
    });
  };

  const onValid = useCallback(async (data: ISighInData) => {
    sighinEvt(data);
  }, []);

  const onInValid: SubmitErrorHandler<ISighInData> = useCallback((errors) => {
    let msg = "";
    if (errors.email) {
      msg = errors.email?.message!;
    } else if (errors.password) {
      msg = errors.password?.message!;
    }
    setError("errorMsg", { message: msg });
  }, []);

  useEffect(() => {
    windowSizeEvt();
    window.addEventListener("resize", () => {
      windowSizeEvt();
    });
  }, []);

  useEffect(() => {}, [windowInfo]);

  const sighinEvt = async (data: ISighInData) => {
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (res.ok) {
      update();
    } else {
      setError("errorMsg", { message: res.error });
    }
    // .then((res) => {
    //   console.log(res);
    // })
    // .catch((error) => {
    //   console.log(error);
    // });
  };
  return (
    <div
      className={`${
        enable ? "block" : "hidden"
      } w-full h-full absolute bg-transparent`}
    >
      <div
        style={{
          width,
          height,
          left: windowInfo?.posX,
          top: windowInfo?.posY,
        }}
        className="bg-white dark:bg-black absolute shadow-xl z-50 border-[1px]  border-gray-300 rounded-lg "
      >
        <div
          id="login_win"
          className={`relative  w-full h-full  bg-transparent `}
        >
          <div
            className="w-full h-[60px] rounded-t-lg dark:bg-zinc-900
      bg-gray-100"
          >
            <button
              onClick={() => {
                reset();
              }}
              className="absolute right-4 top-4 text-2xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-6 m-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form className="w-full" onSubmit={handleSubmit(onValid, onInValid)}>
            <div className="relative w-full  flex items-start p-6 flex-col">
              <div className="relative w-full text-center font-bold text-slate-800 dark:text-gray-200 text-3xl mb-3">
                <span>로그인</span>
              </div>

              <div className="w-full h-auto">
                <div className="relative flex flex-row items-center w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-8 h-6 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <span className="font-normal text-slate-800 dark:text-gray-200 text-2xl mb-2">
                    email
                  </span>
                </div>

                <input
                  id="email"
                  {...register("email", {
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
                  })}
                  placeholder="input your email"
                  className="p-2 dark:bg-zinc-900 dark:text-gray-200 border-2 dark:placeholder:text-gray-400 placeholder:text-gray-200 rounded-xl font-serif text-2xl text-slate-800 resize-none w-full h-14 boder-2 border-gray-300"
                />
              </div>
              <div className="w-full h-auto">
                <div
                  className="relative w-full flex flex-row items-center
                "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-6 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>

                  <span className="font-normal text-slate-800 dark:text-gray-200 text-2xl my-2">
                    password
                  </span>
                </div>
                <input
                  id="password"
                  {...register("password", {
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
                  })}
                  type="password"
                  placeholder="input your password"
                  className="p-2 dark:bg-zinc-900 dark:text-gray-200 border-2 dark:placeholder:text-gray-400 placeholder:text-gray-200 rounded-xl font-serif text-2xl text-slate-800 resize-none w-full h-14 boder-2 border-gray-300"
                />
                <div
                  className={`relative w-full flex flex-row justify-center mt-2 font-semibold `}
                >
                  <span className="font-sans mr-2 text-lg text-slate-800 dark:text-gray-200">
                    아이디가 없다면..
                  </span>
                  <span
                    onClick={() => {
                      reset();
                      clearErrors();
                    }}
                    className="font-sans cursor-pointer text-xl text-blue-500"
                  >
                    가입하기
                  </span>
                </div>
                <div className="w-full relative text-center font-bold text-lg text-red-500">
                  <span>{formErrors?.errorMsg?.message}</span>
                </div>
              </div>
            </div>

            <div className="px-6 h-auto absolute w-full bottom-0 ">
              <button
                type="submit"
                className="my-4 w-full h-14 select-none  items-center inline-block  text-lg font-semibold rounded-xl   bg-emerald-500 hover:bg-emerald-700"
              >
                로그인
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="z-[49] top-0 absolute bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(0,0,0,0.6)] w-full h-full"></div>
    </div>
  );
};

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   console.log("ㅁㄴㅇㅁㄴㅇㅁㄴㅇㅁㄴㅇㅁㄴㅇ");
//   return {
//     props: {
//       csrfToken: await getCsrfTokenAndSetCookies(context),
//     },
//   };
// };

const getCsrfTokenAndSetCookies = async (context) => {
  // capturing the callback url if any, which should include the current domain for security ?
  const host =
    typeof context.query?.callbackUrl === "string" &&
    context.query?.callbackUrl.startsWith(process.env.NEXTAUTH_URL)
      ? context.query?.callbackUrl
      : process.env.NEXTAUTH_URL;
  const redirectURL = encodeURIComponent(host);
  // getting both the csrf form token and (next-auth.csrf-token cookie + next-auth.callback-url cookie)
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/auth/csrf?callbackUrl=${redirectURL}`
  );
  const { csrfToken } = await res.json();

  const headers = res.headers;
  // placing the cookies on the response
  const [csrfCookie, redirectCookie] = headers.get("set-cookie").split(",");
  context.res.setHeader("set-cookie", [csrfCookie, redirectCookie]);
  return csrfToken;
};

export default SignIn;
