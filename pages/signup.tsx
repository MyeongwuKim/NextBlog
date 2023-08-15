import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import bcrypt from "bcryptjs";
import useMutation from "@/lib/server/useMutation";
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

interface CreateUserRes {
  ok: boolean;
  error?: string;
}

const width = 500;
const height = 500;

const CSignup: NextPage<ISignInProps> = ({ enable, openCallback }) => {
  const router = useRouter();

  enable = true;
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors: formErrors },
  } = useForm<ISighInData>();
  const [createUser, { data, loading }] =
    useMutation<CreateUserRes>("/api/account");
  const [windowInfo, setWindowInfo] = useState<IWindowInfo>();
  const windowSizeEvt = () => {
    let posX = (window.innerWidth - width) / 2;
    let posY = (window.innerHeight - height) / 2;
    setWindowInfo({
      posX: posX,
      posY: posY,
    });
  };

  const onValid = useCallback(async (userData: ISighInData) => {
    const encodedpassword = await bcrypt.hash(userData.password, 10);
    userData.password = encodedpassword;
    const { email, password } = userData;
    createUser({ email, password });
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
                openCallback("none");
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
                <span>{"Sign Up"}</span>
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
                      message: "Please enter your email",
                    },
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Entered value does not match email format",
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
                      message: "Please enter your password",
                    },
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
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
                  className={`relative w-full flex flex-row justify-center items-center mt-2 font-semibold `}
                >
                  <span className="mr-2 text-base text-slate-800 dark:text-gray-200">
                    Already have an account?
                  </span>
                  <span
                    onClick={() => {
                      reset();
                      clearErrors();
                      openCallback("signin");
                    }}
                    className="cursor-pointer text-xl text-blue-500"
                  >
                    Sign In
                  </span>
                </div>
                <div className="w-full relative text-center font-bold text-lg text-red-500">
                  {formErrors ? (
                    <span>{formErrors?.errorMsg?.message}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="px-6 h-auto absolute w-full bottom-0 ">
              <button
                type="submit"
                className="my-4 w-full h-14 select-none  items-center inline-block  text-lg font-semibold rounded-xl   bg-emerald-500 hover:bg-emerald-700"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="z-[49] top-0 absolute bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(0,0,0,0.6)] w-full h-full"></div>
    </div>
  );
};

export default CSignup;
