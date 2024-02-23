import { Category } from "@prisma/client";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import useSWR, { KeyedMutator } from "swr";

interface UserData {
  profile?: ProfileType;
  category?: CategoryCountType[];
}

interface ProfileRespose {
  ok: boolean;
  profile: ProfileType;
}
type ProfileType = {
  avatar?: string;
  email: string;
  github?: string;
  name: string;
  id: number;
  introduce?: string;
};

interface CategoryResponse {
  ok: boolean;
  originCategory: CategoryCountType[];
}
type CategoryCountType = Category & {
  post: { isPrivate: boolean }[];
  _count: { post: number };
};

let userDataState: Dispatch<SetStateAction<UserData>>;
export const registUserDataState = (
  state: Dispatch<SetStateAction<UserData>>
) => {
  userDataState = state;
};

export const getGlobalSWR = (
  userId?: string
): {
  swrProfileResponse: ProfileRespose;
  swrCategoryResponse: CategoryResponse;
  profileMutate: KeyedMutator<any>;
  categoryMutate: KeyedMutator<any>;
} => {
  const { data: swrProfileResponse, mutate: profileMutate } = useSWR(
    `/api/profile/${userId}`
  );
  const { data: swrCategoryResponse, mutate: categoryMutate } = useSWR(
    `/api/category/${userId}`
  );

  return {
    swrProfileResponse,
    swrCategoryResponse,
    profileMutate,
    categoryMutate,
  };
};

export const userCheck = (sessionData) => {
  let { swrProfileResponse } = getGlobalSWR();
  return (
    sessionData && sessionData.accessToken.id == swrProfileResponse?.profile?.id
  );
};
export const updateUserData = (data: CategoryCountType[] | ProfileType) => {
  userDataState((prev) => {
    var newPrev;
    if (Array.isArray(data)) {
      newPrev = {
        ...prev,
        category: data,
      };
    } else {
      newPrev = {
        ...prev,
        profile: data,
      };
    }
    return newPrev;
  });
};
