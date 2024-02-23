import Loading from "@/components/loading";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon--60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="36x36"
          href="/android-icon-36x36.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/android-icon-48x48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="72x72"
          href="/android-icon-72x72.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/android-icon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="144x144"
          href="/android-icon-144x144.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="msapplication-square70x70logo"
          content="/ms-icon-70x70.png"
        />
        <meta
          name="msapplication-square150x150logo"
          content="/ms-icon-150x150.png"
        />
        <meta
          name="msapplication-square144x144logo"
          content="/ms-icon-144x144.png"
        />
        <meta
          name="msapplication-square310x310logo"
          content="/ms-icon-310x310.png"
        />
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
