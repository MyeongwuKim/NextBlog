import CBody from "@/components/body";
import CPost from "@/components/post";
import CSideMenu from "@/components/side";
import { GetStaticPaths, GetStaticProps } from "next";
import useSWR from "swr";

export default function Home() {
  return (
    <>
      <CBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <CPost key={i}></CPost>
        ))}
      </CBody>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({}) => {
  return {
    props: {},
  };
};
