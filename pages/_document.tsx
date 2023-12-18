import Loading from "@/components/loading";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-white text-zinc-600 dark:bg-zinc-900 dark:text-gray-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
