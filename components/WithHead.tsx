import { getGlobalSWR } from "@/hooks/useData";
import Head from "next/head";
import Layout from "./layout";
import { useRouter } from "next/router";
import ErrorPage from "../pages/ErrorPage";
import { useEffect, useState } from "react";
import { registHeadState } from "@/hooks/useEvent";

const WithHead = ({ children }) => {
  const router = useRouter();
  const { profileData, categoryData } = getGlobalSWR();
  const [headTitle, setHeadTitle] = useState<string>("Loading");
  registHeadState(setHeadTitle);

  return (
    <>
      <Head>
        <title>{headTitle == undefined ? "Loading" : headTitle}</title>
      </Head>
      {router?.pathname.includes("ErrorPage") ? (
        <ErrorPage />
      ) : (
        <Layout category={categoryData} profile={profileData}>
          {children}
        </Layout>
      )}
    </>
  );
};

export default WithHead;
