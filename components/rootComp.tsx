import { getGlobalSWR } from "@/hooks/useData";
import Head from "next/head";
import BodyComp from "./bodyComp";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { registHeadState } from "@/hooks/useEvent";

const Root = ({ children }) => {
  const router = useRouter();
  const [headTitle, setHeadTitle] = useState<string>("Loading");
  registHeadState(setHeadTitle);

  return (
    <div id="rootComp" className="absolute h-full w-full">
      <Head>
        <title>{headTitle == undefined ? "Loading" : headTitle}</title>
      </Head>
      {getPageRoute(router.pathname, children)}
    </div>
  );
};

const getPageRoute = (pathname: string, children) => {
  let tag;
  if (pathname.includes("[userId]")) {
    tag = <BodyComp>{children}</BodyComp>;
  } else {
    tag = <>{children}</>;
  }

  return tag;
};

export default Root;
