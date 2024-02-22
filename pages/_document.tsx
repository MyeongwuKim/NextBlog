import Loading from "@/components/loading";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/ico" href="/favicon.ico" />
      </Head>
      <body className="bg-white dark:bg-zinc-900 text-zinc-600 dark:text-gray-200">
        <div id="modal" className="fixed z-[99]"></div>
        <div id="toast" className="fixed z-[98]"></div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
