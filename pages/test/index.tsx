import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Test = () => {
  const router = useRouter();

  if (!router.isReady) return <div>loading</div>;
  return <div>complete!!!</div>;
};

export const getServerSideProps = async () => {
  console.log("GETSERVERSIDE");
  let req = await fetch(`${process.env.NEXTAUTH_URL}/api/post/114`, {
    method: "GET",
  });
  let { data, error, ok } = await req.json();
  return {
    props: {},
  };
};
// export const getStaticPaths: GetStaticPaths = async ({}) => {
//   return {
//     paths: [],
//     fallback: true,
//   };
// };

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   let req = await fetch(`${process.env.NEXTAUTH_URL}/api/post/216`, {
//     method: "GET",
//   });
//   let {
//     data: {
//       postData: { isPrivate, title, createdAt },
//     },
//   } = await req.json();
//   return {
//     props: {
//       title: "123",
//       createdAt: "123123",
//     },
//   };
// };

export default Test;
