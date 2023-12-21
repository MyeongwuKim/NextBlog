import { getGlobalSWR } from "@/hooks/useData";
import Head from "next/head";
import BodyComp from "./bodyComp";
import { useRouter } from "next/router";
import ErrorPage from "../pages/ErrorPage";
import { useEffect, useState } from "react";
import { registHeadState } from "@/hooks/useEvent";

const Root = ({ children }) => {
  const router = useRouter();
  const { profileData, categoryData } = getGlobalSWR();
  const [headTitle, setHeadTitle] = useState<string>("Loading");
  registHeadState(setHeadTitle);

  return (
    <div id="rootComp" className="absolute h-full w-full">
      <Head>
        <title>{headTitle == undefined ? "Loading" : headTitle}</title>
      </Head>
      {router?.pathname.includes("ErrorPage") ? (
        <ErrorPage />
      ) : (
        <BodyComp category={categoryData} profile={profileData}>
          {children}
        </BodyComp>
      )}
    </div>
  );
};

export default Root;
