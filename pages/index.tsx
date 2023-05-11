import CBody from "@/components/body";
import CPost from "@/components/post";
import CSideMenu from "@/components/side";
import { readFileSync, readdirSync } from "fs";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import useSWR from "swr";

const Home: NextPage = () => {
  return (
    <>
      <CBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <CPost key={i}></CPost>
        ))}
      </CBody>
    </>
  );
};

export const getStaticProps: GetStaticProps = (ctx) => {
  return {
    props: {},
  };
};
export default Home;
