import { Category } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import useSWR, { KeyedMutator } from "swr";

interface UserData {
  profile?: ProfileType;
  category?: CategoryCountType[];
}

type CategoryCountType = Category & {
  post: { isPrivate: boolean }[];
  _count: { post: number };
};
type ProfileType = {
  avatar?: string;
  email: string;
  github?: string;
  name: string;
  id: number;
  introduce?: string;
};

let userDataState: Dispatch<SetStateAction<UserData>>;
export const registUserDataState = (
  state: Dispatch<SetStateAction<UserData>>
) => {
  userDataState = state;
};

export const getGlobalSWR = (): {
  profileData: ProfileType;
  categoryData: CategoryCountType[];
  profileMutate: KeyedMutator<any>;
  categoryMutate: KeyedMutator<any>;
} => {
  const {
    data: { profile: profileData },
    mutate: profileMutate,
  } = useSWR("/api/profile");
  const {
    data: { originCategory: categoryData },
    mutate: categoryMutate,
  } = useSWR("/api/category");

  return { profileData, categoryData, profileMutate, categoryMutate };
};

export const userCheck = (sessionData) => {
  let { profileData } = getGlobalSWR();
  return sessionData && sessionData.accessToken.id == profileData?.id;
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
