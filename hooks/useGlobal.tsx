import { Category } from "@prisma/client";
import { Dispatch, SetStateAction, createContext, useEffect } from "react";
import ErrorMsg from "@/components/errorMsg";
import * as ReactDOMClient from "react-dom/client";
import useSWR from "swr";

interface UserData {
  profile?: ProfileType;
  category?: CategoryCountType[];
}

type CategoryCountType = Category & { _count: { post: number } };
type ProfileType = {
  avatar?: string;
  email: string;
  github?: string;
  name: string;
  id: number;
  introduce?: string;
};

interface MutateProps {
  profileMutate: (data?: any) => any;
  categoryMutate: (data?: any) => any;
}

let mutate: MutateProps;
let loadingState: Dispatch<SetStateAction<boolean>>;
let userDataState: Dispatch<SetStateAction<UserData>>;
let root = null;

export const initData = () => {
  const fetcher = async (url) => {
    const res = await fetch(url);
    return res.json();
  };
  const { data: profile, mutate: profileMutate } = useSWR(
    "/api/profile",
    fetcher
  );
  const { data: category, mutate: categoryMutate } = useSWR(
    "/api/category",
    fetcher
  );
};

export const registLoadingState = (
  state: Dispatch<SetStateAction<boolean>>
) => {
  loadingState = state;
};

export const registUserDataState = (
  state: Dispatch<SetStateAction<UserData>>
) => {
  userDataState = state;
};

export const setLoading = (enable: boolean) => {
  loadingState(enable);
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

export const createErrorMsg = (msg: string, isWarning: boolean) => {
  loadingState((prev) => (prev == true ? !prev : prev));
  if (!document.getElementById("cautionWindow")) {
    root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
  } else {
    root.unmount();
    root = ReactDOMClient.createRoot(document.getElementById("errorCont"));
  }

  root.render(<ErrorMsg root={root} msg={msg} isWarning={isWarning} />);
};
