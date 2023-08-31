import { getCategoryData, getUserData } from "@/hooks/useData";
import Head from "next/head";
import Layout from "./layout";
import ErrorPage from "@/pages/ErrorPage";
import { useEffect } from "react";

const WithHead = ({ children, title, pageProps }) => {
  let profile = getUserData();
  let category = getCategoryData();

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      {pageProps.title == "에러" ? (
        <ErrorPage contents={pageProps.contents}></ErrorPage>
      ) : (
        <Layout category={category} profile={profile} pageProps={pageProps}>
          {children}
        </Layout>
      )}
    </div>
  );
};

export default WithHead;
