import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { getToken } from "next-auth/jwt";
import { useEffect, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import useMutation from "@/lib/server/useMutation";
import bcrypt from "bcryptjs";
import prisma from "@/lib/server/client";
import useSWR, { SWRConfig } from "swr";
import { updateUserData } from "@/hooks/useData";
import { getDeliveryDomain } from "@/hooks/useUtils";
import { setLoading, createCautionMsg, setHeadTitle } from "@/hooks/useEvent";
import InputField from "@/components/inputField";
import OkBtn from "@/components/okBtn";
interface ProfileProps {
  profile: ProfileType;
}

type ProfileType = {
  avatar?: string;
  email: string;
  github?: string;
  password: string;
  name: string;
  id: number;
  introduce?: string;
  changePassword?: string;
  originPassword?: string;
};

interface ErrorFormData {
  name: string;
  github: string;
  originPassword: string;
  changePassword: string;
  errorMsg?: string;
}

interface ProfileResponse {
  ok: true;
  error: string;
}

const uploadPrefix = "https://imagedelivery.net/0VaIqAONZ2vq2gejAGX7Sw/";
const uploadSuffix = "/avatar";

const Profile: NextPage = () => {
  const {
    data: { profile },
    mutate: profileCacheMutate,
  } = useSWR<ProfileProps>("/api/profile");
  const { register, handleSubmit, getValues, setValue } = useForm<ProfileType>({
    defaultValues: {
      id: profile.id,
      name: profile.name,
      github: profile.github,
      introduce: profile.introduce,
    },
  });
  const [profileMutation, { loading, data: ResponseData }] =
    useMutation<ProfileResponse>("/api/profile");

  const [passwordState, setPasswordState] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [prevAvatar, setPrevAvatar] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<boolean>(false);

  useEffect(() => {
    setHeadTitle("프로필 관리");

    if (profile?.avatar) {
      setAvatarPreview(`${getDeliveryDomain(profile?.avatar, "avatar")}`);
      setPrevAvatar(profile?.avatar);
    }
  }, []);

  useEffect(() => {
    if (avatarPreview === prevAvatar) {
      setSaveState(false);
      return;
    }

    let formatPreview = null;
    if (avatarPreview)
      formatPreview = avatarPreview
        .replace(uploadPrefix, "")
        .replace(uploadSuffix, "");

    if (formatPreview != profile.avatar) {
      setSaveState(true);
    } else setSaveState(false);
  }, [avatarPreview]);

  useEffect(() => {
    if (!ResponseData) return;
    if (ResponseData.ok) {
      createCautionMsg("변경사항을 저장하였습니다.", false);
    } else {
      createCautionMsg(ResponseData.error, true);
    }
  }, [ResponseData]);

  const onCheckSaveState = () => {
    let { github, name, introduce } = getValues();

    if (!github) github = !github || github.length <= 0 ? null : github;
    else if (!name) name = github.length <= 0 ? null : name;
    else if (!introduce) introduce = github.length <= 0 ? null : introduce;

    if (
      name != profile.name ||
      introduce != profile.introduce ||
      github != profile.github
    ) {
      setSaveState(true);
    } else {
      setSaveState(false);
    }
  };
  //const avatarWatch = watch("avatar");
  // useEffect(() => {
  //   if (avatarWatch && avatarWatch.length > 0) {
  //     const file: any = avatarWatch[0];
  //     setAvatarPreview(URL.createObjectURL(file));
  //   }
  // }, [avatarWatch]);

  const onValid = async (data: ProfileType) => {
    setLoading(true);
    try {
      if (getValues("avatar") && getValues("avatar").length > 0) {
        if (profile.avatar) {
          await (
            await fetch(`/api/files`, {
              method: "DELETE",
              body: JSON.stringify({ imageId: profile.avatar }),
            })
          ).json();
        }
        const { uploadURL } = await (
          await fetch(`/api/files`, { method: "POST" })
        ).json();
        const form = new FormData();
        const avatarFiles = getValues("avatar")[0];

        form.append(
          "file",
          avatarFiles as any,
          `${profile?.id.toString()}_avatar`
        );
        const {
          result: { id },
        } = await (
          await fetch(uploadURL, {
            method: "POST",
            body: form,
          })
        ).json();
        data.avatar = id;
      } else if (profile.avatar && !avatarPreview) {
        await (
          await fetch(`/api/files`, {
            method: "DELETE",
            body: JSON.stringify({ imageId: profile.avatar }),
          })
        ).json();
        data.avatar = null;
      } else {
        delete data.avatar;
      }
    } catch {
      createCautionMsg("이미지서버 통신 오류입니다.", true);
      return;
    }

    if (passwordState) {
      const passwordResult = await bcrypt.compare(
        data.originPassword,
        profile.password
      );
      if (!passwordResult) {
        createCautionMsg("기존 비밀번호를 확인해주세요.", true);
        return;
      }
      const changePassword = await bcrypt.hash(data.changePassword, 10);
      data.changePassword = changePassword;
      delete data.originPassword;
    }

    setValue("avatar", "");
    profileMutation(data);
    profileCacheMutate((prev) => {
      prev.profile = {
        ...prev.profile,
        ...data,
        ...data,
        password: data.changePassword
          ? data.changePassword
          : prev.profile.password,
      };
      updateUserData(prev.profile);
      return prev;
    }, false);
  };
  const onInValid: SubmitErrorHandler<ErrorFormData> = (error) => {
    const { name, originPassword, changePassword, github } = error;

    let msg = "";
    if (name) {
      msg = name.message;
    } else if (originPassword || changePassword) {
      msg = originPassword ? originPassword.message : changePassword.message;
    } else if (github) {
      msg = github.message;
    }
    createCautionMsg(msg, true);
  };

  return (
    <div className="w-full h-full md:mt-5">
      <div className="relative text-xl mb-5 font-bold">
        유저의 정보를 변경할 수 있습니다.
      </div>
      <form method="post" onSubmit={handleSubmit(onValid, onInValid)}>
        <div className="relative h-auto w-full flex flex-col items-center">
          <div className="relative h-auto w-full flex items-center justify-center border-gray-200 dark:border-zinc-800">
            <div
              className="border-2 dark:border-zinc-800 mb-4 relative flex 
              flex-row items-center justify-center w-32 h-32 rounded-full bg-slate-500"
            >
              <img
                src={avatarPreview ? avatarPreview : ""}
                className={`${
                  avatarPreview ? "block" : "hidden"
                } w-full h-full rounded-full `}
              />
              <span className="text-3xl font-semibold text-center text-white ">
                {!avatarPreview ? profile?.name : ""}
              </span>
            </div>
          </div>
          <div className="w-full h-auto mb-4 relative flex flex-row justify-center items-center">
            <div className={`${avatarPreview ? "hidden" : "block"}`}>
              <label
                onChange={(e: any) => {
                  const file: any = e.target.files[0];
                  setAvatarPreview(URL.createObjectURL(file));
                  URL.revokeObjectURL(file);
                }}
                htmlFor="picture"
                className="text-gray-200 cursor-pointer w-auto h-full select-none inline-block p-2 text-lg font-semibold rounded-lg  bg-emerald-500 hover:bg-emerald-700"
              >
                이미지 등록
                <input
                  {...register("avatar")}
                  id="picture"
                  type="file"
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setAvatarPreview(null);
                setValue("avatar", "");
              }}
              className={`${
                avatarPreview ? "block" : "hidden"
              } text-gray-200 w-auto h-full select-none inline-block p-2 text-lg 
              font-semibold rounded-lg bg-slate-600 hover:bg-slate-700`}
            >
              이미지 삭제
            </button>
          </div>
          <div className="relative items-center mb-4  h-14 w-full flex">
            <div className="w-1/4 pl-4 text-xl font-semibold font-sans">
              유저이름
            </div>
            <InputField
              register={{
                ...register("name", {
                  required: {
                    value: true,
                    message: "이름을 입력해주세요.",
                  },
                  onChange(e) {
                    onCheckSaveState();
                  },
                }),
              }}
              id="name"
              type="text"
              width="76%"
              height="56px"
              fieldtype="input"
              placeholder="이름을 입력해주세요"
            />
          </div>
          <div className="relative items-center mb-4 h-14 w-full flex">
            <div className="w-1/4 pl-4 text-xl font-semibold font-sans">
              깃허브주소
            </div>
            <InputField
              register={{
                ...register("github", {
                  onChange() {
                    onCheckSaveState();
                  },
                }),
              }}
              id="github"
              type="text"
              width="76%"
              height="56px"
              fieldtype="input"
            />
          </div>
          <div className="relative items-center mb-4 h-14 w-full flex">
            <div className="w-1/4 pl-4 text-xl font-semibold font-sans">
              비밀번호
            </div>
            <button
              type="button"
              onClick={() => {
                setSaveState(true);
                setPasswordState(true);
              }}
              className={`${
                passwordState ? "hidden" : "block"
              } relative select-none text-gray-200
        w-36 inline-block p-2 text-lg font-semibold h-full rounded-lg bg-slate-600 hover:bg-slate-700`}
            >
              변경하기
            </button>
            <div
              className={`${
                passwordState ? "block" : "hidden"
              } w-3/4 flex gap-3 h-full relative`}
            >
              <div className="w-1/3">
                <button
                  type="button"
                  onClick={() => {
                    setSaveState(false);
                    setPasswordState(false);
                  }}
                  className={`text-gray-200 select-none w-36 inline-block 
            p-2 text-lg font-semibold h-full rounded-lg bg-slate-600 hover:bg-slate-700`}
                >
                  취소
                </button>
              </div>
              <InputField
                register={{
                  ...register("originPassword", {
                    required: {
                      value: passwordState,
                      message: "기존 비밀번호를 입력해주세요.",
                    },
                    minLength: {
                      value: 8,
                      message: "비밀번호는 8자 이상이여야 합니다.",
                    },
                  }),
                }}
                id="originPassword"
                type="password"
                placeholder="기존 비밀번호"
                width="33%"
                height="56px"
                fieldtype="input"
              />
              <InputField
                register={{
                  ...register("changePassword", {
                    required: {
                      value: passwordState,
                      message: "변경할 비밀번호를 입력해주세요.",
                    },
                    minLength: {
                      value: 8,
                      message: "비밀번호는 8자 이상이여야 합니다.",
                    },
                  }),
                }}
                id="changePassword"
                type="password"
                placeholder="변경할 비밀번호"
                width="33%"
                height="56px"
                fieldtype="input"
              />
            </div>
          </div>
          <div className="relative items-center mb-10  h-auto w-full flex-cols">
            <div className="w-full pl-4 mb-4 text-xl font-semibold font-sans">
              블로그 소개
            </div>
            <div className="w-full h-28 pl-4">
              <InputField
                register={{
                  ...register("introduce", {
                    onChange() {
                      onCheckSaveState();
                    },
                  }),
                }}
                id="introduce"
                width="100%"
                height="100%"
                fieldtype="textarea"
              />
            </div>
          </div>
          <div className="relative">
            <OkBtn
              type="submit"
              height={56}
              width={144}
              content="변경사항 저장"
              isEnable={saveState ? true : false}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

const ProfileSWR: NextPage<ProfileProps> = ({ profile }) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          "/api/profile": {
            ok: true,
            profile,
          },
        },
      }}
    >
      <Profile />
    </SWRConfig>
  );
};

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (
  context: GetServerSidePropsContext
) => {
  let token = await getToken({
    req: context.req,
    cookieName: process.env.NEXTAUTH_TOKENNAME,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const profileData = await prisma.account.findUnique({
    where: { id: token.id },
    select: {
      avatar: true,
      email: true,
      github: true,
      name: true,
      id: true,
      introduce: true,
      password: true,
    },
  });

  return {
    props: {
      profile: profileData,
    },
  };
};

export default ProfileSWR;
