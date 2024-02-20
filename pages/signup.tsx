import { GetServerSidePropsContext, NextPage } from "next";
import { signIn } from "next-auth/react";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import bcrypt from "bcryptjs";
import useMutation from "@/lib/server/useMutation";
import OkBtn from "@/components/okBtn";
import CancelBtn from "@/components/cancelBtn";
import InputField from "@/components/inputField";
import { useRouter } from "next/router";
import LabelBtn from "@/components/labelBtn";
import { createToast, setHeadTitle, setLoading } from "@/hooks/useEvent";
import { getToken } from "next-auth/jwt";

interface SignupForm {
  email: string;
  name: string;
  password: string;
  pwConfirm: string;
  phonenumber: string;
  errorMsg?: string;
}

interface CreateUserRes {
  ok: boolean;
  error?: string;
}

const SignUp: NextPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    setValue,
    reset,
    formState: { errors: formErrors },
  } = useForm<SignupForm>();
  const [createUser, { data, loading }] = useMutation<CreateUserRes>(
    "/api/account/create"
  );

  useEffect(() => {
    setHeadTitle("가입하기");
  }, []);
  useEffect(() => {
    if (!data) return;
    if (data.ok) {
      createToast("끄적블로그에 가입완료 되었습니다.", false);
      router.replace("/");
    } else if (!data.ok) {
      createToast(data.error, true);
    }
  }, [data]);

  const onValid = useCallback(async (data: SignupForm) => {
    setLoading(true);
    createUser(data);
  }, []);

  const onInValid: SubmitErrorHandler<SignupForm> = useCallback((errors) => {
    let msg = "";

    if (errors.email) {
      msg = errors.email?.message!;
    } else if (errors.name) {
      msg = errors.name?.message!;
    } else if (errors.phonenumber) {
      msg = errors.phonenumber?.message!;
    } else if (errors.password) {
      msg = errors.password?.message!;
    } else if (errors.pwConfirm) {
      msg = errors.pwConfirm?.message!;
    }
    setError("errorMsg", { message: msg });
  }, []);

  return (
    <div className="w-full h-full flex-col">
      <div className="w-full flex justify-center items-center flex-col">
        <div className="w-full mx-auto px-4 md:px-6 py-24">
          <div
            className="font-extrabold text-3xl md:text-4xl [text-wrap:balance] 
          from-slate-500/60 to-50% to-slate-500
          bg-clip-text text-transparent bg-gradient-to-r dark:from-slate-200/60 to-50% dark:to-slate-200"
          >
            <div className="text-center">
              <span>가입하기</span>
            </div>
          </div>
        </div>
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
            <div className="w-full h-auto mb-4">
              <div className="relative flex flex-row items-center mb-2 w-full">
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
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span className="font-semibold text-xl">이름</span>
              </div>
              <InputField
                id="name"
                height="60px"
                width="100%"
                type="text"
                placeholder="이름 입력"
                register={{
                  ...register("name", {
                    required: {
                      value: true,
                      message: "이름을 입력해주세요.",
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
            <div className="w-full h-auto mb-4">
              <div className="relative flex flex-row items-center mb-2 w-full">
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
                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
                <span className="font-semibold text-xl">휴대폰번호</span>
              </div>
              <InputField
                id="phonenumber"
                height="60px"
                width="100%"
                type="tel"
                placeholder="휴대폰번호 입력"
                register={{
                  ...register("phonenumber", {
                    required: {
                      value: true,
                      message: "휴대폰 번호를 입력해주세요.",
                    },
                    pattern: {
                      value: /[0-9]/,
                      message: "휴대폰 번호의 값이 잘못 되었습니다.",
                    },
                    onBlur: (e) => {
                      let value = e.target.value.replace(/[^0-9\-]/g, "");
                      let formatValue = value.replace(/[^0-9]/g, "");
                      let result;
                      if (formatValue.length <= 6) return;

                      if (formatValue.length >= 11) {
                        result =
                          formatValue.slice(0, 3) +
                          "-" +
                          formatValue.slice(3, 7) +
                          "-" +
                          formatValue.slice(7);
                      } else {
                        result =
                          formatValue.slice(0, 3) +
                          "-" +
                          formatValue.slice(3, 6) +
                          "-" +
                          formatValue.slice(6);
                      }
                      setValue("phonenumber", result);
                    },
                    onChange: (e) => {
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
              <InputField
                id="pwConfirm"
                type="password"
                height="60px"
                width="100%"
                placeholder="패스워드 확인"
                register={{
                  ...register("pwConfirm", {
                    required: {
                      value: true,
                      message: "비밀번호를 한번 더 입력해주세요.",
                    },
                    validate: (value) =>
                      value === getValues("password") ||
                      "비밀번호가 일치하지 않습니다.",
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
          <div className="mt-4 mb-4 h-auto right-0 relative w-full flex flex-col justify-center items-center gap-4">
            <OkBtn
              type="submit"
              content="가입"
              width={"100%"}
              height={55}
              onClickEvt={() => {
                clearErrors();
              }}
            />
            <LabelBtn contents="뒤로가기" url="/" />
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

export default SignUp;
