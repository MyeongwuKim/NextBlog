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
    setLoading(false);
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
          className="w-[90%] max-w-[400px] px-4"
          method="post"
          onSubmit={handleSubmit(onValid, onInValid)}
        >
          <div className="relative w-full flex items-center flex-col ">
            <div className="w-full h-[46px] mb-4 relative">
              <InputField
                content="이메일"
                id="email"
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
                id="name"
                type="text"
                content="이름"
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
            <div className="w-full h-[46px] mb-4 relative">
              <InputField
                id="phonenumber"
                type="tel"
                content="휴대폰번호"
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
              <div className="w-full h-[46px] mb-2 relative">
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
              </div>
              <div className="w-full h-[46px] relative">
                <InputField
                  id="pwConfirm"
                  type="password"
                  content="비밀번호 확인"
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
              </div>
              <div className="w-full h-6 relative text-center font-medium text-lg text-red-500 sm:text-sm">
                <span>{formErrors?.errorMsg?.message}</span>
              </div>
            </div>
          </div>
          <div className="max-w-[400px] px-4 mb-4 h-auto right-0 relative w-full flex flex-col justify-center items-center gap-4">
            <OkBtn
              type="submit"
              content="가입"
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

export default SignUp;
