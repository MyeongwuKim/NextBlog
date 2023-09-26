import { Category } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import useSWR from "swr";

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

export const getUserData = (): ProfileType => {
  const { data } = useSWR("/api/profile");
  return data?.profile as ProfileType;
};

export const getCategoryData = (): CategoryCountType[] => {
  const { data } = useSWR("/api/category");
  return data?.originCategory;
};

export const updateCategoryData = () => {
  const { data, mutate } = useSWR("/api/category");
  return mutate;
};

export const userCheck = (sessionData) => {
  let userData = getUserData();
  return sessionData && sessionData.accessToken.id == userData.id;
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
